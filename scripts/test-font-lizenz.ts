/**
 * FEHLERJOURNAL J-005 — Font-Lizenz-Scan: npx tsx scripts/test-font-lizenz.ts
 *
 * Historie: Apples SF-Pro-Font (keine Web-Weitergabe-Lizenz) lag im
 * Kunden-Handoff. Verhinderungs-Regel: Alle ausgelieferten Verzeichnisse
 * werden gescannt — (a) kein Dateiname darf auf verbotene Muster matchen,
 * (b) jede Font-Datei muss auf der expliziten Whitelist stehen (nur
 * lizenzfreie Fonts, OFL/Google Fonts self-hosted).
 *
 * Exit 1 bei jedem Verstoß.
 */
import { readdirSync, statSync, existsSync } from 'fs'
import { join, relative } from 'path'

const root = join(__dirname, '..')

/** Verzeichnisse, deren Inhalt an Kunden/Besucher ausgeliefert wird */
const SCAN_VERZEICHNISSE = ['public', 'export', 'handoff']

/** Verbotene Muster im Dateinamen (lizenzpflichtige/Apple-Fonts) */
const VERBOTEN = [/sf-?pro/i, /\.dfont$/i, /apple/i, /helvetica/i, /\bsegoe/i]

/** Whitelist: exakt diese Font-Dateien (relativ zum Repo-Root) sind erlaubt */
const FONT_WHITELIST = new Set([
  'public/fonts/inter-tight/InterTight-latin.woff2',
  'public/fonts/inter-tight/InterTight-latin-ext.woff2',
])

const FONT_ENDUNGEN = /\.(woff2?|ttf|otf|eot|dfont)$/i

function* alleDateien(dir: string): Generator<string> {
  for (const eintrag of readdirSync(dir)) {
    const pfad = join(dir, eintrag)
    if (statSync(pfad).isDirectory()) yield* alleDateien(pfad)
    else yield pfad
  }
}

let fehler = 0
function check(name: string, bedingung: boolean, detail?: string) {
  console.log(`${bedingung ? 'PASS' : 'FAIL'}  ${name}${!bedingung && detail ? ` — ${detail}` : ''}`)
  if (!bedingung) fehler++
}

let gepruefteDateien = 0
let gefundeneFonts = 0

for (const verzeichnis of SCAN_VERZEICHNISSE) {
  const absolut = join(root, verzeichnis)
  if (!existsSync(absolut)) continue
  for (const pfad of alleDateien(absolut)) {
    gepruefteDateien++
    const rel = relative(root, pfad)
    const verstoss = VERBOTEN.find((m) => m.test(rel))
    if (verstoss) check(`Verbotenes Muster: ${rel}`, false, `matcht ${verstoss}`)
    if (FONT_ENDUNGEN.test(rel)) {
      gefundeneFonts++
      check(`Font auf Whitelist: ${rel}`, FONT_WHITELIST.has(rel),
        'Font-Datei nicht in FONT_WHITELIST (scripts/test-font-lizenz.ts) — Lizenz prüfen, dann whitelisten')
    }
  }
}

check('Whitelist-Fonts existieren tatsächlich',
  Array.from(FONT_WHITELIST).every((f) => existsSync(join(root, f))))

console.log(`\n${gepruefteDateien} Dateien gescannt, ${gefundeneFonts} Font-Datei(en) geprüft.`)
console.log(fehler === 0 ? '✓ Font-Lizenz-Scan bestanden (J-005).' : `✗ ${fehler} Verstoß/Verstöße.`)
process.exit(fehler === 0 ? 0 : 1)
