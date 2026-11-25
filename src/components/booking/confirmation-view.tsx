"use client";

import React from "react";
import Link from "next/link";
import { Booking } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  MapPin,
} from "lucide-react";

interface ConfirmationViewProps {
  booking: Booking;
}

export function ConfirmationView({ booking }: ConfirmationViewProps) {
  const isPaid =
    booking.paymentStatus === "captured" ||
    booking.paymentStatus === "offline_confirmed" ||
    (booking.paymentStatus as string) === "paid";

  const isBookingConfirmed = booking.status === "confirmed";
  const isBookingPending =
    booking.status === "pending_approval" ||
    booking.status === "pending_offline_confirmation";
  const isBookingCancelled = booking.status === "cancelled";

  // Determine State
  let bannerBg = "bg-amber-50/90 border-amber-200";
  let icon = <Clock className="w-12 h-12 text-amber-600" />;
  let headline = "Booking Request Received";
  let explanation =
    "Your booking request has been received. Our team will confirm your appointment shortly.";

  if (isBookingCancelled) {
    bannerBg = "bg-rose-50/90 border-rose-200";
    icon = <AlertCircle className="w-12 h-12 text-rose-600" />;
    headline = "Appointment Cancelled";
    explanation =
      "This appointment request has been cancelled and the scheduled slot has been released.";
  } else if (isPaid && isBookingConfirmed) {
    bannerBg = "bg-emerald-50/90 border-emerald-200";
    icon = <CheckCircle2 className="w-12 h-12 text-emerald-600" />;
    headline = "Appointment & Payment Confirmed";
    explanation =
      "Your appointment is confirmed and payment has been verified. We look forward to welcoming you to our Pondicherry centre.";
  } else if (isBookingConfirmed && !isPaid) {
    bannerBg = "bg-emerald-50/90 border-emerald-200";
    icon = <CheckCircle2 className="w-12 h-12 text-emerald-600" />;
    headline = "Appointment Confirmed";
    explanation =
      "Your appointment is confirmed. Payment can be completed at the centre.";
  } else {
    // Initial offline booking awaiting approval
    bannerBg = "bg-amber-50/90 border-amber-200";
    icon = <Clock className="w-12 h-12 text-amber-600" />;
    headline = "Booking Request Received";
    explanation =
      "Your booking request has been received. Our team will confirm your appointment shortly.";
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Status Banner */}
      <div className={`p-8 rounded-3xl border text-center space-y-4 shadow-sm ${bannerBg}`}>
        <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center">
          {icon}
        </div>

        {/* Dual Status Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <span
            className={`inline-block px-3.5 py-1 text-xs font-sora font-bold rounded-full ${
              isBookingConfirmed
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : isBookingCancelled
                ? "bg-rose-100 text-rose-800 border border-rose-200"
                : "bg-amber-100 text-amber-800 border border-amber-200"
            }`}
          >
            Booking Status: {isBookingConfirmed ? "Confirmed" : isBookingCancelled ? "Cancelled" : "Pending Approval"}
          </span>

          <span
            className={`inline-block px-3.5 py-1 text-xs font-sora font-bold rounded-full ${
              isPaid
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-amber-100 text-amber-800 border border-amber-200"
            }`}
          >
            Payment Status: {isPaid ? "Paid & Verified" : `${formatCurrency(booking.totalAmount, booking.currency)} Pending`}
          </span>
        </div>

        <h3 className="font-sora text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
          {headline}
        </h3>

        <div className="inline-block bg-white px-5 py-2.5 rounded-2xl border border-brand-gray text-xs font-mono text-brand-charcoal shadow-sm">
          Booking Reference: <span className="font-bold text-brand-purple text-sm">{booking.bookingReference}</span>
        </div>

        <p className="text-xs sm:text-sm font-inter text-brand-secondary max-w-lg mx-auto leading-relaxed">
          {explanation}
        </p>
      </div>

      {/* Appointment Particulars Card */}
      <div className="bg-white rounded-3xl border border-brand-gray/80 p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-brand-gray/80">
          <h4 className="font-sora text-base font-bold text-brand-charcoal">
            Appointment Particulars
          </h4>
          <span className="text-xs font-inter text-brand-secondary">
            Ref: <strong className="font-mono text-brand-purple">{booking.bookingReference}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-inter">
          <div>
            <span className="text-brand-secondary block mb-1">Therapy Offering</span>
            <span className="font-sora font-bold text-brand-charcoal text-base block">{booking.offeringTitle}</span>
          </div>

          <div>
            <span className="text-brand-secondary block mb-1">Assigned Practitioner</span>
            <span className="font-sora font-bold text-brand-charcoal text-base block">{booking.therapistName}</span>
          </div>

          <div>
            <span className="text-brand-secondary block mb-1">Scheduled Date & Time</span>
            <span className="font-semibold text-brand-charcoal text-sm block">
              {booking.date} • {booking.timeSlot}
            </span>
            <span className="text-[11px] text-brand-secondary block mt-0.5">
              Timezone: {booking.clientTimezone || "Asia/Kolkata"}
            </span>
          </div>

          <div>
            <span className="text-brand-secondary block mb-1">Participant Details</span>
            <span className="font-semibold text-brand-charcoal text-sm block">{booking.clientName}</span>
            <span className="text-[11px] text-brand-secondary block mt-0.5">
              {booking.clientEmail} • {booking.clientPhone}
            </span>
          </div>

          <div>
            <span className="text-brand-secondary block mb-1">Payment Method</span>
            <span className="font-semibold text-brand-charcoal capitalize block">
              {(booking.paymentMethod || "offline").replace("_", " ")}
            </span>
          </div>

          <div>
            <span className="text-brand-secondary block mb-1">Total Fee</span>
            <span className="font-sora text-2xl font-extrabold text-brand-purple block">
              {formatCurrency(booking.totalAmount, booking.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Official Tax Invoice & Centre Location Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Invoice Panel */}
        <div className="bg-[#FAF9FC] p-6 rounded-3xl border border-brand-gray/80 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-brand-charcoal font-sora text-base font-bold mb-1">
              <FileText className="w-4 h-4 text-brand-purple" />
              <span>Official Tax Invoice &amp; Receipt</span>
            </div>
            <p className="text-xs font-inter text-brand-secondary leading-relaxed">
              {isPaid && booking.invoiceIssued && booking.invoiceNumber
                ? `Sequential Tax Invoice #${booking.invoiceNumber} has been verified and issued.`
                : "Payment can be completed at the centre reception desk. An official sequential tax invoice will be issued immediately upon payment verification."}
            </p>
          </div>

          <div className="pt-2">
            {isPaid && booking.invoiceIssued && booking.invoiceNumber ? (
              <a
                href={`/api/invoices/${booking.invoiceNumber}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-2xl bg-brand-purple text-white font-sora font-semibold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-brand-violet transition-all"
              >
                <FileText className="w-4 h-4 text-brand-orange" />
                <span>View Official Tax Invoice ({booking.invoiceNumber})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <div className="text-xs font-inter text-amber-800 bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                Fee payable at our Pondicherry centre reception desk upon arrival via Cash, UPI, or Card.
              </div>
            )}
          </div>
        </div>

        {/* Centre Location & Directions Panel */}
        <div className="bg-[#FAF9FC] p-6 rounded-3xl border border-brand-gray/80 space-y-3">
          <div className="flex items-center gap-2 text-brand-charcoal font-sora text-base font-bold mb-1">
            <MapPin className="w-4 h-4 text-brand-purple" />
            <span>Centre Location &amp; Instructions</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-brand-gray text-xs font-inter text-brand-secondary space-y-2 shadow-sm">
            <p className="font-semibold text-brand-charcoal">
              Auro Perfect Vision (APV) — Centre for Integral Vision Care
            </p>
            <p className="leading-relaxed">
              Tresor Nursing Home, 9, St Louis St, White Town, Puducherry – 605001, India.
            </p>
            <p className="text-[11px] text-brand-secondary leading-relaxed pt-1 border-t border-brand-gray/60">
              Please arrive 10 minutes before your scheduled appointment time. Wear comfortable clothing suitable for gentle vision therapy and relaxation.
            </p>
            <p className="text-[11px] text-brand-purple font-medium">
              Direct Desk: +91 94897 63451 • auroperfectvision@gmail.com
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-brand-gray/80">
        <Link
          href={`/booking/${booking.bookingReference}`}
          className="py-3 px-5 rounded-2xl bg-white border border-brand-gray hover:bg-[#FAF9FC] text-brand-charcoal font-sora font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors"
        >
          <span>Shareable Tracking Link</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/therapies"
          className="py-3.5 px-6 rounded-2xl bg-brand-orange hover:bg-brand-orangeHover text-white font-sora font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <span>Explore More Therapies</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
