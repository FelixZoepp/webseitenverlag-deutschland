# WARTELISTE — Dinge, die Felix erledigen/entscheiden muss

Blockiert nicht die Entwicklung, aber nötig für Go-Live.

## Sofort (für aktuellen Stand)
- [ ] **Migrationen 013 + 014 in Supabase ausführen** (`supabase/migrations/013_demos.sql`, `014_stripe.sql`)
- [ ] **Vercel Env-Vars setzen**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] **Stripe-Webhook-Endpoint anlegen**: Dashboard → Webhooks → `https://<domain>/api/webhooks/stripe`, Event `checkout.session.completed`
- [ ] **Resend-Domain verifizieren** (für Zugangs-/Lead-Mails von eigener Domain)

## Entscheidungen
- [ ] **Landing-Kontaktformular-Empfänger**: Alt-Repo sendet an hartcodiertes `hendrik@hoffmann-wd.de` — wohin sollen Lead-Benachrichtigungen? (Phase B ersetzt das durch leads-Tabelle + Mail an dich)
- [ ] **Produktdomain festlegen** (für Host-Routing: PRODUKTDOMAIN.de = Marketing, app. = Portal, *. = Kundenseiten)
- [ ] **Stripe Live-Keys**: Wechsel von Test auf Live erst nach deiner Freigabe (Stop-Condition laut Masterprompt)

## Später (vor Kunden-Go-Live)
- [ ] AGB / Vertragswerk vom Anwalt prüfen lassen (24/24/3-Konditionen)
- [ ] Golden-Set: 5–10 echte Firmen für Pipeline-Tests benennen
- [ ] Registrar-Zugang (Domains für Kunden), Google Business Profile API, Ads-Konto-Zugang
- [ ] Firecrawl-API-Key (Phase D) — alternativ bleibt eigener Scraper
