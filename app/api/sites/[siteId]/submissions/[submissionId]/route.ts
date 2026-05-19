import { getOwnedSite } from '@/lib/api-helpers'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: { siteId: string; submissionId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { supabase } = result.data
    const { data } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('id', params.submissionId)
      .eq('site_id', params.siteId)
      .single()

    if (!data) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { siteId: string; submissionId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { supabase } = result.data
    const body = await request.json()

    const updates: Record<string, unknown> = {}
    if (body.status) {
      updates.status = body.status
      if (body.status === 'read') updates.read_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('form_submissions')
      .update(updates)
      .eq('id', params.submissionId)
      .eq('site_id', params.siteId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { siteId: string; submissionId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { supabase } = result.data
    await supabase
      .from('form_submissions')
      .delete()
      .eq('id', params.submissionId)
      .eq('site_id', params.siteId)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
