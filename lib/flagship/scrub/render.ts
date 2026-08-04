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
import { SCRUB_UNTERSEITEN, type ScrubConfig, type ScrubUnterseitenSlug } from './types'
import {
  renderScrubFooter, renderScrubHeader, renderScrubKontakt, renderScrubRibbon,
  renderScrubStatisch, renderScrubWrap,
} from './sections'
import { renderScrubKarriere, renderScrubErfahrungen, renderScrubLeistungen, renderScrubKontaktSeite, renderScrubZiele, renderScrubAngebote } from './unterseiten'
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

function scrubNavLinks(basisPfad: string): { label: string; href: string }[] {
  return SCRUB_UNTERSEITEN.map(u => ({ label: u.label, href: `${basisPfad}/${u.slug}` }))
}

/** Anchor-Links für die Startseite (scrollt zu den Sektionen statt Seitenwechsel) */
function scrubAnchorLinks(): { label: string; href: string }[] {
  return SCRUB_UNTERSEITEN.filter(u => u.slug !== 'kontakt').map(u => ({ label: u.label, href: `#${u.slug}` }))
}

export function renderScrubStory(config: ScrubConfig, opts: FlagshipRenderOptionen = {}): string {
  const { meta, inhalte } = config
  const titel = meta.seo_titel || `${meta.firma} – ${meta.ort}`
  const beschreibung = meta.seo_beschreibung || ''
  const noindex = opts.noindex !== false ? '<meta name="robots" content="noindex">' : ''

  const navLinks = config.unterseiten ? scrubNavLinks(opts.basisPfad || '') : undefined

  // Flagship-Sektionen nach dem Scrub-Hero (aus branchen_profile Vorlage)
  const fsCfg = (config as unknown as Record<string, unknown>).flagship_sektionen as FlagshipConfig | undefined
  let flagshipBody = ''
  let flagshipStyles = ''
  if (fsCfg?.inhalte) {
    const inh = fsCfg.inhalte as unknown as Record<string, unknown>
    const hell = fsCfg.design?.typo_modus === 'sans_bold_hell'
    const funnelUrl = '#kontakt'
    const funnelLabel = inhalte.header.cta_label || 'Anfrage senden'
    flagshipBody = [
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
    flagshipStyles = flagshipCss(fsCfg.design as Parameters<typeof flagshipCss>[0])
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
${scrubCss(config.design)}
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

export function renderScrubUnterseite(
  config: ScrubConfig,
  seite: ScrubUnterseitenSlug,
  opts: FlagshipRenderOptionen = {},
): string {
  const { meta, inhalte, design } = config
  const basisPfad = opts.basisPfad || ''
  const navLinks = scrubNavLinks(basisPfad)
  const seitenLabel = SCRUB_UNTERSEITEN.find(u => u.slug === seite)?.label || seite
  const titel = `${seitenLabel} — ${meta.firma}`

  let sektionen = ''
  switch (seite) {
    case 'karriere':
      sektionen = config.unterseiten?.karriere
        ? renderScrubKarriere(config.unterseiten.karriere, opts.submitZiel)
        : ''
      break
    case 'erfahrungen':
      sektionen = config.unterseiten?.erfahrungen
        ? renderScrubErfahrungen(config.unterseiten.erfahrungen)
        : ''
      break
    case 'leistungen':
      sektionen = config.unterseiten?.leistungen
        ? renderScrubLeistungen(config.unterseiten.leistungen)
        : ''
      break
    case 'ziele':
      sektionen = config.unterseiten?.ziele
        ? renderScrubZiele(config.unterseiten.ziele)
        : ''
      break
    case 'angebote':
      sektionen = config.unterseiten?.angebote
        ? renderScrubAngebote(config.unterseiten.angebote)
        : ''
      break
    case 'kontakt':
      sektionen = renderScrubKontaktSeite(inhalte.kontakt, opts.submitZiel)
      break
  }

  if (!sektionen) return ''

  const noindex = opts.noindex !== false ? '<meta name="robots" content="noindex">' : ''
  const body = [
    renderScrubHeader(inhalte.header, navLinks),
    sektionen,
    renderScrubFooter(inhalte.footer, inhalte.header, meta),
    opts.demo ? renderScrubRibbon() : '',
  ].filter(Boolean).join('\n\n')

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(titel)}</title>
<meta name="description" content="${escAttr(meta.seo_beschreibung || '')}">
${noindex}
<style>
${scrubCss(design)}
</style>
</head>
<body>
${body}
</body>
</html>`
}
