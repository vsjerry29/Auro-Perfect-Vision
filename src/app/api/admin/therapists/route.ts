import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { getAllTherapists, saveTherapist } from "@/lib/server/cms";

export async function GET() {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const therapists = getAllTherapists(true);
  return NextResponse.json({ therapists });
}

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.displayName) {
      return NextResponse.json({ error: "Display name is required" }, { status: 400 });
    }

    const saved = saveTherapist(body);
    return NextResponse.json({ success: true, therapist: saved });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error saving therapist" }, { status: 500 });
  }
}
