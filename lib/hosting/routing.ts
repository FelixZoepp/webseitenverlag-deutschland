/**
 * Host-Routing-Entscheidung (MVP-Finish §1) — pure Funktion, damit sie ohne
 * Next.js-Runtime testbar ist. Die Middleware setzt die Entscheidung nur um.
 *
 * Routing-Tabelle:
 *   MARKETING_HOST        → Marketing-Landing + /admin (Ops)
 *   APP_HOST              → Kunden-Portal (/dashboard, /login, …)
 *   {slug}.MARKETING_HOST → Demo-/Kundenseite aus der DB (Rewrite)
 *   Custom Domains        → Kundenseite aus der DB (Rewrite)
 *
 * Ohne gesetzte Hosts (lokal/eine Vercel-Domain) passiert nichts (passthrough).
 */

export interface HostRoutingEnv {
  marketingHost?: string | null
  appHost?: string | null
  /** Dev-Override erlauben (?__host=…): nur außerhalb Produktion oder per Flag */
  allowHostOverride?: boolean
}

export type RoutingDecision =
  | { type: 'passthrough' }
  | { type: 'redirect'; hostname: string; pathname?: string }
  | { type: 'rewrite'; pathname: string }

/**
 * Statische Kundenseiten: Host → HTML-Einstieg in /public.
 * "/" wird auf die Datei rewritten, alle anderen Pfade laufen durch
 * (die livara-*.html-Unterseiten liegen als echte Dateien in /public).
 */
export const STATIC_SITE_HOSTS: Record<string, string> = {}

/**
 * Kundendomains, die immer aus der DB ausgeliefert werden (Rewrite auf
 * /kundenseite/<host>) — unabhängig davon, ob MARKETING_HOST gesetzt ist.
 * livaraservice-gmbh.de lief bis 10/2026 statisch aus /public/livara*.html
 * (bleibt als Rückfall liegen) und ist jetzt im Kundenkonto bearbeitbar.
 */
export const KUNDEN_HOSTS = new Set<string>([
  'livaraservice-gmbh.de',
  'www.livaraservice-gmbh.de',
  'bc-directsales.de',
  'www.bc-directsales.de',
])

/** Pfade, die auf dem App-Host erlaubt sind */
export const APP_PATH_PREFIXES = ['/dashboard', '/login', '/register', '/api', '/willkommen']
/** Pfade, die NICHT auf die Marketing-Domain gehören */
export const APP_ONLY_PREFIXES = ['/dashboard']

export function stripPort(host: string): string {
  return host.split(':')[0].toLowerCase()
}

function hatPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

/**
 * Entscheidet für (host, pathname), was die Middleware tun soll.
 * `overrideHost` ist der Wert von ?__host= — er ersetzt den echten Host,
 * wenn env.allowHostOverride aktiv ist (E2E-Tests ohne DNS, §1).
 */
export function entscheideRouting(
  rawHost: string,
  pathname: string,
  env: HostRoutingEnv,
  overrideHost?: string | null
): RoutingDecision {
  const marketing = env.marketingHost ? stripPort(env.marketingHost) : ''
  const app = env.appHost ? stripPort(env.appHost) : ''
  let host = stripPort(rawHost || '')

  if (env.allowHostOverride && overrideHost && /^[a-z0-9.-]+$/i.test(overrideHost)) {
    host = stripPort(overrideHost)
  }

  // Fest zugeordnete Kundendomain → Auslieferung aus der DB
  if (KUNDEN_HOSTS.has(host) && !pathname.startsWith('/api') && !pathname.startsWith('/kundenseite')) {
    // Alte statische Adressen (/livara.html, /livara-anfrage.html) auf die neuen umleiten
    const alt = pathname.match(/^\/livara(?:-([a-z0-9-]+))?\.html$/)
    if (alt) return { type: 'redirect', hostname: host, pathname: alt[1] ? `/${alt[1]}` : '/' }
    return { type: 'rewrite', pathname: `/kundenseite/${host}${pathname === '/' ? '' : pathname}` }
  }

  // Statische Kundenseite (Host → HTML in /public)
  const staticSite = STATIC_SITE_HOSTS[host]
  if (staticSite) {
    if (pathname === '/') return { type: 'rewrite', pathname: staticSite }
    // Host-eigene robots.txt/sitemap.xml (z. B. /livara-robots.txt in /public),
    // damit die Kundendomain nicht die Plattform-Sitemap ausliefert.
    const basis = staticSite.replace(/\.html$/, '')
    if (pathname === '/robots.txt') return { type: 'rewrite', pathname: `${basis}-robots.txt` }
    if (pathname === '/sitemap.xml') return { type: 'rewrite', pathname: `${basis}-sitemap.xml` }
    return { type: 'passthrough' }
  }

  if (app && host === app) {
    // App-Host: Marketing-Inhalte gehören auf die Produktdomain
    if (!hatPrefix(pathname, APP_PATH_PREFIXES)) {
      if (pathname === '/') return { type: 'redirect', hostname: app, pathname: '/dashboard' }
      if (marketing) return { type: 'redirect', hostname: marketing }
    }
    return { type: 'passthrough' }
  }

  if (marketing && host === marketing) {
    // Marketing-Host: Portal-Pfade auf den App-Host umleiten
    if (app && hatPrefix(pathname, APP_ONLY_PREFIXES)) {
      return { type: 'redirect', hostname: app }
    }
    return { type: 'passthrough' }
  }

  // Unbekannter Host: Subdomain unter MARKETING_HOST oder Custom Domain →
  // Kundenseiten-Auslieferung. Nur aktiv, wenn Host-Routing konfiguriert ist.
  if (
    marketing &&
    host &&
    !host.endsWith('.vercel.app') &&
    host !== 'localhost' &&
    host !== '127.0.0.1' &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/kundenseite')
  ) {
    return { type: 'rewrite', pathname: `/kundenseite/${host}${pathname === '/' ? '' : pathname}` }
  }

  return { type: 'passthrough' }
}
