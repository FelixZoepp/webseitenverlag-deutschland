/* eslint-disable @typescript-eslint/no-unused-vars */
export interface ImmobilienTechConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Tiefblau (#0e2a5a)
    accent: string     // Lime (#a8e040)
    background: string // Off-White (#f8fafb)
    text: string       // Dark text
  }
  phone?: string
  email?: string
  address?: string
  city?: string
  openingHours: { days: string; hours: string }[]
  properties: {
    title: string
    location: string
    price: string
    area: string
    rooms?: string
    type?: string
    tag?: string
    imageUrl?: string
    features?: string[]
  }[]
  services: { name: string; description: string; icon?: string }[]
  processSteps: { step: string; title: string; description: string; icon?: string }[]
  team: { name: string; role: string; specialties: string[]; imageUrl?: string; quote?: string }[]
  reviews: { text: string; name: string; source: string; rating: number }[]
  faqItems?: { question: string; answer: string }[]
  heroImageUrl?: string
  aboutTitle?: string
  aboutText?: string
  aboutText2?: string
  aboutStats?: { value: string; label: string }[]
  trustBadges?: { icon: string; title: string; value: string }[]
  contactEnabled?: boolean
  imprintUrl?: string
  privacyUrl?: string
  footerText?: string
  footerColumns?: { title: string; links: { label: string; href: string }[] }[]
  locationTitle?: string
  locationSubtitle?: string
  locationMapEmbed?: string
  locationDetails?: { icon: string; label: string; value: string }[]
  ctaSectionTitle?: string
  ctaSectionSubtitle?: string
  ctaFeatures?: string[]
  servicesSectionTitle?: string
  servicesSectionSubtitle?: string
  propertiesSectionTitle?: string
  propertiesSectionSubtitle?: string
  processSectionTitle?: string
  processSectionSubtitle?: string
  teamSectionTitle?: string
  teamSectionSubtitle?: string
  reviewsSectionTitle?: string
  bewertungCtaText?: string
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
  const star = '<svg viewBox="0 0 24 24"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z"/></svg>'
  return Array(count).fill(star).join('\n            ')
}

export function renderImmobilienTechTemplate(config: ImmobilienTechConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primaryDark = darkenHex(c.colors.primary, 0.25)
  const primaryLight = tintHex(c.colors.primary, 0.85)
  const primarySoft = hexToRgba(c.colors.primary, 0.10)
  const accentDark = darkenHex(c.colors.accent, 0.20)
  const accentSoft = hexToRgba(c.colors.accent, 0.15)
  const bgTint = tintHex(c.colors.background, -0.03)
  const bgWarm = tintHex(c.colors.background, -0.06)
  const textSoft = tintHex(c.colors.text, 0.45)
  const borderColor = tintHex(c.colors.background, -0.10)

  const logoInitial = esc(c.businessName.charAt(0))

  // Service icons
  const serviceIconMap: Record<string, string> = {
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>',
    cube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    monitor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
    zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  }
  const defaultServiceIcons = ['chart', 'cube', 'monitor', 'target']

  const servicesHtml = c.services.map((svc, i) => {
    const iconKey = svc.icon || defaultServiceIcons[i % defaultServiceIcons.length]
    const iconSvg = serviceIconMap[iconKey] || serviceIconMap.chart
    return `
        <div class="service-card">
          <div class="service-icon">${iconSvg}</div>
          <h3>${esc(svc.name)}</h3>
          <p>${esc(svc.description)}</p>
          <div class="service-line"></div>
        </div>`
  }).join('\n')

  // Properties HTML
  const propertiesHtml = c.properties.map(prop => `
        <div class="property-card">
          <div class="property-image" ${prop.imageUrl ? `style="background-image:url('${esc(prop.imageUrl)}')"` : ''}>
            ${prop.tag ? `<span class="property-tag">${esc(prop.tag)}</span>` : ''}
            <div class="property-overlay">
              <span class="property-detail-btn">Details ansehen</span>
            </div>
          </div>
          <div class="property-body">
            <div class="property-meta">
              <span class="property-type">${esc(prop.type || 'Immobilie')}</span>
              <span class="property-location">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${esc(prop.location)}
              </span>
            </div>
            <h3 class="property-title">${esc(prop.title)}</h3>
            <div class="property-specs">
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>${esc(prop.area)}</span>
              ${prop.rooms ? `<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>${esc(prop.rooms)} Zimmer</span>` : ''}
            </div>
            ${prop.features && prop.features.length > 0 ? `
            <div class="property-features">
              ${prop.features.map(f => `<span class="pf-tag">${esc(f)}</span>`).join('')}
            </div>` : ''}
            <div class="property-footer">
              <div class="property-price">${esc(prop.price)}</div>
              <a href="#contact" class="property-cta">Anfragen</a>
            </div>
          </div>
        </div>`).join('\n')

  // Process Timeline HTML
  const processIconMap: Record<string, string> = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    chart: serviceIconMap.chart,
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    megaphone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 11l18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>',
    handshake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>',
    key: serviceIconMap.key,
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    rocket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
  }
  const defaultProcessIcons = ['search', 'chart', 'camera', 'megaphone', 'handshake', 'key']

  const processHtml = c.processSteps.map((step, i) => {
    const iconKey = step.icon || defaultProcessIcons[i % defaultProcessIcons.length]
    const iconSvg = processIconMap[iconKey] || processIconMap.check
    return `
        <div class="timeline-step">
          <div class="timeline-marker">
            <div class="timeline-number">${esc(step.step)}</div>
          </div>
          <div class="timeline-content">
            <div class="timeline-icon">${iconSvg}</div>
            <h3>${esc(step.title)}</h3>
            <p>${esc(step.description)}</p>
          </div>
        </div>`
  }).join('\n')

  // Team HTML
  const teamHtml = c.team.map(member => {
    const initials = member.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    return `
        <div class="team-card">
          <div class="team-avatar" ${member.imageUrl ? `style="background-image:url('${esc(member.imageUrl)}')"` : ''}>
            ${!member.imageUrl ? `<span>${esc(initials)}</span>` : ''}
          </div>
          <h3>${esc(member.name)}</h3>
          <div class="team-role">${esc(member.role)}</div>
          <div class="team-specialties">
            ${member.specialties.map(s => `<span class="team-tag">${esc(s)}</span>`).join('')}
          </div>
          ${member.quote ? `<p class="team-quote">&ldquo;${esc(member.quote)}&rdquo;</p>` : ''}
        </div>`
  }).join('\n')

  // Reviews HTML
  const reviewsHtml = c.reviews.map(r => {
    const initials = r.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    return `
      <div class="review-card">
        <div class="review-stars">
          ${generateStarsSvg(r.rating)}
        </div>
        <p class="review-text">&ldquo;${esc(r.text)}&rdquo;</p>
        <div class="review-author">
          <div class="review-avatar">${esc(initials)}</div>
          <div>
            <div class="review-name">${esc(r.name)}</div>
            <div class="review-meta">${esc(r.source)}</div>
          </div>
        </div>
      </div>`
  }).join('\n')

  // Trust badges
  const trustBadges = c.trustBadges || [
    { icon: 'shield', title: 'Zertifiziert', value: 'IVD-Mitglied &amp; gepr&uuml;ft' },
    { icon: 'chart', title: 'Datenbasiert', value: 'KI-gest&uuml;tzte Marktanalyse' },
    { icon: 'clock', title: 'Schnell', value: 'Ø 47 Tage bis Verkauf' },
    { icon: 'star', title: 'Top bewertet', value: `${c.reviews.length > 0 ? (c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length).toFixed(1) : '5.0'} / 5.0 Sterne` },
  ]
  const trustIconMap: Record<string, string> = {
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    key: serviceIconMap.key,
    zap: serviceIconMap.zap,
  }
  const trustBadgesHtml = trustBadges.map(b => {
    const icon = trustIconMap[b.icon] || trustIconMap.check
    return `
      <div class="trust-badge">
        <div class="trust-icon">${icon}</div>
        <div class="trust-info">
          <div class="trust-title">${esc(b.title)}</div>
          <div class="trust-value">${b.value}</div>
        </div>
      </div>`
  }).join('\n')

  // FAQ HTML
  const faqHtml = (c.faqItems || []).map(f => `
      <div class="faq-item">
        <button class="faq-q" aria-expanded="false">${esc(f.question)}<span class="faq-icon">+</span></button>
        <div class="faq-a" role="region">${esc(f.answer)}</div>
      </div>`).join('')

  // About stats
  const aboutStats = c.aboutStats || []
  const aboutStatsHtml = aboutStats.length > 0 ? `
      <div class="about-stats">
        ${aboutStats.map(s => `
        <div class="about-stat">
          <div class="num">${esc(s.value)}</div>
          <div class="label">${esc(s.label)}</div>
        </div>`).join('')}
      </div>` : ''

  // Opening hours HTML
  const hoursHtml = c.openingHours.map(h => `
      <div class="hours-item">
        <div class="label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          ${esc(h.days)}
        </div>
        <div class="value">${esc(h.hours)}</div>
      </div>`).join('')

  // CTA features
  const ctaFeatures = c.ctaFeatures || []
  const ctaFeaturesHtml = ctaFeatures.map(f => `
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          ${esc(f)}
        </div>`).join('')

  // Footer columns
  const footerColumns = c.footerColumns || [
    { title: 'Services', links: [
      { label: 'Immobilienbewertung', href: '#services' },
      { label: '3D-Touren', href: '#services' },
      { label: 'Online-Expos&eacute;', href: '#services' },
      { label: 'Verkaufsprozess', href: '#process' },
    ]},
    { title: 'Unternehmen', links: [
      { label: 'Team', href: '#team' },
      { label: 'Bewertungen', href: '#reviews' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Kontakt', href: '#contact' },
    ]},
  ]
  const footerColumnsHtml = footerColumns.map(col => `
      <div class="footer-col">
        <h4>${col.title}</h4>
        <ul>
          ${col.links.map(l => `<li><a href="${esc(l.href)}">${l.label}</a></li>`).join('\n          ')}
        </ul>
      </div>`).join('')

  // Location details
  const locationDetails = c.locationDetails || [
    { icon: 'pin', label: 'Adresse', value: c.address || 'Berlin' },
    { icon: 'phone', label: 'Telefon', value: c.phone || '' },
    { icon: 'mail', label: 'E-Mail', value: c.email || '' },
  ]
  const locationIconMap: Record<string, string> = {
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  }
  const locationDetailsHtml = locationDetails.filter(d => d.value).map(d => {
    const icon = locationIconMap[d.icon] || locationIconMap.pin
    return `
          <div class="location-detail">
            <div class="location-detail-icon">${icon}</div>
            <div>
              <div class="location-detail-label">${esc(d.label)}</div>
              <div class="location-detail-value">${esc(d.value)}</div>
            </div>
          </div>`
  }).join('\n')

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

<!-- Schema.org RealEstateAgent -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "${esc(c.businessName)}",
  "description": "${esc(c.tagline)}",
  ${c.address ? `"address": { "@type": "PostalAddress", "streetAddress": "${esc(c.address)}"${c.city ? `, "addressLocality": "${esc(c.city)}"` : ''}, "addressCountry": "DE" },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  "serviceType": ["Immobilienbewertung", "Immobilienverkauf", "3D-Touren", "Online-Expos\\u00e9"],
  "areaServed": {
    "@type": "City",
    "name": "${esc(c.city || 'Berlin')}"
  },
  "priceRange": "$$$",
  ${c.reviews.length > 0 ? `"aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "${(c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length).toFixed(1)}",
    "reviewCount": "${c.reviews.length}"
  },` : ''}
  "openingHoursSpecification": [${c.openingHours.map(h => `{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": "${esc(h.days)}",
    "opens": "${esc(h.hours.split(' ')[0] || '')}",
    "closes": "${esc(h.hours.split(' ').pop() || '')}"
  }`).join(',')}],
  "url": "${appUrl}${siteId ? `/s/${siteId}` : ''}"
}
</script>

<style>
  /* ========================================
     DESIGN TOKENS
     ======================================== */
  :root {
    --deep:          ${esc(c.colors.primary)};
    --deep-dark:     ${primaryDark};
    --deep-light:    ${primaryLight};
    --deep-soft:     ${primarySoft};
    --lime:          ${esc(c.colors.accent)};
    --lime-dark:     ${accentDark};
    --lime-soft:     ${accentSoft};
    --offwhite:      ${esc(c.colors.background)};
    --offwhite-tint: ${bgTint};
    --offwhite-warm: ${bgWarm};
    --ink:           ${esc(c.colors.text)};
    --ink-soft:      ${textSoft};
    --border:        ${borderColor};
    --white:         #ffffff;

    --shadow-card:  0 12px 32px ${hexToRgba(c.colors.text, 0.06)};
    --shadow-image: 0 20px 60px ${hexToRgba(c.colors.text, 0.12)};
    --shadow-hover: 0 16px 40px ${hexToRgba(c.colors.primary, 0.16)};
    --shadow-glow:  0 0 40px ${hexToRgba(c.colors.accent, 0.25)};

    --spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    --ease:   cubic-bezier(0.25, 0.46, 0.45, 0.94);

    --font-display: 'Fraunces', Georgia, serif;
    --font-body:    'Inter Tight', -apple-system, sans-serif;
    --font-mono:    'JetBrains Mono', 'Fira Code', monospace;

    --radius-sm: 8px;
    --radius-md: 14px;
    --radius-lg: 22px;
    --radius-xl: 32px;
  }

  /* ========================================
     RESET & BASE
     ======================================== */
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
  body {
    font-family: var(--font-body);
    color: var(--ink);
    background: var(--offwhite);
    line-height: 1.7;
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }
  img { max-width: 100%; height: auto; display: block; }
  a { color: inherit; text-decoration: none; transition: color .3s var(--ease); }
  h1, h2, h3, h4, h5, h6 { font-family: var(--font-display); line-height: 1.2; font-weight: 700; }

  .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
  .section { padding: 100px 0; }
  .section-tag {
    font-family: var(--font-mono);
    font-size: .72rem;
    font-weight: 500;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--lime-dark);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 18px;
  }
  .section-tag::before {
    content: '';
    display: inline-block;
    width: 24px;
    height: 2px;
    background: var(--lime);
  }
  .section-title {
    font-size: clamp(2rem, 4vw, 3rem);
    color: var(--deep);
    margin-bottom: 16px;
    font-variation-settings: 'SOFT' 60;
  }
  .section-subtitle {
    font-size: 1.1rem;
    color: var(--ink-soft);
    max-width: 600px;
    line-height: 1.7;
  }

  /* ========================================
     NAVIGATION
     ======================================== */
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: ${hexToRgba(c.colors.background, 0.85)};
    backdrop-filter: blur(20px) saturate(1.8);
    -webkit-backdrop-filter: blur(20px) saturate(1.8);
    border-bottom: 1px solid var(--border);
    transition: all .4s var(--ease);
  }
  .navbar .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 72px;
  }
  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--deep);
  }
  .logo-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    background: var(--deep);
    color: var(--lime);
    border-radius: var(--radius-sm);
    font-size: 1.1rem;
    font-weight: 800;
    font-family: var(--font-mono);
  }
  .nav-links {
    display: flex;
    align-items: center;
    gap: 32px;
    list-style: none;
  }
  .nav-links a {
    font-size: .88rem;
    font-weight: 500;
    color: var(--ink-soft);
    transition: color .3s;
    position: relative;
  }
  .nav-links a:hover { color: var(--deep); }
  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--lime);
    transition: width .3s var(--spring);
  }
  .nav-links a:hover::after { width: 100%; }
  .nav-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 22px;
    background: var(--deep);
    color: var(--white) !important;
    border-radius: 50px;
    font-size: .85rem;
    font-weight: 600;
    transition: all .3s var(--spring);
  }
  .nav-cta:hover {
    background: var(--lime);
    color: var(--deep) !important;
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow);
  }
  .nav-cta::after { display: none !important; }
  .nav-hamburger {
    display: none;
    width: 44px;
    height: 44px;
    border: none;
    background: none;
    cursor: pointer;
    color: var(--deep);
    padding: 10px;
  }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    padding: 160px 0 120px;
    background: linear-gradient(170deg, var(--offwhite) 0%, var(--offwhite-tint) 50%, var(--deep-soft) 100%);
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -200px;
    right: -200px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.accent, 0.08)} 0%, transparent 70%);
    pointer-events: none;
  }
  .hero::after {
    content: '';
    position: absolute;
    bottom: -100px;
    left: -100px;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.primary, 0.06)} 0%, transparent 70%);
    pointer-events: none;
  }
  .hero .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
    position: relative;
  }
  .hero-content { max-width: 580px; }
  .hero-announce {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    background: var(--lime-soft);
    border: 1px solid ${hexToRgba(c.colors.accent, 0.3)};
    border-radius: 50px;
    font-family: var(--font-mono);
    font-size: .75rem;
    font-weight: 500;
    color: var(--lime-dark);
    margin-bottom: 24px;
  }
  .hero-announce::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--lime);
    animation: pulse-dot 2s ease infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: .5; transform: scale(1.5); }
  }
  .hero-tag {
    font-family: var(--font-mono);
    font-size: .72rem;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--lime-dark);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .hero-tag::before {
    content: '';
    width: 28px;
    height: 2px;
    background: var(--lime);
  }
  .hero h1 {
    font-size: clamp(2.5rem, 5vw, 3.6rem);
    color: var(--deep);
    margin-bottom: 24px;
    font-variation-settings: 'SOFT' 50;
    line-height: 1.1;
  }
  .hero h1 .accent {
    color: var(--lime-dark);
    font-style: italic;
    position: relative;
  }
  .hero h1 .accent::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 0;
    right: 0;
    height: 6px;
    background: ${hexToRgba(c.colors.accent, 0.3)};
    border-radius: 3px;
  }
  .hero-lead {
    font-size: 1.15rem;
    color: var(--ink-soft);
    margin-bottom: 36px;
    line-height: 1.8;
    max-width: 480px;
  }
  .hero-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 16px 32px;
    background: var(--deep);
    color: var(--white);
    border-radius: 50px;
    font-size: .95rem;
    font-weight: 600;
    font-family: var(--font-body);
    border: none;
    cursor: pointer;
    transition: all .3s var(--spring);
  }
  .btn-primary:hover {
    background: var(--lime);
    color: var(--deep);
    transform: translateY(-3px);
    box-shadow: var(--shadow-glow);
  }
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 16px 28px;
    background: transparent;
    color: var(--deep);
    border: 2px solid var(--border);
    border-radius: 50px;
    font-size: .95rem;
    font-weight: 600;
    font-family: var(--font-body);
    cursor: pointer;
    transition: all .3s var(--spring);
  }
  .btn-secondary:hover {
    border-color: var(--deep);
    transform: translateY(-2px);
  }
  .hero-visual {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hero-image-wrapper {
    position: relative;
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-image);
    aspect-ratio: 4/3;
    width: 100%;
    background: linear-gradient(135deg, var(--deep) 0%, ${tintHex(c.colors.primary, 0.3)} 100%);
  }
  .hero-image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hero-float-card {
    position: absolute;
    bottom: -20px;
    left: -30px;
    background: var(--white);
    border-radius: var(--radius-md);
    padding: 16px 20px;
    box-shadow: var(--shadow-card);
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: .85rem;
    animation: float-card 4s ease-in-out infinite;
  }
  .hero-float-card .float-icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
    background: var(--lime-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--lime-dark);
  }
  .hero-float-card .float-icon svg { width: 20px; height: 20px; }
  .hero-float-card .float-text strong { display: block; color: var(--deep); font-weight: 700; }
  .hero-float-card .float-text span { color: var(--ink-soft); font-size: .78rem; }
  @keyframes float-card {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  .hero-stat-card {
    position: absolute;
    top: 20px;
    right: -20px;
    background: var(--deep);
    border-radius: var(--radius-md);
    padding: 14px 18px;
    box-shadow: var(--shadow-card);
    color: var(--white);
    font-family: var(--font-mono);
    animation: float-card 5s ease-in-out infinite reverse;
  }
  .hero-stat-card .stat-num {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--lime);
  }
  .hero-stat-card .stat-label {
    font-size: .72rem;
    opacity: .7;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* ========================================
     TRUST BADGES
     ======================================== */
  .trust-section {
    padding: 50px 0;
    border-bottom: 1px solid var(--border);
    background: var(--white);
  }
  .trust-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  .trust-badge {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px;
    border-radius: var(--radius-md);
    background: var(--offwhite);
    border: 1px solid var(--border);
    transition: all .3s var(--ease);
  }
  .trust-badge:hover {
    border-color: var(--lime);
    transform: translateY(-2px);
    box-shadow: var(--shadow-card);
  }
  .trust-icon {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-sm);
    background: var(--deep-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--deep);
    flex-shrink: 0;
  }
  .trust-icon svg { width: 22px; height: 22px; }
  .trust-title { font-size: .82rem; font-weight: 600; color: var(--deep); }
  .trust-value { font-size: .75rem; color: var(--ink-soft); margin-top: 2px; }

  /* ========================================
     PROPERTIES / OBJEKTE
     ======================================== */
  .properties-section { background: var(--offwhite-tint); }
  .properties-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 48px;
    gap: 24px;
    flex-wrap: wrap;
  }
  .properties-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 28px;
  }
  .property-card {
    background: var(--white);
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--border);
    transition: all .4s var(--ease);
  }
  .property-card:hover {
    transform: translateY(-6px);
    box-shadow: var(--shadow-hover);
    border-color: var(--lime);
  }
  .property-image {
    height: 220px;
    background: linear-gradient(135deg, var(--deep) 0%, ${tintHex(c.colors.primary, 0.4)} 100%);
    background-size: cover;
    background-position: center;
    position: relative;
    overflow: hidden;
  }
  .property-tag {
    position: absolute;
    top: 14px;
    left: 14px;
    padding: 5px 14px;
    background: var(--lime);
    color: var(--deep);
    border-radius: 50px;
    font-family: var(--font-mono);
    font-size: .7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .property-overlay {
    position: absolute;
    inset: 0;
    background: ${hexToRgba(c.colors.primary, 0.6)};
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity .3s var(--ease);
  }
  .property-card:hover .property-overlay { opacity: 1; }
  .property-detail-btn {
    padding: 10px 24px;
    background: var(--white);
    color: var(--deep);
    border-radius: 50px;
    font-size: .85rem;
    font-weight: 600;
    transform: translateY(10px);
    transition: transform .3s var(--spring);
  }
  .property-card:hover .property-detail-btn { transform: translateY(0); }
  .property-body { padding: 22px; }
  .property-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: .78rem;
  }
  .property-type {
    font-family: var(--font-mono);
    font-size: .7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--lime-dark);
    padding: 3px 10px;
    background: var(--lime-soft);
    border-radius: 50px;
  }
  .property-location {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--ink-soft);
  }
  .property-title {
    font-size: 1.2rem;
    color: var(--deep);
    margin-bottom: 14px;
    font-variation-settings: 'SOFT' 50;
  }
  .property-specs {
    display: flex;
    gap: 18px;
    margin-bottom: 14px;
  }
  .property-specs span {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: .85rem;
    color: var(--ink-soft);
  }
  .property-specs svg { color: var(--deep); opacity: .5; }
  .property-features {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
  }
  .pf-tag {
    padding: 3px 10px;
    background: var(--offwhite);
    border-radius: 50px;
    font-size: .72rem;
    color: var(--ink-soft);
    border: 1px solid var(--border);
  }
  .property-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }
  .property-price {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--deep);
  }
  .property-cta {
    padding: 8px 20px;
    background: var(--deep);
    color: var(--white);
    border-radius: 50px;
    font-size: .82rem;
    font-weight: 600;
    transition: all .3s var(--spring);
  }
  .property-cta:hover {
    background: var(--lime);
    color: var(--deep);
  }

  /* ========================================
     SERVICES / LEISTUNGEN
     ======================================== */
  .services-section { background: var(--white); }
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 24px;
    margin-top: 48px;
  }
  .service-card {
    padding: 32px 28px;
    background: var(--offwhite);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    transition: all .4s var(--ease);
    position: relative;
    overflow: hidden;
  }
  .service-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, var(--lime), var(--deep));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform .4s var(--spring);
  }
  .service-card:hover::before { transform: scaleX(1); }
  .service-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
    border-color: var(--lime);
  }
  .service-icon {
    width: 52px;
    height: 52px;
    border-radius: var(--radius-sm);
    background: var(--deep-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--deep);
    margin-bottom: 20px;
    transition: all .3s var(--spring);
  }
  .service-card:hover .service-icon {
    background: var(--lime-soft);
    color: var(--lime-dark);
  }
  .service-icon svg { width: 26px; height: 26px; }
  .service-card h3 {
    font-size: 1.1rem;
    color: var(--deep);
    margin-bottom: 10px;
    font-variation-settings: 'SOFT' 50;
  }
  .service-card p {
    font-size: .9rem;
    color: var(--ink-soft);
    line-height: 1.7;
  }
  .service-line {
    width: 40px;
    height: 2px;
    background: var(--lime);
    margin-top: 20px;
    border-radius: 1px;
    transition: width .3s var(--spring);
  }
  .service-card:hover .service-line { width: 60px; }

  /* ========================================
     PROCESS / TIMELINE
     ======================================== */
  .process-section {
    background: var(--deep);
    color: var(--white);
    position: relative;
    overflow: hidden;
  }
  .process-section::before {
    content: '';
    position: absolute;
    top: -200px;
    right: -200px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.accent, 0.06)} 0%, transparent 70%);
    pointer-events: none;
  }
  .process-section .section-tag { color: var(--lime); }
  .process-section .section-title { color: var(--white); }
  .process-section .section-subtitle { color: ${hexToRgba('#ffffff', 0.6)}; }

  .timeline {
    margin-top: 60px;
    position: relative;
    padding-left: 60px;
  }
  .timeline::before {
    content: '';
    position: absolute;
    top: 0;
    left: 27px;
    width: 2px;
    height: 100%;
    background: ${hexToRgba('#ffffff', 0.15)};
  }
  .timeline-step {
    position: relative;
    padding-bottom: 48px;
    display: flex;
    gap: 28px;
    align-items: flex-start;
  }
  .timeline-step:last-child { padding-bottom: 0; }
  .timeline-marker {
    position: absolute;
    left: -60px;
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: var(--lime);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    box-shadow: 0 0 0 8px ${hexToRgba(c.colors.accent, 0.15)};
  }
  .timeline-number {
    font-family: var(--font-mono);
    font-size: 1rem;
    font-weight: 700;
    color: var(--deep);
  }
  .timeline-content {
    background: ${hexToRgba('#ffffff', 0.06)};
    border: 1px solid ${hexToRgba('#ffffff', 0.1)};
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    flex: 1;
    backdrop-filter: blur(8px);
    transition: all .3s var(--ease);
  }
  .timeline-content:hover {
    background: ${hexToRgba('#ffffff', 0.10)};
    border-color: var(--lime);
    transform: translateX(4px);
  }
  .timeline-icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
    background: ${hexToRgba('#ffffff', 0.1)};
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--lime);
    margin-bottom: 14px;
  }
  .timeline-icon svg { width: 20px; height: 20px; }
  .timeline-content h3 {
    font-size: 1.15rem;
    color: var(--white);
    margin-bottom: 8px;
    font-variation-settings: 'SOFT' 50;
  }
  .timeline-content p {
    font-size: .9rem;
    color: ${hexToRgba('#ffffff', 0.6)};
    line-height: 1.7;
  }

  /* ========================================
     TEAM
     ======================================== */
  .team-section { background: var(--offwhite-tint); }
  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 28px;
    margin-top: 48px;
  }
  .team-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 32px 28px;
    text-align: center;
    transition: all .4s var(--ease);
  }
  .team-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
    border-color: var(--lime);
  }
  .team-avatar {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    margin: 0 auto 20px;
    background: linear-gradient(135deg, var(--deep) 0%, ${tintHex(c.colors.primary, 0.3)} 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    background-size: cover;
    background-position: center;
    overflow: hidden;
  }
  .team-avatar span {
    font-family: var(--font-mono);
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--lime);
  }
  .team-card h3 {
    font-size: 1.15rem;
    color: var(--deep);
    margin-bottom: 4px;
    font-variation-settings: 'SOFT' 50;
  }
  .team-role {
    font-family: var(--font-mono);
    font-size: .75rem;
    color: var(--lime-dark);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 16px;
  }
  .team-specialties {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
    margin-bottom: 16px;
  }
  .team-tag {
    padding: 4px 12px;
    background: var(--offwhite);
    border-radius: 50px;
    font-size: .72rem;
    color: var(--ink-soft);
    border: 1px solid var(--border);
  }
  .team-quote {
    font-size: .88rem;
    color: var(--ink-soft);
    font-style: italic;
    line-height: 1.6;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews-section { background: var(--white); }
  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
    margin-top: 48px;
  }
  .review-card {
    background: var(--offwhite);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 28px;
    transition: all .3s var(--ease);
  }
  .review-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-card);
    border-color: var(--lime);
  }
  .review-stars {
    display: flex;
    gap: 3px;
    margin-bottom: 16px;
  }
  .review-stars svg {
    width: 18px;
    height: 18px;
    fill: var(--lime);
  }
  .review-text {
    font-size: .95rem;
    color: var(--ink);
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
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: var(--deep);
    color: var(--lime);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: .78rem;
    font-weight: 700;
  }
  .review-name {
    font-size: .88rem;
    font-weight: 600;
    color: var(--deep);
  }
  .review-meta {
    font-size: .75rem;
    color: var(--ink-soft);
  }

  /* ========================================
     LOCATION / STANDORT
     ======================================== */
  .location-section {
    background: var(--offwhite-tint);
  }
  .location-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    margin-top: 48px;
    align-items: start;
  }
  .location-map {
    border-radius: var(--radius-lg);
    overflow: hidden;
    aspect-ratio: 4/3;
    background: var(--deep-soft);
    border: 1px solid var(--border);
  }
  .location-map iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }
  .location-details { display: flex; flex-direction: column; gap: 20px; }
  .location-detail {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    transition: all .3s var(--ease);
  }
  .location-detail:hover {
    border-color: var(--lime);
    transform: translateX(4px);
  }
  .location-detail-icon {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-sm);
    background: var(--deep-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--deep);
    flex-shrink: 0;
  }
  .location-detail-icon svg { width: 20px; height: 20px; }
  .location-detail-label {
    font-size: .75rem;
    color: var(--ink-soft);
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 2px;
  }
  .location-detail-value {
    font-size: .95rem;
    font-weight: 600;
    color: var(--deep);
  }
  .location-hours { margin-top: 8px; }
  .hours-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: .88rem; }
  .hours-item:last-child { border-bottom: none; }
  .hours-item .label { display: flex; align-items: center; gap: 8px; color: var(--ink-soft); }
  .hours-item .label svg { width: 16px; height: 16px; opacity: .5; }
  .hours-item .value { font-weight: 600; color: var(--deep); font-family: var(--font-mono); font-size: .82rem; }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section { background: var(--white); }
  .faq-container {
    max-width: 760px;
    margin: 48px auto 0;
  }
  .faq-item {
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    margin-bottom: 12px;
    overflow: hidden;
    transition: all .3s var(--ease);
  }
  .faq-item:hover { border-color: ${hexToRgba(c.colors.accent, 0.4)}; }
  .faq-item.open { border-color: var(--lime); }
  .faq-q { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 20px 24px; background: none; border: none; cursor: pointer; font-size: 1rem; font-weight: 600; color: var(--deep); font-family: var(--font-body); text-align: left; line-height: 1.5; transition: color .3s; }
  .faq-q:hover { color: var(--lime-dark); }
  .faq-icon { font-size: 1.3rem; color: var(--lime); font-weight: 300; transition: transform .3s var(--spring); flex-shrink: 0; margin-left: 16px; }
  .faq-item.open .faq-icon { transform: rotate(45deg); }
  .faq-a { max-height: 0; overflow: hidden; transition: max-height .4s var(--ease), padding .4s var(--ease); padding: 0 24px; font-size: .92rem; color: var(--ink-soft); line-height: 1.8; }
  .faq-item.open .faq-a { max-height: 400px; padding: 0 24px 20px; }

  /* ========================================
     CTA SECTION
     ======================================== */
  .cta-section {
    background: linear-gradient(135deg, var(--deep) 0%, ${primaryDark} 100%);
    color: var(--white);
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .cta-section::before {
    content: '';
    position: absolute;
    top: -100px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.accent, 0.08)} 0%, transparent 60%);
    pointer-events: none;
  }
  .cta-section .section-title { color: var(--white); }
  .cta-section .section-subtitle {
    color: ${hexToRgba('#ffffff', 0.7)};
    margin: 0 auto 32px;
  }
  .cta-features {
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
    margin-bottom: 40px;
  }
  .cta-feature {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: .9rem;
    color: ${hexToRgba('#ffffff', 0.8)};
  }
  .cta-feature svg {
    width: 18px;
    height: 18px;
    color: var(--lime);
  }
  .cta-section .btn-primary {
    background: var(--lime);
    color: var(--deep);
    font-size: 1.05rem;
    padding: 18px 40px;
  }
  .cta-section .btn-primary:hover {
    background: var(--white);
    box-shadow: var(--shadow-glow);
  }

  /* ========================================
     CONTACT
     ======================================== */
  .contact-section {
    background: var(--deep);
    color: var(--white);
  }
  .contact-section .section-tag { color: var(--lime); }
  .contact-section .section-title { color: var(--white); }
  .contact-section .section-subtitle { color: ${hexToRgba('#ffffff', 0.6)}; }
  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    margin-top: 48px;
    align-items: start;
  }
  .contact-info { display: flex; flex-direction: column; gap: 24px; }
  .contact-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: ${hexToRgba('#ffffff', 0.06)}; border: 1px solid ${hexToRgba('#ffffff', 0.1)}; border-radius: var(--radius-md); transition: all .3s var(--ease); }
  .contact-card:hover { background: ${hexToRgba('#ffffff', 0.10)}; border-color: var(--lime); }
  .contact-card-icon { width: 44px; height: 44px; border-radius: var(--radius-sm); background: ${hexToRgba('#ffffff', 0.08)}; display: flex; align-items: center; justify-content: center; color: var(--lime); flex-shrink: 0; }
  .contact-card-icon svg { width: 20px; height: 20px; }
  .contact-card-label { font-size: .75rem; color: ${hexToRgba('#ffffff', 0.5)}; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 1px; }
  .contact-card-value { font-size: .95rem; font-weight: 600; color: var(--white); margin-top: 2px; }

  .contact-form {
    background: ${hexToRgba('#ffffff', 0.06)};
    border: 1px solid ${hexToRgba('#ffffff', 0.1)};
    border-radius: var(--radius-lg);
    padding: 32px;
  }
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  .form-row.full { grid-template-columns: 1fr; }
  .form-field label {
    display: block;
    font-size: .78rem;
    font-weight: 600;
    color: ${hexToRgba('#ffffff', 0.7)};
    margin-bottom: 6px;
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: .5px;
  }
  .form-field input, .form-field select, .form-field textarea { width: 100%; padding: 12px 16px; background: ${hexToRgba('#ffffff', 0.08)}; border: 1px solid ${hexToRgba('#ffffff', 0.12)}; border-radius: var(--radius-sm); color: var(--white); font-family: var(--font-body); font-size: .9rem; transition: all .3s; outline: none; }
  .form-field input::placeholder, .form-field textarea::placeholder { color: ${hexToRgba('#ffffff', 0.3)}; }
  .form-field input:focus, .form-field select:focus, .form-field textarea:focus { border-color: var(--lime); background: ${hexToRgba('#ffffff', 0.12)}; }
  .form-field select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }
  .form-field select option { background: var(--deep); color: var(--white); }
  .form-field textarea { min-height: 120px; resize: vertical; }
  .form-submit { display: inline-flex; align-items: center; gap: 10px; padding: 14px 32px; background: var(--lime); color: var(--deep); border: none; border-radius: 50px; font-size: .95rem; font-weight: 700; font-family: var(--font-body); cursor: pointer; transition: all .3s var(--spring); margin-top: 8px; }
  .form-submit:hover { background: var(--white); transform: translateY(-2px); box-shadow: var(--shadow-glow); }
  .form-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: ${darkenHex(c.colors.primary, 0.4)};
    color: ${hexToRgba('#ffffff', 0.7)};
    padding: 60px 0 30px;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 1.5fr repeat(3, 1fr);
    gap: 40px;
    margin-bottom: 40px;
  }
  .footer-brand .logo {
    color: var(--white);
    margin-bottom: 14px;
  }
  .footer-brand .logo-mark {
    background: var(--lime);
    color: var(--deep);
  }
  .footer-brand p {
    font-size: .88rem;
    line-height: 1.7;
    max-width: 280px;
    color: ${hexToRgba('#ffffff', 0.5)};
  }
  .footer-col h4 { font-size: .82rem; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 1.5px; color: var(--white); margin-bottom: 18px; font-weight: 600; }
  .footer-col ul { list-style: none; }
  .footer-col li { margin-bottom: 10px; }
  .footer-col a { font-size: .88rem; color: ${hexToRgba('#ffffff', 0.5)}; transition: color .3s; }
  .footer-col a:hover { color: var(--lime); }
  .footer-bottom { display: flex; align-items: center; justify-content: space-between; padding-top: 24px; border-top: 1px solid ${hexToRgba('#ffffff', 0.1)}; font-size: .8rem; color: ${hexToRgba('#ffffff', 0.4)}; }
  .footer-bottom a { color: ${hexToRgba('#ffffff', 0.5)}; }
  .footer-bottom a:hover { color: var(--lime); }

  /* ========================================
     MOBILE CTA
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    z-index: 999;
    text-align: center;
    padding: 16px 24px;
    background: var(--deep);
    color: var(--white);
    border-radius: 50px;
    font-size: .95rem;
    font-weight: 700;
    font-family: var(--font-body);
    box-shadow: 0 8px 32px ${hexToRgba(c.colors.primary, 0.4)};
    transition: all .3s var(--spring);
  }
  .mobile-cta:hover { background: var(--lime); color: var(--deep); }

  /* ABOUT STATS */
  .about-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 20px; margin-top: 36px; }
  .about-stat { text-align: center; padding: 20px; background: var(--offwhite); border-radius: var(--radius-md); border: 1px solid var(--border); }
  .about-stat .num { font-family: var(--font-mono); font-size: 1.8rem; font-weight: 700; color: var(--deep); line-height: 1; margin-bottom: 4px; }
  .about-stat .label { font-size: .75rem; color: var(--ink-soft); text-transform: uppercase; letter-spacing: .5px; }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .hero .container { grid-template-columns: 1fr; gap: 40px; }
    .hero-visual { max-width: 500px; margin: 0 auto; }
    .hero-float-card { left: 10px; bottom: -10px; }
    .hero-stat-card { right: 10px; top: 10px; }
    .trust-grid { grid-template-columns: repeat(2, 1fr); }
    .location-grid { grid-template-columns: 1fr; }
    .contact-grid { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: 1fr 1fr; gap: 30px; }
  }

  @media (max-width: 768px) {
    .section { padding: 70px 0; }
    .nav-links {
      display: none;
      position: absolute;
      top: 72px;
      left: 0;
      right: 0;
      background: var(--white);
      flex-direction: column;
      padding: 24px;
      gap: 16px;
      border-bottom: 1px solid var(--border);
      box-shadow: var(--shadow-card);
    }
    .nav-links.open { display: flex; }
    .nav-hamburger { display: flex; align-items: center; justify-content: center; }
    .hero { padding: 120px 0 80px; }
    .hero h1 { font-size: 2rem; }
    .hero-actions { flex-direction: column; align-items: stretch; }
    .hero-float-card,
    .hero-stat-card { display: none; }
    .trust-grid { grid-template-columns: 1fr; }
    .properties-grid { grid-template-columns: 1fr; }
    .services-grid { grid-template-columns: 1fr; }
    .team-grid { grid-template-columns: 1fr; }
    .reviews-grid { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: 1fr; gap: 24px; }
    .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
    .contact-form { padding: 24px; }
    .timeline { padding-left: 50px; }
    .timeline::before { left: 22px; }
    .timeline-marker { left: -50px; width: 44px; height: 44px; }
    .timeline-content { padding: 20px 24px; }
    .mobile-cta { display: block; }
    .properties-header { flex-direction: column; align-items: flex-start; }
  }

  @media (max-width: 480px) {
    .container { padding: 0 16px; }
    .section { padding: 50px 0; }
    .hero { padding: 100px 0 60px; }
    .section-title { font-size: 1.6rem; }
    .hero h1 { font-size: 1.7rem; }
    .hero-lead { font-size: 1rem; }
    .cta-features { flex-direction: column; align-items: center; }
    .timeline { padding-left: 44px; }
    .timeline::before { left: 18px; }
    .timeline-marker { left: -44px; width: 36px; height: 36px; }
    .timeline-number { font-size: .8rem; }
  }
</style>
</head>
<body>

<!-- ====== NAVIGATION ====== -->
<nav class="navbar">
  <div class="container">
    <a href="#" class="logo">
      <span class="logo-mark">${logoInitial}</span>
      ${esc(c.businessName)}
    </a>
    <ul class="nav-links" id="nav-links">
      <li><a href="#properties">Objekte</a></li>
      <li><a href="#services">Leistungen</a></li>
      <li><a href="#process">Prozess</a></li>
      <li><a href="#team">Team</a></li>
      <li><a href="#reviews">Bewertungen</a></li>
      <li><a href="#contact" class="nav-cta">${esc(c.bewertungCtaText || 'Bewertung anfordern')}</a></li>
    </ul>
    <button class="nav-hamburger" id="nav-hamburger" aria-label="Men&uuml; &ouml;ffnen">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
    </button>
  </div>
</nav>

<!-- ====== HERO ====== -->
<section class="hero">
  <div class="container">
    <div class="hero-content">
      ${c.announceText ? `<div class="hero-announce">${esc(c.announceText)}</div>` : ''}
      <div class="hero-tag">${esc(c.heroTag)}</div>
      <h1>${esc(c.heroHeadline)} <span class="accent">${esc(c.heroAccent)}</span></h1>
      <p class="hero-lead">${esc(c.heroLead)}</p>
      <div class="hero-actions">
        <a href="#contact" class="btn-primary">
          ${esc(c.ctaText)}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
        <a href="#properties" class="btn-secondary">
          Objekte entdecken
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M6 9l6 6 6-6"/></svg>
        </a>
      </div>
    </div>
    <div class="hero-visual">
      <div class="hero-image-wrapper">
        ${c.heroImageUrl ? `<img src="${esc(c.heroImageUrl)}" alt="${esc(c.businessName)}" loading="eager">` : ''}
      </div>
      <div class="hero-float-card">
        <div class="float-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div class="float-text">
          <strong>Datenbasiert</strong>
          <span>KI-Bewertung in 48h</span>
        </div>
      </div>
      <div class="hero-stat-card">
        <div class="stat-num">98%</div>
        <div class="stat-label">Verkaufsquote</div>
      </div>
    </div>
  </div>
</section>

<!-- ====== TRUST BADGES ====== -->
<section class="trust-section">
  <div class="container">
    <div class="trust-grid">
      ${trustBadgesHtml}
    </div>
  </div>
</section>

<!-- ====== PROPERTIES / OBJEKTE ====== -->
<section class="section properties-section" id="properties">
  <div class="container">
    <div class="properties-header">
      <div>
        <div class="section-tag">${esc(c.propertiesSectionTitle || 'Aktuelle Objekte')}</div>
        <h2 class="section-title">${esc(c.propertiesSectionTitle || 'Ausgew&auml;hlte Immobilien')}</h2>
        <p class="section-subtitle">${esc(c.propertiesSectionSubtitle || 'Transparente Daten, realistische Preise &mdash; jedes Objekt mit digitaler Analyse.')}</p>
      </div>
    </div>
    <div class="properties-grid">
      ${propertiesHtml}
    </div>
  </div>
</section>

<!-- ====== SERVICES / LEISTUNGEN ====== -->
<section class="section services-section" id="services">
  <div class="container">
    <div class="section-tag">${esc(c.servicesSectionTitle || 'Leistungen')}</div>
    <h2 class="section-title">${esc(c.servicesSectionTitle || 'Tech-gest&uuml;tzte Maklerleistungen')}</h2>
    <p class="section-subtitle">${esc(c.servicesSectionSubtitle || 'Datenbasierte Bewertung, virtuelle Touren und transparenter Verkaufsprozess.')}</p>
    <div class="services-grid">
      ${servicesHtml}
    </div>
  </div>
</section>

<!-- ====== PROCESS / TIMELINE ====== -->
<section class="section process-section" id="process">
  <div class="container">
    <div class="section-tag">${esc(c.processSectionTitle || 'Verkaufsprozess')}</div>
    <h2 class="section-title">${esc(c.processSectionTitle || 'Ihr Weg zum Verkauf')}</h2>
    <p class="section-subtitle">${esc(c.processSectionSubtitle || 'Transparent und digital &mdash; jederzeit den Status Ihres Verkaufs im Blick.')}</p>
    <div class="timeline">
      ${processHtml}
    </div>
  </div>
</section>

<!-- ====== TEAM ====== -->
<section class="section team-section" id="team">
  <div class="container">
    <div class="section-tag">${esc(c.teamSectionTitle || 'Unser Team')}</div>
    <h2 class="section-title">${esc(c.teamSectionTitle || 'Die Menschen hinter den Daten')}</h2>
    <p class="section-subtitle">${esc(c.teamSectionSubtitle || 'Erfahrene Makler mit Tech-Kompetenz &mdash; pers&ouml;nlich und transparent.')}</p>
    <div class="team-grid">
      ${teamHtml}
    </div>
  </div>
</section>

<!-- ====== REVIEWS ====== -->
<section class="section reviews-section" id="reviews">
  <div class="container">
    <div class="section-tag">${esc(c.reviewsSectionTitle || 'Bewertungen')}</div>
    <h2 class="section-title">${esc(c.reviewsSectionTitle || 'Das sagen unsere Kunden')}</h2>
    <div class="reviews-grid">
      ${reviewsHtml}
    </div>
  </div>
</section>

<!-- ====== LOCATION / STANDORT ====== -->
<section class="section location-section" id="location">
  <div class="container">
    <div class="section-tag">${esc(c.locationTitle || 'Standort')}</div>
    <h2 class="section-title">${esc(c.locationTitle || 'Unser B&uuml;ro')}</h2>
    <p class="section-subtitle">${esc(c.locationSubtitle || 'Besuchen Sie uns vor Ort oder vereinbaren Sie einen digitalen Termin.')}</p>
    <div class="location-grid">
      <div class="location-map">
        ${c.locationMapEmbed ? c.locationMapEmbed : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--ink-soft);font-size:.9rem">Karte wird geladen&hellip;</div>`}
      </div>
      <div class="location-details">
        ${locationDetailsHtml}
        <div class="location-hours">
          <div class="location-detail-label" style="margin-bottom:12px;font-family:var(--font-mono);font-size:.75rem;text-transform:uppercase;letter-spacing:1px;color:var(--ink-soft)">&Ouml;ffnungszeiten</div>
          ${hoursHtml}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ====== FAQ ====== -->
${(c.faqItems && c.faqItems.length > 0) ? `
<section class="section faq-section" id="faq">
  <div class="container">
    <div style="text-align:center">
      <div class="section-tag">FAQ</div>
      <h2 class="section-title">H&auml;ufige Fragen</h2>
    </div>
    <div class="faq-container">
      ${faqHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== CTA SECTION ====== -->
<section class="section cta-section">
  <div class="container">
    <div class="section-tag" style="color:var(--lime);justify-content:center">${esc(c.ctaSectionTitle || 'Jetzt starten')}</div>
    <h2 class="section-title">${esc(c.ctaSectionTitle || 'Kostenlose Immobilienbewertung')}</h2>
    <p class="section-subtitle">${esc(c.ctaSectionSubtitle || 'Erfahren Sie den Marktwert Ihrer Immobilie &mdash; datenbasiert, transparent und unverbindlich.')}</p>
    ${ctaFeaturesHtml ? `<div class="cta-features">${ctaFeaturesHtml}</div>` : ''}
    <a href="#contact" class="btn-primary">
      ${esc(c.ctaText)}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>
  </div>
</section>

<!-- ====== CONTACT ====== -->
${c.contactEnabled !== false ? `
<section class="section contact-section" id="contact">
  <div class="container">
    <div class="section-tag">Kontakt</div>
    <h2 class="section-title">Sprechen Sie mit uns</h2>
    <p class="section-subtitle">Unverbindlich und kostenlos &mdash; wir beraten Sie gerne.</p>
    <div class="contact-grid">
      <div class="contact-info">
        ${c.phone ? `
        <div class="contact-card">
          <div class="contact-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div>
            <div class="contact-card-label">Telefon</div>
            <div class="contact-card-value">${esc(c.phone)}</div>
          </div>
        </div>` : ''}
        ${c.email ? `
        <div class="contact-card">
          <div class="contact-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div>
            <div class="contact-card-label">E-Mail</div>
            <div class="contact-card-value">${esc(c.email)}</div>
          </div>
        </div>` : ''}
        ${c.address ? `
        <div class="contact-card">
          <div class="contact-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div>
            <div class="contact-card-label">Adresse</div>
            <div class="contact-card-value">${esc(c.address)}${c.city ? `, ${esc(c.city)}` : ''}</div>
          </div>
        </div>` : ''}
      </div>

      <form class="contact-form" id="contact-form">
        <div class="form-row">
          <div class="form-field">
            <label>Name*</label>
            <input type="text" name="name" required placeholder="Vor- und Nachname">
          </div>
          <div class="form-field">
            <label>E-Mail*</label>
            <input type="email" name="email" required placeholder="mail@beispiel.de">
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>Telefon (optional)</label>
            <input type="tel" name="phone" placeholder="${c.phone ? esc(c.phone) : 'Telefonnummer'}">
          </div>
          <div class="form-field">
            <label>Anliegen</label>
            <select name="betreff">
              <option>Immobilienbewertung</option>
              <option>Verkauf meiner Immobilie</option>
              <option>Kaufberatung</option>
              <option>3D-Tour anfragen</option>
              <option>Allgemeine Anfrage</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>Immobilientyp</label>
            <select name="immobilientyp">
              <option>Eigentumswohnung</option>
              <option>Einfamilienhaus</option>
              <option>Mehrfamilienhaus</option>
              <option>Grundst&uuml;ck</option>
              <option>Gewerbeimmobilie</option>
              <option>Sonstiges</option>
            </select>
          </div>
          <div class="form-field">
            <label>Fl&auml;che (ca. m&sup2;)</label>
            <input type="text" name="flaeche" placeholder="z.B. 120 m&sup2;">
          </div>
        </div>

        <div class="form-row full">
          <div class="form-field">
            <label>Nachricht</label>
            <textarea name="message" placeholder="Beschreiben Sie Ihr Anliegen &mdash; Lage, Zustand, Zeitrahmen ..."></textarea>
          </div>
        </div>

        <div style="position:absolute;left:-9999px"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>

        <button type="submit" class="form-submit" id="contact-submit">
          Kostenlos anfragen
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>
      </form>
    </div>
  </div>
</section>` : ''}

<!-- ====== FOOTER ====== -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#" class="logo">
          <span class="logo-mark">${logoInitial}</span>
          ${esc(c.businessName)}
        </a>
        <p>${esc(c.footerText || c.tagline)}</p>
      </div>
      ${footerColumnsHtml}
      <div class="footer-col">
        <h4>Kontakt</h4>
        <ul>
          ${c.phone ? `<li>${esc(c.phone)}</li>` : ''}
          ${c.email ? `<li>${esc(c.email)}</li>` : ''}
          ${c.address ? `<li>${esc(c.address)}</li>` : ''}
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; ${new Date().getFullYear()} ${esc(c.businessName)}</span>
      <span><a href="${esc(c.imprintUrl || '#')}">Impressum</a> &middot; <a href="${esc(c.privacyUrl || '#')}">Datenschutz</a></span>
    </div>
  </div>
</footer>

<!-- Sticky Mobile CTA -->
<a href="#contact" class="mobile-cta">${esc(c.ctaText)} &rarr;</a>

<script>
  /* Mobile Nav Toggle */
  (function() {
    var btn = document.getElementById('nav-hamburger');
    var links = document.getElementById('nav-links');
    if (btn && links) {
      btn.addEventListener('click', function() {
        links.classList.toggle('open');
        var isOpen = links.classList.contains('open');
        btn.setAttribute('aria-label', isOpen ? 'Men\\u00fc schlie\\u00dfen' : 'Men\\u00fc \\u00f6ffnen');
        btn.innerHTML = isOpen
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
      });
    }
  })();

  /* FAQ accordion */
  document.querySelectorAll('.faq-q').forEach(function(b) {
    b.addEventListener('click', function() {
      var item = b.closest('.faq-item');
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function(x) {
        x.classList.remove('open');
        x.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        b.setAttribute('aria-expanded', 'true');
      }
    });
  });

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
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:var(--white);font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:${hexToRgba('#ffffff', 0.7)};font-size:1.05rem">Wir melden uns innerhalb von 24 Stunden mit einer ersten Einsch&auml;tzung bei Ihnen.</p></div>';
          } else {
            alert(d.error || 'Fehler beim Senden');
            btn.textContent = 'Kostenlos anfragen';
            btn.disabled = false;
          }
        })
        .catch(function() {
          alert('Verbindungsfehler');
          btn.textContent = 'Kostenlos anfragen';
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
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba(c.colors.text, 0.97)};backdrop-filter:blur(12px);color:var(--white);padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:${hexToRgba('#ffffff', 0.8)}">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--white);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--lime);color:var(--deep);border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
