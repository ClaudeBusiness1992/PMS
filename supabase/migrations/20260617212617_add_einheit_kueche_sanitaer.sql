ALTER TABLE einheiten
  ADD COLUMN IF NOT EXISTS kueche_typ  text    NOT NULL DEFAULT 'Küche',
  ADD COLUMN IF NOT EXISTS hat_bad     boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS hat_wc      boolean NOT NULL DEFAULT false;
