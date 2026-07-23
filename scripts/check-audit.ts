/**
 * B-24 — Audit-Gate: npx tsx scripts/check-audit.ts
 *
 * Verhinderungs-Regel: High/Critical-Findings in Prod-Dependencies = FAIL.
 * Ausnahmen nur mit dokumentiertem Grund UND automatischem Veralterungs-Check:
 * Ist ein Ausnahme-Paket nicht mehr verwundbar, schlägt die Suite fehl, bis
 * die Ausnahme entfernt wird (keine stillen Dauer-Ausnahmen).
 */
import { execSync } from 'child_process'

/** Pakete mit akzeptiertem High-Finding — jede Ausnahme braucht Grund + Ausweg. */
const AUSNAHMEN: Record<string, string> = {
  next:
    'Alle Advisories erst in next@16 gefixt (Major-Breaking: async cookies()/params). ' +
    'Migration = eigene Entscheidung, siehe OPTIMIERUNGS_BACKLOG Nr. 7. ' +
    'ws (High) wurde gefixt; Rest-Risiko dokumentiert.',
  postcss:
    'Transitives Dependency von next@14 (postcss@8.4.31 gelockt). ' +
    'Fix erst in postcss@8.5.12+ — kommt automatisch mit next@16-Migration.',
}

let fehler = 0
function check(name: string, bedingung: boolean, detail?: string) {
  console.log(`${bedingung ? 'PASS' : 'FAIL'}  ${name}${!bedingung && detail ? ` — ${detail}` : ''}`)
  if (!bedingung) fehler++
}

let rohausgabe = ''
try {
  rohausgabe = execSync('npm audit --omit=dev --json', { encoding: 'utf8' })
} catch (e) {
  // npm audit beendet mit Exit 1, sobald Findings existieren — stdout trägt trotzdem das JSON.
  rohausgabe = (e as { stdout?: string }).stdout ?? ''
}

type Finding = { name: string; severity: string; range: string }
const bericht = JSON.parse(rohausgabe) as {
  vulnerabilities?: Record<string, Finding>
}
const findings = Object.values(bericht.vulnerabilities ?? {})

const hoch = findings.filter((f) => f.severity === 'high' || f.severity === 'critical')
const rest = findings.filter((f) => f.severity !== 'high' && f.severity !== 'critical')

for (const f of rest) {
  console.log(`INFO  ${f.name} (${f.severity}, ${f.range}) — unter Gate-Schwelle`)
}

for (const f of hoch) {
  if (AUSNAHMEN[f.name]) {
    console.log(`SKIP  ${f.name} (${f.severity}) — Ausnahme: ${AUSNAHMEN[f.name]}`)
    continue
  }
  check(`Kein ungeklärtes High/Critical-Finding: ${f.name}`, false,
    `${f.severity} in ${f.range} — fixen oder Ausnahme mit Grund in scripts/check-audit.ts`)
}

for (const paket of Object.keys(AUSNAHMEN)) {
  check(`Ausnahme "${paket}" ist noch nötig`, hoch.some((f) => f.name === paket),
    'Paket nicht mehr High/Critical — Ausnahme in scripts/check-audit.ts entfernen')
}

check('Gate gelaufen (npm audit --omit=dev)', rohausgabe.length > 0)

console.log(fehler === 0 ? '\n✓ Audit-Gate bestanden (B-24).' : `\n✗ ${fehler} Fehler.`)
process.exit(fehler === 0 ? 0 : 1)
