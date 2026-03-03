-- Phase 3: RLS Policy Update (User-Generated Content)
-- This script replaces Admin-only write restrictions with User ownership policies.

-- 1. CAPSULES POLICIES
-- Drop existing Admin restrictors if they effectively block users (or we just add new ones and ensure permissive OR logic isn't an issue?)
-- Best practice: Drop old restrictive policies and replace with role-based ones.

DROP POLICY IF EXISTS "Admins can insert capsules" ON capsules;
DROP POLICY IF EXISTS "Admins can update capsules" ON capsules;

-- INSERT: Authenticated users can create capsules (must set themselves as creator)
CREATE POLICY "Users can create capsules" ON capsules
  FOR INSERT WITH CHECK (
    auth.uid() = creator_id
  );

-- UPDATE: Users can update their own capsules
CREATE POLICY "Users can update own capsules" ON capsules
  FOR UPDATE USING (
    auth.uid() = creator_id
  );

-- DELETE: Users can delete (soft delete preferred, but DELETE allowed by policy if app uses it, preventing others)
CREATE POLICY "Users can delete own capsules" ON capsules
  FOR DELETE USING (
    auth.uid() = creator_id
  );


-- 2. CAPSULE_MEDIA POLICIES
DROP POLICY IF EXISTS "Admins can insert capsule media" ON capsule_media;

-- INSERT: Authenticated users can insert media into THEIR OWN capsules
CREATE POLICY "Users can add media to own capsules" ON capsule_media
  FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM capsules
        WHERE capsules.id = capsule_media.capsule_id
        AND capsules.creator_id = auth.uid()
    )
  );

-- DELETE/UPDATE: Users can manage media in their own capsules
CREATE POLICY "Users can manage media in own capsules" ON capsule_media
  FOR ALL USING (
    EXISTS (
        SELECT 1 FROM capsules
        WHERE capsules.id = capsule_media.capsule_id
        AND capsules.creator_id = auth.uid()
    )
  );


-- 3. CAPSULE_AUDIO POLICIES
DROP POLICY IF EXISTS "Admins can insert capsule audio" ON capsule_audio;

-- INSERT: Authenticated users can insert audio into THEIR OWN capsules
CREATE POLICY "Users can add audio to own capsules" ON capsule_audio
  FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM capsules
        WHERE capsules.id = capsule_audio.capsule_id
        AND capsules.creator_id = auth.uid()
    )
  );

-- DELETE/UPDATE: Users can manage audio in their own capsules
CREATE POLICY "Users can manage audio in own capsules" ON capsule_audio
  FOR ALL USING (
    EXISTS (
        SELECT 1 FROM capsules
        WHERE capsules.id = capsule_audio.capsule_id
        AND capsules.creator_id = auth.uid()
    )
  );


-- 4. CAPSULE_NOTES POLICIES
DROP POLICY IF EXISTS "Admins can insert capsule notes" ON capsule_notes;

-- INSERT: Authenticated users can insert notes into THEIR OWN capsules
CREATE POLICY "Users can add notes to own capsules" ON capsule_notes
  FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM capsules
        WHERE capsules.id = capsule_notes.capsule_id
        AND capsules.creator_id = auth.uid()
    )
  );

-- DELETE/UPDATE: Users can manage notes in their own capsules
CREATE POLICY "Users can manage notes in own capsules" ON capsule_notes
  FOR ALL USING (
    EXISTS (
        SELECT 1 FROM capsules
        WHERE capsules.id = capsule_notes.capsule_id
        AND capsules.creator_id = auth.uid()
    )
  );

-- Verification Query (Check existing restrictions)
SELECT * FROM pg_policies WHERE tablename IN ('capsules', 'capsule_media', 'capsule_audio', 'capsule_notes');
