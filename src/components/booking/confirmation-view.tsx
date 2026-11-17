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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
        className={`p-6 sm:p-8 rounded-2xl border text-center space-y-3 ${
          isConfirmed
            ? "bg-emerald-50/80 border-emerald-200"
            : "bg-amber-50/80 border-amber-200"
        }`}
      >
        <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center shadow-xs">
          {isConfirmed ? (
            <CheckCircle2 className="w-12 h-12 text-emerald-700" />
          ) : (
            <Clock className="w-12 h-12 text-amber-700" />
          )}
        </div>

        <Badge
          variant={isConfirmed ? "success" : "warning"}
          className="px-3.5 py-1 text-xs font-semibold"
        >
          {isConfirmed ? "Booking Confirmed" : "Pending Offline Payment Confirmation"}
        </Badge>

        <h3 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
          {isConfirmed
            ? "Your session has been reserved!"
            : "Reservation recorded — pending centre confirmation"}
        </h3>

        <div className="inline-block bg-white px-4 py-2 rounded-lg border border-ink-border text-xs font-mono text-ink shadow-xs">
          Reference: <span className="font-bold text-plum text-sm">{booking.bookingReference}</span>
        </div>

        <p className="text-xs text-ink-muted max-w-lg mx-auto">
          {isConfirmed
            ? "A confirmation message and PDF invoice receipt have been dispatched to your email and WhatsApp."
            : "Your appointment slot is tentatively held. Our front desk staff will verify your cash or bank wire payment and mark the booking confirmed."}
        </p>
      </div>

      {/* Appointment Particulars Card */}
      <div className="bg-white rounded-xl border border-ink-border p-6 space-y-4 shadow-subtle">
        <h4 className="font-serif text-base font-medium text-ink pb-2 border-b border-ink-border/50">
          Appointment Particulars
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-ink-muted block">Therapy Offering</span>
            <span className="font-medium text-ink text-sm">{booking.offeringTitle}</span>
          </div>

          <div>
            <span className="text-ink-muted block">Assigned Practitioner</span>
            <span className="font-medium text-ink text-sm">{booking.therapistName}</span>
          </div>

          <div>
            <span className="text-ink-muted block">Scheduled Date & Time</span>
            <span className="font-medium text-ink text-sm">
              {booking.date} • {booking.timeSlot}
            </span>
            <span className="text-[11px] text-ink-muted block mt-0.5">
              ({booking.clientTimezone})
            </span>
          </div>

          <div>
            <span className="text-ink-muted block">Guest Participant</span>
            <span className="font-medium text-ink text-sm">{booking.clientName}</span>
            <span className="text-[11px] text-ink-muted block mt-0.5">
              {booking.clientEmail} • {booking.clientPhone}
            </span>
          </div>

          <div>
            <span className="text-ink-muted block">Payment Method</span>
            <span className="font-medium text-ink capitalize">
              {booking.paymentMethod.replace("_", " ")}
            </span>
          </div>

          <div>
            <span className="text-ink-muted block">Total Amount</span>
            <span className="font-serif text-lg font-medium text-plum">
              {formatCurrency(booking.totalAmount, booking.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Invoicing & Simulated Communication Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Invoice Action Panel */}
        <div className="bg-canvas-light p-5 rounded-xl border border-ink-border space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-ink font-serif text-base font-medium mb-1">
              <FileText className="w-4 h-4 text-plum" />
              <span>PDF Invoice Receipt</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              {booking.invoiceIssued
                ? `Invoice #${booking.invoiceNumber || "APV-2026-0001"} was automatically generated upon confirmed payment.`
                : "Invoice will be issued immediately once staff confirms offline payment."}
            </p>
          </div>

          <div className="pt-2">
            {booking.invoiceIssued ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInvoiceModalOpen(true)}
                className="w-full gap-2 bg-white"
              >
                <FileText className="w-4 h-4 text-plum" />
                <span>View Watermarked Demo Invoice</span>
              </Button>
            ) : (
              <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                Awaiting offline payment approval in Admin Console to issue invoice.
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp & Email Preview */}
        <div className="bg-canvas-light p-5 rounded-xl border border-ink-border space-y-3">
          <div className="flex items-center gap-2 text-ink font-serif text-base font-medium mb-1">
            <MessageSquare className="w-4 h-4 text-emerald-700" />
            <span>Simulated WhatsApp Notification</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-ink-border text-[11px] font-mono text-ink-muted space-y-1">
            <p className="font-bold text-ink">
              [WhatsApp to {booking.clientPhone}]:
            </p>
            <p>
              "Namaste {booking.clientName}, your session for *{booking.offeringTitle}* with *{booking.therapistName}* on {booking.date} at {booking.timeSlot} is {booking.status}. Ref: {booking.bookingReference}. We look forward to welcoming you in Auroville."
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-ink-border">
        <Link href={`/booking/${booking.bookingReference}`}>
          <Button variant="outline" size="sm" className="gap-2">
            <span>Bookmark Tracking Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </Link>
        <Link href="/therapies">
          <Button variant="primary" size="sm" className="gap-2">
            <span>Explore More Offerings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
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
        <div className="relative border-4 border-dashed border-ink-border p-6 sm:p-8 bg-white space-y-6">
          {/* Watermark Diagonal Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <span className="font-serif text-5xl sm:text-6xl font-bold uppercase rotate-[-25deg] text-red-600 select-none">
              SAMPLE — NOT A TAX INVOICE
            </span>
          </div>

          <div className="flex items-start justify-between border-b pb-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-ink">Auro Perfect Vision</h3>
              <p className="text-xs text-ink-muted">Auroville Centre for Vision Beyond Glasses</p>
              <p className="text-xs text-ink-muted">Auroville, Tamil Nadu 605101, India</p>
              <p className="text-[11px] text-amber-800 font-medium mt-1">
                GST / Tax Status: Unconfirmed (Draft Simulation)
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase text-ink-muted block">Invoice Number</span>
              <span className="font-mono text-sm font-bold text-plum">
                {booking.invoiceNumber || "APV-2026-0001"}
              </span>
              <span className="text-xs text-ink-muted block mt-1">
                Date: {booking.date}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-ink-muted block font-semibold">Billed To:</span>
              <span className="text-ink font-medium">{booking.clientName}</span>
              <span className="text-ink-muted block">{booking.clientEmail}</span>
              <span className="text-ink-muted block">{booking.clientPhone}</span>
            </div>
            <div className="text-right">
              <span className="text-ink-muted block font-semibold">Payment Status:</span>
              <Badge variant="success">Paid ({booking.paymentMethod})</Badge>
            </div>
          </div>

          <table className="w-full text-xs text-left border-t border-b py-2">
            <thead>
              <tr className="border-b">
                <th className="py-2">Description</th>
                <th className="py-2">Practitioner</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 font-medium">{booking.offeringTitle}</td>
                <td className="py-3 text-ink-muted">{booking.therapistName}</td>
                <td className="py-3 text-right font-bold text-ink">
                  {formatCurrency(booking.totalAmount, booking.currency)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-ink-muted">Includes all municipal levies</span>
            <div className="text-right">
              <span className="text-xs text-ink-muted mr-3">Total Paid:</span>
              <span className="font-serif text-xl font-bold text-plum">
                {formatCurrency(booking.totalAmount, booking.currency)}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setInvoiceModalOpen(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              alert("Demo Invoice Downloaded (Sample PDF simulator).");
              setInvoiceModalOpen(false);
            }}
          >
            Download Demo PDF
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
