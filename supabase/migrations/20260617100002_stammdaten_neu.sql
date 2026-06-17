-- 002: Vermieter, Objekte, Einheiten
-- Ersetzt die alte flache stammdaten-Tabelle

drop table if exists stammdaten cascade;

-- ============================================================
-- VERMIETER (max. 2)
-- ============================================================
create table if not exists vermieter (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null default '',
  anschrift   text        not null default '',
  plz_ort     text        not null default '',
  telefon     text        not null default '',
  email       text        not null default '',
  reihenfolge int         not null default 1,
  created_at  timestamptz default now()
);

alter table vermieter enable row level security;

create policy "Jeder eingeloggte User: vollen Zugriff auf Vermieter"
  on vermieter for all
  using  (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ============================================================
-- OBJEKTE (Gebäude / Immobilien)
-- ============================================================
create table if not exists objekte (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null references auth.users(id) on delete cascade,
  name                text        not null default '',
  adresse             text        not null default '',
  plz_ort             text        not null default '',
  baujahr             text        not null default '',
  heizungsart         text        not null default '',
  energieklasse       text        not null default '',
  energie_typ         text        check (energie_typ in ('verbrauch', 'bedarf')),
  energie_verbrauch   text        not null default '',
  energie_traeger     text        not null default '',
  energie_gueltig_bis date,
  kontoinhaber        text        not null default '',
  iban                text        not null default '',
  bank                text        not null default '',
  vermieter_ids       uuid[]      not null default '{}',
  created_at          timestamptz default now()
);

alter table objekte enable row level security;

create policy "Jeder eingeloggte User: vollen Zugriff auf Objekte"
  on objekte for all
  using  (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ============================================================
-- EINHEITEN (Wohnungen innerhalb eines Objekts)
-- ============================================================
create table if not exists einheiten (
  id              uuid        primary key default gen_random_uuid(),
  objekt_id       uuid        not null references objekte(id) on delete cascade,
  bezeichnung     text        not null default '',
  etage           text        not null default '',
  lage            text        not null default '',
  zimmer          text        not null default '',
  nebenraeume     text        not null default '',
  wohnflaeche     text        not null default '',
  strom_nr        text        not null default '',
  gas_nr          text        not null default '',
  wasser_kalt_nr  text        not null default '',
  wasser_warm_nr  text        not null default '',
  heizung_nr      text        not null default '',
  created_at      timestamptz default now()
);

alter table einheiten enable row level security;

create policy "Jeder eingeloggte User: vollen Zugriff auf Einheiten"
  on einheiten for all
  using  (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ============================================================
-- MIETVERHAELTNISSE: einheit_id Referenz ergänzen
-- ============================================================
alter table mietverhaeltnisse
  add column if not exists einheit_id uuid references einheiten(id) on delete set null;
