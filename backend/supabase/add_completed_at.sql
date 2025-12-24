-- Add completed_at column to todos table
ALTER TABLE todos ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_todos_completed_at ON todos(completed_at);

-- Function to get productivity stats (completions per day)
CREATE OR REPLACE FUNCTION get_productivity_stats(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  completion_date DATE,
  task_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (completed_at AT TIME ZONE 'UTC')::DATE as completion_date,
    COUNT(*) as task_count
  FROM todos
  WHERE
    user_id = auth.uid()
    AND is_completed = true
    AND completed_at IS NOT NULL
    AND (completed_at AT TIME ZONE 'UTC')::DATE >= start_date
    AND (completed_at AT TIME ZONE 'UTC')::DATE <= end_date
  GROUP BY (completed_at AT TIME ZONE 'UTC')::DATE
  ORDER BY (completed_at AT TIME ZONE 'UTC')::DATE;
END;
$$;
