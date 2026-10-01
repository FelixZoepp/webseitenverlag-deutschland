import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  const { siteId } = params
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Prüfen ob Site zum User gehört
  const { data: site } = await supabase
    .from('sites')
    .select('id, customer_id')
    .eq('id', siteId)
    .single()

  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', user.id)
    .eq('id', site.customer_id)
    .single()

  if (!customer) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()

  const config = {
    enabled: Boolean(body.enabled),
    delay_days: Math.max(1, Math.min(90, Number(body.delay_days) || 14)),
    google_review_url: String(body.google_review_url || '').trim(),
    absender_name: String(body.absender_name || '').trim(),
    betreff: String(body.betreff || 'Waren Sie zufrieden mit uns?').trim(),
    nachricht: String(body.nachricht || '').trim(),
  }

  const { error } = await supabase
    .from('sites')
    .update({ review_autopilot: config })
    .eq('id', siteId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
