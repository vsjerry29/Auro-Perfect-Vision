"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { format, addDays, startOfToday } from "date-fns";
import { Offering, PaymentMethod, Booking } from "@/lib/types";
import { useDemoStore } from "@/lib/store";
import { formatCurrency, generateBookingReference } from "@/lib/utils";
import { TherapistPicker } from "./therapist-picker";
import { SlotPicker } from "./slot-picker";
import { DynamicIntakeForm } from "./dynamic-intake-form";
import { OrderSummary } from "./order-summary";
import { ConfirmationView } from "./confirmation-view";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RefreshCw,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface BookingWizardProps {
  offering?: Offering;
  offerings?: Offering[];
  allowTherapySelection?: boolean;
  initialOfferingSlug?: string;
  initialTherapistId?: string;
}

export function BookingWizard({
  offering,
  offerings: initialOfferingsProp,
  allowTherapySelection = false,
  initialOfferingSlug,
  initialTherapistId,
}: BookingWizardProps) {
  const {
    offerings: storeOfferings,
    therapists,
    getIntakeTemplateForOffering,
    getAvailableSlots,
    isDateAvailable,
    createBooking,
  } = useDemoStore();

  // Combine dynamic store offerings with server-rendered initial catalog
  const availableOfferings = useMemo(() => {
    const base =
      storeOfferings && storeOfferings.length > 0
        ? storeOfferings
        : initialOfferingsProp || (offering ? [offering] : []);
    return base.filter(
      (item) =>
        item.isPublished &&
        !(item as { isArchived?: boolean }).isArchived &&
        (item as { status?: string }).status !== "archived"
    );
  }, [storeOfferings, initialOfferingsProp, offering]);

  const initialSelectedOfferingId = useMemo(() => {
    if (offering) return offering.id;
    if (initialOfferingSlug) {
      const matched = (initialOfferingsProp || []).find(
        (o) => o.slug === initialOfferingSlug || o.id === initialOfferingSlug
      );
      if (matched) return matched.id;
    }
    return allowTherapySelection ? "" : (initialOfferingsProp?.[0]?.id ?? "");
  }, [offering, initialOfferingSlug, initialOfferingsProp, allowTherapySelection]);

  const [selectedOfferingId, setSelectedOfferingId] = useState<string>(
    initialSelectedOfferingId
  );

  // Sync if URL preselection resolves dynamically once store hydrates
  useEffect(() => {
    if (!offering && initialOfferingSlug && !selectedOfferingId) {
      const matched = availableOfferings.find(
        (o) => o.slug === initialOfferingSlug || o.id === initialOfferingSlug
      );
      if (matched) {
        setSelectedOfferingId(matched.id);
      }
    }
  }, [offering, initialOfferingSlug, selectedOfferingId, availableOfferings]);

  const selectedOffering = useMemo(() => {
    if (offering && (!allowTherapySelection || selectedOfferingId === offering.id)) {
      return offering;
    }
    return availableOfferings.find((o) => o.id === selectedOfferingId) || undefined;
  }, [offering, allowTherapySelection, selectedOfferingId, availableOfferings]);

  // Active non-archived practitioners assigned to the selected therapy
  const eligibleTherapists = useMemo(() => {
    const activeTherapists = therapists.filter((t) => t.isPublished && !t.isArchived);
    if (!selectedOffering) return [];
    return activeTherapists.filter((t) =>
      selectedOffering.assignedTherapistIds.includes(t.id)
    );
  }, [therapists, selectedOffering]);

  // Wizard Step: 1, 2, 3, 4
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1 State: Practitioner & Date/Slot
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>(() => {
    if (offering) {
      if (
        initialTherapistId &&
        offering.assignedTherapistIds.includes(initialTherapistId)
      ) {
        return initialTherapistId;
      }
      return offering.assignedTherapistIds[0] || "";
    }
    return initialTherapistId || "";
  });

  const initialDateStr = useMemo(() => {
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

  // Step 3 State: Settlement Preference & Submission State
  const currency = "INR" as const;
  const [seats, setSeats] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("offline_cash");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Step 4 State: Server-Confirmed Created Booking
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);

  // Idempotent draft identifiers keyed to the current submission inputs
  const draftIdentityRef = useRef<{
    id: string;
    bookingReference: string;
    fingerprint: string;
  } | null>(null);

  const findNextAvailableDateForTherapist = (therapistId: string, preferredDate: string): string => {
    if (!therapistId) return preferredDate;
    if (isDateAvailable(therapistId, preferredDate)) return preferredDate;
    const today = startOfToday();
    for (let i = 1; i <= 14; i++) {
      const candidate = format(addDays(today, i), "yyyy-MM-dd");
      if (isDateAvailable(therapistId, candidate)) {
        return candidate;
      }
    }
    return preferredDate;
  };

  // Ensure initial pre-selected therapist doesn't start on a Sunday/leave date
  useEffect(() => {
    if (selectedTherapistId && !isDateAvailable(selectedTherapistId, selectedDate)) {
      const nextValid = findNextAvailableDateForTherapist(selectedTherapistId, selectedDate);
      if (nextValid !== selectedDate) {
        setSelectedDate(nextValid);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTherapistId]);

  // Handle Therapy Switching cleanly on /book
  const handleSelectOffering = (newOfferingId: string) => {
    setSelectedOfferingId(newOfferingId);
    setSelectedSlot("");
    setIntakeAnswers({});
    setFormErrors({});
    setSeats(1);
    setSubmitError(null);
    draftIdentityRef.current = null;

    if (!newOfferingId) {
      setSelectedTherapistId("");
      return;
    }

    const nextOff = availableOfferings.find((o) => o.id === newOfferingId);
    const activeTherapists = therapists.filter((t) => t.isPublished && !t.isArchived);
    const nextEligible = nextOff
      ? activeTherapists.filter((t) => nextOff.assignedTherapistIds.includes(t.id))
      : [];

    const stillEligible = nextEligible.some((t) => t.id === selectedTherapistId);
    if (!stillEligible) {
      setSelectedTherapistId("");
    }
  };

  const handleSelectTherapist = (therapistId: string) => {
    setSelectedTherapistId(therapistId);
    setSelectedSlot("");
    setSubmitError(null);
    draftIdentityRef.current = null;

    const validDate = findNextAvailableDateForTherapist(therapistId, selectedDate);
    if (validDate !== selectedDate) {
      setSelectedDate(validDate);
    }
  };

  // Dynamic intake template for the selected therapy
  const intakeTemplate = useMemo(() => {
    if (!selectedOffering) return null;
    return getIntakeTemplateForOffering(selectedOffering.id);
  }, [getIntakeTemplateForOffering, selectedOffering]);

  // Calculate available slots dynamically (excludes booked & leave dates)
  const availableSlots = useMemo(() => {
    if (!selectedOffering || !selectedTherapistId || !selectedDate) return [];
    return getAvailableSlots(selectedOffering.id, selectedTherapistId, selectedDate);
  }, [getAvailableSlots, selectedOffering, selectedTherapistId, selectedDate]);

  const activeTherapist = useMemo(() => {
    return eligibleTherapists.find((t) => t.id === selectedTherapistId);
  }, [eligibleTherapists, selectedTherapistId]);

  // Step 1 Validation
  const canProceedStep1 = Boolean(
    selectedOffering && selectedTherapistId && selectedDate && selectedSlot
  );

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!clientName.trim() || clientName.trim().length < 2) {
      errs.clientName = "Please enter your full name.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim())) {
      errs.clientEmail = "Please enter a valid email address.";
    }
    if (clientPhone.replace(/\D/g, "").length < 8) {
      errs.clientPhone = "Please enter a valid contact phone number.";
    }

    if (intakeTemplate) {
      intakeTemplate.fields.forEach((f) => {
        if (!f.isRequired) return;
        const val = intakeAnswers[f.fieldKey];
        const missing =
          val === undefined ||
          val === null ||
          (typeof val === "string" && !val.trim()) ||
          (Array.isArray(val) && val.length === 0) ||
          (f.fieldType === "checkbox" && val !== true && val !== "Yes");
        if (missing) {
          errs[f.fieldKey] = `${f.label} is required.`;
        }
      });
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextFromStep2 = () => {
    if (validateStep2()) {
      setSubmitError(null);
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Real async booking submission to server + database
  const handleFinalSubmit = async () => {
    if (!selectedOffering || !selectedTherapistId || !selectedDate || !selectedSlot) {
      setSubmitError("Missing therapy, practitioner, date, or time slot selection.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const fingerprint = JSON.stringify({
      offeringId: selectedOffering.id,
      therapistId: selectedTherapistId,
      date: selectedDate,
      timeSlot: selectedSlot,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim().toLowerCase(),
      clientPhone: clientPhone.trim(),
      seats,
      paymentMethod,
      intakeAnswers,
    });

    if (!draftIdentityRef.current || draftIdentityRef.current.fingerprint !== fingerprint) {
      draftIdentityRef.current = {
        id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        bookingReference: generateBookingReference(),
        fingerprint,
      };
    }

    try {
      const saved = await createBooking({
        id: draftIdentityRef.current.id,
        bookingReference: draftIdentityRef.current.bookingReference,
        offeringId: selectedOffering.id,
        therapistId: selectedTherapistId,
        date: selectedDate,
        timeSlot: selectedSlot,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim(),
        clientTimezone,
        seatsBooked: seats,
        currency,
        paymentMethod,
        intakeAnswers,
      });

      draftIdentityRef.current = null;
      setCompletedBooking(saved);
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setSubmitError(
        err?.message || "Unable to complete booking request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsLabels = allowTherapySelection
    ? ["Therapy & Slot", "Intake Form", "Review & Submit", "Confirmation"]
    : ["Practitioner & Slot", "Intake Form", "Review & Submit", "Confirmation"];

  const selectedDurationLabel = selectedOffering
    ? selectedOffering.isFlagshipProgramme
      ? "7 Days / 6 Nights"
      : `${selectedOffering.durationMinutes} mins`
    : "";

  return (
    <div className="space-y-8">
      {/* Wizard Progress Stepper */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-brand-gray/80 shadow-sm">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
          {stepsLabels.map((label, idx) => {
            const stepNum = idx + 1;
            const isPassed = currentStep > stepNum;
            const isCurrent = currentStep === stepNum;

            return (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-sora font-bold mb-1.5 transition-all ${
                    isPassed
                      ? "bg-brand-purple text-white shadow-sm"
                      : isCurrent
                      ? "bg-brand-orange text-white shadow-md ring-4 ring-brand-orange/20"
                      : "bg-brand-gray text-brand-secondary"
                  }`}
                >
                  {isPassed ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-inter truncate max-w-full ${
                    isCurrent
                      ? "font-bold text-brand-charcoal"
                      : isPassed
                      ? "text-brand-purple font-semibold"
                      : "text-brand-secondary"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Therapy (when common /book), Practitioner & Slot Selection */}
      {currentStep === 1 && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {allowTherapySelection && (
            <div className="space-y-3">
              <label
                htmlFor="therapy-select"
                className="block font-sora text-sm font-bold text-brand-charcoal"
              >
                1. Choose Therapy
              </label>

              <div className="relative">
                <select
                  id="therapy-select"
                  value={selectedOfferingId}
                  onChange={(e) => handleSelectOffering(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-brand-gray bg-white font-inter text-sm text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-brand-purple shadow-sm"
                >
                  <option value="">-- Select a Therapy / Programme --</option>
                  {availableOfferings.map((item) => {
                    const durText = item.isFlagshipProgramme
                      ? "7 Days / 6 Nights"
                      : `${item.durationMinutes} mins`;
                    return (
                      <option key={item.id} value={item.id}>
                        {item.title} ({durText} • {formatCurrency(item.price.inr, "INR")})
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedOffering ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-brand-purple/25 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-inter font-semibold text-brand-purple">
                      <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                      <span className="capitalize">
                        {selectedOffering.format} • {selectedOffering.delivery}
                      </span>
                    </div>
                    <h3 className="font-sora text-base font-bold text-brand-charcoal">
                      {selectedOffering.title}
                    </h3>
                    <p className="text-xs font-inter text-brand-secondary line-clamp-2">
                      {selectedOffering.shortDescription}
                    </p>
                  </div>
                  <div className="sm:text-right shrink-0 space-y-0.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-gray/70">
                    <div className="font-sora text-lg font-extrabold text-brand-purple">
                      {formatCurrency(selectedOffering.price.inr, "INR")}
                    </div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-inter text-brand-secondary">
                      <Clock className="w-3 h-3 text-brand-orange" />
                      <span>{selectedDurationLabel}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-brand-lavender/35 border border-dashed border-brand-purple/30 text-xs font-inter text-brand-secondary">
                  Select a therapy above to view assigned practitioners, available dates, and consultation details.
                </div>
              )}
            </div>
          )}

          {selectedOffering && (
            <>
              <div className="space-y-2">
                {allowTherapySelection && (
                  <p className="font-sora text-xs font-bold uppercase tracking-wider text-brand-purple">
                    2. Choose Practitioner
                  </p>
                )}
                <TherapistPicker
                  therapists={eligibleTherapists}
                  selectedId={selectedTherapistId}
                  onSelect={handleSelectTherapist}
                />
              </div>

              <div className="space-y-2">
                {allowTherapySelection && (
                  <p className="font-sora text-xs font-bold uppercase tracking-wider text-brand-purple">
                    3. Select Appointment Date and Time
                  </p>
                )}
                {selectedTherapistId ? (
                  <SlotPicker
                    selectedDate={selectedDate}
                    selectedSlot={selectedSlot}
                    onDateChange={(nextDate) => {
                      setSelectedDate(nextDate);
                      setSelectedSlot("");
                      setSubmitError(null);
                      draftIdentityRef.current = null;
                    }}
                    onSlotChange={(slot) => {
                      setSelectedSlot(slot);
                      setSubmitError(null);
                      draftIdentityRef.current = null;
                    }}
                    availableSlots={availableSlots}
                    isDateAvailable={(d) => isDateAvailable(selectedTherapistId, d)}
                    clientTimezone={clientTimezone}
                    onTimezoneChange={setClientTimezone}
                  />
                ) : (
                  <div className="p-5 rounded-2xl bg-white border border-brand-gray/80 text-xs font-inter text-brand-secondary">
                    Please choose a practitioner above to view open appointment dates and time slots.
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end pt-4 border-t border-brand-gray/80">
            <button
              type="button"
              disabled={!canProceedStep1}
              onClick={() => {
                setCurrentStep(2);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="py-3.5 px-6 rounded-2xl bg-brand-orange hover:bg-brand-orangeHover text-white font-sora font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Continue to Intake Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Dynamic Confidential Intake Form */}
      {currentStep === 2 && selectedOffering && intakeTemplate && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="px-4 py-3 rounded-2xl bg-brand-lavender/40 border border-brand-purple/20 flex flex-wrap items-center justify-between gap-2 text-xs font-inter">
            <span className="font-semibold text-brand-charcoal">
              {selectedOffering.title} • {activeTherapist?.displayName}
            </span>
            <span className="text-brand-secondary">
              {selectedDate} • {selectedSlot}
            </span>
          </div>

          <DynamicIntakeForm
            fields={intakeTemplate.fields}
            answers={intakeAnswers}
            onChange={(key, val) => {
              setIntakeAnswers((prev) => ({ ...prev, [key]: val }));
              setFormErrors((prev) => {
                if (!prev[key]) return prev;
                const copy = { ...prev };
                delete copy[key];
                return copy;
              });
            }}
            clientName={clientName}
            onNameChange={(v) => {
              setClientName(v);
              setFormErrors((prev) => {
                if (!prev.clientName) return prev;
                const copy = { ...prev };
                delete copy.clientName;
                return copy;
              });
            }}
            clientEmail={clientEmail}
            onEmailChange={(v) => {
              setClientEmail(v);
              setFormErrors((prev) => {
                if (!prev.clientEmail) return prev;
                const copy = { ...prev };
                delete copy.clientEmail;
                return copy;
              });
            }}
            clientPhone={clientPhone}
            onPhoneChange={(v) => {
              setClientPhone(v);
              setFormErrors((prev) => {
                if (!prev.clientPhone) return prev;
                const copy = { ...prev };
                delete copy.clientPhone;
                return copy;
              });
            }}
            errors={formErrors}
          />

          <div className="flex justify-between items-center pt-4 border-t border-brand-gray/80">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="py-3 px-5 rounded-2xl bg-white border border-brand-gray text-brand-charcoal font-sora font-semibold text-xs flex items-center gap-2 hover:bg-brand-lavender/40 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Slot</span>
            </button>

            <button
              type="button"
              onClick={handleNextFromStep2}
              className="py-3.5 px-6 rounded-2xl bg-brand-orange hover:bg-brand-orangeHover text-white font-sora font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>Review Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Offline Booking Submission */}
      {currentStep === 3 && selectedOffering && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <OrderSummary
            offering={selectedOffering}
            therapist={activeTherapist}
            dateStr={selectedDate}
            timeSlot={selectedSlot}
            clientTimezone={clientTimezone}
            clientName={clientName}
            clientEmail={clientEmail}
            clientPhone={clientPhone}
            seats={seats}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
          />

          {submitError && (
            <div
              role="alert"
              className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-inter flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="font-semibold">Booking could not be submitted</p>
                <p>{submitError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSlot("");
                    setSubmitError(null);
                    setCurrentStep(1);
                  }}
                  className="text-xs font-sora font-bold text-brand-purple hover:underline cursor-pointer"
                >
                  Return to choose another date or time slot
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-brand-gray/80">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setSubmitError(null);
                setCurrentStep(2);
              }}
              className="py-3 px-5 rounded-2xl bg-white border border-brand-gray text-brand-charcoal font-sora font-semibold text-xs flex items-center gap-2 hover:bg-brand-lavender/40 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Intake</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="py-3.5 px-6 rounded-2xl bg-brand-orange hover:bg-brand-orangeHover text-white font-sora font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <span>Submit Booking Request</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
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
