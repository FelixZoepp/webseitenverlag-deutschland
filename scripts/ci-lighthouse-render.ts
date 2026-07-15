/**
 * Lighthouse-CI Schritt 1 (Mission §12, Phase H): npx tsx scripts/ci-lighthouse-render.ts
 *
 * Rendert die Prüf-Seiten als statisches HTML nach .lighthouse/dist/:
 *   - 8 Bibliotheks-Kompositionen (4 Branchen × 2 Stile, Seed-Fallback)
 *   - 3 Golden-Demos (je eine Firma pro Kategorie website/google/nichts)
 *
 * Komplett OFFLINE wie ci-golden-set.ts (deterministischer Defaults-Pfad).
 * Schritt 2 ist `lhci autorun` (lighthouserc.json): serviert .lighthouse/dist
 * statisch und prüft die Budgets §2.1 — Perf ≥90, SEO ≥95, A11y ≥90 (Mobile),
 * JS ≤30 KB. Fremd-CDN-Check läuft hier hart mit (Build rot bei Treffer).
 */

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { SupabaseClient } from '@supabase/supabase-js'
import { libraryPageKey, loadLibraryPage } from '../lib/library/load'
import { renderLibraryPage } from '../lib/library/render'
import type { Stil } from '../lib/library/types'
import { generateLibraryDemoConfig } from '../lib/pipeline/generate-library-content'
import type { ProspectData } from '../lib/pipeline/prospect-data'

// Offline erzwingen — Lauf muss deterministisch sein
delete process.env.ANTHROPIC_API_KEY
delete process.env.FIRECRAWL_API_KEY
delete process.env.GOOGLE_PLACES_API_KEY

const offlineClient = {
  from() {
    throw new Error('offline — kein Supabase im Lighthouse-Render')
  },
} as unknown as SupabaseClient

const DIST = join(__dirname, '..', '.lighthouse', 'dist')

/** Fremd-CDN-Muster für JS/CSS/Fonts (wie ci-golden-set; Stock-Bilder erlaubt) */
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

function prospect(firma: string, ort: string, branche: string, extra?: Partial<ProspectData>): ProspectData {
  return {
    firma,
    ort,
    branche,
    website: null,
    telefon: null,
    email: null,
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
    notizen: null,
    quellen: ['manuell'],
    ...extra,
  }
}

/** 8 Kompositionen: je Branche×Stil eine feste Beispiel-Firma */
const KOMPOSITIONEN: { branche: string; stil: Stil; firma: string; ort: string }[] = [
  { branche: 'Handwerk', stil: 'klar', firma: 'Sanitär Beispielmann', ort: 'Leipzig' },
  { branche: 'Handwerk', stil: 'warm', firma: 'Tischlerei Holzweg', ort: 'Oldenburg' },
  { branche: 'Gastronomie', stil: 'klar', firma: 'Ristorante Esempio', ort: 'Fürth' },
  { branche: 'Gastronomie', stil: 'warm', firma: 'Gasthaus Beispiellinde', ort: 'Bamberg' },
  { branche: 'Friseur', stil: 'klar', firma: 'Haarstudio Schnittpunkt', ort: 'Zwickau' },
  { branche: 'Friseur', stil: 'warm', firma: 'Salon Beispielhaar', ort: 'Münster' },
  { branche: 'Gesundheit', stil: 'klar', firma: 'Praxis Dr. Beispiel', ort: 'Kassel' },
  { branche: 'Gesundheit', stil: 'warm', firma: 'Physiopraxis Rückenwind', ort: 'Gera' },
]

interface GoldenFirma {
  kategorie: 'website' | 'google' | 'nichts'
  firma: string
  ort: string
  branche: string
  stil: Stil
  telefon?: string | null
  email?: string | null
  notizen?: string | null
}

async function renderSeite(
  dateiname: string,
  branche: string,
  stil: Stil,
  p: ProspectData
): Promise<void> {
  const pageKey = libraryPageKey(branche, stil)
  const loaded = await loadLibraryPage(offlineClient, pageKey)
  if (!loaded) throw new Error(`Komposition ${pageKey} nicht gefunden`)

  const config = await generateLibraryDemoConfig(p, loaded)
  const html = renderLibraryPage(config, loaded.assets)

  const cdnTreffer = CDN_MUSTER.filter((m) => m.test(html))
  if (cdnTreffer.length > 0) {
    throw new Error(`${dateiname}: Fremd-CDN/Script-Verstoß — ${cdnTreffer.map(String).join(', ')}`)
  }

  writeFileSync(join(DIST, dateiname), html, 'utf-8')
  console.log(`OK   ${dateiname} (${pageKey}, ${Math.round(html.length / 1024)} KB)`)
}

async function main() {
  rmSync(DIST, { recursive: true, force: true })
  mkdirSync(DIST, { recursive: true })

  // 8 Bibliotheks-Kompositionen
  for (const k of KOMPOSITIONEN) {
    const slug = libraryPageKey(k.branche, k.stil).replace(/\./g, '-')
    await renderSeite(`${slug}.html`, k.branche, k.stil, prospect(k.firma, k.ort, k.branche))
  }

  // 3 Golden-Demos: je eine Firma pro Kategorie aus test/golden_set.json
  const goldenSet = JSON.parse(
    readFileSync(join(__dirname, '..', 'test', 'golden_set.json'), 'utf-8')
  ) as { firmen: GoldenFirma[] }

  for (const kategorie of ['website', 'google', 'nichts'] as const) {
    const f = goldenSet.firmen.find((x) => x.kategorie === kategorie)
    if (!f) throw new Error(`Golden-Set: keine Firma der Kategorie ${kategorie}`)
    await renderSeite(
      `golden-${kategorie}.html`,
      f.branche,
      f.stil,
      prospect(f.firma, f.ort, f.branche, {
        telefon: f.telefon ?? null,
        email: f.email ?? null,
        notizen: f.notizen ?? null,
      })
    )
  }

  console.log(`\n11 Seiten gerendert → ${DIST}`)
}

main().catch((e) => {
  console.error('Lighthouse-Render abgebrochen:', e)
  process.exit(1)
})
