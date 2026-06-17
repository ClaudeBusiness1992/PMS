ALTER TABLE mietverhaeltnisse
  ADD COLUMN IF NOT EXISTS ist_indexmiete    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ist_vollmoebliert boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ist_teilmoebliert boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hat_einbaukueche  boolean NOT NULL DEFAULT false;
