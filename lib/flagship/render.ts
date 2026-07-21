/**
 * Flagship-Engine: Seiten-Renderer.
 * Setzt Head (SEO, JSON-LD), Tokens-CSS, Sektionen und JS zu einem
 * vollständigen HTML-Dokument zusammen (self-contained, keine Fremd-CDNs).
 *
 * Multipage-Modus (Business/Growth): Startseite zeigt reduziertes Set,
 * renderUnterseite() liefert die 4 Unterseiten (leistungen, ergebnisse, ueber-uns, kontakt).
 */

// Registrierungs-Gate (§3.1): invalide Slot-Deklarationen lassen den Renderer nicht laden
import './asset-slots'
import type { FlagshipConfig, FlagshipRenderOptionen, NavInhalt, UnterseitenSlug } from './types'
import { UNTERSEITEN } from './types'
import { istGalabauKomposition, type GalabauConfig } from './galabau/types'
import { renderGalabauLanding } from './galabau/render'
import { istMalerKomposition, type MalerConfig } from './maler/types'
import { renderMalerLanding } from './maler/render'
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

/** HTML-Dokument-Shell: gemeinsam für Startseite und Unterseiten */
function htmlShell(
  config: FlagshipConfig,
  titel: string,
  body: string,
  opts: FlagshipRenderOptionen = {},
): string {
  const { design } = config
  const beschreibung = config.meta.seo_beschreibung || ''
  const noindex = opts.noindex !== false ? '<meta name="robots" content="noindex">' : ''
  const hatBaSlider = config.inhalte.ergebnisse.variante === 'ba_slider'

  const js = flagshipJs({
    ablauf: config.inhalte.ablauf,
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

/** Nav-Links für den Multipage-Modus: echte Seiten statt Anker */
function multipageNavLinks(basisPfad: string): NavInhalt['links'] {
  return UNTERSEITEN.map((u) => ({ label: u.label, anker: `${basisPfad}/${u.slug}` }))
}

export function renderFlagshipPage(config: FlagshipConfig | GalabauConfig | MalerConfig, opts: FlagshipRenderOptionen = {}): string {
  // Kompositions-Dispatch: feste Kompositions-Renderer statt Sektions-Baukasten
  if (istMalerKomposition(config)) return renderMalerLanding(config, opts)
  if (istGalabauKomposition(config)) return renderGalabauLanding(config, opts)
  const { design, meta } = config
  // Produktstufen-Ansicht (Baustein C §C.3): Business-Level = kein Video-Hero.
  // undefined = alles rendern (Live-Seiten), 'growth' = Video-Look.
  const inhalte =
    opts.level === 'business' && config.inhalte.hero.video
      ? { ...config.inhalte, hero: { ...config.inhalte.hero, video: undefined } }
      : config.inhalte
  const hell = design.typo_modus === 'sans_bold_hell'
  const basisPfad = opts.basisPfad || ''
  const funnelUrl = funnelPfad(config, basisPfad)
  const funnelLabel = config.funnel.modus === 'reservierung' ? 'Tisch reservieren' : 'Anfrage starten'
  const titel = meta.seo_titel || `${meta.firma} – ${meta.ort}`
  const multipage = config.seiten_modus === 'multipage'

  // Im Multipage-Modus: Nav-Links auf Unterseiten statt Anker
  const navInhalt: NavInhalt = multipage
    ? { ...inhalte.nav, links: multipageNavLinks(basisPfad) }
    : inhalte.nav

  let body: string
  if (multipage) {
    // Multipage-Startseite: reduziertes Sektions-Set
    body = [
      renderNav(navInhalt, hell, funnelUrl),
      renderHero(inhalte.hero, hell, funnelUrl),
      renderFakten(inhalte.fakten),
      renderSignature(inhalte.signature),
      renderZahlen(inhalte.zahlen),
      renderConversion(inhalte.conversion, hell, funnelUrl, funnelLabel),
      renderFooter(inhalte.footer, navInhalt, hell, meta.firma),
      opts.demo ? renderRibbon() : '',
    ].filter(Boolean).join('\n\n')
  } else {
    // Onepager: alle Sektionen
    body = [
      renderNav(navInhalt, hell, funnelUrl),
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
      renderFooter(inhalte.footer, navInhalt, hell, meta.firma),
      opts.demo ? renderRibbon() : '',
    ].filter(Boolean).join('\n\n')
  }

  return htmlShell(config, titel, body, opts)
}

/** Sektions-Zuordnung je Unterseite */
const SEITEN_SEKTIONEN: Record<UnterseitenSlug, (config: FlagshipConfig, hell: boolean) => string[]> = {
  leistungen: (config) => {
    const { inhalte } = config
    return [
      renderLeistungen(inhalte.leistungen),
      inhalte.ablauf ? renderAblauf(inhalte.ablauf) : '',
      inhalte.prozess ? renderProzess(inhalte.prozess) : '',
      inhalte.nachweise ? renderNachweise(inhalte.nachweise) : '',
    ]
  },
  ergebnisse: (config) => {
    const { inhalte } = config
    return [
      renderErgebnisse(inhalte.ergebnisse),
      inhalte.referenzen ? renderReferenzen(inhalte.referenzen) : '',
      renderStimmen(inhalte.stimmen),
    ]
  },
  'ueber-uns': (config) => {
    const { inhalte } = config
    return [
      renderEmpathie(inhalte.empathie),
      inhalte.marken ? renderMarken(inhalte.marken) : '',
      renderZahlen(inhalte.zahlen),
      renderLokal(inhalte.lokal),
    ]
  },
  kontakt: (config, hell) => {
    const { inhalte } = config
    const funnelUrl = funnelPfad(config, '')
    const funnelLabel = config.funnel.modus === 'reservierung' ? 'Tisch reservieren' : 'Anfrage starten'
    return [
      renderLokal(inhalte.lokal),
      renderFaq(inhalte.faq),
      renderConversion(inhalte.conversion, hell, funnelUrl, funnelLabel),
    ]
  },
}

/** Unterseite im Multipage-Modus rendern (leistungen, ergebnisse, ueber-uns, kontakt) */
export function renderUnterseite(
  config: FlagshipConfig,
  seite: UnterseitenSlug,
  opts: FlagshipRenderOptionen = {},
): string {
  const { design, inhalte, meta } = config
  const hell = design.typo_modus === 'sans_bold_hell'
  const basisPfad = opts.basisPfad || ''
  const funnelUrl = funnelPfad(config, basisPfad)

  const navInhalt: NavInhalt = { ...inhalte.nav, links: multipageNavLinks(basisPfad) }

  const seitenLabel = UNTERSEITEN.find((u) => u.slug === seite)?.label || seite
  const titel = `${seitenLabel} – ${meta.firma}`

  const sektionen = SEITEN_SEKTIONEN[seite](config, hell)

  const body = [
    renderNav(navInhalt, hell, funnelUrl),
    ...sektionen,
    renderFooter(inhalte.footer, navInhalt, hell, meta.firma),
    opts.demo ? renderRibbon() : '',
  ].filter(Boolean).join('\n\n')

  return htmlShell(config, titel, body, opts)
}
