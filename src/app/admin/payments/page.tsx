"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, CheckCircle2, Clock, AlertCircle, FileText, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export default function AdminPaymentsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOfflineBooking, setActiveOfflineBooking] = useState<any>(null);
  const [confirming, setConfirming] = useState(false);
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

  // CRITICAL: Unpaid offline queue includes all bookings where payment is pending and not cancelled,
  // regardless of whether booking is already approved (confirmed) or awaiting approval.
  const pendingOffline = bookings.filter(
    (b) => !isPaid(b) && b.status !== "cancelled"
  );

  const paidBookings = bookings.filter((b) => isPaid(b));

  const handleConfirm = async () => {
    if (!activeOfflineBooking) return;
    setConfirming(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm_payment",
          bookingId: activeOfflineBooking.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(
          `Payment for ${activeOfflineBooking.clientName} confirmed! Invoice ${data.invoiceNumber || ""} issued.`
        );
        setActiveOfflineBooking(null);
        await fetchBookings();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to confirm payment.");
      }
    } catch {
      alert("Network error while confirming payment.");
    } finally {
      setConfirming(false);
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
            Verify counter, cash, and wire payments independently from appointment approvals. Issuing payment creates an official sequential tax invoice.
          </p>
        </div>
      </div>

      {/* Pending Offline Approvals Section */}
      <div className="bg-white rounded-2xl border border-amber-200 shadow-subtle p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-ink-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-700" />
            <h3 className="font-serif text-lg font-medium text-ink">
              Offline Unpaid Queue ({pendingOffline.length})
            </h3>
          </div>
          <Badge variant="warning" className="text-xs">
            Awaiting Counter / Offline Payment Verification
          </Badge>
        </div>

        {pendingOffline.length === 0 ? (
          <p className="text-xs text-ink-muted italic py-4">
            No offline bookings are currently pending payment verification.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingOffline.map((b) => {
              const isConfirmed = b.status === "confirmed";

              return (
                <div
                  key={b.id}
                  className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-plum">
                        {b.bookingReference}
                      </span>
                      <Badge variant="warning" className="text-[10px]">
                        {(b.paymentMethod || "offline").replace("_", " ")}
                      </Badge>
                      <Badge
                        variant={isConfirmed ? "success" : "warning"}
                        className="text-[10px]"
                      >
                        {isConfirmed ? "Appointment Confirmed" : "Appointment Pending Approval"}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-ink text-sm">{b.clientName}</h4>
                    <p className="text-xs text-ink-muted">
                      Session: {b.offeringTitle} • {b.date} • Amount:{" "}
                      <strong className="text-plum font-semibold">
                        {formatCurrency(b.totalAmount, b.currency)}
                      </strong>
                    </p>
                  </div>

                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => setActiveOfflineBooking(b)}
                    className="text-xs text-plum font-semibold shrink-0 gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Verify Payment & Issue Invoice</span>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmed Transactions Ledger */}
      <div className="bg-white rounded-2xl border border-ink-border shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-ink-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-medium text-ink">
              Confirmed Captured Transactions ({paidBookings.length})
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Appointments with verified captured payments and sequential tax invoices.
            </p>
          </div>
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
                <th className="px-5 py-3">Booking Status</th>
                <th className="px-5 py-3">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-border/50">
              {paidBookings.map((b) => (
                <tr key={b.id} className="hover:bg-canvas-light/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-medium text-plum">
                    {b.bookingReference}
                  </td>
                  <td className="px-5 py-3.5 font-mono">
                    {b.invoiceNumber ? (
                      <a
                        href={`/api/invoices/${b.invoiceNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-plum font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3 text-gold" />
                        <span>{b.invoiceNumber}</span>
                      </a>
                    ) : (
                      <span className="text-ink-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-medium">{b.clientName}</td>
                  <td className="px-5 py-3.5 capitalize text-ink-muted">
                    {(b.paymentMethod || "").replace("_", " ")}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-ink">
                    {formatCurrency(b.totalAmount, b.currency)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={b.status === "confirmed" ? "success" : "warning"}
                      className="text-[10px]"
                    >
                      {b.status === "confirmed" ? "Confirmed" : b.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant="success" className="text-[10px]">
                      Paid & Verified
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
          onClose={() => !confirming && setActiveOfflineBooking(null)}
          title="Verify Offline Counter Payment"
          description={`Booking Reference: ${activeOfflineBooking.bookingReference}`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-ink leading-relaxed">
              Verify receipt of{" "}
              <strong className="text-plum font-bold font-serif text-sm">
                {formatCurrency(
                  activeOfflineBooking.totalAmount,
                  activeOfflineBooking.currency
                )}
              </strong>{" "}
              from <strong>{activeOfflineBooking.clientName}</strong>?
            </p>
            <div className="bg-canvas-light p-3.5 rounded-xl border border-ink-border text-ink space-y-1.5 leading-relaxed text-[11px]">
              <div className="flex justify-between">
                <span className="text-ink-muted">Appointment Date:</span>
                <span className="font-medium">{activeOfflineBooking.date} • {activeOfflineBooking.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Booking Approval Status:</span>
                <span className="font-semibold text-plum capitalize">{activeOfflineBooking.status}</span>
              </div>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <strong>Fiscal Verification:</strong> This action records the offline payment, generates an official sequential tax invoice, and emails the payment receipt to the client. It does <em>not</em> alter the appointment schedule or approval status.
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button
                variant="outline"
                size="sm"
                disabled={confirming}
                onClick={() => setActiveOfflineBooking(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={confirming}
                onClick={handleConfirm}
              >
                {confirming ? "Verifying..." : "Confirm Payment & Issue Invoice"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
