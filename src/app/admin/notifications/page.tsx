"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Mail, Bell, ShieldAlert, CheckCircle2, Send, RefreshCw, AlertCircle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminNotificationsPage() {
  const [emailStatus, setEmailStatus] = useState<{
    configured: boolean;
    sender: string;
    replyTo?: string;
    contactEmail?: string;
    adminNotificationEmail?: string;
    hasApiKey: boolean;
    fromAddress: string | null;
    logs: any[];
  } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchEmailStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await fetch("/api/admin/email/status");
      if (res.ok) {
        const data = await res.json();
        setEmailStatus(data);
      }
    } catch (err) {
      console.error("Failed to load email status", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchEmailStatus();
  }, []);

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail || !testEmail.includes("@")) {
      setTestResult({ success: false, message: "Please enter a valid recipient email address." });
      return;
    }

    try {
      setIsSendingTest(true);
      setTestResult(null);
      const res = await fetch("/api/admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `Test email dispatched successfully! Resend Message ID: ${data.messageId}`,
        });
        await fetchEmailStatus();
      } else {
        setTestResult({
          success: false,
          message: data.error || "Failed to dispatch test email via Resend.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Network error while calling test email endpoint.",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const templates = [
    {
      id: "tmpl-em-invite",
      channel: "Email (Resend)",
      event: "Staff Member Invitation & Cryptographic Activation",
      target: "Invited Staff Email",
      body: "Subject: You have been invited to join Auro Perfect Vision\n\nDear {{name}},\n\nAn administrative account has been created for you. Click the secure activation link below to set your password and access the portal (valid for 48 hours):\n{{activation_link}}",
      status: "Active (Resend Integration)",
    },
    {
      id: "tmpl-em-book-confirm",
      channel: "Email (Resend)",
      event: "Appointment Confirmation (Client)",
      target: "Guest Email",
      body: "Subject: Appointment Confirmation [{{booking_ref}}] — Auro Perfect Vision\n\nDear {{client_name}},\n\nYour appointment for {{offering_title}} with {{therapist_name}} is confirmed for {{date}} at {{time_slot}}.\nLocation: Auro Perfect Vision Centre, Auroville.\nPreparation: Arrive 10 minutes early; no contact lenses during evaluation.",
      status: "Active (Resend Integration)",
    },
    {
      id: "tmpl-em-pay-confirm",
      channel: "Email (Resend)",
      event: "Payment Received & Official Tax Invoice",
      target: "Payer Email",
      body: "Subject: Payment Confirmation & Invoice [{{invoice_number}}] — Auro Perfect Vision\n\nDear {{client_name}},\n\nPayment received: {{currency}} {{amount}} via {{gateway}}.\nInvoice Number: {{invoice_number}}\nOfficial Auroville GSTIN & Registration details included.",
      status: "Active (Resend Integration)",
    },
    {
      id: "tmpl-em-contact-ack",
      channel: "Email (Resend)",
      event: "Contact Form Auto-Acknowledgment & Admin Alert",
      target: "Inquirer & Admin Inbox",
      body: "Subject: Inquiry Received [{{reference}}] — Auro Perfect Vision\n\nDear {{name}},\n\nThank you for reaching out. Our educators have received your question regarding {{subject}} and will respond within 24–48 hours.",
      status: "Active (Resend Integration)",
    },
    {
      id: "tmpl-wa-1",
      channel: "WhatsApp",
      event: "Booking Confirmed (Client)",
      target: "Guest Phone",
      body: "Hey {{client_name}}, your session for *{{offering_title}}* with *{{therapist_name}}* on {{date}} at {{time_slot}} is confirmed. Ref: {{booking_ref}}. Centre Address: Auroville, Tamil Nadu 605101.",
      status: "Configured (Awaiting Meta WABA Production Phone ID)",
    },
    {
      id: "tmpl-wa-2",
      channel: "WhatsApp",
      event: "New Session Notification (Therapist)",
      target: "Therapist Phone",
      body: "Hey {{therapist_name}}, new appointment booked: {{client_name}} has scheduled {{offering_title}} on {{date}} at {{time_slot}}. View intake notes in your Therapist Portal.",
      status: "Configured (Awaiting Meta WABA Production Phone ID)",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-gold-dark font-semibold">
            Automated Communications
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            Transactional Email & Messaging
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Resend transactional email engine, staff invitations, appointment reminders, invoices, and dispatch history.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchEmailStatus}
          disabled={loadingStatus}
          className="text-xs gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? "animate-spin" : ""}`} />
          <span>Refresh Service Status</span>
        </Button>
      </div>

      {/* Resend Service Status & Test Card */}
      <div className="bg-white p-6 rounded-2xl border border-ink-border shadow-subtle space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-plum/10 text-plum flex items-center justify-center font-serif text-lg font-bold">
              ✉
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-medium text-ink">
                  Resend Transactional Email Provider
                </h3>
                {emailStatus?.configured ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Operational (Configured)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                    Requires RESEND_API_KEY
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                Official email delivery pipeline powering booking confirmations, invoices, staff invitations, and contact inquiries.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-canvas-light rounded-xl border border-ink-border">
            <span className="text-ink-muted block text-[11px] mb-1">Verified Sender</span>
            <span className="font-mono font-medium text-ink break-all text-[11px]">
              {emailStatus?.sender || "notifications@auroperfectvision.com"}
            </span>
          </div>
          <div className="p-3 bg-canvas-light rounded-xl border border-ink-border">
            <span className="text-ink-muted block text-[11px] mb-1">Official Reply-To</span>
            <span className="font-mono font-medium text-ink break-all text-[11px]">
              {emailStatus?.replyTo || "auroperfectvision@gmail.com"}
            </span>
          </div>
          <div className="p-3 bg-canvas-light rounded-xl border border-ink-border">
            <span className="text-ink-muted block text-[11px] mb-1">Admin Alert Inbox</span>
            <span className="font-mono font-medium text-ink break-all text-[11px]">
              {emailStatus?.adminNotificationEmail || "auroperfectvision@gmail.com"}
            </span>
          </div>
          <div className="p-3 bg-canvas-light rounded-xl border border-ink-border">
            <span className="text-ink-muted block text-[11px] mb-1">MySQL Delivery Logging</span>
            <span className="font-medium text-emerald-800">
              ✓ Active (notification_jobs)
            </span>
          </div>
        </div>

        {/* Test Email Dispatch Form */}
        <div className="pt-2 border-t border-ink-border">
          <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">
            Send Live Integration Test Email
          </h4>
          <form onSubmit={handleSendTestEmail} className="flex flex-col sm:flex-row gap-2 max-w-xl">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter recipient email (e.g. your email)"
              className="flex-1 px-3 py-2 text-xs border border-ink-border rounded-xl bg-ivory/40 focus:outline-none focus:border-plum"
              required
            />
            <Button
              type="submit"
              disabled={isSendingTest}
              className="text-xs bg-plum hover:bg-plum-light text-white shrink-0 gap-1.5"
            >
              {isSendingTest ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{isSendingTest ? "Dispatching..." : "Send Test Email"}</span>
            </Button>
          </form>

          {testResult && (
            <div
              className={`mt-3 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testResult.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-red-50 border-red-200 text-red-900"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Email Delivery Logs Table */}
      <div className="bg-white rounded-2xl border border-ink-border shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-ink-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-sm font-medium text-ink">
              Recent Email Dispatches
            </h3>
            <p className="text-[11px] text-ink-muted">
              Live audit history logged in Hostinger MySQL notification_jobs table.
            </p>
          </div>
          <span className="text-[11px] font-mono text-ink-muted">
            {emailStatus?.logs?.length || 0} recent attempts
          </span>
        </div>

        {emailStatus?.logs && emailStatus.logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-canvas-light text-ink-muted font-medium border-b border-ink-border">
                <tr>
                  <th className="py-2.5 px-4">Recipient</th>
                  <th className="py-2.5 px-4">Template Key</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Sent / Logged At</th>
                  <th className="py-2.5 px-4">Error / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-border">
                {emailStatus.logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-ivory/30">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-ink">
                      {log.recipient}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-plum">
                      {log.template_key}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                          log.status === "sent"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-ink-muted font-mono text-[11px]">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                    </td>
                    <td className="py-2.5 px-4 text-ink-muted text-[11px] max-w-xs truncate" title={log.error_message || ""}>
                      {log.error_message || "Delivered successfully"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-ink-muted">
            No email notification jobs recorded yet. Send a test email above to verify pipeline.
          </div>
        )}
      </div>

      {/* Automated Templates Catalog */}
      <div className="space-y-4">
        <h3 className="font-serif text-base font-medium text-ink">
          Configured Message Templates
        </h3>
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white p-5 rounded-2xl border border-ink-border shadow-subtle space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
              <div className="flex items-center gap-2">
                {tpl.channel.includes("Email") ? (
                  <Mail className="w-4 h-4 text-plum" />
                ) : (
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                )}
                <span className="font-serif text-sm font-medium text-ink">
                  {tpl.event}
                </span>
              </div>
              <Badge variant="faint" className="text-[10px]">
                {tpl.channel} • To {tpl.target}
              </Badge>
            </div>

            <div className="p-3.5 bg-canvas-light rounded-xl border border-ink-border text-xs font-mono text-ink whitespace-pre-line leading-relaxed">
              {tpl.body}
            </div>

            <div className="flex items-center justify-between text-[11px] text-ink-muted pt-1">
              <span>Status: <strong className="text-emerald-800">{tpl.status}</strong></span>
              <span className="text-gold-dark font-medium">Trigger: Automatic</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
