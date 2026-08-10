import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { fetchMetaAdsInsights, berechneMetaKennzahlen } from '@/lib/meta-ads'

const ALLOWED_PRESETS = [
  'today',
  'yesterday',
  'last_7d',
  'last_14d',
  'last_30d',
  'this_month',
  'last_month',
  'last_3d',
] as const

export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { supabase } = auth.data
  const { searchParams } = new URL(request.url)
  const datePreset = searchParams.get('zeitraum') ?? 'last_30d'

  if (!ALLOWED_PRESETS.includes(datePreset as (typeof ALLOWED_PRESETS)[number])) {
    return NextResponse.json({ error: `Ungültiger Zeitraum. Erlaubt: ${ALLOWED_PRESETS.join(', ')}` }, { status: 400 })
  }

  try {
    // Meta Insights + Leads parallel laden
    const [insights, { data: leadsData }] = await Promise.all([
      fetchMetaAdsInsights(datePreset),
      supabase
        .from('leads')
        .select('utm_campaign, utm_source, status'),
    ])

    // Leads pro utm_campaign zählen (case-insensitive)
    const leadsProKampagne = new Map<string, number>()
    for (const lead of leadsData ?? []) {
      if (!lead.utm_campaign) continue
      const key = (lead.utm_campaign as string).toLowerCase()
      leadsProKampagne.set(key, (leadsProKampagne.get(key) ?? 0) + 1)
    }

    // Zeitraum-Label
    const zeitraumLabels: Record<string, { von: string; bis: string }> = {
      today: { von: 'heute', bis: 'heute' },
      yesterday: { von: 'gestern', bis: 'gestern' },
      last_3d: { von: 'letzte 3 Tage', bis: 'heute' },
      last_7d: { von: 'letzte 7 Tage', bis: 'heute' },
      last_14d: { von: 'letzte 14 Tage', bis: 'heute' },
      last_30d: { von: 'letzte 30 Tage', bis: 'heute' },
      this_month: { von: 'dieser Monat', bis: 'heute' },
      last_month: { von: 'letzter Monat', bis: 'Monatsende' },
    }

    const summary = berechneMetaKennzahlen(
      insights,
      leadsProKampagne,
      zeitraumLabels[datePreset] ?? { von: datePreset, bis: 'heute' }
    )

    return NextResponse.json(summary)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
