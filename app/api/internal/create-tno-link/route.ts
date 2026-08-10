import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Temporäre Route — nach Nutzung entfernen
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('key') !== 'tno-2026') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    locale: 'de',
    payment_method_types: ['card', 'sepa_debit'],
    line_items: [{
      quantity: 1,
      price_data: {
        currency: 'eur',
        recurring: { interval: 'month' },
        unit_amount: 9900,
        product_data: {
          name: 'TNO Industriesparring — Webseite Starter',
          description: 'Professionelle Webseite inkl. Hosting, SSL, SEO-Grundoptimierung, Kontaktformular. 99 €/Monat netto.',
        },
      },
    }],
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
        custom_price_cent: '9900',
      },
      description: 'Servicepauschale 99 €/Monat — TNO Industriesparring',
    },
    metadata: {
      demo_id: '9760c44d-ceb1-4c4d-9f85-0387dbf43ff8',
      lead_id: '9760c44d-ceb1-4c4d-9f85-0387dbf43ff8',
      paket: 'starter',
      plan: 'starter',
      agb_version: '1.1',
    },
    custom_text: {
      submit: { message: 'Mit der Buchung akzeptieren Sie die AGB (v1.1). Mindestlaufzeit: 24 Monate. Kostenlose Testphase bis 01.09.2026, danach 99 €/Monat netto.' },
    },
    consent_collection: { terms_of_service: 'required' },
    success_url: 'https://webseitenverlag-deutschland.vercel.app/willkommen?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://webseitenverlag-deutschland.vercel.app/',
  })

  return NextResponse.json({ url: session.url, sessionId: session.id })
}
