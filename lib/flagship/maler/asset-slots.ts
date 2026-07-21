/**
 * Template-Fabrik B2 — Asset-Slots der Komposition „maler-landing-v1".
 *
 * Registrierungs-Gate: validiereAssetSlots wirft beim Modul-Load bei
 * invalider Deklaration (maler/render.ts importiert dieses Modul).
 *
 * Basis = GaLaBau-Slotplan (21 Slots, unverändert übernommen) + 6 optionale
 * Galerie-Slots gal_01..gal_06 (Referenz-Galerie ab Stufe video; ohne Bilder
 * entfällt die Sektion komplett — pflicht:false).
 * Slot-Keys intern snake_case; Higgsfield-Dateinamen dieselben IDs mit
 * Bindestrich (gal-01.jpg → gal_01). Paar: ba_before → ba_after via pair_id.
 */
import { validiereAssetSlots, type AssetSlots } from '@/lib/assets/slots'

export const MALER_ASSET_SLOTS: AssetSlots = validiereAssetSlots('maler-landing-v1', {
  // Hero: 16:9, min 1920 — Video optional (ab Stufe video), Fallback aufs Hero-Bild
  hero_bg: { scene_typ: 'hero', aspect: '16:9', min_width: 1920, tags: ['branche'] },
  hero_video: { scene_typ: 'hero', aspect: '16:9', medium: 'video', pflicht: false, fallback: 'hero_bg' },

  // Detail-Slots: 4:3, min 1200
  about_detail: { scene_typ: 'detail', aspect: '4:3', min_width: 1200 },
  svc_01: { scene_typ: 'detail', aspect: '4:3', min_width: 1200 },
  svc_02: { scene_typ: 'detail', aspect: '4:3', min_width: 1200 },
  svc_03: { scene_typ: 'detail', aspect: '4:3', min_width: 1200 },
  svc_04: { scene_typ: 'detail', aspect: '4:3', min_width: 1200 },
  svc_05: { scene_typ: 'detail', aspect: '4:3', min_width: 1200 },
  why_1: { scene_typ: 'detail', aspect: '4:3', min_width: 1200 },
  why_2: { scene_typ: 'detail', aspect: '4:3', min_width: 1200 },
  why_3: { scene_typ: 'detail', aspect: '4:3', min_width: 1200 },
  contact_img: { scene_typ: 'detail', aspect: '4:3', min_width: 1200 },

  // Vorher/Nachher-Paar: 4:3, Kopplung vorher → nachher (gleiche pair_id)
  ba_after: { scene_typ: 'nachher', aspect: '4:3', min_width: 1200 },
  ba_before: { scene_typ: 'vorher', aspect: '4:3', min_width: 1200, pair_with: 'ba_after' },

  // Team: 3:4 — Quelle-Präferenz kunde (Demo: Bank; Live: Kunden-Upload)
  team_1: { scene_typ: 'team', aspect: '3:4', min_width: 900, tags: ['kunde_bevorzugt'] },
  team_2: { scene_typ: 'team', aspect: '3:4', min_width: 900, tags: ['kunde_bevorzugt'] },
  team_3: { scene_typ: 'team', aspect: '3:4', min_width: 900, tags: ['kunde_bevorzugt'] },

  // Avatare: 1:1-Derivate (aus team-1..3 + why-1 gecroppt), optional
  avatar_1: { scene_typ: 'team', aspect: '1:1', min_width: 200, pflicht: false },
  avatar_2: { scene_typ: 'team', aspect: '1:1', min_width: 200, pflicht: false },
  avatar_3: { scene_typ: 'team', aspect: '1:1', min_width: 200, pflicht: false },
  avatar_4: { scene_typ: 'team', aspect: '1:1', min_width: 200, pflicht: false },

  // NEU (Maler): Referenz-Galerie 4:3, optional — ohne Bilder entfällt die Sektion
  gal_01: { scene_typ: 'galerie', aspect: '4:3', min_width: 1200, pflicht: false },
  gal_02: { scene_typ: 'galerie', aspect: '4:3', min_width: 1200, pflicht: false },
  gal_03: { scene_typ: 'galerie', aspect: '4:3', min_width: 1200, pflicht: false },
  gal_04: { scene_typ: 'galerie', aspect: '4:3', min_width: 1200, pflicht: false },
  gal_05: { scene_typ: 'galerie', aspect: '4:3', min_width: 1200, pflicht: false },
  gal_06: { scene_typ: 'galerie', aspect: '4:3', min_width: 1200, pflicht: false },
})

/** Slot-Key ↔ Dateiname (Higgsfield-Rezeptliste: Bindestrich statt Unterstrich) */
export function malerSlotKeyAusDateiname(dateiname: string): string | null {
  const basis = dateiname.replace(/\.[a-z0-9]+$/i, '').toLowerCase().replace(/-/g, '_')
  return basis in MALER_ASSET_SLOTS ? basis : null
}
