-- ============================================
-- APPRENTICE LOG - Remove Individual Subscriptions
-- B2B Model: Apprentices free, employers pay
-- Run this in Supabase SQL Editor after 005
-- ============================================

-- 1. Drop the view first (depends on function)
DROP VIEW IF EXISTS user_subscription_status;

-- 2. Drop functions that depend on subscriptions
DROP FUNCTION IF EXISTS can_create_entry(UUID);
DROP FUNCTION IF EXISTS get_monthly_entry_count(UUID);

-- 3. Drop the subscriptions table
-- This removes all individual user subscription data
DROP TABLE IF EXISTS subscriptions;

-- 4. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Note: The organizations table is kept for employer billing
-- Organizations already have:
--   - stripe_customer_id
--   - stripe_subscription_id
--   - plan (free/paid)
--   - status
--   - max_seats
