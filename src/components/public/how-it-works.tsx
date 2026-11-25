"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Layers, UserCheck, Calendar, CheckCircle2, ArrowRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: Layers,
      title: "Choose a Therapy",
      description: "Select from 1-on-1 Eye Yoga, Screen Strain relief, or the 7-Day Residential Retreat.",
    },
    {
      num: "02",
      icon: UserCheck,
      title: "Select Practitioner",
      description: "Match with our dedicated vision specialists in Pondicherry based on your specific visual goals.",
    },
    {
      num: "03",
      icon: Calendar,
      title: "Pick Date & Time",
      description: "Live real-time calendar availability with direct local or international timezone alignment.",
    },
    {
      num: "04",
      icon: CheckCircle2,
      title: "Instant Confirmation",
      description: "Receive your booking reference, preparation guidance, and location details immediately.",
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white border-b border-brand-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lavender text-brand-purple text-xs font-inter font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
            <span>Effortless Reservation</span>
          </div>
          <h2 className="font-sora text-3xl sm:text-4xl font-bold text-brand-charcoal tracking-tight">
            How Booking Works
          </h2>
          <p className="font-inter text-sm sm:text-base text-brand-secondary mt-2">
            Schedule your vision wellness session in 4 easy steps without mandatory account creation.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-brand-gray/30 p-6 rounded-3xl border border-brand-gray hover:border-brand-purple/30 transition-all duration-300 relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-sora text-2xl font-black text-brand-purple/20 group-hover:text-brand-orange transition-colors">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-brand-gray flex items-center justify-center text-brand-purple group-hover:bg-brand-orange group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>
                  </div>

                  <h3 className="font-sora text-base font-bold text-brand-charcoal mb-2">
                    {step.title}
                  </h3>
                  <p className="font-inter text-xs text-brand-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Booking Action */}
        <div className="mt-12 text-center">
          <Link
            href="/book"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white font-sora text-xs font-bold tracking-wide shadow-orange-glow transition-all"
          >
            <span>Book Your Session Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
