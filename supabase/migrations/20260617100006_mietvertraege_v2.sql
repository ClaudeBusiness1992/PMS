-- 005: Mietvertraege vereinfachen (nur Staffelmiete, Kaution auto, neues Layout)

-- Staffeln werden jetzt berechnet, nicht gespeichert
drop table if exists vertrag_staffeln;

-- ── mietverhaeltnisse: neue Spalten ──────────────────────────
alter table mietverhaeltnisse
  add column if not exists staffel_erhoehung    text not null default '',
  add column if not exists vertragsbindung       int  not null default 2,
  add column if not exists schluessel_keller     text not null default '',
  add column if not exists schluessel_dachboden  text not null default '';

-- ── mietverhaeltnisse: nicht mehr benötigte Spalten entfernen ─
alter table mietverhaeltnisse
  drop column if exists typ,
  drop column if exists befristung_ende,
  drop column if exists befristung_grund,
  drop column if exists befristung_konkret,
  drop column if exists verlaengerung_typ,
  drop column if exists verlaengerung_miete,
  drop column if exists moebel_zuschlag,
  drop column if exists index_basisjahr,
  drop column if exists index_basiswert,
  drop column if exists index_basismonat,
  drop column if exists kaution,
  drop column if exists kaution_raten,
  drop column if exists schoenheitsreparaturen_uebertragen,
  drop column if exists uebergabezustand;

-- ── mieter: neue Spalten ─────────────────────────────────────
alter table mieter
  add column if not exists bg_nummer    text not null default '',
  add column if not exists ausweis_path text not null default '';

-- ── Storage-Bucket für Ausweise ──────────────────────────────
insert into storage.buckets (id, name, public)
values ('ausweise', 'ausweise', false)
on conflict (id) do nothing;

drop policy if exists "User kann Ausweise hochladen" on storage.objects;
drop policy if exists "User kann Ausweise lesen"     on storage.objects;

create policy "User kann Ausweise hochladen"
  on storage.objects for insert
  with check (bucket_id = 'ausweise' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "User kann Ausweise lesen"
  on storage.objects for select
  using (bucket_id = 'ausweise' and auth.uid()::text = (storage.foldername(name))[1]);
