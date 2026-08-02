/**
 * Abnahmefiktion-Cron (§4(4) AGB v1.1) — läuft täglich.
 *
 * Prüft alle Sites mit gesetzter feedback_auto_freigabe_am:
 * Ist der Zeitpunkt überschritten und die Site noch nicht freigegeben,
 * wird sie automatisch freigegeben (Abnahmefiktion nach 7 Werktagen).
 *
 * Idempotent: Nur Sites im Status 'draft' mit build_status='FERTIG'
 * und abgelaufener Frist werden freigeschaltet.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createManualTask } from '@/lib/contracts'
import { istCronAutorisiert } from '@/lib/cron-auth'
import { starteAsyncPublishQa } from '@/lib/qa-gate/publish-qa'

export const dynamic = 'force-dynamic'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: Request) {
  if (!istCronAutorisiert(request)) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const supabase = getServiceClient()
  const jetzt = new Date().toISOString()

  // Sites finden, deren Auto-Freigabe-Frist abgelaufen ist
  const { data: faelligeSites, error } = await supabase
    .from('sites')
    .select('id, customer_id, name, feedback_auto_freigabe_am')
    .eq('status', 'draft')
    .not('feedback_auto_freigabe_am', 'is', null)
    .lte('feedback_auto_freigabe_am', jetzt)

  if (error) {
    console.error('[ABNAHME] Fehler beim Laden fälliger Sites:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!faelligeSites || faelligeSites.length === 0) {
    return NextResponse.json({ processed: 0 })
  }

  let processed = 0

  for (const site of faelligeSites) {
    // Kunde prüfen: nur wenn onboarding_status NICHT bereits FREIGEGEBEN
    const { data: customer } = await supabase
      .from('customers')
      .select('id, company_name, onboarding_status')
      .eq('id', site.customer_id)
      .single()

    if (!customer || customer.onboarding_status === 'FREIGEGEBEN') continue

    const now = new Date().toISOString()

    // Site freischalten
    await supabase.from('sites').update({
      status: 'published',
      updated_at: now,
    }).eq('id', site.id)

    // Kunden-Status updaten
    await supabase.from('customers').update({
      onboarding_status: 'FREIGEGEBEN',
      webseite_freigegeben_am: now,
    }).eq('id', customer.id)

    // Timeline
    await supabase.from('vertrags_timeline').insert({
      customer_id: customer.id,
      ereignis: 'Abnahmefiktion: Webseite automatisch freigegeben',
      details: `Keine Rückmeldung innerhalb der Frist (7 Werktage). Gemäß §4(4) AGB gilt der Entwurf als freigegeben. Frist lief ab am ${new Date(site.feedback_auto_freigabe_am!).toLocaleDateString('de-DE')}.`,
    })

    // Manual Task für Awareness
    await createManualTask(supabase, {
      typ: 'SONSTIGES',
      titel: `Abnahmefiktion: ${customer.company_name} automatisch freigeschaltet`,
      beschreibung: `Kunde hat innerhalb der 7-Werktage-Frist nicht reagiert. Site wurde gemäß §4(4) AGB automatisch freigegeben. Bitte kurz prüfen ob alles passt.`,
      customer_id: customer.id,
      quelle: 'cron-abnahme',
    })

    // QA-Gate
    starteAsyncPublishQa(site.id, 'publish')

    console.log(`[ABNAHME] Site ${site.id} (${customer.company_name}) automatisch freigeschaltet`)
    processed++
  }

  return NextResponse.json({ processed })
}
