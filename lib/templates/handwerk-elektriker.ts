/* eslint-disable @typescript-eslint/no-unused-vars */
// Handwerk-Elektriker Template — Voltage GmbH Frankfurt
// Dark, tech-forward electrician design with volt-yellow accent
// Smart-Home / KNX / Photovoltaik / E-Mobilität focus

export interface HandwerkElektrikerConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Schwarz #0e0e0e
    accent: string     // Volt-Gelb #d9f55b
    secondary: string  // Anthrazit #1c1c1c
    text: string       // Off-White #f5f5f0
  }
  phone?: string
  emergencyPhone?: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  openingHours: { days: string; hours: string }[]
  emergencyBanner?: {
    headline: string
    subline: string
    phone: string
    available: string
  }
  services: {
    name: string
    description: string
    icon?: string
    features?: string[]
  }[]
  techPartners: {
    name: string
    logoUrl?: string
    description?: string
  }[]
  referenceProjects: {
    title: string
    category: string
    description: string
    imageUrl?: string
    details?: string[]
  }[]
  reviews: { text: string; name: string; detail: string; rating: number }[]
  serviceArea?: {
    title?: string
    subtitle?: string
    districts?: string[]
    radius?: string
    mapEmbedUrl?: string
  }
  faqItems?: { question: string; answer: string }[]
  contactFormTitle?: string
  contactFormSubtitle?: string
  contactFields?: { name: string; label: string; type: string; required?: boolean; placeholder?: string; options?: string[] }[]
  heroImageUrl?: string
  footerText?: string
  footerColumns?: { title: string; links: { label: string; href: string }[] }[]
  ctaSectionTitle?: string
  ctaSectionSubtitle?: string
  ctaFeatures?: string[]
  mobileCta?: { text: string; href: string }
  certifications?: string[]
  imprintUrl?: string
  privacyUrl?: string
  ogImageUrl?: string
}

function esc(str: string | undefined): string {
  if (!str) return ''
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function darkenHex(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  const r = Math.max(0, Math.round(parseInt(h.substring(0, 2), 16) * (1 - amount)))
  const g = Math.max(0, Math.round(parseInt(h.substring(2, 4), 16) * (1 - amount)))
  const b = Math.max(0, Math.round(parseInt(h.substring(4, 6), 16) * (1 - amount)))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function tintHex(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  const r = Math.min(255, Math.round(parseInt(h.substring(0, 2), 16) + (255 - parseInt(h.substring(0, 2), 16)) * amount))
  const g = Math.min(255, Math.round(parseInt(h.substring(2, 4), 16) + (255 - parseInt(h.substring(2, 4), 16)) * amount))
  const b = Math.min(255, Math.round(parseInt(h.substring(4, 6), 16) + (255 - parseInt(h.substring(4, 6), 16)) * amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function generateStarsSvg(count: number): string {
  const star = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z" fill="currentColor"/></svg>'
  return Array(Math.min(Math.max(Math.round(count), 0), 5)).fill(star).join('\n            ')
}

// Service icon SVGs for Elektroinstallation domain
const serviceIconMap: Record<string, string> = {
  elektroinstallation: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6l-4 18h16L28 42"/><path d="M18 24h12" stroke-width="2.5"/></svg>',
  'smart-home': '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 24L24 8l18 16"/><path d="M10 22v18h28V22"/><rect x="18" y="28" width="12" height="12" rx="1"/><circle cx="24" cy="34" r="2" fill="currentColor"/><path d="M20 18a6 6 0 0 1 8 0" opacity="0.5"/><path d="M17 15a10 10 0 0 1 14 0" opacity="0.3"/></svg>',
  knx: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="12" width="32" height="24" rx="3"/><circle cx="18" cy="24" r="4"/><circle cx="30" cy="24" r="4"/><path d="M22 24h4"/><path d="M14 8v4M24 8v4M34 8v4"/><path d="M14 36v4M24 36v4M34 36v4"/></svg>',
  photovoltaik: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="10" width="36" height="22" rx="2"/><path d="M6 18h36M6 26h36M18 10v22M30 10v22"/><circle cx="38" cy="6" r="4" fill="currentColor" opacity="0.3"/><path d="M38 2v2M42 6h2M38 10v-2M34 6h-2M41 3l-1.5 1.5M41 9l-1.5-1.5M35 3l1.5 1.5M35 9l1.5-1.5" stroke-width="1.5" opacity="0.3"/><path d="M20 32l4 8 4-8"/></svg>',
  wallbox: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="12" y="6" width="24" height="32" rx="4"/><circle cx="24" cy="20" r="8"/><path d="M21 17l-1 6h8l-1-6" stroke-width="2.5"/><circle cx="24" cy="20" r="2" fill="currentColor"/><path d="M24 38v4M20 42h8"/></svg>',
  'e-mobilitaet': '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 32h32"/><path d="M12 32V18a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v14"/><circle cx="16" cy="34" r="3"/><circle cx="32" cy="34" r="3"/><path d="M22 20l-2 8h8l-2-8" stroke-width="2.5"/></svg>',
  verteiler: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="8" width="32" height="32" rx="3"/><path d="M8 16h32M8 24h32M8 32h32"/><circle cx="16" cy="12" r="2" fill="currentColor"/><circle cx="24" cy="20" r="2" fill="currentColor"/><circle cx="32" cy="28" r="2" fill="currentColor"/><rect x="14" y="26" width="4" height="4" rx="1" fill="currentColor" opacity="0.4"/><rect x="30" y="34" width="4" height="4" rx="1" fill="currentColor" opacity="0.4"/></svg>',
  fi: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="14" y="6" width="20" height="36" rx="3"/><circle cx="24" cy="20" r="6"/><path d="M24 14v12" stroke-width="2.5"/><rect x="20" y="32" width="8" height="4" rx="1" fill="currentColor" opacity="0.4"/></svg>',
  beleuchtung: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M24 4a14 14 0 0 1 8 25.4V34H16v-4.6A14 14 0 0 1 24 4z"/><path d="M18 34h12v4a2 2 0 0 1-2 2H20a2 2 0 0 1-2-2v-4z"/><path d="M20 40h8v2H20z"/><path d="M18 22h12" opacity="0.3"/><path d="M20 18h8" opacity="0.2"/></svg>',
  speicher: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="10" y="10" width="28" height="28" rx="4"/><path d="M10 20h28M10 28h28M10 36h28"/><rect x="14" y="12" width="6" height="6" rx="1" fill="currentColor" opacity="0.3"/><rect x="22" y="12" width="6" height="6" rx="1" fill="currentColor" opacity="0.2"/><path d="M34 6l4 4M14 42l-4 4" stroke-width="2.5"/></svg>',
}

const checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>'

const boltSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 10 10-12h-9l1-10z"/></svg>'

export function renderHandwerkElektrikerTemplate(config: HandwerkElektrikerConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primaryDark = darkenHex(c.colors.primary, 0.3)
  const secondaryLight = tintHex(c.colors.secondary, 0.15)
  const accentDark = darkenHex(c.colors.accent, 0.2)
  const accentSoft = hexToRgba(c.colors.accent, 0.12)
  const accentGlow = hexToRgba(c.colors.accent, 0.35)
  const textSoft = hexToRgba(c.colors.text, 0.7)
  const textDim = hexToRgba(c.colors.text, 0.45)
  const borderColor = hexToRgba(c.colors.text, 0.08)
  const borderHover = hexToRgba(c.colors.accent, 0.3)

  const logoInitial = esc(c.businessName.charAt(0).toUpperCase())
  const businessNameEsc = esc(c.businessName)

  // Emergency banner
  const emergencyBanner = c.emergencyBanner || {
    headline: '24h Elektro-Notdienst',
    subline: 'Kurzschluss, Stromausfall, defekte FI-Schutzschalter',
    phone: c.emergencyPhone || c.phone || '',
    available: 'Rund um die Uhr erreichbar'
  }

  // Mobile CTA
  const mobileCta = c.mobileCta || { text: c.ctaText || 'Jetzt anfragen', href: '#contact' }

  // Service area
  const serviceArea = c.serviceArea || { title: 'Unser Einsatzgebiet', subtitle: 'Frankfurt und Rhein-Main-Gebiet', districts: [], radius: '30 km' }

  // Contact fields defaults
  const contactFields = c.contactFields || [
    { name: 'name', label: 'Vor- und Nachname', type: 'text', required: true, placeholder: 'Max Mustermann' },
    { name: 'email', label: 'E-Mail', type: 'email', required: true, placeholder: 'max@beispiel.de' },
    { name: 'phone', label: 'Telefon', type: 'tel', required: false, placeholder: '+49 69 ...' },
    { name: 'service', label: 'Gewünschte Leistung', type: 'select', required: false, options: ['Elektroinstallation', 'Smart-Home / KNX', 'Photovoltaik', 'Wallbox / E-Mobilität', 'Verteiler / FI-Schutzschalter', 'Beleuchtungsplanung', 'Notdienst', 'Sonstiges'] },
    { name: 'message', label: 'Ihre Nachricht', type: 'textarea', required: false, placeholder: 'Beschreiben Sie Ihr Anliegen...' },
  ]

  // FAQ defaults
  const faqItems = c.faqItems || [
    { question: 'Wie schnell sind Sie bei einem Notfall vor Ort?', answer: 'In Frankfurt und dem direkten Rhein-Main-Gebiet sind wir in der Regel innerhalb von 30–60 Minuten bei Ihnen. Unser 24h-Notdienst ist rund um die Uhr erreichbar.' },
    { question: 'Installieren Sie auch KNX Smart-Home-Systeme?', answer: 'Ja, wir sind zertifizierte KNX-Partner und planen, installieren und programmieren komplette Smart-Home-Systeme — von der Einzelraumsteuerung bis zur vollintegrierten Gebäudeautomation.' },
    { question: 'Welche Photovoltaik-Anlagen empfehlen Sie?', answer: 'Wir arbeiten mit führenden Herstellern zusammen und dimensionieren jede Anlage individuell. Von der 5 kWp Dachanlage bis zur gewerblichen 100+ kWp Lösung mit Speicher — alles aus einer Hand.' },
    { question: 'Wie lange dauert die Installation einer Wallbox?', answer: 'Eine Standard-Wallbox-Installation dauert ca. 4–6 Stunden. Voraussetzung ist ein vorhandener Starkstromanschluss. Wir kümmern uns auch um die Anmeldung beim Netzbetreiber.' },
    { question: 'Prüfen Sie auch bestehende Elektroinstallationen?', answer: 'Ja, wir führen den E-Check nach DIN VDE 0100 durch — für Privathaushalte, Gewerbe und Industrie. Regelmäßige Prüfungen sind gesetzlich vorgeschrieben und erhöhen die Sicherheit.' },
  ]

  // CTA features
  const ctaFeatures = c.ctaFeatures || ['Kostenlose Erstberatung', 'Festpreisgarantie', '24h Notdienst', 'Meisterbetrieb']

  // Nav links
  const navLinks = [
    { label: 'Leistungen', href: '#services' },
    { label: 'Technologie', href: '#partners' },
    { label: 'Projekte', href: '#projects' },
    { label: 'Bewertungen', href: '#reviews' },
    { label: 'Kontakt', href: '#contact' },
  ]

  // Hero visual
  const heroVisualStyle = c.heroImageUrl
    ? `background: url('${esc(c.heroImageUrl)}') center/cover no-repeat;`
    : `background: linear-gradient(180deg, transparent 40%, ${hexToRgba(c.colors.primary, 0.85)}), linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #0e0e0e 100%);`

  // Opening hours HTML
  const hoursHtml = c.openingHours.map(h => `<div class="hours-row"><span class="hours-day">${esc(h.days)}</span><span class="hours-time">${esc(h.hours)}</span></div>`).join('\n          ')

  // Services HTML
  const servicesHtml = c.services.map((s, i) => {
    const iconKey = (s.icon || s.name || '').toLowerCase()
      .replace(/[äÄ]/g, 'ae').replace(/[öÖ]/g, 'oe').replace(/[üÜ]/g, 'ue').replace(/[ß]/g, 'ss')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const icon = serviceIconMap[iconKey] || serviceIconMap['elektroinstallation']
    const featuresHtml = s.features && s.features.length > 0
      ? `<ul class="service-features">${s.features.map(f => `<li>${checkSvg}<span>${esc(f)}</span></li>`).join('')}</ul>`
      : ''
    return `<div class="service-card animate-in" style="animation-delay:${i * 80}ms">
        <div class="service-icon">${icon}</div>
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.description)}</p>
        ${featuresHtml}
      </div>`
  }).join('\n      ')

  // Tech partners HTML
  const partnersHtml = c.techPartners.map(p => `<div class="partner-card animate-in">
        ${p.logoUrl ? `<img src="${esc(p.logoUrl)}" alt="${esc(p.name)}" loading="lazy" class="partner-logo">` : `<div class="partner-name-badge">${esc(p.name)}</div>`}
        <div class="partner-info">
          <h4>${esc(p.name)}</h4>
          ${p.description ? `<p>${esc(p.description)}</p>` : ''}
        </div>
      </div>`).join('\n      ')

  // Reference projects HTML
  const projectsHtml = c.referenceProjects.map((p, i) => `<div class="project-card animate-in" style="animation-delay:${i * 100}ms">
        <div class="project-visual" ${p.imageUrl ? `style="background:url('${esc(p.imageUrl)}') center/cover no-repeat"` : `style="background:linear-gradient(160deg, ${tintHex(c.colors.secondary, 0.15 + i * 0.08)}, ${c.colors.secondary})"`}>
          <span class="project-category">${esc(p.category)}</span>
        </div>
        <div class="project-body">
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.description)}</p>
          ${p.details && p.details.length > 0 ? `<ul class="project-details">${p.details.map(d => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
        </div>
      </div>`).join('\n      ')

  // Reviews HTML
  const reviewsHtml = c.reviews.map((r, i) => `<div class="review-card animate-in" style="animation-delay:${i * 80}ms">
        <div class="review-stars">${generateStarsSvg(r.rating)}</div>
        <p class="review-text">&ldquo;${esc(r.text)}&rdquo;</p>
        <div class="review-author">
          <div class="review-avatar">${esc(r.name.charAt(0).toUpperCase())}</div>
          <div>
            <div class="review-name">${esc(r.name)}</div>
            <div class="review-detail">${esc(r.detail)}</div>
          </div>
        </div>
      </div>`).join('\n      ')

  // Service area districts
  const districtsHtml = (serviceArea.districts || []).map(d => `<span class="district-badge">${esc(d)}</span>`).join('\n          ')

  // FAQ HTML
  const faqHtml = faqItems.map((f, i) => `<div class="faq-item">
        <button class="faq-q" aria-expanded="false" aria-controls="faq-a-${i}">
          <span>${esc(f.question)}</span>
          <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="faq-a" id="faq-a-${i}">
          <p>${esc(f.answer)}</p>
        </div>
      </div>`).join('\n      ')

  // Contact fields HTML
  const contactFieldsHtml = contactFields.map(f => {
    if (f.type === 'textarea') {
      return `<div class="form-field full-width">
            <label for="field-${esc(f.name)}">${esc(f.label)}${f.required ? ' *' : ''}</label>
            <textarea id="field-${esc(f.name)}" name="${esc(f.name)}" rows="4" ${f.required ? 'required' : ''} placeholder="${esc(f.placeholder || '')}"></textarea>
          </div>`
    }
    if (f.type === 'select' && f.options) {
      return `<div class="form-field">
            <label for="field-${esc(f.name)}">${esc(f.label)}${f.required ? ' *' : ''}</label>
            <select id="field-${esc(f.name)}" name="${esc(f.name)}" ${f.required ? 'required' : ''}>
              <option value="">Bitte w\u00e4hlen</option>
              ${f.options.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join('\n              ')}
            </select>
          </div>`
    }
    return `<div class="form-field">
          <label for="field-${esc(f.name)}">${esc(f.label)}${f.required ? ' *' : ''}</label>
          <input type="${esc(f.type)}" id="field-${esc(f.name)}" name="${esc(f.name)}" ${f.required ? 'required' : ''} placeholder="${esc(f.placeholder || '')}">
        </div>`
  }).join('\n        ')

  // Footer columns
  const footerColumnsHtml = (c.footerColumns || [
    { title: 'Leistungen', links: [
      { label: 'Elektroinstallation', href: '#services' },
      { label: 'Smart-Home / KNX', href: '#services' },
      { label: 'Photovoltaik', href: '#services' },
      { label: 'Wallbox / E-Mobilit\u00e4t', href: '#services' },
      { label: 'Beleuchtungsplanung', href: '#services' },
    ]},
    { title: 'Unternehmen', links: [
      { label: 'Projekte', href: '#projects' },
      { label: 'Bewertungen', href: '#reviews' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Kontakt', href: '#contact' },
    ]},
  ]).map(col => `<div class="footer-col">
        <h4>${esc(col.title)}</h4>
        <ul>${col.links.map(l => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('')}</ul>
      </div>`).join('\n      ')

  // CTA features HTML
  const ctaFeaturesHtml = ctaFeatures.map(f => `<span class="cta-feature">${checkSvg}${esc(f)}</span>`).join('\n        ')

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${businessNameEsc} | ${esc(c.tagline)}</title>
<meta name="description" content="${esc(c.tagline)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${appUrl}${siteId ? `/s/${siteId}` : ''}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,400..900,30..100&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">

<!-- Open Graph -->
<meta property="og:title" content="${businessNameEsc} | ${esc(c.tagline)}">
<meta property="og:description" content="${esc(c.heroLead)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${appUrl}${siteId ? `/s/${siteId}` : ''}">
${c.ogImageUrl ? `<meta property="og:image" content="${esc(c.ogImageUrl)}">` : ''}

<!-- Schema.org Electrician -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Electrician",
  "name": "${businessNameEsc}",
  "description": "${esc(c.tagline)}",
  ${c.address ? `"address": {
    "@type": "PostalAddress",
    "streetAddress": "${esc(c.address)}"${c.postalCode ? `,\n    "postalCode": "${esc(c.postalCode)}"` : ''}${c.city ? `,\n    "addressLocality": "${esc(c.city)}",\n    "addressCountry": "DE"` : ''}
  },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  "priceRange": "$$",
  "currenciesAccepted": "EUR",
  "paymentAccepted": "Cash, EC, \u00dcberweisung",
  ${c.reviews.length > 0 ? `"aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "${(c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length).toFixed(1)}",
    "reviewCount": "${c.reviews.length}",
    "bestRating": "5"
  },` : ''}
  "openingHoursSpecification": [${c.openingHours.map(h => `{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": "${esc(h.days)}",
    "opens": "${esc(h.hours.split(' ')[0] || '')}",
    "closes": "${esc(h.hours.split(' ').pop() || '')}"
  }`).join(',')}],
  "areaServed": ${(serviceArea.districts || []).length > 0 ? JSON.stringify(serviceArea.districts) : `"${esc(c.city || 'Frankfurt am Main')}"`},
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Elektriker-Leistungen",
    "itemListElement": [${c.services.map(s => `{
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "${esc(s.name)}",
        "description": "${esc(s.description)}"
      }
    }`).join(',')}]
  },
  "url": "${appUrl}${siteId ? `/s/${siteId}` : ''}"
}
</script>

<style>
  /* ========================================
     DESIGN TOKENS
     ======================================== */
  :root {
    --schwarz:         ${esc(c.colors.primary)};
    --schwarz-dark:    ${primaryDark};
    --volt:            ${esc(c.colors.accent)};
    --volt-dark:       ${accentDark};
    --volt-soft:       ${accentSoft};
    --volt-glow:       ${accentGlow};
    --anthrazit:       ${esc(c.colors.secondary)};
    --anthrazit-light: ${secondaryLight};
    --text:            ${esc(c.colors.text)};
    --text-soft:       ${textSoft};
    --text-dim:        ${textDim};
    --border:          ${borderColor};
    --border-hover:    ${borderHover};

    --font-display: 'Fraunces', Georgia, serif;
    --font-body:    'Inter Tight', -apple-system, sans-serif;
    --font-mono:    'JetBrains Mono', 'SF Mono', monospace;

    --radius-sm: 6px;
    --radius-md: 12px;
    --radius-lg: 20px;
    --radius-xl: 28px;
    --max-w: 1200px;
    --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ========================================
     RESET & BASE
     ======================================== */
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
  body {
    font-family: var(--font-body);
    background: var(--schwarz);
    color: var(--text);
    line-height: 1.7;
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }
  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; display: block; }
  ul { list-style: none; }
  button, input, select, textarea { font-family: inherit; font-size: inherit; }

  .container { max-width: var(--max-w); margin: 0 auto; padding: 0 24px; }

  /* ========================================
     TYPOGRAPHY
     ======================================== */
  .display {
    font-family: var(--font-display);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.02em;
    font-variation-settings: 'SOFT' 60;
  }
  .display em {
    font-style: normal;
    color: var(--volt);
  }
  .eyebrow {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--volt);
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }
  .eyebrow::before {
    content: '';
    width: 24px;
    height: 1.5px;
    background: var(--volt);
    display: inline-block;
  }
  .section-head {
    max-width: 680px;
    margin-bottom: 56px;
  }
  .section-head .display { font-size: clamp(1.8rem, 3.5vw, 2.8rem); margin-bottom: 16px; }
  .section-head p { color: var(--text-soft); font-size: 1.05rem; line-height: 1.7; }

  /* ========================================
     BUTTONS
     ======================================== */
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--volt);
    color: var(--schwarz);
    font-weight: 600;
    font-size: 0.92rem;
    padding: 14px 28px;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    transition: var(--transition);
    font-family: var(--font-body);
    letter-spacing: 0.01em;
  }
  .btn-primary:hover {
    background: var(--volt-dark);
    transform: translateY(-1px);
    box-shadow: 0 8px 24px ${hexToRgba(c.colors.accent, 0.25)};
  }
  .btn-primary svg { width: 18px; height: 18px; }
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: var(--text);
    font-weight: 500;
    font-size: 0.92rem;
    padding: 13px 26px;
    border-radius: 50px;
    border: 1.5px solid var(--border);
    cursor: pointer;
    transition: var(--transition);
  }
  .btn-secondary:hover { border-color: var(--volt); color: var(--volt); }

  /* ========================================
     EMERGENCY BANNER
     ======================================== */
  .emergency-banner {
    background: var(--volt);
    color: var(--schwarz);
    padding: 10px 24px;
    text-align: center;
    font-size: 0.85rem;
    font-weight: 600;
    position: relative;
    z-index: 1001;
    overflow: hidden;
  }
  .emergency-banner::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 300%; height: 100%;
    background: repeating-linear-gradient(
      90deg,
      transparent, transparent 40px,
      ${hexToRgba(c.colors.primary, 0.04)} 40px,
      ${hexToRgba(c.colors.primary, 0.04)} 80px
    );
    animation: emergencySlide 20s linear infinite;
  }
  @keyframes emergencySlide { to { transform: translateX(33.33%); } }
  .emergency-inner {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
    max-width: var(--max-w);
    margin: 0 auto;
  }
  .emergency-inner svg { width: 20px; height: 20px; flex-shrink: 0; }
  .emergency-inner a {
    color: var(--schwarz);
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .emergency-tag {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    background: var(--schwarz);
    color: var(--volt);
    padding: 2px 10px;
    border-radius: 50px;
    text-transform: uppercase;
  }

  /* ========================================
     NAVIGATION
     ======================================== */
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 16px 0;
    transition: var(--transition);
    background: transparent;
  }
  .nav.has-banner { top: 42px; }
  .nav.scrolled {
    background: ${hexToRgba(c.colors.primary, 0.95)};
    backdrop-filter: blur(16px);
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
  }
  .nav.scrolled.has-banner { top: 0; }
  .nav-inner {
    max-width: var(--max-w);
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.15rem;
    color: var(--text);
    letter-spacing: -0.01em;
  }
  .nav-brand-icon {
    width: 36px;
    height: 36px;
    background: var(--volt);
    color: var(--schwarz);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 1rem;
  }
  .nav-brand-icon svg { width: 18px; height: 18px; stroke: var(--schwarz); }
  .nav-links {
    display: flex;
    align-items: center;
    gap: 32px;
  }
  .nav-links a {
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--text-soft);
    transition: var(--transition);
    position: relative;
  }
  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 1.5px;
    background: var(--volt);
    transition: var(--transition);
  }
  .nav-links a:hover { color: var(--text); }
  .nav-links a:hover::after { width: 100%; }
  .nav-cta {
    background: var(--volt);
    color: var(--schwarz);
    font-weight: 600;
    font-size: 0.85rem;
    padding: 10px 22px;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    transition: var(--transition);
  }
  .nav-cta:hover { background: var(--volt-dark); }
  .nav-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
  }
  .nav-toggle span {
    display: block;
    width: 24px;
    height: 2px;
    background: var(--text);
    margin: 5px 0;
    transition: var(--transition);
    border-radius: 2px;
  }
  .nav-mobile {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${hexToRgba(c.colors.primary, 0.98)};
    backdrop-filter: blur(20px);
    z-index: 999;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
  }
  .nav-mobile.open { display: flex; }
  .nav-mobile a {
    font-family: var(--font-display);
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--text);
    transition: var(--transition);
  }
  .nav-mobile a:hover { color: var(--volt); }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
    padding: 140px 0 80px;
    background: var(--schwarz);
  }
  .hero::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(ellipse 60% 50% at 70% 50%, ${hexToRgba(c.colors.accent, 0.06)}, transparent);
    pointer-events: none;
  }
  .hero-inner {
    max-width: var(--max-w);
    margin: 0 auto;
    padding: 0 24px;
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 60px;
    align-items: center;
    position: relative;
    z-index: 2;
  }
  .hero-content { max-width: 600px; }
  .hero-tag {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--volt);
    background: var(--volt-soft);
    padding: 6px 14px;
    border-radius: 50px;
    display: inline-block;
    margin-bottom: 20px;
    border: 1px solid ${hexToRgba(c.colors.accent, 0.2)};
  }
  .hero h1 {
    font-family: var(--font-display);
    font-size: clamp(2.4rem, 5vw, 3.6rem);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.025em;
    margin-bottom: 20px;
    font-variation-settings: 'SOFT' 50;
  }
  .hero h1 em {
    font-style: normal;
    color: var(--volt);
    position: relative;
  }
  .hero-lead {
    font-size: 1.1rem;
    color: var(--text-soft);
    line-height: 1.75;
    margin-bottom: 32px;
    max-width: 520px;
  }
  .hero-actions {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 40px;
  }
  .hero-stats {
    display: flex;
    gap: 32px;
    padding-top: 32px;
    border-top: 1px solid var(--border);
  }
  .hero-stat-value {
    font-family: var(--font-display);
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--volt);
    line-height: 1;
  }
  .hero-stat-label {
    font-size: 0.78rem;
    color: var(--text-dim);
    margin-top: 4px;
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
  }
  .hero-visual {
    position: relative;
    border-radius: var(--radius-lg);
    overflow: hidden;
    aspect-ratio: 4/5;
    ${heroVisualStyle}
  }
  .hero-visual::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    pointer-events: none;
  }
  .hero-visual-badge {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: ${hexToRgba(c.colors.primary, 0.85)};
    backdrop-filter: blur(12px);
    padding: 12px 16px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .hero-visual-badge svg { width: 24px; height: 24px; color: var(--volt); }
  .hero-visual-badge span {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text);
  }
  .hero-visual-badge small {
    display: block;
    font-size: 0.68rem;
    color: var(--text-dim);
    font-weight: 400;
  }
  .hero-grid-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image:
      linear-gradient(${hexToRgba(c.colors.text, 0.03)} 1px, transparent 1px),
      linear-gradient(90deg, ${hexToRgba(c.colors.text, 0.03)} 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
    z-index: 1;
  }

  /* ========================================
     SERVICES
     ======================================== */
  .services {
    padding: 100px 0;
    background: var(--anthrazit);
    position: relative;
  }
  .services::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border), transparent);
  }
  .services-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .service-card {
    background: var(--schwarz);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 32px 28px;
    transition: var(--transition);
    position: relative;
    overflow: hidden;
  }
  .service-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: var(--volt);
    transform: scaleX(0);
    transition: var(--transition);
    transform-origin: left;
  }
  .service-card:hover { border-color: var(--border-hover); transform: translateY(-4px); }
  .service-card:hover::before { transform: scaleX(1); }
  .service-icon {
    width: 52px;
    height: 52px;
    background: var(--volt-soft);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    color: var(--volt);
  }
  .service-icon svg { width: 28px; height: 28px; }
  .service-card h3 {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 700;
    margin-bottom: 10px;
    color: var(--text);
  }
  .service-card p {
    font-size: 0.9rem;
    color: var(--text-soft);
    line-height: 1.65;
    margin-bottom: 14px;
  }
  .service-features { display: flex; flex-direction: column; gap: 6px; }
  .service-features li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.82rem;
    color: var(--text-dim);
  }
  .service-features svg { width: 14px; height: 14px; color: var(--volt); flex-shrink: 0; }

  /* ========================================
     TECH PARTNERS
     ======================================== */
  .partners {
    padding: 80px 0;
    background: var(--schwarz);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .partners-inner {
    text-align: center;
    margin-bottom: 48px;
  }
  .partners-inner .eyebrow { justify-content: center; }
  .partners-inner h2 { font-size: clamp(1.4rem, 2.5vw, 2rem); }
  .partners-grid {
    display: flex;
    justify-content: center;
    gap: 40px;
    flex-wrap: wrap;
    align-items: stretch;
  }
  .partner-card {
    background: var(--anthrazit);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 28px 32px;
    text-align: center;
    min-width: 200px;
    flex: 0 1 280px;
    transition: var(--transition);
  }
  .partner-card:hover { border-color: var(--border-hover); }
  .partner-logo {
    height: 40px;
    margin: 0 auto 16px;
    object-fit: contain;
    filter: brightness(0) invert(1);
    opacity: 0.7;
    transition: var(--transition);
  }
  .partner-card:hover .partner-logo { opacity: 1; }
  .partner-name-badge {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 12px;
  }
  .partner-info h4 {
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 6px;
  }
  .partner-info p {
    font-size: 0.82rem;
    color: var(--text-dim);
    line-height: 1.5;
  }

  /* ========================================
     REFERENCE PROJECTS
     ======================================== */
  .projects {
    padding: 100px 0;
    background: var(--anthrazit);
  }
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
  }
  .project-card {
    background: var(--schwarz);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
    transition: var(--transition);
  }
  .project-card:hover { border-color: var(--border-hover); transform: translateY(-4px); }
  .project-visual {
    height: 220px;
    position: relative;
    display: flex;
    align-items: flex-end;
    padding: 16px;
  }
  .project-category {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: ${hexToRgba(c.colors.primary, 0.8)};
    color: var(--volt);
    padding: 4px 12px;
    border-radius: 50px;
    backdrop-filter: blur(8px);
  }
  .project-body { padding: 24px; }
  .project-body h3 {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--text);
  }
  .project-body p {
    font-size: 0.88rem;
    color: var(--text-soft);
    line-height: 1.65;
    margin-bottom: 12px;
  }
  .project-details {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .project-details li {
    font-size: 0.72rem;
    font-family: var(--font-mono);
    color: var(--volt);
    background: var(--volt-soft);
    padding: 3px 10px;
    border-radius: 50px;
    letter-spacing: 0.02em;
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews-section {
    padding: 100px 0;
    background: var(--schwarz);
  }
  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .review-card {
    background: var(--anthrazit);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 28px;
    transition: var(--transition);
  }
  .review-card:hover { border-color: var(--border-hover); }
  .review-stars {
    display: flex;
    gap: 2px;
    margin-bottom: 16px;
    color: var(--volt);
  }
  .review-text {
    font-size: 0.92rem;
    color: var(--text-soft);
    line-height: 1.7;
    margin-bottom: 20px;
    font-style: italic;
  }
  .review-author {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .review-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--volt-soft);
    color: var(--volt);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.85rem;
  }
  .review-name {
    font-weight: 600;
    font-size: 0.88rem;
    color: var(--text);
  }
  .review-detail {
    font-size: 0.76rem;
    color: var(--text-dim);
  }

  /* ========================================
     SERVICE AREA
     ======================================== */
  .service-area {
    padding: 80px 0;
    background: var(--anthrazit);
    border-top: 1px solid var(--border);
  }
  .area-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: start;
  }
  .area-info h2 {
    font-family: var(--font-display);
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    font-weight: 700;
    margin-bottom: 12px;
  }
  .area-info h2 em { font-style: normal; color: var(--volt); }
  .area-info > p {
    font-size: 0.95rem;
    color: var(--text-soft);
    margin-bottom: 24px;
    line-height: 1.7;
  }
  .district-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .district-badge {
    font-size: 0.78rem;
    font-family: var(--font-mono);
    color: var(--text-soft);
    background: var(--schwarz);
    border: 1px solid var(--border);
    padding: 6px 14px;
    border-radius: 50px;
    transition: var(--transition);
    letter-spacing: 0.02em;
  }
  .district-badge:hover { border-color: var(--volt); color: var(--volt); }
  .area-radius {
    margin-top: 20px;
    font-size: 0.82rem;
    color: var(--text-dim);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .area-radius svg { width: 16px; height: 16px; color: var(--volt); }
  .area-map {
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid var(--border);
    aspect-ratio: 4/3;
    background: var(--schwarz);
  }
  .area-map iframe { width: 100%; height: 100%; border: none; filter: grayscale(1) invert(1) brightness(0.6) contrast(1.4); }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section {
    padding: 100px 0;
    background: var(--schwarz);
  }
  .faq-list { max-width: 800px; }
  .faq-item {
    border-bottom: 1px solid var(--border);
  }
  .faq-q {
    width: 100%;
    background: none;
    border: none;
    padding: 20px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    text-align: left;
    color: var(--text);
    font-size: 1rem;
    font-weight: 600;
    transition: var(--transition);
  }
  .faq-q:hover { color: var(--volt); }
  .faq-chevron {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    transition: transform 0.3s ease;
    color: var(--text-dim);
  }
  .faq-item.open .faq-chevron { transform: rotate(180deg); color: var(--volt); }
  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s ease, padding 0.35s ease;
    padding: 0;
  }
  .faq-item.open .faq-a {
    max-height: 300px;
    padding: 0 0 20px;
  }
  .faq-a p {
    font-size: 0.9rem;
    color: var(--text-soft);
    line-height: 1.75;
  }

  /* ========================================
     CONTACT FORM
     ======================================== */
  .contact-section {
    padding: 100px 0;
    background: var(--anthrazit);
  }
  .contact-inner {
    display: grid;
    grid-template-columns: 0.9fr 1.1fr;
    gap: 48px;
    align-items: start;
  }
  .contact-info .section-label {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--volt);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .contact-info .section-label::before {
    content: '';
    width: 24px;
    height: 1.5px;
    background: var(--volt);
  }
  .contact-info .section-title {
    font-family: var(--font-display);
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    font-weight: 700;
    margin-bottom: 12px;
    line-height: 1.15;
  }
  .contact-info .section-subtitle {
    font-size: 0.95rem;
    color: var(--text-soft);
    margin-bottom: 28px;
    line-height: 1.7;
  }
  .contact-details { display: flex; flex-direction: column; gap: 14px; margin-bottom: 28px; }
  .contact-detail {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.9rem;
    color: var(--text-soft);
  }
  .contact-detail svg { width: 18px; height: 18px; color: var(--volt); flex-shrink: 0; }
  .contact-detail a { color: var(--text); transition: var(--transition); }
  .contact-detail a:hover { color: var(--volt); }
  .contact-hours h4 {
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text);
  }
  .hours-row {
    display: flex;
    justify-content: space-between;
    max-width: 280px;
    padding: 4px 0;
    font-size: 0.82rem;
  }
  .hours-day { color: var(--text-soft); }
  .hours-time { color: var(--text); font-weight: 500; font-family: var(--font-mono); font-size: 0.78rem; }

  .contact-form-wrap {
    background: var(--schwarz);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 36px;
  }
  .contact-form-wrap h3 {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 24px;
    color: var(--text);
  }
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .form-field { display: flex; flex-direction: column; gap: 6px; }
  .form-field.full-width { grid-column: 1 / -1; }
  .form-field label {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-soft);
    letter-spacing: 0.02em;
  }
  .form-field input,
  .form-field select,
  .form-field textarea {
    background: var(--anthrazit);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px 16px;
    color: var(--text);
    font-size: 0.9rem;
    transition: var(--transition);
    outline: none;
  }
  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus {
    border-color: var(--volt);
    box-shadow: 0 0 0 3px var(--volt-soft);
  }
  .form-field select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }
  .form-field textarea { resize: vertical; min-height: 100px; }
  .form-submit { grid-column: 1 / -1; margin-top: 8px; }
  .form-submit button {
    width: 100%;
    background: var(--volt);
    color: var(--schwarz);
    font-weight: 700;
    font-size: 0.95rem;
    padding: 15px 28px;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .form-submit button:hover { background: var(--volt-dark); box-shadow: 0 8px 28px ${hexToRgba(c.colors.accent, 0.3)}; }
  .form-submit button:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ========================================
     CTA BANNER
     ======================================== */
  .cta-banner {
    padding: 80px 0;
    background: var(--schwarz);
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .cta-banner::before {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    width: 600px; height: 600px;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, ${hexToRgba(c.colors.accent, 0.06)}, transparent 70%);
    pointer-events: none;
  }
  .cta-banner-inner {
    max-width: 700px;
    margin: 0 auto;
    padding: 0 24px;
    position: relative;
    z-index: 1;
  }
  .cta-banner-inner h2 {
    font-family: var(--font-display);
    font-size: clamp(1.8rem, 3.5vw, 2.6rem);
    font-weight: 700;
    margin-bottom: 12px;
    line-height: 1.15;
  }
  .cta-banner-inner p {
    font-size: 1rem;
    color: var(--text-soft);
    margin-bottom: 28px;
    line-height: 1.7;
  }
  .cta-features {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 32px;
  }
  .cta-feature {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.82rem;
    color: var(--text-soft);
    font-weight: 500;
  }
  .cta-feature svg { width: 16px; height: 16px; color: var(--volt); }

  /* ========================================
     FOOTER
     ======================================== */
  .footer {
    padding: 60px 0 24px;
    background: var(--schwarz);
    border-top: 1px solid var(--border);
  }
  .footer-inner { max-width: var(--max-w); margin: 0 auto; padding: 0 24px; }
  .footer-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
  }
  .footer-brand .brand-name {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 10px;
    color: var(--text);
  }
  .footer-brand p {
    font-size: 0.85rem;
    color: var(--text-dim);
    line-height: 1.65;
    max-width: 320px;
    margin-bottom: 12px;
  }
  .footer-col h4 {
    font-size: 0.82rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-soft);
    margin-bottom: 16px;
  }
  .footer-col li { margin-bottom: 8px; }
  .footer-col a {
    font-size: 0.88rem;
    color: var(--text-dim);
    transition: var(--transition);
  }
  .footer-col a:hover { color: var(--volt); }
  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 24px;
    border-top: 1px solid var(--border);
    font-size: 0.78rem;
    color: var(--text-dim);
  }
  .footer-legal { display: flex; gap: 16px; }
  .footer-legal a { color: var(--text-dim); transition: var(--transition); }
  .footer-legal a:hover { color: var(--volt); }

  /* ========================================
     MOBILE CTA BAR
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9998;
    background: var(--schwarz);
    padding: 12px 20px;
    box-shadow: 0 -4px 20px ${hexToRgba(c.colors.primary, 0.4)};
    border-top: 1px solid var(--border);
  }
  .mobile-cta a {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--volt);
    color: var(--schwarz);
    font-weight: 700;
    font-size: 0.92rem;
    padding: 14px 24px;
    border-radius: 50px;
    transition: var(--transition);
  }
  .mobile-cta a:hover { background: var(--volt-dark); }
  .mobile-cta svg { width: 18px; height: 18px; }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .hero-inner { grid-template-columns: 1fr; gap: 40px; }
    .hero-visual { max-height: 400px; aspect-ratio: 16/9; }
    .services-grid { grid-template-columns: repeat(2, 1fr); }
    .projects-grid { grid-template-columns: repeat(2, 1fr); }
    .contact-inner { grid-template-columns: 1fr; }
    .area-content { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 768px) {
    .nav-links { display: none; }
    .nav-toggle { display: block; }
    .hero { padding: 120px 0 60px; }
    .hero h1 { font-size: clamp(1.8rem, 6vw, 2.6rem); }
    .hero-stats { flex-wrap: wrap; gap: 20px; }
    .services-grid { grid-template-columns: 1fr; }
    .reviews-grid { grid-template-columns: 1fr; }
    .projects-grid { grid-template-columns: 1fr; }
    .form-grid { grid-template-columns: 1fr; }
    .cta-features { flex-direction: column; align-items: center; }
    .footer-grid { grid-template-columns: 1fr; gap: 28px; }
    .footer-bottom { flex-direction: column; text-align: center; gap: 12px; }
    .mobile-cta { display: block; }
    body { padding-bottom: 72px; }
    .emergency-inner { font-size: 0.78rem; }
    .partners-grid { gap: 16px; }
    .partner-card { min-width: 160px; padding: 20px; }
  }
  @media (max-width: 480px) {
    .hero-actions { flex-direction: column; }
    .hero-actions .btn-primary,
    .hero-actions .btn-secondary { width: 100%; justify-content: center; }
    .hero-visual { aspect-ratio: 1; }
    .service-card { padding: 24px 20px; }
    .contact-form-wrap { padding: 24px 20px; }
  }

  /* ========================================
     ANIMATIONS
     ======================================== */
  .animate-in {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .animate-in.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* ========================================
     SCROLLBAR (dark theme)
     ======================================== */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: var(--schwarz); }
  ::-webkit-scrollbar-thumb { background: var(--anthrazit-light); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--volt-soft); }
</style>
</head>
<body>

<!-- ==========================================
     24h EMERGENCY BANNER
     ========================================== -->
<div class="emergency-banner" id="emergency-banner">
  <div class="emergency-inner">
    <span class="emergency-tag">${esc(emergencyBanner.available)}</span>
    ${boltSvg}
    <span><strong>${esc(emergencyBanner.headline)}</strong> &mdash; ${esc(emergencyBanner.subline)}</span>
    ${emergencyBanner.phone ? `<a href="tel:${esc(emergencyBanner.phone)}">${esc(emergencyBanner.phone)}</a>` : ''}
  </div>
</div>

<!-- ==========================================
     NAVIGATION (dark)
     ========================================== -->
<nav class="nav has-banner" id="main-nav">
  <div class="nav-inner">
    <a href="#" class="nav-brand">
      <div class="nav-brand-icon">${boltSvg}</div>
      ${businessNameEsc}
    </a>
    <div class="nav-links">
      ${navLinks.map(l => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('\n      ')}
      <a href="#contact" class="nav-cta">${esc(c.ctaText || 'Jetzt anfragen')}</a>
    </div>
    <button class="nav-toggle" id="nav-toggle" aria-label="Men\u00fc \u00f6ffnen">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<!-- Mobile Nav Overlay -->
<div class="nav-mobile" id="nav-mobile">
  ${navLinks.map(l => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('\n  ')}
  <a href="#contact" class="btn-primary" style="margin-top:12px">${esc(c.ctaText || 'Jetzt anfragen')}</a>
</div>

<!-- ==========================================
     HERO (dark, tech)
     ========================================== -->
<section class="hero" id="hero">
  <div class="hero-grid-overlay"></div>
  <div class="hero-inner">
    <div class="hero-content">
      <div class="hero-tag">${esc(c.heroTag)}</div>
      <h1>${esc(c.heroHeadline).replace(esc(c.heroAccent), `<em>${esc(c.heroAccent)}</em>`)}</h1>
      <p class="hero-lead">${esc(c.heroLead)}</p>
      <div class="hero-actions">
        <a href="#contact" class="btn-primary">
          ${esc(c.ctaText || 'Jetzt anfragen')}
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 10h10M11 6l4 4-4 4"/></svg>
        </a>
        <a href="#services" class="btn-secondary">
          Leistungen ansehen
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 5v10M6 11l4 4 4-4"/></svg>
        </a>
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="hero-stat-value">${boltSvg}</div>
          <div class="hero-stat-label">24h Notdienst</div>
        </div>
        ${c.reviews.length > 0 ? `<div class="hero-stat">
          <div class="hero-stat-value">${(c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length).toFixed(1)}</div>
          <div class="hero-stat-label">${c.reviews.length} Bewertungen</div>
        </div>` : ''}
      </div>
    </div>
    <div class="hero-visual">
      <div class="hero-visual-badge">
        ${boltSvg}
        <span>Meisterbetrieb<small>Elektro &bull; Smart-Home &bull; PV</small></span>
      </div>
    </div>
  </div>
</section>

<!-- ==========================================
     SERVICES
     ========================================== -->
<section class="services" id="services">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Leistungen</span>
      <h2 class="display">Unsere <em>Elektro-Leistungen</em></h2>
      <p>Von der Elektroinstallation \u00fcber Smart-Home/KNX bis zur Photovoltaik und Wallbox &mdash; alles aus einer Hand vom Meisterbetrieb.</p>
    </div>
    <div class="services-grid">
      ${servicesHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     TECHNOLOGIE-PARTNER
     ========================================== -->
<section class="partners" id="partners">
  <div class="container">
    <div class="partners-inner">
      <span class="eyebrow" style="justify-content:center">Technologie-Partner</span>
      <h2 class="display">Wir arbeiten mit <em>den Besten</em></h2>
      <p style="color:var(--text-soft);max-width:520px;margin:12px auto 0;font-size:0.95rem">Zertifizierte Partnerschaften mit f\u00fchrenden Herstellern der Elektrotechnik und Geb\u00e4udeautomation.</p>
    </div>
    <div class="partners-grid">
      ${partnersHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     REFERENZ-PROJEKTE
     ========================================== -->
<section class="projects" id="projects">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Referenzen</span>
      <h2 class="display">Ausgew\u00e4hlte <em>Projekte</em></h2>
      <p>Elektroinstallation, Smart-Home-Integration, Photovoltaik-Anlagen und E-Mobilit\u00e4t &mdash; ein Auszug unserer Arbeit.</p>
    </div>
    <div class="projects-grid">
      ${projectsHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     REVIEWS
     ========================================== -->
<section class="reviews-section" id="reviews">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Kundenstimmen</span>
      <h2 class="display">Was unsere <em>Kunden</em> sagen</h2>
    </div>
    <div class="reviews-grid">
      ${reviewsHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     SERVICE-GEBIET
     ========================================== -->
<section class="service-area" id="area">
  <div class="container">
    <div class="area-content">
      <div class="area-info animate-in">
        <span class="eyebrow">Einsatzgebiet</span>
        <h2>${esc(serviceArea.title || 'Unser')} <em>${esc(serviceArea.subtitle || 'Einsatzgebiet')}</em></h2>
        <p>Wir sind f\u00fcr Sie im gesamten Raum ${esc(c.city || 'Frankfurt')} und Umgebung unterwegs &mdash; zuverl\u00e4ssig und schnell.</p>
        ${(serviceArea.districts || []).length > 0 ? `<div class="district-badges">
          ${districtsHtml}
        </div>` : ''}
        ${serviceArea.radius ? `<div class="area-radius">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10zM2 12h20"/></svg>
          Einsatzradius: ${esc(serviceArea.radius)} um ${esc(c.city || 'Frankfurt')}
        </div>` : ''}
      </div>
      ${serviceArea.mapEmbedUrl ? `<div class="area-map animate-in">
        <iframe src="${esc(serviceArea.mapEmbedUrl)}" loading="lazy" title="Einsatzgebiet Karte"></iframe>
      </div>` : `<div class="area-map animate-in" style="display:flex;align-items:center;justify-content:center;color:var(--text-dim);font-size:0.85rem;font-family:var(--font-mono)">Karte: ${esc(c.city || 'Frankfurt')} &amp; Umgebung</div>`}
    </div>
  </div>
</section>

<!-- ==========================================
     FAQ
     ========================================== -->
<section class="faq-section" id="faq">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">FAQ</span>
      <h2 class="display">H\u00e4ufig gestellte <em>Fragen</em></h2>
    </div>
    <div class="faq-list">
      ${faqHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     CONTACT WITH FORM
     ========================================== -->
<section class="contact-section" id="contact">
  <div class="container">
    <div class="contact-inner">
      <div class="contact-info">
        <div class="section-label">Kontakt</div>
        <h2 class="section-title">${esc(c.contactFormTitle || 'Jetzt Beratung anfragen')}</h2>
        <p class="section-subtitle">${esc(c.contactFormSubtitle || 'Wir beraten Sie kostenlos und unverbindlich zu allen Elektro-Leistungen \u2014 vom Smart-Home bis zur Photovoltaik.')}</p>
        <div class="contact-details">
          ${c.phone ? `<div class="contact-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg><a href="tel:${esc(c.phone)}">${esc(c.phone)}</a></div>` : ''}
          ${c.emergencyPhone ? `<div class="contact-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 10 10-12h-9l1-10z"/></svg><a href="tel:${esc(c.emergencyPhone)}" style="color:var(--volt)">Notdienst: ${esc(c.emergencyPhone)}</a></div>` : ''}
          ${c.email ? `<div class="contact-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>` : ''}
          ${c.address ? `<div class="contact-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${esc(c.address)}${c.postalCode ? ', ' + esc(c.postalCode) : ''} ${esc(c.city || '')}</div>` : ''}
        </div>
        <div class="contact-hours">
          <h4>Erreichbarkeit</h4>
          ${hoursHtml}
        </div>
      </div>
      <div class="contact-form-wrap">
        <h3>${esc(c.contactFormTitle || 'Kostenlose Beratung anfragen')}</h3>
        <form id="contact-form">
          <div class="form-grid">
            ${contactFieldsHtml}
            <div class="form-submit">
              <button type="submit" id="contact-submit">
                ${boltSvg}
                ${esc(c.ctaText || 'Jetzt anfragen')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>

<!-- ==========================================
     CTA BANNER
     ========================================== -->
<section class="cta-banner">
  <div class="cta-banner-inner">
    <h2>${esc(c.ctaSectionTitle || 'Bereit f\u00fcr smarte Elektrotechnik?')}</h2>
    <p>${esc(c.ctaSectionSubtitle || 'Lassen Sie sich jetzt kostenlos beraten \u2014 zu Smart-Home, Photovoltaik, Wallbox oder Ihrer n\u00e4chsten Elektroinstallation.')}</p>
    <div class="cta-features">
      ${ctaFeaturesHtml}
    </div>
    <a href="#contact" class="btn-primary">
      ${esc(c.ctaText || 'Jetzt anfragen')}
      <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 10h10M11 6l4 4-4 4"/></svg>
    </a>
  </div>
</section>

<!-- ==========================================
     FOOTER
     ========================================== -->
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="brand-name">${businessNameEsc}</div>
        <p>${esc(c.footerText || c.tagline)}</p>
        ${c.certifications && c.certifications.length > 0 ? `
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px">
          ${c.certifications.map(cert => `<span style="background:var(--volt-soft);border:1px solid ${hexToRgba(c.colors.accent, 0.2)};border-radius:50px;padding:3px 10px;font-size:.7rem;color:var(--volt);font-weight:500">${esc(cert)}</span>`).join('\n          ')}
        </div>` : ''}
      </div>
      ${footerColumnsHtml}
    </div>
    <div class="footer-bottom">
      <span>&copy; ${new Date().getFullYear()} ${businessNameEsc}. Alle Rechte vorbehalten.</span>
      <div class="footer-legal">
        <a href="${esc(c.imprintUrl || '#')}">Impressum</a> &middot;
        <a href="${esc(c.privacyUrl || '#')}">Datenschutz</a>
      </div>
    </div>
  </div>
</footer>

<!-- ==========================================
     MOBILE CTA
     ========================================== -->
<div class="mobile-cta">
  <a href="${esc(mobileCta.href)}">
    ${boltSvg}
    ${esc(mobileCta.text)}
  </a>
</div>

<!-- ==========================================
     SCRIPTS
     ========================================== -->
<script>
  /* Nav scroll behavior */
  (function() {
    var nav = document.getElementById('main-nav');
    var banner = document.getElementById('emergency-banner');
    var bannerH = banner ? banner.offsetHeight : 0;
    window.addEventListener('scroll', function() {
      if (window.scrollY > bannerH) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
      /* Hide emergency banner on scroll */
      if (window.scrollY > 100 && banner) {
        banner.style.transform = 'translateY(-100%)';
        banner.style.transition = 'transform 0.3s ease';
        nav.classList.remove('has-banner');
      } else if (banner) {
        banner.style.transform = 'translateY(0)';
        nav.classList.add('has-banner');
      }
    });
  })();

  /* Mobile nav toggle */
  (function() {
    var toggle = document.getElementById('nav-toggle');
    var mobile = document.getElementById('nav-mobile');
    if (toggle && mobile) {
      toggle.addEventListener('click', function() {
        mobile.classList.toggle('open');
      });
      mobile.querySelectorAll('a').forEach(function(a) {
        a.addEventListener('click', function() { mobile.classList.remove('open'); });
      });
    }
  })();

  /* FAQ accordion */
  document.querySelectorAll('.faq-q').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item = btn.closest('.faq-item');
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function(x) {
        x.classList.remove('open');
        x.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* Scroll animations (IntersectionObserver) */
  (function() {
    var els = document.querySelectorAll('.animate-in');
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });
      els.forEach(function(el) { obs.observe(el); });
    } else {
      els.forEach(function(el) { el.classList.add('visible'); });
    }
  })();

  /* Contact form submission */
  ${siteId ? `(function() {
    var form = document.getElementById('contact-form');
    if (form) {
      form.addEventListener('submit', function(ev) {
        ev.preventDefault();
        var btn = document.getElementById('contact-submit');
        var data = {};
        form.querySelectorAll('input,select,textarea').forEach(function(i) {
          if (i.name && i.value) data[i.name] = i.value;
        });
        if (!data.name || !data.email) { alert('Name und E-Mail sind Pflichtfelder.'); return; }
        btn.textContent = 'Wird gesendet...';
        btn.disabled = true;
        fetch('${appUrl}/api/public/forms/${siteId}/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        .then(function(r) { return r.json(); })
        .then(function(d) {
          if (d.success) {
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:var(--text);font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:var(--text-soft);font-size:1.05rem">Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p></div>';
          } else {
            alert(d.error || 'Fehler beim Senden');
            btn.textContent = '${esc(c.ctaText || 'Jetzt anfragen')}';
            btn.disabled = false;
          }
        })
        .catch(function() {
          alert('Verbindungsfehler');
          btn.textContent = '${esc(c.ctaText || 'Jetzt anfragen')}';
          btn.disabled = false;
        });
      });
    }
  })();` : `(function() {
    var form = document.getElementById('contact-form');
    if (form) {
      form.addEventListener('submit', function(ev) {
        ev.preventDefault();
        alert('Demo \\u2014 kein Formular angebunden.');
      });
    }
  })();`}
</script>

<!-- Cookie Banner -->
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba(c.colors.secondary, 0.97)};backdrop-filter:blur(12px);color:var(--text);padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:var(--text-soft)">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--volt);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--volt);color:var(--schwarz);border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
  </div>
</div>
<script>if(!localStorage.getItem('cookies_accepted')){document.getElementById('cookie-banner').style.display='block'}</script>

${siteId ? `<!-- Tracking -->
<script>
(function(){
  var sid='${siteId}';
  var u='${appUrl}/api/public/track';
  function t(ev,d){try{navigator.sendBeacon(u,JSON.stringify(Object.assign({siteId:sid,event:ev,url:location.href,referrer:document.referrer,userAgent:navigator.userAgent,timestamp:new Date().toISOString()},d||{})))}catch(e){}}
  t('pageview');
  document.addEventListener('click',function(e){var a=e.target.closest('a[href],button');if(a)t('click',{element:a.tagName,text:(a.textContent||'').trim().substring(0,100),href:a.href||''})});
})();
</script>` : ''}

</body>
</html>`
}
