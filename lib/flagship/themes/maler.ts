/**
 * Template-Fabrik B2 (Branche 2) — Theme „maler" als Token-Layer.
 *
 * Akzent Salbei #7BA88A (Steckbrief-Farbwelt: gedeckt-frisches Grün mit
 * Grauanteil, Kollisionscheck gegen GaLaBau-Grün #3FA463 bestanden).
 * Grundton Altweiß-warm (#F5F5F1) — die Signature-Wand färbt sich von
 * diesem Altweiß zu Salbei.
 */

import type { KompositionTheme } from './galabau'

export const MALER_THEME: KompositionTheme = {
  key: 'maler',
  tokens: {
    accent: '#7BA88A',
    accent2: '#A9CBB5',
    accentInk: '#48705A',
    accentSoft: '#EEF4F0',
    accentDeep: '#527D63',
    accentPale: '#D7E5DB',
    gradStart: '#88B296',
    gradEnd: '#6C9A7B',
    bg: '#F5F5F1',
    ink: '#17201B',
    inkSoft: '#5D6862',
    inkFaint: '#9CA8A0',
    line: '#E4E8E3',
    footer: '#17201B',
    star: '#F0A500',
    accentRgb: '123, 168, 138',
    deepRgb: '82, 125, 99',
    inkRgb: '23, 32, 27',
    shadeRgb: '13, 20, 16',
  },
}
