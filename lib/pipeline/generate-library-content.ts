/**
 * Pipeline v2 — Content-Generierung für Library-Kompositionen (Mission §8, Phase D)
 *
 * Claude füllt die content_schema-Felder aller Sektionen einer Komposition
 * mit firmenspezifischen Inhalten aus den Prospect-Daten.
 *
 * Garantien:
 *  - Floskel-Gate (§2): Verstöße → ein Retry, danach Fallback auf Defaults
 *  - Echte Google-Bewertungen ersetzen generierte Kundenstimmen (nie erfinden,
 *    wenn echte da sind)
 *  - Ohne ANTHROPIC_API_KEY / bei API-Fehlern: Token-ersetzte Default-Inhalte
 *    (Demo entsteht immer — Zero-Fulfillment-Resilienz)
 */

import Anthropic from '@anthropic-ai/sdk'
import { FLOSKEL_BLACKLIST, pruefeContentAufFloskeln } from '@/lib/floskel-blacklist'
import { erfasseNutzung } from '@/lib/nutzung'
import type { LoadedLibraryPage } from '@/lib/library/load'
import type { SectionType, Stil } from '@/lib/library/types'
import type { ProspectData } from './prospect-data'

export interface LibraryDemoConfig {
  engine: 'library'
  library_page_key: string
  branche: string
  stil: Stil
  meta: {
    firma: string
    ort: string | null
    telefon: string | null
    email: string | null
    adresse: string | null
    website: string | null
  }
  inhalte: Partial<Record<SectionType, Record<string, unknown>>>
  /** Diagnose: welche Quellen/Wege benutzt wurden */
  herkunft: {
    quellen: ProspectData['quellen']
    generator: 'claude' | 'defaults'
  }
}

// ------------------------------------------------------------
// Token-Ersetzung ({{firma}}, {{ort}}, {{jahr}})
// ------------------------------------------------------------

function ersetzeTokensInString(s: string, tokens: Record<string, string | null>): string {
  let out = s
  for (const [token, wert] of Object.entries(tokens)) {
    if (wert) out = out.split(`{{${token}}}`).join(wert)
  }
  return out
}

/**
 * Ersetzt Tokens tief im Content. Listeneinträge, die danach noch
 * unaufgelöste Tokens enthalten (z.B. "seit {{jahr}}" ohne bekanntes Jahr),
 * werden entfernt; verbleibende Tokens in Strings werden gestrippt.
 */
export function ersetzeTokens(content: unknown, tokens: Record<string, string | null>): unknown {
  if (typeof content === 'string') {
    return ersetzeTokensInString(content, tokens).replace(/\{\{[a-z]+\}\}/g, '').trim()
  }
  if (Array.isArray(content)) {
    return content
      .filter((item) => !JSON.stringify(item).match(/\{\{[a-z]+\}\}/) || hatAufloesbareTokens(item, tokens))
      .map((item) => ersetzeTokens(item, tokens))
  }
  if (content && typeof content === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(content as Record<string, unknown>)) {
      out[k] = ersetzeTokens(v, tokens)
    }
    return out
  }
  return content
}

function hatAufloesbareTokens(item: unknown, tokens: Record<string, string | null>): boolean {
  const gefunden = JSON.stringify(item).match(/\{\{([a-z]+)\}\}/g) ?? []
  return gefunden.every((t) => {
    const name = t.slice(2, -2)
    return Boolean(tokens[name])
  })
}

// ------------------------------------------------------------
// Fallback: Defaults + Overrides + Tokens
// ------------------------------------------------------------

function baueBasisInhalte(
  loaded: LoadedLibraryPage,
  prospect: ProspectData
): Partial<Record<SectionType, Record<string, unknown>>> {
  const tokens: Record<string, string | null> = {
    firma: prospect.firma,
    ort: prospect.ort,
    jahr: prospect.gruendungsjahr,
  }
  const inhalte: Partial<Record<SectionType, Record<string, unknown>>> = {}
  loaded.page.sections.forEach((ref, i) => {
    const section = loaded.sections[i]
    const merged = { ...section.default_content, ...(ref.overrides ?? {}) }
    inhalte[section.section_type] = ersetzeTokens(merged, tokens) as Record<string, unknown>
  })
  return inhalte
}

// ------------------------------------------------------------
// Deterministische Nachbearbeitung (unabhängig vom Generator)
// ------------------------------------------------------------

function wendeEchtdatenAn(
  inhalte: Partial<Record<SectionType, Record<string, unknown>>>,
  prospect: ProspectData
): void {
  // Echte Google-Bewertungen schlagen generierte Stimmen
  if (prospect.bewertungen.length >= 2 && inhalte.referenzen) {
    inhalte.referenzen.stimmen = prospect.bewertungen.slice(0, 3).map((b) => ({
      text: b.text,
      name: b.name,
      ort: prospect.ort ?? '',
    }))
  }
  // Echtes Rating in die Trust-Leiste
  if (prospect.rating && inhalte.trust_bar) {
    const punkte = (inhalte.trust_bar.punkte as { wert: string; label: string }[] | undefined) ?? []
    const ohneRating = punkte.filter((p) => !p.wert.includes('★'))
    inhalte.trust_bar.punkte = [
      {
        wert: `${prospect.rating.toLocaleString('de-DE', { maximumFractionDigits: 1 })} ★`,
        label: prospect.reviewCount ? `${prospect.reviewCount} Google-Bewertungen` : 'Google-Bewertungen',
      },
      ...ohneRating.slice(0, 3),
    ]
  }
}

// ------------------------------------------------------------
// Claude-Generierung
// ------------------------------------------------------------

function bauePrompt(loaded: LoadedLibraryPage, prospect: ProspectData): { system: string; user: string } {
  const schemaBeschreibung = loaded.sections
    .map((s) => `### ${s.section_type}\n${JSON.stringify(s.content_schema)}`)
    .join('\n\n')

  const beispielInhalte = loaded.page.sections
    .map((ref, i) => {
      const section = loaded.sections[i]
      const merged = { ...section.default_content, ...(ref.overrides ?? {}) }
      return `### ${section.section_type}\n${JSON.stringify(merged)}`
    })
    .join('\n\n')

  const system = `Du schreibst die Inhalte einer Verkaufs-Demo-Website für einen lokalen deutschen Betrieb.

AUFGABE: Fülle für JEDE der folgenden Sektionen die Schema-Felder mit firmenspezifischen Inhalten.
Antworte NUR mit einem JSON-Objekt: { "<section_type>": { ...felder... }, ... } — für alle ${loaded.sections.length} Sektionen.

SEKTIONS-SCHEMAS (Feldname → { typ, beschreibung, maxZeichen }):
${schemaBeschreibung}

TONALITÄT (Stil "${loaded.page.stil}"): ${
    loaded.page.stil === 'warm'
      ? 'persönlich, herzlich, nahbar — Vertrauen vor Nüchternheit'
      : 'direkt, faktisch, modern — Fakten vor Emotion'
  }

REGELN:
1. Nutze die ECHTEN Daten des Betriebs (unten). Erfinde keine Fakten, die nicht in den Daten stehen — keine erfundenen Jahreszahlen, Zertifikate oder Mitarbeiterzahlen. Wo Fakten fehlen, formuliere ohne konkrete Behauptung.
2. Sprache: Deutsch, redaktionelle Qualität, kurze Sätze, konkret statt werblich.
3. VERBOTENE FLOSKELN (dürfen NIRGENDS vorkommen): ${FLOSKEL_BLACKLIST.join(' | ')}
4. Halte maxZeichen-Grenzen ein.
5. Felder vom typ "bild": Behalte den vorhandenen Bild-Key aus den Beispiel-Inhalten bei — AUSSER unter "VERFÜGBARE BILDER" stehen URLs, dann setze für die Hero-Sektion die passendste URL direkt ein.
6. Die Beispiel-Inhalte zeigen Struktur und Qualitätsniveau — übernimm sie NICHT wörtlich, sondern schreibe firmenspezifisch.

BEISPIEL-INHALTE (Struktur-Referenz):
${beispielInhalte}`

  const teile: string[] = [`Firmenname: ${prospect.firma}`]
  if (prospect.branche) teile.push(`Branche: ${prospect.branche}`)
  if (prospect.ort) teile.push(`Ort: ${prospect.ort}`)
  if (prospect.adresse) teile.push(`Adresse: ${prospect.adresse}`)
  if (prospect.telefon) teile.push(`Telefon: ${prospect.telefon}`)
  if (prospect.email) teile.push(`E-Mail: ${prospect.email}`)
  if (prospect.rating) teile.push(`Google-Rating: ${prospect.rating} (${prospect.reviewCount ?? '?'} Bewertungen)`)
  if (prospect.oeffnungszeiten?.length) teile.push(`Öffnungszeiten:\n${prospect.oeffnungszeiten.join('\n')}`)
  if (prospect.notizen) teile.push(`Notizen aus dem Quali-Call:\n${prospect.notizen}`)
  if (prospect.websiteText) teile.push(`=== INHALTE DER BESTEHENDEN WEBSITE ===\n${prospect.websiteText.slice(0, 9000)}`)
  if (prospect.impressumText) teile.push(`Impressum (für Fakten wie Inhaber/Gründungsjahr):\n${prospect.impressumText.slice(0, 2000)}`)
  if (prospect.bilder.length > 0) {
    teile.push(`VERFÜGBARE BILDER:\n${prospect.bilder.map((b, i) => `Bild ${i + 1}: ${b}`).join('\n')}`)
  }
  if (prospect.bewertungen.length > 0) {
    teile.push(
      `ECHTE GOOGLE-BEWERTUNGEN (für Kundenstimmen verwenden, sinnvoll kürzen):\n${prospect.bewertungen
        .map((b) => `- "${b.text}" — ${b.name} (${b.rating}★)`)
        .join('\n')}`
    )
  }

  return { system, user: teile.join('\n\n') }
}

function parseJsonAntwort(text: string): Record<string, Record<string, unknown>> {
  const bereinigt = text.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim()
  return JSON.parse(bereinigt)
}

async function generiereMitClaude(
  loaded: LoadedLibraryPage,
  prospect: ProspectData
): Promise<Partial<Record<SectionType, Record<string, unknown>>> | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const { system, user } = bauePrompt(loaded, prospect)

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: user }]

  for (let versuch = 1; versuch <= 2; versuch++) {
    try {
      const res = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8192,
        temperature: 0.4,
        system,
        messages,
      })
      await erfasseNutzung('claude_tokens', {
        tokensInput: res.usage.input_tokens,
        tokensOutput: res.usage.output_tokens,
        kontext: 'library-content',
      })
      const text = res.content.find((c) => c.type === 'text')?.text ?? ''
      const inhalte = parseJsonAntwort(text) as Partial<Record<SectionType, Record<string, unknown>>>

      const floskeln = pruefeContentAufFloskeln(inhalte)
      if (floskeln.length === 0) return inhalte

      if (versuch === 1) {
        // Ein Retry mit konkreten Fundstellen
        messages.push(
          { role: 'assistant', content: text },
          {
            role: 'user',
            content: `Deine Antwort enthält verbotene Floskeln:\n${floskeln
              .map((f) => `- ${f.pfad}: "${f.floskel}"`)
              .join('\n')}\n\nErsetze diese Stellen durch konkrete, spezifische Formulierungen und gib das VOLLSTÄNDIGE JSON erneut aus.`,
          }
        )
        continue
      }
      console.warn(`[pipeline] Floskel-Gate nach Retry nicht bestanden (${floskeln.length} Funde) — Fallback auf Defaults`)
      return null
    } catch (e) {
      console.warn(`[pipeline] Claude-Generierung Versuch ${versuch} fehlgeschlagen:`, (e as Error).message)
      if (versuch === 2) return null
    }
  }
  return null
}

// ------------------------------------------------------------
// Öffentliche API
// ------------------------------------------------------------

export async function generateLibraryDemoConfig(
  prospect: ProspectData,
  loaded: LoadedLibraryPage
): Promise<LibraryDemoConfig> {
  const basis = baueBasisInhalte(loaded, prospect)
  const generiert = await generiereMitClaude(loaded, prospect)

  // Generierte Inhalte nutzen, fehlende Sektionen aus der Basis auffüllen
  const inhalte: Partial<Record<SectionType, Record<string, unknown>>> = {}
  for (const section of loaded.sections) {
    inhalte[section.section_type] =
      generiert?.[section.section_type] ?? basis[section.section_type]
  }

  wendeEchtdatenAn(inhalte, prospect)

  return {
    engine: 'library',
    library_page_key: loaded.page.key,
    branche: loaded.page.branche,
    stil: loaded.page.stil,
    meta: {
      firma: prospect.firma,
      ort: prospect.ort,
      telefon: prospect.telefon,
      email: prospect.email,
      adresse: prospect.adresse,
      website: prospect.website,
    },
    inhalte,
    herkunft: {
      quellen: prospect.quellen,
      generator: generiert ? 'claude' : 'defaults',
    },
  }
}
