"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Clock,
  User,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { AuditLogEntry } from "@/lib/types/crm";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");

  // Selected Log Details Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/audit");
      if (!res.ok) throw new Error("Failed to load audit logs");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err: any) {
      setError(err.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportCSV = () => {
    const headers = ["Timestamp", "Staff Name", "Staff Email", "Action", "Entity Type", "Entity ID", "Details"];
    const rows = logs.map((l) => [
      l.timestamp,
      `"${l.staffName.replace(/"/g, '""')}"`,
      `"${l.staffEmail.replace(/"/g, '""')}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.entityType.replace(/"/g, '""')}"`,
      `"${l.entityId.replace(/"/g, '""')}"`,
      `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `apv-compliance-audit-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter((l) => {
    if (entityFilter !== "all" && l.entityType !== entityFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = l.staffName.toLowerCase().includes(q);
      const matchEmail = l.staffEmail.toLowerCase().includes(q);
      const matchAction = l.action.toLowerCase().includes(q);
      const matchEntity = l.entityType.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchAction && !matchEntity) return false;
    }
    return true;
  });

  const uniqueEntities = Array.from(new Set(logs.map((l) => l.entityType))).filter(Boolean);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-ink-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-medium text-gold-dark uppercase tracking-wider">
              Governance & Security
            </span>
            <span className="text-xs text-ink-muted">•</span>
            <span className="text-xs font-sans text-plum font-medium">Compliance Trail</span>
          </div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-ink">
            Compliance & Audit Log
          </h1>
          <p className="text-xs font-sans text-ink-muted mt-0.5">
            Tamper-evident record of staff activity, role updates, client record merges, and administrative operations.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={logs.length === 0}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-ink-border text-ink rounded-md text-xs font-sans hover:bg-ivory transition-colors self-start sm:self-auto shadow-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-plum" /> Export Audit CSV
        </button>
      </div>

      {/* Security Info Card */}
      <div className="bg-plum-muted/40 border border-plum/10 rounded-xl p-4 text-xs font-sans text-ink flex items-start gap-3">
        <Lock className="w-5 h-5 text-plum shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-plum block mb-0.5">Automated Compliance Logging Active</span>
          <span className="text-ink-muted text-[11px] leading-relaxed">
            All administrative events (user invites, status changes, programme updates, client profile merges, and note creation) are persistently logged with staff attribution and ISO 8601 timestamps for regulatory compliance.
          </span>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-xl border border-ink-border p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by staff member, email, or action name..."
            className="w-full pl-9 pr-3 py-1.5 border border-ink-border rounded-lg text-xs font-sans bg-ivory/30 focus:outline-none focus:border-plum"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted font-sans flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Entity:
          </span>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="text-xs bg-ivory border border-ink-border rounded-lg px-3 py-1.5 text-ink focus:outline-none"
          >
            <option value="all">All Entities</option>
            {uniqueEntities.map((ent) => (
              <option key={ent} value={ent}>
                {ent}
              </option>
            ))}
          </select>
          <span className="text-xs font-sans text-ink-muted font-mono ml-2">
            {filteredLogs.length} Events
          </span>
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-plum border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-ink-muted font-sans">Loading audit records...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-xl border border-ink-border p-12 text-center">
          <ShieldAlert className="w-10 h-10 text-ink-muted/40 mx-auto mb-3" />
          <h3 className="font-serif text-base font-medium text-ink mb-1">No Audit Records Found</h3>
          <p className="text-xs font-sans text-ink-muted">
            {searchTerm || entityFilter !== "all"
              ? "No events match your current filter query."
              : "Audit logs will populate as staff interact with the system."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-ink-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-ivory border-b border-ink-border text-ink-muted font-medium">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-border">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-ivory/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-ink-muted whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "medium",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-ink">{log.staffName}</div>
                      <div className="text-[11px] text-ink-muted">{log.staffEmail}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold bg-plum-muted/60 text-plum border border-plum/10">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-ink">
                      {log.entityType}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-gold-dark truncate max-w-[120px]">
                      {log.entityId}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 text-xs text-plum hover:bg-plum-muted/50 rounded border border-plum/20"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: LOG DETAILS ================= */}
      {selectedLog && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-ink-border max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ink-border">
              <div>
                <span className="text-xs font-mono font-bold text-plum uppercase">
                  {selectedLog.action}
                </span>
                <h3 className="font-serif text-base font-medium text-ink mt-0.5">
                  Audit Record Inspection
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-ink-muted hover:text-ink text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs font-sans">
              <div className="bg-ivory/60 p-3 rounded-lg border border-ink-border/50 space-y-1">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Staff Member:</span>
                  <span className="font-medium text-ink">{selectedLog.staffName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Email:</span>
                  <span>{selectedLog.staffEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Exact Timestamp:</span>
                  <span className="font-mono text-ink-muted">{selectedLog.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Target Entity:</span>
                  <span className="font-mono text-plum">{selectedLog.entityType} ({selectedLog.entityId})</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-ink-muted uppercase block mb-1">
                  Metadata Payload
                </span>
                <pre className="bg-charcoal text-ivory p-3 rounded-lg text-[11px] font-mono overflow-x-auto max-h-48">
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-ink-border">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-plum text-white rounded text-xs font-sans hover:bg-plum-light"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
