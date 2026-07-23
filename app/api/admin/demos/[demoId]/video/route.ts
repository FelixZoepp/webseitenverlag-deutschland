import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { pruefeLlmSchranke } from '@/lib/llm-schranke'
import { generiereVideo } from '@/lib/assets/pipeline'
import { createAdminClient } from '@/lib/supabase/admin'
import type { FlagshipConfig } from '@/lib/flagship/types'
import { FLAGSHIP_VIDEO_PROMPTS } from '@/lib/pipeline/generate-flagship-demo'

export const maxDuration = 300

const VIDEO_PROMPTS: Record<string, string> = {
  reinigung: 'Extreme close-up of a grimy glass surface — an invisible force wipes across from left to right, revealing crystal-clear sparkling glass with bright daylight streaming through. Water droplets bead and roll off the clean surface. Static camera, no person visible, no text, no logos.',
  restaurant_italienisch: 'Overhead static shot of an empty white ceramic plate on a rustic wooden table — steam rises as fresh handmade pasta with rich tomato sauce materializes on the plate, finished with torn basil leaves and shaved parmesan. Warm candlelight flickers. No hands visible, no text, no logos.',
  maler: 'Close-up of a paint roller pressing against a wall — fresh white paint spreads smoothly across a patchy grey surface, leaving a perfect even finish. Paint glistens wet under bright work lighting. Static camera, only roller and wall visible, no face, no text, no logos.',
  dachdecker: 'Close-up of weathered broken roof tiles — new slate tiles slide into place one by one, clicking together perfectly. Morning sunlight catches the clean dark surfaces. Static camera from above, only tiles and hands in work gloves visible, no face, no text, no logos.',
  umzugsunternehmen: 'Close-up of moving blankets gently settling over furniture — bubble wrap catches light, a dolly wheel rolls smoothly across hardwood floor. Morning light streams through an empty apartment window. Static camera, no face visible, no text, no logos.',
  friseur: 'Extreme close-up of professional scissors making precise cuts through hair strands in slow motion — cut hair falls catching salon spotlight, each strand detailed and sharp. Warm salon lighting. Static camera, only scissors and hair visible, no face, no text, no logos.',
  kfz_werkstatt: 'Close-up of a chrome wrench turning on a bolt — oil glistens on metal surfaces, a hydraulic lift slowly raises a car in the background. Workshop LED lighting reflects off polished tools. Static camera, only hands in gloves and tools visible, no face, no text, no logos.',
  autoaufbereitung: 'Close-up of a car hood surface — water beads form and slowly roll off a freshly ceramic-coated deep black surface, reflecting surrounding lights like a mirror. The paint transforms from matte dusty to mirror-glossy. Static camera, no person, no text, no logos.',
  zahnarzt: 'Close-up of dental instruments arranged on a sterile tray — bright LED examination light slowly powers on, reflecting off polished chrome surfaces. Sterile blue-white lighting, clean and precise. Static camera, no person, no text, no logos.',
  physiotherapie: 'Close-up of therapy resistance bands stretching and releasing in rhythmic motion — natural light streams through floor-to-ceiling windows of a modern treatment room. Bands catch the light with each stretch. Static camera, no person, no text, no logos.',
  kosmetikstudio: 'Close-up of a jade roller gliding across a dewy skin surface — product absorbs, skin transforms from dull to radiant and glowing. Soft pink-toned studio lighting with gentle lens flare. Static camera, only skin and tool visible, no face, no text, no logos.',
  fitnessstudio: 'Close-up of a barbell being loaded — weight plates slide onto the bar one by one with satisfying clicks, chrome gleams under gym LED lighting. The bar slightly flexes under the weight. Static camera, no person, no text, no logos.',
  fotograf: 'A camera shutter closes in slow motion — the brief moment of exposure captured in detail, followed by a soft studio flash reflecting off a silver umbrella. Gentle bokeh lights drift in background. Static camera, only camera equipment visible, no person, no text, no logos.',
  cafe: 'Close-up of an espresso machine portafilter locking in — rich dark espresso streams into a white ceramic cup, crema forms a perfect golden layer on top, steam wisps curl upward. Soft morning café light. Static camera, no face visible, no text, no logos.',
  padel: 'A padel ball rolls slowly across a pristine blue court surface — subtle LED light reflections shimmer on the glass walls, dust particles float in the bright court lighting. The ball gently bounces once. Static camera at ground level, no person, no text, no logos.',
  hausmeisterservice: 'Close-up of a set of brass keys swinging gently on a caretaker key ring — behind them, a freshly painted railing dries in sunlight, a garden sprinkler slowly rotates. Warm afternoon light. Static camera, no person, no text, no logos.',
  personal_training: 'Close-up of a kettlebell gently swinging in the morning dew — outdoor training setup with resistance bands stretching in the wind, fresh morning sunlight creating long shadows on grass. Static camera, no person, no text, no logos.',
}

export async function POST(
  _request: Request,
  { params }: { params: { demoId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  // B-25: Video-Generierung kostet Geld — Kill-Switch + Tages-Kosten-Cap
  const schranke = await pruefeLlmSchranke('admin-demo-video')
  if (!schranke.ok) {
    return NextResponse.json({ error: schranke.grund }, { status: schranke.status })
  }

  const admin = createAdminClient()
  const { data: demo, error: loadErr } = await admin
    .from('demos')
    .select('id, config, branche, asset_meta, kosten_cent')
    .eq('id', params.demoId)
    .single()

  if (loadErr || !demo) {
    return NextResponse.json({ error: 'Demo nicht gefunden' }, { status: 404 })
  }

  const config = demo.config as FlagshipConfig
  if (config.engine !== 'flagship') {
    return NextResponse.json({ error: 'Nur Flagship-Demos unterstützt' }, { status: 400 })
  }

  let heroUrl = config.inhalte?.hero?.media?.datei

  // Assets werden parallel generiert — kurz warten und nochmal prüfen wenn noch kein Hero da ist
  if (!heroUrl) {
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 15_000)) // 15s warten, max 3 Min
      const { data: fresh } = await admin.from('demos').select('config').eq('id', params.demoId).single()
      heroUrl = (fresh?.config as FlagshipConfig)?.inhalte?.hero?.media?.datei
      if (heroUrl) break
    }
  }

  if (!heroUrl) {
    return NextResponse.json({ error: 'Kein Hero-Bild vorhanden nach 3 Min Warten — Asset-Generierung evtl. fehlgeschlagen' }, { status: 400 })
  }

  // Bereits ein Video vorhanden?
  if (config.inhalte?.hero?.video?.src) {
    return NextResponse.json({ ok: true, demo, message: 'Video bereits vorhanden' })
  }

  const brancheKey = demo.branche || config.branche_key || ''
  // Scroll-Animationen-Extra: Scrub-Video (Verwandlung an Scroll gekoppelt) statt Loop.
  // Branchen ohne Scrub-Prompt fallen still auf Loop zurück (Spec 2026-07-22).
  const scrubPrompt = config.scroll_animationen === true
    ? FLAGSHIP_VIDEO_PROMPTS[brancheKey]?.scrub
    : undefined
  const videoPrompt = scrubPrompt
    || VIDEO_PROMPTS[brancheKey]
    || `Cinematic 4K, static camera. Close-up scene related to ${brancheKey}. Subtle ambient motion, gentle material movement. Seamless 5-second loop. No face, no text, no logos.`

  try {
    const video = await generiereVideo({
      imageUrl: heroUrl,
      prompt: videoPrompt,
      durationSeconds: 6,
      kontext: `video:demo:${brancheKey}:${params.demoId}`,
    })

    if (!video.videoUrl) {
      return NextResponse.json({ error: 'Video-Generierung lieferte keine URL' }, { status: 500 })
    }

    config.inhalte.hero.video = { src: video.videoUrl, poster: heroUrl, modus: scrubPrompt ? 'scrub' : 'loop' }

    const assetMeta = (demo.asset_meta || {}) as Record<string, unknown>
    assetMeta.video = { job_id: video.jobId, quelle: 'frisch' }

    const { data: updated, error: updateErr } = await admin
      .from('demos')
      .update({
        config,
        asset_meta: assetMeta,
        kosten_cent: (demo.kosten_cent ?? 0) + video.kostenCent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.demoId)
      .select()
      .single()

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, demo: updated })
  } catch (err) {
    return NextResponse.json(
      { error: `Video-Generierung fehlgeschlagen: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}` },
      { status: 500 }
    )
  }
}
