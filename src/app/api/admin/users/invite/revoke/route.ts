import { NextResponse } from "next/server";
import { getCurrentStaffSession, revokeStaffInvitation } from "@/lib/server/auth";
import { logAuditEvent } from "@/lib/server/cms";

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Staff User ID is required" }, { status: 400 });
    }

    await revokeStaffInvitation(userId, session);

    await logAuditEvent({
      staffId: session.userId,
      staffEmail: session.email,
      staffName: session.fullName,
      action: "STAFF_INVITATION_REVOKED",
      entityType: "StaffUser",
      entityId: userId,
    });

    return NextResponse.json({ success: true, message: "Invitation revoked successfully." });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to revoke staff invitation" },
      { status: 400 }
    );
  }
}
