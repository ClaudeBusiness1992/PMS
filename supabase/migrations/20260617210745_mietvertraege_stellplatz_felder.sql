ALTER TABLE mietverhaeltnisse
  ADD COLUMN IF NOT EXISTS schluessel_stellplatz text NOT NULL DEFAULT '0',
  ADD COLUMN IF NOT EXISTS stellplatz_nr         text NOT NULL DEFAULT '';
