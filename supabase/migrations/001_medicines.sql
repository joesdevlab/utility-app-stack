-- Bio-Swap: Medicines table
-- Stores medicine information for barcode lookups

CREATE TABLE IF NOT EXISTS medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  brand_name VARCHAR(100) NOT NULL,
  generic_name VARCHAR(100) NOT NULL,
  active_ingredient VARCHAR(255) NOT NULL,
  strength VARCHAR(50) NOT NULL,
  form VARCHAR(50) NOT NULL,
  pack_size INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_generic BOOLEAN NOT NULL DEFAULT false,
  is_subsidized BOOLEAN NOT NULL DEFAULT false,
  subsidy_price DECIMAL(10, 2),
  manufacturer VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for barcode lookups (most common query)
CREATE INDEX IF NOT EXISTS idx_medicines_barcode ON medicines(barcode);

-- Index for finding alternatives by active ingredient and strength
CREATE INDEX IF NOT EXISTS idx_medicines_active_ingredient ON medicines(active_ingredient, strength);

-- Index for generic medicine searches
CREATE INDEX IF NOT EXISTS idx_medicines_generic_name ON medicines(generic_name);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_medicines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER medicines_updated_at
  BEFORE UPDATE ON medicines
  FOR EACH ROW
  EXECUTE FUNCTION update_medicines_updated_at();

-- Enable Row Level Security
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read medicines (public data)
CREATE POLICY "Medicines are viewable by everyone"
  ON medicines FOR SELECT
  USING (true);

-- Policy: Only authenticated users with admin role can modify
-- (In production, add proper admin role checking)
CREATE POLICY "Only admins can modify medicines"
  ON medicines FOR ALL
  USING (auth.role() = 'authenticated');
