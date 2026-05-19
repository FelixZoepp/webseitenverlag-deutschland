import { requireAdmin } from '@/lib/auth-helpers'
import { UPSELL_MODULES } from '@/lib/upsells'
import { NextResponse } from 'next/server'

// GET: Alle verfügbaren Upsell-Module für einen Kunden (mit Aktivierungs-Status)
export async function GET(
  _request: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const result = await requireAdmin()
    if (!result.ok) return result.response

    const { supabase } = result.data

    const { data: aktive } = await supabase
      .from('activated_upsells')
      .select('*')
      .eq('customer_id', params.customerId)
      .is('deaktiviert_am', null)

    const aktiveMap = new Map((aktive || []).map((a) => [a.upsell_id, a]))

    const upsellList = UPSELL_MODULES.map((m) => {
      const aktiv = aktiveMap.get(m.id)
      return {
        ...m,
        bereitsAktiv: !!aktiv,
        aktivierung: aktiv || null,
      }
    })

    return NextResponse.json(upsellList)
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
