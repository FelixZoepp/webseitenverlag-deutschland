import { getOwnedSite } from '@/lib/api-helpers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const PatchSiteSchema = z.object({
  draft_config: z.record(z.string(), z.unknown()).optional(),
  name: z.string().min(1).optional(),
  domain: z.string().optional(),
})

export async function GET(
  _request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    return NextResponse.json(result.data.site)
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { supabase, site } = result.data

    const body = await request.json()
    const parsed = PatchSiteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    const currentConfig = (site.draft_config || site.config) as Record<string, unknown>
    if (parsed.data.draft_config) {
      updates.draft_config = { ...currentConfig, ...parsed.data.draft_config }
    }
    if (parsed.data.name) updates.name = parsed.data.name
    if (parsed.data.domain !== undefined) updates.domain = parsed.data.domain

    const { data: updated, error } = await supabase
      .from('sites')
      .update(updates)
      .eq('id', params.siteId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
