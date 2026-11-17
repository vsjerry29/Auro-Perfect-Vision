"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Eye, Sun, Sparkles, CheckCircle2 } from "lucide-react";

export function MethodologyPerspective() {
  return (
    <section className="py-16 lg:py-24 bg-brand-lavender/50 border-b border-brand-gray overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Visual Photography Stack */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden shadow-elevated border-4 border-white bg-brand-gray">
                <img
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80"
                  alt="Clear conscious eye focus and ocular relaxation"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Inset Photo Overlap */}
              <div className="hidden sm:block absolute -bottom-6 -right-6 w-52 h-40 rounded-2xl overflow-hidden shadow-elevated border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=80"
                  alt="Eye yoga palming technique"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Concise Explanatory Storytelling */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-brand-purple/20 text-brand-purple text-xs font-inter font-bold uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5 text-brand-orange" />
              <span>Auroville Vision Philosophy</span>
            </div>

            <h2 className="font-sora text-3xl sm:text-4xl font-bold text-brand-charcoal tracking-tight leading-snug">
              A Different Perspective on Eye Care & Clarity
            </h2>

            <p className="font-inter text-sm sm:text-base text-brand-secondary leading-relaxed">
              Traditional eye-care often treats blur merely with stronger static lenses. At Auro Perfect Vision, we recognize the eye as a living organ powered by dynamic extraocular muscles and cognitive focus.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-brand-gray/80 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-sora text-xs font-bold text-brand-charcoal">
                    Ciliary Relaxation & Palming
                  </h4>
                  <p className="font-inter text-xs text-brand-secondary mt-0.5">
                    Releasing deep optical tension and chronic spasm caused by prolonged near-point screen focus.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-brand-gray/80 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-sora text-xs font-bold text-brand-charcoal">
                    Central Fixation & Saccadic Shifting
                  </h4>
                  <p className="font-inter text-xs text-brand-secondary mt-0.5">
                    Retraining the macula to see finest detail at the center of sight without straining.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-brand-gray/80 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-sora text-xs font-bold text-brand-charcoal">
                    Natural Light & Photobiomodulation
                  </h4>
                  <p className="font-inter text-xs text-brand-secondary mt-0.5">
                    Harnessing morning sunning rituals and therapeutic light frequencies for cellular ATP synthesis.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-purple hover:bg-brand-deep text-white font-sora text-xs font-bold tracking-wide shadow-purple-glow transition-all"
              >
                <span>About Our Approach</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
