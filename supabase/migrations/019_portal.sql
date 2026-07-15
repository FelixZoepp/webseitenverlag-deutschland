-- 019: Portal-Phase F — Fertigstellungs-Wizard + Upsell-Bestellungen (§10)
--
-- upsell_orders: Eine Zeile pro Upsell-/Upgrade-Buchung. Der Stripe-Webhook
--   (metadata.product_key) setzt status und legt bei Erfolg einen eigenen
--   contracts-Eintrag mit eigener Laufzeit an (§10.4). fulfillment 'auto'
--   provisioniert sofort, 'va_manual' erzeugt eine manual_task.
--
-- sites: Wizard-/Fertigstellungs-Felder (§10.1). noindex bleibt true, bis der
--   Kunde "Website fertigstellen" klickt und die Auto-QA durch ist.
--   pflichtangaben speichert das Impressums-Formular (Quelle für generierte
--   Rechtstexte). wizard_status hält den Fortschritt der 6 Schritte.
--
-- Additiv, kein Drop. Versionierung/Rollback läuft weiter über config_versions
-- (001) — kein neues site_versions nötig. Nerv-Schutz nutzt upsell_rejections
-- (008) mit retry_after (60 Tage, gesetzt im Code).

CREATE TABLE IF NOT EXISTS upsell_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  site_id uuid REFERENCES sites(id) ON DELETE SET NULL,

  product_key text NOT NULL,        -- Schlüssel aus config/upsells.ts (bzw. 'plan-upgrade:<tier>')
  fulfillment text NOT NULL DEFAULT 'auto' CHECK (fulfillment IN ('auto', 'va_manual')),
  einmal_cent int NOT NULL DEFAULT 0,
  monat_cent int NOT NULL DEFAULT 0,

  status text NOT NULL DEFAULT 'OFFEN' CHECK (status IN ('OFFEN', 'BEZAHLT', 'PROVISIONIERT', 'ABGEBROCHEN')),
  quelle text,                      -- Touchpoint: wizard, editor-gate, portal, admin, cron

  -- Stripe-Verknüpfung
  stripe_checkout_session_id text,
  stripe_subscription_id text,

  -- Eigener Vertrag je Buchung (§10.4) — bei rein einmaligen Produkten null
  contract_id uuid REFERENCES contracts(id) ON DELETE SET NULL,

  provisioniert_am timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_upsell_orders_customer ON upsell_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_upsell_orders_session ON upsell_orders(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_upsell_orders_status ON upsell_orders(status);

-- Wizard-/Fertigstellungs-Felder (§10.1)
ALTER TABLE sites ADD COLUMN IF NOT EXISTS noindex boolean NOT NULL DEFAULT true;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS fertiggestellt_am timestamptz;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS wizard_status jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS pflichtangaben jsonb;

-- RLS: Kunden sehen eigene Bestellungen, Admins alles; Schreiben nur
-- Admin/Service-Role (Checkout-Route + Webhook laufen serverseitig).
ALTER TABLE upsell_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own upsell_orders" ON upsell_orders
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM customers WHERE customers.id = upsell_orders.customer_id AND customers.user_id = auth.uid()));

CREATE POLICY "Admins can manage upsell_orders" ON upsell_orders
  FOR ALL
  USING (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'));
