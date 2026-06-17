ALTER TABLE mietverhaeltnisse
  ADD COLUMN IF NOT EXISTS staffel_jahre text NOT NULL DEFAULT '5';
