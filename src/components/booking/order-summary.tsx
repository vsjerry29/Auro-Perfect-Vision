"use client";

import React from "react";
import { Offering, Therapist, PaymentMethod } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Building2, CreditCard, ShieldCheck } from "lucide-react";

interface OrderSummaryProps {
  offering: Offering;
  therapist?: Therapist;
  dateStr: string;
  timeSlot: string;
  clientTimezone: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
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
  clientName,
  clientEmail,
  clientPhone,
  seats,
  paymentMethod,
  onPaymentMethodChange,
}: OrderSummaryProps) {
  const unitPrice = offering.price.inr;
  const totalPrice = unitPrice * seats;
  const durationDisplay = offering.isFlagshipProgramme
    ? "7 Days / 6 Nights"
    : `${offering.durationMinutes} mins`;

  return (
    <div className="space-y-6">
      {/* Appointment Snapshot Card */}
      <div className="bg-white p-6 rounded-3xl border border-brand-gray/80 space-y-4 shadow-sm">
        <h4 className="font-sora text-base font-bold text-brand-charcoal pb-3 border-b border-brand-gray/80">
          Review Appointment Details
        </h4>

        <div className="space-y-3.5 text-xs font-inter">
          <div className="flex justify-between items-start gap-4">
            <span className="text-brand-secondary">Selected Therapy</span>
            <span className="font-semibold text-brand-charcoal text-right max-w-[260px]">
              {offering.title}
            </span>
          </div>

          <div className="flex justify-between items-center gap-4">
            <span className="text-brand-secondary">Practitioner</span>
            <span className="font-semibold text-brand-charcoal text-right">
              {therapist?.displayName || "Assigned Practitioner"}
            </span>
          </div>

          <div className="flex justify-between items-center gap-4">
            <span className="text-brand-secondary">Date & Time</span>
            <span className="font-semibold text-brand-charcoal text-right">
              {dateStr} • {timeSlot}
            </span>
          </div>

          <div className="flex justify-between items-center gap-4">
            <span className="text-brand-secondary">Timezone</span>
            <span className="font-semibold text-brand-charcoal">{clientTimezone}</span>
          </div>

          <div className="flex justify-between items-center gap-4">
            <span className="text-brand-secondary">Format / Duration</span>
            <span className="font-semibold text-brand-charcoal capitalize">
              {offering.format} • {offering.delivery} ({durationDisplay})
            </span>
          </div>

          {offering.format === "group" && (
            <div className="flex justify-between items-center gap-4">
              <span className="text-brand-secondary">Participants</span>
              <span className="font-semibold text-brand-charcoal">{seats} seat(s)</span>
            </div>
          )}

          {clientName && (
            <div className="pt-3 border-t border-brand-gray/70 space-y-2">
              <div className="flex justify-between items-center gap-4">
                <span className="text-brand-secondary">Client Name</span>
                <span className="font-semibold text-brand-charcoal text-right">{clientName}</span>
              </div>
              {clientEmail && (
                <div className="flex justify-between items-center gap-4">
                  <span className="text-brand-secondary">Email</span>
                  <span className="font-semibold text-brand-charcoal text-right">{clientEmail}</span>
                </div>
              )}
              {clientPhone && (
                <div className="flex justify-between items-center gap-4">
                  <span className="text-brand-secondary">Phone</span>
                  <span className="font-semibold text-brand-charcoal text-right">{clientPhone}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Total Breakdown (INR Only) */}
      <div className="bg-[#FAF9FC] p-6 rounded-3xl border border-brand-gray/80 space-y-2.5">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <span className="text-xs font-inter font-medium text-brand-secondary block">
              Consultation Fee (INR)
            </span>
            <span className="text-[11px] font-inter text-brand-secondary/80">
              No upfront online charge. Payment is settled upon clinic confirmation.
            </span>
          </div>
          <span className="font-sora text-3xl font-extrabold text-brand-purple shrink-0">
            {formatCurrency(totalPrice, "INR")}
          </span>
        </div>
      </div>

      {/* Offline Payment Settlement Options */}
      <div className="space-y-3">
        <label className="block font-sora text-sm font-bold text-brand-charcoal">
          Preferred Settlement Method
        </label>

        <div className="grid grid-cols-1 gap-3">
          {/* Pay at Centre Option */}
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
              value="offline_cash"
              checked={paymentMethod === "offline_cash"}
              onChange={() => onPaymentMethodChange("offline_cash")}
              className="mt-1 text-brand-purple focus:ring-brand-purple"
            />
            <div className="flex-1 text-xs font-inter">
              <div className="flex items-center gap-2 font-sora font-bold text-brand-charcoal">
                <Building2 className="w-4 h-4 text-brand-orange" />
                <span>Pay at Centre on Arrival (Offline)</span>
              </div>
              <p className="text-[11px] text-brand-secondary mt-1 leading-relaxed">
                Your booking request enters review at our White Town clinic. Payment is recorded by our team at reception once verified.
              </p>
            </div>
          </label>

          {/* Bank Transfer / UPI at Reception Option */}
          <label
            className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
              paymentMethod === "offline_bank_transfer"
                ? "bg-brand-lavender/50 border-brand-purple shadow-sm ring-1 ring-brand-purple"
                : "bg-white border-brand-gray hover:border-brand-purple/30"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="offline_bank_transfer"
              checked={paymentMethod === "offline_bank_transfer"}
              onChange={() => onPaymentMethodChange("offline_bank_transfer")}
              className="mt-1 text-brand-purple focus:ring-brand-purple"
            />
            <div className="flex-1 text-xs font-inter">
              <div className="flex items-center gap-2 font-sora font-bold text-brand-charcoal">
                <CreditCard className="w-4 h-4 text-brand-purple" />
                <span>UPI / Bank Transfer upon Confirmation</span>
              </div>
              <p className="text-[11px] text-brand-secondary mt-1 leading-relaxed">
                Reserve the slot without paying online now. Clinic staff shares UPI/bank details and issues your official receipt after confirmation.
              </p>
            </div>
          </label>
        </div>

        <div className="p-3.5 rounded-2xl bg-brand-lavender/30 border border-brand-purple/15 flex items-center gap-2.5 text-[11px] font-inter text-brand-secondary">
          <ShieldCheck className="w-4 h-4 text-brand-purple shrink-0" />
          <span>
            Bookings begin in <strong>Pending Approval</strong> status with{" "}
            <strong>Payment Pending</strong> until approved and confirmed by Auro Perfect Vision staff.
          </span>
        </div>
      </div>
    </div>
  );
}
