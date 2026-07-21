/**
 * Template-Fabrik B2 — Renderer der Komposition „maler-landing-v1".
 *
 * Eigenständige HTML-Shell wie galabau (self-contained, Inline-CSS/JS,
 * keine Fremd-CDNs). Sektions-Reihenfolge Landing:
 * Header → Hero → Signature-Wand → Über → Leistungen → Warum → Referenzen →
 * Galerie (ab video) → Team → CTA-Band → Einzugsgebiet (growth) →
 * Reviews (growth, nur echte) → FAQ → Kontakt → Footer
 * (+ WhatsApp-Bubble growth, + Demo-Ribbon).
 *
 * Render-Stufen (Zuordnung Tier → Stufe NUR in config/plans.ts):
 *   statisch — Onepager ohne Video, ohne Galerie/Module, Wand steht fertig
 *   video    — +Video-Hero +Galerie +Wand-Scroll-Animation (Demos: Default)
 *   growth   — +Module +Unterseiten (/leistungen/{slug}, /ueber-uns, /referenzen)
 * Legacy-Mapping: opts.level 'growth' → growth, sonst video.
 */

// Registrierungs-Gate: invalide Slot-Deklarationen lassen den Renderer nicht laden
import './asset-slots'
import type { FlagshipRenderOptionen } from '../types'
import { esc, escAttr, mediaSlot } from '../html'
import { malerCss } from './css'
import { malerJs, type MalerWandModus } from './js'
import type { MalerConfig, MalerInhalte, MalerStufe } from './types'
import {
  renderGalabauCtaBand, renderGalabauFaq, renderGalabauFooter, renderGalabauHeader,
  renderGalabauHero, renderGalabauLeistungen, renderGalabauReferenzen,
  renderGalabauRibbon, renderGalabauTeam, renderGalabauUeber, renderGalabauWarum,
  renderMalerGalerie, renderMalerGebiet, renderMalerKontakt, renderMalerLeistungKopf,
  renderMalerReviews, renderMalerWand, renderMalerWhatsapp,
} from './sections'

export type MalerRenderOptionen = FlagshipRenderOptionen & { stufe?: MalerStufe }

/** Stufe auflösen: explizit > legacy level ('growth' → growth, sonst video) */
function stufeAufloesen(opts: MalerRenderOptionen): MalerStufe {
  return opts.stufe ?? (opts.level === 'growth' ? 'growth' : 'video')
}

/** Leistungs-Name → URL-Slug (mechanisch: Kleinschreibung, Umlaute, Bindestriche) */
export function malerLeistungSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function jsonLd(config: MalerConfig): string {
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

function shell(
  config: MalerConfig,
  titel: string,
  beschreibung: string,
  body: string,
  opts: MalerRenderOptionen,
  wandModus: MalerWandModus,
): string {
  const noindex = opts.noindex !== false ? '<meta name="robots" content="noindex">' : ''
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
${malerCss()}
</style>
</head>
<body>

${body}

<script>
${malerJs({ submitZiel: opts.submitZiel, wandModus })}
</script>
</body>
</html>`
}

/** Wand-Modus je Stufe: statisch = fertig; growth + signature_story:'on' = Scrub */
function wandModusAufloesen(config: MalerConfig, stufe: MalerStufe): MalerWandModus {
  if (stufe === 'statisch') return 'fertig'
  if (stufe === 'growth' && config.signature_story === 'on') return 'scrub'
  return 'einmal'
}

/** Inhalte auf die Stufe zuschneiden (statisch: kein Video, keine Galerie/Module) */
function inhalteFuerStufe(inhalte: MalerInhalte, stufe: MalerStufe): MalerInhalte {
  if (stufe === 'statisch') {
    return {
      ...inhalte,
      hero: { ...inhalte.hero, video: undefined },
      galerie: undefined,
      module: undefined,
    }
  }
  return inhalte
}

export function renderMalerLanding(config: MalerConfig, opts: MalerRenderOptionen = {}): string {
  const { meta } = config
  const stufe = stufeAufloesen(opts)
  const inhalte = inhalteFuerStufe(config.inhalte, stufe)
  const growth = stufe === 'growth'
  const growthModule = growth ? inhalte.module : undefined

  const titel = meta.seo_titel || `${meta.firma} – ${meta.ort}`
  const beschreibung = meta.seo_beschreibung || ''

  const body = [
    renderGalabauHeader(inhalte.header),
    renderGalabauHero(inhalte.hero),
    renderMalerWand(inhalte.wand),
    renderGalabauUeber(inhalte.ueber),
    renderGalabauLeistungen(inhalte.leistungen),
    renderGalabauWarum(inhalte.warum),
    renderGalabauReferenzen(inhalte.referenzen),
    stufe !== 'statisch' && inhalte.galerie ? renderMalerGalerie(inhalte.galerie) : '',
    renderGalabauTeam(inhalte.team),
    renderGalabauCtaBand(inhalte.cta_band),
    growthModule?.einzugsgebiet ? renderMalerGebiet(growthModule.einzugsgebiet) : '',
    growthModule?.reviews?.length ? renderMalerReviews(growthModule.reviews) : '',
    renderGalabauFaq(inhalte.faq),
    renderMalerKontakt(inhalte.kontakt, opts.submitZiel, {
      rueckruf: growthModule?.rueckruf,
      dateiAnhang: growthModule?.datei_anhang,
    }),
    renderGalabauFooter(inhalte.footer, inhalte.header, meta),
    growthModule?.whatsapp ? renderMalerWhatsapp(meta) : '',
    opts.demo ? renderGalabauRibbon() : '',
  ].filter(Boolean).join('\n\n')

  return shell(config, titel, beschreibung, body, opts, wandModusAufloesen(config, stufe))
}

/** Header mit auf die Landing zurückzeigenden Anker-Links (Unterseiten) */
function headerFuerUnterseite(inhalte: MalerInhalte, basisPfad: string) {
  return {
    ...inhalte.header,
    links: inhalte.header.links.map((l) => ({ ...l, anker: `${basisPfad}/${l.anker}` })),
  }
}

/**
 * Growth-Unterseite rendern: 'ueber-uns', 'referenzen' oder 'leistungen/{slug}'.
 * Liefert null bei unbekanntem Pfad (Route → 404). Jede Unterseite endet mit
 * Kontakt + Footer, damit der Header-CTA (#kontakt) funktioniert.
 */
export function renderMalerUnterseite(
  config: MalerConfig,
  pfad: string,
  opts: MalerRenderOptionen = {},
): string | null {
  const { meta } = config
  const inhalte = config.inhalte
  const growthModule = inhalte.module
  const basisPfad = opts.basisPfad ?? ''
  const header = headerFuerUnterseite(inhalte, basisPfad)
  const kontakt = renderMalerKontakt(inhalte.kontakt, opts.submitZiel, {
    rueckruf: growthModule?.rueckruf,
    dateiAnhang: growthModule?.datei_anhang,
  })
  const fuss = renderGalabauFooter(inhalte.footer, header, meta)
  const extras = [
    growthModule?.whatsapp ? renderMalerWhatsapp(meta) : '',
    opts.demo ? renderGalabauRibbon() : '',
  ]

  if (pfad === 'ueber-uns') {
    const titel = `Über uns – ${meta.firma}`
    const body = [
      renderGalabauHeader(header),
      renderMalerLeistungKopf('Über uns', meta.firma, inhalte.footer.beschreibung),
      renderGalabauUeber(inhalte.ueber),
      renderGalabauWarum(inhalte.warum),
      renderGalabauTeam(inhalte.team),
      renderGalabauCtaBand(inhalte.cta_band),
      kontakt,
      fuss,
      ...extras,
    ].filter(Boolean).join('\n\n')
    return shell(config, titel, meta.seo_beschreibung || '', body, opts, 'fertig')
  }

  if (pfad === 'referenzen') {
    const titel = `Referenzen aus ${meta.ort} – ${meta.firma}`
    const body = [
      renderGalabauHeader(header),
      renderMalerLeistungKopf('Referenzen', `Referenzen aus ${meta.ort}`, inhalte.referenzen.lead),
      renderGalabauReferenzen(inhalte.referenzen),
      inhalte.galerie ? renderMalerGalerie(inhalte.galerie, true) : '',
      renderGalabauCtaBand(inhalte.cta_band),
      kontakt,
      fuss,
      ...extras,
    ].filter(Boolean).join('\n\n')
    return shell(config, titel, meta.seo_beschreibung || '', body, opts, 'fertig')
  }

  const slugMatch = pfad.match(/^leistungen\/([a-z0-9-]+)$/)
  if (slugMatch) {
    const slug = slugMatch[1]
    const karte = inhalte.leistungen.karten.find((k) => malerLeistungSlug(k.name) === slug)
    const detail = (inhalte.leistung_details ?? []).find((d) => d.slug === slug)
    if (!karte || !detail) return null
    const h1 = `${karte.name} in ${meta.ort}`
    const titel = `${h1} – ${meta.firma}`
    const body = [
      renderGalabauHeader(header),
      renderMalerLeistungKopf(karte.kategorie, h1, detail.intro),
      `<section class="sektion">
  <div class="inhalt">
    <div class="rv">${mediaSlot(karte.media, 'ueber-bild')}</div>
  </div>
</section>`,
      renderGalabauFaq({ h2: `Häufige Fragen: ${karte.name}`, paare: detail.faq }),
      renderGalabauCtaBand({ ...inhalte.cta_band, cta_label: detail.cta_label }),
      kontakt,
      fuss,
      ...extras,
    ].filter(Boolean).join('\n\n')
    return shell(config, titel, karte.text, body, opts, 'fertig')
  }

  return null
}
