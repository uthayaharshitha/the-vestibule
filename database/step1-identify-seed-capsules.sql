-- ============================================================
-- STEP 1 — IDENTIFY SEED CAPSULES (READ-ONLY, NO DELETES)
-- Run this first. Review the results before proceeding.
-- ============================================================

-- All 20 seeded capsules were inserted with creator_id = NULL.
-- We match by exact title to avoid touching any user capsule
-- that might also happen to have a NULL creator_id.

SELECT
    id,
    title,
    creator_id,
    status,
    visibility,
    created_at
FROM capsules
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
ORDER BY created_at;

-- ============================================================
-- ALSO CHECK: any capsules with creator_id IS NULL NOT in the
-- seed list (i.e. potential unknown seed rows or edge cases)
-- ============================================================

SELECT
    id,
    title,
    creator_id,
    created_at
FROM capsules
WHERE creator_id IS NULL
  AND title NOT IN (
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
-- If the second query returns rows, review them before proceeding.
-- They may be user capsules created anonymously — do NOT delete those.
