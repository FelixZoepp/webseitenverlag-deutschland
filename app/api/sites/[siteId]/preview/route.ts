import { getOwnedSite } from '@/lib/api-helpers'
import { renderTemplate } from '@/lib/template-renderer'
import { renderSinglePage } from '@/lib/multipage-renderer'
import { isPremiumTemplate, renderPremiumTemplate } from '@/lib/templates'
import { renderFlagshipPage } from '@/lib/flagship/render'
import { istScrubKomposition, SCRUB_UNTERSEITEN, type ScrubUnterseitenSlug } from '@/lib/flagship/scrub/types'
import { renderScrubUnterseite } from '@/lib/flagship/scrub/render'
import type { FlagshipConfig } from '@/lib/flagship/types'
import { NextResponse } from 'next/server'
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
