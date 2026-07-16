-- 026: Support-Sammelsystem (B1)
-- Zentraler Ort für alle Kundenfragen. Additiv, kein Drop.

CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid REFERENCES customers(id),
  site_id uuid REFERENCES sites(id),
  typ text NOT NULL DEFAULT 'allgemein',
  betreff text NOT NULL,
  nachricht text NOT NULL,
  status text NOT NULL DEFAULT 'offen' CHECK (status IN ('offen', 'in_bearbeitung', 'erledigt')),
  prioritaet text NOT NULL DEFAULT 'normal' CHECK (prioritaet IN ('niedrig', 'normal', 'hoch')),
  quelle text DEFAULT 'chat',
  kontext jsonb,
  antwort text,
  bearbeitet_von uuid,
  bearbeitet_am timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kunden sehen eigene Tickets" ON support_tickets
  FOR SELECT USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));
CREATE POLICY "Kunden erstellen Tickets" ON support_tickets
  FOR INSERT WITH CHECK (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));
CREATE POLICY "Admin sieht alle Tickets" ON support_tickets
  FOR ALL USING (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Service-Role" ON support_tickets
  FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE support_tickets IS 'Zentrales Support-Sammelsystem (B1)';
