-- MVP-Finish §3 (Phase 2): Asset-System — additive Spalten für das Slot-System.
--
-- aspect_ratio: deklariertes Seitenverhältnis des Assets ('16:9' | '4:3' | '3:4' | '1:1')
--   — Grundlage für den Aspect-Filter in assignAssets (±5 %). Backfill aus breite/hoehe.
-- alt_text_de: deutscher Alt-Text (vorbefüllt beim Seeding, Mensch korrigiert in /admin/assets).

ALTER TABLE asset_bank ADD COLUMN IF NOT EXISTS aspect_ratio text;
ALTER TABLE asset_bank ADD COLUMN IF NOT EXISTS alt_text_de text;

-- Backfill: bekannte Ratios aus breite/hoehe ableiten (±5 % Toleranz wie im Zuweiser)
UPDATE asset_bank SET aspect_ratio = ratio.wert
FROM (
  VALUES ('16:9', 16.0/9.0), ('4:3', 4.0/3.0), ('3:4', 3.0/4.0), ('1:1', 1.0)
) AS ratio(wert, zahl)
WHERE asset_bank.aspect_ratio IS NULL
  AND asset_bank.breite IS NOT NULL AND asset_bank.hoehe IS NOT NULL AND asset_bank.hoehe > 0
  AND abs((asset_bank.breite::float / asset_bank.hoehe::float) - ratio.zahl) / ratio.zahl <= 0.05;

CREATE INDEX IF NOT EXISTS idx_asset_bank_aspect ON asset_bank (aspect_ratio);
