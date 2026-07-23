/**
 * Stresstest Flagship-Engine (F2, BF §1.1/§1.2).
 *
 * Rendert beide Flagship-Seeds plus je 3 abweichende Datensätze und prüft:
 *  - alle Pflicht-Sektionsmarker (<!-- sektion:… -->) vorhanden
 *  - keine Template-Reste ({{…}}), kein "undefined" im Output
 *  - self-contained: keine Google-Fonts / Fremd-CDNs
 *  - prefers-reduced-motion vorhanden
 *  - Escaping: <script>-Injektion in Inhalten landet nie roh im HTML
 *  - Funnel-Seite (anfrage/reservierung) rendert Quali-Fragen bzw. Reservierungsfelder
 *
 * Aufruf: npm run test:flagship
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import { FLAGSHIP_SEEDS } from '../lib/flagship/seeds'
import { renderFlagshipPage, renderUnterseite } from '../lib/flagship/render'
import { renderAnfrageSeite } from '../lib/flagship/anfrage'
import type { FlagshipConfig, UnterseitenSlug } from '../lib/flagship/types'
import { UNTERSEITEN } from '../lib/flagship/types'
import { wendeDesignOverridesAn } from '../lib/pipeline/generate-flagship-demo'

let fehler = 0
let geprueft = 0

function assert(bedingung: boolean, name: string, meldung: string) {
  geprueft++
  if (!bedingung) {
    fehler++
    console.error(`  ✗ [${name}] ${meldung}`)
  }
}

const PFLICHT_MARKER = [
  'nav', 'hero', 'fakten', 'empathie', 'signature', 'leistungen',
  'ergebnisse', 'zahlen', 'stimmen', 'lokal', 'faq', 'conversion', 'footer',
]

function pruefeSeite(name: string, config: FlagshipConfig, html: string) {
  for (const m of PFLICHT_MARKER) {
    assert(html.includes(`<!-- sektion:${m} -->`), name, `Sektionsmarker "${m}" fehlt`)
  }
  // Ablauf: Pflicht bei Dienstleistung, Gastro (reservierung) ohne
  if (config.inhalte.ablauf) {
    assert(html.includes('<!-- sektion:ablauf -->'), name, 'Ablauf-Sektion fehlt trotz Config')
  } else {
    assert(!html.includes('<!-- sektion:ablauf -->'), name, 'Ablauf-Sektion gerendert ohne Config')
  }
  pruefeGrundregeln(name, html)
}

function pruefeGrundregeln(name: string, html: string) {
  assert(!/\{\{[^}]*\}\}/.test(html), name, 'Template-Rest {{…}} im Output')
  assert(!html.includes('undefined'), name, '"undefined" im Output')
  assert(!html.includes('fonts.googleapis'), name, 'Google-Fonts-Referenz (nicht self-contained)')
  assert(!html.includes('cdn.'), name, 'CDN-Referenz (nicht self-contained)')
  assert(html.includes('prefers-reduced-motion'), name, 'prefers-reduced-motion fehlt')
  assert(html.includes('<html lang="de">'), name, 'lang="de" fehlt')
}

/** Tiefe Kopie + gezielte Abweichungen für den Stresstest */
function klon(config: FlagshipConfig): FlagshipConfig {
  return JSON.parse(JSON.stringify(config)) as FlagshipConfig
}

const INJEKTION = '<script>alert("xss")</script> & "quotes" <img src=x onerror=alert(1)>'

function varianten(basis: FlagshipConfig): { name: string; config: FlagshipConfig }[] {
  // Variante 1: andere Firma/Ort, lange Headline
  const v1 = klon(basis)
  v1.meta.firma = 'Müller & Söhne GmbH & Co. KG'
  v1.meta.ort = 'Bad Königshofen im Grabfeld'
  v1.inhalte.hero.headline_zeilen = [
    'Eine sehr, sehr lange Headline',
    'mit [[Highlight]] und noch mehr Text,',
    'die den Umbruch testet',
  ]
  v1.inhalte.faq.fragen = v1.inhalte.faq.fragen.slice(0, 2)

  // Variante 2: Injektion in freie Textfelder (Escaping-Test)
  const v2 = klon(basis)
  v2.meta.firma = INJEKTION
  v2.inhalte.hero.headline_zeilen = [INJEKTION]
  v2.inhalte.empathie.text = INJEKTION
  v2.inhalte.stimmen.quotes[0].text = INJEKTION
  v2.inhalte.stimmen.quotes[0].name = INJEKTION
  v2.inhalte.faq.fragen[0].frage = INJEKTION
  v2.inhalte.faq.fragen[0].antwort = INJEKTION
  v2.inhalte.conversion.headline = INJEKTION

  // Variante 3: Minimal-Daten (weniger Karten, keine optionalen Felder)
  const v3 = klon(basis)
  v3.inhalte.leistungen.karten = v3.inhalte.leistungen.karten.slice(0, 3)
  v3.inhalte.leistungen.hinweis = undefined
  v3.inhalte.zahlen.items = v3.inhalte.zahlen.items.slice(0, 2)
  v3.inhalte.stimmen.quotes = v3.inhalte.stimmen.quotes.slice(0, 1)
  v3.meta.telefon = undefined
  v3.meta.gegruendet = undefined

  return [
    { name: 'variante-1-lang', config: v1 },
    { name: 'variante-2-injektion', config: v2 },
    { name: 'variante-3-minimal', config: v3 },
  ]
}

console.log('Flagship-Stresstest (F2)\n')

for (const [key, seed] of Object.entries(FLAGSHIP_SEEDS)) {
  const faelle = [{ name: 'seed', config: seed }, ...varianten(seed)]

  for (const { name, config } of faelle) {
    const label = `${key}/${name}`

    // Startseite
    const html = renderFlagshipPage(config, { demo: true, basisPfad: '/demo/test' })
    pruefeSeite(label, config, html)

    // Escaping: rohe Injektion darf nirgends auftauchen
    assert(!html.includes('<script>alert'), label, 'rohe <script>-Injektion im HTML')
    assert(!html.includes('<img src=x onerror'), label, 'rohes <img onerror>-Tag im HTML')

    // Demo-Modus: Ribbon + noindex
    assert(html.includes('name="robots" content="noindex"'), label, 'noindex fehlt (Demo)')

    // Funnel-Seite
    const funnelHtml = renderAnfrageSeite(config, { demo: true, basisPfad: '/demo/test', submitZiel: null })
    pruefeGrundregeln(`${label}/funnel`, funnelHtml)
    assert(!funnelHtml.includes('<script>alert'), `${label}/funnel`, 'rohe <script>-Injektion im Funnel-HTML')

    if (config.funnel.modus === 'reservierung') {
      assert(funnelHtml.includes('name="datum"'), `${label}/funnel`, 'Reservierung: Datumsfeld fehlt')
      assert(funnelHtml.includes('name="personen"'), `${label}/funnel`, 'Reservierung: Personenfeld fehlt')
      assert(funnelHtml.includes('name="telefon"'), `${label}/funnel`, 'Reservierung: Telefonfeld fehlt')
    } else {
      for (const frage of config.funnel.quali_fragen || []) {
        assert(funnelHtml.includes(`name="${frage.key}"`), `${label}/funnel`, `Quali-Frage "${frage.key}" fehlt`)
      }
      assert(funnelHtml.includes('name="email"'), `${label}/funnel`, 'Anfrage: E-Mail-Feld fehlt')
    }

    console.log(`  ${label}: ok (Startseite + Funnel)`)
  }
}

// Live-Modus: kein noindex, Submit-Ziel gesetzt
const liveSeed = Object.values(FLAGSHIP_SEEDS)[0]
const liveHtml = renderFlagshipPage(liveSeed, { noindex: false })
assert(!liveHtml.includes('name="robots" content="noindex"'), 'live', 'noindex im Live-Modus gesetzt')
const liveFunnel = renderAnfrageSeite(liveSeed, { submitZiel: '/api/public/forms/test-site/submit' })
assert(liveFunnel.includes('/api/public/forms/test-site/submit'), 'live', 'Submit-Ziel fehlt im Live-Funnel')

// ============================================================
// Multipage-Tests: Startseite (reduziert) + 4 Unterseiten
// ============================================================
console.log('\nMultipage-Tests\n')

/** Erwartete Sektionsmarker je Unterseite */
const UNTERSEITEN_MARKER: Record<UnterseitenSlug, string[]> = {
  leistungen: ['leistungen'],
  ergebnisse: ['ergebnisse', 'stimmen'],
  'ueber-uns': ['empathie', 'zahlen', 'lokal'],
  kontakt: ['lokal', 'faq', 'conversion'],
}

/** Sektionen, die auf der Multipage-Startseite NICHT erscheinen dürfen */
const MULTIPAGE_HOME_AUSGESCHLOSSEN = [
  'empathie', 'leistungen', 'ergebnisse', 'stimmen', 'lokal', 'faq', 'nachweise',
]

for (const [key, seed] of Object.entries(FLAGSHIP_SEEDS)) {
  const mp = klon(seed)
  mp.seiten_modus = 'multipage'
  const label = `${key}/multipage`
  const basisPfad = '/demo/test'

  // Multipage-Startseite: reduziertes Set
  const homeHtml = renderFlagshipPage(mp, { demo: true, basisPfad })
  pruefeGrundregeln(`${label}/home`, homeHtml)

  // Pflicht-Sektionen der Multipage-Startseite
  for (const m of ['nav', 'hero', 'fakten', 'signature', 'zahlen', 'conversion', 'footer']) {
    assert(homeHtml.includes(`<!-- sektion:${m} -->`), `${label}/home`, `Sektionsmarker "${m}" fehlt`)
  }

  // Ausgeschlossene Sektionen dürfen nicht auf der Startseite sein
  for (const m of MULTIPAGE_HOME_AUSGESCHLOSSEN) {
    assert(!homeHtml.includes(`<!-- sektion:${m} -->`), `${label}/home`, `Sektion "${m}" sollte nicht auf Multipage-Startseite sein`)
  }

  // Nav-Links: echte Seitenlinks statt Anker
  for (const u of UNTERSEITEN) {
    assert(homeHtml.includes(`${basisPfad}/${u.slug}`), `${label}/home`, `Nav-Link zu "${u.slug}" fehlt`)
  }

  // Demo-Ribbon
  assert(homeHtml.includes('Demo-Vorschau'), `${label}/home`, 'Demo-Ribbon fehlt')

  console.log(`  ${label}/home: ok`)

  // Unterseiten
  for (const u of UNTERSEITEN) {
    const html = renderUnterseite(mp, u.slug, { demo: true, basisPfad })
    pruefeGrundregeln(`${label}/${u.slug}`, html)

    // Titel: "Label – Firma"
    assert(html.includes(`<title>${u.label} – `), `${label}/${u.slug}`, `Titel enthält nicht "${u.label} –"`)

    // Nav + Footer immer vorhanden
    assert(html.includes('<!-- sektion:nav -->'), `${label}/${u.slug}`, 'Nav fehlt')
    assert(html.includes('<!-- sektion:footer -->'), `${label}/${u.slug}`, 'Footer fehlt')

    // Erwartete Sektionsmarker
    for (const m of UNTERSEITEN_MARKER[u.slug]) {
      assert(html.includes(`<!-- sektion:${m} -->`), `${label}/${u.slug}`, `Sektionsmarker "${m}" fehlt`)
    }

    // Nav-Links: Multipage-Links auf jeder Unterseite
    for (const link of UNTERSEITEN) {
      assert(html.includes(`${basisPfad}/${link.slug}`), `${label}/${u.slug}`, `Nav-Link zu "${link.slug}" fehlt`)
    }

    // Demo-Ribbon
    assert(html.includes('Demo-Vorschau'), `${label}/${u.slug}`, 'Demo-Ribbon fehlt')

    console.log(`  ${label}/${u.slug}: ok`)
  }
}

// Onepager-Modus: seiten_modus 'onepager' oder undefined → alle Sektionen auf Startseite
const onepager = klon(Object.values(FLAGSHIP_SEEDS)[0])
onepager.seiten_modus = 'onepager'
const onepagerHtml = renderFlagshipPage(onepager, { demo: true, basisPfad: '/demo/test' })
for (const m of PFLICHT_MARKER) {
  assert(onepagerHtml.includes(`<!-- sektion:${m} -->`), 'onepager', `Sektionsmarker "${m}" fehlt im Onepager`)
}
console.log('  onepager: ok (alle Sektionen vorhanden)')

// ------------------------------------------------------------
// Scroll-Animationen-Extra (Spec 2026-07-22)
// ------------------------------------------------------------
{
  const basis = klon(Object.values(FLAGSHIP_SEEDS)[0])

  // Override setzt beide Flags
  const mitFlag = klon(basis)
  wendeDesignOverridesAn(mitFlag, { scroll_animationen: true, premium_animationen: true })
  assert(mitFlag.scroll_animationen === true, 'scroll-extra', 'Override setzt scroll_animationen nicht')
  assert(mitFlag.premium_animationen === true, 'scroll-extra', 'Override setzt premium_animationen nicht')

  // Ohne Override bleibt das Flag aus
  const ohneFlag = klon(basis)
  wendeDesignOverridesAn(ohneFlag, {})
  assert(ohneFlag.scroll_animationen === undefined, 'scroll-extra', 'Flag darf ohne Override nicht gesetzt sein')

  // Render: Scrub-Modus am Hero
  const scrubConfig = klon(basis)
  scrubConfig.scroll_animationen = true
  scrubConfig.inhalte.hero.video = { src: '/media/test.mp4', poster: '/media/test.jpg', modus: 'scrub' }
  const scrubHtml = renderFlagshipPage(scrubConfig, { demo: true, basisPfad: '/demo/test' })
  assert(scrubHtml.includes('data-modus="scrub"'), 'scroll-extra', 'Hero rendert nicht data-modus="scrub"')
  assert(scrubHtml.includes('class="vhero scrub"'), 'scroll-extra', 'Hero hat keine .scrub-Klasse')

  // Render: Loop bleibt Default
  const loopConfig = klon(basis)
  loopConfig.inhalte.hero.video = { src: '/media/test.mp4', poster: '/media/test.jpg', modus: 'loop' }
  const loopHtml = renderFlagshipPage(loopConfig, { demo: true, basisPfad: '/demo/test' })
  assert(loopHtml.includes('data-modus="loop"'), 'scroll-extra', 'Hero rendert nicht data-modus="loop"')
}

// ------------------------------------------------------------
// R-MOBILE-CLIP: Mobile darf nie horizontal scrollen — jede Renderer-Basis
// trägt overflow-x:hidden;overflow-x:clip auf html UND body (iOS Safari
// ignoriert body allein; clip zerstört position:sticky nicht).
// ------------------------------------------------------------
{
  const RENDERER_CSS_QUELLEN = [
    'lib/flagship/css.ts',
    'lib/flagship/galabau/css.ts', // deckt auch maler ab (galabauCss-Basis)
    'lib/flagship/scrub/css.ts',
    'lib/library/render.ts',
  ]
  for (const rel of RENDERER_CSS_QUELLEN) {
    const src = readFileSync(join(__dirname, '..', rel), 'utf-8')
    // Ganze Zeile prüfen — Template-Ausdrücke (${…}) enthalten schließende Klammern
    const htmlRegel = src.match(/^html\{.*$/m)?.[0] ?? ''
    const bodyRegel = src.match(/^body\{.*$/m)?.[0] ?? ''
    assert(
      htmlRegel.includes('overflow-x:hidden') && htmlRegel.includes('overflow-x:clip'),
      'R-MOBILE-CLIP',
      `${rel}: html{} ohne overflow-x:hidden;overflow-x:clip`
    )
    assert(
      bodyRegel.includes('overflow-x:hidden') && bodyRegel.includes('overflow-x:clip'),
      'R-MOBILE-CLIP',
      `${rel}: body{} ohne overflow-x:hidden;overflow-x:clip`
    )
  }
}

console.log(`\n${geprueft} Prüfungen, ${fehler} Fehler`)
if (fehler > 0) process.exit(1)
console.log('Alle Prüfungen bestanden.')
