"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useDemoStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  Clock,
  User,
  Users,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function OfferingDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { offerings, therapists } = useDemoStore();

  const offering = useMemo(() => {
    return offerings.find((o) => o.slug === slug);
  }, [offerings, slug]);

  if (!offering) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h2 className="font-serif text-3xl text-ink">Therapy Offering Not Found</h2>
        <p className="text-sm text-ink-muted">The requested session or programme does not exist.</p>
        <Link href="/therapies">
          <Button variant="primary" size="md">
            Return to Catalogue
          </Button>
        </Link>
      </div>
    );
  }

  // Get assigned therapists
  const assignedTherapists = therapists.filter((t) =>
    offering.assignedTherapistIds.includes(t.id)
  );

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Breadcrumb strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/therapies"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-plum font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalogue</span>
        </Link>
      </div>

      {/* Main Offering Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Deep Dive Narrative */}
          <div className="lg:col-span-8 space-y-10">
            {/* Header Block */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={offering.isFlagshipProgramme ? "gold" : "plum"}>
                  {offering.isFlagshipProgramme ? "Flagship Programme" : "1:1 Consultation"}
                </Badge>
                <Badge variant="sage" className="capitalize">
                  {offering.delivery}
                </Badge>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-ink font-normal tracking-tight leading-tight">
                {offering.title}
              </h1>

              <p className="font-sans text-base sm:text-lg text-ink-muted leading-relaxed">
                {offering.shortDescription}
              </p>
            </div>

            {/* Featured Image */}
            <div className="rounded-3xl overflow-hidden shadow-elevated border-4 border-white bg-white">
              <img
                src={offering.imageUrl}
                alt={offering.title}
                className="w-full h-80 sm:h-96 object-cover"
              />
            </div>

            {/* Comprehensive Explanation */}
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-ink font-normal">
                About the Methodology
              </h2>
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed whitespace-pre-line">
                {offering.fullDescription}
              </p>
            </div>

            {/* What to Expect Grid */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-ink-border shadow-subtle space-y-4">
              <h3 className="font-serif text-xl text-ink font-normal flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold" />
                <span>What to Expect During Your Session</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {offering.whatToExpect.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-ink-muted">
                    <CheckCircle2 className="w-4 h-4 text-plum flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suitable For */}
            <div className="space-y-4">
              <h3 className="font-serif text-xl text-ink font-normal">
                Who This Therapy is Suited For
              </h3>
              <div className="flex flex-wrap gap-2">
                {offering.suitableFor.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-canvas-light border border-ink-border text-xs text-ink"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-sage-dark" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Programme Syllabus (if flagship programme) */}
            {offering.programmeSyllabus && offering.programmeSyllabus.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-ink-border">
                <h3 className="font-serif text-2xl text-ink font-normal">
                  Immersive Course Curriculum
                </h3>
                <div className="space-y-3">
                  {offering.programmeSyllabus.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-5 bg-white rounded-xl border border-ink-border shadow-subtle flex items-start gap-4"
                    >
                      <span className="w-8 h-8 rounded-full bg-plum text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {step.stepNumber}
                      </span>
                      <div>
                        <h4 className="font-serif text-base font-medium text-ink">
                          {step.title}
                        </h4>
                        <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Eligible Practitioners */}
            <div className="space-y-4 pt-4 border-t border-ink-border">
              <h3 className="font-serif text-xl text-ink font-normal">
                Assigned Vision Educators
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {assignedTherapists.map((therapist) => (
                  <div
                    key={therapist.id}
                    className="p-4 rounded-xl border border-ink-border bg-white shadow-subtle flex items-center gap-3.5"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gold/40">
                      <img
                        src={therapist.photoUrl}
                        alt={therapist.displayName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-medium text-ink">
                        {therapist.displayName}
                      </h4>
                      <p className="text-[11px] text-gold-dark font-sans tracking-wide">
                        {therapist.roleTitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Callout Box */}
          <div className="lg:col-span-4 sticky top-28">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-ink-border shadow-card space-y-6">
              <div>
                <span className="text-xs uppercase font-sans tracking-wider text-ink-faint block">
                  Reserve Appointment
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-serif text-3xl font-bold text-plum">
                    {formatCurrency(offering.price.inr, "INR")}
                  </span>
                  <span className="text-sm font-sans text-ink-muted">
                    / ${offering.price.usd} USD
                  </span>
                </div>
                <span className="text-[11px] text-ink-muted block mt-0.5">
                  Includes all applicable taxes & initial intake review
                </span>
              </div>

              <div className="space-y-3 pt-4 border-t border-ink-border text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-ink-muted flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-plum" /> Duration
                  </span>
                  <span className="font-medium text-ink">{offering.durationMinutes} Minutes</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-ink-muted flex items-center gap-1.5">
                    <User className="w-4 h-4 text-plum" /> Format
                  </span>
                  <span className="font-medium text-ink capitalize">
                    {offering.format === "individual" ? "1-on-1 Individual" : `Group (${offering.maxCapacity} max)`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-ink-muted flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-plum" /> Venue / Mode
                  </span>
                  <span className="font-medium text-ink capitalize">
                    {offering.delivery === "onsite" ? "Auroville Centre" : "Online Video / Hybrid"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link href={`/book/${offering.slug}`} className="block">
                  <Button variant="primary" size="lg" className="w-full gap-2 shadow-md">
                    <span>Reserve Date & Time</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="bg-canvas-light p-3.5 rounded-xl border border-ink-border text-[11px] text-ink-muted space-y-1">
                <p className="font-medium text-ink">Zero Login Required:</p>
                <p>
                  Instant slot confirmation, confidential session-specific questionnaire, and downloadable PDF invoice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
