/**
 * B-25 — Kosten-Cap + Rate-Limit: npx tsx scripts/test-kosten-cap.ts
 *
 * Zwei Teile:
 *  1. Unit-Tests der puren Schranken-Logik (lib/llm-schranke.ts) —
 *     deterministisch über injizierte Zeit, ohne DB/Env.
 *  2. Verhinderungs-Regel (Quelltext-Scan): Jede Route unter app/api, die
 *     eine LLM-/Generierungs-Bibliothek importiert, MUSS pruefeLlmSchranke()
 *     aufrufen. Eine neue teure Route ohne Gate ist ein FAIL — ein Amok-Loop
 *     wird so gestoppt, nicht nur gemeldet.
 */
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'
import { capErreicht, tagesCapCent, rateLimitUeberschritten } from '../lib/llm-schranke'

let fehler = 0
function check(name: string, bedingung: boolean, detail?: string) {
  console.log(`${bedingung ? 'PASS' : 'FAIL'}  ${name}${!bedingung && detail ? ` — ${detail}` : ''}`)
  if (!bedingung) fehler++
}

// ---- 1. Unit-Tests: capErreicht ---------------------------------------------

check('capErreicht: 4999 < 5000 → frei', capErreicht(4999, 5000) === false)
check('capErreicht: 5000 ≥ 5000 → gestoppt', capErreicht(5000, 5000) === true)
check('capErreicht: 5001 ≥ 5000 → gestoppt', capErreicht(5001, 5000) === true)
check('capErreicht: 0 bei Cap 1 → frei', capErreicht(0, 1) === false)

// ---- 1. Unit-Tests: tagesCapCent (Env-Override) -----------------------------

delete process.env.LLM_TAGES_CAP_CENT
check('tagesCapCent: Default 5000 (50 €/Tag)', tagesCapCent() === 5000)
process.env.LLM_TAGES_CAP_CENT = '2000'
check('tagesCapCent: Env-Override 2000 greift', tagesCapCent() === 2000)
process.env.LLM_TAGES_CAP_CENT = 'quatsch'
check('tagesCapCent: ungültiger Wert → Default', tagesCapCent() === 5000)
process.env.LLM_TAGES_CAP_CENT = '-5'
check('tagesCapCent: negativer Wert → Default', tagesCapCent() === 5000)
delete process.env.LLM_TAGES_CAP_CENT

// ---- 1. Unit-Tests: rateLimitUeberschritten (injizierte Zeit) ---------------

// Unter dem Limit: 3 Anfragen bei max 3 sind frei, die 4. wird abgelehnt.
check('rateLimit: 1. Anfrage frei', rateLimitUeberschritten('t:a', 3, 1000, 0) === false)
check('rateLimit: 2. Anfrage frei', rateLimitUeberschritten('t:a', 3, 1000, 10) === false)
check('rateLimit: 3. Anfrage frei', rateLimitUeberschritten('t:a', 3, 1000, 20) === false)
check('rateLimit: 4. Anfrage abgelehnt (Limit erreicht)', rateLimitUeberschritten('t:a', 3, 1000, 30) === true)

// Fenster-Ablauf: nach fensterMs sind alte Einträge weg → wieder frei.
check('rateLimit: nach Fenster-Ablauf wieder frei', rateLimitUeberschritten('t:a', 3, 1000, 1500) === false)

// Abgelehnte Anfragen verlängern das Fenster NICHT (kein Aussperr-Loop).
check('rateLimit: Erstanfrage frei (Schlüssel b)', rateLimitUeberschritten('t:b', 1, 1000, 0) === false)
check('rateLimit: Zweitanfrage abgelehnt', rateLimitUeberschritten('t:b', 1, 1000, 500) === true)
check(
  'rateLimit: abgelehnte Anfrage verlängert Fenster nicht',
  rateLimitUeberschritten('t:b', 1, 1000, 1050) === false,
  'Eintrag bei t=0 ist abgelaufen; die Ablehnung bei t=500 darf nicht zählen'
)

// Schlüssel sind isoliert: Limit auf b sperrt a nicht.
check('rateLimit: Schlüssel isoliert', rateLimitUeberschritten('t:c', 1, 1000, 0) === false)

// ---- 2. Verhinderungs-Regel: Quelltext-Scan über app/api -------------------

/** Import-Muster, die Token-/Generierungs-Kosten bedeuten. */
const KOSTEN_MUSTER = [
  '@anthropic-ai/sdk',
  '@/lib/claude',
  '@/lib/generate-site',
  '@/lib/generate-demo',
  'generate-flagship-demo',
  'generate-library-content',
  '@/lib/assets/pipeline',
  '@/lib/seo-plan',
]

/** Routen ohne pruefeLlmSchranke — jede braucht einen Grund + eigene Schranke. */
const AUSNAHMEN: Record<string, string> = {
  'app/api/cron/seo-plan/route.ts':
    'Cron-Route: istCronAutorisiert + generierungGesperrt (Kill-Switch) — von test-phase5 verankert',
}

const root = join(__dirname, '..')
const apiRoot = join(root, 'app', 'api')

function findeRouten(dir: string): string[] {
  const ergebnis: string[] = []
  for (const eintrag of readdirSync(dir)) {
    const pfad = join(dir, eintrag)
    if (statSync(pfad).isDirectory()) ergebnis.push(...findeRouten(pfad))
    else if (eintrag === 'route.ts') ergebnis.push(pfad)
  }
  return ergebnis
}

const routen = findeRouten(apiRoot)
let llmRouten = 0

for (const pfad of routen) {
  const rel = relative(root, pfad)
  const inhalt = readFileSync(pfad, 'utf8')
  // Reine Typ-Importe (import type …) kosten nichts — nicht mitzählen.
  const ohneTypImporte = inhalt
    .split('\n')
    .filter((zeile) => !/^\s*import\s+type\s/.test(zeile))
    .join('\n')
  const teuer = KOSTEN_MUSTER.some((m) => ohneTypImporte.includes(m))
  if (!teuer) continue
  llmRouten++

  if (AUSNAHMEN[rel]) {
    // Ausnahme darf nicht veralten: die eigene Schranke muss noch drinstehen.
    check(`AUSNAHME ${rel} hat eigene Schranke (generierungGesperrt)`, inhalt.includes('generierungGesperrt'),
      'Ausnahme entfernen oder pruefeLlmSchranke() einbauen')
    continue
  }
  check(`${rel} ruft pruefeLlmSchranke() auf`, inhalt.includes('pruefeLlmSchranke('),
    'LLM-Kosten ohne Gate — pruefeLlmSchranke() aus lib/llm-schranke.ts einbauen')
}

// Ausnahmen dürfen nicht auf gelöschte Dateien zeigen.
for (const ausnahme of Object.keys(AUSNAHMEN)) {
  check(`Ausnahme "${ausnahme}" existiert noch`, routen.some((p) => relative(root, p) === ausnahme),
    'Ausnahme in scripts/test-kosten-cap.ts entfernen')
}

// Sanity: Der Scan muss die bekannten LLM-Routen auch wirklich finden.
check(`Scan findet ≥ 10 LLM-Routen (gefunden: ${llmRouten})`, llmRouten >= 10,
  'Import-Muster in KOSTEN_MUSTER prüfen — der Scan ist blind geworden')

console.log(fehler === 0 ? '\n✓ Kosten-Cap-Suite bestanden (B-25).' : `\n✗ ${fehler} Fehler.`)
process.exit(fehler === 0 ? 0 : 1)
