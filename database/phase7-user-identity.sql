-- Phase 7: User Identity Expansion
-- Run in Supabase SQL Editor.

-- ── 1. Add identity columns to users ──────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS banner_image_url TEXT;

-- Username UNIQUE constraint
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE public.users
  ADD CONSTRAINT users_username_key UNIQUE (username);

-- Username format: 3-20 chars, lowercase alphanumeric + underscore only
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS username_format;
ALTER TABLE public.users
  ADD CONSTRAINT username_format
  CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,20}$');

-- ── 2. saved_capsules table ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_capsules (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  capsule_id UUID REFERENCES public.capsules(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, capsule_id)
);

-- ── 3. RLS on saved_capsules ───────────────────────────────────────────────
ALTER TABLE saved_capsules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own saves" ON saved_capsules;
CREATE POLICY "Users manage own saves" ON saved_capsules
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 4. Index ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_saved_capsules_user_id ON saved_capsules(user_id);

-- ── 5. is_username_available RPC (bypasses RLS) ───────────────────────────
CREATE OR REPLACE FUNCTION public.is_username_available(uname TEXT)
RETURNS BOOLEAN AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.users WHERE username = lower(trim(uname))
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.is_username_available(TEXT) TO anon, authenticated;

-- ── 6. get_my_role (re-ensure, may already exist from phase6) ─────────────
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated, anon;

-- ── 7. RLS: users allowed to update their own profile fields ──────────────
DROP POLICY IF EXISTS "Users update own profile" ON public.users;
CREATE POLICY "Users update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ── 8. Verify ─────────────────────────────────────────────────────────────
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'users';
-- SELECT * FROM saved_capsules LIMIT 1;
