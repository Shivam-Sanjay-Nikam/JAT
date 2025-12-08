-- Add sender_email column to friend_requests table to store sender's email
ALTER TABLE friend_requests ADD COLUMN IF NOT EXISTS sender_email TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender_email ON friend_requests(sender_email);

