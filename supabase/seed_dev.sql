-- Entwicklungs-Seed: 2 Vermieter, 4 Objekte, Einheiten, 5 Bankkonten
-- Voraussetzung: Migration 005 wurde bereits ausgeführt
-- Ausführen im Supabase SQL Editor

do $$
declare
  uid  uuid := (select id from auth.users limit 1);

  v1   uuid := gen_random_uuid();
  v2   uuid := gen_random_uuid();

  b1   uuid := gen_random_uuid();
  b2   uuid := gen_random_uuid();
  b3   uuid := gen_random_uuid();
  b4   uuid := gen_random_uuid();
  b5   uuid := gen_random_uuid();

  o1   uuid := gen_random_uuid();  -- 1 Einheit
  o2   uuid := gen_random_uuid();  -- 1 Einheit
  o3   uuid := gen_random_uuid();  -- 2 Einheiten
  o4   uuid := gen_random_uuid();  -- 1 Einheit
begin

-- ── Vermieter ─────────────────────────────────────────────────
insert into vermieter (id, user_id, name, anschrift, plz, ort, telefon, email, reihenfolge) values
  (v1, uid, 'Nicklas Passvogel', 'Musterstraße 1',  '27570', 'Bremerhaven', '+49 471 1234567', 'nicklas@example.com', 1),
  (v2, uid, 'Philipp Hartmann',  'Hafenweg 14',     '27568', 'Bremerhaven', '+49 471 7654321', 'philipp@example.com', 2);

-- ── Bankkonten ────────────────────────────────────────────────
insert into bankkonten (id, user_id, kontoinhaber, iban, bank, reihenfolge) values
  (b1, uid, 'Nicklas Passvogel',       'DE89 2905 0101 0001 2345 67', 'Sparkasse Bremerhaven', 1),
  (b2, uid, 'Nicklas Passvogel',       'DE45 3704 0044 0532 0130 00', 'Commerzbank',           2),
  (b3, uid, 'Philipp Hartmann',        'DE12 2004 1010 0505 0100 04', 'Postbank',              3),
  (b4, uid, 'Philipp Hartmann',        'DE75 5121 0800 1245 1261 31', 'Deutsche Bank',         4),
  (b5, uid, 'Passvogel & Hartmann GbR','DE02 1001 1001 2628 1800 93', 'N26',                   5);

-- ── Objekte ───────────────────────────────────────────────────

-- Objekt 1: 1 Einheit
insert into objekte (id, user_id, adresse, plz, ort, baujahr, heizungsart, energieklasse, energie_typ, energie_verbrauch, energie_traeger, energie_gueltig_bis, bankkonto_id, vermieter_ids) values
  (o1, uid, 'Heinrichstraße 12', '27570', 'Bremerhaven', '1971', 'Gas-Zentralheizung', 'D', 'verbrauch', '148', 'Erdgas', '2030-12-31', b1, array[v1]);

insert into einheiten (id, objekt_id, bezeichnung, wohnungsnummer, etage, lage, zimmer, wohnflaeche, nebenraeume, strom_nr, gas_nr, wasser_kalt_nr, wasser_warm_nr, heizung_nr) values
  (gen_random_uuid(), o1, 'Erdgeschoss links', 'W01', 'EG', 'links', '3', '78', 'Keller, Stellplatz', '1000001', '2000001', '3000001', '4000001', '5000001');

-- Objekt 2: 1 Einheit
insert into objekte (id, user_id, adresse, plz, ort, baujahr, heizungsart, energieklasse, energie_typ, energie_verbrauch, energie_traeger, energie_gueltig_bis, bankkonto_id, vermieter_ids) values
  (o2, uid, 'Am Deich 3', '27572', 'Bremerhaven', '1983', 'Ölheizung', 'E', 'verbrauch', '191', 'Heizöl', '2029-06-30', b3, array[v2]);

insert into einheiten (id, objekt_id, bezeichnung, wohnungsnummer, etage, lage, zimmer, wohnflaeche, nebenraeume, strom_nr, gas_nr, wasser_kalt_nr, wasser_warm_nr, heizung_nr) values
  (gen_random_uuid(), o2, '1. Obergeschoss', 'W01', '1. OG', '', '4', '96', 'Keller', '1000002', '', '3000002', '4000002', '5000002');

-- Objekt 3: 2 Einheiten
insert into objekte (id, user_id, adresse, plz, ort, baujahr, heizungsart, energieklasse, energie_typ, energie_verbrauch, energie_traeger, energie_gueltig_bis, bankkonto_id, vermieter_ids) values
  (o3, uid, 'Lange Straße 7', '27568', 'Bremerhaven', '1968', 'Fernwärme', 'C', 'bedarf', '112', 'Fernwärme', '2031-09-30', b5, array[v1, v2]);

insert into einheiten (id, objekt_id, bezeichnung, wohnungsnummer, etage, lage, zimmer, wohnflaeche, nebenraeume, strom_nr, gas_nr, wasser_kalt_nr, wasser_warm_nr, heizung_nr) values
  (gen_random_uuid(), o3, 'Erdgeschoss rechts',   'W01', 'EG',     'rechts', '2', '58', 'Keller',             '1000003', '', '3000003', '4000003', '5000003'),
  (gen_random_uuid(), o3, '1. Obergeschoss links', 'W02', '1. OG', 'links',  '3', '74', 'Keller, Dachboden',  '1000004', '', '3000004', '4000004', '5000004');

-- Objekt 4: 1 Einheit
insert into objekte (id, user_id, adresse, plz, ort, baujahr, heizungsart, energieklasse, energie_typ, energie_verbrauch, energie_traeger, energie_gueltig_bis, bankkonto_id, vermieter_ids) values
  (o4, uid, 'Bismarckstraße 21', '27570', 'Bremerhaven', '1994', 'Gas-Etagenheizung', 'C', 'verbrauch', '105', 'Erdgas', '2032-03-31', b2, array[v1]);

insert into einheiten (id, objekt_id, bezeichnung, wohnungsnummer, etage, lage, zimmer, wohnflaeche, nebenraeume, strom_nr, gas_nr, wasser_kalt_nr, wasser_warm_nr, heizung_nr) values
  (gen_random_uuid(), o4, '2. Obergeschoss rechts', 'W01', '2. OG', 'rechts', '3', '82', 'Stellplatz', '1000005', '2000005', '3000005', '4000005', '5000005');

end $$;
