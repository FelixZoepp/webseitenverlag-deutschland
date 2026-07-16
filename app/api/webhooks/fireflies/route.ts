import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { startBuildPipeline } from '@/lib/build-pipeline'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: Request) {
  try {
    // B4-Fix: Webhook-Secret prüfen (FIREFLIES_WEBHOOK_SECRET)
    const secret = process.env.FIREFLIES_WEBHOOK_SECRET
    if (secret) {
      const auth = request.headers.get('authorization')
      if (auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const event = await request.json()

    // Nur bei fertiger Transkription reagieren
    if (event.event_type !== 'Transcription completed') {
      return NextResponse.json({ ok: true })
    }

    const meetingUrl = event.meeting_url || event.data?.meeting_url
    const transcriptId = event.transcript_id || event.data?.transcript_id

    if (!meetingUrl && !transcriptId) {
      return NextResponse.json({ ok: true })
    }

    const supabase = getServiceClient()

    // Kunde finden anhand der Fireflies-URL
    const { data: customer } = await supabase
      .from('customers')
      .select('id, company_name')
      .eq('fireflies_url', meetingUrl)
      .single()

    if (!customer) {
      // Versuche über Call-ID zu finden
      if (transcriptId) {
        const { data: custByCall } = await supabase
          .from('customers')
          .select('id, company_name')
          .eq('fireflies_call_id', transcriptId)
          .single()

        if (custByCall) {
          await startBuildPipeline(supabase, custByCall.id, undefined, meetingUrl)
          return NextResponse.json({ ok: true, triggered: custByCall.company_name })
        }
      }
      console.log('Fireflies webhook: Kein Kunde für URL', meetingUrl)
      return NextResponse.json({ ok: true })
    }

    // Build-Pipeline starten
    await startBuildPipeline(supabase, customer.id, undefined, meetingUrl)

    return NextResponse.json({ ok: true, triggered: customer.company_name })
  } catch (err) {
    console.error('Fireflies webhook error:', err)
    return NextResponse.json({ ok: true })
  }
}
