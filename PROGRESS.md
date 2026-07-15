# PROGRESS — Mission v2 (Zero-Fulfillment-Website-Maschine)

Branch: `refactor/mission-v2` · Basis-Commit: `55a67fa` (wip: stand vor mission-v2)

## Phasen-Status

| Phase | Inhalt | Status |
|-------|--------|--------|
| 0 | Git-Sicherheitsnetz, PROGRESS.md, WARTELISTE.md | ✅ erledigt (2026-07-15) |
| A | Inventur & Audit → AUDIT.md (KEEP/REFACTOR/KILL) | ✅ erledigt (2026-07-15) |
| B | Aufräumen (/_legacy/), Landing als `(marketing)`, Lead-Form → leads-Tabelle, Host-Routing-Middleware | ⬜ offen |
| C | Template-Library + Seeding (4 Branchen × 2 Stile) | ⬜ offen |
| D | Generierungs-Pipeline v2 (Firecrawl → Places → manueller Fallback) | ⬜ offen |
| E | Checkout, Verträge (24/24/3), Provisioning, Dunning, Kündigung | ⬜ offen |
| F | Portal: Wizard, Chat-Editor (nur strukturierte Ops), Pläne, Upsell-Leiter | ⬜ offen |
| G | Domains & Upsell-Fulfillment | ⬜ offen |
| H | CI-Gates: Golden-Set, Lighthouse-CI, Playwright E2E, /admin/kennzahlen | ⬜ offen |

## Sitzungs-Log

### 2026-07-15 — Session 1
- §0.1: WIP-Commit `55a67fa` auf main, Branch `refactor/mission-v2` erstellt
- §0.2: PROGRESS.md + WARTELISTE.md angelegt
- Vorarbeit (vor Masterprompt, bereits im WIP-Commit enthalten):
  - Demo-System komplett (Migration 013, scrape-prospect, generate-demo, /admin/demos, /demo/[token])
  - Stripe-Closing-Flow komplett (Migration 014, lib/stripe, payment-link-Route, Webhook mit Auto-Provisioning, /willkommen)
  - Landing-Repo `FelixZoepp/Webseiten-wvd` nach `/tmp/webseiten-wvd` geklont + Kompatibilitätsanalyse (Next 16→14, TW4→TW3, src/-Pfade) — Integration folgt in Phase B
- Phase A: Voll-Inventur (53+ Routen, 32 lib-Dateien, 15 Migrationen, Env-Vars, Cron) → AUDIT.md mit KEEP / 12× REFACTOR (R1–R12) / 8× KILL (K1–K8). Typecheck + Lint grün.
- Wichtigste Audit-Erkenntnisse: `lib/payment.ts` = No-Op-Stub (einziger Importer: upsell-orchestrator → R5), `lib/defaults.ts` tot, DocuSign/SEPA/Qonto/EasyBill → _legacy in Phase B, Cloudflare-Tokens im Klartext (R3), `template-renderer.ts` hat noch 4 Importer (K8 erst Phase C)

## Notizen für nächste Session
- Landing-Klon liegt in `/tmp/webseiten-wvd` (flüchtig! Bei Bedarf neu klonen: FelixZoepp/Webseiten-wvd)
- Landing-Analyse: keine Blocker; api/entwurf sendet an hartcodiertes `hendrik@hoffmann-wd.de` → muss durch leads-Tabelle ersetzt werden (Phase B)
