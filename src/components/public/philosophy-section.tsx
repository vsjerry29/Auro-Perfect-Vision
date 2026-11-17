import React from "react";
import Link from "next/link";
import { Eye, Shield, Activity, Compass, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PhilosophySection() {
  const pillars = [
    {
      icon: Eye,
      title: "Eye Yoga & Saccadic Flow",
      description: "Restoring ocular muscular flexibility through directional tracking, conscious accommodation, and rhythmic resting cycles that counter screen-induced static gazing.",
    },
    {
      icon: Activity,
      title: "Cranial & Suboccipital Release",
      description: "Eye strain cascades into the neck, temples, and jaw. Our specialized somatic acupressure eases peripheral tension to relieve computer vision fatigue.",
    },
    {
      icon: Compass,
      title: "Photobiomodulation & Warmth",
      description: "Gentle low-level red light exposure and eyelid thermal care to support mitochondrial ocular recovery, meibomian gland health, and natural tear stability.",
    },
    {
      icon: Shield,
      title: "Lifelong Visual Hygiene",
      description: "Practical habits, daylight exposure protocols, and mindful reading ergonomics designed to accompany you through daily digital workflows.",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-canvas-light border-b border-ink-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <Badge variant="plum" className="px-3 py-1 text-xs">
            The Auro Perfect Vision Ethos
          </Badge>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-ink font-normal tracking-tight">
            Vision is not merely physical. <br className="hidden sm:inline" />
            <span className="italic text-plum">It is a living coordination of body and mind.</span>
          </h2>
          <p className="font-sans text-base text-ink-muted leading-relaxed">
            Founded on the pioneering vision therapy research within the intentional township of Auroville, our approach avoids quick fixes and aggressive interventions. We gently retrain how the eyes relax, focus, and interact with light.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl border border-ink-border/70 shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-plum/5 text-plum flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-ink mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-ink-border/40 text-xs font-medium text-gold-dark flex items-center gap-1">
                  <span>Learn methodology</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Editorial Story Split Callout */}
        <div className="mt-16 bg-sage/40 rounded-3xl p-8 sm:p-12 border border-sage-muted grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-3">
            <span className="text-xs font-sans uppercase tracking-widest text-sage-dark font-semibold">
              The Auroville Context
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
              A serene haven dedicated to conscious health and human unity.
            </h3>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              Sessions are hosted at our peaceful centre surrounded by the lush green belt of Auroville, or conducted live via encrypted video consultations for international guests seeking gentle, guided practice.
            </p>
          </div>
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-plum text-white px-6 py-3.5 rounded-brand font-medium text-sm hover:bg-plum-light transition-all shadow-subtle"
            >
              <span>Read Our Full Story</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
