# WARTELISTE — Dinge, die Felix erledigen/entscheiden muss

Blockiert nicht die Entwicklung, aber nötig für Go-Live.

## Sofort (für aktuellen Stand)
- [x] **Migrationen 013–020 in Supabase ausführen** (erledigt 2026-07-15 via Supabase MCP) (`013_demos.sql`, `014_stripe.sql`, `015_leads.sql`, `016_template_library.sql`, `017_demos_engine.sql`, `018_contracts.sql`, `019_portal.sql`, `020_phase_g.sql` — 017 nötig für Library-Demos, 018 für Verträge/Dunning, 019 für Wizard + Upsell-Käufe, 020 für Domains/SEO-Plan/GBP/Ads)
- [x] **Library seeden** (erledigt 2026-07-15: 40 Sektionen, 8 Kompositionen, 15 Assets)
- [ ] **Vercel Env-Vars setzen**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `LEAD_NOTIFY_EMAIL` (fehlen noch; `SUPABASE_SERVICE_ROLE_KEY` ist bereits gesetzt)
- [ ] **Stripe-Webhook-Endpoint anlegen**: Dashboard → Webhooks → `https://<domain>/api/webhooks/stripe`, Events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted` (alle 5 nötig für Verträge + Dunning, Phase E)
- [ ] **Resend-Domain verifizieren** (für Zugangs-/Lead-Mails von eigener Domain; ohne `RESEND_API_KEY` laufen Magic-Link-/Mahn-Mails als Log-Stub — Phase 5 DoD ist damit lokal nachweisbar, echte Mails erst nach Verifizierung)
- [ ] **Phase-5-Testmode-Durchlauf ausführen** (DoD §6): braucht Stripe-**Test**-Keys + `STRIPE_WEBHOOK_SECRET` (siehe oben) + `stripe listen --forward-to localhost:3000/api/webhooks/stripe`. Kette: Checkout (card/sepa) → Webhook (idempotent via `processed_webhook_events`, Migration 032 ist bereits auf Prod) → Magic-Link-Mail (Log-Stub) → Login → Site live. Fehlzahlung simulieren: `invoice.payment_failed` triggern → Mahnstufe 1; Dunning-Cron (`/api/cron/dunning`, täglich 8:00, `CRON_SECRET`) eskaliert Tag 3/7 und sperrt ab Tag 14
- [x] **Migration 021 ausführen** (erledigt 2026-07-15 via Supabase MCP)
- [ ] **Slack-Webhooks anlegen** (optional, sonst Log-Stub): `SLACK_WEBHOOK_ERRORS` (#errors, Job-Fails) + `SLACK_WEBHOOK_MONEY` (#money, tägliche Kosten-Summary 6:30 Uhr)
- [ ] **Sentry entscheiden**: bewusst NICHT eingebunden solange kein DSN existiert — Slack #errors + Vercel-Logs decken den Start ab. Wenn gewünscht: Sentry-Projekt anlegen, DSN liefern, dann bauen wir es ein
- [ ] **Git-Remote anlegen + pushen**: Das Repo hat aktuell KEIN Remote. Der CI-Workflow (`.github/workflows/ci.yml` — Lint, Typecheck, Golden-Set, Lighthouse-Budgets) greift erst nach dem ersten Push zu GitHub. Bis dahin lokal: `npm run ci:golden-set` + `npm run ci:lighthouse`
- [ ] **E2E-Lauf freischalten** (Playwright, `e2e/journey.spec.ts`): braucht (a) Stripe-**Test**-Keys in `.env.local` (`STRIPE_SECRET_KEY=sk_test_...` + `STRIPE_WEBHOOK_SECRET` — fehlen aktuell komplett), (b) eine Supabase-Instanz mit Migrationen 001–021 + Library-Seeds. Achtung: Der Test legt echte Zeilen an (leads/demos/customers/sites/contracts/auth-User) und räumt sie am Ende auf — am besten gegen ein separates Test-Projekt laufen lassen, nicht gegen die Produktions-DB. Start: `E2E_ENABLED=1 npm run test:e2e` (einmalig vorher `npx playwright install chromium`). Live-Keys verweigert der Test hart

## QA-Gate (Browser-QA, Baustein A)
- [ ] **`BROWSER_QA_WS_ENDPOINT` setzen (Produktion)**: Auf Vercel gibt es kein lokal installiertes Chromium — der Browser-QA-Lauf (Demo-Gate, Publish-Check, Nacht-Scan `/api/cron/qa-scan`) braucht dort einen Remote-Browser via WebSocket (z. B. Browserless.io: `wss://chrome.browserless.io?token=…`). Lokal läuft alles ohne die Var über das installierte Playwright-Chromium (`npx playwright install chromium`). Ohne Endpoint in Prod: QA-Läufe enden `failed` mit klarer Meldung, Sites bleiben unberührt

## Multi-Tenant-Hosting (MVP-Finish §1)
- [ ] **`VERCEL_TOKEN` + `VERCEL_PROJECT_ID` setzen** (optional `VERCEL_TEAM_ID`): nötig, damit `attachCustomDomain` Custom Domains wirklich am Vercel-Projekt anmeldet (Vercel Dashboard → Settings → Tokens; Projekt-ID unter Project Settings → General). Ohne Token läuft der Stub: domains-Zeile + DNS-Anleitung entstehen trotzdem, nur die Vercel-API-Anmeldung fehlt — dann Domain manuell im Vercel-Dashboard hinzufügen
- [ ] **Wildcard-Domain am Vercel-Projekt einrichten**: `*.<PRODUKTDOMAIN>` als Domain im Vercel-Projekt + Wildcard-DNS (`*` CNAME auf `cname.vercel-dns.com`), damit `{slug}.<PRODUKTDOMAIN>` für alle Kundenseiten auflöst (hängt an „Produktdomain festlegen" unter Entscheidungen)
- [ ] **`NEXT_PUBLIC_MARKETING_HOST` + `NEXT_PUBLIC_APP_HOST` setzen** (Vercel Env): aktiviert das Host-Routing in der Middleware (Marketing/App/Subdomain-Kundenseiten). Ohne die Vars ist das Routing ein No-op — lokal testbar mit `?__host=` (dev-only bzw. `ALLOW_HOST_OVERRIDE=1`)

## Branchen-Fabrik (F1 — Asset-Motor)
- [ ] **Higgsfield-Account + API-Key** (`HIGGSFIELD_API_KEY` + `HIGGSFIELD_API_SECRET`): https://platform.higgsfield.ai — bis dahin läuft der Mock-Provider (0 Cent, Platzhalterbilder, aber komplette Pipeline inkl. Storage + asset_bank). **Achtung:** Die REST-Endpoints in `lib/assets/higgsfield.ts` sind noch unverifiziert (per ENV `HIGGSFIELD_PATH_TEXT2IMG`/`HIGGSFIELD_PATH_EDIT`/`HIGGSFIELD_API_BASE` korrigierbar) — beim ersten echten Key einen Testlauf `npm run asset:paar` machen und ggf. Pfade anpassen
- [ ] **fal.ai-Key als Fallback** (`FAL_API_KEY`): https://fal.ai/dashboard/keys — gleiche Schnittstelle, springt automatisch ein, wenn Higgsfield fehlt/failt
- [ ] **Kosten je Call verifizieren**: `HIGGSFIELD_KOSTEN_CENT` (Default 6) / `FAL_KOSTEN_CENT` (Default 4) sind Schätzwerte — nach den ersten echten Läufen mit dem Provider-Dashboard abgleichen
- [ ] **Tages-Budget bestätigen**: `ASSET_BUDGET_TAG_CENT` Default 500 (= 5 €/Tag); Pipeline stoppt hart, wenn erreicht

## Asset-Bank (MVP-Finish §3)
- [ ] **Echter Bild-Key für die Asset-Bank** (`HIGGSFIELD_API_KEY` oder `FAL_API_KEY`): `npm run seed:assets -- --branche maler --count 30` erzeugt ohne Key nur STUB-Assets (`quelle='ai_mock'`) — die sind per Server-Regel **nie approvebar** (Freigabe wird mit 400 abgelehnt). Erst mit echtem Key entsteht freigebbares Material
- [ ] **≥30 Assets inkl. 3 Paare für die erste Ziel-Branche freigeben** (`/admin/assets`): Seeding legt alles als `draft` an — Mensch-Gate. Grid filtert nach Branche/Szene/Status, Paare werden IMMER gemeinsam freigegeben/abgelehnt (Server erzwingt das), Alt-Texte in der Großansicht korrigierbar, „Regenerieren" nutzt den gespeicherten Prompt mit neuem Seed. DoD Phase 2 hängt an dieser Freigabe

## Template-Fabrik (TEMPLATE_FABRIK_MASTER.md)
- [ ] **Higgsfield-Assets galabau generieren** (Rezeptliste: `rezepte/REZEPTE_GALABAU.md`): Kette Hero → Video → BA-Paar beachten; Fertig-Kriterium ≥25 approved inkl. 1 Paar, 1 Hero, 1 Video
- [ ] **HIGGSFIELD_REZEPTE_MALER.md liefern**: Die Datei ist laut Auftrag vorhanden, war aber weder im Repo noch auf der Platte auffindbar (Spotlight + find über Home/Desktop/Downloads/Documents). Bitte Datei bereitstellen (z. B. nach `rezepte/REZEPTE_MALER.md`) — bis dahin leite ich die Maler-Rezeptliste in B3 aus der GaLaBau-Vorlage ab und gleiche sie später gegen deine Fassung ab
- [ ] **Maler B1-Steckbrief freigeben** (`branchen/maler/STECKBRIEF.md`): Checkbox in der Fortschritts-Matrix (PROGRESS.md) — ohne Haken startet B2 nicht

## Ein-Klick-Demo (MVP-Finish §4, Phase 3)
- [ ] **5-Testfirmen-Lauf (DoD §4):** braucht (a) `ANTHROPIC_API_KEY` lokal/in Vercel für die Copy-Slots-Generierung (ohne Key greift der deterministische Fallback aus Formulardaten — funktioniert, aber ist nicht der DoD-Pfad) und (b) approvede Assets der Ziel-Branche in `/admin/assets` (sonst harter Fail „kein approved hero"). Danach: 5 Leads über `/admin/leads/neu` anlegen mit „Direkt generieren", Ergebnis + Kosten (≤ 1,50 €/Demo) in der Liste prüfen, je Demo das Mensch-Gate „Demo geprüft" setzen
- [ ] **Lighthouse ≥90 auf generierten Demos**: erst nach dem 5-Testfirmen-Lauf messbar (generierte Demos sind self-contained Flagship-HTML — Offline-Werte der Engine liegen bei 0.92–0.99)

## Branchen-Fabrik (F3–F5)
- [ ] **16 Branchen freigeben** (`/admin/branchen`): Seeding legt alles als `draft` an — Mensch-Gate nach BF §4.6. Je Branche Preview prüfen (`/branchen-preview/<key>`), dann Freigeben oder Feedback (mit „Feedback & neu generieren" läuft sofort eine Regenerier-Runde mit deinem Feedback im Prompt)
- [ ] **Slack `#library`-Webhook anlegen** (`SLACK_WEBHOOK_LIBRARY`): Pings für „neue Branche wartet auf Freigabe" + Regenerier-Ergebnisse; ohne Env-Var nur Log-Stub
- [ ] **Higgsfield-Key + Re-Seeding der Assets**: aktuelle Branchen-Assets kommen vom Mock-Provider (Platzhalter, 0 Cent). Mit echtem Key je Branche neu generieren (z. B. `npx tsx scripts/seed-branchen.ts --nur <keys>` oder Regenerier-Runde) — erst dann sind Previews/Demos mit echten Bildern
- [ ] **Subdomain-Preview** `preview-<branche>.DOMAIN` (BF §4.5): aktuell Pfad-Route `/branchen-preview/<key>` — Host-Routing-Erweiterung erst sinnvoll, wenn Produktdomain feststeht
- [ ] **Inngest (o. ä.) für Seeding-Jobs**: Auto-Seeding läuft synchron im Request (maxDuration 800 → braucht Vercel Pro + Fluid; falls Deploy meckert, auf 300 senken). Sauber wäre ein Hintergrund-Job mit Status-Polling
- [ ] **Demo-Kosten kalibrieren**: `kosten_cent` an der Demo basiert auf `HIGGSFIELD_KOSTEN_CENT`/`FAL_KOSTEN_CENT`-Schätzwerten — nach ersten echten Läufen gegen Provider-Dashboard prüfen (DoD ≤ 1,50 €/Demo)

## Entscheidungen
- [ ] **`LEAD_NOTIFY_EMAIL` festlegen**: Lead-Benachrichtigungen gehen jetzt in die leads-Tabelle + Mail an diese Adresse (das hartcodierte `hendrik@hoffmann-wd.de` aus dem Alt-Repo ist raus). Ohne Env-Var: Fallback FROM_EMAIL
- [ ] **Produktdomain festlegen** (für Host-Routing: PRODUKTDOMAIN.de = Marketing, app. = Portal, *. = Kundenseiten)
- [ ] **Stripe Live-Keys**: Wechsel von Test auf Live erst nach deiner Freigabe (Stop-Condition laut Masterprompt)
- [ ] **Upsell-Preise & Laufzeiten bestätigen** (`config/upsells.ts`): aktuelle Platzhalter — SEO-Abo 49 €/M, Stadtteil-Seiten 299 € einmalig, Bewertungs-System 149 € + 19 €/M, Konkurrenz-Radar 29 €/M, Saison-Kampagnen 39 €/M, GBP-Einrichtung 199 €, Google Ads Starter 99 €/M (Betreuung; Werbebudget zahlt der Kunde immer direkt an Google). Laufzeiten aktuell 1/1/1 (monatlich kündbar) — bewusst kundenfreundlich, kannst du auf z. B. 12/12/1 ändern
- [ ] **KICKOFF_MODE entscheiden** (`auto` oder `call`, Env-Var): steuert, ob der Kickoff-Touchpoint automatisch läuft oder du persönlich anrufst. Ohne Env-Var: `auto`

## Später (vor Kunden-Go-Live)
- [ ] **Rechtstexte-Vorlagen vom Anwalt prüfen lassen** (Phase 4 §5.4): Impressum- und Datenschutz-Bausteine liegen in `config/rechtstexte-vorlagen.ts` (Generator: `lib/rechtstexte.ts`). Nach Review nur die Config-Datei anpassen — der Generator setzt ausschließlich Pflichtangaben ein. Bis zum Review gelten die Texte als Vorlage ohne Rechtsgewähr
- [ ] **AGB erstellen (Anwalt)**: Werte 24/12/3 absegnen + Vertrag als Dauerschuldverhältnis (laufende Leistung: Hosting, Pflege, Editor, Updates) ausgestalten, nicht als Werkvertrag. Hintergrund: 24-Monats-VERLÄNGERUNG per AGB ist im B2B nach § 307 BGB angreifbar, 12 Monate gelten als robust — deshalb Standard seit 2026-07-15 auf 24/12/3 (`config/vertraege.ts`)
- [ ] **Stripe-Consent-Checkbox aktivieren** (`STRIPE_TOS_CONSENT=1`): Sobald die AGB stehen, AGB-URL in den Stripe-Settings (Dashboard → Einstellungen → Zahlungsseite) hinterlegen und dann die Env-Var setzen — erst dann verlangt der Checkout den AGB-Haken (`consent_collection`). Ohne hinterlegte URL lehnt die Stripe-API die Session ab, deshalb ist die Checkbox bis dahin deaktiviert; der Konditionen-Wortlaut steht aber immer unter dem Kaufen-Button (`custom_text.submit`)
- [ ] Golden-Set: 10 echte Firmen in `test/golden_set.json` eintragen (5 mit Website, 3 nur Google-Eintrag, 2 ohne alles — aktuell Platzhalter mit `"platzhalter": true`; Check läuft mit `npm run ci:golden-set`)
- [ ] Registrar-Zugang (Domains für Kunden), Google Business Profile API, Ads-Konto-Zugang — bis dahin läuft der Mock-Registrar (`REGISTRAR_PROVIDER=mock`, Neuregistrierungen werden simuliert)
- [ ] DataForSEO-Zugang (`DATAFORSEO_LOGIN` + `DATAFORSEO_PASSWORD`) für echte Rank-Reports im SEO-Abo; ohne Keys liefert der technische SEO-Check einen Stub statt Sichtbarkeitsdaten
- [ ] Firecrawl-API-Key (`FIRECRAWL_API_KEY`) — alternativ bleibt eigener Scraper
- [ ] Google-Places-API-Key (`GOOGLE_PLACES_API_KEY`, Places API New) — liefert Adresse, Telefon, Öffnungszeiten + echte Bewertungen für Library-Demos; ohne Key läuft die Pipeline ohne diese Daten
- [ ] **Stock-Assets lizenzieren/hochladen**: aktuelle Seeds sind Unsplash-Platzhalter; Friseur hat noch keine branchenspezifischen Bilder (nutzt universelle Platzhalter)
