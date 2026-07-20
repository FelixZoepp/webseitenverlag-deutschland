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
 */
export async function getApprovedAssets(
  admin: SupabaseClient,
  filter: { branche: string; szeneTyp?: string; medium?: 'image' | 'video' }
): Promise<ApprovedAsset[]> {
  let q = admin
    .from('asset_bank')
    .select(SPALTEN)
    .eq('quality_status', 'approved') // §3.2: fest verdrahtet, nie Aufrufer-Sache
    .contains('branchen', [filter.branche])
    .eq('medium', filter.medium ?? 'image')
    .order('created_at', { ascending: false })
  if (filter.szeneTyp) q = q.eq('szene_typ', filter.szeneTyp)

  const { data, error } = await q
  if (error) throw new Error(`asset_bank-Abfrage fehlgeschlagen: ${error.message}`)
  return (data ?? []) as ApprovedAsset[]
}

/** Public-URL eines Bank-Assets (Bucket asset-bank) */
export function publicAssetUrl(admin: SupabaseClient, storagePath: string): string {
  return admin.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl
}
