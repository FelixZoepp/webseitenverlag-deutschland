import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'

/** Verträge (Konditionen je Vertragszeile) + offene manuelle Aufgaben für die Admin-Sicht. */
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const { supabase } = auth.data

  const [contractsRes, tasksRes] = await Promise.all([
    supabase
      .from('contracts')
      .select(
        'id, paket, monatsrate_cent, beginn, ende, status, gekuendigt_am, kuendigung_zum, mahnstufe, zahlung_ueberfaellig_seit, letzte_zahlung_am, laufzeit_monate, verlaengerung_monate, kuendigungsfrist_monate, stripe_subscription_id, created_at, customers(id, company_name, contact_email)'
      )
      .order('created_at', { ascending: false }),
    supabase
      .from('manual_tasks')
      .select(
        'id, typ, status, titel, beschreibung, customer_id, contract_id, quelle, faellig_am, created_at'
      )
      .eq('status', 'OFFEN')
      .order('created_at', { ascending: false }),
  ])

  if (contractsRes.error) {
    return NextResponse.json({ error: contractsRes.error.message }, { status: 500 })
  }
  if (tasksRes.error) {
    return NextResponse.json({ error: tasksRes.error.message }, { status: 500 })
  }

  return NextResponse.json({
    contracts: contractsRes.data ?? [],
    tasks: tasksRes.data ?? [],
  })
}
