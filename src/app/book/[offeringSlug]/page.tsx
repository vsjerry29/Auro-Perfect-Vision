import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOfferingBySlug } from "@/lib/server/cms";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { ArrowLeft, Clock, MapPin, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

interface BookOfferingPageProps {
  params: {
    offeringSlug: string;
  };
  searchParams?: {
    therapist?: string;
  };
}

export default function BookOfferingPage({ params, searchParams }: BookOfferingPageProps) {
  const offering = getOfferingBySlug(params.offeringSlug);

  if (!offering || !offering.isPublished) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4 bg-white">
        <h2 className="font-sora text-3xl font-bold text-brand-charcoal">Therapy Offering Not Found</h2>
        <p className="text-sm font-inter text-brand-secondary">The requested session or programme does not exist or is in draft.</p>
        <Link
          href="/therapies"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-purple text-white text-sm font-sora font-semibold hover:bg-brand-violet transition-colors"
        >
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const initialTherapistId = searchParams?.therapist;

  return (
    <div className="bg-[#FAF9FC] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Back Link & Title */}
        <div className="space-y-3">
          <Link
            href={`/therapies/${offering.slug}`}
            className="inline-flex items-center gap-2 text-xs font-sora font-semibold text-brand-secondary hover:text-brand-purple transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Offering Details</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-brand-gray/80 shadow-sm">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lavender text-brand-purple text-[11px] font-inter font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3 text-brand-orange" />
                <span>Guest Appointment Booking</span>
              </div>
              <h1 className="font-sora text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
                Reserve: {offering.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-inter font-medium bg-brand-gray text-brand-charcoal capitalize">
                {offering.format} • {offering.delivery}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-sora font-bold bg-brand-lavender text-brand-purple">
                {offering.durationMinutes} mins
              </span>
            </div>
          </div>
        </div>

        {/* The Full Multi-Step Booking Wizard */}
        <BookingWizard offering={offering} initialTherapistId={initialTherapistId} />
      </div>
    </div>
  );
}
