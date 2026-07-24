import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

// TODO: Rate-Limiting fehlt hier. Das bisherige In-Memory-Map-Limit wurde entfernt,
// weil es auf Vercel Serverless nicht instanz-übergreifend funktioniert.
// Lösung: IP-Spalte in `leads` ergänzen und DB-basiertes Count-Query verwenden
// (analog zu form_submissions/submit/route.ts), oder Upstash Redis einbinden.

function str(v: unknown, max = 500): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim().slice(0, max)
  return s || null
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })

  // Honeypot: echte Nutzer füllen dieses Feld nie aus
  if (str(body.homepage)) {
    return NextResponse.json({ success: true })
  }

  const name = str(body.name, 200)
  const email = str(body.email, 200)
  if (!name || !email || !email.includes('@')) {
    return NextResponse.json({ error: 'Name und E-Mail sind erforderlich.' }, { status: 400 })
  }

  const lead = {
    name,
    email,
    firma: str(body.firma, 200),
    telefon: str(body.telefon, 50),
    website: str(body.website, 300),
    branche: str(body.branche, 100),
    nachricht: [
      str(body.nachricht, 2000),
      body.mitarbeiter ? `Mitarbeiter: ${str(body.mitarbeiter, 50)}` : null,
      body.zeitrahmen ? `Zeitrahmen: ${str(body.zeitrahmen, 100)}` : null,
    ].filter(Boolean).join('\n') || null,
    // Herkunft: 'funnel' = Ads-Funnel /anfrage, sonst 'landing'
    quelle: body.quelle === 'funnel' ? 'funnel' : 'landing',
    utm_source: str(body.utm_source, 100),
    utm_medium: str(body.utm_medium, 100),
    utm_campaign: str(body.utm_campaign, 100),
    utm_term: str(body.utm_term, 100),
    utm_content: str(body.utm_content, 100),
    referrer: str(body.referrer, 500),
    landing_path: str(body.landing_path, 300),
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: inserted, error } = await supabase.from('leads').insert(lead).select('id').single()
  if (error) {
    console.error('Lead insert error:', error.message)
    return NextResponse.json({ error: 'Anfrage konnte nicht gespeichert werden.' }, { status: 500 })
  }

  // M1: Conversion-Tracking (server-side, best effort)
  // Meta CAPI
  if (process.env.META_PIXEL_ID && process.env.META_CAPI_TOKEN) {
    try {
      await fetch(`https://graph.facebook.com/v19.0/${process.env.META_PIXEL_ID}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [{
            event_name: 'Lead',
            event_time: Math.floor(Date.now() / 1000),
            event_source_url: lead.landing_path ? `https://${process.env.NEXT_PUBLIC_MARKETING_HOST || 'webseitenverlag-deutschland.vercel.app'}${lead.landing_path}` : undefined,
            action_source: 'website',
            user_data: {
              em: lead.email ? [createHash('sha256').update(lead.email.toLowerCase().trim()).digest('hex')] : undefined,
              ph: lead.telefon ? [createHash('sha256').update(lead.telefon.replace(/\D/g, '')).digest('hex')] : undefined,
            },
            custom_data: { lead_id: inserted.id, branche: lead.branche, quelle: lead.quelle },
          }],
          access_token: process.env.META_CAPI_TOKEN,
        }),
      })
    } catch (e) { console.warn('[CAPI] Meta event fehlgeschlagen:', (e as Error).message) }
  }
  // Google Ads Conversion (Measurement Protocol)
  if (process.env.GA_MEASUREMENT_ID && process.env.GA_API_SECRET) {
    try {
      await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: lead.utm_source || 'server',
          events: [{ name: 'generate_lead', params: { lead_id: inserted.id, branche: lead.branche, source: lead.quelle } }],
        }),
      })
    } catch (e) { console.warn('[GA] Event fehlgeschlagen:', (e as Error).message) }
  }

  // Benachrichtigung an Vertrieb — Fehler blockieren den Lead nicht
  const notifyTo = ['hendrik@hoffmann-wd.de', 'felix@zoeppmedia.de']
  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    try {
      const resend = new Resend(apiKey)
      const fromEmail = process.env.FROM_EMAIL || 'noreply@resend.dev'
      const fromName = process.env.FROM_NAME || 'Webseiten-Verlag Deutschland'
      const rows = Object.entries({
        Name: lead.name, Firma: lead.firma, 'E-Mail': lead.email, Telefon: lead.telefon,
        Website: lead.website, Branche: lead.branche, Nachricht: lead.nachricht,
        'UTM Source': lead.utm_source, 'UTM Campaign': lead.utm_campaign,
      })
        .filter(([, v]) => v)
        .map(([k, v]) => `<tr><td style="padding:10px 16px;border-bottom:1px solid #eee;font-weight:600;color:#374151;width:140px;vertical-align:top">${k}</td><td style="padding:10px 16px;border-bottom:1px solid #eee;color:#1f2937">${String(v).replace(/</g, '&lt;').replace(/\n/g, '<br>')}</td></tr>`)
        .join('')
      await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: notifyTo,
        replyTo: lead.email,
        subject: 'Neuer Lead Webseitenverlag Deutschland',
        html: `<h2 style="font-family:sans-serif;color:#2563eb">Neuer Lead Webseitenverlag Deutschland</h2><p style="font-family:sans-serif;font-size:14px;color:#374151">Eingegangen über <a href="https://www.webseitenverlag-deutschland.de/anfrage">webseitenverlag-deutschland.de/anfrage</a></p><table style="font-family:sans-serif;font-size:15px;border-collapse:collapse;width:100%;max-width:600px">${rows}</table><p style="font-family:sans-serif;font-size:13px;color:#94a3b8;margin-top:24px">Lead-ID: ${inserted.id} · im Admin unter Leads sichtbar</p>`,
      })
    } catch (err) {
      console.error('Lead notification email failed:', err)
    }
  }

  return NextResponse.json({ success: true })
}
