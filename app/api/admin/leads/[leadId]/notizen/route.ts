/**
 * Admin-CRM: Notizen pro Lead (Log, neueste zuerst).
 * GET → Liste · POST → neue Notiz anlegen.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth-helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { leadId } = await params
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('lead_notes')
    .select('id, text, autor, created_at')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ notizen: data ?? [] })
}

const postSchema = z.object({ text: z.string().trim().min(1, 'Notiz darf nicht leer sein').max(4000) })

export async function POST(request: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { leadId } = await params
  const body = await request.json().catch(() => null)
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Ungültige Notiz.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('lead_notes')
    .insert({ lead_id: leadId, text: parsed.data.text, autor: auth.data.user.email ?? null })
    .select('id, text, autor, created_at')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ notiz: data })
}
