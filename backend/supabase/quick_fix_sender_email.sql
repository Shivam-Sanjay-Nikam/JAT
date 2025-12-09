-- Quick fix: Add missing columns to friend_requests and friends tables
-- Run this in Supabase SQL Editor if you don't want to recreate the entire database

-- Add sender_email to friend_requests table
ALTER TABLE friend_requests ADD COLUMN IF NOT EXISTS sender_email TEXT;
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender_email ON friend_requests(sender_email);

-- Add friend_email to friends table
ALTER TABLE friends ADD COLUMN IF NOT EXISTS friend_email TEXT;
CREATE INDEX IF NOT EXISTS idx_friends_friend_email ON friends(friend_email);
