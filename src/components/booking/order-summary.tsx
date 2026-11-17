"use client";

import React from "react";
import { Offering, Therapist, PaymentMethod } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ShieldCheck, CreditCard, Building2, Clock, Calendar, User, MapPin } from "lucide-react";

interface OrderSummaryProps {
  offering: Offering;
  therapist?: Therapist;
  dateStr: string;
  timeSlot: string;
  clientTimezone: string;
  seats: number;
  currency: "INR" | "USD";
  onCurrencyChange: (curr: "INR" | "USD") => void;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
}

export function OrderSummary({
  offering,
  therapist,
  dateStr,
  timeSlot,
  clientTimezone,
  seats,
  currency,
  onCurrencyChange,
  paymentMethod,
  onPaymentMethodChange,
}: OrderSummaryProps) {
  const unitPrice = currency === "INR" ? offering.price.inr : offering.price.usd;
  const totalPrice = unitPrice * seats;

  return (
    <div className="space-y-6">
      {/* Appointment Snapshot Card */}
      <div className="bg-white p-5 rounded-xl border border-ink-border space-y-4 shadow-subtle">
        <h4 className="font-serif text-base font-medium text-ink pb-2 border-b border-ink-border/50">
          Booking Overview
        </h4>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-start">
            <span className="text-ink-muted">Offering</span>
            <span className="font-medium text-ink text-right max-w-[200px]">
              {offering.title}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-ink-muted">Practitioner</span>
            <span className="font-medium text-ink">
              {therapist?.displayName || "Assigned Guide"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-ink-muted">Date & Time</span>
            <span className="font-medium text-ink text-right">
              {dateStr} • {timeSlot}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-ink-muted">Timezone</span>
            <span className="font-medium text-ink">{clientTimezone}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-ink-muted">Format / Delivery</span>
            <span className="font-medium text-ink capitalize">
              {offering.format} • {offering.delivery} ({offering.durationMinutes} mins)
            </span>
          </div>

          {offering.format === "group" && (
            <div className="flex justify-between items-center">
              <span className="text-ink-muted">Participants</span>
              <span className="font-medium text-ink">{seats} seat(s)</span>
            </div>
          )}
        </div>
      </div>

      {/* Currency & Total Breakdown */}
      <div className="bg-canvas-light p-5 rounded-xl border border-ink-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-ink">Select Billing Currency:</span>
          <div className="inline-flex rounded-lg border border-ink-border p-0.5 bg-white">
            <button
              type="button"
              onClick={() => onCurrencyChange("INR")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                currency === "INR" ? "bg-plum text-white shadow-xs" : "text-ink hover:text-plum"
              }`}
            >
              INR (₹)
            </button>
            <button
              type="button"
              onClick={() => onCurrencyChange("USD")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                currency === "USD" ? "bg-plum text-white shadow-xs" : "text-ink hover:text-plum"
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-ink-border/60 flex items-baseline justify-between">
          <div>
            <span className="text-xs text-ink-muted block">Total Payable</span>
            <span className="text-[10px] text-ink-faint">Includes all applicable taxes</span>
          </div>
          <span className="font-serif text-2xl font-medium text-plum">
            {formatCurrency(totalPrice, currency)}
          </span>
        </div>
      </div>

      {/* Payment Rail Selector */}
      <div className="space-y-3">
        <label className="block font-serif text-sm font-medium text-ink">
          Choose Payment Method
        </label>

        <div className="grid grid-cols-1 gap-2.5">
          {/* Online Payment Option */}
          <label
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
              paymentMethod === "online_razorpay"
                ? "bg-plum-muted/60 border-plum shadow-xs"
                : "bg-white border-ink-border hover:border-ink-muted"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === "online_razorpay"}
              onChange={() => onPaymentMethodChange("online_razorpay")}
              className="mt-1 text-plum focus:ring-plum"
            />
            <div className="flex-1 text-xs">
              <div className="flex items-center gap-2 font-medium text-ink">
                <CreditCard className="w-4 h-4 text-plum" />
                <span>Online Payment (UPI, Cards, Netbanking)</span>
              </div>
              <p className="text-[11px] text-ink-muted mt-1">
                Simulated instant confirmation. Produces immediate downloadable invoice and WhatsApp alert.
              </p>
            </div>
          </label>

          {/* Offline Payment Option */}
          <label
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
              paymentMethod === "offline_cash"
                ? "bg-plum-muted/60 border-plum shadow-xs"
                : "bg-white border-ink-border hover:border-ink-muted"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === "offline_cash"}
              onChange={() => onPaymentMethodChange("offline_cash")}
              className="mt-1 text-plum focus:ring-plum"
            />
            <div className="flex-1 text-xs">
              <div className="flex items-center gap-2 font-medium text-ink">
                <Building2 className="w-4 h-4 text-gold-dark" />
                <span>Pay at Centre / Bank Transfer (Offline)</span>
              </div>
              <p className="text-[11px] text-ink-muted mt-1">
                Held as pending confirmation. Staff confirms in Admin Console upon cash/wire receipt, releasing the invoice.
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
