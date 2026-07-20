/**
 * Multi-Tenant-Auslieferung (MVP-Finish §1): ALLE Sites (Demos + Live) rendern
 * aus der DB über unsere Vercel-Infrastruktur.
 *
 * Die Middleware rewritet unbekannte Hosts (Subdomains von MARKETING_HOST und
 * aktive Custom Domains) hierher: /kundenseite/<host>/<pfad>.
 *
 * Caching: Host→Site-ID und (Site, Pfad)→HTML laufen über den Next-Data-Cache
 * (lib/hosting/site-cache.ts) mit Tag `site:{id}` — Publish/Rollback
 * invalidieren gezielt. Obendrauf CDN-Caching per s-maxage.
 *
 * Leitplanken: gesperrt → 503-Sperrseite, noindex/Demo → robots-Meta + Header,
 * ausgeliefert werden nur status 'published' (Live) und 'demo' (immer noindex).
 */
import { NextResponse } from 'next/server'
import { resolveSiteIdCached, renderSiteCached } from '@/lib/hosting/site-cache'
import { sperrSeite, mitNoindex } from '@/lib/auslieferung'

export const dynamic = 'force-dynamic'

function htmlAntwort(html: string, status: number, noindex: boolean): NextResponse {
  const headers: Record<string, string> = {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'public, max-age=0, s-maxage=120, stale-while-revalidate=300',
  }
  if (noindex) headers['X-Robots-Tag'] = 'noindex, nofollow'
  return new NextResponse(noindex ? mitNoindex(html) : html, { status, headers })
}

function nichtGefunden(): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Seite nicht gefunden</title>
<style>body{font-family:system-ui,sans-serif;background:#f9fafb;color:#1f2937;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.box{text-align:center;padding:40px;max-width:420px}h1{font-size:1.4rem;margin:0 0 10px}p{color:#6b7280;font-size:.95rem;line-height:1.6;margin:0}</style>
</head><body><div class="box"><h1>Seite nicht gefunden</h1><p>Unter dieser Adresse ist keine Website verfügbar.</p></div></body></html>`
  return new NextResponse(html, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

export async function GET(
  _request: Request,
  { params }: { params: { host: string; pfad?: string[] } }
) {
  const host = decodeURIComponent(params.host || '').split(':')[0].toLowerCase()
  if (!host || host.length > 255 || !/^[a-z0-9.-]+$/.test(host)) return nichtGefunden()

  const pfad = (params.pfad || []).join('/')

  try {
    const siteId = await resolveSiteIdCached(host)
    if (!siteId) return nichtGefunden()

    const auslieferung = await renderSiteCached(siteId, pfad)

    if (auslieferung.ergebnis === 'gesperrt') {
      return new NextResponse(sperrSeite(auslieferung.name), {
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' },
      })
    }
    if (auslieferung.ergebnis !== 'ok' || !auslieferung.html) return nichtGefunden()

    return htmlAntwort(auslieferung.html, 200, auslieferung.noindex)
  } catch (e) {
    console.error('[kundenseite] Auslieferung fehlgeschlagen:', host, pfad, e)
    return nichtGefunden()
  }
}
