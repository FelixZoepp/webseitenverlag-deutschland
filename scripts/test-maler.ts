/**
 * Template-Fabrik B4 — Stresstest Komposition „maler-landing-v1".
 *
 * Prüft: Seed rendert vollständig (Sektionsmarker, Verbatim-Felder, Signature-Wand),
 * die 3 Render-Stufen (statisch/video/growth) inkl. Growth-Module und Unterseiten,
 * Copy-Slot-Limits, Asset-Slot-Mapping (27 Slots inkl. Galerie) und 3 fiese
 * Datensätze: sehr langer Firmenname · nur 3 Leistungen · Stadt mit Bindestrich.
 *
 * Aufruf: npm run test:maler
 */
import { renderFlagshipPage } from '../lib/flagship/render'
import { renderMalerLanding, renderMalerUnterseite, malerLeistungSlug } from '../lib/flagship/maler/render'
import { malerLandingSeed } from '../lib/flagship/maler/seed'
import { istMalerKomposition, type MalerConfig } from '../lib/flagship/maler/types'
import { pruefeMalerCopySlots } from '../lib/flagship/maler/copy-slots'
import { MALER_ASSET_SLOTS, malerSlotKeyAusDateiname } from '../lib/flagship/maler/asset-slots'
import { malerWhatsappNummer } from '../lib/flagship/maler/sections'

let fehler = 0
let geprueft = 0

function assert(bedingung: boolean, name: string, meldung: string) {
  geprueft++
  if (!bedingung) {
    fehler++
    console.error(`  ✗ [${name}] ${meldung}`)
  }
}

/** Marker, die auf JEDER Stufe der Landing stehen (Galerie/Module sind stufenabhängig) */
const BASIS_MARKER = [
  'g-header', 'g-hero', 'm-wand', 'g-ueber', 'g-leistungen', 'g-warum',
  'g-referenzen', 'g-team', 'g-cta-band', 'g-faq', 'g-kontakt', 'g-footer',
]

function klon(config: MalerConfig): MalerConfig {
  return JSON.parse(JSON.stringify(config)) as MalerConfig
}

function pruefeGrundregeln(name: string, html: string, marker: string[] = BASIS_MARKER) {
  for (const m of marker) assert(html.includes(`<!-- sektion:${m} -->`), name, `Sektionsmarker "${m}" fehlt`)
  assert(!/\{\{[^}]*\}\}/.test(html), name, 'Template-Rest {{…}} im Output')
  assert(!html.includes('undefined'), name, '"undefined" im Output')
  assert(!html.includes('fonts.googleapis'), name, 'Google-Fonts-Referenz (nicht self-contained)')
  assert(!html.includes('cdn.'), name, 'CDN-Referenz (nicht self-contained)')
  assert(html.includes('prefers-reduced-motion'), name, 'prefers-reduced-motion fehlt')
  assert(html.includes('<html lang="de">'), name, 'lang="de" fehlt')
  assert(html.includes('html.js .rv'), name, 'Reveal-Gating (html.js .rv) fehlt — No-JS-Seiten wären unsichtbar')
}

/* ---------- 1. Seed (Stufe video = Demo-Default) ---------- */
{
  const name = 'seed'
  const html = renderMalerLanding(malerLandingSeed)
  pruefeGrundregeln(name, html)

  // Verbatim-Felder (NIE durch LLM)
  assert(html.includes('Voss Maler &amp; Lackierer Meisterbetrieb'), name, 'Firma fehlt (verbatim, escaped)')
  assert(html.includes('Osnabrück'), name, 'Ort fehlt')
  assert(html.includes('0541 000000'), name, 'Telefon fehlt')

  // 5 Leistungs-Karten
  for (const titel of ['Innenanstrich', 'Fassadenanstrich', 'Lackierarbeiten', 'Tapezierarbeiten', 'Spachteltechnik']) {
    assert(html.includes(titel), name, `Leistung "${titel}" fehlt`)
  }

  // Signature-Wand: clip-path-Grammatik, no-JS-Default fertig, reduced-motion
  assert(html.includes('data-wand'), name, 'Wand-Element (data-wand) fehlt')
  assert(html.includes('--rolle'), name, 'Wand-Variable --rolle fehlt')
  assert(html.includes('clip-path'), name, 'Wand ohne clip-path')
  assert(html.includes('Altweiß') && html.includes('Salbei'), name, 'Wand-Tags (Altweiß/Salbei) fehlen')

  // Demo-Default = Stufe video: Galerie ja, Growth-Module nein
  assert(html.includes('<!-- sektion:m-galerie -->'), name, 'Galerie fehlt auf Stufe video')
  assert(!html.includes('wa.me/'), name, 'WhatsApp-Bubble auf Stufe video gerendert')
  assert(!html.includes('<!-- sektion:m-gebiet -->'), name, 'Einzugsgebiet auf Stufe video gerendert')

  // 6 FAQ-Paare
  const faqAnzahl = (html.match(/<div[^>]*data-faq/g) || []).length
  assert(faqAnzahl === 6, name, `FAQ-Anzahl ${faqAnzahl} ≠ 6`)

  // Demos: noindex per Default AN, JSON-LD vorhanden
  assert(html.includes('name="robots" content="noindex"'), name, 'noindex fehlt (Default für Demos)')
  assert(html.includes('application/ld+json'), name, 'JSON-LD fehlt')
  assert(!renderMalerLanding(malerLandingSeed, { noindex: false }).includes('content="noindex"'), name, 'noindex:false wirkt nicht')

  // Dispatch: renderFlagshipPage liefert identisches Ergebnis
  assert(renderFlagshipPage(malerLandingSeed) === html, name, 'Dispatch renderFlagshipPage ≠ renderMalerLanding')
  assert(istMalerKomposition(malerLandingSeed), name, 'Type-Guard erkennt Seed nicht')

  // Demo-Ribbon nur mit opts.demo
  assert(!html.includes('Demo-Vorschau'), name, 'Ribbon ohne demo-Flag gerendert')
  assert(renderMalerLanding(malerLandingSeed, { demo: true }).includes('Demo-Vorschau'), name, 'Ribbon fehlt bei demo:true')
}

/* ---------- 2. Render-Stufen ---------- */
{
  const name = 'stufen'
  const mitVideo = klon(malerLandingSeed)
  mitVideo.inhalte.hero.video = { src: '/media/maler/hero-video.mp4', poster: '/media/maler/hero-bg.jpg' }

  // statisch: Onepager ohne Video, ohne Galerie, ohne Module — Wand steht fertig
  const statisch = renderMalerLanding(mitVideo, { stufe: 'statisch' })
  pruefeGrundregeln(name, statisch)
  assert(!statisch.includes('<video'), name, 'statisch rendert Video')
  assert(!statisch.includes('<!-- sektion:m-galerie -->'), name, 'statisch rendert Galerie')
  assert(!statisch.includes('wa.me/'), name, 'statisch rendert WhatsApp')
  assert(!statisch.includes('<!-- sektion:m-gebiet -->'), name, 'statisch rendert Einzugsgebiet')
  assert(!statisch.includes("var modus = '"), name, 'statisch hat Wand-Scroll-JS (Wand muss fertig stehen)')

  // video: +Video-Hero +Galerie +Wand-Animation (einmal), keine Growth-Module
  const video = renderMalerLanding(mitVideo, { stufe: 'video' })
  assert(video.includes('<video'), name, 'video rendert kein Video')
  assert(video.includes('autoplay muted loop playsinline'), name, 'Video-Attribute fehlen')
  assert(video.includes('<!-- sektion:m-galerie -->'), name, 'video rendert keine Galerie')
  assert(video.includes("var modus = 'einmal'"), name, 'video ohne Wand-Modus einmal')
  assert(!video.includes('wa.me/'), name, 'video rendert WhatsApp trotz Stufe')

  // growth: +Module (WhatsApp, Rückruf, Datei-Anhang, Einzugsgebiet)
  const growth = renderMalerLanding(mitVideo, { stufe: 'growth', submitZiel: '/api/anfrage' })
  assert(growth.includes('wa.me/49541000000'), name, 'WhatsApp-Nummer nicht mechanisch abgeleitet')
  assert(growth.includes('<!-- sektion:m-gebiet -->'), name, 'growth ohne Einzugsgebiet')
  assert(growth.includes('name="rueckruf"'), name, 'growth ohne Rückruf-Checkbox')
  assert(growth.includes('multipart/form-data') && growth.includes('name="anhang"'), name, 'growth ohne Datei-Anhang')
  assert(!growth.includes('<!-- sektion:m-reviews -->'), name, 'Reviews gerendert obwohl keine echten im Seed (NIE erfinden)')

  // signature_story: Default aus → einmal; 'on' → scrub (nur growth)
  assert(growth.includes("var modus = 'einmal'"), name, 'growth ohne Story: Wand-Modus nicht einmal')
  const mitStory = klon(mitVideo)
  mitStory.signature_story = 'on'
  assert(renderMalerLanding(mitStory, { stufe: 'growth' }).includes("var modus = 'scrub'"), name, 'signature_story on: kein scrub')
  assert(renderMalerLanding(mitStory, { stufe: 'video' }).includes("var modus = 'einmal'"), name, 'scrub auf Stufe video (nur growth erlaubt)')

  // Legacy-Mapping: level 'growth' ≡ stufe 'growth', sonst video
  assert(renderMalerLanding(mitVideo, { level: 'growth', submitZiel: '/api/anfrage' }) === growth, name, "level:'growth' ≠ stufe:'growth'")
  assert(renderMalerLanding(mitVideo, { level: 'business' }) === video, name, "level:'business' ≠ stufe:'video'")

  // Datei-Anhang nur mit submitZiel (Demo-Formular bleibt ohne Upload)
  const ohneZiel = renderMalerLanding(mitVideo, { stufe: 'growth' })
  assert(!ohneZiel.includes('multipart/form-data'), name, 'Datei-Anhang ohne submitZiel gerendert')
}

/* ---------- 3. Growth-Unterseiten ---------- */
{
  const name = 'unterseiten'
  const seed = malerLandingSeed

  // /ueber-uns
  const ueber = renderMalerUnterseite(seed, 'ueber-uns')
  assert(ueber !== null, name, 'ueber-uns rendert nicht')
  if (ueber) {
    assert(ueber.includes('<!-- sektion:m-leistung-kopf -->'), name, 'ueber-uns ohne Kopf')
    assert(ueber.includes('<title>Über uns – Voss Maler &amp; Lackierer Meisterbetrieb</title>'), name, 'ueber-uns ohne eigenen Title')
    assert(ueber.includes('<!-- sektion:g-kontakt -->'), name, 'ueber-uns endet nicht mit Kontakt (Header-CTA #kontakt bräche)')
    assert(!ueber.includes("var modus = '"), name, 'ueber-uns mit Wand-Scroll-JS (Wand fertig erwartet)')
  }

  // /referenzen: Galerie MIT Filter
  const referenzen = renderMalerUnterseite(seed, 'referenzen')
  assert(referenzen !== null, name, 'referenzen rendert nicht')
  if (referenzen) {
    assert(referenzen.includes('Referenzen aus Osnabrück'), name, 'referenzen ohne Orts-H1')
    assert(referenzen.includes('data-galerie-filter'), name, 'referenzen ohne Galerie-Filter')
    assert(referenzen.includes('data-filter="alle"'), name, 'Filter ohne "Alle"-Button')
    for (const kat of ['Innen', 'Fassade', 'Lack', 'Spachteltechnik']) {
      assert(referenzen.includes(`data-filter="${kat}"`), name, `Filter-Kategorie "${kat}" fehlt`)
    }
  }

  // /leistungen/{slug}: alle 5 Slugs, H1 „{Leistung} in {Stadt}", eigene FAQ + CTA
  for (const karte of seed.inhalte.leistungen.karten) {
    const slug = malerLeistungSlug(karte.name)
    const seite = renderMalerUnterseite(seed, `leistungen/${slug}`)
    assert(seite !== null, name, `leistungen/${slug} rendert nicht`)
    if (seite) {
      assert(seite.includes(`${karte.name} in Osnabrück`), name, `H1 "${karte.name} in Osnabrück" fehlt`)
      assert(seite.includes(`Häufige Fragen: ${karte.name}`), name, `FAQ-H2 für ${slug} fehlt`)
      assert(seite.includes(`${karte.name} anfragen`), name, `eigener CTA für ${slug} fehlt`)
    }
  }

  // Slug-Mechanik + 404
  assert(malerLeistungSlug('Fassadenanstrich') === 'fassadenanstrich', name, 'Slug Fassadenanstrich falsch')
  assert(malerLeistungSlug('Türen & Öl-Lasur (weiß)') === 'tueren-oel-lasur-weiss', name, 'Slug-Transliteration ä/ö/ü/ß falsch')
  assert(renderMalerUnterseite(seed, 'gibt-es-nicht') === null, name, 'unbekannter Pfad ≠ null (kein 404)')
  assert(renderMalerUnterseite(seed, 'leistungen/gibt-es-nicht') === null, name, 'unbekannter Leistungs-Slug ≠ null')

  // basisPfad: Header-Links zeigen zurück auf die Landing
  const mitPfad = renderMalerUnterseite(seed, 'ueber-uns', { basisPfad: '/demo/abc' })
  assert(mitPfad !== null && mitPfad.includes('href="/demo/abc/#'), name, 'Header-Links ohne basisPfad-Präfix')
}

/* ---------- 4. Copy-Slots ---------- */
{
  const name = 'copy-slots'
  assert(pruefeMalerCopySlots(malerLandingSeed.inhalte).length === 0, name, 'Seed verletzt eigene Copy-Limits')

  const zuLang = klon(malerLandingSeed)
  zuLang.inhalte.wand.h2 = 'X'.repeat(500)
  const v1 = pruefeMalerCopySlots(zuLang.inhalte)
  assert(v1.some((v) => v.pfad === 'wand.h2' && v.grund === 'zu_lang'), name, 'zu langes Wand-H2 nicht gemeldet')

  const fehlt = klon(malerLandingSeed)
  fehlt.inhalte.hero.h1 = ''
  const v2 = pruefeMalerCopySlots(fehlt.inhalte)
  assert(v2.some((v) => v.pfad === 'hero.h1' && v.grund === 'fehlt'), name, 'fehlender Pflicht-Slot nicht gemeldet')
}

/* ---------- 5. Asset-Slots (27 = 21 GaLaBau-Form + 6 Galerie) ---------- */
{
  const name = 'asset-slots'
  assert(Object.keys(MALER_ASSET_SLOTS).length === 27, name, `Slot-Anzahl ${Object.keys(MALER_ASSET_SLOTS).length} ≠ 27`)
  assert(MALER_ASSET_SLOTS.ba_before.pair_with === 'ba_after', name, 'ba_before ohne pair_with')
  assert(MALER_ASSET_SLOTS.hero_video.fallback === 'hero_bg', name, 'hero_video ohne Fallback')
  for (const g of ['gal_01', 'gal_02', 'gal_03', 'gal_04', 'gal_05', 'gal_06']) {
    assert(MALER_ASSET_SLOTS[g]?.scene_typ === 'galerie' && MALER_ASSET_SLOTS[g]?.pflicht === false, name, `Galerie-Slot ${g} fehlt/falsch`)
  }
  assert(malerSlotKeyAusDateiname('hero-bg.jpg') === 'hero_bg', name, 'Dateinamen-Mapping hero-bg.jpg')
  assert(malerSlotKeyAusDateiname('gal-01.jpg') === 'gal_01', name, 'Dateinamen-Mapping gal-01.jpg')
  assert(malerSlotKeyAusDateiname('unbekannt.jpg') === null, name, 'unbekannter Dateiname nicht null')
  // WhatsApp-Nummer rein mechanisch (NIE LLM)
  assert(malerWhatsappNummer('0541 000000') === '49541000000', name, 'WhatsApp-Ableitung 0541 000000 falsch')
  assert(malerWhatsappNummer('+49 541 12 34 56') === '49541123456', name, 'WhatsApp-Ableitung +49-Format falsch')
}

/* ---------- 6. Stresstest: 3 fiese Datensätze ---------- */
{
  // (a) sehr langer Firmenname
  const name = 'stress-langer-name'
  const lang = klon(malerLandingSeed)
  lang.meta.firma = 'Maler- und Lackierbetrieb Voss-Brinkmann & Söhne Meisterbetrieb für Wand- und Fassadengestaltung GmbH & Co. KG'
  const html = renderMalerLanding(lang)
  pruefeGrundregeln(name, html)
  assert(html.includes('Voss-Brinkmann &amp; Söhne Meisterbetrieb für Wand- und Fassadengestaltung GmbH &amp; Co. KG'), name, 'langer Firmenname nicht verbatim')
  assert(html.includes('"name":"Maler- und Lackierbetrieb Voss-Brinkmann & Söhne'), name, 'langer Firmenname fehlt im JSON-LD')
}
{
  // (b) nur 3 Leistungen (Details schrumpfen mit — Unterseiten bleiben konsistent)
  const name = 'stress-3-leistungen'
  const drei = klon(malerLandingSeed)
  drei.inhalte.leistungen.karten = drei.inhalte.leistungen.karten.slice(0, 3)
  drei.inhalte.leistung_details = drei.inhalte.leistung_details?.slice(0, 3)
  drei.funnel.leistungen = drei.funnel.leistungen?.slice(0, 3)
  const html = renderMalerLanding(drei)
  pruefeGrundregeln(name, html)
  assert(pruefeMalerCopySlots(drei.inhalte).length === 0, name, '3 Leistungen melden falschen Copy-Verstoß')
  // Entfallene Leistung → Unterseite 404, verbliebene rendert
  assert(renderMalerUnterseite(drei, 'leistungen/spachteltechnik') === null, name, 'entfallene Leistung rendert noch (kein 404)')
  assert(renderMalerUnterseite(drei, 'leistungen/innenanstrich') !== null, name, 'verbliebene Leistung rendert nicht')
}
{
  // (c) Stadt mit Bindestrich — auch in JSON-LD und Unterseiten-H1
  const name = 'stress-bindestrich-stadt'
  const stadt = klon(malerLandingSeed)
  stadt.meta.ort = 'Castrop-Rauxel'
  const html = renderMalerLanding(stadt)
  pruefeGrundregeln(name, html)
  assert(html.includes('Castrop-Rauxel'), name, 'Bindestrich-Stadt nicht verbatim')
  assert(html.includes('"addressLocality":"Castrop-Rauxel"'), name, 'Bindestrich-Stadt fehlt im JSON-LD')
  const seite = renderMalerUnterseite(stadt, 'leistungen/innenanstrich')
  assert(seite !== null && seite.includes('Innenanstrich in Castrop-Rauxel'), name, 'Unterseiten-H1 ohne Bindestrich-Stadt')
}

/* ---------- 7. Escaping ---------- */
{
  const name = 'escaping'
  const boese = klon(malerLandingSeed)
  boese.inhalte.hero.lead = 'Angriff <script>alert(1)</script> Ende'
  const html = renderMalerLanding(boese)
  assert(!html.includes('<script>alert(1)</script>'), name, 'Script-Injektion landet roh im HTML')
  assert(html.includes('&lt;script&gt;'), name, 'Injektion nicht escaped')
}

console.log(`\ntest:maler — ${geprueft} Prüfungen, ${fehler} Fehler`)
if (fehler > 0) process.exit(1)
