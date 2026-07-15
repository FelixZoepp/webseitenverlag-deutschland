/**
 * Auslieferung von Kundenseiten (Phase G, §11).
 *
 * Zentrale Stelle für alles, was beim Ausliefern/Exportieren einer Live-Site
 * gilt — egal ob multi_tenant (über unsere Infrastruktur) oder als statischer
 * Export für Kunden-Cloudflare:
 *  - gesperrt   → Sperrseite (Dunning Stufe 3 / Vertragsende), HTTP 503
 *  - noindex    → robots-Meta + X-Robots-Tag, bis "Website fertigstellen" durch ist
 *  - Rechtstexte → config.rechtstexte (aus den Wizard-Pflichtangaben) wird als
 *    /impressum und /datenschutz ausgespielt — bei allen Engines
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { SiteConfig, isMultiPageConfig } from '@/types'
import { renderTemplate } from '@/lib/template-renderer'
import { renderSinglePage } from '@/lib/multipage-renderer'
import { isPremiumTemplate, renderPremiumTemplate } from '@/lib/templates'
import { renderLibraryPage } from '@/lib/library/render'
import { loadLibraryPage } from '@/lib/library/load'
import type { LibraryDemoConfig } from '@/lib/pipeline/generate-library-content'
import { renderFlagshipPage } from '@/lib/flagship/render'
import { renderAnfrageSeite } from '@/lib/flagship/anfrage'
import type { FlagshipConfig } from '@/lib/flagship/types'

export interface Rechtstexte {
  impressum: string
  datenschutz: string
}

export interface SiteZeile {
  id: string
  template_id: string | null
  config: Record<string, unknown> | null
  status: string | null
  gesperrt?: boolean | null
  noindex?: boolean | null
  name?: string | null
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

export function rechtstexteAus(config: Record<string, unknown> | null): Rechtstexte | null {
  const r = config?.rechtstexte as Partial<Rechtstexte> | undefined
  if (r && typeof r.impressum === 'string' && typeof r.datenschutz === 'string') {
    return { impressum: r.impressum, datenschutz: r.datenschutz }
  }
  return null
}

/** Plain-Text (Zeilenumbrüche) → einfache, saubere HTML-Absätze */
function textZuHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((block) => `<p>${esc(block).replace(/\n/g, '<br>')}</p>`)
    .join('\n')
}

export function renderRechtstextSeite(
  art: 'impressum' | 'datenschutz',
  text: string,
  firma: string
): string {
  const titel = art === 'impressum' ? 'Impressum' : 'Datenschutzerklärung'
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titel)} | ${esc(firma)}</title>
<meta name="robots" content="noindex">
<style>
body{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:#fff;color:#1f2937;line-height:1.7;margin:0}
.wrap{max-width:760px;margin:0 auto;padding:56px 24px 80px}
h1{font-size:1.8rem;margin:0 0 28px}
p{margin:0 0 16px;color:#374151}
a.zurueck{display:inline-block;margin-bottom:32px;color:#6b7280;font-size:.9rem;text-decoration:none}
a.zurueck:hover{color:#111827}
footer{border-top:1px solid #e5e7eb;margin-top:48px;padding-top:20px;font-size:.85rem;color:#9ca3af}
footer a{color:#6b7280}
</style>
</head>
<body>
<div class="wrap">
<a class="zurueck" href="/">&larr; Zurück zur Startseite</a>
<h1>${esc(titel)}</h1>
${textZuHtml(text)}
<footer><a href="/impressum">Impressum</a> &middot; <a href="/datenschutz">Datenschutz</a></footer>
</div>
</body>
</html>`
}

/** Sperrseite bei gesperrt=true (Dunning Stufe 3 / Vertragsende) */
export function sperrSeite(firma?: string | null): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Website vorübergehend nicht erreichbar</title>
<style>
body{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:#f9fafb;color:#1f2937;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.box{text-align:center;padding:40px;max-width:440px}
h1{font-size:1.4rem;margin:0 0 10px}
p{color:#6b7280;font-size:.95rem;line-height:1.6;margin:0}
</style>
</head>
<body>
<div class="box">
<h1>${firma ? esc(firma) + ' — ' : ''}vorübergehend nicht erreichbar</h1>
<p>Diese Website ist derzeit deaktiviert. Bitte versuchen Sie es später erneut.</p>
</div>
</body>
</html>`
}

/** robots-Meta in fertiges HTML injizieren (für noindex-Sites) */
export function mitNoindex(html: string): string {
  if (html.includes('name="robots"')) return html
  return html.includes('<head>')
    ? html.replace('<head>', '<head>\n<meta name="robots" content="noindex, nofollow">')
    : `<meta name="robots" content="noindex, nofollow">\n${html}`
}

function firmaAus(config: Record<string, unknown> | null, fallback?: string | null): string {
  const c = (config || {}) as SiteConfig & { meta?: { firma?: string }; site?: { name?: string } }
  return (
    c.businessName ||
    c.site?.name ||
    (c as { meta?: { firma?: string } }).meta?.firma ||
    fallback ||
    'Diese Website'
  )
}

/** Footer-Links auf /impressum und /datenschutz biegen (Single-Page + Library) */
function verlinkeRechtstexte(html: string): string {
  return html.replace(
    '<div>Impressum &middot; Datenschutz</div>',
    '<div><a href="/impressum" style="color:inherit">Impressum</a> &middot; <a href="/datenschutz" style="color:inherit">Datenschutz</a></div>'
  )
}

/** Freigegebene SEO-Landingpage (Upsell #1) unter /<slug> ausliefern */
export async function renderSeoLandingpage(
  supabase: SupabaseClient,
  siteId: string,
  slug: string,
  mitRechtstextLinks: boolean
): Promise<string | null> {
  const { data } = await supabase
    .from('seo_landingpages')
    .select('seiten_config')
    .eq('site_id', siteId)
    .eq('slug', slug)
    .eq('status', 'FREIGEGEBEN')
    .maybeSingle()
  if (!data?.seiten_config) return null

  const libConfig = data.seiten_config as unknown as LibraryDemoConfig
  const loaded = await loadLibraryPage(supabase, libConfig.library_page_key)
  const html = renderLibraryPage(libConfig, loaded?.assets ?? [])
  return mitRechtstextLinks ? verlinkeRechtstexte(html) : html
}

/**
 * Rendert eine Live-Site für einen Pfad. Gibt null zurück, wenn der Pfad
 * nicht existiert (404). gesperrt/noindex behandelt der Aufrufer (Route/Export),
 * damit Statuscode und Header stimmen.
 */
export async function renderKundenseite(
  supabase: SupabaseClient,
  site: SiteZeile,
  pfad: string
): Promise<string | null> {
  const config = (site.config || {}) as Record<string, unknown>
  const slug = pfad.replace(/^\/+|\/+$/g, '') // '' = Startseite
  const rechtstexte = rechtstexteAus(config)
  const firma = firmaAus(config, site.name)

  // Rechtstexte gewinnen immer — generiert aus den Wizard-Pflichtangaben
  if (rechtstexte && (slug === 'impressum' || slug === 'datenschutz')) {
    return renderRechtstextSeite(
      slug,
      slug === 'impressum' ? rechtstexte.impressum : rechtstexte.datenschutz,
      firma
    )
  }

  const html = await renderEngineSeite(supabase, site, config, slug, rechtstexte !== null)
  if (html !== null) return html

  // Kein Engine-Treffer: freigegebene SEO-Landingpage unter diesem Slug?
  if (slug !== '') {
    return renderSeoLandingpage(supabase, site.id, slug, rechtstexte !== null)
  }
  return null
}

/** Engine-Weiche wie in der Demo-Route */
async function renderEngineSeite(
  supabase: SupabaseClient,
  site: SiteZeile,
  config: Record<string, unknown>,
  slug: string,
  hatRechtstexte: boolean
): Promise<string | null> {
  if ((config as { engine?: string }).engine === 'flagship') {
    const fsConfig = config as unknown as FlagshipConfig
    // Live-Sites indexieren (noindex steuert der Aufrufer über site.noindex)
    if (slug === '') return renderFlagshipPage(fsConfig, { noindex: false })
    const funnelSlug = fsConfig.funnel.modus === 'reservierung' ? 'reservierung' : 'anfrage'
    if (slug === funnelSlug) {
      return renderAnfrageSeite(fsConfig, {
        submitZiel: `/api/public/forms/${site.id}/submit`,
      })
    }
    return null
  }

  if ((config as { engine?: string }).engine === 'library') {
    if (slug !== '') return null
    const libConfig = config as unknown as LibraryDemoConfig
    const loaded = await loadLibraryPage(supabase, libConfig.library_page_key)
    const html = renderLibraryPage(libConfig, loaded?.assets ?? [])
    return hatRechtstexte ? verlinkeRechtstexte(html) : html
  }

  const templateId = site.template_id || ''
  if (isPremiumTemplate(templateId)) {
    if (slug !== '') return null
    return renderPremiumTemplate(templateId, config, site.id)
  }

  const typedConfig = config as SiteConfig
  if (isMultiPageConfig(typedConfig)) {
    const eintrag = Object.entries(typedConfig.pages).find(([, p]) => (p.slug || '') === slug)
    if (!eintrag) return null
    return renderSinglePage(typedConfig.site, typedConfig.pages, eintrag[0], site.id)
  }

  // Legacy Single-Page
  if (slug !== '') return null
  const mitLinks: SiteConfig = hatRechtstexte
    ? { ...typedConfig, imprintUrl: '/impressum', privacyUrl: '/datenschutz' }
    : typedConfig
  return renderTemplate(mitLinks, site.id)
}

/**
 * Zusätzliche Dateien für den statischen Export (Cloudflare Pages Deploy):
 * Impressum-/Datenschutz-Seiten aus config.rechtstexte.
 */
export function rechtstexteDateien(
  config: Record<string, unknown> | null,
  siteName?: string | null
): { path: string; content: string }[] {
  const rechtstexte = rechtstexteAus(config)
  if (!rechtstexte) return []
  const firma = firmaAus(config, siteName)
  return [
    { path: 'impressum/index.html', content: renderRechtstextSeite('impressum', rechtstexte.impressum, firma) },
    { path: 'datenschutz/index.html', content: renderRechtstextSeite('datenschutz', rechtstexte.datenschutz, firma) },
  ]
}
