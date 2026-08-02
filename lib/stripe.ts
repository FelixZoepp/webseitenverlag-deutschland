/**
 * Stripe-Integration: Checkout-Sessions für den Closing-Flow.
 * Preise kommen inline aus lib/packages.ts — keine Produktpflege in Stripe nötig.
 * Custom-Pricing (Spezial-Deals) über optionalen customPriceCent-Parameter.
 */

import Stripe from 'stripe'
import { getPackage, PackageTier } from './packages'
import { vertragsKonditionenText } from '@/config/vertraege'
import { getStripePriceId } from '@/config/stripe-produkte'

/** AGB-Version, die beim Checkout akzeptiert wird. Bei Änderung hier erhöhen. */
export const AGB_VERSION = '1.1'

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
 *
 * customPriceCent: Spezial-Deal-Preis in Cent (z.B. 14900 für 149€/Monat).
 * Wenn gesetzt, überschreibt er den Paketpreis.
 */
export async function createDemoCheckoutSession(params: {
  demoId: string
  prospectName: string
  paket: PackageTier
  /** Optional: bereits bekannte Site (Demo-Site) für die Webhook-Metadata */
  siteId?: string
  /** Optional: Custom-Preis in Cent — überschreibt den Paketpreis (Spezial-Deals) */
  customPriceCent?: number
  /** Optional: Custom-Produktname für den Checkout */
  customProductName?: string
}): Promise<{ url: string; sessionId: string }> {
  const pkg = getPackage(params.paket)
  const priceCent = params.customPriceCent ?? pkg.price * 100
  const produktName = params.customProductName ?? `Website-Paket ${pkg.name} — ${params.prospectName}`

  const konditionen = vertragsKonditionenText()
  const priceId = params.customPriceCent ? null : getStripePriceId(params.paket)

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    priceId
      ? { quantity: 1, price: priceId }
      : {
          quantity: 1,
          price_data: {
            currency: 'eur',
            recurring: { interval: 'month' },
            unit_amount: priceCent,
            product_data: {
              name: produktName,
              description: params.customPriceCent
                ? `Individuelle Servicepauschale — ${(priceCent / 100).toFixed(0)} €/Monat netto`
                : pkg.stripeDescription,
            },
          },
        },
  ]

  if (!params.customPriceCent && pkg.setupFee > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: 'eur',
        unit_amount: pkg.setupFee * 100,
        product_data: { name: `Einrichtung ${pkg.name} (einmalig)` },
      },
    })
  }

  const metadata = {
    demo_id: params.demoId,
    lead_id: params.demoId,
    site_id: params.siteId || '',
    paket: params.paket,
    plan: params.paket,
    agb_version: AGB_VERSION,
    ...(params.customPriceCent ? { custom_price_cent: String(priceCent) } : {}),
  }

  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    locale: 'de',
    payment_method_types: ['card', 'sepa_debit'],
    custom_text: {
      submit: { message: konditionen },
      terms_of_service_acceptance: { message: konditionen },
    },
    consent_collection: { terms_of_service: 'required' },
    line_items: lineItems,
    metadata,
    subscription_data: {
      metadata,
      description: `Servicepauschale ${(priceCent / 100).toFixed(0)} €/Monat — ${params.prospectName}`,
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
