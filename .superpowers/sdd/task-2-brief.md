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
