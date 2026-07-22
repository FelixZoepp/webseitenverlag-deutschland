/**
 * F5 Demo-Pipeline (BF §6): Demo aus einer FREIGEGEBENEN Branchen-Vorlage.
 *
 * Ablauf: approved branchen_profile laden → Vorlage klonen → deterministisch
 * personalisieren (Firma/Ort/Telefon per String-Walk, meta ersetzen, echte
 * Google-Bewertungen in die Stimmen) → Schlüssel-Assets FRISCH generieren
 * (Hero 16:9 + Signature-Paar 4:3, quelle 'demo_generiert') mit Fallback-
 * Kette frisch → Bank → CSS-Platzhalter. Kein Lauf scheitert an Bildern
 * (BF §2.3) — DoD: ≤ 150 Cent pro Demo, sonst Warnung.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { generiereAsset, makePair } from '@/lib/assets/pipeline'
import { getApprovedAssets } from '@/lib/assets/repository'
import { baueAssetPrompt, baueVideoPrompt } from '@/lib/seeding/seed-branche'
import type { BranchenProfil } from '@/lib/seeding/schema'
import type { FlagshipConfig, FlagshipDesign } from '@/lib/flagship/types'
import type { ProspectData } from './prospect-data'

const BUCKET = 'asset-bank'

/** M5: Branchen-spezifische Video-Bewegungs-Prompts für Flagships ohne style_prompts */
const VIDEO_PROMPTS: Record<string, { loop: string; scrub: string }> = {
  reinigung: {
    loop: 'Extreme close-up of a grimy glass surface — an invisible force wipes across from left to right, revealing crystal-clear sparkling glass with bright daylight streaming through. Water droplets bead and roll off the clean surface. Static camera, no person visible, no text, no logos.',
    scrub: 'Wide shot of a neglected dusty office space transforming into an immaculate clean room — dust disappears from surfaces, floors begin to gleam, windows clear up, everything shines. Static camera, no person, smooth continuous transformation, no text, no logos.',
  },
  restaurant_italienisch: {
    loop: 'Overhead static shot of an empty white ceramic plate on a rustic wooden table — steam rises as fresh handmade pasta with rich tomato sauce materializes on the plate, finished with torn basil leaves and shaved parmesan. Warm candlelight flickers. No hands visible, no text, no logos.',
    scrub: 'A bare dark restaurant table transforms into a fully set Italian dinner scene — white tablecloth appears, plates materialize, wine slowly fills crystal glasses, candles light themselves, napkins fold. Static camera, warm evening light, no person, no text, no logos.',
  },
  maler: {
    loop: 'Close-up of a paint roller pressing against a wall — fresh white paint spreads smoothly across a patchy grey surface, leaving a perfect even finish. Paint glistens wet under bright work lighting. Static camera, only roller and wall visible, no face, no text, no logos.',
    scrub: 'A room with damaged peeling walls transforms — cracks fill themselves, primer appears, then fresh paint rolls across every surface. The room brightens from dull grey to pristine white. Static camera, no person, no text, no logos.',
  },
  dachdecker: {
    loop: 'Close-up of weathered broken roof tiles — new slate tiles slide into place one by one, clicking together perfectly. Morning sunlight catches the clean dark surfaces. Static camera from above, only tiles and hands in work gloves visible, no face, no text, no logos.',
    scrub: 'Aerial view of a damaged old roof transforming — broken tiles replace themselves, flashing appears, gutters straighten. The roof goes from patchy and worn to pristine and uniform. Static camera, no person, no text, no logos.',
  },
  cafe: {
    loop: 'Close-up of an espresso machine portafilter locking in — rich dark espresso streams into a white ceramic cup, crema forms a perfect golden layer on top, steam wisps curl upward. Soft morning café light. Static camera, no face visible, no text, no logos.',
    scrub: 'An empty café counter transforms into a bustling setup — espresso machine gleams to life, pastries appear under glass cloches, coffee beans fill the grinder, menu boards write themselves. Warm morning light, static camera, no person, no text, no logos.',
  },
  kosmetikstudio: {
    loop: 'Close-up of a jade roller gliding across a dewy skin surface — product absorbs, skin transforms from dull to radiant and glowing. Soft pink-toned studio lighting with gentle lens flare. Static camera, only skin and tool visible, no face, no text, no logos.',
    scrub: 'A plain treatment room transforms into a luxurious spa setup — towels fold themselves, candles light, products arrange on shelves, the treatment bed prepares with fresh linens. Soft warm lighting, static camera, no person, no text, no logos.',
  },
  zahnarzt: {
    loop: 'Close-up of dental instruments arranged on a sterile tray — bright LED examination light slowly powers on, reflecting off polished chrome surfaces. Sterile blue-white lighting, clean and precise. Static camera, no person, no text, no logos.',
    scrub: 'An empty dental treatment room powers up — the chair adjusts itself, monitors flicker on showing dental imagery, instruments arrange on the tray, the overhead light swings into position. Clean clinical lighting, static camera, no person, no text, no logos.',
  },
  physiotherapie: {
    loop: 'Close-up of therapy resistance bands stretching and releasing in rhythmic motion — natural light streams through floor-to-ceiling windows of a modern treatment room. Bands catch the light with each stretch. Static camera, no person, no text, no logos.',
    scrub: 'A bare therapy room equips itself — exercise balls inflate, resistance bands hang themselves on hooks, a treatment table unfolds fresh sheets, anatomical charts appear on walls. Bright natural light, static camera, no person, no text, no logos.',
  },
  friseur: {
    loop: 'Extreme close-up of professional scissors making precise cuts through hair strands in slow motion — cut hair falls catching salon spotlight, each strand detailed and sharp. Warm salon lighting. Static camera, only scissors and hair visible, no face, no text, no logos.',
    scrub: 'A salon station transforms from closed to ready — mirror lights up, scissors and combs arrange themselves, fresh cape unfolds on the chair, product bottles line up. Warm professional lighting, static camera, no person, no text, no logos.',
  },
  kfz_werkstatt: {
    loop: 'Close-up of a chrome wrench turning on a bolt — oil glistens on metal surfaces, a hydraulic lift slowly raises a car in the background. Workshop LED lighting reflects off polished tools. Static camera, only hands in gloves and tools visible, no face, no text, no logos.',
    scrub: 'An empty garage bay comes to life — a hydraulic lift rises, tool chest drawers extend, diagnostic screens power on, compressed air hoses coil into place. Industrial lighting, static camera, no person, no text, no logos.',
  },
  autoaufbereitung: {
    loop: 'Close-up of a car hood surface — water beads form and slowly roll off a freshly ceramic-coated deep black surface, reflecting surrounding lights like a mirror. The paint transforms from matte dusty to mirror-glossy. Static camera, no person, no text, no logos.',
    scrub: 'A neglected dusty car transforms — dirt washes away layer by layer, scratches fill and disappear, paint deepens to a mirror finish, chrome trim gleams. The car goes from neglected to showroom condition. Static camera, no person, no text, no logos.',
  },
  umzugsunternehmen: {
    loop: 'Close-up of moving blankets gently settling over furniture — bubble wrap catches light, a dolly wheel rolls smoothly across hardwood floor. Morning light streams through an empty apartment window. Static camera, no face visible, no text, no logos.',
    scrub: 'An empty apartment fills itself — boxes slide in through the door, furniture unwraps and positions itself, pictures hang on walls, plants appear on windowsills. Morning light, static camera, no person, no text, no logos.',
  },
  fotograf: {
    loop: 'A camera shutter closes in slow motion — the brief moment of exposure captured in detail, followed by a soft studio flash reflecting off a silver umbrella. Gentle bokeh lights drift in background. Static camera, only camera equipment visible, no person, no text, no logos.',
    scrub: 'A dark photo studio lights up — backdrop rolls down, softboxes power on one by one, camera mounts itself on tripod, lens focuses. Dramatic lighting transformation from dark to perfectly lit. Static camera, no person, no text, no logos.',
  },
  fitnessstudio: {
    loop: 'Close-up of a barbell being loaded — weight plates slide onto the bar one by one with satisfying clicks, chrome gleams under gym LED lighting. The bar slightly flexes under the weight. Static camera, no person, no text, no logos.',
    scrub: 'An empty gym floor equips itself — dumbbells rack themselves by weight, a cable machine tensions its cables, mirrors reflect increasingly equipped space, rubber flooring mats interlock. Bright gym lighting, static camera, no person, no text, no logos.',
  },
  personal_training: {
    loop: 'Close-up of a kettlebell gently swinging in the morning dew — outdoor training setup with resistance bands stretching in the wind, fresh morning sunlight creating long shadows on grass. Static camera, no person, no text, no logos.',
    scrub: 'An empty outdoor training area sets itself up — cones place themselves, battle ropes coil out, a training mat unrolls, TRX straps hang from a frame. Morning golden hour light, static camera, no person, no text, no logos.',
  },
  hausmeisterservice: {
    loop: 'Close-up of a set of brass keys swinging gently on a caretaker key ring — behind them, a freshly painted railing dries in sunlight, a garden sprinkler slowly rotates. Warm afternoon light. Static camera, no person, no text, no logos.',
    scrub: 'A neglected building entrance transforms — peeling paint refreshes itself, broken light fixtures repair, the garden tidies, the entrance mat straightens. Afternoon sunlight, static camera, no person, no text, no logos.',
  },
  padel: {
    loop: 'A padel ball rolls slowly across a pristine blue court surface — subtle LED light reflections shimmer on the glass walls, dust particles float in the bright court lighting. The ball gently bounces once. Static camera at ground level, no person, no text, no logos.',
    scrub: 'An empty padel court prepares for play — court lines illuminate, net tensions itself, glass walls gleam as lights power on sequentially, a racket and balls appear courtside. Static camera, no person, no text, no logos.',
  },
}

/** Design-Overrides für die Demo-Generierung (UI → API → Pipeline) */
export interface DesignOverrides {
  /** Hell (sans_bold_hell) oder Dunkel (serif_warm_dunkel) */
  typo_modus?: 'sans_bold_hell' | 'serif_warm_dunkel'
  /** Eigene Brandfarbe (#hex) — ersetzt akzent1, akzent1_tief wird abgeleitet */
  brandfarbe?: string
  /** Premium-Animationen aktivieren (Parallax, staggered reveals) */
  premium_animationen?: boolean
}

/** Dunkelt eine Hex-Farbe um ~25% ab (für akzent1_tief) */
function dunklereVariante(hex: string): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim())
  if (!m) return hex
  const n = parseInt(m[1], 16)
  const r = Math.max(0, Math.round(((n >> 16) & 255) * 0.72))
  const g = Math.max(0, Math.round(((n >> 8) & 255) * 0.72))
  const b = Math.max(0, Math.round((n & 255) * 0.72))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/** Standard-Token-Palette für hell/dunkel (wenn der Modus gewechselt wird) */
const HELL_TOKENS: Partial<FlagshipDesign['tokens']> = {
  basis: '#F5F3ED', panel: '#FFFFFF', text: '#1A1A19', text_soft: 'rgba(26,26,25,.62)',
  line: 'rgba(26,26,25,.10)',
}
const DUNKEL_TOKENS: Partial<FlagshipDesign['tokens']> = {
  basis: '#1B1612', panel: '#2A2420', text: '#F2ECE0', text_soft: 'rgba(242,236,224,.62)',
  line: 'rgba(242,236,224,.12)',
}

/** Wendet Design-Overrides auf die geklonte Config an */
function wendeDesignOverridesAn(config: FlagshipConfig, overrides: DesignOverrides): void {
  if (overrides.typo_modus && overrides.typo_modus !== config.design.typo_modus) {
    const hell = overrides.typo_modus === 'sans_bold_hell'
    config.design.typo_modus = overrides.typo_modus
    config.design.typo_signature = hell ? 'wisch_highlight' : 'gold_unterstrich'
    // Basis-Tokens tauschen (Hintergrund, Text, Panel, Linien)
    const tokens = hell ? HELL_TOKENS : DUNKEL_TOKENS
    Object.assign(config.design.tokens, tokens)
  }
  if (overrides.brandfarbe && /^#[0-9a-fA-F]{6}$/.test(overrides.brandfarbe)) {
    config.design.tokens.akzent1 = overrides.brandfarbe
    config.design.tokens.akzent1_tief = dunklereVariante(overrides.brandfarbe)
  }
  if (overrides.premium_animationen) {
    config.premium_animationen = true
  }
}
/** DoD-Grenze (BF §6): Kosten pro Demo in Cent */
const DEMO_KOSTEN_LIMIT_CENT = 150

const MAX_ASSET_DURCHLAEUFE = 2

/**
 * Prüft ob alle Pflicht-Asset-Slots in der Config befüllt sind.
 * Gibt die Namen fehlender Slots zurück (leer = alles ok).
 */
function fehlendePflichtSlots(config: FlagshipConfig): string[] {
  const fehlend: string[] = []
  if (!config.inhalte.hero.media.datei) fehlend.push('hero')
  if (!config.inhalte.signature.nachher.datei) fehlend.push('signature-nachher')
  if (!config.inhalte.signature.vorher.datei) fehlend.push('signature-vorher')
  if (config.inhalte.ergebnisse.variante === 'ba_slider' && config.inhalte.ergebnisse.paare) {
    for (let i = 0; i < config.inhalte.ergebnisse.paare.length; i++) {
      const p = config.inhalte.ergebnisse.paare[i]
      if (!p.nachher.datei) fehlend.push(`ergebnis-${i}-nachher`)
      if (!p.vorher.datei) fehlend.push(`ergebnis-${i}-vorher`)
    }
  }
  return fehlend
}

export interface DemoAssetMeta {
  hero?: { id: string; quelle: 'frisch' | 'bank' }
  video?: { job_id: string; quelle: 'frisch' }
  paar?: { pair_id: string | null; asset_ids: string[]; quelle: 'frisch' | 'bank' }
  fallback: string[]
  warnungen: string[]
}

/** Info für asynchrone Video-Generierung (nach dem Response) */
export interface VideoJobInfo {
  heroImageUrl: string
  videoPrompt: string
  videoModus: 'loop' | 'scrub'
  kontext: string
}

export interface FlagshipDemoErgebnis {
  config: FlagshipConfig
  kostenCent: number
  assetMeta: DemoAssetMeta
  warnungen: string[]
  /** Video-Job Infos für async Generierung — wird NICHT synchron awaited */
  videoJob?: VideoJobInfo
}

/**
 * Ersetzungs-Paare für den Vorlagen-Ort inkl. Schreibvarianten: Seeds wie
 * "Berlin-Friedrichshagen" nennen den Ort in Texten auch als
 * "Berlin Friedrichshagen" (Leerzeichen) und schlicht "Berlin" — ohne diese
 * Varianten bleibt die fremde Stadt im Text stehen (Konsistenz-Validator §4.3).
 * Reihenfolge: längste Variante zuerst, damit split/join sauber greift.
 */
export function ortErsetzungsPaare(vorlagenOrt: string, neuerOrt: string): [string, string][] {
  if (!vorlagenOrt || !neuerOrt || vorlagenOrt === neuerOrt) return []
  const paare: [string, string][] = [[vorlagenOrt, neuerOrt]]
  const mitLeerzeichen = vorlagenOrt.replace(/-/g, ' ')
  if (mitLeerzeichen !== vorlagenOrt && mitLeerzeichen !== neuerOrt) {
    paare.push([mitLeerzeichen, neuerOrt])
  }
  const basisOrt = vorlagenOrt.split(/[\s-]/)[0]
  if (basisOrt && basisOrt !== vorlagenOrt && basisOrt !== neuerOrt) {
    paare.push([basisOrt, neuerOrt])
  }
  return paare
}

/** Rekursiver String-Walk: ersetzt Vorlagen-Werte (Firma/Ort/Telefon) in allen Texten */
function ersetzeUeberall<T>(wert: T, paare: [string, string][]): T {
  if (typeof wert === 'string') {
    let s: string = wert
    for (const [alt, neu] of paare) s = s.split(alt).join(neu)
    return s as T
  }
  if (Array.isArray(wert)) return wert.map((v) => ersetzeUeberall(v, paare)) as T
  if (wert && typeof wert === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(wert)) out[k] = ersetzeUeberall(v, paare)
    return out as T
  }
  return wert
}

function initialen(name: string): string {
  const teile = name.trim().split(/\s+/).filter(Boolean)
  const init = teile.map((t) => t[0]).join('').slice(0, 2).toUpperCase()
  return init || 'GK'
}

function publicUrl(admin: SupabaseClient, storagePath: string): string {
  return admin.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl
}

/**
 * Bank-Fallback Hero — NUR approved (§3.2): der einzige Lesepfad ist das
 * Repository; Draft-/Rejected-Assets werden nie ausgespielt.
 */
async function bankHero(
  admin: SupabaseClient,
  brancheKey: string
): Promise<{ id: string; url: string } | null> {
  const kandidaten = await getApprovedAssets(admin, { branche: brancheKey, szeneTyp: 'hero' })
  const row = kandidaten[0]
  return row ? { id: row.id, url: publicUrl(admin, row.storage_path) } : null
}

/**
 * Bank-Fallback Signature-Paar — NUR approved (§3.2), IMMER über pair_id:
 * beide Hälften müssen approved sein, sonst kein Paar (nie ein halbes).
 */
async function bankPaar(
  admin: SupabaseClient,
  brancheKey: string
): Promise<{ pairId: string; ids: string[]; nachherUrl: string; vorherUrl: string } | null> {
  const kandidaten = await getApprovedAssets(admin, { branche: brancheKey })
  const nachherListe = kandidaten.filter((a) => a.szene_typ === 'nachher' && a.pair_id)
  for (const nachher of nachherListe) {
    const vorher = kandidaten.find(
      (a) => a.szene_typ === 'vorher' && a.pair_id === nachher.pair_id
    )
    if (vorher) {
      return {
        pairId: nachher.pair_id as string,
        ids: [nachher.id, vorher.id],
        nachherUrl: publicUrl(admin, nachher.storage_path),
        vorherUrl: publicUrl(admin, vorher.storage_path),
      }
    }
  }
  return null
}

/**
 * Phase 1: Nur Personalisierung (OHNE Asset-Generierung).
 * Klont die Vorlage, ersetzt Firma/Ort/Telefon, Google-Bewertungen, Lokal-Chips.
 * Dauert <2s — sicher innerhalb jedes Timeouts.
 */
export async function personalisiereFlagshipConfig(
  prospect: ProspectData,
  brancheKey: string,
  overrides?: DesignOverrides
): Promise<{ config: FlagshipConfig }> {
  const admin = createAdminClient()

  const { data: row, error } = await admin
    .from('branchen_profile')
    .select('branche_key, name, quality_status, profil')
    .eq('branche_key', brancheKey)
    .maybeSingle()
  if (error) throw new Error(`Branchen-Vorlage laden fehlgeschlagen: ${error.message}`)
  if (!row) throw new Error(`Branchen-Vorlage "${brancheKey}" nicht gefunden`)
  if (row.quality_status !== 'approved') {
    throw new Error(
      `Branche "${brancheKey}" ist nicht freigegeben (${row.quality_status}) — ohne Freigabe keine Demo. Freigabe: /admin/branchen`
    )
  }

  const gespeichert = row.profil as {
    profil: BranchenProfil | null
    vorlage: FlagshipConfig
  } | null
  const vorlage = gespeichert?.vorlage
  if (!vorlage || vorlage.engine !== 'flagship') {
    throw new Error(`Branche "${brancheKey}" hat keine Flagship-Vorlage im Profil`)
  }

  const config = structuredClone(vorlage)
  if (overrides) wendeDesignOverridesAn(config, overrides)
  const paare: [string, string][] = []
  if (config.meta.firma && config.meta.firma !== prospect.firma) {
    paare.push([config.meta.firma, prospect.firma])
  }
  if (prospect.ort && config.meta.ort && config.meta.ort !== prospect.ort) {
    paare.push(...ortErsetzungsPaare(config.meta.ort, prospect.ort))
  }
  if (prospect.telefon && config.meta.telefon && config.meta.telefon !== prospect.telefon) {
    paare.push([config.meta.telefon, prospect.telefon])
  }
  config.inhalte = ersetzeUeberall(config.inhalte, paare)
  config.funnel = ersetzeUeberall(config.funnel, paare)

  config.meta = {
    firma: prospect.firma,
    ort: prospect.ort ?? config.meta.ort,
    telefon: prospect.telefon ?? undefined,
    email: prospect.email ?? undefined,
    adresse: prospect.adresse ?? undefined,
    gegruendet: prospect.gruendungsjahr ?? undefined,
    seo_titel: config.meta.seo_titel
      ? ersetzeUeberall(config.meta.seo_titel, paare)
      : `${prospect.firma}${prospect.ort ? ` — ${prospect.ort}` : ''}`,
    seo_beschreibung: config.meta.seo_beschreibung
      ? ersetzeUeberall(config.meta.seo_beschreibung, paare)
      : undefined,
  }
  config.inhalte.conversion.telefon = prospect.telefon ?? undefined

  if (prospect.ort && config.meta.ort && config.inhalte.lokal.variante === 'bezirke') {
    const vorlagenOrt = vorlage.meta.ort || ''
    if (vorlagenOrt && prospect.ort.toLowerCase() !== vorlagenOrt.toLowerCase()) {
      config.inhalte.lokal.chips = [prospect.ort, `${prospect.ort} und Umgebung`, `Großraum ${prospect.ort}`]
      if (config.inhalte.lokal.note) {
        config.inhalte.lokal.note = config.inhalte.lokal.note.split(vorlagenOrt).join(prospect.ort)
      }
    }
  }
  config.herkunft = { ...config.herkunft, generator: 'flagship-demo', quellen: prospect.quellen }

  if (prospect.bewertungen.length >= 2) {
    config.inhalte.stimmen.quotes = prospect.bewertungen.slice(0, 3).map((b) => ({
      text: b.text, initialen: initialen(b.name), name: b.name,
      meta: `Google-Bewertung · ${'★'.repeat(Math.max(1, Math.min(5, Math.round(b.rating))))}`,
    }))
  }

  return { config }
}

/**
 * Phase 2: Asset-Generierung (Hero, Signature, Ergebnis-Paare).
 * Wird als separater API-Call getriggert NACH dem Demo-Erstellen.
 * Dauert 60-180s — hat eigenen maxDuration: 300.
 */
export async function generiereFlagshipDemo(
  prospect: ProspectData,
  brancheKey: string,
  overrides?: DesignOverrides
): Promise<FlagshipDemoErgebnis> {
  const admin = createAdminClient()

  const { data: row, error } = await admin
    .from('branchen_profile')
    .select('branche_key, name, quality_status, profil')
    .eq('branche_key', brancheKey)
    .maybeSingle()
  if (error) throw new Error(`Branchen-Vorlage laden fehlgeschlagen: ${error.message}`)
  if (!row) throw new Error(`Branchen-Vorlage "${brancheKey}" nicht gefunden`)
  if (row.quality_status !== 'approved') {
    throw new Error(
      `Branche "${brancheKey}" ist nicht freigegeben (${row.quality_status}) — ohne Freigabe keine Demo. Freigabe: /admin/branchen`
    )
  }

  const gespeichert = row.profil as {
    profil: BranchenProfil | null
    vorlage: FlagshipConfig
  } | null
  const vorlage = gespeichert?.vorlage
  if (!vorlage || vorlage.engine !== 'flagship') {
    throw new Error(`Branche "${brancheKey}" hat keine Flagship-Vorlage im Profil`)
  }

  // 1) Klonen + Design-Overrides + deterministische Personalisierung (kein Claude-Call)
  const config = structuredClone(vorlage)
  if (overrides) wendeDesignOverridesAn(config, overrides)
  const paare: [string, string][] = []
  if (config.meta.firma && config.meta.firma !== prospect.firma) {
    paare.push([config.meta.firma, prospect.firma])
  }
  if (prospect.ort && config.meta.ort && config.meta.ort !== prospect.ort) {
    paare.push(...ortErsetzungsPaare(config.meta.ort, prospect.ort))
  }
  if (prospect.telefon && config.meta.telefon && config.meta.telefon !== prospect.telefon) {
    paare.push([config.meta.telefon, prospect.telefon])
  }
  config.inhalte = ersetzeUeberall(config.inhalte, paare)
  config.funnel = ersetzeUeberall(config.funnel, paare)

  config.meta = {
    firma: prospect.firma,
    ort: prospect.ort ?? config.meta.ort,
    telefon: prospect.telefon ?? undefined,
    email: prospect.email ?? undefined,
    adresse: prospect.adresse ?? undefined,
    gegruendet: prospect.gruendungsjahr ?? undefined,
    seo_titel: config.meta.seo_titel
      ? ersetzeUeberall(config.meta.seo_titel, paare)
      : `${prospect.firma}${prospect.ort ? ` — ${prospect.ort}` : ''}`,
    seo_beschreibung: config.meta.seo_beschreibung
      ? ersetzeUeberall(config.meta.seo_beschreibung, paare)
      : undefined,
  }
  // Template-Telefon nie im Kundenoutput: ohne echte Nummer Slot leeren
  config.inhalte.conversion.telefon = prospect.telefon ?? undefined

  // Lokal-Chips: Bezirke aus der Vorlage passen nur zur Vorlage-Stadt.
  // Bei anderem Ort → Chips durch generische Ortsangabe ersetzen.
  if (prospect.ort && config.meta.ort && config.inhalte.lokal.variante === 'bezirke') {
    const vorlagenOrt = vorlage.meta.ort || ''
    if (vorlagenOrt && prospect.ort.toLowerCase() !== vorlagenOrt.toLowerCase()) {
      config.inhalte.lokal.chips = [
        prospect.ort,
        `${prospect.ort} und Umgebung`,
        `Großraum ${prospect.ort}`,
      ]
      if (config.inhalte.lokal.note) {
        config.inhalte.lokal.note = config.inhalte.lokal.note
          .split(vorlagenOrt).join(prospect.ort)
      }
    }
  }
  config.herkunft = {
    ...config.herkunft,
    generator: 'flagship-demo',
    quellen: prospect.quellen,
  }

  // Echte Google-Bewertungen ersetzen die Vorlagen-Stimmen (ab 2 Stück)
  if (prospect.bewertungen.length >= 2) {
    config.inhalte.stimmen.quotes = prospect.bewertungen.slice(0, 3).map((b) => ({
      text: b.text,
      initialen: initialen(b.name),
      name: b.name,
      meta: `Google-Bewertung · ${'★'.repeat(Math.max(1, Math.min(5, Math.round(b.rating))))}`,
    }))
  }

  // 2) Schlüssel-Assets: Retry-Schleife → Bank-Fallback → Pflicht-Validierung
  const warnungen: string[] = []
  const assetMeta: DemoAssetMeta = { fallback: [], warnungen }
  let kostenCent = 0
  const styleProfil = gespeichert?.profil
  const kontext = `demo:${brancheKey}:${prospect.firma}`
  for (let durchlauf = 1; durchlauf <= MAX_ASSET_DURCHLAEUFE; durchlauf++) {
    // Prompts vorbereiten
    let heroPrompt: string | null = null
    let nachherPrompt: string | null = null
    let vorherPrompt: string | null = null

    if (!config.inhalte.hero.media.datei) {
      if (styleProfil?.style_prompts) {
        heroPrompt = baueAssetPrompt(styleProfil, styleProfil.style_prompts.szenen.hero)
      } else {
        const heroLabel = config.inhalte.hero.media.label || config.inhalte.hero.eyebrow
        const brancheName = row.name || brancheKey
        heroPrompt = [
          `Close-up on the craft and result: ${heroLabel}, hands and tools only, no face visible, cropped above shoulders.`,
          `The main action positioned on the RIGHT half of the frame, calm open ${brancheName} interior on the left.`,
          `${brancheName} professional environment, authentic workplace details.`,
          `Bright natural side lighting with reflections on clean surfaces.`,
          `Shallow depth of field, 16:9 wide format.`,
          `Photorealistic editorial photography. No text, no logos, no watermarks, no recognizable people.`,
        ].join(' ')
      }
    }

    if (!config.inhalte.signature.nachher.datei || !config.inhalte.signature.vorher.datei) {
      if (styleProfil?.style_prompts) {
        nachherPrompt = baueAssetPrompt(styleProfil, styleProfil.style_prompts.szenen.signature_nachher)
        vorherPrompt = styleProfil.style_prompts.szenen.signature_vorher
      } else {
        const nachherLabel = config.inhalte.signature.nachher.label || config.inhalte.signature.tag_nachher
        const vorherLabel = config.inhalte.signature.vorher.label || config.inhalte.signature.tag_vorher
        const brancheName = row.name || brancheKey
        const sigCap = config.inhalte.signature.cap || ''
        nachherPrompt = [
          `A ${brancheName} workspace showing: ${nachherLabel}. ${sigCap || brancheName}.`,
          `The result is PERFECT — pristine clean surfaces, fresh paint or finish, professional quality visible in every detail.`,
          `Bright natural daylight flooding the space, warm inviting atmosphere, sharp focus on the quality of workmanship.`,
          `Eye-level perspective, centered composition, 16:9 wide format.`,
          `Photorealistic editorial photography, shallow depth of field. No people visible, no text, no logos, no watermarks.`,
        ].join(' ')
        vorherPrompt = [
          `The SAME ${brancheName} workspace as the reference image but in its NEGLECTED state BEFORE professional work was done.`,
          `${vorherLabel}. Visible wear and deterioration: peeling surfaces, dust buildup, stains, scratches, faded colors.`,
          `SAME room, SAME angle, SAME composition — only the condition is degraded. Overcast flat lighting, muted washed-out colors.`,
          `Photorealistic photography, 16:9 wide format. No people, no text, no logos.`,
        ].join(' ')
      }
    }

    // Hero + Signature PARALLEL generieren (wie vor dem Refactor)
    const aufgaben: Promise<void>[] = []

    if (heroPrompt) {
      aufgaben.push(
        generiereAsset({
          prompt: heroPrompt,
          aspect: '16:9',
          branche: brancheKey,
          szeneTyp: 'hero',
          quelleOverride: 'demo_generiert',
          kontext,
        }).then((hero) => {
          kostenCent += hero.kostenCent
          config.inhalte.hero.media.datei = hero.publicUrl
          assetMeta.hero = { id: hero.id, quelle: 'frisch' }
          // Video wird NICHT synchron generiert — videoJob wird am Ende zurückgegeben
        }).catch((e: Error) => {
          warnungen.push(`Hero-Generierung Durchlauf ${durchlauf} fehlgeschlagen: ${e.message}`)
        })
      )
    }

    if (nachherPrompt && vorherPrompt) {
      aufgaben.push(
        makePair({
          branche: brancheKey,
          nachherPrompt,
          vorherPrompt,
          aspect: '16:9',
          quelleOverride: 'demo_generiert',
          kontext,
        }).then((paar) => {
          kostenCent += paar.nachher.kostenCent + paar.vorher.kostenCent
          config.inhalte.signature.nachher.datei = paar.nachher.publicUrl
          config.inhalte.signature.vorher.datei = paar.vorher.publicUrl
          assetMeta.paar = { pair_id: paar.pairId, asset_ids: [paar.nachher.id, paar.vorher.id], quelle: 'frisch' }
        }).catch((e: Error) => {
          warnungen.push(`Signature-Paar Durchlauf ${durchlauf} fehlgeschlagen: ${e.message}`)
        })
      )
    }

    if (aufgaben.length > 0) await Promise.all(aufgaben)

    // Prüfen ob Hero + Signature komplett sind → früh raus
    if (config.inhalte.hero.media.datei && config.inhalte.signature.nachher.datei && config.inhalte.signature.vorher.datei) {
      break
    }
    if (durchlauf < MAX_ASSET_DURCHLAEUFE) {
      console.warn(`[flagship-demo] Durchlauf ${durchlauf}: Assets unvollständig, starte Retry…`)
    }
  }

  // Fallback-Kette: Bank, dann CSS-Platzhalter (MediaSlot ohne datei)
  if (!config.inhalte.hero.media.datei) {
    const hero = await bankHero(admin, brancheKey)
    if (hero) {
      config.inhalte.hero.media.datei = hero.url
      assetMeta.hero = { id: hero.id, quelle: 'bank' }
      assetMeta.fallback.push('hero:bank')
    } else {
      assetMeta.fallback.push('hero:platzhalter')
    }
  }
  if (!config.inhalte.signature.nachher.datei || !config.inhalte.signature.vorher.datei) {
    const paar = await bankPaar(admin, brancheKey)
    if (paar) {
      config.inhalte.signature.nachher.datei = paar.nachherUrl
      config.inhalte.signature.vorher.datei = paar.vorherUrl
      assetMeta.paar = { pair_id: paar.pairId, asset_ids: paar.ids, quelle: 'bank' }
      assetMeta.fallback.push('signature:bank')
    } else {
      assetMeta.fallback.push('signature:platzhalter')
    }
  }

  if (config.inhalte.ergebnisse.variante === 'ba_slider' && config.inhalte.ergebnisse.paare) {
    // Parallel statt sequentiell (Felix 2026-07-22): sequentiell sprengte bei
    // Templates mit mehreren Paaren (z. B. maler-landing-v1) das Vercel
    // maxDuration-Limit von 300s — Funktion wurde gekillt, DB-Update fiel aus.
    const paarAufgaben = config.inhalte.ergebnisse.paare.map(async (paarDef, i) => {
      if (paarDef.nachher.datei && paarDef.vorher.datei) return

      for (let durchlauf = 1; durchlauf <= MAX_ASSET_DURCHLAEUFE; durchlauf++) {
        try {
          const nachherLabel = paarDef.nachher.label || paarDef.caption
          const vorherLabel = paarDef.vorher.label || paarDef.caption
          const brName = row.name || brancheKey
          const ergebnisPaar = await makePair({
            branche: brancheKey,
            nachherPrompt: [
              `A ${brName} project result: ${nachherLabel}.`,
              `Professional quality finish — pristine, clean, expertly done. Every detail shows craftsmanship.`,
              `Bright natural lighting, sharp focus on the finished result. 16:9 format.`,
              `Photorealistic photography, shallow depth of field. No people, no text, no logos.`,
            ].join(' '),
            vorherPrompt: [
              `The SAME ${brName} project BEFORE professional work — reference image shows the finished state.`,
              `${vorherLabel}. Visible deterioration: worn, damaged, neglected, old condition.`,
              `SAME space, SAME angle — only the condition is degraded. Flat overcast lighting, muted colors.`,
              `Photorealistic photography. No people, no text, no logos.`,
            ].join(' '),
            aspect: '16:9',
            quelleOverride: 'demo_generiert',
            kontext: `${kontext}:ergebnis-${i}`,
          })
          kostenCent += ergebnisPaar.nachher.kostenCent + ergebnisPaar.vorher.kostenCent
          paarDef.nachher.datei = ergebnisPaar.nachher.publicUrl
          paarDef.vorher.datei = ergebnisPaar.vorher.publicUrl
          return
        } catch (e) {
          // Kein throw — Pflicht-Validierung am Ende fängt fehlende Slots
          warnungen.push(`Ergebnis-Paar ${i + 1} Durchlauf ${durchlauf} fehlgeschlagen: ${(e as Error).message}`)
        }
      }
    })
    await Promise.all(paarAufgaben)
  }

  // Pflicht-Validierung: ALLE Asset-Slots müssen befüllt sein
  const fehlend = fehlendePflichtSlots(config)
  if (fehlend.length > 0) {
    throw new Error(
      `Asset-Generierung unvollständig nach ${MAX_ASSET_DURCHLAEUFE} Durchläufen + Bank-Fallback. ` +
      `Fehlende Slots: ${fehlend.join(', ')}. Demo wurde NICHT gespeichert.`
    )
  }

  if (kostenCent > DEMO_KOSTEN_LIMIT_CENT) {
    warnungen.push(
      `Demo-Kosten ${kostenCent} Cent über DoD-Grenze (${DEMO_KOSTEN_LIMIT_CENT} Cent)`
    )
  }

  // Video-Job Info zusammenbauen (wird async NACH dem Response generiert)
  let videoJob: VideoJobInfo | undefined
  if (config.inhalte.hero.media.datei) {
    let videoPrompt: string | undefined
    if (styleProfil?.header_animation?.higgsfield_prompt) {
      videoPrompt = styleProfil.header_animation.higgsfield_prompt
    } else if (styleProfil?.style_prompts) {
      videoPrompt = baueVideoPrompt(styleProfil)
    } else {
      const branchenVideo = VIDEO_PROMPTS[brancheKey]
      if (branchenVideo) {
        videoPrompt = branchenVideo.loop
      } else {
        const heroLabel = config.inhalte.hero.media.label || config.inhalte.hero.eyebrow
        const brancheName = row.name || brancheKey
        videoPrompt = `Cinematic 4K, completely static tripod camera, zero camera movement. Close-up scene: ${heroLabel}. ${brancheName} environment. Subtle ambient motion, gentle material movement, dust particles in light. Seamless 5-second loop, calm and premium. No face visible, no person looking at camera. No text, no logos.`
      }
    }
    if (videoPrompt) {
      videoJob = {
        heroImageUrl: config.inhalte.hero.media.datei,
        videoPrompt,
        videoModus: styleProfil?.header_animation?.typ === 'scroll_scrub' ? 'scrub' : 'loop',
        kontext: `video:${kontext}`,
      }
    }
  }

  return { config, kostenCent, assetMeta, warnungen, videoJob }
}
