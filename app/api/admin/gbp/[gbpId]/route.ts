/**
 * GBP-Ersteinrichtung (Upsell #2, va_manual): Status-Übergänge durch den VA/Admin.
 * OFFEN → IN_ARBEIT → ZUGRIFF_ERTEILT → FERTIG (oder ABGEBROCHEN).
 * Bei FERTIG wird die zugehörige upsell_order auf PROVISIONIERT gesetzt.
 */
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'

const ERLAUBTE_STATUS = ['OFFEN', 'IN_ARBEIT', 'ZUGRIFF_ERTEILT', 'FERTIG', 'ABGEBROCHEN'] as const

export async function PATCH(
  request: Request,
  { params }: { params: { gbpId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const { supabase } = auth.data

  const body = await request.json().catch(() => null)
  const status = typeof body?.status === 'string' ? body.status : null
  const notizen = typeof body?.notizen === 'string' ? body.notizen : undefined

  if (status && !ERLAUBTE_STATUS.includes(status as (typeof ERLAUBTE_STATUS)[number])) {
    return NextResponse.json({ error: 'Ungültiger Status' }, { status: 400 })
  }
  if (!status && notizen === undefined) {
    return NextResponse.json({ error: 'status oder notizen erforderlich' }, { status: 400 })
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (status) update.status = status
  if (notizen !== undefined) update.notizen = notizen

  const { data: setup, error } = await supabase
    .from('gbp_setups')
    .update(update)
    .eq('id', params.gbpId)
    .select('id, customer_id, status, manual_task_id')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // FERTIG → Order provisioniert + verknüpfte manual_task erledigen (best effort)
  if (status === 'FERTIG') {
    await supabase
      .from('upsell_orders')
      .update({ status: 'PROVISIONIERT', provisioniert_am: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('customer_id', setup.customer_id)
      .eq('product_key', 'gbp-einrichtung')
      .eq('status', 'BEZAHLT')
    if (setup.manual_task_id) {
      await supabase
        .from('manual_tasks')
        .update({ status: 'ERLEDIGT', erledigt_am: new Date().toISOString() })
        .eq('id', setup.manual_task_id)
    }
  }

  return NextResponse.json({ setup })
}
