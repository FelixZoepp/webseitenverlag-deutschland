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
import { scrubLightCss } from './css'
import { scrubJs } from './js'
import { scrubAlleNavLinks, type ScrubConfig } from './types'
import {
  renderScrubFooter, renderScrubHeader, renderScrubKontakt, renderScrubRibbon,
  renderScrubStatisch, renderScrubWrap,
} from './sections'
import { renderScrubKarriere, renderScrubErfahrungen, renderScrubLeistungen, renderScrubKontaktSeite, renderScrubZiele, renderScrubAngebote, renderScrubZielgruppe, renderScrubLeistungDetail } from './unterseiten'
import { renderFakten, renderEmpathie, renderSignature, renderLeistungen, renderAblauf, renderErgebnisse, renderZahlen, renderStimmen, renderLokal, renderFaq, renderConversion } from '../sections'
import { flagshipCss } from '../css'
import type { FlagshipConfig } from '../types'

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

  const navLinks = config.unterseiten ? scrubAlleNavLinks(config, opts.basisPfad || '') : undefined

  // Flagship-Sektionen nach dem Scrub-Hero (aus branchen_profile Vorlage)
  const fsCfg = (config as unknown as Record<string, unknown>).flagship_sektionen as FlagshipConfig | undefined
  let flagshipBody = ''
  let flagshipStyles = ''
  if (fsCfg?.inhalte) {
    const inh = fsCfg.inhalte as unknown as Record<string, unknown>
    const hell = fsCfg.design?.typo_modus === 'sans_bold_hell'
    const funnelUrl = '#kontakt'
    const funnelLabel = inhalte.header.cta_label || 'Anfrage senden'
    const sektionen = [
      inh.fakten ? renderFakten(inh.fakten as Parameters<typeof renderFakten>[0]) : '',
      inh.empathie ? renderEmpathie(inh.empathie as Parameters<typeof renderEmpathie>[0]) : '',
      inh.signature ? renderSignature(inh.signature as Parameters<typeof renderSignature>[0]) : '',
      inh.leistungen ? renderLeistungen(inh.leistungen as Parameters<typeof renderLeistungen>[0]) : '',
      inh.ablauf ? renderAblauf(inh.ablauf as Parameters<typeof renderAblauf>[0]) : '',
      inh.ergebnisse ? renderErgebnisse(inh.ergebnisse as Parameters<typeof renderErgebnisse>[0]) : '',
      inh.zahlen ? renderZahlen(inh.zahlen as Parameters<typeof renderZahlen>[0]) : '',
      inh.stimmen ? renderStimmen(inh.stimmen as Parameters<typeof renderStimmen>[0]) : '',
      inh.lokal ? renderLokal(inh.lokal as Parameters<typeof renderLokal>[0]) : '',
      inh.faq ? renderFaq(inh.faq as Parameters<typeof renderFaq>[0]) : '',
      inh.conversion ? renderConversion(inh.conversion as Parameters<typeof renderConversion>[0], hell, funnelUrl, funnelLabel) : '',
    ].filter(Boolean).join('\n\n')
    // Scope: Flagship-Sektionen in Container, globale CSS-Regeln umschreiben
    flagshipBody = `<div class="fs-scope">${sektionen}</div>`
    const rawCss = flagshipCss(fsCfg.design as Parameters<typeof flagshipCss>[0])
    // Globale Selektoren auf .fs-scope umleiten, damit Scrub-Header unangetastet bleibt
    flagshipStyles = rawCss
      .replace(/^body\s*\{/gm, '.fs-scope {')
      .replace(/^html\s*\{/gm, '.fs-scope {')
      .replace(/^\*\s*\{/gm, '.fs-scope * {')
      .replace(/^a\s*\{/gm, '.fs-scope a {')
      .replace(/^img\s*\{/gm, '.fs-scope img {')
      .replace(/^section\[id\]/gm, '.fs-scope section[id]')
      .replace(/^section\s*\{/gm, '.fs-scope section {')
  }

  const body = [
    renderScrubHeader(inhalte.header, navLinks),
    inhalte.frames ? renderScrubWrap(inhalte) : renderScrubStatisch(inhalte),
    flagshipBody,
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
${scrubLightCss(config.design)}
${flagshipStyles}
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

/**
 * Rendert eine Scrub-Unterseite — feste Slugs (karriere, leistungen, …) UND
 * dynamische Slugs (zielgruppen, leistung_details aus der Config).
 */
export function renderScrubUnterseite(
  config: ScrubConfig,
  seite: string,
  opts: FlagshipRenderOptionen = {},
): string {
  const { meta, inhalte, design } = config
  const basisPfad = opts.basisPfad || ''
  const navLinks = scrubAlleNavLinks(config, basisPfad)

  let sektionen = ''
  let seitenTitel = ''
  let seitenBeschreibung = meta.seo_beschreibung || ''

  // 1. Feste Unterseiten
  switch (seite) {
    case 'karriere':
      sektionen = config.unterseiten?.karriere
        ? renderScrubKarriere(config.unterseiten.karriere, opts.submitZiel)
        : ''
      seitenTitel = `Karriere — ${meta.firma}`
      break
    case 'erfahrungen':
      sektionen = config.unterseiten?.erfahrungen
        ? renderScrubErfahrungen(config.unterseiten.erfahrungen)
        : ''
      seitenTitel = `Erfahrungen — ${meta.firma}`
      break
    case 'leistungen':
      sektionen = config.unterseiten?.leistungen
        ? renderScrubLeistungen(config.unterseiten.leistungen)
        : ''
      seitenTitel = `Leistungen — ${meta.firma}`
      break
    case 'ziele':
      sektionen = config.unterseiten?.ziele
        ? renderScrubZiele(config.unterseiten.ziele)
        : ''
      seitenTitel = `Ziele — ${meta.firma}`
      break
    case 'angebote':
      sektionen = config.unterseiten?.angebote
        ? renderScrubAngebote(config.unterseiten.angebote)
        : ''
      seitenTitel = `Angebote — ${meta.firma}`
      break
    case 'kontakt':
      sektionen = renderScrubKontaktSeite(inhalte.kontakt, opts.submitZiel)
      seitenTitel = `Kontakt — ${meta.firma}`
      break
  }

  // 2. Dynamische Zielgruppen-Seiten
  if (!sektionen && config.unterseiten?.zielgruppen?.[seite]) {
    const zg = config.unterseiten.zielgruppen[seite]
    sektionen = renderScrubZielgruppe(zg)
    seitenTitel = zg.seo_titel || `${zg.nav_label} — ${meta.firma}`
    seitenBeschreibung = zg.seo_beschreibung || seitenBeschreibung
  }

  // 3. Dynamische Leistungs-Detail-Seiten
  if (!sektionen && config.unterseiten?.leistung_details?.[seite]) {
    const ld = config.unterseiten.leistung_details[seite]
    sektionen = renderScrubLeistungDetail(ld)
    seitenTitel = ld.seo_titel || `${ld.nav_label} — ${meta.firma}`
    seitenBeschreibung = ld.seo_beschreibung || seitenBeschreibung
  }

  if (!sektionen) return ''

  const titel = seitenTitel || `${seite} — ${meta.firma}`
  const noindex = opts.noindex !== false ? '<meta name="robots" content="noindex">' : ''

  // Light-Footer für Unterseiten
  const lightFooter = `<footer class="ss-footer">
  <div class="ss-footer-inner">
    <div class="ss-footer-col" style="max-width:320px">
      <div style="font-size:18px;font-weight:800;letter-spacing:-0.02em">${esc(inhalte.header.logo_text)}</div>
      <p style="margin:4px 0 0;line-height:1.5;color:rgba(255,255,255,.65)">${esc(inhalte.footer.beschreibung)}</p>
    </div>
    <div class="ss-footer-col">
      ${navLinks.slice(0, 5).map(l => `<a href="${escAttr(l.href)}">${esc(l.label)}</a>`).join('\n      ')}
    </div>
    <div class="ss-footer-col">
      ${meta.email ? `<a href="mailto:${escAttr(meta.email)}">${esc(meta.email)}</a>` : ''}
      ${meta.telefon ? `<a href="tel:${escAttr(meta.telefon)}">${esc(meta.telefon)}</a>` : ''}
      <a href="/impressum">Impressum</a>
      <a href="/datenschutz">Datenschutz</a>
    </div>
  </div>
  <div class="ss-footer-copy">&copy; ${new Date().getFullYear()} ${esc(meta.firma)}</div>
</footer>`

  const body = [
    renderScrubHeader(inhalte.header, navLinks),
    sektionen,
    lightFooter,
    opts.demo ? renderScrubRibbon() : '',
  ].filter(Boolean).join('\n\n')

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(titel)}</title>
<meta name="description" content="${escAttr(seitenBeschreibung)}">
${noindex}
<style>
${scrubLightCss(design)}
</style>
</head>
<body>
${body}
</body>
</html>`
}
