/**
 * B-17 — LocalBusiness-JSON-LD im Library-Renderer: npx tsx scripts/test-jsonld.ts
 *
 * Beweist: renderLibraryPage liefert (a) ein parsebares JSON-LD mit
 * @type LocalBusiness, Name, Adresse, Telefon, (b) og:title/og:description,
 * (c) Script-Ausbruch via '</script>' im Firmennamen ist escaped.
 * Der Flagship-Renderer hatte JSON-LD bereits — Gegenprobe hier mit.
 */
import { renderLibraryPage } from '../lib/library/render'
import type { LibraryDemoConfig } from '../lib/pipeline/generate-library-content'

let fehler = 0
function check(name: string, bedingung: boolean) {
  console.log(`${bedingung ? 'PASS' : 'FAIL'}  ${name}`)
  if (!bedingung) fehler++
}

function baueConfig(firma: string): LibraryDemoConfig {
  return {
    engine: 'library',
    library_page_key: 'test',
    branche: 'friseur',
    stil: 'clean' as LibraryDemoConfig['stil'],
    meta: {
      firma,
      ort: 'Leipzig',
      telefon: '0341 123456',
      email: 'info@example.de',
      adresse: 'Musterstraße 1',
      website: null,
    },
    inhalte: { hero: { headline: 'Willkommen', subheadline: 'Ihr Friseur in Leipzig' } },
    herkunft: { quellen: [] as unknown as LibraryDemoConfig['herkunft']['quellen'], generator: 'defaults' },
  }
}

const html = renderLibraryPage(baueConfig('Salon Schneidekunst'), [])

const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
check('JSON-LD-Block vorhanden', ldMatch !== null)

let ld: Record<string, unknown> = {}
try {
  ld = JSON.parse(ldMatch?.[1] ?? '{}')
  check('JSON-LD ist parsebar', true)
} catch {
  check('JSON-LD ist parsebar', false)
}
check('@type ist LocalBusiness', ld['@type'] === 'LocalBusiness')
check('name = Firma', ld.name === 'Salon Schneidekunst')
const adresse = ld.address as Record<string, unknown> | undefined
check('PostalAddress mit Ort + Straße',
  adresse?.['@type'] === 'PostalAddress' &&
  adresse?.addressLocality === 'Leipzig' &&
  adresse?.streetAddress === 'Musterstraße 1')
check('telephone gesetzt', ld.telephone === '0341 123456')
check('og:title + og:description vorhanden',
  html.includes('property="og:title"') && html.includes('property="og:description"'))

// Sicherheit: '</script>' im Firmennamen darf den JSON-LD-Block nicht sprengen
const boese = renderLibraryPage(baueConfig('Firma</script><script>alert(1)</script>'), [])
const boeseLd = boese.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? ''
check('</script> im Firmennamen ist escaped (kein Block-Ausbruch)',
  !boeseLd.includes('</script>') && boeseLd.includes('\\u003c'))

console.log(fehler === 0 ? '\n✓ JSON-LD-Suite bestanden (B-17).' : `\n✗ ${fehler} Fehler.`)
process.exit(fehler === 0 ? 0 : 1)
