-- Phase 5: Feed Redesign Schema Expansion
-- Additive changes only - no drops, no destructive modifications

-- 1. Add new columns to capsules table
ALTER TABLE capsules 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#F5F5F5';

-- 2. Create capsule_hashtags table
CREATE TABLE IF NOT EXISTS capsule_hashtags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE NOT NULL,
    hashtag TEXT NOT NULL,
    order_index INTEGER NOT NULL CHECK (order_index >= 1 AND order_index <= 3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(capsule_id, order_index)
);

-- 3. Create index for hashtag queries
CREATE INDEX IF NOT EXISTS idx_capsule_hashtags_capsule_id ON capsule_hashtags(capsule_id);
CREATE INDEX IF NOT EXISTS idx_capsule_hashtags_hashtag ON capsule_hashtags(hashtag);

-- 4. Enable RLS on capsule_hashtags
ALTER TABLE capsule_hashtags ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for capsule_hashtags

-- Public can read hashtags for active capsules
CREATE POLICY "Public can read hashtags for active capsules" ON capsule_hashtags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM capsules
            WHERE capsules.id = capsule_hashtags.capsule_id
            AND capsules.status = 'active'
            AND capsules.visibility = 'public'
        )
    );

-- Users can insert hashtags for their own capsules
CREATE POLICY "Users can add hashtags to own capsules" ON capsule_hashtags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM capsules
            WHERE capsules.id = capsule_hashtags.capsule_id
            AND capsules.creator_id = auth.uid()
        )
    );

-- Users can manage hashtags for their own capsules
CREATE POLICY "Users can manage hashtags in own capsules" ON capsule_hashtags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM capsules
            WHERE capsules.id = capsule_hashtags.capsule_id
            AND capsules.creator_id = auth.uid()
        )
    );

-- Verification Query
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'capsules' 
AND column_name IN ('cover_image_url', 'short_description', 'theme_color');

SELECT * FROM pg_tables WHERE tablename = 'capsule_hashtags';
