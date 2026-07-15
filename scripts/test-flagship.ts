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
import { FLAGSHIP_SEEDS } from '../lib/flagship/seeds'
import { renderFlagshipPage } from '../lib/flagship/render'
import { renderAnfrageSeite } from '../lib/flagship/anfrage'
import type { FlagshipConfig } from '../lib/flagship/types'

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

console.log(`\n${geprueft} Prüfungen, ${fehler} Fehler`)
if (fehler > 0) process.exit(1)
console.log('Alle Prüfungen bestanden.')
