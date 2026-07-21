-- Phase 5 (§6.2): Idempotente Stripe-Webhooks über Event-IDs.
-- Additiv: neue Tabelle, keine bestehenden Strukturen verändert.
-- Jedes verarbeitete Stripe-Event wird hier mit seiner Event-ID abgelegt;
-- ein erneut zugestelltes Event (Stripe-Retry) wird ohne Seiteneffekt beantwortet.

CREATE TABLE IF NOT EXISTS processed_webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

-- Nur der Service-Role-Client (Webhook) schreibt/liest — kein öffentlicher Zugriff.
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE processed_webhook_events IS 'Stripe-Event-IDs, die bereits verarbeitet wurden (Webhook-Idempotenz, Phase 5).';
