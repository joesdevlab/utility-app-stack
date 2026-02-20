-- Migration: Add photos support to apprentice entries
-- This adds a photos column and creates a storage bucket for entry photos

-- Add photos column to apprentice_entries table
ALTER TABLE apprentice_entries
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- Create index for entries with photos (for filtering)
CREATE INDEX IF NOT EXISTS idx_apprentice_entries_has_photos
ON apprentice_entries ((array_length(photos, 1) > 0))
WHERE array_length(photos, 1) > 0;

-- Create storage bucket for entry photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'entry-photos',
  'entry-photos',
  false,  -- Private bucket
  10485760,  -- 10MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for entry-photos bucket

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload photos to their folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'entry-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own photos
CREATE POLICY "Users can view their own photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'entry-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own photos
CREATE POLICY "Users can update their own photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'entry-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'entry-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow employers to view photos of their apprentices
-- This uses the existing organization_members relationship
CREATE POLICY "Employers can view apprentice photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'entry-photos' AND
  EXISTS (
    SELECT 1 FROM organization_members om_viewer
    JOIN organization_members om_owner ON om_viewer.organization_id = om_owner.organization_id
    WHERE om_viewer.user_id = auth.uid()
    AND om_viewer.role IN ('owner', 'admin', 'supervisor')
    AND om_owner.user_id = (storage.foldername(name))[1]::uuid
    AND om_owner.role = 'apprentice'
  )
);
