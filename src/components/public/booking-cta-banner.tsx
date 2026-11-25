import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BookingCtaBanner() {
  return (
    <section className="py-20 bg-plum text-white relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-gold/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-sage/10 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        <div className="inline-flex items-center gap-1.5 bg-white/10 text-gold-light px-3.5 py-1 rounded-full text-xs font-sans tracking-wider uppercase backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-gold inline" />
          <span>Begin Your Visual Wellness Journey</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-canvas-light leading-tight">
          Ready to experience <span className="italic text-gold-light">clearer, calmer vision?</span>
        </h2>

        <p className="font-sans text-sm sm:text-base text-canvas-dark/80 max-w-2xl mx-auto leading-relaxed">
          Book a 1-on-1 session at our Pondicherry Centre or schedule a guided remote consultation from anywhere in the world. No account login required.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/book">
            <Button variant="gold" size="lg" className="w-full sm:w-auto gap-2 group text-plum font-semibold">
              <span>Book an Appointment</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white">
              Learn About Our Methods
            </Button>
          </Link>
        </div>

        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-canvas-dark/60">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-gold" />
            Zero-Login Guest Booking
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-gold" />
            Non-Invasive, Gentle Eye Yoga
          </span>
          <span>•</span>
          <span>WhatsApp & Email Invoices Included</span>
        </div>
      </div>
    </section>
  );
}
