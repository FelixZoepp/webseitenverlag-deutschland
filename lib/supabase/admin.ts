/**
 * Service-Role-Client für serverseitige Schreibzugriffe, die RLS umgehen
 * müssen (upsell_orders-Inserts aus Kunden-Routen, Webhook-Provisioning).
 * NIE in Client-Komponenten importieren.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function createAdminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
