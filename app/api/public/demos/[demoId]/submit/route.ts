import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function POST(
  request: Request,
  { params }: { params: { demoId: string } }
) {
  try {
    const supabase = getSupabase()
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || ''

    // Rate-Limit: max 5 pro IP pro Stunde
    const eineStundeHer = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('form_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', eineStundeHer)
    if (count !== null && count >= 5) {
      return NextResponse.json(
        { success: true, message: 'Vielen Dank für Ihre Anfrage!' },
        { headers: corsHeaders }
      )
    }

    // Demo laden
    const { data: demo } = await supabase
      .from('demos')
      .select('id, prospect_name')
      .eq('id', params.demoId)
      .single()

    if (!demo) {
      return NextResponse.json({ error: 'Demo nicht gefunden' }, { status: 404, headers: corsHeaders })
    }

    const body = await request.json()

    if (!body.name || (!body.email && !body.phone)) {
      return NextResponse.json(
        { error: 'Name und Kontaktdaten sind Pflichtfelder' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Honeypot
    const isSpam = !!(body.website || body.url)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { website: _w, url: _u, ...cleanData } = body

    await supabase
      .from('form_submissions')
      .insert({
        demo_id: params.demoId,
        form_type: 'demo_kontakt',
        data: cleanData,
        sender_email: body.email || null,
        sender_name: body.name,
        status: isSpam ? 'spam' : 'new',
        ip_address: ip,
        user_agent: userAgent,
      })

    // Benachrichtigung an Felix
    if (!isSpam && process.env.NOTIFICATION_EMAIL) {
      const { sendLeadNotification } = await import('@/lib/email')
      await sendLeadNotification(
        process.env.NOTIFICATION_EMAIL,
        demo.prospect_name || 'Demo',
        demo.prospect_name || 'Demo',
        cleanData,
        params.demoId,
        params.demoId,
        body.email
      ).catch(() => {}) // Fehler nicht an den User weitergeben
    }

    return NextResponse.json(
      { success: true, message: 'Vielen Dank für Ihre Anfrage! Wir melden uns zeitnah.' },
      { headers: corsHeaders }
    )
  } catch (err) {
    console.error('Demo form submit error:', err)
    return NextResponse.json(
      { success: true, message: 'Vielen Dank für Ihre Anfrage!' },
      { headers: corsHeaders }
    )
  }
}
