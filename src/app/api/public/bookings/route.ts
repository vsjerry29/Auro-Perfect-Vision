import { NextResponse } from "next/server";
import {
  saveBooking,
  getAllBookings,
  getEffectiveBookings,
  getEffectiveBookingByRef,
  getEffectiveOfferingById,
  getEffectiveOfferings,
  getEffectiveTherapistById,
  getIntakeTemplateForOffering,
  getWeeklySchedule,
  getLeaveExceptions,
} from "@/lib/server/cms";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { isMySQLConfigured } from "@/lib/server/mysql";
import * as db from "@/lib/server/mysql-db";
import { findOrCreateClientFromBooking } from "@/lib/server/crm";
import { getAllPatients, createPatient } from "@/lib/server/emr";
import {
  sendEmail,
  SendEmailResult,
  renderBookingConfirmationEmail,
  renderAdminNewBookingAlertEmail,
  getAdminNotificationEmail,
  getEmailReplyTo,
} from "@/lib/server/email";
import { generateBookingReference } from "@/lib/utils";
import { Booking } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference") || searchParams.get("ref");
    const id = searchParams.get("id");

    if (!reference && !id) {
      return NextResponse.json(
        { error: "Booking reference or ID is required" },
        { status: 400 }
      );
    }

    let booking: Booking | null | undefined = null;

    if (reference) {
      booking = await getEffectiveBookingByRef(reference);
    } else if (id) {
      const all = await getEffectiveBookings();
      booking = all.find((b) => b.id === id);
    }

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (err: any) {
    console.error("[Public Booking Query Error]:", err);
    return NextResponse.json(
      { error: "Failed to retrieve booking" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let rawBody: Record<string, any>;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON booking payload." }, { status: 400 });
    }

    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json({ error: "Invalid booking data." }, { status: 400 });
    }

    const staffSession = await getCurrentStaffSession().catch(() => null);
    const isStaffAdmin = Boolean(
      staffSession && (staffSession.role === "admin" || staffSession.role === "super_admin")
    );

    const offeringId = typeof rawBody.offeringId === "string" ? rawBody.offeringId.trim() : "";
    const therapistId = typeof rawBody.therapistId === "string" ? rawBody.therapistId.trim() : "";
    const date = typeof rawBody.date === "string" ? rawBody.date.trim() : "";
    const timeSlot = typeof rawBody.timeSlot === "string" ? rawBody.timeSlot.trim() : "";
    const clientName = typeof rawBody.clientName === "string" ? rawBody.clientName.trim() : "";
    const clientEmail = typeof rawBody.clientEmail === "string" ? rawBody.clientEmail.trim() : "";
    const clientPhone = typeof rawBody.clientPhone === "string" ? rawBody.clientPhone.trim() : "";
    const clientTimezone =
      typeof rawBody.clientTimezone === "string" && rawBody.clientTimezone.trim()
        ? rawBody.clientTimezone.trim()
        : "Asia/Kolkata";

    if (!offeringId) {
      return NextResponse.json({ error: "Please select a therapy before submitting." }, { status: 400 });
    }
    if (!therapistId || !date || !timeSlot) {
      return NextResponse.json(
        { error: "Practitioner, date, and appointment time slot are required." },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Please select a valid appointment date." }, { status: 400 });
    }
    const parsedDate = new Date(`${date}T12:00:00Z`);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid appointment calendar date." }, { status: 400 });
    }

    if (clientName.length < 2) {
      return NextResponse.json({ error: "Please enter the participant's full name." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (clientPhone.replace(/\D/g, "").length < 8) {
      return NextResponse.json({ error: "Please enter a valid contact phone number." }, { status: 400 });
    }

    // 1. Validate Published Therapy Offering
    let offering = await getEffectiveOfferingById(offeringId);
    if (!offering) {
      const allOfferings = await getEffectiveOfferings(true);
      offering = allOfferings.find((o) => o.slug === offeringId);
    }
    if (!offering || (!isStaffAdmin && !offering.isPublished)) {
      return NextResponse.json(
        { error: "The selected therapy is unavailable for booking." },
        { status: 400 }
      );
    }

    // 2. Validate Active Published Therapist & Therapy Assignment
    const therapist = await getEffectiveTherapistById(therapistId);
    if (!therapist || therapist.isArchived || (!isStaffAdmin && !therapist.isPublished)) {
      return NextResponse.json(
        { error: "Selected practitioner is currently unavailable for new appointments." },
        { status: 400 }
      );
    }

    if (
      Array.isArray(offering.assignedTherapistIds) &&
      offering.assignedTherapistIds.length > 0 &&
      !offering.assignedTherapistIds.includes(therapist.id)
    ) {
      return NextResponse.json(
        {
          error: `${therapist.displayName} is not assigned to ${offering.title}. Please choose an eligible practitioner.`,
        },
        { status: 400 }
      );
    }

    // 3. Weekly Clinic Operating Hours Check (public submissions)
    if (!isStaffAdmin) {
      const weekday = parsedDate.getUTCDay();
      const weeklySchedule = getWeeklySchedule();
      const daySchedule = weeklySchedule.find((d) => d.dayOfWeek === weekday);
      if (!daySchedule || !daySchedule.active || daySchedule.slots.length === 0) {
        return NextResponse.json(
          { error: "The centre is closed on the selected day. Please select Monday through Saturday." },
          { status: 400 }
        );
      }
    }

    // 4. Therapist Leave Exception Check
    const leaves = getLeaveExceptions();
    const isOnLeave = leaves.some(
      (l) => l.date === date && (l.therapistId === therapist.id || l.therapistId === "all")
    );
    if (isOnLeave) {
      return NextResponse.json(
        {
          error: `${therapist.displayName} is on scheduled leave on ${date}. Please select another date or practitioner.`,
        },
        { status: 409 }
      );
    }

    // 5. Dynamic Therapy-Specific Required Intake Validation (public submissions)
    const intakeAnswers =
      rawBody.intakeAnswers && typeof rawBody.intakeAnswers === "object" ? rawBody.intakeAnswers : {};
    if (!isStaffAdmin) {
      const template = getIntakeTemplateForOffering(offering.id);
      for (const field of template.fields) {
        if (!field.isRequired) continue;
        const val = intakeAnswers[field.fieldKey];
        const isMissing =
          val === undefined ||
          val === null ||
          (typeof val === "string" && val.trim().length === 0) ||
          (Array.isArray(val) && val.length === 0) ||
          (field.fieldType === "checkbox" && val !== true && val !== "Yes");

        if (isMissing) {
          return NextResponse.json(
            { error: `Please complete the required intake field: ${field.label}` },
            { status: 400 }
          );
        }
      }
    }

    // 6. Authoritative Pricing, Reference, and Decoupled Booking/Payment Status
    const maxSeats = Math.max(1, offering.maxCapacity || 20);
    const seatsBooked = Math.max(1, Math.min(maxSeats, Math.floor(Number(rawBody.seatsBooked) || 1)));
    const authoritativeAmount = offering.price.inr * seatsBooked;

    const cleanId =
      typeof rawBody.id === "string" && rawBody.id.trim().length >= 6 && rawBody.id.trim().length <= 64
        ? rawBody.id.trim()
        : `bk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const cleanRef =
      typeof rawBody.bookingReference === "string" && /^APV-[A-Z0-9-]+$/i.test(rawBody.bookingReference.trim())
        ? rawBody.bookingReference.trim().toUpperCase()
        : generateBookingReference();

    const booking: Booking = {
      id: cleanId,
      bookingReference: cleanRef,
      offeringId: offering.id,
      offeringTitle: offering.title,
      therapistId: therapist.id,
      therapistName: therapist.displayName,
      date,
      timeSlot,
      clientTimezone,
      clientName,
      clientEmail,
      clientPhone,
      seatsBooked,
      currency: "INR",
      totalAmount: authoritativeAmount,
      intakeAnswers,
      createdAt:
        typeof rawBody.createdAt === "string" && rawBody.createdAt ? rawBody.createdAt : new Date().toISOString(),
      // Public self-service bookings strictly enter pending_approval + unpaid/pending offline flow
      paymentMethod:
        isStaffAdmin && rawBody.paymentMethod
          ? rawBody.paymentMethod
          : rawBody.paymentMethod === "offline_bank_transfer"
          ? "offline_bank_transfer"
          : "offline_cash",
      status: isStaffAdmin && rawBody.status ? rawBody.status : "pending_approval",
      paymentStatus: isStaffAdmin && rawBody.paymentStatus ? rawBody.paymentStatus : "pending",
      invoiceIssued: isStaffAdmin ? Boolean(rawBody.invoiceIssued) : false,
      invoiceNumber: isStaffAdmin && rawBody.invoiceNumber ? String(rawBody.invoiceNumber) : undefined,
      offlineConfirmedByStaff:
        isStaffAdmin && rawBody.offlineConfirmedByStaff ? String(rawBody.offlineConfirmedByStaff) : undefined,
      offlineConfirmedAt:
        isStaffAdmin && rawBody.offlineConfirmedAt ? String(rawBody.offlineConfirmedAt) : undefined,
    };

    // 7. Retry Idempotency & Atomic Double-Booking Protection
    const existingList = isMySQLConfigured() ? await db.dbGetAllBookings() : getAllBookings();
    const existingMatch = existingList.find(
      (b) =>
        b.id === booking.id ||
        b.bookingReference.toLowerCase() === booking.bookingReference.toLowerCase()
    );

    if (existingMatch) {
      const sameRetrySubmission =
        existingMatch.id === booking.id &&
        existingMatch.offeringId === booking.offeringId &&
        existingMatch.therapistId === booking.therapistId &&
        existingMatch.date === booking.date &&
        existingMatch.timeSlot === booking.timeSlot &&
        existingMatch.clientEmail.toLowerCase() === booking.clientEmail.toLowerCase();

      if (sameRetrySubmission) {
        return NextResponse.json({
          success: true,
          booking: existingMatch,
          idempotentRetry: true,
        });
      }

      return NextResponse.json(
        {
          error:
            "This booking reference already belongs to an existing appointment. Please refresh and submit a new request.",
        },
        { status: 409 }
      );
    }

    let saved: Booking;
    if (isMySQLConfigured()) {
      try {
        saved = await db.dbSaveBooking(booking);
        saveBooking(saved);
      } catch (dbErr: any) {
        if (dbErr.message && dbErr.message.includes("DOUBLE_BOOKING_PREVENTED")) {
          return NextResponse.json(
            {
              error:
                "This appointment slot was just reserved by another client. Please select an adjacent time slot or an alternative practitioner.",
            },
            { status: 409 }
          );
        }
        throw dbErr;
      }
    } else {
      const conflict = existingList.find(
        (b) =>
          b.therapistId === booking.therapistId &&
          b.date === booking.date &&
          b.timeSlot === booking.timeSlot &&
          b.id !== booking.id &&
          b.status !== "cancelled" &&
          (b.status as string) !== "draft"
      );

      if (conflict) {
        return NextResponse.json(
          {
            error:
              "This appointment slot was just reserved by another client. Please select an adjacent time slot or an alternative practitioner.",
          },
          { status: 409 }
        );
      }
      saved = saveBooking(booking);
    }

    // 8. Automatically associate or create client profile in CRM
    let crmClient = null;
    try {
      crmClient = findOrCreateClientFromBooking(saved);
    } catch (crmErr) {
      console.warn("Could not sync booking to CRM:", crmErr);
    }

    // 9. Seamless EMR Continuity: Ensure patient record exists
    try {
      const allPatients = await getAllPatients();
      const existingPatient = allPatients.find(
        (p) =>
          p.phone === saved.clientPhone ||
          p.email.toLowerCase() === saved.clientEmail.toLowerCase()
      );

      if (!existingPatient) {
        await createPatient({
          crmContactId: crmClient?.id,
          fullName: saved.clientName,
          phone: saved.clientPhone,
          email: saved.clientEmail,
          primaryTherapistId: saved.therapistId,
          primaryTherapistName: saved.therapistName,
          clinicalAlerts: ["New Patient Intake Pending"],
        });
      }
    } catch (emrErr) {
      console.warn("Could not sync booking to EMR:", emrErr);
    }

    // 10. Transactional Email Notifications
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://auroperfectvision.com";
    const adminNotificationEmail = getAdminNotificationEmail();

    let customerEmailResult: SendEmailResult = {
      success: false,
      provider: "resend",
      status: "failed",
      error: "Skipped",
    };
    let adminEmailResult: SendEmailResult = {
      success: false,
      provider: "resend",
      status: "failed",
      error: "Skipped",
    };

    if (saved.clientEmail) {
      try {
        const confirmationTpl = renderBookingConfirmationEmail({
          clientName: saved.clientName,
          bookingReference: saved.bookingReference,
          offeringTitle: saved.offeringTitle,
          therapistName: saved.therapistName,
          bookingDate: saved.date,
          timeSlot: saved.timeSlot,
          paymentMethod: saved.paymentMethod || "offline_cash",
          paymentStatus: saved.paymentStatus || "pending",
          bookingStatus: saved.status,
          totalAmount: saved.totalAmount || 0,
          currency: saved.currency || "INR",
          invoiceUrl: saved.invoiceNumber
            ? `${appUrl}/api/invoices/${saved.invoiceNumber}`
            : undefined,
        });

        const isPaid =
          saved.paymentStatus === "captured" ||
          saved.paymentStatus === "offline_confirmed" ||
          saved.paymentStatus === "paid";

        const customerSubject = isPaid
          ? `Appointment Confirmation [${saved.bookingReference}] — Auro Perfect Vision`
          : `Booking Request Received [${saved.bookingReference}] — Auro Perfect Vision`;

        customerEmailResult = await sendEmail({
          to: saved.clientEmail,
          subject: customerSubject,
          html: confirmationTpl.html,
          text: confirmationTpl.text,
          replyTo: getEmailReplyTo(),
          templateKey: "booking_confirmation",
          bookingId: saved.id,
        });
      } catch (clientEmailErr: any) {
        customerEmailResult = {
          success: false,
          provider: "resend",
          status: "failed",
          error: clientEmailErr.message,
        };
        console.warn("[Booking Client Email Dispatch Notice]:", clientEmailErr.message);
      }
    }

    try {
      const adminAlertTpl = renderAdminNewBookingAlertEmail({
        bookingReference: saved.bookingReference,
        clientName: saved.clientName,
        clientEmail: saved.clientEmail || "Not provided",
        clientPhone: saved.clientPhone || "Not provided",
        offeringTitle: saved.offeringTitle,
        therapistName: saved.therapistName,
        bookingDate: saved.date,
        timeSlot: saved.timeSlot,
        participants: saved.seatsBooked || 1,
        totalAmount: saved.totalAmount || 0,
        currency: saved.currency || "INR",
        paymentMethod: saved.paymentMethod || "offline_cash",
        paymentStatus: saved.paymentStatus || "pending",
        bookingStatus: saved.status || "pending_approval",
        dashboardUrl: `${appUrl}/admin/bookings`,
      });

      adminEmailResult = await sendEmail({
        to: adminNotificationEmail,
        subject: `New Booking Received — ${saved.bookingReference} | Auro Perfect Vision`,
        html: adminAlertTpl.html,
        text: adminAlertTpl.text,
        replyTo: saved.clientEmail || getEmailReplyTo(),
        templateKey: "admin_new_booking_alert",
        bookingId: saved.id,
      });
    } catch (adminEmailErr: any) {
      adminEmailResult = {
        success: false,
        provider: "resend",
        status: "failed",
        error: adminEmailErr.message,
      };
      console.warn("[Booking Admin Alert Email Dispatch Notice]:", adminEmailErr.message);
    }

    return NextResponse.json({
      success: true,
      booking: saved,
      notifications: {
        customerEmail: customerEmailResult,
        adminEmail: adminEmailResult,
      },
    });
  } catch (err: any) {
    console.error("Error saving guest booking:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save booking" },
      { status: 500 }
    );
  }
}
