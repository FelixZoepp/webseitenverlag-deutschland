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

