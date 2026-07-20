import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { entscheideRouting, stripPort } from '@/lib/hosting/routing'

// Host-Routing (MVP-Finish §1):
//   MARKETING_HOST        → Marketing-Landing + /admin (Ops)
//   APP_HOST              → Kunden-Portal (/dashboard, /login)
//   {slug}.MARKETING_HOST + Custom Domains → Kundenseiten
//     (Rewrite auf /kundenseite/<host>, Auslieferung aus der DB)
// Konfiguration über Env — kein Hardcode:
//   NEXT_PUBLIC_MARKETING_HOST  z.B. "webseitenverlag.de"
//   NEXT_PUBLIC_APP_HOST        z.B. "app.webseitenverlag.de"
// Solange die Hosts nicht gesetzt sind (heute: eine Vercel-Domain für alles),
// verhält sich die Middleware wie bisher (nur Session-Refresh).
//
// Dev-Override (§1, E2E ohne DNS): ?__host=slug.PRODUKTDOMAIN.de simuliert den
// Host. Nur aktiv außerhalb Produktion oder mit ALLOW_HOST_OVERRIDE=1.

const MARKETING_HOST = process.env.NEXT_PUBLIC_MARKETING_HOST
const APP_HOST = process.env.NEXT_PUBLIC_APP_HOST
const ALLOW_HOST_OVERRIDE =
  process.env.NODE_ENV !== 'production' || process.env.ALLOW_HOST_OVERRIDE === '1'

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const host = stripPort(request.headers.get('host') || '')

  const entscheidung = entscheideRouting(
    host,
    pathname,
    {
      marketingHost: MARKETING_HOST,
      appHost: APP_HOST,
      allowHostOverride: ALLOW_HOST_OVERRIDE,
    },
    searchParams.get('__host')
  )

  if (entscheidung.type === 'redirect') {
    const target = request.nextUrl.clone()
    target.hostname = entscheidung.hostname
    if (entscheidung.pathname) target.pathname = entscheidung.pathname
    return NextResponse.redirect(target)
  }

  if (entscheidung.type === 'rewrite') {
    const target = request.nextUrl.clone()
    target.pathname = entscheidung.pathname
    target.searchParams.delete('__host')
    return NextResponse.rewrite(target)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
