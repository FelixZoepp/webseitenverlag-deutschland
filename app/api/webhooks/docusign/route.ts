import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSignedDocuments } from '@/lib/docusign'
import { sendOnboardingEmail } from '@/lib/vertrag-emails'
import { sendSlackNotification } from '@/lib/slack'
import { flags } from '@/lib/feature-flags'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: Request) {
  try {
    // HMAC-Signatur verifizieren (wenn Secret gesetzt)
    const webhookSecret = process.env.DOCUSIGN_WEBHOOK_SECRET
    const bodyText = await request.text()

    if (webhookSecret) {
      const signature = request.headers.get('x-docusign-signature-1')
      if (!signature) {
        console.error('DocuSign webhook: Keine Signatur im Header')
        return NextResponse.json({ error: 'Keine Signatur' }, { status: 401 })
      }
      const crypto = await import('crypto')
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(bodyText)
        .digest('base64')
      if (signature !== expectedSignature) {
        console.error('DocuSign webhook: Signatur ungültig')
        return NextResponse.json({ error: 'Ungültige Signatur' }, { status: 401 })
      }
    }

    const event = JSON.parse(bodyText)
    const envelopeId = event?.envelopeStatus?.envelopeId || event?.envelopeId
    const status = event?.envelopeStatus?.status || event?.status

    if (!envelopeId) return NextResponse.json({ ok: true })

    const supabase = getServiceClient()

    // Kunde finden
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('docusign_envelope_id', envelopeId)
      .single()

    if (!customer) {
      console.error(`DocuSign Webhook: Unbekanntes Envelope ${envelopeId}`)
      return NextResponse.json({ ok: true })
    }

    // ──── SIGNIERT ────
    if (status === 'Completed' || status === 'completed') {
      // 1. Signierte Dokumente abrufen + speichern
      const signedDocs = await getSignedDocuments(envelopeId)

      const dokumentUrls: Record<string, string> = {}

      for (const doc of signedDocs) {
        const typ = doc.name.includes('Angebot') ? 'ANGEBOT_SIGNIERT'
          : doc.name.includes('SEPA') ? 'SEPA_MANDAT_SIGNIERT'
          : null

        if (!typ) continue

        const dataUrl = `data:application/pdf;base64,${doc.buffer.toString('base64')}`

        await supabase.from('kunden_dokumente').insert({
          customer_id: customer.id,
          typ,
          dateiname: `signed_${doc.name}.pdf`,
          speicher_url: dataUrl,
          signiert_am: new Date().toISOString(),
          metadata: {
            docusign_envelope_id: envelopeId,
            docusign_document_id: doc.documentId,
          },
        })

        dokumentUrls[typ] = dataUrl
      }

      // 2. Kunde-Status updaten
      await supabase.from('customers').update({
        vertrags_status: 'SIGNIERT',
        signiert_am: new Date().toISOString(),
        signiertes_angebot_url: dokumentUrls['ANGEBOT_SIGNIERT'] || null,
        signiertes_mandat_url: dokumentUrls['SEPA_MANDAT_SIGNIERT'] || null,
      }).eq('id', customer.id)

      // 3. Timeline
      await supabase.from('vertrags_timeline').insert({
        customer_id: customer.id,
        ereignis: 'Vertrag signiert',
        details: `Alle Dokumente digital unterschrieben via DocuSign`,
      })

      // 4. Qonto-Mandat (wenn aktiv)
      if (flags.qontoActive) {
        // TODO: Qonto-API-Integration wenn freigeschaltet
        await supabase.from('customers').update({
          vertrags_status: 'SEPA_AKTIV',
        }).eq('id', customer.id)
      } else {
        await supabase.from('customers').update({
          vertrags_status: 'SEPA_VORBEREITET',
        }).eq('id', customer.id)

        // Manuelle Worklist
        await sendSlackNotification(
          'worklist',
          `*Manuelle Aufgabe*: SEPA-Mandat von *${customer.company_name}* bei Qonto eintragen.\n` +
          `IBAN: ${customer.iban_kunde} | Referenz: ${customer.mandats_referenz}`
        )
      }

      // 5. Onboarding-Email
      const calendlyUrl = process.env.CALENDLY_ONBOARDING_URL
      if (calendlyUrl && customer.contact_email) {
        await sendOnboardingEmail(customer.contact_email, {
          ansprechpartner: customer.ansprechpartner || customer.company_name || 'Kunde',
          calendlyUrl,
        })

        await supabase.from('vertrags_timeline').insert({
          customer_id: customer.id,
          ereignis: 'Onboarding-Email versendet',
          details: `Calendly-Link an ${customer.contact_email} gesendet`,
        })
      }

      // 6. Slack
      await sendSlackNotification(
        'vertrieb',
        `*Vertrag signiert*: ${customer.company_name} (${customer.angebots_nummer})\nOnboarding-Email versendet.`
      )
    }

    // ──── ABGELEHNT ────
    if (status === 'Declined' || status === 'declined' || status === 'Voided' || status === 'voided') {
      await supabase.from('customers').update({
        vertrags_status: 'STORNIERT',
      }).eq('id', customer.id)

      await supabase.from('vertrags_timeline').insert({
        customer_id: customer.id,
        ereignis: 'Vertrag abgelehnt',
        details: `DocuSign-Status: ${status}`,
      })

      await sendSlackNotification(
        'vertrieb',
        `*Vertrag abgelehnt*: ${customer.company_name} (${customer.angebots_nummer})`
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DocuSign webhook error:', err)
    return NextResponse.json({ ok: true }) // Immer 200 zurückgeben, sonst retry
  }
}
