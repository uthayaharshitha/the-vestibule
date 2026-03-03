-- ── Reply Threading for Contributions ────────────────────────────────────────
-- Run this migration in Supabase SQL Editor

-- 1. Add parent_id column (self-referencing FK)
ALTER TABLE contributions
    ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES contributions(id) ON DELETE CASCADE;

-- 2. Index for fast reply lookups
CREATE INDEX IF NOT EXISTS idx_contributions_parent_id ON contributions(parent_id);

-- 3. Top-level contributions don't have a parent (parent_id IS NULL)
-- Replies have parent_id pointing to the contribution they reply to.
-- This supports infinite nesting (reply to reply to reply...).

-- 4. RLS: replies inherit same read policy as top-level contributions.
-- Existing "Public can read active contributions" policy already covers
-- all rows from the contributions table, so no new policy needed.

-- Verify:
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'contributions' AND column_name = 'parent_id';
