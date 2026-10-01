# Task 2 Report — Webhook-Integration + Doku (Upsell-Kopplung)

## Commit
`b0de953` — `feat(upsells): Upsell-Verträge an Restlaufzeit des Hauptvertrags gekoppelt`
Branch: `feat/upsell-kopplung`

## Was geändert wurde

### 1. `app/api/webhooks/stripe/route.ts`
- Import von `@/lib/contracts` um `gekoppelteUpsellKonditionen` (Funktion) und `HauptvertragKonditionen` (type-Import) erweitert.
- Im Block `if (monatCent > 0)` nach `const beginn = heuteIso()` die Kopplung eingefügt: Supabase-Query auf den aktuellen aktiven Hauptvertrag (`status='AKTIV'`, `paket NOT LIKE 'upsell:%'`), Warn-Log falls kein Hauptvertrag gefunden, Aufruf `gekoppelteUpsellKonditionen(...)`.
- Im `.insert({...})` drei Felder ersetzt:
  - `verlaengerung_monate: konditionen.verlaengerung_monate` (war: `produkt.verlaengerungMonate`)
  - `kuendigungsfrist_monate: konditionen.kuendigungsfrist_monate` (war: `produkt.kuendigungsfristMonate`)
  - `ende: konditionen.ende` (war: `vertragsende(beginn, Math.max(1, produkt.laufzeitMonate))`)
- `laufzeit_monate: produkt.laufzeitMonate` unverändert gelassen (wie Brief vorschreibt).
- `vertragsende` bleibt im Import (wird bei Zeile 188 im Hauptprodukt-Flow weiter genutzt).

### 2. `config/upsells.ts`
- Zeilen 11–12 des Header-Kommentars durch 6-zeiligen Kopplung-Kommentar ersetzt (exakt wie Brief).

### 3. `WARTELISTE.md`
- `LEAD_NOTIFY_EMAIL`-Punkt abgehakt + Text ersetzt.
- `Produktdomain`-Punkt abgehakt.
- `Upsell-Preise & Laufzeiten`-Punkt abgehakt.
- `KICKOFF_MODE`-Punkt abgehakt.
- Im „Sofort"-Abschnitt `LEAD_NOTIFY_EMAIL` aus dem Vercel-Env-Vars-Punkt gestrichen.
- `Git-Remote anlegen + pushen`-Punkt abgehakt.

## Verifikation

### `npx tsc --noEmit`
Ergebnis: **Keine Ausgabe = fehlerfrei.** ✅

### `npm run test:kuendigung`
Ergebnis: **Alle 14 Prüfungen grün.** ✅
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
```

### `npm run test:phase5`
Ergebnis: **Alle 35 Prüfungen grün.** ✅ (Kein API-Key-Problem — alle Tests sind strukturell, kein Stripe-/Supabase-Key nötig.)

## Self-Review Diff gegen Brief

| Anforderung | Status |
|---|---|
| Import `gekoppelteUpsellKonditionen` + `HauptvertragKonditionen` aus `@/lib/contracts` | ✅ |
| Supabase-Query Hauptvertrag (AKTIV, nicht upsell:%, letzter, maybeSingle) | ✅ |
| Warn-Log wenn kein Hauptvertrag | ✅ |
| `gekoppelteUpsellKonditionen(hauptVertrag as HauptvertragKonditionen \| null, produkt, beginn)` | ✅ |
| `verlaengerung_monate: konditionen.verlaengerung_monate` | ✅ |
| `kuendigungsfrist_monate: konditionen.kuendigungsfrist_monate` | ✅ |
| `ende: konditionen.ende` | ✅ |
| `laufzeit_monate: produkt.laufzeitMonate` unverändert | ✅ |
| `vertragsende` im Import belassen (Nutzung Zeile 188) | ✅ |
| config/upsells.ts Kommentar Zeilen 11–12 ersetzt | ✅ |
| WARTELISTE.md alle 6 Punkte korrekt abgehakt/geändert | ✅ |
| Commit-Message exakt wie Brief | ✅ |

## Anmerkungen / Concerns
Keine. Alle Tests grün, TypeScript fehlerfrei, Diff entspricht dem Brief 1:1.
