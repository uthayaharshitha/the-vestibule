-- Phase 6: Reports Table Upgrade
-- Run this in the Supabase SQL editor.
-- Extends the existing reports table — does NOT drop or recreate it.

-- ── 1. Add additional_details column (if it doesn't already exist) ─────────
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS additional_details TEXT;

-- ── 2. Add 'action_taken' to the status CHECK constraint ──────────────────
-- PostgreSQL requires dropping and re-adding the constraint to change it.
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check;
ALTER TABLE reports
  ADD CONSTRAINT reports_status_check
  CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken'));

-- ── 3. RLS — ensure it is enabled ─────────────────────────────────────────
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ── 4. RLS Policies ───────────────────────────────────────────────────────

-- Allow authenticated users to submit reports
DROP POLICY IF EXISTS "Authenticated users can insert reports" ON reports;
CREATE POLICY "Authenticated users can insert reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to see their own reports only (not all reports)
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (reporter_id = auth.uid());

-- Admins can view ALL reports
-- Uses public.users.role to determine admin status
DROP POLICY IF EXISTS "Admins can view all reports" ON reports;
CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- Admins can update report status
DROP POLICY IF EXISTS "Admins can update reports" ON reports;
CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- ── 5. Index for faster admin queries ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reports_target_type ON reports(target_type);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);

-- ── 6. Admin role check function (SECURITY DEFINER bypasses RLS) ──────────
-- This is the safest way to check admin status from the client.
-- Even if RLS on public.users is misconfigured, this function always works.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Grant execute permission to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO anon;

