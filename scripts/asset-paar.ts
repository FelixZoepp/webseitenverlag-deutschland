/**
 * F1 DoD-CLI: erzeugt ein Vorher/Nachher-Paar über die Asset-Pipeline.
 *
 *   npx tsx scripts/asset-paar.ts
 *   npx tsx scripts/asset-paar.ts --branche reinigung --aspect 4:3 \
 *     --nachher "Blitzsaubere moderne Küche, helles Tageslicht" \
 *     --vorher "Dieselbe Küche stark verschmutzt, Fettflecken, Staub"
 *
 * Ohne HIGGSFIELD_API_KEY/FAL_API_KEY läuft der Mock-Provider (0 Cent) —
 * die komplette Pipeline (WebP+AVIF+srcset → Storage → asset_bank) wird
 * trotzdem echt durchlaufen. Voraussetzung: Migration 022 +
 * NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
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

import { makePair } from '../lib/assets/pipeline'
import type { AssetAspect } from '../lib/assets/higgsfield'

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

async function main() {
  const branche = arg('branche', 'reinigung')
  const aspect = arg('aspect', '4:3') as AssetAspect
  const nachher = arg(
    'nachher',
    'Blitzsaubere moderne Wohnzimmer-Szene nach professioneller Reinigung, helles Tageslicht, glänzende Oberflächen, keine Personen'
  )
  const vorher = arg(
    'vorher',
    'Dieselbe Wohnzimmer-Szene stark verschmutzt: Staub, Flecken auf dem Teppich, ungeputzte Fenster, gleiches Licht und gleiche Perspektive'
  )
  const stil = arg('stil', 'hell,premium').split(',').map((s) => s.trim()).filter(Boolean)

  console.log(`\n— F1 Asset-Paar: ${branche} (${aspect}) —\n`)
  const start = Date.now()
  const paar = await makePair({
    branche,
    nachherPrompt: nachher,
    vorherPrompt: vorher,
    aspect,
    styleTags: stil,
    kontext: `cli:asset-paar:${branche}`,
  })

  const dauer = ((Date.now() - start) / 1000).toFixed(1)
  for (const [name, a] of [['NACHHER', paar.nachher], ['VORHER ', paar.vorher]] as const) {
    console.log(`${name}  ${a.publicUrl}`)
    console.log(
      `         provider=${a.provider} job=${a.jobId} seed=${a.seed ?? '-'} kosten=${a.kostenCent}ct ` +
        `${a.breite}x${a.hoehe} varianten: webp=${a.varianten.webp.length} avif=${a.varianten.avif.length}`
    )
  }
  console.log(`\npair_id=${paar.pairId} · Dauer ${dauer}s · beide Einträge in asset_bank (quality_status=draft)\n`)
}

main().catch((e) => {
  console.error('\nFEHLER:', e instanceof Error ? e.message : e)
  process.exit(1)
})
