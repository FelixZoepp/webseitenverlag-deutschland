// Werkstatt E-Auto Template — Elektroauto-Werkstatt
// Clean-tech, zukunftsorientiert, umweltbewusst, modern

export interface WerkstattEAutoConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Mint (#2ec4a0)
    background: string // Off-White (#f8faf8)
    text: string       // Anthrazit (#1a1a1a)
  }
  phone?: string
  email?: string
  address?: string
  openingHours: { days: string; hours: string }[]
  services: {
    icon: string
    title: string
    description: string
    features?: string[]
    tag?: string
  }[]
  certifications: {
    name: string
    partner: string
    description: string
    imageUrl?: string
  }[]
  pricing: {
    service: string
    description: string
    price: string
    duration?: string
    highlighted?: boolean
  }[]
  reviews: { text: string; name: string; vehicle: string; rating: number }[]
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
  certSectionTitle?: string
  certSectionSubtitle?: string
  pricingSectionTitle?: string
  pricingSectionSubtitle?: string
  reviewsSectionTitle?: string
  reviewsSectionSubtitle?: string
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

export function renderWerkstattEAutoTemplate(config: WerkstattEAutoConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primaryDark = darkenHex(c.colors.primary, 0.25)
  const primaryDeep = darkenHex(c.colors.primary, 0.45)
  const primarySoft = hexToRgba(c.colors.primary, 0.10)
  const primaryGlow = hexToRgba(c.colors.primary, 0.25)
  const bgTint = tintHex(c.colors.background, -0.02)
  const bgAlt = tintHex(c.colors.background, -0.04)
  const textSoft = tintHex(c.colors.text, 0.45)
  const textDim = tintHex(c.colors.text, 0.65)
  const borderColor = tintHex(c.colors.background, -0.08)
  const primaryLight = tintHex(c.colors.primary, 0.85)
  const primaryMid = tintHex(c.colors.primary, 0.4)

  const logoInitial = esc(c.businessName.charAt(0))

  // Services HTML
  const servicesHtml = c.services.map((s, idx) => {
    return `
      <div class="service-card" style="--delay: ${idx * 0.06}s">
        <div class="service-icon">${s.icon}</div>
        <div class="service-body">
          <div class="service-head">
            <h3>${esc(s.title)}</h3>
            ${s.tag ? `<span class="service-tag">${esc(s.tag)}</span>` : ''}
          </div>
          <p>${esc(s.description)}</p>
          ${s.features && s.features.length > 0 ? `<ul class="service-features">
            ${s.features.map(f => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>${esc(f)}</li>`).join('\n            ')}
          </ul>` : ''}
        </div>
      </div>`
  }).join('\n')

  // Certifications HTML
  const certsHtml = c.certifications.map((cert, idx) => {
    const gradients = [
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 100%)`,
      `linear-gradient(135deg, ${c.colors.text} 0%, ${tintHex(c.colors.text, 0.2)} 100%)`,
      `linear-gradient(135deg, ${primaryMid} 0%, ${c.colors.primary} 100%)`,
    ]
    const bg = cert.imageUrl
      ? `background-image:url('${esc(cert.imageUrl)}');background-size:contain;background-position:center;background-repeat:no-repeat`
      : `background:${gradients[idx % gradients.length]}`
    return `
      <div class="cert-card">
        <div class="cert-badge" style="${bg}">
          ${!cert.imageUrl ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>` : ''}
        </div>
        <div class="cert-info">
          <h4>${esc(cert.name)}</h4>
          <span class="cert-partner">${esc(cert.partner)}</span>
          <p>${esc(cert.description)}</p>
        </div>
      </div>`
  }).join('\n')

  // Pricing HTML
  const pricingHtml = c.pricing.map(p => `
    <tr class="${p.highlighted ? 'highlighted' : ''}">
      <td class="price-service">
        <strong>${esc(p.service)}</strong>
        <span class="price-desc">${esc(p.description)}</span>
      </td>
      <td class="price-duration">${p.duration ? esc(p.duration) : '&mdash;'}</td>
      <td class="price-amount">${esc(p.price)}</td>
    </tr>`).join('\n')

  // Reviews HTML
  const reviewsHtml = c.reviews.map(r => {
    const initials = r.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    return `
      <div class="review-card">
        <div class="review-stars">
          ${generateStarsSvg(r.rating)}
        </div>
        <p class="review-quote">&ldquo;${esc(r.text)}&rdquo;</p>
        <div class="review-author">
          <div class="review-avatar">${esc(initials)}</div>
          <div class="review-meta">
            <div class="review-name">${esc(r.name)}</div>
            <div class="review-vehicle">${esc(r.vehicle)}</div>
          </div>
        </div>
      </div>`
  }).join('\n')

  // Features / USP HTML
  const featuresHtml = (c.features || []).map(f => `
    <div class="usp-card">
      <div class="usp-icon">${f.icon}</div>
      <h4>${esc(f.title)}</h4>
      <p>${esc(f.description)}</p>
    </div>`).join('\n')

  // Stats HTML
  const statsHtml = (c.aboutStats || []).map(s => `
    <div class="stat">
      <div class="stat-value">${esc(s.value)}</div>
      <div class="stat-label">${esc(s.label)}</div>
    </div>`).join('\n')

  // FAQ HTML
  const faqHtml = (c.faqItems || []).map((f, i) => `
    <div class="faq-item">
      <button class="faq-q" aria-expanded="false" aria-controls="faq-a-${i}">
        <span>${esc(f.question)}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="faq-a" id="faq-a-${i}" role="region">
        <p>${esc(f.answer)}</p>
      </div>
    </div>`).join('\n')

  // Footer columns HTML
  const footerColumnsHtml = (c.footerColumns || []).map(col => `
    <div class="footer-col">
      <h4>${esc(col.title)}</h4>
      <ul>
        ${col.links.map(l => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('\n        ')}
      </ul>
    </div>`).join('\n')

  // CTA features HTML
  const ctaFeaturesHtml = (c.ctaFeatures || []).map(f => `
    <div class="cta-feature">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
      ${esc(f)}
    </div>`).join('\n')

  // Location details HTML
  const locationDetailsHtml = (c.locationDetails || []).map(d => `
    <div class="loc-detail">
      <div class="loc-icon">${d.icon}</div>
      <div>
        <div class="loc-label">${esc(d.label)}</div>
        <div class="loc-value">${esc(d.value)}</div>
      </div>
    </div>`).join('\n')

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
  "priceRange": "$$",
  "currenciesAccepted": "EUR",
  "paymentAccepted": "Cash, Credit Card, EC-Karte",
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
    "name": "Elektroauto-Services",
    "itemListElement": [${c.pricing.slice(0, 12).map(item => `{
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "${esc(item.service)}",
        "description": "${esc(item.description)}"
      },
      "price": "${esc(item.price)}",
      "priceCurrency": "EUR"
    }`).join(',')}]
  },
  "areaServed": {
    "@type": "City",
    "name": "Hamburg"
  },
  "additionalType": "https://schema.org/AutoRepair",
  "url": "${appUrl}${siteId ? `/s/${siteId}` : ''}"
}
</script>

<style>
  /* ========================================
     DESIGN TOKENS
     ======================================== */
  :root {
    --mint:           ${esc(c.colors.primary)};
    --mint-dark:      ${primaryDark};
    --mint-deep:      ${primaryDeep};
    --mint-soft:      ${primarySoft};
    --mint-glow:      ${primaryGlow};
    --mint-light:     ${primaryLight};
    --mint-mid:       ${primaryMid};
    --offwhite:       ${esc(c.colors.background)};
    --offwhite-tint:  ${bgTint};
    --offwhite-alt:   ${bgAlt};
    --anthrazit:      ${esc(c.colors.text)};
    --anthrazit-soft: ${textSoft};
    --anthrazit-dim:  ${textDim};
    --border:         ${borderColor};

    --shadow-card: 0 12px 32px ${hexToRgba(c.colors.text, 0.06)};
    --shadow-hover: 0 20px 48px ${hexToRgba(c.colors.text, 0.10)};
    --shadow-glow: 0 0 40px ${hexToRgba(c.colors.primary, 0.18)};

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
    color: var(--anthrazit);
    background: var(--offwhite);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; display: block; }

  .display {
    font-family: var(--font-display);
    font-weight: 500;
    letter-spacing: -0.025em;
    line-height: 1.15;
  }
  .display em {
    font-style: normal;
    color: var(--mint);
  }

  .container {
    max-width: 1160px;
    margin: 0 auto;
    padding: 0 32px;
  }

  section {
    padding: 96px 0;
  }

  .eyebrow {
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--mint-dark);
  }

  .section-header {
    text-align: center;
    max-width: 640px;
    margin: 0 auto 56px;
  }
  .section-header .eyebrow {
    display: block;
    margin-bottom: 14px;
  }
  .section-header h2 {
    font-size: clamp(2rem, 4vw, 2.8rem);
    margin-bottom: 16px;
    color: var(--anthrazit);
  }
  .section-header p {
    font-size: 1.05rem;
    color: var(--anthrazit-soft);
    line-height: 1.7;
  }

  /* ========================================
     ANNOUNCEMENT BAR
     ======================================== */
  .announce {
    background: var(--anthrazit);
    color: var(--offwhite);
    text-align: center;
    padding: 10px 20px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.06em;
  }
  .announce a { color: var(--mint); text-decoration: underline; }

  /* ========================================
     NAV
     ======================================== */
  nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: ${hexToRgba(c.colors.background, 0.92)};
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    transition: box-shadow 0.3s;
  }
  .nav-inner {
    max-width: 1160px;
    margin: 0 auto;
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 68px;
  }
  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.2rem;
    letter-spacing: -0.02em;
  }
  .logo-mark {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: var(--mint);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 16px;
  }
  .nav-links {
    display: flex;
    align-items: center;
    gap: 32px;
  }
  .nav-links a {
    font-size: 14px;
    font-weight: 500;
    color: var(--anthrazit-soft);
    transition: color 0.2s;
    position: relative;
  }
  .nav-links a:hover { color: var(--anthrazit); }
  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: -4px; left: 0; right: 0;
    height: 2px;
    background: var(--mint);
    transform: scaleX(0);
    transition: transform 0.25s var(--spring);
  }
  .nav-links a:hover::after { transform: scaleX(1); }
  .nav-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--mint);
    color: #fff;
    padding: 10px 22px;
    border-radius: 50px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.01em;
    transition: background 0.25s, transform 0.25s var(--spring);
    border: none;
    cursor: pointer;
  }
  .nav-cta svg { width: 16px; height: 16px; }
  .nav-cta:hover {
    background: var(--mint-dark);
    transform: translateY(-1px);
  }
  .nav-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    width: 36px; height: 36px;
    padding: 0;
  }
  .nav-toggle svg {
    width: 24px; height: 24px;
    stroke: var(--anthrazit);
  }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    padding: 80px 0 96px;
    overflow: hidden;
    position: relative;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -50%; right: -30%;
    width: 800px; height: 800px;
    border-radius: 50%;
    background: radial-gradient(circle, ${hexToRgba(c.colors.primary, 0.06)} 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-inner {
    max-width: 1160px;
    margin: 0 auto;
    padding: 0 32px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 64px;
  }
  .hero-text { position: relative; z-index: 2; }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--mint-dark);
    background: var(--mint-soft);
    padding: 6px 16px;
    border-radius: 50px;
    margin-bottom: 24px;
  }
  .hero h1 {
    font-size: clamp(2.4rem, 5vw, 3.6rem);
    margin-bottom: 20px;
    line-height: 1.1;
  }
  .hero-lead {
    font-size: 1.1rem;
    line-height: 1.7;
    color: var(--anthrazit-soft);
    max-width: 500px;
    margin-bottom: 36px;
  }
  .hero-actions {
    display: flex;
    gap: 14px;
    align-items: center;
    flex-wrap: wrap;
  }
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: var(--mint);
    color: #fff;
    padding: 14px 30px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 15px;
    transition: background 0.25s, transform 0.25s var(--spring), box-shadow 0.25s;
    border: none;
    cursor: pointer;
  }
  .btn-primary svg { width: 18px; height: 18px; }
  .btn-primary:hover {
    background: var(--mint-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow);
  }
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--anthrazit);
    padding: 14px 24px;
    border-radius: 50px;
    font-weight: 500;
    font-size: 14px;
    border: 1px solid var(--border);
    transition: border-color 0.25s, background 0.25s;
  }
  .btn-secondary svg { width: 16px; height: 16px; }
  .btn-secondary:hover {
    border-color: var(--mint);
    background: var(--mint-soft);
  }

  .hero-image-col {
    position: relative;
  }
  .hero-image-frame {
    border-radius: 20px;
    overflow: hidden;
    aspect-ratio: 4/3;
    background: var(--offwhite-alt);
    position: relative;
  }
  .hero-image-frame img {
    width: 100%; height: 100%;
    object-fit: cover;
  }
  .hero-image-frame .placeholder {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, ${tintHex(c.colors.primary, 0.8)} 0%, ${tintHex(c.colors.primary, 0.6)} 100%);
  }
  .hero-image-frame .placeholder svg {
    width: 64px; height: 64px;
    stroke: var(--mint);
    opacity: 0.4;
  }
  .hero-float-badge {
    position: absolute;
    bottom: -16px; left: -16px;
    background: var(--anthrazit);
    color: #fff;
    padding: 12px 20px;
    border-radius: 14px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: var(--shadow-card);
    letter-spacing: 0.03em;
    z-index: 3;
  }
  .hero-float-badge svg {
    width: 18px; height: 18px;
    fill: var(--mint);
    stroke: none;
  }

  /* ========================================
     USP / FEATURES STRIP
     ======================================== */
  .features-section {
    padding: 48px 0;
    background: var(--offwhite-tint);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 32px;
  }
  .usp-card {
    text-align: center;
    padding: 24px 16px;
  }
  .usp-icon {
    font-size: 28px;
    margin-bottom: 12px;
  }
  .usp-card h4 {
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 600;
    margin-bottom: 6px;
  }
  .usp-card p {
    font-size: 13px;
    color: var(--anthrazit-soft);
    line-height: 1.6;
  }

  /* ========================================
     SERVICES GRID
     ======================================== */
  .services-section {
    background: var(--offwhite);
  }
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 24px;
  }
  .service-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px;
    display: flex;
    gap: 20px;
    transition: transform 0.3s var(--spring), box-shadow 0.3s, border-color 0.3s;
    animation: fadeUp 0.5s var(--smooth) calc(var(--delay, 0s)) both;
  }
  .service-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-hover);
    border-color: var(--mint);
  }
  .service-icon {
    width: 48px; height: 48px;
    background: var(--mint-soft);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }
  .service-body { flex: 1; }
  .service-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  .service-head h3 {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--anthrazit);
  }
  .service-tag {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--mint);
    color: #fff;
    padding: 3px 10px;
    border-radius: 50px;
  }
  .service-body p {
    font-size: 14px;
    color: var(--anthrazit-soft);
    line-height: 1.65;
    margin-bottom: 12px;
  }
  .service-features {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .service-features li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--anthrazit-soft);
  }
  .service-features li svg {
    width: 14px; height: 14px;
    color: var(--mint);
    flex-shrink: 0;
  }

  /* ========================================
     CERTIFICATIONS
     ======================================== */
  .certs-section {
    background: var(--offwhite-tint);
  }
  .certs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 24px;
  }
  .cert-card {
    display: flex;
    align-items: flex-start;
    gap: 24px;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px;
    transition: transform 0.3s var(--spring), box-shadow 0.3s;
  }
  .cert-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-card);
  }
  .cert-badge {
    width: 72px; height: 72px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .cert-badge svg {
    width: 36px; height: 36px;
    stroke: #fff;
  }
  .cert-info { flex: 1; }
  .cert-info h4 {
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .cert-partner {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mint-dark);
    display: block;
    margin-bottom: 8px;
  }
  .cert-info p {
    font-size: 13.5px;
    color: var(--anthrazit-soft);
    line-height: 1.6;
  }

  /* ========================================
     PRICING TABLE
     ======================================== */
  .pricing-section {
    background: var(--offwhite);
  }
  .pricing-table-wrap {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: var(--shadow-card);
  }
  .pricing-table {
    width: 100%;
    border-collapse: collapse;
  }
  .pricing-table thead {
    background: var(--anthrazit);
    color: var(--offwhite);
  }
  .pricing-table thead th {
    padding: 16px 24px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-align: left;
  }
  .pricing-table thead th:last-child {
    text-align: right;
  }
  .pricing-table thead th:nth-child(2) {
    text-align: center;
  }
  .pricing-table tbody tr {
    border-bottom: 1px solid var(--border);
    transition: background 0.2s;
  }
  .pricing-table tbody tr:last-child { border-bottom: none; }
  .pricing-table tbody tr:hover {
    background: var(--mint-soft);
  }
  .pricing-table tbody tr.highlighted {
    background: ${hexToRgba(c.colors.primary, 0.05)};
  }
  .pricing-table tbody tr.highlighted:hover {
    background: ${hexToRgba(c.colors.primary, 0.10)};
  }
  .pricing-table td {
    padding: 18px 24px;
    vertical-align: middle;
  }
  .price-service strong {
    display: block;
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 2px;
  }
  .price-desc {
    font-size: 13px;
    color: var(--anthrazit-soft);
    line-height: 1.5;
  }
  .price-duration {
    text-align: center;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--anthrazit-soft);
  }
  .price-amount {
    text-align: right;
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 1.05rem;
    color: var(--mint-dark);
    white-space: nowrap;
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews-section {
    background: var(--offwhite-tint);
  }
  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }
  .review-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px;
    transition: transform 0.3s var(--spring), box-shadow 0.3s;
  }
  .review-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-card);
  }
  .review-stars {
    display: flex;
    gap: 3px;
    margin-bottom: 16px;
  }
  .review-stars svg {
    width: 16px; height: 16px;
    fill: var(--mint);
  }
  .review-quote {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.6;
    color: var(--anthrazit);
    margin-bottom: 20px;
    font-style: italic;
  }
  .review-author {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .review-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: var(--mint-soft);
    color: var(--mint-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 700;
  }
  .review-name {
    font-weight: 600;
    font-size: 14px;
  }
  .review-vehicle {
    font-size: 12px;
    color: var(--anthrazit-dim);
    font-family: var(--font-mono);
  }

  /* ========================================
     ABOUT
     ======================================== */
  .about-section {
    background: var(--offwhite);
  }
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  .about-image-area {
    border-radius: 20px;
    overflow: hidden;
    aspect-ratio: 4/3;
    background: linear-gradient(135deg, ${tintHex(c.colors.primary, 0.7)} 0%, ${tintHex(c.colors.primary, 0.5)} 100%);
    position: relative;
  }
  .about-image-area img {
    width: 100%; height: 100%;
    object-fit: cover;
  }
  .about-content .eyebrow { display: block; margin-bottom: 14px; }
  .about-content h2 {
    font-size: clamp(1.8rem, 3.5vw, 2.4rem);
    margin-bottom: 20px;
  }
  .about-content p {
    font-size: 1rem;
    color: var(--anthrazit-soft);
    line-height: 1.75;
    margin-bottom: 16px;
  }
  .about-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 24px;
    margin-top: 32px;
    padding-top: 28px;
    border-top: 1px solid var(--border);
  }
  .stat-value {
    font-family: var(--font-display);
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--mint-dark);
    line-height: 1.2;
  }
  .stat-label {
    font-size: 12px;
    color: var(--anthrazit-soft);
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
    margin-top: 4px;
  }

  /* ========================================
     LOCATION
     ======================================== */
  .location-section {
    background: var(--offwhite-tint);
  }
  .location-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: start;
  }
  .location-info { }
  .location-info .eyebrow { display: block; margin-bottom: 14px; }
  .location-info h2 {
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    margin-bottom: 16px;
  }
  .location-info > p {
    color: var(--anthrazit-soft);
    line-height: 1.7;
    margin-bottom: 28px;
  }
  .loc-details {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .loc-detail {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }
  .loc-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    background: var(--mint-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  .loc-label {
    font-size: 12px;
    font-family: var(--font-mono);
    color: var(--anthrazit-dim);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .loc-value {
    font-size: 15px;
    font-weight: 500;
  }
  .location-hours {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
  }
  .location-hours h3 {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 20px;
  }
  .hours-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .hours-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }
  .hours-row:last-child { border-bottom: none; padding-bottom: 0; }
  .hours-day {
    font-weight: 500;
    font-size: 14px;
  }
  .hours-time {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--anthrazit-soft);
  }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section {
    background: var(--offwhite);
  }
  .faq-list {
    max-width: 740px;
    margin: 0 auto;
  }
  .faq-item {
    border-bottom: 1px solid var(--border);
  }
  .faq-item:first-child {
    border-top: 1px solid var(--border);
  }
  .faq-q {
    width: 100%;
    background: none;
    border: none;
    padding: 20px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    cursor: pointer;
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--anthrazit);
    text-align: left;
  }
  .faq-q svg {
    width: 20px; height: 20px;
    flex-shrink: 0;
    transition: transform 0.3s var(--smooth);
    color: var(--mint);
  }
  .faq-item.open .faq-q svg {
    transform: rotate(180deg);
  }
  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s var(--smooth);
  }
  .faq-item.open .faq-a {
    max-height: 300px;
  }
  .faq-a p {
    padding: 0 0 20px;
    font-size: 14.5px;
    color: var(--anthrazit-soft);
    line-height: 1.7;
  }

  /* ========================================
     CTA / CONTACT FORM
     ======================================== */
  .cta-section {
    background: var(--anthrazit);
    color: var(--offwhite);
  }
  .cta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 56px;
    align-items: start;
  }
  .cta-text .eyebrow { color: var(--mint); display: block; margin-bottom: 16px; }
  .cta-text h2 {
    font-size: clamp(1.8rem, 3.5vw, 2.4rem);
    color: var(--offwhite);
    margin-bottom: 16px;
  }
  .cta-text h2 em { color: var(--mint); }
  .cta-text > p {
    color: ${hexToRgba(c.colors.background, 0.7)};
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
    font-size: 14px;
    color: ${hexToRgba(c.colors.background, 0.8)};
  }
  .cta-feature svg {
    width: 16px; height: 16px;
    color: var(--mint);
    flex-shrink: 0;
  }

  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
    position: relative;
  }
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }
  .form-row.full {
    grid-template-columns: 1fr;
  }
  .form-field label {
    display: block;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${hexToRgba(c.colors.background, 0.5)};
    margin-bottom: 6px;
  }
  .form-field input,
  .form-field select,
  .form-field textarea {
    width: 100%;
    background: ${hexToRgba(c.colors.background, 0.08)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.12)};
    border-radius: 10px;
    padding: 12px 16px;
    color: var(--offwhite);
    font-family: var(--font-body);
    font-size: 14px;
    transition: border-color 0.2s, background 0.2s;
    outline: none;
  }
  .form-field input::placeholder,
  .form-field textarea::placeholder {
    color: ${hexToRgba(c.colors.background, 0.35)};
  }
  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus {
    border-color: var(--mint);
    background: ${hexToRgba(c.colors.background, 0.12)};
  }
  .form-field select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;
  }
  .form-field textarea {
    min-height: 110px;
    resize: vertical;
  }
  .form-submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: var(--mint);
    color: #fff;
    border: none;
    padding: 14px 32px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: background 0.25s, transform 0.25s var(--spring);
    align-self: flex-start;
  }
  .form-submit:hover {
    background: var(--mint-dark);
    transform: translateY(-2px);
  }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: var(--anthrazit);
    color: ${hexToRgba(c.colors.background, 0.6)};
    padding: 64px 0 40px;
    border-top: 1px solid ${hexToRgba(c.colors.background, 0.08)};
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr repeat(${Math.max((c.footerColumns || []).length, 1)}, 1fr);
    gap: 48px;
    margin-bottom: 40px;
  }
  .footer-brand {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--offwhite);
    margin-bottom: 12px;
  }
  .footer-desc {
    font-size: 14px;
    line-height: 1.7;
    max-width: 280px;
  }
  .footer-col h4 {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--offwhite);
    margin-bottom: 18px;
  }
  .footer-col ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .footer-col a {
    font-size: 14px;
    transition: color 0.2s;
  }
  .footer-col a:hover { color: var(--mint); }
  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 28px;
    border-top: 1px solid ${hexToRgba(c.colors.background, 0.08)};
    font-size: 13px;
  }
  .footer-bottom a {
    transition: color 0.2s;
  }
  .footer-bottom a:hover { color: var(--mint); }

  /* ========================================
     MOBILE CTA (Sticky)
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 40;
    background: var(--mint);
    color: #fff;
    text-align: center;
    padding: 16px 24px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: background 0.2s;
  }
  .mobile-cta:hover { background: var(--mint-dark); }

  /* ========================================
     ANIMATIONS
     ======================================== */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 var(--mint-glow); }
    50%      { box-shadow: 0 0 24px 4px var(--mint-glow); }
  }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .hero-inner { grid-template-columns: 1fr; gap: 40px; text-align: center; }
    .hero-lead { margin: 0 auto 36px; }
    .hero-actions { justify-content: center; }
    .hero-image-col { max-width: 480px; margin: 0 auto; }
    .hero-float-badge { left: auto; right: -10px; bottom: -15px; }
    .about-grid { grid-template-columns: 1fr; gap: 40px; }
    .about-image-area { max-width: 480px; margin: 0 auto; }
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
      background: var(--offwhite);
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
    .services-grid { grid-template-columns: 1fr; }
    .certs-grid { grid-template-columns: 1fr; }
    .cert-card { flex-direction: column; }
    .cert-badge { width: 100%; min-height: 72px; }
    .reviews-grid { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
    .section-header h2 { font-size: clamp(1.6rem, 6vw, 2.2rem); }
    body { padding-bottom: 52px; }
    .pricing-table thead { display: none; }
    .pricing-table, .pricing-table tbody, .pricing-table tr, .pricing-table td {
      display: block;
    }
    .pricing-table tr {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
    }
    .pricing-table td { padding: 4px 0; }
    .price-duration { text-align: left; }
    .price-amount { text-align: left; font-size: 1.1rem; margin-top: 6px; }
  }
  @media (max-width: 480px) {
    .hero-actions { flex-direction: column; width: 100%; }
    .btn-primary { width: 100%; justify-content: center; }
    .about-stats { grid-template-columns: 1fr; text-align: center; }
    .hero-float-badge { display: none; }
    .service-card { flex-direction: column; }
    .service-icon { width: 40px; height: 40px; font-size: 18px; }
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
      <a href="#preise">Festpreise</a>
      <a href="#zertifikate">Zertifikate</a>
      <a href="#bewertungen">Bewertungen</a>
      <a href="#standort">Standort</a>
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
          ? `<img src="${esc(c.heroImageUrl)}" alt="${esc(c.businessName)} Werkstatt" loading="eager">`
          : `<div class="placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M7 6V4h4v2M13 6V4h4v2"/>
              </svg>
            </div>`}
      </div>
      <div class="hero-float-badge">
        <svg viewBox="0 0 24 24"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z"/></svg>
        Zertifizierte Hochvolt-Werkstatt
      </div>
    </div>
  </div>
</section>

<!-- ====== USP / FEATURES ====== -->
${(c.features || []).length > 0 ? `<section class="features-section">
  <div class="container">
    <div class="features-grid">
      ${featuresHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== ABOUT ====== -->
${c.aboutTitle || c.aboutText ? `<section class="about-section">
  <div class="container">
    <div class="about-grid">
      <div class="about-image-area">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="width:64px;height:64px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);opacity:0.3;stroke:var(--mint)">
          <rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>
        </svg>
      </div>
      <div class="about-content">
        <span class="eyebrow">&Uuml;ber uns</span>
        <h2 class="display">${c.aboutTitle || 'Ihre Werkstatt f&uuml;r <em>Elektromobilit&auml;t</em>'}</h2>
        <p>${esc(c.aboutText || '')}</p>
        ${c.aboutText2 ? `<p>${esc(c.aboutText2)}</p>` : ''}
        ${(c.aboutStats || []).length > 0 ? `<div class="about-stats">${statsHtml}</div>` : ''}
      </div>
    </div>
  </div>
</section>` : ''}

<!-- ====== SERVICES ====== -->
<section id="services" class="services-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">${esc(c.serviceSectionTitle || 'Unsere Services')}</span>
      <h2 class="display">${c.serviceSectionSubtitle || 'Spezialisiert auf <em>Elektrofahrzeuge</em>'}</h2>
      <p>Von der Batterie-Diagnose &uuml;ber Software-Updates bis zur Wallbox-Installation &mdash; Ihr Full-Service-Partner f&uuml;r E-Mobilit&auml;t.</p>
    </div>
    <div class="services-grid">
      ${servicesHtml}
    </div>
  </div>
</section>

<!-- ====== CERTIFICATIONS ====== -->
${c.certifications.length > 0 ? `<section id="zertifikate" class="certs-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">${esc(c.certSectionTitle || 'Zertifizierungen')}</span>
      <h2 class="display">${c.certSectionSubtitle || 'Autorisierter <em>Partner</em>'}</h2>
      <p>Zertifiziert von f&uuml;hrenden Elektrofahrzeug-Herstellern &mdash; f&uuml;r h&ouml;chste Qualit&auml;t bei Hochvolt-Arbeiten und OBD-Diagnose.</p>
    </div>
    <div class="certs-grid">
      ${certsHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== PRICING TABLE ====== -->
${c.pricing.length > 0 ? `<section id="preise" class="pricing-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">${esc(c.pricingSectionTitle || 'Festpreise')}</span>
      <h2 class="display">${c.pricingSectionSubtitle || 'Transparent &amp; <em>fair</em>'}</h2>
      <p>Keine versteckten Kosten. Alle Preise inklusive Diagnose, Arbeit und Pr&uuml;fprotokoll. Ersatzteile werden separat berechnet.</p>
    </div>
    <div class="pricing-table-wrap">
      <table class="pricing-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Dauer</th>
            <th>Festpreis</th>
          </tr>
        </thead>
        <tbody>
          ${pricingHtml}
        </tbody>
      </table>
    </div>
  </div>
</section>` : ''}

<!-- ====== REVIEWS ====== -->
${c.reviews.length > 0 ? `<section id="bewertungen" class="reviews-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">${esc(c.reviewsSectionTitle || 'Kundenstimmen')}</span>
      <h2 class="display">${c.reviewsSectionSubtitle || 'Das sagen unsere <em>Kunden</em>'}</h2>
      <p>Echte Bewertungen von E-Auto-Fahrer:innen aus Hamburg und Umgebung.</p>
    </div>
    <div class="reviews-grid">
      ${reviewsHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== LOCATION ====== -->
<section id="standort" class="location-section">
  <div class="container">
    <div class="location-grid">
      <div class="location-info">
        <span class="eyebrow">${esc(c.locationTitle || 'Standort')}</span>
        <h2 class="display">${c.locationSubtitle || 'Besuchen Sie <em>uns</em>'}</h2>
        <p>${c.address ? esc(c.address) : 'Unsere Werkstatt finden Sie zentral in Hamburg &mdash; mit CCS-Schnelllader direkt vor der T&uuml;r.'}</p>

        ${(c.locationDetails || []).length > 0 ? `<div class="loc-details">${locationDetailsHtml}</div>` : `
        <div class="loc-details">
          ${c.address ? `<div class="loc-detail">
            <div class="loc-icon">\u{1F4CD}</div>
            <div>
              <div class="loc-label">Adresse</div>
              <div class="loc-value">${esc(c.address)}</div>
            </div>
          </div>` : ''}
          ${c.phone ? `<div class="loc-detail">
            <div class="loc-icon">\u{1F4DE}</div>
            <div>
              <div class="loc-label">Telefon</div>
              <div class="loc-value"><a href="tel:${esc(c.phone)}">${esc(c.phone)}</a></div>
            </div>
          </div>` : ''}
          ${c.email ? `<div class="loc-detail">
            <div class="loc-icon">\u{2709}\u{FE0F}</div>
            <div>
              <div class="loc-label">E-Mail</div>
              <div class="loc-value"><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>
            </div>
          </div>` : ''}
        </div>`}
      </div>

      <div class="location-hours">
        <h3>\u{1F55B} &Ouml;ffnungszeiten</h3>
        <div class="hours-list">
          ${c.openingHours.map(h => `
          <div class="hours-row">
            <span class="hours-day">${esc(h.days)}</span>
            <span class="hours-time">${esc(h.hours)}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ====== FAQ ====== -->
${(c.faqItems || []).length > 0 ? `<section class="faq-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">H&auml;ufige Fragen</span>
      <h2 class="display">Gut zu <em>wissen</em></h2>
      <p>Antworten auf die wichtigsten Fragen rund um Hochvolt-Service, Batterie-Management, Rekuperation und Wallbox-Installation.</p>
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
      <span class="eyebrow">${esc(c.ctaSectionTitle || 'Termin vereinbaren')}</span>
      <h2 class="display">${c.ctaSectionSubtitle || 'Jetzt Werkstatt-Termin <em>buchen</em>'}</h2>
      <p>Ob E-Auto Inspektion, Batterie-Diagnose, Software-Update oder Wallbox-Installation &mdash; wir beraten Sie gerne zu Ihrem Elektrofahrzeug.</p>

      ${ctaFeaturesHtml.length > 0 ? `<div class="cta-features">${ctaFeaturesHtml}</div>` : `
      <div class="cta-features">
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Kostenlose Erstberatung
        </div>
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Zertifizierte Hochvolt-Techniker
        </div>
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Termin innerhalb von 48h
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
          <label>Fahrzeug</label>
          <select name="fahrzeug">
            <option>Tesla Model 3 / Y</option>
            <option>Tesla Model S / X</option>
            <option>VW ID.3 / ID.4 / ID.5</option>
            <option>VW ID. Buzz</option>
            <option>BMW iX / i4</option>
            <option>Mercedes EQA / EQB / EQC</option>
            <option>Hyundai Ioniq 5 / 6</option>
            <option>Porsche Taycan</option>
            <option>Anderes Elektrofahrzeug</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label>Anliegen</label>
          <select name="betreff">
            <option>E-Auto Inspektion</option>
            <option>Batterie-Diagnose</option>
            <option>Software-Update / OBD</option>
            <option>Wallbox-Installation</option>
            <option>Rekuperations-Check</option>
            <option>Hochvolt-Service</option>
            <option>CCS-Ladeproblem</option>
            <option>Allgemeine Anfrage</option>
          </select>
        </div>
        <div class="form-field">
          <label>Wunschtermin (optional)</label>
          <input type="text" name="wunschtermin" placeholder="z.B. KW 22, Dienstag">
        </div>
      </div>

      <div class="form-row full">
        <div class="form-field">
          <label>Nachricht*</label>
          <textarea name="message" required placeholder="Beschreiben Sie Ihr Anliegen oder Fehlerbild ..."></textarea>
        </div>
      </div>

      <div style="position:absolute;left:-9999px"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>

      <button type="submit" class="form-submit" id="contact-submit">
        Termin anfragen
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </button>
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
  (function() {
    var toggle = document.getElementById('nav-toggle');
    var links = document.getElementById('nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', function() {
        links.classList.toggle('open');
        var isOpen = links.classList.contains('open');
        toggle.setAttribute('aria-label', isOpen ? 'Men\\u00fc schlie\\u00dfen' : 'Men\\u00fc \\u00f6ffnen');
      });
      links.querySelectorAll('a').forEach(function(a) {
        a.addEventListener('click', function() {
          links.classList.remove('open');
          toggle.setAttribute('aria-label', 'Men\\u00fc \\u00f6ffnen');
        });
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
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:var(--offwhite);font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:' + '${hexToRgba(c.colors.background, 0.7)}' + ';font-size:1.05rem">Wir melden uns in K\\u00fcrze bei Ihnen.</p></div>';
          } else {
            alert(d.error || 'Fehler beim Senden');
            btn.textContent = 'Termin anfragen';
            btn.disabled = false;
          }
        })
        .catch(function() {
          alert('Verbindungsfehler');
          btn.textContent = 'Termin anfragen';
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
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba(c.colors.text, 0.97)};backdrop-filter:blur(12px);color:var(--offwhite);padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:${hexToRgba(c.colors.background, 0.8)}">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--mint);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--mint);color:#fff;border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
