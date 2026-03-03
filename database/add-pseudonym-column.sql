-- Add pseudonym column to contributions for snapshotting
-- This ensures the name provided at time of posting is preserved
ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS pseudonym TEXT;

-- We don't need a policy update for this as the INSERT policy covers all columns.
