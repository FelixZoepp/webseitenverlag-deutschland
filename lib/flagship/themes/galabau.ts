/**
 * Auftrag T1.3 — Branchen-Theme „galabau" als Token-Layer.
 *
 * Das Theme überschreibt die System-Tokens der Komposition; ein weiteres
 * Branchen-Theme später ist eine reine Config-Zeile (neues Objekt hier).
 * Pflicht-Tokens aus dem Auftrag: --accent #3FA463, --accent-2 #7ED49B,
 * --accent-ink #2C7A49, --accent-soft #EAF7EF, --bg #F4F6F3 + begrünte Grautöne.
 */

export interface KompositionTheme {
  key: string
  tokens: {
    /** Hauptakzent (Buttons, Fokus-Ringe) */
    accent: string
    /** Heller Zweitakzent */
    accent2: string
    /** Akzent-Tinte (Pill-Text, Links) */
    accentInk: string
    /** Akzent-Fläche (Pills, Hintergründe) */
    accentSoft: string
    /** Tiefer Akzent (Quote-Badge, FAQ-Icon, Slider-Griff) */
    accentDeep: string
    /** Blasse Akzent-Fläche (Riesen-Nummern, Media-Platzhalter) */
    accentPale: string
    /** Button-Gradient oben */
    gradStart: string
    /** Button-Gradient unten */
    gradEnd: string
    /** Seitengrund */
    bg: string
    /** Primärtext (begrünter Ink) */
    ink: string
    /** Sekundärtext */
    inkSoft: string
    /** Tertiärtext (Captions) */
    inkFaint: string
    /** Linien/Borders */
    line: string
    /** Footer-Grund */
    footer: string
    /** Sterne */
    star: string
    /** RGB-Triplets für rgba()-Schatten */
    accentRgb: string
    deepRgb: string
    inkRgb: string
    shadeRgb: string
  }
}

export const GALABAU_THEME: KompositionTheme = {
  key: 'galabau',
  tokens: {
    accent: '#E0354B',
    accent2: '#F07585',
    accentInk: '#C92B40',
    accentSoft: '#FDF0F2',
    accentDeep: '#B01C2E',
    accentPale: '#FADEE2',
    gradStart: '#EF5B6F',
    gradEnd: '#E0354B',
    bg: '#F5F6F8',
    ink: '#17181A',
    inkSoft: '#5F646D',
    inkFaint: '#AEB4BD',
    line: '#E7E9ED',
    footer: '#17181A',
    star: '#F59E0B',
    accentRgb: '224, 53, 75',
    deepRgb: '176, 28, 46',
    inkRgb: '23, 24, 26',
    shadeRgb: '10, 12, 18',
  },
}

/** Theme als CSS-Custom-Properties (`:root{…}`-Inhalt) */
export function themeAlsCssVars(theme: KompositionTheme): string {
  const t = theme.tokens
  return [
    `--accent:${t.accent}`,
    `--accent-2:${t.accent2}`,
    `--accent-ink:${t.accentInk}`,
    `--accent-soft:${t.accentSoft}`,
    `--accent-deep:${t.accentDeep}`,
    `--accent-pale:${t.accentPale}`,
    `--grad-start:${t.gradStart}`,
    `--grad-end:${t.gradEnd}`,
    `--bg:${t.bg}`,
    `--ink:${t.ink}`,
    `--ink-soft:${t.inkSoft}`,
    `--ink-faint:${t.inkFaint}`,
    `--line:${t.line}`,
    `--footer:${t.footer}`,
    `--star:${t.star}`,
    `--accent-rgb:${t.accentRgb}`,
    `--deep-rgb:${t.deepRgb}`,
    `--ink-rgb:${t.inkRgb}`,
    `--shade-rgb:${t.shadeRgb}`,
  ].join(';')
}
