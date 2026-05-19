import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, response: NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 }) }

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!customer || customer.role !== 'admin') {
    return { ok: false as const, response: NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 }) }
  }

  return { ok: true as const, data: { user, customer, supabase } }
}

export async function getUserRole(supabaseClient: ReturnType<typeof createClient>, userId: string): Promise<'admin' | 'customer' | null> {
  const { data } = await supabaseClient
    .from('customers')
    .select('role')
    .eq('user_id', userId)
    .single()
  return data?.role || null
}
