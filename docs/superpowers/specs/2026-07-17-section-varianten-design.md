# Neue Section-Varianten (Flagship)

**Ziel:** 4 neue optionale Sektionen im Flagship-Template-System: Trust/Zertifizierungs-Grid, Partner-Logo-Marquee, Horizontal Prozess-Scroller, Projekt-Referenzen. Alle optional pro Branche konfigurierbar.

---

## Scope

**Geändert werden:**
- `lib/flagship/types.ts` — 4 neue Interfaces + optionale Felder in `FlagshipInhalte`
- `lib/flagship/css.ts` — CSS für alle 4 Sektionen
- `lib/flagship/sections.ts` — 4 neue Render-Funktionen + `sektionsReihenfolge()` Update
- `lib/flagship/js.ts` — Minimales JS (Marquee ist CSS-only, Prozess-Scroll-Snap ist CSS)

**NICHT geändert:**
- Bestehende 14 Sektionen — bleiben unverändert
- `lib/seeding/` — Schema-Erweiterung für die neuen Sektionen ist ein separates Projekt
- `lib/pipeline/generate-flagship-demo.ts` — Demos ohne die neuen Felder funktionieren wie bisher

---

## 1. Trust/Zertifizierungs-Grid (`nachweise`)

### Type

```typescript
export interface NachweiseInhalt {
  eyebrow: string
  headline: string
  items: { label: string; beschreibung?: string; icon?: IconKey }[]
}
```

Feld in `FlagshipInhalte`: `nachweise?: NachweiseInhalt`

### Position

Nach `fakten`, vor `empathie`.

### CSS

```css
.nachweise-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px}
@media(max-width:820px){.nachweise-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.nachweise-grid{grid-template-columns:1fr}}
.nw-card{background:FLAECHE;border:1px solid LINE;border-radius:RADIUS;padding:28px 24px;
  transition:.3s;overflow:hidden;position:relative}
.nw-card::after{content:"";position:absolute;inset:0;opacity:0;
  background:linear-gradient(135deg,rgba(AK1_RGB,.06),transparent 60%);transition:opacity .4s;pointer-events:none}
.nw-card:hover::after{opacity:1}
.nw-card:hover{transform:translateY(-4px);box-shadow:SHADOW}
.nw-card .ic{width:48px;height:48px;border-radius:14px;background:PANEL;
  display:grid;place-items:center;margin-bottom:16px;transition:.3s}
.nw-card:hover .ic{background:AK1;box-shadow:var(--glow)}
.nw-card .ic svg{width:24px;height:24px}
.nw-card h3{font-size:1rem;margin-bottom:6px}
.nw-card p{font-size:.88rem;color:SOFT}
```

### HTML

```html
<!-- sektion:nachweise -->
<section id="nachweise">
  <div class="wrap">
    <div class="rv" style="max-width:640px">
      <span class="eyebrow">EYEBROW</span>
      <h2>HEADLINE</h2>
    </div>
    <div class="nachweise-grid">
      <div class="nw-card rv" style="--i:0">
        <div class="ic">ICON_SVG</div>
        <h3>LABEL</h3>
        <p>BESCHREIBUNG</p>
      </div>
      <!-- ... -->
    </div>
  </div>
</section>
```

---

## 2. Partner-Logo-Marquee (`marken`)

### Type

```typescript
export interface MarkenInhalt {
  label?: string
  logos: { name: string; url?: string }[]
}
```

Feld in `FlagshipInhalte`: `marken?: MarkenInhalt`

### Position

Nach `fakten` (oder nach `nachweise` wenn vorhanden), vor `empathie`.

### CSS

```css
.marquee{overflow:hidden;padding:28px 0;border-top:1px solid LINE;border-bottom:1px solid LINE;
  background:FLAECHE;position:relative}
.marquee-label{text-align:center;font-size:.78rem;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:SOFT;margin-bottom:20px}
.marquee-track{display:flex;gap:48px;animation:mscroll 30s linear infinite;width:max-content}
.marquee-track:hover{animation-play-state:paused}
.marquee-item{font-family:SANS;font-size:1.1rem;font-weight:700;letter-spacing:.06em;
  text-transform:uppercase;color:SOFT;white-space:nowrap;opacity:.5;
  filter:grayscale(1);transition:opacity .3s,filter .3s}
.marquee-item:hover{opacity:1;filter:grayscale(0);color:AK1}
.marquee-item img{height:32px;width:auto;filter:grayscale(1);opacity:.5;transition:.3s}
.marquee-item:hover img{filter:grayscale(0);opacity:1}
@keyframes mscroll{to{transform:translateX(-50%)}}
@media(prefers-reduced-motion:reduce){.marquee-track{animation:none;flex-wrap:wrap;justify-content:center}}
```

### HTML

Logo-Items werden 2x dupliziert für nahtlosen Loop:

```html
<!-- sektion:marken -->
<div class="marquee">
  <div class="marquee-label">LABEL</div>
  <div class="marquee-track">
    <!-- Items 2x für nahtlosen Loop -->
    <span class="marquee-item">NAME</span>
    <!-- oder mit Bild: -->
    <span class="marquee-item"><img src="URL" alt="NAME"></span>
  </div>
</div>
```

---

## 3. Horizontal Prozess-Scroller (`prozess`)

### Type

```typescript
export interface ProzessInhalt {
  eyebrow: string
  headline: string
  schritte: { titel: string; text: string; media?: MediaSlot; icon?: IconKey }[]
}
```

Feld in `FlagshipInhalte`: `prozess?: ProzessInhalt`

### Position

Nach `leistungen`, vor `ablauf`/`ergebnisse`.

### CSS

```css
.prozess-scroll{display:flex;gap:24px;overflow-x:auto;scroll-snap-type:x mandatory;
  padding:48px 24px 24px;margin:0 -24px;-webkit-overflow-scrolling:touch}
.prozess-scroll::-webkit-scrollbar{height:4px}
.prozess-scroll::-webkit-scrollbar-thumb{background:LINE;border-radius:2px}
.proz-station{flex:0 0 280px;scroll-snap-align:start;background:FLAECHE;
  border:1px solid LINE;border-radius:RADIUS;overflow:hidden;transition:.3s;position:relative}
.proz-station::after{content:"";position:absolute;inset:0;opacity:0;
  background:linear-gradient(135deg,rgba(AK1_RGB,.06),transparent 60%);transition:opacity .4s;pointer-events:none}
.proz-station:hover::after{opacity:1}
.proz-station:hover{transform:translateY(-4px);box-shadow:SHADOW}
.proz-station .proz-media{aspect-ratio:16/9;overflow:hidden}
.proz-station .proz-media img{width:100%;height:100%;object-fit:cover}
.proz-station .proz-body{padding:24px 20px}
.proz-station .proz-num{font-size:.78rem;font-weight:800;letter-spacing:.12em;
  text-transform:uppercase;color:AK2;margin-bottom:8px}
.proz-station h3{font-size:1.05rem;margin-bottom:8px}
.proz-station p{font-size:.9rem;color:SOFT;line-height:1.55}
.proz-line-h{position:absolute;top:24px;left:0;right:0;height:2px;background:LINE;z-index:0}
@media(max-width:640px){.prozess-scroll{flex-direction:column}.proz-station{flex:none;width:100%}}
```

### HTML

```html
<!-- sektion:prozess -->
<section id="prozess">
  <div class="wrap">
    <div class="rv" style="max-width:660px">
      <span class="eyebrow">EYEBROW</span>
      <h2>HEADLINE</h2>
    </div>
    <div class="prozess-scroll rv" style="--i:1">
      <div class="proz-station">
        <div class="proz-media media" data-label="LABEL">
          <img src="..." alt="..." onload="..." onerror="...">
        </div>
        <div class="proz-body">
          <div class="proz-num">Schritt 01</div>
          <h3>TITEL</h3>
          <p>TEXT</p>
        </div>
      </div>
      <!-- ... -->
    </div>
  </div>
</section>
```

---

## 4. Projekt-Referenzen (`referenzen`)

### Type

```typescript
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

Feld in `FlagshipInhalte`: `referenzen?: ReferenzenInhalt`

### Position

Nach `ergebnisse`, vor `zahlen`.

### CSS

Dunkler Hintergrund (wie `.zahlen`):

```css
.ref-section{background:TIEFE;color:HELL_TEXT;padding:110px 0}
.ref-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:52px}
@media(max-width:820px){.ref-grid{grid-template-columns:1fr}}
.ref-card{background:FLAECHE_DARK;border:1px solid LINE_DARK;border-radius:RADIUS;
  padding:32px 28px;transition:.3s;position:relative;overflow:hidden}
.ref-card::after{content:"";position:absolute;inset:0;opacity:0;
  background:linear-gradient(135deg,rgba(AK1_RGB,.08),transparent 60%);transition:opacity .4s;pointer-events:none}
.ref-card:hover::after{opacity:1}
.ref-card:hover{transform:translateY(-4px);border-color:rgba(AK1_RGB,.4)}
.ref-card .ref-typ{font-size:.78rem;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;color:AK2;margin-bottom:10px}
.ref-card h3{font-size:1.2rem;margin-bottom:16px}
.ref-kz{display:flex;flex-wrap:wrap;gap:12px 24px}
.ref-kz span{font-size:.88rem;color:SOFT}
.ref-kz b{color:TEXT;font-weight:700}
.ref-muster{font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  color:SOFT;opacity:.6;margin-top:16px}
```

### HTML

```html
<!-- sektion:referenzen -->
<section class="ref-section" id="referenzen">
  <div class="wrap">
    <div class="rv" style="max-width:660px">
      <span class="eyebrow">EYEBROW</span>
      <h2>HEADLINE</h2>
    </div>
    <div class="ref-grid">
      <div class="ref-card rv" style="--i:0">
        <div class="ref-typ">TYP</div>
        <h3>TITEL</h3>
        <div class="ref-kz">
          <span><b>WERT</b> LABEL</span>
        </div>
        <div class="ref-muster">Beispielprojekt</div> <!-- nur wenn als=muster -->
      </div>
    </div>
  </div>
</section>
```

---

## Sektionsreihenfolge

Update `sektionsReihenfolge()` in sections.ts:

```
nav → hero → fakten → [marken] → [nachweise] → empathie → signature →
leistungen → [prozess] → [ablauf] → ergebnisse → [referenzen] →
zahlen → stimmen → lokal → faq → conversion → footer
```

---

## Dateien

1. `lib/flagship/types.ts` — 4 Interfaces, 4 optionale Felder in `FlagshipInhalte`
2. `lib/flagship/css.ts` — CSS für nachweise, marquee, prozess, referenzen
3. `lib/flagship/sections.ts` — 4 Render-Funktionen, `sektionsReihenfolge()` Update
4. `lib/flagship/render.ts` — Neue Sektionen in die Render-Pipeline einbinden (bedingt)
