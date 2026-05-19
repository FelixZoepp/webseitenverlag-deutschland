import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

    const { data: customer } = await supabase
      .from('customers')
      .select('id, monthly_price, package, contract_end')
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

    return NextResponse.json({
      posten: posten || [],
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
