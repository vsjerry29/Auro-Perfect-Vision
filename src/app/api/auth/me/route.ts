import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";

export async function GET() {
  const session = await getCurrentStaffSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    user: {
      userId: session.userId,
      email: session.email,
      fullName: session.fullName,
      role: session.role,
      therapistId: session.therapistId,
    },
  });
}
