/**
 * Phase 3 (MVP_FINISH_PROMPT §4.2): Ein-Klick-Generierung für einen Lead.
 * Kill-Switch (§8) wird VOR jedem Lauf geprüft. Fehler landen als
 * menschenlesbarer Grund im generation_job — die API wirft nicht roh.
 */

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { generierungGesperrt } from '@/lib/monitoring'
import { generiereDemoFuerLead } from '@/lib/generierung/lead-demo'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(
  _request: Request,
  { params }: { params: { leadId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  if (generierungGesperrt()) {
    return NextResponse.json(
      { error: 'Generierung gestoppt (GENERATION_KILL_SWITCH aktiv) — Env-Var entfernen, um wieder zu generieren.' },
      { status: 503 }
    )
  }

  const admin = createAdminClient()
  const { data: profil } = await admin
    .from('business_profiles')
    .select('id')
    .eq('lead_id', params.leadId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!profil) {
    return NextResponse.json(
      { error: 'Kein Geschäftsprofil zu diesem Lead — bitte zuerst das Formular ausfüllen.' },
      { status: 400 }
    )
  }

  const ergebnis = await generiereDemoFuerLead(params.leadId, profil.id)
  return NextResponse.json(ergebnis, { status: ergebnis.status === 'failed' ? 422 : 200 })
}
