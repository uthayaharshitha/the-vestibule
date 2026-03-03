-- Phase 2: Database Structure Expansion (Safe Migration)
-- This script ensures all required tables and columns exist without deleting data.

-- 1. Validate/Update CAPSULES Table
DO $$
BEGIN
    -- Ensure 'creator_id' exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'capsules' AND column_name = 'creator_id') THEN
        ALTER TABLE capsules ADD COLUMN creator_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;

    -- Ensure 'visibility' exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'capsules' AND column_name = 'visibility') THEN
        ALTER TABLE capsules ADD COLUMN visibility TEXT CHECK (visibility IN ('public', 'hidden')) DEFAULT 'public';
    END IF;

    -- Ensure 'created_at' and 'updated_at' exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'capsules' AND column_name = 'created_at') THEN
        ALTER TABLE capsules ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'capsules' AND column_name = 'updated_at') THEN
        ALTER TABLE capsules ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Validate/Update CAPSULE_MEDIA Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'capsule_media') THEN
        CREATE TABLE capsule_media (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE NOT NULL,
            media_type TEXT CHECK (media_type IN ('image', 'video')) NOT NULL,
            file_url TEXT NOT NULL,
            thumbnail_url TEXT,
            order_index INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
         -- Check individual columns if table exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'capsule_media' AND column_name = 'media_type') THEN
            ALTER TABLE capsule_media ADD COLUMN media_type TEXT CHECK (media_type IN ('image', 'video')) NOT NULL;
        END IF;
    END IF;
END $$;

-- 3. Validate/Update CAPSULE_NOTES Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'capsule_notes') THEN
        CREATE TABLE capsule_notes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE NOT NULL,
            note_text TEXT NOT NULL,
            order_index INTEGER NOT NULL
        );
    END IF;
END $$;

-- 4. Validate/Update CAPSULE_AUDIO Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'capsule_audio') THEN
        CREATE TABLE capsule_audio (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE NOT NULL,
            file_url TEXT NOT NULL,
            duration_seconds INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;
