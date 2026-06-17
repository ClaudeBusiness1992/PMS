-- 006: Wasser-Feld, Garage statt Sonstige, Tierhaltung entfernen

alter table mietverhaeltnisse
  add column if not exists wasser_vz    text    not null default '',
  add column if not exists wasser_in_nk boolean not null default true,
  add column if not exists schluessel_garage text not null default '0';

-- schluessel_sonstige → schluessel_garage (Daten übernehmen, Spalte umbenennen)
update mietverhaeltnisse
  set schluessel_garage = schluessel_sonstige
  where schluessel_sonstige <> '';

alter table mietverhaeltnisse
  drop column if exists schluessel_sonstige,
  drop column if exists tierhaltung;

-- Keller-Default auf 0 setzen (nur für neue Einträge relevant, bestehende behalten ihren Wert)
alter table mietverhaeltnisse
  alter column schluessel_keller set default '0';
