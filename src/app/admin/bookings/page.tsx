"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  CheckCircle2,
  FileText,
  Clock,
  Eye,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [confirmPayBooking, setConfirmPayBooking] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState("");

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/admin/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleConfirmPaid = async () => {
    if (!confirmPayBooking) return;
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_paid", bookingId: confirmPayBooking.id }),
      });
      if (res.ok) {
        showToast(`Booking ${confirmPayBooking.bookingReference} confirmed as paid!`);
        setConfirmPayBooking(null);
        fetchBookings();
      } else {
        alert("Failed to mark booking as paid.");
      }
    } catch {
      alert("Network error.");
    }
  };

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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-plum text-white px-5 py-3 rounded-2xl shadow-elevated text-xs flex items-center gap-2 border border-gold/40">
          <CheckCircle2 className="w-4 h-4 text-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-gold-dark font-semibold">
            Master Records
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            Bookings Ledger
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Authorized management view across all centre appointments and offline payments.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-ink-border shadow-subtle">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reference, client name, phone, or therapy..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-1 focus:ring-plum"
          >
            <option value="all">All Statuses ({bookings.length})</option>
            <option value="confirmed">Confirmed Only</option>
            <option value="pending">Pending Offline Only</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-ink-border shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-ink-muted">Loading bookings ledger...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-xs text-ink-muted">No appointments found matching this filter.</div>
        ) : (
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
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                <span className="text-ink-muted block font-semibold">Amount</span>
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

            <div className="space-y-3">
              <h4 className="font-serif text-sm font-semibold text-ink uppercase tracking-wide border-b pb-2">
                Confidential Intake Responses
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

            <div className="flex justify-end pt-4 border-t border-ink-border">
              <Button variant="outline" size="sm" onClick={() => setActiveBooking(null)}>
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Confirm Paid Dialog */}
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
              This will transition the status to <strong>Confirmed</strong> and release the official receipt invoice.
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
