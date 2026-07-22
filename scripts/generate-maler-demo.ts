/**
 * Erste Maler-Demo (Voss Maler & Lackierer, Osnabrück) aus der Asset-Bank.
 *
 *   npx tsx scripts/generate-maler-demo.ts [--neu]
 *
 * Pendant zu generate-galabau-demo.ts für die Komposition „maler-landing-v1":
 * füllt den Seed mit den 27 approved Assets aus dem Import vom 2026-07-22
 * (rezepte/REZEPTE_MALER.md) und legt die demos-Zeile an.
 *
 * Slot-Zuordnung: asset_bank speichert keinen Slot-Key — die Zuordnung läuft
 * über die Asset-IDs aus dem Import-Log (deterministisch, unten als
 * SLOT_ASSET_PREFIXE). Jede Zuordnung wird gegen szene_typ/medium des Slots
 * validiert; fehlende Pflicht-Slots brechen ab.
 *
 * --neu: legt immer eine neue demos-Zeile an (Standard: bestehende
 * Voss-Demo mit template_id flagship:maler wird aktualisiert).
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

import { MALER_ASSET_SLOTS } from '../lib/flagship/maler/asset-slots'
import { malerLandingSeed } from '../lib/flagship/maler/seed'
import type { MalerConfig } from '../lib/flagship/maler/types'
import type { MediaSlot } from '../lib/flagship/types'

const BUCKET = 'asset-bank'

/**
 * Slot → Asset-ID-Präfix aus dem Import-Log 2026-07-22 (27/27 approved).
 * asset_bank kennt keinen Slot-Key; diese Tabelle ist die einzige
 * deterministische Verbindung. Bei künftigen Re-Importen aktualisieren.
 */
const SLOT_ASSET_PREFIXE: Record<string, string> = {
  hero_bg: 'b59e44d4',
  hero_video: 'ba2dadd4',
  about_detail: 'b3f27da8',
  svc_01: 'b5a49f01',
  svc_02: 'af1ccbcb',
  svc_03: '55e38abd',
  svc_04: '5b31128b',
  svc_05: 'c84cb1a5',
  why_1: '73ffb3d1',
  why_2: 'e5c1fdfd',
  why_3: 'b7a14376',
  ba_after: '2ce879bc',
  ba_before: '3ac59c5f',
  team_1: 'a648a49a',
  team_2: 'be89a936',
  team_3: '5963ecfd',
  avatar_1: '7d16196c',
  avatar_2: '8ede6d98',
  avatar_3: 'e32873d6',
  avatar_4: '5a11e809',
  contact_img: 'a06bc548',
  gal_01: '4067a9e6',
  gal_02: '9c07b479',
  gal_03: 'f8a8c6a3',
  gal_04: '5f47086d',
  gal_05: '7cf152d6',
  gal_06: '7c54b285',
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

  // 1) Approved maler-Assets laden
  const { data, error } = await admin
    .from('asset_bank')
    .select('id, storage_path, medium, szene_typ, aspect_ratio, breite, hoehe, alt_text_de, varianten')
    .contains('branchen', ['maler'])
    .eq('quality_status', 'approved')
  if (error) throw new Error(`asset_bank-Abfrage fehlgeschlagen: ${error.message}`)
  const zeilen = (data ?? []) as BankZeile[]
  console.log(`Asset-Bank: ${zeilen.length} approved maler-Assets gefunden.`)

  // 2) Slots zuordnen (ID-Präfix) + gegen Slot-Deklaration validieren
  const proSlot = new Map<string, BankZeile>()
  const probleme: string[] = []
  for (const [slotKey, praefix] of Object.entries(SLOT_ASSET_PREFIXE)) {
    const slot = MALER_ASSET_SLOTS[slotKey]
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
  const config: MalerConfig = structuredClone(malerLandingSeed)
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
  const galSlots = ['gal_01', 'gal_02', 'gal_03', 'gal_04', 'gal_05', 'gal_06']
  if (i.galerie) {
    i.galerie.bilder.forEach((bild, idx) => {
      if (galSlots[idx]) bild.media = mediaSlot(galSlots[idx], bild.media.label)
    })
  }
  config.herkunft = {
    generator: 'scripts/generate-maler-demo.ts',
    quellen: ['seed:maler-landing-v1', 'asset_bank:maler (Import 2026-07-22)'],
  }

  // 5) demos-Zeile anlegen bzw. bestehende Voss-Demo aktualisieren
  const prospectName = config.meta.firma
  if (!flag('neu')) {
    const { data: vorhanden } = await admin
      .from('demos')
      .select('id, share_token')
      .eq('template_id', 'flagship:maler')
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
      branche: 'maler',
      template_id: 'flagship:maler',
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
