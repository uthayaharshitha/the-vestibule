-- ============================================================
-- LIMINAL SPACES — 20 CAPSULE SEED
-- Run in Supabase SQL Editor as service role (bypasses RLS)
-- creator_id = NULL is valid per schema (ON DELETE SET NULL)
-- ============================================================

DO $$
DECLARE
  c_id UUID;
BEGIN

-- ============================================================
-- CAPSULE 1 — NOSTALGIC
-- ============================================================
INSERT INTO capsules (title, short_description, description, theme_color, cover_image_url, visibility, status, creator_id)
VALUES (
  'the summer you stopped answering your phone',
  'Heat lightning over a backyard. Someone''s name you no longer say aloud.',
  'It was the summer the air conditioner broke and everyone slept on the porch. You kept your phone charged to full but let it ring. The grass was always wet before sunrise. There was a boy, or a girl, or a feeling — it doesn''t matter now, only that it was real and then it wasn''t. You still smell sunscreen and think of something you can''t name.',
  '#D4B896', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
  'public', 'active', NULL
) RETURNING id INTO c_id;

INSERT INTO capsule_notes (capsule_id, note_text, order_index) VALUES
  (c_id, 'warm asphalt after rain', 1), (c_id, 'watermelon rind', 2),
  (c_id, 'old sunscreen', 3), (c_id, 'damp grass at 5am', 4),
  (c_id, 'someone else''s shampoo', 5);

INSERT INTO capsule_hashtags (capsule_id, hashtag, order_index) VALUES
  (c_id, 'nostalgia', 1), (c_id, 'summer', 2), (c_id, 'letting go', 3);

INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index) VALUES
  (c_id, 'image', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200', 1),
  (c_id, 'image', 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200', 2),
  (c_id, 'image', 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1200', 3),
  (c_id, 'image', 'https://images.unsplash.com/photo-1437226218744-15bf46f2e270?w=1200', 4),
  (c_id, 'image', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200', 5),
  (c_id, 'image', 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=1200', 6),
  (c_id, 'image', 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1200', 7),
  (c_id, 'image', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200', 8);

INSERT INTO capsule_audio (capsule_id, file_url) VALUES
  (c_id, 'https://freesound.org/data/previews/531/531947_11861866-lq.mp3');

-- ============================================================
-- CAPSULE 2 — NOSTALGIC
-- ============================================================
INSERT INTO capsules (title, short_description, description, theme_color, cover_image_url, visibility, status, creator_id)
VALUES (
  'the last time the whole family was in one room',
  'A photograph taken before anyone knew it was the last one. The cake had too many candles.',
  'Someone made a joke that landed wrong and everyone laughed anyway. The tablecloth was the same one from fifteen years of holidays. There was a smell of something baking that no one can quite replicate. You didn''t know then that it would become the image you return to — that ordinary Tuesday afternoon, everyone''s hands visible in the frame.',
  '#C9B99A', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200',
  'public', 'active', NULL
) RETURNING id INTO c_id;

INSERT INTO capsule_notes (capsule_id, note_text, order_index) VALUES
  (c_id, 'roasting garlic', 1), (c_id, 'old wool blanket', 2),
  (c_id, 'birthday candle smoke', 3), (c_id, 'furniture polish', 4),
  (c_id, 'clementine peel', 5), (c_id, 'dish soap on warm hands', 6);

INSERT INTO capsule_hashtags (capsule_id, hashtag, order_index) VALUES
  (c_id, 'family', 1), (c_id, 'memory', 2), (c_id, 'ordinary days', 3);

INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index) VALUES
  (c_id, 'image', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200', 1),
  (c_id, 'image', 'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=1200', 2),
  (c_id, 'image', 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200', 3),
  (c_id, 'image', 'https://images.unsplash.com/photo-1543269664-7eef42226a21?w=1200', 4),
  (c_id, 'image', 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=1200', 5),
  (c_id, 'image', 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200', 6),
  (c_id, 'image', 'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=1200', 7),
  (c_id, 'image', 'https://images.unsplash.com/photo-1473181488821-2d23949a045a?w=1200', 8);

INSERT INTO capsule_audio (capsule_id, file_url) VALUES
  (c_id, 'https://freesound.org/data/previews/399/399934_7346540-lq.mp3');

-- ============================================================
-- CAPSULE 3 — NOSTALGIC
-- ============================================================
INSERT INTO capsules (title, short_description, description, theme_color, cover_image_url, visibility, status, creator_id)
VALUES (
  'the school hallway before anyone else arrived',
  'Fluorescent silence. The smell of chalk on a cold morning.',
  'You were always the first one in. The hallway stretched long and hollow, the lockers shut like a held breath. Light came through windows at an angle that only existed before 7am. You walked slowly on purpose, claiming the quiet before it was taken. It was the only hour the building belonged to you — and you belonged to nothing.',
  '#B8C4BB', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200',
  'public', 'active', NULL
) RETURNING id INTO c_id;

INSERT INTO capsule_notes (capsule_id, note_text, order_index) VALUES
  (c_id, 'chalk dust', 1), (c_id, 'cold radiator metal', 2),
  (c_id, 'winter coat wool', 3), (c_id, 'pencil shavings', 4),
  (c_id, 'wax floor cleaner', 5);

INSERT INTO capsule_hashtags (capsule_id, hashtag, order_index) VALUES
  (c_id, 'childhood', 1), (c_id, 'solitude', 2), (c_id, 'early morning', 3);

INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index) VALUES
  (c_id, 'image', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200', 1),
  (c_id, 'image', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200', 2),
  (c_id, 'image', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200', 3),
  (c_id, 'image', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200', 4),
  (c_id, 'image', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200', 5),
  (c_id, 'image', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200', 6),
  (c_id, 'image', 'https://images.unsplash.com/photo-1543946207-39bd91e70ca7?w=1200', 7),
  (c_id, 'image', 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=1200', 8),
  (c_id, 'image', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200', 9);

INSERT INTO capsule_audio (capsule_id, file_url) VALUES
  (c_id, 'https://freesound.org/data/previews/416/416054_5121236-lq.mp3');

-- ============================================================
-- CAPSULE 4 — NOSTALGIC
-- ============================================================
INSERT INTO capsules (title, short_description, description, theme_color, cover_image_url, visibility, status, creator_id)
VALUES (
  'the town you grew up in dissolved while you were away',
  'The diner closed. The theater became a parking structure. The creek is still there, though, small and indifferent.',
  'You drove back for a reason you had already forgotten by the time you arrived. The street names were the same but the buildings had rearranged themselves without asking. The old music shop was a vape store. The park bench where something important happened had been replaced with a newer, more official bench. You took a terrible photograph and drove home faster than you meant to.',
  '#A8B5A0', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200',
  'public', 'active', NULL
) RETURNING id INTO c_id;

INSERT INTO capsule_notes (capsule_id, note_text, order_index) VALUES
  (c_id, 'diesel exhaust', 1), (c_id, 'old paperback pages', 2),
  (c_id, 'creek water and clay', 3), (c_id, 'faded vinyl seating', 4),
  (c_id, 'cold french fries', 5);

INSERT INTO capsule_hashtags (capsule_id, hashtag, order_index) VALUES
  (c_id, 'hometown', 1), (c_id, 'change', 2), (c_id, 'return', 3);

INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index) VALUES
  (c_id, 'image', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200', 1),
  (c_id, 'image', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200', 2),
  (c_id, 'image', 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=1200', 3),
  (c_id, 'image', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200', 4),
  (c_id, 'image', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200', 5),
  (c_id, 'image', 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200', 6),
  (c_id, 'image', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200', 7),
  (c_id, 'image', 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=1200', 8);

INSERT INTO capsule_audio (capsule_id, file_url) VALUES
  (c_id, 'https://freesound.org/data/previews/459/459977_9497060-lq.mp3');

-- ============================================================
-- CAPSULE 5 — NOSTALGIC
-- ============================================================
INSERT INTO capsules (title, short_description, description, theme_color, cover_image_url, visibility, status, creator_id)
VALUES (
  'staying up past midnight watching television that no longer exists',
  'Late night static. Infomercials for things no one needed. A frequency of loneliness that felt communal.',
  'There was a particular quality to 2am television — a honesty in its desperation. The carpet was cold. The volume was low so no one would hear you were still awake. You memorized jingles for products that disappeared. The test card at the end of broadcast felt like a small death, and you watched it anyway, and somehow that was comforting.',
  '#2D2D3A', 'https://images.unsplash.com/photo-1593697821252-0c213ef4bd78?w=1200',
  'public', 'active', NULL
) RETURNING id INTO c_id;

INSERT INTO capsule_notes (capsule_id, note_text, order_index) VALUES
  (c_id, 'warm cathode glass', 1), (c_id, 'stale carpet at midnight', 2),
  (c_id, 'cold cereal dry', 3), (c_id, 'television static ozone', 4),
  (c_id, 'wool sock on linoleum', 5);

INSERT INTO capsule_hashtags (capsule_id, hashtag, order_index) VALUES
  (c_id, 'late night', 1), (c_id, 'television', 2), (c_id, 'insomnia', 3);

INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index) VALUES
  (c_id, 'image', 'https://images.unsplash.com/photo-1593697821252-0c213ef4bd78?w=1200', 1),
  (c_id, 'image', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200', 2),
  (c_id, 'image', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200', 3),
  (c_id, 'image', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200', 4),
  (c_id, 'image', 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200', 5),
  (c_id, 'image', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200', 6),
  (c_id, 'image', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200', 7),
  (c_id, 'image', 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1200', 8);

INSERT INTO capsule_audio (capsule_id, file_url) VALUES
  (c_id, 'https://freesound.org/data/previews/362/362491_6629901-lq.mp3');

-- ============================================================
-- CAPSULE 6 — MELANCHOLIC
-- ============================================================
INSERT INTO capsules (title, short_description, description, theme_color, cover_image_url, visibility, status, creator_id)
VALUES (
  'the apartment you left everything in',
  'A key returned to a landlord who didn''t make eye contact. The walls held your shape for a little while.',
  'You packed what mattered into three boxes and left the rest for whoever came next. The shower curtain. The spice rack. Half a bottle of something you never liked but kept buying. On the last day the rooms echoed in a way they hadn''t before — filling with distance where there had been furniture. You locked the door and stood outside for longer than necessary.',
  '#7D8B99', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200',
  'public', 'active', NULL
) RETURNING id INTO c_id;

INSERT INTO capsule_notes (capsule_id, note_text, order_index) VALUES
  (c_id, 'cardboard and packing tape', 1), (c_id, 'empty room echo', 2),
  (c_id, 'old cooking oil', 3), (c_id, 'morning dust in sunlight', 4),
  (c_id, 'key metal in palm', 5), (c_id, 'paint and plaster cold', 6);

INSERT INTO capsule_hashtags (capsule_id, hashtag, order_index) VALUES
  (c_id, 'leaving', 1), (c_id, 'home', 2), (c_id, 'solitude', 3);

INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index) VALUES
  (c_id, 'image', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200', 1),
  (c_id, 'image', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200', 2),
  (c_id, 'image', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200', 3),
  (c_id, 'image', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200', 4),
  (c_id, 'image', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200', 5),
  (c_id, 'image', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200', 6),
  (c_id, 'image', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200', 7),
  (c_id, 'image', 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200', 8);

INSERT INTO capsule_audio (capsule_id, file_url) VALUES
  (c_id, 'https://freesound.org/data/previews/531/531947_11861866-lq.mp3');

-- ============================================================
-- CAPSULE 7 — MELANCHOLIC
-- ============================================================
INSERT INTO capsules (title, short_description, description, theme_color, cover_image_url, visibility, status, creator_id)
VALUES (
  'the friendship that ended without a conversation',
  'You just slowly stopped texting. One day the silence became the relationship.',
  'There was no argument, no betrayal, no clean break to grieve over. The messages became shorter, then more infrequent, then theoretical — lingering in drafts you never sent. You still think of them when certain songs come on, when you visit certain neighborhoods. You''ve rehearsed a hundred versions of reaching out and none of them felt true enough to send.',
  '#8B8FA8', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200',
  'public', 'active', NULL
) RETURNING id INTO c_id;

INSERT INTO capsule_notes (capsule_id, note_text, order_index) VALUES
  (c_id, 'cold coffee left untouched', 1), (c_id, 'night air and pavement', 2),
  (c_id, 'faded ink on old notes', 3), (c_id, 'candle smoke after extinguishing', 4),
  (c_id, 'damp concrete after rain', 5);

INSERT INTO capsule_hashtags (capsule_id, hashtag, order_index) VALUES
  (c_id, 'grief', 1), (c_id, 'friendship', 2), (c_id, 'distance', 3);

INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index) VALUES
  (c_id, 'image', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200', 1),
  (c_id, 'image', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200', 2),
  (c_id, 'image', 'https://images.unsplash.com/photo-1495620012587-98b8b0428a5a?w=1200', 3),
  (c_id, 'image', 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=1200', 4),
  (c_id, 'image', 'https://images.unsplash.com/photo-1464820453369-31d2c0b651af?w=1200', 5),
  (c_id, 'image', 'https://images.unsplash.com/photo-1442328166075-47fe7153c128?w=1200', 6),
  (c_id, 'image', 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=1200', 7),
  (c_id, 'image', 'https://images.unsplash.com/photo-1417325384643-aac51acc9e5d?w=1200', 8);

INSERT INTO capsule_audio (capsule_id, file_url) VALUES
  (c_id, 'https://freesound.org/data/previews/416/416054_5121236-lq.mp3');

-- ============================================================
-- CAPSULE 8 — MELANCHOLIC
-- ============================================================
INSERT INTO capsules (title, short_description, description, theme_color, cover_image_url, visibility, status, creator_id)
VALUES (
  'rain on a window while someone you love sleeps nearby',
  'The particular peace of knowing exactly where everyone is. You will not always know.',
  'It was the kind of rain that asks nothing of you. You were awake for no reason, watching the street below blur and resettle between drops. In the next room someone was breathing in slow time, unaware they were being held in your awareness like something precious. You understood, briefly and completely, that this moment was already leaving. You let it go anyway.',
  '#3D5A73', 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1200',
  'public', 'active', NULL
) RETURNING id INTO c_id;

INSERT INTO capsule_notes (capsule_id, note_text, order_index) VALUES
  (c_id, 'petrichor and cold glass', 1), (c_id, 'warm sleeping breath', 2),
  (c_id, 'wool blanket weight', 3), (c_id, 'steam from tea gone cold', 4),
  (c_id, 'night rain on leaves', 5);

INSERT INTO capsule_hashtags (capsule_id, hashtag, order_index) VALUES
  (c_id, 'rain', 1), (c_id, 'tenderness', 2), (c_id, 'impermanence', 3);

INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index) VALUES
  (c_id, 'image', 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1200', 1),
  (c_id, 'image', 'https://images.unsplash.com/photo-1428592953211-078e36d3afc4?w=1200', 2),
  (c_id, 'image', 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200', 3),
  (c_id, 'image', 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=1200', 4),
  (c_id, 'image', 'https://images.unsplash.com/photo-1544531585-9847b68c8c86?w=1200', 5),
  (c_id, 'image', 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1200', 6),
  (c_id, 'image', 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200', 7),
  (c_id, 'image', 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=1200', 8),
  (c_id, 'image', 'https://images.unsplash.com/photo-1535048903269-7b16e4de0b38?w=1200', 9);

INSERT INTO capsule_audio (capsule_id, file_url) VALUES
  (c_id, 'https://freesound.org/data/previews/346/346542_5858028-lq.mp3');

-- ============================================================
-- CAPSULE 9 — MELANCHOLIC
-- ============================================================
INSERT INTO capsules (title, short_description, description, theme_color, cover_image_url, visibility, status, creator_id)
VALUES (
  'reading your old journal and not recognizing who wrote it',
  'The handwriting is yours. The problems are unrecognizable. You grieve her anyway.',
  'She was terrified of things that no longer frighten you and utterly unafraid of things that now keep you awake. You read three pages and had to stop. There is something uncomfortable about evidence of continuity — the fact that you were always you, even when you were so clearly not. You closed the notebook. You did not throw it away.',
  '#9B8EA8', 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=1200',
  'public', 'active', NULL
) RETURNING id INTO c_id;

INSERT INTO capsule_notes (capsule_id, note_text, order_index) VALUES
  (c_id, 'old ink and paper', 1), (c_id, 'leather cover warmth', 2),
  (c_id, 'dust on forgotten shelves', 3), (c_id, 'dried flower pressed flat', 4),
  (c_id, 'pencil graphite faint', 5);

INSERT INTO capsule_hashtags (capsule_id, hashtag, order_index) VALUES
  (c_id, 'identity', 1), (c_id, 'memory', 2), (c_id, 'becoming', 3);

INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index) VALUES
  (c_id, 'image', 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=1200', 1),
  (c_id, 'image', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200', 2),
  (c_id, 'image', 'https://images.unsplash.com/photo-1542435503-539de82bc852?w=1200', 3),
  (c_id, 'image', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=1200', 4),
  (c_id, 'image', 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=1200', 5),
  (c_id, 'image', 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200', 6),
  (c_id, 'image', 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200', 7),
  (c_id, 'image', 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200', 8);

INSERT INTO capsule_audio (capsule_id, file_url) VALUES
  (c_id, 'https://freesound.org/data/previews/362/362491_6629901-lq.mp3');

-- ============================================================
-- CAPSULE 10 — MELANCHOLIC
-- ============================================================
INSERT INTO capsules (title, short_description, description, theme_color, cover_image_url, visibility, status, creator_id)
VALUES (
  'the drive home after something changed forever',
  'You had not yet told anyone. The radio played something wrong. The world looked the same.',
  'The traffic lights cycled through their colors with absolute indifference. A woman walked a dog. A boy on a bicycle cut through the intersection without looking. None of them knew. The city carried on its conversation with itself as you moved through it, holding something new and enormous inside your chest, alone with it completely, for the last time.',
  '#6B7B8D', 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=1200',
  'public', 'active', NULL
) RETURNING id INTO c_id;

INSERT INTO capsule_notes (capsule_id, note_text, order_index) VALUES
  (c_id, 'car heater on cold glass', 1), (c_id, 'asphalt and exhaust at dusk', 2),
  (c_id, 'leather seat warmth', 3), (c_id, 'faint radio static', 4),
  (c_id, 'your own breath in cold air', 5);

INSERT INTO capsule_hashtags (capsule_id, hashtag, order_index) VALUES
  (c_id, 'threshold', 1), (c_id, 'grief', 2), (c_id, 'transition', 3);

INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index) VALUES
  (c_id, 'image', 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=1200', 1),
  (c_id, 'image', 'https://images.unsplash.com/photo-1502126324834-38f8e02d7160?w=1200', 2),
  (c_id, 'image', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200', 3),
  (c_id, 'image', 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=1200', 4),
  (c_id, 'image', 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1200', 5),
  (c_id, 'image', 'https://images.unsplash.com/photo-1468581264429-2548ef9eb732?w=1200', 6),
  (c_id, 'image', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200', 7),
  (c_id, 'image', 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1200', 8);

INSERT INTO capsule_audio (capsule_id, file_url) VALUES
  (c_id, 'https://freesound.org/data/previews/399/399934_7346540-lq.mp3');

END $$;
