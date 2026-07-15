/**
 * Google Ads Starter (Upsell #3, Phase G §11).
 *
 * Templated Kampagnen-Setup (Search + PMax) aus dem Website-Content —
 * IMMER im Test-Modus (test_modus: true), bis das Kunden-Ads-Konto unter
 * unserem MCC verknüpft ist. Das Werbebudget läuft IMMER direkt
 * Kunde ↔ Google, nie über unsere Zahlungsmittel (nur Empfehlung).
 */

export const ADS_PRODUCT_KEY = 'google-ads-starter'

export interface AdsEntwurf {
  kampagnen_name: string
  typ: 'search' | 'pmax'
  test_modus: true
  budget_hinweis: string
  tagesbudget_empfehlung_cent: number
  keywords?: string[]
  anzeigen: {
    headlines: string[]
    descriptions: string[]
  }
  ziel_url: string | null
  standort: string | null
  erstellt_am: string
}

const BUDGET_HINWEIS =
  'Das Werbebudget zahlt der Kunde IMMER direkt an Google (eigenes Zahlungsmittel im Ads-Konto). ' +
  'Der Betrag hier ist nur eine Empfehlung.'

interface SiteFuerAds {
  name: string | null
  config: Record<string, unknown> | null
  domain?: string | null
  subdomain?: string | null
}

function kuerze(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max - 1).trimEnd() + '…'
}

/** Search- + PMax-Kampagnen-Entwurf aus dem Website-Content (deterministisch, ohne API). */
export function generiereAdsEntwuerfe(site: SiteFuerAds): { search: AdsEntwurf; pmax: AdsEntwurf } {
  const config = (site.config || {}) as Record<string, unknown>
  const meta = ((config.meta as Record<string, unknown>) || {}) as Record<string, unknown>
  const inhalte = ((config.inhalte as Record<string, unknown>) || {}) as Record<string, unknown>
  const hero = ((inhalte.hero as Record<string, unknown>) || {}) as Record<string, unknown>

  const firma = (typeof meta.firma === 'string' && meta.firma) || site.name || 'Ihr Betrieb'
  const branche = (typeof config.branche === 'string' && config.branche) || 'Handwerk'
  const ort = (typeof meta.ort === 'string' && meta.ort) || null
  const headline = typeof hero.headline === 'string' ? hero.headline : null
  const subheadline = typeof hero.subheadline === 'string' ? hero.subheadline : null

  const marketingHost = (process.env.NEXT_PUBLIC_MARKETING_HOST || '').replace(/:\d+$/, '')
  const zielUrl = site.domain
    ? `https://${site.domain}`
    : site.subdomain && marketingHost
      ? `https://${site.subdomain}.${marketingHost}`
      : null

  const basis = ort ? `${branche} ${ort}` : branche
  const keywords = [
    basis,
    `${basis} in der Nähe`,
    `${basis} Kosten`,
    `${basis} Angebot`,
    `${basis} Termin`,
    `${branche} Notdienst${ort ? ` ${ort}` : ''}`,
    firma,
  ].map((k) => k.trim())

  // Google-Limits: Headlines max. 30 Zeichen, Descriptions max. 90 Zeichen
  const headlines = [
    kuerze(firma, 30),
    kuerze(ort ? `${branche} in ${ort}` : branche, 30),
    'Jetzt Angebot anfordern',
    'Schnell & zuverlässig',
    kuerze(headline || `${branche} vom Profi`, 30),
  ]
  const descriptions = [
    kuerze(subheadline || `${firma} — Ihr ${branche}-Betrieb${ort ? ` in ${ort}` : ''}. Jetzt unverbindlich anfragen.`, 90),
    kuerze(`Faire Preise, schnelle Termine${ort ? ` in ${ort} und Umgebung` : ''}. Rufen Sie an oder schreiben Sie uns.`, 90),
  ]

  const erstellt_am = new Date().toISOString()
  const standort = ort

  const search: AdsEntwurf = {
    kampagnen_name: kuerze(`Search · ${basis}`, 60),
    typ: 'search',
    test_modus: true,
    budget_hinweis: BUDGET_HINWEIS,
    tagesbudget_empfehlung_cent: 1000, // 10 €/Tag Empfehlung
    keywords,
    anzeigen: { headlines, descriptions },
    ziel_url: zielUrl,
    standort,
    erstellt_am,
  }

  const pmax: AdsEntwurf = {
    kampagnen_name: kuerze(`PMax · ${basis}`, 60),
    typ: 'pmax',
    test_modus: true,
    budget_hinweis: BUDGET_HINWEIS,
    tagesbudget_empfehlung_cent: 1500, // 15 €/Tag Empfehlung
    anzeigen: { headlines, descriptions },
    ziel_url: zielUrl,
    standort,
    erstellt_am,
  }

  return { search, pmax }
}
