import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { renderPremiumTemplate, isPremiumTemplate } from '@/lib/templates'
import { renderLibraryPage } from '@/lib/library/render'
import { loadLibraryPage } from '@/lib/library/load'
import type { LibraryDemoConfig } from '@/lib/pipeline/generate-library-content'
import { renderFlagshipPage } from '@/lib/flagship/render'
import type { FlagshipConfig } from '@/lib/flagship/types'

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

function demoBar(prospectName: string): string {
  return `
<div style="position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#111;color:#fff;font-family:system-ui,sans-serif;font-size:13px;padding:10px 16px;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 -2px 12px rgba(0,0,0,0.3)">
  <span style="background:#22c55e;width:8px;height:8px;border-radius:50%;display:inline-block;flex-shrink:0"></span>
  <span>Demo-Vorschau für <strong>${escapeHtml(prospectName)}</strong> &middot; erstellt vom Webseitenverlag Deutschland</span>
</div>
<div style="height:44px"></div>`
}

export async function GET(
  _request: Request,
  { params }: { params: { token: string } }
) {
  const token = params.token
  if (!token || token.length > 100) return notFoundPage('Dieser Demo-Link ist ungültig.')

  const { data: demo } = await supabase
    .from('demos')
    .select('id, prospect_name, template_id, config, status, view_count, expires_at')
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

  let html: string
  if (istFlagship) {
    try {
      // Flagship bringt Ribbon + noindex selbst mit — keine Demo-Bar-Injektion nötig
      html = renderFlagshipPage(demo.config as unknown as FlagshipConfig, {
        demo: true,
        basisPfad: `/demo/${token}`,
      })
    } catch (err) {
      console.error(`Demo-Render fehlgeschlagen (flagship, demo ${demo.id}):`, err)
      return notFoundPage('Die Demo konnte nicht geladen werden.')
    }

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

  // Demo-Leiste einblenden + Suchmaschinen ausschließen
  const withBar = html.includes('</body>')
    ? html.replace('</body>', `${demoBar(demo.prospect_name)}</body>`)
    : html + demoBar(demo.prospect_name)
  const finalHtml = withBar.includes('<head>')
    ? withBar.replace('<head>', '<head><meta name="robots" content="noindex, nofollow">')
    : withBar

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
