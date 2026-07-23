import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { createDemoCheckoutSession } from '@/lib/stripe'
import { PACKAGES, PackageTier } from '@/lib/packages'
import { seitenModusFuerTier } from '@/config/plans'

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
    .select('id, prospect_name, status, config')
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

  // Paket-Rezept (config/plans.ts): Paket-Wechsel zieht den Seiten-Modus mit —
  // sonst rendert eine Starter-Demo weiter als Multipage (oder umgekehrt).
  const config = demo.config as { engine?: string; seiten_modus?: string } | null
  const configUpdate =
    config?.engine === 'flagship'
      ? { config: { ...config, seiten_modus: seitenModusFuerTier(paket) } }
      : {}

  const { error } = await supabase
    .from('demos')
    .update({
      paket,
      checkout_session_id: sessionId,
      payment_link_url: url,
      updated_at: new Date().toISOString(),
      ...configUpdate,
    })
    .eq('id', demo.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ url, paket })
}
