-- ⚠️  DELETE ALL CAPSULES + ALL RELATED DATA
-- This cascades to: capsule_media, capsule_audio, capsule_notes,
--                   contributions, contribution_media
-- Reports referencing capsules are NOT cascaded (target_id is plain UUID),
-- so we clear those separately first.

-- 1. Remove reports targeting capsule/contribution records
DELETE FROM reports
WHERE target_type IN ('capsule', 'contribution');

-- 2. Delete all capsules (cascades to all child tables)
DELETE FROM capsules;
