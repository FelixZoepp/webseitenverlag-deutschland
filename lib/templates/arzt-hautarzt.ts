export interface ArztHautarztConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  ctaBookingUrl?: string
  colors: {
    primary: string    // Rose #c4887a
    accent: string     // Sand #e8dcc8
    background: string // Off-White #faf8f5
    text: string       // Dunkel #2a2220
  }
  phone?: string
  email?: string
  address?: string
  city?: string
  openingHours: { days: string; hours: string }[]
  services: {
    name: string
    description: string
    icon?: string
    tag?: string
    details?: string[]
  }[]
  team: {
    name: string
    role: string
    specialties?: string
    imageUrl?: string
    quote?: string
    qualifications?: string[]
  }[]
  treatmentSteps: {
    step: string
    title: string
    description: string
  }[]
  reviews: { text: string; name: string; source: string; rating: number }[]
  faqItems?: { question: string; answer: string }[]
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
  locationTitle?: string
  locationSubtitle?: string
  locationDetails?: { icon: string; label: string; value: string }[]
  ctaSectionTitle?: string
  ctaSectionSubtitle?: string
  ctaFeatures?: string[]
  servicesSectionTitle?: string
  servicesSectionSubtitle?: string
  teamSectionTitle?: string
  teamSectionSubtitle?: string
  treatmentSectionTitle?: string
  treatmentSectionSubtitle?: string
  reviewsSectionTitle?: string
  sppiEnabled?: boolean
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

export function renderArztHautarztTemplate(config: ArztHautarztConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primaryDark = darkenHex(c.colors.primary, 0.25)
  const primarySoft = hexToRgba(c.colors.primary, 0.12)
  const accentDark = darkenHex(c.colors.accent, 0.3)
  const accentSoft = hexToRgba(c.colors.accent, 0.18)
  const bgTint = tintHex(c.colors.background, -0.03)
  const bgWarm = tintHex(c.colors.background, -0.06)
  const textSoft = tintHex(c.colors.text, 0.5)
  const borderColor = tintHex(c.colors.background, -0.1)

  const logoInitial = esc(c.businessName.charAt(0))

  // Service icon mapping for dermatology
  const serviceIconMap: Record<string, string> = {
    hautkrebsvorsorge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
    akne: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
    allergologie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    aesthetik: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z"/></svg>',
    laser: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12h4M18 12h4M12 2v4M12 18v4"/><circle cx="12" cy="12" r="4"/></svg>',
    botox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2a10 10 0 0 0 0 20 10 10 0 0 0 0-20z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/></svg>',
    default: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
  }

  function getServiceIcon(icon?: string): string {
    if (!icon) return serviceIconMap.default
    return serviceIconMap[icon] || serviceIconMap.default
  }

  // Services HTML
  const servicesHtml = c.services.map((svc, idx) => {
    const tagClass = svc.tag
      ? svc.tag.toLowerCase() === 'neu' ? ' new'
      : svc.tag.toLowerCase() === 'beliebt' ? ' popular'
      : svc.tag.toLowerCase() === 'premium' ? ' premium'
      : svc.tag.toLowerCase() === 'kasse' ? ' kasse'
      : ''
      : ''
    return `
      <div class="service-card" style="animation-delay: ${idx * 80}ms">
        <div class="service-icon-wrap">
          ${getServiceIcon(svc.icon)}
        </div>
        <div class="service-card-content">
          <div class="service-card-header">
            <h4>${esc(svc.name)}</h4>
            ${svc.tag ? `<span class="service-tag${tagClass}">${esc(svc.tag)}</span>` : ''}
          </div>
          <p>${esc(svc.description)}</p>
          ${svc.details && svc.details.length > 0 ? `
          <ul class="service-details">
            ${svc.details.map(d => `<li>${esc(d)}</li>`).join('\n            ')}
          </ul>` : ''}
        </div>
      </div>`
  }).join('\n')

  // Team HTML
  const teamHtml = c.team.map((member, idx) => {
    const initials = member.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    const defaultGradients = [
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${darkenHex(c.colors.primary, 0.3)} 100%)`,
      `linear-gradient(135deg, ${c.colors.accent} 0%, ${darkenHex(c.colors.accent, 0.25)} 100%)`,
      `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.2)} 0%, ${c.colors.primary} 100%)`,
      `linear-gradient(135deg, ${darkenHex(c.colors.primary, 0.1)} 0%, ${c.colors.accent} 100%)`,
    ]
    const bg = member.imageUrl
      ? `background-image:url('${esc(member.imageUrl)}');background-size:cover;background-position:center`
      : `background:${defaultGradients[idx % defaultGradients.length]}`
    return `
      <div class="team-card">
        <div class="team-photo" style="${bg}">
          ${!member.imageUrl ? `<span class="team-initials">${esc(initials)}</span>` : ''}
        </div>
        <div class="team-info">
          <h4>${esc(member.name)}</h4>
          <span class="team-role">${esc(member.role)}</span>
          ${member.specialties ? `<p class="team-specialties">${esc(member.specialties)}</p>` : ''}
          ${member.qualifications && member.qualifications.length > 0 ? `
          <div class="team-quals">
            ${member.qualifications.map(q => `<span class="team-qual-tag">${esc(q)}</span>`).join('\n            ')}
          </div>` : ''}
          ${member.quote ? `<p class="team-quote">&bdquo;${esc(member.quote)}&ldquo;</p>` : ''}
        </div>
      </div>`
  }).join('\n')

  // Treatment Timeline HTML
  const treatmentStepsHtml = c.treatmentSteps.map((step, idx) => `
      <div class="timeline-step" style="animation-delay: ${idx * 120}ms">
        <div class="timeline-marker">
          <span class="timeline-num">${esc(step.step)}</span>
          ${idx < c.treatmentSteps.length - 1 ? '<div class="timeline-line"></div>' : ''}
        </div>
        <div class="timeline-content">
          <h4>${esc(step.title)}</h4>
          <p>${esc(step.description)}</p>
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
          ${d.icon === 'pin' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
          : d.icon === 'transit' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>'
          : d.icon === 'phone' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
          : d.icon === 'parking' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>'
          : d.icon === 'wheelchair' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 12h6M12 9v6"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>'}
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
    { title: 'Leistungen', links: [
      { label: 'Hautkrebsvorsorge', href: '#leistungen' },
      { label: 'Allergologie', href: '#leistungen' },
      { label: '\u00c4sthetische Dermatologie', href: '#leistungen' },
    ]},
    { title: 'Praxis', links: [
      { label: 'Unser Team', href: '#team' },
      { label: 'Sprechzeiten', href: '#sprechzeiten' },
      { label: 'Anfahrt', href: '#standort' },
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

<!-- Schema.org MedicalBusiness -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "name": "${esc(c.businessName)}",
  "description": "${esc(c.tagline)}",
  "medicalSpecialty": "Dermatology",
  ${c.address ? `"address": { "@type": "PostalAddress", "streetAddress": "${esc(c.address)}"${c.city ? `, "addressLocality": "${esc(c.city)}"` : ''}, "addressCountry": "DE" },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  "priceRange": "$$",
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
  "hasMap": "https://maps.google.com/?q=${encodeURIComponent(c.address || c.businessName)}",
  "url": "${appUrl}${siteId ? `/s/${siteId}` : ''}"
}
</script>

<style>
  /* ========================================
     DESIGN TOKENS
     ======================================== */
  :root {
    --rose:            ${esc(c.colors.primary)};
    --rose-dark:       ${primaryDark};
    --rose-soft:       ${primarySoft};
    --sand:            ${esc(c.colors.accent)};
    --sand-dark:       ${accentDark};
    --sand-soft:       ${accentSoft};
    --offwhite:        ${esc(c.colors.background)};
    --offwhite-tint:   ${bgTint};
    --offwhite-warm:   ${bgWarm};
    --ink:             ${esc(c.colors.text)};
    --ink-soft:        ${textSoft};
    --border:          ${borderColor};

    --shadow-card:  0 12px 32px ${hexToRgba(c.colors.text, 0.07)};
    --shadow-image: 0 20px 60px ${hexToRgba(c.colors.text, 0.14)};
    --shadow-soft:  0 4px 16px ${hexToRgba(c.colors.text, 0.05)};

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
    background: var(--offwhite);
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
    color: var(--rose);
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }

  .eyebrow {
    color: var(--rose);
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
    background: var(--ink);
    color: var(--offwhite);
    text-align: center;
    padding: 10px 16px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }
  .announce strong { color: var(--rose); }

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
    font-size: 22px;
    letter-spacing: -0.02em;
    display: flex; align-items: center; gap: 10px;
  }
  .logo-mark {
    display: inline-flex; align-items: center; justify-content: center;
    width: 38px; height: 38px;
    background: var(--rose);
    color: var(--offwhite);
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 18px;
    border-radius: 10px;
    letter-spacing: 0;
  }
  .nav-links {
    display: flex; align-items: center; gap: 28px;
    list-style: none;
  }
  .nav-links a {
    font-size: 14px;
    font-weight: 500;
    color: var(--ink-soft);
    transition: color 0.2s;
    letter-spacing: 0.01em;
  }
  .nav-links a:hover { color: var(--rose); }
  .nav-cta {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--rose);
    color: var(--offwhite);
    padding: 10px 22px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 14px;
    transition: transform 0.25s var(--spring), background 0.2s;
    border: none; cursor: pointer;
  }
  .nav-cta:hover { transform: scale(1.04); background: var(--rose-dark); }
  .nav-cta svg { width: 14px; height: 14px; }

  /* Mobile menu toggle */
  .menu-toggle {
    display: none; background: none; border: none; cursor: pointer;
    width: 28px; height: 28px; color: var(--ink);
  }
  .menu-toggle svg { width: 100%; height: 100%; }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    padding: 80px 0 96px;
    background: var(--offwhite);
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute; top: -200px; right: -200px;
    width: 600px; height: 600px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.primary, 0.08)} 0%, transparent 70%);
    pointer-events: none;
  }
  .hero::after {
    content: '';
    position: absolute; bottom: -150px; left: -100px;
    width: 400px; height: 400px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.accent, 0.1)} 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  .hero-content { position: relative; z-index: 1; }
  .hero-tag {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--rose-soft);
    color: var(--rose-dark);
    padding: 6px 14px;
    border-radius: 50px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 24px;
  }
  .hero-tag svg { width: 14px; height: 14px; }
  .hero h1 {
    font-size: clamp(2.6rem, 4.5vw, 3.8rem);
    margin-bottom: 24px;
  }
  .hero-lead {
    font-size: 1.12rem;
    color: var(--ink-soft);
    line-height: 1.7;
    max-width: 520px;
    margin-bottom: 32px;
  }
  .hero-actions {
    display: flex; gap: 16px; align-items: center; flex-wrap: wrap;
  }
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--rose);
    color: var(--offwhite);
    padding: 14px 32px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 15px;
    transition: transform 0.3s var(--spring), background 0.2s;
    border: none; cursor: pointer;
    font-family: var(--font-body);
  }
  .btn-primary:hover { transform: scale(1.04); background: var(--rose-dark); }
  .btn-primary svg { width: 16px; height: 16px; }
  .btn-secondary {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent;
    color: var(--ink);
    padding: 14px 28px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 15px;
    border: 2px solid var(--border);
    transition: border-color 0.2s, color 0.2s;
    cursor: pointer;
    font-family: var(--font-body);
  }
  .btn-secondary:hover { border-color: var(--rose); color: var(--rose); }
  .btn-secondary svg { width: 16px; height: 16px; }

  .hero-visual {
    position: relative;
  }
  .hero-image {
    width: 100%;
    aspect-ratio: 4 / 5;
    border-radius: 24px;
    object-fit: cover;
    box-shadow: var(--shadow-image);
  }
  .hero-image-placeholder {
    width: 100%;
    aspect-ratio: 4 / 5;
    border-radius: 24px;
    background: linear-gradient(135deg, ${c.colors.primary} 0%, ${c.colors.accent} 50%, ${tintHex(c.colors.primary, 0.3)} 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: var(--shadow-image);
    position: relative; overflow: hidden;
  }
  .hero-image-placeholder::after {
    content: '';
    position: absolute; inset: 0;
    background: repeating-linear-gradient(45deg, transparent, transparent 20px, ${hexToRgba(c.colors.background, 0.04)} 20px, ${hexToRgba(c.colors.background, 0.04)} 40px);
  }
  .hero-image-placeholder svg {
    width: 80px; height: 80px; opacity: 0.3;
    color: var(--offwhite);
  }
  .hero-floating-card {
    position: absolute;
    bottom: -20px; left: -30px;
    background: var(--offwhite);
    border-radius: 16px;
    padding: 16px 20px;
    box-shadow: var(--shadow-card);
    display: flex; align-items: center; gap: 12px;
    z-index: 2;
  }
  .hero-floating-icon {
    width: 42px; height: 42px;
    background: var(--rose-soft);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    color: var(--rose);
  }
  .hero-floating-icon svg { width: 20px; height: 20px; }
  .hero-floating-text { font-size: 13px; line-height: 1.4; }
  .hero-floating-text strong { display: block; color: var(--ink); font-weight: 700; }

  .hero-trust-bar {
    margin-top: 40px;
    display: flex; gap: 32px; flex-wrap: wrap;
  }
  .hero-trust-item {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px;
    color: var(--ink-soft);
    font-weight: 500;
  }
  .hero-trust-item svg {
    width: 18px; height: 18px;
    color: var(--rose);
    flex-shrink: 0;
  }

  /* ========================================
     SECTION HEADS
     ======================================== */
  .section-head {
    text-align: center;
    margin-bottom: 64px;
  }
  .section-head .eyebrow { margin-bottom: 12px; display: block; }
  .section-head h2 { font-size: clamp(2rem, 3.5vw, 3rem); margin-bottom: 16px; }
  .section-head p {
    max-width: 600px; margin: 0 auto;
    color: var(--ink-soft);
    font-size: 1.05rem;
    line-height: 1.7;
  }

  /* ========================================
     SERVICES / LEISTUNGEN
     ======================================== */
  .services-section {
    background: var(--offwhite-tint);
  }
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 24px;
  }
  .service-card {
    background: var(--offwhite);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px 28px;
    display: flex; gap: 20px;
    transition: transform 0.3s var(--spring), box-shadow 0.3s;
  }
  .service-card:hover {
    transform: translateY(-6px);
    box-shadow: var(--shadow-card);
  }
  .service-icon-wrap {
    width: 52px; height: 52px;
    background: var(--rose-soft);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    color: var(--rose);
  }
  .service-icon-wrap svg { width: 24px; height: 24px; }
  .service-card-content { flex: 1; }
  .service-card-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 8px;
  }
  .service-card-header h4 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.1rem;
    letter-spacing: -0.01em;
  }
  .service-tag {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 50px;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--rose-soft);
    color: var(--rose-dark);
  }
  .service-tag.new { background: #e8f5e9; color: #2e7d32; }
  .service-tag.popular { background: var(--rose-soft); color: var(--rose-dark); }
  .service-tag.premium { background: var(--sand-soft); color: var(--sand-dark); }
  .service-tag.kasse { background: #e3f2fd; color: #1565c0; }
  .service-card-content p {
    font-size: 0.92rem;
    color: var(--ink-soft);
    line-height: 1.6;
    margin-bottom: 8px;
  }
  .service-details {
    list-style: none;
    display: flex; flex-wrap: wrap; gap: 6px;
    margin-top: 8px;
  }
  .service-details li {
    display: inline-flex; align-items: center;
    padding: 3px 12px;
    background: var(--offwhite-tint);
    border: 1px solid var(--border);
    border-radius: 50px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    color: var(--ink-soft);
    letter-spacing: 0.02em;
  }

  /* ========================================
     TEAM
     ======================================== */
  .team-section {
    background: var(--offwhite);
  }
  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 32px;
  }
  .team-card {
    background: var(--offwhite);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    transition: transform 0.3s var(--spring), box-shadow 0.3s;
  }
  .team-card:hover {
    transform: translateY(-6px);
    box-shadow: var(--shadow-card);
  }
  .team-photo {
    width: 100%;
    aspect-ratio: 3 / 4;
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .team-initials {
    font-family: var(--font-display);
    font-size: 3rem;
    font-weight: 700;
    color: var(--offwhite);
    opacity: 0.5;
  }
  .team-info {
    padding: 24px;
  }
  .team-info h4 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.2rem;
    margin-bottom: 4px;
    letter-spacing: -0.01em;
  }
  .team-role {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--rose);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    display: block;
    margin-bottom: 10px;
  }
  .team-specialties {
    font-size: 0.88rem;
    color: var(--ink-soft);
    line-height: 1.5;
    margin-bottom: 10px;
  }
  .team-quals {
    display: flex; flex-wrap: wrap; gap: 6px;
    margin-bottom: 12px;
  }
  .team-qual-tag {
    display: inline-block;
    padding: 3px 10px;
    background: var(--sand-soft);
    border-radius: 50px;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--sand-dark);
  }
  .team-quote {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 0.92rem;
    color: var(--ink-soft);
    line-height: 1.5;
    font-variation-settings: "opsz" 14, "SOFT" 80;
  }

  /* ========================================
     TREATMENT TIMELINE / BEHANDLUNGSABLAUF
     ======================================== */
  .treatment-section {
    background: var(--offwhite-tint);
  }
  .timeline {
    max-width: 720px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .timeline-step {
    display: flex;
    gap: 24px;
    position: relative;
  }
  .timeline-marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    width: 52px;
  }
  .timeline-num {
    width: 52px; height: 52px;
    background: var(--rose);
    color: var(--offwhite);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 16px;
    flex-shrink: 0;
    z-index: 1;
  }
  .timeline-line {
    width: 2px;
    flex: 1;
    background: linear-gradient(to bottom, var(--rose), var(--sand));
    margin-top: 4px;
    min-height: 40px;
  }
  .timeline-content {
    flex: 1;
    padding-bottom: 40px;
  }
  .timeline-content h4 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.15rem;
    margin-bottom: 8px;
    letter-spacing: -0.01em;
    padding-top: 12px;
  }
  .timeline-content p {
    font-size: 0.95rem;
    color: var(--ink-soft);
    line-height: 1.7;
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews-section {
    background: var(--offwhite);
  }
  .reviews-track {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }
  .review-card {
    background: var(--offwhite);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px;
    transition: transform 0.3s var(--spring), box-shadow 0.3s;
  }
  .review-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
  }
  .review-stars {
    display: flex; gap: 2px; margin-bottom: 16px;
  }
  .review-stars svg {
    width: 18px; height: 18px;
    fill: var(--rose);
  }
  .review-text {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 1.05rem;
    line-height: 1.6;
    margin-bottom: 20px;
    color: var(--ink);
    font-variation-settings: "opsz" 14, "SOFT" 60;
  }
  .review-author {
    display: flex; align-items: center; gap: 12px;
  }
  .review-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: var(--rose-soft);
    color: var(--rose-dark);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700;
    font-size: 14px;
  }
  .review-name { font-weight: 600; font-size: 0.92rem; }
  .review-meta { font-size: 0.82rem; color: var(--ink-soft); }

  /* ========================================
     SPRECHZEITEN / OPENING HOURS
     ======================================== */
  .hours-section {
    background: var(--ink);
    color: var(--offwhite);
  }
  .hours-section .eyebrow { color: var(--rose); }
  .hours-section .display em { color: var(--rose); }
  .hours-section .section-head p { color: ${hexToRgba(c.colors.background, 0.65)}; }
  .hours-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
    max-width: 800px;
    margin: 0 auto;
  }
  .hours-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px;
    background: ${hexToRgba(c.colors.background, 0.06)};
    border-radius: 12px;
    border: 1px solid ${hexToRgba(c.colors.background, 0.08)};
  }
  .hours-item .label {
    display: flex; align-items: center; gap: 8px;
    font-weight: 500;
    font-size: 0.92rem;
    color: ${hexToRgba(c.colors.background, 0.85)};
  }
  .hours-item .label svg { width: 16px; height: 16px; color: var(--rose); }
  .hours-item .value {
    font-family: var(--font-mono);
    font-weight: 600;
    font-size: 0.88rem;
    color: var(--offwhite);
  }
  .hours-emergency {
    text-align: center;
    margin-top: 32px;
    padding: 20px 24px;
    background: var(--rose-soft);
    border-radius: 16px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
  .hours-emergency p {
    font-size: 0.95rem;
    color: var(--offwhite);
    margin: 0;
  }
  .hours-emergency strong { color: var(--rose); }

  /* ========================================
     LOCATION / STANDORT
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
  .location-details { display: flex; flex-direction: column; gap: 20px; }
  .location-detail {
    display: flex; align-items: flex-start; gap: 16px;
  }
  .location-detail .icon {
    width: 44px; height: 44px;
    background: var(--rose-soft);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    color: var(--rose);
  }
  .location-detail .icon svg { width: 20px; height: 20px; }
  .location-detail .label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-bottom: 2px;
  }
  .location-detail .value {
    font-weight: 500;
    font-size: 0.95rem;
  }
  .location-map-placeholder {
    width: 100%;
    aspect-ratio: 4 / 3;
    background: var(--sand-soft);
    border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid var(--border);
  }
  .location-map-placeholder svg {
    width: 48px; height: 48px;
    color: var(--rose);
    opacity: 0.4;
  }

  /* ========================================
     CONTACT FORM
     ======================================== */
  .contact-section {
    background: var(--ink);
    color: var(--offwhite);
  }
  .contact-section .eyebrow { color: var(--rose); }
  .contact-section .display em { color: var(--rose); }
  .contact-section .section-head p { color: ${hexToRgba(c.colors.background, 0.65)}; }
  .contact-form {
    max-width: 680px;
    margin: 0 auto;
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
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--rose);
    margin-bottom: 6px;
  }
  .form-field input,
  .form-field select,
  .form-field textarea {
    width: 100%;
    padding: 12px 16px;
    background: ${hexToRgba(c.colors.background, 0.08)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.15)};
    border-radius: 10px;
    color: var(--offwhite);
    font-family: var(--font-body);
    font-size: 15px;
    transition: border-color 0.2s;
  }
  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus {
    outline: none;
    border-color: var(--rose);
  }
  .form-field textarea { min-height: 120px; resize: vertical; }
  .form-field select { appearance: none; cursor: pointer; }
  .form-field input::placeholder,
  .form-field textarea::placeholder {
    color: ${hexToRgba(c.colors.background, 0.35)};
  }
  .form-submit {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--rose);
    color: var(--offwhite);
    padding: 14px 36px;
    border-radius: 50px;
    font-weight: 700;
    font-size: 15px;
    border: none;
    cursor: pointer;
    font-family: var(--font-body);
    margin-top: 8px;
    transition: transform 0.25s var(--spring), background 0.2s;
  }
  .form-submit:hover { transform: scale(1.04); background: var(--rose-dark); }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section {
    background: var(--offwhite);
  }
  .faq-grid {
    max-width: 800px;
    margin: 0 auto;
    display: flex; flex-direction: column; gap: 2px;
    background: var(--border);
    border-radius: 16px;
    overflow: hidden;
  }
  .faq-item { background: var(--offwhite); }
  .faq-q {
    width: 100%;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.05rem;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ink);
    transition: color 0.2s;
    gap: 16px;
    letter-spacing: -0.01em;
  }
  .faq-q:hover { color: var(--rose); }
  .faq-icon {
    font-size: 1.3rem;
    font-weight: 300;
    color: var(--rose);
    transition: transform 0.3s var(--spring);
    flex-shrink: 0;
  }
  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s var(--smooth), padding 0.4s;
    padding: 0 24px;
    font-size: 0.95rem;
    color: var(--ink-soft);
    line-height: 1.7;
  }
  .faq-item.open .faq-a {
    max-height: 400px;
    padding: 0 24px 20px;
  }
  .faq-item.open .faq-icon {
    transform: rotate(45deg);
  }

  /* ========================================
     CTA SECTION
     ======================================== */
  .cta-section {
    background: linear-gradient(135deg, var(--rose) 0%, ${darkenHex(c.colors.primary, 0.25)} 100%);
    color: var(--offwhite);
    text-align: center;
  }
  .cta-section .eyebrow { color: var(--sand); }
  .cta-section .display { margin-bottom: 16px; }
  .cta-section .display em { color: var(--offwhite); font-variation-settings: "opsz" 144, "SOFT" 100; }
  .cta-section p {
    color: ${hexToRgba(c.colors.background, 0.8)};
    max-width: 540px;
    margin: 0 auto 24px;
    font-size: 1.05rem;
    line-height: 1.7;
  }
  .cta-features {
    display: flex; justify-content: center; gap: 24px;
    margin-bottom: 32px;
    flex-wrap: wrap;
  }
  .cta-feature {
    display: flex; align-items: center; gap: 8px;
    font-size: 0.92rem;
    color: ${hexToRgba(c.colors.background, 0.9)};
  }
  .cta-feature svg {
    width: 18px; height: 18px;
    color: var(--sand);
  }
  .btn-cta {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--offwhite);
    color: var(--rose-dark);
    padding: 16px 40px;
    border-radius: 50px;
    font-weight: 700;
    font-size: 16px;
    transition: transform 0.3s var(--spring), background 0.2s;
    border: none; cursor: pointer;
    font-family: var(--font-body);
  }
  .btn-cta:hover { transform: scale(1.05); background: var(--sand); }
  .btn-cta svg { width: 18px; height: 18px; }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: var(--ink);
    color: var(--offwhite);
    padding: 64px 0 32px;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 48px;
    margin-bottom: 48px;
  }
  .footer-brand .logo {
    margin-bottom: 16px;
    font-size: 22px;
    color: var(--offwhite);
  }
  .footer-brand .logo-mark {
    background: var(--rose);
    color: var(--offwhite);
  }
  .footer-brand p {
    color: ${hexToRgba(c.colors.background, 0.55)};
    font-size: 0.92rem;
    line-height: 1.6;
    max-width: 280px;
  }
  .footer-col h4 {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--rose);
    margin-bottom: 16px;
  }
  .footer-col ul {
    list-style: none;
    display: flex; flex-direction: column; gap: 10px;
  }
  .footer-col li {
    font-size: 0.9rem;
    color: ${hexToRgba(c.colors.background, 0.6)};
  }
  .footer-col a {
    color: ${hexToRgba(c.colors.background, 0.6)};
    transition: color 0.2s;
  }
  .footer-col a:hover { color: var(--rose); }
  .footer-bottom {
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 32px;
    border-top: 1px solid ${hexToRgba(c.colors.background, 0.1)};
    font-size: 0.82rem;
    color: ${hexToRgba(c.colors.background, 0.4)};
    flex-wrap: wrap;
    gap: 12px;
  }
  .footer-bottom a {
    color: ${hexToRgba(c.colors.background, 0.5)};
    transition: color 0.2s;
  }
  .footer-bottom a:hover { color: var(--rose); }

  /* ========================================
     MOBILE CTA
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed; bottom: 0; left: 0; right: 0;
    z-index: 40;
    background: var(--rose);
    color: var(--offwhite);
    padding: 14px 24px;
    text-align: center;
    font-weight: 700;
    font-size: 15px;
    font-family: var(--font-body);
    transition: background 0.2s;
  }
  .mobile-cta:hover { background: var(--rose-dark); }

  /* ========================================
     ABOUT STATS
     ======================================== */
  .about-stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 24px;
    margin-top: 40px;
  }
  .about-stat {
    text-align: center;
    padding: 20px 16px;
    background: var(--offwhite);
    border: 1px solid var(--border);
    border-radius: 12px;
  }
  .about-stat .num {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.6rem;
    color: var(--rose);
    letter-spacing: -0.02em;
    line-height: 1;
    margin-bottom: 4px;
  }
  .about-stat .label {
    font-size: 0.82rem;
    color: var(--ink-soft);
  }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .hero-grid { grid-template-columns: 1fr; gap: 40px; }
    .hero-visual { max-width: 480px; margin: 0 auto; }
    .location-grid { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .services-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 768px) {
    section { padding: 64px 0; }
    .container { padding: 0 20px; }

    .nav-links { display: none; }
    .menu-toggle { display: block; }

    .nav-inner { padding: 12px 20px; }
    .logo { font-size: 18px; }
    .logo-mark { width: 32px; height: 32px; font-size: 15px; }

    .hero { padding: 48px 0 64px; }
    .hero h1 { font-size: 2rem; }
    .hero-lead { font-size: 1rem; }
    .hero-actions { flex-direction: column; align-items: stretch; }
    .hero-floating-card { display: none; }
    .hero-trust-bar { gap: 16px; }

    .section-head h2 { font-size: 1.8rem; }
    .section-head { margin-bottom: 40px; }

    .service-card { padding: 24px 20px; }

    .team-grid { grid-template-columns: 1fr; max-width: 380px; margin: 0 auto; }

    .timeline-step { gap: 16px; }
    .timeline-marker { width: 40px; }
    .timeline-num { width: 40px; height: 40px; font-size: 14px; }
    .timeline-content { padding-bottom: 28px; }
    .timeline-content h4 { padding-top: 8px; }

    .reviews-track { grid-template-columns: 1fr; }

    .hours-grid { grid-template-columns: 1fr; }

    .form-row { grid-template-columns: 1fr; }

    .footer-grid { grid-template-columns: 1fr; gap: 32px; }

    .mobile-cta { display: block; }
    footer { padding-bottom: 72px; }

    .cta-features { flex-direction: column; align-items: center; }
  }

  @media (max-width: 480px) {
    .hero h1 { font-size: 1.7rem; }
    .about-stats { grid-template-columns: 1fr 1fr; }
    .hero-trust-bar { flex-direction: column; gap: 10px; }
  }

  /* ========================================
     NAV MOBILE MENU
     ======================================== */
  .nav-links.open {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0; right: 0;
    background: var(--offwhite);
    border-bottom: 1px solid var(--border);
    padding: 20px 32px;
    gap: 16px;
    box-shadow: var(--shadow-card);
    z-index: 50;
  }
  .nav-links.open a { font-size: 16px; }
</style>
</head>
<body>

${c.announceText ? `<!-- ====== ANNOUNCEMENT ====== -->
<div class="announce">${c.announceText}</div>` : ''}

<!-- ====== NAV ====== -->
<nav>
  <div class="nav-inner">
    <a href="#" class="logo">
      <span class="logo-mark">${logoInitial}</span>
      ${esc(c.businessName)}
    </a>
    <ul class="nav-links" id="nav-links">
      <li><a href="#leistungen">Leistungen</a></li>
      <li><a href="#team">Team</a></li>
      <li><a href="#behandlung">Ablauf</a></li>
      <li><a href="#reviews">Bewertungen</a></li>
      <li><a href="#sprechzeiten">Sprechzeiten</a></li>
      <li><a href="#standort">Standort</a></li>
    </ul>
    <a href="${esc(c.ctaBookingUrl || '#contact')}" class="nav-cta">
      ${esc(c.ctaText)}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>
    <button class="menu-toggle" id="menu-toggle" aria-label="Men&uuml; &ouml;ffnen">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
    </button>
  </div>
</nav>

<!-- ====== HERO ====== -->
<section class="hero" id="hero">
  <div class="container">
    <div class="hero-grid">
      <div class="hero-content">
        <div class="hero-tag">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          ${esc(c.heroTag)}
        </div>
        <h1 class="display">${c.heroHeadline} <em>${esc(c.heroAccent)}</em></h1>
        <p class="hero-lead">${esc(c.heroLead)}</p>
        <div class="hero-actions">
          <a href="${esc(c.ctaBookingUrl || '#contact')}" class="btn-primary">
            ${esc(c.ctaText)}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
          <a href="#leistungen" class="btn-secondary">
            Unsere Leistungen
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </a>
        </div>
        <div class="hero-trust-bar">
          <div class="hero-trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Facharzt f&uuml;r Dermatologie
          </div>
          <div class="hero-trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>
            Alle Kassen &amp; Privat
          </div>
          <div class="hero-trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Kurzfristige Termine
          </div>
        </div>
      </div>
      <div class="hero-visual">
        ${c.heroImageUrl
          ? `<img src="${esc(c.heroImageUrl)}" alt="${esc(c.businessName)}" class="hero-image">`
          : `<div class="hero-image-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>`}
        <div class="hero-floating-card">
          <div class="hero-floating-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z"/></svg>
          </div>
          <div class="hero-floating-text">
            <strong>${c.reviews.length > 0 ? (c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length).toFixed(1) : '5.0'} / 5.0</strong>
            ${c.reviews.length}+ Patientenbewertungen
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ====== LEISTUNGEN ====== -->
<section class="services-section" id="leistungen">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.servicesSectionTitle || 'Unsere Leistungen')}</span>
      <h2 class="display">Dermatologie &amp; <em>&Auml;sthetik</em>.</h2>
      ${c.servicesSectionSubtitle ? `<p>${esc(c.servicesSectionSubtitle)}</p>` : '<p>Von der Hautkrebsvorsorge mit Dermatoskopie &uuml;ber Allergietests bis zur &auml;sthetischen Behandlung mit Hyaluron und Botox &mdash; Ihre Haut in besten H&auml;nden.</p>'}
    </div>
    <div class="services-grid">
      ${servicesHtml}
    </div>
  </div>
</section>

<!-- ====== TEAM ====== -->
<section class="team-section" id="team">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.teamSectionTitle || 'Unser Team')}</span>
      <h2 class="display">Erfahrung trifft <em>Empathie</em>.</h2>
      ${c.teamSectionSubtitle ? `<p>${esc(c.teamSectionSubtitle)}</p>` : '<p>Unser Team aus Fach&auml;rzten und medizinischen Fachangestellten verbindet fachliche Exzellenz mit individueller Betreuung.</p>'}
    </div>
    <div class="team-grid">
      ${teamHtml}
    </div>
    ${aboutStatsHtml}
  </div>
</section>

<!-- ====== BEHANDLUNGSABLAUF / TIMELINE ====== -->
<section class="treatment-section" id="behandlung">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.treatmentSectionTitle || 'Behandlungsablauf')}</span>
      <h2 class="display">Ihr Weg zur <em>gesunden Haut</em>.</h2>
      ${c.treatmentSectionSubtitle ? `<p>${esc(c.treatmentSectionSubtitle)}</p>` : '<p>Von der Erstberatung bis zur Nachsorge &mdash; transparent und auf Sie zugeschnitten.</p>'}
    </div>
    <div class="timeline">
      ${treatmentStepsHtml}
    </div>
  </div>
</section>

<!-- ====== REVIEWS ====== -->
<section class="reviews-section" id="reviews">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.reviewsSectionTitle || 'Patientenstimmen')}</span>
      <h2 class="display">Was unsere <em>Patienten</em> sagen.</h2>
    </div>
    <div class="reviews-track">
      ${reviewsHtml}
    </div>
  </div>
</section>

<!-- ====== SPRECHZEITEN ====== -->
<section class="hours-section" id="sprechzeiten">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Sprechzeiten</span>
      <h2 class="display">Wir sind f&uuml;r <em>Sie da</em>.</h2>
      <p>Vereinbaren Sie Ihren Termin telefonisch oder &uuml;ber unser Kontaktformular.</p>
    </div>
    <div class="hours-grid">
      ${hoursHtml}
    </div>
    ${c.phone ? `
    <div class="hours-emergency">
      <p>F&uuml;r dringende dermatologische Anliegen erreichen Sie uns telefonisch unter <strong>${esc(c.phone)}</strong>.</p>
    </div>` : ''}
  </div>
</section>

<!-- ====== STANDORT ====== -->
<section class="location-section" id="standort">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.locationTitle || 'Standort & Anfahrt')}</span>
      <h2 class="display">Besuchen Sie <em>unsere Praxis</em>.</h2>
      ${c.locationSubtitle ? `<p>${esc(c.locationSubtitle)}</p>` : ''}
    </div>
    <div class="location-grid">
      <div class="location-details">
        ${locationDetailsHtml}
        ${c.address ? `
        <div class="location-detail">
          <div class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div>
            <div class="label">Praxisadresse</div>
            <div class="value">${esc(c.address)}</div>
          </div>
        </div>` : ''}
        ${c.phone ? `
        <div class="location-detail">
          <div class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div>
            <div class="label">Telefon</div>
            <div class="value">${esc(c.phone)}</div>
          </div>
        </div>` : ''}
        ${c.email ? `
        <div class="location-detail">
          <div class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/></svg>
          </div>
          <div>
            <div class="label">E-Mail</div>
            <div class="value">${esc(c.email)}</div>
          </div>
        </div>` : ''}
      </div>
      <div class="location-map-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    </div>
  </div>
</section>

${(c.faqItems || []).length > 0 ? `<!-- ====== FAQ ====== -->
<section class="faq-section" id="faq">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">H&auml;ufige Fragen</span>
      <h2 class="display">Fragen &amp; <em>Antworten</em>.</h2>
      <p>Wissenswertes zu Hautkrebsscreening, Dermatoskopie, Allergietest, Photodynamischer Therapie und mehr.</p>
    </div>
    <div class="faq-grid">
      ${faqHtml}
    </div>
  </div>
</section>` : ''}

${c.contactEnabled !== false ? `<!-- ====== CONTACT ====== -->
<section class="contact-section" id="contact">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Kontakt</span>
      <h2 class="display">Termin <em>vereinbaren</em>.</h2>
      <p>Schreiben Sie uns Ihr Anliegen &mdash; wir melden uns zeitnah bei Ihnen zur&uuml;ck.</p>
    </div>
    <form class="contact-form" id="contact-form">
      <div class="form-row">
        <div class="form-field">
          <label>Name*</label>
          <input type="text" name="name" required placeholder="Ihr Name">
        </div>
        <div class="form-field">
          <label>E-Mail*</label>
          <input type="email" name="email" required placeholder="ihre@email.de">
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label>Telefon</label>
          <input type="tel" name="phone" placeholder="+49 ...">
        </div>
        <div class="form-field">
          <label>Gew&uuml;nschte Leistung</label>
          <select name="service">
            <option value="">Bitte w&auml;hlen</option>
            <option value="Hautkrebsvorsorge">Hautkrebsvorsorge / Hautkrebsscreening</option>
            <option value="Aknebehandlung">Aknebehandlung</option>
            <option value="Allergietest">Allergietest / Prick-Test</option>
            <option value="Aesthetische Dermatologie">Aesthetische Dermatologie</option>
            <option value="Laserbehandlung">Laserbehandlung</option>
            <option value="Botox">Botox / Hyaluron</option>
            <option value="Microneedling">Microneedling</option>
            <option value="Chemical Peeling">Chemical Peeling</option>
            <option value="Photodynamische Therapie">Photodynamische Therapie</option>
            <option value="Beratung">Erstberatung</option>
            <option value="Sonstiges">Sonstiges</option>
          </select>
        </div>
      </div>

      <div class="form-row full">
        <div class="form-field">
          <label>Nachricht*</label>
          <textarea name="message" required placeholder="Beschreiben Sie Ihr Anliegen oder Ihren Wunschtermin ..."></textarea>
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

<!-- ====== CTA ====== -->
<section class="cta-section">
  <div class="container">
    <span class="eyebrow">${esc(c.ctaSectionTitle || 'Ihre Hautgesundheit')}</span>
    <h2 class="display">${c.ctaSectionSubtitle ? esc(c.ctaSectionSubtitle) : 'Jetzt Termin <em>vereinbaren</em>.'}</h2>
    <p>Von Hautkrebsscreening &uuml;ber Dermatoskopie bis Microneedling und Chemical Peeling &mdash; Ihre Haut verdient das Beste.</p>
    ${ctaFeaturesHtml ? `<div class="cta-features">${ctaFeaturesHtml}</div>` : ''}
    <a href="${esc(c.ctaBookingUrl || '#contact')}" class="btn-cta">
      ${esc(c.ctaText)}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>
  </div>
</section>

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
<a href="${esc(c.ctaBookingUrl || '#contact')}" class="mobile-cta">${esc(c.ctaText)} &rarr;</a>

<script>
  /* Mobile Menu Toggle */
  (function() {
    var toggle = document.getElementById('menu-toggle');
    var links = document.getElementById('nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', function() {
        links.classList.toggle('open');
        var isOpen = links.classList.contains('open');
        toggle.setAttribute('aria-label', isOpen ? 'Men\\u00fc schlie\\u00dfen' : 'Men\\u00fc \\u00f6ffnen');
        toggle.innerHTML = isOpen
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
      });
      links.querySelectorAll('a').forEach(function(a) {
        a.addEventListener('click', function() {
          links.classList.remove('open');
          toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
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

  /* Scroll Animations */
  (function() {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('section').forEach(function(s) {
      s.style.opacity = '0';
      s.style.transform = 'translateY(24px)';
      s.style.transition = 'opacity 0.6s var(--smooth), transform 0.6s var(--smooth)';
      observer.observe(s);
    });
  })();
</script>

<!-- Cookie Banner -->
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba(c.colors.text, 0.97)};backdrop-filter:blur(12px);color:var(--offwhite);padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:${hexToRgba(c.colors.background, 0.8)}">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--offwhite);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--rose);color:var(--offwhite);border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
