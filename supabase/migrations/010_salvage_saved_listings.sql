-- Create salvage_saved_listings table for saving favorite listings
CREATE TABLE IF NOT EXISTS salvage_saved_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES salvage_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_salvage_saved_user ON salvage_saved_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_salvage_saved_listing ON salvage_saved_listings(listing_id);

-- Enable RLS
ALTER TABLE salvage_saved_listings ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only see and manage their own saved listings
CREATE POLICY "Users can view own saved listings"
  ON salvage_saved_listings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved listings"
  ON salvage_saved_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved listings"
  ON salvage_saved_listings FOR DELETE
  USING (auth.uid() = user_id);
