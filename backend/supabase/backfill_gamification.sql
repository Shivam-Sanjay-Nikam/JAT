-- BACKFILL GAMIFICATION STATS
-- This script calculates EXP for all past completed tasks that haven't been rated yet.
-- It assigns 10 EXP (equivalent to a 3-star neutral/good rating) for each legacy task.

DO $$
DECLARE
    u RECORD;
    completed_count INTEGER;
    xp_to_add INTEGER;
    base_xp CONSTANT INTEGER := 10; 
    
    -- Vars for loop
    curr_level INTEGER;
    curr_exp INTEGER;
    tot_exp INTEGER;
    exp_req INTEGER;
BEGIN
    RAISE NOTICE 'Starting Gamification Backfill...';

    FOR u IN SELECT id FROM auth.users LOOP
        -- 1. Count unrated completed todos
        SELECT COUNT(*) INTO completed_count 
        FROM todos 
        WHERE user_id = u.id 
        AND is_completed = true 
        AND rating IS NULL;
        
        IF completed_count > 0 THEN
            RAISE NOTICE 'User % has % unrated completed tasks.', u.id, completed_count;
            
            xp_to_add := completed_count * base_xp;
            
            -- 2. Ensure user has stats row
            INSERT INTO user_gamification (user_id) VALUES (u.id) 
            ON CONFLICT (user_id) DO NOTHING;
            
            -- 3. Get current stats
            SELECT level, current_exp, total_exp 
            INTO curr_level, curr_exp, tot_exp 
            FROM user_gamification 
            WHERE user_id = u.id;
            
            -- 4. Add XP
            tot_exp := tot_exp + xp_to_add;
            curr_exp := curr_exp + xp_to_add;
            
            -- 5. Calculate Level Up
            -- Formula: Level * 100 XP to next level
            LOOP
                exp_req := curr_level * 100;
                IF curr_exp >= exp_req THEN
                    curr_exp := curr_exp - exp_req;
                    curr_level := curr_level + 1;
                ELSE
                    EXIT;
                END IF;
            END LOOP;
            
            -- 6. Update User Stats
            UPDATE user_gamification 
            SET 
                level = curr_level, 
                current_exp = curr_exp, 
                total_exp = tot_exp,
                updated_at = NOW()
            WHERE user_id = u.id;
            
            -- 7. Mark todos as rated (using 3 stars = 0.8x usually, but here we just gave flat 10. 
            -- Let's set rating to 4 (1.0x) to match the logic roughly or just leave it distinctive.
            -- Actually, if we set rating to 4, it implies 10 * 1.0 = 10. Perfect.)
            UPDATE todos 
            SET rating = 4 
            WHERE user_id = u.id 
            AND is_completed = true 
            AND rating IS NULL;
            
            RAISE NOTICE 'Updated User %: Level %, Total XP %', u.id, curr_level, tot_exp;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Backfill Completed.';
END $$;
