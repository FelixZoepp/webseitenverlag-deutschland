import { requireAdmin } from '@/lib/auth-helpers'
import { NextResponse } from 'next/server'
import { generatePreCallBriefing } from '@/lib/briefing'
import { sendSlackNotification } from '@/lib/slack'
import { Resend } from 'resend'

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@resend.dev'
const FROM_NAME = process.env.FROM_NAME || 'Webseiten-Verlag Deutschland'
const FELIX_EMAIL = process.env.BRIEFING_EMAIL || 'felix@zoeppmedia.de'

// GET: Briefing abrufen
export async function GET(
  _request: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const result = await requireAdmin()
    if (!result.ok) return result.response

    const { supabase } = result.data
    const { data: customer } = await supabase
      .from('customers')
      .select('pre_call_briefing_url, pre_call_briefing_at, company_name')
      .eq('id', params.customerId)
      .single()

    return NextResponse.json({
      briefing: customer?.pre_call_briefing_url || null,
      generatedAt: customer?.pre_call_briefing_at || null,
      kundenName: customer?.company_name,
    })
  } catch {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

// POST: Briefing generieren + Email senden
export async function POST(
  _request: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const result = await requireAdmin()
    if (!result.ok) return result.response

    const { supabase } = result.data

    // Briefing generieren
    const briefing = await generatePreCallBriefing(supabase, params.customerId)

    // In DB speichern (als Text, kein PDF nötig)
    await supabase.from('customers').update({
      pre_call_briefing_url: briefing.briefingText,
      pre_call_briefing_at: briefing.generatedAt,
    }).eq('id', params.customerId)

    // Kundenname für Email
    const { data: customer } = await supabase
      .from('customers')
      .select('company_name, onboarding_termin_am')
      .eq('id', params.customerId)
      .single()

    // Email an Felix
    try {
      const resend = new Resend(process.env.RESEND_API_KEY!)
      await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: FELIX_EMAIL,
        subject: `Briefing: ${customer?.company_name || 'Kunde'} — Onboarding-Call`,
        text: briefing.briefingText,
        html: `<pre style="font-family:monospace;white-space:pre-wrap;max-width:700px;margin:0 auto;padding:24px;line-height:1.6">${briefing.briefingText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`,
      })
    } catch (emailErr) {
      console.error('Briefing-Email fehlgeschlagen:', emailErr)
    }

    // Timeline
    await supabase.from('vertrags_timeline').insert({
      customer_id: params.customerId,
      ereignis: 'Pre-Call-Briefing generiert',
      details: `Briefing für Onboarding-Call erstellt und an Felix gesendet`,
    })

    // Slack
    await sendSlackNotification('vertrieb', `Pre-Call-Briefing fertig: *${customer?.company_name}*`)

    return NextResponse.json({ success: true, briefing: briefing.briefingText })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Serverfehler' }, { status: 500 })
  }
}
