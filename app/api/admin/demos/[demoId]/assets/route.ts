import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { pruefeLlmSchranke } from '@/lib/llm-schranke'
import { generiereFlagshipDemo } from '@/lib/pipeline/generate-flagship-demo'
import { collectProspectData } from '@/lib/pipeline/prospect-data'
import { createAdminClient } from '@/lib/supabase/admin'
import type { FlagshipConfig } from '@/lib/flagship/types'
import { videoErlaubtFuerTier } from '@/config/plans'
import { generiereVideo } from '@/lib/assets/pipeline'
import { FLAGSHIP_VIDEO_PROMPTS } from '@/lib/pipeline/generate-flagship-demo'

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
    .select('id, config, branche, prospect_name, prospect_website, notes, scraped_data, paket')
    .eq('id', params.demoId)
    .single()

  if (loadErr || !demo) {
    return NextResponse.json({ error: 'Demo nicht gefunden' }, { status: 404 })
  }

  const config = demo.config as FlagshipConfig
  if (config.engine !== 'flagship') {
    return NextResponse.json({ error: 'Nur Flagship-Demos' }, { status: 400 })
  }

  // Bereits ALLE Assets vorhanden? Hero + Signature + alle Leistungsbilder
  const leistungenOhneBild = config.inhalte?.leistungen?.karten?.filter((k: Record<string, unknown>) => !k.media || !(k.media as { datei?: string }).datei).length || 0
  if (config.inhalte?.hero?.media?.datei && config.inhalte?.signature?.nachher?.datei && leistungenOhneBild === 0) {
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

    // Video automatisch mit generieren wenn erlaubt und Hero-Bild vorhanden
    // NICHT wenn scroll_animationen aktiv — Scrub-Videos kommen aus dem Branchen-Profil
    let videoGenerated = false
    const hatScrub = ergebnis.config.scroll_animationen && ergebnis.config.scrub_assets?.clips?.length
    if (!hatScrub && ergebnis.videoJob && videoErlaubtFuerTier(demo.paket) && ergebnis.config.inhalte?.hero?.media?.datei) {
      try {
        const config = ergebnis.config
        const branche = demo.branche || config.branche_key || ''
        const scrubPrompt = config.scroll_animationen === true
          ? FLAGSHIP_VIDEO_PROMPTS[branche]?.scrub
          : undefined
        const videoPrompt = ergebnis.videoJob.videoPrompt
          || scrubPrompt
          || `Cinematic 4K, static camera. Close-up scene related to ${branche}. Subtle ambient motion. Seamless 5-second loop. No face, no text, no logos.`

        const video = await generiereVideo({
          imageUrl: ergebnis.config.inhalte.hero.media.datei,
          prompt: videoPrompt,
          durationSeconds: 6,
          kontext: ergebnis.videoJob.kontext || `video:demo:${branche}:${params.demoId}`,
        })

        if (video.videoUrl) {
          ergebnis.config.inhalte.hero.video = {
            src: video.videoUrl,
            poster: ergebnis.config.inhalte.hero.media.datei,
            modus: (config.scroll_animationen && scrubPrompt) ? 'scrub' : 'loop',
          }
          ergebnis.kostenCent += video.kostenCent
          videoGenerated = true

          // Config nochmal updaten mit Video
          await admin.from('demos').update({
            config: ergebnis.config,
            kosten_cent: ergebnis.kostenCent,
            updated_at: new Date().toISOString(),
          }).eq('id', params.demoId)
        }
      } catch (e) {
        ergebnis.warnungen.push(`Video-Generierung fehlgeschlagen: ${e instanceof Error ? e.message : 'Unbekannt'}`)
      }
    }

    const warning = ergebnis.warnungen.length > 0 ? ergebnis.warnungen.join(' · ') : null
    return NextResponse.json({
      ok: true,
      demo: updated,
      warning,
      kosten_cent: ergebnis.kostenCent,
      videoGenerated,
    })
  } catch (err) {
    return NextResponse.json(
      { error: `Asset-Generierung fehlgeschlagen: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}` },
      { status: 500 }
    )
  }
}
