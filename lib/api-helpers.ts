import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { SupabaseClient, User } from '@supabase/supabase-js'

interface AuthResult {
  user: User
  customer: Record<string, string>
  supabase: SupabaseClient
}

interface SiteResult extends AuthResult {
  site: Record<string, unknown>
}

export async function getAuthenticatedCustomer(): Promise<
  { ok: true; data: AuthResult } | { ok: false; response: NextResponse }
> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 }) }
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!customer) {
    return { ok: false, response: NextResponse.json({ error: 'Kein Kundenprofil' }, { status: 404 }) }
  }

  return { ok: true, data: { user, customer, supabase } }
}

export async function getOwnedSite(siteId: string): Promise<
  { ok: true; data: SiteResult } | { ok: false; response: NextResponse }
> {
  const authResult = await getAuthenticatedCustomer()
  if (!authResult.ok) return authResult

  const { customer, supabase } = authResult.data

  const { data: site } = await supabase
    .from('sites')
    .select('*')
    .eq('id', siteId)
    .eq('customer_id', customer.id)
    .single()

  if (!site) {
    return { ok: false, response: NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 }) }
  }

  return { ok: true, data: { ...authResult.data, site } }
}
