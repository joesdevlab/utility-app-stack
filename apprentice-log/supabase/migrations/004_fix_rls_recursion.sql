-- ============================================
-- FIX: Infinite Recursion in RLS Policies
-- Run this in Supabase SQL Editor
-- ============================================

-- The problem: organization_members policies query organization_members itself,
-- causing infinite recursion. We need to use SECURITY DEFINER functions instead.

-- Step 1: Create helper functions that bypass RLS (SECURITY DEFINER)

-- Function to check if a user is an owner/admin/supervisor of an organization
CREATE OR REPLACE FUNCTION is_org_admin_or_supervisor(p_user_id UUID, p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_id = p_org_id
        AND user_id = p_user_id
        AND role IN ('owner', 'admin', 'supervisor')
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is an owner/admin of an organization
CREATE OR REPLACE FUNCTION is_org_admin(p_user_id UUID, p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_id = p_org_id
        AND user_id = p_user_id
        AND role IN ('owner', 'admin')
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is the organization owner
CREATE OR REPLACE FUNCTION is_org_owner(p_user_id UUID, p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organizations
        WHERE id = p_org_id
        AND owner_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user can view an apprentice's entries
CREATE OR REPLACE FUNCTION can_view_apprentice_entries(p_viewer_id UUID, p_apprentice_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- User can always view their own entries
    IF p_viewer_id = p_apprentice_id THEN
        RETURN TRUE;
    END IF;

    -- Check if viewer is owner/admin/supervisor in same org as apprentice
    RETURN EXISTS (
        SELECT 1 FROM organization_members viewer
        JOIN organization_members apprentice ON viewer.organization_id = apprentice.organization_id
        WHERE viewer.user_id = p_viewer_id
        AND viewer.status = 'active'
        AND viewer.role IN ('owner', 'admin', 'supervisor')
        AND apprentice.user_id = p_apprentice_id
        AND apprentice.status = 'active'
        AND apprentice.role = 'apprentice'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Step 2: Drop the problematic policies on organization_members

DROP POLICY IF EXISTS "Org owners and admins can view members" ON organization_members;
DROP POLICY IF EXISTS "Org owners and admins can invite members" ON organization_members;
DROP POLICY IF EXISTS "Org owners and admins can update members" ON organization_members;
DROP POLICY IF EXISTS "Org owners and admins can delete members" ON organization_members;


-- Step 3: Create new non-recursive policies for organization_members

-- Users can view members of orgs they belong to (using helper function)
CREATE POLICY "Users can view org members" ON organization_members
    FOR SELECT
    USING (
        -- Users can always see their own membership
        user_id = auth.uid()
        -- Org owners can see all members
        OR is_org_owner(auth.uid(), organization_id)
        -- Admins/supervisors can see members (uses SECURITY DEFINER function)
        OR is_org_admin_or_supervisor(auth.uid(), organization_id)
    );

-- Org owners and admins can invite members
CREATE POLICY "Org admins can invite members" ON organization_members
    FOR INSERT
    WITH CHECK (
        is_org_owner(auth.uid(), organization_id)
        OR is_org_admin(auth.uid(), organization_id)
    );

-- Org owners and admins can update members
CREATE POLICY "Org admins can update members" ON organization_members
    FOR UPDATE
    USING (
        is_org_owner(auth.uid(), organization_id)
        OR is_org_admin(auth.uid(), organization_id)
    )
    WITH CHECK (
        is_org_owner(auth.uid(), organization_id)
        OR is_org_admin(auth.uid(), organization_id)
    );

-- Org owners and admins can delete members
CREATE POLICY "Org admins can delete members" ON organization_members
    FOR DELETE
    USING (
        is_org_owner(auth.uid(), organization_id)
        OR is_org_admin(auth.uid(), organization_id)
    );


-- Step 4: Fix the apprentice_entries policy

DROP POLICY IF EXISTS "Employers can view apprentice entries" ON apprentice_entries;

CREATE POLICY "Employers can view apprentice entries" ON apprentice_entries
    FOR SELECT
    USING (
        can_view_apprentice_entries(auth.uid(), user_id)
    );


-- Step 5: Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Step 6: Test the fix (this should not error)
-- SELECT * FROM organization_members LIMIT 1;
-- SELECT * FROM apprentice_entries LIMIT 1;
