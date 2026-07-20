/**
 * Veröffentlichen (MVP-Finish §1): ausschließlich multi_tenant.
 * draft_config wird Live-config, Auslieferung über unsere Vercel-Infrastruktur
 * (Subdomain unter PRODUKTDOMAIN bzw. Custom Domain, siehe app/kundenseite/[host]).
 * Kein Kunden-Setup nötig. Publish invalidiert den Site-Cache per Tag.
 *
 * Das frühere Kunden-Cloudflare-Deployment liegt in /_legacy/ (LEGACY_NOTIZEN.md).
 */
import { getOwnedSite } from '@/lib/api-helpers'
import { revalidateSite, revalidateHostMap } from '@/lib/hosting/site-cache'
import { starteAsyncPublishQa } from '@/lib/qa-gate/publish-qa'
import { NextResponse } from 'next/server'
import { SiteConfig } from '@/types'

function subdomainSlug(name: string | null | undefined, id: string): string {
  const base = (name || 'site')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  return `${base || 'site'}-${id.slice(0, 6)}`
}

export async function POST(
  _request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { supabase, site } = result.data

    if (site.gesperrt) {
      return NextResponse.json(
        { error: 'Diese Website ist gesperrt und kann nicht veröffentlicht werden.' },
        { status: 403 }
      )
    }

    const config = (site.draft_config || site.config) as SiteConfig | null
    if (!config) {
      return NextResponse.json({ error: 'Keine Konfiguration zum Veröffentlichen vorhanden.' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const marketingHost = (process.env.NEXT_PUBLIC_MARKETING_HOST || '').split(':')[0]

    let subdomain = (site.subdomain as string) || subdomainSlug(site.name as string, site.id as string)
    const felder = {
      config,
      status: 'published',
      deploy_status: 'OK',
      deploy_fehler: null,
      zuletzt_deployt_am: now,
      updated_at: now,
    }
    let { error } = await supabase.from('sites').update({ ...felder, subdomain }).eq('id', params.siteId)
    if (error && error.code === '23505') {
      // Subdomain kollidiert (unwahrscheinlich) → deterministischer Ausweichslug
      subdomain = `site-${(site.id as string).slice(0, 8)}`
      ;({ error } = await supabase.from('sites').update({ ...felder, subdomain }).eq('id', params.siteId))
    }
    if (error) throw new Error(error.message)

    await supabase.from('config_versions').insert({
      site_id: params.siteId,
      config,
      created_by: 'system',
      description: 'Veröffentlicht',
    })

    // Cache-Invalidierung (§1): neuer Live-Stand sofort sichtbar
    revalidateSite(params.siteId)
    if (!site.subdomain) revalidateHostMap() // Subdomain wurde gerade erst vergeben

    // QA-Gate Baustein A: asynchroner Browser-QA-Lauf — blockiert die Response nie
    starteAsyncPublishQa(params.siteId, 'publish')

    const url = marketingHost ? `https://${subdomain}.${marketingHost}` : null
    return NextResponse.json({ success: true, url, deploy: 'multi_tenant' })
  } catch (e) {
    console.error('[publish] Fehler:', e)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
