export interface FriseurDamenConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Aubergine
    accent: string     // Champagner
    background: string // Cream
    text: string       // Dark text
  }
  phone?: string
  email?: string
  address?: string
  openingHours: { days: string; hours: string }[]
  serviceCategories: {
    name: string
    items: { name: string; description: string; price: string; duration?: string; tag?: string }[]
  }[]
  stylists: {
    name: string
    role: string
    qualifications: string[]
    specialties?: string[]
    imageUrl?: string
  }[]
  certifications: { name: string; brand: string; description: string; imageUrl?: string }[]
  reviews: { text: string; name: string; source: string; rating: number }[]
  galleryItems?: { label: string; imageUrl?: string }[]
  heroImageUrl?: string
  aboutTitle?: string
  aboutText?: string
  aboutText2?: string
  aboutStats?: { value: string; label: string }[]
  features?: { icon: string; title: string; description: string }[]
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
  stylistsSectionTitle?: string
  stylistsSectionSubtitle?: string
  gallerySectionTitle?: string
  gallerySectionSubtitle?: string
  certSectionTitle?: string
  certSectionSubtitle?: string
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
  return Array(count).fill(star).join('\n            ')
}

export function renderFriseurDamenTemplate(config: FriseurDamenConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primaryDark = darkenHex(c.colors.primary, 0.25)
  const primarySoft = hexToRgba(c.colors.primary, 0.12)
  const accentDark = darkenHex(c.colors.accent, 0.3)
  const bgTint = tintHex(c.colors.background, -0.03)
  const bgWarm = tintHex(c.colors.background, -0.06)
  const textSoft = tintHex(c.colors.text, 0.5)
  const borderColor = tintHex(c.colors.background, -0.1)
  const primaryLight = tintHex(c.colors.primary, 0.85)

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
            ${item.tag ? `<div class="tags"><span class="tag${item.tag.toLowerCase() === 'neu' ? ' new' : item.tag.toLowerCase() === 'bestseller' ? ' bestseller' : item.tag.toLowerCase() === 'premium' ? ' premium' : ''}">${esc(item.tag)}</span></div>` : ''}
          </div>
          <div class="service-item-price">${esc(item.price)}</div>
        </div>`).join('')}
      </div>
    </div>`
  ).join('\n')

  // Stylists HTML
  const stylistsHtml = c.stylists.map((s, idx) => {
    const initials = s.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    const gradients = [
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 100%)`,
      `linear-gradient(135deg, ${c.colors.accent} 0%, ${accentDark} 100%)`,
      `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.3)} 0%, ${c.colors.primary} 100%)`,
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${c.colors.accent} 100%)`,
    ]
    const bg = s.imageUrl
      ? `background-image:url('${esc(s.imageUrl)}');background-size:cover;background-position:center`
      : `background:${gradients[idx % gradients.length]}`
    return `
      <div class="stylist-card">
        <div class="stylist-portrait" style="${bg}">
          ${!s.imageUrl ? `<span class="stylist-initials">${esc(initials)}</span>` : ''}
        </div>
        <div class="stylist-info">
          <h4>${esc(s.name)}</h4>
          <span class="stylist-role">${esc(s.role)}</span>
          ${s.qualifications.length > 0 ? `<div class="stylist-quals">
            ${s.qualifications.map(q => `<span class="qual-badge">${esc(q)}</span>`).join('\n            ')}
          </div>` : ''}
          ${(s.specialties || []).length > 0 ? `<div class="stylist-specs">
            ${(s.specialties || []).map(sp => `<span class="spec-tag">${esc(sp)}</span>`).join('\n            ')}
          </div>` : ''}
        </div>
      </div>`
  }).join('\n')

  // Certifications HTML
  const certsHtml = c.certifications.map((cert, idx) => {
    const gradients = [
      `linear-gradient(135deg, ${c.colors.accent} 0%, ${darkenHex(c.colors.accent, 0.2)} 100%)`,
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 100%)`,
      `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.4)} 0%, ${c.colors.primary} 100%)`,
    ]
    const bg = cert.imageUrl
      ? `background-image:url('${esc(cert.imageUrl)}');background-size:cover;background-position:center`
      : `background:${gradients[idx % gradients.length]}`
    return `
      <div class="cert-card">
        <div class="cert-icon-area" style="${bg}">
          ${!cert.imageUrl ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 15l-2 5 2-1.5L14 20l-2-5z"/><circle cx="12" cy="9" r="6"/><path d="M9 9l2 2 4-4"/></svg>` : ''}
        </div>
        <div class="cert-info">
          <span class="cert-brand">${esc(cert.brand)}</span>
          <h4>${esc(cert.name)}</h4>
          <p>${esc(cert.description)}</p>
        </div>
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
        <p class="review-text">&bdquo;${esc(r.text)}&ldquo;</p>
        <div class="review-author">
          <div class="review-avatar">${esc(initials)}</div>
          <div>
            <div class="review-name">${esc(r.name)}</div>
            <div class="review-meta">${esc(r.source)}</div>
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

  // Gallery items
  const galleryItems = c.galleryItems || [
    { label: 'Balayage Naturel' },
    { label: 'Ombr\u00e9 Highlights' },
    { label: 'Trockenschnitt' },
    { label: 'Bond-Treatment' },
    { label: 'Glanzversiegelung' },
    { label: 'Brautstyling' },
  ]
  const galleryLetters = ['a', 'b', 'c', 'd', 'e', 'f']
  const defaultGradients = [
    `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 60%, ${darkenHex(c.colors.primary, 0.4)} 100%)`,
    `linear-gradient(135deg, ${c.colors.accent} 0%, ${darkenHex(c.colors.accent, 0.3)} 100%)`,
    `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.2)} 0%, ${c.colors.primary} 100%)`,
    `linear-gradient(135deg, ${c.colors.accent} 0%, ${c.colors.primary} 100%)`,
    `linear-gradient(135deg, ${textSoft} 0%, ${darkenHex(c.colors.primary, 0.15)} 100%)`,
    `linear-gradient(135deg, ${primaryLight} 0%, ${c.colors.accent} 100%)`,
  ]
  const galleryHtml = galleryItems.slice(0, 6).map((item, i) => {
    const letter = galleryLetters[i] || 'a'
    const bg = item.imageUrl
      ? `background-image:url('${esc(item.imageUrl)}');background-size:cover;background-position:center`
      : `background:${defaultGradients[i] || defaultGradients[0]}`
    return `<div class="gallery-item ${letter}" style="${bg}"><div class="caption">${esc(item.label)}</div></div>`
  }).join('\n      ')

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
    { title: 'Salon', links: [
      { label: 'Services', href: '#services' },
      { label: 'Team', href: '#team' },
      { label: 'Galerie', href: '#galerie' },
    ]},
    { title: 'Besuch', links: [
      { label: 'Kontakt', href: '#contact' },
      { label: 'Anfahrt', href: '#location' },
    ]},
  ]
  const footerColumnsHtml = footerColumns.map(col => `
      <div class="footer-col">
        <h4>${esc(col.title)}</h4>
        <ul>
          ${col.links.map(l => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('\n          ')}
        </ul>
      </div>`).join('')

  // Features (USP)
  const features = c.features || [
    { icon: 'scissors', title: 'Pr&auml;zisionsschnitt', description: 'Trockenschnitt-Technik nach Sassoon-Akademie f&uuml;r perfekte Proportionen' },
    { icon: 'color', title: 'Farbexpertise', description: 'Balayage, Ombr&eacute; &amp; Str&auml;hnchen mit Wella Koleston &amp; L&#039;Or&eacute;al Majirel' },
    { icon: 'star', title: 'Bond-Treatment', description: 'Olaplex &amp; K&eacute;rastase Glanzversiegelung f&uuml;r gesundes, gl&auml;nzendes Haar' },
  ]
  const featuresHtml = features.map(f => `
      <div class="feature-card">
        <div class="feature-icon">
          ${f.icon === 'scissors' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>'
          : f.icon === 'color' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>'
          : f.icon === 'star' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z"/></svg>'
          : f.icon === 'leaf' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>'}
        </div>
        <h4>${f.title}</h4>
        <p>${f.description}</p>
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

<!-- Schema.org HairSalon -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HairSalon",
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
    "name": "Salon-Services",
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
    --aubergine:      ${esc(c.colors.primary)};
    --aubergine-dark: ${primaryDark};
    --aubergine-soft: ${primarySoft};
    --aubergine-light:${primaryLight};
    --champagner:     ${esc(c.colors.accent)};
    --champagner-dark:${accentDark};
    --cream:          ${esc(c.colors.background)};
    --cream-tint:     ${bgTint};
    --cream-warm:     ${bgWarm};
    --ink:            ${esc(c.colors.text)};
    --ink-soft:       ${textSoft};
    --border:         ${borderColor};

    --shadow-card: 0 12px 32px ${hexToRgba(c.colors.text, 0.08)};
    --shadow-image: 0 20px 60px ${hexToRgba(c.colors.text, 0.18)};
    --shadow-glow: 0 0 40px ${hexToRgba(c.colors.primary, 0.15)};

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
    line-height: 1.5;
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
    color: var(--aubergine);
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }

  .eyebrow {
    color: var(--champagner-dark);
    font-family: var(--font-mono);
    font-weight: 500;
    font-size: 12px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .container { max-width: 1280px; margin: 0 auto; padding: 0 32px; position: relative; }
  section { padding: 96px 0; position: relative; }

  /* ========================================
     ANNOUNCEMENT BAR
     ======================================== */
  .announce {
    background: var(--aubergine);
    color: var(--cream);
    text-align: center;
    padding: 10px 16px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }
  .announce strong { color: var(--champagner); }

  /* ========================================
     NAV
     ======================================== */
  nav {
    position: sticky; top: 0; z-index: 50;
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
    font-size: 24px;
    letter-spacing: -0.02em;
    display: flex; align-items: center; gap: 10px;
    font-variation-settings: "opsz" 144, "SOFT" 80;
    font-style: italic;
  }
  .logo-mark {
    width: 38px; height: 38px;
    background: var(--aubergine);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: var(--cream);
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 18px;
    font-style: italic;
    transform: rotate(-3deg);
  }
  .nav-links { display: flex; gap: 32px; font-size: 15px; font-weight: 500; }
  .nav-links a { transition: color 0.2s; color: var(--ink); }
  .nav-links a:hover { color: var(--champagner-dark); }
  .nav-cta {
    background: var(--aubergine); color: var(--cream);
    padding: 12px 22px; border-radius: 999px;
    font-size: 13px; font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: all 0.3s var(--spring);
    display: inline-flex; align-items: center; gap: 8px;
  }
  .nav-cta:hover { background: var(--champagner); color: var(--aubergine-dark); transform: translateY(-1px); }
  .nav-cta svg { width: 14px; height: 14px; }

  /* Mobile hamburger */
  .nav-toggle { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
  .nav-toggle svg { width: 28px; height: 28px; stroke: var(--ink); }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    background: var(--cream);
    padding: 60px 0 80px;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.primary, 0.06)} 0%, transparent 70%);
    top: -200px; right: -100px;
    pointer-events: none;
  }
  .hero::after {
    content: '';
    position: absolute;
    width: 400px; height: 400px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.accent, 0.08)} 0%, transparent 70%);
    bottom: -100px; left: -50px;
    pointer-events: none;
  }
  .hero-inner {
    max-width: 1280px; margin: 0 auto; padding: 0 32px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 64px;
    align-items: center;
  }
  .hero-tag {
    display: inline-flex; align-items: center; gap: 8px;
    color: var(--champagner-dark);
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    margin-bottom: 24px;
  }
  .hero-tag::before {
    content: '';
    width: 32px; height: 1px;
    background: var(--champagner);
  }
  .hero h1 {
    font-size: clamp(2.8rem, 5vw, 4.2rem);
    margin-bottom: 24px;
    color: var(--ink);
  }
  .hero h1 em {
    color: var(--aubergine);
  }
  .hero-lead {
    font-size: 1.15rem;
    color: var(--ink-soft);
    line-height: 1.7;
    margin-bottom: 36px;
    max-width: 520px;
  }
  .hero-actions {
    display: flex; gap: 16px; align-items: center; flex-wrap: wrap;
  }
  .btn-primary {
    background: var(--aubergine); color: var(--cream);
    padding: 16px 32px; border-radius: 999px;
    font-size: 14px; font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: all 0.3s var(--spring);
    display: inline-flex; align-items: center; gap: 10px;
    border: none; cursor: pointer;
  }
  .btn-primary:hover { background: var(--champagner); color: var(--aubergine-dark); transform: translateY(-2px); box-shadow: var(--shadow-glow); }
  .btn-primary svg { width: 16px; height: 16px; }
  .btn-secondary {
    color: var(--ink); padding: 16px 24px;
    font-size: 14px; font-weight: 600;
    transition: color 0.2s;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-secondary:hover { color: var(--aubergine); }
  .btn-secondary svg { width: 16px; height: 16px; }

  .hero-image-col {
    position: relative;
  }
  .hero-image-frame {
    width: 100%;
    aspect-ratio: 4/5;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: var(--shadow-image);
    position: relative;
  }
  .hero-image-frame .placeholder {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 60%, ${darkenHex(c.colors.primary, 0.4)} 100%);
    display: flex; align-items: center; justify-content: center;
  }
  .hero-image-frame .placeholder svg {
    width: 80px; height: 80px; stroke: ${hexToRgba(c.colors.background, 0.3)};
  }
  .hero-image-frame img {
    width: 100%; height: 100%; object-fit: cover;
  }
  .hero-float-badge {
    position: absolute; bottom: -20px; left: -20px;
    background: var(--champagner);
    color: var(--aubergine-dark);
    padding: 16px 24px;
    border-radius: 16px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    box-shadow: var(--shadow-card);
    display: flex; align-items: center; gap: 10px;
    z-index: 2;
  }
  .hero-float-badge svg { width: 20px; height: 20px; }

  /* ========================================
     FEATURES / USP
     ======================================== */
  .features-section {
    background: var(--cream-tint);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 80px 0;
  }
  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;
  }
  .feature-card {
    background: var(--cream);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 36px 28px;
    transition: all 0.3s var(--smooth);
  }
  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
    border-color: var(--champagner);
  }
  .feature-icon {
    width: 52px; height: 52px;
    background: var(--aubergine-soft);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
  }
  .feature-icon svg {
    width: 24px; height: 24px;
    stroke: var(--aubergine);
  }
  .feature-card h4 {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 600;
    margin-bottom: 8px;
    letter-spacing: -0.01em;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .feature-card p {
    color: var(--ink-soft);
    font-size: 0.92rem;
    line-height: 1.6;
  }

  /* ========================================
     SERVICES
     ======================================== */
  .services-section {
    background: var(--cream);
    padding: 96px 0;
  }
  .section-header {
    text-align: center;
    margin-bottom: 56px;
  }
  .section-header .eyebrow {
    display: block;
    margin-bottom: 16px;
  }
  .section-header h2 {
    font-size: clamp(2rem, 3.5vw, 2.8rem);
    margin-bottom: 16px;
  }
  .section-header p {
    color: var(--ink-soft);
    font-size: 1.05rem;
    max-width: 560px;
    margin: 0 auto;
    line-height: 1.7;
  }
  .service-tabs {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 40px;
    flex-wrap: wrap;
  }
  .service-tab {
    background: var(--cream-tint);
    border: 1px solid var(--border);
    padding: 10px 22px;
    border-radius: 999px;
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--ink-soft);
  }
  .service-tab.active {
    background: var(--aubergine);
    color: var(--cream);
    border-color: var(--aubergine);
  }
  .service-tab:hover:not(.active) {
    border-color: var(--champagner);
    color: var(--ink);
  }
  .service-grid {
    display: grid; gap: 1px;
    background: var(--border);
    border-radius: 16px;
    overflow: hidden;
  }
  .service-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 24px 28px;
    background: var(--cream);
    gap: 20px;
    transition: background 0.2s;
  }
  .service-item:hover {
    background: var(--cream-tint);
  }
  .service-item-info h4 {
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 600;
    margin-bottom: 4px;
    letter-spacing: -0.01em;
    font-variation-settings: "opsz" 48, "SOFT" 40;
  }
  .service-item-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 4px;
  }
  .service-duration {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-soft);
    background: var(--cream-tint);
    border: 1px solid var(--border);
    padding: 2px 10px;
    border-radius: 999px;
    letter-spacing: 0.04em;
  }
  .service-item-info p {
    color: var(--ink-soft);
    font-size: 0.9rem;
    line-height: 1.5;
  }
  .service-item-price {
    font-family: var(--font-mono);
    font-weight: 600;
    font-size: 1rem;
    color: var(--aubergine);
    white-space: nowrap;
    letter-spacing: -0.02em;
    min-width: 80px;
    text-align: right;
  }
  .tags { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
  .tag {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 999px;
    background: var(--cream-tint);
    color: var(--ink-soft);
    border: 1px solid var(--border);
  }
  .tag.new { background: var(--aubergine); color: var(--cream); border-color: var(--aubergine); }
  .tag.bestseller { background: var(--champagner); color: var(--aubergine-dark); border-color: var(--champagner); }
  .tag.premium { background: ${hexToRgba(c.colors.primary, 0.1)}; color: var(--aubergine); border-color: ${hexToRgba(c.colors.primary, 0.2)}; }

  /* ========================================
     STYLISTS / TEAM
     ======================================== */
  .stylists-section {
    background: var(--cream-tint);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 96px 0;
  }
  .stylists-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 32px;
  }
  .stylist-card {
    background: var(--cream);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.3s var(--smooth);
  }
  .stylist-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
    border-color: var(--champagner);
  }
  .stylist-portrait {
    width: 100%;
    aspect-ratio: 3/4;
    display: flex; align-items: center; justify-content: center;
    position: relative;
    background-size: cover;
    background-position: center;
  }
  .stylist-initials {
    font-family: var(--font-display);
    font-size: 3rem;
    font-weight: 600;
    color: ${hexToRgba(c.colors.background, 0.5)};
    font-style: italic;
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }
  .stylist-info {
    padding: 24px;
  }
  .stylist-info h4 {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 4px;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .stylist-role {
    display: block;
    color: var(--champagner-dark);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .stylist-quals {
    display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;
  }
  .qual-badge {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.04em;
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--aubergine);
    color: var(--cream);
  }
  .stylist-specs {
    display: flex; flex-wrap: wrap; gap: 6px;
  }
  .spec-tag {
    font-size: 12px;
    color: var(--ink-soft);
    background: var(--cream-tint);
    border: 1px solid var(--border);
    padding: 3px 10px;
    border-radius: 999px;
  }

  /* ========================================
     GALLERY
     ======================================== */
  .gallery-section {
    background: var(--cream);
    padding: 96px 0;
  }
  .gallery-mosaic {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 240px);
    gap: 16px;
    border-radius: 20px;
    overflow: hidden;
  }
  .gallery-item {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    background-size: cover;
    background-position: center;
    display: flex; align-items: flex-end;
    transition: transform 0.3s var(--smooth);
  }
  .gallery-item:hover { transform: scale(1.02); }
  .gallery-item .caption {
    width: 100%;
    padding: 16px 20px;
    background: linear-gradient(to top, ${hexToRgba(c.colors.primary, 0.85)} 0%, transparent 100%);
    color: var(--cream);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .gallery-item.a { grid-column: 1 / 3; grid-row: 1; }
  .gallery-item.b { grid-column: 3; grid-row: 1; }
  .gallery-item.c { grid-column: 1; grid-row: 2; }
  .gallery-item.d { grid-column: 2; grid-row: 2; }
  .gallery-item.e { grid-column: 3; grid-row: 2; }
  .gallery-item.f { grid-column: 1 / 4; }

  /* ========================================
     CERTIFICATIONS
     ======================================== */
  .certs-section {
    background: var(--aubergine);
    color: var(--cream);
    padding: 96px 0;
    position: relative;
    overflow: hidden;
  }
  .certs-section::before {
    content: '';
    position: absolute;
    width: 500px; height: 500px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.accent, 0.1)} 0%, transparent 70%);
    top: -200px; right: -100px;
    pointer-events: none;
  }
  .certs-section .section-header .eyebrow { color: var(--champagner); }
  .certs-section .section-header h2 { color: var(--cream); }
  .certs-section .section-header p { color: ${hexToRgba(c.colors.background, 0.7)}; }
  .certs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }
  .cert-card {
    background: ${hexToRgba(c.colors.background, 0.08)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.12)};
    border-radius: 20px;
    overflow: hidden;
    display: flex;
    align-items: stretch;
    transition: all 0.3s var(--smooth);
  }
  .cert-card:hover {
    background: ${hexToRgba(c.colors.background, 0.12)};
    transform: translateY(-2px);
    border-color: var(--champagner);
  }
  .cert-icon-area {
    width: 100px;
    min-height: 120px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    background-size: cover;
    background-position: center;
  }
  .cert-icon-area svg {
    width: 40px; height: 40px;
    stroke: var(--champagner);
  }
  .cert-info {
    padding: 24px;
    flex: 1;
  }
  .cert-brand {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--champagner);
    margin-bottom: 6px;
    display: block;
  }
  .cert-info h4 {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 6px;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .cert-info p {
    color: ${hexToRgba(c.colors.background, 0.65)};
    font-size: 0.88rem;
    line-height: 1.5;
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews-section {
    background: var(--cream-tint);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 96px 0;
  }
  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
  }
  .review-card {
    background: var(--cream);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px 28px;
    transition: all 0.3s var(--smooth);
  }
  .review-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-card);
    border-color: var(--champagner);
  }
  .review-stars {
    display: flex; gap: 3px; margin-bottom: 16px;
  }
  .review-stars svg {
    width: 16px; height: 16px;
    fill: var(--champagner);
    stroke: none;
  }
  .review-text {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--ink);
    margin-bottom: 20px;
    font-style: italic;
  }
  .review-author {
    display: flex; align-items: center; gap: 12px;
  }
  .review-avatar {
    width: 40px; height: 40px;
    background: var(--aubergine);
    color: var(--cream);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
  .review-name {
    font-weight: 600;
    font-size: 0.92rem;
  }
  .review-meta {
    color: var(--ink-soft);
    font-size: 0.82rem;
    font-family: var(--font-mono);
    letter-spacing: 0.02em;
  }

  /* ========================================
     ABOUT
     ======================================== */
  .about-section {
    background: var(--cream);
    padding: 96px 0;
  }
  .about-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
  }
  .about-content .eyebrow { display: block; margin-bottom: 16px; }
  .about-content h2 {
    font-size: clamp(1.8rem, 3vw, 2.4rem);
    margin-bottom: 24px;
  }
  .about-content p {
    color: var(--ink-soft);
    font-size: 1rem;
    line-height: 1.7;
    margin-bottom: 16px;
  }
  .about-stats {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 32px;
  }
  .about-stat .num {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 700;
    color: var(--aubergine);
    font-variation-settings: "opsz" 144, "SOFT" 30;
  }
  .about-stat .label {
    color: var(--ink-soft);
    font-size: 0.82rem;
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-top: 4px;
  }
  .about-image-area {
    position: relative;
  }
  .about-image-frame {
    width: 100%;
    aspect-ratio: 4/5;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: var(--shadow-image);
  }
  .about-image-frame .placeholder {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, ${c.colors.accent} 0%, ${darkenHex(c.colors.accent, 0.2)} 60%, ${c.colors.primary} 100%);
    display: flex; align-items: center; justify-content: center;
  }
  .about-image-frame .placeholder svg {
    width: 64px; height: 64px; stroke: ${hexToRgba(c.colors.background, 0.3)};
  }

  /* ========================================
     LOCATION
     ======================================== */
  .location-section {
    background: var(--cream);
    padding: 96px 0;
    border-top: 1px solid var(--border);
  }
  .location-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start;
  }
  .location-content .eyebrow { display: block; margin-bottom: 16px; }
  .location-content h2 {
    font-size: clamp(1.8rem, 3vw, 2.4rem);
    margin-bottom: 24px;
  }
  .location-details {
    display: flex; flex-direction: column; gap: 20px;
  }
  .location-detail {
    display: flex; align-items: flex-start; gap: 16px;
  }
  .location-detail .icon {
    width: 44px; height: 44px;
    background: var(--aubergine-soft);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .location-detail .icon svg {
    width: 20px; height: 20px; stroke: var(--aubergine); stroke-width: 2;
  }
  .location-detail .label {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-bottom: 2px;
  }
  .location-detail .value {
    font-size: 0.95rem;
    color: var(--ink);
    line-height: 1.5;
  }
  .hours-card {
    background: var(--cream-tint);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px;
  }
  .hours-card h3 {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 24px;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .hours-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
  }
  .hours-item:last-child { border-bottom: none; }
  .hours-item .label {
    display: flex; align-items: center; gap: 8px;
    font-size: 0.92rem; color: var(--ink-soft);
  }
  .hours-item .label svg {
    width: 16px; height: 16px; stroke: var(--champagner-dark);
  }
  .hours-item .value {
    font-weight: 600;
    font-size: 0.92rem;
    font-family: var(--font-mono);
    letter-spacing: -0.02em;
    color: var(--ink);
  }

  /* ========================================
     CTA / CONTACT FORM
     ======================================== */
  .cta-section {
    background: var(--aubergine);
    color: var(--cream);
    padding: 96px 0;
    position: relative;
    overflow: hidden;
  }
  .cta-section::before {
    content: '';
    position: absolute;
    width: 500px; height: 500px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.accent, 0.12)} 0%, transparent 70%);
    bottom: -200px; left: -100px;
    pointer-events: none;
  }
  .cta-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start;
  }
  .cta-text h2 { color: var(--cream); margin-bottom: 16px; }
  .cta-text p {
    color: ${hexToRgba(c.colors.background, 0.7)};
    font-size: 1.05rem;
    line-height: 1.7;
    margin-bottom: 24px;
  }
  .cta-features {
    display: flex; flex-direction: column; gap: 12px; margin-top: 24px;
  }
  .cta-feature {
    display: flex; align-items: center; gap: 10px;
    color: ${hexToRgba(c.colors.background, 0.85)};
    font-size: 0.95rem;
  }
  .cta-feature svg { width: 18px; height: 18px; stroke: var(--champagner); flex-shrink: 0; }

  .contact-form {
    background: ${hexToRgba(c.colors.background, 0.08)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.12)};
    border-radius: 20px;
    padding: 32px;
    position: relative;
  }
  .form-row {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;
  }
  .form-row.full { grid-template-columns: 1fr; }
  .form-field label {
    display: block;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${hexToRgba(c.colors.background, 0.6)};
    margin-bottom: 6px;
  }
  .form-field input, .form-field select, .form-field textarea {
    width: 100%;
    background: ${hexToRgba(c.colors.background, 0.06)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.12)};
    border-radius: 12px;
    padding: 12px 16px;
    color: var(--cream);
    font-family: var(--font-body);
    font-size: 0.95rem;
    transition: border-color 0.2s;
  }
  .form-field input:focus, .form-field select:focus, .form-field textarea:focus {
    outline: none;
    border-color: var(--champagner);
  }
  .form-field input::placeholder, .form-field textarea::placeholder {
    color: ${hexToRgba(c.colors.background, 0.35)};
  }
  .form-field select {
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23${c.colors.background.replace('#', '')}' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
    padding-right: 40px;
  }
  .form-field select option { background: var(--aubergine); color: var(--cream); }
  .form-field textarea { min-height: 120px; resize: vertical; }
  .form-submit {
    width: 100%;
    background: var(--champagner); color: var(--aubergine-dark);
    padding: 14px 28px;
    border: none; border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s var(--spring);
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    margin-top: 8px;
  }
  .form-submit:hover {
    background: var(--cream);
    transform: translateY(-1px);
  }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section {
    background: var(--cream);
    padding: 96px 0;
    border-top: 1px solid var(--border);
  }
  .faq-list { max-width: 760px; margin: 0 auto; }
  .faq-item {
    border-bottom: 1px solid var(--border);
  }
  .faq-q {
    width: 100%;
    padding: 20px 0;
    background: none; border: none;
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    display: flex; justify-content: space-between; align-items: center;
    gap: 16px;
    color: var(--ink);
    transition: color 0.2s;
  }
  .faq-q:hover { color: var(--aubergine); }
  .faq-icon {
    font-size: 1.4rem;
    font-weight: 300;
    transition: transform 0.3s;
    color: var(--champagner-dark);
  }
  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s, padding 0.3s;
    color: var(--ink-soft);
    font-size: 0.95rem;
    line-height: 1.7;
  }
  .faq-item.open .faq-a { max-height: 400px; padding-bottom: 20px; }
  .faq-item.open .faq-icon { transform: rotate(45deg); }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: var(--aubergine);
    color: var(--cream);
    padding: 64px 0 32px;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr repeat(2, 1fr);
    gap: 48px;
    margin-bottom: 48px;
  }
  .footer-brand {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 600;
    font-style: italic;
    margin-bottom: 12px;
    font-variation-settings: "opsz" 144, "SOFT" 80;
  }
  .footer-desc {
    color: ${hexToRgba(c.colors.background, 0.6)};
    font-size: 0.92rem;
    line-height: 1.6;
    max-width: 320px;
  }
  .footer-col h4 {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--champagner);
    margin-bottom: 16px;
  }
  .footer-col ul { list-style: none; }
  .footer-col li { margin-bottom: 10px; }
  .footer-col a {
    color: ${hexToRgba(c.colors.background, 0.6)};
    font-size: 0.92rem;
    transition: color 0.2s;
  }
  .footer-col a:hover { color: var(--cream); }
  .footer-bottom {
    border-top: 1px solid ${hexToRgba(c.colors.background, 0.1)};
    padding-top: 24px;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 0.82rem;
    color: ${hexToRgba(c.colors.background, 0.4)};
  }
  .footer-bottom a { color: ${hexToRgba(c.colors.background, 0.5)}; transition: color 0.2s; }
  .footer-bottom a:hover { color: var(--cream); }

  /* ========================================
     MOBILE CTA (Sticky)
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 40;
    background: var(--aubergine);
    color: var(--cream);
    text-align: center;
    padding: 16px 24px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: background 0.2s;
  }
  .mobile-cta:hover { background: var(--champagner); color: var(--aubergine-dark); }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .hero-inner { grid-template-columns: 1fr; gap: 40px; text-align: center; }
    .hero-lead { margin: 0 auto 36px; }
    .hero-actions { justify-content: center; }
    .hero-image-col { max-width: 400px; margin: 0 auto; }
    .hero-float-badge { left: auto; right: -10px; bottom: -15px; }
    .about-grid { grid-template-columns: 1fr; gap: 40px; }
    .about-image-area { max-width: 400px; margin: 0 auto; }
    .about-stats { grid-template-columns: repeat(3, 1fr); }
    .location-grid { grid-template-columns: 1fr; gap: 40px; }
    .cta-grid { grid-template-columns: 1fr; gap: 40px; }
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .features-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 768px) {
    section { padding: 64px 0; }
    .container { padding: 0 20px; }
    .nav-links { display: none; }
    .nav-toggle { display: block; }
    .nav-links.open {
      display: flex; flex-direction: column;
      position: absolute; top: 100%; left: 0; right: 0;
      background: var(--cream);
      border-bottom: 1px solid var(--border);
      padding: 24px 32px;
      gap: 16px;
      box-shadow: 0 8px 24px ${hexToRgba(c.colors.text, 0.1)};
    }
    .nav-cta { display: none; }
    .mobile-cta { display: block; }
    .hero { padding: 40px 0 60px; }
    .hero h1 { font-size: clamp(2rem, 8vw, 2.8rem); }
    .hero-inner { padding: 0 20px; }
    .features-grid { grid-template-columns: 1fr; }
    .gallery-mosaic {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: repeat(3, 180px);
    }
    .gallery-item.a { grid-column: 1 / 3; }
    .gallery-item.f { grid-column: 1 / 3; }
    .stylists-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
    .certs-grid { grid-template-columns: 1fr; }
    .cert-card { flex-direction: column; }
    .cert-icon-area { width: 100%; min-height: 80px; }
    .reviews-grid { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
    .section-header h2 { font-size: clamp(1.6rem, 6vw, 2.2rem); }
    body { padding-bottom: 52px; }
  }
  @media (max-width: 480px) {
    .hero-actions { flex-direction: column; width: 100%; }
    .btn-primary { width: 100%; justify-content: center; }
    .service-tabs { gap: 6px; }
    .service-tab { padding: 8px 16px; font-size: 13px; }
    .about-stats { grid-template-columns: 1fr; text-align: center; }
    .hero-float-badge { display: none; }
  }
</style>
</head>
<body>

${c.announceText ? `<!-- ====== ANNOUNCEMENT BAR ====== -->
<div class="announce">${c.announceText}</div>` : ''}

<!-- ====== NAV ====== -->
<nav>
  <div class="nav-inner">
    <a href="#" class="logo">
      <div class="logo-mark">${logoInitial}</div>
      ${esc(c.businessName)}
    </a>
    <div class="nav-links" id="nav-links">
      <a href="#services">Services</a>
      <a href="#team">Team</a>
      <a href="#galerie">Galerie</a>
      <a href="#bewertungen">Bewertungen</a>
      <a href="#contact">Kontakt</a>
    </div>
    <a href="${esc(c.bookingUrl || '#contact')}" class="nav-cta">
      ${esc(c.ctaText)}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>
    <button class="nav-toggle" id="nav-toggle" aria-label="Men&uuml; &ouml;ffnen">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
  </div>
</nav>

<!-- ====== HERO ====== -->
<section class="hero">
  <div class="hero-inner">
    <div class="hero-text">
      <div class="hero-tag">${esc(c.heroTag)}</div>
      <h1 class="display">${c.heroHeadline} <em>${c.heroAccent}</em></h1>
      <p class="hero-lead">${esc(c.heroLead)}</p>
      <div class="hero-actions">
        <a href="${esc(c.bookingUrl || '#contact')}" class="btn-primary">
          ${esc(c.ctaText)}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
        <a href="#services" class="btn-secondary">
          Services entdecken
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </a>
      </div>
    </div>
    <div class="hero-image-col">
      <div class="hero-image-frame">
        ${c.heroImageUrl
          ? `<img src="${esc(c.heroImageUrl)}" alt="${esc(c.businessName)} Salon" loading="eager">`
          : `<div class="placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>
              </svg>
            </div>`}
      </div>
      <div class="hero-float-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z"/></svg>
        Olaplex &amp; K&eacute;rastase Partner
      </div>
    </div>
  </div>
</section>

<!-- ====== FEATURES / USP ====== -->
<section class="features-section">
  <div class="container">
    <div class="features-grid">
      ${featuresHtml}
    </div>
  </div>
</section>

<!-- ====== SERVICES ====== -->
<section id="services" class="services-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">${esc(c.serviceSectionTitle || 'Unsere Services')}</span>
      <h2 class="display">${c.serviceSectionSubtitle || 'Schnitt, Farbe &amp; <em>Pflege</em>'}</h2>
      <p>Von Pr&auml;zisions-Trockenschnitt &uuml;ber Balayage bis hin zur luxuri&ouml;sen Glanzversiegelung &mdash; exklusive Treatments f&uuml;r Ihr Haar.</p>
    </div>
    <div class="service-tabs">
      ${serviceTabs}
    </div>
    ${serviceItemsHtml}
  </div>
</section>

<!-- ====== STYLISTS / TEAM ====== -->
<section id="team" class="stylists-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">${esc(c.stylistsSectionTitle || 'Unser Team')}</span>
      <h2 class="display">${c.stylistsSectionSubtitle || 'Ihre <em>Stylist:innen</em>'}</h2>
      <p>Ausgebildet an renommierten Akademien wie der Sassoon-Akademie. Spezialisiert auf Balayage, Ombr&eacute;, Trockenschnitt und Bond-Treatments.</p>
    </div>
    <div class="stylists-grid">
      ${stylistsHtml}
    </div>
  </div>
</section>

<!-- ====== GALLERY ====== -->
<section id="galerie" class="gallery-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">${esc(c.gallerySectionTitle || 'Galerie')}</span>
      <h2 class="display">${c.gallerySectionSubtitle || 'Unser <em>Portfolio</em>'}</h2>
      <p>Einblicke in unsere Arbeit &mdash; von Balayage-Transformationen bis zur perfekten Glanzversiegelung mit Schwarzkopf BlondMe.</p>
    </div>
    <div class="gallery-mosaic">
      ${galleryHtml}
    </div>
  </div>
</section>

<!-- ====== CERTIFICATIONS ====== -->
${c.certifications.length > 0 ? `<section id="zertifikate" class="certs-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">${esc(c.certSectionTitle || 'Zertifizierungen')}</span>
      <h2 class="display">${c.certSectionSubtitle || 'Gepr&uuml;fte <em>Expertise</em>'}</h2>
      <p>Zertifizierte Behandlungen mit Premium-Produkten f&uuml;r erstklassige Ergebnisse.</p>
    </div>
    <div class="certs-grid">
      ${certsHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== REVIEWS ====== -->
<section id="bewertungen" class="reviews-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">${esc(c.reviewsSectionTitle || 'Bewertungen')}</span>
      <h2 class="display">Was unsere <em>Kundinnen</em> sagen</h2>
    </div>
    <div class="reviews-grid">
      ${reviewsHtml}
    </div>
  </div>
</section>

<!-- ====== ABOUT ====== -->
${c.aboutTitle || c.aboutText ? `<section class="about-section">
  <div class="container">
    <div class="about-grid">
      <div class="about-content">
        <span class="eyebrow">&Uuml;ber uns</span>
        <h2 class="display">${c.aboutTitle || 'Willkommen bei <em>' + esc(c.businessName) + '</em>'}</h2>
        <p>${esc(c.aboutText || '')}</p>
        ${c.aboutText2 ? `<p>${esc(c.aboutText2)}</p>` : ''}
        ${aboutStatsHtml}
      </div>
      <div class="about-image-area">
        <div class="about-image-frame">
          <div class="placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>` : ''}

<!-- ====== LOCATION ====== -->
<section id="location" class="location-section">
  <div class="container">
    <div class="location-grid">
      <div class="location-content">
        <span class="eyebrow">${esc(c.locationTitle || 'Standort')}</span>
        <h2 class="display">${c.locationSubtitle || 'Besuchen Sie <em>uns</em>'}</h2>
        <div class="location-details">
          ${locationDetailsHtml.length > 0 ? locationDetailsHtml : `
          ${c.address ? `<div class="location-detail">
            <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
            <div><div class="label">Adresse</div><div class="value">${esc(c.address)}</div></div>
          </div>` : ''}
          ${c.phone ? `<div class="location-detail">
            <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
            <div><div class="label">Telefon</div><div class="value">${esc(c.phone)}</div></div>
          </div>` : ''}
          ${c.email ? `<div class="location-detail">
            <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg></div>
            <div><div class="label">E-Mail</div><div class="value">${esc(c.email)}</div></div>
          </div>` : ''}`}
        </div>
      </div>
      <div class="hours-card">
        <h3>&Ouml;ffnungszeiten</h3>
        ${hoursHtml}
      </div>
    </div>
  </div>
</section>

<!-- ====== CTA / CONTACT FORM ====== -->
${c.contactEnabled !== false ? `<section id="contact" class="cta-section">
  <div class="container cta-grid">
    <div class="cta-text">
      <span class="eyebrow" style="color: var(--champagner); display:block; margin-bottom:16px;">${esc(c.ctaSectionTitle || 'Termin vereinbaren')}</span>
      <h2 class="display">${c.ctaSectionSubtitle || 'Schreiben Sie <em>uns</em>.'}</h2>
      <p>Ob Beratung, Terminwunsch oder eine Frage zu unseren Balayage- und Coloration-Techniken &mdash; wir freuen uns auf Ihre Nachricht.</p>

      ${ctaFeaturesHtml.length > 0 ? `<div class="cta-features">${ctaFeaturesHtml}</div>` : `
      <div class="cta-features">
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Kostenlose Farbberatung
        </div>
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Online-Terminbuchung
        </div>
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Antwort innerhalb von 24h
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
            <option>Terminanfrage</option>
            <option>Farbberatung</option>
            <option>Balayage / Str&auml;hnchen</option>
            <option>Brautstyling</option>
            <option>Pflegebehandlung</option>
            <option>Allgemeine Anfrage</option>
          </select>
        </div>
      </div>

      <div class="form-row full">
        <div class="form-field">
          <label>Nachricht*</label>
          <textarea name="message" required placeholder="Erz&auml;hlen Sie uns von Ihrem Haarwunsch ..."></textarea>
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

${(c.faqItems || []).length > 0 ? `<!-- ====== FAQ ====== -->
<section class="faq-section">
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
        nav.style.boxShadow = '0 4px 20px ${hexToRgba(c.colors.text, 0.08)}';
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
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--champagner);color:var(--aubergine-dark);border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
