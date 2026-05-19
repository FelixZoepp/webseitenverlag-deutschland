import { SupabaseClient } from '@supabase/supabase-js'
import { generateSiteFromTranscript, type CustomerImage } from './generate-site'
import { fetchFirefliesTranscript } from './fireflies'
import { sendSlackNotification } from './slack'

export async function startBuildPipeline(
  supabase: SupabaseClient,
  customerId: string,
  transcript?: string,
  firefliesUrl?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Status: IN_BEARBEITUNG
    await supabase.from('customers').update({
      build_status: 'IN_BEARBEITUNG',
      build_gestartet_am: new Date().toISOString(),
      build_fehler: null,
    }).eq('id', customerId)

    // Kunde + Site laden
    const { data: customer } = await supabase
      .from('customers')
      .select('*, sites(*)')
      .eq('id', customerId)
      .single()

    if (!customer) throw new Error('Kunde nicht gefunden')

    const site = ((customer.sites || []) as Record<string, unknown>[])[0]
    if (!site) throw new Error('Keine Site gefunden')

    const siteId = site.id as string
    const templateId = (site.template_id as string) || 'business-basic'
    const companyName = (customer.company_name as string) || 'Unternehmen'
    const packageTier = (site.package as string) || (customer.package as string) || 'business'

    // ──── 1. Transkript beschaffen ────
    let finalTranscript = transcript || ''

    if (!finalTranscript && firefliesUrl) {
      const result = await fetchFirefliesTranscript(firefliesUrl)
      if (result) {
        finalTranscript = result.transcript
        await supabase.from('customers').update({
          fireflies_call_id: result.callId,
          fireflies_transkript: result.transcript,
          fireflies_notizen: result.notes,
        }).eq('id', customerId)
      }
    }

    if (!finalTranscript && customer.fireflies_transkript) {
      finalTranscript = customer.fireflies_transkript as string
    }

    if (!finalTranscript) {
      // Fallback: Nutze Closer-Notiz + Kundeninfos
      finalTranscript = [
        `Firma: ${companyName}`,
        customer.branche ? `Branche: ${customer.branche}` : '',
        customer.closer_notiz ? `Notizen: ${customer.closer_notiz}` : '',
        customer.ansprechpartner ? `Ansprechpartner: ${customer.ansprechpartner}` : '',
        customer.address || customer.strasse ? `Adresse: ${customer.strasse || ''}, ${customer.plz || ''} ${customer.ort || ''}` : '',
        customer.telefon ? `Telefon: ${customer.telefon}` : '',
        customer.contact_email ? `Email: ${customer.contact_email}` : '',
      ].filter(Boolean).join('\n')
    }

    // ──── 2. Bilder laden ────
    const { data: bilder } = await supabase
      .from('kunden_bilder')
      .select('slot_id, public_url, ki_zuordnung')
      .eq('customer_id', customerId)
      .eq('site_id', siteId)

    const customerImages: CustomerImage[] = (bilder || []).map(b => ({
      slot_id: b.slot_id as string | null,
      public_url: b.public_url as string,
      ki_zuordnung: b.ki_zuordnung as string | null,
    }))

    // ──── 3. KI-Generierung ────
    const config = await generateSiteFromTranscript(
      finalTranscript,
      companyName,
      packageTier as 'starter' | 'business' | 'growth',
      templateId,
      customerImages
    )

    // ──── 4. Config speichern ────
    await supabase.from('sites').update({
      config,
      draft_config: config,
      updated_at: new Date().toISOString(),
    }).eq('id', siteId)

    // Config-Version
    await supabase.from('config_versions').insert({
      site_id: siteId,
      config,
      created_by: 'system',
      description: `Build-Pipeline: ${companyName} mit ${customerImages.length} Bildern`,
    })

    // ──── 5. Status updaten ────
    await supabase.from('customers').update({
      build_status: 'FERTIG',
      build_fertig_am: new Date().toISOString(),
      onboarding_status: 'WEBSEITE_FERTIG',
      onboarding_completed: true,
    }).eq('id', customerId)

    // ──── 6. Timeline ────
    await supabase.from('vertrags_timeline').insert({
      customer_id: customerId,
      ereignis: 'Webseite automatisch generiert',
      details: `Build-Pipeline: ${templateId} Template mit ${customerImages.length} Bildern`,
    })

    // ──── 7. Slack ────
    await sendSlackNotification('vertrieb',
      `Webseite fertig: *${companyName}*\nTemplate: ${templateId} · ${customerImages.length} Bilder`
    )

    return { success: true }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unbekannter Fehler'

    await supabase.from('customers').update({
      build_status: 'FEHLER',
      build_fehler: errorMsg,
    }).eq('id', customerId)

    await sendSlackNotification('errors',
      `Build-Pipeline fehlgeschlagen: Kunde ${customerId}\n${errorMsg}`
    )

    return { success: false, error: errorMsg }
  }
}
