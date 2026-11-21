import { NextResponse } from "next/server";
import {
  saveBooking,
  getAllBookings,
  getTherapistById,
  getLeaveExceptions,
} from "@/lib/server/cms";
import { isMySQLConfigured } from "@/lib/server/mysql";
import * as db from "@/lib/server/mysql-db";
import { findOrCreateClientFromBooking } from "@/lib/server/crm";
import { getAllPatients, createPatient } from "@/lib/server/emr";
import { sendEmail, renderBookingConfirmationEmail } from "@/lib/server/email";
import { Booking } from "@/lib/types";

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

    // 6. Dispatch Booking Confirmation Email via Resend (non-blocking)
    if (saved.clientEmail) {
      const confirmationTpl = renderBookingConfirmationEmail({
        clientName: saved.clientName,
        bookingReference: saved.bookingReference,
        offeringTitle: saved.offeringTitle,
        therapistName: saved.therapistName,
        bookingDate: saved.date,
        timeSlot: saved.timeSlot,
        paymentMethod: saved.paymentMethod || "offline",
        paymentStatus: saved.paymentStatus || "pending",
        totalAmount: saved.totalAmount || 0,
        currency: saved.currency || "INR",
        invoiceUrl: saved.invoiceNumber
          ? `${process.env.NEXT_PUBLIC_APP_URL || "https://auroperfectvision.com"}/api/invoices/${saved.invoiceNumber}`
          : undefined,
      });

      sendEmail({
        to: saved.clientEmail,
        subject: `Appointment Confirmation [${saved.bookingReference}] — Auro Perfect Vision`,
        html: confirmationTpl.html,
        text: confirmationTpl.text,
        templateKey: "booking_confirmation",
        bookingId: saved.id,
      }).catch((emailErr) => console.warn("[Booking Confirmation Email Dispatch Notice]:", emailErr.message));
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
