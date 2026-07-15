/**
 * Kaufweg 2 (§10.4): Buchen-Button im Kundenportal.
 * Auth über getOwnedSite, Order-Insert über Service-Role (RLS-Schreibzugriff
 * auf upsell_orders ist admin-only). Antwort: Stripe-Checkout-URL.
 */
import { getOwnedSite } from '@/lib/api-helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { starteUpsellKauf } from '@/lib/upsell-kauf'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const CheckoutSchema = z.object({
  product_key: z.string().min(1),
  quelle: z.enum(['wizard', 'editor-gate', 'portal']).optional(),
})

export async function POST(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { site, customer } = result.data as {
      site: Record<string, unknown>
      customer: Record<string, string>
    }

    const body = await request.json()
    const parsed = CheckoutSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
    }

    const kauf = await starteUpsellKauf(createAdminClient(), {
      customerId: customer.id,
      siteId: params.siteId,
      productKey: parsed.data.product_key,
      quelle: parsed.data.quelle || 'portal',
      aktuellesTier: (site.package as string) || customer.package || 'starter',
    })

    if (!kauf.ok) {
      return NextResponse.json({ error: kauf.fehler }, { status: kauf.status })
    }

    return NextResponse.json({ url: kauf.url })
  } catch (err) {
    console.error('Upsell-Checkout error:', err)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
