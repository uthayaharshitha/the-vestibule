-- Add is_edited column to contributions
ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;

-- We need to ensure that when a user updates their contribution, this flag is set to TRUE.
-- We can do this in the application logic (update query) OR via a trigger.
-- Application logic is simpler for now as we control the UPDATE call in MyJourney page.
