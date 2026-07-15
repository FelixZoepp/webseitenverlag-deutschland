/**
 * Ads-Wochen-Check (Upsell #3, Phase G §11) — läuft montags.
 *
 * Regelbasierte Checks je Kampagne (ohne Ads-API-Zugang nur die lokal
 * prüfbaren Regeln; echte Leistungsdaten erst mit Ads-Konto-Zugang, WARTELISTE):
 *   - Ziel-URL erreichbar?
 *   - Entwurf vollständig (Anzeigen, Keywords bei Search)?
 * Ergebnis landet in ads_kampagnen.wochen_check.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { AdsEntwurf } from '@/lib/ads-starter'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function zielUrlErreichbar(url: string | null): Promise<boolean | null> {
  if (!url) return null
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(8000) })
    return res.ok
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceClient()
  const { data: kampagnen } = await supabase
    .from('ads_kampagnen')
    .select('id, typ, status, entwurf')
    .in('status', ['KONTO_VERKNUEPFT', 'AKTIV', 'PAUSIERT'])

  const ergebnisse: Record<string, string> = {}
  for (const k of kampagnen || []) {
    try {
      const entwurf = (k.entwurf || {}) as Partial<AdsEntwurf>
      const hinweise: string[] = []

      const zielOk = await zielUrlErreichbar(entwurf.ziel_url ?? null)
      if (zielOk === false) hinweise.push('Ziel-URL nicht erreichbar — Kampagne prüfen/pausieren.')
      if (zielOk === null) hinweise.push('Keine Ziel-URL hinterlegt.')
      if (!entwurf.anzeigen?.headlines?.length) hinweise.push('Keine Anzeigen-Headlines im Entwurf.')
      if (k.typ === 'search' && !entwurf.keywords?.length) hinweise.push('Keine Keywords im Search-Entwurf.')

      const wochenCheck = {
        geprueft_am: new Date().toISOString(),
        ziel_url_ok: zielOk,
        hinweise,
        leistungsdaten: {
          stub: true,
          hinweis: 'Echte Klick-/Kostendaten erst mit Google-Ads-API-Zugang (WARTELISTE).',
        },
      }

      await supabase
        .from('ads_kampagnen')
        .update({ wochen_check: wochenCheck, updated_at: new Date().toISOString() })
        .eq('id', k.id)

      ergebnisse[k.id] = hinweise.length > 0 ? `hinweise: ${hinweise.length}` : 'ok'
    } catch (e) {
      ergebnisse[k.id] = `fehler: ${e instanceof Error ? e.message : 'unbekannt'}`
    }
  }

  return NextResponse.json({ anzahl: (kampagnen || []).length, ergebnisse })
}
