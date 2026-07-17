/**
 * Flagship-Engine: Seiten-Renderer.
 * Setzt Head (SEO, JSON-LD), Tokens-CSS, Sektionen und JS zu einem
 * vollständigen HTML-Dokument zusammen (self-contained, keine Fremd-CDNs).
 */

import type { FlagshipConfig, FlagshipRenderOptionen } from './types'
import { esc, escAttr, ICON_PATHS } from './html'
import { flagshipCss } from './css'
import { flagshipJs } from './js'
import {
  renderAblauf, renderConversion, renderEmpathie, renderErgebnisse, renderFakten,
  renderFaq, renderFooter, renderHero, renderLeistungen, renderLokal, renderMarken,
  renderNav, renderNachweise, renderProzess, renderReferenzen, renderRibbon,
  renderSignature, renderStimmen, renderZahlen,
} from './sections'

export function funnelPfad(config: FlagshipConfig, basisPfad = ''): string {
  return `${basisPfad}/${config.funnel.modus === 'reservierung' ? 'reservierung' : 'anfrage'}`
}

function jsonLd(config: FlagshipConfig): string {
  const m = config.meta
  const istGastro = config.funnel.modus === 'reservierung'
  const daten: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': istGastro ? 'Restaurant' : 'LocalBusiness',
    name: m.firma,
    description: m.seo_beschreibung || '',
    address: { '@type': 'PostalAddress', addressLocality: m.ort, addressCountry: 'DE' },
  }
  if (m.telefon) daten.telephone = m.telefon
  if (m.gegruendet) daten.foundingDate = m.gegruendet
  // '<' escapen, damit '</script>' in Inhalten nicht aus dem JSON-LD-Block ausbricht
  return JSON.stringify(daten).replace(/</g, '\\u003c')
}

export function renderFlagshipPage(config: FlagshipConfig, opts: FlagshipRenderOptionen = {}): string {
  const { design, inhalte, meta } = config
  const hell = design.typo_modus === 'sans_bold_hell'
  const basisPfad = opts.basisPfad || ''
  const funnelUrl = funnelPfad(config, basisPfad)
  const funnelLabel = config.funnel.modus === 'reservierung' ? 'Tisch reservieren' : 'Anfrage starten'

  const titel = meta.seo_titel || `${meta.firma} – ${meta.ort}`
  const beschreibung = meta.seo_beschreibung || ''
  const noindex = opts.noindex !== false ? '<meta name="robots" content="noindex">' : ''

  const hatBaSlider = inhalte.ergebnisse.variante === 'ba_slider'

  const body = [
    renderNav(inhalte.nav, hell, funnelUrl),
    renderHero(inhalte.hero, hell, funnelUrl),
    renderFakten(inhalte.fakten),
    inhalte.marken ? renderMarken(inhalte.marken) : '',
    inhalte.nachweise ? renderNachweise(inhalte.nachweise) : '',
    renderEmpathie(inhalte.empathie),
    renderSignature(inhalte.signature),
    renderLeistungen(inhalte.leistungen),
    inhalte.prozess ? renderProzess(inhalte.prozess) : '',
    inhalte.ablauf ? renderAblauf(inhalte.ablauf) : '',
    renderErgebnisse(inhalte.ergebnisse),
    inhalte.referenzen ? renderReferenzen(inhalte.referenzen) : '',
    renderZahlen(inhalte.zahlen),
    renderStimmen(inhalte.stimmen),
    renderLokal(inhalte.lokal),
    renderFaq(inhalte.faq),
    renderConversion(inhalte.conversion, hell, funnelUrl, funnelLabel),
    renderFooter(inhalte.footer, inhalte.nav, hell, meta.firma),
    opts.demo ? renderRibbon() : '',
  ].filter(Boolean).join('\n\n')

  const js = flagshipJs({
    ablauf: inhalte.ablauf,
    hatBaSlider,
    iconPfade: ICON_PATHS,
  })

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
${flagshipCss(design, { premiumAnimationen: config.premium_animationen })}
</style>
</head>
<body>

${body}

<script>
${js}
</script>
</body>
</html>`
}
