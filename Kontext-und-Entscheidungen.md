# PMS — Kontext & Entscheidungen

Dokumentiert Ausgangslage, Ziele und alle getroffenen Entscheidungen für die PMS Web-App.

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
- Später: iOS- und Android-App (separates Projekt, falls gewünscht)

---

## Entscheidungen

### Stack: Eigenständige Next.js-App

**Entscheidung:** PMS ist ein **vollständig eigenständiges Projekt** — eigenes Repo, eigenes Supabase-Projekt, eigenes Vercel-Deployment. Keine Vermischung mit anderen Projekten (insbesondere nicht mit Claudia).

**Stack:**
- Framework: Next.js 16 (App Router, TypeScript, Tailwind)
- Auth + DB + Storage: Supabase (eigene Instanz, Project-ID `tkiqecnzjrqhrlesnjtg`)
- Hosting: Vercel
- E-Mail: Resend (SMTP, noch offen)

### User: Nick und Philipp

Nur zwei Accounts. Philipp wird direkt über Supabase Auth eingeladen. RLS in Supabase stellt sicher, dass beide auf dieselben Daten zugreifen können.

### Datenbank: Eigene Supabase-Instanz

Migration `supabase/migrations/001_pms_schema.sql` im PMS-Repo. Tabellen: `profiles`, `stammdaten`, `mietverhaeltnisse`, `vertraege`, `dokumente`, `signaturen`. Alle mit RLS.

### Signatur: react-signature-canvas oder ähnliches Web-Package

Für die Online-Signatur wird ein Web-kompatibles Canvas-Package eingebunden. Signaturen werden als PNG in Supabase Storage (Bucket `signaturen`) gespeichert.

---

## Repositories & Pfade

| Was | Pfad / Repo |
|---|---|
| Aktives Entwicklungs-Repo | `C:\ClaudeBusiness\PMS\` (ClaudeBusiness1992/PMS) |
| Ausgangsbasis (HTML) | `C:\ClaudeBusiness\PMS\Verwaltung.html` |
| Obsidian-Vault (Tasks) | `C:\ClaudeBusiness\Orga-und-Allgemeines\PMS Obsidian\` |
| Orga-Repo | `C:\ClaudeBusiness\Orga-und-Allgemeines\` (ClaudeBusiness1992/Orga-und-Allgemeines) |

---

## Offene Fragen

- DOCX-Export beibehalten oder reicht PDF via `window.print()` / eine PDF-Library?
- Eigene Domain für den Web-Build? (z.B. `verwaltung.glowgiver.de`)
- Soll Philipp alle Mietverhältnisse sehen oder nur bestimmte?
