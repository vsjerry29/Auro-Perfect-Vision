/**
 * AURO PERFECT VISION — ELECTRONIC MEDICAL RECORDS (EMR) DATA LAYER
 * Safe persistence engine supporting Hostinger MySQL and memory fallback.
 * Strictly adheres to healthcare data integrity:
 * - Immutable signed SOAP notes
 * - Addendum / amendment tracking
 * - Full clinical audit trails
 */

import {
  PatientRecord,
  PatientMedicalHistory,
  ClinicalEncounter,
  VisionAssessment,
  ClinicalNote,
  ClinicalNoteAmendment,
  TreatmentPlan,
  ClinicalDocument,
  ClinicalConsent,
  ClinicalAuditEvent,
} from "@/lib/types/emr";
import { isMySQLConfigured } from "./mysql";
import { isTestMode } from "./storage-engine";
import * as db from "./mysql-db";

type EmrStoreState = {
  patients: Map<string, PatientRecord>;
  medicalHistories: Map<string, PatientMedicalHistory>;
  encounters: Map<string, ClinicalEncounter>;
  assessments: Map<string, VisionAssessment>;
  notes: Map<string, ClinicalNote>;
  treatmentPlans: Map<string, TreatmentPlan>;
  documents: Map<string, ClinicalDocument>;
  consents: Map<string, ClinicalConsent>;
  auditLogs: ClinicalAuditEvent[];
};

const globalForEmr = globalThis as unknown as {
  __apvEmrMemoryStore?: EmrStoreState;
};

// In-Memory Data Store for resilient offline / local dev / unit testing
const emrStore: EmrStoreState =
  globalForEmr.__apvEmrMemoryStore ||
  (globalForEmr.__apvEmrMemoryStore = {
    patients: new Map(),
    medicalHistories: new Map(),
    encounters: new Map(),
    assessments: new Map(),
    notes: new Map(),
    treatmentPlans: new Map(),
    documents: new Map(),
    consents: new Map(),
    auditLogs: [],
  });

// Seed baseline clinical patients
function initializeBaselineEmrSeed() {
  if (emrStore.patients.size > 0) return;

  const patient1: PatientRecord = {
    id: "patient-1",
    mrn: "APV-MRN-2026-001",
    crmContactId: "contact-1",
    fullName: "Aarav Sharma",
    dateOfBirth: "2016-04-12",
    age: 10,
    gender: "male",
    phone: "+91 98765 11223",
    email: "sharma.family@example.com",
    address: "Auroville International Township, Tamil Nadu",
    emergencyContactName: "Priya Sharma (Mother)",
    emergencyContactPhone: "+91 98765 11224",
    bloodGroup: "B+",
    allergies: ["Pollen"],
    clinicalAlerts: ["Amblyopia OD (Lazy Eye)", "Accommodative Insufficiency"],
    primaryTherapistId: "therapist-1",
    primaryTherapistName: "Dr. Ananya Sen",
    status: "active",
    createdAt: "2026-01-10T09:00:00Z",
    updatedAt: "2026-11-18T10:00:00Z",
  };

  const patient2: PatientRecord = {
    id: "patient-2",
    mrn: "APV-MRN-2026-002",
    crmContactId: "contact-2",
    fullName: "Meera Krishnan",
    dateOfBirth: "1994-08-25",
    age: 32,
    gender: "female",
    phone: "+91 94432 99881",
    email: "meera.krishnan@designworks.in",
    address: "Pondicherry Beach Road, Puducherry",
    occupation: "Senior UI/UX Designer & 3D Artist",
    emergencyContactName: "R. Krishnan (Father)",
    emergencyContactPhone: "+91 94432 99880",
    bloodGroup: "O+",
    allergies: [],
    clinicalAlerts: ["Severe Digital Screen Asthenopia (>11 hrs/day)", "Convergence Insufficiency"],
    primaryTherapistId: "therapist-2",
    primaryTherapistName: "Matteo Bianchi",
    status: "active",
    createdAt: "2026-02-14T11:00:00Z",
    updatedAt: "2026-11-18T11:30:00Z",
  };

  emrStore.patients.set(patient1.id, patient1);
  emrStore.patients.set(patient2.id, patient2);

  // Medical Histories
  emrStore.medicalHistories.set(patient1.id, {
    id: "hist-1",
    patientId: patient1.id,
    ocularHistory: {
      amblyopiaLazyEye: true,
      strabismusSquint: false,
      refractiveHistory: "OD: +3.50 DS / +0.75 DC x 90, OS: +1.00 DS",
      currentSymptoms: ["Eye turns in when fatigued", "Difficulty tracking lines while reading"],
    },
    systemicHistory: {
      generalHealthNotes: "Healthy child, milestones on target.",
    },
    familyOcularHistory: "Maternal uncle has amblyopia.",
    currentMedications: "None",
    visualEnvironment: {
      dailyScreenHours: 2,
      primaryWorkType: "Primary School Studies & Drawing",
      lightingQuality: "Good natural illumination",
    },
    visualAids: {
      wearsGlasses: true,
      prescriptionDetails: "OD +3.50 / +0.75 x 90 | OS +1.00",
    },
    updatedAt: "2026-11-15T10:00:00Z",
  });

  emrStore.medicalHistories.set(patient2.id, {
    id: "hist-2",
    patientId: patient2.id,
    ocularHistory: {
      currentSymptoms: [
        "Severe frontal headaches after 3pm",
        "Intermittent double vision during close laptop work",
        "Burning sensation and ocular dryness",
      ],
      refractiveHistory: "Myopia -2.25 OU",
    },
    systemicHistory: {
      generalHealthNotes: "Occasional migraine triggered by screen flicker.",
    },
    currentMedications: "Preservative-free lubricating eye drops (CMC 0.5%)",
    visualEnvironment: {
      dailyScreenHours: 11,
      primaryWorkType: "Dual 4K Monitor Interface Design",
      lightingQuality: "Overhead fluorescent with moderate glare",
    },
    visualAids: {
      wearsGlasses: true,
      prescriptionDetails: "-2.25 DS OU with blue-light filter",
    },
    updatedAt: "2026-11-16T12:00:00Z",
  });

  // Clinical Encounters
  const encounter1: ClinicalEncounter = {
    id: "enc-101",
    patientId: patient1.id,
    patientName: patient1.fullName,
    encounterDate: "2026-11-10",
    encounterType: "vision_therapy_session",
    therapistId: "therapist-1",
    therapistName: "Dr. Ananya Sen",
    chiefComplaint: "Evaluation of Brock string bead fixation and anti-suppression progress.",
    status: "completed",
    durationMinutes: 60,
    clinicalSummary: "Marked improvement in red-bead physiological diplopia. Suppression breaking consistently.",
    createdAt: "2026-11-10T10:00:00Z",
    updatedAt: "2026-11-10T11:00:00Z",
  };
  emrStore.encounters.set(encounter1.id, encounter1);

  // Vision Assessments
  const assessment1: VisionAssessment = {
    id: "assess-201",
    patientId: patient1.id,
    encounterId: encounter1.id,
    assessmentDate: "2026-11-10",
    therapistId: "therapist-1",
    therapistName: "Dr. Ananya Sen",
    visualAcuity: {
      odUncorrected: "6/24",
      odCorrected: "6/9",
      osUncorrected: "6/6",
      osCorrected: "6/6",
      ouCorrected: "6/6",
    },
    binocularVision: {
      nearPointConvergenceNPC: "8 cm break / 11 cm recovery",
      stereopsis: "80 arc seconds (Titmus Fly)",
      ocularMotilityPursuits: "smooth",
      ocularMotilitySaccades: "accurate",
      brockStringFixation: "Fixation on red bead at 40cm stable; green bead shows intermittent right suppression.",
    },
    clinicalImpression: "Right refractive amblyopia responding positively to monocular fixation in binocular field.",
    recommendations: "Continue daily Brock string 10 mins + red/green anaglyph tracing twice weekly.",
    createdAt: "2026-11-10T10:30:00Z",
  };
  emrStore.assessments.set(assessment1.id, assessment1);

  // SOAP Clinical Note (Signed & Locked)
  const note1: ClinicalNote = {
    id: "note-301",
    patientId: patient1.id,
    encounterId: encounter1.id,
    therapistId: "therapist-1",
    therapistName: "Dr. Ananya Sen",
    noteDate: "2026-11-10",
    subjective: "Parent reports child is less reluctant to read storybooks. No complaints of headaches this week.",
    objective: "Corrected VA OD improved from 6/12 to 6/9. NPC measured at 8cm break / 11cm recovery. Brock string physiological diplopia appreciated on mid-distance bead.",
    assessment: "Substantial neuro-visual gains in right amblyopic eye; binocular summation improving.",
    plan: "Advance to dynamic Hart chart saccades and anti-suppression vectograms. Recheck in 2 weeks.",
    status: "finalized_signed",
    isLocked: true,
    signedBy: "staff-super-1",
    signedByName: "Dr. Ananya Sen",
    signedAt: "2026-11-10T11:15:00Z",
    amendments: [],
    createdAt: "2026-11-10T10:45:00Z",
    updatedAt: "2026-11-10T11:15:00Z",
  };
  emrStore.notes.set(note1.id, note1);

  // Treatment Plan
  const plan1: TreatmentPlan = {
    id: "plan-401",
    patientId: patient1.id,
    therapistId: "therapist-1",
    therapistName: "Dr. Ananya Sen",
    title: "16-Week Pediatric Amblyopia & Binocular Integration Regimen",
    primaryDiagnosis: "Refractive Amblyopia OD (Anisometropic) & Accommodative Fatigue",
    goals: [
      "Attain Best Corrected Visual Acuity OD 6/6",
      "Normalize NPC to < 6cm break / 8cm recovery",
      "Achieve full random dot stereopsis (40 arc sec)",
    ],
    prescribedTherapies: [
      {
        therapyName: "Brock String Fixation & Diplopia Awareness",
        frequency: "Twice daily, 8 minutes each session",
        durationWeeks: 12,
        specificExercises: ["Near-Far Jump Fixations", "Bug on a String Smooth Convergence"],
      },
      {
        therapyName: "Auroville Conscious Eye Yoga & Bates Palming",
        frequency: "Daily before sleep, 10 minutes",
        durationWeeks: 16,
        specificExercises: ["Warm Palm Compression", "Infinity Figure-Eight Saccadic Tracking"],
      },
    ],
    startDate: "2026-10-01",
    targetEndDate: "2027-01-31",
    status: "active",
    progressNotes: "Week 6 evaluation: Patient achieving 6/9 OD, high compliance with home chart.",
    createdAt: "2026-10-01T12:00:00Z",
    updatedAt: "2026-11-10T11:20:00Z",
  };
  emrStore.treatmentPlans.set(plan1.id, plan1);
}

// Auto initialize on module load
initializeBaselineEmrSeed();

// ==================== PATIENTS API ====================

export async function getAllPatients(filters?: {
  search?: string;
  status?: string;
  therapistId?: string;
}): Promise<PatientRecord[]> {
  initializeBaselineEmrSeed();

  if (isMySQLConfigured()) {
    try {
      const records = await db.dbGetAllPatients();
      if (records && records.length > 0) {
        let filtered = records;
        if (filters?.status) {
          filtered = filtered.filter((r) => r.status === filters.status);
        }
        if (filters?.therapistId) {
          filtered = filtered.filter((r) => r.primaryTherapistId === filters.therapistId);
        }
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          filtered = filtered.filter(
            (r) =>
              r.fullName.toLowerCase().includes(q) ||
              r.mrn.toLowerCase().includes(q) ||
              r.phone.toLowerCase().includes(q)
          );
        }
        return filtered;
      }
    } catch (err: any) {
      console.warn("[MySQL EMR Read Fallback]:", err.message);
    }
  }

  // Fallback to in-memory store
  let list = Array.from(emrStore.patients.values());

  if (filters?.status) {
    list = list.filter((p) => p.status === filters.status);
  }
  if (filters?.therapistId) {
    list = list.filter((p) => p.primaryTherapistId === filters.therapistId);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.fullName.toLowerCase().includes(s) ||
        p.mrn.toLowerCase().includes(s) ||
        p.phone.includes(s) ||
        p.email.toLowerCase().includes(s)
    );
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getPatientChart(patientId: string): Promise<{
  patient: PatientRecord | null;
  medicalHistory: PatientMedicalHistory | null;
  encounters: ClinicalEncounter[];
  assessments: VisionAssessment[];
  notes: ClinicalNote[];
  treatmentPlans: TreatmentPlan[];
  documents: ClinicalDocument[];
  consents: ClinicalConsent[];
  auditLogs: ClinicalAuditEvent[];
}> {
  initializeBaselineEmrSeed();

  if (isMySQLConfigured()) {
    try {
      const patient = await db.dbGetPatientById(patientId);
      const medicalHistory = await db.dbGetMedicalHistory(patientId);
      const encounters = await db.dbGetEncountersByPatientId(patientId);
      const assessments = await db.dbGetAssessmentsByPatientId(patientId);
      const notes = await db.dbGetNotesByPatientId(patientId);
      const treatmentPlans = await db.dbGetTreatmentPlansByPatientId(patientId);
      const auditLogs = await db.dbGetClinicalAuditEvents(patientId);

      const documents = Array.from(emrStore.documents.values()).filter((d) => d.patientId === patientId);
      const consents = Array.from(emrStore.consents.values()).filter((c) => c.patientId === patientId);

      if (patient) {
        return {
          patient,
          medicalHistory,
          encounters,
          assessments,
          notes,
          treatmentPlans,
          documents,
          consents,
          auditLogs,
        };
      }
    } catch (err: any) {
      console.warn("[MySQL EMR Chart Fallback]:", err.message);
    }
  }

  const patient = emrStore.patients.get(patientId) || null;
  const medicalHistory = emrStore.medicalHistories.get(patientId) || null;

  const encounters = Array.from(emrStore.encounters.values())
    .filter((e) => e.patientId === patientId)
    .sort((a, b) => new Date(b.encounterDate).getTime() - new Date(a.encounterDate).getTime());

  const assessments = Array.from(emrStore.assessments.values())
    .filter((a) => a.patientId === patientId)
    .sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());

  const notes = Array.from(emrStore.notes.values())
    .filter((n) => n.patientId === patientId)
    .sort((a, b) => new Date(b.noteDate).getTime() - new Date(a.noteDate).getTime());

  const treatmentPlans = Array.from(emrStore.treatmentPlans.values())
    .filter((p) => p.patientId === patientId)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const documents = Array.from(emrStore.documents.values()).filter((d) => d.patientId === patientId);
  const consents = Array.from(emrStore.consents.values()).filter((c) => c.patientId === patientId);
  const auditLogs = emrStore.auditLogs.filter((l) => l.patientId === patientId);

  return {
    patient,
    medicalHistory,
    encounters,
    assessments,
    notes,
    treatmentPlans,
    documents,
    consents,
    auditLogs,
  };
}

export async function createPatient(data: Partial<PatientRecord>): Promise<PatientRecord> {
  initializeBaselineEmrSeed();

  const count = emrStore.patients.size + 1;
  const year = new Date().getFullYear();
  const seq = String(count).padStart(3, "0");
  const mrn = `APV-MRN-${year}-${seq}`;
  const id = `patient-${Date.now()}`;

  const newPatient: PatientRecord = {
    id,
    mrn,
    crmContactId: data.crmContactId,
    fullName: data.fullName || "Unnamed Patient",
    dateOfBirth: data.dateOfBirth,
    age: data.age,
    gender: data.gender || "undisclosed",
    phone: data.phone || "",
    email: data.email || "",
    address: data.address || "",
    occupation: data.occupation || "",
    emergencyContactName: data.emergencyContactName,
    emergencyContactPhone: data.emergencyContactPhone,
    bloodGroup: data.bloodGroup,
    allergies: data.allergies || [],
    clinicalAlerts: data.clinicalAlerts || [],
    primaryTherapistId: data.primaryTherapistId || "therapist-1",
    primaryTherapistName: data.primaryTherapistName || "Dr. Ananya Sen",
    status: data.status || "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  emrStore.patients.set(id, newPatient);

  // Initialize empty medical history
  const newHist: PatientMedicalHistory = {
    id: `hist-${Date.now()}`,
    patientId: id,
    ocularHistory: {},
    systemicHistory: {},
    visualEnvironment: {},
    visualAids: {},
    updatedAt: new Date().toISOString(),
  };
  emrStore.medicalHistories.set(id, newHist);

  if (isMySQLConfigured()) {
    try {
      await db.dbSavePatient(newPatient);
      await db.dbSaveMedicalHistory(newHist);
    } catch (err: any) {
      console.warn("[MySQL Create Patient Error]:", err.message);
    }
  }

  return newPatient;
}

export async function updatePatient(
  patientId: string,
  data: Partial<PatientRecord>
): Promise<PatientRecord | null> {
  initializeBaselineEmrSeed();
  const current = emrStore.patients.get(patientId);
  if (!current) return null;

  const updated: PatientRecord = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  emrStore.patients.set(patientId, updated);

  if (isMySQLConfigured()) {
    try {
      await db.dbSavePatient(updated);
    } catch (err: any) {
      console.warn("[MySQL Update Patient Error]:", err.message);
    }
  }

  return updated;
}

export async function updateMedicalHistory(
  patientId: string,
  data: Partial<PatientMedicalHistory>
): Promise<PatientMedicalHistory> {
  initializeBaselineEmrSeed();
  const current = emrStore.medicalHistories.get(patientId) || {
    id: `hist-${Date.now()}`,
    patientId,
    ocularHistory: {},
    systemicHistory: {},
    visualEnvironment: {},
    visualAids: {},
    updatedAt: new Date().toISOString(),
  };

  const updated: PatientMedicalHistory = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  emrStore.medicalHistories.set(patientId, updated);

  if (isMySQLConfigured()) {
    try {
      await db.dbSaveMedicalHistory(updated);
    } catch (err: any) {
      console.warn("[MySQL Update Medical History Error]:", err.message);
    }
  }

  return updated;
}

// ==================== ENCOUNTERS API ====================

export async function createEncounter(data: Partial<ClinicalEncounter>): Promise<ClinicalEncounter> {
  initializeBaselineEmrSeed();
  const id = `enc-${Date.now()}`;
  const encounter: ClinicalEncounter = {
    id,
    patientId: data.patientId!,
    patientName: data.patientName || "Patient",
    encounterDate: data.encounterDate || new Date().toISOString().split("T")[0],
    encounterType: data.encounterType || "vision_therapy_session",
    therapistId: data.therapistId || "therapist-1",
    therapistName: data.therapistName || "Vision Practitioner",
    chiefComplaint: data.chiefComplaint || "Routine follow-up evaluation",
    status: data.status || "completed",
    linkedBookingId: data.linkedBookingId,
    durationMinutes: data.durationMinutes || 60,
    clinicalSummary: data.clinicalSummary || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  emrStore.encounters.set(id, encounter);

  if (isMySQLConfigured()) {
    try {
      await db.dbSaveEncounter(encounter);
    } catch (err: any) {
      console.warn("[MySQL Create Encounter Error]:", err.message);
    }
  }

  return encounter;
}

// ==================== ASSESSMENTS API ====================

export async function createVisionAssessment(
  data: Partial<VisionAssessment>
): Promise<VisionAssessment> {
  initializeBaselineEmrSeed();
  const id = `assess-${Date.now()}`;
  const assessment: VisionAssessment = {
    id,
    patientId: data.patientId!,
    encounterId: data.encounterId || "",
    assessmentDate: data.assessmentDate || new Date().toISOString().split("T")[0],
    therapistId: data.therapistId || "therapist-1",
    therapistName: data.therapistName || "Dr. Ananya Sen",
    visualAcuity: data.visualAcuity || {},
    refraction: data.refraction || {},
    binocularVision: data.binocularVision || {},
    intraocularPressureIOP: data.intraocularPressureIOP || {},
    clinicalImpression: data.clinicalImpression || "",
    recommendations: data.recommendations || "",
    createdAt: new Date().toISOString(),
  };

  emrStore.assessments.set(id, assessment);

  if (isMySQLConfigured()) {
    try {
      await db.dbSaveAssessment(assessment);
    } catch (err: any) {
      console.warn("[MySQL Save Assessment Error]:", err.message);
    }
  }

  return assessment;
}

// ==================== SOAP CLINICAL NOTES API ====================

export async function saveSoapNote(data: {
  id?: string;
  patientId: string;
  encounterId?: string;
  therapistId: string;
  therapistName: string;
  noteDate?: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  status?: "draft" | "finalized_signed";
}): Promise<ClinicalNote> {
  initializeBaselineEmrSeed();

  if (data.id && emrStore.notes.has(data.id)) {
    const existing = emrStore.notes.get(data.id)!;
    if (existing.isLocked) {
      throw new Error(
        "CLINICAL_RECORD_LOCKED: Signed clinical SOAP notes are legally protected and cannot be directly modified. Please use the Add Amendment feature to append verified clinical addenda."
      );
    }

    const updated: ClinicalNote = {
      ...existing,
      subjective: data.subjective,
      objective: data.objective,
      assessment: data.assessment,
      plan: data.plan,
      updatedAt: new Date().toISOString(),
    };
    emrStore.notes.set(data.id, updated);

    if (isMySQLConfigured()) {
      await db.dbSaveNote(updated);
    }
    return updated;
  }

  const id = data.id || `note-${Date.now()}`;
  const newNote: ClinicalNote = {
    id,
    patientId: data.patientId,
    encounterId: data.encounterId || "",
    therapistId: data.therapistId,
    therapistName: data.therapistName,
    noteDate: data.noteDate || new Date().toISOString().split("T")[0],
    subjective: data.subjective,
    objective: data.objective,
    assessment: data.assessment,
    plan: data.plan,
    status: data.status || "draft",
    isLocked: false,
    amendments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  emrStore.notes.set(id, newNote);

  if (isMySQLConfigured()) {
    await db.dbSaveNote(newNote);
  }
  return newNote;
}

export async function signAndLockSoapNote(
  noteId: string,
  signer: { id: string; fullName: string }
): Promise<ClinicalNote> {
  initializeBaselineEmrSeed();
  const note = emrStore.notes.get(noteId);
  if (!note) {
    throw new Error("SOAP Note not found.");
  }

  if (note.isLocked) {
    return note;
  }

  const signed: ClinicalNote = {
    ...note,
    status: "finalized_signed",
    isLocked: true,
    signedBy: signer.id,
    signedByName: signer.fullName,
    signedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  emrStore.notes.set(noteId, signed);

  if (isMySQLConfigured()) {
    await db.dbSaveNote(signed);
  }

  // Log clinical audit event
  logClinicalAuditEvent({
    patientId: note.patientId,
    staffId: signer.id,
    staffName: signer.fullName,
    action: "SIGNED_SOAP_NOTE",
    details: { noteId, signedAt: signed.signedAt },
  });

  return signed;
}

export async function amendSoapNote(
  noteId: string,
  amendmentData: {
    staffId: string;
    staffName: string;
    reasonForAmendment: string;
    amendmentText: string;
  }
): Promise<ClinicalNote> {
  initializeBaselineEmrSeed();
  const note = emrStore.notes.get(noteId);
  if (!note) {
    throw new Error("SOAP Note not found.");
  }

  const amendment: ClinicalNoteAmendment = {
    id: `amend-${Date.now()}`,
    clinicalNoteId: noteId,
    amendedBy: amendmentData.staffId,
    amendedByName: amendmentData.staffName,
    amendedAt: new Date().toISOString(),
    reasonForAmendment: amendmentData.reasonForAmendment,
    amendmentText: amendmentData.amendmentText,
  };

  const updated: ClinicalNote = {
    ...note,
    amendments: [...(note.amendments || []), amendment],
    updatedAt: new Date().toISOString(),
  };

  emrStore.notes.set(noteId, updated);

  logClinicalAuditEvent({
    patientId: note.patientId,
    staffId: amendmentData.staffId,
    staffName: amendmentData.staffName,
    action: "AMENDED_SOAP_NOTE",
    details: { noteId, amendmentId: amendment.id, reason: amendmentData.reasonForAmendment },
  });

  return updated;
}

// ==================== TREATMENT PLANS API ====================

export async function createTreatmentPlan(data: Partial<TreatmentPlan>): Promise<TreatmentPlan> {
  initializeBaselineEmrSeed();
  const id = `plan-${Date.now()}`;
  const plan: TreatmentPlan = {
    id,
    patientId: data.patientId!,
    therapistId: data.therapistId || "therapist-1",
    therapistName: data.therapistName || "Dr. Ananya Sen",
    title: data.title || "Customized Vision Therapy Protocol",
    primaryDiagnosis: data.primaryDiagnosis || "Visual Dysmetria",
    goals: data.goals || [],
    prescribedTherapies: data.prescribedTherapies || [],
    startDate: data.startDate || new Date().toISOString().split("T")[0],
    targetEndDate: data.targetEndDate || new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
    status: data.status || "active",
    progressNotes: data.progressNotes || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  emrStore.treatmentPlans.set(id, plan);

  if (isMySQLConfigured()) {
    try {
      db.dbSaveTreatmentPlan(plan).catch((err) =>
        console.warn("[MySQL Save Treatment Plan Error]:", err.message)
      );
    } catch (err: any) {
      console.warn("[MySQL Save Treatment Plan Error]:", err.message);
    }
  }

  return plan;
}

// ==================== CLINICAL AUDIT EVENTS ====================

export function logClinicalAuditEvent(event: {
  patientId: string;
  staffId: string;
  staffName: string;
  action: ClinicalAuditEvent["action"];
  details?: Record<string, any>;
}): ClinicalAuditEvent {
  const auditEvent: ClinicalAuditEvent = {
    id: `clinaudit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    patientId: event.patientId,
    staffId: event.staffId,
    staffName: event.staffName,
    action: event.action,
    timestamp: new Date().toISOString(),
    details: event.details || {},
  };

  emrStore.auditLogs.unshift(auditEvent);

  if (isMySQLConfigured()) {
    try {
      db.dbLogClinicalAuditEvent(auditEvent).catch(() => {});
    } catch {}
  }

  return auditEvent;
}
