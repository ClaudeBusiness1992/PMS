ALTER TABLE einheiten
  ADD COLUMN IF NOT EXISTS hat_balkon           boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hat_terrasse         boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hat_keller           boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hat_dachboden        boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hat_garage           boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hat_stellplatz       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hat_gasetagenheizung boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS wasser_in_nk         boolean NOT NULL DEFAULT true;
