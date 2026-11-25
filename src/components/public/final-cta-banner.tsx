"use client";

import React from "react";
import Link from "next/link";
import { Calendar, MessageSquare, Sparkles, ArrowRight, Phone } from "lucide-react";

export function FinalCtaBanner() {
  return (
    <section className="py-20 lg:py-24 bg-gradient-to-br from-brand-deep via-brand-purple to-brand-violet text-white relative overflow-hidden">
      {/* Background visual rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-white/5 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-orange text-xs font-sora font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Begin Your Clarity Journey</span>
        </div>

        <h2 className="font-sora text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Ready to Experience Comprehensive Vision Care?
        </h2>

        <p className="font-inter text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
          Book your consultation at Auro Perfect Vision (APV) in Pondicherry. Personalized guidance for children, professionals, and families.
        </p>

        {/* Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/book"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white font-sora text-sm font-bold tracking-wide shadow-orange-glow transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Book an Appointment</span>
          </Link>

          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 font-sora text-sm font-bold tracking-wide transition-all duration-200"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contact Centre Team</span>
          </Link>
        </div>

        <div className="pt-4 text-xs font-inter text-white/60 flex items-center justify-center gap-4">
          <span>White Town, Puducherry</span>
          <span>•</span>
          <a href="tel:+919489763451" className="hover:text-white transition-colors">
            +91 94897 63451
          </a>
        </div>
      </div>
    </section>
  );
}
