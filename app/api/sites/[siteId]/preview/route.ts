import { getOwnedSite } from '@/lib/api-helpers'
import { renderTemplate } from '@/lib/template-renderer'
import { renderSinglePage } from '@/lib/multipage-renderer'
import { isPremiumTemplate, renderPremiumTemplate } from '@/lib/templates'
import { renderFlagshipPage } from '@/lib/flagship/render'
import { istScrubKomposition, SCRUB_UNTERSEITEN, type ScrubUnterseitenSlug } from '@/lib/flagship/scrub/types'
import { renderScrubUnterseite } from '@/lib/flagship/scrub/render'
import type { FlagshipConfig } from '@/lib/flagship/types'
import { NextResponse } from 'next/server'
import { istCustomConfig } from '@/lib/custom-html-editor'
import { rechtstexteAus, renderRechtstextSeite } from '@/lib/auslieferung'
import { SiteConfig, isMultiPageConfig } from '@/types'

export async function GET(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { site } = result.data
    const config = (site.draft_config || site.config) as SiteConfig
    const templateId = (site.template_id as string) || ''

    const { searchParams } = new URL(request.url)
    const pageKey = searchParams.get('page') || 'home'

    let html: string

    // Custom-HTML (individuell gestaltete Seite): Entwurf direkt ausliefern
    if (istCustomConfig(config)) {
      const slug = pageKey === 'home' ? '' : pageKey
      const rechtstexte = rechtstexteAus(config as unknown as Record<string, unknown>)
      if (rechtstexte && (slug === 'impressum' || slug === 'datenschutz')) {
        return new NextResponse(
          renderRechtstextSeite(slug, rechtstexte[slug], (site.name as string) || ''),
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        )
      }
      const seite = slug === '' ? config.html : config.pages?.[slug]
      // Interne Links (/kontakt, /#faq …) im Vorschau-iframe auf die Vorschau-Route
      // umbiegen, damit man im Dashboard durch alle Unterseiten klicken kann.
      const slugs = new Set([...Object.keys(config.pages || {}), ...(rechtstexte ? ['impressum', 'datenschutz'] : [])])
      const basis = `/api/sites/${params.siteId}/preview`
      const html = (typeof seite === 'string' ? seite : config.html).replace(
        /href="\/([a-z0-9-]*)(#[^"]*)?"/g,
        (treffer, s: string, anker?: string) =>
          s === '' ? `href="${basis}${anker || ''}"`
            : slugs.has(s) ? `href="${basis}?page=${s}${anker || ''}"`
            : treffer
      )
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    // Scrub-Story: Homepage + Unterseiten
    if ((config as Record<string, unknown>).engine === 'flagship' && istScrubKomposition(config)) {
      const scrubPage = SCRUB_UNTERSEITEN.find(u => u.slug === pageKey)
      if (scrubPage && pageKey !== 'home') {
        html = renderScrubUnterseite(config, pageKey as ScrubUnterseitenSlug, { demo: true })
      } else {
        html = renderFlagshipPage(config as unknown as FlagshipConfig, { demo: true })
      }
    } else if (isPremiumTemplate(templateId)) {
      html = renderPremiumTemplate(templateId, config as unknown as Record<string, unknown>, params.siteId)
    } else if (isMultiPageConfig(config)) {
      html = renderSinglePage(config.site, config.pages, pageKey, params.siteId)
    } else {
      html = renderTemplate(config, params.siteId)
    }

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
