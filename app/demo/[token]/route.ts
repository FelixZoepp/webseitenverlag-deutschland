import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { renderPremiumTemplate, isPremiumTemplate } from '@/lib/templates'
import { renderLibraryPage } from '@/lib/library/render'
import { loadLibraryPage } from '@/lib/library/load'
import type { LibraryDemoConfig } from '@/lib/pipeline/generate-library-content'
import { renderFlagshipPage } from '@/lib/flagship/render'
import type { FlagshipConfig } from '@/lib/flagship/types'
import { inlineEditorScript } from '@/lib/demo-editor'
import { finalisiereDemoHtml } from '@/lib/demo-badge'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// RLS erlaubt nur Admins — die öffentliche Demo-Ansicht läuft über den Service-Role-Key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function notFoundPage(message: string): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Demo nicht verfügbar</title>
<style>body{font-family:system-ui,sans-serif;background:#0f1115;color:#e8e6e1;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.box{text-align:center;padding:40px;max-width:420px}h1{font-size:22px;margin-bottom:8px}p{color:#9a968e;font-size:15px;line-height:1.5}</style>
</head><body><div class="box"><h1>Demo nicht verfügbar</h1><p>${escapeHtml(message)}</p></div></body></html>`
  return new NextResponse(html, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  const token = params.token
  if (!token || token.length > 100) return notFoundPage('Dieser Demo-Link ist ungültig.')
  const url = new URL(request.url)
  const editMode = url.searchParams.has('edit')
  // Baustein C §C.3: Demos rendern Business-Level; ?level=growth zeigt den Video-Look.
  const level: 'business' | 'growth' = url.searchParams.get('level') === 'growth' ? 'growth' : 'business'

  const { data: demo } = await supabase
    .from('demos')
    .select('id, prospect_name, template_id, config, status, view_count, expires_at, payment_link_url')
    .eq('share_token', token)
    .single()

  if (!demo || !demo.config) {
    return notFoundPage('Dieser Demo-Link ist ungültig oder wurde entfernt.')
  }

  if (demo.expires_at && new Date(demo.expires_at) < new Date()) {
    return notFoundPage('Diese Demo ist abgelaufen. Melden Sie sich bei uns für eine aktuelle Vorschau.')
  }

  // Engine-Weiche: Flagship (Branchen-Fabrik) vs. Library (Pipeline v2) vs. Premium-Templates (v1)
  const engine = (demo.config as { engine?: string }).engine
  const istLibrary = engine === 'library'
  const istFlagship = engine === 'flagship'

  // Admin-Check für Edit-Modus
  let isAdmin = false
  if (editMode) {
    try {
      const cookieStore = cookies()
      const authClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
      )
      const { data: { user } } = await authClient.auth.getUser()
      if (user) {
        const { data: customer } = await authClient.from('customers').select('role').eq('user_id', user.id).single()
        isAdmin = customer?.role === 'admin'
      }
    } catch { /* nicht eingeloggt → kein Editor */ }
  }

  function injectEditor(pageHtml: string): string {
    if (!isAdmin) return pageHtml
    const editorCode = inlineEditorScript(demo!.id)
    return pageHtml.replace('</body>', editorCode + '\n</body>')
  }

  // B-01/B-16: JEDER Engine-Pfad läuft durch finalisiereDemoHtml
  // (Badge + Freischalten-CTA + noindex + OG-Preview) — keine Ausnahmen.
  const badgeOptionen = {
    prospectName: demo.prospect_name,
    paymentLinkUrl: (demo as { payment_link_url?: string | null }).payment_link_url ?? null,
    origin: url.origin,
  }

  let html: string

  // Custom-HTML-Demos (z. B. Animations-Flagships wie Padel)
  if (engine === 'custom' && typeof (demo.config as { html?: string }).html === 'string') {
    html = finalisiereDemoHtml(injectEditor((demo.config as { html: string }).html), badgeOptionen)
    await supabase
      .from('demos')
      .update({ view_count: (demo.view_count ?? 0) + 1, last_viewed_at: new Date().toISOString() })
      .eq('id', demo.id)
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
    })
  }

  if (istFlagship) {
    try {
      // Wenn ein HTML-Override vom Inline-Editor existiert, direkt rendern
      const htmlOverride = (demo.config as { _html_override?: string })._html_override
      if (htmlOverride) {
        html = injectEditor(htmlOverride)
      } else {
        html = injectEditor(renderFlagshipPage(demo.config as unknown as FlagshipConfig, {
          demo: true,
          basisPfad: `/demo/${token}`,
          level,
        }))
      }
    } catch (err) {
      console.error(`Demo-Render fehlgeschlagen (flagship, demo ${demo.id}):`, err)
      return notFoundPage('Die Demo konnte nicht geladen werden.')
    }

    html = finalisiereDemoHtml(html, badgeOptionen)

    await supabase
      .from('demos')
      .update({ view_count: (demo.view_count ?? 0) + 1, last_viewed_at: new Date().toISOString() })
      .eq('id', demo.id)

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  }
  if (istLibrary) {
    const config = demo.config as unknown as LibraryDemoConfig
    try {
      const loaded = await loadLibraryPage(supabase, config.library_page_key)
      html = renderLibraryPage(config, loaded?.assets ?? [])
    } catch (err) {
      console.error(`Demo-Render fehlgeschlagen (library, demo ${demo.id}):`, err)
      return notFoundPage('Die Demo konnte nicht geladen werden.')
    }
  } else {
    if (!isPremiumTemplate(demo.template_id)) {
      return notFoundPage('Dieser Demo-Link ist ungültig oder wurde entfernt.')
    }
    try {
      html = renderPremiumTemplate(demo.template_id, demo.config as Record<string, unknown>)
    } catch (err) {
      console.error(`Demo-Render fehlgeschlagen (template ${demo.template_id}, demo ${demo.id}):`, err)
      return notFoundPage('Die Demo konnte nicht geladen werden.')
    }
  }

  // Demo-Leiste + noindex + OG-Preview (Library/Premium-Pfad)
  const finalHtml = finalisiereDemoHtml(html, badgeOptionen)

  // View-Tracking (fire-and-forget wäre riskant in Serverless — kurz awaiten)
  await supabase
    .from('demos')
    .update({ view_count: (demo.view_count ?? 0) + 1, last_viewed_at: new Date().toISOString() })
    .eq('id', demo.id)

  return new NextResponse(finalHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}
