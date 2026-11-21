import { NextResponse } from "next/server";
import { getCurrentStaffSession } from "@/lib/server/auth";
import { sendEmail, renderTestEmail, isEmailConfigured } from "@/lib/server/email";

export async function POST(request: Request) {
  const session = await getCurrentStaffSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const recipient = body?.to?.trim();

    if (!recipient || !recipient.includes("@")) {
      return NextResponse.json(
        { error: "A valid recipient email address is required" },
        { status: 400 }
      );
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        {
          error:
            "Resend is not configured. Please set RESEND_API_KEY and EMAIL_FROM in your environment configuration.",
          configured: false,
        },
        { status: 400 }
      );
    }

    const { html, text } = renderTestEmail(recipient);
    const result = await sendEmail({
      to: recipient,
      subject: "Resend Integration Test — Auro Perfect Vision",
      html,
      text,
      templateKey: "resend_test",
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Email delivery rejected by Resend provider",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      recipient,
      sentAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to dispatch test email" },
      { status: 500 }
    );
  }
}
