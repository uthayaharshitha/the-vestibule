-- Policies for User Contribution Management
-- Allow users to update and delete their own contributions

-- 1. policy for UPDATE
DROP POLICY IF EXISTS "Users can update own contributions" ON contributions;

CREATE POLICY "Users can update own contributions" ON contributions
  FOR UPDATE USING (
    auth.uid() = user_id
  );

-- 2. policy for DELETE
DROP POLICY IF EXISTS "Users can delete own contributions" ON contributions;

CREATE POLICY "Users can delete own contributions" ON contributions
  FOR DELETE USING (
    auth.uid() = user_id
  );
