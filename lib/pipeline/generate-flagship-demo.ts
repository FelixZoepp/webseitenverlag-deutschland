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
import { generiereAsset, generiereVideo, makePair } from '@/lib/assets/pipeline'
import { baueAssetPrompt, baueVideoPrompt } from '@/lib/seeding/seed-branche'
import type { BranchenProfil } from '@/lib/seeding/schema'
import type { FlagshipConfig, FlagshipDesign } from '@/lib/flagship/types'
import type { ProspectData } from './prospect-data'

const BUCKET = 'asset-bank'

/** M5: Branchen-spezifische Video-Bewegungs-Prompts für Flagships ohne style_prompts */
const VIDEO_PROMPTS: Record<string, string> = {
  reinigung: 'Light reflections slowly shifting on freshly cleaned glass surfaces, gentle water droplets running down a window pane, dust particles floating in bright morning sunlight.',
  restaurant_italienisch: 'Warm candlelight gently flickering, steam rising from a freshly served pasta dish, wine slowly being poured into a crystal glass.',
  maler: 'Fresh paint slowly dripping from a roller, smooth wet paint surface reflecting light, gentle brush strokes appearing on a wall.',
  dachdecker: 'Morning light slowly moving across roof tiles, gentle wind moving a safety rope, subtle shadows shifting on a slate surface.',
  cafe: 'Steam rising from a fresh espresso cup, milk foam slowly settling in a latte art pattern, gentle light through a cafe window.',
  kosmetikstudio: 'Soft salon lighting slowly shifting, gentle steam from a facial treatment, cosmetic brush softly dusting powder.',
  zahnarzt: 'Clean dental instruments gleaming under bright LED light, gentle water flowing in a dental basin, sterile blue light reflections.',
  physiotherapie: 'Gentle movement of therapy bands, soft natural light streaming through treatment room windows, calm water feature in background.',
  friseur: 'Hair strands gently falling and catching salon light, scissors making precise cuts in slow motion, warm styling tool steam rising.',
  kfz_werkstatt: 'Oil slowly dripping, wrench turning on a chrome bolt with reflections, hydraulic lift slowly raising a car.',
  autoaufbereitung: 'Water beading and slowly running off a freshly polished car hood, wax buffer spinning with light reflections, chrome gleaming.',
  umzugsunternehmen: 'Moving blankets gently settling over furniture, dolly wheels slowly rolling on hardwood floor, morning light through an empty apartment.',
  fotograf: 'Camera shutter slowly closing, studio flash softly reflecting off an umbrella, gentle bokeh lights drifting.',
  fitnessstudio: 'Weight plates gently settling on a barbell, gym floor mat slightly compressing, cable machine slowly releasing tension.',
  personal_training: 'Resistance band slowly stretching, kettlebell gently swinging, morning dew on outdoor training equipment.',
  hausmeisterservice: 'Keys gently swinging on a caretaker ring, fresh paint drying on a railing, garden sprinkler slowly rotating.',
  padel: 'A padel ball gently rolling across the polished court surface, subtle light reflections shimmering on glass walls, dust particles floating in LED light.',
}

/** Design-Overrides für die Demo-Generierung (UI → API → Pipeline) */
export interface DesignOverrides {
  /** Hell (sans_bold_hell) oder Dunkel (serif_warm_dunkel) */
  typo_modus?: 'sans_bold_hell' | 'serif_warm_dunkel'
  /** Eigene Brandfarbe (#hex) — ersetzt akzent1, akzent1_tief wird abgeleitet */
  brandfarbe?: string
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

export interface FlagshipDemoErgebnis {
  config: FlagshipConfig
  kostenCent: number
  assetMeta: DemoAssetMeta
  warnungen: string[]
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

/** Bank-Fallback Hero: approved bevorzugt, sonst neuester Treffer der Branche */
async function bankHero(
  admin: SupabaseClient,
  brancheKey: string
): Promise<{ id: string; url: string } | null> {
  for (const nurApproved of [true, false]) {
    let q = admin
      .from('asset_bank')
      .select('id, storage_path')
      .contains('branchen', [brancheKey])
      .eq('szene_typ', 'hero')
      .order('created_at', { ascending: false })
      .limit(1)
    if (nurApproved) q = q.eq('quality_status', 'approved')
    const { data } = await q
    const row = data?.[0]
    if (row) return { id: row.id, url: publicUrl(admin, row.storage_path) }
  }
  return null
}

/** Bank-Fallback Signature-Paar: nachher + vorher mit gemeinsamer pair_id */
async function bankPaar(
  admin: SupabaseClient,
  brancheKey: string
): Promise<{ pairId: string; ids: string[]; nachherUrl: string; vorherUrl: string } | null> {
  for (const nurApproved of [true, false]) {
    let q = admin
      .from('asset_bank')
      .select('id, storage_path, pair_id')
      .contains('branchen', [brancheKey])
      .eq('szene_typ', 'nachher')
      .not('pair_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5)
    if (nurApproved) q = q.eq('quality_status', 'approved')
    const { data } = await q
    for (const nachher of data ?? []) {
      const { data: vorherRows } = await admin
        .from('asset_bank')
        .select('id, storage_path')
        .eq('pair_id', nachher.pair_id)
        .eq('szene_typ', 'vorher')
        .limit(1)
      const vorher = vorherRows?.[0]
      if (vorher) {
        return {
          pairId: nachher.pair_id,
          ids: [nachher.id, vorher.id],
          nachherUrl: publicUrl(admin, nachher.storage_path),
          vorherUrl: publicUrl(admin, vorher.storage_path),
        }
      }
    }
  }
  return null
}

/**
 * Baut die personalisierte Flagship-Demo-Config aus einer approved
 * Branchen-Vorlage. Wirft nur, wenn die Vorlage fehlt oder nicht
 * freigegeben ist — Asset-Probleme werden zu Warnungen (BF §2.3).
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
    paare.push([config.meta.ort, prospect.ort])
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
    // Hero nur generieren wenn noch nicht vorhanden
    if (!config.inhalte.hero.media.datei) {
      let heroPrompt: string
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

      try {
        const hero = await generiereAsset({
          prompt: heroPrompt,
          aspect: '16:9',
          branche: brancheKey,
          szeneTyp: 'hero',
          quelleOverride: 'demo_generiert',
          kontext,
        })
        kostenCent += hero.kostenCent
        config.inhalte.hero.media.datei = hero.publicUrl
        assetMeta.hero = { id: hero.id, quelle: 'frisch' }

        // Video-Hero (optional, Fehler = Warning)
        try {
          let videoPrompt: string
          if (styleProfil?.style_prompts) {
            videoPrompt = baueVideoPrompt(styleProfil)
          } else {
            const heroLabel = config.inhalte.hero.media.label || config.inhalte.hero.eyebrow
            const brancheName = row.name || brancheKey
            const branchenBewegung = VIDEO_PROMPTS[brancheKey] || `Subtle ambient motion fitting for ${brancheName}: light reflections shifting on surfaces, gentle material movement, dust particles in light.`
            videoPrompt = [
              `Cinematic 4K, completely static tripod camera, zero camera movement.`,
              `Close-up scene: ${heroLabel}. ${brancheName} environment.`,
              branchenBewegung,
              `Seamless 5-second loop, calm and premium. No face visible, no person looking at camera. No text, no logos.`,
            ].join(' ')
          }
          const video = await generiereVideo({
            imageUrl: hero.publicUrl,
            prompt: videoPrompt,
            durationSeconds: 6,
            kontext: `video:${kontext}`,
          })
          if (video.videoUrl) {
            kostenCent += video.kostenCent
            config.inhalte.hero.video = { src: video.videoUrl, poster: hero.publicUrl }
            assetMeta.video = { job_id: video.jobId, quelle: 'frisch' }
          }
        } catch (e) {
          warnungen.push(`Video-Hero fehlgeschlagen (Bild-Hero bleibt): ${(e as Error).message}`)
        }
      } catch (e) {
        warnungen.push(`Hero-Generierung Durchlauf ${durchlauf} fehlgeschlagen: ${(e as Error).message}`)
      }
    }

    // Signature-Paar nur generieren wenn noch nicht vorhanden
    if (!config.inhalte.signature.nachher.datei || !config.inhalte.signature.vorher.datei) {
      let nachherPrompt: string
      let vorherPrompt: string
      if (styleProfil?.style_prompts) {
        nachherPrompt = baueAssetPrompt(styleProfil, styleProfil.style_prompts.szenen.signature_nachher)
        vorherPrompt = styleProfil.style_prompts.szenen.signature_vorher
      } else {
        const nachherLabel = config.inhalte.signature.nachher.label || config.inhalte.signature.tag_nachher
        const vorherLabel = config.inhalte.signature.vorher.label || config.inhalte.signature.tag_vorher
        const brancheName = row.name || brancheKey
        const sigCap = config.inhalte.signature.cap || ''
        nachherPrompt = [
          `${nachherLabel}. ${sigCap || brancheName}.`,
          `The space/result is IMMACULATE — gleaming surfaces, well-maintained, inviting. The satisfying outcome of professional work.`,
          `Bright natural daylight, warm atmosphere, sharp details showing quality.`,
          `Eye-level perspective, 16:9 wide format.`,
          `Photorealistic photography, shallow depth of field. No people, no text, no logos.`,
        ].join(' ')
        vorherPrompt = [
          `Edit this exact scene, keep the IDENTICAL room, furniture, objects, windows, camera angle and perspective unchanged.`,
          `Only change: ${vorherLabel}. Cover surfaces in dust, grime, stains. Dull and unmaintained state.`,
          `Muted desaturated colors, flat unflattering light. Dramatic but realistic contrast to the clean version.`,
          `Same exact composition and framing — only the cleanliness/condition changes. No text, no logos.`,
        ].join(' ')
      }

      try {
        const paar = await makePair({
          branche: brancheKey,
          nachherPrompt,
          vorherPrompt,
          aspect: '16:9',
          quelleOverride: 'demo_generiert',
          kontext,
        })
        kostenCent += paar.nachher.kostenCent + paar.vorher.kostenCent
        config.inhalte.signature.nachher.datei = paar.nachher.publicUrl
        config.inhalte.signature.vorher.datei = paar.vorher.publicUrl
        assetMeta.paar = { pair_id: paar.pairId, asset_ids: [paar.nachher.id, paar.vorher.id], quelle: 'frisch' }
      } catch (e) {
        warnungen.push(`Signature-Paar Durchlauf ${durchlauf} fehlgeschlagen: ${(e as Error).message}`)
      }
    }

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
    for (let i = 0; i < config.inhalte.ergebnisse.paare.length; i++) {
      const paarDef = config.inhalte.ergebnisse.paare[i]
      if (paarDef.nachher.datei && paarDef.vorher.datei) continue

      for (let durchlauf = 1; durchlauf <= MAX_ASSET_DURCHLAEUFE; durchlauf++) {
        try {
          const nachherLabel = paarDef.nachher.label || paarDef.caption
          const vorherLabel = paarDef.vorher.label || paarDef.caption
          const brName = row.name || brancheKey
          const ergebnisPaar = await makePair({
            branche: brancheKey,
            nachherPrompt: [
              `${nachherLabel}. ${brName}.`,
              `Immaculate, clean, well-maintained result of professional work.`,
              `Bright natural lighting, sharp details. 16:9 format.`,
              `Photorealistic photography, shallow depth of field. No people, no text, no logos.`,
            ].join(' '),
            vorherPrompt: [
              `Edit this exact scene, keep IDENTICAL room, objects, camera angle unchanged.`,
              `Only change: ${vorherLabel}. Dirty, dusty, neglected, worn state. Muted colors, flat light.`,
              `Same composition — only the condition changes. No text, no logos.`,
            ].join(' '),
            aspect: '16:9',
            quelleOverride: 'demo_generiert',
            kontext: `${kontext}:ergebnis-${i}`,
          })
          kostenCent += ergebnisPaar.nachher.kostenCent + ergebnisPaar.vorher.kostenCent
          paarDef.nachher.datei = ergebnisPaar.nachher.publicUrl
          paarDef.vorher.datei = ergebnisPaar.vorher.publicUrl
          break
        } catch (e) {
          warnungen.push(`Ergebnis-Paar ${i + 1} Durchlauf ${durchlauf} fehlgeschlagen: ${(e as Error).message}`)
          if (durchlauf >= MAX_ASSET_DURCHLAEUFE) {
            // Kein throw hier — Validierung am Ende fängt es
          }
        }
      }
    }
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

  return { config, kostenCent, assetMeta, warnungen }
}
