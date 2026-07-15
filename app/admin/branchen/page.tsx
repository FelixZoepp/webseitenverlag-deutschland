import { createClient } from '@/lib/supabase/server'
import BranchenView, { type BranchenZeile } from '@/components/branchen-view'
import { metaKategorie } from '@/config/branchen'
import type { FlagshipConfig } from '@/lib/flagship/types'

export const dynamic = 'force-dynamic'

interface ProfilJson {
  vorlage?: FlagshipConfig
  quelle?: 'flagship' | 'claude'
  gates_geprueft_am?: string
  assets?: { hero_id: string; paar_asset_ids: string[]; galerie_ids: string[] } | null
}

export default async function BranchenPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('branchen_profile')
    .select('branche_key, meta_kategorie, name, profil, guideline_notes, quality_status, approved_at')
    .order('meta_kategorie', { ascending: true })
    .order('branche_key', { ascending: true })

  // Nur schlanke Daten an den Client — profil jsonb ist groß (Vorlage + Profil)
  const zeilen: BranchenZeile[] = (data ?? []).map((row) => {
    const profil = (row.profil ?? {}) as ProfilJson
    const design = profil.vorlage?.design
    const assets = profil.assets
    return {
      branche_key: row.branche_key,
      name: row.name,
      meta_kategorie: row.meta_kategorie,
      meta_kategorie_name: metaKategorie(row.meta_kategorie)?.name ?? row.meta_kategorie,
      quality_status: row.quality_status as 'draft' | 'approved',
      approved_at: row.approved_at,
      guideline_notes: row.guideline_notes ?? [],
      quelle: profil.quelle ?? 'claude',
      gates_geprueft_am: profil.gates_geprueft_am ?? null,
      asset_anzahl: assets ? 1 + assets.paar_asset_ids.length + assets.galerie_ids.length : 0,
      farben: design
        ? { basis: design.tokens.basis, akzent1: design.tokens.akzent1, akzent2: design.tokens.akzent2 }
        : null,
      akzent_begruendung: design?.akzent_begruendung ?? '',
      beispiel_firma: profil.vorlage ? `${profil.vorlage.meta.firma} · ${profil.vorlage.meta.ort}` : '',
      funnel_modus: profil.vorlage?.funnel.modus ?? 'anfrage',
    }
  })

  return <BranchenView zeilen={zeilen} />
}
