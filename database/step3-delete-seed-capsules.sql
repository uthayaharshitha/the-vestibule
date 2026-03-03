-- ============================================================
-- STEP 3 — SAFE CASCADE DELETE OF SEED CAPSULES
-- Only run this AFTER reviewing Step 1 output and confirming.
-- ============================================================
-- Strategy:
--   1. Capture seed capsule IDs into a CTE once.
--   2. Delete child rows explicitly in dependency order.
--   3. Delete from capsules last, scoped to those IDs only.
--
-- FK cascade would handle most children automatically, but we
-- delete explicitly for full auditability.
-- ============================================================

DO $$
DECLARE
    seed_ids UUID[];
BEGIN

-- ── PIN SEED IDs ──────────────────────────────────────────────
seed_ids := ARRAY(
    SELECT id FROM capsules
    WHERE creator_id IS NULL
      AND title IN (
        'the summer you stopped answering your phone',
        'the last time the whole family was in one room',
        'the school hallway before anyone else arrived',
        'the town you grew up in dissolved while you were away',
        'staying up past midnight watching television that no longer exists',
        'the apartment you left everything in',
        'the friendship that ended without a conversation',
        'rain on a window while someone you love sleeps nearby',
        'reading your old journal and not recognizing who wrote it',
        'the drive home after something changed forever',
        'you wake up in the middle of the night and the hallway feels aware of you',
        'the swimming pool at the end of summer with no one in it',
        'a hotel corridor at 4am when you can''t remember what floor you''re on',
        'the shopping mall the year before it closed forever',
        'the photograph in the antique store where everyone is looking at the camera except one person',
        'the night everything was possible and you knew it while it was happening',
        'the morning after you finally told the truth',
        'dancing alone in the kitchen at 11pm to a song no one else knows',
        'the last day of a trip when you''ve already started to miss it',
        'the moment on the train when you realize you are finally becoming someone you like'
    )
);

RAISE NOTICE 'Seed capsule IDs identified: %', array_length(seed_ids, 1);

-- ── 1. capsule_notes ──────────────────────────────────────────
DELETE FROM capsule_notes
WHERE capsule_id = ANY(seed_ids);
RAISE NOTICE 'Deleted capsule_notes rows.';

-- ── 2. capsule_hashtags ───────────────────────────────────────
DELETE FROM capsule_hashtags
WHERE capsule_id = ANY(seed_ids);
RAISE NOTICE 'Deleted capsule_hashtags rows.';

-- ── 3. capsule_media ──────────────────────────────────────────
DELETE FROM capsule_media
WHERE capsule_id = ANY(seed_ids);
RAISE NOTICE 'Deleted capsule_media rows.';

-- ── 4. capsule_audio ──────────────────────────────────────────
DELETE FROM capsule_audio
WHERE capsule_id = ANY(seed_ids);
RAISE NOTICE 'Deleted capsule_audio rows.';

-- ── 5. contribution_media → contributions ────────────────────
-- contribution_media has ON DELETE CASCADE from contributions,
-- so deleting contributions is sufficient.
DELETE FROM contribution_media
WHERE contribution_id IN (
    SELECT id FROM contributions
    WHERE capsule_id = ANY(seed_ids)
);
RAISE NOTICE 'Deleted contribution_media rows.';

DELETE FROM contributions
WHERE capsule_id = ANY(seed_ids);
RAISE NOTICE 'Deleted contributions rows.';

-- ── 6. reports targeting these capsules ───────────────────────
DELETE FROM reports
WHERE target_type = 'capsule'
  AND target_id = ANY(seed_ids);
RAISE NOTICE 'Deleted capsule reports rows.';

-- ── 7. Finally: delete the capsules themselves ────────────────
DELETE FROM capsules
WHERE id = ANY(seed_ids);
RAISE NOTICE 'Deleted % seed capsules.', array_length(seed_ids, 1);

END $$;

-- ============================================================
-- STEP 4 — VERIFICATION
-- Run these after the block above to confirm clean state.
-- ============================================================

-- Remaining capsule count (should be 0 if no user capsules existed):
SELECT COUNT(*) AS remaining_capsules FROM capsules;

-- Confirm no seed titles remain:
SELECT id, title FROM capsules
WHERE title IN (
    'the summer you stopped answering your phone',
    'the last time the whole family was in one room',
    'the school hallway before anyone else arrived',
    'the town you grew up in dissolved while you were away',
    'staying up past midnight watching television that no longer exists',
    'the apartment you left everything in',
    'the friendship that ended without a conversation',
    'rain on a window while someone you love sleeps nearby',
    'reading your old journal and not recognizing who wrote it',
    'the drive home after something changed forever',
    'you wake up in the middle of the night and the hallway feels aware of you',
    'the swimming pool at the end of summer with no one in it',
    'a hotel corridor at 4am when you can''t remember what floor you''re on',
    'the shopping mall the year before it closed forever',
    'the photograph in the antique store where everyone is looking at the camera except one person',
    'the night everything was possible and you knew it while it was happening',
    'the morning after you finally told the truth',
    'dancing alone in the kitchen at 11pm to a song no one else knows',
    'the last day of a trip when you''ve already started to miss it',
    'the moment on the train when you realize you are finally becoming someone you like'
);
-- Expect: 0 rows

-- Confirm no orphaned child rows remain from those capsules:
SELECT 'capsule_notes orphans' AS check_name, COUNT(*) FROM capsule_notes WHERE capsule_id NOT IN (SELECT id FROM capsules)
UNION ALL
SELECT 'capsule_hashtags orphans', COUNT(*) FROM capsule_hashtags WHERE capsule_id NOT IN (SELECT id FROM capsules)
UNION ALL
SELECT 'capsule_media orphans', COUNT(*) FROM capsule_media WHERE capsule_id NOT IN (SELECT id FROM capsules)
UNION ALL
SELECT 'capsule_audio orphans', COUNT(*) FROM capsule_audio WHERE capsule_id NOT IN (SELECT id FROM capsules)
UNION ALL
SELECT 'contributions orphans', COUNT(*) FROM contributions WHERE capsule_id NOT IN (SELECT id FROM capsules);
-- All counts should be 0.
