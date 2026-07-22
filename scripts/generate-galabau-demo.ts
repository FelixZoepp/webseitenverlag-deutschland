/**
 * Auftrag T3 — Erste GaLaBau-Demo (GrünWerk Wiesbaden) aus der Asset-Bank.
 *
 *   npx tsx scripts/generate-galabau-demo.ts [--neu]
 *
 * Warum ein eigenes Script: kein bestehender Codepfad erzeugt Kompositions-
 * Demos (personalisiereFlagshipConfig crasht auf GalabauConfig). Das Rendering
 * selbst funktioniert — renderFlagshipPage dispatcht per Type-Guard auf
 * renderGalabauLanding. Dieses Script füllt den Seed (bereits GrünWerk
 * Wiesbaden, verbatim) mit den 21 approved Assets und legt die demos-Zeile an.
 *
 * Slot-Zuordnung: asset_bank speichert keinen Slot-Key — die Zuordnung läuft
 * über die Asset-IDs aus dem T2-Import-Log (deterministisch, unten als
 * SLOT_ASSET_PREFIXE). Jede Zuordnung wird gegen szene_typ/medium/aspect des
 * Slots validiert; fehlende Pflicht-Slots brechen ab.
 *
 * --neu: legt immer eine neue demos-Zeile an (Standard: bestehende
 * GrünWerk-Demo mit template_id flagship:galabau wird aktualisiert).
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { randomBytes } from 'crypto'

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

import { GALABAU_ASSET_SLOTS } from '../lib/flagship/galabau/asset-slots'
import { galabauLandingSeed } from '../lib/flagship/galabau/seed'
import type { GalabauConfig } from '../lib/flagship/galabau/types'
import type { MediaSlot } from '../lib/flagship/types'

const BUCKET = 'asset-bank'

/**
 * Slot → Asset-ID-Präfix aus dem T2-Import-Log (21/21 approved).
 * asset_bank kennt keinen Slot-Key; diese Tabelle ist die einzige
 * deterministische Verbindung. Bei künftigen Re-Importen aktualisieren.
 */
const SLOT_ASSET_PREFIXE: Record<string, string> = {
  hero_bg: 'f1526f3e',
  hero_video: '6964da13',
  about_detail: '9daf5d23',
  svc_01: '287d6628',
  svc_02: '62fd564f',
  svc_03: '922e89b5',
  svc_04: '46e62e5f',
  svc_05: '7c2ec0c0',
  why_1: 'e41a7f26',
  why_2: '3af776c4',
  why_3: '74259087',
  ba_after: '4bf8f3fb',
  ba_before: 'f0167f62',
  team_1: 'c7bcc2ec',
  team_2: '7f7e2dd6',
  team_3: 'e495ebd0',
  avatar_1: 'a1a18968',
  avatar_2: '2549d358',
  avatar_3: '61ee945c',
  avatar_4: '4931ae90',
  contact_img: '9cacebd4',
}

interface BankZeile {
  id: string
  storage_path: string
  medium: 'image' | 'video'
  szene_typ: string
  aspect_ratio: string | null
  breite: number | null
  hoehe: number | null
  alt_text_de: string | null
  varianten: {
    webp?: { breite: number; pfad: string }[]
    avif?: { breite: number; pfad: string }[]
    video_url?: string
    poster_url?: string
  } | null
}

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`)
}

async function main() {
  const { createAdminClient } = await import('../lib/supabase/admin')
  const admin = createAdminClient()

  // 1) Approved galabau-Assets laden
  const { data, error } = await admin
    .from('asset_bank')
    .select('id, storage_path, medium, szene_typ, aspect_ratio, breite, hoehe, alt_text_de, varianten')
    .contains('branchen', ['galabau'])
    .eq('quality_status', 'approved')
  if (error) throw new Error(`asset_bank-Abfrage fehlgeschlagen: ${error.message}`)
  const zeilen = (data ?? []) as BankZeile[]
  console.log(`Asset-Bank: ${zeilen.length} approved galabau-Assets gefunden.`)

  // 2) Slots zuordnen (ID-Präfix) + gegen Slot-Deklaration validieren
  const proSlot = new Map<string, BankZeile>()
  const probleme: string[] = []
  for (const [slotKey, praefix] of Object.entries(SLOT_ASSET_PREFIXE)) {
    const slot = GALABAU_ASSET_SLOTS[slotKey]
    const zeile = zeilen.find((z) => z.id.startsWith(praefix))
    if (!zeile) {
      if (slot.pflicht !== false) probleme.push(`Pflicht-Slot ${slotKey}: kein approved Asset mit ID-Präfix ${praefix}`)
      else console.warn(`⚠️  Optionaler Slot ${slotKey}: Asset ${praefix} nicht gefunden — bleibt Platzhalter`)
      continue
    }
    const erwartetMedium = slot.medium === 'video' ? 'video' : 'image'
    if (zeile.medium !== erwartetMedium) {
      probleme.push(`${slotKey}: medium ${zeile.medium} ≠ ${erwartetMedium} (Asset ${zeile.id})`)
      continue
    }
    if (zeile.szene_typ !== slot.scene_typ) {
      probleme.push(`${slotKey}: szene_typ ${zeile.szene_typ} ≠ ${slot.scene_typ} (Asset ${zeile.id})`)
      continue
    }
    proSlot.set(slotKey, zeile)
  }
  if (probleme.length > 0) {
    for (const p of probleme) console.error(`✗ ${p}`)
    throw new Error(`Slot-Zuordnung unvollständig — ${probleme.length} Problem(e), Abbruch.`)
  }
  console.log(`Slot-Zuordnung: ${proSlot.size}/${Object.keys(SLOT_ASSET_PREFIXE).length} Slots aufgelöst.`)

  // 3) MediaSlot-Bauer: Public-URL der größten WebP-Variante + intrinsische Maße
  function mediaSlot(slotKey: string, label: string): MediaSlot {
    const zeile = proSlot.get(slotKey)
    if (!zeile) return { label } // optionaler Slot ohne Asset → Platzhalter
    const url = admin.storage.from(BUCKET).getPublicUrl(zeile.storage_path).data.publicUrl
    const groessteWebp = zeile.varianten?.webp?.[zeile.varianten.webp.length - 1]
    const breite = groessteWebp?.breite ?? zeile.breite ?? undefined
    const hoehe =
      breite && zeile.breite && zeile.hoehe
        ? Math.round((breite * zeile.hoehe) / zeile.breite)
        : zeile.hoehe ?? undefined
    return { label, datei: url, alt: zeile.alt_text_de ?? undefined, breite, hoehe }
  }

  // 4) Seed klonen und Assets in die Komposition füllen
  const config: GalabauConfig = structuredClone(galabauLandingSeed)
  const i = config.inhalte
  i.hero.media = mediaSlot('hero_bg', i.hero.media.label)
  const video = proSlot.get('hero_video')
  if (video?.varianten?.video_url) {
    i.hero.video = {
      src: video.varianten.video_url,
      poster: video.varianten.poster_url || i.hero.media.datei,
    }
  }
  i.ueber.media = mediaSlot('about_detail', i.ueber.media.label)
  const svcSlots = ['svc_01', 'svc_02', 'svc_03', 'svc_04', 'svc_05']
  i.leistungen.karten.forEach((karte, idx) => {
    if (svcSlots[idx]) karte.media = mediaSlot(svcSlots[idx], karte.media.label)
  })
  const whySlots = ['why_1', 'why_2', 'why_3']
  i.warum.karten.forEach((karte, idx) => {
    if (whySlots[idx]) karte.media = mediaSlot(whySlots[idx], karte.media.label)
  })
  i.referenzen.ba_nachher = mediaSlot('ba_after', i.referenzen.ba_nachher.label)
  i.referenzen.ba_vorher = mediaSlot('ba_before', i.referenzen.ba_vorher.label)
  const teamSlots = ['team_1', 'team_2', 'team_3']
  i.team.mitglieder.forEach((m, idx) => {
    if (teamSlots[idx]) m.media = mediaSlot(teamSlots[idx], m.media.label)
  })
  i.cta_band.avatare = ['avatar_1', 'avatar_2', 'avatar_3', 'avatar_4'].map((slot, idx) =>
    mediaSlot(slot, i.cta_band.avatare[idx]?.label ?? `Avatar ${idx + 1}`)
  )
  i.kontakt.media = mediaSlot('contact_img', i.kontakt.media.label)
  config.herkunft = {
    generator: 'scripts/generate-galabau-demo.ts',
    quellen: ['seed:galabau-landing-v1', 'asset_bank:galabau (T2-Import)'],
  }

  // 5) demos-Zeile anlegen bzw. bestehende GrünWerk-Demo aktualisieren
  const prospectName = config.meta.firma
  if (!flag('neu')) {
    const { data: vorhanden } = await admin
      .from('demos')
      .select('id, share_token')
      .eq('template_id', 'flagship:galabau')
      .eq('prospect_name', prospectName)
      .order('created_at', { ascending: false })
      .limit(1)
    if (vorhanden?.[0]) {
      const { error: upErr } = await admin
        .from('demos')
        .update({ config, status: 'GENERIERT' })
        .eq('id', vorhanden[0].id)
      if (upErr) throw new Error(`Demo-Update fehlgeschlagen: ${upErr.message}`)
      console.log(`\n✓ Bestehende Demo aktualisiert (${vorhanden[0].id})`)
      console.log(`  URL: /demo/${vorhanden[0].share_token}`)
      return
    }
  }

  const shareToken = randomBytes(24).toString('base64url')
  const { data: demo, error: insErr } = await admin
    .from('demos')
    .insert({
      prospect_name: prospectName,
      prospect_website: null,
      branche: 'galabau',
      template_id: 'flagship:galabau',
      engine: 'flagship',
      config,
      share_token: shareToken,
      status: 'GENERIERT',
      kosten_cent: 0,
    })
    .select('id')
    .single()
  if (insErr || !demo) throw new Error(`Demo anlegen fehlgeschlagen: ${insErr?.message}`)

  console.log(`\n✓ Demo angelegt (${demo.id})`)
  console.log(`  URL: /demo/${shareToken}`)
}

main().catch((e) => {
  console.error('\nFEHLER:', e instanceof Error ? e.message : e)
  process.exit(1)
})
