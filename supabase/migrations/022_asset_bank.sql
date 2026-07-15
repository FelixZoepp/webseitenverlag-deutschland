-- 022: F1 Branchen-Fabrik — asset_bank (Masterprompt §6 + Branchen-Fabrik §5)
--
-- Kuratierte Bild- & Video-Bank, ersetzt perspektivisch stock_assets (AUDIT R2).
-- Jedes KI-Asset speichert Prompt + Seed (Reproduzierbarkeit) und Kosten in Cent.
-- Nur quality_status='approved' wird je in Demos/Live ausgespielt (Mensch prüft!).
--
-- Additiv, kein Drop. nutzungs_events-CHECK wird additiv um 'asset_generierung'
-- erweitert (Constraint neu setzen = bestehende Werte bleiben gültig, neue kommen dazu).

CREATE TABLE IF NOT EXISTS asset_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL,             -- Hauptdatei im Bucket asset-bank (WebP, größte Stufe)
  medium text NOT NULL DEFAULT 'image' CHECK (medium IN ('image', 'video')),
  branchen text[] NOT NULL,               -- z. B. {reinigung}
  style_tags text[],                      -- z. B. {hell, premium}
  szene_typ text,                         -- hero|vorher|nachher|detail|team|galerie|video_loop
  pair_id uuid,                           -- verknüpft Vorher/Nachher derselben Szene
  quelle text NOT NULL CHECK (quelle IN (
    'ai_higgsfield', 'ai_fal', 'ai_mock', 'stock', 'kunde',
    'demo_generiert', 'prospect_quarantaene'
  )),
  gen_prompt text,                        -- Reproduzierbarkeit bei KI-Assets
  gen_seed text,
  gen_job_id text,                        -- Provider-Job-ID (für Edit/referenceJobId)
  kosten_cent int NOT NULL DEFAULT 0,     -- Generierungskosten in Cent (BF §5)
  varianten jsonb,                        -- {webp:[{breite,pfad}], avif:[{breite,pfad}]} für srcset
  lizenz text, credit text,
  breite int, hoehe int,
  quality_status text NOT NULL DEFAULT 'draft'
    CHECK (quality_status IN ('draft', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_asset_bank_branchen ON asset_bank USING gin(branchen);
CREATE INDEX IF NOT EXISTS idx_asset_bank_pair ON asset_bank(pair_id) WHERE pair_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_asset_bank_status ON asset_bank(quality_status);
CREATE INDEX IF NOT EXISTS idx_asset_bank_szene ON asset_bank(szene_typ);

-- RLS: Schreiben nur Service-Role (umgeht RLS), Lesen/Kuratieren nur Admins.
ALTER TABLE asset_bank ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage asset_bank" ON asset_bank
  FOR ALL
  USING (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'));

-- nutzungs_events: Asset-Generierung als Kosten-Typ + Cent-Betrag (Kosten-Log je Call)
ALTER TABLE nutzungs_events ADD COLUMN IF NOT EXISTS kosten_cent int NOT NULL DEFAULT 0;

ALTER TABLE nutzungs_events DROP CONSTRAINT IF EXISTS nutzungs_events_typ_check;
ALTER TABLE nutzungs_events ADD CONSTRAINT nutzungs_events_typ_check
  CHECK (typ IN ('claude_tokens', 'firecrawl_scrape', 'places_lookup', 'asset_generierung'));

-- Storage-Bucket asset-bank (public read — Assets werden auf Kundenseiten ausgeliefert;
-- prospect_quarantaene-Dateien kommen später in einen eigenen privaten Bucket).
INSERT INTO storage.buckets (id, name, public)
VALUES ('asset-bank', 'asset-bank', true)
ON CONFLICT (id) DO NOTHING;
