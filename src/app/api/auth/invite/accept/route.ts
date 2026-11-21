import { NextResponse } from "next/server";
import { acceptStaffInvitation } from "@/lib/server/auth";
import { logAuditEvent } from "@/lib/server/cms";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Invitation token and a new password are required." },
        { status: 400 }
      );
    }

    const result = await acceptStaffInvitation(token, password);
    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || "Failed to activate staff account." },
        { status: 400 }
      );
    }

    await logAuditEvent({
      staffId: result.user.id,
      staffEmail: result.user.email,
      staffName: result.user.fullName,
      action: "STAFF_ACCOUNT_ACTIVATED",
      entityType: "StaffUser",
      entityId: result.user.id,
      details: { role: result.user.role },
    });

    return NextResponse.json({
      success: true,
      message: "Your staff account has been activated successfully! You may now sign in.",
      user: result.user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process invitation acceptance." },
      { status: 500 }
    );
  }
}
