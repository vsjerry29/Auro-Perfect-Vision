"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Booking } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Calendar,
  User,
  MessageSquare,
  Mail,
  FileText,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

interface ConfirmationViewProps {
  booking: Booking;
}

export function ConfirmationView({ booking }: ConfirmationViewProps) {
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const isConfirmed = booking.status === "confirmed";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Status Banner */}
      <div
        className={`p-8 rounded-3xl border text-center space-y-3.5 shadow-sm ${
          isConfirmed
            ? "bg-emerald-50/90 border-emerald-200"
            : "bg-amber-50/90 border-amber-200"
        }`}
      >
        <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center">
          {isConfirmed ? (
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          ) : (
            <Clock className="w-12 h-12 text-amber-600" />
          )}
        </div>

        <span
          className={`inline-block px-3.5 py-1 text-xs font-sora font-bold rounded-full ${
            isConfirmed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {isConfirmed ? "Booking Confirmed" : "Pending Offline Payment Confirmation"}
        </span>

        <h3 className="font-sora text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
          {isConfirmed
            ? "Your session has been reserved!"
            : "Reservation recorded — pending centre confirmation"}
        </h3>

        <div className="inline-block bg-white px-5 py-2.5 rounded-2xl border border-brand-gray text-xs font-mono text-brand-charcoal shadow-sm">
          Reference: <span className="font-bold text-brand-purple text-sm">{booking.bookingReference}</span>
        </div>

        <p className="text-xs font-inter text-brand-secondary max-w-lg mx-auto leading-relaxed">
          {isConfirmed
            ? "A confirmation message and PDF invoice receipt have been dispatched to your email and WhatsApp."
            : "Your appointment slot is tentatively held. Our front desk staff will verify your cash or bank wire payment and mark the booking confirmed."}
        </p>
      </div>

      {/* Appointment Particulars Card */}
      <div className="bg-white rounded-3xl border border-brand-gray/80 p-6 sm:p-8 space-y-5 shadow-sm">
        <h4 className="font-sora text-base font-bold text-brand-charcoal pb-3 border-b border-brand-gray/80">
          Appointment Particulars
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-inter">
          <div>
            <span className="text-brand-secondary block mb-1">Therapy Offering</span>
            <span className="font-sora font-bold text-brand-charcoal text-base">{booking.offeringTitle}</span>
          </div>

          <div>
            <span className="text-brand-secondary block mb-1">Assigned Practitioner</span>
            <span className="font-sora font-bold text-brand-charcoal text-base">{booking.therapistName}</span>
          </div>

          <div>
            <span className="text-brand-secondary block mb-1">Scheduled Date & Time</span>
            <span className="font-semibold text-brand-charcoal text-sm">
              {booking.date} • {booking.timeSlot}
            </span>
            <span className="text-[11px] text-brand-secondary block mt-0.5">
              ({booking.clientTimezone})
            </span>
          </div>

          <div>
            <span className="text-brand-secondary block mb-1">Guest Participant</span>
            <span className="font-semibold text-brand-charcoal text-sm">{booking.clientName}</span>
            <span className="text-[11px] text-brand-secondary block mt-0.5">
              {booking.clientEmail} • {booking.clientPhone}
            </span>
          </div>

          <div>
            <span className="text-brand-secondary block mb-1">Payment Method</span>
            <span className="font-semibold text-brand-charcoal capitalize">
              {booking.paymentMethod.replace("_", " ")}
            </span>
          </div>

          <div>
            <span className="text-brand-secondary block mb-1">Total Amount</span>
            <span className="font-sora text-2xl font-extrabold text-brand-purple">
              {formatCurrency(booking.totalAmount, booking.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Invoicing & Simulated Communication Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Invoice Action Panel */}
        <div className="bg-[#FAF9FC] p-6 rounded-3xl border border-brand-gray/80 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-brand-charcoal font-sora text-base font-bold mb-1">
              <FileText className="w-4 h-4 text-brand-purple" />
              <span>PDF Invoice Receipt</span>
            </div>
            <p className="text-xs font-inter text-brand-secondary leading-relaxed">
              {booking.invoiceIssued
                ? `Invoice #${booking.invoiceNumber || "APV-2026-0001"} was automatically generated upon confirmed payment.`
                : "Invoice will be issued immediately once staff confirms offline payment."}
            </p>
          </div>

          <div className="pt-2">
            {booking.invoiceIssued ? (
              <button
                onClick={() => setInvoiceModalOpen(true)}
                className="w-full py-3 px-4 rounded-2xl bg-white border border-brand-gray hover:border-brand-purple/40 text-brand-purple font-sora font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <FileText className="w-4 h-4 text-brand-purple" />
                <span>View Watermarked Demo Invoice</span>
              </button>
            ) : (
              <div className="text-xs font-inter text-amber-800 bg-amber-50 p-3 rounded-2xl border border-amber-200">
                Awaiting offline payment approval in Admin Console to issue invoice.
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp & Email Preview */}
        <div className="bg-[#FAF9FC] p-6 rounded-3xl border border-brand-gray/80 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-sora text-base font-bold mb-1">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Simulated WhatsApp Notification</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-brand-gray text-xs font-mono text-brand-secondary space-y-1 shadow-sm">
            <p className="font-bold text-brand-charcoal">
              [WhatsApp to {booking.clientPhone}]:
            </p>
            <p className="leading-relaxed">
              "Namaste {booking.clientName}, your session for *{booking.offeringTitle}* with *{booking.therapistName}* on {booking.date} at {booking.timeSlot} is {booking.status}. Ref: {booking.bookingReference}. We look forward to welcoming you in Auroville."
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
          <span>Bookmark Tracking Link</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/therapies"
          className="py-3.5 px-6 rounded-2xl bg-brand-orange hover:bg-brand-orangeHover text-white font-sora font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <span>Explore More Offerings</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Watermarked Demo Invoice Modal */}
      <Dialog
        open={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        title="Demo Invoice Preview"
        description="Clear watermark applied: SAMPLE — NOT A TAX INVOICE"
        maxWidth="lg"
      >
        <div className="relative border-2 border-dashed border-brand-gray p-6 sm:p-8 bg-white space-y-6 rounded-2xl">
          {/* Watermark Diagonal Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <span className="font-sora text-4xl sm:text-5xl font-extrabold uppercase rotate-[-25deg] text-rose-600 select-none">
              SAMPLE — NOT A TAX INVOICE
            </span>
          </div>

          <div className="flex items-start justify-between border-b border-brand-gray pb-4">
            <div>
              <h3 className="font-sora text-xl font-bold text-brand-charcoal">Auro Perfect Vision</h3>
              <p className="text-xs font-inter text-brand-secondary">Auroville Centre for Vision Beyond Glasses</p>
              <p className="text-xs font-inter text-brand-secondary">Auroville, Tamil Nadu 605101, India</p>
              <p className="text-[11px] font-inter text-amber-800 font-semibold mt-1">
                GST / Tax Status: Unconfirmed (Draft Simulation)
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-inter text-brand-secondary block">Invoice Number</span>
              <span className="font-mono text-sm font-bold text-brand-purple">
                {booking.invoiceNumber || "APV-2026-0001"}
              </span>
              <span className="text-xs font-inter text-brand-secondary block mt-1">
                Date: {booking.date}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-inter">
            <div>
              <span className="text-brand-secondary block font-semibold">Billed To:</span>
              <span className="text-brand-charcoal font-semibold">{booking.clientName}</span>
              <span className="text-brand-secondary block">{booking.clientEmail}</span>
              <span className="text-brand-secondary block">{booking.clientPhone}</span>
            </div>
            <div className="text-right">
              <span className="text-brand-secondary block font-semibold">Payment Status:</span>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                Paid ({booking.paymentMethod})
              </span>
            </div>
          </div>

          <table className="w-full text-xs font-inter text-left border-t border-b border-brand-gray py-2">
            <thead>
              <tr className="border-b border-brand-gray">
                <th className="py-2.5 font-bold text-brand-charcoal">Description</th>
                <th className="py-2.5 font-bold text-brand-charcoal">Practitioner</th>
                <th className="py-2.5 text-right font-bold text-brand-charcoal">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 font-semibold text-brand-charcoal">{booking.offeringTitle}</td>
                <td className="py-3 text-brand-secondary">{booking.therapistName}</td>
                <td className="py-3 text-right font-bold text-brand-purple">
                  {formatCurrency(booking.totalAmount, booking.currency)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs font-inter text-brand-secondary">Includes all municipal levies</span>
            <div className="text-right">
              <span className="text-xs font-inter text-brand-secondary mr-3">Total Paid:</span>
              <span className="font-sora text-xl font-bold text-brand-purple">
                {formatCurrency(booking.totalAmount, booking.currency)}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            onClick={() => setInvoiceModalOpen(false)}
            className="py-2.5 px-4 rounded-xl bg-brand-gray text-brand-charcoal font-sora font-semibold text-xs hover:bg-brand-lavender transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              alert("Demo Invoice Downloaded (Sample PDF simulator).");
              setInvoiceModalOpen(false);
            }}
            className="py-2.5 px-4 rounded-xl bg-brand-purple text-white font-sora font-semibold text-xs hover:bg-brand-violet transition-colors"
          >
            Download Demo PDF
          </button>
        </div>
      </Dialog>
    </div>
  );
}
