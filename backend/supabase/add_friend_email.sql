-- Add friend_email column to friends table to store friend's email
ALTER TABLE friends ADD COLUMN IF NOT EXISTS friend_email TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_friends_friend_email ON friends(friend_email);

