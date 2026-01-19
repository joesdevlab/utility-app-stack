-- ============================================
-- APPRENTICE LOG - Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS apprentice_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add all required columns (IF NOT EXISTS handles idempotency)
DO $$
BEGIN
    -- Core content fields
    ALTER TABLE apprentice_entries ADD COLUMN IF NOT EXISTS raw_transcript TEXT;
    ALTER TABLE apprentice_entries ADD COLUMN IF NOT EXISTS formatted_entry TEXT DEFAULT '';
    ALTER TABLE apprentice_entries ADD COLUMN IF NOT EXISTS tasks JSONB DEFAULT '[]'::jsonb;

    -- Hours tracking
    ALTER TABLE apprentice_entries ADD COLUMN IF NOT EXISTS hours NUMERIC;
    ALTER TABLE apprentice_entries ADD COLUMN IF NOT EXISTS total_hours NUMERIC;

    -- Context fields
    ALTER TABLE apprentice_entries ADD COLUMN IF NOT EXISTS weather TEXT;
    ALTER TABLE apprentice_entries ADD COLUMN IF NOT EXISTS site_name TEXT;
    ALTER TABLE apprentice_entries ADD COLUMN IF NOT EXISTS supervisor TEXT;

    -- Legacy fields
    ALTER TABLE apprentice_entries ADD COLUMN IF NOT EXISTS notes TEXT;
    ALTER TABLE apprentice_entries ADD COLUMN IF NOT EXISTS safety_observations TEXT;

    -- Soft delete
    ALTER TABLE apprentice_entries ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
END $$;

-- 3. Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_apprentice_entries_user_id
ON apprentice_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_apprentice_entries_date
ON apprentice_entries(date DESC);

CREATE INDEX IF NOT EXISTS idx_apprentice_entries_is_deleted
ON apprentice_entries(is_deleted);

CREATE INDEX IF NOT EXISTS idx_apprentice_entries_user_date
ON apprentice_entries(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_apprentice_entries_user_not_deleted
ON apprentice_entries(user_id, is_deleted) WHERE is_deleted = FALSE;

-- 4. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger for updated_at (drop first if exists to avoid error)
DROP TRIGGER IF EXISTS update_apprentice_entries_updated_at ON apprentice_entries;
CREATE TRIGGER update_apprentice_entries_updated_at
    BEFORE UPDATE ON apprentice_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable Row Level Security
ALTER TABLE apprentice_entries ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own entries" ON apprentice_entries;
CREATE POLICY "Users can view their own entries" ON apprentice_entries
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own entries" ON apprentice_entries;
CREATE POLICY "Users can insert their own entries" ON apprentice_entries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own entries" ON apprentice_entries;
CREATE POLICY "Users can update their own entries" ON apprentice_entries
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own entries" ON apprentice_entries;
CREATE POLICY "Users can delete their own entries" ON apprentice_entries
    FOR DELETE
    USING (auth.uid() = user_id);

-- 8. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- 9. Verify the schema (this will show all columns)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'apprentice_entries'
ORDER BY ordinal_position;
