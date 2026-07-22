/**
 * Master-Review Kap. 3 — Determinismus-Beweis (2026-07-23).
 *
 * Behauptung aus dem Code-Review: `personalisiereFlagshipConfig` ist rein
 * mechanisch (verbatim-Ersetzung, kein LLM) ⇒ gleicher Input ⇒ identischer
 * Output. Dieses Script beweist das per Doppel-Lauf und Byte-Vergleich —
 * je Lauf zusätzlich das gerenderte HTML verglichen.
 *
 * Aufruf: npx tsx scripts/review-determinismus.ts
 * Exit 1 bei Abweichung.
 */
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'

const envPfad = join(process.cwd(), '.env.local')
if (existsSync(envPfad)) {
  for (const zeile of readFileSync(envPfad, 'utf8').split('\n')) {
    const m = zeile.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
}

async function main() {
  const { personalisiereFlagshipConfig } = await import('../lib/pipeline/generate-flagship-demo')
  const { renderFlagshipPage } = await import('../lib/flagship/render')

  const prospect = {
    firma: 'Malerbetrieb Krause GmbH',
    ort: 'Mainz',
    branche: 'maler',
    website: null,
    telefon: '06131 123456',
    email: null,
    adresse: null,
    gruendungsjahr: null,
    oeffnungszeiten: null,
    rating: null,
    reviewCount: null,
    bewertungen: [],
    websiteText: null,
    impressumText: null,
    logoUrl: null,
    bilder: [],
    notizen: null,
    quellen: ['manuell' as const],
  }

  const laeufe: { configHash: string; htmlHash: string }[] = []
  for (let i = 0; i < 2; i++) {
    const { config } = await personalisiereFlagshipConfig(prospect, 'maler')
    const html = renderFlagshipPage(config)
    laeufe.push({
      configHash: createHash('sha256').update(JSON.stringify(config)).digest('hex'),
      htmlHash: createHash('sha256').update(html).digest('hex'),
    })
    console.log(`Lauf ${i + 1}: config=${laeufe[i].configHash.slice(0, 16)}… html=${laeufe[i].htmlHash.slice(0, 16)}…`)
  }

  const identisch =
    laeufe[0].configHash === laeufe[1].configHash && laeufe[0].htmlHash === laeufe[1].htmlHash
  if (!identisch) {
    console.error('✗ Determinismus verletzt: Läufe unterscheiden sich.')
    process.exit(1)
  }
  console.log('✅ Determinismus bewiesen: 2 Läufe, identische Config- und HTML-Hashes.')
}

main().catch((e) => {
  console.error('Fehler:', e instanceof Error ? e.message : e)
  process.exit(1)
})
