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
import { HeroCarousel } from "./hero-carousel";
import { HeroCarouselSlide } from "@/lib/types";

interface HeroProps {
  siteContent?: {
    heroHeadline?: string;
    heroSubtitle?: string;
    heroImageUrl?: string;
    primaryCtaText?: string;
    primaryCtaLink?: string;
    heroCtaLabel?: string;
    heroSecondaryCtaLabel?: string;
    secondaryCtaLink?: string;
    heroCarouselSlides?: HeroCarouselSlide[];
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
  const ctaText = siteContent?.primaryCtaText || siteContent?.heroCtaLabel || "Book an Appointment";
  const ctaLink = siteContent?.primaryCtaLink || "/therapies";
  const secondaryCta = siteContent?.heroSecondaryCtaLabel || "Explore Therapies";
  const secondaryCtaLink = siteContent?.secondaryCtaLink || "/therapies";

  // Dynamically format headline with gradient highlight while preserving user edits
  const renderDynamicHeadline = (text: string) => {
    const parts = text.split(/(?<=[.?!])\s+/);
    if (parts.length > 1) {
      return (
        <>
          {parts[0]} <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple via-brand-violet to-brand-orange">
            {parts.slice(1).join(" ")}
          </span>
        </>
      );
    }
    const words = text.split(" ");
    if (words.length > 2) {
      const first = words.slice(0, words.length - 2).join(" ");
      const second = words.slice(words.length - 2).join(" ");
      return (
        <>
          {first}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple via-brand-violet to-brand-orange">
            {second}
          </span>
        </>
      );
    }
    return (
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple via-brand-violet to-brand-orange">
        {text}
      </span>
    );
  };

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
              {renderDynamicHeadline(headline)}
            </h1>

            {/* Short Supporting Paragraph */}
            <p className="font-inter text-base sm:text-lg text-brand-secondary max-w-xl leading-relaxed">
              {subtitle}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href={ctaLink}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white font-sora text-sm font-bold tracking-wide shadow-orange-glow transition-all duration-200 transform hover:-translate-y-0.5 text-center"
              >
                <Calendar className="w-4 h-4" />
                <span>{ctaText}</span>
              </Link>

              <Link
                href={secondaryCtaLink}
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

          {/* Right Column: Photography Presentation Carousel */}
          <div className="lg:col-span-5 relative">
            <HeroCarousel slides={siteContent?.heroCarouselSlides} />
          </div>
        </div>
      </div>
    </section>
  );
}
