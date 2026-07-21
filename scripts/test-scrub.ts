/**
 * Premium — Stresstest Komposition „scrub-story-v1".
 *
 * Prüft: Seed rendert vollständig (Poster-Modus ohne frames), Scrub-Modus mit
 * frames (Canvas, Loader, Dots, Progress), Verbatim-Felder, Formularvertrag,
 * Copy-Slot-Limits, Asset-Slot-Mapping (10 Slots) und 3 fiese Datensätze:
 * sehr langer Firmenname · nur 3 Szenen · Stadt mit Bindestrich.
 *
 * Aufruf: npm run test:scrub
 */
import { renderFlagshipPage } from '../lib/flagship/render'
import { renderScrubStory } from '../lib/flagship/scrub/render'
import { scrubStorySeed } from '../lib/flagship/scrub/seed'
import { istScrubKomposition, type ScrubConfig } from '../lib/flagship/scrub/types'
import { pruefeScrubCopySlots, SCRUB_COPY_SLOTS } from '../lib/flagship/scrub/copy-slots'
import { SCRUB_ASSET_SLOTS, scrubSlotKeyAusDateiname } from '../lib/flagship/scrub/asset-slots'

let fehler = 0
let geprueft = 0

function assert(bedingung: boolean, name: string, meldung: string) {
  geprueft++
  if (!bedingung) {
    fehler++
    console.error(`  ✗ [${name}] ${meldung}`)
  }
}

function klon(config: ScrubConfig): ScrubConfig {
  return JSON.parse(JSON.stringify(config)) as ScrubConfig
}

function pruefeGrundregeln(name: string, html: string) {
  for (const m of ['ss-kopf', 'ss-kontakt', 'ss-fuss']) {
    assert(html.includes(`<!-- sektion:${m} -->`), name, `Sektionsmarker "${m}" fehlt`)
  }
  assert(!/\{\{[^}]*\}\}/.test(html), name, 'Template-Rest {{…}} im Output')
  assert(!html.includes('undefined'), name, '"undefined" im Output')
  assert(!html.includes('NaN'), name, '"NaN" im Output')
  assert(!html.includes('fonts.googleapis'), name, 'Google-Fonts-Referenz (nicht self-contained)')
  assert(!html.includes('cdn.'), name, 'CDN-Referenz (nicht self-contained)')
  assert(html.includes('prefers-reduced-motion'), name, 'prefers-reduced-motion fehlt')
  assert(html.includes('<html lang="de">'), name, 'lang="de" fehlt')
  assert(html.includes('inter-tight'), name, 'Self-hosted Font fehlt')
}

/* ---------- 1. Seed (ohne frames = statischer Poster-Modus) ---------- */
{
  const name = 'seed-statisch'
  const html = renderScrubStory(scrubStorySeed)
  pruefeGrundregeln(name, html)

  // Modus: ohne frames KEIN Canvas/Scrub-Markup, stattdessen Poster-Sektionen
  assert(html.includes('<!-- sektion:ss-story-statisch -->'), name, 'Statischer Modus fehlt')
  assert(!html.includes('<div class="ss-wrap" data-scrub'), name, 'Scrub-Wrap ohne frames gerendert')
  assert(!html.includes('<canvas'), name, 'Canvas ohne frames gerendert')
  const posterAnzahl = (html.match(/<section class="ss-szene-poster"/g) || []).length
  assert(posterAnzahl >= 5, name, `Poster-Sektionen ${posterAnzahl} < 5`)

  // Verbatim-Felder (NIE durch LLM)
  assert(html.includes('Solarflow'), name, 'Firma fehlt (verbatim)')
  assert(html.includes('Osnabrück'), name, 'Ort fehlt')
  assert(html.includes('0541 000000'), name, 'Telefon fehlt')

  // 5 Szenen-Titel + genau 1 h1 (Szene 1)
  for (const titel of [
    'Die Sonne. Unbegrenzt. Kostenlos.',
    'Hocheffiziente Module, die leuchten.',
    'Von Gleichstrom zu Haushaltsstrom.',
    'Dein Haus. Erleuchtet.',
    'Speicher, der für die Nacht bleibt.',
  ]) {
    assert(html.includes(titel), name, `Szenen-Titel "${titel}" fehlt`)
  }
  const h1Anzahl = (html.match(/<h1/g) || []).length
  assert(h1Anzahl === 1, name, `h1-Anzahl ${h1Anzahl} ≠ 1`)

  // Kontakt: Formularvertrag (Demo-Verhalten ohne submitZiel)
  assert(html.includes('data-kontakt-form'), name, 'Kontaktformular fehlt')
  assert(!html.includes('action='), name, 'Formular hat action ohne submitZiel')
  assert(html.includes('data-form-erfolg'), name, 'Erfolgs-Element fehlt')

  // SEO/Meta
  assert(html.includes('name="robots" content="noindex"'), name, 'noindex fehlt (Default für Demos)')
  assert(html.includes('application/ld+json'), name, 'JSON-LD fehlt')
  assert(html.includes('"telephone":"0541 000000"'), name, 'JSON-LD ohne Telefon')
  assert(!renderScrubStory(scrubStorySeed, { noindex: false }).includes('content="noindex"'), name, 'noindex:false wirkt nicht')

  // Dispatch + Guard
  assert(renderFlagshipPage(scrubStorySeed) === html, name, 'Dispatch renderFlagshipPage ≠ renderScrubStory')
  assert(istScrubKomposition(scrubStorySeed), name, 'Type-Guard erkennt Seed nicht')
  assert(!istScrubKomposition({ komposition: 'maler-landing-v1' }), name, 'Type-Guard matcht fremde Komposition')

  // Demo-Ribbon nur mit opts.demo
  assert(!html.includes('<div class="ss-ribbon"'), name, 'Ribbon ohne demo-Flag gerendert')
  assert(renderScrubStory(scrubStorySeed, { demo: true }).includes('<div class="ss-ribbon"'), name, 'Ribbon fehlt bei demo:true')

  // submitZiel: action + method am Formular
  const mitZiel = renderScrubStory(scrubStorySeed, { submitZiel: '/api/anfrage' })
  assert(mitZiel.includes('action="/api/anfrage" method="post"'), name, 'submitZiel wirkt nicht am Formular')
}

/* ---------- 2. Scrub-Modus (mit frames) ---------- */
{
  const name = 'scrub-modus'
  const mitFrames = klon(scrubStorySeed)
  mitFrames.inhalte.frames = {
    pfad_muster: '/media/pv/frames/frame-NUM.jpg',
    gesamt: 240,
    ziffern: 4,
    fps: 24,
    vorlade: 20,
  }
  const html = renderScrubStory(mitFrames)
  pruefeGrundregeln(name, html)

  assert(html.includes('<!-- sektion:ss-story -->'), name, 'Scrub-Wrap fehlt')
  assert(!html.includes('<!-- sektion:ss-story-statisch -->'), name, 'Statischer Modus trotz frames')
  assert(html.includes('<canvas class="ss-canvas"'), name, 'Canvas fehlt')
  assert(html.includes('data-ss-poster'), name, 'Poster-Fallback fehlt')
  assert(html.includes('data-ss-loader'), name, 'Loader fehlt')
  assert(html.includes('data-ss-progress'), name, 'Progress-Bar fehlt')
  assert(html.includes('data-ss-hint'), name, 'Scroll-Hint fehlt')
  const dotAnzahl = (html.match(/data-ss-dot/g) || []).length
  assert(dotAnzahl >= 5, name, `Dots ${dotAnzahl} < 5 (JS + Markup)`)

  // Szenen-Copy steht im SSR-HTML (SEO/no-JS), nicht erst per JS
  assert(html.includes('Die Sonne. Unbegrenzt. Kostenlos.'), name, 'Szenen-Copy fehlt im SSR-HTML')
  const sceneAnzahl = (html.match(/class="ss-scene"/g) || []).length
  assert(sceneAnzahl === 5, name, `Szenen ${sceneAnzahl} ≠ 5`)

  // Scroll-Gewichte landen als CSS-Variable + im JS
  assert(html.includes('--ss-gewicht:1.6'), name, 'Scroll-Gewicht Szene 1 fehlt')
  assert(html.includes('"gewichte":[1.6,1.4,1.3,1.4,1.8]'), name, 'Gewichte fehlen im JS')
  assert(html.includes('/media/pv/frames/frame-NUM.jpg'), name, 'Frame-Pfadmuster fehlt im JS')

  // JSON-Einbettung bricht nicht aus dem Script-Block aus
  const boese = klon(mitFrames)
  boese.inhalte.frames!.pfad_muster = '</script><script>alert(1)NUM'
  assert(!renderScrubStory(boese).includes('</script><script>alert(1)'), name, 'JSON-Escaping (\\u003c) fehlt')
}

/* ---------- 3. Copy-Slots ---------- */
{
  const name = 'copy-slots'
  assert(SCRUB_COPY_SLOTS.length >= 30, name, `Slot-Anzahl ${SCRUB_COPY_SLOTS.length} < 30`)
  assert(pruefeScrubCopySlots(scrubStorySeed.inhalte).length === 0, name, 'Seed verletzt eigene Slots')

  // zu lang → Verstoß
  const zuLang = klon(scrubStorySeed)
  zuLang.inhalte.szenen[0].titel = 'X'.repeat(500)
  const v1 = pruefeScrubCopySlots(zuLang.inhalte)
  assert(v1.some((v) => v.pfad === 'szenen[0].titel' && v.grund === 'zu_lang'), name, 'zu_lang nicht erkannt')

  // Pflicht fehlt → Verstoß
  const leer = klon(scrubStorySeed)
  leer.inhalte.kontakt.h2 = ''
  const v2 = pruefeScrubCopySlots(leer.inhalte)
  assert(v2.some((v) => v.pfad === 'kontakt.h2' && v.grund === 'fehlt'), name, 'fehlende Pflicht nicht erkannt')

  // weniger Szenen sind erlaubt (keine Phantom-Verstöße für Szene 4/5)
  const kurz = klon(scrubStorySeed)
  kurz.inhalte.szenen = kurz.inhalte.szenen.slice(0, 3)
  const v3 = pruefeScrubCopySlots(kurz.inhalte)
  assert(v3.length === 0, name, `3-Szenen-Config meldet ${v3.length} Phantom-Verstöße`)
}

/* ---------- 4. Asset-Slots ---------- */
{
  const name = 'asset-slots'
  const keys = Object.keys(SCRUB_ASSET_SLOTS)
  assert(keys.length === 10, name, `Slot-Anzahl ${keys.length} ≠ 10`)
  for (let n = 1; n <= 5; n++) {
    const p = SCRUB_ASSET_SLOTS[`poster_0${n}`]
    const c = SCRUB_ASSET_SLOTS[`clip_0${n}`]
    assert(!!p && p.pflicht !== false, name, `poster_0${n} fehlt oder nicht Pflicht`)
    assert(!!c && c.pflicht === false && c.fallback === `poster_0${n}`, name, `clip_0${n} ohne Poster-Fallback`)
    assert(c?.medium === 'video', name, `clip_0${n} nicht als Video markiert`)
  }
  assert(scrubSlotKeyAusDateiname('poster-01.jpg') === 'poster_01', name, 'Dateinamen-Mapping poster-01')
  assert(scrubSlotKeyAusDateiname('clip-05.mp4') === 'clip_05', name, 'Dateinamen-Mapping clip-05')
  assert(scrubSlotKeyAusDateiname('unbekannt.jpg') === null, name, 'unbekannter Dateiname nicht abgewiesen')
}

/* ---------- 5. Fiese Datensätze ---------- */
{
  const name = 'stress'
  // 5a: sehr langer Firmenname
  const lang = klon(scrubStorySeed)
  lang.meta.firma = 'Sonnenkraft & Söhne Photovoltaik-Meisterbetriebs-Gesellschaft für erneuerbare Energien mbH & Co. KG'
  const htmlLang = renderScrubStory(lang)
  pruefeGrundregeln(name, htmlLang)
  assert(htmlLang.includes('Sonnenkraft &amp; Söhne'), name, 'Langer Firmenname fehlt (escaped)')

  // 5b: nur 3 Szenen
  const drei = klon(scrubStorySeed)
  drei.inhalte.szenen = drei.inhalte.szenen.slice(0, 3)
  const htmlDrei = renderScrubStory(drei)
  pruefeGrundregeln(name, htmlDrei)
  const dreiPoster = (htmlDrei.match(/<section class="ss-szene-poster"/g) || []).length
  assert(dreiPoster >= 3 && dreiPoster < 5, name, `3-Szenen-Config rendert ${dreiPoster} Poster`)

  // 5c: Stadt mit Bindestrich + Telefon mit Sonderzeichen
  const stadt = klon(scrubStorySeed)
  stadt.meta.ort = 'Garmisch-Partenkirchen'
  stadt.meta.telefon = '+49 (0) 8821 / 12 34-56'
  const htmlStadt = renderScrubStory(stadt)
  pruefeGrundregeln(name, htmlStadt)
  assert(htmlStadt.includes('Garmisch-Partenkirchen'), name, 'Bindestrich-Stadt fehlt')
  assert(htmlStadt.includes('tel:+4908821123456'), name, 'tel:-Link nicht mechanisch bereinigt')
}

/* ---------- Ergebnis ---------- */
console.log(`\ntest:scrub — ${geprueft} Prüfungen, ${fehler} Fehler`)
if (fehler > 0) process.exit(1)
