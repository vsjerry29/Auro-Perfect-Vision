"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDemoStore } from "@/lib/store";
import { ConfirmationView } from "@/components/booking/confirmation-view";
import { ArrowLeft, Search, AlertCircle, Sparkles } from "lucide-react";

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
      <div className="bg-[#FAF9FC] min-h-screen py-16">
        <div className="max-w-md mx-auto px-4 text-center space-y-4 bg-white p-8 rounded-3xl border border-brand-gray shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-sora text-2xl font-bold text-brand-charcoal">Booking Reference Not Found</h2>
          <p className="text-xs font-inter text-brand-secondary">
            We could not find an appointment with reference code{" "}
            <strong className="font-mono text-brand-purple">{reference}</strong>.
          </p>
          <div className="pt-2">
            <Link
              href="/therapies"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-purple text-white text-xs font-sora font-semibold hover:bg-brand-violet transition-colors"
            >
              Explore Available Therapies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9FC] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-sora font-semibold text-brand-secondary hover:text-brand-purple transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-gray/80 shadow-sm">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lavender text-brand-purple text-[11px] font-inter font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-brand-orange" />
            <span>Reservation Record</span>
          </div>
          <h1 className="font-sora text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
            Status Tracking & Invoice
          </h1>
        </div>

        <ConfirmationView booking={booking} />
      </div>
    </div>
  );
}
