-- ============================================================
-- LIMINAL SPACES — CAPSULE SEED (11–20)
-- Run in Supabase SQL Editor as service role (bypasses RLS)
-- ============================================================

DO $$
DECLARE
  c_id UUID;
BEGIN

-- ============================================================
-- CAPSULE 11 — EERIE / UNCANNY
-- ============================================================
INSERT INTO capsules (title, short_description, description, theme_color, cover_image_url, visibility, status, creator_id)
VALUES (
  'you wake up in the middle of the night and the hallway feels aware of you',
  'The air has changed. You don''t turn the light on. You are not afraid, exactly.',
  'Every object is in its correct position and still something is wrong. The hallway has assumed a different geometry in the dark — longer, somehow, or attentive. You stand in the doorway for a long time. The house breathes in a rhythm just slightly off from your own. Nothing happens. You go back to bed. You do not sleep immediately.',
  '#1C1C2E', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
  'public', 'active', NULL
) RETURNING id INTO c_id;

INSERT INTO capsule_notes (capsule_id, note_text, order_index) VALUES
  (c_id, 'cool still air at 3am', 1), (c_id, 'old wood floor creak', 2),
  (c_id, 'darkness with faint blue', 3), (c_id, 'your own heartbeat loud', 4),
  (c_id, 'nothing burning something sweet', 5);

INSERT INTO capsule_hashtags (capsule_id, hashtag, order_index) VALUES
  (c_id, 'liminal', 1), (c_id, 'uncanny', 2), (c_id, 'night', 3);

INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index) VALUES
  (c_id, 'image', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200', 1),
  (c_id, 'image', 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1200', 2),
  (c_id, 'image', 'https://images.unsplash.com/photo-1505322022379-7c3353ee6291?w=1200', 3),
  (c_id, 'image', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200', 4),
  (c_id, 'image', 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1200', 5),
  (c_id, 'image', 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=1200', 6),
  (c_id, 'image', 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1200', 7),
  (c_id, 'image', 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=1200', 8),
  (c_id, 'image', 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=1200', 9);

INSERT INTO capsule_audio (capsule_id, file_url) VALUES
  (c_id, 'https://freesound.org/data/previews/459/459977_9497060-lq.mp3');

-- ============================================================
-- CAPSULE 12 — EERIE / UNCANNY
-- ============================================================
INSERT INTO capsules (title, short_description, description, theme_color, cover_image_url, visibility, status, creator_id)
VALUES (
  'the swimming pool at the end of summer with no one in it',
  'The water holds the shape of everyone who was there. You are the only one left.',
  'Leaf debris circles in slow orbit. The lane dividers drift in a wind you can''t feel. There is a towel still on the back of a chair that no one has claimed. The pool is a perfect rectangle of sky laid flat, and you stand at its edge looking down at a reflection of clouds that are passing somewhere above you without any hurry. The season is ending. This is what it looks like.',
  '#4A7B8C', 'https://images.unsplash.com/photo-1572467019513-b9ca7f947a88?w=1200',
  'public', 'active', NULL
) RETURNING id INTO c_id;

INSERT INTO capsule_notes (capsule_id, note_text, order_index) VALUES
  (c_id, 'chlorine on warm concrete', 1), (c_id, 'late summer dry grass', 2),
  (c_id, 'sun lotion fading', 3), (c_id, 'still water and algae', 4),
  (c_id, 'forgotten towel damp', 5), (c_id, 'end-of-day heat leaving stone', 6);

INSERT INTO capsule_hashtags (capsule_id, hashtag, order_index) VALUES
  (c_id, 'liminal', 1), (c_id, 'summer ending', 2), (c_id, 'abandoned', 3);

INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index) VALUES
  (c_id, 'image', 'https://images.unsplash.com/photo-1572467019513-b9ca7f947a88?w=1200', 1),
  (c_id, 'image', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=1200', 2),
  (c_id, 'image', 'https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=1200', 3),
  (c_id, 'image', 'https://images.unsplash.com/photo-1509130872995-86c1159075a8?w=1200', 4),
  (c_id, 'image', 'https://images.unsplash.com/photo-1535745049887-3d1d4dfb6079?w=1200', 5),
  (c_id, 'image', 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1200', 6),
  (c_id, 'image', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200', 7),
  (c_id, 'image', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200', 8);

INSERT INTO capsule_audio (capsule_id, file_url) VALUES
  (c_id, 'https://freesound.org/data/previews/531/531947_11861866-lq.mp3');

-- ============================================================
-- CAPSULE 13 — EERIE / UNCANNY
-- ============================================================
INSERT INTO capsules (title, short_description, description, theme_color, cover_image_url, visibility, status, creator_id)
VALUES (
  'a hotel corridor at 4am when you can''t remember what floor you''re on',
  'All the doors are the same. The carpet pattern repeats. You are not lost. You are between.',
  'The ice machine at the end of the hall makes a sound at irregular intervals that you have started to time your breathing to. Each door has a small glowing number and a peephole like a closed eye. The corridor extends in both directions to a vanishing point that is slightly wrong. You are here correctly — you have a key, a room, a reason. And yet.',
  '#2E2A3B', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200',
  'public', 'active', NULL
) RETURNING id INTO c_id;

INSERT INTO capsule_notes (capsule_id, note_text, order_index) VALUES
  (c_id, 'synthetic carpet and ozone', 1), (c_id, 'ice machine cold exhaust', 2),
  (c_id, 'recycled hotel air', 3), (c_id, 'plastic keycard in palm', 4),
  (c_id, 'hallway silence pressure', 5);

INSERT INTO capsule_hashtags (capsule_id, hashtag, order_index) VALUES
  (c_id, 'liminal spaces', 1), (c_id, 'disorientation', 2), (c_id, 'hotel', 3);

INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index) VALUES
  (c_id, 'image', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200', 1),
  (c_id, 'image', 'https://images.unsplash.com/photo-1551882547-ff40c63fe0f4?w=1200', 2),
  (c_id, 'image', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200', 3),
  (c_id, 'image', 'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=1200', 4),
  (c_id, 'image', 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=1200', 5),
  (c_id, 'image', 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=1200', 6),
  (c_id, 'image', 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200', 7),
  (c_id, 'image', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200', 8),
  (c_id, 'image', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200', 9);

INSERT INTO capsule_audio (capsule_id, file_url) VALUES
  (c_id, 'https://freesound.org/data/previews/416/416054_5121236-lq.mp3');

-- ============================================================
-- CAPSULE 14 — EERIE / UNCANNY
-- ============================================================
INSERT INTO capsules (title, short_description, description, theme_color, cover_image_url, visibility, status, creator_id)
VALUES (
  'the shopping mall the year before it closed forever',
  'The fountain still ran. The food court was two-thirds empty. The muzak continued regardless.',
  'You could already feel the future in the gaps between the stores — the blank storefronts with their paper-covered windows, the faint recollection of what used to be there. A few teenagers circled the atrium for reasons that had nothing to do with shopping. The skylights let in a particular quality of afternoon light that made everything look like a memory of itself. The clock above the food court was right twice a day and both times felt significant.',
  '#B5A898', 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200',
  'public', 'active', NULL
) RETURNING id INTO c_id;

INSERT INTO capsule_notes (capsule_id, note_text, order_index) VALUES
  (c_id, 'food court grease and cinnamon', 1), (c_id, 'fountain coin water', 2),
  (c_id, 'synthetic carpet cleaner', 3), (c_id, 'cool atrium air', 4),
  (c_id, 'department store perfume plume', 5);

INSERT INTO capsule_hashtags (capsule_id, hashtag, order_index) VALUES
  (c_id, 'decay', 1), (c_id, 'liminal spaces', 2), (c_id, 'commerce', 3);

INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index) VALUES
  (c_id, 'image', 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200', 1),
  (c_id, 'image', 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=1200', 2),
  (c_id, 'image', 'https://images.unsplash.com/photo-1519011985188-f88e00a0e7f4?w=1200', 3),
  (c_id, 'image', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200', 4),
  (c_id, 'image', 'https://images.unsplash.com/photo-1477118476589-bff2c5c4cfbb?w=1200', 5),
  (c_id, 'image', 'https://images.unsplash.com/photo-1567361808960-dec9cb578182?w=1200', 6),
  (c_id, 'image', 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=1200', 7),
  (c_id, 'image', 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1200', 8);

INSERT INTO capsule_audio (capsule_id, file_url) VALUES
  (c_id, 'https://freesound.org/data/previews/346/346542_5858028-lq.mp3');

-- ============================================================
-- CAPSULE 15 — EERIE / UNCANNY
-- ============================================================
INSERT INTO capsules (title, short_description, description, theme_color, cover_image_url, visibility, status, creator_id)
VALUES (
  'the photograph in the antique store where everyone is looking at the camera except one person',
  'She is looking at something just outside the frame. She has been looking at it for a hundred years.',
  'The family is formal, arranged. Three generations compressed into a single afternoon. Everyone performs their relationship to the camera correctly except the woman on the left edge, who is turned slightly, attention caught by something that has now completely ceased to exist. You stood in the antique store for longer than you meant to. You did not buy the photograph. You thought about her for weeks.',
  '#8C7B6B', 'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=1200',
  'public', 'active', NULL
) RETURNING id INTO c_id;

INSERT INTO capsule_notes (capsule_id, note_text, order_index) VALUES
  (c_id, 'old paper and silver', 1), (c_id, 'antique wood and dust', 2),
  (c_id, 'faint camphor', 3), (c_id, 'cool photograph edges', 4),
  (c_id, 'time and stillness', 5);

INSERT INTO capsule_hashtags (capsule_id, hashtag, order_index) VALUES
  (c_id, 'uncanny', 1), (c_id, 'photography', 2), (c_id, 'the past', 3);

INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index) VALUES
  (c_id, 'image', 'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=1200', 1),
  (c_id, 'image', 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=1200', 2),
  (c_id, 'image', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200', 3),
  (c_id, 'image', 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200', 4),
  (c_id, 'image', 'https://images.unsplash.com/photo-1550159930-40066082a4fc?w=1200', 5),
  (c_id, 'image', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200', 6),
  (c_id, 'image', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200', 7),
  (c_id, 'image', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200', 8);

INSERT INTO capsule_audio (capsule_id, file_url) VALUES
  (c_id, 'https://freesound.org/data/previews/362/362491_6629901-lq.mp3');

-- ============================================================
-- CAPSULE 16 — EUPHORIC / BITTERSWEET
-- ============================================================
INSERT INTO capsules (title, short_description, description, theme_color, cover_image_url, visibility, status, creator_id)
VALUES (
  'the night everything was possible and you knew it while it was happening',
  'Someone opened a window. The music was right. You were exactly the right age for this moment.',
  'You were aware, in real time, that this was one of those nights. That awareness didn''t ruin it — it made it luminous. The people around you were mid-laugh, mid-conversation, mid-becoming. The city below was performing its usual indifference and you felt briefly, specifically loved by it anyway. You stayed too late and walked home in the warmth and the whole way back you thought: I will remember this.',
  '#C4956A', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
  'public', 'active', NULL
) RETURNING id INTO c_id;

INSERT INTO capsule_notes (capsule_id, note_text, order_index) VALUES
  (c_id, 'warm city air at midnight', 1), (c_id, 'spilled wine and laughter', 2),
  (c_id, 'someone''s cologne at a party', 3), (c_id, 'night-blooming jasmine', 4),
  (c_id, 'smoke from outside a venue', 5), (c_id, 'pavement warm from the day', 6);

INSERT INTO capsule_hashtags (capsule_id, hashtag, order_index) VALUES
  (c_id, 'euphoria', 1), (c_id, 'youth', 2), (c_id, 'city nights', 3);

INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index) VALUES
  (c_id, 'image', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200', 1),
  (c_id, 'image', 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200', 2),
  (c_id, 'image', 'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?w=1200', 3),
  (c_id, 'image', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200', 4),
  (c_id, 'image', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200', 5),
  (c_id, 'image', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200', 6),
  (c_id, 'image', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200', 7),
  (c_id, 'image', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200', 8),
  (c_id, 'image', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200', 9);

INSERT INTO capsule_audio (capsule_id, file_url) VALUES
  (c_id, 'https://freesound.org/data/previews/399/399934_7346540-lq.mp3');

-- ============================================================
-- CAPSULE 17 — EUPHORIC / BITTERSWEET
-- ============================================================
INSERT INTO capsules (title, short_description, description, theme_color, cover_image_url, visibility, status, creator_id)
VALUES (
  'the morning after you finally told the truth',
  'The air tasted different. Everything was the same and lighter. You had not expected relief to feel like grief''s opposite.',
  'You had carried it so long that you had forgotten its weight. Then you spoke it aloud and it left you — not all at once, but like a tide going out, slowly revealing something underneath. The morning was ordinary. Coffee, sunlight through a window, the sound of traffic. You sat with the new quiet inside yourself and did not rush to fill it. This is what it feels like to be done pretending.',
  '#E8C4A0', 'https://images.unsplash.com/photo-1504253163759-c23fccaebb55?w=1200',
  'public', 'active', NULL
) RETURNING id INTO c_id;

INSERT INTO capsule_notes (capsule_id, note_text, order_index) VALUES
  (c_id, 'morning coffee first sip', 1), (c_id, 'clean laundry air', 2),
  (c_id, 'sunlight through dusty window', 3), (c_id, 'slow warm exhale', 4),
  (c_id, 'rain ending petrichor', 5);

INSERT INTO capsule_hashtags (capsule_id, hashtag, order_index) VALUES
  (c_id, 'honesty', 1), (c_id, 'relief', 2), (c_id, 'beginning', 3);

INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index) VALUES
  (c_id, 'image', 'https://images.unsplash.com/photo-1504253163759-c23fccaebb55?w=1200', 1),
  (c_id, 'image', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200', 2),
  (c_id, 'image', 'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=1200', 3),
  (c_id, 'image', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200', 4),
  (c_id, 'image', 'https://images.unsplash.com/photo-1476611338391-6f395a0dd82e?w=1200', 5),
  (c_id, 'image', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200', 6),
  (c_id, 'image', 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200', 7),
  (c_id, 'image', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200', 8);

INSERT INTO capsule_audio (capsule_id, file_url) VALUES
  (c_id, 'https://freesound.org/data/previews/531/531947_11861866-lq.mp3');

-- ============================================================
-- CAPSULE 18 — EUPHORIC / BITTERSWEET
-- ============================================================
INSERT INTO capsules (title, short_description, description, theme_color, cover_image_url, visibility, status, creator_id)
VALUES (
  'dancing alone in the kitchen at 11pm to a song no one else knows',
  'The tiles are cold. The window is dark. You are completely, perfectly unobserved.',
  'There is a version of joy that requires no audience. You found it here, in the gap between dinner and sleep, moving without any particular technique around a room that does not care what you look like. The overhead light was too bright so you turned it off. The song asked something of you and you gave it everything. You were laughing a little by the end, though there was nothing funny.',
  '#D4A5A5', 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=1200',
  'public', 'active', NULL
) RETURNING id INTO c_id;

INSERT INTO capsule_notes (capsule_id, note_text, order_index) VALUES
  (c_id, 'cool kitchen tile at night', 1), (c_id, 'leftover dinner warmth', 2),
  (c_id, 'dish soap and warm water', 3), (c_id, 'your own sweat and movement', 4),
  (c_id, 'dark window cold glass', 5);

INSERT INTO capsule_hashtags (capsule_id, hashtag, order_index) VALUES
  (c_id, 'joy', 1), (c_id, 'solitude', 2), (c_id, 'dancing', 3);

INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index) VALUES
  (c_id, 'image', 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=1200', 1),
  (c_id, 'image', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200', 2),
  (c_id, 'image', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200', 3),
  (c_id, 'image', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200', 4),
  (c_id, 'image', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200', 5),
  (c_id, 'image', 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200', 6),
  (c_id, 'image', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200', 7),
  (c_id, 'image', 'https://images.unsplash.com/photo-1494253109108-2e30c049369b?w=1200', 8);

INSERT INTO capsule_audio (capsule_id, file_url) VALUES
  (c_id, 'https://freesound.org/data/previews/416/416054_5121236-lq.mp3');

-- ============================================================
-- CAPSULE 19 — EUPHORIC / BITTERSWEET
-- ============================================================
INSERT INTO capsules (title, short_description, description, theme_color, cover_image_url, visibility, status, creator_id)
VALUES (
  'the last day of a trip when you''ve already started to miss it',
  'You are still here. You are also already gone. The light is doing something specific to the buildings.',
  'You walked slower on purpose. You ordered the same thing twice, from the same place, as if repetition could extend time. You took photographs of things that would not photograph — the feeling of cobblestones, the particular color the sky went at 5pm, the way the city smelled like itself and nothing else. On the plane you watched the lights shrink away and felt something sharp and clean. You had been somewhere real.',
  '#9EADBA', 'https://images.unsplash.com/photo-1499856374639-a5dd5d9b5c73?w=1200',
  'public', 'active', NULL
) RETURNING id INTO c_id;

INSERT INTO capsule_notes (capsule_id, note_text, order_index) VALUES
  (c_id, 'foreign bakery morning', 1), (c_id, 'cobblestone and rain', 2),
  (c_id, 'airplane cabin recycled air', 3), (c_id, 'sunscreen and walking sweat', 4),
  (c_id, 'last coffee of the trip', 5), (c_id, 'hotel soap one final time', 6);

INSERT INTO capsule_hashtags (capsule_id, hashtag, order_index) VALUES
  (c_id, 'travel', 1), (c_id, 'bittersweet', 2), (c_id, 'leaving', 3);

INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index) VALUES
  (c_id, 'image', 'https://images.unsplash.com/photo-1499856374639-a5dd5d9b5c73?w=1200', 1),
  (c_id, 'image', 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=1200', 2),
  (c_id, 'image', 'https://images.unsplash.com/photo-1493997181344-712f2f19d87a?w=1200', 3),
  (c_id, 'image', 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200', 4),
  (c_id, 'image', 'https://images.unsplash.com/photo-1502747812021-0ae746b6c23b?w=1200', 5),
  (c_id, 'image', 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1200', 6),
  (c_id, 'image', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200', 7),
  (c_id, 'image', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200', 8),
  (c_id, 'image', 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200', 9);

INSERT INTO capsule_audio (capsule_id, file_url) VALUES
  (c_id, 'https://freesound.org/data/previews/346/346542_5858028-lq.mp3');

-- ============================================================
-- CAPSULE 20 — EUPHORIC / BITTERSWEET
-- ============================================================
INSERT INTO capsules (title, short_description, description, theme_color, cover_image_url, visibility, status, creator_id)
VALUES (
  'the moment on the train when you realize you are finally becoming someone you like',
  'It came without announcement. You were simply sitting there, and then you were different about yourself.',
  'Nothing had changed except your posture, or the quality of light, or some interior rearrangement you were not present for. You watched the landscape move past — fields, towns, the backs of buildings — and felt, for the first time in a long time, recognizable to yourself. Not happy, exactly. More than that. Settled. Like returning to a room you had not known you missed.',
  '#A8C5B5', 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200',
  'public', 'active', NULL
) RETURNING id INTO c_id;

INSERT INTO capsule_notes (capsule_id, note_text, order_index) VALUES
  (c_id, 'train window cold glass', 1), (c_id, 'passing fields hay and earth', 2),
  (c_id, 'coffee in a paper cup', 3), (c_id, 'wool coat on vinyl seat', 4),
  (c_id, 'slow exhale unfamiliar calm', 5);

INSERT INTO capsule_hashtags (capsule_id, hashtag, order_index) VALUES
  (c_id, 'becoming', 1), (c_id, 'self', 2), (c_id, 'quiet joy', 3);

INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index) VALUES
  (c_id, 'image', 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200', 1),
  (c_id, 'image', 'https://images.unsplash.com/photo-1504199367641-aba8151af406?w=1200', 2),
  (c_id, 'image', 'https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?w=1200', 3),
  (c_id, 'image', 'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=1200', 4),
  (c_id, 'image', 'https://images.unsplash.com/photo-1455156218388-5e61b526818b?w=1200', 5),
  (c_id, 'image', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200', 6),
  (c_id, 'image', 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200', 7),
  (c_id, 'image', 'https://images.unsplash.com/photo-1468276311594-df7cb65d8df6?w=1200', 8);

INSERT INTO capsule_audio (capsule_id, file_url) VALUES
  (c_id, 'https://freesound.org/data/previews/459/459977_9497060-lq.mp3');

END $$;
