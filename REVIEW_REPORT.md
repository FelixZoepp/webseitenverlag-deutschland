# REVIEW_REPORT — Master-Review (System-TÜV)

Start: 2026-07-23 · Branch: `chore/master-review` · Prompt: `MASTER_REVIEW_PROMPT.md`

## Ampel-Übersicht

| Kapitel | Status | Ampel |
|---|---|---|
| 0 Selbstkontrolle (Journal + Regeln) | Gerüst steht, Regel-Beweise in Kap. 6 | 🟡 in Arbeit |
| 1 Die 9 Stationen | geprüft — 11 Befunde (0×P0, 4×P1, Rest P2/Zielbild) | 🟡 |
| 2 E2E-Generalprobe | Suite gebaut (15 Stationen), grüner Lauf blockiert durch fehlende Env-Keys (B-12) | 🟡 |
| 3 Demo-Qualität (Budget-Läufe) | Drehbücher ✓ (3.4-Text), Text-Läufe möglich (Anthropic-Key da), Video/Assets blockiert (B-14) | 🟡 |
| 4 SEO-Automatik | geprüft — B-15 P0 (Cron-Auth-Bypass) im Code gefixt + Verhinderungs-Regel; 4 weitere Befunde (B-16..B-19); D-Ops CRON_SECRET offen | 🟡 |
| 5 Sicherheits-Review | nicht begonnen | ⚪ |

Ampel-Legende: 🟢 OK (bewiesen) · 🟡 Risiko/in Arbeit · 🔴 P0 offen · ⚪ ausstehend

## Befunde

Schweregrade: **P0** = bricht Verkauf/Sicherheit, sofort fixen (+ Test + Journal) ·
**P1** = vor erstem zahlenden Kunden · **P2** = Backlog.

### Kapitel 1 — Die 9 Stationen (geprüft 2026-07-23)

**Methodik:** 4 Explore-Agents kartierten die Stationen; alle kritischen Claims
danach selbst im Code verifiziert (Datei:Zeile). Beweis-Suites lokal grün gelaufen,
Screenshots mobile+desktop in `docs/review/`.

**Ampel je Station:**

| # | Station | Ampel | Kern-Beleg |
|---|---|---|---|
| 1 | Landing | 🟡 | Hero-Split+Bento+CTA ✓, Lighthouse-CI konfiguriert; B-03 totes Video-Element |
| 2 | Demo-Wizard | 🟡 | /entwurf = Einzelformular, KEIN 7-Schritte-Wizard (B-05, Zielbild-Lücke) |
| 3 | Lead im Admin | 🟡 | crm_stage-Kette+Notizen ✓; kein Lead-Score (B-06), status/crm_stage doppelt (B-10) |
| 4 | Ein-Klick-Demo | 🟡 | QA-Gates grün (68 Prüfungen), Golden-Set 10+8 grün; Kosten-Logging-Lücken (B-09) |
| 5 | Demo senden | 🟡 | noindex 3-fach ✓, share_token ✓, ?level ✓; Flagship ohne Demo-Badge (B-01), expires_at nie gesetzt (B-07) |
| 6 | Kauf & Zugang | 🟡 | Webhook idempotent+5 Events, Magic-Link, Verträge 24/12/3 — Code getestet (phase5 grün); Stripe-Keys/Webhook nicht in Vercel (D-Ops) |
| 7 | Portal + Chatbot | 🟢 | PatchSchema-Ops, Rollback, gesperrte Pfade; smoke-editor-ops 13/13 grün |
| 8 | Upsells | 🟡 | 7 Produkte, eigener Vertrag, Editor-Gate ✓; Touchpoint-Crons+Fulfillment = Stubs |
| 9 | Betrieb | 🟡 | Dunning 0/3/7/14 bewiesen (phase5), 6 Crons, Kill-Switch; qa-scan ohne echten Browser, kein Auto-Kill bei Kosten, Backups undokumentiert (B-11) |

**Befunde:**

- **B-01 · P1 · Flagship-Demos ohne Demo-Badge.** `app/demo/[token]/route.ts`:
  demoBar wird nur im Library/Premium-Pfad injiziert (Z. 168–169); der
  Flagship-Pfad (Z. 113–144) rendert ohne Badge. Zielbild St. 5 verlangt
  „Demo-Link (noindex, Badge)". Repro: Maler-Demo-Link öffnen — kein Badge.
- **B-02 · P1 · sitemap.ts / robots.ts / robots.txt fehlen komplett** (verifiziert:
  keine der drei Dateien existiert). Marketing-Site hat keine Sitemap/robots-Steuerung;
  Kap.-4-Anspruch „saubere Sitemap" ist für die eigene Domain unerfüllt.
- **B-03 · P1 · Landing: totes Hero-Video-Element.** `components/landing/WvdClient.tsx:236–242`
  — leerer Poster (`aria-hidden`-div ohne Bild) + Play-Button ohne onClick.
  Sichtbar kaputtes Element auf der Verkaufsseite.
- **B-04 · P1 · Demo-Freigabe auf Vercel unmöglich (QA-Deadlock, ops-seitig).**
  Ohne `BROWSER_QA_WS_ENDPOINT` scheitert Browser-QA sowohl automatisch
  (silent catch, `lib/generierung/lead-demo.ts:301–305`) als auch manuell
  (500, `app/api/admin/sites/[siteId]/qa/route.ts:100–104`) → nie ein
  qa_reports-Eintrag → Freigeben-Gate blockt dauerhaft mit 409
  (`app/api/admin/demos/[demoId]/freigeben/route.ts:54–59`). Kein Code-Bug
  (Hard-Gate arbeitet wie designed, Fehlermeldung verweist auf WARTELISTE);
  Fix = D-Ops: Browserless-Endpoint in Vercel setzen.
- **B-05 · Zielbild-Lücke · Kein 7-Schritte-Wizard.** `/entwurf` ist ein
  Einzelformular (grep „schritt/step" = 0 Treffer); business_profiles wird nur
  über Admin-POST befüllt (`app/api/admin/leads/route.ts:149–168`). Verweis:
  WIZARD-Prompt.
- **B-06 · Zielbild-Lücke · Kein Lead-Score** (grep lead_score = 0 Treffer in
  Leads-Routen). Zielbild St. 3. Verweis: MVP_FINISH.
- **B-07 · P2 · expires_at nie gesetzt.** Render-Gate prüft Ablauf
  (`app/demo/[token]/route.ts:65`), aber kein Insert setzt expires_at —
  Demo-Links laufen nie ab.
- **B-08 · P2 · view_count nicht atomar** (read-modify-write, Race bei
  parallelen Aufrufen).
- **B-09 · P2 · Kosten-Logging lückenhaft.** kosten_cent bleibt 0, wenn der
  zweite LLM-Call abbricht; custom generate-assets loggt keine Kosten;
  DEMO_KOSTEN_LIMIT_CENT (150) nur Warnung, kein Abbruch.
- **B-10 · P2 · Doppelsystem status vs. crm_stage** auf leads — zwei
  Statusketten ohne Synchronisationsregel.
- **B-11 · P2 · Betriebslücken.** qa-scan-Cron nutzt In-Process-Checks statt
  echtem Browser (max 20 Sites); kein Auto-Kill bei Kostengrenze; kein manueller
  Dunning-Trigger im Admin; Backup-/Restore-Strategie undokumentiert
  (wird in Kap. 5.8 vertieft).

**Beweis-Suites (alle lokal grün, 2026-07-23):**

| Suite | Ergebnis |
|---|---|
| `npm run test:qa-gate` | 68 Prüfungen, 0 Fehler (Render/Golden-Set-Reparatur/Strukturklassen) |
| `npm run check:quality` | 38 Regeln abgedeckt, Implementierung+Test+Checklist synchron |
| `npm run ci:golden-set` | 10 Firmen (Library) + 8 Profile (Flagship), 0 Verstöße — inkl. Konsistenz-Validator, keine fremden Städte, keine erfundenen Bewertungen (deckt J-001 teilweise) |
| `npm run test:phase5` | alle grün (Magic-Link, Dunning 0/3/7→14, SEO-Abo/Cron/Freigabe) |
| `npx tsx scripts/smoke-editor-ops.ts` | 13/13 (Zod-Ops, Pfad-Gates, Reorder-Regeln) |

### Kapitel 2 — E2E-Generalprobe (Suite gebaut 2026-07-23)

**Artefakt:** `e2e/generalprobe.spec.ts` (Commit b3824ab) — ein durchgehender
Playwright-Lauf mit 15 Stationen, jeder Pfeil = Assertion + Screenshot
(`test-results/generalprobe/`):

1. Ad-Klick (UTM-Landing) → 2. /entwurf-Formular → Lead → 3. Admin-Lead mit
Business-Profil (GaLaBau, Leipzig, 3 Leistungen) → 4. Demo generieren
(Flagship mit LLM, sonst Library-Fallback) → 5. QA-Gate + Freigeben →
6. Demo-Link mobil (iPhone 13, noindex-Assert) → 7. Testmode-Kauf via
Stripe-Webhook-Simulation (`generateTestHeaderString`) → Kunde + Site +
Vertrag 24/12 + Auth-User → 8. Kunden-Login → 9. Wizard-PATCHes →
10. Chat-Edit (LLM-gated) → 11. Publish → Site live über Host-Routing →
12. Cron qa-scan → 13. SEO-Upsell-Kauf + Unterseiten-Freigabe (LLM-gated) →
14. Zahlung fehlschlagen → Mahnkette 0/3/7 per Zeitreise (Rückdatierung
`zahlung_ueberfaelig_seit` + Cron) → Tag 14 Suspend → 503-Wartungsseite →
15. invoice.paid → entsperrt → Site wieder 200. Cleanup FK-korrekt in afterAll.

**Verifiziert:** `npx tsc --noEmit` grün; ohne Env-Keys skippt die Suite
sauber (1 skipped, keine Fehler). Sicherheits-Guard: bricht hart ab, wenn
`STRIPE_SECRET_KEY` kein `sk_test_`-Key ist.

**Dokumentierte Zielbild-Abweichungen (im Suite-Kopf):** kein 7-Schritte-Wizard
(B-05, Lead via Admin-API), Magic-Link-Mail wird nicht geklickt (Auth-User-
Existenz = Beweis), Library-Fallback ohne LLM überspringt QA-Gate-Kette.

**Befunde:**

- **B-12 · P1 · Generalprobe kann nicht grün laufen — Env-Keys fehlen bzw.
  sind leere Platzhalter.** *(Korrigiert nach Production-Pull
  `vercel env pull --environment=production`:)* `.env.local` (Development-
  Scope) enthält nur Supabase + Resend. In **Production** existieren
  `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `HIGGSFIELD_API_KEY`,
  `HIGGSFIELD_API_SECRET` zwar als Variablen, sind aber **leere Strings**
  (`""`); `CRON_SECRET` fehlt in allen Umgebungen komplett. Einzig
  `ANTHROPIC_API_KEY` ist real gesetzt (sk-ant-…). → Suite skippt.
  Abschluss-Kriterium Kap. 6 („Generalprobe läuft grün als CI-Suite")
  bleibt D-Ops-blockiert. Fix = D-Ops mit Felix: Stripe-Test-Keys +
  Webhook-Secret + CRON_SECRET befüllen.
- **B-13 · P1 · Kein CI-Workflow existiert.** `.github/workflows/` fehlt
  komplett — weder `test:e2e` noch die Kap.-1-Beweis-Suiten (qa-gate,
  golden-set, phase5) laufen automatisiert. „Bleibt als Dauer-CI-Lauf"
  (Kap.-2-Anspruch) ist unerfüllt; Workflow-Datei anlegen, sobald Secrets
  verfügbar sind.

### Kapitel 3 — Demo-Qualität (Stand 2026-07-23)

**Erledigt (3.4 Text-Teil):** `config/story-drehbuecher.ts` (Commit ace8aea) —
5-Akt-Drehbücher (je Akt Name + genau 1 Satz) für alle 16 START_BRANCHEN
plus GaLaBau als Premium-Scroll-Referenz („Hang-Verwandlung"). HWG-Branchen
(Zahnarzt, Physio) bewusst als Praxis-Erlebnis-Story statt Behandlungs-
Verwandlung. Typecheck grün.

**Blockiert (3.1–3.3, 3.4-Generierung, 3.5 Kosten-Report):**

- **B-14 · P1 · Asset-Keys leer — Video-Kette blockiert; Text-Läufe möglich.**
  *(Korrigiert nach Production-Pull:)* `ANTHROPIC_API_KEY` ist in Vercel
  Production **real gesetzt** und lokal via `.env.review-prod.local`
  verfügbar ⇒ LLM-basierte Text-/Kompositions-Läufe (GaLaBau-Testläufe,
  Determinismus-Check, Growth-Unterseiten) sind lokal startbar.
  `HIGGSFIELD_API_KEY`/`HIGGSFIELD_API_SECRET` existieren als Variablen,
  sind aber **leere Strings**; `FAL_API_KEY` fehlt
  (lib/assets/higgsfield.ts:354–355 baut die Provider-Kette nur bei
  gesetzten Keys). Damit bleiben Video-Kette und Asset-Generierung
  D-Ops-blockiert. Fix = D-Ops mit Felix (gleiche Sitzung wie B-04/B-12).
- **Nebenbefund:** `galabau` existiert nicht in `branchen_profile`
  (17 Einträge, GaLaBau fehlt; die 16 START_BRANCHEN + `reiterhof`).
  Für die GaLaBau-Läufe muss die Branche vorab geseedet oder der
  Flagship-Pfad ohne Branchen-Profil genutzt werden — beim Budget-Lauf klären.

### Kapitel 4 — SEO-Automatik (Stand 2026-07-23)

**Geprüft:** alle 6 Cron-Routen (`app/api/cron/*/route.ts`), `vercel.json`
(6 Cron-Einträge), Flagship-/Library-Renderer (JSON-LD, OG, Meta),
SEO-Landingpage-Pipeline (`lib/seo-plan.ts`), noindex-Logik, Admin-UI.

**Befunde:**

- **B-15 · P0 (Code gefixt, D-Ops offen) · „Bearer undefined"-Bypass auf
  allen 6 Cron-Routen + Crons de facto tot.** Jede Route verglich
  `authHeader !== \`Bearer ${process.env.CRON_SECRET}\``. Da `CRON_SECRET`
  nirgends gesetzt ist (B-12): (a) literaler Header `Bearer undefined`
  autorisierte jeden Angreifer — u. a. Dunning-Cron (fremde Sites sperrbar)
  und seo-plan (LLM-Kosten-Missbrauch mit dem **echten** Production-
  Anthropic-Key); (b) legitime Vercel-Cron-Aufrufe liefen ins 401, weil
  Vercel den Auth-Header nur bei gesetztem Secret sendet ⇒ Briefings,
  SEO-Plan, Dunning, QA-Scan, Kosten-Summary, Ads-Check laufen in
  Production **gar nicht**. **Fix (sofort, TDD):** `lib/cron-auth.ts`
  (`istCronAutorisiert`, fail-closed), alle 6 Routen umgestellt;
  Verhinderungs-Regel `npm run test:cron-auth` (Unit-Tests + Quelltext-Scan
  aller Cron-Routen, vor Fix 12 rote Checks) — Journal **J-006**.
  test:phase5-Assertions angepasst, beide Suiten grün, tsc grün.
  **D-Ops offen:** `CRON_SECRET` in Vercel setzen, sonst bleiben die Crons
  (jetzt sicher) tot.
- **B-16 · P1 · `og:image` fehlt in Flagship- und Library-Renderer.**
  `lib/flagship/render.ts` und `lib/library/render.ts` setzen kein
  `og:image`/`og:title`-Set — geteilte Demo-/Kunden-Links haben keine
  Social-Preview. (Nur der Alt-Pfad `multipage-renderer` hat OG-Tags.)
- **B-17 · P1 · Library-Renderer ohne LocalBusiness-JSON-LD.**
  `lib/flagship/render.ts:34–48` injiziert LocalBusiness/Restaurant-JSON-LD;
  `lib/library/render.ts:316–327` rendert nur title+description. Betrifft
  alle Library-Demos **und die SEO-Unterseiten des Abos** — ausgerechnet
  das SEO-Produkt liefert Seiten ohne strukturierte Daten.
- **B-18 · P1 · Keine sitemap.xml/robots.txt pro Kundenseite.**
  `fertigstellen/route.ts:14`: „Sitemap-Einreichung + Domain-Connect folgen
  in Phase G" — nicht gebaut. QA-Gate R-SITEMAP
  (lib/qa-gate/render-checks.ts:153–165) prüft bei publish nur canonical.
  Live-Kundenseiten sind für Google nur über Crawling ohne Sitemap
  auffindbar.
- **B-19 · P2 · SEO-Unterseiten durchlaufen nicht die Demo-QA-Gates.**
  `lib/seo-plan.ts:172` nutzt nur `technischerSeoCheck` (Z. 69–89:
  Wortzahl, H1, Title-Länge) — kein Browser-QA, kein Konsistenz-Validator,
  keine Render-Checks wie bei Demos. Monatlich automatisch generierte
  Kundenseiten haben damit schwächere Qualitätssicherung als die Demo.
- **Positiv:** noindex-Logik korrekt (X-Robots-Tag + meta-Injection für
  Demos; live-Seiten indexierbar); Keyword-Wahl `${branche} ${ort}` +
  Modifier mit Slug-Dedupe; seo-plan idempotent pro Site+Monat
  (UNIQUE + Vorab-Check); Freigabe-Workflow (WARTET_AUF_FREIGABE → Mail →
  1-Klick) vorhanden. Kein manueller Cron-Trigger im Admin (deckt sich
  mit B-11).

## Beweise (Screenshots/Logs)

Ablage: `docs/review/` (Screenshots mobile+desktop, Log-Auszüge). Verlinkung je Befund.

Kapitel 1 (2026-07-23, alle HTTP 200):
- `landing-mobile.png` / `landing-desktop.png` — Landing komplett, CTA sichtbar
- `entwurf-mobile.png` / `entwurf-desktop.png` — Formular erreichbar
- `demo-maler-mobile.png` / `demo-maler-desktop.png` — Maler-Flagship-Demo, alle
  Sektionen mit Assets (Hinweis: fullPage-Screenshot ohne Scroll zeigt
  Scroll-Reveal-Sektionen leer — Artefakt, kein Bug; Shots entstanden nach
  progressivem Scroll)

## Kosten-Report Kap. 3

_(folgt mit den Budget-Läufen)_
