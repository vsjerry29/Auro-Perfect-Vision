import { NextResponse } from "next/server";
import { verifyStaffInvitationToken } from "@/lib/server/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { valid: false, error: "Invitation token parameter is missing." },
      { status: 400 }
    );
  }

  const result = await verifyStaffInvitationToken(token);
  if (!result.valid) {
    return NextResponse.json(
      { valid: false, error: result.error || "Invalid or expired invitation token." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    valid: true,
    user: result.user,
  });
}
