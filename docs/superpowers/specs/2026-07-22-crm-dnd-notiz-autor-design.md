# CRM: Drag & Drop, Notiz-Autor, Hendrik-Admin — Design

Datum: 2026-07-22
Status: Vom Nutzer freigegeben (Chat)

## Ziel

Drei Verbesserungen am Admin-CRM (`app/admin/crm/page.tsx`):

1. Leads per Drag & Drop zwischen Pipeline-Spalten verschieben
2. Bei jeder Notiz anzeigen, wer sie geschrieben hat
3. Hendrik bekommt einen eigenen Admin-Account

## 1. Drag & Drop in der Kanban-Pipeline

**Ansatz:** Natives HTML5-Drag-and-Drop, keine neue Dependency.

- Lead-Karten bekommen `draggable`; `onDragStart` merkt sich die Lead-ID
- Jede Stage-Spalte ist Drop-Zone (`onDragOver` mit `preventDefault`, `onDrop`)
- Beim Drüberziehen hebt sich die Ziel-Spalte visuell hervor (z. B. Hintergrund/Rahmen in Stage-Akzentfarbe)
- **Drop:** optimistisches Update im State (Karte wechselt sofort die Spalte), dann bestehender Call `PATCH /api/admin/leads/[leadId]` mit `{ crm_stage }` — exakt derselbe Endpoint wie das Dropdown im Detail-Panel
- **Fehlerfall:** State-Rollback auf die alte Stage + bestehende Fehleranzeige oben
- Drop auf die eigene Spalte: kein API-Call
- Klick auf die Karte öffnet weiterhin das Detail-Panel (Drag und Klick dürfen sich nicht in die Quere kommen)

**Bewusst ausgeschlossen:** Touch-/Handy-Support (wird nicht gebraucht). Auf Touch-Geräten bleibt der Stage-Wechsel über das Dropdown im Detail-Panel.

## 2. Notiz-Autor

**Datenbank** — Migration `supabase/migrations/034_notiz_autor.sql`:

```sql
alter table lead_notes add column autor text;
```

**API:**

- `POST /api/admin/leads/[leadId]/notizen`: schreibt automatisch die E-Mail des eingeloggten Admins (`auth.data.user.email` aus `requireAdmin`) in `autor`. Kein Client-Input — nicht fälschbar.
- `GET`-Routen (`notizen` und `/api/admin/crm`) liefern `autor` mit aus.

**Anzeige** (`app/admin/crm/page.tsx`):

- Anzeigename = Teil der E-Mail vor dem `@`, erster Buchstabe groß (z. B. `felix@zoeppmedia.de` → „Felix")
- Detail-Panel: pro Notiz „Felix · 22.07.26 14:30"
- Karte: bei „letzte Notiz" Autor mit anzeigen
- Alt-Notizen ohne Autor (`autor is null`): nur Datum, kein Platzhalter

## 3. Hendrik als Admin

- Supabase-Auth-User für `hendrik@hoffmann-wd.de` per **Einladungs-Mail** (Supabase Invite) — er setzt sein Passwort selbst
- `customers`-Eintrag mit `user_id` des neuen Users und `role = 'admin'`
- Einmalige Aktion (Supabase MCP / Dashboard), kein Code nötig — wird im Plan als manueller Schritt geführt

## Fehlerbehandlung

- DnD-PATCH-Fehler: Rollback + Fehlermeldung (bestehendes `error`-Panel)
- Notiz-Speichern unverändert; `autor` ist nullable, kein Breaking Change für Bestandsdaten

## Tests

- Bestehende Teststruktur prüfen (`test/`, `e2e/`); mindestens:
  - API-Test: POST Notiz setzt `autor` auf die Admin-Mail
  - API-Test: GET liefert `autor` mit
- DnD selbst: manueller Check im Browser (natives DnD ist in Playwright/jsdom unzuverlässig; wenn ein bestehendes E2E-Muster passt, ergänzen)

## Nicht im Scope

- Touch-/Mobile-DnD
- Umsortieren innerhalb einer Spalte (Reihenfolge bleibt nach `created_at`)
- Autor-Auswahl per Dropdown (Autor kommt immer vom Login)
