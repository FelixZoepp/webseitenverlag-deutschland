export interface AnwaltSteuerberaterConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Anthrazit #1c1c1c
    accent: string     // Senf-Gelb #d4a828
    background: string // Off-White #f8f6f2
    text: string       // Dark text
  }
  phone?: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  openingHours: { days: string; hours: string }[]
  services: {
    name: string
    description: string
    icon?: string
  }[]
  branchenExpertise: {
    name: string
    description: string
    icon?: string
  }[]
  team: {
    name: string
    role: string
    qualifications?: string
    imageUrl?: string
  }[]
  digitalisierung: {
    title?: string
    subtitle?: string
    tools: { name: string; description: string; icon?: string }[]
  }
  reviews: { text: string; name: string; company: string; rating: number }[]
  standort?: {
    title?: string
    subtitle?: string
    districts?: string[]
    mapEmbedUrl?: string
  }
  faqItems?: { question: string; answer: string }[]
  heroImageUrl?: string
  aboutTitle?: string
  aboutText?: string
  aboutText2?: string
  contactEnabled?: boolean
  contactFormTitle?: string
  contactFormSubtitle?: string
  contactFields?: { name: string; label: string; type: string; required?: boolean; placeholder?: string; options?: string[] }[]
  imprintUrl?: string
  privacyUrl?: string
  footerText?: string
  footerColumns?: { title: string; links: { label: string; href: string }[] }[]
  ctaSectionTitle?: string
  ctaSectionSubtitle?: string
  ctaFeatures?: string[]
  mobileCta?: { text: string; href: string }
  ogImageUrl?: string
  trustBadges?: { icon?: string; label: string; sublabel?: string }[]
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
  return Array(count).fill(star).join('\n            ')
}

export function renderAnwaltSteuerberaterTemplate(config: AnwaltSteuerberaterConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primaryDark = darkenHex(c.colors.primary, 0.25)
  const primaryLight = tintHex(c.colors.primary, 0.85)
  const primarySoft = hexToRgba(c.colors.primary, 0.08)
  const accentDark = darkenHex(c.colors.accent, 0.25)
  const accentSoft = hexToRgba(c.colors.accent, 0.12)
  const bgTint = tintHex(c.colors.background, -0.03)
  const bgWarm = tintHex(c.colors.background, -0.06)
  const textSoft = tintHex(c.colors.text, 0.45)
  const borderColor = tintHex(c.colors.background, -0.12)

  const logoInitial = esc(c.businessName.charAt(0))

  // Service icons mapping for Steuerberater
  const serviceIconMap: Record<string, string> = {
    jahresabschluss: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="4" width="32" height="40" rx="3"/><path d="M16 14h16M16 22h16M16 30h10"/><path d="M34 32l-4 4-2-2" stroke="var(--senf)" stroke-width="2.5"/><circle cx="36" cy="38" r="7" fill="var(--senf)" opacity="0.15" stroke="none"/></svg>',
    eur: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="24" cy="24" r="16"/><path d="M16 20h14M16 28h14" stroke-width="2.5"/><path d="M30 16c-4-3-10-2-12 3s-1 12 4 14" stroke="var(--senf)" stroke-width="2"/></svg>',
    ustvoranmeldung: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="8" width="36" height="32" rx="3"/><path d="M6 16h36"/><path d="M14 24h6M14 30h4M28 24h6M28 30h8" opacity="0.6"/><circle cx="38" cy="38" r="7" fill="var(--senf)" opacity="0.15" stroke="none"/><path d="M35 38h6M38 35v6" stroke="var(--senf)" stroke-width="2"/></svg>',
    lohnbuchhaltung: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="20" cy="16" r="6"/><path d="M8 36c0-6 5-10 12-10s12 4 12 10"/><circle cx="36" cy="16" r="4" opacity="0.4"/><path d="M32 36c0-4 1-7 4-9" opacity="0.4"/><rect x="28" y="30" width="14" height="10" rx="2" fill="var(--senf)" opacity="0.15" stroke="var(--senf)"/><path d="M32 35h6" stroke="var(--senf)" stroke-width="2"/></svg>',
    betriebsprufung: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 40V14l14-8 14 8v26"/><rect x="18" y="24" width="12" height="16"/><path d="M24 28v8"/><circle cx="24" cy="18" r="4" fill="var(--senf)" opacity="0.2" stroke="var(--senf)"/><path d="M22 18l2 2 3-3" stroke="var(--senf)" stroke-width="2"/></svg>',
    gmbhberatung: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="12" width="32" height="24" rx="3"/><path d="M8 20h32"/><path d="M16 28h6M16 32h4" opacity="0.6"/><path d="M30 26l4 4 6-8" stroke="var(--senf)" stroke-width="2.5" stroke-linecap="round"/></svg>',
    bilanz: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 40h32"/><path d="M24 8v32"/><rect x="12" y="22" width="8" height="18" rx="1" fill="var(--senf)" opacity="0.15"/><rect x="28" y="14" width="8" height="26" rx="1" fill="var(--senf)" opacity="0.15"/><path d="M16 22v18M32 14v26" stroke="var(--senf)" stroke-width="1.5"/></svg>',
    datev: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="10" width="36" height="28" rx="4"/><path d="M14 22h8M14 28h6M14 34h10" opacity="0.5"/><circle cx="34" cy="28" r="8" fill="var(--senf)" opacity="0.15" stroke="var(--senf)"/><path d="M31 28l2 2 4-4" stroke="var(--senf)" stroke-width="2"/></svg>',
    elster: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="10" y="6" width="28" height="36" rx="3"/><path d="M18 16h12M18 22h12M18 28h8"/><path d="M32 34l-6 6-3-3" stroke="var(--senf)" stroke-width="2.5" stroke-linecap="round"/></svg>',
  }

  // Branchen icons
  const branchenIconMap: Record<string, string> = {
    handwerk: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 34l20-20"/><path d="M30 10l8 8-4 4-8-8z"/><path d="M10 30l8 8-4 4-8-8z" fill="var(--senf)" opacity="0.15"/></svg>',
    arzte: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M24 8v12M18 14h12"/><rect x="14" y="24" width="20" height="16" rx="3"/><path d="M20 32h8M24 28v8" stroke="var(--senf)" stroke-width="2"/></svg>',
    gastronomie: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 36h32"/><path d="M14 36V20a10 10 0 0120 0v16"/><circle cx="24" cy="16" r="4" fill="var(--senf)" opacity="0.2"/></svg>',
    immobilien: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 40V20l16-12 16 12v20"/><rect x="18" y="28" width="12" height="12"/><path d="M24 28v12"/><path d="M18 34h12"/></svg>',
    ecommerce: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="38" r="3"/><circle cx="34" cy="38" r="3"/><path d="M6 8h6l4 22h22l4-16H16"/></svg>',
    freelancer: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="10" width="32" height="24" rx="3"/><path d="M8 38h32"/><path d="M20 20l-4 8h4l-4 8" stroke="var(--senf)" stroke-width="2"/><path d="M28 18v12M32 18v12" opacity="0.4"/></svg>',
    startups: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M24 6c0 0-12 10-12 24h24C36 16 24 6 24 6z"/><circle cx="24" cy="26" r="4" fill="var(--senf)" opacity="0.2"/><path d="M20 38l-4 6M28 38l4 6"/></svg>',
    default: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="8" width="32" height="32" rx="4"/><path d="M16 16h16M16 24h16M16 32h10"/></svg>',
  }

  // Services HTML
  const servicesHtml = c.services.map(s => {
    const iconKey = (s.icon || s.name).toLowerCase()
      .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
      .replace(/[^a-z]/g, '')
    const svgIcon = serviceIconMap[iconKey] || serviceIconMap['jahresabschluss']
    return `
          <div class="service-card">
            <div class="service-icon">${svgIcon}</div>
            <h3>${esc(s.name)}</h3>
            <p>${esc(s.description)}</p>
          </div>`
  }).join('\n')

  // Branchen expertise HTML
  const branchenHtml = c.branchenExpertise.map(b => {
    const iconKey = (b.icon || b.name).toLowerCase()
      .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
      .replace(/[^a-z]/g, '')
    const svgIcon = branchenIconMap[iconKey] || branchenIconMap['default']
    return `
          <div class="branche-card">
            <div class="branche-icon">${svgIcon}</div>
            <h3>${esc(b.name)}</h3>
            <p>${esc(b.description)}</p>
          </div>`
  }).join('\n')

  // Team HTML
  const teamHtml = c.team.map(t => {
    const initials = t.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    return `
          <div class="team-card">
            <div class="team-photo">
              ${t.imageUrl ? `<img src="${esc(t.imageUrl)}" alt="${esc(t.name)}" loading="lazy">` : `<div class="team-avatar">${esc(initials)}</div>`}
            </div>
            <h3>${esc(t.name)}</h3>
            <div class="team-role">${esc(t.role)}</div>
            ${t.qualifications ? `<div class="team-qual">${esc(t.qualifications)}</div>` : ''}
          </div>`
  }).join('\n')

  // Digitalisierung tools HTML
  const digiTools = c.digitalisierung.tools || []
  const digiToolsHtml = digiTools.map(tool => {
    const iconKey = (tool.icon || tool.name).toLowerCase()
      .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
      .replace(/[^a-z]/g, '')
    const svgIcon = serviceIconMap[iconKey] || serviceIconMap['datev']
    return `
          <div class="digi-card">
            <div class="digi-icon">${svgIcon}</div>
            <h3>${esc(tool.name)}</h3>
            <p>${esc(tool.description)}</p>
          </div>`
  }).join('\n')

  // Trust badges HTML
  const trustBadges = c.trustBadges || []
  const trustBadgesHtml = trustBadges.map(b => `
        <div class="trust-badge">
          ${b.icon === 'steuerberater' ? '<svg viewBox="0 0 40 40" fill="none"><path d="M20 4L6 10v10c0 9.5 6 17.5 14 20 8-2.5 14-10.5 14-20V10L20 4z" stroke="var(--senf)" stroke-width="2"/><path d="M15 20l3 3 7-7" stroke="var(--senf)" stroke-width="2" stroke-linecap="round"/></svg>'
          : b.icon === 'datev' ? '<svg viewBox="0 0 40 40" fill="none"><rect x="6" y="6" width="28" height="28" rx="4" stroke="var(--senf)" stroke-width="2"/><path d="M13 20l4 4 10-10" stroke="var(--senf)" stroke-width="2.5" stroke-linecap="round"/></svg>'
          : b.icon === 'star' ? '<svg viewBox="0 0 40 40" fill="none"><path d="M20 4l5 10 11 2-8 7 2 11-10-5-10 5 2-11-8-7 11-2z" stroke="var(--senf)" stroke-width="2"/></svg>'
          : b.icon === 'award' ? '<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="16" r="10" stroke="var(--senf)" stroke-width="2"/><path d="M15 25l-2 11 7-4 7 4-2-11" stroke="var(--senf)" stroke-width="2"/></svg>'
          : '<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="var(--senf)" stroke-width="2"/><path d="M13 20l4 4 10-10" stroke="var(--senf)" stroke-width="2.5" stroke-linecap="round"/></svg>'}
          <span class="trust-label">${esc(b.label)}</span>
          ${b.sublabel ? `<span class="trust-sublabel">${esc(b.sublabel)}</span>` : ''}
        </div>`).join('\n')

  // Reviews HTML
  const reviewsHtml = c.reviews.map(r => {
    const initials = r.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    return `
          <div class="review-card">
            <div class="review-stars">${generateStarsSvg(r.rating)}</div>
            <p class="review-text">&ldquo;${esc(r.text)}&rdquo;</p>
            <div class="review-author">
              <div class="review-avatar">${esc(initials)}</div>
              <div>
                <div class="review-name">${esc(r.name)}</div>
                <div class="review-company">${esc(r.company)}</div>
              </div>
            </div>
          </div>`
  }).join('\n')

  // Standort / districts
  const standort = c.standort || {}
  const districtsHtml = (standort.districts || []).map(d => `<span class="district-tag">${esc(d)}</span>`).join('\n          ')

  // FAQ HTML
  const faqHtml = (c.faqItems || []).map(f => `
        <div class="faq-item">
          <button class="faq-q" aria-expanded="false">${esc(f.question)}<span class="faq-icon">+</span></button>
          <div class="faq-a" role="region">${esc(f.answer)}</div>
        </div>`).join('')

  // Contact form fields
  const defaultFields = [
    { name: 'company', label: 'Firma / Name', type: 'text', required: true, placeholder: 'Ihre Firma oder Ihr Name' },
    { name: 'name', label: 'Ansprechpartner', type: 'text', required: true, placeholder: 'Vor- und Nachname' },
    { name: 'email', label: 'E-Mail', type: 'email', required: true, placeholder: 'ihre@email.de' },
    { name: 'phone', label: 'Telefon', type: 'tel', required: false, placeholder: '+49 711 ...' },
    { name: 'service', label: 'Gew\u00fcnschte Leistung', type: 'select', required: false, options: c.services.map(s => s.name) },
    { name: 'rechtsform', label: 'Rechtsform', type: 'select', required: false, options: ['Einzelunternehmen', 'GbR', 'GmbH', 'UG (haftungsbeschr\u00e4nkt)', 'OHG', 'KG', 'AG', 'Freiberufler', 'Sonstige'] },
    { name: 'message', label: 'Nachricht', type: 'textarea', required: false, placeholder: 'Beschreiben Sie kurz Ihr Anliegen...' },
  ]
  const contactFields = c.contactFields || defaultFields
  const contactFieldsHtml = contactFields.map(f => {
    if (f.type === 'textarea') {
      return `
            <div class="form-group full">
              <label for="cf-${esc(f.name)}">${esc(f.label)}${f.required ? ' *' : ''}</label>
              <textarea id="cf-${esc(f.name)}" name="${esc(f.name)}" rows="4" placeholder="${esc(f.placeholder || '')}"${f.required ? ' required' : ''}></textarea>
            </div>`
    }
    if (f.type === 'select' && f.options) {
      return `
            <div class="form-group">
              <label for="cf-${esc(f.name)}">${esc(f.label)}${f.required ? ' *' : ''}</label>
              <select id="cf-${esc(f.name)}" name="${esc(f.name)}"${f.required ? ' required' : ''}>
                <option value="">Bitte w&auml;hlen</option>
                ${f.options.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join('\n                ')}
              </select>
            </div>`
    }
    return `
            <div class="form-group">
              <label for="cf-${esc(f.name)}">${esc(f.label)}${f.required ? ' *' : ''}</label>
              <input type="${esc(f.type)}" id="cf-${esc(f.name)}" name="${esc(f.name)}" placeholder="${esc(f.placeholder || '')}"${f.required ? ' required' : ''}>
            </div>`
  }).join('')

  // Footer columns
  const footerColumns = c.footerColumns || [
    { title: 'Leistungen', links: [
      { label: 'Jahresabschluss', href: '#services' },
      { label: 'E\u00dcR & Bilanz', href: '#services' },
      { label: 'USt-Voranmeldung', href: '#services' },
      { label: 'Lohnbuchhaltung', href: '#services' },
    ]},
    { title: 'Kanzlei', links: [
      { label: 'Team', href: '#team' },
      { label: 'Branchen', href: '#branchen' },
      { label: 'Digitalisierung', href: '#digitalisierung' },
      { label: 'Kontakt', href: '#contact' },
    ]},
    { title: 'Rechtliches', links: [
      { label: 'Impressum', href: c.imprintUrl || '#' },
      { label: 'Datenschutz', href: c.privacyUrl || '#' },
    ]},
  ]
  const footerColumnsHtml = footerColumns.map(col => `
          <div class="footer-col">
            <h4>${esc(col.title)}</h4>
            ${col.links.map(l => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('\n            ')}
          </div>`).join('\n')

  // CTA features
  const ctaFeatures = c.ctaFeatures || [
    'Kostenloses Erstgespr\u00e4ch',
    'DATEV-zertifiziert',
    'Digitale Belegerfassung',
    'Pers\u00f6nlicher Ansprechpartner',
  ]
  const ctaFeaturesHtml = ctaFeatures.map(f => `
            <div class="cta-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--senf)" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
              ${esc(f)}
            </div>`).join('')

  // Opening hours
  const hoursHtml = c.openingHours.map(h => `
          <div class="hours-row">
            <span class="hours-day">${esc(h.days)}</span>
            <span class="hours-time">${esc(h.hours)}</span>
          </div>`).join('')

  // Mobile CTA
  const mobileCta = c.mobileCta || { text: c.ctaText || 'Erstgespr\u00e4ch vereinbaren', href: '#contact' }

  // Nav links
  const navLinks = [
    { label: 'Leistungen', href: '#services' },
    { label: 'Branchen', href: '#branchen' },
    { label: 'Team', href: '#team' },
    { label: 'Bewertungen', href: '#reviews' },
    { label: 'Kontakt', href: '#contact' },
  ]

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(c.businessName)} | ${esc(c.tagline)}</title>
<meta name="description" content="${esc(c.tagline)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${appUrl}${siteId ? `/s/${siteId}` : ''}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,400..900,30..100&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">

<!-- Open Graph -->
<meta property="og:title" content="${esc(c.businessName)} | ${esc(c.tagline)}">
<meta property="og:description" content="${esc(c.heroLead)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${appUrl}${siteId ? `/s/${siteId}` : ''}">
${c.ogImageUrl ? `<meta property="og:image" content="${esc(c.ogImageUrl)}">` : ''}

<!-- Schema.org AccountingService -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "AccountingService",
  "name": "${esc(c.businessName)}",
  "description": "${esc(c.tagline)}",
  ${c.address ? `"address": {
    "@type": "PostalAddress",
    "streetAddress": "${esc(c.address)}"${c.postalCode ? `,\n    "postalCode": "${esc(c.postalCode)}"` : ''}${c.city ? `,\n    "addressLocality": "${esc(c.city)}",\n    "addressCountry": "DE"` : ''}
  },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  "priceRange": "$$",
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
  "areaServed": ${(standort.districts || []).length > 0 ? JSON.stringify(standort.districts) : `"${esc(c.city || 'Stuttgart')}"`},
  "url": "${appUrl}${siteId ? `/s/${siteId}` : ''}"
}
</script>

<style>
  /* ========================================
     DESIGN TOKENS
     ======================================== */
  :root {
    --anthrazit:       ${esc(c.colors.primary)};
    --anthrazit-dark:  ${primaryDark};
    --anthrazit-light: ${primaryLight};
    --anthrazit-soft:  ${primarySoft};
    --senf:            ${esc(c.colors.accent)};
    --senf-dark:       ${accentDark};
    --senf-soft:       ${accentSoft};
    --offwhite:        ${esc(c.colors.background)};
    --offwhite-tint:   ${bgTint};
    --offwhite-warm:   ${bgWarm};
    --text:            ${esc(c.colors.text)};
    --text-soft:       ${textSoft};
    --border:          ${borderColor};
    --font-display:    'Fraunces', Georgia, serif;
    --font-body:       'Inter Tight', -apple-system, sans-serif;
    --font-mono:       'JetBrains Mono', monospace;
    --max-w:           1200px;
    --radius:          12px;
    --radius-sm:       8px;
    --radius-lg:       20px;
    --shadow:          0 2px 12px ${hexToRgba(c.colors.primary, 0.08)};
    --shadow-lg:       0 8px 32px ${hexToRgba(c.colors.primary, 0.12)};
    --shadow-card:     0 4px 20px ${hexToRgba(c.colors.primary, 0.06)};
    --transition:      .3s cubic-bezier(.4,0,.2,1);
  }

  /* ========================================
     RESET & BASE
     ======================================== */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
  body {
    font-family: var(--font-body);
    color: var(--text);
    background: var(--offwhite);
    line-height: 1.65;
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  img { max-width: 100%; height: auto; display: block; }
  a { color: inherit; text-decoration: none; }
  button { cursor: pointer; font-family: inherit; }

  /* ========================================
     ANNOUNCEMENT BAR
     ======================================== */
  .announce-bar {
    background: var(--anthrazit);
    color: #fff;
    text-align: center;
    padding: 10px 20px;
    font-size: .82rem;
    font-weight: 500;
    letter-spacing: .02em;
  }
  .announce-bar a { color: var(--senf); text-decoration: underline; }

  /* ========================================
     NAVIGATION
     ======================================== */
  .nav {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: ${hexToRgba(c.colors.background, 0.92)};
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    transition: box-shadow var(--transition);
  }
  .nav.scrolled { box-shadow: var(--shadow); }
  .nav-inner {
    max-width: var(--max-w);
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    height: 68px;
  }
  .nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.15rem;
    color: var(--anthrazit);
  }
  .nav-brand .logo-mark {
    width: 40px;
    height: 40px;
    background: var(--anthrazit);
    color: var(--senf);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    font-weight: 800;
    font-family: var(--font-display);
  }
  .nav-links {
    display: flex;
    align-items: center;
    gap: 28px;
    list-style: none;
  }
  .nav-links a {
    font-size: .88rem;
    font-weight: 500;
    color: var(--text-soft);
    transition: color var(--transition);
    position: relative;
  }
  .nav-links a:hover { color: var(--anthrazit); }
  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--senf);
    transition: width var(--transition);
  }
  .nav-links a:hover::after { width: 100%; }
  .nav-cta {
    background: var(--senf);
    color: var(--anthrazit);
    padding: 10px 22px;
    border-radius: 50px;
    font-size: .85rem;
    font-weight: 600;
    border: none;
    transition: all var(--transition);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .nav-cta:hover { background: var(--anthrazit); color: #fff; transform: translateY(-1px); }
  .nav-toggle {
    display: none;
    background: none;
    border: none;
    width: 36px;
    height: 36px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }
  .nav-toggle span {
    display: block;
    width: 22px;
    height: 2px;
    background: var(--anthrazit);
    border-radius: 2px;
    transition: all var(--transition);
  }
  .nav-mobile {
    display: none;
    position: fixed;
    top: 68px;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--offwhite);
    z-index: 999;
    padding: 32px 24px;
    flex-direction: column;
    gap: 16px;
  }
  .nav-mobile.open { display: flex; }
  .nav-mobile a {
    font-size: 1.1rem;
    font-weight: 500;
    padding: 14px 0;
    border-bottom: 1px solid var(--border);
    color: var(--anthrazit);
  }
  .nav-mobile .nav-cta {
    margin-top: 16px;
    text-align: center;
    justify-content: center;
    padding: 14px 24px;
    font-size: 1rem;
  }

  /* ========================================
     HERO SECTION
     ======================================== */
  .hero {
    position: relative;
    padding: 80px 24px 100px;
    background: linear-gradient(165deg, var(--anthrazit) 0%, ${darkenHex(c.colors.primary, 0.15)} 50%, ${darkenHex(c.colors.primary, 0.3)} 100%);
    color: #fff;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -40%;
    right: -10%;
    width: 60%;
    height: 120%;
    background: radial-gradient(ellipse, ${hexToRgba(c.colors.accent, 0.08)} 0%, transparent 70%);
    pointer-events: none;
  }
  .hero::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 120px;
    background: linear-gradient(to top, var(--offwhite), transparent);
    pointer-events: none;
  }
  .hero-inner {
    max-width: var(--max-w);
    margin: 0 auto;
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: center;
  }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${hexToRgba(c.colors.accent, 0.15)};
    border: 1px solid ${hexToRgba(c.colors.accent, 0.3)};
    color: var(--senf);
    font-size: .78rem;
    font-weight: 600;
    padding: 6px 16px;
    border-radius: 50px;
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: .08em;
    margin-bottom: 20px;
  }
  .hero-tag::before {
    content: '';
    width: 8px;
    height: 8px;
    background: var(--senf);
    border-radius: 50%;
    animation: pulse-dot 2s ease-in-out infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: .5; transform: scale(.7); }
  }
  .hero h1 {
    font-family: var(--font-display);
    font-size: clamp(2.2rem, 4vw, 3.4rem);
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: 20px;
    letter-spacing: -.02em;
  }
  .hero h1 .accent {
    color: var(--senf);
    font-style: italic;
    display: inline;
  }
  .hero-lead {
    font-size: 1.1rem;
    color: ${hexToRgba('#fff', 0.7)};
    line-height: 1.7;
    margin-bottom: 32px;
    max-width: 520px;
  }
  .hero-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  .btn-primary {
    background: var(--senf);
    color: var(--anthrazit);
    padding: 14px 32px;
    border-radius: 50px;
    font-size: .95rem;
    font-weight: 700;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all var(--transition);
    text-decoration: none;
    letter-spacing: .01em;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px ${hexToRgba(c.colors.accent, 0.35)}; }
  .btn-secondary {
    color: ${hexToRgba('#fff', 0.8)};
    padding: 14px 24px;
    border-radius: 50px;
    font-size: .9rem;
    font-weight: 500;
    border: 1px solid ${hexToRgba('#fff', 0.2)};
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all var(--transition);
    text-decoration: none;
    background: transparent;
  }
  .btn-secondary:hover { border-color: var(--senf); color: var(--senf); }
  .hero-visual {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 360px;
  }
  .hero-visual-bg {
    width: 100%;
    height: 100%;
    min-height: 360px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    position: relative;
  }
  .hero-visual-bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
  .hero-visual-placeholder {
    width: 100%;
    height: 100%;
    min-height: 360px;
    background: linear-gradient(135deg, ${hexToRgba(c.colors.accent, 0.12)}, ${hexToRgba(c.colors.accent, 0.04)});
    border-radius: var(--radius-lg);
    border: 1px solid ${hexToRgba(c.colors.accent, 0.15)};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
  }
  .hero-visual-placeholder svg { opacity: .3; }
  .hero-stat-cards {
    position: absolute;
    bottom: -24px;
    left: -24px;
    right: -24px;
    display: flex;
    gap: 12px;
    justify-content: center;
    z-index: 3;
  }
  .hero-stat {
    background: ${hexToRgba(c.colors.primary, 0.9)};
    backdrop-filter: blur(12px);
    padding: 14px 20px;
    border-radius: var(--radius);
    border: 1px solid ${hexToRgba(c.colors.accent, 0.15)};
    text-align: center;
    min-width: 120px;
  }
  .hero-stat .stat-value {
    font-family: var(--font-display);
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--senf);
  }
  .hero-stat .stat-label {
    font-size: .72rem;
    color: ${hexToRgba('#fff', 0.6)};
    margin-top: 2px;
    font-weight: 500;
  }

  /* ========================================
     TRUST BADGES
     ======================================== */
  .trust-bar {
    padding: 40px 24px;
    background: var(--offwhite);
    border-bottom: 1px solid var(--border);
  }
  .trust-bar-inner {
    max-width: var(--max-w);
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 40px;
    flex-wrap: wrap;
  }
  .trust-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
  }
  .trust-badge svg { width: 40px; height: 40px; }
  .trust-label {
    font-size: .82rem;
    font-weight: 600;
    color: var(--anthrazit);
  }
  .trust-sublabel {
    font-size: .72rem;
    color: var(--text-soft);
    margin-top: -4px;
  }

  /* ========================================
     SECTIONS (common)
     ======================================== */
  .section {
    padding: 80px 24px;
  }
  .section-bg {
    background: var(--offwhite-tint);
  }
  .section-dark {
    background: var(--anthrazit);
    color: #fff;
  }
  .section-inner {
    max-width: var(--max-w);
    margin: 0 auto;
  }
  .section-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: .75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .1em;
    color: var(--senf);
    margin-bottom: 12px;
  }
  .section-label::before {
    content: '';
    width: 24px;
    height: 2px;
    background: var(--senf);
  }
  .section-title {
    font-family: var(--font-display);
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    font-weight: 800;
    color: var(--anthrazit);
    margin-bottom: 12px;
    letter-spacing: -.01em;
    line-height: 1.2;
  }
  .section-dark .section-title { color: #fff; }
  .section-subtitle {
    font-size: 1.05rem;
    color: var(--text-soft);
    line-height: 1.7;
    max-width: 620px;
    margin-bottom: 40px;
  }
  .section-dark .section-subtitle { color: ${hexToRgba('#fff', 0.6)}; }

  /* ========================================
     SERVICES (Leistungen)
     ======================================== */
  .services-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .service-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 32px 28px;
    transition: all var(--transition);
    position: relative;
    overflow: hidden;
  }
  .service-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--senf);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform var(--transition);
  }
  .service-card:hover::before { transform: scaleX(1); }
  .service-card:hover { box-shadow: var(--shadow-card); transform: translateY(-4px); border-color: ${hexToRgba(c.colors.accent, 0.2)}; }
  .service-icon {
    width: 56px;
    height: 56px;
    color: var(--anthrazit);
    margin-bottom: 20px;
  }
  .service-icon svg { width: 100%; height: 100%; }
  .service-card h3 {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 10px;
    color: var(--anthrazit);
  }
  .service-card p {
    font-size: .92rem;
    color: var(--text-soft);
    line-height: 1.6;
  }

  /* ========================================
     BRANCHEN EXPERTISE
     ======================================== */
  .branchen-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  .branche-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 28px 24px;
    text-align: center;
    transition: all var(--transition);
  }
  .branche-card:hover { box-shadow: var(--shadow-card); transform: translateY(-3px); border-color: ${hexToRgba(c.colors.accent, 0.2)}; }
  .branche-icon {
    width: 48px;
    height: 48px;
    color: var(--anthrazit);
    margin: 0 auto 16px;
  }
  .branche-icon svg { width: 100%; height: 100%; }
  .branche-card h3 {
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--anthrazit);
  }
  .branche-card p {
    font-size: .85rem;
    color: var(--text-soft);
    line-height: 1.55;
  }

  /* ========================================
     TEAM
     ======================================== */
  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 28px;
  }
  .team-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 32px 24px;
    text-align: center;
    transition: all var(--transition);
  }
  .team-card:hover { box-shadow: var(--shadow-card); transform: translateY(-3px); }
  .team-photo {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin: 0 auto 20px;
    overflow: hidden;
    background: var(--offwhite-tint);
    border: 3px solid var(--border);
  }
  .team-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .team-avatar {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--senf);
    background: ${hexToRgba(c.colors.accent, 0.1)};
  }
  .team-card h3 {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--anthrazit);
    margin-bottom: 4px;
  }
  .team-role {
    font-size: .88rem;
    color: var(--senf);
    font-weight: 600;
    margin-bottom: 8px;
  }
  .team-qual {
    font-size: .8rem;
    color: var(--text-soft);
    font-family: var(--font-mono);
    line-height: 1.5;
  }

  /* ========================================
     DIGITALISIERUNG
     ======================================== */
  .digi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
  }
  .digi-card {
    background: ${hexToRgba('#fff', 0.06)};
    border: 1px solid ${hexToRgba('#fff', 0.1)};
    border-radius: var(--radius);
    padding: 32px 28px;
    transition: all var(--transition);
  }
  .digi-card:hover { background: ${hexToRgba('#fff', 0.1)}; border-color: ${hexToRgba(c.colors.accent, 0.3)}; transform: translateY(-3px); }
  .digi-icon {
    width: 52px;
    height: 52px;
    color: #fff;
    margin-bottom: 18px;
  }
  .digi-icon svg { width: 100%; height: 100%; }
  .digi-card h3 {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 10px;
  }
  .digi-card p {
    font-size: .9rem;
    color: ${hexToRgba('#fff', 0.6)};
    line-height: 1.6;
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }
  .review-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 28px;
    transition: all var(--transition);
  }
  .review-card:hover { box-shadow: var(--shadow-card); }
  .review-stars {
    display: flex;
    gap: 3px;
    color: var(--senf);
    margin-bottom: 16px;
  }
  .review-text {
    font-size: .95rem;
    color: var(--text);
    line-height: 1.65;
    margin-bottom: 20px;
    font-style: italic;
  }
  .review-author {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .review-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${hexToRgba(c.colors.accent, 0.12)};
    color: var(--senf);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: .85rem;
    font-weight: 700;
  }
  .review-name {
    font-weight: 600;
    font-size: .9rem;
    color: var(--anthrazit);
  }
  .review-company {
    font-size: .78rem;
    color: var(--text-soft);
  }

  /* ========================================
     STANDORT / MAP
     ======================================== */
  .map-wrap {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    align-items: start;
  }
  .map-embed {
    border-radius: var(--radius);
    overflow: hidden;
    background: var(--offwhite-warm);
    min-height: 320px;
    border: 1px solid var(--border);
  }
  .map-embed iframe {
    width: 100%;
    height: 100%;
    min-height: 320px;
    border: none;
  }
  .map-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 320px;
    color: var(--text-soft);
  }
  .map-info h3 {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--anthrazit);
    margin-bottom: 12px;
  }
  .map-info p {
    font-size: .92rem;
    color: var(--text-soft);
    line-height: 1.65;
    margin-bottom: 20px;
  }
  .district-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
  }
  .district-tag {
    background: ${hexToRgba(c.colors.accent, 0.1)};
    color: var(--anthrazit);
    padding: 6px 14px;
    border-radius: 50px;
    font-size: .8rem;
    font-weight: 500;
    border: 1px solid ${hexToRgba(c.colors.accent, 0.15)};
  }
  .contact-hours h4 {
    font-size: .88rem;
    font-weight: 600;
    color: var(--anthrazit);
    margin-bottom: 10px;
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: .05em;
  }
  .hours-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--border);
    font-size: .88rem;
  }
  .hours-day { font-weight: 500; color: var(--text); }
  .hours-time { color: var(--text-soft); font-family: var(--font-mono); font-size: .82rem; }

  /* ========================================
     FAQ
     ======================================== */
  .faq-list {
    max-width: 760px;
    margin: 0 auto;
  }
  .faq-item {
    border-bottom: 1px solid var(--border);
    overflow: hidden;
  }
  .faq-q {
    width: 100%;
    background: none;
    border: none;
    padding: 20px 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--anthrazit);
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    transition: color var(--transition);
  }
  .faq-q:hover { color: var(--senf); }
  .faq-icon {
    font-size: 1.4rem;
    color: var(--senf);
    font-weight: 300;
    transition: transform var(--transition);
    flex-shrink: 0;
  }
  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height .4s ease, padding .3s ease;
    font-size: .92rem;
    color: var(--text-soft);
    line-height: 1.7;
  }
  .faq-item.open .faq-a { max-height: 400px; padding-bottom: 20px; }
  .faq-item.open .faq-icon { transform: rotate(45deg); }

  /* ========================================
     CONTACT FORM
     ======================================== */
  .contact-section {
    padding: 80px 24px;
    background: var(--anthrazit);
    color: #fff;
  }
  .contact-inner {
    max-width: var(--max-w);
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: start;
  }
  .contact-info .section-label { color: var(--senf); }
  .contact-info .section-title { color: #fff; }
  .contact-info .section-subtitle { color: ${hexToRgba('#fff', 0.6)}; }
  .contact-details {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 28px;
  }
  .contact-detail {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: .92rem;
    color: ${hexToRgba('#fff', 0.8)};
  }
  .contact-detail svg {
    width: 20px;
    height: 20px;
    color: var(--senf);
    flex-shrink: 0;
  }
  .contact-detail a { color: ${hexToRgba('#fff', 0.8)}; transition: color var(--transition); }
  .contact-detail a:hover { color: var(--senf); }
  .contact-info .contact-hours { color: ${hexToRgba('#fff', 0.7)}; }
  .contact-info .contact-hours h4 { color: ${hexToRgba('#fff', 0.9)}; }
  .contact-info .hours-row { border-color: ${hexToRgba('#fff', 0.1)}; }
  .contact-info .hours-day { color: ${hexToRgba('#fff', 0.8)}; }
  .contact-info .hours-time { color: ${hexToRgba('#fff', 0.5)}; }
  .contact-form-wrap {
    background: ${hexToRgba('#fff', 0.06)};
    border: 1px solid ${hexToRgba('#fff', 0.1)};
    border-radius: var(--radius-lg);
    padding: 36px;
  }
  .contact-form-wrap h3 {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 24px;
  }
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group.full { grid-column: 1 / -1; }
  .form-group label {
    font-size: .82rem;
    font-weight: 500;
    color: ${hexToRgba('#fff', 0.7)};
  }
  .form-group input,
  .form-group select,
  .form-group textarea {
    background: ${hexToRgba('#fff', 0.06)};
    border: 1px solid ${hexToRgba('#fff', 0.12)};
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    font-size: .9rem;
    color: #fff;
    font-family: var(--font-body);
    transition: border-color var(--transition);
  }
  .form-group input::placeholder,
  .form-group textarea::placeholder { color: ${hexToRgba('#fff', 0.3)}; }
  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus { outline: none; border-color: var(--senf); }
  .form-group select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }
  .form-group select option { background: var(--anthrazit); color: #fff; }
  .form-submit { grid-column: 1 / -1; margin-top: 8px; }
  .form-submit button {
    width: 100%;
    background: var(--senf);
    color: var(--anthrazit);
    padding: 14px 32px;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 700;
    border: none;
    transition: all var(--transition);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .form-submit button:hover { transform: translateY(-2px); box-shadow: 0 8px 24px ${hexToRgba(c.colors.accent, 0.3)}; }

  /* ========================================
     CTA BANNER
     ======================================== */
  .cta-banner {
    padding: 80px 24px;
    background: linear-gradient(135deg, var(--senf), ${darkenHex(c.colors.accent, 0.15)});
    text-align: center;
  }
  .cta-banner-inner {
    max-width: 700px;
    margin: 0 auto;
  }
  .cta-banner h2 {
    font-family: var(--font-display);
    font-size: clamp(1.8rem, 3vw, 2.4rem);
    font-weight: 800;
    color: var(--anthrazit);
    margin-bottom: 12px;
  }
  .cta-banner p {
    font-size: 1.05rem;
    color: ${hexToRgba(c.colors.primary, 0.7)};
    margin-bottom: 32px;
    line-height: 1.6;
  }
  .cta-features {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 16px 28px;
    margin-bottom: 32px;
  }
  .cta-feature {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: .88rem;
    font-weight: 500;
    color: var(--anthrazit);
  }
  .cta-feature svg { width: 18px; height: 18px; color: var(--anthrazit); }

  /* ========================================
     FOOTER
     ======================================== */
  .footer {
    background: var(--anthrazit);
    color: ${hexToRgba('#fff', 0.7)};
    padding: 60px 24px 32px;
  }
  .footer-inner {
    max-width: var(--max-w);
    margin: 0 auto;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 1.5fr repeat(3, 1fr);
    gap: 40px;
    margin-bottom: 40px;
  }
  .footer-brand .brand-name {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 12px;
  }
  .footer-brand p {
    font-size: .88rem;
    line-height: 1.6;
    color: ${hexToRgba('#fff', 0.5)};
  }
  .footer-col h4 {
    font-family: var(--font-mono);
    font-size: .75rem;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: var(--senf);
    margin-bottom: 16px;
    font-weight: 600;
  }
  .footer-col a {
    display: block;
    font-size: .88rem;
    color: ${hexToRgba('#fff', 0.5)};
    padding: 4px 0;
    transition: color var(--transition);
  }
  .footer-col a:hover { color: var(--senf); }
  .footer-bottom {
    border-top: 1px solid ${hexToRgba('#fff', 0.08)};
    padding-top: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: .8rem;
    color: ${hexToRgba('#fff', 0.35)};
  }
  .footer-legal { display: flex; gap: 16px; }
  .footer-legal a { color: ${hexToRgba('#fff', 0.35)}; transition: color var(--transition); }
  .footer-legal a:hover { color: var(--senf); }

  /* ========================================
     MOBILE CTA BAR
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 998;
    padding: 12px 16px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
    background: ${hexToRgba(c.colors.primary, 0.95)};
    backdrop-filter: blur(12px);
    border-top: 1px solid ${hexToRgba(c.colors.accent, 0.2)};
  }
  .mobile-cta a {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--senf);
    color: var(--anthrazit);
    padding: 14px 24px;
    border-radius: 50px;
    font-size: .95rem;
    font-weight: 700;
    text-decoration: none;
  }

  /* ========================================
     ANIMATION
     ======================================== */
  .animate-in {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity .6s ease, transform .6s ease;
  }
  .animate-in.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .hero-inner { grid-template-columns: 1fr; }
    .hero-visual { display: none; }
    .services-grid { grid-template-columns: repeat(2, 1fr); }
    .branchen-grid { grid-template-columns: repeat(2, 1fr); }
    .contact-inner { grid-template-columns: 1fr; }
    .map-wrap { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 768px) {
    .nav-links { display: none; }
    .nav-cta.desktop-only { display: none; }
    .nav-toggle { display: flex; }
    .mobile-cta { display: block; }
    .hero { padding: 56px 24px 72px; }
    .hero h1 { font-size: clamp(1.8rem, 5vw, 2.4rem); }
    .services-grid { grid-template-columns: 1fr; }
    .branchen-grid { grid-template-columns: 1fr 1fr; }
    .team-grid { grid-template-columns: 1fr; }
    .digi-grid { grid-template-columns: 1fr; }
    .reviews-grid { grid-template-columns: 1fr; }
    .section { padding: 56px 20px; }
    .contact-section { padding: 56px 20px; }
    .form-grid { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: 1fr; }
    .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
    .trust-bar-inner { gap: 24px; }
    .hero-stat-cards { position: static; flex-wrap: wrap; margin-top: 28px; }
    body { padding-bottom: 70px; }
  }

  @media (max-width: 480px) {
    .branchen-grid { grid-template-columns: 1fr; }
    .cta-features { flex-direction: column; align-items: center; }
    .hero-actions { flex-direction: column; width: 100%; }
    .hero-actions .btn-primary,
    .hero-actions .btn-secondary { width: 100%; justify-content: center; }
  }
</style>
</head>
<body>

<!-- ==========================================
     ANNOUNCEMENT BAR
     ========================================== -->
${c.announceText ? `<div class="announce-bar">${esc(c.announceText)}</div>` : ''}

<!-- ==========================================
     NAVIGATION
     ========================================== -->
<nav class="nav" id="main-nav">
  <div class="nav-inner">
    <a href="#" class="nav-brand">
      <div class="logo-mark">${logoInitial}</div>
      ${esc(c.businessName)}
    </a>
    <ul class="nav-links">
      ${navLinks.map(l => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('\n      ')}
    </ul>
    <a href="#contact" class="nav-cta desktop-only">
      ${esc(c.ctaText || 'Erstgespr\u00e4ch')}
      <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 10h10M11 6l4 4-4 4"/></svg>
    </a>
    <button class="nav-toggle" id="nav-toggle" aria-label="Men&uuml; &ouml;ffnen">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<!-- Mobile Nav -->
<div class="nav-mobile" id="nav-mobile">
  ${navLinks.map(l => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('\n  ')}
  <a href="#contact" class="nav-cta">${esc(c.ctaText || 'Erstgespr\u00e4ch vereinbaren')}</a>
</div>

<!-- ==========================================
     HERO
     ========================================== -->
<section class="hero">
  <div class="hero-inner">
    <div class="hero-content">
      <div class="hero-tag">${esc(c.heroTag)}</div>
      <h1>${esc(c.heroHeadline)} <span class="accent">${esc(c.heroAccent)}</span></h1>
      <p class="hero-lead">${esc(c.heroLead)}</p>
      <div class="hero-actions">
        <a href="#contact" class="btn-primary">
          ${esc(c.ctaText || 'Kostenloses Erstgespr\u00e4ch')}
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 10h10M11 6l4 4-4 4"/></svg>
        </a>
        <a href="#services" class="btn-secondary">
          Leistungen entdecken
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 4v12M6 12l4 4 4-4"/></svg>
        </a>
      </div>
    </div>
    <div class="hero-visual">
      ${c.heroImageUrl ? `
      <div class="hero-visual-bg">
        <img src="${esc(c.heroImageUrl)}" alt="${esc(c.businessName)}" loading="eager">
      </div>` : `
      <div class="hero-visual-placeholder">
        <svg viewBox="0 0 80 80" width="80" height="80" fill="none" stroke="${hexToRgba('#fff', 0.2)}" stroke-width="1.5">
          <rect x="12" y="8" width="56" height="64" rx="4"/>
          <path d="M24 28h32M24 38h32M24 48h20"/>
          <circle cx="56" cy="56" r="12" fill="${hexToRgba(c.colors.accent, 0.15)}" stroke="var(--senf)"/>
          <path d="M52 56l3 3 5-5" stroke="var(--senf)" stroke-width="2"/>
        </svg>
      </div>`}
      <div class="hero-stat-cards">
        <div class="hero-stat">
          <div class="stat-value">20+</div>
          <div class="stat-label">Jahre Erfahrung</div>
        </div>
        <div class="hero-stat">
          <div class="stat-value">500+</div>
          <div class="stat-label">Mandanten</div>
        </div>
        <div class="hero-stat">
          <div class="stat-value">100%</div>
          <div class="stat-label">Digital</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ==========================================
     TRUST BADGES
     ========================================== -->
${trustBadges.length > 0 ? `
<div class="trust-bar">
  <div class="trust-bar-inner">
    ${trustBadgesHtml}
  </div>
</div>` : ''}

<!-- ==========================================
     LEISTUNGEN (Services)
     ========================================== -->
<section class="section" id="services">
  <div class="section-inner">
    <div class="section-label">Leistungen</div>
    <h2 class="section-title">Steuerberatung f&uuml;r den Mittelstand</h2>
    <p class="section-subtitle">Von der laufenden Buchhaltung &uuml;ber Jahresabschluss und E&Uuml;R bis zur Betriebspr&uuml;fung &ndash; wir betreuen Sie in allen steuerlichen Belangen.</p>
    <div class="services-grid animate-in">
      ${servicesHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     BRANCHEN-EXPERTISE
     ========================================== -->
<section class="section section-bg" id="branchen">
  <div class="section-inner">
    <div class="section-label">Branchen</div>
    <h2 class="section-title">Branchenkenntnis, die z&auml;hlt</h2>
    <p class="section-subtitle">Jede Branche hat eigene steuerliche Anforderungen. Wir kennen die Besonderheiten &ndash; von der E&Uuml;R im Handwerk bis zur Bilanz in der GmbH.</p>
    <div class="branchen-grid animate-in">
      ${branchenHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     TEAM
     ========================================== -->
<section class="section" id="team">
  <div class="section-inner">
    <div class="section-label">Kanzlei</div>
    <h2 class="section-title">Ihr Team bei ${esc(c.businessName)}</h2>
    <p class="section-subtitle">Pers&ouml;nliche Betreuung durch erfahrene Steuerberater und Fachkr&auml;fte &ndash; kompetent, zuverl&auml;ssig und digital.</p>
    <div class="team-grid animate-in">
      ${teamHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     DIGITALISIERUNG (DATEV, ELSTER)
     ========================================== -->
<section class="section section-dark" id="digitalisierung">
  <div class="section-inner">
    <div class="section-label">Digitalisierung</div>
    <h2 class="section-title" style="color:#fff">${esc(c.digitalisierung.title || 'Digitale Kanzlei &ndash; moderne Prozesse')}</h2>
    <p class="section-subtitle">${esc(c.digitalisierung.subtitle || 'Mit DATEV Unternehmen online, ELSTER und digitaler Belegerfassung sparen Sie Zeit und behalten den \u00dcberblick.')}</p>
    <div class="digi-grid animate-in">
      ${digiToolsHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     BEWERTUNGEN
     ========================================== -->
<section class="section" id="reviews">
  <div class="section-inner">
    <div class="section-label">Bewertungen</div>
    <h2 class="section-title">Das sagen unsere Mandanten</h2>
    <p class="section-subtitle">${c.reviews.length > 0 ? `${(c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length).toFixed(1)} von 5 Sternen &ndash; basierend auf ${c.reviews.length} Bewertungen` : 'Vertrauen und Zufriedenheit unserer Mandanten stehen an erster Stelle.'}</p>
    <div class="reviews-grid animate-in">
      ${reviewsHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     STANDORT / MAP
     ========================================== -->
<section class="section section-bg" id="standort">
  <div class="section-inner">
    <div class="section-label">Standort</div>
    <h2 class="section-title">${esc(standort.title || 'Kanzlei in ' + (c.city || 'Stuttgart'))}</h2>
    <p class="section-subtitle">${esc(standort.subtitle || 'Zentral gelegen und gut erreichbar \u2013 pers\u00f6nlich oder digital.')}</p>
    <div class="map-wrap animate-in">
      <div class="map-embed">
        ${standort.mapEmbedUrl ? `<iframe src="${esc(standort.mapEmbedUrl)}" loading="lazy" allowfullscreen title="Karte Standort"></iframe>` : '<div class="map-placeholder"><svg viewBox="0 0 64 64" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M32 8C22 8 14 16 14 26c0 14 18 30 18 30s18-16 18-30C50 16 42 8 32 8z"/><circle cx="32" cy="26" r="6"/></svg></div>'}
      </div>
      <div class="map-info">
        <h3>${esc(standort.title || 'Zentral in ' + (c.city || 'Stuttgart'))}</h3>
        <p>Unsere Kanzlei ist f&uuml;r Sie pers&ouml;nlich, telefonisch und digital erreichbar. Wir freuen uns auf Ihren Besuch oder Ihr digitales Erstgespr&auml;ch.</p>
        ${(standort.districts || []).length > 0 ? `
        <div class="district-tags">
          ${districtsHtml}
        </div>` : ''}
        <div class="contact-hours" style="margin-top:24px">
          <h4>Sprechzeiten</h4>
          ${hoursHtml}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ==========================================
     FAQ
     ========================================== -->
${(c.faqItems || []).length > 0 ? `
<section class="section" id="faq">
  <div class="section-inner">
    <div style="text-align:center;margin-bottom:40px">
      <div class="section-label" style="justify-content:center">FAQ</div>
      <h2 class="section-title" style="text-align:center">H&auml;ufig gestellte Fragen</h2>
      <p class="section-subtitle" style="text-align:center;margin:0 auto">Antworten auf die wichtigsten Fragen rund um Steuerberatung, Buchhaltung und digitale Zusammenarbeit.</p>
    </div>
    <div class="faq-list animate-in">
      ${faqHtml}
    </div>
  </div>
</section>
` : ''}

<!-- ==========================================
     CONTACT WITH FORM
     ========================================== -->
<section class="contact-section" id="contact">
  <div class="contact-inner">
    <div class="contact-info">
      <div class="section-label">Kontakt</div>
      <h2 class="section-title">${esc(c.contactFormTitle || 'Kostenloses Erstgespr\u00e4ch vereinbaren')}</h2>
      <p class="section-subtitle">${esc(c.contactFormSubtitle || 'Wir nehmen uns Zeit f\u00fcr Sie. Schildern Sie uns Ihr Anliegen und wir melden uns innerhalb von 24 Stunden.')}</p>
      <div class="contact-details">
        ${c.phone ? `<div class="contact-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg><a href="tel:${esc(c.phone)}">${esc(c.phone)}</a></div>` : ''}
        ${c.email ? `<div class="contact-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>` : ''}
        ${c.address ? `<div class="contact-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${esc(c.address)}${c.postalCode ? ', ' + esc(c.postalCode) : ''} ${esc(c.city || '')}</div>` : ''}
      </div>
      <div class="contact-hours">
        <h4>Sprechzeiten</h4>
        ${hoursHtml}
      </div>
    </div>
    <div class="contact-form-wrap">
      <h3>${esc(c.contactFormTitle || 'Erstgespr\u00e4ch anfragen')}</h3>
      <form id="contact-form">
        <div class="form-grid">
          ${contactFieldsHtml}
          <div class="form-submit">
            <button type="submit" id="contact-submit">${esc(c.ctaText || 'Erstgespr\u00e4ch vereinbaren')}</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</section>

<!-- ==========================================
     CTA BANNER
     ========================================== -->
<section class="cta-banner">
  <div class="cta-banner-inner">
    <h2>${esc(c.ctaSectionTitle || 'Bereit f\u00fcr professionelle Steuerberatung?')}</h2>
    <p>${esc(c.ctaSectionSubtitle || 'Vereinbaren Sie jetzt Ihr kostenloses Erstgespr\u00e4ch \u2013 pers\u00f6nlich oder digital.')}</p>
    <div class="cta-features">
      ${ctaFeaturesHtml}
    </div>
    <a href="#contact" class="btn-primary" style="background:var(--anthrazit);color:#fff">
      ${esc(c.ctaText || 'Erstgespr\u00e4ch vereinbaren')}
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
        <div class="brand-name">${esc(c.businessName)}</div>
        <p>${esc(c.footerText || c.tagline)}</p>
      </div>
      ${footerColumnsHtml}
    </div>
    <div class="footer-bottom">
      <span>&copy; ${new Date().getFullYear()} ${esc(c.businessName)}. Alle Rechte vorbehalten.</span>
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
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 10h10M11 6l4 4-4 4"/></svg>
    ${esc(mobileCta.text)}
  </a>
</div>

<!-- ==========================================
     SCRIPTS
     ========================================== -->
<script>
  /* Navigation scroll effect */
  (function() {
    var nav = document.getElementById('main-nav');
    window.addEventListener('scroll', function() {
      if (window.scrollY > 20) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
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
        if (!data.name || !data.email) { alert('Ansprechpartner und E-Mail sind Pflichtfelder.'); return; }
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
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:#fff;font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:${hexToRgba('#fff', 0.7)};font-size:1.05rem">Wir melden uns innerhalb von 24 Stunden bei Ihnen f\\u00fcr Ihr kostenloses Erstgespr\\u00e4ch.</p></div>';
          } else {
            alert(d.error || 'Fehler beim Senden');
            btn.textContent = '${esc(c.ctaText || 'Erstgespr\\u00e4ch vereinbaren')}';
            btn.disabled = false;
          }
        })
        .catch(function() {
          alert('Verbindungsfehler');
          btn.textContent = '${esc(c.ctaText || 'Erstgespr\\u00e4ch vereinbaren')}';
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
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba(c.colors.primary, 0.97)};backdrop-filter:blur(12px);color:#fff;padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:${hexToRgba('#fff', 0.8)}">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--senf);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--senf);color:var(--anthrazit);border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
