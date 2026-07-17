# Visuelles Upgrade — Webseitenverlag Landing Page

**Ziel:** Die bestehende Landing Page (`WvdClient.tsx`) visuell upgraden im Stil von farisschmidt.de: Video-Hero mit Poster+Play, 3er Bento Problem-Cards, 5er Bento Features, Faris-Style Workflow-Steps mit Dringlichkeit-CTA. Inhalte/Texte bleiben gleich, Farbschema Blau bleibt.

---

## Scope

**Geändert wird:**
- Hero-Sektion: Video-Background mit Poster-Bild + zentrierter Play-Button (Glow), Text zentriert darüber
- Problem-Sektion (Sektion 2): 3er Bento-Grid mit Illustrativ-Icons statt Emoji, Dot-Pattern Hintergrund
- Bento-Features (neue Sektion): 5er Bento-Grid mit Glow-Icons (2 große oben, 3 kleine unten)
- Workflow-Sektion (Sektion 4): Faris-Style mit blauen Kreis-Icons, gestrichelter Verbindungslinie, Dringlichkeit-CTA
- Globale Animations: Framer Motion statt custom IntersectionObserver für ScrollReveal
- Glow-Effekte auf Cards, Icons, Buttons

**NICHT geändert wird:**
- Texte/Headlines (bleiben alle gleich)
- Farbschema (Blau #2563eb bleibt)
- Nav, ROI-Calculator, Social Proof, Marquee, Konsequenzen/Vision, FAQ, Footer, finaler CTA
- Sektionsreihenfolge (außer neue Bento-Features Sektion)
- `marketing.css` Basis-Styles (nur Ergänzungen)

---

## 1. Hero-Umbau

**Aktuell:** Dunkler Gradient + animiertes Grid, 2-Spalten (Text links, Browser-Mockup rechts), Text-Reveal Animation.

**Neu:**
- Fullwidth dunkle Sektion, Text **zentriert** (kein 2-Spalter mehr)
- Hinter dem Text: Video-Poster als dezenter Background (darkened overlay `rgba(15,23,42,0.85)`)
- Unter der Headline + Sub + CTA: ein Video-Container (16:9, max-width 720px, zentriert)
  - Poster-Bild (Placeholder: dunkelblauer Gradient mit Logo)
  - Play-Button in der Mitte: blauer Kreis mit Glow-Puls-Animation (`box-shadow: 0 0 0 0 rgba(37,99,235,0.5)` pulsierend)
  - Bei Klick: Video-Modal Overlay (für später, erstmal nur Play-Button)
- Trust-Badges bleiben darunter (zentriert, horizontal)
- Browser-Mockup + Speed-Badge entfallen (ersetzt durch Video-Container)
- Text-Reveal Animation bleibt (aber über Framer Motion)

## 2. Problem-Sektion → 3er Bento

**Aktuell:** Vertikale Liste mit Emoji + Text-Blocks.

**Neu:** 3-Spalten Bento-Grid (wie Faris Screenshot 1):
- Jede Card: SVG-Illustration oben (halbe Card-Höhe, hellblauer/grauer Hintergrund mit Dot-Pattern), fette Headline, beschreibender Text unten
- Cards: `border-radius: 20px`, `border: 1px solid var(--border)`, `background: var(--bg)`
- Hover: `transform: translateY(-4px)`, `box-shadow: 0 20px 40px -12px rgba(37,99,235,0.15)`
- Emojis werden durch SVG-Icons ersetzt (Kalender-leer, Website-Vergleich, Zielscheibe)
- Responsive: 1 Spalte auf Mobile

## 3. Neue 5er Bento-Features Sektion

**Position:** Nach der Solution-Sektion (Sektion 3), vor Workflow.

**Layout:** 5er Grid wie Faris Screenshot 2:
- Zeile 1: 2 große Cards (je 50% Breite)
- Zeile 2: 3 kleine Cards (je 33% Breite)

**Cards:**
- Card 1 (groß): "24h online" — Animierte Browser-Vorschau
- Card 2 (groß): "Conversion Optimiert" — Animiertes Chart/Graph
- Card 3 (klein): "SEO Inklusive" — Icon mit Glow
- Card 4 (klein): "Fertig in Tagen" — Blitz-Icon mit Glow
- Card 5 (klein): "Support Inklusive" — Headset-Icon mit Glow

**Visuell:**
- Dunkler Hintergrund (wie ROI-Calculator Sektion)
- Glassmorphism-Border: `border: 1px solid rgba(37,99,235,0.15)`
- Glow hinter Icons: `box-shadow: 0 0 60px rgba(37,99,235,0.3)`
- Subtile Animationen in den Icons (Puls, Rotation)

## 4. Workflow → Faris-Style Steps

**Aktuell:** 3 Cards mit Beam-SVG-Verbindungen.

**Neu:** Wie Faris Screenshot 3:
- 3 blaue Kreis-Icons in einer Reihe
- Verbunden durch gestrichelte horizontale Linien (`border-top: 2px dashed var(--blue)`)
- Unter jedem Kreis: Titel + Beschreibung
- Unter dem Ganzen: Dringlichkeit-CTA Button:
  - Dunkler, abgerundeter Button mit Pfeil-Icon
  - "Kostenloses Erstgespräch buchen"
  - Darunter: grüner Dot + "Aktuell 3 Plätze diese Woche verfügbar"

## 5. Framer Motion ScrollReveal

**Aktuell:** Custom IntersectionObserver in useEffects (DOM-Manipulation).

**Neu:** Framer Motion `motion.div` mit `whileInView`:
- `initial={{ opacity: 0, y: 30 }}`
- `whileInView={{ opacity: 1, y: 0 }}`
- `transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}`
- `viewport={{ once: true, margin: "-80px" }}`

Betrifft: Alle Sektionen die aktuell keinen ScrollReveal haben + Hero-Elemente.

## 6. Glow-Effekte (CSS)

Neue CSS-Klassen in `marketing.css`:
- `.glow-blue` — `box-shadow: 0 0 60px rgba(37,99,235,0.25)`
- `.glow-pulse` — Keyframe Animation für pulsierenden Glow
- `.bento-card` — Hover-State mit translateY + Shadow
- `.dot-pattern` — SVG Background-Pattern für Bento-Cards

---

## Dateien die geändert werden

1. `components/landing/WvdClient.tsx` — Hero-Umbau, Problem-Bento, Workflow-Umbau, ScrollReveal
2. `app/(marketing)/marketing.css` — Neue CSS-Klassen für Bento, Glow, Video-Hero, Dot-Pattern
3. Neuer Ordner/Datei nicht nötig — alles in bestehende Dateien

## Risiken

- WvdClient.tsx ist 810 Zeilen — wird etwas größer, aber bleibt eine Datei (keine neue Architektur)
- Framer Motion ist bereits installiert aber noch nicht in WvdClient genutzt — muss importiert werden
- Video-Poster: wird als CSS-Gradient erstellt (kein echtes Bild nötig erstmal)
