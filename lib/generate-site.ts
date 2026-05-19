import Anthropic from '@anthropic-ai/sdk'
import { SiteConfig } from '@/types'
import { PackageTier, getPackage } from './packages'
import { getTemplateSchema } from './template-schemas'
import { isPremiumTemplate } from './templates'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

function getPremiumTemplatePrompt(templateId: string): string {
  const schema = getTemplateSchema(templateId)
  if (!schema) return ''

  return `Du erstellst eine Website-Konfiguration für ein "${schema.label}" Template (Branche: ${schema.industry}).

Antworte NUR mit einem validen JSON-Objekt (kein Markdown, kein Codeblock, nur reines JSON).

Das JSON MUSS folgende Basis-Felder enthalten:
{
  "businessName": "Firmenname",
  "tagline": "Kurzer Slogan (max 80 Zeichen)",
  "heroHeadline": "Starke Headline",
  "heroAccent": "Das kursive Akzent-Wort in der Headline",
  "heroLead": "1-2 Sätze Untertitel für den Hero",
  "heroTag": "Badge-Text (kurz, z.B. 'Seit 2005' oder 'Neu eröffnet')",
  "ctaText": "Call-to-Action Text",
  "colors": {
    "primary": "#hex (Hauptfarbe passend zur Branche)",
    "secondary": "#hex (Sekundärfarbe)",
    "accent": "#hex (Akzentfarbe)",
    "background": "#hex (Hintergrundfarbe, hell)",
    "text": "#hex (Textfarbe, dunkel)"
  },
  "phone": "Telefon falls erwähnt",
  "email": "E-Mail falls erwähnt",
  "address": "Adresse falls erwähnt",
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

Schema.org Typ für diese Branche: ${schema.schemaType}

ALLGEMEINE RICHTLINIEN:
- Verwende NUR Informationen aus dem Transkript, erfinde keine Fakten
- Wenn etwas nicht erwähnt wird, setze sinnvolle Defaults passend zur Branche
- Erstelle 3-6 FAQ-Einträge passend zur Branche
- 3-5 Stats basierend auf dem Transkript oder branchenübliche Defaults
- 3-5 Services/Leistungen basierend auf dem Transkript
- 3+ Reviews falls im Transkript Kundenstimmen erwähnt werden, sonst leere Liste
- Alle Texte auf Deutsch
- Editorial-Tonalität, kein Marketing-Speak`
}

function getStarterPrompt(): string {
  return `Du erstellst eine One-Pager Website-Konfiguration (STARTER-Paket).

Antworte NUR mit einem validen JSON-Objekt (kein Markdown, kein Codeblock, nur reines JSON).

Das JSON muss folgende Felder enthalten:
{
  "businessName": "Firmenname",
  "tagline": "Kurzer, einprägsamer Slogan (max 80 Zeichen)",
  "description": "Beschreibung des Unternehmens (2-3 Sätze)",
  "primaryColor": "#hex (passend zur Branche)",
  "secondaryColor": "#hex (heller Akzent)",
  "backgroundColor": "#faf8f4",
  "textColor": "#1a2218",
  "heroSubtitle": "Untertitel für den Hero-Bereich (1-2 Sätze)",
  "heroBadge": "Optional: kurzer Badge-Text oder leer",
  "ctaText": "Call-to-Action Text",
  "ownerName": "Name des Inhabers falls erwähnt",
  "ownerRole": "Rolle",
  "aboutText": "Über-uns Text Absatz 1",
  "aboutText2": "Über-uns Text Absatz 2",
  "region": "Region/Gebiet falls erwähnt",
  "phone": "Telefonnummer falls erwähnt",
  "email": "E-Mail falls erwähnt",
  "address": "Adresse falls erwähnt",
  "stats": [{"value": "Zahl+", "label": "Beschreibung"}],
  "services": [{"icon": "emoji", "title": "Dienstleistung", "description": "Beschreibung"}],
  "reviews": [{"text": "Bewertungstext", "name": "Name", "source": "Quelle"}],
  "faqItems": [{"question": "Frage", "answer": "Antwort"}],
  "sections": [
    {"id": "hero", "type": "hero", "visible": true, "order": 0},
    {"id": "intro", "type": "intro", "title": "Passender Titel", "visible": true, "order": 1},
    {"id": "services", "type": "services", "title": "Passender Titel", "visible": true, "order": 2},
    {"id": "reviews", "type": "reviews", "visible": true, "order": 3},
    {"id": "about", "type": "about", "visible": true, "order": 4},
    {"id": "cta", "type": "cta", "title": "Passender Kontakt-Titel", "visible": true, "order": 5},
    {"id": "faq", "type": "faq", "visible": true, "order": 6}
  ]
}

Richtlinien:
- Verwende nur Informationen aus dem Transkript, erfinde keine Fakten
- Wenn etwas nicht erwähnt wird, lass das Feld leer oder setze sinnvolle Defaults
- Wähle Farben passend zur Branche
- Alle Texte auf Deutsch`
}

function getMultiPagePrompt(tier: PackageTier): string {
  const pkg = getPackage(tier)
  const maxPages = pkg.maxPages
  const includeSchemaOrg = pkg.schemaOrg
  const seoLevel = pkg.seoLevel

  return `Du erstellst eine Multi-Page Website-Konfiguration (${tier.toUpperCase()}-Paket, bis zu ${maxPages} Seiten).

Antworte NUR mit einem validen JSON-Objekt (kein Markdown, kein Codeblock, nur reines JSON).

Das JSON muss folgendes Format haben:
{
  "site": {
    "name": "Firmenname",
    "colors": { "primary": "#hex", "secondary": "#hex", "background": "#faf8f4", "text": "#1a2218" },
    "branding": { "logoText": "Firmenname oder Kurzform" },
    "navigation": ["home", "services", "about", "contact"],
    "footer": { "text": "Firmenbeschreibung", "legalLinks": [{"label": "Impressum", "pageKey": "legal-imprint"}, {"label": "Datenschutz", "pageKey": "legal-privacy"}] }
    ${includeSchemaOrg ? `,"schemaOrg": { "@type": "LocalBusiness", "name": "Name", "description": "Beschreibung", "address": {"@type": "PostalAddress", "streetAddress": "", "addressLocality": "", "addressCountry": "DE"}, "telephone": "", "email": "", "areaServed": [] }` : ''}
  },
  "pages": {
    "home": { "template": "home", "slug": "", "title": "Startseite", "metaDescription": "SEO-Beschreibung", "config": { "hero": {"headline": "", "subtitle": "", "ctaText": "", "ctaLink": "contact"}, "highlights": [{"value": "", "label": ""}] } },
    "services": { "template": "services", "slug": "leistungen", "title": "Leistungen", "metaDescription": "", "config": { "title": "", "intro": "", "items": [{"icon": "", "title": "", "description": ""}] } },
    "about": { "template": "about", "slug": "ueber-uns", "title": "Über uns", "metaDescription": "", "config": { "title": "", "story": "", "team": [{"name": "", "role": ""}] } },
    "contact": { "template": "contact", "slug": "kontakt", "title": "Kontakt", "metaDescription": "", "config": { "title": "", "address": "", "phone": "", "email": "", "hours": "" } },
    "legal-imprint": { "template": "legal-imprint", "slug": "impressum", "title": "Impressum", "config": { "companyName": "", "address": "", "ceo": "", "phone": "", "email": "" } },
    "legal-privacy": { "template": "legal-privacy", "slug": "datenschutz", "title": "Datenschutz", "config": { "companyName": "", "address": "", "email": "" } }
  }
}

Richtlinien:
- Verwende nur Informationen aus dem Transkript
- Alle Texte auf Deutsch
${seoLevel !== 'basic' ? '- LOKALES SEO: metaDescription mit Stadt/Region, lokale Keywords in Texten' : ''}
${includeSchemaOrg ? '- Schema.org LocalBusiness Daten vollständig ausfüllen' : ''}`
}

export interface CustomerImage {
  slot_id: string | null
  public_url: string
  ki_zuordnung: string | null
}

export async function generateSiteFromTranscript(
  transcript: string,
  companyName: string,
  packageTier: PackageTier = 'starter',
  templateId?: string,
  customerImages?: CustomerImage[]
): Promise<SiteConfig> {
  let systemPrompt: string

  if (templateId && isPremiumTemplate(templateId)) {
    systemPrompt = getPremiumTemplatePrompt(templateId)
  } else if (packageTier !== 'starter') {
    systemPrompt = getMultiPagePrompt(packageTier)
  } else {
    systemPrompt = getStarterPrompt()
  }

  // Bilder-Info zum Prompt hinzufügen
  let bilderInfo = ''
  if (customerImages && customerImages.length > 0) {
    const bilderLines = customerImages.map((img) => {
      const slot = img.slot_id || img.ki_zuordnung || 'unbekannt'
      return `- Slot "${slot}": ${img.public_url}`
    }).join('\n')

    bilderInfo = `\n\nVERFÜGBARE KUNDEN-BILDER (nutze diese URLs in der Config):
${bilderLines}

WICHTIG: Setze die Bild-URLs in die passenden Felder ein:
- "hero" → heroImageUrl
- "artist-1", "artist-2", "artist-3" → artists[0].imageUrl, artists[1].imageUrl, etc.
- "portfolio-1" bis "portfolio-6" → portfolioItems[0].imageUrl bis portfolioItems[5].imageUrl
- "team-1", "team-2" → stylists/team/trainers[].imageUrl
- "gallery-1" bis "gallery-N" → galleryItems[].imageUrl
- "owner" → ownerImageUrl oder als erster artists/team-Eintrag
- "studio" → als galleryItem oder Hero-Alternative`
  }

  const maxTokens = templateId && isPremiumTemplate(templateId) ? 6144 : (packageTier !== 'starter' ? 8192 : 4096)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6-20250514',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Firmenname: ${companyName}${templateId ? `\nTemplate: ${templateId}` : ''}\nPaket: ${packageTier.toUpperCase()}\n\nOnboarding-Transkript/Briefing:\n\n${transcript}${bilderInfo}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const cleaned = text.replace(/^```json?\n?/m, '').replace(/\n?```$/m, '').trim()

  try {
    return JSON.parse(cleaned) as SiteConfig
  } catch {
    throw new Error('KI-Antwort konnte nicht als JSON geparst werden. Bitte versuche es erneut.')
  }
}
