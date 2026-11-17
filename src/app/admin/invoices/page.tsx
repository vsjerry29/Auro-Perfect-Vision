"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { FileText, Download, Eye, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export default function AdminInvoicesPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/bookings")
      .then((res) => (res.ok ? res.json() : { bookings: [] }))
      .then((data) => setBookings(data.bookings || []))
      .finally(() => setLoading(false));
  }, []);

  // Invoices are issued for bookings with status confirmed & invoiceIssued: true
  const invoicedBookings = bookings.filter((b) => b.invoiceIssued);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-gold-dark font-semibold">
            Billing & Invoicing
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            Issued Invoice Records
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Review immutable invoice records generated upon online capture or admin offline verification.
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-ink-border shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-ink-muted">Loading invoice records...</div>
        ) : invoicedBookings.length === 0 ? (
          <div className="p-16 text-center text-xs text-ink-muted">No invoices generated yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-ink">
              <thead className="bg-canvas-light border-b border-ink-border uppercase tracking-wider text-[10px] text-ink-muted font-semibold">
                <tr>
                  <th className="px-5 py-3">Invoice Number</th>
                  <th className="px-5 py-3">Booking Reference</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Offering</th>
                  <th className="px-5 py-3">Total Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-border/50">
                {invoicedBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-canvas-light/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-plum">
                      {b.invoiceNumber || "APV-2026-0001"}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-ink-muted">
                      {b.bookingReference}
                    </td>
                    <td className="px-5 py-3.5 font-medium">{b.clientName}</td>
                    <td className="px-5 py-3.5">{b.offeringTitle}</td>
                    <td className="px-5 py-3.5 font-bold text-ink">
                      {formatCurrency(b.totalAmount, b.currency)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="success" className="text-[10px]">
                        Issued (PDF Available)
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInvoiceBooking(b)}
                        className="text-[11px] h-7 px-2.5 gap-1"
                      >
                        <Eye className="w-3 h-3 text-plum" />
                        <span>Preview</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Watermarked Modal */}
      {selectedInvoiceBooking && (
        <Dialog
          open={Boolean(selectedInvoiceBooking)}
          onClose={() => setSelectedInvoiceBooking(null)}
          title={`Invoice ${selectedInvoiceBooking.invoiceNumber || "APV-2026-0001"}`}
          description="Sample invoice rendering with watermark"
          maxWidth="lg"
        >
          <div className="relative border-4 border-dashed border-ink-border p-6 bg-white space-y-6 text-xs">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
              <span className="font-serif text-5xl font-bold uppercase rotate-[-25deg] text-red-600 select-none">
                SAMPLE — NOT A TAX INVOICE
              </span>
            </div>

            <div className="flex justify-between border-b pb-4">
              <div>
                <h4 className="font-serif text-lg font-bold text-ink">Auro Perfect Vision</h4>
                <p className="text-xs text-ink-muted">Auroville Centre for Vision Beyond Glasses</p>
                <p className="text-xs text-ink-muted">Auroville, Tamil Nadu 605101, India</p>
                <p className="text-[11px] text-amber-800 font-medium mt-1">
                  GST Status: Unconfirmed (Draft Simulation)
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm font-bold text-plum block">
                  {selectedInvoiceBooking.invoiceNumber || "APV-2026-0001"}
                </span>
                <span className="text-xs text-ink-muted block mt-1">
                  Date: {selectedInvoiceBooking.date}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-ink-muted block font-semibold">Billed To:</span>
                <span className="font-medium text-ink">{selectedInvoiceBooking.clientName}</span>
                <span className="text-ink-muted block">{selectedInvoiceBooking.clientEmail}</span>
                <span className="text-ink-muted block">{selectedInvoiceBooking.clientPhone}</span>
              </div>
              <div className="text-right">
                <span className="text-ink-muted block font-semibold">Payment Method:</span>
                <Badge variant="success">{selectedInvoiceBooking.paymentMethod}</Badge>
              </div>
            </div>

            <div className="border-t border-b py-3 flex justify-between items-center">
              <div>
                <span className="font-medium block">{selectedInvoiceBooking.offeringTitle}</span>
                <span className="text-[11px] text-ink-muted">
                  Practitioner: {selectedInvoiceBooking.therapistName}
                </span>
              </div>
              <span className="font-bold text-sm text-ink">
                {formatCurrency(selectedInvoiceBooking.totalAmount, selectedInvoiceBooking.currency)}
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <span className="text-xs text-ink-muted mr-3">Total Paid:</span>
              <span className="font-serif text-xl font-bold text-plum">
                {formatCurrency(selectedInvoiceBooking.totalAmount, selectedInvoiceBooking.currency)}
              </span>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setSelectedInvoiceBooking(null)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                alert("Simulated PDF downloaded.");
                setSelectedInvoiceBooking(null);
              }}
            >
              Download Demo PDF
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
