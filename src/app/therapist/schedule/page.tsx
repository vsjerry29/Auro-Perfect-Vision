"use client";

import React, { useState } from "react";
import { useDemoStore } from "@/lib/store";
import { Clock, Plus, Trash2, CheckCircle2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TherapistSchedulePage() {
  const { weeklySchedule, updateDaySchedule } = useDemoStore();
  const [savedNotice, setSavedNotice] = useState(false);

  const handleToggleDay = (dayOfWeek: number, currentActive: boolean) => {
    updateDaySchedule(dayOfWeek, { active: !currentActive });
    showNotice();
  };

  const handleAddSlot = (dayOfWeek: number) => {
    const day = weeklySchedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;
    const newSlots = [...day.slots, { startTime: "14:00", endTime: "18:00" }];
    updateDaySchedule(dayOfWeek, { slots: newSlots, active: true });
    showNotice();
  };

  const handleRemoveSlot = (dayOfWeek: number, slotIndex: number) => {
    const day = weeklySchedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;
    const newSlots = day.slots.filter((_, idx) => idx !== slotIndex);
    updateDaySchedule(dayOfWeek, { slots: newSlots });
    showNotice();
  };

  const handleTimeChange = (
    dayOfWeek: number,
    slotIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const day = weeklySchedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;
    const newSlots = [...day.slots];
    newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
    updateDaySchedule(dayOfWeek, { slots: newSlots });
    showNotice();
  };

  const showNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-gold-dark font-semibold">
            Calendar Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            Weekly Recurring Availability
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Configure your standard weekly consultation hours. Public slot availability reflects these hours in real time.
          </p>
        </div>

        {savedNotice && (
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs px-3.5 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Schedule auto-saved!</span>
          </div>
        )}
      </div>

      {/* Weekday Configuration Cards */}
      <div className="space-y-4">
        {weeklySchedule.map((day) => (
          <div
            key={day.dayOfWeek}
            className={`p-5 rounded-xl border transition-all ${
              day.active
                ? "bg-white border-ink-border shadow-subtle"
                : "bg-canvas-dark/40 border-dashed border-ink-border/60 opacity-60"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Day Switcher */}
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id={`day-${day.dayOfWeek}`}
                  checked={day.active}
                  onChange={() => handleToggleDay(day.dayOfWeek, day.active)}
                  className="w-5 h-5 rounded text-plum focus:ring-plum cursor-pointer"
                />
                <label
                  htmlFor={`day-${day.dayOfWeek}`}
                  className="font-serif text-lg font-medium text-ink cursor-pointer select-none"
                >
                  {day.dayName}
                </label>
                <Badge variant={day.active ? "success" : "faint"} className="text-[10px]">
                  {day.active ? "Available" : "Unavailable"}
                </Badge>
              </div>

              {/* Time Slots List */}
              {day.active && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="space-y-2">
                    {day.slots.map((slot, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) =>
                            handleTimeChange(day.dayOfWeek, sIdx, "startTime", e.target.value)
                          }
                          className="px-2.5 py-1 text-xs rounded border border-ink-border bg-canvas-light text-ink font-mono"
                        />
                        <span className="text-xs text-ink-muted">to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) =>
                            handleTimeChange(day.dayOfWeek, sIdx, "endTime", e.target.value)
                          }
                          className="px-2.5 py-1 text-xs rounded border border-ink-border bg-canvas-light text-ink font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(day.dayOfWeek, sIdx)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Remove time window"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSlot(day.dayOfWeek)}
                    className="text-xs gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Shift</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
