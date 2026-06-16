# PMS — Glow Giver Mietverwaltung

Web-App zur Mietverwaltung für Glow Giver. Nutzer: Nick und Philipp.

---

## Stack

| Bereich | Tool |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, Tailwind) |
| Auth + DB + Storage | Supabase (eigene Instanz) |
| Hosting | Vercel |
| E-Mail | Resend (SMTP) |

---

## Supabase

- **Project-ID:** `tkiqecnzjrqhrlesnjtg`
- **URL:** `https://tkiqecnzjrqhrlesnjtg.supabase.co`
- Dashboard: https://supabase.com/dashboard/project/tkiqecnzjrqhrlesnjtg
- Jede neue Tabelle braucht RLS
- Schema-Migrationen: `supabase/migrations/`

---

## Lokale Entwicklung

```powershell
cd C:\ClaudeBusiness\PMS
npm run dev   # http://localhost:3000
```

`.env.local` enthält `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` — nie committen.

---

## Projektstruktur

```
src/
  app/
    layout.tsx        # AuthProvider, Fonts, Metadata
    page.tsx          # Redirect → /dashboard
    globals.css       # Farb-Tokens (bone, ember, clay, ink)
    login/page.tsx    # Login + Registrierung
    dashboard/page.tsx
  lib/
    supabase.ts       # createBrowserClient
    auth-context.tsx  # AuthProvider, useAuth, signIn/signUp/signOut
  middleware.ts       # Route-Guard: unauthenticated → /login
```

---

## Obsidian-Vault

Aufgaben, Bugs und externe Dienste werden in Obsidian verwaltet:
`C:\ClaudeBusiness\Orga-und-Allgemeines\PMS Obsidian\`

Orga-Repo pullen vor Bearbeitung:
```powershell
cd "C:\ClaudeBusiness\Orga-und-Allgemeines"
git pull
```

---

## Wichtige Regeln

- Jedes Projekt hat eine **eigene** Supabase-Instanz — niemals mit anderen Projekten teilen
- Erst einrichten, dann Dokumentation updaten
- RLS auf allen Tabellen
