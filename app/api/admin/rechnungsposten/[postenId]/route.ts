import { requireAdmin } from '@/lib/auth-helpers'
import { NextResponse } from 'next/server'

// PATCH: Posten als extern übertragen markieren
export async function PATCH(
  request: Request,
  { params }: { params: { postenId: string } }
) {
  try {
    const result = await requireAdmin()
    if (!result.ok) return result.response

    const { supabase } = result.data
    const body = await request.json()

    const { error } = await supabase
      .from('rechnungs_posten')
      .update({
        extern_uebertragen: true,
        extern_ref: body.externRef || null,
      })
      .eq('id', params.postenId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
