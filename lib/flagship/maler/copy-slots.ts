/**
 * Template-Fabrik B2 — Copy-Slots der Komposition „maler-landing-v1".
 *
 * Muster wie galabau/copy-slots.ts: jeder Text ist ein Slot, Limit =
 * Seed-Länge + 15 % (aufgerundet). Zusätzlich zu den GaLaBau-Slots:
 * wand.*, galerie.*, module.einzugsgebiet.* und leistung_details[n].*.
 * Firmenname/Stadt/Telefon kommen VERBATIM aus business_profiles —
 * sie sind KEINE Copy-Slots und niemals vom LLM formulierbar.
 * (Modul-private Helfer aus galabau/copy-slots.ts hier dupliziert —
 * galabau-Dateien bleiben unangetastet.)
 */

import type { CopySlot, CopyVerstoss } from '../galabau/copy-slots'
import { malerLandingSeed } from './seed'
import type { MalerConfig, MalerInhalte } from './types'

/** meta-Felder, die verbatim übernommen werden — nie LLM-formuliert */
export const MALER_VERBATIM_FELDER = ['firma', 'ort', 'telefon'] as const

function limit(text: string): number {
  return Math.ceil(text.length * 1.15)
}

function slot(pfad: string, text: string, pflicht: boolean): CopySlot {
  return { pfad, limit: limit(text), pflicht, default: text }
}

/** Slot-Liste aus einem Seed ableiten (Limits folgen dem Seed-Text) */
export function malerCopySlots(seed: MalerConfig = malerLandingSeed): CopySlot[] {
  const i = seed.inhalte
  const slots: CopySlot[] = [
    slot('header.cta_label', i.header.cta_label, false),
    slot('hero.badge', i.hero.badge, false),
    slot('hero.h1', i.hero.h1, true),
    slot('hero.lead', i.hero.lead, true),
    slot('hero.cta_primaer', i.hero.cta_primaer, true),
    slot('hero.cta_sekundaer', i.hero.cta_sekundaer, false),
    slot('wand.pill', i.wand.pill, false),
    slot('wand.h2', i.wand.h2, true),
    slot('wand.text', i.wand.text, true),
    slot('wand.tag_von', i.wand.tag_von, false),
    slot('wand.tag_zu', i.wand.tag_zu, false),
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
  if (i.galerie) {
    slots.push(slot('galerie.h2', i.galerie.h2, false))
    slots.push(slot('galerie.lead', i.galerie.lead, false))
  }
  if (i.module?.einzugsgebiet) {
    slots.push(slot('module.einzugsgebiet.h2', i.module.einzugsgebiet.h2, false))
    slots.push(slot('module.einzugsgebiet.lead', i.module.einzugsgebiet.lead, false))
  }
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
  ;(i.leistung_details ?? []).forEach((d, n) => {
    slots.push(slot(`leistung_details[${n}].intro`, d.intro, true))
    slots.push(slot(`leistung_details[${n}].cta_label`, d.cta_label, true))
    d.faq.forEach((p, m) => {
      slots.push(slot(`leistung_details[${n}].faq[${m}].frage`, p.frage, true))
      slots.push(slot(`leistung_details[${n}].faq[${m}].antwort`, p.antwort, true))
    })
  })
  return slots
}

/** Vorberechnete Slot-Liste des Maler-Seeds */
export const MALER_COPY_SLOTS: readonly CopySlot[] = malerCopySlots()

function liesPfad(inhalte: MalerInhalte, pfad: string): unknown {
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
 * Karten-/FAQ-/Detail-Anzahlen dürfen abweichen — geprüft wird, was an den
 * Pfaden existiert; fehlende Pflicht-Slots werden gemeldet, sofern der
 * Eltern-Index existiert (Karte n vorhanden, Text fehlt).
 */
export function pruefeMalerCopySlots(inhalte: MalerInhalte): CopyVerstoss[] {
  const verstoesse: CopyVerstoss[] = []
  const slots = malerCopySlots()
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
