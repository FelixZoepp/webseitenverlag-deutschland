# REVIEW_REPORT — Master-Review (System-TÜV)

Start: 2026-07-23 · Branch: `chore/master-review` · Prompt: `MASTER_REVIEW_PROMPT.md`

## Ampel-Übersicht

| Kapitel | Status | Ampel |
|---|---|---|
| 0 Selbstkontrolle (Journal + Regeln) | Gerüst steht, Regel-Beweise in Kap. 6 | 🟡 in Arbeit |
| 1 Die 9 Stationen | geprüft — 11 Befunde (0×P0, 4×P1, Rest P2/Zielbild) | 🟡 |
| 2 E2E-Generalprobe | nicht begonnen | ⚪ |
| 3 Demo-Qualität (Budget-Läufe) | nicht begonnen | ⚪ |
| 4 SEO-Automatik | nicht begonnen | ⚪ |
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
