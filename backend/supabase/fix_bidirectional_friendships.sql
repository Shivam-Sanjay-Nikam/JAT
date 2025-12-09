-- Script to fix all one-way friendships and make them bidirectional
-- This ensures every friendship has both directions: A->B and B->A

-- Step 1: Find all one-way friendships (where reverse doesn't exist)
-- and create the missing reverse records

INSERT INTO friends (user_id, friend_id, friend_email)
SELECT 
    f.friend_id as user_id,           -- Swap: friend becomes user
    f.user_id as friend_id,            -- Swap: user becomes friend
    u.email as friend_email            -- Get the email from auth.users
FROM friends f
JOIN auth.users u ON f.user_id = u.id  -- Get email of the original user
WHERE NOT EXISTS (
    -- Check if reverse friendship already exists
    SELECT 1 FROM friends f2
    WHERE f2.user_id = f.friend_id 
      AND f2.friend_id = f.user_id
)
ON CONFLICT (user_id, friend_id) DO NOTHING;

-- Step 2: Verify all friendships are now bidirectional
-- This query should return 0 rows if everything is fixed
SELECT 
    f.id,
    u1.email as user_email,
    u2.email as friend_email,
    'MISSING REVERSE' as issue
FROM friends f
JOIN auth.users u1 ON f.user_id = u1.id
JOIN auth.users u2 ON f.friend_id = u2.id
WHERE NOT EXISTS (
    SELECT 1 FROM friends f2
    WHERE f2.user_id = f.friend_id 
      AND f2.friend_id = f.user_id
);

-- Step 3: Show all friendships to verify
SELECT 
    u1.email as user_email,
    u2.email as friend_email,
    f.created_at
FROM friends f
JOIN auth.users u1 ON f.user_id = u1.id
JOIN auth.users u2 ON f.friend_id = u2.id
ORDER BY u1.email, f.created_at DESC;
