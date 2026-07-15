/**
 * Stripe Customer Portal (Phase G §11): Kunde verwaltet Zahlungsmethode
 * und sieht Rechnungen direkt bei Stripe. Auth über getOwnedSite,
 * benötigt customers.stripe_customer_id (gesetzt beim ersten Checkout).
 */
import { NextResponse } from 'next/server'
import { getOwnedSite } from '@/lib/api-helpers'
import { getStripe } from '@/lib/stripe'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

export async function POST(
  _request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { customer } = result.data as { customer: Record<string, string | null> }
    const stripeCustomerId = customer.stripe_customer_id
    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'Noch kein Zahlungskonto hinterlegt. Bitte melden Sie sich beim Support.' },
        { status: 404 }
      )
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${APP_URL}/dashboard/${params.siteId}/rechnungen`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Billing-Portal error:', err)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
