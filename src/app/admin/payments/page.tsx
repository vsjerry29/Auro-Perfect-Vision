"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export default function AdminPaymentsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOfflineBooking, setActiveOfflineBooking] = useState<any>(null);
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

  const pendingOffline = bookings.filter(
    (b) => b.status === "pending_offline_confirmation"
  );
  const paidBookings = bookings.filter((b) => b.status === "confirmed");

  const handleConfirm = async () => {
    if (!activeOfflineBooking) return;
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_paid", bookingId: activeOfflineBooking.id }),
      });
      if (res.ok) {
        showToast(`Offline payment for ${activeOfflineBooking.clientName} confirmed!`);
        setActiveOfflineBooking(null);
        fetchBookings();
      } else {
        alert("Failed to confirm payment.");
      }
    } catch {
      alert("Network error.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-plum text-white px-5 py-3 rounded-2xl shadow-elevated text-xs flex items-center gap-2 border border-gold/40">
          <CheckCircle2 className="w-4 h-4 text-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-gold-dark font-semibold">
            Financial Ledger
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            Payments & Offline Confirmations
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Reconcile domestic UPI/cards, international transactions, and verify guest offline payments made at the centre.
          </p>
        </div>
      </div>

      {/* Pending Offline Approvals Section */}
      <div className="bg-white rounded-2xl border border-amber-200 shadow-subtle p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-ink-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-700" />
            <h3 className="font-serif text-lg font-medium text-ink">
              Offline Pending Queue ({pendingOffline.length})
            </h3>
          </div>
          <Badge variant="warning" className="text-xs">
            Awaiting Admin Verification
          </Badge>
        </div>

        {pendingOffline.length === 0 ? (
          <p className="text-xs text-ink-muted italic py-4">
            No offline bookings are currently pending verification.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingOffline.map((b) => (
              <div
                key={b.id}
                className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-plum">
                      {b.bookingReference}
                    </span>
                    <Badge variant="warning" className="text-[10px]">
                      {b.paymentMethod.replace("_", " ")}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-ink text-sm mt-1">{b.clientName}</h4>
                  <p className="text-xs text-ink-muted">
                    Session: {b.offeringTitle} • Amount:{" "}
                    <strong>{formatCurrency(b.totalAmount, b.currency)}</strong>
                  </p>
                </div>

                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => setActiveOfflineBooking(b)}
                  className="text-xs text-plum font-semibold"
                >
                  Verify Payment & Issue Invoice
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmed Transactions Ledger */}
      <div className="bg-white rounded-2xl border border-ink-border shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-ink-border">
          <h3 className="font-serif text-lg font-medium text-ink">
            Confirmed Captured Transactions ({paidBookings.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ink">
            <thead className="bg-canvas-light border-b border-ink-border uppercase tracking-wider text-[10px] text-ink-muted font-semibold">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Invoice #</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-border/50">
              {paidBookings.map((b) => (
                <tr key={b.id} className="hover:bg-canvas-light/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-medium text-plum">
                    {b.bookingReference}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-ink-muted">
                    {b.invoiceNumber || "APV-2026-0001"}
                  </td>
                  <td className="px-5 py-3.5 font-medium">{b.clientName}</td>
                  <td className="px-5 py-3.5 capitalize text-ink-muted">
                    {b.paymentMethod.replace("_", " ")}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-ink">
                    {formatCurrency(b.totalAmount, b.currency)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant="success" className="text-[10px]">
                      Captured & Settled
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {activeOfflineBooking && (
        <Dialog
          open={Boolean(activeOfflineBooking)}
          onClose={() => setActiveOfflineBooking(null)}
          title="Confirm Offline Receipt"
          description={`Booking ${activeOfflineBooking.bookingReference}`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p>
              Please verify that you have collected{" "}
              <strong>
                {formatCurrency(
                  activeOfflineBooking.totalAmount,
                  activeOfflineBooking.currency
                )}
              </strong>{" "}
              from {activeOfflineBooking.clientName}.
            </p>
            <div className="flex justify-end gap-3 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveOfflineBooking(null)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirm}>
                Confirm Paid
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
