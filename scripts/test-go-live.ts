import { slugifyFirmenname } from '../lib/hosting/subdomain'
import { readFileSync } from 'fs'
import { join } from 'path'

let fehler = 0
let geprueft = 0

function assert(bedingung: boolean, name: string, meldung: string) {
  geprueft++
  if (!bedingung) {
    fehler++
    console.error(`  ✗ [${name}] ${meldung}`)
  }
}

// Subdomain-Slugify Tests
const FAELLE: [string, string][] = [
  ['Grünwerk GaLaBau', 'gruenwerk-galabau'],
  ['Praxis Dr. Müller', 'praxis-dr-mueller'],
  ['Café Süß & Lecker', 'cafe-suess-lecker'],
  ['  Spaces  Everywhere  ', 'spaces-everywhere'],
  ['Straße 123', 'strasse-123'],
  ['GROSSBUCHSTABEN', 'grossbuchstaben'],
  ['a'.repeat(100), 'a'.repeat(63)],  // DNS-Limit
  ['---test---', 'test'],  // Bindestriche trimmen
  ['Über Ökö Straßen', 'ueber-oekoe-strassen'],
]

for (const [input, erwartet] of FAELLE) {
  const ergebnis = slugifyFirmenname(input)
  assert(ergebnis === erwartet, 'R-GO-LIVE',
    `slugify("${input}") = "${ergebnis}", erwartet "${erwartet}"`)
}

// DNS-Konformität
for (const [input] of FAELLE) {
  const slug = slugifyFirmenname(input)
  assert(slug.length <= 63, 'R-GO-LIVE', `"${slug}" > 63 Zeichen`)
  assert(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug), 'R-GO-LIVE',
    `"${slug}" nicht DNS-konform`)
}

// Source-Scan: Freischalt-Route setzt noindex=false
const freischaltSrc = readFileSync(
  join(__dirname, '..', 'app', 'api', 'admin', 'sites', '[siteId]', 'freischalten', 'route.ts'), 'utf-8')
assert(freischaltSrc.includes('noindex: false'), 'R-GO-LIVE',
  'Freischalt-Route setzt noindex nicht auf false')
assert(freischaltSrc.includes("status: 'published'") || freischaltSrc.includes('status: "published"'), 'R-GO-LIVE',
  'Freischalt-Route setzt status nicht auf published')
assert(freischaltSrc.includes('subdomain'), 'R-GO-LIVE',
  'Freischalt-Route setzt keine Subdomain')

console.log(`\ntest:go-live — ${geprueft} Prüfungen, ${fehler} Fehler`)
if (fehler > 0) process.exit(1)
console.log('Alle Prüfungen bestanden.')
