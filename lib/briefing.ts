import Anthropic from '@anthropic-ai/sdk'
import { SupabaseClient } from '@supabase/supabase-js'
import { erfasseNutzung } from './nutzung'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export interface BriefingData {
  briefingText: string
  generatedAt: string
}

export async function generatePreCallBriefing(
  supabase: SupabaseClient,
  customerId: string
): Promise<BriefingData> {
  // Alle Kundendaten laden
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single()

  if (!customer) throw new Error('Kunde nicht gefunden')

  // Bilder laden
  const { data: bilder } = await supabase
    .from('kunden_bilder')
    .select('slot_id, ki_zuordnung, dateiname')
    .eq('customer_id', customerId)

  // Dokumente laden
  const { data: dokumente } = await supabase
    .from('kunden_dokumente')
    .select('typ, dateiname')
    .eq('customer_id', customerId)

  // Site-Info
  const { data: sites } = await supabase
    .from('sites')
    .select('name, template_id, package')
    .eq('customer_id', customerId)

  const site = sites?.[0]
  const bilderInfo = (bilder || []).map(b => `- ${b.dateiname} → ${b.slot_id || b.ki_zuordnung || 'nicht zugeordnet'}`).join('\n')
  const docsInfo = (dokumente || []).map(d => `- ${d.dateiname} (${d.typ})`).join('\n')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6-20250514',
    max_tokens: 2000,
    temperature: 0.4,
    messages: [{
      role: 'user',
      content: `Du bist Assistent für Felix bei Webseiten-Verlag Deutschland.
Erstelle ein strukturiertes Pre-Call-Briefing für den Onboarding-Call mit diesem Kunden:

KUNDE: ${customer.company_name || '—'} (${customer.ansprechpartner || '—'})
EMAIL: ${customer.contact_email}
BRANCHE: ${customer.branche || 'unbekannt'}
PAKET: ${customer.package || site?.package || 'business'}
TEMPLATE: ${site?.template_id || 'noch nicht gewählt'}
CLOSER: ${customer.closer_name || '—'}
CLOSER-NOTIZ: ${customer.closer_notiz || 'keine'}

HOCHGELADENE BILDER (${(bilder || []).length}):
${bilderInfo || 'Keine Bilder hochgeladen'}

DOKUMENTE:
${docsInfo || 'Keine Dokumente'}

SALES-CALL-TRANSKRIPT:
${customer.fireflies_transkript ? customer.fireflies_transkript.substring(0, 3000) : 'Kein Transkript vorhanden'}

Erstelle das Briefing in diesem Format:

## Zusammenfassung
[2-3 Sätze: Wer ist der Kunde, was machen sie, was wollen sie]

## Material-Status
[Was wurde hochgeladen? Was fehlt noch?]

## Offene Fragen für den Call
[6-8 konkrete Fragen die im 30-Min-Call geklärt werden müssen]
- Fragen zu fehlenden Infos (Öffnungszeiten, Team, Leistungen)
- Fragen zu Stil/Tonalität
- Fragen zu speziellen Wünschen

## Empfehlungen
- Tonalität: [warm / professionell / modern / bodenständig]
- Hauptleistung: [welche vorne stehen sollte]
- Differenzierung: [was den Kunden besonders macht]

## Wichtige Phrasen aus dem Sales-Call
[Falls Transkript vorhanden: Original-Zitate die auf die Seite müssen]

## Technisches
- Template: ${site?.template_id || 'muss noch gewählt werden'}
- Bilder: ${(bilder || []).length} hochgeladen
- Hosting: über unsere Infrastruktur (multi_tenant, kein Kunden-Setup nötig)`,
    }],
  })
  await erfasseNutzung('claude_tokens', {
    tokensInput: response.usage.input_tokens,
    tokensOutput: response.usage.output_tokens,
    kontext: 'briefing',
  })

  const briefingText = response.content[0].type === 'text' ? response.content[0].text : ''

  return {
    briefingText,
    generatedAt: new Date().toISOString(),
  }
}
