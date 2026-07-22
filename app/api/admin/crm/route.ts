/**
 * Admin-CRM: Leads mit Pipeline-Stage + letzter Notiz für das Kanban-Board.
 * Stages: neuer_lead → erstgespraech → closing_terminiert → closing_no_show → closed | verloren.
 */

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const admin = createAdminClient()
  const { data: leads, error } = await admin
    .from('leads')
    .select('id, name, firma, email, telefon, website, branche, nachricht, quelle, utm_source, utm_campaign, crm_stage, demo_id, created_at')
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const leadIds = (leads ?? []).map((l) => l.id)
  const { data: notes } = leadIds.length
    ? await admin
        .from('lead_notes')
        .select('id, lead_id, text, autor, created_at')
        .in('lead_id', leadIds)
        .order('created_at', { ascending: false })
    : { data: [] as never[] }

  const notizenProLead = new Map<string, { anzahl: number; letzte: string | null; letzterAutor: string | null }>()
  for (const note of notes ?? []) {
    const eintrag = notizenProLead.get(note.lead_id) ?? { anzahl: 0, letzte: null, letzterAutor: null }
    eintrag.anzahl += 1
    if (!eintrag.letzte) {
      eintrag.letzte = note.text
      eintrag.letzterAutor = note.autor ?? null
    }
    notizenProLead.set(note.lead_id, eintrag)
  }

  return NextResponse.json({
    leads: (leads ?? []).map((lead) => ({
      ...lead,
      notizen_anzahl: notizenProLead.get(lead.id)?.anzahl ?? 0,
      letzte_notiz: notizenProLead.get(lead.id)?.letzte ?? null,
      letzte_notiz_autor: notizenProLead.get(lead.id)?.letzterAutor ?? null,
    })),
  })
}
