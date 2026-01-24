-- Exit surveys table to capture churn reasons
-- This helps understand why users leave and improve retention

CREATE TABLE IF NOT EXISTS exit_surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT,
  reason TEXT NOT NULL,
  details TEXT,
  would_recommend BOOLEAN,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_exit_surveys_created_at ON exit_surveys(created_at);
CREATE INDEX IF NOT EXISTS idx_exit_surveys_reason ON exit_surveys(reason);

-- RLS: Only admins can view exit surveys (for analytics)
ALTER TABLE exit_surveys ENABLE ROW LEVEL SECURITY;

-- Users can insert their own exit survey
CREATE POLICY "Users can insert own exit survey"
  ON exit_surveys
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admin policy for viewing all surveys (check admin email in application layer)
CREATE POLICY "Admins can view all exit surveys"
  ON exit_surveys
  FOR SELECT
  TO authenticated
  USING (
    auth.email() IN ('admin@apprenticelog.nz', 'demo@apprenticelog.nz')
  );

-- Comment for documentation
COMMENT ON TABLE exit_surveys IS 'Captures reasons why users delete their accounts for churn analysis';
