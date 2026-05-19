import { requireAdmin } from '@/lib/auth-helpers'
import { NextResponse } from 'next/server'
import { getUpsellModuleOrThrow } from '@/lib/upsells'
import { Resend } from 'resend'

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@resend.dev'
const FROM_NAME = process.env.FROM_NAME || 'Webseitenverlag Deutschland'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY ist nicht gesetzt')
  return new Resend(key)
}

export async function POST(
  _request: Request,
  { params }: { params: { customerId: string; upsellId: string } }
) {
  try {
    const result = await requireAdmin()
    if (!result.ok) return result.response

    const { supabase } = result.data
    const modul = getUpsellModuleOrThrow(params.upsellId)

    // Kunde laden
    const { data: customer } = await supabase
      .from('customers')
      .select('*, sites(id)')
      .eq('id', params.customerId)
      .single()

    if (!customer || !customer.contact_email) {
      return NextResponse.json({ error: 'Kunde oder Email nicht gefunden' }, { status: 404 })
    }

    const sites = (customer.sites || []) as { id: string }[]
    const siteId = sites[0]?.id
    if (!siteId) {
      return NextResponse.json({ error: 'Keine Site gefunden' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'
    const upgradeUrl = `${appUrl}/dashboard/${siteId}/upgrade?upsell=${params.upsellId}`

    // Email senden
    const ansprechpartner = customer.ansprechpartner || customer.company_name || 'Kunde'
    const preis = (modul.preisProMonatCent / 100).toFixed(2)

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Georgia,serif;background:#f3f4f6">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
      <div style="background:#1E4A82;padding:32px;text-align:center">
        <h1 style="color:#fff;font-size:22px;margin:0">Neue Erweiterung verf\u00fcgbar</h1>
      </div>
      <div style="padding:32px">
        <p style="color:#374151;line-height:1.6">Hallo ${ansprechpartner},</p>
        <p style="color:#374151;line-height:1.6">
          wir haben eine neue Erweiterung f\u00fcr Ihre Webseite vorbereitet:
        </p>

        <div style="background:#FBF9F4;padding:20px;border-left:3px solid #C9A24E;margin:24px 0;border-radius:4px">
          <h3 style="color:#1E4A82;margin:0 0 8px">${modul.name}</h3>
          <p style="color:#374151;margin:0 0 8px;font-size:14px">${modul.beschreibung}</p>
          <p style="color:#1E4A82;font-size:20px;font-weight:bold;margin:0">${preis} \u20ac / Monat</p>
        </div>

        <div style="text-align:center;margin:32px 0">
          <a href="${upgradeUrl}" style="display:inline-block;background:#1E4A82;color:#fff;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;text-decoration:none">
            Jetzt ansehen & buchen
          </a>
        </div>

        <p style="color:#6B7280;font-size:13px;line-height:1.6">
          Sie k\u00f6nnen die Erweiterung jederzeit in Ihrem Dashboard buchen oder wieder abbestellen.
        </p>

        <p style="color:#374151;line-height:1.6">
          Beste Gr\u00fc\u00dfe,<br/>
          Ihr Team von Webseitenverlag Deutschland
        </p>
      </div>
      <div style="background:#0B1322;padding:16px;text-align:center;color:#A4C8E8;font-size:12px">
        ZH Digitalisierung UG \u00b7 Rhinstra\u00dfe 137A \u00b7 10315 Berlin
      </div>
    </div>
  </div>
</body></html>`

    await getResend().emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: customer.contact_email,
      subject: `${modul.name} \u2013 Neue Erweiterung f\u00fcr Ihre Webseite`,
      html,
      text: `Hallo ${ansprechpartner},\n\nNeue Erweiterung: ${modul.name}\n${modul.beschreibung}\n${preis} \u20ac/Monat\n\nJetzt buchen: ${upgradeUrl}\n\nBeste Gr\u00fc\u00dfe,\nWebseitenverlag Deutschland`,
    })

    // Email-Log
    await supabase.from('email_logs').insert({
      customer_id: params.customerId,
      template: 'upsell-einladung',
      subject: `${modul.name} \u2013 Upsell-Einladung`,
      metadata: { upsellId: params.upsellId, preis: modul.preisProMonatCent },
    })

    return NextResponse.json({ success: true, emailSent: true })
  } catch (err) {
    console.error('Upsell invite error:', err)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
