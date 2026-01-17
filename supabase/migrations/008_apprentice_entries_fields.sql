-- Add additional fields to apprentice_entries table (AL-DB-002)
-- These fields store legacy data from the AI-formatted entries

-- Add total_hours column if it doesn't exist
ALTER TABLE apprentice_entries
  ADD COLUMN IF NOT EXISTS total_hours DECIMAL(4, 1);

-- Add notes column if it doesn't exist
ALTER TABLE apprentice_entries
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add safety_observations column if it doesn't exist
ALTER TABLE apprentice_entries
  ADD COLUMN IF NOT EXISTS safety_observations TEXT;

-- Update formatted_entry to be nullable (in case AI doesn't provide one)
ALTER TABLE apprentice_entries
  ALTER COLUMN formatted_entry DROP NOT NULL;

-- Create a function to calculate total_hours from tasks if not provided
CREATE OR REPLACE FUNCTION calculate_total_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_hours IS NULL AND NEW.tasks IS NOT NULL THEN
    SELECT COALESCE(SUM((task->>'hours')::decimal), 0)
    INTO NEW.total_hours
    FROM jsonb_array_elements(NEW.tasks) AS task;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate total_hours
DROP TRIGGER IF EXISTS calculate_total_hours_trigger ON apprentice_entries;
CREATE TRIGGER calculate_total_hours_trigger
  BEFORE INSERT OR UPDATE ON apprentice_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_total_hours();
