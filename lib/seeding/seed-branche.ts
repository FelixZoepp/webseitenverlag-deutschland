/**
 * Branchen-Fabrik F3: Orchestrator — seedet EINE Branche (BF §4, manuell
 * angestoßen, kein Inngest-Trigger; das Auto-Seeding kommt in F4).
 *
 * Ablauf: Profil + Copy generieren (bzw. Flagship parametrisieren) →
 * Vorlage komponieren → Gates prüfen → Asset-Grundset in die Bank
 * (1 Hero + Signature-Paar + 6 Galerie, BF §4.4) → branchen_profile
 * als 'draft' upserten. Freigabe bleibt beim Menschen (BF §4.6).
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { metaKategorie } from '@/config/branchen'
import { FLAGSHIP_SEEDS } from '@/lib/flagship/seeds'
import { generiereAsset, generiereVideo, makePair } from '@/lib/assets/pipeline'
import type { FlagshipConfig } from '@/lib/flagship/types'
import type { BranchenProfil } from './schema'
import type { StartBranche } from './branchen-start'
import { generiereBranchenSeed } from './generiere-profil'
import { komponiereVorlage } from './komponiere-vorlage'
import { pruefeGates } from './gates'

export interface SeedAssets {
  hero_id: string
  hero_video_url?: string
  hero_poster_url?: string
  paar_id: string
  paar_asset_ids: string[]
  galerie_ids: string[]
}

export interface SeedErgebnis {
  branche_key: string
  status: 'ok' | 'fehler'
  quelle: 'flagship' | 'claude'
  gates: string[]
  assets?: SeedAssets
  asset_warnung?: string
  fehler?: string
}

/**
 * Higgsfield-Prompt aus dem Style-Baukasten zusammensetzen (Asset-Rezeptur §2).
 * Prompt-Anatomie: [SUBJEKT+HANDLUNG], [KOMPOSITION], [MILIEU], [LICHT], [KAMERA], [STIL-ANKER]
 * DSGVO-Kernregel: die Arbeit zeigen, nicht die Person — keine erkennbaren Gesichter.
 */
export function baueAssetPrompt(profil: BranchenProfil, szene: string): string {
  const s = profil.style_prompts
  const teile = [
    szene,
    s.basis_stil,
    `Lighting: ${s.licht}`,
    `Materials: ${s.materialien}`,
    // DSGVO: keine erkennbaren Gesichter/Personen
    'Close-up on the craft and result, hands and tools only, no face visible, cropped above shoulders',
    'Photorealistic photography, shallow depth of field',
  ]
  if (!s.personen_erlaubt) teile.push('no people at all')
  if (s.negativ) teile.push(`Avoid: ${s.negativ}`)
  teile.push('No text, no logos, no watermarks')
  return teile.join('. ')
}

/**
 * Video-Prompt für den Hero-Header: statische Kamera, subtile Bewegung,
 * hochwertige Close-Up-Ästhetik (Higgsfield image-to-video Guideline).
 */
export function baueVideoPrompt(profil: BranchenProfil): string {
  const s = profil.style_prompts
  const teile = [
    // Kamera-Anweisung: IMMER statisch, cinematic quality
    'Cinematic 4K quality, completely static camera, no camera movement whatsoever, fixed tripod shot',
    // Close-Up-Ästhetik
    'Shallow depth of field, professional close-up composition, rich detail and texture',
    // Branchenspezifische Mikrobewegung aus dem Profil
    s.video_bewegung,
    // Licht + Material für Konsistenz mit dem Standbild
    `Lighting: ${s.licht}`,
    // Loop + Qualitäts-Regeln
    'Seamless loop feeling, subtle natural motion only, no abrupt changes',
    'No text, no logos, no UI elements, no people looking at camera or speaking',
  ]
  return teile.join('. ')
}

/** Asset-Grundset: 1 Hero + 1 Signature-Paar + 6 Galerie → Bank (draft) */
async function generiereAssetGrundset(branche: StartBranche, profil: BranchenProfil): Promise<SeedAssets> {
  const s = profil.style_prompts
  const kontext = `branchen-seeding:${branche.branche_key}`

  const [hero, paar, galerie] = await Promise.all([
    generiereAsset({
      prompt: baueAssetPrompt(profil, s.szenen.hero),
      aspect: '16:9',
      branche: branche.branche_key,
      szeneTyp: 'hero',
      kontext,
    }),
    makePair({
      branche: branche.branche_key,
      nachherPrompt: baueAssetPrompt(profil, s.szenen.signature_nachher),
      vorherPrompt: s.szenen.signature_vorher,
      aspect: '16:9',
      kontext,
    }),
    Promise.all(
      s.szenen.details.map((szene) =>
        generiereAsset({
          prompt: baueAssetPrompt(profil, szene),
          aspect: '4:3',
          branche: branche.branche_key,
          szeneTyp: 'galerie',
          kontext,
        })
      )
    ),
  ])

  // Video-Hero: Hero-Bild → Looping-Video (standardmäßig bei jedem Seeding)
  let heroVideoUrl: string | undefined
  let heroPosterUrl: string | undefined
  try {
    const video = await generiereVideo({
      imageUrl: hero.publicUrl,
      prompt: baueVideoPrompt(profil),
      durationSeconds: 6,
      kontext: `${kontext}:video`,
    })
    if (video.videoUrl) {
      heroVideoUrl = video.videoUrl
      heroPosterUrl = hero.publicUrl
    }
  } catch (e) {
    // Video scheitert nie am Seeding — Warnung, statischer Hero bleibt
    console.warn(`[seeding] Video-Hero fehlgeschlagen (${branche.branche_key}):`, (e as Error).message)
  }

  return {
    hero_id: hero.id,
    hero_video_url: heroVideoUrl,
    hero_poster_url: heroPosterUrl,
    paar_id: paar.pairId,
    paar_asset_ids: [paar.nachher.id, paar.vorher.id],
    galerie_ids: galerie.map((g) => g.id),
  }
}

export async function seedBranche(
  branche: StartBranche,
  opts: { mitAssets?: boolean } = {}
): Promise<SeedErgebnis> {
  const kategorie = metaKategorie(branche.meta_kategorie)
  if (!kategorie) {
    return { branche_key: branche.branche_key, status: 'fehler', quelle: 'claude', gates: [], fehler: `Unbekannte Meta-Kategorie "${branche.meta_kategorie}"` }
  }
  const admin = createAdminClient()

  // Freigabe-Feedback in den Prompt injizieren (BF §4.7): eigene Notes zuerst,
  // dazu die der Meta-Kategorie (Lern-Schleife auf Meta-Ebene gespiegelt)
  const { data: kategorieRows } = await admin
    .from('branchen_profile')
    .select('branche_key, guideline_notes')
    .eq('meta_kategorie', branche.meta_kategorie)
  const eigene = kategorieRows?.find((r) => r.branche_key === branche.branche_key)?.guideline_notes ?? []
  const geschwister = (kategorieRows ?? [])
    .filter((r) => r.branche_key !== branche.branche_key)
    .flatMap((r) => r.guideline_notes ?? [])
  const notes: string[] = Array.from(new Set([...eigene, ...geschwister]))

  let config: FlagshipConfig
  let profil: BranchenProfil | null = null
  const quelle: 'flagship' | 'claude' = branche.flagship ? 'flagship' : 'claude'

  try {
    if (branche.flagship) {
      // BF §3.2: 1:1-Parametrisierung der Flagship-Seeds — kein Claude-Call
      config = structuredClone(FLAGSHIP_SEEDS[branche.flagship])
      config.branche_key = branche.branche_key
      config.meta_kategorie = branche.meta_kategorie
      config.herkunft = { generator: 'flagship-parametrisierung' }
    } else {
      const seed = await generiereBranchenSeed(branche, notes)
      profil = seed.profil
      config = komponiereVorlage(branche, seed)
    }
  } catch (e) {
    return { branche_key: branche.branche_key, status: 'fehler', quelle, gates: [], fehler: (e as Error).message }
  }

  // Gates: bei Verstößen wird NICHT gespeichert — Mensch sieht die Liste
  const gates = pruefeGates(config)
  if (gates.length > 0) {
    return { branche_key: branche.branche_key, status: 'fehler', quelle, gates, fehler: `${gates.length} Gate-Verstöße` }
  }

  // Asset-Grundset (nur generierte Branchen; Flagships haben ihre Referenz-Slots)
  let assets: SeedAssets | undefined
  let assetWarnung: string | undefined
  if (profil && opts.mitAssets !== false) {
    try {
      assets = await generiereAssetGrundset(branche, profil)
    } catch (e) {
      // Seeding scheitert nie an Bildern (BF §2.3) — Warnung statt Abbruch
      assetWarnung = (e as Error).message
    }
  }

  // Video-URL in die Vorlage schreiben (Preview zeigt dann den Video-Header)
  if (assets?.hero_video_url) {
    config.inhalte.hero.video = {
      src: assets.hero_video_url,
      poster: assets.hero_poster_url,
    }
  }

  const { error } = await admin.from('branchen_profile').upsert(
    {
      branche_key: branche.branche_key,
      meta_kategorie: branche.meta_kategorie,
      name: branche.name,
      profil: {
        profil,
        vorlage: config,
        assets: assets ?? null,
        quelle,
        // Beschreibung mitspeichern: Regenerier-Runden (F4) brauchen die Def
        // auch für Branchen, die nicht in START_BRANCHEN stehen
        beschreibung: branche.beschreibung,
        gates_geprueft_am: new Date().toISOString(),
      },
      quality_status: 'draft',
      approved_at: null,
      approved_by: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'branche_key' }
  )
  if (error) {
    return { branche_key: branche.branche_key, status: 'fehler', quelle, gates, fehler: `Upsert fehlgeschlagen: ${error.message}` }
  }

  return { branche_key: branche.branche_key, status: 'ok', quelle, gates, assets, asset_warnung: assetWarnung }
}
