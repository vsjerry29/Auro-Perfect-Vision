"use client";

import React, { useState, useMemo } from "react";
import { useDemoStore } from "@/lib/store";
import { IntakeField, IntakeFieldType } from "@/lib/types";
import { Plus, Trash2, ArrowUp, ArrowDown, CheckCircle2, Eye, FileCode2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminIntakeBuilderPage() {
  const { offerings, getIntakeTemplateForOffering, saveIntakeFields } = useDemoStore();
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>(
    offerings[0]?.id || "off-1"
  );
  const [savedNotice, setSavedNotice] = useState(false);

  // Current active template
  const activeTemplate = useMemo(() => {
    return getIntakeTemplateForOffering(selectedOfferingId);
  }, [getIntakeTemplateForOffering, selectedOfferingId]);

  const [fields, setFields] = useState<IntakeField[]>(activeTemplate.fields);

  // Sync fields when selected offering changes
  React.useEffect(() => {
    setFields(activeTemplate.fields);
  }, [activeTemplate]);

  const handleAddField = () => {
    const newField: IntakeField = {
      id: `f-${Date.now()}`,
      fieldKey: `custom_field_${Date.now()}`,
      label: "New Question Label",
      fieldType: "text",
      placeholder: "e.g. Enter details",
      isRequired: false,
      displayOrder: fields.length + 1,
    };
    setFields((prev) => [...prev, newField]);
  };

  const handleRemoveField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === fields.length - 1) return;

    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const reordered = [...fields];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    setFields(reordered);
  };

  const handleFieldChange = (id: string, updates: Partial<IntakeField>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const handleSave = () => {
    saveIntakeFields(selectedOfferingId, fields);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const selectedOffering = offerings.find((o) => o.id === selectedOfferingId);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-gold-dark font-semibold">
            Dynamic Questionnaires
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            Intake Form Builder
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Build and tailor confidential questions per offering. Saved templates immediately update the guest booking wizard.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedNotice && (
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Template saved & published!</span>
            </div>
          )}
          <Button variant="primary" size="sm" onClick={handleSave} className="gap-1.5 text-xs">
            <span>Save & Publish Version</span>
          </Button>
        </div>
      </div>

      {/* Offering Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-ink-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-ink">Select Offering Form:</label>
          <select
            value={selectedOfferingId}
            onChange={(e) => setSelectedOfferingId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-1 focus:ring-plum font-medium"
          >
            {offerings.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="plum" className="text-[10px]">
            Version: v{activeTemplate.version}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleAddField} className="text-xs gap-1">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Question</span>
          </Button>
        </div>
      </div>

      {/* Editor & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Fields Configurator */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-serif text-base font-medium text-ink">
            Configured Fields ({fields.length})
          </h3>

          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="bg-white p-4 rounded-xl border border-ink-border shadow-subtle space-y-3"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-mono text-[11px] text-plum font-semibold">
                  Field #{idx + 1}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, "up")}
                    className="p-1 text-ink-muted hover:text-ink disabled:opacity-20"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === fields.length - 1}
                    onClick={() => handleMove(idx, "down")}
                    className="p-1 text-ink-muted hover:text-ink disabled:opacity-20"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveField(field.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded ml-1"
                    title="Delete field"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-ink mb-1">Question Label</label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => handleFieldChange(field.id, { label: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-ink-border bg-canvas-light text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-ink mb-1">Input Type</label>
                  <select
                    value={field.fieldType}
                    onChange={(e) =>
                      handleFieldChange(field.id, {
                        fieldType: e.target.value as IntakeFieldType,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded border border-ink-border bg-canvas-light text-xs"
                  >
                    <option value="text">Single Line Text</option>
                    <option value="textarea">Paragraph Textarea</option>
                    <option value="select">Dropdown Select</option>
                    <option value="radio">Radio Options</option>
                    <option value="number">Number</option>
                  </select>
                </div>
              </div>

              {(field.fieldType === "select" || field.fieldType === "radio") && (
                <div className="text-xs">
                  <label className="block text-[11px] font-medium text-ink mb-1">
                    Options (comma separated)
                  </label>
                  <input
                    type="text"
                    value={field.options?.join(", ") || ""}
                    placeholder="Option 1, Option 2, Option 3"
                    onChange={(e) =>
                      handleFieldChange(field.id, {
                        options: e.target.value.split(",").map((s) => s.trim()),
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded border border-ink-border bg-canvas-light text-xs"
                  />
                </div>
              )}

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.isRequired}
                    onChange={(e) =>
                      handleFieldChange(field.id, { isRequired: e.target.checked })
                    }
                    className="rounded text-plum focus:ring-plum"
                  />
                  <span>Mandatory / Required</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Live Form Interactive Preview */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-canvas-light p-6 rounded-2xl border border-ink-border shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-ink-border/50">
              <span className="font-serif text-sm font-semibold text-ink flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-plum" />
                <span>Live Guest Preview</span>
              </span>
              <Badge variant="sage" className="text-[10px]">
                {selectedOffering?.title}
              </Badge>
            </div>

            <div className="space-y-4 text-xs">
              {fields.map((f) => (
                <div key={f.id} className="space-y-1">
                  <label className="block font-medium text-ink">
                    {f.label} {f.isRequired && <span className="text-red-600">*</span>}
                  </label>
                  {f.fieldType === "textarea" ? (
                    <textarea
                      disabled
                      rows={2}
                      placeholder={f.placeholder || "Client response..."}
                      className="w-full px-2.5 py-1.5 rounded border bg-white opacity-80 text-xs"
                    />
                  ) : f.fieldType === "select" ? (
                    <select disabled className="w-full px-2.5 py-1.5 rounded border bg-white opacity-80 text-xs">
                      {f.options?.map((opt, i) => (
                        <option key={i}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      disabled
                      type={f.fieldType}
                      placeholder={f.placeholder || "Client response..."}
                      className="w-full px-2.5 py-1.5 rounded border bg-white opacity-80 text-xs"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
