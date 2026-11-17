-- ====================================================================
-- AURO PERFECT VISION - SUPABASE POSTGRESQL PRODUCTION DDL
-- Migration 004: Row Level Security (RLS) Policies for CRM & Advanced Modules
-- ====================================================================

-- 1. Enable Row Level Security on all CRM tables
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_revisions ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 2. PROGRAMMES POLICIES
-- ====================================================================
-- Public can view published programmes
CREATE POLICY "Public can view published programmes"
    ON programmes FOR SELECT
    USING (is_published = true);

-- Admins can manage all programmes
CREATE POLICY "Admins have full access to programmes"
    ON programmes FOR ALL
    USING (auth_is_admin())
    WITH CHECK (auth_is_admin());

-- ====================================================================
-- 3. MEDIA ASSETS POLICIES
-- ====================================================================
-- Public can view media assets
CREATE POLICY "Public can view media assets"
    ON media_assets FOR SELECT
    USING (true);

-- Staff can upload and manage media assets
CREATE POLICY "Staff can manage media assets"
    ON media_assets FOR ALL
    USING (auth_is_admin() OR auth_is_therapist())
    WITH CHECK (auth_is_admin() OR auth_is_therapist());

-- ====================================================================
-- 4. CLIENT CONTACTS (CRM) POLICIES
-- ====================================================================
-- Admins have full access to client contacts
CREATE POLICY "Admins have full access to client contacts"
    ON client_contacts FOR ALL
    USING (auth_is_admin())
    WITH CHECK (auth_is_admin());

-- Therapists can view clients assigned to them or booked with them
CREATE POLICY "Therapists can view assigned or booked clients"
    ON client_contacts FOR SELECT
    USING (
        auth_is_therapist() AND (
            assigned_staff_id = (SELECT sp.id FROM staff_profiles sp WHERE sp.user_id = auth.uid()) OR
            EXISTS (
                SELECT 1 FROM bookings b
                WHERE LOWER(b.client_email) = LOWER(client_contacts.email)
                  AND b.therapist_id = auth_therapist_id()
            )
        )
    );

-- System service role can insert client contacts upon guest booking
CREATE POLICY "Service role can insert client contacts"
    ON client_contacts FOR INSERT
    WITH CHECK (true);

-- ====================================================================
-- 5. CRM INQUIRIES POLICIES
-- ====================================================================
-- Public can submit inquiries via Contact form (Insert only)
CREATE POLICY "Public can submit contact inquiries"
    ON crm_inquiries FOR INSERT
    WITH CHECK (true);

-- Admins have full access to inquiries pipeline
CREATE POLICY "Admins have full access to crm inquiries"
    ON crm_inquiries FOR ALL
    USING (auth_is_admin())
    WITH CHECK (auth_is_admin());

-- ====================================================================
-- 6. CRM FOLLOW-UP TASKS POLICIES
-- ====================================================================
-- Admins have full access to all tasks
CREATE POLICY "Admins have full access to crm tasks"
    ON crm_tasks FOR ALL
    USING (auth_is_admin())
    WITH CHECK (auth_is_admin());

-- Staff / Therapists can view and update their own assigned tasks
CREATE POLICY "Staff can view assigned tasks"
    ON crm_tasks FOR SELECT
    USING (
        assigned_staff_id = (SELECT sp.id FROM staff_profiles sp WHERE sp.user_id = auth.uid())
    );

CREATE POLICY "Staff can update assigned tasks"
    ON crm_tasks FOR UPDATE
    USING (
        assigned_staff_id = (SELECT sp.id FROM staff_profiles sp WHERE sp.user_id = auth.uid())
    )
    WITH CHECK (
        assigned_staff_id = (SELECT sp.id FROM staff_profiles sp WHERE sp.user_id = auth.uid())
    );

-- ====================================================================
-- 7. CRM INTERNAL NOTES POLICIES
-- ====================================================================
-- Admins have full access to notes
CREATE POLICY "Admins have full access to crm notes"
    ON crm_notes FOR ALL
    USING (auth_is_admin())
    WITH CHECK (auth_is_admin());

-- Therapists can view notes for clients they treat and add clinical observations
CREATE POLICY "Therapists can view notes for their clients"
    ON crm_notes FOR SELECT
    USING (
        auth_is_therapist() AND EXISTS (
            SELECT 1 FROM bookings b
            JOIN client_contacts c ON LOWER(c.email) = LOWER(b.client_email)
            WHERE c.id = crm_notes.client_contact_id
              AND b.therapist_id = auth_therapist_id()
        )
    );

CREATE POLICY "Staff can insert clinical notes"
    ON crm_notes FOR INSERT
    WITH CHECK (
        auth_is_admin() OR auth_is_therapist()
    );

-- ====================================================================
-- 8. CRM ACTIVITIES POLICIES
-- ====================================================================
CREATE POLICY "Admins can view all client activities"
    ON crm_activities FOR SELECT
    USING (auth_is_admin());

CREATE POLICY "Service role and staff can insert activities"
    ON crm_activities FOR INSERT
    WITH CHECK (auth_is_admin() OR auth_is_therapist());

-- ====================================================================
-- 9. CMS REVISIONS POLICIES
-- ====================================================================
CREATE POLICY "Admins have full access to cms revisions"
    ON cms_revisions FOR ALL
    USING (auth_is_admin())
    WITH CHECK (auth_is_admin());
