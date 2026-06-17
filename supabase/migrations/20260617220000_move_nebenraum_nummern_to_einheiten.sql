ALTER TABLE einheiten
  ADD COLUMN IF NOT EXISTS keller_nr     text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS dachboden_nr  text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS garage_nr     text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS stellplatz_nr text NOT NULL DEFAULT '';

ALTER TABLE mietverhaeltnisse
  DROP COLUMN IF EXISTS keller_nr,
  DROP COLUMN IF EXISTS dachboden_nr,
  DROP COLUMN IF EXISTS garage_nr,
  DROP COLUMN IF EXISTS stellplatz_nr;
