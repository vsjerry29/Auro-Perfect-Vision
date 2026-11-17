"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Heart,
  Activity,
  Compass,
} from "lucide-react";

interface HeroProps {
  siteContent?: {
    heroHeadline?: string;
    heroSubtitle?: string;
    heroImageUrl?: string;
    primaryCtaText?: string;
    primaryCtaLink?: string;
    heroSecondaryCtaLabel?: string;
  };
}

export function Hero({ siteContent }: HeroProps) {
  const headline = siteContent?.heroHeadline || "See Better. Live Brighter.";
  const subtitle =
    siteContent?.heroSubtitle ||
    "Explore personalized vision therapy, eye yoga, and eye wellness programmes at Auro Perfect Vision, Auroville.";
  const heroImage =
    siteContent?.heroImageUrl ||
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80";
  const ctaText = siteContent?.primaryCtaText || "Book an Appointment";
  const ctaLink = siteContent?.primaryCtaLink || "/therapies";
  const secondaryCta = siteContent?.heroSecondaryCtaLabel || "Explore Therapies";

  return (
    <section className="relative overflow-hidden bg-white pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-brand-gray">
      {/* Background radial gradient accents */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-lavender/70 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-[350px] h-[350px] bg-brand-gray rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Bold Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-lavender border border-brand-purple/15 text-xs font-inter font-semibold text-brand-purple">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
              <span>Auroville International Sanctuary • Natural Eye Care</span>
            </div>

            {/* Main Bold Headline */}
            <h1 className="font-sora hero-headline font-extrabold text-brand-charcoal tracking-tight">
              See Better. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple via-brand-violet to-brand-orange">
                Live Brighter.
              </span>
            </h1>

            {/* Short Supporting Paragraph */}
            <p className="font-inter text-base sm:text-lg text-brand-secondary max-w-xl leading-relaxed">
              {subtitle}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/therapies"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white font-sora text-sm font-bold tracking-wide shadow-orange-glow transition-all duration-200 transform hover:-translate-y-0.5 text-center"
              >
                <Calendar className="w-4 h-4" />
                <span>{ctaText}</span>
              </Link>

              <Link
                href="/therapies"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-brand-lavender/50 text-brand-purple border-2 border-brand-purple/20 hover:border-brand-purple font-sora text-sm font-bold tracking-wide transition-all duration-200 text-center"
              >
                <span>{secondaryCta}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Reassurance Micro-Badges */}
            <div className="pt-6 border-t border-brand-gray grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-inter font-medium text-brand-charcoal">
                  Non-Surgical
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-inter font-medium text-brand-charcoal">
                  1-on-1 & Retreats
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-inter font-medium text-brand-charcoal">
                  Children & Adults
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-inter font-medium text-brand-charcoal">
                  Instant Booking
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Photography Presentation */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Photo Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-elevated border-4 border-white bg-brand-gray aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5] group">
                <img
                  src={heroImage}
                  alt="Auro Perfect Vision Eye Care Consultation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="eager"
                />
                {/* Subtle gradient overlay at bottom for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/60 via-transparent to-transparent pointer-events-none" />

                {/* Floating Bottom Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-white/40 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-inter uppercase tracking-wider text-brand-secondary block font-bold">
                        Auroville Retreat & Clinic
                      </span>
                      <span className="text-sm font-sora font-bold text-brand-deep block mt-0.5">
                        Vision Beyond Glasses
                      </span>
                    </div>
                    <span className="px-2.5 py-1 bg-brand-lavender text-brand-purple text-xs font-sora font-bold rounded-lg border border-brand-purple/15">
                      4.9 ★ Rating
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Floating Badge */}
              <div className="hidden sm:flex absolute -top-4 -left-6 bg-white p-3.5 rounded-2xl shadow-elevated border border-brand-gray items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                  <Eye className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xs font-sora font-bold text-brand-charcoal block">
                    Bates Method & Yoga
                  </span>
                  <span className="text-[11px] font-inter text-brand-secondary block">
                    Conscious Ocular Stillness
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
