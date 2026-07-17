/**
 * Branchen-Fabrik F4 (BF §4.1): Klassifizierung — Claude mappt eine frei
 * eingegebene Branche auf eine Meta-Kategorie und liefert branche_key,
 * Namen und Seeding-Beschreibung.
 *
 * Unsicher → harter Fehler statt Raten (Rückfrage-Karte im Dashboard).
 */

import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { META_KATEGORIEN } from '@/config/branchen'
import { erfasseNutzung } from '@/lib/nutzung'
import type { StartBranche } from './branchen-start'

const KATEGORIE_KEYS = META_KATEGORIEN.map((k) => k.key) as [string, ...string[]]

const KlassifizierungSchema = z.object({
  branche_key: z.string().regex(/^[a-z][a-z0-9_]{2,40}$/, 'snake_case, 3–41 Zeichen'),
  name: z.string().min(3).max(60),
  meta_kategorie: z.enum(KATEGORIE_KEYS),
  beschreibung: z.string().min(40).max(500),
  sicherheit: z.enum(['sicher', 'unsicher']),
  begruendung: z.string().max(600),
})

function parseJson(text: string): unknown {
  const bereinigt = text.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim()
  try {
    return JSON.parse(bereinigt)
  } catch {
    const start = bereinigt.indexOf('{')
    const ende = bereinigt.lastIndexOf('}')
    if (start === -1 || ende <= start) throw new Error('kein JSON-Objekt in der Antwort gefunden')
    return JSON.parse(bereinigt.slice(start, ende + 1))
  }
}

/**
 * Freitext ("Schlüsseldienst", "Hundefriseur in Köln") → StartBranche-Def.
 * Wirft bei fehlendem API-Key, ungültigem JSON oder unsicherer Zuordnung.
 */
export async function klassifiziereBranche(freitext: string): Promise<StartBranche> {
  const eingabe = freitext.trim()
  if (eingabe.length < 3 || eingabe.length > 120) {
    throw new Error('Branchen-Bezeichnung muss 3–120 Zeichen lang sein')
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY fehlt — Klassifizierung nicht möglich')
  }

  const kategorien = META_KATEGORIEN.map(
    (k) => `- ${k.key}: ${k.name} (Funnel: ${k.funnel_modus}, Signature: ${k.transformations_szene})`
  ).join('\n')

  const system = `Du klassifizierst eine Branche für eine deutsche Website-Fabrik für lokale Betriebe.

AUFGABE: Ordne die Eingabe GENAU EINER Meta-Kategorie zu und antworte NUR mit einem JSON-Objekt:
{ "branche_key": "...", "name": "...", "meta_kategorie": "...", "beschreibung": "...", "sicherheit": "sicher"|"unsicher", "begruendung": "..." }

META-KATEGORIEN:
${kategorien}

REGELN:
1. branche_key: kurz, snake_case, deutsch, singular (z. B. "schluesseldienst", "hundesalon"). Keine Umlaute (ae/oe/ue/ss).
2. name: übliche deutsche Bezeichnung des Betriebs (z. B. "Schlüsseldienst").
3. beschreibung: 1–3 Sätze fürs Seeding — was macht der Betrieb KONKRET (typische Leistungen beim Namen nennen), wer sind die Kunden. Bei Heilberufen (meta_kategorie gesundheit_praxis) mit "HWG beachten: keine Heilversprechen." abschließen.
4. sicherheit "unsicher", wenn die Eingabe kein lokaler Betrieb ist, mehrere Branchen mischt oder in keine Kategorie passt — dann in begruendung erklären, warum. NIEMALS raten.
5. Ortsangaben in der Eingabe ignorieren (Klassifizierung ist ortsunabhängig).`

  const client = new Anthropic()
  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 700,
    temperature: 0.1,
    system,
    messages: [{ role: 'user', content: `Branche: ${eingabe}` }],
  })
  await erfasseNutzung('claude_tokens', {
    tokensInput: res.usage.input_tokens,
    tokensOutput: res.usage.output_tokens,
    kontext: 'branchen-klassifizierung',
  })
  const text = res.content.find((c) => c.type === 'text')?.text ?? ''

  const parsed = KlassifizierungSchema.safeParse(parseJson(text))
  if (!parsed.success) {
    throw new Error(
      `Klassifizierung ungültig: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`
    )
  }
  if (parsed.data.sicherheit === 'unsicher') {
    throw new Error(`Klassifizierung unsicher — ${parsed.data.begruendung || 'keine eindeutige Meta-Kategorie'}`)
  }

  return {
    branche_key: parsed.data.branche_key,
    name: parsed.data.name,
    meta_kategorie: parsed.data.meta_kategorie,
    beschreibung: parsed.data.beschreibung,
  }
}
