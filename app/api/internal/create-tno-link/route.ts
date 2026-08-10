import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('key') !== 'tno-2026') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const key = (process.env.STRIPE_SECRET_KEY || '').replace(/\s+/g, '')
  if (!key) return NextResponse.json({ error: 'STRIPE_SECRET_KEY fehlt' }, { status: 500 })
  const stripe = new Stripe(key)

  try {
    // Erst Produkt + Preis erstellen
    const product = await stripe.products.create({
      name: 'TNO Industriesparring — Webseite Starter',
      description: 'Professionelle Webseite inkl. Hosting, SSL, SEO-Grundoptimierung, Kontaktformular. 99 €/Monat netto. Mindestlaufzeit 24 Monate.',
      tax_code: 'txcd_10103001', // SaaS / Digital Services
      metadata: {
        demo_id: '9760c44d-ceb1-4c4d-9f85-0387dbf43ff8',
        paket: 'starter',
        prospect_name: 'TNO Industriesparring',
      },
    })

    const price = await stripe.prices.create({
      product: product.id,
      currency: 'eur',
      unit_amount: 9900,
      recurring: { interval: 'month' },
    })

    // Payment Link (buy.stripe.com)
    const link = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      subscription_data: {
        trial_period_days: 22,
        metadata: {
          demo_id: '9760c44d-ceb1-4c4d-9f85-0387dbf43ff8',
          lead_id: '9760c44d-ceb1-4c4d-9f85-0387dbf43ff8',
          paket: 'starter',
          plan: 'starter',
          agb_version: '1.1',
          prospect_name: 'TNO Industriesparring',
          laufzeit_monate: '24',
        },
        description: 'Servicepauschale 99 €/Monat — TNO Industriesparring',
      },
      after_completion: {
        type: 'redirect',
        redirect: { url: 'https://webseitenverlag-deutschland.vercel.app/willkommen' },
      },
    })

    return NextResponse.json({ url: link.url, id: link.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
