-- 005: Bankkonten als eigenständige Tabelle, Wohnungsnummer in Einheiten, Bankkonto-Zuordnung an Objekte

-- ============================================================
-- OBJEKTE: Bankspalten entfernen (jetzt eigene Tabelle)
-- ============================================================
alter table objekte drop column if exists kontoinhaber;
alter table objekte drop column if exists iban;
alter table objekte drop column if exists bank;
alter table objekte drop column if exists name;

-- ============================================================
-- EINHEITEN: Wohnungsnummer ergänzen
-- ============================================================
alter table einheiten add column if not exists wohnungsnummer text not null default '';

-- ============================================================
-- BANKKONTEN (eigenständig, beliebig viele)
-- ============================================================
create table if not exists bankkonten (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  kontoinhaber text        not null default '',
  iban         text        not null default '',
  bank         text        not null default '',
  reihenfolge  int         not null default 1,
  created_at   timestamptz default now()
);

alter table bankkonten enable row level security;

drop policy if exists "Eingeloggte User: Bankkonten" on bankkonten;
create policy "Eingeloggte User: Bankkonten"
  on bankkonten for all
  using  (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ============================================================
-- OBJEKTE: Bankkonto zuweisen (nach Anlage der Tabelle)
-- ============================================================
alter table objekte
  add column if not exists bankkonto_id uuid references bankkonten(id) on delete set null;
