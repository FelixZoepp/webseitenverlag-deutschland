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
