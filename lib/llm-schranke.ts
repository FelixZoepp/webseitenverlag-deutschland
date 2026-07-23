/**
 * LLM-Schranke (B-25): EIN Gate vor jedem Token-verbrauchenden Endpoint.
 *
 * Drei Stufen, in dieser Reihenfolge:
 *  1. Kill-Switch GENERATION_KILL_SWITCH (manueller Not-Aus) → 503
 *  2. In-Memory-Rate-Limit pro Schlüssel (z. B. Kunde/IP) → 429
 *  3. Tages-Kosten-Cap aus nutzungs_events (LLM_TAGES_CAP_CENT,
 *     Default 5000 = 50 €/Tag) → 503 + einmaliger Slack-Alarm pro Tag
 *
 * Verhinderungs-Regel (scripts/test-kosten-cap.ts): Jede Route unter app/api,
 * die LLM-Kosten auslösen kann, MUSS pruefeLlmSchranke() aufrufen — der
 * Quelltext-Scan schlägt sonst fehl. Ein Amok-Loop wird damit GESTOPPT
 * (hartes Cap), nicht nur post-hoc gemeldet.
 *
 * Cap-Check ist best effort: ohne Env/DB (Offline-CI) wird NICHT blockiert —
 * der Kill-Switch bleibt der garantierte Not-Aus.
 */

import { createClient } from '@supabase/supabase-js'
import { generierungGesperrt, meldeJobFehler } from './monitoring'

export type SchrankenErgebnis =
  | { ok: true }
  | { ok: false; status: 429 | 503; grund: string }

const TAGES_CAP_CENT_DEFAULT = 5000

/** Cap in Cent aus LLM_TAGES_CAP_CENT (Default 5000 = 50 €/Tag). */
export function tagesCapCent(): number {
  const roh = Number(process.env.LLM_TAGES_CAP_CENT)
  return Number.isFinite(roh) && roh > 0 ? roh : TAGES_CAP_CENT_DEFAULT
}

/** Pure Entscheidung — deterministisch testbar ohne DB. */
export function capErreicht(tagesSummeCent: number, capCent: number): boolean {
  return tagesSummeCent >= capCent
}

// ---- In-Memory-Rate-Limit (Muster wie app/api/public/lead) -----------------

const anfragenProSchluessel = new Map<string, number[]>()

/**
 * true = Limit überschritten (Anfrage ablehnen). Zählt nur, wenn nicht
 * überschritten — abgelehnte Anfragen verlängern das Fenster nicht.
 */
export function rateLimitUeberschritten(
  schluessel: string,
  maxProFenster: number,
  fensterMs: number,
  jetzt: number = Date.now()
): boolean {
  const aktiv = (anfragenProSchluessel.get(schluessel) ?? []).filter(
    (t) => jetzt - t < fensterMs
  )
  if (aktiv.length >= maxProFenster) {
    anfragenProSchluessel.set(schluessel, aktiv)
    return true
  }
  aktiv.push(jetzt)
  anfragenProSchluessel.set(schluessel, aktiv)
  return false
}

// ---- Tages-Kosten aus nutzungs_events --------------------------------------

/** Summe kosten_cent seit Mitternacht (UTC); null = nicht ermittelbar. */
async function tagesKostenCent(): Promise<number | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  try {
    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const tagesbeginn = new Date()
    tagesbeginn.setUTCHours(0, 0, 0, 0)
    const { data, error } = await supabase
      .from('nutzungs_events')
      .select('kosten_cent')
      .gte('created_at', tagesbeginn.toISOString())
    if (error || !data) return null
    return data.reduce((summe, zeile) => summe + (zeile.kosten_cent ?? 0), 0)
  } catch {
    return null
  }
}

/** Slack-Alarm höchstens einmal pro Tag und Instanz. */
let letzterCapAlarmTag = ''

/**
 * Zentrales Gate vor jedem LLM-Aufruf. `kontext` benennt die Route (für
 * Rate-Limit-Schlüssel + Alarm), `rateLimit` ist optional (z. B. pro Kunde).
 */
export async function pruefeLlmSchranke(
  kontext: string,
  rateLimit?: { schluessel: string; maxProFenster: number; fensterMs: number }
): Promise<SchrankenErgebnis> {
  if (generierungGesperrt()) {
    return {
      ok: false,
      status: 503,
      grund: 'Generierung ist vorübergehend gestoppt (Kill-Switch).',
    }
  }

  if (
    rateLimit &&
    rateLimitUeberschritten(
      `${kontext}:${rateLimit.schluessel}`,
      rateLimit.maxProFenster,
      rateLimit.fensterMs
    )
  ) {
    return {
      ok: false,
      status: 429,
      grund: 'Zu viele Anfragen — bitte in einer Stunde erneut versuchen.',
    }
  }

  const summe = await tagesKostenCent()
  if (summe !== null && capErreicht(summe, tagesCapCent())) {
    const heute = new Date().toISOString().slice(0, 10)
    if (letzterCapAlarmTag !== heute) {
      letzterCapAlarmTag = heute
      await meldeJobFehler(
        'llm-tages-cap',
        `Tages-Kosten-Cap erreicht: ${summe} ¢ ≥ ${tagesCapCent()} ¢ — Generierung gestoppt (${kontext})`
      )
    }
    return {
      ok: false,
      status: 503,
      grund: 'Tages-Budget erreicht — Generierung ist bis morgen gestoppt.',
    }
  }

  return { ok: true }
}
