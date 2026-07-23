# QUALITY_CHECKLIST — QA-Gate-Regeln

> **Generiert aus `lib/qa-gate/regeln.ts` — NICHT von Hand editieren.**
> Neu generieren: `npm run check:quality -- --write`
>
> Jede Regel wird per `scripts/check-quality-coverage.ts` gegen ihre
> Implementierung (Marker) und ihren Test (Regel-ID) geprüft.
> Regel ohne Implementierung = Build-Fehler.

Stand: 39 Regeln · Layer: Config (Generierung) → Render (HTML) → Browser (Playwright)

## Inhalt & Copy

| ID | Regel | Layer | Autofix | Implementiert in | Test |
|----|-------|-------|---------|------------------|------|
| `C-STADT-H1` | Kundenstadt kommt in H1 (hero_headline) und im SEO-Titel vor. | Config | Copy-Retry mit Fehler-Feedback (max. 2 Runden), sonst failed. | `lib/generierung/copy-slots.ts` | `scripts/test-phase3.ts` |
| `B-BLOCKLISTE` | Keine fremde Stadt aus der Top-200-Blockliste im sichtbaren DOM. | Browser | Nur betroffene Copy-Slots mit Fehler-Feedback neu generieren, andere unverändert. | `lib/qa-gate/browser-checks.ts` | `scripts/test-qa-gate.ts` |
| `R-FLOSKEL` | Floskel-Blacklist („Ihr zuverlässiger Partner“ u. a.) taucht nirgends auf. | Render | Copy-Retry mit Fehler-Feedback (max. 2 Runden), sonst failed. | `lib/generierung/copy-slots.ts` | `scripts/test-phase3.ts` |
| `B-STUB` | Keine {{Token}}-Reste, kein „Lorem“, keine Stub-Texte im DOM. | Browser | Nur betroffene Copy-Slots mit Fehler-Feedback neu befüllen, andere unverändert. | `lib/qa-gate/browser-checks.ts` | `scripts/test-qa-gate.ts` |
| `C-LIMITS` | Zeichenlimits aller Copy-Slots werden eingehalten (Schema). | Config | Copy-Retry mit Limit-Feedback (max. 2 Runden), sonst failed. | `lib/generierung/copy-slots.ts` | `scripts/test-phase3.ts` |
| `C-REVIEWS` | Keine erfundenen Bewertungen — Kundenstimmen nur bei echten Profildaten. | Config | Stimmen-Sektion automatisch leeren (quotes = []). | `lib/generierung/konsistenz-validator.ts` | `scripts/test-phase3.ts` |
| `B-KONTAKT` | Telefon sichtbar und als tel:-Link verlinkt; Kontaktweg vorhanden. | Browser | Strukturell (Template-Bug) → failed + manual_task. | `lib/qa-gate/browser-checks.ts` | `scripts/test-qa-gate.ts` |

## Bilder

| ID | Regel | Layer | Autofix | Implementiert in | Test |
|----|-------|-------|---------|------------------|------|
| `C-SLOTS` | Alle Pflicht-Bild-Slots (Hero, Signature vorher/nachher, BA-Paare) sind befüllt. | Config | assignAssets für genau diesen Slot erneut, sonst failed. | `lib/generierung/konsistenz-validator.ts` | `scripts/test-phase3.ts` |
| `B-IMG-LOAD` | Jedes <img> lädt wirklich (naturalWidth > 0). | Browser | assignAssets für genau diesen Slot mit Ausschlussliste; defektes Asset als broken markieren + Admin-Hinweis. | `lib/qa-gate/browser-checks.ts` | `scripts/test-qa-gate.ts` |
| `C-IMG-DUP` | Kein Bild doppelt auf derselben Seite. | Config | assignAssets mit Ausschlussliste für den doppelten Slot. | `lib/generierung/konsistenz-validator.ts` | `scripts/test-phase3.ts` |
| `B-ASPECT` | Dargestelltes Seitenverhältnis weicht max. ±5 % vom intrinsischen ab (keine Verzerrung). | Browser | Maße aus Asset-DB nachziehen; strukturell → failed + manual_task. | `lib/qa-gate/browser-checks.ts` | `scripts/test-qa-gate.ts` |
| `R-IMG-DIM` | Jedes <img> trägt width- und height-Attribut (CLS-Schutz). | Render | Maße aus Asset-DB nachziehen (setzeBildMasse); strukturell → Template-Bug → failed. | `lib/generierung/konsistenz-validator.ts` | `scripts/test-phase3.ts` |
| `R-ALT` | Jedes <img> hat aussagekräftigen deutschen alt-Text. | Render | alt aus Asset-Datensatz (alt_text_de) ziehen, sonst Claude-generieren und am Asset speichern. | `lib/qa-gate/render-checks.ts` | `scripts/test-qa-gate.ts` |
| `C-APPROVED` | Nur Assets mit quality_status=approved werden zugewiesen. | Config | Kein Autofix — harter Fail in assignAssets, wenn kein approved Asset existiert. | `lib/assets/repository.ts` | `scripts/test-assets.ts` |
| `C-PAAR` | Vorher/Nachher-Bilder nur als echtes Paar (gemeinsame pair_id). | Config | Paar-Neuzuweisung über pair_id; ohne Paar → Sektion entfällt. | `lib/generierung/konsistenz-validator.ts` | `scripts/test-phase3.ts` |
| `R-VARIANTEN` | Nur verarbeitete Varianten im HTML — keine original_-Pfade. | Render | Slot auf Variante umziehen (assignAssets), sonst failed. | `lib/qa-gate/render-checks.ts` | `scripts/test-qa-gate.ts` |

## Technik

| ID | Regel | Layer | Autofix | Implementiert in | Test |
|----|-------|-------|---------|------------------|------|
| `B-CONSOLE` | Keine Console-Errors und keine fehlgeschlagenen Requests beim Laden. | Browser | Drittanbieter-Quelle entfernen; eigener Code → failed + manual_task. | `lib/qa-gate/browser-checks.ts` | `scripts/test-qa-gate.ts` |
| `R-CDN` | Keine fremden CDNs/Third-Party-Skripte im HTML (Fonts/Assets self-hosted bzw. Supabase). | Render | Fremde Quelle aus dem HTML entfernen. | `lib/qa-gate/render-checks.ts` | `scripts/test-qa-gate.ts` |
| `B-CLS` | Cumulative Layout Shift < 0.05 beim Laden (mobil und Desktop). | Browser | width/height aus Asset-DB nachziehen; strukturell → Template-Bug → failed + manual_task. | `lib/qa-gate/browser-checks.ts` | `scripts/test-qa-gate.ts` |
| `R-JS-BUDGET` | Inline-JS-Budget: Gesamtgröße aller <script> ≤ 32 kB (keine Frameworks). | Render | Kein Autofix — Template-Bug → failed + manual_task. | `lib/qa-gate/render-checks.ts` | `scripts/test-qa-gate.ts` |
| `B-LINKS` | Keine toten href="#"-Links im DOM. | Browser | Link aus Sektions-Config reparieren oder Element ausblenden; sonst failed. | `lib/qa-gate/browser-checks.ts` | `scripts/test-qa-gate.ts` |
| `B-FORM` | Formular-Testsubmit erreicht den Endpoint (bzw. Funnel-CTA korrekt verlinkt). | Browser | Strukturell → failed + manual_task. | `lib/qa-gate/browser-checks.ts` | `scripts/test-qa-gate.ts` |
| `B-MOTION` | prefers-reduced-motion wird respektiert (keine Endlos-Animationen unter reduce). | Browser | Strukturell → Template-Bug → failed + manual_task. | `lib/qa-gate/browser-checks.ts` | `scripts/test-qa-gate.ts` |

## SEO & Recht

| ID | Regel | Layer | Autofix | Implementiert in | Test |
|----|-------|-------|---------|------------------|------|
| `R-SEO-TITLE` | Title (≤60) und Meta-Description (≤160) vorhanden, beide mit Kundenstadt. | Render | seo_titel/seo_beschreibung mit Feedback neu generieren. | `lib/qa-gate/render-checks.ts` | `scripts/test-qa-gate.ts` |
| `R-JSONLD` | JSON-LD (LocalBusiness) vorhanden und valide parsebar. | Render | Kein Autofix — Template-Bug → failed. | `lib/qa-gate/render-checks.ts` | `scripts/test-qa-gate.ts` |
| `R-OG` | OG-Tags (og:title, og:description, og:type, og:locale) vorhanden. | Render | Kein Autofix — Template-Bug → failed. | `lib/qa-gate/render-checks.ts` | `scripts/test-qa-gate.ts` |
| `B-RECHT` | Impressum und Datenschutz sind verlinkt (kein #, kein leerer href). | Browser | Links aus Sektions-Config reparieren; sonst failed + manual_task. | `lib/qa-gate/browser-checks.ts` | `scripts/test-qa-gate.ts` |
| `B-NOINDEX` | Demo trägt noindex; Live-Site trägt KEIN noindex. | Browser | Re-Render mit korrekter noindex-Option. | `lib/qa-gate/browser-checks.ts` | `scripts/test-qa-gate.ts` |
| `R-SITEMAP` | Live-Sites: canonical gesetzt; Sitemap-Route liefert die Site aus. | Render | Kein Autofix — Hosting-Bug → failed + manual_task. | `lib/qa-gate/render-checks.ts` | `scripts/test-qa-gate.ts` |

## Video/Growth

| ID | Regel | Layer | Autofix | Implementiert in | Test |
|----|-------|-------|---------|------------------|------|
| `C-VIDEO-SIZE` | Hero-Video ≤ 3 MB (transcodiert), sonst kein Video. | Config | Fallback auf statisches Hero-Bild desselben Slots + Video-Task in Admin-Queue. | `lib/qa-gate/render-checks.ts` | `scripts/test-qa-gate.ts` |
| `B-VIDEO-ATTR` | Video hat muted, loop/scrub, playsinline und poster (kein Autoplay-Block, kein CLS). | Browser | Fallback auf statisches Hero-Bild + Video-Task in Admin-Queue. | `lib/qa-gate/browser-checks.ts` | `scripts/test-qa-gate.ts` |
| `B-VIDEO-LAZY` | Poster ist LCP-Kandidat, Video lädt lazy (preload=metadata/none). | Browser | Fallback auf statisches Hero-Bild + Video-Task in Admin-Queue. | `lib/qa-gate/browser-checks.ts` | `scripts/test-qa-gate.ts` |
| `C-VIDEO-FALLBACK` | Jedes Video hat ein statisches Fallback-Bild (poster/Hero-Bild) im Config. | Config | Poster aus Hero-Bild setzen; ohne Bild → Video entfernen. | `lib/qa-gate/render-checks.ts` | `scripts/test-qa-gate.ts` |

## Produktstufen

| ID | Regel | Layer | Autofix | Implementiert in | Test |
|----|-------|-------|---------|------------------|------|
| `C-PLAN-GATE` | Editor-Ops werden SERVERSEITIG gegen die Plan-Matrix geprüft — gesperrte Features liefern die Upsell-Antwort statt Änderung. | Config | Kein Autofix — Gate weist die Op ab, Antwort enthält Nutzen + Paket + Preis. | `lib/editor-ops.ts` | `scripts/test-baustein-c.ts` |
| `C-STARTER-PRESETS` | Starter darf nur die 2–3 kuratierten Theme-Presets wählen (Frozen Composition). | Config | Kein Autofix — Abweisung mit Liste der erlaubten Presets. | `config/plans.ts` | `scripts/test-baustein-c.ts` |
| `C-COPY-PERSONAL` | Copy-Slots werden in JEDER Stufe pro Kunde personalisiert — identische Texte wären Duplicate Content (SEO-Schaden für alle). | Config | Kein Autofix — Personalisierung ist Teil der Generierungs-Pipeline (Firmenname/Stadt im Copy-Prompt). | `config/plans.ts` | `scripts/test-baustein-c.ts` |
| `C-STARTER-FROZEN` | Starter nutzt pro Branche EINE fixe Komposition (library_pages.frozen) — Struktur/Reihenfolge/Preset unveränderlich. | Config | Kein Autofix — Struktur-Ops sind für Starter serverseitig gesperrt (C-PLAN-GATE). | `supabase/migrations/031_frozen_composition.sql` | `scripts/test-baustein-c.ts` |
| `C-VIDEO-APPROVED` | Nur freigegebene Videos (quality_status=approved) sind einer Site zuweisbar; Zuweisung nur im Growth-Paket, immer mit Poster-Fallback. | Config | Kein Autofix — Zuweisung wird mit 409/403 abgewiesen. | `app/api/admin/sites/[siteId]/video/route.ts` | `scripts/test-baustein-c.ts` |
| `C-PAKET-REZEPT` | Paket-Ableitungen (Render-Level, Video-Erlaubnis, Seiten-Modus) kommen NUR aus config/plans.ts — keine Inline-Paket-Checks in Demo-Routen; Demo rendert die Stufe ihres Pakets. | Config | Kein Autofix — Inline-Check durch den passenden Helper (seitenModusFuerTier/videoErlaubtFuerTier/flagshipLevelFuerTier) ersetzen. | `config/plans.ts` | `scripts/test-baustein-c.ts` |

## Ablauf (Baustein A)

1. **Config-Layer** greift während der Generierung (Copy-Gates, Konsistenz-Validator) — Fehler hier verhindern, dass eine Site überhaupt entsteht.
2. **Render-Layer** prüft das fertige HTML ohne Browser (`lib/qa-gate/render-checks.ts`).
3. **Browser-Layer** lädt die Seite in Playwright (mobil 390×844 + Desktop 1440×900), inkl. Screenshots (`lib/qa-gate/browser-checks.ts`).
4. **Chirurgische Reparatur** (`lib/qa-gate/reparatur.ts`): max. 2 Runden, nie globale Regeneration — nur der betroffene Slot/Text wird ersetzt.
5. Unreparierbar ⇒ `failed` mit menschenlesbarem Report (+ `manual_tasks` bei strukturellen Fehlern). Demos werden dann NICHT `demo_bereit`; Live-Sites bleiben live, Admin wird alarmiert.
