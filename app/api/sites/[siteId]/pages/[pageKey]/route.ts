import { getOwnedSite } from '@/lib/api-helpers'
import { NextResponse } from 'next/server'
import { SiteConfig, isMultiPageConfig } from '@/types'

export async function GET(
  _request: Request,
  { params }: { params: { siteId: string; pageKey: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const config = (result.data.site.draft_config || result.data.site.config) as SiteConfig
    if (!isMultiPageConfig(config) || !config.pages[params.pageKey]) {
      return NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json({
      pageKey: params.pageKey,
      ...config.pages[params.pageKey],
    })
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { siteId: string; pageKey: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { supabase, site } = result.data
    const config = (site.draft_config || site.config) as SiteConfig

    if (!isMultiPageConfig(config) || !config.pages[params.pageKey]) {
      return NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 })
    }

    const body = await request.json()
    const currentPage = config.pages[params.pageKey]

    const updatedPage = {
      ...currentPage,
      ...(body.title !== undefined && { title: body.title }),
      ...(body.slug !== undefined && { slug: body.slug }),
      config: body.config ? { ...currentPage.config, ...body.config } : currentPage.config,
    }

    const newConfig = {
      ...config,
      ...(body.site ? { site: { ...config.site, ...body.site } } : {}),
      pages: { ...config.pages, [params.pageKey]: updatedPage },
    }

    await supabase
      .from('sites')
      .update({ draft_config: newConfig, updated_at: new Date().toISOString() })
      .eq('id', params.siteId)

    return NextResponse.json(updatedPage)
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { siteId: string; pageKey: string } }
) {
  try {
    if (params.pageKey === 'home') {
      return NextResponse.json({ error: 'Die Startseite kann nicht gelöscht werden' }, { status: 400 })
    }

    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { supabase, site } = result.data
    const config = (site.draft_config || site.config) as SiteConfig

    if (!isMultiPageConfig(config) || !config.pages[params.pageKey]) {
      return NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [params.pageKey]: _removed, ...remainingPages } = config.pages

    const newConfig = {
      ...config,
      pages: remainingPages,
      site: {
        ...config.site,
        navigation: config.site.navigation.filter((k) => k !== params.pageKey),
      },
    }

    await supabase
      .from('sites')
      .update({ draft_config: newConfig, updated_at: new Date().toISOString() })
      .eq('id', params.siteId)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
