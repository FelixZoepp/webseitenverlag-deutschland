/**
 * Auftrag T1.7 — Stresstest Komposition „galabau-landing-v1".
 *
 * Prüft: Flagship-Seed rendert vollständig (alle Sektionsmarker, Texte verbatim,
 * Animations-Grammatik, self-contained), Copy-Slot-Limits, Asset-Slot-Mapping,
 * Produktstufen (business ohne Video, growth mit Video) und 3 fiese Datensätze:
 * sehr langer Firmenname · nur 3 Leistungen · Stadt mit Bindestrich.
 *
 * Aufruf: npm run test:galabau
 */
import { renderFlagshipPage } from '../lib/flagship/render'
import { renderGalabauLanding } from '../lib/flagship/galabau/render'
import { galabauLandingSeed } from '../lib/flagship/galabau/seed'
import { istGalabauKomposition, type GalabauConfig } from '../lib/flagship/galabau/types'
import { pruefeCopySlots } from '../lib/flagship/galabau/copy-slots'
import { GALABAU_ASSET_SLOTS, slotKeyAusDateiname } from '../lib/flagship/galabau/asset-slots'

let fehler = 0
let geprueft = 0

function assert(bedingung: boolean, name: string, meldung: string) {
  geprueft++
  if (!bedingung) {
    fehler++
    console.error(`  ✗ [${name}] ${meldung}`)
  }
}

const MARKER = [
  'g-header', 'g-hero', 'g-ueber', 'g-leistungen', 'g-warum', 'g-referenzen',
  'g-team', 'g-cta-band', 'g-faq', 'g-kontakt', 'g-footer',
]

function klon(config: GalabauConfig): GalabauConfig {
  return JSON.parse(JSON.stringify(config)) as GalabauConfig
}

function pruefeGrundregeln(name: string, html: string) {
  for (const m of MARKER) assert(html.includes(`<!-- sektion:${m} -->`), name, `Sektionsmarker "${m}" fehlt`)
  assert(!/\{\{[^}]*\}\}/.test(html), name, 'Template-Rest {{…}} im Output')
  assert(!html.includes('undefined'), name, '"undefined" im Output')
  assert(!html.includes('fonts.googleapis'), name, 'Google-Fonts-Referenz (nicht self-contained)')
  assert(!html.includes('cdn.'), name, 'CDN-Referenz (nicht self-contained)')
  assert(html.includes('prefers-reduced-motion'), name, 'prefers-reduced-motion fehlt')
  assert(html.includes('<html lang="de">'), name, 'lang="de" fehlt')
  assert(html.includes('html.js .rv'), name, 'Reveal-Gating (html.js .rv) fehlt — No-JS-Seiten wären unsichtbar')
}

/* ---------- 1. Flagship-Seed ---------- */
{
  const name = 'seed'
  const html = renderGalabauLanding(galabauLandingSeed)
  pruefeGrundregeln(name, html)

  // Verbatim-Felder
  assert(html.includes('GrünWerk Garten- &amp; Landschaftsbau'), name, 'Firma fehlt (verbatim, escaped)')
  assert(html.includes('Wiesbaden'), name, 'Ort fehlt')
  assert(html.includes('0611 000000'), name, 'Telefon fehlt')

  // H1-Wortsplit mit fadeUp-Stagger
  for (const wort of ['Ihr', 'Garten.', 'Nur', 'besser.']) {
    assert(html.includes(`>${wort}</span>`), name, `H1-Wort "${wort}" fehlt`)
  }

  // 5 Leistungs-Karten, Nummern 01–05, Sticky-Stack
  for (const titel of ['Gartenplanung', 'Pflaster- &amp; Terrassenbau', 'Gartenpflege', 'Bewässerung', 'Zaun- &amp; Sichtschutzbau']) {
    assert(html.includes(titel), name, `Leistung "${titel}" fehlt`)
  }
  for (const nr of ['01', '02', '03', '04', '05']) assert(html.includes(`>${nr}</`), name, `Karten-Nr ${nr} fehlt`)
  for (const top of [90, 106, 122, 138, 154]) assert(html.includes(`top:${top}px`), name, `Sticky-Top ${top}px fehlt`)

  // Animations-Grammatik
  for (const kf of ['fadeUp', 'floaty', 'kenburns']) assert(html.includes(kf), name, `Keyframe "${kf}" fehlt`)
  assert(html.includes('data-ba'), name, 'BA-Slider fehlt')
  assert(html.includes('data-kpi'), name, 'KPI-Count-up fehlt')

  // 6 FAQ-Paare (nur Markup zählen — das JS referenziert '[data-faq]' zusätzlich)
  const faqAnzahl = (html.match(/<div[^>]*data-faq/g) || []).length
  assert(faqAnzahl === 6, name, `FAQ-Anzahl ${faqAnzahl} ≠ 6`)

  // Demos: noindex per Default AN
  assert(html.includes('name="robots" content="noindex"'), name, 'noindex fehlt (Default für Demos)')
  assert(html.includes('application/ld+json'), name, 'JSON-LD fehlt')

  // Dispatch: renderFlagshipPage liefert identisches Ergebnis
  assert(renderFlagshipPage(galabauLandingSeed) === html, name, 'Dispatch renderFlagshipPage ≠ renderGalabauLanding')
  assert(istGalabauKomposition(galabauLandingSeed), name, 'Type-Guard erkennt Seed nicht')

  // Demo-Ribbon nur mit opts.demo
  assert(!html.includes('Demo-Vorschau'), name, 'Ribbon ohne demo-Flag gerendert')
  assert(renderGalabauLanding(galabauLandingSeed, { demo: true }).includes('Demo-Vorschau'), name, 'Ribbon fehlt bei demo:true')

  // noindex:false schaltet ab (Live)
  assert(!renderGalabauLanding(galabauLandingSeed, { noindex: false }).includes('content="noindex"'), name, 'noindex:false wirkt nicht')
}

/* ---------- 2. Copy-Slots ---------- */
{
  const name = 'copy-slots'
  assert(pruefeCopySlots(galabauLandingSeed.inhalte).length === 0, name, 'Seed verletzt eigene Copy-Limits')

  const zuLang = klon(galabauLandingSeed)
  zuLang.inhalte.hero.h1 = 'X'.repeat(500)
  const v1 = pruefeCopySlots(zuLang.inhalte)
  assert(v1.some((v) => v.pfad === 'hero.h1' && v.grund === 'zu_lang'), name, 'zu langes H1 nicht gemeldet')

  const fehlt = klon(galabauLandingSeed)
  fehlt.inhalte.leistungen.karten[0].titel = ''
  const v2 = pruefeCopySlots(fehlt.inhalte)
  assert(v2.some((v) => v.pfad === 'leistungen.karten[0].titel' && v.grund === 'fehlt'), name, 'fehlender Pflicht-Slot nicht gemeldet')
}

/* ---------- 3. Asset-Slots ---------- */
{
  const name = 'asset-slots'
  // 21 Slots: hero_bg+hero_video, about_detail, svc_01..05, why_1..3, contact_img, ba-Paar, team_1..3, avatar_1..4
  assert(Object.keys(GALABAU_ASSET_SLOTS).length === 21, name, `Slot-Anzahl ${Object.keys(GALABAU_ASSET_SLOTS).length} ≠ 21`)
  assert(GALABAU_ASSET_SLOTS.ba_before.pair_with === 'ba_after', name, 'ba_before ohne pair_with')
  assert(GALABAU_ASSET_SLOTS.hero_video.fallback === 'hero_bg', name, 'hero_video ohne Fallback')
  assert(slotKeyAusDateiname('hero-bg.jpg') === 'hero_bg', name, 'Dateinamen-Mapping hero-bg.jpg')
  assert(slotKeyAusDateiname('ba-before.jpg') === 'ba_before', name, 'Dateinamen-Mapping ba-before.jpg')
  assert(slotKeyAusDateiname('hero-video.mp4') === 'hero_video', name, 'Dateinamen-Mapping hero-video.mp4')
  assert(slotKeyAusDateiname('unbekannt.jpg') === null, name, 'unbekannter Dateiname nicht null')
}

/* ---------- 4. Produktstufen (Video-Hero) ---------- */
{
  const name = 'stufen'
  const mitVideo = klon(galabauLandingSeed)
  mitVideo.inhalte.hero.video = { src: '/media/galabau/hero-video.mp4', poster: '/media/galabau/hero-bg.jpg' }

  const growth = renderGalabauLanding(mitVideo, { level: 'growth' })
  assert(growth.includes('<video'), name, 'growth rendert kein Video')
  assert(growth.includes('autoplay muted loop playsinline'), name, 'Video-Attribute fehlen')

  const business = renderGalabauLanding(mitVideo, { level: 'business' })
  assert(!business.includes('<video'), name, 'business rendert Video trotz Stufe')

  const ohneVideo = renderGalabauLanding(galabauLandingSeed, { level: 'growth' })
  assert(!ohneVideo.includes('<video'), name, 'Video ohne Config gerendert')
}

/* ---------- 5. Stresstest: 3 fiese Datensätze ---------- */
{
  // (a) sehr langer Firmenname
  const name = 'stress-langer-name'
  const lang = klon(galabauLandingSeed)
  lang.meta.firma = 'Garten- und Landschaftsbau Hoffmann-Siebert & Söhne Meisterbetrieb für Außenanlagen GmbH & Co. KG'
  const html = renderGalabauLanding(lang)
  pruefeGrundregeln(name, html)
  assert(html.includes('Hoffmann-Siebert &amp; Söhne Meisterbetrieb für Außenanlagen GmbH &amp; Co. KG'), name, 'langer Firmenname nicht verbatim')
  // JSON-LD escaped nur '<' (Script-Ausbruch); '&' bleibt roh im JSON
  assert(html.includes('"name":"Garten- und Landschaftsbau Hoffmann-Siebert & Söhne'), name, 'langer Firmenname fehlt im JSON-LD')
}
{
  // (b) nur 3 Leistungen
  const name = 'stress-3-leistungen'
  const drei = klon(galabauLandingSeed)
  drei.inhalte.leistungen.karten = drei.inhalte.leistungen.karten.slice(0, 3)
  drei.funnel.leistungen = drei.funnel.leistungen?.slice(0, 3)
  const html = renderGalabauLanding(drei)
  pruefeGrundregeln(name, html)
  assert(html.includes('>03</'), name, 'Karte 03 fehlt')
  assert(!html.includes('>04</'), name, 'Karte 04 gerendert trotz 3 Leistungen')
  assert(pruefeCopySlots(drei.inhalte).length === 0, name, '3 Leistungen melden falschen Copy-Verstoß')
}
{
  // (c) Stadt mit Bindestrich
  const name = 'stress-bindestrich-stadt'
  const stadt = klon(galabauLandingSeed)
  stadt.meta.ort = 'Castrop-Rauxel'
  const html = renderGalabauLanding(stadt)
  pruefeGrundregeln(name, html)
  assert(html.includes('Castrop-Rauxel'), name, 'Bindestrich-Stadt nicht verbatim')
  assert(html.includes('"addressLocality":"Castrop-Rauxel"'), name, 'Bindestrich-Stadt fehlt im JSON-LD')
}

/* ---------- 6. Escaping ---------- */
{
  const name = 'escaping'
  const boese = klon(galabauLandingSeed)
  boese.inhalte.hero.lead = 'Angriff <script>alert(1)</script> Ende'
  const html = renderGalabauLanding(boese)
  assert(!html.includes('<script>alert(1)</script>'), name, 'Script-Injektion landet roh im HTML')
  assert(html.includes('&lt;script&gt;'), name, 'Injektion nicht escaped')
}

console.log(`\ntest:galabau — ${geprueft} Prüfungen, ${fehler} Fehler`)
if (fehler > 0) process.exit(1)
