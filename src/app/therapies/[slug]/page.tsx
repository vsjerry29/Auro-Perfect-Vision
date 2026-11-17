import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOfferingBySlug, getAllTherapists } from "@/lib/server/cms";
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
  HeartHandshake,
  Check,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface OfferingDetailPageProps {
  params: {
    slug: string;
  };
}

export default function OfferingDetailPage({ params }: OfferingDetailPageProps) {
  const offering = getOfferingBySlug(params.slug);

  if (!offering || !offering.isPublished) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4 bg-white">
        <h2 className="font-sora text-3xl font-bold text-brand-charcoal">Therapy Offering Not Found</h2>
        <p className="text-sm font-inter text-brand-secondary">
          The requested session or programme is either not available or currently in draft.
        </p>
        <Link
          href="/therapies"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-purple text-white text-sm font-sora font-semibold hover:bg-brand-violet transition-colors"
        >
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const allTherapists = getAllTherapists(true);
  const assignedTherapists = allTherapists.filter((t) =>
    offering.assignedTherapistIds.includes(t.id)
  );

  const isFlagship = offering.isFlagshipProgramme || offering.durationMinutes > 180;
  const durationDisplay = isFlagship
    ? `7-Day Residential Retreat • ${offering.durationMinutes} mins/daily session`
    : `${offering.durationMinutes} Minutes`;

  return (
    <div className="bg-[#FAF9FC] min-h-screen pb-24">
      {/* Breadcrumb strip */}
      <div className="bg-white border-b border-brand-gray/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/therapies"
            className="inline-flex items-center gap-2 text-xs font-sora font-semibold text-brand-secondary hover:text-brand-purple transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Therapies</span>
          </Link>
        </div>
      </div>

      {/* Main Offering Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Deep Dive Narrative */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header Block */}
            <div className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-brand-gray/80 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-sora font-semibold ${
                  isFlagship
                    ? "bg-brand-orange text-white"
                    : "bg-brand-lavender text-brand-purple"
                }`}>
                  {isFlagship ? "Flagship Retreat" : "Individual Care"}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-inter font-medium bg-brand-gray text-brand-charcoal capitalize">
                  {offering.delivery === "onsite" ? "Auroville On-site" : "Online Video Session"}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-inter font-medium bg-brand-gray text-brand-secondary">
                  {offering.format === "individual" ? "1-on-1 Guidance" : "Group Cohort"}
                </span>
              </div>

              <h1 className="font-sora text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-charcoal tracking-tight leading-tight">
                {offering.title}
              </h1>

              <p className="font-inter text-base sm:text-lg text-brand-secondary leading-relaxed">
                {offering.shortDescription}
              </p>
            </div>

            {/* Featured Image */}
            <div className="rounded-3xl overflow-hidden shadow-md border border-brand-gray/80 bg-white">
              <img
                src={offering.imageUrl}
                alt={offering.title}
                className="w-full h-80 sm:h-96 object-cover"
              />
            </div>

            {/* Comprehensive Explanation */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-gray/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-brand-purple">
                <Sparkles className="w-5 h-5 text-brand-orange" />
                <h2 className="font-sora text-xl sm:text-2xl font-bold text-brand-charcoal">
                  About the Methodology
                </h2>
              </div>
              <p className="font-inter text-sm sm:text-base text-brand-secondary leading-relaxed whitespace-pre-line">
                {offering.fullDescription}
              </p>
            </div>

            {/* What to Expect Grid */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-gray/80 shadow-sm space-y-4">
              <h3 className="font-sora text-xl font-bold text-brand-charcoal flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-purple" />
                <span>What to Expect During Your Session</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {offering.whatToExpect.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-inter text-brand-secondary bg-[#FAF9FC] p-3.5 rounded-2xl border border-brand-gray/60">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suitable For */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-gray/80 shadow-sm space-y-4">
              <h3 className="font-sora text-xl font-bold text-brand-charcoal">
                Who This Therapy is Suited For
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {offering.suitableFor.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-lavender/60 border border-brand-purple/20 text-xs font-inter font-medium text-brand-purple"
                  >
                    <Check className="w-3.5 h-3.5 text-brand-orange" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Programme Syllabus (if flagship programme) */}
            {offering.programmeSyllabus && offering.programmeSyllabus.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-gray/80 shadow-sm space-y-6">
                <div>
                  <span className="text-xs uppercase font-inter font-bold tracking-wider text-brand-orange">
                    Curriculum & Schedule
                  </span>
                  <h3 className="font-sora text-2xl font-bold text-brand-charcoal mt-1">
                    Immersive Course Syllabus
                  </h3>
                </div>

                <div className="space-y-3">
                  {offering.programmeSyllabus.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-5 bg-[#FAF9FC] rounded-2xl border border-brand-gray/80 flex items-start gap-4 hover:border-brand-purple/30 transition-colors"
                    >
                      <span className="w-8 h-8 rounded-full bg-brand-purple text-white text-xs font-sora font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        {step.stepNumber}
                      </span>
                      <div>
                        <h4 className="font-sora text-sm sm:text-base font-bold text-brand-charcoal">
                          {step.title}
                        </h4>
                        <p className="font-inter text-xs sm:text-sm text-brand-secondary mt-1 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Eligible Practitioners */}
            {assignedTherapists.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-gray/80 shadow-sm space-y-4">
                <h3 className="font-sora text-xl font-bold text-brand-charcoal">
                  Assigned Vision Educators
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {assignedTherapists.map((therapist) => (
                    <div
                      key={therapist.id}
                      className="p-4 rounded-2xl border border-brand-gray bg-[#FAF9FC] flex items-center gap-4"
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-brand-purple/30">
                        <img
                          src={therapist.photoUrl}
                          alt={therapist.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-sora text-sm font-bold text-brand-charcoal">
                          {therapist.displayName}
                        </h4>
                        <p className="font-inter text-xs text-brand-purple font-medium">
                          {therapist.roleTitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Booking Callout Box */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-gray/80 shadow-xl space-y-6">
              <div>
                <span className="text-xs uppercase font-inter font-bold tracking-wider text-brand-secondary block">
                  Session Fee
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-sora text-3xl sm:text-4xl font-extrabold text-brand-purple">
                    {formatCurrency(offering.price.inr, "INR")}
                  </span>
                  <span className="text-sm font-inter text-brand-secondary">
                    / ${offering.price.usd} USD
                  </span>
                </div>
                <span className="text-xs font-inter text-brand-secondary block mt-1">
                  Transparent pricing • No hidden facility fees
                </span>
              </div>

              <div className="space-y-3.5 pt-4 border-t border-brand-gray/80 text-xs font-inter">
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-purple" /> Duration
                  </span>
                  <span className="font-semibold text-brand-charcoal text-right max-w-[200px]">
                    {durationDisplay}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-purple" /> Format
                  </span>
                  <span className="font-semibold text-brand-charcoal capitalize">
                    {offering.format === "individual" ? "1-on-1 Individual" : `Group (${offering.maxCapacity} max)`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-purple" /> Venue / Mode
                  </span>
                  <span className="font-semibold text-brand-charcoal capitalize">
                    {offering.delivery === "onsite" ? "Auroville Centre" : "Online Video / Hybrid"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link href={`/book/${offering.slug}`} className="block">
                  <button className="w-full py-4 px-6 rounded-2xl bg-brand-orange hover:bg-brand-orangeHover text-white font-sora font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all">
                    <span>Reserve Date & Time</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              <div className="bg-[#FAF9FC] p-4 rounded-2xl border border-brand-gray text-xs font-inter text-brand-secondary space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-brand-charcoal">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Instant Guest Confirmation</span>
                </div>
                <p className="leading-relaxed">
                  No account setup required. Choose your therapist, select an available date, and receive automated booking details instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
