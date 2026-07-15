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
import type { FlagshipConfig } from '@/lib/flagship/types'
import type { ProspectData } from './prospect-data'

const BUCKET = 'asset-bank'
/** DoD-Grenze (BF §6): Kosten pro Demo in Cent */
const DEMO_KOSTEN_LIMIT_CENT = 150

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
  brancheKey: string
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

  // 1) Klonen + deterministische Personalisierung (kein Claude-Call)
  const config = structuredClone(vorlage)
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

  // 2) Schlüssel-Assets: frisch → Bank → CSS-Platzhalter (nie Abbruch)
  const warnungen: string[] = []
  const assetMeta: DemoAssetMeta = { fallback: [], warnungen }
  let kostenCent = 0
  const styleProfil = gespeichert?.profil
  const kontext = `demo:${brancheKey}:${prospect.firma}`

  if (styleProfil?.style_prompts) {
    const s = styleProfil.style_prompts
    const [heroErgebnis, paarErgebnis] = await Promise.allSettled([
      generiereAsset({
        prompt: baueAssetPrompt(styleProfil, s.szenen.hero),
        aspect: '16:9',
        branche: brancheKey,
        szeneTyp: 'hero',
        quelleOverride: 'demo_generiert',
        kontext,
      }),
      makePair({
        branche: brancheKey,
        nachherPrompt: baueAssetPrompt(styleProfil, s.szenen.signature_nachher),
        vorherPrompt: s.szenen.signature_vorher,
        aspect: '4:3',
        quelleOverride: 'demo_generiert',
        kontext,
      }),
    ])

    if (heroErgebnis.status === 'fulfilled') {
      const hero = heroErgebnis.value
      kostenCent += hero.kostenCent
      config.inhalte.hero.media.datei = hero.publicUrl
      assetMeta.hero = { id: hero.id, quelle: 'frisch' }

      // Video-Hero: Hero-Bild → Looping-Video (image-to-video via Higgsfield)
      try {
        const video = await generiereVideo({
          imageUrl: hero.publicUrl,
          prompt: baueVideoPrompt(styleProfil),
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
    } else {
      warnungen.push(`Hero-Generierung fehlgeschlagen: ${(heroErgebnis.reason as Error).message}`)
    }

    if (paarErgebnis.status === 'fulfilled') {
      const paar = paarErgebnis.value
      kostenCent += paar.nachher.kostenCent + paar.vorher.kostenCent
      config.inhalte.signature.nachher.datei = paar.nachher.publicUrl
      config.inhalte.signature.vorher.datei = paar.vorher.publicUrl
      assetMeta.paar = { pair_id: paar.pairId, asset_ids: [paar.nachher.id, paar.vorher.id], quelle: 'frisch' }
    } else {
      warnungen.push(`Signature-Paar fehlgeschlagen: ${(paarErgebnis.reason as Error).message}`)
    }
  } else {
    warnungen.push('Keine style_prompts im Profil (Flagship-Branche) — Bank-Fallback')
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

  if (kostenCent > DEMO_KOSTEN_LIMIT_CENT) {
    warnungen.push(
      `Demo-Kosten ${kostenCent} Cent über DoD-Grenze (${DEMO_KOSTEN_LIMIT_CENT} Cent)`
    )
  }

  return { config, kostenCent, assetMeta, warnungen }
}
