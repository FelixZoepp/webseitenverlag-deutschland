/**
 * Admin-CRM: Einzel-Lead aktualisieren (Pipeline-Stage verschieben) oder löschen.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth-helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const CRM_STAGES = [
  'neuer_lead',
  'erstgespraech',
  'closing_terminiert',
  'closing_no_show',
  'closed',
  'verloren',
] as const

const patchSchema = z.object({
  crm_stage: z.enum(CRM_STAGES),
  verloren_grund: z.string().trim().max(300).optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { leadId } = await params
  const body = await request.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ungültige Pipeline-Stage.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: vorher } = await admin.from('leads').select('crm_stage').eq('id', leadId).single()

  const update: Record<string, string> = {
    crm_stage: parsed.data.crm_stage,
    updated_at: new Date().toISOString(),
  }
  if (parsed.data.crm_stage === 'verloren' && parsed.data.verloren_grund) {
    update.verloren_grund = parsed.data.verloren_grund
  }

  const { error } = await admin.from('leads').update(update).eq('id', leadId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Verlaufsprotokoll fürs Marketing-Dashboard ("Erstgespräche im Zeitraum") —
  // ein Log-Fehler darf den Stage-Wechsel nicht blockieren.
  if (vorher?.crm_stage !== parsed.data.crm_stage) {
    const { error: logError } = await admin.from('lead_stage_events').insert({
      lead_id: leadId,
      von_stage: vorher?.crm_stage ?? null,
      zu_stage: parsed.data.crm_stage,
    })
    if (logError) console.error(`[CRM] Stage-Event-Log fehlgeschlagen: ${logError.message}`)
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { leadId } = await params
  const admin = createAdminClient()
  const { error } = await admin
    .from('leads')
    .delete()
    .eq('id', leadId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
