/**
 * Test Phase 3 — Generierung + Konsistenz-Validator (MVP_FINISH_PROMPT §4).
 * Läuft komplett offline (keine API-/DB-Aufrufe).
 *
 * Teil A — Städte-Blockliste: Wortgrenzen, Kundenstadt-Ausnahmen,
 *          Namensbestandteile (Frankfurt am Main ↔ Frankfurt (Oder)).
 * Teil B — Copy-Slot-Gates: Zod-Schema (Pflichtslots, Limits) und
 *          pruefeCopySlots (Stadt in H1 + SEO-Titel, Floskel-Blacklist).
 * Teil C — Konsistenz-Validator: JEDE Regel einmal gezielt ausgelöst
 *          und einmal bestanden (synthetisches HTML + Config).
 * Teil D — Subdomain-Slug (Umlaute, Sonderzeichen, Länge).
 *
 * Aufruf: npm run test:phase3
 */
import { findeFremdeStaedte, stadtBestandteile } from '../lib/generierung/staedte-blockliste'
import { baueCopySlotsSchema, pruefeCopySlots, enthaeltStadt, type CopySlots, type BusinessProfil } from '../lib/generierung/copy-slots'
import { validiereKonsistenz, reportAlsText } from '../lib/generierung/konsistenz-validator'
import { baueSubdomainSlug } from '../lib/generierung/lead-demo'
import { FLOSKEL_BLACKLIST } from '../lib/floskel-blacklist'
import type { FlagshipConfig } from '../lib/flagship/types'
import type { DemoAssetMeta } from '../lib/pipeline/generate-flagship-demo'

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
// Teil A — Städte-Blockliste
// ---------------------------------------------------------------------------
console.log('Teil A: Städte-Blockliste')

assert(
  findeFremdeStaedte('Unser Team fährt täglich nach Stuttgart.', 'Ludwigsburg').includes('Stuttgart'),
  'blockliste-treffer', 'Stuttgart muss als fremde Stadt erkannt werden'
)
assert(
  findeFremdeStaedte('Unser Hallenbad in Ludwigsburg.', 'Ludwigsburg').length === 0,
  'blockliste-wortgrenze', '"Halle" darf NICHT in "Hallenbad" matchen'
)
assert(
  findeFremdeStaedte('Ihr Malerbetrieb in Ludwigsburg.', 'Ludwigsburg').length === 0,
  'blockliste-kundenstadt', 'Die Kundenstadt selbst ist kein Verstoß'
)
assert(
  findeFremdeStaedte('Wir arbeiten in Frankfurt.', 'Frankfurt am Main').length === 0,
  'blockliste-bestandteil', '"Frankfurt" ist Bestandteil der Kundenstadt "Frankfurt am Main"'
)
assert(
  findeFremdeStaedte('Kunden aus Halle schätzen uns.', 'Halle (Saale)').length === 0,
  'blockliste-klammer', '"Halle" ist Bestandteil von "Halle (Saale)"'
)
assert(
  findeFremdeStaedte('Auch in Halle sind wir aktiv.', 'Ludwigsburg').some((s) => s.startsWith('Halle')),
  'blockliste-kernname', '"Halle (Saale)" muss auch als bloßes "Halle" gefunden werden'
)
assert(
  findeFremdeStaedte('KÖLN ist schön.', 'Ludwigsburg').includes('Köln'),
  'blockliste-case', 'Matching muss case-insensitiv sein'
)
assert(
  stadtBestandteile('Frankfurt am Main').includes('frankfurt') &&
    !stadtBestandteile('Frankfurt am Main').includes('am'),
  'bestandteile-fuellwoerter', 'Füllwörter (am/an/der) sind keine eigenständigen Bestandteile'
)

// ---------------------------------------------------------------------------
// Teil B — Copy-Slot-Gates
// ---------------------------------------------------------------------------
console.log('Teil B: Copy-Slot-Gates')

const profil: BusinessProfil = {
  firma: 'Glanzwerk Gebäudereinigung',
  brancheKey: 'reinigung',
  stadt: 'Ludwigsburg',
  telefon: '07141 123456',
  leistungen: ['Unterhaltsreinigung', 'Glasreinigung', 'Bauendreinigung'],
}

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
    empathie_headline: 'Wenn die Reinigung zur Nebensache wird, merkt man es zuerst im Eingang.',
    empathie_text: 'Fingerabdrücke an der Glastür, volle Papierkörbe, ein Geruch, der bleibt: Wer Kunden empfängt, kann sich das nicht leisten. Wir übernehmen die Routine, damit Ihr Team sich um die Arbeit kümmert.',
    leistungen_karten: [
      { titel: 'Unterhaltsreinigung', text: 'Regelmäßige Reinigung von Büro- und Praxisflächen nach abgestimmtem Leistungsverzeichnis.' },
      { titel: 'Glasreinigung', text: 'Fenster, Glastüren und Trennwände — streifenfrei, auf Wunsch mit Rahmen und Falz.' },
      { titel: 'Bauendreinigung', text: 'Besenrein war gestern: übergabefertige Flächen nach Umbau oder Neubau.' },
    ],
    faq_fragen: [
      { frage: 'Wie schnell können Sie starten?', antwort: 'Nach der Objektbesichtigung erhalten Sie ein Angebot, der Start ist meist innerhalb von zwei Wochen möglich.' },
      { frage: 'Bringen Sie Material und Geräte mit?', antwort: 'Ja, Reinigungsmittel und Geräte sind im Leistungsumfang enthalten.' },
      { frage: 'Was passiert bei Krankheit des Teams?', antwort: 'Vertretungen sind fest eingeplant, die Reinigung fällt nicht aus.' },
      { frage: 'Gibt es feste Ansprechpartner?', antwort: 'Ja, Sie haben eine feste Objektleitung mit direkter Durchwahl.' },
    ],
    conversion_headline: 'Angebot für Ihr Objekt in Ludwigsburg anfordern',
    conversion_lead: 'Kurze Besichtigung, klares Leistungsverzeichnis, fester Preis — melden Sie sich telefonisch oder über das Formular.',
    seo_titel: 'Gebäudereinigung Ludwigsburg — Glanzwerk',
    seo_beschreibung: 'Unterhalts-, Glas- und Bauendreinigung in Ludwigsburg: feste Teams, dokumentierte Qualität, klare Preise.',
    footer_beschreibung: 'Glanzwerk Gebäudereinigung — saubere Büros, Praxen und Objekte in Ludwigsburg.',
  }
}

const schema = baueCopySlotsSchema(profil.leistungen.length)
assert(schema.safeParse(gueltigeSlots()).success, 'zod-gueltig', 'Gültige Slots müssen das Schema passieren')

{
  const kaputt = gueltigeSlots() as Record<string, unknown>
  delete kaputt.seo_titel
  assert(!schema.safeParse(kaputt).success, 'zod-pflichtslot', 'Fehlender Pflichtslot muss abgelehnt werden')
}
{
  const kaputt = gueltigeSlots()
  kaputt.seo_titel = 'X'.repeat(61)
  assert(!schema.safeParse(kaputt).success, 'zod-limit [C-LIMITS]', 'Zeichenlimit (seo_titel > 60) muss abgelehnt werden')
}
{
  const kaputt = gueltigeSlots()
  kaputt.hero_chips = ['nur', 'zwei'] as unknown as CopySlots['hero_chips']
  assert(!schema.safeParse(kaputt).success, 'zod-anzahl', 'Falsche Chip-Anzahl muss abgelehnt werden')
}
{
  const kaputt = gueltigeSlots()
  kaputt.leistungen_karten = kaputt.leistungen_karten.slice(0, 2)
  assert(!schema.safeParse(kaputt).success, 'zod-leistungen', 'Kartenanzahl ≠ Leistungsanzahl muss abgelehnt werden')
}

assert(pruefeCopySlots(gueltigeSlots(), profil).length === 0, 'gate-bestanden', 'Gültige Slots dürfen keine Gate-Fehler haben')
{
  const kaputt = gueltigeSlots()
  kaputt.hero_headline_zeilen = ['Saubere Räume', 'für Ihr Unternehmen']
  const gefunden = pruefeCopySlots(kaputt, profil)
  assert(gefunden.some((f) => f.includes('Hero-Headline')), 'gate-stadt-h1 [C-STADT-H1]', 'Fehlende Stadt in H1 muss beanstandet werden')
}
{
  const kaputt = gueltigeSlots()
  kaputt.seo_titel = 'Gebäudereinigung vom Profi'
  assert(pruefeCopySlots(kaputt, profil).some((f) => f.includes('SEO-Titel')), 'gate-stadt-seo', 'Fehlende Stadt im SEO-Titel muss beanstandet werden')
}
{
  const kaputt = gueltigeSlots()
  kaputt.hero_lead = `Wir bieten ${FLOSKEL_BLACKLIST[0]} für Ihr Objekt.`
  assert(pruefeCopySlots(kaputt, profil).some((f) => f.includes('Floskel')), 'gate-floskel [R-FLOSKEL]', `Floskel "${FLOSKEL_BLACKLIST[0]}" muss beanstandet werden`)
}
assert(enthaeltStadt('Willkommen in [[Ludwigsburg]]', 'Ludwigsburg'), 'gate-highlight', 'Stadt in [[Highlight]] muss erkannt werden')

// ---------------------------------------------------------------------------
// Teil C — Konsistenz-Validator (jede Regel einmal Fail + gesamt Pass)
// ---------------------------------------------------------------------------
console.log('Teil C: Konsistenz-Validator')

const BILD = (nr: number) => `<img src="/assets/bild-${nr}.webp" alt="Teamarbeit im Objekt ${nr}" width="1600" height="900">`

function synthConfig(): FlagshipConfig {
  return {
    inhalte: {
      hero: { media: { datei: '/assets/bild-1.webp', breite: 1600, hoehe: 900 } },
      signature: {
        vorher: { datei: '/assets/bild-2.webp', breite: 1600, hoehe: 900 },
        nachher: { datei: '/assets/bild-3.webp', breite: 1600, hoehe: 900 },
      },
      ergebnisse: { variante: 'galerie', paare: [] },
      stimmen: { quotes: [] },
    },
  } as unknown as FlagshipConfig
}

const META: DemoAssetMeta = {
  hero: { id: 'a1', quelle: 'bank' },
  paar: { pair_id: 'p1', asset_ids: ['a2', 'a3'], quelle: 'bank' },
  fallback: false,
  warnungen: [],
} as unknown as DemoAssetMeta

const OK_HTML = `<html><body><h1>Reinigung in Ludwigsburg</h1>${BILD(1)}${BILD(2)}${BILD(3)}<a href="/kontakt">Kontakt</a></body></html>`

{
  const report = validiereKonsistenz(OK_HTML, synthConfig(), 'Ludwigsburg', META)
  assert(report.ok, 'validator-pass', `Sauberes HTML muss bestehen, aber: ${reportAlsText(report)}`)
}

function erwarteVerstoss(html: string, config: FlagshipConfig, regel: string, name: string, meta: DemoAssetMeta | null = META, echteBewertungen = false) {
  // null = "bewusst ohne Meta" (undefined würde den Default-Parameter ziehen)
  const report = validiereKonsistenz(html, config, 'Ludwigsburg', meta ?? undefined, { echteBewertungen })
  assert(report.verstoesse.some((v) => v.regel === regel), name, `Regel "${regel}" muss auslösen. Report: ${reportAlsText(report)}`)
}

erwarteVerstoss(OK_HTML.replace('Ludwigsburg</h1>', 'Ludwigsburg und München</h1>'), synthConfig(), 'fremde_stadt', 'validator-fremde-stadt')
{
  const c = synthConfig()
  ;(c.inhalte.hero.media as { datei?: string }).datei = undefined
  erwarteVerstoss(OK_HTML, c, 'pflicht_slot_leer', 'validator-pflicht-slot [C-SLOTS]')
}
erwarteVerstoss(OK_HTML + '<img src="" alt="Leeres Bild hier" width="10" height="10">', synthConfig(), 'leerer_src', 'validator-leerer-src')
erwarteVerstoss(OK_HTML + '<a href="#">Mehr</a>', synthConfig(), 'toter_link', 'validator-toter-link')
erwarteVerstoss(OK_HTML + '<p>M&amp;uuml;ll entsorgen</p>', synthConfig(), 'rohe_entities', 'validator-entities')
erwarteVerstoss(OK_HTML + '<p>Lorem ipsum dolor</p>', synthConfig(), 'lorem', 'validator-lorem')
erwarteVerstoss(OK_HTML + '<p>{{firma}}</p>', synthConfig(), 'token_rest', 'validator-token')
erwarteVerstoss(OK_HTML + '<img src="/assets/bild-4.webp" alt="" width="1600" height="900">', synthConfig(), 'img_alt', 'validator-img-alt')
erwarteVerstoss(OK_HTML + '<img src="/assets/bild-5.webp" alt="Blick in den Flur">', synthConfig(), 'img_dimensionen', 'validator-img-dim [R-IMG-DIM]')
{
  const c = synthConfig()
  c.inhalte.hero.media.breite = 1000
  c.inhalte.hero.media.hoehe = 1000
  erwarteVerstoss(OK_HTML, c, 'aspect_ratio', 'validator-ratio')
}
{
  const c = synthConfig()
  c.inhalte.hero.media.breite = 1664 // 16:9 +4 % → innerhalb Toleranz
  c.inhalte.hero.media.hoehe = 900
  const report = validiereKonsistenz(OK_HTML, c, 'Ludwigsburg', META)
  assert(!report.verstoesse.some((v) => v.regel === 'aspect_ratio'), 'validator-ratio-toleranz', '±5 %-Toleranz muss kleine Abweichungen durchlassen')
}
erwarteVerstoss(OK_HTML + BILD(1), synthConfig(), 'doppeltes_bild', 'validator-doppelt [C-IMG-DUP]')
erwarteVerstoss(OK_HTML, synthConfig(), 'signature_paar', 'validator-paar-fehlt [C-PAAR]', null)
{
  const meta = JSON.parse(JSON.stringify(META)) as DemoAssetMeta
  ;(meta.paar as { pair_id?: string }).pair_id = undefined
  erwarteVerstoss(OK_HTML, synthConfig(), 'signature_paar', 'validator-paar-ohne-id', meta)
}
{
  const c = synthConfig()
  c.inhalte.stimmen.quotes = [{ text: 'Super!', autor: 'M. K.' }] as unknown as FlagshipConfig['inhalte']['stimmen']['quotes']
  erwarteVerstoss(OK_HTML, c, 'erfundene_bewertungen', 'validator-bewertungen [C-REVIEWS]')
  const report = validiereKonsistenz(OK_HTML, c, 'Ludwigsburg', META, { echteBewertungen: true })
  assert(!report.verstoesse.some((v) => v.regel === 'erfundene_bewertungen'), 'validator-echte-bewertungen', 'Mit echten Bewertungen ist die Sektion erlaubt')
}

// ---------------------------------------------------------------------------
// Teil D — Subdomain-Slug
// ---------------------------------------------------------------------------
console.log('Teil D: Subdomain-Slug')

assert(baueSubdomainSlug('Glanzwerk Gebäudereinigung', 'Ludwigsburg') === 'glanzwerk-gebaeudereinigung-ludwigsburg', 'slug-umlaute', `Umlaute transliterieren, bekommen: ${baueSubdomainSlug('Glanzwerk Gebäudereinigung', 'Ludwigsburg')}`)
assert(baueSubdomainSlug('Müller & Söhne GmbH', 'Köln') === 'mueller-soehne-gmbh-koeln', 'slug-sonderzeichen', `Sonderzeichen entfernen, bekommen: ${baueSubdomainSlug('Müller & Söhne GmbH', 'Köln')}`)
assert(baueSubdomainSlug('', '') === 'demo', 'slug-leer', 'Leere Eingabe → "demo"')
assert(baueSubdomainSlug('A'.repeat(80), 'B'.repeat(80)).length <= 50, 'slug-laenge', 'Slug maximal 50 Zeichen')

// ---------------------------------------------------------------------------
console.log(`\n${geprueft} Prüfungen, ${fehler} Fehler`)
if (fehler > 0) process.exit(1)
console.log('✓ Phase-3-Tests bestanden')
