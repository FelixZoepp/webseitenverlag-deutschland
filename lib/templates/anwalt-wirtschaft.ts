export interface AnwaltWirtschaftConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Marineblau #0e1f3e
    accent: string     // Bordeaux #6b2a3a
    background: string // Bone #f5f0e6
    text: string       // Dark text
  }
  phone?: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  openingHours: { days: string; hours: string }[]
  practiceAreas: {
    name: string
    description: string
    icon?: string
    keywords?: string[]
  }[]
  honorarInfo?: {
    title?: string
    subtitle?: string
    items: { label: string; description: string; icon?: string }[]
    footnote?: string
  }
  team: {
    name: string
    title: string
    specialty: string
    imageUrl?: string
    quote?: string
    admissions?: string[]
  }[]
  mandateStats: {
    label: string
    value: string
    suffix?: string
  }[]
  reviews: { text: string; name: string; context: string; rating: number }[]
  reachability?: {
    title?: string
    subtitle?: string
    items: { icon?: string; label: string; detail: string }[]
  }
  serviceArea?: {
    title?: string
    subtitle?: string
    description?: string
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

export function renderAnwaltWirtschaftTemplate(config: AnwaltWirtschaftConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primaryDark = darkenHex(c.colors.primary, 0.25)
  const primaryLight = tintHex(c.colors.primary, 0.85)
  const primarySoft = hexToRgba(c.colors.primary, 0.08)
  const accentDark = darkenHex(c.colors.accent, 0.25)
  const accentSoft = hexToRgba(c.colors.accent, 0.12)
  const accentLight = tintHex(c.colors.accent, 0.75)
  const bgTint = tintHex(c.colors.background, -0.03)
  const bgWarm = tintHex(c.colors.background, -0.06)
  const textSoft = tintHex(c.colors.text, 0.45)
  const borderColor = tintHex(c.colors.background, -0.12)

  const logoInitial = esc(c.businessName.charAt(0))

  // Practice area icon mapping
  const practiceIconMap: Record<string, string> = {
    arbeitsrecht: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="18" width="32" height="22" rx="3"/><path d="M18 18v-6a6 6 0 0112 0v6"/><circle cx="24" cy="30" r="3"/><path d="M24 33v3"/></svg>',
    vertragsrecht: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="10" y="6" width="28" height="36" rx="2"/><path d="M18 16h12M18 22h12M18 28h8"/><path d="M16 34l4 4 8-8" stroke="var(--bordeaux)" stroke-width="2.5"/></svg>',
    gesellschaftsrecht: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="20" width="32" height="22" rx="2"/><path d="M24 6v14"/><path d="M16 14h16l-8-8-8 8z"/><path d="M16 28h16M16 34h16" opacity="0.4"/></svg>',
    ma: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="20" r="10"/><circle cx="30" cy="20" r="10"/><path d="M24 12v16" stroke="var(--bordeaux)" stroke-width="2.5"/><path d="M16 36h16" stroke-width="2"/></svg>',
    itrecht: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="8" width="32" height="24" rx="3"/><path d="M8 36h32"/><path d="M20 40h8"/><path d="M24 32v8"/><path d="M18 18l-4 4 4 4" stroke="var(--bordeaux)" stroke-width="2"/><path d="M30 18l4 4-4 4" stroke="var(--bordeaux)" stroke-width="2"/></svg>',
    wirtschaftsstrafrecht: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 40h36"/><path d="M24 8l18 10H6l18-10z"/><path d="M12 18v18M20 18v18M28 18v18M36 18v18"/><circle cx="24" cy="12" r="2" fill="var(--bordeaux)" stroke="none"/></svg>',
  }

  // Default practice icon
  const defaultPracticeIcon = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M24 4L6 14v4h36v-4L24 4z"/><path d="M10 18v18h28V18"/><path d="M6 36h36v4H6z"/><path d="M18 24h12v12H18z"/></svg>'

  // Practice areas HTML
  const practiceAreasHtml = c.practiceAreas.map(pa => {
    const iconKey = (pa.icon || pa.name).toLowerCase()
      .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
      .replace(/m\s*&\s*a/g, 'ma').replace(/m&a/g, 'ma')
      .replace(/it[\s-]?recht/g, 'itrecht')
      .replace(/[^a-z]/g, '')
    const svgIcon = practiceIconMap[iconKey] || defaultPracticeIcon
    return `
          <div class="practice-card animate-in">
            <div class="practice-icon">${svgIcon}</div>
            <h3>${esc(pa.name)}</h3>
            <p>${esc(pa.description)}</p>
            ${pa.keywords && pa.keywords.length > 0 ? `<div class="practice-tags">${pa.keywords.map(k => `<span class="practice-tag">${esc(k)}</span>`).join('')}</div>` : ''}
          </div>`
  }).join('\n')

  // Team HTML
  const teamHtml = c.team.map(member => {
    const initials = member.name.split(' ').filter(w => !['Dr.', 'Prof.', 'LL.M.', 'MBA'].includes(w)).map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    return `
          <div class="team-card animate-in">
            <div class="team-photo">
              ${member.imageUrl ? `<img src="${esc(member.imageUrl)}" alt="${esc(member.name)}" loading="lazy">` : `<div class="team-initials">${esc(initials)}</div>`}
            </div>
            <div class="team-info">
              <h3>${esc(member.name)}</h3>
              <div class="team-title">${esc(member.title)}</div>
              <div class="team-specialty">${esc(member.specialty)}</div>
              ${member.admissions && member.admissions.length > 0 ? `<div class="team-admissions">${member.admissions.map(a => `<span class="admission-badge">${esc(a)}</span>`).join('')}</div>` : ''}
              ${member.quote ? `<blockquote class="team-quote">&bdquo;${esc(member.quote)}&ldquo;</blockquote>` : ''}
            </div>
          </div>`
  }).join('\n')

  // Mandate stats HTML
  const mandateStatsHtml = c.mandateStats.map(stat => `
          <div class="stat-item animate-in">
            <div class="stat-value">${esc(stat.value)}${stat.suffix ? `<span class="stat-suffix">${esc(stat.suffix)}</span>` : ''}</div>
            <div class="stat-label">${esc(stat.label)}</div>
          </div>`).join('\n')

  // Reviews HTML
  const reviewsHtml = c.reviews.map(r => {
    const initials = r.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    return `
          <div class="review-card animate-in">
            <div class="review-stars">${generateStarsSvg(r.rating)}</div>
            <p class="review-text">&bdquo;${esc(r.text)}&ldquo;</p>
            <div class="review-author">
              <div class="review-avatar">${esc(initials)}</div>
              <div>
                <div class="review-name">${esc(r.name)}</div>
                <div class="review-context">${esc(r.context)}</div>
              </div>
            </div>
          </div>`
  }).join('\n')

  // Honorar info HTML
  const honorar = c.honorarInfo || {
    title: 'Honorar &amp; Transparenz',
    subtitle: 'Klare Konditionen von Anfang an',
    items: [
      { label: 'Erstberatung', description: 'Kostenfreies Orientierungsgespr\u00e4ch (30 Min.) zur Einsch\u00e4tzung Ihres Anliegens und der Erfolgsaussichten.' },
      { label: 'Stundensatz', description: 'Abrechnung nach RVG oder individuellem Stundensatzhonorar \u2014 transparent und vorab vereinbart.' },
      { label: 'Streitwertbasiert', description: 'Bei gerichtlichen Verfahren Abrechnung gem\u00e4\u00df RVG nach Streitwert. Vorab-Kalkulation inklusive.' },
      { label: 'Pauschalhonorar', description: 'F\u00fcr Vertragspr\u00fcfungen, Due Diligence und definierte Mandate bieten wir Festpreise an.' },
    ],
    footnote: 'Alle Honorarvereinbarungen werden vor Mandats\u00fcbernahme schriftlich fixiert.',
  }
  const honorarIconMap: Record<string, string> = {
    erstberatung: '<svg viewBox="0 0 40 40" fill="none" stroke="var(--bordeaux)" stroke-width="2"><circle cx="20" cy="20" r="16"/><path d="M20 12v8l5 5"/></svg>',
    stundensatz: '<svg viewBox="0 0 40 40" fill="none" stroke="var(--bordeaux)" stroke-width="2"><rect x="8" y="8" width="24" height="24" rx="2"/><path d="M14 20h12M20 14v12"/></svg>',
    streitwertbasiert: '<svg viewBox="0 0 40 40" fill="none" stroke="var(--bordeaux)" stroke-width="2"><path d="M8 32l8-10 6 6 10-16"/><circle cx="32" cy="12" r="3" fill="var(--bordeaux)" stroke="none" opacity="0.3"/></svg>',
    pauschalhonorar: '<svg viewBox="0 0 40 40" fill="none" stroke="var(--bordeaux)" stroke-width="2"><rect x="6" y="14" width="28" height="18" rx="2"/><path d="M6 20h28"/><circle cx="20" cy="26" r="4"/></svg>',
  }
  const defaultHonorarIcon = '<svg viewBox="0 0 40 40" fill="none" stroke="var(--bordeaux)" stroke-width="2"><circle cx="20" cy="20" r="16"/><path d="M14 20l4 4 8-8"/></svg>'
  const honorarItemsHtml = honorar.items.map(item => {
    const iconKey = (item.icon || item.label).toLowerCase()
      .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
      .replace(/[^a-z]/g, '')
    const svgIcon = honorarIconMap[iconKey] || defaultHonorarIcon
    return `
            <div class="honorar-card animate-in">
              <div class="honorar-icon">${svgIcon}</div>
              <h4>${esc(item.label)}</h4>
              <p>${esc(item.description)}</p>
            </div>`
  }).join('\n')

  // Reachability HTML
  const reachability = c.reachability || {
    title: 'Erreichbarkeit',
    subtitle: 'Wir sind f\u00fcr Sie da',
    items: [
      { icon: 'phone', label: 'Telefonisch', detail: c.phone || '+49 69 123456-0' },
      { icon: 'email', label: 'Per E-Mail', detail: c.email || 'kanzlei@brueckmann-partner.de' },
      { icon: 'clock', label: 'Sprechzeiten', detail: 'Mo\u2013Fr 08:00\u201318:00 Uhr' },
      { icon: 'emergency', label: 'Notfall-Hotline', detail: 'Eilverf\u00fcgungen & einstweiliger Rechtsschutz' },
    ],
  }
  const reachabilityIconMap: Record<string, string> = {
    phone: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 8a2 2 0 012-2h4l3 7-3 2a14 14 0 009 9l2-3 7 3v4a2 2 0 01-2 2C18 34 6 22 6 10a2 2 0 012-2z"/></svg>',
    email: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="10" width="28" height="20" rx="2"/><path d="M6 10l14 10 14-10"/></svg>',
    clock: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><circle cx="20" cy="20" r="16"/><path d="M20 10v10l7 4"/></svg>',
    emergency: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/><path d="M10 28h20v6H10z" rx="1"/></svg>',
    location: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 4C13 4 8 9 8 16c0 10 12 20 12 20s12-10 12-20c0-7-5-12-12-12z"/><circle cx="20" cy="16" r="4"/></svg>',
  }
  const defaultReachIcon = '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><circle cx="20" cy="20" r="16"/><path d="M14 20l4 4 8-8"/></svg>'
  const reachabilityHtml = reachability.items.map(item => {
    const iconKey = (item.icon || item.label).toLowerCase().replace(/[^a-z]/g, '')
    const svgIcon = reachabilityIconMap[iconKey] || defaultReachIcon
    return `
            <div class="reach-item animate-in">
              <div class="reach-icon">${svgIcon}</div>
              <div class="reach-content">
                <div class="reach-label">${esc(item.label)}</div>
                <div class="reach-detail">${esc(item.detail)}</div>
              </div>
            </div>`
  }).join('\n')

  // FAQ HTML
  const faqHtml = (c.faqItems || []).map(f => `
        <div class="faq-item">
          <button class="faq-q" aria-expanded="false">${esc(f.question)}<span class="faq-icon">+</span></button>
          <div class="faq-a" role="region">${esc(f.answer)}</div>
        </div>`).join('')

  // Contact form fields
  const defaultFields = [
    { name: 'name', label: 'Vor- und Nachname', type: 'text', required: true, placeholder: 'Max Mustermann' },
    { name: 'company', label: 'Unternehmen', type: 'text', required: false, placeholder: 'Firma GmbH' },
    { name: 'email', label: 'E-Mail', type: 'email', required: true, placeholder: 'max@firma.de' },
    { name: 'phone', label: 'Telefon', type: 'tel', required: false, placeholder: '+49 69 ...' },
    { name: 'rechtsgebiet', label: 'Rechtsgebiet', type: 'select', required: false, options: c.practiceAreas.map(pa => pa.name) },
    { name: 'streitwert', label: 'Gesch\u00e4tzter Streitwert', type: 'text', required: false, placeholder: 'ca. EUR' },
    { name: 'message', label: 'Sachverhalt (vertraulich)', type: 'textarea', required: false, placeholder: 'Bitte schildern Sie Ihr Anliegen...' },
  ]
  const contactFields = c.contactFields || defaultFields
  const contactFieldsHtml = contactFields.map(f => {
    if (f.type === 'textarea') {
      return `
            <div class="form-group full">
              <label for="cf-${esc(f.name)}">${esc(f.label)}${f.required ? ' *' : ''}</label>
              <textarea id="cf-${esc(f.name)}" name="${esc(f.name)}" rows="5" placeholder="${esc(f.placeholder || '')}"${f.required ? ' required' : ''}></textarea>
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
    { title: 'Fachgebiete', links: [
      { label: 'Arbeitsrecht', href: '#practice-areas' },
      { label: 'Vertragsrecht', href: '#practice-areas' },
      { label: 'Gesellschaftsrecht', href: '#practice-areas' },
      { label: 'M&A', href: '#practice-areas' },
    ]},
    { title: 'Kanzlei', links: [
      { label: 'Team', href: '#team' },
      { label: 'Honorar', href: '#honorar' },
      { label: 'Erreichbarkeit', href: '#reachability' },
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
    'Kostenfreies Erstgespr\u00e4ch',
    'Fachanwaltliche Expertise',
    'Diskrete Mandatsf\u00fchrung',
    'Bundesweite Vertretung',
  ]
  const ctaFeaturesHtml = ctaFeatures.map(f => `
            <div class="cta-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--bordeaux-light)" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
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
    { label: 'Fachgebiete', href: '#practice-areas' },
    { label: 'Team', href: '#team' },
    { label: 'Honorar', href: '#honorar' },
    { label: 'Mandate', href: '#mandate-stats' },
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

<!-- Schema.org Attorney -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Attorney",
  "name": "${esc(c.businessName)}",
  "description": "${esc(c.tagline)}",
  ${c.address ? `"address": {
    "@type": "PostalAddress",
    "streetAddress": "${esc(c.address)}"${c.postalCode ? `,\n    "postalCode": "${esc(c.postalCode)}"` : ''}${c.city ? `,\n    "addressLocality": "${esc(c.city)}",\n    "addressCountry": "DE"` : ''}
  },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  "priceRange": "$$$",
  "knowsAbout": [${c.practiceAreas.map(pa => `"${esc(pa.name)}"`).join(', ')}],
  ${c.team.length > 0 ? `"employee": [${c.team.map(m => `{
    "@type": "Person",
    "name": "${esc(m.name)}",
    "jobTitle": "${esc(m.title)}",
    "knowsAbout": "${esc(m.specialty)}"
  }`).join(',')}],` : ''}
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
  "url": "${appUrl}${siteId ? `/s/${siteId}` : ''}"
}
</script>

<style>
  /* ========================================
     DESIGN TOKENS
     ======================================== */
  :root {
    --marine:          ${esc(c.colors.primary)};
    --marine-dark:     ${primaryDark};
    --marine-light:    ${primaryLight};
    --marine-soft:     ${primarySoft};
    --bordeaux:        ${esc(c.colors.accent)};
    --bordeaux-dark:   ${accentDark};
    --bordeaux-soft:   ${accentSoft};
    --bordeaux-light:  ${accentLight};
    --bone:            ${esc(c.colors.background)};
    --bone-tint:       ${bgTint};
    --bone-warm:       ${bgWarm};
    --text:            ${esc(c.colors.text)};
    --text-soft:       ${textSoft};
    --border:          ${borderColor};
    --font-display:    'Fraunces', Georgia, serif;
    --font-body:       'Inter Tight', -apple-system, sans-serif;
    --font-mono:       'JetBrains Mono', monospace;
    --max-w:           1200px;
    --radius:          10px;
    --radius-lg:       16px;
    --shadow-sm:       0 1px 3px ${hexToRgba(c.colors.primary, 0.06)};
    --shadow-md:       0 4px 16px ${hexToRgba(c.colors.primary, 0.08)};
    --shadow-lg:       0 12px 40px ${hexToRgba(c.colors.primary, 0.12)};
    --shadow-card:     0 2px 12px ${hexToRgba(c.colors.primary, 0.06)}, 0 0 0 1px ${hexToRgba(c.colors.primary, 0.04)};
    --transition:      0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ========================================
     RESET & BASE
     ======================================== */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
  body {
    font-family: var(--font-body);
    color: var(--text);
    background: var(--bone);
    line-height: 1.7;
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }
  img { max-width: 100%; height: auto; display: block; }
  a { color: inherit; text-decoration: none; transition: color var(--transition); }
  button { cursor: pointer; font-family: inherit; }

  /* ========================================
     TYPOGRAPHY
     ======================================== */
  .section-eyebrow {
    font-family: var(--font-mono);
    font-size: .72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--bordeaux);
    font-weight: 500;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .section-eyebrow::before {
    content: '';
    width: 24px;
    height: 1.5px;
    background: var(--bordeaux);
    display: inline-block;
    flex-shrink: 0;
  }
  .section-title {
    font-family: var(--font-display);
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    font-weight: 700;
    line-height: 1.2;
    color: var(--marine);
    margin-bottom: 16px;
    letter-spacing: -0.02em;
  }
  .section-subtitle {
    font-size: 1.05rem;
    color: var(--text-soft);
    max-width: 640px;
    line-height: 1.7;
  }

  /* ========================================
     LAYOUT
     ======================================== */
  .container {
    max-width: var(--max-w);
    margin: 0 auto;
    padding: 0 24px;
  }
  section {
    padding: 80px 0;
  }

  /* ========================================
     ANIMATIONS
     ======================================== */
  .animate-in {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .animate-in.visible {
    opacity: 1;
    transform: translateY(0);
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
    background: ${hexToRgba(c.colors.background, 0.92)};
    backdrop-filter: blur(16px) saturate(1.6);
    -webkit-backdrop-filter: blur(16px) saturate(1.6);
    border-bottom: 1px solid ${hexToRgba(c.colors.primary, 0.06)};
    transition: box-shadow var(--transition), background var(--transition);
  }
  .nav.scrolled {
    box-shadow: 0 2px 20px ${hexToRgba(c.colors.primary, 0.1)};
  }
  .nav-inner {
    max-width: var(--max-w);
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 72px;
  }
  .nav-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--marine);
    letter-spacing: -0.02em;
  }
  .nav-logo-mark {
    width: 40px;
    height: 40px;
    background: var(--marine);
    color: var(--bone);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 800;
    border-radius: 6px;
  }
  .nav-links {
    display: flex;
    align-items: center;
    gap: 32px;
    list-style: none;
  }
  .nav-links a {
    font-size: .85rem;
    font-weight: 500;
    color: var(--text-soft);
    transition: color var(--transition);
    position: relative;
  }
  .nav-links a:hover,
  .nav-links a:focus {
    color: var(--marine);
  }
  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--bordeaux);
    transition: width var(--transition);
  }
  .nav-links a:hover::after {
    width: 100%;
  }
  .nav-cta {
    background: var(--marine);
    color: var(--bone) !important;
    padding: 9px 22px;
    border-radius: 6px;
    font-size: .83rem;
    font-weight: 600;
    transition: background var(--transition), transform var(--transition);
    border: none;
  }
  .nav-cta:hover {
    background: var(--marine-dark);
    transform: translateY(-1px);
  }
  .nav-cta::after { display: none !important; }

  /* Mobile menu */
  .nav-toggle {
    display: none;
    background: none;
    border: none;
    width: 40px;
    height: 40px;
    position: relative;
    cursor: pointer;
  }
  .nav-toggle span {
    display: block;
    width: 22px;
    height: 2px;
    background: var(--marine);
    position: absolute;
    left: 9px;
    transition: var(--transition);
  }
  .nav-toggle span:nth-child(1) { top: 12px; }
  .nav-toggle span:nth-child(2) { top: 19px; }
  .nav-toggle span:nth-child(3) { top: 26px; }
  .nav-toggle.active span:nth-child(1) { top: 19px; transform: rotate(45deg); }
  .nav-toggle.active span:nth-child(2) { opacity: 0; }
  .nav-toggle.active span:nth-child(3) { top: 19px; transform: rotate(-45deg); }

  @media (max-width: 900px) {
    .nav-toggle { display: block; }
    .nav-links {
      position: fixed;
      top: 72px;
      left: 0;
      right: 0;
      background: var(--bone);
      flex-direction: column;
      padding: 24px;
      gap: 0;
      box-shadow: var(--shadow-lg);
      transform: translateY(-110%);
      transition: transform var(--transition);
      z-index: 999;
    }
    .nav-links.open {
      transform: translateY(0);
    }
    .nav-links li {
      width: 100%;
      border-bottom: 1px solid var(--border);
    }
    .nav-links a {
      display: block;
      padding: 14px 0;
      font-size: .95rem;
    }
    .nav-links a::after { display: none; }
    .nav-cta {
      margin-top: 16px;
      text-align: center;
      display: block;
      padding: 14px 24px;
    }
  }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    padding: 140px 0 100px;
    position: relative;
    overflow: hidden;
    background: linear-gradient(170deg, var(--marine) 0%, ${darkenHex(c.colors.primary, 0.15)} 55%, ${darkenHex(c.colors.primary, 0.3)} 100%);
    min-height: 85vh;
    display: flex;
    align-items: center;
  }
  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }
  .hero::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 180px;
    background: linear-gradient(to top, var(--bone), transparent);
    pointer-events: none;
  }
  .hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
    position: relative;
    z-index: 2;
  }
  .hero-content { position: relative; }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${hexToRgba('#ffffff', 0.08)};
    border: 1px solid ${hexToRgba('#ffffff', 0.12)};
    border-radius: 50px;
    padding: 6px 16px 6px 10px;
    font-family: var(--font-mono);
    font-size: .72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${hexToRgba('#ffffff', 0.7)};
    margin-bottom: 28px;
    backdrop-filter: blur(8px);
  }
  .hero-tag-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--bordeaux-light);
    display: inline-block;
  }
  .hero h1 {
    font-family: var(--font-display);
    font-size: clamp(2.2rem, 5vw, 3.4rem);
    font-weight: 800;
    line-height: 1.1;
    color: #fff;
    letter-spacing: -0.03em;
    margin-bottom: 8px;
  }
  .hero-accent {
    color: var(--bordeaux-light);
    display: block;
    font-style: italic;
  }
  .hero-lead {
    font-size: clamp(1rem, 2vw, 1.15rem);
    color: ${hexToRgba('#ffffff', 0.65)};
    line-height: 1.7;
    margin-top: 20px;
    max-width: 520px;
  }
  ${c.announceText ? `.hero-announce {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${hexToRgba(c.colors.accent, 0.15)};
    border: 1px solid ${hexToRgba(c.colors.accent, 0.25)};
    border-radius: 6px;
    padding: 8px 16px;
    font-size: .82rem;
    color: var(--bordeaux-light);
    margin-top: 20px;
    font-weight: 500;
  }` : ''}
  .hero-actions {
    display: flex;
    gap: 14px;
    margin-top: 36px;
    flex-wrap: wrap;
  }
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--bordeaux);
    color: #fff;
    padding: 14px 30px;
    border-radius: 8px;
    font-size: .92rem;
    font-weight: 600;
    border: none;
    transition: all var(--transition);
    box-shadow: 0 4px 16px ${hexToRgba(c.colors.accent, 0.3)};
  }
  .btn-primary:hover {
    background: var(--bordeaux-dark);
    transform: translateY(-2px);
    box-shadow: 0 6px 24px ${hexToRgba(c.colors.accent, 0.4)};
  }
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: #fff;
    padding: 14px 30px;
    border-radius: 8px;
    font-size: .92rem;
    font-weight: 500;
    border: 1px solid ${hexToRgba('#ffffff', 0.2)};
    transition: all var(--transition);
  }
  .btn-secondary:hover {
    background: ${hexToRgba('#ffffff', 0.08)};
    border-color: ${hexToRgba('#ffffff', 0.35)};
  }

  /* Hero visual side */
  .hero-visual {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hero-image-frame {
    width: 100%;
    aspect-ratio: 4/5;
    border-radius: var(--radius-lg);
    overflow: hidden;
    position: relative;
    box-shadow: 0 20px 60px ${hexToRgba('#000', 0.3)};
  }
  .hero-image-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hero-image-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, ${hexToRgba(c.colors.accent, 0.15)}, ${hexToRgba(c.colors.primary, 0.4)});
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hero-image-placeholder svg {
    width: 80px;
    height: 80px;
    opacity: 0.4;
    color: #fff;
  }
  .hero-badge {
    position: absolute;
    bottom: -20px;
    right: -20px;
    background: var(--bone);
    border-radius: var(--radius);
    padding: 16px 24px;
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 3;
  }
  .hero-badge-icon {
    width: 44px;
    height: 44px;
    background: var(--bordeaux-soft);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--bordeaux);
  }
  .hero-badge-text {
    font-family: var(--font-mono);
    font-size: .72rem;
    color: var(--text-soft);
    letter-spacing: 0.04em;
  }
  .hero-badge-value {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--marine);
  }

  @media (max-width: 900px) {
    .hero { padding: 120px 0 80px; min-height: auto; }
    .hero-grid { grid-template-columns: 1fr; gap: 40px; }
    .hero-visual { order: -1; max-width: 400px; margin: 0 auto; }
    .hero-badge { bottom: -12px; right: 0; }
    .hero-actions { justify-content: center; }
  }

  /* ========================================
     PRACTICE AREAS GRID
     ======================================== */
  .practice-section { background: var(--bone); }
  .practice-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 48px;
  }
  .practice-card {
    background: #fff;
    border-radius: var(--radius-lg);
    padding: 32px 28px;
    border: 1px solid var(--border);
    transition: all var(--transition);
    position: relative;
    overflow: hidden;
  }
  .practice-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--bordeaux);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform var(--transition);
  }
  .practice-card:hover::before {
    transform: scaleX(1);
  }
  .practice-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-4px);
  }
  .practice-icon {
    width: 52px;
    height: 52px;
    color: var(--marine);
    margin-bottom: 18px;
  }
  .practice-card h3 {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--marine);
    margin-bottom: 10px;
    letter-spacing: -0.01em;
  }
  .practice-card p {
    font-size: .9rem;
    color: var(--text-soft);
    line-height: 1.6;
    margin-bottom: 14px;
  }
  .practice-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .practice-tag {
    font-family: var(--font-mono);
    font-size: .68rem;
    background: var(--marine-soft);
    color: var(--marine);
    padding: 3px 10px;
    border-radius: 50px;
    letter-spacing: 0.02em;
  }

  @media (max-width: 900px) {
    .practice-grid { grid-template-columns: 1fr; }
  }
  @media (min-width: 601px) and (max-width: 900px) {
    .practice-grid { grid-template-columns: repeat(2, 1fr); }
  }

  /* ========================================
     HONORAR / TRANSPARENCY
     ======================================== */
  .honorar-section {
    background: var(--bone-tint);
    position: relative;
  }
  .honorar-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: var(--bordeaux);
    border-radius: 2px;
  }
  .honorar-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    margin-top: 48px;
  }
  .honorar-card {
    background: #fff;
    border-radius: var(--radius);
    padding: 28px;
    border: 1px solid var(--border);
    display: flex;
    gap: 18px;
    transition: all var(--transition);
  }
  .honorar-card:hover {
    box-shadow: var(--shadow-sm);
    border-color: var(--bordeaux-soft);
  }
  .honorar-icon {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
  }
  .honorar-card h4 {
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--marine);
    margin-bottom: 6px;
  }
  .honorar-card p {
    font-size: .88rem;
    color: var(--text-soft);
    line-height: 1.6;
  }
  .honorar-footnote {
    margin-top: 24px;
    font-size: .82rem;
    color: var(--text-soft);
    font-style: italic;
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid var(--border);
  }

  @media (max-width: 700px) {
    .honorar-grid { grid-template-columns: 1fr; }
  }

  /* ========================================
     TEAM
     ======================================== */
  .team-section { background: var(--bone); }
  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: 28px;
    margin-top: 48px;
  }
  .team-card {
    background: #fff;
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    transition: all var(--transition);
  }
  .team-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-3px);
  }
  .team-photo {
    height: 240px;
    overflow: hidden;
    position: relative;
    background: linear-gradient(135deg, var(--marine) 0%, ${darkenHex(c.colors.primary, 0.2)} 100%);
  }
  .team-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  .team-card:hover .team-photo img {
    transform: scale(1.04);
  }
  .team-initials {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: 3rem;
    font-weight: 700;
    color: ${hexToRgba('#ffffff', 0.25)};
  }
  .team-info {
    padding: 24px 28px 28px;
  }
  .team-info h3 {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--marine);
    margin-bottom: 4px;
    letter-spacing: -0.01em;
  }
  .team-title {
    font-size: .82rem;
    color: var(--bordeaux);
    font-weight: 600;
    margin-bottom: 6px;
  }
  .team-specialty {
    font-size: .85rem;
    color: var(--text-soft);
    margin-bottom: 12px;
  }
  .team-admissions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 14px;
  }
  .admission-badge {
    font-family: var(--font-mono);
    font-size: .68rem;
    background: var(--marine-soft);
    color: var(--marine);
    padding: 3px 10px;
    border-radius: 50px;
    letter-spacing: 0.02em;
  }
  .team-quote {
    font-family: var(--font-display);
    font-size: .92rem;
    color: var(--text-soft);
    font-style: italic;
    line-height: 1.5;
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }

  @media (max-width: 700px) {
    .team-grid { grid-template-columns: 1fr; }
    .team-card { max-width: 400px; margin: 0 auto; }
  }

  /* ========================================
     MANDATE STATS
     ======================================== */
  .stats-section {
    background: var(--marine);
    position: relative;
    overflow: hidden;
  }
  .stats-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M0 0h20v20H0zM20 20h20v20H20z'/%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 40px;
    position: relative;
    z-index: 2;
    text-align: center;
  }
  .stat-item {
    padding: 20px;
  }
  .stat-value {
    font-family: var(--font-display);
    font-size: clamp(2.4rem, 5vw, 3.2rem);
    font-weight: 800;
    color: #fff;
    line-height: 1;
    margin-bottom: 8px;
    letter-spacing: -0.03em;
  }
  .stat-suffix {
    font-size: 0.5em;
    opacity: 0.7;
    font-weight: 400;
  }
  .stat-label {
    font-family: var(--font-mono);
    font-size: .75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${hexToRgba('#ffffff', 0.55)};
  }

  /* ========================================
     REACHABILITY
     ======================================== */
  .reach-section {
    background: var(--bone-tint);
  }
  .reach-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-top: 48px;
  }
  .reach-item {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    background: #fff;
    border-radius: var(--radius);
    padding: 22px 24px;
    border: 1px solid var(--border);
    transition: all var(--transition);
  }
  .reach-item:hover {
    box-shadow: var(--shadow-sm);
    border-color: var(--bordeaux-soft);
  }
  .reach-icon {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    color: var(--bordeaux);
  }
  .reach-label {
    font-weight: 600;
    color: var(--marine);
    font-size: .92rem;
    margin-bottom: 2px;
  }
  .reach-detail {
    font-size: .87rem;
    color: var(--text-soft);
  }

  @media (max-width: 700px) {
    .reach-grid { grid-template-columns: 1fr; }
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews-section { background: var(--bone); }
  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
    margin-top: 48px;
  }
  .review-card {
    background: #fff;
    border-radius: var(--radius-lg);
    padding: 28px;
    border: 1px solid var(--border);
    transition: all var(--transition);
  }
  .review-card:hover {
    box-shadow: var(--shadow-sm);
  }
  .review-stars {
    display: flex;
    gap: 2px;
    color: var(--bordeaux);
    margin-bottom: 14px;
  }
  .review-text {
    font-size: .95rem;
    color: var(--text);
    line-height: 1.7;
    margin-bottom: 18px;
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
    background: var(--marine);
    color: var(--bone);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: .72rem;
    font-weight: 700;
  }
  .review-name {
    font-weight: 600;
    font-size: .88rem;
    color: var(--marine);
  }
  .review-context {
    font-size: .78rem;
    color: var(--text-soft);
  }

  @media (max-width: 700px) {
    .reviews-grid { grid-template-columns: 1fr; }
  }

  /* ========================================
     STANDORT / LOCATION
     ======================================== */
  .location-section {
    background: var(--bone-warm);
  }
  .location-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-top: 48px;
    align-items: start;
  }
  .location-info {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .location-address {
    background: #fff;
    border-radius: var(--radius);
    padding: 24px;
    border: 1px solid var(--border);
  }
  .location-address h4 {
    font-family: var(--font-display);
    font-size: 1.05rem;
    color: var(--marine);
    margin-bottom: 10px;
  }
  .location-address p {
    font-size: .9rem;
    color: var(--text-soft);
    line-height: 1.7;
  }
  .hours-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: .88rem;
    border-bottom: 1px solid var(--border);
  }
  .hours-row:last-child { border-bottom: none; }
  .hours-day { color: var(--text); font-weight: 500; }
  .hours-time { color: var(--text-soft); font-family: var(--font-mono); font-size: .82rem; }
  .location-map {
    border-radius: var(--radius-lg);
    overflow: hidden;
    height: 380px;
    border: 1px solid var(--border);
    background: var(--marine-soft);
  }
  .location-map iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }

  @media (max-width: 700px) {
    .location-grid { grid-template-columns: 1fr; }
  }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section { background: var(--bone); }
  .faq-list {
    max-width: 800px;
    margin: 48px auto 0;
  }
  .faq-item {
    border-bottom: 1px solid var(--border);
  }
  .faq-q {
    width: 100%;
    background: none;
    border: none;
    padding: 20px 0;
    text-align: left;
    font-size: 1rem;
    font-weight: 600;
    color: var(--marine);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: color var(--transition);
    font-family: var(--font-body);
  }
  .faq-q:hover { color: var(--bordeaux); }
  .faq-icon {
    font-size: 1.3rem;
    font-weight: 300;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--marine-soft);
    color: var(--marine);
    transition: all var(--transition);
  }
  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease, padding 0.4s ease;
    font-size: .92rem;
    color: var(--text-soft);
    line-height: 1.7;
  }
  .faq-item.open .faq-a {
    max-height: 500px;
    padding-bottom: 20px;
  }
  .faq-item.open .faq-icon {
    background: var(--bordeaux);
    color: #fff;
    transform: rotate(45deg);
  }

  /* ========================================
     CONTACT FORM
     ======================================== */
  .contact-section {
    background: var(--marine);
    position: relative;
    overflow: hidden;
  }
  .contact-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }
  .contact-inner {
    position: relative;
    z-index: 2;
    max-width: 720px;
    margin: 0 auto;
  }
  .contact-section .section-eyebrow {
    color: var(--bordeaux-light);
  }
  .contact-section .section-eyebrow::before {
    background: var(--bordeaux-light);
  }
  .contact-section .section-title {
    color: #fff;
  }
  .contact-section .section-subtitle {
    color: ${hexToRgba('#ffffff', 0.6)};
  }
  .contact-disclaimer {
    font-size: .78rem;
    color: ${hexToRgba('#ffffff', 0.4)};
    margin-top: 8px;
    font-style: italic;
  }
  .contact-form {
    margin-top: 36px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }
  .form-group label {
    display: block;
    font-size: .82rem;
    font-weight: 500;
    color: ${hexToRgba('#ffffff', 0.7)};
    margin-bottom: 6px;
  }
  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid ${hexToRgba('#ffffff', 0.12)};
    background: ${hexToRgba('#ffffff', 0.06)};
    color: #fff;
    font-size: .9rem;
    font-family: var(--font-body);
    transition: all var(--transition);
  }
  .form-group input::placeholder,
  .form-group textarea::placeholder {
    color: ${hexToRgba('#ffffff', 0.3)};
  }
  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--bordeaux);
    background: ${hexToRgba('#ffffff', 0.1)};
    box-shadow: 0 0 0 3px ${hexToRgba(c.colors.accent, 0.2)};
  }
  .form-group select option {
    background: var(--marine);
    color: #fff;
  }
  .form-group.full {
    grid-column: 1 / -1;
  }
  .form-submit {
    grid-column: 1 / -1;
    margin-top: 8px;
  }
  .form-submit button {
    width: 100%;
    padding: 16px;
    background: var(--bordeaux);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition);
    font-family: var(--font-body);
  }
  .form-submit button:hover {
    background: var(--bordeaux-dark);
    transform: translateY(-1px);
  }
  .form-legal {
    grid-column: 1 / -1;
    font-size: .75rem;
    color: ${hexToRgba('#ffffff', 0.35)};
    line-height: 1.5;
    text-align: center;
  }

  @media (max-width: 600px) {
    .contact-form { grid-template-columns: 1fr; }
  }

  /* ========================================
     CTA SECTION
     ======================================== */
  .cta-section {
    background: linear-gradient(135deg, var(--bordeaux) 0%, var(--bordeaux-dark) 100%);
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .cta-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M0 0h20v20H0zM20 20h20v20H20z'/%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }
  .cta-inner {
    position: relative;
    z-index: 2;
    max-width: 680px;
    margin: 0 auto;
  }
  .cta-section .section-title {
    color: #fff;
  }
  .cta-section .section-subtitle {
    color: ${hexToRgba('#ffffff', 0.7)};
    margin: 0 auto 32px;
  }
  .cta-features {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px 28px;
    margin-bottom: 36px;
  }
  .cta-feature {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: .88rem;
    color: ${hexToRgba('#ffffff', 0.85)};
  }
  .cta-feature svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
  .cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    color: var(--bordeaux);
    padding: 16px 36px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 700;
    border: none;
    transition: all var(--transition);
    box-shadow: 0 4px 20px ${hexToRgba('#000', 0.15)};
  }
  .cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px ${hexToRgba('#000', 0.2)};
  }

  /* ========================================
     FOOTER
     ======================================== */
  .footer {
    background: var(--marine);
    color: ${hexToRgba('#ffffff', 0.6)};
    padding: 64px 0 0;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr repeat(3, 1fr);
    gap: 40px;
    padding-bottom: 48px;
    border-bottom: 1px solid ${hexToRgba('#ffffff', 0.08)};
  }
  .footer-brand {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .footer-brand .nav-logo {
    color: #fff;
  }
  .footer-brand .nav-logo-mark {
    background: var(--bordeaux);
  }
  .footer-brand p {
    font-size: .88rem;
    line-height: 1.7;
    color: ${hexToRgba('#ffffff', 0.5)};
    max-width: 300px;
  }
  .footer-col h4 {
    font-family: var(--font-display);
    font-size: .92rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 16px;
  }
  .footer-col a {
    display: block;
    font-size: .85rem;
    color: ${hexToRgba('#ffffff', 0.5)};
    padding: 4px 0;
    transition: color var(--transition);
  }
  .footer-col a:hover {
    color: var(--bordeaux-light);
  }
  .footer-bottom {
    padding: 24px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: .78rem;
  }
  .footer-bottom a {
    color: ${hexToRgba('#ffffff', 0.4)};
    transition: color var(--transition);
  }
  .footer-bottom a:hover { color: var(--bordeaux-light); }

  @media (max-width: 900px) {
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .footer-brand { grid-column: 1 / -1; }
  }
  @media (max-width: 600px) {
    .footer-grid { grid-template-columns: 1fr; }
    .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
  }

  /* ========================================
     MOBILE STICKY CTA
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 998;
    background: ${hexToRgba(c.colors.primary, 0.97)};
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 12px 20px;
    border-top: 1px solid ${hexToRgba('#ffffff', 0.1)};
  }
  .mobile-cta a {
    display: block;
    background: var(--bordeaux);
    color: #fff;
    text-align: center;
    padding: 14px;
    border-radius: 8px;
    font-weight: 600;
    font-size: .92rem;
    transition: background var(--transition);
  }
  .mobile-cta a:hover {
    background: var(--bordeaux-dark);
  }

  @media (max-width: 900px) {
    .mobile-cta { display: block; }
    body { padding-bottom: 72px; }
  }

  /* ========================================
     PRINT STYLES
     ======================================== */
  @media print {
    .nav, .mobile-cta, .cta-section, #cookie-banner { display: none !important; }
    body { font-size: 11pt; }
    section { padding: 24px 0; }
    .hero { min-height: auto; padding: 48px 0; }
  }
</style>
</head>
<body>

<!-- ============ NAV ============ -->
<nav class="nav" id="main-nav">
  <div class="nav-inner">
    <a href="#" class="nav-logo">
      <div class="nav-logo-mark">${logoInitial}</div>
      ${esc(c.businessName)}
    </a>
    <button class="nav-toggle" id="nav-toggle" aria-label="Men&uuml; &ouml;ffnen">
      <span></span><span></span><span></span>
    </button>
    <ul class="nav-links" id="nav-links">
      ${navLinks.map(l => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('\n      ')}
      <li><a href="#contact" class="nav-cta">${esc(c.ctaText)}</a></li>
    </ul>
  </div>
</nav>

<!-- ============ HERO ============ -->
<section class="hero" id="hero">
  <div class="container">
    <div class="hero-grid">
      <div class="hero-content">
        <div class="hero-tag"><span class="hero-tag-dot"></span>${esc(c.heroTag)}</div>
        <h1>${esc(c.heroHeadline)}<span class="hero-accent">${esc(c.heroAccent)}</span></h1>
        <p class="hero-lead">${esc(c.heroLead)}</p>
        ${c.announceText ? `<div class="hero-announce"><svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="8"/><path d="M10 6v4M10 14h.01"/></svg>${esc(c.announceText)}</div>` : ''}
        <div class="hero-actions">
          <a href="#contact" class="btn-primary">
            ${esc(c.ctaText)}
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10h12M12 4l6 6-6 6"/></svg>
          </a>
          <a href="#practice-areas" class="btn-secondary">
            Fachgebiete
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 4v12M4 10l6 6 6-6"/></svg>
          </a>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-image-frame">
          ${c.heroImageUrl ? `<img src="${esc(c.heroImageUrl)}" alt="${esc(c.businessName)}" loading="eager">` : `<div class="hero-image-placeholder"><svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 60V20l20-12 20 12v40L40 72 20 60z"/><path d="M40 36v12"/><circle cx="40" cy="28" r="3"/><path d="M28 48h24" opacity="0.5"/></svg></div>`}
        </div>
        ${c.mandateStats.length > 0 ? `<div class="hero-badge">
          <div class="hero-badge-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L6 7v5c0 5.5 2.6 10.7 6 13 3.4-2.3 6-7.5 6-13V7l-6-5z"/><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <div>
            <div class="hero-badge-value">${esc(c.mandateStats[0].value)}${c.mandateStats[0].suffix ? esc(c.mandateStats[0].suffix) : ''}</div>
            <div class="hero-badge-text">${esc(c.mandateStats[0].label)}</div>
          </div>
        </div>` : ''}
      </div>
    </div>
  </div>
</section>

<!-- ============ PRACTICE AREAS ============ -->
<section class="practice-section" id="practice-areas">
  <div class="container">
    <div class="section-eyebrow">Fachgebiete</div>
    <h2 class="section-title">Unsere Kompetenzfelder</h2>
    <p class="section-subtitle">Wirtschaftsrechtliche Beratung auf h&ouml;chstem Niveau &mdash; von der Erstberatung &uuml;ber Schrifts&auml;tze und Vergleichsverhandlungen bis zur Klage und Berufung.</p>
    <div class="practice-grid">
      ${practiceAreasHtml}
    </div>
  </div>
</section>

<!-- ============ HONORAR / TRANSPARENZ ============ -->
<section class="honorar-section" id="honorar">
  <div class="container">
    <div class="section-eyebrow">Honorar</div>
    <h2 class="section-title">${honorar.title || 'Honorar &amp; Transparenz'}</h2>
    <p class="section-subtitle">${esc(honorar.subtitle || 'Klare Konditionen von Anfang an \u2014 gem\u00e4\u00df RVG oder individueller Vereinbarung.')}</p>
    <div class="honorar-grid">
      ${honorarItemsHtml}
    </div>
    ${honorar.footnote ? `<p class="honorar-footnote">${esc(honorar.footnote)}</p>` : ''}
  </div>
</section>

<!-- ============ TEAM ============ -->
<section class="team-section" id="team">
  <div class="container">
    <div class="section-eyebrow">Team</div>
    <h2 class="section-title">Ihre Anw&auml;lte</h2>
    <p class="section-subtitle">Erfahrene Fachanw&auml;lte, Wirtschaftsjuristen und Rechtsanw&auml;lte mit Zulassung an allen deutschen Gerichten.</p>
    <div class="team-grid">
      ${teamHtml}
    </div>
  </div>
</section>

<!-- ============ MANDATE STATS ============ -->
<section class="stats-section" id="mandate-stats">
  <div class="container">
    <div class="stats-grid">
      ${mandateStatsHtml}
    </div>
  </div>
</section>

<!-- ============ REACHABILITY ============ -->
<section class="reach-section" id="reachability">
  <div class="container">
    <div class="section-eyebrow">Erreichbarkeit</div>
    <h2 class="section-title">${esc(reachability.title || 'Immer erreichbar')}</h2>
    <p class="section-subtitle">${esc(reachability.subtitle || 'Diskrete und zuverl\u00e4ssige Mandatsbetreuung \u2014 pers\u00f6nlich, telefonisch und digital.')}</p>
    <div class="reach-grid">
      ${reachabilityHtml}
    </div>
  </div>
</section>

<!-- ============ REVIEWS ============ -->
<section class="reviews-section" id="reviews">
  <div class="container">
    <div class="section-eyebrow">Mandantenstimmen</div>
    <h2 class="section-title">Was unsere Mandanten sagen</h2>
    <p class="section-subtitle">Vertrauliche und erfolgreiche Mandatsf&uuml;hrung &mdash; von der Erstberatung bis zum Vergleich oder Urteil.</p>
    <div class="reviews-grid">
      ${reviewsHtml}
    </div>
  </div>
</section>

<!-- ============ STANDORT ============ -->
<section class="location-section" id="location">
  <div class="container">
    <div class="section-eyebrow">Standort</div>
    <h2 class="section-title">${esc(c.serviceArea?.title || 'Kanzleistandort Frankfurt')}</h2>
    <p class="section-subtitle">${esc(c.serviceArea?.subtitle || c.serviceArea?.description || 'Zentral gelegen im Herzen des Finanzstandorts.')}</p>
    <div class="location-grid">
      <div class="location-info">
        ${c.address || c.city ? `<div class="location-address">
          <h4>Anschrift</h4>
          <p>${c.address ? esc(c.address) : ''}${c.postalCode || c.city ? `<br>${esc(c.postalCode || '')} ${esc(c.city || '')}` : ''}</p>
          ${c.phone ? `<p style="margin-top:10px"><strong>Tel:</strong> <a href="tel:${esc(c.phone)}" style="color:var(--bordeaux)">${esc(c.phone)}</a></p>` : ''}
          ${c.email ? `<p><strong>E-Mail:</strong> <a href="mailto:${esc(c.email)}" style="color:var(--bordeaux)">${esc(c.email)}</a></p>` : ''}
        </div>` : ''}
        <div class="location-address">
          <h4>Sprechzeiten</h4>
          ${hoursHtml}
        </div>
      </div>
      <div class="location-map">
        ${c.serviceArea?.mapEmbedUrl ? `<iframe src="${esc(c.serviceArea.mapEmbedUrl)}" title="Kanzleistandort" loading="lazy" allowfullscreen></iframe>` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:var(--marine)">
          <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2"><path d="M24 4C17 4 12 9 12 16c0 10 12 28 12 28s12-18 12-28c0-7-5-12-12-12z"/><circle cx="24" cy="16" r="5"/></svg>
          <span style="font-size:.85rem;color:var(--text-soft)">Karte wird geladen...</span>
        </div>`}
      </div>
    </div>
  </div>
</section>

<!-- ============ FAQ ============ -->
${(c.faqItems || []).length > 0 ? `<section class="faq-section" id="faq">
  <div class="container">
    <div class="section-eyebrow">H&auml;ufige Fragen</div>
    <h2 class="section-title">FAQ</h2>
    <p class="section-subtitle">Antworten auf die wichtigsten Fragen rund um Mandate, Erstberatung, Honorar und Widerspruchsverfahren.</p>
    <div class="faq-list">
      ${faqHtml}
    </div>
  </div>
</section>` : ''}

<!-- ============ CONTACT ============ -->
<section class="contact-section" id="contact">
  <div class="container">
    <div class="contact-inner">
      <div class="section-eyebrow">Kontakt</div>
      <h2 class="section-title">${esc(c.contactFormTitle || 'Erstgespr\u00e4ch vereinbaren')}</h2>
      <p class="section-subtitle">${esc(c.contactFormSubtitle || 'Schildern Sie uns Ihr Anliegen \u2014 wir melden uns diskret und zeitnah.')}</p>
      <p class="contact-disclaimer">Alle Angaben werden streng vertraulich behandelt. Es gilt die anwaltliche Schweigepflicht.</p>
      <form class="contact-form" id="contact-form" novalidate>
        ${contactFieldsHtml}
        <div class="form-submit">
          <button type="submit" id="contact-submit">${esc(c.ctaText || 'Erstgespr\u00e4ch vereinbaren')}</button>
        </div>
        <div class="form-legal">
          Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Daten gem&auml;&szlig; unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--bordeaux-light);text-decoration:underline">Datenschutzerkl&auml;rung</a> zu. Anwaltliche Verschwiegenheit ist gew&auml;hrleistet.
        </div>
      </form>
    </div>
  </div>
</section>

<!-- ============ CTA ============ -->
<section class="cta-section">
  <div class="container">
    <div class="cta-inner">
      <h2 class="section-title">${esc(c.ctaSectionTitle || 'Ihr Recht. Unsere Kompetenz.')}</h2>
      <p class="section-subtitle">${esc(c.ctaSectionSubtitle || 'Lassen Sie uns gemeinsam die beste Strategie f\u00fcr Ihre Rechtslage entwickeln \u2014 diskret, kompetent und zielgerichtet.')}</p>
      <div class="cta-features">
        ${ctaFeaturesHtml}
      </div>
      <a href="#contact" class="cta-btn">
        ${esc(c.ctaText || 'Erstgespr\u00e4ch vereinbaren')}
        <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10h12M12 4l6 6-6 6"/></svg>
      </a>
    </div>
  </div>
</section>

<!-- ============ FOOTER ============ -->
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#" class="nav-logo">
          <div class="nav-logo-mark">${logoInitial}</div>
          ${esc(c.businessName)}
        </a>
        <p>${esc(c.footerText || c.tagline)}</p>
        ${c.phone ? `<p style="font-size:.85rem"><a href="tel:${esc(c.phone)}" style="color:var(--bordeaux-light)">${esc(c.phone)}</a></p>` : ''}
        ${c.email ? `<p style="font-size:.85rem"><a href="mailto:${esc(c.email)}" style="color:var(--bordeaux-light)">${esc(c.email)}</a></p>` : ''}
      </div>
      ${footerColumnsHtml}
    </div>
    <div class="footer-bottom">
      <span>&copy; ${new Date().getFullYear()} ${esc(c.businessName)}. Alle Rechte vorbehalten.</span>
      <span>
        <a href="${esc(c.imprintUrl || '#')}">Impressum</a> &middot;
        <a href="${esc(c.privacyUrl || '#')}">Datenschutz</a>
      </span>
    </div>
  </div>
</footer>

<!-- ============ MOBILE CTA ============ -->
<div class="mobile-cta">
  <a href="${esc(mobileCta.href)}">${esc(mobileCta.text)}</a>
</div>

<!-- ============ SCRIPTS ============ -->
<script>
  /* Nav scroll effect */
  (function() {
    var nav = document.getElementById('main-nav');
    var lastScroll = 0;
    window.addEventListener('scroll', function() {
      var st = window.scrollY;
      if (st > 40) { nav.classList.add('scrolled'); }
      else { nav.classList.remove('scrolled'); }
      lastScroll = st;
    }, { passive: true });
  })();

  /* Mobile menu */
  (function() {
    var toggle = document.getElementById('nav-toggle');
    var links = document.getElementById('nav-links');
    toggle.addEventListener('click', function() {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        toggle.classList.remove('active');
        links.classList.remove('open');
      });
    });
  })();

  /* FAQ accordion */
  (function() {
    document.querySelectorAll('.faq-q').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var item = btn.parentElement;
        var wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(function(fi) { fi.classList.remove('open'); });
        if (!wasOpen) item.classList.add('open');
        btn.setAttribute('aria-expanded', !wasOpen);
      });
    });
  })();

  /* Smooth scroll for anchor links */
  (function() {
    document.querySelectorAll('a[href^="#"]').forEach(function(a) {
      a.addEventListener('click', function(e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          var offset = 80;
          var y = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    });
  })();

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
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:#fff;font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:${hexToRgba('#fff', 0.7)};font-size:1.05rem">Wir pr\\u00fcfen Ihr Anliegen und melden uns innerhalb von 24 Stunden.</p></div>';
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
    <p style="flex:1;min-width:200px;margin:0;color:${hexToRgba('#fff', 0.8)}">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--bordeaux-light);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--bordeaux);color:#fff;border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
