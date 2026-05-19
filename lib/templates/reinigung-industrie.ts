/* eslint-disable @typescript-eslint/no-unused-vars */
// Reinigung-Industrie Template — Aurex Bochum Industriereinigung
// Dark, robust, technically competent industrial design

export interface ReinigungIndustrieConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Stahlblau #3a5a8c
    accent: string     // Warnorange #e8722a
    background: string // Schwarz #0e0e0e
    text: string       // Off-White #f0f0ed
  }
  phone?: string
  email?: string
  address?: string
  openingHours?: { days: string; hours: string }[]
  trustBadges: { icon: string; title: string; subtitle: string }[]
  services: { icon: string; title: string; description: string; features?: string[] }[]
  projects: { title: string; category: string; description: string; stats?: { label: string; value: string }[]; imageUrl?: string }[]
  reviews: { text: string; name: string; company: string; rating: number }[]
  faqItems: { question: string; answer: string }[]
  serviceArea?: { title: string; subtitle: string; regions: string[]; mapNote?: string }
  festpreisFeatures?: string[]
  heroImageUrl?: string
  aboutTitle?: string
  aboutText?: string
  aboutStats?: { value: string; label: string }[]
  notdienstPhone?: string
  contactEnabled?: boolean
  imprintUrl?: string
  privacyUrl?: string
  footerText?: string
  footerColumns?: { title: string; links: { label: string; href: string }[] }[]
}

function esc(str: string | undefined): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
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

export function renderReinigungIndustrieTemplate(config: ReinigungIndustrieConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primary = c.colors.primary || '#3a5a8c'
  const accent = c.colors.accent || '#e8722a'
  const bg = c.colors.background || '#0e0e0e'
  const textColor = c.colors.text || '#f0f0ed'

  const primaryDark = darkenHex(primary, 0.3)
  const primaryLight = tintHex(primary, 0.25)
  const accentDark = darkenHex(accent, 0.25)
  const accentSoft = hexToRgba(accent, 0.15)
  const accentGlow = hexToRgba(accent, 0.4)
  const bgLight = tintHex(bg, 0.06)
  const bgLighter = tintHex(bg, 0.1)
  const textSoft = hexToRgba(textColor, 0.72)
  const textDim = hexToRgba(textColor, 0.45)
  const borderColor = hexToRgba(textColor, 0.08)
  const borderHover = hexToRgba(primary, 0.35)

  const logoInitial = esc(c.businessName.charAt(0).toUpperCase())

  // Hero visual
  const heroVisualStyle = c.heroImageUrl
    ? `background: url('${esc(c.heroImageUrl)}') center/cover no-repeat;`
    : `background: linear-gradient(180deg, transparent 40%, ${hexToRgba(bg, 0.85)}), linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, ${bg} 100%);`

  // Trust badges HTML
  const trustHtml = c.trustBadges.map(b => {
    const iconSvg = b.icon === 'shield'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>'
      : b.icon === 'certificate'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/></svg>'
      : b.icon === 'check-circle'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>'
      : b.icon === 'lock'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
    return `
          <div class="trust-badge">
            <div class="trust-icon">${iconSvg}</div>
            <div class="trust-text">
              <h4>${esc(b.title)}</h4>
              <span>${esc(b.subtitle)}</span>
            </div>
          </div>`
  }).join('')

  // Services HTML
  const servicesHtml = c.services.map(s => {
    const iconSvg = s.icon === 'factory'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 20h20"/><path d="M5 20V8l5 4V8l5 4V4h5v16"/></svg>'
      : s.icon === 'building'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22V18h6v4"/><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/></svg>'
      : s.icon === 'warehouse'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 20V8l-10-6L2 8v12"/><path d="M2 20h20"/><rect x="6" y="12" width="4" height="8"/><rect x="14" y="12" width="4" height="8"/></svg>'
      : s.icon === 'droplets'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>'
      : s.icon === 'spray'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 22h8"/><path d="M12 11v11"/><circle cx="12" cy="7" r="4"/><path d="M5 3l2 4M19 3l-2 4M12 3V1"/></svg>'
      : s.icon === 'tank'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>'
    const featuresHtml = (s.features || []).map(f =>
      `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>${esc(f)}</li>`
    ).join('\n              ')
    return `
          <div class="service-card">
            <div class="service-icon">${iconSvg}</div>
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.description)}</p>
            ${featuresHtml ? `<ul class="service-features">${featuresHtml}</ul>` : ''}
          </div>`
  }).join('')

  // Projects HTML
  const projectsHtml = c.projects.map((p, i) => {
    const projectBg = p.imageUrl
      ? `background-image: url('${esc(p.imageUrl)}'); background-size: cover; background-position: center;`
      : `background: linear-gradient(135deg, ${i % 2 === 0 ? `${primary} 0%, ${primaryDark} 100%` : `${bgLighter} 0%, ${bg} 100%`});`
    const statsHtml = (p.stats || []).map(s =>
      `<div class="project-stat"><span class="stat-value">${esc(s.value)}</span><span class="stat-label">${esc(s.label)}</span></div>`
    ).join('')
    return `
          <div class="project-card${i % 2 !== 0 ? ' reverse' : ''}">
            <div class="project-image" style="${projectBg}">
              ${!p.imageUrl ? `<div class="project-placeholder">IMG: ${esc(p.title)}</div>` : ''}
            </div>
            <div class="project-content">
              <span class="project-category">${esc(p.category)}</span>
              <h3>${esc(p.title)}</h3>
              <p>${esc(p.description)}</p>
              ${statsHtml ? `<div class="project-stats">${statsHtml}</div>` : ''}
            </div>
          </div>`
  }).join('')

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
                <div class="review-company">${esc(r.company)}</div>
              </div>
            </div>
          </div>`
  }).join('')

  // FAQ HTML
  const faqHtml = c.faqItems.map(f => `
          <div class="faq-item">
            <button class="faq-q" aria-expanded="false">${esc(f.question)}<span class="faq-icon">+</span></button>
            <div class="faq-a" role="region">${esc(f.answer)}</div>
          </div>`).join('')

  // Service Area HTML
  const serviceAreaRegions = (c.serviceArea?.regions || []).map(r =>
    `<span class="region-tag">${esc(r)}</span>`
  ).join('')

  // Festpreis features
  const festpreisFeatures = c.festpreisFeatures || [
    'Kostenlose Vor-Ort-Besichtigung',
    'Verbindliches Festpreisangebot',
    'Keine versteckten Kosten',
    'Professionelle Ausf\u00fchrung',
  ]
  const festpreisFeaturesHtml = festpreisFeatures.map(f =>
    `<div class="festpreis-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
              ${esc(f)}
            </div>`
  ).join('\n            ')

  // About stats
  const aboutStats = c.aboutStats || []
  const aboutStatsHtml = aboutStats.length > 0 ? `
          <div class="about-stats">
            ${aboutStats.map(s => `
            <div class="about-stat">
              <div class="stat-num">${esc(s.value)}</div>
              <div class="stat-label">${esc(s.label)}</div>
            </div>`).join('')}
          </div>` : ''

  // Footer columns
  const footerColumns = c.footerColumns || [
    { title: 'Leistungen', links: [
      { label: 'Industriereinigung', href: '#services' },
      { label: 'Fassadenreinigung', href: '#services' },
      { label: 'Hallenreinigung', href: '#services' },
    ]},
    { title: 'Informationen', links: [
      { label: 'Referenzen', href: '#projects' },
      { label: 'Service-Gebiet', href: '#area' },
      { label: 'FAQ', href: '#faq' },
    ]},
  ]
  const footerColumnsHtml = footerColumns.map(col => `
          <div class="footer-col">
            <h4>${esc(col.title)}</h4>
            <ul>
              ${col.links.map(l => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('\n              ')}
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

<!-- Schema.org LocalBusiness -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "${esc(c.businessName)}",
  "description": "${esc(c.tagline)}",
  ${c.address ? `"address": { "@type": "PostalAddress", "streetAddress": "${esc(c.address)}" },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  "priceRange": "$$$",
  "areaServed": "${esc(c.serviceArea?.title || 'Ruhrgebiet & NRW')}",
  ${c.reviews.length > 0 ? `"aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "${(c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length).toFixed(1)}",
    "reviewCount": "${c.reviews.length}"
  },` : ''}
  ${(c.openingHours || []).length > 0 ? `"openingHoursSpecification": [${(c.openingHours || []).map(h => `{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": "${esc(h.days)}",
    "opens": "${esc(h.hours.split(' ')[0] || '')}",
    "closes": "${esc(h.hours.split(' ').pop() || '')}"
  }`).join(',')}],` : ''}
  "url": "${appUrl}${siteId ? `/s/${siteId}` : ''}"
}
</script>

<style>
  /* ========================================
     RESET & BASE
     ======================================== */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${bg};
    --bg-light: ${bgLight};
    --bg-lighter: ${bgLighter};
    --primary: ${primary};
    --primary-dark: ${primaryDark};
    --primary-light: ${primaryLight};
    --accent: ${accent};
    --accent-dark: ${accentDark};
    --accent-soft: ${accentSoft};
    --accent-glow: ${accentGlow};
    --text: ${textColor};
    --text-soft: ${textSoft};
    --text-dim: ${textDim};
    --border: ${borderColor};
    --border-hover: ${borderHover};
    --font-display: 'Fraunces', Georgia, serif;
    --font-body: 'Inter Tight', -apple-system, sans-serif;
    --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
    --spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    --smooth: cubic-bezier(0.22, 1, 0.36, 1);
  }
  html { scroll-behavior: smooth; }
  body {
    font-family: var(--font-body);
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }
  a { color: inherit; text-decoration: none; }
  img { display: block; max-width: 100%; }
  ul, ol { list-style: none; }
  .container { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
  section { padding: 96px 0; }
  .eyebrow {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .display {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: clamp(2rem, 4.5vw, 3.2rem);
    line-height: 1.12;
    letter-spacing: -0.02em;
    margin-top: 12px;
    font-variation-settings: "opsz" 72, "SOFT" 30;
  }
  .display em {
    font-style: normal;
    color: var(--accent);
    font-variation-settings: "opsz" 72, "SOFT" 70;
  }
  .section-head {
    text-align: center;
    margin-bottom: 64px;
  }
  .section-head p {
    max-width: 560px;
    margin: 16px auto 0;
    color: var(--text-soft);
    font-size: 1.05rem;
  }

  /* ========================================
     ANNOUNCEMENT BAR
     ======================================== */
  .announce {
    background: var(--accent);
    color: var(--bg);
    text-align: center;
    padding: 10px 20px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .announce a { color: var(--bg); text-decoration: underline; margin-left: 8px; }
  .announce svg {
    width: 14px; height: 14px;
    vertical-align: -2px;
    margin-right: 6px;
  }

  /* ========================================
     NAV
     ======================================== */
  nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background: ${hexToRgba(bg, 0.92)};
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
  }
  .nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 32px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.15rem;
    letter-spacing: -0.02em;
    font-variation-settings: "opsz" 24, "SOFT" 30;
  }
  .logo-mark {
    width: 36px; height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary);
    color: var(--text);
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 16px;
    border-radius: 8px;
    letter-spacing: 0;
  }
  .nav-links {
    display: flex;
    gap: 32px;
  }
  .nav-links a {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-soft);
    transition: color 0.2s;
    position: relative;
  }
  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: -4px; left: 0;
    width: 0;
    height: 2px;
    background: var(--accent);
    transition: width 0.3s var(--smooth);
  }
  .nav-links a:hover { color: var(--text); }
  .nav-links a:hover::after { width: 100%; }
  .nav-cta {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: var(--accent);
    color: var(--bg);
    border-radius: 8px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: all 0.2s;
  }
  .nav-cta:hover { background: ${accentDark}; }
  .nav-cta svg { width: 14px; height: 14px; }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    position: relative;
    min-height: 85vh;
    display: flex;
    align-items: center;
    overflow: hidden;
    background: var(--bg);
  }
  .hero-bg {
    position: absolute;
    inset: 0;
    ${heroVisualStyle}
    z-index: 0;
  }
  .hero-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, ${hexToRgba(bg, 0.6)} 0%, ${hexToRgba(bg, 0.85)} 60%, ${bg} 100%);
  }
  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 1200px;
    margin: 0 auto;
    padding: 120px 32px 96px;
  }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    background: var(--accent-soft);
    border: 1px solid ${hexToRgba(accent, 0.3)};
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 28px;
  }
  .hero-tag svg { width: 14px; height: 14px; }
  .hero h1 {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: clamp(2.8rem, 6vw, 4.2rem);
    line-height: 1.08;
    letter-spacing: -0.03em;
    max-width: 720px;
    margin-bottom: 24px;
    font-variation-settings: "opsz" 144, "SOFT" 20;
  }
  .hero h1 em {
    font-style: normal;
    color: var(--accent);
    font-variation-settings: "opsz" 144, "SOFT" 60;
  }
  .hero-lead {
    font-size: 1.15rem;
    color: var(--text-soft);
    max-width: 540px;
    line-height: 1.7;
    margin-bottom: 40px;
  }
  .hero-actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 16px 32px;
    background: var(--accent);
    color: var(--bg);
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.3s var(--spring);
  }
  .btn-primary:hover { background: ${accentDark}; transform: translateY(-2px); box-shadow: 0 8px 32px ${accentGlow}; }
  .btn-primary svg { width: 16px; height: 16px; }
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 16px 32px;
    background: transparent;
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border-radius: 8px;
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all 0.3s;
  }
  .btn-secondary:hover { border-color: var(--primary); background: ${hexToRgba(primary, 0.1)}; }
  .btn-secondary svg { width: 16px; height: 16px; }
  .hero-notdienst {
    margin-top: 32px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    background: ${hexToRgba(accent, 0.08)};
    border: 1px solid ${hexToRgba(accent, 0.2)};
    border-radius: 12px;
    max-width: fit-content;
  }
  .hero-notdienst svg {
    width: 20px; height: 20px;
    color: var(--accent);
    flex-shrink: 0;
  }
  .hero-notdienst .notdienst-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 2px;
  }
  .hero-notdienst .notdienst-phone {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.1rem;
    letter-spacing: -0.01em;
  }

  /* ========================================
     TRUST BADGES
     ======================================== */
  .trust {
    background: var(--bg-light);
    padding: 48px 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
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
    width: 48px; height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${hexToRgba(primary, 0.15)};
    border: 1px solid ${hexToRgba(primary, 0.25)};
    border-radius: 12px;
    flex-shrink: 0;
  }
  .trust-icon svg {
    width: 22px; height: 22px;
    color: var(--primary-light);
  }
  .trust-text h4 {
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 2px;
  }
  .trust-text span {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-dim);
  }

  /* ========================================
     SERVICES
     ======================================== */
  .services { background: var(--bg); }
  .services-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .service-card {
    background: var(--bg-light);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px 28px;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
  }
  .service-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--primary);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .service-card:hover { border-color: var(--border-hover); transform: translateY(-4px); }
  .service-card:hover::before { opacity: 1; }
  .service-icon {
    width: 52px; height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${hexToRgba(primary, 0.12)};
    border-radius: 14px;
    margin-bottom: 20px;
  }
  .service-icon svg {
    width: 24px; height: 24px;
    color: var(--primary-light);
  }
  .service-card h3 {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.15rem;
    margin-bottom: 10px;
    letter-spacing: -0.01em;
    font-variation-settings: "opsz" 24, "SOFT" 30;
  }
  .service-card p {
    font-size: 0.92rem;
    color: var(--text-soft);
    line-height: 1.65;
    margin-bottom: 16px;
  }
  .service-features {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .service-features li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.82rem;
    color: var(--text-soft);
  }
  .service-features svg {
    width: 14px; height: 14px;
    color: var(--accent);
    flex-shrink: 0;
  }

  /* ========================================
     REFERENZ-PROJEKTE
     ======================================== */
  .projects { background: var(--bg-light); }
  .project-card {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 0;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 32px;
    transition: border-color 0.3s;
  }
  .project-card:hover { border-color: var(--border-hover); }
  .project-card.reverse { direction: rtl; }
  .project-card.reverse > * { direction: ltr; }
  .project-image {
    position: relative;
    min-height: 320px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
    padding: 24px;
  }
  .project-placeholder {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-dim);
    letter-spacing: 0.08em;
  }
  .project-content {
    padding: 48px 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .project-category {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 12px;
  }
  .project-content h3 {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.5rem;
    margin-bottom: 14px;
    letter-spacing: -0.02em;
    font-variation-settings: "opsz" 36, "SOFT" 30;
  }
  .project-content p {
    font-size: 0.95rem;
    color: var(--text-soft);
    line-height: 1.7;
    margin-bottom: 24px;
  }
  .project-stats {
    display: flex;
    gap: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
  }
  .project-stat {
    display: flex;
    flex-direction: column;
  }
  .project-stat .stat-value {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.4rem;
    color: var(--accent);
    font-variation-settings: "opsz" 36, "SOFT" 50;
  }
  .project-stat .stat-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-dim);
    margin-top: 2px;
  }

  /* ========================================
     FESTPREIS-ANFRAGE FORMULAR
     ======================================== */
  .contact-section {
    background: var(--bg);
    position: relative;
  }
  .contact-section::before {
    content: '';
    position: absolute;
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 200px; height: 200px;
    background: radial-gradient(circle, ${accentGlow} 0%, transparent 70%);
    opacity: 0.3;
    pointer-events: none;
  }
  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    gap: 64px;
    align-items: start;
  }
  .contact-info h2 {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: clamp(1.8rem, 3vw, 2.4rem);
    line-height: 1.15;
    letter-spacing: -0.02em;
    margin-bottom: 16px;
    font-variation-settings: "opsz" 48, "SOFT" 30;
  }
  .contact-info h2 em { font-style: normal; color: var(--accent); }
  .contact-info > p {
    color: var(--text-soft);
    font-size: 1rem;
    line-height: 1.7;
    margin-bottom: 32px;
  }
  .festpreis-features {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .festpreis-feature {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.92rem;
    color: var(--text-soft);
  }
  .festpreis-feature svg {
    width: 18px; height: 18px;
    color: var(--accent);
    flex-shrink: 0;
  }
  .contact-form {
    background: var(--bg-light);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 40px;
    position: relative;
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
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-dim);
    margin-bottom: 6px;
  }
  .form-field input,
  .form-field select,
  .form-field textarea {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 16px;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.92rem;
    transition: border-color 0.2s;
    outline: none;
  }
  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px ${hexToRgba(primary, 0.15)};
  }
  .form-field textarea { min-height: 120px; resize: vertical; }
  .form-field select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 40px;
  }
  .form-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 16px;
    background: var(--accent);
    color: var(--bg);
    border: none;
    border-radius: 10px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s var(--spring);
    margin-top: 8px;
  }
  .form-submit:hover { background: ${accentDark}; transform: translateY(-2px); box-shadow: 0 6px 24px ${accentGlow}; }

  /* ========================================
     SERVICE-GEBIET MAP
     ======================================== */
  .area { background: var(--bg-light); }
  .area-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  .area-info h2 {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: clamp(1.8rem, 3vw, 2.4rem);
    line-height: 1.15;
    letter-spacing: -0.02em;
    margin-bottom: 16px;
    font-variation-settings: "opsz" 48, "SOFT" 30;
  }
  .area-info h2 em { font-style: normal; color: var(--accent); }
  .area-info > p {
    color: var(--text-soft);
    font-size: 1rem;
    line-height: 1.7;
    margin-bottom: 28px;
  }
  .region-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .region-tag {
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    background: ${hexToRgba(primary, 0.1)};
    border: 1px solid ${hexToRgba(primary, 0.2)};
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: var(--primary-light);
    transition: all 0.2s;
  }
  .region-tag:hover { background: ${hexToRgba(primary, 0.2)}; border-color: var(--primary); }
  .area-map {
    position: relative;
    aspect-ratio: 4/3;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .area-map-placeholder {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-dim);
    letter-spacing: 0.06em;
    text-align: center;
  }
  .area-map-placeholder svg {
    width: 48px; height: 48px;
    color: var(--primary);
    margin-bottom: 12px;
    opacity: 0.5;
  }
  .area-map-note {
    margin-top: 16px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-dim);
    letter-spacing: 0.04em;
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews-section { background: var(--bg); }
  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(${Math.min(c.reviews.length, 3)}, 1fr);
    gap: 24px;
  }
  .review-card {
    background: var(--bg-light);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px 28px;
    display: flex;
    flex-direction: column;
    transition: border-color 0.3s;
  }
  .review-card:hover { border-color: var(--border-hover); }
  .review-stars {
    display: flex;
    gap: 2px;
    margin-bottom: 16px;
  }
  .review-stars svg {
    width: 16px; height: 16px;
    color: var(--accent);
    fill: var(--accent);
  }
  .review-text {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 1.05rem;
    line-height: 1.6;
    margin-bottom: 24px;
    flex: 1;
    font-variation-settings: "opsz" 24, "SOFT" 50;
  }
  .review-author {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
  }
  .review-avatar {
    width: 44px; height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text);
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 15px;
  }
  .review-name {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 2px;
  }
  .review-company {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-dim);
    letter-spacing: 0.04em;
  }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section { background: var(--bg-light); }
  .faq-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    max-width: 960px;
    margin: 0 auto;
  }
  .faq-item {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .faq-item:hover { border-color: var(--border-hover); }
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
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text);
    transition: background 0.2s;
  }
  .faq-q:hover { background: var(--bg-light); }
  .faq-icon {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: var(--bg-lighter);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: var(--accent);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .faq-item.open .faq-icon { transform: rotate(45deg); background: var(--accent); color: var(--bg); }
  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), padding 0.35s;
    font-size: 0.88rem;
    color: var(--text-soft);
    line-height: 1.75;
    padding: 0 24px;
  }
  .faq-item.open .faq-a { max-height: 400px; padding: 0 24px 20px; }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: ${darkenHex(bg, 0.3)};
    color: var(--text-soft);
    padding: 72px 0 32px;
    border-top: 1px solid var(--border);
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 48px;
    margin-bottom: 48px;
  }
  .footer-brand .logo { color: var(--text); margin-bottom: 16px; }
  .footer-brand p {
    font-size: 14px;
    line-height: 1.65;
    max-width: 320px;
    color: var(--text-dim);
  }
  .footer-col h4 {
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 20px;
  }
  .footer-col ul { display: flex; flex-direction: column; gap: 10px; }
  .footer-col a {
    font-size: 14px;
    color: var(--text-dim);
    transition: color 0.2s;
  }
  .footer-col a:hover { color: var(--accent); }
  .footer-bottom {
    border-top: 1px solid var(--border);
    padding-top: 24px;
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.05em;
    color: var(--text-dim);
  }
  .footer-bottom a { transition: color 0.2s; }
  .footer-bottom a:hover { color: var(--accent); }

  /* ========================================
     STICKY MOBILE CTA
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 16px; left: 16px; right: 16px;
    background: var(--accent);
    color: var(--bg);
    padding: 16px 24px;
    border-radius: 12px;
    z-index: 100;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-align: center;
    box-shadow: 0 8px 32px ${hexToRgba(bg, 0.6)};
    transition: all 0.3s var(--spring);
  }
  .mobile-cta:hover { background: ${accentDark}; }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .services-grid { grid-template-columns: repeat(2, 1fr); }
    .contact-grid { grid-template-columns: 1fr; gap: 48px; }
    .area-layout { grid-template-columns: 1fr; gap: 48px; }
    .project-card { grid-template-columns: 1fr; }
    .project-card.reverse { direction: ltr; }
    .project-image { min-height: 240px; }
    .reviews-grid { grid-template-columns: 1fr 1fr; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .trust-grid { gap: 32px; }
  }
  @media (max-width: 768px) {
    section { padding: 64px 0; }
    .container { padding: 0 20px; }
    .nav-links { display: none; }
    .nav-cta { display: none; }
    .hero { min-height: 70vh; }
    .hero h1 { font-size: clamp(2rem, 8vw, 2.8rem); }
    .hero-actions { flex-direction: column; }
    .hero-actions .btn-primary,
    .hero-actions .btn-secondary { width: 100%; justify-content: center; }
    .services-grid { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
    .reviews-grid { grid-template-columns: 1fr; }
    .faq-grid { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .footer-bottom { flex-direction: column; gap: 12px; }
    .trust-grid { flex-direction: column; gap: 20px; align-items: flex-start; }
    .trust-badge { width: 100%; }
    .about-stats { grid-template-columns: 1fr 1fr; }
    .mobile-cta { display: block; }
    body { padding-bottom: 80px; }
    .project-stats { flex-wrap: wrap; }
    .area-map { aspect-ratio: 16/10; }
  }
  @media (max-width: 480px) {
    .about-stats { grid-template-columns: 1fr; }
    .hero-notdienst { width: 100%; }
  }
</style>
</head>
<body>

${c.announceText ? `<!-- ====== ANNOUNCEMENT BAR ====== -->
<div class="announce">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
  ${esc(c.announceText)}
</div>` : ''}

<!-- ====== NAV ====== -->
<nav>
  <div class="nav-inner">
    <a href="#" class="logo">
      <span class="logo-mark">${logoInitial}</span>
      ${esc(c.businessName)}
    </a>
    <div class="nav-links">
      <a href="#services">Leistungen</a>
      <a href="#projects">Referenzen</a>
      <a href="#reviews">Bewertungen</a>
      <a href="#area">Gebiet</a>
      <a href="#faq">FAQ</a>
      <a href="#contact">Kontakt</a>
    </div>
    <a href="#contact" class="nav-cta">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      ${esc(c.ctaText)}
    </a>
  </div>
</nav>

<!-- ====== HERO ====== -->
<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-content">
    <div class="hero-tag">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      ${esc(c.heroTag)}
    </div>
    <h1>${c.heroHeadline} <em>${esc(c.heroAccent)}</em></h1>
    <p class="hero-lead">${esc(c.heroLead)}</p>
    <div class="hero-actions">
      <a href="#contact" class="btn-primary">
        Festpreis anfragen
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
      <a href="#services" class="btn-secondary">
        Leistungen ansehen
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
      </a>
    </div>
    ${c.notdienstPhone ? `
    <div class="hero-notdienst">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      <div>
        <div class="notdienst-label">24h Notdienst</div>
        <div class="notdienst-phone">${esc(c.notdienstPhone)}</div>
      </div>
    </div>` : ''}
  </div>
</section>

<!-- ====== TRUST BADGES ====== -->
<section class="trust">
  <div class="container">
    <div class="trust-grid">
      ${trustHtml}
    </div>
  </div>
</section>

<!-- ====== SERVICES ====== -->
<section id="services" class="services">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Leistungen</span>
      <h2 class="display">Professionelle <em>Reinigungsl&ouml;sungen</em></h2>
      <p>Industrielle Reinigungskompetenz f&uuml;r h&ouml;chste Anspr&uuml;che &mdash; normgerecht, termingerecht, preisgerecht.</p>
    </div>
    <div class="services-grid">
      ${servicesHtml}
    </div>
  </div>
</section>

<!-- ====== REFERENZ-PROJEKTE ====== -->
${c.projects.length > 0 ? `<section id="projects" class="projects">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Referenzen</span>
      <h2 class="display">Ausgew&auml;hlte <em>Projekte</em></h2>
      <p>Einblicke in unsere Arbeit &mdash; von der Industrieanlage bis zur denkmalgesch&uuml;tzten Fassade.</p>
    </div>
    ${projectsHtml}
  </div>
</section>` : ''}

<!-- ====== FESTPREIS-ANFRAGE ====== -->
<section id="contact" class="contact-section">
  <div class="container">
    <div class="contact-grid">
      <div class="contact-info">
        <span class="eyebrow" style="display:block;margin-bottom:16px">Festpreis-Anfrage</span>
        <h2>Verbindliches Angebot <em>innerhalb 24h</em></h2>
        <p>Beschreiben Sie Ihr Reinigungsprojekt &mdash; wir erstellen Ihnen ein transparentes Festpreisangebot. Kostenlos und unverbindlich.</p>
        <div class="festpreis-features">
          ${festpreisFeaturesHtml}
        </div>
      </div>

      <form class="contact-form" id="contact-form">
        <div class="form-row">
          <div class="form-field">
            <label>Firma / Name*</label>
            <input type="text" name="name" required placeholder="Firmenname oder Vor- und Nachname">
          </div>
          <div class="form-field">
            <label>E-Mail*</label>
            <input type="email" name="email" required placeholder="mail@beispiel.de">
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>Telefon</label>
            <input type="tel" name="phone" placeholder="${c.phone ? esc(c.phone) : 'Telefonnummer'}">
          </div>
          <div class="form-field">
            <label>Leistung</label>
            <select name="leistung">
              <option>Industriereinigung</option>
              <option>Fassadenreinigung</option>
              <option>Hallenreinigung</option>
              <option>Hochdruckreinigung</option>
              <option>Graffiti-Entfernung</option>
              <option>Tankreinigung</option>
              <option>Sonstige Anfrage</option>
            </select>
          </div>
        </div>

        <div class="form-row full">
          <div class="form-field">
            <label>Objektbeschreibung*</label>
            <textarea name="message" required placeholder="Beschreiben Sie das Objekt, die Fl&auml;che und den gew&uuml;nschten Zeitraum ..."></textarea>
          </div>
        </div>

        <div style="position:absolute;left:-9999px"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>

        <button type="submit" class="form-submit" id="contact-submit">
          Festpreis-Angebot anfordern
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>
      </form>
    </div>
  </div>
</section>

<!-- ====== SERVICE-GEBIET ====== -->
${c.serviceArea ? `<section id="area" class="area">
  <div class="container">
    <div class="area-layout">
      <div class="area-info">
        <span class="eyebrow" style="display:block;margin-bottom:16px">Einsatzgebiet</span>
        <h2>${esc(c.serviceArea.title || 'Unser')} <em>${esc(c.serviceArea.subtitle || 'Service-Gebiet')}</em></h2>
        <p>${esc(c.serviceArea.mapNote || 'Wir sind in der gesamten Region f\u00fcr Sie im Einsatz \u2014 schnell, zuverl\u00e4ssig, flexibel.')}</p>
        <div class="region-tags">
          ${serviceAreaRegions}
        </div>
      </div>
      <div class="area-map">
        <div class="area-map-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <div>Karte: ${esc(c.serviceArea.title || 'Service-Gebiet')}</div>
        </div>
      </div>
    </div>
  </div>
</section>` : ''}

<!-- ====== REVIEWS ====== -->
${c.reviews.length > 0 ? `<section id="reviews" class="reviews-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Kundenstimmen</span>
      <h2 class="display">Das sagen unsere <em>Auftraggeber</em></h2>
      <p>Vertrauen durch Ergebnisse &mdash; unsere Kunden bewerten uns regelm&auml;&szlig;ig mit Bestnoten.</p>
    </div>
    <div class="reviews-grid">
      ${reviewsHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== FAQ ====== -->
${c.faqItems.length > 0 ? `<section id="faq" class="faq-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">H&auml;ufige Fragen</span>
      <h2 class="display">Fragen &amp; <em>Antworten</em></h2>
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
          ${c.notdienstPhone ? `<li style="margin-top:8px;color:var(--accent);font-family:var(--font-mono);font-size:11px;letter-spacing:0.06em">24H NOTDIENST: ${esc(c.notdienstPhone)}</li>` : ''}
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
<a href="tel:${esc(c.phone || c.notdienstPhone || '#')}" class="mobile-cta">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;vertical-align:-3px;margin-right:6px"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
  ${esc(c.ctaText)} &rarr;
</a>

<script>
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
        if (!data.name || !data.email) { alert('Firma/Name und E-Mail sind Pflichtfelder.'); return; }
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
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:var(--text);font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:var(--text-soft);font-size:1.05rem">Wir erstellen Ihr Festpreis-Angebot und melden uns innerhalb von 24 Stunden.</p></div>';
          } else {
            alert(d.error || 'Fehler beim Senden');
            btn.textContent = 'Festpreis-Angebot anfordern';
            btn.disabled = false;
          }
        })
        .catch(function() {
          alert('Verbindungsfehler');
          btn.textContent = 'Festpreis-Angebot anfordern';
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
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba(bg, 0.97)};backdrop-filter:blur(12px);color:var(--text);padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:var(--text-soft)">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--accent);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--accent);color:var(--bg);border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
