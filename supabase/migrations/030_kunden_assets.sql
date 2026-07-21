-- 030: Phase 4 — Kunden-Uploads in der Asset-Bank (MVP-Finish §5.2)
--
-- Kunden-Bilder landen nach der Sharp-Pipeline als quelle='kunde' in asset_bank,
-- sind aber NUR für die eigene Site sichtbar. Dafür bekommt asset_bank eine
-- optionale site_id-Spalte:
--   - quelle='kunde'  → site_id PFLICHT (Scoping auf genau eine Site)
--   - alle anderen    → site_id bleibt NULL (Branchen-Bank, global)
--
-- Additiv, kein Drop. Der Generierungs-Lesepfad (lib/assets/repository.ts)
-- schließt quelle='kunde' explizit aus — Kundenbilder tauchen NIE in fremden
-- Demos/Sites auf.

ALTER TABLE asset_bank ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES sites(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_asset_bank_site ON asset_bank(site_id) WHERE site_id IS NOT NULL;

COMMENT ON COLUMN asset_bank.site_id IS
  'Nur bei quelle=kunde gesetzt: Kunden-Upload gehört genau dieser Site (Phase 4, §5.2).';
