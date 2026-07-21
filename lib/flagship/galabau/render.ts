/**
 * Auftrag T1 — Renderer der Komposition „galabau-landing-v1".
 *
 * Eigenständige HTML-Shell (self-contained: Inline-CSS/JS, self-hosted Fonts,
 * keine Fremd-CDNs). Sektions-Reihenfolge wie das Flagship:
 * Header → Hero → Über → Leistungen → Warum → Referenzen → Team → CTA-Band →
 * FAQ → Kontakt → Footer (+ Demo-Ribbon).
 *
 * Produktstufen: level 'business' entfernt den Video-Hero (Bild-Fallback),
 * 'growth'/undefined rendert Video sofern gesetzt. noindex ist per Default AN
 * (Demos) und wird nur mit noindex:false abgeschaltet (Live-Seiten).
 */

// Registrierungs-Gate: invalide Slot-Deklarationen lassen den Renderer nicht laden
import './asset-slots'
import type { FlagshipRenderOptionen } from '../types'
import { esc, escAttr } from '../html'
import { galabauCss } from './css'
import { galabauJs } from './js'
import type { GalabauConfig } from './types'
import {
  renderGalabauCtaBand, renderGalabauFaq, renderGalabauFooter, renderGalabauHeader,
  renderGalabauHero, renderGalabauKontakt, renderGalabauLeistungen, renderGalabauReferenzen,
  renderGalabauRibbon, renderGalabauTeam, renderGalabauUeber, renderGalabauWarum,
} from './sections'

function jsonLd(config: GalabauConfig): string {
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

export function renderGalabauLanding(config: GalabauConfig, opts: FlagshipRenderOptionen = {}): string {
  const { meta } = config
  // Business-Level: kein Video-Hero — Bild-Fallback (hero_bg) greift automatisch
  const inhalte =
    opts.level === 'business' && config.inhalte.hero.video
      ? { ...config.inhalte, hero: { ...config.inhalte.hero, video: undefined } }
      : config.inhalte

  const titel = meta.seo_titel || `${meta.firma} – ${meta.ort}`
  const beschreibung = meta.seo_beschreibung || ''
  const noindex = opts.noindex !== false ? '<meta name="robots" content="noindex">' : ''

  const body = [
    renderGalabauHeader(inhalte.header),
    renderGalabauHero(inhalte.hero),
    renderGalabauUeber(inhalte.ueber),
    renderGalabauLeistungen(inhalte.leistungen),
    renderGalabauWarum(inhalte.warum),
    renderGalabauReferenzen(inhalte.referenzen),
    renderGalabauTeam(inhalte.team),
    renderGalabauCtaBand(inhalte.cta_band),
    renderGalabauFaq(inhalte.faq),
    renderGalabauKontakt(inhalte.kontakt, opts.submitZiel),
    renderGalabauFooter(inhalte.footer, inhalte.header, meta),
    opts.demo ? renderGalabauRibbon() : '',
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
${galabauCss()}
</style>
</head>
<body>

${body}

<script>
${galabauJs({ submitZiel: opts.submitZiel })}
</script>
</body>
</html>`
}
