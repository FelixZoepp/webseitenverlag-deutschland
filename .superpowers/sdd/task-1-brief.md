### Task 1: Pure Funktion `gekoppelteUpsellKonditionen` + Tests

**Files:**
- Modify: `lib/contracts.ts` (nach `wirksamesKuendigungsdatum`, ~Zeile 74)
- Test: `scripts/test-kuendigung.ts` (Szenarien anhängen vor dem Fehler-Exit-Block)

**Interfaces:**
- Consumes: `vertragsende(beginn, monate)` aus `lib/contracts.ts` (existiert, Zeile 50)
- Produces: `gekoppelteUpsellKonditionen(hauptVertrag: HauptvertragKonditionen | null, produkt: { laufzeitMonate: number; verlaengerungMonate: number; kuendigungsfristMonate: number }, beginn: string): { ende: string; verlaengerung_monate: number; kuendigungsfrist_monate: number }` + `export interface HauptvertragKonditionen { ende: string; verlaengerung_monate: number; kuendigungsfrist_monate: number }` — Task 2 importiert beide.

- [ ] **Step 1: Failing Tests schreiben**

In `scripts/test-kuendigung.ts` den Import in Zeile 13 erweitern:

```ts
import { vertragsende, wirksamesKuendigungsdatum, addiereMonate, gekoppelteUpsellKonditionen } from '../lib/contracts'
```

Vor dem Block `console.log('')` / `if (fehler > 0)` (aktuell Zeile 50) anhängen:

```ts
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
```

Die Abschluss-Meldung in der letzten Zeile anpassen:

```ts
console.log('Alle Kündigungs- und Kopplungs-Szenarien grün (24/12/3)')
```

- [ ] **Step 2: Tests laufen lassen — müssen fehlschlagen**

Run: `npm run test:kuendigung`
Expected: FAIL — TypeScript/tsx-Fehler, `gekoppelteUpsellKonditionen` existiert nicht in `../lib/contracts`.

- [ ] **Step 3: Funktion implementieren**

In `lib/contracts.ts` direkt nach `wirksamesKuendigungsdatum` (nach Zeile 74, vor dem Abschnitt „Manuelle Aufgaben") einfügen:

```ts
// ------------------------------------------------------------
// Upsell-Kopplung (§10.4 + Entscheidung 2026-07-22)
// ------------------------------------------------------------

export interface HauptvertragKonditionen {
  ende: string
  verlaengerung_monate: number
  kuendigungsfrist_monate: number
}

/**
 * Konditionen für einen neuen Upsell-Vertrag: Upsell-Abos übernehmen
 * Restlaufzeit (`ende`), Verlängerung und Kündigungsfrist des aktiven
 * Hauptvertrags — ein Kündigungstermin für alles. Da beide Verträge
 * dasselbe `ende` und dieselbe Verlängerung haben, bleiben sie über
 * `wirksamesKuendigungsdatum` dauerhaft synchron.
 *
 * Ohne aktiven Hauptvertrag: Fallback auf die Config-Werte des Produkts
 * (config/upsells.ts, heutiges Verhalten — monatlich kündbar).
 */
export function gekoppelteUpsellKonditionen(
  hauptVertrag: HauptvertragKonditionen | null,
  produkt: { laufzeitMonate: number; verlaengerungMonate: number; kuendigungsfristMonate: number },
  beginn: string
): { ende: string; verlaengerung_monate: number; kuendigungsfrist_monate: number } {
  if (hauptVertrag) {
    return {
      ende: hauptVertrag.ende,
      verlaengerung_monate: hauptVertrag.verlaengerung_monate,
      kuendigungsfrist_monate: hauptVertrag.kuendigungsfrist_monate,
    }
  }
  return {
    ende: vertragsende(beginn, Math.max(1, produkt.laufzeitMonate)),
    verlaengerung_monate: produkt.verlaengerungMonate,
    kuendigungsfrist_monate: produkt.kuendigungsfristMonate,
  }
}
```

- [ ] **Step 4: Tests laufen lassen — müssen bestehen**

Run: `npm run test:kuendigung`
Expected: PASS — alle bisherigen 5 Prüfungen (Erstlaufzeit-Ende, Fristeingang, Szenario 1–3) UND die 9 neuen Prüfungen (Szenario 4–7) grün, Exit 0.

Zusätzlich: `npx tsc --noEmit`
Expected: fehlerfrei.

- [ ] **Step 5: Commit**

```bash
git add lib/contracts.ts scripts/test-kuendigung.ts
git commit -m "feat(contracts): gekoppelteUpsellKonditionen — Upsell übernimmt Restlaufzeit des Hauptvertrags"
```

---

