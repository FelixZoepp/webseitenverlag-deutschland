/**
 * Vertragskonfiguration — die EINZIGE Quelle für Laufzeit-Standards des
 * Hauptprodukts. Kein Laufzeit-/Verlängerungs-/Fristwert darf irgendwo
 * anders hartkodiert sein (Checkout-Texte, Mails, Portal, Cron, Tests).
 *
 * Standard 24/12/3 (Änderungsauftrag 2026-07-15):
 *   24 Monate Erstlaufzeit → automatische Verlängerung um jeweils 12 Monate
 *   → Kündigungsfrist 3 Monate zum Laufzeitende.
 * Hintergrund: Eine 24-Monats-VERLÄNGERUNG per AGB ist im B2B nach § 307 BGB
 * angreifbar (das Amortisationsargument trägt nur die Erstlaufzeit);
 * 12 Monate gelten als robust. Anwaltliche AGB-Freigabe → WARTELISTE.md.
 *
 * WICHTIG: Diese Werte werden beim Kauf in die contracts-Zeile geschrieben
 * und sind danach fix. Kündigungs- und Verlängerungs-Rechnung lesen IMMER
 * die Vertragszeile, nie diese Config — Altverträge (z. B. 24/24/3)
 * behalten, was vereinbart wurde.
 *
 * Upsell-Produkte haben eigene Laufzeiten je Produkt → config/upsells.ts.
 */

export const HAUPTPRODUKT_KONDITIONEN = {
  mindestlaufzeit_monate: 24,
  verlaengerung_monate: 12,
  kuendigungsfrist_monate: 3,
} as const

/** Kurzform für Admin-UI und Logs, z. B. "24/12/3" */
export function konditionenKurz(
  k: {
    laufzeit_monate?: number
    mindestlaufzeit_monate?: number
    verlaengerung_monate: number
    kuendigungsfrist_monate: number
  } = HAUPTPRODUKT_KONDITIONEN
): string {
  const laufzeit = k.mindestlaufzeit_monate ?? k.laufzeit_monate
  return `${laufzeit}/${k.verlaengerung_monate}/${k.kuendigungsfrist_monate}`
}

/**
 * Kundensichtbarer Konditionen-Wortlaut (Checkout, Portal, Mails).
 * Soll-Wortlaut laut Änderungsauftrag — Werte immer aus der Config bzw.
 * (für Bestandsverträge) aus der Vertragszeile.
 */
export function vertragsKonditionenText(
  k: {
    laufzeit_monate?: number
    mindestlaufzeit_monate?: number
    verlaengerung_monate: number
    kuendigungsfrist_monate: number
  } = HAUPTPRODUKT_KONDITIONEN
): string {
  const laufzeit = k.mindestlaufzeit_monate ?? k.laufzeit_monate
  return (
    `Laufzeit ${laufzeit} Monate, monatliche Abrechnung. ` +
    `Danach verlängert sich der Vertrag um jeweils ${k.verlaengerung_monate} Monate, ` +
    `sofern nicht mit einer Frist von ${k.kuendigungsfrist_monate} Monaten zum Laufzeitende gekündigt wird.`
  )
}
