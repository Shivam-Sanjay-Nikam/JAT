-- Migration script to fix existing friendships with missing/incorrect friend_email values
-- Run this in Supabase SQL Editor

-- This script updates the friend_email field in the friends table by looking up
-- the actual email from auth.users for each friend_id

-- Update friend_email for all existing friendships
UPDATE friends
SET friend_email = auth.users.email
FROM auth.users
WHERE friends.friend_id = auth.users.id
  AND (friends.friend_email IS NULL OR friends.friend_email = '');

-- Verify the update
SELECT 
    f.id,
    f.user_id,
    u1.email as user_email,
    f.friend_id,
    u2.email as actual_friend_email,
    f.friend_email as stored_friend_email,
    CASE 
        WHEN f.friend_email = u2.email THEN 'CORRECT'
        ELSE 'NEEDS_FIX'
    END as status
FROM friends f
JOIN auth.users u1 ON f.user_id = u1.id
JOIN auth.users u2 ON f.friend_id = u2.id
ORDER BY f.created_at DESC;

-- If you see any with status 'NEEDS_FIX', run this to fix them:
-- UPDATE friends
-- SET friend_email = auth.users.email
-- FROM auth.users
-- WHERE friends.friend_id = auth.users.id;
