"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDemoStore } from "@/lib/store";
import { ConfirmationView } from "@/components/booking/confirmation-view";
import { ArrowLeft, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookingTrackingPage() {
  const params = useParams();
  const reference = params?.reference as string;
  const { bookings } = useDemoStore();

  const booking = useMemo(() => {
    return bookings.find(
      (b) => b.bookingReference.toLowerCase() === (reference || "").toLowerCase()
    );
  }, [bookings, reference]);

  if (!booking) {
    return (
      <div className="bg-canvas min-h-screen py-16">
        <div className="max-w-md mx-auto px-4 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl text-ink">Booking Reference Not Found</h2>
          <p className="text-xs text-ink-muted">
            We could not find an appointment with reference code{" "}
            <strong className="font-mono text-plum">{reference}</strong>.
          </p>
          <div className="pt-2">
            <Link href="/therapies">
              <Button variant="primary" size="md">
                Explore Available Therapies
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-plum font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-gold-dark font-semibold">
            Reservation Record
          </span>
          <h1 className="font-serif text-3xl text-ink font-normal">
            Status Tracking & Invoice
          </h1>
        </div>

        <ConfirmationView booking={booking} />
      </div>
    </div>
  );
}
