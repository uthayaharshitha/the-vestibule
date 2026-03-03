-- Enable Realtime for Contributions
-- This allows the UI to update instantly when comments are added, edited, or deleted.

-- 1. Enable replication on the table
ALTER PUBLICATION supabase_realtime ADD TABLE contributions;

-- 2. Verify replica identity (default is usually fine, but FULL helps if PK is tricky, but ID is PK so DEFAULT is fine)
ALTER TABLE contributions REPLICA IDENTITY FULL; 
-- FULL is safer for getting all columns on UPDATE/DELETE events. Required for client to know WHICH row changed if ID isn't sent? 
-- Actually DEFAULT sends PK. FULL sends old and new. 
-- Let's use DEFAULT unless we need old values. 
-- Deletions sends PK. Updates send new values (and PK).
-- So DEFAULT is sufficient. Reverting to avoid performance hit if high volume.
ALTER TABLE contributions REPLICA IDENTITY DEFAULT;
