/**
 * Video-Guidelines für die Growth-Video-Leiste (Baustein C §C.3).
 *
 * Config over Hardcode (§0): Alle Regeln, aus denen der Claude-Prompt-Refiner
 * einen Generierungs-Prompt baut, liegen HIER — nicht im Route-Code.
 * Freitext des Admins (deutsch) → Refiner → englischer Video-Prompt, der die
 * technischen Regeln (Dauer, Loop, Kamera), den Branchen-Style-Baukasten
 * (Licht/Farbwelt) und die Negativ-Regeln einhält.
 */

export const VIDEO_GUIDELINES = {
  /** Ziel-Dauer in Sekunden (kurz, nahtlos loopbar) */
  dauerSekundenMin: 5,
  dauerSekundenMax: 8,
  /** Harte Obergrenze nach Transkodierung — QA-Regel C-VIDEO-SIZE (≤3 MB) */
  maxGroesseMb: 3,
  /** Technische Grundregeln, die JEDER Prompt enthalten muss */
  technik: [
    'seamlessly loopable — first and last frame nearly identical',
    'calm, slow camera: static or very gentle push-in, never handheld shake',
    'subtle ambient motion only (material, light, steam, water — no fast action)',
    'cinematic 4K quality, shallow depth of field',
  ],
  /**
   * Negativ-Regeln (§C.3): Dinge, die in KEINEM Kundenvideo auftauchen dürfen.
   * Nahaufnahmen von Gesichtern wirken schnell uncanny, Logos/Marken sind
   * rechtlich riskant, eingebrannter Text bricht die Personalisierung,
   * Flicker/Strobo ruiniert den Loop und die Barrierefreiheit.
   */
  negativ: [
    'no close-up faces, no recognizable persons',
    'no logos, no brand names, no trademarks',
    'no burned-in text, no captions, no watermarks',
    'no flicker, no strobe, no rapid cuts',
  ],
  /**
   * Poster-Frame-Anweisung: Der erste Frame muss allein als statisches
   * Hero-Bild funktionieren (Fallback bei Video-Fehler, prefers-reduced-motion).
   */
  posterFrame:
    'The very first frame must work as a standalone still hero image: well-composed, sharp, correctly exposed — it will be used as the poster/fallback image.',
} as const

/** Branchen-Style-Baukasten: Licht + Farbwelt je Branche (§C.3). */
export interface BranchenVideoStil {
  licht: string
  farbwelt: string
}

export const BRANCHEN_VIDEO_STIL: Record<string, BranchenVideoStil> = {
  reinigung: { licht: 'bright clean daylight', farbwelt: 'crisp whites, glass blues, sparkling highlights' },
  restaurant_italienisch: { licht: 'warm flickering candlelight', farbwelt: 'rich reds, rustic wood browns, cream' },
  maler: { licht: 'bright even work lighting', farbwelt: 'fresh whites, soft greys, one accent color' },
  dachdecker: { licht: 'golden morning sunlight', farbwelt: 'slate greys, terracotta, warm sky tones' },
  umzugsunternehmen: { licht: 'soft morning light through windows', farbwelt: 'cardboard browns, neutral whites, daylight blue' },
  friseur: { licht: 'warm salon spotlights', farbwelt: 'warm golds, soft blacks, mirror highlights' },
  kfz_werkstatt: { licht: 'cool workshop LED lighting', farbwelt: 'chrome, gunmetal grey, signal accents' },
  autoaufbereitung: { licht: 'controlled studio reflections', farbwelt: 'deep glossy blacks, mirror silver, cold blue' },
  zahnarzt: { licht: 'sterile blue-white examination light', farbwelt: 'clinical whites, chrome, calm light blue' },
  physiotherapie: { licht: 'natural light through large windows', farbwelt: 'soft greens, warm wood, calm neutrals' },
  kosmetikstudio: { licht: 'soft pink-toned studio light with gentle flare', farbwelt: 'rosé, cream, glowing skin tones' },
  fitnessstudio: { licht: 'dramatic gym LED lighting', farbwelt: 'matte blacks, chrome, energetic accent color' },
  fotograf: { licht: 'soft studio flash with bokeh', farbwelt: 'neutral greys, silver, warm bokeh points' },
  cafe: { licht: 'soft warm morning light', farbwelt: 'espresso browns, cream, golden crema tones' },
  padel: { licht: 'bright court floodlights', farbwelt: 'court blues, glass reflections, neon accents' },
  hausmeisterservice: { licht: 'warm afternoon light', farbwelt: 'brass, garden greens, warm neutrals' },
  personal_training: { licht: 'fresh morning sunlight with long shadows', farbwelt: 'grass greens, sky blue, warm skin-neutral tones' },
}

export const DEFAULT_VIDEO_STIL: BranchenVideoStil = {
  licht: 'soft natural daylight',
  farbwelt: 'calm neutral tones with one warm accent',
}

export function getBranchenVideoStil(branche: string): BranchenVideoStil {
  const key = branche.toLowerCase().replace(/[\s-]+/g, '_')
  return BRANCHEN_VIDEO_STIL[key] || DEFAULT_VIDEO_STIL
}

/**
 * Baut den System-/User-Prompt für den Claude-Prompt-Refiner:
 * deutscher Freitext → englischer Video-Generierungs-Prompt nach Guidelines.
 */
export function buildVideoRefinerPrompt(beschreibung: string, branche: string): string {
  const stil = getBranchenVideoStil(branche)
  const g = VIDEO_GUIDELINES
  return `Du bist ein Prompt-Refiner für kurze Hero-Hintergrundvideos lokaler Handwerks- und Dienstleistungs-Websites.

Aufgabe: Übersetze die deutsche Beschreibung in EINEN englischen Video-Generierungs-Prompt (3–5 Sätze, nur den Prompt ausgeben, kein Kommentar).

BESCHREIBUNG (deutsch): ${beschreibung}

BRANCHE: ${branche}
STIL-BAUKASTEN: Licht: ${stil.licht}. Farbwelt: ${stil.farbwelt}.

PFLICHT-REGELN (müssen im Prompt umgesetzt sein):
- Dauer ${g.dauerSekundenMin}–${g.dauerSekundenMax} Sekunden
- ${g.technik.join('\n- ')}
- ${g.posterFrame}

VERBOTEN (Negativ-Regeln, im Prompt explizit ausschließen):
- ${g.negativ.join('\n- ')}`
}
