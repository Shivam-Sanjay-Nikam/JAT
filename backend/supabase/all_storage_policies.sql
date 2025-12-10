-- ============================================
-- COMPREHENSIVE STORAGE POLICIES
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- This file contains ALL storage policies for:
-- 1. resumes bucket (for job application resumes)
-- 2. resources bucket (for study materials/PDFs)

-- ============================================
-- RESUMES BUCKET POLICIES
-- ============================================

-- Policy: Allow authenticated users to upload resumes to their own folder
CREATE POLICY "Allow authenticated uploads to resumes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to view their own resumes
CREATE POLICY "Allow users to view their own resumes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to delete their own resumes
CREATE POLICY "Allow users to delete their own resumes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to update their own resumes
CREATE POLICY "Allow users to update their own resumes"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- RESOURCES BUCKET POLICIES
-- ============================================

-- Policy: Allow authenticated users to upload resources to their own folder
CREATE POLICY "Allow authenticated uploads to resources"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resources' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to view their own resources
CREATE POLICY "Allow users to view their own resources in storage"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resources' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to delete their own resources
CREATE POLICY "Allow users to delete their own resources in storage"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'resources' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to update their own resources
CREATE POLICY "Allow users to update their own resources in storage"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resources' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
