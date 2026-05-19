/* eslint-disable @typescript-eslint/no-unused-vars */
// Werkstatt BMW Template — Premium BMW-Werkstatt
// Dark, premium automotive design with BMW-inspired aesthetics

export interface WerkstattBMWConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Tiefblau #1a3a6a
    accent: string     // Silber #c0c0c0
    background: string // Schwarz #0a0a0a
    text: string       // Off-White #f5f5f2
  }
  phone?: string
  email?: string
  address?: string
  openingHours: { days: string; hours: string }[]
  specializations: {
    name: string
    description: string
    icon: string
    features?: string[]
    imageUrl?: string
  }[]
  serviceCategories: {
    name: string
    items: { name: string; description: string; price: string; duration?: string; tag?: string }[]
  }[]
  equipment: {
    name: string
    description: string
    icon?: string
  }[]
  team: {
    name: string
    role: string
    qualifications: string[]
    specialties?: string[]
    imageUrl?: string
  }[]
  reviews: { text: string; name: string; source: string; rating: number; vehicle?: string }[]
  heroImageUrl?: string
  aboutTitle?: string
  aboutText?: string
  aboutText2?: string
  aboutStats?: { value: string; label: string }[]
  contactEnabled?: boolean
  imprintUrl?: string
  privacyUrl?: string
  footerText?: string
  footerColumns?: { title: string; links: { label: string; href: string }[] }[]
  faqItems?: { question: string; answer: string }[]
  locationTitle?: string
  locationSubtitle?: string
  locationDetails?: { icon: string; label: string; value: string }[]
  ctaSectionTitle?: string
  ctaSectionSubtitle?: string
  ctaFeatures?: string[]
  serviceSectionTitle?: string
  serviceSectionSubtitle?: string
  teamSectionTitle?: string
  teamSectionSubtitle?: string
  equipmentSectionTitle?: string
  equipmentSectionSubtitle?: string
  specSectionTitle?: string
  specSectionSubtitle?: string
  reviewsSectionTitle?: string
  bookingUrl?: string
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
  return Array(Math.min(Math.max(Math.round(count), 0), 5)).fill(star).join('\n            ')
}

const checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>'

export function renderWerkstattBMWTemplate(config: WerkstattBMWConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primaryDark = darkenHex(c.colors.primary, 0.3)
  const primaryLight = tintHex(c.colors.primary, 0.25)
  const primarySoft = hexToRgba(c.colors.primary, 0.15)
  const accentDark = darkenHex(c.colors.accent, 0.25)
  const accentSoft = hexToRgba(c.colors.accent, 0.12)
  const bgLighter = tintHex(c.colors.background, 0.06)
  const bgCard = tintHex(c.colors.background, 0.08)
  const bgCardHover = tintHex(c.colors.background, 0.12)
  const textSoft = hexToRgba(c.colors.text, 0.7)
  const textDim = hexToRgba(c.colors.text, 0.45)
  const borderColor = hexToRgba(c.colors.text, 0.08)
  const borderHover = hexToRgba(c.colors.accent, 0.3)

  const logoInitial = esc(c.businessName.charAt(0))

  // Service tabs from categories
  const serviceTabs = c.serviceCategories.map((cat, i) =>
    `<button class="service-tab${i === 0 ? ' active' : ''}" data-cat="${i}">${esc(cat.name)}</button>`
  ).join('\n      ')

  // Service items
  const serviceItemsHtml = c.serviceCategories.map((cat, catIdx) =>
    `<div class="service-category" data-cat-content="${catIdx}" style="${catIdx === 0 ? '' : 'display:none'}">
      <div class="service-grid">
        ${cat.items.map(item => `
        <div class="service-item">
          <div class="service-item-info">
            <div class="service-item-header">
              <h4>${esc(item.name)}</h4>
              ${item.duration ? `<span class="service-duration">${esc(item.duration)}</span>` : ''}
            </div>
            <p>${esc(item.description)}</p>
            ${item.tag ? `<div class="tags"><span class="tag${item.tag.toLowerCase() === 'neu' ? ' new' : item.tag.toLowerCase() === 'aktion' ? ' action' : item.tag.toLowerCase() === 'premium' ? ' premium' : ''}">${esc(item.tag)}</span></div>` : ''}
          </div>
          <div class="service-item-price">${esc(item.price)}</div>
        </div>`).join('')}
      </div>
    </div>`
  ).join('\n')

  // Specializations HTML
  const specsHtml = c.specializations.map((s, idx) => {
    const gradients = [
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 100%)`,
      `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.15)} 0%, ${c.colors.primary} 100%)`,
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${tintHex(c.colors.accent, -0.5)} 100%)`,
      `linear-gradient(135deg, ${primaryLight} 0%, ${primaryDark} 100%)`,
      `linear-gradient(135deg, ${darkenHex(c.colors.primary, 0.1)} 0%, ${darkenHex(c.colors.accent, 0.5)} 100%)`,
    ]
    const bgStyle = s.imageUrl
      ? `background-image:url('${esc(s.imageUrl)}');background-size:cover;background-position:center`
      : `background:${gradients[idx % gradients.length]}`
    return `
      <div class="spec-card">
        <div class="spec-visual" style="${bgStyle}">
          ${!s.imageUrl ? `<div class="spec-icon">${s.icon}</div>` : ''}
        </div>
        <div class="spec-content">
          <h3>${esc(s.name)}</h3>
          <p>${esc(s.description)}</p>
          ${s.features && s.features.length > 0 ? `<ul class="spec-features">${s.features.map(f => `<li>${checkSvg}${esc(f)}</li>`).join('')}</ul>` : ''}
        </div>
      </div>`
  }).join('\n')

  // Team HTML
  const teamHtml = c.team.map((t, idx) => {
    const initials = t.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    const gradients = [
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 100%)`,
      `linear-gradient(135deg, ${c.colors.accent} 0%, ${accentDark} 100%)`,
      `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.3)} 0%, ${c.colors.primary} 100%)`,
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${tintHex(c.colors.accent, -0.3)} 100%)`,
    ]
    const bgStyle = t.imageUrl
      ? `background-image:url('${esc(t.imageUrl)}');background-size:cover;background-position:center`
      : `background:${gradients[idx % gradients.length]}`
    return `
      <div class="team-card">
        <div class="team-portrait" style="${bgStyle}">
          ${!t.imageUrl ? `<span class="team-initials">${esc(initials)}</span>` : ''}
        </div>
        <div class="team-info">
          <h4>${esc(t.name)}</h4>
          <span class="team-role">${esc(t.role)}</span>
          ${t.qualifications.length > 0 ? `<div class="team-quals">
            ${t.qualifications.map(q => `<span class="qual-badge">${esc(q)}</span>`).join('\n            ')}
          </div>` : ''}
          ${(t.specialties || []).length > 0 ? `<div class="team-specs">
            ${(t.specialties || []).map(sp => `<span class="spec-tag">${esc(sp)}</span>`).join('\n            ')}
          </div>` : ''}
        </div>
      </div>`
  }).join('\n')

  // Equipment HTML
  const equipmentHtml = c.equipment.map(e => `
      <div class="equip-card">
        <div class="equip-icon">
          ${e.icon || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>'}
        </div>
        <h4>${esc(e.name)}</h4>
        <p>${esc(e.description)}</p>
      </div>`).join('\n')

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
            <div class="review-meta">${esc(r.source)}${r.vehicle ? ` &middot; ${esc(r.vehicle)}` : ''}</div>
          </div>
        </div>
      </div>`
  }).join('\n')

  // Opening hours HTML
  const hoursHtml = c.openingHours.map(h => `
      <div class="hours-item">
        <div class="label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          ${esc(h.days)}
        </div>
        <div class="value">${esc(h.hours)}</div>
      </div>`).join('')

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

  // Location details
  const locationDetails = c.locationDetails || []
  const locationDetailsHtml = locationDetails.map(d => `
      <div class="location-detail">
        <div class="icon">
          ${d.icon === 'pin' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
          : d.icon === 'transit' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>'
          : d.icon === 'phone' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
          : d.icon === 'parking' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M3 12h18M3 18h18"/></svg>'}
        </div>
        <div>
          <div class="label">${esc(d.label)}</div>
          <div class="value">${d.value}</div>
        </div>
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
    { title: 'Werkstatt', links: [
      { label: 'Spezialisierung', href: '#spezialisierung' },
      { label: 'Services', href: '#services' },
      { label: 'Technik', href: '#technik' },
    ]},
    { title: 'Besuch', links: [
      { label: 'Kontakt', href: '#contact' },
      { label: 'Standort', href: '#standort' },
      { label: 'FAQ', href: '#faq' },
    ]},
  ]
  const footerColumnsHtml = footerColumns.map(col => `
      <div>
        <div class="footer-col-title">${esc(col.title)}</div>
        <ul class="footer-links">
          ${col.links.map(l => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('\n          ')}
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

<!-- Schema.org AutoRepair -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  "name": "${esc(c.businessName)}",
  "description": "${esc(c.tagline)}",
  ${c.address ? `"address": { "@type": "PostalAddress", "streetAddress": "${esc(c.address)}" },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  "priceRange": "$$$",
  "currenciesAccepted": "EUR",
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
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Werkstatt-Services",
    "itemListElement": [${c.serviceCategories.flatMap(cat => cat.items).slice(0, 10).map(item => `{
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "${esc(item.name)}",
        "description": "${esc(item.description)}"
      },
      "price": "${esc(item.price)}",
      "priceCurrency": "EUR"
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
    --primary:        ${esc(c.colors.primary)};
    --primary-dark:   ${primaryDark};
    --primary-light:  ${primaryLight};
    --primary-soft:   ${primarySoft};
    --accent:         ${esc(c.colors.accent)};
    --accent-dark:    ${accentDark};
    --accent-soft:    ${accentSoft};
    --bg:             ${esc(c.colors.background)};
    --bg-lighter:     ${bgLighter};
    --bg-card:        ${bgCard};
    --bg-card-hover:  ${bgCardHover};
    --text:           ${esc(c.colors.text)};
    --text-soft:      ${textSoft};
    --text-dim:       ${textDim};
    --border:         ${borderColor};
    --border-hover:   ${borderHover};

    --font-display: 'Fraunces', Georgia, serif;
    --font-body:    'Inter Tight', system-ui, sans-serif;
    --font-mono:    'JetBrains Mono', monospace;

    --radius:       12px;
    --radius-lg:    20px;
    --radius-sm:    8px;
    --container:    1200px;
    --transition:   0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ========================================
     RESET & BASE
     ======================================== */
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  html {
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
  }

  body {
    font-family: var(--font-body);
    background: var(--bg);
    color: var(--text);
    line-height: 1.65;
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  .container {
    max-width: var(--container);
    margin: 0 auto;
    padding: 0 24px;
  }

  h1, h2, h3, h4 { font-family: var(--font-display); line-height: 1.15; }
  em { font-style: normal; color: var(--accent); }
  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; display: block; }

  .display {
    font-size: clamp(2rem, 4vw, 3.2rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.1;
    color: var(--text);
  }

  .eyebrow {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent);
  }

  .section-head {
    text-align: center;
    margin-bottom: 56px;
  }
  .section-head .eyebrow { display: block; margin-bottom: 14px; }
  .section-head p { max-width: 560px; margin: 18px auto 0; color: var(--text-soft); font-size: 1.05rem; }

  /* ========================================
     NAVIGATION
     ======================================== */
  nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 1000;
    background: ${hexToRgba(c.colors.background, 0.92)};
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    transition: box-shadow var(--transition);
  }

  .nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 72px;
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.15rem;
    color: var(--text);
  }

  .nav-logo {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.1rem;
    color: var(--text);
    border: 1px solid ${hexToRgba(c.colors.accent, 0.2)};
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 32px;
    list-style: none;
  }

  .nav-links a {
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--text-soft);
    transition: color var(--transition);
    letter-spacing: 0.01em;
  }
  .nav-links a:hover { color: var(--accent); }

  .nav-cta {
    background: var(--primary);
    color: var(--text) !important;
    padding: 10px 22px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 0.85rem;
    transition: all var(--transition);
    border: 1px solid ${hexToRgba(c.colors.accent, 0.15)};
  }
  .nav-cta:hover {
    background: var(--primary-light);
    box-shadow: 0 0 20px ${hexToRgba(c.colors.primary, 0.4)};
  }

  .nav-toggle {
    display: none;
    background: none;
    border: none;
    width: 32px;
    height: 32px;
    cursor: pointer;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    padding: 4px;
  }
  .nav-toggle span {
    display: block;
    height: 2px;
    width: 100%;
    background: var(--text);
    border-radius: 2px;
    transition: var(--transition);
  }

  @media (max-width: 768px) {
    .nav-toggle { display: flex; }
    .nav-links {
      position: fixed;
      top: 72px; left: 0; right: 0; bottom: 0;
      background: ${hexToRgba(c.colors.background, 0.98)};
      backdrop-filter: blur(20px);
      flex-direction: column;
      justify-content: flex-start;
      padding: 40px 24px;
      gap: 8px;
      transform: translateX(100%);
      transition: transform var(--transition);
    }
    .nav-links.open { transform: translateX(0); }
    .nav-links li { width: 100%; }
    .nav-links a {
      display: block;
      padding: 14px 0;
      font-size: 1.1rem;
      border-bottom: 1px solid var(--border);
    }
    .nav-cta {
      display: block;
      text-align: center;
      margin-top: 16px;
      padding: 14px 22px;
    }
  }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    padding: 120px 0 80px;
    overflow: hidden;
    background: var(--bg);
  }

  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 30% 20%, ${hexToRgba(c.colors.primary, 0.2)} 0%, transparent 60%),
                radial-gradient(ellipse at 70% 80%, ${hexToRgba(c.colors.primary, 0.1)} 0%, transparent 50%);
    pointer-events: none;
  }

  .hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
    position: relative;
    z-index: 2;
  }

  .hero-content { max-width: 580px; }

  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    background: ${hexToRgba(c.colors.primary, 0.25)};
    border: 1px solid ${hexToRgba(c.colors.accent, 0.15)};
    padding: 6px 16px;
    border-radius: 50px;
    margin-bottom: 24px;
  }

  .hero h1 {
    font-size: clamp(2.4rem, 5vw, 4rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.05;
    margin-bottom: 24px;
  }
  .hero h1 em {
    background: linear-gradient(135deg, var(--accent), var(--primary-light));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-lead {
    font-size: 1.12rem;
    color: var(--text-soft);
    line-height: 1.7;
    margin-bottom: 36px;
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
    gap: 8px;
    background: var(--primary);
    color: var(--text);
    padding: 14px 32px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all var(--transition);
    border: 1px solid ${hexToRgba(c.colors.accent, 0.2)};
    cursor: pointer;
    font-family: var(--font-body);
  }
  .btn-primary:hover {
    background: var(--primary-light);
    box-shadow: 0 4px 24px ${hexToRgba(c.colors.primary, 0.4)};
    transform: translateY(-1px);
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--text-soft);
    padding: 14px 24px;
    border-radius: 50px;
    font-weight: 500;
    font-size: 0.95rem;
    transition: color var(--transition);
    cursor: pointer;
    background: none;
    border: none;
    font-family: var(--font-body);
  }
  .btn-secondary:hover { color: var(--accent); }

  .hero-visual {
    position: relative;
    aspect-ratio: 4/3;
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--border);
    ${c.heroImageUrl
      ? `background: url('${esc(c.heroImageUrl)}') center/cover no-repeat;`
      : `background: linear-gradient(180deg, transparent 40%, ${hexToRgba(c.colors.background, 0.7)}), linear-gradient(135deg, ${tintHex(c.colors.primary, 0.15)} 0%, ${c.colors.background} 60%, ${darkenHex(c.colors.background, 0.2)} 100%);`}
  }
  .hero-visual::after {
    ${!c.heroImageUrl ? `content: 'IMG: BMW in der Werkstatt'; position: absolute; bottom: 20px; left: 20px; font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); letter-spacing: 0.08em;` : ''}
  }

  .hero-badge {
    position: absolute;
    bottom: 24px;
    right: 24px;
    background: ${hexToRgba(c.colors.background, 0.85)};
    backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--accent);
    letter-spacing: 0.05em;
  }
  .hero-badge svg { width: 18px; height: 18px; stroke: var(--accent); fill: none; }

  ${c.announceText ? `.announce-bar {
    background: var(--primary);
    color: var(--text);
    text-align: center;
    padding: 10px 24px;
    font-size: 0.82rem;
    font-weight: 500;
    margin-top: 72px;
    border-bottom: 1px solid ${hexToRgba(c.colors.accent, 0.1)};
  }` : ''}

  @media (max-width: 768px) {
    .hero { min-height: auto; padding: 100px 0 60px; }
    .hero-grid { grid-template-columns: 1fr; gap: 40px; }
    .hero-visual { aspect-ratio: 16/10; }
    .hero-actions { flex-direction: column; align-items: flex-start; }
  }

  /* ========================================
     SPECIALIZATIONS
     ======================================== */
  .specializations {
    padding: 100px 0;
    background: var(--bg);
  }

  .spec-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: 24px;
  }

  .spec-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: all var(--transition);
  }
  .spec-card:hover {
    border-color: var(--border-hover);
    transform: translateY(-4px);
    box-shadow: 0 12px 40px ${hexToRgba(c.colors.primary, 0.15)};
  }

  .spec-visual {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .spec-icon {
    font-size: 2.5rem;
    opacity: 0.9;
  }

  .spec-content {
    padding: 28px;
  }
  .spec-content h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 10px;
    color: var(--text);
  }
  .spec-content p {
    font-size: 0.92rem;
    color: var(--text-soft);
    line-height: 1.6;
    margin-bottom: 16px;
  }

  .spec-features {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .spec-features li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: var(--text-soft);
  }
  .spec-features li svg {
    width: 16px;
    height: 16px;
    stroke: var(--accent);
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    .specializations { padding: 60px 0; }
    .spec-grid { grid-template-columns: 1fr; }
  }

  /* ========================================
     SERVICES
     ======================================== */
  .services {
    padding: 100px 0;
    background: var(--bg-lighter);
  }

  .service-tabs {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 40px;
  }

  .service-tab {
    background: var(--bg-card);
    border: 1px solid var(--border);
    color: var(--text-soft);
    padding: 10px 22px;
    border-radius: 50px;
    font-family: var(--font-body);
    font-size: 0.88rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition);
  }
  .service-tab:hover {
    border-color: var(--border-hover);
    color: var(--text);
  }
  .service-tab.active {
    background: var(--primary);
    border-color: var(--primary);
    color: var(--text);
  }

  .service-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .service-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px 28px;
    transition: all var(--transition);
  }
  .service-item:hover {
    border-color: var(--border-hover);
    background: var(--bg-card-hover);
  }

  .service-item-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 6px;
  }
  .service-item-header h4 {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--text);
    font-family: var(--font-body);
  }

  .service-duration {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--text-dim);
    letter-spacing: 0.06em;
    background: var(--bg);
    padding: 3px 10px;
    border-radius: 50px;
    border: 1px solid var(--border);
  }

  .service-item-info p {
    font-size: 0.88rem;
    color: var(--text-soft);
    line-height: 1.5;
  }

  .service-item-price {
    font-family: var(--font-mono);
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--accent);
    white-space: nowrap;
    letter-spacing: -0.01em;
  }

  .tags { margin-top: 8px; }
  .tag {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 50px;
    background: var(--primary-soft);
    color: var(--accent);
    border: 1px solid ${hexToRgba(c.colors.accent, 0.12)};
  }
  .tag.new { background: ${hexToRgba('#22c55e', 0.12)}; color: #22c55e; border-color: ${hexToRgba('#22c55e', 0.2)}; }
  .tag.action { background: ${hexToRgba('#f59e0b', 0.12)}; color: #f59e0b; border-color: ${hexToRgba('#f59e0b', 0.2)}; }
  .tag.premium { background: var(--accent-soft); color: var(--accent); border-color: var(--border-hover); }

  @media (max-width: 768px) {
    .services { padding: 60px 0; }
    .service-item { flex-direction: column; gap: 12px; padding: 20px; }
  }

  /* ========================================
     EQUIPMENT / TECHNIK
     ======================================== */
  .equipment {
    padding: 100px 0;
    background: var(--bg);
  }

  .equip-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
  }

  .equip-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 32px 28px;
    text-align: center;
    transition: all var(--transition);
  }
  .equip-card:hover {
    border-color: var(--border-hover);
    transform: translateY(-3px);
    box-shadow: 0 8px 30px ${hexToRgba(c.colors.primary, 0.12)};
  }

  .equip-icon {
    width: 52px;
    height: 52px;
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-soft);
    border-radius: var(--radius-sm);
    border: 1px solid ${hexToRgba(c.colors.accent, 0.1)};
  }
  .equip-icon svg {
    width: 26px;
    height: 26px;
    stroke: var(--accent);
  }

  .equip-card h4 {
    font-size: 1.05rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text);
    font-family: var(--font-body);
  }
  .equip-card p {
    font-size: 0.88rem;
    color: var(--text-soft);
    line-height: 1.55;
  }

  @media (max-width: 768px) {
    .equipment { padding: 60px 0; }
    .equip-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
    .equip-card { padding: 24px 18px; }
  }
  @media (max-width: 480px) {
    .equip-grid { grid-template-columns: 1fr; }
  }

  /* ========================================
     TEAM
     ======================================== */
  .team-section {
    padding: 100px 0;
    background: var(--bg-lighter);
  }

  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
  }

  .team-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: all var(--transition);
  }
  .team-card:hover {
    border-color: var(--border-hover);
    transform: translateY(-4px);
    box-shadow: 0 12px 40px ${hexToRgba(c.colors.primary, 0.12)};
  }

  .team-portrait {
    height: 260px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .team-initials {
    font-family: var(--font-display);
    font-size: 2.5rem;
    font-weight: 700;
    color: ${hexToRgba(c.colors.text, 0.6)};
  }

  .team-info {
    padding: 24px 28px 28px;
  }
  .team-info h4 {
    font-size: 1.15rem;
    font-weight: 700;
    margin-bottom: 4px;
    color: var(--text);
  }

  .team-role {
    font-size: 0.88rem;
    color: var(--accent);
    font-weight: 500;
    display: block;
    margin-bottom: 14px;
  }

  .team-quals {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 10px;
  }

  .qual-badge {
    display: inline-block;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 50px;
    background: var(--primary-soft);
    color: var(--text-soft);
    border: 1px solid var(--border);
    font-family: var(--font-mono);
    letter-spacing: 0.03em;
  }

  .team-specs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .spec-tag {
    display: inline-block;
    font-size: 0.72rem;
    font-weight: 500;
    padding: 3px 10px;
    border-radius: 50px;
    background: var(--accent-soft);
    color: var(--accent);
    border: 1px solid var(--border-hover);
  }

  @media (max-width: 768px) {
    .team-section { padding: 60px 0; }
    .team-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews-section {
    padding: 100px 0;
    background: var(--bg);
  }

  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
  }

  .review-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 32px;
    transition: all var(--transition);
  }
  .review-card:hover {
    border-color: var(--border-hover);
  }

  .review-stars {
    display: flex;
    gap: 3px;
    margin-bottom: 18px;
  }
  .review-stars svg {
    width: 16px;
    height: 16px;
    fill: #f59e0b;
  }

  .review-text {
    font-size: 1rem;
    line-height: 1.65;
    color: var(--text-soft);
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
    background: var(--primary-soft);
    border: 1px solid var(--border);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--accent);
    letter-spacing: 0.04em;
  }

  .review-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text);
  }
  .review-meta {
    font-size: 0.78rem;
    color: var(--text-dim);
  }

  @media (max-width: 768px) {
    .reviews-section { padding: 60px 0; }
    .reviews-grid { grid-template-columns: 1fr; }
  }

  /* ========================================
     LOCATION / STANDORT
     ======================================== */
  .location-section {
    padding: 100px 0;
    background: var(--bg-lighter);
  }

  .location-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: start;
  }

  .location-info h2 {
    margin-bottom: 28px;
  }

  .location-detail {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 20px;
  }
  .location-detail .icon {
    width: 36px;
    height: 36px;
    background: var(--primary-soft);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .location-detail .icon svg {
    width: 18px;
    height: 18px;
    stroke: var(--accent);
    stroke-width: 1.5;
  }
  .location-detail .label {
    font-size: 0.78rem;
    color: var(--text-dim);
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .location-detail .value {
    font-size: 0.92rem;
    color: var(--text);
    font-weight: 500;
  }

  .hours-list {
    margin-top: 28px;
    padding-top: 28px;
    border-top: 1px solid var(--border);
  }
  .hours-list h3 {
    font-family: var(--font-body);
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 16px;
  }

  .hours-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--border);
  }
  .hours-item .label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.88rem;
    color: var(--text-soft);
  }
  .hours-item .label svg {
    width: 14px;
    height: 14px;
    stroke: var(--text-dim);
    stroke-width: 1.5;
  }
  .hours-item .value {
    font-family: var(--font-mono);
    font-size: 0.82rem;
    color: var(--text);
    font-weight: 500;
  }

  .location-map {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    aspect-ratio: 4/3;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }

  .map-svg {
    width: 100%;
    height: 100%;
    opacity: 0.5;
  }
  .map-block { fill: ${hexToRgba(c.colors.primary, 0.2)}; stroke: ${hexToRgba(c.colors.accent, 0.1)}; stroke-width: 1; }
  .map-road { stroke: ${hexToRgba(c.colors.accent, 0.15)}; stroke-width: 2; fill: none; }
  .map-pin { fill: var(--accent); }

  @media (max-width: 768px) {
    .location-section { padding: 60px 0; }
    .location-grid { grid-template-columns: 1fr; gap: 32px; }
  }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section {
    padding: 100px 0;
    background: var(--bg);
  }

  .faq-list {
    max-width: 780px;
    margin: 0 auto;
  }

  .faq-item {
    border-bottom: 1px solid var(--border);
  }

  .faq-q {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 20px 0;
    background: none;
    border: none;
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 600;
    color: var(--text);
    text-align: left;
    line-height: 1.4;
    transition: color var(--transition);
  }
  .faq-q:hover { color: var(--accent); }

  .faq-icon {
    font-size: 1.3rem;
    color: var(--accent);
    transition: transform var(--transition);
    flex-shrink: 0;
    margin-left: 16px;
    font-weight: 300;
  }

  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease, padding 0.4s ease;
    font-size: 0.92rem;
    color: var(--text-soft);
    line-height: 1.7;
  }

  .faq-item.open .faq-a {
    max-height: 400px;
    padding-bottom: 20px;
  }
  .faq-item.open .faq-icon { transform: rotate(45deg); }

  @media (max-width: 768px) {
    .faq-section { padding: 60px 0; }
  }

  /* ========================================
     CTA / CONTACT FORM
     ======================================== */
  .cta-section {
    padding: 100px 0;
    background: linear-gradient(180deg, var(--bg-lighter) 0%, var(--bg) 100%);
    position: relative;
  }
  .cta-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 0%, ${hexToRgba(c.colors.primary, 0.15)} 0%, transparent 70%);
    pointer-events: none;
  }

  .cta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: start;
    position: relative;
    z-index: 2;
  }

  .cta-text h2 { margin-bottom: 18px; }
  .cta-text p {
    font-size: 1.02rem;
    color: var(--text-soft);
    line-height: 1.65;
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
    font-size: 0.9rem;
    color: var(--text-soft);
  }
  .cta-feature svg {
    width: 18px;
    height: 18px;
    stroke: var(--accent);
    flex-shrink: 0;
  }

  .contact-form {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 36px;
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
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-soft);
    margin-bottom: 6px;
    font-family: var(--font-mono);
    letter-spacing: 0.03em;
  }

  .form-field input,
  .form-field select,
  .form-field textarea {
    width: 100%;
    padding: 12px 16px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.92rem;
    transition: border-color var(--transition);
    outline: none;
  }
  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-soft);
  }
  .form-field textarea { resize: vertical; min-height: 120px; }
  .form-field select { cursor: pointer; }

  .form-submit {
    width: 100%;
    padding: 14px;
    background: var(--primary);
    color: var(--text);
    border: 1px solid ${hexToRgba(c.colors.accent, 0.2)};
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition);
    margin-top: 8px;
  }
  .form-submit:hover {
    background: var(--primary-light);
    box-shadow: 0 4px 20px ${hexToRgba(c.colors.primary, 0.35)};
  }

  @media (max-width: 768px) {
    .cta-section { padding: 60px 0; }
    .cta-grid { grid-template-columns: 1fr; gap: 40px; }
    .form-row { grid-template-columns: 1fr; }
    .contact-form { padding: 24px; }
  }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    padding: 64px 0 32px;
    background: var(--bg);
    border-top: 1px solid var(--border);
  }

  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 48px;
    margin-bottom: 48px;
  }

  .footer-brand {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 12px;
  }

  .footer-desc {
    font-size: 0.88rem;
    color: var(--text-soft);
    line-height: 1.6;
    max-width: 320px;
  }

  .footer-col-title {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-dim);
    margin-bottom: 16px;
  }

  .footer-links {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .footer-links a {
    font-size: 0.88rem;
    color: var(--text-soft);
    transition: color var(--transition);
  }
  .footer-links a:hover { color: var(--accent); }

  .footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 24px;
    border-top: 1px solid var(--border);
    font-size: 0.78rem;
    color: var(--text-dim);
  }
  .footer-bottom a {
    color: var(--text-dim);
    transition: color var(--transition);
  }
  .footer-bottom a:hover { color: var(--accent); }

  @media (max-width: 768px) {
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
  }

  /* ========================================
     MOBILE CTA
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 999;
    background: var(--primary);
    color: var(--text);
    text-align: center;
    padding: 16px;
    font-weight: 600;
    font-size: 0.95rem;
    border-top: 1px solid ${hexToRgba(c.colors.accent, 0.2)};
    transition: background var(--transition);
  }
  .mobile-cta:hover { background: var(--primary-light); }

  @media (max-width: 768px) {
    .mobile-cta { display: block; }
    body { padding-bottom: 56px; }
  }

  /* ========================================
     ABOUT STATS
     ======================================== */
  .about-stats {
    display: flex;
    gap: 32px;
    flex-wrap: wrap;
    margin-top: 32px;
  }
  .about-stat .num {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent);
    line-height: 1.1;
  }
  .about-stat .label {
    font-size: 0.82rem;
    color: var(--text-dim);
    margin-top: 4px;
  }
</style>
</head>
<body>

<!-- ====== NAVIGATION ====== -->
${c.announceText ? `<div class="announce-bar">${esc(c.announceText)}</div>` : ''}

<nav>
  <div class="container nav-inner">
    <a href="#" class="nav-brand">
      <div class="nav-logo">${logoInitial}</div>
      ${esc(c.businessName)}
    </a>

    <button class="nav-toggle" id="nav-toggle" aria-label="Navigation">
      <span></span><span></span><span></span>
    </button>

    <ul class="nav-links" id="nav-links">
      <li><a href="#spezialisierung">Spezialisierung</a></li>
      <li><a href="#services">Services</a></li>
      <li><a href="#technik">Technik</a></li>
      <li><a href="#team">Team</a></li>
      <li><a href="#bewertungen">Bewertungen</a></li>
      <li><a href="#contact" class="nav-cta">${esc(c.ctaText)}</a></li>
    </ul>
  </div>
</nav>

<!-- ====== HERO ====== -->
<section class="hero">
  <div class="container">
    <div class="hero-grid">
      <div class="hero-content">
        <div class="hero-tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          ${esc(c.heroTag)}
        </div>
        <h1>${c.heroHeadline} <em>${esc(c.heroAccent)}</em></h1>
        <p class="hero-lead">${esc(c.heroLead)}</p>
        <div class="hero-actions">
          <a href="#contact" class="btn-primary">${esc(c.ctaText)} &rarr;</a>
          <a href="#services" class="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            Services entdecken
          </a>
        </div>
      </div>

      <div class="hero-visual">
        <div class="hero-badge">
          <svg viewBox="0 0 24 24" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          BMW-Spezialist
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ====== SPECIALIZATIONS ====== -->
${c.specializations.length > 0 ? `<section id="spezialisierung" class="specializations">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.specSectionTitle || 'Spezialisierung')}</span>
      <h2 class="display">${c.specSectionSubtitle || 'Unsere <em>BMW-Kompetenz</em>'}</h2>
      <p>Jahrzehnte Erfahrung mit allen BMW-Baureihen &mdash; vom Klassiker bis zum Elektroantrieb.</p>
    </div>
    <div class="spec-grid">
      ${specsHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== SERVICES ====== -->
${c.serviceCategories.length > 0 ? `<section id="services" class="services">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.serviceSectionTitle || 'Services &amp; Preise')}</span>
      <h2 class="display">${c.serviceSectionSubtitle || 'Transparente <em>Werkstattpreise</em>'}</h2>
      <p>Faire Konditionen f&uuml;r erstklassige Arbeit. Alle Preise inkl. MwSt.</p>
    </div>
    <div class="service-tabs">
      ${serviceTabs}
    </div>
    ${serviceItemsHtml}
  </div>
</section>` : ''}

<!-- ====== EQUIPMENT / TECHNIK ====== -->
${c.equipment.length > 0 ? `<section id="technik" class="equipment">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.equipmentSectionTitle || 'Technik-Ausstattung')}</span>
      <h2 class="display">${c.equipmentSectionSubtitle || 'Modernste <em>Werkstatt-Technologie</em>'}</h2>
      <p>BMW-spezifische Diagnose- und Pr&uuml;ftechnik f&uuml;r pr&auml;zise Ergebnisse.</p>
    </div>
    <div class="equip-grid">
      ${equipmentHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== TEAM ====== -->
${c.team.length > 0 ? `<section id="team" class="team-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.teamSectionTitle || 'Meister &amp; Team')}</span>
      <h2 class="display">${c.teamSectionSubtitle || 'Die <em>Spezialisten</em> hinter der Arbeit'}</h2>
      <p>KFZ-Meister und Techniker mit BMW-Spezialisierung und jahrelanger Erfahrung.</p>
    </div>
    <div class="team-grid">
      ${teamHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== REVIEWS ====== -->
${c.reviews.length > 0 ? `<section id="bewertungen" class="reviews-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.reviewsSectionTitle || 'Kundenstimmen')}</span>
      <h2 class="display">Was unsere <em>Kunden</em> sagen</h2>
    </div>
    <div class="reviews-grid">
      ${reviewsHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== STANDORT ====== -->
<section id="standort" class="location-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.locationTitle || 'Standort')}</span>
      <h2 class="display">${c.locationSubtitle || `Besuchen Sie <em>${esc(c.businessName)}</em>`}</h2>
    </div>
    <div class="location-grid">
      <div class="location-info">
        ${c.address ? `<div class="location-detail">
          <div class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div>
            <div class="label">Adresse</div>
            <div class="value">${esc(c.address)}</div>
          </div>
        </div>` : ''}

        ${c.phone ? `<div class="location-detail">
          <div class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div>
            <div class="label">Telefon</div>
            <div class="value"><strong>${esc(c.phone)}</strong></div>
          </div>
        </div>` : ''}

        ${c.email ? `<div class="location-detail">
          <div class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
          </div>
          <div>
            <div class="label">E-Mail</div>
            <div class="value"><strong>${esc(c.email)}</strong></div>
          </div>
        </div>` : ''}

        ${locationDetailsHtml}

        ${c.openingHours.length > 0 ? `<div class="hours-list">
          <h3>&Ouml;ffnungszeiten</h3>
          ${hoursHtml}
        </div>` : ''}
      </div>

      <div class="location-map">
        <svg class="map-svg" viewBox="0 0 600 460" preserveAspectRatio="xMidYMid slice">
          <rect class="map-block" x="40"  y="40"  width="120" height="80"  rx="4"/>
          <rect class="map-block" x="200" y="30"  width="160" height="100" rx="4"/>
          <rect class="map-block" x="420" y="50"  width="140" height="70"  rx="4"/>
          <rect class="map-block" x="60"  y="180" width="100" height="120" rx="4"/>
          <rect class="map-block" x="220" y="200" width="180" height="90"  rx="4"/>
          <rect class="map-block" x="440" y="170" width="120" height="130" rx="4"/>
          <rect class="map-block" x="40"  y="350" width="150" height="80"  rx="4"/>
          <rect class="map-block" x="240" y="340" width="140" height="90"  rx="4"/>
          <rect class="map-block" x="430" y="350" width="130" height="80"  rx="4"/>
          <path class="map-road" d="M0 160 L600 160"/>
          <path class="map-road" d="M0 330 L600 330"/>
          <path class="map-road" d="M180 0 L180 460"/>
          <path class="map-road" d="M410 0 L410 460"/>
          <circle class="map-pin" cx="300" cy="245" r="8"/>
          <circle cx="300" cy="245" r="16" fill="none" stroke="${esc(c.colors.accent)}" stroke-width="2" opacity="0.4"/>
        </svg>
      </div>
    </div>
  </div>
</section>

<!-- ====== FAQ ====== -->
${(c.faqItems || []).length > 0 ? `<section id="faq" class="faq-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">H&auml;ufige Fragen</span>
      <h2 class="display">Gut zu <em>wissen</em></h2>
    </div>
    <div class="faq-list">
      ${faqHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== CTA / CONTACT FORM ====== -->
${c.contactEnabled !== false ? `<section id="contact" class="cta-section">
  <div class="container cta-grid">
    <div class="cta-text">
      <span class="eyebrow" style="color: var(--accent); display:block; margin-bottom:16px;">${esc(c.ctaSectionTitle || 'Termin vereinbaren')}</span>
      <h2 class="display">${c.ctaSectionSubtitle || 'Schreiben Sie <em>uns</em>.'}</h2>
      <p>Ob Inspektion, Diagnose oder eine Frage zu Ihrem BMW &mdash; unser Werkstatt-Team ist f&uuml;r Sie da.</p>

      ${ctaFeaturesHtml.length > 0 ? `<div class="cta-features">${ctaFeaturesHtml}</div>` : `
      <div class="cta-features">
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Kostenlose Erstberatung
        </div>
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Verbindlicher Kostenvoranschlag
        </div>
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          R&uuml;ckmeldung innerhalb von 24h
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
            <option>Inspektion / Wartung</option>
            <option>Motor / Getriebe</option>
            <option>Bremsen / Fahrwerk</option>
            <option>Diagnose / Fehlerspeicher</option>
            <option>Oldtimer-Restaurierung</option>
            <option>Elektro / Hybrid</option>
            <option>Allgemeine Anfrage</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label>BMW-Modell (optional)</label>
          <input type="text" name="modell" placeholder="z.B. 3er G20, M3, E30">
        </div>
        <div class="form-field">
          <label>Baujahr (optional)</label>
          <input type="text" name="baujahr" placeholder="z.B. 2022">
        </div>
      </div>

      <div class="form-row full">
        <div class="form-field">
          <label>Ihre Nachricht</label>
          <textarea name="message" rows="4" placeholder="Beschreiben Sie Ihr Anliegen..."></textarea>
        </div>
      </div>

      <button type="submit" class="form-submit" id="contact-submit">Anfrage senden &rarr;</button>
    </form>
  </div>
</section>` : ''}

<!-- ====== FOOTER ====== -->
<footer>
  <div class="container">
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
  </div>
</footer>

<!-- Sticky Mobile CTA -->
<a href="${esc(c.bookingUrl || '#contact')}" class="mobile-cta">${esc(c.ctaText)} &rarr;</a>

<script>
  /* Mobile Nav Toggle */
  document.getElementById('nav-toggle').addEventListener('click', function() {
    document.getElementById('nav-links').classList.toggle('open');
  });

  /* Service Tabs */
  document.querySelectorAll('.service-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.service-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var catIdx = tab.getAttribute('data-cat');
      document.querySelectorAll('.service-category').forEach(function(c) {
        c.style.display = c.getAttribute('data-cat-content') === catIdx ? '' : 'none';
      });
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
        nav.style.boxShadow = '0 4px 20px ${hexToRgba(c.colors.background, 0.3)}';
      } else {
        nav.style.boxShadow = 'none';
      }
    });
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
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:var(--text);font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:var(--text-soft);font-size:1.05rem">Wir melden uns in K\\u00fcrze bei Ihnen.</p></div>';
          } else {
            alert(d.error || 'Fehler beim Senden');
            btn.textContent = 'Anfrage senden';
            btn.disabled = false;
          }
        })
        .catch(function() {
          alert('Verbindungsfehler');
          btn.textContent = 'Anfrage senden';
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
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba(c.colors.background, 0.97)};backdrop-filter:blur(12px);color:var(--text);padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:var(--text-soft)">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--accent);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--primary);color:var(--text);border:1px solid ${hexToRgba(c.colors.accent, 0.2)};padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
