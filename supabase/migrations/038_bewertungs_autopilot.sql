-- Bewertungs-Autopilot: automatische Review-Anfragen nach Kontaktformular-Eingang

-- Einstellungen pro Site
ALTER TABLE sites ADD COLUMN IF NOT EXISTS review_autopilot jsonb DEFAULT NULL;
-- Struktur: {
--   "enabled": true,
--   "delay_days": 14,
--   "google_review_url": "https://search.google.com/local/writereview?placeid=...",
--   "absender_name": "Pflegeservice Sabine Hirche",
--   "betreff": "Waren Sie zufrieden mit uns?",
--   "nachricht": "Vielen Dank für Ihr Vertrauen. Wir würden uns sehr über eine kurze Bewertung freuen."
-- }

-- Tracking-Tabelle für gesendete Review-Anfragen
CREATE TABLE IF NOT EXISTS review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL REFERENCES form_submissions(id) ON DELETE CASCADE,
  empfaenger_email text NOT NULL,
  empfaenger_name text,
  status text NOT NULL DEFAULT 'geplant',
  -- geplant = wartet auf Delay | gesendet = Mail raus | zufrieden = Ja geklickt | unzufrieden = Nein geklickt | fehler = Versand fehlgeschlagen
  faellig_am timestamptz NOT NULL,
  gesendet_am timestamptz,
  geoeffnet_am timestamptz,
  geklickt_am timestamptz,
  feedback_text text,
  fehler text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index für den Cron: fällige + noch nicht gesendete Requests
CREATE INDEX IF NOT EXISTS idx_review_requests_faellig
  ON review_requests (faellig_am)
  WHERE status = 'geplant';

-- Index für Dashboard: alle Requests einer Site
CREATE INDEX IF NOT EXISTS idx_review_requests_site
  ON review_requests (site_id, created_at DESC);

-- Unique: pro Submission nur eine Review-Anfrage
CREATE UNIQUE INDEX IF NOT EXISTS idx_review_requests_submission
  ON review_requests (submission_id);

-- RLS
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kunden sehen eigene Review-Requests"
  ON review_requests FOR SELECT
  USING (site_id IN (SELECT id FROM sites WHERE customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())));

CREATE POLICY "Service-Role kann alles"
  ON review_requests FOR ALL
  USING (true)
  WITH CHECK (true);
