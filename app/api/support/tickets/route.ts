import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!customer) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*, support_messages(id, absender, inhalt, created_at)')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ tickets: tickets || [] })
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!customer) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const betreff = (body.betreff || '').trim().slice(0, 200)
  const nachricht = (body.nachricht || '').trim().slice(0, 5000)
  const kategorie = body.kategorie || 'sonstiges'
  const siteId = body.site_id || null

  if (!betreff || !nachricht) {
    return NextResponse.json({ error: 'Betreff und Nachricht erforderlich' }, { status: 400 })
  }

  // Rate Limiting: max 5 Tickets pro Tag pro Kunde
  const today = new Date().toISOString().slice(0, 10)
  const { count: ticketsToday } = await supabase
    .from('support_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', customer.id)
    .gte('created_at', `${today}T00:00:00Z`)

  if ((ticketsToday || 0) >= 5) {
    return NextResponse.json({ error: 'Maximale Anzahl Tickets für heute erreicht. Bitte versuchen Sie es morgen.' }, { status: 429 })
  }

  const { data: ticket, error: ticketErr } = await supabase
    .from('support_tickets')
    .insert({
      customer_id: customer.id,
      site_id: siteId,
      betreff,
      kategorie,
      status: 'offen',
      letzter_absender: 'kunde',
    })
    .select('id')
    .single()

  if (ticketErr || !ticket) {
    return NextResponse.json({ error: 'Ticket konnte nicht erstellt werden' }, { status: 500 })
  }

  await supabase.from('support_messages').insert({
    ticket_id: ticket.id,
    absender: 'kunde',
    inhalt: nachricht,
  })

  return NextResponse.json({ ticket_id: ticket.id })
}
