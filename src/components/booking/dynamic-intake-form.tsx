"use client";

import React from "react";
import { IntakeField } from "@/lib/types";
import { ShieldCheck, Lock } from "lucide-react";

interface DynamicIntakeFormProps {
  fields: IntakeField[];
  answers: Record<string, any>;
  onChange: (fieldKey: string, value: any) => void;
  clientName: string;
  onNameChange: (val: string) => void;
  clientEmail: string;
  onEmailChange: (val: string) => void;
  clientPhone: string;
  onPhoneChange: (val: string) => void;
  errors: Record<string, string>;
}

export function DynamicIntakeForm({
  fields,
  answers,
  onChange,
  clientName,
  onNameChange,
  clientEmail,
  onEmailChange,
  clientPhone,
  onPhoneChange,
  errors,
}: DynamicIntakeFormProps) {
  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Pill */}
      <div className="flex items-start gap-3 bg-sage/50 p-4 rounded-xl border border-sage-muted text-xs text-sage-dark">
        <Lock className="w-4 h-4 flex-shrink-0 mt-0.5 text-sage-dark" />
        <div>
          <span className="font-semibold block">Confidential Medical & Lifestyle Privacy</span>
          <span>
            Your responses are shared exclusively with your assigned practitioner to personalize your session. Zero account registration required.
          </span>
        </div>
      </div>

      {/* Primary Contact Details */}
      <div className="bg-white p-5 rounded-xl border border-ink-border space-y-4">
        <h4 className="font-serif text-sm font-semibold text-ink uppercase tracking-wide border-b border-ink-border/50 pb-2">
          Your Contact Information
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink mb-1">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Meera Krishnan"
              className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum ${
                errors.clientName ? "border-red-500" : "border-ink-border"
              }`}
            />
            {errors.clientName && (
              <p className="text-[11px] text-red-600 mt-1">{errors.clientName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              Email Address (for Invoice & Details) <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              required
              value={clientEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="meera@example.com"
              className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum ${
                errors.clientEmail ? "border-red-500" : "border-ink-border"
              }`}
            />
            {errors.clientEmail && (
              <p className="text-[11px] text-red-600 mt-1">{errors.clientEmail}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              WhatsApp Phone Number <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              required
              value={clientPhone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="+91 98765 43210"
              className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum ${
                errors.clientPhone ? "border-red-500" : "border-ink-border"
              }`}
            />
            {errors.clientPhone && (
              <p className="text-[11px] text-red-600 mt-1">{errors.clientPhone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Session Questions */}
      <div className="bg-white p-5 rounded-xl border border-ink-border space-y-5">
        <h4 className="font-serif text-sm font-semibold text-ink uppercase tracking-wide border-b border-ink-border/50 pb-2">
          Session Specific Questionnaire
        </h4>

        {fields.map((field) => {
          const value = answers[field.fieldKey] || "";
          const error = errors[field.fieldKey];

          return (
            <div key={field.id} className="space-y-1.5">
              <label className="block text-xs font-medium text-ink">
                {field.label} {field.isRequired && <span className="text-red-600">*</span>}
              </label>

              {field.helpText && (
                <p className="text-[11px] text-ink-muted">{field.helpText}</p>
              )}

              {/* Text Field */}
              {field.fieldType === "text" && (
                <input
                  type="text"
                  value={value}
                  placeholder={field.placeholder}
                  onChange={(e) => onChange(field.fieldKey, e.target.value)}
                  className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum ${
                    error ? "border-red-500" : "border-ink-border"
                  }`}
                />
              )}

              {/* Number Field */}
              {field.fieldType === "number" && (
                <input
                  type="number"
                  value={value}
                  placeholder={field.placeholder}
                  onChange={(e) => onChange(field.fieldKey, e.target.value)}
                  className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum ${
                    error ? "border-red-500" : "border-ink-border"
                  }`}
                />
              )}

              {/* Textarea Field */}
              {field.fieldType === "textarea" && (
                <textarea
                  rows={3}
                  value={value}
                  placeholder={field.placeholder}
                  onChange={(e) => onChange(field.fieldKey, e.target.value)}
                  className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum ${
                    error ? "border-red-500" : "border-ink-border"
                  }`}
                />
              )}

              {/* Select Dropdown */}
              {field.fieldType === "select" && (
                <select
                  value={value}
                  onChange={(e) => onChange(field.fieldKey, e.target.value)}
                  className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum ${
                    error ? "border-red-500" : "border-ink-border"
                  }`}
                >
                  <option value="">-- Please select an option --</option>
                  {field.options?.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {/* Radio Group */}
              {field.fieldType === "radio" && (
                <div className="space-y-2 pt-1">
                  {field.options?.map((opt, i) => (
                    <label key={i} className="flex items-center gap-2.5 text-xs text-ink cursor-pointer">
                      <input
                        type="radio"
                        name={field.fieldKey}
                        value={opt}
                        checked={value === opt}
                        onChange={() => onChange(field.fieldKey, opt)}
                        className="text-plum focus:ring-plum h-4 w-4"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {error && <p className="text-[11px] text-red-600">{error}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
