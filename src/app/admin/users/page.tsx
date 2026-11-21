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
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import type { StaffUser } from "@/lib/types";
import { useToast } from "@/components/ui/toast";

export default function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [lastInviteResult, setLastInviteResult] = useState<{
    email: string;
    inviteUrl?: string;
    emailSent?: boolean;
  } | null>(null);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [inviteForm, setInviteForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "admin" as "super_admin" | "admin" | "therapist",
    roleTitle: "Vision Wellness Guide",
    specialties: "Bates Method, Eye Yoga, Palming",
    bio: "",
  });

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [editRole, setEditRole] = useState<"super_admin" | "admin" | "therapist">("admin");
  const [editStatus, setEditStatus] = useState<"active" | "invited" | "suspended">("active");
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingUser, setDeletingUser] = useState<StaffUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sanitize any internal path leaks
  const cleanErrorMessage = (msg: string) => {
    if (!msg) return "An unexpected error occurred.";
    if (msg.includes("EROFS") || msg.includes("/var/task") || msg.includes("DATABASE_NOT_CONFIGURED")) {
      return "Database persistence error: Please ensure Hostinger MySQL database is configured in deployment settings.";
    }
    return msg;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(cleanErrorMessage(data.error || "Failed to load staff roster"));
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(cleanErrorMessage(err.message || "Failed to load staff roster"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user: StaffUser) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditStatus((user.status as any) || (user.isActive ? "active" : "suspended"));
    setEditFullName(user.fullName);
    setEditPhone(user.phone || "");
    setEditError(null);
  };

  const isEditDirty = editingUser
    ? editRole !== editingUser.role ||
      editStatus !== (editingUser.status || (editingUser.isActive ? "active" : "suspended")) ||
      editFullName !== editingUser.fullName ||
      editPhone !== (editingUser.phone || "")
    : false;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);

    // Validation
    if (!inviteForm.fullName.trim() || !inviteForm.email.trim()) {
      setInviteError("Full Name and a valid Email Address are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: any = {
        fullName: inviteForm.fullName.trim(),
        email: inviteForm.email.trim(),
        phone: inviteForm.phone.trim(),
        role: inviteForm.role,
      };

      if (inviteForm.role === "therapist") {
        payload.therapistProfile = {
          displayName: inviteForm.fullName.trim(),
          roleTitle: inviteForm.roleTitle.trim(),
          bio: inviteForm.bio.trim() || "Certified practitioner at Auro Perfect Vision.",
          specialties: inviteForm.specialties.split(",").map((s) => s.trim()).filter(Boolean),
          isPublished: true,
        };
      }

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(cleanErrorMessage(data.error || "Failed to invite staff user"));
      }

      setShowInviteModal(false);
      setInviteForm({
        fullName: "",
        email: "",
        phone: "",
        role: "admin",
        roleTitle: "Vision Wellness Guide",
        specialties: "Bates Method, Eye Yoga, Palming",
        bio: "",
      });

      setLastInviteResult({
        email: payload.email,
        inviteUrl: data.inviteUrl,
        emailSent: !!data.emailSent,
      });

      if (data.emailSent) {
        toast.success(
          `Staff invitation email sent to ${payload.email}. Valid for 48 hours.`,
          "Invitation Dispatched"
        );
      } else {
        toast.info(
          `Staff record created. Copy the manual activation URL shown above.`,
          "Manual Activation Ready"
        );
      }
      await fetchUsers();
    } catch (err: any) {
      setInviteError(cleanErrorMessage(err.message || "Error creating staff user"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendInvite = async (user: StaffUser) => {
    try {
      setActionInProgressId(user.id);
      const res = await fetch("/api/admin/users/invite/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(cleanErrorMessage(data.error || "Failed to resend invitation"));
      }

      setLastInviteResult({
        email: user.email,
        inviteUrl: data.inviteUrl,
        emailSent: !!data.emailSent,
      });

      if (data.emailSent) {
        toast.success(`Invitation email resent to ${user.email}.`, "Dispatched");
      } else {
        toast.info(`New invitation token generated. Activation link shown above.`, "Token Regenerated");
      }
      await fetchUsers();
    } catch (err: any) {
      toast.error(cleanErrorMessage(err.message || "Error resending invitation"), "Action Failed");
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleRevokeInvite = async (user: StaffUser) => {
    try {
      setActionInProgressId(user.id);
      const res = await fetch("/api/admin/users/invite/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(cleanErrorMessage(data.error || "Failed to revoke invitation"));
      }

      toast.success(`Invitation revoked and account suspended for ${user.email}.`, "Invitation Revoked");
      await fetchUsers();
    } catch (err: any) {
      toast.error(cleanErrorMessage(err.message || "Error revoking invitation"), "Action Failed");
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError(null);

    // No changes check
    if (!isEditDirty) {
      toast.info("No modifications were detected.", "Unchanged");
      setEditingUser(null);
      return;
    }

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
          fullName: editFullName.trim(),
          phone: editPhone.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(cleanErrorMessage(data.error || "Failed to update staff user"));
      }

      setEditingUser(null);
      toast.success(
        `Permissions and account status for ${editingUser.fullName} have been saved permanently.`,
        "Changes Saved"
      );
      await fetchUsers();
    } catch (err: any) {
      // Keep modal open and display clear error message with retry
      setEditError(cleanErrorMessage(err.message || "Error updating staff user"));
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/users?id=${deletingUser.id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(cleanErrorMessage(data.error || "Failed to delete user"));
      }

      toast.success(
        `Staff account for ${deletingUser.fullName} has been removed.`,
        "Account Removed"
      );
      setDeletingUser(null);
      await fetchUsers();
    } catch (err: any) {
      toast.error(cleanErrorMessage(err.message || "Error removing user"), "Action Denied");
    } finally {
      setIsDeleting(false);
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
          onClick={() => {
            setInviteError(null);
            setShowInviteModal(true);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-plum text-white rounded-md text-xs font-sans hover:bg-plum-light transition-colors self-start sm:self-auto shadow-sm cursor-pointer"
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

      {/* Global Error Banner if initial fetch fails */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchUsers}
            className="px-2.5 py-1 bg-white border border-red-200 rounded text-red-700 hover:bg-red-50 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Last Invite Alert Banner */}
      {lastInviteResult && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-3 ${
            lastInviteResult.emailSent
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}
        >
          <div className="space-y-1">
            <p className="font-semibold">
              {lastInviteResult.emailSent
                ? `Invitation email successfully dispatched to ${lastInviteResult.email}.`
                : `Staff profile created for ${lastInviteResult.email}. (Email dispatch offline or unconfigured).`}
            </p>
            {lastInviteResult.inviteUrl && (
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="font-mono text-[11px] bg-white/90 px-2 py-1 rounded border border-current select-all break-all">
                  {lastInviteResult.inviteUrl}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(lastInviteResult.inviteUrl!);
                    toast.success("Activation link copied to clipboard.", "Copied");
                  }}
                  className="px-2 py-1 bg-white rounded border border-ink-border text-ink hover:bg-ivory font-medium cursor-pointer shrink-0"
                >
                  Copy Activation Link
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setLastInviteResult(null)}
            className="text-ink-muted hover:text-ink font-medium shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

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
                      {user.status === "invited" ? (
                        (() => {
                          const isExpired =
                            user.invitationExpiresAt &&
                            new Date(user.invitationExpiresAt).getTime() < Date.now();
                          return isExpired ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-800 border border-red-200">
                              Invite Expired
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                              Pending Activation
                            </span>
                          );
                        })()
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                            user.status === "active" || (user.isActive && !user.status)
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-red-50 text-red-800 border border-red-200"
                          }`}
                        >
                          {user.status || (user.isActive ? "active" : "suspended")}
                        </span>
                      )}
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
                        {user.status === "invited" && (
                          <>
                            <button
                              onClick={() => handleResendInvite(user)}
                              disabled={actionInProgressId === user.id}
                              className="p-1 text-ink-muted hover:text-plum rounded hover:bg-ivory cursor-pointer disabled:opacity-50"
                              title="Resend Invitation Token / Email"
                            >
                              <RotateCcw className={`w-3.5 h-3.5 ${actionInProgressId === user.id ? "animate-spin text-plum" : ""}`} />
                            </button>
                            <button
                              onClick={() => handleRevokeInvite(user)}
                              disabled={actionInProgressId === user.id}
                              className="p-1 text-ink-muted hover:text-amber-700 rounded hover:bg-amber-50 cursor-pointer disabled:opacity-50"
                              title="Revoke Invitation"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1 text-ink-muted hover:text-plum rounded hover:bg-ivory cursor-pointer"
                          title="Edit Staff Permissions"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="p-1 text-ink-muted hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
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
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-ink-muted hover:text-ink text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {inviteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Failed to invite staff member</p>
                  <p className="mt-0.5 text-red-700 leading-relaxed">{inviteError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-3 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-muted mb-1 font-medium">Full Name *</label>
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
                  <label className="block text-ink-muted mb-1 font-medium">Email Address *</label>
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

              <div className="bg-ivory/60 p-3 rounded-lg border border-ink-border/60 text-[11px] text-ink-muted space-y-1">
                <div className="flex items-center gap-1.5 text-ink font-medium">
                  <Lock className="w-3.5 h-3.5 text-gold-dark" />
                  <span>Secure Invitation & Activation Link</span>
                </div>
                <p className="leading-relaxed">
                  No default password is generated. An invitation containing a cryptographically secure 48-hour activation token will be sent directly to the staff member's email so they can set their own password securely.
                </p>
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
                  className="px-4 py-2 border border-ink-border rounded text-ink hover:bg-ivory cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-plum text-white rounded hover:bg-plum-light disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
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
            <div className="flex items-center justify-between pb-2 border-b border-ink-border">
              <h3 className="font-serif text-lg font-medium text-ink">
                Edit Staff Permissions
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-ink-muted hover:text-ink text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-ink-muted">
              Updating access level for <strong className="text-ink">{editingUser.fullName}</strong> ({editingUser.email}).
            </p>

            {editError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Failed to save permissions</p>
                  <p className="mt-0.5 text-red-700 leading-relaxed">{editError}</p>
                </div>
              </div>
            )}

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
                {editStatus === "suspended" && (
                  <span className="text-[10px] text-red-600 mt-1 block">
                    Suspension immediately terminates all active sessions for this account.
                  </span>
                )}
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink-muted mb-1 font-medium">Phone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91..."
                  className="w-full p-2 border border-ink-border rounded bg-ivory/30 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-ink-border">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-ink-border rounded text-ink hover:bg-ivory cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !isEditDirty}
                  className="px-4 py-2 bg-plum text-white rounded hover:bg-plum-light disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                >
                  {isUpdating && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {deletingUser && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-red-200 max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-serif text-lg font-medium text-ink">
                Remove Staff Member
              </h3>
            </div>
            <p className="text-xs text-ink/80 leading-relaxed">
              Are you certain you want to remove <strong className="text-ink">{deletingUser.fullName}</strong> ({deletingUser.email}) from staff access?
            </p>
            <p className="text-[11px] text-ink-muted">
              This action will be permanently recorded in the administrative compliance audit log.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-ink-border">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-3.5 py-2 border border-ink-border rounded text-ink hover:bg-ivory text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                disabled={isDeleting}
                className="px-3.5 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting && (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {isDeleting ? "Removing..." : "Confirm Removal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
