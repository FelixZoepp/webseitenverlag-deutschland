/**
 * T2-Selbsttest für scripts/import-assets.ts — STUB-Fallback nach Auftrag:
 * 3 Stub-Bilder (sharp-generiert), Planungsphase (pur, ohne DB) wird komplett
 * geprüft; DB-Phase nur, wenn Supabase erreichbar UND asset_bank existiert
 * (Migrationen 013+ noch nicht ausgeführt → WARTELISTE).
 *
 *   npx tsx scripts/test-import-assets.ts
 */
import { mkdtempSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { planeImport, fuehreImportAus } from './import-assets'

let ok = 0
let fail = 0
function check(name: string, bedingung: boolean, detail?: string) {
  if (bedingung) {
    ok++
    console.log(`  ✓ ${name}`)
  } else {
    fail++
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

async function main() {
  const { default: sharp } = await import('sharp')
  const dir = mkdtempSync(join(tmpdir(), 'wvd-import-test-'))

  const gruen = { r: 63, g: 164, b: 99 }
  async function stubBild(name: string, breite: number, hoehe: number) {
    await sharp({ create: { width: breite, height: hoehe, channels: 3, background: gruen } })
      .jpeg({ quality: 70 })
      .toFile(join(dir, name))
  }

  // 3 gültige STUB-Bilder (Auftrag: Fallback-Test) + Ablehnungsfälle
  await stubBild('hero-bg.jpg', 1920, 1080)        // 16:9, min 1920 → ok
  await stubBild('ba-after.jpg', 1600, 1200)       // 4:3 → ok, Paar-Hälfte
  await stubBild('ba-before.jpg', 1600, 1200)      // 4:3 → ok, Paar-Hälfte
  await stubBild('foo.jpg', 1200, 900)             // unbekannter Slot → abgelehnt
  await stubBild('svc-01.jpg', 800, 600)           // < min_width 1200 → abgelehnt
  await stubBild('about-detail.jpg', 1600, 900)    // 16:9 statt 4:3 → abgelehnt

  console.log('\n— Test 1: planeImport (pur) —')
  const plan = await planeImport('galabau', dir)

  check('3 Einträge geplant', plan.eintraege.length === 3, `${plan.eintraege.length}`)
  const slots = plan.eintraege.map((e) => e.slotKey).sort()
  check('Slots hero_bg/ba_after/ba_before', JSON.stringify(slots) === JSON.stringify(['ba_after', 'ba_before', 'hero_bg']), slots.join(','))

  const vorher = plan.eintraege.find((e) => e.slotKey === 'ba_before')
  const nachher = plan.eintraege.find((e) => e.slotKey === 'ba_after')
  check('BA-Paar hat gemeinsame pair_id', !!vorher?.pairId && vorher.pairId === nachher?.pairId)
  check('hero_bg ohne pair_id', plan.eintraege.find((e) => e.slotKey === 'hero_bg')?.pairId === undefined)

  check('3 Ablehnungen', plan.abgelehnt.length === 3, JSON.stringify(plan.abgelehnt))
  check('foo.jpg abgelehnt (unbekannter Slot)', plan.abgelehnt.some((a) => a.name === 'foo.jpg' && a.grund.includes('keinem Slot')))
  check('svc-01.jpg abgelehnt (zu klein)', plan.abgelehnt.some((a) => a.name === 'svc-01.jpg' && a.grund.includes('Zu klein')))
  check('about-detail.jpg abgelehnt (Aspect)', plan.abgelehnt.some((a) => a.name === 'about-detail.jpg' && a.grund.includes('Aspect')))

  const erwartetFehlend = ['about_detail', 'svc_01', 'svc_02', 'svc_03', 'svc_04', 'svc_05', 'why_1', 'why_2', 'why_3', 'contact_img', 'team_1', 'team_2', 'team_3']
  check(
    `fehlendePflicht = ${erwartetFehlend.length} Slots (hero_video/avatare optional)`,
    JSON.stringify([...plan.fehlendePflicht].sort()) === JSON.stringify([...erwartetFehlend].sort()),
    plan.fehlendePflicht.join(',')
  )
  check('Alt-Text gesetzt', plan.eintraege.every((e) => e.altText.length > 5))

  console.log('\n— Test 2: unbekannte Branche —')
  let geworfen = false
  try {
    await planeImport('friseur', dir)
  } catch (e) {
    geworfen = e instanceof Error && e.message.includes('SLOT_REGISTRY')
  }
  check('unbekannte Branche wirft (Registry-Hinweis)', geworfen)

  console.log('\n— Test 3: halbes Paar —')
  const dir2 = mkdtempSync(join(tmpdir(), 'wvd-import-test2-'))
  await sharp({ create: { width: 1600, height: 1200, channels: 3, background: gruen } })
    .jpeg()
    .toFile(join(dir2, 'ba-after.jpg'))
  const plan2 = await planeImport('galabau', dir2)
  check('halbes Paar → Warnung', plan2.warnungen.some((w) => w.includes('Halbes Paar')))
  check('halbes Paar → ohne pair_id importierbar', plan2.eintraege.length === 1 && plan2.eintraege[0].pairId === undefined)

  // — Test 4 (optional): DB-Phase mit stub:true, nur wenn Supabase + asset_bank da —
  console.log('\n— Test 4: DB-Phase (STUB, optional) —')
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('  ⏭  übersprungen: Supabase-Env fehlt')
  } else {
    const { createAdminClient } = await import('../lib/supabase/admin')
    const admin = createAdminClient()
    const { error: tabellenFehler } = await admin.from('asset_bank').select('id').limit(1)
    if (tabellenFehler) {
      console.log(`  ⏭  übersprungen: asset_bank nicht erreichbar (${tabellenFehler.message}) — Migrationen 013+ siehe WARTELISTE`)
    } else {
      const ergebnis = await fuehreImportAus(plan, { admin, approve: true, stub: true })
      check('3 importiert', ergebnis.importiert.length === 3, JSON.stringify(ergebnis.fehler))
      check('STUB erzwingt draft trotz approve:true', ergebnis.importiert.every((i) => i.status === 'draft'))
      const ids = ergebnis.importiert.map((i) => i.assetId)
      const { data } = await admin.from('asset_bank').select('id, quelle, quality_status, pair_id, szene_typ').in('id', ids)
      check("alle Zeilen quelle='ai_mock'", (data ?? []).length === 3 && (data ?? []).every((z) => z.quelle === 'ai_mock'))
      check('BA-Zeilen mit pair_id', (data ?? []).filter((z) => z.pair_id).length === 2)
      // Aufräumen: Test-Zeilen + Storage-Objekte entfernen
      for (const id of ids) {
        const { data: zeile } = await admin.from('asset_bank').select('storage_path, varianten').eq('id', id).single()
        const pfade: string[] = []
        if (zeile?.storage_path) pfade.push(zeile.storage_path)
        const v = zeile?.varianten as { webp?: { pfad: string }[]; avif?: { pfad: string }[] } | null
        for (const f of [...(v?.webp ?? []), ...(v?.avif ?? [])]) pfade.push(f.pfad)
        if (pfade.length) await admin.storage.from('asset-bank').remove(Array.from(new Set(pfade)))
      }
      await admin.from('asset_bank').delete().in('id', ids)
      console.log('  🧹 Test-Zeilen + Storage-Objekte entfernt')
    }
  }

  rmSync(dir, { recursive: true, force: true })
  rmSync(dir2, { recursive: true, force: true })

  console.log(`\nErgebnis: ${ok} ok, ${fail} fehlgeschlagen`)
  process.exit(fail > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error('FEHLER:', e)
  process.exit(1)
})
