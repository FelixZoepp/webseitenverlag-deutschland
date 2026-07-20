/**
 * QA-Gate Baustein A: Browser-QA-Job.
 *
 * browserQa() lädt die gerenderte Site in headless Chromium — zweimal
 * (mobile 390×844, desktop 1440×900) plus einem reduced-motion-Pass —,
 * führt alle Browser-Checks aus, kombiniert sie mit den Render-Checks
 * und lässt die chirurgische Selbstreparatur (reparatur.ts) laufen.
 *
 * Artefakte: Full-Page-Screenshots (mobile + desktop) im Storage
 * (asset-bank/qa/{siteId}/…), Ergebnis als qa_reports-Zeile.
 *
 * Playwright-Laden: devDependency wird von webpack nicht gebündelt —
 * eval('require') lädt lokal die installierte Version. Auf Vercel ohne
 * lokale Browser: BROWSER_QA_WS_ENDPOINT (Browserless o. ä.) als
 * Fallback via chromium.connect(). Fehlt beides → Fehler mit klarer
 * Meldung (WARTELISTE.md).
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Browser, BrowserContext, Page } from 'playwright-core'
import { createAdminClient } from '@/lib/supabase/admin'
import { getApprovedAssets, publicAssetUrl } from '@/lib/assets/repository'
import { renderFlagshipPage, funnelPfad } from '@/lib/flagship/render'
import type { FlagshipConfig, FlagshipRenderOptionen } from '@/lib/flagship/types'
import type { BusinessProfil, CopySlots } from '@/lib/generierung/copy-slots'
import { pruefeRenderRegeln } from './render-checks'
import {
  CLS_INIT_SCRIPT,
  fuehreBrowserChecksAus,
  pruefeMotion,
} from './browser-checks'
import { fuehreQaLaufAus, type QaLaufErgebnis, type ReparaturDeps } from './reparatur'
import type { RegelErgebnis } from './regeln'

const QA_ORIGIN = 'https://qa-check.webseiten-verlag.de'
const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
} as const

// ------------------------------------------------------------ Browser-Start

type PlaywrightModul = {
  chromium: {
    launch(opts?: { headless?: boolean }): Promise<Browser>
    connect(wsEndpoint: string): Promise<Browser>
  }
}

async function starteBrowser(): Promise<Browser> {
  let pw: PlaywrightModul | null = null
  try {
    // eval verhindert, dass webpack die devDependency bündelt
    pw = eval('require')('playwright') as PlaywrightModul
  } catch {
    try {
      pw = eval('require')('playwright-core') as PlaywrightModul
    } catch {
      pw = null
    }
  }
  const ws = process.env.BROWSER_QA_WS_ENDPOINT
  if (pw) {
    try {
      return await pw.chromium.launch({ headless: true })
    } catch (e) {
      if (ws) return pw.chromium.connect(ws)
      throw new Error(
        `Browser-QA: Chromium konnte nicht starten (${e instanceof Error ? e.message : e}). ` +
          'Lokal: npx playwright install chromium. Prod: BROWSER_QA_WS_ENDPOINT setzen (siehe WARTELISTE.md).'
      )
    }
  }
  throw new Error(
    'Browser-QA: playwright ist nicht installiert und BROWSER_QA_WS_ENDPOINT ist nicht gesetzt (siehe WARTELISTE.md).'
  )
}

// ------------------------------------------------------------ Scan im Browser

interface BrowserScanErgebnis {
  ergebnisse: RegelErgebnis[]
  screenshots: { mobile?: Buffer; desktop?: Buffer }
}

async function bereiteSeiteVor(
  context: BrowserContext,
  html: string
): Promise<{ page: Page; consoleErrors: string[]; failedRequests: string[] }> {
  await context.addInitScript(CLS_INIT_SCRIPT)
  const page = await context.newPage()
  const consoleErrors: string[] = []
  const failedRequests: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 300))
  })
  page.on('pageerror', (err) => consoleErrors.push(String(err).slice(0, 300)))
  page.on('requestfailed', (req) => {
    failedRequests.push(`${req.url().slice(0, 200)} (${req.failure()?.errorText ?? 'failed'})`)
  })
  // Dokument-Requests auf unserer QA-Origin mit dem gerenderten HTML beantworten,
  // alle anderen (Supabase-Bilder …) real durchlassen.
  await page.route('**/*', async (route) => {
    const req = route.request()
    if (req.url().startsWith(QA_ORIGIN) && req.resourceType() === 'document') {
      await route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html })
    } else if (req.url().startsWith(QA_ORIGIN)) {
      // Relative Ressourcen der QA-Origin existieren nicht — 404 statt Netzwerkfehler
      await route.fulfill({ status: 404, body: '' })
    } else {
      await route.continue()
    }
  })
  return { page, consoleErrors, failedRequests }
}

async function scanneMitBrowser(
  browser: Browser,
  html: string,
  kontext: { stadt: string; mode: 'demo' | 'publish'; funnelPfad?: string }
): Promise<BrowserScanErgebnis> {
  const ergebnisse: RegelErgebnis[] = []
  const screenshots: BrowserScanErgebnis['screenshots'] = {}

  for (const viewport of ['mobile', 'desktop'] as const) {
    const context = await browser.newContext({ viewport: VIEWPORTS[viewport] })
    try {
      const { page, consoleErrors, failedRequests } = await bereiteSeiteVor(context, html)
      await page.goto(`${QA_ORIGIN}/`, { waitUntil: 'networkidle', timeout: 45000 })
      ergebnisse.push(
        ...(await fuehreBrowserChecksAus(page, {
          stadt: kontext.stadt,
          mode: kontext.mode,
          viewport,
          consoleErrors,
          failedRequests,
          funnelPfad: kontext.funnelPfad,
        }))
      )
      screenshots[viewport] = await page.screenshot({ fullPage: true, type: 'png' })
    } finally {
      await context.close()
    }
  }

  // B-MOTION: eigener Pass mit prefers-reduced-motion VOR der Navigation
  const motionContext = await browser.newContext({
    viewport: VIEWPORTS.desktop,
    reducedMotion: 'reduce',
  })
  try {
    const { page } = await bereiteSeiteVor(motionContext, html)
    await page.goto(`${QA_ORIGIN}/`, { waitUntil: 'networkidle', timeout: 45000 })
    ergebnisse.push(await pruefeMotion(page))
  } finally {
    await motionContext.close()
  }

  return { ergebnisse, screenshots }
}

// ------------------------------------------------------------ Artefakte

async function ladeScreenshotsHoch(
  admin: SupabaseClient,
  siteId: string,
  screenshots: BrowserScanErgebnis['screenshots']
): Promise<{ mobile?: string; desktop?: string }> {
  const urls: { mobile?: string; desktop?: string } = {}
  const ts = Date.now()
  for (const viewport of ['mobile', 'desktop'] as const) {
    const buffer = screenshots[viewport]
    if (!buffer) continue
    const pfad = `qa/${siteId}/${ts}-${viewport}.png`
    const { error } = await admin.storage
      .from('asset-bank')
      .upload(pfad, buffer, { contentType: 'image/png', upsert: true })
    if (!error) {
      urls[viewport] = admin.storage.from('asset-bank').getPublicUrl(pfad).data.publicUrl
    }
  }
  return urls
}

// ------------------------------------------------------------ Job

export interface BrowserQaJob {
  siteId: string
  /** qa_reports.mode — 'cron' scannt Live-Sites wie 'publish' */
  mode: 'demo' | 'publish' | 'cron'
  config: FlagshipConfig
  profil: BusinessProfil
  styleTags?: string[]
  /** Bekannte Video-Größe in Bytes (C-VIDEO-SIZE), falls Video gesetzt */
  videoBytes?: number | null
  renderOptionen?: FlagshipRenderOptionen
  /** Betroffene Copy-Slots neu generieren (Claude) — ohne: Copy-Fehler ⇒ failed */
  generiereSlots?: (feedback: string) => Promise<CopySlots>
  admin?: SupabaseClient
}

export interface BrowserQaErgebnis extends QaLaufErgebnis {
  reportId: string | null
  screenshotUrls: { mobile?: string; desktop?: string }
}

export async function browserQa(job: BrowserQaJob): Promise<BrowserQaErgebnis> {
  const admin = job.admin ?? createAdminClient()
  const browserMode: 'demo' | 'publish' = job.mode === 'demo' ? 'demo' : 'publish'
  const kandidaten = await getApprovedAssets(admin, { branche: job.profil.brancheKey })
  const renderOptionen: FlagshipRenderOptionen = job.renderOptionen ?? {
    noindex: browserMode === 'demo',
    basisPfad: '',
  }

  const browser = await starteBrowser()
  let letzteScreenshots: BrowserScanErgebnis['screenshots'] = {}

  let lauf: QaLaufErgebnis
  try {
    const deps: ReparaturDeps = {
      seedKey: job.siteId,
      branche: job.profil.brancheKey,
      styleTags: job.styleTags ?? [],
      profil: job.profil,
      kandidaten,
      urlFuerAsset: (asset) => publicAssetUrl(admin, asset.storage_path),
      generiereSlots: job.generiereSlots,
      markiereAssetDefekt: async (assetUrl, grund) => {
        const asset = kandidaten.find((a) => assetUrl.endsWith(a.storage_path))
        if (!asset) return
        await admin
          .from('asset_bank')
          .update({ quality_status: 'rejected', credit: `QA: ${grund}` })
          .eq('id', asset.id)
      },
      meldeManualTask: async (titel, beschreibung) => {
        await admin.from('manual_tasks').insert({
          typ: 'QA_FEHLER',
          titel,
          beschreibung: `${beschreibung}\n\nsite_id: ${job.siteId}`,
          quelle: 'browser-qa',
        })
      },
      rendere: (config) => renderFlagshipPage(config, renderOptionen),
      scanne: async (html, config) => {
        const renderErgebnisse = pruefeRenderRegeln(html, {
          config,
          stadt: job.profil.stadt,
          mode: browserMode,
          videoBytes: job.videoBytes,
        })
        const browserErgebnisse = await scanneMitBrowser(browser, html, {
          stadt: job.profil.stadt,
          mode: browserMode,
          funnelPfad: funnelPfad(config, renderOptionen.basisPfad ?? ''),
        })
        letzteScreenshots = browserErgebnisse.screenshots
        return [...renderErgebnisse, ...browserErgebnisse.ergebnisse]
      },
    }

    lauf = await fuehreQaLaufAus(job.config, deps)
  } finally {
    await browser.close().catch(() => {})
  }

  const screenshotUrls = await ladeScreenshotsHoch(admin, job.siteId, letzteScreenshots)

  const { data: report } = await admin
    .from('qa_reports')
    .insert({
      site_id: job.siteId,
      mode: job.mode,
      status: lauf.status,
      report: {
        runden: lauf.runden,
        reparaturen: lauf.reparaturen,
        fehler_grund: lauf.fehler_grund ?? null,
        ergebnisse: lauf.ergebnisse,
        geprueft_am: lauf.geprueft_am,
      },
      screenshots: screenshotUrls,
    })
    .select('id')
    .single()

  return { ...lauf, reportId: report?.id ?? null, screenshotUrls }
}
