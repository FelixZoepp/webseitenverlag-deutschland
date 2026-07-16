import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!customer) return NextResponse.json({ error: 'Kein Kundenkonto' }, { status: 403 })

  const body = await request.json().catch(() => null)
  const betreff = (typeof body?.betreff === 'string' ? body.betreff.trim() : '').slice(0, 200)
  const nachricht = (typeof body?.nachricht === 'string' ? body.nachricht.trim() : '').slice(0, 2000)
  if (!betreff || !nachricht) {
    return NextResponse.json({ error: 'Betreff und Nachricht sind Pflicht' }, { status: 400 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: ticket, error } = await admin
    .from('support_tickets')
    .insert({
      customer_id: customer.id,
      site_id: params.siteId,
      betreff,
      nachricht,
      quelle: 'portal',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ticket })
}
