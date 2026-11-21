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
  Check,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [confirmApproveBooking, setConfirmApproveBooking] = useState<any>(null);
  const [rejectBookingTarget, setRejectBookingTarget] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
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

  const isPaid = (b: any) =>
    b.paymentStatus === "captured" ||
    b.paymentStatus === "offline_confirmed" ||
    b.paymentStatus === "paid";

  const isPendingApproval = (b: any) =>
    b.status === "pending_approval" || b.status === "pending_offline_confirmation";

  const handleApproveBooking = async () => {
    if (!confirmApproveBooking) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm_booking",
          bookingId: confirmApproveBooking.id,
        }),
      });

      if (res.ok) {
        showToast(`Appointment ${confirmApproveBooking.bookingReference} approved! Client notified.`);
        setConfirmApproveBooking(null);
        await fetchBookings();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to approve booking.");
      }
    } catch {
      alert("Network error while approving booking.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!rejectBookingTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject_booking",
          bookingId: rejectBookingTarget.id,
          reason: rejectionReason.trim() || undefined,
        }),
      });

      if (res.ok) {
        showToast(`Booking ${rejectBookingTarget.bookingReference} declined and slot released.`);
        setRejectBookingTarget(null);
        setRejectionReason("");
        await fetchBookings();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to reject booking.");
      }
    } catch {
      alert("Network error while rejecting booking.");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.clientPhone && b.clientPhone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.clientEmail && b.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      b.offeringTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBookingStatus =
      bookingStatusFilter === "all" ||
      (bookingStatusFilter === "pending" && isPendingApproval(b)) ||
      (bookingStatusFilter === "confirmed" && b.status === "confirmed") ||
      (bookingStatusFilter === "cancelled" && b.status === "cancelled");

    const matchesPaymentStatus =
      paymentStatusFilter === "all" ||
      (paymentStatusFilter === "paid" && isPaid(b)) ||
      (paymentStatusFilter === "unpaid" && !isPaid(b));

    return matchesSearch && matchesBookingStatus && matchesPaymentStatus;
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
            Authoritative scheduling and appointment approval management. Booking approval is strictly decoupled from financial payment verification.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-ink-border shadow-subtle">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reference, client name, phone, email, or therapy..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={bookingStatusFilter}
            onChange={(e) => setBookingStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-1 focus:ring-plum"
          >
            <option value="all">All Booking Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-1 focus:ring-plum"
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Payment Pending</option>
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
                  <th className="px-5 py-3">Booking Status</th>
                  <th className="px-5 py-3">Payment Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-border/50">
                {filtered.map((b) => {
                  const paid = isPaid(b);
                  const pendingAppr = isPendingApproval(b);

                  return (
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
                        {pendingAppr ? (
                          <Badge variant="warning" className="text-[10px]">
                            Pending Approval
                          </Badge>
                        ) : b.status === "confirmed" ? (
                          <Badge variant="success" className="text-[10px]">
                            Confirmed
                          </Badge>
                        ) : b.status === "cancelled" ? (
                          <Badge variant="outline" className="text-[10px] text-rose-700 bg-rose-50 border-rose-200">
                            Cancelled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            {b.status}
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="block font-medium">
                          {formatCurrency(b.totalAmount, b.currency)}
                        </span>
                        <Badge
                          variant={paid ? "success" : "warning"}
                          className="text-[10px] mt-0.5"
                        >
                          {paid ? "Paid" : "Payment Pending"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {pendingAppr && (
                          <>
                            <Button
                              variant="gold"
                              size="sm"
                              onClick={() => setConfirmApproveBooking(b)}
                              className="text-[11px] h-7 px-2.5 text-plum font-semibold gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Confirm Booking</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRejectBookingTarget(b)}
                              className="text-[11px] h-7 px-2.5 text-rose-700 hover:bg-rose-50 border-rose-200 gap-1"
                            >
                              <X className="w-3 h-3" />
                              <span>Reject</span>
                            </Button>
                          </>
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
                  );
                })}
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
                <span className="text-ink-muted block font-semibold">Booking Status</span>
                <Badge
                  variant={
                    activeBooking.status === "confirmed"
                      ? "success"
                      : isPendingApproval(activeBooking)
                      ? "warning"
                      : "outline"
                  }
                  className={activeBooking.status === "cancelled" ? "text-rose-700 border-rose-200 bg-rose-50" : ""}
                >
                  {isPendingApproval(activeBooking) ? "Pending Approval" : activeBooking.status}
                </Badge>
              </div>
              <div>
                <span className="text-ink-muted block font-semibold">Payment Status</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-bold text-plum">
                    {formatCurrency(activeBooking.totalAmount, activeBooking.currency)}
                  </span>
                  <Badge variant={isPaid(activeBooking) ? "success" : "warning"}>
                    {isPaid(activeBooking) ? "Paid" : "Pending"}
                  </Badge>
                </div>
              </div>
              {activeBooking.invoiceNumber && (
                <div>
                  <span className="text-ink-muted block font-semibold">Tax Invoice Number</span>
                  <a
                    href={`/api/invoices/${activeBooking.invoiceNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-plum font-mono font-bold hover:underline"
                  >
                    {activeBooking.invoiceNumber}
                  </a>
                </div>
              )}
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

      {/* Confirm Booking Approval Dialog */}
      {confirmApproveBooking && (
        <Dialog
          open={Boolean(confirmApproveBooking)}
          onClose={() => setConfirmApproveBooking(null)}
          title="Approve Appointment Reservation"
          description={`Reference: ${confirmApproveBooking.bookingReference}`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-ink leading-relaxed">
              Confirm appointment reservation for <strong>{confirmApproveBooking.clientName}</strong> on{" "}
              <strong>{confirmApproveBooking.date}</strong> at <strong>{confirmApproveBooking.timeSlot}</strong>?
            </p>
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed">
              <strong>Approval Notice:</strong> This confirms the appointment reservation and sends an approval notification email to the client.
              <br /><br />
              <em>Note: This action does NOT mark payment as paid. Payment status will remain <strong>Payment Pending</strong> until verified in the Payments ledger or collected at the centre.</em>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button
                variant="outline"
                size="sm"
                disabled={actionLoading}
                onClick={() => setConfirmApproveBooking(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={actionLoading}
                onClick={handleApproveBooking}
              >
                {actionLoading ? "Confirming..." : "Approve Booking"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Reject Booking Dialog */}
      {rejectBookingTarget && (
        <Dialog
          open={Boolean(rejectBookingTarget)}
          onClose={() => setRejectBookingTarget(null)}
          title="Reject / Cancel Appointment Request"
          description={`Reference: ${rejectBookingTarget.bookingReference}`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-ink leading-relaxed">
              Are you sure you want to decline the appointment for <strong>{rejectBookingTarget.clientName}</strong>?
            </p>
            <div className="bg-rose-50 p-3 rounded-lg border border-rose-200 text-rose-900 text-[11px] leading-relaxed">
              This will mark the booking as <strong>Cancelled</strong>, release the reserved time slot for other clients, and send an update email to the client with an option to reschedule.
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-1">
                Reason / Note to Client (Optional)
              </label>
              <input
                type="text"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Practitioner unavailable or schedule conflict"
                className="w-full px-3 py-2 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-1 focus:ring-plum"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button
                variant="outline"
                size="sm"
                disabled={actionLoading}
                onClick={() => setRejectBookingTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={actionLoading}
                onClick={handleRejectBooking}
                className="bg-rose-700 text-white hover:bg-rose-800 border-none"
              >
                {actionLoading ? "Processing..." : "Reject & Release Slot"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
