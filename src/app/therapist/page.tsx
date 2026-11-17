"use client";

import React, { useState } from "react";
import { useDemoStore } from "@/lib/store";
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export default function TherapistDashboardPage() {
  const { bookings } = useDemoStore();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // In demo, show bookings assigned to therapist-1 (Dr. Ananya Sen)
  const myBookings = bookings.filter((b) => b.therapistId === "therapist-1");

  const filteredBookings = myBookings.filter((b) => {
    if (statusFilter === "confirmed") return b.status === "confirmed";
    if (statusFilter === "pending") return b.status === "pending_offline_confirmation";
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-gold-dark font-semibold">
            Practitioner Schedule
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            Assigned Appointments
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Review upcoming client sessions, contact information, and confidential intake notes.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white p-1 rounded-lg border border-ink-border">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
              statusFilter === "all" ? "bg-plum text-white" : "text-ink hover:text-plum"
            }`}
          >
            All ({myBookings.length})
          </button>
          <button
            onClick={() => setStatusFilter("confirmed")}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
              statusFilter === "confirmed" ? "bg-plum text-white" : "text-ink hover:text-plum"
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
              statusFilter === "pending" ? "bg-plum text-white" : "text-ink hover:text-plum"
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-ink-border text-ink-muted">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-ink-faint" />
            <p className="text-sm font-medium text-ink">No appointments found</p>
            <p className="text-xs text-ink-muted mt-1">
              You currently have no scheduled appointments matching this filter.
            </p>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white p-5 sm:p-6 rounded-xl border border-ink-border shadow-subtle hover:shadow-card transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <Badge
                    variant={b.status === "confirmed" ? "success" : "warning"}
                    className="text-[10px]"
                  >
                    {b.status === "confirmed" ? "Confirmed" : "Pending Offline Payment"}
                  </Badge>
                  <span className="font-mono text-xs font-semibold text-plum">
                    {b.bookingReference}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-medium text-ink">
                  {b.offeringTitle}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-plum" />
                    {b.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-plum" />
                    {b.timeSlot}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-plum" />
                    {b.clientName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedBooking(b)}
                  className="gap-1.5 text-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-plum" />
                  <span>View Intake & Notes</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Details & Intake Notes Modal */}
      {selectedBooking && (
        <Dialog
          open={Boolean(selectedBooking)}
          onClose={() => setSelectedBooking(null)}
          title={`Intake Notes: ${selectedBooking.clientName}`}
          description={`Session: ${selectedBooking.offeringTitle} • Ref: ${selectedBooking.bookingReference}`}
          maxWidth="lg"
        >
          <div className="space-y-6 text-xs">
            {/* Contact Card */}
            <div className="bg-canvas-light p-4 rounded-xl border border-ink-border grid grid-cols-2 gap-3">
              <div>
                <span className="text-ink-muted block font-semibold">Contact Email</span>
                <span className="text-ink font-mono">{selectedBooking.clientEmail}</span>
              </div>
              <div>
                <span className="text-ink-muted block font-semibold">WhatsApp Number</span>
                <span className="text-ink font-mono">{selectedBooking.clientPhone}</span>
              </div>
              <div>
                <span className="text-ink-muted block font-semibold">Client Timezone</span>
                <span className="text-ink">{selectedBooking.clientTimezone}</span>
              </div>
              <div>
                <span className="text-ink-muted block font-semibold">Status</span>
                <Badge variant={selectedBooking.status === "confirmed" ? "success" : "warning"}>
                  {selectedBooking.status}
                </Badge>
              </div>
            </div>

            {/* Intake Answers */}
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-semibold text-ink uppercase tracking-wide border-b pb-2">
                Confidential Intake Responses
              </h4>

              {Object.keys(selectedBooking.intakeAnswers || {}).length === 0 ? (
                <p className="text-ink-muted italic">No intake answers submitted.</p>
              ) : (
                <div className="space-y-2.5">
                  {Object.entries(selectedBooking.intakeAnswers).map(([k, v]) => (
                    <div key={k} className="p-3 bg-white rounded-lg border border-ink-border">
                      <span className="text-[11px] font-semibold text-plum uppercase tracking-wider block mb-1">
                        {k.replace(/_/g, " ")}
                      </span>
                      <p className="text-ink font-sans text-xs">
                        {typeof v === "object" ? JSON.stringify(v) : String(v)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="outline" size="sm" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
