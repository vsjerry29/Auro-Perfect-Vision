"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
} from "lucide-react";
import { CrmInquiry, InquiryStage, InquiryCategory } from "@/lib/types/crm";

export default function CrmInquiriesPage() {
  const [inquiries, setInquiries] = useState<CrmInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Selected Inquiry for Modal
  const [selectedInquiry, setSelectedInquiry] = useState<CrmInquiry | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // New Inquiry Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newInquiryForm, setNewInquiryForm] = useState<{
    name: string;
    email: string;
    phone: string;
    subject: string;
    category: InquiryCategory;
    message: string;
    priority: "low" | "medium" | "high" | "urgent";
    source: "phone" | "walk_in" | "referral" | "contact_form";
  }>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "General Inquiry",
    message: "",
    priority: "medium",
    source: "phone",
  });
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/crm/inquiries");
      if (!res.ok) throw new Error("Failed to load inquiries");
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (err: any) {
      setError(err.message || "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStageChange = async (inquiryId: string, newStage: InquiryStage) => {
    try {
      const res = await fetch("/api/admin/crm/inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inquiryId, stage: newStage }),
      });
      if (!res.ok) throw new Error("Failed to update stage");
      await fetchInquiries();
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry((prev) => (prev ? { ...prev, stage: newStage } : null));
      }
    } catch (err: any) {
      alert(err.message || "Failed to change stage");
    }
  };

  const handleSaveInternalNotes = async () => {
    if (!selectedInquiry) return;
    try {
      setIsSavingNotes(true);
      const res = await fetch("/api/admin/crm/inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedInquiry.id, internalNotes: editingNotes }),
      });
      if (!res.ok) throw new Error("Failed to update notes");
      await fetchInquiries();
      setSelectedInquiry((prev) => (prev ? { ...prev, internalNotes: editingNotes } : null));
    } catch (err: any) {
      alert(err.message || "Could not save notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingNew(true);
      const res = await fetch("/api/admin/crm/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInquiryForm),
      });

      if (!res.ok) throw new Error("Failed to log inquiry");
      setShowNewModal(false);
      setNewInquiryForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        category: "General Inquiry",
        message: "",
        priority: "medium",
        source: "phone",
      });
      await fetchInquiries();
    } catch (err: any) {
      alert(err.message || "Could not log inquiry");
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // Filtered inquiries
  const filtered = inquiries.filter((inq) => {
    if (stageFilter !== "all" && inq.stage !== stageFilter) return false;
    if (categoryFilter !== "all" && inq.category !== categoryFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = inq.name.toLowerCase().includes(q);
      const matchEmail = inq.email.toLowerCase().includes(q);
      const matchSubject = inq.subject.toLowerCase().includes(q);
      const matchRef = inq.reference.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchSubject && !matchRef) return false;
    }
    return true;
  });

  // Pipeline Counts
  const counts = {
    new: inquiries.filter((i) => i.stage === "new").length,
    contacted: inquiries.filter((i) => i.stage === "contacted").length,
    follow_up: inquiries.filter((i) => i.stage === "follow_up").length,
    booked: inquiries.filter((i) => i.stage === "booked").length,
    closed: inquiries.filter((i) => i.stage === "closed_not_interested").length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-ink-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-medium text-gold-dark uppercase tracking-wider">
              Auro Perfect Vision CRM
            </span>
            <span className="text-xs text-ink-muted">•</span>
            <span className="text-xs font-sans text-plum font-medium">Guest Inquiries Pipeline</span>
          </div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-ink">
            Inquiries & Guest Leads
          </h1>
          <p className="text-xs font-sans text-ink-muted mt-0.5">
            Incoming contact form queries, residential retreat requests, and phone inquiries.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-plum text-white rounded-md text-xs font-sans hover:bg-plum-light transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" /> Log Phone / Front-Desk Inquiry
        </button>
      </div>

      {/* Pipeline Stage KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { key: "new", label: "New Leads", count: counts.new, bg: "bg-blue-50 border-blue-200 text-blue-900" },
          { key: "contacted", label: "Contacted", count: counts.contacted, bg: "bg-amber-50 border-amber-200 text-amber-900" },
          { key: "follow_up", label: "Follow Up", count: counts.follow_up, bg: "bg-purple-50 border-purple-200 text-purple-900" },
          { key: "booked", label: "Converted / Booked", count: counts.booked, bg: "bg-emerald-50 border-emerald-200 text-emerald-900" },
          { key: "closed_not_interested", label: "Closed", count: counts.closed, bg: "bg-gray-50 border-gray-200 text-gray-700" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setStageFilter(stageFilter === item.key ? "all" : item.key)}
            className={`p-3 rounded-xl border text-left transition-all ${item.bg} ${
              stageFilter === item.key ? "ring-2 ring-plum shadow-sm" : "opacity-90 hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-sans font-medium uppercase tracking-wider">{item.label}</span>
              <span className="font-serif text-lg font-bold">{item.count}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-xl border border-ink-border p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by guest name, email, subject, or INQ reference..."
            className="w-full pl-9 pr-4 py-2 border border-ink-border rounded-lg text-xs font-sans bg-ivory/30 focus:outline-none focus:border-plum"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Stage Dropdown */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-xs bg-ivory border border-ink-border rounded-lg px-3 py-2 text-ink focus:outline-none"
          >
            <option value="all">All Stages</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="follow_up">Follow Up</option>
            <option value="booked">Booked</option>
            <option value="closed_not_interested">Closed</option>
          </select>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-ivory border border-ink-border rounded-lg px-3 py-2 text-ink focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Natural Vision Therapy">Natural Vision Therapy</option>
            <option value="Digital Eye Strain">Digital Eye Strain</option>
            <option value="7-Day Residential Retreat">7-Day Residential Retreat</option>
            <option value="Booking Assistance">Booking Assistance</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Inquiries List / Table */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-plum border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-ink-muted font-sans">Loading Inquiries & Leads...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-ink-border p-12 text-center">
          <MessageSquare className="w-10 h-10 text-ink-muted/40 mx-auto mb-3" />
          <h3 className="font-serif text-base font-medium text-ink mb-1">No Inquiries Found</h3>
          <p className="text-xs font-sans text-ink-muted">
            {searchTerm || stageFilter !== "all" || categoryFilter !== "all"
              ? "No inquiries match your active filter criteria."
              : "No guest inquiries received yet. When visitors fill the Contact form, they appear here."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-ink-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-ivory border-b border-ink-border text-ink-muted font-medium">
                <tr>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Guest Details</th>
                  <th className="py-3 px-4">Subject & Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-border">
                {filtered.map((inq) => {
                  const cleanPhone = inq.phone ? inq.phone.replace(/[^0-9]/g, "") : "";
                  return (
                    <tr key={inq.id} className="hover:bg-ivory/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-gold-dark">
                        {inq.reference}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-ink">{inq.name}</div>
                        <div className="text-[11px] text-ink-muted flex items-center gap-2 mt-0.5">
                          <a href={`mailto:${inq.email}`} className="hover:text-plum truncate max-w-[140px]">
                            {inq.email}
                          </a>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 hover:text-emerald-800"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 inline" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-ink truncate max-w-xs">{inq.subject}</div>
                        <span className="inline-block text-[10px] font-sans bg-plum-muted/60 text-plum px-1.5 py-0.2 rounded mt-0.5">
                          {inq.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-ink-muted">
                        {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-sans font-medium px-1.5 py-0.5 rounded capitalize ${
                            inq.priority === "urgent"
                              ? "bg-red-100 text-red-800"
                              : inq.priority === "high"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-ink-border text-ink-muted"
                          }`}
                        >
                          {inq.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={inq.stage}
                          onChange={(e) => handleStageChange(inq.id, e.target.value as InquiryStage)}
                          className={`text-[11px] font-sans font-medium rounded px-2 py-1 border focus:outline-none capitalize ${
                            inq.stage === "new"
                              ? "bg-blue-50 border-blue-200 text-blue-800"
                              : inq.stage === "contacted"
                              ? "bg-amber-50 border-amber-200 text-amber-800"
                              : inq.stage === "follow_up"
                              ? "bg-purple-50 border-purple-200 text-purple-800"
                              : inq.stage === "booked"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                              : "bg-gray-50 border-gray-200 text-gray-700"
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="follow_up">Follow Up</option>
                          <option value="booked">Booked</option>
                          <option value="closed_not_interested">Closed</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedInquiry(inq);
                            setEditingNotes(inq.internalNotes || "");
                          }}
                          className="px-2.5 py-1 text-xs text-plum hover:bg-plum-muted/60 rounded border border-plum/20 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: INQUIRY DETAILS & NOTES ================= */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-ink-border max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-ink-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-gold-dark bg-gold/10 px-2 py-0.5 rounded">
                    {selectedInquiry.reference}
                  </span>
                  <span className="text-xs font-medium text-plum bg-plum-muted/60 px-2 py-0.5 rounded">
                    {selectedInquiry.category}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-medium text-ink mt-1">
                  {selectedInquiry.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-ink-muted hover:text-ink text-sm p-1"
              >
                ✕
              </button>
            </div>

            {/* Guest Summary Strip */}
            <div className="bg-ivory/60 p-3 rounded-lg border border-ink-border/60 text-xs font-sans space-y-1.5">
              <div className="flex justify-between">
                <span className="text-ink-muted">Sender Name:</span>
                <span className="font-medium text-ink">{selectedInquiry.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Email Address:</span>
                <a href={`mailto:${selectedInquiry.email}`} className="text-plum hover:underline">
                  {selectedInquiry.email}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Phone / WhatsApp:</span>
                <span className="text-ink">{selectedInquiry.phone || "Not provided"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Submission Date:</span>
                <span className="text-ink">{new Date(selectedInquiry.createdAt).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Original Message */}
            <div>
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-ink-muted block mb-1">
                Guest Message
              </span>
              <div className="bg-ivory/30 p-4 rounded-lg border border-ink-border text-xs font-sans text-ink leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Internal Staff Notes */}
            <div className="space-y-2">
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-ink-muted block">
                Internal Staff Notes & Action Items
              </span>
              <textarea
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                placeholder="Log internal communication notes, call outcomes, or next steps..."
                rows={3}
                className="w-full text-xs font-sans p-3 border border-ink-border rounded-lg bg-ivory/20 focus:outline-none focus:border-plum"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveInternalNotes}
                  disabled={isSavingNotes}
                  className="px-3 py-1.5 bg-plum text-white text-xs font-sans rounded hover:bg-plum-light disabled:opacity-50"
                >
                  {isSavingNotes ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-ink-border flex flex-wrap items-center justify-between gap-2">
              {selectedInquiry.clientContactId ? (
                <Link
                  href={`/admin/crm/clients/${selectedInquiry.clientContactId}`}
                  className="text-xs text-plum font-sans hover:underline flex items-center gap-1"
                >
                  <User className="w-3.5 h-3.5" /> View Linked CRM Client Profile
                </Link>
              ) : (
                <span className="text-xs text-ink-muted">Guest profile created automatically</span>
              )}

              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-1.5 border border-ink-border rounded text-xs font-sans text-ink hover:bg-ivory"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: LOG NEW INQUIRY ================= */}
      {showNewModal && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-ink-border max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-ink-border">
              <h3 className="font-serif text-lg font-medium text-ink">
                Log Front-Desk / Phone Inquiry
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-ink-muted hover:text-ink text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInquiry} className="space-y-3 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Guest Name</label>
                  <input
                    type="text"
                    value={newInquiryForm.name}
                    onChange={(e) => setNewInquiryForm({ ...newInquiryForm, name: e.target.value })}
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    value={newInquiryForm.email}
                    onChange={(e) => setNewInquiryForm({ ...newInquiryForm, email: e.target.value })}
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={newInquiryForm.phone}
                    onChange={(e) => setNewInquiryForm({ ...newInquiryForm, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Inquiry Source</label>
                  <select
                    value={newInquiryForm.source}
                    onChange={(e: any) => setNewInquiryForm({ ...newInquiryForm, source: e.target.value })}
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none capitalize"
                  >
                    <option value="phone">Phone Call</option>
                    <option value="walk_in">Walk-in (Auroville)</option>
                    <option value="referral">Referral / Guest Recommendation</option>
                    <option value="contact_form">Website Contact Form</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Category</label>
                  <select
                    value={newInquiryForm.category}
                    onChange={(e: any) => setNewInquiryForm({ ...newInquiryForm, category: e.target.value })}
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Natural Vision Therapy">Natural Vision Therapy</option>
                    <option value="Digital Eye Strain">Digital Eye Strain</option>
                    <option value="7-Day Residential Retreat">7-Day Residential Retreat</option>
                    <option value="Booking Assistance">Booking Assistance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Priority</label>
                  <select
                    value={newInquiryForm.priority}
                    onChange={(e: any) => setNewInquiryForm({ ...newInquiryForm, priority: e.target.value })}
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
                <label className="block text-ink-muted mb-1 font-medium">Subject</label>
                <input
                  type="text"
                  value={newInquiryForm.subject}
                  onChange={(e) => setNewInquiryForm({ ...newInquiryForm, subject: e.target.value })}
                  placeholder="e.g. Inquiring about next month retreat availability"
                  className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">Message / Conversation Summary</label>
                <textarea
                  value={newInquiryForm.message}
                  onChange={(e) => setNewInquiryForm({ ...newInquiryForm, message: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-ink-border">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-ink-border rounded text-ink hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="px-4 py-2 bg-plum text-white rounded hover:bg-plum-light disabled:opacity-50"
                >
                  {isSubmittingNew ? "Saving..." : "Save Inquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
