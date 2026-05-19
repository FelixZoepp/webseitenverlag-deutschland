import { getOwnedSite } from '@/lib/api-helpers'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { SiteConfig, isMultiPageConfig } from '@/types'

const AddPageSchema = z.object({
  pageKey: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Nur Kleinbuchstaben, Zahlen und Bindestriche'),
  template: z.string().min(1),
  slug: z.string(),
  title: z.string().min(1),
})

const PAGE_TEMPLATE_DEFAULTS: Record<string, Record<string, unknown>> = {
  about: { title: 'Über uns', story: '', story2: '', team: [], imageUrl: '' },
  services: { title: 'Leistungen', intro: '', items: [] },
  contact: { title: 'Kontakt', address: '', phone: '', email: '', hours: '' },
  'legal-imprint': { companyName: '', legalForm: '', address: '', phone: '', email: '', vatId: '', registerCourt: '', registerNumber: '', ceo: '' },
  'legal-privacy': { companyName: '', address: '', email: '' },
  'custom-text': { title: 'Neue Seite', content: '' },
}

export async function GET(
  _request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const config = (result.data.site.draft_config || result.data.site.config) as SiteConfig

    if (!isMultiPageConfig(config)) {
      return NextResponse.json([{ pageKey: 'home', template: 'home', slug: '', title: 'Startseite' }])
    }

    const pages = Object.entries(config.pages).map(([key, page]) => ({
      pageKey: key,
      template: page.template,
      slug: page.slug,
      title: page.title,
    }))

    return NextResponse.json(pages)
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { supabase, site } = result.data
    const config = (site.draft_config || site.config) as SiteConfig

    if (!isMultiPageConfig(config)) {
      return NextResponse.json({ error: 'Site ist kein Multi-Page-Projekt' }, { status: 400 })
    }

    const body = await request.json()
    const parsed = AddPageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { pageKey, template, slug, title } = parsed.data

    if (config.pages[pageKey]) {
      return NextResponse.json({ error: 'Page-Key existiert bereits' }, { status: 409 })
    }

    const templateDefaults = PAGE_TEMPLATE_DEFAULTS[template] || { title, content: '' }

    const newConfig = {
      ...config,
      pages: {
        ...config.pages,
        [pageKey]: {
          template,
          slug,
          title,
          config: { ...templateDefaults, title },
        },
      },
      site: {
        ...config.site,
        navigation: [...config.site.navigation, pageKey],
      },
    }

    await supabase
      .from('sites')
      .update({ draft_config: newConfig, updated_at: new Date().toISOString() })
      .eq('id', params.siteId)

    return NextResponse.json({ pageKey, template, slug, title }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
