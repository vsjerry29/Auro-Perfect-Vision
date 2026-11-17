-- ====================================================================
-- AURO PERFECT VISION - SUPABASE POSTGRESQL PRODUCTION DDL
-- Migration 003: Clients / CRM, Programmes, Media Assets & CMS Revisions
-- ====================================================================

-- 1. CLIENT CONTACTS (Unified Client 360 Repository)
CREATE TABLE IF NOT EXISTS client_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_reference TEXT UNIQUE NOT NULL, -- e.g. "APV-CLI-1001"
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    country_code TEXT NOT NULL DEFAULT '+91',
    locality TEXT DEFAULT '',
    preferred_channel TEXT NOT NULL DEFAULT 'email' CHECK (preferred_channel IN ('email', 'whatsapp', 'phone')),
    source TEXT NOT NULL DEFAULT 'website_booking' CHECK (source IN ('website_booking', 'contact_form', 'phone', 'walk_in', 'referral')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('lead', 'active', 'vip', 'archived')),
    tags TEXT[] NOT NULL DEFAULT '{}',
    assigned_staff_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    assigned_staff_name TEXT DEFAULT '',
    notes_count INTEGER NOT NULL DEFAULT 0,
    total_bookings INTEGER NOT NULL DEFAULT 0,
    total_spent_inr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_spent_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    first_booking_date DATE,
    last_booking_date DATE,
    consent_given BOOLEAN NOT NULL DEFAULT true,
    consent_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_client_contacts_email ON client_contacts (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_client_contacts_phone ON client_contacts (phone);
CREATE INDEX IF NOT EXISTS idx_client_contacts_status ON client_contacts (status);
CREATE INDEX IF NOT EXISTS idx_client_contacts_reference ON client_contacts (client_reference);

-- 2. CRM INQUIRIES & LEADS (Contact Form & Walk-in Pipeline)
CREATE TABLE IF NOT EXISTS crm_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT UNIQUE NOT NULL, -- e.g. "INQ-2026-0042"
    client_contact_id UUID REFERENCES client_contacts(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    subject TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General Inquiry',
    message TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'contact_form' CHECK (source IN ('contact_form', 'phone', 'walk_in', 'referral')),
    stage TEXT NOT NULL DEFAULT 'new' CHECK (stage IN ('new', 'contacted', 'follow_up', 'booked', 'closed_not_interested')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_staff_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    assigned_staff_name TEXT DEFAULT '',
    linked_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    internal_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_crm_inquiries_stage ON crm_inquiries (stage);
CREATE INDEX IF NOT EXISTS idx_crm_inquiries_client ON crm_inquiries (client_contact_id);

-- 3. CRM FOLLOW-UP TASKS
CREATE TABLE IF NOT EXISTS crm_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_contact_id UUID REFERENCES client_contacts(id) ON DELETE CASCADE,
    client_name TEXT DEFAULT '',
    inquiry_id UUID REFERENCES crm_inquiries(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    assigned_staff_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    assigned_staff_name TEXT DEFAULT '',
    created_by_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    created_by_name TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_crm_tasks_status ON crm_tasks (status);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_due_date ON crm_tasks (due_date);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_staff ON crm_tasks (assigned_staff_id);

-- 4. CRM INTERNAL CLINICAL & ADMINISTRATIVE NOTES
CREATE TABLE IF NOT EXISTS crm_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_contact_id UUID REFERENCES client_contacts(id) ON DELETE CASCADE,
    author_staff_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    author_staff_name TEXT NOT NULL,
    author_staff_role TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'call_log', 'preference', 'scheduling')),
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_crm_notes_client ON crm_notes (client_contact_id);

-- 5. CRM CLIENT ACTIVITIES & AUDIT TRAIL
CREATE TABLE IF NOT EXISTS crm_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_contact_id UUID REFERENCES client_contacts(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    staff_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    staff_name TEXT DEFAULT '',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_crm_activities_client ON crm_activities (client_contact_id);

-- 6. FLAGSHIP PROGRAMMES & RESIDENTIAL RETREATS
CREATE TABLE IF NOT EXISTS programmes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    duration_label TEXT NOT NULL DEFAULT '7 Days / 6 Nights',
    duration_days INTEGER NOT NULL DEFAULT 7,
    daily_session_minutes INTEGER NOT NULL DEFAULT 180,
    format TEXT NOT NULL DEFAULT 'group' CHECK (format IN ('group', 'individual')),
    delivery TEXT NOT NULL DEFAULT 'onsite' CHECK (delivery IN ('onsite', 'online', 'hybrid')),
    price_inr NUMERIC(10, 2) NOT NULL DEFAULT 28000.00,
    price_usd NUMERIC(10, 2) NOT NULL DEFAULT 420.00,
    lead_facilitator_ids UUID[] NOT NULL DEFAULT '{}',
    location TEXT NOT NULL DEFAULT 'Auroville International Township, Tamil Nadu, India',
    max_capacity INTEGER NOT NULL DEFAULT 12,
    image_url TEXT NOT NULL DEFAULT '',
    itinerary JSONB NOT NULL DEFAULT '[]'::jsonb,
    inclusions TEXT[] NOT NULL DEFAULT '{}',
    preparation_guidelines TEXT[] NOT NULL DEFAULT '{}',
    cohorts JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_programmes_slug ON programmes (slug);

-- 7. MEDIA ASSETS
CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    public_url TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL DEFAULT 0,
    mime_type TEXT NOT NULL DEFAULT 'image/webp',
    dimensions JSONB,
    alt_text TEXT NOT NULL DEFAULT '',
    uploaded_by_staff_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    uploaded_by_staff_name TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_media_assets_url ON media_assets (public_url);

-- 8. CMS CONTENT REVISIONS & SNAPSHOTS
CREATE TABLE IF NOT EXISTS cms_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key TEXT NOT NULL,
    title TEXT NOT NULL,
    snapshot_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    author_staff_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    author_staff_name TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_cms_revisions_section ON cms_revisions (section_key);
