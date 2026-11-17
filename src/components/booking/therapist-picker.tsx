"use client";

import React from "react";
import { Therapist } from "@/lib/types";
import { User, CheckCircle2 } from "lucide-react";

interface TherapistPickerProps {
  therapists: Therapist[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function TherapistPicker({ therapists, selectedId, onSelect }: TherapistPickerProps) {
  return (
    <div className="space-y-3">
      <label className="block font-serif text-base text-ink font-medium">
        Choose Your Practitioner
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {therapists.map((therapist) => {
          const isSelected = therapist.id === selectedId;
          return (
            <button
              key={therapist.id}
              type="button"
              onClick={() => onSelect(therapist.id)}
              className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 focus:outline-none focus:ring-2 focus:ring-plum ${
                isSelected
                  ? "bg-plum-muted/60 border-plum shadow-sm"
                  : "bg-white border-ink-border hover:border-ink-muted"
              }`}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gold/40">
                <img
                  src={therapist.photoUrl}
                  alt={therapist.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-sm font-medium text-ink truncate">
                    {therapist.displayName}
                  </h4>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-plum flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gold-dark font-sans tracking-wide truncate">
                  {therapist.roleTitle}
                </p>
                <p className="text-[11px] text-ink-muted mt-1 line-clamp-1">
                  {therapist.specialties.join(", ")}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
