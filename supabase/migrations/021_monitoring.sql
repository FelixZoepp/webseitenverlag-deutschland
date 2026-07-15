-- 021: Phase H — Monitoring & Kosten-Erfassung (§12)
--
-- nutzungs_events: jedes kostenpflichtige Ereignis der Pipeline
--   (Claude-Tokens, Firecrawl-Scrapes, Places-Lookups). Geschrieben nur
--   serverseitig (Service-Role, lib/nutzung.ts), gelesen vom täglichen
--   kosten-summary-Cron (Slack #money) und von Admins.
--
-- Additiv, kein Drop.

CREATE TABLE IF NOT EXISTS nutzungs_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  typ text NOT NULL CHECK (typ IN ('claude_tokens', 'firecrawl_scrape', 'places_lookup')),
  tokens_input int NOT NULL DEFAULT 0,   -- nur bei typ = 'claude_tokens'
  tokens_output int NOT NULL DEFAULT 0,  -- nur bei typ = 'claude_tokens'
  kontext text,                          -- z. B. 'library-demo', 'chat-editor', 'seo-plan'
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nutzungs_events_created ON nutzungs_events(created_at);
CREATE INDEX IF NOT EXISTS idx_nutzungs_events_typ ON nutzungs_events(typ);

-- RLS: Schreiben nur Service-Role (umgeht RLS), Lesen nur Admins.
ALTER TABLE nutzungs_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view nutzungs_events" ON nutzungs_events
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'));
