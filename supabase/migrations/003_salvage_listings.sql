-- Salvage-Scout: Listings table
-- Stores free construction material listings

-- Create enum types for categories and conditions
CREATE TYPE material_category AS ENUM (
  'timber', 'roofing', 'windows', 'doors', 'plumbing',
  'electrical', 'concrete', 'insulation', 'flooring',
  'fixtures', 'landscaping', 'other'
);

CREATE TYPE material_condition AS ENUM (
  'new', 'good', 'fair', 'salvage'
);

CREATE TYPE listing_status AS ENUM (
  'available', 'pending', 'claimed'
);

CREATE TYPE contact_method AS ENUM (
  'message', 'call'
);

CREATE TABLE IF NOT EXISTS salvage_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category material_category NOT NULL DEFAULT 'other',
  condition material_condition NOT NULL DEFAULT 'fair',
  quantity VARCHAR(100),
  image_url TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  suburb VARCHAR(100) NOT NULL,
  contact_method contact_method NOT NULL DEFAULT 'message',
  status listing_status NOT NULL DEFAULT 'available',
  posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  claimed_by UUID REFERENCES auth.users(id),
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for location-based queries (nearby listings)
CREATE INDEX IF NOT EXISTS idx_salvage_listings_location
  ON salvage_listings(latitude, longitude);

-- Index for user's listings
CREATE INDEX IF NOT EXISTS idx_salvage_listings_user_id
  ON salvage_listings(user_id, posted_at DESC);

-- Index for status filtering (available listings)
CREATE INDEX IF NOT EXISTS idx_salvage_listings_status
  ON salvage_listings(status, expires_at);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_salvage_listings_category
  ON salvage_listings(category, status);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_salvage_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER salvage_listings_updated_at
  BEFORE UPDATE ON salvage_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_salvage_listings_updated_at();

-- Enable Row Level Security
ALTER TABLE salvage_listings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view available listings
CREATE POLICY "Available listings are viewable by everyone"
  ON salvage_listings FOR SELECT
  USING (status = 'available' AND expires_at > NOW());

-- Policy: Users can view all their own listings (regardless of status)
CREATE POLICY "Users can view own listings"
  ON salvage_listings FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own listings
CREATE POLICY "Users can create listings"
  ON salvage_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own listings
CREATE POLICY "Users can update own listings"
  ON salvage_listings FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own listings
CREATE POLICY "Users can delete own listings"
  ON salvage_listings FOR DELETE
  USING (auth.uid() = user_id);
