-- Enable RLS on todos table
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Enable RLS on daily_completions table
ALTER TABLE daily_completions ENABLE ROW LEVEL SECURITY;

-- TODOS POLICIES
-- Users can view their own todos
CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own todos
CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own todos
CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own todos
CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);

-- DAILY COMPLETIONS POLICIES
-- Users can view their own daily completions
CREATE POLICY "Users can view own daily completions"
  ON daily_completions FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service role to insert/update daily completions (for Edge Functions)
-- Users can also insert their own records
CREATE POLICY "Users can insert own daily completions"
  ON daily_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own daily completions
CREATE POLICY "Users can update own daily completions"
  ON daily_completions FOR UPDATE
  USING (auth.uid() = user_id);
