import { NextResponse } from "next/server";
import { saveInquiry } from "@/lib/server/crm";
import {
  sendEmail,
  renderContactInquiryAdminEmail,
  renderContactAcknowledgmentClientEmail,
} from "@/lib/server/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, category, message } = body;

    // Server-side validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!subject || typeof subject !== "string" || subject.trim().length < 3) {
      return NextResponse.json({ error: "Please enter a message subject." }, { status: 400 });
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json(
        { error: "Please write a message with at least 10 characters." },
        { status: 400 }
      );
    }

    // Anti-spam honeypot check
    if (body.website_url_hp) {
      return NextResponse.json({ success: true, message: "Thank you for reaching out." });
    }

    const inquiry = saveInquiry({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      subject: subject.trim(),
      category: category || "General Inquiry",
      message: message.trim(),
      source: "contact_form",
    });

    // Dispatch transactional notifications via Resend (non-blocking)
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "connect@auroperfectvision.com";

    // 1. Alert to Admin
    const adminTemplate = renderContactInquiryAdminEmail({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      category: inquiry.category,
      subject: inquiry.subject,
      message: inquiry.message,
      reference: inquiry.reference,
    });
    sendEmail({
      to: adminEmail,
      subject: `New Inquiry [${inquiry.reference}]: ${inquiry.subject}`,
      html: adminTemplate.html,
      text: adminTemplate.text,
      templateKey: "contact_inquiry_admin",
    }).catch((err) => console.warn("[Contact Admin Email Dispatch Notice]:", err.message));

    // 2. Acknowledgment to Inquirer
    const clientTemplate = renderContactAcknowledgmentClientEmail({
      name: inquiry.name,
      reference: inquiry.reference,
      subject: inquiry.subject,
    });
    sendEmail({
      to: inquiry.email,
      subject: `Inquiry Received [${inquiry.reference}] — Auro Perfect Vision`,
      html: clientTemplate.html,
      text: clientTemplate.text,
      templateKey: "contact_acknowledgment_client",
    }).catch((err) => console.warn("[Contact Client Acknowledgment Dispatch Notice]:", err.message));

    return NextResponse.json({
      success: true,
      reference: inquiry.reference,
      message: "Thank you for contacting Auro Perfect Vision. Our educators will respond to your inquiry shortly.",
    });
  } catch (err: any) {
    console.error("Public contact submission error:", err);
    return NextResponse.json(
      { error: "We could not submit your message at this time. Please try again or call us directly." },
      { status: 500 }
    );
  }
}
