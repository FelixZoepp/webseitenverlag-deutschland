import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { data: tickets, error } = await auth.data.supabase
    .from('support_tickets')
    .select('*, customers(name, email)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tickets })
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => null)
  const id = typeof body?.id === 'string' ? body.id : ''
  if (!id) return NextResponse.json({ error: 'id fehlt' }, { status: 400 })

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.status) update.status = body.status
  if (body.antwort) update.antwort = body.antwort
  if (body.status === 'in_bearbeitung' || body.status === 'erledigt') {
    update.bearbeitet_von = auth.data.user.id
    update.bearbeitet_am = new Date().toISOString()
  }

  const { data, error } = await auth.data.supabase
    .from('support_tickets')
    .update(update)
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ticket: data })
}
