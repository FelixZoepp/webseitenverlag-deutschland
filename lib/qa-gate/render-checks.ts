/**
 * QA-Gate Baustein A/B: Render-Layer-Checks (R-*).
 *
 * Reine String-Prüfungen auf dem gerenderten HTML — kein Browser nötig.
 * Ergänzt den Konsistenz-Validator (der R-IMG-DIM, R-ALT usw. abdeckt) um
 * die Regeln, die dort noch nicht durchgesetzt werden:
 *   R-VARIANTEN, R-CDN, R-JS-BUDGET, R-SEO-TITLE, R-JSONLD, R-OG, R-SITEMAP
 * sowie die Config-Video-Regeln C-VIDEO-SIZE / C-VIDEO-FALLBACK.
 */

import type { FlagshipConfig } from '@/lib/flagship/types'
import type { RegelErgebnis } from './regeln'

export interface RenderCheckKontext {
  config: FlagshipConfig
  stadt: string
  /** 'demo' → noindex Pflicht; 'publish' → noindex verboten + canonical Pflicht */
  mode: 'demo' | 'publish'
  /** Bekannte Video-Dateigröße in Bytes (aus asset_bank), falls Video gesetzt */
  videoBytes?: number | null
}

/** Erlaubte Hosts für externe Ressourcen (eigene Infrastruktur) */
const ERLAUBTE_HOSTS = ['.supabase.co', '.supabase.in']

const MAX_JS_BYTES = 32 * 1024
const MAX_VIDEO_BYTES = 3 * 1024 * 1024 // C-VIDEO-SIZE: ≤ 3 MB

function metaContent(html: string, selektor: RegExp): string | null {
  const m = html.match(selektor)
  return m ? m[1] : null
}

function pruefeVarianten(html: string): RegelErgebnis {
  // R-VARIANTEN: Originale heißen original_<...> im Storage — dürfen nie ausgespielt werden
  const funde = html.match(/(?:src|href)\s*=\s*"[^"]*\/original_[^"]*"/gi) ?? []
  return {
    regelId: 'R-VARIANTEN',
    ok: funde.length === 0,
    gemessen: funde.length > 0 ? (funde[0] ?? '').slice(0, 120) : 'keine original_-Pfade',
    erwartet: 'nur verarbeitete Varianten',
  }
}

function pruefeCdn(html: string): RegelErgebnis {
  // R-CDN: externe src/href auf fremden Hosts (Skripte, Styles, Fonts)
  const urls = Array.from(html.matchAll(/(?:src|href)\s*=\s*"(https?:\/\/[^"]+)"/gi)).map((m) => m[1])
  const fremd = urls.filter((u) => {
    try {
      const host = new URL(u).hostname
      return !ERLAUBTE_HOSTS.some((e) => host.endsWith(e))
    } catch {
      return false
    }
  })
  return {
    regelId: 'R-CDN',
    ok: fremd.length === 0,
    gemessen: fremd.length > 0 ? fremd.slice(0, 3).join(', ') : 'keine fremden Hosts',
    erwartet: `nur ${ERLAUBTE_HOSTS.join(', ')}`,
  }
}

function pruefeJsBudget(html: string): RegelErgebnis {
  // R-JS-BUDGET: Summe aller Inline-<script>-Inhalte (ohne JSON-LD)
  let bytes = 0
  for (const m of Array.from(
    html.matchAll(/<script(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/gi)
  )) {
    bytes += Buffer.byteLength(m[1], 'utf8')
  }
  return {
    regelId: 'R-JS-BUDGET',
    ok: bytes <= MAX_JS_BYTES,
    gemessen: `${(bytes / 1024).toFixed(1)} kB`,
    erwartet: `≤ ${MAX_JS_BYTES / 1024} kB Inline-JS`,
  }
}

function pruefeAlt(html: string): RegelErgebnis {
  // R-ALT: jedes <img> braucht einen beschreibenden alt-Text (≥ 4 Zeichen)
  const imgs = Array.from(html.matchAll(/<img\b[^>]*>/gi)).map((m) => m[0])
  const verstoesse: string[] = []
  for (const tag of imgs) {
    const alt = tag.match(/\balt\s*=\s*"([^"]*)"/i)
    if (!alt || alt[1].trim().length < 4) {
      const src = tag.match(/\bsrc\s*=\s*"([^"]*)"/i)?.[1] ?? '(ohne src)'
      verstoesse.push(src.slice(0, 100))
    }
  }
  return {
    regelId: 'R-ALT',
    ok: verstoesse.length === 0,
    gemessen: verstoesse.length > 0 ? `${verstoesse.length} Bild(er) ohne alt: ${verstoesse[0]}` : `${imgs.length} Bilder mit alt`,
    erwartet: 'beschreibender alt-Text (≥ 4 Zeichen) an jedem Bild',
  }
}

function pruefeSeoTitle(html: string, stadt: string): RegelErgebnis {
  const titel = metaContent(html, /<title>([\s\S]*?)<\/title>/i) ?? ''
  const beschreibung =
    metaContent(html, /<meta\s+name="description"\s+content="([^"]*)"/i) ?? ''
  const stadtKlein = stadt.toLowerCase()
  const probleme: string[] = []
  if (!titel.trim()) probleme.push('Title fehlt')
  else if (!titel.toLowerCase().includes(stadtKlein)) probleme.push('Stadt fehlt im Title')
  if (!beschreibung.trim()) probleme.push('Description fehlt')
  else if (!beschreibung.toLowerCase().includes(stadtKlein)) probleme.push('Stadt fehlt in der Description')
  return {
    regelId: 'R-SEO-TITLE',
    ok: probleme.length === 0,
    gemessen: probleme.length > 0 ? probleme.join('; ') : `„${titel.slice(0, 60)}“`,
    erwartet: `Title + Description mit Stadt „${stadt}“`,
  }
}

function pruefeJsonLd(html: string): RegelErgebnis {
  const bloecke = Array.from(
    html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)
  ).map((m) => m[1])
  if (bloecke.length === 0) {
    return { regelId: 'R-JSONLD', ok: false, gemessen: 'kein JSON-LD-Block', erwartet: 'LocalBusiness JSON-LD' }
  }
  for (const block of bloecke) {
    try {
      // Renderer escapet `<` als \u003c — JSON.parse versteht das direkt
      JSON.parse(block)
    } catch (e) {
      return {
        regelId: 'R-JSONLD',
        ok: false,
        gemessen: `nicht parsebar: ${e instanceof Error ? e.message : String(e)}`,
        erwartet: 'valides JSON-LD',
      }
    }
  }
  return { regelId: 'R-JSONLD', ok: true, gemessen: `${bloecke.length} valider Block/Blöcke` }
}

function pruefeOg(html: string): RegelErgebnis {
  const pflicht = ['og:title', 'og:description', 'og:type', 'og:locale']
  const fehlend = pflicht.filter(
    (p) => !new RegExp(`<meta\\s+property="${p}"\\s+content="[^"]+"`, 'i').test(html)
  )
  return {
    regelId: 'R-OG',
    ok: fehlend.length === 0,
    gemessen: fehlend.length > 0 ? `fehlend: ${fehlend.join(', ')}` : 'alle OG-Tags vorhanden',
    erwartet: pflicht.join(', '),
  }
}

function pruefeSitemapCanonical(html: string, mode: 'demo' | 'publish'): RegelErgebnis {
  // R-SITEMAP: Live-Sites brauchen canonical (Sitemap-Route hängt am Hosting).
  if (mode === 'demo') {
    return { regelId: 'R-SITEMAP', ok: true, gemessen: 'Demo — canonical nicht erforderlich' }
  }
  const canonical = /<link\s+rel="canonical"\s+href="https?:\/\/[^"]+"/i.test(html)
  return {
    regelId: 'R-SITEMAP',
    ok: canonical,
    gemessen: canonical ? 'canonical vorhanden' : 'canonical fehlt',
    erwartet: 'canonical-Link auf Live-Site',
  }
}

function pruefeVideoConfig(kontext: RenderCheckKontext): RegelErgebnis[] {
  const video = kontext.config.inhalte.hero.video
  if (!video?.src) {
    return [
      { regelId: 'C-VIDEO-SIZE', ok: true, gemessen: 'kein Video gesetzt' },
      { regelId: 'C-VIDEO-FALLBACK', ok: true, gemessen: 'kein Video gesetzt' },
    ]
  }
  const ergebnisse: RegelErgebnis[] = []
  // C-VIDEO-SIZE: ≤ 3 MB (nur prüfbar, wenn Größe bekannt — sonst Verstoß, weil untranscodiert)
  const bytes = kontext.videoBytes ?? null
  ergebnisse.push({
    regelId: 'C-VIDEO-SIZE',
    ok: bytes !== null && bytes <= MAX_VIDEO_BYTES,
    gemessen: bytes === null ? 'Dateigröße unbekannt (nicht transcodiert?)' : `${(bytes / 1024 / 1024).toFixed(2)} MB`,
    erwartet: '≤ 3 MB, transcodiert',
  })
  // C-VIDEO-FALLBACK: poster oder Hero-Bild als statischer Fallback
  const fallback = Boolean(video.poster || kontext.config.inhalte.hero.media.datei)
  ergebnisse.push({
    regelId: 'C-VIDEO-FALLBACK',
    ok: fallback,
    gemessen: fallback ? 'Fallback-Bild vorhanden' : 'weder poster noch Hero-Bild',
    erwartet: 'statisches Fallback-Bild',
  })
  return ergebnisse
}

/** Alle Render-Layer-Checks auf dem fertig gerenderten HTML */
export function pruefeRenderRegeln(html: string, kontext: RenderCheckKontext): RegelErgebnis[] {
  return [
    pruefeVarianten(html),
    pruefeCdn(html),
    pruefeJsBudget(html),
    pruefeAlt(html),
    pruefeSeoTitle(html, kontext.stadt),
    pruefeJsonLd(html),
    pruefeOg(html),
    pruefeSitemapCanonical(html, kontext.mode),
    ...pruefeVideoConfig(kontext),
  ]
}
