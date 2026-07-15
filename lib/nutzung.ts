/**
 * Nutzungs-/Kosten-Erfassung (Mission §12, Phase H)
 *
 * Schreibt jedes kostenpflichtige Ereignis (Claude-Tokens, Firecrawl-Scrapes,
 * Places-Lookups) in nutzungs_events (Migration 021). Der tägliche
 * kosten-summary-Cron aggregiert daraus die Summary für Slack #money.
 *
 * Best effort: wirft NIE, blockiert NIE die Pipeline — fehlende Env-Vars
 * (z. B. im Offline-CI) oder DB-Fehler werden still geschluckt (nur Log).
 */

import { createClient } from '@supabase/supabase-js'

export type NutzungsTyp =
  | 'claude_tokens'
  | 'firecrawl_scrape'
  | 'places_lookup'
  | 'asset_generierung'

export async function erfasseNutzung(
  typ: NutzungsTyp,
  opts: { tokensInput?: number; tokensOutput?: number; kostenCent?: number; kontext?: string } = {}
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return

  try {
    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { error } = await supabase.from('nutzungs_events').insert({
      typ,
      tokens_input: opts.tokensInput ?? 0,
      tokens_output: opts.tokensOutput ?? 0,
      kosten_cent: opts.kostenCent ?? 0,
      kontext: opts.kontext ?? null,
    })
    if (error) console.warn('[nutzung] Insert fehlgeschlagen:', error.message)
  } catch (e) {
    console.warn('[nutzung] Erfassung fehlgeschlagen:', (e as Error).message)
  }
}
