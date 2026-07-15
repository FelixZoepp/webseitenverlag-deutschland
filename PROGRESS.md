# PROGRESS — Mission v2 (Zero-Fulfillment-Website-Maschine)

Branch: `refactor/mission-v2` · Basis-Commit: `55a67fa` (wip: stand vor mission-v2)

## Phasen-Status

| Phase | Inhalt | Status |
|-------|--------|--------|
| 0 | Git-Sicherheitsnetz, PROGRESS.md, WARTELISTE.md | ✅ erledigt (2026-07-15) |
| A | Inventur & Audit → AUDIT.md (KEEP/REFACTOR/KILL) | ✅ erledigt (2026-07-15) |
| B | Aufräumen (/_legacy/), Landing als `(marketing)`, Lead-Form → leads-Tabelle, Host-Routing-Middleware | ✅ erledigt (2026-07-15) |
| C | Template-Library + Seeding (4 Branchen × 2 Stile) | ✅ erledigt (2026-07-15) |
| D | Generierungs-Pipeline v2 (Firecrawl → Places → manueller Fallback) | ✅ erledigt (2026-07-15) |
| E | Checkout, Verträge (24/24/3), Provisioning, Dunning, Kündigung | ✅ erledigt (2026-07-15) |
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

- **Phase B komplett** (Commits `17322b9`, `e73f09b`, `26480cb`):
  - B1: DocuSign/SEPA/IBAN-Closing-Pfad → `_legacy/` (siehe `_legacy/README.md`); tote Flags entfernt; Admin-CTAs → Demo-Maschine. Audit-Korrektur: `lib/payment.ts` bleibt (aktives rechnungs_posten-Ledger, Ablösung in Phase E)
  - B2: Migration `015_leads.sql` (leads mit UTM-Attribution, RLS admin-only)
  - B3: Landing aus Webseiten-wvd als `(marketing)`-Route-Group; CSS auf `.marketing-root` gescoped; Fonts self-hosted (next/font); `/api/public/lead` mit Honeypot+Rate-Limit+Resend; CTA-Formular war Attrappe → verdrahtet; Preise 89→99€ angeglichen; Nav mit /login
  - B4: Host-Routing-Middleware (env-gesteuert, ohne Env-Vars no-op)
  - B5: Smoke-Tests grün (/, /entwurf, /blog, /login = 200; Lead-Validierung; Honeypot; 0 Font-CDN-Refs), Build+Lint+Typecheck grün

- **Phase C komplett** (Commit `93aaafb`):
  - C2: Migration `016_template_library.sql` — section_library, library_pages, stock_assets (RLS admin-only, Rendering läuft serverseitig)
  - C3: Seeding via `scripts/seed-library.ts` (idempotent, upsert on key): 40 Sektions-Bausteine (10-Sektionen-Skeleton §2 × Handwerk/Gastronomie/Friseur/Gesundheit) + 8 Startseiten-Kompositionen (Stil `klar` = Defaults, `warm` = Tonalitäts-Overrides auf Hero/CTA) + 15 Stock-Assets (Unsplash-Platzhalter aus Bestand)
  - Floskel-Blacklist `lib/floskel-blacklist.ts` (§2 Quality-Gate) — geprüft beim Seeding (`--check`), ab Phase D auch in der Pipeline
  - C4/K8-Korrektur: `renderTemplate` ≠ Drop-in für `renderPremiumTemplate` (inkompatible Datenformen, Legacy-Configs in config_versions) → Ablösung verschoben auf Phase F/G, dokumentiert in AUDIT.md
  - C5: `npx tsx scripts/seed-library.ts --check` grün (Skeleton vollständig, Referenzen auflösbar, Floskel-frei); Build+Lint+Typecheck grün

- **Phase D komplett** (Commit `3213b72`):
  - D2: `lib/pipeline/prospect-data.ts` — Datenkette Firecrawl (`FIRECRAWL_API_KEY`) → eigener Scraper → Google Places (`GOOGLE_PLACES_API_KEY`: Adresse, Telefon, Öffnungszeiten, echte Bewertungen ≥4★) → manuelle Admin-Eingaben. Alles env-gesteuert, ohne Keys wie v1
  - D3: `lib/pipeline/generate-library-content.ts` — Claude (`claude-sonnet-4-6`) füllt content_schema-Felder; Floskel-Gate mit 1 Retry, danach Fallback auf token-ersetzte Defaults (Demo entsteht IMMER, auch ohne ANTHROPIC_API_KEY); echte Google-Bewertungen ersetzen generierte Stimmen. `lib/library/load.ts` = DB-first-Loader mit Seed-Fallback (läuft vor Migration 016)
  - D4: `lib/library/render.ts` — Zero-JS-Renderer (§2): System-Fonts, ein Inline-`<style>`, `<details>`-FAQ, durchgängiges Escaping, Design-Tokens je Stil (klar/warm) + Branchen-Akzentfarben, ~10 KB HTML
  - D5: Migration `017_demos_engine.sql` (additiv, `demos.engine` default 'premium'); POST/PATCH `/api/admin/demos` mit Library-Engine (Branche+Stil → pageKey, template_id = pageKey); `/demo/[token]` rendert nach `config.engine` (migrationsunabhängig); Admin-UI: Library-Optionen (4×2) + Ort-Feld
  - D6: Offline-Smoke-Test grün (8 Kompositionen, Escaping inkl. `<script>`-Injection in Bewertungen, keine Tokens/CDNs/Floskeln, alle 10 Sektionen); Build+Lint+Typecheck grün

- **Phase E komplett** (Commit `7b1d67c`):
  - E2: Migration `018_contracts.sql` — `contracts` (Konditionen 24/24/3 pro Zeile konfigurierbar, Mahnwesen-Felder, Stripe-Verknüpfung) + `manual_tasks` (Zero-Fulfillment-Ausnahmen, Status OFFEN/ERLEDIGT/VERWORFEN) + `sites.gesperrt`; RLS admin-only
  - E3: `lib/contracts.ts` — monatsende-sichere UTC-Datumslogik (`addiereMonate`, `wirksamesKuendigungsdatum` mit Mehrfach-Verlängerung + Endlosschleifen-Schutz), `createManualTask` (best effort, bricht nie den aufrufenden Flow). Stripe-Webhook zum Multi-Event-Handler umgebaut: `checkout.session.completed` provisioniert wie bisher UND legt Vertrag an (idempotent über stripe_subscription_id; Vertragsfehler → manual_task PROVISIONING_LUECKE + 200, KEIN 500 — Demo ist schon CONVERTED, Retry würde doppelt provisionieren)
  - E4: Dunning-Leiter über `invoice.payment_failed` (Stufe 1 Erinnerung → 2 Mahnung → 3 Site-Sperre + manual_task DUNNING_ESKALIERT), `invoice.paid` setzt Mahnstufe 0 + entsperrt; `customer.subscription.updated` (cancel_at_period_end) → GEKUENDIGT mit 24/24/3-Fristberechnung; `customer.subscription.deleted` → BEENDET + Sperre + Restforderungs-Task. `sendDunningEmail` (3 Stufen) in lib/email.ts. Stripe-API-Hinweis: `invoice.subscription` existiert in SDK 22 nicht mehr → `invoice.parent?.subscription_details?.subscription`
  - E5: `/admin/vertraege` (Verträge + offene manuelle Aufgaben, Erledigen/Verwerfen, Kündigen-Aktion), GET `/api/admin/contracts`, PATCH `/api/admin/manual-tasks/[taskId]`, POST `/api/admin/contracts/[id]/kuendigen` (Fristberechnung + best-effort Stripe `cancel_at`, Fehler → manual_task); Nav-Link unter Abrechnung
  - E6: Offline-Smoke `/tmp/smoke-contracts.ts` — 14 Checks grün (Schaltjahr/Monatsende, Kündigung am Fristtag/1 Tag zu spät/nach Laufzeitende, 12/12/1-Sonderkonditionen, Endlosschleifen-Schutz); Build+Lint+Typecheck grün
  - Bewusst offen gelassen: `lib/payment.ts`-Ledger (rechnungs_posten) läuft parallel weiter — Ablösung erst wenn Upsell-Flow in Phase G auf contracts umgestellt ist (AUDIT R5)

## Notizen für nächste Session
- **Nächste Phase: F** (Portal: Wizard, Chat-Editor nur mit strukturierten Ops, Pläne, Upsell-Leiter, §10)
- Kundenseiten-Sperre: `sites.gesperrt` wird vom Webhook gesetzt, aber noch NICHT beim Ausliefern geprüft — Sperr-Seite/410-Check gehört in Phase F/G (Host-Routing bzw. Site-Renderer)
- Stripe-Webhook-Endpoint braucht jetzt 5 Events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted` (WARTELISTE aktualisiert)
- Library-Demos: DB-Spalte `engine` wird erst nach Migration 017 geschrieben — der öffentliche Renderer hängt NICHT daran (brancht auf `config.engine`), aber neue Library-Demos brauchen Migration 017 (Insert setzt engine='library')
- Migrationen 013–018 noch nicht in Supabase ausgeführt (WARTELISTE); danach: `npx tsx scripts/seed-library.ts`
- Stock-Assets sind Platzhalter (Friseur nutzt universelle Bilder) — echte lizenzierte Assets auf WARTELISTE
- Firecrawl/Places-Keys optional (WARTELISTE) — Kette degradiert sanft auf eigenen Scraper + manuelle Daten
