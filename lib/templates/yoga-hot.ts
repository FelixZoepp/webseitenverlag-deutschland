// Yoga Hot Template — Hot-Yoga-Studio
// Intensiv, transformativ, kraftvoll — Heat-Experience
// Burgund + Cream + Schwarz, dramatische Dark-Sections

export interface YogaHotConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Burgund #5a1a2a
    background: string // Cream #faf5ee
    dark: string       // Schwarz #0e0e0e
  }
  phone?: string
  email?: string
  address?: string
  city?: string
  openingHours?: string
  stats: { value: string; label: string }[]
  yogaStyles: {
    name: string
    description: string
    temperature: string
    duration: string
    intensity: string
    icon?: string
    features?: string[]
  }[]
  benefits: {
    title: string
    description: string
    icon?: string
  }[]
  schedule?: {
    day: string
    classes: { time: string; name: string; teacher: string; temp: string; duration: string }[]
  }[]
  pricing: {
    name: string
    price: string
    period: string
    features: string[]
    highlighted?: boolean
    ctaText: string
  }[]
  team: {
    name: string
    role: string
    speciality: string
    imageUrl?: string
    quote?: string
    certifications?: string[]
  }[]
  reviews: { text: string; name: string; detail: string; rating: number }[]
  faqItems?: { question: string; answer: string }[]
  whatToBring?: string[]
  heroImageUrl?: string
  footerText?: string
  imprintUrl?: string
  privacyUrl?: string
  instagramUrl?: string
  locationText?: string
  ctaSectionTitle?: string
  ctaSectionSubtitle?: string
}

function e(str: string | undefined): string {
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

function darken(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  const r = Math.max(0, parseInt(h.substring(0, 2), 16) - amount)
  const g = Math.max(0, parseInt(h.substring(2, 4), 16) - amount)
  const b = Math.max(0, parseInt(h.substring(4, 6), 16) - amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function lighten(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  const r = Math.min(255, parseInt(h.substring(0, 2), 16) + amount)
  const g = Math.min(255, parseInt(h.substring(2, 4), 16) + amount)
  const b = Math.min(255, parseInt(h.substring(4, 6), 16) + amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

function renderStars(count: number): string {
  const starSvg = '<svg viewBox="0 0 24 24"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z"/></svg>'
  return Array(Math.min(Math.max(Math.round(count), 0), 5)).fill(starSvg).join('\n          ')
}

const checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>'

export function renderYogaHotTemplate(config: YogaHotConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primary = c.colors.primary || '#5a1a2a'
  const bg = c.colors.background || '#faf5ee'
  const dark = c.colors.dark || '#0e0e0e'

  const primaryHover = darken(primary, 15)
  const primaryLight = lighten(primary, 80)
  const primarySoft = hexToRgba(primary, 0.1)
  const primaryGlow = hexToRgba(primary, 0.35)
  const textSoft = hexToRgba(dark, 0.65)
  const textDim = hexToRgba(dark, 0.4)
  const borderColor = hexToRgba(dark, 0.1)
  const borderHover = hexToRgba(primary, 0.3)
  const warmCard = darken(bg, 6)
  const warmCard2 = darken(bg, 12)

  const logoInitial = e(c.businessName.charAt(0).toUpperCase())
  const businessNameEsc = e(c.businessName)

  // Intensity dots for schedule
  const tempBadge = (temp: string): string => {
    return `<span class="temp-badge">${e(temp)}</span>`
  }

  // Build yoga styles HTML
  const yogaStylesHtml = c.yogaStyles.length > 0 ? `
<!-- ====== YOGA STYLES ====== -->
<section id="styles" class="yoga-styles">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Unsere Yoga-Stile</span>
      <h2 class="display">Finde deine <em>Heat-Experience</em></h2>
      <p>Von Bikram \u00fcber Hot-Vinyasa bis Inferno Hot Pilates \u2014 jeder Stil, eine neue Transformation.</p>
    </div>
    <div class="styles-grid">
      ${c.yogaStyles.map((s, i) => `<div class="style-card${i === 0 ? ' featured' : ''}">
        <div class="style-header">
          <div class="style-icon">${s.icon || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="5" r="2"/><path d="M4 22l4-10 4 3 4-3 4 10"/></svg>`}</div>
          <div class="style-meta">
            <span class="style-temp">${e(s.temperature)}</span>
            <span class="style-duration">${e(s.duration)}</span>
          </div>
        </div>
        <h3>${e(s.name)}</h3>
        <p>${e(s.description)}</p>
        <div class="style-intensity">
          <span class="intensity-label">Intensit\u00e4t</span>
          <span class="intensity-bar">
            ${Array(5).fill(0).map((_, idx) => {
              const levels: Record<string, number> = { 'leicht': 1, 'moderat': 2, 'mittel': 3, 'intensiv': 4, 'extrem': 5 }
              const num = levels[s.intensity.toLowerCase()] || 3
              return `<span class="bar-seg${idx < num ? ' active' : ''}"></span>`
            }).join('')}
          </span>
          <span class="intensity-text">${e(s.intensity)}</span>
        </div>
        ${s.features && s.features.length > 0 ? `<ul class="style-features">${s.features.map(f => `<li>${checkSvg}${e(f)}</li>`).join('')}</ul>` : ''}
      </div>`).join('\n      ')}
    </div>
  </div>
</section>` : ''

  // Build benefits HTML (dark section)
  const benefitsHtml = c.benefits.length > 0 ? `
<!-- ====== WHY HOT YOGA ====== -->
<section class="benefits-section" aria-label="Warum Hot Yoga">
  <div class="container">
    <div class="section-head section-head-light">
      <span class="eyebrow" style="color:${hexToRgba('#ffffff', 0.5)}">Warum Hot Yoga?</span>
      <h2 class="display" style="color:#fff">Die Kraft der <em>Hitze</em></h2>
      <p style="color:${hexToRgba('#ffffff', 0.65)}">38\u00b0C Raumtemperatur, Infrarotw\u00e4rme, Schwitzraum \u2014 dein K\u00f6rper dankt es dir.</p>
    </div>
    <div class="benefits-grid">
      ${c.benefits.map(b => `<div class="benefit-card">
        <div class="benefit-icon">${b.icon || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v6M12 18v4M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M18 12h4M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"/></svg>`}</div>
        <h3>${e(b.title)}</h3>
        <p>${e(b.description)}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>` : ''

  // Build schedule HTML
  const scheduleHtml = c.schedule && c.schedule.length > 0 ? `
<!-- ====== SCHEDULE ====== -->
<section id="schedule" class="schedule">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Stundenplan</span>
      <h2 class="display">Dein Wochen<em>plan</em></h2>
      <p>Bikram, Hot-Vinyasa, Inferno Hot Pilates und Yin im Warmen \u2014 jeden Tag neue M\u00f6glichkeiten.</p>
    </div>

    <div class="schedule-tabs" id="dayTabs">
      ${c.schedule.map((s, i) => `<button class="day-tab${i === 0 ? ' active' : ''}" data-day="${e(s.day)}">${e(s.day)}</button>`).join('\n      ')}
    </div>

    ${c.schedule.map((s, dayIdx) => `<div class="schedule-list" data-schedule-day="${e(s.day)}" style="${dayIdx > 0 ? 'display:none' : ''}">
      ${s.classes.map(cls => `<div class="class-row">
        <div class="class-time">${e(cls.time)}</div>
        <div class="class-info">
          <h4>${e(cls.name)}</h4>
          <div class="teacher">mit ${e(cls.teacher)}</div>
        </div>
        <div class="class-temp">${tempBadge(cls.temp)}</div>
        <div class="class-dur">${e(cls.duration)}</div>
        <button class="class-book">Platz sichern</button>
      </div>`).join('\n      ')}
    </div>`).join('\n    ')}
  </div>
</section>` : ''

  // Build pricing HTML
  const pricingHtml = c.pricing.length > 0 ? `
<!-- ====== PRICING ====== -->
<section id="pricing" class="pricing">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Preise</span>
      <h2 class="display">Investiere in deine <em>Transformation</em></h2>
      <p>Flexible Optionen f\u00fcr deine Hot-Yoga-Reise. Keine versteckten Kosten.</p>
    </div>
    <div class="pricing-grid">
      ${c.pricing.map(p => `<div class="price-card${p.highlighted ? ' featured' : ''}">
        ${p.highlighted ? '<div class="price-badge">Beliebteste Wahl</div>' : ''}
        <div class="price-name">${e(p.name)}</div>
        <div class="price-amount">
          <span class="num">${e(p.price)}</span><span class="currency">\u20AC</span><span class="period">${e(p.period)}</span>
        </div>
        <ul class="price-features">
          ${p.features.map(f => `<li>${checkSvg}${e(f)}</li>`).join('\n          ')}
        </ul>
        <button class="price-cta">${e(p.ctaText)}</button>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>` : ''

  // Build team HTML
  const teamHtml = c.team.length > 0 ? `
<!-- ====== TEAM ====== -->
<section id="team" class="team">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Unser Team</span>
      <h2 class="display">Deine <em>Guides</em> durch die Hitze</h2>
      <p>Zertifizierte Yogalehrer mit Leidenschaft f\u00fcr Hot Yoga und deine Transformation.</p>
    </div>
    <div class="team-grid">
      ${c.team.map((t, i) => `<div class="team-card">
        <div class="team-img" ${t.imageUrl ? `style="background: url('${e(t.imageUrl)}') center/cover no-repeat;"` : `style="background: linear-gradient(160deg, ${lighten(primary, 60 + i * 10)}, ${lighten(primary, 30 + i * 8)});"`}></div>
        <div class="team-body">
          <div class="team-name">${e(t.name)}</div>
          <div class="team-role">${e(t.role)}</div>
          ${t.quote ? `<p class="team-quote">\u201E${e(t.quote)}\u201C</p>` : ''}
          <div class="team-specs">
            ${t.speciality.split(',').map(s => `<span>${e(s.trim())}</span>`).join('')}
          </div>
          ${t.certifications && t.certifications.length > 0 ? `<div class="team-certs">${t.certifications.map(cert => `<span class="cert-tag">${e(cert)}</span>`).join('')}</div>` : ''}
        </div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>` : ''

  // Build reviews HTML
  const reviewsHtml = c.reviews.length > 0 ? `
<!-- ====== TESTIMONIALS ====== -->
<section class="testimonials">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Erfahrungen</span>
      <h2 class="display">Was unsere <em>Yogis</em> sagen</h2>
      <p>Echte Stimmen aus unserer Hot-Yoga-Community.</p>
    </div>
    <div class="testi-grid">
      ${c.reviews.map(r => `<div class="testi-card">
        <div class="testi-rating">
          ${renderStars(r.rating)}
        </div>
        <p class="testi-quote">\u201E${e(r.text)}\u201C</p>
        <div class="testi-author">
          <div class="testi-avatar">${getInitials(r.name)}</div>
          <div class="testi-info">
            <div class="name">${e(r.name)}</div>
            <div class="meta">${e(r.detail)}</div>
          </div>
        </div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>` : ''

  // Build FAQ / What to bring section
  const faqHtml = (c.faqItems && c.faqItems.length > 0) || (c.whatToBring && c.whatToBring.length > 0) ? `
<!-- ====== FAQ & EINSTEIGER ====== -->
<section id="faq" class="faq-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">F\u00fcr Einsteiger</span>
      <h2 class="display">Dein erster <em>Hot-Yoga</em>-Besuch</h2>
      <p>Alles, was du wissen musst, bevor du in den Schwitzraum kommst.</p>
    </div>
    <div class="faq-grid">
      ${c.whatToBring && c.whatToBring.length > 0 ? `<div class="bring-card">
        <h3>Was mitbringen?</h3>
        <ul class="bring-list">
          ${c.whatToBring.map(item => `<li>${checkSvg}${e(item)}</li>`).join('\n          ')}
        </ul>
        <div class="bring-tip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          <span>Trinke mindestens 1 Liter Wasser vor der Stunde. Komm 15 Min. fr\u00fcher f\u00fcr die Einweisung.</span>
        </div>
      </div>` : ''}
      ${c.faqItems && c.faqItems.length > 0 ? `<div class="faq-list">
        ${c.faqItems.map((faq, i) => `<div class="faq-item">
          <button class="faq-question" aria-expanded="false" data-faq="${i}">
            <span>${e(faq.question)}</span>
            <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="faq-answer" id="faq-answer-${i}" aria-hidden="true">
            <p>${e(faq.answer)}</p>
          </div>
        </div>`).join('\n        ')}
      </div>` : ''}
    </div>
  </div>
</section>` : ''

  // Build location HTML
  const locationHtml = `
<!-- ====== LOCATION ====== -->
<section id="location" class="location">
  <div class="container location-grid">
    <div class="location-info">
      <span class="eyebrow" style="display:block; margin-bottom:16px;">Standort</span>
      <h2 class="display">${c.locationText ? e(c.locationText) : `Besuche unser <em>Studio</em>`}</h2>

      ${c.address ? `<div class="location-detail">
        <div class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div>
          <div class="label">Adresse</div>
          <div class="value">${e(c.address)}</div>
        </div>
      </div>` : ''}

      ${c.openingHours ? `<div class="location-detail">
        <div class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        </div>
        <div>
          <div class="label">\u00D6ffnungszeiten</div>
          <div class="value">${e(c.openingHours)}</div>
        </div>
      </div>` : ''}

      ${c.phone ? `<div class="location-detail">
        <div class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </div>
        <div>
          <div class="label">Telefon</div>
          <div class="value"><strong>${e(c.phone)}</strong></div>
        </div>
      </div>` : ''}

      ${c.email ? `<div class="location-detail">
        <div class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
        </div>
        <div>
          <div class="label">E-Mail</div>
          <div class="value"><strong>${e(c.email)}</strong></div>
        </div>
      </div>` : ''}
    </div>

    <div class="location-map">
      <svg class="map-svg" viewBox="0 0 600 460" preserveAspectRatio="xMidYMid slice">
        <rect class="map-block" x="40"  y="40"  width="120" height="80"  rx="6"/>
        <rect class="map-block" x="190" y="30"  width="80"  height="100" rx="6"/>
        <rect class="map-block" x="300" y="40"  width="140" height="60"  rx="6"/>
        <rect class="map-block" x="470" y="50"  width="100" height="120" rx="6"/>
        <rect class="map-block" x="50"  y="160" width="100" height="100" rx="6"/>
        <rect class="map-block" x="180" y="170" width="100" height="80"  rx="6"/>
        <rect class="map-block" x="320" y="180" width="120" height="100" rx="6"/>
        <rect class="map-block" x="470" y="210" width="100" height="80"  rx="6"/>
        <rect class="map-block" x="40"  y="300" width="130" height="100" rx="6"/>
        <rect class="map-block" x="200" y="290" width="100" height="120" rx="6"/>
        <rect class="map-block" x="330" y="320" width="110" height="90"  rx="6"/>
        <rect class="map-block" x="470" y="330" width="100" height="100" rx="6"/>
        <path class="map-water" d="M 0 270 Q 200 250 400 280 L 600 290 L 600 320 L 0 310 Z"/>
        <line class="map-street-major" x1="0"   y1="145" x2="600" y2="145"/>
        <line class="map-street-major" x1="290" y1="0"   x2="290" y2="460"/>
        <line class="map-street"       x1="0"   y1="280" x2="600" y2="280"/>
        <line class="map-street"       x1="170" y1="0"   x2="170" y2="460"/>
        <line class="map-street"       x1="450" y1="0"   x2="450" y2="460"/>
      </svg>

      <div class="map-pin">
        <div class="map-pin-pulse"></div>
        <div class="map-pin-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      </div>

      <div class="map-overlay">
        <div class="label">${businessNameEsc}</div>
        <div class="name">${c.address ? e(c.address.split('\n')[0]) : ''}</div>
      </div>
    </div>
  </div>
</section>`

  // Schema.org structured data — SportsActivityLocation
  const schemaOrg = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: c.businessName,
    description: c.tagline,
    ...(c.address && { address: { '@type': 'PostalAddress', streetAddress: c.address, ...(c.city && { addressLocality: c.city }) } }),
    ...(c.phone && { telephone: c.phone }),
    ...(c.email && { email: c.email }),
    ...(c.openingHours && { openingHours: c.openingHours }),
    ...(c.heroImageUrl && { image: c.heroImageUrl }),
    priceRange: '\u20AC\u20AC',
    url: typeof globalThis !== 'undefined' ? '' : ''
  })

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${businessNameEsc} | ${e(c.tagline)}</title>
<meta name="description" content="${e(c.tagline)}">
<meta property="og:title" content="${businessNameEsc} | ${e(c.tagline)}">
<meta property="og:description" content="${e(c.heroLead)}">
<meta property="og:type" content="website">
${c.heroImageUrl ? `<meta property="og:image" content="${e(c.heroImageUrl)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${businessNameEsc}">
<meta name="twitter:description" content="${e(c.tagline)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,400..900,30..100&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<script type="application/ld+json">${schemaOrg}</script>
<style>
  /* ========================================
     DESIGN TOKENS
     ======================================== */
  :root {
    --primary:       ${primary};
    --primary-hover: ${primaryHover};
    --primary-light: ${primaryLight};
    --primary-soft:  ${primarySoft};
    --primary-glow:  ${primaryGlow};
    --bg:            ${bg};
    --bg-warm:       ${warmCard};
    --bg-warm-2:     ${warmCard2};
    --dark:          ${dark};
    --text:          ${dark};
    --text-soft:     ${textSoft};
    --text-dim:      ${textDim};
    --border:        ${borderColor};
    --border-hover:  ${borderHover};
    --white:         #ffffff;
    --cream:         ${bg};

    --shadow-soft:  0 4px 24px ${hexToRgba(dark, 0.06)};
    --shadow-card:  0 8px 32px ${hexToRgba(dark, 0.08)};
    --shadow-image: 0 20px 60px ${hexToRgba(dark, 0.12)};

    --spring:   cubic-bezier(0.34, 1.56, 0.64, 1);
    --smooth:   cubic-bezier(0.16, 1, 0.3, 1);
    --ease-out: cubic-bezier(0.22, 1, 0.36, 1);

    --font-display: 'Fraunces', 'Georgia', serif;
    --font-body:    'Inter Tight', system-ui, sans-serif;
    --font-mono:    'JetBrains Mono', monospace;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: var(--font-body);
    color: var(--text);
    background: var(--bg);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; display: block; }

  .display {
    font-family: var(--font-display);
    font-weight: 600;
    letter-spacing: -0.025em;
    line-height: 1.08;
    color: var(--text);
    font-variation-settings: "opsz" 144, "SOFT" 50;
  }
  .display em {
    font-style: italic;
    color: var(--primary);
    font-variation-settings: "opsz" 144, "SOFT" 80;
  }

  .eyebrow {
    color: var(--primary);
    font-family: var(--font-mono);
    font-weight: 500;
    font-size: 12px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .container { max-width: 1280px; margin: 0 auto; padding: 0 32px; position: relative; }
  section { padding: 100px 0; position: relative; }

  .section-head {
    text-align: center;
    max-width: 680px;
    margin: 0 auto 72px;
  }
  .section-head .eyebrow { display: block; margin-bottom: 12px; }
  .section-head h2 { font-size: clamp(32px, 4.5vw, 56px); margin-bottom: 16px; }
  .section-head p { font-size: 17px; color: var(--text-soft); line-height: 1.7; max-width: 560px; margin: 0 auto; }

  /* ========================================
     ANNOUNCEMENT BAR
     ======================================== */
  .announce {
    background: var(--primary);
    color: var(--white);
    text-align: center;
    padding: 10px 16px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.04em;
    position: relative;
    overflow: hidden;
  }
  .announce::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    animation: shimmer 4s infinite;
  }
  @keyframes shimmer { 0%, 100% { left: -100%; } 50% { left: 100%; } }
  .announce strong { font-weight: 700; }
  .announce a { text-decoration: underline; font-weight: 600; }

  /* ========================================
     NAV
     ======================================== */
  nav {
    position: sticky; top: 0; z-index: 50;
    background: ${hexToRgba(bg, 0.92)};
    backdrop-filter: blur(20px) saturate(1.2);
    -webkit-backdrop-filter: blur(20px) saturate(1.2);
    border-bottom: 1px solid var(--border);
  }
  .nav-inner {
    max-width: 1280px; margin: 0 auto; padding: 16px 32px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 32px;
  }
  .logo {
    font-family: var(--font-display);
    font-weight: 700; font-size: 22px;
    letter-spacing: -0.02em;
    display: flex; align-items: center; gap: 10px;
    color: var(--text);
    font-variation-settings: "opsz" 144, "SOFT" 60;
  }
  .logo-mark {
    width: 36px; height: 36px;
    background: var(--primary);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: var(--white);
    font-weight: 800;
    font-family: var(--font-display);
    font-size: 18px;
    font-style: italic;
  }
  .nav-links { display: flex; gap: 28px; font-size: 15px; font-weight: 500; }
  .nav-links a { transition: color 0.2s; color: var(--text-soft); }
  .nav-links a:hover { color: var(--primary); }
  .nav-cta {
    background: var(--primary); color: var(--white);
    padding: 10px 22px; border-radius: 999px;
    font-size: 13px; font-weight: 600;
    font-family: var(--font-body);
    letter-spacing: 0.02em;
    transition: all 0.3s var(--spring);
    box-shadow: 0 4px 16px ${hexToRgba(primary, 0.25)};
  }
  .nav-cta:hover { background: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 6px 20px ${hexToRgba(primary, 0.35)}; }

  /* ========================================
     HERO — DARK DRAMATIC
     ======================================== */
  .hero {
    background: var(--dark);
    padding: 0;
    position: relative;
    overflow: hidden;
    min-height: 90vh;
    display: flex;
    align-items: center;
  }
  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 70% 40%, ${hexToRgba(primary, 0.15)} 0%, transparent 70%);
    pointer-events: none;
    z-index: 1;
  }
  .hero::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 200px;
    background: linear-gradient(to top, var(--dark), transparent);
    pointer-events: none;
    z-index: 1;
  }
  .hero-bg {
    position: absolute; inset: 0;
    ${c.heroImageUrl
      ? `background: url('${e(c.heroImageUrl)}') center/cover no-repeat;`
      : `background: linear-gradient(135deg, ${dark} 0%, ${lighten(dark, 15)} 40%, ${darken(primary, 20)} 100%);`}
    opacity: 0.5;
    z-index: 0;
  }
  .hero-inner {
    position: relative;
    z-index: 2;
    max-width: 1280px;
    margin: 0 auto;
    padding: 120px 32px 100px;
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 64px;
    align-items: center;
  }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${hexToRgba(primary, 0.2)};
    border: 1px solid ${hexToRgba(primary, 0.3)};
    color: ${lighten(primary, 80)};
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
    background: ${lighten(primary, 60)};
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 ${hexToRgba(primary, 0.4)}; }
    50%      { opacity: 0.6; box-shadow: 0 0 0 8px transparent; }
  }
  .hero h1 {
    font-size: clamp(44px, 5.5vw, 88px);
    margin-bottom: 24px;
    line-height: 1.02;
    color: var(--white);
  }
  .hero h1 em {
    color: ${lighten(primary, 60)};
    font-style: italic;
    font-variation-settings: "opsz" 144, "SOFT" 80;
  }
  .hero-lead {
    font-size: 18px; line-height: 1.65;
    color: ${hexToRgba('#ffffff', 0.7)};
    max-width: 520px; margin-bottom: 36px;
  }
  .hero-lead strong { color: var(--white); font-weight: 600; }

  .cta-row { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 48px; }
  .btn {
    padding: 16px 28px;
    border-radius: 999px;
    font-weight: 600; font-size: 15px;
    display: inline-flex; align-items: center; gap: 10px;
    cursor: pointer; border: none;
    transition: all 0.3s var(--spring);
    font-family: var(--font-body);
    letter-spacing: 0.01em;
    position: relative;
    overflow: hidden;
  }
  .btn-primary {
    background: var(--primary); color: var(--white);
    box-shadow: 0 8px 24px ${hexToRgba(primary, 0.3)};
  }
  .btn-primary::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: btnShimmer 3s infinite;
  }
  @keyframes btnShimmer { 0% { left: -100%; } 100% { left: 200%; } }
  .btn-primary:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 12px 32px ${hexToRgba(primary, 0.4)}; }
  .btn-primary > * { position: relative; z-index: 1; }
  .btn-ghost {
    background: transparent; color: var(--white);
    border: 1.5px solid ${hexToRgba('#ffffff', 0.25)};
  }
  .btn-ghost:hover { background: ${hexToRgba('#ffffff', 0.08)}; border-color: ${hexToRgba('#ffffff', 0.4)}; }
  .btn svg { width: 16px; height: 16px; }

  /* Hero Stats */
  .hero-stats {
    display: grid;
    grid-template-columns: repeat(${Math.min(c.stats.length, 4)}, 1fr);
    gap: 24px;
    padding-top: 36px;
    border-top: 1px solid ${hexToRgba('#ffffff', 0.12)};
  }
  .hero-stat .num {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: clamp(28px, 3vw, 44px);
    color: var(--white);
    line-height: 1.1;
    font-variation-settings: "opsz" 144, "SOFT" 30;
  }
  .hero-stat .label {
    font-size: 13px;
    color: ${hexToRgba('#ffffff', 0.5)};
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
    margin-top: 4px;
  }

  /* Hero Right — Heat Visual */
  .hero-visual {
    position: relative;
    aspect-ratio: 4/5;
    border-radius: 24px;
    overflow: hidden;
    ${c.heroImageUrl
      ? `background: url('${e(c.heroImageUrl)}') center/cover no-repeat;`
      : `background: linear-gradient(180deg, transparent 50%, ${hexToRgba(primary, 0.4)}), linear-gradient(135deg, ${lighten(primary, 40)} 0%, ${primary} 60%, ${darken(primary, 30)} 100%);`}
    box-shadow: 0 32px 80px ${hexToRgba(dark, 0.5)};
  }
  .hero-visual::after {
    ${!c.heroImageUrl ? `content: 'IMG: Hot Yoga Session bei 38\\00B0C'; position: absolute; bottom: 24px; left: 24px; font-family: var(--font-mono); font-size: 11px; color: rgba(255,255,255,0.5); letter-spacing: 0.08em;` : ''}
  }

  .heat-badge {
    position: absolute;
    top: 24px; right: 24px;
    background: ${hexToRgba(dark, 0.6)};
    backdrop-filter: blur(12px);
    border: 1px solid ${hexToRgba('#ffffff', 0.15)};
    padding: 12px 16px;
    border-radius: 16px;
    text-align: center;
    z-index: 2;
  }
  .heat-badge .heat-temp {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 32px;
    color: ${lighten(primary, 60)};
    line-height: 1;
    font-variation-settings: "opsz" 144, "SOFT" 30;
  }
  .heat-badge .heat-label {
    font-family: var(--font-mono);
    font-size: 10px;
    color: ${hexToRgba('#ffffff', 0.6)};
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-top: 4px;
  }

  /* ========================================
     YOGA STYLES
     ======================================== */
  .yoga-styles { background: var(--bg); }
  .styles-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
  .style-card {
    background: var(--bg-warm);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px;
    transition: all 0.4s var(--smooth);
    position: relative;
    overflow: hidden;
  }
  .style-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    background: var(--primary);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .style-card:hover { border-color: var(--border-hover); transform: translateY(-4px); box-shadow: var(--shadow-card); }
  .style-card:hover::before { opacity: 1; }
  .style-card.featured { border-color: var(--primary); }
  .style-card.featured::before { opacity: 1; }
  .style-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }
  .style-icon {
    width: 48px; height: 48px;
    background: var(--primary-soft);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    color: var(--primary);
  }
  .style-icon svg { width: 24px; height: 24px; }
  .style-meta {
    display: flex;
    gap: 8px;
  }
  .style-temp {
    background: ${hexToRgba(primary, 0.12)};
    color: var(--primary);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 999px;
    letter-spacing: 0.04em;
  }
  .style-duration {
    background: var(--bg-warm-2);
    color: var(--text-soft);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: 999px;
    letter-spacing: 0.04em;
  }
  .style-card h3 {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 10px;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .style-card > p {
    font-size: 15px;
    color: var(--text-soft);
    line-height: 1.65;
    margin-bottom: 16px;
  }
  .style-intensity {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }
  .intensity-label {
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-dim);
    min-width: 65px;
  }
  .intensity-bar {
    display: flex;
    gap: 4px;
  }
  .bar-seg {
    width: 20px; height: 4px;
    background: var(--border);
    border-radius: 2px;
    transition: background 0.3s;
  }
  .bar-seg.active {
    background: var(--primary);
  }
  .intensity-text {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--primary);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: capitalize;
  }
  .style-features {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }
  .style-features li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--text-soft);
  }
  .style-features li svg { width: 16px; height: 16px; color: var(--primary); flex-shrink: 0; }

  /* ========================================
     BENEFITS — DARK SECTION
     ======================================== */
  .benefits-section {
    background: var(--dark);
    position: relative;
    overflow: hidden;
  }
  .benefits-section::before {
    content: '';
    position: absolute;
    top: -100px; left: 50%;
    transform: translateX(-50%);
    width: 800px; height: 800px;
    border-radius: 50%;
    background: radial-gradient(circle, ${hexToRgba(primary, 0.08)} 0%, transparent 60%);
    pointer-events: none;
  }
  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    position: relative;
    z-index: 1;
  }
  .benefit-card {
    background: ${hexToRgba('#ffffff', 0.04)};
    border: 1px solid ${hexToRgba('#ffffff', 0.08)};
    border-radius: 20px;
    padding: 32px;
    transition: all 0.4s var(--smooth);
  }
  .benefit-card:hover {
    background: ${hexToRgba('#ffffff', 0.07)};
    border-color: ${hexToRgba(primary, 0.3)};
    transform: translateY(-4px);
  }
  .benefit-icon {
    width: 48px; height: 48px;
    background: ${hexToRgba(primary, 0.2)};
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    color: ${lighten(primary, 60)};
    margin-bottom: 20px;
  }
  .benefit-icon svg { width: 24px; height: 24px; }
  .benefit-card h3 {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 600;
    color: var(--white);
    margin-bottom: 10px;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .benefit-card p {
    font-size: 15px;
    color: ${hexToRgba('#ffffff', 0.6)};
    line-height: 1.65;
  }

  /* ========================================
     SCHEDULE
     ======================================== */
  .schedule { background: var(--bg); }
  .schedule-tabs {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin-bottom: 32px;
    background: var(--bg-warm);
    border-radius: 16px;
    padding: 6px;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
  }
  .day-tab {
    flex: 1;
    padding: 12px 20px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: none;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    color: var(--text-soft);
    transition: all 0.3s var(--smooth);
  }
  .day-tab.active {
    background: var(--primary);
    color: var(--white);
    box-shadow: 0 4px 12px ${hexToRgba(primary, 0.25)};
  }
  .day-tab:hover:not(.active) { background: var(--bg-warm-2); }
  .schedule-list {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .class-row {
    display: grid;
    grid-template-columns: 80px 1fr auto auto auto;
    gap: 20px;
    align-items: center;
    padding: 18px 24px;
    background: var(--bg-warm);
    border: 1px solid var(--border);
    border-radius: 14px;
    transition: all 0.3s var(--smooth);
  }
  .class-row:hover { border-color: var(--border-hover); background: var(--white); }
  .class-time {
    font-family: var(--font-mono);
    font-weight: 600;
    font-size: 18px;
    color: var(--text);
  }
  .class-info h4 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 16px;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .class-info .teacher {
    font-size: 13px;
    color: var(--text-soft);
    margin-top: 2px;
  }
  .temp-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    background: ${hexToRgba(primary, 0.1)};
    color: var(--primary);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    border-radius: 999px;
    letter-spacing: 0.04em;
  }
  .class-dur {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-dim);
    letter-spacing: 0.04em;
  }
  .class-book {
    background: var(--primary);
    color: var(--white);
    border: none;
    padding: 8px 16px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    font-family: var(--font-body);
    cursor: pointer;
    transition: all 0.3s var(--spring);
    white-space: nowrap;
  }
  .class-book:hover { background: var(--primary-hover); transform: translateY(-1px); }

  /* ========================================
     PRICING
     ======================================== */
  .pricing { background: var(--bg-warm); }
  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(${Math.min(c.pricing.length, 3)}, 1fr);
    gap: 24px;
    max-width: 960px;
    margin: 0 auto;
  }
  .price-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 36px;
    text-align: center;
    position: relative;
    transition: all 0.4s var(--smooth);
  }
  .price-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-card); }
  .price-card.featured {
    border-color: var(--primary);
    box-shadow: 0 8px 40px ${hexToRgba(primary, 0.15)};
  }
  .price-badge {
    position: absolute;
    top: -12px; left: 50%;
    transform: translateX(-50%);
    background: var(--primary);
    color: var(--white);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 6px 16px;
    border-radius: 999px;
  }
  .price-name {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 16px;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .price-amount {
    margin-bottom: 24px;
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 4px;
  }
  .price-amount .num {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 48px;
    color: var(--text);
    line-height: 1;
    font-variation-settings: "opsz" 144, "SOFT" 30;
  }
  .price-amount .currency {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 24px;
    color: var(--text-soft);
  }
  .price-amount .period {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--text-dim);
    margin-left: 4px;
  }
  .price-features {
    list-style: none;
    text-align: left;
    margin-bottom: 28px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .price-features li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: var(--text-soft);
  }
  .price-features li svg { width: 16px; height: 16px; color: var(--primary); flex-shrink: 0; }
  .price-cta {
    width: 100%;
    padding: 14px 24px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 15px;
    font-family: var(--font-body);
    cursor: pointer;
    transition: all 0.3s var(--spring);
    border: 2px solid var(--primary);
    background: transparent;
    color: var(--primary);
  }
  .price-cta:hover { background: var(--primary); color: var(--white); }
  .price-card.featured .price-cta {
    background: var(--primary);
    color: var(--white);
    border-color: var(--primary);
    box-shadow: 0 4px 16px ${hexToRgba(primary, 0.25)};
  }
  .price-card.featured .price-cta:hover { background: var(--primary-hover); }

  /* ========================================
     TEAM
     ======================================== */
  .team { background: var(--bg); }
  .team-grid {
    display: grid;
    grid-template-columns: repeat(${Math.min(c.team.length, 3)}, 1fr);
    gap: 24px;
  }
  .team-card {
    background: var(--bg-warm);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.4s var(--smooth);
  }
  .team-card:hover { border-color: var(--border-hover); transform: translateY(-4px); box-shadow: var(--shadow-card); }
  .team-img {
    height: 280px;
    background: var(--bg-warm-2);
    position: relative;
  }
  .team-body {
    padding: 24px;
  }
  .team-name {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 600;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .team-role {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--primary);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 4px;
    margin-bottom: 12px;
  }
  .team-quote {
    font-size: 14px;
    color: var(--text-soft);
    line-height: 1.6;
    font-style: italic;
    margin-bottom: 12px;
  }
  .team-specs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }
  .team-specs span {
    font-family: var(--font-mono);
    font-size: 11px;
    padding: 4px 10px;
    background: var(--primary-soft);
    color: var(--primary);
    border-radius: 999px;
    letter-spacing: 0.02em;
  }
  .team-certs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .cert-tag {
    font-family: var(--font-mono);
    font-size: 10px;
    padding: 3px 8px;
    background: var(--bg-warm-2);
    color: var(--text-dim);
    border-radius: 6px;
    letter-spacing: 0.04em;
  }

  /* ========================================
     TESTIMONIALS
     ======================================== */
  .testimonials { background: var(--bg-warm); }
  .testi-grid {
    display: grid;
    grid-template-columns: repeat(${Math.min(c.reviews.length, 3)}, 1fr);
    gap: 24px;
  }
  .testi-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px;
    transition: all 0.4s var(--smooth);
  }
  .testi-card:hover { border-color: var(--border-hover); transform: translateY(-4px); box-shadow: var(--shadow-card); }
  .testi-rating {
    display: flex; gap: 4px; margin-bottom: 16px;
  }
  .testi-rating svg { width: 16px; height: 16px; fill: var(--primary); }
  .testi-quote {
    font-size: 15px;
    color: var(--text-soft);
    line-height: 1.7;
    margin-bottom: 20px;
    font-style: italic;
  }
  .testi-author {
    display: flex; align-items: center; gap: 12px;
  }
  .testi-avatar {
    width: 40px; height: 40px;
    background: var(--primary-soft);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 14px;
    color: var(--primary);
  }
  .testi-info .name { font-weight: 600; font-size: 14px; }
  .testi-info .meta { font-size: 12px; color: var(--text-dim); }

  /* ========================================
     FAQ & EINSTEIGER
     ======================================== */
  .faq-section { background: var(--bg); }
  .faq-grid {
    display: grid;
    grid-template-columns: ${(c.whatToBring && c.whatToBring.length > 0) && (c.faqItems && c.faqItems.length > 0) ? '1fr 1.2fr' : '1fr'};
    gap: 32px;
    max-width: 960px;
    margin: 0 auto;
  }
  .bring-card {
    background: var(--bg-warm);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px;
  }
  .bring-card h3 {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 20px;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .bring-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }
  .bring-list li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    color: var(--text-soft);
  }
  .bring-list li svg { width: 16px; height: 16px; color: var(--primary); flex-shrink: 0; }
  .bring-tip {
    background: ${hexToRgba(primary, 0.06)};
    border: 1px solid ${hexToRgba(primary, 0.12)};
    border-radius: 14px;
    padding: 16px;
    display: flex;
    gap: 12px;
    font-size: 13px;
    color: var(--text-soft);
    line-height: 1.6;
  }
  .bring-tip svg { width: 20px; height: 20px; color: var(--primary); flex-shrink: 0; margin-top: 2px; }

  .faq-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .faq-item {
    background: var(--bg-warm);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    transition: border-color 0.3s;
  }
  .faq-item:hover { border-color: var(--border-hover); }
  .faq-question {
    width: 100%;
    padding: 18px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
    background: none;
    border: none;
    cursor: pointer;
    font-family: var(--font-body);
    text-align: left;
  }
  .faq-chevron {
    width: 20px; height: 20px;
    color: var(--text-dim);
    flex-shrink: 0;
    transition: transform 0.3s var(--smooth);
  }
  .faq-question[aria-expanded="true"] .faq-chevron { transform: rotate(180deg); }
  .faq-answer {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s var(--smooth), padding 0.3s;
  }
  .faq-answer.open {
    max-height: 400px;
  }
  .faq-answer p {
    padding: 0 20px 18px;
    font-size: 14px;
    color: var(--text-soft);
    line-height: 1.7;
  }

  /* ========================================
     LOCATION
     ======================================== */
  .location { background: var(--bg-warm); }
  .location-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: center;
  }
  .location-info .display { font-size: clamp(28px, 3.5vw, 44px); margin-bottom: 32px; }
  .location-info .display em { color: var(--primary); }
  .location-detail {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 20px;
  }
  .location-detail .icon {
    width: 40px; height: 40px;
    background: var(--primary-soft);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    color: var(--primary);
  }
  .location-detail .icon svg { width: 18px; height: 18px; stroke-width: 1.5; }
  .location-detail .label {
    font-family: var(--font-mono);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-dim);
    margin-bottom: 2px;
  }
  .location-detail .value { font-size: 15px; color: var(--text); }

  .location-map {
    position: relative;
    aspect-ratio: 1.3;
    background: var(--white);
    border-radius: 24px;
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .map-svg { width: 100%; height: 100%; }
  .map-block { fill: ${hexToRgba(dark, 0.06)}; }
  .map-water { fill: ${hexToRgba(primary, 0.08)}; }
  .map-street-major { stroke: ${hexToRgba(dark, 0.1)}; stroke-width: 3; }
  .map-street { stroke: ${hexToRgba(dark, 0.06)}; stroke-width: 1.5; }
  .map-pin {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  }
  .map-pin-pulse {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 60px; height: 60px;
    border-radius: 50%;
    background: ${hexToRgba(primary, 0.12)};
    animation: mapPulse 2s infinite;
  }
  @keyframes mapPulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    50% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
  }
  .map-pin-circle {
    position: relative;
    width: 40px; height: 40px;
    background: var(--primary);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: var(--white);
    box-shadow: 0 4px 16px ${hexToRgba(primary, 0.3)};
  }
  .map-pin-circle svg { width: 18px; height: 18px; }
  .map-overlay {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(calc(-50% + 40px), calc(-50% - 50px));
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 10px 14px;
    box-shadow: var(--shadow-soft);
  }
  .map-overlay .label {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 14px;
    color: var(--text);
  }
  .map-overlay .name {
    font-size: 12px;
    color: var(--text-soft);
  }

  /* ========================================
     FINAL CTA — DARK
     ======================================== */
  .final-cta {
    background: var(--dark);
    padding: 100px 0;
  }
  .final-cta-inner {
    background: linear-gradient(135deg, ${darken(primary, 10)}, ${primary}, ${lighten(primary, 20)});
    border-radius: 32px;
    padding: 64px 48px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .final-cta-inner::before {
    content: '';
    position: absolute;
    top: -50%; right: -20%;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .final-cta-inner .display {
    color: var(--white);
    font-size: clamp(32px, 4vw, 52px);
    margin-bottom: 16px;
  }
  .final-cta-inner .display em {
    color: ${hexToRgba('#ffffff', 0.85)};
  }
  .final-cta-inner > p {
    color: ${hexToRgba('#ffffff', 0.75)};
    font-size: 17px;
    max-width: 520px;
    margin: 0 auto 32px;
    line-height: 1.7;
  }

  /* Contact Form */
  .cta-form {
    max-width: 520px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    position: relative;
  }
  .cta-form input, .cta-form textarea {
    flex: 1;
    min-width: 200px;
    padding: 14px 18px;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    outline: none;
    background: rgba(255, 255, 255, 0.12);
    color: var(--white);
    font-size: 0.95rem;
    font-family: var(--font-body);
    transition: border-color 0.2s, background 0.2s;
  }
  .cta-form input:focus, .cta-form textarea:focus {
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.18);
  }
  .cta-form input::placeholder, .cta-form textarea::placeholder { color: rgba(255, 255, 255, 0.5); }
  .cta-form textarea { min-height: 100px; resize: vertical; width: 100%; flex-basis: 100%; }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: var(--dark);
    color: ${hexToRgba(bg, 0.7)};
    padding: 64px 0 32px;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 48px;
    margin-bottom: 48px;
  }
  .footer-brand .logo { color: var(--white); }
  .footer-brand .logo-mark { background: var(--primary); }
  .footer-brand p {
    font-size: 14px;
    line-height: 1.7;
    max-width: 300px;
    margin-top: 16px;
    color: ${hexToRgba(bg, 0.55)};
  }
  .footer-col h4 {
    color: ${hexToRgba(bg, 0.9)};
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 20px;
  }
  .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .footer-col a { font-size: 14px; transition: color 0.2s; color: ${hexToRgba(bg, 0.55)}; }
  .footer-col a:hover { color: var(--primary); }
  .footer-bottom {
    border-top: 1px solid ${hexToRgba(bg, 0.1)};
    padding-top: 24px;
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.05em;
    color: ${hexToRgba(bg, 0.35)};
  }
  .footer-bottom a { color: ${hexToRgba(bg, 0.35)}; }
  .footer-bottom a:hover { color: var(--primary); }

  /* ========================================
     STICKY MOBILE CTA
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 16px; left: 16px; right: 16px;
    background: var(--primary);
    color: var(--white);
    padding: 16px 24px;
    border-radius: 999px;
    z-index: 100;
    font-family: var(--font-body);
    font-size: 15px;
    font-weight: 600;
    text-align: center;
    box-shadow: 0 8px 32px ${hexToRgba(primary, 0.4)};
    transition: background 0.2s;
  }
  .mobile-cta:hover { background: var(--primary-hover); }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .styles-grid { grid-template-columns: 1fr 1fr; }
    .benefits-grid { grid-template-columns: repeat(2, 1fr); }
    .team-grid { grid-template-columns: repeat(2, 1fr); }
    .pricing-grid { grid-template-columns: 1fr; max-width: 440px; margin-left: auto; margin-right: auto; }
    .testi-grid { grid-template-columns: 1fr; max-width: 540px; margin-left: auto; margin-right: auto; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .location-grid { grid-template-columns: 1fr; }
    .faq-grid { grid-template-columns: 1fr; }
    .class-row { grid-template-columns: 80px 1fr auto; gap: 16px; }
    .class-temp, .class-dur { display: none; }
  }
  @media (max-width: 768px) {
    section { padding: 64px 0; }
    .container { padding: 0 20px; }
    .hero { min-height: auto; }
    .hero-inner { grid-template-columns: 1fr; gap: 40px; padding: 80px 20px 64px; }
    .hero h1 { font-size: clamp(36px, 10vw, 52px); }
    .hero-stats { grid-template-columns: 1fr 1fr; }
    .hero-visual { aspect-ratio: 3/4; }
    .styles-grid { grid-template-columns: 1fr; }
    .benefits-grid { grid-template-columns: 1fr; }
    .team-grid { grid-template-columns: 1fr; }
    .nav-links { display: none; }
    .nav-cta { display: none; }
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .footer-bottom { flex-direction: column; gap: 12px; }
    .final-cta-inner { padding: 48px 24px; border-radius: 24px; }
    .final-cta { padding: 64px 0 80px; }
    .mobile-cta { display: block; }
    body { padding-bottom: 80px; }
    .class-row { grid-template-columns: 70px 1fr auto; gap: 12px; padding: 16px 18px; }
    .class-time { font-size: 17px; }
    .class-book { padding: 8px 14px; font-size: 12px; }
    .schedule-tabs { gap: 0; }
    .day-tab { padding: 12px 16px; font-size: 11px; }
    .section-head { margin-bottom: 48px; }
    .section-head h2 { font-size: clamp(28px, 8vw, 40px); }
  }
</style>
</head>
<body>

${c.announceText ? `<!-- ====== ANNOUNCEMENT BAR ====== -->
<div class="announce" role="banner">
  ${e(c.announceText)}
</div>` : ''}

<!-- ====== NAV ====== -->
<nav aria-label="Hauptnavigation">
  <div class="nav-inner">
    <a href="#" class="logo" aria-label="${businessNameEsc} Startseite">
      <span class="logo-mark">${logoInitial}</span>
      ${businessNameEsc}
    </a>
    <div class="nav-links">
      ${c.yogaStyles.length > 0 ? '<a href="#styles">Yoga-Stile</a>' : ''}
      ${c.schedule && c.schedule.length > 0 ? '<a href="#schedule">Stundenplan</a>' : ''}
      ${c.pricing.length > 0 ? '<a href="#pricing">Preise</a>' : ''}
      ${c.team.length > 0 ? '<a href="#team">Team</a>' : ''}
      <a href="#location">Studio</a>
    </div>
    <a href="#cta" class="nav-cta">${e(c.ctaText)}</a>
  </div>
</nav>

<!-- ====== HERO — DARK DRAMATIC ====== -->
<section class="hero" aria-label="Willkommen">
  <div class="hero-bg"></div>
  <div class="hero-inner">
    <div>
      <div class="hero-tag">
        <span class="pulse"></span>
        ${e(c.heroTag)}
      </div>
      <h1 class="display">
        ${e(c.heroHeadline)} <em>${e(c.heroAccent)}</em>
      </h1>
      <p class="hero-lead">
        ${e(c.heroLead)}
      </p>
      <div class="cta-row">
        <a href="#cta" class="btn btn-primary">
          <span>${e(c.ctaText)}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
        ${c.schedule && c.schedule.length > 0 ? '<a href="#schedule" class="btn btn-ghost">Stundenplan ansehen</a>' : ''}
      </div>
      ${c.stats.length > 0 ? `<div class="hero-stats">
        ${c.stats.map(s => `<div class="hero-stat"><div class="num">${e(s.value)}</div><div class="label">${e(s.label)}</div></div>`).join('\n        ')}
      </div>` : ''}
    </div>
    <div class="hero-visual" role="img" aria-label="Hot Yoga Session">
      <div class="heat-badge">
        <div class="heat-temp">38\u00b0C</div>
        <div class="heat-label">Raumtemperatur</div>
      </div>
    </div>
  </div>
</section>

${yogaStylesHtml}

${benefitsHtml}

${scheduleHtml}

${pricingHtml}

${teamHtml}

${reviewsHtml}

${faqHtml}

${locationHtml}

<!-- ====== FINAL CTA ====== -->
<section id="cta" class="final-cta" aria-label="Kontakt">
  <div class="container">
    <div class="final-cta-inner">
      <h2 class="display">${c.ctaSectionTitle ? e(c.ctaSectionTitle) : `Bereit f\u00fcr deine <em>Transformation?</em>`}</h2>
      <p>${c.ctaSectionSubtitle ? e(c.ctaSectionSubtitle) : `Sichere dir jetzt deine kostenlose Probestunde. 38\u00b0C, die dein Leben ver\u00e4ndern.`}</p>
      <form class="cta-form" onsubmit="return false" aria-label="Kontaktformular">
        <input type="text" name="name" placeholder="Dein Name" required aria-label="Name">
        <input type="email" name="email" placeholder="Deine E-Mail" required aria-label="E-Mail">
        <input type="tel" name="phone" placeholder="Telefonnummer (optional)" aria-label="Telefon">
        <textarea name="message" placeholder="Welcher Stil interessiert dich? Bikram, Hot-Vinyasa, Inferno Hot Pilates..." required aria-label="Nachricht"></textarea>
        <div style="position:absolute;left:-9999px"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>
        <button class="btn" type="button" id="cta-submit" style="white-space:nowrap;width:auto;background:var(--white);color:var(--primary)">${e(c.ctaText)} &rarr;</button>
      </form>
    </div>
  </div>
</section>

<!-- ====== FOOTER ====== -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#" class="logo">
          <span class="logo-mark">${logoInitial}</span>
          ${businessNameEsc}
        </a>
        <p>${c.footerText ? e(c.footerText) : e(c.tagline)}</p>
      </div>
      <div class="footer-col">
        <h4>Yoga-Stile</h4>
        <ul>
          ${c.yogaStyles.slice(0, 5).map(s => `<li><a href="#styles">${e(s.name)}</a></li>`).join('\n          ')}
          ${c.schedule && c.schedule.length > 0 ? '<li><a href="#schedule">Stundenplan</a></li>' : ''}
        </ul>
      </div>
      <div class="footer-col">
        <h4>Studio</h4>
        <ul>
          ${c.team.length > 0 ? '<li><a href="#team">Unser Team</a></li>' : ''}
          ${c.pricing.length > 0 ? '<li><a href="#pricing">Preise</a></li>' : ''}
          <li><a href="#location">Standort</a></li>
          ${c.faqItems && c.faqItems.length > 0 ? '<li><a href="#faq">FAQ</a></li>' : ''}
          ${c.instagramUrl ? `<li><a href="${e(c.instagramUrl)}" target="_blank" rel="noopener">Instagram</a></li>` : ''}
        </ul>
      </div>
      <div class="footer-col">
        <h4>Kontakt</h4>
        <ul>
          ${c.phone ? `<li>${e(c.phone)}</li>` : ''}
          ${c.email ? `<li>${e(c.email)}</li>` : ''}
          ${c.address ? `<li>${e(c.address)}</li>` : ''}
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; ${new Date().getFullYear()} ${businessNameEsc}. Alle Rechte vorbehalten.</span>
      <span><a href="${e(c.imprintUrl || '#')}">Impressum</a> &middot; <a href="${e(c.privacyUrl || '#')}">Datenschutz</a></span>
    </div>
  </div>
</footer>

<!-- Sticky Mobile CTA -->
<a href="#cta" class="mobile-cta" aria-label="Jetzt Probestunde buchen">${e(c.ctaText)} &rarr;</a>

<script>
  /* Heat Badge Pulse */
  (function heatPulse() {
    var badge = document.querySelector('.heat-badge');
    if (!badge) return;
    var temps = ['37\u00b0C', '38\u00b0C', '39\u00b0C', '38\u00b0C'];
    var idx = 1;
    setInterval(function() {
      idx = (idx + 1) % temps.length;
      var el = badge.querySelector('.heat-temp');
      if (el) el.textContent = temps[idx];
    }, 4000);
  })();

  /* Schedule Tabs */
  (function scheduleTabs() {
    var tabs = document.querySelectorAll('.day-tab');
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        tabs.forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var day = tab.getAttribute('data-day');
        document.querySelectorAll('.schedule-list[data-schedule-day]').forEach(function(list) {
          list.style.display = list.getAttribute('data-schedule-day') === day ? '' : 'none';
        });
      });
    });
  })();

  /* FAQ Accordion */
  (function faqAccordion() {
    var questions = document.querySelectorAll('.faq-question');
    questions.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = btn.getAttribute('data-faq');
        var answer = document.getElementById('faq-answer-' + idx);
        if (!answer) return;
        var isOpen = btn.getAttribute('aria-expanded') === 'true';
        // Close all
        questions.forEach(function(q) {
          q.setAttribute('aria-expanded', 'false');
          var a = document.getElementById('faq-answer-' + q.getAttribute('data-faq'));
          if (a) { a.classList.remove('open'); a.setAttribute('aria-hidden', 'true'); }
        });
        // Toggle current
        if (!isOpen) {
          btn.setAttribute('aria-expanded', 'true');
          answer.classList.add('open');
          answer.setAttribute('aria-hidden', 'false');
        }
      });
    });
  })();

  /* Smooth reveal on scroll */
  (function scrollReveal() {
    var cards = document.querySelectorAll('.style-card, .benefit-card, .price-card, .team-card, .testi-card, .class-row, .faq-item, .bring-card');
    if (!('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    cards.forEach(function(card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)';
      observer.observe(card);
    });
  })();

  /* Contact form */
  ${siteId ? `(function contactForm() {
    var ctaBtn = document.getElementById('cta-submit');
    if (!ctaBtn) return;
    ctaBtn.addEventListener('click', async function() {
      var form = this.closest('.cta-form');
      if (!form) return;
      var data = {};
      form.querySelectorAll('input,textarea').forEach(function(i) { if (i.name && i.value) data[i.name] = i.value; });
      if (!data.name || !data.email) { alert('Name und E-Mail sind Pflichtfelder.'); return; }
      this.textContent = 'Wird gesendet...';
      this.disabled = true;
      try {
        var r = await fetch('${appUrl}/api/public/forms/${siteId}/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        var d = await r.json();
        if (d.success) {
          form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="font-size:1.6rem;margin-bottom:12px;color:#fff">Vielen Dank!</h3><p style="font-size:1.05rem;color:rgba(255,255,255,0.8)">Wir freuen uns auf deine erste Hot-Yoga-Stunde und melden uns schnellstm\\u00f6glich.</p></div>';
        } else {
          alert(d.error || 'Fehler beim Senden.');
          this.textContent = '${e(c.ctaText)} \\u2192';
          this.disabled = false;
        }
      } catch(err) {
        alert('Verbindungsfehler. Bitte versuche es erneut.');
        this.textContent = '${e(c.ctaText)} \\u2192';
        this.disabled = false;
      }
    });
  })();` : ''}
</script>

<!-- Cookie Banner -->
<div id="cookie-banner" role="dialog" aria-label="Cookie-Hinweis" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba('#ffffff', 0.97)};backdrop-filter:blur(16px);color:var(--text);padding:16px 24px;font-size:.85rem;line-height:1.6;border-top:1px solid ${hexToRgba(dark, 0.08)};box-shadow:0 -4px 24px ${hexToRgba(dark, 0.06)}">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:var(--text-soft)">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen findest du in unserer <a href="${e(c.privacyUrl || '#')}" style="color:var(--text);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--primary);color:#fff;border:none;padding:10px 24px;border-radius:999px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit;box-shadow:0 2px 8px ${hexToRgba(primary, 0.2)}">Verstanden</button>
  </div>
</div>
<script>if(!localStorage.getItem('cookies_accepted')){document.getElementById('cookie-banner').style.display='block'}</script>

${siteId ? `<!-- Tracking -->
<script>
(function(){
  try {
    fetch('${appUrl}/api/public/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteId: '${siteId}',
        event: 'pageview',
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent
      })
    }).catch(function(){});
  } catch(e) {}
})();
</script>` : ''}

</body>
</html>`
}
