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
import { generiereAsset, makePair } from '@/lib/assets/pipeline'
import type { FlagshipConfig } from '@/lib/flagship/types'
import type { BranchenProfil } from './schema'
import type { StartBranche } from './branchen-start'
import { generiereBranchenSeed } from './generiere-profil'
import { komponiereVorlage } from './komponiere-vorlage'
import { pruefeGates } from './gates'

export interface SeedAssets {
  hero_id: string
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

/** Higgsfield-Prompt aus dem Style-Baukasten zusammensetzen (BF §2.3) — auch für F5-Demo-Assets */
export function baueAssetPrompt(profil: BranchenProfil, szene: string): string {
  const s = profil.style_prompts
  const teile = [s.basis_stil, szene, `Lighting: ${s.licht}`, `Materials: ${s.materialien}`]
  if (!s.personen_erlaubt) teile.push('no people')
  if (s.negativ) teile.push(`Avoid: ${s.negativ}`)
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
      aspect: '4:3',
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

  return {
    hero_id: hero.id,
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
