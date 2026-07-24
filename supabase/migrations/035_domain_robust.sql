-- 035: Domain-Setup robust — Apex/Subdomain-Erkennung, Vercel-API DNS-Werte,
-- Beide Varianten (apex + www), automatisches Polling (§11 Nachbesserung)
--
-- Neue Spalten:
--   ist_hauptdomain  → welche Domain kanonisch ist (apex vs. www)
--   dns_anforderungen → DNS-Records aus Vercel-API (JSON, nicht hardcoded)
--   dns_typ           → 'A' | 'CNAME' (automatisch erkannt)
--   partner_domain_id → Verknüpfung apex ↔ www-Pendant
--
-- Neuer Status DNS_ERKANNT (zwischen WARTET_AUF_DNS und AKTIV)
--
-- Additiv, kein Drop.

-- Apex/Subdomain-Erkennung
ALTER TABLE domains ADD COLUMN IF NOT EXISTS dns_typ text
  CHECK (dns_typ IN ('A', 'CNAME', 'AAAA'));

-- DNS-Anforderungen aus Vercel API (nie hardcoded)
ALTER TABLE domains ADD COLUMN IF NOT EXISTS dns_anforderungen jsonb;

-- Hauptdomain-Flag (apex vs. www)
ALTER TABLE domains ADD COLUMN IF NOT EXISTS ist_hauptdomain boolean NOT NULL DEFAULT false;

-- Verknüpfung zum Pendant (apex ↔ www)
ALTER TABLE domains ADD COLUMN IF NOT EXISTS partner_domain_id uuid REFERENCES domains(id) ON DELETE SET NULL;

-- Neuer Status DNS_ERKANNT
ALTER TABLE domains DROP CONSTRAINT IF EXISTS domains_status_check;
ALTER TABLE domains ADD CONSTRAINT domains_status_check
  CHECK (status IN ('BESTELLT', 'WARTET_AUF_DNS', 'DNS_ERKANNT', 'AKTIV', 'FEHLER'));
