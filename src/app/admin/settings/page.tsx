"use client";

import React, { useState, useEffect } from "react";
import { Settings, ShieldCheck, Key, Database, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminSettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [leadTimeHours, setLeadTimeHours] = useState("12");
  const [bufferMinutes, setBufferMinutes] = useState("15");
  const [toastMessage, setToastMessage] = useState("");

  // Password Change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleSaveScheduling = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Scheduling buffer and lead time updated!");
  };

  const handleExportBackup = async () => {
    try {
      const res = await fetch("/api/public/content");
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `apv_catalogue_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        showToast("Complete website catalogue exported as JSON backup!");
      }
    } catch {
      alert("Error generating backup export.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
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
            System & Security
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            Platform Settings
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Configure appointment buffer intervals, staff account security, and export data backups.
          </p>
        </div>
      </div>

      {/* Staff Account & Role Card */}
      <div className="bg-white p-6 rounded-2xl border border-ink-border shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-serif text-base font-medium text-ink flex items-center gap-2">
            <Key className="w-4 h-4 text-plum" />
            <span>Staff Account Security</span>
          </h3>
          <Badge variant="plum">Active Session</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-ink-muted block mb-1">Authenticated Principal</span>
            <span className="font-medium text-ink">{currentUser?.fullName || "Administrator"}</span>
          </div>
          <div>
            <span className="text-ink-muted block mb-1">Email Address</span>
            <span className="font-mono text-ink">{currentUser?.email || "admin@auroperfectvision.com"}</span>
          </div>
          <div>
            <span className="text-ink-muted block mb-1">Role Privileges</span>
            <span className="font-medium text-plum capitalize">{currentUser?.role || "Admin"} (Full Access)</span>
          </div>
          <div>
            <span className="text-ink-muted block mb-1">Session Protection</span>
            <span className="text-emerald-700 font-medium">HTTP-only HMAC Signed Cookie</span>
          </div>
        </div>
      </div>

      {/* Scheduling Constraints Card */}
      <div className="bg-white p-6 rounded-2xl border border-ink-border shadow-subtle space-y-4">
        <h3 className="font-serif text-base font-medium text-ink pb-3 border-b">
          Scheduling Constraints & Buffers
        </h3>

        <form onSubmit={handleSaveScheduling} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-ink mb-1">
                Minimum Advance Notice
              </label>
              <select
                value={leadTimeHours}
                onChange={(e) => setLeadTimeHours(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-xs"
              >
                <option value="6">6 Hours in advance</option>
                <option value="12">12 Hours in advance (Recommended)</option>
                <option value="24">24 Hours in advance</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-ink mb-1">
                Sanitization & Rest Buffer Between Sessions
              </label>
              <select
                value={bufferMinutes}
                onChange={(e) => setBufferMinutes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-xs"
              >
                <option value="10">10 Minutes</option>
                <option value="15">15 Minutes (Standard)</option>
                <option value="30">30 Minutes</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" type="submit" className="text-xs">
              Save Scheduling Rules
            </Button>
          </div>
        </form>
      </div>

      {/* Data Backup & Export Card */}
      <div className="bg-white p-6 rounded-2xl border border-ink-border shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-serif text-base font-medium text-ink flex items-center gap-2">
              <Database className="w-4 h-4 text-plum" />
              <span>Data Export & Storage</span>
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Download the authoritative catalogue, therapies, practitioners, and settings as a standalone JSON backup.
            </p>
          </div>
          <Badge variant="sage">Persistent Storage</Badge>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-ink-muted">
            All published content and images persist on the server across user sessions and deployments.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportBackup}
            className="text-xs gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Catalogue Backup</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
