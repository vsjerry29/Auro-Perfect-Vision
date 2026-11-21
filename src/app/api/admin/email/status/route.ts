import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import {
  isEmailConfigured,
  getEmailSender,
  getEmailReplyTo,
  getAdminNotificationEmail,
  getContactEmail,
  getRecentEmailLogs,
} from "@/lib/server/email";

export async function GET() {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const configured = isEmailConfigured();
    const sender = getEmailSender();
    const replyTo = getEmailReplyTo();
    const adminNotificationEmail = getAdminNotificationEmail();
    const contactEmail = getContactEmail();
    const logs = await getRecentEmailLogs(20);

    return NextResponse.json({
      configured,
      sender,
      replyTo,
      contactEmail,
      provider: "resend",
      hasApiKey: Boolean(process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes("placeholder")),
      fromAddress: process.env.EMAIL_FROM || sender,
      adminNotificationEmail,
      logs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve email service status" },
      { status: 500 }
    );
  }
}
