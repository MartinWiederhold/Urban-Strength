-- Add recurring_end_date to availability slots
ALTER TABLE availability
  ADD COLUMN IF NOT EXISTS recurring_end_date DATE NULL;

COMMENT ON COLUMN availability.recurring_end_date IS 'Optional end date for weekly recurring slots. NULL = repeats indefinitely.';
