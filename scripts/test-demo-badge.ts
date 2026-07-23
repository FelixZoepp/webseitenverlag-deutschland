/**
 * B-01/B-16 — Demo-Badge + OG-Meta: npx tsx scripts/test-demo-badge.ts
 *
 * Beweist: finalisiereDemoHtml injiziert IMMER (a) das Demo-Badge mit
 * Prospect-Name, (b) den Freischalten-CTA wenn ein Payment-Link existiert,
 * (c) noindex, (d) absolute og:image/og:title-Tags — auch bei HTML ohne
 * <head>/<body>. Zusätzlich: beide Demo-Routen nutzen den Helper
 * (Quelltext-Scan — der alte badgelose Flagship-Pfad darf nie zurückkommen).
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import { finalisiereDemoHtml } from '../lib/demo-badge'

let fehler = 0
function check(name: string, bedingung: boolean) {
  console.log(`${bedingung ? 'PASS' : 'FAIL'}  ${name}`)
  if (!bedingung) fehler++
}

const basis = '<!DOCTYPE html><html><head><title>x</title></head><body><h1>Seite</h1></body></html>'
const opts = {
  prospectName: 'Malerbetrieb Müller & Söhne',
  paymentLinkUrl: 'https://checkout.stripe.com/pay/cs_test_abc',
  origin: 'https://webseitenverlag-deutschland.vercel.app',
}

const voll = finalisiereDemoHtml(basis, opts)
check('Badge mit Prospect-Name (escaped) vorhanden',
  voll.includes('data-demo-badge') && voll.includes('Malerbetrieb Müller &amp; Söhne'))
check('Freischalten-CTA zeigt auf Payment-Link',
  voll.includes('Jetzt freischalten') && voll.includes('https://checkout.stripe.com/pay/cs_test_abc'))
check('noindex-Meta injiziert', voll.includes('<meta name="robots" content="noindex, nofollow">'))
check('og:title mit Prospect-Name',
  voll.includes('property="og:title"') && voll.includes('(Vorschau)'))
check('og:image ist absolute URL',
  voll.includes('property="og:image" content="https://webseitenverlag-deutschland.vercel.app/og-image.png"'))
check('twitter:card gesetzt', voll.includes('summary_large_image'))
check('Badge liegt vor </body>', voll.indexOf('data-demo-badge') < voll.indexOf('</body>'))

const ohneLink = finalisiereDemoHtml(basis, { ...opts, paymentLinkUrl: null })
check('Ohne Payment-Link: Badge ja, CTA nein',
  ohneLink.includes('data-demo-badge') && !ohneLink.includes('Jetzt freischalten'))

const fragment = finalisiereDemoHtml('<h1>Nur Fragment</h1>', opts)
check('HTML ohne head/body: Badge + Meta trotzdem enthalten',
  fragment.includes('data-demo-badge') && fragment.includes('noindex'))

// Quelltext-Scan: beide Demo-Routen MÜSSEN den Helper nutzen (Regression B-01)
const root = join(__dirname, '..')
for (const route of ['app/demo/[token]/route.ts', 'app/demo/[token]/[seite]/route.ts']) {
  const quelle = readFileSync(join(root, route), 'utf8')
  check(`${route} nutzt finalisiereDemoHtml`, quelle.includes('finalisiereDemoHtml'))
}
const hauptRoute = readFileSync(join(root, 'app/demo/[token]/route.ts'), 'utf8')
check('Alter badgeloser demoBar-Pfad entfernt', !hauptRoute.includes('function demoBar'))

console.log(fehler === 0 ? '\n✓ Demo-Badge-Suite bestanden (B-01/B-16).' : `\n✗ ${fehler} Fehler.`)
process.exit(fehler === 0 ? 0 : 1)
