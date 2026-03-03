-- Row-Level Security Policies
-- Emotional Capsule Platform

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsule_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsule_audio ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsule_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
-- USERS POLICIES
-- Allow public read access (safe as we don't store email/sensitive info)
CREATE POLICY "Public can read users" ON users
  FOR SELECT USING (true);

-- Users can update their own pseudonym
CREATE POLICY "Users can update own pseudonym" ON users
  FOR UPDATE USING (auth.uid() = id);

-- CAPSULES POLICIES
-- Anyone can read active, public capsules
CREATE POLICY "Public can read active capsules" ON capsules
  FOR SELECT USING (status = 'active' AND visibility = 'public');

-- Only admins can insert capsules (for MVP - curated only)
CREATE POLICY "Admins can insert capsules" ON capsules
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can update capsules
CREATE POLICY "Admins can update capsules" ON capsules
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- CAPSULE_MEDIA POLICIES
-- Anyone can read media for active capsules
CREATE POLICY "Public can read capsule media" ON capsule_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM capsules 
      WHERE capsules.id = capsule_media.capsule_id 
      AND capsules.status = 'active' 
      AND capsules.visibility = 'public'
    )
  );

-- Only admins can insert media
CREATE POLICY "Admins can insert capsule media" ON capsule_media
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- CAPSULE_AUDIO POLICIES
-- Anyone can read audio for active capsules
CREATE POLICY "Public can read capsule audio" ON capsule_audio
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM capsules 
      WHERE capsules.id = capsule_audio.capsule_id 
      AND capsules.status = 'active' 
      AND capsules.visibility = 'public'
    )
  );

-- Only admins can insert audio
CREATE POLICY "Admins can insert capsule audio" ON capsule_audio
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- CAPSULE_NOTES POLICIES
-- Anyone can read notes for active capsules
CREATE POLICY "Public can read capsule notes" ON capsule_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM capsules 
      WHERE capsules.id = capsule_notes.capsule_id 
      AND capsules.status = 'active' 
      AND capsules.visibility = 'public'
    )
  );

-- Only admins can insert notes
CREATE POLICY "Admins can insert capsule notes" ON capsule_notes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- CONTRIBUTIONS POLICIES
-- Anyone can read active contributions
CREATE POLICY "Public can read active contributions" ON contributions
  FOR SELECT USING (status = 'active');

-- Authenticated users can insert contributions
CREATE POLICY "Authenticated users can insert contributions" ON contributions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins can update contribution status
CREATE POLICY "Admins can update contributions" ON contributions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- CONTRIBUTION_MEDIA POLICIES (for Phase 2+)
-- Anyone can read media for active contributions
CREATE POLICY "Public can read contribution media" ON contribution_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contributions 
      WHERE contributions.id = contribution_media.contribution_id 
      AND contributions.status = 'active'
    )
  );

-- Authenticated users can insert their own contribution media
CREATE POLICY "Users can insert own contribution media" ON contribution_media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM contributions 
      WHERE contributions.id = contribution_media.contribution_id 
      AND contributions.user_id = auth.uid()
    )
  );

-- REPORTS POLICIES
-- Authenticated users can insert reports
CREATE POLICY "Authenticated users can insert reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins can read all reports
CREATE POLICY "Admins can read reports" ON reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can update reports
CREATE POLICY "Admins can update reports" ON reports
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
