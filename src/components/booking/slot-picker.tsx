"use client";

import React, { useState, useMemo } from "react";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { Clock, Globe, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SlotPickerProps {
  selectedDate: string; // YYYY-MM-DD
  selectedSlot: string;
  onDateChange: (dateStr: string) => void;
  onSlotChange: (slotStr: string) => void;
  availableSlots: string[];
  isDateAvailable: (dateStr: string) => boolean;
  clientTimezone: string;
  onTimezoneChange: (tz: string) => void;
}

export function SlotPicker({
  selectedDate,
  selectedSlot,
  onDateChange,
  onSlotChange,
  availableSlots,
  isDateAvailable,
  clientTimezone,
  onTimezoneChange,
}: SlotPickerProps) {
  const today = useMemo(() => startOfToday(), []);
  const [weekOffset, setWeekOffset] = useState(0);

  // Generate 7 days for the current visible mini-calendar
  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      return addDays(today, weekOffset * 7 + i);
    });
  }, [today, weekOffset]);

  return (
    <div className="space-y-6">
      {/* Date Picker Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block font-serif text-base text-ink font-medium">
            Select Appointment Date
          </label>
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <button
              type="button"
              disabled={weekOffset <= 0}
              onClick={() => setWeekOffset((p) => Math.max(0, p - 1))}
              className="p-1.5 rounded border border-ink-border hover:bg-canvas-dark disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-ink">
              {format(days[0], "MMM d")} - {format(days[6], "MMM d, yyyy")}
            </span>
            <button
              type="button"
              disabled={weekOffset >= 4}
              onClick={() => setWeekOffset((p) => p + 1)}
              className="p-1.5 rounded border border-ink-border hover:bg-canvas-dark disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7-day strip */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const available = isDateAvailable(dateStr);
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={dateStr}
                type="button"
                disabled={!available}
                onClick={() => {
                  onDateChange(dateStr);
                  onSlotChange(""); // reset selected slot when date changes
                }}
                className={`py-3 px-1 rounded-xl border text-center transition-all focus:outline-none focus:ring-2 focus:ring-plum ${
                  isSelected
                    ? "bg-plum text-white border-plum shadow-md"
                    : available
                    ? "bg-white text-ink border-ink-border hover:border-plum/50 hover:bg-canvas-light"
                    : "bg-canvas-dark/40 text-ink-faint border-transparent cursor-not-allowed opacity-40"
                }`}
              >
                <span className="block text-[11px] font-sans uppercase tracking-wider mb-1">
                  {format(day, "EEE")}
                </span>
                <span className="block font-serif text-lg font-medium">
                  {format(day, "d")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timezone Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-ink-muted bg-canvas-dark/40 px-3.5 py-2.5 rounded-lg border border-ink-border/50 gap-2">
        <span className="flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-plum" />
          <span>Displayed in:</span>
          <select
            value={clientTimezone}
            onChange={(e) => onTimezoneChange(e.target.value)}
            className="bg-white border border-ink-border text-ink rounded px-2 py-0.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-plum"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST • Centre Time)</option>
            <option value="UTC">UTC (Universal Time)</option>
            <option value="Europe/London">Europe/London (GMT/BST)</option>
            <option value="Europe/Paris">Europe/Paris (CET)</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
            <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
          </select>
        </span>
        <Badge variant="faint" className="text-[10px] self-start sm:self-auto">
          Demo Availability Feed
        </Badge>
      </div>

      {/* Available Slots Grid */}
      <div>
        <label className="block font-serif text-base text-ink font-medium mb-3">
          Available Time Slots for {format(new Date(selectedDate), "EEEE, MMMM d")}
        </label>

        {availableSlots.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-ink-border text-ink-muted">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-gold-dark" />
            <p className="text-sm font-medium text-ink">
              No open appointments on this date.
            </p>
            <p className="text-xs text-ink-muted mt-1">
              Practitioner may be on leave or fully booked. Please select an adjacent day.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {availableSlots.map((slot) => {
              const isSelected = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSlotChange(slot)}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-sans font-medium transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-plum ${
                    isSelected
                      ? "bg-plum text-white border-plum shadow-sm"
                      : "bg-white text-ink border-ink-border hover:border-ink-muted hover:bg-canvas-light"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 opacity-70" />
                  <span>{slot}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
