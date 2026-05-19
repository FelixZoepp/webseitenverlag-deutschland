-- ============================================================
-- 010: Vertragsabschluss-System
-- Erweitert customers um Vertrags-, SEPA-, DocuSign-Felder
-- Neue Tabellen: kunden_dokumente, vertrags_timeline
-- ============================================================

-- Vertragsstatus-Typ
DO $$ BEGIN
  CREATE TYPE vertrags_status AS ENUM (
    'ENTWURF',
    'ANGEBOT_VERSENDET',
    'SIGNIERT',
    'SEPA_VORBEREITET',
    'SEPA_AKTIV',
    'ONBOARDING_GEBUCHT',
    'WEBSEITE_LIVE',
    'ZAHLUNG_AKTIV',
    'GEKUENDIGT',
    'STORNIERT'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Dokumenttyp-Typ
DO $$ BEGIN
  CREATE TYPE dokument_typ AS ENUM (
    'ANGEBOT_UNSIGNIERT',
    'ANGEBOT_SIGNIERT',
    'AGB_VERSION',
    'SEPA_MANDAT_UNSIGNIERT',
    'SEPA_MANDAT_SIGNIERT',
    'CALL_TRANSCRIPT',
    'ONBOARDING_TRANSCRIPT',
    'RECHNUNG',
    'SONSTIGES'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- customers: Vertrags-Felder
-- ============================================================

-- Vertragsstatus
ALTER TABLE customers ADD COLUMN IF NOT EXISTS vertrags_status vertrags_status DEFAULT 'ENTWURF';

-- Angebot
ALTER TABLE customers ADD COLUMN IF NOT EXISTS angebots_nummer text UNIQUE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS angebots_pdf_url text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS agb_version text;

-- Ansprechpartner & Adresse
ALTER TABLE customers ADD COLUMN IF NOT EXISTS ansprechpartner text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS telefon text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS strasse text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS plz text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS ort text;

-- Steuerlich
ALTER TABLE customers ADD COLUMN IF NOT EXISTS ust_id_nr text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS steuernummer text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS unternehmer_bestaetigt boolean DEFAULT false;

-- DocuSign
ALTER TABLE customers ADD COLUMN IF NOT EXISTS docusign_envelope_id text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS signatur_versendet_am timestamptz;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS signiert_am timestamptz;

-- Signierte Dokument-URLs
ALTER TABLE customers ADD COLUMN IF NOT EXISTS signiertes_angebot_url text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS signierte_agb_url text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS signiertes_mandat_url text;

-- Fireflies
ALTER TABLE customers ADD COLUMN IF NOT EXISTS fireflies_url text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS fireflies_call_id text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS fireflies_transkript text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS fireflies_notizen text;

-- SEPA-Mandat
ALTER TABLE customers ADD COLUMN IF NOT EXISTS mandats_referenz text UNIQUE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS iban_kunde text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS bic_kunde text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS glaeubiger_id text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS qonto_mandat_id text;

-- Closer
ALTER TABLE customers ADD COLUMN IF NOT EXISTS closer_name text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS closer_notiz text;

-- Onboarding
ALTER TABLE customers ADD COLUMN IF NOT EXISTS onboarding_termin_url text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS onboarding_erfolgt_am timestamptz;

-- Webseite & Zahlung
ALTER TABLE customers ADD COLUMN IF NOT EXISTS webseite_live_url text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS webseite_live_am timestamptz;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS erste_rate_faellig_am date;

-- Monatsrate in Cent (ergänzend zu monthly_price in Euro)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS monatsrate_cent int;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS werklohn_cent int;

-- ============================================================
-- kunden_dokumente: Dokumenten-Akte pro Kunde
-- ============================================================

CREATE TABLE IF NOT EXISTS kunden_dokumente (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  typ dokument_typ NOT NULL,
  dateiname text NOT NULL,
  speicher_url text NOT NULL,
  mime_type text NOT NULL DEFAULT 'application/pdf',
  signiert_am timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kunden_dokumente_customer ON kunden_dokumente(customer_id);

-- ============================================================
-- vertrags_timeline: Chronologische Ereignisse
-- ============================================================

CREATE TABLE IF NOT EXISTS vertrags_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  ereignis text NOT NULL,
  details text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vertrags_timeline_customer ON vertrags_timeline(customer_id);
CREATE INDEX IF NOT EXISTS idx_vertrags_timeline_zeit ON vertrags_timeline(customer_id, created_at DESC);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE kunden_dokumente ENABLE ROW LEVEL SECURITY;
ALTER TABLE vertrags_timeline ENABLE ROW LEVEL SECURITY;

-- Admins: voller Zugriff
CREATE POLICY "Admins can manage all documents" ON kunden_dokumente
  FOR ALL USING (
    EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage all timeline" ON vertrags_timeline
  FOR ALL USING (
    EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Kunden: eigene Dokumente lesen
CREATE POLICY "Customers can view own documents" ON kunden_dokumente
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- Kunden: eigene Timeline lesen
CREATE POLICY "Customers can view own timeline" ON vertrags_timeline
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- ============================================================
-- Angebotnummern-Sequenz
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS angebots_nummer_seq START 1;
