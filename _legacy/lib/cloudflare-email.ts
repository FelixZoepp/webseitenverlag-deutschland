/**
 * LEGACY (MVP-Finish, Phase 1): Reconnect-Mail für das entfernte
 * Kunden-Cloudflare-Deployment. Aus lib/email.ts hierher verschoben.
 * Benötigt bei Reaktivierung: getResend, FROM_NAME, FROM_EMAIL, APP_URL aus lib/email.ts.
 */
// @ts-nocheck
export async function sendCloudflareReconnectEmail(
  toEmail: string,
  customerName: string,
  siteId: string
): Promise<{ success: boolean; error?: string }> {
  const text = `die Verbindung zu deinem Cloudflare-Konto funktioniert nicht mehr (Token widerrufen oder abgelaufen). Keine Sorge: Deine Website l\u00e4uft ohne Unterbrechung weiter \u00fcber unsere Infrastruktur. Wenn du weiterhin \u00fcber dein eigenes Cloudflare-Konto ver\u00f6ffentlichen m\u00f6chtest, hinterlege bitte einen neuen API-Token in deinem Dashboard.`
  try {
    await getResend().emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: toEmail,
      subject: 'Cloudflare-Verbindung erneuern — deine Website l\u00e4uft weiter',
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f3f4f6"><div style="max-width:600px;margin:0 auto;padding:24px"><div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)"><div style="background:#1f2937;padding:24px 32px"><h1 style="color:#fff;font-size:18px;margin:0">Webseitenverlag Deutschland</h1></div><div style="padding:32px"><h2 style="font-size:20px;color:#111827;margin:0 0 16px">Cloudflare-Verbindung erneuern</h2><p style="color:#374151;line-height:1.6">Hallo ${customerName},</p><p style="color:#374151;line-height:1.6">${text}</p><div style="margin-top:24px;text-align:center"><a href="${APP_URL}/dashboard/${siteId}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none">Zum Dashboard</a></div></div></div></div></body></html>`,
      text: `Hallo ${customerName},\n\n${text}\n\nDashboard: ${APP_URL}/dashboard/${siteId}`,
    })
    return { success: true }
  } catch (err: unknown) {
    console.error('Cloudflare reconnect mail error:', err instanceof Error ? err.message : err)
    return { success: false, error: err instanceof Error ? err.message : 'Fehler' }
  }
}
