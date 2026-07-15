import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { renderAnfrageSeite } from '@/lib/flagship/anfrage'
import type { FlagshipConfig } from '@/lib/flagship/types'

// Funnel-Unterseite der Flagship-Demos (/demo/{token}/anfrage bzw. /reservierung).
// Demo-Modus: kein Submit-Ziel — der Wizard zeigt den Erfolgs-Screen ohne Persistenz.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  _request: Request,
  { params }: { params: { token: string; seite: string } }
) {
  const { token, seite } = params
  if (!token || token.length > 100) return NextResponse.redirect(new URL('/', _request.url))
  if (seite !== 'anfrage' && seite !== 'reservierung') {
    return new NextResponse('Nicht gefunden', { status: 404 })
  }

  const { data: demo } = await supabase
    .from('demos')
    .select('id, config, expires_at')
    .eq('share_token', token)
    .single()

  const config = demo?.config as FlagshipConfig | undefined
  if (!demo || config?.engine !== 'flagship') {
    return new NextResponse('Nicht gefunden', { status: 404 })
  }
  if (demo.expires_at && new Date(demo.expires_at) < new Date()) {
    return new NextResponse('Diese Demo ist abgelaufen.', { status: 404 })
  }

  const erwartet = config.funnel.modus === 'reservierung' ? 'reservierung' : 'anfrage'
  if (seite !== erwartet) {
    return NextResponse.redirect(new URL(`/demo/${token}/${erwartet}`, _request.url))
  }

  const html = renderAnfrageSeite(config, {
    demo: true,
    basisPfad: `/demo/${token}`,
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
