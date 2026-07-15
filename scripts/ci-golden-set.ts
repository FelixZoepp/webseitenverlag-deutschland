/**
 * CI-Check Golden-Set (Mission §12, Phase H): npx tsx scripts/ci-golden-set.ts
 *
 * Generiert für alle 10 Golden-Set-Firmen (test/golden_set.json) eine
 * Library-Demo — komplett OFFLINE über den deterministischen Fallback-Pfad
 * (keine API-Keys, kein Netz, kein Supabase) — und prüft:
 *
 *  1. Schema:        alle Sektionen der Komposition haben Inhalte
 *  2. Floskel-Gate:  kein Blacklist-Treffer im generierten Content (§2)
 *  3. Stadt-im-Hero: der Ort der Firma steht im Hero-Block
 *  4. Zero-JS:       kein <script>, keine Fremd-CDNs für JS/CSS/Fonts (§2)
 *
 * Exit-Code ≠ 0 bei Verstoß → CI rot.
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import type { SupabaseClient } from '@supabase/supabase-js'
import { pruefeContentAufFloskeln } from '../lib/floskel-blacklist'
import { libraryPageKey, loadLibraryPage } from '../lib/library/load'
import { renderLibraryPage } from '../lib/library/render'
import type { Stil } from '../lib/library/types'
import { generateLibraryDemoConfig } from '../lib/pipeline/generate-library-content'
import type { ProspectData } from '../lib/pipeline/prospect-data'

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
const goldenSet = JSON.parse(readFileSync(goldenSetPfad, 'utf-8')) as { firmen: GoldenFirma[] }

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

  console.log('')
  if (fehler > 0) {
    console.error(`Golden-Set-Check FEHLGESCHLAGEN: ${fehler} Verstöße`)
    process.exit(1)
  }
  console.log(`Golden-Set-Check bestanden: ${firmen.length} Firmen, 0 Verstöße`)
}

main().catch((e) => {
  console.error('Golden-Set-Check abgebrochen:', e)
  process.exit(1)
})
