/**
 * Dunning-Logik (Phase 5, §6.2): zeitbasierte Mahnstufen aus config/vertraege.ts.
 * Gemeinsame Quelle für den Stripe-Webhook (invoice.payment_failed) und den
 * täglichen Dunning-Cron — keine Stufen-Rechnung außerhalb dieser Datei.
 *
 * Ablauf: Tag 0 → Erinnerung (Stufe 1), Tag 3 → Mahnung (Stufe 2),
 * Tag 7 → letzte Mahnung (Stufe 3), Tag 14 → Site gesperrt (suspended).
 */

import { DUNNING_ZEITPLAN } from '@/config/vertraege'

/** Volle Tage zwischen Überfälligkeits-Beginn und heute (ISO-Daten YYYY-MM-DD). */
export function tageUeberfaellig(seitIso: string, heuteIso: string): number {
  const seit = new Date(`${seitIso}T00:00:00Z`).getTime()
  const heute = new Date(`${heuteIso}T00:00:00Z`).getTime()
  if (Number.isNaN(seit) || Number.isNaN(heute)) return 0
  return Math.max(0, Math.floor((heute - seit) / 86_400_000))
}

/** Mahnstufe (1–3), die nach `tage` Tagen Überfälligkeit fällig ist. */
export function stufeFuerTage(tage: number): number {
  let stufe = 0
  DUNNING_ZEITPLAN.mahnTage.forEach((tag, index) => {
    if (tage >= tag) stufe = index + 1
  })
  return Math.max(1, stufe)
}

/** Ab diesem Tag wird die Site gesperrt (suspended). */
export function sperreFaellig(tage: number): boolean {
  return tage >= DUNNING_ZEITPLAN.sperreNachTagen
}
