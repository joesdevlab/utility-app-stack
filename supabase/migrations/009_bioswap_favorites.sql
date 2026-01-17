-- Create bioswap_favorites table for saving favorite medicines
CREATE TABLE IF NOT EXISTS bioswap_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, medicine_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bioswap_favorites_user ON bioswap_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_bioswap_favorites_medicine ON bioswap_favorites(medicine_id);

-- Enable RLS
ALTER TABLE bioswap_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only see and manage their own favorites
CREATE POLICY "Users can view own favorites"
  ON bioswap_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON bioswap_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON bioswap_favorites FOR DELETE
  USING (auth.uid() = user_id);
