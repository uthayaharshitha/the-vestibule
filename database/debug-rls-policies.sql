-- Debug: Check all current RLS policies on capsules table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'capsules'
ORDER BY policyname;

-- Also check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'capsules';
