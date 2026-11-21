"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDemoStore } from "@/lib/store";
import { ConfirmationView } from "@/components/booking/confirmation-view";
import { ArrowLeft, Search, AlertCircle, Sparkles, RefreshCw } from "lucide-react";
import { Booking } from "@/lib/types";

export default function BookingTrackingPage() {
  const params = useParams();
  const reference = (params?.reference as string) || "";
  const { bookings: localBookings } = useDemoStore();

  const [booking, setBooking] = useState<Booking | null>(() => {
    return (
      localBookings.find(
        (b) => b.bookingReference.toLowerCase() === reference.toLowerCase()
      ) || null
    );
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadBooking() {
      try {
        const res = await fetch(`/api/public/bookings?reference=${encodeURIComponent(reference)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.booking && isMounted) {
            setBooking(data.booking);
            setError(null);
            return;
          }
        }

        // Fallback to local store
        const fallback = localBookings.find(
          (b) => b.bookingReference.toLowerCase() === reference.toLowerCase()
        );
        if (fallback && isMounted) {
          setBooking(fallback);
          setError(null);
        } else if (isMounted) {
          setError("Booking not found");
        }
      } catch (err) {
        // Fallback to local store on network failure
        const fallback = localBookings.find(
          (b) => b.bookingReference.toLowerCase() === reference.toLowerCase()
        );
        if (fallback && isMounted) {
          setBooking(fallback);
        } else if (isMounted) {
          setError("Failed to fetch booking details");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadBooking();

    return () => {
      isMounted = false;
    };
  }, [reference, localBookings]);

  if (loading && !booking) {
    return (
      <div className="bg-[#FAF9FC] min-h-screen py-20 flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-purple animate-spin mx-auto" />
          <p className="text-xs font-inter text-brand-secondary">
            Retrieving live booking status...
          </p>
        </div>
      </div>
    );
  }

  if (!booking || error) {
    return (
      <div className="bg-[#FAF9FC] min-h-screen py-16">
        <div className="max-w-md mx-auto px-4 text-center space-y-4 bg-white p-8 rounded-3xl border border-brand-gray shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-sora text-2xl font-bold text-brand-charcoal">
            Booking Reference Not Found
          </h2>
          <p className="text-xs font-inter text-brand-secondary leading-relaxed">
            We could not find an appointment with reference code{" "}
            <strong className="font-mono text-brand-purple">{reference}</strong>. Please check your confirmation email or contact our reception desk.
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

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-gray/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lavender text-brand-purple text-[11px] font-inter font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3 text-brand-orange" />
              <span>Official Reservation Status</span>
            </div>
            <h1 className="font-sora text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
              Live Appointment Tracking
            </h1>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[11px] font-inter text-brand-secondary block">Assigned Code</span>
            <span className="font-mono font-bold text-brand-purple text-base sm:text-lg">
              {booking.bookingReference}
            </span>
          </div>
        </div>

        <ConfirmationView booking={booking} />
      </div>
    </div>
  );
}
