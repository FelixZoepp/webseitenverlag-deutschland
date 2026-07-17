# AUTO-QA & SELBSTKORREKTUR – Ausführungs-Prompt

> **An Claude Code:** Additive Ergänzung zu `CLAUDE_CODE_MASTERPROMPT.md` (Konsistenz-
> Validator 2.3, Demo-Pipeline Phase D) und `BRANCHEN_FABRIK_PROMPT.md` (Auto-Seeding,
> `guideline_notes`). Arbeitsregeln aus Abschnitt 0 gelten. Dieser Prompt baut den
> QA-Agenten, der jede Demo **selbst rendert, anschaut, Fehler erkennt, nachbessert und
> die Lektion dauerhaft ins Gedächtnis schreibt**, damit derselbe Fehler nicht wiederkehrt.
>
> **Grenze bewusst benennen (nicht übertreiben):** Ein LLM lernt nicht im Betrieb dazu –
> „Lernen“ heißt hier *Gedächtnis als Datei* (`guideline_notes`), das in künftige Prompts
> injiziert wird. Der QA-Agent erkennt, was sich **sehen oder messen** lässt (Kontrast,
> leere Slots, tote Links, Floskeln, Layout-Bruch, DSGVO-Verstöße). Fragen von **Geschmack
> und Kontext** bleiben beim Mensch-Freigabe-Gate. Nichts an diesem Prompt ersetzt es.

---

## 1. Wo der QA-Schritt läuft

Als **harter Gate zwischen Demo-Generierung und Freigabe/Versand.** Jede Demo (frisch
generiert oder neu geseedet) durchläuft `runAutoQA(siteId)` **bevor**:
- eine Demo dem Setter/Closer im Dashboard als „bereit“ angezeigt wird, und
- eine neu geseedete Branche ins Mensch-Freigabe-Gate (`#library`) geht.

Ergebnis ist immer eines von: `pass` · `pass_after_fix` (automatisch korrigiert) ·
`needs_human` (nicht automatisch lösbar → Slack `#worklist` mit Screenshot + Befund).
Eine Demo ohne `pass`/`pass_after_fix` wird nie automatisch ausgeliefert.

---

## 2. Render → Anschauen (das, was reines Code-Lesen nicht kann)

`lib/qa/render.ts` mit Playwright (Chromium headless):

1. Demo unter ihrer internen Preview-URL laden, `networkidle` abwarten, zusätzlich auf
   `document.fonts.ready` und das `onload` aller `<img>`/`poster` warten (sonst QA auf
   halb geladenem Zustand).
2. **Scroll-Durchlauf**, nicht nur Viewport oben: In Schritten von ~80 % Viewporthöhe bis
   zum Seitenende scrollen, bei jedem Halt kurz warten (scroll-getriggerte Reveals/Videos
   müssen ausgelöst sein), Screenshot je Sektion + ein `fullPage`-Screenshot.
3. Zwei Breiten rendern: **390 px (mobil)** und **1440 px (desktop)** – die meisten
   Layout-/Lesbarkeitsfehler sind breitenabhängig.
4. Bei Video-Headern/Scroll-Videos: an mehreren Scroll-Positionen prüfen (Anfang/Mitte/
   Ende), damit ein an einer Stelle unlesbarer Text nicht durchrutscht.

Diese Screenshots sind der Input für die Prüfung – **der Agent schaut die Seite an**, statt
nur den Code zu vermuten.

---

## 3. Zweistufige Fehlererkennung

### 3a. Deterministische Checks (Code/DOM – schnell, sicher, zuerst)
Aus dem gerenderten DOM + berechneten Styles, ohne Interpretation:
- **Leere/kaputte Assets:** `<img>` mit `naturalWidth===0`, `<video>` ohne ladbare Quelle,
  Slots die noch den Platzhalter-Text (`data-label`, „Asset folgt“) zeigen.
- **Kontrast/Lesbarkeit:** für jeden sichtbaren Textknoten über Bild/Video den effektiven
  Kontrast schätzen (Textfarbe vs. mittlere Luminanz der Region hinter dem Text aus dem
  Screenshot); unter WCAG-Schwelle → Flag. **Genau der Fehler „Schrift säuft im Bild ab“.**
- **Unsichtbar hängengebliebene Reveals:** Elemente mit `opacity:0` / außerhalb des
  Viewports transformiert, die nach dem Scroll-Durchlauf sichtbar sein müssten
  (Reveal-Bug-Detektor).
- **Tote Links / leere Pflicht-Slots:** Hero-CTA, Kontakt, `/anfrage`-Link, Buchungslink
  vorhanden und gefüllt; keine `#`-Dummies; keine rohen Entities/Slots im Text.
- **Städte-/Fakten-Blockliste:** falsche Stadt im Text (Top-200-DE-Abgleich), Widersprüche
  Hero vs. Footer.
- **DSGVO/Recht:** erkennbare Personen im Header/Signature (nach der Regel „die Arbeit,
  nicht die Person“ – Gesichts-/Personen-Erkennung auf den Header-Screenshots); gespiegeltes
  Video mit lesbarer (seitenverkehrter) Schrift; Fremd-CDN-URLs im ausgelieferten Markup.
- **Reviews:** nur echte Places-/Website-Bewertungen; keine erfundenen (Abgleich gegen die
  Quelle, sonst Sektion ausblenden).
- **Performance-Budget:** Lighthouse Mobile ≥ 90/95/90, JS-Budget eingehalten.

### 3b. Visuelle Prüfung gegen eine feste Rubrik (Screenshot → Urteil)
Die Screenshots werden mit einer **festen, abhakbaren Checkliste** beurteilt (kein freies
„sieht gut aus?“, sondern konkrete Ja/Nein-Kriterien), u. a.:
- Ist an **jeder** Scroll-Position **jede** Schrift klar lesbar?
- Sitzt beim Video-/Bild-Header das Motiv auf der **Text-Gegenseite** (keine Überlagerung)?
- Zeigt das Vorher/Nachher-Paar **dieselbe Szene/Perspektive**, nur der Effekt verändert?
- Fließen die Sektionen ineinander, oder gibt es harte Kästen/Bildkanten?
- Wirken Bilder zur Branche passend und personen-frei nach DSGVO-Regel?
- Sind alle Sektionen sichtbar (nichts durch einen Reveal-Bug „verschwunden“)?

Jeder Fund bekommt: `regel` (welche verletzt), `schwere` (block|major|minor), `sektion`,
`beleg` (Screenshot-Ausschnitt + DOM-Selektor), `fix_vorschlag`.

---

## 4. Selbstkorrektur (begrenzt, protokolliert, nie endlos)

Für Funde mit bekanntem, sicherem Fix führt der Agent **eine** Korrektur-Runde aus, dann
rendert und prüft er erneut. **Maximal 2 Fix-Runden**, danach `needs_human` (kein
Endlos-Loop, kein Token-Verbrennen).

Automatisch behebbare Klassen (Beispiele mit konkretem Fix):
- Kontrast zu schwach → Bild abdunkeln (Helligkeits-Filter) und/oder Scrim auf der Textseite
  verstärken; Text-Shadow ergänzen.
- Reveal hängengeblieben → betroffenes Muster auf das ausfallsichere Verfahren umstellen
  (nur unter aktiver Animation verstecken, IntersectionObserver + Not-Fallback).
- Leerer Bild-Slot / kaputtes Asset → Bank-Fallback ziehen (Demo scheitert nie an Bildern).
- Fremd-CDN-URL im Output → Asset lokalisieren (Download/WebP) und Pfad ersetzen.
- Personen im Header → Header-Asset nach Asset-Rezeptur neu generieren („hands only /
  no face / focus on the craft“).
- Harte Bildkante → Verblendung (Maske/Verlauf ins Schwarz) ergänzen.

**Nicht automatisch** (→ `needs_human`): Geschmack/Markenwirkung, unklare Branche, Verdacht
auf inhaltlich falsche Fakten, alles ohne eindeutigen Fix. Lieber ehrlich eskalieren als
raten.

---

## 5. Das „Lernen“: Fehler → `guideline_notes` (Gedächtnis als Datei)

Der eigentliche Kern deiner Frage. Nach jeder QA:

1. Jeder **bestätigte, korrigierte** Fund wird als kompakte Lektion destilliert:
   `{ regel, ausloeser, konsequenz, fix, meta_kategorie|branche }` – z. B.
   *„Header-Bild mit heller Szene + heller Textbereich → Schrift unlesbar → Bild ≤ 50 %
   Helligkeit + Textseiten-Scrim ≥ 80 %; gilt für Meta-Kategorie Gastro.“*
2. Diese Lektion wird in `guideline_notes` **auf der passenden Ebene** gespeichert:
   branchenspezifisch an `branchen_profile`, allgemeingültig an der Meta-Kategorie
   (`config/branchen.ts`) bzw. global (`config/qa_guidelines.ts`).
3. **Injektion in künftige Prompts:** Seeding-, Demo- und Asset-Generierungs-Prompts laden
   die relevanten `guideline_notes` und hängen sie als „Beachte aus früheren Korrekturen:
   …“ an. Ab dem nächsten Lauf ist die Lektion aktiv – **derselbe Fehler wird nicht mehr
   gemacht.**
4. **Dedupe & Kuratierung:** gleiche Lektion nicht doppelt; wächst eine Kategorie über
   ~15 Notes, verdichtet der Agent sie zu einer Regel und schlägt sie im wöchentlichen
   „Library-Blick“ zur Aufnahme ins feste Regelwerk vor (Mensch bestätigt). So bläht sich
   der Prompt nicht unkontrolliert auf.
5. **Ehrliche Kennzeichnung:** `guideline_notes` sind kuratiertes Gedächtnis, kein
   Modell-Training. Der wöchentliche Blick ist Pflicht, damit sich keine falsche „Lektion“
   verfestigt.

---

## 6. Regressions-Schutz (damit alte Fehler nicht zurückkehren)

- **Golden-Set** (10 reale Firmen aus dem Masterprompt): Nach jeder Systemänderung
  QA-Durchlauf über alle 10; ein zurückgekehrter alter Fehler bricht den Lauf und meldet
  nach `#errors`.
- **Fehler-Fixtures:** Für jede in `guideline_notes` aufgenommene Lektion eine Mini-
  Testseite, die den Fehler provoziert; die QA muss ihn zuverlässig fangen (Test für den
  Tester).
- **Kennzahl:** QA-Ergebnisse (`pass` / `pass_after_fix` / `needs_human`, Fund-Häufigkeit
  je Regel) ins `/admin/kennzahlen`-Dashboard – so siehst du, ob die First-Try-Quote über
  Zeit steigt und welche Regel am häufigsten greift.

---

## 7. Datenmodell (additiv)

```sql
create table qa_runs (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null,
  ergebnis text not null,            -- pass | pass_after_fix | needs_human
  fix_runden int default 0,
  befunde jsonb,                     -- [{regel,schwere,sektion,beleg,fix_vorschlag,behoben}]
  screenshots text[],                -- Storage-Pfade (mobil/desktop, je Sektion)
  lighthouse jsonb,
  created_at timestamptz default now()
);
-- guideline_notes existiert bereits (BRANCHEN_FABRIK): hier nur befüllen/injizieren.
-- config/qa_guidelines.ts: globale, branchenübergreifende Lektionen.
```

---

## 8. Ausführungsplan (mit DoD)

**Q1 – Render-Harness:** Playwright, Scroll-Durchlauf, Multi-Breite, Warte-Logik, Screenshot-
Ablage.
✅ DoD: Für eine bestehende Demo entstehen vollständige Screenshots (mobil+desktop, alle
Sektionen), Videos/Reveals sind auf den Bildern ausgelöst.

**Q2 – Deterministische Checks:** alle Prüfungen aus 3a, jeweils mit belegtem Fund.
✅ DoD: Auf absichtlich kaputten Testseiten (unlesbarer Text, leerer Slot, Fremd-CDN,
Person im Header, erfundene Review, hängender Reveal) wird jeder Fehler zuverlässig gemeldet.

**Q3 – Visuelle Rubrik + Selbstkorrektur:** Screenshot-Beurteilung gegen die feste
Checkliste, max. 2 Fix-Runden, Re-Render.
✅ DoD: Kontrast- und Reveal-Fehler werden automatisch behoben und beim Re-Check bestätigt;
nicht lösbare Fälle landen sauber als `needs_human` in `#worklist` mit Screenshot.

**Q4 – Gedächtnis-Schleife:** `guideline_notes` schreiben, dedupen, in Seeding-/Demo-/Asset-
Prompts injizieren.
✅ DoD: Ein einmal aufgetretener und korrigierter Fehler taucht bei einem frischen Lauf
derselben Branche **nicht erneut** auf (nachweisbar über eine wiederholte Generierung).

**Q5 – Regression + Kennzahlen:** Golden-Set-Lauf, Fehler-Fixtures, QA-Kennzahlen im
Dashboard.
✅ DoD: Golden-Set grün; jede aufgenommene Lektion hat eine Fixture; Dashboard zeigt
First-Try-Quote und Top-Regeln.

---

**Start mit Q1. Nach jeder Q-Phase: DoD prüfen, committen, `PROGRESS.md` fortschreiben,
stoppen. Resume: „Lies AUTO_QA_PROMPT.md und PROGRESS.md und führe die nächste offene
Q-Phase aus.“**
