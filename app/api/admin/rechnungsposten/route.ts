import { requireAdmin } from '@/lib/auth-helpers'
import { NextResponse } from 'next/server'

// GET: Offene Rechnungsposten (noch nicht an Payment-Provider übertragen)
export async function GET() {
  try {
    const result = await requireAdmin()
    if (!result.ok) return result.response

    const { supabase } = result.data

    const { data, error } = await supabase
      .from('rechnungs_posten')
      .select('*, customers!inner(id, company_name, contact_email)')
      .eq('extern_uebertragen', false)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
