export type PackageTier = 'starter' | 'business' | 'growth'

export interface PackageDefinition {
  id: PackageTier
  name: string
  emoji: string
  price: number
  label: string
  maxPages: number
  features: string[]
  /** Kurzbeschreibung für den Stripe-Checkout (max ~200 Zeichen) */
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
    stripeDescription: 'Professionelle One-Pager-Website mit eigener Domain, Hosting, KI-Editor, Kontaktformular, DSGVO-Paket & mobilem Design.',
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
    price: 149,
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
    stripeDescription: 'Alles aus Starter + bis zu 5 Unterseiten, lokales SEO-Setup (Stadt + Branche), strukturierte Daten für Google & erweiterte Design-Templates.',
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
    stripeDescription: 'Das Komplettpaket: bis zu 10 Unterseiten, 4 SEO-Artikel/Monat, automatische Landing-Pages, Video-Header, Performance-Reports & Priority-Support.',
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
