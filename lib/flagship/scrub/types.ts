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
  /** Unterseiten-Inhalte — wenn gesetzt, wird die Nav erweitert */
  unterseiten?: ScrubUnterseiten
}

/** Karriere-Seite: Benefits, offene Stellen, Bewerbungsformular */
export interface ScrubKarriereInhalt {
  eyebrow: string
  headline: string
  lead: string
  benefits: { icon: string; titel: string; text: string }[]
  stellen: { titel: string; ort: string; typ: string; beschreibung: string }[]
  cta_label: string
}

/** Vorher/Nachher-Projekt */
export interface ScrubProjekt {
  titel: string
  ort: string
  typ: string
  vorher: string
  nachher: string
  ergebnis: string
  kennzahlen?: { label: string; wert: string }[]
  /** Bild-URL für Vorher-Zustand (optional — ohne Bild wird Text-Vergleich angezeigt) */
  bild_vorher?: string
  /** Bild-URL für Nachher-Zustand */
  bild_nachher?: string
}

/** Erfahrungen: Team-Testimonials + Fallstudien + Vorher/Nachher-Projekte */
export interface ScrubErfahrungenInhalt {
  eyebrow: string
  headline: string
  stimmen: { name: string; rolle: string; text: string; initialen: string }[]
  fallstudien: { titel: string; kunde: string; ergebnis: string; beschreibung: string }[]
  /** Vorher/Nachher-Projektbeispiele */
  projekte?: ScrubProjekt[]
}

/** Leistungen: Detaillierte Services */
export interface ScrubLeistungenInhalt {
  eyebrow: string
  headline: string
  lead: string
  leistungen: { titel: string; text: string; icon: string }[]
}

/** Ziele-Seite: Trainingsziele mit Beschreibung */
export interface ScrubZieleInhalt {
  eyebrow: string
  headline: string
  lead: string
  ziele: { titel: string; text: string; icon: string }[]
}

/** Angebote-Seite: Mitgliedschaften, Pakete, Preise */
export interface ScrubAngeboteInhalt {
  eyebrow: string
  headline: string
  lead: string
  pakete: { titel: string; preis: string; intervall: string; features: string[]; highlight?: boolean }[]
  hinweis?: string
}

/** Zielgruppen-Seite: SEO-Landingpage für eine spezifische Zielgruppe (z. B. Investoren, Hausverwaltungen) */
export interface ScrubZielgruppeInhalt {
  slug: string
  nav_label: string
  seo_titel: string
  seo_beschreibung: string
  eyebrow: string
  headline: string
  lead: string
  /** Probleme/Herausforderungen dieser Zielgruppe */
  herausforderungen: { titel: string; text: string; icon: string }[]
  /** Wie das Unternehmen diese Probleme löst */
  loesungen: { titel: string; text: string; icon: string }[]
  /** Relevante Leistungen für diese Zielgruppe */
  relevante_leistungen: { titel: string; text: string; href?: string }[]
  /** Abschluss-CTA */
  cta: { headline: string; text: string; label: string }
}

/** Leistungs-Detail-Seite: Einzelne Leistung mit Ablauf, Vorteilen, CTA */
export interface ScrubLeistungDetailInhalt {
  slug: string
  nav_label: string
  seo_titel: string
  seo_beschreibung: string
  eyebrow: string
  headline: string
  lead: string
  /** Ablauf/Prozess-Schritte */
  ablauf: { schritt: string; titel: string; text: string }[]
  /** Vorteile dieser Leistung */
  vorteile: { titel: string; text: string; icon: string }[]
  /** Abschluss-CTA */
  cta: { headline: string; text: string; label: string }
}

export interface ScrubUnterseiten {
  karriere?: ScrubKarriereInhalt
  erfahrungen?: ScrubErfahrungenInhalt
  leistungen?: ScrubLeistungenInhalt
  ziele?: ScrubZieleInhalt
  angebote?: ScrubAngeboteInhalt
  /** Dynamische Zielgruppen-SEO-Seiten (slug → Inhalt) */
  zielgruppen?: Record<string, ScrubZielgruppeInhalt>
  /** Dynamische Leistungs-Detail-Seiten (slug → Inhalt) */
  leistung_details?: Record<string, ScrubLeistungDetailInhalt>
}

/** Feste Unterseiten-Slugs */
export type ScrubUnterseitenSlug = 'karriere' | 'erfahrungen' | 'leistungen' | 'kontakt' | 'ziele' | 'angebote'

export const SCRUB_UNTERSEITEN: { slug: ScrubUnterseitenSlug; label: string }[] = [
  { slug: 'leistungen', label: 'Leistungen' },
  { slug: 'ziele', label: 'Ziele' },
  { slug: 'angebote', label: 'Angebote' },
  { slug: 'erfahrungen', label: 'Erfahrungen' },
  { slug: 'karriere', label: 'Karriere' },
  { slug: 'kontakt', label: 'Kontakt' },
]

/** Nav-Link mit optionalen Unter-Links für Dropdown */
export interface ScrubNavLink {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

/** Alle Nav-Links inkl. dynamischer Seiten aus der Config.
 *  Leistungs-Details werden unter "Leistungen" gruppiert,
 *  regionale SEO-Seiten bleiben unsichtbar in der Nav (nur intern verlinkt). */
export function scrubAlleNavLinks(
  config: ScrubConfig,
  basisPfad: string
): ScrubNavLink[] {
  const links: ScrubNavLink[] = []

  // Leistungen + Detail-Unterseiten als Dropdown
  if (config.unterseiten?.leistungen || config.unterseiten?.leistung_details) {
    const children: { label: string; href: string }[] = []
    if (config.unterseiten.leistung_details) {
      for (const ld of Object.values(config.unterseiten.leistung_details)) {
        children.push({ label: ld.nav_label, href: `${basisPfad}/${ld.slug}` })
      }
    }
    links.push({
      label: 'Leistungen',
      href: `${basisPfad}/leistungen`,
      children: children.length > 0 ? children : undefined,
    })
  }

  // Zielgruppen — nur nicht-regionale (Investoren, Hausverwaltungen) in Hauptnav
  if (config.unterseiten?.zielgruppen) {
    for (const zg of Object.values(config.unterseiten.zielgruppen)) {
      // Regionale SEO-Seiten (sanierung-*) nicht in der Hauptnav
      if (zg.slug.startsWith('sanierung-')) continue
      links.push({ label: zg.nav_label, href: `${basisPfad}/${zg.slug}` })
    }
  }

  if (config.unterseiten?.ziele) links.push({ label: 'Ziele', href: `${basisPfad}/ziele` })
  if (config.unterseiten?.angebote) links.push({ label: 'Angebote', href: `${basisPfad}/angebote` })
  if (config.unterseiten?.erfahrungen) links.push({ label: 'Referenzen', href: `${basisPfad}/erfahrungen` })
  if (config.unterseiten?.karriere) links.push({ label: 'Karriere', href: `${basisPfad}/karriere` })
  links.push({ label: 'Kontakt', href: `${basisPfad}/kontakt` })
  return links
}

export function istScrubKomposition(config: unknown): config is ScrubConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    (config as { komposition?: string }).komposition === 'scrub-story-v1'
  )
}
