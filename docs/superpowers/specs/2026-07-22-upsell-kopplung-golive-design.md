# Upsell-Kopplung an Hauptvertrag + Go-Live-Entscheidungen — Design

Datum: 2026-07-22
Status: Vom Nutzer freigegeben (Chat, „ansatz u1" nach Design-Präsentation)

## Ziel

Upsell-Abos (monatlicher Anteil) laufen nicht mehr monatlich kündbar (1/1/1), sondern
gekoppelt an die Restlaufzeit des Hauptvertrags — **ein Kündigungstermin für alles**.
Dazu werden die Go-Live-Entscheidungen aus der WARTELISTE festgehalten.

Felix-Entscheidungen (Chat 2026-07-22):
- **Upsell-Laufzeit:** an Hauptvertrag koppeln (Restlaufzeit), Ansatz 1 (Konditionen-Spiegelung
  beim Kauf, keine Migration)
- **Produktdomain:** `webseitenverlag-deutschland.de`
- **Lead-Benachrichtigung:** an felix@zoeppmedia.de + hendrik@hoffmann-wd.de und im CRM —
  bereits implementiert (`app/api/public/lead/route.ts:122` + `/admin/crm`), keine Änderung
- **KICKOFF_MODE:** `auto` (= Default, keine Env-Var nötig)
- **Upsell-Preise:** bestätigt wie in `config/upsells.ts` (49/299/149+19/29/39/199/99)

## 1. Pure Funktion (`lib/contracts.ts`)

Neue exportierte Funktion:

```ts
export interface HauptvertragKonditionen {
  ende: string
  verlaengerung_monate: number
  kuendigungsfrist_monate: number
}

export function gekoppelteUpsellKonditionen(
  hauptVertrag: HauptvertragKonditionen | null,
  produkt: { laufzeitMonate: number; verlaengerungMonate: number; kuendigungsfristMonate: number },
  beginn: string
): { ende: string; verlaengerung_monate: number; kuendigungsfrist_monate: number }
```

- **Mit Hauptvertrag:** `{ ende: hauptVertrag.ende, verlaengerung_monate: hauptVertrag.verlaengerung_monate, kuendigungsfrist_monate: hauptVertrag.kuendigungsfrist_monate }`.
  Da Upsell- und Hauptvertrag dann dasselbe `ende` und dieselbe Verlängerung haben, bleiben
  sie über `wirksamesKuendigungsdatum` dauerhaft synchron.
- **Ohne Hauptvertrag (Fallback):** heutiges Verhalten —
  `{ ende: vertragsende(beginn, Math.max(1, produkt.laufzeitMonate)), verlaengerung_monate: produkt.verlaengerungMonate, kuendigungsfrist_monate: produkt.kuendigungsfristMonate }`.
- Sonderfall Haupt-`ende` in der Vergangenheit: nicht abfangen — Status `AKTIV` impliziert
  gültiges Ende; kaputte Daten laufen in den bestehenden Schutz von `wirksamesKuendigungsdatum`.

## 2. Webhook (`app/api/webhooks/stripe/route.ts`, Fall B Katalog-Upsell)

Vor dem `contracts`-Insert (aktuell Zeilen ~499-519):

- Aktiven Hauptvertrag laden:
  `customer_id = customerId`, `status = 'AKTIV'`, `paket NOT LIKE 'upsell:%'`,
  `order by created_at desc`, `limit 1` (Felder: `ende, verlaengerung_monate, kuendigungsfrist_monate`)
- `gekoppelteUpsellKonditionen(haupt, produkt, beginn)` liefert `ende`,
  `verlaengerung_monate`, `kuendigungsfrist_monate` für den Insert
- `laufzeit_monate` bleibt informativ `produkt.laufzeitMonate` (unverändert)
- Kein Hauptvertrag gefunden: `console.warn('[STRIPE] Kein aktiver Hauptvertrag für Upsell-Kopplung — Fallback auf Config-Konditionen')` + Fallback-Werte
- Plan-Upgrades (Fall A) und Einmal-Upsells (`monatCent === 0`) bleiben unberührt

## 3. Doku

- `config/upsells.ts`: Header-Kommentar ergänzen — die Felder
  `laufzeitMonate/verlaengerungMonate/kuendigungsfristMonate` sind nur noch der **Fallback
  ohne aktiven Hauptvertrag**; Regelfall ist die Kopplung an dessen Restlaufzeit
- `WARTELISTE.md`: Entscheidungs-Punkte abhaken/aktualisieren (Upsell-Preise bestätigt +
  Kopplung, Produktdomain, `LEAD_NOTIFY_EMAIL` obsolet — Code hardcodet felix@zoeppmedia.de +
  hendrik@hoffmann-wd.de, KICKOFF_MODE auto). Stale Einträge korrigieren (Git-Remote existiert,
  Lead-Mail-Eintrag)

## 4. Fehlerbehandlung

Keine neuen Fehlerpfade. Scheitert der Hauptvertrags-Lookup (DB-Fehler), greift derselbe
Fallback wie „kein Hauptvertrag" (warn + Config-Werte); der bestehende
`contractError`-Pfad (manual_task `PROVISIONING_LUECKE`) bleibt unverändert.

## 5. Tests

Neue Szenarien in `scripts/test-kuendigung.ts` (pure, ohne DB, bestehendes Muster):

- Haupt: Kauf 01.08.2026, 24/12/3 → Ende 31.07.2028. Upsell-Kauf 15.03.2027 →
  Upsell-Ende 31.07.2028, Konditionen 12/3 gespiegelt
- Kündigung 15.05.2028 (Frist verpasst): Haupt UND Upsell wirksam 31.07.2029 —
  beide +12 synchron
- Fallback ohne Hauptvertrag: Upsell-Kauf 15.03.2027 → Ende 14.04.2027 (1 Monat), 1/1
- Bestehende Kündigungs-Szenarien bleiben grün

## Nicht im Scope

- Keine Migration / keine `parent_contract_id`-Spalte (Ansatz 2 verworfen)
- Vorzeitiges Hauptvertrags-Ende räumt Upsells NICHT automatisch ab — läuft wie heute über
  manuelle `KUENDIGUNG`-Tasks
- Stripe-Subscriptions bleiben monatliche Abrechnung; die Kopplung ist die
  vertragliche Laufzeit in der DB
- Go-Live-Aktionen mit Felix-Accounts (Stripe-Keys, Webhook-Endpoint, Resend-Verifizierung,
  Wildcard-DNS): separate Ops-Strecke, kein Code
