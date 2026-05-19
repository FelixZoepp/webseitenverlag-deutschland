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
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    let query = supabase
      .from('form_submissions')
      .select('*', { count: 'exact' })
      .eq('site_id', params.siteId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (search) {
      query = query.or(`sender_name.ilike.%${search}%,sender_email.ilike.%${search}%`)
    }

    const { data, count, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
    }

    // Get counts per status
    const { data: allSubs } = await supabase
      .from('form_submissions')
      .select('status')
      .eq('site_id', params.siteId)

    const counts = { all: 0, new: 0, read: 0, archived: 0, spam: 0 }
    for (const s of allSubs || []) {
      counts.all++
      const st = s.status as keyof typeof counts
      if (st in counts) counts[st]++
    }

    return NextResponse.json({ submissions: data || [], total: count || 0, counts, page, limit })
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
