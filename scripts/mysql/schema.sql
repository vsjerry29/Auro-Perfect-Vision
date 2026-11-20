-- ====================================================================
-- AURO PERFECT VISION — HOSTINGER MYSQL PRODUCTION SCHEMA
-- Complete InnoDB Normalized Schema for all CMS, CRM, EMR, Booking,
-- Staff Authentication, and Operational Entities.
-- Compatible with Hostinger MySQL 5.7+ / 8.0+ & MariaDB 10.3+
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. STAFF PROFILES (Authentication & User Accounts)
CREATE TABLE IF NOT EXISTS `staff_profiles` (
  `id` VARCHAR(64) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `role` ENUM('super_admin', 'admin', 'therapist') NOT NULL DEFAULT 'admin',
  `phone` VARCHAR(64) DEFAULT '',
  `password_hash` VARCHAR(255) NOT NULL,
  `salt` VARCHAR(128) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `status` ENUM('active', 'invited', 'suspended') NOT NULL DEFAULT 'active',
  `therapist_id` VARCHAR(64) DEFAULT NULL,
  `invitation_token` VARCHAR(255) DEFAULT NULL,
  `invitation_sent_at` DATETIME DEFAULT NULL,
  `last_login_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_staff_email` (`email`),
  KEY `idx_staff_role` (`role`),
  KEY `idx_staff_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. THERAPIST PROFILES (Practitioners Roster)
CREATE TABLE IF NOT EXISTS `therapist_profiles` (
  `id` VARCHAR(64) NOT NULL,
  `staff_id` VARCHAR(64) DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `display_name` VARCHAR(255) NOT NULL,
  `role_title` VARCHAR(255) NOT NULL DEFAULT 'Vision Wellness Guide',
  `bio` TEXT DEFAULT NULL,
  `specialties` JSON DEFAULT NULL,
  `qualifications` VARCHAR(255) DEFAULT '',
  `photo_url` TEXT DEFAULT NULL,
  `phone` VARCHAR(64) DEFAULT '',
  `email` VARCHAR(255) DEFAULT '',
  `assigned_offering_ids` JSON DEFAULT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `is_archived` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('active', 'archived') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_therapist_slug` (`slug`),
  KEY `idx_therapist_published` (`is_published`),
  KEY `idx_therapist_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. OFFERINGS (Therapy Sessions & Flagship Programmes)
CREATE TABLE IF NOT EXISTS `offerings` (
  `id` VARCHAR(64) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(64) NOT NULL DEFAULT 'eye-yoga',
  `short_description` TEXT NOT NULL,
  `full_description` MEDIUMTEXT NOT NULL,
  `duration_minutes` INT NOT NULL DEFAULT 60,
  `format` VARCHAR(32) NOT NULL DEFAULT 'individual',
  `delivery` VARCHAR(32) NOT NULL DEFAULT 'onsite',
  `price_inr` INT NOT NULL DEFAULT 2000,
  `price_usd` INT NOT NULL DEFAULT 40,
  `tax_inclusive` TINYINT(1) NOT NULL DEFAULT 1,
  `assigned_therapist_ids` JSON DEFAULT NULL,
  `max_capacity` INT NOT NULL DEFAULT 1,
  `is_flagship_programme` TINYINT(1) NOT NULL DEFAULT 0,
  `featured` TINYINT(1) NOT NULL DEFAULT 0,
  `suitable_for` JSON DEFAULT NULL,
  `what_to_expect` JSON DEFAULT NULL,
  `programme_syllabus` JSON DEFAULT NULL,
  `image_url` TEXT DEFAULT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_offering_slug` (`slug`),
  KEY `idx_offerings_published` (`is_published`),
  KEY `idx_offerings_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. WEEKLY SCHEDULES (Therapist Availability Rules)
CREATE TABLE IF NOT EXISTS `weekly_schedules` (
  `id` VARCHAR(64) NOT NULL,
  `therapist_id` VARCHAR(64) NOT NULL DEFAULT 'global',
  `day_of_week` INT NOT NULL,
  `day_name` VARCHAR(32) NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `slots` JSON NOT NULL,
  `slot_duration_minutes` INT NOT NULL DEFAULT 60,
  `buffer_minutes` INT NOT NULL DEFAULT 15,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_schedule_therapist` (`therapist_id`),
  KEY `idx_schedule_day` (`day_of_week`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. LEAVE EXCEPTIONS (Time-off Calendar Overrides)
CREATE TABLE IF NOT EXISTS `leave_exceptions` (
  `id` VARCHAR(64) NOT NULL,
  `therapist_id` VARCHAR(64) NOT NULL,
  `exception_date` DATE NOT NULL,
  `reason` VARCHAR(255) NOT NULL DEFAULT 'Scheduled Leave',
  `all_day` TINYINT(1) NOT NULL DEFAULT 1,
  `start_time` TIME DEFAULT NULL,
  `end_time` TIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_leave_therapist` (`therapist_id`),
  KEY `idx_leave_date` (`exception_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. INTAKE TEMPLATES (Offering Dynamic Questionnaires)
CREATE TABLE IF NOT EXISTS `intake_templates` (
  `id` VARCHAR(64) NOT NULL,
  `offering_id` VARCHAR(64) NOT NULL,
  `version` INT NOT NULL DEFAULT 1,
  `fields` JSON NOT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_intake_offering` (`offering_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. BOOKINGS (Guest Appointments & Consultations)
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` VARCHAR(64) NOT NULL,
  `booking_reference` VARCHAR(64) NOT NULL,
  `offering_id` VARCHAR(64) NOT NULL,
  `offering_title` VARCHAR(255) NOT NULL,
  `therapist_id` VARCHAR(64) NOT NULL,
  `therapist_name` VARCHAR(255) NOT NULL,
  `booking_date` DATE NOT NULL,
  `time_slot` VARCHAR(64) NOT NULL,
  `client_timezone` VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
  `client_name` VARCHAR(255) NOT NULL,
  `client_email` VARCHAR(255) NOT NULL,
  `client_phone` VARCHAR(64) NOT NULL,
  `seats_booked` INT NOT NULL DEFAULT 1,
  `currency` VARCHAR(8) NOT NULL DEFAULT 'INR',
  `total_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `status` VARCHAR(32) NOT NULL DEFAULT 'confirmed',
  `payment_method` VARCHAR(32) NOT NULL DEFAULT 'offline_cash',
  `payment_status` VARCHAR(32) NOT NULL DEFAULT 'pending',
  `intake_answers` JSON DEFAULT NULL,
  `offline_confirmed_by_staff` VARCHAR(255) DEFAULT NULL,
  `offline_confirmed_at` DATETIME DEFAULT NULL,
  `invoice_issued` TINYINT(1) NOT NULL DEFAULT 0,
  `invoice_number` VARCHAR(64) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_booking_ref` (`booking_reference`),
  KEY `idx_bookings_therapist_date` (`therapist_id`, `booking_date`),
  KEY `idx_bookings_status` (`status`),
  KEY `idx_bookings_client_email` (`client_email`),
  KEY `idx_bookings_date` (`booking_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. BOOKING HOLDS (Concurrency Lock for Active Booking Flow)
CREATE TABLE IF NOT EXISTS `booking_holds` (
  `id` VARCHAR(64) NOT NULL,
  `offering_id` VARCHAR(64) NOT NULL,
  `therapist_id` VARCHAR(64) NOT NULL,
  `hold_date` DATE NOT NULL,
  `time_slot` VARCHAR(64) NOT NULL,
  `session_token` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_holds_slot` (`therapist_id`, `hold_date`, `time_slot`),
  KEY `idx_holds_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. PAYMENTS (Gateway Transactions)
CREATE TABLE IF NOT EXISTS `payments` (
  `id` VARCHAR(64) NOT NULL,
  `booking_id` VARCHAR(64) NOT NULL,
  `gateway` VARCHAR(32) NOT NULL,
  `gateway_payment_id` VARCHAR(255) DEFAULT NULL,
  `gateway_order_id` VARCHAR(255) DEFAULT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(8) NOT NULL DEFAULT 'INR',
  `status` VARCHAR(32) NOT NULL DEFAULT 'pending',
  `raw_response` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payments_booking` (`booking_id`),
  KEY `idx_payments_gateway_id` (`gateway_payment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. INVOICES (Billing Invoices)
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` VARCHAR(64) NOT NULL,
  `booking_id` VARCHAR(64) NOT NULL,
  `invoice_number` VARCHAR(64) NOT NULL,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(8) NOT NULL DEFAULT 'INR',
  `status` VARCHAR(32) NOT NULL DEFAULT 'paid',
  `pdf_storage_path` TEXT DEFAULT NULL,
  `issued_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_invoice_number` (`invoice_number`),
  KEY `idx_invoices_booking` (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. BLOG POSTS (Journal & Educational Articles)
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` VARCHAR(64) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `excerpt` TEXT DEFAULT NULL,
  `content` MEDIUMTEXT NOT NULL,
  `category` VARCHAR(64) NOT NULL DEFAULT 'Ocular Wellness',
  `read_time` VARCHAR(32) NOT NULL DEFAULT '5 min read',
  `published_date` VARCHAR(64) NOT NULL,
  `author_name` VARCHAR(255) NOT NULL DEFAULT 'Auro Perfect Vision Team',
  `cover_image` TEXT DEFAULT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_blog_slug` (`slug`),
  KEY `idx_blogs_published` (`is_published`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. SITE CONTENT (CMS Homepage Hero, Carousel, Content)
CREATE TABLE IF NOT EXISTS `site_content` (
  `id` VARCHAR(64) NOT NULL,
  `content` JSON NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. AUDIT LOGS (Compliance & Administrative Actions)
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(64) NOT NULL,
  `staff_id` VARCHAR(64) DEFAULT NULL,
  `staff_email` VARCHAR(255) DEFAULT NULL,
  `staff_name` VARCHAR(255) DEFAULT NULL,
  `action` VARCHAR(64) NOT NULL,
  `entity_type` VARCHAR(64) NOT NULL,
  `entity_id` VARCHAR(64) NOT NULL,
  `details` JSON DEFAULT NULL,
  `ip_address` VARCHAR(64) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_staff` (`staff_id`),
  KEY `idx_audit_action` (`action`),
  KEY `idx_audit_entity` (`entity_type`, `entity_id`),
  KEY `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. CLIENT CONTACTS (CRM 360 Repository)
CREATE TABLE IF NOT EXISTS `client_contacts` (
  `id` VARCHAR(64) NOT NULL,
  `client_reference` VARCHAR(64) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(64) DEFAULT '',
  `country_code` VARCHAR(16) DEFAULT '+91',
  `locality` VARCHAR(255) DEFAULT '',
  `preferred_channel` VARCHAR(32) DEFAULT 'email',
  `source` VARCHAR(32) DEFAULT 'website_booking',
  `status` VARCHAR(32) DEFAULT 'active',
  `tags` JSON DEFAULT NULL,
  `assigned_staff_id` VARCHAR(64) DEFAULT NULL,
  `assigned_staff_name` VARCHAR(255) DEFAULT '',
  `notes_count` INT NOT NULL DEFAULT 0,
  `total_bookings` INT NOT NULL DEFAULT 0,
  `total_spent_inr` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `total_spent_usd` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `first_booking_date` DATE DEFAULT NULL,
  `last_booking_date` DATE DEFAULT NULL,
  `consent_given` TINYINT(1) NOT NULL DEFAULT 1,
  `consent_date` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_client_ref` (`client_reference`),
  KEY `idx_crm_client_email` (`email`),
  KEY `idx_crm_client_phone` (`phone`),
  KEY `idx_crm_client_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. CRM INQUIRIES & LEADS
CREATE TABLE IF NOT EXISTS `crm_inquiries` (
  `id` VARCHAR(64) NOT NULL,
  `reference` VARCHAR(64) NOT NULL,
  `client_contact_id` VARCHAR(64) DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(64) DEFAULT '',
  `subject` VARCHAR(255) NOT NULL,
  `category` VARCHAR(64) NOT NULL DEFAULT 'General Inquiry',
  `message` TEXT NOT NULL,
  `source` VARCHAR(32) NOT NULL DEFAULT 'contact_form',
  `stage` VARCHAR(32) NOT NULL DEFAULT 'new',
  `priority` VARCHAR(32) NOT NULL DEFAULT 'medium',
  `assigned_staff_id` VARCHAR(64) DEFAULT NULL,
  `assigned_staff_name` VARCHAR(255) DEFAULT '',
  `linked_booking_id` VARCHAR(64) DEFAULT NULL,
  `internal_notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_inquiry_ref` (`reference`),
  KEY `idx_inquiries_stage` (`stage`),
  KEY `idx_inquiries_client` (`client_contact_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. CRM FOLLOW-UP TASKS
CREATE TABLE IF NOT EXISTS `crm_tasks` (
  `id` VARCHAR(64) NOT NULL,
  `client_contact_id` VARCHAR(64) DEFAULT NULL,
  `client_name` VARCHAR(255) DEFAULT '',
  `inquiry_id` VARCHAR(64) DEFAULT NULL,
  `booking_id` VARCHAR(64) DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `priority` VARCHAR(32) NOT NULL DEFAULT 'medium',
  `due_date` DATE NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'pending',
  `assigned_staff_id` VARCHAR(64) DEFAULT NULL,
  `assigned_staff_name` VARCHAR(255) DEFAULT '',
  `created_by_id` VARCHAR(64) DEFAULT NULL,
  `created_by_name` VARCHAR(255) DEFAULT '',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tasks_status` (`status`),
  KEY `idx_tasks_due_date` (`due_date`),
  KEY `idx_tasks_staff` (`assigned_staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. CRM NOTES
CREATE TABLE IF NOT EXISTS `crm_notes` (
  `id` VARCHAR(64) NOT NULL,
  `client_contact_id` VARCHAR(64) NOT NULL,
  `author_staff_id` VARCHAR(64) DEFAULT NULL,
  `author_staff_name` VARCHAR(255) NOT NULL,
  `author_staff_role` VARCHAR(64) NOT NULL,
  `content` TEXT NOT NULL,
  `category` VARCHAR(32) NOT NULL DEFAULT 'general',
  `is_pinned` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notes_client` (`client_contact_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. CRM ACTIVITIES
CREATE TABLE IF NOT EXISTS `crm_activities` (
  `id` VARCHAR(64) NOT NULL,
  `client_contact_id` VARCHAR(64) NOT NULL,
  `event_type` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `staff_id` VARCHAR(64) DEFAULT NULL,
  `staff_name` VARCHAR(255) DEFAULT '',
  `metadata` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activities_client` (`client_contact_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. PROGRAMMES (Multi-Day Immersive Retreats)
CREATE TABLE IF NOT EXISTS `programmes` (
  `id` VARCHAR(64) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `short_description` TEXT NOT NULL,
  `full_description` MEDIUMTEXT NOT NULL,
  `duration_label` VARCHAR(64) NOT NULL DEFAULT '7 Days / 6 Nights',
  `duration_days` INT NOT NULL DEFAULT 7,
  `daily_session_minutes` INT NOT NULL DEFAULT 180,
  `format` VARCHAR(32) NOT NULL DEFAULT 'group',
  `delivery` VARCHAR(32) NOT NULL DEFAULT 'onsite',
  `price_inr` DECIMAL(10, 2) NOT NULL DEFAULT 28000.00,
  `price_usd` DECIMAL(10, 2) NOT NULL DEFAULT 420.00,
  `lead_facilitator_ids` JSON DEFAULT NULL,
  `location` VARCHAR(255) NOT NULL DEFAULT 'Auroville International Township, Tamil Nadu, India',
  `max_capacity` INT NOT NULL DEFAULT 12,
  `image_url` TEXT DEFAULT NULL,
  `itinerary` JSON DEFAULT NULL,
  `inclusions` JSON DEFAULT NULL,
  `preparation_guidelines` JSON DEFAULT NULL,
  `cohorts` JSON DEFAULT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_programme_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. MEDIA ASSETS
CREATE TABLE IF NOT EXISTS `media_assets` (
  `id` VARCHAR(64) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `public_url` TEXT NOT NULL,
  `file_size_bytes` INT NOT NULL DEFAULT 0,
  `mime_type` VARCHAR(64) NOT NULL DEFAULT 'image/webp',
  `dimensions` JSON DEFAULT NULL,
  `alt_text` VARCHAR(255) DEFAULT '',
  `uploaded_by_staff_id` VARCHAR(64) DEFAULT NULL,
  `uploaded_by_staff_name` VARCHAR(255) DEFAULT '',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_media_filename` (`file_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. CMS REVISIONS & SNAPSHOTS
CREATE TABLE IF NOT EXISTS `cms_revisions` (
  `id` VARCHAR(64) NOT NULL,
  `section_key` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `snapshot_json` JSON NOT NULL,
  `author_staff_id` VARCHAR(64) DEFAULT NULL,
  `author_staff_name` VARCHAR(255) DEFAULT '',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_revisions_section` (`section_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. PATIENT RECORDS (EMR Core)
CREATE TABLE IF NOT EXISTS `patient_records` (
  `id` VARCHAR(64) NOT NULL,
  `mrn` VARCHAR(64) NOT NULL,
  `crm_contact_id` VARCHAR(64) DEFAULT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `date_of_birth` DATE DEFAULT NULL,
  `age` INT DEFAULT NULL,
  `gender` VARCHAR(32) DEFAULT NULL,
  `phone` VARCHAR(64) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `address` TEXT DEFAULT NULL,
  `occupation` VARCHAR(255) DEFAULT NULL,
  `emergency_contact_name` VARCHAR(255) DEFAULT NULL,
  `emergency_contact_phone` VARCHAR(64) DEFAULT NULL,
  `blood_group` VARCHAR(16) DEFAULT NULL,
  `allergies` JSON DEFAULT NULL,
  `clinical_alerts` JSON DEFAULT NULL,
  `primary_therapist_id` VARCHAR(64) DEFAULT NULL,
  `primary_therapist_name` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_patient_mrn` (`mrn`),
  KEY `idx_patient_phone` (`phone`),
  KEY `idx_patient_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. PATIENT MEDICAL HISTORIES
CREATE TABLE IF NOT EXISTS `patient_medical_histories` (
  `id` VARCHAR(64) NOT NULL,
  `patient_id` VARCHAR(64) NOT NULL,
  `ocular_history` JSON DEFAULT NULL,
  `systemic_history` JSON DEFAULT NULL,
  `family_ocular_history` TEXT DEFAULT NULL,
  `current_medications` TEXT DEFAULT NULL,
  `visual_environment` JSON DEFAULT NULL,
  `visual_aids` JSON DEFAULT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_patient_med_history` (`patient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. CLINICAL ENCOUNTERS
CREATE TABLE IF NOT EXISTS `clinical_encounters` (
  `id` VARCHAR(64) NOT NULL,
  `patient_id` VARCHAR(64) NOT NULL,
  `patient_name` VARCHAR(255) NOT NULL,
  `encounter_date` DATE NOT NULL,
  `encounter_type` VARCHAR(64) NOT NULL,
  `therapist_id` VARCHAR(64) NOT NULL,
  `therapist_name` VARCHAR(255) NOT NULL,
  `chief_complaint` TEXT NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'completed',
  `linked_booking_id` VARCHAR(64) DEFAULT NULL,
  `duration_minutes` INT DEFAULT 60,
  `clinical_summary` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_encounter_patient` (`patient_id`),
  KEY `idx_encounter_date` (`encounter_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. VISION ASSESSMENTS
CREATE TABLE IF NOT EXISTS `vision_assessments` (
  `id` VARCHAR(64) NOT NULL,
  `patient_id` VARCHAR(64) NOT NULL,
  `encounter_id` VARCHAR(64) DEFAULT NULL,
  `assessment_date` DATE NOT NULL,
  `therapist_id` VARCHAR(64) NOT NULL,
  `therapist_name` VARCHAR(255) NOT NULL,
  `visual_acuity` JSON DEFAULT NULL,
  `refraction` JSON DEFAULT NULL,
  `binocular_vision` JSON DEFAULT NULL,
  `intraocular_pressure_iop` JSON DEFAULT NULL,
  `clinical_impression` TEXT NOT NULL,
  `recommendations` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_assessment_patient` (`patient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. CLINICAL SOAP NOTES
CREATE TABLE IF NOT EXISTS `clinical_notes` (
  `id` VARCHAR(64) NOT NULL,
  `patient_id` VARCHAR(64) NOT NULL,
  `encounter_id` VARCHAR(64) DEFAULT NULL,
  `therapist_id` VARCHAR(64) NOT NULL,
  `therapist_name` VARCHAR(255) NOT NULL,
  `note_date` DATE NOT NULL,
  `subjective` TEXT NOT NULL,
  `objective` TEXT NOT NULL,
  `assessment` TEXT NOT NULL,
  `plan` TEXT NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'draft',
  `is_locked` TINYINT(1) NOT NULL DEFAULT 0,
  `signed_by` VARCHAR(64) DEFAULT NULL,
  `signed_by_name` VARCHAR(255) DEFAULT NULL,
  `signed_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notes_patient` (`patient_id`),
  KEY `idx_notes_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 27. TREATMENT PLANS
CREATE TABLE IF NOT EXISTS `treatment_plans` (
  `id` VARCHAR(64) NOT NULL,
  `patient_id` VARCHAR(64) NOT NULL,
  `patient_name` VARCHAR(255) NOT NULL,
  `therapist_id` VARCHAR(64) NOT NULL,
  `therapist_name` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `diagnosis_summary` TEXT DEFAULT NULL,
  `primary_goals` JSON DEFAULT NULL,
  `prescribed_therapies` JSON DEFAULT NULL,
  `home_exercises` JSON DEFAULT NULL,
  `duration_weeks` INT NOT NULL DEFAULT 4,
  `sessions_per_week` INT NOT NULL DEFAULT 2,
  `status` VARCHAR(32) NOT NULL DEFAULT 'active',
  `start_date` DATE NOT NULL,
  `target_completion_date` DATE DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_plans_patient` (`patient_id`),
  KEY `idx_plans_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 28. CLINICAL AUDIT EVENTS
CREATE TABLE IF NOT EXISTS `clinical_audit_events` (
  `id` VARCHAR(64) NOT NULL,
  `staff_id` VARCHAR(64) NOT NULL,
  `staff_name` VARCHAR(255) NOT NULL,
  `staff_role` VARCHAR(64) NOT NULL,
  `action` VARCHAR(64) NOT NULL,
  `patient_id` VARCHAR(64) DEFAULT NULL,
  `patient_name` VARCHAR(255) DEFAULT NULL,
  `entity_type` VARCHAR(64) NOT NULL,
  `entity_id` VARCHAR(64) NOT NULL,
  `reason` TEXT DEFAULT NULL,
  `diff_json` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_clinical_audit_patient` (`patient_id`),
  KEY `idx_clinical_audit_staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 29. NOTIFICATION JOBS QUEUE
CREATE TABLE IF NOT EXISTS `notification_jobs` (
  `id` VARCHAR(64) NOT NULL,
  `booking_id` VARCHAR(64) DEFAULT NULL,
  `channel` ENUM('email', 'whatsapp') NOT NULL,
  `recipient` VARCHAR(255) NOT NULL,
  `template_key` VARCHAR(64) NOT NULL,
  `status` ENUM('queued', 'sent', 'failed', 'cancelled') NOT NULL DEFAULT 'queued',
  `attempts` INT NOT NULL DEFAULT 0,
  `error_message` TEXT DEFAULT NULL,
  `scheduled_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sent_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_status` (`status`, `scheduled_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
