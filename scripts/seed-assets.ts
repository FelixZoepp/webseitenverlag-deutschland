/**
 * MVP-Finish §3.4 — Seeding-Script für die Asset-Bank.
 *
 *   npx tsx scripts/seed-assets.ts --branche maler --count 40
 *
 * Erzeugt den Asset-Mix einer Branche über den festen Style-Prompt-
 * Baukasten (config/asset-styles.ts). Mix bei count=30 (Basis):
 *   6× hero (16:9), 12× galerie (4:3), 4× team/detail (3:4),
 *   4× vorher/nachher-PAARE (= 8 Bilder, nachher zuerst, pair_id).
 * count skaliert den Mix proportional.
 *
 * Alle Assets landen mit quality_status='draft' in der Bank —
 * Freigabe ausschließlich über /admin/assets.
 *
 * Ohne HIGGSFIELD_API_KEY/FAL_API_KEY läuft der Mock-Provider:
 * STUB-Modus, deutlich markiert (quelle='ai_mock') — solche Assets
 * sind in der Freigabe-UI NICHT approvebar.
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

import { generiereAsset, makePair, type SzeneTyp } from '../lib/assets/pipeline'
import type { AssetAspect } from '../lib/assets/higgsfield'
import { baueSeedPrompt, altTextVorlage, stilFuerBranche } from '../config/asset-styles'

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

/** Mix (Basis 30 Bilder) proportional auf count skalieren */
function baueMix(count: number): { hero: number; galerie: number; team: number; detail: number; paare: number } {
  const faktor = Math.max(count, 1) / 30
  const r = (n: number) => Math.max(1, Math.round(n * faktor))
  return { hero: r(6), galerie: r(12), team: r(2), detail: r(2), paare: r(4) }
}

async function main() {
  const branche = arg('branche', 'maler')
  const count = Number(arg('count', '30'))
  const mix = baueMix(count)
  const stil = stilFuerBranche(branche)
  const brancheName = branche.charAt(0).toUpperCase() + branche.slice(1).replace(/[_-]/g, ' ')

  const stubModus = !process.env.HIGGSFIELD_API_KEY && !process.env.FAL_API_KEY
  console.log(`\n— Asset-Seeding: branche=${branche}, count=${count} —`)
  console.log(
    `Mix: ${mix.hero}× hero, ${mix.galerie}× galerie, ${mix.team}× team, ${mix.detail}× detail, ${mix.paare}× Paare\n`
  )
  if (stubModus) {
    console.warn(
      '⚠️  STUB-MODUS: kein HIGGSFIELD_API_KEY/FAL_API_KEY — Mock-Provider aktiv.\n' +
        "   Assets werden als quelle='ai_mock' markiert und sind NIE approvebar.\n"
    )
  }

  let erzeugt = 0
  let fehler = 0

  const einzeln: Array<{ szene: SzeneTyp; aspect: AssetAspect; anzahl: number }> = [
    { szene: 'hero', aspect: '16:9', anzahl: mix.hero },
    { szene: 'galerie', aspect: '4:3', anzahl: mix.galerie },
    { szene: 'team', aspect: '3:4', anzahl: mix.team },
    { szene: 'detail', aspect: '3:4', anzahl: mix.detail },
  ]

  for (const { szene, aspect, anzahl } of einzeln) {
    for (let i = 1; i <= anzahl; i++) {
      try {
        const asset = await generiereAsset({
          prompt: baueSeedPrompt(branche, szene),
          aspect,
          branche,
          szeneTyp: szene,
          styleTags: stil.style_tags,
          altTextDe: altTextVorlage(brancheName, szene),
          kontext: `seed-assets:${branche}:${szene}`,
        })
        erzeugt++
        console.log(`✓ ${szene} ${i}/${anzahl} (${aspect}) → ${asset.id} [${asset.provider}, ${asset.kostenCent}ct]`)
      } catch (e) {
        fehler++
        const msg = e instanceof Error ? e.message : String(e)
        console.error(`✗ ${szene} ${i}/${anzahl}: ${msg}`)
        if (msg.includes('Budget') || msg.includes('KILL_SWITCH')) {
          console.error('\nAbbruch: Budget/Kill-Switch — Seeding gestoppt.')
          process.exit(1)
        }
      }
    }
  }

  for (let i = 1; i <= mix.paare; i++) {
    try {
      const paar = await makePair({
        branche,
        nachherPrompt: baueSeedPrompt(branche, 'nachher'),
        vorherPrompt: baueSeedPrompt(branche, 'vorher'),
        aspect: '16:9',
        styleTags: stil.style_tags,
        nachherAltText: altTextVorlage(brancheName, 'nachher'),
        vorherAltText: altTextVorlage(brancheName, 'vorher'),
        kontext: `seed-assets:${branche}:paar`,
      })
      erzeugt += 2
      console.log(`✓ Paar ${i}/${mix.paare} → pair_id=${paar.pairId}`)
    } catch (e) {
      fehler++
      const msg = e instanceof Error ? e.message : String(e)
      console.error(`✗ Paar ${i}/${mix.paare}: ${msg}`)
      if (msg.includes('Budget') || msg.includes('KILL_SWITCH')) {
        console.error('\nAbbruch: Budget/Kill-Switch — Seeding gestoppt.')
        process.exit(1)
      }
    }
  }

  console.log(
    `\nFertig: ${erzeugt} Assets erzeugt (${fehler} Fehler) — alle quality_status='draft'.` +
      `\nNächster Schritt: Freigabe in /admin/assets${stubModus ? ' (STUB-Assets sind nicht approvebar!)' : ''}\n`
  )
}

main().catch((e) => {
  console.error('\nFEHLER:', e instanceof Error ? e.message : e)
  process.exit(1)
})
