/**
 * Upsell-Leiter & Produktkatalog (§10.4 / §10.5).
 *
 * Jeder Upsell hat GENAU:
 *   - zwei Kauf-Wege: 1-Klick-Zahlungslink (Ops-Dashboard) + Buchen-Button (Portal)
 *   - einen Fulfillment-Typ: 'auto' (Webhook startet Provisioning sofort)
 *     oder 'va_manual' (Webhook erzeugt manual_task)
 *   - vier Bausteine: Stripe-Checkout (price_data aus dieser Datei),
 *     Provisioning-Job, Portal-Kachel, diese Zeile hier.
 *
 * Jede Buchung mit monatlichem Anteil erzeugt einen EIGENEN contracts-Eintrag
 * mit eigener Laufzeit (laufzeit/verlaengerung/kuendigungsfrist unten).
 *
 * Bewusst verworfen (NICHT bauen): Anruf-Tracking, Lead-Alarm-SMS,
 * Rechtstexte-Abo, Profi-E-Mail-Adresse, Anfrage-Konfigurator, Foto-Veredelung.
 */

export type UpsellFulfillment = 'auto' | 'va_manual'
export type UpsellTouchpoint = 'wizard' | 'kickoff' | 'editor-gate' | 'portal' | 'cron-14' | 'cron-60'

export interface UpsellProduct {
  key: string
  name: string
  /** Nutzen in genau 3 Punkten (§10.1 Schritt 5 — keine Dark Patterns, Preis transparent) */
  nutzen: [string, string, string]
  einmalCent: number
  monatCent: number
  fulfillment: UpsellFulfillment
  touchpoints: UpsellTouchpoint[]
  /** Vertragskonditionen des eigenen contracts-Eintrags (nur bei monatCent > 0) */
  laufzeitMonate: number
  verlaengerungMonate: number
  kuendigungsfristMonate: number
  /** Provisioning-Hinweis für den Job (Phase G implementiert die Cron-Anteile) */
  provisioning: string
}

/** Reihenfolge = Einführungs-Reihenfolge (§10.5: SEO-Abo + Stadtteil zuerst). */
export const UPSELL_PRODUCTS: UpsellProduct[] = [
  {
    key: 'seo-unterseiten-abo',
    name: 'SEO-Unterseiten-Abo',
    nutzen: [
      'Jeden Monat eine neue Keyword-Seite für Ihre Region',
      'Mehr Google-Sichtbarkeit ohne eigenen Aufwand',
      'Monatlich kündbar, transparenter Festpreis',
    ],
    einmalCent: 0,
    monatCent: 4900,
    fulfillment: 'auto',
    touchpoints: ['wizard', 'portal', 'cron-14'],
    laufzeitMonate: 1,
    verlaengerungMonate: 1,
    kuendigungsfristMonate: 1,
    provisioning: 'Cron generiert 1 Keyword-Unterseite/Monat (Phase G)',
  },
  {
    key: 'stadtteil-seiten',
    name: 'Stadtteil-Seiten-Paket',
    nutzen: [
      '10 Umkreis-Seiten für Nachbarorte und Stadtteile',
      'Gefunden werden, wo Ihre Kunden wirklich suchen',
      'Einmalzahlung, dauerhaft online',
    ],
    einmalCent: 29900,
    monatCent: 0,
    fulfillment: 'auto',
    touchpoints: ['portal', 'cron-14'],
    laufzeitMonate: 0,
    verlaengerungMonate: 0,
    kuendigungsfristMonate: 0,
    provisioning: 'Einmal-Job generiert 10 Umkreis-Seiten (Phase G)',
  },
  {
    key: 'bewertungs-system',
    name: 'Bewertungs-System',
    nutzen: [
      'QR-Code + Funnel für mehr echte Google-Bewertungen',
      'Bewertungs-Mails nur mit Einwilligung, ohne Review-Gating',
      'Einrichtung einmalig, danach kleiner Monatsbeitrag',
    ],
    einmalCent: 14900,
    monatCent: 1900,
    fulfillment: 'auto',
    touchpoints: ['portal', 'cron-60'],
    laufzeitMonate: 1,
    verlaengerungMonate: 1,
    kuendigungsfristMonate: 1,
    provisioning: 'QR-Code + Bewertungs-Funnel-Seite (Phase G)',
  },
  {
    key: 'konkurrenz-radar',
    name: 'Konkurrenz-Radar',
    nutzen: [
      'Monatlicher Report: was Ihre Konkurrenz online macht',
      'Rankings, Bewertungen und Angebote im Vergleich',
      'Monatlich kündbar',
    ],
    einmalCent: 0,
    monatCent: 2900,
    fulfillment: 'auto',
    touchpoints: ['portal', 'cron-60'],
    laufzeitMonate: 1,
    verlaengerungMonate: 1,
    kuendigungsfristMonate: 1,
    provisioning: 'Cron erstellt Monats-Report (Phase G)',
  },
  {
    key: 'saison-kampagnen',
    name: 'Saison-Kampagnen-Automat',
    nutzen: [
      'Automatische Saison-Aktionen auf Ihrer Website',
      'Passende Kampagnen-Sektionen zum richtigen Zeitpunkt',
      'Monatlich kündbar',
    ],
    einmalCent: 0,
    monatCent: 3900,
    fulfillment: 'auto',
    touchpoints: ['portal', 'cron-60'],
    laufzeitMonate: 1,
    verlaengerungMonate: 1,
    kuendigungsfristMonate: 1,
    provisioning: 'Cron tauscht Saison-Sektion (Phase G)',
  },
  {
    key: 'gbp-einrichtung',
    name: 'Google-Unternehmensprofil-Einrichtung',
    nutzen: [
      'Professionelle Ersteinrichtung Ihres Google-Profils',
      'Korrekte Daten, Fotos und Kategorien von Anfang an',
      'Einmalzahlung, keine Folgekosten',
    ],
    einmalCent: 19900,
    monatCent: 0,
    fulfillment: 'va_manual',
    touchpoints: ['kickoff', 'portal'],
    laufzeitMonate: 0,
    verlaengerungMonate: 0,
    kuendigungsfristMonate: 0,
    provisioning: 'manual_task GBP_EINRICHTUNG für VA',
  },
  {
    key: 'google-ads-starter',
    name: 'Google Ads Starter',
    nutzen: [
      'Fertiges Kampagnen-Setup (Suche + Performance Max) aus Ihrer Website',
      'Werbebudget zahlen Sie immer direkt an Google — volle Kontrolle',
      'Wöchentliche Checks und Monatsreport inklusive, monatlich kündbar',
    ],
    einmalCent: 0,
    monatCent: 9900,
    fulfillment: 'auto',
    touchpoints: ['portal', 'cron-60'],
    laufzeitMonate: 1,
    verlaengerungMonate: 1,
    kuendigungsfristMonate: 1,
    provisioning: 'Kampagnen-Entwurf (Test-Modus) automatisch, MCC-Einladung als manual_task (Phase G)',
  },
]

export function getUpsellProduct(key: string): UpsellProduct | null {
  return UPSELL_PRODUCTS.find((p) => p.key === key) || null
}

/** Plan-Upgrades laufen über denselben Kaufweg: product_key = 'plan-upgrade:<tier>'. */
export const PLAN_UPGRADE_PREFIX = 'plan-upgrade:'

export function istPlanUpgrade(productKey: string): boolean {
  return productKey.startsWith(PLAN_UPGRADE_PREFIX)
}

export function planUpgradeTier(productKey: string): string {
  return productKey.slice(PLAN_UPGRADE_PREFIX.length)
}

/** Nerv-Schutz: abgelehnte/ignorierte Angebote 60 Tage nicht erneut pushen (§10.4). */
export const NERV_SCHUTZ_TAGE = 60

/** KICKOFF_MODE=auto|call — steuert, ob der Kickoff-Touchpoint automatisch läuft. */
export function getKickoffMode(): 'auto' | 'call' {
  return process.env.KICKOFF_MODE === 'call' ? 'call' : 'auto'
}
