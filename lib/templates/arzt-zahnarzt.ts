/* eslint-disable @typescript-eslint/no-unused-vars */
export interface ArztZahnarztConfig {
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
    primary: string    // Helles Blau #2a7ab8
    accent: string     // Mint #6ecac0
    background: string // Weiß #fafcfd
    text: string       // Dark text
  }
  phone?: string
  email?: string
  address?: string
  openingHours: { days: string; hours: string }[]
  services: {
    name: string
    description?: string
    icon?: string
    tag?: string
    features?: string[]
  }[]
  technology: {
    name: string
    description?: string
    icon?: string
    tag?: string
  }[]
  team: {
    name: string
    role: string
    specialties?: string
    imageUrl?: string
    quote?: string
  }[]
  beforeAfterItems?: { label: string; description?: string; imageUrl?: string; beforeUrl?: string; afterUrl?: string }[]
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
  technologySectionTitle?: string
  technologySectionSubtitle?: string
  teamSectionTitle?: string
  teamSectionSubtitle?: string
  beforeAfterSectionTitle?: string
  beforeAfterSectionSubtitle?: string
  reviewsSectionTitle?: string
  sprechzeitenTitle?: string
  sprechzeitenSubtitle?: string
  standortTitle?: string
  standortSubtitle?: string
  kzvHinweis?: string
  schmerzfreiText?: string
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

export function renderArztZahnarztTemplate(config: ArztZahnarztConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primaryDark = darkenHex(c.colors.primary, 0.25)
  const primarySoft = hexToRgba(c.colors.primary, 0.12)
  const accentDark = darkenHex(c.colors.accent, 0.3)
  const accentSoft = hexToRgba(c.colors.accent, 0.15)
  const bgTint = tintHex(c.colors.background, -0.03)
  const bgWarm = tintHex(c.colors.background, -0.06)
  const textSoft = tintHex(c.colors.text, 0.5)
  const borderColor = tintHex(c.colors.background, -0.1)

  const logoInitial = esc(c.businessName.charAt(0))

  // Service icons map
  const serviceIconMap: Record<string, string> = {
    pzr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg>',
    bleaching: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"/><circle cx="12" cy="12" r="4"/></svg>',
    veneers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 12h8M12 8v8"/></svg>',
    implantate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v6m0 8v6M8 8l4-2 4 2v4l-4 2-4-2V8z"/></svg>',
    wurzelbehandlung: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C8 2 5 5 5 9c0 3 2 5.5 4 7l3 5 3-5c2-1.5 4-4 4-7 0-4-3-7-7-7z"/><path d="M12 6v6"/></svg>',
    komposit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    kfo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12h16"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="12" cy="12" r="2"/></svg>',
    default: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>'
  }

  // Services HTML
  const servicesHtml = c.services.map((svc, idx) => {
    const iconKey = svc.icon || 'default'
    const icon = serviceIconMap[iconKey] || serviceIconMap.default
    return `
      <div class="service-card" style="animation-delay:${idx * 80}ms">
        <div class="service-icon">
          ${icon}
        </div>
        <div class="service-info">
          <div class="service-header">
            <h3>${esc(svc.name)}</h3>
            ${svc.tag ? `<span class="service-tag${
              svc.tag.toLowerCase() === 'neu' ? ' new' :
              svc.tag.toLowerCase() === 'beliebt' ? ' popular' :
              svc.tag.toLowerCase() === 'premium' ? ' premium' :
              svc.tag.toLowerCase() === 'schmerzfrei' ? ' painless' : ''
            }">${esc(svc.tag)}</span>` : ''}
          </div>
          ${svc.description ? `<p>${esc(svc.description)}</p>` : ''}
          ${svc.features && svc.features.length > 0 ? `<ul class="service-features">${svc.features.map(f => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>${esc(f)}</li>`).join('')}</ul>` : ''}
        </div>
      </div>`
  }).join('\n')

  // Technology HTML
  const techIconMap: Record<string, string> = {
    cerec: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    dvt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/><ellipse cx="12" cy="12" rx="4" ry="10"/></svg>',
    laser: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12l5-3v6l-5-3zM7 12h10"/><circle cx="19" cy="12" r="2"/><path d="M17 8l2 4-2 4"/></svg>',
    default: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>'
  }

  const technologyHtml = c.technology.map((tech, idx) => {
    const iconKey = tech.icon || 'default'
    const icon = techIconMap[iconKey] || techIconMap.default
    return `
      <div class="tech-card" style="animation-delay:${idx * 100}ms">
        <div class="tech-icon">
          ${icon}
        </div>
        <div class="tech-info">
          <div class="tech-header">
            <h3>${esc(tech.name)}</h3>
            ${tech.tag ? `<span class="tech-tag">${esc(tech.tag)}</span>` : ''}
          </div>
          ${tech.description ? `<p>${esc(tech.description)}</p>` : ''}
        </div>
      </div>`
  }).join('\n')

  // Team HTML
  const teamHtml = c.team.map((member, idx) => {
    const initials = member.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    const defaultGradients = [
      `linear-gradient(135deg, ${c.colors.accent} 0%, ${darkenHex(c.colors.accent, 0.3)} 100%)`,
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${tintHex(c.colors.primary, 0.3)} 100%)`,
      `linear-gradient(135deg, ${tintHex(c.colors.accent, 0.3)} 0%, ${c.colors.accent} 100%)`,
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
          ${member.quote ? `<p class="team-quote">&bdquo;${esc(member.quote)}&ldquo;</p>` : ''}
        </div>
      </div>`
  }).join('\n')

  // Before/After items
  const baItems = c.beforeAfterItems || [
    { label: 'Veneers-Transformation', description: 'Ästhetische Korrektur mit Keramik-Veneers' },
    { label: 'Bleaching-Ergebnis', description: 'Professionelle Zahnaufhellung um 6 Stufen' },
    { label: 'Implantat-Versorgung', description: 'Einzelzahnimplantat mit Cerec-Krone' },
    { label: 'Kompositfüllung', description: 'Minimalinvasive ästhetische Restauration' },
    { label: 'Aligner-Therapie', description: 'Kieferorthopädische Korrektur in 8 Monaten' },
    { label: 'Cerec-Krone', description: 'Same-Day Vollkeramik-Restauration' },
  ]
  const defaultBaGradients = [
    `linear-gradient(135deg, ${c.colors.accent} 0%, ${darkenHex(c.colors.accent, 0.3)} 100%)`,
    `linear-gradient(135deg, ${c.colors.primary} 0%, ${tintHex(c.colors.primary, 0.4)} 100%)`,
    `linear-gradient(135deg, ${tintHex(c.colors.accent, 0.2)} 0%, ${c.colors.accent} 100%)`,
    `linear-gradient(135deg, ${c.colors.accent} 0%, ${c.colors.primary} 100%)`,
    `linear-gradient(135deg, ${textSoft} 0%, ${darkenHex(c.colors.primary, 0.15)} 100%)`,
    `linear-gradient(135deg, ${c.colors.primary} 0%, ${c.colors.accent} 100%)`,
  ]
  const baHtml = baItems.slice(0, 6).map((item, i) => {
    const bg = item.imageUrl
      ? `background-image:url('${esc(item.imageUrl)}');background-size:cover;background-position:center`
      : `background:${defaultBaGradients[i % defaultBaGradients.length]}`
    return `
      <div class="ba-card" style="${bg}">
        <div class="ba-overlay">
          <span class="ba-label">${esc(item.label)}</span>
          ${item.description ? `<span class="ba-desc">${esc(item.description)}</span>` : ''}
          ${item.beforeUrl && item.afterUrl ? `<span class="ba-badge">Vorher / Nachher</span>` : ''}
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
          : d.icon === 'barrier-free' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="4" r="2"/><path d="M12 6v6m-4 4a4 4 0 0 0 8 0M8 12h8"/></svg>'
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
      { label: 'Alle Services', href: '#services' },
      { label: 'Technologie', href: '#technology' },
      { label: 'Vorher/Nachher', href: '#before-after' },
    ]},
    { title: 'Praxis', links: [
      { label: 'Team', href: '#team' },
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

<!-- Schema.org Dentist -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Dentist",
  "name": "${esc(c.businessName)}",
  "description": "${esc(c.tagline)}",
  ${c.address ? `"address": { "@type": "PostalAddress", "streetAddress": "${esc(c.address)}" },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  "priceRange": "$$$",
  "medicalSpecialty": "Dentistry",
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
    --primary:        ${esc(c.colors.primary)};
    --primary-dark:   ${primaryDark};
    --primary-soft:   ${primarySoft};
    --accent:         ${esc(c.colors.accent)};
    --accent-dark:    ${accentDark};
    --accent-soft:    ${accentSoft};
    --bg:             ${esc(c.colors.background)};
    --bg-tint:        ${bgTint};
    --bg-warm:        ${bgWarm};
    --ink:            ${esc(c.colors.text)};
    --ink-soft:       ${textSoft};
    --border:         ${borderColor};

    --shadow-card: 0 12px 32px ${hexToRgba(c.colors.text, 0.07)};
    --shadow-image: 0 20px 60px ${hexToRgba(c.colors.text, 0.14)};
    --shadow-soft: 0 4px 16px ${hexToRgba(c.colors.primary, 0.08)};

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
    background: var(--bg);
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
    color: var(--accent);
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }

  .eyebrow {
    color: var(--accent);
    font-family: var(--font-mono);
    font-weight: 500;
    font-size: 12px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .container { max-width: 1280px; margin: 0 auto; padding: 0 32px; position: relative; }
  section { padding: 96px 0; position: relative; }
  .section-head {
    text-align: center;
    margin-bottom: 64px;
  }
  .section-head .eyebrow { display: block; margin-bottom: 12px; }
  .section-head .display { font-size: clamp(2rem, 3.5vw, 3rem); margin-bottom: 16px; }
  .section-head p {
    color: var(--ink-soft);
    font-size: 1.1rem;
    line-height: 1.7;
    max-width: 600px;
    margin: 0 auto;
  }

  /* ========================================
     ANNOUNCEMENT BAR
     ======================================== */
  .announce {
    background: var(--primary);
    color: var(--bg);
    text-align: center;
    padding: 10px 16px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }
  .announce strong { color: var(--accent); }

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
    width: 40px; height: 40px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    color: #fff;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 18px;
    border-radius: 12px;
    letter-spacing: 0;
  }
  .nav-links {
    display: flex; align-items: center; gap: 24px;
    list-style: none;
  }
  .nav-links a {
    font-size: 14px;
    font-weight: 500;
    color: var(--ink-soft);
    transition: color 0.2s;
    letter-spacing: 0.01em;
  }
  .nav-links a:hover { color: var(--primary); }
  .nav-cta {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--primary);
    color: #fff;
    padding: 10px 22px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 14px;
    transition: transform 0.25s var(--spring), background 0.2s;
    border: none; cursor: pointer;
  }
  .nav-cta:hover { transform: scale(1.04); background: var(--primary-dark); }
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
    padding: 80px 0 100px;
    background: var(--bg);
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute; top: -200px; right: -200px;
    width: 700px; height: 700px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.accent, 0.1)} 0%, transparent 70%);
    pointer-events: none;
  }
  .hero::after {
    content: '';
    position: absolute; bottom: -150px; left: -150px;
    width: 500px; height: 500px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.primary, 0.06)} 0%, transparent 70%);
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
    background: var(--accent-soft);
    color: var(--accent-dark);
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
    font-size: clamp(2.8rem, 5vw, 4.2rem);
    margin-bottom: 24px;
  }
  .hero-lead {
    font-size: 1.15rem;
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
    background: var(--primary);
    color: #fff;
    padding: 14px 32px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 15px;
    transition: transform 0.25s var(--spring), box-shadow 0.3s, background 0.2s;
    box-shadow: 0 4px 20px ${hexToRgba(c.colors.primary, 0.3)};
  }
  .btn-primary:hover {
    transform: scale(1.04) translateY(-1px);
    box-shadow: 0 8px 30px ${hexToRgba(c.colors.primary, 0.4)};
    background: var(--primary-dark);
  }
  .btn-primary svg { width: 16px; height: 16px; }
  .btn-secondary {
    display: inline-flex; align-items: center; gap: 8px;
    color: var(--primary);
    font-weight: 600;
    font-size: 15px;
    padding: 14px 24px;
    border-radius: 50px;
    border: 2px solid var(--border);
    transition: border-color 0.2s, background 0.2s;
  }
  .btn-secondary:hover {
    border-color: var(--primary);
    background: var(--primary-soft);
  }
  .btn-secondary svg { width: 14px; height: 14px; }

  /* Hero image */
  .hero-visual { position: relative; z-index: 1; }
  .hero-image {
    border-radius: 24px;
    overflow: hidden;
    box-shadow: var(--shadow-image);
    aspect-ratio: 4/3;
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    display: flex; align-items: center; justify-content: center;
  }
  .hero-image img { width: 100%; height: 100%; object-fit: cover; }
  .hero-image-placeholder {
    font-family: var(--font-display);
    font-size: 3rem;
    color: rgba(255,255,255,0.6);
    font-weight: 600;
  }
  .hero-trust {
    display: flex; gap: 24px; margin-top: 32px; padding-top: 24px;
    border-top: 1px solid var(--border);
  }
  .hero-trust-item {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px;
    color: var(--ink-soft);
    font-weight: 500;
  }
  .hero-trust-item svg { width: 16px; height: 16px; color: var(--accent); flex-shrink: 0; }

  /* Schmerzfrei badge */
  .schmerzfrei-badge {
    position: absolute;
    top: 20px; right: -10px;
    background: var(--accent);
    color: #fff;
    padding: 8px 20px;
    border-radius: 50px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    box-shadow: 0 4px 16px ${hexToRgba(c.colors.accent, 0.4)};
    z-index: 2;
  }

  /* ========================================
     SERVICES (Leistungen)
     ======================================== */
  .services-section {
    background: var(--bg);
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
    transition: transform 0.3s var(--smooth), box-shadow 0.3s;
  }
  .service-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
  }
  .service-icon {
    flex-shrink: 0;
    width: 52px; height: 52px;
    background: var(--primary-soft);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.3s;
  }
  .service-card:hover .service-icon {
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  }
  .service-icon svg {
    width: 24px; height: 24px;
    color: var(--primary);
    transition: color 0.3s;
  }
  .service-card:hover .service-icon svg {
    color: #fff;
  }
  .service-info { flex: 1; }
  .service-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 8px;
  }
  .service-header h3 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.1rem;
    letter-spacing: -0.01em;
  }
  .service-tag {
    display: inline-block;
    background: var(--bg-tint);
    color: var(--ink-soft);
    padding: 2px 10px;
    border-radius: 50px;
    font-size: 11px;
    font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .service-tag.new { background: var(--accent-soft); color: var(--accent-dark); }
  .service-tag.popular { background: var(--primary-soft); color: var(--primary-dark); }
  .service-tag.premium { background: ${hexToRgba(c.colors.primary, 0.08)}; color: var(--primary); }
  .service-tag.painless { background: var(--accent-soft); color: var(--accent-dark); }
  .service-info p {
    color: var(--ink-soft);
    font-size: 0.92rem;
    line-height: 1.6;
    margin-bottom: 10px;
  }
  .service-features {
    list-style: none; padding: 0; margin: 0;
    display: flex; flex-wrap: wrap; gap: 6px;
  }
  .service-features li {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 0.82rem;
    color: var(--primary);
    font-weight: 500;
    background: var(--primary-soft);
    padding: 3px 10px;
    border-radius: 50px;
  }
  .service-features li svg { width: 12px; height: 12px; }

  /* ========================================
     TECHNOLOGY (Technologie)
     ======================================== */
  .tech-section {
    background: var(--bg-tint);
  }
  .tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }
  .tech-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
    display: flex;
    gap: 20px;
    transition: transform 0.3s var(--smooth), box-shadow 0.3s;
    position: relative;
    overflow: hidden;
  }
  .tech-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .tech-card:hover::before { opacity: 1; }
  .tech-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
  }
  .tech-icon {
    flex-shrink: 0;
    width: 56px; height: 56px;
    background: linear-gradient(135deg, var(--primary-soft) 0%, var(--accent-soft) 100%);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
  }
  .tech-icon svg {
    width: 26px; height: 26px;
    color: var(--primary);
  }
  .tech-info { flex: 1; }
  .tech-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 8px;
  }
  .tech-header h3 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.15rem;
    letter-spacing: -0.01em;
  }
  .tech-tag {
    display: inline-block;
    background: var(--accent-soft);
    color: var(--accent-dark);
    padding: 2px 10px;
    border-radius: 50px;
    font-size: 11px;
    font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .tech-info p {
    color: var(--ink-soft);
    font-size: 0.92rem;
    line-height: 1.6;
  }

  /* ========================================
     TEAM
     ======================================== */
  .team-section {
    background: var(--bg);
  }
  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 28px;
  }
  .team-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    transition: transform 0.3s var(--smooth), box-shadow 0.3s;
  }
  .team-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
  }
  .team-photo {
    width: 100%;
    aspect-ratio: 3/4;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .team-initials {
    font-family: var(--font-display);
    font-size: 2.5rem;
    color: rgba(255,255,255,0.85);
    font-weight: 600;
  }
  .team-info {
    padding: 20px;
  }
  .team-info h4 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 4px;
  }
  .team-role {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--primary);
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .team-specialties {
    margin-top: 8px;
    font-size: 0.88rem;
    color: var(--ink-soft);
    line-height: 1.5;
  }
  .team-quote {
    margin-top: 10px;
    font-style: italic;
    font-size: 0.88rem;
    color: var(--ink-soft);
    line-height: 1.5;
    padding-left: 12px;
    border-left: 2px solid var(--accent);
  }

  /* ========================================
     BEFORE / AFTER
     ======================================== */
  .ba-section {
    background: var(--bg-tint);
  }
  .ba-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .ba-card {
    border-radius: 16px;
    overflow: hidden;
    aspect-ratio: 4/3;
    position: relative;
    cursor: pointer;
    transition: transform 0.3s var(--smooth);
  }
  .ba-card:hover { transform: scale(1.03); }
  .ba-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
    display: flex; flex-direction: column;
    justify-content: flex-end;
    padding: 20px;
    gap: 4px;
  }
  .ba-label {
    color: #fff;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.05rem;
  }
  .ba-desc {
    color: rgba(255,255,255,0.7);
    font-size: 0.82rem;
  }
  .ba-badge {
    display: inline-block;
    background: var(--accent);
    color: #fff;
    padding: 3px 10px;
    border-radius: 50px;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    margin-top: 6px;
    width: fit-content;
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews-section {
    background: var(--bg);
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
    transition: transform 0.3s var(--smooth), box-shadow 0.3s;
  }
  .review-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-soft);
  }
  .review-stars {
    display: flex; gap: 3px; margin-bottom: 16px;
  }
  .review-stars svg {
    width: 16px; height: 16px;
    fill: var(--accent);
    color: var(--accent);
  }
  .review-text {
    font-size: 0.95rem;
    line-height: 1.65;
    color: var(--ink);
    margin-bottom: 20px;
  }
  .review-author {
    display: flex; align-items: center; gap: 12px;
  }
  .review-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono);
  }
  .review-name {
    font-weight: 600;
    font-size: 0.9rem;
  }
  .review-meta {
    font-size: 0.78rem;
    color: var(--ink-soft);
  }

  /* ========================================
     SPRECHZEITEN & STANDORT
     ======================================== */
  .sprechzeiten-section {
    background: var(--bg-tint);
  }
  .sprechzeiten-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: start;
  }
  .hours-list {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
  }
  .hours-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
  }
  .hours-item:last-child { border-bottom: none; }
  .hours-item .label {
    display: flex; align-items: center; gap: 10px;
    font-weight: 500; font-size: 0.92rem;
  }
  .hours-item .label svg { width: 16px; height: 16px; color: var(--accent); }
  .hours-item .value {
    font-family: var(--font-mono);
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--primary);
  }

  .location-info {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
  }
  .location-detail {
    display: flex; gap: 16px; align-items: flex-start;
    padding: 14px 0;
    border-bottom: 1px solid var(--border);
  }
  .location-detail:last-child { border-bottom: none; }
  .location-detail .icon {
    width: 36px; height: 36px;
    background: var(--primary-soft);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .location-detail .icon svg { width: 18px; height: 18px; color: var(--primary); }
  .location-detail .label {
    font-size: 0.78rem;
    color: var(--ink-soft);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-family: var(--font-mono);
  }
  .location-detail .value {
    font-weight: 500;
    font-size: 0.92rem;
    margin-top: 2px;
  }

  /* KZV Hinweis */
  .kzv-hinweis {
    background: var(--accent-soft);
    border: 1px solid ${hexToRgba(c.colors.accent, 0.3)};
    border-radius: 12px;
    padding: 16px 20px;
    font-size: 0.85rem;
    color: var(--ink-soft);
    line-height: 1.6;
    margin-top: 24px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .kzv-hinweis svg { width: 20px; height: 20px; color: var(--accent-dark); flex-shrink: 0; margin-top: 2px; }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section {
    background: var(--bg);
  }
  .faq-grid {
    max-width: 800px;
    margin: 0 auto;
  }
  .faq-item {
    border-bottom: 1px solid var(--border);
  }
  .faq-q {
    width: 100%;
    background: none; border: none; cursor: pointer;
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px 0;
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 600;
    color: var(--ink);
    text-align: left;
    transition: color 0.2s;
  }
  .faq-q:hover { color: var(--primary); }
  .faq-icon {
    font-size: 1.4rem;
    color: var(--accent);
    transition: transform 0.3s var(--smooth);
    flex-shrink: 0; margin-left: 16px;
  }
  .faq-item.open .faq-icon { transform: rotate(45deg); }
  .faq-a {
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.4s var(--smooth), padding 0.3s;
    color: var(--ink-soft);
    font-size: 0.94rem;
    line-height: 1.7;
    padding: 0 0;
  }
  .faq-item.open .faq-a {
    max-height: 500px;
    padding: 0 0 20px;
  }

  /* ========================================
     CONTACT
     ======================================== */
  .contact-section {
    background: var(--primary);
    color: #fff;
    position: relative;
    overflow: hidden;
  }
  .contact-section::before {
    content: '';
    position: absolute;
    top: -100px; right: -100px;
    width: 400px; height: 400px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.accent, 0.15)} 0%, transparent 70%);
    pointer-events: none;
  }
  .contact-section .eyebrow { color: var(--accent); }
  .contact-section .display { color: #fff; }
  .contact-section .display em { color: var(--accent); }
  .contact-section .section-head p { color: ${hexToRgba(c.colors.background, 0.7)}; }
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
    font-size: 0.82rem;
    font-weight: 600;
    margin-bottom: 6px;
    color: ${hexToRgba(c.colors.background, 0.8)};
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .form-field input,
  .form-field select,
  .form-field textarea {
    width: 100%;
    background: ${hexToRgba(c.colors.background, 0.1)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.2)};
    border-radius: 10px;
    padding: 12px 16px;
    font-family: var(--font-body);
    font-size: 0.95rem;
    color: #fff;
    transition: border-color 0.2s, background 0.2s;
  }
  .form-field input::placeholder,
  .form-field textarea::placeholder {
    color: ${hexToRgba(c.colors.background, 0.4)};
  }
  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus {
    outline: none;
    border-color: var(--accent);
    background: ${hexToRgba(c.colors.background, 0.15)};
  }
  .form-field select option { color: var(--ink); background: var(--bg); }
  .form-field textarea { min-height: 120px; resize: vertical; }
  .form-submit {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--accent);
    color: #fff;
    border: none;
    padding: 14px 32px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: transform 0.25s var(--spring), background 0.2s, box-shadow 0.3s;
    box-shadow: 0 4px 20px ${hexToRgba(c.colors.accent, 0.3)};
    margin-top: 8px;
  }
  .form-submit:hover {
    transform: scale(1.04);
    background: var(--accent-dark);
    box-shadow: 0 8px 30px ${hexToRgba(c.colors.accent, 0.4)};
  }

  /* ========================================
     CTA SECTION
     ======================================== */
  .cta-section {
    background: var(--bg-tint);
    text-align: center;
    padding: 80px 0;
  }
  .cta-section .eyebrow { display: block; margin-bottom: 12px; }
  .cta-section .display { font-size: clamp(2rem, 3.5vw, 3rem); margin-bottom: 16px; }
  .cta-section p {
    color: var(--ink-soft);
    font-size: 1.05rem;
    max-width: 560px;
    margin: 0 auto 32px;
    line-height: 1.7;
  }
  .cta-features {
    display: flex; justify-content: center; gap: 24px; flex-wrap: wrap;
    margin-bottom: 32px;
  }
  .cta-feature {
    display: flex; align-items: center; gap: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--ink-soft);
  }
  .cta-feature svg { width: 16px; height: 16px; color: var(--accent); }
  .btn-cta {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--primary);
    color: #fff;
    padding: 16px 36px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 16px;
    transition: transform 0.25s var(--spring), box-shadow 0.3s, background 0.2s;
    box-shadow: 0 4px 24px ${hexToRgba(c.colors.primary, 0.3)};
  }
  .btn-cta:hover {
    transform: scale(1.05) translateY(-2px);
    box-shadow: 0 8px 36px ${hexToRgba(c.colors.primary, 0.4)};
    background: var(--primary-dark);
  }
  .btn-cta svg { width: 16px; height: 16px; }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: var(--primary);
    color: #fff;
    padding: 64px 0 32px;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
  }
  .footer-brand .logo {
    color: #fff;
    margin-bottom: 12px;
  }
  .footer-brand .logo-mark {
    background: rgba(255,255,255,0.15);
    color: var(--accent);
  }
  .footer-brand p {
    color: ${hexToRgba(c.colors.background, 0.6)};
    font-size: 0.9rem;
    line-height: 1.6;
    max-width: 280px;
  }
  .footer-col h4 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 16px;
    color: #fff;
  }
  .footer-col ul { list-style: none; }
  .footer-col ul li { margin-bottom: 8px; }
  .footer-col ul a {
    font-size: 0.88rem;
    color: ${hexToRgba(c.colors.background, 0.6)};
    transition: color 0.2s;
  }
  .footer-col ul a:hover { color: var(--accent); }
  .footer-col ul li:not(:has(a)) {
    font-size: 0.88rem;
    color: ${hexToRgba(c.colors.background, 0.6)};
  }
  .footer-bottom {
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 24px;
    border-top: 1px solid ${hexToRgba(c.colors.background, 0.12)};
    font-size: 0.82rem;
    color: ${hexToRgba(c.colors.background, 0.5)};
  }
  .footer-bottom a {
    color: ${hexToRgba(c.colors.background, 0.5)};
    transition: color 0.2s;
  }
  .footer-bottom a:hover { color: var(--accent); }

  /* ========================================
     MOBILE CTA (sticky)
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed; bottom: 0; left: 0; right: 0;
    z-index: 40;
    background: var(--primary);
    color: #fff;
    text-align: center;
    padding: 16px;
    font-weight: 600;
    font-size: 15px;
    box-shadow: 0 -4px 20px ${hexToRgba(c.colors.text, 0.15)};
  }

  /* ========================================
     ABOUT
     ======================================== */
  .about-section {
    background: var(--bg-tint);
  }
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  .about-content .eyebrow { display: block; margin-bottom: 12px; }
  .about-content .display { font-size: clamp(2rem, 3.5vw, 2.6rem); margin-bottom: 20px; }
  .about-content p {
    color: var(--ink-soft);
    font-size: 1rem;
    line-height: 1.7;
    margin-bottom: 16px;
  }
  .about-stats {
    display: flex; gap: 32px; margin-top: 28px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
  }
  .about-stat .num {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 2rem;
    color: var(--primary);
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 4px;
  }
  .about-stat .label {
    font-size: 0.82rem;
    color: var(--ink-soft);
    font-weight: 500;
  }
  .about-image {
    border-radius: 20px;
    overflow: hidden;
    aspect-ratio: 4/5;
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    box-shadow: var(--shadow-image);
    display: flex; align-items: center; justify-content: center;
  }
  .about-image img { width: 100%; height: 100%; object-fit: cover; }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .hero-grid { grid-template-columns: 1fr; gap: 48px; }
    .hero-visual { order: -1; }
    .hero h1 { font-size: clamp(2.2rem, 5vw, 3rem); }
    .sprechzeiten-grid { grid-template-columns: 1fr; }
    .about-grid { grid-template-columns: 1fr; gap: 40px; }
    .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
    .ba-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 768px) {
    section { padding: 64px 0; }
    .container { padding: 0 20px; }
    .nav-inner { padding: 14px 20px; }
    .nav-links { display: none; }
    .nav-links.open {
      display: flex; flex-direction: column;
      position: absolute; top: 100%; left: 0; right: 0;
      background: var(--bg);
      padding: 24px;
      gap: 16px;
      border-bottom: 1px solid var(--border);
      box-shadow: 0 12px 32px ${hexToRgba(c.colors.text, 0.1)};
    }
    .menu-toggle { display: block; }
    .nav-cta { display: none; }
    .hero { padding: 48px 0 64px; }
    .hero-grid { gap: 32px; }
    .services-grid { grid-template-columns: 1fr; }
    .tech-grid { grid-template-columns: 1fr; }
    .team-grid { grid-template-columns: 1fr; }
    .ba-grid { grid-template-columns: 1fr; }
    .reviews-grid { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
    .mobile-cta { display: block; }
    .hero-trust { flex-direction: column; gap: 12px; }
    .about-stats { flex-wrap: wrap; gap: 20px; }
    .section-head .display { font-size: clamp(1.6rem, 4vw, 2.2rem); }
    .section-head { margin-bottom: 40px; }
    body { padding-bottom: 56px; }
  }

  @media (max-width: 480px) {
    .logo { font-size: 18px; }
    .logo-mark { width: 34px; height: 34px; font-size: 15px; }
    .hero h1 { font-size: 2rem; }
    .hero-lead { font-size: 1rem; }
    .btn-primary { padding: 12px 24px; font-size: 14px; }
    .btn-secondary { padding: 12px 18px; font-size: 14px; }
    .service-card { flex-direction: column; gap: 14px; padding: 20px; }
    .tech-card { flex-direction: column; gap: 14px; padding: 24px; }
    .about-stat .num { font-size: 1.5rem; }
    .cta-section { padding: 56px 0; }
  }
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
      <li><a href="#services">Leistungen</a></li>
      <li><a href="#technology">Technologie</a></li>
      <li><a href="#team">Team</a></li>
      <li><a href="#before-after">Ergebnisse</a></li>
      <li><a href="#reviews">Bewertungen</a></li>
      <li><a href="#sprechzeiten">Sprechzeiten</a></li>
      <li><a href="#contact">Kontakt</a></li>
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
<section class="hero">
  <div class="container">
    <div class="hero-grid">
      <div class="hero-content">
        <div class="hero-tag">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          ${esc(c.heroTag)}
        </div>
        <h1 class="display">${esc(c.heroHeadline)} <em>${esc(c.heroAccent)}</em></h1>
        <p class="hero-lead">${esc(c.heroLead)}</p>
        <div class="hero-actions">
          <a href="${esc(c.ctaBookingUrl || '#contact')}" class="btn-primary">
            ${esc(c.ctaText)}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
          <a href="#services" class="btn-secondary">
            Unsere Leistungen
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </a>
        </div>
        <div class="hero-trust">
          <div class="hero-trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            ${esc(c.schmerzfreiText || 'Schmerzfreie Behandlung')}
          </div>
          <div class="hero-trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>
            Modernste Technologie
          </div>
          <div class="hero-trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Flexible Termine
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="schmerzfrei-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;display:inline;vertical-align:middle;margin-right:4px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Schmerzfrei
        </div>
        <div class="hero-image">
          ${c.heroImageUrl ? `<img src="${esc(c.heroImageUrl)}" alt="${esc(c.businessName)}">` : `<span class="hero-image-placeholder">${logoInitial}</span>`}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ====== SERVICES (Leistungen) ====== -->
<section class="services-section" id="services">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.servicesSectionTitle || 'Unsere Leistungen')}</span>
      <h2 class="display">${c.servicesSectionSubtitle ? esc(c.servicesSectionSubtitle) : 'Zahnmedizin auf <em>h&ouml;chstem Niveau</em>.'}</h2>
      <p>Von der professionellen Zahnreinigung (PZR) bis zur Implantatversorgung &mdash; wir bieten das gesamte Spektrum moderner Zahnheilkunde.</p>
    </div>
    <div class="services-grid">
      ${servicesHtml}
    </div>
  </div>
</section>

<!-- ====== TECHNOLOGY ====== -->
<section class="tech-section" id="technology">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.technologySectionTitle || 'Unsere Technologie')}</span>
      <h2 class="display">${c.technologySectionSubtitle ? esc(c.technologySectionSubtitle) : 'Hightech f&uuml;r Ihre <em>Zahngesundheit</em>.'}</h2>
      <p>Cerec-Sofortversorgung, digitale Volumentomographie (DVT) und Lasertherapie &mdash; f&uuml;r pr&auml;zisere Diagnosen und schonendere Behandlungen.</p>
    </div>
    <div class="tech-grid">
      ${technologyHtml}
    </div>
  </div>
</section>

<!-- ====== TEAM ====== -->
<section class="team-section" id="team">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.teamSectionTitle || 'Unser Team')}</span>
      <h2 class="display">${c.teamSectionSubtitle ? esc(c.teamSectionSubtitle) : 'Kompetenz &amp; <em>Herzlichkeit</em>.'}</h2>
      <p>Erfahrene Zahn&auml;rzte, spezialisierte Prophylaxe-Assistentinnen und ein eingespielte Praxisteam &mdash; f&uuml;r Ihre optimale Versorgung.</p>
    </div>
    <div class="team-grid">
      ${teamHtml}
    </div>
  </div>
</section>

<!-- ====== BEFORE / AFTER ====== -->
<section class="ba-section" id="before-after">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.beforeAfterSectionTitle || 'Vorher / Nachher')}</span>
      <h2 class="display">${c.beforeAfterSectionSubtitle ? esc(c.beforeAfterSectionSubtitle) : 'Ergebnisse, die <em>&uuml;berzeugen</em>.'}</h2>
      <p>Ausgew&auml;hlte Fallbeispiele unserer &auml;sthetischen und restaurativen Zahnmedizin.</p>
    </div>
    <div class="ba-grid">
      ${baHtml}
    </div>
  </div>
</section>

<!-- ====== REVIEWS ====== -->
<section class="reviews-section" id="reviews">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.reviewsSectionTitle || 'Bewertungen')}</span>
      <h2 class="display">Was unsere Patienten <em>sagen</em>.</h2>
      <p>&Uuml;ber ${c.reviews.length > 50 ? c.reviews.length : '100'}+ verifizierte Bewertungen auf Google, Jameda und Doctolib.</p>
    </div>
    <div class="reviews-grid">
      ${reviewsHtml}
    </div>
  </div>
</section>

<!-- ====== SPRECHZEITEN & STANDORT ====== -->
<section class="sprechzeiten-section" id="sprechzeiten">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.sprechzeitenTitle || 'Sprechzeiten & Standort')}</span>
      <h2 class="display">${c.sprechzeitenSubtitle ? esc(c.sprechzeitenSubtitle) : 'Wir sind f&uuml;r Sie <em>da</em>.'}</h2>
    </div>
    <div class="sprechzeiten-grid">
      <div class="hours-list">
        <h3 style="font-family:var(--font-display);font-weight:600;font-size:1.2rem;margin-bottom:16px;letter-spacing:-0.01em">Sprechzeiten</h3>
        ${hoursHtml}
        ${c.kzvHinweis ? `<div class="kzv-hinweis">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          <span>${esc(c.kzvHinweis)}</span>
        </div>` : ''}
      </div>
      <div class="location-info" id="standort">
        <h3 style="font-family:var(--font-display);font-weight:600;font-size:1.2rem;margin-bottom:16px;letter-spacing:-0.01em">${esc(c.standortTitle || 'Standort')}</h3>
        ${c.address ? `
        <div class="location-detail">
          <div class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div>
            <div class="label">Adresse</div>
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
        ${locationDetailsHtml}
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
      <p>Wissenswertes zu Behandlungen, Kosten und Terminvereinbarung.</p>
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
      <p>Schreiben Sie uns oder rufen Sie direkt an &mdash; wir freuen uns auf Ihren Besuch in unserer Praxis.</p>
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
          <label>Gew&uuml;nschter Service</label>
          <select name="service">
            <option value="">Bitte w&auml;hlen</option>
            <option value="PZR">Professionelle Zahnreinigung (PZR)</option>
            <option value="Bleaching">Bleaching</option>
            <option value="Veneers">Veneers</option>
            <option value="Implantate">Implantate</option>
            <option value="Wurzelbehandlung">Wurzelbehandlung (Endodontie)</option>
            <option value="Kompositfuellung">Kompositf&uuml;llung</option>
            <option value="Kieferorthopaedie">Kieferorthop&auml;die</option>
            <option value="Cerec">Cerec-Versorgung</option>
            <option value="Beratung">Beratung</option>
            <option value="Sonstiges">Sonstiges</option>
          </select>
        </div>
      </div>

      <div class="form-row full">
        <div class="form-field">
          <label>Nachricht*</label>
          <textarea name="message" required placeholder="Beschreiben Sie Ihr Anliegen oder w&auml;hlen Sie einen Wunschtermin ..."></textarea>
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

<!-- ====== CTA ====== -->
<section class="cta-section">
  <div class="container">
    <span class="eyebrow">${esc(c.ctaSectionTitle || 'Bereit f\u00fcr Ihr strahlendes L\u00e4cheln?')}</span>
    <h2 class="display">${c.ctaSectionSubtitle ? esc(c.ctaSectionSubtitle) : 'Jetzt Termin <em>vereinbaren</em>.'}</h2>
    <p>Von der Vorsorge bis zur &auml;sthetischen Zahnmedizin &mdash; Ihr L&auml;cheln ist bei uns in besten H&auml;nden.</p>
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
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:#fff;font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:' + '${hexToRgba(c.colors.background, 0.7)}' + ';font-size:1.05rem">Wir melden uns in K\\u00fcrze bei Ihnen zur Terminbest\\u00e4tigung.</p></div>';
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
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba(c.colors.primary, 0.97)};backdrop-filter:blur(12px);color:#fff;padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:${hexToRgba(c.colors.background, 0.8)}">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:#fff;text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--accent);color:#fff;border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
