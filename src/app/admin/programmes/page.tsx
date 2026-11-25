"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Plus,
  Copy,
  Edit,
  Trash2,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Programme, ProgrammeCohort } from "@/lib/types/crm";

export default function AdminProgrammesPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expanded programme for viewing itinerary/cohorts
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Edit / Create Modal
  const [showModal, setShowModal] = useState(false);
  const [editingProg, setEditingProg] = useState<Partial<Programme> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProgrammes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/programmes");
      if (!res.ok) throw new Error("Failed to load programmes");
      const data = await res.json();
      setProgrammes(data.programmes || []);
      if (data.programmes?.length > 0 && !expandedId) {
        setExpandedId(data.programmes[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load programmes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgrammes();
  }, []);

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch("/api/admin/programmes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate", id }),
      });
      if (!res.ok) throw new Error("Failed to duplicate programme");
      await fetchProgrammes();
    } catch (err: any) {
      alert(err.message || "Failed to duplicate");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/programmes?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete programme");
      await fetchProgrammes();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  const handleTogglePublish = async (prog: Programme) => {
    try {
      const res = await fetch("/api/admin/programmes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: prog.id,
          isPublished: !prog.isPublished,
        }),
      });
      if (!res.ok) throw new Error("Failed to toggle publish status");
      await fetchProgrammes();
    } catch (err: any) {
      alert(err.message || "Failed to update publish state");
    }
  };

  const handleSaveProgramme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProg) return;

    try {
      setIsSubmitting(true);
      const method = editingProg.id ? "PUT" : "POST";
      const res = await fetch("/api/admin/programmes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProg),
      });

      if (!res.ok) throw new Error("Failed to save programme");
      setShowModal(false);
      setEditingProg(null);
      await fetchProgrammes();
    } catch (err: any) {
      alert(err.message || "Could not save programme");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openNewModal = () => {
    setEditingProg({
      title: "",
      slug: "",
      shortDescription: "",
      fullDescription: "",
      durationLabel: "7 Days / 6 Nights",
      durationDays: 7,
      dailySessionMinutes: 180,
      format: "group",
      delivery: "onsite",
      priceINR: 28000,
      priceUSD: 420,
      location: "Tresor Nursing Home, 9, St Louis St, White Town, Puducherry – 605001, India.",
      maxCapacity: 12,
      imageUrl: "/images/offerings/retreat-residential.webp",
      isPublished: true,
      itinerary: [
        { day: 1, title: "Arrival & Foundational Eye Acuity Assessment", description: "Comprehensive Bates screening, eye strain mapping, and introductory gentle sunning." },
        { day: 2, title: "The Art of Relaxation & Palming Technique", description: "Deep palming rituals, cranial release, and optical stillness meditation." },
        { day: 3, title: "Central Fixation & Peripheral Awakenings", description: "Dynamic central fixation charts, broad awareness outdoor walking." },
        { day: 4, title: "Shifting, Saccadic Motion & Illusions of Rest", description: "Long swings, optic flow pacing, and micro-movement eye tracking." },
        { day: 5, title: "Digital Deconditioning & Natural Sun Bathing", description: "Morning sunning, cold eye splash routines, and circadian alignment." },
        { day: 6, title: "Twilight Walk & Subtle Contrast Training", description: "Coastal starlight walk, rod cell reactivation, and deep relaxation." },
        { day: 7, title: "Post-Camp Assessment & Home Practice Blueprint", description: "Comparative visual acuity test and personalized lifelong vision hygiene protocol." },
      ],
      inclusions: [
        "Daily personalized vision sessions",
        "Curated Pondicherry retreat stay and nourishing meals",
        "Complete Bates vision training kit",
        "Follow-up virtual review at 30 days",
      ],
      cohorts: [
        {
          id: `cohort-${Date.now()}`,
          title: "December 2026 Winter Cohort",
          startDate: "2026-12-05",
          endDate: "2026-12-11",
          maxCapacity: 12,
          enrolledCount: 4,
          status: "upcoming",
        },
      ],
    });
    setShowModal(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-ink-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-medium text-gold-dark uppercase tracking-wider">
              Services & Retreats
            </span>
            <span className="text-xs text-ink-muted">•</span>
            <span className="text-xs font-sans text-plum font-medium">Flagship Offerings</span>
          </div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-ink">
            Flagship Programmes & Retreats
          </h1>
          <p className="text-xs font-sans text-ink-muted mt-0.5">
            Multi-day residential eye retreats, 7-day intensive camps, cohort schedules, and daily syllabus.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-plum text-white rounded-md text-xs font-sans hover:bg-plum-light transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" /> + Create New Programme
        </button>
      </div>

      {/* Programmes List */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-plum border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-ink-muted font-sans">Loading Flagship Programmes...</p>
        </div>
      ) : programmes.length === 0 ? (
        <div className="bg-white rounded-xl border border-ink-border p-12 text-center">
          <Compass className="w-10 h-10 text-ink-muted/40 mx-auto mb-3" />
          <h3 className="font-serif text-base font-medium text-ink mb-1">No Programmes Configured</h3>
          <p className="text-xs font-sans text-ink-muted mb-4">
            Create your first multi-day residential vision camp or flagship workshop.
          </p>
          <button
            onClick={openNewModal}
            className="px-4 py-2 bg-plum text-white text-xs font-sans rounded hover:bg-plum-light"
          >
            Create Programme
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {programmes.map((prog) => {
            const isExpanded = expandedId === prog.id;
            return (
              <div
                key={prog.id}
                className="bg-white rounded-xl border border-ink-border shadow-sm overflow-hidden"
              >
                {/* Programme Card Header */}
                <div className="p-5 lg:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-medium text-gold-dark bg-gold/10 px-2 py-0.5 rounded">
                        {prog.durationLabel}
                      </span>
                      <span
                        className={`text-[10px] font-sans uppercase font-medium px-2 py-0.5 rounded ${
                          prog.isPublished
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-ink-border text-ink-muted"
                        }`}
                      >
                        {prog.isPublished ? "Published" : "Draft"}
                      </span>
                      <span className="text-xs text-ink-muted font-sans">
                        • {prog.format === "group" ? "Group Cohort" : "1-on-1 Intensive"} • {prog.delivery}
                      </span>
                    </div>

                    <h2 className="font-serif text-xl font-medium text-ink">{prog.title}</h2>
                    <p className="text-xs font-sans text-ink-muted leading-relaxed">
                      {prog.shortDescription}
                    </p>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="flex flex-wrap items-center gap-3 lg:self-center">
                    <div className="text-right pr-4 border-r border-ink-border hidden sm:block">
                      <div className="font-serif text-lg font-medium text-plum">
                        ₹{prog.priceINR.toLocaleString("en-IN")}
                      </div>
                    </div>

                    <button
                      onClick={() => handleTogglePublish(prog)}
                      className={`px-3 py-1.5 text-xs font-sans rounded border transition-colors ${
                        prog.isPublished
                          ? "border-ink-border text-ink-muted hover:bg-ivory"
                          : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      }`}
                    >
                      {prog.isPublished ? "Unpublish" : "Publish Live"}
                    </button>

                    <button
                      onClick={() => handleDuplicate(prog.id)}
                      className="p-1.5 text-ink-muted hover:text-plum rounded border border-ink-border hover:bg-ivory"
                      title="Duplicate Programme"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setEditingProg(prog);
                        setShowModal(true);
                      }}
                      className="p-1.5 text-ink-muted hover:text-plum rounded border border-ink-border hover:bg-ivory"
                      title="Edit Programme"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(prog.id, prog.title)}
                      className="p-1.5 text-ink-muted hover:text-red-600 rounded border border-ink-border hover:bg-red-50"
                      title="Delete Programme"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : prog.id)}
                      className="p-1.5 text-ink-muted hover:text-ink rounded border border-ink-border hover:bg-ivory"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details: Cohorts & Daily Itinerary */}
                {isExpanded && (
                  <div className="border-t border-ink-border bg-ivory/30 p-5 lg:p-6 space-y-6">
                    {/* Cohorts Grid */}
                    <div>
                      <h3 className="text-xs font-sans font-semibold uppercase tracking-wider text-ink-muted mb-3 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-plum" /> Upcoming Retreat Cohorts
                      </h3>
                      {prog.cohorts && prog.cohorts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {prog.cohorts.map((cohort) => (
                            <div
                              key={cohort.id}
                              className="bg-white p-3.5 rounded-lg border border-ink-border shadow-xs text-xs font-sans space-y-1.5"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-ink">{cohort.title}</span>
                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-plum-muted/60 text-plum rounded">
                                  {cohort.status}
                                </span>
                              </div>
                              <div className="text-[11px] text-ink-muted flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {cohort.startDate} to {cohort.endDate}
                              </div>
                              <div className="text-[11px] text-ink flex justify-between pt-1 border-t border-ink-border/50">
                                <span className="text-ink-muted">Enrolled / Cap:</span>
                                <span className="font-medium">
                                  {cohort.enrolledCount} / {cohort.maxCapacity} Seats
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-ink-muted">No cohorts scheduled yet.</p>
                      )}
                    </div>

                    {/* Daily Itinerary */}
                    <div>
                      <h3 className="text-xs font-sans font-semibold uppercase tracking-wider text-ink-muted mb-3 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-plum" /> Daily Syllabus & Itinerary Breakdown
                      </h3>
                      {prog.itinerary && prog.itinerary.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {prog.itinerary.map((day) => (
                            <div
                              key={day.day}
                              className="bg-white p-3.5 rounded-lg border border-ink-border shadow-xs text-xs font-sans space-y-1"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-plum bg-plum/10 px-1.5 py-0.2 rounded text-[11px]">
                                  Day {day.day}
                                </span>
                                <span className="font-medium text-ink">{day.title}</span>
                              </div>
                              <p className="text-ink-muted text-[11px] leading-relaxed pl-1">
                                {day.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-ink-muted">No itinerary configured.</p>
                      )}
                    </div>

                    {/* Inclusions */}
                    <div>
                      <h3 className="text-xs font-sans font-semibold uppercase tracking-wider text-ink-muted mb-2">
                        Retreat Inclusions
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {prog.inclusions?.map((inc, i) => (
                          <span
                            key={i}
                            className="text-xs font-sans bg-white border border-ink-border px-2.5 py-1 rounded text-ink flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {inc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT PROGRAMME ================= */}
      {showModal && editingProg && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-ink-border max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-ink-border">
              <h3 className="font-serif text-lg font-medium text-ink">
                {editingProg.id ? "Edit Flagship Programme" : "Create Flagship Programme"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-ink-muted hover:text-ink text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProgramme} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Programme Title</label>
                  <input
                    type="text"
                    value={editingProg.title || ""}
                    onChange={(e) => setEditingProg({ ...editingProg, title: e.target.value })}
                    placeholder="e.g. 7-Day Residential Vision Retreat"
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Duration Label</label>
                  <input
                    type="text"
                    value={editingProg.durationLabel || ""}
                    onChange={(e) => setEditingProg({ ...editingProg, durationLabel: e.target.value })}
                    placeholder="e.g. 7 Days / 6 Nights"
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Duration (Days)</label>
                  <input
                    type="number"
                    value={editingProg.durationDays || 7}
                    onChange={(e) => setEditingProg({ ...editingProg, durationDays: Number(e.target.value) })}
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Daily Mins</label>
                  <input
                    type="number"
                    value={editingProg.dailySessionMinutes || 180}
                    onChange={(e) => setEditingProg({ ...editingProg, dailySessionMinutes: Number(e.target.value) })}
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Price (₹)</label>
                  <input
                    type="number"
                    value={editingProg.priceINR || 28000}
                    onChange={(e) => setEditingProg({ ...editingProg, priceINR: Number(e.target.value), priceUSD: Math.round(Number(e.target.value) / 80) })}
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none font-mono"
                    required
                  />
                  <span className="text-[11px] text-ink-muted mt-1 block">Indian Rupees (INR) • Tax-inclusive</span>
                </div>
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">Short Summary</label>
                <input
                  type="text"
                  value={editingProg.shortDescription || ""}
                  onChange={(e) => setEditingProg({ ...editingProg, shortDescription: e.target.value })}
                  placeholder="Intensive holistic residential eye retreat at our Pondicherry centre..."
                  className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">Full Description</label>
                <textarea
                  value={editingProg.fullDescription || ""}
                  onChange={(e) => setEditingProg({ ...editingProg, fullDescription: e.target.value })}
                  rows={3}
                  className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">
                  Inclusions (Comma-separated)
                </label>
                <input
                  type="text"
                  value={(editingProg.inclusions || []).join(", ")}
                  onChange={(e) =>
                    setEditingProg({
                      ...editingProg,
                      inclusions: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                  placeholder="Stay, Organic sattvic meals, Bates kit, 30-day review"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="progPublished"
                  checked={editingProg.isPublished || false}
                  onChange={(e) => setEditingProg({ ...editingProg, isPublished: e.target.checked })}
                  className="w-4 h-4 text-plum rounded border-ink-border focus:ring-plum"
                />
                <label htmlFor="progPublished" className="text-xs text-ink font-medium">
                  Publish on public website offerings catalogue
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-ink-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-ink-border rounded text-ink hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-plum text-white rounded hover:bg-plum-light disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Programme"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
