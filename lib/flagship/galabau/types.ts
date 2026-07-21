/**
 * Auftrag T1 — Komposition „galabau-landing-v1".
 *
 * Typen für die aus dem GaLaBau-Flagship (GalabauLanding.dc.html) portierte
 * Landing-Komposition. Firmenname/Stadt/Telefon kommen VERBATIM aus
 * business_profiles (meta) — niemals vom LLM formulierbar.
 */

import type { FlagshipMeta, FunnelKonfig, MediaSlot, VideoSlot } from '../types'

export interface GalabauHeader {
  logo_text: string
  /** Zweiter Logo-Teil in font-weight 800 (Flagship: „Grün|Werk") */
  logo_bold?: string
  links: { label: string; anker: string }[]
  cta_label: string
}

export interface GalabauHero {
  badge: string
  /** Wird wortweise in fadeUp-Spans zerlegt (Stagger 0.06s) */
  h1: string
  lead: string
  cta_primaer: string
  cta_sekundaer: string
  media: MediaSlot
  /** Growth-Level: Looping-Video hinter dem Overlay, Fallback = media */
  video?: VideoSlot
  /** Floaty-Review-Karte; entfällt komplett ohne echte Bewertung */
  review?: { text: string; name: string }
}

export interface GalabauUeber {
  pill: string
  zitat: string
  name: string
  rolle: string
  media: MediaSlot
}

export interface GalabauLeistungKarte {
  kategorie: string
  name: string
  titel: string
  text: string
  media: MediaSlot
}

export interface GalabauLeistungen {
  pill: string
  h2: string
  lead: string
  /** 3–10 Sticky-Stack-Karten (top = 90px + 16px·i) */
  karten: GalabauLeistungKarte[]
}

export interface GalabauWarum {
  h2: string
  lead: string
  /** Genau 3 Bild-Karten (4:5) mit Overlay-Text */
  karten: { titel: string; text: string; media: MediaSlot }[]
}

export interface GalabauKpi {
  /** Zielwert des Count-ups */
  zahl: number
  /** true → eine Nachkommastelle mit Komma (4,9) */
  dezimal?: boolean
  /** Statischer Suffix hinter der Zahl (+, ★) */
  suffix?: string
  label: string
}

export interface GalabauReferenzen {
  pill: string
  h2: string
  lead: string
  ba_nachher: MediaSlot
  ba_vorher: MediaSlot
  tag_vorher: string
  tag_nachher: string
  caption: string
  /** KPI-Zeile; entfällt ohne belegbare Zahlen */
  kpis?: GalabauKpi[]
}

export interface GalabauTeam {
  pill: string
  h2: string
  mitglieder: { name: string; rolle: string; media: MediaSlot }[]
}

export interface GalabauCtaBand {
  pill: string
  h2: string
  cta_label: string
  /** Avatar-Kreise (1:1-Derivate aus team/why); entfällt bei leerer Liste */
  avatare: MediaSlot[]
}

export interface GalabauFaq {
  h2: string
  paare: { frage: string; antwort: string }[]
}

export interface GalabauKontakt {
  pill: string
  h2: string
  lead: string
  cta_label: string
  media: MediaSlot
}

export interface GalabauFooter {
  beschreibung: string
}

export interface GalabauInhalte {
  header: GalabauHeader
  hero: GalabauHero
  ueber: GalabauUeber
  leistungen: GalabauLeistungen
  warum: GalabauWarum
  referenzen: GalabauReferenzen
  team: GalabauTeam
  cta_band: GalabauCtaBand
  faq: GalabauFaq
  kontakt: GalabauKontakt
  footer: GalabauFooter
}

/** Config in demos.config bzw. sites.config — Komposition statt freier Sektionsfolge */
export interface GalabauConfig {
  engine: 'flagship'
  /** Diskriminator: fester Kompositions-Renderer statt Sektions-Baukasten */
  komposition: 'galabau-landing-v1'
  branche_key: string
  meta: FlagshipMeta
  inhalte: GalabauInhalte
  funnel: FunnelKonfig
  /** Starter: Layout eingefroren, Chat-Edit nur auf Texte */
  frozen?: boolean
  herkunft?: { quellen?: string[]; generator?: string }
}

export function istGalabauKomposition(config: unknown): config is GalabauConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    (config as { komposition?: string }).komposition === 'galabau-landing-v1'
  )
}
