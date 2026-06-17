ALTER TABLE mietverhaeltnisse
  ADD COLUMN IF NOT EXISTS keller_nr    text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS dachboden_nr text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS garage_nr    text NOT NULL DEFAULT '';
