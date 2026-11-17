import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Sun, ShieldCheck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroProps {
  siteContent?: {
    heroHeadline?: string;
    heroSubtitle?: string;
    heroImageUrl?: string;
    primaryCtaText?: string;
    primaryCtaLink?: string;
  };
}

export function Hero({ siteContent }: HeroProps) {
  const headline = siteContent?.heroHeadline || "A more mindful approach to natural vision.";
  const subtitle =
    siteContent?.heroSubtitle ||
    "Experience holistic ocular restoration amidst the serene forests of Auroville. Combining classical Eye Yoga, conscious relaxation, photobiomodulation, and digital screen recovery for children and adults worldwide.";
  const heroImage =
    siteContent?.heroImageUrl ||
    "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80";
  const ctaText = siteContent?.primaryCtaText || "Explore Therapies & Book";
  const ctaLink = siteContent?.primaryCtaLink || "/therapies";

  return (
    <section className="relative overflow-hidden bg-canvas pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-ink-border/50">
      {/* Subtle organic light gradient background */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-gold-soft/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-sage/60 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Value Prop */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2">
              <Badge variant="gold" className="px-3 py-1 font-sans text-xs tracking-wider">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-gold-dark inline" />
                Auroville • Centre for Vision Beyond Glasses
              </Badge>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink font-normal tracking-tight leading-[1.12]">
              {headline}
            </h1>

            <p className="font-sans text-base sm:text-lg text-ink-muted max-w-xl leading-relaxed">
              {subtitle}
            </p>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link href={ctaLink}>
                <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2 group">
                  <span>{ctaText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Our Holistic Methodology
                </Button>
              </Link>
            </div>

            {/* Credibility and reassurance metrics */}
            <div className="pt-8 border-t border-ink-border/60 grid grid-cols-3 gap-6 text-left">
              <div>
                <span className="block font-serif text-2xl lg:text-3xl text-plum font-normal">
                  1:1 & Group
                </span>
                <span className="text-xs text-ink-muted uppercase tracking-wider block mt-1">
                  Individual Sessions & Retreats
                </span>
              </div>
              <div>
                <span className="block font-serif text-2xl lg:text-3xl text-plum font-normal">
                  Hybrid
                </span>
                <span className="text-xs text-ink-muted uppercase tracking-wider block mt-1">
                  Auroville On-site & Global Online
                </span>
              </div>
              <div>
                <span className="block font-serif text-2xl lg:text-3xl text-plum font-normal">
                  No Login
                </span>
                <span className="text-xs text-ink-muted uppercase tracking-wider block mt-1">
                  Effortless Guest Booking
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: High-End Editorial Photographic Art */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative border with rounded frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-elevated border-8 border-white bg-white">
                <img
                  src={heroImage}
                  alt="Mindful eye wellness practice in natural daylight"
                  className="w-full h-[440px] sm:h-[500px] object-cover hover:scale-105 transition-transform duration-700"
                />

                {/* Floating organic card */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-ink-border/50 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center text-sage-dark flex-shrink-0">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-serif text-sm font-medium text-ink">
                        Gentle Bates & Yogic Palming
                      </p>
                      <p className="text-xs text-ink-muted">
                        Restoring effortless blinking & natural ocular vitality.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative corner tag */}
              <div className="absolute -top-4 -right-4 bg-gold text-white text-xs font-sans font-medium px-4 py-1.5 rounded-full shadow-md hidden sm:block">
                Rooted in Auroville
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
