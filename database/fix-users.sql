-- Fix missing public users
-- This script backfills any users from auth.users that are missing in public.users
-- Run this if you get "Error creating contribution" or foreign key violations

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

-- Also verify RLS policies are correct for insertion
DROP POLICY IF EXISTS "Authenticated users can insert contributions" ON contributions;
CREATE POLICY "Authenticated users can insert contributions" ON contributions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
