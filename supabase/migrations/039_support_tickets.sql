-- Support-Ticket-System: Kunden-Bot eskaliert zu Tickets

CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  betreff text NOT NULL,
  status text NOT NULL DEFAULT 'offen',
  -- offen | in_bearbeitung | geloest | geschlossen
  prioritaet text NOT NULL DEFAULT 'normal',
  -- niedrig | normal | hoch | kritisch
  kategorie text,
  -- domain | zahlung | editor | seite_offline | kuendigung | dsgvo | sonstiges
  letzter_absender text NOT NULL DEFAULT 'kunde',
  -- kunde | admin
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  absender text NOT NULL DEFAULT 'kunde',
  -- kunde | admin | bot
  inhalt text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_customer ON support_tickets (customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status) WHERE status IN ('offen', 'in_bearbeitung');
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON support_messages (ticket_id, created_at);

-- RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kunden sehen eigene Tickets"
  ON support_tickets FOR SELECT
  USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

CREATE POLICY "Kunden erstellen Tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

CREATE POLICY "Service-Role Tickets"
  ON support_tickets FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Kunden sehen eigene Nachrichten"
  ON support_messages FOR SELECT
  USING (ticket_id IN (SELECT id FROM support_tickets WHERE customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())));

CREATE POLICY "Kunden senden Nachrichten"
  ON support_messages FOR INSERT
  WITH CHECK (ticket_id IN (SELECT id FROM support_tickets WHERE customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())));

CREATE POLICY "Service-Role Messages"
  ON support_messages FOR ALL USING (true) WITH CHECK (true);
