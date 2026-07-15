/**
 * Tägliche Kosten-Summary (Mission §12, Phase H) — läuft morgens.
 *
 * Aggregiert nutzungs_events der letzten 24 h (Claude-Tokens, Firecrawl-
 * Scrapes, Places-Lookups) und schickt die Summary nach Slack #money
 * (SLACK_WEBHOOK_MONEY; ohne Webhook: Log-Stub).
 *
 * Kostenschätzung: grobe Richtwerte, bewusst konservativ gerundet —
 * die echte Rechnung kommt vom Anbieter, das hier ist ein Frühwarnsystem.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendSlackNotification } from '@/lib/slack'
import { meldeJobFehler } from '@/lib/monitoring'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Richtwerte in USD (claude-sonnet-4-6: 3 $/M Input, 15 $/M Output;
// Firecrawl ~0,001 $/Scrape Basisplan; Places Details ~0,017 $/Lookup)
const USD_PRO_INPUT_TOKEN = 3 / 1_000_000
const USD_PRO_OUTPUT_TOKEN = 15 / 1_000_000
const USD_PRO_FIRECRAWL = 0.001
const USD_PRO_PLACES = 0.017

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getServiceClient()
    const seit = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: events, error } = await supabase
      .from('nutzungs_events')
      .select('typ, tokens_input, tokens_output, kontext')
      .gte('created_at', seit)

    if (error) throw new Error(`nutzungs_events: ${error.message}`)

    let tokensIn = 0
    let tokensOut = 0
    let claudeCalls = 0
    let firecrawl = 0
    let places = 0
    const jeKontext: Record<string, number> = {}

    for (const ev of events ?? []) {
      if (ev.typ === 'claude_tokens') {
        claudeCalls++
        tokensIn += ev.tokens_input ?? 0
        tokensOut += ev.tokens_output ?? 0
      } else if (ev.typ === 'firecrawl_scrape') {
        firecrawl++
      } else if (ev.typ === 'places_lookup') {
        places++
      }
      const k = ev.kontext ?? 'unbekannt'
      jeKontext[k] = (jeKontext[k] ?? 0) + 1
    }

    const kostenUsd =
      tokensIn * USD_PRO_INPUT_TOKEN +
      tokensOut * USD_PRO_OUTPUT_TOKEN +
      firecrawl * USD_PRO_FIRECRAWL +
      places * USD_PRO_PLACES

    const killSwitch = (process.env.GENERATION_KILL_SWITCH ?? '').trim()
    const zeilen = [
      `Kosten-Summary (letzte 24 h)`,
      `Claude: ${claudeCalls} Aufrufe, ${tokensIn.toLocaleString('de-DE')} Input- / ${tokensOut.toLocaleString('de-DE')} Output-Tokens`,
      `Firecrawl: ${firecrawl} Scrapes | Places: ${places} Lookups`,
      `Geschätzt: ~${kostenUsd.toFixed(2)} USD`,
      Object.keys(jeKontext).length > 0
        ? `Nach Kontext: ${Object.entries(jeKontext)
            .sort((a, b) => b[1] - a[1])
            .map(([k, n]) => `${k} (${n})`)
            .join(', ')}`
        : 'Keine Ereignisse.',
    ]
    if (killSwitch) zeilen.push(`ACHTUNG: GENERATION_KILL_SWITCH ist aktiv ("${killSwitch}")`)

    await sendSlackNotification('money', zeilen.join('\n'))

    return NextResponse.json({
      seit,
      claudeCalls,
      tokensIn,
      tokensOut,
      firecrawl,
      places,
      geschaetztUsd: Number(kostenUsd.toFixed(2)),
    })
  } catch (e) {
    await meldeJobFehler('kosten-summary', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'unbekannt' },
      { status: 500 }
    )
  }
}
