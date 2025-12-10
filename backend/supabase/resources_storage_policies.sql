-- Storage policies for the 'resources' bucket
-- This bucket stores PDF files uploaded by users

-- Policy: Allow authenticated users to upload files to their own folder
-- Structure: resources/{user_id}/{filename}
CREATE POLICY "Allow authenticated users to upload resources"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resources' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to view their own uploaded resources
CREATE POLICY "Allow users to view their own resources"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resources' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to delete their own resources
CREATE POLICY "Allow users to delete their own resources"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'resources' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to update their own resources (if needed)
CREATE POLICY "Allow users to update their own resources"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resources' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
