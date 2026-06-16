# PMS — Kontext & Entscheidungen

Gesprächsprotokoll vom 2026-06-16. Dokumentiert Ausgangslage, Ziele und alle getroffenen Entscheidungen für die Migration der Verwaltungs-App.

---

## Ausgangslage

`Verwaltung.html` ist eine vollständig ausgebaute Single-File-React-App (React 18 via CDN, Babel Standalone, TailwindCSS). Alle Daten werden im `localStorage` des Browsers gespeichert (`STORAGE_KEY = "mietvertrags-werkzeug:v1"`).

### Enthaltene Features

- Stammdaten (Vermieter, IBAN)
- Mietverhältnis-Liste
- Mietvertrag-Generator (Staffelmiete, Indexmiete, möbliert)
- Übergabeprotokoll (raumweise, mit Foto-Upload-Platzhalter)
- Hausordnung & Anlagen
- Schreiben: Mahnung, Mieterhöhung (Index + Vergleichsmiete), Modernisierung, Auszugsprotokoll, Kautionsabrechnung, Selbstauskunft
- Fristen-Cockpit
- DOCX-Export (`docx`-Library)
- Print-CSS für A4-Druck
- Signatur-Block (statisch, noch nicht digital)

### Problem

Daten sind nur im Browser lokal verfügbar. Kein geräteübergreifender Zugriff, kein Account-System, keine Datensicherung.

---

## Ziele

- Zugriff auf alle Daten von jedem Browser und Gerät nach Login
- E-Mail-basiertes Account-System (Nick + Philipp)
- Online-Signatur (digitales Unterschreiben direkt in der App)
- Datei-Speicherung (PDFs, Fotos) in der Cloud
- Später: iOS- und Android-App aus derselben Codebasis

---

## Entscheidungen

### Stack: Claudia (nicht Next.js)

**Entscheidung:** Das PMS wird als Feature-Modul `src/features/verwaltung/` in die bestehende **Claudia**-App integriert. Kein neues Repo, kein neues Framework.

**Grund:** Claudia ist bereits eine Expo-App (React Native + Web) mit:
- Supabase Auth (Login, Sessions)
- Supabase JS Client
- Supabase Storage (`storage.ts`)
- Einladungssystem für weitere User
- i18n (DE/EN)
- RevenueCat (Abo, falls später relevant)

Alles was das PMS braucht ist in Claudia bereits vorhanden.

### Framework: Expo (React Native + Web)

Expo Router ermöglicht eine einzige Codebasis für Web, iOS und Android. Der Web-Build wird auf Vercel deployed. iOS/Android läuft durch das bestehende Expo-Setup in Claudia automatisch.

### Mobile: Expo (kein Capacitor, kein separates React Native Projekt)

Da Claudia bereits Expo nutzt und die App damit auf Web, iOS und Android läuft, wird kein separates Wrapping via Capacitor benötigt.

### Signatur: react-native-signature-canvas

Für die Online-Signatur wird `react-native-signature-canvas` eingebunden. Signaturen werden als PNG in Supabase Storage (Bucket `signaturen`) gespeichert und in Dokumente eingebettet.

### User: Nick und Philipp

Nur zwei Accounts. Philipp wird über das bereits vorhandene Claudia-Einladungssystem eingeladen. RLS in Supabase stellt sicher, dass beide auf dieselben Daten zugreifen können.

### Datenbank: Neues Schema in Claudia

Migration `016_pms_schema.sql` in `Claudia/supabase/migrations/`. Tabellen: `stammdaten`, `mietverhaeltnisse`, `vertraege`, `dokumente`, `signaturen`. Alle mit RLS.

---

## Repositories & Pfade

| Was | Pfad / Repo |
|---|---|
| Aktives Entwicklungs-Repo | `C:\ClaudeBusiness\Claudia\` (ClaudeBusiness1992/Claudia) |
| Ausgangsbasis (HTML) | `C:\ClaudeBusiness\PMS\Verwaltung.html` |
| Obsidian-Vault (Tasks) | `C:\ClaudeBusiness\Orga-und-Allgemeines\PMS Obsidian\` |
| Orga-Repo | `C:\ClaudeBusiness\Orga-und-Allgemeines\` (ClaudeBusiness1992/Orga-und-Allgemeines) |

---

## Offene Fragen (Stand 2026-06-16)

- Soll das PMS ein eigener Tab in Claudia sein oder eine separate Navigation?
- DOCX-Export beibehalten oder reicht PDF via `expo-print`?
- Eigene Domain für den Web-Build? (z.B. `verwaltung.glowgiver.de`)
- Soll Philipp alle Mietverhältnisse sehen oder nur bestimmte?
