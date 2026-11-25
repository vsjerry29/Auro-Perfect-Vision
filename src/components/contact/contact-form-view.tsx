"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, RefreshCw, MessageSquare, Sparkles } from "lucide-react";

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

  const categories = [
    "General Inquiry",
    "Vision Therapy Consultation",
    "Residential Eye Camp",
    "Online Programme",
    "Visiting Pondicherry Centre",
  ];

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
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-brand-gray/80 shadow-lg space-y-6 animate-in fade-in duration-300 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 text-xs font-inter font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Inquiry Received
          </span>
          <h3 className="font-sora text-2xl font-bold text-brand-charcoal">
            Thank you for reaching out!
          </h3>
          <p className="font-inter text-sm text-brand-secondary max-w-md mx-auto leading-relaxed">
            {successInfo.message}
          </p>
        </div>

        <div className="bg-[#FAF9FC] p-4 rounded-2xl border border-brand-gray max-w-sm mx-auto space-y-1">
          <span className="text-[11px] uppercase font-inter font-bold tracking-wider text-brand-secondary block">
            Reference Identifier
          </span>
          <span className="font-mono text-base font-bold text-brand-purple">
            {successInfo.reference}
          </span>
          <p className="text-[11px] text-brand-secondary pt-1">
            Our team will reply to <span className="font-semibold text-brand-charcoal">{email}</span> within 24 business hours.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-purple hover:bg-brand-violet text-white text-xs font-sora font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Send Another Inquiry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 sm:p-10 rounded-3xl border border-brand-gray/80 shadow-lg space-y-6"
    >
      <div className="space-y-1 border-b border-brand-gray/80 pb-5">
        <h3 className="font-sora text-xl sm:text-2xl font-bold text-brand-charcoal flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-purple" />
          <span>Send Us an Inquiry</span>
        </h3>
        <p className="font-inter text-xs sm:text-sm text-brand-secondary">
          Our team answers questions about vision consultations, retreat eligibility, and personalized routines.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-inter flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Honeypot Spam Trap */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website_url_hp">Website URL (Leave blank)</label>
        <input
          id="website_url_hp"
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Category Pills */}
      <div>
        <label className="block text-xs font-inter font-bold uppercase tracking-wider text-brand-secondary mb-2">
          Topic / Area of Interest
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-inter transition-all ${
                category === cat
                  ? "bg-brand-purple text-white font-semibold shadow-sm"
                  : "bg-[#FAF9FC] text-brand-charcoal border border-brand-gray hover:border-brand-purple/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Two column inputs: Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-inter font-semibold text-brand-charcoal mb-1.5">
            Full Name <span className="text-brand-orange">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Sharma"
            className="w-full px-4 py-3 text-xs sm:text-sm font-inter rounded-2xl border border-brand-gray bg-[#FAF9FC] text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-inter font-semibold text-brand-charcoal mb-1.5">
            Email Address <span className="text-brand-orange">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="priya@example.com"
            className="w-full px-4 py-3 text-xs sm:text-sm font-inter rounded-2xl border border-brand-gray bg-[#FAF9FC] text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:bg-white"
          />
        </div>
      </div>

      {/* Two column inputs: Phone & Subject */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-inter font-semibold text-brand-charcoal mb-1.5">
            Phone / WhatsApp <span className="text-xs text-brand-secondary font-normal">(Optional)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full px-4 py-3 text-xs sm:text-sm font-inter rounded-2xl border border-brand-gray bg-[#FAF9FC] text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-inter font-semibold text-brand-charcoal mb-1.5">
            Subject <span className="text-brand-orange">*</span>
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Inquiry regarding 7-day retreat"
            className="w-full px-4 py-3 text-xs sm:text-sm font-inter rounded-2xl border border-brand-gray bg-[#FAF9FC] text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:bg-white"
          />
        </div>
      </div>

      {/* Message textarea */}
      <div>
        <label className="block text-xs font-inter font-semibold text-brand-charcoal mb-1.5">
          Your Message <span className="text-brand-orange">*</span>
        </label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Please share details about your eye condition, daily screen habits, or any questions about our methodology..."
          className="w-full px-4 py-3 text-xs sm:text-sm font-inter rounded-2xl border border-brand-gray bg-[#FAF9FC] text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:bg-white resize-y"
        />
      </div>

      {/* Consent checkbox */}
      <div className="flex items-start gap-3 pt-1">
        <input
          type="checkbox"
          id="consent"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-brand-gray text-brand-purple focus:ring-brand-purple cursor-pointer"
        />
        <label htmlFor="consent" className="text-xs font-inter text-brand-secondary leading-relaxed cursor-pointer">
          I consent to having Auro Perfect Vision securely store my inquiry details and contact me via email or phone regarding this request.
        </label>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-2xl bg-brand-orange hover:bg-brand-orangeHover text-white font-sora font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Sending Inquiry...</span>
            </>
          ) : (
            <>
              <span>Submit Message to Centre Desk</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
