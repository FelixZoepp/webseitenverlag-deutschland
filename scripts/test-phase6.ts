/**
 * Phase-6-Test (Qualitäts-CI): npx tsx scripts/test-phase6.ts
 *
 * Deckt §7 des MVP-Finish-Prompts ab — statische Regressions-Checks:
 *  - §7.1 Golden-Set: 10 Library-Firmen + 8 Flagship-Edge-Profile,
 *    CI-Lauf prüft Validator + Floskel-Blacklist + Stadt-Check offline
 *  - §7.2 Lighthouse-CI: 3 Golden-Demos gerendert, Budgets aus
 *    Masterprompt 2.1 (Perf ≥90 / SEO ≥95 / A11y ≥90, JS ≤30 KB), rot = rot
 *  - §7.3 Playwright-E2E: komplette Journey inkl. Chat-Edit → Publish →
 *    Rollback, Testmode-Guard (sk_test_)
 *  - §7.4 Fehler-Handling: Kill-Switch-ENV + lesbarer fehler_grund im Admin
 */
import { readFileSync } from 'fs'
import { join } from 'path'

let fehler = 0
function check(name: string, bedingung: boolean) {
  console.log(`${bedingung ? 'PASS' : 'FAIL'}  ${name}`)
  if (!bedingung) fehler++
}

const root = join(__dirname, '..')
const lese = (pfad: string) => readFileSync(join(root, pfad), 'utf8')

// ------------------------------------------------------------
// §7.1 Golden-Set: Firmen + Edge-Case-Profile
// ------------------------------------------------------------
{
  const goldenSet = JSON.parse(lese('test/golden_set.json')) as {
    firmen: { kategorie: string }[]
    profile: { edge: string; brancheKey: string; leistungen: string[] }[]
  }
  check('Golden-Set: 10 Firmen (5 website / 3 google / 2 nichts)',
    goldenSet.firmen.length === 10 &&
    goldenSet.firmen.filter((f) => f.kategorie === 'website').length === 5 &&
    goldenSet.firmen.filter((f) => f.kategorie === 'google').length === 3 &&
    goldenSet.firmen.filter((f) => f.kategorie === 'nichts').length === 2)
  check('Golden-Set: 8 Flagship-Profile', goldenSet.profile.length === 8)
  const edges = goldenSet.profile.map((p) => p.edge)
  check('Golden-Set: Pflicht-Edge-Cases (langer Name, 3/10 Leistungen, Umlaute, Bindestrich-Stadt, keine Bewertungen)',
    ['langer_name', 'drei_leistungen', 'zehn_leistungen', 'umlaute_name', 'bindestrich_stadt', 'keine_bewertungen']
      .every((e) => edges.includes(e)))
  const branchen = new Set(goldenSet.profile.map((p) => p.brancheKey))
  check('Golden-Set: zwei Branchen vertreten', branchen.has('reinigung') && branchen.has('restaurant_italienisch'))
  const anzahlen = goldenSet.profile.map((p) => p.leistungen.length)
  check('Golden-Set: Leistungs-Spannweite 3 bis 10', anzahlen.includes(3) && anzahlen.includes(10))

  const ci = lese('scripts/ci-golden-set.ts')
  check('Golden-CI: erzwingt Offline-Lauf (API-Keys gelöscht)',
    ci.includes('delete process.env.ANTHROPIC_API_KEY'))
  check('Golden-CI: Flagship-Kette (deterministische Slots → render → Validator)',
    ci.includes('deterministischeSlots') && ci.includes('renderFlagshipPage') &&
    ci.includes('validiereKonsistenz'))
  check('Golden-CI: Stadt-Check über Städte-Blockliste', ci.includes('findeFremdeStaedte'))
  check('Golden-CI: Floskel-Blacklist auf dem HTML', ci.includes('FLOSKEL_BLACKLIST'))
  check('Golden-CI: Orts-Varianten-Ersetzung gespiegelt (ortErsetzungsPaare)',
    ci.includes('ortErsetzungsPaare'))
  check('Golden-CI: prüft alle 8 Profile + Pflicht-Edges',
    ci.includes('profile.length === 8') && ci.includes('PFLICHT_EDGES'))

  const pipeline = lese('lib/pipeline/generate-flagship-demo.ts')
  check('Pipeline: ortErsetzungsPaare ersetzt auch Leerzeichen-/Basis-Variante des Vorlagen-Orts',
    pipeline.includes('export function ortErsetzungsPaare') &&
    pipeline.includes("replace(/-/g, ' ')") &&
    pipeline.includes('ortErsetzungsPaare(config.meta.ort, prospect.ort)'))

  const pkg = lese('package.json')
  check('Alias: npm run ci:golden-set registriert', pkg.includes('"ci:golden-set"'))
}

// ------------------------------------------------------------
// §7.2 Lighthouse-CI: Golden-Demos + Budgets
// ------------------------------------------------------------
{
  const renderScript = lese('scripts/ci-lighthouse-render.ts')
  check('Lighthouse: 3 Golden-Demos werden gerendert (je Kategorie eine)',
    renderScript.includes('golden-${kategorie}.html') &&
    renderScript.includes('golden_set.json'))

  const lhrc = JSON.parse(lese('lighthouserc.json')) as {
    ci: { assert: { assertions: Record<string, [string, { minScore?: number; maxNumericValue?: number }]> } }
  }
  const a = lhrc.ci.assert.assertions
  check('Lighthouse-Budget: Performance ≥ 0.90 (error)',
    a['categories:performance']?.[0] === 'error' && a['categories:performance']?.[1]?.minScore === 0.9)
  check('Lighthouse-Budget: SEO ≥ 0.95 (error)',
    a['categories:seo']?.[0] === 'error' && a['categories:seo']?.[1]?.minScore === 0.95)
  check('Lighthouse-Budget: Accessibility ≥ 0.90 (error)',
    a['categories:accessibility']?.[0] === 'error' && a['categories:accessibility']?.[1]?.minScore === 0.9)
  check('Lighthouse-Budget: JS ≤ 30 KB (error)',
    a['resource-summary:script:size']?.[0] === 'error' &&
    a['resource-summary:script:size']?.[1]?.maxNumericValue === 30720)

  const pkg = lese('package.json')
  check('Alias: ci:lighthouse = Render + lhci autorun',
    pkg.includes('ci-lighthouse-render.ts') && pkg.includes('@lhci/cli'))
}

// ------------------------------------------------------------
// §7.3 Playwright-E2E: komplette Journey
// ------------------------------------------------------------
{
  const journey = lese('e2e/journey.spec.ts')
  check('E2E: Testmode-Guard — Abbruch ohne sk_test_-Key',
    journey.includes("startsWith('sk_test_')"))
  check('E2E: Chat-Edit-Schritt vorhanden', journey.includes('11. Chat-Edit'))
  check('E2E: Publish-Schritt mit Live-Status', journey.includes('12. Publish') &&
    journey.includes("toBe('published')"))
  check('E2E: Rollback-Schritt über config_versions', journey.includes('13. Rollback') &&
    journey.includes("from('config_versions')") && journey.includes('/rollback'))
  const pkg = lese('package.json')
  check('Alias: npm run test:e2e registriert', pkg.includes('"test:e2e": "playwright test"'))
}

// ------------------------------------------------------------
// §7.4 Fehler-Handling: Kill-Switch + lesbare Job-Fails
// ------------------------------------------------------------
{
  const monitoring = lese('lib/monitoring.ts')
  check('Kill-Switch: GENERATION_KILL_SWITCH-ENV wird ausgewertet',
    monitoring.includes('GENERATION_KILL_SWITCH') && monitoring.includes('export function generierungGesperrt'))
  check('Kill-Switch: Job-Fails werden gemeldet (meldeJobFehler)',
    monitoring.includes('export async function meldeJobFehler'))

  const leadDemo = lese('lib/generierung/lead-demo.ts')
  check('Job-Fails: lesbarer Grund wird persistiert (fehler_grund)',
    leadDemo.includes("status: 'failed', fehler_grund: grund"))

  const adminLeads = lese('app/admin/leads/page.tsx')
  check('Admin: fehler_grund wird bei failed-Jobs angezeigt',
    adminLeads.includes('fehler_grund') && adminLeads.includes("'failed'"))
}

console.log(fehler === 0 ? '\nAlle Phase-6-Tests grün.' : `\n${fehler} Test(s) rot.`)
process.exit(fehler === 0 ? 0 : 1)
