-- TODOS TABLE
-- Stores individual todo items for users
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL DEFAULT CURRENT_DATE, -- The date this todo belongs to
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DAILY COMPLETIONS TABLE
-- Tracks daily completion statistics for streak calendar
CREATE TABLE daily_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  total_tasks INTEGER NOT NULL DEFAULT 0,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  completion_percentage INTEGER NOT NULL DEFAULT 0, -- 0-100
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date) -- One record per user per day
);

-- INDEXES for performance
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_user_date ON todos(user_id, date);
CREATE INDEX idx_todos_date ON todos(date);
CREATE INDEX idx_daily_completions_user_id ON daily_completions(user_id);
CREATE INDEX idx_daily_completions_user_date ON daily_completions(user_id, date);
CREATE INDEX idx_daily_completions_date ON daily_completions(date);

-- TRIGGER for updated_at on todos
CREATE TRIGGER update_todos_updated_at
BEFORE UPDATE ON todos
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- TRIGGER for updated_at on daily_completions
CREATE TRIGGER update_daily_completions_updated_at
BEFORE UPDATE ON daily_completions
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
