import { requireAdmin } from '@/lib/auth-helpers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const result = await requireAdmin()
    if (!result.ok) return result.response

    const { supabase } = result.data
    const { data } = await supabase
      .from('sites')
      .select('*, customers!inner(company_name, contact_email)')
      .order('created_at', { ascending: false })

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
