import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { createDemoCheckoutSession } from '@/lib/stripe'
import { PACKAGES, PackageTier } from '@/lib/packages'

export async function POST(
  request: Request,
  { params }: { params: { demoId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const { supabase } = auth.data

  const body = await request.json().catch(() => null)
  const paket = typeof body?.paket === 'string' ? body.paket : ''
  if (!PACKAGES.some((p) => p.id === paket)) {
    return NextResponse.json({ error: 'Ungültiges Paket' }, { status: 400 })
  }

  const { data: demo, error: loadError } = await supabase
    .from('demos')
    .select('id, prospect_name, status')
    .eq('id', params.demoId)
    .single()

  if (loadError || !demo) {
    return NextResponse.json({ error: 'Demo nicht gefunden' }, { status: 404 })
  }
  if (demo.status === 'CONVERTED') {
    return NextResponse.json({ error: 'Demo wurde bereits konvertiert' }, { status: 400 })
  }

  let url: string
  let sessionId: string
  try {
    const session = await createDemoCheckoutSession({
      demoId: demo.id,
      prospectName: demo.prospect_name,
      paket: paket as PackageTier,
    })
    url = session.url
    sessionId = session.sessionId
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Stripe-Fehler' },
      { status: 500 }
    )
  }

  const { error } = await supabase
    .from('demos')
    .update({
      paket,
      checkout_session_id: sessionId,
      payment_link_url: url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', demo.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ url, paket })
}
