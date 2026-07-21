-- Baustein C §C.1: Frozen Composition für Starter (99 €).
-- Pro Branche EINE fixe Komposition: Sektionen, Reihenfolge und Theme-Preset
-- liegen fest. Nur additiv (§0): neue Spalte mit Default, kein Drop.
ALTER TABLE library_pages ADD COLUMN IF NOT EXISTS frozen boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN library_pages.frozen IS
  'Frozen Composition (Baustein C §C.1): true = fixe Starter-Komposition der Branche. Struktur/Reihenfolge/Preset unveränderlich — Texte werden trotzdem pro Kunde personalisiert.';
