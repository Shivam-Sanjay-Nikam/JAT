-- Backfill completed_at for existing completed tasks
-- We use updated_at as a best-guess proxy for when the task was completed.

UPDATE todos
SET completed_at = updated_at
WHERE is_completed = true
  AND completed_at IS NULL;

-- Optional: If you prefer to stick strictly to the "Due Date" for legacy tasks,
-- you could use this instead (uncomment to use):
-- UPDATE todos
-- SET completed_at = (date || ' 12:00:00')::timestamptz
-- WHERE is_completed = true
--   AND completed_at IS NULL;
