"use client";

import React, { useState } from "react";
import { useDemoStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export default function AdminBookingsPage() {
  const { bookings, markOfflineBookingPaid, cancelBooking } = useDemoStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [confirmPayBooking, setConfirmPayBooking] = useState<any>(null);

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.clientPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.offeringTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "confirmed" && b.status === "confirmed") ||
      (statusFilter === "pending" && b.status === "pending_offline_confirmation");

    return matchesSearch && matchesStatus;
  });

  const handleConfirmPaid = () => {
    if (confirmPayBooking) {
      markOfflineBookingPaid(confirmPayBooking.id);
      setConfirmPayBooking(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-gold-dark font-semibold">
            Master Records
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            Bookings Ledger
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Global search, intake examination, and offline payment approvals across all centre therapists.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-ink-border shadow-subtle">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reference, client name, phone, or offering..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-1 focus:ring-plum"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed Only</option>
            <option value="pending">Pending Offline Only</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-ink-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ink">
            <thead className="bg-canvas-light border-b border-ink-border uppercase tracking-wider text-[10px] text-ink-muted font-semibold">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Offering</th>
                <th className="px-5 py-3">Date & Time</th>
                <th className="px-5 py-3">Practitioner</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-border/50">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-canvas-light/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-medium text-plum">
                    {b.bookingReference}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium block text-ink">{b.clientName}</span>
                    <span className="text-[11px] text-ink-muted block">{b.clientPhone}</span>
                  </td>
                  <td className="px-5 py-3.5 font-medium">{b.offeringTitle}</td>
                  <td className="px-5 py-3.5 text-ink-muted">
                    {b.date} • {b.timeSlot}
                  </td>
                  <td className="px-5 py-3.5">{b.therapistName}</td>
                  <td className="px-5 py-3.5">
                    <span className="block font-medium">
                      {formatCurrency(b.totalAmount, b.currency)}
                    </span>
                    <span className="text-[10px] text-ink-muted capitalize">
                      {b.paymentMethod.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={b.status === "confirmed" ? "success" : "warning"}
                      className="text-[10px]"
                    >
                      {b.status === "confirmed" ? "Confirmed" : "Pending Offline"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                    {b.status === "pending_offline_confirmation" && (
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() => setConfirmPayBooking(b)}
                        className="text-[11px] h-7 px-2.5 text-plum font-semibold"
                      >
                        Mark as Paid
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveBooking(b)}
                      className="text-[11px] h-7 px-2.5"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Dialog */}
      {activeBooking && (
        <Dialog
          open={Boolean(activeBooking)}
          onClose={() => setActiveBooking(null)}
          title={`Booking ${activeBooking.bookingReference}`}
          description={`Client: ${activeBooking.clientName} • Session: ${activeBooking.offeringTitle}`}
          maxWidth="lg"
        >
          <div className="space-y-6 text-xs">
            {/* Overview Grid */}
            <div className="bg-canvas-light p-4 rounded-xl border border-ink-border grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-ink-muted block font-semibold">Date & Time</span>
                <span className="text-ink">{activeBooking.date} • {activeBooking.timeSlot}</span>
              </div>
              <div>
                <span className="text-ink-muted block font-semibold">Practitioner</span>
                <span className="text-ink">{activeBooking.therapistName}</span>
              </div>
              <div>
                <span className="text-ink-muted block font-semibold">Client Phone</span>
                <span className="text-ink font-mono">{activeBooking.clientPhone}</span>
              </div>
              <div>
                <span className="text-ink-muted block font-semibold">Client Email</span>
                <span className="text-ink font-mono">{activeBooking.clientEmail}</span>
              </div>
              <div>
                <span className="text-ink-muted block font-semibold">Billed Amount</span>
                <span className="text-plum font-bold font-serif text-sm">
                  {formatCurrency(activeBooking.totalAmount, activeBooking.currency)}
                </span>
              </div>
              <div>
                <span className="text-ink-muted block font-semibold">Status</span>
                <Badge variant={activeBooking.status === "confirmed" ? "success" : "warning"}>
                  {activeBooking.status}
                </Badge>
              </div>
            </div>

            {/* Intake Form Answers */}
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-semibold text-ink uppercase tracking-wide border-b pb-2">
                Client Submitted Intake Answers
              </h4>

              {Object.keys(activeBooking.intakeAnswers || {}).length === 0 ? (
                <p className="text-ink-muted italic">No answers recorded.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(activeBooking.intakeAnswers).map(([k, v]) => (
                    <div key={k} className="p-3 bg-white rounded-lg border border-ink-border">
                      <span className="text-[10px] font-semibold text-plum uppercase tracking-wider block mb-0.5">
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

            <div className="flex justify-between items-center pt-4 border-t border-ink-border">
              {activeBooking.status !== "cancelled" ? (
                <button
                  type="button"
                  onClick={() => {
                    cancelBooking(activeBooking.id);
                    setActiveBooking(null);
                  }}
                  className="text-xs text-red-600 hover:underline font-medium"
                >
                  Cancel this booking
                </button>
              ) : (
                <span className="text-xs text-red-600 italic">Booking is cancelled</span>
              )}

              <Button variant="outline" size="sm" onClick={() => setActiveBooking(null)}>
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Mark Offline Paid Confirmation Dialog */}
      {confirmPayBooking && (
        <Dialog
          open={Boolean(confirmPayBooking)}
          onClose={() => setConfirmPayBooking(null)}
          title="Confirm Offline Payment"
          description={`Verify payment receipt for ${confirmPayBooking.clientName}`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-ink">
              Are you sure you want to mark reference{" "}
              <strong className="text-plum font-mono">{confirmPayBooking.bookingReference}</strong> as paid?
            </p>
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              This will transition the status to <strong>Confirmed</strong>, automatically generate Invoice{" "}
              <strong>APV-2026-XXXX</strong>, and send simulated WhatsApp and Email confirmations to the guest.
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" size="sm" onClick={() => setConfirmPayBooking(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmPaid}>
                Confirm Paid & Issue Invoice
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
