import { requireAdmin } from '@/lib/auth-helpers'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { getPackage } from '@/lib/packages'
import { getUpsellModule } from '@/lib/upsells'
import { generateAngebotPDF } from '@/lib/pdf/angebot'
import { generateSepaMandatPDF } from '@/lib/pdf/sepa-mandat'
import { sendAngebotEmail } from '@/lib/vertrag-emails'
import { createEnvelope } from '@/lib/docusign'
import { fetchFirefliesTranscript } from '@/lib/fireflies'
import { sendSlackNotification } from '@/lib/slack'
import { flags } from '@/lib/feature-flags'
import { sendInvitationEmail } from '@/lib/email'

const VertragSchema = z.object({
  firma: z.string().min(1),
  ansprechpartner: z.string().min(1),
  email: z.string().email(),
  telefon: z.string().min(1),
  strasse: z.string().min(1),
  plz: z.string().min(4),
  ort: z.string().min(1),
  ustIdNr: z.string().optional().default(''),
  steuernummer: z.string().optional().default(''),
  unternehmerBestaetigt: z.boolean(),
  ibanKunde: z.string().min(15),
  bicKunde: z.string().optional().default(''),
  paket: z.enum(['starter', 'business', 'growth']),
  upsells: z.array(z.string()),
  contractYears: z.number().min(1).max(5),
  contractStart: z.string(),
  closerName: z.string().min(1),
  closerNotiz: z.string().optional().default(''),
  firefliesUrl: z.string().optional().default(''),
  sendInvitation: z.boolean().default(true),
})

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: Request) {
  try {
    const result = await requireAdmin()
    if (!result.ok) return result.response

    const body = await request.json()
    const parsed = VertragSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const data = parsed.data
    const serviceClient = getServiceClient()
    const pkg = getPackage(data.paket)

    // ──── 1. Angebotsnummer generieren ────
    const year = new Date().getFullYear()
    const { count } = await serviceClient
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .like('angebots_nummer', `WV-${year}-%`)
    const seqNum = (count || 0) + 1
    const angebotsNummer = `WV-${year}-${String(seqNum).padStart(4, '0')}`

    // ──── 2. Mandatsreferenz generieren ────
    const mandatsReferenz = `WVD-${year}-${String(seqNum).padStart(4, '0')}`

    // ──── 3. Beträge berechnen ────
    const basisCent = pkg.price * 100
    const upsellSummeCent = data.upsells.reduce((sum, id) => {
      const mod = getUpsellModule(id)
      return sum + (mod?.preisProMonatCent || 0)
    }, 0)
    const monatsrateCent = basisCent + upsellSummeCent
    const werklohnCent = monatsrateCent * 12 * data.contractYears

    // ──── 4. Vertragsdaten ────
    const contractStart = data.contractStart
    const contractEndDate = new Date(contractStart)
    contractEndDate.setFullYear(contractEndDate.getFullYear() + data.contractYears)
    const contractEnd = contractEndDate.toISOString().split('T')[0]

    // ──── 5. Auth-User erstellen ────
    const crypto = await import('crypto')
    const tempPassword = crypto.randomBytes(6).toString('base64url') + crypto.randomBytes(2).toString('hex').toUpperCase() + '!'

    const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: `User-Erstellung fehlgeschlagen: ${authError.message}` }, { status: 500 })
    }

    // ──── 6. Kunde in DB anlegen ────
    const { data: customer, error: customerError } = await serviceClient
      .from('customers')
      .insert({
        user_id: authData.user.id,
        company_name: data.firma,
        contact_email: data.email,
        role: 'customer',
        // Vertrags-Felder
        vertrags_status: 'ENTWURF',
        angebots_nummer: angebotsNummer,
        ansprechpartner: data.ansprechpartner,
        telefon: data.telefon,
        strasse: data.strasse,
        plz: data.plz,
        ort: data.ort,
        ust_id_nr: data.ustIdNr || null,
        steuernummer: data.steuernummer || null,
        unternehmer_bestaetigt: data.unternehmerBestaetigt,
        // SEPA
        mandats_referenz: mandatsReferenz,
        iban_kunde: data.ibanKunde,
        bic_kunde: data.bicKunde || null,
        glaeubiger_id: process.env.GLAEUBIGER_ID || null,
        // Closer
        closer_name: data.closerName,
        closer_notiz: data.closerNotiz || null,
        fireflies_url: data.firefliesUrl || null,
        // Vertrag
        monthly_price: monatsrateCent / 100,
        monatsrate_cent: monatsrateCent,
        werklohn_cent: werklohnCent,
        contract_years: data.contractYears,
        contract_start: contractStart,
        contract_end: contractEnd,
        package: data.paket,
        status: 'active',
      })
      .select()
      .single()

    if (customerError) {
      return NextResponse.json({ error: `Kunden-Erstellung fehlgeschlagen: ${customerError.message}` }, { status: 500 })
    }

    // ──── 7. Geplante Upsells eintragen ────
    for (const upsellId of data.upsells) {
      const mod = getUpsellModule(upsellId)
      if (!mod) continue

      await serviceClient.from('activated_upsells').insert({
        customer_id: customer.id,
        upsell_id: upsellId,
        preis_pro_monat_cent: mod.preisProMonatCent,
        konfiguration: { geplant_bei_vertragsabschluss: true },
      })
    }

    // ──── 8. PDFs generieren ────
    const [angebotPdf, sepaMandatPdf] = await Promise.all([
      generateAngebotPDF({
        angebotsNummer,
        datum: new Date(),
        firma: data.firma,
        ansprechpartner: data.ansprechpartner,
        strasse: data.strasse,
        plz: data.plz,
        ort: data.ort,
        ustIdNr: data.ustIdNr,
        paket: data.paket,
        upsells: data.upsells,
        monatsrateCent,
        werklohnCent,
        contractYears: data.contractYears,
        contractStart,
      }),
      generateSepaMandatPDF({
        firma: data.firma,
        ansprechpartner: data.ansprechpartner,
        strasse: data.strasse,
        plz: data.plz,
        ort: data.ort,
        ibanKunde: data.ibanKunde,
        bicKunde: data.bicKunde,
        mandatsReferenz,
        glaeubigerId: process.env.GLAEUBIGER_ID || '[wird nachgetragen]',
      }),
    ])

    // AGB-URL (AGB liegen auf der Webseite, kein PDF nötig)
    const agbUrl = process.env.AGB_URL || 'https://webseitenverlag-deutschland.de/agb'

    // ──── 9. PDFs in Supabase Storage hochladen ────
    const angebotPath = `vertraege/${customer.id}/Angebot_${angebotsNummer}.pdf`
    const mandatPath = `vertraege/${customer.id}/SEPA_Lastschriftmandat.pdf`

    await serviceClient.storage.from('kundenbilder').upload(angebotPath, angebotPdf, { contentType: 'application/pdf', upsert: true })
    await serviceClient.storage.from('kundenbilder').upload(mandatPath, sepaMandatPdf, { contentType: 'application/pdf', upsert: true })

    const angebotUrl = serviceClient.storage.from('kundenbilder').getPublicUrl(angebotPath).data.publicUrl
    const mandatUrl = serviceClient.storage.from('kundenbilder').getPublicUrl(mandatPath).data.publicUrl

    await serviceClient.from('kunden_dokumente').insert([
      {
        customer_id: customer.id,
        typ: 'ANGEBOT_UNSIGNIERT',
        dateiname: `Angebot_${angebotsNummer}.pdf`,
        speicher_url: angebotUrl,
      },
      {
        customer_id: customer.id,
        typ: 'SEPA_MANDAT_UNSIGNIERT',
        dateiname: 'SEPA_Lastschriftmandat.pdf',
        speicher_url: mandatUrl,
      },
    ])

    await serviceClient.from('customers').update({
      angebots_pdf_url: angebotUrl,
    }).eq('id', customer.id)

    // ──── 10. Versand: DocuSign oder Email ────
    let docusignEnvelopeId: string | null = null

    if (flags.docusignActive) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'
      const envelope = await createEnvelope(
        { email: data.email, name: data.ansprechpartner },
        [
          { documentId: '1', name: `Angebot ${angebotsNummer}`, pdfBuffer: angebotPdf },
          { documentId: '2', name: 'SEPA-Lastschriftmandat', pdfBuffer: sepaMandatPdf },
        ],
        `Ihr Angebot ${angebotsNummer} – Webseitenverlag Deutschland`,
        `${appUrl}/api/webhooks/docusign`
      )

      if (envelope) {
        docusignEnvelopeId = envelope.envelopeId
        await serviceClient.from('customers').update({
          docusign_envelope_id: envelope.envelopeId,
          signatur_versendet_am: new Date().toISOString(),
        }).eq('id', customer.id)
      }
    } else {
      // Fallback: Resend-Email mit PDF-Attachments
      await sendAngebotEmail(data.email, {
        ansprechpartner: data.ansprechpartner,
        firma: data.firma,
        angebotsNummer,
        monatsrateEuro: monatsrateCent / 100,
        werklohnEuro: werklohnCent / 100,
        paketName: pkg.name,
        angebotPdf,
        sepaMandatPdf,
        agbUrl,
      })
    }

    // ──── 11. Status updaten ────
    await serviceClient.from('customers').update({
      vertrags_status: 'ANGEBOT_VERSENDET',
      signatur_versendet_am: new Date().toISOString(),
    }).eq('id', customer.id)

    // ──── 12. Timeline-Eintrag ────
    await serviceClient.from('vertrags_timeline').insert({
      customer_id: customer.id,
      ereignis: 'Angebot versendet',
      details: `${angebotsNummer} per ${flags.docusignActive ? 'DocuSign' : 'E-Mail'} an ${data.email} versendet. Closer: ${data.closerName}`,
    })

    // ──── 13. Einladungs-Email ────
    let invitationSent = false
    if (data.sendInvitation) {
      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'}/login`
      const emailResult = await sendInvitationEmail(data.email, data.firma, loginUrl, tempPassword)
      invitationSent = emailResult.success
    }

    // ──── 14. Fireflies (Hintergrund) ────
    if (data.firefliesUrl && flags.firefliesActive) {
      fetchFirefliesTranscript(data.firefliesUrl)
        .then(async (result) => {
          if (!result) return
          await serviceClient.from('customers').update({
            fireflies_call_id: result.callId,
            fireflies_transkript: result.transcript,
            fireflies_notizen: result.notes,
          }).eq('id', customer.id)

          await serviceClient.from('kunden_dokumente').insert({
            customer_id: customer.id,
            typ: 'CALL_TRANSCRIPT',
            dateiname: 'sales_call_transcript.txt',
            speicher_url: `data:text/plain;base64,${Buffer.from(result.transcript).toString('base64')}`,
            mime_type: 'text/plain',
          })

          await serviceClient.from('vertrags_timeline').insert({
            customer_id: customer.id,
            ereignis: 'Call-Transkript gespeichert',
            details: `Fireflies-Transkript von ${data.firefliesUrl} abgerufen`,
          })
        })
        .catch((err) => console.error('Fireflies-Sync fehlgeschlagen:', err))
    }

    // ──── 15. Slack-Notification ────
    await sendSlackNotification(
      'vertrieb',
      `*Neuer Vertrag* von ${data.closerName}:\n*${data.firma}* – ${monatsrateCent / 100} €/Mt (${angebotsNummer})\nAngebot per ${flags.docusignActive ? 'DocuSign' : 'E-Mail'} versendet an ${data.email}`
    )

    // ──── 16. Response ────
    return NextResponse.json({
      success: true,
      kundenId: customer.id,
      angebotsNummer,
      docusignEnvelopeId,
      tempPassword,
      invitationSent,
      monatsrateCent,
      werklohnCent,
      statusUrl: `/admin/customers/${customer.id}`,
    }, { status: 201 })
  } catch (err: unknown) {
    console.error('Vertragserstellung fehlgeschlagen:', err)
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Interner Serverfehler',
    }, { status: 500 })
  }
}
