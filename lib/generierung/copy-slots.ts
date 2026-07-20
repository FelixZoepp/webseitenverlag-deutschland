/**
 * Phase 3 (MVP_FINISH_PROMPT §4.2): Copy-Slot-Generierung.
 *
 * Claude füllt AUSSCHLIESSLICH definierte Copy-Slots als JSON.
 * Harte Gates VOR Weiterverarbeitung:
 *  - Zod: Pflichtslots + Zeichenlimits
 *  - Floskel-Blacklist (lib/floskel-blacklist)
 *  - Kundenstadt muss in H1 (Hero-Headline) UND im SEO-Titel vorkommen
 * Max. 3 Durchläufe (1 + 2 Retries mit konkretem Fehler-Feedback),
 * danach wirft die Funktion einen menschenlesbaren Fehler.
 */

import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { FLOSKEL_BLACKLIST, pruefeContentAufFloskeln } from '@/lib/floskel-blacklist'
import { erfasseNutzung } from '@/lib/nutzung'
import type { FlagshipConfig } from '@/lib/flagship/types'
import { stadtBestandteile } from './staedte-blockliste'

/** Geschäftsprofil aus dem 2-Minuten-Formular (§4.1) — EINZIGE Datenquelle */
export interface BusinessProfil {
  firma: string
  brancheKey: string
  stadt: string
  telefon: string
  /** 3–8 Leistungen */
  leistungen: string[]
  usps?: string[]
  oeffnungszeiten?: string[]
  notizen?: string | null
}

// ------------------------------------------------------------
// Zod-Schema: Pflichtslots + Zeichenlimits (§4.2)
// ------------------------------------------------------------

const zeile = (max: number) => z.string().trim().min(1).max(max)

export function baueCopySlotsSchema(anzahlLeistungen: number) {
  return z.object({
    hero_eyebrow: zeile(60),
    hero_headline_zeilen: z.array(zeile(38)).min(2).max(3),
    hero_lead: zeile(240),
    hero_chips: z.array(zeile(30)).length(3),
    fakten_punkte: z.array(zeile(95)).length(4),
    empathie_headline: zeile(75),
    empathie_text: zeile(340),
    leistungen_karten: z
      .array(z.object({ titel: zeile(42), text: zeile(170) }))
      .length(anzahlLeistungen),
    faq_fragen: z
      .array(z.object({ frage: zeile(95), antwort: zeile(320) }))
      .min(4)
      .max(6),
    conversion_headline: zeile(75),
    conversion_lead: zeile(220),
    seo_titel: zeile(60),
    seo_beschreibung: zeile(160),
    footer_beschreibung: zeile(220),
  })
}

export type CopySlots = z.infer<ReturnType<typeof baueCopySlotsSchema>>

export interface CopySlotsErgebnis {
  slots: CopySlots
  /** Anzahl Claude-Durchläufe (1–3) */
  versuche: number
  kostenCent: number
}

// ------------------------------------------------------------
// Gates
// ------------------------------------------------------------

/** Entfernt die [[highlight]]-Marker für Textprüfungen */
function ohneHighlights(s: string): string {
  return s.replace(/\[\[|\]\]/g, '')
}

/** Prüft, ob ein Bestandteil der Kundenstadt im Text vorkommt */
export function enthaeltStadt(text: string, stadt: string): boolean {
  const t = ohneHighlights(text).toLowerCase()
  return stadtBestandteile(stadt).some((teil) => t.includes(teil))
}

/** Sammelt alle Gate-Verstöße (leer = bestanden) */
export function pruefeCopySlots(slots: CopySlots, profil: BusinessProfil): string[] {
  const fehler: string[] = []

  const floskeln = pruefeContentAufFloskeln(slots as unknown as Record<string, unknown>)
  for (const f of floskeln) fehler.push(`Verbotene Floskel in ${f.pfad}: "${f.floskel}"`)

  const h1 = slots.hero_headline_zeilen.join(' ')
  if (!enthaeltStadt(h1, profil.stadt)) {
    fehler.push(`Die Kundenstadt "${profil.stadt}" fehlt in der Hero-Headline (H1): "${h1}"`)
  }
  if (!enthaeltStadt(slots.seo_titel, profil.stadt)) {
    fehler.push(`Die Kundenstadt "${profil.stadt}" fehlt im SEO-Titel: "${slots.seo_titel}"`)
  }

  return fehler
}

// ------------------------------------------------------------
// Prompt
// ------------------------------------------------------------

function bauePrompt(profil: BusinessProfil, brancheName: string): { system: string; user: string } {
  const system = `Du schreibst die Texte einer Verkaufs-Demo-Website für einen lokalen deutschen Betrieb.

AUFGABE: Fülle AUSSCHLIESSLICH die folgenden Copy-Slots. Antworte NUR mit einem JSON-Objekt, keinem anderen Text.

SLOTS (Feld → Typ, Zeichenlimit):
{
  "hero_eyebrow": "string, max 60 Zeichen — kurze Einordnung (Branche + Stadt)",
  "hero_headline_zeilen": ["2-3 Zeilen, je max 38 Zeichen. Die Stadt ${profil.stadt} MUSS vorkommen. Genau EIN Wort pro Headline als [[wort]] markieren (Highlight)."],
  "hero_lead": "string, max 240 — konkreter Nutzen, keine Werbephrasen",
  "hero_chips": ["genau 3 Chips, je max 30 Zeichen — konkrete Vorteile"],
  "fakten_punkte": ["genau 4 Punkte, je max 95 Zeichen, je genau EIN Wort als [[wort]] markiert"],
  "empathie_headline": "string, max 75",
  "empathie_text": "string, max 340 — spricht das Problem des Kunden an",
  "leistungen_karten": [genau ${profil.leistungen.length} Objekte { "titel": max 42, "text": max 170 } — EXAKT in dieser Reihenfolge zu den Leistungen unten],
  "faq_fragen": [4-6 Objekte { "frage": max 95, "antwort": max 320 }],
  "conversion_headline": "string, max 75",
  "conversion_lead": "string, max 220",
  "seo_titel": "string, max 60 — MUSS Firma oder Leistung UND die Stadt ${profil.stadt} enthalten",
  "seo_beschreibung": "string, max 160",
  "footer_beschreibung": "string, max 220"
}

REGELN:
1. Sprache: Deutsch, redaktionelle Qualität, kurze Sätze, konkret statt werblich.
2. Erfinde KEINE Fakten (keine Jahreszahlen, Zertifikate, Mitarbeiterzahlen, Bewertungen). Nutze nur die Daten unten.
3. Erwähne KEINE andere Stadt als ${profil.stadt}. Keine Nachbarorte, keine Beispielstädte.
4. VERBOTENE FLOSKELN (dürfen NIRGENDS vorkommen): ${FLOSKEL_BLACKLIST.join(' | ')}
5. Halte alle Zeichenlimits strikt ein.
6. Kein Lorem ipsum, keine Platzhalter, keine {{Tokens}}.`

  const teile: string[] = [
    `Firmenname: ${profil.firma}`,
    `Branche: ${brancheName}`,
    `Stadt: ${profil.stadt}`,
    `Telefon: ${profil.telefon}`,
    `Leistungen (Reihenfolge fix):\n${profil.leistungen.map((l, i) => `${i + 1}. ${l}`).join('\n')}`,
  ]
  if (profil.usps?.length) teile.push(`Besonderheiten (USPs):\n${profil.usps.map((u) => `- ${u}`).join('\n')}`)
  if (profil.oeffnungszeiten?.length) teile.push(`Öffnungszeiten:\n${profil.oeffnungszeiten.join('\n')}`)
  if (profil.notizen) teile.push(`Notizen:\n${profil.notizen}`)

  return { system, user: teile.join('\n\n') }
}

function parseJsonAntwort(text: string): unknown {
  const bereinigt = text.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim()
  return JSON.parse(bereinigt)
}

/** claude-sonnet-4-6: $3/MTok Input, $15/MTok Output → Cent */
function tokenKostenCent(input: number, output: number): number {
  return Math.ceil((input * 300 + output * 1500) / 1_000_000)
}

// ------------------------------------------------------------
// Generierung (max 1 + 2 Retries)
// ------------------------------------------------------------

export async function generiereCopySlots(
  profil: BusinessProfil,
  brancheName: string
): Promise<CopySlotsErgebnis> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY fehlt — Copy-Generierung nicht möglich.')
  }
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const schema = baueCopySlotsSchema(profil.leistungen.length)
  const { system, user } = bauePrompt(profil, brancheName)
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: user }]

  let kostenCent = 0
  let letzteFehler: string[] = []

  for (let versuch = 1; versuch <= 3; versuch++) {
    let text = ''
    try {
      const res = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8192,
        temperature: 0.4,
        system,
        messages,
      })
      kostenCent += tokenKostenCent(res.usage.input_tokens, res.usage.output_tokens)
      await erfasseNutzung('claude_tokens', {
        tokensInput: res.usage.input_tokens,
        tokensOutput: res.usage.output_tokens,
        kontext: 'phase3-copy-slots',
      })
      text = res.content.find((c) => c.type === 'text')?.text ?? ''

      const geparst = schema.safeParse(parseJsonAntwort(text))
      if (!geparst.success) {
        letzteFehler = geparst.error.issues.map(
          (i) => `Slot "${i.path.join('.')}" ungültig: ${i.message}`
        )
      } else {
        letzteFehler = pruefeCopySlots(geparst.data, profil)
        if (letzteFehler.length === 0) {
          return { slots: geparst.data, versuche: versuch, kostenCent }
        }
      }
    } catch (e) {
      letzteFehler = [`Claude-Antwort nicht verwertbar: ${(e as Error).message}`]
    }

    if (versuch < 3) {
      messages.push(
        { role: 'assistant', content: text || '(keine verwertbare Antwort)' },
        {
          role: 'user',
          content: `Deine Antwort hat die Qualitätsprüfung NICHT bestanden:\n${letzteFehler
            .map((f) => `- ${f}`)
            .join('\n')}\n\nKorrigiere genau diese Punkte und gib das VOLLSTÄNDIGE JSON erneut aus.`,
        }
      )
    }
  }

  throw new Error(
    `Copy-Generierung nach 3 Versuchen abgebrochen. Letzte Fehler: ${letzteFehler.join('; ')}`
  )
}

// ------------------------------------------------------------
// Anwendung auf die FlagshipConfig
// ------------------------------------------------------------

/** Überträgt die generierten Slots in eine (geklonte) FlagshipConfig */
export function wendeCopySlotsAn(
  config: FlagshipConfig,
  slots: CopySlots,
  profil: BusinessProfil
): FlagshipConfig {
  const c: FlagshipConfig = JSON.parse(JSON.stringify(config))

  c.meta.seo_titel = slots.seo_titel
  c.meta.seo_beschreibung = slots.seo_beschreibung

  c.inhalte.hero.eyebrow = slots.hero_eyebrow
  c.inhalte.hero.headline_zeilen = slots.hero_headline_zeilen
  c.inhalte.hero.lead = slots.hero_lead
  c.inhalte.hero.chips = slots.hero_chips

  c.inhalte.fakten.punkte = slots.fakten_punkte.map((text, i) => ({
    text,
    icon: c.inhalte.fakten.punkte[i]?.icon,
  }))

  c.inhalte.empathie.headline = slots.empathie_headline
  c.inhalte.empathie.text = slots.empathie_text

  const vorhandeneKarten = c.inhalte.leistungen.karten
  c.inhalte.leistungen.karten = slots.leistungen_karten.map((k, i) => ({
    titel: k.titel,
    text: k.text,
    icon: vorhandeneKarten[i % Math.max(vorhandeneKarten.length, 1)]?.icon,
    no: c.inhalte.leistungen.stil === 'nummern' ? String(i + 1).padStart(2, '0') : undefined,
  }))

  c.inhalte.faq.fragen = slots.faq_fragen

  c.inhalte.conversion.headline = slots.conversion_headline
  c.inhalte.conversion.lead = slots.conversion_lead
  c.inhalte.conversion.telefon = profil.telefon

  c.inhalte.footer.beschreibung = slots.footer_beschreibung

  return c
}
