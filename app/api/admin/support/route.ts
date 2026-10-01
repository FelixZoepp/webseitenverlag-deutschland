import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { data: tickets, error } = await auth.data.supabase
    .from('support_tickets')
    .select('*, customers!inner(company_name, contact_email), support_messages(id, absender, inhalt, created_at)')
    .order('updated_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tickets: tickets || [] })
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => null)
  const ticket_id = typeof body?.ticket_id === 'string' ? body.ticket_id : ''
  if (!ticket_id) return NextResponse.json({ error: 'ticket_id fehlt' }, { status: 400 })

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.status) updates.status = body.status
  if (body.antwort) updates.letzter_absender = 'admin'

  const { error } = await auth.data.supabase
    .from('support_tickets')
    .update(updates)
    .eq('id', ticket_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (body.antwort) {
    await auth.data.supabase.from('support_messages').insert({
      ticket_id,
      absender: 'admin',
      inhalt: String(body.antwort).trim().slice(0, 5000),
    })
  }

  return NextResponse.json({ ok: true })
}
