-- ============================================================
-- 012: Onboarding-Flow Erweiterung
-- ============================================================

-- Onboarding-Status
DO $$ BEGIN
  CREATE TYPE onboarding_status AS ENUM (
    'AUSSTEHEND', 'EINGELOGGT', 'MATERIAL_HOCHGELADEN',
    'CALL_DURCHGEFUEHRT', 'WEBSEITE_FERTIG', 'FREIGEGEBEN'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Build-Status
DO $$ BEGIN
  CREATE TYPE build_status AS ENUM ('WARTEND', 'IN_BEARBEITUNG', 'FERTIG', 'FEHLER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Onboarding-Felder
ALTER TABLE customers ADD COLUMN IF NOT EXISTS onboarding_status onboarding_status DEFAULT 'AUSSTEHEND';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS onboarding_termin_am timestamptz;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS onboarding_calendly_id text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pre_call_briefing_url text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pre_call_briefing_at timestamptz;

-- Build-Felder
ALTER TABLE customers ADD COLUMN IF NOT EXISTS build_status build_status DEFAULT 'WARTEND';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS build_gestartet_am timestamptz;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS build_fertig_am timestamptz;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS build_fehler text;

-- Freigabe
ALTER TABLE customers ADD COLUMN IF NOT EXISTS webseite_freigegeben_am timestamptz;
