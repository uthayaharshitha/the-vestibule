-- Find and delete the first 3 capsules (oldest by creation date)
-- These are likely the sample/test capsules

-- Step 1: View the first 3 capsules to confirm they're the ones to delete
SELECT id, title, creator_id, created_at, status, visibility
FROM capsules 
ORDER BY created_at ASC
LIMIT 3;

-- Step 2: Store the IDs in a temporary variable approach
-- Delete related data for the first 3 capsules

WITH first_three AS (
    SELECT id FROM capsules ORDER BY created_at ASC LIMIT 3
)
-- Delete capsule media
DELETE FROM capsule_media 
WHERE capsule_id IN (SELECT id FROM first_three);

WITH first_three AS (
    SELECT id FROM capsules ORDER BY created_at ASC LIMIT 3
)
-- Delete capsule audio
DELETE FROM capsule_audio 
WHERE capsule_id IN (SELECT id FROM first_three);

WITH first_three AS (
    SELECT id FROM capsules ORDER BY created_at ASC LIMIT 3
)
-- Delete capsule notes
DELETE FROM capsule_notes 
WHERE capsule_id IN (SELECT id FROM first_three);

WITH first_three AS (
    SELECT id FROM capsules ORDER BY created_at ASC LIMIT 3
)
-- Delete capsule hashtags
DELETE FROM capsule_hashtags 
WHERE capsule_id IN (SELECT id FROM first_three);

WITH first_three AS (
    SELECT id FROM capsules ORDER BY created_at ASC LIMIT 3
)
-- Delete contributions
DELETE FROM contributions 
WHERE capsule_id IN (SELECT id FROM first_three);

WITH first_three AS (
    SELECT id FROM capsules ORDER BY created_at ASC LIMIT 3
)
-- Finally delete the capsules themselves
DELETE FROM capsules 
WHERE id IN (SELECT id FROM first_three);

-- Verify deletion
SELECT COUNT(*) as total_capsules_remaining FROM capsules;
