"use client";

import React, { useState, useMemo } from "react";
import { format, addDays, startOfToday } from "date-fns";
import { Offering, Therapist, PaymentMethod, Booking } from "@/lib/types";
import { useDemoStore } from "@/lib/store";
import { TherapistPicker } from "./therapist-picker";
import { SlotPicker } from "./slot-picker";
import { DynamicIntakeForm } from "./dynamic-intake-form";
import { OrderSummary } from "./order-summary";
import { ConfirmationView } from "./confirmation-view";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, ShieldCheck, Check } from "lucide-react";

interface BookingWizardProps {
  offering: Offering;
  initialTherapistId?: string;
}

export function BookingWizard({ offering, initialTherapistId }: BookingWizardProps) {
  const {
    therapists,
    getIntakeTemplateForOffering,
    getAvailableSlots,
    isDateAvailable,
    createBooking,
  } = useDemoStore();

  // Filter therapists who can offer this session
  const eligibleTherapists = useMemo(() => {
    return therapists.filter((t) =>
      offering.assignedTherapistIds.includes(t.id)
    );
  }, [therapists, offering]);

  // Current Wizard Step: 1, 2, 3, 4
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1 State: Therapist & Slot
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>(
    initialTherapistId || (eligibleTherapists[0]?.id ?? "")
  );

  const initialDateStr = useMemo(() => {
    // Pick tomorrow as initial candidate date
    return format(addDays(startOfToday(), 1), "yyyy-MM-dd");
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(initialDateStr);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [clientTimezone, setClientTimezone] = useState<string>("Asia/Kolkata");

  // Step 2 State: Contact & Dynamic Intake
  const [clientName, setClientName] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [intakeAnswers, setIntakeAnswers] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Step 3 State: Currency & Payment Method
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [seats, setSeats] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online_razorpay");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Step 4 State: Final Created Booking
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);

  // Retrieve dynamic template for this offering
  const intakeTemplate = useMemo(() => {
    return getIntakeTemplateForOffering(offering.id);
  }, [getIntakeTemplateForOffering, offering.id]);

  // Calculate slots dynamically
  const availableSlots = useMemo(() => {
    if (!selectedTherapistId || !selectedDate) return [];
    return getAvailableSlots(offering.id, selectedTherapistId, selectedDate);
  }, [getAvailableSlots, offering.id, selectedTherapistId, selectedDate]);

  const activeTherapist = useMemo(() => {
    return therapists.find((t) => t.id === selectedTherapistId);
  }, [therapists, selectedTherapistId]);

  // Step 1 Validation
  const canProceedStep1 = Boolean(selectedTherapistId && selectedDate && selectedSlot);

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!clientName.trim()) errs.clientName = "Please enter your full name.";
    if (!clientEmail.trim() || !clientEmail.includes("@")) {
      errs.clientEmail = "Please enter a valid email address.";
    }
    if (!clientPhone.trim() || clientPhone.length < 8) {
      errs.clientPhone = "Please enter your WhatsApp phone number.";
    }

    // Dynamic fields validation
    intakeTemplate.fields.forEach((f) => {
      if (f.isRequired) {
        const val = intakeAnswers[f.fieldKey];
        if (!val || (typeof val === "string" && !val.trim())) {
          errs[f.fieldKey] = `${f.label} is required.`;
        }
      }
    });

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextFromStep2 = () => {
    if (validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Submit booking on Step 3
  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const b = createBooking({
        offeringId: offering.id,
        therapistId: selectedTherapistId,
        date: selectedDate,
        timeSlot: selectedSlot,
        clientName,
        clientEmail,
        clientPhone,
        clientTimezone,
        seatsBooked: seats,
        currency,
        paymentMethod,
        intakeAnswers,
      });
      setCompletedBooking(b);
      setIsSubmitting(false);
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 700);
  };

  const stepsLabels = ["Practitioner & Slot", "Intake Form", "Payment Review", "Confirmation"];

  return (
    <div className="space-y-8">
      {/* Wizard Progress Stepper */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-ink-border shadow-subtle">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
          {stepsLabels.map((label, idx) => {
            const stepNum = idx + 1;
            const isPassed = currentStep > stepNum;
            const isCurrent = currentStep === stepNum;

            return (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mb-1.5 transition-all ${
                    isPassed
                      ? "bg-plum text-white"
                      : isCurrent
                      ? "bg-gold text-white ring-4 ring-gold-soft"
                      : "bg-canvas-dark text-ink-muted"
                  }`}
                >
                  {isPassed ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-sans truncate max-w-full ${
                    isCurrent
                      ? "font-semibold text-ink"
                      : isPassed
                      ? "text-plum font-medium"
                      : "text-ink-muted"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Therapist & Slot Selection */}
      {currentStep === 1 && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <TherapistPicker
            therapists={eligibleTherapists}
            selectedId={selectedTherapistId}
            onSelect={(id) => {
              setSelectedTherapistId(id);
              setSelectedSlot("");
            }}
          />

          <SlotPicker
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onDateChange={setSelectedDate}
            onSlotChange={setSelectedSlot}
            availableSlots={availableSlots}
            isDateAvailable={(d) => isDateAvailable(selectedTherapistId, d)}
            clientTimezone={clientTimezone}
            onTimezoneChange={setClientTimezone}
          />

          <div className="flex justify-end pt-4 border-t border-ink-border">
            <Button
              variant="primary"
              size="lg"
              disabled={!canProceedStep1}
              onClick={() => {
                setCurrentStep(2);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="gap-2"
            >
              <span>Continue to Intake Details</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Dynamic Confidential Intake Form */}
      {currentStep === 2 && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <DynamicIntakeForm
            fields={intakeTemplate.fields}
            answers={intakeAnswers}
            onChange={(key, val) =>
              setIntakeAnswers((prev) => ({ ...prev, [key]: val }))
            }
            clientName={clientName}
            onNameChange={setClientName}
            clientEmail={clientEmail}
            onEmailChange={setClientEmail}
            clientPhone={clientPhone}
            onPhoneChange={setClientPhone}
            errors={formErrors}
          />

          <div className="flex justify-between items-center pt-4 border-t border-ink-border">
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentStep(1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Slot</span>
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={handleNextFromStep2}
              className="gap-2"
            >
              <span>Proceed to Review & Payment</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Order Review & Payment Selection */}
      {currentStep === 3 && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <OrderSummary
            offering={offering}
            therapist={activeTherapist}
            dateStr={selectedDate}
            timeSlot={selectedSlot}
            clientTimezone={clientTimezone}
            seats={seats}
            currency={currency}
            onCurrencyChange={setCurrency}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
          />

          <div className="flex justify-between items-center pt-4 border-t border-ink-border">
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentStep(2)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Intake</span>
            </Button>

            <Button
              variant="gold"
              size="lg"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="gap-2 text-plum font-semibold"
            >
              {isSubmitting ? (
                <span>Confirming Booking...</span>
              ) : (
                <>
                  <span>
                    {paymentMethod === "online_razorpay"
                      ? "Simulate Online Payment"
                      : "Record Offline Booking"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Confirmation & Tracking View */}
      {currentStep === 4 && completedBooking && (
        <ConfirmationView booking={completedBooking} />
      )}
    </div>
  );
}
