/**
 * MVP-Finish §3.2 — Asset-Repository: der EINZIGE Lesepfad für ausspielbare Assets.
 *
 * Regel: Nur `quality_status='approved'` wird jemals ausgespielt. Die
 * WHERE-Klausel ist hier fest verdrahtet und wird NIE dem Aufrufer
 * überlassen. Wer Draft-/Rejected-Assets braucht (Admin-UI), geht
 * bewusst NICHT über dieses Modul.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'asset-bank'

/** Bank-Zeile, wie assignAssets sie braucht (nur approved erreicht diesen Typ) */
export interface ApprovedAsset {
  id: string
  storage_path: string
  szene_typ: string
  branchen: string[]
  style_tags: string[]
  pair_id: string | null
  breite: number | null
  hoehe: number | null
  aspect_ratio: string | null
  alt_text_de: string | null
  quelle: string
  created_at: string
}

const SPALTEN =
  'id, storage_path, szene_typ, branchen, style_tags, pair_id, breite, hoehe, aspect_ratio, alt_text_de, quelle, created_at'

/**
 * Approved-Assets einer Branche laden. quality_status='approved' ist
 * NICHT parametrisierbar — das ist der Zweck dieser Funktion.
 * quelle='kunde' ist hier IMMER ausgeschlossen: Kunden-Uploads gehören
 * genau einer Site und dürfen nie in fremden Demos/Sites landen (Phase 4).
 */
export async function getApprovedAssets(
  admin: SupabaseClient,
  filter: { branche: string; szeneTyp?: string; medium?: 'image' | 'video' }
): Promise<ApprovedAsset[]> {
  let q = admin
    .from('asset_bank')
    .select(SPALTEN)
    .eq('quality_status', 'approved') // §3.2: fest verdrahtet, nie Aufrufer-Sache
    .neq('quelle', 'kunde') // Phase 4: Kunden-Assets sind site-gebunden
    .contains('branchen', [filter.branche])
    .eq('medium', filter.medium ?? 'image')
    .order('created_at', { ascending: false })
  if (filter.szeneTyp) q = q.eq('szene_typ', filter.szeneTyp)

  const { data, error } = await q
  if (error) throw new Error(`asset_bank-Abfrage fehlgeschlagen: ${error.message}`)
  return (data ?? []) as ApprovedAsset[]
}

// ------------------------------------------------------------
// Phase 4 (§5.1): Editor-Sicht — Branchen-Bank + eigene Kunden-Bilder
// ------------------------------------------------------------

/** Asset, wie der Chat-Editor es sieht (immer mit fertiger URL). */
export interface EditorAsset {
  id: string
  url: string
  szene_typ: string | null
  quelle: string
  alt_text_de: string | null
}

/**
 * Alle Bilder, die der Chat-Editor einer Site anbieten darf:
 *  - approved Branchen-Assets (ohne quelle='kunde')
 *  - PLUS die eigenen Kunden-Uploads dieser Site (quelle='kunde', site_id)
 * Andere Quellen existieren für den Editor nicht (swap_image_from_bank).
 */
export async function getEditorAssets(
  admin: SupabaseClient,
  filter: { branche: string; siteId: string }
): Promise<EditorAsset[]> {
  const [bank, kunde] = await Promise.all([
    getApprovedAssets(admin, { branche: filter.branche }),
    admin
      .from('asset_bank')
      .select(SPALTEN)
      .eq('quality_status', 'approved')
      .eq('quelle', 'kunde')
      .eq('site_id', filter.siteId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw new Error(`asset_bank-Abfrage (kunde) fehlgeschlagen: ${error.message}`)
        return (data ?? []) as ApprovedAsset[]
      }),
  ])

  return [...kunde, ...bank].map((a) => ({
    id: a.id,
    // Kunden-Uploads liegen im Bucket 'kundenbilder' (eine Datei, geteilt mit
    // kunden_bilder), Bank-Assets im Bucket 'asset-bank'.
    url:
      a.quelle === 'kunde'
        ? admin.storage.from('kundenbilder').getPublicUrl(a.storage_path).data.publicUrl
        : publicAssetUrl(admin, a.storage_path),
    szene_typ: a.szene_typ ?? null,
    quelle: a.quelle,
    alt_text_de: a.alt_text_de ?? null,
  }))
}

/** Public-URL eines Bank-Assets (Bucket asset-bank) */
export function publicAssetUrl(admin: SupabaseClient, storagePath: string): string {
  return admin.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl
}
