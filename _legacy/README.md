# _legacy — Stillgelegter Code (Mission v2, Phase B)

Nicht gelöscht, sondern geparkt (Regel §0 Masterprompt). Vom Build ausgeschlossen (`tsconfig.json` exclude, außerhalb `app/`).

| Datei/Ordner | War | Ersetzt durch |
|---|---|---|
| `lib/docusign.ts` | DocuSign-Envelope-Erstellung (JWT) | Stripe Checkout (`lib/stripe.ts`) |
| `lib/vertrag-emails.ts` | Angebots-/Onboarding-Mails mit DocuSign-Links | Zugangsmail via `lib/email.ts` (Stripe-Webhook); neue Vertrags-Mails in Phase E |
| `lib/pdf/sepa-mandat.ts` | SEPA-Mandat-PDF | Stripe zieht selbst ein |
| `lib/defaults.ts` | Nirgends importiert (tot) | — |
| `scripts/migrate-to-multipage.ts` | Einmal-Migrationsskript | erledigt |
| `app/api/webhooks/docusign/` | DocuSign-Webhook (signiert → Vertrag aktiv) | `app/api/webhooks/stripe/` |
| `app/api/admin/vertraege/` | Alter Vertragsabschluss (Angebot-PDF, SEPA, DocuSign, IBAN) | Demo → Payment-Link → Auto-Provisioning |
| `app/admin/customers/new/` | Manueller Kunden-Anlage-Wizard mit IBAN-Eingabe | Demo-Maschine (`/admin/demos`) + Stripe-Webhook legt Kunden an |
| `components/upgrade-checkout.tsx` | Alter Upgrade-Katalog (11 erfundene Module, 48-Monats-Vertrag, Fake-Testimonials) | `/dashboard/[siteId]/erweiterungen` auf Basis `config/upsells.ts` + Stripe-Checkout (Phase G) |
| `lib/upsell-orchestrator.ts` | Alter Aktivierungs-Flow (activate/deactivate gegen `activated_upsells` + Payment-Stub) — AUDIT R5 | Stripe-Webhook schaltet nach Zahlung frei (`upsell_orders` → `contracts` `upsell:<key>` → `activated_upsells`-Upsert), Phase H |
| `lib/payment.ts` | PaymentProvider-Stub, schrieb `rechnungs_posten`-Ledger | Stripe-Subscriptions (eigener Vertrag je Upsell-Buchung); `rechnungs_posten`-Ansichten bleiben lesend für Altdaten |
| `lib/upsell-emails.ts` | Aktivierungs-Bestätigungsmail des alten Flows | Stripe/Portal-Mails des neuen Kaufwegs (Phase E/G) |
| `app/api/admin/customers/[customerId]/upsells/[upsellId]/` | POST/DELETE-Aktivierung via Orchestrator + Invite-Mail mit totem `/dashboard/[siteId]/upgrade`-Link | Zahlungslink-Panel (`/api/admin/upsell-payment-link`) + Portal-Buchung; Katalog-GET-Route zeigt Kauf-Status aus `upsell_orders` (Phase H) |

Zugehörige tote Env-Vars: `DOCUSIGN_*`, `QONTO_API_ACTIVE`, `EASYBILL_API_ACTIVE` (Flags aus `lib/feature-flags.ts` entfernt).

Hinweis: Migration `010_vertragsabschluss.sql` bleibt in der DB (additiv-Regel). Die `contracts`-Neumodellierung (24/24/3) kommt in Phase E als neue Migration.
