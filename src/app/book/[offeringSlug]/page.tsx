"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useDemoStore } from "@/lib/store";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { ArrowLeft, ShieldCheck, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function BookOfferingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const offeringSlug = params?.offeringSlug as string;
  const initialTherapistId = searchParams?.get("therapist") || undefined;

  const { offerings } = useDemoStore();

  const offering = useMemo(() => {
    return offerings.find((o) => o.slug === offeringSlug);
  }, [offerings, offeringSlug]);

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

  return (
    <div className="bg-canvas min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Back Link & Title */}
        <div className="space-y-3">
          <Link
            href={`/therapies/${offering.slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-plum font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Offering Details</span>
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-sans tracking-wider text-gold-dark font-semibold">
                Guest Appointment Booking
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-ink font-normal">
                Reserve: {offering.title}
              </h1>
            </div>

            <Badge variant="sage" className="text-xs capitalize">
              {offering.format} • {offering.delivery} ({offering.durationMinutes} mins)
            </Badge>
          </div>
        </div>

        {/* The Full Multi-Step Booking Wizard */}
        <BookingWizard offering={offering} initialTherapistId={initialTherapistId} />
      </div>
    </div>
  );
}
