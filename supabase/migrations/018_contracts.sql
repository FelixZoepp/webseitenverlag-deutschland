-- 018: Verträge (24/24/3) + manuelle Aufgaben (Phase E, Mission §6/§9)
--
-- contracts: Ein Vertrag pro Abschluss — Konditionen konfigurierbar,
--   Default 24 Monate Laufzeit / 24 Monate Verlängerung / 3 Monate Kündigungsfrist.
--   Stripe bleibt die Zahlungs-Quelle (subscription), der Vertrag die
--   rechtliche/kaufmännische Sicht (Laufzeit, Kündigung, Mahnwesen).
--
-- manual_tasks: Zero-Fulfillment-Ausnahmen. Alles, was die Maschine NICHT
--   automatisch erledigen konnte, landet hier sichtbar für den Admin
--   (z.B. Zugangsmail fehlgeschlagen, Mahnstufe eskaliert, Kündigung eingegangen).
--
-- Additiv, kein Drop. customer_contracts-Felder auf customers (005/010)
-- bleiben unberührt (Legacy-Closing-Pfad, siehe AUDIT).

CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  demo_id uuid REFERENCES demos(id) ON DELETE SET NULL,

  -- Konditionen
  paket text NOT NULL,
  monatsrate_cent int NOT NULL,
  waehrung text NOT NULL DEFAULT 'eur',
  laufzeit_monate int NOT NULL DEFAULT 24,
  verlaengerung_monate int NOT NULL DEFAULT 24,
  kuendigungsfrist_monate int NOT NULL DEFAULT 3,

  -- Laufzeit
  beginn date NOT NULL DEFAULT CURRENT_DATE,
  ende date NOT NULL,               -- Ende der aktuellen (ggf. verlängerten) Laufzeit
  status text NOT NULL DEFAULT 'AKTIV' CHECK (status IN ('AKTIV', 'GEKUENDIGT', 'BEENDET')),
  gekuendigt_am date,
  kuendigung_zum date,              -- wirksames Vertragsende nach 24/24/3-Regel

  -- Stripe-Verknüpfung
  stripe_customer_id text,
  stripe_subscription_id text,

  -- Mahnwesen
  mahnstufe int NOT NULL DEFAULT 0, -- 0 = alles bezahlt, 1 = Erinnerung, 2 = Mahnung, 3 = gesperrt
  zahlung_ueberfaellig_seit date,
  letzte_zahlung_am date,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contracts_customer ON contracts(customer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_stripe_sub ON contracts(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

CREATE TABLE IF NOT EXISTS manual_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  typ text NOT NULL,                -- z.B. MAIL_FEHLGESCHLAGEN, DUNNING_ESKALIERT, KUENDIGUNG, PROVISIONING_LUECKE, SONSTIGES
  status text NOT NULL DEFAULT 'OFFEN' CHECK (status IN ('OFFEN', 'ERLEDIGT', 'VERWORFEN')),
  titel text NOT NULL,
  beschreibung text,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE,
  demo_id uuid REFERENCES demos(id) ON DELETE SET NULL,
  quelle text,                      -- z.B. 'stripe-webhook', 'admin', 'cron'
  faellig_am date,
  erledigt_am timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_manual_tasks_status ON manual_tasks(status);
CREATE INDEX IF NOT EXISTS idx_manual_tasks_customer ON manual_tasks(customer_id);

-- Sperr-Flag für Kundenseiten (Dunning-Stufe 3 / Vertragsende)
ALTER TABLE sites ADD COLUMN IF NOT EXISTS gesperrt boolean NOT NULL DEFAULT false;

-- RLS: admin-only (Webhook/Cron laufen über Service-Role)
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage contracts" ON contracts
  FOR ALL
  USING (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage manual_tasks" ON manual_tasks
  FOR ALL
  USING (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'));
