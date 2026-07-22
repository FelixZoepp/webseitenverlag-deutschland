/**
 * Test CRM — Anzeigename für Notiz-Autoren.
 * Läuft komplett offline (keine API-/DB-Aufrufe).
 * Aufruf: npm run test:crm
 */
import { anzeigeName } from '../lib/crm/anzeige-name'

let fehler = 0
let geprueft = 0

function assert(bedingung: boolean, name: string, meldung: string) {
  geprueft++
  if (!bedingung) {
    fehler++
    console.error(`  ✗ [${name}] ${meldung}`)
  }
}

console.log('Teil A: anzeigeName')

assert(anzeigeName('felix@zoeppmedia.de') === 'Felix', 'name-felix', 'felix@… muss „Felix" ergeben')
assert(anzeigeName('hendrik@hoffmann-wd.de') === 'Hendrik', 'name-hendrik', 'hendrik@… muss „Hendrik" ergeben')
assert(anzeigeName(null) === null, 'name-null', 'null muss null bleiben')
assert(anzeigeName('') === null, 'name-leer', 'Leerstring muss null ergeben')
assert(anzeigeName('@zoeppmedia.de') === null, 'name-ohne-lokalteil', 'E-Mail ohne Lokalteil muss null ergeben')
assert(anzeigeName('max.mustermann@firma.de') === 'Max.mustermann', 'name-punkt', 'Nur erster Buchstabe wird großgeschrieben')

console.log(`\n${geprueft} Prüfungen, ${fehler} Fehler`)
if (fehler > 0) process.exit(1)
