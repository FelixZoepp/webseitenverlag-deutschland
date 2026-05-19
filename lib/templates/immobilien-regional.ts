export interface ImmobilienRegionalConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Tannengr\u00fcn #2a4a30
    accent: string     // Sand #d4c4a0
    background: string // Cream #faf8f2
    text: string       // Dark text
  }
  phone?: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  openingHours: { days: string; hours: string }[]
  listings: {
    title: string
    type: string
    location: string
    price: string
    size?: string
    rooms?: string
    features?: string[]
    imageUrl?: string
    tag?: string
    href?: string
  }[]
  services: {
    name: string
    description: string
    icon?: string
    features?: string[]
  }[]
  districts: {
    name: string
    description: string
    highlights?: string[]
    imageUrl?: string
  }[]
  familyTitle?: string
  familyText?: string
  familyText2?: string
  familyMembers?: {
    name: string
    role: string
    description?: string
    imageUrl?: string
  }[]
  familyStats?: { value: string; label: string }[]
  reviews: { text: string; name: string; context: string; rating: number }[]
  heroImageUrl?: string
  contactEnabled?: boolean
  contactFormTitle?: string
  contactFormSubtitle?: string
  faqItems?: { question: string; answer: string }[]
  imprintUrl?: string
  privacyUrl?: string
  footerText?: string
  footerColumns?: { title: string; links: { label: string; href: string }[] }[]
  ctaSectionTitle?: string
  ctaSectionSubtitle?: string
  ctaFeatures?: string[]
  mobileCta?: { text: string; href: string }
  ogImageUrl?: string
  listingsTitle?: string
  listingsSubtitle?: string
  servicesTitle?: string
  servicesSubtitle?: string
  districtsTitle?: string
  districtsSubtitle?: string
  reviewsTitle?: string
  locationTitle?: string
  locationSubtitle?: string
  mapEmbedUrl?: string
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

export function renderImmobilienRegionalTemplate(config: ImmobilienRegionalConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primaryDark = darkenHex(c.colors.primary, 0.25)
  const primaryLight = tintHex(c.colors.primary, 0.85)
  const primarySoft = hexToRgba(c.colors.primary, 0.08)
  const accentDark = darkenHex(c.colors.accent, 0.25)
  const accentSoft = hexToRgba(c.colors.accent, 0.15)
  const bgTint = tintHex(c.colors.background, -0.03)
  const bgWarm = tintHex(c.colors.background, -0.06)
  const textSoft = tintHex(c.colors.text, 0.45)
  const borderColor = tintHex(c.colors.background, -0.12)

  const logoInitial = esc(c.businessName.charAt(0))

  // Service icons mapping
  const serviceIconMap: Record<string, string> = {
    kauf: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 42V18L24 6l18 12v24"/><rect x="18" y="28" width="12" height="14"/><path d="M18 35h12"/><path d="M14 22h4v4h-4zM30 22h4v4h-4z"/></svg>',
    verkauf: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 42V18L24 6l18 12v24"/><circle cx="24" cy="28" r="8"/><path d="M22 25v6M26 25v6M20 28h8"/><path d="M34 10l6 4" stroke-width="1.5"/></svg>',
    vermietung: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="14" width="32" height="28" rx="2"/><path d="M8 22h32M16 14V8M32 14V8"/><circle cx="24" cy="32" r="5"/><path d="M24 29v6"/></svg>',
    erbimmobilien: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 40V20L24 8l14 12v20"/><path d="M18 40V28h12v12"/><path d="M24 18v-2M20 20h8" stroke-width="1.5"/><circle cx="38" cy="12" r="6" fill="none" stroke-width="1.5"/><path d="M36 12h4M38 10v4" stroke-width="1.5"/></svg>',
    bewertung: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="36" height="36" rx="3"/><path d="M14 18h20M14 26h16M14 34h12"/><path d="M36 14l-4 4-2-2" stroke-width="2.5"/></svg>',
    beratung: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="24" cy="16" r="8"/><path d="M10 40c0-8 6-14 14-14s14 6 14 14"/><path d="M30 14l4-4M32 16h4v-4"/></svg>',
  }

  // Listings HTML
  const listingsHtml = c.listings.map((l, idx) => {
    const gradients = [
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 100%)`,
      `linear-gradient(135deg, ${c.colors.accent} 0%, ${accentDark} 100%)`,
      `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.3)} 0%, ${c.colors.primary} 100%)`,
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${c.colors.accent} 100%)`,
    ]
    const bg = l.imageUrl
      ? `background-image:url('${esc(l.imageUrl)}');background-size:cover;background-position:center`
      : `background:${gradients[idx % gradients.length]}`
    return `
          <div class="listing-card">
            <div class="listing-image" style="${bg}">
              ${!l.imageUrl ? `<div class="listing-placeholder"><svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 60V30L40 15l25 15v30"/><rect x="30" y="42" width="20" height="18"/><path d="M30 52h20"/><path d="M22 35h6v5h-6zM52 35h6v5h-6z"/></svg></div>` : ''}
              ${l.tag ? `<span class="listing-tag">${esc(l.tag)}</span>` : ''}
            </div>
            <div class="listing-body">
              <div class="listing-type">${esc(l.type)}</div>
              <h3>${esc(l.title)}</h3>
              <div class="listing-location">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M10 2a6 6 0 0 0-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 0 0-6-6z"/><circle cx="10" cy="8" r="2"/></svg>
                ${esc(l.location)}
              </div>
              <div class="listing-details">
                ${l.size ? `<span class="listing-detail"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><rect x="3" y="3" width="14" height="14"/><path d="M7 3v14M3 10h14"/></svg> ${esc(l.size)}</span>` : ''}
                ${l.rooms ? `<span class="listing-detail"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><rect x="2" y="8" width="16" height="10" rx="1"/><path d="M6 8V6a4 4 0 0 1 8 0v2"/></svg> ${esc(l.rooms)}</span>` : ''}
              </div>
              ${(l.features || []).length > 0 ? `<div class="listing-features">${(l.features || []).map(f => `<span class="listing-feature">${esc(f)}</span>`).join('')}</div>` : ''}
              <div class="listing-footer">
                <div class="listing-price">${esc(l.price)}</div>
                <a href="${esc(l.href || '#contact')}" class="listing-cta">Details anfragen
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M5 10h10M11 6l4 4-4 4"/></svg>
                </a>
              </div>
            </div>
          </div>`
  }).join('\n')

  // Services HTML
  const servicesHtml = c.services.map(s => {
    const iconKey = (s.icon || s.name).toLowerCase()
      .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
      .replace(/[^a-z]/g, '')
    const svgIcon = serviceIconMap[iconKey] || serviceIconMap['beratung']
    return `
          <div class="service-card">
            <div class="service-icon">${svgIcon}</div>
            <h3>${esc(s.name)}</h3>
            <p>${esc(s.description)}</p>
            ${(s.features || []).length > 0 ? `<ul class="service-features">${(s.features || []).map(f => `<li><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M4 10l4 4L16 6"/></svg>${esc(f)}</li>`).join('')}</ul>` : ''}
          </div>`
  }).join('\n')

  // Districts HTML
  const districtsHtml = c.districts.map((d, idx) => {
    const gradients = [
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 100%)`,
      `linear-gradient(135deg, ${c.colors.accent} 0%, ${accentDark} 100%)`,
      `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.3)} 0%, ${c.colors.primary} 100%)`,
      `linear-gradient(135deg, ${primaryDark} 0%, ${c.colors.accent} 100%)`,
    ]
    const bg = d.imageUrl
      ? `background-image:url('${esc(d.imageUrl)}');background-size:cover;background-position:center`
      : `background:${gradients[idx % gradients.length]}`
    return `
          <div class="district-card">
            <div class="district-image" style="${bg}">
              ${!d.imageUrl ? `<div class="district-placeholder"><svg viewBox="0 0 60 60" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"><path d="M10 50V25L30 10l20 15v25"/><rect x="22" y="35" width="16" height="15"/><path d="M15 30h6v5h-6zM39 30h6v5h-6z"/></svg></div>` : ''}
            </div>
            <div class="district-body">
              <h4>${esc(d.name)}</h4>
              <p>${esc(d.description)}</p>
              ${(d.highlights || []).length > 0 ? `<div class="district-highlights">${(d.highlights || []).map(h => `<span class="district-tag">${esc(h)}</span>`).join('')}</div>` : ''}
            </div>
          </div>`
  }).join('\n')

  // Family / \u00dcber uns HTML
  const familyMembers = c.familyMembers || []
  const familyMembersHtml = familyMembers.map((m, idx) => {
    const initials = m.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    const gradients = [
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 100%)`,
      `linear-gradient(135deg, ${c.colors.accent} 0%, ${accentDark} 100%)`,
      `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.3)} 0%, ${c.colors.primary} 100%)`,
    ]
    const bg = m.imageUrl
      ? `background-image:url('${esc(m.imageUrl)}');background-size:cover;background-position:center`
      : `background:${gradients[idx % gradients.length]}`
    return `
          <div class="family-member">
            <div class="member-portrait" style="${bg}">
              ${!m.imageUrl ? `<span class="member-initials">${esc(initials)}</span>` : ''}
            </div>
            <h4>${esc(m.name)}</h4>
            <span class="member-role">${esc(m.role)}</span>
            ${m.description ? `<p class="member-desc">${esc(m.description)}</p>` : ''}
          </div>`
  }).join('\n')

  const familyStats = c.familyStats || []
  const familyStatsHtml = familyStats.length > 0 ? `
        <div class="family-stats">
          ${familyStats.map(s => `
          <div class="family-stat">
            <div class="stat-value">${esc(s.value)}</div>
            <div class="stat-label">${esc(s.label)}</div>
          </div>`).join('')}
        </div>` : ''

  // Reviews HTML
  const reviewsHtml = c.reviews.map(r => {
    const initials = r.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    return `
          <div class="review-card">
            <div class="review-stars">
              ${generateStarsSvg(r.rating)}
            </div>
            <p class="review-text">&bdquo;${esc(r.text)}&ldquo;</p>
            <div class="review-author">
              <div class="review-avatar">${esc(initials)}</div>
              <div>
                <div class="review-name">${esc(r.name)}</div>
                <div class="review-meta">${esc(r.context)}</div>
              </div>
            </div>
          </div>`
  }).join('\n')

  // Opening hours HTML
  const hoursHtml = c.openingHours.map(h => `
        <div class="hours-item">
          <div class="h-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            ${esc(h.days)}
          </div>
          <div class="h-value">${esc(h.hours)}</div>
        </div>`).join('')

  // FAQ HTML
  const faqHtml = (c.faqItems || []).map(f => `
        <div class="faq-item">
          <button class="faq-q" aria-expanded="false">${esc(f.question)}<span class="faq-icon">+</span></button>
          <div class="faq-a" role="region">${esc(f.answer)}</div>
        </div>`).join('')

  // CTA features
  const ctaFeatures = c.ctaFeatures || []
  const ctaFeaturesHtml = ctaFeatures.map(f => `
          <div class="cta-feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 13l4 4L19 7"/></svg>
            ${esc(f)}
          </div>`).join('')

  // Footer columns
  const footerColumns = c.footerColumns || [
    { title: 'Immobilien', links: [
      { label: 'Aktuelle Objekte', href: '#objekte' },
      { label: 'Leistungen', href: '#leistungen' },
      { label: 'Stadtteile', href: '#stadtteile' },
    ]},
    { title: 'Kontakt', links: [
      { label: 'Beratung anfragen', href: '#contact' },
      { label: 'Standort', href: '#standort' },
      { label: 'FAQ', href: '#faq' },
    ]},
  ]
  const footerColumnsHtml = footerColumns.map(col => `
        <div class="footer-col">
          <h4>${esc(col.title)}</h4>
          <ul>
            ${col.links.map(l => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('\n            ')}
          </ul>
        </div>`).join('')

  // Mobile CTA
  const mobileCta = c.mobileCta || { text: c.ctaText || 'Beratung anfragen', href: '#contact' }

  // Nav links
  const navLinks = [
    { label: 'Objekte', href: '#objekte' },
    { label: 'Leistungen', href: '#leistungen' },
    { label: 'Stadtteile', href: '#stadtteile' },
    { label: '\u00dcber uns', href: '#familie' },
    { label: 'Bewertungen', href: '#bewertungen' },
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
${c.ogImageUrl ? `<meta property="og:image" content="${esc(c.ogImageUrl)}">` : ''}
<meta property="og:title" content="${esc(c.businessName)} | ${esc(c.tagline)}">
<meta property="og:description" content="${esc(c.tagline)}">
<meta property="og:type" content="website">
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
  ${c.address ? `"address": {
    "@type": "PostalAddress",
    "streetAddress": "${esc(c.address)}"${c.city ? `,
    "addressLocality": "${esc(c.city)}"` : ''}${c.postalCode ? `,
    "postalCode": "${esc(c.postalCode)}"` : '},'}
  "addressCountry": "DE"
  },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  "priceRange": "$$$$",
  "currenciesAccepted": "EUR",
  ${c.reviews.length > 0 ? `"aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "${(c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length).toFixed(1)}",
    "reviewCount": "${c.reviews.length}"
  },` : ''}
  "areaServed": {
    "@type": "City",
    "name": "${esc(c.city || 'M\u00fcnchen')}"
  },
  "openingHoursSpecification": [${c.openingHours.map(h => `{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": "${esc(h.days)}",
    "opens": "${esc(h.hours.split(' ')[0] || '')}",
    "closes": "${esc(h.hours.split(' ').pop() || '')}"
  }`).join(',')}],
  "makesOffer": [${c.services.slice(0, 6).map(s => `{
    "@type": "Offer",
    "itemOffered": {
      "@type": "Service",
      "name": "${esc(s.name)}",
      "description": "${esc(s.description)}"
    }
  }`).join(',')}],
  "url": "${appUrl}${siteId ? `/s/${siteId}` : ''}"
}
</script>

<style>
  /* ========================================
     DESIGN TOKENS
     ======================================== */
  :root {
    --tannengruen:      ${esc(c.colors.primary)};
    --tannengruen-dark: ${primaryDark};
    --tannengruen-soft: ${primarySoft};
    --tannengruen-light:${primaryLight};
    --sand:             ${esc(c.colors.accent)};
    --sand-dark:        ${accentDark};
    --sand-soft:        ${accentSoft};
    --cream:            ${esc(c.colors.background)};
    --cream-tint:       ${bgTint};
    --cream-warm:       ${bgWarm};
    --ink:              ${esc(c.colors.text)};
    --ink-soft:         ${textSoft};
    --border:           ${borderColor};

    --shadow-card: 0 12px 32px ${hexToRgba(c.colors.text, 0.07)};
    --shadow-image: 0 20px 60px ${hexToRgba(c.colors.text, 0.15)};
    --shadow-glow: 0 0 40px ${hexToRgba(c.colors.primary, 0.12)};

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
    background: var(--cream);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; display: block; }

  .display {
    font-family: var(--font-display);
    font-weight: 500;
    letter-spacing: -0.025em;
  }
  .display em, .display span.accent {
    font-style: italic;
    color: var(--sand-dark);
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }
  .eyebrow {
    font-family: var(--font-mono);
    font-size: .75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--tannengruen);
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }
  .eyebrow::before {
    content: '';
    width: 24px;
    height: 2px;
    background: var(--sand);
    border-radius: 2px;
  }
  .section-header {
    text-align: center;
    max-width: 720px;
    margin: 0 auto 48px;
  }
  .section-header .eyebrow {
    justify-content: center;
  }
  .section-header h2 {
    font-size: clamp(1.8rem, 3.5vw, 2.8rem);
    line-height: 1.15;
    margin-bottom: 16px;
  }
  .section-header p {
    color: var(--ink-soft);
    font-size: 1.05rem;
    line-height: 1.7;
  }

  /* ========================================
     NAVIGATION
     ======================================== */
  nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: ${hexToRgba(c.colors.background, 0.92)};
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    transition: box-shadow .3s ease;
  }
  .nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.15rem;
    color: var(--tannengruen-dark);
  }
  .logo-mark {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, var(--tannengruen) 0%, var(--tannengruen-dark) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--cream);
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 700;
  }
  .nav-links {
    list-style: none;
    display: flex;
    gap: 28px;
  }
  .nav-links a {
    font-size: .88rem;
    font-weight: 500;
    color: var(--ink-soft);
    transition: color .25s ease;
    position: relative;
  }
  .nav-links a:hover { color: var(--tannengruen); }
  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--sand);
    border-radius: 2px;
    transition: width .3s var(--smooth);
  }
  .nav-links a:hover::after { width: 100%; }
  .nav-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--tannengruen);
    color: var(--cream);
    padding: 10px 22px;
    border-radius: 50px;
    font-size: .85rem;
    font-weight: 600;
    transition: all .3s var(--smooth);
  }
  .nav-cta:hover {
    background: var(--tannengruen-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px ${hexToRgba(c.colors.primary, 0.25)};
  }
  .nav-toggle {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
  }
  .nav-toggle span {
    display: block;
    width: 22px;
    height: 2px;
    background: var(--ink);
    border-radius: 2px;
    transition: all .3s ease;
  }
  .nav-mobile {
    display: none;
    flex-direction: column;
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    background: var(--cream);
    padding: 16px 24px 24px;
    gap: 4px;
    border-bottom: 1px solid var(--border);
    z-index: 999;
    box-shadow: 0 8px 24px ${hexToRgba(c.colors.text, 0.1)};
  }
  .nav-mobile.open { display: flex; }
  .nav-mobile a {
    padding: 12px 16px;
    border-radius: 10px;
    font-weight: 500;
    font-size: .95rem;
    transition: background .2s ease;
  }
  .nav-mobile a:hover { background: var(--tannengruen-soft); }

  /* ========================================
     BUTTONS
     ======================================== */
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: var(--tannengruen);
    color: var(--cream);
    padding: 14px 32px;
    border-radius: 60px;
    font-weight: 600;
    font-size: .95rem;
    transition: all .3s var(--smooth);
    border: none;
    cursor: pointer;
  }
  .btn-primary:hover {
    background: var(--tannengruen-dark);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${hexToRgba(c.colors.primary, 0.3)};
  }
  .btn-primary svg { width: 18px; height: 18px; }
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: var(--tannengruen);
    padding: 14px 28px;
    border-radius: 60px;
    font-weight: 600;
    font-size: .95rem;
    border: 2px solid var(--border);
    transition: all .3s var(--smooth);
    cursor: pointer;
  }
  .btn-secondary:hover {
    border-color: var(--tannengruen);
    background: var(--tannengruen-soft);
  }
  .btn-secondary svg { width: 16px; height: 16px; }

  /* ========================================
     ANNOUNCE BAR
     ======================================== */
  .announce-bar {
    background: var(--tannengruen);
    color: var(--cream);
    text-align: center;
    padding: 10px 20px;
    font-size: .82rem;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    padding: 120px 24px 80px;
    background: linear-gradient(180deg, var(--cream) 0%, var(--cream-tint) 100%);
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 60%;
    height: 120%;
    background: radial-gradient(ellipse, ${hexToRgba(c.colors.primary, 0.04)} 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
  }
  .hero-text {
    position: relative;
    z-index: 2;
  }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: .78rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--tannengruen);
    background: var(--tannengruen-soft);
    padding: 6px 16px;
    border-radius: 40px;
    margin-bottom: 24px;
  }
  .hero-tag svg { width: 14px; height: 14px; }
  .hero h1 {
    font-family: var(--font-display);
    font-size: clamp(2.2rem, 4.5vw, 3.6rem);
    font-weight: 500;
    line-height: 1.1;
    letter-spacing: -0.03em;
    margin-bottom: 20px;
    color: var(--tannengruen-dark);
  }
  .hero h1 em {
    font-style: italic;
    color: var(--sand-dark);
  }
  .hero-lead {
    font-size: 1.12rem;
    color: var(--ink-soft);
    line-height: 1.7;
    max-width: 520px;
    margin-bottom: 32px;
  }
  .hero-actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .hero-image-col {
    position: relative;
  }
  .hero-image-frame {
    border-radius: 20px;
    overflow: hidden;
    aspect-ratio: 4/3;
    background: linear-gradient(135deg, var(--tannengruen) 0%, var(--tannengruen-dark) 100%);
    box-shadow: var(--shadow-image);
  }
  .hero-image-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hero-image-frame .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${hexToRgba(c.colors.background, 0.3)};
  }
  .hero-image-frame .placeholder svg {
    width: 80px;
    height: 80px;
  }
  .hero-float-badge {
    position: absolute;
    bottom: -20px;
    left: -20px;
    background: var(--cream);
    border-radius: 16px;
    padding: 16px 24px;
    box-shadow: var(--shadow-card);
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono);
    font-size: .8rem;
    font-weight: 600;
    color: var(--tannengruen);
  }
  .hero-float-badge svg {
    width: 22px;
    height: 22px;
    color: var(--sand);
  }

  /* ========================================
     LISTINGS / AKTUELLE OBJEKTE
     ======================================== */
  .listings-section {
    padding: 96px 24px;
    background: var(--cream);
  }
  .listings-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }
  .listing-card {
    border-radius: 16px;
    overflow: hidden;
    background: white;
    border: 1px solid var(--border);
    transition: all .4s var(--smooth);
  }
  .listing-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
    border-color: var(--sand);
  }
  .listing-image {
    aspect-ratio: 16/10;
    position: relative;
    overflow: hidden;
  }
  .listing-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${hexToRgba(c.colors.background, 0.4)};
  }
  .listing-placeholder svg {
    width: 60px;
    height: 60px;
  }
  .listing-tag {
    position: absolute;
    top: 12px;
    left: 12px;
    background: var(--tannengruen);
    color: var(--cream);
    font-family: var(--font-mono);
    font-size: .7rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 40px;
  }
  .listing-body {
    padding: 20px;
  }
  .listing-type {
    font-family: var(--font-mono);
    font-size: .72rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--sand-dark);
    margin-bottom: 6px;
  }
  .listing-body h3 {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 500;
    line-height: 1.3;
    margin-bottom: 8px;
    color: var(--tannengruen-dark);
  }
  .listing-location {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: .85rem;
    color: var(--ink-soft);
    margin-bottom: 14px;
  }
  .listing-details {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
  }
  .listing-detail {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: .82rem;
    color: var(--ink-soft);
  }
  .listing-features {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
  }
  .listing-feature {
    font-size: .72rem;
    font-weight: 500;
    background: var(--tannengruen-soft);
    color: var(--tannengruen);
    padding: 3px 10px;
    border-radius: 40px;
  }
  .listing-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 14px;
    border-top: 1px solid var(--border);
  }
  .listing-price {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--tannengruen);
  }
  .listing-cta {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: .82rem;
    font-weight: 600;
    color: var(--tannengruen);
    transition: gap .3s var(--smooth);
  }
  .listing-cta:hover { gap: 8px; }

  /* ========================================
     SERVICES / LEISTUNGEN
     ======================================== */
  .services-section {
    padding: 96px 24px;
    background: var(--cream-tint);
  }
  .services-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
  .service-card {
    background: white;
    border-radius: 16px;
    padding: 36px;
    border: 1px solid var(--border);
    transition: all .4s var(--smooth);
  }
  .service-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-card);
    border-color: var(--sand);
  }
  .service-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: var(--tannengruen-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    color: var(--tannengruen);
  }
  .service-icon svg {
    width: 32px;
    height: 32px;
  }
  .service-card h3 {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 500;
    margin-bottom: 10px;
    color: var(--tannengruen-dark);
  }
  .service-card p {
    font-size: .92rem;
    color: var(--ink-soft);
    line-height: 1.7;
    margin-bottom: 16px;
  }
  .service-features {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .service-features li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: .85rem;
    color: var(--ink);
  }
  .service-features li svg {
    color: var(--tannengruen);
    flex-shrink: 0;
  }

  /* ========================================
     DISTRICTS / REGIONALE EXPERTISE
     ======================================== */
  .districts-section {
    padding: 96px 24px;
    background: var(--cream);
  }
  .districts-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .district-card {
    border-radius: 16px;
    overflow: hidden;
    background: white;
    border: 1px solid var(--border);
    transition: all .4s var(--smooth);
  }
  .district-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-card);
  }
  .district-image {
    aspect-ratio: 16/9;
    position: relative;
    overflow: hidden;
  }
  .district-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .district-placeholder svg {
    width: 50px;
    height: 50px;
  }
  .district-body {
    padding: 20px;
  }
  .district-body h4 {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 8px;
    color: var(--tannengruen-dark);
  }
  .district-body p {
    font-size: .88rem;
    color: var(--ink-soft);
    line-height: 1.6;
    margin-bottom: 12px;
  }
  .district-highlights {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .district-tag {
    font-size: .72rem;
    font-weight: 500;
    background: var(--sand-soft);
    color: var(--sand-dark);
    padding: 3px 10px;
    border-radius: 40px;
  }

  /* ========================================
     FAMILY / UEBER UNS
     ======================================== */
  .family-section {
    padding: 96px 24px;
    background: var(--cream-tint);
  }
  .family-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: start;
    margin-bottom: 56px;
  }
  .family-text .eyebrow { margin-bottom: 12px; }
  .family-text h2 {
    font-size: clamp(1.8rem, 3.5vw, 2.6rem);
    line-height: 1.15;
    margin-bottom: 20px;
  }
  .family-text p {
    font-size: 1rem;
    color: var(--ink-soft);
    line-height: 1.7;
    margin-bottom: 16px;
  }
  .family-stats {
    display: flex;
    gap: 32px;
    margin-top: 28px;
    padding-top: 28px;
    border-top: 1px solid var(--border);
  }
  .family-stat .stat-value {
    font-family: var(--font-display);
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--tannengruen);
    line-height: 1.2;
  }
  .family-stat .stat-label {
    font-size: .82rem;
    color: var(--ink-soft);
    margin-top: 4px;
  }
  .family-members-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 24px;
  }
  .family-member {
    text-align: center;
    background: white;
    border-radius: 16px;
    padding: 28px 20px;
    border: 1px solid var(--border);
    transition: all .4s var(--smooth);
  }
  .family-member:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-card);
  }
  .member-portrait {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background-size: cover;
    background-position: center;
  }
  .member-portrait img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .member-initials {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--cream);
  }
  .family-member h4 {
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 500;
    margin-bottom: 4px;
    color: var(--tannengruen-dark);
  }
  .member-role {
    font-family: var(--font-mono);
    font-size: .75rem;
    font-weight: 500;
    color: var(--sand-dark);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .member-desc {
    font-size: .85rem;
    color: var(--ink-soft);
    line-height: 1.6;
    margin-top: 10px;
  }
  .family-image-area {
    position: relative;
  }
  .family-image-frame {
    border-radius: 20px;
    overflow: hidden;
    aspect-ratio: 4/5;
    background: linear-gradient(135deg, var(--tannengruen) 0%, var(--tannengruen-dark) 100%);
    box-shadow: var(--shadow-image);
  }
  .family-image-frame .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${hexToRgba(c.colors.background, 0.3)};
  }
  .family-image-frame .placeholder svg {
    width: 80px;
    height: 80px;
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews-section {
    padding: 96px 24px;
    background: var(--cream);
  }
  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .review-card {
    background: white;
    border-radius: 16px;
    padding: 32px;
    border: 1px solid var(--border);
    transition: all .4s var(--smooth);
  }
  .review-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-card);
  }
  .review-stars {
    display: flex;
    gap: 2px;
    color: var(--sand);
    margin-bottom: 16px;
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
    background: var(--tannengruen-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: .75rem;
    font-weight: 700;
    color: var(--tannengruen);
  }
  .review-name {
    font-weight: 600;
    font-size: .9rem;
    color: var(--ink);
  }
  .review-meta {
    font-size: .78rem;
    color: var(--ink-soft);
    margin-top: 2px;
  }

  /* ========================================
     LOCATION / STANDORT
     ======================================== */
  .location-section {
    padding: 96px 24px;
    background: var(--cream-tint);
  }
  .location-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: start;
  }
  .location-content .eyebrow { margin-bottom: 12px; }
  .location-content h2 {
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    line-height: 1.15;
    margin-bottom: 24px;
  }
  .location-details {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .location-detail {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }
  .location-detail .icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--tannengruen-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--tannengruen);
  }
  .location-detail .icon svg {
    width: 20px;
    height: 20px;
    stroke-width: 1.5;
  }
  .location-detail .label {
    font-size: .78rem;
    color: var(--ink-soft);
    margin-bottom: 2px;
  }
  .location-detail .value {
    font-weight: 500;
    font-size: .92rem;
    color: var(--ink);
  }
  .hours-card {
    background: white;
    border-radius: 16px;
    padding: 32px;
    border: 1px solid var(--border);
  }
  .hours-card h3 {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 500;
    color: var(--tannengruen-dark);
    margin-bottom: 20px;
  }
  .hours-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
  }
  .hours-item:last-child { border-bottom: none; }
  .hours-item .h-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: .88rem;
    color: var(--ink-soft);
  }
  .hours-item .h-label svg { color: var(--tannengruen); }
  .hours-item .h-value {
    font-weight: 600;
    font-size: .88rem;
    color: var(--ink);
  }
  .map-embed {
    margin-top: 24px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .map-embed iframe {
    width: 100%;
    height: 260px;
    border: 0;
  }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section {
    padding: 80px 24px;
    background: var(--cream);
  }
  .faq-list {
    max-width: 780px;
    margin: 0 auto;
  }
  .faq-item {
    border-bottom: 1px solid var(--border);
  }
  .faq-q {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    background: none;
    border: none;
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 600;
    color: var(--ink);
    text-align: left;
    line-height: 1.4;
  }
  .faq-q:hover { color: var(--tannengruen); }
  .faq-icon {
    font-size: 1.4rem;
    color: var(--sand);
    transition: transform .3s var(--smooth);
    flex-shrink: 0;
    margin-left: 16px;
  }
  .faq-item.open .faq-icon { transform: rotate(45deg); }
  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height .4s var(--smooth), padding .4s var(--smooth);
    font-size: .92rem;
    color: var(--ink-soft);
    line-height: 1.7;
  }
  .faq-item.open .faq-a {
    max-height: 500px;
    padding-bottom: 20px;
  }

  /* ========================================
     CTA / CONTACT FORM
     ======================================== */
  .cta-section {
    padding: 96px 24px;
    background: var(--tannengruen);
    position: relative;
    overflow: hidden;
  }
  .cta-section::before {
    content: '';
    position: absolute;
    top: -30%;
    right: -15%;
    width: 50%;
    height: 130%;
    background: radial-gradient(ellipse, ${hexToRgba(c.colors.accent, 0.08)} 0%, transparent 70%);
    pointer-events: none;
  }
  .cta-grid {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: start;
  }
  .cta-text .eyebrow {
    color: var(--sand);
  }
  .cta-text .eyebrow::before {
    background: var(--sand);
  }
  .cta-text h2 {
    font-size: clamp(1.8rem, 3.5vw, 2.6rem);
    line-height: 1.15;
    margin-bottom: 16px;
    color: var(--cream);
  }
  .cta-text h2 em {
    color: var(--sand);
  }
  .cta-text p {
    color: ${hexToRgba(c.colors.background, 0.75)};
    font-size: 1rem;
    line-height: 1.7;
    margin-bottom: 28px;
  }
  .cta-features {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .cta-feature {
    display: flex;
    align-items: center;
    gap: 10px;
    color: ${hexToRgba(c.colors.background, 0.85)};
    font-size: .9rem;
    font-weight: 500;
  }
  .cta-feature svg {
    color: var(--sand);
    flex-shrink: 0;
  }

  /* Contact Form */
  .contact-form {
    background: ${hexToRgba(c.colors.background, 0.06)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.12)};
    backdrop-filter: blur(8px);
    border-radius: 20px;
    padding: 36px;
    position: relative;
  }
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  .form-row.full {
    grid-template-columns: 1fr;
  }
  .form-field label {
    display: block;
    font-size: .82rem;
    font-weight: 600;
    color: ${hexToRgba(c.colors.background, 0.7)};
    margin-bottom: 6px;
  }
  .form-field input,
  .form-field select,
  .form-field textarea {
    width: 100%;
    background: ${hexToRgba(c.colors.background, 0.08)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.15)};
    border-radius: 10px;
    padding: 12px 16px;
    font-family: var(--font-body);
    font-size: .9rem;
    color: var(--cream);
    transition: border-color .3s ease;
    outline: none;
  }
  .form-field input::placeholder,
  .form-field textarea::placeholder {
    color: ${hexToRgba(c.colors.background, 0.35)};
  }
  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus {
    border-color: var(--sand);
  }
  .form-field textarea {
    min-height: 120px;
    resize: vertical;
  }
  .form-field select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23faf8f2' stroke-width='1.5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;
  }
  .form-field select option {
    background: var(--tannengruen-dark);
    color: var(--cream);
  }
  .form-submit {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--sand);
    color: var(--tannengruen-dark);
    padding: 14px 32px;
    border: none;
    border-radius: 60px;
    font-family: var(--font-body);
    font-weight: 700;
    font-size: .92rem;
    cursor: pointer;
    transition: all .3s var(--smooth);
    margin-top: 8px;
  }
  .form-submit:hover {
    background: var(--sand-dark);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${hexToRgba(c.colors.accent, 0.3)};
  }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: var(--tannengruen-dark);
    color: var(--cream);
    padding: 64px 24px 32px;
  }
  .footer-grid {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 48px;
    padding-bottom: 40px;
    border-bottom: 1px solid ${hexToRgba(c.colors.background, 0.1)};
  }
  .footer-brand {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--cream);
  }
  .footer-desc {
    font-size: .9rem;
    color: ${hexToRgba(c.colors.background, 0.6)};
    line-height: 1.7;
    max-width: 320px;
  }
  .footer-col h4 {
    font-family: var(--font-mono);
    font-size: .75rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--sand);
    margin-bottom: 16px;
  }
  .footer-col ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .footer-col a {
    font-size: .88rem;
    color: ${hexToRgba(c.colors.background, 0.6)};
    transition: color .2s ease;
  }
  .footer-col a:hover { color: var(--cream); }
  .footer-bottom {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 24px;
    font-size: .8rem;
    color: ${hexToRgba(c.colors.background, 0.45)};
  }
  .footer-bottom a {
    color: ${hexToRgba(c.colors.background, 0.5)};
    transition: color .2s ease;
  }
  .footer-bottom a:hover { color: var(--cream); }

  /* ========================================
     MOBILE CTA
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 998;
    background: var(--tannengruen);
    color: var(--cream);
    text-align: center;
    padding: 16px 24px;
    font-weight: 700;
    font-size: .95rem;
    text-decoration: none;
    box-shadow: 0 -4px 20px ${hexToRgba(c.colors.text, 0.15)};
  }

  /* ========================================
     RESPONSIVE 1024px
     ======================================== */
  @media (max-width: 1024px) {
    .hero-inner { grid-template-columns: 1fr; gap: 40px; }
    .hero-image-col { order: -1; }
    .hero-float-badge { bottom: -12px; left: 12px; }
    .listings-grid { grid-template-columns: repeat(2, 1fr); }
    .services-grid { grid-template-columns: 1fr; }
    .districts-grid { grid-template-columns: repeat(2, 1fr); }
    .family-content { grid-template-columns: 1fr; gap: 40px; }
    .location-grid { grid-template-columns: 1fr; gap: 40px; }
    .cta-grid { grid-template-columns: 1fr; gap: 40px; }
    .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
  }

  /* ========================================
     RESPONSIVE 768px
     ======================================== */
  @media (max-width: 768px) {
    .nav-links { display: none; }
    .nav-cta-desktop { display: none; }
    .nav-toggle { display: flex; }
    .hero { padding: 100px 20px 60px; }
    .hero h1 { font-size: 1.9rem; }
    .hero-lead { font-size: 1rem; }
    .hero-actions { flex-direction: column; }
    .hero-actions .btn-primary,
    .hero-actions .btn-secondary { justify-content: center; }
    .hero-float-badge { position: relative; bottom: auto; left: auto; margin-top: 16px; justify-content: center; }
    .listings-section,
    .services-section,
    .districts-section,
    .family-section,
    .reviews-section,
    .location-section,
    .cta-section { padding: 64px 20px; }
    .listings-grid { grid-template-columns: 1fr; }
    .districts-grid { grid-template-columns: 1fr; }
    .reviews-grid { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
    .family-stats { flex-direction: column; gap: 16px; }
    .family-members-grid { grid-template-columns: 1fr 1fr; }
    .footer-grid { grid-template-columns: 1fr; gap: 28px; }
    .footer-bottom { flex-direction: column; text-align: center; gap: 8px; }
    .mobile-cta { display: block; }
    body { padding-bottom: 72px; }
  }

  /* ========================================
     RESPONSIVE 480px
     ======================================== */
  @media (max-width: 480px) {
    .family-members-grid { grid-template-columns: 1fr; }
    .listing-details { flex-direction: column; gap: 6px; }
  }

  /* ========================================
     ANIMATIONS
     ======================================== */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-in {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity .6s ease, transform .6s ease;
  }
  .animate-in.visible {
    opacity: 1;
    transform: translateY(0);
  }
</style>
</head>
<body>

<!-- ==========================================
     ANNOUNCEMENT BAR
     ========================================== -->
${c.announceText ? `<div class="announce-bar">${c.announceText}</div>` : ''}

<!-- ==========================================
     NAVIGATION
     ========================================== -->
<nav id="main-nav">
  <div class="nav-inner">
    <a href="#" class="nav-brand">
      <div class="logo-mark">${logoInitial}</div>
      ${esc(c.businessName)}
    </a>
    <ul class="nav-links">
      ${navLinks.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join('\n      ')}
    </ul>
    <a href="#contact" class="nav-cta nav-cta-desktop">${esc(c.ctaText)}
      <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 10h10M11 6l4 4-4 4"/></svg>
    </a>
    <button class="nav-toggle" id="nav-toggle" aria-label="Men&uuml;">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
<div class="nav-mobile" id="nav-mobile">
  ${navLinks.map(l => `<a href="${l.href}">${l.label}</a>`).join('\n  ')}
  <a href="#contact" class="btn-primary" style="margin-top:12px;text-align:center;justify-content:center">${esc(c.ctaText)}</a>
</div>

<!-- ==========================================
     HERO
     ========================================== -->
<section class="hero" id="hero">
  <div class="hero-inner">
    <div class="hero-text">
      <div class="hero-tag">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M10 2a6 6 0 0 0-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 0 0-6-6z"/><circle cx="10" cy="8" r="2"/></svg>
        ${esc(c.heroTag)}
      </div>
      <h1 class="display">${c.heroHeadline} <em>${c.heroAccent}</em></h1>
      <p class="hero-lead">${esc(c.heroLead)}</p>
      <div class="hero-actions">
        <a href="#contact" class="btn-primary">
          ${esc(c.ctaText)}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
        <a href="#objekte" class="btn-secondary">
          Objekte entdecken
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </a>
      </div>
    </div>
    <div class="hero-image-col">
      <div class="hero-image-frame">
        ${c.heroImageUrl
          ? `<img src="${esc(c.heroImageUrl)}" alt="${esc(c.businessName)} - ${esc(c.tagline)}" loading="eager">`
          : `<div class="placeholder">
              <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M15 60V30L40 15l25 15v30"/><rect x="30" y="42" width="20" height="18"/><path d="M30 52h20"/><path d="M22 35h6v5h-6zM52 35h6v5h-6z"/>
              </svg>
            </div>`}
      </div>
      <div class="hero-float-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z"/></svg>
        Ihr Familienmakler seit Generationen
      </div>
    </div>
  </div>
</section>

<!-- ==========================================
     AKTUELLE OBJEKTE
     ========================================== -->
<section id="objekte" class="listings-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">${esc(c.listingsTitle || 'Aktuelle Objekte')}</span>
      <h2 class="display">${c.listingsSubtitle || 'Ausgew&auml;hlte <em>Immobilien</em>'}</h2>
      <p>Entdecken Sie unser handverlesenes Portfolio an Wohn- und Anlageimmobilien in M&uuml;nchen-S&uuml;d und Umgebung.</p>
    </div>
    <div class="listings-grid animate-in">
      ${listingsHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     LEISTUNGEN
     ========================================== -->
<section id="leistungen" class="services-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">${esc(c.servicesTitle || 'Leistungen')}</span>
      <h2 class="display">${c.servicesSubtitle || 'Kompetenz in allen <em>Immobilienfragen</em>'}</h2>
      <p>Vom ersten Beratungsgespr&auml;ch bis zur Schl&uuml;ssel&uuml;bergabe &mdash; wir begleiten Sie pers&ouml;nlich durch jeden Schritt.</p>
    </div>
    <div class="services-grid animate-in">
      ${servicesHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     REGIONALE EXPERTISE / STADTTEILE
     ========================================== -->
<section id="stadtteile" class="districts-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">${esc(c.districtsTitle || 'Regionale Expertise')}</span>
      <h2 class="display">${c.districtsSubtitle || 'Unsere <em>Stadtteile</em>'}</h2>
      <p>Tief verwurzelt in M&uuml;nchen-S&uuml;d kennen wir jeden Stra&szlig;enzug, jeden Spielplatz und jede Mikrolage &mdash; seit drei Generationen.</p>
    </div>
    <div class="districts-grid animate-in">
      ${districtsHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     UEBER UNS / FAMILIE
     ========================================== -->
<section id="familie" class="family-section">
  <div class="container">
    <div class="family-content">
      <div class="family-text">
        <span class="eyebrow">&Uuml;ber uns</span>
        <h2 class="display">${c.familyTitle || 'Familie Brunner &mdash; Ihr <em>Familienmakler</em>'}</h2>
        <p>${esc(c.familyText || 'Seit drei Generationen vermitteln wir Immobilien in M\u00fcnchen-S\u00fcd. Was als kleines Maklerb\u00fcro begann, ist heute ein Familienunternehmen, das auf Vertrauen, regionale Expertise und pers\u00f6nliche Beziehungen setzt.')}</p>
        ${c.familyText2 ? `<p>${esc(c.familyText2)}</p>` : ''}
        ${familyStatsHtml}
      </div>
      <div class="family-image-area">
        <div class="family-image-frame">
          <div class="placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
    ${familyMembers.length > 0 ? `<div class="family-members-grid animate-in">
      ${familyMembersHtml}
    </div>` : ''}
  </div>
</section>

<!-- ==========================================
     REVIEWS / BEWERTUNGEN
     ========================================== -->
<section id="bewertungen" class="reviews-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">${esc(c.reviewsTitle || 'Bewertungen')}</span>
      <h2 class="display">Was unsere <em>Kunden</em> sagen</h2>
      <p>Vertrauen ist die Grundlage unserer Arbeit &mdash; lesen Sie, was Familien und Eigent&uuml;mer &uuml;ber ihre Erfahrung mit uns berichten.</p>
    </div>
    <div class="reviews-grid animate-in">
      ${reviewsHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     STANDORT
     ========================================== -->
<section id="standort" class="location-section">
  <div class="container">
    <div class="location-grid">
      <div class="location-content">
        <span class="eyebrow">${esc(c.locationTitle || 'Standort')}</span>
        <h2 class="display">${c.locationSubtitle || 'Besuchen Sie <em>uns</em>'}</h2>
        <div class="location-details">
          ${c.address ? `<div class="location-detail">
            <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
            <div><div class="label">Adresse</div><div class="value">${esc(c.address)}${c.postalCode || c.city ? `<br>${esc(c.postalCode || '')} ${esc(c.city || '')}` : ''}</div></div>
          </div>` : ''}
          ${c.phone ? `<div class="location-detail">
            <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
            <div><div class="label">Telefon</div><div class="value"><a href="tel:${esc(c.phone)}" style="color:var(--tannengruen);font-weight:600">${esc(c.phone)}</a></div></div>
          </div>` : ''}
          ${c.email ? `<div class="location-detail">
            <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg></div>
            <div><div class="label">E-Mail</div><div class="value"><a href="mailto:${esc(c.email)}" style="color:var(--tannengruen);font-weight:600">${esc(c.email)}</a></div></div>
          </div>` : ''}
        </div>
        ${c.mapEmbedUrl ? `<div class="map-embed"><iframe src="${esc(c.mapEmbedUrl)}" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>` : ''}
      </div>
      <div class="hours-card">
        <h3>&Ouml;ffnungszeiten</h3>
        ${hoursHtml}
      </div>
    </div>
  </div>
</section>

<!-- ==========================================
     FAQ
     ========================================== -->
${(c.faqItems || []).length > 0 ? `<section id="faq" class="faq-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">H&auml;ufige Fragen</span>
      <h2 class="display">Gut zu <em>wissen</em></h2>
    </div>
    <div class="faq-list">
      ${faqHtml}
    </div>
  </div>
</section>` : ''}

<!-- ==========================================
     CTA / CONTACT FORM
     ========================================== -->
${c.contactEnabled !== false ? `<section id="contact" class="cta-section">
  <div class="cta-grid">
    <div class="cta-text">
      <span class="eyebrow">${esc(c.ctaSectionTitle || 'Beratung anfragen')}</span>
      <h2 class="display">${c.ctaSectionSubtitle || 'Lassen Sie uns <em>sprechen</em>.'}</h2>
      <p>Ob Immobilienbewertung, Kaufberatung oder eine Frage zu einem unserer Objekte &mdash; wir nehmen uns pers&ouml;nlich f&uuml;r Sie Zeit. Famili&auml;r, kompetent, regional.</p>

      ${ctaFeaturesHtml.length > 0 ? `<div class="cta-features">${ctaFeaturesHtml}</div>` : `
      <div class="cta-features">
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 13l4 4L19 7"/></svg>
          Kostenlose Erstberatung
        </div>
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 13l4 4L19 7"/></svg>
          Marktgerechte Immobilienbewertung
        </div>
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 13l4 4L19 7"/></svg>
          Antwort innerhalb von 24 Stunden
        </div>
      </div>`}
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
            <option>Kaufberatung</option>
            <option>Immobilie verkaufen</option>
            <option>Vermietung</option>
            <option>Erbimmobilie</option>
            <option>Immobilienbewertung</option>
            <option>Allgemeine Anfrage</option>
          </select>
        </div>
      </div>

      <div class="form-row full">
        <div class="form-field">
          <label>Nachricht*</label>
          <textarea name="message" required placeholder="Erz&auml;hlen Sie uns von Ihrem Immobilienwunsch ..."></textarea>
        </div>
      </div>

      <div style="position:absolute;left:-9999px"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>

      <button type="submit" class="form-submit" id="contact-submit">
        Nachricht senden
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </button>
    </form>
  </div>
</section>` : ''}

<!-- ==========================================
     FOOTER
     ========================================== -->
<footer>
  <div class="footer-grid">
    <div>
      <div class="footer-brand">${esc(c.businessName)}</div>
      <p class="footer-desc">${esc(c.footerText || c.tagline)}</p>
    </div>
    ${footerColumnsHtml}
  </div>
  <div class="footer-bottom">
    <span>&copy; ${new Date().getFullYear()} ${esc(c.businessName)}</span>
    <span><a href="${esc(c.imprintUrl || '#')}">Impressum</a> &middot; <a href="${esc(c.privacyUrl || '#')}">Datenschutz</a></span>
  </div>
</footer>

<!-- Sticky Mobile CTA -->
<a href="${esc(mobileCta.href)}" class="mobile-cta">${esc(mobileCta.text)} &rarr;</a>

<script>
  /* Mobile Nav Toggle */
  document.getElementById('nav-toggle').addEventListener('click', function() {
    document.getElementById('nav-mobile').classList.toggle('open');
  });

  /* Close mobile nav on link click */
  document.querySelectorAll('#nav-mobile a').forEach(function(a) {
    a.addEventListener('click', function() {
      document.getElementById('nav-mobile').classList.remove('open');
    });
  });

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

  /* Scroll-based nav background */
  (function() {
    var nav = document.querySelector('nav');
    window.addEventListener('scroll', function() {
      if (window.scrollY > 60) {
        nav.style.boxShadow = '0 4px 20px ${hexToRgba(c.colors.text, 0.08)}';
      } else {
        nav.style.boxShadow = 'none';
      }
    });
  })();

  /* Scroll animations */
  (function() {
    var els = document.querySelectorAll('.animate-in');
    if (!els.length) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(function(el) { observer.observe(el); });
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
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:var(--cream);font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:' + '${hexToRgba(c.colors.background, 0.7)}' + ';font-size:1.05rem">Wir melden uns in K\\u00fcrze bei Ihnen.</p></div>';
          } else {
            alert(d.error || 'Fehler beim Senden');
            btn.textContent = 'Nachricht senden';
            btn.disabled = false;
          }
        })
        .catch(function() {
          alert('Verbindungsfehler');
          btn.textContent = 'Nachricht senden';
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
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba(c.colors.primary, 0.97)};backdrop-filter:blur(12px);color:var(--cream);padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:${hexToRgba(c.colors.background, 0.8)}">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--cream);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--sand);color:var(--tannengruen-dark);border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
