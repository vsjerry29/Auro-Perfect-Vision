"use client";

import React, { useState, useEffect, useRef } from "react";
import { Therapist, Offering } from "@/lib/types";
import { Plus, Edit2, Upload, User, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export default function AdminTherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTherapist, setEditingTherapist] = useState<Therapist | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  // Form State
  const [displayName, setDisplayName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [specialtiesText, setSpecialtiesText] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  // File Upload
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const [tRes, oRes] = await Promise.all([
        fetch("/api/admin/therapists"),
        fetch("/api/admin/offerings"),
      ]);
      if (tRes.ok) {
        const tData = await tRes.json();
        setTherapists(tData.therapists || []);
      }
      if (oRes.ok) {
        const oData = await oRes.json();
        setOfferings(oData.offerings || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleOpenCreate = () => {
    setEditingTherapist(null);
    setDisplayName("");
    setRoleTitle("Vision Wellness Practitioner");
    setBio("");
    setQualifications("Holistic Vision Therapy Specialist (Auroville)");
    setSpecialtiesText("Eye Yoga, Screen Strain Recovery");
    setPhotoUrl("https://images.unsplash.com/photo-1594824813583-8a07f7b243b6?auto=format&fit=crop&w=800&q=80");
    setEmail("practitioner@auroperfectvision.com");
    setPhone("+91 98765 43210");
    setIsPublished(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (t: Therapist) => {
    setEditingTherapist(t);
    setDisplayName(t.displayName);
    setRoleTitle(t.roleTitle);
    setBio(t.bio);
    setQualifications(t.qualifications);
    setSpecialtiesText(t.specialties.join(", "));
    setPhotoUrl(t.photoUrl);
    setEmail(t.email);
    setPhone(t.phone);
    setIsPublished(t.isPublished);
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setPhotoUrl(data.url);
        showToast("Portrait uploaded successfully!");
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Network error uploading portrait");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      alert("Practitioner name is required.");
      return;
    }

    const payload = {
      ...(editingTherapist ? { id: editingTherapist.id } : {}),
      displayName: displayName.trim(),
      roleTitle: roleTitle.trim(),
      bio: bio.trim(),
      qualifications: qualifications.trim(),
      specialties: specialtiesText.split(",").map((s) => s.trim()).filter(Boolean),
      photoUrl,
      email: email.trim(),
      phone: phone.trim(),
      isPublished,
    };

    try {
      const res = await fetch("/api/admin/therapists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Practitioner profile saved and synchronized with public site!");
        setModalOpen(false);
        fetchData();
      } else {
        alert("Failed to save practitioner profile.");
      }
    } catch {
      alert("Network error saving practitioner.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-plum text-white px-5 py-3 rounded-2xl shadow-elevated text-xs flex items-center gap-2 border border-gold/40">
          <CheckCircle2 className="w-4 h-4 text-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-gold-dark font-semibold">
            Practitioner Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            Team & Practitioners
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Manage educators, bios, photos, and public profile visibility on the website.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenCreate} className="gap-2 text-xs font-semibold">
          <Plus className="w-4 h-4" />
          <span>+ Add Practitioner</span>
        </Button>
      </div>

      {/* Practitioners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {therapists.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl border border-ink-border shadow-subtle p-6 flex flex-col justify-between hover:shadow-card transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-canvas-dark border-2 border-gold/40 shrink-0">
                <img src={t.photoUrl} alt={t.displayName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-medium text-ink truncate">{t.displayName}</h3>
                  <Badge variant={t.isPublished ? "success" : "warning"} className="text-[10px]">
                    {t.isPublished ? "Published" : "Hidden"}
                  </Badge>
                </div>
                <p className="text-xs text-gold-dark font-sans tracking-wide truncate mt-0.5">{t.roleTitle}</p>
                <p className="text-[11px] text-ink-muted line-clamp-2 mt-2 leading-relaxed">{t.bio}</p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-ink-border/50 flex items-center justify-between text-xs">
              <span className="text-ink-muted text-[11px]">{t.email}</span>
              <Button variant="outline" size="sm" onClick={() => handleOpenEdit(t)} className="text-xs gap-1">
                <Edit2 className="w-3 h-3 text-plum" />
                <span>Edit Profile</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingTherapist ? `Edit: ${editingTherapist.displayName}` : "Add New Practitioner"}
          description="Update biography, portrait photo, and areas of work."
          maxWidth="lg"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-canvas-dark border-2 border-gold shrink-0">
                {photoUrl ? (
                  <img src={photoUrl} alt="Portrait" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-ink-muted m-auto" />
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? "Uploading..." : "Upload Portrait"}</span>
                </Button>
                <p className="text-[10px] text-ink-muted mt-1">Square or portrait JPG/PNG up to 5MB</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-ink mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink text-xs focus:ring-1 focus:ring-plum"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Role Title</label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Vision Wellness Practitioner"
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink text-xs focus:ring-1 focus:ring-plum"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Qualifications & Credentials</label>
              <input
                type="text"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                placeholder="e.g. Certified Natural Vision Educator (Auroville)"
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Biography</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Mindful background and experience..."
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Specialties (comma separated)</label>
              <input
                type="text"
                value={specialtiesText}
                onChange={(e) => setSpecialtiesText(e.target.value)}
                placeholder="Eye Yoga, Screen Strain Recovery, Children's Vision"
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isPublishedCheck"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded text-plum focus:ring-plum"
              />
              <label htmlFor="isPublishedCheck" className="text-xs font-medium text-ink cursor-pointer">
                Publish profile to public /team page
              </label>
            </div>

            <div className="pt-4 border-t border-ink-border flex justify-end gap-3">
              <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Practitioner Profile
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
