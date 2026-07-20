/**
 * Phase 3 (MVP_FINISH_PROMPT §4.4): Mensch-Gate.
 * Erst die Admin-Prüfung ("Demo geprüft") schaltet demo_bereit — Demos
 * gehen NIE automatisch raus. Der zugehörige Job wechselt auf demo_bereit.
 *
 * QA-Gate Baustein A: demo_bereit verlangt zusätzlich einen aktuellen
 * Browser-QA-Report mit status passed|repaired (HARTES Gate).
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { demoId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  let bereit = true
  try {
    const body = await request.json()
    if (typeof body?.bereit === 'boolean') bereit = body.bereit
  } catch {
    // Kein Body → Freigabe (bereit=true)
  }

  const admin = createAdminClient()
  const { data: demo } = await admin
    .from('demos')
    .select('id, site_id')
    .eq('id', params.demoId)
    .maybeSingle()
  if (!demo) return NextResponse.json({ error: 'Demo nicht gefunden' }, { status: 404 })

  // HARTES QA-Gate (Baustein A): ohne aktuellen passed/repaired-Report keine Freigabe
  if (bereit) {
    if (!demo.site_id) {
      return NextResponse.json(
        { error: 'Demo hat keine Site — Browser-QA kann nicht geprüft werden.' },
        { status: 409 }
      )
    }
    const { data: report } = await admin
      .from('qa_reports')
      .select('status, report, created_at')
      .eq('site_id', demo.site_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!report) {
      return NextResponse.json(
        { error: 'Browser-QA fehlt: Es liegt noch kein QA-Report vor. Bitte QA-Lauf starten (Leads → QA prüfen).' },
        { status: 409 }
      )
    }
    if (report.status === 'failed') {
      const grund =
        (report.report as { fehler_grund?: string } | null)?.fehler_grund ?? 'unbekannter Grund'
      return NextResponse.json(
        { error: `Browser-QA fehlgeschlagen — Freigabe gesperrt.\n${grund}` },
        { status: 409 }
      )
    }
  }

  const { error } = await admin
    .from('demos')
    .update(
      bereit
        ? { demo_bereit: true, geprueft_von: auth.data.user.id, geprueft_am: new Date().toISOString() }
        : { demo_bereit: false, geprueft_von: null, geprueft_am: null }
    )
    .eq('id', params.demoId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Job-Status spiegeln (§4.2: laufend | demo_erstellt | demo_bereit | failed)
  await admin
    .from('generation_jobs')
    .update({ status: bereit ? 'demo_bereit' : 'demo_erstellt', updated_at: new Date().toISOString() })
    .eq('demo_id', params.demoId)
    .in('status', ['demo_erstellt', 'demo_bereit'])

  return NextResponse.json({ ok: true, demo_bereit: bereit })
}
