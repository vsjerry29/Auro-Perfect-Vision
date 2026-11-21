if (typeof window !== "undefined") {
  throw new Error("This module cannot be imported from a Client Component module. It should only be used from the server.");
}
import { Resend } from "resend";
import { execute, query, isMySQLConfigured } from "./mysql";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  templateKey?: string;
  bookingId?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: "resend";
  status: "sent" | "failed" | "not_configured";
}

/**
 * Returns true if the Resend email provider has been configured.
 */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/**
 * Returns the effective sender address.
 */
export function getEmailSender(): string {
  return process.env.EMAIL_FROM || "Auro Perfect Vision <notifications@auroperfectvision.com>";
}

/**
 * Logs notification attempts and status to the MySQL notification_jobs table.
 */
async function logNotificationJob(params: {
  bookingId?: string;
  recipient: string;
  templateKey: string;
  status: "queued" | "sent" | "failed";
  errorMessage?: string;
}): Promise<void> {
  if (!isMySQLConfigured()) return;

  try {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await execute(
      `INSERT INTO notification_jobs (
        id, booking_id, channel, recipient, template_key, status, attempts, error_message, scheduled_at, sent_at, created_at
      ) VALUES (?, ?, 'email', ?, ?, ?, 1, ?, NOW(), ?, NOW())`,
      [
        id,
        params.bookingId || null,
        params.recipient,
        params.templateKey,
        params.status,
        params.errorMessage || null,
        params.status === "sent" ? new Date() : null,
      ]
    );
  } catch (err: any) {
    console.warn("[Notification Job Log Error]:", err.message);
  }
}

/**
 * Sends a transactional email via Resend.
 * Validates configuration, escapes dynamic content, and records dispatch history.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { to, subject, html, text, templateKey = "custom_email", bookingId } = options;

  if (!to || !to.includes("@")) {
    const err = "Invalid recipient email address";
    await logNotificationJob({ bookingId, recipient: to || "unknown", templateKey, status: "failed", errorMessage: err });
    return { success: false, error: err, provider: "resend", status: "failed" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = getEmailSender();

  if (!apiKey || apiKey.includes("placeholder") || !process.env.EMAIL_FROM) {
    const errorMsg = "Email provider is not configured (RESEND_API_KEY and EMAIL_FROM required)";
    await logNotificationJob({ bookingId, recipient: to, templateKey, status: "failed", errorMessage: errorMsg });
    return {
      success: false,
      error: errorMsg,
      provider: "resend",
      status: "not_configured",
    };
  }

  try {
    const resend = new Resend(apiKey);
    const plainTextFallback = text || (html ? html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "");

    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html: html || undefined,
      text: plainTextFallback,
    });

    if (error || !data?.id) {
      const errMsg = `Resend API rejected delivery: ${error?.message || "Unknown error"}`;
      await logNotificationJob({ bookingId, recipient: to, templateKey, status: "failed", errorMessage: errMsg });
      return { success: false, error: errMsg, provider: "resend", status: "failed" };
    }

    await logNotificationJob({ bookingId, recipient: to, templateKey, status: "sent" });

    return {
      success: true,
      messageId: data.id,
      provider: "resend",
      status: "sent",
    };
  } catch (err: any) {
    const errorMsg = err.message || "Failed to dispatch email via Resend";
    await logNotificationJob({ bookingId, recipient: to, templateKey, status: "failed", errorMessage: errorMsg });
    return { success: false, error: errorMsg, provider: "resend", status: "failed" };
  }
}

/**
 * Helper to fetch recent email dispatch attempts from MySQL notification_jobs table.
 */
export async function getRecentEmailLogs(limit = 20): Promise<any[]> {
  if (!isMySQLConfigured()) return [];
  try {
    const rows = await query<any[]>(
      `SELECT id, booking_id, channel, recipient, template_key, status, attempts, error_message, sent_at, created_at
       FROM notification_jobs
       WHERE channel = 'email'
       ORDER BY created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BRANDED HTML EMAIL TEMPLATE GENERATORS
// ─────────────────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function baseEmailWrapper(title: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2C2621; }
    .container { max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #EBE5DC; box-shadow: 0 4px 16px rgba(44, 38, 33, 0.04); }
    .header { background: #3B1E4A; padding: 36px 30px; text-align: center; }
    .header h1 { color: #FAF8F5; font-family: Georgia, serif; font-size: 24px; font-weight: normal; margin: 0; letter-spacing: -0.5px; }
    .header p { color: #D4AF37; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 8px 0 0; font-weight: 600; }
    .body { padding: 40px 32px; font-size: 14px; line-height: 1.65; color: #2C2621; }
    .cta-button { display: inline-block; background-color: #3B1E4A; color: #FAF8F5 !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 13px; letter-spacing: 0.5px; margin: 24px 0; text-align: center; }
    .meta-card { background-color: #FAF8F5; border-radius: 14px; padding: 20px; margin: 20px 0; border: 1px solid #EBE5DC; }
    .meta-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #EBE5DC; font-size: 13px; }
    .meta-row:last-child { border-bottom: none; }
    .meta-label { color: #7B7268; font-weight: 500; }
    .meta-value { color: #2C2621; font-weight: 600; }
    .footer { background-color: #FAF8F5; padding: 24px 30px; text-align: center; font-size: 11px; color: #7B7268; border-top: 1px solid #EBE5DC; }
    .footer p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Auro Perfect Vision</h1>
      <p>Auroville • Holistic Ocular Restoration</p>
    </div>
    <div class="body">
      ${contentHtml}
    </div>
    <div class="footer">
      <p><strong>Auro Perfect Vision</strong></p>
      <p>Auroville International Township, Tamil Nadu 605101, India</p>
      <p>Direct Center Desk: +91 80123 05151 • connect@auroperfectvision.com</p>
      <p style="margin-top: 10px; font-size: 10px; color: #A0988E;">This is an automated communication from Auro Perfect Vision.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 1. STAFF INVITATION EMAIL
 */
export function renderStaffInvitationEmail(data: {
  fullName: string;
  role: string;
  inviteUrl: string;
  expiresInHours?: number;
}): { html: string; text: string } {
  const roleName = data.role === "super_admin" ? "Super Administrator" : data.role === "admin" ? "Administrator" : "Vision Wellness Therapist";
  const hours = data.expiresInHours || 48;

  const htmlContent = `
    <h2 style="font-family: Georgia, serif; font-size: 20px; color: #2C2621; margin-top: 0;">Welcome to Auro Perfect Vision, ${escapeHtml(data.fullName)}</h2>
    <p>You have been invited by your system administrator to join the Auro Perfect Vision clinical portal as a <strong>${escapeHtml(roleName)}</strong>.</p>
    <p>To complete your registration, please activate your account and establish a secure password using the link below:</p>
    
    <div style="text-align: center;">
      <a href="${escapeHtml(data.inviteUrl)}" class="cta-button">Accept Invitation &amp; Set Password</a>
    </div>

    <div class="meta-card">
      <div class="meta-row">
        <span class="meta-label">Invited Role</span>
        <span class="meta-value">${escapeHtml(roleName)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Link Validity</span>
        <span class="meta-value">${hours} Hours (Single-use token)</span>
      </div>
    </div>

    <p style="font-size: 12px; color: #7B7268;">
      If the button above does not work, copy and paste this secure URL directly into your browser:<br>
      <a href="${escapeHtml(data.inviteUrl)}" style="color: #3B1E4A; word-break: break-all;">${escapeHtml(data.inviteUrl)}</a>
    </p>
    <p style="font-size: 12px; color: #7B7268;">
      For security, this invitation token will expire after ${hours} hours. If you did not expect this invitation, you can safely disregard this email.
    </p>
  `;

  const textContent = `Welcome to Auro Perfect Vision, ${data.fullName}

You have been invited to join the Auro Perfect Vision clinical portal as a ${roleName}.

To activate your account and set your password, visit the following link within ${hours} hours:
${data.inviteUrl}

This link is single-use and will expire in ${hours} hours.

Auro Perfect Vision
Auroville International Township, Tamil Nadu 605101, India`;

  return {
    html: baseEmailWrapper("Staff Portal Invitation — Auro Perfect Vision", htmlContent),
    text: textContent,
  };
}

/**
 * 2. BOOKING CONFIRMATION EMAIL
 */
export function renderBookingConfirmationEmail(data: {
  clientName: string;
  bookingReference: string;
  offeringTitle: string;
  therapistName: string;
  bookingDate: string;
  timeSlot: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  invoiceUrl?: string;
}): { html: string; text: string } {
  const isPaid = data.paymentStatus === "captured";
  const formattedFee =
    data.currency === "INR" || !data.currency
      ? `₹${Math.round(data.totalAmount).toLocaleString("en-IN")}`
      : `${escapeHtml(data.currency)} ${data.totalAmount.toFixed(2)}`;
  const textFee =
    data.currency === "INR" || !data.currency
      ? `₹${Math.round(data.totalAmount).toLocaleString("en-IN")}`
      : `${data.currency} ${data.totalAmount.toFixed(2)}`;

  const htmlContent = `
    <h2 style="font-family: Georgia, serif; font-size: 20px; color: #2C2621; margin-top: 0;">Namaste, ${escapeHtml(data.clientName)}</h2>
    <p>Your appointment reservation at <strong>Auro Perfect Vision</strong> has been registered successfully.</p>
    
    <div class="meta-card">
      <div class="meta-row">
        <span class="meta-label">Booking Reference</span>
        <span class="meta-value" style="color: #3B1E4A;">${escapeHtml(data.bookingReference)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Therapy / Programme</span>
        <span class="meta-value">${escapeHtml(data.offeringTitle)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Practitioner</span>
        <span class="meta-value">${escapeHtml(data.therapistName)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Date</span>
        <span class="meta-value">${escapeHtml(data.bookingDate)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Time Slot</span>
        <span class="meta-value">${escapeHtml(data.timeSlot)} IST</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Total Fee</span>
        <span class="meta-value">${formattedFee}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Payment Status</span>
        <span class="meta-value" style="color: ${isPaid ? '#047857' : '#B45309'}; font-weight: bold;">
          ${isPaid ? 'Paid & Verified' : 'Pending Offline / Counter Payment'}
        </span>
      </div>
    </div>

    ${
      !isPaid
        ? `<p style="font-size: 13px; color: #B45309; background: #FEF3C7; padding: 12px; border-radius: 8px;">
            <strong>Offline Payment Notice:</strong> Your slot is reserved. Please settle your fee at our Auroville centre reception desk upon arrival or via UPI/bank transfer prior to your session.
           </p>`
        : ""
    }

    ${
      data.invoiceUrl
        ? `<div style="text-align: center;">
            <a href="${escapeHtml(data.invoiceUrl)}" class="cta-button">Download Receipt / Invoice</a>
           </div>`
        : ""
    }

    <p style="font-size: 13px;">
      <strong>Centre Location:</strong> Auro Perfect Vision Clinic, Crown Road, Auroville, Tamil Nadu 605101.<br>
      Please arrive 10 minutes before your scheduled start time. Wear comfortable clothing suitable for relaxation and eye-gymnastics.
    </p>
  `;

  const textContent = `Namaste, ${data.clientName}

Your appointment reservation at Auro Perfect Vision is confirmed.

Booking Reference: ${data.bookingReference}
Therapy: ${data.offeringTitle}
Practitioner: ${data.therapistName}
Date: ${data.bookingDate}
Time: ${data.timeSlot} IST
Fee: ${textFee}
Payment Status: ${isPaid ? "Paid & Verified" : "Pending Offline Payment"}

Centre Location: Auro Perfect Vision Clinic, Crown Road, Auroville, Tamil Nadu 605101.
Contact: +91 80123 05151 • connect@auroperfectvision.com`;

  return {
    html: baseEmailWrapper(`Appointment Confirmation: ${data.bookingReference}`, htmlContent),
    text: textContent,
  };
}

/**
 * 3. BOOKING CANCELLATION EMAIL
 */
export function renderBookingCancelledEmail(data: {
  clientName: string;
  bookingReference: string;
  offeringTitle: string;
  bookingDate: string;
  reason?: string;
}): { html: string; text: string } {
  const htmlContent = `
    <h2 style="font-family: Georgia, serif; font-size: 20px; color: #2C2621; margin-top: 0;">Appointment Cancellation Notice</h2>
    <p>Dear ${escapeHtml(data.clientName)},</p>
    <p>Your session for <strong>${escapeHtml(data.offeringTitle)}</strong> scheduled on <strong>${escapeHtml(data.bookingDate)}</strong> (Ref: <code>${escapeHtml(data.bookingReference)}</code>) has been cancelled.</p>
    
    ${
      data.reason
        ? `<div class="meta-card">
            <span class="meta-label">Cancellation Reason:</span>
            <p style="margin: 6px 0 0; color: #2C2621;">${escapeHtml(data.reason)}</p>
           </div>`
        : ""
    }

    <p>If you would like to reschedule or explore other therapy dates, please visit our website or contact our centre directly.</p>
  `;

  const textContent = `Dear ${data.clientName},

Your session for ${data.offeringTitle} on ${data.bookingDate} (Ref: ${data.bookingReference}) has been cancelled.
${data.reason ? `Reason: ${data.reason}\n` : ""}
If you wish to reschedule, please contact us at connect@auroperfectvision.com or +91 80123 05151.`;

  return {
    html: baseEmailWrapper(`Appointment Cancelled: ${data.bookingReference}`, htmlContent),
    text: textContent,
  };
}

/**
 * 4. BOOKING REMINDER EMAIL
 */
export function renderBookingReminderEmail(data: {
  clientName: string;
  bookingReference: string;
  offeringTitle: string;
  therapistName: string;
  bookingDate: string;
  timeSlot: string;
}): { html: string; text: string } {
  const htmlContent = `
    <h2 style="font-family: Georgia, serif; font-size: 20px; color: #2C2621; margin-top: 0;">Upcoming Session Reminder</h2>
    <p>Namaste ${escapeHtml(data.clientName)},</p>
    <p>This is a gentle reminder of your upcoming vision wellness appointment tomorrow at <strong>Auro Perfect Vision</strong>.</p>

    <div class="meta-card">
      <div class="meta-row">
        <span class="meta-label">Booking Reference</span>
        <span class="meta-value">${escapeHtml(data.bookingReference)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Therapy</span>
        <span class="meta-value">${escapeHtml(data.offeringTitle)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Practitioner</span>
        <span class="meta-value">${escapeHtml(data.therapistName)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Date &amp; Time</span>
        <span class="meta-value">${escapeHtml(data.bookingDate)} at ${escapeHtml(data.timeSlot)} IST</span>
      </div>
    </div>

    <p style="font-size: 13px; color: #7B7268;">
      Please remove contact lenses prior to the session if practical. We look forward to welcoming you to our tranquil sanctuary in Auroville.
    </p>
  `;

  const textContent = `Namaste ${data.clientName},

Reminder: Your session for ${data.offeringTitle} with ${data.therapistName} is scheduled on ${data.bookingDate} at ${data.timeSlot} IST.
Booking Ref: ${data.bookingReference}

Location: Auro Perfect Vision Clinic, Crown Road, Auroville.
Phone: +91 80123 05151`;

  return {
    html: baseEmailWrapper(`Upcoming Session Reminder: ${data.bookingReference}`, htmlContent),
    text: textContent,
  };
}

/**
 * 5. PAYMENT CONFIRMATION & INVOICE EMAIL
 */
export function renderPaymentConfirmedEmail(data: {
  clientName: string;
  bookingReference: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  paymentGateway: string;
  invoiceUrl?: string;
}): { html: string; text: string } {
  const formattedAmount =
    data.currency === "INR" || !data.currency
      ? `₹${Math.round(data.amount).toLocaleString("en-IN")}`
      : `${escapeHtml(data.currency)} ${data.amount.toFixed(2)}`;
  const textAmount =
    data.currency === "INR" || !data.currency
      ? `₹${Math.round(data.amount).toLocaleString("en-IN")}`
      : `${data.currency} ${data.amount.toFixed(2)}`;

  const htmlContent = `
    <h2 style="font-family: Georgia, serif; font-size: 20px; color: #2C2621; margin-top: 0;">Payment Confirmation &amp; Official Receipt</h2>
    <p>Dear ${escapeHtml(data.clientName)},</p>
    <p>We have successfully verified and captured your payment for booking reference <strong>${escapeHtml(data.bookingReference)}</strong>.</p>

    <div class="meta-card">
      <div class="meta-row">
        <span class="meta-label">Invoice Number</span>
        <span class="meta-value">${escapeHtml(data.invoiceNumber)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Amount Received</span>
        <span class="meta-value">${formattedAmount}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Payment Gateway</span>
        <span class="meta-value">${escapeHtml(data.paymentGateway)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Status</span>
        <span class="meta-value" style="color: #047857; font-weight: bold;">Verified &amp; Paid</span>
      </div>
    </div>

    ${
      data.invoiceUrl
        ? `<div style="text-align: center;">
            <a href="${escapeHtml(data.invoiceUrl)}" class="cta-button">Download Printable Receipt (PDF)</a>
           </div>`
        : ""
    }
  `;

  const textContent = `Dear ${data.clientName},

Your payment of ${textAmount} for booking ${data.bookingReference} has been verified.
Invoice Number: ${data.invoiceNumber}
Payment Gateway: ${data.paymentGateway}

Thank you for choosing Auro Perfect Vision.`;

  return {
    html: baseEmailWrapper(`Payment Receipt: ${data.invoiceNumber}`, htmlContent),
    text: textContent,
  };
}

/**
 * 6. CONTACT FORM NOTIFICATION (TO ADMIN) & ACKNOWLEDGMENT (TO CLIENT)
 */
export function renderContactInquiryAdminEmail(data: {
  reference: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  subject: string;
  message: string;
}): { html: string; text: string } {
  const htmlContent = `
    <h2 style="font-family: Georgia, serif; font-size: 20px; color: #2C2621; margin-top: 0;">New Website Contact Inquiry</h2>
    <div class="meta-card">
      <div class="meta-row">
        <span class="meta-label">Inquiry Reference</span>
        <span class="meta-value">${escapeHtml(data.reference)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Name</span>
        <span class="meta-value">${escapeHtml(data.name)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Email</span>
        <span class="meta-value"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Phone</span>
        <span class="meta-value">${escapeHtml(data.phone || "Not provided")}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Category</span>
        <span class="meta-value">${escapeHtml(data.category)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Subject</span>
        <span class="meta-value">${escapeHtml(data.subject)}</span>
      </div>
    </div>
    <div style="background: #FAF8F5; padding: 16px; border-radius: 12px; border: 1px solid #EBE5DC;">
      <strong>Message:</strong><br>
      <p style="white-space: pre-wrap; margin-top: 8px;">${escapeHtml(data.message)}</p>
    </div>
  `;

  const textContent = `New Contact Inquiry: ${data.reference}
From: ${data.name} (${data.email})
Phone: ${data.phone || "N/A"}
Category: ${data.category}
Subject: ${data.subject}

Message:
${data.message}`;

  return {
    html: baseEmailWrapper(`New Inquiry [${data.reference}]: ${data.subject}`, htmlContent),
    text: textContent,
  };
}

export function renderContactAcknowledgmentClientEmail(data: {
  name: string;
  reference: string;
  subject: string;
}): { html: string; text: string } {
  const htmlContent = `
    <h2 style="font-family: Georgia, serif; font-size: 20px; color: #2C2621; margin-top: 0;">Thank You for Reaching Out</h2>
    <p>Dear ${escapeHtml(data.name)},</p>
    <p>Thank you for contacting <strong>Auro Perfect Vision</strong>. We have received your inquiry regarding <em>"${escapeHtml(data.subject)}"</em> (Reference: <code>${escapeHtml(data.reference)}</code>).</p>
    <p>Our educators will review your request and get back to you shortly within 24–48 hours.</p>
    <p style="font-size: 13px; color: #7B7268;">For urgent appointments or directions in Auroville, please call our reception at +91 80123 05151.</p>
  `;

  const textContent = `Dear ${data.name},

Thank you for contacting Auro Perfect Vision. We have received your message regarding "${data.subject}" (Reference: ${data.reference}).

Our team will respond within 24-48 business hours.

Auro Perfect Vision
Auroville, Tamil Nadu 605101`;

  return {
    html: baseEmailWrapper(`Inquiry Received [${data.reference}] — Auro Perfect Vision`, htmlContent),
    text: textContent,
  };
}

/**
 * 7. TEST EMAIL
 */
export function renderTestEmail(recipient: string): { html: string; text: string } {
  const now = new Date().toISOString();
  const htmlContent = `
    <h2 style="font-family: Georgia, serif; font-size: 20px; color: #2C2621; margin-top: 0;">Resend Integration Test Passed</h2>
    <p>This is a test notification confirming that the <strong>Resend</strong> transactional email provider is properly configured for <strong>Auro Perfect Vision</strong>.</p>
    <div class="meta-card">
      <div class="meta-row">
        <span class="meta-label">Test Recipient</span>
        <span class="meta-value">${escapeHtml(recipient)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Timestamp</span>
        <span class="meta-value">${now}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Sender</span>
        <span class="meta-value">${escapeHtml(getEmailSender())}</span>
      </div>
    </div>
    <p style="color: #047857; font-weight: 600;">✓ Production transactional email pipeline operational.</p>
  `;

  return {
    html: baseEmailWrapper("Resend Integration Test — Auro Perfect Vision", htmlContent),
    text: `Resend Integration Test Passed\nRecipient: ${recipient}\nTimestamp: ${now}\nSender: ${getEmailSender()}`,
  };
}
