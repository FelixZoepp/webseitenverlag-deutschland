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
| F | Portal: Wizard, Chat-Editor (nur strukturierte Ops), Pläne, Upsell-Leiter | ✅ erledigt (2026-07-15) |
| G | Domains & Upsell-Fulfillment | ✅ erledigt (2026-07-15) |
| H | CI-Gates: Golden-Set, Lighthouse-CI, Playwright E2E, /admin/kennzahlen | ✅ erledigt (2026-07-15) |

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

- **Phase F komplett**:
  - F2: Migration `019_portal.sql` — `upsell_orders` (Status OFFEN→BEZAHLT→PROVISIONIERT, Stripe-Verknüpfung, contract_id) + `sites.noindex/fertiggestellt_am/wizard_status/pflichtangaben`; RLS: Kunden SELECT eigene, Schreiben nur Admin/Service-Role. Versionierung/Rollback läuft weiter über `config_versions` (001) — kein neues site_versions
  - F3: `config/plans.ts` (Feature-Wahrheit §10.3, Preise bleiben in Stripe; starter/business/growth=Premium) + `config/upsells.ts` (§10.5-Katalog: SEO-Unterseiten-Abo 49€/M, Stadtteil-Seiten 299€ einmalig, Bewertungs-System 149€+19€/M, Konkurrenz-Radar 29€/M, Saison-Kampagnen 39€/M, GBP-Einrichtung 199€ va_manual; je 3 Nutzen-Punkte, eigene Laufzeiten, `NERV_SCHUTZ_TAGE=60`, `KICKOFF_MODE`, verworfene Produkte dokumentiert)
  - F4: Fertigstellungs-Wizard §10.1 — `lib/rechtstexte.ts` (Impressum §5 DDG/§18 MStV + Datenschutzerklärung aus Pflichtangaben-Formular), `lib/wizard.ts` (5 Schritte, nur Pflichtangaben+Fakten sind Pflicht), `lib/qa.ts` (Auto-QA: Platzhalter/Lorem/alt/Meta/Formular/Größe), Routen `/api/sites/[siteId]/wizard` + `/fertigstellen` (QA-Fail → Hinweise, blockiert nie den Rest; Erfolg → `noindex=false` + config_versions-Eintrag), `components/fertigstellungs-wizard.tsx` + Banner im Dashboard. Domain-Schritt = Stub (Cloudflare-Connect in Phase G)
  - F5: Chat-Editor NUR strukturierte Ops §10.2 — `lib/editor-ops.ts`: 6 Op-Typen (update_text, swap_image_from_pool_or_upload, set_theme_preset, add_section_from_library, reorder, toggle) als Zod-DiscriminatedUnion, max 20 Ops, Pfad-Schema blockt `__proto__`; Leitplanken: Telefon/Logo/Rechtstexte gesperrt, Farben NUR über 6 Presets, Hero/Kontakt/CTA weder löschbar noch ausblendbar, Hero bleibt erste Sektion, Bild-Hosts allowlisted, Längenlimits Headline/CTA; applyPatch = All-or-Nothing auf Kopie → `draft_config` (live erst über Veröffentlichen-Klick, Rollback über bestehende config_versions-Route). Claude liefert `<patch_ops>`, Server validiert; Rate-Limit 50 Nachrichten/Tag/Kunde (429)
  - F6: Upsell-/Upgrade-Kauf §10.4 — `lib/upsell-kauf.ts` (gemeinsamer Kaufweg: Order OFFEN → Stripe-Checkout mit `metadata.product_key/order_id`; Doppelbuchungs-Schutz über activated_upsells; Plan-Upgrade als `plan-upgrade:<tier>`, Downgrades abgewiesen), `lib/supabase/admin.ts` (Service-Role-Client), Kaufweg 1: POST `/api/admin/upsell-payment-link` (requireAdmin), Kaufweg 2: POST `/api/sites/[siteId]/upsell-checkout` + Portal-Kacheln `/dashboard/[siteId]/erweiterungen` (aktive Module markiert, Nerv-Schutz sortiert Abgelehnte ans Ende, Preise transparent). Webhook-Branch `handleUpsellCheckout`: BEZAHLT → eigener Vertrag je Buchung (paket=`upsell:<key>`, Konditionen aus config) → auto: activated_upsells-Upsert + PROVISIONIERT; va_manual: manual_task; Plan-Upgrade: customers/sites.package + Hauptvertrag angehoben + manual_task „altes Stripe-Abo beenden" (Proration-Pragmatismus); alle Lücken → manual_task PROVISIONING_LUECKE + 200 (kein Doppel-Provisioning durch Stripe-Retry)
  - F7/DoD: `scripts/smoke-editor-ops.ts` — 19 Checks grün (invalider Patch/rohes HTML abgewiesen, All-or-Nothing, gesperrte Pfade, Bild-Host-Allowlist, Theme nur Presets, Hero-Schutz bei Toggle+Reorder, >20 Ops); Rollback = bestehende `/api/sites/[siteId]/rollback` + config_versions (funktionsfähig); Build+Lint+Typecheck grün. Upgrade-Kauf-E2E im Stripe-Testmode braucht Migration 019 + Webhook (WARTELISTE)

- **Phase G komplett**:
  - G2: Auslieferung — `sites.gesperrt` → Sperr-Seite (410), `noindex` → Meta-Tag im Renderer; Wizard-Rechtstexte (`draft_config.rechtstexte`) werden als Impressum-/Datenschutz-Seiten ausgespielt
  - G3: Domains — Wunsch-Domain-Flow aus Wizard-Schritt 4 mit Mock-Registrar (`REGISTRAR_PROVIDER=mock`, `lib/registrar.ts`), DNS-Recheck, Portal-UI `/dashboard/[siteId]/domain`
  - G4: SEO-Plan-Automation (Upsell #1) — Cron `/api/cron/seo-plan` (monatlich, `0 6 1 * *`): 1 Keyword-Landingpage aus der Library via Slot-Pipeline, 1-Klick-Freigabe im Portal (`/dashboard/[siteId]/seo`, Sidebar-Nav), technischer SEO-Check, DataForSEO-Stub (Keys auf WARTELISTE)
  - G5: GBP-Ersteinrichtung (Upsell #2, va_manual) — Kauf erzeugt `gbp_setups`-Zeile (Migration 020) + verknüpfte manual_task (`createManualTask` gibt jetzt Task-ID zurück); `/admin/worklist` (GBP-Status-Flow OFFEN→IN_ARBEIT→ZUGRIFF_ERTEILT→FERTIG als Pill-Kette + offene Aufgaben); FERTIG provisioniert die Order und erledigt die Task automatisch
  - G6: Google Ads Starter (Upsell #3, 99 €/M Platzhalter → WARTELISTE) — `lib/ads-starter.ts`: deterministischer Kampagnen-Generator (Search + PMax, Test-Modus, Google-Zeichenlimits 30/90); Grundsatz „Werbebudget IMMER direkt Kunde↔Google" im Entwurf verankert; Webhook legt `ads_kampagnen` an + manual_task „MCC-Einladung"; Admin-APIs `/api/admin/ads` (POST = DoD-testbar ohne Stripe) + Status-PATCH; Wochen-Check-Cron `/api/cron/ads-check` (montags: Ziel-URL-Erreichbarkeit, Entwurfs-Vollständigkeit, Leistungsdaten-Stub bis Ads-API-Zugang)
  - G7: Portal-Rest — POST `/api/sites/[siteId]/billing-portal` (Stripe Customer Portal via `customers.stripe_customer_id`) + Button in `/rechnungen`; alte `/upgrade`-Seite → Redirect auf `/erweiterungen`, `components/upgrade-checkout.tsx` (Fake-Katalog) → `_legacy/components/`; Sidebar + Editor-Gate zeigen auf `/erweiterungen`; Admin-Zahlungslink-Panel im Upsells-Tab der Kundendetailseite (nutzt POST `/api/admin/upsell-payment-link`, Copy-Button)
  - G8/DoD: Domain-Neuregistrierung läuft mit Mock-Registrar durch; SEO-Cron erzeugt freigebbare Landingpage; GBP-Flow bis „Zugriff erteilt" über `/admin/worklist` testbar; Ads-Setup erzeugt Kampagnen-Entwurf im Test-Modus (POST `/api/admin/ads`). Build+Lint+Typecheck grün
  - Bewusst offen: kein async Re-Deploy-Queue (serverless ohne Queue-Infra — Re-Deploys laufen synchron im Request); AUDIT R5 (`lib/payment.ts`-Ledger) bleibt, weil der alte Admin-Aktivierungs-Flow (`/api/admin/customers/.../upsells/...` + Upsells-Tab) noch darauf läuft → Ablösung in Phase H

- **Phase H komplett**:
  - H2: Golden-Set §12 — `test/golden_set.json` (10 Firmen-Slots: 5 website / 3 google / 2 nichts, aktuell Platzhalter → WARTELISTE) + `scripts/ci-golden-set.ts` (`npm run ci:golden-set`): komplett offline (API-Keys werden im Prozess gelöscht, Supabase-Stub erzwingt Seed-Fallback), prüft je Firma Floskel-Blacklist, Hero-Block, Stadt im Hero, kein `<script>`/keine Fremd-CDNs — 82 Checks grün
  - H3: Lighthouse-CI §2.1 — `scripts/ci-lighthouse-render.ts` rendert 11 Seiten offline nach `.lighthouse/dist/` (8 Kompositionen 4 Branchen × 2 Stile mit festen Beispiel-Firmen + 3 Golden-Demos je Kategorie) mit hartem Fremd-CDN-Check (throw = Build rot); `lighthouserc.json` (`staticDistDir`, `maxAutodiscoverUrls: 0` — LHCI-Default prüft sonst nur 5 URLs!, Mobile-Emulation = LHCI-Default) mit Assertions Perf ≥0.9, SEO ≥0.95, A11y ≥0.9, Script ≤30 KB; `npm run ci:lighthouse`. Lokaler Lauf: alle 11 Seiten grün (Perf 0.92–0.99, SEO 1.0, A11y 0.91–1.0, 0 KB JS)
  - H4: Playwright-E2E — `e2e/journey.spec.ts` + `playwright.config.ts` (`npm run test:e2e`): kompletter Durchlauf Landing-Form (UTM in leads) → Admin → Library-Demo (Offline-Defaults) → `/demo/[token]` → Stripe-Checkout-Session (echter Testmode-Call) → Webhook-Simulation mit echt signierter Payload (`webhooks.generateTestHeaderString`; Handler macht keine Stripe-Nachfragen → kein CLI-Forwarding nötig) → Kunde+Site+24/24/3-Vertrag+CONVERTED → Kunden-Login (Passwort via Admin-API) → Wizard (Pflichtangaben, Fakten, Domain-Neuregistrierung Mock-Registrar, SEO-Upsell-Kauf inkl. zweiter Webhook-Sim → `upsell:seo-unterseiten-abo`-Vertrag) → Fertigstellen (Auto-QA) → Chat-Edit (nur mit ANTHROPIC_API_KEY, sonst Step-Skip) → Publish → Rollback (config_versions) → Kickoff-Touchpoint (GBP-Angebot in `/erweiterungen`). Env-gated über `E2E_ENABLED=1` + Supabase/Stripe-TEST-Keys (fehlen → sauberer Skip ohne Serverstart); Stop-Condition: Lauf gegen `sk_live_` wird hart verweigert; afterAll räumt Testdaten auf. Echter Lauf braucht Stripe-Testkeys + migrierte (Test-)Supabase → WARTELISTE
  - H5: Monitoring §12 — `lib/monitoring.ts` (Slack #errors/#money via Webhooks, Log-Stub ohne Env) + `lib/nutzung.ts` (Kosten-Events in `nutzungs_events`, Migration 021) + `GENERATION_KILL_SWITCH` (sperrt Demo-Generierung + Crons) + Kosten-Summary-Cron 6:30 (`/api/cron/kosten-summary`, vercel.json)
  - H6: `/admin/kennzahlen` — Funnel je UTM-Quelle (Leads → Demos → Käufe), MRR/ARPU/Upsell-Quote/Churn; MRR-Quelle der Wahrheit = `contracts` (Hauptverträge + `upsell:`-Verträge getrennt), `activated_upsells` zählt nur für Alt-Modul-IDs (sonst Dreifachzählung mit upsell_orders/Webhook-Verträgen); Nav-Link im Admin-Layout
  - H7 (AUDIT R5 erledigt): alter Upsell-Aktivierungs-Flow abgelöst — `lib/upsell-orchestrator.ts`, `lib/payment.ts` (rechnungs_posten-Schreibweg), `lib/upsell-emails.ts`, `/api/admin/customers/[customerId]/upsells/[upsellId]/*` → `_legacy/` (README-Tabelle ergänzt); Katalog-GET-Route neu auf upsell_orders-Kaufstatus; Upsells-Tab der Kundendetailseite = Zahlungslink-Panel + 7-Produkte-Katalog (Kauf-Status, keine manuelle Aktivierung mehr) + Alt-Bestand read-only; rechnungs_posten-Ansichten bleiben lesend für Altdaten
  - H8/DoD: Build + Lint + Typecheck + Golden-Set (82 Checks) + Lighthouse (11×) grün; `.github/workflows/ci.yml` (Lint, tsc, Golden-Set, Lighthouse; greift erst nach Git-Push → WARTELISTE); Playwright-Skip-Verhalten ohne Envs verifiziert

## Notizen für nächste Session
- **Alle Phasen 0–H abgeschlossen.** Offen ist nur noch, was ein Mensch liefern muss → WARTELISTE.md (Migrationen 013–021 ausführen, Library seeden, Stripe-Test-/Webhook-Keys, Git-Remote + erster Push für CI, E2E-Freischaltung, echte Golden-Set-Firmen, Preis-Bestätigungen)
- Gesamt-DoD „kompletter Testmode-Durchlauf ohne manuellen Eingriff": als env-gated E2E implementiert (`E2E_ENABLED=1 npm run test:e2e`); tatsächlicher Grün-Lauf blockiert allein durch fehlende Stripe-Testkeys + nicht migrierte Supabase (WARTELISTE „E2E-Lauf freischalten")
- Plan-Upgrade-Proration: weiterhin pragmatisch (neue Subscription + manual_task) — Verbesserung mit `subscription.update` + Proration möglich, bewusst nicht in H gebaut
- Ads-Preis (99 €/M) und alle Upsell-Preise sind Platzhalter → Bestätigung auf WARTELISTE; echte Ads-Leistungsdaten erst mit Google-Ads-API-Zugang
- Migrationen 013–021 noch nicht in Supabase ausgeführt (WARTELISTE); danach: `npx tsx scripts/seed-library.ts`
- Library-Demos: DB-Spalte `engine` wird erst nach Migration 017 geschrieben — der öffentliche Renderer hängt NICHT daran (brancht auf `config.engine`), aber neue Library-Demos brauchen Migration 017 (Insert setzt engine='library')
- Stock-Assets sind Platzhalter (Friseur nutzt universelle Bilder) — echte lizenzierte Assets auf WARTELISTE
- Firecrawl/Places-Keys optional (WARTELISTE) — Kette degradiert sanft auf eigenen Scraper + manuelle Daten
