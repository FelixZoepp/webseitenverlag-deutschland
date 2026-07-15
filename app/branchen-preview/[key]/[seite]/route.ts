import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { renderAnfrageSeite } from '@/lib/flagship/anfrage'
import type { FlagshipConfig } from '@/lib/flagship/types'

/**
 * Funnel-Unterseite des Branchen-Previews (/branchen-preview/{key}/anfrage
 * bzw. /reservierung). Kein Submit-Ziel — Erfolgs-Screen ohne Persistenz.
 */

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { key: string; seite: string } }
) {
  const { key, seite } = params
  if (seite !== 'anfrage' && seite !== 'reservierung') {
    return new NextResponse('Nicht gefunden', { status: 404 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Nicht gefunden', { status: 404 })
  const { data: customer } = await supabase
    .from('customers').select('role').eq('user_id', user.id).single()
  if (customer?.role !== 'admin') return new NextResponse('Nicht gefunden', { status: 404 })

  const { data: row } = await supabase
    .from('branchen_profile')
    .select('profil')
    .eq('branche_key', key)
    .maybeSingle()

  const config = (row?.profil as { vorlage?: FlagshipConfig } | null)?.vorlage
  if (!config || config.engine !== 'flagship') {
    return new NextResponse('Keine Vorlage für diese Branche', { status: 404 })
  }

  const erwartet = config.funnel.modus === 'reservierung' ? 'reservierung' : 'anfrage'
  if (seite !== erwartet) {
    return NextResponse.redirect(new URL(`/branchen-preview/${key}/${erwartet}`, request.url))
  }

  const html = renderAnfrageSeite(config, {
    demo: true,
    basisPfad: `/branchen-preview/${key}`,
    submitZiel: null,
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
