/**
 * Stripe-Integration: Checkout-Sessions für den Closing-Flow.
 * Preise kommen inline aus lib/packages.ts — keine Produktpflege in Stripe nötig.
 */

import Stripe from 'stripe'
import { getPackage, PackageTier } from './packages'
import { vertragsKonditionenText } from '@/config/vertraege'

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

  // Vertragskonditionen transparent im Checkout (24/12/3 aus config/vertraege.ts).
  // Consent-Checkbox (consent_collection) braucht eine in den Stripe-Settings
  // hinterlegte AGB-URL — sonst lehnt die API die Session ab. Deshalb erst
  // aktiv, wenn STRIPE_TOS_CONSENT=1 gesetzt ist (WARTELISTE).
  const konditionen = vertragsKonditionenText()
  const mitConsent = process.env.STRIPE_TOS_CONSENT === '1'

  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    locale: 'de',
    custom_text: {
      submit: { message: konditionen },
      ...(mitConsent ? { terms_of_service_acceptance: { message: konditionen } } : {}),
    },
    ...(mitConsent ? { consent_collection: { terms_of_service: 'required' as const } } : {}),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'eur',
          recurring: { interval: 'month' },
          unit_amount: pkg.price * 100,
          product_data: {
            name: `Website-Paket ${pkg.name} — ${params.prospectName}`,
            description: pkg.stripeDescription,
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
    cancel_url: `${APP_URL}/`,
  })

  if (!session.url) throw new Error('Stripe hat keine Checkout-URL zurückgegeben')
  return { url: session.url, sessionId: session.id }
}

/**
 * Checkout-Session für Upsells/Upgrades (§10.4).
 * Monatlicher Anteil → subscription-Mode (einmaliger Anteil als Zusatzposten),
 * rein einmalig → payment-Mode. metadata.product_key steuert den Webhook.
 */
export async function createUpsellCheckoutSession(params: {
  orderId: string
  productKey: string
  produktName: string
  einmalCent: number
  monatCent: number
  customerId: string
  siteId?: string
  successUrl: string
  cancelUrl: string
}): Promise<{ url: string; sessionId: string }> {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []

  if (params.monatCent > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: 'eur',
        recurring: { interval: 'month' },
        unit_amount: params.monatCent,
        product_data: { name: params.produktName },
      },
    })
  }
  if (params.einmalCent > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: 'eur',
        unit_amount: params.einmalCent,
        product_data: { name: `${params.produktName} — Einrichtung (einmalig)` },
      },
    })
  }
  if (lineItems.length === 0) throw new Error('Produkt ohne Preis')

  const metadata = {
    product_key: params.productKey,
    order_id: params.orderId,
    customer_id: params.customerId,
    site_id: params.siteId || '',
  }

  const session = await getStripe().checkout.sessions.create({
    mode: params.monatCent > 0 ? 'subscription' : 'payment',
    locale: 'de',
    line_items: lineItems,
    metadata,
    ...(params.monatCent > 0 ? { subscription_data: { metadata } } : {}),
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  })

  if (!session.url) throw new Error('Stripe hat keine Checkout-URL zurückgegeben')
  return { url: session.url, sessionId: session.id }
}
