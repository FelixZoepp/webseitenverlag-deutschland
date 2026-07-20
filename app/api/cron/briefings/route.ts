import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generatePreCallBriefing } from '@/lib/briefing'
import { meldeJobFehler } from '@/lib/monitoring'
import { Resend } from 'resend'

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@resend.dev'
const FROM_NAME = process.env.FROM_NAME || 'Webseiten-Verlag Deutschland'
const FELIX_EMAIL = process.env.BRIEFING_EMAIL || 'felix@zoeppmedia.de'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Cron: Alle 30 Min prüfen ob Onboarding-Calls in 2-2.5h anstehen
export async function GET(request: Request) {
  // Vercel Cron Auth prüfen
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceClient()
  const now = new Date()
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000)
  const in2_5h = new Date(now.getTime() + 2.5 * 60 * 60 * 1000)

  // Kunden mit Onboarding-Termin in 2-2.5h und noch kein Briefing
  const { data: kandidaten } = await supabase
    .from('customers')
    .select('id, company_name, onboarding_termin_am')
    .gte('onboarding_termin_am', in2h.toISOString())
    .lte('onboarding_termin_am', in2_5h.toISOString())
    .is('pre_call_briefing_at', null)
    .eq('role', 'customer')

  if (!kandidaten || kandidaten.length === 0) {
    return NextResponse.json({ message: 'Keine Briefings nötig', checked: now.toISOString() })
  }

  const ergebnisse = []
  for (const kunde of kandidaten) {
    try {
      const briefing = await generatePreCallBriefing(supabase, kunde.id)

      await supabase.from('customers').update({
        pre_call_briefing_url: briefing.briefingText,
        pre_call_briefing_at: briefing.generatedAt,
      }).eq('id', kunde.id)

      // Email an Felix
      try {
        const resend = new Resend(process.env.RESEND_API_KEY!)
        await resend.emails.send({
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to: FELIX_EMAIL,
          subject: `Briefing in 2h: ${kunde.company_name} — Onboarding-Call`,
          text: briefing.briefingText,
          html: `<pre style="font-family:monospace;white-space:pre-wrap;max-width:700px;margin:0 auto;padding:24px;line-height:1.6">${briefing.briefingText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`,
        })
      } catch { /* Email-Fehler nicht blockierend */ }

      ergebnisse.push({ kundenId: kunde.id, firma: kunde.company_name, status: 'OK' })
    } catch (err: unknown) {
      ergebnisse.push({ kundenId: kunde.id, firma: kunde.company_name, status: 'FEHLER', error: err instanceof Error ? err.message : 'Unbekannt' })
    }
  }

  const fehlgeschlagen = ergebnisse.filter((e) => e.status === 'FEHLER')
  if (fehlgeschlagen.length > 0) {
    await meldeJobFehler(
      'briefings',
      fehlgeschlagen.map((e) => `${e.firma}: ${e.error}`).join('\n'),
      `${fehlgeschlagen.length}/${ergebnisse.length} Briefings fehlgeschlagen`
    )
  }

  return NextResponse.json({ briefings: ergebnisse, checked: now.toISOString() })
}
