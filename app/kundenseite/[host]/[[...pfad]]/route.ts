/**
 * Multi-Tenant-Auslieferung (Phase G, §11): Kundenseiten über unsere Infrastruktur.
 *
 * Die Middleware rewritet unbekannte Hosts (Subdomains von PRODUKTDOMAIN und
 * aktive Custom Domains) hierher: /kundenseite/<host>/<pfad>.
 * Lookup-Reihenfolge:
 *   1. Subdomain-Label unter *.MARKETING_HOST → sites.subdomain
 *   2. Voller Host → domains.hostname (status AKTIV)
 *   3. Voller Host → sites.domain (Altbestand)
 *
 * Leitplanken: gesperrt → 503-Sperrseite, noindex → robots-Meta + Header,
 * nur status='published' mit Live-config wird ausgeliefert.
 */
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { renderKundenseite, sperrSeite, mitNoindex, type SiteZeile } from '@/lib/auslieferung'

export const dynamic = 'force-dynamic'

const SITE_SPALTEN = 'id, name, template_id, config, status, gesperrt, noindex'

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
  const supabase = createAdminClient()
  let site: SiteZeile | null = null

  // 1. Subdomain unter der Produktdomain
  const marketingHost = (process.env.NEXT_PUBLIC_MARKETING_HOST || '').split(':')[0].toLowerCase()
  if (marketingHost && host.endsWith('.' + marketingHost)) {
    const label = host.slice(0, -(marketingHost.length + 1))
    if (label && !label.includes('.')) {
      const { data } = await supabase.from('sites').select(SITE_SPALTEN).eq('subdomain', label).maybeSingle()
      site = data as SiteZeile | null
    }
  }

  // 2. Aktive Custom Domain
  if (!site) {
    const { data: domain } = await supabase
      .from('domains')
      .select('site_id')
      .eq('hostname', host)
      .eq('status', 'AKTIV')
      .maybeSingle()
    if (domain?.site_id) {
      const { data } = await supabase.from('sites').select(SITE_SPALTEN).eq('id', domain.site_id).maybeSingle()
      site = data as SiteZeile | null
    }
  }

  // 3. Altbestand: sites.domain
  if (!site) {
    const { data } = await supabase.from('sites').select(SITE_SPALTEN).eq('domain', host).maybeSingle()
    site = data as SiteZeile | null
  }

  if (!site || site.status !== 'published' || !site.config) return nichtGefunden()

  if (site.gesperrt) {
    return new NextResponse(sperrSeite(site.name), {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' },
    })
  }

  try {
    const html = await renderKundenseite(supabase, site, pfad)
    if (!html) return nichtGefunden()
    return htmlAntwort(html, 200, site.noindex === true)
  } catch {
    return nichtGefunden()
  }
}
