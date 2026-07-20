/**
 * MVP-Finish §3.1 — Slot-Deklarationen der bildführenden Flagship-Sektionen.
 *
 * Dieses Modul ist das Registrierungs-Gate: die Deklarationen werden beim
 * Modul-Load gegen das Zod-Schema validiert (validiereAssetSlots wirft).
 * render.ts importiert dieses Modul — eine Section mit unvollständiger
 * oder invalider Slot-Deklaration lässt den Renderer gar nicht erst laden.
 *
 * Die Deklarationen sind die EINZIGE Quelle für assignAssets (§3.3):
 * Claude füllt nur Text-Slots, Bilder kommen deterministisch aus der Bank.
 */
import { validiereAssetSlots, type AssetSlots } from '@/lib/assets/slots'

/** Bildführende Sektionen der Flagship-Engine mit typisierten Slots */
const DEKLARATIONEN: Record<string, AssetSlots> = {
  hero: validiereAssetSlots('hero', {
    hero_img: { scene_typ: 'hero', aspect: '16:9', min_width: 1600, tags: ['branche'] },
  }),
  signature: validiereAssetSlots('signature', {
    // Paar-Kopplung: vorher zeigt via pair_with auf nachher → IMMER über pair_id aufgelöst.
    // pflicht=false: kein approved Paar ⇒ Sektion wird ausgeblendet, nie ein halbes Paar.
    sig_nachher: { scene_typ: 'nachher', aspect: '16:9', min_width: 1000, pflicht: false },
    sig_vorher: { scene_typ: 'vorher', aspect: '16:9', min_width: 1000, pair_with: 'sig_nachher', pflicht: false },
  }),
  ergebnisse_ba: validiereAssetSlots('ergebnisse_ba', {
    ba_nachher_1: { scene_typ: 'nachher', aspect: '16:9', min_width: 1000, pflicht: false },
    ba_vorher_1: { scene_typ: 'vorher', aspect: '16:9', min_width: 1000, pair_with: 'ba_nachher_1', pflicht: false },
  }),
  ergebnisse_galerie: validiereAssetSlots('ergebnisse_galerie', {
    galerie_1: { scene_typ: 'galerie', aspect: '4:3', min_width: 960, pflicht: false },
    galerie_2: { scene_typ: 'galerie', aspect: '4:3', min_width: 960, pflicht: false },
    galerie_3: { scene_typ: 'galerie', aspect: '4:3', min_width: 960, pflicht: false },
  }),
}

export const FLAGSHIP_ASSET_SLOTS: Readonly<Record<string, AssetSlots>> = DEKLARATIONEN

export function assetSlotsFuerSektion(sektion: string): AssetSlots | null {
  return DEKLARATIONEN[sektion] ?? null
}
