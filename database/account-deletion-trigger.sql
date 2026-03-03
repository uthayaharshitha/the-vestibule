-- Account Deletion: auto-cleanup trigger
-- Run in Supabase SQL Editor

-- When a row is deleted from auth.users, also delete the public.users row.
-- This frees the username for others to reuse.
CREATE OR REPLACE FUNCTION handle_auth_user_deleted()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_auth_user_deleted();

-- Also delete the user's capsules (mark as removed to keep data integrity)
-- Optional: uncomment if you want capsules removed too
-- UPDATE public.capsules SET status = 'removed' WHERE creator_id = OLD.id;

-- Verify trigger:
SELECT trigger_name, event_object_table FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_deleted';
