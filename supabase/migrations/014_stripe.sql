-- ============================================================
-- 014: Stripe-Integration — Payment Link → Auto-Provisioning
-- ============================================================

-- Stripe-Referenzen am Kunden
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Payment-Link-Daten an der Demo
ALTER TABLE demos ADD COLUMN IF NOT EXISTS paket text; -- starter | business | growth
ALTER TABLE demos ADD COLUMN IF NOT EXISTS checkout_session_id text;
ALTER TABLE demos ADD COLUMN IF NOT EXISTS payment_link_url text;

CREATE INDEX IF NOT EXISTS demos_checkout_session_idx ON demos (checkout_session_id);
CREATE INDEX IF NOT EXISTS customers_stripe_customer_idx ON customers (stripe_customer_id);
