"use client";

import React, { useState, useEffect, useRef } from "react";
import { Offering, Therapist, OfferingCategory, OfferingFormat, OfferingDelivery } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Edit2,
  Copy,
  Archive,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Users,
  User,
  ArrowRight,
  Eye,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export default function AdminOfferingsPage() {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<Offering | null>(null);
  const [toastMessage, setToastMessage] = useState<string>("");

  // Editor Simple State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [formatType, setFormatType] = useState<OfferingFormat>("individual");
  const [delivery, setDelivery] = useState<OfferingDelivery>("onsite");
  const [priceINR, setPriceINR] = useState(2000);
  const [assignedTherapistIds, setAssignedTherapistIds] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Editor Advanced State (Collapsed by default)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [category, setCategory] = useState<OfferingCategory>("eye-yoga");
  const [fullDescription, setFullDescription] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(1);
  const [isFlagshipProgramme, setIsFlagshipProgramme] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [suitableForText, setSuitableForText] = useState("");
  const [whatToExpectText, setWhatToExpectText] = useState("");

  // File Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchOfferings = async () => {
    try {
      const [offRes, therRes] = await Promise.all([
        fetch("/api/admin/offerings"),
        fetch("/api/admin/therapists"),
      ]);
      if (offRes.ok) {
        const offData = await offRes.json();
        setOfferings(offData.offerings || []);
      }
      if (therRes.ok) {
        const therData = await therRes.json();
        setTherapists(therData.therapists || []);
      }
    } catch (err) {
      console.error("Error loading offerings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfferings();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleOpenCreate = () => {
    setEditingOffering(null);
    setTitle("");
    setSlug("");
    setShortDescription("");
    setDurationMinutes(60);
    setFormatType("individual");
    setDelivery("onsite");
    setPriceINR(2000);
    setAssignedTherapistIds(therapists.length > 0 ? [therapists[0].id] : []);
    setImageUrl("https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80");
    setIsPublished(true); // default to publish or draft
    setShowAdvanced(false);
    setCategory("eye-yoga");
    setFullDescription("");
    setMaxCapacity(1);
    setIsFlagshipProgramme(false);
    setFeatured(false);
    setSuitableForText("Screen users, digital fatigue, holistic eye wellness");
    setWhatToExpectText("Individual evaluation, gentle eye relaxation, guided palming");
    setUploadError("");
    setModalOpen(true);
  };

  const handleOpenEdit = (offering: Offering) => {
    setEditingOffering(offering);
    setTitle(offering.title);
    setSlug(offering.slug);
    setShortDescription(offering.shortDescription);
    setDurationMinutes(offering.durationMinutes);
    setFormatType(offering.format);
    setDelivery(offering.delivery);
    setPriceINR(offering.price.inr);
    setAssignedTherapistIds(offering.assignedTherapistIds || []);
    setImageUrl(offering.imageUrl || "");
    setIsPublished(offering.isPublished);
    setShowAdvanced(false);
    setCategory(offering.category);
    setFullDescription(offering.fullDescription || "");
    setMaxCapacity(offering.maxCapacity || 1);
    setIsFlagshipProgramme(offering.isFlagshipProgramme);
    setFeatured(offering.featured);
    setSuitableForText((offering.suitableFor || []).join("\n"));
    setWhatToExpectText((offering.whatToExpect || []).join("\n"));
    setUploadError("");
    setModalOpen(true);
  };

  // Auto-generate slug when title changes in create mode
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingOffering) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generated);
    }
  };

  // Image Upload Handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Upload failed");
      } else {
        setImageUrl(data.url);
        showToast("Image uploaded successfully!");
      }
    } catch {
      setUploadError("Network error while uploading image.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Save handler (can be Draft or Published)
  const handleSave = async (publishStatus: boolean) => {
    if (!title.trim()) {
      alert("Therapy name is required.");
      return;
    }

    const payload = {
      ...(editingOffering ? { id: editingOffering.id } : {}),
      title: title.trim(),
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category,
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim() || shortDescription.trim(),
      durationMinutes: Number(durationMinutes) || 60,
      format: formatType,
      delivery,
      price: {
        inr: Number(priceINR) || 0,
        usd: Math.round((Number(priceINR) || 0) / 80),
        taxInclusive: true,
      },
      assignedTherapistIds,
      maxCapacity: Number(maxCapacity) || 1,
      isFlagshipProgramme,
      featured,
      suitableFor: suitableForText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      whatToExpect: whatToExpectText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      imageUrl:
        imageUrl ||
        "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80",
      isPublished: publishStatus,
    };

    try {
      const res = await fetch("/api/admin/offerings", {
        method: editingOffering ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(
          publishStatus
            ? "Therapy published! Changes are now live on the public site."
            : "Therapy saved as draft (hidden from public catalogue)."
        );
        setModalOpen(false);
        fetchOfferings();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to save therapy");
      }
    } catch {
      alert("Network error saving therapy");
    }
  };

  // Duplicate handler
  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch("/api/admin/offerings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate", id }),
      });
      if (res.ok) {
        showToast("Therapy duplicated into draft copy!");
        fetchOfferings();
      }
    } catch {
      alert("Error duplicating therapy");
    }
  };

  // Toggle publish quick action
  const handleTogglePublish = async (offering: Offering) => {
    try {
      const res = await fetch("/api/admin/offerings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...offering,
          isPublished: !offering.isPublished,
        }),
      });
      if (res.ok) {
        showToast(
          !offering.isPublished
            ? `Published "${offering.title}" to public catalogue!`
            : `Unpublished "${offering.title}" (moved to draft)`
        );
        fetchOfferings();
      }
    } catch {
      alert("Error toggling publication state");
    }
  };

  // Filtered offerings list
  const filtered = offerings.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && o.isPublished) ||
      (statusFilter === "draft" && !o.isPublished);

    const matchesCategory =
      categoryFilter === "all" || o.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-plum text-white px-5 py-3 rounded-2xl shadow-elevated text-xs flex items-center gap-2 border border-gold/40 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-gold-dark font-semibold">
            Live Website Catalogue
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            Therapies & Catalog Management
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Add, edit, publish, or unpublish eye wellness therapies and flagship retreats with photos and pricing.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          className="gap-2 text-xs font-semibold shadow-subtle shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Therapy</span>
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-ink-border shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by therapy name or keywords..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-1 focus:ring-plum"
          >
            <option value="all">All Statuses ({offerings.length})</option>
            <option value="published">
              Published ({offerings.filter((o) => o.isPublished).length})
            </option>
            <option value="draft">
              Drafts ({offerings.filter((o) => !o.isPublished).length})
            </option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-1 focus:ring-plum"
          >
            <option value="all">All Categories</option>
            <option value="eye-yoga">Eye Yoga</option>
            <option value="stress-relief">Stress Relief</option>
            <option value="specialized-therapy">Specialized Therapy</option>
            <option value="vision-skills">Vision Skills</option>
            <option value="programmes">Flagship Programmes</option>
          </select>
        </div>
      </div>

      {/* Offerings Grid / Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-ink-muted">Loading catalogue records...</div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-ink-border space-y-3">
          <AlertCircle className="w-8 h-8 text-ink-faint mx-auto" />
          <h3 className="font-serif text-lg text-ink font-normal">No therapies found</h3>
          <p className="text-xs text-ink-muted">Try adjusting your search criteria or add a new therapy.</p>
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            + Add First Therapy
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((offering) => (
            <div
              key={offering.id}
              className={`bg-white rounded-2xl border shadow-subtle p-5 flex flex-col justify-between hover:shadow-card transition-all ${
                offering.isPublished ? "border-ink-border" : "border-amber-200 bg-amber-50/20"
              }`}
            >
              <div>
                {/* Image and Status Badges */}
                <div className="relative h-44 rounded-xl overflow-hidden bg-canvas-dark mb-4">
                  <img
                    src={offering.imageUrl}
                    alt={offering.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    <Badge
                      variant={offering.isPublished ? "success" : "warning"}
                      className="shadow-sm text-[10px]"
                    >
                      {offering.isPublished ? "Published" : "Draft"}
                    </Badge>
                    {offering.isFlagshipProgramme && (
                      <Badge variant="gold" className="shadow-sm text-[10px]">
                        Programme
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-ink-muted mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {offering.durationMinutes} mins
                  </span>
                  <span className="font-semibold text-plum">
                    {formatCurrency(offering.price.inr, "INR")}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-medium text-ink mb-1.5 line-clamp-1">
                  {offering.title}
                </h3>

                <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed mb-4">
                  {offering.shortDescription}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-ink-faint border-t pt-3 border-ink-border/50">
                  <span className="capitalize">{offering.delivery}</span>
                  <span>•</span>
                  <span className="capitalize">{offering.format}</span>
                  <span>•</span>
                  <span>{offering.assignedTherapistIds.length} therapist(s) assigned</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-4 border-t border-ink-border/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(offering)}
                    className="text-plum hover:underline font-medium flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicate(offering.id)}
                    className="text-ink-muted hover:text-ink flex items-center gap-1"
                    title="Duplicate as new draft"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(offering)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      offering.isPublished
                        ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    }`}
                  >
                    {offering.isPublished ? "Unpublish" : "Publish"}
                  </button>

                  {offering.isPublished && (
                    <a
                      href={`/therapies/${offering.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-ink-muted hover:text-plum"
                      title="View on public site"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Guided "Add / Edit Therapy" Modal Dialogue */}
      {modalOpen && (
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingOffering ? `Edit: ${editingOffering.title}` : "Add New Therapy"}
          description="Simple mode first. Configure the essential details, photo, and pricing."
          maxWidth="xl"
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Simple Mode: Essential Fields */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Photo Upload & Preview Box (Left on Desktop) */}
              <div className="md:col-span-5 space-y-3">
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                  Cover Photo
                </label>
                <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-ink-border bg-canvas-light flex flex-col items-center justify-center p-4 text-center group min-h-[200px]">
                  {imageUrl ? (
                    <>
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-44 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute top-6 right-6 p-1.5 rounded-full bg-ink/70 text-white hover:bg-ink"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2 py-4">
                      <ImageIcon className="w-10 h-10 text-ink-muted mx-auto stroke-1" />
                      <p className="text-xs font-medium text-ink">Upload therapy cover image</p>
                      <p className="text-[10px] text-ink-muted">JPG, PNG, or WebP up to 5MB (16:9 recommended)</p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageFileChange}
                  />

                  <div className="mt-3 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full text-xs gap-1.5 bg-white"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? "Uploading..." : imageUrl ? "Replace Image" : "Select from Computer"}</span>
                    </Button>
                  </div>
                </div>
                {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
              </div>

              {/* Essential Form Inputs (Right on Desktop) */}
              <div className="md:col-span-7 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-ink mb-1">
                    Therapy Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Eye Yoga for Screen Fatigue"
                    className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink text-sm font-medium focus:ring-2 focus:ring-plum focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-ink mb-1">
                    Public Web Address (Slug)
                  </label>
                  <div className="flex items-center text-ink-muted bg-canvas-dark/40 px-3 py-1.5 rounded-lg border border-ink-border font-mono text-[11px]">
                    <span className="shrink-0">/therapies/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="bg-transparent text-ink font-medium w-full focus:outline-none ml-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">
                    Short Summary (Shows on Catalogue Card) <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Brief 1-2 sentence description for visitors..."
                    className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink focus:ring-1 focus:ring-plum focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-ink mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-ink"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-ink mb-1">Delivery Mode</label>
                    <select
                      value={delivery}
                      onChange={(e) => setDelivery(e.target.value as OfferingDelivery)}
                      className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-ink"
                    >
                      <option value="onsite">On-site (Pondicherry)</option>
                      <option value="online">Online Video</option>
                      <option value="hybrid">Hybrid (Both)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={priceINR}
                    onChange={(e) => setPriceINR(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-ink font-semibold"
                    placeholder="2000"
                  />
                  <span className="text-[11px] text-ink-muted mt-1 block">Indian Rupees (INR) • Tax-inclusive fee</span>
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">
                    Assign Practitioner(s)
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {therapists.map((therapist) => {
                      const isAssigned = assignedTherapistIds.includes(therapist.id);
                      return (
                        <button
                          key={therapist.id}
                          type="button"
                          onClick={() => {
                            if (isAssigned) {
                              setAssignedTherapistIds((prev) =>
                                prev.filter((id) => id !== therapist.id)
                              );
                            } else {
                              setAssignedTherapistIds((prev) => [...prev, therapist.id]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                            isAssigned
                              ? "bg-plum text-white border-plum"
                              : "bg-white text-ink border-ink-border hover:bg-canvas-light"
                          }`}
                        >
                          <span>{therapist.displayName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsible Advanced Section */}
            <div className="border border-ink-border rounded-2xl bg-canvas-light/50 p-4 space-y-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between text-xs font-semibold text-ink hover:text-plum transition-colors"
              >
                <span>Advanced Configuration (Category, Syllabus & SEO)</span>
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showAdvanced && (
                <div className="pt-3 border-t border-ink-border space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-ink mb-1">Service Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as OfferingCategory)}
                        className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-white text-ink text-xs"
                      >
                        <option value="eye-yoga">Eye Yoga</option>
                        <option value="stress-relief">Vision Stress Relief</option>
                        <option value="specialized-therapy">Specialized Vision Therapy</option>
                        <option value="vision-skills">Visual Skill Enhancement</option>
                        <option value="programmes">Flagship Programme</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-ink mb-1">Format Type</label>
                      <select
                        value={formatType}
                        onChange={(e) => setFormatType(e.target.value as OfferingFormat)}
                        className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-white text-ink text-xs"
                      >
                        <option value="individual">Individual (1-on-1)</option>
                        <option value="group">Group / Retreat</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-ink mb-1">
                      Full Detailed Description (Shows on Detail Page)
                    </label>
                    <textarea
                      rows={4}
                      value={fullDescription}
                      onChange={(e) => setFullDescription(e.target.value)}
                      placeholder="Comprehensive overview of session methodology and practices..."
                      className="w-full px-3 py-2 rounded-xl border border-ink-border bg-white text-ink text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-ink mb-1">
                        What to Expect (one point per line)
                      </label>
                      <textarea
                        rows={3}
                        value={whatToExpectText}
                        onChange={(e) => setWhatToExpectText(e.target.value)}
                        placeholder="Point 1&#10;Point 2&#10;Point 3"
                        className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-white text-ink text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-ink mb-1">
                        Suitable For (one point per line)
                      </label>
                      <textarea
                        rows={3}
                        value={suitableForText}
                        onChange={(e) => setSuitableForText(e.target.value)}
                        placeholder="Point 1&#10;Point 2&#10;Point 3"
                        className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-white text-ink text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={isFlagshipProgramme}
                        onChange={(e) => setIsFlagshipProgramme(e.target.checked)}
                        className="rounded text-plum focus:ring-plum"
                      />
                      <span>Flagship Multi-Session Programme</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="rounded text-plum focus:ring-plum"
                      />
                      <span>Featured on Homepage</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions: Save Draft vs Publish */}
            <div className="pt-4 border-t border-ink-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => handleSave(false)}
                  className="w-full sm:w-auto text-xs"
                >
                  Save as Draft
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  type="button"
                  onClick={() => handleSave(true)}
                  className="w-full sm:w-auto text-xs gap-1.5 font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish to Website</span>
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
