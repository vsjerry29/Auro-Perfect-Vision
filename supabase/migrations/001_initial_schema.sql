-- ====================================================================
-- AURO PERFECT VISION - SUPABASE POSTGRESQL PRODUCTION DDL
-- Migration 001: Initial Core Normalized Schema (19 Tables + Audit)
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STAFF PROFILES (Admins and Practitioners)
CREATE TABLE IF NOT EXISTS staff_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE, -- Foreign key to auth.users if Supabase Auth is enabled
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'therapist')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. THERAPIST PROFILES
CREATE TABLE IF NOT EXISTS therapist_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    slug TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    role_title TEXT NOT NULL DEFAULT 'Vision Wellness Guide',
    bio TEXT NOT NULL DEFAULT '',
    specialties TEXT[] NOT NULL DEFAULT '{}',
    qualifications TEXT NOT NULL DEFAULT '',
    photo_url TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. OFFERINGS (Therapy Sessions & Flagship Programmes)
CREATE TABLE IF NOT EXISTS offerings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'natural_vision_improvement',
        'digital_eye_strain',
        'children_vision_habits',
        'bates_method_relaxation',
        'photobiomodulation',
        'residential_retreat'
    )),
    format TEXT NOT NULL CHECK (format IN ('individual', 'group')),
    delivery TEXT NOT NULL CHECK (delivery IN ('onsite', 'online', 'hybrid')),
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    max_capacity INTEGER NOT NULL DEFAULT 1,
    is_flagship_programme BOOLEAN NOT NULL DEFAULT false,
    image_url TEXT NOT NULL DEFAULT '',
    what_to_expect TEXT[] NOT NULL DEFAULT '{}',
    suitable_for TEXT[] NOT NULL DEFAULT '{}',
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. OFFERING THERAPISTS (Many-to-Many junction)
CREATE TABLE IF NOT EXISTS offering_therapists (
    offering_id UUID NOT NULL REFERENCES offerings(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES therapist_profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (offering_id, therapist_id)
);

-- 5. PRICES (Dual-currency INR / USD rate structure)
CREATE TABLE IF NOT EXISTS prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offering_id UUID NOT NULL REFERENCES offerings(id) ON DELETE CASCADE,
    inr_amount INTEGER NOT NULL CHECK (inr_amount >= 0),
    usd_amount INTEGER NOT NULL CHECK (usd_amount >= 0),
    effective_from TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. PROGRAMME ITEMS (Syllabus/Curriculum for multi-day programmes)
CREATE TABLE IF NOT EXISTS programme_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offering_id UUID NOT NULL REFERENCES offerings(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. AVAILABILITY RULES (Weekly recurring therapist schedules)
CREATE TABLE IF NOT EXISTS availability_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    therapist_id UUID NOT NULL REFERENCES therapist_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 6=Sat
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. AVAILABILITY EXCEPTIONS (Time-off / holiday calendar overrides)
CREATE TABLE IF NOT EXISTS availability_exceptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    therapist_id UUID REFERENCES therapist_profiles(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    reason TEXT NOT NULL DEFAULT 'Scheduled Leave',
    is_all_day BOOLEAN NOT NULL DEFAULT true,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. INTAKE TEMPLATES (Offering questionnaire versioning)
CREATE TABLE IF NOT EXISTS intake_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offering_id UUID NOT NULL REFERENCES offerings(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. INTAKE FIELDS (Individual dynamic questionnaire items)
CREATE TABLE IF NOT EXISTS intake_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES intake_templates(id) ON DELETE CASCADE,
    field_key TEXT NOT NULL,
    label TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'number', 'select', 'checkbox')),
    placeholder TEXT NOT NULL DEFAULT '',
    options TEXT[] DEFAULT '{}',
    is_required BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. BOOKINGS (Guest appointments & consultation records)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference TEXT UNIQUE NOT NULL, -- e.g. APV-2026-X8Y2K
    offering_id UUID NOT NULL REFERENCES offerings(id),
    therapist_id UUID NOT NULL REFERENCES therapist_profiles(id),
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    booking_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    seats_booked INTEGER NOT NULL DEFAULT 1,
    currency TEXT NOT NULL CHECK (currency IN ('INR', 'USD')),
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN (
        'draft',
        'pending_payment',
        'pending_offline_confirmation',
        'confirmed',
        'cancelled',
        'completed',
        'needs_review'
    )),
    payment_method TEXT NOT NULL CHECK (payment_method IN (
        'online_razorpay',
        'online_paypal',
        'offline_cash',
        'offline_bank_transfer'
    )),
    payment_status TEXT NOT NULL CHECK (payment_status IN (
        'not_started',
        'pending',
        'captured',
        'failed',
        'offline_confirmed'
    )),
    offline_confirmed_by_staff TEXT,
    offline_confirmed_at TIMESTAMPTZ,
    invoice_issued BOOLEAN NOT NULL DEFAULT false,
    invoice_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. BOOKING HOLDS (Temporary 10-minute slot reservations)
CREATE TABLE IF NOT EXISTS booking_holds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offering_id UUID NOT NULL REFERENCES offerings(id),
    therapist_id UUID NOT NULL REFERENCES therapist_profiles(id),
    hold_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    session_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. INTAKE RESPONSES (Confidential answers submitted by clients)
CREATE TABLE IF NOT EXISTS intake_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    answers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. PAYMENTS (Gateway payment tracking)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    gateway TEXT NOT NULL CHECK (gateway IN ('razorpay', 'paypal', 'offline')),
    gateway_payment_id TEXT,
    gateway_order_id TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL CHECK (currency IN ('INR', 'USD')),
    status TEXT NOT NULL CHECK (status IN ('initiated', 'pending', 'captured', 'failed', 'refunded')),
    raw_response JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. PAYMENT EVENTS (Webhook ledger & audit trail)
CREATE TABLE IF NOT EXISTS payment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    gateway TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 16. INVOICES (Formal PDF receipt metadata)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL CHECK (currency IN ('INR', 'USD')),
    status TEXT NOT NULL CHECK (status IN ('issued', 'paid', 'voided')),
    pdf_storage_path TEXT,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. NOTIFICATION JOBS (Email & message queue)
CREATE TABLE IF NOT EXISTS notification_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
    recipient TEXT NOT NULL,
    template_key TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'failed', 'cancelled')) DEFAULT 'queued',
    attempts INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 18. BLOG POSTS (Eye Wellness Journal)
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Ocular Wellness',
    read_time TEXT NOT NULL DEFAULT '5 min read',
    published_date TEXT NOT NULL,
    author_name TEXT NOT NULL DEFAULT 'Auro Perfect Vision Team',
    cover_image TEXT NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 19. SITE CONTENT (Global homepage & contact configurations)
CREATE TABLE IF NOT EXISTS site_content (
    id TEXT PRIMARY KEY DEFAULT 'global_settings',
    hero_headline TEXT NOT NULL,
    hero_subtitle TEXT NOT NULL,
    hero_image_url TEXT NOT NULL,
    primary_cta_text TEXT NOT NULL DEFAULT 'Explore Therapies & Book',
    primary_cta_link TEXT NOT NULL DEFAULT '/therapies',
    about_heading TEXT NOT NULL,
    about_summary TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '+91 98765 43210',
    email TEXT NOT NULL DEFAULT 'connect@auroperfectvision.com',
    address TEXT NOT NULL DEFAULT 'Auroville, Tamil Nadu 605101, India',
    whatsapp_link TEXT NOT NULL DEFAULT 'https://wa.me/919876543210',
    opening_hours TEXT NOT NULL DEFAULT 'Monday - Saturday: 9:00 AM - 5:30 PM IST (Closed Sundays)',
    updated_by UUID REFERENCES staff_profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 20. AUDIT LOGS (Compliance & Administrative Action Tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    diff_json JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==================== PERFORMANCE INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_offerings_slug ON offerings(slug);
CREATE INDEX IF NOT EXISTS idx_offerings_is_published ON offerings(is_published);
CREATE INDEX IF NOT EXISTS idx_therapist_profiles_slug ON therapist_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_therapist_date ON bookings(therapist_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_booking_holds_expires_at ON booking_holds(expires_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_intake_responses_booking_id ON intake_responses(booking_id);
