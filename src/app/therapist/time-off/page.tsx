"use client";

import React, { useState } from "react";
import { useDemoStore } from "@/lib/store";
import { Calendar, Trash2, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TherapistTimeOffPage() {
  const { leaveExceptions, addLeaveException, removeLeaveException } = useDemoStore();
  const [newDate, setNewDate] = useState("");
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    addLeaveException(newDate, reason || "Personal Leave / Time Off");
    setNewDate("");
    setReason("");
    setNotice(true);
    setTimeout(() => setNotice(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-gold-dark font-semibold">
            Absence & Leave
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            Time Off & Holiday Overrides
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Block specific calendar dates for seminars, community events, or personal leave. Selected days are instantly blocked from guest booking.
          </p>
        </div>

        {notice && (
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs px-3.5 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Leave date added & calendar updated!</span>
          </div>
        )}
      </div>

      {/* Add Leave Form */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-ink-border shadow-subtle space-y-4">
        <h3 className="font-serif text-base font-medium text-ink">
          Schedule New Time Off Block
        </h3>

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-4">
            <label className="block text-xs font-medium text-ink mb-1">
              Select Leave Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum font-mono"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="block text-xs font-medium text-ink mb-1">
              Reason / Public Note
            </label>
            <input
              type="text"
              value={reason}
              placeholder="e.g. Vision wellness workshop in Auroville"
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
            />
          </div>

          <div className="sm:col-span-2">
            <Button variant="primary" size="md" type="submit" className="w-full text-xs gap-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Block Day</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Existing Leave Records */}
      <div className="space-y-4">
        <h3 className="font-serif text-base font-medium text-ink">
          Currently Scheduled Time Off
        </h3>

        {leaveExceptions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-ink-border text-ink-muted">
            <p className="text-xs">No active leave dates scheduled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {leaveExceptions.map((leave) => (
              <div
                key={leave.id}
                className="bg-white p-4 rounded-xl border border-ink-border shadow-subtle flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-plum" />
                    <span className="font-mono text-xs font-semibold text-ink">
                      {leave.date}
                    </span>
                    <Badge variant="warning" className="text-[10px]">
                      Full Day
                    </Badge>
                  </div>
                  <p className="text-xs text-ink-muted mt-1">{leave.reason}</p>
                </div>

                <button
                  onClick={() => removeLeaveException(leave.id)}
                  className="p-2 text-ink-muted hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove leave block"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
