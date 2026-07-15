/**
 * Seedet die Template-Library (section_library, library_pages, stock_assets).
 *
 * Validierung ohne DB:  npx tsx scripts/seed-library.ts --check
 * Seeding (idempotent): npx tsx scripts/seed-library.ts
 *
 * Voraussetzung fürs Seeding: Migration 016 ausgeführt,
 * NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY gesetzt.
 */

import { pruefeContentAufFloskeln } from '../lib/floskel-blacklist'
import { SEED_ASSETS, SEED_PAGES, SEED_SECTIONS } from '../lib/library/seed-data'
import { SECTION_TYPES } from '../lib/library/types'

// ------------------------------------------------------------
// Validierung (Quality-Gates §2/§7)
// ------------------------------------------------------------

function validate(): string[] {
  const fehler: string[] = []

  // Eindeutige Keys
  const dup = (keys: string[]) => keys.filter((k, i) => keys.indexOf(k) !== i)
  for (const d of dup(SEED_SECTIONS.map((s) => s.key))) fehler.push(`Doppelter Section-Key: ${d}`)
  for (const d of dup(SEED_PAGES.map((p) => p.key))) fehler.push(`Doppelter Page-Key: ${d}`)
  for (const d of dup(SEED_ASSETS.map((a) => a.key))) fehler.push(`Doppelter Asset-Key: ${d}`)

  const sectionKeys = new Set(SEED_SECTIONS.map((s) => s.key))
  const assetKeys = new Set(SEED_ASSETS.map((a) => a.key))

  // Kompositionen: 10-Sektionen-Skeleton, alle Referenzen auflösbar
  for (const page of SEED_PAGES) {
    if (page.sections.length !== SECTION_TYPES.length) {
      fehler.push(`${page.key}: ${page.sections.length} Sektionen statt ${SECTION_TYPES.length} (Skeleton §2)`)
    }
    page.sections.forEach((ref, i) => {
      if (!sectionKeys.has(ref.section_key)) {
        fehler.push(`${page.key}: unbekannter section_key '${ref.section_key}'`)
        return
      }
      const section = SEED_SECTIONS.find((s) => s.key === ref.section_key)!
      if (section.section_type !== SECTION_TYPES[i]) {
        fehler.push(`${page.key}[${i}]: erwartet '${SECTION_TYPES[i]}', referenziert '${section.section_type}'`)
      }
      // Overrides dürfen nur Felder aus dem content_schema setzen
      for (const feld of Object.keys(ref.overrides || {})) {
        if (!(feld in section.content_schema)) {
          fehler.push(`${page.key} → ${ref.section_key}: Override-Feld '${feld}' nicht im content_schema`)
        }
      }
    })
  }

  // Sektionen: default_content deckt content_schema ab; Bild-Keys auflösbar
  for (const section of SEED_SECTIONS) {
    for (const feld of Object.keys(section.content_schema)) {
      if (!(feld in section.default_content)) {
        fehler.push(`${section.key}: Schema-Feld '${feld}' fehlt im default_content`)
      }
    }
    for (const [feld, schema] of Object.entries(section.content_schema)) {
      if (schema.typ === 'bild') {
        const wert = section.default_content[feld]
        if (typeof wert === 'string' && !assetKeys.has(wert)) {
          fehler.push(`${section.key}: bild_key '${wert}' nicht in stock_assets`)
        }
      }
    }
  }

  // Floskel-Blacklist (§2) auf Default-Content und Overrides
  for (const section of SEED_SECTIONS) {
    for (const fund of pruefeContentAufFloskeln(section.default_content)) {
      fehler.push(`Floskel in ${section.key} (${fund.pfad}): "${fund.floskel}"`)
    }
  }
  for (const page of SEED_PAGES) {
    for (const ref of page.sections) {
      for (const fund of pruefeContentAufFloskeln(ref.overrides || {})) {
        fehler.push(`Floskel in ${page.key} → ${ref.section_key} (${fund.pfad}): "${fund.floskel}"`)
      }
    }
  }

  return fehler
}

// ------------------------------------------------------------
// Seeding
// ------------------------------------------------------------

async function seed() {
  const { createClient } = await import('@supabase/supabase-js')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Fehler: NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein.')
    process.exit(1)
  }
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error: sErr } = await supabase.from('section_library').upsert(
    SEED_SECTIONS.map((s) => ({
      key: s.key,
      section_type: s.section_type,
      branche: s.branche,
      stil: s.stil,
      name: s.name,
      beschreibung: s.beschreibung ?? null,
      content_schema: s.content_schema,
      default_content: s.default_content,
      sort_hint: s.sort_hint,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: 'key' }
  )
  if (sErr) throw new Error(`section_library: ${sErr.message}`)
  console.log(`✓ section_library: ${SEED_SECTIONS.length} Bausteine`)

  const { error: pErr } = await supabase.from('library_pages').upsert(
    SEED_PAGES.map((p) => ({
      key: p.key,
      name: p.name,
      branche: p.branche,
      stil: p.stil,
      seitentyp: p.seitentyp,
      beschreibung: p.beschreibung ?? null,
      sections: p.sections,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: 'key' }
  )
  if (pErr) throw new Error(`library_pages: ${pErr.message}`)
  console.log(`✓ library_pages: ${SEED_PAGES.length} Kompositionen`)

  const { error: aErr } = await supabase.from('stock_assets').upsert(
    SEED_ASSETS.map((a) => ({
      key: a.key,
      url: a.url,
      alt_text: a.alt_text,
      branche: a.branche,
      kategorie: a.kategorie,
      quelle: a.quelle,
      lizenz: a.lizenz ?? null,
      breite: a.breite ?? null,
      hoehe: a.hoehe ?? null,
    })),
    { onConflict: 'key' }
  )
  if (aErr) throw new Error(`stock_assets: ${aErr.message}`)
  console.log(`✓ stock_assets: ${SEED_ASSETS.length} Assets`)
}

// ------------------------------------------------------------

async function main() {
  const checkOnly = process.argv.includes('--check')

  const fehler = validate()
  if (fehler.length > 0) {
    console.error(`✗ Validierung fehlgeschlagen (${fehler.length} Fehler):`)
    for (const f of fehler) console.error(`  - ${f}`)
    process.exit(1)
  }
  console.log(
    `✓ Validierung OK: ${SEED_SECTIONS.length} Sektionen, ${SEED_PAGES.length} Kompositionen, ${SEED_ASSETS.length} Assets — Floskel-frei, Skeleton vollständig`
  )

  if (checkOnly) return
  await seed()
  console.log('✓ Library-Seeding abgeschlossen')
}

main().catch((e) => {
  console.error('✗', e.message)
  process.exit(1)
})
