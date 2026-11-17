"use client";

import React, { useState } from "react";
import { useDemoStore } from "@/lib/store";
import { Offering, OfferingCategory, OfferingFormat, OfferingDelivery } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit2, Trash2, CheckCircle2, Clock, Users, User, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export default function AdminOfferingsPage() {
  const { offerings, therapists, addOffering, updateOffering, deleteOffering } = useDemoStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<Offering | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState<OfferingCategory>("eye-yoga");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [formatType, setFormatType] = useState<OfferingFormat>("individual");
  const [delivery, setDelivery] = useState<OfferingDelivery>("onsite");
  const [priceINR, setPriceINR] = useState(2000);
  const [priceUSD, setPriceUSD] = useState(40);
  const [maxCapacity, setMaxCapacity] = useState(1);
  const [isFlagshipProgramme, setIsFlagshipProgramme] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [assignedTherapistIds, setAssignedTherapistIds] = useState<string[]>(["therapist-1"]);

  const handleOpenCreate = () => {
    setEditingOffering(null);
    setTitle("");
    setSlug("");
    setCategory("eye-yoga");
    setShortDescription("");
    setFullDescription("");
    setDurationMinutes(60);
    setFormatType("individual");
    setDelivery("onsite");
    setPriceINR(2000);
    setPriceUSD(40);
    setMaxCapacity(1);
    setIsFlagshipProgramme(false);
    setFeatured(false);
    setAssignedTherapistIds(["therapist-1"]);
    setModalOpen(true);
  };

  const handleOpenEdit = (offering: Offering) => {
    setEditingOffering(offering);
    setTitle(offering.title);
    setSlug(offering.slug);
    setCategory(offering.category);
    setShortDescription(offering.shortDescription);
    setFullDescription(offering.fullDescription);
    setDurationMinutes(offering.durationMinutes);
    setFormatType(offering.format);
    setDelivery(offering.delivery);
    setPriceINR(offering.price.inr);
    setPriceUSD(offering.price.usd);
    setMaxCapacity(offering.maxCapacity);
    setIsFlagshipProgramme(offering.isFlagshipProgramme);
    setFeatured(offering.featured);
    setAssignedTherapistIds(offering.assignedTherapistIds);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category,
      shortDescription,
      fullDescription: fullDescription || shortDescription,
      durationMinutes: Number(durationMinutes),
      format: formatType,
      delivery,
      price: {
        inr: Number(priceINR),
        usd: Number(priceUSD),
        taxInclusive: true,
      },
      assignedTherapistIds,
      maxCapacity: Number(maxCapacity),
      isFlagshipProgramme,
      featured,
      suitableFor: ["General eye strain relief", "Mindful computer vision hygiene"],
      whatToExpect: ["Individual assessment", "Guided ocular relaxation"],
      imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80",
      isPublished: true,
    };

    if (editingOffering) {
      updateOffering(editingOffering.id, data);
    } else {
      addOffering(data);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-gold-dark font-semibold">
            Catalogue Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            Sessions & Flagship Programmes
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Create, edit, and organize offerings. Changes immediately update public catalogue and booking availability.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-1.5 text-xs">
          <Plus className="w-4 h-4" />
          <span>Add New Offering</span>
        </Button>
      </div>

      {/* Offerings List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offerings.map((offering) => (
          <div
            key={offering.id}
            className="bg-white rounded-xl border border-ink-border shadow-subtle p-5 flex flex-col justify-between hover:shadow-card transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant={offering.isFlagshipProgramme ? "gold" : "plum"} className="text-[10px]">
                  {offering.isFlagshipProgramme ? "Programme" : "Session"}
                </Badge>
                <span className="text-xs font-semibold text-plum">
                  {formatCurrency(offering.price.inr, "INR")} / ${offering.price.usd}
                </span>
              </div>

              <h3 className="font-serif text-base font-medium text-ink mb-2">
                {offering.title}
              </h3>

              <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed mb-4">
                {offering.shortDescription}
              </p>

              <div className="flex items-center gap-3 text-xs text-ink-muted border-t pt-3 border-ink-border/50">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {offering.durationMinutes}m
                </span>
                <span className="capitalize">{offering.delivery}</span>
                <span className="capitalize">{offering.format}</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-ink-border/60 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleOpenEdit(offering)}
                className="text-xs text-plum hover:underline font-medium flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit Offering</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to remove this offering?")) {
                    deleteOffering(offering.id);
                  }
                }}
                className="text-xs text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingOffering ? "Edit Offering" : "Create New Offering"}
          description="Configure titles, pricing, format, and therapist assignments."
          maxWidth="lg"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-ink mb-1">Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-ink-border bg-canvas-light text-ink text-xs focus:ring-1 focus:ring-plum"
              />
            </div>

            <div>
              <label className="block font-medium text-ink mb-1">Short Description *</label>
              <textarea
                rows={2}
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-ink-border bg-canvas-light text-ink text-xs focus:ring-1 focus:ring-plum"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-medium text-ink mb-1">Duration (Mins)</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-ink text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">Format</label>
                <select
                  value={formatType}
                  onChange={(e) => setFormatType(e.target.value as OfferingFormat)}
                  className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-ink text-xs"
                >
                  <option value="individual">Individual (1:1)</option>
                  <option value="group">Group</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">Delivery</label>
                <select
                  value={delivery}
                  onChange={(e) => setDelivery(e.target.value as OfferingDelivery)}
                  className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-ink text-xs"
                >
                  <option value="onsite">On-site (Auroville)</option>
                  <option value="online">Online (Video)</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">Max Capacity</label>
                <input
                  type="number"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-ink text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-ink mb-1">Price in INR (₹)</label>
                <input
                  type="number"
                  value={priceINR}
                  onChange={(e) => setPriceINR(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-ink text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">Price in USD ($)</label>
                <input
                  type="number"
                  value={priceUSD}
                  onChange={(e) => setPriceUSD(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-ink text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFlagshipProgramme}
                  onChange={(e) => setIsFlagshipProgramme(e.target.checked)}
                  className="rounded text-plum focus:ring-plum"
                />
                <span>Flagship Programme</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded text-plum focus:ring-plum"
                />
                <span>Featured on Homepage</span>
              </label>
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
              <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                {editingOffering ? "Update Offering" : "Create Offering"}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
