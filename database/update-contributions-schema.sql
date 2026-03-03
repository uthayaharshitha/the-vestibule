-- Add is_anonymous column to contributions table
ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

-- Update RLS if needed?
-- No, existing policies work. We just need to make sure 'is_anonymous' is readable.
-- "Public can read active contributions" -> SELECT USING (status = 'active').
-- It selects ALL columns, including new is_anonymous.

-- Note: No policy prevents reading 'user_id'. 
-- In the UI, we must conditionally hide the pseudonym if 'is_anonymous' is true.
