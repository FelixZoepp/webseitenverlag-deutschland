/**
 * Video-Leiste (Baustein C §C.3) — Admin-Werkzeug für Growth-Video-Header.
 *
 * Kette: deutsche Beschreibung → Claude-Prompt-Refiner (config/video-guidelines.ts)
 * → Generierung (image-to-video, stub-fähig) → asset_bank (medium='video',
 * quality_status='draft', gen_prompt + gen_seed) → Freigabe → Zuweisung.
 *
 * QA C-VIDEO-APPROVED: Nur freigegebene Videos (quality_status='approved')
 * dürfen einer Site zugewiesen werden — serverseitig erzwungen, nie nur UI.
 * Video-Fehler führen NIE zu einer kaputten Seite: das statische Hero-Bild
 * bleibt als Poster/Fallback (C-VIDEO-FALLBACK im Renderer).
 */
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth-helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { generiereVideo } from '@/lib/assets/pipeline'
import { buildVideoRefinerPrompt, VIDEO_GUIDELINES } from '@/config/video-guidelines'
import { hatEditorFeature } from '@/config/plans'
import type { FlagshipConfig } from '@/lib/flagship/types'

export const maxDuration = 300

const BodySchema = z.discriminatedUnion('aktion', [
  z.object({ aktion: z.literal('refine'), beschreibung: z.string().min(5).max(2000) }),
  z.object({ aktion: z.literal('generate'), prompt: z.string().min(10).max(4000) }),
  z.object({ aktion: z.literal('regenerate'), assetId: z.string().uuid() }),
  z.object({ aktion: z.literal('approve'), assetId: z.string().uuid() }),
  z.object({ aktion: z.literal('reject'), assetId: z.string().uuid() }),
  z.object({ aktion: z.literal('assign'), assetId: z.string().uuid() }),
])

interface VideoVarianten {
  video_url: string
  poster_url: string
  groesse_bytes?: number
  stub?: boolean
}

function neueSeed(): string {
  return String(Math.floor(Math.random() * 1_000_000))
}

/** Dateigröße per HEAD prüfen (Browser-QA C-VIDEO-SIZE: ≤3 MB nach Transkodierung). */
async function ermittleGroesse(url: string): Promise<number | undefined> {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    const len = res.headers.get('content-length')
    return len ? Number(len) : undefined
  } catch {
    return undefined
  }
}

export async function POST(request: Request, { params }: { params: { siteId: string } }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const parsed = BodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ungültige Anfrage', details: parsed.error.issues }, { status: 400 })
  }
  const body = parsed.data

  const admin = createAdminClient()
  const { data: site, error: siteErr } = await admin
    .from('sites')
    .select('*')
    .eq('id', params.siteId)
    .single()
  if (siteErr || !site) {
    return NextResponse.json({ error: 'Site nicht gefunden' }, { status: 404 })
  }

  const config = (site.draft_config || site.config) as FlagshipConfig
  const branche: string =
    (site as { branche?: string }).branche || config?.branche_key || 'allgemein'
  const heroUrl: string | undefined = config?.inhalte?.hero?.media?.datei

  // ---- refine: deutscher Freitext → englischer Video-Prompt (Guidelines) ----
  if (body.aktion === 'refine') {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6-20250514',
      max_tokens: 600,
      temperature: 0.4,
      messages: [{ role: 'user', content: buildVideoRefinerPrompt(body.beschreibung, branche) }],
    })
    const refined = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()
    return NextResponse.json({ ok: true, original: body.beschreibung, refined })
  }

  // ---- generate / regenerate: Video erzeugen, als Draft in die asset_bank ----
  if (body.aktion === 'generate' || body.aktion === 'regenerate') {
    let prompt: string
    if (body.aktion === 'regenerate') {
      // Regenerate = gespeicherter Prompt + neuer Seed (§C.3)
      const { data: alt } = await admin
        .from('asset_bank')
        .select('gen_prompt')
        .eq('id', body.assetId)
        .eq('medium', 'video')
        .single()
      if (!alt?.gen_prompt) {
        return NextResponse.json({ error: 'Kein gespeicherter Prompt für dieses Video' }, { status: 404 })
      }
      prompt = alt.gen_prompt
    } else {
      prompt = body.prompt
    }

    const seed = neueSeed()
    let varianten: VideoVarianten
    let jobId = 'stub'
    let kostenCent = 0

    if (heroUrl) {
      try {
        const video = await generiereVideo({
          imageUrl: heroUrl,
          prompt,
          durationSeconds: VIDEO_GUIDELINES.dauerSekundenMax - 2, // 6s im 5–8s-Korridor
          kontext: `video:site:${branche}:${params.siteId}`,
        })
        if (!video.videoUrl) throw new Error('Provider lieferte keine Video-URL')
        jobId = video.jobId
        kostenCent = video.kostenCent
        varianten = {
          video_url: video.videoUrl,
          poster_url: video.posterUrl || heroUrl,
          groesse_bytes: await ermittleGroesse(video.videoUrl),
        }
      } catch (err) {
        // Stub-Fallback (§C.3 DoD): Kette bleibt testbar, Poster = Hero-Bild.
        console.warn(`[video-leiste] Generierung fehlgeschlagen, Stub-Draft (site ${params.siteId}):`, err)
        varianten = { video_url: '', poster_url: heroUrl, stub: true }
      }
    } else {
      varianten = { video_url: '', poster_url: '', stub: true }
    }

    const maxBytes = VIDEO_GUIDELINES.maxGroesseMb * 1024 * 1024
    const zuGross = (varianten.groesse_bytes ?? 0) > maxBytes

    const { data: asset, error: insErr } = await admin
      .from('asset_bank')
      .insert({
        storage_path: `video/${params.siteId}/${Date.now()}.mp4`,
        medium: 'video',
        quality_status: 'draft',
        szene_typ: 'video_hero',
        branchen: [branche],
        quelle: varianten.stub ? 'ai_mock' : 'ai_higgsfield',
        gen_prompt: prompt,
        gen_seed: seed,
        gen_job_id: jobId,
        kosten_cent: kostenCent,
        site_id: params.siteId,
        alt_text_de: `Hero-Video (${branche})`,
        varianten,
      })
      .select('*')
      .single()

    if (insErr) {
      return NextResponse.json({ error: `Draft konnte nicht gespeichert werden: ${insErr.message}` }, { status: 500 })
    }
    return NextResponse.json({
      ok: true,
      asset,
      stub: varianten.stub === true,
      warnung: zuGross
        ? `Video ist größer als ${VIDEO_GUIDELINES.maxGroesseMb} MB — vor Freigabe transkodieren (C-VIDEO-SIZE).`
        : null,
    })
  }

  // ---- approve / reject: Freigabe-Entscheidung ----
  if (body.aktion === 'approve' || body.aktion === 'reject') {
    const status = body.aktion === 'approve' ? 'approved' : 'rejected'
    const { data: asset, error: updErr } = await admin
      .from('asset_bank')
      .update({ quality_status: status })
      .eq('id', body.assetId)
      .eq('medium', 'video')
      .select('*')
      .single()
    if (updErr || !asset) {
      return NextResponse.json({ error: 'Video nicht gefunden' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, asset })
  }

  // ---- assign: nur approved, nur Growth, immer mit Poster-Fallback ----
  // Serverseitiges Gate (§C.2/§C.3): Video-Header ist ein Growth-Recht.
  const tier = (site as { package?: string }).package || 'starter'
  if (!hatEditorFeature(tier, 'video_header')) {
    return NextResponse.json(
      { error: 'Video-Header ist ein Growth-Feature — Site ist nicht im Growth-Paket.' },
      { status: 403 }
    )
  }

  const { data: asset } = await admin
    .from('asset_bank')
    .select('*')
    .eq('id', body.assetId)
    .eq('medium', 'video')
    .single()
  if (!asset) return NextResponse.json({ error: 'Video nicht gefunden' }, { status: 404 })
  if (asset.quality_status !== 'approved') {
    // C-VIDEO-APPROVED: Draft/Rejected wird NIE ausgespielt.
    return NextResponse.json({ error: 'Nur freigegebene Videos können zugewiesen werden.' }, { status: 409 })
  }

  const v = (asset.varianten || {}) as Partial<VideoVarianten>
  if (!v.video_url) {
    return NextResponse.json({ error: 'Dieses Video hat keine abspielbare Datei (Stub).' }, { status: 409 })
  }
  if (!config?.inhalte?.hero) {
    return NextResponse.json({ error: 'Diese Site-Engine unterstützt keinen Video-Header.' }, { status: 400 })
  }

  const neuConfig: FlagshipConfig = {
    ...config,
    inhalte: {
      ...config.inhalte,
      hero: {
        ...config.inhalte.hero,
        // Poster = statisches Bild → Fallback bei Video-Fehler (C-VIDEO-FALLBACK)
        video: { src: v.video_url, poster: v.poster_url || heroUrl, modus: 'loop' as const },
      },
    },
  }

  const { error: saveErr } = await admin
    .from('sites')
    .update({ draft_config: neuConfig, updated_at: new Date().toISOString() })
    .eq('id', params.siteId)
  if (saveErr) {
    return NextResponse.json({ error: `Zuweisung fehlgeschlagen: ${saveErr.message}` }, { status: 500 })
  }
  return NextResponse.json({ ok: true, zugewiesen: body.assetId })
}

/** Liste aller Video-Drafts/Freigaben dieser Site für die Leiste. */
export async function GET(_request: Request, { params }: { params: { siteId: string } }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const admin = createAdminClient()
  const { data: videos } = await admin
    .from('asset_bank')
    .select('id, quality_status, gen_prompt, gen_seed, gen_job_id, kosten_cent, varianten, created_at')
    .eq('site_id', params.siteId)
    .eq('medium', 'video')
    .order('created_at', { ascending: false })
  return NextResponse.json({ ok: true, videos: videos || [] })
}
