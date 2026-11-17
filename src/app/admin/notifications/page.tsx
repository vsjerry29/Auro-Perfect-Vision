"use client";

import React from "react";
import { MessageSquare, Mail, Bell, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminNotificationsPage() {
  const templates = [
    {
      id: "tmpl-wa-1",
      channel: "WhatsApp",
      event: "Booking Confirmed (Client)",
      target: "Guest Phone",
      body: "Namaste {{client_name}}, your session for *{{offering_title}}* with *{{therapist_name}}* on {{date}} at {{time_slot}} is confirmed. Ref: {{booking_ref}}. Centre Address: Auroville, Tamil Nadu 605101. Download receipt: {{invoice_link}}.",
      status: "Demo Simulated (Official WABA Credentials Needed)",
    },
    {
      id: "tmpl-wa-2",
      channel: "WhatsApp",
      event: "New Session Notification (Therapist)",
      target: "Therapist Phone",
      body: "Namaste {{therapist_name}}, new appointment booked: {{client_name}} has scheduled {{offering_title}} on {{date}} at {{time_slot}}. View intake notes in your Therapist Portal: {{portal_link}}.",
      status: "Demo Simulated (Official WABA Credentials Needed)",
    },
    {
      id: "tmpl-wa-3",
      channel: "WhatsApp",
      event: "Offline Payment Pending (Client)",
      target: "Guest Phone",
      body: "Namaste {{client_name}}, your booking ref {{booking_ref}} is reserved pending offline payment confirmation. Please complete cash at centre or bank transfer within 24 hours.",
      status: "Demo Simulated (Official WABA Credentials Needed)",
    },
    {
      id: "tmpl-em-1",
      channel: "Email",
      event: "Booking Confirmation & PDF Invoice",
      target: "Guest Email",
      body: "Subject: Your Booking & Invoice Confirmation: {{booking_ref}} | Auro Perfect Vision\n\nDear {{client_name}},\n\nThank you for choosing Auro Perfect Vision. Your appointment details and official receipt PDF are attached to this message.",
      status: "Demo Simulated (Resend/Postmark API Key Needed)",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-gold-dark font-semibold">
            Automated Communications
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            WhatsApp & Email Templates
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Review event triggers and message copy dispatched upon booking creation, capture, and offline approvals.
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0" />
        <div>
          <span className="font-semibold block">Production Integration Notice</span>
          <span>
            Real SMS/WhatsApp dispatching requires verified Meta WhatsApp Business Account (WABA) credentials. In this frontend milestone, all messages are captured and previewed in simulated outbox logs.
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white p-5 rounded-xl border border-ink-border shadow-subtle space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
              <div className="flex items-center gap-2">
                {tpl.channel === "WhatsApp" ? (
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                ) : (
                  <Mail className="w-4 h-4 text-plum" />
                )}
                <span className="font-serif text-sm font-medium text-ink">
                  {tpl.event}
                </span>
              </div>
              <Badge variant="faint" className="text-[10px]">
                {tpl.channel} • To {tpl.target}
              </Badge>
            </div>

            <div className="p-3 bg-canvas-light rounded-lg border border-ink-border text-xs font-mono text-ink whitespace-pre-line leading-relaxed">
              {tpl.body}
            </div>

            <div className="flex items-center justify-between text-[11px] text-ink-muted pt-1">
              <span>Status: <strong className="text-amber-800">{tpl.status}</strong></span>
              <span className="text-gold-dark font-medium">Trigger: Automatic</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
