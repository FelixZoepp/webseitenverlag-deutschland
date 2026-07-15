/**
 * Monitoring-Helfer (Mission §12, Phase H)
 *
 *  - GENERATION_KILL_SWITCH: Env-Schalter, der alle Token-verbrauchenden
 *    Generierungswege stoppt (Demo-Erstellung, SEO-Plan-Cron) — für den Fall
 *    durchdrehender Kosten. Werte: '1' | 'true' | 'on' (case-insensitiv).
 *  - meldeJobFehler: Job-Fails nach Slack #errors (best effort, wirft nie).
 *
 * Sentry ist bewusst NICHT eingebunden, solange kein DSN existiert
 * (WARTELISTE) — Slack #errors + Vercel-Logs decken den Start ab.
 */

import { sendSlackNotification } from './slack'

/** true = Generierung gestoppt (Demos, SEO-Plan). Routen antworten mit 503. */
export function generierungGesperrt(): boolean {
  const wert = (process.env.GENERATION_KILL_SWITCH ?? '').trim().toLowerCase()
  return wert === '1' || wert === 'true' || wert === 'on'
}

/**
 * Meldet einen fehlgeschlagenen Job/Cron nach Slack #errors.
 * Ohne SLACK_WEBHOOK_ERRORS landet die Meldung im Log (Stub in lib/slack.ts).
 */
export async function meldeJobFehler(
  job: string,
  fehler: unknown,
  kontext?: string
): Promise<void> {
  const nachricht = fehler instanceof Error ? fehler.message : String(fehler)
  console.error(`[job:${job}] Fehler${kontext ? ` (${kontext})` : ''}:`, fehler)
  try {
    await sendSlackNotification(
      'errors',
      `Job "${job}" fehlgeschlagen${kontext ? ` — ${kontext}` : ''}\n${nachricht}`
    )
  } catch {
    // Slack darf nie einen Job zum Absturz bringen
  }
}
