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
      <div className="flex items-start gap-3 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 text-xs font-inter text-emerald-800">
        <Lock className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-700" />
        <div>
          <span className="font-bold block">Confidential Medical & Lifestyle Privacy</span>
          <span>
            Your responses are shared exclusively with your assigned practitioner to personalize your session. Zero account registration required.
          </span>
        </div>
      </div>

      {/* Primary Contact Details */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-gray/80 space-y-5 shadow-sm">
        <h4 className="font-sora text-sm font-bold text-brand-charcoal uppercase tracking-wider border-b border-brand-gray/80 pb-3">
          Your Contact Information
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-inter font-semibold text-brand-charcoal mb-1.5">
              Full Name <span className="text-brand-orange">*</span>
            </label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Meera Krishnan"
              className={`w-full px-4 py-3 text-xs sm:text-sm font-inter rounded-2xl border bg-[#FAF9FC] text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:bg-white transition-all ${
                errors.clientName ? "border-rose-400" : "border-brand-gray"
              }`}
            />
            {errors.clientName && (
              <p className="text-[11px] text-rose-600 mt-1 font-inter">{errors.clientName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-inter font-semibold text-brand-charcoal mb-1.5">
              Email Address (for Invoice & Details) <span className="text-brand-orange">*</span>
            </label>
            <input
              type="email"
              required
              value={clientEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="meera@example.com"
              className={`w-full px-4 py-3 text-xs sm:text-sm font-inter rounded-2xl border bg-[#FAF9FC] text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:bg-white transition-all ${
                errors.clientEmail ? "border-rose-400" : "border-brand-gray"
              }`}
            />
            {errors.clientEmail && (
              <p className="text-[11px] text-rose-600 mt-1 font-inter">{errors.clientEmail}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-inter font-semibold text-brand-charcoal mb-1.5">
              Phone Number <span className="text-brand-orange">*</span>
            </label>
            <input
              type="tel"
              required
              value={clientPhone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="+91 98765 43210"
              className={`w-full px-4 py-3 text-xs sm:text-sm font-inter rounded-2xl border bg-[#FAF9FC] text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:bg-white transition-all ${
                errors.clientPhone ? "border-rose-400" : "border-brand-gray"
              }`}
            />
            {errors.clientPhone && (
              <p className="text-[11px] text-rose-600 mt-1 font-inter">{errors.clientPhone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Session Questions */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-gray/80 space-y-5 shadow-sm">
        <h4 className="font-sora text-sm font-bold text-brand-charcoal uppercase tracking-wider border-b border-brand-gray/80 pb-3">
          Session Specific Questionnaire
        </h4>

        {fields.map((field) => {
          const value = answers[field.fieldKey] || "";
          const error = errors[field.fieldKey];

          return (
            <div key={field.id} className="space-y-1.5">
              <label className="block text-xs font-inter font-semibold text-brand-charcoal">
                {field.label} {field.isRequired && <span className="text-brand-orange">*</span>}
              </label>

              {field.helpText && (
                <p className="text-[11px] font-inter text-brand-secondary">{field.helpText}</p>
              )}

              {/* Text Field */}
              {field.fieldType === "text" && (
                <input
                  type="text"
                  value={value}
                  placeholder={field.placeholder}
                  onChange={(e) => onChange(field.fieldKey, e.target.value)}
                  className={`w-full px-4 py-3 text-xs sm:text-sm font-inter rounded-2xl border bg-[#FAF9FC] text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:bg-white transition-all ${
                    error ? "border-rose-400" : "border-brand-gray"
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
                  className={`w-full px-4 py-3 text-xs sm:text-sm font-inter rounded-2xl border bg-[#FAF9FC] text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:bg-white transition-all ${
                    error ? "border-rose-400" : "border-brand-gray"
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
                  className={`w-full px-4 py-3 text-xs sm:text-sm font-inter rounded-2xl border bg-[#FAF9FC] text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:bg-white transition-all resize-y ${
                    error ? "border-rose-400" : "border-brand-gray"
                  }`}
                />
              )}

              {/* Select Field */}
              {field.fieldType === "select" && (
                <select
                  value={value}
                  onChange={(e) => onChange(field.fieldKey, e.target.value)}
                  className={`w-full px-4 py-3 text-xs sm:text-sm font-inter rounded-2xl border bg-[#FAF9FC] text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:bg-white transition-all cursor-pointer ${
                    error ? "border-rose-400" : "border-brand-gray"
                  }`}
                >
                  <option value="">Select an option...</option>
                  {field.options?.map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {/* Radio Field */}
              {field.fieldType === "radio" && (
                <div className="flex flex-wrap gap-4 pt-1">
                  {(field.options || ["Yes", "No"]).map((opt, idx) => (
                    <label key={idx} className="inline-flex items-center gap-2 text-xs font-inter cursor-pointer text-brand-charcoal">
                      <input
                        type="radio"
                        name={field.fieldKey}
                        checked={value === opt}
                        onChange={() => onChange(field.fieldKey, opt)}
                        className="text-brand-purple focus:ring-brand-purple"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Checkbox Field */}
              {field.fieldType === "checkbox" && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id={field.fieldKey}
                    checked={Boolean(value)}
                    onChange={(e) => onChange(field.fieldKey, e.target.checked)}
                    className="h-4 w-4 rounded border-brand-gray text-brand-purple focus:ring-brand-purple"
                  />
                  <label htmlFor={field.fieldKey} className="text-xs font-inter text-brand-secondary cursor-pointer">
                    {field.label}
                  </label>
                </div>
              )}

              {error && (
                <p className="text-[11px] text-rose-600 font-inter mt-1">{error}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
