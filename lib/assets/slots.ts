/**
 * MVP-Finish §3.1 — typisiertes Slot-Schema für Bild-Slots.
 *
 * Jede Section-Vorlage deklariert ihre Bild-Slots über dieses Schema.
 * Der Renderer registriert eine Section NUR mit vollständiger, valider
 * Slot-Deklaration (validiereAssetSlots wirft bei Verstoß — beim
 * Modul-Load, nicht erst zur Laufzeit).
 *
 * Grundprinzip: Die KI wählt NIEMALS Bilder aus. Slots werden von
 * deterministischem Code (assignAssets, §3.3) gefüllt.
 */
import { z } from 'zod'

export const ASSET_SZENEN = ['hero', 'galerie', 'vorher', 'nachher', 'team', 'detail'] as const
export type AssetSzene = (typeof ASSET_SZENEN)[number]

export const ASSET_ASPECTS = ['16:9', '4:3', '3:4', '1:1'] as const
export type SlotAspect = (typeof ASSET_ASPECTS)[number]

/** Aspect-String → Zahl (Breite/Höhe) */
export function aspectZahl(aspect: string): number | null {
  const [b, h] = aspect.split(':').map(Number)
  if (!b || !h) return null
  return b / h
}

export const AssetSlotSchema = z.object({
  scene_typ: z.enum(ASSET_SZENEN),
  aspect: z.enum(ASSET_ASPECTS),
  /** Mindestbreite des Originals in px */
  min_width: z.number().int().positive().optional(),
  /** Slot-Key des Partner-Slots (nachher) — erzwingt Paar-Auflösung über pair_id */
  pair_with: z.string().min(1).optional(),
  /** Ranking-Tags (Style-Übereinstimmung); 'branche' ist implizit immer Filter */
  tags: z.array(z.string()).optional(),
  /**
   * Pflicht-Slot (Default true): kein Kandidat ⇒ harter Job-Fail.
   * false: Sektion des Slots wird ausgeblendet statt zu failen.
   */
  pflicht: z.boolean().optional(),
  /** Medium des Slots (Default 'bild'). 'video' z. B. hero_video (Growth). */
  medium: z.enum(['bild', 'video']).optional(),
  /** Fallback-Slot-Key, wenn kein Asset vorhanden (z. B. hero_video → hero_bg) */
  fallback: z.string().min(1).optional(),
})
export type AssetSlot = z.infer<typeof AssetSlotSchema>

export const AssetSlotsSchema = z
  .record(z.string().regex(/^[a-z][a-z0-9_]*$/, 'Slot-Key: snake_case'), AssetSlotSchema)
  .superRefine((slots, ctx) => {
    for (const [key, slot] of Object.entries(slots)) {
      if (slot.pair_with) {
        const partner = slots[slot.pair_with]
        if (!partner) {
          ctx.addIssue({ code: 'custom', message: `Slot "${key}": pair_with="${slot.pair_with}" existiert nicht` })
          continue
        }
        // Paar-Konvention: vorher-Slot zeigt auf nachher-Slot (BF §2.2: nachher zuerst)
        if (slot.scene_typ !== 'vorher' || partner.scene_typ !== 'nachher') {
          ctx.addIssue({
            code: 'custom',
            message: `Slot "${key}": pair_with nur als vorher→nachher erlaubt (ist ${slot.scene_typ}→${partner.scene_typ})`,
          })
        }
        if (slot.aspect !== partner.aspect) {
          ctx.addIssue({ code: 'custom', message: `Slot "${key}": Paar-Slots brauchen dasselbe aspect` })
        }
      }
    }
  })
export type AssetSlots = Record<string, AssetSlot>

/**
 * Registrierungs-Gate: parst die Slot-Deklaration einer Section und wirft
 * mit lesbarer Meldung, wenn sie unvollständig/invalide ist.
 */
export function validiereAssetSlots(sektion: string, slots: unknown): AssetSlots {
  const ergebnis = AssetSlotsSchema.safeParse(slots)
  if (!ergebnis.success) {
    const gruende = ergebnis.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')
    throw new Error(`Section "${sektion}": invalide asset_slots — ${gruende}`)
  }
  return ergebnis.data
}
