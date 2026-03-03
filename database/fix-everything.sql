-- MASTER FIX SCRIPT (v4)
-- Run this to fix all "Error creating contribution" and "Error fetching capsules" issues.

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

-- 2. ADD COLUMNS (For new features)
ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS pseudonym TEXT;

ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;

-- 3. ENSURE TAGS EXIST (For Search)
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

-- 4. ENSURE POLICIES ALLOW INSERT
DROP POLICY IF EXISTS "Authenticated users can insert contributions" ON contributions;
CREATE POLICY "Authenticated users can insert contributions" ON contributions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 5. ENABLE RLS ON NEW TABLES (Safely)
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsule_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read tags" ON tags;
CREATE POLICY "Public can read tags" ON tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read capsule_tags" ON capsule_tags;
CREATE POLICY "Public can read capsule_tags" ON capsule_tags FOR SELECT USING (true);
