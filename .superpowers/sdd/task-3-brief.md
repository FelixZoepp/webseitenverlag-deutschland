### Task 3: Formular — Label, Starter-Sperre, Reset

**Files:**
- Modify: `app/admin/demos/page.tsx:451` (Paket-Button onClick) und `:519-524` (Checkbox)

**Interfaces:**
- Consumes: States `paket` / `setPaket`, `scrollAnimationen` / `setScrollAnimationen`, `generating` (existieren)
- Produces: unverändertes Payload-Feld `scrollAnimationen: boolean`

- [ ] **Step 1: Paket-Wechsel auf Starter setzt Haken zurück**

In `app/admin/demos/page.tsx` Zeile ~451, im Paket-Button:

```tsx
<button key={p} type="button" onClick={() => setPaket(p)} disabled={generating}
```

ersetzen durch:

```tsx
<button key={p} type="button" onClick={() => { setPaket(p); if (p === 'starter') setScrollAnimationen(false) }} disabled={generating}
```

- [ ] **Step 2: Checkbox — Label + Starter-Sperre**

Zeilen ~519-524 (der Extras-Block) ersetzen:

```tsx
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: scrollAnimationen ? 'rgba(212,168,40,0.08)' : 'rgba(255,255,255,0.7)', border: `1px solid ${scrollAnimationen ? 'var(--za-gold)' : 'var(--za-border)'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--za-fg-2)', transition: '.15s' }}>
                  <input type="checkbox" checked={scrollAnimationen} onChange={(e) => setScrollAnimationen(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--za-gold)' }} disabled={generating} />
                  Scroll-Animationen (Premium)
                </label>
```

durch:

```tsx
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: scrollAnimationen ? 'rgba(212,168,40,0.08)' : 'rgba(255,255,255,0.7)', border: `1px solid ${scrollAnimationen ? 'var(--za-gold)' : 'var(--za-border)'}`, borderRadius: '8px', cursor: paket === 'starter' ? 'not-allowed' : 'pointer', opacity: paket === 'starter' ? 0.5 : 1, fontSize: '12px', fontWeight: 600, color: 'var(--za-fg-2)', transition: '.15s' }}>
                  <input type="checkbox" checked={scrollAnimationen} onChange={(e) => setScrollAnimationen(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--za-gold)' }} disabled={generating || paket === 'starter'} />
                  {paket === 'starter' ? 'Scroll-Animationen — ab Business' : 'Scroll-Animationen (Scroll-Video + Effekte)'}
                </label>
```

- [ ] **Step 3: Prüfen**

Run: `npx tsc --noEmit && npx next build 2>&1 | tail -5`
Expected: Typecheck + Build ohne Fehler.

- [ ] **Step 4: Commit**

```bash
git add app/admin/demos/page.tsx
git commit -m "feat(demos): Scroll-Animationen-Checkbox — Starter gesperrt, Label präzisiert"
```

---

## Abschluss-Verifikation (manuell, nach Deploy)

1. `/admin/demos` → Business-Paket → Haken „Scroll-Animationen (Scroll-Video + Effekte)" → Demo generieren
2. Demo öffnen: Hero-Video spielt beim Scrollen (nicht als Auto-Loop), `data-modus="scrub"` im DOM
3. Starter wählen → Checkbox ausgegraut mit „ab Business", gesetzter Haken verschwindet
4. Demo ohne Haken: Hero weiter als Loop-Video
