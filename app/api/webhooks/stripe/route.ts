/**
 * Stripe-Webhook (Phase E, Mission §9):
 *   checkout.session.completed   → Auto-Provisioning + Vertrag (24/24/3)
 *   invoice.paid                 → Mahnstufe zurücksetzen, Site entsperren
 *   invoice.payment_failed       → Dunning (Stufe 1–3, Stufe 3 sperrt die Site)
 *   customer.subscription.updated→ Kündigung via Stripe (cancel_at_period_end)
 *   customer.subscription.deleted→ Vertrag beendet, Site gesperrt
 *
 * Zero-Fulfillment-Prinzip: Alles, was nicht automatisch klappt, wird als
 * manual_task sichtbar — der Webhook schlägt nur fehl (500 → Stripe-Retry),
 * wenn das Kern-Provisioning (User/Kunde/Site) scheitert.
 */

import { NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { sendDunningEmail, sendInvitationEmail } from '@/lib/email'
import { getPackage, type PackageTier } from '@/lib/packages'
import {
  createManualTask,
  heuteIso,
  STANDARD_KONDITIONEN,
  vertragsende,
  wirksamesKuendigungsdatum,
} from '@/lib/contracts'

export const maxDuration = 60

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const OK = () => NextResponse.json({ received: true })

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

  const supabase = getServiceClient()

  switch (event.type) {
    case 'checkout.session.completed':
      return handleCheckoutCompleted(supabase, event.data.object as Stripe.Checkout.Session)
    case 'invoice.paid':
      return handleInvoicePaid(supabase, event.data.object as Stripe.Invoice)
    case 'invoice.payment_failed':
      return handlePaymentFailed(supabase, event.data.object as Stripe.Invoice)
    case 'customer.subscription.updated':
      return handleSubscriptionUpdated(supabase, event.data.object as Stripe.Subscription)
    case 'customer.subscription.deleted':
      return handleSubscriptionDeleted(supabase, event.data.object as Stripe.Subscription)
    default:
      return OK()
  }
}

// ------------------------------------------------------------
// checkout.session.completed → Provisioning + Vertrag
// ------------------------------------------------------------

async function handleCheckoutCompleted(supabase: SupabaseClient, session: Stripe.Checkout.Session) {
  const demoId = session.metadata?.demo_id
  const paket = session.metadata?.paket || 'starter'
  if (!demoId) return OK()

  const { data: demo } = await supabase
    .from('demos')
    .select('*')
    .eq('id', demoId)
    .single()

  if (!demo) {
    console.error(`[STRIPE] Demo ${demoId} nicht gefunden`)
    return OK()
  }

  // Idempotenz: Stripe sendet Events ggf. mehrfach
  if (demo.status === 'CONVERTED' && demo.converted_customer_id) {
    return OK()
  }

  const email = session.customer_details?.email
  if (!email) {
    console.error(`[STRIPE] Keine E-Mail in Checkout-Session ${session.id}`)
    return OK()
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
  const beginn = heuteIso()
  const ende = vertragsende(beginn, STANDARD_KONDITIONEN.laufzeit_monate)
  const pkg = getPackage(paket as PackageTier)

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
        monthly_price: pkg.price,
        contract_start: beginn,
        contract_end: ende,
        vertrags_status: 'ZAHLUNG_AKTIV',
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
        monthly_price: pkg.price,
        contract_start: beginn,
        contract_end: ende,
        vertrags_status: 'ZAHLUNG_AKTIV',
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
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .insert({
      customer_id: customerId,
      name: companyName,
      template_id: demo.template_id,
      config: demo.config || {},
      draft_config: demo.config || {},
      status: 'draft',
      package: paket,
    })
    .select('id')
    .single()

  if (siteError || !site) {
    console.error(`[STRIPE] Site-Erstellung fehlgeschlagen: ${siteError?.message}`)
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

  // 5. Vertrag anlegen (24/24/3) — Fehler blockiert das Provisioning nicht,
  //    sondern wird als manuelle Aufgabe sichtbar (Demo ist bereits CONVERTED,
  //    ein Stripe-Retry würde sonst doppelt provisionieren)
  const { data: existingContract } = stripeSubscriptionId
    ? await supabase
        .from('contracts')
        .select('id')
        .eq('stripe_subscription_id', stripeSubscriptionId)
        .maybeSingle()
    : { data: null }

  if (!existingContract) {
    const { error: contractError } = await supabase.from('contracts').insert({
      customer_id: customerId,
      site_id: site.id,
      demo_id: demoId,
      paket,
      monatsrate_cent: pkg.price * 100,
      laufzeit_monate: STANDARD_KONDITIONEN.laufzeit_monate,
      verlaengerung_monate: STANDARD_KONDITIONEN.verlaengerung_monate,
      kuendigungsfrist_monate: STANDARD_KONDITIONEN.kuendigungsfrist_monate,
      beginn,
      ende,
      status: 'AKTIV',
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      letzte_zahlung_am: beginn,
    })
    if (contractError) {
      console.error(`[STRIPE] Vertragsanlage fehlgeschlagen: ${contractError.message}`)
      await createManualTask(supabase, {
        typ: 'PROVISIONING_LUECKE',
        titel: `Vertrag manuell anlegen: ${companyName}`,
        beschreibung: `Checkout ${session.id} erfolgreich provisioniert, aber contracts-Insert schlug fehl: ${contractError.message}. Paket ${paket}, Beginn ${beginn}. (Migration 018 ausgeführt?)`,
        customer_id: customerId,
        demo_id: demoId,
        quelle: 'stripe-webhook',
      })
    }
  }

  // 6. Zugangsmail senden (Fehler blockiert das Provisioning nicht — Stripe nicht erneut triggern)
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'}/login`
  const mail = await sendInvitationEmail(email, companyName, loginUrl, tempPassword)
  if (!mail.success) {
    console.error(`[STRIPE] Zugangsmail an ${email} fehlgeschlagen: ${mail.error}`)
    await createManualTask(supabase, {
      typ: 'MAIL_FEHLGESCHLAGEN',
      titel: `Zugangsmail fehlgeschlagen: ${companyName}`,
      beschreibung: `Zugangsmail an ${email} kam nicht durch (${mail.error}). Passwort-Reset-Link manuell senden — das temporäre Passwort wird nicht gespeichert.`,
      customer_id: customerId,
      quelle: 'stripe-webhook',
    })
  }

  console.log(`[STRIPE] Demo ${demoId} → Kunde ${customerId} provisioniert (${paket})`)
  return OK()
}

// ------------------------------------------------------------
// Dunning & Kündigung
// ------------------------------------------------------------

interface ContractRow {
  id: string
  customer_id: string
  site_id: string | null
  status: string
  mahnstufe: number
  ende: string
  laufzeit_monate: number
  verlaengerung_monate: number
  kuendigungsfrist_monate: number
  gekuendigt_am: string | null
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const sub = invoice.parent?.subscription_details?.subscription
  if (!sub) return null
  return typeof sub === 'string' ? sub : sub.id
}

async function findContract(
  supabase: SupabaseClient,
  stripeSubscriptionId: string | null,
  stripeCustomerId: string | null
): Promise<ContractRow | null> {
  const spalten =
    'id, customer_id, site_id, status, mahnstufe, ende, laufzeit_monate, verlaengerung_monate, kuendigungsfrist_monate, gekuendigt_am'
  if (stripeSubscriptionId) {
    const { data } = await supabase
      .from('contracts')
      .select(spalten)
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .maybeSingle()
    if (data) return data as ContractRow
  }
  if (stripeCustomerId) {
    const { data } = await supabase
      .from('contracts')
      .select(spalten)
      .eq('stripe_customer_id', stripeCustomerId)
      .neq('status', 'BEENDET')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (data) return data as ContractRow
  }
  return null
}

async function kundenKontakt(
  supabase: SupabaseClient,
  customerId: string
): Promise<{ email: string | null; name: string }> {
  const { data } = await supabase
    .from('customers')
    .select('contact_email, company_name')
    .eq('id', customerId)
    .maybeSingle()
  return { email: data?.contact_email ?? null, name: data?.company_name ?? 'Kunde' }
}

async function setzeSiteSperre(supabase: SupabaseClient, contract: ContractRow, gesperrt: boolean) {
  if (contract.site_id) {
    await supabase.from('sites').update({ gesperrt }).eq('id', contract.site_id)
  } else {
    await supabase.from('sites').update({ gesperrt }).eq('customer_id', contract.customer_id)
  }
}

async function handleInvoicePaid(supabase: SupabaseClient, invoice: Stripe.Invoice) {
  const subId = invoiceSubscriptionId(invoice)
  const custId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id ?? null
  const contract = await findContract(supabase, subId, custId)
  if (!contract) return OK()

  const warGesperrt = contract.mahnstufe >= 3
  await supabase
    .from('contracts')
    .update({
      mahnstufe: 0,
      zahlung_ueberfaellig_seit: null,
      letzte_zahlung_am: heuteIso(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', contract.id)

  if (warGesperrt) {
    await setzeSiteSperre(supabase, contract, false)
    console.log(`[STRIPE] Zahlung eingegangen — Site für Vertrag ${contract.id} entsperrt`)
  }
  return OK()
}

async function handlePaymentFailed(supabase: SupabaseClient, invoice: Stripe.Invoice) {
  const subId = invoiceSubscriptionId(invoice)
  const custId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id ?? null
  const contract = await findContract(supabase, subId, custId)
  if (!contract) {
    console.warn(`[STRIPE] payment_failed ohne passenden Vertrag (sub ${subId ?? '—'}, cust ${custId ?? '—'})`)
    return OK()
  }

  const neueStufe = Math.min(3, (contract.mahnstufe ?? 0) + 1)
  await supabase
    .from('contracts')
    .update({
      mahnstufe: neueStufe,
      zahlung_ueberfaellig_seit: contract.mahnstufe === 0 ? heuteIso() : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contract.id)

  const kontakt = await kundenKontakt(supabase, contract.customer_id)
  if (kontakt.email) {
    const mail = await sendDunningEmail(kontakt.email, kontakt.name, neueStufe)
    if (!mail.success) {
      await createManualTask(supabase, {
        typ: 'MAIL_FEHLGESCHLAGEN',
        titel: `Mahnmail (Stufe ${neueStufe}) fehlgeschlagen: ${kontakt.name}`,
        beschreibung: `Mahnmail an ${kontakt.email} kam nicht durch: ${mail.error}`,
        customer_id: contract.customer_id,
        contract_id: contract.id,
        quelle: 'stripe-webhook',
      })
    }
  }

  if (neueStufe >= 3) {
    await setzeSiteSperre(supabase, contract, true)
    await createManualTask(supabase, {
      typ: 'DUNNING_ESKALIERT',
      titel: `Zahlung ausgefallen (Stufe 3) — Site gesperrt: ${kontakt.name}`,
      beschreibung: `Dritte fehlgeschlagene Abbuchung. Site wurde automatisch gesperrt. Kunden kontaktieren / weiteres Vorgehen entscheiden.`,
      customer_id: contract.customer_id,
      contract_id: contract.id,
      quelle: 'stripe-webhook',
    })
  }

  console.log(`[STRIPE] payment_failed → Vertrag ${contract.id} Mahnstufe ${neueStufe}`)
  return OK()
}

async function handleSubscriptionUpdated(supabase: SupabaseClient, subscription: Stripe.Subscription) {
  // Nur relevant, wenn der Kunde/Stripe die Kündigung zum Periodenende gesetzt hat
  if (!subscription.cancel_at_period_end) return OK()

  const contract = await findContract(
    supabase,
    subscription.id,
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id ?? null
  )
  if (!contract || contract.status !== 'AKTIV') return OK()

  const heute = heuteIso()
  const wirksamZum = wirksamesKuendigungsdatum(contract, heute)
  await supabase
    .from('contracts')
    .update({
      status: 'GEKUENDIGT',
      gekuendigt_am: heute,
      kuendigung_zum: wirksamZum,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contract.id)

  const kontakt = await kundenKontakt(supabase, contract.customer_id)
  await createManualTask(supabase, {
    typ: 'KUENDIGUNG',
    titel: `Kündigung über Stripe: ${kontakt.name}`,
    beschreibung: `Subscription ${subscription.id} wurde auf cancel_at_period_end gesetzt. Vertraglich wirksames Ende nach 24/24/3: ${wirksamZum}. Prüfen, ob Stripe-Ende und Vertragsende zusammenpassen (Restlaufzeit ggf. nachberechnen).`,
    customer_id: contract.customer_id,
    contract_id: contract.id,
    quelle: 'stripe-webhook',
  })

  console.log(`[STRIPE] Kündigung → Vertrag ${contract.id} zum ${wirksamZum}`)
  return OK()
}

async function handleSubscriptionDeleted(supabase: SupabaseClient, subscription: Stripe.Subscription) {
  const contract = await findContract(
    supabase,
    subscription.id,
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id ?? null
  )
  if (!contract || contract.status === 'BEENDET') return OK()

  await supabase
    .from('contracts')
    .update({ status: 'BEENDET', updated_at: new Date().toISOString() })
    .eq('id', contract.id)
  await setzeSiteSperre(supabase, contract, true)
  await supabase
    .from('customers')
    .update({ vertrags_status: 'GEKUENDIGT' })
    .eq('id', contract.customer_id)

  const kontakt = await kundenKontakt(supabase, contract.customer_id)
  await createManualTask(supabase, {
    typ: 'KUENDIGUNG',
    titel: `Subscription beendet — Site gesperrt: ${kontakt.name}`,
    beschreibung: `Stripe-Subscription ${subscription.id} wurde endgültig beendet. Vertrag steht auf BEENDET, Site ist gesperrt. Falls das Vertragsende (${contract.ende}) noch nicht erreicht ist: Restforderung prüfen.`,
    customer_id: contract.customer_id,
    contract_id: contract.id,
    quelle: 'stripe-webhook',
  })

  console.log(`[STRIPE] Subscription beendet → Vertrag ${contract.id} BEENDET`)
  return OK()
}
