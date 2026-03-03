-- Comprehensive RLS Policy Fix for Capsule Deletion
-- This removes all conflicting policies and sets up clean user-based policies

-- Step 1: Drop ALL existing policies on capsules table
DROP POLICY IF EXISTS "Public can read active capsules" ON capsules;
DROP POLICY IF EXISTS "Admins can insert capsules" ON capsules;
DROP POLICY IF EXISTS "Admins can update capsules" ON capsules;
DROP POLICY IF EXISTS "Users can create capsules" ON capsules;
DROP POLICY IF EXISTS "Users can update own capsules" ON capsules;
DROP POLICY IF EXISTS "Users can delete own capsules" ON capsules;

-- Step 2: Create fresh, clean policies

-- SELECT: Anyone can read active, public capsules
CREATE POLICY "Public can read active capsules" ON capsules
  FOR SELECT USING (
    (status = 'active' AND visibility = 'public')
    OR (creator_id = auth.uid())  -- Users can always see their own capsules
  );

-- INSERT: Authenticated users can create capsules (must set themselves as creator)
CREATE POLICY "Users can create capsules" ON capsules
  FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

-- UPDATE: Users can update their own capsules (including soft delete)
CREATE POLICY "Users can update own capsules" ON capsules
  FOR UPDATE 
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- DELETE: Users can delete their own capsules (hard delete if needed)
CREATE POLICY "Users can delete own capsules" ON capsules
  FOR DELETE 
  USING (auth.uid() = creator_id);

-- Step 3: Verify policies were created
SELECT 
    policyname,
    cmd,
    CASE WHEN qual IS NOT NULL THEN 'Has USING' ELSE 'No USING' END as using_clause,
    CASE WHEN with_check IS NOT NULL THEN 'Has WITH CHECK' ELSE 'No WITH CHECK' END as with_check_clause
FROM pg_policies 
WHERE tablename = 'capsules'
ORDER BY policyname;
