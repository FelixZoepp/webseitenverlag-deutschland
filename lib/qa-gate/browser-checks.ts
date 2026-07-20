/**
 * QA-Gate Baustein A: Browser-Layer-Checks (B-*).
 *
 * Läuft auf einer bereits geladenen Playwright-Page. Der Aufrufer
 * (browser-qa.ts) ist verantwortlich für:
 *  - Console-/Request-Listener VOR der Navigation (consoleErrors/failedRequests)
 *  - CLS-Init-Script VOR der Navigation (addInitScript mit CLS_INIT_SCRIPT)
 *  - reduced-motion-Kontext für pruefeMotion (Emulation VOR goto)
 */

import type { Page } from 'playwright-core'
import { findeFremdeStaedte } from '@/lib/generierung/staedte-blockliste'
import type { RegelErgebnis } from './regeln'

export interface BrowserCheckKontext {
  stadt: string
  mode: 'demo' | 'publish'
  viewport: 'mobile' | 'desktop'
  /** Vom Aufrufer vor der Navigation gesammelte Console-Errors */
  consoleErrors: string[]
  /** Vom Aufrufer gesammelte fehlgeschlagene Requests (URL + Fehler) */
  failedRequests: string[]
  /** Erwarteter Funnel-Pfad (für B-FORM auf der Hauptseite) */
  funnelPfad?: string
}

/** Vor der Navigation via context.addInitScript() injizieren (B-CLS) */
export const CLS_INIT_SCRIPT = `
  window.__qaCls = 0;
  try {
    new PerformanceObserver(function(l){
      l.getEntries().forEach(function(e){ if(!e.hadRecentInput) window.__qaCls += e.value; });
    }).observe({ type: 'layout-shift', buffered: true });
  } catch (e) {}
`

interface ImgInfo {
  src: string
  naturalWidth: number
  naturalHeight: number
  clientWidth: number
  clientHeight: number
  sichtbar: boolean
}

async function sammleImgInfos(page: Page): Promise<ImgInfo[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('img')).map((img) => {
      const rect = img.getBoundingClientRect()
      return {
        src: img.getAttribute('src') ?? '',
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        clientWidth: Math.round(rect.width),
        clientHeight: Math.round(rect.height),
        sichtbar: rect.width > 1 && rect.height > 1,
      }
    })
  )
}

function kurz(src: string): string {
  return src.length > 100 ? `…${src.slice(-97)}` : src
}

// ------------------------------------------------------------ Einzel-Checks

function pruefeImgLoad(imgs: ImgInfo[], v: BrowserCheckKontext['viewport']): RegelErgebnis[] {
  const defekt = imgs.filter((i) => i.src && i.naturalWidth === 0)
  if (defekt.length === 0) {
    return [{ regelId: 'B-IMG-LOAD', ok: true, gemessen: `${imgs.length} Bilder geladen`, viewport: v }]
  }
  return defekt.map((i) => ({
    regelId: 'B-IMG-LOAD',
    ok: false,
    selector: `img[src="${kurz(i.src)}"]`,
    gemessen: 'naturalWidth = 0 (Bild lädt nicht)',
    erwartet: 'naturalWidth > 0',
    viewport: v,
  }))
}

function pruefeAspect(imgs: ImgInfo[], v: BrowserCheckKontext['viewport']): RegelErgebnis[] {
  const verzerrt = imgs.filter((i) => {
    if (!i.sichtbar || i.naturalWidth === 0 || i.clientHeight === 0 || i.naturalHeight === 0) return false
    const natural = i.naturalWidth / i.naturalHeight
    const dargestellt = i.clientWidth / i.clientHeight
    // object-fit: cover ist legitim — nur GROBE Verzerrung (>25 %) ist ein
    // Layoutfehler; die ±5 %-Slot-Regel prüft der Config-Layer (C-IMG-DUP/Validator).
    return Math.abs(dargestellt - natural) / natural > 0.25 && !istCoverKandidat(i)
  })
  function istCoverKandidat(i: ImgInfo): boolean {
    // Vollflächige Hero-/Hintergrundbilder dürfen croppen
    return i.clientWidth >= 320
  }
  if (verzerrt.length === 0) {
    return [{ regelId: 'B-ASPECT', ok: true, gemessen: 'keine Verzerrung', viewport: v }]
  }
  return verzerrt.map((i) => ({
    regelId: 'B-ASPECT',
    ok: false,
    selector: `img[src="${kurz(i.src)}"]`,
    gemessen: `dargestellt ${i.clientWidth}×${i.clientHeight}, intrinsisch ${i.naturalWidth}×${i.naturalHeight}`,
    erwartet: 'Seitenverhältnis ohne grobe Verzerrung',
    viewport: v,
  }))
}

async function pruefeStub(page: Page, v: BrowserCheckKontext['viewport']): Promise<RegelErgebnis> {
  const text: string = await page.evaluate(() => document.body.innerText)
  const funde: string[] = []
  if (text.includes('{{')) funde.push('unaufgelöstes {{Token}}')
  if (/\blorem\b/i.test(text)) funde.push('„Lorem“-Platzhalter')
  if (/\bTODO\b|\bStub\b/.test(text)) funde.push('TODO/Stub-Text')
  return {
    regelId: 'B-STUB',
    ok: funde.length === 0,
    gemessen: funde.length > 0 ? funde.join(', ') : 'keine Platzhalter',
    erwartet: 'keine {{Token}}/Lorem/Stubs',
    viewport: v,
  }
}

async function pruefeBlockliste(page: Page, kontext: BrowserCheckKontext): Promise<RegelErgebnis> {
  const text: string = await page.evaluate(() => document.body.innerText)
  const fremde = findeFremdeStaedte(text, kontext.stadt)
  return {
    regelId: 'B-BLOCKLISTE',
    ok: fremde.length === 0,
    gemessen: fremde.length > 0 ? `fremde Städte: ${fremde.join(', ')}` : 'nur Kundenstadt',
    erwartet: `nur „${kontext.stadt}“`,
    viewport: kontext.viewport,
  }
}

async function pruefeKontakt(page: Page, v: BrowserCheckKontext['viewport']): Promise<RegelErgebnis> {
  const telLinks: number = await page.evaluate(() => document.querySelectorAll('a[href^="tel:"]').length)
  return {
    regelId: 'B-KONTAKT',
    ok: telLinks > 0,
    selector: 'a[href^="tel:"]',
    gemessen: `${telLinks} tel:-Link(s)`,
    erwartet: '≥ 1 tel:-Link',
    viewport: v,
  }
}

async function pruefeLinks(page: Page, v: BrowserCheckKontext['viewport']): Promise<RegelErgebnis> {
  const tote: number = await page.evaluate(() => document.querySelectorAll('a[href="#"]').length)
  return {
    regelId: 'B-LINKS',
    ok: tote === 0,
    selector: 'a[href="#"]',
    gemessen: `${tote} tote(r) #-Link(s)`,
    erwartet: '0',
    viewport: v,
  }
}

function pruefeConsole(kontext: BrowserCheckKontext): RegelErgebnis {
  const probleme = [...kontext.consoleErrors, ...kontext.failedRequests]
  return {
    regelId: 'B-CONSOLE',
    ok: probleme.length === 0,
    gemessen: probleme.length > 0 ? probleme.slice(0, 3).join(' | ').slice(0, 300) : 'sauber',
    erwartet: 'keine Console-Errors, keine failed Requests',
    viewport: kontext.viewport,
  }
}

async function pruefeCls(page: Page, v: BrowserCheckKontext['viewport']): Promise<RegelErgebnis> {
  // Kleines Settle-Fenster, damit späte Shifts einfließen
  await page.waitForTimeout(600)
  const cls: number = await page.evaluate(() => (window as unknown as { __qaCls?: number }).__qaCls ?? 0)
  return {
    regelId: 'B-CLS',
    ok: cls < 0.05,
    gemessen: cls.toFixed(4),
    erwartet: '< 0.05',
    viewport: v,
  }
}

async function pruefeForm(page: Page, kontext: BrowserCheckKontext): Promise<RegelErgebnis> {
  const hatWizard: boolean = await page.evaluate(() => Boolean(document.getElementById('fsenden')))

  if (!hatWizard) {
    // Hauptseite: Funnel-CTA muss korrekt verlinkt sein
    const pfad = kontext.funnelPfad
    const hrefs: string[] = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href') ?? '')
    )
    const ok = pfad
      ? hrefs.some((h) => h.includes(pfad))
      : hrefs.some((h) => h.length > 1 && h !== '#')
    return {
      regelId: 'B-FORM',
      ok,
      gemessen: ok ? 'Funnel-CTA verlinkt' : `kein Link auf ${pfad ?? 'Funnel'} gefunden`,
      erwartet: pfad ? `Link auf ${pfad}` : 'gültiger CTA-Link',
      viewport: kontext.viewport,
    }
  }

  // Funnel-Seite: Testsubmit — POSTs abfangen, Wizard durchklicken
  let gesendetAn: string | null = null
  await page.route('**/*', async (route) => {
    if (route.request().method() === 'POST') {
      gesendetAn = route.request().url()
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' })
      return
    }
    await route.fallback()
  })

  try {
    for (let schritt = 0; schritt < 10; schritt++) {
      // Aktiven Schritt befüllen
      await page.evaluate(() => {
        const aktiv = document.querySelector('.fschritt.aktiv')
        if (!aktiv) return
        aktiv.querySelectorAll<HTMLInputElement>('input, textarea').forEach((f) => {
          if (f.type === 'radio') {
            const gruppe = aktiv.querySelectorAll<HTMLInputElement>(`input[name="${f.name}"]`)
            if (gruppe.length > 0 && !Array.from(gruppe).some((g) => g.checked)) gruppe[0].checked = true
          } else if (f.type === 'checkbox') {
            f.checked = true
          } else if (f.type === 'email') {
            f.value = 'qa-test@webseiten-verlag.de'
          } else if (!f.value) {
            f.value = f.type === 'tel' ? '0711 000000' : 'QA-Testsubmit'
          }
        })
      })
      const senden = await page.evaluate(() => {
        const s = document.getElementById('fsenden')
        const aktiv = document.querySelector('.fschritt.aktiv')
        return Boolean(s && aktiv && aktiv.contains(s))
      })
      if (senden) {
        await page.click('#fsenden')
        await page.waitForTimeout(800)
        break
      }
      const weiter = await page.$('.fschritt.aktiv [data-weiter]')
      if (!weiter) break
      await weiter.click()
      await page.waitForTimeout(150)
    }
  } catch {
    // Fehler unten über gesendetAn bewertet
  } finally {
    await page.unroute('**/*').catch(() => {})
  }

  return {
    regelId: 'B-FORM',
    ok: gesendetAn !== null,
    gemessen: gesendetAn ? `POST an ${gesendetAn}` : 'kein Submit-Request ausgelöst',
    erwartet: 'Testsubmit erreicht Endpoint',
    viewport: kontext.viewport,
  }
}

async function pruefeNoindex(page: Page, kontext: BrowserCheckKontext): Promise<RegelErgebnis> {
  const robots: string | null = await page.evaluate(
    () => document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null
  )
  const hatNoindex = Boolean(robots && /noindex/i.test(robots))
  const ok = kontext.mode === 'demo' ? hatNoindex : !hatNoindex
  return {
    regelId: 'B-NOINDEX',
    ok,
    selector: 'meta[name="robots"]',
    gemessen: robots ?? 'kein robots-Meta',
    erwartet: kontext.mode === 'demo' ? 'noindex (Demo)' : 'KEIN noindex (Live)',
    viewport: kontext.viewport,
  }
}

async function pruefeRecht(page: Page, v: BrowserCheckKontext['viewport']): Promise<RegelErgebnis> {
  const status: { impressum: string | null; datenschutz: string | null } = await page.evaluate(() => {
    function findeLink(muster: RegExp): string | null {
      const link = Array.from(document.querySelectorAll('a')).find((a) => muster.test(a.textContent ?? ''))
      return link ? link.getAttribute('href') : null
    }
    return { impressum: findeLink(/impressum/i), datenschutz: findeLink(/datenschutz/i) }
  })
  const gueltig = (h: string | null) => Boolean(h && h !== '#' && h.trim().length > 1)
  const ok = gueltig(status.impressum) && gueltig(status.datenschutz)
  return {
    regelId: 'B-RECHT',
    ok,
    gemessen: `Impressum: ${status.impressum ?? 'fehlt'} · Datenschutz: ${status.datenschutz ?? 'fehlt'}`,
    erwartet: 'beide verlinkt (kein #)',
    viewport: v,
  }
}

async function pruefeVideo(page: Page, v: BrowserCheckKontext['viewport']): Promise<RegelErgebnis[]> {
  const videos: { muted: boolean; loop: boolean; playsinline: boolean; poster: string; preload: string }[] =
    await page.evaluate(() =>
      Array.from(document.querySelectorAll('video')).map((vid) => ({
        muted: vid.hasAttribute('muted') || vid.muted,
        loop: vid.hasAttribute('loop') || vid.closest('.scrub') !== null,
        playsinline: vid.hasAttribute('playsinline'),
        poster: vid.getAttribute('poster') ?? '',
        preload: vid.getAttribute('preload') ?? 'auto',
      }))
    )
  if (videos.length === 0) {
    return [
      { regelId: 'B-VIDEO-ATTR', ok: true, gemessen: 'kein Video auf der Seite', viewport: v },
      { regelId: 'B-VIDEO-LAZY', ok: true, gemessen: 'kein Video auf der Seite', viewport: v },
    ]
  }
  const ergebnisse: RegelErgebnis[] = []
  for (const vid of videos) {
    const fehlend: string[] = []
    if (!vid.muted) fehlend.push('muted')
    if (!vid.loop) fehlend.push('loop/scrub')
    if (!vid.playsinline) fehlend.push('playsinline')
    if (!vid.poster) fehlend.push('poster')
    ergebnisse.push({
      regelId: 'B-VIDEO-ATTR',
      ok: fehlend.length === 0,
      selector: 'video',
      gemessen: fehlend.length > 0 ? `fehlend: ${fehlend.join(', ')}` : 'alle Attribute gesetzt',
      erwartet: 'muted + loop/scrub + playsinline + poster',
      viewport: v,
    })
    ergebnisse.push({
      regelId: 'B-VIDEO-LAZY',
      ok: vid.preload === 'metadata' || vid.preload === 'none',
      selector: 'video',
      gemessen: `preload="${vid.preload}"`,
      erwartet: 'preload="metadata" oder "none"',
      viewport: v,
    })
  }
  return ergebnisse
}

/** B-MOTION: auf einer Page mit reducedMotion:'reduce'-Emulation (vor goto!) aufrufen */
export async function pruefeMotion(page: Page): Promise<RegelErgebnis> {
  await page.waitForTimeout(400)
  const laufend: number = await page.evaluate(() => {
    try {
      return document
        .getAnimations()
        .filter((a) => {
          if (a.playState !== 'running') return false
          const timing = a.effect?.getTiming?.()
          return timing ? timing.iterations === Infinity : false
        }).length
    } catch {
      return 0
    }
  })
  return {
    regelId: 'B-MOTION',
    ok: laufend === 0,
    gemessen: `${laufend} Endlos-Animation(en) unter prefers-reduced-motion`,
    erwartet: '0',
  }
}

// ------------------------------------------------------------ Sammel-API

/**
 * Alle B-*-Checks (außer B-MOTION, siehe pruefeMotion) auf einer geladenen Page.
 */
export async function fuehreBrowserChecksAus(
  page: Page,
  kontext: BrowserCheckKontext
): Promise<RegelErgebnis[]> {
  const imgs = await sammleImgInfos(page)
  const ergebnisse: RegelErgebnis[] = [
    ...pruefeImgLoad(imgs, kontext.viewport),
    ...pruefeAspect(imgs, kontext.viewport),
    await pruefeStub(page, kontext.viewport),
    await pruefeBlockliste(page, kontext),
    await pruefeKontakt(page, kontext.viewport),
    await pruefeLinks(page, kontext.viewport),
    await pruefeCls(page, kontext.viewport),
    await pruefeNoindex(page, kontext),
    await pruefeRecht(page, kontext.viewport),
    ...(await pruefeVideo(page, kontext.viewport)),
    await pruefeForm(page, kontext),
    pruefeConsole(kontext),
  ]
  return ergebnisse
}
