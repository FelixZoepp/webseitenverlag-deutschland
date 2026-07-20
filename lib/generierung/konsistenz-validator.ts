/**
 * Phase 3 (MVP_FINISH_PROMPT §4.3): Konsistenz-Validator — HARTES Gate.
 *
 * Läuft nach dem Rendern über HTML + Config + Asset-Meta.
 * Fail ⇒ 1 Copy-Retry ⇒ erneut prüfen ⇒ Fail ⇒ Job "failed" mit lesbarem
 * Grund. NIEMALS demo_bereit bei Verstößen.
 */

import type { FlagshipConfig, MediaSlot } from '@/lib/flagship/types'
import type { DemoAssetMeta } from '@/lib/pipeline/generate-flagship-demo'
import { findeFremdeStaedte } from './staedte-blockliste'

export interface ValidatorVerstoss {
  regel: string
  detail: string
}

export interface ValidatorReport {
  ok: boolean
  verstoesse: ValidatorVerstoss[]
  geprueft_am: string
}

export interface ValidatorOptionen {
  /** Gibt es echte Bewertungen aus Profildaten? (Formular: nein) */
  echteBewertungen?: boolean
  /** Erwartete Seitenverhältnisse der Bild-Slots (Default: alle 16:9) */
  erwarteteRatio?: number
  /** Toleranz fürs Seitenverhältnis (Default 5 %) */
  ratioToleranz?: number
}

// ------------------------------------------------------------
// HTML-Hilfen (bewusst ohne DOM-Dependency, Regex reicht fürs Gate)
// ------------------------------------------------------------

/** Sichtbarer Text: Skripte/Styles raus, Tags raus */
function sichtbarerText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
}

function alleImgTags(html: string): string[] {
  return html.match(/<img\b[^>]*>/gi) ?? []
}

function attrWert(tag: string, attr: string): string | null {
  const m = tag.match(new RegExp(`${attr}\\s*=\\s*"([^"]*)"`, 'i'))
  return m ? m[1] : null
}

// ------------------------------------------------------------
// Einzelregeln
// ------------------------------------------------------------

function pruefeFremdeStaedte(html: string, kundenstadt: string): ValidatorVerstoss[] {
  const text = sichtbarerText(html)
  return findeFremdeStaedte(text, kundenstadt).map((stadt) => ({
    regel: 'fremde_stadt',
    detail: `Fremde Stadt "${stadt}" taucht im Text auf — erlaubt ist nur ${kundenstadt}.`,
  }))
}

function pruefePflichtSlots(config: FlagshipConfig): ValidatorVerstoss[] {
  const fehlend: string[] = []
  if (!config.inhalte.hero.media.datei) fehlend.push('hero')
  if (!config.inhalte.signature.vorher.datei) fehlend.push('signature-vorher')
  if (!config.inhalte.signature.nachher.datei) fehlend.push('signature-nachher')
  if (config.inhalte.ergebnisse.variante === 'ba_slider') {
    config.inhalte.ergebnisse.paare?.forEach((p, i) => {
      if (!p.vorher.datei) fehlend.push(`ergebnis-${i}-vorher`)
      if (!p.nachher.datei) fehlend.push(`ergebnis-${i}-nachher`)
    })
  }
  return fehlend.map((slot) => ({
    regel: 'pflicht_slot_leer',
    detail: `Pflicht-Bild-Slot "${slot}" ist nicht befüllt.`,
  }))
}

function pruefeLeereSrc(html: string): ValidatorVerstoss[] {
  const verstoesse: ValidatorVerstoss[] = []
  for (const tag of alleImgTags(html)) {
    const src = attrWert(tag, 'src')
    if (src === null || src.trim() === '') {
      verstoesse.push({ regel: 'leerer_src', detail: `<img> ohne src: ${tag.slice(0, 120)}` })
    }
  }
  return verstoesse
}

function pruefeToteLinks(html: string): ValidatorVerstoss[] {
  const anzahl = (html.match(/href\s*=\s*"#"/gi) ?? []).length
  return anzahl > 0
    ? [{ regel: 'toter_link', detail: `${anzahl}× toter Link href="#" gefunden.` }]
    : []
}

function pruefeRoheEntities(html: string): ValidatorVerstoss[] {
  // Doppelt escapte Entities werden dem Besucher als Text angezeigt
  const funde = sichtbarerText(html).match(/&amp;(?:amp|auml|ouml|uuml|Auml|Ouml|Uuml|szlig|quot|nbsp|#\d+);/g)
  return funde
    ? [{ regel: 'rohe_entities', detail: `Sichtbare HTML-Entities im Text: ${Array.from(new Set(funde)).join(', ')}` }]
    : []
}

function pruefePlatzhalter(html: string): ValidatorVerstoss[] {
  const verstoesse: ValidatorVerstoss[] = []
  if (/lorem/i.test(sichtbarerText(html))) {
    verstoesse.push({ regel: 'lorem', detail: 'Platzhaltertext "Lorem" gefunden.' })
  }
  if (html.includes('{{')) {
    verstoesse.push({ regel: 'token_rest', detail: 'Unaufgelöstes Template-Token "{{" gefunden.' })
  }
  return verstoesse
}

function pruefeImgAttribute(html: string): ValidatorVerstoss[] {
  const verstoesse: ValidatorVerstoss[] = []
  for (const tag of alleImgTags(html)) {
    const kurz = tag.slice(0, 120)
    const alt = attrWert(tag, 'alt')
    if (!alt || alt.trim().length < 4) {
      verstoesse.push({ regel: 'img_alt', detail: `<img> ohne aussagekräftigen alt-Text: ${kurz}` })
    }
    const w = attrWert(tag, 'width')
    const h = attrWert(tag, 'height')
    if (!w || !h || !Number(w) || !Number(h)) {
      verstoesse.push({ regel: 'img_dimensionen', detail: `<img> ohne width/height: ${kurz}` })
    }
  }
  return verstoesse
}

function slotRatioVerstoss(
  slot: MediaSlot,
  name: string,
  erwartet: number,
  toleranz: number
): ValidatorVerstoss | null {
  if (!slot.datei || !slot.breite || !slot.hoehe) return null
  const ratio = slot.breite / slot.hoehe
  if (Math.abs(ratio - erwartet) / erwartet > toleranz) {
    return {
      regel: 'aspect_ratio',
      detail: `Slot "${name}": Seitenverhältnis ${ratio.toFixed(2)} weicht mehr als ±${Math.round(toleranz * 100)} % vom Soll ${erwartet.toFixed(2)} ab.`,
    }
  }
  return null
}

function pruefeAspectRatios(config: FlagshipConfig, erwartet: number, toleranz: number): ValidatorVerstoss[] {
  const slots: [MediaSlot, string][] = [
    [config.inhalte.hero.media, 'hero'],
    [config.inhalte.signature.vorher, 'signature-vorher'],
    [config.inhalte.signature.nachher, 'signature-nachher'],
  ]
  config.inhalte.ergebnisse.paare?.forEach((p, i) => {
    slots.push([p.vorher, `ergebnis-${i}-vorher`], [p.nachher, `ergebnis-${i}-nachher`])
  })
  const verstoesse: ValidatorVerstoss[] = []
  for (const [slot, name] of slots) {
    const v = slotRatioVerstoss(slot, name, erwartet, toleranz)
    if (v) verstoesse.push(v)
  }
  return verstoesse
}

function pruefeDoppelteBilder(html: string): ValidatorVerstoss[] {
  const gesehen = new Map<string, number>()
  for (const tag of alleImgTags(html)) {
    const src = attrWert(tag, 'src')?.trim()
    if (src) gesehen.set(src, (gesehen.get(src) ?? 0) + 1)
  }
  return Array.from(gesehen.entries())
    .filter(([, n]) => n > 1)
    .map(([src, n]) => ({
      regel: 'doppeltes_bild',
      detail: `Bild-URL ${n}× verwendet: ${src.slice(0, 100)}`,
    }))
}

function pruefeSignaturePaar(config: FlagshipConfig, assetMeta?: DemoAssetMeta): ValidatorVerstoss[] {
  const s = config.inhalte.signature
  if (!s.vorher.datei && !s.nachher.datei) return []
  if (!assetMeta?.paar) {
    return [{
      regel: 'signature_paar',
      detail: 'Vorher/Nachher-Bilder ohne dokumentiertes Paar (asset_meta.paar fehlt).',
    }]
  }
  if (assetMeta.paar.quelle === 'bank' && !assetMeta.paar.pair_id) {
    return [{
      regel: 'signature_paar',
      detail: 'Vorher/Nachher aus der Bank ohne gemeinsame pair_id — kein echtes Paar.',
    }]
  }
  return []
}

function pruefeBewertungen(config: FlagshipConfig, echteBewertungen: boolean): ValidatorVerstoss[] {
  const quotes = config.inhalte.stimmen.quotes
  if (quotes.length > 0 && !echteBewertungen) {
    return [{
      regel: 'erfundene_bewertungen',
      detail: `${quotes.length} Kundenstimme(n) vorhanden, aber keine echten Bewertungen in den Profildaten — Sektion muss entfallen.`,
    }]
  }
  return []
}

// ------------------------------------------------------------
// Öffentliche API
// ------------------------------------------------------------

export function validiereKonsistenz(
  html: string,
  config: FlagshipConfig,
  kundenstadt: string,
  assetMeta?: DemoAssetMeta,
  optionen: ValidatorOptionen = {}
): ValidatorReport {
  const erwartet = optionen.erwarteteRatio ?? 16 / 9
  const toleranz = optionen.ratioToleranz ?? 0.05

  const verstoesse: ValidatorVerstoss[] = [
    ...pruefeFremdeStaedte(html, kundenstadt),
    ...pruefePflichtSlots(config),
    ...pruefeLeereSrc(html),
    ...pruefeToteLinks(html),
    ...pruefeRoheEntities(html),
    ...pruefePlatzhalter(html),
    ...pruefeImgAttribute(html),
    ...pruefeAspectRatios(config, erwartet, toleranz),
    ...pruefeDoppelteBilder(html),
    ...pruefeSignaturePaar(config, assetMeta),
    ...pruefeBewertungen(config, optionen.echteBewertungen ?? false),
  ]

  return { ok: verstoesse.length === 0, verstoesse, geprueft_am: new Date().toISOString() }
}

/** Menschenlesbare Zusammenfassung für generation_jobs.fehler_grund */
export function reportAlsText(report: ValidatorReport): string {
  if (report.ok) return 'Konsistenz-Validator: alle Prüfungen bestanden.'
  return `Konsistenz-Validator: ${report.verstoesse.length} Verstoß/Verstöße — ${report.verstoesse
    .map((v) => `[${v.regel}] ${v.detail}`)
    .join(' | ')}`
}
