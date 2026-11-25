import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getEffectiveOfferings } from "@/lib/server/cms";
import { ArrowRight, Calendar, Clock, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book Your Appointment | Auro Perfect Vision (APV) — Pondicherry",
  description:
    "Choose your preferred therapy to continue with your appointment booking at Auro Perfect Vision (APV), Pondicherry.",
};

interface BookSelectionPageProps {
  searchParams?: Promise<{
    therapist?: string;
  }>;
}

export default async function BookSelectionPage({
  searchParams,
}: BookSelectionPageProps) {
  const sp = await searchParams;
  const preferredTherapistId = sp?.therapist;

  const offerings = await getEffectiveOfferings(false);
  const publishedTherapies = offerings.filter(
    (item) =>
      item.isPublished &&
      !(item as { isArchived?: boolean }).isArchived &&
      (item as { status?: string }).status !== "archived"
  );

  return (
    <main className="bg-[#FAF9FC] min-h-screen pb-24">
      {/* Page Header */}
      <section className="pt-16 pb-12 bg-white border-b border-brand-gray/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lavender text-brand-purple text-xs font-inter font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
              <span>Auro Perfect Vision (APV) • Pondicherry</span>
            </div>
            <h1 className="font-sora text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-charcoal tracking-tight">
              Book Your Appointment
            </h1>
            <p className="font-inter text-base text-brand-secondary leading-relaxed">
              Choose your preferred therapy to continue with your appointment booking.
            </p>
          </div>
        </div>
      </section>

      {/* Published Therapies Selection Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {publishedTherapies.length === 0 ? (
          <div className="bg-white rounded-3xl border border-brand-gray p-12 text-center max-w-lg mx-auto space-y-4">
            <Calendar className="w-8 h-8 text-brand-purple mx-auto" />
            <h2 className="font-sora text-xl font-bold text-brand-charcoal">
              No Therapies Currently Open for Online Selection
            </h2>
            <p className="font-inter text-sm text-brand-secondary leading-relaxed">
              Please reach out to our Pondicherry clinic desk directly at{" "}
              <a
                href="tel:+919489763451"
                className="font-semibold text-brand-purple hover:underline"
              >
                +91 94897 63451
              </a>{" "}
              for appointment assistance.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {publishedTherapies.map((offering) => {
              const durationLabel = offering.isFlagshipProgramme
                ? "7 Days / 6 Nights"
                : offering.durationMinutes && offering.durationMinutes > 0
                ? `${offering.durationMinutes} mins`
                : null;

              const bookingHref =
                preferredTherapistId &&
                offering.assignedTherapistIds?.includes(preferredTherapistId)
                  ? `/book/${offering.slug}?therapist=${encodeURIComponent(
                      preferredTherapistId
                    )}`
                  : `/book/${offering.slug}`;

              return (
                <article
                  key={offering.id}
                  className="group bg-white rounded-3xl overflow-hidden border border-brand-gray/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(75,29,143,0.1)] transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Existing Therapy Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-brand-gray">
                      <img
                        src={offering.imageUrl}
                        alt={offering.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    </div>

                    {/* Therapy Content */}
                    <div className="p-6 pb-4 space-y-2.5">
                      {durationLabel && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-inter font-medium text-brand-purple bg-brand-lavender/70 px-2.5 py-1 rounded-full">
                          <Clock className="w-3.5 h-3.5 text-brand-orange" />
                          <span>{durationLabel}</span>
                        </div>
                      )}

                      <h2 className="font-sora text-lg sm:text-xl font-bold text-brand-charcoal leading-snug">
                        {offering.title}
                      </h2>

                      <p className="font-inter text-xs sm:text-sm text-brand-secondary leading-relaxed line-clamp-3">
                        {offering.shortDescription}
                      </p>
                    </div>
                  </div>

                  {/* Selection Action Button */}
                  <div className="px-6 pb-6 pt-3">
                    <Link
                      href={bookingHref}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white font-sora text-sm font-bold tracking-wide shadow-sm hover:shadow transition-all"
                    >
                      <span>Book Appointment</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
