/**
 * Premium-Komposition „scrub-story-v1" — Typen (Muster A4 „Seam-locked Scroll Scrub").
 *
 * Eine Kamerafahrt in 5 nahtlosen Szenen; Scrollen steuert die Zeit.
 * Die Engine ist branchenneutral (Szenen/Farben/Frames kommen aus der Config),
 * der erste Seed ist Photovoltaik („Solarflow", scrub/seed.ts).
 *
 * Render-Modi (mechanisch, kein Stufen-Feld):
 *   frames vorhanden  → 'scrub'    (Sticky-Canvas, Frame-Sequenz an Scroll gebunden)
 *   frames fehlen     → 'statisch' (Szenen als Poster-Sektionen — Zustand vor
 *                                   der Asset-Generierung; nie ohne Poster)
 * prefers-reduced-motion und no-JS zeigen IMMER die Poster-Ansicht.
 *
 * Firmenname/Stadt/Telefon kommen VERBATIM aus business_profiles (meta) —
 * niemals vom LLM formulierbar.
 */

import type { FlagshipMeta, FunnelKonfig, MediaSlot } from '../types'

/** Farb-Tokens der Scrub-Story (Guide-Default: Nacht-Blau + Sonnengelb + Cyan) */
export interface ScrubDesign {
  /** Seitengrund (dunkel, z. B. #07090c) */
  basis: string
  /** Primärtext */
  text: string
  /** Sekundärtext */
  text_soft: string
  /** Hauptakzent (Sonnengelb #f5ff5a) */
  akzent1: string
  /** Zweitakzent (Cyan #00e5ff) */
  akzent2: string
}

/** CTA innerhalb einer Szene (typisch nur in der letzten) */
export interface ScrubAktion {
  label: string
  href: string
  variante: 'primaer' | 'sekundaer'
}

/** Eine Szene der Kamerafahrt */
export interface ScrubSzene {
  /** Kurz-Label für die Punkt-Navigation (z. B. „Sonne") */
  label: string
  /** Eyebrow („Schritt 01 — Die Energiequelle") */
  kicker: string
  titel: string
  text: string
  /** Feature-Tags unter dem Text (z. B. „23% Wirkungsgrad") */
  tags: string[]
  /** Scroll-Gewicht: relative Dauer der Szene (1.6 = 160 dvh Scrollweg) */
  scroll: number
  /** Text-Ausrichtung über dem Video (Copy links oder rechts) */
  align: 'left' | 'right'
  /** Poster der Szene (Fallback statisch/no-JS/reduced-motion; nie ohne Poster) */
  poster: MediaSlot
  aktionen?: ScrubAktion[]
}

/** Frame-Sequenz für den Canvas-Modus (Derivate der 5 Clips, ffmpeg fps=24) */
export interface ScrubFrames {
  /** Pfad-Muster mit NUM-Platzhalter, z. B. /assets/pv/frames/frame-NUM.jpg */
  pfad_muster: string
  /** Gesamtzahl der Frames (Guide: 240 = 5 Clips × 10 s Anteil × 24 fps gekürzt) */
  gesamt: number
  /** Ziffernbreite von NUM (frame-0001.jpg → 4) */
  ziffern: number
  /** Bildrate der extrahierten Sequenz */
  fps: number
  /** Wie viele Frames ab Position vorgeladen werden (Default 20) */
  vorlade?: number
}

export interface ScrubInhalte {
  header: { logo_text: string; cta_label: string }
  /** Scroll-Hinweis über dem Einstieg („Scrollen zum Entdecken") */
  hinweis: string
  szenen: ScrubSzene[]
  /** Ohne frames rendert die Komposition den statischen Poster-Modus */
  frames?: ScrubFrames
  kontakt: { pill: string; h2: string; lead: string; cta_label: string }
  footer: { beschreibung: string; links: { label: string; anker: string }[] }
}

/** Config in demos.config bzw. sites.config — Premium-Komposition */
export interface ScrubConfig {
  engine: 'flagship'
  /** Diskriminator: fester Kompositions-Renderer statt Sektions-Baukasten */
  komposition: 'scrub-story-v1'
  branche_key: string
  meta: FlagshipMeta
  design: ScrubDesign
  inhalte: ScrubInhalte
  funnel: FunnelKonfig
  /** Starter-Semantik wie maler: Layout eingefroren, Chat-Edit nur auf Texte */
  frozen?: boolean
  herkunft?: { quellen?: string[]; generator?: string }
}

export function istScrubKomposition(config: unknown): config is ScrubConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    (config as { komposition?: string }).komposition === 'scrub-story-v1'
  )
}
