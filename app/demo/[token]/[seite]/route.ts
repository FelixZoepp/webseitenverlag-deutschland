import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { renderAnfrageSeite } from '@/lib/flagship/anfrage'
import { renderUnterseite } from '@/lib/flagship/render'
import type { FlagshipConfig, UnterseitenSlug } from '@/lib/flagship/types'
import { UNTERSEITEN } from '@/lib/flagship/types'
import { finalisiereDemoHtml } from '@/lib/demo-badge'

// Funnel-Unterseite der Flagship-Demos (/demo/{token}/anfrage bzw. /reservierung).
// Multipage: Inhalts-Unterseiten (/demo/{token}/leistungen, /ergebnisse, /ueber-uns, /kontakt).
// Demo-Modus: kein Submit-Ziel — der Wizard zeigt den Erfolgs-Screen ohne Persistenz.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const UNTERSEITEN_SLUGS = new Set<string>(UNTERSEITEN.map((u) => u.slug))

export async function GET(
  _request: Request,
  { params }: { params: { token: string; seite: string } }
) {
  const { token, seite } = params
  if (!token || token.length > 100) return NextResponse.redirect(new URL('/', _request.url))

  const istFunnel = seite === 'anfrage' || seite === 'reservierung'
  const istUnterseite = UNTERSEITEN_SLUGS.has(seite)

  if (!istFunnel && !istUnterseite) {
    return new NextResponse('Nicht gefunden', { status: 404 })
  }

  const { data: demo } = await supabase
    .from('demos')
    .select('id, config, expires_at, prospect_name, payment_link_url')
    .eq('share_token', token)
    .single()

  const config = demo?.config as FlagshipConfig | undefined
  if (!demo || config?.engine !== 'flagship') {
    return new NextResponse('Nicht gefunden', { status: 404 })
  }
  if (demo.expires_at && new Date(demo.expires_at) < new Date()) {
    return new NextResponse('Diese Demo ist abgelaufen.', { status: 404 })
  }

  const basisPfad = `/demo/${token}`

  // B-01/B-16: Badge + noindex + OG auch auf allen Unterseiten
  const badgeOptionen = {
    prospectName: (demo as { prospect_name?: string }).prospect_name ?? 'Ihre Firma',
    paymentLinkUrl: (demo as { payment_link_url?: string | null }).payment_link_url ?? null,
    origin: new URL(_request.url).origin,
  }

  // Multipage-Unterseiten (leistungen, ergebnisse, ueber-uns, kontakt)
  if (istUnterseite) {
    if (config.seiten_modus !== 'multipage') {
      return new NextResponse('Nicht gefunden', { status: 404 })
    }
    const html = finalisiereDemoHtml(renderUnterseite(config, seite as UnterseitenSlug, {
      demo: true,
      basisPfad,
      submitZiel: null,
    }), badgeOptionen)
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  }

  // Funnel-Seiten (anfrage / reservierung)
  const erwartet = config.funnel.modus === 'reservierung' ? 'reservierung' : 'anfrage'
  if (seite !== erwartet) {
    return NextResponse.redirect(new URL(`${basisPfad}/${erwartet}`, _request.url))
  }

  const html = finalisiereDemoHtml(renderAnfrageSeite(config, {
    demo: true,
    basisPfad,
    submitZiel: null,
  }), badgeOptionen)

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}
