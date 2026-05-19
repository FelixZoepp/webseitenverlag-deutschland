import { getOwnedSite } from '@/lib/api-helpers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { supabase } = result.data
    const url = new URL(request.url)
    const days = Math.min(parseInt(url.searchParams.get('days') || '30'), 90)

    const since = new Date()
    since.setDate(since.getDate() - days)
    const sinceISO = since.toISOString()

    // Total pageviews in period
    const { count: totalViews } = await supabase
      .from('pageviews')
      .select('*', { count: 'exact', head: true })
      .eq('site_id', params.siteId)
      .gte('created_at', sinceISO)

    // Today's pageviews
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { count: todayViews } = await supabase
      .from('pageviews')
      .select('*', { count: 'exact', head: true })
      .eq('site_id', params.siteId)
      .gte('created_at', todayStart.toISOString())

    // Unique visitors (approximate by IP)
    const { data: uniqueData } = await supabase
      .from('pageviews')
      .select('ip_address')
      .eq('site_id', params.siteId)
      .gte('created_at', sinceISO)

    const uniqueVisitors = new Set((uniqueData || []).map((r) => r.ip_address)).size

    // Top pages
    const { data: pageData } = await supabase
      .from('pageviews')
      .select('page_path')
      .eq('site_id', params.siteId)
      .gte('created_at', sinceISO)

    const pageCounts: Record<string, number> = {}
    for (const row of pageData || []) {
      pageCounts[row.page_path] = (pageCounts[row.page_path] || 0) + 1
    }
    const topPages = Object.entries(pageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, views]) => ({ path, views }))

    // Top referrers
    const { data: refData } = await supabase
      .from('pageviews')
      .select('referrer')
      .eq('site_id', params.siteId)
      .gte('created_at', sinceISO)
      .neq('referrer', '')

    const refCounts: Record<string, number> = {}
    for (const row of refData || []) {
      try {
        const host = new URL(row.referrer).hostname
        refCounts[host] = (refCounts[host] || 0) + 1
      } catch {
        refCounts[row.referrer] = (refCounts[row.referrer] || 0) + 1
      }
    }
    const topReferrers = Object.entries(refCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([source, views]) => ({ source, views }))

    // Daily views for chart (last N days)
    const dailyViews: { date: string; views: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayStart = new Date(dateStr + 'T00:00:00Z').toISOString()
      const dayEnd = new Date(dateStr + 'T23:59:59Z').toISOString()

      const { count } = await supabase
        .from('pageviews')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', params.siteId)
        .gte('created_at', dayStart)
        .lte('created_at', dayEnd)

      dailyViews.push({ date: dateStr, views: count || 0 })
    }

    return NextResponse.json({
      totalViews: totalViews || 0,
      todayViews: todayViews || 0,
      uniqueVisitors,
      topPages,
      topReferrers,
      dailyViews,
      days,
    })
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
