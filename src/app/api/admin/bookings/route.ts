import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { getAllBookings, markBookingPaid } from "@/lib/server/cms";

export async function GET() {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = getAllBookings();
  return NextResponse.json({ bookings });
}

export async function PUT(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, bookingId } = body;

    if (action === "mark_paid" && bookingId) {
      const updated = markBookingPaid(bookingId, session.fullName || "Admin (Front Desk)");
      if (!updated) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, booking: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error processing booking" }, { status: 500 });
  }
}
