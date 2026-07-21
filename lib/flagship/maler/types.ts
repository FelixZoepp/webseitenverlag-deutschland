/**
 * Template-Fabrik B2 (Branche 2) — Typen der Komposition „maler-landing-v1".
 *
 * Abgeleitet von galabau-landing-v1 (Struktur/Animations-Grammatik unangetastet).
 * NEU gegenüber GaLaBau: Signature-Wand (färbt sich beim Scroll Altweiß → Salbei),
 * Galerie, Growth-Module (WhatsApp, Rückruf, Datei-Anhang, Einzugsgebiet, Reviews)
 * und Leistungs-Detailseiten für die Growth-Unterseiten /leistungen/{slug}.
 *
 * Firmenname/Stadt/Telefon kommen VERBATIM aus business_profiles (meta) —
 * niemals vom LLM formulierbar.
 */

import type { FlagshipMeta, FunnelKonfig, MediaSlot } from '../types'
import type { GalabauInhalte } from '../galabau/types'

/** Render-Stufe der Komposition (Zuordnung Tier → Stufe NUR in config/plans.ts) */
export type MalerStufe = 'statisch' | 'video' | 'growth'

/** Signature-Sektion: Wand färbt sich beim Scrollen von Altweiß zu Salbei */
export interface MalerWand {
  pill: string
  h2: string
  text: string
  /** Farb-Tag links auf der Wand (Ausgangston, z. B. „Altweiß") */
  tag_von: string
  /** Farb-Tag rechts auf der Wand (Zielton, z. B. „Salbei") */
  tag_zu: string
}

export interface MalerGalerieBild {
  media: MediaSlot
  /** Filter-Kategorie (Referenz-Galerie mit Filter, Growth-Modul) */
  kategorie: string
}

/** Referenz-Galerie (Stufe video: Grid; Growth-Unterseite /referenzen: mit Filter) */
export interface MalerGalerie {
  pill: string
  h2: string
  lead: string
  bilder: MalerGalerieBild[]
}

/** Growth-Funktions-Module (Auswahl laut Steckbrief; nur Stufe growth gerendert) */
export interface MalerModule {
  /** WhatsApp-Button (wa.me-Link mechanisch aus meta.telefon — nie LLM) */
  whatsapp?: boolean
  /** Rückruf-Checkbox im Kontaktformular */
  rueckruf?: boolean
  /** Foto-Upload im Kontaktformular (nur mit submitZiel wirksam) */
  datei_anhang?: boolean
  /** Einzugsgebiets-Sektion: Orts-Chips (verbatim), self-contained (keine Karten-Tiles) */
  einzugsgebiet?: { h2: string; lead: string; orte: string[] }
  /** Google-Reviews — NUR echte, NIE erfunden; Sektion entfällt ohne Einträge */
  reviews?: { text: string; name: string; sterne: number }[]
}

/** Inhalt einer Growth-Unterseite /leistungen/{slug} */
export interface MalerLeistungDetail {
  /** Slug, muss malerLeistungSlug(karte.name) entsprechen */
  slug: string
  intro: string
  faq: { frage: string; antwort: string }[]
  cta_label: string
}

export interface MalerInhalte extends GalabauInhalte {
  wand: MalerWand
  /** Galerie (ab Stufe video); entfällt komplett ohne Bilder */
  galerie?: MalerGalerie
  /** Growth-Module (Steckbrief-Auswahl) */
  module?: MalerModule
  /** Growth-Unterseiten /leistungen/{slug} */
  leistung_details?: MalerLeistungDetail[]
}

/** Config in demos.config bzw. sites.config — Komposition statt freier Sektionsfolge */
export interface MalerConfig {
  engine: 'flagship'
  /** Diskriminator: fester Kompositions-Renderer statt Sektions-Baukasten */
  komposition: 'maler-landing-v1'
  branche_key: string
  meta: FlagshipMeta
  inhalte: MalerInhalte
  funnel: FunnelKonfig
  /** Scroll-Story-Signature (Growth-Extra): 'on' = Scrub statt Einmal-Lauf. Default off. */
  signature_story?: 'on' | 'off'
  /** Starter: Layout eingefroren, Chat-Edit nur auf Texte */
  frozen?: boolean
  herkunft?: { quellen?: string[]; generator?: string }
}

export function istMalerKomposition(config: unknown): config is MalerConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    (config as { komposition?: string }).komposition === 'maler-landing-v1'
  )
}
