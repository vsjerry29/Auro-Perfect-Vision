-- AURO PERFECT VISION — ELECTRONIC MEDICAL RECORDS (EMR) SCHEMA
-- Clinical entities, vision assessments, SOAP clinical notes, amendments, and audit events

CREATE TABLE IF NOT EXISTS patient_records (
    id TEXT PRIMARY KEY,
    mrn TEXT UNIQUE NOT NULL,
    crm_contact_id TEXT,
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    age INTEGER,
    gender TEXT CHECK (gender IN ('female', 'male', 'other', 'undisclosed')),
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT,
    occupation TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    blood_group TEXT,
    allergies JSONB DEFAULT '[]'::jsonb,
    clinical_alerts JSONB DEFAULT '[]'::jsonb,
    primary_therapist_id TEXT,
    primary_therapist_name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_records_mrn ON patient_records(mrn);
CREATE INDEX IF NOT EXISTS idx_patient_records_crm_contact ON patient_records(crm_contact_id);
CREATE INDEX IF NOT EXISTS idx_patient_records_phone ON patient_records(phone);
CREATE INDEX IF NOT EXISTS idx_patient_records_email ON patient_records(email);

CREATE TABLE IF NOT EXISTS patient_medical_histories (
    id TEXT PRIMARY KEY,
    patient_id TEXT UNIQUE REFERENCES patient_records(id) ON DELETE CASCADE,
    ocular_history JSONB DEFAULT '{}'::jsonb,
    systemic_history JSONB DEFAULT '{}'::jsonb,
    family_ocular_history TEXT,
    current_medications TEXT,
    visual_environment JSONB DEFAULT '{}'::jsonb,
    visual_aids JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clinical_encounters (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES patient_records(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    encounter_date DATE NOT NULL,
    encounter_type TEXT NOT NULL,
    therapist_id TEXT NOT NULL,
    therapist_name TEXT NOT NULL,
    chief_complaint TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
    linked_booking_id TEXT,
    duration_minutes INTEGER DEFAULT 60,
    clinical_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinical_encounters_patient ON clinical_encounters(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_encounters_date ON clinical_encounters(encounter_date);

CREATE TABLE IF NOT EXISTS vision_assessments (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES patient_records(id) ON DELETE CASCADE,
    encounter_id TEXT REFERENCES clinical_encounters(id) ON DELETE SET NULL,
    assessment_date DATE NOT NULL,
    therapist_id TEXT NOT NULL,
    therapist_name TEXT NOT NULL,
    visual_acuity JSONB DEFAULT '{}'::jsonb,
    refraction JSONB DEFAULT '{}'::jsonb,
    binocular_vision JSONB DEFAULT '{}'::jsonb,
    intraocular_pressure_iop JSONB DEFAULT '{}'::jsonb,
    clinical_impression TEXT NOT NULL,
    recommendations TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vision_assessments_patient ON vision_assessments(patient_id);

CREATE TABLE IF NOT EXISTS clinical_notes (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES patient_records(id) ON DELETE CASCADE,
    encounter_id TEXT REFERENCES clinical_encounters(id) ON DELETE SET NULL,
    therapist_id TEXT NOT NULL,
    therapist_name TEXT NOT NULL,
    note_date DATE NOT NULL,
    subjective TEXT NOT NULL,
    objective TEXT NOT NULL,
    assessment TEXT NOT NULL,
    plan TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized_signed')),
    is_locked BOOLEAN DEFAULT FALSE,
    signed_by TEXT,
    signed_by_name TEXT,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinical_notes_patient ON clinical_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_encounter ON clinical_notes(encounter_id);

CREATE TABLE IF NOT EXISTS clinical_note_amendments (
    id TEXT PRIMARY KEY,
    clinical_note_id TEXT REFERENCES clinical_notes(id) ON DELETE CASCADE,
    amended_by TEXT NOT NULL,
    amended_by_name TEXT NOT NULL,
    amended_at TIMESTAMPTZ DEFAULT NOW(),
    reason_for_amendment TEXT NOT NULL,
    amendment_text TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clinical_note_amendments_note ON clinical_note_amendments(clinical_note_id);

CREATE TABLE IF NOT EXISTS treatment_plans (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES patient_records(id) ON DELETE CASCADE,
    therapist_id TEXT NOT NULL,
    therapist_name TEXT NOT NULL,
    title TEXT NOT NULL,
    primary_diagnosis TEXT NOT NULL,
    goals JSONB DEFAULT '[]'::jsonb,
    prescribed_therapies JSONB DEFAULT '[]'::jsonb,
    start_date DATE NOT NULL,
    target_end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'discontinued')),
    progress_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treatment_plans_patient ON treatment_plans(patient_id);

CREATE TABLE IF NOT EXISTS clinical_documents (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES patient_records(id) ON DELETE CASCADE,
    encounter_id TEXT REFERENCES clinical_encounters(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    notes TEXT,
    uploaded_by TEXT NOT NULL,
    uploaded_by_name TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clinical_consents (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES patient_records(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL,
    consented_by_name TEXT NOT NULL,
    relation_to_patient TEXT NOT NULL DEFAULT 'Self',
    status TEXT NOT NULL DEFAULT 'granted' CHECK (status IN ('granted', 'revoked')),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS clinical_audit_events (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    staff_id TEXT NOT NULL,
    staff_name TEXT NOT NULL,
    action TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    details JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_clinical_audit_events_patient ON clinical_audit_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_audit_events_staff ON clinical_audit_events(staff_id);

-- Enable RLS
ALTER TABLE patient_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medical_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_note_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_audit_events ENABLE ROW LEVEL SECURITY;

-- Allow full access to authenticated service role
CREATE POLICY service_role_all_emr ON patient_records FOR ALL USING (auth.role() = 'service_role');
