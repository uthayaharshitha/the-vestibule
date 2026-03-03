-- Diagnostic queries to check capsule status
-- Run these queries in Supabase SQL Editor to investigate missing capsules

-- 1. Check if ANY capsules exist in the database
SELECT COUNT(*) as total_capsules FROM capsules;

-- 2. Check capsules by status
SELECT status, COUNT(*) as count 
FROM capsules 
GROUP BY status;

-- 3. Check capsules by visibility
SELECT visibility, COUNT(*) as count 
FROM capsules 
GROUP BY visibility;

-- 4. View all capsules with their status and visibility
SELECT 
    id, 
    title, 
    creator_id, 
    status, 
    visibility, 
    created_at,
    updated_at
FROM capsules 
ORDER BY created_at DESC
LIMIT 20;

-- 5. Check if there are capsules that don't meet the feed criteria
SELECT 
    COUNT(*) as hidden_or_inactive_capsules
FROM capsules 
WHERE status != 'active' OR visibility != 'public';

-- 6. Check RLS policies on capsules table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'capsules'
ORDER BY policyname;
