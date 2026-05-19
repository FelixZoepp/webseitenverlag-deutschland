/* eslint-disable @typescript-eslint/no-unused-vars */
export interface SushiConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Indigo #3d3b8a
    accent: string     // Wasabi-Gruen #8bc34a
    background: string // Schwarz #0a0a0a
    text: string       // Off-White #f5f5f0
  }
  phone?: string
  email?: string
  address?: string
  openingHours: { days: string; hours: string }[]
  menuCategories: { name: string; items: { name: string; description: string; price: string; tag?: string }[] }[]
  reviews: { text: string; name: string; source: string; rating: number }[]
  faqItems?: { question: string; answer: string }[]
  heroImageUrl?: string

  // Chef's Table
  chefName?: string
  chefRole?: string
  chefQuote?: string
  chefTableTitle?: string
  chefTableSubtitle?: string
  chefTableDescription?: string
  chefTableFeatures?: string[]
  chefTablePrice?: string

  // About / Omakase
  aboutTitle?: string
  aboutText?: string
  aboutText2?: string
  aboutStats?: { value: string; label: string }[]

  // Features
  features?: { icon: string; title: string; description: string }[]

  // Reservation
  reservationEnabled?: boolean
  reserveTitle?: string
  reserveSubtitle?: string
  reserveFeatures?: string[]

  // Menu section
  menuSectionTitle?: string
  menuSectionSubtitle?: string
  menuSectionDescription?: string

  // Reviews section
  reviewsSectionTitle?: string

  // Location
  locationTitle?: string
  locationSubtitle?: string
  locationDetails?: { icon: string; label: string; value: string }[]

  // Footer
  imprintUrl?: string
  privacyUrl?: string
  footerText?: string
  footerColumns?: { title: string; links: { label: string; href: string }[] }[]

  // Gallery
  galleryItems?: { label: string; imageUrl?: string }[]
  gallerySectionTitle?: string
  gallerySectionSubtitle?: string
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

export function renderSushiTemplate(config: SushiConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primaryDark = darkenHex(c.colors.primary, 0.25)
  const primarySoft = hexToRgba(c.colors.primary, 0.15)
  const accentDark = darkenHex(c.colors.accent, 0.3)
  const bgLight = tintHex(c.colors.background, 0.06)
  const bgSurface = tintHex(c.colors.background, 0.1)
  const textSoft = hexToRgba(c.colors.text, 0.6)
  const textMuted = hexToRgba(c.colors.text, 0.4)
  const borderColor = hexToRgba(c.colors.text, 0.08)

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
            ${item.tag ? `<div class="tags"><span class="tag${item.tag.toLowerCase() === 'vegetarisch' ? ' vege' : item.tag.toLowerCase() === 'scharf' ? ' spicy' : item.tag.toLowerCase() === 'neu' ? ' new' : item.tag.toLowerCase() === 'omakase' ? ' omakase' : ''}">${esc(item.tag)}</span></div>` : ''}
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
        <p class="review-text">&laquo;${esc(r.text)}&raquo;</p>
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

  // Chef's Table features
  const chefTableFeatures = c.chefTableFeatures || [
    'Exklusives 12-Gang Omakase-Erlebnis',
    'Direkter Blick auf die Zubereitung',
    'Saisonale Spezialitaeten vom Chefkoch',
    'Premium Sake-Begleitung'
  ]
  const chefTableFeaturesHtml = chefTableFeatures.map(f => `
        <div class="chef-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>
          ${esc(f)}
        </div>`).join('')

  // Location details
  const locationDetails = c.locationDetails || []
  const locationDetailsHtml = locationDetails.map(d => `
      <div class="location-detail">
        <div class="icon">
          ${d.icon === 'pin' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
          : d.icon === 'transit' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>'
          : d.icon === 'phone' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M3 12h18M3 18h18"/></svg>'}
        </div>
        <div>
          <div class="label">${esc(d.label)}</div>
          <div class="value">${d.value}</div>
        </div>
      </div>`).join('')

  // Reserve features
  const reserveFeatures = c.reserveFeatures || []
  const reserveFeaturesHtml = reserveFeatures.map(f => `
        <div class="reserve-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          ${esc(f)}
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

  // Footer columns
  const footerColumns = c.footerColumns || [
    { title: 'Restaurant', links: [
      { label: 'Omakase-Karte', href: '#menu' },
      { label: "Chef's Table", href: '#chefs-table' },
      { label: 'Bewertungen', href: '#reviews' },
    ]},
    { title: 'Besuch', links: [
      { label: 'Reservieren', href: '#reserve' },
      { label: 'Standort', href: '#location' },
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,400..900,30..100&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">

<!-- Schema.org Restaurant -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "${esc(c.businessName)}",
  "description": "${esc(c.tagline)}",
  "servesCuisine": "Japanese",
  "priceRange": "$$$$",
  ${c.address ? `"address": { "@type": "PostalAddress", "streetAddress": "${esc(c.address)}" },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  ${c.reviews.length > 0 ? `"aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "${(c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length).toFixed(1)}",
    "reviewCount": "${c.reviews.length}",
    "bestRating": "5"
  },` : ''}
  "url": "${typeof window !== 'undefined' ? 'window.location.href' : ''}"
}
</script>

<style>
  /* ========================================
     DESIGN TOKENS -- SUSHI / JAPANESE
     ======================================== */
  :root {
    --indigo:          ${esc(c.colors.primary)};
    --indigo-dark:     ${primaryDark};
    --indigo-soft:     ${primarySoft};
    --wasabi:          ${esc(c.colors.accent)};
    --wasabi-dark:     ${accentDark};
    --kuro:            ${esc(c.colors.background)};
    --kuro-light:      ${bgLight};
    --kuro-surface:    ${bgSurface};
    --shiro:           ${esc(c.colors.text)};
    --shiro-soft:      ${textSoft};
    --shiro-muted:     ${textMuted};
    --border:          ${borderColor};

    --shadow-card: 0 12px 40px ${hexToRgba(c.colors.background, 0.6)};
    --shadow-glow: 0 0 60px ${hexToRgba(c.colors.primary, 0.15)};

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
    color: var(--shiro);
    background: var(--kuro);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; display: block; }

  .display {
    font-family: var(--font-display);
    font-weight: 500;
    letter-spacing: -0.03em;
    line-height: 1.02;
    font-variation-settings: "opsz" 144, "SOFT" 30;
  }
  .display em {
    font-style: italic;
    color: var(--wasabi);
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }

  .eyebrow {
    color: var(--wasabi);
    font-family: var(--font-mono);
    font-weight: 500;
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .container { max-width: 1280px; margin: 0 auto; padding: 0 32px; position: relative; }
  section { padding: 100px 0; position: relative; }

  /* Decorative Japanese line element */
  .jp-line {
    width: 40px;
    height: 1px;
    background: var(--wasabi);
    display: inline-block;
    margin: 0 12px;
    vertical-align: middle;
    opacity: 0.6;
  }

  /* ========================================
     ANNOUNCEMENT BAR
     ======================================== */
  .announce {
    background: var(--indigo);
    color: var(--shiro);
    text-align: center;
    padding: 10px 16px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.06em;
  }
  .announce strong { color: var(--wasabi); }

  /* ========================================
     NAV
     ======================================== */
  nav {
    position: sticky; top: 0; z-index: 50;
    background: ${hexToRgba(c.colors.background, 0.88)};
    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
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
    display: flex; align-items: center; gap: 12px;
    font-variation-settings: "opsz" 144, "SOFT" 80;
    font-style: italic;
  }
  .logo-mark {
    width: 38px; height: 38px;
    background: var(--indigo);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: var(--shiro);
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 18px;
    font-style: italic;
    position: relative;
    overflow: hidden;
  }
  .logo-mark::after {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 8px; height: 8px;
    background: var(--wasabi);
    border-radius: 0 8px 0 8px;
  }
  .nav-links { display: flex; gap: 28px; font-size: 14px; font-weight: 500; }
  .nav-links a { transition: color 0.2s; color: var(--shiro-soft); }
  .nav-links a:hover { color: var(--wasabi); }
  .nav-cta {
    background: var(--indigo); color: var(--shiro);
    padding: 11px 22px; border-radius: 8px;
    font-size: 12px; font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: all 0.3s var(--spring);
    display: inline-flex; align-items: center; gap: 8px;
    border: 1px solid ${hexToRgba(c.colors.primary, 0.5)};
  }
  .nav-cta:hover { background: var(--wasabi); color: var(--kuro); border-color: var(--wasabi); }
  .nav-cta svg { width: 14px; height: 14px; }

  /* Mobile menu */
  .nav-burger {
    display: none;
    background: none;
    border: none;
    color: var(--shiro);
    cursor: pointer;
    padding: 8px;
  }
  .nav-burger svg { width: 24px; height: 24px; }

  /* ========================================
     HERO -- Dark, Minimalist
     ======================================== */
  .hero {
    background: var(--kuro);
    padding: 80px 0 100px;
    position: relative;
    overflow: hidden;
    min-height: 85vh;
    display: flex;
    align-items: center;
  }
  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 600px 400px at 70% 40%, ${hexToRgba(c.colors.primary, 0.08)} 0%, transparent 70%),
      radial-gradient(ellipse 400px 300px at 20% 70%, ${hexToRgba(c.colors.accent, 0.04)} 0%, transparent 70%);
    pointer-events: none;
  }
  /* Subtle grid pattern */
  .hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(${hexToRgba(c.colors.text, 0.02)} 1px, transparent 1px),
      linear-gradient(90deg, ${hexToRgba(c.colors.text, 0.02)} 1px, transparent 1px);
    background-size: 80px 80px;
    pointer-events: none;
  }
  .hero-layout {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 80px;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: var(--wasabi);
    padding: 0;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    margin-bottom: 28px;
    font-weight: 500;
  }
  .hero-tag .pulse {
    width: 6px; height: 6px;
    background: var(--wasabi);
    border-radius: 50%;
    animation: pulse 2.5s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.4; transform: scale(1.3); }
  }
  .hero h1 {
    font-size: clamp(48px, 6.5vw, 100px);
    margin-bottom: 28px;
    line-height: 0.95;
    color: var(--shiro);
  }
  .hero h1 .subtitle {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.15em;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-top: 32px;
    color: var(--shiro-soft);
  }
  .hero-lead {
    font-size: 18px; line-height: 1.7;
    color: var(--shiro-soft);
    max-width: 520px; margin-bottom: 40px;
  }
  .hero-lead strong { color: var(--shiro); font-weight: 600; }
  .hero-actions {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
  }
  .btn-primary {
    background: var(--indigo);
    color: var(--shiro);
    padding: 16px 32px;
    border-radius: 8px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    transition: all 0.3s var(--spring);
    display: inline-flex;
    align-items: center;
    gap: 10px;
    border: 1px solid ${hexToRgba(c.colors.primary, 0.5)};
  }
  .btn-primary:hover { background: var(--wasabi); color: var(--kuro); border-color: var(--wasabi); transform: translateY(-2px); }
  .btn-primary svg { width: 14px; height: 14px; }
  .btn-ghost {
    color: var(--shiro-soft);
    padding: 16px 24px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: color 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn-ghost:hover { color: var(--wasabi); }
  .btn-ghost svg { width: 14px; height: 14px; }

  /* Hero visual -- right side */
  .hero-visual {
    position: relative;
    aspect-ratio: 3/4;
    border-radius: 20px;
    overflow: hidden;
    background: linear-gradient(160deg, ${bgSurface} 0%, ${c.colors.background} 100%);
    border: 1px solid var(--border);
  }
  .hero-visual-inner {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: 120px;
    opacity: 0.06;
    color: var(--shiro);
    font-style: italic;
    letter-spacing: -0.05em;
    user-select: none;
  }
  .hero-visual-badge {
    position: absolute;
    bottom: 24px;
    left: 24px;
    right: 24px;
    background: ${hexToRgba(c.colors.background, 0.9)};
    backdrop-filter: blur(16px);
    border-radius: 14px;
    padding: 20px 22px;
    border: 1px solid var(--border);
  }
  .hero-visual-badge .label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--wasabi);
    margin-bottom: 6px;
  }
  .hero-visual-badge .val {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 17px;
    color: var(--shiro);
    letter-spacing: -0.01em;
  }

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
    font-size: 12px;
    color: var(--shiro-muted);
  }
  .trust-item .stars {
    display: flex;
    gap: 2px;
  }
  .trust-item .stars svg {
    width: 13px; height: 13px;
    color: var(--wasabi);
    fill: var(--wasabi);
  }
  .trust-item strong { color: var(--shiro); font-weight: 600; }

  /* ========================================
     OPENING HOURS BAR
     ======================================== */
  .hours-bar {
    background: var(--indigo);
    color: var(--shiro);
    padding: 28px 0;
  }
  .hours-grid {
    display: grid;
    grid-template-columns: repeat(${Math.min(c.openingHours.length, 4)}, 1fr);
    gap: 32px;
    align-items: center;
  }
  .hours-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .hours-item .label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${hexToRgba(c.colors.text, 0.5)};
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .hours-item .label svg {
    width: 13px; height: 13px;
    color: var(--wasabi);
  }
  .hours-item .value {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 500;
    letter-spacing: -0.01em;
  }

  /* ========================================
     SECTION HEAD
     ======================================== */
  .section-head { text-align: center; margin-bottom: 64px; }
  .section-head .eyebrow { display: block; margin-bottom: 16px; }
  .section-head h2 {
    font-size: clamp(36px, 5vw, 64px);
    margin-bottom: 16px;
    line-height: 1.05;
  }
  .section-head p {
    color: var(--shiro-soft);
    font-size: 17px;
    max-width: 560px;
    margin: 0 auto;
    line-height: 1.7;
  }
  .section-head .jp-deco {
    display: block;
    margin: 20px auto 0;
    width: 60px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--wasabi), transparent);
  }

  /* ========================================
     OMAKASE MENU with TABS
     ======================================== */
  .menu-section { background: var(--kuro); position: relative; }
  .menu-section::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border), transparent);
  }
  .menu-tabs {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 56px;
  }
  .menu-tab {
    background: transparent;
    color: var(--shiro-soft);
    border: 1px solid var(--border);
    padding: 12px 24px;
    border-radius: 6px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s var(--spring);
  }
  .menu-tab:hover {
    border-color: var(--wasabi);
    color: var(--wasabi);
  }
  .menu-tab.active {
    background: var(--indigo);
    color: var(--shiro);
    border-color: var(--indigo);
  }

  .menu-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 80px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .menu-item {
    padding: 22px 0;
    border-bottom: 1px solid var(--border);
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 16px;
    align-items: baseline;
    transition: all 0.3s var(--smooth);
  }
  .menu-item:hover { padding-left: 12px; }
  .menu-item-info h4 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 19px;
    letter-spacing: -0.02em;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--shiro);
  }
  .menu-item-info p {
    color: var(--shiro-muted);
    font-size: 13px;
    line-height: 1.5;
  }
  .menu-item .tags {
    display: inline-flex;
    gap: 6px;
    margin-top: 8px;
  }
  .menu-item .tag {
    font-family: var(--font-mono);
    font-size: 9px;
    padding: 3px 10px;
    border-radius: 4px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: var(--kuro-surface);
    color: var(--shiro-soft);
    border: 1px solid var(--border);
  }
  .menu-item .tag.vege { background: ${hexToRgba(c.colors.accent, 0.1)}; color: var(--wasabi); border-color: ${hexToRgba(c.colors.accent, 0.2)}; }
  .menu-item .tag.spicy { background: ${hexToRgba('#ff4444', 0.1)}; color: #ff6b6b; border-color: ${hexToRgba('#ff4444', 0.15)}; }
  .menu-item .tag.new { background: ${hexToRgba(c.colors.primary, 0.15)}; color: ${tintHex(c.colors.primary, 0.4)}; border-color: ${hexToRgba(c.colors.primary, 0.25)}; }
  .menu-item .tag.omakase { background: ${hexToRgba(c.colors.accent, 0.12)}; color: var(--wasabi); border-color: ${hexToRgba(c.colors.accent, 0.2)}; }

  .menu-item-price {
    font-family: var(--font-mono);
    font-weight: 600;
    font-size: 15px;
    color: var(--wasabi);
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .menu-footer {
    text-align: center;
    margin-top: 48px;
    color: var(--shiro-muted);
    font-size: 13px;
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
  }
  .menu-footer em { color: var(--wasabi); font-style: normal; }

  /* ========================================
     CHEF'S TABLE SECTION
     ======================================== */
  .chefs-table {
    background: var(--kuro);
    position: relative;
    overflow: hidden;
  }
  .chefs-table::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 800px 500px at 50% 50%, ${hexToRgba(c.colors.primary, 0.06)} 0%, transparent 70%);
    pointer-events: none;
  }
  .chefs-table-grid {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: 80px;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  .chefs-table-visual {
    position: relative;
    aspect-ratio: 4/5;
    border-radius: 20px;
    overflow: hidden;
    background: linear-gradient(160deg, ${bgSurface} 0%, var(--kuro) 100%);
    border: 1px solid var(--border);
  }
  .chefs-table-visual-inner {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 80px;
    opacity: 0.04;
    color: var(--shiro);
    user-select: none;
    font-family: var(--font-display);
    font-style: italic;
  }
  .chefs-table-quote {
    position: absolute;
    top: 24px; left: 24px; right: 24px;
    background: ${hexToRgba(c.colors.background, 0.92)};
    padding: 20px 24px;
    border-radius: 14px;
    backdrop-filter: blur(16px);
    border: 1px solid var(--border);
  }
  .chefs-table-quote p {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 16px;
    line-height: 1.5;
    color: var(--shiro);
    letter-spacing: -0.01em;
    font-variation-settings: "opsz" 24, "SOFT" 80;
  }
  .chefs-table-quote .signature {
    margin-top: 12px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--wasabi);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .chefs-table-content h2 {
    font-size: clamp(36px, 4.5vw, 56px);
    margin-bottom: 24px;
    line-height: 1.05;
  }
  .chefs-table-content .description {
    color: var(--shiro-soft);
    font-size: 17px;
    line-height: 1.7;
    margin-bottom: 32px;
  }
  .chef-features {
    display: grid;
    gap: 14px;
    margin-bottom: 36px;
  }
  .chef-feature {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 14px;
    color: var(--shiro-soft);
  }
  .chef-feature svg {
    width: 18px; height: 18px;
    color: var(--wasabi);
    flex-shrink: 0;
  }
  .chef-price {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--shiro-muted);
    letter-spacing: 0.04em;
    padding-top: 20px;
    border-top: 1px solid var(--border);
  }
  .chef-price strong {
    font-family: var(--font-display);
    font-size: 32px;
    color: var(--wasabi);
    font-weight: 500;
    margin-right: 8px;
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews {
    background: var(--kuro-light);
    position: relative;
  }
  .reviews::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border), transparent);
  }
  .reviews-header {
    text-align: center;
    margin-bottom: 48px;
  }
  .reviews-score {
    display: inline-flex;
    align-items: center;
    gap: 20px;
    background: var(--kuro-surface);
    padding: 20px 28px;
    border-radius: 14px;
    border: 1px solid var(--border);
    margin-bottom: 24px;
  }
  .reviews-score .big {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 48px;
    color: var(--wasabi);
    line-height: 1;
    letter-spacing: -0.03em;
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }
  .reviews-score .meta { text-align: left; }
  .reviews-score .stars {
    display: flex;
    gap: 2px;
    margin-bottom: 4px;
  }
  .reviews-score .stars svg {
    width: 16px; height: 16px;
    color: var(--wasabi);
    fill: var(--wasabi);
  }
  .reviews-score .count {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--shiro-muted);
    letter-spacing: 0.04em;
  }

  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .review-card {
    background: var(--kuro-surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px 24px;
    transition: border-color 0.3s, transform 0.3s;
  }
  .review-card:hover {
    border-color: ${hexToRgba(c.colors.primary, 0.3)};
    transform: translateY(-2px);
  }
  .review-stars {
    display: flex;
    gap: 2px;
    margin-bottom: 16px;
  }
  .review-stars svg {
    width: 13px; height: 13px;
    color: var(--wasabi);
    fill: var(--wasabi);
  }
  .review-text {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 15px;
    line-height: 1.55;
    margin-bottom: 20px;
    letter-spacing: -0.005em;
    color: var(--shiro-soft);
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
    width: 36px; height: 36px;
    border-radius: 6px;
    background: var(--indigo-soft);
    color: ${tintHex(c.colors.primary, 0.4)};
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-weight: 600;
    font-size: 12px;
  }
  .review-name {
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 2px;
    color: var(--shiro);
  }
  .review-meta {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--shiro-muted);
    letter-spacing: 0.04em;
  }

  /* ========================================
     RESERVATION
     ======================================== */
  .reserve {
    background: var(--kuro);
    position: relative;
  }
  .reserve::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 600px 400px at 30% 50%, ${hexToRgba(c.colors.primary, 0.05)} 0%, transparent 70%);
    pointer-events: none;
  }
  .reserve-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  .reserve-text h2 {
    font-size: clamp(36px, 4.5vw, 56px);
    line-height: 1.05;
    margin-bottom: 20px;
  }
  .reserve-text h2 em {
    font-style: italic;
    color: var(--wasabi);
  }
  .reserve-text p {
    color: var(--shiro-soft);
    font-size: 16px;
    line-height: 1.7;
    margin-bottom: 24px;
  }
  .reserve-features {
    display: grid;
    gap: 12px;
    margin-top: 24px;
  }
  .reserve-feature {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 14px;
    color: var(--shiro-soft);
  }
  .reserve-feature svg {
    width: 18px; height: 18px;
    color: var(--wasabi);
    flex-shrink: 0;
  }

  .reserve-form {
    background: var(--kuro-surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 40px 36px;
  }
  .reserve-form-title {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--wasabi);
    margin-bottom: 24px;
  }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .form-row.full { grid-template-columns: 1fr; }
  .form-field { display: flex; flex-direction: column; gap: 6px; }
  .form-field label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--shiro-muted);
  }
  .form-field input,
  .form-field select,
  .form-field textarea {
    background: ${hexToRgba(c.colors.text, 0.04)};
    border: 1px solid var(--border);
    color: var(--shiro);
    padding: 14px 16px;
    border-radius: 8px;
    font-family: var(--font-body);
    font-size: 14px;
    transition: border-color 0.2s;
  }
  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus {
    outline: none;
    border-color: var(--wasabi);
  }
  .form-field input::placeholder,
  .form-field textarea::placeholder {
    color: var(--shiro-muted);
  }
  .form-field select {
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(c.colors.text)}' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
    padding-right: 40px;
  }
  .form-field textarea { resize: vertical; min-height: 80px; }
  .form-submit {
    margin-top: 8px;
    width: 100%;
    padding: 16px;
    border-radius: 8px;
    background: var(--indigo);
    color: var(--shiro);
    border: 1px solid ${hexToRgba(c.colors.primary, 0.5)};
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s var(--spring);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .form-submit:hover {
    background: var(--wasabi);
    color: var(--kuro);
    border-color: var(--wasabi);
    transform: translateY(-2px);
  }

  /* ========================================
     LOCATION + MAP
     ======================================== */
  .location {
    background: var(--kuro-light);
    position: relative;
  }
  .location::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border), transparent);
  }
  .location-grid {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 60px;
    align-items: stretch;
  }
  .location-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .location-info h2 {
    font-size: clamp(32px, 4vw, 48px);
    line-height: 1.05;
    margin-bottom: 28px;
  }
  .location-detail {
    display: flex;
    gap: 16px;
    padding: 18px 0;
    border-bottom: 1px solid var(--border);
  }
  .location-detail:last-of-type { border-bottom: none; }
  .location-detail .icon {
    width: 42px; height: 42px;
    background: var(--indigo-soft);
    color: ${tintHex(c.colors.primary, 0.4)};
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .location-detail .icon svg { width: 20px; height: 20px; stroke-width: 2; }
  .location-detail .label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--shiro-muted);
    margin-bottom: 4px;
  }
  .location-detail .value {
    color: var(--shiro-soft);
    font-size: 14px;
    line-height: 1.5;
  }
  .location-detail .value strong { color: var(--wasabi); font-weight: 600; }

  .location-map {
    background: var(--kuro-surface);
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    min-height: 480px;
    border: 1px solid var(--border);
  }
  .map-svg {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
  }
  .map-block { fill: ${hexToRgba(c.colors.text, 0.03)}; }
  .map-park { fill: ${hexToRgba(c.colors.accent, 0.05)}; }
  .map-street { stroke: ${hexToRgba(c.colors.text, 0.05)}; stroke-width: 2; fill: none; }
  .map-street-major { stroke: ${hexToRgba(c.colors.text, 0.08)}; stroke-width: 4; fill: none; stroke-linecap: round; }
  .map-street-label {
    fill: ${hexToRgba(c.colors.text, 0.25)};
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
    width: 48px; height: 48px;
    background: var(--indigo);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--shiro);
    box-shadow: 0 8px 24px ${hexToRgba(c.colors.primary, 0.4)};
    animation: pinFloat 3s ease-in-out infinite;
  }
  .map-pin-circle svg { width: 24px; height: 24px; stroke-width: 2; }
  .map-pin-pulse {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 48px; height: 48px;
    border-radius: 10px;
    border: 2px solid var(--indigo);
    opacity: 0;
    animation: mapPulse 2.5s ease-out infinite;
  }
  @keyframes pinFloat {
    0%, 100% { transform: translate(-50%, -100%) translateY(0); }
    50%      { transform: translate(-50%, -100%) translateY(-6px); }
  }
  @keyframes mapPulse {
    0%   { width: 48px; height: 48px; opacity: 1; }
    100% { width: 160px; height: 160px; opacity: 0; }
  }

  .map-overlay {
    position: absolute;
    bottom: 20px; left: 20px;
    background: ${hexToRgba(c.colors.background, 0.92)};
    border-radius: 14px;
    padding: 16px 20px;
    backdrop-filter: blur(12px);
    z-index: 3;
    max-width: 220px;
    border: 1px solid var(--border);
  }
  .map-overlay .label {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--wasabi);
    margin-bottom: 4px;
  }
  .map-overlay .name {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 16px;
    color: var(--shiro);
    letter-spacing: -0.01em;
    margin-bottom: 6px;
  }
  .map-overlay .actions {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }
  .map-overlay .action {
    flex: 1;
    background: var(--indigo);
    color: var(--shiro);
    padding: 8px 10px;
    border-radius: 6px;
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-align: center;
    transition: all 0.3s;
  }
  .map-overlay .action:hover { background: var(--wasabi); color: var(--kuro); }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section {
    background: var(--kuro);
    position: relative;
  }
  .faq-section::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border), transparent);
  }
  .faq-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 48px;
  }
  .faq-item {
    background: var(--kuro-surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .faq-item:hover { border-color: ${hexToRgba(c.colors.primary, 0.3)}; }
  .faq-q {
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    padding: 20px 24px;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    font-family: var(--font-body);
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--shiro);
    transition: background 0.2s;
  }
  .faq-q:hover { background: ${hexToRgba(c.colors.text, 0.03)}; }
  .faq-icon {
    width: 26px; height: 26px;
    border-radius: 6px;
    background: var(--kuro-light);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    color: var(--wasabi);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .faq-item.open .faq-icon { transform: rotate(45deg); background: var(--indigo); color: var(--shiro); }
  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), padding 0.35s;
    font-size: 0.85rem;
    color: var(--shiro-soft);
    line-height: 1.75;
    padding: 0 24px;
  }
  .faq-item.open .faq-a { max-height: 400px; padding: 0 24px 20px; }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: var(--kuro);
    color: var(--shiro-muted);
    padding: 64px 0 32px;
    border-top: 1px solid var(--border);
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 48px;
    margin-bottom: 48px;
  }
  .footer-brand .logo { color: var(--shiro); margin-bottom: 16px; }
  .footer-brand p {
    font-size: 13px;
    line-height: 1.65;
    max-width: 300px;
    color: var(--shiro-muted);
  }
  .footer-col h4 {
    color: var(--shiro);
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    margin-bottom: 20px;
  }
  .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .footer-col a { font-size: 13px; transition: color 0.2s; }
  .footer-col a:hover { color: var(--wasabi); }
  .footer-bottom {
    border-top: 1px solid var(--border);
    padding-top: 24px;
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    color: var(--shiro-muted);
  }
  .footer-bottom a:hover { color: var(--wasabi); }

  /* ========================================
     STICKY MOBILE CTA
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 16px; left: 16px; right: 16px;
    background: var(--indigo);
    color: var(--shiro);
    padding: 14px 24px;
    border-radius: 10px;
    z-index: 100;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: center;
    box-shadow: 0 8px 32px ${hexToRgba(c.colors.background, 0.8)};
    border: 1px solid ${hexToRgba(c.colors.primary, 0.5)};
  }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .hero-layout { grid-template-columns: 1fr; gap: 48px; }
    .hero-visual { max-width: 480px; }
    .menu-grid { grid-template-columns: 1fr; gap: 0; }
    .reviews-grid { grid-template-columns: 1fr; }
    .chefs-table-grid { grid-template-columns: 1fr; gap: 48px; }
    .chefs-table-visual { max-width: 480px; }
    .location-grid { grid-template-columns: 1fr; }
    .reserve-grid { grid-template-columns: 1fr; gap: 48px; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .hours-grid { grid-template-columns: 1fr 1fr; gap: 20px; }
  }
  @media (max-width: 768px) {
    section { padding: 64px 0; }
    .container { padding: 0 20px; }
    .nav-links { display: none; }
    .nav-cta { display: none; }
    .nav-burger { display: block; }
    .hero { min-height: auto; padding: 48px 0 64px; }
    .form-row { grid-template-columns: 1fr; }
    .hours-grid { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .footer-bottom { flex-direction: column; gap: 12px; }
    .menu-tabs { gap: 4px; }
    .menu-tab { padding: 10px 16px; font-size: 10px; }
    .mobile-cta { display: block; }
    body { padding-bottom: 76px; }
    .reviews-score { flex-direction: column; gap: 12px; text-align: center; }
    .reviews-score .meta { text-align: center; }
    .faq-grid { grid-template-columns: 1fr; }
    .about-stats { grid-template-columns: 1fr; gap: 20px; }
    .about-stat { border-right: none; border-bottom: 1px solid var(--border); padding: 14px 0; }
    .about-stat:last-child { border-bottom: none; }
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
      <a href="#menu">Omakase</a>
      <a href="#chefs-table">Chef's Table</a>
      <a href="#reviews">Bewertungen</a>
      <a href="#location">Standort</a>
    </div>
    <a href="#reserve" class="nav-cta">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
      ${esc(c.ctaText)}
    </a>
    <button class="nav-burger" aria-label="Menu" onclick="document.querySelector('.nav-links').style.display=document.querySelector('.nav-links').style.display==='flex'?'none':'flex'">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
    </button>
  </div>
</nav>

<!-- ====== HERO ====== -->
<section class="hero"${c.heroImageUrl ? ` style="background-image:linear-gradient(to bottom,${hexToRgba(c.colors.background, 0.85)},${c.colors.background}),url('${esc(c.heroImageUrl)}');background-size:cover;background-position:center"` : ''}>
  <div class="container hero-layout">
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

      <div class="hero-actions">
        <a href="#reserve" class="btn-primary">
          ${esc(c.ctaText)}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
        <a href="#menu" class="btn-ghost">
          Omakase-Karte
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17l10-10M17 17V7H7"/></svg>
        </a>
      </div>

      <div class="hero-trust">
        ${c.reviews.length > 0 ? `<div class="trust-item">
          <div class="stars">
            ${generateStarsSvg(5)}
          </div>
          <strong>${(c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length).toFixed(1).replace('.', ',')}</strong> &middot; ${c.reviews.length} Bewertungen
        </div>` : ''}
      </div>
    </div>

    <!-- Hero Visual -->
    <div class="hero-visual">
      <div class="hero-visual-inner">&#39854;</div>
      <div class="hero-visual-badge">
        <div class="label">Omakase Experience</div>
        <div class="val">12-Gang Abendmenu &middot; Ab 89&euro;</div>
      </div>
    </div>
  </div>
</section>

<!-- ====== OPENING HOURS BAR ====== -->
${c.openingHours.length > 0 ? `<section class="hours-bar" style="padding: 28px 0;">
  <div class="container">
    <div class="hours-grid">
      ${hoursHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== OMAKASE MENU ====== -->
${c.menuCategories.length > 0 ? `<section id="menu" class="menu-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.menuSectionTitle || 'Omakase-Karte')}</span>
      <h2 class="display">${c.menuSectionSubtitle || 'Die <em>Karte</em>.'}</h2>
      ${c.menuSectionDescription ? `<p>${esc(c.menuSectionDescription)}</p>` : `<p>Frische Zutaten, pr&auml;zise Handwerkskunst &mdash; jedes St&uuml;ck ein Erlebnis.</p>`}
      <span class="jp-deco"></span>
    </div>

    <div class="menu-tabs">
      ${menuTabs}
    </div>

    ${menuItemsHtml}

    <div class="menu-footer">
      <em>&#9670;</em> Alle Preise in Euro inkl. MwSt. &middot; Allergene auf Anfrage
    </div>
  </div>
</section>` : ''}

<!-- ====== CHEF'S TABLE ====== -->
<section id="chefs-table" class="chefs-table">
  <div class="container chefs-table-grid">
    <div class="chefs-table-visual">
      <div class="chefs-table-visual-inner">&#21280;&#20154;</div>
      ${c.chefQuote ? `<div class="chefs-table-quote">
        <p>&laquo;${esc(c.chefQuote)}&raquo;</p>
        ${c.chefName ? `<div class="signature">&mdash; ${esc(c.chefName)}${c.chefRole ? `, ${esc(c.chefRole)}` : ''}</div>` : ''}
      </div>` : ''}
    </div>
    <div class="chefs-table-content">
      <span class="eyebrow" style="display:block; margin-bottom:16px;">${esc(c.chefTableTitle || "Chef's Table")}</span>
      <h2 class="display">${c.chefTableSubtitle || "Das <em>Omakase</em>-Erlebnis."}</h2>
      <p class="description">${esc(c.chefTableDescription || 'Nehmen Sie Platz an unserem exklusiven Chef\'s Table und erleben Sie die Kunst des Sushi hautnah. Unser Itamae bereitet jeden Gang vor Ihren Augen zu - mit saisonalen Zutaten hoechster Qualitaet aus Tsukiji und regionalen Quellen.')}</p>

      <div class="chef-features">
        ${chefTableFeaturesHtml}
      </div>

      ${c.chefTablePrice ? `<div class="chef-price">
        <strong>${esc(c.chefTablePrice)}</strong> pro Person
      </div>` : ''}
    </div>
  </div>
</section>

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
      <span class="eyebrow">${esc(c.reviewsSectionTitle || 'Gaeste-Stimmen')}</span>
      <h2 class="display">Was unsere G&auml;ste <em>sagen</em>.</h2>
      <span class="jp-deco"></span>
    </div>

    <div class="reviews-grid">
      ${reviewsHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== RESERVATION ====== -->
${c.reservationEnabled !== false ? `<section id="reserve" class="reserve">
  <div class="container reserve-grid">
    <div class="reserve-text">
      <span class="eyebrow" style="display:block; margin-bottom:16px;">${esc(c.reserveTitle || 'Reservierung')}</span>
      <h2 class="display">${c.reserveSubtitle || 'Ihr Platz am <em>Tresen</em>.'}</h2>
      <p>Sichern Sie sich Ihren Platz f&uuml;r ein unvergessliches Omakase-Erlebnis. Begrenzte Pl&auml;tze &mdash; wir empfehlen eine fr&uuml;hzeitige Reservierung.</p>

      ${reserveFeaturesHtml.length > 0 ? `<div class="reserve-features">${reserveFeaturesHtml}</div>` : ''}
    </div>

    <form class="reserve-form" id="reserve-form">
      <div class="reserve-form-title">Tisch reservieren</div>

      <div class="form-row">
        <div class="form-field">
          <label>Name*</label>
          <input type="text" name="name" required placeholder="Vor- und Nachname">
        </div>
        <div class="form-field">
          <label>Telefon*</label>
          <input type="tel" name="phone" required placeholder="${c.phone ? esc(c.phone) : 'Telefonnummer'}">
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label>E-Mail*</label>
          <input type="email" name="email" required placeholder="mail@beispiel.de">
        </div>
        <div class="form-field">
          <label>Personen</label>
          <select name="personen">
            <option>2 Personen</option>
            <option>3 Personen</option>
            <option>4 Personen</option>
            <option>5 Personen</option>
            <option>6 Personen</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label>Datum*</label>
          <input type="date" name="datum" required>
        </div>
        <div class="form-field">
          <label>Uhrzeit*</label>
          <select name="uhrzeit" required>
            <option>18:00</option>
            <option>18:30</option>
            <option>19:00</option>
            <option selected>19:30</option>
            <option>20:00</option>
            <option>20:30</option>
            <option>21:00</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label>Erlebnis</label>
          <select name="erlebnis">
            <option>Omakase 12-Gang</option>
            <option>Chef's Table</option>
            <option>A la Carte</option>
            <option>Sake-Begleitung</option>
          </select>
        </div>
        <div class="form-field">
          <label>Anlass (optional)</label>
          <select name="anlass">
            <option>&mdash;</option>
            <option>Geburtstag</option>
            <option>Jahrestag</option>
            <option>Gesch&auml;ftsessen</option>
            <option>Date Night</option>
            <option>Feier</option>
          </select>
        </div>
      </div>

      <div class="form-row full">
        <div class="form-field">
          <label>Allergien oder W&uuml;nsche (optional)</label>
          <textarea name="message" placeholder="Allergien, Unvertr&auml;glichkeiten, Sitzplatzw&uuml;nsche ..."></textarea>
        </div>
      </div>

      <div style="position:absolute;left:-9999px"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>

      <button type="submit" class="form-submit" id="reserve-submit">
        Reservierung abschicken
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </button>
    </form>
  </div>
</section>` : ''}

<!-- ====== LOCATION + MAP ====== -->
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

    <!-- Stilisierte Map -->
    <div class="location-map">
      <svg class="map-svg" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid slice">
        <path class="map-park" d="M 40 30 L 200 40 L 220 140 L 40 130 Z"/>
        <rect class="map-block" x="240" y="40" width="80" height="60" rx="3"/>
        <rect class="map-block" x="330" y="40" width="80" height="60" rx="3"/>
        <rect class="map-block" x="420" y="40" width="60" height="60" rx="3"/>
        <rect class="map-block" x="490" y="50" width="80" height="80" rx="3"/>
        <rect class="map-block" x="40" y="160" width="80" height="100" rx="3"/>
        <rect class="map-block" x="130" y="160" width="80" height="80" rx="3"/>
        <rect class="map-block" x="220" y="160" width="100" height="80" rx="3"/>
        <rect class="map-block" x="330" y="170" width="80" height="80" rx="3"/>
        <rect class="map-block" x="420" y="160" width="60" height="100" rx="3"/>
        <rect class="map-block" x="490" y="160" width="80" height="80" rx="3"/>
        <rect class="map-block" x="40" y="300" width="100" height="80" rx="3"/>
        <rect class="map-block" x="150" y="290" width="80" height="100" rx="3"/>
        <rect class="map-block" x="240" y="300" width="100" height="80" rx="3"/>
        <rect class="map-block" x="350" y="300" width="80" height="100" rx="3"/>
        <rect class="map-block" x="440" y="290" width="130" height="100" rx="3"/>
        <rect class="map-block" x="40" y="410" width="80" height="80" rx="3"/>
        <rect class="map-block" x="130" y="410" width="100" height="80" rx="3"/>
        <rect class="map-block" x="240" y="410" width="80" height="80" rx="3"/>
        <rect class="map-block" x="330" y="410" width="100" height="80" rx="3"/>
        <rect class="map-block" x="440" y="410" width="130" height="80" rx="3"/>
        <line class="map-street-major" x1="0" y1="280" x2="600" y2="280"/>
        <line class="map-street-major" x1="300" y1="0" x2="300" y2="500"/>
        <line class="map-street" x1="0" y1="150" x2="600" y2="150"/>
        <line class="map-street" x1="0" y1="395" x2="600" y2="395"/>
        <line class="map-street" x1="120" y1="0" x2="120" y2="500"/>
        <line class="map-street" x1="430" y1="0" x2="430" y2="500"/>
        <text class="map-street-label" x="310" y="275">${esc(c.businessName)}</text>
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

${(c.faqItems || []).length > 0 ? `<!-- ====== FAQ ====== -->
<section class="faq-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">H&auml;ufige Fragen</span>
      <h2 class="display">Fragen &amp; <em>Antworten</em>.</h2>
      <span class="jp-deco"></span>
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
<a href="#reserve" class="mobile-cta">${esc(c.ctaText)} &rarr;</a>

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

  /* Smooth scroll for anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* Reserve form submission */
  ${siteId ? `(function() {
    var form = document.getElementById('reserve-form');
    if (form) {
      form.addEventListener('submit', function(ev) {
        ev.preventDefault();
        var btn = document.getElementById('reserve-submit');
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
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:var(--shiro);font-family:var(--font-display);font-size:1.5rem;margin-bottom:12px">Arigatou gozaimasu!</h3><p style="color:var(--shiro-soft);font-size:1rem">Wir best\\u00e4tigen Ihre Reservierung in K\\u00fcrze.</p></div>';
          } else {
            alert(d.error || 'Fehler beim Senden');
            btn.textContent = 'Reservierung abschicken';
            btn.disabled = false;
          }
        })
        .catch(function() {
          alert('Verbindungsfehler');
          btn.textContent = 'Reservierung abschicken';
          btn.disabled = false;
        });
      });
    }
  })();` : `document.getElementById('reserve-form').addEventListener('submit', function(ev) {
    ev.preventDefault();
    alert('Demo \\u2014 kein Formular angebunden.');
  });`}
</script>

<!-- Cookie Banner -->
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba(c.colors.background, 0.97)};backdrop-filter:blur(16px);color:var(--shiro);padding:16px 24px;font-size:.82rem;line-height:1.6;border-top:1px solid var(--border)">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:var(--shiro-soft)">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--wasabi);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--indigo);color:var(--shiro);border:1px solid ${hexToRgba(c.colors.primary, 0.5)};padding:8px 20px;border-radius:6px;font-weight:600;font-size:.8rem;cursor:pointer;font-family:inherit;transition:all .2s" onmouseover="this.style.background='${c.colors.accent}';this.style.color='${c.colors.background}'" onmouseout="this.style.background='var(--indigo)';this.style.color='var(--shiro)'">Verstanden</button>
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
