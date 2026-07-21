/**
 * Premium-Komposition „scrub-story-v1" — Copy-Slots.
 *
 * Muster wie galabau/maler: jeder Text ist ein Slot, Limit = Seed-Länge + 15 %
 * (aufgerundet). Szenen-Slots sind indiziert (szenen[n].kicker/titel/text/…).
 * Firmenname/Stadt/Telefon kommen VERBATIM aus business_profiles — sie sind
 * KEINE Copy-Slots und niemals vom LLM formulierbar.
 * (Modul-private Helfer aus galabau/copy-slots.ts hier dupliziert —
 * galabau-Dateien bleiben unangetastet.)
 */

import type { CopySlot, CopyVerstoss } from '../galabau/copy-slots'
import { scrubStorySeed } from './seed'
import type { ScrubConfig, ScrubInhalte } from './types'

/** meta-Felder, die verbatim übernommen werden — nie LLM-formuliert */
export const SCRUB_VERBATIM_FELDER = ['firma', 'ort', 'telefon'] as const

function limit(text: string): number {
  return Math.ceil(text.length * 1.15)
}

function slot(pfad: string, text: string, pflicht: boolean): CopySlot {
  return { pfad, limit: limit(text), pflicht, default: text }
}

/** Slot-Liste aus einem Seed ableiten (Limits folgen dem Seed-Text) */
export function scrubCopySlots(seed: ScrubConfig = scrubStorySeed): CopySlot[] {
  const i = seed.inhalte
  const slots: CopySlot[] = [
    slot('header.cta_label', i.header.cta_label, true),
    slot('hinweis', i.hinweis, false),
    slot('kontakt.pill', i.kontakt.pill, false),
    slot('kontakt.h2', i.kontakt.h2, true),
    slot('kontakt.lead', i.kontakt.lead, true),
    slot('kontakt.cta_label', i.kontakt.cta_label, true),
    slot('footer.beschreibung', i.footer.beschreibung, false),
  ]
  i.szenen.forEach((s, n) => {
    slots.push(slot(`szenen[${n}].label`, s.label, true))
    slots.push(slot(`szenen[${n}].kicker`, s.kicker, true))
    slots.push(slot(`szenen[${n}].titel`, s.titel, true))
    slots.push(slot(`szenen[${n}].text`, s.text, true))
    s.tags.forEach((t, m) => {
      slots.push(slot(`szenen[${n}].tags[${m}]`, t, false))
    })
    ;(s.aktionen ?? []).forEach((a, m) => {
      slots.push(slot(`szenen[${n}].aktionen[${m}].label`, a.label, true))
    })
  })
  return slots
}

/** Vorberechnete Slot-Liste des Scrub-Seeds */
export const SCRUB_COPY_SLOTS: readonly CopySlot[] = scrubCopySlots()

function liesPfad(inhalte: ScrubInhalte, pfad: string): unknown {
  return pfad.split('.').reduce<unknown>((obj, teil) => {
    if (obj === undefined || obj === null) return undefined
    const m = teil.match(/^(\w+)\[(\d+)\]$/)
    if (m) {
      const arr = (obj as Record<string, unknown>)[m[1]]
      return Array.isArray(arr) ? arr[Number(m[2])] : undefined
    }
    return (obj as Record<string, unknown>)[teil]
  }, inhalte)
}

/**
 * Prüft generierte Inhalte gegen die Slot-Limits des Seeds.
 * Szenen-/Tag-Anzahlen dürfen abweichen — geprüft wird, was an den Pfaden
 * existiert; fehlende Pflicht-Slots werden gemeldet, sofern der Eltern-Index
 * existiert (Szene n vorhanden, Titel fehlt).
 */
export function pruefeScrubCopySlots(inhalte: ScrubInhalte): CopyVerstoss[] {
  const verstoesse: CopyVerstoss[] = []
  const slots = scrubCopySlots()
  for (const s of slots) {
    const wert = liesPfad(inhalte, s.pfad)
    if (wert === undefined || wert === null || wert === '') {
      const elternPfad = s.pfad.replace(/\.\w+$/, '')
      const eltern = elternPfad.includes('[') ? liesPfad(inhalte, elternPfad) : true
      if (s.pflicht && eltern) verstoesse.push({ pfad: s.pfad, grund: 'fehlt', limit: s.limit, laenge: 0 })
      continue
    }
    if (typeof wert === 'string' && wert.length > s.limit) {
      verstoesse.push({ pfad: s.pfad, grund: 'zu_lang', limit: s.limit, laenge: wert.length })
    }
  }
  return verstoesse
}
