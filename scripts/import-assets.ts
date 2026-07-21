/**
 * Auftrag T2 — Asset-Import für die Template-Fabrik.
 *
 *   npx tsx scripts/import-assets.ts --branche galabau --dir ./assets/galabau [--approve] [--stub]
 *
 * Vertrag: rezepte/REZEPTE_GALABAU.md — Dateiname = Slot-ID mit Bindestrich
 * (hero-bg.jpg → hero_bg via slotKeyAusDateiname). Unbekannte Dateinamen
 * werden abgewiesen (kein Raten). ba_before/ba_after bekommen automatisch
 * dieselbe pair_id (nur wenn BEIDE vorliegen — halbe Paare werden importiert,
 * aber gewarnt und nie als Paar aufgelöst).
 *
 * Pipeline je Bild: sharp-Validierung (Aspect ±5 %, min_width) → WebP+AVIF
 * in srcset-Stufen (wie lib/assets/pipeline.ts) → Bucket `asset-bank` →
 * asset_bank-Zeile (quality_status='draft').
 *
 * Video (hero-video.mp4): ≤ 3 MB (config/video-guidelines.ts); größere
 * Dateien werden per ffmpeg transkodiert (falls installiert), sonst abgelehnt.
 * Poster = hero_bg (aus diesem Import oder aus der Bank).
 *
 * --approve: setzt importierte Assets direkt auf 'approved'.
 * --stub:    markiert ALLE Importe als STUB (quelle='ai_mock') — solche
 *            Assets sind NIE approvebar; --approve wird dann verweigert.
 * Ohne --stub: quelle='demo_generiert' (Higgsfield-Generierung lief extern).
 *
 * Fehlende Pflicht-Slots werden am Ende gemeldet (Fertig-Kriterium T2:
 * ≥ 25 approved inkl. BA-Paar, Hero, Video).
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, resolve } from 'path'
import { randomUUID } from 'crypto'
import { execFileSync } from 'child_process'
import { tmpdir } from 'os'

// .env.local laden (Scripts laufen außerhalb von Next.js)
const envPfad = join(process.cwd(), '.env.local')
if (existsSync(envPfad)) {
  for (const zeile of readFileSync(envPfad, 'utf8').split('\n')) {
    const m = zeile.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
}

import type { SupabaseClient } from '@supabase/supabase-js'
import { aspectZahl, type AssetSlot, type AssetSlots } from '../lib/assets/slots'
import {
  GALABAU_ASSET_SLOTS,
  slotKeyAusDateiname as galabauSlotKey,
} from '../lib/flagship/galabau/asset-slots'
import { altTextVorlage, stilFuerBranche } from '../config/asset-styles'
import { VIDEO_GUIDELINES } from '../config/video-guidelines'

// ------------------------------------------------------------
// Slot-Registry (Config over Hardcode): neue Branchen tragen hier
// ihre Slot-Deklaration + Dateinamen-Mapping ein (Template-Fabrik B2).
// ------------------------------------------------------------
export const SLOT_REGISTRY: Record<
  string,
  { slots: AssetSlots; slotKey: (dateiname: string) => string | null }
> = {
  galabau: { slots: GALABAU_ASSET_SLOTS, slotKey: galabauSlotKey },
}

const BUCKET = 'asset-bank'
const SRCSET_BREITEN = [480, 960, 1600]
const BILD_ENDUNGEN = /\.(jpe?g|png|webp|avif)$/i
const VIDEO_ENDUNGEN = /\.(mp4|webm)$/i
/** Aspect-Toleranz beim Import (±5 % wie kuerzeVerhaeltnis in lib/assets/aspekt.ts) */
const ASPECT_TOLERANZ = 0.05

export interface PlanEintrag {
  pfad: string
  name: string
  slotKey: string
  slot: AssetSlot
  medium: 'bild' | 'video'
  breite?: number
  hoehe?: number
  groesseBytes: number
  /** gesetzt, wenn BEIDE Paar-Hälften vorliegen */
  pairId?: string
  altText: string
  /** Video > 3 MB → muss vor Upload transkodiert werden */
  transkodierenNoetig?: boolean
}

export interface ImportPlan {
  branche: string
  eintraege: PlanEintrag[]
  abgelehnt: { name: string; grund: string }[]
  warnungen: string[]
  /** Pflicht-Slots, die dieser Import NICHT abdeckt */
  fehlendePflicht: string[]
}

function brancheName(branche: string): string {
  return branche.charAt(0).toUpperCase() + branche.slice(1).replace(/[_-]/g, ' ')
}

/**
 * Phase 1 (pur, ohne DB): Ordner lesen, Dateien auf Slots mappen,
 * mit sharp validieren, Paare koppeln, fehlende Pflicht-Slots ermitteln.
 */
export async function planeImport(branche: string, dir: string): Promise<ImportPlan> {
  const registry = SLOT_REGISTRY[branche]
  if (!registry) {
    throw new Error(
      `Unbekannte Branche "${branche}" — in SLOT_REGISTRY registrieren (bekannt: ${Object.keys(SLOT_REGISTRY).join(', ')})`
    )
  }
  const ordner = resolve(dir)
  if (!existsSync(ordner) || !statSync(ordner).isDirectory()) {
    throw new Error(`--dir "${dir}" ist kein Ordner`)
  }

  const { default: sharp } = await import('sharp')
  const name = brancheName(branche)
  const eintraege: PlanEintrag[] = []
  const abgelehnt: { name: string; grund: string }[] = []
  const warnungen: string[] = []
  const belegteSlots = new Set<string>()

  const dateien = readdirSync(ordner)
    .filter((d) => statSync(join(ordner, d)).isFile() && !d.startsWith('.'))
    .sort()

  for (const datei of dateien) {
    const pfad = join(ordner, datei)
    const slotKey = registry.slotKey(datei)
    if (!slotKey) {
      abgelehnt.push({ name: datei, grund: 'Dateiname entspricht keinem Slot (Vertrag: Slot-ID mit Bindestrich)' })
      continue
    }
    if (belegteSlots.has(slotKey)) {
      abgelehnt.push({ name: datei, grund: `Slot ${slotKey} bereits durch andere Datei belegt` })
      continue
    }
    const slot = registry.slots[slotKey]
    const groesseBytes = statSync(pfad).size

    if (slot.medium === 'video') {
      if (!VIDEO_ENDUNGEN.test(datei)) {
        abgelehnt.push({ name: datei, grund: `Slot ${slotKey} erwartet ein Video (mp4/webm)` })
        continue
      }
      const maxBytes = VIDEO_GUIDELINES.maxGroesseMb * 1024 * 1024
      eintraege.push({
        pfad,
        name: datei,
        slotKey,
        slot,
        medium: 'video',
        groesseBytes,
        altText: `Hero-Video (${name})`,
        transkodierenNoetig: groesseBytes > maxBytes,
      })
      belegteSlots.add(slotKey)
      continue
    }

    if (!BILD_ENDUNGEN.test(datei)) {
      abgelehnt.push({ name: datei, grund: `Slot ${slotKey} erwartet ein Bild (jpg/png/webp/avif)` })
      continue
    }

    let breite: number | undefined
    let hoehe: number | undefined
    try {
      const meta = await sharp(pfad).metadata()
      breite = meta.width
      hoehe = meta.height
    } catch (e) {
      abgelehnt.push({ name: datei, grund: `Bild nicht lesbar: ${e instanceof Error ? e.message : e}` })
      continue
    }
    if (!breite || !hoehe) {
      abgelehnt.push({ name: datei, grund: 'Bild ohne Maße (Metadaten unlesbar)' })
      continue
    }
    if (slot.min_width && breite < slot.min_width) {
      abgelehnt.push({ name: datei, grund: `Zu klein: ${breite}px < min_width ${slot.min_width}px (${slotKey})` })
      continue
    }
    const soll = aspectZahl(slot.aspect)
    if (soll && Math.abs(breite / hoehe - soll) / soll > ASPECT_TOLERANZ) {
      abgelehnt.push({
        name: datei,
        grund: `Aspect passt nicht: ${breite}×${hoehe} ≠ ${slot.aspect} (±${ASPECT_TOLERANZ * 100} %)`,
      })
      continue
    }

    eintraege.push({
      pfad,
      name: datei,
      slotKey,
      slot,
      medium: 'bild',
      breite,
      hoehe,
      groesseBytes,
      altText: altTextVorlage(name, slot.scene_typ),
    })
    belegteSlots.add(slotKey)
  }

  // Paar-Kopplung: vorher-Slot (pair_with) + Partner → gemeinsame pair_id,
  // aber NUR wenn beide Hälften im Import sind (halbe Paare → Warnung).
  for (const [key, slot] of Object.entries(registry.slots)) {
    if (!slot.pair_with) continue
    const vorher = eintraege.find((e) => e.slotKey === key)
    const nachher = eintraege.find((e) => e.slotKey === slot.pair_with)
    if (vorher && nachher) {
      const pairId = randomUUID()
      vorher.pairId = pairId
      nachher.pairId = pairId
    } else if (vorher || nachher) {
      warnungen.push(
        `Halbes Paar: ${vorher ? key : slot.pair_with} vorhanden, ${vorher ? slot.pair_with : key} fehlt — ` +
          'Import ohne pair_id (Paar-Slots bleiben unauflösbar, Partner nachliefern)'
      )
    }
  }

  const fehlendePflicht = Object.entries(registry.slots)
    .filter(([key, slot]) => slot.pflicht !== false && !belegteSlots.has(key))
    .map(([key]) => key)

  return { branche, eintraege, abgelehnt, warnungen, fehlendePflicht }
}

// ------------------------------------------------------------
// Phase 2: Ausführung (sharp-Konvertierung, Storage, asset_bank)
// ------------------------------------------------------------

export interface ImportErgebnis {
  importiert: { slotKey: string; assetId: string; status: string }[]
  fehler: { name: string; grund: string }[]
}

/** Video ggf. per ffmpeg auf ≤ 3 MB transkodieren (1280px, ohne Ton). */
function transkodiereVideo(pfad: string): Buffer {
  const ziel = join(tmpdir(), `wvd-video-${randomUUID()}.mp4`)
  try {
    execFileSync(
      'ffmpeg',
      ['-y', '-i', pfad, '-an', '-vf', 'scale=1280:-2', '-c:v', 'libx264', '-crf', '30',
       '-preset', 'slow', '-movflags', '+faststart', ziel],
      { stdio: 'pipe' }
    )
  } catch (e) {
    throw new Error(
      `ffmpeg-Transkodierung fehlgeschlagen oder ffmpeg nicht installiert: ${e instanceof Error ? e.message.slice(0, 200) : e}`
    )
  }
  const buf = readFileSync(ziel)
  const maxBytes = VIDEO_GUIDELINES.maxGroesseMb * 1024 * 1024
  if (buf.length > maxBytes) {
    throw new Error(`Video auch nach Transkodierung > ${VIDEO_GUIDELINES.maxGroesseMb} MB (${(buf.length / 1024 / 1024).toFixed(1)} MB)`)
  }
  return buf
}

export async function fuehreImportAus(
  plan: ImportPlan,
  opts: { admin: SupabaseClient; approve: boolean; stub: boolean }
): Promise<ImportErgebnis> {
  const { default: sharp } = await import('sharp')
  const { admin, stub } = opts
  const approve = opts.approve && !stub // STUB nie approvebar (Regel aus /admin/assets)
  const stil = stilFuerBranche(plan.branche)
  const monat = new Date().toISOString().slice(0, 7)
  const quelle = stub ? 'ai_mock' : 'demo_generiert'
  const importiert: ImportErgebnis['importiert'] = []
  const fehler: ImportErgebnis['fehler'] = []

  // Bilder zuerst (hero_bg liefert das Video-Poster), Videos danach
  const sortiert = [...plan.eintraege].sort((a, b) =>
    a.medium === b.medium ? 0 : a.medium === 'bild' ? -1 : 1
  )
  const publicUrls = new Map<string, string>()

  for (const e of sortiert) {
    try {
      const assetId = randomUUID()
      const basisPfad = `${plan.branche}/${monat}/${assetId}`

      if (e.medium === 'video') {
        const maxBytes = VIDEO_GUIDELINES.maxGroesseMb * 1024 * 1024
        const buf = e.transkodierenNoetig ? transkodiereVideo(e.pfad) : readFileSync(e.pfad)
        if (buf.length > maxBytes) throw new Error(`Video > ${VIDEO_GUIDELINES.maxGroesseMb} MB`)

        const videoPfad = `${basisPfad}/video.mp4`
        const { error: upErr } = await admin.storage
          .from(BUCKET)
          .upload(videoPfad, buf, { contentType: 'video/mp4', upsert: true })
        if (upErr) throw new Error(`Storage-Upload fehlgeschlagen: ${upErr.message}`)
        const videoUrl = admin.storage.from(BUCKET).getPublicUrl(videoPfad).data.publicUrl

        // Poster: hero_bg aus diesem Import, sonst approved Hero aus der Bank
        let posterUrl = publicUrls.get(e.slot.fallback ?? 'hero_bg') ?? ''
        if (!posterUrl) {
          const { data } = await admin
            .from('asset_bank')
            .select('storage_path')
            .eq('quality_status', 'approved')
            .contains('branchen', [plan.branche])
            .eq('szene_typ', 'hero')
            .eq('medium', 'image')
            .order('created_at', { ascending: false })
            .limit(1)
          if (data?.[0]) {
            posterUrl = admin.storage.from(BUCKET).getPublicUrl(data[0].storage_path).data.publicUrl
          }
        }

        const { error: insErr } = await admin.from('asset_bank').insert({
          id: assetId,
          storage_path: videoPfad,
          medium: 'video',
          branchen: [plan.branche],
          style_tags: stil.style_tags,
          szene_typ: e.slot.scene_typ,
          quelle,
          kosten_cent: 0,
          varianten: { video_url: videoUrl, poster_url: posterUrl, groesse_bytes: buf.length, ...(stub ? { stub: true } : {}) },
          aspect_ratio: e.slot.aspect,
          alt_text_de: e.altText,
          quality_status: approve ? 'approved' : 'draft',
        })
        if (insErr) throw new Error(`asset_bank-Insert fehlgeschlagen: ${insErr.message}`)
        importiert.push({ slotKey: e.slotKey, assetId, status: approve ? 'approved' : 'draft' })
        continue
      }

      // Bild: WebP+AVIF in srcset-Stufen (wie lib/assets/pipeline.ts)
      const original = readFileSync(e.pfad)
      const breiten = SRCSET_BREITEN.filter((b) => b <= (e.breite ?? 0))
      if (breiten.length === 0) breiten.push(e.breite ?? SRCSET_BREITEN[0])
      const varianten: { webp: { breite: number; pfad: string }[]; avif: { breite: number; pfad: string }[] } = {
        webp: [],
        avif: [],
      }
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
          const { error } = await admin.storage.from(BUCKET).upload(pfad, buf, { contentType, upsert: true })
          if (error) throw new Error(`Storage-Upload fehlgeschlagen (${pfad}): ${error.message}`)
          varianten[format].push({ breite, pfad })
        }
      }
      const hauptPfad = varianten.webp[varianten.webp.length - 1].pfad

      const { error: insErr } = await admin.from('asset_bank').insert({
        id: assetId,
        storage_path: hauptPfad,
        medium: 'image',
        branchen: [plan.branche],
        style_tags: stil.style_tags,
        szene_typ: e.slot.scene_typ,
        pair_id: e.pairId ?? null,
        quelle,
        kosten_cent: 0,
        varianten,
        breite: e.breite,
        hoehe: e.hoehe,
        aspect_ratio: e.slot.aspect,
        alt_text_de: e.altText,
        quality_status: approve ? 'approved' : 'draft',
      })
      if (insErr) throw new Error(`asset_bank-Insert fehlgeschlagen: ${insErr.message}`)

      publicUrls.set(e.slotKey, admin.storage.from(BUCKET).getPublicUrl(hauptPfad).data.publicUrl)
      importiert.push({ slotKey: e.slotKey, assetId, status: approve ? 'approved' : 'draft' })
    } catch (err) {
      fehler.push({ name: e.name, grund: err instanceof Error ? err.message : String(err) })
    }
  }

  return { importiert, fehler }
}

// ------------------------------------------------------------
// CLI
// ------------------------------------------------------------

function arg(name: string): string | null {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : null
}
function flag(name: string): boolean {
  return process.argv.includes(`--${name}`)
}

async function main() {
  const branche = arg('branche')
  const dir = arg('dir')
  const approve = flag('approve')
  const stub = flag('stub')
  if (!branche || !dir) {
    console.error('Nutzung: npx tsx scripts/import-assets.ts --branche galabau --dir <ordner> [--approve] [--stub]')
    process.exit(1)
  }

  console.log(`\n— Asset-Import: branche=${branche}, dir=${dir}${approve ? ', --approve' : ''}${stub ? ', --stub' : ''} —\n`)
  if (stub) {
    console.warn("⚠️  STUB-Modus: Importe werden als quelle='ai_mock' markiert und sind NIE approvebar.\n")
    if (approve) console.warn('⚠️  --approve wird im STUB-Modus ignoriert.\n')
  }

  const plan = await planeImport(branche, dir)

  for (const a of plan.abgelehnt) console.log(`✗ abgelehnt: ${a.name} — ${a.grund}`)
  for (const w of plan.warnungen) console.warn(`⚠️  ${w}`)
  console.log(
    `\nPlan: ${plan.eintraege.length} Datei(en) → Slots [${plan.eintraege.map((e) => e.slotKey).join(', ')}]`
  )

  if (plan.eintraege.length === 0) {
    console.error('\nNichts zu importieren — Abbruch.')
    process.exit(1)
  }

  const { createAdminClient } = await import('../lib/supabase/admin')
  const admin = createAdminClient()
  const ergebnis = await fuehreImportAus(plan, { admin, approve, stub })

  console.log('')
  for (const i of ergebnis.importiert) console.log(`✓ ${i.slotKey} → ${i.assetId} [${i.status}]`)
  for (const f of ergebnis.fehler) console.error(`✗ ${f.name}: ${f.grund}`)

  if (plan.fehlendePflicht.length > 0) {
    console.warn(`\n⚠️  Fehlende Pflicht-Slots (nicht in diesem Import): ${plan.fehlendePflicht.join(', ')}`)
  }
  console.log(
    `\nFertig: ${ergebnis.importiert.length} importiert, ${ergebnis.fehler.length} Fehler, ` +
      `${plan.abgelehnt.length} abgelehnt.` +
      (approve && !stub ? '' : '\nNächster Schritt: Freigabe in /admin/assets (STUB-Assets sind nicht approvebar).')
  )
  if (ergebnis.fehler.length > 0) process.exit(1)
}

const direktAufruf = process.argv[1]?.split('/').pop() === 'import-assets.ts'
if (direktAufruf) {
  main().catch((e) => {
    console.error('\nFEHLER:', e instanceof Error ? e.message : e)
    process.exit(1)
  })
}
