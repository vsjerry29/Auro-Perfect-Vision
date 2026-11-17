import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { getAllBookings, getAllTherapists } from "@/lib/server/cms";

export async function GET(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const therapistId = searchParams.get("therapistId") || undefined;
  const month = searchParams.get("month") || undefined; // e.g. "2026-11"

  let bookings = getAllBookings();

  // If role is therapist, restrict strictly to their own bookings
  if (session.role === "therapist") {
    const myTherapistId = session.therapistId || "therapist-1";
    bookings = bookings.filter((b) => b.therapistId === myTherapistId);
  } else if (therapistId && therapistId !== "all") {
    bookings = bookings.filter((b) => b.therapistId === therapistId);
  }

  if (month) {
    bookings = bookings.filter((b) => b.date.startsWith(month));
  }

  const therapists = getAllTherapists(true);

  return NextResponse.json({
    bookings,
    therapists,
  });
}
