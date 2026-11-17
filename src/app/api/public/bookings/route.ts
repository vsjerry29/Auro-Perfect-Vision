import { NextResponse } from "next/server";
import { saveBooking } from "@/lib/server/cms";
import { findOrCreateClientFromBooking } from "@/lib/server/crm";
import { Booking } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const booking = (await request.json()) as Booking;
    if (!booking || !booking.bookingReference) {
      return NextResponse.json({ error: "Invalid booking data" }, { status: 400 });
    }
    const saved = saveBooking(booking);
    
    // Automatically associate or create client profile in CRM
    try {
      findOrCreateClientFromBooking(saved);
    } catch (crmErr) {
      console.warn("Could not sync booking to CRM:", crmErr);
    }

    return NextResponse.json({ success: true, booking: saved });
  } catch (err: any) {
    console.error("Error saving guest booking:", err);
    return NextResponse.json({ error: err.message || "Failed to save booking" }, { status: 500 });
  }
}
