# Section-Varianten Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 new optional flagship sections (Trust-Grid, Logo-Marquee, Horizontal Process-Scroller, Project References) that branches can opt into via their profile config.

**Architecture:** Each section follows the existing pattern: type in `types.ts`, CSS in `css.ts`, render function in `sections.ts`, conditional insertion in `render.ts`. All 4 are optional fields on `FlagshipInhalte` — existing configs without them continue to work unchanged.

**Tech Stack:** TypeScript, inline CSS/HTML generation (flagship engine)

## Global Constraints

- All 4 sections are optional — existing demos must not break (270 test checks must pass)
- Follow existing patterns: `esc()` for text, `escAttr()` for attributes, `hl()` for headline highlights, `icon()` for SVG icons, `mediaSlot()` for images
- Use `--i` stagger variable (not old `.d1/.d2/.d3` classes)
- CSS uses design token variables via `rgb()` helper for rgba derivations
- `prefers-reduced-motion` block must not break (marquee animation disabled)
- Verification: `npx tsc --noEmit` + `npx tsx scripts/test-flagship.ts` (270 checks, 0 errors)

---

### Task 1: Types — Add 4 new interfaces to FlagshipInhalte

**Files:**
- Modify: `lib/flagship/types.ts`

**Interfaces:**
- Produces: `NachweiseInhalt`, `MarkenInhalt`, `ProzessInhalt`, `ReferenzenInhalt` types + optional fields on `FlagshipInhalte`

- [ ] **Step 1: Add the 4 new interfaces**

In `lib/flagship/types.ts`, find the section where other `*Inhalt` interfaces are defined (after `FooterInhalt`, before `FlagshipInhalte`). Add:

```typescript
export interface NachweiseInhalt {
  eyebrow: string
  headline: string
  items: { label: string; beschreibung?: string; icon?: IconKey }[]
}

export interface MarkenInhalt {
  label?: string
  logos: { name: string; url?: string }[]
}

export interface ProzessInhalt {
  eyebrow: string
  headline: string
  schritte: { titel: string; text: string; media?: MediaSlot; icon?: IconKey }[]
}

export interface ReferenzenInhalt {
  eyebrow: string
  headline: string
  projekte: {
    titel: string
    typ: string
    kennzahlen: { label: string; wert: string }[]
    als: 'muster' | 'kundenbelegt'
  }[]
}
```

- [ ] **Step 2: Add optional fields to FlagshipInhalte**

Find the `FlagshipInhalte` interface. Add 4 optional fields after `ablauf`:

```typescript
  nachweise?: NachweiseInhalt
  marken?: MarkenInhalt
  prozess?: ProzessInhalt
  referenzen?: ReferenzenInhalt
```

- [ ] **Step 3: Verify**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -10`
Expected: No errors

Run: `cd ~/webseitenverlag-deutschland && npx tsx scripts/test-flagship.ts 2>&1 | tail -5`
Expected: 270 Prüfungen, 0 Fehler

- [ ] **Step 4: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add lib/flagship/types.ts
git commit -m "feat(flagship): add NachweiseInhalt, MarkenInhalt, ProzessInhalt, ReferenzenInhalt types"
```

---

### Task 2: CSS for all 4 new sections

**Files:**
- Modify: `lib/flagship/css.ts`

**Interfaces:**
- Consumes: `rgb()` helper, `t` (tokens), `hell` (boolean), `r` (radius), `flaeche`, `tiefe`, `shadow` from existing `flagshipCss()`
- Produces: CSS classes `.nachweise-grid`, `.nw-card`, `.marquee`, `.marquee-track`, `.marquee-item`, `.prozess-scroll`, `.proz-station`, `.ref-section`, `.ref-grid`, `.ref-card`

- [ ] **Step 1: Add CSS for all 4 sections**

In `lib/flagship/css.ts`, find the end of the `flagshipCss()` template string — just before the `prefers-reduced-motion` media query block (the line starting with `@media(prefers-reduced-motion:reduce)`). Insert the following CSS block BEFORE it:

```typescript
/* Nachweise-Grid */
.nachweise-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px}
@media(max-width:820px){.nachweise-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.nachweise-grid{grid-template-columns:1fr}}
.nw-card{background:var(--flaeche);border:1px solid var(--line);border-radius:var(--r);padding:28px 24px;transition:.3s;overflow:hidden;position:relative}
.nw-card::after{content:"";position:absolute;inset:0;opacity:0;background:linear-gradient(135deg,rgba(${rgb(t.akzent1)},.06),transparent 60%);transition:opacity .4s;pointer-events:none}
.nw-card:hover::after{opacity:1}
.nw-card:hover{transform:translateY(-4px);box-shadow:var(--shadow)}
.nw-card .ic{width:48px;height:48px;border-radius:14px;background:var(--panel);display:grid;place-items:center;margin-bottom:16px;transition:.3s}
.nw-card:hover .ic{background:var(--ak1);box-shadow:var(--glow)}
.nw-card .ic svg{width:24px;height:24px}
.nw-card h3{font-size:1rem;margin-bottom:6px}
.nw-card p{font-size:.88rem;color:var(--soft)}

/* Partner-Marquee */
.marquee{overflow:hidden;padding:28px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--flaeche)}
.marquee-label{text-align:center;font-size:.78rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--soft);margin-bottom:20px;padding:0 24px}
.marquee-track{display:flex;gap:48px;animation:mscroll 30s linear infinite;width:max-content;align-items:center}
.marquee-track:hover{animation-play-state:paused}
.marquee-item{font-family:var(--sans);font-size:1.1rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--soft);white-space:nowrap;opacity:.5;filter:grayscale(1);transition:opacity .3s,filter .3s,color .3s}
.marquee-item:hover{opacity:1;filter:grayscale(0);color:var(--ak1)}
.marquee-item img{height:32px;width:auto;filter:grayscale(1);opacity:.5;transition:.3s}
.marquee-item:hover img{filter:grayscale(0);opacity:1}
@keyframes mscroll{to{transform:translateX(-50%)}}

/* Prozess-Scroller */
.prozess-scroll{display:flex;gap:24px;overflow-x:auto;scroll-snap-type:x mandatory;padding:48px 0 24px;-webkit-overflow-scrolling:touch}
.prozess-scroll::-webkit-scrollbar{height:4px}
.prozess-scroll::-webkit-scrollbar-thumb{background:var(--line);border-radius:2px}
.proz-station{flex:0 0 280px;scroll-snap-align:start;background:var(--flaeche);border:1px solid var(--line);border-radius:var(--r);overflow:hidden;transition:.3s;position:relative}
.proz-station::after{content:"";position:absolute;inset:0;opacity:0;background:linear-gradient(135deg,rgba(${rgb(t.akzent1)},.06),transparent 60%);transition:opacity .4s;pointer-events:none}
.proz-station:hover::after{opacity:1}
.proz-station:hover{transform:translateY(-4px);box-shadow:var(--shadow)}
.proz-media{aspect-ratio:16/9;overflow:hidden}
.proz-media img{width:100%;height:100%;object-fit:cover}
.proz-body{padding:24px 20px}
.proz-num{font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${hell ? 'var(--soft)' : 'var(--ak2)'};margin-bottom:8px}
.proz-station h3{font-size:1.05rem;margin-bottom:8px}
.proz-station p{font-size:.9rem;color:var(--soft);line-height:1.55}
@media(max-width:640px){.prozess-scroll{flex-direction:column}.proz-station{flex:none;width:100%}}

/* Referenzen */
.ref-section{background:var(--tiefe);${hell ? 'color:#fff' : ''}}
${hell ? '.ref-section .eyebrow{color:rgba(255,255,255,.7)}\n.ref-section h2{color:#fff}' : ''}
.ref-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:52px}
@media(max-width:820px){.ref-grid{grid-template-columns:1fr}}
.ref-card{background:${hell ? 'rgba(255,255,255,.06)' : 'var(--panel)'};border:1px solid ${hell ? 'rgba(255,255,255,.1)' : 'var(--line)'};border-radius:var(--r);padding:32px 28px;transition:.3s;position:relative;overflow:hidden}
.ref-card::after{content:"";position:absolute;inset:0;opacity:0;background:linear-gradient(135deg,rgba(${rgb(t.akzent1)},.08),transparent 60%);transition:opacity .4s;pointer-events:none}
.ref-card:hover::after{opacity:1}
.ref-card:hover{transform:translateY(-4px);border-color:rgba(${rgb(t.akzent1)},.4)}
.ref-typ{font-size:.78rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${hell ? 'var(--ak1)' : 'var(--ak2)'};margin-bottom:10px}
.ref-card h3{font-size:1.2rem;margin-bottom:16px;${hell ? 'color:#fff' : ''}}
.ref-kz{display:flex;flex-wrap:wrap;gap:12px 24px}
.ref-kz span{font-size:.88rem;color:${hell ? 'rgba(255,255,255,.6)' : 'var(--soft)'}}
.ref-kz b{color:${hell ? '#fff' : 'var(--text)'};font-weight:700}
.ref-muster{font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${hell ? 'rgba(255,255,255,.4)' : 'var(--soft)'};opacity:.6;margin-top:16px}
```

Also add to the `prefers-reduced-motion` block:

```css
.marquee-track{animation:none;flex-wrap:wrap;justify-content:center;gap:24px;padding:0 24px}
```

- [ ] **Step 2: Verify**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -10`
Expected: No errors

Run: `cd ~/webseitenverlag-deutschland && npx tsx scripts/test-flagship.ts 2>&1 | tail -5`
Expected: 270 Prüfungen, 0 Fehler

- [ ] **Step 3: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add lib/flagship/css.ts
git commit -m "feat(flagship): add CSS for nachweise-grid, marquee, prozess-scroller, referenzen"
```

---

### Task 3: Render functions for all 4 sections + sektionsReihenfolge

**Files:**
- Modify: `lib/flagship/sections.ts`

**Interfaces:**
- Consumes: Types from Task 1, CSS classes from Task 2
- Produces: `renderNachweise()`, `renderMarken()`, `renderProzess()`, `renderReferenzen()` functions + updated `sektionsReihenfolge()`

- [ ] **Step 1: Add imports for new types**

At the top of `sections.ts`, find the type imports (line 6-9). Add the new types:

```typescript
import type {
  AblaufInhalt, ConversionInhalt, EmpathieInhalt, ErgebnisseInhalt, FaktenInhalt,
  FaqInhalt, FlagshipInhalte, FooterInhalt, HeroInhalt, LeistungenInhalt,
  LokalInhalt, MarkenInhalt, NachweiseInhalt, NavInhalt, ProzessInhalt,
  ReferenzenInhalt, SignatureInhalt, StimmenInhalt, ZahlenInhalt,
} from './types'
```

- [ ] **Step 2: Add `renderNachweise()` function**

Add after `renderFakten()`:

```typescript
export function renderNachweise(n: NachweiseInhalt): string {
  const karten = n.items
    .map((item, i) => {
      const ic = item.icon ? `<div class="ic">${icon(item.icon)}</div>` : `<div class="ic">${icon('shield')}</div>`
      const desc = item.beschreibung ? `\n        <p>${esc(item.beschreibung)}</p>` : ''
      return `<div class="nw-card rv" style="--i:${i}">
        ${ic}
        <h3>${esc(item.label)}</h3>${desc}
      </div>`
    })
    .join('\n      ')
  return `<!-- sektion:nachweise -->
<section id="nachweise">
  <div class="wrap">
    <div class="rv" style="max-width:640px">
      <span class="eyebrow">${esc(n.eyebrow)}</span>
      <h2>${hl(n.headline)}</h2>
    </div>
    <div class="nachweise-grid">
      ${karten}
    </div>
  </div>
</section>`
}
```

- [ ] **Step 3: Add `renderMarken()` function**

Add after `renderNachweise()`:

```typescript
export function renderMarken(m: MarkenInhalt): string {
  const items = m.logos
    .map((l) => l.url
      ? `<span class="marquee-item"><img src="${escAttr(l.url)}" alt="${escAttr(l.name)}"></span>`
      : `<span class="marquee-item">${esc(l.name)}</span>`)
    .join('\n      ')
  // Duplicate for seamless loop
  const track = `${items}\n      ${items}`
  const label = m.label ? `<div class="marquee-label">${esc(m.label)}</div>` : ''
  return `<!-- sektion:marken -->
<div class="marquee">
  ${label}<div class="marquee-track">
      ${track}
    </div>
</div>`
}
```

- [ ] **Step 4: Add `renderProzess()` function**

Add after `renderMarken()`:

```typescript
export function renderProzess(p: ProzessInhalt): string {
  const stationen = p.schritte
    .map((s, i) => {
      const mediaPart = s.media
        ? `<div class="proz-media">${mediaSlot(s.media, 'proz-media')}</div>`
        : s.icon
          ? `<div class="proz-media" style="display:grid;place-items:center;background:var(--panel)">${icon(s.icon, 3)}</div>`
          : ''
      return `<div class="proz-station rv" style="--i:${i}">
        ${mediaPart}<div class="proz-body">
          <div class="proz-num">Schritt ${String(i + 1).padStart(2, '0')}</div>
          <h3>${esc(s.titel)}</h3>
          <p>${esc(s.text)}</p>
        </div>
      </div>`
    })
    .join('\n      ')
  return `<!-- sektion:prozess -->
<section id="prozess">
  <div class="wrap">
    <div class="rv" style="max-width:660px">
      <span class="eyebrow">${esc(p.eyebrow)}</span>
      <h2>${hl(p.headline)}</h2>
    </div>
    <div class="prozess-scroll">
      ${stationen}
    </div>
  </div>
</section>`
}
```

- [ ] **Step 5: Add `renderReferenzen()` function**

Add after `renderProzess()`:

```typescript
export function renderReferenzen(r: ReferenzenInhalt): string {
  const projekte = r.projekte
    .map((p, i) => {
      const kz = p.kennzahlen
        .map((k) => `<span><b>${esc(k.wert)}</b> ${esc(k.label)}</span>`)
        .join('\n          ')
      const muster = p.als === 'muster' ? '\n        <div class="ref-muster">Beispielprojekt</div>' : ''
      return `<div class="ref-card rv" style="--i:${i}">
        <div class="ref-typ">${esc(p.typ)}</div>
        <h3>${esc(p.titel)}</h3>
        <div class="ref-kz">
          ${kz}
        </div>${muster}
      </div>`
    })
    .join('\n      ')
  return `<!-- sektion:referenzen -->
<section class="ref-section" id="referenzen">
  <div class="wrap">
    <div class="rv" style="max-width:660px">
      <span class="eyebrow">${esc(r.eyebrow)}</span>
      <h2>${hl(r.headline)}</h2>
    </div>
    <div class="ref-grid">
      ${projekte}
    </div>
  </div>
</section>`
}
```

- [ ] **Step 6: Update `sektionsReihenfolge()`**

Find `sektionsReihenfolge()` at the bottom of sections.ts. Replace:

```typescript
export function sektionsReihenfolge(inhalte: FlagshipInhalte): string[] {
  const liste = ['nav', 'hero', 'fakten', 'empathie', 'signature', 'leistungen']
  if (inhalte.ablauf) liste.push('ablauf')
  liste.push('ergebnisse', 'zahlen', 'stimmen', 'lokal', 'faq', 'conversion', 'footer')
  return liste
}
```

With:

```typescript
export function sektionsReihenfolge(inhalte: FlagshipInhalte): string[] {
  const liste = ['nav', 'hero', 'fakten']
  if (inhalte.marken) liste.push('marken')
  if (inhalte.nachweise) liste.push('nachweise')
  liste.push('empathie', 'signature', 'leistungen')
  if (inhalte.prozess) liste.push('prozess')
  if (inhalte.ablauf) liste.push('ablauf')
  liste.push('ergebnisse')
  if (inhalte.referenzen) liste.push('referenzen')
  liste.push('zahlen', 'stimmen', 'lokal', 'faq', 'conversion', 'footer')
  return liste
}
```

- [ ] **Step 7: Verify**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -10`
Expected: No errors

Run: `cd ~/webseitenverlag-deutschland && npx tsx scripts/test-flagship.ts 2>&1 | tail -5`
Expected: 270 Prüfungen, 0 Fehler

- [ ] **Step 8: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add lib/flagship/sections.ts
git commit -m "feat(flagship): add renderNachweise, renderMarken, renderProzess, renderReferenzen + updated section order"
```

---

### Task 4: Wire new sections into render.ts

**Files:**
- Modify: `lib/flagship/render.ts`

**Interfaces:**
- Consumes: Render functions from Task 3, types from Task 1

- [ ] **Step 1: Add imports for new render functions**

In `render.ts`, update the import from `./sections` (lines 11-15). Add the 4 new functions:

```typescript
import {
  renderAblauf, renderConversion, renderEmpathie, renderErgebnisse, renderFakten,
  renderFaq, renderFooter, renderHero, renderLeistungen, renderLokal, renderMarken,
  renderNav, renderNachweise, renderProzess, renderReferenzen, renderRibbon,
  renderSignature, renderStimmen, renderZahlen,
} from './sections'
```

- [ ] **Step 2: Update the body array in renderFlagshipPage()**

Find the `const body = [...]` array (lines 50-66). Replace it with:

```typescript
  const body = [
    renderNav(inhalte.nav, hell, funnelUrl),
    renderHero(inhalte.hero, hell, funnelUrl),
    renderFakten(inhalte.fakten),
    inhalte.marken ? renderMarken(inhalte.marken) : '',
    inhalte.nachweise ? renderNachweise(inhalte.nachweise) : '',
    renderEmpathie(inhalte.empathie),
    renderSignature(inhalte.signature),
    renderLeistungen(inhalte.leistungen),
    inhalte.prozess ? renderProzess(inhalte.prozess) : '',
    inhalte.ablauf ? renderAblauf(inhalte.ablauf) : '',
    renderErgebnisse(inhalte.ergebnisse),
    inhalte.referenzen ? renderReferenzen(inhalte.referenzen) : '',
    renderZahlen(inhalte.zahlen),
    renderStimmen(inhalte.stimmen),
    renderLokal(inhalte.lokal),
    renderFaq(inhalte.faq),
    renderConversion(inhalte.conversion, hell, funnelUrl, funnelLabel),
    renderFooter(inhalte.footer, inhalte.nav, hell, meta.firma),
    opts.demo ? renderRibbon() : '',
  ].filter(Boolean).join('\n\n')
```

- [ ] **Step 3: Verify**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -10`
Expected: No errors

Run: `cd ~/webseitenverlag-deutschland && npx tsx scripts/test-flagship.ts 2>&1 | tail -5`
Expected: 270 Prüfungen, 0 Fehler

- [ ] **Step 4: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add lib/flagship/render.ts
git commit -m "feat(flagship): wire nachweise, marken, prozess, referenzen into render pipeline"
```

---

### Task 5: End-to-End Verification

**Files:**
- No file changes

- [ ] **Step 1: Full TypeScript check**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty`
Expected: Clean, zero errors

- [ ] **Step 2: Flagship stress test**

Run: `cd ~/webseitenverlag-deutschland && npx tsx scripts/test-flagship.ts`
Expected: 270 Prüfungen, 0 Fehler

- [ ] **Step 3: Review all changes**

Run: `cd ~/webseitenverlag-deutschland && git log --oneline -4 && echo "---" && git diff HEAD~4 --stat`
Expected: 4 commits, 4 files changed:
- `lib/flagship/types.ts`
- `lib/flagship/css.ts`
- `lib/flagship/sections.ts`
- `lib/flagship/render.ts`
