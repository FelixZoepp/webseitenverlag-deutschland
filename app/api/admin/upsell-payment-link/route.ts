/**
 * Kaufweg 1 (§10.4): 1-Klick-Zahlungslink aus dem Ops-Dashboard.
 * Admin erzeugt eine Checkout-URL für einen Kunden (z. B. nach Telefonat)
 * und verschickt sie manuell. Hinweis: Checkout-Links laufen nach 24h ab.
 */
import { requireAdmin } from '@/lib/auth-helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { starteUpsellKauf } from '@/lib/upsell-kauf'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const LinkSchema = z.object({
  customer_id: z.string().uuid(),
  site_id: z.string().uuid().optional(),
  product_key: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const parsed = LinkSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { data: kunde } = await adminClient
      .from('customers')
      .select('id, package')
      .eq('id', parsed.data.customer_id)
      .maybeSingle()
    if (!kunde) {
      return NextResponse.json({ error: 'Kunde nicht gefunden' }, { status: 404 })
    }

    const kauf = await starteUpsellKauf(adminClient, {
      customerId: kunde.id,
      siteId: parsed.data.site_id,
      productKey: parsed.data.product_key,
      quelle: 'admin',
      aktuellesTier: kunde.package || 'starter',
    })

    if (!kauf.ok) {
      return NextResponse.json({ error: kauf.fehler }, { status: kauf.status })
    }

    return NextResponse.json({ url: kauf.url, orderId: kauf.orderId })
  } catch (err) {
    console.error('Upsell-Payment-Link error:', err)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
