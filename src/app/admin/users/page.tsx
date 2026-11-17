"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  ShieldAlert,
  Shield,
  Plus,
  Mail,
  Phone,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Search,
  ExternalLink,
} from "lucide-react";
import { StaffUser } from "@/lib/server/auth";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "admin" as "super_admin" | "admin" | "therapist",
    initialPassword: "",
    roleTitle: "Vision Wellness Guide",
    specialties: "Bates Method, Eye Yoga, Palming",
    bio: "",
  });

  // Edit Modal
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [editRole, setEditRole] = useState<"super_admin" | "admin" | "therapist">("admin");
  const [editStatus, setEditStatus] = useState<"active" | "invited" | "suspended">("active");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to load staff roster");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || "Failed to load staff roster");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload: any = {
        fullName: inviteForm.fullName,
        email: inviteForm.email,
        phone: inviteForm.phone,
        role: inviteForm.role,
        initialPassword: inviteForm.initialPassword || "AuroVision@2026",
      };

      if (inviteForm.role === "therapist") {
        payload.therapistProfile = {
          displayName: inviteForm.fullName,
          roleTitle: inviteForm.roleTitle,
          bio: inviteForm.bio || "Certified practitioner at Auro Perfect Vision.",
          specialties: inviteForm.specialties.split(",").map((s) => s.trim()).filter(Boolean),
          isPublished: true,
        };
      }

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to invite staff user");
      }

      setShowInviteModal(false);
      setInviteForm({
        fullName: "",
        email: "",
        phone: "",
        role: "admin",
        initialPassword: "",
        roleTitle: "Vision Wellness Guide",
        specialties: "Bates Method, Eye Yoga, Palming",
        bio: "",
      });
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || "Error creating staff user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setIsUpdating(true);
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          role: editRole,
          status: editStatus,
          isActive: editStatus === "active",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update staff user");
      }

      setEditingUser(null);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || "Error updating staff user");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you certain you want to remove ${name} from staff access? This action is audited.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }

      await fetchUsers();
    } catch (err: any) {
      alert(err.message || "Error removing user");
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-ink-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-medium text-gold-dark uppercase tracking-wider">
              Administration & Security
            </span>
            <span className="text-xs text-ink-muted">•</span>
            <span className="text-xs font-sans text-plum font-medium">Access Control</span>
          </div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-ink">
            Staff Users & Practitioners
          </h1>
          <p className="text-xs font-sans text-ink-muted mt-0.5">
            Role authorization, permissions enforcement, and practitioner roster synchronization.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-plum text-white rounded-md text-xs font-sans hover:bg-plum-light transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" /> + Invite Staff Member
        </button>
      </div>

      {/* Role Permissions Information Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-ink-border shadow-sm space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-purple-100 text-purple-900 font-mono text-[10px] font-bold rounded uppercase">
              super_admin
            </span>
          </div>
          <p className="text-xs text-ink font-medium">Full Governance</p>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            Full access to all modules, billing, staff deletion, audit log access, and global system settings.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-ink-border shadow-sm space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-mono text-[10px] font-bold rounded uppercase">
              admin
            </span>
          </div>
          <p className="text-xs text-ink font-medium">Operational Administration</p>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            Manage Bookings, CRM, Clients 360, Website CMS, Media Library, Flagship Programmes, and Invoices.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-ink-border shadow-sm space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-mono text-[10px] font-bold rounded uppercase">
              therapist
            </span>
          </div>
          <p className="text-xs text-ink font-medium">Vision Wellness Practitioner</p>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            Restricted strictly to personal appointment schedule, clinical notes, availability slots, and time-off requests.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-ink-border p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search staff by name, email, or role..."
            className="w-full pl-9 pr-3 py-1.5 border border-ink-border rounded-lg text-xs font-sans bg-ivory/30 focus:outline-none focus:border-plum"
          />
        </div>
        <span className="text-xs font-sans text-ink-muted">
          Showing {filteredUsers.length} staff accounts
        </span>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-plum border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-ink-muted font-sans">Loading staff roster...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-ink-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-ivory border-b border-ink-border text-ink-muted font-medium">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Practitioner Profile</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-ivory/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-ink">{user.fullName}</div>
                      <div className="text-[11px] text-ink-muted">{user.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
                          user.role === "super_admin"
                            ? "bg-purple-100 text-purple-900"
                            : user.role === "admin"
                            ? "bg-blue-100 text-blue-900"
                            : "bg-emerald-100 text-emerald-900"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                          user.status === "active"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : user.status === "invited"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                      >
                        {user.status || "active"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-ink-muted">
                      {user.phone || "—"}
                    </td>
                    <td className="py-3 px-4">
                      {user.therapistId ? (
                        <Link
                          href="/admin/therapists"
                          className="text-plum hover:underline flex items-center gap-1 text-[11px]"
                        >
                          Synced Roster Profile <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-ink-muted text-[11px]">N/A (Administrative)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-ink-muted font-mono text-[11px]">
                      {user.createdAt ? user.createdAt.split("T")[0] : "2026-11-01"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setEditRole(user.role as any);
                            setEditStatus((user.status as any) || "active");
                          }}
                          className="p-1 text-ink-muted hover:text-plum rounded hover:bg-ivory"
                          title="Edit Role & Status"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.fullName)}
                          className="p-1 text-ink-muted hover:text-red-600 rounded hover:bg-red-50"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: INVITE STAFF ================= */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-ink-border max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-ink-border">
              <h3 className="font-serif text-lg font-medium text-ink">
                Invite Staff Member
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-ink-muted hover:text-ink text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-3 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={inviteForm.fullName}
                    onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
                    placeholder="e.g. Dr. K. Meenakshi"
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="staff@auroperfectvision.com"
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Phone</label>
                  <input
                    type="text"
                    value={inviteForm.phone}
                    onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Assigned Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e: any) => setInviteForm({ ...inviteForm, role: e.target.value })}
                    className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none capitalize"
                  >
                    <option value="admin">Administrator (CMS & Operations)</option>
                    <option value="therapist">Practitioner / Therapist</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">
                  Initial Temporary Password
                </label>
                <input
                  type="text"
                  value={inviteForm.initialPassword}
                  onChange={(e) => setInviteForm({ ...inviteForm, initialPassword: e.target.value })}
                  placeholder="Defaults to AuroVision@2026"
                  className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none font-mono"
                />
                <span className="text-[10px] text-ink-muted mt-0.5 block">
                  Staff member will be prompted to reset password on initial login.
                </span>
              </div>

              {/* Therapist Profile Section */}
              {inviteForm.role === "therapist" && (
                <div className="bg-ivory/60 p-3.5 rounded-lg border border-ink-border/60 space-y-3">
                  <span className="text-[11px] font-semibold text-plum uppercase tracking-wider block">
                    Practitioner Public Profile Setup
                  </span>
                  <div>
                    <label className="block text-ink-muted mb-1">Title / Designation</label>
                    <input
                      type="text"
                      value={inviteForm.roleTitle}
                      onChange={(e) => setInviteForm({ ...inviteForm, roleTitle: e.target.value })}
                      placeholder="e.g. Senior Natural Vision Guide"
                      className="w-full p-2 border border-ink-border rounded bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-ink-muted mb-1">Specialties (Comma-separated)</label>
                    <input
                      type="text"
                      value={inviteForm.specialties}
                      onChange={(e) => setInviteForm({ ...inviteForm, specialties: e.target.value })}
                      className="w-full p-2 border border-ink-border rounded bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-ink-muted mb-1">Bio</label>
                    <textarea
                      value={inviteForm.bio}
                      onChange={(e) => setInviteForm({ ...inviteForm, bio: e.target.value })}
                      placeholder="Brief background in natural vision and Bates method..."
                      rows={2}
                      className="w-full p-2 border border-ink-border rounded bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-ink-border">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-ink-border rounded text-ink hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-plum text-white rounded hover:bg-plum-light disabled:opacity-50"
                >
                  {isSubmitting ? "Inviting..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT USER ROLE/STATUS ================= */}
      {editingUser && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-ink-border max-w-sm w-full p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-lg font-medium text-ink">
              Edit Staff Permissions
            </h3>
            <p className="text-xs text-ink-muted">
              Updating access level for <strong className="text-ink">{editingUser.fullName}</strong>.
            </p>

            <form onSubmit={handleUpdateUser} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-ink-muted mb-1 font-medium">Role</label>
                <select
                  value={editRole}
                  onChange={(e: any) => setEditRole(e.target.value)}
                  className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none capitalize"
                >
                  <option value="super_admin">Super Administrator</option>
                  <option value="admin">Administrator</option>
                  <option value="therapist">Practitioner / Therapist</option>
                </select>
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">Account Status</label>
                <select
                  value={editStatus}
                  onChange={(e: any) => setEditStatus(e.target.value)}
                  className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none capitalize"
                >
                  <option value="active">Active</option>
                  <option value="invited">Invited (Pending verification)</option>
                  <option value="suspended">Suspended (Access blocked)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-ink-border">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-ink-border rounded text-ink hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-plum text-white rounded hover:bg-plum-light disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
