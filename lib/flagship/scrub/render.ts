/**
 * Premium-Komposition „scrub-story-v1" — Renderer.
 *
 * Eigenständige HTML-Shell wie galabau/maler (self-contained, Inline-CSS/JS,
 * keine Fremd-CDNs). Aufbau Landing:
 * Header → Scrub-Story (Sticky-Canvas ODER statische Poster-Szenen) →
 * Kontakt → Footer (+ Demo-Ribbon).
 *
 * Modus mechanisch aus der Config (kein Stufen-Feld):
 *   inhalte.frames vorhanden → Scrub-Modus (Canvas + Frame-Sequenz)
 *   inhalte.frames fehlt     → statischer Poster-Modus
 * prefers-reduced-motion und no-JS zeigen immer die Poster-Ansicht.
 */

// Registrierungs-Gate: invalide Slot-Deklarationen lassen den Renderer nicht laden
import './asset-slots'
import type { FlagshipRenderOptionen } from '../types'
import { esc, escAttr } from '../html'
import { scrubCss } from './css'
import { scrubJs } from './js'
import type { ScrubConfig } from './types'
import {
  renderScrubFooter, renderScrubHeader, renderScrubKontakt, renderScrubRibbon,
  renderScrubStatisch, renderScrubWrap,
} from './sections'

function jsonLd(config: ScrubConfig): string {
  const m = config.meta
  const daten: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: m.firma,
    description: m.seo_beschreibung || '',
    address: { '@type': 'PostalAddress', addressLocality: m.ort, addressCountry: 'DE' },
  }
  if (m.telefon) daten.telephone = m.telefon
  if (m.gegruendet) daten.foundingDate = m.gegruendet
  // '<' escapen, damit '</script>' in Inhalten nicht aus dem JSON-LD-Block ausbricht
  return JSON.stringify(daten).replace(/</g, '\\u003c')
}

export function renderScrubStory(config: ScrubConfig, opts: FlagshipRenderOptionen = {}): string {
  const { meta, inhalte } = config
  const titel = meta.seo_titel || `${meta.firma} – ${meta.ort}`
  const beschreibung = meta.seo_beschreibung || ''
  const noindex = opts.noindex !== false ? '<meta name="robots" content="noindex">' : ''

  const body = [
    renderScrubHeader(inhalte.header),
    inhalte.frames ? renderScrubWrap(inhalte) : renderScrubStatisch(inhalte),
    renderScrubKontakt(inhalte.kontakt, opts.submitZiel),
    renderScrubFooter(inhalte.footer, inhalte.header, meta),
    opts.demo ? renderScrubRibbon() : '',
  ].filter(Boolean).join('\n\n')

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(titel)}</title>
<meta name="description" content="${escAttr(beschreibung)}">
${noindex}
<meta property="og:title" content="${escAttr(titel)}">
<meta property="og:description" content="${escAttr(beschreibung)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="de_DE">
<script type="application/ld+json">${jsonLd(config)}</script>
<style>
${scrubCss(config.design)}
</style>
</head>
<body>

${body}

<script>
${scrubJs({
    frames: inhalte.frames ?? null,
    gewichte: inhalte.szenen.map((s) => s.scroll),
    submitZiel: opts.submitZiel,
  })}
</script>
</body>
</html>`
}
