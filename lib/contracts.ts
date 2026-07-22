/**
 * Vertragslogik Hauptprodukt (Mission §6/§9) — Standard-Konditionen kommen
 * AUSSCHLIESSLICH aus config/vertraege.ts (aktuell 24/12/3). Die Rechnung
 * für Bestandsverträge liest immer die Vertragszeile, nie die Config.
 *
 * Alles Datums-Rechnen auf UTC-Kalendertagen (date-Spalten, keine Uhrzeiten).
 * Konvention: `ende` ist der LETZTE Tag der Laufzeit (Kauf 01.08.2026 +
 * 24 Monate → Laufzeitende 31.07.2028).
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { HAUPTPRODUKT_KONDITIONEN } from '@/config/vertraege'

export interface VertragsKonditionen {
  laufzeit_monate: number
  verlaengerung_monate: number
  kuendigungsfrist_monate: number
}

/** Einzige Quelle: config/vertraege.ts — hier nur auf DB-Spaltennamen gemappt. */
export const STANDARD_KONDITIONEN: VertragsKonditionen = {
  laufzeit_monate: HAUPTPRODUKT_KONDITIONEN.mindestlaufzeit_monate,
  verlaengerung_monate: HAUPTPRODUKT_KONDITIONEN.verlaengerung_monate,
  kuendigungsfrist_monate: HAUPTPRODUKT_KONDITIONEN.kuendigungsfrist_monate,
}

/** Monate auf ein ISO-Datum (yyyy-mm-dd) addieren, Monatsende-sicher (31.01. + 1M → 28./29.02.) */
export function addiereMonate(isoDatum: string, monate: number): string {
  const [j, m, t] = isoDatum.split('-').map(Number)
  const ziel = new Date(Date.UTC(j, m - 1 + monate, 1))
  const tageImZielmonat = new Date(Date.UTC(ziel.getUTCFullYear(), ziel.getUTCMonth() + 1, 0)).getUTCDate()
  ziel.setUTCDate(Math.min(t, tageImZielmonat))
  return ziel.toISOString().slice(0, 10)
}

export function heuteIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Einen Kalendertag von einem ISO-Datum abziehen (UTC-sicher). */
function minusEinTag(isoDatum: string): string {
  const [j, m, t] = isoDatum.split('-').map(Number)
  return new Date(Date.UTC(j, m - 1, t - 1)).toISOString().slice(0, 10)
}

/**
 * Ende der Erstlaufzeit = LETZTER Tag der Laufzeit
 * (Kauf 01.08.2026, 24 Monate → 31.07.2028).
 */
export function vertragsende(beginn: string, laufzeitMonate: number): string {
  return minusEinTag(addiereMonate(beginn, laufzeitMonate))
}

/**
 * Wirksames Vertragsende nach der Konditionen-Regel der VERTRAGSZEILE
 * (laufzeit/verlaengerung/frist, Standard aktuell 24/12/3):
 * Kündigung wirkt zum aktuellen Laufzeitende, wenn sie spätestens
 * `kuendigungsfrist_monate` davor eingeht — sonst verlängert sich der
 * Vertrag um `verlaengerung_monate` (ggf. mehrfach, falls das Ende bereits
 * überschritten ist).
 */
export function wirksamesKuendigungsdatum(
  vertrag: VertragsKonditionen & { ende: string },
  kuendigungsDatum: string
): string {
  let ende = vertrag.ende
  // Schutz gegen Endlosschleife bei kaputten Daten
  for (let i = 0; i < 100; i++) {
    const spaetesterEingang = addiereMonate(ende, -vertrag.kuendigungsfrist_monate)
    if (kuendigungsDatum <= spaetesterEingang) return ende
    ende = addiereMonate(ende, Math.max(1, vertrag.verlaengerung_monate))
  }
  return ende
}

// ------------------------------------------------------------
// Upsell-Kopplung (§10.4 + Entscheidung 2026-07-22)
// ------------------------------------------------------------

export interface HauptvertragKonditionen {
  ende: string
  verlaengerung_monate: number
  kuendigungsfrist_monate: number
}

/**
 * Konditionen für einen neuen Upsell-Vertrag: Upsell-Abos übernehmen
 * Restlaufzeit (`ende`), Verlängerung und Kündigungsfrist des aktiven
 * Hauptvertrags — ein Kündigungstermin für alles. Da beide Verträge
 * dasselbe `ende` und dieselbe Verlängerung haben, bleiben sie über
 * `wirksamesKuendigungsdatum` dauerhaft synchron.
 *
 * Ohne aktiven Hauptvertrag: Fallback auf die Config-Werte des Produkts
 * (config/upsells.ts, heutiges Verhalten — monatlich kündbar).
 */
export function gekoppelteUpsellKonditionen(
  hauptVertrag: HauptvertragKonditionen | null,
  produkt: { laufzeitMonate: number; verlaengerungMonate: number; kuendigungsfristMonate: number },
  beginn: string
): { ende: string; verlaengerung_monate: number; kuendigungsfrist_monate: number } {
  if (hauptVertrag) {
    return {
      ende: hauptVertrag.ende,
      verlaengerung_monate: hauptVertrag.verlaengerung_monate,
      kuendigungsfrist_monate: hauptVertrag.kuendigungsfrist_monate,
    }
  }
  return {
    ende: vertragsende(beginn, Math.max(1, produkt.laufzeitMonate)),
    verlaengerung_monate: produkt.verlaengerungMonate,
    kuendigungsfrist_monate: produkt.kuendigungsfristMonate,
  }
}

// ------------------------------------------------------------
// Manuelle Aufgaben (Zero-Fulfillment-Ausnahmen)
// ------------------------------------------------------------

export type ManualTaskTyp =
  | 'MAIL_FEHLGESCHLAGEN'
  | 'DUNNING_ESKALIERT'
  | 'KUENDIGUNG'
  | 'PROVISIONING_LUECKE'
  | 'SONSTIGES'

export interface NeueManualTask {
  typ: ManualTaskTyp
  titel: string
  beschreibung?: string | null
  customer_id?: string | null
  contract_id?: string | null
  demo_id?: string | null
  quelle?: string | null
  faellig_am?: string | null
}

/**
 * Aufgabe anlegen — best effort: Fehler werden geloggt, brechen aber nie
 * den aufrufenden Flow (z.B. einen Stripe-Webhook) ab.
 * Gibt die Task-ID zurück (oder null bei Fehler), damit Aufrufer verknüpfen können.
 */
export async function createManualTask(supabase: SupabaseClient, task: NeueManualTask): Promise<string | null> {
  const { data, error } = await supabase
    .from('manual_tasks')
    .insert({
      typ: task.typ,
      titel: task.titel,
      beschreibung: task.beschreibung ?? null,
      customer_id: task.customer_id ?? null,
      contract_id: task.contract_id ?? null,
      demo_id: task.demo_id ?? null,
      quelle: task.quelle ?? null,
      faellig_am: task.faellig_am ?? null,
      status: 'OFFEN',
    })
    .select('id')
    .single()
  if (error) {
    console.error(`[contracts] manual_task konnte nicht angelegt werden (${task.typ}): ${error.message}`)
    return null
  }
  return (data?.id as string) ?? null
}
