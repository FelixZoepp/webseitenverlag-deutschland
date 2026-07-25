/**
 * Branchen-Fabrik: Scrub-Szenen per Claude generieren.
 *
 * Erzeugt 5 Szenen fuer die Premium-Komposition „scrub-story-v1":
 * eine Transformation in 5 Akten (vorher -> perfektes Ergebnis),
 * jeweils mit cinematic Video-Prompt (16:9, 5 s) fuer Higgsfield.
 *
 * Wird vom Seed-Script (scripts/seed-scrub-videos.ts) aufgerufen
 * und ist unabhaengig vom regulaeren Branchen-Seeding in generiere-profil.ts.
 */

import Anthropic from '@anthropic-ai/sdk'
import { erfasseNutzung } from '@/lib/nutzung'

// ------------------------------------------------------------
// Typen
// ------------------------------------------------------------

export interface ScrubMultiSzene {
  /** snake_case ID, z. B. „rohzustand_fassade" */
  id: string
  /** „Schritt 01" bis „Schritt 05" */
  label: string
  /** Kurzer, poetischer Titel (max 60 Zeichen) */
  titel: string
  /** 2-3 Saetze Beschreibung */
  text: string
  /** 3 Schlagwoerter */
  tags: string[]
  /** Englischer Video-Prompt (cinematic, 5 s, 16:9) */
  videoPrompt: string
  /** Text-Ausrichtung: alternierend left/right */
  align: 'left' | 'right'
  /** Scroll-Gewicht (1.3-1.8) */
  scroll: number
  /** Linger-Dauer (0.1-0.3) */
  linger: number
}

// ------------------------------------------------------------
// Prompt
// ------------------------------------------------------------

function bauePrompt(brancheKey: string, brancheName: string, beschreibung: string): string {
  return `Du bist Regisseur und Texter fuer Premium-Webseiten deutscher Handwerks- und Dienstleistungsbetriebe.

AUFGABE: Erzeuge exakt 5 Scrub-Szenen fuer die Branche "${brancheName}" (${brancheKey}).
Die Szenen erzaehlen eine Transformationsgeschichte in 5 Akten — vom Ausgangszustand zum perfekten Ergebnis.

BRANCHE: ${brancheName}
BESCHREIBUNG: ${beschreibung}

REGELN:
1. Jede Szene ist ein Akt der Transformation: Akt 1 zeigt den Ausgangszustand/Bedarf, Akt 5 das fertige Ergebnis.
2. id: snake_case, eindeutig, branchenspezifisch (z. B. "rohbau_dach", "daemmung_verlegt").
3. label: "Schritt 01" bis "Schritt 05".
4. titel: kurz, poetisch, maximal 60 Zeichen. Deutsch.
5. text: 2-3 Saetze, konkret aus der Branchenwelt. Keine Floskeln. Deutsch.
6. tags: genau 3 praegnante Schlagwoerter. Deutsch.
7. videoPrompt: ENGLISCH, cinematic, fuer 5-Sekunden-Video, 16:9 Querformat. KEINE Gesichter, keine erkennbaren Personen (DSGVO). Statische Kamera, Close-Up auf das Handwerk/Material/Ergebnis. Subtile Mikrobewegung (Staub, Licht, Material). Filmqualitaet. Jeder Prompt beginnt mit "Cinematic 4K, static tripod shot, 16:9,".
8. align: alternierend "left", "right", "left", "right", "left".
9. scroll: Werte zwischen 1.3 und 1.8, variierend (erste und letzte Szene tendenziell hoeher).
10. linger: Werte zwischen 0.1 und 0.3.

Antworte NUR mit einem JSON-Array von 5 Objekten. Kein Erklaertext.

JSON-Schema je Objekt:
{
  "id": "string (snake_case)",
  "label": "string (Schritt 01-05)",
  "titel": "string (max 60 Zeichen)",
  "text": "string (2-3 Saetze)",
  "tags": ["string", "string", "string"],
  "videoPrompt": "string (englisch, cinematic)",
  "align": "left | right",
  "scroll": number (1.3-1.8),
  "linger": number (0.1-0.3)
}`
}

// ------------------------------------------------------------
// Validierung
// ------------------------------------------------------------

function validiereAntwort(daten: unknown): ScrubMultiSzene[] {
  if (!Array.isArray(daten) || daten.length !== 5) {
    throw new Error(`Erwarte Array mit 5 Szenen, erhalten: ${Array.isArray(daten) ? daten.length : typeof daten}`)
  }

  const aligns: Array<'left' | 'right'> = ['left', 'right', 'left', 'right', 'left']

  return daten.map((szene, i) => {
    const s = szene as Record<string, unknown>
    const fehler: string[] = []

    if (typeof s.id !== 'string' || !/^[a-z0-9_]+$/.test(s.id)) {
      fehler.push(`Szene ${i + 1}: id muss snake_case sein`)
    }
    if (typeof s.titel !== 'string' || s.titel.length < 3 || s.titel.length > 80) {
      fehler.push(`Szene ${i + 1}: titel 3-80 Zeichen`)
    }
    if (typeof s.text !== 'string' || s.text.length < 20) {
      fehler.push(`Szene ${i + 1}: text zu kurz`)
    }
    if (!Array.isArray(s.tags) || s.tags.length !== 3) {
      fehler.push(`Szene ${i + 1}: genau 3 tags`)
    }
    if (typeof s.videoPrompt !== 'string' || s.videoPrompt.length < 30) {
      fehler.push(`Szene ${i + 1}: videoPrompt zu kurz`)
    }
    if (typeof s.scroll !== 'number' || s.scroll < 1.0 || s.scroll > 2.5) {
      fehler.push(`Szene ${i + 1}: scroll ausserhalb 1.0-2.5`)
    }
    if (typeof s.linger !== 'number' || s.linger < 0.05 || s.linger > 0.5) {
      fehler.push(`Szene ${i + 1}: linger ausserhalb 0.05-0.5`)
    }

    if (fehler.length > 0) {
      throw new Error(`Validierung fehlgeschlagen:\n${fehler.join('\n')}`)
    }

    return {
      id: s.id as string,
      label: `Schritt ${String(i + 1).padStart(2, '0')}`,
      titel: s.titel as string,
      text: s.text as string,
      tags: s.tags as string[],
      videoPrompt: s.videoPrompt as string,
      align: aligns[i],
      scroll: s.scroll as number,
      linger: s.linger as number,
    }
  })
}

function parseJsonAntwort(text: string): unknown {
  const bereinigt = text.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim()
  try {
    return JSON.parse(bereinigt)
  } catch {
    const start = bereinigt.indexOf('[')
    const ende = bereinigt.lastIndexOf(']')
    if (start === -1 || ende <= start) throw new Error('Kein JSON-Array in der Antwort gefunden')
    return JSON.parse(bereinigt.slice(start, ende + 1))
  }
}

// ------------------------------------------------------------
// Oeffentliche API
// ------------------------------------------------------------

const MAX_VERSUCHE = 3

export async function generiereScrubSzenen(
  brancheKey: string,
  brancheName: string,
  beschreibung: string
): Promise<ScrubMultiSzene[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY fehlt — Scrub-Szenen-Generierung nicht moeglich')
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const system = bauePrompt(brancheKey, brancheName, beschreibung)
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: `Erzeuge 5 Scrub-Szenen fuer die Branche "${brancheName}" (${brancheKey}).` },
  ]

  let letzterFehler = 'unbekannt'

  for (let versuch = 1; versuch <= MAX_VERSUCHE; versuch++) {
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      temperature: 0.4,
      system,
      messages,
    })
    await erfasseNutzung('claude_tokens', {
      tokensInput: res.usage.input_tokens,
      tokensOutput: res.usage.output_tokens,
      kontext: `scrub-szenen:${brancheKey}`,
    })
    const text = res.content.find((c) => c.type === 'text')?.text ?? ''

    let daten: unknown
    try {
      daten = parseJsonAntwort(text)
    } catch (e) {
      letzterFehler = `JSON-Parse fehlgeschlagen: ${(e as Error).message}`
      messages.push(
        { role: 'assistant', content: text },
        { role: 'user', content: `Deine Antwort war kein gueltiges JSON (${letzterFehler}). Gib das VOLLSTAENDIGE JSON-Array erneut aus — nur JSON, keine Erklaerung.` },
      )
      continue
    }

    try {
      return validiereAntwort(daten)
    } catch (e) {
      letzterFehler = (e as Error).message
      messages.push(
        { role: 'assistant', content: text },
        { role: 'user', content: `Validierung fehlgeschlagen:\n${letzterFehler}\n\nKorrigiere und gib das VOLLSTAENDIGE JSON-Array erneut aus.` },
      )
      continue
    }
  }

  throw new Error(`Scrub-Szenen fuer "${brancheKey}" nach ${MAX_VERSUCHE} Versuchen fehlgeschlagen — ${letzterFehler}`)
}
