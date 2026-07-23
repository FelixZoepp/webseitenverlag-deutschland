/**
 * B-13 — CI-Vollständigkeit: npx tsx scripts/test-ci-workflow.ts
 *
 * Verhinderungs-Regel: Eine neue test:*-Suite in package.json, die NICHT im
 * CI-Workflow steht, ist ein FAIL. So kann keine Verhinderungs-Regel aus dem
 * FEHLERJOURNAL wieder "nur lokal" existieren (Wiederholungs-Verbot).
 * Zusätzlich: Lint, Typecheck, Golden-Set, npm audit und die Trigger
 * (push + pull_request) müssen im Workflow verankert sein.
 */
import { readFileSync } from 'fs'
import { join } from 'path'

let fehler = 0
function check(name: string, bedingung: boolean, detail?: string) {
  console.log(`${bedingung ? 'PASS' : 'FAIL'}  ${name}${!bedingung && detail ? ` — ${detail}` : ''}`)
  if (!bedingung) fehler++
}

const root = join(__dirname, '..')
const ci = readFileSync(join(root, '.github', 'workflows', 'ci.yml'), 'utf8')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  scripts: Record<string, string>
}

/** Suiten, die bewusst NICHT in der CI laufen — jede braucht einen Grund. */
const AUSNAHMEN: Record<string, string> = {
  'test:e2e': 'Playwright-Generalprobe braucht laufenden Server + Env-Keys (B-12, D-Ops)',
  'test:rls': 'braucht Live-Supabase mit Service-Role-Key (Zweitkunden-Beweis, manuell)',
}

const suiten = Object.keys(pkg.scripts).filter((s) => s.startsWith('test:'))
check('package.json hat test:*-Suiten', suiten.length > 0)

for (const suite of suiten) {
  if (AUSNAHMEN[suite]) {
    console.log(`SKIP  ${suite} — Ausnahme: ${AUSNAHMEN[suite]}`)
    continue
  }
  check(`CI führt ${suite} aus`, ci.includes(`npm run ${suite}`),
    `"npm run ${suite}" in .github/workflows/ci.yml eintragen oder Ausnahme mit Grund ergänzen`)
}

// Ausnahmen dürfen nicht veralten: Wer die Suite umbenennt/löscht, räumt hier auf.
for (const ausnahme of Object.keys(AUSNAHMEN)) {
  check(`Ausnahme "${ausnahme}" existiert noch in package.json`, suiten.includes(ausnahme),
    'Ausnahme in scripts/test-ci-workflow.ts entfernen')
}

check('CI: Lint', ci.includes('npm run lint'))
check('CI: Typecheck (tsc --noEmit)', ci.includes('npx tsc --noEmit'))
check('CI: Qualitäts-Abdeckung (check:quality)', ci.includes('npm run check:quality'))
check('CI: Golden-Set (ci:golden-set)', ci.includes('npm run ci:golden-set'))
check('CI: Lighthouse-Budgets (ci:lighthouse)', ci.includes('npm run ci:lighthouse'))
check('CI: npm audit auf Prod-Dependencies (High = rot)',
  ci.includes('npm audit') && ci.includes('--audit-level=high'))
check('CI: Trigger push', /on:\s*[\s\S]*?push:/.test(ci))
check('CI: Trigger pull_request', ci.includes('pull_request'))

console.log(fehler === 0 ? '\n✓ CI-Vollständigkeits-Suite bestanden (B-13).' : `\n✗ ${fehler} Fehler.`)
process.exit(fehler === 0 ? 0 : 1)
