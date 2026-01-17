-- Apprentice-Log: Database enhancements
-- Add indexes and soft delete support

-- Add indexes for better query performance (AL-DB-001)
CREATE INDEX IF NOT EXISTS idx_apprentice_entries_user_id
  ON apprentice_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_apprentice_entries_date
  ON apprentice_entries(date DESC);

CREATE INDEX IF NOT EXISTS idx_apprentice_entries_user_date
  ON apprentice_entries(user_id, date DESC);

-- Add soft delete support (AL-DB-003)
ALTER TABLE apprentice_entries
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- Index for filtering out deleted entries
CREATE INDEX IF NOT EXISTS idx_apprentice_entries_not_deleted
  ON apprentice_entries(user_id, is_deleted) WHERE is_deleted = false;

-- Update RLS policies to exclude deleted entries from normal queries
DROP POLICY IF EXISTS "Users can view own entries" ON apprentice_entries;
CREATE POLICY "Users can view own active entries"
  ON apprentice_entries FOR SELECT
  USING (auth.uid() = user_id AND is_deleted = false);

-- Policy for viewing deleted entries (for recovery purposes)
CREATE POLICY "Users can view own deleted entries"
  ON apprentice_entries FOR SELECT
  USING (auth.uid() = user_id AND is_deleted = true);

-- Function to soft delete an entry
CREATE OR REPLACE FUNCTION soft_delete_entry(entry_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE apprentice_entries
  SET is_deleted = true, updated_at = NOW()
  WHERE id = entry_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a soft-deleted entry
CREATE OR REPLACE FUNCTION restore_entry(entry_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE apprentice_entries
  SET is_deleted = false, updated_at = NOW()
  WHERE id = entry_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
