-- Fix: Missing INSERT policy on users table
-- Run this in Supabase SQL Editor

-- 1. Allow authenticated users to insert their own profile row
--    (needed for signup flow & profile edit upsert)
CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 2. Also broaden the UPDATE policy name (the old one was named "pseudonym" but
--    we now update username, profile_image_url, banner_image_url too)
--    Drop the old policy and replace with a broader one.
DROP POLICY IF EXISTS "Users can update own pseudonym" ON users;

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Verify policies are now correct:
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users';
