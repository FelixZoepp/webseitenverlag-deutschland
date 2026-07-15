# AUDIT v2 — Phase A gegen Masterprompt v2 + Branchen-Fabrik (2026-07-15)

Zweit-Audit nach Abschluss des ersten Umbau-Zyklus (Phasen 0–H, siehe PROGRESS.md).
Bewertungsmaßstab ist der **neue** `CLAUDE_CODE_MASTERPROMPT.md` (Flagship-first,
Branchen-Fabrik, `asset_bank`, Higgsfield-Motor, Alt-Templates = automatisches KILL)
plus `BRANCHEN_FABRIK_PROMPT.md`. Das Audit v1 (gegen den alten Prompt) liegt in der
Git-Historie (`git show 030c290~N:AUDIT.md`); seine noch offenen Punkte sind hier
übernommen. KILL = Verschiebung nach `/_legacy/` in Phase B, kein Löschen.

## Stack-Steckbrief

- **Framework:** Next.js 14.2.35 (App Router, sync params), React 18, TypeScript 5, Tailwind 3.4.1
- **Paketmanager:** npm (package-lock.json)
- **DB:** Supabase Postgres (RLS, Auth, Storage), 22 Migrationen (001–021, additiv; 002 leer, 008 doppelt — dokumentiert, nicht anfassen). Migrationen 013–021 sind in der Prod-Supabase ausgeführt, Library geseedet
- **Auth:** Supabase Auth (Magic Link Kunden, Rollen Team), Host-Routing-Middleware env-gesteuert
- **Zahlungen:** Stripe (Checkout, Subscriptions, Multi-Event-Webhook mit Idempotenz, Dunning, `contracts` 24/24/3)
- **Mail:** Resend · **Monitoring:** Slack-Webhooks (#errors/#money), `nutzungs_events`-Kosten-Log, `GENERATION_KILL_SWITCH`
- **Rendering heute:** 3 parallele Renderer — (1) Library-Renderer `lib/library/render.ts` (Zero-JS, Demos v2), (2) 38 Premium-Alt-Templates `lib/templates/*` (Demos v1 + Bestand), (3) Legacy `template-renderer.ts`/`multipage-renderer.ts` (Bestands-Sites, config_versions-Rollback)
- **Deploy:** Vercel (`vercel deploy --prod`, kein Git-Remote → CI-Workflow schläft), Cloudflare-Pages-Code für Kundenseiten vorhanden
- **Umfang:** 100 Routen-Dateien (page/route), 42 lib-Module, 39 Alt-Template-Renderer, 4 Crons, 5 Scripts, CI-Gates (Golden-Set 82 Checks, Lighthouse 11 Seiten, Playwright-E2E env-gated)
- **Flagships:** `flagship_reinigung.html` + `flagship_restaurant.html` offline-fähig im Repo, Assets lokal als WebP in `./assets/` (Panevino-Originale mit `original_`-Präfix, Quarantäne-Regel)

---

## KEEP — trägt die Mission v2 (Mapping auf Zielarchitektur)

| Bereich | Dateien/Ordner | Mapping | Begründung |
|---|---|---|---|
| **Flagships + Assets** | `flagship_reinigung.html`, `flagship_restaurant.html`, `assets/` | BF §1, F2 | Kanonische Qualitäts-Referenz; einzige Render-Grundlage ab F2 |
| Auth-Kern | `lib/auth-helpers.ts`, `lib/api-helpers.ts`, `lib/supabase/*`, `middleware.ts`, `app/(auth)/*` | §3 | Sauber, überall genutzt; Host-Routing bereits drin |
| Marketing-Landing | `app/(marketing)/*`, `components/landing/*` (inkl. `/anfrage`-Funnel v2), `app/api/public/lead` | §1, §5.3 | Phase-B-Ergebnis: Leads mit UTM direkt in DB, Honeypot+Rate-Limit, self-hosted Fonts |
| Lead-/Demo-Verwaltung | Migration 013/015/017, `app/admin/demos/*`, `app/api/admin/demos/*`, `app/demo/[token]` | §8 | Ops-Flow steht; nur die Render-Grundlage wechselt (s. REFACTOR/KILL) |
| Pipeline v2 Datenkette | `lib/pipeline/prospect-data.ts` (Firecrawl→Scraper→Places→manuell) | §8.1–8.2 | Fallback-Kette wie gefordert, env-degradierend |
| Stripe-Closing + Verträge | `lib/stripe.ts`, `lib/contracts.ts`, Webhook `app/api/webhooks/stripe`, Migration 014/018, `/admin/vertraege`, `app/willkommen` | §9 | Checkout, Provisioning, Dunning, Kündigungsfristen-Logik (24/24/3 konfigurierbar) komplett |
| Portal | `app/dashboard/**`, `lib/wizard.ts`, `lib/rechtstexte.ts`, `lib/qa.ts`, `components/fertigstellungs-wizard.tsx`, Migration 019 | §10.1 | Wizard 5 Schritte inkl. Auto-QA |
| Chat-Editor v2 | `lib/editor-ops.ts` (6 Op-Typen, Zod, All-or-Nothing), `lib/claude.ts`, `lib/editor-leitplanken.ts`, `lib/config-utils.ts`, `components/site-editor.tsx` | §10.2 | Nur strukturierte Ops, serverseitig validiert, Rollback über config_versions |
| Upsell-Maschine | `config/plans.ts`, `config/upsells.ts`, `lib/upsell-kauf.ts`, `upsell_orders`, `/dashboard/[siteId]/erweiterungen`, Admin-Zahlungslink | §10.3–10.5 | Katalog final, 2 Kaufwege, auto/va_manual, eigene Verträge je Buchung |
| Phase-G-Fulfillment | `lib/registrar.ts` (Mock), `lib/seo-plan.ts` + Cron, `gbp_setups` (020) + `/admin/worklist`, `lib/ads-starter.ts` + Cron, Billing-Portal | §11 | Alle drei Upsell-Fulfillments testbar |
| CI & Monitoring | `scripts/ci-golden-set.ts`, `scripts/ci-lighthouse-render.ts`, `lighthouserc.json`, `e2e/*`, `lib/monitoring.ts`, `lib/nutzung.ts` (021), `/admin/kennzahlen`, `.github/workflows/ci.yml` | §12 | Gates existieren; Lighthouse-Set muss nach Flagship-Umbau auf die neuen Previews zeigen |
| Kundenseiten-Basics | Migration 003/006/011, `api/public/forms/*/submit`, `api/public/track`, Leads-Inbox, Bild-Upload (`lib/image-checklist.ts`) | §10/§11 | Formular-Inbox, cookielose Analytics, Sharp-Wizard-Baustein |
| Quality-Gates-Bausteine | `lib/floskel-blacklist.ts`, `lib/library/load.ts` (DB-first + Seed-Fallback) | §2.3 | Wird vom Konsistenz-Validator (fehlt, s. u.) mitgenutzt |
| Ops-Werkzeuge | `lib/briefing.ts` + Cron, `lib/potenzial-daten.ts`, `lib/slack.ts`, `lib/email.ts`, `lib/packages.ts` (s. R6), `lib/feature-flags.ts` | — | Aktiv genutzt, billig |

## REFACTOR — richtige Idee, falsche Form

| # | Was | Problem | Ziel (Phase) |
|---|---|---|---|
| R1 | **Library-Inhalte** (Seed aus `scripts/seed-library.ts`: 40 generische Sektionen, 8 Kompositionen, Zero-JS) | Schema von `section_library`/`library_pages` (016) passt zu §6 — aber der Inhalt erreicht Flagship-Niveau nicht (keine Signature-Sections, kein Stepper, kein Vorher/Nachher-Slider, System-Fonts statt Design-Tokens nach BF §1.3) | **F2:** Flagships in Section-Templates zerlegen, Library neu seeden; alter Seed wird ersetzt. Renderer `lib/library/render.ts` um Signature-JS (≤ 80 KB, lazy nach LCP), Token-System (BF §1.3) und Demo-Level-Regel (§10.3) erweitern |
| R2 | **`stock_assets` → `asset_bank`** | 016 hat `stock_assets` (Unsplash-Platzhalter); Masterprompt §6 verlangt `asset_bank` mit `pair_id`, `gen_prompt`, `gen_seed`, `quelle`, `kosten_cent`, `quality_status` | **F1:** additive Migration `asset_bank` (oder `stock_assets` additiv erweitern + View), Platzhalter-Assets bleiben `draft` |
| R3 | **Cloudflare-Deploy-Code** `lib/cloudflare.ts`, publish/rollback-Routen | Explizite KILL-Ausnahme im Masterprompt: wird zur `customer_cloudflare`-Pipeline konsolidiert. Tokens liegen weiter **im Klartext** in `customers.cloudflare_api_token` (offen aus Audit v1) | Phase-G-Nacharbeit: `deploy_target`-Spalte, scoped-Token-Flow, Verschlüsselung at rest, Auto-Fallback `multi_tenant` |
| R4 | **Auslieferung Bestands-Sites** `lib/auslieferung.ts`, `app/kundenseite/[host]/*` | Rendert über `template-renderer`/`multipage-renderer` (Legacy) | Nach F2: auf Library-Renderer umstellen; Bestands-Sites migrieren, dann K1 vollziehen |
| R5 | **Demo-Generierung v1** `lib/generate-demo.ts` + `lib/template-schemas.ts` | KI erzeugt generisches Config-Schema für 38 Alt-Templates → systemische Schema-Diskrepanz (Reinifix-Crash 2026-07-15 bewiesen; nur `reinigung-privat` normalisiert) | Einfrieren (keine neuen Alt-Template-Demos forcieren), Demos laufen zunehmend über Library-Engine; fällt mit K1 |
| R6 | **Doppelte Preis-/Paket-Wahrheit** `lib/packages.ts` vs. `config/plans.ts` | Zwei Quellen für Paket-Infos (Preise/price_data vs. Feature-Gates) | Konsolidieren: `config/plans.ts` = Feature-Wahrheit, Preise nur Stripe; `packages.ts` darauf reduzieren oder mergen |
| R7 | **Konsistenz-Validator fehlt als hartes Gate** (§8.6) | Kein Städte-Blocklist-Scan, kein Entity-Check (`&uuml;`-Bug trat real auf), kein Leere-Slots-/tote-Links-Gate nach dem Rendern | Phase-D-Nacharbeit (vor F5): Validator-Modul, Fail = kein `demo_bereit` |
| R8 | **Demo-Assets nicht frisch** | Demos nutzen ausschließlich Bank-/Platzhalter-Assets; BF §2.3 verlangt frischen Hero + Signature-Paar je Demo (Budget ≤ 1,50 €), Quarantäne-Bucket für Prospect-Fotos fehlt | **F1 + F5:** Higgsfield-Motor, `makePair()`, Quarantäne-Quelle `prospect_quarantaene`, Schalter `DEMO_ORIGINAL_FOTOS` |
| R9 | **Alt-Pipeline v1 (Transcript-basiert)** `lib/generate-site.ts`, `lib/build-pipeline.ts`, `lib/fireflies.ts`, `api/webhooks/fireflies`, `api/admin/build-site`, `api/onboarding/generate` | Hängt an Fireflies-Transkripten; Pipeline v2 existiert und ist überlegen | Aufrufer auf Pipeline v2 umhängen, dann Cluster → `_legacy/` (Phase B dieses Zyklus) |
| R10 | **Lighthouse-CI-Set zeigt auf alte Previews** | 11 Seiten basieren auf dem generischen Library-Seed | Nach F2/F3 auf Flagship-Zerlegungen + 16 Branchen-Previews umstellen |

## KILL → `/_legacy/` (mit Übergangsbedingung)

| # | Was | Begründung | Übergangsbedingung |
|---|---|---|---|
| K1 | **Sämtliche Alt-Templates:** `lib/templates/*` (39 Dateien), `lib/template-catalog.ts`, `lib/template-configs.ts`, `lib/template-schemas.ts`, `lib/template-renderer.ts` (535 LOC), `lib/multipage-renderer.ts`, `templates/business-multipage/` | Automatisches Kill-Kriterium des neuen Masterprompts („sämtliche Alt-Vorlagen des früheren Generators"). Zusätzlich objektiv: **Fremd-CDN-Referenzen (Google Fonts u. a.) in mind. 10 Alt-Templates** = DSGVO-/Performance-Verstoß §2.1; Schema-Diskrepanz zur KI-Pipeline (R5) | **Nicht sofort:** aktive Demos, Bestands-Sites und `config_versions`-Rollback hängen dran (Aufrufer: `app/demo/[token]`, preview/fertigstellen/rollback, `lib/auslieferung.ts`). Vorher: Ideen/Copy nach `LEGACY_NOTIZEN.md` sichern (Phase B), F2 reproduziert Reinigung+Restaurant aus der Library, Bestands-Demos/Sites migrieren (R4). Reihenfolge: Notizen → F2 → Migration → _legacy |
| K2 | Alt-Pipeline-v1-Cluster (siehe R9) | Fireflies-Transcript-Weg ist tot, sobald Aufrufer umgehängt sind | Umhängen der 4 Routen |
| K3 | Alter generischer Library-Seed (Seed-Daten in `lib/library/seed-data.ts` + DB-Zeilen `quality_status='draft'` lassen) | Wird durch Flagship-Zerlegung ersetzt (F2/F3); nie approven | Ersatz-Seed vorhanden |
| — | v1-KILLs (DocuSign, SEPA-PDF, Qonto/Easybill-Flags, upsell-orchestrator, payment-Ledger-Schreibweg …) | Bereits in `/_legacy/` (Phasen B–H v1) | erledigt |

## Doppelte Wahrheiten (Watchlist)

1. **3 Renderer parallel** (Library / Premium-Alt / Legacy-Single+Multipage) → Ziel: einer (F2, K1)
2. `lib/packages.ts` vs. `config/plans.ts` (R6)
3. `stock_assets` vs. künftige `asset_bank` (R2)
4. `rechnungs_posten` (Alt-Ledger): nur noch lesend für Altdaten — ok, beobachten
5. Marketing-`/anfrage` (eigener Funnel, Leads für UNS) vs. Kundenseiten-`/anfrage` (BF §1.2, noch zu bauen in F2) — bewusst zwei Dinge, nicht mergen

## Fehlt komplett (Bauplan F1–F5 der Branchen-Fabrik)

- `lib/assets/higgsfield.ts` (Provider-Abstraktion Higgsfield/fal, Download→WebP/AVIF→Storage, Kosten-Log) + `makePair()` — **F1**
- `asset_bank`, `branchen_profile`, `library_pages.branchen_profil_id`, `form_submissions.qualifizierung` — additive Migrationen (BF §5)
- Flagship-Zerlegung in Section-Templates + Token-System + `/anfrage`-Funnel-Template für Kundenseiten — **F2**
- 16 Start-Branchen (8 Meta-Kategorien × 2) mit Mensch-Freigabe-Gate — **F3**
- Auto-Seeding-Job `branche_seeden` + Freigabe-UI + `guideline_notes`-Lernschleife — **F4**
- Demo-Pipeline auf Frisch-Assets + Konsistenz-Validator + Quarantäne-Bucket — **F5** (+R7/R8)
- Städte-Blockliste (Top-200 DE), Claims-Blacklist Gesundheit (BF §7)

## Env-Vars

**Gesetzt/genutzt:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`, `FROM_EMAIL/NAME`, `NEXT_PUBLIC_MARKETING_HOST/APP_HOST`, `KICKOFF_MODE`, `REGISTRAR_PROVIDER`, `GENERATION_KILL_SWITCH`, `E2E_ENABLED`
**Referenziert, Key fehlt (WARTELISTE):** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `LEAD_NOTIFY_EMAIL`, `FIRECRAWL_API_KEY`, `GOOGLE_PLACES_API_KEY`, `DATAFORSEO_LOGIN`, `SLACK_WEBHOOK_*`, `BRIEFING_EMAIL`, `FIREFLIES_API_KEY` (fällt mit K2)
**Neu nötig (F1/F5):** `HIGGSFIELD_API_KEY`, `FAL_API_KEY`, `DEMO_ORIGINAL_FOTOS` (default aus), Tages-Budget-Limit

## Selbsttest Phase A

Typecheck + Lint grün (Stand dieses Commits); Build unverändert deploybar (letzter Prod-Deploy 2026-07-15 grün).
