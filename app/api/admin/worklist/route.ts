/**
 * Admin-Worklist (Phase G §11): alles, was der VA/Admin manuell abarbeitet —
 * offene manual_tasks + laufende GBP-Ersteinrichtungen (Upsell #2).
 */
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const { supabase } = auth.data

  const [{ data: tasks }, { data: gbp }] = await Promise.all([
    supabase
      .from('manual_tasks')
      .select('id, typ, status, titel, beschreibung, customer_id, contract_id, quelle, faellig_am, created_at')
      .eq('status', 'OFFEN')
      .order('created_at', { ascending: true }),
    supabase
      .from('gbp_setups')
      .select('id, customer_id, site_id, status, daten, notizen, created_at, updated_at, customers(company_name, contact_email)')
      .not('status', 'in', '("FERTIG","ABGEBROCHEN")')
      .order('created_at', { ascending: true }),
  ])

  return NextResponse.json({ tasks: tasks || [], gbp: gbp || [] })
}
