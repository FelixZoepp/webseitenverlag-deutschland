export interface ReinigungPrivatConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Sky-Blue (#3b82c8)
    accent: string     // Mint
    background: string // Hellgrau (#f2f4f6)
    text: string       // Dark text
  }
  phone?: string
  email?: string
  address?: string
  city?: string
  openingHours: { days: string; hours: string }[]
  services: { name: string; description: string; icon?: string; price?: string; tag?: string }[]
  pricingPlans: { name: string; price: string; unit?: string; features: string[]; highlighted?: boolean }[]
  beforeAfterItems?: { label: string; beforeUrl?: string; afterUrl?: string }[]
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
  emergencyPhone?: string
  emergencyAvailable?: boolean
  notdienstText?: string
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

export function renderReinigungPrivatTemplate(config: ReinigungPrivatConfig, siteId?: string): string {
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

  // Services HTML
  const serviceIconMap: Record<string, string> = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    window: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>',
    moving: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    sofa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0H6a2 2 0 0 0-4 0z"/><path d="M4 18v2"/><path d="M20 18v2"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z"/></svg>',
  }
  const defaultIcons = ['home', 'window', 'moving', 'sofa', 'repeat', 'sparkle']

  const servicesHtml = c.services.map((svc, i) => {
    const iconKey = svc.icon || defaultIcons[i % defaultIcons.length]
    const iconSvg = serviceIconMap[iconKey] || serviceIconMap.sparkle
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

  // Pricing HTML
  const pricingHtml = c.pricingPlans.map(plan => `
        <div class="pricing-card${plan.highlighted ? ' highlighted' : ''}">
          ${plan.highlighted ? '<div class="pricing-badge">Beliebt</div>' : ''}
          <h3>${esc(plan.name)}</h3>
          <div class="pricing-amount">
            <span class="price">${esc(plan.price)}</span>
            ${plan.unit ? `<span class="unit">${esc(plan.unit)}</span>` : ''}
          </div>
          <ul class="pricing-features">
            ${plan.features.map(f => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>${esc(f)}</li>`).join('\n            ')}
          </ul>
          <a href="#contact" class="pricing-cta">${plan.highlighted ? 'Jetzt buchen' : 'Anfragen'}</a>
        </div>`).join('\n')

  // Before/After HTML
  const beforeAfterItems = c.beforeAfterItems || [
    { label: 'K&uuml;che nach Grundreinigung' },
    { label: 'Bad-Komplettreinigung' },
    { label: 'Fenster streifenfrei' },
    { label: 'Polster-Tiefenreinigung' },
  ]
  const baGradients = [
    `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 100%)`,
    `linear-gradient(135deg, ${c.colors.accent} 0%, ${accentDark} 100%)`,
    `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.2)} 0%, ${c.colors.primary} 100%)`,
    `linear-gradient(135deg, ${c.colors.accent} 0%, ${c.colors.primary} 100%)`,
  ]
  const beforeAfterHtml = beforeAfterItems.slice(0, 4).map((item, i) => {
    const bgStyle = item.beforeUrl
      ? `background-image:url('${esc(item.beforeUrl)}');background-size:cover;background-position:center`
      : `background:${baGradients[i] || baGradients[0]}`
    return `
        <div class="ba-card">
          <div class="ba-image" style="${bgStyle}">
            <div class="ba-label">Vorher / Nachher</div>
          </div>
          <div class="ba-caption">${esc(item.label)}</div>
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
    { icon: 'shield', title: 'Versichert', value: 'Haftpflicht &amp; Betriebshaftpflicht' },
    { icon: 'clock', title: 'P&uuml;nktlich', value: '98% Termintreue' },
    { icon: 'star', title: 'Top bewertet', value: `${c.reviews.length > 0 ? (c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length).toFixed(1) : '5.0'} / 5.0 Sterne` },
    { icon: 'check', title: 'Festpreis', value: 'Keine versteckten Kosten' },
  ]
  const trustIconMap: Record<string, string> = {
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66"/><path d="M20.99 3.01C18 7 14 12 8 15"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
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

  // Service areas
  const serviceAreas = c.serviceAreas || ['M&uuml;nchen-Mitte', 'Schwabing', 'Bogenhausen', 'Haidhausen', 'Sendling', 'Pasing', 'Laim', 'Neuhausen', 'Nymphenburg', 'Maxvorstadt']
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

  // Footer columns
  const footerColumns = c.footerColumns || [
    { title: 'Services', links: [
      { label: 'Wohnungsreinigung', href: '#services' },
      { label: 'Fensterreinigung', href: '#services' },
      { label: 'Umzugsreinigung', href: '#services' },
      { label: 'Festpreise', href: '#pricing' },
    ]},
    { title: 'Unternehmen', links: [
      { label: '&Uuml;ber uns', href: '#about' },
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

<!-- Schema.org HomeAndConstructionBusiness -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "name": "${esc(c.businessName)}",
  "description": "${esc(c.tagline)}",
  ${c.address ? `"address": { "@type": "PostalAddress", "streetAddress": "${esc(c.address)}"${c.city ? `, "addressLocality": "${esc(c.city)}"` : ''} },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  "serviceType": ["Unterhaltsreinigung", "Grundreinigung", "Fensterreinigung", "Polsterreinigung", "Umzugsreinigung"],
  "areaServed": {
    "@type": "City",
    "name": "${esc(c.city || 'M\\u00fcnchen')}"
  },
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
    --sky:           ${esc(c.colors.primary)};
    --sky-dark:      ${primaryDark};
    --sky-soft:      ${primarySoft};
    --mint:          ${esc(c.colors.accent)};
    --mint-dark:     ${accentDark};
    --grau:          ${esc(c.colors.background)};
    --grau-tint:     ${bgTint};
    --grau-warm:     ${bgWarm};
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
    background: var(--grau);
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
    color: var(--sky);
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }

  .eyebrow {
    color: var(--sky);
    font-family: var(--font-mono);
    font-weight: 500;
    font-size: 12px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .container { max-width: 1280px; margin: 0 auto; padding: 0 32px; position: relative; }
  section { padding: 96px 0; position: relative; }

  /* ========================================
     ANNOUNCEMENT BAR (24h-Notdienst)
     ======================================== */
  .announce {
    background: var(--sky);
    color: var(--white);
    text-align: center;
    padding: 10px 16px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }
  .announce strong { color: var(--mint); }
  .announce a { color: var(--white); text-decoration: underline; font-weight: 700; }

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
    background: var(--sky);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: var(--white);
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 18px;
    font-style: italic;
    transform: rotate(-3deg);
  }
  .nav-links { display: flex; gap: 32px; font-size: 15px; font-weight: 500; }
  .nav-links a { transition: color 0.2s; color: var(--ink); }
  .nav-links a:hover { color: var(--sky); }
  .nav-cta {
    background: var(--sky); color: var(--white);
    padding: 12px 22px; border-radius: 999px;
    font-size: 13px; font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: all 0.3s var(--spring);
    display: inline-flex; align-items: center; gap: 8px;
  }
  .nav-cta:hover { background: var(--sky-dark); transform: translateY(-1px); box-shadow: var(--shadow-hover); }
  .nav-cta svg { width: 14px; height: 14px; }

  /* Hamburger */
  .nav-hamburger {
    display: none;
    background: none; border: none; cursor: pointer; padding: 4px;
    color: var(--ink);
  }
  .nav-hamburger svg { width: 24px; height: 24px; }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    background: var(--white);
    padding: 60px 0 80px;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 15% 25%, var(--grau-warm) 1px, transparent 1px),
      radial-gradient(circle at 85% 70%, var(--grau-warm) 1.5px, transparent 1.5px);
    background-size: 48px 48px, 72px 72px;
    pointer-events: none;
    opacity: 0.6;
  }
  .hero::after {
    content: '';
    position: absolute;
    top: -100px; right: -100px;
    width: 400px; height: 400px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.primary, 0.08)} 0%, transparent 70%);
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
    background: var(--grau);
    color: var(--sky);
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
    background: var(--mint);
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
    font-size: clamp(16px, 2vw, 22px);
    font-family: var(--font-body);
    font-weight: 400;
    color: var(--ink-soft);
    line-height: 1.5;
    margin-top: 16px;
    letter-spacing: 0;
  }
  .hero-lead {
    font-size: 1.15rem;
    color: var(--ink-soft);
    max-width: 520px;
    margin-bottom: 32px;
    line-height: 1.7;
  }
  .hero-actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    align-items: center;
  }
  .btn-primary {
    background: var(--sky); color: var(--white);
    padding: 16px 32px; border-radius: 999px;
    font-weight: 600; font-size: 15px;
    display: inline-flex; align-items: center; gap: 10px;
    transition: all 0.3s var(--spring);
    font-family: var(--font-body);
    border: none; cursor: pointer;
  }
  .btn-primary:hover { background: var(--sky-dark); transform: translateY(-2px); box-shadow: var(--shadow-hover); }
  .btn-primary svg { width: 18px; height: 18px; }
  .btn-secondary {
    color: var(--ink);
    padding: 16px 24px;
    font-weight: 500; font-size: 15px;
    display: inline-flex; align-items: center; gap: 8px;
    transition: color 0.2s;
    font-family: var(--font-body);
  }
  .btn-secondary:hover { color: var(--sky); }
  .btn-secondary svg { width: 18px; height: 18px; }

  /* Hero Visual */
  .hero-visual {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .hero-image-container {
    width: 100%;
    aspect-ratio: 4/3;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: var(--shadow-image);
    position: relative;
  }
  .hero-image-container img {
    width: 100%; height: 100%;
    object-fit: cover;
  }
  .hero-image-placeholder {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, var(--sky) 0%, ${primaryDark} 60%, ${darkenHex(c.colors.primary, 0.4)} 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hero-image-placeholder svg {
    width: 80px; height: 80px;
    color: ${hexToRgba('#ffffff', 0.3)};
  }
  .hero-floating-badge {
    position: absolute;
    bottom: -16px; right: -16px;
    background: var(--white);
    border-radius: 16px;
    padding: 16px 20px;
    box-shadow: var(--shadow-card);
    display: flex; align-items: center; gap: 12px;
    font-weight: 600;
    font-size: 14px;
  }
  .hero-floating-badge .badge-icon {
    width: 40px; height: 40px;
    background: ${hexToRgba(c.colors.primary, 0.1)};
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: var(--sky);
  }
  .hero-floating-badge .badge-icon svg { width: 20px; height: 20px; }
  .hero-floating-badge .badge-text { font-size: 13px; color: var(--ink-soft); font-weight: 400; }

  /* ========================================
     TRUST BAR
     ======================================== */
  .trust-bar {
    background: var(--white);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 32px 0;
  }
  .trust-grid {
    display: flex;
    justify-content: center;
    gap: 48px;
    flex-wrap: wrap;
  }
  .trust-badge {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .trust-icon {
    width: 44px; height: 44px;
    background: ${hexToRgba(c.colors.primary, 0.08)};
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    color: var(--sky);
    flex-shrink: 0;
  }
  .trust-icon svg { width: 22px; height: 22px; }
  .trust-info { }
  .trust-title {
    font-weight: 600;
    font-size: 14px;
    color: var(--ink);
  }
  .trust-value {
    font-size: 12px;
    color: var(--ink-soft);
    margin-top: 2px;
  }

  /* ========================================
     SERVICES
     ======================================== */
  .services {
    background: var(--grau);
  }
  .services-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 48px;
  }
  .service-card {
    background: var(--white);
    border-radius: 20px;
    padding: 36px 28px;
    border: 1px solid var(--border);
    transition: all 0.3s var(--smooth);
    position: relative;
    overflow: hidden;
  }
  .service-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
    border-color: var(--sky);
  }
  .service-icon {
    width: 52px; height: 52px;
    background: ${hexToRgba(c.colors.primary, 0.1)};
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    color: var(--sky);
    margin-bottom: 20px;
  }
  .service-icon svg { width: 26px; height: 26px; }
  .service-card h3 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 1.2rem;
    margin-bottom: 10px;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .service-card p {
    font-size: 0.92rem;
    color: var(--ink-soft);
    line-height: 1.6;
    margin-bottom: 14px;
  }
  .service-price {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--sky);
    font-weight: 600;
    letter-spacing: 0.02em;
  }
  .service-tag {
    position: absolute;
    top: 16px; right: 16px;
    background: var(--mint);
    color: var(--ink);
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* ========================================
     PRICING TABLE (Festpreis)
     ======================================== */
  .pricing {
    background: var(--white);
  }
  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin-top: 48px;
  }
  .pricing-card {
    background: var(--grau);
    border-radius: 20px;
    padding: 36px 28px;
    border: 2px solid var(--border);
    position: relative;
    transition: all 0.3s var(--smooth);
    display: flex;
    flex-direction: column;
  }
  .pricing-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
  }
  .pricing-card.highlighted {
    background: var(--white);
    border-color: var(--sky);
    box-shadow: var(--shadow-card);
    transform: scale(1.03);
  }
  .pricing-card.highlighted:hover {
    transform: scale(1.03) translateY(-4px);
  }
  .pricing-badge {
    position: absolute;
    top: -12px; left: 50%;
    transform: translateX(-50%);
    background: var(--sky);
    color: var(--white);
    padding: 4px 20px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .pricing-card h3 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 1.3rem;
    margin-bottom: 16px;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .pricing-amount {
    margin-bottom: 24px;
    display: flex;
    align-items: baseline;
    gap: 6px;
  }
  .pricing-amount .price {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 2.4rem;
    color: var(--sky);
    font-variation-settings: "opsz" 144, "SOFT" 30;
  }
  .pricing-amount .unit {
    font-size: 0.9rem;
    color: var(--ink-soft);
  }
  .pricing-features {
    list-style: none;
    margin-bottom: 28px;
    flex: 1;
  }
  .pricing-features li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    font-size: 0.92rem;
    color: var(--ink-soft);
    border-bottom: 1px solid var(--border);
  }
  .pricing-features li:last-child { border-bottom: none; }
  .pricing-features li svg {
    width: 18px; height: 18px;
    color: var(--sky);
    flex-shrink: 0;
  }
  .pricing-cta {
    display: block;
    text-align: center;
    padding: 14px 24px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s var(--spring);
    background: var(--sky);
    color: var(--white);
  }
  .pricing-cta:hover {
    background: var(--sky-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
  }
  .pricing-card:not(.highlighted) .pricing-cta {
    background: transparent;
    color: var(--sky);
    border: 2px solid var(--sky);
  }
  .pricing-card:not(.highlighted) .pricing-cta:hover {
    background: var(--sky);
    color: var(--white);
  }

  /* ========================================
     BEFORE / AFTER
     ======================================== */
  .before-after {
    background: var(--grau);
  }
  .ba-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    margin-top: 48px;
  }
  .ba-card {
    border-radius: 20px;
    overflow: hidden;
    background: var(--white);
    border: 1px solid var(--border);
    transition: all 0.3s var(--smooth);
  }
  .ba-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
  }
  .ba-image {
    aspect-ratio: 16/9;
    position: relative;
    overflow: hidden;
  }
  .ba-label {
    position: absolute;
    bottom: 12px; left: 12px;
    background: ${hexToRgba('#000000', 0.6)};
    color: var(--white);
    padding: 4px 14px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    backdrop-filter: blur(8px);
  }
  .ba-caption {
    padding: 16px 20px;
    font-weight: 500;
    font-size: 0.95rem;
    color: var(--ink);
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews {
    background: var(--white);
  }
  .reviews-header {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 8px;
  }
  .reviews-score {
    display: flex; align-items: center; gap: 16px;
  }
  .reviews-score .big {
    font-family: var(--font-display);
    font-size: 3.5rem;
    font-weight: 600;
    color: var(--sky);
    line-height: 1;
    font-variation-settings: "opsz" 144, "SOFT" 30;
  }
  .reviews-score .meta {}
  .reviews-score .stars {
    display: flex; gap: 2px;
  }
  .reviews-score .stars svg {
    width: 18px; height: 18px;
    fill: var(--sky);
    color: var(--sky);
  }
  .reviews-score .count {
    font-size: 13px;
    color: var(--ink-soft);
    margin-top: 4px;
  }
  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
    margin-top: 40px;
  }
  .review-card {
    background: var(--grau);
    border-radius: 20px;
    padding: 28px;
    border: 1px solid var(--border);
    transition: all 0.3s var(--smooth);
  }
  .review-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-card);
  }
  .review-stars { display: flex; gap: 2px; margin-bottom: 16px; }
  .review-stars svg {
    width: 16px; height: 16px;
    fill: var(--sky);
    color: var(--sky);
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
    background: var(--sky);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: var(--white);
    font-weight: 600;
    font-size: 14px;
    font-family: var(--font-mono);
  }
  .review-name { font-weight: 600; font-size: 14px; }
  .review-meta { font-size: 12px; color: var(--ink-soft); margin-top: 2px; }

  /* ========================================
     SERVICE AREA / MAP
     ======================================== */
  .service-area {
    background: var(--grau);
  }
  .area-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
    margin-top: 48px;
  }
  .area-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 24px;
  }
  .area-tag {
    background: var(--white);
    padding: 8px 18px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 500;
    border: 1px solid var(--border);
    color: var(--ink);
    transition: all 0.2s;
  }
  .area-tag:hover {
    border-color: var(--sky);
    color: var(--sky);
  }
  .area-map {
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    background: var(--white);
    border: 1px solid var(--border);
    aspect-ratio: 4/3;
  }
  .map-svg {
    width: 100%; height: 100%;
  }
  .map-block { fill: ${hexToRgba(c.colors.primary, 0.06)}; stroke: ${hexToRgba(c.colors.primary, 0.12)}; stroke-width: 0.5; }
  .map-park { fill: ${hexToRgba(c.colors.accent, 0.15)}; }
  .map-water { fill: ${hexToRgba(c.colors.primary, 0.12)}; }
  .map-street { stroke: ${hexToRgba(c.colors.text, 0.08)}; stroke-width: 1; }
  .map-street-major { stroke: ${hexToRgba(c.colors.text, 0.14)}; stroke-width: 2; }
  .map-street-label {
    font-family: var(--font-mono);
    font-size: 10px;
    fill: var(--sky);
    font-weight: 600;
    letter-spacing: 0.08em;
  }
  .map-pin {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
  }
  .map-pin-pulse {
    width: 48px; height: 48px;
    background: ${hexToRgba(c.colors.primary, 0.2)};
    border-radius: 50%;
    animation: pulse 2s infinite;
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
  }
  .map-pin-circle {
    width: 32px; height: 32px;
    background: var(--sky);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    position: relative;
    z-index: 1;
    color: var(--white);
    box-shadow: 0 4px 12px ${hexToRgba(c.colors.primary, 0.3)};
  }
  .map-pin-circle svg { width: 16px; height: 16px; }
  .map-overlay {
    position: absolute;
    bottom: 20px; left: 20px;
    background: var(--white);
    padding: 16px 20px;
    border-radius: 14px;
    box-shadow: var(--shadow-card);
    z-index: 2;
  }
  .map-overlay .label {
    font-weight: 600;
    font-size: 14px;
    color: var(--ink);
  }
  .map-overlay .name {
    font-size: 12px;
    color: var(--ink-soft);
    margin-top: 4px;
  }
  .map-overlay .actions {
    display: flex;
    gap: 12px;
    margin-top: 10px;
  }
  .map-overlay .action {
    font-size: 12px;
    color: var(--sky);
    font-weight: 600;
    cursor: pointer;
  }
  .map-overlay .action:hover { text-decoration: underline; }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section {
    background: var(--white);
  }
  .faq-grid {
    max-width: 800px;
    margin: 40px auto 0;
  }
  .faq-item {
    border-bottom: 1px solid var(--border);
  }
  .faq-q {
    width: 100%;
    background: none; border: none;
    text-align: left;
    padding: 24px 0;
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--ink);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    font-family: var(--font-body);
    transition: color 0.2s;
  }
  .faq-q:hover { color: var(--sky); }
  .faq-icon {
    font-size: 1.4rem;
    font-weight: 300;
    transition: transform 0.3s;
    flex-shrink: 0;
    color: var(--sky);
  }
  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s var(--smooth), padding 0.3s;
    font-size: 0.95rem;
    color: var(--ink-soft);
    line-height: 1.7;
  }
  .faq-item.open .faq-a {
    max-height: 400px;
    padding-bottom: 24px;
  }
  .faq-item.open .faq-icon {
    transform: rotate(45deg);
  }

  /* ========================================
     CTA / CONTACT FORM
     ======================================== */
  .cta-section {
    background: var(--sky);
    color: var(--white);
    padding: 96px 0;
  }
  .cta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: start;
  }
  .cta-text .eyebrow { color: var(--mint); }
  .cta-text .display { color: var(--white); }
  .cta-text .display em { color: var(--mint); }
  .cta-text p {
    color: ${hexToRgba('#ffffff', 0.8)};
    font-size: 1.05rem;
    line-height: 1.7;
    margin-top: 20px;
    max-width: 480px;
  }
  .cta-features {
    margin-top: 28px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .cta-feature {
    display: flex; align-items: center; gap: 12px;
    color: ${hexToRgba('#ffffff', 0.9)};
    font-size: 0.95rem;
  }
  .cta-feature svg {
    width: 20px; height: 20px;
    color: var(--mint);
    flex-shrink: 0;
  }

  /* Contact Form */
  .contact-form {
    background: ${hexToRgba('#ffffff', 0.1)};
    backdrop-filter: blur(12px);
    border-radius: 24px;
    padding: 36px;
    border: 1px solid ${hexToRgba('#ffffff', 0.15)};
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
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 6px;
    color: ${hexToRgba('#ffffff', 0.9)};
  }
  .form-field input,
  .form-field select,
  .form-field textarea {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid ${hexToRgba('#ffffff', 0.2)};
    background: ${hexToRgba('#ffffff', 0.08)};
    color: var(--white);
    font-family: var(--font-body);
    font-size: 15px;
    transition: border-color 0.2s, background 0.2s;
  }
  .form-field input::placeholder,
  .form-field textarea::placeholder {
    color: ${hexToRgba('#ffffff', 0.4)};
  }
  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus {
    outline: none;
    border-color: var(--mint);
    background: ${hexToRgba('#ffffff', 0.12)};
  }
  .form-field select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px;
    padding-right: 40px;
    cursor: pointer;
  }
  .form-field select option {
    background: var(--sky-dark);
    color: var(--white);
  }
  .form-field textarea {
    resize: vertical;
    min-height: 120px;
  }
  .form-submit {
    width: 100%;
    padding: 16px 32px;
    border: none;
    border-radius: 999px;
    background: var(--white);
    color: var(--sky);
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.3s var(--spring);
    font-family: var(--font-body);
    margin-top: 8px;
  }
  .form-submit:hover {
    background: var(--mint);
    color: var(--sky-dark);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${hexToRgba('#000000', 0.2)};
  }

  /* ========================================
     ABOUT STATS
     ======================================== */
  .about-stats {
    display: flex;
    gap: 40px;
    margin-top: 32px;
    padding-top: 28px;
    border-top: 1px solid var(--border);
  }
  .about-stat .num {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 2rem;
    color: var(--sky);
    line-height: 1;
    font-variation-settings: "opsz" 144, "SOFT" 30;
  }
  .about-stat .label {
    font-size: 13px;
    color: var(--ink-soft);
    margin-top: 4px;
  }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: var(--ink);
    color: ${hexToRgba('#ffffff', 0.8)};
    padding: 64px 0 0;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 48px;
    padding-bottom: 48px;
    border-bottom: 1px solid ${hexToRgba('#ffffff', 0.1)};
  }
  .footer-brand .logo {
    color: var(--white);
    margin-bottom: 16px;
  }
  .footer-brand .logo-mark {
    background: var(--sky);
  }
  .footer-brand p {
    font-size: 14px;
    color: ${hexToRgba('#ffffff', 0.5)};
    max-width: 280px;
    line-height: 1.7;
  }
  .footer-col h4 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 1rem;
    color: var(--white);
    margin-bottom: 20px;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .footer-col ul { list-style: none; }
  .footer-col li {
    font-size: 14px;
    margin-bottom: 10px;
    color: ${hexToRgba('#ffffff', 0.5)};
  }
  .footer-col a { transition: color 0.2s; }
  .footer-col a:hover { color: var(--sky); }
  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 0;
    font-size: 13px;
    color: ${hexToRgba('#ffffff', 0.35)};
  }
  .footer-bottom a {
    color: ${hexToRgba('#ffffff', 0.35)};
    transition: color 0.2s;
  }
  .footer-bottom a:hover { color: var(--sky); }

  /* ========================================
     HOURS
     ======================================== */
  .hours-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
    font-size: 0.92rem;
  }
  .hours-item .label {
    display: flex; align-items: center; gap: 8px;
    color: var(--ink-soft);
  }
  .hours-item .label svg { width: 16px; height: 16px; }
  .hours-item .value { font-weight: 600; color: var(--ink); }

  /* ========================================
     MOBILE CTA
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 99;
    background: var(--sky);
    color: var(--white);
    text-align: center;
    padding: 18px 24px;
    font-weight: 700;
    font-size: 15px;
    box-shadow: 0 -4px 24px ${hexToRgba(c.colors.primary, 0.25)};
    transition: background 0.2s;
  }
  .mobile-cta:hover { background: var(--sky-dark); }

  /* ========================================
     SECTION HEAD
     ======================================== */
  .section-head {
    max-width: 640px;
  }
  .section-head .eyebrow { display: block; margin-bottom: 12px; }
  .section-head .display { font-size: clamp(32px, 4vw, 56px); margin-bottom: 12px; }
  .section-head p {
    font-size: 1.05rem;
    color: var(--ink-soft);
    line-height: 1.7;
    max-width: 520px;
  }
  .section-head.center {
    text-align: center;
    margin: 0 auto;
  }
  .section-head.center p {
    margin: 0 auto;
  }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .hero-grid { grid-template-columns: 1fr; gap: 40px; }
    .hero-visual { max-width: 500px; }
    .cta-grid { grid-template-columns: 1fr; gap: 40px; }
    .area-layout { grid-template-columns: 1fr; gap: 40px; }
    .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
    .services-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 768px) {
    section { padding: 64px 0; }
    .container { padding: 0 20px; }
    .nav-links { display: none; }
    .nav-cta.desktop { display: none; }
    .nav-hamburger { display: block; }
    .nav-links.open {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 100%; left: 0; right: 0;
      background: var(--white);
      padding: 24px 32px;
      gap: 16px;
      border-bottom: 1px solid var(--border);
      box-shadow: var(--shadow-card);
    }
    .hero { padding: 40px 0 60px; }
    .hero h1 { font-size: clamp(36px, 8vw, 56px); }
    .hero-actions { flex-direction: column; align-items: flex-start; }
    .hero-floating-badge { display: none; }
    .services-grid { grid-template-columns: 1fr; }
    .pricing-grid { grid-template-columns: 1fr; }
    .pricing-card.highlighted { transform: none; }
    .pricing-card.highlighted:hover { transform: translateY(-4px); }
    .ba-grid { grid-template-columns: 1fr; }
    .reviews-grid { grid-template-columns: 1fr; }
    .reviews-score .big { font-size: 2.5rem; }
    .trust-grid { gap: 24px; }
    .form-row { grid-template-columns: 1fr; }
    .contact-form { padding: 24px; }
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
    .mobile-cta { display: block; }
    .about-stats { flex-wrap: wrap; gap: 24px; }
  }

  @media (max-width: 480px) {
    .hero h1 { font-size: 32px; }
    .trust-badge { flex-direction: column; text-align: center; }
    .trust-grid { flex-direction: column; align-items: center; }
    .hero-lead { font-size: 1rem; }
  }
</style>
</head>
<body>

<!-- ====== ANNOUNCEMENT BAR ====== -->
${c.announceText || c.emergencyAvailable ? `<div class="announce">
  ${c.announceText ? `<strong>${esc(c.announceText)}</strong>` : `<strong>${esc(c.notdienstText || '24h-Notdienst verf\\u00fcgbar')}</strong> &mdash; ${c.emergencyPhone ? `Jetzt anrufen: <a href="tel:${esc(c.emergencyPhone)}">${esc(c.emergencyPhone)}</a>` : `<a href="#contact">Jetzt anfragen</a>`}`}
</div>` : ''}

<!-- ====== NAV ====== -->
<nav>
  <div class="nav-inner">
    <a href="#" class="logo">
      <span class="logo-mark">${logoInitial}</span>
      ${esc(c.businessName)}
    </a>
    <div class="nav-links" id="nav-links">
      <a href="#services">Services</a>
      <a href="#pricing">Festpreise</a>
      <a href="#reviews">Bewertungen</a>
      <a href="#service-area">Gebiet</a>
      <a href="#faq">FAQ</a>
    </div>
    <a href="#contact" class="nav-cta desktop">
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
      <div class="hero-content">
        <div class="hero-tag">
          <span class="pulse"></span>
          ${esc(c.heroTag)}
        </div>
        <h1 class="display">
          ${esc(c.heroHeadline)}
          <em>${esc(c.heroAccent)}</em>
          <span class="subtitle">${esc(c.heroLead)}</span>
        </h1>
        <div class="hero-actions">
          <a href="#contact" class="btn-primary">
            ${esc(c.ctaText)}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
          <a href="#pricing" class="btn-secondary">
            Festpreise ansehen
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </a>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-image-container">
          ${c.heroImageUrl
            ? `<img src="${esc(c.heroImageUrl)}" alt="${esc(c.businessName)} - ${esc(c.tagline)}" loading="eager">`
            : `<div class="hero-image-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>`}
        </div>
        <div class="hero-floating-badge">
          <div class="badge-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div>
            <strong>Festpreisangebot</strong>
            <div class="badge-text">Keine versteckten Kosten</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ====== TRUST BAR ====== -->
<section class="trust-bar" style="padding:32px 0;">
  <div class="container">
    <div class="trust-grid">
      ${trustBadgesHtml}
    </div>
  </div>
</section>

<!-- ====== SERVICES ====== -->
<section id="services" class="services">
  <div class="container">
    <div class="section-head center">
      <span class="eyebrow">${esc(c.servicesSectionTitle || 'Unsere Services')}</span>
      <h2 class="display">${c.servicesSectionSubtitle || 'Professionelle <em>Reinigung</em> f&uuml;r Ihr Zuhause.'}</h2>
      <p>Von der regelm&auml;&szlig;igen Unterhaltsreinigung bis zur gr&uuml;ndlichen Grundreinigung &mdash; wir sorgen f&uuml;r Sauberkeit in jedem Raum.</p>
    </div>
    <div class="services-grid">
      ${servicesHtml}
    </div>
  </div>
</section>

<!-- ====== PRICING TABLE ====== -->
${c.pricingPlans.length > 0 ? `<section id="pricing" class="pricing">
  <div class="container">
    <div class="section-head center">
      <span class="eyebrow">${esc(c.pricingSectionTitle || 'Festpreise')}</span>
      <h2 class="display">${c.pricingSectionSubtitle || 'Transparente <em>Festpreise</em>. Keine &Uuml;berraschungen.'}</h2>
      <p>Alle Preise verstehen sich inklusive Anfahrt, Material und Mehrwertsteuer. Festpreisangebot &mdash; garantiert.</p>
    </div>
    <div class="pricing-grid">
      ${pricingHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== BEFORE / AFTER ====== -->
<section class="before-after">
  <div class="container">
    <div class="section-head center">
      <span class="eyebrow">${esc(c.beforeAfterTitle || 'Ergebnisse')}</span>
      <h2 class="display">${c.beforeAfterSubtitle || 'Vorher &amp; <em>Nachher</em>.'}</h2>
      <p>Sehen Sie selbst, welchen Unterschied eine professionelle Reinigung macht.</p>
    </div>
    <div class="ba-grid">
      ${beforeAfterHtml}
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
      <span class="eyebrow">${esc(c.reviewsSectionTitle || 'Kundenstimmen')}</span>
      <h2 class="display">Was unsere Kunden <em>sagen</em>.</h2>
    </div>

    <div class="reviews-grid">
      ${reviewsHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== SERVICE AREA / MAP ====== -->
<section id="service-area" class="service-area">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.serviceAreaTitle || 'Einsatzgebiet')}</span>
      <h2 class="display">${c.serviceAreaSubtitle || 'Wir kommen zu <em>Ihnen</em>.'}</h2>
      <p>Unser Team ist in ganz ${esc(c.city || 'M&uuml;nchen')} und Umgebung f&uuml;r Sie im Einsatz.</p>
    </div>
    <div class="area-layout">
      <div>
        <div class="area-tags">
          ${serviceAreasHtml}
        </div>

        ${c.openingHours.length > 0 ? `
        <div style="margin-top:32px">
          <h3 style="font-family:var(--font-display);font-weight:500;font-size:1.1rem;margin-bottom:16px;font-variation-settings:'opsz' 48, 'SOFT' 50">Erreichbarkeit</h3>
          ${hoursHtml}
        </div>` : ''}

        ${aboutStatsHtml}
      </div>

      <div class="area-map">
        <svg class="map-svg" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid slice">
          <!-- M&uuml;nchen-inspiriertes Strassennetz -->
          <path class="map-park" d="M 30 20 L 180 30 L 200 130 L 30 120 Z"/>
          <path class="map-park" d="M 420 350 Q 480 320 540 360 Q 520 420 440 400 Z"/>
          <path class="map-park" d="M 200 380 Q 260 350 300 390 Q 280 440 210 420 Z"/>
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
          <!-- Diagonale (Leopoldstr.) -->
          <line class="map-street" x1="200" y1="0" x2="380" y2="500"/>
          <text class="map-street-label" x="300" y="270">${esc(c.businessName)}</text>
          <text class="map-street-label" x="320" y="140" style="font-size:8px">Leopoldstra&szlig;e</text>
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
  </div>
</section>

${(c.faqItems || []).length > 0 ? `<!-- ====== FAQ ====== -->
<section id="faq" class="faq-section">
  <div class="container">
    <div class="section-head center">
      <span class="eyebrow">H&auml;ufige Fragen</span>
      <h2 class="display">Fragen &amp; <em>Antworten</em>.</h2>
      <p>Alles rund um Unterhaltsreinigung, Grundreinigung, Fensterreinigung und unsere Festpreise.</p>
    </div>
    <div class="faq-grid">
      ${faqHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== CTA / CONTACT FORM ====== -->
${c.contactEnabled !== false ? `<section id="contact" class="cta-section">
  <div class="container cta-grid">
    <div class="cta-text">
      <span class="eyebrow" style="display:block; margin-bottom:16px;">${esc(c.ctaSectionTitle || 'Kontakt')}</span>
      <h2 class="display">${c.ctaSectionSubtitle || 'Sauberkeit <em>anfragen</em>.'}</h2>
      <p>Ob Unterhaltsreinigung, Grundreinigung oder Fensterreinigung &mdash; wir erstellen Ihnen ein unverbindliches Festpreisangebot. Innerhalb von 24h.</p>

      ${ctaFeaturesHtml.length > 0 ? `<div class="cta-features">${ctaFeaturesHtml}</div>` : `
      <div class="cta-features">
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Festpreisangebot innerhalb 24h
        </div>
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Geschultes &amp; versichertes Team
        </div>
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Zufriedenheitsgarantie
        </div>
      </div>`}

      ${c.phone ? `
      <div style="margin-top:32px;display:flex;align-items:center;gap:12px">
        <div style="width:44px;height:44px;background:${hexToRgba('#ffffff', 0.15)};border-radius:12px;display:flex;align-items:center;justify-content:center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </div>
        <div>
          <div style="font-size:12px;color:${hexToRgba('#ffffff', 0.6)}">Oder direkt anrufen</div>
          <a href="tel:${esc(c.phone)}" style="font-weight:700;font-size:1.1rem;color:var(--white)">${esc(c.phone)}</a>
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
            <option>Unterhaltsreinigung</option>
            <option>Grundreinigung</option>
            <option>Fensterreinigung</option>
            <option>Polsterreinigung</option>
            <option>Umzugsreinigung</option>
            <option>Regelm&auml;&szlig;ige Reinigung</option>
            <option>Sonstiges</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label>Wohnfl&auml;che (ca. m&sup2;)</label>
          <input type="text" name="flaeche" placeholder="z.B. 80 m&sup2;">
        </div>
        <div class="form-field">
          <label>Wunschtermin</label>
          <input type="date" name="termin">
        </div>
      </div>

      <div class="form-row full">
        <div class="form-field">
          <label>Nachricht</label>
          <textarea name="message" placeholder="Besondere W&uuml;nsche, Zustand der Wohnung, Haustiere ..."></textarea>
        </div>
      </div>

      <div style="position:absolute;left:-9999px"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>

      <button type="submit" class="form-submit" id="contact-submit">
        Kostenlos anfragen
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </button>
    </form>
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
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:var(--white);font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:${hexToRgba('#ffffff', 0.7)};font-size:1.05rem">Wir erstellen Ihr Festpreisangebot und melden uns innerhalb von 24 Stunden bei Ihnen.</p></div>';
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
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--sky);color:var(--white);border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
