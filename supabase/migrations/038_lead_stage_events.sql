-- ============================================================
-- 038: CRM-Verlaufsprotokoll + Verlust-Grund
-- Jeder crm_stage-Wechsel wird geloggt (Marketing-Dashboard braucht
-- "Erstgespräche im Zeitraum" statt nur den aktuellen Stand).
-- Schreiben serverseitig via Service-Role (PATCH-Route + Stripe-Webhook).
-- ============================================================

CREATE TABLE IF NOT EXISTS lead_stage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  von_stage text,
  zu_stage text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_stage_events_lead_idx ON lead_stage_events (lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS lead_stage_events_zu_idx ON lead_stage_events (zu_stage, created_at DESC);

ALTER TABLE lead_stage_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins can read lead stage events" ON lead_stage_events
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Warum ging ein Lead verloren? (Pflichtabfrage im CRM beim Wechsel auf "verloren")
ALTER TABLE leads ADD COLUMN IF NOT EXISTS verloren_grund text;
