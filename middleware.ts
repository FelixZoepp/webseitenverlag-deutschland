import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

// Host-Routing (Mission §1):
//   PRODUKTDOMAIN.de  → Marketing-Landing + /admin (Ops)
//   app.DOMAIN        → Kunden-Portal (/dashboard, /login)
//   *.DOMAIN + Custom Domains → Kundenseiten (Rewrite auf /kundenseite/<host>, Phase G)
// Konfiguration über Env — kein Hardcode:
//   NEXT_PUBLIC_MARKETING_HOST  z.B. "webseitenverlag.de"
//   NEXT_PUBLIC_APP_HOST        z.B. "app.webseitenverlag.de"
// Solange die Hosts nicht gesetzt sind (heute: eine Vercel-Domain für alles),
// verhält sich die Middleware wie bisher (nur Session-Refresh).

const MARKETING_HOST = process.env.NEXT_PUBLIC_MARKETING_HOST
const APP_HOST = process.env.NEXT_PUBLIC_APP_HOST

// Pfade, die auf dem App-Host erlaubt sind
const APP_PATH_PREFIXES = ['/dashboard', '/login', '/register', '/api', '/willkommen']
// Pfade, die NICHT auf die Marketing-Domain gehören
const APP_ONLY_PREFIXES = ['/dashboard']

function stripPort(host: string): string {
  return host.split(':')[0].toLowerCase()
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = stripPort(request.headers.get('host') || '')

  if (APP_HOST && host === stripPort(APP_HOST)) {
    // App-Host: Marketing-Inhalte auf die Produktdomain umleiten
    const isAppPath = APP_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
    if (!isAppPath) {
      const target = request.nextUrl.clone()
      if (pathname === '/') {
        // Root des App-Hosts → direkt zum Dashboard (Login-Redirect übernimmt die Seite)
        target.pathname = '/dashboard'
        return NextResponse.redirect(target)
      }
      if (MARKETING_HOST) {
        target.hostname = stripPort(MARKETING_HOST)
        return NextResponse.redirect(target)
      }
    }
  } else if (MARKETING_HOST && host === stripPort(MARKETING_HOST) && APP_HOST) {
    // Marketing-Host: Portal-Pfade auf den App-Host umleiten
    const isAppOnly = APP_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
    if (isAppOnly) {
      const target = request.nextUrl.clone()
      target.hostname = stripPort(APP_HOST)
      return NextResponse.redirect(target)
    }
  }
  // Kundenseiten (Phase G): unbekannte Hosts (Subdomains von MARKETING_HOST
  // oder aktive Custom Domains) auf die Auslieferungs-Route rewriten.
  // Nur aktiv, wenn Host-Routing konfiguriert ist — sonst wie bisher.
  if (
    MARKETING_HOST &&
    host &&
    host !== stripPort(MARKETING_HOST) &&
    (!APP_HOST || host !== stripPort(APP_HOST)) &&
    !host.endsWith('.vercel.app') &&
    host !== 'localhost' &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/kundenseite')
  ) {
    const target = request.nextUrl.clone()
    target.pathname = `/kundenseite/${host}${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(target)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
