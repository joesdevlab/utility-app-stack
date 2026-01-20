-- ============================================
-- APPRENTICE LOG - Subscriptions Schema
-- Run this in Supabase SQL Editor after 001
-- ============================================

-- 1. Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    status TEXT NOT NULL DEFAULT 'free',  -- free, active, canceled, past_due, trialing
    plan TEXT NOT NULL DEFAULT 'free',    -- free, premium
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (status IN ('free', 'active', 'canceled', 'past_due', 'trialing', 'incomplete')),
    CONSTRAINT valid_plan CHECK (plan IN ('free', 'premium'))
);

-- 2. Create unique index on user_id (one subscription per user)
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_id
ON subscriptions(user_id);

-- 3. Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id
ON subscriptions(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id
ON subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status
ON subscriptions(status);

-- 4. Create updated_at trigger
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
CREATE POLICY "Users can view their own subscription" ON subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can insert/update subscriptions (via webhooks)
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 7. Create function to get user's entry count for current month
CREATE OR REPLACE FUNCTION get_monthly_entry_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM apprentice_entries
        WHERE user_id = p_user_id
        AND is_deleted = FALSE
        AND date >= date_trunc('month', CURRENT_DATE)
        AND date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to check if user can create entry
CREATE OR REPLACE FUNCTION can_create_entry(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_plan TEXT;
    v_status TEXT;
    v_entry_count INTEGER;
    v_free_limit INTEGER := 10;
BEGIN
    -- Get user's subscription
    SELECT plan, status INTO v_plan, v_status
    FROM subscriptions
    WHERE user_id = p_user_id;

    -- If no subscription record, treat as free
    IF v_plan IS NULL THEN
        v_plan := 'free';
        v_status := 'free';
    END IF;

    -- Premium users with active subscription can always create
    IF v_plan = 'premium' AND v_status IN ('active', 'trialing') THEN
        RETURN TRUE;
    END IF;

    -- Free users check monthly limit
    v_entry_count := get_monthly_entry_count(p_user_id);
    RETURN v_entry_count < v_free_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create view for user subscription status (easier to query)
CREATE OR REPLACE VIEW user_subscription_status AS
SELECT
    u.id as user_id,
    COALESCE(s.plan, 'free') as plan,
    COALESCE(s.status, 'free') as status,
    s.current_period_end,
    s.cancel_at_period_end,
    get_monthly_entry_count(u.id) as entries_this_month,
    CASE
        WHEN COALESCE(s.plan, 'free') = 'premium' AND COALESCE(s.status, 'free') IN ('active', 'trialing')
        THEN -1  -- unlimited
        ELSE 10 - get_monthly_entry_count(u.id)
    END as entries_remaining
FROM auth.users u
LEFT JOIN subscriptions s ON u.id = s.user_id;

-- 10. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- 11. Verify the schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;
