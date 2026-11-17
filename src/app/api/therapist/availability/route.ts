import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { getWeeklySchedule, saveWeeklySchedule } from "@/lib/server/cms";

export async function GET() {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "therapist" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schedule = getWeeklySchedule();
  return NextResponse.json({ schedule });
}

export async function PUT(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "therapist" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!Array.isArray(body.schedule)) {
      return NextResponse.json({ error: "Schedule array required" }, { status: 400 });
    }

    saveWeeklySchedule(body.schedule);
    return NextResponse.json({ success: true, schedule: body.schedule });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error saving schedule" }, { status: 500 });
  }
}
