-- ====================================================================
-- AURO PERFECT VISION - SUPABASE POSTGRESQL PRODUCTION DDL
-- Migration 005: Expand Staff Profiles for Super Admin & Full RLS Support
-- ====================================================================

-- 1. Modify staff_profiles role check to include super_admin
ALTER TABLE staff_profiles DROP CONSTRAINT IF EXISTS staff_profiles_role_check;
ALTER TABLE staff_profiles ADD CONSTRAINT staff_profiles_role_check CHECK (role IN ('super_admin', 'admin', 'therapist'));

-- 2. Add full profile & authentication columns to staff_profiles
ALTER TABLE staff_profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended'));
ALTER TABLE staff_profiles ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE staff_profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE staff_profiles ADD COLUMN IF NOT EXISTS salt TEXT;
ALTER TABLE staff_profiles ADD COLUMN IF NOT EXISTS therapist_id TEXT;
ALTER TABLE staff_profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE staff_profiles ADD COLUMN IF NOT EXISTS invitation_token TEXT;
ALTER TABLE staff_profiles ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMPTZ;

-- 3. Update auth helper functions to recognize super_admin
CREATE OR REPLACE FUNCTION auth_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM staff_profiles
        WHERE user_id = auth.uid()
          AND role IN ('admin', 'super_admin')
          AND is_active = true
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM staff_profiles
        WHERE user_id = auth.uid()
          AND role = 'super_admin'
          AND is_active = true
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enable RLS and add policies for staff_profiles
CREATE POLICY "Admins and Super Admins can view staff profiles"
    ON staff_profiles FOR SELECT
    USING (auth_is_admin());

CREATE POLICY "Super Admins can insert staff profiles"
    ON staff_profiles FOR INSERT
    WITH CHECK (auth_is_super_admin());

CREATE POLICY "Super Admins can update staff profiles"
    ON staff_profiles FOR UPDATE
    USING (auth_is_super_admin())
    WITH CHECK (auth_is_super_admin());

CREATE POLICY "Super Admins can delete staff profiles"
    ON staff_profiles FOR DELETE
    USING (auth_is_super_admin());

-- 5. Create index for email lookup
CREATE INDEX IF NOT EXISTS idx_staff_profiles_email_status ON staff_profiles (LOWER(email), status, is_active);
