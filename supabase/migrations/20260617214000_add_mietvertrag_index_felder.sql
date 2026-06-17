ALTER TABLE mietverhaeltnisse
  ADD COLUMN IF NOT EXISTS index_bezugsmonat  text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS index_ausgangswert text NOT NULL DEFAULT '';
