/**
 * Stripe-Integration: Checkout-Sessions für den Closing-Flow.
 * Preise kommen inline aus lib/packages.ts — keine Produktpflege in Stripe nötig.
 */

import Stripe from 'stripe'
import { getPackage, PackageTier } from './packages'

let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY ist nicht gesetzt')
    stripeClient = new Stripe(key)
  }
  return stripeClient
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

/**
 * Erstellt eine Checkout-Session (Monats-Abo) für eine Demo.
 * Der Link wird im Closing an den Kunden gesendet.
 * Hinweis: Checkout-Links laufen nach 24h ab — bei Bedarf einfach neu erstellen.
 */
export async function createDemoCheckoutSession(params: {
  demoId: string
  prospectName: string
  paket: PackageTier
}): Promise<{ url: string; sessionId: string }> {
  const pkg = getPackage(params.paket)

  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    locale: 'de',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'eur',
          recurring: { interval: 'month' },
          unit_amount: pkg.price * 100,
          product_data: {
            name: `Website-Paket ${pkg.name} — ${params.prospectName}`,
            description: `Professionelle Website inkl. Hosting, KI-Editor & Support (${pkg.price} €/Monat)`,
          },
        },
      },
    ],
    metadata: {
      demo_id: params.demoId,
      paket: params.paket,
    },
    subscription_data: {
      metadata: {
        demo_id: params.demoId,
        paket: params.paket,
      },
    },
    success_url: `${APP_URL}/willkommen?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/willkommen?abgebrochen=1`,
  })

  if (!session.url) throw new Error('Stripe hat keine Checkout-URL zurückgegeben')
  return { url: session.url, sessionId: session.id }
}
