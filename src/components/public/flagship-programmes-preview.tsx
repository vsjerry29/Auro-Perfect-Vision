"use client";

import React from "react";
import Link from "next/link";
import { Compass, Calendar, Users, MapPin, CheckCircle2, ArrowRight } from "lucide-react";

export function FlagshipProgrammesPreview() {
  return (
    <section className="py-16 lg:py-24 bg-brand-deep text-white relative overflow-hidden border-b border-brand-gray/10">
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-violet/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-purple/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Programme Information */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-orange text-xs font-sora font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Flagship Residential Immersion</span>
            </div>

            <h2 className="font-sora text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              7-Day Residential Vision Awakening Camp
            </h2>

            <p className="font-inter text-sm sm:text-base text-white/80 leading-relaxed">
              Step away from screen glare and urban stress into the forest canopy of Auroville. A comprehensive 7-day experiential retreat combining daily Bates methodology, nutritional eye hygiene, sunning, and deep ocular stillness.
            </p>

            {/* Key Program Facts */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                <span className="text-[10px] font-inter uppercase tracking-wider text-white/60 block font-semibold">
                  Duration
                </span>
                <span className="font-sora text-sm font-bold text-white block mt-0.5">
                  7 Days / 6 Nights
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                <span className="text-[10px] font-inter uppercase tracking-wider text-white/60 block font-semibold">
                  Format
                </span>
                <span className="font-sora text-sm font-bold text-white block mt-0.5">
                  Small Cohort (12 Max)
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                <span className="text-[10px] font-inter uppercase tracking-wider text-white/60 block font-semibold">
                  Location
                </span>
                <span className="font-sora text-sm font-bold text-white block mt-0.5">
                  Auroville, India
                </span>
              </div>
            </div>

            {/* Inclusions checklist */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs font-inter text-white/90">
                <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0" />
                <span>Daily personalized vision training & progressive palming</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-inter text-white/90">
                <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0" />
                <span>Complete organic sattvic meals and forest campus stay</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-inter text-white/90">
                <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0" />
                <span>Personalized lifelong home eye gym blueprint and chart kit</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/therapies/retreat-holistic-vision-awakening"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white font-sora text-xs font-bold tracking-wide shadow-orange-glow transition-all duration-200 text-center"
              >
                <span>View Full Itinerary & Dates</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/book/retreat-holistic-vision-awakening"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 font-sora text-xs font-bold transition-all text-center"
              >
                <span>Reserve Retreat Seat</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Panoramic Retreat Photography */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 bg-brand-purple">
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=80"
                  alt="Auroville Residential Eye Camp Sanctuary"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Floating Cohort Badge */}
              <div className="absolute -bottom-5 -left-4 sm:left-4 bg-white text-brand-charcoal p-4 rounded-2xl shadow-elevated border border-brand-gray flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                  <Calendar className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xs font-sora font-bold text-brand-deep block">
                    Upcoming Cohort
                  </span>
                  <span className="text-[11px] font-inter text-brand-secondary block">
                    Dec 5 – Dec 11, 2026 • 4 Seats Left
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
