"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MapPin,
  List,
  Grid,
} from "lucide-react";
import { Booking, Therapist } from "@/lib/types";

export default function AdminCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>("all");
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 10, 1)); // Default to Nov 2026
  const [viewMode, setViewMode] = useState<"grid" | "agenda">("grid");

  // Selected Booking Modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed (10 = November)
  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `/api/admin/calendar?month=${monthStr}&therapistId=${selectedTherapistId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load calendar data");
      const data = await res.json();
      setBookings(data.bookings || []);
      setTherapists(data.therapists || []);
    } catch (err: any) {
      setError(err.message || "Failed to load calendar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [monthStr, selectedTherapistId]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 10, 17));
  };

  // Month grid helpers
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Adjust so Monday is 0
  const startOffset = (firstDayOfWeek + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: { dayNum: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevMonthStr = `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarDays.push({ dayNum: d, dateStr: prevMonthStr, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    calendarDays.push({ dayNum: i, dateStr: dStr, isCurrentMonth: true });
  }

  // Next month leading days to complete full weeks
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const nextMonthStr = `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    calendarDays.push({ dayNum: i, dateStr: nextMonthStr, isCurrentMonth: false });
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-ink-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-medium text-gold-dark uppercase tracking-wider">
              Operations & Schedule
            </span>
            <span className="text-xs text-ink-muted">•</span>
            <span className="text-xs font-sans text-plum font-medium">Appointments Calendar</span>
          </div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-ink">
            Master Calendar
          </h1>
          <p className="text-xs font-sans text-ink-muted mt-0.5">
            Consolidated bookings view across all vision wellness practitioners and therapy rooms.
          </p>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-ink-border bg-white p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded text-xs flex items-center gap-1 ${
                viewMode === "grid" ? "bg-plum text-white" : "text-ink-muted hover:text-ink"
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Month
            </button>
            <button
              onClick={() => setViewMode("agenda")}
              className={`p-1.5 rounded text-xs flex items-center gap-1 ${
                viewMode === "agenda" ? "bg-plum text-white" : "text-ink-muted hover:text-ink"
              }`}
            >
              <List className="w-3.5 h-3.5" /> Agenda
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Month Navigation & Practitioner Filter */}
      <div className="bg-white rounded-xl border border-ink-border p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded border border-ink-border text-ink-muted hover:text-ink hover:bg-ivory"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-serif text-lg font-medium text-ink min-w-[160px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded border border-ink-border text-ink-muted hover:text-ink hover:bg-ivory"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-sans rounded border border-ink-border text-ink hover:bg-ivory ml-2"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-muted font-sans flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Practitioner:
          </span>
          <select
            value={selectedTherapistId}
            onChange={(e) => setSelectedTherapistId(e.target.value)}
            className="text-xs bg-ivory border border-ink-border rounded px-3 py-1.5 text-ink focus:outline-none"
          >
            <option value="all">All Practitioners ({therapists.length})</option>
            {therapists.map((t) => (
              <option key={t.id} value={t.id}>
                {t.displayName}
              </option>
            ))}
          </select>
          <span className="text-xs font-mono text-plum font-medium">
            {bookings.length} Session{bookings.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* View: Month Grid */}
      {viewMode === "grid" && (
        <div className="bg-white rounded-xl border border-ink-border shadow-sm overflow-hidden">
          {/* Days of week */}
          <div className="grid grid-cols-7 bg-ivory border-b border-ink-border text-center text-xs font-medium text-ink-muted py-2.5">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-ink-border/50">
            {calendarDays.map((calDay, idx) => {
              const dayBookings = bookings.filter((b) => b.date === calDay.dateStr);

              return (
                <div
                  key={idx}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                    calDay.isCurrentMonth ? "bg-white" : "bg-ivory/30 opacity-50"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-xs font-mono font-medium ${
                        calDay.dateStr === "2026-11-17"
                          ? "w-6 h-6 rounded-full bg-plum text-white flex items-center justify-center font-bold"
                          : "text-ink"
                      }`}
                    >
                      {calDay.dayNum}
                    </span>
                    {dayBookings.length > 0 && (
                      <span className="text-[10px] font-mono text-gold-dark font-semibold">
                        {dayBookings.length}
                      </span>
                    )}
                  </div>

                  {/* Appointments in this day */}
                  <div className="space-y-1 overflow-y-auto max-h-[85px]">
                    {dayBookings.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBooking(b)}
                        className="w-full text-left p-1 rounded bg-plum-muted/40 hover:bg-plum-muted/80 border border-plum/10 text-[10px] font-sans truncate block transition-colors"
                      >
                        <div className="font-semibold text-plum truncate">{b.clientName}</div>
                        <div className="text-ink-muted text-[9px] truncate">
                          {b.timeSlot.split(" - ")[0]} • {b.therapistName.split(" ")[0]}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View: Agenda List */}
      {viewMode === "agenda" && (
        <div className="bg-white rounded-xl border border-ink-border overflow-hidden shadow-sm">
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-xs text-ink-muted">
              No appointments scheduled for {monthNames[month]} {year}.
            </div>
          ) : (
            <div className="divide-y divide-ink-border">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-ivory/40 cursor-pointer transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-gold-dark bg-gold/10 px-2 py-0.5 rounded">
                        {b.bookingReference}
                      </span>
                      <span className="text-xs font-medium text-ink">{b.offeringTitle}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded capitalize ${
                          b.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <div className="text-xs text-ink-muted flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" /> {b.date} ({b.timeSlot})
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {b.therapistName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="font-mono text-xs font-medium text-ink">
                        ₹{b.totalAmount.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-ink-muted capitalize">
                        {b.paymentStatus.replace("_", " ")}
                      </div>
                    </div>
                    <span className="text-xs text-plum font-medium">View &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: BOOKING DETAILS ================= */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-ink-border max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-ink-border">
              <div>
                <span className="text-xs font-mono text-gold-dark font-medium">
                  {selectedBooking.bookingReference}
                </span>
                <h3 className="font-serif text-lg font-medium text-ink">
                  {selectedBooking.offeringTitle}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-ink-muted hover:text-ink text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="bg-ivory/60 p-3 rounded-lg border border-ink-border/50 space-y-2">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Client Name:</span>
                  <span className="font-medium text-ink">{selectedBooking.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Email:</span>
                  <a href={`mailto:${selectedBooking.clientEmail}`} className="text-plum hover:underline">
                    {selectedBooking.clientEmail}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Phone:</span>
                  <span>{selectedBooking.clientPhone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-ivory/40 p-3 rounded-lg border border-ink-border/50">
                  <span className="text-ink-muted block text-[11px]">Appointment Date & Time</span>
                  <span className="font-medium text-ink block mt-0.5">{selectedBooking.date}</span>
                  <span className="text-ink-muted text-[11px] block">{selectedBooking.timeSlot}</span>
                </div>
                <div className="bg-ivory/40 p-3 rounded-lg border border-ink-border/50">
                  <span className="text-ink-muted block text-[11px]">Practitioner</span>
                  <span className="font-medium text-plum block mt-0.5">{selectedBooking.therapistName}</span>
                </div>
              </div>

              <div className="bg-ivory/40 p-3 rounded-lg border border-ink-border/50 flex justify-between items-center">
                <div>
                  <span className="text-ink-muted text-[11px] block">Payment Method & Status</span>
                  <span className="font-medium text-ink capitalize">
                    {selectedBooking.paymentMethod.replace(/_/g, " ")} • {selectedBooking.paymentStatus.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="font-serif text-lg font-bold text-ink">
                  ₹{selectedBooking.totalAmount.toLocaleString("en-IN")}
                </div>
              </div>

              {selectedBooking.intakeAnswers && Object.keys(selectedBooking.intakeAnswers).length > 0 && (
                <div className="bg-ivory/30 p-3 rounded-lg border border-ink-border/40">
                  <span className="text-[11px] font-semibold text-ink-muted uppercase block mb-1">
                    Clinical Intake Notes
                  </span>
                  <p className="text-ink text-[11px] whitespace-pre-wrap">
                    {JSON.stringify(selectedBooking.intakeAnswers, null, 2)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-ink-border">
              <Link
                href="/admin/crm"
                className="text-xs text-plum font-sans hover:underline flex items-center gap-1"
              >
                Open in CRM <ExternalLink className="w-3 h-3" />
              </Link>
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-1.5 bg-plum text-white rounded text-xs font-sans hover:bg-plum-light"
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
