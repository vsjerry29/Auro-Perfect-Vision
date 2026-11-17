"use client";

import React, { useState, useMemo } from "react";
import { format, addDays, startOfToday } from "date-fns";
import { Clock, Globe, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

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
          <label className="block font-sora text-base text-brand-charcoal font-bold">
            Select Appointment Date
          </label>
          <div className="flex items-center gap-1.5 text-xs font-inter text-brand-secondary">
            <button
              type="button"
              disabled={weekOffset <= 0}
              onClick={() => setWeekOffset((p) => Math.max(0, p - 1))}
              className="p-1.5 rounded-xl border border-brand-gray hover:bg-brand-lavender/40 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-brand-charcoal">
              {format(days[0], "MMM d")} - {format(days[6], "MMM d, yyyy")}
            </span>
            <button
              type="button"
              disabled={weekOffset >= 4}
              onClick={() => setWeekOffset((p) => p + 1)}
              className="p-1.5 rounded-xl border border-brand-gray hover:bg-brand-lavender/40 disabled:opacity-30 disabled:pointer-events-none transition-colors"
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
                className={`py-3 px-1 rounded-2xl border text-center transition-all focus:outline-none focus:ring-2 focus:ring-brand-purple/50 ${
                  isSelected
                    ? "bg-brand-purple text-white border-brand-purple shadow-md font-bold"
                    : available
                    ? "bg-white text-brand-charcoal border-brand-gray hover:border-brand-purple/40 hover:bg-[#FAF9FC]"
                    : "bg-[#F3F5F8] text-brand-secondary/40 border-transparent cursor-not-allowed opacity-50"
                }`}
              >
                <span className="block text-[11px] font-inter uppercase tracking-wider mb-1">
                  {format(day, "EEE")}
                </span>
                <span className="block font-sora text-lg font-bold">
                  {format(day, "d")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timezone Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-inter text-brand-secondary bg-[#FAF9FC] px-4 py-3 rounded-2xl border border-brand-gray/80 gap-2">
        <span className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-brand-purple" />
          <span>Displayed in:</span>
          <select
            value={clientTimezone}
            onChange={(e) => onTimezoneChange(e.target.value)}
            className="bg-white border border-brand-gray text-brand-charcoal rounded-xl px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-purple/50 cursor-pointer"
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
        <span className="text-[10px] uppercase font-bold tracking-wider text-brand-purple bg-brand-lavender px-2.5 py-1 rounded-full self-start sm:self-auto">
          Live Centre Schedule
        </span>
      </div>

      {/* Available Slots Grid */}
      <div>
        <label className="block font-sora text-base text-brand-charcoal font-bold mb-3">
          Available Time Slots for {format(new Date(selectedDate), "EEEE, MMMM d")}
        </label>

        {availableSlots.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-brand-gray text-brand-secondary space-y-2">
            <AlertCircle className="w-6 h-6 mx-auto text-brand-orange" />
            <p className="text-sm font-sora font-semibold text-brand-charcoal">
              No open appointments on this date.
            </p>
            <p className="text-xs font-inter text-brand-secondary">
              Practitioner may be on leave or fully booked. Please select an adjacent day.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableSlots.map((slot) => {
              const isSelected = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSlotChange(slot)}
                  className={`py-3 px-4 rounded-xl border text-xs font-inter font-semibold transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 ${
                    isSelected
                      ? "bg-brand-purple text-white border-brand-purple shadow-sm"
                      : "bg-white text-brand-charcoal border-brand-gray hover:border-brand-purple/40 hover:bg-[#FAF9FC]"
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
