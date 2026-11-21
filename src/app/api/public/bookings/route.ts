import { NextResponse } from "next/server";
import {
  saveBooking,
  getAllBookings,
  getBookingByRef,
  getTherapistById,
  getLeaveExceptions,
} from "@/lib/server/cms";
import { isMySQLConfigured } from "@/lib/server/mysql";
import * as db from "@/lib/server/mysql-db";
import { findOrCreateClientFromBooking } from "@/lib/server/crm";
import { getAllPatients, createPatient } from "@/lib/server/emr";
import {
  sendEmail,
  renderBookingConfirmationEmail,
  renderAdminNewBookingAlertEmail,
  getAdminNotificationEmail,
  getEmailReplyTo,
} from "@/lib/server/email";
import { calculateOfferingPrice } from "@/lib/server/payments";
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

    if (isMySQLConfigured()) {
      if (reference) {
        booking = await db.dbGetBookingByRef(reference);
      } else if (id) {
        const all = await db.dbGetAllBookings();
        booking = all.find((b) => b.id === id);
      }
    } else {
      if (reference) {
        booking = getBookingByRef(reference);
      } else if (id) {
        const all = getAllBookings();
        booking = all.find((b) => b.id === id);
      }
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
    const booking = (await request.json()) as Booking;
    if (!booking || !booking.bookingReference) {
      return NextResponse.json({ error: "Invalid booking data" }, { status: 400 });
    }

    if (!booking.date || !booking.timeSlot || !booking.therapistId) {
      return NextResponse.json(
        { error: "Date, time slot, and practitioner selection are required." },
        { status: 400 }
      );
    }

    // Explicitly separate booking status from payment status
    const isOffline =
      booking.paymentMethod === "offline_cash" ||
      booking.paymentMethod === "offline_bank_transfer" ||
      (booking.paymentMethod as string) === "offline" ||
      (booking.paymentMethod as string) === "counter";

    if (isOffline) {
      booking.status = "pending_approval";
      booking.paymentStatus = "pending";
      booking.invoiceIssued = false;
      booking.invoiceNumber = undefined;
    } else if (booking.paymentStatus === "captured") {
      booking.status = "confirmed";
      booking.invoiceIssued = true;
    }

    // Standardize to INR exclusively and authoritatively recalculate total amount
    booking.currency = "INR";
    if (booking.offeringId) {
      try {
        const pricing = calculateOfferingPrice(booking.offeringId, "INR", booking.seatsBooked || 1);
        booking.totalAmount = pricing.amount;
      } catch (priceErr) {
        console.warn("[Booking Pricing Calculation Notice]:", priceErr);
      }
    }

    // 1. Therapist Archival Check
    const therapist = getTherapistById(booking.therapistId);
    if (!therapist || therapist.isArchived) {
      return NextResponse.json(
        { error: "Selected practitioner is currently unavailable for new appointments." },
        { status: 400 }
      );
    }

    // 2. Therapist Leave Exception Check
    const leaves = getLeaveExceptions();
    const isOnLeave = leaves.some(
      (l) => l.therapistId === booking.therapistId && l.date === booking.date
    );
    if (isOnLeave) {
      return NextResponse.json(
        {
          error: `${therapist.displayName} is on scheduled leave on ${booking.date}. Please select another date or practitioner.`,
        },
        { status: 409 }
      );
    }

    // 3. Concurrency / Double-Booking Protection
    let saved: Booking;
    if (isMySQLConfigured()) {
      try {
        saved = await db.dbSaveBooking(booking);
        // Also update memory cache
        saveBooking(booking);
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
      const existingBookings = getAllBookings();
      const conflict = existingBookings.find(
        (b) =>
          b.therapistId === booking.therapistId &&
          b.date === booking.date &&
          b.timeSlot === booking.timeSlot &&
          b.id !== booking.id &&
          b.status !== "cancelled"
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

    // 4. Automatically associate or create client profile in CRM
    let crmClient = null;
    try {
      crmClient = findOrCreateClientFromBooking(saved);
    } catch (crmErr) {
      console.warn("Could not sync booking to CRM:", crmErr);
    }

    // 5. Seamless EMR Continuity: Ensure patient record exists
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

    // 6. Transactional Email Notifications
    // Both dispatches are awaited inside try/catch blocks so that notification delivery errors
    // do not impede successful booking persistence and client HTTP response.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://auroperfectvision.com";
    const adminNotificationEmail = getAdminNotificationEmail();

    // 6a. Dispatch Customer Confirmation Email (to Client)
    if (saved.clientEmail) {
      try {
        const confirmationTpl = renderBookingConfirmationEmail({
          clientName: saved.clientName,
          bookingReference: saved.bookingReference,
          offeringTitle: saved.offeringTitle,
          therapistName: saved.therapistName,
          bookingDate: saved.date,
          timeSlot: saved.timeSlot,
          paymentMethod: saved.paymentMethod || "offline",
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

        await sendEmail({
          to: saved.clientEmail,
          subject: customerSubject,
          html: confirmationTpl.html,
          text: confirmationTpl.text,
          replyTo: getEmailReplyTo(),
          templateKey: "booking_confirmation",
          bookingId: saved.id,
        });
      } catch (clientEmailErr: any) {
        console.warn("[Booking Client Email Dispatch Notice]:", clientEmailErr.message);
      }
    }

    // 6b. Dispatch Automatic Instant Admin Alert (to auroperfectvision@gmail.com)
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
        paymentMethod: saved.paymentMethod || "offline",
        paymentStatus: saved.paymentStatus || "pending",
        bookingStatus: saved.status || "confirmed",
        dashboardUrl: `${appUrl}/admin/bookings`,
      });

      await sendEmail({
        to: adminNotificationEmail,
        subject: `New Booking Received — ${saved.bookingReference} | Auro Perfect Vision`,
        html: adminAlertTpl.html,
        text: adminAlertTpl.text,
        replyTo: saved.clientEmail || getEmailReplyTo(),
        templateKey: "admin_new_booking_alert",
        bookingId: saved.id,
      });
    } catch (adminEmailErr: any) {
      console.warn("[Booking Admin Alert Email Dispatch Notice]:", adminEmailErr.message);
    }

    return NextResponse.json({ success: true, booking: saved });
  } catch (err: any) {
    console.error("Error saving guest booking:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save booking" },
      { status: 500 }
    );
  }
}
