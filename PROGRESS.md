# PROGRESS — Mission v2 (Zero-Fulfillment-Website-Maschine)

Branch: `refactor/mission-v2` · Basis-Commit: `55a67fa` (wip: stand vor mission-v2)

## Phasen-Status

| Phase | Inhalt | Status |
|-------|--------|--------|
| 0 | Git-Sicherheitsnetz, PROGRESS.md, WARTELISTE.md | ✅ erledigt (2026-07-15) |
| A | Inventur & Audit → AUDIT.md (KEEP/REFACTOR/KILL) | ✅ erledigt (2026-07-15) |
| B | Aufräumen (/_legacy/), Landing als `(marketing)`, Lead-Form → leads-Tabelle, Host-Routing-Middleware | ✅ erledigt (2026-07-15) |
| C | Template-Library + Seeding (4 Branchen × 2 Stile) | ✅ erledigt (2026-07-15) |
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

## Notizen für nächste Session
- **Nächste Phase: D** (Generierungs-Pipeline v2: Firecrawl → Places → manueller Fallback, §8) — Pipeline füllt content_schema-Felder der Library-Sektionen ({{firma}}/{{ort}}/{{jahr}}-Tokens ersetzen) und prüft Texte gegen `lib/floskel-blacklist.ts`
- Rendering der Library-Kompositionen (Section-Renderer, Design-Tokens je Stil) wird mit Phase D/Demo-Generierung gebaut — DB liefert Inhalt+Komposition, Code die Präsentation
- Migrationen 013–016 noch nicht in Supabase ausgeführt (WARTELISTE); danach: `npx tsx scripts/seed-library.ts`
- Stock-Assets sind Platzhalter (Friseur nutzt universelle Bilder) — echte lizenzierte Assets auf WARTELISTE
