/**
 * Blog-Registry-Konsistenztest (R-BLOG-REGISTRY).
 *
 * Prüft:
 *  1. Alle Einträge haben Pflichtfelder (slug, titel, description, excerpt,
 *     datum ISO-Format, lesezeit, kategorie, bild)
 *  2. Keine doppelten Slugs
 *  3. Jeder Slug hat eine page.tsx unter app/(marketing)/blog/{slug}/page.tsx
 *  4. Jedes Blog-Verzeichnis hat einen Registry-Eintrag
 *  5. Jedes referenzierte Bild existiert in public/
 *  6. sitemap.ts importiert aus lib/blog/artikel
 *  7. veroeffentlichteArtikel() gibt ≤ Gesamtzahl und ≥ 5 zurück
 *
 * Aufruf: npm run test:blog
 */
import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { BLOG_ARTIKEL, veroeffentlichteArtikel } from '../lib/blog/artikel'

const ROOT = join(__dirname, '..')

let fehler = 0
let geprueft = 0

function assert(bedingung: boolean, name: string, meldung: string) {
  geprueft++
  if (!bedingung) {
    fehler++
    console.error(`  ✗ [${name}] ${meldung}`)
  }
}

// ─────────────────────────────────────────────────────────
// 1. Pflichtfelder aller Einträge
// ─────────────────────────────────────────────────────────
console.log('1. Pflichtfelder\n')

const ISO_DATUM = /^\d{4}-\d{2}-\d{2}$/

for (const artikel of BLOG_ARTIKEL) {
  const name = artikel.slug || '(kein slug)'
  assert(typeof artikel.slug === 'string' && artikel.slug.length > 0, name, 'slug fehlt oder leer')
  assert(typeof artikel.titel === 'string' && artikel.titel.length > 0, name, 'titel fehlt oder leer')
  assert(typeof artikel.description === 'string' && artikel.description.length > 0, name, 'description fehlt oder leer')
  assert(typeof artikel.excerpt === 'string' && artikel.excerpt.length > 0, name, 'excerpt fehlt oder leer')
  assert(typeof artikel.datum === 'string' && ISO_DATUM.test(artikel.datum), name, `datum nicht ISO-Format: "${artikel.datum}"`)
  assert(typeof artikel.lesezeit === 'string' && artikel.lesezeit.length > 0, name, 'lesezeit fehlt oder leer')
  assert(typeof artikel.kategorie === 'string' && artikel.kategorie.length > 0, name, 'kategorie fehlt oder leer')
  assert(typeof artikel.bild === 'string' && artikel.bild.startsWith('/blog/'), name, 'bild fehlt oder startet nicht mit /blog/')
}

console.log(`  ${BLOG_ARTIKEL.length} Einträge geprüft\n`)

// ─────────────────────────────────────────────────────────
// 2. Keine doppelten Slugs
// ─────────────────────────────────────────────────────────
console.log('2. Doppelte Slugs\n')

const slugs = BLOG_ARTIKEL.map((a) => a.slug)
const slugSet = new Set<string>()
for (const slug of slugs) {
  assert(!slugSet.has(slug), 'duplikat', `Slug doppelt: "${slug}"`)
  slugSet.add(slug)
}

// ─────────────────────────────────────────────────────────
// 3. Jeder Slug hat eine page.tsx
// ─────────────────────────────────────────────────────────
console.log('3. page.tsx vorhanden für jeden Slug\n')

for (const artikel of BLOG_ARTIKEL) {
  const pagePfad = join(ROOT, 'app', '(marketing)', 'blog', artikel.slug, 'page.tsx')
  assert(existsSync(pagePfad), artikel.slug, `page.tsx fehlt: ${pagePfad}`)
}

// ─────────────────────────────────────────────────────────
// 4. Jedes Blog-Verzeichnis hat einen Registry-Eintrag
// ─────────────────────────────────────────────────────────
console.log('4. Registry-Eintrag für jedes Blog-Verzeichnis\n')

const blogVerzeichnis = join(ROOT, 'app', '(marketing)', 'blog')
if (existsSync(blogVerzeichnis)) {
  const eintraege = readdirSync(blogVerzeichnis, { withFileTypes: true })
  for (const eintrag of eintraege) {
    // Nur Verzeichnisse (keine page.tsx auf Root-Ebene)
    if (!eintrag.isDirectory()) continue
    // Nur wenn page.tsx vorhanden (echte Artikel-Verzeichnisse)
    const hatPage = existsSync(join(blogVerzeichnis, eintrag.name, 'page.tsx'))
    if (!hatPage) continue
    assert(
      slugSet.has(eintrag.name),
      eintrag.name,
      `Verzeichnis "${eintrag.name}" hat keinen Registry-Eintrag in lib/blog/artikel.ts`
    )
  }
} else {
  assert(false, 'blog-verzeichnis', `Blog-Verzeichnis nicht gefunden: ${blogVerzeichnis}`)
}

// ─────────────────────────────────────────────────────────
// 5. Bild existiert in public/
// ─────────────────────────────────────────────────────────
console.log('5. Bilder in public/ vorhanden\n')

for (const artikel of BLOG_ARTIKEL) {
  // artikel.bild ist z. B. '/blog/foo.webp' → public/blog/foo.webp
  const bildPfad = join(ROOT, 'public', artikel.bild.replace(/^\//, ''))
  assert(existsSync(bildPfad), artikel.slug, `Bild nicht gefunden: ${bildPfad}`)
}

// ─────────────────────────────────────────────────────────
// 6. sitemap.ts importiert aus lib/blog/artikel
// ─────────────────────────────────────────────────────────
console.log('6. sitemap.ts importiert aus lib/blog/artikel\n')

const sitemapPfad = join(ROOT, 'app', 'sitemap.ts')
if (existsSync(sitemapPfad)) {
  const sitemapInhalt = readFileSync(sitemapPfad, 'utf-8')
  assert(
    sitemapInhalt.includes('lib/blog/artikel') || sitemapInhalt.includes("from '../lib/blog/artikel'") || sitemapInhalt.includes('veroeffentlichteArtikel'),
    'sitemap',
    'sitemap.ts importiert nicht aus lib/blog/artikel (veroeffentlichteArtikel fehlt)'
  )
} else {
  assert(false, 'sitemap', `sitemap.ts nicht gefunden: ${sitemapPfad}`)
}

// ─────────────────────────────────────────────────────────
// 7. veroeffentlichteArtikel() Konsistenz
// ─────────────────────────────────────────────────────────
console.log('7. veroeffentlichteArtikel()\n')

const veroeffentlicht = veroeffentlichteArtikel()
assert(
  veroeffentlicht.length <= BLOG_ARTIKEL.length,
  'veroeffentlichteArtikel',
  `gibt mehr zurück (${veroeffentlicht.length}) als Gesamtliste (${BLOG_ARTIKEL.length})`
)
assert(
  veroeffentlicht.length >= 5,
  'veroeffentlichteArtikel',
  `gibt weniger als 5 zurück (${veroeffentlicht.length}) — mindestens 5 Artikel sollten veröffentlicht sein`
)

// Prüfe Sortierung: neueste zuerst
for (let i = 1; i < veroeffentlicht.length; i++) {
  assert(
    veroeffentlicht[i - 1].datum >= veroeffentlicht[i].datum,
    'veroeffentlichteArtikel',
    `Sortierung falsch: ${veroeffentlicht[i - 1].datum} vor ${veroeffentlicht[i].datum}`
  )
}

console.log(`  Veröffentlicht: ${veroeffentlicht.length} / ${BLOG_ARTIKEL.length}\n`)

// ─────────────────────────────────────────────────────────
// Ergebnis
// ─────────────────────────────────────────────────────────
console.log(`${geprueft} Prüfungen, ${fehler} Fehler`)
if (fehler > 0) {
  console.log(`\nErwartete Fehler: Bilder (public/blog/*.webp) und page.tsx für neue Artikel fehlen noch.`)
  process.exit(1)
}
console.log('Alle Blog-Prüfungen bestanden.')
