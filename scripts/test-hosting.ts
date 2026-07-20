/**
 * Test Multi-Tenant-Hosting (MVP-Finish §1, Phase 1).
 *
 * Teil A — entscheideRouting (pure, ohne Next-Runtime):
 *   Marketing-/App-Host-Weichen, Subdomain- und Custom-Domain-Rewrites,
 *   ?__host=-Override (nur wenn erlaubt), No-op ohne konfigurierte Hosts.
 *
 * Teil B — Cache-Verdrahtung (nachweislich, next/cache gepatcht):
 *   renderSiteCached registriert unter Tag `site:{id}`, resolveSiteIdCached
 *   unter `host-map`; revalidateSite/revalidateHostMap feuern GENAU diese
 *   Tags → Publish invalidiert den Site-Cache nachweislich.
 *
 * Teil C — Aufrufstellen (Quelltext-Checks):
 *   publish/rollback/stripe-sperre rufen revalidateSite, Domain-Check/-Delete
 *   rufen revalidateHostMap, Middleware nutzt entscheideRouting.
 *
 * Aufruf: npm run test:hosting
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import { entscheideRouting, stripPort, type RoutingDecision } from '../lib/hosting/routing'

let fehler = 0
let geprueft = 0

function assert(bedingung: boolean, name: string, meldung: string) {
  geprueft++
  if (!bedingung) {
    fehler++
    console.error(`  ✗ [${name}] ${meldung}`)
  }
}

function assertGleich(ist: unknown, soll: unknown, name: string) {
  assert(
    JSON.stringify(ist) === JSON.stringify(soll),
    name,
    `erwartet ${JSON.stringify(soll)}, bekommen ${JSON.stringify(ist)}`
  )
}

// ---------------------------------------------------------------------------
// Teil A — entscheideRouting
// ---------------------------------------------------------------------------
console.log('Teil A: entscheideRouting')

const ENV = { marketingHost: 'webseitenverlag.de', appHost: 'app.webseitenverlag.de' }
const r = (host: string, pfad: string, env = ENV as Parameters<typeof entscheideRouting>[2], override?: string | null): RoutingDecision =>
  entscheideRouting(host, pfad, env, override)

// Ohne konfigurierte Hosts: immer passthrough (lokal / nackte Vercel-Domain)
assertGleich(r('localhost:3000', '/', {}), { type: 'passthrough' }, 'no-env')
assertGleich(r('kunde.de', '/impressum', {}), { type: 'passthrough' }, 'no-env-custom')

// Marketing-Host
assertGleich(r('webseitenverlag.de', '/'), { type: 'passthrough' }, 'marketing-root')
assertGleich(r('webseitenverlag.de', '/admin/demos'), { type: 'passthrough' }, 'marketing-admin')
assertGleich(r('webseitenverlag.de', '/dashboard'), { type: 'redirect', hostname: 'app.webseitenverlag.de' }, 'marketing-dashboard')
assertGleich(r('webseitenverlag.de', '/dashboard/site-1'), { type: 'redirect', hostname: 'app.webseitenverlag.de' }, 'marketing-dashboard-tief')
assertGleich(r('WEBSEITENVERLAG.DE:443', '/'), { type: 'passthrough' }, 'marketing-case-port')

// App-Host
assertGleich(r('app.webseitenverlag.de', '/'), { type: 'redirect', hostname: 'app.webseitenverlag.de', pathname: '/dashboard' }, 'app-root')
assertGleich(r('app.webseitenverlag.de', '/dashboard'), { type: 'passthrough' }, 'app-dashboard')
assertGleich(r('app.webseitenverlag.de', '/login'), { type: 'passthrough' }, 'app-login')
assertGleich(r('app.webseitenverlag.de', '/api/sites/x/publish'), { type: 'passthrough' }, 'app-api')
assertGleich(r('app.webseitenverlag.de', '/preise'), { type: 'redirect', hostname: 'webseitenverlag.de' }, 'app-marketing-inhalt')

// Subdomain unter Marketing-Host → Kundenseiten-Rewrite
assertGleich(r('maler-schmidt.webseitenverlag.de', '/'), { type: 'rewrite', pathname: '/kundenseite/maler-schmidt.webseitenverlag.de' }, 'subdomain-root')
assertGleich(r('maler-schmidt.webseitenverlag.de', '/impressum'), { type: 'rewrite', pathname: '/kundenseite/maler-schmidt.webseitenverlag.de/impressum' }, 'subdomain-pfad')

// Zwei Slugs → zwei verschiedene Rewrite-Ziele (DoD §1: Sites unterscheidbar)
const slugA = r('site-a.webseitenverlag.de', '/')
const slugB = r('site-b.webseitenverlag.de', '/')
assert(
  slugA.type === 'rewrite' && slugB.type === 'rewrite' && slugA.pathname !== slugB.pathname,
  'zwei-slugs',
  'verschiedene Slugs müssen auf verschiedene /kundenseite-Pfade zeigen'
)

// Custom Domain → Rewrite
assertGleich(r('maler-schmidt.de', '/'), { type: 'rewrite', pathname: '/kundenseite/maler-schmidt.de' }, 'custom-domain')
assertGleich(r('www.maler-schmidt.de', '/leistungen'), { type: 'rewrite', pathname: '/kundenseite/www.maler-schmidt.de/leistungen' }, 'custom-domain-www')

// Ausnahmen vom Rewrite
assertGleich(r('irgendwas.vercel.app', '/'), { type: 'passthrough' }, 'vercel-app')
assertGleich(r('localhost:3000', '/'), { type: 'passthrough' }, 'localhost')
assertGleich(r('maler-schmidt.de', '/api/public/forms/x/submit'), { type: 'passthrough' }, 'custom-api')
assertGleich(r('maler-schmidt.de', '/kundenseite/x'), { type: 'passthrough' }, 'kein-doppel-rewrite')

// ?__host=-Override (E2E ohne DNS)
assertGleich(
  r('localhost:3000', '/', { ...ENV, allowHostOverride: true }, 'maler-schmidt.de'),
  { type: 'rewrite', pathname: '/kundenseite/maler-schmidt.de' },
  'override-aktiv'
)
assertGleich(
  r('localhost:3000', '/', { ...ENV, allowHostOverride: false }, 'maler-schmidt.de'),
  { type: 'passthrough' },
  'override-inaktiv'
)
assertGleich(
  r('localhost:3000', '/', { ...ENV, allowHostOverride: true }, 'böse<script>'),
  { type: 'passthrough' },
  'override-ungueltig'
)

assertGleich(stripPort('Foo.DE:3000'), 'foo.de', 'stripPort')

// ---------------------------------------------------------------------------
// Teil B — Cache-Verdrahtung (next/cache gepatcht, dann site-cache laden)
// ---------------------------------------------------------------------------
console.log('Teil B: Cache-Verdrahtung')

/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */
const nextCache = require('next/cache') as Record<string, unknown>
const revalidiert: string[] = []
const wraps: { keys: string[]; tags: string[]; revalidate?: number }[] = []
nextCache.revalidateTag = (tag: string) => revalidiert.push(tag)
nextCache.unstable_cache = (_fn: any, keys: string[], opts: { tags: string[]; revalidate?: number }) => {
  wraps.push({ keys, tags: opts.tags, revalidate: opts.revalidate })
  return () => Promise.resolve(null)
}

const siteCache = require('../lib/hosting/site-cache') as typeof import('../lib/hosting/site-cache')
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */

async function teilB() {
  // Cache-Registrierung: Host-Map + Site-HTML unter den richtigen Tags
  await siteCache.resolveSiteIdCached('kunde.example.de')
  await siteCache.renderSiteCached('site-1', 'leistungen')

  const hostWrap = wraps.find((w) => w.keys.includes('kunde.example.de'))
  assert(!!hostWrap, 'hostmap-wrap', 'resolveSiteIdCached hat unstable_cache nicht aufgerufen')
  assertGleich(hostWrap?.tags, [siteCache.HOST_MAP_TAG], 'hostmap-tag')
  assert((hostWrap?.revalidate ?? 0) > 0, 'hostmap-ttl', 'Host-Map braucht Fallback-TTL')

  const siteWrap = wraps.find((w) => w.keys.includes('site-1'))
  assert(!!siteWrap, 'site-wrap', 'renderSiteCached hat unstable_cache nicht aufgerufen')
  assertGleich(siteWrap?.tags, [siteCache.siteTag('site-1')], 'site-tag')
  assert((siteWrap?.revalidate ?? 0) > 0, 'site-ttl', 'Site-Cache braucht Fallback-TTL')

  // Invalidierung feuert GENAU die registrierten Tags
  siteCache.revalidateSite('site-1')
  siteCache.revalidateHostMap()
  assert(
    revalidiert.includes(siteCache.siteTag('site-1')),
    'publish-invalidierung',
    `revalidateSite muss Tag "${siteCache.siteTag('site-1')}" feuern (bekommen: ${JSON.stringify(revalidiert)})`
  )
  assert(revalidiert.includes(siteCache.HOST_MAP_TAG), 'hostmap-invalidierung', 'revalidateHostMap muss Tag "host-map" feuern')

  // Kette geschlossen: Tag der Render-Registrierung === Tag der Invalidierung
  assert(
    siteWrap?.tags[0] === siteCache.siteTag('site-1') && revalidiert[0] === siteWrap?.tags[0],
    'tag-kette',
    'Render-Tag und Invalidierungs-Tag müssen identisch sein'
  )
}

// ---------------------------------------------------------------------------
// Teil C — Aufrufstellen im Quelltext
// ---------------------------------------------------------------------------
function teilC() {
  console.log('Teil C: Aufrufstellen')
  const root = join(__dirname, '..')
  const enthaelt = (relPfad: string, muster: string, name: string) => {
    let quelle = ''
    try {
      quelle = readFileSync(join(root, relPfad), 'utf8')
    } catch {
      assert(false, name, `${relPfad} nicht lesbar`)
      return
    }
    assert(quelle.includes(muster), name, `${relPfad} muss "${muster}" aufrufen`)
  }

  enthaelt('app/api/sites/[siteId]/publish/route.ts', 'revalidateSite(', 'publish-ruft-invalidierung')
  enthaelt('app/api/sites/[siteId]/rollback/route.ts', 'revalidateSite(', 'rollback-ruft-invalidierung')
  enthaelt('app/api/webhooks/stripe/route.ts', 'revalidateSite(', 'sperre-ruft-invalidierung')
  enthaelt('app/api/sites/[siteId]/domains/[domainId]/route.ts', 'revalidateHostMap(', 'domain-check-ruft-hostmap')
  enthaelt('app/api/sites/[siteId]/domains/route.ts', 'attachCustomDomain(', 'domains-post-ruft-vercel')
  enthaelt('middleware.ts', 'entscheideRouting(', 'middleware-nutzt-routing')
}

async function main() {
  await teilB()
  teilC()
  console.log(`\n${geprueft} Checks, ${fehler} Fehler`)
  if (fehler > 0) process.exit(1)
  console.log('✓ Hosting-Tests grün')
}

main().catch((e) => {
  console.error('Testlauf abgebrochen:', e)
  process.exit(1)
})
