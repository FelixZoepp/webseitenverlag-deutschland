# CRM: Kanban-DnD + Notiz-Autor + Hendrik-Admin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Leads per Drag & Drop durch die CRM-Pipeline schieben und bei jeder Notiz den Autor (eingeloggter Admin) speichern und anzeigen; Hendrik bekommt einen Admin-Account.

**Architecture:** Natives HTML5-DnD direkt in `app/admin/crm/page.tsx` (Client Component), wiederverwendet den bestehenden `PATCH /api/admin/leads/[leadId]`-Endpoint mit optimistischem Update + Rollback. Notiz-Autor als neue nullable Spalte `autor` auf `lead_notes`, serverseitig aus `requireAdmin()` befüllt (kein Client-Input). Anzeigename-Ableitung (`felix@… → „Felix"`) als kleine Pure-Function in `lib/crm/`.

**Tech Stack:** Next.js App Router, Supabase (Postgres + Auth), TypeScript, Test-Skripte als offline `npx tsx scripts/test-*.ts` (Projekt-Muster, kein Jest/Vitest).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-22-crm-dnd-notiz-autor-design.md`
- Keine neuen Dependencies (natives HTML5-DnD, kein @dnd-kit)
- Kein Touch-/Mobile-DnD; Stage-Wechsel per Dropdown im Detail-Panel bleibt bestehen
- `autor` ist nullable — Alt-Notizen ohne Autor zeigen nur das Datum, keinen Platzhalter
- Autor kommt IMMER serverseitig vom Login (`auth.data.user.email`), nie aus dem Request-Body
- Deutsch für UI-Texte, Kommentare und Commit-Scope-Stil des Repos beibehalten (z. B. `feat(crm): …`)
- Tests laufen offline (keine DB-/API-Aufrufe), Muster: `let fehler = 0` + `assert(bedingung, name, meldung)` wie in `scripts/test-phase3.ts`

---

### Task 1: Anzeigename-Helper `anzeigeName` (TDD)

**Files:**
- Create: `lib/crm/anzeige-name.ts`
- Create: `scripts/test-crm.ts`
- Modify: `package.json` (Script `test:crm`)

**Interfaces:**
- Consumes: —
- Produces: `anzeigeName(email: string | null): string | null` — `'felix@zoeppmedia.de' → 'Felix'`, `null/''/'@x.de' → null`. Wird in Task 4 (UI) importiert.

- [ ] **Step 1: Failing Test schreiben**

`scripts/test-crm.ts`:

```ts
/**
 * Test CRM — Anzeigename für Notiz-Autoren.
 * Läuft komplett offline (keine API-/DB-Aufrufe).
 * Aufruf: npm run test:crm
 */
import { anzeigeName } from '../lib/crm/anzeige-name'

let fehler = 0
let geprueft = 0

function assert(bedingung: boolean, name: string, meldung: string) {
  geprueft++
  if (!bedingung) {
    fehler++
    console.error(`  ✗ [${name}] ${meldung}`)
  }
}

console.log('Teil A: anzeigeName')

assert(anzeigeName('felix@zoeppmedia.de') === 'Felix', 'name-felix', 'felix@… muss „Felix" ergeben')
assert(anzeigeName('hendrik@hoffmann-wd.de') === 'Hendrik', 'name-hendrik', 'hendrik@… muss „Hendrik" ergeben')
assert(anzeigeName(null) === null, 'name-null', 'null muss null bleiben')
assert(anzeigeName('') === null, 'name-leer', 'Leerstring muss null ergeben')
assert(anzeigeName('@zoeppmedia.de') === null, 'name-ohne-lokalteil', 'E-Mail ohne Lokalteil muss null ergeben')
assert(anzeigeName('max.mustermann@firma.de') === 'Max.mustermann', 'name-punkt', 'Nur erster Buchstabe wird großgeschrieben')

console.log(`\n${geprueft} Prüfungen, ${fehler} Fehler`)
if (fehler > 0) process.exit(1)
```

In `package.json` unter `"scripts"` ergänzen (nach `"test:scrub"`):

```json
"test:crm": "npx tsx scripts/test-crm.ts",
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `npm run test:crm`
Expected: FAIL — `Cannot find module '../lib/crm/anzeige-name'`

- [ ] **Step 3: Minimale Implementierung**

`lib/crm/anzeige-name.ts`:

```ts
/**
 * Anzeigename für Notiz-Autoren im Admin-CRM:
 * E-Mail-Lokalteil, erster Buchstabe groß (felix@… → „Felix").
 */
export function anzeigeName(email: string | null): string | null {
  if (!email) return null
  const lokalteil = email.split('@')[0]
  if (!lokalteil) return null
  return lokalteil.charAt(0).toUpperCase() + lokalteil.slice(1)
}
```

- [ ] **Step 4: Test laufen lassen — muss bestehen**

Run: `npm run test:crm`
Expected: `6 Prüfungen, 0 Fehler`, Exit-Code 0

- [ ] **Step 5: Commit**

```bash
git add lib/crm/anzeige-name.ts scripts/test-crm.ts package.json
git commit -m "feat(crm): anzeigeName-Helper für Notiz-Autoren (+ test:crm)"
```

---

### Task 2: Migration `034_notiz_autor` + Autor in den APIs

**Files:**
- Create: `supabase/migrations/034_notiz_autor.sql`
- Modify: `app/api/admin/leads/[leadId]/notizen/route.ts`
- Modify: `app/api/admin/crm/route.ts`

**Interfaces:**
- Consumes: `requireAdmin()` aus `lib/auth-helpers` — liefert `auth.data.user` (Supabase-User mit `email`)
- Produces:
  - `lead_notes.autor: text | null` (DB)
  - `GET/POST …/notizen` → `notiz: { id, text, autor: string | null, created_at }`
  - `GET /api/admin/crm` → Leads zusätzlich mit `letzte_notiz_autor: string | null`

- [ ] **Step 1: Migration schreiben**

`supabase/migrations/034_notiz_autor.sql`:

```sql
-- Notiz-Autor: E-Mail des eingeloggten Admins, serverseitig gesetzt.
-- Nullable — Alt-Notizen haben keinen Autor.
alter table lead_notes add column autor text;
```

- [ ] **Step 2: Migration auf Supabase anwenden**

Über den Supabase-MCP: `apply_migration` mit Name `034_notiz_autor` und obigem SQL auf dem Projekt des Webseitenverlags (`list_projects` zum Nachschlagen der Projekt-ID; bei Unsicherheit, welches Projekt: STOPP und Felix fragen).

Verify: `execute_sql` mit `select column_name from information_schema.columns where table_name = 'lead_notes';`
Expected: enthält `autor`

- [ ] **Step 3: Notizen-API erweitern**

In `app/api/admin/leads/[leadId]/notizen/route.ts`:

GET — Select um `autor` erweitern:

```ts
  const { data, error } = await admin
    .from('lead_notes')
    .select('id, text, autor, created_at')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
```

POST — Autor aus dem Login setzen (NICHT aus dem Body) und mit zurückgeben:

```ts
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('lead_notes')
    .insert({ lead_id: leadId, text: parsed.data.text, autor: auth.data.user.email ?? null })
    .select('id, text, autor, created_at')
    .single()
```

- [ ] **Step 4: CRM-Liste um `letzte_notiz_autor` erweitern**

In `app/api/admin/crm/route.ts` den Notiz-Block ersetzen:

```ts
  const leadIds = (leads ?? []).map((l) => l.id)
  const { data: notes } = leadIds.length
    ? await admin
        .from('lead_notes')
        .select('id, lead_id, text, autor, created_at')
        .in('lead_id', leadIds)
        .order('created_at', { ascending: false })
    : { data: [] as never[] }

  const notizenProLead = new Map<string, { anzahl: number; letzte: string | null; letzterAutor: string | null }>()
  for (const note of notes ?? []) {
    const eintrag = notizenProLead.get(note.lead_id) ?? { anzahl: 0, letzte: null, letzterAutor: null }
    eintrag.anzahl += 1
    if (!eintrag.letzte) {
      eintrag.letzte = note.text
      eintrag.letzterAutor = note.autor ?? null
    }
    notizenProLead.set(note.lead_id, eintrag)
  }

  return NextResponse.json({
    leads: (leads ?? []).map((lead) => ({
      ...lead,
      notizen_anzahl: notizenProLead.get(lead.id)?.anzahl ?? 0,
      letzte_notiz: notizenProLead.get(lead.id)?.letzte ?? null,
      letzte_notiz_autor: notizenProLead.get(lead.id)?.letzterAutor ?? null,
    })),
  })
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: keine neuen Fehler in den beiden Routen (Bestandsfehler anderswo ignorieren, falls vorhanden — vorher mit `git stash && npx tsc --noEmit && git stash pop` Baseline prüfen, wenn unklar)

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/034_notiz_autor.sql "app/api/admin/leads/[leadId]/notizen/route.ts" app/api/admin/crm/route.ts
git commit -m "feat(crm): Notiz-Autor — Migration 034 + Autor in Notizen- und CRM-API"
```

---

### Task 3: Drag & Drop im Kanban-Board

**Files:**
- Modify: `app/admin/crm/page.tsx`

**Interfaces:**
- Consumes: bestehender `PATCH /api/admin/leads/[leadId]` mit Body `{ crm_stage }` (unverändert)
- Produces: — (reine UI)

- [ ] **Step 1: `stageWechseln` auf optimistisches Update + Rollback umbauen**

In `app/admin/crm/page.tsx` die Funktion `stageWechseln` komplett ersetzen:

```ts
  async function stageWechseln(lead: CrmLead, stage: CrmStage) {
    if (lead.crm_stage === stage) return
    const vorher = lead.crm_stage
    setBusy(true)
    setError(null)
    // Optimistisch: Karte wechselt sofort die Spalte, bei Fehler Rollback.
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, crm_stage: stage } : l)))
    setAktiv((prev) => (prev && prev.id === lead.id ? { ...prev, crm_stage: stage } : prev))
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crm_stage: stage }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Stage-Wechsel fehlgeschlagen.')
      }
    } catch (e) {
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, crm_stage: vorher } : l)))
      setAktiv((prev) => (prev && prev.id === lead.id ? { ...prev, crm_stage: vorher } : prev))
      setError(e instanceof Error ? e.message : 'Netzwerkfehler beim Stage-Wechsel.')
    } finally {
      setBusy(false)
    }
  }
```

- [ ] **Step 2: DnD-State + Handler ergänzen**

Nach den bestehenden `useState`-Zeilen:

```ts
  const [dragLeadId, setDragLeadId] = useState<string | null>(null)
  const [dropStage, setDropStage] = useState<CrmStage | null>(null)
```

Vor dem `return` einen Drop-Handler:

```ts
  function handleDrop(stageKey: CrmStage) {
    const id = dragLeadId
    setDragLeadId(null)
    setDropStage(null)
    if (!id) return
    const lead = leads.find((l) => l.id === id)
    if (!lead || lead.crm_stage === stageKey) return
    stageWechseln(lead, stageKey)
  }
```

- [ ] **Step 3: Spalten als Drop-Zonen, Karten draggable**

Das Spalten-Wrapper-`div` (`<div key={stage.key} style={{ minWidth: '250px', … }}>`) bekommt Drop-Handler und Hervorhebung:

```tsx
              <div
                key={stage.key}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (dropStage !== stage.key) setDropStage(stage.key) }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropStage((prev) => (prev === stage.key ? null : prev)) }}
                onDrop={(e) => { e.preventDefault(); handleDrop(stage.key) }}
                style={{
                  minWidth: '250px', width: '250px', flexShrink: 0,
                  borderRadius: '10px',
                  outline: dropStage === stage.key ? `2px dashed ${stage.accent}` : 'none',
                  outlineOffset: '2px',
                  transition: 'outline-color 120ms',
                }}
              >
```

Die Lead-Karte (`<button key={lead.id} …>`) wird draggable:

```tsx
                    <button
                      key={lead.id}
                      onClick={() => oeffnen(lead)}
                      draggable
                      onDragStart={(e) => { e.dataTransfer.setData('text/plain', lead.id); e.dataTransfer.effectAllowed = 'move'; setDragLeadId(lead.id) }}
                      onDragEnd={() => { setDragLeadId(null); setDropStage(null) }}
                      className="panel"
                      style={{ padding: '12px 14px', textAlign: 'left', cursor: 'grab', width: '100%', borderLeft: `3px solid ${stage.accent}`, opacity: dragLeadId === lead.id ? 0.4 : 1 }}
                    >
```

- [ ] **Step 4: Typecheck + manueller Browser-Check**

Run: `npx tsc --noEmit` → Expected: keine neuen Fehler.

Dann `npm run dev`, als Admin einloggen, `/admin/crm`:
- Karte in andere Spalte ziehen → wechselt sofort, Ziel-Spalte war beim Ziehen gestrichelt umrandet
- Seite neu laden → Karte ist in der neuen Spalte (DB gespeichert)
- Klick auf Karte öffnet weiterhin das Detail-Panel
- Dropdown im Detail-Panel wechselt weiterhin die Stage

- [ ] **Step 5: Commit**

```bash
git add app/admin/crm/page.tsx
git commit -m "feat(crm): Kanban-Drag-and-Drop mit optimistischem Update und Rollback"
```

---

### Task 4: Notiz-Autor in der CRM-UI anzeigen

**Files:**
- Modify: `app/admin/crm/page.tsx`

**Interfaces:**
- Consumes: `anzeigeName(email: string | null): string | null` aus `lib/crm/anzeige-name` (Task 1); API-Felder `autor` und `letzte_notiz_autor` (Task 2)
- Produces: — (reine UI)

- [ ] **Step 1: Typen + Import ergänzen**

In `app/admin/crm/page.tsx`:

```ts
import { anzeigeName } from '@/lib/crm/anzeige-name'
```

`interface CrmLead` ergänzen um:

```ts
  letzte_notiz_autor: string | null
```

`interface Notiz` ergänzen um:

```ts
  autor: string | null
```

- [ ] **Step 2: Anzeige im Detail-Panel**

Die Datumszeile pro Notiz (`<div style={{ fontSize: '10px', … }}>{formatDate(n.created_at)}</div>`) ersetzen durch:

```tsx
                      <div style={{ fontSize: '10px', color: 'var(--za-fg-3)', marginTop: '4px' }}>
                        {[anzeigeName(n.autor), formatDate(n.created_at)].filter(Boolean).join(' · ')}
                      </div>
```

- [ ] **Step 3: Anzeige auf der Karte**

Den „letzte Notiz"-Block auf der Karte ersetzen durch:

```tsx
                      {lead.letzte_notiz && (
                        <div style={{ fontSize: '10px', color: 'var(--za-fg-3)', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic' }}>
                          {anzeigeName(lead.letzte_notiz_autor) ? `${anzeigeName(lead.letzte_notiz_autor)}: ` : ''}„{lead.letzte_notiz}“
                        </div>
                      )}
```

- [ ] **Step 4: Tests + Typecheck + manueller Check**

Run: `npm run test:crm` → Expected: 0 Fehler.
Run: `npx tsc --noEmit` → Expected: keine neuen Fehler.

Browser (`/admin/crm`): neue Notiz als Felix anlegen → im Panel steht „Felix · <Datum>", auf der Karte „Felix: „<Text>"". Eine Alt-Notiz (ohne Autor) zeigt nur das Datum.

- [ ] **Step 5: Commit**

```bash
git add app/admin/crm/page.tsx
git commit -m "feat(crm): Notiz-Autor im Detail-Panel und auf den Karten anzeigen"
```

---

### Task 5: Hendrik als Admin anlegen (manuell + SQL)

**Files:** — (kein Code; einmalige Aktion)

**Interfaces:**
- Consumes: Supabase-Projekt (Auth + `customers`-Tabelle mit `role`)
- Produces: Admin-Login für `hendrik@hoffmann-wd.de`

- [ ] **Step 1: Einladung verschicken (Felix, manuell)**

Supabase Dashboard → Authentication → Users → „Invite user" → `hendrik@hoffmann-wd.de`. Hendrik setzt über den Mail-Link sein Passwort selbst.

*(Dieser Schritt braucht Felix — der Ausführende STOPPT hier und bittet Felix, die Einladung zu verschicken, bevor es weitergeht.)*

- [ ] **Step 2: Admin-Rolle setzen**

Nachdem der Auth-User existiert, per Supabase-MCP `execute_sql`:

```sql
insert into customers (user_id, contact_email, role)
select id, email, 'admin'
from auth.users
where email = 'hendrik@hoffmann-wd.de'
  and not exists (select 1 from customers where customers.user_id = auth.users.id);
```

Verify:

```sql
select c.role, u.email from customers c join auth.users u on u.id = c.user_id
where u.email = 'hendrik@hoffmann-wd.de';
```

Expected: eine Zeile mit `role = 'admin'`

- [ ] **Step 3: Login-Check**

Hendrik (oder Felix mit Hendriks Zugang) loggt sich ein und öffnet `/admin/crm` → Board lädt, keine 403-Meldung.

---

## Abschluss

- [ ] `npm run test:crm` + `npx tsc --noEmit` grün
- [ ] Manueller Gesamtdurchlauf: Karte ziehen, Notiz anlegen, Autor sichtbar
- [ ] Branch-Frage klären: Arbeit liegt auf `feat/template-galabau` — vor Deploy mit Felix klären, ob so mergen oder auf eigenen Branch
