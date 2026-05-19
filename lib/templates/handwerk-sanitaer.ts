/* eslint-disable @typescript-eslint/no-unused-vars */
export interface HandwerkSanitaerConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Tiefblau (#0f2a4a)
    accent: string     // Kupfer (#c87a3a)
    background: string // Hell (#f5f7fa)
    text: string       // Dark text
  }
  phone?: string
  emergencyPhone?: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  openingHours: { days: string; hours: string }[]
  services: { name: string; description: string; icon?: string; price?: string; tag?: string }[]
  fixedPrices: { service: string; price: string; includes?: string[]; note?: string }[]
  beforeAfterProjects?: { label: string; description?: string; beforeUrl?: string; afterUrl?: string }[]
  reviews: { text: string; name: string; source: string; rating: number }[]
  faqItems?: { question: string; answer: string }[]
  heroImageUrl?: string
  aboutTitle?: string
  aboutText?: string
  aboutText2?: string
  teamName?: string
  teamRole?: string
  teamQuote?: string
  trustBadges?: { icon: string; title: string; value: string }[]
  contactEnabled?: boolean
  imprintUrl?: string
  privacyUrl?: string
  footerText?: string
  footerColumns?: { title: string; links: { label: string; href: string }[] }[]
  aboutStats?: { value: string; label: string }[]
  serviceAreaTitle?: string
  serviceAreaSubtitle?: string
  serviceAreas?: string[]
  serviceAreaMapUrl?: string
  ctaSectionTitle?: string
  ctaSectionSubtitle?: string
  ctaFeatures?: string[]
  servicesSectionTitle?: string
  servicesSectionSubtitle?: string
  pricingSectionTitle?: string
  pricingSectionSubtitle?: string
  reviewsSectionTitle?: string
  beforeAfterTitle?: string
  beforeAfterSubtitle?: string
  emergencyAvailable?: boolean
  notdienstText?: string
  notdienstSubtext?: string
  brands?: string[]
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

export function renderHandwerkSanitaerTemplate(config: HandwerkSanitaerConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primaryDark = darkenHex(c.colors.primary, 0.25)
  const primaryLight = tintHex(c.colors.primary, 0.85)
  const primarySoft = hexToRgba(c.colors.primary, 0.12)
  const accentDark = darkenHex(c.colors.accent, 0.25)
  const accentLight = tintHex(c.colors.accent, 0.88)
  const bgTint = tintHex(c.colors.background, -0.03)
  const bgWarm = tintHex(c.colors.background, -0.06)
  const textSoft = tintHex(c.colors.text, 0.5)
  const borderColor = tintHex(c.colors.background, -0.1)

  const logoInitial = esc(c.businessName.charAt(0))

  // Service icon map (plumber/heating themed)
  const serviceIconMap: Record<string, string> = {
    pipe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 14h6v6H4z"/><path d="M14 4h6v6h-6z"/><path d="M7 14V10h10v4"/><path d="M17 10V7"/><path d="M7 20v2"/></svg>',
    wrench: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22c4.97 0 8-3.03 8-8 0-4.97-4-8-4-12 0 0-2.5 2-3 6-.5-3-3-5-3-5-1 4-5 6.5-5 11 0 4.97 3.03 8 7 8z"/></svg>',
    droplet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
    thermometer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    bath: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"/><path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"/><line x1="6" y1="20" x2="6" y2="22"/><line x1="18" y1="20" x2="18" y2="22"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66"/><path d="M20.99 3.01C18 7 14 12 8 15"/></svg>',
    pump: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="10" width="8" height="10" rx="1"/><rect x="14" y="6" width="8" height="14" rx="1"/><path d="M6 10V7a4 4 0 0 1 8 0v3"/><path d="M10 15h4"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
  }
  const defaultServiceIcons = ['pipe', 'flame', 'alert', 'pump', 'bath', 'sun']

  const servicesHtml = c.services.map((svc, i) => {
    const iconKey = svc.icon || defaultServiceIcons[i % defaultServiceIcons.length]
    const iconSvg = serviceIconMap[iconKey] || serviceIconMap.wrench
    return `
        <div class="service-card">
          <div class="service-icon">
            ${iconSvg}
          </div>
          <h3>${esc(svc.name)}</h3>
          <p>${esc(svc.description)}</p>
          ${svc.price ? `<div class="service-price">ab ${esc(svc.price)}</div>` : ''}
          ${svc.tag ? `<span class="service-tag">${esc(svc.tag)}</span>` : ''}
        </div>`
  }).join('\n')

  // Fixed price table
  const fixedPricesHtml = c.fixedPrices.map(fp => `
        <tr>
          <td class="fp-service">
            <strong>${esc(fp.service)}</strong>
            ${fp.includes && fp.includes.length > 0 ? `
            <ul class="fp-includes">
              ${fp.includes.map(inc => `<li>${esc(inc)}</li>`).join('\n              ')}
            </ul>` : ''}
            ${fp.note ? `<span class="fp-note">${esc(fp.note)}</span>` : ''}
          </td>
          <td class="fp-price">${esc(fp.price)}</td>
        </tr>`).join('\n')

  // Before/After projects
  const beforeAfterProjects = c.beforeAfterProjects || [
    { label: 'Badsanierung Altbau', description: 'Komplettumbau mit bodengleicher Dusche und Geberit-Ausstattung' },
    { label: 'Heizungsmodernisierung', description: 'Umstellung von &Ouml;l auf Viessmann W&auml;rmepumpe' },
    { label: 'Rohrbruch-Sanierung', description: 'Notfall-Reparatur und anschlie&szlig;ender Rohrleitungsneubau' },
    { label: 'Solarthermie-Installation', description: 'Aufdach-Anlage f&uuml;r Warmwasser und Heizungsunterst&uuml;tzung' },
  ]
  const baGradients = [
    `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 100%)`,
    `linear-gradient(135deg, ${c.colors.accent} 0%, ${accentDark} 100%)`,
    `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.2)} 0%, ${c.colors.primary} 100%)`,
    `linear-gradient(135deg, ${c.colors.accent} 0%, ${c.colors.primary} 100%)`,
  ]
  const beforeAfterHtml = beforeAfterProjects.slice(0, 4).map((item, i) => {
    const bgStyle = item.beforeUrl
      ? `background-image:url('${esc(item.beforeUrl)}');background-size:cover;background-position:center`
      : `background:${baGradients[i] || baGradients[0]}`
    return `
        <div class="ba-card">
          <div class="ba-image" style="${bgStyle}">
            <div class="ba-label">Vorher / Nachher</div>
          </div>
          <div class="ba-caption">${esc(item.label)}</div>
          ${item.description ? `<div class="ba-desc">${item.description}</div>` : ''}
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
    { icon: 'award', title: 'Meisterbetrieb', value: 'Handwerkskammer eingetragen' },
    { icon: 'shield', title: 'Innungsmitglied', value: 'SHK-Innung Berlin' },
    { icon: 'check', title: 'Vollversichert', value: 'Betriebs- &amp; Haftpflicht' },
    { icon: 'clock', title: '24h Notdienst', value: 'Rund um die Uhr erreichbar' },
  ]
  const trustBadgesHtml = trustBadges.map(b => {
    const icon = serviceIconMap[b.icon] || serviceIconMap.check
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

  // Service areas
  const serviceAreas = c.serviceAreas || ['Neuk&ouml;lln', 'Kreuzberg', 'Tempelhof', 'Sch&ouml;neberg', 'Friedrichshain', 'Treptow', 'Britz', 'Buckow', 'Rudow', 'Gropiusstadt', 'Mariendorf', 'Steglitz']
  const serviceAreasHtml = serviceAreas.map(area => `<span class="area-tag">${area}</span>`).join('\n          ')

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

  // Brands
  const brands = c.brands || ['Viessmann', 'Vaillant', 'Buderus', 'Geberit', 'Grohe', 'Hansgrohe']
  const brandsHtml = brands.map(b => `<span class="brand-tag">${esc(b)}</span>`).join('\n            ')

  // Footer columns
  const footerColumns = c.footerColumns || [
    { title: 'Leistungen', links: [
      { label: 'Sanit&auml;rinstallation', href: '#services' },
      { label: 'Heizungsbau', href: '#services' },
      { label: 'Rohrbruch-Notdienst', href: '#services' },
      { label: 'Badsanierung', href: '#services' },
      { label: 'Festpreise', href: '#pricing' },
    ]},
    { title: 'Unternehmen', links: [
      { label: '&Uuml;ber uns', href: '#about' },
      { label: 'Projekte', href: '#projects' },
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

<!-- Schema.org Plumber -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Plumber",
  "name": "${esc(c.businessName)}",
  "description": "${esc(c.tagline)}",
  ${c.address ? `"address": { "@type": "PostalAddress", "streetAddress": "${esc(c.address)}"${c.city ? `, "addressLocality": "${esc(c.city)}"` : ''}${c.postalCode ? `, "postalCode": "${esc(c.postalCode)}"` : ''}, "addressCountry": "DE" },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  "serviceType": ["Sanit\\u00e4rinstallation", "Heizungsbau", "Rohrbruch-Notdienst", "W\\u00e4rmepumpe", "Badsanierung", "Solarthermie", "Brennwerttechnik"],
  "areaServed": {
    "@type": "City",
    "name": "${esc(c.city || 'Berlin')}"
  },
  "priceRange": "$$",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Sanit\\u00e4r- und Heizungsleistungen",
    "itemListElement": [${c.services.slice(0, 6).map(svc => `{
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "${esc(svc.name)}",
        "description": "${esc(svc.description)}"
      }
    }`).join(',')}]
  },
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
    --primary:       ${esc(c.colors.primary)};
    --primary-dark:  ${primaryDark};
    --primary-light: ${primaryLight};
    --primary-soft:  ${primarySoft};
    --accent:        ${esc(c.colors.accent)};
    --accent-dark:   ${accentDark};
    --accent-light:  ${accentLight};
    --bg:            ${esc(c.colors.background)};
    --bg-tint:       ${bgTint};
    --bg-warm:       ${bgWarm};
    --ink:           ${esc(c.colors.text)};
    --ink-soft:      ${textSoft};
    --border:        ${borderColor};
    --white:         #ffffff;

    --shadow-card: 0 12px 32px ${hexToRgba(c.colors.text, 0.07)};
    --shadow-image: 0 20px 60px ${hexToRgba(c.colors.text, 0.14)};
    --shadow-hover: 0 16px 40px ${hexToRgba(c.colors.primary, 0.18)};

    --spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    --smooth: cubic-bezier(0.16, 1, 0.3, 1);

    --font-display: 'Fraunces', 'Georgia', serif;
    --font-body:    'Inter Tight', system-ui, sans-serif;
    --font-mono:    'JetBrains Mono', monospace;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: var(--font-body);
    color: var(--ink);
    background: var(--bg);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; display: block; }

  .display {
    font-family: var(--font-display);
    font-weight: 500;
    letter-spacing: -0.025em;
    line-height: 1.05;
    font-variation-settings: "opsz" 144, "SOFT" 30;
  }
  .display em {
    font-style: italic;
    color: var(--accent);
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }

  .eyebrow {
    color: var(--accent);
    font-family: var(--font-mono);
    font-weight: 500;
    font-size: 12px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .container { max-width: 1280px; margin: 0 auto; padding: 0 32px; position: relative; }
  section { padding: 96px 0; position: relative; }

  /* ========================================
     24h NOTDIENST BANNER (sticky top)
     ======================================== */
  .notdienst-banner {
    background: linear-gradient(90deg, #b71c1c 0%, #d32f2f 50%, #b71c1c 100%);
    color: var(--white);
    text-align: center;
    padding: 12px 16px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    position: sticky;
    top: 0;
    z-index: 100;
    animation: pulse-bg 3s ease-in-out infinite;
  }
  .notdienst-banner a {
    color: var(--white);
    text-decoration: underline;
    font-weight: 700;
    margin-left: 8px;
  }
  .notdienst-banner .notdienst-icon {
    display: inline-block;
    width: 18px;
    height: 18px;
    vertical-align: middle;
    margin-right: 6px;
    animation: ring 1.5s ease-in-out infinite;
  }
  @keyframes pulse-bg {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.92; }
  }
  @keyframes ring {
    0%, 100% { transform: rotate(0deg); }
    10% { transform: rotate(15deg); }
    20% { transform: rotate(-12deg); }
    30% { transform: rotate(8deg); }
    40% { transform: rotate(0deg); }
  }

  /* ========================================
     ANNOUNCEMENT BAR
     ======================================== */
  .announce {
    background: var(--primary);
    color: var(--white);
    text-align: center;
    padding: 10px 16px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }
  .announce strong { color: var(--accent); }
  .announce a { color: var(--white); text-decoration: underline; font-weight: 700; }

  /* ========================================
     NAV
     ======================================== */
  nav {
    position: sticky; top: ${c.emergencyAvailable !== false ? '42px' : '0'}; z-index: 50;
    background: ${hexToRgba(c.colors.background, 0.92)};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .nav-inner {
    max-width: 1280px; margin: 0 auto; padding: 16px 32px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 32px;
  }
  .logo {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 22px;
    letter-spacing: -0.02em;
    display: flex; align-items: center; gap: 10px;
    font-variation-settings: "opsz" 144, "SOFT" 80;
    font-style: italic;
  }
  .logo-mark {
    width: 40px; height: 40px;
    background: var(--primary);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: var(--white);
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 18px;
    font-style: italic;
    transform: rotate(-3deg);
  }
  .nav-links { display: flex; gap: 28px; font-size: 15px; font-weight: 500; }
  .nav-links a { transition: color 0.2s; color: var(--ink); }
  .nav-links a:hover { color: var(--accent); }
  .nav-cta {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--accent); color: var(--white);
    padding: 10px 22px; border-radius: 50px;
    font-weight: 600; font-size: 14px;
    transition: all 0.35s var(--spring);
    box-shadow: 0 4px 16px ${hexToRgba(c.colors.accent, 0.35)};
  }
  .nav-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 24px ${hexToRgba(c.colors.accent, 0.45)}; }
  .nav-cta svg { width: 14px; height: 14px; }
  .nav-hamburger {
    display: none; background: none; border: none; cursor: pointer;
    color: var(--ink); width: 28px; height: 28px;
  }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    padding: 80px 0 100px;
    background: linear-gradient(170deg, var(--primary) 0%, ${primaryDark} 60%, ${darkenHex(c.colors.primary, 0.4)} 100%);
    color: var(--white);
    overflow: hidden;
    position: relative;
  }
  .hero::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(ellipse 60% 40% at 80% 30%, ${hexToRgba(c.colors.accent, 0.12)} 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 64px; align-items: center;
  }
  .hero-tag {
    display: inline-flex; align-items: center; gap: 8px;
    background: ${hexToRgba('#ffffff', 0.1)};
    border: 1px solid ${hexToRgba('#ffffff', 0.15)};
    border-radius: 50px;
    padding: 6px 16px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent-light);
    margin-bottom: 24px;
    backdrop-filter: blur(8px);
  }
  .hero h1 {
    font-family: var(--font-display);
    font-size: clamp(2.4rem, 5vw, 3.8rem);
    font-weight: 500;
    line-height: 1.05;
    letter-spacing: -0.03em;
    font-variation-settings: "opsz" 144, "SOFT" 30;
    margin-bottom: 20px;
  }
  .hero h1 em {
    font-style: italic;
    color: ${esc(c.colors.accent)};
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }
  .hero-lead {
    font-size: 1.15rem; line-height: 1.7;
    color: ${hexToRgba('#ffffff', 0.75)};
    max-width: 500px;
    margin-bottom: 36px;
  }
  .hero-actions {
    display: flex; gap: 16px; flex-wrap: wrap; align-items: center;
  }
  .hero-cta {
    display: inline-flex; align-items: center; gap: 10px;
    background: var(--accent); color: var(--white);
    padding: 16px 36px; border-radius: 50px;
    font-weight: 700; font-size: 16px;
    transition: all 0.35s var(--spring);
    box-shadow: 0 6px 24px ${hexToRgba(c.colors.accent, 0.4)};
  }
  .hero-cta:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 10px 32px ${hexToRgba(c.colors.accent, 0.55)}; }
  .hero-cta svg { width: 16px; height: 16px; transition: transform 0.3s; }
  .hero-cta:hover svg { transform: translateX(3px); }
  .hero-secondary {
    display: inline-flex; align-items: center; gap: 10px;
    color: var(--white); padding: 16px 28px;
    border: 1px solid ${hexToRgba('#ffffff', 0.25)};
    border-radius: 50px;
    font-weight: 600; font-size: 15px;
    transition: all 0.3s;
    backdrop-filter: blur(8px);
  }
  .hero-secondary:hover { background: ${hexToRgba('#ffffff', 0.1)}; border-color: ${hexToRgba('#ffffff', 0.4)}; }
  .hero-secondary svg { width: 18px; height: 18px; }
  .hero-image {
    position: relative;
    display: flex; justify-content: center; align-items: center;
  }
  .hero-image-placeholder {
    width: 100%; aspect-ratio: 4/3;
    background: linear-gradient(135deg, ${hexToRgba(c.colors.accent, 0.2)} 0%, ${hexToRgba(c.colors.primary, 0.3)} 100%);
    border-radius: 20px;
    border: 1px solid ${hexToRgba('#ffffff', 0.1)};
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .hero-image-placeholder img {
    width: 100%; height: 100%; object-fit: cover; border-radius: 20px;
  }
  .hero-image-placeholder svg {
    width: 80px; height: 80px;
    color: ${hexToRgba('#ffffff', 0.25)};
  }
  .hero-badge {
    position: absolute; bottom: -16px; left: -16px;
    background: var(--white);
    color: var(--primary);
    border-radius: 16px;
    padding: 14px 20px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: var(--shadow-card);
    display: flex; align-items: center; gap: 10px;
  }
  .hero-badge-icon {
    width: 36px; height: 36px;
    background: var(--accent-light);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: var(--accent);
  }
  .hero-badge-icon svg { width: 18px; height: 18px; }

  /* ========================================
     TRUST BADGES
     ======================================== */
  .trust-section {
    padding: 48px 0;
    background: var(--white);
    border-bottom: 1px solid var(--border);
  }
  .trust-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32px;
  }
  .trust-badge {
    display: flex; align-items: center; gap: 16px;
    padding: 20px;
    border-radius: 14px;
    background: var(--bg);
    border: 1px solid var(--border);
    transition: all 0.3s;
  }
  .trust-badge:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-card);
    border-color: var(--accent);
  }
  .trust-icon {
    width: 48px; height: 48px; min-width: 48px;
    background: var(--accent-light);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    color: var(--accent);
  }
  .trust-icon svg { width: 22px; height: 22px; }
  .trust-title { font-weight: 700; font-size: 14px; color: var(--ink); }
  .trust-value { font-size: 13px; color: var(--ink-soft); line-height: 1.4; }

  /* ========================================
     SERVICES
     ======================================== */
  .services-section { background: var(--bg); }
  .services-header { text-align: center; margin-bottom: 64px; }
  .services-header h2 { font-size: clamp(1.8rem, 3.5vw, 2.8rem); margin-top: 12px; }
  .services-header p { color: var(--ink-soft); max-width: 600px; margin: 16px auto 0; font-size: 1.05rem; }
  .services-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }
  .service-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 36px 28px;
    transition: all 0.4s var(--smooth);
    position: relative;
    overflow: hidden;
  }
  .service-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary), var(--accent));
    transform: scaleX(0);
    transition: transform 0.4s var(--smooth);
    transform-origin: left;
  }
  .service-card:hover::before { transform: scaleX(1); }
  .service-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-hover);
    border-color: transparent;
  }
  .service-icon {
    width: 52px; height: 52px;
    background: var(--primary-soft);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    color: var(--primary);
    margin-bottom: 20px;
    transition: all 0.3s;
  }
  .service-card:hover .service-icon {
    background: var(--accent);
    color: var(--white);
  }
  .service-icon svg { width: 24px; height: 24px; }
  .service-card h3 {
    font-family: var(--font-display);
    font-weight: 600; font-size: 1.2rem;
    letter-spacing: -0.01em;
    margin-bottom: 10px;
    font-variation-settings: "opsz" 32, "SOFT" 50;
  }
  .service-card p { color: var(--ink-soft); font-size: 0.92rem; line-height: 1.6; }
  .service-price {
    margin-top: 16px;
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 600;
    color: var(--accent);
  }
  .service-tag {
    display: inline-block; margin-top: 12px;
    background: var(--accent-light); color: var(--accent-dark);
    padding: 4px 12px; border-radius: 50px;
    font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.06em;
  }

  /* Brands / Hersteller */
  .brands-row {
    display: flex; flex-wrap: wrap; gap: 12px;
    justify-content: center;
    margin-top: 48px;
    padding-top: 32px;
    border-top: 1px solid var(--border);
  }
  .brand-tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--white); border: 1px solid var(--border);
    border-radius: 50px; padding: 8px 18px;
    font-family: var(--font-mono); font-size: 12px; font-weight: 600;
    color: var(--ink-soft); letter-spacing: 0.04em;
    transition: all 0.3s;
  }
  .brand-tag:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-light);
  }

  /* ========================================
     FIXED PRICE TABLE
     ======================================== */
  .pricing-section { background: var(--white); }
  .pricing-header { text-align: center; margin-bottom: 48px; }
  .pricing-header h2 { font-size: clamp(1.8rem, 3.5vw, 2.8rem); margin-top: 12px; }
  .pricing-header p { color: var(--ink-soft); max-width: 600px; margin: 16px auto 0; font-size: 1.05rem; }
  .pricing-table-wrap {
    max-width: 900px;
    margin: 0 auto;
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-card);
  }
  .pricing-table {
    width: 100%;
    border-collapse: collapse;
  }
  .pricing-table thead {
    background: var(--primary);
    color: var(--white);
  }
  .pricing-table th {
    padding: 18px 28px;
    text-align: left;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .pricing-table th:last-child { text-align: right; }
  .pricing-table td {
    padding: 20px 28px;
    border-bottom: 1px solid var(--border);
    vertical-align: top;
  }
  .pricing-table tr:last-child td { border-bottom: none; }
  .pricing-table tr:hover { background: ${hexToRgba(c.colors.accent, 0.04)}; }
  .fp-service strong {
    display: block;
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 600;
    margin-bottom: 4px;
    font-variation-settings: "opsz" 32, "SOFT" 50;
  }
  .fp-includes {
    list-style: none; padding: 0; margin: 8px 0 0;
  }
  .fp-includes li {
    font-size: 0.85rem;
    color: var(--ink-soft);
    padding: 2px 0 2px 18px;
    position: relative;
  }
  .fp-includes li::before {
    content: '\\2713';
    position: absolute; left: 0;
    color: var(--accent);
    font-weight: 700;
    font-size: 0.8rem;
  }
  .fp-note {
    display: inline-block;
    margin-top: 6px;
    font-size: 0.78rem;
    color: var(--ink-soft);
    font-style: italic;
  }
  .fp-price {
    text-align: right;
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--primary);
    white-space: nowrap;
  }
  .pricing-footer {
    text-align: center;
    padding: 28px;
    background: var(--bg);
    border-top: 1px solid var(--border);
    font-size: 0.88rem;
    color: var(--ink-soft);
  }
  .pricing-footer strong { color: var(--ink); }

  /* ========================================
     BEFORE / AFTER PROJECTS
     ======================================== */
  .projects-section { background: var(--bg); }
  .projects-header { text-align: center; margin-bottom: 56px; }
  .projects-header h2 { font-size: clamp(1.8rem, 3.5vw, 2.8rem); margin-top: 12px; }
  .projects-header p { color: var(--ink-soft); max-width: 600px; margin: 16px auto 0; font-size: 1.05rem; }
  .ba-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
  }
  .ba-card {
    border-radius: 18px;
    overflow: hidden;
    background: var(--white);
    border: 1px solid var(--border);
    transition: all 0.4s var(--smooth);
  }
  .ba-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-image);
  }
  .ba-image {
    height: 240px;
    position: relative;
    display: flex; align-items: flex-end; justify-content: flex-start;
    padding: 16px;
  }
  .ba-label {
    background: ${hexToRgba('#ffffff', 0.95)};
    backdrop-filter: blur(10px);
    padding: 6px 14px;
    border-radius: 50px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .ba-caption {
    padding: 18px 20px 6px;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.05rem;
    font-variation-settings: "opsz" 32, "SOFT" 50;
  }
  .ba-desc {
    padding: 0 20px 18px;
    font-size: 0.88rem;
    color: var(--ink-soft);
    line-height: 1.5;
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews-section { background: var(--white); }
  .reviews-header { text-align: center; margin-bottom: 56px; }
  .reviews-header h2 { font-size: clamp(1.8rem, 3.5vw, 2.8rem); margin-top: 12px; }
  .reviews-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }
  .review-card {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 32px 28px;
    transition: all 0.4s var(--smooth);
  }
  .review-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-card);
  }
  .review-stars {
    display: flex; gap: 3px; margin-bottom: 16px;
  }
  .review-stars svg {
    width: 18px; height: 18px;
    fill: var(--accent); stroke: none;
  }
  .review-text {
    font-size: 0.95rem;
    line-height: 1.65;
    color: var(--ink);
    margin-bottom: 20px;
    font-style: italic;
  }
  .review-author {
    display: flex; align-items: center; gap: 12px;
  }
  .review-avatar {
    width: 40px; height: 40px;
    background: var(--primary);
    color: var(--white);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700;
    font-family: var(--font-display);
  }
  .review-name { font-weight: 600; font-size: 14px; }
  .review-meta { font-size: 12px; color: var(--ink-soft); }

  /* ========================================
     SERVICE AREA MAP
     ======================================== */
  .area-section { background: var(--bg); }
  .area-header { text-align: center; margin-bottom: 48px; }
  .area-header h2 { font-size: clamp(1.8rem, 3.5vw, 2.8rem); margin-top: 12px; }
  .area-header p { color: var(--ink-soft); max-width: 600px; margin: 16px auto 0; font-size: 1.05rem; }
  .area-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: start;
  }
  .area-map-placeholder {
    width: 100%;
    aspect-ratio: 4/3;
    background: linear-gradient(135deg, var(--primary-soft) 0%, ${hexToRgba(c.colors.accent, 0.1)} 100%);
    border-radius: 18px;
    border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    position: relative;
  }
  .area-map-placeholder img { width: 100%; height: 100%; object-fit: cover; }
  .area-map-placeholder .map-overlay {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--primary);
    background: ${hexToRgba(c.colors.background, 0.6)};
  }
  .area-tags-wrap {
    display: flex; flex-wrap: wrap; gap: 10px;
    margin-top: 24px;
  }
  .area-tag {
    display: inline-block;
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 50px;
    padding: 8px 18px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s;
  }
  .area-tag:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-light);
  }
  .area-info {
    margin-top: 28px;
    padding: 20px 24px;
    background: var(--white);
    border-radius: 14px;
    border: 1px solid var(--border);
  }
  .area-info p {
    font-size: 0.92rem;
    color: var(--ink-soft);
    line-height: 1.6;
  }
  .area-info strong { color: var(--ink); }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section { background: var(--white); }
  .faq-header { text-align: center; margin-bottom: 56px; }
  .faq-header h2 { font-size: clamp(1.8rem, 3.5vw, 2.8rem); margin-top: 12px; }
  .faq-list { max-width: 800px; margin: 0 auto; }
  .faq-item {
    border: 1px solid var(--border);
    border-radius: 14px;
    margin-bottom: 12px;
    overflow: hidden;
    transition: all 0.3s;
  }
  .faq-item:hover { border-color: ${hexToRgba(c.colors.accent, 0.4)}; }
  .faq-q {
    width: 100%; background: var(--bg); border: none;
    padding: 20px 24px;
    font-family: var(--font-body); font-size: 1rem;
    font-weight: 600; text-align: left;
    cursor: pointer; display: flex; align-items: center;
    justify-content: space-between; gap: 16px;
    color: var(--ink); transition: all 0.3s;
  }
  .faq-q:hover { color: var(--accent); }
  .faq-icon {
    width: 28px; height: 28px; min-width: 28px;
    display: flex; align-items: center; justify-content: center;
    background: var(--primary-soft); border-radius: 50%;
    font-size: 16px; font-weight: 700;
    color: var(--primary);
    transition: all 0.3s;
  }
  .faq-item.open .faq-icon {
    background: var(--accent);
    color: var(--white);
    transform: rotate(45deg);
  }
  .faq-a {
    max-height: 0; overflow: hidden;
    transition: max-height 0.4s var(--smooth), padding 0.3s;
    padding: 0 24px;
    font-size: 0.93rem; color: var(--ink-soft); line-height: 1.7;
  }
  .faq-item.open .faq-a {
    max-height: 500px;
    padding: 0 24px 24px;
  }

  /* ========================================
     CTA / CONTACT FORM
     ======================================== */
  .contact-section {
    background: linear-gradient(170deg, var(--primary) 0%, ${primaryDark} 100%);
    color: var(--white);
    padding: 100px 0;
  }
  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1.15fr;
    gap: 64px;
    align-items: start;
  }
  .contact-info h2 {
    font-family: var(--font-display);
    font-size: clamp(1.8rem, 3.5vw, 2.6rem);
    font-weight: 500;
    line-height: 1.1;
    font-variation-settings: "opsz" 144, "SOFT" 50;
    margin-bottom: 16px;
  }
  .contact-info h2 em {
    font-style: italic;
    color: var(--accent);
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }
  .contact-info > p {
    color: ${hexToRgba('#ffffff', 0.7)};
    font-size: 1.05rem;
    line-height: 1.6;
    margin-bottom: 28px;
  }
  .contact-details {
    display: flex; flex-direction: column; gap: 14px;
    margin-bottom: 24px;
  }
  .contact-detail {
    display: flex; align-items: center; gap: 12px;
    font-size: 0.95rem;
    color: ${hexToRgba('#ffffff', 0.8)};
  }
  .contact-detail-icon {
    width: 40px; height: 40px; min-width: 40px;
    background: ${hexToRgba('#ffffff', 0.1)};
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  .contact-detail-icon svg { width: 18px; height: 18px; }
  .contact-hours { margin-top: 12px; }
  .hours-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid ${hexToRgba('#ffffff', 0.1)};
    font-size: 0.9rem;
    color: ${hexToRgba('#ffffff', 0.7)};
  }
  .hours-item .label { display: flex; align-items: center; gap: 8px; }
  .hours-item .label svg { width: 14px; height: 14px; opacity: 0.5; }
  .hours-item .value { font-weight: 600; color: var(--white); }

  .contact-form {
    background: ${hexToRgba('#ffffff', 0.08)};
    border: 1px solid ${hexToRgba('#ffffff', 0.12)};
    border-radius: 20px;
    padding: 36px;
    backdrop-filter: blur(16px);
  }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .form-row.full { grid-template-columns: 1fr; }
  .form-field label {
    display: block; font-size: 13px; font-weight: 600;
    color: ${hexToRgba('#ffffff', 0.8)};
    margin-bottom: 6px;
  }
  .form-field input,
  .form-field select,
  .form-field textarea {
    width: 100%; padding: 12px 16px;
    background: ${hexToRgba('#ffffff', 0.06)};
    border: 1px solid ${hexToRgba('#ffffff', 0.15)};
    border-radius: 10px;
    color: var(--white);
    font-family: var(--font-body);
    font-size: 14px;
    transition: all 0.3s;
    outline: none;
  }
  .form-field input::placeholder,
  .form-field textarea::placeholder {
    color: ${hexToRgba('#ffffff', 0.35)};
  }
  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus {
    border-color: var(--accent);
    background: ${hexToRgba('#ffffff', 0.1)};
  }
  .form-field select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
  }
  .form-field select option { background: var(--primary); color: var(--white); }
  .form-field textarea { height: 120px; resize: vertical; }
  .form-submit {
    width: 100%; margin-top: 8px;
    padding: 16px 28px;
    background: var(--accent); color: var(--white);
    border: none; border-radius: 12px;
    font-family: var(--font-body);
    font-weight: 700; font-size: 16px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: all 0.35s var(--spring);
    box-shadow: 0 6px 24px ${hexToRgba(c.colors.accent, 0.35)};
  }
  .form-submit:hover { transform: translateY(-2px); box-shadow: 0 10px 32px ${hexToRgba(c.colors.accent, 0.5)}; }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: ${darkenHex(c.colors.primary, 0.35)};
    color: ${hexToRgba('#ffffff', 0.7)};
    padding: 64px 0 0;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 1.5fr repeat(3, 1fr);
    gap: 48px;
    padding-bottom: 48px;
    border-bottom: 1px solid ${hexToRgba('#ffffff', 0.1)};
  }
  .footer-brand .logo {
    color: var(--white);
    margin-bottom: 16px;
  }
  .footer-brand p {
    font-size: 0.9rem;
    line-height: 1.6;
    color: ${hexToRgba('#ffffff', 0.5)};
    max-width: 280px;
  }
  .footer-col h4 {
    font-family: var(--font-display);
    font-weight: 600; font-size: 1rem;
    color: var(--white);
    margin-bottom: 18px;
    font-variation-settings: "opsz" 32, "SOFT" 50;
  }
  .footer-col ul { list-style: none; }
  .footer-col li {
    padding: 4px 0;
    font-size: 0.88rem;
    color: ${hexToRgba('#ffffff', 0.5)};
  }
  .footer-col a { transition: color 0.2s; }
  .footer-col a:hover { color: var(--accent); }
  .footer-bottom {
    padding: 24px 0;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 0.82rem;
    color: ${hexToRgba('#ffffff', 0.35)};
  }
  .footer-bottom a { text-decoration: underline; transition: color 0.2s; }
  .footer-bottom a:hover { color: var(--accent); }

  /* ========================================
     MOBILE CTA
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed; bottom: 0; left: 0; right: 0;
    z-index: 80;
    background: var(--accent);
    color: var(--white);
    text-align: center;
    padding: 16px 24px;
    font-weight: 700; font-size: 16px;
    box-shadow: 0 -4px 24px ${hexToRgba(c.colors.text, 0.2)};
    transition: all 0.3s;
  }
  .mobile-cta:hover { background: var(--accent-dark); }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .hero-grid { grid-template-columns: 1fr; gap: 40px; }
    .hero-image { order: -1; }
    .services-grid { grid-template-columns: repeat(2, 1fr); }
    .reviews-grid { grid-template-columns: repeat(2, 1fr); }
    .contact-grid { grid-template-columns: 1fr; gap: 40px; }
    .area-content { grid-template-columns: 1fr; gap: 32px; }
    .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
    .trust-grid { grid-template-columns: repeat(2, 1fr); }
    .ba-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 768px) {
    .container { padding: 0 20px; }
    section { padding: 64px 0; }
    .nav-links { display: none; }
    .nav-links.open {
      display: flex; flex-direction: column;
      position: absolute; top: 100%; left: 0; right: 0;
      background: var(--bg);
      padding: 24px 32px;
      box-shadow: var(--shadow-card);
      border-bottom: 1px solid var(--border);
      gap: 16px;
    }
    .nav-hamburger { display: block; }
    .nav-cta { display: none; }
    .hero { padding: 48px 0 64px; }
    .hero h1 { font-size: 2rem; }
    .hero-lead { font-size: 1rem; }
    .hero-actions { flex-direction: column; align-items: stretch; }
    .hero-cta, .hero-secondary { justify-content: center; }
    .hero-badge { display: none; }
    .services-grid { grid-template-columns: 1fr; }
    .trust-grid { grid-template-columns: 1fr; }
    .ba-grid { grid-template-columns: 1fr; }
    .reviews-grid { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
    .pricing-table th,
    .pricing-table td { padding: 14px 16px; }
    .fp-service strong { font-size: 0.95rem; }
    .fp-price { font-size: 0.95rem; }
    .mobile-cta { display: block; }
    body { padding-bottom: 52px; }
    .notdienst-banner { font-size: 11px; padding: 10px 12px; }
    nav { top: ${c.emergencyAvailable !== false ? '38px' : '0'}; }
  }

  @media (max-width: 480px) {
    .hero h1 { font-size: 1.75rem; }
    .pricing-table-wrap { border-radius: 12px; }
    .pricing-table th { font-size: 10px; padding: 12px; }
    .pricing-table td { padding: 12px; }
    .contact-form { padding: 24px 20px; }
  }
</style>
</head>
<body>

<!-- ====== 24h NOTDIENST BANNER (sticky) ====== -->
${c.emergencyAvailable !== false ? `
<div class="notdienst-banner">
  <svg class="notdienst-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
  ${esc(c.notdienstText || '24h Rohrbruch-Notdienst')} &mdash;
  ${c.emergencyPhone ? `<a href="tel:${esc(c.emergencyPhone)}">${esc(c.emergencyPhone)}</a>` : c.phone ? `<a href="tel:${esc(c.phone)}">${esc(c.phone)}</a>` : ''}
  ${c.notdienstSubtext ? ` &mdash; <span>${esc(c.notdienstSubtext)}</span>` : ''}
</div>` : ''}

<!-- ====== ANNOUNCEMENT ====== -->
${c.announceText ? `
<div class="announce">${c.announceText}</div>` : ''}

<!-- ====== NAV ====== -->
<nav>
  <div class="nav-inner">
    <a href="#" class="logo">
      <span class="logo-mark">${logoInitial}</span>
      ${esc(c.businessName)}
    </a>
    <div class="nav-links" id="nav-links">
      <a href="#services">Leistungen</a>
      <a href="#pricing">Festpreise</a>
      <a href="#projects">Projekte</a>
      <a href="#reviews">Bewertungen</a>
      <a href="#faq">FAQ</a>
      <a href="#contact">Kontakt</a>
    </div>
    <a href="#contact" class="nav-cta">
      ${esc(c.ctaText)}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>
    <button class="nav-hamburger" id="nav-hamburger" aria-label="Men&uuml; &ouml;ffnen">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
    </button>
  </div>
</nav>

<!-- ====== HERO ====== -->
<section class="hero">
  <div class="container">
    <div class="hero-grid">
      <div>
        <div class="hero-tag">${esc(c.heroTag)}</div>
        <h1 class="display">${esc(c.heroHeadline)} <em>${esc(c.heroAccent)}</em></h1>
        <p class="hero-lead">${esc(c.heroLead)}</p>
        <div class="hero-actions">
          <a href="#contact" class="hero-cta">
            ${esc(c.ctaText)}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
          ${c.phone ? `
          <a href="tel:${esc(c.phone)}" class="hero-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            ${esc(c.phone)}
          </a>` : ''}
        </div>
      </div>
      <div class="hero-image">
        <div class="hero-image-placeholder">
          ${c.heroImageUrl ? `<img src="${esc(c.heroImageUrl)}" alt="${esc(c.businessName)}">` : `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`}
        </div>
        <div class="hero-badge">
          <div class="hero-badge-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <div style="font-weight:700;font-size:13px">Meisterbetrieb</div>
            <div style="font-size:11px;color:var(--ink-soft)">HWK eingetragen</div>
          </div>
        </div>
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

<!-- ====== SERVICES ====== -->
<section class="services-section" id="services">
  <div class="container">
    <div class="services-header">
      <div class="eyebrow">${esc(c.servicesSectionTitle || 'Unsere Leistungen')}</div>
      <h2 class="display">${esc(c.servicesSectionSubtitle || 'Sanit\\u00e4r, Heizung & Notdienst')}</h2>
      <p>Fachgerechte Sanit&auml;rinstallation, moderne Brennwerttechnik, W&auml;rmepumpen und zuverl&auml;ssiger Rohrbruch-Notdienst &mdash; alles aus Meisterhand.</p>
    </div>
    <div class="services-grid">
      ${servicesHtml}
    </div>

    <!-- Hersteller / Markenpartner -->
    <div class="brands-row">
      <span class="eyebrow" style="width:100%;text-align:center;margin-bottom:8px">Markenpartner &amp; Hersteller</span>
      ${brandsHtml}
    </div>
  </div>
</section>

<!-- ====== FIXED PRICE TABLE ====== -->
${c.fixedPrices.length > 0 ? `
<section class="pricing-section" id="pricing">
  <div class="container">
    <div class="pricing-header">
      <div class="eyebrow">${esc(c.pricingSectionTitle || 'Festpreise')}</div>
      <h2 class="display">${esc(c.pricingSectionSubtitle || 'Transparente Preise ohne &Uuml;berraschungen')}</h2>
      <p>Alle Preise inkl. Material, Anfahrt und Arbeitslohn. Keine versteckten Kosten &mdash; garantiert.</p>
    </div>
    <div class="pricing-table-wrap">
      <table class="pricing-table">
        <thead>
          <tr>
            <th>Leistung</th>
            <th>Festpreis (inkl. MwSt.)</th>
          </tr>
        </thead>
        <tbody>
          ${fixedPricesHtml}
        </tbody>
      </table>
      <div class="pricing-footer">
        <strong>Individuelle Projekte?</strong> Wir erstellen Ihnen innerhalb von 24h ein ma&szlig;geschneidertes Festpreisangebot. <a href="#contact" style="color:var(--accent);text-decoration:underline;font-weight:600">Jetzt anfragen &rarr;</a>
      </div>
    </div>
  </div>
</section>` : ''}

<!-- ====== BEFORE / AFTER PROJECTS ====== -->
<section class="projects-section" id="projects">
  <div class="container">
    <div class="projects-header">
      <div class="eyebrow">${esc(c.beforeAfterTitle || 'Unsere Projekte')}</div>
      <h2 class="display">${esc(c.beforeAfterSubtitle || 'Vorher / Nachher')}</h2>
      <p>Ausgew&auml;hlte Referenzprojekte &mdash; von der Badsanierung &uuml;ber Heizungsmodernisierung bis zur Rohrbruch-Sanierung.</p>
    </div>
    <div class="ba-grid">
      ${beforeAfterHtml}
    </div>
  </div>
</section>

<!-- ====== REVIEWS ====== -->
<section class="reviews-section" id="reviews">
  <div class="container">
    <div class="reviews-header">
      <div class="eyebrow">${esc(c.reviewsSectionTitle || 'Kundenstimmen')}</div>
      <h2 class="display">Das sagen unsere Kunden</h2>
    </div>
    <div class="reviews-grid">
      ${reviewsHtml}
    </div>
  </div>
</section>

<!-- ====== SERVICE AREA ====== -->
<section class="area-section" id="area">
  <div class="container">
    <div class="area-header">
      <div class="eyebrow">${esc(c.serviceAreaTitle || 'Einsatzgebiet')}</div>
      <h2 class="display">${esc(c.serviceAreaSubtitle || 'Unser Einsatzgebiet in Berlin')}</h2>
      <p>Schnelle Anfahrt in allen Berliner Bezirken &mdash; beim Notdienst in der Regel innerhalb von 30&ndash;60 Minuten.</p>
    </div>
    <div class="area-content">
      <div>
        <div class="area-map-placeholder">
          ${c.serviceAreaMapUrl ? `<img src="${esc(c.serviceAreaMapUrl)}" alt="Einsatzgebiet ${esc(c.businessName)}">` : `<div class="map-overlay">Einsatzgebiet ${esc(c.city || 'Berlin')}</div>`}
        </div>
      </div>
      <div>
        <h3 style="font-family:var(--font-display);font-size:1.3rem;font-weight:600;margin-bottom:16px;font-variation-settings:'opsz' 32,'SOFT' 50">Stadtteile &amp; Bezirke</h3>
        <div class="area-tags-wrap">
          ${serviceAreasHtml}
        </div>
        <div class="area-info">
          <p><strong>Notdienst-Anfahrt:</strong> Im Notfall sind wir in der Regel innerhalb von 30&ndash;60 Minuten bei Ihnen vor Ort. Anfahrtskosten sind im Festpreis enthalten.</p>
        </div>
        ${c.phone ? `
        <div style="margin-top:20px;display:flex;align-items:center;gap:12px">
          <div style="width:44px;height:44px;background:var(--accent-light);border-radius:12px;display:flex;align-items:center;justify-content:center;color:var(--accent)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div>
            <div style="font-size:12px;color:var(--ink-soft)">Jetzt anrufen</div>
            <a href="tel:${esc(c.phone)}" style="font-weight:700;font-size:1.1rem;color:var(--primary)">${esc(c.phone)}</a>
          </div>
        </div>` : ''}
      </div>
    </div>
  </div>
</section>

<!-- ====== FAQ ====== -->
${(c.faqItems || []).length > 0 ? `
<section class="faq-section" id="faq">
  <div class="container">
    <div class="faq-header">
      <div class="eyebrow">H&auml;ufige Fragen</div>
      <h2 class="display">FAQ</h2>
    </div>
    <div class="faq-list">
      ${faqHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== CTA / CONTACT ====== -->
${c.contactEnabled !== false ? `
<section class="contact-section" id="contact">
  <div class="container">
    <div class="contact-grid">
      <div class="contact-info">
        <div class="eyebrow" style="color:var(--accent-light)">${esc(c.ctaSectionTitle || 'Kontakt')}</div>
        <h2>${esc(c.ctaSectionSubtitle || 'Jetzt <em>Festpreisangebot</em> anfordern')}</h2>
        <p>Beschreiben Sie Ihr Anliegen und wir melden uns innerhalb von 24 Stunden mit einem verbindlichen Festpreisangebot bei Ihnen.</p>

        <div class="contact-details">
          ${c.phone ? `
          <div class="contact-detail">
            <div class="contact-detail-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div>
              <div style="font-size:12px;color:${hexToRgba('#ffffff', 0.5)}">Telefon</div>
              <a href="tel:${esc(c.phone)}" style="font-weight:600;color:var(--white)">${esc(c.phone)}</a>
            </div>
          </div>` : ''}
          ${c.email ? `
          <div class="contact-detail">
            <div class="contact-detail-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div>
              <div style="font-size:12px;color:${hexToRgba('#ffffff', 0.5)}">E-Mail</div>
              <a href="mailto:${esc(c.email)}" style="font-weight:600;color:var(--white)">${esc(c.email)}</a>
            </div>
          </div>` : ''}
          ${c.address ? `
          <div class="contact-detail">
            <div class="contact-detail-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <div style="font-size:12px;color:${hexToRgba('#ffffff', 0.5)}">Adresse</div>
              <span style="font-weight:600;color:var(--white)">${esc(c.address)}${c.city ? `, ${esc(c.city)}` : ''}</span>
            </div>
          </div>` : ''}
        </div>

        <div class="contact-hours">
          ${hoursHtml}
        </div>

      ${ctaFeaturesHtml ? `
      <div style="margin-top:28px;display:flex;flex-direction:column;gap:10px">
        ${ctaFeaturesHtml || `
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Festpreisangebot innerhalb 24h
        </div>
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Meisterbetrieb mit Innungszugeh&ouml;rigkeit
        </div>
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Zufriedenheitsgarantie
        </div>`}
      </div>` : ''}

      ${c.emergencyPhone || c.phone ? `
      <div style="margin-top:32px;display:flex;align-items:center;gap:12px">
        <div style="width:44px;height:44px;background:${hexToRgba('#ffffff', 0.15)};border-radius:12px;display:flex;align-items:center;justify-content:center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </div>
        <div>
          <div style="font-size:12px;color:${hexToRgba('#ffffff', 0.6)}">24h Notdienst</div>
          <a href="tel:${esc(c.emergencyPhone || c.phone || '')}" style="font-weight:700;font-size:1.1rem;color:var(--white)">${esc(c.emergencyPhone || c.phone || '')}</a>
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
          <label>Gew&uuml;nschter Service</label>
          <select name="betreff">
            <option>Sanit&auml;rinstallation</option>
            <option>Heizungsbau / Brennwerttechnik</option>
            <option>Rohrbruch-Notdienst</option>
            <option>W&auml;rmepumpe</option>
            <option>Badsanierung</option>
            <option>Solarthermie</option>
            <option>Wartung / Reparatur</option>
            <option>Sonstiges</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label>Objekt-Typ</label>
          <select name="objekttyp">
            <option>Wohnung</option>
            <option>Einfamilienhaus</option>
            <option>Mehrfamilienhaus</option>
            <option>Gewerbe</option>
            <option>Sonstiges</option>
          </select>
        </div>
        <div class="form-field">
          <label>Wunschtermin</label>
          <input type="date" name="termin">
        </div>
      </div>

      <div class="form-row full">
        <div class="form-field">
          <label>Beschreibung Ihres Anliegens</label>
          <textarea name="message" placeholder="Beschreiben Sie Ihr Anliegen, z.B. Art des Problems, vorhandene Heizung, Baujahr, gew&uuml;nschte Hersteller (Viessmann, Vaillant, Buderus, Geberit) ..."></textarea>
        </div>
      </div>

      <div style="position:absolute;left:-9999px"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>

      <button type="submit" class="form-submit" id="contact-submit">
        Festpreisangebot anfordern
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
          ${c.emergencyPhone ? `<li>Notdienst: ${esc(c.emergencyPhone)}</li>` : ''}
          ${c.email ? `<li>${esc(c.email)}</li>` : ''}
          ${c.address ? `<li>${esc(c.address)}</li>` : ''}
          ${c.city ? `<li>${c.postalCode ? esc(c.postalCode) + ' ' : ''}${esc(c.city)}</li>` : ''}
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

  /* Smooth scroll for anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var links = document.getElementById('nav-links');
        if (links) links.classList.remove('open');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:var(--white);font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:${hexToRgba('#ffffff', 0.7)};font-size:1.05rem">Wir erstellen Ihr Festpreisangebot und melden uns innerhalb von 24 Stunden bei Ihnen.</p></div>';
          } else {
            alert(d.error || 'Fehler beim Senden');
            btn.textContent = 'Festpreisangebot anfordern';
            btn.disabled = false;
          }
        })
        .catch(function() {
          alert('Verbindungsfehler');
          btn.textContent = 'Festpreisangebot anfordern';
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
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--accent);color:var(--white);border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
