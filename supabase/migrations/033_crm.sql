-- ============================================================
-- 033: CRM — Vertriebs-Pipeline + Notizen pro Lead
-- Pipeline-Stages (Felix): neuer_lead → erstgespraech →
-- closing_terminiert → closing_no_show → closed | verloren.
-- Additiv: bestehendes leads.status (Generierungs-Flow) bleibt unberührt.
-- ============================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS crm_stage text NOT NULL DEFAULT 'neuer_lead';

DO $$ BEGIN
  ALTER TABLE leads ADD CONSTRAINT leads_crm_stage_check
    CHECK (crm_stage IN ('neuer_lead', 'erstgespraech', 'closing_terminiert', 'closing_no_show', 'closed', 'verloren'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS leads_crm_stage_idx ON leads (crm_stage);

-- Notizen-Log pro Lead (mehrere Einträge, neueste zuerst)
CREATE TABLE IF NOT EXISTS lead_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_notes_lead_idx ON lead_notes (lead_id, created_at DESC);

ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;

-- Nur Admins; Schreiben serverseitig via Service-Role (wie leads, 015)
DO $$ BEGIN
  CREATE POLICY "Admins can manage lead notes" ON lead_notes
    FOR ALL
    USING (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
