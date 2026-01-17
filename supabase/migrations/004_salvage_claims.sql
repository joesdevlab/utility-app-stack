-- Salvage-Scout: Claims table
-- Tracks when users claim listings

CREATE TABLE IF NOT EXISTS salvage_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES salvage_listings(id) ON DELETE CASCADE,
  claimer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(listing_id, claimer_id)
);

-- Index for listing claims
CREATE INDEX IF NOT EXISTS idx_salvage_claims_listing_id
  ON salvage_claims(listing_id, created_at DESC);

-- Index for user's claims
CREATE INDEX IF NOT EXISTS idx_salvage_claims_claimer_id
  ON salvage_claims(claimer_id, created_at DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_salvage_claims_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER salvage_claims_updated_at
  BEFORE UPDATE ON salvage_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_salvage_claims_updated_at();

-- Enable Row Level Security
ALTER TABLE salvage_claims ENABLE ROW LEVEL SECURITY;

-- Policy: Listing owners can view claims on their listings
CREATE POLICY "Listing owners can view claims"
  ON salvage_claims FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM salvage_listings
      WHERE salvage_listings.id = salvage_claims.listing_id
      AND salvage_listings.user_id = auth.uid()
    )
  );

-- Policy: Claimers can view their own claims
CREATE POLICY "Users can view own claims"
  ON salvage_claims FOR SELECT
  USING (auth.uid() = claimer_id);

-- Policy: Users can create claims (except on their own listings)
CREATE POLICY "Users can create claims"
  ON salvage_claims FOR INSERT
  WITH CHECK (
    auth.uid() = claimer_id
    AND NOT EXISTS (
      SELECT 1 FROM salvage_listings
      WHERE salvage_listings.id = listing_id
      AND salvage_listings.user_id = auth.uid()
    )
  );

-- Policy: Listing owners can update claim status
CREATE POLICY "Listing owners can update claims"
  ON salvage_claims FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM salvage_listings
      WHERE salvage_listings.id = salvage_claims.listing_id
      AND salvage_listings.user_id = auth.uid()
    )
  );

-- Policy: Claimers can delete their own pending claims
CREATE POLICY "Users can delete own pending claims"
  ON salvage_claims FOR DELETE
  USING (auth.uid() = claimer_id AND status = 'pending');
