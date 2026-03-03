-- Phase 4: Storage Configuration
-- This script sets up the 'capsule-media' storage bucket and its security policies.

-- 1. Create Bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'capsule-media', 
  'capsule-media', 
  true, 
  52428800, -- 50MB Limit
  ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'video/mp4', 
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'audio/mp3'
  ]
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm',
    'audio/mpeg', 'audio/wav', 'audio/mp3'
  ];

-- 2. RLS Policies for Storage
-- Note: Storage policies usually live on the 'storage.objects' table.

-- Policy: Public Read Access
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING ( bucket_id = 'capsule-media' );

-- Policy: Authenticated Upload Access
-- Allows authenticated users to upload files to the capsule-media bucket.
-- Constraint: Users can only upload to a folder named after their user ID to prevent overwriting others.
-- Path Structure: capsule-media/{user_id}/{filename}
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'capsule-media' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Owner Update/Delete Access
-- Users can update/delete their own files.
DROP POLICY IF EXISTS "Owner Update Delete" ON storage.objects;
CREATE POLICY "Owner Update Delete" ON storage.objects
  FOR ALL USING (
    bucket_id = 'capsule-media' 
    AND auth.uid() = owner
  );

-- Confirmation
SELECT * FROM storage.buckets WHERE id = 'capsule-media';
