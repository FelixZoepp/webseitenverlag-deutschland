-- ============================================================
-- 011: Bild-Upload-System für Kunden-Webseiten
-- ============================================================

CREATE TABLE IF NOT EXISTS kunden_bilder (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  slot_id text,                    -- z.B. 'hero', 'team-1' (nach KI-Zuordnung)
  dateiname text NOT NULL,
  storage_path text NOT NULL,      -- Pfad in Supabase Storage
  public_url text NOT NULL,
  mime_type text NOT NULL,
  groesse_bytes int,
  ki_zuordnung text,               -- KI-Vorschlag welcher Slot
  ki_confidence float,             -- Konfidenz 0-1
  manuell_zugeordnet boolean DEFAULT false,
  uploaded_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kunden_bilder_customer ON kunden_bilder(customer_id);
CREATE INDEX IF NOT EXISTS idx_kunden_bilder_site ON kunden_bilder(site_id);

-- RLS
ALTER TABLE kunden_bilder ENABLE ROW LEVEL SECURITY;

-- Admins: voller Zugriff
CREATE POLICY "Admins can manage all images" ON kunden_bilder
  FOR ALL USING (
    EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Kunden: eigene Bilder verwalten
CREATE POLICY "Customers can view own images" ON kunden_bilder
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Customers can insert own images" ON kunden_bilder
  FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Customers can update own images" ON kunden_bilder
  FOR UPDATE USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Customers can delete own images" ON kunden_bilder
  FOR DELETE USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- Storage Bucket wird per Supabase Dashboard oder API erstellt
-- Bucket: kundenbilder (public)
-- Policies: authenticated users können in ihren Ordner (customer_id/) hochladen
