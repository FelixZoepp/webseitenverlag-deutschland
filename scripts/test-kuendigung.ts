/**
 * Szenario-Tests Kündigungsrechnung 24/12/3 (Änderungsauftrag 2026-07-15).
 * Referenz: Kauf 01.08.2026 → Erstlaufzeit endet 31.07.2028.
 *
 *   Kündigung 15.03.2027 → wirksam 31.07.2028 (Erstlaufzeit läuft aus)
 *   Kündigung 30.04.2028 → wirksam 31.07.2028 (letzter fristgerechter Tag)
 *   Kündigung 15.05.2028 → wirksam 31.07.2029 (Frist verpasst → +12 Monate)
 *
 * Lauf: npm run test:kuendigung — Exit 1 bei Abweichung.
 */

import { HAUPTPRODUKT_KONDITIONEN } from '../config/vertraege'
import { vertragsende, wirksamesKuendigungsdatum, addiereMonate } from '../lib/contracts'

let fehler = 0

function pruefe(name: string, ist: string, soll: string) {
  const ok = ist === soll
  if (!ok) fehler++
  console.log(`${ok ? '✅' : '❌'} ${name}: ${ist}${ok ? '' : ` (erwartet ${soll})`}`)
}

const beginn = '2026-08-01'
const konditionen = {
  laufzeit_monate: HAUPTPRODUKT_KONDITIONEN.mindestlaufzeit_monate,
  verlaengerung_monate: HAUPTPRODUKT_KONDITIONEN.verlaengerung_monate,
  kuendigungsfrist_monate: HAUPTPRODUKT_KONDITIONEN.kuendigungsfrist_monate,
}

console.log(`Konditionen aus config/vertraege.ts: ${konditionen.laufzeit_monate}/${konditionen.verlaengerung_monate}/${konditionen.kuendigungsfrist_monate}\n`)

// Grundlage: Ende der Erstlaufzeit
const ende = vertragsende(beginn, konditionen.laufzeit_monate)
pruefe('Erstlaufzeit-Ende (Kauf 01.08.2026 + 24M)', ende, '2028-07-31')

// Spätester fristgerechter Eingang (Monatsende-Clamping: 31.07. − 3M → 30.04.)
pruefe('Spätester fristgerechter Eingang', addiereMonate(ende, -konditionen.kuendigungsfrist_monate), '2028-04-30')

const vertrag = { ...konditionen, ende }

// Szenario 1: Kündigung weit vor Fristende
pruefe('Szenario 1 — Kündigung 15.03.2027', wirksamesKuendigungsdatum(vertrag, '2027-03-15'), '2028-07-31')

// Szenario 2: letzter fristgerechter Tag
pruefe('Szenario 2 — Kündigung 30.04.2028', wirksamesKuendigungsdatum(vertrag, '2028-04-30'), '2028-07-31')

// Szenario 3: Frist verpasst → Verlängerung um 12 Monate
pruefe('Szenario 3 — Kündigung 15.05.2028', wirksamesKuendigungsdatum(vertrag, '2028-05-15'), '2029-07-31')

console.log('')
if (fehler > 0) {
  console.error(`${fehler} Szenario(s) fehlgeschlagen`)
  process.exit(1)
}
console.log('Alle Kündigungsszenarien grün (24/12/3)')
