-- PMS Schema — Initiales Schema (rekonstruiert aus laufender DB)
-- Tabellen wurden direkt im Dashboard angelegt; diese Datei dokumentiert den Stand.

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "User sieht nur eigenes Profil"
  on profiles for select using (auth.uid() = id);

create policy "User kann eigenes Profil anlegen"
  on profiles for insert with check (auth.uid() = id);

create policy "User kann eigenes Profil bearbeiten"
  on profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- VERMIETER
-- ============================================================
create table if not exists vermieter (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null default '',
  anschrift  text not null default '',
  plz        text not null default '',
  ort        text not null default '',
  telefon    text not null default '',
  email      text not null default '',
  reihenfolge integer not null default 1,
  created_at timestamptz default now()
);

alter table vermieter enable row level security;

create policy "User sieht nur eigene Vermieter"
  on vermieter for select using (auth.uid() = user_id);

create policy "User kann Vermieter anlegen"
  on vermieter for insert with check (auth.uid() = user_id);

create policy "User kann Vermieter bearbeiten"
  on vermieter for update using (auth.uid() = user_id);

create policy "User kann Vermieter loeschen"
  on vermieter for delete using (auth.uid() = user_id);

-- ============================================================
-- BANKKONTEN
-- ============================================================
create table if not exists bankkonten (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  kontoinhaber text not null default '',
  iban         text not null default '',
  bank         text not null default '',
  reihenfolge  integer not null default 1,
  created_at   timestamptz default now()
);

alter table bankkonten enable row level security;

create policy "User sieht nur eigene Bankkonten"
  on bankkonten for select using (auth.uid() = user_id);

create policy "User kann Bankkonten anlegen"
  on bankkonten for insert with check (auth.uid() = user_id);

create policy "User kann Bankkonten bearbeiten"
  on bankkonten for update using (auth.uid() = user_id);

create policy "User kann Bankkonten loeschen"
  on bankkonten for delete using (auth.uid() = user_id);

-- ============================================================
-- OBJEKTE
-- ============================================================
create table if not exists objekte (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  adresse            text not null default '',
  plz                text not null default '',
  ort                text not null default '',
  baujahr            text not null default '',
  heizungsart        text not null default '',
  energieklasse      text not null default '',
  energie_typ        text check (energie_typ in ('verbrauch', 'bedarf')),
  energie_verbrauch  text not null default '',
  energie_traeger    text not null default '',
  energie_gueltig_bis date,
  vermieter_ids      uuid[] not null default '{}',
  bankkonto_id       uuid references bankkonten(id) on delete set null,
  created_at         timestamptz default now()
);

alter table objekte enable row level security;

create policy "User sieht nur eigene Objekte"
  on objekte for select using (auth.uid() = user_id);

create policy "User kann Objekte anlegen"
  on objekte for insert with check (auth.uid() = user_id);

create policy "User kann Objekte bearbeiten"
  on objekte for update using (auth.uid() = user_id);

create policy "User kann Objekte loeschen"
  on objekte for delete using (auth.uid() = user_id);

-- ============================================================
-- EINHEITEN
-- ============================================================
create table if not exists einheiten (
  id               uuid primary key default gen_random_uuid(),
  objekt_id        uuid not null references objekte(id) on delete cascade,
  wohnungsnummer   text not null default '',
  bezeichnung      text not null default '',
  etage            text not null default '',
  lage             text not null default '',
  zimmer           text not null default '',
  nebenraeume      text not null default '',
  wohnflaeche      text not null default '',
  strom_nr         text not null default '',
  gas_nr           text not null default '',
  wasser_kalt_nr   text not null default '',
  wasser_warm_nr   text not null default '',
  heizung_nr       text not null default '',
  created_at       timestamptz default now()
);

-- Einheiten haben kein eigenes user_id — Zugriff über Objekte
alter table einheiten enable row level security;

create policy "User sieht Einheiten eigener Objekte"
  on einheiten for select
  using (exists (select 1 from objekte where objekte.id = einheiten.objekt_id and objekte.user_id = auth.uid()));

create policy "User kann Einheiten anlegen"
  on einheiten for insert
  with check (exists (select 1 from objekte where objekte.id = einheiten.objekt_id and objekte.user_id = auth.uid()));

create policy "User kann Einheiten bearbeiten"
  on einheiten for update
  using (exists (select 1 from objekte where objekte.id = einheiten.objekt_id and objekte.user_id = auth.uid()));

create policy "User kann Einheiten loeschen"
  on einheiten for delete
  using (exists (select 1 from objekte where objekte.id = einheiten.objekt_id and objekte.user_id = auth.uid()));

-- ============================================================
-- MIETVERHAELTNISSE
-- ============================================================
create table if not exists mietverhaeltnisse (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references auth.users(id) on delete cascade,
  einheit_id                uuid references einheiten(id) on delete set null,
  status                    text not null default 'neu' check (status in ('neu', 'aktiv', 'gekuendigt', 'beendet')),
  bezeichnung               text not null default '',
  notizen                   text not null default '',
  -- Mietzeit
  mietbeginn                text not null default '',
  befristung_ende           text not null default '',
  vertragsbindung           integer not null default 2,
  -- Mietpreis
  grundmiete                text not null default '',
  nk_vz                     text not null default '',
  wasser_vz                 text not null default '',
  wasser_in_nk              boolean not null default true,
  hk_vz                     text not null default '',
  -- Staffelmiete
  staffel_erhoehung         text not null default '',
  -- Schlüssel
  schluessel_wohnung        text not null default '2',
  schluessel_haus           text not null default '2',
  schluessel_briefkasten    text not null default '1',
  schluessel_keller         text not null default '0',
  schluessel_dachboden      text not null default '',
  schluessel_garage         text not null default '0',
  -- Konditionen
  sonstige_vereinbarungen   text not null default '',
  zahlungstag               text not null default '3',
  kleinreparatur_einzelfall text not null default '100',
  kleinreparatur_jahresanteil text not null default '8',
  created_at                timestamptz default now()
);

alter table mietverhaeltnisse enable row level security;

create policy "User sieht nur eigene Mietverhaeltnisse"
  on mietverhaeltnisse for select using (auth.uid() = user_id);

create policy "User kann Mietverhaeltnisse anlegen"
  on mietverhaeltnisse for insert with check (auth.uid() = user_id);

create policy "User kann Mietverhaeltnisse bearbeiten"
  on mietverhaeltnisse for update using (auth.uid() = user_id);

create policy "User kann Mietverhaeltnisse loeschen"
  on mietverhaeltnisse for delete using (auth.uid() = user_id);

-- ============================================================
-- MIETER
-- ============================================================
create table if not exists mieter (
  id                 uuid primary key default gen_random_uuid(),
  mietverhaeltnis_id uuid not null references mietverhaeltnisse(id) on delete cascade,
  reihenfolge        integer not null default 1,
  name               text not null default '',
  geburtsdatum       text not null default '',
  anschrift_alt      text not null default '',
  telefon            text not null default '',
  email              text not null default '',
  ausweis_nr         text not null default '',
  bg_nummer          text not null default '',
  ausweis_path       text not null default ''
);

alter table mieter enable row level security;

create policy "User sieht Mieter eigener Mietverhaeltnisse"
  on mieter for select
  using (exists (select 1 from mietverhaeltnisse where mietverhaeltnisse.id = mieter.mietverhaeltnis_id and mietverhaeltnisse.user_id = auth.uid()));

create policy "User kann Mieter anlegen"
  on mieter for insert
  with check (exists (select 1 from mietverhaeltnisse where mietverhaeltnisse.id = mieter.mietverhaeltnis_id and mietverhaeltnisse.user_id = auth.uid()));

create policy "User kann Mieter loeschen"
  on mieter for delete
  using (exists (select 1 from mietverhaeltnisse where mietverhaeltnisse.id = mieter.mietverhaeltnis_id and mietverhaeltnisse.user_id = auth.uid()));

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public)
values ('ausweise', 'ausweise', false)
on conflict (id) do nothing;

create policy "User kann eigene Ausweise hochladen"
  on storage.objects for insert
  with check (bucket_id = 'ausweise' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "User kann eigene Ausweise lesen"
  on storage.objects for select
  using (bucket_id = 'ausweise' and auth.uid()::text = (storage.foldername(name))[1]);
