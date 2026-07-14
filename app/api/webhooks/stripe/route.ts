/**
 * Stripe-Webhook: checkout.session.completed → Auto-Provisioning.
 * Kunde zahlt → Auth-User + Kundenprofil + Site aus der Demo → Zugangsmail.
 * Kein manueller Schritt zwischen Zahlung und Kundenzugang.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { sendInvitationEmail } from '@/lib/email'

export const maxDuration = 60

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[STRIPE] STRIPE_WEBHOOK_SECRET ist nicht gesetzt')
    return NextResponse.json({ error: 'Webhook nicht konfiguriert' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Signatur fehlt' }, { status: 400 })
  }

  const rawBody = await request.text()
  let event: Stripe.Event
  try {
    event = await getStripe().webhooks.constructEventAsync(rawBody, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Ungültige Signatur' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const demoId = session.metadata?.demo_id
  const paket = session.metadata?.paket || 'starter'
  if (!demoId) return NextResponse.json({ received: true })

  const supabase = getServiceClient()

  const { data: demo } = await supabase
    .from('demos')
    .select('*')
    .eq('id', demoId)
    .single()

  if (!demo) {
    console.error(`[STRIPE] Demo ${demoId} nicht gefunden`)
    return NextResponse.json({ received: true })
  }

  // Idempotenz: Stripe sendet Events ggf. mehrfach
  if (demo.status === 'CONVERTED' && demo.converted_customer_id) {
    return NextResponse.json({ received: true })
  }

  const email = session.customer_details?.email
  if (!email) {
    console.error(`[STRIPE] Keine E-Mail in Checkout-Session ${session.id}`)
    return NextResponse.json({ received: true })
  }

  const companyName = demo.prospect_name
  const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null
  const stripeSubscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || null

  // 1. Auth-User anlegen (oder bestehenden übernehmen und Passwort neu setzen)
  const tempPassword = randomBytes(6).toString('base64url') + randomBytes(2).toString('hex').toUpperCase() + '!'
  let userId: string | null = null

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  })

  if (created?.user) {
    userId = created.user.id
  } else if (createError) {
    // User existiert bereits → über bestehendes Kundenprofil auflösen und Passwort zurücksetzen
    const { data: existing } = await supabase
      .from('customers')
      .select('user_id')
      .eq('contact_email', email)
      .not('user_id', 'is', null)
      .limit(1)
      .maybeSingle()

    if (existing?.user_id) {
      userId = existing.user_id
      await supabase.auth.admin.updateUserById(userId!, { password: tempPassword })
    } else {
      console.error(`[STRIPE] User-Erstellung fehlgeschlagen für ${email}: ${createError.message}`)
      // 500 → Stripe wiederholt den Webhook
      return NextResponse.json({ error: 'Provisioning fehlgeschlagen' }, { status: 500 })
    }
  }

  // 2. Kundenprofil anlegen (oder bestehendes aktualisieren)
  let customerId: string
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (existingCustomer) {
    customerId = existingCustomer.id
    await supabase
      .from('customers')
      .update({
        package: paket,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
      })
      .eq('id', customerId)
  } else {
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        user_id: userId,
        company_name: companyName,
        contact_email: email,
        role: 'customer',
        package: paket,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        onboarding_status: 'AUSSTEHEND',
      })
      .select('id')
      .single()

    if (customerError || !customer) {
      console.error(`[STRIPE] Kundenprofil fehlgeschlagen: ${customerError?.message}`)
      return NextResponse.json({ error: 'Provisioning fehlgeschlagen' }, { status: 500 })
    }
    customerId = customer.id
  }

  // 3. Demo → Site konvertieren (Kunde startet mit der Demo, die er gekauft hat)
  const { error: siteError } = await supabase.from('sites').insert({
    customer_id: customerId,
    name: companyName,
    template_id: demo.template_id,
    config: demo.config || {},
    draft_config: demo.config || {},
    status: 'draft',
    package: paket,
  })

  if (siteError) {
    console.error(`[STRIPE] Site-Erstellung fehlgeschlagen: ${siteError.message}`)
    return NextResponse.json({ error: 'Provisioning fehlgeschlagen' }, { status: 500 })
  }

  // 4. Demo als konvertiert markieren
  await supabase
    .from('demos')
    .update({
      status: 'CONVERTED',
      converted_customer_id: customerId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', demoId)

  // 5. Zugangsmail senden (Fehler blockiert das Provisioning nicht — Stripe nicht erneut triggern)
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'}/login`
  const mail = await sendInvitationEmail(email, companyName, loginUrl, tempPassword)
  if (!mail.success) {
    console.error(`[STRIPE] Zugangsmail an ${email} fehlgeschlagen: ${mail.error}`)
  }

  console.log(`[STRIPE] Demo ${demoId} → Kunde ${customerId} provisioniert (${paket})`)
  return NextResponse.json({ received: true })
}
