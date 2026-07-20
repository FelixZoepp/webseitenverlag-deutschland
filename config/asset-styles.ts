/**
 * MVP-Finish §3.4 — fester Style-Prompt-Baukasten für die Asset-Bank.
 *
 * Prompts werden aus festen Modulen zusammengesetzt (Licht, Farbwelt,
 * Kamera, Negativ), damit alle Assets einer Branche eine konsistente
 * Bildsprache haben. Kein Freitext pro Asset — nur Szene + Baukasten.
 *
 * Negativ-Grundregeln (immer): keine Gesichter nah, keine Logos/Marken,
 * kein Text im Bild.
 */
import type { SzeneTyp } from '@/lib/assets/pipeline'

export interface AssetStil {
  /** Licht-Modul */
  licht: string
  /** Farbwelt-Modul */
  farbwelt: string
  /** Kamera-Modul */
  kamera: string
  /** Branchen-spezifische Szenen-Bausteine je szene_typ */
  szenen: Record<SzeneTyp, string>
  /** Zusätzliche Negativ-Regeln der Branche (ergänzt BASIS_NEGATIV) */
  negativ?: string[]
  /** Style-Tags, die in asset_bank.style_tags landen (Ranking in assignAssets) */
  style_tags: string[]
}

/** Negativ-Grundregeln — gelten für JEDE Generierung */
export const BASIS_NEGATIV = [
  'no close-up faces, faces only from behind or blurred in background',
  'no logos, no brand names, no trademarks',
  'no text, no lettering, no watermarks, no signage with readable words',
] as const

/** Fotorealismus-Grundmodul — gilt für JEDE Generierung */
export const BASIS_FOTO =
  'professional photography, photorealistic, high detail, natural perspective, german craftsmanship context'

export const ASSET_STILE: Record<string, AssetStil> = {
  maler: {
    licht: 'bright natural daylight through windows, soft shadows',
    farbwelt: 'clean whites, warm neutral tones, subtle color accents from fresh paint',
    kamera: 'wide-angle interior shot, eye level, slight depth of field',
    szenen: {
      hero: 'freshly painted bright living room interior, perfect white walls, painter supplies neatly arranged, ladder and drop cloth',
      galerie: 'detail of a perfectly painted wall edge, crisp line between two colors, roller texture',
      nachher: 'renovated room with flawless freshly painted walls, clean floor, bright and finished',
      vorher: 'the same room before renovation: stained old wall paint, cracks, faded colors, dusty floor',
      team: 'painter in white work clothes seen from behind, painting a wall with a roller',
      detail: 'close-up of professional painting tools, brushes and color swatches on a workbench',
    },
    style_tags: ['hell', 'clean', 'handwerk'],
  },
  gastro: {
    licht: 'warm evening light, candle glow, soft window light',
    farbwelt: 'warm amber, deep wood tones, cream white table linen',
    kamera: 'shallow depth of field, 50mm look, inviting perspective',
    szenen: {
      hero: 'elegant restaurant interior at golden hour, set tables, warm inviting atmosphere',
      galerie: 'beautifully plated seasonal dish on rustic table, garnished, steam rising',
      nachher: 'perfectly set dinner table with glasses, folded napkins and candlelight',
      vorher: 'the same table empty and bare, chairs up, room in plain daylight',
      team: 'chef plating a dish in a professional kitchen, seen from behind',
      detail: 'close-up of fresh regional ingredients on a wooden cutting board',
    },
    style_tags: ['warm', 'genuss', 'abendlicht'],
  },
}

/** Fallback-Stil für Branchen ohne eigenen Baukasten-Eintrag */
export function fallbackStil(branche: string): AssetStil {
  const b = branche.replace(/[_-]/g, ' ')
  return {
    licht: 'bright natural daylight, soft shadows',
    farbwelt: 'clean neutral tones with subtle brand-free color accents',
    kamera: 'professional composition, eye level, slight depth of field',
    szenen: {
      hero: `modern german ${b} business environment, welcoming and professional`,
      galerie: `${b} work result presented cleanly, professional quality`,
      nachher: `finished high-quality ${b} work result, clean and complete`,
      vorher: `the same scene before the work: worn, unfinished, in need of service`,
      team: `${b} professional at work, seen from behind or side, no visible face`,
      detail: `close-up of professional ${b} tools and materials`,
    },
    style_tags: ['hell', 'clean'],
  }
}

export function stilFuerBranche(branche: string): AssetStil {
  return ASSET_STILE[branche] ?? fallbackStil(branche)
}

/** Kompletter Generierungs-Prompt: Szene + Baukasten + Negativ */
export function baueSeedPrompt(branche: string, szene: SzeneTyp): string {
  const stil = stilFuerBranche(branche)
  const negativ = [...BASIS_NEGATIV, ...(stil.negativ ?? [])]
  return [
    stil.szenen[szene],
    `Lighting: ${stil.licht}.`,
    `Color palette: ${stil.farbwelt}.`,
    `Camera: ${stil.kamera}.`,
    `${BASIS_FOTO}.`,
    `Strict rules: ${negativ.join('; ')}.`,
  ].join(' ')
}

/** Deutscher Alt-Text (vorbefüllt — Mensch korrigiert in /admin/assets) */
export function altTextVorlage(brancheName: string, szene: SzeneTyp): string {
  const vorlagen: Record<SzeneTyp, string> = {
    hero: `Einblick in die Arbeit eines ${brancheName}-Betriebs`,
    galerie: `Arbeitsergebnis eines ${brancheName}-Betriebs`,
    nachher: `Ergebnis nach Abschluss der ${brancheName}-Arbeiten`,
    vorher: `Zustand vor Beginn der ${brancheName}-Arbeiten`,
    team: `Mitarbeiter eines ${brancheName}-Betriebs bei der Arbeit`,
    detail: `Werkzeuge und Materialien eines ${brancheName}-Betriebs`,
  }
  return vorlagen[szene]
}
