import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { getAllBookings } from "@/lib/server/cms";

export async function GET() {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "therapist" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allBookings = getAllBookings();

  // If role is therapist, strictly filter to their own assigned bookings!
  if (session.role === "therapist") {
    const therapistId = session.therapistId || "therapist-1";
    const myBookings = allBookings.filter((b) => b.therapistId === therapistId);
    return NextResponse.json({ bookings: myBookings });
  }

  return NextResponse.json({ bookings: allBookings });
}
