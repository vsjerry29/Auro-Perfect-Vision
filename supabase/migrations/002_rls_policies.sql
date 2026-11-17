-- ====================================================================
-- AURO PERFECT VISION - SUPABASE POSTGRESQL PRODUCTION DDL
-- Migration 002: Row Level Security (RLS) Policies
-- ====================================================================

-- 1. Enable Row Level Security on all core tables
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE offering_therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Helper functions to check authentication role from Supabase auth.users JWT
CREATE OR REPLACE FUNCTION auth_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM staff_profiles
        WHERE user_id = auth.uid()
          AND role = 'admin'
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_is_therapist()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM staff_profiles
        WHERE user_id = auth.uid()
          AND role = 'therapist'
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_therapist_id()
RETURNS UUID AS $$
DECLARE
    t_id UUID;
BEGIN
    SELECT tp.id INTO t_id
    FROM therapist_profiles tp
    JOIN staff_profiles sp ON sp.id = tp.staff_id
    WHERE sp.user_id = auth.uid()
      AND sp.is_active = true;
    RETURN t_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== PUBLIC / ANONYMOUS POLICIES ====================

-- Public read access to published offerings
CREATE POLICY "Public can view published offerings"
    ON offerings FOR SELECT
    TO anon, authenticated
    USING (is_published = true OR auth_is_admin());

-- Public read access to published therapists
CREATE POLICY "Public can view published therapists"
    ON therapist_profiles FOR SELECT
    TO anon, authenticated
    USING (is_published = true OR auth_is_admin());

-- Public read access to active pricing
CREATE POLICY "Public can view active prices"
    ON prices FOR SELECT
    TO anon, authenticated
    USING (is_active = true OR auth_is_admin());

-- Public read access to programme curriculum
CREATE POLICY "Public can view programme items"
    ON programme_items FOR SELECT
    TO anon, authenticated
    USING (true);

-- Public read access to offering-therapist associations
CREATE POLICY "Public can view offering therapists"
    ON offering_therapists FOR SELECT
    TO anon, authenticated
    USING (true);

-- Public read access to active availability & exceptions for slot calculation
CREATE POLICY "Public can view active availability rules"
    ON availability_rules FOR SELECT
    TO anon, authenticated
    USING (is_active = true OR auth_is_admin());

CREATE POLICY "Public can view availability exceptions"
    ON availability_exceptions FOR SELECT
    TO anon, authenticated
    USING (true);

-- Public read access to published intake templates and fields
CREATE POLICY "Public can view published intake templates"
    ON intake_templates FOR SELECT
    TO anon, authenticated
    USING (is_published = true OR auth_is_admin());

CREATE POLICY "Public can view intake fields"
    ON intake_fields FOR SELECT
    TO anon, authenticated
    USING (true);

-- Public read access to published blog posts
CREATE POLICY "Public can view published blog posts"
    ON blog_posts FOR SELECT
    TO anon, authenticated
    USING (is_published = true OR auth_is_admin());

-- Public read access to site content
CREATE POLICY "Public can view site content"
    ON site_content FOR SELECT
    TO anon, authenticated
    USING (true);

-- Public guest booking insertion
CREATE POLICY "Guests can create bookings"
    ON bookings FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Guests can create booking holds"
    ON booking_holds FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Guests can create intake responses"
    ON intake_responses FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- ==================== THERAPIST POLICIES ====================

-- Therapists can view only bookings assigned to them
CREATE POLICY "Therapists can view their assigned bookings"
    ON bookings FOR SELECT
    TO authenticated
    USING (
        auth_is_admin() OR 
        (auth_is_therapist() AND therapist_id = auth_therapist_id())
    );

-- Therapists can view confidential intake responses for their own bookings
CREATE POLICY "Therapists can view intake responses for their bookings"
    ON intake_responses FOR SELECT
    TO authenticated
    USING (
        auth_is_admin() OR
        EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.id = intake_responses.booking_id
              AND b.therapist_id = auth_therapist_id()
        )
    );

-- Therapists can view and modify their own recurring availability
CREATE POLICY "Therapists can manage their availability rules"
    ON availability_rules FOR ALL
    TO authenticated
    USING (
        auth_is_admin() OR 
        (auth_is_therapist() AND therapist_id = auth_therapist_id())
    )
    WITH CHECK (
        auth_is_admin() OR 
        (auth_is_therapist() AND therapist_id = auth_therapist_id())
    );

-- Therapists can manage their own leave exceptions
CREATE POLICY "Therapists can manage their leave exceptions"
    ON availability_exceptions FOR ALL
    TO authenticated
    USING (
        auth_is_admin() OR 
        (auth_is_therapist() AND therapist_id = auth_therapist_id())
    )
    WITH CHECK (
        auth_is_admin() OR 
        (auth_is_therapist() AND therapist_id = auth_therapist_id())
    );

-- ==================== ADMIN POLICIES ====================

-- Admins have full access across all tables
CREATE POLICY "Admins full access on staff_profiles"
    ON staff_profiles FOR ALL TO authenticated
    USING (auth_is_admin()) WITH CHECK (auth_is_admin());

CREATE POLICY "Admins full access on therapist_profiles"
    ON therapist_profiles FOR ALL TO authenticated
    USING (auth_is_admin()) WITH CHECK (auth_is_admin());

CREATE POLICY "Admins full access on offerings"
    ON offerings FOR ALL TO authenticated
    USING (auth_is_admin()) WITH CHECK (auth_is_admin());

CREATE POLICY "Admins full access on offering_therapists"
    ON offering_therapists FOR ALL TO authenticated
    USING (auth_is_admin()) WITH CHECK (auth_is_admin());

CREATE POLICY "Admins full access on prices"
    ON prices FOR ALL TO authenticated
    USING (auth_is_admin()) WITH CHECK (auth_is_admin());

CREATE POLICY "Admins full access on programme_items"
    ON programme_items FOR ALL TO authenticated
    USING (auth_is_admin()) WITH CHECK (auth_is_admin());

CREATE POLICY "Admins full access on intake_templates"
    ON intake_templates FOR ALL TO authenticated
    USING (auth_is_admin()) WITH CHECK (auth_is_admin());

CREATE POLICY "Admins full access on intake_fields"
    ON intake_fields FOR ALL TO authenticated
    USING (auth_is_admin()) WITH CHECK (auth_is_admin());

CREATE POLICY "Admins full access on bookings"
    ON bookings FOR ALL TO authenticated
    USING (auth_is_admin()) WITH CHECK (auth_is_admin());

CREATE POLICY "Admins full access on payments"
    ON payments FOR ALL TO authenticated
    USING (auth_is_admin()) WITH CHECK (auth_is_admin());

CREATE POLICY "Admins full access on payment_events"
    ON payment_events FOR ALL TO authenticated
    USING (auth_is_admin()) WITH CHECK (auth_is_admin());

CREATE POLICY "Admins full access on invoices"
    ON invoices FOR ALL TO authenticated
    USING (auth_is_admin()) WITH CHECK (auth_is_admin());

CREATE POLICY "Admins full access on notification_jobs"
    ON notification_jobs FOR ALL TO authenticated
    USING (auth_is_admin()) WITH CHECK (auth_is_admin());

CREATE POLICY "Admins full access on blog_posts"
    ON blog_posts FOR ALL TO authenticated
    USING (auth_is_admin()) WITH CHECK (auth_is_admin());

CREATE POLICY "Admins full access on site_content"
    ON site_content FOR ALL TO authenticated
    USING (auth_is_admin()) WITH CHECK (auth_is_admin());

CREATE POLICY "Admins full access on audit_logs"
    ON audit_logs FOR ALL TO authenticated
    USING (auth_is_admin()) WITH CHECK (auth_is_admin());
