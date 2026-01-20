-- ============================================
-- APPRENTICE LOG - Organizations Schema
-- Run this in Supabase SQL Editor after 002
-- Adds B2B employer functionality
-- ============================================

-- 1. Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,  -- for URLs: /org/acme-construction
    owner_id UUID NOT NULL REFERENCES auth.users(id),
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    plan TEXT DEFAULT 'starter',  -- starter, professional, enterprise
    status TEXT DEFAULT 'active',  -- active, canceled, past_due, trialing
    max_seats INTEGER DEFAULT 5,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_org_plan CHECK (plan IN ('starter', 'professional', 'enterprise')),
    CONSTRAINT valid_org_status CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete'))
);

-- 2. Create organization_members table
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,  -- for pending invites
    role TEXT NOT NULL DEFAULT 'apprentice',  -- owner, admin, supervisor, apprentice
    status TEXT NOT NULL DEFAULT 'pending',  -- pending, active, removed
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_member_role CHECK (role IN ('owner', 'admin', 'supervisor', 'apprentice')),
    CONSTRAINT valid_member_status CHECK (status IN ('pending', 'active', 'removed')),
    UNIQUE(organization_id, email)
);

-- 3. Create indexes for organizations
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer_id ON organizations(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);

-- 4. Create indexes for organization_members
CREATE INDEX IF NOT EXISTS idx_org_members_organization_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_email ON organization_members(email);
CREATE INDEX IF NOT EXISTS idx_org_members_status ON organization_members(status);

-- 5. Create updated_at triggers
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_org_members_updated_at ON organization_members;
CREATE TRIGGER update_org_members_updated_at
    BEFORE UPDATE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for organizations

-- Organization owners and admins can view their organization
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
CREATE POLICY "Users can view organizations they belong to" ON organizations
    FOR SELECT
    USING (
        owner_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_id = organizations.id
            AND user_id = auth.uid()
            AND status = 'active'
        )
    );

-- Only owners can update their organization
DROP POLICY IF EXISTS "Owners can update their organization" ON organizations;
CREATE POLICY "Owners can update their organization" ON organizations
    FOR UPDATE
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- Users can create organizations (they become the owner)
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
CREATE POLICY "Users can create organizations" ON organizations
    FOR INSERT
    WITH CHECK (owner_id = auth.uid());

-- Service role can manage organizations (for Stripe webhooks)
DROP POLICY IF EXISTS "Service role can manage organizations" ON organizations;
CREATE POLICY "Service role can manage organizations" ON organizations
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 8. RLS Policies for organization_members

-- Organization owners/admins can view all members
DROP POLICY IF EXISTS "Org owners and admins can view members" ON organization_members;
CREATE POLICY "Org owners and admins can view members" ON organization_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organizations
            WHERE id = organization_members.organization_id
            AND owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'supervisor')
            AND om.status = 'active'
        )
        OR user_id = auth.uid()  -- Users can see their own membership
    );

-- Organization owners/admins can insert members (invites)
DROP POLICY IF EXISTS "Org owners and admins can invite members" ON organization_members;
CREATE POLICY "Org owners and admins can invite members" ON organization_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM organizations
            WHERE id = organization_members.organization_id
            AND owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
            AND om.status = 'active'
        )
    );

-- Organization owners/admins can update members
DROP POLICY IF EXISTS "Org owners and admins can update members" ON organization_members;
CREATE POLICY "Org owners and admins can update members" ON organization_members
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM organizations
            WHERE id = organization_members.organization_id
            AND owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
            AND om.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM organizations
            WHERE id = organization_members.organization_id
            AND owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
            AND om.status = 'active'
        )
    );

-- Organization owners/admins can remove members
DROP POLICY IF EXISTS "Org owners and admins can delete members" ON organization_members;
CREATE POLICY "Org owners and admins can delete members" ON organization_members
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM organizations
            WHERE id = organization_members.organization_id
            AND owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
            AND om.status = 'active'
        )
    );

-- Service role can manage members (for API operations)
DROP POLICY IF EXISTS "Service role can manage members" ON organization_members;
CREATE POLICY "Service role can manage members" ON organization_members
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 9. Create RLS policy for employers to view apprentice entries
DROP POLICY IF EXISTS "Employers can view apprentice entries" ON apprentice_entries;
CREATE POLICY "Employers can view apprentice entries" ON apprentice_entries
    FOR SELECT
    USING (
        user_id = auth.uid()  -- Users can always see their own entries
        OR EXISTS (
            -- Check if current user is an owner/admin/supervisor of an org where entry owner is a member
            SELECT 1 FROM organization_members viewer_member
            JOIN organization_members entry_owner_member
                ON viewer_member.organization_id = entry_owner_member.organization_id
            WHERE viewer_member.user_id = auth.uid()
            AND viewer_member.status = 'active'
            AND viewer_member.role IN ('owner', 'admin', 'supervisor')
            AND entry_owner_member.user_id = apprentice_entries.user_id
            AND entry_owner_member.status = 'active'
            AND entry_owner_member.role = 'apprentice'
        )
    );

-- 10. Create helper functions

-- Function to generate a unique slug from organization name
CREATE OR REPLACE FUNCTION generate_org_slug(org_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert to lowercase, replace spaces with hyphens, remove special chars
    base_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);

    -- Ensure it's not empty
    IF base_slug = '' THEN
        base_slug := 'org';
    END IF;

    final_slug := base_slug;

    -- Check for uniqueness and append number if needed
    WHILE EXISTS (SELECT 1 FROM organizations WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;

    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to get organization member count
CREATE OR REPLACE FUNCTION get_org_member_count(p_org_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM organization_members
        WHERE organization_id = p_org_id
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if organization has available seats
CREATE OR REPLACE FUNCTION org_has_available_seats(p_org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_max_seats INTEGER;
    v_current_count INTEGER;
BEGIN
    SELECT max_seats INTO v_max_seats
    FROM organizations
    WHERE id = p_org_id;

    IF v_max_seats IS NULL THEN
        RETURN FALSE;
    END IF;

    v_current_count := get_org_member_count(p_org_id);
    RETURN v_current_count < v_max_seats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's primary organization
CREATE OR REPLACE FUNCTION get_user_organization(p_user_id UUID)
RETURNS TABLE (
    organization_id UUID,
    organization_name TEXT,
    organization_slug TEXT,
    user_role TEXT,
    org_plan TEXT,
    org_status TEXT,
    member_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        o.name,
        o.slug,
        CASE
            WHEN o.owner_id = p_user_id THEN 'owner'::TEXT
            ELSE om.role
        END,
        o.plan,
        o.status,
        get_org_member_count(o.id)
    FROM organizations o
    LEFT JOIN organization_members om ON o.id = om.organization_id AND om.user_id = p_user_id
    WHERE o.owner_id = p_user_id
       OR (om.user_id = p_user_id AND om.status = 'active')
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create view for organization stats (for dashboard)
CREATE OR REPLACE VIEW organization_stats AS
SELECT
    o.id as organization_id,
    o.name,
    o.slug,
    o.plan,
    o.status,
    o.max_seats,
    get_org_member_count(o.id) as member_count,
    (
        SELECT COUNT(*)::INTEGER
        FROM apprentice_entries ae
        JOIN organization_members om ON ae.user_id = om.user_id
        WHERE om.organization_id = o.id
        AND om.status = 'active'
        AND om.role = 'apprentice'
        AND ae.is_deleted = FALSE
        AND ae.date >= date_trunc('week', CURRENT_DATE)
    ) as entries_this_week,
    (
        SELECT COALESCE(SUM(ae.hours), 0)::NUMERIC
        FROM apprentice_entries ae
        JOIN organization_members om ON ae.user_id = om.user_id
        WHERE om.organization_id = o.id
        AND om.status = 'active'
        AND om.role = 'apprentice'
        AND ae.is_deleted = FALSE
        AND ae.date >= date_trunc('week', CURRENT_DATE)
    ) as hours_this_week,
    (
        SELECT COUNT(*)::INTEGER
        FROM apprentice_entries ae
        JOIN organization_members om ON ae.user_id = om.user_id
        WHERE om.organization_id = o.id
        AND om.status = 'active'
        AND om.role = 'apprentice'
        AND ae.is_deleted = FALSE
        AND ae.date >= date_trunc('month', CURRENT_DATE)
    ) as entries_this_month,
    (
        SELECT COALESCE(SUM(ae.hours), 0)::NUMERIC
        FROM apprentice_entries ae
        JOIN organization_members om ON ae.user_id = om.user_id
        WHERE om.organization_id = o.id
        AND om.status = 'active'
        AND om.role = 'apprentice'
        AND ae.is_deleted = FALSE
        AND ae.date >= date_trunc('month', CURRENT_DATE)
    ) as hours_this_month
FROM organizations o;

-- 12. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- 13. Verify the schema
SELECT 'organizations' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'organizations'
ORDER BY ordinal_position;

SELECT 'organization_members' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'organization_members'
ORDER BY ordinal_position;
