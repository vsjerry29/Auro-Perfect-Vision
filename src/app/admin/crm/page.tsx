"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Download,
  Upload,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Tag,
  ArrowRight,
  Phone,
  Mail,
  Copy,
  Layers,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ClientContact } from "@/lib/types/crm";

export default function AdminCrmPage() {
  const [clients, setClients] = useState<ClientContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");

  // Add Client Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newLocality, setNewLocality] = useState("");
  const [newChannel, setNewChannel] = useState<"whatsapp" | "email" | "phone">("whatsapp");
  const [newSource, setNewSource] = useState<"phone" | "walk_in" | "referral">("phone");
  const [newTags, setNewTags] = useState("Direct Inquiry");
  const [formError, setFormError] = useState("");

  // Duplicates Review Modal
  const [dupModalOpen, setDupModalOpen] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<any[]>([]);

  // Import Modal
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importData, setImportData] = useState("");
  const [importResult, setImportResult] = useState<any>(null);

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const loadClients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (tagFilter !== "all") params.set("tag", tagFilter);

      const res = await fetch(`/api/admin/crm/clients?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.warn("Could not load clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [statusFilter, tagFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadClients();
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newName.trim() || !newEmail.trim()) {
      setFormError("Full Name and Email are required.");
      return;
    }

    try {
      const res = await fetch("/api/admin/crm/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newName.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim(),
          locality: newLocality.trim(),
          preferredChannel: newChannel,
          source: newSource,
          tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create client");
        return;
      }

      showToast(`Client ${data.client.fullName} created successfully!`);
      setAddModalOpen(false);
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewLocality("");
      loadClients();
    } catch (err: any) {
      setFormError("Network error while creating client.");
    }
  };

  const checkDuplicates = async () => {
    try {
      const res = await fetch("/api/admin/crm/clients?duplicates=true");
      if (res.ok) {
        const data = await res.json();
        setDuplicateGroups(data.duplicateGroups || []);
        setDupModalOpen(true);
      }
    } catch (err) {
      showToast("Error checking duplicate records");
    }
  };

  const handleMerge = async (primaryId: string, duplicateIds: string[]) => {
    try {
      const res = await fetch("/api/admin/crm/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "merge",
          primaryId,
          duplicateIds,
        }),
      });

      if (res.ok) {
        showToast("Client records merged successfully!");
        setDupModalOpen(false);
        loadClients();
      }
    } catch (err) {
      showToast("Failed to merge client records");
    }
  };

  const handleImportSubmit = async (dryRun: boolean) => {
    try {
      // Parse CSV or JSON lines
      const lines = importData.trim().split("\n");
      const parsed: any[] = [];
      lines.forEach((line) => {
        const parts = line.split(",").map((p) => p.replace(/"/g, "").trim());
        if (parts.length >= 2 && parts[1].includes("@")) {
          parsed.push({
            fullName: parts[0],
            email: parts[1],
            phone: parts[2] || "",
            locality: parts[3] || "",
          });
        }
      });

      if (parsed.length === 0) {
        setImportResult({ error: "No valid rows found. Format: Full Name, email@example.com, Phone, City" });
        return;
      }

      const res = await fetch("/api/admin/crm/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients: parsed, dryRun }),
      });

      const result = await res.json();
      setImportResult(result);
      if (!dryRun && result.success) {
        showToast(`Successfully imported ${result.importedCount} clients!`);
        loadClients();
      }
    } catch (err: any) {
      setImportResult({ error: err.message || "Import failed" });
    }
  };

  // KPIs
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "active").length;
  const leadClients = clients.filter((c) => c.status === "lead").length;
  const returningClients = clients.filter((c) => c.totalBookings > 1).length;
  const returnRate = totalClients > 0 ? Math.round((returningClients / totalClients) * 100) : 0;

  const allTags = Array.from(new Set(clients.flatMap((c) => c.tags || [])));

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-xl shadow-elevated flex items-center gap-2 text-xs font-medium border border-emerald-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-gold-dark font-semibold">
            Customer Relationship Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            Clients & Guest Directory
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Complete Client 360 views, booking history, contact inquiries, notes, and supervised deduplication.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Button variant="outline" size="sm" onClick={checkDuplicates} className="gap-1.5 text-xs">
            <Layers className="w-3.5 h-3.5 text-plum" />
            <span>Check Duplicates</span>
          </Button>

          <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)} className="gap-1.5 text-xs">
            <Upload className="w-3.5 h-3.5 text-ink-muted" />
            <span>Import CSV</span>
          </Button>

          <a href="/api/admin/crm/export" download className="inline-block">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5 text-ink-muted" />
              <span>Export CSV</span>
            </Button>
          </a>

          <Button variant="primary" size="sm" onClick={() => setAddModalOpen(true)} className="gap-1.5 text-xs shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Client</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-ink-border shadow-subtle">
          <span className="text-[11px] font-sans uppercase tracking-wider text-ink-muted block">
            Total Profiles
          </span>
          <span className="font-serif text-3xl font-medium text-ink block mt-1">
            {totalClients}
          </span>
          <span className="text-[11px] text-ink-faint block mt-0.5">Verified CRM records</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ink-border shadow-subtle">
          <span className="text-[11px] font-sans uppercase tracking-wider text-ink-muted block">
            Active Clients
          </span>
          <span className="font-serif text-3xl font-medium text-plum block mt-1">
            {activeClients}
          </span>
          <span className="text-[11px] text-ink-faint block mt-0.5">With booked consultations</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ink-border shadow-subtle">
          <span className="text-[11px] font-sans uppercase tracking-wider text-ink-muted block">
            Inquiry Leads
          </span>
          <span className="font-serif text-3xl font-medium text-gold-dark block mt-1">
            {leadClients}
          </span>
          <span className="text-[11px] text-ink-faint block mt-0.5">Contact form submissions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ink-border shadow-subtle">
          <span className="text-[11px] font-sans uppercase tracking-wider text-ink-muted block">
            Repeat Client Rate
          </span>
          <span className="font-serif text-3xl font-medium text-emerald-800 block mt-1">
            {returnRate}%
          </span>
          <span className="text-[11px] text-ink-faint block mt-0.5">{returningClients} repeat participants</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-ink-border shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, reference (e.g. APV-CLI-1001)..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="lead">Lead</option>
            <option value="vip">VIP</option>
            <option value="archived">Archived</option>
          </select>

          {allTags.length > 0 && (
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
            >
              <option value="all">All Tags</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}

          <Button variant="outline" size="sm" onClick={loadClients} className="text-xs">
            Refresh
          </Button>
        </div>
      </div>

      {/* Clients Data Table */}
      <div className="bg-white rounded-2xl border border-ink-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas-light/60 border-b border-ink-border font-sans uppercase tracking-wider text-[10px] text-ink-muted">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Client Reference</th>
                <th className="py-3.5 px-4 font-semibold">Full Name</th>
                <th className="py-3.5 px-4 font-semibold">Contact Info</th>
                <th className="py-3.5 px-4 font-semibold">Locality</th>
                <th className="py-3.5 px-4 font-semibold">Bookings</th>
                <th className="py-3.5 px-4 font-semibold">Total Value</th>
                <th className="py-3.5 px-4 font-semibold">Tags & Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-border/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-ink-muted">
                    Loading client directory...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-ink-muted">
                    No clients found matching the selected filters.
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.id} className="hover:bg-canvas-light/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-plum">
                      {c.clientReference}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/crm/clients/${c.id}`}
                        className="font-medium text-ink hover:text-plum hover:underline block"
                      >
                        {c.fullName}
                      </Link>
                      <span className="text-[10px] text-ink-muted capitalize">
                        Source: {c.source.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-ink">
                        <Mail className="w-3 h-3 text-ink-muted shrink-0" />
                        <span className="font-mono text-[11px] truncate max-w-[160px]">{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-ink-muted">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span className="font-mono text-[11px]">{c.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-ink-muted">
                      {c.locality || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-ink">{c.totalBookings}</span>
                      {c.lastBookingDate && (
                        <span className="text-[10px] text-ink-muted block mt-0.5">
                          Last: {c.lastBookingDate}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-ink">
                      {c.totalSpentINR > 0 ? `₹${c.totalSpentINR.toLocaleString()}` : `$${c.totalSpentUSD}`}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1">
                        <Badge
                          variant={
                            c.status === "active"
                              ? "success"
                              : c.status === "vip"
                              ? "gold"
                              : c.status === "lead"
                              ? "plum"
                              : "faint"
                          }
                          className="text-[10px] capitalize"
                        >
                          {c.status}
                        </Badge>
                        {c.tags.slice(0, 2).map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] bg-canvas-dark text-ink-muted px-1.5 py-0.5 rounded font-sans"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/admin/crm/clients/${c.id}`}>
                        <Button variant="outline" size="sm" className="gap-1 text-xs">
                          <span>Client 360</span>
                          <ArrowRight className="w-3 h-3 text-plum" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CLIENT MODAL */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Client Profile"
        description="Manually record client details for telephone reservations, walk-ins, or referrals."
        maxWidth="md"
      >
        <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-ink font-medium mb-1">
                Full Name <span className="text-plum">*</span>
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Maya Sundaram"
                className="w-full px-3 py-2 text-xs rounded-lg border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
              />
            </div>

            <div>
              <label className="block text-ink font-medium mb-1">
                Email Address <span className="text-plum">*</span>
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="maya@example.com"
                className="w-full px-3 py-2 text-xs rounded-lg border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-ink font-medium mb-1">Telephone / WhatsApp</label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+91 98401 23456"
                className="w-full px-3 py-2 text-xs rounded-lg border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum font-mono"
              />
            </div>

            <div>
              <label className="block text-ink font-medium mb-1">Locality / City</label>
              <input
                type="text"
                value={newLocality}
                onChange={(e) => setNewLocality(e.target.value)}
                placeholder="e.g. Auroville / Chennai"
                className="w-full px-3 py-2 text-xs rounded-lg border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-ink font-medium mb-1">Preferred Channel</label>
              <select
                value={newChannel}
                onChange={(e: any) => setNewChannel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="phone">Telephone</option>
              </select>
            </div>

            <div>
              <label className="block text-ink font-medium mb-1">Lead Source</label>
              <select
                value={newSource}
                onChange={(e: any) => setNewSource(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
              >
                <option value="phone">Phone Call</option>
                <option value="walk_in">Walk-in Visit</option>
                <option value="referral">Word of Mouth / Referral</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-ink font-medium mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="e.g. Eye Yoga, Screen Fatigue, Resident"
              className="w-full px-3 py-2 text-xs rounded-lg border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-ink-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Client Record
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DUPLICATES REVIEW & MERGE MODAL */}
      <Dialog
        open={dupModalOpen}
        onClose={() => setDupModalOpen(false)}
        title="Supervised Deduplication Review"
        description="The system identified the following potential duplicate customer profiles matching by email or phone."
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          {duplicateGroups.length === 0 ? (
            <div className="p-8 text-center text-ink-muted">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-medium text-ink">No duplicate records detected</p>
              <p className="text-[11px] text-ink-muted mt-1">All client emails and phone numbers are unique.</p>
            </div>
          ) : (
            duplicateGroups.map((group, idx) => (
              <div key={idx} className="p-4 bg-canvas-light rounded-xl border border-ink-border space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="plum">{group.matchReason}</Badge>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      handleMerge(
                        group.primary.id,
                        group.duplicates.map((d: any) => d.id)
                      )
                    }
                    className="text-xs"
                  >
                    Merge into Primary Profile
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 bg-white rounded-lg border border-ink-border">
                    <span className="font-semibold text-ink block">Primary: {group.primary.fullName}</span>
                    <span className="text-ink-muted block">{group.primary.clientReference}</span>
                    <span className="text-plum font-mono block mt-1">{group.primary.email}</span>
                    <span className="text-ink-muted font-mono block">{group.primary.phone}</span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-dashed border-red-300">
                    <span className="font-semibold text-red-700 block">
                      Duplicates to Merge: ({group.duplicates.length})
                    </span>
                    {group.duplicates.map((d: any) => (
                      <div key={d.id} className="mt-1">
                        <span className="text-ink block font-medium">{d.fullName} ({d.clientReference})</span>
                        <span className="text-ink-muted font-mono block">{d.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setDupModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Dialog>

      {/* IMPORT CSV MODAL */}
      <Dialog
        open={importModalOpen}
        onClose={() => {
          setImportModalOpen(false);
          setImportResult(null);
        }}
        title="Import Client Contacts (CSV)"
        description="Paste raw CSV lines with: Full Name, Email, Phone, Locality"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <textarea
              rows={5}
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Maya Raman, maya@example.com, +91 98401 23456, Auroville&#10;David Miller, david@example.org, +1 415 555 2671, California"
              className="w-full p-3 font-mono text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
            />
          </div>

          {importResult && (
            <div
              className={`p-3 rounded-lg text-xs ${
                importResult.error
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}
            >
              {importResult.error ? (
                <span>{importResult.error}</span>
              ) : (
                <span>
                  Dry run result: {importResult.importedCount} valid rows ready, {importResult.skippedCount} skipped duplicates.
                </span>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-ink-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleImportSubmit(true)}
            >
              Preview Validation
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleImportSubmit(false)}
            >
              Execute Import
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
