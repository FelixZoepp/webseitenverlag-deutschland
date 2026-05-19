export interface ArztHausarztConfig {
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
    primary: string    // Salbeigrün #4a7a5a
    accent: string     // Warm-Sand #e8e0d0
    background: string // Off-White #f8faf6
    text: string       // Dark text
  }
  phone?: string
  email?: string
  address?: string
  insuranceInfo?: {
    title?: string
    subtitle?: string
    types: { name: string; description?: string; icon?: string }[]
  }
  openingHours: { days: string; hours: string }[]
  serviceCategories: {
    name: string
    icon?: string
    items: { name: string; description?: string; tag?: string }[]
  }[]
  team: {
    name: string
    role: string
    title?: string
    qualifications?: string[]
    specialties?: string
    imageUrl?: string
    quote?: string
  }[]
  aboutTitle?: string
  aboutText?: string
  aboutText2?: string
  aboutStats?: { value: string; label: string }[]
  reviews: { text: string; name: string; source: string; rating: number }[]
  faqItems?: { question: string; answer: string }[]
  heroImageUrl?: string
  contactEnabled?: boolean
  imprintUrl?: string
  privacyUrl?: string
  footerText?: string
  footerColumns?: { title: string; links: { label: string; href: string }[] }[]
  locationTitle?: string
  locationSubtitle?: string
  locationDetails?: { icon: string; label: string; value: string }[]
  parkingInfo?: string
  ctaSectionTitle?: string
  ctaSectionSubtitle?: string
  ctaFeatures?: string[]
  servicesSectionTitle?: string
  servicesSectionSubtitle?: string
  teamSectionTitle?: string
  teamSectionSubtitle?: string
  reviewsSectionTitle?: string
  aboutSectionEyebrow?: string
  sprechzeitenTitle?: string
  sprechzeitenSubtitle?: string
  sprechzeitenNote?: string
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

export function renderArztHausarztTemplate(config: ArztHausarztConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primaryDark = darkenHex(c.colors.primary, 0.25)
  const primarySoft = hexToRgba(c.colors.primary, 0.12)
  const accentDark = darkenHex(c.colors.accent, 0.15)
  const accentSoft = hexToRgba(c.colors.accent, 0.25)
  const bgTint = tintHex(c.colors.background, -0.03)
  const bgWarm = tintHex(c.colors.background, -0.06)
  const textSoft = tintHex(c.colors.text, 0.5)
  const borderColor = tintHex(c.colors.background, -0.1)
  const primaryTint = tintHex(c.colors.primary, 0.85)

  const logoInitial = esc(c.businessName.charAt(0))

  // Service category default icons
  const defaultServiceIcons: Record<string, string> = {
    'Allgemeinmedizin': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    'Vorsorge': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>',
    'Impfungen': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 2l4 4M7.5 20.5L2 22l1.5-5.5L17 3l4 4L7.5 20.5z"/></svg>',
    'DMP': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>',
    'Ern\u00e4hrungsberatung': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><path d="M6 1v3M10 1v3M14 1v3"/></svg>',
    'Reisemedizin': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
  }

  // Service grid HTML
  const serviceGridHtml = c.serviceCategories.map((cat, catIdx) => {
    const iconSvg = cat.icon || defaultServiceIcons[cat.name] || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z"/></svg>'
    return `
      <div class="service-card" data-service="${catIdx}">
        <div class="service-card-icon">${iconSvg}</div>
        <h3>${esc(cat.name)}</h3>
        <ul class="service-list">
          ${cat.items.map(item => `
          <li>
            <span class="service-name">${esc(item.name)}</span>
            ${item.tag ? `<span class="service-tag${
              item.tag.toLowerCase() === 'neu' ? ' new' :
              item.tag.toLowerCase() === 'igel' ? ' igel' :
              item.tag.toLowerCase() === 'dmp' ? ' dmp' :
              item.tag.toLowerCase() === 'kasse' ? ' kasse' : ''
            }">${esc(item.tag)}</span>` : ''}
            ${item.description ? `<p class="service-desc">${esc(item.description)}</p>` : ''}
          </li>`).join('')}
        </ul>
      </div>`
  }).join('\n')

  // Insurance info
  const insurance = c.insuranceInfo || {
    title: 'Alle Kassen &amp; Privat',
    subtitle: 'Wir behandeln gesetzlich und privat versicherte Patient:innen gleicherma&szlig;en sorgf&auml;ltig.',
    types: [
      { name: 'Gesetzliche Krankenkassen', description: 'Abrechnung nach EBM \u2014 alle gesetzlichen Kassen' },
      { name: 'Private Krankenversicherung', description: 'Abrechnung nach GO\u00c4 \u2014 alle privaten Versicherungen' },
      { name: 'IGeL-Leistungen', description: 'Individuelle Gesundheitsleistungen auf Selbstzahlerbasis' },
      { name: 'BG-Behandlung', description: 'Arbeitsunf\u00e4lle und Berufskrankheiten (BG/Durchgangsarzt)' },
    ]
  }

  const insuranceHtml = insurance.types.map((t, i) => {
    const icons = [
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M17 12H7"/><circle cx="12" cy="12" r="10"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>',
    ]
    return `
        <div class="insurance-item">
          <div class="insurance-icon">${t.icon || icons[i % icons.length]}</div>
          <div class="insurance-info">
            <h4>${esc(t.name)}</h4>
            ${t.description ? `<p>${esc(t.description)}</p>` : ''}
          </div>
        </div>`
  }).join('\n')

  // Sprechzeiten (opening hours) table
  const sprechzeitenHtml = c.openingHours.map(h => `
        <tr>
          <td class="day-cell">${esc(h.days)}</td>
          <td class="hours-cell">${esc(h.hours)}</td>
        </tr>`).join('')

  // Team HTML
  const teamHtml = c.team.map((member, idx) => {
    const initials = member.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    const defaultGradients = [
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${darkenHex(c.colors.primary, 0.3)} 100%)`,
      `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.3)} 0%, ${c.colors.primary} 100%)`,
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${tintHex(c.colors.accent, 0.1)} 100%)`,
      `linear-gradient(135deg, ${darkenHex(c.colors.primary, 0.1)} 0%, ${tintHex(c.colors.primary, 0.4)} 100%)`,
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
          ${member.title ? `<span class="team-title">${esc(member.title)}</span>` : ''}
          <span class="team-role">${esc(member.role)}</span>
          ${(member.qualifications || []).length > 0 ? `
          <div class="team-quals">
            ${member.qualifications!.map(q => `<span class="qual-badge">${esc(q)}</span>`).join('\n            ')}
          </div>` : ''}
          ${member.specialties ? `<p class="team-specialties">${esc(member.specialties)}</p>` : ''}
          ${member.quote ? `<p class="team-quote">&bdquo;${esc(member.quote)}&ldquo;</p>` : ''}
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
          : d.icon === 'barrier-free' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="16" cy="4" r="1"/><path d="M18 22l-4-8h-4l-1.5 6"/><path d="M12 14l-3-3v-3h5"/></svg>'
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
    { title: 'Praxis', links: [
      { label: 'Leistungen', href: '#leistungen' },
      { label: 'Team', href: '#team' },
      { label: 'Sprechzeiten', href: '#sprechzeiten' },
    ]},
    { title: 'Patient:innen', links: [
      { label: 'Termin buchen', href: '#contact' },
      { label: 'Anfahrt', href: '#standort' },
      { label: 'H\u00e4ufige Fragen', href: '#faq' },
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
  "medicalSpecialty": "GeneralPractice",
  ${c.address ? `"address": { "@type": "PostalAddress", "streetAddress": "${esc(c.address)}" },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  "priceRange": "$$",
  "currenciesAccepted": "EUR",
  "paymentAccepted": "Gesetzliche Krankenkassen, Private Krankenversicherung, Selbstzahler",
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
    --sage:          ${esc(c.colors.primary)};
    --sage-dark:     ${primaryDark};
    --sage-soft:     ${primarySoft};
    --sage-tint:     ${primaryTint};
    --sand:          ${esc(c.colors.accent)};
    --sand-dark:     ${accentDark};
    --sand-soft:     ${accentSoft};
    --offwhite:      ${esc(c.colors.background)};
    --offwhite-tint: ${bgTint};
    --offwhite-warm: ${bgWarm};
    --ink:           ${esc(c.colors.text)};
    --ink-soft:      ${textSoft};
    --border:        ${borderColor};

    --shadow-card: 0 12px 32px ${hexToRgba(c.colors.text, 0.07)};
    --shadow-image: 0 20px 60px ${hexToRgba(c.colors.text, 0.14)};

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
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; display: block; }

  .display {
    font-family: var(--font-display);
    font-weight: 500;
    letter-spacing: -0.025em;
    line-height: 1.08;
    font-variation-settings: "opsz" 144, "SOFT" 30;
  }
  .display em {
    font-style: italic;
    color: var(--sage);
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }

  .eyebrow {
    color: var(--sage);
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
    background: var(--sage);
    color: var(--offwhite);
    text-align: center;
    padding: 10px 16px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }
  .announce strong { color: var(--sand); }

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
    background: var(--sage);
    color: var(--offwhite);
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 18px;
    border-radius: 12px;
    letter-spacing: 0;
    position: relative;
  }
  .logo-mark::after {
    content: '+';
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 16px;
    height: 16px;
    background: var(--sand);
    color: var(--sage-dark);
    font-size: 11px;
    font-weight: 700;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
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
  .nav-links a:hover { color: var(--sage); }
  .nav-cta {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--sage);
    color: var(--offwhite);
    padding: 10px 22px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 14px;
    transition: transform 0.25s var(--spring), background 0.2s;
    border: none; cursor: pointer;
  }
  .nav-cta:hover { transform: scale(1.04); background: var(--sage-dark); }
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
    position: absolute;
    top: -120px;
    right: -200px;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: ${hexToRgba(c.colors.primary, 0.05)};
    pointer-events: none;
  }
  .hero::after {
    content: '';
    position: absolute;
    bottom: -80px;
    left: -120px;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: ${hexToRgba(c.colors.accent, 0.08)};
    pointer-events: none;
  }
  .hero .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  .hero-content { position: relative; z-index: 2; }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--sage-soft);
    color: var(--sage);
    padding: 6px 16px;
    border-radius: 50px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 24px;
  }
  .hero-tag svg { width: 14px; height: 14px; fill: currentColor; }
  .hero h1 {
    font-size: clamp(2.4rem, 5vw, 3.8rem);
    margin-bottom: 20px;
  }
  .hero-lead {
    font-size: 1.15rem;
    color: var(--ink-soft);
    line-height: 1.7;
    margin-bottom: 32px;
    max-width: 520px;
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
    background: var(--sage);
    color: var(--offwhite);
    padding: 14px 32px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 15px;
    transition: transform 0.25s var(--spring), background 0.2s;
    border: none;
    cursor: pointer;
  }
  .btn-primary:hover { transform: scale(1.04); background: var(--sage-dark); }
  .btn-primary svg { width: 16px; height: 16px; }
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: var(--ink);
    padding: 14px 28px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 15px;
    border: 2px solid var(--border);
    transition: border-color 0.2s, color 0.2s;
    cursor: pointer;
  }
  .btn-secondary:hover { border-color: var(--sage); color: var(--sage); }
  .btn-secondary svg { width: 16px; height: 16px; }
  .hero-visual {
    position: relative;
    z-index: 2;
  }
  .hero-image-wrap {
    border-radius: 24px;
    overflow: hidden;
    box-shadow: var(--shadow-image);
    aspect-ratio: 4/3;
    background: linear-gradient(135deg, ${c.colors.primary} 0%, ${tintHex(c.colors.primary, 0.4)} 100%);
    position: relative;
  }
  .hero-image-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hero-image-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 80px;
    color: ${hexToRgba(c.colors.background, 0.3)};
  }
  .hero-trust {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
    flex-wrap: wrap;
  }
  .hero-trust-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--ink-soft);
    font-weight: 500;
  }
  .hero-trust-item svg {
    width: 18px;
    height: 18px;
    color: var(--sage);
    flex-shrink: 0;
  }

  /* ========================================
     INSURANCE INFO BAR
     ======================================== */
  .insurance-bar {
    background: var(--sand);
    padding: 48px 0;
  }
  .insurance-bar .section-head {
    text-align: center;
    margin-bottom: 36px;
  }
  .insurance-bar .section-head h2 {
    font-size: 1.6rem;
    margin-top: 8px;
  }
  .insurance-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  .insurance-item {
    background: var(--offwhite);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    gap: 16px;
    align-items: flex-start;
    transition: transform 0.3s var(--smooth), box-shadow 0.3s;
  }
  .insurance-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-card);
  }
  .insurance-icon {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    color: var(--sage);
  }
  .insurance-icon svg { width: 100%; height: 100%; }
  .insurance-info h4 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 4px;
    letter-spacing: -0.01em;
  }
  .insurance-info p {
    font-size: 0.85rem;
    color: var(--ink-soft);
    line-height: 1.5;
  }

  /* ========================================
     SPRECHZEITEN TABLE
     ======================================== */
  .sprechzeiten-section {
    background: var(--offwhite);
    padding: 96px 0;
  }
  .sprechzeiten-section .section-head {
    text-align: center;
    margin-bottom: 48px;
  }
  .sprechzeiten-section .section-head h2 {
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    margin-top: 10px;
  }
  .sprechzeiten-wrap {
    max-width: 700px;
    margin: 0 auto;
    background: var(--offwhite);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: var(--shadow-card);
  }
  .sprechzeiten-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
  }
  .sprechzeiten-table tr {
    border-bottom: 1px solid var(--border);
  }
  .sprechzeiten-table tr:last-child {
    border-bottom: none;
  }
  .sprechzeiten-table td {
    padding: 18px 28px;
  }
  .day-cell {
    font-weight: 600;
    font-family: var(--font-body);
    color: var(--ink);
    width: 45%;
  }
  .hours-cell {
    color: var(--ink-soft);
    font-family: var(--font-mono);
    font-size: 0.88rem;
  }
  .sprechzeiten-table tr:nth-child(even) {
    background: ${hexToRgba(c.colors.primary, 0.03)};
  }
  .sprechzeiten-note {
    text-align: center;
    margin-top: 20px;
    font-size: 0.88rem;
    color: var(--ink-soft);
    font-style: italic;
  }
  .sprechzeiten-note strong { color: var(--sage); font-style: normal; }
  .emergency-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: ${hexToRgba(c.colors.primary, 0.08)};
    color: var(--sage);
    padding: 10px 20px;
    border-radius: 50px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    margin-top: 16px;
  }
  .emergency-badge svg { width: 16px; height: 16px; }

  /* ========================================
     LEISTUNGEN / SERVICES GRID
     ======================================== */
  .services-section {
    background: var(--offwhite-tint);
    padding: 96px 0;
  }
  .services-section .section-head {
    text-align: center;
    margin-bottom: 56px;
  }
  .services-section .section-head h2 {
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    margin-top: 10px;
  }
  .services-section .section-head p {
    color: var(--ink-soft);
    font-size: 1.05rem;
    margin-top: 12px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
  .services-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .service-card {
    background: var(--offwhite);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px 28px;
    transition: transform 0.3s var(--smooth), box-shadow 0.3s;
  }
  .service-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
  }
  .service-card-icon {
    width: 48px;
    height: 48px;
    background: var(--sage-soft);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    color: var(--sage);
  }
  .service-card-icon svg { width: 24px; height: 24px; }
  .service-card h3 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.2rem;
    margin-bottom: 16px;
    letter-spacing: -0.01em;
  }
  .service-list {
    list-style: none;
  }
  .service-list li {
    padding: 10px 0;
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .service-list li:first-child { border-top: none; }
  .service-name {
    font-weight: 500;
    font-size: 0.92rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .service-desc {
    font-size: 0.82rem;
    color: var(--ink-soft);
    line-height: 1.5;
  }
  .service-tag {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 50px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-family: var(--font-mono);
    background: var(--sage-soft);
    color: var(--sage);
  }
  .service-tag.igel { background: ${hexToRgba(c.colors.accent, 0.5)}; color: ${darkenHex(c.colors.accent, 0.6)}; }
  .service-tag.dmp { background: ${hexToRgba(c.colors.primary, 0.15)}; color: var(--sage-dark); }
  .service-tag.new { background: #e8f5e9; color: #2e7d32; }
  .service-tag.kasse { background: #e3f2fd; color: #1565c0; }

  /* ========================================
     TEAM
     ======================================== */
  .team-section {
    background: var(--offwhite);
    padding: 96px 0;
  }
  .team-section .section-head {
    text-align: center;
    margin-bottom: 56px;
  }
  .team-section .section-head h2 {
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    margin-top: 10px;
  }
  .team-section .section-head p {
    color: var(--ink-soft);
    font-size: 1.05rem;
    margin-top: 12px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 28px;
  }
  .team-card {
    background: var(--offwhite);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    transition: transform 0.3s var(--smooth), box-shadow 0.3s;
  }
  .team-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
  }
  .team-photo {
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .team-initials {
    font-family: var(--font-display);
    font-size: 3rem;
    font-weight: 700;
    color: ${hexToRgba(c.colors.background, 0.5)};
  }
  .team-info {
    padding: 24px;
  }
  .team-info h4 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.15rem;
    letter-spacing: -0.01em;
    margin-bottom: 2px;
  }
  .team-title {
    display: block;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--sage);
    margin-bottom: 4px;
  }
  .team-role {
    display: block;
    font-size: 0.88rem;
    color: var(--ink-soft);
    margin-bottom: 12px;
  }
  .team-quals {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }
  .qual-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 50px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    background: var(--sage-soft);
    color: var(--sage);
    font-family: var(--font-mono);
  }
  .team-specialties {
    font-size: 0.85rem;
    color: var(--ink-soft);
    line-height: 1.5;
    margin-bottom: 8px;
  }
  .team-quote {
    font-family: var(--font-display);
    font-size: 0.92rem;
    font-style: italic;
    color: var(--sage);
    line-height: 1.5;
    font-variation-settings: "opsz" 14, "SOFT" 80;
  }

  /* ========================================
     ABOUT / UEBER DIE PRAXIS
     ======================================== */
  .about-section {
    background: var(--sage);
    color: var(--offwhite);
    padding: 96px 0;
    position: relative;
    overflow: hidden;
  }
  .about-section::before {
    content: '';
    position: absolute;
    top: -100px;
    right: -200px;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: ${hexToRgba(c.colors.background, 0.05)};
    pointer-events: none;
  }
  .about-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  .about-content .eyebrow {
    color: var(--sand);
  }
  .about-content h2 {
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    margin-top: 10px;
    margin-bottom: 24px;
    color: var(--offwhite);
  }
  .about-content h2 em {
    color: var(--sand);
  }
  .about-content p {
    color: ${hexToRgba(c.colors.background, 0.8)};
    font-size: 1.05rem;
    line-height: 1.7;
    margin-bottom: 16px;
  }
  .about-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 24px;
    margin-top: 36px;
    padding-top: 36px;
    border-top: 1px solid ${hexToRgba(c.colors.background, 0.15)};
  }
  .about-stat .num {
    font-family: var(--font-display);
    font-size: 2.4rem;
    font-weight: 700;
    color: var(--sand);
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 6px;
  }
  .about-stat .label {
    font-size: 0.82rem;
    color: ${hexToRgba(c.colors.background, 0.65)};
    font-weight: 500;
  }
  .about-values {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .about-value-card {
    background: ${hexToRgba(c.colors.background, 0.08)};
    border-radius: 16px;
    padding: 24px;
    backdrop-filter: blur(8px);
  }
  .about-value-card h4 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 8px;
    color: var(--offwhite);
  }
  .about-value-card p {
    font-size: 0.85rem;
    color: ${hexToRgba(c.colors.background, 0.7)};
    line-height: 1.5;
    margin-bottom: 0;
  }

  /* ========================================
     REVIEWS / PATIENTENSTIMMEN
     ======================================== */
  .reviews-section {
    background: var(--offwhite-tint);
    padding: 96px 0;
  }
  .reviews-section .section-head {
    text-align: center;
    margin-bottom: 48px;
  }
  .reviews-section .section-head h2 {
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    margin-top: 10px;
  }
  .reviews-track {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }
  .review-card {
    background: var(--offwhite);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px;
    transition: transform 0.3s var(--smooth), box-shadow 0.3s;
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
    width: 18px;
    height: 18px;
    fill: var(--sage);
  }
  .review-text {
    font-family: var(--font-display);
    font-size: 1.05rem;
    line-height: 1.6;
    margin-bottom: 20px;
    font-variation-settings: "opsz" 14, "SOFT" 60;
    color: var(--ink);
  }
  .review-author {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }
  .review-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--sage-soft);
    color: var(--sage);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 14px;
  }
  .review-name {
    font-weight: 600;
    font-size: 0.88rem;
  }
  .review-meta {
    font-size: 0.78rem;
    color: var(--ink-soft);
  }

  /* ========================================
     LOCATION / STANDORT + PARKEN
     ======================================== */
  .location-section {
    background: var(--offwhite);
    padding: 96px 0;
  }
  .location-section .section-head {
    text-align: center;
    margin-bottom: 48px;
  }
  .location-section .section-head h2 {
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    margin-top: 10px;
  }
  .location-section .section-head p {
    color: var(--ink-soft);
    font-size: 1.05rem;
    margin-top: 12px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
  .location-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: start;
  }
  .location-details {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .location-detail {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    padding: 16px;
    background: var(--offwhite-tint);
    border-radius: 14px;
    border: 1px solid var(--border);
  }
  .location-detail .icon {
    width: 36px;
    height: 36px;
    color: var(--sage);
    flex-shrink: 0;
  }
  .location-detail .icon svg { width: 100%; height: 100%; }
  .location-detail .label {
    font-size: 0.78rem;
    color: var(--ink-soft);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 2px;
  }
  .location-detail .value {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--ink);
  }
  .parking-info {
    background: var(--sand-soft);
    border: 1px solid ${hexToRgba(c.colors.accent, 0.3)};
    border-radius: 14px;
    padding: 20px;
    display: flex;
    gap: 14px;
    align-items: flex-start;
    margin-top: 16px;
  }
  .parking-info .icon {
    width: 32px;
    height: 32px;
    color: var(--sage);
    flex-shrink: 0;
  }
  .parking-info .icon svg { width: 100%; height: 100%; }
  .parking-info p {
    font-size: 0.9rem;
    color: var(--ink-soft);
    line-height: 1.5;
  }
  .parking-info p strong { color: var(--ink); }
  .hours-list {
    background: var(--offwhite-tint);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px;
  }
  .hours-list h3 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.2rem;
    margin-bottom: 16px;
    letter-spacing: -0.01em;
  }
  .hours-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
  }
  .hours-item:last-child { border-bottom: none; }
  .hours-item .label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    font-size: 0.92rem;
  }
  .hours-item .label svg {
    width: 16px;
    height: 16px;
    color: var(--sage);
  }
  .hours-item .value {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--ink-soft);
  }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section {
    background: var(--offwhite-tint);
    padding: 96px 0;
  }
  .faq-section .section-head {
    text-align: center;
    margin-bottom: 48px;
  }
  .faq-section .section-head h2 {
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    margin-top: 10px;
  }
  .faq-grid {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .faq-item {
    background: var(--offwhite);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .faq-item.open { border-color: var(--sage); }
  .faq-q {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: none;
    border: none;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--ink);
    cursor: pointer;
    text-align: left;
    gap: 16px;
  }
  .faq-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--sage-soft);
    color: var(--sage);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    flex-shrink: 0;
    transition: transform 0.3s, background 0.2s;
  }
  .faq-item.open .faq-icon {
    transform: rotate(45deg);
    background: var(--sage);
    color: var(--offwhite);
  }
  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s var(--smooth), padding 0.3s;
    padding: 0 24px;
    font-size: 0.92rem;
    color: var(--ink-soft);
    line-height: 1.7;
  }
  .faq-item.open .faq-a {
    max-height: 400px;
    padding: 0 24px 20px;
  }

  /* ========================================
     CONTACT FORM
     ======================================== */
  .contact-section {
    background: var(--sage);
    color: var(--offwhite);
    padding: 96px 0;
  }
  .contact-section .section-head {
    text-align: center;
    margin-bottom: 48px;
  }
  .contact-section .section-head .eyebrow { color: var(--sand); }
  .contact-section .section-head h2 {
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    margin-top: 10px;
    color: var(--offwhite);
  }
  .contact-section .section-head h2 em { color: var(--sand); }
  .contact-section .section-head p {
    color: ${hexToRgba(c.colors.background, 0.7)};
    font-size: 1.05rem;
    margin-top: 12px;
    max-width: 550px;
    margin-left: auto;
    margin-right: auto;
  }
  .contact-form {
    max-width: 700px;
    margin: 0 auto;
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
    font-size: 0.82rem;
    font-weight: 600;
    margin-bottom: 6px;
    color: ${hexToRgba(c.colors.background, 0.8)};
    letter-spacing: 0.02em;
  }
  .form-field input,
  .form-field select,
  .form-field textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid ${hexToRgba(c.colors.background, 0.2)};
    border-radius: 12px;
    background: ${hexToRgba(c.colors.background, 0.08)};
    color: var(--offwhite);
    font-family: var(--font-body);
    font-size: 0.92rem;
    transition: border-color 0.2s;
  }
  .form-field input::placeholder,
  .form-field textarea::placeholder {
    color: ${hexToRgba(c.colors.background, 0.4)};
  }
  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus {
    outline: none;
    border-color: var(--sand);
  }
  .form-field select {
    appearance: none;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23f8faf6' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;
  }
  .form-field select option { color: #333; background: #fff; }
  .form-field textarea {
    min-height: 120px;
    resize: vertical;
  }
  .form-submit {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--sand);
    color: var(--sage-dark);
    padding: 14px 36px;
    border-radius: 50px;
    font-weight: 700;
    font-size: 0.95rem;
    border: none;
    cursor: pointer;
    transition: transform 0.25s var(--spring), background 0.2s;
    margin-top: 8px;
    font-family: var(--font-body);
  }
  .form-submit:hover { transform: scale(1.04); }
  .form-submit svg { width: 16px; height: 16px; }

  /* ========================================
     CTA
     ======================================== */
  .cta-section {
    background: var(--sand);
    padding: 80px 0;
    text-align: center;
  }
  .cta-section .eyebrow { color: var(--sage); }
  .cta-section h2 {
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    margin-top: 10px;
    margin-bottom: 16px;
    color: var(--ink);
  }
  .cta-section h2 em { color: var(--sage); }
  .cta-section p {
    color: var(--ink-soft);
    font-size: 1.05rem;
    max-width: 550px;
    margin: 0 auto 28px;
  }
  .cta-features {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
    margin-bottom: 28px;
  }
  .cta-feature {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--ink);
  }
  .cta-feature svg {
    width: 16px;
    height: 16px;
    color: var(--sage);
  }
  .btn-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--sage);
    color: var(--offwhite);
    padding: 16px 40px;
    border-radius: 50px;
    font-weight: 700;
    font-size: 1rem;
    transition: transform 0.25s var(--spring), background 0.2s;
    border: none;
    cursor: pointer;
  }
  .btn-cta:hover { transform: scale(1.04); background: var(--sage-dark); }
  .btn-cta svg { width: 18px; height: 18px; }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: var(--ink);
    color: var(--offwhite);
    padding: 64px 0 0;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px;
    padding-bottom: 48px;
    border-bottom: 1px solid ${hexToRgba(c.colors.background, 0.1)};
  }
  .footer-brand .logo {
    color: var(--offwhite);
    margin-bottom: 12px;
  }
  .footer-brand .logo-mark {
    background: var(--sage);
    color: var(--offwhite);
  }
  .footer-brand p {
    color: ${hexToRgba(c.colors.background, 0.5)};
    font-size: 0.88rem;
    line-height: 1.6;
    max-width: 300px;
  }
  .footer-col h4 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 16px;
    color: var(--offwhite);
  }
  .footer-col ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .footer-col ul li a,
  .footer-col ul li {
    font-size: 0.88rem;
    color: ${hexToRgba(c.colors.background, 0.5)};
    transition: color 0.2s;
  }
  .footer-col ul li a:hover { color: var(--sage); }
  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 0;
    font-size: 0.82rem;
    color: ${hexToRgba(c.colors.background, 0.35)};
  }
  .footer-bottom a { transition: color 0.2s; }
  .footer-bottom a:hover { color: var(--sage); }

  /* ========================================
     MOBILE STICKY CTA
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 40;
    background: var(--sage);
    color: var(--offwhite);
    text-align: center;
    padding: 16px;
    font-weight: 700;
    font-size: 0.95rem;
    letter-spacing: 0.02em;
    box-shadow: 0 -4px 20px ${hexToRgba(c.colors.text, 0.15)};
  }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .services-grid { grid-template-columns: repeat(2, 1fr); }
    .insurance-grid { grid-template-columns: repeat(2, 1fr); }
    .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
  }
  @media (max-width: 768px) {
    section { padding: 64px 0; }
    .container { padding: 0 20px; }

    .nav-inner { padding: 14px 20px; }
    .nav-links { display: none; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; background: var(--offwhite); border-bottom: 1px solid var(--border); padding: 20px; gap: 16px; box-shadow: var(--shadow-card); }
    .nav-links.open { display: flex; }
    .nav-cta { display: none; }
    .menu-toggle { display: block; }

    .hero .container { grid-template-columns: 1fr; gap: 40px; }
    .hero h1 { font-size: clamp(2rem, 7vw, 2.8rem); }
    .hero-visual { order: -1; }
    .hero-trust { gap: 16px; }

    .insurance-grid { grid-template-columns: 1fr; }
    .services-grid { grid-template-columns: 1fr; }
    .about-inner { grid-template-columns: 1fr; gap: 40px; }
    .about-values { grid-template-columns: 1fr; }
    .location-grid { grid-template-columns: 1fr; }
    .reviews-track { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
    .form-row { grid-template-columns: 1fr; }

    .mobile-cta { display: block; }
    footer { padding-bottom: 60px; }

    .hero-actions { flex-direction: column; align-items: stretch; }
    .btn-primary, .btn-secondary { justify-content: center; }
  }
  @media (max-width: 480px) {
    .hero { padding: 48px 0 64px; }
    .sprechzeiten-table td { padding: 14px 18px; }
    .team-photo { height: 200px; }
    .about-stat .num { font-size: 2rem; }
  }
</style>
</head>
<body>

${c.announceText ? `<div class="announce">${c.announceText}</div>` : ''}

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
      <li><a href="#sprechzeiten">Sprechzeiten</a></li>
      <li><a href="#ueber-uns">&Uuml;ber uns</a></li>
      <li><a href="#standort">Anfahrt</a></li>
      <li><a href="#faq">FAQ</a></li>
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
    <div class="hero-content">
      <div class="hero-tag">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        ${esc(c.heroTag)}
      </div>
      <h1 class="display">${esc(c.heroHeadline)} <em>${esc(c.heroAccent)}</em></h1>
      <p class="hero-lead">${esc(c.heroLead)}</p>
      <div class="hero-actions">
        <a href="${esc(c.ctaBookingUrl || '#contact')}" class="btn-primary">
          ${esc(c.ctaText)}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
        <a href="#sprechzeiten" class="btn-secondary">
          Sprechzeiten ansehen
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </a>
      </div>
      <div class="hero-trust">
        <div class="hero-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Alle Kassen
        </div>
        <div class="hero-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
          Facharzt f&uuml;r Allgemeinmedizin
        </div>
        <div class="hero-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Online-Terminbuchung
        </div>
      </div>
    </div>
    <div class="hero-visual">
      <div class="hero-image-wrap">
        ${c.heroImageUrl ? `<img src="${esc(c.heroImageUrl)}" alt="${esc(c.businessName)} \u2014 ${esc(c.tagline)}">` : `<div class="hero-image-placeholder">
          <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.5" width="80" height="80"><path d="M40 20v40M20 40h40"/><circle cx="40" cy="40" r="30"/></svg>
        </div>`}
      </div>
    </div>
  </div>
</section>

<!-- ====== INSURANCE INFO BAR ====== -->
<section class="insurance-bar" id="kassen">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${insurance.title || 'Alle Kassen &amp; Privat'}</span>
      <h2 class="display">Ihre Gesundheit in <em>guten H&auml;nden</em>.</h2>
      ${insurance.subtitle ? `<p style="color:var(--ink-soft);font-size:1rem;margin-top:10px;max-width:600px;margin-left:auto;margin-right:auto">${insurance.subtitle}</p>` : ''}
    </div>
    <div class="insurance-grid">
      ${insuranceHtml}
    </div>
  </div>
</section>

<!-- ====== SPRECHZEITEN ====== -->
<section class="sprechzeiten-section" id="sprechzeiten">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.sprechzeitenTitle || 'Sprechzeiten')}</span>
      <h2 class="display">Wann Sie uns <em>erreichen</em>.</h2>
      ${c.sprechzeitenSubtitle ? `<p style="color:var(--ink-soft);font-size:1.05rem;margin-top:12px;max-width:550px;margin-left:auto;margin-right:auto">${esc(c.sprechzeitenSubtitle)}</p>` : ''}
    </div>
    <div class="sprechzeiten-wrap">
      <table class="sprechzeiten-table">
        <tbody>
          ${sprechzeitenHtml}
        </tbody>
      </table>
    </div>
    ${c.sprechzeitenNote ? `<p class="sprechzeiten-note">${c.sprechzeitenNote}</p>` : '<p class="sprechzeiten-note"><strong>Akutsprechstunde:</strong> T&auml;glich ohne Termin \u2014 bitte bringen Sie Ihre Versichertenkarte mit.</p>'}
    <div style="text-align:center;margin-top:20px">
      <span class="emergency-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        Notf&auml;lle: 112 &bull; &Auml;rztlicher Bereitschaftsdienst: 116 117
      </span>
    </div>
  </div>
</section>

<!-- ====== LEISTUNGEN / SERVICES ====== -->
<section class="services-section" id="leistungen">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.servicesSectionTitle || 'Unsere Leistungen')}</span>
      <h2 class="display">Ganzheitliche <em>Diagnostik</em> &amp; Vorsorge.</h2>
      <p>${esc(c.servicesSectionSubtitle || 'Von der Anamnese \u00fcber die Vorsorge bis zur Befunderhebung \u2014 wir begleiten Ihre Gesundheit kompetent und pers\u00f6nlich.')}</p>
    </div>
    <div class="services-grid">
      ${serviceGridHtml}
    </div>
  </div>
</section>

<!-- ====== TEAM ====== -->
<section class="team-section" id="team">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.teamSectionTitle || 'Unser Praxisteam')}</span>
      <h2 class="display">Kompetenz trifft <em>Menschlichkeit</em>.</h2>
      <p>${esc(c.teamSectionSubtitle || '\u00c4rzt:innen, MFA und medizinisches Fachpersonal \u2014 Ihr Wohlbefinden ist unser Anliegen.')}</p>
    </div>
    <div class="team-grid">
      ${teamHtml}
    </div>
  </div>
</section>

<!-- ====== UEBER DIE PRAXIS ====== -->
<section class="about-section" id="ueber-uns">
  <div class="container">
    <div class="about-inner">
      <div class="about-content">
        <span class="eyebrow">${esc(c.aboutSectionEyebrow || '\u00dcber die Praxis')}</span>
        <h2 class="display">${c.aboutTitle ? esc(c.aboutTitle) : 'Medizin mit <em>Herz</em> &amp; Verstand.'}</h2>
        <p>${esc(c.aboutText || 'Seit \u00fcber 20 Jahren versorgen wir Familien in Hamburg-Eppendorf mit hausärztlicher Kompetenz. Unser Anspruch: individuelle Anamnese, gr\u00fcndliche Diagnostik und eine Behandlung, die den ganzen Menschen sieht.')}</p>
        ${c.aboutText2 ? `<p>${esc(c.aboutText2)}</p>` : '<p>Ob Vorsorgeuntersuchung, Impfberatung, DMP-Betreuung oder AU-Bescheinigung \u2014 wir nehmen uns Zeit f\u00fcr Sie und Ihre Familie.</p>'}
        ${aboutStatsHtml}
      </div>
      <div class="about-values">
        <div class="about-value-card">
          <h4>Individuelle Anamnese</h4>
          <p>Wir h&ouml;ren zu und nehmen uns Zeit f&uuml;r Ihre Krankengeschichte und Beschwerden.</p>
        </div>
        <div class="about-value-card">
          <h4>Moderne Diagnostik</h4>
          <p>Aktuelle medizintechnische Ausstattung f&uuml;r pr&auml;zise Befunde und Diagnosen.</p>
        </div>
        <div class="about-value-card">
          <h4>Vorsorge &amp; Pr&auml;vention</h4>
          <p>Fr&uuml;herkennung und Gesundheitsvorsorge nach aktuellen Leitlinien.</p>
        </div>
        <div class="about-value-card">
          <h4>Familienmedizin</h4>
          <p>Vom Kleinkind bis zu den Gro&szlig;eltern \u2014 wir betreuen alle Generationen.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ====== REVIEWS / PATIENTENSTIMMEN ====== -->
<section class="reviews-section" id="bewertungen">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.reviewsSectionTitle || 'Patientenstimmen')}</span>
      <h2 class="display">Was unsere <em>Patient:innen</em> sagen.</h2>
    </div>
    <div class="reviews-track">
      ${reviewsHtml}
    </div>
  </div>
</section>

<!-- ====== STANDORT + PARKEN ====== -->
<section class="location-section" id="standort">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.locationTitle || 'Standort &amp; Anfahrt')}</span>
      <h2 class="display">So finden Sie <em>uns</em>.</h2>
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
        ${c.parkingInfo ? `
        <div class="parking-info">
          <div class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>
          </div>
          <p><strong>Parken:</strong> ${esc(c.parkingInfo)}</p>
        </div>` : ''}
      </div>
      <div class="hours-list">
        <h3>Sprechzeiten</h3>
        ${c.openingHours.map(h => `
        <div class="hours-item">
          <div class="label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            ${esc(h.days)}
          </div>
          <div class="value">${esc(h.hours)}</div>
        </div>`).join('')}
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
      <h2 class="display">Termin <em>anfragen</em>.</h2>
      <p>Schreiben Sie uns oder nutzen Sie die Online-Terminbuchung &mdash; wir freuen uns, Sie in unserer Praxis zu begr&uuml;&szlig;en.</p>
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
          <label>Anliegen</label>
          <select name="service">
            <option value="">Bitte w&auml;hlen</option>
            <option value="Terminanfrage">Terminanfrage</option>
            <option value="Vorsorgeuntersuchung">Vorsorgeuntersuchung</option>
            <option value="Impfberatung">Impfberatung</option>
            <option value="DMP-Betreuung">DMP-Betreuung (Diabetes/KHK/Asthma)</option>
            <option value="Reisemedizin">Reisemedizinische Beratung</option>
            <option value="Ernaehrungsberatung">Ern&auml;hrungsberatung</option>
            <option value="AU-Bescheinigung">AU-Bescheinigung</option>
            <option value="Rezeptanfrage">Rezeptanfrage</option>
            <option value="IGeL-Leistung">IGeL-Leistung</option>
            <option value="Sonstiges">Sonstiges</option>
          </select>
        </div>
      </div>

      <div class="form-row full">
        <div class="form-field">
          <label>Nachricht*</label>
          <textarea name="message" required placeholder="Beschreiben Sie kurz Ihr Anliegen oder Ihren Terminwunsch ..."></textarea>
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
    <span class="eyebrow">${esc(c.ctaSectionTitle || 'Ihre Gesundheit liegt uns am Herzen')}</span>
    <h2 class="display">${c.ctaSectionSubtitle ? esc(c.ctaSectionSubtitle) : 'Jetzt Termin <em>vereinbaren</em>.'}</h2>
    <p>Ob Vorsorge, Diagnostik, Impfberatung oder akute Beschwerden &mdash; wir sind f&uuml;r Sie und Ihre Familie da.</p>
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
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba(c.colors.primary, 0.97)};backdrop-filter:blur(12px);color:var(--offwhite);padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:${hexToRgba(c.colors.background, 0.8)}">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--offwhite);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--sand);color:var(--sage-dark);border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
