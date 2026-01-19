-- ⚠️ RESET SCRIPT ⚠️
-- This script will DELETE all tasks and RESET all levels/exp to 0.

BEGIN;

    -- 1. Delete all tasks (Todos)
    DELETE FROM todos;

    -- 2. Reset User Gamification Stats
    UPDATE user_gamification
    SET 
        level = 1,
        current_exp = 0,
        total_exp = 0,
        updated_at = NOW();

COMMIT;

-- Returns the status of users to verify reset
SELECT * FROM user_gamification;
