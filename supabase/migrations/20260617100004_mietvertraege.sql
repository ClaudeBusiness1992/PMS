-- 004: Mietvertraege, Mieter, Staffeln
-- Ersetzt die alte flache Struktur aus 001

-- Cleanup alte Tabellen (waren leer / werden neu aufgebaut)
drop table if exists dokumente cascade;
drop table if exists signaturen cascade;
drop table if exists vertraege cascade;
drop table if exists mietverhaeltnisse cascade;

-- ============================================================
-- MIETVERHAELTNISSE (inkl. aller Vertragsdaten flat)
-- ============================================================
create table mietverhaeltnisse (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  einheit_id    uuid        references einheiten(id) on delete set null,
  -- Status & Label
  status        text        not null default 'neu'
                check (status in ('neu','aktiv','gekuendigt','beendet')),
  bezeichnung   text        not null default '',
  notizen       text        not null default '',
  -- Vertragstyp
  typ           text        not null default 'staffel'
                check (typ in ('staffel','index','moebliert')),
  -- Mietzeit
  mietbeginn              text not null default '',
  befristung_ende         text not null default '',
  befristung_grund        text not null default '',
  befristung_konkret      text not null default '',
  verlaengerung_typ       text not null default 'fix',
  verlaengerung_miete     text not null default '',
  -- Mietpreis
  grundmiete              text not null default '',
  nk_vz                   text not null default '',
  hk_vz                   text not null default '',
  moebel_zuschlag         text not null default '',
  -- Indexmiete
  index_basisjahr         text not null default '2020',
  index_basiswert         text not null default '',
  index_basismonat        text not null default '',
  -- Kaution & Schlüssel
  kaution                 text not null default '',
  kaution_raten           text not null default '1',
  schluessel_wohnung      text not null default '2',
  schluessel_haus         text not null default '2',
  schluessel_briefkasten  text not null default '1',
  schluessel_sonstige     text not null default '',
  -- Konditionen
  tierhaltung                         text    not null default 'kleintiere',
  schoenheitsreparaturen_uebertragen  boolean not null default false,
  uebergabezustand                    text    not null default 'renoviert',
  sonstige_vereinbarungen             text    not null default '',
  zahlungstag                         text    not null default '3',
  kleinreparatur_einzelfall           text    not null default '100',
  kleinreparatur_jahresanteil         text    not null default '8',
  created_at  timestamptz default now()
);

alter table mietverhaeltnisse enable row level security;
create policy "Eingeloggte User: Mietverhaeltnisse"
  on mietverhaeltnisse for all
  using  (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ============================================================
-- MIETER (Personen je Mietverhältnis)
-- ============================================================
create table mieter (
  id                  uuid  primary key default gen_random_uuid(),
  mietverhaeltnis_id  uuid  not null references mietverhaeltnisse(id) on delete cascade,
  reihenfolge         int   not null default 1,
  name                text  not null default '',
  geburtsdatum        text  not null default '',
  anschrift_alt       text  not null default '',
  telefon             text  not null default '',
  email               text  not null default '',
  ausweis_nr          text  not null default ''
);

alter table mieter enable row level security;
create policy "Eingeloggte User: Mieter"
  on mieter for all
  using  (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ============================================================
-- VERTRAG_STAFFELN (Staffelmiete-Stufen)
-- ============================================================
create table vertrag_staffeln (
  id                  uuid  primary key default gen_random_uuid(),
  mietverhaeltnis_id  uuid  not null references mietverhaeltnisse(id) on delete cascade,
  reihenfolge         int   not null default 1,
  datum               text  not null default '',
  betrag              text  not null default ''
);

alter table vertrag_staffeln enable row level security;
create policy "Eingeloggte User: Staffeln"
  on vertrag_staffeln for all
  using  (auth.uid() is not null)
  with check (auth.uid() is not null);
