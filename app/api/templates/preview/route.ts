import { renderTemplate } from '@/lib/template-renderer'
import { getTemplateDefaults } from '@/lib/template-configs'
import { isPremiumTemplate, renderPremiumTemplate } from '@/lib/templates'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const templateId = searchParams.get('id') || 'business-basic'
  const name = searchParams.get('name') || 'Musterfirma GmbH'

  if (isPremiumTemplate(templateId)) {
    // Render premium template with minimal demo config
    const demoConfig = buildPremiumDemoConfig(templateId, name)
    const html = renderPremiumTemplate(templateId, demoConfig)
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  const config = getTemplateDefaults(templateId, name)
  const html = renderTemplate(config)

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function buildPremiumDemoConfig(templateId: string, name: string): Record<string, unknown> {
  // Base config that works for all premium templates
  return {
    businessName: name,
    tagline: `${name} — Ihr Partner vor Ort`,
    heroHeadline: name,
    heroAccent: 'Qualität',
    heroLead: `Willkommen bei ${name}. Wir stehen für Qualität, Zuverlässigkeit und persönlichen Service.`,
    heroTag: 'Jetzt neu',
    ctaText: 'Jetzt anfragen',
    colors: getDefaultColors(templateId),
    phone: '030 123 456 78',
    email: 'info@musterfirma.de',
    address: 'Musterstraße 12, 10115 Berlin',
    stats: [
      { value: '200+', label: 'Zufriedene Kunden' },
      { value: '15+', label: 'Jahre Erfahrung' },
      { value: '4.9★', label: 'Google Bewertung' },
    ],
    services: [
      { icon: '⭐', title: 'Beratung', description: 'Individuelle Beratung für Ihre Anforderungen.' },
      { icon: '🔧', title: 'Umsetzung', description: 'Professionelle Umsetzung mit Qualitätsgarantie.' },
      { icon: '🛡️', title: 'Service', description: 'Zuverlässiger Service — auch nach dem Projekt.' },
      { icon: '📞', title: 'Support', description: 'Schnelle Hilfe wenn Sie uns brauchen.' },
    ],
    reviews: [
      { text: 'Absolut empfehlenswert! Schnell, professionell und freundlich.', name: 'Thomas K.', source: 'Google', rating: 5 },
      { text: 'Toller Service, faire Preise. Gerne wieder!', name: 'Sandra M.', source: 'Google', rating: 5 },
      { text: 'Endlich ein Partner auf den man sich verlassen kann.', name: 'Peter L.', source: 'Google', rating: 5 },
    ],
    faqItems: [
      { question: 'Wie kann ich Sie kontaktieren?', answer: 'Rufen Sie uns an oder nutzen Sie unser Kontaktformular.' },
      { question: 'Was kostet Ihre Dienstleistung?', answer: 'Kontaktieren Sie uns für ein unverbindliches Angebot.' },
    ],
    trustItems: [
      { text: '200+ zufriedene Kunden' },
      { text: 'Seit 2009' },
      { text: '4.9★ Google' },
    ],
    // Restaurant-specific
    menuCategories: [
      { name: 'Vorspeisen', items: [
        { name: 'Bruschetta', description: 'Mit frischen Tomaten und Basilikum', price: '8,50 €' },
        { name: 'Carpaccio', description: 'Hauchdünn geschnitten mit Rucola', price: '14,50 €' },
      ]},
      { name: 'Hauptgerichte', items: [
        { name: 'Pasta del Giorno', description: 'Tagesfrische Pasta', price: '16,80 €' },
        { name: 'Risotto', description: 'Cremiges Risotto der Saison', price: '18,50 €' },
      ]},
    ],
    openingHours: [
      { days: 'Mo–Fr', hours: '08:00–18:00' },
      { days: 'Sa', hours: '09:00–14:00' },
    ],
    // Fitness-specific
    programs: [
      { icon: '💪', title: 'Krafttraining', description: 'Individuelles Training an modernen Geräten.', features: ['Freihantelfläche', 'Gerätepark'] },
      { icon: '🏃', title: 'Cardio', description: 'Ausdauertraining für Fitness und Gesundheit.', features: ['Laufbänder', 'Crosstrainer'] },
      { icon: '🧘', title: 'Kurse', description: 'Gruppenkurse für jedes Level.', features: ['Yoga', 'Pilates', 'HIIT'] },
    ],
    pricing: [
      { name: 'Basis', price: '29', period: '/Monat', features: ['Gerätepark', 'Cardio-Bereich', 'Umkleiden'], ctaText: 'Auswählen' },
      { name: 'Premium', price: '49', period: '/Monat', features: ['Alles aus Basis', 'Alle Kurse', 'Sauna'], highlighted: true, ctaText: 'Beliebteste Wahl' },
      { name: 'VIP', price: '79', period: '/Monat', features: ['Alles aus Premium', 'Personal Training 1×/Monat', 'Getränke-Flat'], ctaText: 'Auswählen' },
    ],
    trainers: [
      { name: 'Max Müller', role: 'Head Coach', speciality: 'Krafttraining' },
      { name: 'Lisa Schmidt', role: 'Kursleitung', speciality: 'Yoga & Pilates' },
    ],
    // Floristik-specific
    occasions: [
      { icon: '💐', title: 'Geburtstag', description: 'Blumengrüße zum Geburtstag' },
      { icon: '💒', title: 'Hochzeit', description: 'Brautsträuße und Dekoration' },
      { icon: '🎉', title: 'Jubiläum', description: 'Festliche Arrangements' },
    ],
    products: [
      { name: 'Saisonstrauß', description: 'Handgebunden mit Blumen der Saison', price: '38 €', badge: 'Bestseller' },
      { name: 'Rosenstrauß', description: 'Klassiker in verschiedenen Farben', price: '45 €' },
      { name: 'Wildblumenstrauß', description: 'Natürlich und ungezähmt', price: '42 €', badge: 'Neu' },
    ],
    deliveryZones: [
      { zone: 'Innenstadt', time: '2h', price: 'Gratis' },
      { zone: 'Stadtgebiet', time: '4h', price: '4,90 €' },
    ],
    // Hotel-specific
    rooms: [
      { name: 'Standard', description: 'Gemütlich und funktional', price: 'ab 89 €', features: ['WLAN', 'TV', 'Minibar'] },
      { name: 'Superior', description: 'Mehr Platz, mehr Komfort', price: 'ab 129 €', features: ['WLAN', 'TV', 'Minibar', 'Balkon'] },
    ],
    // Immobilien-specific
    properties: [
      { title: '3-Zi.-ETW Altbau', location: 'Mitte', price: '450.000 €', size: '85 m²', rooms: 3 },
      { title: 'Penthouse Neubau', location: 'Prenzlauer Berg', price: '890.000 €', size: '120 m²', rooms: 4 },
    ],
  }
}

function getDefaultColors(templateId: string): Record<string, string> {
  const colorMap: Record<string, Record<string, string>> = {
    'gruenwerk': { primary: '#1f3a2e', secondary: '#a87242', accent: '#faf6ee', background: '#fbf9f3', text: '#1f3a2e' },
    'eisenwerk': { primary: '#0a0a0a', secondary: '#d9f55b', background: '#0a0a0a', text: '#f5f5f4' },
    'trattoria': { primary: '#b8533a', secondary: '#3d4226', accent: '#c89a3a', background: '#f8f1e4', text: '#2a2218' },
    'wildblatt': { primary: '#7a9a6a', secondary: '#d4806a', accent: '#c89a3a', background: '#f8f5ee', text: '#2a3028' },
    'fitness-boutique': { primary: '#e85d50', secondary: '#2a2a2a', accent: '#e85d50', background: '#faf8f5', text: '#2a2a2a' },
    'fitness-frauen': { primary: '#5c2d56', secondary: '#c9a07a', accent: '#c9a07a', background: '#faf6f0', text: '#2a2028' },
    'cafe': { primary: '#3b2a1a', secondary: '#c89a4a', accent: '#c89a4a', background: '#f5f0e8', text: '#3b2a1a' },
    'sushi': { primary: '#3d3b8a', secondary: '#8bc34a', accent: '#8bc34a', background: '#0a0a0a', text: '#f5f5f0' },
    'reinigung-b2b': { primary: '#0f2940', secondary: '#4ecdc4', accent: '#4ecdc4', background: '#f5f8fa', text: '#0f2940' },
    'reinigung-privat': { primary: '#3b82c8', secondary: '#6ecac0', accent: '#3b82c8', background: '#f2f4f6', text: '#1a2030' },
    'reinigung-industrie': { primary: '#3a5a8c', secondary: '#e8722a', accent: '#e8722a', background: '#0e0e0e', text: '#f0f0ed' },
    'floristik-edel': { primary: '#4a2040', secondary: '#c8a96e', accent: '#c8a96e', background: '#faf5ee', text: '#2a1828' },
    'floristik-bio': { primary: '#5c4033', secondary: '#e8b931', accent: '#6b8e4e', background: '#f8f2e6', text: '#3a2e22' },
    'friseur-damen': { primary: '#3a1f35', secondary: '#d4c5a0', accent: '#d4c5a0', background: '#faf6f0', text: '#2a1828' },
    'friseur-unisex': { primary: '#1c1c1c', secondary: '#c9907a', accent: '#c9907a', background: '#f8f6f2', text: '#1c1c1c' },
    'friseur-barbershop': { primary: '#0d0d0d', secondary: '#c8943a', accent: '#6b2a3a', background: '#0d0d0d', text: '#f5f0e8' },
    'arzt-hausarzt': { primary: '#4a7a5a', secondary: '#e8e0d0', accent: '#4a7a5a', background: '#f8faf6', text: '#1a2a1e' },
    'arzt-zahnarzt': { primary: '#2a7ab8', secondary: '#6ecac0', accent: '#6ecac0', background: '#fafcfd', text: '#0e2a4a' },
    'arzt-hautarzt': { primary: '#c4887a', secondary: '#e8dcc8', accent: '#c4887a', background: '#faf8f5', text: '#2a2220' },
    'handwerk-sanitaer': { primary: '#0f2a4a', secondary: '#c87a3a', accent: '#c87a3a', background: '#f5f7fa', text: '#0f2a4a' },
    'handwerk-maler': { primary: '#1a5a5a', secondary: '#c87a5a', accent: '#c87a5a', background: '#faf5ee', text: '#1a3a3a' },
    'handwerk-elektriker': { primary: '#0e0e0e', secondary: '#d9f55b', accent: '#d9f55b', background: '#0e0e0e', text: '#f5f5f0' },
    'anwalt-wirtschaft': { primary: '#0e1f3e', secondary: '#6b2a3a', accent: '#6b2a3a', background: '#f5f0e6', text: '#0e1f3e' },
    'anwalt-steuerberater': { primary: '#1c1c1c', secondary: '#d4a828', accent: '#d4a828', background: '#f8f6f2', text: '#1c1c1c' },
    'anwalt-familie': { primary: '#5a2030', secondary: '#d8c8a8', accent: '#d8c8a8', background: '#faf5ee', text: '#2a1820' },
    'hotel-stadt': { primary: '#1a1a1a', secondary: '#c8b88a', accent: '#c8b88a', background: '#faf8f2', text: '#1a1a1a' },
    'hotel-land': { primary: '#2a4a2e', secondary: '#a87a4a', accent: '#a87a4a', background: '#faf6ee', text: '#1a2a1e' },
    'hotel-nordsee': { primary: '#0e2a4a', secondary: '#d4c4a0', accent: '#d4c4a0', background: '#fafcfd', text: '#0e2a4a' },
    'werkstatt-klassisch': { primary: '#1a1a1a', secondary: '#e87a2a', accent: '#e87a2a', background: '#f5f3f0', text: '#1a1a1a' },
    'werkstatt-bmw': { primary: '#0a0a0a', secondary: '#1a3a6a', accent: '#c0c0c0', background: '#0a0a0a', text: '#f5f5f2' },
    'werkstatt-eauto': { primary: '#1a1a1a', secondary: '#2ec4a0', accent: '#2ec4a0', background: '#f8faf8', text: '#1a1a1a' },
    'immobilien-premium': { primary: '#4a1a2a', secondary: '#c8a040', accent: '#c8a040', background: '#faf5ee', text: '#2a1020' },
    'immobilien-tech': { primary: '#0e2a5a', secondary: '#a8e040', accent: '#a8e040', background: '#f8fafb', text: '#0e2a5a' },
    'immobilien-regional': { primary: '#2a4a30', secondary: '#d4c4a0', accent: '#d4c4a0', background: '#faf8f2', text: '#1a2a1e' },
    'yoga-premium': { primary: '#c4907a', secondary: '#7a9a78', accent: '#7a9a78', background: '#faf8f5', text: '#2a2220' },
    'yoga-pilates': { primary: '#1e1e1e', secondary: '#d4806a', accent: '#d4806a', background: '#faf6f0', text: '#1e1e1e' },
    'yoga-hot': { primary: '#5a1a2a', secondary: '#c89a3a', accent: '#c89a3a', background: '#faf5ee', text: '#2a1018' },
  }
  return colorMap[templateId] || { primary: '#0F172A', secondary: '#3b82f6', accent: '#3b82f6', background: '#f8fafc', text: '#020617' }
}
