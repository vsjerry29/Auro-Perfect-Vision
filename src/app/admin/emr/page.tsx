"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PatientRecord } from "@/lib/types/emr";
import {
  Users,
  Search,
  Plus,
  Activity,
  FileText,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Eye,
  CheckCircle2,
  Calendar,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export default function AdminEmrPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Registration Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Registration Form
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<"female" | "male" | "other" | "undisclosed">("female");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [occupation, setOccupation] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [clinicalAlertsText, setClinicalAlertsText] = useState("");
  const [primaryTherapistName, setPrimaryTherapistName] = useState("Dr. Ananya Sen");

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/admin/emr/patients");
      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      alert("Full name and phone number are required.");
      return;
    }

    setSubmitting(true);
    try {
      const alerts = clinicalAlertsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      let calculatedAge: number | undefined = undefined;
      if (dateOfBirth) {
        const diff = Date.now() - new Date(dateOfBirth).getTime();
        calculatedAge = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      }

      const res = await fetch("/api/admin/emr/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          dateOfBirth: dateOfBirth || undefined,
          age: calculatedAge,
          gender,
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          occupation: occupation.trim(),
          emergencyContactName: emergencyContactName.trim(),
          emergencyContactPhone: emergencyContactPhone.trim(),
          bloodGroup,
          clinicalAlerts: alerts,
          primaryTherapistName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Patient chart ${data.patient.mrn} created successfully!`);
        setModalOpen(false);
        // Reset form
        setFullName("");
        setDateOfBirth("");
        setPhone("");
        setEmail("");
        setAddress("");
        setOccupation("");
        setClinicalAlertsText("");
        fetchPatients();
      } else {
        alert(data.error || "Failed to create patient chart.");
      }
    } catch {
      alert("Network error creating patient.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered patients
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      search === "" ||
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.mrn.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPatients = patients.length;
  const activePatients = patients.filter((p) => p.status === "active").length;
  const patientsWithAlerts = patients.filter((p) => p.clinicalAlerts && p.clinicalAlerts.length > 0).length;

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
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-sans tracking-wider text-brand-purple font-semibold">
              Clinical Ophthalmology & Vision Therapy
            </span>
            <Badge variant="plum" className="text-[10px]">
              DPDP Compliant
            </Badge>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal mt-0.5">
            Electronic Medical Records (EMR)
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Standardized ocular records, vision assessments, legally signed SOAP clinical notes, and treatment protocols.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setModalOpen(true)}
          className="gap-2 text-xs font-semibold bg-brand-orange hover:bg-brand-orangeHover text-white shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Register New Patient</span>
        </Button>
      </div>

      {/* Clinical KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-ink-border shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-ink-muted uppercase tracking-wider block">
              Active Clinical Patients
            </span>
            <span className="text-2xl font-serif font-bold text-ink block mt-1">
              {activePatients}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">In active therapy protocols</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-lavender text-brand-purple flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ink-border shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-ink-muted uppercase tracking-wider block">
              Clinical Alert Profiles
            </span>
            <span className="text-2xl font-serif font-bold text-amber-700 block mt-1">
              {patientsWithAlerts}
            </span>
            <span className="text-[11px] text-ink-muted font-medium">Amblyopia, strabismus, strain</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-ink-border shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-ink-muted uppercase tracking-wider block">
              Total Medical Charts
            </span>
            <span className="text-2xl font-serif font-bold text-ink block mt-1">
              {totalPatients}
            </span>
            <span className="text-[11px] text-brand-purple font-medium">Indexed with unique MRN</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-brand-purple border border-purple-200 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-ink-border shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient name, MRN (e.g. APV-MRN-2026-001), phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-1 focus:ring-brand-purple"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-ink-muted" />
          <span className="text-xs text-ink-muted">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-1 focus:ring-brand-purple font-medium"
          >
            <option value="all">All Patients</option>
            <option value="active">Active Therapy</option>
            <option value="inactive">Inactive / Concluded</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Patients Roster Table */}
      <div className="bg-white rounded-2xl border border-ink-border shadow-subtle overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-ink-muted">
            Loading medical charts...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="py-12 text-center text-xs text-ink-muted">
            No patient records found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-ink-border bg-canvas-light/70 text-ink-muted uppercase font-sans tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-semibold">MRN / ID</th>
                  <th className="py-3 px-4 font-semibold">Patient Name</th>
                  <th className="py-3 px-4 font-semibold">Demographics</th>
                  <th className="py-3 px-4 font-semibold">Clinical Alerts</th>
                  <th className="py-3 px-4 font-semibold">Primary Practitioner</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Chart Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-border">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-canvas-light/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-purple">
                      {p.mrn}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-ink">
                      <div className="font-sora font-semibold text-sm text-ink">{p.fullName}</div>
                      <div className="text-[11px] text-ink-muted">{p.phone}</div>
                    </td>

                    <td className="py-3.5 px-4 text-ink-muted">
                      <div>
                        {p.age ? `${p.age} yrs` : "Age N/A"} •{" "}
                        <span className="capitalize">{p.gender || "undisclosed"}</span>
                      </div>
                      <div className="text-[11px]">{p.bloodGroup ? `Blood: ${p.bloodGroup}` : ""}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {p.clinicalAlerts && p.clinicalAlerts.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {p.clinicalAlerts.map((alert, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200"
                            >
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                              <span>{alert}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-ink-muted text-[11px]">No high-risk alerts</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-ink font-medium">
                      {p.primaryTherapistName || "Unassigned"}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={p.status === "active" ? "success" : "faint"}
                        className="text-[10px]"
                      >
                        {p.status === "active" ? "Active" : "Archived"}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/emr/patients/${p.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-lavender text-brand-purple hover:bg-brand-purple hover:text-white font-sora text-xs font-bold transition-all shadow-sm"
                      >
                        <span>Open Chart</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Patient Modal */}
      {modalOpen && (
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Register Clinical Patient Record"
          description="Opens a permanent electronic medical record (EMR) with assigned MRN."
          maxWidth="lg"
        >
          <form onSubmit={handleRegisterPatient} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-ink mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Maya Sundaram"
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-1 focus:ring-brand-purple"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-1 focus:ring-brand-purple"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-ink mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-1 focus:ring-brand-purple"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e: any) => setGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-1 focus:ring-brand-purple font-medium"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                  <option value="undisclosed">Undisclosed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-1 focus:ring-brand-purple"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-ink mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1">Occupation / Activity</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="e.g. Software Engineer / Student"
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Residential Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Auroville / Pondicherry / City"
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-ink mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="Spouse / Parent"
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink mb-1">Emergency Phone</label>
                <input
                  type="text"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="+91..."
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">
                Clinical Alerts & Ocular Conditions (comma separated)
              </label>
              <input
                type="text"
                value={clinicalAlertsText}
                onChange={(e) => setClinicalAlertsText(e.target.value)}
                placeholder="e.g. Amblyopia OD, High Myopia, Severe Digital Asthenopia"
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
              />
              <p className="text-[10px] text-ink-muted mt-1">
                Will be surfaced as prominent warning pills on the patient chart.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Primary Practitioner</label>
              <input
                type="text"
                value={primaryTherapistName}
                onChange={(e) => setPrimaryTherapistName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
              />
            </div>

            <div className="pt-4 border-t border-ink-border flex justify-end gap-3">
              <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={submitting}
                className="bg-brand-orange hover:bg-brand-orangeHover text-white"
              >
                {submitting ? "Opening Chart..." : "Register & Open Chart"}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
