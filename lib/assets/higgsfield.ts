/**
 * F1 Branchen-Fabrik — Asset-Motor: Provider-Abstraktion (BF §2.1)
 *
 * AssetProvider erzeugt Bilder bei einem KI-Dienst und liefert eine
 * Download-URL + Kosten. Reihenfolge: HiggsfieldProvider (primär),
 * FalProvider (Fallback, gleiche Schnittstelle), MockProvider (ohne Keys —
 * erzeugt deterministisch Platzhalter via sharp, damit die komplette
 * Pipeline inkl. makePair ohne API-Keys durchläuft).
 *
 * WICHTIG: Provider-/CDN-URLs erscheinen NIEMALS im Kundenoutput.
 * lib/assets/pipeline.ts lädt jedes Bild sofort ins eigene Supabase
 * Storage (WebP + AVIF + srcset-Größen) und legt den asset_bank-Eintrag an.
 *
 * ENV (siehe .env.local.example / WARTELISTE.md):
 *   HIGGSFIELD_API_KEY / HIGGSFIELD_API_SECRET / HIGGSFIELD_API_BASE
 *   FAL_API_KEY / FAL_MODEL_TEXT2IMG / FAL_MODEL_EDIT
 *   HIGGSFIELD_KOSTEN_CENT / FAL_KOSTEN_CENT (Kosten-Log je Call)
 */

import { randomUUID } from 'crypto'

export type AssetAspect = '3:4' | '4:3' | '16:9' | '1:1'

export interface GenerateImageOptions {
  prompt: string
  aspect: AssetAspect
  /** Job-ID eines vorherigen Bilds → Edit derselben Szene (makePair-Degradation) */
  referenceJobId?: string
  seed?: string
}

export interface GeneratedImage {
  jobId: string
  /** Download-URL (CDN, beim Mock eine data:-URL) — nur für den Sofort-Download */
  url: string
  costCents: number
  seed?: string
}

export interface GenerateVideoOptions {
  /** URL des Quellbilds (Hero-Bild → animiertes Looping-Video) */
  imageUrl: string
  prompt: string
  /** Dauer in Sekunden (Higgsfield: typisch 4–6s, Loop) */
  durationSeconds?: number
}

export interface GeneratedVideo {
  jobId: string
  /** Download-URL des MP4 */
  url: string
  costCents: number
  /** Poster-Bild (erster Frame / Original) */
  posterUrl?: string
}

export interface AssetProvider {
  readonly name: 'higgsfield' | 'fal' | 'mock'
  readonly quelle: 'ai_higgsfield' | 'ai_fal' | 'ai_mock'
  generateImage(o: GenerateImageOptions): Promise<GeneratedImage>
  generateVideo?(o: GenerateVideoOptions): Promise<GeneratedVideo>
}

/** Poll-Timeout laut BF §2.1: 120 s je Job. */
const POLL_TIMEOUT_MS = 120_000
const POLL_INTERVAL_MS = 3_000

const ASPECT_DIMENSIONS: Record<AssetAspect, { breite: number; hoehe: number }> = {
  '3:4': { breite: 1200, hoehe: 1600 },
  '4:3': { breite: 1600, hoehe: 1200 },
  '16:9': { breite: 1600, hoehe: 900 },
  '1:1': { breite: 1600, hoehe: 1600 },
}

async function pollBis<T>(
  schritt: () => Promise<T | null>,
  beschreibung: string
): Promise<T> {
  const start = Date.now()
  for (;;) {
    const ergebnis = await schritt()
    if (ergebnis !== null) return ergebnis
    if (Date.now() - start > POLL_TIMEOUT_MS) {
      throw new Error(`Timeout (${POLL_TIMEOUT_MS / 1000}s): ${beschreibung}`)
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }
}

// ------------------------------------------------------------
// Higgsfield (primär) — Endpoints per ENV konfigurierbar, weil die
// REST-Pfade noch unverifiziert sind (WARTELISTE: mit echtem Key testen).
// ------------------------------------------------------------

export class HiggsfieldProvider implements AssetProvider {
  readonly name = 'higgsfield' as const
  readonly quelle = 'ai_higgsfield' as const
  /** Job-ID → Ergebnis-URL, damit Edits (referenceJobId) das Quellbild finden */
  private ergebnisse = new Map<string, string>()

  private get base(): string {
    return (process.env.HIGGSFIELD_API_BASE ?? 'https://platform.higgsfield.ai').replace(/\/$/, '')
  }

  private get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'hf-api-key': process.env.HIGGSFIELD_API_KEY ?? '',
      'hf-secret': process.env.HIGGSFIELD_API_SECRET ?? '',
    }
  }

  async generateImage(o: GenerateImageOptions): Promise<GeneratedImage> {
    const seed = o.seed ?? String(Math.floor(Math.random() * 1_000_000))
    const referenzUrl = o.referenceJobId ? this.ergebnisse.get(o.referenceJobId) : undefined
    if (o.referenceJobId && !referenzUrl) {
      throw new Error(`Higgsfield: unbekannte referenceJobId ${o.referenceJobId}`)
    }

    // Text→Bild bzw. Bild-Edit (Degradation derselben Szene)
    const pfad = referenzUrl
      ? (process.env.HIGGSFIELD_PATH_EDIT ?? '/v1/image2image/soul')
      : (process.env.HIGGSFIELD_PATH_TEXT2IMG ?? '/v1/text2image/soul')

    const anlage = await fetch(`${this.base}${pfad}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        params: {
          prompt: o.prompt,
          aspect_ratio: o.aspect,
          seed: Number(seed),
          ...(referenzUrl ? { image_url: referenzUrl } : {}),
        },
      }),
    })
    if (!anlage.ok) {
      throw new Error(`Higgsfield-Job fehlgeschlagen (${anlage.status}): ${await anlage.text()}`)
    }
    const job = (await anlage.json()) as { id?: string; job_set_id?: string }
    const jobId = job.id ?? job.job_set_id
    if (!jobId) throw new Error('Higgsfield: keine Job-ID in der Antwort')

    const url = await pollBis(async () => {
      const res = await fetch(`${this.base}/v1/job-sets/${jobId}`, { headers: this.headers })
      if (!res.ok) throw new Error(`Higgsfield-Poll fehlgeschlagen (${res.status})`)
      const daten = (await res.json()) as {
        jobs?: Array<{ status: string; results?: { raw?: { url?: string } } }>
      }
      const fertig = daten.jobs?.find((j) => j.status === 'completed')
      if (daten.jobs?.every((j) => j.status === 'failed')) {
        throw new Error('Higgsfield: alle Jobs failed')
      }
      return fertig?.results?.raw?.url ?? null
    }, `Higgsfield-Job ${jobId}`)

    this.ergebnisse.set(jobId, url)
    return {
      jobId,
      url,
      costCents: Number(process.env.HIGGSFIELD_KOSTEN_CENT ?? 6),
      seed,
    }
  }

  async generateVideo(o: GenerateVideoOptions): Promise<GeneratedVideo> {
    const pfad = process.env.HIGGSFIELD_PATH_IMG2VID ?? '/v1/image2video/soul'
    const anlage = await fetch(`${this.base}${pfad}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        params: {
          prompt: o.prompt,
          image_url: o.imageUrl,
          duration: o.durationSeconds ?? 5,
        },
      }),
    })
    if (!anlage.ok) {
      throw new Error(`Higgsfield-Video fehlgeschlagen (${anlage.status}): ${await anlage.text()}`)
    }
    const job = (await anlage.json()) as { id?: string; job_set_id?: string }
    const jobId = job.id ?? job.job_set_id
    if (!jobId) throw new Error('Higgsfield-Video: keine Job-ID in der Antwort')

    const url = await pollBis(async () => {
      const res = await fetch(`${this.base}/v1/job-sets/${jobId}`, { headers: this.headers })
      if (!res.ok) throw new Error(`Higgsfield-Video-Poll fehlgeschlagen (${res.status})`)
      const daten = (await res.json()) as {
        jobs?: Array<{ status: string; results?: { raw?: { url?: string } } }>
      }
      const fertig = daten.jobs?.find((j) => j.status === 'completed')
      if (daten.jobs?.every((j) => j.status === 'failed')) {
        throw new Error('Higgsfield-Video: alle Jobs failed')
      }
      return fertig?.results?.raw?.url ?? null
    }, `Higgsfield-Video-Job ${jobId}`)

    return {
      jobId,
      url,
      costCents: Number(process.env.HIGGSFIELD_VIDEO_KOSTEN_CENT ?? 12),
      posterUrl: o.imageUrl,
    }
  }
}

// ------------------------------------------------------------
// fal.ai (Fallback) — Queue-API: POST queue.fal.run/{model} → poll → result
// ------------------------------------------------------------

export class FalProvider implements AssetProvider {
  readonly name = 'fal' as const
  readonly quelle = 'ai_fal' as const
  private ergebnisse = new Map<string, string>()

  private get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Key ${process.env.FAL_API_KEY ?? ''}`,
    }
  }

  async generateImage(o: GenerateImageOptions): Promise<GeneratedImage> {
    const seed = o.seed ?? String(Math.floor(Math.random() * 1_000_000))
    const referenzUrl = o.referenceJobId ? this.ergebnisse.get(o.referenceJobId) : undefined
    if (o.referenceJobId && !referenzUrl) {
      throw new Error(`fal.ai: unbekannte referenceJobId ${o.referenceJobId}`)
    }

    const modell = referenzUrl
      ? (process.env.FAL_MODEL_EDIT ?? 'fal-ai/nano-banana/edit')
      : (process.env.FAL_MODEL_TEXT2IMG ?? 'fal-ai/flux/dev')
    const dim = ASPECT_DIMENSIONS[o.aspect]

    const anlage = await fetch(`https://queue.fal.run/${modell}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        prompt: o.prompt,
        seed: Number(seed),
        image_size: { width: dim.breite, height: dim.hoehe },
        ...(referenzUrl ? { image_urls: [referenzUrl] } : {}),
      }),
    })
    if (!anlage.ok) {
      throw new Error(`fal.ai-Job fehlgeschlagen (${anlage.status}): ${await anlage.text()}`)
    }
    const job = (await anlage.json()) as {
      request_id: string
      status_url: string
      response_url: string
    }

    await pollBis(async () => {
      const res = await fetch(job.status_url, { headers: this.headers })
      if (!res.ok) throw new Error(`fal.ai-Poll fehlgeschlagen (${res.status})`)
      const status = (await res.json()) as { status: string }
      if (status.status === 'FAILED') throw new Error('fal.ai: Job failed')
      return status.status === 'COMPLETED' ? true : null
    }, `fal.ai-Job ${job.request_id}`)

    const res = await fetch(job.response_url, { headers: this.headers })
    if (!res.ok) throw new Error(`fal.ai-Result fehlgeschlagen (${res.status})`)
    const ergebnis = (await res.json()) as {
      images?: Array<{ url: string }>
      seed?: number
    }
    const url = ergebnis.images?.[0]?.url
    if (!url) throw new Error('fal.ai: kein Bild in der Antwort')

    this.ergebnisse.set(job.request_id, url)
    return {
      jobId: job.request_id,
      url,
      costCents: Number(process.env.FAL_KOSTEN_CENT ?? 4),
      seed: ergebnis.seed != null ? String(ergebnis.seed) : seed,
    }
  }
}

// ------------------------------------------------------------
// Mock (ohne Keys) — erzeugt Platzhalter lokal via sharp. Edits mit
// referenceJobId degradieren dasselbe Bild (entsättigen + abdunkeln),
// damit makePair() nachweislich dieselbe Szene liefert.
// ------------------------------------------------------------

export class MockProvider implements AssetProvider {
  readonly name = 'mock' as const
  readonly quelle = 'ai_mock' as const
  private bilder = new Map<string, Buffer>()

  async generateImage(o: GenerateImageOptions): Promise<GeneratedImage> {
    const { default: sharp } = await import('sharp')
    const seed = o.seed ?? String(Math.floor(Math.random() * 1_000_000))
    const jobId = `mock_${randomUUID()}`
    const dim = ASPECT_DIMENSIONS[o.aspect]

    let png: Buffer
    if (o.referenceJobId) {
      const quelle = this.bilder.get(o.referenceJobId)
      if (!quelle) throw new Error(`Mock: unbekannte referenceJobId ${o.referenceJobId}`)
      // Degradation derselben Szene: entsättigen, abdunkeln, leicht weichzeichnen
      png = await sharp(quelle)
        .modulate({ saturation: 0.35, brightness: 0.72 })
        .blur(1.2)
        .png()
        .toBuffer()
    } else {
      // Deterministischer Platzhalter: Farbverlauf aus dem Seed + Prompt-Auszug
      const hue = Number(seed) % 360
      const text = o.prompt.slice(0, 60).replace(/[<>&"]/g, '')
      const svg = `<svg width="${dim.breite}" height="${dim.hoehe}" xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="hsl(${hue},55%,72%)"/>
          <stop offset="1" stop-color="hsl(${(hue + 60) % 360},45%,45%)"/>
        </linearGradient></defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
        <circle cx="${dim.breite * 0.72}" cy="${dim.hoehe * 0.3}" r="${dim.hoehe * 0.16}" fill="hsl(${hue},60%,85%)" opacity="0.7"/>
        <text x="40" y="${dim.hoehe - 60}" font-family="sans-serif" font-size="34" fill="#fff" opacity="0.9">MOCK · ${text}</text>
      </svg>`
      png = await sharp(Buffer.from(svg)).png().toBuffer()
    }

    this.bilder.set(jobId, png)
    return {
      jobId,
      url: `data:image/png;base64,${png.toString('base64')}`,
      costCents: 0,
      seed,
    }
  }

  async generateVideo(_o: GenerateVideoOptions): Promise<GeneratedVideo> {
    // Mock: kein echtes Video — Pipeline durchläuft trotzdem,
    // hero.video bleibt ungesetzt (kein src → statischer Bild-Hero)
    return {
      jobId: `mock_video_${randomUUID()}`,
      url: '',
      costCents: 0,
      posterUrl: _o.imageUrl,
    }
  }
}

// ------------------------------------------------------------
// Provider-Kette: Higgsfield → fal.ai → Mock (je nach gesetzten Keys)
// ------------------------------------------------------------

export function getAssetProviderKette(): AssetProvider[] {
  const kette: AssetProvider[] = []
  if (process.env.HIGGSFIELD_API_KEY) kette.push(new HiggsfieldProvider())
  if (process.env.FAL_API_KEY) kette.push(new FalProvider())
  if (kette.length === 0) kette.push(new MockProvider())
  return kette
}
