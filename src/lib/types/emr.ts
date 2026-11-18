/**
 * AURO PERFECT VISION — ELECTRONIC MEDICAL RECORDS (EMR)
 * Clinical types, SOAP clinical documentation, vision assessment metrics,
 * treatment plans, and immutable medical audit records.
 */

export type PatientStatus = 'active' | 'inactive' | 'archived';

export interface PatientRecord {
  id: string;
  mrn: string; // Medical Record Number e.g. "APV-MRN-2026-001"
  crmContactId?: string; // Links patient chart to CRM contact
  fullName: string;
  dateOfBirth?: string;
  age?: number;
  gender?: 'female' | 'male' | 'other' | 'undisclosed';
  phone: string;
  email: string;
  address?: string;
  occupation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodGroup?: string;
  allergies?: string[];
  clinicalAlerts?: string[]; // e.g. "Severe Amblyopia OD", "Screen Time > 10hrs/day", "Post-LASIK Dry Eye"
  primaryTherapistId?: string;
  primaryTherapistName?: string;
  status: PatientStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PatientMedicalHistory {
  id: string;
  patientId: string;
  ocularHistory: {
    priorSurgeries?: string;
    cataract?: boolean;
    glaucoma?: boolean;
    strabismusSquint?: boolean;
    amblyopiaLazyEye?: boolean;
    refractiveHistory?: string;
    currentSymptoms?: string[];
  };
  systemicHistory: {
    diabetes?: boolean;
    hypertension?: boolean;
    neurologicalConditions?: string;
    autoimmuneConditions?: string;
    generalHealthNotes?: string;
  };
  familyOcularHistory?: string;
  currentMedications?: string;
  visualEnvironment: {
    dailyScreenHours?: number;
    primaryWorkType?: string;
    lightingQuality?: string;
    visualStrainTimeOfDay?: string;
  };
  visualAids: {
    wearsGlasses?: boolean;
    wearsContacts?: boolean;
    usesPrisms?: boolean;
    prescriptionDetails?: string;
  };
  updatedAt: string;
}

export type EncounterType =
  | 'initial_consultation'
  | 'vision_therapy_session'
  | 'sports_vision_training'
  | 'eye_yoga_checkin'
  | 'progress_evaluation'
  | 'discharge_assessment';

export type EncounterStatus = 'in_progress' | 'completed' | 'cancelled';

export interface ClinicalEncounter {
  id: string;
  patientId: string;
  patientName: string;
  encounterDate: string; // YYYY-MM-DD
  encounterType: EncounterType;
  therapistId: string;
  therapistName: string;
  chiefComplaint: string;
  status: EncounterStatus;
  linkedBookingId?: string;
  durationMinutes?: number;
  clinicalSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisionAssessment {
  id: string;
  patientId: string;
  encounterId: string;
  assessmentDate: string;
  therapistId: string;
  therapistName: string;
  visualAcuity: {
    odUncorrected?: string; // Right eye e.g. "6/18" or "20/60"
    odCorrected?: string;   // e.g. "6/6" or "20/20"
    osUncorrected?: string; // Left eye
    osCorrected?: string;
    ouUncorrected?: string; // Both eyes
    ouCorrected?: string;
  };
  refraction?: {
    odSphere?: string;
    odCylinder?: string;
    odAxis?: string;
    osSphere?: string;
    osCylinder?: string;
    osAxis?: string;
  };
  binocularVision: {
    nearPointConvergenceNPC?: string; // e.g. "7 cm break / 10 cm recovery"
    nearPointAccommodationNPA?: string; // e.g. "OD: 12 cm, OS: 12 cm"
    stereopsis?: string; // e.g. "40 arc seconds"
    colorVision?: string; // e.g. "Normal (Ishihara 14/14)"
    ocularMotilityPursuits?: 'smooth' | 'saccadic_intrusions' | 'restricted';
    ocularMotilitySaccades?: 'accurate' | 'undershoot' | 'overshoot' | 'hesitant';
    brockStringFixation?: string; // e.g. "Physiological diplopia present, suppression OD at 30cm"
  };
  intraocularPressureIOP?: {
    od?: string; // e.g. "14 mmHg"
    os?: string; // e.g. "15 mmHg"
  };
  clinicalImpression: string;
  recommendations: string;
  createdAt: string;
}

export type SoapNoteStatus = 'draft' | 'finalized_signed';

export interface ClinicalNoteAmendment {
  id: string;
  clinicalNoteId: string;
  amendedBy: string;
  amendedByName: string;
  amendedAt: string;
  reasonForAmendment: string;
  amendmentText: string;
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  encounterId: string;
  therapistId: string;
  therapistName: string;
  noteDate: string;
  subjective: string; // Patient-reported symptoms, strain triggers, fatigue
  objective: string;  // Clinical observations, tests performed, visual reactions
  assessment: string; // Practitioner assessment, convergence progress, accommodative response
  plan: string;       // Next exercises, Brock string regimen, palming schedule, follow-up
  status: SoapNoteStatus;
  isLocked: boolean;  // Once signed, locked = true, cannot be overwritten
  signedBy?: string;
  signedByName?: string;
  signedAt?: string;
  amendments: ClinicalNoteAmendment[];
  createdAt: string;
  updatedAt: string;
}

export type TreatmentPlanStatus = 'active' | 'completed' | 'on_hold' | 'discontinued';

export interface PrescribedTherapyItem {
  therapyName: string; // e.g. "Brock String Convergence Retraining"
  frequency: string;   // e.g. "Twice daily for 10 minutes"
  durationWeeks: number;
  specificExercises: string[];
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  therapistId: string;
  therapistName: string;
  title: string; // e.g. "12-Week Convergence & Binocular Rehabilitation Plan"
  primaryDiagnosis: string;
  goals: string[];
  prescribedTherapies: PrescribedTherapyItem[];
  startDate: string;
  targetEndDate: string;
  status: TreatmentPlanStatus;
  progressNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ClinicalDocumentType =
  | 'external_prescription'
  | 'oct_fundus_scan'
  | 'visual_field_chart'
  | 'referral_letter'
  | 'discharge_summary'
  | 'intake_form';

export interface ClinicalDocument {
  id: string;
  patientId: string;
  encounterId?: string;
  title: string;
  documentType: ClinicalDocumentType;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  notes?: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
}

export interface ClinicalConsent {
  id: string;
  patientId: string;
  consentType:
    | 'vision_therapy_informed_consent'
    | 'pediatric_treatment_assent'
    | 'telehealth_remote_guidance'
    | 'digital_health_privacy_dpdp';
  consentedByName: string;
  relationToPatient: string; // "Self", "Parent/Guardian", "Legal Representative"
  status: 'granted' | 'revoked';
  grantedAt: string;
  notes?: string;
}

export interface ClinicalAuditEvent {
  id: string;
  patientId: string;
  staffId: string;
  staffName: string;
  action:
    | 'VIEWED_PATIENT_CHART'
    | 'CREATED_ENCOUNTER'
    | 'RECORDED_VISION_ASSESSMENT'
    | 'DRAFTED_SOAP_NOTE'
    | 'SIGNED_SOAP_NOTE'
    | 'AMENDED_SOAP_NOTE'
    | 'UPDATED_TREATMENT_PLAN'
    | 'UPLOADED_CLINICAL_DOCUMENT'
    | 'RECORDED_CONSENT';
  timestamp: string;
  details?: Record<string, any>;
}
