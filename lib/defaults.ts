import { SiteConfig } from '@/types'

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  businessName: 'Mein Unternehmen',
  tagline: 'Willkommen auf unserer Website',
  description: 'Wir freuen uns, Sie hier begrüßen zu dürfen.',
  primaryColor: '#2d5a27',
  secondaryColor: '#e8f0e6',
  backgroundColor: '#faf8f4',
  textColor: '#1a2218',
  heroImageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
  heroSubtitle: 'Ihr zuverlässiger Partner vor Ort.',
  ctaText: 'Jetzt Anfrage senden',
  ctaImageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&q=80',
  aboutText: 'Wir sind ein engagiertes Unternehmen mit Leidenschaft für unsere Arbeit.',
  stats: [
    { value: '100+', label: 'Zufriedene Kunden' },
    { value: '5+', label: 'Jahre Erfahrung' },
  ],
  services: [
    { icon: '⚙️', title: 'Service 1', description: 'Beschreiben Sie hier Ihre erste Dienstleistung.' },
    { icon: '🔧', title: 'Service 2', description: 'Beschreiben Sie hier Ihre zweite Dienstleistung.' },
  ],
  reviews: [],
  faqItems: [],
  galleryImages: [],
  sections: [
    { id: 'hero', type: 'hero', visible: true, order: 0 },
    { id: 'intro', type: 'intro', title: 'Ihr Partner', visible: true, order: 1 },
    { id: 'services', type: 'services', title: 'Unsere Dienstleistungen', visible: true, order: 2 },
    { id: 'about', type: 'about', visible: true, order: 3 },
    { id: 'cta', type: 'cta', title: 'Kontaktieren Sie uns', visible: true, order: 4 },
  ],
}
