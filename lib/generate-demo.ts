/**
 * Generiert eine personalisierte Demo-Config für einen Prospect.
 * Quelle: gescrapte Website-Daten (statt Onboarding-Transkript wie bei generate-site.ts).
 */

import Anthropic from '@anthropic-ai/sdk'
import { getTemplateSchema } from './template-schemas'
import { ScrapedProspect } from './scrape-prospect'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

function getDemoPrompt(templateId: string): string {
  const schema = getTemplateSchema(templateId)
  if (!schema) throw new Error(`Kein Template-Schema für "${templateId}" gefunden`)

  return `Du erstellst eine SALES-DEMO Website-Konfiguration für ein "${schema.label}" Template (Branche: ${schema.industry}).

Die Demo wird einem Interessenten VOR dem Kauf gezeigt. Sie soll ihn beeindrucken, weil sie sich anfühlt wie SEINE Firma — mit seinen echten Texten, Bildern und Kontaktdaten von seiner bestehenden Website.

Antworte NUR mit einem validen JSON-Objekt (kein Markdown, kein Codeblock, nur reines JSON).

Das JSON MUSS folgende Basis-Felder enthalten:
{
  "businessName": "Firmenname",
  "tagline": "Kurzer Slogan (max 80 Zeichen)",
  "heroHeadline": "Starke Headline",
  "heroAccent": "Das kursive Akzent-Wort in der Headline",
  "heroLead": "1-2 Sätze Untertitel für den Hero",
  "heroTag": "Badge-Text (kurz, z.B. 'Seit 2005' oder 'Meisterbetrieb')",
  "ctaText": "Call-to-Action Text",
  "colors": {
    "primary": "#hex", "secondary": "#hex", "accent": "#hex",
    "background": "#hex (hell)", "text": "#hex (dunkel)"
  },
  "phone": "Telefon falls in den Daten vorhanden",
  "email": "E-Mail falls vorhanden",
  "address": "Adresse falls vorhanden (Impressum!)",
  "stats": [{"value": "Zahl+", "label": "Beschreibung"}],
  "services": [{"icon": "emoji", "title": "Leistung", "description": "Beschreibung"}],
  "reviews": [{"text": "Bewertungstext", "name": "Name", "source": "Quelle", "rating": 5}],
  "faqItems": [{"question": "Frage", "answer": "Antwort"}],
  "trustItems": [{"text": "Vertrauens-Punkt"}],
  "aboutTitle": "Über uns Titel",
  "aboutText": "Über uns Text Absatz 1",
  "aboutText2": "Optional: Absatz 2",

  // TEMPLATE-SPEZIFISCHE FELDER (PFLICHT für dieses Template):
  ${schema.extraFields}
}

BRANCHENSPEZIFISCHE RICHTLINIEN:
${schema.industryHints}

DEMO-RICHTLINIEN:
- Nutze ALLE echten Informationen aus den gescrapten Website-Daten: Leistungen, Preise, Öffnungszeiten, Team-Namen, Firmengeschichte, Telefon, E-Mail, Adresse
- Formuliere die Texte deutlich BESSER als das Original: klar, modern, überzeugend — aber inhaltlich korrekt zur Firma
- BILDER: Wenn Bild-URLs mitgeliefert werden, setze sie in passende Bild-Felder ein (heroImageUrl, galleryItems[].imageUrl, team/artists/stylists[].imageUrl usw.). Nutze das inhaltlich am besten passende Bild für den Hero.
- Wenn echte Kundenstimmen in den Daten stehen, nutze sie. Sonst 2-3 generische, glaubwürdige Beispiel-Reviews mit Vornamen + Initial
- Erfinde KEINE konkreten Fakten (Gründungsjahr, Zertifikate, Mitarbeiterzahl), wenn sie nicht in den Daten stehen — nutze dann neutrale Formulierungen
- Farben: passend zur Branche und, falls erkennbar, zur bisherigen Markenfarbe
- Alle Texte auf Deutsch, Editorial-Tonalität, kein Marketing-Speak`
}

function buildUserMessage(
  prospectName: string,
  branche: string | null,
  scraped: ScrapedProspect | null,
  notes: string | null
): string {
  const parts: string[] = [`Firmenname: ${prospectName}`]
  if (branche) parts.push(`Branche: ${branche}`)
  if (notes) parts.push(`Notizen aus dem Qualifizierungs-Call:\n${notes}`)

  if (scraped) {
    parts.push(`\n=== GESCRAPTE DATEN DER BESTEHENDEN WEBSITE (${scraped.url}) ===`)
    if (scraped.title) parts.push(`Seitentitel: ${scraped.title}`)
    if (scraped.metaDescription) parts.push(`Meta-Beschreibung: ${scraped.metaDescription}`)
    if (scraped.phone) parts.push(`Telefon: ${scraped.phone}`)
    if (scraped.email) parts.push(`E-Mail: ${scraped.email}`)
    if (scraped.textContent) parts.push(`\nWebsite-Inhalte:\n${scraped.textContent}`)
    if (scraped.impressumText) parts.push(`\nImpressum:\n${scraped.impressumText}`)

    const allImages = [
      ...(scraped.logoUrl ? [`LOGO: ${scraped.logoUrl}`] : []),
      ...scraped.images.map((url, i) => `Bild ${i + 1}: ${url}`),
    ]
    if (allImages.length > 0) {
      parts.push(`\nVERFÜGBARE BILDER (URLs direkt in die Config einsetzen):\n${allImages.join('\n')}`)
    }
  } else {
    parts.push('\nKeine Website-Daten verfügbar — erstelle eine überzeugende Demo mit branchentypischen Inhalten.')
  }

  return parts.join('\n')
}

function parseJsonResponse(text: string): Record<string, unknown> {
  const cleaned = text.replace(/^```json?\n?/m, '').replace(/\n?```$/m, '').trim()
  return JSON.parse(cleaned) as Record<string, unknown>
}

export async function generateDemoConfig(
  prospectName: string,
  templateId: string,
  scraped: ScrapedProspect | null,
  branche: string | null = null,
  notes: string | null = null
): Promise<Record<string, unknown>> {
  const systemPrompt = getDemoPrompt(templateId)
  const userMessage = buildUserMessage(prospectName, branche, scraped, notes)

  // Ein Retry bei ungültigem JSON — häufigster Fehlerfall
  let lastError: unknown
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 6144,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    try {
      return parseJsonResponse(text)
    } catch (err) {
      lastError = err
    }
  }

  throw new Error(`Demo-Config konnte nicht generiert werden (ungültiges JSON): ${lastError}`)
}
