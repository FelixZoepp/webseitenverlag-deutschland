/**
 * Branchen-Fabrik F3: Branchen-Profil + Vorlagen-Copy per Claude generieren
 * (BF §4.2/§4.3). EIN Call pro Branche, strikt gegen BranchenSeedSchema.
 *
 * Anders als die Demo-Pipeline gibt es hier KEINEN stillen Fallback:
 * F3 wird manuell angestoßen, Schema-/Floskel-Verstöße führen nach den
 * Retries zu einem harten Fehler, den der Mensch sieht.
 */

import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { FLOSKEL_BLACKLIST, pruefeContentAufFloskeln } from '@/lib/floskel-blacklist'
import { erfasseNutzung } from '@/lib/nutzung'
import { metaKategorie, type MetaKategorie } from '@/config/branchen'
import { FLAGSHIP_SEEDS } from '@/lib/flagship/seeds'
import { BranchenSeedSchema, type BranchenSeed } from './schema'
import type { StartBranche } from './branchen-start'

const MAX_VERSUCHE = 3

// ------------------------------------------------------------
// Prompt
// ------------------------------------------------------------

function baueSystemPrompt(branche: StartBranche, kategorie: MetaKategorie, guidelineNotes: string[]): string {
  // Few-Shot: das Flagship derselben Typo-Welt als Qualitätsreferenz
  const referenzKey = kategorie.typo_modus === 'serif_warm_dunkel' ? 'restaurant_italienisch' : 'reinigung'
  const referenz = FLAGSHIP_SEEDS[referenzKey]
  const referenzJson = JSON.stringify(
    { design: referenz.design, inhalte: referenz.inhalte, funnel: referenz.funnel },
    null,
    0
  )

  const jsonSchema = JSON.stringify(z.toJSONSchema(BranchenSeedSchema))

  const notes = guidelineNotes.length > 0
    ? `\nFREIGABE-FEEDBACK AUS FRÜHEREN RUNDEN (unbedingt beachten):\n${guidelineNotes.map((n) => `- ${n}`).join('\n')}`
    : ''

  return `Du bist Art Director + Texter einer deutschen Agentur und baust die Branchen-Vorlage einer Website-Fabrik für lokale Betriebe.

AUFGABE: Erzeuge für die Branche "${branche.name}" EIN JSON-Objekt { "profil": …, "vorlage": … } exakt nach dem JSON-Schema unten. Antworte NUR mit dem JSON, ohne Erklärtext.

BRANCHE: ${branche.name} — ${branche.beschreibung}
META-KATEGORIE: ${kategorie.name}
- Signature-Variante: ${kategorie.signature_variante} (Scroll-Transformation)
- Transformations-Grundidee: ${kategorie.transformations_szene}
- Typo-Modus: ${kategorie.typo_modus}
- Funnel: ${kategorie.funnel_modus}${kategorie.hinweise ? `\n- Hinweis: ${kategorie.hinweise}` : ''}

DESIGN-REGELN (BF §1.3):
1. Der Akzent (akzent1) MUSS aus der Branchenwelt kommen und in akzent_begruendung konkret hergeleitet werden (Beispiel Reinigung: Gummihandschuh-Gelb; Gastro: Chianti + Kerzengold). VERBOTEN: Creme+Serifen+Terracotta-Einheitslook, Schwarz+Neongrün, Template-Teal, Bootstrap-Blau.
2. typo_modus "${kategorie.typo_modus}" ist gesetzt — Tokens passend dazu (sans_bold_hell: heller Papierton-Grund; serif_warm_dunkel: dunkler, warmer Grund). typo_signature: wisch_highlight bei sans, gold_unterstrich bei serif.
3. Alle 8 Token-Farben müssen zusammen eine stimmige, kontrastreiche Palette ergeben (Text auf Basis gut lesbar).

COPY-REGELN:
1. Deutsch, redaktionelle Agentur-Qualität. Kurze Sätze, konkret, aus der Arbeitsrealität der Branche — Werkzeuge, Materialien, typische Aufträge beim Namen nennen. Keine austauschbaren Werbetexte.
2. VERBOTENE FLOSKELN (dürfen NIRGENDS vorkommen): ${FLOSKEL_BLACKLIST.join(' | ')}
3. Highlight-Konvention: In hero.headline_zeilen trägt GENAU EINE Zeile ein [[wort]]-Highlight. In fakten.punkte darf [[wort]] wichtige Begriffe markieren.
4. beispiel_meta ist eine FIKTIVE, plausible Beispielfirma (deutscher Name + mittelgroße deutsche Stadt) — keine real existierende Firma.
5. Kundenstimmen (stimmen.quotes) sind Beispiel-Platzhalter in realistischem Ton: konkret, unpoliert, mit Detail aus dem Auftrag. Keine Superlative-Parade.
6. zahlen.items: 3–4 glaubwürdige Betriebszahlen (keine Fantasie-Rekorde). Zahl als number → animierter Counter, String → statisch.
7. faq (vorlage) enthält nur eyebrow + headline — die 6 Fragen kommen aus profil.faq_rohlinge. ablauf (vorlage) analog nur eyebrow + headline zu profil.ablauf_schritte.
8. Sektion "lokal": variante "bezirke" (Chip-Wolke mit Stadtteilen der Beispielstadt) für Einsatzgebiet-Branchen, "info" (Adresse/Zeiten/Kontakt) für Laden-/Praxis-Betriebe.
9. ergebnisse: variante "ba_slider" nur, wenn Vorher/Nachher-Bildpaare branchentypisch ehrlich sind (Handwerk, Reinigung, Aufbereitung); sonst "galerie".${kategorie.key === 'gesundheit_praxis' ? ' ACHTUNG HWG: KEINE Vorher/Nachher-Behandlungsfotos → zwingend "galerie", keine Heilversprechen in Texten.' : ''}
10. Alle media-Felder sind BESCHREIBUNGEN (label + alt) — keine Dateipfade. Das label beschreibt präzise, was das Bild zeigen soll.

FUNNEL-REGELN:
${kategorie.funnel_modus === 'reservierung'
  ? '- Funnel-Modus reservierung: profil.quali_fragen leer lassen ([]). CTA-Sprache: "Tisch reservieren".'
  : '- profil.quali_fragen: 4–6 branchenspezifische Fragen, die eine Anfrage vorqualifizieren (Objektgröße, Zeitrahmen, Anlass …). typ "auswahl" mit 2–6 Optionen bevorzugen, max. 1 Textfrage. Keys kurz in snake_case.'}

STYLE-PROMPT-REGELN (für Bild-KI, englisch formulieren):
- basis_stil: Fotorealismus, Kamera/Objektiv-Anmutung, Grundstimmung der Branche.
- szenen.hero: CLOSE-UP oder halbnahe Einstellung, die das Kernmotiv der Branche zeigt. Das Hauptmotiv/die Hauptperson MUSS auf der RECHTEN Bildhälfte positioniert sein (der Text-Overlay liegt links). Beispiele: Friseur → Haarsträhnen unter warmem Licht, Nahaufnahme von hinten/seitlich; Reinigung → glänzende Oberfläche mit Reflexion; Restaurant → dampfendes Gericht, Gläser mit Kerzenlicht. KEINE Totalen, keine Frontalporträts.
- signature_nachher = Ziel-Zustand (wird zuerst generiert), signature_vorher = Anweisung, DIESELBE Szene zu degradieren (verschmutzen, abdecken, leeren …).
- Personen nur wenn personen_erlaubt, dann distanziert/seitlich/von hinten. negativ: Markenlogos, lesbarer Text, Uncanny-Gesichter.
- video_bewegung (englisch, 1–2 Sätze): Beschreibt die SUBTILE, ruhige Bewegung für den Video-Hero. REGELN: (1) statische Kamera, KEIN Kameraschwenk; (2) nur natürliche Mikrobewegung passend zur Branche (Haare fallen/glänzen, Dampf steigt, Wasser fließt, Werkzeug vibriert, Blätter wehen, Stoff bewegt sich); (3) keine sprechenden/winkenden Personen; (4) Loop-tauglich (nahtloser Übergang). Beispiel Friseur: "subtle hair movement, light shimmer on strands, gentle steam from styling tools, completely static camera".

QUALITÄTSREFERENZ (Flagship "${referenzKey}" — dieses Niveau an Konkretheit und Ton ist der Maßstab; Struktur teils anders, NICHT wörtlich kopieren):
${referenzJson}
${notes}

JSON-SCHEMA (halte alle Feldnamen, Typen, Längen und Kardinalitäten exakt ein):
${jsonSchema}`
}

// ------------------------------------------------------------
// Validierung
// ------------------------------------------------------------

function parseJsonAntwort(text: string): unknown {
  const bereinigt = text.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim()
  try {
    return JSON.parse(bereinigt)
  } catch {
    // Modell setzt gelegentlich Prosa vor/nach das JSON — Objekt extrahieren
    const start = bereinigt.indexOf('{')
    const ende = bereinigt.lastIndexOf('}')
    if (start === -1 || ende <= start) throw new Error('kein JSON-Objekt in der Antwort gefunden')
    return JSON.parse(bereinigt.slice(start, ende + 1))
  }
}

/** Prüft Schema + Zusatzregeln; gibt Fehlerliste zurück (leer = ok) */
function validiere(daten: unknown, kategorie: MetaKategorie): { seed?: BranchenSeed; fehler: string[] } {
  const parsed = BranchenSeedSchema.safeParse(daten)
  if (!parsed.success) {
    return {
      fehler: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).slice(0, 25),
    }
  }
  const seed = parsed.data
  const fehler: string[] = []

  if (kategorie.funnel_modus === 'anfrage' && seed.profil.quali_fragen.length < 4) {
    fehler.push(`profil.quali_fragen: mindestens 4 Fragen nötig (${seed.profil.quali_fragen.length} geliefert)`)
  }
  if (kategorie.funnel_modus === 'reservierung' && seed.profil.quali_fragen.length > 0) {
    fehler.push('profil.quali_fragen: bei Reservierungs-Funnel leer lassen')
  }
  if (seed.profil.design.typo_modus !== kategorie.typo_modus) {
    fehler.push(`profil.design.typo_modus: "${kategorie.typo_modus}" erwartet`)
  }
  const highlightZeilen = seed.vorlage.hero.headline_zeilen.filter((z) => z.includes('[['))
  if (highlightZeilen.length !== 1) {
    fehler.push('vorlage.hero.headline_zeilen: genau EINE Zeile muss ein [[wort]]-Highlight tragen')
  }
  if (seed.vorlage.ergebnisse.variante === 'ba_slider' && !seed.vorlage.ergebnisse.paare?.length) {
    fehler.push('vorlage.ergebnisse: variante ba_slider braucht paare')
  }
  if (seed.vorlage.ergebnisse.variante === 'galerie' && !seed.vorlage.ergebnisse.bilder?.length) {
    fehler.push('vorlage.ergebnisse: variante galerie braucht bilder')
  }
  if (seed.vorlage.empathie.variante === 'situationen' && !seed.vorlage.empathie.situationen?.length) {
    fehler.push('vorlage.empathie: variante situationen braucht situationen')
  }
  if (seed.vorlage.empathie.variante === 'zitat' && !seed.vorlage.empathie.zitat) {
    fehler.push('vorlage.empathie: variante zitat braucht zitat')
  }
  if (seed.vorlage.lokal.variante === 'bezirke' && !seed.vorlage.lokal.chips?.length) {
    fehler.push('vorlage.lokal: variante bezirke braucht chips')
  }
  if (seed.vorlage.lokal.variante === 'info' && !seed.vorlage.lokal.infos?.length) {
    fehler.push('vorlage.lokal: variante info braucht infos')
  }
  if (kategorie.key === 'gesundheit_praxis' && seed.vorlage.ergebnisse.variante === 'ba_slider') {
    fehler.push('vorlage.ergebnisse: HWG — keine Vorher/Nachher-Behandlungsfotos, variante galerie verwenden')
  }
  if (kategorie.stepper === 'ablauf' && !seed.vorlage.ablauf) {
    fehler.push('vorlage.ablauf: Pflicht (eyebrow + headline) — die Schritte kommen aus profil.ablauf_schritte')
  }
  if (kategorie.stepper === 'besuch' && seed.vorlage.ablauf) {
    fehler.push('vorlage.ablauf: bei Gastro entfällt die Ablauf-Sektion — Feld weglassen')
  }

  return fehler.length > 0 ? { fehler } : { seed, fehler: [] }
}

// ------------------------------------------------------------
// Öffentliche API
// ------------------------------------------------------------

export async function generiereBranchenSeed(
  branche: StartBranche,
  guidelineNotes: string[] = []
): Promise<BranchenSeed> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY fehlt — Seeding ist ohne Claude nicht möglich')
  }
  const kategorie = metaKategorie(branche.meta_kategorie)
  if (!kategorie) throw new Error(`Unbekannte Meta-Kategorie "${branche.meta_kategorie}"`)

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const system = baueSystemPrompt(branche, kategorie, guidelineNotes)
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: `Erzeuge Profil + Vorlagen-Copy für die Branche "${branche.name}" (${branche.branche_key}).` },
  ]

  let letzterFehler = 'unbekannt'

  for (let versuch = 1; versuch <= MAX_VERSUCHE; versuch++) {
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      system,
      messages,
    })
    await erfasseNutzung('claude_tokens', {
      tokensInput: res.usage.input_tokens,
      tokensOutput: res.usage.output_tokens,
      kontext: 'branchen-seeding',
    })
    const text = res.content.find((c) => c.type === 'text')?.text ?? ''

    let daten: unknown
    try {
      daten = parseJsonAntwort(text)
    } catch (e) {
      letzterFehler = `JSON-Parse fehlgeschlagen: ${(e as Error).message}`
      messages.push(
        { role: 'assistant', content: text },
        { role: 'user', content: `Deine Antwort war kein gültiges JSON (${letzterFehler}). Gib das VOLLSTÄNDIGE JSON-Objekt erneut aus — nur JSON, keine Erklärung.` }
      )
      continue
    }

    const { seed, fehler } = validiere(daten, kategorie)
    if (!seed) {
      letzterFehler = `Schema-Verstöße: ${fehler.join('; ')}`
      messages.push(
        { role: 'assistant', content: text },
        { role: 'user', content: `Deine Antwort verletzt das Schema:\n${fehler.map((f) => `- ${f}`).join('\n')}\n\nKorrigiere genau diese Punkte und gib das VOLLSTÄNDIGE JSON erneut aus.` }
      )
      continue
    }

    const floskeln = pruefeContentAufFloskeln(seed as unknown as Record<string, unknown>)
    if (floskeln.length > 0) {
      letzterFehler = `Floskel-Gate: ${floskeln.map((f) => f.floskel).join(', ')}`
      messages.push(
        { role: 'assistant', content: text },
        { role: 'user', content: `Deine Antwort enthält verbotene Floskeln:\n${floskeln.map((f) => `- ${f.pfad}: "${f.floskel}"`).join('\n')}\n\nErsetze diese Stellen durch konkrete, branchenspezifische Formulierungen und gib das VOLLSTÄNDIGE JSON erneut aus.` }
      )
      continue
    }

    return seed
  }

  throw new Error(`Seeding für "${branche.branche_key}" nach ${MAX_VERSUCHE} Versuchen fehlgeschlagen — ${letzterFehler}`)
}
