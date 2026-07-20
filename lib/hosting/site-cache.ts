/**
 * Site-Cache (MVP-Finish §1): gecachtes Rendering pro (Site, Pfad) mit
 * Tag-Invalidierung. Next 14 → unstable_cache + revalidateTag.
 *
 * Zwei Ebenen:
 *  1. Host → Site-ID (Tag 'host-map', kurze TTL — Subdomain-/Domain-Zuordnung)
 *  2. Site-ID + Pfad → fertiges Render-Ergebnis (Tag `site:{id}`)
 *
 * Publish/Rollback/Sperren rufen revalidateSite() bzw. revalidateHostMap() auf.
 * Fallback-Revalidate sorgt dafür, dass vergessene Invalidierungen nach
 * spätestens REVALIDATE_SEKUNDEN konvergieren.
 */
import { unstable_cache, revalidateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { renderKundenseite, type SiteZeile } from '@/lib/auslieferung'

const REVALIDATE_SEKUNDEN = 300
const HOST_MAP_SEKUNDEN = 300

export const HOST_MAP_TAG = 'host-map'
export function siteTag(siteId: string): string {
  return `site:${siteId}`
}

/** Nach Publish/Rollback/Sperr-Änderung aufrufen: HTML-Cache der Site leeren */
export function revalidateSite(siteId: string): void {
  revalidateTag(siteTag(siteId))
}

/** Nach Subdomain-/Domain-Änderungen aufrufen: Host-Zuordnung leeren */
export function revalidateHostMap(): void {
  revalidateTag(HOST_MAP_TAG)
}

const SITE_SPALTEN = 'id, name, template_id, config, status, gesperrt, noindex'

/**
 * Host → Site-ID auflösen (Lookup-Reihenfolge wie bisher, §11):
 *  1. Subdomain-Label unter *.MARKETING_HOST → sites.subdomain
 *  2. Voller Host → domains.hostname (status AKTIV)
 *  3. Voller Host → sites.domain (Altbestand)
 */
async function resolveSiteId(host: string): Promise<string | null> {
  const supabase = createAdminClient()

  const marketingHost = (process.env.NEXT_PUBLIC_MARKETING_HOST || '').split(':')[0].toLowerCase()
  if (marketingHost && host.endsWith('.' + marketingHost)) {
    const label = host.slice(0, -(marketingHost.length + 1))
    if (label && !label.includes('.')) {
      const { data } = await supabase.from('sites').select('id').eq('subdomain', label).maybeSingle()
      if (data?.id) return data.id as string
    }
  }

  const { data: domain } = await supabase
    .from('domains')
    .select('site_id')
    .eq('hostname', host)
    .eq('status', 'AKTIV')
    .maybeSingle()
  if (domain?.site_id) return domain.site_id as string

  const { data } = await supabase.from('sites').select('id').eq('domain', host).maybeSingle()
  return (data?.id as string) || null
}

export function resolveSiteIdCached(host: string): Promise<string | null> {
  return unstable_cache(() => resolveSiteId(host), ['host-map', host], {
    tags: [HOST_MAP_TAG],
    revalidate: HOST_MAP_SEKUNDEN,
  })()
}

/** Serialisierbares Auslieferungs-Ergebnis (landet im Data-Cache) */
export interface SiteAuslieferung {
  /** 'ok' | 'nicht-gefunden' | 'gesperrt' */
  ergebnis: 'ok' | 'nicht-gefunden' | 'gesperrt'
  html: string | null
  /** noindex erzwingen (site.noindex oder Demo-Status) */
  noindex: boolean
  name: string | null
}

async function ladeUndRendere(siteId: string, pfad: string): Promise<SiteAuslieferung> {
  const supabase = createAdminClient()
  const { data } = await supabase.from('sites').select(SITE_SPALTEN).eq('id', siteId).maybeSingle()
  const site = data as SiteZeile | null

  // Ausgeliefert werden published-Sites (Live) und demo-Sites (immer noindex).
  const istDemo = site?.status === 'demo'
  if (!site || !(site.status === 'published' || istDemo) || !site.config) {
    return { ergebnis: 'nicht-gefunden', html: null, noindex: true, name: site?.name ?? null }
  }
  if (site.gesperrt) {
    return { ergebnis: 'gesperrt', html: null, noindex: true, name: site.name ?? null }
  }

  const html = await renderKundenseite(supabase, site, pfad)
  if (!html) return { ergebnis: 'nicht-gefunden', html: null, noindex: true, name: site.name ?? null }
  return { ergebnis: 'ok', html, noindex: istDemo || site.noindex === true, name: site.name ?? null }
}

/**
 * Gecachte Auslieferung pro (Site, Pfad). Tag `site:{id}` — Publish/Rollback
 * invalidieren gezielt, Fallback-TTL fängt alles andere ab.
 */
export function renderSiteCached(siteId: string, pfad: string): Promise<SiteAuslieferung> {
  return unstable_cache(() => ladeUndRendere(siteId, pfad), ['site-html', siteId, pfad], {
    tags: [siteTag(siteId)],
    revalidate: REVALIDATE_SEKUNDEN,
  })()
}
