/**
 * Auftrag T1.4 — Copy-Slots mit Zeichenlimits.
 *
 * Jeder Flagship-Text ist ein Slot; Limit = Flagship-Länge + 15 % (aufgerundet).
 * Pflicht-Slots: H1, Sub(lead), CTA, je Leistung Titel+Teaser+Text, FAQ-Paare,
 * Kontakt. Firmenname/Stadt/Telefon kommen VERBATIM aus business_profiles —
 * sie sind KEINE Copy-Slots und niemals vom LLM formulierbar.
 */

import { galabauLandingSeed } from './seed'
import type { GalabauConfig, GalabauInhalte } from './types'

/** meta-Felder, die verbatim übernommen werden — nie LLM-formuliert */
export const GALABAU_VERBATIM_FELDER = ['firma', 'ort', 'telefon'] as const

export interface CopySlot {
  /** Pfad im inhalte-Objekt, z. B. 'hero.h1' oder 'leistungen.karten[0].titel' */
  pfad: string
  /** Zeichenlimit = Seed-Länge + 15 % */
  limit: number
  pflicht: boolean
  /** Flagship-Text als Default */
  default: string
}

function limit(text: string): number {
  return Math.ceil(text.length * 1.15)
}

function slot(pfad: string, text: string, pflicht: boolean): CopySlot {
  return { pfad, limit: limit(text), pflicht, default: text }
}

/** Slot-Liste aus einem Seed ableiten (Limits folgen dem Seed-Text) */
export function galabauCopySlots(seed: GalabauConfig = galabauLandingSeed): CopySlot[] {
  const i = seed.inhalte
  const slots: CopySlot[] = [
    slot('header.cta_label', i.header.cta_label, false),
    slot('hero.badge', i.hero.badge, false),
    slot('hero.h1', i.hero.h1, true),
    slot('hero.lead', i.hero.lead, true),
    slot('hero.cta_primaer', i.hero.cta_primaer, true),
    slot('hero.cta_sekundaer', i.hero.cta_sekundaer, false),
    slot('ueber.zitat', i.ueber.zitat, false),
    slot('ueber.rolle', i.ueber.rolle, false),
    slot('leistungen.h2', i.leistungen.h2, false),
    slot('leistungen.lead', i.leistungen.lead, false),
    slot('warum.h2', i.warum.h2, false),
    slot('warum.lead', i.warum.lead, false),
    slot('referenzen.h2', i.referenzen.h2, false),
    slot('referenzen.lead', i.referenzen.lead, false),
    slot('referenzen.caption', i.referenzen.caption, false),
    slot('team.h2', i.team.h2, false),
    slot('cta_band.h2', i.cta_band.h2, false),
    slot('cta_band.cta_label', i.cta_band.cta_label, false),
    slot('faq.h2', i.faq.h2, false),
    slot('kontakt.h2', i.kontakt.h2, true),
    slot('kontakt.lead', i.kontakt.lead, true),
    slot('kontakt.cta_label', i.kontakt.cta_label, true),
    slot('footer.beschreibung', i.footer.beschreibung, false),
  ]
  i.leistungen.karten.forEach((k, n) => {
    slots.push(slot(`leistungen.karten[${n}].name`, k.name, true))
    slots.push(slot(`leistungen.karten[${n}].titel`, k.titel, true))
    slots.push(slot(`leistungen.karten[${n}].text`, k.text, true))
    slots.push(slot(`leistungen.karten[${n}].kategorie`, k.kategorie, false))
  })
  i.warum.karten.forEach((k, n) => {
    slots.push(slot(`warum.karten[${n}].titel`, k.titel, false))
    slots.push(slot(`warum.karten[${n}].text`, k.text, false))
  })
  i.faq.paare.forEach((p, n) => {
    slots.push(slot(`faq.paare[${n}].frage`, p.frage, true))
    slots.push(slot(`faq.paare[${n}].antwort`, p.antwort, true))
  })
  return slots
}

/** Vorberechnete Slot-Liste des Flagship-Seeds */
export const GALABAU_COPY_SLOTS: readonly CopySlot[] = galabauCopySlots()

function liesPfad(inhalte: GalabauInhalte, pfad: string): unknown {
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

export interface CopyVerstoss {
  pfad: string
  grund: 'fehlt' | 'zu_lang'
  limit: number
  laenge: number
}

/**
 * Prüft generierte Inhalte gegen die Slot-Limits des Seeds.
 * Karten-/FAQ-Anzahlen dürfen abweichen (3–10 Leistungen) — geprüft wird,
 * was an den Pfaden existiert; fehlende Pflicht-Slots werden gemeldet,
 * sofern der Index existiert (Karte n vorhanden, Text fehlt).
 */
export function pruefeCopySlots(inhalte: GalabauInhalte): CopyVerstoss[] {
  const verstoesse: CopyVerstoss[] = []
  const slots = galabauCopySlots()
  for (const s of slots) {
    const wert = liesPfad(inhalte, s.pfad)
    if (wert === undefined || wert === null || wert === '') {
      // Index existiert nicht (weniger Karten/FAQs als im Seed) → kein Verstoß
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
