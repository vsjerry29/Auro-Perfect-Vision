import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Compass,
  Sun,
  Eye,
  HeartHandshake,
  CheckCircle2,
  TreePine,
} from "lucide-react";

export const metadata = {
  title: "About Us | Auro Perfect Vision (APV) — Pondicherry",
  description:
    "Discover the philosophy, comprehensive vision care, and integral wellness methodology of Auro Perfect Vision in Pondicherry.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#FAF9FC] min-h-screen pb-24">
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-white border-b border-brand-gray/80 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-lavender text-brand-purple text-xs font-inter font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
            <span>Our Heritage & Purpose</span>
          </div>

          <h1 className="font-sora text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-charcoal tracking-tight leading-tight">
            Nurturing Sight as a <span className="text-brand-purple">Conscious, Dynamic Sense.</span>
          </h1>

          <p className="font-inter text-base sm:text-lg text-brand-secondary leading-relaxed max-w-3xl mx-auto">
            Auro Perfect Vision (APV) was established in Pondicherry with a transformative conviction: the eyes are dynamic organs capable of relaxation, neuromuscular adaptability, and sustained comfort when given mindful care and proper visual hygiene.
          </p>
        </div>
      </section>

      {/* Main Narrative & Photographic Journey */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Story Block 1: Pondicherry Centre */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-inter font-bold uppercase tracking-widest text-brand-orange">
              Centre for Integral Vision Care
            </span>
            <h2 className="font-sora text-3xl sm:text-4xl font-bold text-brand-charcoal leading-tight">
              Comprehensive eye care and vision therapies in Pondicherry.
            </h2>
            <p className="font-inter text-sm sm:text-base text-brand-secondary leading-relaxed">
              Situated in historic White Town, Puducherry, our centre draws deeply from the spirit of integral health and wellness. Rather than treating visual fatigue or refractive challenges as isolated mechanical defects, we understand vision within the broader rhythm of human wellbeing — physical relaxation, mental clarity, and clinical excellence.
            </p>
            <p className="font-inter text-sm sm:text-base text-brand-secondary leading-relaxed">
              Our quiet facility in White Town provides dedicated spaces engineered to help children and adults disengage from constant near-point strain and develop sustainable ocular wellness.
            </p>
          </div>
          <div className="lg:col-span-6 rounded-3xl overflow-hidden shadow-lg border border-brand-gray/80 group">
            <img
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80"
              alt="Auro Perfect Vision Centre in White Town, Puducherry"
              className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-gray/80 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-inter font-bold uppercase tracking-wider text-brand-purple">
              Core Principles
            </span>
            <h3 className="font-sora text-2xl sm:text-3xl font-bold text-brand-charcoal">
              Four Pillars of Natural Eye Wellness
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#FAF9FC] border border-brand-gray/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-lavender text-brand-purple flex items-center justify-center">
                <Sun className="w-5 h-5 text-brand-orange" />
              </div>
              <h4 className="font-sora text-base font-bold text-brand-charcoal">
                Sun & Natural Light
              </h4>
              <p className="font-inter text-xs text-brand-secondary leading-relaxed">
                Gentle sunning rituals to desensitize photophobia and nourish retinal cellular metabolism.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF9FC] border border-brand-gray/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-lavender text-brand-purple flex items-center justify-center">
                <Eye className="w-5 h-5 text-brand-purple" />
              </div>
              <h4 className="font-sora text-base font-bold text-brand-charcoal">
                Central Fixation
              </h4>
              <p className="font-inter text-xs text-brand-secondary leading-relaxed">
                Retraining the macula to see clearly without squinting, furrowing brows, or staring rigidly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF9FC] border border-brand-gray/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-lavender text-brand-purple flex items-center justify-center">
                <TreePine className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="font-sora text-base font-bold text-brand-charcoal">
                Relaxed Mobility
              </h4>
              <p className="font-inter text-xs text-brand-secondary leading-relaxed">
                Rhythmical sway and shifting exercises that break habitual eye spasms caused by monitor fixations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF9FC] border border-brand-gray/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-lavender text-brand-purple flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 text-brand-orange" />
              </div>
              <h4 className="font-sora text-base font-bold text-brand-charcoal">
                Empowered Habits
              </h4>
              <p className="font-inter text-xs text-brand-secondary leading-relaxed">
                Daily 10-minute micro-habits that allow students and professionals to sustain visual ease for life.
              </p>
            </div>
          </div>
        </div>

        {/* Story Block 2: Integrative Methodology */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 rounded-3xl overflow-hidden shadow-lg border border-brand-gray/80 group lg:order-1 order-2">
            <img
              src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80"
              alt="Mindful vision exercise"
              className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          </div>
          <div className="lg:col-span-6 space-y-5 lg:order-2 order-1">
            <span className="text-xs font-inter font-bold uppercase tracking-widest text-brand-orange">
              Our Methodology
            </span>
            <h2 className="font-sora text-3xl sm:text-4xl font-bold text-brand-charcoal leading-tight">
              Gentle practices harmonized with modern ocular photobiomodulation.
            </h2>
            <p className="font-inter text-sm sm:text-base text-brand-secondary leading-relaxed">
              Our educational curriculum combines classical Bates relaxation techniques (palming, long swing, sunning) with supportive 670nm red-light photobiomodulation and digital workspace ergonomics.
            </p>
            <p className="font-inter text-sm sm:text-base text-brand-secondary leading-relaxed">
              We guide children encountering early near-point strain and working adults facing digital eye fatigue to rebuild relaxed accommodation habits, effortless blinking reflexes, and peripheral visual presence.
            </p>
          </div>
        </div>

        {/* Responsible Boundaries & Disclaimer */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-brand-gray/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-brand-charcoal font-sora text-lg font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Responsible Wellness & Clinical Boundaries</span>
          </div>
          <p className="font-inter text-xs sm:text-sm text-brand-secondary leading-relaxed">
            Auro Perfect Vision provides educational vision wellness, eye yoga, and complementary ocular relaxation therapies. We do not perform ophthalmological surgery, prescribe medical drugs, or replace hospital clinical diagnosis. We actively encourage all clients to maintain regular check-ups with certified ophthalmologists.
          </p>
        </div>

        {/* Call to action */}
        <div className="text-center pt-8 space-y-5">
          <h3 className="font-sora text-2xl sm:text-3xl font-bold text-brand-charcoal">
            Experience our mindful approach in Pondicherry or online.
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-brand-orange hover:bg-brand-orangeHover text-white text-sm font-sora font-bold shadow-md hover:shadow-lg transition-all"
            >
              <span>Book an Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-brand-purple border border-brand-purple/30 text-sm font-sora font-semibold hover:bg-brand-lavender/50 transition-colors"
            >
              <span>Contact Our Team</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
