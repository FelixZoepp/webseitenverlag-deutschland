/**
 * SEO-Landingpages einer Site (Upsell #1): Liste für das Portal.
 */
import { getOwnedSite } from '@/lib/api-helpers'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: { siteId: string } }
) {
  const result = await getOwnedSite(params.siteId)
  if (!result.ok) return result.response

  const { supabase } = result.data
  const { data: seiten } = await supabase
    .from('seo_landingpages')
    .select('id, monat, keyword, slug, status, seo_check, freigegeben_am, created_at')
    .eq('site_id', params.siteId)
    .order('monat', { ascending: false })

  return NextResponse.json({ seiten: seiten || [] })
}
