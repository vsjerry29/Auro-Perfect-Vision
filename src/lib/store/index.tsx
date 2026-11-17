"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Offering,
  Therapist,
  RecurringScheduleDay,
  LeaveException,
  IntakeTemplate,
  IntakeField,
  Booking,
  BlogPost,
  BookingStatus,
  PaymentMethod,
} from "../types";
import {
  INITIAL_OFFERINGS,
  INITIAL_THERAPISTS,
  DEFAULT_WEEKLY_SCHEDULE,
  INITIAL_LEAVE_EXCEPTIONS,
  INITIAL_INTAKE_TEMPLATES,
  INITIAL_BOOKINGS,
  INITIAL_BLOGS,
} from "../demo-data";
import { generateBookingReference, generateInvoiceNumber } from "../utils";

interface DemoStoreContextType {
  offerings: Offering[];
  therapists: Therapist[];
  weeklySchedule: RecurringScheduleDay[];
  leaveExceptions: LeaveException[];
  intakeTemplates: IntakeTemplate[];
  bookings: Booking[];
  blogs: BlogPost[];

  // Offerings actions
  addOffering: (offering: Omit<Offering, "id">) => void;
  updateOffering: (id: string, offering: Partial<Offering>) => void;
  deleteOffering: (id: string) => void;

  // Therapists actions
  updateTherapist: (id: string, data: Partial<Therapist>) => void;

  // Schedule & Leave actions
  updateDaySchedule: (dayOfWeek: number, data: Partial<RecurringScheduleDay>) => void;
  addLeaveException: (date: string, reason: string) => void;
  removeLeaveException: (id: string) => void;

  // Intake Form Builder actions
  getIntakeTemplateForOffering: (offeringId: string) => IntakeTemplate;
  saveIntakeFields: (offeringId: string, fields: IntakeField[]) => void;

  // Booking actions
  createBooking: (bookingData: {
    offeringId: string;
    therapistId: string;
    date: string;
    timeSlot: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    clientTimezone: string;
    seatsBooked: number;
    currency: "INR" | "USD";
    paymentMethod: PaymentMethod;
    intakeAnswers: Record<string, any>;
  }) => Booking;
  markOfflineBookingPaid: (bookingId: string) => void;
  cancelBooking: (bookingId: string) => void;

  // Blogs actions
  saveBlogPost: (post: Omit<BlogPost, "id"> & { id?: string }) => void;

  // Calculation helpers
  getAvailableSlots: (offeringId: string, therapistId: string, dateStr: string) => string[];
  isDateAvailable: (therapistId: string, dateStr: string) => boolean;

  // Reset
  resetDemoData: () => void;
}

const DemoStoreContext = createContext<DemoStoreContextType | undefined>(undefined);

const STORAGE_KEY = "auro_perfect_vision_demo_store_v1";

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const [offerings, setOfferings] = useState<Offering[]>(INITIAL_OFFERINGS);
  const [therapists, setTherapists] = useState<Therapist[]>(INITIAL_THERAPISTS);
  const [weeklySchedule, setWeeklySchedule] = useState<RecurringScheduleDay[]>(DEFAULT_WEEKLY_SCHEDULE);
  const [leaveExceptions, setLeaveExceptions] = useState<LeaveException[]>(INITIAL_LEAVE_EXCEPTIONS);
  const [intakeTemplates, setIntakeTemplates] = useState<IntakeTemplate[]>(INITIAL_INTAKE_TEMPLATES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_BLOGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync from server-side persistent CMS store
  useEffect(() => {
    async function syncFromServer() {
      try {
        const res = await fetch("/api/public/content");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.offerings) && data.offerings.length > 0) {
            setOfferings(data.offerings);
          }
          if (Array.isArray(data.therapists) && data.therapists.length > 0) {
            setTherapists(data.therapists);
          }
          if (Array.isArray(data.blogs) && data.blogs.length > 0) {
            setBlogs(data.blogs);
          }
        }
      } catch (err) {
        console.warn("Could not sync public content from server:", err);
      }
      setIsLoaded(true);
    }
    syncFromServer();
  }, []);

  const addOffering = (newOff: Omit<Offering, "id">) => {
    const id = `off-${Date.now()}`;
    setOfferings((prev) => [...prev, { ...newOff, id }]);
  };

  const updateOffering = (id: string, data: Partial<Offering>) => {
    setOfferings((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } : o)));
  };

  const deleteOffering = (id: string) => {
    setOfferings((prev) => prev.filter((o) => o.id !== id));
  };

  const updateTherapist = (id: string, data: Partial<Therapist>) => {
    setTherapists((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  };

  const updateDaySchedule = (dayOfWeek: number, data: Partial<RecurringScheduleDay>) => {
    setWeeklySchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...data } : d))
    );
  };

  const addLeaveException = (date: string, reason: string) => {
    const newLeave: LeaveException = {
      id: `leave-${Date.now()}`,
      therapistId: "therapist-1",
      date,
      reason,
      allDay: true,
    };
    setLeaveExceptions((prev) => [...prev, newLeave]);
  };

  const removeLeaveException = (id: string) => {
    setLeaveExceptions((prev) => prev.filter((l) => l.id !== id));
  };

  const getIntakeTemplateForOffering = (offeringId: string): IntakeTemplate => {
    const found = intakeTemplates.find((t) => t.offeringId === offeringId);
    if (found) return found;
    // Return fallback default template if not explicitly defined
    return {
      id: `tpl-${offeringId}`,
      offeringId,
      version: 1,
      isPublished: true,
      fields: [
        {
          id: "f-std-1",
          fieldKey: "client_age",
          label: "Age of Participant",
          fieldType: "number",
          placeholder: "e.g. 28",
          isRequired: true,
          displayOrder: 1,
        },
        {
          id: "f-std-2",
          fieldKey: "primary_eye_concern",
          label: "Primary Vision Concern or Eye Condition",
          fieldType: "select",
          options: [
            "Screen Strain & Digital Fatigue",
            "Dry, Gritty or Burning Eyes",
            "General Vision Wellness & Relaxation",
            "Other",
          ],
          isRequired: true,
          displayOrder: 2,
        },
        {
          id: "f-std-3",
          fieldKey: "medical_history_notes",
          label: "Any eye surgery, trauma, or specific practitioner notes?",
          fieldType: "textarea",
          placeholder: "e.g. Contact lens user, no prior surgeries",
          isRequired: false,
          displayOrder: 3,
        },
      ],
    };
  };

  const saveIntakeFields = (offeringId: string, fields: IntakeField[]) => {
    setIntakeTemplates((prev) => {
      const idx = prev.findIndex((t) => t.offeringId === offeringId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], fields, version: updated[idx].version + 1 };
        return updated;
      } else {
        const newTemplate: IntakeTemplate = {
          id: `tpl-${Date.now()}`,
          offeringId,
          version: 1,
          isPublished: true,
          fields,
        };
        return [...prev, newTemplate];
      }
    });
  };

  const isDateAvailable = (therapistId: string, dateStr: string): boolean => {
    // Check if on leave
    const onLeave = leaveExceptions.some(
      (l) => l.date === dateStr && (l.therapistId === therapistId || l.therapistId === "all")
    );
    if (onLeave) return false;

    // Check weekday schedule
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const daySchedule = weeklySchedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (!daySchedule || !daySchedule.active || daySchedule.slots.length === 0) {
      return false;
    }

    return true;
  };

  const getAvailableSlots = (offeringId: string, therapistId: string, dateStr: string): string[] => {
    if (!isDateAvailable(therapistId, dateStr)) {
      return [];
    }

    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const daySchedule = weeklySchedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (!daySchedule) return [];

    // Synthesize candidate slots based on day's time ranges
    const candidateSlots: string[] = [];
    daySchedule.slots.forEach((range) => {
      const [startH] = range.startTime.split(":").map(Number);
      const [endH] = range.endTime.split(":").map(Number);

      for (let h = startH; h < endH; h++) {
        const startHour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
        const ampm = h >= 12 ? "PM" : "AM";
        const endHourVal = h + 1;
        const endHour12 = endHourVal > 12 ? endHourVal - 12 : endHourVal === 0 ? 12 : endHourVal;
        const endAmpm = endHourVal >= 12 ? "PM" : "AM";

        candidateSlots.push(
          `${startHour12}:00 ${ampm} - ${endHour12}:00 ${endAmpm}`
        );
      }
    });

    // Filter out already booked slots for this therapist and date
    const bookedForSlot = bookings
      .filter(
        (b) =>
          b.therapistId === therapistId &&
          b.date === dateStr &&
          b.status !== "cancelled"
      )
      .map((b) => b.timeSlot);

    return candidateSlots.filter((slot) => !bookedForSlot.includes(slot));
  };

  const createBooking = (bookingData: {
    offeringId: string;
    therapistId: string;
    date: string;
    timeSlot: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    clientTimezone: string;
    seatsBooked: number;
    currency: "INR" | "USD";
    paymentMethod: PaymentMethod;
    intakeAnswers: Record<string, any>;
  }): Booking => {
    const offering = offerings.find((o) => o.id === bookingData.offeringId);
    const therapist = therapists.find((t) => t.id === bookingData.therapistId);
    const ref = generateBookingReference();

    const isOnlinePayment =
      bookingData.paymentMethod === "online_razorpay" ||
      bookingData.paymentMethod === "online_paypal";

    const unitPrice =
      bookingData.currency === "INR"
        ? offering?.price.inr || 2000
        : offering?.price.usd || 45;
    const totalAmount = unitPrice * bookingData.seatsBooked;

    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      bookingReference: ref,
      offeringId: bookingData.offeringId,
      offeringTitle: offering?.title || "Custom Vision Therapy",
      therapistId: bookingData.therapistId,
      therapistName: therapist?.displayName || "Assigned Practitioner",
      date: bookingData.date,
      timeSlot: bookingData.timeSlot,
      clientTimezone: bookingData.clientTimezone,
      clientName: bookingData.clientName,
      clientEmail: bookingData.clientEmail,
      clientPhone: bookingData.clientPhone,
      seatsBooked: bookingData.seatsBooked,
      currency: bookingData.currency,
      totalAmount,
      status: isOnlinePayment ? "confirmed" : "pending_offline_confirmation",
      paymentMethod: bookingData.paymentMethod,
      paymentStatus: isOnlinePayment ? "captured" : "pending",
      intakeAnswers: bookingData.intakeAnswers,
      invoiceIssued: isOnlinePayment,
      invoiceNumber: isOnlinePayment ? generateInvoiceNumber(bookings.length + 1) : undefined,
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Persist to server store asynchronously
    fetch("/api/public/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBooking),
    }).catch((err) => console.warn("Failed to persist booking to server:", err));

    return newBooking;
  };

  const markOfflineBookingPaid = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const invNum = b.invoiceNumber || generateInvoiceNumber(prev.length + 1);
          return {
            ...b,
            status: "confirmed" as BookingStatus,
            paymentStatus: "offline_confirmed",
            offlineConfirmedByStaff: "Admin (Front Desk)",
            offlineConfirmedAt: new Date().toISOString(),
            invoiceIssued: true,
            invoiceNumber: invNum,
          };
        }
        return b;
      })
    );
  };

  const cancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
    );
  };

  const saveBlogPost = (postData: Omit<BlogPost, "id"> & { id?: string }) => {
    if (postData.id) {
      setBlogs((prev) =>
        prev.map((b) => (b.id === postData.id ? ({ ...b, ...postData } as BlogPost) : b))
      );
    } else {
      const newPost: BlogPost = {
        ...postData,
        id: `blog-${Date.now()}`,
      };
      setBlogs((prev) => [newPost, ...prev]);
    }
  };

  const resetDemoData = () => {
    setOfferings(INITIAL_OFFERINGS);
    setTherapists(INITIAL_THERAPISTS);
    setWeeklySchedule(DEFAULT_WEEKLY_SCHEDULE);
    setLeaveExceptions(INITIAL_LEAVE_EXCEPTIONS);
    setIntakeTemplates(INITIAL_INTAKE_TEMPLATES);
    setBookings(INITIAL_BOOKINGS);
    setBlogs(INITIAL_BLOGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  return (
    <DemoStoreContext.Provider
      value={{
        offerings,
        therapists,
        weeklySchedule,
        leaveExceptions,
        intakeTemplates,
        bookings,
        blogs,
        addOffering,
        updateOffering,
        deleteOffering,
        updateTherapist,
        updateDaySchedule,
        addLeaveException,
        removeLeaveException,
        getIntakeTemplateForOffering,
        saveIntakeFields,
        createBooking,
        markOfflineBookingPaid,
        cancelBooking,
        saveBlogPost,
        getAvailableSlots,
        isDateAvailable,
        resetDemoData,
      }}
    >
      {children}
    </DemoStoreContext.Provider>
  );
}

export function useDemoStore() {
  const context = useContext(DemoStoreContext);
  if (!context) {
    throw new Error("useDemoStore must be used within a DemoStoreProvider");
  }
  return context;
}
