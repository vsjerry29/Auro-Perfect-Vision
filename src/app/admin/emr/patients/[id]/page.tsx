"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  PatientRecord,
  PatientMedicalHistory,
  ClinicalEncounter,
  VisionAssessment,
  ClinicalNote,
  TreatmentPlan,
  ClinicalDocument,
  ClinicalConsent,
  ClinicalAuditEvent,
} from "@/lib/types/emr";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  AlertTriangle,
  Lock,
  Unlock,
  FileText,
  Activity,
  Plus,
  CheckCircle2,
  FileCheck,
  Edit2,
  ShieldCheck,
  Eye,
  Glasses,
  Monitor,
  HeartPulse,
  History,
  ClipboardList,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function PatientChartPage() {
  const params = useParams();
  const patientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<PatientMedicalHistory | null>(null);
  const [encounters, setEncounters] = useState<ClinicalEncounter[]>([]);
  const [assessments, setAssessments] = useState<VisionAssessment[]>([]);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [documents, setDocuments] = useState<ClinicalDocument[]>([]);
  const [consents, setConsents] = useState<ClinicalConsent[]>([]);
  const [auditLogs, setAuditLogs] = useState<ClinicalAuditEvent[]>([]);

  const [activeTab, setActiveTab] = useState<
    "overview" | "notes" | "assessments" | "plans" | "consents" | "audit"
  >("overview");

  const [toastMessage, setToastMessage] = useState("");

  // Modals
  const [encounterModalOpen, setEncounterModalOpen] = useState(false);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [amendModalOpen, setAmendModalOpen] = useState(false);
  const [signConfirmOpen, setSignConfirmOpen] = useState(false);
  const [targetNoteToSign, setTargetNoteToSign] = useState<ClinicalNote | null>(null);
  const [targetNoteToAmend, setTargetNoteToAmend] = useState<ClinicalNote | null>(null);
  const [editHistoryModalOpen, setEditHistoryModalOpen] = useState(false);

  // Form States
  // Encounter Form
  const [encounterType, setEncounterType] = useState<any>("vision_therapy_session");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [clinicalSummary, setClinicalSummary] = useState("");

  // Vision Assessment Form
  const [vaOdUncorrected, setVaOdUncorrected] = useState("");
  const [vaOdCorrected, setVaOdCorrected] = useState("6/6");
  const [vaOsUncorrected, setVaOsUncorrected] = useState("");
  const [vaOsCorrected, setVaOsCorrected] = useState("6/6");
  const [npcValue, setNpcValue] = useState("6 cm break / 9 cm recovery");
  const [stereopsisValue, setStereopsisValue] = useState("40 arc seconds");
  const [motilityPursuits, setMotilityPursuits] = useState<any>("smooth");
  const [brockStringNotes, setBrockStringNotes] = useState("");
  const [clinicalImpression, setClinicalImpression] = useState("");
  const [recommendations, setRecommendations] = useState("");

  // SOAP Note Form
  const [editingNoteId, setEditingNoteId] = useState<string | undefined>(undefined);
  const [soapSubjective, setSoapSubjective] = useState("");
  const [soapObjective, setSoapObjective] = useState("");
  const [soapAssessment, setSoapAssessment] = useState("");
  const [soapPlan, setSoapPlan] = useState("");

  // Amendment Form
  const [amendReason, setAmendReason] = useState("");
  const [amendText, setAmendText] = useState("");

  const fetchChart = async () => {
    try {
      const res = await fetch(`/api/admin/emr/patients/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setPatient(data.patient);
        setMedicalHistory(data.medicalHistory);
        setEncounters(data.encounters || []);
        setAssessments(data.assessments || []);
        setNotes(data.notes || []);
        setTreatmentPlans(data.treatmentPlans || []);
        setDocuments(data.documents || []);
        setConsents(data.consents || []);
        setAuditLogs(data.auditLogs || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChart();
  }, [patientId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Handlers
  const handleCreateEncounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chiefComplaint.trim()) {
      alert("Chief complaint is required.");
      return;
    }

    try {
      const res = await fetch("/api/admin/emr/encounters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          patientName: patient?.fullName,
          encounterType,
          chiefComplaint: chiefComplaint.trim(),
          clinicalSummary: clinicalSummary.trim(),
        }),
      });

      if (res.ok) {
        showToast("Clinical encounter recorded.");
        setEncounterModalOpen(false);
        setChiefComplaint("");
        setClinicalSummary("");
        fetchChart();
      } else {
        alert("Failed to save encounter.");
      }
    } catch {
      alert("Network error.");
    }
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicalImpression.trim()) {
      alert("Clinical impression is required.");
      return;
    }

    try {
      const res = await fetch("/api/admin/emr/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          visualAcuity: {
            odUncorrected: vaOdUncorrected,
            odCorrected: vaOdCorrected,
            osUncorrected: vaOsUncorrected,
            osCorrected: vaOsCorrected,
            ouCorrected: "6/6",
          },
          binocularVision: {
            nearPointConvergenceNPC: npcValue,
            stereopsis: stereopsisValue,
            ocularMotilityPursuits: motilityPursuits,
            brockStringFixation: brockStringNotes,
          },
          clinicalImpression: clinicalImpression.trim(),
          recommendations: recommendations.trim(),
        }),
      });

      if (res.ok) {
        showToast("Vision assessment metrics recorded.");
        setAssessmentModalOpen(false);
        setClinicalImpression("");
        setRecommendations("");
        fetchChart();
      } else {
        alert("Failed to record vision assessment.");
      }
    } catch {
      alert("Network error.");
    }
  };

  const handleOpenDraftNote = (existing?: ClinicalNote) => {
    if (existing) {
      if (existing.isLocked) {
        alert("This SOAP note is locked and signed. Use 'Add Amendment' instead.");
        return;
      }
      setEditingNoteId(existing.id);
      setSoapSubjective(existing.subjective);
      setSoapObjective(existing.objective);
      setSoapAssessment(existing.assessment);
      setSoapPlan(existing.plan);
    } else {
      setEditingNoteId(undefined);
      setSoapSubjective("");
      setSoapObjective("");
      setSoapAssessment("");
      setSoapPlan("");
    }
    setNoteModalOpen(true);
  };

  const handleSaveSoapNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soapSubjective || !soapObjective || !soapAssessment || !soapPlan) {
      alert("All four SOAP components (S, O, A, P) must be completed.");
      return;
    }

    try {
      const res = await fetch("/api/admin/emr/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingNoteId,
          patientId,
          subjective: soapSubjective.trim(),
          objective: soapObjective.trim(),
          assessment: soapAssessment.trim(),
          plan: soapPlan.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("SOAP Clinical Note drafted successfully.");
        setNoteModalOpen(false);
        fetchChart();
      } else {
        alert(data.error || "Failed to save SOAP note.");
      }
    } catch {
      alert("Network error.");
    }
  };

  const handleSignConfirm = async () => {
    if (!targetNoteToSign) return;

    try {
      const res = await fetch(`/api/admin/emr/notes/${targetNoteToSign.id}/sign`, {
        method: "POST",
      });

      if (res.ok) {
        showToast("Clinical note officially signed, time-stamped, and locked.");
        setSignConfirmOpen(false);
        setTargetNoteToSign(null);
        fetchChart();
      } else {
        alert("Failed to sign note.");
      }
    } catch {
      alert("Network error signing note.");
    }
  };

  const handleAmendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetNoteToAmend || !amendReason.trim() || !amendText.trim()) {
      alert("Reason and amendment text are required.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/emr/notes/${targetNoteToAmend.id}/amend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reasonForAmendment: amendReason.trim(),
          amendmentText: amendText.trim(),
        }),
      });

      if (res.ok) {
        showToast("Clinical amendment recorded and appended to note.");
        setAmendModalOpen(false);
        setTargetNoteToAmend(null);
        setAmendReason("");
        setAmendText("");
        fetchChart();
      } else {
        alert("Failed to record amendment.");
      }
    } catch {
      alert("Network error.");
    }
  };

  if (loading || !patient) {
    return (
      <div className="py-24 text-center text-xs text-ink-muted">
        Loading patient medical record...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-purple text-white px-5 py-3 rounded-2xl shadow-elevated text-xs flex items-center gap-2 border border-brand-orange/40">
          <CheckCircle2 className="w-4 h-4 text-brand-orange" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back Button & Patient Header Card */}
      <div className="space-y-4">
        <Link
          href="/admin/emr"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-purple hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to EMR Patient Directory</span>
        </Link>

        {/* Clinical Patient Header */}
        <div className="bg-white rounded-3xl border border-ink-border shadow-subtle p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-brand-lavender text-brand-purple border border-brand-purple/20">
                {patient.mrn}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-ink">
                {patient.fullName}
              </h1>
              <Badge variant={patient.status === "active" ? "success" : "faint"} className="text-xs">
                {patient.status === "active" ? "Active Care" : "Concluded"}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
              <span>
                {patient.age ? `${patient.age} yrs` : "Age N/A"} •{" "}
                <span className="capitalize">{patient.gender || "undisclosed"}</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {patient.phone}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {patient.email || "No email"}
              </span>
              <span>•</span>
              <span className="font-medium text-ink">
                Primary Guide: {patient.primaryTherapistName || "Dr. Ananya Sen"}
              </span>
            </div>

            {/* Clinical Alert Banners */}
            {patient.clinicalAlerts && patient.clinicalAlerts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {patient.clinicalAlerts.map((alert, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-300 shadow-sm"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{alert}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Clinical Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEncounterModalOpen(true)}
              className="text-xs gap-1.5 border-ink-border bg-white hover:bg-canvas-light"
            >
              <Calendar className="w-3.5 h-3.5 text-brand-purple" />
              <span>Record Encounter</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAssessmentModalOpen(true)}
              className="text-xs gap-1.5 border-ink-border bg-white hover:bg-canvas-light"
            >
              <Activity className="w-3.5 h-3.5 text-brand-purple" />
              <span>Vision Assessment</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenDraftNote()}
              className="text-xs gap-1.5 bg-brand-orange hover:bg-brand-orangeHover text-white shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>+ Draft SOAP Note</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-ink-border overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-xs font-sora font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-white text-brand-purple border-t border-l border-r border-ink-border shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Medical History & Lifestyle
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notes")}
          className={`px-4 py-2 text-xs font-sora font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === "notes"
              ? "bg-white text-brand-purple border-t border-l border-r border-ink-border shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          SOAP Clinical Notes ({notes.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("assessments")}
          className={`px-4 py-2 text-xs font-sora font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === "assessments"
              ? "bg-white text-brand-purple border-t border-l border-r border-ink-border shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Vision Assessments ({assessments.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={`px-4 py-2 text-xs font-sora font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === "plans"
              ? "bg-white text-brand-purple border-t border-l border-r border-ink-border shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Treatment Plans ({treatmentPlans.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("consents")}
          className={`px-4 py-2 text-xs font-sora font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === "consents"
              ? "bg-white text-brand-purple border-t border-l border-r border-ink-border shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Consents & Records
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 text-xs font-sora font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === "audit"
              ? "bg-white text-brand-purple border-t border-l border-r border-ink-border shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Clinical Audit Trail
        </button>
      </div>

      {/* TAB 1: OVERVIEW & MEDICAL HISTORY */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ocular History Card */}
          <div className="bg-white p-6 rounded-2xl border border-ink-border shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-brand-purple" />
                <h3 className="font-serif text-base font-medium text-ink">Ocular & Vision History</h3>
              </div>
              <Badge variant="plum" className="text-[10px]">
                Ophthalmology Baseline
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-ink-muted block text-[11px] uppercase">
                  Refractive History & Correction
                </span>
                <p className="text-ink font-medium mt-0.5">
                  {medicalHistory?.ocularHistory.refractiveHistory || "Not recorded."}
                </p>
              </div>

              <div>
                <span className="font-semibold text-ink-muted block text-[11px] uppercase">
                  Current Symptoms Reported
                </span>
                {medicalHistory?.ocularHistory.currentSymptoms &&
                medicalHistory.ocularHistory.currentSymptoms.length > 0 ? (
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-ink">
                    {medicalHistory.ocularHistory.currentSymptoms.map((sym, i) => (
                      <li key={i}>{sym}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-ink mt-0.5">No acute symptoms reported.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-ink-border/50">
                <div>
                  <span className="text-ink-muted text-[11px] block">Amblyopia (Lazy Eye):</span>
                  <span className="font-bold text-ink">
                    {medicalHistory?.ocularHistory.amblyopiaLazyEye ? "Yes (Confirmed)" : "No"}
                  </span>
                </div>
                <div>
                  <span className="text-ink-muted text-[11px] block">Strabismus (Squint):</span>
                  <span className="font-bold text-ink">
                    {medicalHistory?.ocularHistory.strabismusSquint ? "Yes (Confirmed)" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Environment & Ergonomics Card */}
          <div className="bg-white p-6 rounded-2xl border border-ink-border shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-brand-orange" />
                <h3 className="font-serif text-base font-medium text-ink">
                  Screen Ergonomics & Lighting
                </h3>
              </div>
              <Badge variant="sage" className="text-[10px]">
                Lifestyle Factors
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-ink-muted block text-[11px] uppercase">
                  Daily Digital Screen Exposure
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold font-serif text-ink">
                    {medicalHistory?.visualEnvironment.dailyScreenHours ?? 8}
                  </span>
                  <span className="text-ink-muted">hours / day</span>
                  {(medicalHistory?.visualEnvironment.dailyScreenHours || 0) >= 8 && (
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                      High Visual Strain Risk
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="font-semibold text-ink-muted block text-[11px] uppercase">
                  Primary Task / Lighting Environment
                </span>
                <p className="text-ink mt-0.5">
                  {medicalHistory?.visualEnvironment.primaryWorkType || "Desk work"} •{" "}
                  {medicalHistory?.visualEnvironment.lightingQuality || "Natural & ambient light"}
                </p>
              </div>

              <div className="pt-2 border-t border-ink-border/50">
                <span className="font-semibold text-ink-muted block text-[11px] uppercase">
                  Current Medications & Ocular Drops
                </span>
                <p className="text-ink mt-0.5">
                  {medicalHistory?.currentMedications || "None reported"}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Encounters Summary */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-ink-border shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-base font-medium text-ink">
                Encounter History ({encounters.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEncounterModalOpen(true)}
                className="text-xs"
              >
                + Log New Encounter
              </Button>
            </div>

            {encounters.length === 0 ? (
              <p className="text-xs text-ink-muted py-4">No encounters logged yet.</p>
            ) : (
              <div className="divide-y divide-ink-border text-xs">
                {encounters.map((enc) => (
                  <div key={enc.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink">{enc.chiefComplaint}</span>
                        <span className="px-2 py-0.5 rounded-full bg-brand-lavender text-brand-purple text-[10px] font-bold">
                          {enc.encounterType.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-ink-muted text-[11px]">{enc.clinicalSummary}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-ink text-[11px] block">{enc.encounterDate}</span>
                      <span className="text-[10px] text-ink-muted block">{enc.therapistName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SOAP CLINICAL NOTES */}
      {activeTab === "notes" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-medium text-ink">SOAP Clinical Progress Notes</h3>
              <p className="text-xs text-ink-muted">
                Legally binding clinical records following Subjective, Objective, Assessment, Plan structure.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenDraftNote()}
              className="bg-brand-orange hover:bg-brand-orangeHover text-white text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Draft SOAP Note</span>
            </Button>
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-ink-border p-6 text-xs text-ink-muted">
              No SOAP notes recorded for this patient. Click &ldquo;+ Draft SOAP Note&rdquo; to begin clinical documentation.
            </div>
          ) : (
            <div className="space-y-6">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`bg-white rounded-2xl border shadow-subtle overflow-hidden transition-all ${
                    note.isLocked
                      ? "border-emerald-200"
                      : "border-amber-200 bg-amber-50/20"
                  }`}
                >
                  {/* Note Header */}
                  <div
                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
                      note.isLocked ? "bg-emerald-50/60 border-emerald-100" : "bg-amber-50/60 border-amber-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          note.isLocked
                            ? "bg-emerald-600 text-white"
                            : "bg-amber-600 text-white"
                        }`}
                      >
                        {note.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-sora font-bold text-sm text-ink">
                            Clinical Encounter Note — {note.noteDate}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              note.isLocked
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-amber-100 text-amber-800 border border-amber-300"
                            }`}
                          >
                            {note.isLocked ? "FINALIZED & SIGNED" : "DRAFT (MUTABLE)"}
                          </span>
                        </div>
                        <span className="text-[11px] text-ink-muted">
                          Practitioner: <strong>{note.therapistName}</strong>
                          {note.signedAt && (
                            <>
                              {" "}
                              • Signed on {new Date(note.signedAt).toLocaleString()} by{" "}
                              <strong>{note.signedByName}</strong>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Note Action Buttons */}
                    <div className="flex items-center gap-2">
                      {!note.isLocked ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDraftNote(note)}
                            className="text-xs gap-1 border-amber-300 hover:bg-amber-100"
                          >
                            <Edit2 className="w-3 h-3 text-amber-700" />
                            <span>Edit Draft</span>
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setTargetNoteToSign(note);
                              setSignConfirmOpen(true);
                            }}
                            className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Sign & Lock Note</span>
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTargetNoteToAmend(note);
                            setAmendModalOpen(true);
                          }}
                          className="text-xs gap-1 border-ink-border hover:bg-canvas-light text-brand-purple"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Legal Amendment</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* SOAP Content Grid */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                    {/* S: Subjective */}
                    <div className="p-4 rounded-xl bg-canvas-light border border-ink-border/50">
                      <div className="flex items-center gap-1.5 font-sora font-bold text-brand-purple mb-1">
                        <span className="w-5 h-5 rounded-md bg-brand-lavender flex items-center justify-center text-xs">
                          S
                        </span>
                        <span>Subjective (Patient Reported)</span>
                      </div>
                      <p className="text-ink leading-relaxed mt-1 whitespace-pre-line">
                        {note.subjective}
                      </p>
                    </div>

                    {/* O: Objective */}
                    <div className="p-4 rounded-xl bg-canvas-light border border-ink-border/50">
                      <div className="flex items-center gap-1.5 font-sora font-bold text-brand-purple mb-1">
                        <span className="w-5 h-5 rounded-md bg-brand-lavender flex items-center justify-center text-xs">
                          O
                        </span>
                        <span>Objective (Clinical Measurements)</span>
                      </div>
                      <p className="text-ink leading-relaxed mt-1 whitespace-pre-line">
                        {note.objective}
                      </p>
                    </div>

                    {/* A: Assessment */}
                    <div className="p-4 rounded-xl bg-canvas-light border border-ink-border/50">
                      <div className="flex items-center gap-1.5 font-sora font-bold text-brand-purple mb-1">
                        <span className="w-5 h-5 rounded-md bg-brand-lavender flex items-center justify-center text-xs">
                          A
                        </span>
                        <span>Assessment (Clinical Diagnosis & Gains)</span>
                      </div>
                      <p className="text-ink leading-relaxed mt-1 whitespace-pre-line">
                        {note.assessment}
                      </p>
                    </div>

                    {/* P: Plan */}
                    <div className="p-4 rounded-xl bg-canvas-light border border-ink-border/50">
                      <div className="flex items-center gap-1.5 font-sora font-bold text-brand-purple mb-1">
                        <span className="w-5 h-5 rounded-md bg-brand-lavender flex items-center justify-center text-xs">
                          P
                        </span>
                        <span>Plan (Therapy Protocol & Follow-up)</span>
                      </div>
                      <p className="text-ink leading-relaxed mt-1 whitespace-pre-line">
                        {note.plan}
                      </p>
                    </div>
                  </div>

                  {/* Legal Amendments Section */}
                  {note.amendments && note.amendments.length > 0 && (
                    <div className="px-6 pb-6 pt-2 border-t border-ink-border/40 space-y-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-sora font-bold text-ink">
                          Verified Clinical Amendments ({note.amendments.length})
                        </span>
                      </div>

                      <div className="space-y-2">
                        {note.amendments.map((amend) => (
                          <div
                            key={amend.id}
                            className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-emerald-900">
                                Amendment by {amend.amendedByName} • {new Date(amend.amendedAt).toLocaleString()}
                              </span>
                              <span className="text-emerald-700 font-medium">
                                Reason: {amend.reasonForAmendment}
                              </span>
                            </div>
                            <p className="text-ink leading-relaxed whitespace-pre-line">
                              {amend.amendmentText}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VISION ASSESSMENTS */}
      {activeTab === "assessments" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-medium text-ink">Vision Assessments & Binocular Vergence</h3>
              <p className="text-xs text-ink-muted">
                Acuity measurements, Near Point of Convergence (NPC), stereopsis, and motility.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAssessmentModalOpen(true)}
              className="bg-brand-orange hover:bg-brand-orangeHover text-white text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Record Vision Assessment</span>
            </Button>
          </div>

          {assessments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-ink-border p-6 text-xs text-ink-muted">
              No quantitative assessments recorded. Click &ldquo;+ Record Vision Assessment&rdquo; to input metrics.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {assessments.map((a) => (
                <div key={a.id} className="bg-white p-6 rounded-2xl border border-ink-border shadow-subtle space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <span className="font-sora font-bold text-sm text-ink block">
                        Assessment Date: {a.assessmentDate}
                      </span>
                      <span className="text-[11px] text-ink-muted">Evaluated by {a.therapistName}</span>
                    </div>
                    <Badge variant="plum" className="text-[10px]">
                      Binocular Metrics
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    {/* Visual Acuity Box */}
                    <div className="p-3.5 rounded-xl bg-canvas-light border border-ink-border/50 space-y-1">
                      <span className="font-bold text-brand-purple block uppercase text-[10px]">
                        Visual Acuity (Snellen)
                      </span>
                      <div className="space-y-0.5 text-ink">
                        <div>
                          OD (Right):{" "}
                          <strong>{a.visualAcuity.odCorrected || a.visualAcuity.odUncorrected || "N/A"}</strong>
                        </div>
                        <div>
                          OS (Left):{" "}
                          <strong>{a.visualAcuity.osCorrected || a.visualAcuity.osUncorrected || "N/A"}</strong>
                        </div>
                        <div>
                          OU (Both):{" "}
                          <strong>{a.visualAcuity.ouCorrected || "6/6"}</strong>
                        </div>
                      </div>
                    </div>

                    {/* NPC & Stereopsis */}
                    <div className="p-3.5 rounded-xl bg-canvas-light border border-ink-border/50 space-y-1">
                      <span className="font-bold text-brand-purple block uppercase text-[10px]">
                        Vergence & Stereopsis
                      </span>
                      <div className="space-y-0.5 text-ink">
                        <div>
                          NPC: <strong>{a.binocularVision.nearPointConvergenceNPC || "N/A"}</strong>
                        </div>
                        <div>
                          Stereopsis: <strong>{a.binocularVision.stereopsis || "Normal"}</strong>
                        </div>
                        <div>
                          Motility:{" "}
                          <strong className="capitalize">{a.binocularVision.ocularMotilityPursuits || "Smooth"}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Brock String */}
                    <div className="p-3.5 rounded-xl bg-canvas-light border border-ink-border/50 space-y-1">
                      <span className="font-bold text-brand-purple block uppercase text-[10px]">
                        Brock String Training State
                      </span>
                      <p className="text-ink leading-relaxed">
                        {a.binocularVision.brockStringFixation || "Physiological diplopia active on beads."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 text-xs border-t border-ink-border/40 space-y-1">
                    <span className="font-semibold text-ink-muted text-[11px] uppercase block">
                      Clinical Impression & Treatment Direction
                    </span>
                    <p className="text-ink font-medium leading-relaxed">{a.clinicalImpression}</p>
                    {a.recommendations && (
                      <p className="text-brand-purple text-[11px] mt-1">
                        <strong>Prescription:</strong> {a.recommendations}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TREATMENT PLANS */}
      {activeTab === "plans" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-medium text-ink">Active Clinical Treatment Protocols</h3>
              <p className="text-xs text-ink-muted">
                Multi-week restorative regimens, convergence exercises, and vision yoga therapies.
              </p>
            </div>
          </div>

          {treatmentPlans.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-ink-border p-6 text-xs text-ink-muted">
              No formal treatment plans established.
            </div>
          ) : (
            <div className="space-y-6">
              {treatmentPlans.map((plan) => (
                <div key={plan.id} className="bg-white p-6 rounded-2xl border border-ink-border shadow-subtle space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h4 className="font-sora font-bold text-base text-ink">{plan.title}</h4>
                      <p className="text-xs text-brand-purple font-medium mt-0.5">
                        Diagnosis: {plan.primaryDiagnosis}
                      </p>
                    </div>
                    <Badge variant={plan.status === "active" ? "success" : "faint"} className="text-xs">
                      {plan.status.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Goals */}
                  <div className="text-xs space-y-1.5">
                    <span className="font-bold text-ink uppercase text-[10px] tracking-wider block">
                      Target Clinical Goals
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-ink">
                      {plan.goals.map((g, idx) => (
                        <li key={idx}>{g}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Prescribed Therapies */}
                  <div className="text-xs space-y-2 pt-2 border-t border-ink-border/40">
                    <span className="font-bold text-ink uppercase text-[10px] tracking-wider block">
                      Prescribed Daily Protocols & Exercises
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {plan.prescribedTherapies.map((pt, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-canvas-light border border-ink-border/50 space-y-1">
                          <span className="font-bold text-brand-purple text-xs block">{pt.therapyName}</span>
                          <span className="text-[11px] text-ink-muted block">{pt.frequency} • {pt.durationWeeks} weeks</span>
                          <div className="pt-1 flex flex-wrap gap-1">
                            {pt.specificExercises.map((ex, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-white text-ink text-[10px] border border-ink-border">
                                {ex}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {plan.progressNotes && (
                    <div className="pt-2 text-xs border-t border-ink-border/40">
                      <span className="text-ink-muted font-semibold text-[10px] uppercase block">
                        Practitioner Progress Evaluation
                      </span>
                      <p className="text-ink mt-0.5">{plan.progressNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CONSENTS & LEGAL RECORDS */}
      {activeTab === "consents" && (
        <div className="bg-white p-6 rounded-2xl border border-ink-border shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-serif text-base font-medium text-ink">
                Patient Consents & Legal Document Compliance
              </h3>
              <p className="text-xs text-ink-muted">
                Governed under India DPDP Act and international tele-optometry standards.
              </p>
            </div>
            <Badge variant="success" className="text-[10px]">
              Verified Consents
            </Badge>
          </div>

          <div className="divide-y divide-ink-border text-xs">
            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-ink block">Informed Consent for Natural Vision Therapy</span>
                <span className="text-ink-muted text-[11px]">
                  Authorized by {patient.fullName} • Status: Granted
                </span>
              </div>
              <Badge variant="success" className="text-[10px]">
                Active
              </Badge>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-ink block">Digital Health & Ocular Data Privacy (DPDP)</span>
                <span className="text-ink-muted text-[11px]">
                  Encrypted storage and clinical audit permissions • Status: Granted
                </span>
              </div>
              <Badge variant="success" className="text-[10px]">
                Active
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CLINICAL AUDIT TRAIL */}
      {activeTab === "audit" && (
        <div className="bg-white p-6 rounded-2xl border border-ink-border shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-serif text-base font-medium text-ink">Immutable Medical Audit Log</h3>
              <p className="text-xs text-ink-muted">
                Complete traceability of every chart view, note drafting, signature, and addendum.
              </p>
            </div>
            <Badge variant="plum" className="text-[10px]">
              Legal Compliance
            </Badge>
          </div>

          {auditLogs.length === 0 ? (
            <p className="text-xs text-ink-muted py-4">No logged clinical events yet.</p>
          ) : (
            <div className="divide-y divide-ink-border text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-brand-purple text-[11px] block">
                      {log.action}
                    </span>
                    <span className="text-ink-muted text-[11px]">
                      By <strong>{log.staffName}</strong> ({log.staffId})
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-ink-muted shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sign & Lock Confirmation Modal */}
      {targetNoteToSign && (
        <ConfirmModal
          open={signConfirmOpen}
          onClose={() => {
            setSignConfirmOpen(false);
            setTargetNoteToSign(null);
          }}
          onConfirm={handleSignConfirm}
          title="Sign & Permanently Lock SOAP Note"
          variant="warning"
          confirmText="Yes, Sign & Lock Note"
          description={
            <div className="space-y-2">
              <p className="font-semibold text-ink">
                You are about to sign this clinical note for {patient.fullName}.
              </p>
              <p>
                Once signed, this note becomes a <strong>legally locked clinical record</strong> and cannot be edited or overwritten. Any future additions must be appended as verified amendments.
              </p>
            </div>
          }
        />
      )}

      {/* Add Amendment Modal */}
      {amendModalOpen && targetNoteToAmend && (
        <Dialog
          open={amendModalOpen}
          onClose={() => {
            setAmendModalOpen(false);
            setTargetNoteToAmend(null);
          }}
          title="Add Verified Clinical Amendment"
          description="Appends a dated, signed addendum to this finalized SOAP note."
          maxWidth="md"
        >
          <form onSubmit={handleAmendNote} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-ink mb-1">Reason for Amendment *</label>
              <input
                type="text"
                required
                value={amendReason}
                onChange={(e) => setAmendReason(e.target.value)}
                placeholder="e.g. Additional test results received, corrected dosage note"
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink focus:ring-1 focus:ring-brand-purple"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Amendment Clinical Text *</label>
              <textarea
                rows={4}
                required
                value={amendText}
                onChange={(e) => setAmendText(e.target.value)}
                placeholder="Enter complete amendment details..."
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink focus:ring-1 focus:ring-brand-purple"
              />
            </div>

            <div className="pt-4 border-t border-ink-border flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  setAmendModalOpen(false);
                  setTargetNoteToAmend(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" className="bg-brand-purple text-white">
                Record Verified Amendment
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* SOAP Note Editor Modal */}
      {noteModalOpen && (
        <Dialog
          open={noteModalOpen}
          onClose={() => setNoteModalOpen(false)}
          title={editingNoteId ? "Edit SOAP Note Draft" : "Draft New SOAP Clinical Note"}
          description="Complete Subjective, Objective, Assessment, and Plan components."
          maxWidth="xl"
        >
          <form onSubmit={handleSaveSoapNote} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-ink mb-1">
                Subjective (S) — Patient-reported vision fatigue, pain, strain triggers *
              </label>
              <textarea
                rows={3}
                required
                value={soapSubjective}
                onChange={(e) => setSoapSubjective(e.target.value)}
                placeholder="Patient reports difficulty reading small print in low light..."
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">
                Objective (O) — Clinical measurements, acuity, NPC convergence, stereopsis *
              </label>
              <textarea
                rows={3}
                required
                value={soapObjective}
                onChange={(e) => setSoapObjective(e.target.value)}
                placeholder="VA OD 6/9, OS 6/6. NPC 8cm break. Brock string physiological diplopia intact..."
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">
                Assessment (A) — Practitioner clinical diagnosis and weekly progression *
              </label>
              <textarea
                rows={3}
                required
                value={soapAssessment}
                onChange={(e) => setSoapAssessment(e.target.value)}
                placeholder="Amblyopia demonstrating clear neuro-visual recovery..."
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">
                Plan (P) — Prescribed home exercises, Brock string regimen, next review date *
              </label>
              <textarea
                rows={3}
                required
                value={soapPlan}
                onChange={(e) => setSoapPlan(e.target.value)}
                placeholder="Daily 10min Brock string, conscious Bates palming before sleep. Review in 14 days."
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
              />
            </div>

            <div className="pt-4 border-t border-ink-border flex justify-end gap-3">
              <Button variant="outline" size="sm" type="button" onClick={() => setNoteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" className="bg-brand-orange text-white">
                Save Note Draft
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Record Encounter Modal */}
      {encounterModalOpen && (
        <Dialog
          open={encounterModalOpen}
          onClose={() => setEncounterModalOpen(false)}
          title="Record Clinical Encounter"
          description="Log a vision therapy session or progress check-in."
          maxWidth="md"
        >
          <form onSubmit={handleCreateEncounter} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-ink mb-1">Encounter Type *</label>
              <select
                value={encounterType}
                onChange={(e) => setEncounterType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
              >
                <option value="vision_therapy_session">Vision Therapy Session</option>
                <option value="sports_vision_training">Sports Vision Training</option>
                <option value="eye_yoga_checkin">Eye Yoga Check-in</option>
                <option value="initial_consultation">Initial Consultation</option>
                <option value="progress_evaluation">Progress Evaluation</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Chief Complaint / Goal *</label>
              <input
                type="text"
                required
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="e.g. Brock string bead alignment & anti-suppression"
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Clinical Summary</label>
              <textarea
                rows={3}
                value={clinicalSummary}
                onChange={(e) => setClinicalSummary(e.target.value)}
                placeholder="Session observations..."
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
              />
            </div>

            <div className="pt-4 border-t border-ink-border flex justify-end gap-3">
              <Button variant="outline" size="sm" type="button" onClick={() => setEncounterModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" className="bg-brand-purple text-white">
                Save Encounter
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Record Vision Assessment Modal */}
      {assessmentModalOpen && (
        <Dialog
          open={assessmentModalOpen}
          onClose={() => setAssessmentModalOpen(false)}
          title="Record Quantitative Vision Assessment"
          description="Input visual acuity, NPC convergence, and stereopsis."
          maxWidth="lg"
        >
          <form onSubmit={handleCreateAssessment} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-ink mb-1">VA OD Corrected (Right)</label>
                <input
                  type="text"
                  value={vaOdCorrected}
                  onChange={(e) => setVaOdCorrected(e.target.value)}
                  placeholder="e.g. 6/6 or 20/20"
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">VA OS Corrected (Left)</label>
                <input
                  type="text"
                  value={vaOsCorrected}
                  onChange={(e) => setVaOsCorrected(e.target.value)}
                  placeholder="e.g. 6/6 or 20/20"
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-ink mb-1">Near Point Convergence (NPC)</label>
                <input
                  type="text"
                  value={npcValue}
                  onChange={(e) => setNpcValue(e.target.value)}
                  placeholder="e.g. 6 cm break / 9 cm recovery"
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Stereopsis (Depth Perception)</label>
                <input
                  type="text"
                  value={stereopsisValue}
                  onChange={(e) => setStereopsisValue(e.target.value)}
                  placeholder="e.g. 40 arc seconds"
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Clinical Impression *</label>
              <input
                type="text"
                required
                value={clinicalImpression}
                onChange={(e) => setClinicalImpression(e.target.value)}
                placeholder="e.g. Convergence insufficiency recovering with therapy"
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Recommendations</label>
              <input
                type="text"
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="e.g. Brock string 8 mins twice daily"
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
              />
            </div>

            <div className="pt-4 border-t border-ink-border flex justify-end gap-3">
              <Button variant="outline" size="sm" type="button" onClick={() => setAssessmentModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" className="bg-brand-purple text-white">
                Save Assessment
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
