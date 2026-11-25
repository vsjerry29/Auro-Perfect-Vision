"use client";

import React from "react";
import { UserCheck, Activity, Trees, CalendarCheck, Shield, Sparkles } from "lucide-react";

export function WhyChooseUs() {
  const pillars = [
    {
      icon: UserCheck,
      title: "Personalized 1-on-1 Sessions",
      description:
        "Every eye is unique. We conduct in-depth visual acuity screenings and tailor relaxation routines to your daily occupational strain.",
    },
    {
      icon: Activity,
      title: "Integrative Vision Therapy",
      description:
        "We unite time-tested Bates Method eye relaxation with modern ocular motor tracking, saccadic shifting, and cellular photobiomodulation.",
    },
    {
      icon: Trees,
      title: "Calm Pondicherry Clinic",
      description:
        "Located in the heritage coastal quarter of White Town, Puducherry—a serene setting for clinical care, sensory stillness, and visual rejuvenation.",
    },
    {
      icon: CalendarCheck,
      title: "Seamless Guest Booking",
      description:
        "No complex portals or forced account creation. Select your preferred practitioner, choose a slot, and receive instant confirmation.",
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-white border-b border-brand-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lavender text-brand-purple text-xs font-inter font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
            <span>Why Auro Perfect Vision</span>
          </div>
          <h2 className="font-sora text-3xl sm:text-4xl font-bold text-brand-charcoal tracking-tight">
            A Mindful Perspective on Sight
          </h2>
          <p className="font-inter text-sm sm:text-base text-brand-secondary mt-2">
            Empowering the natural visual system through relaxation, awareness, and dedicated guidance.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-brand-gray/40 hover:bg-white p-6 rounded-2xl border border-brand-gray hover:border-brand-purple/30 shadow-subtle hover:shadow-card transition-all duration-300 space-y-3 group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-lavender text-brand-purple group-hover:bg-brand-orange group-hover:text-white flex items-center justify-center transition-colors">
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="font-sora text-base font-bold text-brand-charcoal group-hover:text-brand-purple transition-colors">
                  {p.title}
                </h3>
                <p className="font-inter text-xs text-brand-secondary leading-relaxed">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
