-- RLS Policies for resources table
-- Allow authenticated users to manage their own resources

-- Enable RLS on resources table (if not already enabled)
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view their own resources
CREATE POLICY "Users can view their own resources"
ON resources
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Allow users to insert their own resources
CREATE POLICY "Users can insert their own resources"
ON resources
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to update their own resources
CREATE POLICY "Users can update their own resources"
ON resources
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to delete their own resources
CREATE POLICY "Users can delete their own resources"
ON resources
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
