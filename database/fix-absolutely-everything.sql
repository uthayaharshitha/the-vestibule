-- FIX ABSOLUTELY EVERYTHING (v5)
-- Run this if functionality is missing or errors persist.

-- 1. FIX MISSING USERS (Backfill from Auth)
INSERT INTO public.users (id, role, is_anonymous, pseudonym, status)
SELECT 
    id, 
    'user', 
    FALSE, 
    'Traveler ' || substring(id::text from 1 for 4), 
    'active'
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.users WHERE users.id = auth.users.id
)
ON CONFLICT (id) DO NOTHING;

-- 2. ADD MISSING COLUMNS
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS pseudonym TEXT;
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;

-- 3. ENSURE TAGS EXIST
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS capsule_tags (
  capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (capsule_id, tag_id)
);

-- 4. FIX POLICIES (Drop and Recreate to be sure)
DROP POLICY IF EXISTS "Authenticated users can insert contributions" ON contributions;
CREATE POLICY "Authenticated users can insert contributions" ON contributions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own contributions" ON contributions;
CREATE POLICY "Users can update own contributions" ON contributions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own contributions" ON contributions;
CREATE POLICY "Users can delete own contributions" ON contributions
  FOR DELETE USING (auth.uid() = user_id);

-- 5. ENABLE REALTIME (Critical for updates/deletes to show)
-- Check if publication exists, if not create/alter
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'contributions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE contributions;
  END IF;
END
$$;

ALTER TABLE contributions REPLICA IDENTITY DEFAULT;
