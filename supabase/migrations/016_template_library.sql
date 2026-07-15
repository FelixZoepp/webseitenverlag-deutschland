-- ============================================================
-- 016: Template-Library — Sektions-Bausteine, Seiten-Kompositionen,
-- Stock-Assets (Mission §6/§7, Phase C)
--
-- Prinzip: Inhalt & Komposition in der DB, Präsentation im Code.
-- Seeding erfolgt über scripts/seed-library.ts (idempotent, upsert on key).
-- ============================================================

-- ------------------------------------------------------------
-- section_library: wiederverwendbare Sektions-Bausteine
-- 10-Sektionen-Storytelling-Skeleton (§2):
--   hero → trust_bar → problem → loesung → leistungen → prozess
--   → referenzen → ueber_uns → faq → kontakt_cta
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS section_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,                    -- z.B. 'hero.handwerk'
  section_type text NOT NULL,                  -- hero | trust_bar | problem | loesung | leistungen | prozess | referenzen | ueber_uns | faq | kontakt_cta
  branche text,                                -- NULL = universell einsetzbar
  stil text,                                   -- 'klar' | 'warm' | NULL = beide Stile
  name text NOT NULL,
  beschreibung text,
  content_schema jsonb NOT NULL DEFAULT '{}',  -- Felder, die die Generierungs-Pipeline füllen muss
  default_content jsonb NOT NULL DEFAULT '{}', -- Branchen-Platzhalter (Floskel-frei, §2)
  sort_hint int NOT NULL DEFAULT 0,            -- empfohlene Position im Skeleton (1–10)
  aktiv boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS section_library_type_idx ON section_library (section_type);
CREATE INDEX IF NOT EXISTS section_library_branche_idx ON section_library (branche);

-- ------------------------------------------------------------
-- library_pages: Seiten-Kompositionen (Branche × Stil)
-- sections = geordnetes Array: [{ "section_key": "...", "overrides": {...} }]
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS library_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,                    -- z.B. 'startseite.handwerk.klar'
  name text NOT NULL,
  branche text NOT NULL,                       -- Handwerk | Gastronomie | Friseur | Gesundheit | ...
  stil text NOT NULL,                          -- klar | warm
  seitentyp text NOT NULL DEFAULT 'startseite',-- startseite | leistungen | ueber-uns | kontakt | ...
  beschreibung text,
  sections jsonb NOT NULL DEFAULT '[]',
  aktiv boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS library_pages_branche_stil_idx ON library_pages (branche, stil);

-- ------------------------------------------------------------
-- stock_assets: Platzhalter-/Stock-Bilder pro Branche & Kategorie
-- (bis echte lizenzierte Assets in Storage liegen — siehe WARTELISTE)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,                    -- z.B. 'handwerk.hero.1'
  url text NOT NULL,
  alt_text text NOT NULL,
  branche text,                                -- NULL = universell
  kategorie text NOT NULL,                     -- hero | team | arbeit | ambiente | detail
  quelle text NOT NULL DEFAULT 'unsplash',     -- unsplash | eigen | lizenziert
  lizenz text,
  breite int,
  hoehe int,
  aktiv boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stock_assets_branche_kat_idx ON stock_assets (branche, kategorie);

-- ------------------------------------------------------------
-- RLS: Admin-only. Rendering/Pipeline liest serverseitig
-- (Service-Role bzw. Admin-Session) — kein anon-Zugriff nötig.
-- ------------------------------------------------------------
ALTER TABLE section_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage section_library" ON section_library
  FOR ALL
  USING (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage library_pages" ON library_pages
  FOR ALL
  USING (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage stock_assets" ON stock_assets
  FOR ALL
  USING (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'));
