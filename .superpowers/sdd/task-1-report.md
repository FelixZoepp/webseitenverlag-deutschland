# Task 1: Report — gekoppelteUpsellKonditionen

**Status:** DONE
**Commit-Hash:** 43cf8d6
**Datum:** 2026-07-22

---

## Durchgeführte Arbeiten

### Step 1: Failing Tests schreiben ✅
- **Datei:** `scripts/test-kuendigung.ts`
- **Änderung:** Import um `gekoppelteUpsellKonditionen` erweitert (Zeile 13)
- **Änderung:** Szenarien 4–7 vor dem Exit-Block eingefügt (Zeilen 50–75)
- **Szenarien:**
  - Szenario 4: Upsell-Ende = Haupt-Ende, Verlängerung gespiegelt, Frist gespiegelt
  - Szenario 5: Frist verpasst → Haupt UND Upsell verlängern synchron
  - Szenario 6: Fallback ohne Hauptvertrag (1 Monat, 1/1)
  - Szenario 7: Einmal-Produkt (laufzeitMonate 0) im Fallback → 1 Monat
- **Abschluss-Meldung:** Angepasst auf „Alle Kündigungs- und Kopplungs-Szenarien grün (24/12/3)"

### Step 2: Tests laufen lassen — Fail verifiziert ✅
```bash
npm run test:kuendigung
```
**Output:** TypeError: `gekoppelteUpsellKonditionen is not a function`
**Ergebnis:** Erwartungsgemäße Fehlgeschlag, da Funktion noch nicht vorhanden.

### Step 3: Funktion implementieren ✅
- **Datei:** `lib/contracts.ts`
- **Position:** Nach `wirksamesKuendigungsdatum` (Zeile 74), vor „Manuelle Aufgaben" Abschnitt
- **Hinzugefügt:**
  - `export interface HauptvertragKonditionen` mit Feldern `ende`, `verlaengerung_monate`, `kuendigungsfrist_monate`
  - `export function gekoppelteUpsellKonditionen(hauptVertrag: HauptvertragKonditionen | null, produkt: {...}, beginn: string)`
  - Logik: Wenn Hauptvertrag existiert, übernehmen. Sonst Fallback mit `Math.max(1, produkt.laufzeitMonate)`
- **Kommentare:** Deutsch, dokumentieren den Zweck (§10.4 + Entscheidung 2026-07-22)

### Step 4: Tests laufen lassen — Pass verifiziert ✅
```bash
npm run test:kuendigung
```
**Output:** Alle 14 Tests grün ✅
- 5 bestehende Prüfungen (Erstlaufzeit-Ende, Fristeingang, Szenarios 1–3)
- 9 neue Prüfungen (Szenarios 4–7, mit Szenario 5 als zwei Prüfungen)

```bash
npx tsc --noEmit
```
**Output:** Fehlerfrei ✅

### Step 5: Commit erstellt ✅
```bash
git add lib/contracts.ts scripts/test-kuendigung.ts
git commit -m "feat(contracts): gekoppelteUpsellKonditionen — Upsell übernimmt Restlaufzeit des Hauptvertrags"
```
**Commit-Hash:** 43cf8d6

---

## Testergebnisse

```
✅ Erstlaufzeit-Ende (Kauf 01.08.2026 + 24M): 2028-07-31
✅ Spätester fristgerechter Eingang: 2028-04-30
✅ Szenario 1 — Kündigung 15.03.2027: 2028-07-31
✅ Szenario 2 — Kündigung 30.04.2028: 2028-07-31
✅ Szenario 3 — Kündigung 15.05.2028: 2029-07-31
✅ Szenario 4 — Upsell-Ende = Haupt-Ende: 2028-07-31
✅ Szenario 4 — Verlängerung gespiegelt: 12
✅ Szenario 4 — Frist gespiegelt: 3
✅ Szenario 5 — Upsell-Kündigung 15.05.2028 (Frist verpasst): 2029-07-31
✅ Szenario 5 — synchron mit Hauptvertrag: 2029-07-31
✅ Szenario 6 — Fallback-Ende (1 Monat): 2027-04-14
✅ Szenario 6 — Fallback-Verlängerung: 1
✅ Szenario 6 — Fallback-Frist: 1
✅ Szenario 7 — Fallback laufzeit 0 → 1 Monat: 2027-04-14

Alle Kündigungs- und Kopplungs-Szenarien grün (24/12/3)
Exit Code: 0
```

---

## Self-Review

### Umsetzung
- ✅ Strikt TDD: Tests → Fail → Implementierung → Pass → Commit
- ✅ Exakte Code-Blöcke aus dem Brief verbatim umgesetzt
- ✅ Deutsche Kommentare in Funktion und Tests
- ✅ Commit-Message deutsch wie im Brief

### Anforderungen
- ✅ Nur `lib/contracts.ts` und `scripts/test-kuendigung.ts` geändert
- ✅ `HauptvertragKonditionen` Interface exportiert (für Task 2)
- ✅ `gekoppelteUpsellKonditionen` exportiert (für Task 2)
- ✅ Alle 5 bestehenden Prüfungen grün
- ✅ Alle 9 neuen Prüfungen grün
- ✅ TypeScript fehlerfrei
- ✅ Exit-Code 0

### Logik
- Hauptvertrag existiert: Restlaufzeit (`ende`), Verlängerung, Frist werden gespiegelt
- Hauptvertrag null: Fallback mit `Math.max(1, produkt.laufzeitMonate)` für Einmal-Produkte (laufzeitMonate 0)
- Synchronität: Da beide Verträge dasselbe `ende` haben, bleiben sie über `wirksamesKuendigungsdatum` synchron (verifiziert in Szenario 5)

### Keine Concerns
- Alle Tests bestehen ✅
- TypeScript validiert ✅
- Keine Merge-Konflikte zu erwarten
- Ready für Task 2 (Stripe-Webhook-Verdrahtung)
