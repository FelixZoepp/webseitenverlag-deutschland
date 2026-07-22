/**
 * Admin-CRM: Einzel-Lead aktualisieren (Pipeline-Stage verschieben).
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

const patchSchema = z.object({ crm_stage: z.enum(CRM_STAGES) })

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
  const { error } = await admin
    .from('leads')
    .update({ crm_stage: parsed.data.crm_stage, updated_at: new Date().toISOString() })
    .eq('id', leadId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
