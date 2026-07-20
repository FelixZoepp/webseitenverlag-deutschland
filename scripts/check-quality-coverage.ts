/**
 * QA-Gate Baustein B: Coverage-Lint + Generator für QUALITY_CHECKLIST.md.
 *
 * Prüft für JEDE Regel aus lib/qa-gate/regeln.ts:
 *   1. implementiertIn existiert und enthält den marker (Default: Regel-ID)
 *   2. testRef existiert und enthält die Regel-ID
 *   3. QUALITY_CHECKLIST.md ist synchron zur Registry (kein Drift)
 *
 * Regel ohne Implementierung = Build-Fehler (exit 1). Läuft vor `next build`.
 *
 * Aufruf:
 *   npm run check:quality            → prüfen (CI/Build)
 *   npm run check:quality -- --write → QUALITY_CHECKLIST.md neu generieren
 */

import * as fs from 'fs'
import * as path from 'path'
import { QA_REGELN, type QaRegel } from '../lib/qa-gate/regeln'

const ROOT = path.join(__dirname, '..')
const CHECKLIST_PFAD = path.join(ROOT, 'QUALITY_CHECKLIST.md')
const SCHREIBEN = process.argv.includes('--write')

let fehler = 0
function melde(meldung: string) {
  fehler++
  console.error(`  ✗ ${meldung}`)
}

// ------------------------------------------------------------
// 1) Registry-Integrität: IDs eindeutig, Layer-Präfix konsistent
// ------------------------------------------------------------
const ids = new Set<string>()
for (const regel of QA_REGELN) {
  if (ids.has(regel.id)) melde(`Doppelte Regel-ID: ${regel.id}`)
  ids.add(regel.id)
  const praefix = regel.id.split('-')[0]
  const erwartet = { config: 'C', render: 'R', browser: 'B' }[regel.layer]
  if (praefix !== erwartet) {
    melde(`${regel.id}: Layer '${regel.layer}' erwartet Präfix '${erwartet}-', hat '${praefix}-'`)
  }
}

// ------------------------------------------------------------
// 2) Coverage: marker in implementiertIn, Regel-ID in testRef
// ------------------------------------------------------------
const dateiCache = new Map<string, string | null>()
function liesDatei(relativ: string): string | null {
  if (!dateiCache.has(relativ)) {
    const voll = path.join(ROOT, relativ)
    dateiCache.set(relativ, fs.existsSync(voll) ? fs.readFileSync(voll, 'utf8') : null)
  }
  return dateiCache.get(relativ) ?? null
}

for (const regel of QA_REGELN) {
  const impl = liesDatei(regel.implementiertIn)
  const marker = regel.marker ?? regel.id
  if (impl === null) {
    melde(`${regel.id}: Implementierungsdatei fehlt: ${regel.implementiertIn}`)
  } else if (!impl.includes(marker)) {
    melde(`${regel.id}: Marker '${marker}' nicht gefunden in ${regel.implementiertIn} — Regel ohne Implementierung.`)
  }

  const test = liesDatei(regel.testRef)
  if (test === null) {
    melde(`${regel.id}: Testdatei fehlt: ${regel.testRef}`)
  } else if (!test.includes(regel.id)) {
    melde(`${regel.id}: Regel-ID nicht in ${regel.testRef} referenziert — Regel ohne Test.`)
  }
}

// ------------------------------------------------------------
// 3) QUALITY_CHECKLIST.md generieren bzw. Drift prüfen
// ------------------------------------------------------------
function layerLabel(regel: QaRegel): string {
  return { config: 'Config', render: 'Render', browser: 'Browser' }[regel.layer]
}

function generiereChecklist(): string {
  const zeilen: string[] = [
    '# QUALITY_CHECKLIST — QA-Gate-Regeln',
    '',
    '> **Generiert aus `lib/qa-gate/regeln.ts` — NICHT von Hand editieren.**',
    '> Neu generieren: `npm run check:quality -- --write`',
    '>',
    '> Jede Regel wird per `scripts/check-quality-coverage.ts` gegen ihre',
    '> Implementierung (Marker) und ihren Test (Regel-ID) geprüft.',
    '> Regel ohne Implementierung = Build-Fehler.',
    '',
    `Stand: ${QA_REGELN.length} Regeln · Layer: Config (Generierung) → Render (HTML) → Browser (Playwright)`,
    '',
  ]

  const kategorien = Array.from(new Set(QA_REGELN.map((r) => r.kategorie)))
  for (const kategorie of kategorien) {
    zeilen.push(`## ${kategorie}`, '')
    zeilen.push('| ID | Regel | Layer | Autofix | Implementiert in | Test |')
    zeilen.push('|----|-------|-------|---------|------------------|------|')
    for (const regel of QA_REGELN.filter((r) => r.kategorie === kategorie)) {
      zeilen.push(
        `| \`${regel.id}\` | ${regel.beschreibung} | ${layerLabel(regel)} | ${regel.autofix} | \`${regel.implementiertIn}\` | \`${regel.testRef}\` |`
      )
    }
    zeilen.push('')
  }

  zeilen.push(
    '## Ablauf (Baustein A)',
    '',
    '1. **Config-Layer** greift während der Generierung (Copy-Gates, Konsistenz-Validator) — Fehler hier verhindern, dass eine Site überhaupt entsteht.',
    '2. **Render-Layer** prüft das fertige HTML ohne Browser (`lib/qa-gate/render-checks.ts`).',
    '3. **Browser-Layer** lädt die Seite in Playwright (mobil 390×844 + Desktop 1440×900), inkl. Screenshots (`lib/qa-gate/browser-checks.ts`).',
    '4. **Chirurgische Reparatur** (`lib/qa-gate/reparatur.ts`): max. 2 Runden, nie globale Regeneration — nur der betroffene Slot/Text wird ersetzt.',
    '5. Unreparierbar ⇒ `failed` mit menschenlesbarem Report (+ `manual_tasks` bei strukturellen Fehlern). Demos werden dann NICHT `demo_bereit`; Live-Sites bleiben live, Admin wird alarmiert.',
    ''
  )

  return zeilen.join('\n')
}

const soll = generiereChecklist()
if (SCHREIBEN) {
  fs.writeFileSync(CHECKLIST_PFAD, soll)
  console.log(`QUALITY_CHECKLIST.md neu generiert (${QA_REGELN.length} Regeln).`)
} else {
  const ist = fs.existsSync(CHECKLIST_PFAD) ? fs.readFileSync(CHECKLIST_PFAD, 'utf8') : null
  if (ist === null) {
    melde('QUALITY_CHECKLIST.md fehlt — mit `npm run check:quality -- --write` generieren.')
  } else if (ist !== soll) {
    melde('QUALITY_CHECKLIST.md ist nicht synchron zur Registry — mit `npm run check:quality -- --write` neu generieren.')
  }
}

// ------------------------------------------------------------
// Ergebnis
// ------------------------------------------------------------
if (fehler > 0) {
  console.error(`\ncheck-quality-coverage: ${fehler} Fehler — Build abgebrochen.`)
  process.exit(1)
}
console.log(`✓ check-quality-coverage: ${QA_REGELN.length} Regeln abgedeckt (Implementierung + Test + Checklist synchron).`)
