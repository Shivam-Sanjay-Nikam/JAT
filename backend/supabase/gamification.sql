-- GAMIFICATION SCHEMA

-- 1. Create table for User Stats
CREATE TABLE IF NOT EXISTS user_gamification (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
    level INTEGER DEFAULT 1 NOT NULL,
    current_exp INTEGER DEFAULT 0 NOT NULL,
    total_exp INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_gamification_user_id ON user_gamification(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_gamification_updated_at
BEFORE UPDATE ON user_gamification
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();


-- 2. Add Gamification columns to Todos table
ALTER TABLE todos 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS exp_value INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS rating INTEGER; -- 1 to 5 stars


-- 3. Function to initialize gamification stats for new users
CREATE OR REPLACE FUNCTION initialize_user_gamification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_gamification (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create stats on user signup
-- Note: You might need to check if this trigger already exists or if you handle user creation differently.
-- Dropping if exists to be safe and re-creating
DROP TRIGGER IF EXISTS on_auth_user_created_gamification ON auth.users;
CREATE TRIGGER on_auth_user_created_gamification
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE initialize_user_gamification();

-- Also, backfill for existing users if any
INSERT INTO public.user_gamification (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;


-- 4. RPC Function to Complete Todo with Rating and Award EXP
CREATE OR REPLACE FUNCTION complete_todo_with_rating(
    todo_id UUID,
    rating_val INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    todo_record RECORD;
    user_stats RECORD;
    xp_gained INTEGER;
    xp_multiplier NUMERIC;
    new_level INTEGER;
    new_current_exp INTEGER;
    new_total_exp INTEGER;
    exp_needed_next_level INTEGER;
    user_id_val UUID;
BEGIN
    -- Get Todo
    SELECT * INTO todo_record FROM todos WHERE id = todo_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Todo not found';
    END IF;

    -- Check if already completed? 
    -- If allowing re-rating, we'd need complex logic to revert old XP. 
    -- For simplicity, assuming this is called ONLY when marking as completed from uncompleted state.
    
    user_id_val := todo_record.user_id;
    
    -- Verify User (security check mainly for RLS but good here too)
    IF user_id_val != auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    -- Calculate XP Multiplier
    -- 1 star = 0.4, 2 = 0.6, 3 = 0.8, 4 = 1.0, 5 = 1.2
    IF rating_val = 1 THEN xp_multiplier := 0.4;
    ELSIF rating_val = 2 THEN xp_multiplier := 0.6;
    ELSIF rating_val = 3 THEN xp_multiplier := 0.8;
    ELSIF rating_val = 4 THEN xp_multiplier := 1.0;
    ELSIF rating_val = 5 THEN xp_multiplier := 1.2;
    ELSE xp_multiplier := 1.0; -- Default
    END IF;

    xp_gained := FLOOR(todo_record.exp_value * xp_multiplier);

    -- Update Todo
    UPDATE todos 
    SET 
        is_completed = TRUE,
        completed_at = NOW(),
        rating = rating_val
    WHERE id = todo_id;

    -- Get User Stats
    SELECT * INTO user_stats FROM user_gamification WHERE user_id = user_id_val;
    IF NOT FOUND THEN
        -- Should have been created by trigger, but just in case
        INSERT INTO user_gamification (user_id) VALUES (user_id_val) RETURNING * INTO user_stats;
    END IF;

    new_total_exp := user_stats.total_exp + xp_gained;
    new_current_exp := user_stats.current_exp + xp_gained;
    new_level := user_stats.level;
    
    -- Level Up Logic
    -- Formula: Level * 100 XP needed for next level
    -- e.g. Lvl 1 -> 100XP. Lvl 2 -> 200XP.
    LOOP
        exp_needed_next_level := new_level * 100;
        IF new_current_exp >= exp_needed_next_level THEN
            new_current_exp := new_current_exp - exp_needed_next_level;
            new_level := new_level + 1;
        ELSE
            EXIT;
        END IF;
    END LOOP;

    -- Update User Stats
    UPDATE user_gamification
    SET 
        level = new_level,
        current_exp = new_current_exp,
        total_exp = new_total_exp
    WHERE id = user_stats.id;

    RETURN jsonb_build_object(
        'xp_gained', xp_gained,
        'new_level', new_level,
        'leveled_up', (new_level > user_stats.level),
        'current_exp', new_current_exp,
        'next_level_exp', (new_level * 100)
    );
END;
$$;
