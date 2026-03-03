-- Trigger to sync auth.users with public.users
-- This ensures that when a user signs up via Supabase Auth, they automatically get a row in our public users table

-- 1. Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, role, is_anonymous, pseudonym, status)
  VALUES (
    NEW.id,
    'user',
    coalesce(NEW.is_anonymous, FALSE), -- True if guest, false if email signup
    'Traveler ' || substring(NEW.id::text from 1 for 4), -- Default pseudonym
    'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET is_anonymous = FALSE; -- If they were anon and converted, update status
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
-- Drop if exists to avoid errors on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Safety Check: Update RLS for new requirements
-- Allow users to read their own data (already exists: "Public can read users" allows all)
-- But let's be specific about updates
DROP POLICY IF EXISTS "Users can update own pseudonym" ON public.users;

CREATE POLICY "Users can update own pseudonym" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 4. Contributions RLS Update
-- We need to ensure users can see their own NON-ACTIVE contributions (drafts, etc in future)
DROP POLICY IF EXISTS "Users can view own contributions" ON contributions;

CREATE POLICY "Users can view own contributions" ON contributions
  FOR SELECT USING (
    auth.uid() = user_id OR status = 'active'
  );

-- Note: The existing "Public can read active contributions" handles public view.
-- But Supabase policies are OR-ed, so if either matches, access is granted.
-- Adding the specific user policy ensures they can see their own hidden/flagged items.
