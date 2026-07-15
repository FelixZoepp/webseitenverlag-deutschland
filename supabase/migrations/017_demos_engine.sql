-- 017: Demos bekommen ein Engine-Feld (Phase D, Mission §8)
-- 'premium'  = bestehende Premium-Templates (renderPremiumTemplate)
-- 'library'  = Template-Library-Kompositionen (renderLibraryPage, Pipeline v2)
-- Additiv, kein Drop — Bestands-Demos bleiben 'premium'.

ALTER TABLE demos
  ADD COLUMN IF NOT EXISTS engine text NOT NULL DEFAULT 'premium';

COMMENT ON COLUMN demos.engine IS 'premium = Premium-Template-Renderer, library = Template-Library (Pipeline v2)';
