-- AGB-Akzeptanz-Timestamp: Dokumentiert wann und welche AGB-Version der Kunde akzeptiert hat.
-- Pflicht für Chargeback-Verteidigung und §3(3) AGB v1.1.

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS agb_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS agb_version text;

COMMENT ON COLUMN customers.agb_accepted_at IS 'Zeitpunkt der AGB-Zustimmung im Stripe-Checkout';
COMMENT ON COLUMN customers.agb_version IS 'AGB-Fassung zum Zeitpunkt der Zustimmung (z.B. 1.1)';
