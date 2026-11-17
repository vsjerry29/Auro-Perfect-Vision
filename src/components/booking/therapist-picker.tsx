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
      <label className="block font-sora text-base text-brand-charcoal font-bold">
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
              className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 ${
                isSelected
                  ? "bg-brand-lavender/60 border-brand-purple shadow-sm ring-1 ring-brand-purple"
                  : "bg-white border-brand-gray hover:border-brand-purple/30 hover:bg-[#FAF9FC]"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-brand-purple/20">
                <img
                  src={therapist.photoUrl}
                  alt={therapist.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-sora text-sm font-bold text-brand-charcoal truncate">
                    {therapist.displayName}
                  </h4>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-brand-purple flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-brand-purple font-inter font-medium tracking-wide truncate mt-0.5">
                  {therapist.roleTitle}
                </p>
                <p className="text-[11px] text-brand-secondary font-inter mt-1 line-clamp-1">
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
