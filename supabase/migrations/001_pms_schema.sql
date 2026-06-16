-- PMS Schema Migration 001 (idempotent — kann mehrfach ausgeführt werden)
-- https://supabase.com/dashboard/project/tkiqecnzjrqhrlesnjtg/sql/new

-- ============================================================
-- CLEANUP (bestehende Policies entfernen damit kein Konflikt)
-- ============================================================
drop policy if exists "User sieht nur eigenes Profil" on profiles;
drop policy if exists "User kann eigenes Profil anlegen" on profiles;
drop policy if exists "User kann eigenes Profil bearbeiten" on profiles;

drop policy if exists "User sieht nur eigene Stammdaten" on stammdaten;
drop policy if exists "User kann Stammdaten anlegen" on stammdaten;
drop policy if exists "User kann Stammdaten bearbeiten" on stammdaten;

drop policy if exists "User sieht nur eigene Mietverhaeltnisse" on mietverhaeltnisse;
drop policy if exists "User kann Mietverhaeltnisse anlegen" on mietverhaeltnisse;
drop policy if exists "User kann Mietverhaeltnisse bearbeiten" on mietverhaeltnisse;
drop policy if exists "User kann Mietverhaeltnisse loeschen" on mietverhaeltnisse;

drop policy if exists "User sieht nur eigene Vertraege" on vertraege;
drop policy if exists "User kann Vertraege anlegen" on vertraege;
drop policy if exists "User kann Vertraege bearbeiten" on vertraege;
drop policy if exists "User kann Vertraege loeschen" on vertraege;

drop policy if exists "User sieht nur eigene Dokumente" on dokumente;
drop policy if exists "User kann Dokumente anlegen" on dokumente;
drop policy if exists "User kann Dokumente bearbeiten" on dokumente;
drop policy if exists "User kann Dokumente loeschen" on dokumente;

drop policy if exists "User sieht Signaturen seiner Dokumente" on signaturen;
drop policy if exists "User kann Signaturen anlegen" on signaturen;

drop policy if exists "User kann eigene Dokumente hochladen" on storage.objects;
drop policy if exists "User kann eigene Dokumente lesen" on storage.objects;
drop policy if exists "User kann eigene Fotos hochladen" on storage.objects;
drop policy if exists "User kann eigene Fotos lesen" on storage.objects;
drop policy if exists "User kann eigene Signaturen hochladen" on storage.objects;
drop policy if exists "User kann eigene Signaturen lesen" on storage.objects;

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "User sieht nur eigenes Profil"
  on profiles for select
  using (auth.uid() = id);

create policy "User kann eigenes Profil anlegen"
  on profiles for insert
  with check (auth.uid() = id);

create policy "User kann eigenes Profil bearbeiten"
  on profiles for update
  using (auth.uid() = id);

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
-- STAMMDATEN
-- ============================================================
create table if not exists stammdaten (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  vermieter_name text,
  vermieter_strasse text,
  vermieter_plz text,
  vermieter_ort text,
  vermieter_email text,
  vermieter_telefon text,
  iban text,
  updated_at timestamptz default now()
);

alter table stammdaten enable row level security;

create policy "User sieht nur eigene Stammdaten"
  on stammdaten for select using (auth.uid() = user_id);

create policy "User kann Stammdaten anlegen"
  on stammdaten for insert with check (auth.uid() = user_id);

create policy "User kann Stammdaten bearbeiten"
  on stammdaten for update using (auth.uid() = user_id);

-- ============================================================
-- MIETVERHAELTNISSE
-- ============================================================
create table if not exists mietverhaeltnisse (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  mieter_name text,
  mieter_strasse text,
  mieter_plz text,
  mieter_ort text,
  mieter_email text,
  mieter_telefon text,
  objekt_strasse text,
  objekt_plz text,
  objekt_ort text,
  objekt_bezeichnung text,
  mietbeginn date,
  mietende date,
  kaltmiete numeric(10,2),
  nebenkosten numeric(10,2),
  kaution numeric(10,2),
  status text default 'aktiv' check (status in ('aktiv', 'beendet')),
  created_at timestamptz default now()
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
-- VERTRAEGE
-- ============================================================
create table if not exists vertraege (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  mietverhaeltnis_id uuid references mietverhaeltnisse(id) on delete set null,
  vertragstyp text check (vertragstyp in ('staffel', 'index', 'moebliert')),
  daten jsonb default '{}',
  created_at timestamptz default now()
);

alter table vertraege enable row level security;

create policy "User sieht nur eigene Vertraege"
  on vertraege for select using (auth.uid() = user_id);

create policy "User kann Vertraege anlegen"
  on vertraege for insert with check (auth.uid() = user_id);

create policy "User kann Vertraege bearbeiten"
  on vertraege for update using (auth.uid() = user_id);

create policy "User kann Vertraege loeschen"
  on vertraege for delete using (auth.uid() = user_id);

-- ============================================================
-- DOKUMENTE
-- ============================================================
create table if not exists dokumente (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  mietverhaeltnis_id uuid references mietverhaeltnisse(id) on delete set null,
  typ text check (typ in (
    'mietvertrag', 'uebergabe', 'auszug', 'hausordnung',
    'mahnung', 'mieterhoehung_index', 'mieterhoehung_vergleich',
    'modernisierung', 'kautionsabrechnung', 'selbstauskunft'
  )),
  titel text,
  status text default 'entwurf' check (status in ('entwurf', 'fertig', 'unterschrieben')),
  storage_path text,
  daten jsonb default '{}',
  created_at timestamptz default now()
);

alter table dokumente enable row level security;

create policy "User sieht nur eigene Dokumente"
  on dokumente for select using (auth.uid() = user_id);

create policy "User kann Dokumente anlegen"
  on dokumente for insert with check (auth.uid() = user_id);

create policy "User kann Dokumente bearbeiten"
  on dokumente for update using (auth.uid() = user_id);

create policy "User kann Dokumente loeschen"
  on dokumente for delete using (auth.uid() = user_id);

-- ============================================================
-- SIGNATUREN
-- ============================================================
create table if not exists signaturen (
  id uuid primary key default gen_random_uuid(),
  dokument_id uuid not null references dokumente(id) on delete cascade,
  unterzeichner text not null,
  storage_path text not null,
  signed_at timestamptz default now()
);

alter table signaturen enable row level security;

create policy "User sieht Signaturen seiner Dokumente"
  on signaturen for select
  using (
    exists (
      select 1 from dokumente
      where dokumente.id = signaturen.dokument_id
      and dokumente.user_id = auth.uid()
    )
  );

create policy "User kann Signaturen anlegen"
  on signaturen for insert
  with check (
    exists (
      select 1 from dokumente
      where dokumente.id = signaturen.dokument_id
      and dokumente.user_id = auth.uid()
    )
  );

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public)
values
  ('dokumente', 'dokumente', false),
  ('fotos', 'fotos', false),
  ('signaturen', 'signaturen', false)
on conflict (id) do nothing;

create policy "User kann eigene Dokumente hochladen"
  on storage.objects for insert
  with check (bucket_id = 'dokumente' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "User kann eigene Dokumente lesen"
  on storage.objects for select
  using (bucket_id = 'dokumente' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "User kann eigene Fotos hochladen"
  on storage.objects for insert
  with check (bucket_id = 'fotos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "User kann eigene Fotos lesen"
  on storage.objects for select
  using (bucket_id = 'fotos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "User kann eigene Signaturen hochladen"
  on storage.objects for insert
  with check (bucket_id = 'signaturen' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "User kann eigene Signaturen lesen"
  on storage.objects for select
  using (bucket_id = 'signaturen' and auth.uid()::text = (storage.foldername(name))[1]);
