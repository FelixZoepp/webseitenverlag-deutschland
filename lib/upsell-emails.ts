import { Resend } from 'resend'

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@resend.dev'
const FROM_NAME = process.env.FROM_NAME || 'Webseitenverlag Deutschland'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY ist nicht gesetzt')
  return new Resend(key)
}

export async function sendUpsellActivationEmail(
  toEmail: string,
  data: {
    ansprechpartner: string
    modulName: string
    preis: number
    neueMonatsrate: number
    webseitenUrlNeu?: string
  }
): Promise<{ success: boolean; error?: string }> {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Georgia,serif;background:#f3f4f6">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
      <div style="background:#1E4A82;padding:32px;text-align:center">
        <h1 style="color:#fff;font-size:22px;margin:0">${data.modulName} ist jetzt aktiv</h1>
      </div>
      <div style="padding:32px">
        <p style="color:#374151;line-height:1.6">Sehr geehrte/r ${data.ansprechpartner},</p>
        <p style="color:#374151;line-height:1.6">
          <strong>${data.modulName}</strong> wurde soeben f\u00fcr Ihre Webseite aktiviert.
          Die Funktion ist ab sofort live und voll funktionsf\u00e4hig.
        </p>
        ${data.webseitenUrlNeu ? `
        <div style="background:#FBF9F4;padding:20px;border-left:3px solid #C9A24E;margin:24px 0;border-radius:4px">
          <strong>Direkt ansehen:</strong><br/>
          <a href="${data.webseitenUrlNeu}" style="color:#1E4A82">${data.webseitenUrlNeu}</a>
        </div>` : ''}
        <h3 style="color:#111827;margin:24px 0 12px">Was sich \u00e4ndert</h3>
        <ul style="color:#374151;line-height:1.8">
          <li>Monatlicher Beitrag: <strong>${data.neueMonatsrate.toFixed(2)} \u20ac netto</strong></li>
          <li>Erste Abrechnung mit ${data.modulName}: n\u00e4chster regul\u00e4rer Termin</li>
          <li>Laufzeit: bis zum Ende Ihres Vertrags</li>
        </ul>
        <p style="color:#374151;line-height:1.6">
          Bei Fragen melden Sie sich jederzeit \u00fcber den KI-Editor in Ihrem Konto.
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

  try {
    await getResend().emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: toEmail,
      subject: `${data.modulName} ist jetzt aktiv`,
      html,
      text: `${data.modulName} ist jetzt aktiv\n\nSehr geehrte/r ${data.ansprechpartner},\n\n${data.modulName} wurde f\u00fcr Ihre Webseite aktiviert.\n\nMonatlicher Beitrag: ${data.neueMonatsrate.toFixed(2)} \u20ac netto\n\nBeste Gr\u00fc\u00dfe,\nWebseitenverlag Deutschland`,
    })
    return { success: true }
  } catch (err: unknown) {
    console.error('Upsell activation email error:', err instanceof Error ? err.message : err)
    return { success: false, error: err instanceof Error ? err.message : 'Fehler' }
  }
}
