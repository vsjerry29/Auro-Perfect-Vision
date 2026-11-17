import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { getLeaveExceptions, addLeaveException, removeLeaveException } from "@/lib/server/cms";

export async function GET() {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "therapist" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leaves = getLeaveExceptions();
  return NextResponse.json({ leaves });
}

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "therapist" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { date, reason } = body;
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const therapistId = session.therapistId || "therapist-1";
    const leave = addLeaveException(date, reason, therapistId);
    return NextResponse.json({ success: true, leave });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error adding leave" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "therapist" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    removeLeaveException(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error removing leave" }, { status: 500 });
  }
}
