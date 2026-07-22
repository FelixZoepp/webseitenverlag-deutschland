/**
 * CI-Check Golden-Set (Mission §12, Phase H + MVP-Finish §7.1):
 * npx tsx scripts/ci-golden-set.ts
 *
 * Teil 1 — Library (Mission §12): Generiert für alle 10 Golden-Set-Firmen
 * (test/golden_set.json, "firmen") eine Library-Demo — komplett OFFLINE über
 * den deterministischen Fallback-Pfad (keine API-Keys, kein Netz, kein
 * Supabase) — und prüft:
 *
 *  1. Schema:        alle Sektionen der Komposition haben Inhalte
 *  2. Floskel-Gate:  kein Blacklist-Treffer im generierten Content (§2)
 *  3. Stadt-im-Hero: der Ort der Firma steht im Hero-Block
 *  4. Zero-JS:       kein <script>, keine Fremd-CDNs für JS/CSS/Fonts (§2)
 *
 * Teil 2 — Flagship (MVP-Finish §7.1): Generiert alle 8 Edge-Case-Profile
 * ("profile": langer Name, 3/10 Leistungen, Umlaute/ß, Bindestrich-Stadt,
 * keine Bewertungen, zwei Branchen) über die Ein-Klick-Demo-Kette — offline
 * mit deterministischen Copy-Slots statt Claude — und prüft:
 *
 *  1. Copy-Gates:    Zod-Schema + Stadt in H1/SEO-Titel + Floskel-Blacklist
 *  2. Validator:     validiereKonsistenz (fremde Städte, Pflicht-Slots,
 *                    Bild-Attribute, Bewertungs-Regel, …) muss grün sein
 *  3. Stadt-Check:   Kundenstadt im HTML, keine fremde Top-200-Stadt
 *  4. CDN-Check:     keine externen Scripts/Styles/Fonts (inline erlaubt)
 *
 * Exit-Code ≠ 0 bei Verstoß → CI rot.
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import type { SupabaseClient } from '@supabase/supabase-js'
import { FLOSKEL_BLACKLIST, pruefeContentAufFloskeln } from '../lib/floskel-blacklist'
import { libraryPageKey, loadLibraryPage } from '../lib/library/load'
import { renderLibraryPage } from '../lib/library/render'
import type { Stil } from '../lib/library/types'
import { generateLibraryDemoConfig } from '../lib/pipeline/generate-library-content'
import type { ProspectData } from '../lib/pipeline/prospect-data'
import { FLAGSHIP_SEEDS } from '../lib/flagship/seeds'
import { renderFlagshipPage } from '../lib/flagship/render'
import type { FlagshipConfig, MediaSlot } from '../lib/flagship/types'
import {
  baueCopySlotsSchema,
  pruefeCopySlots,
  wendeCopySlotsAn,
  type BusinessProfil,
  type CopySlots,
} from '../lib/generierung/copy-slots'
import { validiereKonsistenz, reportAlsText } from '../lib/generierung/konsistenz-validator'
import { findeFremdeStaedte } from '../lib/generierung/staedte-blockliste'
import { ortErsetzungsPaare, type DemoAssetMeta } from '../lib/pipeline/generate-flagship-demo'

// ------------------------------------------------------------
// Offline erzwingen: der Lauf muss deterministisch sein
// ------------------------------------------------------------
delete process.env.ANTHROPIC_API_KEY
delete process.env.FIRECRAWL_API_KEY
delete process.env.GOOGLE_PLACES_API_KEY

/** Dummy-Client: jeder DB-Zugriff wirft → loadLibraryPage fällt auf Seeds zurück */
const offlineClient = {
  from() {
    throw new Error('offline — kein Supabase im Golden-Set-Check')
  },
} as unknown as SupabaseClient

// ------------------------------------------------------------
// Golden-Set laden
// ------------------------------------------------------------

interface GoldenFirma {
  platzhalter?: boolean
  kategorie: 'website' | 'google' | 'nichts'
  firma: string
  ort: string
  branche: string
  stil: Stil
  websiteUrl?: string | null
  telefon?: string | null
  email?: string | null
  notizen?: string | null
}

const goldenSetPfad = join(__dirname, '..', 'test', 'golden_set.json')
const goldenSet = JSON.parse(readFileSync(goldenSetPfad, 'utf-8')) as {
  firmen: GoldenFirma[]
  profile?: unknown[]
}

/**
 * ProspectData offline aus dem Golden-Set-Eintrag bauen — bewusst OHNE
 * collectProspectData (die würde bei websiteUrl echte HTTP-Requests machen).
 * Entspricht dem manuellen Fallback der Kette (§8: "Demo entsteht immer").
 */
function prospectAusEintrag(f: GoldenFirma): ProspectData {
  return {
    firma: f.firma,
    ort: f.ort,
    branche: f.branche,
    website: f.websiteUrl ?? null,
    telefon: f.telefon ?? null,
    email: f.email ?? null,
    adresse: null,
    gruendungsjahr: null,
    oeffnungszeiten: null,
    rating: null,
    reviewCount: null,
    bewertungen: [],
    websiteText: null,
    impressumText: null,
    logoUrl: null,
    bilder: [],
    notizen: f.notizen ?? null,
    quellen: ['manuell'],
  }
}

// ------------------------------------------------------------
// Checks
// ------------------------------------------------------------

let fehler = 0
function check(name: string, ok: boolean, detail?: string) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${!ok && detail ? ` — ${detail}` : ''}`)
  if (!ok) fehler++
}

/** Fremd-CDN-Muster für JS/CSS/Fonts (Bilder von Stock-Assets sind erlaubt) */
const CDN_MUSTER = [
  /<script\b/i,
  /<link[^>]+rel=["']stylesheet["']/i,
  /@import\s/i,
  /fonts\.googleapis\.com/i,
  /fonts\.gstatic\.com/i,
  /use\.typekit\.net/i,
  /cdn\.jsdelivr\.net/i,
  /cdnjs\.cloudflare\.com/i,
  /unpkg\.com/i,
]

async function pruefeFirma(f: GoldenFirma): Promise<void> {
  const label = `${f.firma} (${f.ort}, ${f.branche}/${f.stil}, ${f.kategorie})`
  const pageKey = libraryPageKey(f.branche, f.stil)

  const loaded = await loadLibraryPage(offlineClient, pageKey)
  check(`${label}: Komposition ${pageKey} geladen`, loaded !== null)
  if (!loaded) return
  check(`${label}: Seed-Fallback aktiv (offline)`, loaded.ausDb === false)

  const prospect = prospectAusEintrag(f)
  const config = await generateLibraryDemoConfig(prospect, loaded)

  // Determinismus: offline muss der Defaults-Generator laufen
  check(`${label}: Generator = defaults`, config.herkunft.generator === 'defaults')

  // 1. Schema: jede Sektion der Komposition hat nicht-leere Inhalte
  const fehlend = loaded.sections.filter((s) => {
    const inhalt = config.inhalte[s.section_type]
    return !inhalt || Object.keys(inhalt).length === 0
  })
  check(
    `${label}: alle ${loaded.sections.length} Sektionen befüllt`,
    fehlend.length === 0,
    `fehlend: ${fehlend.map((s) => s.section_type).join(', ')}`
  )

  // 2. Floskel-Blacklist auf dem gesamten Content
  const floskeln = pruefeContentAufFloskeln(config.inhalte)
  check(
    `${label}: keine Floskeln`,
    floskeln.length === 0,
    floskeln.map((x) => `${x.pfad}: "${x.floskel}"`).join('; ')
  )

  // 3. + 4. auf dem gerenderten HTML
  const html = renderLibraryPage(config, loaded.assets)

  const heroMatch = html.match(/<header class="hero">[\s\S]*?<\/header>/)
  check(`${label}: Hero-Block vorhanden`, heroMatch !== null)
  check(
    `${label}: Stadt "${f.ort}" im Hero`,
    heroMatch !== null && heroMatch[0].includes(f.ort)
  )

  const cdnTreffer = CDN_MUSTER.filter((m) => m.test(html))
  check(
    `${label}: kein <script>/keine Fremd-CDNs`,
    cdnTreffer.length === 0,
    cdnTreffer.map(String).join(', ')
  )
}

// ------------------------------------------------------------
// Teil 2 — Flagship-Profile (MVP-Finish §7.1)
// ------------------------------------------------------------

interface GoldenProfil extends BusinessProfil {
  edge: string
  notizen?: string
}

/** Pflicht-Edge-Cases aus §7.1 — jeder muss im Golden-Set vertreten sein */
const PFLICHT_EDGES = [
  'langer_name',
  'drei_leistungen',
  'zehn_leistungen',
  'umlaute_name',
  'bindestrich_stadt',
  'keine_bewertungen',
] as const

/**
 * Fremd-CDN-Muster für Flagship-Seiten: inline <script>/<style> ist Teil der
 * Engine (Slider, Ablauf) — verboten sind nur EXTERNE Quellen.
 */
const FLAGSHIP_CDN_MUSTER = [
  /<script[^>]+src=["']https?:\/\//i,
  /<link[^>]+href=["']https?:\/\/[^"']*["'][^>]*rel=["']stylesheet["']/i,
  /<link[^>]+rel=["']stylesheet["'][^>]*href=["']https?:\/\//i,
  /@import\s+url\(\s*["']?https?:\/\//i,
  /fonts\.googleapis\.com/i,
  /fonts\.gstatic\.com/i,
  /use\.typekit\.net/i,
  /cdn\.jsdelivr\.net/i,
  /cdnjs\.cloudflare\.com/i,
  /unpkg\.com/i,
]

/** Rekursive String-Ersetzung — Spiegel von ersetzeUeberall (generate-flagship-demo.ts) */
function ersetzePaare<T>(wert: T, paare: [string, string][]): T {
  if (typeof wert === 'string') {
    let s: string = wert
    for (const [alt, neu] of paare) s = s.split(alt).join(neu)
    return s as T
  }
  if (Array.isArray(wert)) return wert.map((v) => ersetzePaare(v, paare)) as T
  if (wert && typeof wert === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(wert)) out[k] = ersetzePaare(v, paare)
    return out as T
  }
  return wert
}

/**
 * Offline-Spiegel von personalisiereFlagshipConfig: Seed-Vorlage klonen,
 * Firma/Ort/Telefon ersetzen, Lokal-Chips umschreiben, Stimmen leeren
 * (Formular liefert keine echten Bewertungen — wie lead-demo.ts §4.3).
 */
function personalisiereOffline(profil: GoldenProfil): FlagshipConfig {
  const vorlage = FLAGSHIP_SEEDS[profil.brancheKey]
  if (!vorlage) throw new Error(`Kein Flagship-Seed für Branche "${profil.brancheKey}"`)

  const config = structuredClone(vorlage)
  const paare: [string, string][] = []
  if (config.meta.firma && config.meta.firma !== profil.firma) {
    paare.push([config.meta.firma, profil.firma])
  }
  if (config.meta.ort && config.meta.ort !== profil.stadt) {
    paare.push(...ortErsetzungsPaare(config.meta.ort, profil.stadt))
  }
  if (profil.telefon && config.meta.telefon && config.meta.telefon !== profil.telefon) {
    paare.push([config.meta.telefon, profil.telefon])
  }
  config.inhalte = ersetzePaare(config.inhalte, paare)
  config.funnel = ersetzePaare(config.funnel, paare)

  const vorlagenOrt = vorlage.meta.ort || ''
  config.meta = { ...config.meta, firma: profil.firma, ort: profil.stadt, telefon: profil.telefon }
  if (
    config.inhalte.lokal.variante === 'bezirke' &&
    vorlagenOrt &&
    profil.stadt.toLowerCase() !== vorlagenOrt.toLowerCase()
  ) {
    config.inhalte.lokal.chips = [profil.stadt, `${profil.stadt} und Umgebung`, `Großraum ${profil.stadt}`]
    if (config.inhalte.lokal.note) {
      config.inhalte.lokal.note = config.inhalte.lokal.note.split(vorlagenOrt).join(profil.stadt)
    }
  }
  config.inhalte.stimmen.quotes = []
  return config
}

/**
 * Deterministische Copy-Slots statt Claude (offline, §7.1): erfüllt dieselben
 * Gates wie die echte Generierung — Stadt in H1 + SEO-Titel, Zeichenlimits,
 * exakt eine Karte pro Leistung, keine Floskeln.
 */
function deterministischeSlots(profil: GoldenProfil): CopySlots {
  const rein = profil.brancheKey === 'reinigung'
  const label = rein ? 'Gebäudereinigung' : 'Italienische Küche'
  return {
    hero_eyebrow: `${label} in ${profil.stadt}`,
    hero_headline_zeilen: [
      rein ? 'Saubere Räume für' : 'Ehrliche Küche für',
      `[[${profil.stadt}]] und Umgebung`,
    ],
    hero_lead: rein
      ? 'Feste Ansprechpartner, klare Abläufe und dokumentierte Qualität für Büro, Praxis und Objekt.'
      : 'Hausgemachte Pasta, Ofen statt Mikrowelle und ein Service, der Namen kennt statt Tischnummern.',
    hero_chips: rein
      ? ['Feste Teams', 'Klare Preise', 'Kurze Wege']
      : ['Frische Küche', 'Faire Preise', 'Echte Gastgeber'],
    fakten_punkte: rein
      ? [
          'Ein [[fester]] Ansprechpartner für alle Objekte',
          'Vertretung bei [[Ausfall]] fest eingeplant',
          'Dokumentierte [[Kontrollen]] nach jedem Durchgang',
          'Abrechnung ohne [[versteckte]] Posten',
        ]
      : [
          'Pasta wird [[täglich]] frisch gemacht',
          'Zutaten aus [[fester]] Lieferantenbeziehung',
          'Reservierung wird [[verbindlich]] bestätigt',
          'Karte wechselt mit der [[Saison]]',
        ],
    empathie_headline: rein
      ? 'Wenn die Reinigung zur Nebensache wird, merkt man es zuerst im Eingang.'
      : 'Ausgehen soll ein Abend sein, kein Abarbeiten einer Karte.',
    empathie_text: rein
      ? 'Fingerabdrücke an der Glastür, volle Papierkörbe, ein Geruch, der bleibt: Wer Kunden empfängt, kann sich das nicht leisten. Wir übernehmen die Routine, damit Ihr Team sich um die Arbeit kümmert.'
      : 'Laute Räume, gehetzter Service, Teller wie überall: So verliert ein Abend seinen Wert. Bei uns bekommt er wieder Raum — mit einer Küche, die Zeit bekommt, und Gastgebern, die zuhören.',
    leistungen_karten: profil.leistungen.map((l) => ({
      titel: l,
      text: rein
        ? `${l} — sauber geplant, verlässlich ausgeführt und fair abgerechnet.`
        : `${l} — frisch zubereitet, ehrlich kalkuliert und mit Sorgfalt serviert.`,
    })),
    faq_fragen: rein
      ? [
          { frage: 'Wie schnell können Sie starten?', antwort: 'Nach der Objektbesichtigung erhalten Sie ein Angebot, der Start ist meist innerhalb von zwei Wochen möglich.' },
          { frage: 'Bringen Sie Material und Geräte mit?', antwort: 'Ja, Reinigungsmittel und Geräte sind im Leistungsumfang enthalten.' },
          { frage: 'Was passiert bei Krankheit des Teams?', antwort: 'Vertretungen sind fest eingeplant, die Reinigung fällt nicht aus.' },
          { frage: 'Gibt es feste Ansprechpartner?', antwort: 'Ja, Sie haben eine feste Objektleitung mit direkter Durchwahl.' },
        ]
      : [
          { frage: 'Brauche ich eine Reservierung?', antwort: 'Am Wochenende empfehlen wir sie dringend — unter der Woche findet sich meist auch spontan ein Tisch.' },
          { frage: 'Gibt es vegetarische Gerichte?', antwort: 'Ja, ein fester Teil der Karte ist vegetarisch, vieles davon auch vegan möglich.' },
          { frage: 'Kann ich bei Ihnen feiern?', antwort: 'Gern — sagen Sie uns bei der Reservierung, worum es geht, und wir bereiten den Tisch entsprechend vor.' },
          { frage: 'Nehmen Sie Kartenzahlung?', antwort: 'Ja, gängige Karten und kontaktloses Zahlen sind kein Problem.' },
        ],
    conversion_headline: rein
      ? `Jetzt Angebot für ${profil.stadt} anfordern`
      : `Jetzt Tisch in ${profil.stadt} reservieren`,
    conversion_lead: rein
      ? 'Kurze Besichtigung, klares Leistungsverzeichnis, fester Preis — melden Sie sich telefonisch oder über das Formular.'
      : 'Rufen Sie an oder nutzen Sie die Reservierungsseite — wir bestätigen Ihren Tisch umgehend.',
    seo_titel: `${label} ${profil.stadt} — ${rein ? 'Angebot' : 'Reservierung'}`,
    seo_beschreibung: rein
      ? `${label} in ${profil.stadt}: feste Ansprechpartner, klare Preise und verlässliche Termine.`
      : `${label} in ${profil.stadt}: hausgemachte Pasta, Ofenpizza und ein Abend mit Raum zum Genießen.`,
    footer_beschreibung: `${profil.firma} — ${label} in ${profil.stadt}.`,
  }
}

/**
 * Pflicht-Bild-Slots synthetisch befüllen — Spiegel von Phase 2 der
 * Asset-Generierung (generiereFlagshipDemo setzt dort die Bank-/KI-URLs).
 * Eindeutige Pfade (keine doppelten Bilder), 1600×900 = exakt 16:9.
 */
function fuelleAssetSlots(config: FlagshipConfig): void {
  const setze = (slot: MediaSlot, name: string) => {
    slot.datei = `/golden-assets/${name}.webp`
    slot.breite = 1600
    slot.hoehe = 900
  }
  setze(config.inhalte.hero.media, 'hero')
  setze(config.inhalte.signature.vorher, 'signature-vorher')
  setze(config.inhalte.signature.nachher, 'signature-nachher')
  config.inhalte.ergebnisse.paare?.forEach((p, i) => {
    setze(p.vorher, `ergebnis-${i}-vorher`)
    setze(p.nachher, `ergebnis-${i}-nachher`)
  })
}

/** Synthetisches Asset-Meta wie in test-phase3: Hero + Signature-Paar aus der Bank */
const OFFLINE_ASSET_META = {
  hero: { id: 'golden-hero', quelle: 'bank' },
  paar: { pair_id: 'golden-paar', asset_ids: ['golden-vorher', 'golden-nachher'], quelle: 'bank' },
  fallback: false,
  warnungen: [],
} as unknown as DemoAssetMeta

function pruefeProfil(profil: GoldenProfil): void {
  const label = `Profil ${profil.edge}: ${profil.firma} (${profil.stadt}, ${profil.brancheKey})`

  // 1. Copy-Gates: Zod-Schema + Stadt in H1/SEO-Titel + Floskel-Blacklist
  const slots = deterministischeSlots(profil)
  const schema = baueCopySlotsSchema(profil.leistungen.length)
  const parse = schema.safeParse(slots)
  check(`${label}: Copy-Slots passieren das Zod-Schema`, parse.success,
    parse.success ? undefined : JSON.stringify(parse.error.issues.slice(0, 3)))
  const gateFehler = pruefeCopySlots(slots, profil)
  check(`${label}: Copy-Gates (Stadt in H1/SEO, keine Floskeln)`, gateFehler.length === 0,
    gateFehler.join('; '))

  // 2. Personalisierung + Slots anwenden + rendern (wie lead-demo.ts, offline)
  let config = personalisiereOffline(profil)
  config = wendeCopySlotsAn(config, slots, profil)
  fuelleAssetSlots(config)
  const html = renderFlagshipPage(config, { demo: true, noindex: true })
  check(`${label}: Flagship-HTML gerendert`, html.length > 10_000, `${html.length} Zeichen`)

  // 3. Konsistenz-Validator (harte Regeln inkl. fremde Städte + Bewertungs-Regel)
  const report = validiereKonsistenz(html, config, profil.stadt, OFFLINE_ASSET_META, {
    echteBewertungen: false,
  })
  check(`${label}: Konsistenz-Validator grün`, report.ok, reportAlsText(report))

  // 4. Stadt-Check explizit: Kundenstadt im HTML, keine fremde Top-200-Stadt
  check(`${label}: Stadt "${profil.stadt}" im HTML`, html.includes(profil.stadt))
  const fremde = findeFremdeStaedte(html, profil.stadt)
  check(`${label}: keine fremden Städte`, fremde.length === 0, fremde.join(', '))

  // 4b. FEHLERJOURNAL J-001: Vorlagen-Firma/-Ort dürfen NIE im personalisierten
  // HTML auftauchen (verbatim-Ersetzung, keine erfundene Fremdmarke).
  const seed = FLAGSHIP_SEEDS[profil.brancheKey]
  const vorlagenFirma = seed?.meta.firma ?? ''
  if (vorlagenFirma && vorlagenFirma !== profil.firma) {
    const escaped = vorlagenFirma.replace(/&/g, '&amp;')
    check(`${label}: Vorlagen-Firma "${vorlagenFirma}" NICHT im HTML [J-001]`,
      !html.includes(vorlagenFirma) && !html.includes(escaped))
  }
  const vorlagenOrt = seed?.meta.ort ?? ''
  if (vorlagenOrt && vorlagenOrt !== profil.stadt) {
    check(`${label}: Vorlagen-Ort "${vorlagenOrt}" NICHT im HTML [J-001]`, !html.includes(vorlagenOrt))
  }

  // 5. Floskel-Blacklist auf dem fertigen HTML (Seed-Texte + Slots gemeinsam)
  const floskeln = FLOSKEL_BLACKLIST.filter((f) => html.toLowerCase().includes(f.toLowerCase()))
  check(`${label}: keine Floskeln im HTML`, floskeln.length === 0, floskeln.join('; '))

  // 6. Keine externen CDNs (inline Script/Style der Engine ist erlaubt)
  const cdnTreffer = FLAGSHIP_CDN_MUSTER.filter((m) => m.test(html))
  check(`${label}: keine Fremd-CDNs`, cdnTreffer.length === 0, cdnTreffer.map(String).join(', '))

  // 7. Edge-Case-spezifische Nachweise
  if (profil.edge === 'zehn_leistungen' || profil.edge === 'drei_leistungen') {
    check(
      `${label}: exakt ${profil.leistungen.length} Leistungs-Karten in der Config`,
      config.inhalte.leistungen.karten.length === profil.leistungen.length,
      `hat ${config.inhalte.leistungen.karten.length}`
    )
  }
  if (profil.edge === 'keine_bewertungen') {
    check(`${label}: Stimmen-Sektion leer (keine erfundenen Bewertungen)`,
      config.inhalte.stimmen.quotes.length === 0)
  }
}

// ------------------------------------------------------------
// Lauf
// ------------------------------------------------------------

async function main() {
  const firmen = goldenSet.firmen
  check('Golden-Set hat 10 Firmen', firmen.length === 10, `hat ${firmen.length}`)
  check(
    'Verteilung 5 website / 3 google / 2 nichts',
    firmen.filter((f) => f.kategorie === 'website').length === 5 &&
      firmen.filter((f) => f.kategorie === 'google').length === 3 &&
      firmen.filter((f) => f.kategorie === 'nichts').length === 2
  )

  const platzhalter = firmen.filter((f) => f.platzhalter).length
  if (platzhalter > 0) {
    console.log(
      `HINWEIS: ${platzhalter}/10 Einträge sind Platzhalter — echte Firmen eintragen (WARTELISTE.md)`
    )
  }

  for (const f of firmen) {
    await pruefeFirma(f)
  }

  // ------------------------------------------------------------
  // Teil 2 — Flagship-Golden-Set (§7.1)
  // ------------------------------------------------------------
  const profile = (goldenSet.profile ?? []) as GoldenProfil[]
  check('Flagship-Golden-Set hat 8 Profile', profile.length === 8, `hat ${profile.length}`)
  const fehlendeEdges = PFLICHT_EDGES.filter((e) => !profile.some((p) => p.edge === e))
  check('Alle Pflicht-Edge-Cases vertreten', fehlendeEdges.length === 0, fehlendeEdges.join(', '))
  const branchen = new Set(profile.map((p) => p.brancheKey))
  check(
    'Zwei Branchen vertreten (reinigung + restaurant_italienisch)',
    branchen.has('reinigung') && branchen.has('restaurant_italienisch'),
    Array.from(branchen).join(', ')
  )
  const anzahlen = profile.map((p) => p.leistungen.length)
  check(
    'Leistungs-Spannweite 3 bis 10 vertreten',
    anzahlen.includes(3) && anzahlen.includes(10),
    anzahlen.join(', ')
  )

  for (const p of profile) {
    pruefeProfil(p)
  }

  console.log('')
  if (fehler > 0) {
    console.error(`Golden-Set-Check FEHLGESCHLAGEN: ${fehler} Verstöße`)
    process.exit(1)
  }
  console.log(
    `Golden-Set-Check bestanden: ${firmen.length} Firmen (Library) + ${profile.length} Profile (Flagship), 0 Verstöße`
  )
}

main().catch((e) => {
  console.error('Golden-Set-Check abgebrochen:', e)
  process.exit(1)
})
