import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { pruefeLlmSchranke } from '@/lib/llm-schranke'
import { generiereFlagshipDemo } from '@/lib/pipeline/generate-flagship-demo'
import { collectProspectData } from '@/lib/pipeline/prospect-data'
import { createAdminClient } from '@/lib/supabase/admin'
import type { FlagshipConfig } from '@/lib/flagship/types'

// Asset-Generierung braucht bis zu 180s (Hero + Signature-Paar parallel)
export const maxDuration = 300

/**
 * POST /api/admin/demos/[demoId]/assets
 * Phase 2: Generiert Hero-Bild, Signature-Paar und Ergebnis-Paare für eine
 * bereits gespeicherte Flagship-Demo. Wird vom Frontend automatisch nach
 * dem Demo-Erstellen getriggert.
 */
export async function POST(
  _request: Request,
  { params }: { params: { demoId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  // B-25: Asset-Generierung (Hero + Paare) kostet Geld — Kill-Switch + Tages-Kosten-Cap
  const schranke = await pruefeLlmSchranke('admin-demo-assets')
  if (!schranke.ok) {
    return NextResponse.json({ error: schranke.grund }, { status: schranke.status })
  }

  const admin = createAdminClient()
  const { data: demo, error: loadErr } = await admin
    .from('demos')
    .select('id, config, branche, prospect_name, prospect_website, notes, scraped_data')
    .eq('id', params.demoId)
    .single()

  if (loadErr || !demo) {
    return NextResponse.json({ error: 'Demo nicht gefunden' }, { status: 404 })
  }

  const config = demo.config as FlagshipConfig
  if (config.engine !== 'flagship') {
    return NextResponse.json({ error: 'Nur Flagship-Demos' }, { status: 400 })
  }

  // Bereits Assets vorhanden? (Hero-Bild = Mindest-Check)
  if (config.inhalte?.hero?.media?.datei) {
    return NextResponse.json({ ok: true, message: 'Assets bereits vorhanden' })
  }

  const brancheKey = demo.branche || config.branche_key || ''

  // Prospect-Data aus gespeichertem scraped_data oder neu sammeln
  const prospect = demo.scraped_data
    ? demo.scraped_data as Parameters<typeof generiereFlagshipDemo>[0]
    : await collectProspectData({
        firma: demo.prospect_name,
        ort: config.meta?.ort,
        branche: brancheKey,
        websiteUrl: demo.prospect_website,
        notizen: demo.notes,
      })

  try {
    const ergebnis = await generiereFlagshipDemo(prospect, brancheKey)

    // Config mit Assets updaten
    const { data: updated, error: updateErr } = await admin
      .from('demos')
      .update({
        config: ergebnis.config,
        kosten_cent: ergebnis.kostenCent,
        asset_meta: ergebnis.assetMeta,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.demoId)
      .select()
      .single()

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    const warning = ergebnis.warnungen.length > 0 ? ergebnis.warnungen.join(' · ') : null
    return NextResponse.json({
      ok: true,
      demo: updated,
      warning,
      kosten_cent: ergebnis.kostenCent,
      videoJob: ergebnis.videoJob ? true : false,
    })
  } catch (err) {
    return NextResponse.json(
      { error: `Asset-Generierung fehlgeschlagen: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}` },
      { status: 500 }
    )
  }
}
