import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'

const ERLAUBTE_STATUS = ['OFFEN', 'ERLEDIGT', 'VERWORFEN'] as const

/** Manuelle Aufgabe erledigen/verwerfen/wieder öffnen. */
export async function PATCH(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const { supabase } = auth.data

  const body = await request.json().catch(() => null)
  const status = typeof body?.status === 'string' ? body.status : ''
  if (!ERLAUBTE_STATUS.includes(status as (typeof ERLAUBTE_STATUS)[number])) {
    return NextResponse.json({ error: 'Ungültiger Status' }, { status: 400 })
  }

  const { error } = await supabase
    .from('manual_tasks')
    .update({
      status,
      erledigt_am: status === 'OFFEN' ? null : new Date().toISOString(),
    })
    .eq('id', params.taskId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, status })
}
