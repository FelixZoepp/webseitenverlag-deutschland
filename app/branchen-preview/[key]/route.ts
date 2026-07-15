import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { renderFlagshipPage } from '@/lib/flagship/render'
import type { FlagshipConfig } from '@/lib/flagship/types'

/**
 * F3 Mensch-Gate (BF §4.6): Preview einer Branchen-Vorlage vor der Freigabe.
 * Pfadbasiert statt preview-<branche>.DOMAIN (Subdomain → WARTELISTE).
 * Nur für eingeloggte Admins sichtbar — Drafts sind nie öffentlich.
 */

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { key: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Nicht gefunden', { status: 404 })
  const { data: customer } = await supabase
    .from('customers').select('role').eq('user_id', user.id).single()
  if (customer?.role !== 'admin') return new NextResponse('Nicht gefunden', { status: 404 })

  const { data: row } = await supabase
    .from('branchen_profile')
    .select('profil')
    .eq('branche_key', params.key)
    .maybeSingle()

  const config = (row?.profil as { vorlage?: FlagshipConfig } | null)?.vorlage
  if (!config || config.engine !== 'flagship') {
    return new NextResponse('Keine Vorlage für diese Branche', { status: 404 })
  }

  const html = renderFlagshipPage(config, {
    demo: true,
    basisPfad: `/branchen-preview/${params.key}`,
  })

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}
