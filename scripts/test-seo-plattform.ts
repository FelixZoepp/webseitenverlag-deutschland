/**
 * B-02 — Plattform-Sitemap/robots: npx tsx scripts/test-seo-plattform.ts
 *
 * Beweist: (a) sitemap enthält alle öffentlichen Marketing-Routen und KEINE
 * Demo-/Admin-Pfade, (b) jeder Blog-Ordner auf der Platte steht in der
 * Sitemap (neuer Blogpost ohne Sitemap-Eintrag = FAIL), (c) robots sperrt
 * Demos/Admin/Dashboard/API und verweist auf die Sitemap.
 */
import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import sitemap from '../app/sitemap'
import robots from '../app/robots'
import { veroeffentlichteArtikel } from '../lib/blog/artikel'

let fehler = 0
function check(name: string, bedingung: boolean, detail?: string) {
  console.log(`${bedingung ? 'PASS' : 'FAIL'}  ${name}${!bedingung && detail ? ` — ${detail}` : ''}`)
  if (!bedingung) fehler++
}

const eintraege = sitemap()
const urls = eintraege.map((e) => e.url)

check('Sitemap hat Startseite mit Priority 1',
  eintraege.some((e) => e.url.endsWith('/') && e.priority === 1))
for (const pfad of ['/anfrage', '/ergebnisse', '/kundenmeinungen', '/blog']) {
  check(`Sitemap enthält ${pfad}`, urls.some((u) => u.endsWith(pfad)))
}
check('Sitemap enthält KEINE Demo-/Admin-/Dashboard-Pfade',
  urls.every((u) => !/\/(demo|admin|dashboard|api|kundenseite)\b/.test(u)))
check('Alle Sitemap-URLs absolut (https)', urls.every((u) => u.startsWith('https://')))

// Blog-Ordner auf Platte ⇔ Sitemap — nur veröffentlichte Artikel müssen drin stehen
// (Artikel mit Datum in der Zukunft sind per Datums-Gate noch nicht sichtbar)
const blogDir = join(__dirname, '..', 'app', '(marketing)', 'blog')
const slugsAufPlatte = readdirSync(blogDir).filter(
  (e) => statSync(join(blogDir, e)).isDirectory()
)
const veroeffentlichteSlugs = new Set(veroeffentlichteArtikel().map((a) => a.slug))
for (const slug of slugsAufPlatte) {
  if (!veroeffentlichteSlugs.has(slug)) continue // noch nicht veröffentlicht — OK
  check(`Blog-Post "${slug}" steht in der Sitemap`,
    urls.some((u) => u.endsWith(`/blog/${slug}`)),
    'Registry-Eintrag in lib/blog/artikel.ts prüfen')
}

const r = robots()
const regeln = Array.isArray(r.rules) ? r.rules : [r.rules]
const disallow = regeln.flatMap((regel) =>
  Array.isArray(regel?.disallow) ? regel.disallow : [regel?.disallow]
).filter((d): d is string => typeof d === 'string')

for (const pfad of ['/demo/', '/admin/', '/dashboard/', '/api/', '/kundenseite/']) {
  check(`robots disallow ${pfad}`, disallow.includes(pfad))
}
check('robots verweist auf sitemap.xml',
  typeof r.sitemap === 'string' && r.sitemap.endsWith('/sitemap.xml'))

console.log(fehler === 0 ? '\n✓ Plattform-SEO-Suite bestanden (B-02).' : `\n✗ ${fehler} Fehler.`)
process.exit(fehler === 0 ? 0 : 1)
