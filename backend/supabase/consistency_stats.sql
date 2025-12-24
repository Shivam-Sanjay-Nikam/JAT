-- Function to get on-time consistency stats
-- Returns daily counts of tasks that were completed ON the day they were due.

CREATE OR REPLACE FUNCTION get_consistency_stats(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  stat_date DATE,
  total_due BIGINT,
  completed_on_time BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.date as stat_date,
    COUNT(*)::BIGINT as total_due,
    COUNT(CASE WHEN (t.completed_at AT TIME ZONE 'UTC')::DATE = t.date THEN 1 END)::BIGINT as completed_on_time
  FROM todos t
  WHERE
    t.user_id = auth.uid()
    AND t.date >= start_date
    AND t.date <= end_date
  GROUP BY t.date
  ORDER BY t.date;
END;
$$;
