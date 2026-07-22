# Upsell-Kopplung an Hauptvertrag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upsell-Abos übernehmen beim Kauf Restlaufzeit + Verlängerung + Kündigungsfrist des aktiven Hauptvertrags (ein Kündigungstermin für alles); ohne Hauptvertrag greift das heutige Verhalten (Config-Werte).

**Architecture:** Eine neue pure Funktion `gekoppelteUpsellKonditionen` in `lib/contracts.ts` kapselt die Spiegelungs-Logik (testbar ohne DB). Der Stripe-Webhook (Fall B, Katalog-Upsell mit Monatsanteil) lädt den aktiven Hauptvertrag und nutzt die Funktion für den `contracts`-Insert. Keine Migration.

**Tech Stack:** Next.js App Router (Route Handler), Supabase JS, tsx-Testskripte (`npm run test:kuendigung`).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-22-upsell-kopplung-golive-design.md`
- Plan-Upgrades (Fall A im Webhook) und Einmal-Upsells (`monatCent === 0`) bleiben unberührt.
- `laufzeit_monate` im Insert bleibt `produkt.laufzeitMonate` (informativ, unverändert).
- Keine neuen Fehlerpfade: Lookup-Fehler/kein Hauptvertrag ⇒ `console.warn` + Fallback auf Config-Werte; bestehender `contractError`-Pfad unverändert.
- Keine Migration, keine neue Spalte.
- Deutsche Kommentare, deutsche Commit-Messages (`feat(...)`, `docs(...)`).
- Bestehende Tests bleiben grün: `npm run test:kuendigung` (3 Szenarien heute).

---

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

### Task 2: Webhook-Integration + Doku

**Files:**
- Modify: `app/api/webhooks/stripe/route.ts` (Fall B, Block `if (monatCent > 0)`, ~Zeilen 489-519)
- Modify: `config/upsells.ts` (Header-Kommentar, Zeilen 11-12)
- Modify: `WARTELISTE.md` (Abschnitt „Entscheidungen")

**Interfaces:**
- Consumes: `gekoppelteUpsellKonditionen` + `HauptvertragKonditionen` aus `lib/contracts.ts` (Task 1); bestehende Importe der Route (`vertragsende`, `heuteIso` etc. aus `@/lib/contracts`).
- Produces: nichts Neues für andere Tasks.

- [ ] **Step 1: Webhook anpassen**

In `app/api/webhooks/stripe/route.ts` den Import von `@/lib/contracts` um `gekoppelteUpsellKonditionen` erweitern (die Datei importiert dort bereits `vertragsende`/`heuteIso`/`createManualTask` — exakte Import-Zeile per Grep `from '@/lib/contracts'` finden und ergänzen).

Im Block `if (monatCent > 0)` (nach dem `existingContract`-Check, vor dem Insert) die Zeile `const beginn = heuteIso()` erweitern zu:

```ts
      const beginn = heuteIso()
      // Kopplung (2026-07-22): Upsell übernimmt Restlaufzeit + Konditionen
      // des aktiven Hauptvertrags — ein Kündigungstermin für alles.
      const { data: hauptVertrag } = await supabase
        .from('contracts')
        .select('ende, verlaengerung_monate, kuendigungsfrist_monate')
        .eq('customer_id', customerId)
        .eq('status', 'AKTIV')
        .not('paket', 'like', 'upsell:%')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (!hauptVertrag) {
        console.warn('[STRIPE] Kein aktiver Hauptvertrag für Upsell-Kopplung — Fallback auf Config-Konditionen')
      }
      const konditionen = gekoppelteUpsellKonditionen(
        (hauptVertrag as HauptvertragKonditionen | null),
        produkt,
        beginn
      )
```

Hinweis: `HauptvertragKonditionen` mit importieren (type-Import ok). `produkt` (Typ `UpsellProduct` aus `config/upsells.ts`) erfüllt das Parameter-Shape strukturell — kein Cast nötig.

Im darauffolgenden `.insert({ ... })` drei Felder ersetzen:

```ts
          verlaengerung_monate: konditionen.verlaengerung_monate,
          kuendigungsfrist_monate: konditionen.kuendigungsfrist_monate,
```

(statt `produkt.verlaengerungMonate` / `produkt.kuendigungsfristMonate`) und

```ts
          ende: konditionen.ende,
```

(statt `ende: vertragsende(beginn, Math.max(1, produkt.laufzeitMonate))`).

`laufzeit_monate: produkt.laufzeitMonate` bleibt UNVERÄNDERT.

Falls `vertragsende` danach in der Datei nirgends mehr genutzt wird: aus dem Import entfernen (Grep `vertragsende` in der Route prüfen — es gibt weitere Nutzungen im Hauptprodukt-Flow, dann Import belassen).

- [ ] **Step 2: Doku-Kommentar in `config/upsells.ts`**

Die Zeilen 11-12 des Header-Kommentars

```
 * Jede Buchung mit monatlichem Anteil erzeugt einen EIGENEN contracts-Eintrag
 * mit eigener Laufzeit (laufzeit/verlaengerung/kuendigungsfrist unten).
```

ersetzen durch:

```
 * Jede Buchung mit monatlichem Anteil erzeugt einen EIGENEN contracts-Eintrag.
 * Kopplung (2026-07-22): Der Upsell-Vertrag übernimmt Restlaufzeit, Verlängerung
 * und Kündigungsfrist des aktiven Hauptvertrags (lib/contracts.ts →
 * gekoppelteUpsellKonditionen) — ein Kündigungstermin für alles. Die Felder
 * laufzeit/verlaengerung/kuendigungsfrist unten sind nur noch der FALLBACK,
 * wenn beim Kauf kein aktiver Hauptvertrag existiert.
```

- [ ] **Step 3: WARTELISTE aktualisieren**

In `WARTELISTE.md`, Abschnitt „## Entscheidungen":

- Punkt `**\`LEAD_NOTIFY_EMAIL\` festlegen**` ersetzen durch:
  `- [x] **Lead-Benachrichtigung** ✅ Felix 2026-07-22: Mails gehen an felix@zoeppmedia.de + hendrik@hoffmann-wd.de (hardcoded in app/api/public/lead/route.ts) + CRM-Kanban /admin/crm — LEAD_NOTIFY_EMAIL-Env-Var obsolet`
- Punkt `**Produktdomain festlegen**` abhaken:
  `- [x] **Produktdomain** ✅ Felix 2026-07-22: webseitenverlag-deutschland.de (Marketing = www, Portal = app., Kundenseiten = {slug}.)`
- Punkt `**Upsell-Preise & Laufzeiten bestätigen**` abhaken:
  `- [x] **Upsell-Preise & Laufzeiten** ✅ Felix 2026-07-22: Preise bestätigt (49/299/149+19/29/39/199/99). Laufzeit: an Hauptvertrag gekoppelt (Restlaufzeit + 12/3 gespiegelt, lib/contracts.ts → gekoppelteUpsellKonditionen); Config-Werte 1/1/1 nur noch Fallback ohne Hauptvertrag`
- Punkt `**KICKOFF_MODE entscheiden**` abhaken:
  `- [x] **KICKOFF_MODE** ✅ Felix 2026-07-22: auto (= Default, keine Env-Var nötig)`
- Im Abschnitt „## Sofort": im Punkt „Vercel Env-Vars setzen" den Teil `\`LEAD_NOTIFY_EMAIL\`` streichen (obsolet), sodass nur `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` bleiben
- Punkt `**Git-Remote anlegen + pushen**` abhaken:
  `- [x] **Git-Remote** ✅ erledigt 2026-07-22: github.com/FelixZoepp/webseitenverlag-deutschland, CI-Workflow aktiv`

- [ ] **Step 4: Verifikation**

Run: `npx tsc --noEmit`
Expected: fehlerfrei.

Run: `npm run test:kuendigung`
Expected: PASS, Exit 0 (alle 14 Prüfungen).

Run: `npm run test:phase5`
Expected: bestehende Prüfungen grün (falls das Skript ohne DB/Stripe-Keys lauffähig ist; wenn es Keys braucht und deshalb skippt/failt wie vor der Änderung, dokumentieren und weiter — kein neuer Fehler durch diese Änderung).

- [ ] **Step 5: Commit**

```bash
git add app/api/webhooks/stripe/route.ts config/upsells.ts WARTELISTE.md
git commit -m "feat(upsells): Upsell-Verträge an Restlaufzeit des Hauptvertrags gekoppelt"
```
