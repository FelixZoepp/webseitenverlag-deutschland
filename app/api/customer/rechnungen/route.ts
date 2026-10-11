import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

interface StripeRechnung {
  id: string
  nummer: string | null
  datum: string
  betrag_cent: number
  waehrung: string
  status: string | null
  pdf_url: string | null
  online_url: string | null
}

/** Rechnungen live aus Stripe — Entwürfe ausgenommen, Fehler blockieren die Seite nicht */
async function ladeStripeRechnungen(stripeCustomerId: string | null): Promise<StripeRechnung[]> {
  if (!stripeCustomerId) return []
  try {
    const liste = await getStripe().invoices.list({ customer: stripeCustomerId, limit: 100 })
    return liste.data
      .filter((inv) => inv.status !== 'draft')
      .map((inv) => ({
        id: inv.id ?? '',
        nummer: inv.number,
        datum: new Date(inv.created * 1000).toISOString(),
        betrag_cent: inv.total,
        waehrung: inv.currency,
        status: inv.status,
        pdf_url: inv.invoice_pdf ?? null,
        online_url: inv.hosted_invoice_url ?? null,
      }))
  } catch (err) {
    console.error('[RECHNUNGEN] Stripe-Abruf fehlgeschlagen:', err)
    return []
  }
}

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

    const { data: customer } = await supabase
      .from('customers')
      .select('id, monthly_price, package, contract_end, stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!customer) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })

    // Rechnungsposten
    const { data: posten } = await supabase
      .from('rechnungs_posten')
      .select('*')
      .eq('customer_id', customer.id)
      .order('gueltig_ab', { ascending: false })

    // Dokumente (Rechnungen, Angebote, Mandate)
    const { data: dokumente } = await supabase
      .from('kunden_dokumente')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    const rechnungen = await ladeStripeRechnungen(customer.stripe_customer_id)

    return NextResponse.json({
      posten: posten || [],
      rechnungen,
      dokumente: dokumente || [],
      info: {
        monatsrate: parseFloat(customer.monthly_price) || 0,
        paket: customer.package || 'starter',
        vertragsende: customer.contract_end,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
