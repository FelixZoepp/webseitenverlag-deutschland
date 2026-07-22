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
import { vertragsende, wirksamesKuendigungsdatum, addiereMonate, gekoppelteUpsellKonditionen } from '../lib/contracts'

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

// ------------------------------------------------------------
// Upsell-Kopplung (2026-07-22): Upsell übernimmt Restlaufzeit
// + Konditionen des Hauptvertrags — ein Kündigungstermin.
// ------------------------------------------------------------
console.log('')

const upsellProdukt = { laufzeitMonate: 1, verlaengerungMonate: 1, kuendigungsfristMonate: 1 }
const haupt = { ende, verlaengerung_monate: konditionen.verlaengerung_monate, kuendigungsfrist_monate: konditionen.kuendigungsfrist_monate }

// Szenario 4: Upsell-Kauf 15.03.2027 → Ende + Konditionen des Hauptvertrags gespiegelt
const gekoppelt = gekoppelteUpsellKonditionen(haupt, upsellProdukt, '2027-03-15')
pruefe('Szenario 4 — Upsell-Ende = Haupt-Ende', gekoppelt.ende, '2028-07-31')
pruefe('Szenario 4 — Verlängerung gespiegelt', String(gekoppelt.verlaengerung_monate), String(konditionen.verlaengerung_monate))
pruefe('Szenario 4 — Frist gespiegelt', String(gekoppelt.kuendigungsfrist_monate), String(konditionen.kuendigungsfrist_monate))

// Szenario 5: Frist verpasst → Haupt UND Upsell verlängern synchron auf 31.07.2029
const upsellVertrag = { laufzeit_monate: upsellProdukt.laufzeitMonate, verlaengerung_monate: gekoppelt.verlaengerung_monate, kuendigungsfrist_monate: gekoppelt.kuendigungsfrist_monate, ende: gekoppelt.ende }
pruefe('Szenario 5 — Upsell-Kündigung 15.05.2028 (Frist verpasst)', wirksamesKuendigungsdatum(upsellVertrag, '2028-05-15'), '2029-07-31')
pruefe('Szenario 5 — synchron mit Hauptvertrag', wirksamesKuendigungsdatum(vertrag, '2028-05-15'), wirksamesKuendigungsdatum(upsellVertrag, '2028-05-15'))

// Szenario 6: Fallback ohne Hauptvertrag → heutiges Verhalten (1 Monat, 1/1)
const fallback = gekoppelteUpsellKonditionen(null, upsellProdukt, '2027-03-15')
pruefe('Szenario 6 — Fallback-Ende (1 Monat)', fallback.ende, '2027-04-14')
pruefe('Szenario 6 — Fallback-Verlängerung', String(fallback.verlaengerung_monate), '1')
pruefe('Szenario 6 — Fallback-Frist', String(fallback.kuendigungsfrist_monate), '1')

// Szenario 7: Einmal-Produkt (laufzeitMonate 0) im Fallback → Math.max(1, 0) = 1 Monat
const fallbackEinmal = gekoppelteUpsellKonditionen(null, { laufzeitMonate: 0, verlaengerungMonate: 0, kuendigungsfristMonate: 0 }, '2027-03-15')
pruefe('Szenario 7 — Fallback laufzeit 0 → 1 Monat', fallbackEinmal.ende, '2027-04-14')

console.log('')
if (fehler > 0) {
  console.error(`${fehler} Szenario(s) fehlgeschlagen`)
  process.exit(1)
}
console.log('Alle Kündigungs- und Kopplungs-Szenarien grün (24/12/3)')
