-- Feedback-Runden & Abnahmefiktion (Masterplan Phase 4).
-- Tracks structured feedback rounds (3 inklusive, dann kostenpflichtig)
-- and auto-approval deadline (7 Werktage nach Fristsetzung → abgenommen).

ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS feedback_runde smallint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS feedback_max_runden smallint DEFAULT 3,
  ADD COLUMN IF NOT EXISTS feedback_frist_gesetzt_am timestamptz,
  ADD COLUMN IF NOT EXISTS feedback_auto_freigabe_am timestamptz,
  ADD COLUMN IF NOT EXISTS build_uebergeben_am timestamptz;

COMMENT ON COLUMN sites.feedback_runde IS 'Aktuelle Feedback-Runde (0 = noch kein Feedback, 1-3 = inklusive Runden)';
COMMENT ON COLUMN sites.feedback_max_runden IS 'Maximale inklusive Feedback-Runden (Standard: 3)';
COMMENT ON COLUMN sites.feedback_frist_gesetzt_am IS 'Zeitpunkt der letzten Fristsetzung für Abnahmefiktion';
COMMENT ON COLUMN sites.feedback_auto_freigabe_am IS 'Berechneter Zeitpunkt der Auto-Freigabe (7 Werktage nach Fristsetzung)';
COMMENT ON COLUMN sites.build_uebergeben_am IS 'Wann der Build dem Kunden zur Review übergeben wurde';

-- Feedback-Einträge: Jede Runde wird mit Inhalt und Ergebnis dokumentiert.
CREATE TABLE IF NOT EXISTS site_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  runde smallint NOT NULL,
  feedback_text text NOT NULL,
  status text NOT NULL DEFAULT 'EINGEGANGEN'
    CHECK (status IN ('EINGEGANGEN', 'IN_BEARBEITUNG', 'UMGESETZT', 'ABGELEHNT')),
  revision_beschreibung text,
  erstellt_am timestamptz DEFAULT now(),
  umgesetzt_am timestamptz,
  created_by text DEFAULT 'customer'
);

CREATE INDEX IF NOT EXISTS idx_site_feedback_site ON site_feedback(site_id);
