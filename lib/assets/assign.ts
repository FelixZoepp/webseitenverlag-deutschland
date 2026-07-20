/**
 * MVP-Finish §3.3 — deterministischer Slot-Zuweiser.
 *
 * assignAssets(siteId, branche, style, slots) füllt Bild-Slots aus der
 * asset_bank. Die KI wählt NIEMALS Bilder aus — dieser Code ist die
 * einzige Zuweisungsstelle und arbeitet rein deterministisch:
 *
 * - Kandidaten: approved (via Repository) ∧ Branche ∧ exakter szene_typ
 *   ∧ Aspect ±5 % ∧ breite ≥ min_width
 * - Ranking: Style-Tag-Übereinstimmung, dann seeded RNG (Seed = siteId
 *   ⇒ gleiche Site bekommt bei jedem Rebuild dieselben Bilder)
 * - Keine Duplikate innerhalb einer Seite
 * - pair_with-Slots werden IMMER als Paar über pair_id aufgelöst.
 *   Kein approved Paar ⇒ beide Slots ausgeblendet, nie ein halbes Paar.
 * - Pflicht-Slot ohne Kandidat ⇒ harter Fehler mit klarer Meldung,
 *   niemals Platzhalter oder stiller Fallback.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { aspectZahl, type AssetSlot, type AssetSlots } from './slots'
import { getApprovedAssets, publicAssetUrl, type ApprovedAsset } from './repository'

/** Aspect-Toleranz des Kandidaten-Filters (±5 %) */
const ASPECT_TOLERANZ = 0.05

export interface ZugewiesenesAsset {
  assetId: string
  storagePath: string
  altText: string | null
}

export interface AssignErgebnis {
  /** slotKey → zugewiesenes Asset */
  zuweisung: Record<string, ZugewiesenesAsset>
  /** Slot-Keys ohne Kandidat (nur pflicht:false) — Sektion ausblenden */
  ausgeblendet: string[]
}

/** FNV-1a-Hash (32 Bit) — Basis für den deterministischen RNG */
function fnv1a(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/**
 * Deterministische Zufallszahl je (Seed, Asset): unabhängig von der
 * Array-Reihenfolge der Kandidaten — gleiche Site ⇒ gleiches Ranking.
 */
function seededRand(seedKey: string, assetId: string): number {
  // mulberry32 mit kombiniertem Hash als State
  let t = (fnv1a(seedKey) ^ fnv1a(assetId)) >>> 0
  t += 0x6d2b79f5
  let r = Math.imul(t ^ (t >>> 15), t | 1)
  r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
  return ((r ^ (r >>> 14)) >>> 0) / 4294967296
}

/** Passt der Kandidat zum Slot-Aspect (±5 %)? */
function aspectPasst(slot: AssetSlot, asset: ApprovedAsset): boolean {
  const soll = aspectZahl(slot.aspect)
  if (!soll) return false
  if (asset.breite && asset.hoehe) {
    const ist = asset.breite / asset.hoehe
    return Math.abs(ist - soll) / soll <= ASPECT_TOLERANZ
  }
  // Ohne Maße: deklariertes aspect_ratio muss exakt passen
  return asset.aspect_ratio === slot.aspect
}

/** Erfüllt der Kandidat alle Filter des Slots (ohne Duplikat-Check)? */
function slotFilter(slot: AssetSlot, asset: ApprovedAsset): boolean {
  if (asset.szene_typ !== slot.scene_typ) return false
  if (!aspectPasst(slot, asset)) return false
  if (slot.min_width && (asset.breite ?? 0) < slot.min_width) return false
  return true
}

/** Style-Tag-Übereinstimmungen ('branche' ist impliziter Filter, kein Ranking-Tag) */
function styleTreffer(styleTags: string[], asset: ApprovedAsset): number {
  let n = 0
  for (const tag of styleTags) {
    if (tag === 'branche') continue
    if (asset.style_tags?.includes(tag)) n++
  }
  return n
}

/** Kandidaten sortieren: Style-Treffer absteigend, dann seeded RNG */
function rangfolge(
  seedKey: string,
  styleTags: string[],
  kandidaten: ApprovedAsset[]
): ApprovedAsset[] {
  return [...kandidaten].sort((a, b) => {
    const diff = styleTreffer(styleTags, b) - styleTreffer(styleTags, a)
    if (diff !== 0) return diff
    return seededRand(seedKey, a.id) - seededRand(seedKey, b.id)
  })
}

function fehlerMeldung(branche: string, slot: AssetSlot): string {
  return `asset_bank: kein approved ${slot.scene_typ}/${slot.aspect} für branche=${branche}`
}

/**
 * Reiner Kern (testbar ohne DB): Slots deterministisch aus einer
 * Kandidatenliste füllen. Wirft bei leerem Pflicht-Slot.
 */
export function assignAssetsAusKandidaten(
  seedKey: string,
  branche: string,
  styleTags: string[],
  slots: AssetSlots,
  kandidaten: ApprovedAsset[]
): { zuweisung: Record<string, ApprovedAsset>; ausgeblendet: string[] } {
  const zuweisung: Record<string, ApprovedAsset> = {}
  const ausgeblendet: string[] = []
  const benutzt = new Set<string>()

  // Slot-Gruppen: Paare (vorher→nachher) und Einzel-Slots — in
  // deterministischer Reihenfolge (Deklarationsreihenfolge der Keys).
  const keys = Object.keys(slots)
  const paarKeys = new Set<string>()
  const paare: Array<{ vorherKey: string; nachherKey: string }> = []
  for (const key of keys) {
    const slot = slots[key]
    if (slot.pair_with) {
      paare.push({ vorherKey: key, nachherKey: slot.pair_with })
      paarKeys.add(key)
      paarKeys.add(slot.pair_with)
    }
  }

  // 1) Paare zuerst: IMMER über pair_id auflösen, nie ein halbes Paar
  for (const { vorherKey, nachherKey } of paare) {
    const vorherSlot = slots[vorherKey]
    const nachherSlot = slots[nachherKey]

    // Kandidaten-Paare: nachher mit pair_id, dessen vorher-Partner
    // ebenfalls approved ist und beide Slot-Filter erfüllen
    const nachherKandidaten = kandidaten.filter(
      (a) => a.pair_id && !benutzt.has(a.id) && slotFilter(nachherSlot, a)
    )
    const paarKandidaten = nachherKandidaten
      .map((nachher) => {
        const vorher = kandidaten.find(
          (a) =>
            a.pair_id === nachher.pair_id &&
            a.id !== nachher.id &&
            !benutzt.has(a.id) &&
            slotFilter(vorherSlot, a)
        )
        return vorher ? { nachher, vorher } : null
      })
      .filter((p): p is { nachher: ApprovedAsset; vorher: ApprovedAsset } => p !== null)

    const beste = rangfolge(
      seedKey,
      styleTags,
      paarKandidaten.map((p) => p.nachher)
    )[0]
    const paar = paarKandidaten.find((p) => p.nachher.id === beste?.id)

    if (paar) {
      zuweisung[nachherKey] = paar.nachher
      zuweisung[vorherKey] = paar.vorher
      benutzt.add(paar.nachher.id)
      benutzt.add(paar.vorher.id)
    } else if (vorherSlot.pflicht === false && nachherSlot.pflicht === false) {
      ausgeblendet.push(nachherKey, vorherKey)
    } else {
      throw new Error(fehlerMeldung(branche, nachherSlot))
    }
  }

  // 2) Einzel-Slots
  for (const key of keys) {
    if (paarKeys.has(key)) continue
    const slot = slots[key]
    const passend = kandidaten.filter((a) => !benutzt.has(a.id) && slotFilter(slot, a))
    const bester = rangfolge(seedKey, styleTags, passend)[0]
    if (bester) {
      zuweisung[key] = bester
      benutzt.add(bester.id)
    } else if (slot.pflicht === false) {
      ausgeblendet.push(key)
    } else {
      throw new Error(fehlerMeldung(branche, slot))
    }
  }

  return { zuweisung, ausgeblendet }
}

/**
 * DB-Wrapper (§3.3): lädt approved Kandidaten über das Repository
 * (einziger Lesepfad) und weist deterministisch zu. Seed = siteId.
 */
export async function assignAssets(
  siteId: string,
  branche: string,
  styleTags: string[],
  slots: AssetSlots,
  vorgabe?: { admin?: SupabaseClient }
): Promise<AssignErgebnis> {
  const admin = vorgabe?.admin ?? createAdminClient()
  const kandidaten = await getApprovedAssets(admin, { branche })
  const { zuweisung, ausgeblendet } = assignAssetsAusKandidaten(
    siteId,
    branche,
    styleTags,
    slots,
    kandidaten
  )

  const ergebnis: Record<string, ZugewiesenesAsset> = {}
  for (const [key, asset] of Object.entries(zuweisung)) {
    ergebnis[key] = {
      assetId: asset.id,
      storagePath: asset.storage_path,
      altText: asset.alt_text_de,
    }
  }
  return { zuweisung: ergebnis, ausgeblendet }
}

export { publicAssetUrl }
