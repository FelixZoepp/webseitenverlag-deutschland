/**
 * Strukturierte Editor-Operationen (§10.2).
 *
 * Der Chat-Editor darf AUSSCHLIESSLICH diese Ops vorschlagen — kein rohes
 * HTML/CSS, nie. Jeder Patch wird serverseitig mit Zod validiert und gegen
 * die Leitplanken geprüft, BEVOR er den Entwurf (draft_config) verändert.
 * Ein einziger ungültiger Op weist den GESAMTEN Patch ab.
 *
 * Leitplanken (serverseitig durchgesetzt, nicht nur im Prompt):
 * - Hero-Struktur, primärer CTA und Kontakt sind nicht löschbar/versteckbar
 * - Farben/Fonts nur aus Presets (set_theme_preset), nie freie HEX-Werte
 * - Telefonnummer/Logo/Rechtstexte nur über Fakten-Check bzw. Upload/Wizard
 */
import { z } from 'zod'
import { SiteConfig } from '@/types'

// ------------------------------------------------------------
// Theme-Presets — die EINZIGE Quelle für Farbänderungen
// ------------------------------------------------------------

export const THEME_PRESETS: Record<
  string,
  { name: string; primary: string; secondary: string; background: string; text: string }
> = {
  'klar-blau': { name: 'Klar (Blau)', primary: '#1D4ED8', secondary: '#1E40AF', background: '#FFFFFF', text: '#111827' },
  'warm-terracotta': { name: 'Warm (Terracotta)', primary: '#C2410C', secondary: '#9A3412', background: '#FFFBF5', text: '#1C1917' },
  'modern-anthrazit': { name: 'Modern (Anthrazit)', primary: '#111827', secondary: '#374151', background: '#F9FAFB', text: '#111827' },
  'frisch-gruen': { name: 'Frisch (Grün)', primary: '#15803D', secondary: '#166534', background: '#FFFFFF', text: '#14532D' },
  'elegant-bordeaux': { name: 'Elegant (Bordeaux)', primary: '#9F1239', secondary: '#881337', background: '#FFF7F7', text: '#1F2937' },
  'hell-sand': { name: 'Hell (Sand)', primary: '#B45309', secondary: '#92400E', background: '#FEFCE8', text: '#292524' },
}

export const ERLAUBTE_SEKTIONS_TYPEN = [
  'leistungen',
  'galerie',
  'bewertungen',
  'faq',
  'ueber-uns',
  'stats',
  'cta',
] as const

// ------------------------------------------------------------
// Op-Schemas
// ------------------------------------------------------------

/** Pfad: nur Wort-Segmente/Indizes, kein Prototype-Pollution-Vektor. */
const PfadSchema = z
  .string()
  .max(200)
  .regex(/^[a-zA-Z][a-zA-Z0-9_-]*(\.([a-zA-Z][a-zA-Z0-9_-]*|\d+))*$/, 'Ungültiger Feld-Pfad')
  .refine((p) => !/(^|\.)(__proto__|constructor|prototype)(\.|$)/.test(p), 'Ungültiger Feld-Pfad')

const OpSchema = z.discriminatedUnion('op', [
  z.object({
    op: z.literal('update_text'),
    pfad: PfadSchema,
    wert: z.string().max(2000),
  }),
  z.object({
    op: z.literal('swap_image_from_bank'),
    pfad: PfadSchema,
    assetId: z.string().uuid('Ungültige Asset-ID'),
  }),
  z.object({
    op: z.literal('set_theme_preset'),
    preset: z.enum(Object.keys(THEME_PRESETS) as [string, ...string[]]),
  }),
  z.object({
    op: z.literal('add_section_from_library'),
    typ: z.enum(ERLAUBTE_SEKTIONS_TYPEN),
    titel: z.string().min(2).max(120),
  }),
  z.object({
    op: z.literal('reorder'),
    sectionIds: z.array(z.string().max(80)).min(2).max(30),
  }),
  z.object({
    op: z.literal('toggle'),
    sectionId: z.string().max(80),
    sichtbar: z.boolean(),
  }),
])

export type PatchOp = z.infer<typeof OpSchema>

export const PatchSchema = z.array(OpSchema).min(1).max(20)

// ------------------------------------------------------------
// Leitplanken (serverseitig)
// ------------------------------------------------------------

const GESPERRTE_PFADE: { muster: RegExp; grund: string }[] = [
  { muster: /(^|\.)phone$/, grund: 'Die Telefonnummer ändern Sie sicher über den Fakten-Check im Fertigstellungs-Bereich.' },
  { muster: /(^|\.)logoUrl$/, grund: 'Das Logo wird über den Bilder-Upload geändert, nicht per Chat.' },
  { muster: /(^|\.)(imprintUrl|privacyUrl)$/, grund: 'Impressum und Datenschutz sind geschützt (rechtliche Pflichtangaben).' },
  { muster: /(^|\.)rechtstexte(\.|$)/, grund: 'Rechtstexte werden aus Ihren Pflichtangaben generiert und sind nicht frei editierbar.' },
  { muster: /Color$/, grund: 'Farben werden nur über Design-Vorlagen geändert (set_theme_preset).' },
  { muster: /(^|\.)colors(\.|$)/, grund: 'Farben werden nur über Design-Vorlagen geändert (set_theme_preset).' },
  { muster: /(^|\.)font/i, grund: 'Schriften werden nur über Design-Vorlagen geändert.' },
]

const EINGESCHRAENKTE_PFADE: { muster: RegExp; maxLaenge: number; feld: string }[] = [
  { muster: /(^|\.)(headline|tagline)$/, maxLaenge: 80, feld: 'Überschrift' },
  { muster: /(^|\.)(subheadline|heroSubtitle|subtitle)$/, maxLaenge: 160, feld: 'Unterüberschrift' },
  { muster: /(^|\.)ctaText$/, maxLaenge: 30, feld: 'Button-Text' },
]

/** Sektions-Typen, die nie versteckt/gelöscht werden dürfen (§10.2). */
const GESCHUETZTE_SEKTIONS_TYPEN = ['hero', 'kontakt', 'contact', 'cta-haupt']

// ------------------------------------------------------------
// Bild-Bank (Phase 4, §5.1): swap_image_from_bank
// ------------------------------------------------------------

/** Aufgelöstes Bank-Asset — die Route lädt es VOR applyPatch aus der DB. */
export interface AufgeloestesBild {
  url: string
  szeneTyp: string | null
  quelle: string
}

/**
 * Welche Szene-Typen ein Bild-Pfad akzeptiert (Slot-Typ-Filter §5.1).
 * null = jede Szene erlaubt. Hero-Felder sind strikt: nur Hero-Szenen
 * (bzw. Kunden-Bilder, deren Aspect-Check sie als hero eingestuft hat).
 */
export function erlaubteSzenenFuerPfad(pfad: string): string[] | null {
  if (/hero/i.test(pfad)) return ['hero']
  if (/(^|\.)(ownerImageUrl|teamImageUrl)$/.test(pfad)) return ['team', 'detail', 'galerie']
  return null
}

// ------------------------------------------------------------
// Anwendung
// ------------------------------------------------------------

type Ergebnis = { ok: true; config: SiteConfig } | { ok: false; fehler: string[] }

function getPfad(obj: unknown, segmente: string[]): unknown {
  let aktuell: unknown = obj
  for (const seg of segmente) {
    if (aktuell === null || typeof aktuell !== 'object') return undefined
    aktuell = (aktuell as Record<string, unknown>)[seg]
  }
  return aktuell
}

function setPfad(obj: Record<string, unknown>, segmente: string[], wert: unknown): void {
  let aktuell: Record<string, unknown> = obj
  for (let i = 0; i < segmente.length - 1; i++) {
    aktuell = aktuell[segmente[i]] as Record<string, unknown>
  }
  aktuell[segmente[segmente.length - 1]] = wert
}

interface SektionsEintrag {
  id: string
  type: string
  title?: string
  visible?: boolean
  order?: number
}

/**
 * Wendet einen validierten Patch auf eine Kopie der Config an.
 * Ein Fehler in irgendeinem Op weist den gesamten Patch ab (§10.2).
 *
 * `bilder`: von der Route VOR dem Aufruf aufgelöste Bank-Assets
 * (nur approved + Branche bzw. quelle='kunde' + eigene Site). Ein
 * swap_image_from_bank-Op mit einer ID, die hier fehlt, wird abgewiesen.
 */
export function applyPatch(
  config: SiteConfig,
  ops: PatchOp[],
  bilder?: Map<string, AufgeloestesBild>
): Ergebnis {
  const fehler: string[] = []
  const neu = JSON.parse(JSON.stringify(config)) as SiteConfig

  for (const op of ops) {
    if (op.op === 'update_text') {
      const gesperrt = GESPERRTE_PFADE.find((g) => g.muster.test(op.pfad))
      if (gesperrt) {
        fehler.push(gesperrt.grund)
        continue
      }
      const limit = EINGESCHRAENKTE_PFADE.find((e) => e.muster.test(op.pfad))
      if (limit && op.wert.length > limit.maxLaenge) {
        fehler.push(`${limit.feld} darf höchstens ${limit.maxLaenge} Zeichen haben (aktuell ${op.wert.length}).`)
        continue
      }
      const segmente = op.pfad.split('.')
      const bestand = getPfad(neu, segmente)
      if (typeof bestand !== 'string') {
        fehler.push(`Das Feld "${op.pfad}" existiert nicht oder ist kein Textfeld.`)
        continue
      }
      setPfad(neu as unknown as Record<string, unknown>, segmente, op.wert)
    } else if (op.op === 'swap_image_from_bank') {
      if (/(^|\.)logoUrl$/.test(op.pfad)) {
        fehler.push('Das Logo wird über den Bilder-Upload geändert, nicht per Chat.')
        continue
      }
      if (!/(imageUrl|ImageUrl)$|(^|\.)galleryImages\.\d+$/.test(op.pfad)) {
        fehler.push(`"${op.pfad}" ist kein Bild-Feld.`)
        continue
      }
      const asset = bilder?.get(op.assetId)
      if (!asset) {
        fehler.push('Dieses Bild steht für Ihre Website nicht zur Verfügung — ich biete nur freigegebene Bilder Ihrer Branche und Ihre eigenen Uploads an.')
        continue
      }
      const erlaubt = erlaubteSzenenFuerPfad(op.pfad)
      if (erlaubt && (!asset.szeneTyp || !erlaubt.includes(asset.szeneTyp))) {
        fehler.push(`Dieses Bild passt vom Format nicht auf das Feld "${op.pfad}" (benötigt: ${erlaubt.join('/')}). Ich schlage gern ein passendes Bild vor.`)
        continue
      }
      const segmente = op.pfad.split('.')
      const bestand = getPfad(neu, segmente)
      if (typeof bestand !== 'string') {
        fehler.push(`Das Bild-Feld "${op.pfad}" existiert nicht.`)
        continue
      }
      setPfad(neu as unknown as Record<string, unknown>, segmente, asset.url)
    } else if (op.op === 'set_theme_preset') {
      const preset = THEME_PRESETS[op.preset]
      if (neu.site && neu.site.colors) {
        neu.site.colors.primary = preset.primary
        neu.site.colors.secondary = preset.secondary
        neu.site.colors.background = preset.background
        neu.site.colors.text = preset.text
      } else {
        neu.primaryColor = preset.primary
        neu.secondaryColor = preset.secondary
        neu.backgroundColor = preset.background
        neu.textColor = preset.text
      }
    } else if (op.op === 'add_section_from_library') {
      if (!Array.isArray(neu.sections)) {
        fehler.push('Neue Sektionen sind bei diesem Seitentyp noch nicht per Chat möglich.')
        continue
      }
      const sections = neu.sections as unknown as SektionsEintrag[]
      const maxOrder = sections.reduce((m, s) => Math.max(m, s.order || 0), 0)
      sections.push({
        id: `sek-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: op.typ,
        title: op.titel,
        visible: true,
        order: maxOrder + 1,
      })
    } else if (op.op === 'reorder') {
      if (!Array.isArray(neu.sections)) {
        fehler.push('Umsortieren ist bei diesem Seitentyp noch nicht per Chat möglich.')
        continue
      }
      const sections = neu.sections as unknown as SektionsEintrag[]
      const vorhandene = sections.map((s) => s.id).sort()
      const gewuenscht = [...op.sectionIds].sort()
      if (JSON.stringify(vorhandene) !== JSON.stringify(gewuenscht)) {
        fehler.push('Die neue Reihenfolge muss genau die bestehenden Sektionen enthalten (nichts löschen, nichts erfinden).')
        continue
      }
      const heroId = sections.find((s) => GESCHUETZTE_SEKTIONS_TYPEN.includes(s.type) && s.type === 'hero')?.id
      if (heroId && op.sectionIds[0] !== heroId) {
        fehler.push('Der Hero-Bereich bleibt immer an erster Stelle.')
        continue
      }
      op.sectionIds.forEach((id, index) => {
        const s = sections.find((x) => x.id === id)
        if (s) s.order = index
      })
      sections.sort((a, b) => (a.order || 0) - (b.order || 0))
    } else if (op.op === 'toggle') {
      if (!Array.isArray(neu.sections)) {
        fehler.push('Ein-/Ausblenden ist bei diesem Seitentyp noch nicht per Chat möglich.')
        continue
      }
      const sections = neu.sections as unknown as SektionsEintrag[]
      const sektion = sections.find((s) => s.id === op.sectionId)
      if (!sektion) {
        fehler.push(`Die Sektion "${op.sectionId}" wurde nicht gefunden.`)
        continue
      }
      if (!op.sichtbar && GESCHUETZTE_SEKTIONS_TYPEN.includes(sektion.type)) {
        fehler.push('Hero, Haupt-Button und Kontakt können nicht ausgeblendet werden — sie sind konversionskritisch.')
        continue
      }
      sektion.visible = op.sichtbar
    }
  }

  if (fehler.length > 0) return { ok: false, fehler }
  return { ok: true, config: neu }
}

/** Formatiert die Editor-Bildliste für den Prompt (nur diese IDs sind tauschbar). */
export function formatiereBildListe(
  bilder: { id: string; szene_typ: string | null; quelle: string; alt_text_de: string | null }[]
): string {
  if (bilder.length === 0) return 'Aktuell sind keine Tausch-Bilder verfügbar — biete den Bilder-Upload an.'
  return bilder
    .slice(0, 40)
    .map((b) => {
      const herkunft = b.quelle === 'kunde' ? 'eigenes Kundenbild' : 'Branchen-Bank'
      return `- ${b.id} · Szene: ${b.szene_typ || 'unbestimmt'} · ${herkunft}${b.alt_text_de ? ` · ${b.alt_text_de}` : ''}`
    })
    .join('\n')
}

/** Prompt-Baustein: beschreibt dem Modell das EINZIG erlaubte Patch-Format. */
export function getOpsPrompt(bildListe?: string): string {
  return `# ÄNDERUNGS-FORMAT (STRIKT)
Du änderst die Website AUSSCHLIESSLICH über strukturierte Operationen — NIE über rohes HTML, CSS oder freie JSON-Objekte.

Wenn der Kunde eine Änderung wünscht, antworte mit einer kurzen Bestätigung und häng GENAU EINEN Block an:

<patch_ops>
[{"op": "update_text", "pfad": "tagline", "wert": "Neuer Text"}]
</patch_ops>

Erlaubte Operationen (nichts anderes existiert):
1. {"op": "update_text", "pfad": "<feldpfad>", "wert": "<neuer Text>"} — Textfelder ändern
2. {"op": "swap_image_from_bank", "pfad": "<bildfeldpfad>", "assetId": "<ID aus VERFÜGBARE BILDER>"} — Bild tauschen
3. {"op": "set_theme_preset", "preset": "<${Object.keys(THEME_PRESETS).join(' | ')}>"} — Farbschema (NIE freie HEX-Werte)
4. {"op": "add_section_from_library", "typ": "<${ERLAUBTE_SEKTIONS_TYPEN.join(' | ')}>", "titel": "<Titel>"} — Sektion ergänzen
5. {"op": "reorder", "sectionIds": ["id1", "id2", ...]} — Reihenfolge (alle bestehenden IDs, Hero bleibt vorn)
6. {"op": "toggle", "sectionId": "<id>", "sichtbar": true|false} — Sektion ein-/ausblenden (Hero/Kontakt nie)

# VERFÜGBARE BILDER (swap_image_from_bank — NUR diese IDs, nie URLs, nie erfundene IDs)
${bildListe || 'Aktuell sind keine Tausch-Bilder verfügbar — biete den Bilder-Upload an.'}
- Hero-Bildfelder (Pfad enthält "hero") NUR mit Bildern der Szene "hero" belegen.
- Galerie-/Inhaltsbilder: jede Szene erlaubt, wähle inhaltlich passend.

Regeln:
- Pfade zeigen auf BESTEHENDE Felder der Konfiguration (siehe unten), z.B. "tagline" oder "pages.home.config.hero.headline".
- Telefonnummer, Logo, Impressum/Datenschutz und Farben per Text-Op sind gesperrt — erkläre dem Kunden freundlich den richtigen Weg.
- GESPERRTE BEREICHE (Hero-Struktur, Haupt-Button/CTA, Kontakt-Sektion, Rechtstexte): NIE einen Op versuchen. Stattdessen in 1–2 Sätzen BEGRÜNDEN, warum das geschützt ist (konversionskritisch bzw. rechtliche Pflicht), und eine konkrete ALTERNATIVE anbieten (z.B. Text im Hero ändern statt Hero entfernen, Design-Vorlage statt freier Farbe, Support für Rechtsfragen).
- Änderungen landen im ENTWURF. Sag dem Kunden: prüfen in der Vorschau, dann "Veröffentlichen" klicken.
- Bei reinen Fragen: KEIN patch_ops-Block.`
}
