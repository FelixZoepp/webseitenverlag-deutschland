# Flagship CSS/Design-System Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the visual quality of all flagship customer websites to netzground.de/unipack-films.com level through better animations, hover effects, typography, color depth, and micro-interactions — all within the existing inline-CSS system.

**Architecture:** Changes happen in `lib/flagship/css.ts` (CSS generator), `lib/flagship/sections.ts` (HTML section renderers), and minimally `lib/flagship/js.ts`. No new types or config fields — everything is computed from existing 8 design tokens. The `flagshipCss()` function produces richer CSS, and section renderers output `style="--i:N"` instead of `.d1/.d2/.d3` classes.

**Tech Stack:** TypeScript, inline CSS generation, vanilla JS (no frameworks in flagship output)

## Global Constraints

- No new `FlagshipConfig` fields or types — only rendering improvements
- Inline CSS system stays (self-contained HTML per customer site)
- Both typo modes (`sans_bold_hell` and `serif_warm_dunkel`) must benefit from every change
- `rgb()` helper at top of `css.ts` converts hex tokens to `r,g,b` strings for rgba() — use it for all new color derivations
- Verification: `npx tsc --noEmit` + `npx tsx scripts/test-flagship.ts` (270 checks, 0 errors expected)
- All CSS changes go into the `flagshipCss()` return template string
- `prefers-reduced-motion` block must remain functional

---

### Task 1: Stagger System + Color Palette Extension in css.ts

**Files:**
- Modify: `lib/flagship/css.ts:58-65` (`:root` block) and `312-314` (`.rv.d1/.d2/.d3` rules)

**Interfaces:**
- Produces: CSS variables `--ak1-soft`, `--ak2-soft`, `--glow` available in all flagship pages. Stagger delay via `--i` variable on `.rv` elements.

- [ ] **Step 1: Extend `:root` block with computed color values**

In `css.ts`, find the `:root` block (line 58-65). Add three new variables after the existing `--w` line:

```typescript
// Inside the template string, after --w:${w};
// Add:
  --ak1-soft:rgba(${rgb(t.akzent1)},.12);--ak2-soft:rgba(${rgb(t.akzent2)},.12);
  --glow:0 0 40px rgba(${rgb(t.akzent1)},.2);
```

The `:root` block should now end with:
```css
  --shadow:${shadow};--r:${r};--w:${w};
  --ak1-soft:rgba(${rgb(t.akzent1)},.12);--ak2-soft:rgba(${rgb(t.akzent2)},.12);
  --glow:0 0 40px rgba(${rgb(t.akzent1)},.2);
  --sans:${sans};--serif:${serif};
}
```

- [ ] **Step 2: Replace fixed delay classes with `--i` variable system**

Find and replace the `.rv` block (line 312-314):

OLD:
```css
.rv{opacity:0;transform:translateY(28px);transition:opacity .8s ease,transform .8s cubic-bezier(.2,.7,.2,1)}
.rv.in{opacity:1;transform:none}
.rv.d1{transition-delay:.1s}.rv.d2{transition-delay:.2s}.rv.d3{transition-delay:.3s}
```

NEW:
```css
.rv{opacity:0;transform:translateY(28px);transition:opacity .8s ease,transform .8s cubic-bezier(.2,.7,.2,1);transition-delay:calc(var(--i,0) * 0.08s)}
.rv.in{opacity:1;transform:none}
```

- [ ] **Step 3: Update `prefers-reduced-motion` block**

In the reduced-motion block (line 315-322), the `.rv` rule already handles it. Just make sure `.d1/.d2/.d3` are not referenced. The existing `.rv{opacity:1;transform:none}` handles everything since `--i` delay is overridden by `transition:none!important`.

No change needed — the existing `*{transition:none!important}` already covers it.

- [ ] **Step 4: Verify**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -10`
Expected: No errors

Run: `cd ~/webseitenverlag-deutschland && npx tsx scripts/test-flagship.ts 2>&1 | tail -5`
Expected: `270 Prüfungen, 0 Fehler`

- [ ] **Step 5: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add lib/flagship/css.ts
git commit -m "feat(flagship): add --i stagger system and computed color palette (--ak1-soft, --ak2-soft, --glow)"
```

---

### Task 2: Replace d1/d2/d3 with --i in sections.ts

**Files:**
- Modify: `lib/flagship/sections.ts` (all section renderer functions)

**Interfaces:**
- Consumes: `--i` CSS variable from Task 1
- Produces: All `.rv` elements now use `style="--i:N"` instead of class `d1/d2/d3`

- [ ] **Step 1: Update `renderHero()` (standard hero)**

Line 97, change:
```typescript
    <div class="hero-media rv in d1">
```
to:
```typescript
    <div class="hero-media rv in" style="--i:1">
```

- [ ] **Step 2: Update `renderEmpathie()`**

Line 121, change the zitat blockquote:
```typescript
    rechts = `<blockquote class="rv d1">
```
to:
```typescript
    rechts = `<blockquote class="rv" style="--i:1">
```

Lines 126-127, change the situationen map:
```typescript
      .map((s, i) => `<div class="rv${i > 0 ? ` d${Math.min(i, 3)}` : ''}">${icon('check', 2)}${esc(s)}</div>`)
```
to:
```typescript
      .map((s, i) => `<div class="rv" style="--i:${i}">${icon('check', 2)}${esc(s)}</div>`)
```

- [ ] **Step 3: Update `renderLeistungen()`**

Lines 168-175, remove the `delays` array and change the card map:

OLD:
```typescript
  const delays = ['', ' d1', ' d2']
  const karten = l.karten
    .map((k, i) => {
      // ...
      return `<div class="card rv${delays[i % 3]}">
```

NEW:
```typescript
  const karten = l.karten
    .map((k, i) => {
      // ...
      return `<div class="card rv" style="--i:${i}">
```

- [ ] **Step 4: Update `renderAblauf()`**

Line 215, change:
```typescript
    <div class="proz-card rv d1" id="prozCard">
```
to:
```typescript
    <div class="proz-card rv" style="--i:1" id="prozCard">
```

- [ ] **Step 5: Update `renderErgebnisse()`**

Line 231, in ba_slider map, change:
```typescript
        .map((p, i) => `<figure class="ba rv${i > 0 ? ' d1' : ''}" data-ba>
```
to:
```typescript
        .map((p, i) => `<figure class="ba rv" style="--i:${i}" data-ba>
```

Lines 240-243, in galerie, remove `delays` and change:
```typescript
    const delays = ['', ' d1', ' d2']
    inhalt = `<div class="gal">
      ${(e.bilder || [])
        .map((b, i) => `<figure class="rv${delays[i % 3]} media"
```
to:
```typescript
    inhalt = `<div class="gal">
      ${(e.bilder || [])
        .map((b, i) => `<figure class="rv media" style="--i:${i}"
```

- [ ] **Step 6: Update `renderZahlen()`**

Lines 263-270, remove `delays` and change:
```typescript
  const delays = ['', ' d1', ' d2', ' d3']
  const items = z.items
    .map((it, i) => {
      // ...
      return `<div class="z rv${delays[i % 4]}">
```
to:
```typescript
  const items = z.items
    .map((it, i) => {
      // ...
      return `<div class="z rv" style="--i:${i}">
```

- [ ] **Step 7: Update `renderStimmen()`**

Lines 282-284, remove `delays` and change:
```typescript
  const delays = ['', ' d1', ' d2']
  const quotes = s.quotes
    .map((q, i) => `<div class="quote rv${delays[i % 3]}">
```
to:
```typescript
  const quotes = s.quotes
    .map((q, i) => `<div class="quote rv" style="--i:${i}">
```

- [ ] **Step 8: Update `renderLokal()`**

Lines 306-312, in info variant, remove `delays` and change:
```typescript
    const delays = ['', ' d1', ' d2']
    const infos = (l.infos || [])
      .map((inf, i) => {
        // ...
        return `<div class="rv${delays[i % 3]}">${icon(inf.icon)}
```
to:
```typescript
    const infos = (l.infos || [])
      .map((inf, i) => {
        // ...
        return `<div class="rv" style="--i:${i}">${icon(inf.icon)}
```

Line 336, in chips variant:
```typescript
    <div class="bezirke rv d1">
```
to:
```typescript
    <div class="bezirke rv" style="--i:1">
```

Line 338:
```typescript
    ${l.note ? `\n    <p class="lokal-note rv d2">${esc(l.note)}</p>` : ''}
```
to:
```typescript
    ${l.note ? `\n    <p class="lokal-note rv" style="--i:2">${esc(l.note)}</p>` : ''}
```

- [ ] **Step 9: Update `renderConversion()`**

Line 384:
```typescript
    <div class="konv-card rv d1">
```
to:
```typescript
    <div class="konv-card rv" style="--i:1">
```

- [ ] **Step 10: Verify**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -10`
Expected: No errors

Run: `cd ~/webseitenverlag-deutschland && npx tsx scripts/test-flagship.ts 2>&1 | tail -5`
Expected: `270 Prüfungen, 0 Fehler`

- [ ] **Step 11: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add lib/flagship/sections.ts
git commit -m "feat(flagship): replace d1/d2/d3 classes with --i stagger variable in all sections"
```

---

### Task 3: Card Hover Effects, Typography, and Micro-Interactions in css.ts

**Files:**
- Modify: `lib/flagship/css.ts` (multiple locations in the CSS template string)

**Interfaces:**
- Consumes: `--ak1-soft`, `--glow`, `rgb()` helper from Task 1

- [ ] **Step 1: Upgrade `.card` hover with gradient overlay and glow**

Find the `.card` block (lines 198-206). Replace:

```css
.card{background:var(--flaeche);border-radius:var(--r);padding:${hell ? '30px 28px;border:1px solid transparent' : '32px 28px;border:1px solid var(--line)'};position:relative;transition:.3s}
.card:hover{transform:translateY(-6px);box-shadow:var(--shadow);border-color:${hell ? 'var(--line)' : `rgba(${rgb(t.akzent2)},.5)`}}
.card .ic{width:52px;height:52px;border-radius:14px;background:var(--panel);display:grid;place-items:center;margin-bottom:20px;transition:.3s}
.card:hover .ic{background:var(--ak1)}
```

With:

```css
.card{background:var(--flaeche);border-radius:var(--r);padding:${hell ? '30px 28px;border:1px solid transparent' : '32px 28px;border:1px solid var(--line)'};position:relative;transition:.3s;overflow:hidden}
.card::after{content:"";position:absolute;inset:0;opacity:0;background:linear-gradient(135deg,rgba(${rgb(t.akzent1)},.06),transparent 60%);transition:opacity .4s;pointer-events:none}
.card:hover::after{opacity:1}
.card:hover{transform:translateY(-6px);box-shadow:var(--shadow);border-color:${hell ? 'var(--ak1)' : `rgba(${rgb(t.akzent2)},.5)`}}
.card:active{transform:translateY(-4px) scale(.98)}
.card .ic{width:52px;height:52px;border-radius:14px;background:var(--panel);display:grid;place-items:center;margin-bottom:20px;transition:.3s}
.card:hover .ic{background:var(--ak1);box-shadow:0 0 30px rgba(${rgb(t.akzent1)},.25)}
```

- [ ] **Step 2: Add `.quote` hover effect**

Find the `.quote` block (line 257). After the existing `.quote{...}` rule, add:

```css
.quote{transition:transform .3s,box-shadow .3s}
.quote:hover{transform:translateY(-4px);box-shadow:var(--shadow)}
```

Note: the existing `.quote{background:...}` already has the base styles. Add `transition` to it — merge into one rule by appending `;transition:transform .3s,box-shadow .3s` before the closing `}`.

- [ ] **Step 3: Add FAQ hover effect**

Find the `summary{...}` rule (line 281). Add after it:

```css
summary:hover{color:var(--ak1)}
details[open] summary{color:var(--ak1)}
```

- [ ] **Step 4: Enhance `.bezirke span` hover with glow**

Find `.bezirke span:hover` (line 268). Change:

```css
.bezirke span:hover{background:var(--ak1);border-color:var(--ak1);transform:translateY(-3px)}
```

To:

```css
.bezirke span:hover{background:var(--ak1);border-color:var(--ak1);transform:translateY(-3px);box-shadow:0 0 20px rgba(${rgb(t.akzent1)},.2)}
```

- [ ] **Step 5: Add button shimmer animation**

Find the `.btn` rules (lines 98-107). Add `overflow:hidden` to `.btn` and add the shimmer `::before`:

After the existing `.btn{...}` line, add:

```css
.btn::before{content:"";position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);animation:shimmer 3s infinite;pointer-events:none}
@keyframes shimmer{0%{left:-100%}100%{left:200%}}
```

Also add `position:relative;overflow:hidden` to the existing `.btn` rule (append to the existing property list).

- [ ] **Step 6: Typography improvements**

Find `h1,h2,h3{...}` (line 76). Add `text-wrap:balance` to `h2`:

After the `h2{font-size:...}` line (78), add:

```css
h2{text-wrap:balance}
```

Wait — `h2` is already defined on that line. Append to it:

Change line 78 from:
```css
h2{font-size:clamp(${hell ? '2rem,4.2vw,3rem' : '2rem,4.2vw,3.1rem'})}
```
to:
```css
h2{font-size:clamp(${hell ? '2rem,4.2vw,3rem' : '2rem,4.2vw,3.1rem'});text-wrap:balance}
```

And change `.lead` (line 82) from:
```css
.lead{font-size:${hell ? '1.14rem' : '1.12rem'};color:var(--soft);max-width:56ch}
```
to:
```css
.lead{font-size:${hell ? '1.14rem' : '1.12rem'};color:var(--soft);max-width:56ch;text-wrap:balance}
```

- [ ] **Step 7: Improve `.eyebrow::before` in hell mode**

Find `.eyebrow` (line 80-81). Change the `::before` for hell mode:

In the existing `.eyebrow::before` content (end of line 81), change:

Hell mode: `width:22px;height:3px;background:var(--ak1);border-radius:2px`

To: `width:8px;height:8px;border-radius:50%;background:var(--ak1);box-shadow:0 0 12px rgba(${rgb(t.akzent1)},.4)`

- [ ] **Step 8: Smoother `.hl` transition**

Find the `hlCss` variable (lines 46-55). Change the transition timing in both branches:

In the wisch branch (line 50):
```
transition:background-size 1s cubic-bezier(.6,0,.2,1) .35s
```
Change to:
```
transition:background-size 1.2s cubic-bezier(.22,1,.36,1) .3s
```

In the gold_unterstrich branch (line 53):
```
transition:background-size 1.1s cubic-bezier(.6,0,.2,1) .35s
```
Change to:
```
transition:background-size 1.2s cubic-bezier(.22,1,.36,1) .3s
```

- [ ] **Step 9: Improve nav transition**

Find `nav{...}` (line 86). Change `transition:.3s` to:

```css
transition:padding .3s,background .3s,box-shadow .3s
```

- [ ] **Step 10: Verify**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -10`
Expected: No errors

Run: `cd ~/webseitenverlag-deutschland && npx tsx scripts/test-flagship.ts 2>&1 | tail -5`
Expected: `270 Prüfungen, 0 Fehler`

- [ ] **Step 11: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add lib/flagship/css.ts
git commit -m "feat(flagship): add card hover gradients, button shimmer, typography balance, FAQ/quote hover effects"
```

---

### Task 4: Section Background Variety + Scroll Indicator

**Files:**
- Modify: `lib/flagship/css.ts` — ambient glow backgrounds, texture class, scroll-hint
- Modify: `lib/flagship/sections.ts` — add `tex` class to sections, add scroll-hint HTML to hero

**Interfaces:**
- Consumes: `rgb()` helper, existing design tokens

- [ ] **Step 1: Add `.tex` texture class and ambient glow backgrounds to css.ts**

In css.ts, add after the `.hero::before` block (after line 112, the `@media` for hero):

```css
.hero::after{content:"";position:absolute;bottom:-30%;left:50%;width:80vw;height:40vw;max-width:900px;max-height:500px;background:radial-gradient(closest-side,rgba(${rgb(t.akzent2)},.08),transparent 70%);pointer-events:none}
```

Add the `.tex` class somewhere before the section-specific styles (e.g., after the `.chips` block, around line 121):

```css
.tex{position:relative}.tex::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.4;background-image:repeating-linear-gradient(115deg,transparent 0 26px,rgba(${rgb(t.text)},.03) 26px 27px)}
```

Add ambient glow to `.sig` — find `.sig{height:240vh...}` (line 171) and add after the `.sig .hint` block (after line 192):

```css
.sig::after{content:"";position:absolute;top:20%;right:-10%;width:50vw;height:50vw;max-width:600px;max-height:600px;background:radial-gradient(closest-side,rgba(${rgb(t.akzent1)},.06),transparent 70%);pointer-events:none}
```

- [ ] **Step 2: Add `.scroll-hint` styles to css.ts**

Add after the hero CSS block (after the `@keyframes float` block, around line 131):

```css
.scroll-hint{position:absolute;bottom:28px;left:50%;transform:translateX(-50%);color:var(--soft);font-size:.78rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;display:flex;flex-direction:column;align-items:center;gap:8px;opacity:.6;transition:opacity .3s}
.scroll-hint svg{width:16px;height:16px;animation:bob 1.6s ease-in-out infinite}
nav.scrolled~header .scroll-hint,nav.scrolled~.hero .scroll-hint{opacity:0}
```

Note: The `@keyframes bob` already exists (line 192 — `0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}`), so no need to add it again.

- [ ] **Step 3: Add `tex` class to sections in sections.ts**

In `renderLeistungen()` (line 186), change:
```typescript
<section class="leist" id="leistungen">
```
to:
```typescript
<section class="leist tex" id="leistungen">
```

In `renderLokal()` — chips variant (line 330), change:
```typescript
<section class="lokal-chips" id="lokal">
```
to:
```typescript
<section class="lokal-chips tex" id="lokal">
```

In `renderLokal()` — info variant (line 316), change:
```typescript
<section class="lokal-info" id="lokal">
```
to:
```typescript
<section class="lokal-info tex" id="lokal">
```

- [ ] **Step 4: Add scroll-hint to hero in sections.ts**

In `renderHero()` — standard hero (line 83-103), add the scroll-hint before `</header>`:

Change line 102-103:
```typescript
  </div>
</header>`
```
to:
```typescript
  </div>
  <div class="scroll-hint">Entdecken <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 9l-7 7-7-7"/></svg></div>
</header>`
```

In the video-hero variant (line 59-79), add before the closing `</header>` (before the `${reducedBg}` line):

Find:
```typescript
  <div class="stat-card vcard"><b>${esc(hero.stat2.wert)}</b><small>${esc(hero.stat2.label)}</small></div>${reducedBg}
</header>`
```

Change to:
```typescript
  <div class="stat-card vcard"><b>${esc(hero.stat2.wert)}</b><small>${esc(hero.stat2.label)}</small></div>
  <div class="scroll-hint">Entdecken <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 9l-7 7-7-7"/></svg></div>${reducedBg}
</header>`
```

- [ ] **Step 5: Verify**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -10`
Expected: No errors

Run: `cd ~/webseitenverlag-deutschland && npx tsx scripts/test-flagship.ts 2>&1 | tail -5`
Expected: `270 Prüfungen, 0 Fehler`

- [ ] **Step 6: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add lib/flagship/css.ts lib/flagship/sections.ts
git commit -m "feat(flagship): add section textures, ambient glow backgrounds, and scroll-hint indicator"
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
Expected: `270 Prüfungen, 0 Fehler` — all existing templates still render correctly

- [ ] **Step 3: Review all changes**

Run: `cd ~/webseitenverlag-deutschland && git diff HEAD~4 --stat`
Expected: Only 2 files changed:
- `lib/flagship/css.ts`
- `lib/flagship/sections.ts`
