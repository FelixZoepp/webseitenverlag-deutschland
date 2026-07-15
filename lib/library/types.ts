/**
 * Template-Library — Typen (Mission §6/§7, Phase C)
 *
 * Prinzip: Inhalt & Komposition in der DB (section_library, library_pages,
 * stock_assets), Präsentation im Code. Die Generierungs-Pipeline (Phase D)
 * füllt content_schema-Felder mit firmenspezifischen Inhalten.
 */

/** 10-Sektionen-Storytelling-Skeleton (§2), in empfohlener Reihenfolge */
export const SECTION_TYPES = [
  'hero',
  'trust_bar',
  'problem',
  'loesung',
  'leistungen',
  'prozess',
  'referenzen',
  'ueber_uns',
  'faq',
  'kontakt_cta',
] as const

export type SectionType = (typeof SECTION_TYPES)[number]

export const STILE = ['klar', 'warm'] as const
export type Stil = (typeof STILE)[number]

/** Branchen der ersten Seeding-Runde (4 × 2 Stile = 8 Kompositionen) */
export const SEED_BRANCHEN = ['Handwerk', 'Gastronomie', 'Friseur', 'Gesundheit'] as const
export type SeedBranche = (typeof SEED_BRANCHEN)[number]

/** Feld-Beschreibung im content_schema einer Sektion */
export interface ContentFieldSchema {
  typ: 'text' | 'textarea' | 'liste' | 'bild'
  beschreibung: string
  maxZeichen?: number
  /** Bei typ 'liste': Felder der Listeneinträge */
  itemFelder?: Record<string, ContentFieldSchema>
}

export interface LibrarySection {
  key: string
  section_type: SectionType
  branche: string | null
  stil: Stil | null
  name: string
  beschreibung?: string
  content_schema: Record<string, ContentFieldSchema>
  default_content: Record<string, unknown>
  sort_hint: number
  aktiv?: boolean
}

export interface PageSectionRef {
  section_key: string
  /** Überschreibt default_content-Felder für diese Komposition (z.B. Stil-Tonalität) */
  overrides?: Record<string, unknown>
}

export interface LibraryPage {
  key: string
  name: string
  branche: string
  stil: Stil
  seitentyp: 'startseite' | 'leistungen' | 'ueber-uns' | 'kontakt'
  beschreibung?: string
  sections: PageSectionRef[]
  aktiv?: boolean
}

export type StockAssetKategorie = 'hero' | 'team' | 'arbeit' | 'ambiente' | 'detail'

export interface StockAsset {
  key: string
  url: string
  alt_text: string
  branche: string | null
  kategorie: StockAssetKategorie
  quelle: 'unsplash' | 'eigen' | 'lizenziert'
  lizenz?: string
  breite?: number
  hoehe?: number
  aktiv?: boolean
}
