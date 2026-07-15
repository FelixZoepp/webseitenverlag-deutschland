# AUDIT — Phase A (2026-07-15)

Bestandsaufnahme des Ist-Zustands mit Einordnung **KEEP / REFACTOR / KILL** gemessen an der Mission (Zero-Fulfillment-Website-Maschine, §1 Masterprompt). KILL bedeutet: Verschiebung nach `/_legacy/` in Phase B, kein Löschen.

## Überblick

- Next.js 14.2.35 (App Router, sync params), React 18, Tailwind 3.4.1, TypeScript 5
- Supabase (Auth + Postgres + RLS + Storage), Anthropic SDK, Resend, Stripe, pdfkit, zod, lucide-react
- 53+ Routen, 32 lib-Dateien, 39 Template-Renderer, 15 Migrationen, 1 Cron
- Multi-Tenant-Hosting heute: Cloudflare Pages mit **per-Kunde-Credentials in der DB (unverschlüsselt!)**

---

## KEEP — trägt die Mission, bleibt wie es ist

| Bereich | Dateien | Begründung |
|---|---|---|
| Auth-Kern | `lib/auth-helpers.ts`, `lib/api-helpers.ts`, `lib/supabase/{server,middleware,client}.ts`, `middleware.ts`, `app/(auth)/*` | Sauberes Supabase-Auth-Muster, überall genutzt |
| Demo-Maschine | `lib/scrape-prospect.ts`, `lib/generate-demo.ts`, `app/admin/demos/*`, `app/api/admin/demos/*`, `app/demo/[token]`, Migration 013 | Kern des Sales-Flows (§1 Schritt 3), frisch gebaut |
| Stripe-Closing | `lib/stripe.ts`, `payment-link`-Route, `app/api/webhooks/stripe`, `app/willkommen`, Migration 014 | Kern des Closing-Flows (§1 Schritt 4–5), idempotent |
| Template-System | `lib/templates/*` (39 Renderer), `lib/template-catalog.ts`, `lib/template-configs.ts`, `lib/template-schemas.ts` | 38 Premium-Templates = Produktkern. Phase C baut section_library **daneben** auf, ersetzt nicht |
| Pakete | `lib/packages.ts` | Single Source für Preise, speist Stripe price_data |
| E-Mail | `lib/email.ts` (Resend) | Lead-Notification, Bestätigung, Zugangs-Mail — alles missionsrelevant |
| Kunden-Portal | `app/dashboard/**`, `app/api/sites/**`, `app/api/customer/**` | Basis für Phase F (Wizard/Chat-Editor werden ausgebaut, nicht neu) |
| Chat-Editor-Basis | `lib/claude.ts`, `lib/editor-leitplanken.ts`, `lib/config-utils.ts`, `components/site-editor.tsx` | Grundlage Phase F; Leitplanken heute nur Prompt-Level → siehe REFACTOR |
| Analytics | Migration 006, `api/public/track`, `dashboard/[siteId]/analytics` | Kundennutzen, kein Fulfillment-Aufwand |
| Formulare/Leads (Kundenseiten) | Migration 003, `api/public/forms/[siteId]/submit`, `dashboard/[siteId]/leads` | Kernversprechen der Kundenseiten |
| Bild-Upload | Migration 011, `lib/image-checklist.ts`, `api/customer/bilder/*` | Wizard-Baustein (Phase F) |
| Upsell-Katalog | `lib/upsells.ts`, `lib/upsell-emails.ts`, Migrationen 008_upsell/009 | Upsell-Leiter ist §10-Kern; Orchestrierung → REFACTOR |
| Potenzial-Rechner | `lib/potenzial-daten.ts`, `admin/potenzial-rechner` | Sales-Werkzeug, aktiv genutzt |
| Briefing-Cron | `lib/briefing.ts`, `api/cron/briefings`, `vercel.json` | Setter/Closer-Vorbereitung, zahlt auf §1 Schritt 2 ein |
| Slack-Stubs | `lib/slack.ts`, `lib/feature-flags.ts` (nur slack/fireflies-Flags) | Billig, sauber gestubbt, ops-nützlich |

## REFACTOR — richtige Idee, falsche/unfertige Umsetzung

| # | Was | Problem | Ziel (Phase) |
|---|---|---|---|
| R1 | **Landing Page** `app/page.tsx` | Platzhalter (Hero + Login-Link), keine Leads, kein Storytelling | Phase B: `(marketing)`-Route-Group aus Webseiten-wvd-Klon, Lead-Form → `leads`-Tabelle mit UTM, Quality-Gates §2 |
| R2 | **Host-Routing** | Kein Domain-Routing — alles läuft auf einer Domain | Phase B: Middleware-Routing PRODUKTDOMAIN.de / app. / *. (§1 Routing-Tabelle) |
| R3 | **Cloudflare-Tokens unverschlüsselt** in `customers.cloudflare_api_token` | Klartext-Secrets in DB | Phase E/G: Verschlüsselung oder zentrales Token + `deploy_target`-Spalte (`multi_tenant` \| `customer_cloudflare`, §3) |
| R4 | **Freigeben-Flow** `api/customer/freigeben` | Setzt nur Status, ruft keinen Deploy auf (Publish-Route deployt, Freigeben nicht) | Phase E: Freigabe → Render → Deploy in einem Pfad |
| R5 | **Upsell-Aktivierung** `lib/upsell-orchestrator.ts` | Hängt an `lib/payment.ts`-Stub (No-Op-Provider); Annahme aktiviert faktisch nichts Abrechenbares | Phase E/F: Orchestrator auf Stripe-Subscription-Items umstellen, `payment.ts`-Stub fällt weg |
| R6 | **Editor-Leitplanken** | Nur Prompt-Level, keine Server-Validierung der Ops | Phase F: Chat-Editor nur strukturierte Ops + zod-Validierung serverseitig (§10) |
| R7 | **Doppelte Migration 008** (`008_customer_onboarding.sql` + `008_upsell_system.sql`) | Reihenfolge nur zufällig korrekt (alphabetisch) | Phase B: NICHT umbenennen (additiv-Regel, evtl. schon angewendet) — stattdessen in AUDIT/PROGRESS dokumentiert lassen, neue Migrationen ab 015 |
| R8 | `002_multipage.sql` ist **leer** | Platzhalter ohne Inhalt | Nur dokumentieren, nichts tun (additiv-Regel) |
| R9 | **Verträge** Migration 010 + `api/admin/vertraege` | Gebaut um DocuSign/SEPA herum | Phase E: `contracts` neu mit 24/24/3-Konditionen (§6), Stripe als Zahlungsquelle; alte Route → _legacy |
| R10 | **Fehlerbehandlung API-Routen** | Uneinheitlich (mal JSON, mal Text, mal 500 ohne Body) | Nebenbei bei jeder angefassten Route vereinheitlichen, kein Big Bang |
| R11 | **Kein Rate-Limit** auf `api/public/forms/*/submit` | Spam-Risiko auf Kundenformularen + künftigem Lead-Form | Phase B (Lead-Form) mindestens einfaches Rate-Limit/Honeypot |
| R12 | **Onboarding-Generierung** `lib/generate-site.ts` (Transcript-basiert) | Firecrawl/Places-Kette fehlt, hängt an Fireflies | Phase D: Pipeline v2 mit Fallback-Kette, generate-site wird eine Quelle von mehreren |

## KILL — trägt die Mission nicht, geht nach `/_legacy/` (Phase B)

| # | Was | Begründung |
|---|---|---|
| K1 | `lib/docusign.ts` (181 LOC) + `app/api/webhooks/docusign` | Stripe-Checkout ersetzt Signatur-Flow komplett (§3). Feature-Flag ist eh false |
| K2 | `lib/payment.ts` (PaymentProvider-Stub für Qonto/EasyBill) | No-Op-Interface „wird später ersetzt" — ist jetzt ersetzt: Stripe. Einziger Importer ist upsell-orchestrator (→ R5) |
| K3 | `lib/pdf/sepa-mandat.ts` | SEPA-Mandat obsolet, Stripe zieht ein. (`lib/pdf/angebot.ts` + `helpers.ts` vorerst behalten — Angebots-PDF kann im Closing nützlich bleiben, Entscheidung Phase E) |
| K4 | `lib/vertrag-emails.ts` (DocuSign-Envelope-Mails) | Hängt am DocuSign-Flow; Phase E baut neue Vertrags-Mails um Stripe/contracts herum |
| K5 | Feature-Flags `qontoActive`, `easybillActive` in `lib/feature-flags.ts` | Tote Flags ohne Implementierung dahinter |
| K6 | `lib/defaults.ts` | Existiert, wird nirgends importiert — tot |
| K7 | `scripts/migrate-to-multipage.ts` | Einmal-Skript, erledigt |
| K8 | `lib/template-renderer.ts` (535 LOC, Legacy-Single-Page) | **Vorsicht: 4 Importstellen** — erst in Phase C prüfen, ob alle Aufrufer auf `renderPremiumTemplate` umgestellt sind, dann _legacy. Bis dahin: nicht anfassen |

## Bekannte Lücken (aus Review 2026-07-15, hier bestätigt)

1. Freigeben ohne Deploy (→ R4)
2. Upsell-Annahme aktiviert nichts Abrechenbares (→ R5; `activateUpsellForCustomer` wird zwar von der Upsell-Route importiert, läuft aber gegen den No-Op-Payment-Stub)
3. Doppelte 008-Migration (→ R7)
4. Leitplanken ohne Server-Validierung (→ R6)
5. Cloudflare-Tokens im Klartext (→ R3)

## Fehlt komplett (Aufbau in Phasen C–H)

- `leads`-Tabelle + UTM-Erfassung (Phase B, §6)
- `section_library`, `library_pages`, `stock_assets` (Phase C, §6)
- `contracts` mit 24/24/3-Logik, Dunning, Kündigung (Phase E, §6/§9)
- `manual_tasks` (Fallback-Warteschlange, §6)
- `deploy_target` auf sites (§3)
- Generierungs-Pipeline v2: Firecrawl → Places → manuell (Phase D, §8)
- Wizard, Upsell-Leiter final, Chat-Editor v2 (Phase F)
- Domain-Fulfillment (Phase G)
- CI-Gates: Golden-Set, Lighthouse-CI, Playwright, /admin/kennzahlen (Phase H)

## Env-Vars (Ist)

Pflicht: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`
Optional: `FROM_EMAIL`, `FROM_NAME`, `BRIEFING_EMAIL`, `FIREFLIES_API_KEY`, `SLACK_WEBHOOK_*`
Kill-Kandidaten (mit K1/K5): `DOCUSIGN_*`, `QONTO_API_ACTIVE`, `EASYBILL_API_ACTIVE`
