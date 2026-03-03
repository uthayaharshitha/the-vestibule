-- EMERGENCY: Check if capsules can be recovered
-- This checks if capsules were soft-deleted (status='removed') or hard-deleted

-- 1. Check for soft-deleted capsules (can be recovered)
SELECT 
    id, 
    title, 
    creator_id, 
    status, 
    visibility,
    created_at
FROM capsules 
WHERE status = 'removed'
ORDER BY created_at DESC;

-- 2. If capsules were soft-deleted, recover them with this:
-- UNCOMMENT AND RUN ONLY IF YOU SEE CAPSULES ABOVE:
/*
UPDATE capsules 
SET status = 'active'
WHERE status = 'removed';
*/

-- 3. Check total count of all capsules (including removed)
SELECT 
    status,
    COUNT(*) as count
FROM capsules
GROUP BY status;

-- 4. If capsules were HARD DELETED, they cannot be recovered unless you have a backup
-- Check if there are ANY capsules left:
SELECT COUNT(*) as total_capsules FROM capsules;
