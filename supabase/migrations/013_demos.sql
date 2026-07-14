-- ============================================================
-- 013: Demo-System — 1-Klick Sales-Demos für Prospects
-- ============================================================

CREATE TABLE IF NOT EXISTS demos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_name text NOT NULL,
  prospect_website text,
  branche text,
  template_id text NOT NULL,
  config jsonb,
  scraped_data jsonb,
  share_token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'GENERIERT', -- GENERIERT | VERSENDET | CONVERTED | ABGELAUFEN
  notes text,
  view_count integer NOT NULL DEFAULT 0,
  last_viewed_at timestamptz,
  converted_customer_id uuid REFERENCES customers(id),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS demos_share_token_idx ON demos (share_token);
CREATE INDEX IF NOT EXISTS demos_created_at_idx ON demos (created_at DESC);

ALTER TABLE demos ENABLE ROW LEVEL SECURITY;

-- Nur Admins verwalten Demos; öffentlicher Zugriff läuft serverseitig über den Service-Role-Key
CREATE POLICY "Admins can manage demos" ON demos
  FOR ALL
  USING (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'));
