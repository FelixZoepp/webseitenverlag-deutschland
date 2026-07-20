# QA-GATE & PRODUKTSTUFEN — Erweiterung zum MVP_FINISH_PROMPT

> **An Claude Code:** Dieses Dokument erweitert `MVP_FINISH_PROMPT.md` um drei Bausteine:
> (A) Browser-QA mit Playwright als letztes Gate vor jeder Freigabe, inkl. chirurgischer
> Selbstreparatur, (B) die Qualitäts-Guideline `QUALITY_CHECKLIST.md` als Single Source
> of Truth, (C) die drei Produktstufen 99/149/249 € mit Video-Leiste und Editor-Gating.
> Arbeitsregeln aus MVP_FINISH_PROMPT Abschnitt 0 gelten unverändert. Einsortierung:
> Baustein A+B nach Phase 3, Baustein C nach Phase 4 des MVP-Prompts.

---

## A. Browser-QA: Playwright-Scan als letztes Gate (nach Generierung UND nach jedem Publish)

**Prinzip:** Der bestehende Konsistenz-Validator prüft Config und HTML-String.
Der Playwright-Scan prüft, was ein echter Browser WIRKLICH rendert. Erst wenn beide
grün sind, darf eine Site `demo_bereit` oder live-published werden. Kein Bypass-Pfad.

### A.1 Ablauf

1. Job `browserQa(siteId, mode: 'demo'|'publish')` startet nach erfolgreichem Render.
2. Headless Chromium lädt die Site über den lokalen Host-Override, zweimal:
   Mobile-Viewport (390×844) und Desktop (1440×900).
3. Alle Checks aus `QUALITY_CHECKLIST.md` mit Layer `browser` ausführen (siehe B).
4. Screenshots (mobile + desktop, full-page) als Artefakte am Site-Datensatz speichern —
   sie werden im Admin neben der „Demo geprüft"-Checkbox angezeigt: der Mensch sieht
   exakt, was der Scanner sah.
5. Ergebnis als `qa_reports`-Eintrag (JSON): jede Regel-ID mit pass/fail + Details
   (Selector, gemessener Wert, erwarteter Wert). Additiv migrieren:
   `qa_reports(id, site_id, mode, status, report jsonb, screenshots jsonb, created_at)`.

### A.2 Chirurgische Selbstreparatur (NIE global neu generieren)

Bei Fails wird klassifiziert und NUR das betroffene Teil repariert. Max. **2
Reparatur-Runden**, danach `failed` mit lesbarem Report — niemals Endlosschleife,
niemals stilles Durchwinken.

| Fehlerklasse (Beispiele) | Reparatur |
|---|---|
| Bild lädt nicht (naturalWidth=0, 404, Timeout) | `assignAssets` erneut für GENAU diesen Slot mit Ausschlussliste (defektes Asset ausschließen); Asset in der Bank als `broken` flaggen + Admin-Hinweis |
| Slot-Rest sichtbar (`{{`, „Lorem", Stub-Pfad) | Nur die betroffenen Copy-Slots mit Fehler-Feedback neu füllen; alle anderen Slots UNVERÄNDERT lassen |
| Falsche Stadt im Render | Betroffene Copy-Slots neu (Feedback: „Stadt X verboten, nur {stadt}") |
| Fehlendes/leeres alt | alt_text aus Asset-Datensatz nachziehen; fehlt er dort ⇒ per Claude generieren + am Asset speichern |
| Toter Link (`#`, 404 intern) | Link aus Section-Config reparieren oder Element ausblenden (Regel je Section definiert) |
| CLS > 0.05 / fehlende width+height | width/height aus Asset-DB ins Markup nachziehen; wenn strukturell ⇒ Template-Bug: Job failed + `manual_task` (Template-Fixes macht der Mensch/eine eigene Session, nie der Reparatur-Job) |
| Console-Error / fehlgeschlagener Request | Wenn von Drittquelle ⇒ Quelle entfernen (Fremd-CDNs sind eh verboten); wenn eigener Code ⇒ failed + Report |
| Video-Header: lädt nicht, >3 MB, kein Poster, nicht muted/loop | Fallback auf statisches Hero-Bild desselben Slots (Site bleibt auslieferbar!), Video-Task in Admin-Queue |

Nach jeder Reparatur: Re-Render + kompletter Re-Scan (nicht nur der reparierte Check).

### A.3 Wann der Scan läuft

- Nach jeder Demo-Generierung (Pflicht vor `demo_bereit`).
- Nach jedem Kunden-Publish aus dem Editor (asynchron; Fail ⇒ Publish wird NICHT
  zurückgerollt, aber Admin-Alarm + Report — der Kunde darf nicht blockiert werden,
  wir wollen es nur sofort wissen).
- Nightly-Cron über alle Live-Sites (Stichprobe oder alle, Config): erkennt schleichende
  Fehler (gelöschte Assets, abgelaufene Quellen).

**DoD A:** Golden-Set-Lauf: absichtlich präparierte Fehlerfälle (defekte Bild-URL,
Slot-Rest, falsche Stadt, fehlendes alt) werden vom Scan erkannt und in ≤ 2 Runden
automatisch repariert; ein absichtlich unreparierbarer Fall endet als `failed` mit
verständlichem Report; Screenshots erscheinen im Admin.

---

## B. `QUALITY_CHECKLIST.md` — die eine Wahrheit für „perfekte Webseite"

Lege im Repo-Root `QUALITY_CHECKLIST.md` an. Jede Regel hat: **ID, Beschreibung,
Layer (`config` | `render` | `browser`), Autofix-Strategie, Test-Referenz.**
Validator (config/render) und Playwright-Scan (browser) implementieren dieselbe Liste —
eine Regel ohne Implementierung in ihrem Layer ist ein Build-Fehler (Lint-Script
`scripts/check-quality-coverage.ts` gleicht IDs gegen Testnamen ab).

Startbestand (erweiterbar, niemals kürzen ohne Menschen-Freigabe):

**Inhalt & Copy:** Stadt in H1 + Title (config) · Städte-Blockliste im DOM (browser) ·
keine Floskel-Blacklist-Treffer (render) · keine `{{`/„Lorem"/Stub-Texte (browser) ·
Zeichenlimits je Slot (config) · keine erfundenen Bewertungen: Review-Sektion nur bei
echten Profildaten (config) · Telefonnummer & Kontakt vorhanden und verlinkt
(`tel:`/`mailto:`) (browser).

**Bilder:** jeder Pflicht-Slot gefüllt (config) · jedes `<img>` lädt real,
naturalWidth > 0 (browser) · kein Asset doppelt pro Seite (config) · Aspect-Ratio
Slot vs. gerendert ±5 % (browser) · width/height gesetzt (render) · alt_text_de
nicht leer (render) · nur `quality_status='approved'` (config) · Vorher/Nachher nur
als echtes `pair_id`-Paar (config) · keine Originale, nur optimierte Varianten (render).

**Technik & Performance:** keine Console-Errors, keine failed Requests (browser) ·
keine Fremd-CDNs/Google-Fonts-CDN (render) · CLS < 0.05, LCP-Element = Hero mit
preload (browser) · JS-Budget je Template-Level eingehalten (render) · keine toten
`#`-Links (browser) · Formular-Testsubmit erreicht Endpoint (browser) ·
`prefers-reduced-motion` respektiert (browser: emulieren + prüfen, dass Animationen aus).

**SEO & Recht:** Title/Description mit Stadt (render) · LocalBusiness-JSON-LD valide
(render) · OG-Tags + og:image (render) · Impressum & Datenschutz verlinkt und
erreichbar (browser) · `noindex` bei status=demo, KEIN noindex bei live-final (browser) ·
Sitemap enthält alle Seiten (render).

**Video (nur Growth):** ≤ 3 MB (config) · muted + loop + playsinline + poster (browser) ·
Poster ist LCP, Video lazy nach LCP (browser) · Fallback-Bild im selben Slot
deklariert (config).

---

## C. Produktstufen — Architektur & Gating (`config/plans.ts` erweitern)

**Grundsatz:** Die Stufen unterscheiden sich in Template-Level und Editor-Rechten.
Die Generierungs-Pipeline ist für alle identisch — insbesondere werden **Copy-Slots in
JEDER Stufe personalisiert** (Name, Stadt, Leistungen, Kontakt). Begründung im Code
dokumentieren: identische Texte über Kunden = Duplicate Content = SEO-Schaden = Kern des
Wertversprechens verletzt. „Fix" am 99€-Paket ist die Struktur, nicht der Text.

### C.1 STARTER — 99 €/Monat: „Frozen Composition"

- Pro Branche EINE festgelegte Komposition (`library_pages.frozen=true`): Sektionen,
  Reihenfolge, Theme-Preset unveränderlich.
- Bilder deterministisch aus dem Branchen-Set (seeded, wie gehabt). Kein Video,
  keine Signature-Section (Premium-Statik + Micro-Animationen).
- Editor-Rechte: `update_text`, `swap_image_from_bank`, `set_theme_preset` (nur aus
  2–3 erlaubten Presets). **Gesperrt:** `add_section_from_library`, `reorder`,
  Video-Funktionen.
- Generierung ist ohne jedes KI-Risiko bei den Bildern und in Sekunden fertig —
  das ist die Marge dieser Stufe.

### C.2 BUSINESS — 149 €/Monat: Sektionen hinzufügen + Signature

- Alles aus Starter, plus: **`add_section_from_library` freigeschaltet** — im
  Chat-Editor-Menü erscheint (wie im Webild-Vorbild) eine Sektions-Galerie:
  Vorschaubild je approved Library-Variante passend zur Branche; Klick ⇒ Sektion wird
  eingefügt und ihre Copy-Slots im Kontext der Site von Claude gefüllt ⇒ Draft ⇒
  Preview ⇒ Publish (inkl. Browser-QA danach).
- Plus `reorder` (Kern-Sektionen Hero/CTA/Kontakt bleiben fixiert) und die
  branchenspezifische Signature-Section.
- **Editor als Verkäufer (Gating-Mechanik):** Fragt ein Starter-Kunde nach einer
  gesperrten Funktion oder klickt eine ausgegraute Sektion an, antwortet der Bot mit
  1–2 Sätzen Nutzen + Preis + Laufzeit im Klartext + Upgrade-Button (gespeicherte
  Zahlungsmethode, Proration via Stripe). Kauf ⇒ `contracts`-Eintrag ⇒ Rechte sofort
  aktiv. Abgelehnt ⇒ 60 Tage nicht erneut pushen (Config).
- Gates ausschließlich server-seitig prüfen (`plan.features`), nie nur UI-seitig.

### C.3 GROWTH — 249 €/Monat: Video-Header mit KI-Video-Leiste

- Alles aus Business, plus Video-Header + Scroll-Story-Level.
- **Video-Leiste (Admin-Tool, `/admin/sites/{id}/video`):**
  1. Mensch beschreibt das Wunschvideo in normalem Deutsch (Freitext) — die Beschreibung
     kann 1:1 vom Kunden kommen (Wizard-Feld „Beschreiben Sie Ihr Wunschvideo"),
     generiert wird aber IMMER über dieses Admin-Tool.
  2. **Prompt-Refiner:** Claude verfeinert die Beschreibung zu einem Higgsfield-Prompt
     nach `config/video-guidelines.ts`: 5–8 s, nahtlos loopbar, ruhige Kamerafahrt,
     Branchen-Style-Baukasten (Licht/Farbwelt je Branche), Negativ-Regeln (keine
     Gesichter nah, keine Logos/Marken, kein eingebrannter Text, kein Flackern),
     Poster-Frame-Anweisung. UI zeigt Original neben verfeinertem Prompt; Mensch kann
     editieren.
  3. Generieren ⇒ Kompression/Transcode-Pipeline (H.264/AV1, ≤ 3 MB, Poster-Frame
     extrahieren) ⇒ `asset_bank` als `medium='video'`, `quality_status='draft'`,
     Prompt + Seed gespeichert.
  4. Freigabe-UI zeigt Loop-Preview; erst `approved` ⇒ zuweisbar. Regenerate-Button
     nutzt den gespeicherten Prompt mit neuem Seed.
- Live-Ausspielung nur approved; Browser-QA prüft die Video-Regeln aus B; bei
  Video-Fehlern greift IMMER der statische Bild-Fallback (Site geht nie kaputt, weil
  ein Video fehlt).
- Demo-Level-Regel bleibt: Demos rendern auf Business-Level, `?level=growth`-Umschalter
  zeigt den Video-Look live im Verkaufsgespräch.

### C.4 Stripe-Mapping

Drei Stripe-Products (Preise NUR in Stripe/Config), `plan`-Feld an der Site,
Feature-Matrix in `config/plans.ts` als einzige Wahrheit im Code:

```ts
plans: {
  starter:  { preis_hinweis: '99 € netto',  features: ['update_text','swap_image_from_bank','set_theme_preset'] },
  business: { preis_hinweis: '149 € netto', features: [...starter, 'add_section_from_library','reorder','signature_section'] },
  growth:   { preis_hinweis: '249 € netto', features: [...business, 'video_header','scroll_story'] },
}
```

**DoD C:** (1) Starter-Site generiert in < 60 s ohne einen einzigen KI-Bild-Call,
Texte trotzdem personalisiert (Test: zwei Starter-Maler in zwei Städten haben
unterschiedliche H1/Texte). (2) Starter-Kunde sieht Sektions-Galerie ausgegraut,
bekommt Upsell-Antwort, Testmode-Upgrade schaltet `add_section_from_library` sofort
frei (server-seitig verifiziert). (3) Video-Leiste: Beschreibung ⇒ verfeinerter Prompt
sichtbar ⇒ (Stub-)Generierung ⇒ Freigabe ⇒ Zuweisung; Browser-QA erzwingt Poster +
≤ 3 MB; Video-Ausfall rendert Bild-Fallback. (4) Alle neuen Regeln stehen in
`QUALITY_CHECKLIST.md` mit Layer + Test.

---

**Reihenfolge: A ⇒ B ⇒ C. Nach jedem Baustein: PROGRESS.md, Commit, Selbsttest grün.**
