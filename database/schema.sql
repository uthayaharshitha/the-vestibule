-- Emotional Capsule Platform - Database Schema
-- PostgreSQL / Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_anonymous BOOLEAN DEFAULT true,
  pseudonym TEXT,
  role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  status TEXT CHECK (status IN ('active', 'suspended')) DEFAULT 'active'
);

-- 2. CAPSULES TABLE
CREATE TABLE capsules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('active', 'flagged', 'removed')) DEFAULT 'active',
  visibility TEXT CHECK (visibility IN ('public', 'hidden')) DEFAULT 'public',
  background_color TEXT
);

-- 3. CAPSULE_MEDIA TABLE
CREATE TABLE capsule_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video')) NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CAPSULE_AUDIO TABLE
CREATE TABLE capsule_audio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CAPSULE_NOTES TABLE
CREATE TABLE capsule_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE NOT NULL,
  note_text TEXT NOT NULL,
  order_index INTEGER NOT NULL
);

-- 6. CONTRIBUTIONS TABLE
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content_type TEXT CHECK (content_type IN ('writing', 'reflection', 'poem')) DEFAULT 'writing',
  content_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('active', 'flagged', 'removed')) DEFAULT 'active'
);

-- 7. CONTRIBUTION_MEDIA TABLE (for Phase 2+)
CREATE TABLE contribution_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contribution_id UUID REFERENCES contributions(id) ON DELETE CASCADE NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'audio')) NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. REPORTS TABLE
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_type TEXT CHECK (target_type IN ('capsule', 'contribution')) NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('pending', 'reviewed', 'dismissed')) DEFAULT 'pending'
);

-- INDEXES for performance
CREATE INDEX idx_capsules_created_at ON capsules(created_at DESC);
CREATE INDEX idx_capsules_status_visibility ON capsules(status, visibility);
CREATE INDEX idx_contributions_capsule_id ON contributions(capsule_id);
CREATE INDEX idx_contributions_created_at ON contributions(created_at ASC);
CREATE INDEX idx_capsule_media_capsule_id ON capsule_media(capsule_id);
CREATE INDEX idx_reports_status ON reports(status);

-- Update trigger for capsules.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_capsules_updated_at BEFORE UPDATE ON capsules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
