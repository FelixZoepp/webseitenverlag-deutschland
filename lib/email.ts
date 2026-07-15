import { Resend } from 'resend'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY ist nicht gesetzt')
  return new Resend(key)
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@resend.dev'
const FROM_NAME = process.env.FROM_NAME || 'Webseitenverlag Deutschland'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

export async function sendLeadNotification(
  toEmail: string,
  customerName: string,
  siteName: string,
  submissionData: Record<string, unknown>,
  submissionId: string,
  siteId: string,
  replyToEmail?: string
): Promise<{ success: boolean; error?: string }> {
  const rows = Object.entries(submissionData)
    .filter(([key]) => !['website', 'url', 'site_id'].includes(key))
    .map(([key, val]) => {
      const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
      return `<tr><td style="padding:10px 16px;border-bottom:1px solid #eee;font-weight:600;color:#374151;width:140px;vertical-align:top">${label}</td><td style="padding:10px 16px;border-bottom:1px solid #eee;color:#1f2937">${String(val || '\u2014')}</td></tr>`
    })
    .join('')

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f3f4f6">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
      <div style="background:#1f2937;padding:24px 32px"><h1 style="color:#fff;font-size:18px;margin:0">${siteName}</h1></div>
      <div style="padding:32px">
        <h2 style="font-size:20px;color:#111827;margin:0 0 8px">Neue Anfrage erhalten!</h2>
        <p style="color:#6b7280;margin:0 0 24px">Du hast eine neue Kontaktanfrage erhalten.</p>
        <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden">${rows}</table>
        <div style="margin-top:24px;padding:16px;background:#ecfdf5;border-radius:8px;border-left:4px solid #10b981">
          <p style="margin:0;font-size:14px;color:#065f46"><strong>Tipp:</strong> Antworte direkt auf diese Mail, um dem Anfrager zu schreiben.</p>
        </div>
        <div style="margin-top:24px;text-align:center">
          <a href="${APP_URL}/dashboard/${siteId}/leads" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none">Alle Anfragen ansehen</a>
        </div>
      </div>
      <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb"><p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">ID: ${submissionId}</p></div>
    </div>
  </div>
</body></html>`

  const textRows = Object.entries(submissionData)
    .filter(([key]) => !['website', 'url', 'site_id'].includes(key))
    .map(([key, val]) => `${key}: ${String(val || '\u2014')}`)
    .join('\n')

  try {
    await getResend().emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: toEmail,
      subject: `Neue Anfrage \u00fcber deine Webseite \u2014 ${siteName}`,
      replyTo: replyToEmail || undefined,
      html,
      text: `Neue Anfrage \u00fcber ${siteName}\n\n${textRows}\n\nAlle Anfragen: ${APP_URL}/dashboard/${siteId}/leads`,
    })
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Mail-Versand fehlgeschlagen'
    console.error('Lead notification error:', msg)
    return { success: false, error: msg }
  }
}

export async function sendConfirmationToSender(
  senderEmail: string,
  senderName: string,
  siteName: string,
  customerName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await getResend().emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: senderEmail,
      subject: `Deine Anfrage bei ${siteName}`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f3f4f6"><div style="max-width:600px;margin:0 auto;padding:24px"><div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);padding:32px"><h2 style="font-size:20px;color:#111827;margin:0 0 16px">Vielen Dank!</h2><p style="color:#374151;line-height:1.6">Hallo ${senderName},</p><p style="color:#374151;line-height:1.6">vielen Dank f\u00fcr deine Nachricht an <strong>${siteName}</strong>. Wir melden uns schnellstm\u00f6glich bei dir.</p><p style="color:#374151;line-height:1.6">Beste Gr\u00fc\u00dfe,<br><strong>${customerName}</strong></p></div></div></body></html>`,
      text: `Hallo ${senderName},\n\nvielen Dank f\u00fcr deine Nachricht an ${siteName}. Wir melden uns schnellstm\u00f6glich.\n\nBeste Gr\u00fc\u00dfe,\n${customerName}`,
    })
    return { success: true }
  } catch (err: unknown) {
    console.error('Confirmation mail error:', err instanceof Error ? err.message : err)
    return { success: false, error: err instanceof Error ? err.message : 'Fehler' }
  }
}

/**
 * Zahlungserinnerung / Mahnung (Dunning, Phase E).
 * Stufe 1 = freundliche Erinnerung, 2 = Mahnung mit Sperr-Ankündigung, 3 = Sperrung.
 */
export async function sendDunningEmail(
  toEmail: string,
  customerName: string,
  mahnstufe: number
): Promise<{ success: boolean; error?: string }> {
  const stufen: Record<number, { betreff: string; text: string }> = {
    1: {
      betreff: 'Zahlungserinnerung — deine Website-Rechnung',
      text: `die letzte Abbuchung f\u00fcr deine Website konnte nicht durchgef\u00fchrt werden. Das kann z.B. an einer abgelaufenen Karte liegen. Bitte pr\u00fcfe deine Zahlungsmethode — der n\u00e4chste Versuch erfolgt automatisch.`,
    },
    2: {
      betreff: 'Mahnung — Zahlung weiterhin offen',
      text: `trotz Erinnerung ist die Zahlung f\u00fcr deine Website weiterhin offen. Bitte aktualisiere deine Zahlungsmethode zeitnah. Bleibt die Zahlung aus, m\u00fcssen wir deine Website vor\u00fcbergehend offline nehmen.`,
    },
    3: {
      betreff: 'Deine Website wurde vor\u00fcbergehend deaktiviert',
      text: `da die Zahlung mehrfach fehlgeschlagen ist, wurde deine Website vor\u00fcbergehend deaktiviert. Sobald die offene Zahlung beglichen ist, schalten wir sie automatisch wieder frei. Melde dich gerne, wenn wir helfen k\u00f6nnen.`,
    },
  }
  const inhalt = stufen[Math.min(3, Math.max(1, mahnstufe))]
  try {
    await getResend().emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: toEmail,
      subject: inhalt.betreff,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f3f4f6"><div style="max-width:600px;margin:0 auto;padding:24px"><div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)"><div style="background:#1f2937;padding:24px 32px"><h1 style="color:#fff;font-size:18px;margin:0">Webseitenverlag Deutschland</h1></div><div style="padding:32px"><h2 style="font-size:20px;color:#111827;margin:0 0 16px">${inhalt.betreff}</h2><p style="color:#374151;line-height:1.6">Hallo ${customerName},</p><p style="color:#374151;line-height:1.6">${inhalt.text}</p><p style="color:#374151;line-height:1.6">Beste Gr\u00fc\u00dfe<br>Webseitenverlag Deutschland</p></div></div></div></body></html>`,
      text: `Hallo ${customerName},\n\n${inhalt.text}\n\nBeste Gr\u00fc\u00dfe\nWebseitenverlag Deutschland`,
    })
    return { success: true }
  } catch (err: unknown) {
    console.error('Dunning mail error:', err instanceof Error ? err.message : err)
    return { success: false, error: err instanceof Error ? err.message : 'Fehler' }
  }
}

export async function sendInvitationEmail(
  toEmail: string,
  customerName: string,
  loginUrl: string,
  tempPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await getResend().emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: toEmail,
      subject: 'Dein Zugang zum Website-Dashboard',
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f3f4f6"><div style="max-width:600px;margin:0 auto;padding:24px"><div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)"><div style="background:#1f2937;padding:24px 32px"><h1 style="color:#fff;font-size:18px;margin:0">Webseitenverlag Deutschland</h1></div><div style="padding:32px"><h2 style="font-size:20px;color:#111827;margin:0 0 16px">Willkommen, ${customerName}!</h2><p style="color:#374151;line-height:1.6">Dein Website-Dashboard ist bereit. Hier kannst du deine Website bearbeiten und Anfragen einsehen.</p><div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:24px 0"><p style="margin:0 0 8px;font-size:14px;color:#6b7280">Deine Login-Daten:</p><p style="margin:0 0 4px"><strong>E-Mail:</strong> ${toEmail}</p><p style="margin:0"><strong>Passwort:</strong> ${tempPassword}</p></div><p style="color:#dc2626;font-size:14px">Bitte \u00e4ndere dein Passwort beim ersten Login.</p><div style="margin-top:24px;text-align:center"><a href="${loginUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none">Zum Dashboard</a></div></div></div></div></body></html>`,
      text: `Willkommen, ${customerName}!\n\nDein Website-Dashboard ist bereit.\n\nLogin: ${loginUrl}\nE-Mail: ${toEmail}\nPasswort: ${tempPassword}\n\nBitte \u00e4ndere dein Passwort beim ersten Login.`,
    })
    return { success: true }
  } catch (err: unknown) {
    console.error('Invitation mail error:', err instanceof Error ? err.message : err)
    return { success: false, error: err instanceof Error ? err.message : 'Fehler' }
  }
}
