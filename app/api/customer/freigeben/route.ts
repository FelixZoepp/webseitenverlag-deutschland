import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendSlackNotification } from '@/lib/slack'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

    const { siteId } = await request.json()
    if (!siteId) return NextResponse.json({ error: 'Keine siteId' }, { status: 400 })

    const { data: customer } = await supabase
      .from('customers')
      .select('id, company_name')
      .eq('user_id', user.id)
      .single()

    if (!customer) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })

    // Site prüfen
    const { data: site } = await supabase
      .from('sites')
      .select('id')
      .eq('id', siteId)
      .eq('customer_id', customer.id)
      .single()

    if (!site) return NextResponse.json({ error: 'Site nicht gefunden' }, { status: 404 })

    // Freigabe
    const now = new Date().toISOString()
    await supabase.from('customers').update({
      onboarding_status: 'FREIGEGEBEN',
      webseite_freigegeben_am: now,
    }).eq('id', customer.id)

    await supabase.from('sites').update({
      status: 'published',
      updated_at: now,
    }).eq('id', siteId)

    // Timeline
    await supabase.from('vertrags_timeline').insert({
      customer_id: customer.id,
      ereignis: 'Webseite vom Kunden freigegeben',
      details: 'Kunde hat die Webseite geprüft und live geschaltet',
    })

    // Slack
    await sendSlackNotification('vertrieb',
      `Webseite freigegeben: *${customer.company_name}* — Kunde hat live geschaltet!`
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
