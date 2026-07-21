/**
 * Premium-Komposition „scrub-story-v1" — Asset-Slots.
 *
 * Registrierungs-Gate: validiereAssetSlots wirft beim Modul-Load bei
 * invalider Deklaration (scrub/render.ts importiert dieses Modul).
 *
 * Slotplan (Guide „Scroll-Scrub PV"):
 *   poster_01..poster_05 — 16:9-Stills je Szene (poster_01 = Entry Still aus
 *     gpt_image_2; 02–05 = Frame bei 0.1 s aus dem jeweiligen Clip). Pflicht:
 *     die Poster tragen den statischen Modus, no-JS und reduced-motion.
 *   clip_01..clip_05 — 5-s-Videos (seedance_2_0, seam-locked: letzter Frame
 *     von Clip N = start_image von Clip N+1). Optional mit Fallback aufs
 *     Szenen-Poster.
 *
 * Die Frame-Sequenz des Canvas-Modus (240 Bilder, ffmpeg fps=24) ist ein
 * DERIVAT der Clips und wird NICHT slot-verwaltet — sie wird über
 * inhalte.frames.pfad_muster referenziert (rezepte/REZEPTE_SCRUB_PV.md).
 */
import { validiereAssetSlots, type AssetSlots } from '@/lib/assets/slots'

export const SCRUB_ASSET_SLOTS: AssetSlots = validiereAssetSlots('scrub-story-v1', {
  // Szenen-Poster: 16:9, min 1920 (2k-Entry-Still bzw. Clip-Frame bei 0.1 s)
  poster_01: { scene_typ: 'hero', aspect: '16:9', min_width: 1920, tags: ['branche'] },
  poster_02: { scene_typ: 'hero', aspect: '16:9', min_width: 1920, tags: ['branche'] },
  poster_03: { scene_typ: 'hero', aspect: '16:9', min_width: 1920, tags: ['branche'] },
  poster_04: { scene_typ: 'hero', aspect: '16:9', min_width: 1920, tags: ['branche'] },
  poster_05: { scene_typ: 'hero', aspect: '16:9', min_width: 1920, tags: ['branche'] },

  // Szenen-Clips: 5 s, 1080p, 16:9 — optional, Fallback aufs Szenen-Poster
  clip_01: { scene_typ: 'hero', aspect: '16:9', medium: 'video', pflicht: false, fallback: 'poster_01' },
  clip_02: { scene_typ: 'hero', aspect: '16:9', medium: 'video', pflicht: false, fallback: 'poster_02' },
  clip_03: { scene_typ: 'hero', aspect: '16:9', medium: 'video', pflicht: false, fallback: 'poster_03' },
  clip_04: { scene_typ: 'hero', aspect: '16:9', medium: 'video', pflicht: false, fallback: 'poster_04' },
  clip_05: { scene_typ: 'hero', aspect: '16:9', medium: 'video', pflicht: false, fallback: 'poster_05' },
})

/** Slot-Key ↔ Dateiname (Rezeptliste: Bindestrich statt Unterstrich) */
export function scrubSlotKeyAusDateiname(dateiname: string): string | null {
  const basis = dateiname.replace(/\.[a-z0-9]+$/i, '').toLowerCase().replace(/-/g, '_')
  return basis in SCRUB_ASSET_SLOTS ? basis : null
}
