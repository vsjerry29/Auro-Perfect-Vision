import { NextResponse } from "next/server";
import {
  saveBooking,
  getAllBookings,
  getTherapistById,
  getLeaveExceptions,
} from "@/lib/server/cms";
import { findOrCreateClientFromBooking } from "@/lib/server/crm";
import { getAllPatients, createPatient } from "@/lib/server/emr";
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

    // 4. Save Booking
    const saved = saveBooking(booking);

    // 5. Automatically associate or create client profile in CRM
    let crmClient = null;
    try {
      crmClient = findOrCreateClientFromBooking(saved);
    } catch (crmErr) {
      console.warn("Could not sync booking to CRM:", crmErr);
    }

    // 6. Seamless EMR Continuity: Ensure patient record exists
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

    return NextResponse.json({ success: true, booking: saved });
  } catch (err: any) {
    console.error("Error saving guest booking:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save booking" },
      { status: 500 }
    );
  }
}
