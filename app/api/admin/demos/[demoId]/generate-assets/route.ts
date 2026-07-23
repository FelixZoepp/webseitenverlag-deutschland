import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { pruefeLlmSchranke } from '@/lib/llm-schranke'
import { generiereAsset, generiereVideo } from '@/lib/assets/pipeline'

export const maxDuration = 300

/**
 * POST: Generiert Assets für eine Custom-Demo (Padel etc.) und
 * schreibt die URLs in das HTML (simple String-Replacements).
 */
export async function POST(
  _request: Request,
  { params }: { params: { demoId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  // B-25: Bild- + Video-Generierung kostet Geld — Kill-Switch + Tages-Kosten-Cap
  const schranke = await pruefeLlmSchranke('admin-demo-generate-assets')
  if (!schranke.ok) {
    return NextResponse.json({ error: schranke.grund }, { status: schranke.status })
  }

  const { supabase } = auth.data

  const { data: demo, error: loadErr } = await supabase
    .from('demos')
    .select('id, config, prospect_name')
    .eq('id', params.demoId)
    .single()
  if (loadErr || !demo) return NextResponse.json({ error: 'Demo nicht gefunden' }, { status: 404 })

  const config = demo.config as { engine?: string; html?: string }
  if (config.engine !== 'custom' || !config.html) {
    return NextResponse.json({ error: 'Nur für Custom-Demos' }, { status: 400 })
  }

  const kontext = `custom-demo:${demo.prospect_name}`
  const ergebnisse: Record<string, string> = {}
  const warnungen: string[] = []

  // Hero-Court-Bild (16:9)
  try {
    const hero = await generiereAsset({
      prompt: 'Professional interior photography of a premium indoor padel court, glass walls reflecting neon green LED lights, polished blue court surface, a single bright yellow padel ball resting on the court in the RIGHT half of the frame, dramatic side lighting creating reflections on the glass. Modern sports facility, shallow depth of field. Photorealistic, no people, no text, no logos.',
      aspect: '16:9',
      branche: 'padel',
      szeneTyp: 'hero',
      quelleOverride: 'demo_generiert',
      kontext,
    })
    ergebnisse.hero = hero.publicUrl

    // Video aus dem Hero-Bild
    try {
      const video = await generiereVideo({
        imageUrl: hero.publicUrl,
        prompt: 'Cinematic 4K, completely static camera. A padel ball gently rolls across the polished court surface, subtle light reflections shimmer on glass walls, dust particles float in LED light. Smooth seamless loop, calm premium atmosphere. No people, no text.',
        durationSeconds: 5,
        kontext: `video:${kontext}`,
      })
      if (video.videoUrl) ergebnisse.video = video.videoUrl
    } catch (e) {
      warnungen.push(`Video: ${(e as Error).message}`)
    }
  } catch (e) {
    warnungen.push(`Hero: ${(e as Error).message}`)
  }

  // 3 Gallery-Bilder parallel
  const galPrompts = [
    'Close-up of padel rackets and bright yellow balls on a bench beside a glass-walled indoor court, warm ambient lighting, premium sports equipment, shallow depth of field. Photorealistic, no people, no text.',
    'Modern padel lounge area with comfortable seating overlooking glass courts, neon green accent lighting, dark premium interior. Photorealistic, no people, no text.',
    'Aerial close-up of padel court surface showing painted lines and net, yellow ball on blue surface, strong shadows from LED lighting. Photorealistic, no people, no text.',
  ]
  const galResults = await Promise.allSettled(
    galPrompts.map((prompt, i) =>
      generiereAsset({
        prompt,
        aspect: '4:3',
        branche: 'padel',
        szeneTyp: 'galerie',
        quelleOverride: 'demo_generiert',
        kontext: `${kontext}:gal-${i}`,
      })
    )
  )
  const galUrls: string[] = []
  galResults.forEach((r, i) => {
    if (r.status === 'fulfilled') galUrls.push(r.value.publicUrl)
    else warnungen.push(`Gallery ${i + 1}: ${(r.reason as Error).message}`)
  })

  // HTML updaten: Video-Header einbauen + Bilder in die Platzhalter
  let html = config.html

  // Video-Header einbauen (vor dem hero-content)
  if (ergebnisse.hero && ergebnisse.video) {
    // Hero-Section durch Video-Hero ersetzen
    html = html.replace(
      '<header class="hero" id="top">',
      `<header class="hero" id="top" style="overflow:hidden">
  <video autoplay muted loop playsinline preload="metadata" poster="${ergebnisse.hero}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0">
    <source src="${ergebnisse.video}" type="video/mp4">
  </video>
  <div style="position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(90deg,var(--paper) 0%,rgba(250,250,248,.97) 34%,rgba(250,250,248,.72) 52%,rgba(250,250,248,0) 70%)"></div>
  <div style="position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg,rgba(250,250,248,.5),transparent 20%)"></div>`
    )
  } else if (ergebnisse.hero) {
    // Nur Poster als Hintergrund
    html = html.replace(
      '<header class="hero" id="top">',
      `<header class="hero" id="top" style="background:url('${ergebnisse.hero}') center/cover;overflow:hidden">
  <div style="position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(90deg,var(--paper) 0%,rgba(250,250,248,.97) 34%,rgba(250,250,248,.72) 52%,rgba(250,250,248,0) 70%)"></div>`
    )
  }

  // Court-Frame Platzhalter durch echtes Bild ersetzen
  if (ergebnisse.hero) {
    html = html.replace(
      '<div class="court-frame" id="heroImg"></div>',
      `<div class="court-frame" id="heroImg"><img src="${ergebnisse.hero}" alt="SMASH HOUSE Padel Court Berlin" onload="this.parentElement.classList.add('loaded')"></div>`
    )
    // Zweiter Court-Frame (Why Padel section)
    html = html.replace(
      'data-label="COURT · PANORAMA">\n    </div>',
      `data-label="COURT · PANORAMA"><img src="${ergebnisse.hero}" alt="Padel Court Panorama" onload="this.parentElement.classList.add('loaded')"></div>`
    )
  }

  // Gallery-Platzhalter durch Bilder ersetzen
  const galLabels = ['COURT 1 · PANORAMA', 'LOUNGE · TREFFPUNKT', 'COACHING · SESSION']
  galUrls.forEach((url, i) => {
    if (galLabels[i]) {
      html = html.replace(
        `data-label="${galLabels[i]}"><figcaption>`,
        `data-label="${galLabels[i]}"><img src="${url}" alt="${galLabels[i]}" onload="this.parentElement.classList.add('loaded')"><figcaption>`
      )
    }
  })

  // Gallery-Loaded-CSS injizieren (Platzhalter-Text ausblenden wenn Bild geladen)
  html = html.replace(
    '</style>',
    `.galstrip figure.loaded::after{display:none}
.galstrip figure img{position:relative;z-index:1}
</style>`
  )

  // reduced-motion Fallback fürs Video
  if (ergebnisse.hero && ergebnisse.video) {
    html = html.replace(
      '@media(prefers-reduced-motion:reduce){',
      `@media(prefers-reduced-motion:reduce){
  .hero video{display:none}
  .hero{background:url('${ergebnisse.hero}') center/cover}`
    )
  }

  const { error } = await supabase
    .from('demos')
    .update({ config: { engine: 'custom', html }, updated_at: new Date().toISOString() })
    .eq('id', params.demoId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, ergebnisse, warnungen })
}
