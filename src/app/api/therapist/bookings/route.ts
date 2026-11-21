import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { getAllBookings } from "@/lib/server/cms";
import { isMySQLConfigured } from "@/lib/server/mysql";
import * as db from "@/lib/server/mysql-db";

export async function GET() {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "therapist" && session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allBookings = isMySQLConfigured()
    ? await db.dbGetAllBookings()
    : getAllBookings();

  // If role is therapist, strictly filter to their own assigned bookings
  if (session.role === "therapist") {
    if (!session.therapistId) {
      return NextResponse.json({ bookings: [] });
    }
    const myBookings = allBookings.filter((b) => b.therapistId === session.therapistId);
    return NextResponse.json({ bookings: myBookings });
  }

  return NextResponse.json({ bookings: allBookings });
}
