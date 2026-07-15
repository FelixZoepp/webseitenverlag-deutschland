/**
 * Ads-Kampagne (Upsell #3): Status-Übergänge durch den Admin/VA.
 * ENTWURF → EINLADUNG_VERSENDET → KONTO_VERKNUEPFT → AKTIV / PAUSIERT.
 * Optional mcc_kundenkonto_id setzen (Kunden-Ads-Konto unter unserem MCC).
 */
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'

const ERLAUBTE_STATUS = ['ENTWURF', 'EINLADUNG_VERSENDET', 'KONTO_VERKNUEPFT', 'AKTIV', 'PAUSIERT'] as const

export async function PATCH(
  request: Request,
  { params }: { params: { adsId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const { supabase } = auth.data

  const body = await request.json().catch(() => null)
  const status = typeof body?.status === 'string' ? body.status : null
  const mccKundenkontoId = typeof body?.mcc_kundenkonto_id === 'string' ? body.mcc_kundenkonto_id : undefined

  if (status && !ERLAUBTE_STATUS.includes(status as (typeof ERLAUBTE_STATUS)[number])) {
    return NextResponse.json({ error: 'Ungültiger Status' }, { status: 400 })
  }
  if (!status && mccKundenkontoId === undefined) {
    return NextResponse.json({ error: 'status oder mcc_kundenkonto_id erforderlich' }, { status: 400 })
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (status) update.status = status
  if (mccKundenkontoId !== undefined) update.mcc_kundenkonto_id = mccKundenkontoId

  const { data: kampagne, error } = await supabase
    .from('ads_kampagnen')
    .update(update)
    .eq('id', params.adsId)
    .select('id, typ, status, mcc_kundenkonto_id')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ kampagne })
}
