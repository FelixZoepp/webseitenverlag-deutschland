/* eslint-disable @typescript-eslint/no-unused-vars */
export interface CafeConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Espresso-Braun
    accent: string     // Karamell
    background: string // Beige
    text: string       // Dark text
  }
  phone?: string
  email?: string
  address?: string
  openingHours: { days: string; hours: string }[]
  menuCategories: { name: string; items: { name: string; description: string; price: string; tag?: string }[] }[]
  reviews: { text: string; name: string; source: string; rating: number }[]
  faqItems?: { question: string; answer: string }[]
  heroImageUrl?: string
  aboutTitle?: string
  aboutText?: string
  aboutText2?: string
  baristaName?: string
  baristaRole?: string
  baristaQuote?: string
  features?: { icon: string; title: string; description: string }[]
  contactEnabled?: boolean
  imprintUrl?: string
  privacyUrl?: string
  footerText?: string
  footerColumns?: { title: string; links: { label: string; href: string }[] }[]
  galleryItems?: { label: string; imageUrl?: string }[]
  aboutStats?: { value: string; label: string }[]
  locationTitle?: string
  locationSubtitle?: string
  locationDetails?: { icon: string; label: string; value: string }[]
  ctaSectionTitle?: string
  ctaSectionSubtitle?: string
  ctaFeatures?: string[]
  menuSectionTitle?: string
  menuSectionSubtitle?: string
  menuSectionDescription?: string
  reviewsSectionTitle?: string
  gallerySectionTitle?: string
  gallerySectionSubtitle?: string
  beanOrigins?: { name: string; region: string; flavor: string; roast: string }[]
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

export function renderCafeTemplate(config: CafeConfig, siteId?: string): string {
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

  const logoInitial = esc(c.businessName.charAt(0))

  // Menu tabs from categories
  const menuTabs = c.menuCategories.map((cat, i) =>
    `<button class="menu-tab${i === 0 ? ' active' : ''}" data-cat="${i}">${esc(cat.name)}</button>`
  ).join('\n      ')

  // Menu items
  const menuItemsHtml = c.menuCategories.map((cat, catIdx) =>
    `<div class="menu-category" data-cat-content="${catIdx}" style="${catIdx === 0 ? '' : 'display:none'}">
      <div class="menu-grid">
        ${cat.items.map(item => `
        <div class="menu-item">
          <div class="menu-item-info">
            <h4>${esc(item.name)}</h4>
            <p>${esc(item.description)}</p>
            ${item.tag ? `<div class="tags"><span class="tag${item.tag.toLowerCase() === 'single origin' ? ' origin' : item.tag.toLowerCase() === 'specialty' ? ' specialty' : item.tag.toLowerCase() === 'neu' ? ' new' : item.tag.toLowerCase() === 'vegan' ? ' vegan' : ''}">${esc(item.tag)}</span></div>` : ''}
          </div>
          <div class="menu-item-price">${esc(item.price)}</div>
        </div>`).join('')}
      </div>
    </div>`
  ).join('\n')

  // Reviews HTML
  const reviewsHtml = c.reviews.map(r => {
    const initials = r.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    return `
      <div class="review-card">
        <div class="review-stars">
          ${generateStarsSvg(r.rating)}
        </div>
        <p class="review-text">"${esc(r.text)}"</p>
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

  // Gallery items (Beans Gallery)
  const galleryItems = c.galleryItems || [
    { label: 'Single Origin Ethiopia' },
    { label: 'Pour-Over Bar' },
    { label: 'Latte Art' },
    { label: 'Cold Brew Setup' },
    { label: 'Roastery' },
  ]
  const galleryLetters = ['a', 'b', 'c', 'd', 'e']
  const defaultGradients = [
    `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 60%, ${darkenHex(c.colors.primary, 0.4)} 100%)`,
    `linear-gradient(135deg, ${c.colors.accent} 0%, ${darkenHex(c.colors.accent, 0.3)} 100%)`,
    `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.2)} 0%, ${c.colors.primary} 100%)`,
    `linear-gradient(135deg, ${c.colors.accent} 0%, ${c.colors.primary} 100%)`,
    `linear-gradient(135deg, ${textSoft} 0%, ${darkenHex(c.colors.primary, 0.15)} 100%)`,
  ]
  const galleryHtml = galleryItems.slice(0, 5).map((item, i) => {
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

  // Bean origins
  const beanOrigins = c.beanOrigins || []
  const beanOriginsHtml = beanOrigins.length > 0 ? beanOrigins.map(b => `
        <div class="bean-card">
          <div class="bean-header">
            <div class="bean-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="12" rx="4" ry="8" transform="rotate(-30 12 12)"/><path d="M8.5 8.5C10 10 10 14 8.5 15.5"/></svg>
            </div>
            <div>
              <h4>${esc(b.name)}</h4>
              <span class="bean-region">${esc(b.region)}</span>
            </div>
          </div>
          <div class="bean-details">
            <div class="bean-detail"><span class="bean-label">Geschmack</span><span>${esc(b.flavor)}</span></div>
            <div class="bean-detail"><span class="bean-label">R&ouml;stung</span><span>${esc(b.roast)}</span></div>
          </div>
        </div>`).join('') : ''

  // Location details
  const locationDetails = c.locationDetails || []
  const locationDetailsHtml = locationDetails.map(d => `
      <div class="location-detail">
        <div class="icon">
          ${d.icon === 'pin' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
          : d.icon === 'transit' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>'
          : d.icon === 'phone' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
          : d.icon === 'wifi' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/></svg>'
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
    { title: 'Kaffee', links: [
      { label: 'Karte', href: '#menu' },
      { label: 'Beans-Galerie', href: '#beans' },
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

<!-- Schema.org CafeOrCoffeeShop -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  "name": "${esc(c.businessName)}",
  "description": "${esc(c.tagline)}",
  ${c.address ? `"address": { "@type": "PostalAddress", "streetAddress": "${esc(c.address)}" },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  "servesCuisine": "Specialty Coffee",
  "priceRange": "$$",
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
    --espresso:        ${esc(c.colors.primary)};
    --espresso-dark:   ${primaryDark};
    --espresso-soft:   ${primarySoft};
    --karamell:        ${esc(c.colors.accent)};
    --karamell-dark:   ${accentDark};
    --beige:           ${esc(c.colors.background)};
    --beige-tint:      ${bgTint};
    --beige-warm:      ${bgWarm};
    --ink:             ${esc(c.colors.text)};
    --ink-soft:        ${textSoft};
    --border:          ${borderColor};

    --shadow-card: 0 12px 32px ${hexToRgba(c.colors.text, 0.08)};
    --shadow-image: 0 20px 60px ${hexToRgba(c.colors.text, 0.18)};

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
    background: var(--beige);
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
    color: var(--espresso);
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }

  .eyebrow {
    color: var(--karamell);
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
    background: var(--espresso);
    color: var(--beige);
    text-align: center;
    padding: 10px 16px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }
  .announce strong { color: var(--karamell); }

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
    background: var(--espresso);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: var(--beige);
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 18px;
    font-style: italic;
    transform: rotate(-3deg);
  }
  .nav-links { display: flex; gap: 32px; font-size: 15px; font-weight: 500; }
  .nav-links a { transition: color 0.2s; color: var(--ink); }
  .nav-links a:hover { color: var(--karamell); }
  .nav-cta {
    background: var(--espresso); color: var(--beige);
    padding: 12px 22px; border-radius: 999px;
    font-size: 13px; font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: all 0.3s var(--spring);
    display: inline-flex; align-items: center; gap: 8px;
  }
  .nav-cta:hover { background: var(--karamell); color: var(--espresso-dark); transform: translateY(-1px); }
  .nav-cta svg { width: 14px; height: 14px; }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    background: var(--beige);
    padding: 60px 0 80px;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 15% 25%, var(--beige-warm) 1px, transparent 1px),
      radial-gradient(circle at 85% 70%, var(--beige-warm) 1.5px, transparent 1.5px);
    background-size: 48px 48px, 72px 72px;
    pointer-events: none;
    opacity: 0.6;
  }
  .hero::after {
    content: '';
    position: absolute;
    top: -100px; right: -100px;
    width: 400px; height: 400px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.accent, 0.06)} 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 64px;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--beige-warm);
    color: var(--espresso);
    padding: 8px 16px;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 24px;
    font-weight: 500;
  }
  .hero-tag .pulse {
    width: 8px; height: 8px;
    background: var(--karamell);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.6; transform: scale(1.2); }
  }
  .hero h1 {
    font-size: clamp(48px, 6vw, 96px);
    margin-bottom: 24px;
    line-height: 0.98;
  }
  .hero h1 .subtitle {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.18em;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-top: 28px;
    color: var(--karamell);
  }
  .hero-lead {
    font-size: 19px; line-height: 1.6;
    color: var(--ink-soft);
    max-width: 540px; margin-bottom: 36px;
  }
  .hero-lead strong { color: var(--ink); font-weight: 600; }

  .hero-trust {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    padding-top: 32px;
    margin-top: 32px;
    border-top: 1px solid var(--border);
  }
  .trust-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--ink-soft);
  }
  .trust-item .stars {
    display: flex;
    gap: 2px;
  }
  .trust-item .stars svg {
    width: 14px; height: 14px;
    color: var(--karamell);
    fill: var(--karamell);
  }
  .trust-item strong { color: var(--ink); font-weight: 600; }

  /* Hours Widget in Hero */
  .hours-widget {
    background: var(--espresso);
    color: var(--beige);
    border-radius: 24px;
    padding: 36px 32px;
    box-shadow: var(--shadow-image);
    position: relative;
  }
  .hours-widget::before {
    content: '\\2615';
    position: absolute;
    top: -16px; left: 32px;
    background: var(--karamell);
    color: var(--espresso-dark);
    width: 36px; height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }
  .hours-widget h3 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 28px;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }
  .hours-widget h3 em {
    font-style: italic;
    color: var(--karamell);
  }
  .hours-widget .sub {
    color: ${hexToRgba(c.colors.background, 0.7)};
    font-size: 14px;
    margin-bottom: 24px;
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
  }
  .hours-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }
  .hours-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: ${hexToRgba(c.colors.background, 0.06)};
    border-radius: 12px;
    border: 1px solid ${hexToRgba(c.colors.background, 0.08)};
  }
  .hours-list-item .day {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${hexToRgba(c.colors.background, 0.6)};
  }
  .hours-list-item .time {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 500;
    color: var(--beige);
  }
  .hours-list-item .time em {
    font-style: italic;
    color: var(--karamell);
  }
  .hours-widget-cta {
    width: 100%;
    padding: 16px;
    border-radius: 999px;
    background: var(--karamell);
    color: var(--espresso-dark);
    border: none;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s var(--spring);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .hours-widget-cta:hover {
    background: var(--beige);
    color: var(--espresso);
    transform: translateY(-2px);
  }
  .hours-widget-cta svg { width: 14px; height: 14px; }
  .hours-widget-note {
    text-align: center;
    margin-top: 16px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: ${hexToRgba(c.colors.background, 0.5)};
    letter-spacing: 0.04em;
  }

  /* ========================================
     SECTION HEAD
     ======================================== */
  .section-head { text-align: center; margin-bottom: 64px; }
  .section-head .eyebrow { display: block; margin-bottom: 16px; }
  .section-head h2 {
    font-size: clamp(40px, 5vw, 64px);
    margin-bottom: 16px;
    line-height: 1.05;
  }
  .section-head p {
    color: var(--ink-soft);
    font-size: 18px;
    max-width: 580px;
    margin: 0 auto;
  }

  /* ========================================
     KAFFEE-KARTE (Menu)
     ======================================== */
  .menu { background: var(--beige-tint); }
  .menu-tabs {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 48px;
  }
  .menu-tab {
    background: transparent;
    color: var(--ink-soft);
    border: 1px solid var(--border);
    padding: 12px 24px;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s var(--spring);
  }
  .menu-tab:hover {
    border-color: var(--karamell);
    color: var(--karamell);
  }
  .menu-tab.active {
    background: var(--espresso);
    color: var(--beige);
    border-color: var(--espresso);
  }

  .menu-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px 64px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .menu-item {
    padding: 20px 0;
    border-bottom: 1px dashed var(--border);
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 16px;
    align-items: baseline;
    transition: padding 0.3s var(--smooth);
  }
  .menu-item:hover { padding-left: 8px; }
  .menu-item-info h4 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 20px;
    letter-spacing: -0.02em;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .menu-item-info h4 em {
    font-style: italic;
    color: var(--karamell);
  }
  .menu-item-info p {
    color: var(--ink-soft);
    font-size: 14px;
    line-height: 1.5;
  }
  .menu-item .tags {
    display: inline-flex;
    gap: 6px;
    margin-top: 6px;
  }
  .menu-item .tag {
    font-family: var(--font-mono);
    font-size: 9px;
    padding: 2px 8px;
    border-radius: 999px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--beige-warm);
    color: var(--espresso);
  }
  .menu-item .tag.origin { background: ${hexToRgba(c.colors.accent, 0.15)}; color: var(--karamell-dark); }
  .menu-item .tag.specialty { background: var(--espresso-soft); color: var(--espresso); }
  .menu-item .tag.new { background: var(--karamell); color: var(--espresso-dark); }
  .menu-item .tag.vegan { background: ${hexToRgba('#5a8a3c', 0.12)}; color: #5a8a3c; }

  .menu-item-price {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 22px;
    color: var(--karamell);
    letter-spacing: -0.01em;
    white-space: nowrap;
    font-variation-settings: "opsz" 24, "SOFT" 80;
  }

  .menu-footer {
    text-align: center;
    margin-top: 48px;
    color: var(--ink-soft);
    font-size: 14px;
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
  }
  .menu-footer a {
    color: var(--karamell);
    border-bottom: 1px solid var(--karamell);
    padding-bottom: 2px;
  }

  /* ========================================
     ABOUT / BARISTA STORY
     ======================================== */
  .about { background: var(--beige-tint); }
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: 64px;
    align-items: center;
  }
  .barista-image {
    position: relative;
    aspect-ratio: 4/5;
    border-radius: 24px;
    overflow: hidden;
    background: linear-gradient(160deg, ${tintHex(c.colors.primary, 0.3)} 0%, ${c.colors.primary} 60%, ${primaryDark} 100%);
    box-shadow: var(--shadow-image);
  }
  .barista-quote {
    position: absolute;
    top: 24px; left: 24px;
    right: 24px;
    background: ${hexToRgba(c.colors.background, 0.95)};
    padding: 20px 24px;
    border-radius: 16px;
    backdrop-filter: blur(12px);
  }
  .barista-quote p {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 17px;
    line-height: 1.4;
    color: var(--ink);
    letter-spacing: -0.01em;
    font-variation-settings: "opsz" 24, "SOFT" 80;
  }
  .barista-quote .signature {
    margin-top: 12px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--karamell);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .about-text h2 {
    font-size: clamp(36px, 4.5vw, 56px);
    margin-bottom: 28px;
    line-height: 1.05;
  }
  .about-text p {
    color: var(--ink-soft);
    font-size: 17px;
    line-height: 1.65;
    margin-bottom: 20px;
  }
  .about-text p strong { color: var(--ink); font-weight: 600; }

  .about-stats {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0;
    margin-top: 36px;
    padding-top: 36px;
    border-top: 1px solid var(--border);
  }
  .about-stat {
    text-align: center;
    padding: 0 16px;
    border-right: 1px solid var(--border);
  }
  .about-stat:last-child { border-right: none; }
  .about-stat .num {
    font-family: var(--font-display);
    font-size: 44px;
    font-weight: 500;
    color: var(--karamell);
    line-height: 1;
    margin-bottom: 6px;
    font-variation-settings: "opsz" 144, "SOFT" 80;
  }
  .about-stat .label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }

  /* ========================================
     BEANS GALLERY (Masonry)
     ======================================== */
  .beans-gallery { background: var(--beige); }
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 240px);
    gap: 12px;
    grid-template-areas:
      "a a b c"
      "a a d e";
  }
  .gallery-item {
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    transition: transform 0.4s var(--smooth);
  }
  .gallery-item:hover { transform: translateY(-4px); }
  .gallery-item::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 60%, ${hexToRgba(c.colors.text, 0.4)});
    pointer-events: none;
  }
  .gallery-item .caption {
    position: absolute;
    bottom: 16px; left: 16px;
    color: var(--beige);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    z-index: 2;
  }
  .gallery-item.a { grid-area: a; }
  .gallery-item.b { grid-area: b; }
  .gallery-item.c { grid-area: c; }
  .gallery-item.d { grid-area: d; }
  .gallery-item.e { grid-area: e; }

  /* ========================================
     BEAN ORIGINS (Optional Section)
     ======================================== */
  .bean-origins { background: var(--espresso); color: var(--beige); padding: 80px 0; }
  .bean-origins .section-head .eyebrow { color: var(--karamell); }
  .bean-origins .section-head h2 { color: var(--beige); }
  .bean-origins .section-head p { color: ${hexToRgba(c.colors.background, 0.6)}; }
  .bean-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
  .bean-card {
    background: ${hexToRgba(c.colors.background, 0.05)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.1)};
    border-radius: 20px;
    padding: 24px;
    transition: border-color 0.3s, transform 0.3s;
  }
  .bean-card:hover {
    border-color: var(--karamell);
    transform: translateY(-2px);
  }
  .bean-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
  }
  .bean-icon {
    width: 44px; height: 44px;
    background: ${hexToRgba(c.colors.accent, 0.12)};
    color: var(--karamell);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .bean-icon svg { width: 24px; height: 24px; }
  .bean-header h4 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 18px;
    color: var(--beige);
    letter-spacing: -0.01em;
  }
  .bean-region {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--karamell);
  }
  .bean-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .bean-detail {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-top: 1px solid ${hexToRgba(c.colors.background, 0.08)};
    font-size: 14px;
    color: ${hexToRgba(c.colors.background, 0.7)};
  }
  .bean-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${hexToRgba(c.colors.background, 0.4)};
  }

  /* ========================================
     GOOGLE REVIEWS
     ======================================== */
  .reviews { background: var(--beige); }
  .reviews-header {
    text-align: center;
    margin-bottom: 48px;
  }
  .reviews-score {
    display: inline-flex;
    align-items: center;
    gap: 20px;
    background: var(--beige-tint);
    padding: 24px 32px;
    border-radius: 20px;
    border: 1px solid var(--border);
    margin-bottom: 24px;
  }
  .reviews-score .big {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 56px;
    color: var(--karamell);
    line-height: 1;
    letter-spacing: -0.03em;
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }
  .reviews-score .meta {
    text-align: left;
  }
  .reviews-score .stars {
    display: flex;
    gap: 2px;
    margin-bottom: 6px;
  }
  .reviews-score .stars svg {
    width: 18px; height: 18px;
    color: var(--karamell);
    fill: var(--karamell);
  }
  .reviews-score .count {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-soft);
    letter-spacing: 0.04em;
  }
  .reviews-score .google {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-soft);
    letter-spacing: 0.04em;
    margin-top: 4px;
  }
  .reviews-score .google::before {
    content: 'G';
    font-family: var(--font-display);
    font-weight: 700;
    color: var(--karamell);
    font-size: 16px;
  }

  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .review-card {
    background: var(--beige-tint);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px 24px;
    transition: border-color 0.3s, transform 0.3s;
  }
  .review-card:hover {
    border-color: var(--karamell);
    transform: translateY(-2px);
  }
  .review-stars {
    display: flex;
    gap: 2px;
    margin-bottom: 14px;
  }
  .review-stars svg {
    width: 14px; height: 14px;
    color: var(--karamell);
    fill: var(--karamell);
  }
  .review-text {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 20px;
    letter-spacing: -0.005em;
    font-variation-settings: "opsz" 24, "SOFT" 50;
  }
  .review-author {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }
  .review-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: var(--espresso-soft);
    color: var(--espresso);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 14px;
  }
  .review-name {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 2px;
  }
  .review-meta {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-soft);
    letter-spacing: 0.04em;
  }
  .review-meta::before {
    content: '\\25CF';
    color: var(--karamell);
    margin-right: 6px;
  }

  /* ========================================
     LOCATION + SVG MAP
     ======================================== */
  .location { background: var(--beige-tint); }
  .location-grid {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 48px;
    align-items: stretch;
  }
  .location-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .location-info h2 {
    font-size: clamp(36px, 4vw, 52px);
    line-height: 1.05;
    margin-bottom: 28px;
  }
  .location-detail {
    display: flex;
    gap: 16px;
    padding: 20px 0;
    border-bottom: 1px solid var(--border);
  }
  .location-detail:last-of-type { border-bottom: none; }
  .location-detail .icon {
    width: 44px; height: 44px;
    background: var(--espresso-soft);
    color: var(--espresso);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .location-detail .icon svg { width: 20px; height: 20px; stroke-width: 2; }
  .location-detail .label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-bottom: 4px;
  }
  .location-detail .value {
    color: var(--ink);
    font-size: 15px;
    line-height: 1.5;
  }
  .location-detail .value strong { color: var(--karamell); font-weight: 600; }

  .location-map {
    background: var(--espresso);
    border-radius: 24px;
    overflow: hidden;
    position: relative;
    min-height: 500px;
  }
  .map-svg {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
  }
  .map-block { fill: ${hexToRgba(c.colors.background, 0.06)}; }
  .map-park { fill: ${hexToRgba(c.colors.accent, 0.08)}; }
  .map-water { fill: ${hexToRgba(c.colors.accent, 0.05)}; }
  .map-street { stroke: ${hexToRgba(c.colors.background, 0.1)}; stroke-width: 2; fill: none; }
  .map-street-major { stroke: ${hexToRgba(c.colors.background, 0.18)}; stroke-width: 5; fill: none; stroke-linecap: round; }
  .map-street-label {
    fill: ${hexToRgba(c.colors.background, 0.5)};
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
  }

  .map-pin {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -100%);
    z-index: 2;
  }
  .map-pin-circle {
    width: 56px; height: 56px;
    background: var(--karamell);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--espresso-dark);
    box-shadow: 0 8px 24px ${hexToRgba(c.colors.accent, 0.5)};
    animation: pinFloat 3s ease-in-out infinite;
  }
  .map-pin-circle svg { width: 28px; height: 28px; stroke-width: 2; }
  .map-pin-pulse {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 56px; height: 56px;
    border-radius: 50%;
    border: 2px solid var(--karamell);
    opacity: 0;
    animation: mapPulse 2.5s ease-out infinite;
  }
  @keyframes pinFloat {
    0%, 100% { transform: translate(-50%, -100%) translateY(0); }
    50%      { transform: translate(-50%, -100%) translateY(-8px); }
  }
  @keyframes mapPulse {
    0%   { width: 56px; height: 56px; opacity: 1; }
    100% { width: 180px; height: 180px; opacity: 0; }
  }

  .map-overlay {
    position: absolute;
    bottom: 24px; left: 24px;
    background: ${hexToRgba(c.colors.background, 0.95)};
    border-radius: 16px;
    padding: 16px 20px;
    backdrop-filter: blur(12px);
    z-index: 3;
    max-width: 240px;
  }
  .map-overlay .label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--karamell);
    margin-bottom: 4px;
  }
  .map-overlay .name {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 18px;
    color: var(--ink);
    letter-spacing: -0.01em;
    margin-bottom: 8px;
  }
  .map-overlay .actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }
  .map-overlay .action {
    flex: 1;
    background: var(--espresso);
    color: var(--beige);
    padding: 8px 12px;
    border-radius: 8px;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-align: center;
    transition: background 0.3s;
  }
  .map-overlay .action:hover { background: var(--karamell); color: var(--espresso-dark); }

  /* ========================================
     CTA / CONTACT FORM
     ======================================== */
  .cta-section { background: var(--espresso); color: var(--beige); }
  .cta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  .cta-text h2 {
    font-size: clamp(40px, 5vw, 64px);
    line-height: 1.05;
    margin-bottom: 24px;
  }
  .cta-text h2 em {
    font-style: italic;
    color: var(--karamell);
  }
  .cta-text p {
    color: ${hexToRgba(c.colors.background, 0.7)};
    font-size: 17px;
    line-height: 1.65;
    margin-bottom: 24px;
  }
  .cta-features {
    display: grid;
    gap: 14px;
    margin-top: 28px;
  }
  .cta-feature {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 15px;
    color: ${hexToRgba(c.colors.background, 0.85)};
  }
  .cta-feature svg {
    width: 20px; height: 20px;
    color: var(--karamell);
    flex-shrink: 0;
  }

  .contact-form {
    background: ${hexToRgba(c.colors.background, 0.04)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.1)};
    border-radius: 24px;
    padding: 40px 36px;
    backdrop-filter: blur(8px);
  }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .form-row.full { grid-template-columns: 1fr; }
  .form-field { display: flex; flex-direction: column; gap: 6px; }
  .form-field label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${hexToRgba(c.colors.background, 0.6)};
  }
  .form-field input,
  .form-field select,
  .form-field textarea {
    background: ${hexToRgba(c.colors.background, 0.06)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.12)};
    color: var(--beige);
    padding: 14px 16px;
    border-radius: 12px;
    font-family: var(--font-body);
    font-size: 15px;
    transition: border-color 0.2s;
  }
  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus {
    outline: none;
    border-color: var(--karamell);
  }
  .form-field textarea { resize: vertical; min-height: 80px; }
  .form-field input::placeholder,
  .form-field textarea::placeholder {
    color: ${hexToRgba(c.colors.background, 0.35)};
  }
  .form-submit {
    margin-top: 8px;
    width: 100%;
    padding: 18px;
    border-radius: 999px;
    background: var(--karamell);
    color: var(--espresso-dark);
    border: none;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s var(--spring);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .form-submit:hover {
    background: var(--beige);
    color: var(--espresso);
    transform: translateY(-2px);
  }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section { background: var(--beige); }
  .faq-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-top: 48px;
  }
  .faq-item {
    background: var(--beige-tint);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .faq-item:hover { border-color: var(--karamell); }
  .faq-q {
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    padding: 22px 26px;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    font-family: var(--font-body);
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--ink);
    transition: background 0.2s;
  }
  .faq-q:hover { background: var(--beige-warm); }
  .faq-icon {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: var(--beige-warm);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: var(--karamell);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .faq-item.open .faq-icon { transform: rotate(45deg); background: var(--karamell); color: var(--espresso-dark); }
  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), padding 0.35s;
    font-size: 0.9rem;
    color: var(--ink-soft);
    line-height: 1.75;
    padding: 0 26px;
  }
  .faq-item.open .faq-a { max-height: 400px; padding: 0 26px 22px; }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: ${darkenHex(c.colors.primary, 0.4)};
    color: ${hexToRgba(c.colors.background, 0.7)};
    padding: 64px 0 32px;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 48px;
    margin-bottom: 48px;
  }
  .footer-brand .logo { color: var(--beige); margin-bottom: 16px; }
  .footer-brand p {
    font-size: 14px;
    line-height: 1.6;
    max-width: 320px;
  }
  .footer-col h4 {
    color: var(--beige);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 20px;
  }
  .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .footer-col a { font-size: 14px; transition: color 0.2s; }
  .footer-col a:hover { color: var(--karamell); }
  .footer-bottom {
    border-top: 1px solid ${hexToRgba(c.colors.background, 0.1)};
    padding-top: 24px;
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.05em;
    color: ${hexToRgba(c.colors.background, 0.4)};
  }
  .footer-bottom a:hover { color: var(--karamell); }

  /* ========================================
     STICKY MOBILE CTA
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 16px; left: 16px; right: 16px;
    background: var(--karamell);
    color: var(--espresso-dark);
    padding: 16px 24px;
    border-radius: 999px;
    z-index: 100;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-align: center;
    box-shadow: 0 8px 32px ${hexToRgba(c.colors.text, 0.4)};
    transition: all 0.3s var(--spring);
  }
  .mobile-cta:hover { background: var(--beige); }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .hero-grid { grid-template-columns: 1fr; gap: 48px; }
    .menu-grid { grid-template-columns: 1fr; gap: 0; }
    .reviews-grid { grid-template-columns: 1fr; }
    .about-grid { grid-template-columns: 1fr; gap: 48px; }
    .location-grid { grid-template-columns: 1fr; }
    .cta-grid { grid-template-columns: 1fr; gap: 48px; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .gallery-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(3, 200px);
      grid-template-areas:
        "a a"
        "b c"
        "d e";
    }
    .bean-cards { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 768px) {
    section { padding: 64px 0; }
    .container { padding: 0 20px; }
    .nav-links { display: none; }
    .nav-cta { display: none; }
    .form-row { grid-template-columns: 1fr; }
    .about-stats { grid-template-columns: 1fr; gap: 24px; }
    .about-stat { border-right: none; border-bottom: 1px solid var(--border); padding: 16px 0; }
    .about-stat:last-child { border-bottom: none; }
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .footer-bottom { flex-direction: column; gap: 12px; }
    .menu-tabs { gap: 6px; }
    .menu-tab { padding: 10px 16px; font-size: 11px; }
    .mobile-cta { display: block; }
    body { padding-bottom: 80px; }
    .reviews-score { flex-direction: column; gap: 12px; text-align: center; }
    .reviews-score .meta { text-align: center; }
    .faq-grid { grid-template-columns: 1fr; }
    .bean-cards { grid-template-columns: 1fr; }
    .gallery-grid {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(5, 180px);
      grid-template-areas:
        "a"
        "b"
        "c"
        "d"
        "e";
    }
  }
</style>
</head>
<body>

${c.announceText ? `<!-- ====== ANNOUNCEMENT BAR ====== -->
<div class="announce">
  ${c.announceText}
</div>` : ''}

<!-- ====== NAV ====== -->
<nav>
  <div class="nav-inner">
    <a href="#" class="logo">
      <span class="logo-mark">${logoInitial}</span>
      ${esc(c.businessName)}
    </a>
    <div class="nav-links">
      <a href="#menu">Karte</a>
      <a href="#beans">Beans</a>
      <a href="#about">Story</a>
      <a href="#reviews">Bewertungen</a>
      <a href="#location">Standort</a>
    </div>
    <a href="#contact" class="nav-cta">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      ${esc(c.ctaText)}
    </a>
  </div>
</nav>

<!-- ====== HERO ====== -->
<section class="hero"${c.heroImageUrl ? ` style="background-image:url('${esc(c.heroImageUrl)}');background-size:cover;background-position:center"` : ''}>
  <div class="container hero-grid">
    <div>
      <div class="hero-tag">
        <span class="pulse"></span>
        ${esc(c.heroTag)}
      </div>
      <h1 class="display">
        ${c.heroHeadline} <em>${esc(c.heroAccent)}</em>
        <span class="subtitle">${esc(c.tagline)}</span>
      </h1>
      <p class="hero-lead">
        ${c.heroLead}
      </p>

      <div class="hero-trust">
        ${c.reviews.length > 0 ? `<div class="trust-item">
          <div class="stars">
            ${generateStarsSvg(5)}
          </div>
          <strong>${(c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length).toFixed(1).replace('.', ',')}</strong> &middot; ${c.reviews.length} Bewertungen
        </div>` : ''}
        <div class="trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;color:var(--karamell)"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>SCA-zertifizierte Baristas</span>
        </div>
      </div>
    </div>

    <!-- Opening Hours Widget -->
    <div class="hours-widget">
      <h3>&Ouml;ffnungszeiten &amp; <em>Besuch</em></h3>
      <div class="sub">Specialty Coffee &middot; Direct Trade</div>

      <div class="hours-list">
        ${c.openingHours.map(h => `
        <div class="hours-list-item">
          <span class="day">${esc(h.days)}</span>
          <span class="time"><em>${esc(h.hours)}</em></span>
        </div>`).join('')}
      </div>

      <a href="#contact" class="hours-widget-cta">
        ${esc(c.ctaText)}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>

      <div class="hours-widget-note">
        ${c.phone ? `Direkt anrufen: ${esc(c.phone)}` : 'Pour-Over auf Vorbestellung'}
      </div>
    </div>
  </div>
</section>

<!-- ====== KAFFEE-KARTE ====== -->
${c.menuCategories.length > 0 ? `<section id="menu" class="menu">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.menuSectionTitle || 'Kaffee-Karte')}</span>
      <h2 class="display">${c.menuSectionSubtitle || 'Unsere <em>Karte</em>.'}</h2>
      ${c.menuSectionDescription ? `<p>${esc(c.menuSectionDescription)}</p>` : '<p>Handger&ouml;stete Single Origins, pr&auml;zise Extraktion, saisonale Specialty Drinks.</p>'}
    </div>

    <div class="menu-tabs">
      ${menuTabs}
    </div>

    ${menuItemsHtml}

    <div class="menu-footer">
      Alle Preise inkl. MwSt. &middot; <a href="#contact">Fragen zur Karte?</a>
    </div>
  </div>
</section>` : ''}

<!-- ====== ABOUT / BARISTA STORY ====== -->
<section id="about" class="about">
  <div class="container about-grid">
    <div class="barista-image"${c.heroImageUrl ? ` style="background-image:url('${esc(c.heroImageUrl)}');background-size:cover;background-position:center"` : ''}>
      ${c.baristaQuote ? `<div class="barista-quote">
        <p>"${esc(c.baristaQuote)}"</p>
        ${c.baristaName ? `<div class="signature">&mdash; ${esc(c.baristaName)}${c.baristaRole ? `, ${esc(c.baristaRole)}` : ''}</div>` : ''}
      </div>` : ''}
    </div>
    <div class="about-text">
      <span class="eyebrow" style="display:block; margin-bottom:16px;">${esc(c.aboutTitle || 'Unsere Geschichte')}</span>
      <h2 class="display">${c.aboutTitle || 'Vom Rohkaffee zur <em>Tasse</em>.'}</h2>
      ${c.aboutText ? `<p>${c.aboutText}</p>` : ''}
      ${c.aboutText2 ? `<p>${c.aboutText2}</p>` : ''}
      ${aboutStatsHtml}
    </div>
  </div>
</section>

<!-- ====== BEANS GALLERY ====== -->
<section id="beans" class="beans-gallery">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.gallerySectionTitle || 'Beans & Brew')}</span>
      <h2 class="display">${c.gallerySectionSubtitle || 'Eindr&uuml;cke aus der <em>R&ouml;sterei</em>.'}</h2>
    </div>
    <div class="gallery-grid">
      ${galleryHtml}
    </div>
  </div>
</section>

${beanOrigins.length > 0 ? `<!-- ====== BEAN ORIGINS ====== -->
<section class="bean-origins">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Unsere Bohnen</span>
      <h2 class="display">Direct Trade <em>Origins</em>.</h2>
      <p>Jede Bohne erz&auml;hlt eine Geschichte &mdash; von der Farm bis in Ihre Tasse.</p>
    </div>
    <div class="bean-cards">
      ${beanOriginsHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== REVIEWS ====== -->
${c.reviews.length > 0 ? `<section id="reviews" class="reviews">
  <div class="container">
    <div class="section-head">
      <div class="reviews-header">
        <div class="reviews-score">
          <div class="big">${(c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length).toFixed(1).replace('.', ',')}</div>
          <div class="meta">
            <div class="stars">
              ${generateStarsSvg(5)}
            </div>
            <div class="count">${c.reviews.length} Bewertungen</div>
          </div>
        </div>
      </div>
      <span class="eyebrow">${esc(c.reviewsSectionTitle || 'G&auml;ste-Stimmen')}</span>
      <h2 class="display">Was Kaffeeliebhaber <em>sagen</em>.</h2>
    </div>

    <div class="reviews-grid">
      ${reviewsHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== LOCATION + SVG MAP ====== -->
<section id="location" class="location">
  <div class="container location-grid">

    <div class="location-info">
      <span class="eyebrow" style="display:block; margin-bottom:16px;">${esc(c.locationTitle || 'Standort & Anfahrt')}</span>
      <h2 class="display">${c.locationSubtitle || 'Finden Sie <em>uns</em>.'}</h2>

      ${locationDetailsHtml.length > 0 ? locationDetailsHtml : `
      ${c.address ? `<div class="location-detail">
        <div class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div>
          <div class="label">Adresse</div>
          <div class="value">${c.address}</div>
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
          <div class="value">${esc(c.email)}</div>
        </div>
      </div>` : ''}`}
    </div>

    <!-- Stilisierte Leipzig SVG Map -->
    <div class="location-map">
      <svg class="map-svg" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid slice">
        <!-- Leipzig-inspiriertes Strassennetz -->
        <path class="map-park" d="M 30 20 L 180 30 L 200 130 L 30 120 Z"/>
        <path class="map-park" d="M 420 350 Q 480 320 540 360 Q 520 420 440 400 Z"/>
        <path class="map-water" d="M 480 40 Q 540 80 560 160 Q 530 180 500 140 Q 490 80 480 40 Z"/>
        <rect class="map-block" x="220" y="40" width="80" height="60" rx="4"/>
        <rect class="map-block" x="310" y="40" width="70" height="60" rx="4"/>
        <rect class="map-block" x="390" y="45" width="60" height="55" rx="4"/>
        <rect class="map-block" x="30" y="155" width="75" height="90" rx="4"/>
        <rect class="map-block" x="115" y="155" width="80" height="80" rx="4"/>
        <rect class="map-block" x="205" y="155" width="100" height="80" rx="4"/>
        <rect class="map-block" x="315" y="160" width="70" height="75" rx="4"/>
        <rect class="map-block" x="395" y="155" width="60" height="90" rx="4"/>
        <rect class="map-block" x="465" y="185" width="100" height="60" rx="4"/>
        <rect class="map-block" x="30" y="295" width="90" height="75" rx="4"/>
        <rect class="map-block" x="130" y="285" width="80" height="95" rx="4"/>
        <rect class="map-block" x="220" y="295" width="100" height="75" rx="4"/>
        <rect class="map-block" x="330" y="295" width="75" height="95" rx="4"/>
        <rect class="map-block" x="30" y="405" width="80" height="75" rx="4"/>
        <rect class="map-block" x="120" y="405" width="95" height="75" rx="4"/>
        <rect class="map-block" x="225" y="405" width="80" height="75" rx="4"/>
        <rect class="map-block" x="315" y="410" width="90" height="70" rx="4"/>
        <rect class="map-block" x="415" y="410" width="150" height="70" rx="4"/>
        <!-- Hauptstrassen -->
        <line class="map-street-major" x1="0" y1="275" x2="600" y2="275"/>
        <line class="map-street-major" x1="290" y1="0" x2="290" y2="500"/>
        <!-- Nebenstrassen -->
        <line class="map-street" x1="0" y1="145" x2="600" y2="145"/>
        <line class="map-street" x1="0" y1="390" x2="600" y2="390"/>
        <line class="map-street" x1="110" y1="0" x2="110" y2="500"/>
        <line class="map-street" x1="410" y1="0" x2="410" y2="500"/>
        <!-- Diagonale (Karl-Liebknecht-Str.) -->
        <line class="map-street" x1="200" y1="0" x2="380" y2="500"/>
        <text class="map-street-label" x="300" y="270">${esc(c.businessName)}</text>
        <text class="map-street-label" x="320" y="140" style="font-size:8px">Karl-Liebknecht-Str.</text>
      </svg>

      <div class="map-pin">
        <div class="map-pin-pulse"></div>
        <div class="map-pin-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      </div>

      <div class="map-overlay">
        <div class="label">${esc(c.businessName)}</div>
        <div class="name">${esc(c.address || '')}</div>
        <div class="actions">
          <a class="action">Route</a>
          <a class="action">Karte &ouml;ffnen</a>
        </div>
      </div>
    </div>

  </div>
</section>

<!-- ====== CTA / CONTACT FORM ====== -->
${c.contactEnabled !== false ? `<section id="contact" class="cta-section">
  <div class="container cta-grid">
    <div class="cta-text">
      <span class="eyebrow" style="color: var(--karamell); display:block; margin-bottom:16px;">${esc(c.ctaSectionTitle || 'Kontakt')}</span>
      <h2 class="display">${c.ctaSectionSubtitle || 'Schreiben Sie <em>uns</em>.'}</h2>
      <p>Ob Catering-Anfrage, Kaffee-Workshop oder einfach Hallo sagen &mdash; wir freuen uns auf Ihre Nachricht.</p>

      ${ctaFeaturesHtml.length > 0 ? `<div class="cta-features">${ctaFeaturesHtml}</div>` : `
      <div class="cta-features">
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Specialty Coffee Catering
        </div>
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Barista-Workshops &amp; Cuppings
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
          <label>Betreff</label>
          <select name="betreff">
            <option>Allgemeine Anfrage</option>
            <option>Catering</option>
            <option>Barista-Workshop</option>
            <option>Cupping-Event</option>
            <option>Kooperation</option>
            <option>Feedback</option>
          </select>
        </div>
      </div>

      <div class="form-row full">
        <div class="form-field">
          <label>Nachricht*</label>
          <textarea name="message" required placeholder="Erz&auml;hlen Sie uns von Ihrem Anliegen ..."></textarea>
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
    <div class="section-head">
      <span class="eyebrow">H&auml;ufige Fragen</span>
      <h2 class="display">Fragen &amp; <em>Antworten</em>.</h2>
    </div>
    <div class="faq-grid">
      ${faqHtml}
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
  /* Menu Tabs */
  document.querySelectorAll('.menu-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.menu-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var catIdx = tab.getAttribute('data-cat');
      document.querySelectorAll('.menu-category').forEach(function(c) {
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
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:var(--beige);font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:' + '${hexToRgba(c.colors.background, 0.7)}' + ';font-size:1.05rem">Wir melden uns in K\\u00fcrze bei Ihnen.</p></div>';
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
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba(c.colors.primary, 0.97)};backdrop-filter:blur(12px);color:var(--beige);padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:${hexToRgba(c.colors.background, 0.8)}">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--beige);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--karamell);color:var(--espresso-dark);border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
