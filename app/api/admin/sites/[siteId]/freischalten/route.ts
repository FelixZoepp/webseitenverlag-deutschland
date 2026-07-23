import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { slugifyFirmenname } from '@/lib/hosting/subdomain'
import { attachCustomDomain } from '@/lib/hosting/vercel-domains'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const { supabase } = auth.data

  // 1. Site laden
  const { data: site } = await supabase
    .from('sites')
    .select('id, name, status, noindex, subdomain')
    .eq('id', params.siteId)
    .single()

  if (!site) return NextResponse.json({ error: 'Site nicht gefunden' }, { status: 404 })
  if (site.status === 'published') {
    return NextResponse.json({ error: 'Site ist bereits live' }, { status: 409 })
  }

  // 2. Request-Body parsen
  const body = await request.json().catch(() => ({})) as { domain?: string }

  // 3. Domain oder Subdomain
  let subdomain = site.subdomain as string | null
  let domainResult = null
  let dnsAnleitung = null

  if (body.domain) {
    // Custom Domain → per Vercel API anhängen
    domainResult = await attachCustomDomain(supabase, params.siteId, body.domain)
    dnsAnleitung = {
      hostname: body.domain,
      anleitung: [
        `CNAME-Eintrag erstellen: www → cname.vercel-dns.com`,
        `A-Record für nackte Domain: @ → 76.76.21.21`,
      ],
      status: domainResult.ok ? (domainResult.verified ? 'AKTIV' : 'WARTET_AUF_DNS') : 'FEHLER',
      fehler: domainResult.fehler,
    }
  }

  if (!subdomain) {
    // Subdomain aus Site-Namen ableiten
    subdomain = slugifyFirmenname(site.name || 'site')

    // Kollisions-Check
    const { data: existing } = await supabase
      .from('sites')
      .select('id')
      .eq('subdomain', subdomain)
      .neq('id', params.siteId)
      .maybeSingle()

    if (existing) {
      let suffix = 2
      while (true) {
        const candidate = `${subdomain}-${suffix}`.slice(0, 63)
        const { data: collision } = await supabase
          .from('sites')
          .select('id')
          .eq('subdomain', candidate)
          .maybeSingle()
        if (!collision) { subdomain = candidate; break }
        suffix++
        if (suffix > 99) break
      }
    }
  }

  // 4. Site aktualisieren: noindex=false, status=published, subdomain
  const { error: updateError } = await supabase
    .from('sites')
    .update({
      noindex: false,
      status: 'published',
      subdomain,
    })
    .eq('id', params.siteId)

  if (updateError) {
    return NextResponse.json({ error: 'Fehler beim Freischalten', detail: updateError.message }, { status: 500 })
  }

  // 5. Subdomain auch als Vercel-Domain anhängen (für Routing)
  const produktDomain = 'webseitenverlag-deutschland.de'
  const subdomainHost = `${subdomain}.${produktDomain}`
  await attachCustomDomain(supabase, params.siteId, subdomainHost).catch(() => {})

  return NextResponse.json({
    ok: true,
    subdomain,
    subdomainUrl: `https://${subdomainHost}`,
    domain: body.domain || null,
    dnsAnleitung,
  })
}
