# WARTELISTE — Dinge, die Felix erledigen/entscheiden muss

Blockiert nicht die Entwicklung, aber nötig für Go-Live.

## Sofort (für aktuellen Stand)
- [x] **Migrationen 013–020 in Supabase ausführen** (erledigt 2026-07-15 via Supabase MCP) (`013_demos.sql`, `014_stripe.sql`, `015_leads.sql`, `016_template_library.sql`, `017_demos_engine.sql`, `018_contracts.sql`, `019_portal.sql`, `020_phase_g.sql` — 017 nötig für Library-Demos, 018 für Verträge/Dunning, 019 für Wizard + Upsell-Käufe, 020 für Domains/SEO-Plan/GBP/Ads)
- [x] **Library seeden** (erledigt 2026-07-15: 40 Sektionen, 8 Kompositionen, 15 Assets)
- [ ] **Vercel Env-Vars setzen**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `LEAD_NOTIFY_EMAIL` (fehlen noch; `SUPABASE_SERVICE_ROLE_KEY` ist bereits gesetzt)
- [ ] **Stripe-Webhook-Endpoint anlegen**: Dashboard → Webhooks → `https://<domain>/api/webhooks/stripe`, Events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted` (alle 5 nötig für Verträge + Dunning, Phase E)
- [ ] **Resend-Domain verifizieren** (für Zugangs-/Lead-Mails von eigener Domain)
- [x] **Migration 021 ausführen** (erledigt 2026-07-15 via Supabase MCP)
- [ ] **Slack-Webhooks anlegen** (optional, sonst Log-Stub): `SLACK_WEBHOOK_ERRORS` (#errors, Job-Fails) + `SLACK_WEBHOOK_MONEY` (#money, tägliche Kosten-Summary 6:30 Uhr)
- [ ] **Sentry entscheiden**: bewusst NICHT eingebunden solange kein DSN existiert — Slack #errors + Vercel-Logs decken den Start ab. Wenn gewünscht: Sentry-Projekt anlegen, DSN liefern, dann bauen wir es ein
- [ ] **Git-Remote anlegen + pushen**: Das Repo hat aktuell KEIN Remote. Der CI-Workflow (`.github/workflows/ci.yml` — Lint, Typecheck, Golden-Set, Lighthouse-Budgets) greift erst nach dem ersten Push zu GitHub. Bis dahin lokal: `npm run ci:golden-set` + `npm run ci:lighthouse`
- [ ] **E2E-Lauf freischalten** (Playwright, `e2e/journey.spec.ts`): braucht (a) Stripe-**Test**-Keys in `.env.local` (`STRIPE_SECRET_KEY=sk_test_...` + `STRIPE_WEBHOOK_SECRET` — fehlen aktuell komplett), (b) eine Supabase-Instanz mit Migrationen 001–021 + Library-Seeds. Achtung: Der Test legt echte Zeilen an (leads/demos/customers/sites/contracts/auth-User) und räumt sie am Ende auf — am besten gegen ein separates Test-Projekt laufen lassen, nicht gegen die Produktions-DB. Start: `E2E_ENABLED=1 npm run test:e2e` (einmalig vorher `npx playwright install chromium`). Live-Keys verweigert der Test hart

## Branchen-Fabrik (F1 — Asset-Motor)
- [ ] **Higgsfield-Account + API-Key** (`HIGGSFIELD_API_KEY` + `HIGGSFIELD_API_SECRET`): https://platform.higgsfield.ai — bis dahin läuft der Mock-Provider (0 Cent, Platzhalterbilder, aber komplette Pipeline inkl. Storage + asset_bank). **Achtung:** Die REST-Endpoints in `lib/assets/higgsfield.ts` sind noch unverifiziert (per ENV `HIGGSFIELD_PATH_TEXT2IMG`/`HIGGSFIELD_PATH_EDIT`/`HIGGSFIELD_API_BASE` korrigierbar) — beim ersten echten Key einen Testlauf `npm run asset:paar` machen und ggf. Pfade anpassen
- [ ] **fal.ai-Key als Fallback** (`FAL_API_KEY`): https://fal.ai/dashboard/keys — gleiche Schnittstelle, springt automatisch ein, wenn Higgsfield fehlt/failt
- [ ] **Kosten je Call verifizieren**: `HIGGSFIELD_KOSTEN_CENT` (Default 6) / `FAL_KOSTEN_CENT` (Default 4) sind Schätzwerte — nach den ersten echten Läufen mit dem Provider-Dashboard abgleichen
- [ ] **Tages-Budget bestätigen**: `ASSET_BUDGET_TAG_CENT` Default 500 (= 5 €/Tag); Pipeline stoppt hart, wenn erreicht

## Entscheidungen
- [ ] **`LEAD_NOTIFY_EMAIL` festlegen**: Lead-Benachrichtigungen gehen jetzt in die leads-Tabelle + Mail an diese Adresse (das hartcodierte `hendrik@hoffmann-wd.de` aus dem Alt-Repo ist raus). Ohne Env-Var: Fallback FROM_EMAIL
- [ ] **Produktdomain festlegen** (für Host-Routing: PRODUKTDOMAIN.de = Marketing, app. = Portal, *. = Kundenseiten)
- [ ] **Stripe Live-Keys**: Wechsel von Test auf Live erst nach deiner Freigabe (Stop-Condition laut Masterprompt)
- [ ] **Upsell-Preise & Laufzeiten bestätigen** (`config/upsells.ts`): aktuelle Platzhalter — SEO-Abo 49 €/M, Stadtteil-Seiten 299 € einmalig, Bewertungs-System 149 € + 19 €/M, Konkurrenz-Radar 29 €/M, Saison-Kampagnen 39 €/M, GBP-Einrichtung 199 €, Google Ads Starter 99 €/M (Betreuung; Werbebudget zahlt der Kunde immer direkt an Google). Laufzeiten aktuell 1/1/1 (monatlich kündbar) — bewusst kundenfreundlich, kannst du auf z. B. 12/12/1 ändern
- [ ] **KICKOFF_MODE entscheiden** (`auto` oder `call`, Env-Var): steuert, ob der Kickoff-Touchpoint automatisch läuft oder du persönlich anrufst. Ohne Env-Var: `auto`

## Später (vor Kunden-Go-Live)
- [ ] AGB / Vertragswerk vom Anwalt prüfen lassen (24/24/3-Konditionen)
- [ ] Golden-Set: 10 echte Firmen in `test/golden_set.json` eintragen (5 mit Website, 3 nur Google-Eintrag, 2 ohne alles — aktuell Platzhalter mit `"platzhalter": true`; Check läuft mit `npm run ci:golden-set`)
- [ ] Registrar-Zugang (Domains für Kunden), Google Business Profile API, Ads-Konto-Zugang — bis dahin läuft der Mock-Registrar (`REGISTRAR_PROVIDER=mock`, Neuregistrierungen werden simuliert)
- [ ] DataForSEO-Zugang (`DATAFORSEO_LOGIN` + `DATAFORSEO_PASSWORD`) für echte Rank-Reports im SEO-Abo; ohne Keys liefert der technische SEO-Check einen Stub statt Sichtbarkeitsdaten
- [ ] Firecrawl-API-Key (`FIRECRAWL_API_KEY`) — alternativ bleibt eigener Scraper
- [ ] Google-Places-API-Key (`GOOGLE_PLACES_API_KEY`, Places API New) — liefert Adresse, Telefon, Öffnungszeiten + echte Bewertungen für Library-Demos; ohne Key läuft die Pipeline ohne diese Daten
- [ ] **Stock-Assets lizenzieren/hochladen**: aktuelle Seeds sind Unsplash-Platzhalter; Friseur hat noch keine branchenspezifischen Bilder (nutzt universelle Platzhalter)
