"use client";

import React, { useState } from "react";
import { useDemoStore } from "@/lib/store";
import { Settings, RotateCcw, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminSettingsPage() {
  const { resetDemoData } = useDemoStore();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    if (
      confirm(
        "Are you sure you want to reset all demo state? All added offerings, modified schedules, and submitted demo bookings will return to factory default."
      )
    ) {
      resetDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-gold-dark font-semibold">
            System Preferences
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            Platform Settings & Diagnostics
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Configure booking constraints, time zones, and manage interactive demo persistence.
          </p>
        </div>

        {resetSuccess && (
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs px-3.5 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Demo fixtures reset to default!</span>
          </div>
        )}
      </div>

      {/* Operational Rules Configuration Card */}
      <div className="bg-white p-6 rounded-xl border border-ink-border shadow-subtle space-y-4">
        <h3 className="font-serif text-base font-medium text-ink pb-2 border-b">
          Scheduling Constraints & Buffer Times
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-ink mb-1">
              Minimum Advance Booking Notice
            </label>
            <select
              defaultValue="12"
              className="w-full px-3 py-2 rounded-lg border border-ink-border bg-canvas-light text-xs"
            >
              <option value="6">6 Hours in advance</option>
              <option value="12">12 Hours in advance (Recommended)</option>
              <option value="24">24 Hours in advance</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-ink mb-1">
              Appointment Buffer Duration
            </label>
            <select
              defaultValue="15"
              className="w-full px-3 py-2 rounded-lg border border-ink-border bg-canvas-light text-xs"
            >
              <option value="10">10 Minutes (Sanitization & Notes)</option>
              <option value="15">15 Minutes (Standard)</option>
              <option value="30">30 Minutes</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-ink mb-1">
              Default Operational Time Zone
            </label>
            <input
              type="text"
              readOnly
              value="Asia/Kolkata (IST)"
              className="w-full px-3 py-2 rounded-lg border border-ink-border bg-canvas-dark/40 text-xs text-ink-muted cursor-not-allowed font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-ink mb-1">
              Supported Billing Currencies
            </label>
            <input
              type="text"
              readOnly
              value="INR (₹) Domestic • USD ($) International"
              className="w-full px-3 py-2 rounded-lg border border-ink-border bg-canvas-dark/40 text-xs text-ink-muted cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Reset State Card */}
      <div className="bg-white p-6 rounded-xl border border-red-200 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b pb-2 border-red-100">
          <div>
            <h3 className="font-serif text-base font-medium text-red-950">
              Interactive Demo Fixtures
            </h3>
            <p className="text-xs text-ink-muted">
              Clear local modifications and restore pristine initial data for all sessions, templates, and bookings.
            </p>
          </div>
          <Badge variant="warning">Demo Environment</Badge>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-ink-muted max-w-md">
            Clicking reset removes your local browser changes and repopulates the store with Dr. Ananya Sen, Eye Yoga offerings, and initial sample bookings.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs text-red-700 border-red-300 hover:bg-red-50 gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
