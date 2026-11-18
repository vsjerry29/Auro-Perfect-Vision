"use client";

import React, { useState, useEffect, useRef } from "react";
import { Therapist, Offering } from "@/lib/types";
import {
  Plus,
  Edit2,
  Upload,
  User,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Trash2,
  RotateCcw,
  Calendar,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface EnrichedTherapist extends Therapist {
  upcomingBookingsCount?: number;
}

export default function AdminTherapistsPage() {
  const [therapists, setTherapists] = useState<EnrichedTherapist[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTherapist, setEditingTherapist] = useState<EnrichedTherapist | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  // Removal Safety Modal State
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [targetForRemoval, setTargetForRemoval] = useState<EnrichedTherapist | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);

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
    setPhone("+91 8012305151");
    setIsPublished(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (t: EnrichedTherapist) => {
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

  const handleOpenRemove = (t: EnrichedTherapist) => {
    setTargetForRemoval(t);
    // Select first alternative active therapist for reassignment default
    const otherActive = therapists.filter((other) => other.id !== t.id && !other.isArchived);
    setReassignTargetId(otherActive.length > 0 ? otherActive[0].id : "");
    setRemoveModalOpen(true);
  };

  const handleExecuteRemoval = async () => {
    if (!targetForRemoval) return;

    setActionLoading(true);
    try {
      const hasUpcoming = (targetForRemoval.upcomingBookingsCount || 0) > 0;
      const payload: any = {
        id: targetForRemoval.id,
      };

      if (hasUpcoming) {
        if (!reassignTargetId) {
          alert("Please select a practitioner to reassign upcoming appointments to.");
          setActionLoading(false);
          return;
        }
        payload.reassignToTherapistId = reassignTargetId;
      }

      const res = await fetch("/api/admin/therapists", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          hasUpcoming
            ? `Archived ${targetForRemoval.displayName} and reassigned upcoming appointments safely.`
            : `Practitioner ${targetForRemoval.displayName} archived successfully.`
        );
        setRemoveModalOpen(false);
        setTargetForRemoval(null);
        fetchData();
      } else {
        alert(data.error || "Failed to archive practitioner.");
      }
    } catch {
      alert("Network error processing removal.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async (t: EnrichedTherapist) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/therapists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: t.id, action: "reactivate" }),
      });

      if (res.ok) {
        showToast(`Practitioner ${t.displayName} reactivated and restored to active staff.`);
        fetchData();
      } else {
        alert("Failed to reactivate practitioner.");
      }
    } catch {
      alert("Network error reactivating practitioner.");
    } finally {
      setActionLoading(false);
    }
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

  const activeTherapists = therapists.filter((t) => !t.isArchived);
  const archivedTherapists = therapists.filter((t) => t.isArchived);
  const displayList = activeTab === "active" ? activeTherapists : archivedTherapists;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-purple text-white px-5 py-3 rounded-2xl shadow-elevated text-xs flex items-center gap-2 border border-brand-orange/40">
          <CheckCircle2 className="w-4 h-4 text-brand-orange" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-brand-purple font-semibold">
            Practitioner Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            Vision Practitioners & Therapists
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Manage clinical profiles, public booking visibility, and safe departure archiving.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          className="gap-2 text-xs font-semibold bg-brand-orange hover:bg-brand-orangeHover text-white"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Practitioner</span>
        </Button>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-ink-border pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 text-xs font-sora font-semibold rounded-t-xl transition-all ${
            activeTab === "active"
              ? "bg-white text-brand-purple border-t border-l border-r border-ink-border shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Active Practitioners ({activeTherapists.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("archived")}
          className={`px-4 py-2 text-xs font-sora font-semibold rounded-t-xl transition-all ${
            activeTab === "archived"
              ? "bg-white text-rose-700 border-t border-l border-r border-ink-border shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Archived ({archivedTherapists.length})
        </button>
      </div>

      {/* Practitioners Grid */}
      {displayList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-ink-border p-6">
          <UserX className="w-10 h-10 text-ink-muted mx-auto mb-2" />
          <p className="text-sm font-sora font-medium text-ink">
            {activeTab === "active" ? "No active practitioners found." : "No archived practitioners."}
          </p>
          <p className="text-xs text-ink-muted mt-1">
            {activeTab === "active"
              ? "Click '+ Add Practitioner' to introduce your eye care team."
              : "Archived practitioners will appear here with full restoration support."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayList.map((t) => {
            const upcomingCount = t.upcomingBookingsCount || 0;
            return (
              <div
                key={t.id}
                className={`bg-white rounded-2xl border border-ink-border shadow-subtle p-6 flex flex-col justify-between hover:shadow-card transition-all ${
                  t.isArchived ? "opacity-75 bg-canvas-light/60" : ""
                }`}
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-canvas-dark border-2 border-brand-purple/20 shrink-0">
                      <img src={t.photoUrl} alt={t.displayName} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-serif text-lg font-medium text-ink truncate">{t.displayName}</h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {t.isArchived ? (
                            <Badge variant="warning" className="text-[10px]">
                              Archived
                            </Badge>
                          ) : t.isPublished ? (
                            <Badge variant="success" className="text-[10px]">
                              Live
                            </Badge>
                          ) : (
                            <Badge variant="faint" className="text-[10px]">
                              Hidden
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-brand-purple font-sans font-medium tracking-wide truncate mt-0.5">
                        {t.roleTitle}
                      </p>

                      {upcomingCount > 0 && !t.isArchived && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200">
                          <Calendar className="w-3 h-3 text-amber-600" />
                          <span>{upcomingCount} upcoming appointments</span>
                        </div>
                      )}

                      <p className="text-[11px] text-ink-muted line-clamp-2 mt-2 leading-relaxed">{t.bio}</p>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-4 mt-4 border-t border-ink-border/50 flex items-center justify-between text-xs">
                  <span className="text-ink-muted text-[11px] truncate max-w-[150px]">{t.email}</span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(t)}
                      className="text-xs gap-1 border-ink-border hover:bg-canvas-light"
                    >
                      <Edit2 className="w-3 h-3 text-brand-purple" />
                      <span>Edit</span>
                    </Button>

                    {!t.isArchived ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleOpenRemove(t)}
                        className="text-xs gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" />
                        <span>Remove</span>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReactivate(t)}
                        className="text-xs gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                      >
                        <RotateCcw className="w-3 h-3 text-emerald-600" />
                        <span>Reactivate</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Remove Confirmation & Safety Modal */}
      {targetForRemoval && (
        <ConfirmModal
          open={removeModalOpen}
          onClose={() => {
            setRemoveModalOpen(false);
            setTargetForRemoval(null);
          }}
          onConfirm={handleExecuteRemoval}
          title={`Remove Practitioner: ${targetForRemoval.displayName}`}
          variant="danger"
          isLoading={actionLoading}
          confirmText={
            (targetForRemoval.upcomingBookingsCount || 0) > 0
              ? "Reassign & Archive"
              : "Safely Archive Practitioner"
          }
          description={
            (targetForRemoval.upcomingBookingsCount || 0) > 0 ? (
              <div className="space-y-2">
                <p className="font-semibold text-rose-700">
                  Active Booking Protection Alert
                </p>
                <p>
                  This practitioner has{" "}
                  <strong>{targetForRemoval.upcomingBookingsCount} upcoming appointment(s)</strong>{" "}
                  scheduled with patients. To prevent cancellation disruption, please select an active practitioner below to receive these bookings.
                </p>
              </div>
            ) : (
              "This action archives the practitioner and removes them from the public booking directory. All past medical consultations, SOAP clinical notes, and appointment records are securely preserved in the EMR."
            )
          }
          extraContent={
            (targetForRemoval.upcomingBookingsCount || 0) > 0 ? (
              <div className="space-y-2 p-3 bg-white rounded-xl border border-amber-200">
                <label className="block text-xs font-semibold text-ink">
                  Reassign Upcoming Appointments To:
                </label>
                <select
                  value={reassignTargetId}
                  onChange={(e) => setReassignTargetId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-1 focus:ring-brand-purple"
                >
                  {therapists
                    .filter((other) => other.id !== targetForRemoval.id && !other.isArchived)
                    .map((other) => (
                      <option key={other.id} value={other.id}>
                        {other.displayName} ({other.roleTitle})
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-ink-muted">
                  Patients will retain their booked date and time slot with the new practitioner.
                </p>
              </div>
            ) : null
          }
        />
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingTherapist ? `Edit: ${editingTherapist.displayName}` : "Add New Practitioner"}
          description="Update biography, portrait photo, and areas of clinical expertise."
          maxWidth="lg"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-canvas-dark border-2 border-brand-purple/30 shrink-0">
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
                <p className="text-[10px] text-ink-muted mt-1">Square or portrait JPG/PNG/WebP up to 10MB</p>
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
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink text-xs focus:ring-1 focus:ring-brand-purple"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Role Title</label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Vision Wellness Practitioner"
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink text-xs focus:ring-1 focus:ring-brand-purple"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-ink mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink text-xs"
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
                className="rounded text-brand-purple focus:ring-brand-purple"
              />
              <label htmlFor="isPublishedCheck" className="text-xs font-medium text-ink cursor-pointer">
                Publish profile to public /team page
              </label>
            </div>

            <div className="pt-4 border-t border-ink-border flex justify-end gap-3">
              <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="bg-brand-orange hover:bg-brand-orangeHover text-white"
              >
                Save Practitioner Profile
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
