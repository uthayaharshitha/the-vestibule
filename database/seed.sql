-- Seed Data for Emotional Capsule Platform
-- Run this in your Supabase SQL Editor to populate the app with sample content

-- 1. Create an Admin User (Optional, but good for ownership)
-- We'll insert a dummy user to be the creator
INSERT INTO users (id, role, is_anonymous, pseudonym)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin', false, 'System Curator')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Capsules
INSERT INTO capsules (id, title, description, status, visibility, background_color, creator_id)
VALUES
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 
    'Midnight Laundromat', 
    'The hum of machines and the smell of fabric softener. A place where time stands still at 2 AM.', 
    'active', 
    'public', 
    '#1a1a2e',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  ),
  (
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 
    'Sunken Cathedral', 
    'Light filtering through deep water. Muted sounds and ancient stones resting in silence.', 
    'active', 
    'public', 
    '#0f2a3f',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  ),
  (
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 
    'Empty Airport Terminal', 
    'The echo of footsteps on polished floors. Departures board flickering with cancelled flights.', 
    'active', 
    'public', 
    '#2c3e50',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  );

-- 3. Insert Media (Using placeholder images)
INSERT INTO capsule_media (capsule_id, media_type, file_url, order_index)
VALUES
  -- Midnight Laundromat Images
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'image', 'https://images.unsplash.com/photo-1545173168-9f1947eebb8f?auto=format&fit=crop&w=800&q=80', 1),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'image', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80', 2),
  
  -- Sunken Cathedral Images
  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'image', 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80', 1),
  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'image', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', 2),

  -- Airport Images
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'image', 'https://images.unsplash.com/photo-1473862170180-84427c485aca?auto=format&fit=crop&w=800&q=80', 1);

-- 4. Insert Sensory Notes
INSERT INTO capsule_notes (capsule_id, note_text, order_index)
VALUES
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Warm Linen', 1),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Fluorescent Hum', 2),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Rain on Glass', 3),
  
  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'Salt Water', 1),
  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'Cold Stone', 2),
  
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'Floor Wax', 1),
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'Distant Announcement', 2);

-- 5. Insert Sample Audio (Placeholder)
INSERT INTO capsule_audio (capsule_id, file_url, duration_seconds)
VALUES
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b8f8d754.mp3', 120);
