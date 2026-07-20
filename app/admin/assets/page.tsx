import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import AssetsView, { type AssetZeile } from '@/components/assets-view'

export const dynamic = 'force-dynamic'

/**
 * MVP-Finish §3.5 — Freigabe-UI der Asset-Bank.
 * Grid mit Filtern (Branche/Szene/Status), Großansicht, Approve/Reject/
 * Regenerate, Alt-Text-Korrektur. Paare werden IMMER gemeinsam angezeigt
 * und gemeinsam freigegeben/abgelehnt (Server erzwingt die Kopplung).
 */
export default async function AssetsPage() {
  const supabase = createClient()
  const admin = createAdminClient()

  const { data } = await supabase
    .from('asset_bank')
    .select('id, storage_path, medium, branchen, style_tags, szene_typ, pair_id, quelle, aspect_ratio, alt_text_de, breite, hoehe, kosten_cent, quality_status, created_at')
    .eq('medium', 'image')
    .order('created_at', { ascending: false })
    .limit(500)

  const zeilen: AssetZeile[] = (data ?? []).map((row) => ({
    id: row.id,
    url: admin.storage.from('asset-bank').getPublicUrl(row.storage_path).data.publicUrl,
    branchen: row.branchen ?? [],
    style_tags: row.style_tags ?? [],
    szene_typ: row.szene_typ ?? '',
    pair_id: row.pair_id,
    quelle: row.quelle,
    aspect_ratio: row.aspect_ratio,
    alt_text_de: row.alt_text_de,
    breite: row.breite,
    hoehe: row.hoehe,
    kosten_cent: row.kosten_cent ?? 0,
    quality_status: row.quality_status as 'draft' | 'approved' | 'rejected',
    created_at: row.created_at,
  }))

  return <AssetsView zeilen={zeilen} />
}
