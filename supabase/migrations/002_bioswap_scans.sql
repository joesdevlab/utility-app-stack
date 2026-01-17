-- Bio-Swap: Scan history table
-- Stores user's medicine scan history

CREATE TABLE IF NOT EXISTS bioswap_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  barcode VARCHAR(20) NOT NULL,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user's scan history (ordered by most recent)
CREATE INDEX IF NOT EXISTS idx_bioswap_scans_user_id ON bioswap_scans(user_id, scanned_at DESC);

-- Index for barcode lookups
CREATE INDEX IF NOT EXISTS idx_bioswap_scans_barcode ON bioswap_scans(barcode);

-- Enable Row Level Security
ALTER TABLE bioswap_scans ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own scan history
CREATE POLICY "Users can view own scan history"
  ON bioswap_scans FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only insert their own scans
CREATE POLICY "Users can insert own scans"
  ON bioswap_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own scan history
CREATE POLICY "Users can delete own scans"
  ON bioswap_scans FOR DELETE
  USING (auth.uid() = user_id);
