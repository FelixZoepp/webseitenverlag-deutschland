-- ============================================================
-- 015: Leads — Eintragungen von der Marketing-Landing-Page
-- Ads → Landing → Lead in DB (Mission §1 Schritt 1)
-- ============================================================

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  firma text,
  email text NOT NULL,
  telefon text,
  website text,
  branche text,
  nachricht text,
  -- Attribution
  quelle text NOT NULL DEFAULT 'landing', -- landing | ads | manuell | ...
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  referrer text,
  landing_path text,
  -- Vertriebsstatus
  status text NOT NULL DEFAULT 'NEU', -- NEU | KONTAKTIERT | QUALIFIZIERT | TERMIN | GEWONNEN | VERLOREN
  demo_id uuid REFERENCES demos(id),
  converted_customer_id uuid REFERENCES customers(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads (email);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Nur Admins lesen/verwalten Leads; das öffentliche Formular schreibt
-- serverseitig über den Service-Role-Key (kein anon-Insert!)
CREATE POLICY "Admins can manage leads" ON leads
  FOR ALL
  USING (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'));
