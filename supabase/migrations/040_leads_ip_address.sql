-- Rate-Limiting für Lead-API: IP-Adresse speichern
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ip_address text;
CREATE INDEX IF NOT EXISTS idx_leads_ip_recent ON leads (ip_address, created_at DESC);
