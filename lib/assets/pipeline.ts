/**
 * F1 Branchen-Fabrik — Download-/Konvertier-Pipeline + makePair() (BF §2)
 *
 * Ablauf je Asset: Provider-Job → Bild sofort herunterladen → sharp
 * konvertiert zu WebP + AVIF in srcset-Größen → Upload in den eigenen
 * Storage-Bucket `asset-bank` → asset_bank-Eintrag mit gen_prompt,
 * gen_seed, kosten_cent, quelle → Kosten-Log (nutzungs_events).
 *
 * Leitplanken: GENERATION_KILL_SWITCH stoppt alles, Tages-Budget
 * (ASSET_BUDGET_TAG_CENT, Default 500 = 5 €/Tag) wird VOR jedem Call
 * geprüft, Provider-Kette Higgsfield → fal.ai → Mock als Fallback.
 *
 * makePair()-Regel (BF §2.2): IMMER Ziel (nachher) zuerst generieren,
 * dann per Edit (referenceJobId) die Degradation (vorher) derselben
 * Szene — die Gegenrichtung ist unzuverlässig. Gemeinsame pair_id.
 */

import { randomUUID } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { generierungGesperrt } from '@/lib/monitoring'
import { erfasseNutzung } from '@/lib/nutzung'
import {
  getAssetProviderKette,
  type AssetAspect,
  type AssetProvider,
  type GeneratedImage,
} from './higgsfield'

const BUCKET = 'asset-bank'
/** srcset-Stufen (Breite in px) — größte Stufe = storage_path/Hauptdatei */
const SRCSET_BREITEN = [480, 960, 1600]

export type SzeneTyp = 'hero' | 'vorher' | 'nachher' | 'detail' | 'team' | 'galerie'

export interface AssetGenerierung {
  prompt: string
  aspect: AssetAspect
  branche: string
  szeneTyp: SzeneTyp
  styleTags?: string[]
  pairId?: string
  referenceJobId?: string
  /** 'demo_generiert' für frische Demo-Assets (BF §2.3), sonst Provider-Quelle */
  quelleOverride?: 'demo_generiert'
  kontext?: string
}

export interface BankAsset {
  id: string
  storagePath: string
  publicUrl: string
  provider: AssetProvider['name']
  jobId: string
  seed?: string
  kostenCent: number
  breite: number
  hoehe: number
  varianten: { webp: VarianteDatei[]; avif: VarianteDatei[] }
}

interface VarianteDatei {
  breite: number
  pfad: string
}

function budgetTagCent(): number {
  return Number(process.env.ASSET_BUDGET_TAG_CENT ?? 500)
}

/** Summe der heutigen Asset-Kosten (Cent) aus nutzungs_events. Best effort. */
async function heutigeAssetKostenCent(admin: SupabaseClient): Promise<number> {
  const tagesStart = new Date()
  tagesStart.setHours(0, 0, 0, 0)
  const { data, error } = await admin
    .from('nutzungs_events')
    .select('kosten_cent')
    .eq('typ', 'asset_generierung')
    .gte('created_at', tagesStart.toISOString())
  if (error) {
    console.warn('[assets] Budget-Abfrage fehlgeschlagen:', error.message)
    return 0
  }
  return (data ?? []).reduce((s, z) => s + (z.kosten_cent ?? 0), 0)
}

/** Lädt das Provider-Bild (CDN- oder data:-URL) als Buffer. */
async function ladeBild(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Bild-Download fehlgeschlagen (${res.status})`)
  return Buffer.from(await res.arrayBuffer())
}

/**
 * Konvertiert zu WebP + AVIF in srcset-Größen und lädt alles in den
 * Bucket `asset-bank` hoch. Rückgabe: Hauptpfad + Variantenliste + Maße.
 */
async function konvertiereUndSpeichere(
  admin: SupabaseClient,
  original: Buffer,
  basisPfad: string
): Promise<{
  storagePath: string
  breite: number
  hoehe: number
  varianten: { webp: VarianteDatei[]; avif: VarianteDatei[] }
}> {
  const { default: sharp } = await import('sharp')
  const meta = await sharp(original).metadata()
  const originalBreite = meta.width ?? SRCSET_BREITEN[SRCSET_BREITEN.length - 1]
  const originalHoehe = meta.height ?? 0

  // Nur Stufen ≤ Originalbreite; mindestens die größte verfügbare
  const breiten = SRCSET_BREITEN.filter((b) => b <= originalBreite)
  if (breiten.length === 0) breiten.push(originalBreite)

  const varianten: { webp: VarianteDatei[]; avif: VarianteDatei[] } = { webp: [], avif: [] }

  for (const breite of breiten) {
    const skaliert = sharp(original).resize({ width: breite, withoutEnlargement: true })
    const [webp, avif] = await Promise.all([
      skaliert.clone().webp({ quality: 82 }).toBuffer(),
      skaliert.clone().avif({ quality: 55 }).toBuffer(),
    ])
    for (const [format, buf, contentType] of [
      ['webp', webp, 'image/webp'],
      ['avif', avif, 'image/avif'],
    ] as const) {
      const pfad = `${basisPfad}/${breite}.${format}`
      const { error } = await admin.storage
        .from(BUCKET)
        .upload(pfad, buf, { contentType, upsert: true })
      if (error) throw new Error(`Storage-Upload fehlgeschlagen (${pfad}): ${error.message}`)
      varianten[format].push({ breite, pfad })
    }
  }

  const groessteWebp = varianten.webp[varianten.webp.length - 1]
  return {
    storagePath: groessteWebp.pfad,
    breite: originalBreite,
    hoehe: originalHoehe,
    varianten,
  }
}

/**
 * Erzeugt EIN Asset: Provider-Kette durchprobieren → Download →
 * Konvertierung → Storage → asset_bank-Eintrag → Kosten-Log.
 */
export async function generiereAsset(
  o: AssetGenerierung,
  vorgabe?: { providers?: AssetProvider[]; admin?: SupabaseClient }
): Promise<BankAsset> {
  if (generierungGesperrt()) {
    throw new Error('GENERATION_KILL_SWITCH aktiv — Asset-Generierung gestoppt')
  }

  const admin = vorgabe?.admin ?? createAdminClient()
  const bisher = await heutigeAssetKostenCent(admin)
  if (bisher >= budgetTagCent()) {
    throw new Error(
      `Tages-Budget erreicht (${bisher}/${budgetTagCent()} Cent) — keine weitere Generierung heute`
    )
  }

  // Provider-Kette: erster Erfolg gewinnt (Higgsfield → fal → Mock)
  const kette = vorgabe?.providers ?? getAssetProviderKette()
  let bild: GeneratedImage | null = null
  let provider: AssetProvider | null = null
  let letzterFehler: unknown = null
  for (const p of kette) {
    try {
      bild = await p.generateImage({
        prompt: o.prompt,
        aspect: o.aspect,
        referenceJobId: o.referenceJobId,
      })
      provider = p
      break
    } catch (e) {
      letzterFehler = e
      console.warn(`[assets] Provider ${p.name} fehlgeschlagen:`, (e as Error).message)
    }
  }
  if (!bild || !provider) {
    throw new Error(
      `Alle Asset-Provider fehlgeschlagen: ${letzterFehler instanceof Error ? letzterFehler.message : letzterFehler}`
    )
  }

  // Sofort ins eigene Storage — Provider-URLs landen nie im Kundenoutput
  const original = await ladeBild(bild.url)
  const assetId = randomUUID()
  const monat = new Date().toISOString().slice(0, 7) // yyyy-mm
  const basisPfad = `${o.branche}/${monat}/${assetId}`
  const gespeichert = await konvertiereUndSpeichere(admin, original, basisPfad)

  const { error: insertFehler } = await admin.from('asset_bank').insert({
    id: assetId,
    storage_path: gespeichert.storagePath,
    medium: 'image',
    branchen: [o.branche],
    style_tags: o.styleTags ?? [],
    szene_typ: o.szeneTyp,
    pair_id: o.pairId ?? null,
    quelle: o.quelleOverride ?? provider.quelle,
    gen_prompt: o.prompt,
    gen_seed: bild.seed ?? null,
    gen_job_id: bild.jobId,
    kosten_cent: bild.costCents,
    varianten: gespeichert.varianten,
    breite: gespeichert.breite,
    hoehe: gespeichert.hoehe,
    quality_status: 'draft',
  })
  if (insertFehler) {
    throw new Error(`asset_bank-Insert fehlgeschlagen: ${insertFehler.message}`)
  }

  // Kosten-Log je Call (best effort, wirft nie)
  await erfasseNutzung('asset_generierung', {
    kostenCent: bild.costCents,
    kontext: o.kontext ?? `${provider.name}:${o.branche}:${o.szeneTyp}`,
  })

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(gespeichert.storagePath)
  return {
    id: assetId,
    storagePath: gespeichert.storagePath,
    publicUrl: pub.publicUrl,
    provider: provider.name,
    jobId: bild.jobId,
    seed: bild.seed,
    kostenCent: bild.costCents,
    breite: gespeichert.breite,
    hoehe: gespeichert.hoehe,
    varianten: gespeichert.varianten,
  }
}

export interface PaarGenerierung {
  branche: string
  /** Ziel-Szene (nachher) — wird IMMER zuerst generiert */
  nachherPrompt: string
  /** Degradations-Anweisung (vorher) — Edit derselben Szene */
  vorherPrompt: string
  aspect?: AssetAspect
  styleTags?: string[]
  quelleOverride?: 'demo_generiert'
  kontext?: string
}

export interface AssetPaar {
  pairId: string
  nachher: BankAsset
  vorher: BankAsset
}

/**
 * makePair() (BF §2.2): Ziel-Szene generieren → per Edit (referenceJobId)
 * die degradierte Gegen-Variante derselben Szene → beide mit gemeinsamer
 * pair_id in der Bank. WICHTIG: Beide Bilder müssen vom SELBEN Provider
 * kommen (der Edit referenziert den Job des ersten Bilds).
 */
export async function makePair(o: PaarGenerierung): Promise<AssetPaar> {
  const pairId = randomUUID()
  const aspect = o.aspect ?? '4:3'
  const admin = createAdminClient()
  const kette = getAssetProviderKette()

  // 1) Ziel (nachher) zuerst — Provider-Kette darf hier noch wechseln
  const nachher = await generiereAsset(
    {
      prompt: o.nachherPrompt,
      aspect,
      branche: o.branche,
      szeneTyp: 'nachher',
      styleTags: o.styleTags,
      pairId,
      quelleOverride: o.quelleOverride,
      kontext: o.kontext,
    },
    { providers: kette, admin }
  )

  // 2) Degradation (vorher) — NUR der Provider, der das Ziel erzeugt hat:
  //    referenceJobId ist providergebunden; dieselbe Kette-Instanz behält
  //    die Job-Ergebnisse im Speicher.
  const zielProvider = kette.find((p) => p.name === nachher.provider)
  const vorher = await generiereAsset(
    {
      prompt: o.vorherPrompt,
      aspect,
      branche: o.branche,
      szeneTyp: 'vorher',
      styleTags: o.styleTags,
      pairId,
      referenceJobId: nachher.jobId,
      quelleOverride: o.quelleOverride,
      kontext: o.kontext,
    },
    { providers: zielProvider ? [zielProvider] : kette, admin }
  )
  // Paar-Check-Minimum: Edit muss auf dem Ziel-Job basieren (gleiche Szene)
  if (vorher.provider !== nachher.provider) {
    console.warn(
      `[assets] Paar ${pairId}: vorher (${vorher.provider}) und nachher (${nachher.provider}) von verschiedenen Providern — Szene ggf. inkonsistent`
    )
  }

  return { pairId, nachher, vorher }
}
