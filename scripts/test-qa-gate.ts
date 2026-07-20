/**
 * Test QA-Gate Baustein A — Render-Checks + chirurgische Selbstreparatur
 * (QA_GATE_PRODUKTSTUFEN_PROMPT, DoD A). Läuft komplett offline: kein
 * Browser, keine DB — Golden-Set mit präparierten Fehlern über injizierte
 * ReparaturDeps (rendere/scanne als Fakes, die die CONFIG inspizieren,
 * damit Reparaturen die Befunde tatsächlich auflösen).
 *
 * Teil A — pruefeRenderRegeln: sauberes HTML besteht; jede Regel wird
 *          einmal gezielt ausgelöst (R-VARIANTEN, R-CDN, R-JS-BUDGET,
 *          R-ALT, R-SEO-TITLE, R-JSONLD, R-OG, R-SITEMAP, C-VIDEO-*).
 * Teil B — Golden-Set Selbstreparatur via fuehreQaLaufAus:
 *          kaputtes Bild (B-IMG-LOAD), Slot-Rest (B-STUB), fremde Stadt
 *          (B-BLOCKLISTE), fehlender Alt (R-ALT), Video-Fallback,
 *          unreparierbar → failed mit lesbarem Report.
 * Teil C — Fehlerklassen: strukturelle Regeln (B-CLS, B-CONSOLE, B-KONTAKT,
 *          B-ASPECT, B-LINKS, B-FORM, B-MOTION, B-RECHT, B-NOINDEX) enden
 *          failed + manual_task; B-VIDEO-ATTR/B-VIDEO-LAZY → Video-Fallback.
 *
 * Aufruf: npm run test:qa-gate
 */
import { pruefeRenderRegeln, type RenderCheckKontext } from '../lib/qa-gate/render-checks'
import { fuehreQaLaufAus, type ReparaturDeps } from '../lib/qa-gate/reparatur'
import type { RegelErgebnis } from '../lib/qa-gate/regeln'
import type { FlagshipConfig } from '../lib/flagship/types'
import type { ApprovedAsset } from '../lib/assets/repository'
import type { BusinessProfil, CopySlots } from '../lib/generierung/copy-slots'
import { findeFremdeStaedte } from '../lib/generierung/staedte-blockliste'

let fehler = 0
let geprueft = 0

function assert(bedingung: boolean, name: string, meldung: string) {
  geprueft++
  if (!bedingung) {
    fehler++
    console.error(`  ✗ [${name}] ${meldung}`)
  }
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const SUPA = 'https://x.supabase.co/storage/v1/object/public/asset-bank'

const profil: BusinessProfil = {
  firma: 'Glanzwerk Gebäudereinigung',
  brancheKey: 'reinigung',
  stadt: 'Ludwigsburg',
  telefon: '07141 123456',
  leistungen: ['Unterhaltsreinigung', 'Glasreinigung', 'Bauendreinigung'],
}

function heroAsset(id: string, alt: string | null = null): ApprovedAsset {
  return {
    id,
    storage_path: `reinigung/hero/${id}.webp`,
    szene_typ: 'hero',
    branchen: ['reinigung'],
    style_tags: ['hell'],
    pair_id: null,
    breite: 1600,
    hoehe: 900,
    aspect_ratio: '16:9',
    alt_text_de: alt,
    quelle: 'test',
    created_at: '2026-01-01T00:00:00Z',
  }
}

const urlFuerAsset = (a: ApprovedAsset) => `${SUPA}/${a.storage_path}`

const KANDIDAT_A = heroAsset('kandidat-a', 'Frisch gereinigtes Großraumbüro mit Glasfront')
const KANDIDAT_B = heroAsset('kandidat-b', 'Reinigungsteam bei der Arbeit im Treppenhaus')
const KANDIDAT_C = heroAsset('kandidat-c', 'Glasreinigung an einer Bürofassade')
const ALLE_KANDIDATEN = [KANDIDAT_A, KANDIDAT_B, KANDIDAT_C]

/** Minimale, aber für COPY_FELDER/slotGruppen/wendeCopySlotsAn vollständige Config */
function baueConfig(): FlagshipConfig {
  return {
    engine: 'flagship',
    branche_key: 'reinigung',
    meta: {
      firma: profil.firma,
      ort: profil.stadt,
      telefon: profil.telefon,
      seo_titel: 'Gebäudereinigung Ludwigsburg — Glanzwerk',
      seo_beschreibung:
        'Unterhalts-, Glas- und Bauendreinigung in Ludwigsburg: feste Teams, klare Preise.',
    },
    inhalte: {
      hero: {
        eyebrow: 'Gebäudereinigung in Ludwigsburg',
        headline_zeilen: ['Saubere Räume für', '[[Ludwigsburg]] und Umgebung'],
        lead: 'Feste Ansprechpartner, klare Abläufe und dokumentierte Qualität für Büro und Praxis.',
        chips: ['Feste Teams', 'Kurze Wege', 'Klare Preise'],
        media: {
          label: 'Hero-Bild',
          datei: urlFuerAsset(KANDIDAT_A),
          alt: KANDIDAT_A.alt_text_de ?? '',
          breite: 1600,
          hoehe: 900,
        },
      },
      fakten: {
        punkte: [
          { text: 'Ein [[fester]] Ansprechpartner für alle Objekte' },
          { text: 'Vertretung bei [[Ausfall]] fest eingeplant' },
          { text: 'Dokumentierte [[Kontrollen]] nach jedem Durchgang' },
          { text: 'Abrechnung ohne [[versteckte]] Posten' },
        ],
      },
      empathie: {
        eyebrow: 'Verstanden',
        headline: 'Wenn die Reinigung zur Nebensache wird, merkt man es zuerst im Eingang.',
        text: 'Fingerabdrücke an der Glastür, volle Papierkörbe: Wer Kunden empfängt, kann sich das nicht leisten.',
      },
      leistungen: {
        stil: 'karten',
        karten: [
          { titel: 'Unterhaltsreinigung', text: 'Regelmäßige Reinigung von Büro- und Praxisflächen.' },
          { titel: 'Glasreinigung', text: 'Fenster und Glastüren — streifenfrei, mit Rahmen und Falz.' },
          { titel: 'Bauendreinigung', text: 'Übergabefertige Flächen nach Umbau oder Neubau.' },
        ],
      },
      faq: {
        fragen: [
          { frage: 'Wie schnell können Sie starten?', antwort: 'Meist innerhalb von zwei Wochen.' },
          { frage: 'Bringen Sie Material mit?', antwort: 'Ja, Mittel und Geräte sind enthalten.' },
        ],
      },
      conversion: {
        headline: 'Angebot für Ihr Objekt in Ludwigsburg anfordern',
        lead: 'Kurze Besichtigung, klares Leistungsverzeichnis, fester Preis.',
        telefon: profil.telefon,
      },
      footer: {
        beschreibung: 'Glanzwerk Gebäudereinigung — saubere Büros und Objekte in Ludwigsburg.',
      },
      ergebnisse: { paare: [], bilder: [] },
    },
    funnel: { modus: 'anfrage' },
  } as unknown as FlagshipConfig
}

/** Gültige Copy-Slots (identisch zum Muster aus test-phase3) */
function gueltigeSlots(): CopySlots {
  return {
    hero_eyebrow: 'Gebäudereinigung in Ludwigsburg',
    hero_headline_zeilen: ['Saubere Räume für', '[[Ludwigsburg]] und Umgebung'],
    hero_lead: 'Feste Ansprechpartner, klare Abläufe und dokumentierte Qualität für Büro und Praxis.',
    hero_chips: ['Feste Teams', 'Kurze Wege', 'Klare Preise'],
    fakten_punkte: [
      'Ein [[fester]] Ansprechpartner für alle Objekte',
      'Vertretung bei [[Ausfall]] fest eingeplant',
      'Dokumentierte [[Kontrollen]] nach jedem Durchgang',
      'Abrechnung ohne [[versteckte]] Posten',
    ],
    empathie_headline: 'Wenn die Reinigung zur Nebensache wird, merkt man es im Eingang.',
    empathie_text:
      'Fingerabdrücke an der Glastür, volle Papierkörbe, ein Geruch, der bleibt: Wer Kunden empfängt, kann sich das nicht leisten. Wir übernehmen die Routine.',
    leistungen_karten: [
      { titel: 'Unterhaltsreinigung', text: 'Regelmäßige Reinigung von Büro- und Praxisflächen nach Leistungsverzeichnis.' },
      { titel: 'Glasreinigung', text: 'Fenster, Glastüren und Trennwände — streifenfrei, mit Rahmen und Falz.' },
      { titel: 'Bauendreinigung', text: 'Übergabefertige Flächen nach Umbau oder Neubau.' },
    ],
    faq_fragen: [
      { frage: 'Wie schnell können Sie starten?', antwort: 'Der Start ist meist innerhalb von zwei Wochen möglich.' },
      { frage: 'Bringen Sie Material und Geräte mit?', antwort: 'Ja, Reinigungsmittel und Geräte sind enthalten.' },
      { frage: 'Was passiert bei Krankheit des Teams?', antwort: 'Vertretungen sind fest eingeplant.' },
      { frage: 'Gibt es feste Ansprechpartner?', antwort: 'Ja, eine feste Objektleitung mit Durchwahl.' },
    ],
    conversion_headline: 'Angebot für Ihr Objekt in Ludwigsburg anfordern',
    conversion_lead: 'Kurze Besichtigung, klares Leistungsverzeichnis, fester Preis — melden Sie sich.',
    seo_titel: 'Gebäudereinigung Ludwigsburg — Glanzwerk',
    seo_beschreibung: 'Unterhalts-, Glas- und Bauendreinigung in Ludwigsburg: feste Teams, klare Preise.',
    footer_beschreibung: 'Glanzwerk Gebäudereinigung — saubere Büros, Praxen und Objekte in Ludwigsburg.',
  }
}

// ---------------------------------------------------------------------------
// Teil A — Render-Checks (pruefeRenderRegeln)
// ---------------------------------------------------------------------------
console.log('Teil A: Render-Checks')

function baueHtml(overrides?: {
  title?: string
  description?: string
  ohneOgLocale?: boolean
  jsonLd?: string
  imgTag?: string
  extraKopf?: string
  extraBody?: string
}): string {
  const o = overrides ?? {}
  const img =
    o.imgTag ??
    `<img src="${SUPA}/reinigung/hero/kandidat-a.webp" alt="Team bei der Arbeit" width="1600" height="900">`
  return `<!DOCTYPE html><html lang="de"><head>
<title>${o.title ?? 'Gebäudereinigung Ludwigsburg — Glanzwerk'}</title>
<meta name="description" content="${o.description ?? 'Gebäudereinigung in Ludwigsburg mit festen Teams.'}">
<meta property="og:title" content="Gebäudereinigung Ludwigsburg">
<meta property="og:description" content="Feste Teams in Ludwigsburg.">
<meta property="og:type" content="website">
${o.ohneOgLocale ? '' : '<meta property="og:locale" content="de_DE">'}
<script type="application/ld+json">${o.jsonLd ?? '{"@context":"https://schema.org","@type":"LocalBusiness","name":"Glanzwerk"}'}</script>
${o.extraKopf ?? ''}
</head><body>
${img}
<script>console.log("init")</script>
${o.extraBody ?? ''}
</body></html>`
}

function kontext(mode: 'demo' | 'publish' = 'demo', config?: FlagshipConfig, videoBytes?: number | null): RenderCheckKontext {
  return { config: config ?? baueConfig(), stadt: profil.stadt, mode, videoBytes }
}

function ergebnisFuer(ergebnisse: RegelErgebnis[], regelId: string): RegelErgebnis | undefined {
  return ergebnisse.find((e) => e.regelId === regelId)
}

{
  const sauber = pruefeRenderRegeln(baueHtml(), kontext('demo'))
  assert(
    sauber.every((e) => e.ok),
    'render-sauber',
    `Sauberes HTML muss alle Render-Regeln bestehen: ${sauber.filter((e) => !e.ok).map((e) => e.regelId).join(', ')}`
  )
}
{
  const html = baueHtml({ imgTag: `<img src="${SUPA}/reinigung/hero/original_roh.webp" alt="Rohbild Test" width="1600" height="900">` })
  assert(ergebnisFuer(pruefeRenderRegeln(html, kontext()), 'R-VARIANTEN')?.ok === false, 'R-VARIANTEN', 'original_-Pfad muss beanstandet werden')
}
{
  const html = baueHtml({ extraKopf: '<script src="https://cdn.jsdelivr.net/npm/framework.js"></script>' })
  assert(ergebnisFuer(pruefeRenderRegeln(html, kontext()), 'R-CDN')?.ok === false, 'R-CDN', 'Fremder CDN-Host muss beanstandet werden')
}
{
  const html = baueHtml({ extraBody: `<script>${'x'.repeat(33 * 1024)}</script>` })
  assert(ergebnisFuer(pruefeRenderRegeln(html, kontext()), 'R-JS-BUDGET')?.ok === false, 'R-JS-BUDGET', 'Inline-JS > 32 kB muss beanstandet werden')
}
{
  const html = baueHtml({ imgTag: `<img src="${SUPA}/reinigung/hero/kandidat-a.webp" width="1600" height="900">` })
  assert(ergebnisFuer(pruefeRenderRegeln(html, kontext()), 'R-ALT')?.ok === false, 'R-ALT', 'Bild ohne alt-Text muss beanstandet werden')
}
{
  const html = baueHtml({ title: 'Gebäudereinigung vom Profi' })
  assert(ergebnisFuer(pruefeRenderRegeln(html, kontext()), 'R-SEO-TITLE')?.ok === false, 'R-SEO-TITLE', 'Title ohne Kundenstadt muss beanstandet werden')
}
{
  const html = baueHtml({ jsonLd: '{"kaputt": ' })
  assert(ergebnisFuer(pruefeRenderRegeln(html, kontext()), 'R-JSONLD')?.ok === false, 'R-JSONLD', 'Nicht parsebares JSON-LD muss beanstandet werden')
}
{
  const html = baueHtml({ ohneOgLocale: true })
  assert(ergebnisFuer(pruefeRenderRegeln(html, kontext()), 'R-OG')?.ok === false, 'R-OG', 'Fehlendes og:locale muss beanstandet werden')
}
{
  const ohneCanonical = pruefeRenderRegeln(baueHtml(), kontext('publish'))
  assert(ergebnisFuer(ohneCanonical, 'R-SITEMAP')?.ok === false, 'R-SITEMAP', 'Live-Site ohne canonical muss beanstandet werden')
  const mitCanonical = pruefeRenderRegeln(
    baueHtml({ extraKopf: '<link rel="canonical" href="https://glanzwerk.example.supabase.co/">' }),
    kontext('publish')
  )
  assert(ergebnisFuer(mitCanonical, 'R-SITEMAP')?.ok === true, 'R-SITEMAP-ok', 'Live-Site mit canonical muss bestehen')
}
{
  const config = baueConfig()
  config.inhalte.hero.video = { src: `${SUPA}/videos/hero.mp4` }
  const unbekannt = pruefeRenderRegeln(baueHtml(), kontext('demo', config, null))
  assert(ergebnisFuer(unbekannt, 'C-VIDEO-SIZE')?.ok === false, 'C-VIDEO-SIZE', 'Video mit unbekannter Größe (untranscodiert) muss beanstandet werden')
  const klein = pruefeRenderRegeln(baueHtml(), kontext('demo', config, 2 * 1024 * 1024))
  assert(ergebnisFuer(klein, 'C-VIDEO-SIZE')?.ok === true, 'C-VIDEO-SIZE-ok', 'Video ≤ 3 MB muss bestehen')
  const gross = pruefeRenderRegeln(baueHtml(), kontext('demo', config, 5 * 1024 * 1024))
  assert(ergebnisFuer(gross, 'C-VIDEO-SIZE')?.ok === false, 'C-VIDEO-SIZE-gross', 'Video > 3 MB muss beanstandet werden')
}
{
  const config = baueConfig()
  config.inhalte.hero.video = { src: `${SUPA}/videos/hero.mp4` }
  config.inhalte.hero.media.datei = undefined
  const ohneFallback = pruefeRenderRegeln(baueHtml(), kontext('demo', config, 1024))
  assert(ergebnisFuer(ohneFallback, 'C-VIDEO-FALLBACK')?.ok === false, 'C-VIDEO-FALLBACK', 'Video ohne poster und ohne Hero-Bild muss beanstandet werden')
}

// ---------------------------------------------------------------------------
// Teil B — Golden-Set Selbstreparatur (fuehreQaLaufAus mit Fakes)
// ---------------------------------------------------------------------------

async function main() {
  console.log('Teil B: Golden-Set Selbstreparatur')

interface Protokoll {
  defekteAssets: string[]
  manualTasks: { titel: string; beschreibung: string }[]
  feedbacks: string[]
}

function baueDeps(
  scanne: (html: string, config: FlagshipConfig) => RegelErgebnis[],
  overrides?: Partial<ReparaturDeps>
): { deps: ReparaturDeps; protokoll: Protokoll } {
  const protokoll: Protokoll = { defekteAssets: [], manualTasks: [], feedbacks: [] }
  const deps: ReparaturDeps = {
    seedKey: 'test-site',
    branche: 'reinigung',
    styleTags: ['hell'],
    profil,
    kandidaten: ALLE_KANDIDATEN,
    urlFuerAsset,
    generiereSlots: async (feedback) => {
      protokoll.feedbacks.push(feedback)
      return gueltigeSlots()
    },
    markiereAssetDefekt: async (assetUrl) => {
      protokoll.defekteAssets.push(assetUrl)
    },
    meldeManualTask: async (titel, beschreibung) => {
      protokoll.manualTasks.push({ titel, beschreibung })
    },
    rendere: () => '<html lang="de"></html>',
    scanne: async (html, config) => scanne(html, config),
    ...overrides,
  }
  return { deps, protokoll }
}

/** Copy-Texte der Config einsammeln (wie COPY_FELDER.lies, vereinfacht) */
function alleCopyTexte(config: FlagshipConfig): string[] {
  const i = config.inhalte
  return [
    config.meta.seo_titel ?? '',
    config.meta.seo_beschreibung ?? '',
    i.hero.eyebrow,
    ...i.hero.headline_zeilen,
    i.hero.lead,
    ...i.hero.chips,
    ...i.fakten.punkte.map((p) => p.text),
    i.empathie.headline,
    i.empathie.text,
    ...i.leistungen.karten.flatMap((k) => [k.titel, k.text]),
    ...i.faq.fragen.flatMap((f) => [f.frage, f.antwort]),
    i.conversion.headline,
    i.conversion.lead,
    i.footer.beschreibung,
  ]
}

// --- Fall 1: kaputtes Hero-Bild (B-IMG-LOAD) --------------------------------
{
  const kaputteUrl = urlFuerAsset(KANDIDAT_A)
  const scanne = (_html: string, config: FlagshipConfig): RegelErgebnis[] =>
    config.inhalte.hero.media.datei === kaputteUrl
      ? [{ regelId: 'B-IMG-LOAD', ok: false, selector: `img[src="${kaputteUrl}"]`, viewport: 'mobile' as const }]
      : []
  const { deps, protokoll } = baueDeps(scanne)
  const ergebnis = await fuehreQaLaufAus(baueConfig(), deps)
  assert(ergebnis.status === 'repaired', 'B-IMG-LOAD-repariert', `Kaputtes Bild muss repariert werden (ist: ${ergebnis.status})`)
  assert(ergebnis.runden <= 2, 'B-IMG-LOAD-runden', `Reparatur in ≤ 2 Runden (ist: ${ergebnis.runden})`)
  assert(
    ergebnis.config.inhalte.hero.media.datei !== kaputteUrl &&
      [urlFuerAsset(KANDIDAT_B), urlFuerAsset(KANDIDAT_C)].includes(ergebnis.config.inhalte.hero.media.datei ?? ''),
    'B-IMG-LOAD-ersatz',
    'Hero-Bild muss durch einen anderen approved Kandidaten ersetzt sein'
  )
  assert(protokoll.defekteAssets.includes(kaputteUrl), 'B-IMG-LOAD-defekt', 'Defektes Asset muss geflaggt werden')
  assert(
    ergebnis.reparaturen.some((r) => r.includes('hero/hero_img')),
    'B-IMG-LOAD-protokoll',
    'Reparatur-Protokoll muss den ersetzten Slot nennen'
  )
}

// --- Fall 2: Slot-Rest {{firma}} (B-STUB) — chirurgisch, Rest unverändert ---
{
  const start = baueConfig()
  start.inhalte.hero.lead = 'Wir sind {{firma}} und reinigen zuverlässig.'
  const scanne = (_html: string, config: FlagshipConfig): RegelErgebnis[] =>
    alleCopyTexte(config).some((t) => /\{\{/.test(t))
      ? [{ regelId: 'B-STUB', ok: false, gemessen: 'Slot-Rest {{firma}} im DOM' }]
      : []
  const { deps, protokoll } = baueDeps(scanne)
  const ergebnis = await fuehreQaLaufAus(start, deps)
  assert(ergebnis.status === 'repaired', 'B-STUB-repariert', `Slot-Rest muss repariert werden (ist: ${ergebnis.status})`)
  assert(!/\{\{/.test(ergebnis.config.inhalte.hero.lead), 'B-STUB-lead', 'Hero-Lead darf keinen Slot-Rest mehr enthalten')
  assert(
    JSON.stringify(ergebnis.config.inhalte.faq) === JSON.stringify(start.inhalte.faq) &&
      JSON.stringify(ergebnis.config.inhalte.empathie) === JSON.stringify(start.inhalte.empathie),
    'B-STUB-chirurgisch',
    'Nicht betroffene Felder (faq, empathie) müssen byte-identisch bleiben'
  )
  assert(
    protokoll.feedbacks.length === 1 && protokoll.feedbacks[0]!.includes('B-STUB'),
    'B-STUB-feedback',
    'Slot-Generator muss Fehler-Feedback mit Regel-ID erhalten'
  )
}

// --- Fall 3: fremde Stadt (B-BLOCKLISTE) — nur empathie neu -----------------
{
  const start = baueConfig()
  start.inhalte.empathie.text = 'Auch Kunden aus München vertrauen unserer Arbeit seit Jahren.'
  const scanne = (_html: string, config: FlagshipConfig): RegelErgebnis[] =>
    alleCopyTexte(config).some((t) => findeFremdeStaedte(t, profil.stadt).length > 0)
      ? [{ regelId: 'B-BLOCKLISTE', ok: false, gemessen: 'Fremde Stadt „München" im DOM' }]
      : []
  const { deps } = baueDeps(scanne)
  const ergebnis = await fuehreQaLaufAus(start, deps)
  assert(ergebnis.status === 'repaired', 'B-BLOCKLISTE-repariert', `Fremde Stadt muss repariert werden (ist: ${ergebnis.status})`)
  assert(
    findeFremdeStaedte(ergebnis.config.inhalte.empathie.text, profil.stadt).length === 0,
    'B-BLOCKLISTE-empathie',
    'Empathie-Text darf keine fremde Stadt mehr enthalten'
  )
  assert(
    JSON.stringify(ergebnis.config.inhalte.hero) === JSON.stringify(start.inhalte.hero),
    'B-BLOCKLISTE-chirurgisch',
    'Hero muss byte-identisch bleiben (nur empathie repariert)'
  )
}

// --- Fall 4: fehlender Alt-Text (R-ALT) -------------------------------------
{
  const start = baueConfig()
  start.inhalte.hero.media.alt = ''
  const scanne = (_html: string, config: FlagshipConfig): RegelErgebnis[] =>
    (config.inhalte.hero.media.alt ?? '').trim().length < 4
      ? [{ regelId: 'R-ALT', ok: false, gemessen: 'Hero-Bild ohne alt' }]
      : []
  const { deps } = baueDeps(scanne)
  const ergebnis = await fuehreQaLaufAus(start, deps)
  assert(ergebnis.status === 'repaired', 'R-ALT-repariert', `Fehlender Alt muss repariert werden (ist: ${ergebnis.status})`)
  assert(
    ergebnis.config.inhalte.hero.media.alt === KANDIDAT_A.alt_text_de,
    'R-ALT-datensatz',
    'Alt-Text muss aus dem Asset-Datensatz (alt_text_de) gezogen werden'
  )
}
{
  // Fallback: Bild-URL ohne bekannten Kandidaten → deterministischer Alt
  const start = baueConfig()
  start.inhalte.hero.media.datei = `${SUPA}/fremd/unbekannt.webp`
  start.inhalte.hero.media.alt = ''
  const scanne = (_html: string, config: FlagshipConfig): RegelErgebnis[] =>
    (config.inhalte.hero.media.alt ?? '').trim().length < 4
      ? [{ regelId: 'R-ALT', ok: false, gemessen: 'Hero-Bild ohne alt' }]
      : []
  const { deps } = baueDeps(scanne)
  const ergebnis = await fuehreQaLaufAus(start, deps)
  assert(
    ergebnis.status === 'repaired' &&
      ergebnis.config.inhalte.hero.media.alt === `Hero-Bild – ${profil.firma} in ${profil.stadt}`,
    'R-ALT-fallback',
    'Ohne Asset-Datensatz muss der deterministische Fallback aus Label + Firma greifen'
  )
}

// --- Fall 5: Video defekt → statischer Fallback + Admin-Task ----------------
for (const videoRegel of ['B-VIDEO-ATTR', 'B-VIDEO-LAZY'] as const) {
  const start = baueConfig()
  start.inhalte.hero.video = { src: `${SUPA}/videos/hero.mp4` }
  const scanne = (_html: string, config: FlagshipConfig): RegelErgebnis[] =>
    config.inhalte.hero.video
      ? [{ regelId: videoRegel, ok: false, gemessen: 'Video-Prüfung fehlgeschlagen' }]
      : []
  const { deps, protokoll } = baueDeps(scanne)
  const ergebnis = await fuehreQaLaufAus(start, deps)
  assert(
    ergebnis.status === 'repaired' && ergebnis.config.inhalte.hero.video === undefined,
    `${videoRegel}-fallback`,
    'Defektes Video muss entfernt werden (statisches Hero-Bild als Fallback)'
  )
  assert(
    protokoll.manualTasks.some((t) => t.titel.includes('Hero-Video defekt')),
    `${videoRegel}-task`,
    'Video-Task muss in der Admin-Queue landen'
  )
}

// --- Fall 6: unreparierbar → failed mit lesbarem Report ---------------------
{
  // Slot-Generator liefert weiterhin Stub-Texte → Reparatur greift nie
  const start = baueConfig()
  start.inhalte.hero.lead = 'Wir sind {{firma}} und reinigen.'
  const stubSlots = gueltigeSlots()
  stubSlots.hero_lead = 'Immer noch {{firma}} als Platzhalter.'
  const scanne = (_html: string, config: FlagshipConfig): RegelErgebnis[] =>
    alleCopyTexte(config).some((t) => /\{\{/.test(t))
      ? [{ regelId: 'B-STUB', ok: false, gemessen: 'Slot-Rest im DOM' }]
      : []
  const { deps } = baueDeps(scanne, { generiereSlots: async () => stubSlots })
  const ergebnis = await fuehreQaLaufAus(start, deps)
  assert(ergebnis.status === 'failed', 'failed-max-runden', `Nach 2 erfolglosen Runden muss der Lauf failed sein (ist: ${ergebnis.status})`)
  assert(ergebnis.runden === 2, 'failed-runden', `Es müssen genau 2 Runden versucht worden sein (ist: ${ergebnis.runden})`)
  assert(
    Boolean(ergebnis.fehler_grund?.includes('B-STUB')),
    'failed-report',
    'fehler_grund muss die Regel-ID lesbar nennen'
  )
}
{
  // Kein Ersatz-Kandidat in der asset_bank → failed, lesbarer Grund
  const kaputteUrl = urlFuerAsset(KANDIDAT_A)
  const scanne = (_html: string, config: FlagshipConfig): RegelErgebnis[] =>
    config.inhalte.hero.media.datei === kaputteUrl
      ? [{ regelId: 'B-IMG-LOAD', ok: false, selector: `img[src="${kaputteUrl}"]` }]
      : []
  const { deps } = baueDeps(scanne, { kandidaten: [KANDIDAT_A] })
  const ergebnis = await fuehreQaLaufAus(baueConfig(), deps)
  assert(ergebnis.status === 'failed', 'failed-kein-ersatz', `Ohne Ersatz-Kandidat muss der Lauf failed sein (ist: ${ergebnis.status})`)
  assert(
    ergebnis.reparaturen.some((r) => r.includes('kein Ersatz-Kandidat')),
    'failed-kein-ersatz-protokoll',
    'Protokoll muss den fehlenden Ersatz-Kandidaten nennen'
  )
}

// --- Fall 7: sauberer Lauf → passed, Config unverändert ---------------------
{
  const start = baueConfig()
  const { deps, protokoll } = baueDeps(() => [])
  const ergebnis = await fuehreQaLaufAus(start, deps)
  assert(ergebnis.status === 'passed' && ergebnis.runden === 0, 'passed-sauber', 'Fehlerfreier Lauf muss passed mit 0 Runden sein')
  assert(
    JSON.stringify(ergebnis.config) === JSON.stringify(start),
    'passed-unveraendert',
    'Config darf bei passed nicht verändert werden'
  )
  assert(protokoll.manualTasks.length === 0 && protokoll.feedbacks.length === 0, 'passed-still', 'Keine Tasks/Feedbacks bei passed')
}

// ---------------------------------------------------------------------------
// Teil C — Fehlerklassen: strukturelle Regeln → failed + manual_task
// ---------------------------------------------------------------------------
console.log('Teil C: Strukturelle Fehlerklassen')

const STRUKTURELLE_REGELN = [
  'B-CLS',
  'B-CONSOLE',
  'B-KONTAKT',
  'B-ASPECT',
  'B-LINKS',
  'B-FORM',
  'B-MOTION',
  'B-RECHT',
  'B-NOINDEX',
] as const

for (const regelId of STRUKTURELLE_REGELN) {
  const scanne = (): RegelErgebnis[] => [{ regelId, ok: false, gemessen: 'strukturell fehlgeschlagen' }]
  const { deps, protokoll } = baueDeps(scanne)
  const ergebnis = await fuehreQaLaufAus(baueConfig(), deps)
  assert(
    ergebnis.status === 'failed' && ergebnis.runden === 0,
    `${regelId}-failed`,
    `Strukturelle Regel ${regelId} darf NICHT gebastelt werden — failed ohne Reparatur-Runde (ist: ${ergebnis.status}/${ergebnis.runden})`
  )
  assert(
    Boolean(ergebnis.fehler_grund?.includes(regelId)),
    `${regelId}-report`,
    'fehler_grund muss die Regel-ID nennen'
  )
  assert(
    protokoll.manualTasks.some((t) => t.beschreibung.includes(regelId)),
    `${regelId}-task`,
    'Strukturelle Fails müssen einen manual_task auslösen'
  )
}

}

main()
  .then(() => {
    console.log(`\n${geprueft} Prüfungen, ${fehler} Fehler`)
    if (fehler > 0) process.exit(1)
    console.log('✓ QA-Gate-Tests bestanden')
  })
  .catch((e) => {
    console.error('Testlauf abgebrochen:', e)
    process.exit(1)
  })
