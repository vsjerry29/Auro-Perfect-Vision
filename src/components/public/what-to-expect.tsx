"use client";

import React from "react";
import { Sparkles, Eye, ShieldCheck, HeartHandshake, FileCheck, CheckCircle2 } from "lucide-react";

export function WhatToExpect() {
  const points = [
    {
      title: "1. Comprehensive Ocular Strain Assessment",
      desc: "We screen visual acuity, convergence ease, asthenopic trigger points, and current screen posture without invasive drops or mechanical pressure.",
    },
    {
      title: "2. Guided Deep Palming & Muscular Stillness",
      desc: "Learn classical Bates relaxation techniques to rest the optic nerve, release tension in the four recti muscles, and soften rigid focal habits.",
    },
    {
      title: "3. Dynamic Visual Motor Coordination",
      desc: "Practice shifting, long swings, peripheral chart tracking, and saccadic pacing to restore central fixation and natural micro-movements.",
    },
    {
      title: "4. Customized Home Eye Hygiene Blueprint",
      desc: "Receive structured daily eye exercises, cold splash routines, and ergonomic guidelines to protect your eyes from digital screen fatigue.",
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-brand-lavender/30 border-b border-brand-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Heading and Context */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-brand-purple/20 text-brand-purple text-xs font-inter font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-orange" />
              <span>Transparent & Grounded</span>
            </div>

            <h2 className="font-sora text-3xl sm:text-4xl font-bold text-brand-charcoal tracking-tight leading-tight">
              What to Expect During Your Visit
            </h2>

            <p className="font-inter text-sm sm:text-base text-brand-secondary leading-relaxed">
              We provide a calm, respectful, non-invasive environment dedicated to conscious visual education and genuine optical relaxation.
            </p>

            <div className="p-4 rounded-2xl bg-white border border-brand-gray space-y-2">
              <span className="text-xs font-sora font-bold text-brand-deep block">
                Ethical Healthcare Policy
              </span>
              <p className="text-xs font-inter text-brand-secondary leading-relaxed">
                Auro Perfect Vision provides holistic complementary eye-care education and wellness training. We do not manufacture claims of instant cures or replace necessary clinical ophthalmology.
              </p>
            </div>
          </div>

          {/* Right Column: 4 Journey Stages */}
          <div className="lg:col-span-7 space-y-4">
            {points.map((pt, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-brand-gray hover:border-brand-purple/30 shadow-xs flex items-start gap-4 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 font-sora font-bold text-xs mt-0.5">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <h3 className="font-sora text-sm sm:text-base font-bold text-brand-charcoal">
                    {pt.title}
                  </h3>
                  <p className="font-inter text-xs text-brand-secondary leading-relaxed">
                    {pt.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
