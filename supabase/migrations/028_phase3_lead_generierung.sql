-- ============================================================
-- 028: MVP-Finish Phase 3 — Lead-Formular, Generierungs-Jobs,
--      Mensch-Gate (MVP_FINISH_PROMPT §4). Additiv, kein Drop.
-- ============================================================

-- Geschäftsprofil aus dem 2-Minuten-Formular (/admin/leads/neu).
-- Bewusst eigene Tabelle statt leads-Spalten: das Formular ist die
-- EINZIGE Datenquelle der Generierung (§4.1) und bleibt versionierbar.
CREATE TABLE IF NOT EXISTS business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  firma text NOT NULL,
  branche_key text NOT NULL,        -- branchen_profile.branche_key (nur approved generierbar)
  stadt text NOT NULL,
  telefon text NOT NULL,
  leistungen jsonb NOT NULL,        -- string[] (3–8 Einträge, §4.1)
  usps jsonb,                       -- string[] optional
  oeffnungszeiten jsonb,            -- string[] optional
  notizen text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS business_profiles_lead_idx ON business_profiles (lead_id);

ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins verwalten business_profiles" ON business_profiles;
CREATE POLICY "Admins verwalten business_profiles" ON business_profiles
  FOR ALL
  USING (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'));

-- Generierungs-Jobs: jeder Ein-Klick-Lauf wird protokolliert.
-- status: laufend | demo_erstellt | demo_bereit | failed
-- fehler_grund: MENSCHENLESBAR (§4.2 — "failed mit lesbarem Grund")
CREATE TABLE IF NOT EXISTS generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  business_profile_id uuid REFERENCES business_profiles(id) ON DELETE SET NULL,
  demo_id uuid REFERENCES demos(id) ON DELETE SET NULL,
  site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'laufend'
    CHECK (status IN ('laufend', 'demo_erstellt', 'demo_bereit', 'failed')),
  fehler_grund text,
  kosten_cent int NOT NULL DEFAULT 0,   -- §4.5: Kosten pro Generierung in Cent
  copy_versuche int NOT NULL DEFAULT 0, -- Claude-Durchläufe (max 3 = 1 + 2 Retries)
  validator_report jsonb,               -- letzter Konsistenz-Validator-Report
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS generation_jobs_status_idx ON generation_jobs (status);
CREATE INDEX IF NOT EXISTS generation_jobs_lead_idx ON generation_jobs (lead_id);
CREATE INDEX IF NOT EXISTS generation_jobs_created_idx ON generation_jobs (created_at DESC);

ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins verwalten generation_jobs" ON generation_jobs;
CREATE POLICY "Admins verwalten generation_jobs" ON generation_jobs
  FOR ALL
  USING (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'));

-- Mensch-Gate (§4.4): erst die Checkbox "Demo geprüft" schaltet demo_bereit.
ALTER TABLE demos ADD COLUMN IF NOT EXISTS demo_bereit boolean NOT NULL DEFAULT false;
ALTER TABLE demos ADD COLUMN IF NOT EXISTS geprueft_von uuid REFERENCES auth.users(id);
ALTER TABLE demos ADD COLUMN IF NOT EXISTS geprueft_am timestamptz;
ALTER TABLE demos ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES sites(id) ON DELETE SET NULL;

COMMENT ON COLUMN demos.demo_bereit IS 'Mensch-Gate §4.4: Admin hat die Demo geprüft und freigegeben';
COMMENT ON COLUMN demos.site_id IS 'Zur Demo gehörende Site (status=demo, Subdomain-Auslieferung)';
