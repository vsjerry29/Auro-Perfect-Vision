"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Tag,
  User,
  Shield,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit,
  Archive,
  CreditCard,
  CheckSquare,
  HelpCircle,
  Send,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  ClientContact,
  CrmInquiry,
  CrmTask,
  CrmNote,
  CrmActivity,
} from "@/lib/types/crm";
import { Booking, Offering, Therapist } from "@/lib/types";

export default function Client360Page() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<ClientContact | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<CrmInquiry[]>([]);
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [notes, setNotes] = useState<CrmNote[]>([]);
  const [activities, setActivities] = useState<CrmActivity[]>([]);

  // Metadata for manual booking
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);

  // Active Tab
  type TabType = "activities" | "bookings" | "inquiries" | "tasks" | "notes" | "billing";
  const [activeTab, setActiveTab] = useState<TabType>("activities");

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showIntakeModal, setShowIntakeModal] = useState<Booking | null>(null);

  // Form states
  const [editFormData, setEditFormData] = useState<Partial<ClientContact>>({});
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState<"general" | "call_log" | "preference" | "scheduling">("general");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // New task form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [taskDescription, setTaskDescription] = useState("");
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Manual booking form state
  const [bookingOfferingId, setBookingOfferingId] = useState("");
  const [bookingTherapistId, setBookingTherapistId] = useState("");
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split("T")[0]);
  const [bookingTimeSlot, setBookingTimeSlot] = useState("10:00 AM - 11:00 AM");
  const [bookingPaymentMethod, setBookingPaymentMethod] = useState("cash_on_arrival");
  const [bookingPaymentStatus, setBookingPaymentStatus] = useState("pending_verification");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/crm/clients/${clientId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Client profile not found");
        throw new Error("Failed to load client details");
      }
      const data = await res.json();
      setClient(data.client);
      setBookings(data.bookings || []);
      setInquiries(data.inquiries || []);
      setTasks(data.tasks || []);
      setNotes(data.notes || []);
      setActivities(data.activities || []);
      setEditFormData(data.client);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalog = async () => {
    try {
      const res = await fetch("/api/public/content");
      if (res.ok) {
        const data = await res.json();
        setOfferings(data.offerings || []);
        setTherapists(data.therapists || []);
        if (data.offerings?.length > 0) setBookingOfferingId(data.offerings[0].id);
        if (data.therapists?.length > 0) setBookingTherapistId(data.therapists[0].id);
      }
    } catch {}
  };

  useEffect(() => {
    if (clientId) {
      fetchClientData();
      fetchCatalog();
    }
  }, [clientId]);

  // Handle Note Submission
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !client) return;

    try {
      setIsSubmittingNote(true);
      const res = await fetch("/api/admin/crm/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: client.id,
          content: newNoteContent,
          category: newNoteCategory,
        }),
      });

      if (!res.ok) throw new Error("Failed to save note");
      setNewNoteContent("");
      await fetchClientData();
    } catch (err: any) {
      alert(err.message || "Could not save note");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Handle Task Creation
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !client) return;

    try {
      setIsSubmittingTask(true);
      const res = await fetch("/api/admin/crm/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientContactId: client.id,
          clientName: client.fullName,
          title: taskTitle,
          description: taskDescription,
          dueDate: taskDueDate,
          priority: taskPriority,
          status: "pending",
        }),
      });

      if (!res.ok) throw new Error("Failed to create task");
      setShowTaskModal(false);
      setTaskTitle("");
      setTaskDescription("");
      await fetchClientData();
    } catch (err: any) {
      alert(err.message || "Could not create task");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Handle Task Toggle
  const handleToggleTask = async (taskId: string) => {
    try {
      const res = await fetch("/api/admin/crm/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, action: "toggle" }),
      });
      if (res.ok) {
        await fetchClientData();
      }
    } catch (err) {
      console.error("Failed to toggle task", err);
    }
  };

  // Handle Client Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    try {
      const res = await fetch(`/api/admin/crm/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (!res.ok) throw new Error("Failed to update client details");
      setShowEditModal(false);
      await fetchClientData();
    } catch (err: any) {
      alert(err.message || "Could not save client changes");
    }
  };

  // Handle Archive Client
  const handleArchiveClient = async () => {
    if (!client) return;
    if (!confirm(`Are you sure you want to archive ${client.fullName}? They will be marked as archived.`)) return;

    try {
      const res = await fetch(`/api/admin/crm/clients/${client.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to archive client");
      await fetchClientData();
    } catch (err: any) {
      alert(err.message || "Could not archive client");
    }
  };

  // Handle Inquiry Stage Change
  const handleUpdateInquiryStage = async (inquiryId: string, newStage: string) => {
    try {
      const res = await fetch("/api/admin/crm/inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inquiryId, stage: newStage }),
      });
      if (res.ok) {
        await fetchClientData();
      }
    } catch (err) {
      console.error("Failed to update inquiry", err);
    }
  };

  // Handle Manual Booking Submission
  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    const chosenOffering = offerings.find((o) => o.id === bookingOfferingId) || offerings[0];
    const chosenTherapist = therapists.find((t) => t.id === bookingTherapistId) || therapists[0];

    if (!chosenOffering || !chosenTherapist) {
      alert("Please select offering and practitioner");
      return;
    }

    try {
      setIsSubmittingBooking(true);
      const bookingRef = `APV-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const newBooking: Partial<Booking> = {
        id: `booking-${Date.now()}`,
        bookingReference: bookingRef,
        offeringId: chosenOffering.id,
        offeringTitle: chosenOffering.title,
        therapistId: chosenTherapist.id,
        therapistName: chosenTherapist.displayName,
        date: bookingDate,
        timeSlot: bookingTimeSlot,
        clientTimezone: "Asia/Kolkata",
        clientName: client.fullName,
        clientEmail: client.email,
        clientPhone: client.phone,
        seatsBooked: 1,
        currency: "INR",
        totalAmount: chosenOffering.price?.inr || (chosenOffering as any).priceINR || 3500,
        status: "confirmed",
        paymentMethod: (bookingPaymentMethod as any) || "offline_cash",
        paymentStatus: (bookingPaymentStatus as any) || "offline_confirmed",
        intakeAnswers: {
          clientNote: "Admin manual booking via CRM Console",
          medicalDisclosures: "Recorded directly by front-desk staff.",
        },
        invoiceIssued: true,
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
      };

      const res = await fetch("/api/public/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      });

      if (!res.ok) throw new Error("Failed to create manual appointment");
      setShowBookingModal(false);
      await fetchClientData();
      setActiveTab("bookings");
    } catch (err: any) {
      alert(err.message || "Failed to create manual booking");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-plum border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-sans text-ink-muted">Loading Client 360 Profile...</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Link
          href="/admin/crm"
          className="inline-flex items-center gap-2 text-xs font-sans text-plum hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clients Directory
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <h2 className="font-serif text-xl font-medium text-ink mb-2">Client Not Found</h2>
          <p className="text-sm font-sans text-ink-muted mb-4">
            {error || "The requested client record does not exist or has been removed."}
          </p>
          <button
            onClick={() => router.push("/admin/crm")}
            className="px-4 py-2 bg-plum text-white text-xs font-sans rounded-md hover:bg-plum-light"
          >
            Return to CRM Directory
          </button>
        </div>
      </div>
    );
  }

  const cleanPhoneForWa = client.phone ? client.phone.replace(/[^0-9]/g, "") : "";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-ink-border">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/crm"
            className="p-1.5 text-ink-muted hover:text-plum rounded-lg hover:bg-white border border-transparent hover:border-ink-border transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-gold-dark bg-gold/10 px-2 py-0.5 rounded">
                {client.clientReference}
              </span>
              <span
                className={`text-[11px] font-sans font-medium px-2 py-0.5 rounded-full capitalize ${
                  client.status === "active"
                    ? "bg-emerald-100 text-emerald-800"
                    : client.status === "vip"
                    ? "bg-purple-100 text-purple-800"
                    : client.status === "lead"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-ink-muted/10 text-ink-muted"
                }`}
              >
                {client.status}
              </span>
            </div>
            <h1 className="font-serif text-2xl font-medium text-ink mt-0.5">
              {client.fullName}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowBookingModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-plum text-white rounded-md text-xs font-sans hover:bg-plum-light transition-colors shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5" /> + New Booking
          </button>
          <button
            onClick={() => setShowTaskModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-ink-border text-ink rounded-md text-xs font-sans hover:bg-ivory transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5 text-gold-dark" /> + Add Task
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-ink-border text-ink rounded-md text-xs font-sans hover:bg-ivory transition-colors"
          >
            <Edit className="w-3.5 h-3.5 text-ink-muted" /> Edit Details
          </button>
          <button
            onClick={handleArchiveClient}
            className="p-1.5 bg-white border border-ink-border text-ink-muted hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
            title="Archive Client"
          >
            <Archive className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Client Overview Card */}
      <div className="bg-white rounded-xl border border-ink-border p-5 lg:p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Contact Details */}
          <div className="space-y-3">
            <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
              Contact Channels
            </span>
            <div className="space-y-2 text-xs font-sans">
              <div className="flex items-center gap-2 text-ink">
                <Mail className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                <a href={`mailto:${client.email}`} className="text-plum hover:underline truncate">
                  {client.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-ink">
                <Phone className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                <a href={`tel:${client.phone}`} className="hover:underline">
                  {client.phone || "No phone provided"}
                </a>
                {cleanPhoneForWa && (
                  <a
                    href={`https://wa.me/${cleanPhoneForWa}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100"
                    title="Open WhatsApp chat"
                  >
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{client.locality || "Locality not recorded"}</span>
              </div>
            </div>
          </div>

          {/* Profile & Acquisition */}
          <div className="space-y-3">
            <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
              Source & Preferences
            </span>
            <div className="space-y-1.5 text-xs font-sans">
              <div className="flex justify-between py-0.5 border-b border-ink-border/50">
                <span className="text-ink-muted">Acquisition Source:</span>
                <span className="font-medium text-ink capitalize">{client.source.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-ink-border/50">
                <span className="text-ink-muted">Preferred Channel:</span>
                <span className="font-medium text-ink capitalize">{client.preferredChannel}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-ink-muted">Assigned Practitioner:</span>
                <span className="font-medium text-plum">{client.assignedStaffName || "Front Desk Team"}</span>
              </div>
            </div>
          </div>

          {/* Visit & Activity Metrics */}
          <div className="space-y-3">
            <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
              Engagement Metrics
            </span>
            <div className="space-y-1.5 text-xs font-sans">
              <div className="flex justify-between py-0.5 border-b border-ink-border/50">
                <span className="text-ink-muted">Total Appointments:</span>
                <span className="font-semibold text-ink">{client.totalBookings || bookings.length}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-ink-border/50">
                <span className="text-ink-muted">First Visit:</span>
                <span className="text-ink">{client.firstBookingDate || "None"}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-ink-muted">Last Visit:</span>
                <span className="text-ink">{client.lastBookingDate || "None"}</span>
              </div>
            </div>
          </div>

          {/* Lifetime Spend */}
          <div className="space-y-3 bg-ivory/60 p-3.5 rounded-lg border border-ink-border/60">
            <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-gold-dark block">
              Lifetime Value
            </span>
            <div className="space-y-1">
              <div className="font-serif text-2xl font-medium text-plum">
                ₹{(client.totalSpentINR || 0).toLocaleString("en-IN")}
              </div>
              <div className="text-xs font-mono text-ink-muted">
                ${client.totalSpentUSD || 0} USD
              </div>
              <div className="pt-2 text-[11px] text-ink-muted flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Consent Given: {client.consentGiven ? "Yes (GDPR/APV)" : "Pending"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tags Row */}
        {client.tags && client.tags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-ink-border/60 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-sans text-ink-muted flex items-center gap-1">
              <Tag className="w-3 h-3" /> Tags:
            </span>
            {client.tags.map((t, idx) => (
              <span
                key={idx}
                className="text-[11px] font-sans bg-plum-muted/60 text-plum px-2.5 py-0.5 rounded-full border border-plum/10"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-ink-border flex gap-2 overflow-x-auto">
        {[
          { id: "activities", label: "Timeline & Activity", count: activities.length },
          { id: "bookings", label: "Appointments", count: bookings.length },
          { id: "inquiries", label: "Inquiries & Leads", count: inquiries.length },
          { id: "tasks", label: "Follow-up Tasks", count: tasks.filter((t) => t.status === "pending").length },
          { id: "notes", label: "Internal Notes", count: notes.length },
          { id: "billing", label: "Invoices & Billing", count: bookings.filter((b) => b.invoiceIssued).length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-4 py-2.5 text-xs font-sans font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "border-plum text-plum bg-plum-muted/30"
                : "border-transparent text-ink-muted hover:text-ink hover:border-ink-border"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === tab.id ? "bg-plum text-white" : "bg-ink-border text-ink-muted"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Activities / Timeline */}
      {activeTab === "activities" && (
        <div className="bg-white rounded-xl border border-ink-border p-6 shadow-sm">
          <h2 className="font-serif text-lg font-medium text-ink mb-4">Complete Client Journey Timeline</h2>
          {activities.length === 0 ? (
            <p className="text-xs text-ink-muted py-8 text-center">No recorded activity yet for this client.</p>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-ink-border">
              {activities.map((act) => (
                <div key={act.id} className="relative group">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-plum border-2 border-white ring-2 ring-plum/20" />
                  <div className="bg-ivory/40 p-3.5 rounded-lg border border-ink-border/60">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-sans font-semibold text-ink">{act.title}</span>
                      <span className="text-[11px] font-mono text-ink-muted">
                        {new Date(act.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <p className="text-xs font-sans text-ink-muted">{act.description}</p>
                    {act.staffName && (
                      <span className="text-[10px] font-sans text-gold-dark block mt-1">
                        Logged by {act.staffName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Bookings */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-medium text-ink">
              Appointments History ({bookings.length})
            </h2>
            <button
              onClick={() => setShowBookingModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-plum text-white rounded-md text-xs font-sans hover:bg-plum-light"
            >
              <Plus className="w-3.5 h-3.5" /> Book Session
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-xl border border-ink-border p-8 text-center text-ink-muted text-xs">
              No appointments booked yet. Click "+ Book Session" to schedule an appointment.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-ink-border overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-ivory border-b border-ink-border text-ink-muted font-medium">
                    <tr>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">Session / Therapy</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Practitioner</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4 text-right">Intake Form</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-border">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-ivory/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-plum">
                          {b.bookingReference}
                        </td>
                        <td className="py-3 px-4 font-medium text-ink">
                          {b.offeringTitle}
                        </td>
                        <td className="py-3 px-4 text-ink-muted">
                          <div>{b.date}</div>
                          <div className="text-[11px] text-ink-muted/80">{b.timeSlot}</div>
                        </td>
                        <td className="py-3 px-4 text-ink">
                          {b.therapistName}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                              b.status === "confirmed"
                                ? "bg-emerald-100 text-emerald-800"
                                : b.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : b.status === "pending_offline_confirmation"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {b.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-ink">
                          ₹{b.totalAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] capitalize ${
                              b.paymentStatus === "captured" || b.paymentStatus === "offline_confirmed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {b.paymentStatus.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setShowIntakeModal(b)}
                            className="inline-flex items-center gap-1 text-[11px] text-plum hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5" /> View Form
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Inquiries */}
      {activeTab === "inquiries" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-medium text-ink">
              Inquiries & Communication History ({inquiries.length})
            </h2>
          </div>

          {inquiries.length === 0 ? (
            <div className="bg-white rounded-xl border border-ink-border p-8 text-center text-ink-muted text-xs">
              No inquiries logged for this client yet.
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div key={inq.id} className="bg-white rounded-xl border border-ink-border p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-ink-border/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-medium text-gold-dark bg-gold/10 px-2 py-0.5 rounded">
                          {inq.reference}
                        </span>
                        <span className="text-xs font-medium text-plum bg-plum-muted/60 px-2 py-0.5 rounded">
                          {inq.category}
                        </span>
                      </div>
                      <h3 className="font-serif text-base font-medium text-ink mt-1">{inq.subject}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-ink-muted">Stage:</span>
                      <select
                        value={inq.stage}
                        onChange={(e) => handleUpdateInquiryStage(inq.id, e.target.value)}
                        className="text-xs bg-ivory border border-ink-border rounded px-2 py-1 text-ink focus:outline-none"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="follow_up">Follow Up</option>
                        <option value="booked">Booked</option>
                        <option value="closed_not_interested">Closed</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-3">
                    <p className="text-xs font-sans text-ink leading-relaxed whitespace-pre-wrap bg-ivory/40 p-3 rounded-lg border border-ink-border/50">
                      {inq.message}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-ink-muted mt-2 pt-2">
                      <span>Source: {inq.source.replace("_", " ")}</span>
                      <span>Received: {new Date(inq.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Tasks */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-medium text-ink">
              Follow-up Action Tasks ({tasks.length})
            </h2>
            <button
              onClick={() => setShowTaskModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-plum text-white rounded-md text-xs font-sans hover:bg-plum-light"
            >
              <Plus className="w-3.5 h-3.5" /> + New Task
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-ink-border p-8 text-center text-ink-muted text-xs">
              No pending tasks. Click "+ New Task" to schedule a follow-up call, intake review, or reminder.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-ink-border divide-y divide-ink-border shadow-sm">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 flex items-start gap-3 hover:bg-ivory/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={task.status === "completed"}
                    onChange={() => handleToggleTask(task.id)}
                    className="mt-1 w-4 h-4 rounded text-plum border-ink-border focus:ring-plum cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium font-sans ${
                          task.status === "completed" ? "line-through text-ink-muted" : "text-ink"
                        }`}
                      >
                        {task.title}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-sans uppercase font-medium ${
                          task.priority === "urgent"
                            ? "bg-red-100 text-red-800"
                            : task.priority === "high"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-ink-muted/10 text-ink-muted"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-ink-muted mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-[11px] text-ink-muted mt-1.5">
                      <span>Due: {task.dueDate}</span>
                      <span>Assigned to: {task.assignedStaffName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Internal Administrative Notes */}
      {activeTab === "notes" && (
        <div className="space-y-6">
          {/* Add Note Form */}
          <div className="bg-white rounded-xl border border-ink-border p-5 shadow-sm">
            <h3 className="font-serif text-base font-medium text-ink mb-3">Add Internal Administrative Note</h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <div className="flex gap-3">
                <select
                  value={newNoteCategory}
                  onChange={(e: any) => setNewNoteCategory(e.target.value)}
                  className="text-xs bg-ivory border border-ink-border rounded px-3 py-2 text-ink focus:outline-none"
                >
                  <option value="general">General Note</option>
                  <option value="call_log">Call Log</option>
                  <option value="preference">Client Preference</option>
                  <option value="scheduling">Scheduling Notice</option>
                </select>
              </div>
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Record clinical intake observations, follow-up call outcomes, or specific client accommodation preferences..."
                rows={3}
                className="w-full text-xs font-sans p-3 border border-ink-border rounded-lg bg-ivory/30 focus:outline-none focus:border-plum"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingNote || !newNoteContent.trim()}
                  className="px-4 py-2 bg-plum text-white text-xs font-sans rounded-md hover:bg-plum-light disabled:opacity-50"
                >
                  {isSubmittingNote ? "Saving..." : "Add Note"}
                </button>
              </div>
            </form>
          </div>

          {/* Notes List */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-medium text-ink">
              Confidential Staff Notes ({notes.length})
            </h3>
            {notes.length === 0 ? (
              <p className="text-xs text-ink-muted">No notes recorded yet.</p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="bg-white rounded-xl border border-ink-border p-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-ink-border/50">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-ink">{note.authorStaffName}</span>
                      <span className="text-[10px] text-ink-muted">({note.authorStaffRole})</span>
                      <span className="text-[10px] font-sans uppercase bg-plum-muted/60 text-plum px-1.5 py-0.5 rounded">
                        {note.category.replace("_", " ")}
                      </span>
                    </div>
                    <span className="text-[11px] text-ink-muted">
                      {new Date(note.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-ink mt-2 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Billing & Invoices */}
      {activeTab === "billing" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-ink-border p-5 shadow-sm">
            <h3 className="font-serif text-base font-medium text-ink mb-3">Lifetime Invoices & Receipts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-ivory p-4 rounded-lg border border-ink-border/70">
                <span className="text-xs text-ink-muted block">Total Paid in INR</span>
                <span className="font-serif text-2xl font-medium text-plum">
                  ₹{(client.totalSpentINR || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="bg-ivory p-4 rounded-lg border border-ink-border/70">
                <span className="text-xs text-ink-muted block">Total Paid in USD</span>
                <span className="font-serif text-2xl font-medium text-gold-dark">
                  ${client.totalSpentUSD || 0} USD
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-ivory border-b border-ink-border text-ink-muted font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Invoice Number</th>
                    <th className="py-2.5 px-3">Appointment</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Payment Method</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-border">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-ivory/50">
                      <td className="py-2.5 px-3 font-mono font-medium text-plum">
                        {b.invoiceNumber || `INV-${b.bookingReference}`}
                      </td>
                      <td className="py-2.5 px-3">{b.offeringTitle}</td>
                      <td className="py-2.5 px-3 text-ink-muted">{b.date}</td>
                      <td className="py-2.5 px-3 font-mono font-medium">
                        ₹{b.totalAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 capitalize">
                        {b.paymentMethod.replace(/_/g, " ")}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] capitalize ${
                            b.paymentStatus === "captured" || b.paymentStatus === "offline_confirmed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {b.paymentStatus.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT CLIENT ================= */}
      {showEditModal && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-ink-border max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-lg font-medium text-ink">Edit Client Profile</h3>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-ink-muted mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFormData.fullName || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-muted mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.email || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-ink-muted mb-1">Phone</label>
                  <input
                    type="text"
                    value={editFormData.phone || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-muted mb-1">Locality / City</label>
                  <input
                    type="text"
                    value={editFormData.locality || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, locality: e.target.value })}
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-ink-muted mb-1">Status</label>
                  <select
                    value={editFormData.status || "active"}
                    onChange={(e: any) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none capitalize"
                  >
                    <option value="lead">Lead</option>
                    <option value="active">Active</option>
                    <option value="vip">VIP</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-ink-muted mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={(editFormData.tags || []).join(", ")}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                  placeholder="e.g. Eye Yoga, International Guest, Digital Strain"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-ink-border">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-ink-border rounded text-ink hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-plum text-white rounded hover:bg-plum-light"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: NEW MANUAL BOOKING ================= */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-ink-border max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-ink-border">
              <h3 className="font-serif text-lg font-medium text-ink">
                Schedule Appointment for {client.fullName}
              </h3>
              <button onClick={() => setShowBookingModal(false)} className="text-ink-muted hover:text-ink text-sm">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateManualBooking} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-ink-muted mb-1 font-medium">Therapy / Programme</label>
                <select
                  value={bookingOfferingId}
                  onChange={(e) => setBookingOfferingId(e.target.value)}
                  className="w-full p-2.5 border border-ink-border rounded bg-ivory/30 text-ink focus:outline-none"
                  required
                >
                  {offerings.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.title} ({off.durationMinutes} mins) — ₹{(off.price?.inr || (off as any).priceINR || 0).toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">Vision Wellness Practitioner</label>
                <select
                  value={bookingTherapistId}
                  onChange={(e) => setBookingTherapistId(e.target.value)}
                  className="w-full p-2.5 border border-ink-border rounded bg-ivory/30 text-ink focus:outline-none"
                  required
                >
                  {therapists.map((th) => (
                    <option key={th.id} value={th.id}>
                      {th.displayName} ({th.roleTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Time Slot</label>
                  <select
                    value={bookingTimeSlot}
                    onChange={(e) => setBookingTimeSlot(e.target.value)}
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                  >
                    <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="11:30 AM - 12:30 PM">11:30 AM - 12:30 PM</option>
                    <option value="02:30 PM - 03:30 PM">02:30 PM - 03:30 PM</option>
                    <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Payment Method</label>
                  <select
                    value={bookingPaymentMethod}
                    onChange={(e) => setBookingPaymentMethod(e.target.value)}
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none capitalize"
                  >
                    <option value="cash_on_arrival">Cash on Arrival (Auroville)</option>
                    <option value="upi_manual">UPI / QR (Direct Counter)</option>
                    <option value="bank_transfer">Direct Bank Transfer</option>
                    <option value="direct_pos">Direct POS / Card Counter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Payment Status</label>
                  <select
                    value={bookingPaymentStatus}
                    onChange={(e) => setBookingPaymentStatus(e.target.value)}
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none capitalize"
                  >
                    <option value="pending_verification">Pending Verification</option>
                    <option value="paid">Paid & Settled</option>
                  </select>
                </div>
              </div>

              <div className="bg-ivory/60 p-3 rounded-lg border border-ink-border/50 text-[11px] text-ink-muted">
                This manual booking automatically associates with {client.fullName} ({client.email}) and will appear in both the Master Calendar and Practitioner Schedule.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 border border-ink-border rounded text-ink hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="px-4 py-2 bg-plum text-white rounded hover:bg-plum-light disabled:opacity-50"
                >
                  {isSubmittingBooking ? "Scheduling..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD TASK ================= */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-ink-border max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-lg font-medium text-ink">
              Create Task for {client.fullName}
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-ink-muted mb-1">Task Title</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Follow up on retreat dates via WhatsApp"
                  className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-muted mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-ink-muted mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e: any) => setTaskPriority(e.target.value)}
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none capitalize"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-ink-muted mb-1">Description (Optional)</label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Additional context or phone conversation summary..."
                  rows={2}
                  className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 border border-ink-border rounded text-ink hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTask || !taskTitle.trim()}
                  className="px-4 py-2 bg-plum text-white rounded hover:bg-plum-light disabled:opacity-50"
                >
                  {isSubmittingTask ? "Saving..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW INTAKE FORM ================= */}
      {showIntakeModal && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-ink-border max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-ink-border">
              <div>
                <h3 className="font-serif text-lg font-medium text-ink">
                  Intake Questionnaire
                </h3>
                <span className="text-xs font-mono text-gold-dark">
                  Booking: {showIntakeModal.bookingReference} — {showIntakeModal.offeringTitle}
                </span>
              </div>
              <button
                onClick={() => setShowIntakeModal(null)}
                className="text-ink-muted hover:text-ink text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              {showIntakeModal.intakeAnswers && Object.keys(showIntakeModal.intakeAnswers).length > 0 ? (
                Object.entries(showIntakeModal.intakeAnswers).map(([key, value]) => (
                  <div key={key} className="bg-ivory/50 p-3 rounded-lg border border-ink-border/50">
                    <span className="text-[11px] font-semibold text-ink-muted uppercase block capitalize mb-0.5">
                      {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
                    </span>
                    <span className="text-ink whitespace-pre-wrap">
                      {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-ink-muted">
                  No structured intake responses submitted for this appointment.
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowIntakeModal(null)}
                className="px-4 py-2 bg-plum text-white rounded text-xs hover:bg-plum-light"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
