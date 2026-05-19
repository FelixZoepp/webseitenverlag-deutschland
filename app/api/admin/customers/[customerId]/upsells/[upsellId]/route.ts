import { requireAdmin } from '@/lib/auth-helpers'
import { activateUpsellForCustomer, deactivateUpsellForCustomer } from '@/lib/upsell-orchestrator'
import { NextResponse } from 'next/server'

// POST: Upsell aktivieren
export async function POST(
  request: Request,
  { params }: { params: { customerId: string; upsellId: string } }
) {
  try {
    const result = await requireAdmin()
    if (!result.ok) return result.response

    const { supabase } = result.data
    const body = await request.json().catch(() => ({}))
    const config = body.config || {}

    const activation = await activateUpsellForCustomer(
      supabase,
      params.customerId,
      params.upsellId,
      config
    )

    if (!activation.success) {
      return NextResponse.json({ error: activation.fehler }, { status: 400 })
    }

    return NextResponse.json(activation)
  } catch (err) {
    console.error('Upsell activation error:', err)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

// DELETE: Upsell deaktivieren
export async function DELETE(
  _request: Request,
  { params }: { params: { customerId: string; upsellId: string } }
) {
  try {
    const result = await requireAdmin()
    if (!result.ok) return result.response

    const { supabase } = result.data

    const deactivation = await deactivateUpsellForCustomer(
      supabase,
      params.customerId,
      params.upsellId
    )

    if (!deactivation.success) {
      return NextResponse.json({ error: deactivation.fehler }, { status: 400 })
    }

    return NextResponse.json(deactivation)
  } catch (err) {
    console.error('Upsell deactivation error:', err)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
