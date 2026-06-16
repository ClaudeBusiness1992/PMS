# CLAUDE.md — PMS

Verwaltungs-App für Glowgiver. Wird als Feature-Modul in die Claudia-App integriert.

## Orga & Aufgaben

Zum Projekt gehört ein Obsidian-Vault im Orga-Repo. Dort sind alle offenen Tasks, Bugs und Regeln dokumentiert — **immer zuerst pullen und reinschauen**.

**Obsidian-Vault:** `C:\ClaudeBusiness\Orga-und-Allgemeines\PMS Obsidian\`

```powershell
cd "C:\ClaudeBusiness\Orga-und-Allgemeines"
git pull
```

---

## Projekt

Die bestehende `Verwaltung.html` (React + localStorage) wird als `src/features/verwaltung/` in die **Claudia**-App migriert. Supabase, Auth und Storage sind in Claudia bereits vorhanden.

**Aktives Repo:** `C:\ClaudeBusiness\Claudia\` (GitHub: ClaudeBusiness1992/Claudia)
**Ausgangsbasis:** `C:\ClaudeBusiness\PMS\Verwaltung.html`
