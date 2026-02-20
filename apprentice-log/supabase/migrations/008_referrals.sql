-- Referral Program Schema
-- Tracks referral links, signups, and rewards for viral growth

-- Referral codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  total_referrals INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0, -- Converted to paid or active for 30+ days
  CONSTRAINT code_format CHECK (code ~ '^[A-Z0-9]{6,12}$')
);

-- Referral tracking table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, signed_up, activated, converted
  referred_email TEXT, -- Stored before signup
  created_at TIMESTAMPTZ DEFAULT NOW(),
  signed_up_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ, -- When referred user becomes active
  converted_at TIMESTAMPTZ  -- When referred user converts to paid
);

-- Referral rewards table
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
  reward_type TEXT NOT NULL, -- 'free_month', 'credit', 'badge'
  reward_value INTEGER, -- In cents or days
  status TEXT NOT NULL DEFAULT 'pending', -- pending, awarded, claimed, expired
  created_at TIMESTAMPTZ DEFAULT NOW(),
  awarded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_user ON referral_rewards(user_id);

-- RLS Policies
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own referral codes
CREATE POLICY "Users can view own referral codes"
  ON referral_codes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own referral codes"
  ON referral_codes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view referrals where they are referrer or referred
CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Users can view their own rewards
CREATE POLICY "Users can view own rewards"
  ON referral_rewards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character alphanumeric code
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));

    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = new_code) INTO code_exists;

    EXIT WHEN NOT code_exists;
  END LOOP;

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to get or create a user's referral code
CREATE OR REPLACE FUNCTION get_or_create_referral_code(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  existing_code TEXT;
  new_code TEXT;
BEGIN
  -- Check for existing code
  SELECT code INTO existing_code FROM referral_codes WHERE user_id = user_uuid;

  IF existing_code IS NOT NULL THEN
    RETURN existing_code;
  END IF;

  -- Generate new code
  new_code := generate_referral_code(user_uuid);

  -- Insert new code
  INSERT INTO referral_codes (user_id, code)
  VALUES (user_uuid, new_code);

  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_or_create_referral_code(UUID) TO authenticated;

COMMENT ON TABLE referral_codes IS 'Stores unique referral codes for each user';
COMMENT ON TABLE referrals IS 'Tracks referral relationships and conversion status';
COMMENT ON TABLE referral_rewards IS 'Tracks rewards earned through the referral program';
