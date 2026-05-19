import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function POST(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const body = await request.json().catch(() => ({}))
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const userAgent = request.headers.get('user-agent') || ''

    await supabase.from('pageviews').insert({
      site_id: params.siteId,
      page_path: String(body.page || '/').slice(0, 500),
      referrer: String(body.referrer || '').slice(0, 1000),
      screen_size: String(body.screen || '').slice(0, 20),
      ip_address: ip,
      user_agent: userAgent,
    })

    return new NextResponse(null, { status: 204, headers: corsHeaders })
  } catch {
    return new NextResponse(null, { status: 204, headers: corsHeaders })
  }
}
