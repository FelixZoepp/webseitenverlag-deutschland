# Flagship CSS/Design-System Upgrade

**Ziel:** Das visuelle Niveau der Kunden-Webseiten (Flagship-Templates) auf das Level von netzground.de/unipack-films.com heben — durch bessere Animationen, Card-Effekte, Typografie, Farbtiefe und Micro-Interactions. Alle Änderungen im bestehenden Inline-CSS-System (`flagshipCss()` → `<style>`).

---

## Scope

**Geändert werden:**
- `lib/flagship/css.ts` — CSS-Generator (Hauptteil der Arbeit)
- `lib/flagship/sections.ts` — `--i` Stagger-Delays auf `.rv` Elementen
- `lib/flagship/js.ts` — Scroll-Indicator im Hero, Button-Shimmer

**NICHT geändert werden:**
- `lib/flagship/types.ts` — Keine neuen Config-Felder
- Design-Token Anzahl — Neue Werte werden aus bestehenden 8 Tokens berechnet
- Section-Struktur / HTML-Markup — Gleiche Struktur, nur besseres CSS
- Funnel-CSS (`funnelCss()`) — Bleibt erstmal gleich

---

## 1. Staggered Reveal Animations

### css.ts

Ersetze die festen Delay-Klassen:
```css
/* ALT */
.rv.d1{transition-delay:.1s}.rv.d2{transition-delay:.2s}.rv.d3{transition-delay:.3s}

/* NEU */
.rv{transition-delay:calc(var(--i,0) * 0.08s)}
```

Die Variable `--i` wird inline im HTML gesetzt (`style="--i:0"`, `--i:1`, etc.).

### sections.ts

Alle Stellen die `.d1/.d2/.d3` verwenden werden umgestellt auf `style="--i:N"`:

- `renderEmpathie()` — Situationen: `style="--i:${i}"` statt `d${Math.min(i,3)}`
- `renderLeistungen()` — Karten: `style="--i:${i}"` statt `delays[i % 3]`
- `renderErgebnisse()` — BA-Paare und Galerie-Bilder: `style="--i:${i}"`
- `renderZahlen()` — Counter: `style="--i:${i}"`
- `renderStimmen()` — Quotes: `style="--i:${i}"`
- `renderLokal()` — Infos/Chips: `style="--i:${i}"`
- `renderHero()` — Hero-Media: `style="--i:1"`
- `renderAblauf()` — Prozess-Card: `style="--i:1"`
- `renderConversion()` — Konv-Card: `style="--i:1"`

---

## 2. Card Hover-Effekte

### Leistungen-Cards (`.card`)

Aktuell: `translateY(-6px) + box-shadow` auf hover.

Neu (in css.ts):
```css
.card{position:relative;overflow:hidden}
.card::after{content:"";position:absolute;inset:0;opacity:0;
  background:linear-gradient(135deg,rgba(AK1_RGB,.06),transparent 60%);
  transition:opacity .4s}
.card:hover::after{opacity:1}
.card:hover{transform:translateY(-6px);box-shadow:var(--shadow);
  border-color:var(--ak1)}
.card:active{transform:translateY(-4px) scale(.98)}
.card:hover .ic{background:var(--ak1);box-shadow:0 0 30px rgba(AK1_RGB,.25)}
```

### Testimonial-Quotes (`.quote`)

```css
.quote{transition:transform .3s,box-shadow .3s}
.quote:hover{transform:translateY(-4px);box-shadow:var(--shadow)}
```

### FAQ Details

```css
summary{transition:color .2s}
summary:hover{color:var(--ak1)}
details[open] summary{color:var(--ak1)}
```

### Bezirke-Chips

Bestehendes Hover ist gut, ergänze Glow:
```css
.bezirke span:hover{box-shadow:0 0 20px rgba(AK1_RGB,.2)}
```

---

## 3. Section-Background-Variety

### Diagonale Stripe-Texture

Neue Utility-Klasse die auf ausgewählte Sektionen angewendet wird:
```css
.tex::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.4;
  background-image:repeating-linear-gradient(115deg,transparent 0 26px,rgba(TEXT_RGB,.03) 26px 27px)}
```

Angewendet auf: `.leist`, `.lokal-chips`, `.lokal-info` (via sections.ts class-Ergänzung).

### Radial-Gradient Accents

Auf Hero und Conversion — erweitere den bestehenden `::before` Gradient:
```css
.hero::after{content:"";position:absolute;bottom:-30%;left:50%;width:80vw;height:40vw;
  background:radial-gradient(closest-side,rgba(AK2_RGB,.08),transparent 70%);pointer-events:none}
```

### Signature-Section Ambient Glow

```css
.sig::after{content:"";position:absolute;top:20%;right:-10%;width:50vw;height:50vw;
  background:radial-gradient(closest-side,rgba(AK1_RGB,.06),transparent 70%);pointer-events:none}
```

---

## 4. Typografie-Verfeinerung

### text-wrap balance

```css
h2{text-wrap:balance}
.lead{text-wrap:balance}
```

### Eyebrow Aufwertung

Aktuell hat `.eyebrow::before` eine Linie. Ergänze subtilen Punkt-Glow im hellen Modus:
```css
/* hell */
.eyebrow::before{width:8px;height:8px;border-radius:50%;background:var(--ak1);
  box-shadow:0 0 12px rgba(AK1_RGB,.4)}
/* dunkel — bestehende Linie bleibt */
```

### Headline Akzent-Verbesserung

Die `.hl` (Highlight) Animation bekommt eine sanftere Kurve:
```css
.hl{transition:background-size 1.2s cubic-bezier(.22,1,.36,1) .3s}
```

---

## 5. Micro-Interactions

### Hero Scroll-Indicator

In `css.ts` — neues Element `.scroll-hint` am unteren Hero-Rand:
```css
.scroll-hint{position:absolute;bottom:28px;left:50%;transform:translateX(-50%);
  color:var(--soft);font-size:.78rem;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;display:flex;flex-direction:column;align-items:center;gap:8px;
  opacity:.6;transition:opacity .3s}
.scroll-hint svg{width:16px;height:16px;animation:bob 1.6s ease-in-out infinite}
nav.scrolled~.hero .scroll-hint{opacity:0}
```

In `sections.ts` — am Ende des Hero (vor `</header>`):
```html
<div class="scroll-hint">Entdecken<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 9l-7 7-7-7"/></svg></div>
```

### Button Shimmer

Primär-Buttons (`.btn`, `.btn.sun`) bekommen die Shimmer-Animation:
```css
.btn{position:relative;overflow:hidden}
.btn::before{content:"";position:absolute;top:0;left:-100%;width:100%;height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);
  animation:shimmer 3s infinite}
@keyframes shimmer{0%{left:-100%}100%{left:200%}}
```

### Nav Scroll Smooth

```css
nav{transition:padding .3s,background .3s,box-shadow .3s}
```

---

## 6. Farbpaletten-Erweiterung (berechnet)

3 neue CSS-Variablen, berechnet aus bestehenden Tokens in `flagshipCss()`:

```css
:root{
  /* bestehende 8 Tokens bleiben */
  --ak1-soft:rgba(AK1_RGB,.12);
  --ak2-soft:rgba(AK2_RGB,.12);
  --glow:0 0 40px rgba(AK1_RGB,.2);
}
```

Verwendung:
- `--ak1-soft` für Card-Icon Hintergründe im hover
- `--ak2-soft` für dezente Section-Tints
- `--glow` für Icon-Glow auf hover

---

## Zusammenfassung der Datei-Änderungen

### `lib/flagship/css.ts` (~50 Zeilen Änderungen/Ergänzungen)
- `:root` erweitert um `--ak1-soft`, `--ak2-soft`, `--glow`
- `.rv` Delay-System: `calc(var(--i,0)*0.08s)` statt `.d1/.d2/.d3`
- `.card` Hover: Gradient-Overlay, active scale, Icon-Glow
- `.quote` Hover: translateY + shadow
- `summary` Hover: color transition
- `.bezirke span` Hover: Glow
- `.tex::before` für diagonale Texture
- `.hero::after`, `.sig::after` für Ambient-Glow
- `h2`, `.lead`: `text-wrap:balance`
- `.eyebrow::before` im hellen Modus: Punkt statt Linie
- `.hl` Transition: sanftere Kurve
- `.scroll-hint` Styles
- `.btn::before` Shimmer-Animation
- `nav` Transition verbessert
- Alte `.d1/.d2/.d3` Klassen entfernen

### `lib/flagship/sections.ts` (~30 Stellen)
- Alle `d1/d2/d3` Klassenreferenzen ersetzen durch `style="--i:N"`
- `renderHero()`: Scroll-Indicator HTML einfügen
- Sections `.leist`, `.lokal-chips`, `.lokal-info`: CSS-Klasse `tex` ergänzen

### `lib/flagship/js.ts` (~0 Änderungen)
- Der Scroll-Indicator wird per CSS ausgeblendet (`nav.scrolled~.hero .scroll-hint`) — kein JS nötig
