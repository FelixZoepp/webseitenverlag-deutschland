import { Resend } from 'resend'

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@resend.dev'
const FROM_NAME = process.env.FROM_NAME || 'Webseitenverlag Deutschland'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY ist nicht gesetzt')
  return new Resend(key)
}

export async function sendAngebotEmail(
  toEmail: string,
  data: {
    ansprechpartner: string
    firma: string
    angebotsNummer: string
    monatsrateEuro: number
    werklohnEuro: number
    paketName: string
    angebotPdf: Buffer
    sepaMandatPdf: Buffer
    agbUrl: string
  }
): Promise<{ success: boolean; error?: string }> {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Georgia,serif;background:#f3f4f6">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
      <div style="background:#1E4A82;padding:32px;text-align:center">
        <h1 style="color:#fff;font-size:22px;margin:0">Ihr Angebot ${data.angebotsNummer}</h1>
      </div>
      <div style="padding:32px">
        <p style="color:#374151;line-height:1.6">Sehr geehrte/r ${data.ansprechpartner},</p>
        <p style="color:#374151;line-height:1.6">
          vielen Dank f\u00fcr das Gespr\u00e4ch! Anbei erhalten Sie Ihr pers\u00f6nliches Angebot
          f\u00fcr Ihren professionellen Webauftritt mit dem <strong>${data.paketName}-Paket</strong>.
        </p>

        <div style="background:#FBF9F4;padding:20px;border-left:3px solid #C9A24E;margin:24px 0;border-radius:4px">
          <strong>Zusammenfassung:</strong><br/>
          Monatliche Rate: <strong>${data.monatsrateEuro.toFixed(2)} \u20ac netto</strong><br/>
          Gesamtwerklohn: <strong>${data.werklohnEuro.toFixed(2)} \u20ac netto</strong>
        </div>

        <h3 style="color:#111827;margin:24px 0 12px">Beigef\u00fcgte Dokumente</h3>
        <ul style="color:#374151;line-height:1.8">
          <li>\ud83d\udcc4 <strong>Angebot</strong> \u2013 Ihr pers\u00f6nliches Angebot mit allen Details</li>
          <li>\ud83d\udcc4 <strong>SEPA-Lastschriftmandat</strong> \u2013 F\u00fcr die bequeme monatliche Abbuchung</li>
        </ul>

        <p style="color:#374151;line-height:1.6">
          Unsere AGB finden Sie unter:<br/>
          <a href="${data.agbUrl}" style="color:#1E4A82">${data.agbUrl}</a>
        </p>

        <p style="color:#374151;line-height:1.6">
          <strong>N\u00e4chster Schritt:</strong> Bitte unterschreiben Sie die beigef\u00fcgten Dokumente
          und senden Sie diese per E-Mail an uns zur\u00fcck. Alternativ k\u00f6nnen Sie uns auch
          anrufen \u2013 wir richten dann alles f\u00fcr Sie ein.
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

  const attachments = [
    { filename: `Angebot_${data.angebotsNummer}.pdf`, content: data.angebotPdf },
    { filename: 'SEPA_Lastschriftmandat.pdf', content: data.sepaMandatPdf },
  ]

  try {
    await getResend().emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: toEmail,
      subject: `Ihr Angebot ${data.angebotsNummer} \u2013 Webseitenverlag Deutschland`,
      html,
      text: `Sehr geehrte/r ${data.ansprechpartner},\n\nanbei Ihr Angebot ${data.angebotsNummer}.\n\nMonatliche Rate: ${data.monatsrateEuro.toFixed(2)} \u20ac netto\nGesamtwerklohn: ${data.werklohnEuro.toFixed(2)} \u20ac netto\n\nBitte unterschreiben Sie die Dokumente und senden Sie diese zur\u00fcck.\n\nBeste Gr\u00fc\u00dfe,\nWebseitenverlag Deutschland`,
      attachments: attachments.map((a) => ({
        filename: a.filename,
        content: a.content.toString('base64'),
      })),
    })
    return { success: true }
  } catch (err: unknown) {
    console.error('Angebot email error:', err instanceof Error ? err.message : err)
    return { success: false, error: err instanceof Error ? err.message : 'Fehler' }
  }
}

export async function sendOnboardingEmail(
  toEmail: string,
  data: {
    ansprechpartner: string
    calendlyUrl: string
  }
): Promise<{ success: boolean; error?: string }> {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Georgia,serif;background:#f3f4f6">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
      <div style="background:#1E4A82;padding:32px;text-align:center">
        <h1 style="color:#fff;font-size:22px;margin:0">Willkommen bei Webseitenverlag!</h1>
      </div>
      <div style="padding:32px">
        <p style="color:#374151;line-height:1.6">Sehr geehrte/r ${data.ansprechpartner},</p>
        <p style="color:#374151;line-height:1.6">
          vielen Dank f\u00fcr Ihr Vertrauen! Ihr Vertrag ist jetzt aktiv. Im n\u00e4chsten Schritt
          m\u00f6chten wir in einem kurzen Onboarding-Gespr\u00e4ch alles f\u00fcr Ihre Webseite besprechen.
        </p>
        <div style="text-align:center;margin:32px 0">
          <a href="${data.calendlyUrl}" style="display:inline-block;background:#1E4A82;color:#fff;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;text-decoration:none">
            Onboarding-Termin buchen
          </a>
        </div>
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
      subject: 'Willkommen \u2013 Buchen Sie Ihren Onboarding-Termin',
      html,
      text: `Sehr geehrte/r ${data.ansprechpartner},\n\nIhr Vertrag ist aktiv! Buchen Sie jetzt Ihren Onboarding-Termin:\n${data.calendlyUrl}\n\nBeste Gr\u00fc\u00dfe,\nWebseitenverlag Deutschland`,
    })
    return { success: true }
  } catch (err: unknown) {
    console.error('Onboarding email error:', err instanceof Error ? err.message : err)
    return { success: false, error: err instanceof Error ? err.message : 'Fehler' }
  }
}

export async function sendWebseiteFertigEmail(
  toEmail: string,
  data: {
    ansprechpartner: string
    dashboardUrl: string
  }
): Promise<{ success: boolean; error?: string }> {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Georgia,serif;background:#f3f4f6">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
      <div style="background:#1E4A82;padding:32px;text-align:center">
        <h1 style="color:#fff;font-size:22px;margin:0">Ihre Webseite ist fertig!</h1>
      </div>
      <div style="padding:32px">
        <p style="color:#374151;line-height:1.6">Hallo ${data.ansprechpartner},</p>
        <p style="color:#374151;line-height:1.6">
          gro\u00dfartige Neuigkeiten \u2014 Ihre Webseite ist gebaut und wartet auf Sie!
        </p>
        <div style="text-align:center;margin:32px 0">
          <a href="${data.dashboardUrl}" style="display:inline-block;background:#1E4A82;color:#fff;padding:16px 32px;border-radius:8px;font-size:16px;font-weight:600;text-decoration:none">
            Webseite ansehen
          </a>
        </div>
        <div style="background:#FBF9F4;padding:20px;border-left:3px solid #C9A24E;margin:24px 0;border-radius:4px">
          <strong>Was Sie jetzt tun k\u00f6nnen:</strong><br/>
          \u2022 Vorschau ansehen und Eindruck sammeln<br/>
          \u2022 Texte und Bilder im Editor anpassen<br/>
          \u2022 Mit dem KI-Assistenten chatten \u2014 sagen Sie ihm, was Sie \u00e4ndern wollen<br/>
          \u2022 Wenn alles passt: \u201eWebseite freigeben\u201c klicken
        </div>
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
      subject: 'Ihre Webseite ist fertig! \u2014 Webseitenverlag Deutschland',
      html,
      text: `Hallo ${data.ansprechpartner},\n\nIhre Webseite ist fertig!\n\nJetzt ansehen: ${data.dashboardUrl}\n\nBeste Gr\u00fc\u00dfe,\nWebseitenverlag Deutschland`,
    })
    return { success: true }
  } catch (err: unknown) {
    console.error('Webseite-fertig email error:', err instanceof Error ? err.message : err)
    return { success: false, error: err instanceof Error ? err.message : 'Fehler' }
  }
}
