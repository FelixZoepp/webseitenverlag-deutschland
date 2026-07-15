/**
 * Einzelne SEO-Landingpage (Upsell #1):
 *   GET  → Vorschau-HTML (auch vor Freigabe, nur für den Eigentümer)
 *   POST → 1-Klick-Freigabe { aktion: 'freigeben' | 'ablehnen' }
 */
import { getOwnedSite } from '@/lib/api-helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { loadLibraryPage } from '@/lib/library/load'
import { renderLibraryPage } from '@/lib/library/render'
import type { LibraryDemoConfig } from '@/lib/pipeline/generate-library-content'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: { siteId: string; lpId: string } }
) {
  const result = await getOwnedSite(params.siteId)
  if (!result.ok) return result.response

  const { supabase } = result.data
  const { data: lp } = await supabase
    .from('seo_landingpages')
    .select('seiten_config')
    .eq('id', params.lpId)
    .eq('site_id', params.siteId)
    .maybeSingle()
  if (!lp?.seiten_config) {
    return NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 })
  }

  const config = lp.seiten_config as unknown as LibraryDemoConfig
  const loaded = await loadLibraryPage(createAdminClient(), config.library_page_key)
  const html = renderLibraryPage(config, loaded?.assets ?? [])

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'private, no-store',
    },
  })
}

export async function POST(
  request: Request,
  { params }: { params: { siteId: string; lpId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const body = await request.json().catch(() => ({}))
    const aktion = body.aktion === 'freigeben' ? 'freigeben' : body.aktion === 'ablehnen' ? 'ablehnen' : null
    if (!aktion) {
      return NextResponse.json({ error: 'aktion muss "freigeben" oder "ablehnen" sein' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: lp } = await admin
      .from('seo_landingpages')
      .select('id, status')
      .eq('id', params.lpId)
      .eq('site_id', params.siteId)
      .maybeSingle()
    if (!lp) return NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 })

    const update =
      aktion === 'freigeben'
        ? { status: 'FREIGEGEBEN', freigegeben_am: new Date().toISOString() }
        : { status: 'ABGELEHNT' }

    const { data: aktualisiert, error } = await admin
      .from('seo_landingpages')
      .update(update)
      .eq('id', params.lpId)
      .select('id, monat, keyword, slug, status, freigegeben_am')
      .single()
    if (error) throw new Error(error.message)

    return NextResponse.json({ seite: aktualisiert })
  } catch (e) {
    console.error('[seo/freigabe] Fehler:', e)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
