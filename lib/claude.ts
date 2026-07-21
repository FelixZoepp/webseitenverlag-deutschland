import Anthropic from '@anthropic-ai/sdk'
import { SiteConfig, isMultiPageConfig } from '@/types'
import { UPSELL_MODULES } from '@/lib/upsells'
import { getPackage, type PackageTier } from './packages'
import { getLeitplankenPrompt } from './editor-leitplanken'
import { getOpsPrompt } from './editor-ops'
import { erfasseNutzung } from './nutzung'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// ============================================================
// Kunden-Kontext für den Chatbot
// ============================================================

export interface CustomerContext {
  kundenName: string
  branche: string
  paket: PackageTier
  aktuelleSeitenzahl: number
  maxSeiten: number
  aktiveUpsells: string[]          // IDs
  vertragsmonat: number            // z.B. 5 von 48
  vertragsMonate: number           // 48
  abgelehntUpsellsLetzterMonat: string[] // IDs, die in den letzten 30 Tagen abgelehnt wurden
}

// ============================================================
// System-Prompt Builder
// ============================================================

function buildUpsellTriggerList(aktiveUpsells: string[]): string {
  return UPSELL_MODULES
    .filter((m) => !aktiveUpsells.includes(m.id))
    .map((m) => `- ${triggerDescription(m.id)} → biete "${m.name}" (${m.preisProMonatCent / 100}€/Mt) an`)
    .join('\n')
}

function triggerDescription(id: string): string {
  const map: Record<string, string> = {
    'karriere-seite': 'Karriere-Bereich / Stellenausschreibungen erstellen',
    'bewertungs-maschine': 'Bewertungen anzeigen / Reviews einsammeln',
    '247-besucher-chatbot': 'Live-Chat-Widget für Besucher',
    'newsletter-maschine': 'Newsletter-Anmeldung einbauen',
    'termin-buchung': 'Buchungs-Kalender / Terminbuchung einbinden',
    'whatsapp-connector': 'WhatsApp-Button hinzufügen',
    'lead-magnet': 'Pop-up / Lead-Magnet einbauen',
    'mehrsprachigkeit': 'Zusätzliche Sprache hinzufügen',
    'mini-shop': 'Shop / Bestellformular / Produkte verkaufen',
    'retargeting-pixel': 'Retargeting / Marketing-Pixel einrichten',
    'click-to-call': 'Anruf-Tracking einrichten',
    'live-dashboard': 'Live-Statistiken / Dashboard anzeigen',
  }
  return map[id] || id
}

function buildBranchenTipps(branche: string): string {
  const tipps: Record<string, string> = {
    'handwerk': 'Handwerks-Kunden profitieren besonders von Termin-Buchung (70% der Anfragen kommen abends/am Wochenende) und WhatsApp-Kontakt.',
    'gastronomie': 'Restaurants und Cafés profitieren besonders von einem Mini-Shop (Bestellungen) und Bewertungs-Maschine.',
    'einzelhandel': 'Einzelhändler profitieren besonders von einem Mini-Shop und Click-to-Call-Tracking.',
    'dienstleistung': 'Dienstleister profitieren besonders von Termin-Buchung und Lead-Magnet-Funnels.',
    'arzt': 'Arztpraxen profitieren besonders von Termin-Buchung und Mehrsprachigkeit.',
    'immobilien': 'Immobilien-Unternehmen profitieren besonders von Lead-Magnet-Funnels und Live-Dashboard.',
    'rechtsanwalt': 'Kanzleien profitieren besonders von Termin-Buchung und einem professionellen Besucher-Chatbot.',
  }
  const lower = branche.toLowerCase()
  for (const [key, tipp] of Object.entries(tipps)) {
    if (lower.includes(key)) return tipp
  }
  return ''
}

function buildEditorPrompt(
  ctx: CustomerContext,
  currentPage: string | undefined,
  isMultiPage: boolean,
  bildListe?: string
): string {
  const pkg = getPackage(ctx.paket)
  const branchenTipp = buildBranchenTipps(ctx.branche)
  const upsellTriggers = buildUpsellTriggerList(ctx.aktiveUpsells)

  const paketUpgrade = ctx.paket === 'starter'
    ? `Business-Paket (${50}€ mehr/Mt, bis zu 5 Seiten + Lokales SEO + Strukturierte Daten)`
    : ctx.paket === 'business'
    ? `Growth-Paket (${100}€ mehr/Mt, bis zu 10 Seiten + 4 SEO-Artikel/Mt + Performance-Report)`
    : null

  return `Du bist der KI-Editor von WEBSEITENVERLAG DEUTSCHLAND. Du hilfst dem Kunden,
seine Webseite zu bearbeiten und schlägst sinnvolle Erweiterungen vor.

# DEINE PERSÖNLICHKEIT
- Freundlich, professionell, kompetent
- Wie ein erfahrener Web-Berater, nicht wie ein Verkäufer
- Du SIEZT den Kunden
- Antwortest knapp und konkret, keine Floskeln
- Antworte immer auf Deutsch

# KUNDEN-KONTEXT
- Kunde: ${ctx.kundenName}
- Branche: ${ctx.branche}
- Aktuelles Paket: ${ctx.paket} (${pkg.price}€/Monat)
- Aktive Unterseiten: ${ctx.aktuelleSeitenzahl} / ${ctx.maxSeiten}
- Aktive Upsells: ${ctx.aktiveUpsells.length > 0 ? ctx.aktiveUpsells.join(', ') : 'keine'}
- Vertrag: Monat ${ctx.vertragsmonat} von ${ctx.vertragsMonate}
${branchenTipp ? `\n# BRANCHEN-WISSEN\n${branchenTipp}` : ''}

${getLeitplankenPrompt()}

# WAS DU DARFST (in allen Paketen)
✅ Texte auf bestehenden Seiten ändern
✅ Bilder austauschen
✅ Farben anpassen (innerhalb des Brand-Systems)
✅ Schriftgrößen, Reihenfolge von Elementen ändern
✅ Headlines, Untertitel, Buttons-Texte ändern
✅ Kontaktdaten ändern (Telefon, Email, Adresse, Öffnungszeiten)
✅ Meta-Description, Page-Title, Favicon, Logo ändern
✅ Social-Media-Links hinzufügen/ändern

# WAS DU LIMITIERT DARFST (paket-abhängig)
🟡 Neue Unterseiten anlegen:
   - Aktuelles Limit: ${ctx.maxSeiten} Seiten (${ctx.paket}-Paket)
   - Aktuell genutzt: ${ctx.aktuelleSeitenzahl} Seiten

   Bei Limit-Erreichen IMMER zwei Optionen anbieten:
   1. Upgrade auf nächstes Paket${paketUpgrade ? ` (${paketUpgrade})` : ''}
   2. Inhalt als Sektion auf bestehende Seite einbauen (kostenlos)

# WAS DU NIE DIREKT TUST (= UPSELL-TRIGGER)
Wenn der Kunde eine dieser Funktionen anfragt, biete das entsprechende Modul an:
${upsellTriggers}

# UPSELL-DIALOG-LOGIK
Wenn der Kunde eine Funktion anfragt, die ein Upsell-Modul erfordert:

WICHTIG: Bei einem Upsell-Vorschlag darfst du KEINEN patch_ops-Block senden! Du darfst die Website NICHT verändern!
Du schlägst NUR das Modul vor und wartest auf die Entscheidung des Kunden.

1. ANERKENNEN: Bestätige, dass die Idee Sinn ergibt und warum
2. EINORDNEN: Erkläre, dass das eine eigene Funktion in unserem System ist
3. ANGEBOT: Konkreter Preis + Was-genau-passiert
4. ALTERNATIVE (wenn möglich): Kostenlose Variante anbieten
5. RESPEKT: Bei Ablehnung niemals nachhaken im selben Gespräch

Formatiere das Angebot so:
"[Anerkennung]. Das ist eine eigene Funktion in unserem System: [Was es macht].
Möchten Sie das aktivieren? Es kostet [Preis]€/Monat."

NIEMALS gleichzeitig einen <upsell_suggestion> UND einen <patch_ops> Block senden!

Wenn du ein Upsell vorschlägst, füge am Ende IMMER diesen Block ein (und NUR diesen, KEINE patch_ops):
<upsell_suggestion>
{"upsellId": "modul-id", "action": "suggest"}
</upsell_suggestion>

# PROAKTIVE UPSELL-LOGIK
Wenn der Kunde eine NORMALE Änderung anfragt, prüfe nach Abschluss der Änderung,
ob ein kontext-relevanter Upsell sinnvoll ist. Aber NIE mehr als 1 pro Gespräch.
Und NIE folgende Module vorschlagen (wurden kürzlich abgelehnt): ${ctx.abgelehntUpsellsLetzterMonat.join(', ') || 'keine'}

# UPGRADE-VORSCHLAG bei Seitenlimit
Wenn Kunde eine neue Unterseite anfragt und Limit erreicht:
${paketUpgrade
    ? `"Aktuell haben Sie ${ctx.aktuelleSeitenzahl}/${ctx.maxSeiten} Seiten in Ihrem ${ctx.paket}-Paket.
Für eine neue Seite würde ich Sie auf das nächste Paket upgraden: ${paketUpgrade}.
Alternative: Ich kann den Inhalt auch als neue Sektion direkt auf eine bestehende Seite einbauen – kostet Sie nichts."`
    : `"Sie haben bereits das höchste Paket (Growth) mit ${ctx.maxSeiten} Seiten.
Ich kann den gewünschten Inhalt als neue Sektion auf eine bestehende Seite einbauen – das ist die beste Lösung."`}

# WAS DU ESKALIERST (an menschlichen Support)
🆘 Domain-Änderungen, SSL-Probleme, Hosting-Migration
🆘 Rechtliche Fragen
🆘 Beschwerden / Kündigungswünsche
🆘 Technische Fehler, die du nicht lösen kannst
→ Sage: "Das leite ich an unser Support-Team weiter. Sie erhalten kurzfristig eine Rückmeldung."

# WAS DU NIE TUST
❌ Niemals aggressiv verkaufen
❌ Niemals mehrere Upsells gleichzeitig vorschlagen
❌ Niemals den gleichen Upsell mehrfach im selben Gespräch
❌ Niemals Druckaufbau ("nur heute", "letzte Chance")
❌ Niemals Preise erfinden oder verhandeln
❌ Niemals technische Fehler ignorieren oder beschönigen

${isMultiPage && currentPage ? buildMultiPageEditorSection(currentPage, bildListe, ctx.paket) : buildSinglePageEditorSection(bildListe, ctx.paket)}
`
}

function buildSinglePageEditorSection(bildListe?: string, tier?: PackageTier): string {
  return `# EDITOR-FELDER (Single-Page)

Text-Pfade (update_text):
- businessName, tagline, description — Grundtexte
- email, address — Kontaktdaten (Telefon ist gesperrt → Fakten-Check)
- heroSubtitle, heroBadge — Hero-Bereich
- ctaText — Call-to-Action-Text (max. 30 Zeichen)
- ownerName, ownerRole — Inhaber-Info
- aboutText, aboutText2 — Über-uns-Texte
- region — Regionsbezeichnung
- services.<index>.title / .description, faqItems.<index>.question / .answer, stats.<index>.value / .label, reviews.<index>.text

Bild-Pfade (swap_image_from_bank):
- heroImageUrl, ctaImageUrl, ownerImageUrl, galleryImages.<index>

Sektionen (add_section_from_library / reorder / toggle):
- sections — Array mit {id, type, title, visible, order}

${getOpsPrompt(bildListe, tier)}`
}

function buildMultiPageEditorSection(currentPage: string, bildListe?: string, tier?: PackageTier): string {
  return `# EDITOR-FUNKTIONEN (Multi-Page)

Aktuell aktive Seite: "${currentPage}"

KONTEXT-REGELN:
- "Ändere die Headline" → Headline auf der aktuellen Seite (pages.${currentPage}.config.*)
- "Ändere die Farbe" → globale Änderung (site.colors.*)
- "Auf der Über-uns-Seite ändere X" → pages.about.config.*
- Neue Sektionen: auf der aktuellen Seite, außer User sagt explizit anders
- KEINE NEUEN PAGES ERSTELLEN. Bei "erstelle eine neue Seite" antworte: "Neue Seiten können Sie im Page-Manager links anlegen."

KONFIG-STRUKTUR (Pfade für update_text / swap_image_from_bank):
- site.name — Firmenname
- site.branding.logoText — Logo-Text
- site.footer.text — Footer-Text
- pages.${currentPage}.title — Seitentitel
- pages.${currentPage}.config.* — Seitenspezifische Inhalte
- Farben NIE über Pfade — nur set_theme_preset

Für Page-Configs je nach Template:
- home: pages.home.config.hero.headline / .subtitle / .imageUrl / .badge / .ctaText
- about: pages.about.config.title / .story / .story2 / .imageUrl
- services: pages.services.config.title / .intro / .items.<index>.title / .description
- contact: pages.contact.config.title / .address / .email / .hours (Telefon gesperrt → Fakten-Check)

${getOpsPrompt(bildListe, tier)}`
}

// ============================================================
// Haupt-Chat-Funktion (erweitert um Kunden-Kontext)
// ============================================================

export async function chatWithClaude(
  messages: { role: 'user' | 'assistant'; content: string }[],
  currentConfig: SiteConfig,
  currentPage?: string,
  customerContext?: CustomerContext,
  /** Formatierte Liste tauschbarer Bank-Bilder (lib/editor-ops.formatiereBildListe). */
  bildListe?: string
): Promise<{
  response: string
  /** Rohe, UNVALIDIERTE Ops aus dem <patch_ops>-Block — Validierung passiert serverseitig (lib/editor-ops). */
  patchOps: unknown | null
  upsellSuggestion: { upsellId: string; action: string } | null
}> {
  const isMultiPage = isMultiPageConfig(currentConfig)

  // Fallback: wenn kein Kunden-Kontext, nutze einfachen Prompt
  const systemPrompt = customerContext
    ? buildEditorPrompt(customerContext, currentPage, isMultiPage, bildListe)
    : (isMultiPage && currentPage ? buildMultiPageEditorSection(currentPage, bildListe) : buildSinglePageEditorSection(bildListe))

  const configContext = `\n\nAktuelle Website-Konfiguration:\n${JSON.stringify(currentConfig, null, 2)}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6-20250514',
    max_tokens: 1024,
    temperature: 0.5,
    system: systemPrompt + configContext,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  })
  await erfasseNutzung('claude_tokens', {
    tokensInput: response.usage.input_tokens,
    tokensOutput: response.usage.output_tokens,
    kontext: 'chat-editor',
  })

  const text =
    response.content[0].type === 'text' ? response.content[0].text : ''

  // Parse patch_ops (roh — Zod-Validierung übernimmt die Route über lib/editor-ops)
  const opsMatch = text.match(/<patch_ops>\n?([\s\S]*?)\n?<\/patch_ops>/)
  let patchOps: unknown | null = null
  if (opsMatch) {
    try {
      patchOps = JSON.parse(opsMatch[1])
    } catch {
      // Ungültiges JSON — wird wie ein abgewiesener Patch behandelt (null)
    }
  }

  // Parse upsell_suggestion
  const upsellMatch = text.match(/<upsell_suggestion>\n?([\s\S]*?)\n?<\/upsell_suggestion>/)
  let upsellSuggestion: { upsellId: string; action: string } | null = null
  if (upsellMatch) {
    try {
      upsellSuggestion = JSON.parse(upsellMatch[1])
    } catch {
      // Invalid JSON — ignore
    }
  }

  const cleanResponse = text
    .replace(/<patch_ops>[\s\S]*?<\/patch_ops>/g, '')
    .replace(/<config_changes>[\s\S]*?<\/config_changes>/g, '')
    .replace(/<upsell_suggestion>[\s\S]*?<\/upsell_suggestion>/g, '')
    .trim()

  return { response: cleanResponse, patchOps, upsellSuggestion }
}
