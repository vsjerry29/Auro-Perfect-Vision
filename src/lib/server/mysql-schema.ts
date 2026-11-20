/**
 * AURO PERFECT VISION — MYSQL DATABASE SCHEMA DEFINITION & MIGRATION ENGINE
 * Complete InnoDB schema with appropriate primary keys, foreign keys, indexes,
 * and JSON/decimal types matching all business requirements.
 */

import { execute, query } from "./mysql";

export const MYSQL_SCHEMA_STATEMENTS = [
  // 1. STAFF PROFILES (Authentication & User Accounts)
  `CREATE TABLE IF NOT EXISTS staff_profiles (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'therapist') NOT NULL DEFAULT 'admin',
    phone VARCHAR(64) DEFAULT '',
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(128) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    status ENUM('active', 'invited', 'suspended') NOT NULL DEFAULT 'active',
    therapist_id VARCHAR(64),
    invitation_token VARCHAR(255),
    invitation_sent_at DATETIME,
    last_login_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_staff_email (email),
    INDEX idx_staff_role (role),
    INDEX idx_staff_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 2. THERAPIST PROFILES (Practitioners Roster)
  `CREATE TABLE IF NOT EXISTS therapist_profiles (
    id VARCHAR(64) PRIMARY KEY,
    staff_id VARCHAR(64),
    slug VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    role_title VARCHAR(255) NOT NULL DEFAULT 'Vision Wellness Guide',
    bio TEXT,
    specialties JSON,
    qualifications VARCHAR(255) DEFAULT '',
    photo_url TEXT,
    phone VARCHAR(64) DEFAULT '',
    email VARCHAR(255) DEFAULT '',
    assigned_offering_ids JSON,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    status ENUM('active', 'archived') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_therapist_slug (slug),
    INDEX idx_therapist_published (is_published),
    INDEX idx_therapist_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 3. OFFERINGS (Therapy Sessions & Flagship Programmes)
  `CREATE TABLE IF NOT EXISTS offerings (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'eye-yoga',
    short_description TEXT NOT NULL,
    full_description MEDIUMTEXT NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    format VARCHAR(32) NOT NULL DEFAULT 'individual',
    delivery VARCHAR(32) NOT NULL DEFAULT 'onsite',
    price_inr INT NOT NULL DEFAULT 2000,
    price_usd INT NOT NULL DEFAULT 40,
    tax_inclusive BOOLEAN NOT NULL DEFAULT TRUE,
    assigned_therapist_ids JSON,
    max_capacity INT NOT NULL DEFAULT 1,
    is_flagship_programme BOOLEAN NOT NULL DEFAULT FALSE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    suitable_for JSON,
    what_to_expect JSON,
    programme_syllabus JSON,
    image_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_offerings_slug (slug),
    INDEX idx_offerings_published (is_published),
    INDEX idx_offerings_category (category)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 4. WEEKLY SCHEDULES (Therapist Availability Rules)
  `CREATE TABLE IF NOT EXISTS weekly_schedules (
    id VARCHAR(64) PRIMARY KEY,
    therapist_id VARCHAR(64) NOT NULL DEFAULT 'global',
    day_of_week INT NOT NULL,
    day_name VARCHAR(32) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    slots JSON NOT NULL,
    slot_duration_minutes INT NOT NULL DEFAULT 60,
    buffer_minutes INT NOT NULL DEFAULT 15,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_schedule_therapist (therapist_id),
    INDEX idx_schedule_day (day_of_week)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 5. LEAVE EXCEPTIONS (Therapist Time-off Calendar Overrides)
  `CREATE TABLE IF NOT EXISTS leave_exceptions (
    id VARCHAR(64) PRIMARY KEY,
    therapist_id VARCHAR(64) NOT NULL,
    exception_date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL DEFAULT 'Scheduled Leave',
    all_day BOOLEAN NOT NULL DEFAULT TRUE,
    start_time TIME,
    end_time TIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_leave_therapist (therapist_id),
    INDEX idx_leave_date (exception_date)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 6. INTAKE TEMPLATES (Offering Dynamic Questionnaires)
  `CREATE TABLE IF NOT EXISTS intake_templates (
    id VARCHAR(64) PRIMARY KEY,
    offering_id VARCHAR(64) NOT NULL,
    version INT NOT NULL DEFAULT 1,
    fields JSON NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_intake_offering (offering_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 7. BOOKINGS (Guest Appointments & Consultations)
  `CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(64) PRIMARY KEY,
    booking_reference VARCHAR(64) UNIQUE NOT NULL,
    offering_id VARCHAR(64) NOT NULL,
    offering_title VARCHAR(255) NOT NULL,
    therapist_id VARCHAR(64) NOT NULL,
    therapist_name VARCHAR(255) NOT NULL,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(64) NOT NULL,
    client_timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(64) NOT NULL,
    seats_booked INT NOT NULL DEFAULT 1,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(32) NOT NULL DEFAULT 'confirmed',
    payment_method VARCHAR(32) NOT NULL DEFAULT 'offline_cash',
    payment_status VARCHAR(32) NOT NULL DEFAULT 'pending',
    intake_answers JSON,
    offline_confirmed_by_staff VARCHAR(255),
    offline_confirmed_at DATETIME,
    invoice_issued BOOLEAN NOT NULL DEFAULT FALSE,
    invoice_number VARCHAR(64),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_bookings_ref (booking_reference),
    INDEX idx_bookings_therapist_date (therapist_id, booking_date),
    INDEX idx_bookings_status (status),
    INDEX idx_bookings_client_email (client_email),
    INDEX idx_bookings_date (booking_date)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 8. BOOKING HOLDS (Concurrency lock for in-flight checkouts, prevents double-booking)
  `CREATE TABLE IF NOT EXISTS booking_holds (
    id VARCHAR(64) PRIMARY KEY,
    offering_id VARCHAR(64) NOT NULL,
    therapist_id VARCHAR(64) NOT NULL,
    hold_date DATE NOT NULL,
    time_slot VARCHAR(64) NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_holds_slot (therapist_id, hold_date, time_slot),
    INDEX idx_holds_expires (expires_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 9. PAYMENTS (Gateway Transactions Ledger)
  `CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    booking_id VARCHAR(64) NOT NULL,
    gateway VARCHAR(32) NOT NULL,
    gateway_payment_id VARCHAR(255),
    gateway_order_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    raw_response JSON,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_payments_booking (booking_id),
    INDEX idx_payments_gateway_id (gateway_payment_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 10. INVOICES (Formal Billing Records)
  `CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(64) PRIMARY KEY,
    booking_id VARCHAR(64) NOT NULL,
    invoice_number VARCHAR(64) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    status VARCHAR(32) NOT NULL DEFAULT 'paid',
    pdf_storage_path TEXT,
    issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_invoices_booking (booking_id),
    INDEX idx_invoices_number (invoice_number)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 11. BLOG POSTS (Journal & Articles)
  `CREATE TABLE IF NOT EXISTS blog_posts (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content MEDIUMTEXT NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'Ocular Wellness',
    read_time VARCHAR(32) NOT NULL DEFAULT '5 min read',
    published_date VARCHAR(64) NOT NULL,
    author_name VARCHAR(255) NOT NULL DEFAULT 'Auro Perfect Vision Team',
    cover_image TEXT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_blogs_slug (slug),
    INDEX idx_blogs_published (is_published)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 12. SITE CONTENT (CMS Homepage & Content Configurations)
  `CREATE TABLE IF NOT EXISTS site_content (
    id VARCHAR(64) PRIMARY KEY,
    content JSON NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 13. AUDIT LOGS (Compliance & Administrative Action Tracking)
  `CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    staff_id VARCHAR(64),
    staff_email VARCHAR(255),
    staff_name VARCHAR(255),
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    details JSON,
    ip_address VARCHAR(64),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_staff (staff_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_created (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 14. CLIENT CONTACTS (CRM 360 Repository)
  `CREATE TABLE IF NOT EXISTS client_contacts (
    id VARCHAR(64) PRIMARY KEY,
    client_reference VARCHAR(64) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(64) DEFAULT '',
    country_code VARCHAR(16) DEFAULT '+91',
    locality VARCHAR(255) DEFAULT '',
    preferred_channel VARCHAR(32) DEFAULT 'email',
    source VARCHAR(32) DEFAULT 'website_booking',
    status VARCHAR(32) DEFAULT 'active',
    tags JSON,
    assigned_staff_id VARCHAR(64),
    assigned_staff_name VARCHAR(255) DEFAULT '',
    notes_count INT NOT NULL DEFAULT 0,
    total_bookings INT NOT NULL DEFAULT 0,
    total_spent_inr DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_spent_usd DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    first_booking_date DATE,
    last_booking_date DATE,
    consent_given BOOLEAN NOT NULL DEFAULT TRUE,
    consent_date DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_crm_client_email (email),
    INDEX idx_crm_client_ref (client_reference),
    INDEX idx_crm_client_phone (phone),
    INDEX idx_crm_client_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 15. CRM INQUIRIES & LEADS
  `CREATE TABLE IF NOT EXISTS crm_inquiries (
    id VARCHAR(64) PRIMARY KEY,
    reference VARCHAR(64) UNIQUE NOT NULL,
    client_contact_id VARCHAR(64),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(64) DEFAULT '',
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'General Inquiry',
    message TEXT NOT NULL,
    source VARCHAR(32) NOT NULL DEFAULT 'contact_form',
    stage VARCHAR(32) NOT NULL DEFAULT 'new',
    priority VARCHAR(32) NOT NULL DEFAULT 'medium',
    assigned_staff_id VARCHAR(64),
    assigned_staff_name VARCHAR(255) DEFAULT '',
    linked_booking_id VARCHAR(64),
    internal_notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_inquiries_ref (reference),
    INDEX idx_inquiries_stage (stage),
    INDEX idx_inquiries_client (client_contact_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 16. CRM FOLLOW-UP TASKS
  `CREATE TABLE IF NOT EXISTS crm_tasks (
    id VARCHAR(64) PRIMARY KEY,
    client_contact_id VARCHAR(64),
    client_name VARCHAR(255) DEFAULT '',
    inquiry_id VARCHAR(64),
    booking_id VARCHAR(64),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(32) NOT NULL DEFAULT 'medium',
    due_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    assigned_staff_id VARCHAR(64),
    assigned_staff_name VARCHAR(255) DEFAULT '',
    created_by_id VARCHAR(64),
    created_by_name VARCHAR(255) DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    INDEX idx_tasks_status (status),
    INDEX idx_tasks_due_date (due_date),
    INDEX idx_tasks_staff (assigned_staff_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 17. CRM NOTES
  `CREATE TABLE IF NOT EXISTS crm_notes (
    id VARCHAR(64) PRIMARY KEY,
    client_contact_id VARCHAR(64) NOT NULL,
    author_staff_id VARCHAR(64),
    author_staff_name VARCHAR(255) NOT NULL,
    author_staff_role VARCHAR(64) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(32) NOT NULL DEFAULT 'general',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_notes_client (client_contact_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 18. CRM ACTIVITIES
  `CREATE TABLE IF NOT EXISTS crm_activities (
    id VARCHAR(64) PRIMARY KEY,
    client_contact_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    staff_id VARCHAR(64),
    staff_name VARCHAR(255) DEFAULT '',
    metadata JSON,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_activities_client (client_contact_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 19. PROGRAMMES (Multi-Day Immersive Retreats)
  `CREATE TABLE IF NOT EXISTS programmes (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    short_description TEXT NOT NULL,
    full_description MEDIUMTEXT NOT NULL,
    duration_label VARCHAR(64) NOT NULL DEFAULT '7 Days / 6 Nights',
    duration_days INT NOT NULL DEFAULT 7,
    daily_session_minutes INT NOT NULL DEFAULT 180,
    format VARCHAR(32) NOT NULL DEFAULT 'group',
    delivery VARCHAR(32) NOT NULL DEFAULT 'onsite',
    price_inr DECIMAL(10, 2) NOT NULL DEFAULT 28000.00,
    price_usd DECIMAL(10, 2) NOT NULL DEFAULT 420.00,
    lead_facilitator_ids JSON,
    location VARCHAR(255) NOT NULL DEFAULT 'Auroville International Township, Tamil Nadu, India',
    max_capacity INT NOT NULL DEFAULT 12,
    image_url TEXT,
    itinerary JSON,
    inclusions JSON,
    preparation_guidelines JSON,
    cohorts JSON,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_programmes_slug (slug)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 20. MEDIA ASSETS
  `CREATE TABLE IF NOT EXISTS media_assets (
    id VARCHAR(64) PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    public_url TEXT NOT NULL,
    file_size_bytes INT NOT NULL DEFAULT 0,
    mime_type VARCHAR(64) NOT NULL DEFAULT 'image/webp',
    dimensions JSON,
    alt_text VARCHAR(255) DEFAULT '',
    uploaded_by_staff_id VARCHAR(64),
    uploaded_by_staff_name VARCHAR(255) DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_media_filename (file_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 21. CMS REVISIONS & SNAPSHOTS
  `CREATE TABLE IF NOT EXISTS cms_revisions (
    id VARCHAR(64) PRIMARY KEY,
    section_key VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    snapshot_json JSON NOT NULL,
    author_staff_id VARCHAR(64),
    author_staff_name VARCHAR(255) DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_revisions_section (section_key)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 22. PATIENT RECORDS (EMR Core)
  `CREATE TABLE IF NOT EXISTS patient_records (
    id VARCHAR(64) PRIMARY KEY,
    mrn VARCHAR(64) UNIQUE NOT NULL,
    crm_contact_id VARCHAR(64),
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    age INT,
    gender VARCHAR(32),
    phone VARCHAR(64) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT,
    occupation VARCHAR(255),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(64),
    blood_group VARCHAR(16),
    allergies JSON,
    clinical_alerts JSON,
    primary_therapist_id VARCHAR(64),
    primary_therapist_name VARCHAR(255),
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_patient_mrn (mrn),
    INDEX idx_patient_phone (phone),
    INDEX idx_patient_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 23. PATIENT MEDICAL HISTORIES
  `CREATE TABLE IF NOT EXISTS patient_medical_histories (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) UNIQUE NOT NULL,
    ocular_history JSON,
    systemic_history JSON,
    family_ocular_history TEXT,
    current_medications TEXT,
    visual_environment JSON,
    visual_aids JSON,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_med_history_patient (patient_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 24. CLINICAL ENCOUNTERS
  `CREATE TABLE IF NOT EXISTS clinical_encounters (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    encounter_date DATE NOT NULL,
    encounter_type VARCHAR(64) NOT NULL,
    therapist_id VARCHAR(64) NOT NULL,
    therapist_name VARCHAR(255) NOT NULL,
    chief_complaint TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'completed',
    linked_booking_id VARCHAR(64),
    duration_minutes INT DEFAULT 60,
    clinical_summary TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_encounter_patient (patient_id),
    INDEX idx_encounter_date (encounter_date)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 25. VISION ASSESSMENTS
  `CREATE TABLE IF NOT EXISTS vision_assessments (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL,
    encounter_id VARCHAR(64),
    assessment_date DATE NOT NULL,
    therapist_id VARCHAR(64) NOT NULL,
    therapist_name VARCHAR(255) NOT NULL,
    visual_acuity JSON,
    refraction JSON,
    binocular_vision JSON,
    intraocular_pressure_iop JSON,
    clinical_impression TEXT NOT NULL,
    recommendations TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_assessment_patient (patient_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 26. CLINICAL SOAP NOTES
  `CREATE TABLE IF NOT EXISTS clinical_notes (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL,
    encounter_id VARCHAR(64),
    therapist_id VARCHAR(64) NOT NULL,
    therapist_name VARCHAR(255) NOT NULL,
    note_date DATE NOT NULL,
    subjective TEXT NOT NULL,
    objective TEXT NOT NULL,
    assessment TEXT NOT NULL,
    plan TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    signed_by VARCHAR(64),
    signed_by_name VARCHAR(255),
    signed_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_notes_patient (patient_id),
    INDEX idx_notes_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 27. TREATMENT PLANS
  `CREATE TABLE IF NOT EXISTS treatment_plans (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    therapist_id VARCHAR(64) NOT NULL,
    therapist_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    diagnosis_summary TEXT,
    primary_goals JSON,
    prescribed_therapies JSON,
    home_exercises JSON,
    duration_weeks INT NOT NULL DEFAULT 4,
    sessions_per_week INT NOT NULL DEFAULT 2,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    start_date DATE NOT NULL,
    target_completion_date DATE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_plans_patient (patient_id),
    INDEX idx_plans_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 28. CLINICAL AUDIT EVENTS
  `CREATE TABLE IF NOT EXISTS clinical_audit_events (
    id VARCHAR(64) PRIMARY KEY,
    staff_id VARCHAR(64) NOT NULL,
    staff_name VARCHAR(255) NOT NULL,
    staff_role VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    patient_id VARCHAR(64),
    patient_name VARCHAR(255),
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    reason TEXT,
    diff_json JSON,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clinical_audit_patient (patient_id),
    INDEX idx_clinical_audit_staff (staff_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 29. NOTIFICATION JOBS QUEUE
  `CREATE TABLE IF NOT EXISTS notification_jobs (
    id VARCHAR(64) PRIMARY KEY,
    booking_id VARCHAR(64),
    channel ENUM('email', 'whatsapp') NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    template_key VARCHAR(64) NOT NULL,
    status ENUM('queued', 'sent', 'failed', 'cancelled') NOT NULL DEFAULT 'queued',
    attempts INT NOT NULL DEFAULT 0,
    error_message TEXT,
    scheduled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notifications_status (status, scheduled_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
];

let schemaInitialized = false;

/**
 * Initializes all MySQL tables idempotently. Safe to call on application boot.
 */
export async function initMySQLSchema(): Promise<{ success: boolean; tablesCreated: number; error?: string }> {
  if (schemaInitialized) return { success: true, tablesCreated: 0 };

  try {
    let createdCount = 0;
    for (const statement of MYSQL_SCHEMA_STATEMENTS) {
      await execute(statement);
      createdCount++;
    }
    schemaInitialized = true;
    return { success: true, tablesCreated: createdCount };
  } catch (err: any) {
    console.error("[MySQL Schema Init Failed]:", err.message);
    return { success: false, tablesCreated: 0, error: err.message };
  }
}
