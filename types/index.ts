export interface Customer {
  id: string
  user_id: string
  company_name: string | null
  contact_email: string | null
  /** @deprecated Kunden-Cloudflare-Deployment aus MVP entfernt (siehe _legacy/) — DB-Spalte bleibt (additiv). */
  cloudflare_account_id: string | null
  /** @deprecated Kunden-Cloudflare-Deployment aus MVP entfernt (siehe _legacy/) — DB-Spalte bleibt (additiv). */
  cloudflare_api_token: string | null
  created_at: string
}

export interface Site {
  id: string
  customer_id: string
  name: string
  domain: string | null
  /** @deprecated Kunden-Cloudflare-Deployment aus MVP entfernt (siehe _legacy/) — DB-Spalte bleibt (additiv). */
  cloudflare_project_name: string | null
  template_id: string
  config: SiteConfig
  draft_config: SiteConfig
  status: 'draft' | 'published' | 'error'
  multi_page: boolean
  package: 'starter' | 'business' | 'growth'
  created_at: string
  updated_at: string
}

// --- Multi-Page Config ---

export interface MultiPageSiteConfig {
  site: GlobalSiteConfig
  pages: Record<string, PageEntry>
}

export interface GlobalSiteConfig {
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
  }
  branding: {
    logoText: string
  }
  navigation: string[] // pageKeys in order
  footer: {
    text: string
    legalLinks: { label: string; pageKey: string }[]
  }
}

export interface PageEntry {
  template: string
  slug: string // '' for home (root)
  title: string
  metaDescription?: string
  config: Record<string, unknown>
}

export interface PageMeta {
  pageKey: string
  template: string
  slug: string
  title: string
}

// --- Legacy Single-Page Config (kept for backwards compat) ---

export interface SiteConfig {
  // Can be either legacy flat config or multi-page
  site?: GlobalSiteConfig
  pages?: Record<string, PageEntry>
  // Legacy fields
  businessName?: string
  tagline?: string
  description?: string
  primaryColor?: string
  secondaryColor?: string
  backgroundColor?: string
  textColor?: string
  phone?: string
  email?: string
  address?: string
  logoUrl?: string
  heroImageUrl?: string
  heroSubtitle?: string
  heroBadge?: string
  ctaText?: string
  ctaImageUrl?: string
  ownerName?: string
  ownerRole?: string
  ownerImageUrl?: string
  aboutText?: string
  aboutText2?: string
  region?: string
  instagramUrl?: string
  whatsappUrl?: string
  googlemapsUrl?: string
  imprintUrl?: string
  privacyUrl?: string
  stats?: StatItem[]
  services?: ServiceItem[]
  reviews?: ReviewItem[]
  faqItems?: FaqItem[]
  galleryImages?: string[]
  sections?: Section[]
}

export interface StatItem {
  value: string
  label: string
}

export interface ServiceItem {
  icon: string
  title: string
  description: string
}

export interface ReviewItem {
  text: string
  name: string
  source: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface Section {
  id: string
  type: 'hero' | 'about' | 'services' | 'contact' | 'cta' | 'reviews' | 'faq' | 'gallery' | 'intro' | 'custom'
  title?: string
  content?: string
  visible: boolean
  order: number
}

export interface ConfigVersion {
  id: string
  site_id: string
  config: SiteConfig
  created_by: 'user' | 'chatbot' | 'system'
  description: string | null
  created_at: string
}

export interface ChatMessage {
  id: string
  site_id: string
  role: 'user' | 'assistant'
  content: string
  config_changes: Partial<SiteConfig> | null
  created_at: string
}

export function isMultiPageConfig(config: SiteConfig): config is SiteConfig & { site: GlobalSiteConfig; pages: Record<string, PageEntry> } {
  return !!config.site && !!config.pages
}

// ============================================================
// Vertragsabschluss-System
// ============================================================

export type VertragsStatus =
  | 'ENTWURF'
  | 'ANGEBOT_VERSENDET'
  | 'SIGNIERT'
  | 'SEPA_VORBEREITET'
  | 'SEPA_AKTIV'
  | 'ONBOARDING_GEBUCHT'
  | 'WEBSEITE_LIVE'
  | 'ZAHLUNG_AKTIV'
  | 'GEKUENDIGT'
  | 'STORNIERT'

export type DokumentTyp =
  | 'ANGEBOT_UNSIGNIERT'
  | 'ANGEBOT_SIGNIERT'
  | 'AGB_VERSION'
  | 'SEPA_MANDAT_UNSIGNIERT'
  | 'SEPA_MANDAT_SIGNIERT'
  | 'CALL_TRANSCRIPT'
  | 'ONBOARDING_TRANSCRIPT'
  | 'RECHNUNG'
  | 'SONSTIGES'

export interface KundenDokument {
  id: string
  customer_id: string
  typ: DokumentTyp
  dateiname: string
  speicher_url: string
  mime_type: string
  signiert_am: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface VertragsTimeline {
  id: string
  customer_id: string
  ereignis: string
  details: string | null
  created_at: string
}

export interface NeuerVertragForm {
  // Kunde
  firma: string
  ansprechpartner: string
  email: string
  telefon: string
  // Adresse
  strasse: string
  plz: string
  ort: string
  // Steuerlich
  ustIdNr: string
  steuernummer: string
  unternehmerBestaetigt: boolean
  // Bank
  ibanKunde: string
  bicKunde?: string
  // Paket
  paket: 'starter' | 'business' | 'growth'
  upsells: string[]
  // Vertrag
  contractYears: number
  contractStart: string
  // Closer
  closerName: string
  closerNotiz?: string
  firefliesUrl?: string
  // Optionen
  sendInvitation: boolean
}

export const VERTRAGS_STATUS_LABELS: Record<VertragsStatus, string> = {
  ENTWURF: 'Entwurf',
  ANGEBOT_VERSENDET: 'Angebot versendet',
  SIGNIERT: 'Signiert',
  SEPA_VORBEREITET: 'SEPA vorbereitet',
  SEPA_AKTIV: 'SEPA aktiv',
  ONBOARDING_GEBUCHT: 'Onboarding gebucht',
  WEBSEITE_LIVE: 'Webseite live',
  ZAHLUNG_AKTIV: 'Zahlung aktiv',
  GEKUENDIGT: 'Gekündigt',
  STORNIERT: 'Storniert',
}

export const VERTRAGS_STATUS_COLORS: Record<VertragsStatus, string> = {
  ENTWURF: 'bg-gray-100 text-gray-700',
  ANGEBOT_VERSENDET: 'bg-blue-100 text-blue-700',
  SIGNIERT: 'bg-green-100 text-green-700',
  SEPA_VORBEREITET: 'bg-yellow-100 text-yellow-700',
  SEPA_AKTIV: 'bg-green-100 text-green-700',
  ONBOARDING_GEBUCHT: 'bg-purple-100 text-purple-700',
  WEBSEITE_LIVE: 'bg-emerald-100 text-emerald-700',
  ZAHLUNG_AKTIV: 'bg-emerald-100 text-emerald-700',
  GEKUENDIGT: 'bg-red-100 text-red-700',
  STORNIERT: 'bg-red-100 text-red-700',
}
