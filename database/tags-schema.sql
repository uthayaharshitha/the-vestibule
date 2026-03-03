-- Tags System Schema

-- 1. Tags Table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Capsule Tags Junction Table
CREATE TABLE capsule_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(capsule_id, tag_id)
);

-- 3. RLS Policies
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsule_tags ENABLE ROW LEVEL SECURITY;

-- Public can read tags
CREATE POLICY "Public can read tags" ON tags
  FOR SELECT USING (true);

-- Public can read capsule_tags
CREATE POLICY "Public can read capsule_tags" ON capsule_tags
  FOR SELECT USING (true);

-- Only admins can insert tags (Curated system)
CREATE POLICY "Admins can insert tags" ON tags
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert capsule_tags" ON capsule_tags
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Seed Data Updates (Tagging existing seed capsules)
-- We'll assume the seed capsules exist (from previous step). 
-- This part is tricky if IDs are random, but we used fixed IDs in seed.sql.

-- Insert Sample Tags
INSERT INTO tags (name) VALUES 
  ('liminal'), ('nostalgia'), ('urban'), ('nature'), ('night'), ('water')
ON CONFLICT (name) DO NOTHING;

-- Tag 'Midnight Laundromat' (b1...22) with 'urban', 'night', 'liminal'
INSERT INTO capsule_tags (capsule_id, tag_id)
SELECT 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', id FROM tags WHERE name IN ('urban', 'night', 'liminal')
ON CONFLICT DO NOTHING;

-- Tag 'Sunken Cathedral' (c2...33) with 'water', 'nature', 'liminal'
INSERT INTO capsule_tags (capsule_id, tag_id)
SELECT 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', id FROM tags WHERE name IN ('water', 'nature', 'liminal')
ON CONFLICT DO NOTHING;

-- Tag 'Empty Airport' (d3...44) with 'liminal', 'urban', 'nostalgia'
INSERT INTO capsule_tags (capsule_id, tag_id)
SELECT 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', id FROM tags WHERE name IN ('liminal', 'urban', 'nostalgia')
ON CONFLICT DO NOTHING;
