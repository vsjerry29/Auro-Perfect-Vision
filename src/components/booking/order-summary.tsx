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
  paymentMethod,
  onPaymentMethodChange,
}: OrderSummaryProps) {
  const unitPrice = offering.price.inr;
  const totalPrice = unitPrice * seats;

  return (
    <div className="space-y-6">
      {/* Appointment Snapshot Card */}
      <div className="bg-white p-6 rounded-3xl border border-brand-gray/80 space-y-4 shadow-sm">
        <h4 className="font-sora text-base font-bold text-brand-charcoal pb-3 border-b border-brand-gray/80">
          Booking Overview
        </h4>

        <div className="space-y-3.5 text-xs font-inter">
          <div className="flex justify-between items-start">
            <span className="text-brand-secondary">Offering</span>
            <span className="font-semibold text-brand-charcoal text-right max-w-[200px]">
              {offering.title}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-brand-secondary">Practitioner</span>
            <span className="font-semibold text-brand-charcoal">
              {therapist?.displayName || "Assigned Guide"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-brand-secondary">Date & Time</span>
            <span className="font-semibold text-brand-charcoal text-right">
              {dateStr} • {timeSlot}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-brand-secondary">Timezone</span>
            <span className="font-semibold text-brand-charcoal">{clientTimezone}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-brand-secondary">Format / Delivery</span>
            <span className="font-semibold text-brand-charcoal capitalize">
              {offering.format} • {offering.delivery} ({offering.durationMinutes} mins)
            </span>
          </div>

          {offering.format === "group" && (
            <div className="flex justify-between items-center">
              <span className="text-brand-secondary">Participants</span>
              <span className="font-semibold text-brand-charcoal">{seats} seat(s)</span>
            </div>
          )}
        </div>
      </div>

      {/* Total Breakdown */}
      <div className="bg-[#FAF9FC] p-6 rounded-3xl border border-brand-gray/80 space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-xs font-inter font-medium text-brand-secondary block">Total Payable</span>
            <span className="text-[11px] font-inter text-brand-secondary/80">Includes all applicable taxes (INR / ₹)</span>
          </div>
          <span className="font-sora text-3xl font-extrabold text-brand-purple">
            {formatCurrency(totalPrice, "INR")}
          </span>
        </div>
      </div>

      {/* Payment Rail Selector */}
      <div className="space-y-3">
        <label className="block font-sora text-sm font-bold text-brand-charcoal">
          Choose Payment Method
        </label>

        <div className="grid grid-cols-1 gap-3">
          {/* Online Payment Option */}
          <label
            className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
              paymentMethod === "online_razorpay"
                ? "bg-brand-lavender/50 border-brand-purple shadow-sm ring-1 ring-brand-purple"
                : "bg-white border-brand-gray hover:border-brand-purple/30"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === "online_razorpay"}
              onChange={() => onPaymentMethodChange("online_razorpay")}
              className="mt-1 text-brand-purple focus:ring-brand-purple"
            />
            <div className="flex-1 text-xs font-inter">
              <div className="flex items-center gap-2 font-sora font-bold text-brand-charcoal">
                <CreditCard className="w-4 h-4 text-brand-purple" />
                <span>Online Payment (UPI, Cards, Netbanking)</span>
              </div>
              <p className="text-[11px] text-brand-secondary mt-1 leading-relaxed">
                Simulated instant confirmation. Produces immediate downloadable invoice and automated booking tracking.
              </p>
            </div>
          </label>

          {/* Offline Payment Option */}
          <label
            className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
              paymentMethod === "offline_cash"
                ? "bg-brand-lavender/50 border-brand-purple shadow-sm ring-1 ring-brand-purple"
                : "bg-white border-brand-gray hover:border-brand-purple/30"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === "offline_cash"}
              onChange={() => onPaymentMethodChange("offline_cash")}
              className="mt-1 text-brand-purple focus:ring-brand-purple"
            />
            <div className="flex-1 text-xs font-inter">
              <div className="flex items-center gap-2 font-sora font-bold text-brand-charcoal">
                <Building2 className="w-4 h-4 text-brand-orange" />
                <span>Pay at Centre / Bank Transfer (Offline)</span>
              </div>
              <p className="text-[11px] text-brand-secondary mt-1 leading-relaxed">
                Held as pending confirmation. Staff confirms in Admin Console upon cash/wire receipt, releasing the invoice.
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
