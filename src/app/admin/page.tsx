"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  CalendarCheck,
  CreditCard,
  Clock,
  Layers,
  ArrowUpRight,
  Plus,
  Edit,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminOverviewPage() {
  const [offerings, setOfferings] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/offerings").then((r) => (r.ok ? r.json() : { offerings: [] })),
      fetch("/api/admin/bookings").then((r) => (r.ok ? r.json() : { bookings: [] })),
    ])
      .then(([offData, bData]) => {
        setOfferings(offData.offerings || []);
        setBookings(bData.bookings || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const pendingOffline = bookings.filter(
    (b) => b.status === "pending_offline_confirmation"
  ).length;

  const totalRevenueINR = bookings
    .filter((b) => b.status === "confirmed" && b.currency === "INR")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const totalRevenueUSD = bookings
    .filter((b) => b.status === "confirmed" && b.currency === "USD")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-gold-dark font-semibold">
            Administrative Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            Platform Overview
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Authoritative operational dashboard for Auro Perfect Vision therapies, content, and bookings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/" target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs bg-white">
              <span>View Public Website</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Top Obvious Shortcuts (Section 9 Requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/offerings"
          className="bg-white p-5 rounded-2xl border border-ink-border shadow-subtle hover:shadow-card hover:-translate-y-0.5 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-plum text-gold flex items-center justify-center shrink-0 shadow-sm">
              <Plus className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-serif text-base font-medium text-ink group-hover:text-plum transition-colors block">
                + Add Therapy
              </span>
              <span className="text-[11px] text-ink-muted block mt-0.5">
                {offerings.length} therapies in catalogue
              </span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-ink-muted group-hover:text-plum transition-colors" />
        </Link>

        <Link
          href="/admin/bookings"
          className="bg-white p-5 rounded-2xl border border-ink-border shadow-subtle hover:shadow-card hover:-translate-y-0.5 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-base font-medium text-ink group-hover:text-plum transition-colors block">
                Manage Appointments
              </span>
              <span className="text-[11px] text-ink-muted block mt-0.5">
                {pendingOffline > 0 ? `${pendingOffline} pending approval` : "All slots up to date"}
              </span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-ink-muted group-hover:text-plum transition-colors" />
        </Link>

        <Link
          href="/admin/cms"
          className="bg-white p-5 rounded-2xl border border-ink-border shadow-subtle hover:shadow-card hover:-translate-y-0.5 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sage text-sage-dark flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-base font-medium text-ink group-hover:text-plum transition-colors block">
                Edit Website Content
              </span>
              <span className="text-[11px] text-ink-muted block mt-0.5">
                Hero text, photos & journal
              </span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-ink-muted group-hover:text-plum transition-colors" />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-ink-border shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Published Therapies</span>
            <Layers className="w-4 h-4 text-plum" />
          </div>
          <div>
            <span className="font-serif text-3xl font-bold text-ink">
              {offerings.filter((o) => o.isPublished).length}
            </span>
            <span className="text-[11px] text-ink-muted block mt-1">
              ({offerings.filter((o) => !o.isPublished).length} unpublished drafts)
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-ink-border shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Pending Offline</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <span className="font-serif text-3xl font-bold text-amber-700">
              {pendingOffline}
            </span>
            <span className="text-[11px] text-amber-800 block mt-1">
              Awaiting Front Desk Verification
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-ink-border shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Total Revenue (₹)</span>
            <CreditCard className="w-4 h-4 text-gold-dark" />
          </div>
          <div>
            <span className="font-serif text-3xl font-bold text-plum">
              {formatCurrency(totalRevenueINR, "INR")}
            </span>
            <span className="text-[11px] text-ink-muted block mt-1">
              Confirmed Appointments (INR)
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-ink-border shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">
              {totalRevenueUSD > 0 ? "Historical Ledger (USD)" : "Settlement Currency"}
            </span>
            <CreditCard className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <span className="font-serif text-3xl font-bold text-emerald-800">
              {totalRevenueUSD > 0 ? `$${totalRevenueUSD} USD` : "₹ INR Only"}
            </span>
            <span className="text-[11px] text-ink-muted block mt-1">
              {totalRevenueUSD > 0 ? "Archived Prior to INR Standardization" : "Exclusively Indian Rupees"}
            </span>
          </div>
        </div>
      </div>

      {/* Offline Pending Action Alert */}
      {pendingOffline > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-900">
                Action Required: {pendingOffline} offline reservation(s) awaiting payment confirmation.
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Confirm payment when guests pay cash at the centre desk or submit wire transfer proof.
              </p>
            </div>
          </div>
          <Link href="/admin/payments">
            <Button variant="outline" size="sm" className="bg-white text-xs border-amber-300">
              Go to Offline Queue
            </Button>
          </Link>
        </div>
      )}

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl border border-ink-border shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-ink-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-medium text-ink">Recent Bookings Ledger</h3>
            <p className="text-xs text-ink-muted">Authorized admin view across all practitioners</p>
          </div>
          <Link href="/admin/bookings">
            <Button variant="ghost" size="sm" className="text-xs">
              View All
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ink">
            <thead className="bg-canvas-light border-b border-ink-border uppercase tracking-wider text-[10px] text-ink-muted font-semibold">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Offering</th>
                <th className="px-5 py-3">Date & Time</th>
                <th className="px-5 py-3">Practitioner</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-border/50">
              {recentBookings.map((b) => (
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
                  <td className="px-5 py-3.5 font-medium">
                    {formatCurrency(b.totalAmount, b.currency)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={b.status === "confirmed" ? "success" : "warning"}
                      className="text-[10px]"
                    >
                      {b.status === "confirmed" ? "Confirmed" : "Pending Offline"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
