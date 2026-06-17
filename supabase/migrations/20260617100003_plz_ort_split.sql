-- 003: PLZ und Ort in vermieter und objekte trennen

-- Vermieter
alter table vermieter add column if not exists plz text not null default '';
alter table vermieter add column if not exists ort text not null default '';
alter table vermieter drop column if exists plz_ort;

-- Objekte
alter table objekte add column if not exists plz text not null default '';
alter table objekte add column if not exists ort text not null default '';
alter table objekte drop column if exists plz_ort;
