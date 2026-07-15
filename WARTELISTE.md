# WARTELISTE — Dinge, die Felix erledigen/entscheiden muss

Blockiert nicht die Entwicklung, aber nötig für Go-Live.

## Sofort (für aktuellen Stand)
- [ ] **Migrationen 013–019 in Supabase ausführen** (`013_demos.sql`, `014_stripe.sql`, `015_leads.sql`, `016_template_library.sql`, `017_demos_engine.sql`, `018_contracts.sql`, `019_portal.sql` — 017 nötig für Library-Demos, 018 für Verträge/Dunning, 019 für Wizard + Upsell-Käufe)
- [ ] **Library seeden** (nach Migration 016): `npx tsx scripts/seed-library.ts` (Env: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
- [ ] **Vercel Env-Vars setzen**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `LEAD_NOTIFY_EMAIL`
- [ ] **Stripe-Webhook-Endpoint anlegen**: Dashboard → Webhooks → `https://<domain>/api/webhooks/stripe`, Events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted` (alle 5 nötig für Verträge + Dunning, Phase E)
- [ ] **Resend-Domain verifizieren** (für Zugangs-/Lead-Mails von eigener Domain)

## Entscheidungen
- [ ] **`LEAD_NOTIFY_EMAIL` festlegen**: Lead-Benachrichtigungen gehen jetzt in die leads-Tabelle + Mail an diese Adresse (das hartcodierte `hendrik@hoffmann-wd.de` aus dem Alt-Repo ist raus). Ohne Env-Var: Fallback FROM_EMAIL
- [ ] **Produktdomain festlegen** (für Host-Routing: PRODUKTDOMAIN.de = Marketing, app. = Portal, *. = Kundenseiten)
- [ ] **Stripe Live-Keys**: Wechsel von Test auf Live erst nach deiner Freigabe (Stop-Condition laut Masterprompt)
- [ ] **Upsell-Preise & Laufzeiten bestätigen** (`config/upsells.ts`): aktuelle Platzhalter — SEO-Abo 49 €/M, Stadtteil-Seiten 299 € einmalig, Bewertungs-System 149 € + 19 €/M, Konkurrenz-Radar 29 €/M, Saison-Kampagnen 39 €/M, GBP-Einrichtung 199 €. Laufzeiten aktuell 1/1/1 (monatlich kündbar) — bewusst kundenfreundlich, kannst du auf z. B. 12/12/1 ändern
- [ ] **KICKOFF_MODE entscheiden** (`auto` oder `call`, Env-Var): steuert, ob der Kickoff-Touchpoint automatisch läuft oder du persönlich anrufst. Ohne Env-Var: `auto`

## Später (vor Kunden-Go-Live)
- [ ] AGB / Vertragswerk vom Anwalt prüfen lassen (24/24/3-Konditionen)
- [ ] Golden-Set: 5–10 echte Firmen für Pipeline-Tests benennen
- [ ] Registrar-Zugang (Domains für Kunden), Google Business Profile API, Ads-Konto-Zugang
- [ ] Firecrawl-API-Key (`FIRECRAWL_API_KEY`) — alternativ bleibt eigener Scraper
- [ ] Google-Places-API-Key (`GOOGLE_PLACES_API_KEY`, Places API New) — liefert Adresse, Telefon, Öffnungszeiten + echte Bewertungen für Library-Demos; ohne Key läuft die Pipeline ohne diese Daten
- [ ] **Stock-Assets lizenzieren/hochladen**: aktuelle Seeds sind Unsplash-Platzhalter; Friseur hat noch keine branchenspezifischen Bilder (nutzt universelle Platzhalter)
