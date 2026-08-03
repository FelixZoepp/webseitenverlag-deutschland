# Scrub-Story Multipage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add multipage support to the scrub-story-v1 template so customers get subpages (Karriere, Erfahrungen, Kontakt, Leistungen) alongside the scroll-scrub hero homepage.

**Architecture:** Extend `ScrubConfig` with optional `unterseiten` content blocks. The scrub homepage stays as-is (scroll-scrub hero). New function `renderScrubUnterseite()` renders subpages using scrub design tokens (dark theme, Inter Tight font, ss-* CSS classes). Navigation in the scrub header gets extended with page links. Routing in `auslieferung.ts` dispatches scrub subpage requests.

**Tech Stack:** TypeScript, Next.js, server-rendered HTML (same pattern as existing flagship sections), Supabase (SEO cron)

## Global Constraints

- All HTML is server-rendered, self-contained, no external CDNs
- CSS uses scrub design tokens (`--ss-bg`, `--ss-text`, `--ss-akzent`, `--ss-cyan`)
- Font: Inter Tight (already loaded in scrub CSS)
- Section HTML follows the `<!-- sektion:ss-{name} -->` comment pattern
- Escaping: always use `esc()` for text, `escAttr()` for attributes
- No new npm dependencies

---

### Task 1: Extend ScrubConfig type with subpage content

**Files:**
- Modify: `lib/flagship/scrub/types.ts`

**Interfaces:**
- Produces: `ScrubUnterseiten`, `ScrubKarriereInhalt`, `ScrubErfahrungenInhalt`, `ScrubLeistungenInhalt` types; `SCRUB_UNTERSEITEN` constant

- [ ] **Step 1: Add subpage types to `lib/flagship/scrub/types.ts`**

After the `ScrubInhalte` interface, add:

```typescript
/** Karriere-Seite: Stellenangebote, Benefits, Bewerbungsformular */
export interface ScrubKarriereInhalt {
  eyebrow: string
  headline: string
  lead: string
  benefits: { icon: string; titel: string; text: string }[]
  stellen: { titel: string; ort: string; typ: string; beschreibung: string }[]
  cta_label: string
}

/** Erfahrungen/Testimonials: Mitarbeiter- und Kundenstimmen */
export interface ScrubErfahrungenInhalt {
  eyebrow: string
  headline: string
  stimmen: { name: string; rolle: string; text: string; initialen: string }[]
  fallstudien: { titel: string; kunde: string; ergebnis: string; beschreibung: string }[]
}

/** Leistungen-Seite: Detaillierte Services */
export interface ScrubLeistungenInhalt {
  eyebrow: string
  headline: string
  lead: string
  leistungen: { titel: string; text: string; icon: string }[]
}

/** Optionale Unterseiten-Inhalte im Scrub-Config */
export interface ScrubUnterseiten {
  karriere?: ScrubKarriereInhalt
  erfahrungen?: ScrubErfahrungenInhalt
  leistungen?: ScrubLeistungenInhalt
}

export type ScrubUnterseitenSlug = 'karriere' | 'erfahrungen' | 'leistungen' | 'kontakt'

export const SCRUB_UNTERSEITEN: { slug: ScrubUnterseitenSlug; label: string }[] = [
  { slug: 'leistungen', label: 'Leistungen' },
  { slug: 'erfahrungen', label: 'Erfahrungen' },
  { slug: 'karriere', label: 'Karriere' },
  { slug: 'kontakt', label: 'Kontakt' },
]
```

- [ ] **Step 2: Add `unterseiten` field to `ScrubConfig`**

In the `ScrubConfig` interface, add after `herkunft`:

```typescript
  /** Unterseiten-Inhalte (Karriere, Erfahrungen, Leistungen) — wenn gesetzt, wird die Nav erweitert */
  unterseiten?: ScrubUnterseiten
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add lib/flagship/scrub/types.ts
git commit -m "feat(scrub): add multipage types (Karriere, Erfahrungen, Leistungen)"
```

---

### Task 2: Build subpage section renderers

**Files:**
- Create: `lib/flagship/scrub/unterseiten.ts`

**Interfaces:**
- Consumes: `ScrubKarriereInhalt`, `ScrubErfahrungenInhalt`, `ScrubLeistungenInhalt`, `ScrubInhalte['kontakt']` from types.ts
- Produces: `renderScrubKarriere()`, `renderScrubErfahrungen()`, `renderScrubLeistungen()`, `renderScrubKontaktSeite()`

- [ ] **Step 1: Create `lib/flagship/scrub/unterseiten.ts`**

```typescript
/**
 * Scrub-Story Unterseiten-Renderer.
 * Karriere, Erfahrungen, Leistungen — im dunklen Scrub-Design (ss-* Klassen).
 */

import { esc, escAttr } from '../html'
import type { ScrubKarriereInhalt, ScrubErfahrungenInhalt, ScrubLeistungenInhalt, ScrubInhalte } from './types'

export function renderScrubKarriere(k: ScrubKarriereInhalt, submitZiel?: string | null): string {
  const benefits = k.benefits.map((b) =>
    `<div class="ss-benefit">
      <span class="ss-benefit-icon">${esc(b.icon)}</span>
      <h3>${esc(b.titel)}</h3>
      <p>${esc(b.text)}</p>
    </div>`
  ).join('\n    ')

  const stellen = k.stellen.map((s) =>
    `<div class="ss-stelle">
      <div class="ss-stelle-header">
        <h3>${esc(s.titel)}</h3>
        <div class="ss-stelle-meta"><span>${esc(s.ort)}</span> · <span>${esc(s.typ)}</span></div>
      </div>
      <p>${esc(s.beschreibung)}</p>
      <a class="ss-btn-primary" href="#bewerbung">${esc(k.cta_label)}</a>
    </div>`
  ).join('\n    ')

  const action = submitZiel ? ` action="${escAttr(submitZiel)}" method="post"` : ''

  return `<!-- sektion:ss-karriere -->
<section class="ss-seite">
  <div class="ss-seite-wrap">
    <span class="ss-kicker">${esc(k.eyebrow)}</span>
    <h1 class="ss-title">${esc(k.headline)}</h1>
    <p class="ss-body">${esc(k.lead)}</p>
  </div>
</section>

<section class="ss-seite">
  <div class="ss-seite-wrap">
    <h2 class="ss-h2">Warum bei uns?</h2>
    <div class="ss-benefits-grid">
    ${benefits}
    </div>
  </div>
</section>

<section class="ss-seite">
  <div class="ss-seite-wrap">
    <h2 class="ss-h2">Offene Stellen</h2>
    <div class="ss-stellen-list">
    ${stellen}
    </div>
  </div>
</section>

<section class="ss-seite" id="bewerbung">
  <div class="ss-seite-wrap" style="max-width:640px">
    <h2 class="ss-h2">Jetzt bewerben</h2>
    <form data-kontakt-form${action}>
      <input class="ss-feld" type="text" name="name" placeholder="Vor- und Nachname" required>
      <input class="ss-feld" type="email" name="email" placeholder="E-Mail" required>
      <input class="ss-feld" type="tel" name="telefon" placeholder="Telefon">
      <input class="ss-feld" type="text" name="stelle" placeholder="Gewünschte Stelle">
      <textarea class="ss-feld" name="nachricht" placeholder="Kurz zu Ihnen: Erfahrung, Motivation..."></textarea>
      <label class="ss-check"><input type="checkbox" name="datenschutz" required> <span>Ich habe die <a href="#datenschutz">Datenschutzerklärung</a> gelesen und stimme zu.</span></label>
      <button class="ss-btn-primary" type="submit">${esc(k.cta_label)}</button>
      <p class="ss-form-erfolg" data-form-erfolg>Danke! Wir melden uns innerhalb von 48 Stunden.</p>
    </form>
  </div>
</section>`
}

export function renderScrubErfahrungen(e: ScrubErfahrungenInhalt): string {
  const stimmen = e.stimmen.map((s) =>
    `<div class="ss-stimme">
      <p class="ss-stimme-text">&ldquo;${esc(s.text)}&rdquo;</p>
      <div class="ss-stimme-autor">
        <span class="ss-avatar">${esc(s.initialen)}</span>
        <div><strong>${esc(s.name)}</strong><br><small>${esc(s.rolle)}</small></div>
      </div>
    </div>`
  ).join('\n    ')

  const fallstudien = e.fallstudien.map((f) =>
    `<div class="ss-fallstudie">
      <span class="ss-pill">${esc(f.kunde)}</span>
      <h3>${esc(f.titel)}</h3>
      <p>${esc(f.beschreibung)}</p>
      <div class="ss-ergebnis"><strong>Ergebnis:</strong> ${esc(f.ergebnis)}</div>
    </div>`
  ).join('\n    ')

  return `<!-- sektion:ss-erfahrungen -->
<section class="ss-seite">
  <div class="ss-seite-wrap">
    <span class="ss-kicker">${esc(e.eyebrow)}</span>
    <h1 class="ss-title">${esc(e.headline)}</h1>
  </div>
</section>

<section class="ss-seite">
  <div class="ss-seite-wrap">
    <h2 class="ss-h2">Was unser Team sagt</h2>
    <div class="ss-stimmen-grid">
    ${stimmen}
    </div>
  </div>
</section>

${e.fallstudien.length > 0 ? `<section class="ss-seite">
  <div class="ss-seite-wrap">
    <h2 class="ss-h2">Fallstudien</h2>
    <div class="ss-fallstudien-grid">
    ${fallstudien}
    </div>
  </div>
</section>` : ''}`
}

export function renderScrubLeistungen(l: ScrubLeistungenInhalt): string {
  const items = l.leistungen.map((s, i) =>
    `<div class="ss-leistung">
      <span class="ss-leistung-nr">${String(i + 1).padStart(2, '0')}</span>
      <span class="ss-leistung-icon">${esc(s.icon)}</span>
      <h3>${esc(s.titel)}</h3>
      <p>${esc(s.text)}</p>
    </div>`
  ).join('\n    ')

  return `<!-- sektion:ss-leistungen -->
<section class="ss-seite">
  <div class="ss-seite-wrap">
    <span class="ss-kicker">${esc(l.eyebrow)}</span>
    <h1 class="ss-title">${esc(l.headline)}</h1>
    <p class="ss-body">${esc(l.lead)}</p>
  </div>
</section>

<section class="ss-seite">
  <div class="ss-seite-wrap">
    <div class="ss-leistungen-grid">
    ${items}
    </div>
  </div>
</section>`
}

export function renderScrubKontaktSeite(kontakt: ScrubInhalte['kontakt'], submitZiel?: string | null): string {
  const action = submitZiel ? ` action="${escAttr(submitZiel)}" method="post"` : ''
  return `<!-- sektion:ss-kontakt-seite -->
<section class="ss-seite">
  <div class="ss-seite-wrap" style="max-width:640px">
    <span class="ss-pill">${esc(kontakt.pill)}</span>
    <h1 class="ss-title">${esc(kontakt.h2)}</h1>
    <p class="ss-body">${esc(kontakt.lead)}</p>
    <form data-kontakt-form${action} style="margin-top:32px">
      <input class="ss-feld" type="text" name="name" placeholder="Name" required>
      <input class="ss-feld" type="email" name="email" placeholder="E-Mail" required>
      <input class="ss-feld" type="tel" name="telefon" placeholder="Telefon">
      <textarea class="ss-feld" name="nachricht" placeholder="Ihre Nachricht..."></textarea>
      <label class="ss-check"><input type="checkbox" name="datenschutz" required> <span>Ich habe die <a href="#datenschutz">Datenschutzerklärung</a> gelesen und stimme zu.</span></label>
      <button class="ss-btn-primary" type="submit">${esc(kontakt.cta_label)}</button>
      <p class="ss-form-erfolg" data-form-erfolg>Danke! Wir melden uns innerhalb von 24 Stunden.</p>
    </form>
  </div>
</section>`
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add lib/flagship/scrub/unterseiten.ts
git commit -m "feat(scrub): subpage section renderers (Karriere, Erfahrungen, Leistungen, Kontakt)"
```

---

### Task 3: Add subpage CSS + extend scrub renderer for multipage

**Files:**
- Modify: `lib/flagship/scrub/css.ts` (add subpage styles)
- Modify: `lib/flagship/scrub/render.ts` (add `renderScrubUnterseite()`)
- Modify: `lib/flagship/scrub/sections.ts` (extend header with nav links)

**Interfaces:**
- Consumes: `renderScrubKarriere()`, `renderScrubErfahrungen()`, `renderScrubLeistungen()`, `renderScrubKontaktSeite()` from unterseiten.ts; `SCRUB_UNTERSEITEN`, `ScrubUnterseitenSlug` from types.ts
- Produces: `renderScrubUnterseite()` exported from render.ts

- [ ] **Step 1: Add subpage CSS to `lib/flagship/scrub/css.ts`**

At the end of the `scrubCss()` return string (before the closing backtick), add:

```css
/* ---------- Unterseiten (Karriere, Erfahrungen, Leistungen) ---------- */
.ss-seite{padding:96px 6vw;border-bottom:1px solid rgba(255,255,255,.06)}
.ss-seite-wrap{max-width:900px;margin:0 auto}
.ss-h2{font-size:clamp(24px,3vw,36px);font-weight:800;letter-spacing:-0.02em;margin:0 0 32px}
.ss-benefits-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}
.ss-benefit{padding:28px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}
.ss-benefit-icon{font-size:28px;display:block;margin-bottom:12px}
.ss-benefit h3{margin:0 0 8px;font-size:18px;font-weight:700}
.ss-benefit p{margin:0;font-size:14px;line-height:1.6;color:var(--ss-muted)}
.ss-stellen-list{display:flex;flex-direction:column;gap:16px}
.ss-stelle{padding:28px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}
.ss-stelle-header{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:12px}
.ss-stelle h3{margin:0;font-size:18px;font-weight:700}
.ss-stelle-meta{font-size:13px;color:var(--ss-cyan)}
.ss-stelle p{margin:0 0 16px;font-size:14px;line-height:1.6;color:var(--ss-muted)}
.ss-stimmen-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
.ss-stimme{padding:28px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}
.ss-stimme-text{margin:0 0 16px;font-size:16px;line-height:1.6;font-style:italic;color:var(--ss-text)}
.ss-stimme-autor{display:flex;align-items:center;gap:12px}
.ss-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,rgba(${a1},.3),rgba(${a2},.3));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0}
.ss-stimme-autor small{color:var(--ss-muted)}
.ss-fallstudien-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
.ss-fallstudie{padding:28px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}
.ss-fallstudie h3{margin:8px 0;font-size:18px;font-weight:700}
.ss-fallstudie p{margin:0 0 12px;font-size:14px;line-height:1.6;color:var(--ss-muted)}
.ss-ergebnis{font-size:14px;padding:12px;border-radius:8px;background:rgba(${a1},.08);border:1px solid rgba(${a1},.2);color:var(--ss-akzent)}
.ss-leistungen-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.ss-leistung{padding:28px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);position:relative}
.ss-leistung-nr{position:absolute;top:16px;right:20px;font-size:48px;font-weight:900;opacity:.06}
.ss-leistung-icon{font-size:28px;display:block;margin-bottom:12px}
.ss-leistung h3{margin:0 0 8px;font-size:18px;font-weight:700}
.ss-leistung p{margin:0;font-size:14px;line-height:1.6;color:var(--ss-muted)}
/* Nav-Links in Header (Multipage) */
.ss-nav{display:flex;gap:24px;align-items:center}
.ss-nav a{font-size:14px;font-weight:500;color:var(--ss-muted);transition:color .2s}
.ss-nav a:hover{color:var(--ss-text)}
@media (max-width:860px){.ss-nav{display:none}}
```

- [ ] **Step 2: Extend header in `lib/flagship/scrub/sections.ts`**

Replace `renderScrubHeader` to accept optional nav links:

```typescript
export function renderScrubHeader(header: ScrubInhalte['header'], navLinks?: { label: string; href: string }[]): string {
  const nav = navLinks?.length
    ? `<nav class="ss-nav">${navLinks.map(l => `<a href="${escAttr(l.href)}">${esc(l.label)}</a>`).join('')}</nav>`
    : ''
  return `<!-- sektion:ss-kopf -->
<header class="ss-kopf">
  <div class="ss-kopf-inner">
    <a class="ss-logo" href="/">${esc(header.logo_text)}</a>
    ${nav}
    <a class="ss-btn-primary" href="#kontakt">${esc(header.cta_label)}</a>
  </div>
</header>`
}
```

- [ ] **Step 3: Add `renderScrubUnterseite()` to `lib/flagship/scrub/render.ts`**

Add after `renderScrubStory()`:

```typescript
import { SCRUB_UNTERSEITEN, type ScrubUnterseitenSlug } from './types'
import { renderScrubKarriere, renderScrubErfahrungen, renderScrubLeistungen, renderScrubKontaktSeite } from './unterseiten'

function scrubNavLinks(basisPfad: string): { label: string; href: string }[] {
  return SCRUB_UNTERSEITEN.map(u => ({ label: u.label, href: `${basisPfad}/${u.slug}` }))
}

export function renderScrubUnterseite(
  config: ScrubConfig,
  seite: ScrubUnterseitenSlug,
  opts: FlagshipRenderOptionen = {},
): string {
  const { meta, inhalte, design } = config
  const basisPfad = opts.basisPfad || ''
  const navLinks = scrubNavLinks(basisPfad)
  const seitenLabel = SCRUB_UNTERSEITEN.find(u => u.slug === seite)?.label || seite
  const titel = `${seitenLabel} — ${meta.firma}`

  let sektionen = ''
  switch (seite) {
    case 'karriere':
      sektionen = config.unterseiten?.karriere
        ? renderScrubKarriere(config.unterseiten.karriere, opts.submitZiel)
        : ''
      break
    case 'erfahrungen':
      sektionen = config.unterseiten?.erfahrungen
        ? renderScrubErfahrungen(config.unterseiten.erfahrungen)
        : ''
      break
    case 'leistungen':
      sektionen = config.unterseiten?.leistungen
        ? renderScrubLeistungen(config.unterseiten.leistungen)
        : ''
      break
    case 'kontakt':
      sektionen = renderScrubKontaktSeite(inhalte.kontakt, opts.submitZiel)
      break
  }

  if (!sektionen) return ''

  const noindex = opts.noindex !== false ? '<meta name="robots" content="noindex">' : ''
  const body = [
    renderScrubHeader(inhalte.header, navLinks),
    sektionen,
    renderScrubFooter(inhalte.footer, inhalte.header, meta),
    opts.demo ? renderScrubRibbon() : '',
  ].filter(Boolean).join('\n\n')

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(titel)}</title>
<meta name="description" content="${escAttr(meta.seo_beschreibung || '')}">
${noindex}
<style>
${scrubCss(design)}
</style>
</head>
<body>
${body}
</body>
</html>`
}
```

- [ ] **Step 4: Update homepage render to include nav links when unterseiten exist**

In `renderScrubStory()`, update the `renderScrubHeader` call:

```typescript
const navLinks = config.unterseiten ? scrubNavLinks(opts.basisPfad || '') : undefined
// ...
renderScrubHeader(inhalte.header, navLinks),
```

- [ ] **Step 5: TypeScript check**

Run: `npx tsc --noEmit`

- [ ] **Step 6: Commit**

```bash
git add lib/flagship/scrub/css.ts lib/flagship/scrub/render.ts lib/flagship/scrub/sections.ts
git commit -m "feat(scrub): multipage rendering + subpage CSS + nav links"
```

---

### Task 4: Wire routing + update demo configs with content

**Files:**
- Modify: `lib/flagship/render.ts` (dispatch scrub subpages)
- Modify: `lib/auslieferung.ts` (route scrub subpages)
- Modify: `app/api/sites/[siteId]/preview/route.ts` (preview subpages)

**Interfaces:**
- Consumes: `istScrubKomposition()`, `renderScrubUnterseite()`, `SCRUB_UNTERSEITEN`, `ScrubUnterseitenSlug`

- [ ] **Step 1: Update `lib/flagship/render.ts`**

In `renderFlagshipPage()`, after the scrub dispatch, add subpage handling. Update the export to also export `renderScrubUnterseite`:

```typescript
// Re-export for routing
export { renderScrubUnterseite } from './scrub/render'
```

- [ ] **Step 2: Update `lib/auslieferung.ts`**

In `renderEngineSeite()`, after the existing scrub dispatch (`if (istScrubKomposition(config))`), add subpage routing:

```typescript
if (istScrubKomposition(config)) {
  if (slug === '') return renderScrubStory(config, { noindex: false, demo: opts.demo })
  // Scrub subpages
  const scrubSeite = SCRUB_UNTERSEITEN.find(u => u.slug === slug)
  if (scrubSeite && config.unterseiten) {
    return renderScrubUnterseite(config, slug as ScrubUnterseitenSlug, {
      noindex: false,
      submitZiel: `/api/public/forms/${site.id}/submit`,
      demo: opts.demo,
    })
  }
  return null
}
```

- [ ] **Step 3: Update preview route**

In `app/api/sites/[siteId]/preview/route.ts`, handle the `?page=karriere` etc. query parameter for scrub configs.

- [ ] **Step 4: TypeScript check**

Run: `npx tsc --noEmit`

- [ ] **Step 5: Commit**

```bash
git add lib/flagship/render.ts lib/auslieferung.ts app/api/sites/*/preview/route.ts
git commit -m "feat(scrub): routing for scrub subpages in auslieferung + preview"
```

---

### Task 5: Populate B&C and Livara demo configs with subpage content

**Files:**
- Script: update Supabase demos with unterseiten content

- [ ] **Step 1: Update B&C Direct Sales demo config**

Add `unterseiten` to the existing demo config with PV/D2D-specific content:
- Karriere: D2D Vertriebsmitarbeiter Stellen, Benefits (Provision, Firmenwagen, etc.)
- Erfahrungen: Team-Testimonials, Fallstudien (Projekte, kWp installiert)
- Leistungen: PV-Beratung, Montage, Wartung etc.

- [ ] **Step 2: Update Livara Services demo config**

Add `unterseiten` with sanierung-specific content:
- Karriere: Bauleiter, Handwerker Stellen
- Erfahrungen: Kunden-Testimonials, Fallstudien (Sanierungsprojekte)
- Leistungen: Komplettsanierung, Badsanierung, Fassade etc.

- [ ] **Step 3: Verify demos load with subpages**

Test URLs: `/demo/{token}`, `/demo/{token}?page=karriere`, etc.

- [ ] **Step 4: Commit + deploy**

```bash
git add -A
git commit -m "feat(scrub): B&C + Livara demo configs with subpage content"
git push origin main
```

---

### Task 6: SEO/Geo Blog activation for both customers

**Files:**
- Script: activate SEO upsell for both customers in Supabase

- [ ] **Step 1: Activate SEO for both customers**

Insert `activated_upsells` entries for `seo-unterseiten-abo` for both customer IDs. The existing cron (`/api/cron/seo-plan`) will then auto-generate monthly SEO landingpages.

- [ ] **Step 2: Verify SEO cron would pick them up**

Check that the cron query matches the new entries.

- [ ] **Step 3: Commit**

No code changes needed — database only.
