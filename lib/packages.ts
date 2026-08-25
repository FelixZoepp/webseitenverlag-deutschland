export type PackageTier = 'starter' | 'business' | 'growth'

export interface PackageDefinition {
  id: PackageTier
  name: string
  emoji: string
  price: number
  label: string
  maxPages: number
  features: string[]
  /** Leistungsbeschreibung für den Stripe-Checkout */
  stripeDescription: string
  /** Einmalige Einrichtungsgebühr in € netto (0 = kein Setup-Posten im Checkout) */
  setupFee: number
  seoLevel: 'basic' | 'local' | 'advanced'
  schemaOrg: boolean
  seoArticles: number
  landingPages: boolean
}

export const PACKAGES: PackageDefinition[] = [
  {
    id: 'starter',
    name: 'Starter',
    emoji: '🥉',
    price: 99,
    label: 'Einstieg',
    maxPages: 1,
    features: [
      '1 professionelle Webseite (One-Pager)',
      'KI-Editor mit Chatbot',
      'Hosting inklusive',
      'Eigene Domain + SSL',
      'Mobile-optimiert',
      'Kontaktformular + Anfragen-Inbox',
      'Spam-Schutz',
      'DSGVO-Paket (Impressum, Datenschutz, Cookie-Banner)',
    ],
    stripeDescription: 'Enthaltene Leistungen: 1 professionelle Webseite (One-Pager), eigene Domain inkl. SSL-Zertifikat, Hosting inklusive, KI-gestützter Website-Editor mit Chatbot, Kontaktformular mit Anfragen-Inbox, Spam-Schutz, mobile-optimiertes Responsive Design, DSGVO-Komplettpaket (Impressum, Datenschutzerklärung, Cookie-Banner). Laufende Betreuung & technischer Support inklusive.',
    setupFee: 0,
    seoLevel: 'basic',
    schemaOrg: false,
    seoArticles: 0,
    landingPages: false,
  },
  {
    id: 'business',
    name: 'Business',
    emoji: '🥈',
    price: 169,
    label: 'Empfehlung',
    maxPages: 5,
    features: [
      'Alles aus Starter',
      '3–5 Unterseiten',
      'Lokales SEO-Setup (Stadt + Branche)',
      'Lokale Keywords in Texten + Meta-Tags',
      'Strukturierte Daten (Schema.org LocalBusiness)',
      'Erweiterte Templates',
    ],
    stripeDescription: 'Enthaltene Leistungen: Professionelle Webseite mit bis zu 5 Unterseiten, eigene Domain inkl. SSL-Zertifikat, Hosting inklusive, KI-gestützter Website-Editor mit Chatbot, Kontaktformular mit Anfragen-Inbox, Spam-Schutz, mobile-optimiertes Responsive Design, DSGVO-Komplettpaket (Impressum, Datenschutzerklärung, Cookie-Banner), lokales SEO-Setup (Stadt + Branche), lokale Keywords in Texten & Meta-Tags, strukturierte Daten (Schema.org LocalBusiness) für bessere Google-Sichtbarkeit, erweiterte Premium-Design-Templates. Laufende Betreuung & technischer Support inklusive.',
    setupFee: 0,
    seoLevel: 'local',
    schemaOrg: true,
    seoArticles: 0,
    landingPages: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    emoji: '🥇',
    price: 249,
    label: 'Premium',
    maxPages: 10,
    features: [
      'Alles aus Business',
      'Bis zu 10 Unterseiten',
      '4 SEO-Artikel pro Monat (KI-generiert)',
      'Programmatische Landing-Pages',
      'Monatlicher Performance-Report',
    ],
    stripeDescription: 'Enthaltene Leistungen: Professionelle Webseite mit bis zu 10 Unterseiten, eigene Domain inkl. SSL-Zertifikat, Hosting inklusive, KI-gestützter Website-Editor mit Chatbot, Kontaktformular mit Anfragen-Inbox, Spam-Schutz, mobile-optimiertes Responsive Design, DSGVO-Komplettpaket (Impressum, Datenschutzerklärung, Cookie-Banner), lokales SEO-Setup (Stadt + Branche), lokale Keywords in Texten & Meta-Tags, strukturierte Daten (Schema.org LocalBusiness) für bessere Google-Sichtbarkeit, erweiterte Premium-Design-Templates, 4 SEO-optimierte Blog-Artikel pro Monat (KI-generiert), programmatische Landing-Pages für lokale Suchbegriffe, monatlicher Performance-Report. Laufende Betreuung & Priority-Support inklusive.',
    setupFee: 0,
    seoLevel: 'advanced',
    schemaOrg: true,
    seoArticles: 4,
    landingPages: true,
  },
]

export function getPackage(tier: PackageTier): PackageDefinition {
  return PACKAGES.find((p) => p.id === tier) || PACKAGES[0]
}
