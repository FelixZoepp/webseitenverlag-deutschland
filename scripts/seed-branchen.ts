/**
 * F3-CLI: seedet die 16 Start-Branchen (BF §3.2) als 'draft' nach
 * branchen_profile. Freigabe danach unter /admin/branchen.
 *
 *   npm run seed:branchen                       # alle 16
 *   npx tsx scripts/seed-branchen.ts --nur maler,friseur
 *   npx tsx scripts/seed-branchen.ts --ohne-assets
 *   npx tsx scripts/seed-branchen.ts --neu "Schlüsseldienst,Hundesalon"   # F4: klassifizieren + seeden
 *
 * Voraussetzungen: .env.local mit NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY. Ohne HIGGSFIELD_API_KEY
 * läuft der Mock-Provider (0 Cent, Platzhalter in der Bank).
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

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

import { START_BRANCHEN, type StartBranche } from '../lib/seeding/branchen-start'
import { seedBranche, type SeedErgebnis } from '../lib/seeding/seed-branche'
import { klassifiziereBranche } from '../lib/seeding/klassifiziere-branche'

function arg(name: string): string | null {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : null
}

async function main() {
  const nur = arg('nur')?.split(',').map((s) => s.trim())
  const neu = arg('neu')?.split(',').map((s) => s.trim()).filter(Boolean)
  const mitAssets = !process.argv.includes('--ohne-assets')

  let auswahl: StartBranche[]
  if (neu && neu.length > 0) {
    // F4-Weg: Freitext → Klassifizierung → Seeding
    auswahl = []
    for (const eingabe of neu) {
      process.stdout.write(`Klassifiziere „${eingabe}“ … `)
      try {
        const def = await klassifiziereBranche(eingabe)
        console.log(`${def.branche_key} → ${def.meta_kategorie}`)
        auswahl.push(def)
      } catch (e) {
        console.error(`FEHLER: ${(e as Error).message}`)
        process.exit(1)
      }
    }
    console.log()
  } else {
    auswahl = nur
      ? START_BRANCHEN.filter((b) => nur.includes(b.branche_key))
      : [...START_BRANCHEN]
    if (nur && auswahl.length !== nur.length) {
      const bekannt = new Set(auswahl.map((b) => b.branche_key))
      console.error(`Unbekannte Branchen-Keys: ${nur.filter((k) => !bekannt.has(k)).join(', ')}`)
      process.exit(1)
    }
  }

  console.log(`Branchen-Seeding — ${auswahl.length} Branchen${mitAssets ? '' : ' (ohne Assets)'}\n`)

  const ergebnisse: SeedErgebnis[] = []
  for (const branche of auswahl) {
    const start = Date.now()
    process.stdout.write(`→ ${branche.branche_key} (${branche.flagship ? 'flagship' : 'claude'}) … `)
    const ergebnis = await seedBranche(branche, { mitAssets })
    ergebnisse.push(ergebnis)
    const dauer = ((Date.now() - start) / 1000).toFixed(1)

    if (ergebnis.status === 'ok') {
      const assetInfo = ergebnis.assets
        ? `, ${1 + ergebnis.assets.paar_asset_ids.length + ergebnis.assets.galerie_ids.length} Assets`
        : ergebnis.asset_warnung
          ? `, ASSETS FEHLGESCHLAGEN: ${ergebnis.asset_warnung}`
          : ''
      console.log(`ok (${dauer}s${assetInfo})`)
    } else {
      console.log(`FEHLER (${dauer}s)`)
      console.error(`  ${ergebnis.fehler}`)
      for (const g of ergebnis.gates) console.error(`  Gate: ${g}`)
    }
  }

  const okZaehler = ergebnisse.filter((e) => e.status === 'ok').length
  console.log(`\n${okZaehler}/${ergebnisse.length} Branchen als draft gespeichert.`)
  if (okZaehler > 0) console.log('Freigabe: /admin/branchen')
  if (okZaehler < ergebnisse.length) process.exit(1)
}

main().catch((e) => {
  console.error('Seeding abgebrochen:', e)
  process.exit(1)
})
