import { requireAdmin } from '@/lib/auth-helpers'
import { NextResponse } from 'next/server'
import { generierungGesperrt } from '@/lib/monitoring'
import { generiereAsset, makePair, type SzeneTyp } from '@/lib/assets/pipeline'
import type { AssetAspect } from '@/lib/assets/higgsfield'

/**
 * MVP-Finish §3.5 — Freigabe-API der Asset-Bank.
 *
 * PATCH { action: 'approve' }              → quality_status 'approved' (Paare IMMER gemeinsam)
 * PATCH { action: 'reject' }               → 'rejected' (Paare gemeinsam)
 * PATCH { action: 'draft' }                → zurück auf 'draft' (Paare gemeinsam)
 * PATCH { action: 'alt', text: '…' }       → alt_text_de korrigieren (einzelnes Asset)
 * PATCH { action: 'regenerate' }           → neuer Call mit gespeichertem Prompt, neuem Seed
 *                                            (Paar ⇒ makePair mit beiden Prompts)
 *
 * Regeln: STUB-Assets (quelle='ai_mock') sind NIE approvebar.
 * Paar-Kopplung wird hier serverseitig erzwungen, nicht in der UI.
 */

export const maxDuration = 300

interface AssetZeile {
  id: string
  storage_path: string
  branchen: string[]
  style_tags: string[] | null
  szene_typ: string | null
  pair_id: string | null
  quelle: string
  gen_prompt: string | null
  aspect_ratio: string | null
  alt_text_de: string | null
  quality_status: string
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const result = await requireAdmin()
    if (!result.ok) return result.response
    const { supabase } = result.data

    const body = (await request.json().catch(() => null)) as { action?: string; text?: string } | null
    if (!body?.action) return NextResponse.json({ error: 'action fehlt' }, { status: 400 })

    const { data: asset, error: ladeFehler } = await supabase
      .from('asset_bank')
      .select('id, storage_path, branchen, style_tags, szene_typ, pair_id, quelle, gen_prompt, aspect_ratio, alt_text_de, quality_status')
      .eq('id', params.id)
      .maybeSingle<AssetZeile>()
    if (ladeFehler) return NextResponse.json({ error: ladeFehler.message }, { status: 500 })
    if (!asset) return NextResponse.json({ error: 'Asset nicht gefunden' }, { status: 404 })

    // Alt-Text: einzelnes Asset, keine Paar-Kopplung nötig
    if (body.action === 'alt') {
      const text = (body.text ?? '').trim()
      if (!text) return NextResponse.json({ error: 'Alt-Text fehlt' }, { status: 400 })
      if (text.length > 300) return NextResponse.json({ error: 'Alt-Text zu lang (max. 300 Zeichen)' }, { status: 400 })
      const { error } = await supabase.from('asset_bank').update({ alt_text_de: text }).eq('id', asset.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ id: asset.id, alt_text_de: text })
    }

    // Regenerate: neuer Provider-Call mit gespeichertem Prompt, neuem Seed
    if (body.action === 'regenerate') {
      if (generierungGesperrt()) {
        return NextResponse.json({ error: 'GENERATION_KILL_SWITCH aktiv — Generierung gestoppt' }, { status: 409 })
      }
      if (!asset.gen_prompt) {
        return NextResponse.json({ error: 'Kein gespeicherter Prompt — Asset ist nicht regenerierbar' }, { status: 400 })
      }
      const branche = asset.branchen[0]
      const aspect = (asset.aspect_ratio ?? '16:9') as AssetAspect

      // Paar ⇒ IMMER als Paar regenerieren (nie ein halbes Paar erzeugen)
      if (asset.pair_id) {
        const { data: haelften, error } = await supabase
          .from('asset_bank')
          .select('szene_typ, gen_prompt, alt_text_de')
          .eq('pair_id', asset.pair_id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        const nachher = haelften?.find((h) => h.szene_typ === 'nachher')
        const vorher = haelften?.find((h) => h.szene_typ === 'vorher')
        if (!nachher?.gen_prompt || !vorher?.gen_prompt) {
          return NextResponse.json({ error: 'Paar unvollständig — nicht regenerierbar' }, { status: 400 })
        }
        const paar = await makePair({
          branche,
          nachherPrompt: nachher.gen_prompt,
          vorherPrompt: vorher.gen_prompt,
          aspect,
          styleTags: asset.style_tags ?? [],
          nachherAltText: nachher.alt_text_de ?? undefined,
          vorherAltText: vorher.alt_text_de ?? undefined,
          kontext: `admin:regenerate:${branche}`,
        })
        return NextResponse.json({ regeneriert: true, pair_id: paar.pairId, ids: [paar.nachher.id, paar.vorher.id] })
      }

      const neu = await generiereAsset({
        prompt: asset.gen_prompt,
        aspect,
        branche,
        szeneTyp: (asset.szene_typ ?? 'galerie') as SzeneTyp,
        styleTags: asset.style_tags ?? [],
        altTextDe: asset.alt_text_de ?? undefined,
        kontext: `admin:regenerate:${branche}`,
      })
      return NextResponse.json({ regeneriert: true, ids: [neu.id] })
    }

    // Status-Aktionen: approve / reject / draft — Paare IMMER gemeinsam
    const statusMap: Record<string, string> = { approve: 'approved', reject: 'rejected', draft: 'draft' }
    const neuerStatus = statusMap[body.action]
    if (!neuerStatus) return NextResponse.json({ error: `Unbekannte action "${body.action}"` }, { status: 400 })

    // Betroffene Zeilen: das Asset selbst oder das komplette Paar
    let betroffene: Pick<AssetZeile, 'id' | 'quelle'>[] = [{ id: asset.id, quelle: asset.quelle }]
    if (asset.pair_id) {
      const { data: paarZeilen, error } = await supabase
        .from('asset_bank')
        .select('id, quelle')
        .eq('pair_id', asset.pair_id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      betroffene = paarZeilen ?? betroffene
    }

    // §3.4: STUB-Assets (Mock) sind nie approvebar — auch nicht als Paar-Hälfte
    if (neuerStatus === 'approved' && betroffene.some((z) => z.quelle === 'ai_mock')) {
      return NextResponse.json(
        { error: "STUB-Asset (quelle='ai_mock') — nie approvebar. Mit echtem Provider-Key regenerieren." },
        { status: 400 }
      )
    }

    const ids = betroffene.map((z) => z.id)
    const { error: updateFehler } = await supabase
      .from('asset_bank')
      .update({ quality_status: neuerStatus })
      .in('id', ids)
    if (updateFehler) return NextResponse.json({ error: updateFehler.message }, { status: 500 })

    return NextResponse.json({ ids, quality_status: neuerStatus, paar: ids.length > 1 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Interner Serverfehler'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
