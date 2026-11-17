"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, RefreshCw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ContactFormView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("General Inquiry");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState(""); // hidden spam trap

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState<{ reference: string; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!subject.trim()) {
      setErrorMessage("Please enter an inquiry subject.");
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setErrorMessage("Please write a message with at least 10 characters.");
      return;
    }
    if (!consent) {
      setErrorMessage("Please agree to let our team contact you regarding this inquiry.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          category,
          subject,
          message,
          website_url_hp: honeypot, // honeypot
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to submit inquiry. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setSuccessInfo({
        reference: data.reference,
        message: data.message,
      });
      setIsSubmitting(false);
    } catch (err: any) {
      setErrorMessage("Network error connecting to the centre desk. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCategory("General Inquiry");
    setSubject("");
    setMessage("");
    setConsent(false);
    setSuccessInfo(null);
    setErrorMessage("");
  };

  if (successInfo) {
    return (
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-ink-border shadow-card space-y-6 animate-in fade-in duration-300 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-200">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <Badge variant="success" className="text-xs">
            Inquiry Submitted Successfully
          </Badge>
          <h3 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            We Have Received Your Message
          </h3>
          <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto leading-relaxed">
            {successInfo.message}
          </p>
        </div>

        <div className="p-4 bg-canvas-light rounded-xl border border-ink-border max-w-sm mx-auto">
          <span className="text-[10px] text-ink-muted uppercase tracking-wider block">
            Tracking Reference
          </span>
          <span className="font-mono text-base font-bold text-plum block mt-0.5">
            {successInfo.reference}
          </span>
        </div>

        <div className="pt-2">
          <Button variant="outline" size="md" onClick={handleReset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>Submit Another Message</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-10 rounded-3xl border border-ink-border shadow-card space-y-6">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs text-gold-dark font-semibold uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Send an Online Message</span>
        </div>
        <h3 className="font-serif text-2xl text-ink font-normal">
          Inquire Directly with Our Centre
        </h3>
        <p className="text-xs text-ink-muted leading-relaxed">
          Fill in your details below and our team will get back to you with guidance and slot recommendations.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Anti-spam trap: hidden from real visitors */}
        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            tabIndex={-1}
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Your Full Name <span className="text-plum">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Raman"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Email Address <span className="text-plum">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Phone / WhatsApp Number <span className="text-ink-muted">(Optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Inquiry Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
            >
              <option value="General Inquiry">General Center Inquiry</option>
              <option value="Natural Vision Therapy">Natural Vision Therapy (1:1)</option>
              <option value="Digital Eye Strain">Digital Screen Fatigue Relief</option>
              <option value="7-Day Residential Retreat">7-Day Residential Retreat in Auroville</option>
              <option value="Booking Assistance">Booking & Rescheduling Help</option>
              <option value="Other">Other Question</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink mb-1.5">
            Subject <span className="text-plum">*</span>
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Inquiring about November retreat schedule or children sessions"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink mb-1.5">
            Your Message <span className="text-plum">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Please write your questions or context here. (Note: For confidential medical history, our session-specific intake form is filled after selecting a booking date)."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum resize-none leading-relaxed"
          />
        </div>

        {/* Consent Checkbox */}
        <div className="pt-2 flex items-start gap-3">
          <input
            type="checkbox"
            id="contact-consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="w-4 h-4 rounded text-plum focus:ring-plum mt-0.5 cursor-pointer"
          />
          <label htmlFor="contact-consent" className="text-xs text-ink-muted leading-relaxed cursor-pointer select-none">
            I agree to let Auro Perfect Vision contact me via email or phone/WhatsApp in response to this message.
          </label>
        </div>

        <div className="pt-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="w-full gap-2 shadow-md"
          >
            {isSubmitting ? (
              <span>Submitting Message...</span>
            ) : (
              <>
                <span>Send Inquiry to Centre Desk</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
