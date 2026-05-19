/* eslint-disable @typescript-eslint/no-unused-vars */
// Fitness Boutique Template — Boutique-Fitness-Studio
// Warm, inviting design with Off-White + Coral Red accent

export interface FitnessBoutiqueConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Off-White background
    accent: string     // Coral Red accent
    text: string       // Dark text
    warm: string       // Warm neutral (cards, sections)
  }
  phone?: string
  email?: string
  address?: string
  stats: { value: string; label: string }[]
  programs: { icon: string; title: string; description: string; features?: string[] }[]
  pricing: { name: string; price: string; period: string; features: string[]; highlighted?: boolean; ctaText: string }[]
  trainers: { name: string; role: string; speciality: string; imageUrl?: string; quote?: string }[]
  reviews: { text: string; name: string; detail: string; rating: number }[]
  schedule?: { day: string; classes: { time: string; name: string; trainer: string; intensity: string }[] }[]
  openingHours?: string
  locationText?: string
  heroImageUrl?: string
  footerText?: string
  imprintUrl?: string
  privacyUrl?: string
  instagramUrl?: string
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

export function renderFitnessBoutiqueTemplate(config: FitnessBoutiqueConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const bg = c.colors.primary || '#faf8f5'
  const accent = c.colors.accent || '#e85d50'
  const textColor = c.colors.text || '#2a2a2a'
  const warm = c.colors.warm || '#f3efe9'

  const accentHover = darken(accent, 18)
  const accentLight = lighten(accent, 40)
  const accentSoft = hexToRgba(accent, 0.1)
  const accentGlow = hexToRgba(accent, 0.35)
  const textSoft = hexToRgba(textColor, 0.65)
  const textDim = hexToRgba(textColor, 0.4)
  const borderColor = hexToRgba(textColor, 0.1)
  const borderHover = hexToRgba(accent, 0.3)
  const cardBg = warm
  const cardBg2 = darken(warm, 4)

  const logoInitial = e(c.businessName.charAt(0).toUpperCase())
  const businessNameEsc = e(c.businessName)

  const heroVisualStyle = c.heroImageUrl
    ? `background: url('${e(c.heroImageUrl)}') center/cover no-repeat;`
    : `background: linear-gradient(180deg, transparent 50%, ${hexToRgba(textColor, 0.5)}), linear-gradient(135deg, ${lighten(accent, 60)} 0%, ${lighten(accent, 30)} 40%, ${accent} 100%);`

  const heroVisualAfter = c.heroImageUrl
    ? ''
    : `content: 'IMG: Community beim Training'; position: absolute; bottom: 24px; left: 24px; font-family: var(--font-mono); font-size: 11px; color: rgba(255,255,255,0.6); letter-spacing: 0.08em;`

  // Build intensity dots
  const intensityDots = (level: string): string => {
    const levels: Record<string, number> = { 'leicht': 1, 'moderat': 2, 'intensiv': 3 }
    const num = levels[level.toLowerCase()] || 2
    return `<span class="intensity" title="${e(level)}">${Array(3).fill(0).map((_, i) => `<span class="dot${i < num ? ' active' : ''}"></span>`).join('')}</span>`
  }

  // Build schedule HTML
  const scheduleHtml = c.schedule && c.schedule.length > 0 ? `
<!-- ====== SCHEDULE WIDGET ====== -->
<section id="schedule" class="schedule">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Wochenplan</span>
      <h2 class="display">Finde deinen <em>Lieblingskurs</em></h2>
      <p>Barre, HIIT, Mobility und mehr \u2014 jede Woche frisch f\u00fcr dich zusammengestellt.</p>
    </div>

    <div class="schedule-tabs" id="dayTabs">
      ${c.schedule.map((s, i) => `<button class="day-tab${i === 0 ? ' active' : ''}" data-day="${e(s.day)}">${e(s.day)}</button>`).join('\n      ')}
    </div>

    ${c.schedule.map((s, dayIdx) => `<div class="schedule-list" data-schedule-day="${e(s.day)}" style="${dayIdx > 0 ? 'display:none' : ''}">
      ${s.classes.map(cls => `<div class="class-row">
        <div class="class-time">${e(cls.time)}</div>
        <div class="class-info">
          <h4>${e(cls.name)}</h4>
          <div class="trainer">mit ${e(cls.trainer)}</div>
        </div>
        <div class="class-intensity">${intensityDots(cls.intensity)}<span class="intensity-label">${e(cls.intensity)}</span></div>
        <button class="class-book">Platz sichern</button>
      </div>`).join('\n      ')}
    </div>`).join('\n    ')}
  </div>
</section>` : ''

  // Build programs HTML
  const programsHtml = c.programs.length > 0 ? `
<!-- ====== PROGRAMS ====== -->
<section id="programs" class="programs">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Unser Angebot</span>
      <h2 class="display">Kurse, die dich <em>bewegen</em></h2>
      <p>Von Barre \u00fcber Reformer bis Functional Training \u2014 bei uns findest du dein Ding.</p>
    </div>
    <div class="programs-grid">
      ${c.programs.map(p => `<div class="program-card">
        <div class="program-icon">
          ${p.icon}
        </div>
        <h3>${e(p.title)}</h3>
        <p>${e(p.description)}</p>
        ${p.features && p.features.length > 0 ? `<ul class="program-features">${p.features.map(f => `<li>${e(f)}</li>`).join('')}</ul>` : ''}
      </div>`).join('\n      ')}
    </div>
  </div>
</section>` : ''

  // Build pricing HTML
  const pricingHtml = c.pricing.length > 0 ? `
<!-- ====== PRICING ====== -->
<section id="pricing" class="pricing">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Mitgliedschaft</span>
      <h2 class="display">Dein Weg zu <em>mehr Balance</em></h2>
      <p>Flexibel, fair und ohne versteckte Kosten.</p>
    </div>
    <div class="pricing-grid">
      ${c.pricing.map(p => `<div class="price-card${p.highlighted ? ' featured' : ''}">
        ${p.highlighted ? '<div class="price-badge">Empfehlung</div>' : ''}
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

  // Build trainers HTML
  const trainersHtml = c.trainers.length > 0 ? `
<!-- ====== TRAINERS ====== -->
<section id="trainers" class="trainers">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Das Team</span>
      <h2 class="display">Unsere <em>Trainerinnen</em></h2>
      <p>Leidenschaftliche Coaches mit Herz und Expertise.</p>
    </div>
    <div class="trainers-grid">
      ${c.trainers.map((t, i) => `<div class="trainer-card">
        <div class="trainer-img" ${t.imageUrl ? `style="background: url('${e(t.imageUrl)}') center/cover no-repeat;"` : `style="background: linear-gradient(160deg, ${lighten(accent, 50 + i * 12)}, ${lighten(accent, 20 + i * 8)});"`}></div>
        <div class="trainer-body">
          <div class="trainer-name">${e(t.name)}</div>
          <div class="trainer-role">${e(t.role)}</div>
          ${t.quote ? `<p class="trainer-quote">\u201E${e(t.quote)}\u201C</p>` : ''}
          <div class="trainer-specs">
            ${t.speciality.split(',').map(s => `<span>${e(s.trim())}</span>`).join('')}
          </div>
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
      <span class="eyebrow">Community</span>
      <h2 class="display">Stimmen aus <em>unserer Community</em></h2>
      <p>Was unsere Mitglieder \u00fcber Form & Co. sagen.</p>
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

  // Build location HTML
  const locationHtml = `
<!-- ====== LOCATION + MAP ====== -->
<section id="location" class="location">
  <div class="container location-grid">

    <div class="location-info">
      <span class="eyebrow" style="display:block; margin-bottom:16px;">Standort</span>
      <h2 class="display">${c.locationText ? e(c.locationText) : `Besuche uns im <em>Studio</em>`}</h2>

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

  // Schema.org structured data
  const schemaOrg = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'HealthClub',
    name: c.businessName,
    description: c.tagline,
    ...(c.address && { address: { '@type': 'PostalAddress', streetAddress: c.address } }),
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
    --bg:           ${bg};
    --bg-warm:      ${warm};
    --bg-warm-2:    ${cardBg2};
    --accent:       ${accent};
    --accent-hover: ${accentHover};
    --accent-light: ${accentLight};
    --accent-soft:  ${accentSoft};
    --accent-glow:  ${accentGlow};
    --text:         ${textColor};
    --text-soft:    ${textSoft};
    --text-dim:     ${textDim};
    --border:       ${borderColor};
    --border-hover: ${borderHover};
    --white:        #ffffff;
    --danger:       #e85d50;

    --shadow-soft:  0 4px 24px ${hexToRgba(textColor, 0.06)};
    --shadow-card:  0 8px 32px ${hexToRgba(textColor, 0.08)};
    --shadow-image: 0 20px 60px ${hexToRgba(textColor, 0.12)};

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
    color: var(--accent);
    font-variation-settings: "opsz" 144, "SOFT" 80;
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
  section { padding: 100px 0; position: relative; }

  /* ========================================
     ANNOUNCEMENT BAR
     ======================================== */
  .announce {
    background: var(--accent);
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
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
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
    background: var(--accent);
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
  .nav-links a:hover { color: var(--accent); }
  .nav-cta {
    background: var(--accent); color: var(--white);
    padding: 10px 22px; border-radius: 999px;
    font-size: 13px; font-weight: 600;
    font-family: var(--font-body);
    letter-spacing: 0.02em;
    transition: all 0.3s var(--spring);
    box-shadow: 0 4px 16px ${hexToRgba(accent, 0.25)};
  }
  .nav-cta:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: 0 6px 20px ${hexToRgba(accent, 0.35)}; }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    background: var(--bg);
    padding: 60px 0 100px;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -200px; right: -200px;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, ${hexToRgba(accent, 0.06)} 0%, transparent 70%);
    pointer-events: none;
  }
  .hero::after {
    content: '';
    position: absolute;
    bottom: -100px; left: -100px;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, ${hexToRgba(accent, 0.04)} 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-grid {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 64px;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--accent-soft);
    border: 1px solid ${hexToRgba(accent, 0.15)};
    color: var(--accent);
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
    background: var(--accent);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 var(--accent-glow); }
    50%      { opacity: 0.6; box-shadow: 0 0 0 8px transparent; }
  }
  .hero h1 {
    font-size: clamp(44px, 5.5vw, 88px);
    margin-bottom: 24px;
    line-height: 1.02;
  }
  .hero-lead {
    font-size: 18px; line-height: 1.65;
    color: var(--text-soft);
    max-width: 520px; margin-bottom: 36px;
  }
  .hero-lead strong { color: var(--text); font-weight: 600; }

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
    background: var(--accent); color: var(--white);
    box-shadow: 0 8px 24px ${hexToRgba(accent, 0.3)};
  }
  .btn-primary::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: btnShimmer 3s infinite;
  }
  @keyframes btnShimmer { 0% { left: -100%; } 100% { left: 200%; } }
  .btn-primary:hover { background: var(--accent-hover); transform: translateY(-2px); box-shadow: 0 12px 32px ${hexToRgba(accent, 0.4)}; }
  .btn-primary > * { position: relative; z-index: 1; }
  .btn-ghost {
    background: transparent; color: var(--text);
    border: 1.5px solid var(--border);
  }
  .btn-ghost:hover { background: var(--bg-warm); border-color: ${hexToRgba(textColor, 0.2)}; }
  .btn svg { width: 16px; height: 16px; }

  /* Hero-Stats */
  .hero-stats {
    display: grid;
    grid-template-columns: repeat(${Math.min(c.stats.length, 4)}, 1fr);
    gap: 24px;
    padding-top: 36px;
    border-top: 1px solid var(--border);
  }
  .hero-stat .num {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 36px;
    line-height: 1;
    color: var(--accent);
    margin-bottom: 4px;
    font-variation-settings: "opsz" 144, "SOFT" 50;
  }
  .hero-stat .label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-dim);
  }

  /* Hero Visual */
  .hero-visual {
    position: relative;
    aspect-ratio: 4/5;
    border-radius: 28px;
    overflow: hidden;
    ${heroVisualStyle}
    box-shadow: var(--shadow-image);
  }
  .hero-visual::after {
    ${heroVisualAfter}
  }
  .live-badge {
    position: absolute;
    top: 24px; right: 24px;
    background: ${hexToRgba('#ffffff', 0.92)};
    border: 1px solid ${hexToRgba(textColor, 0.08)};
    border-radius: 20px;
    padding: 16px 20px;
    backdrop-filter: blur(12px);
    box-shadow: var(--shadow-soft);
  }
  .live-badge .live-dot {
    display: inline-block;
    width: 8px; height: 8px;
    background: var(--accent);
    border-radius: 50%;
    margin-right: 6px;
    animation: pulse 1.5s infinite;
  }
  .live-badge .live-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-dim);
    margin-bottom: 6px;
  }
  .live-badge .live-count {
    font-family: var(--font-display);
    font-size: 36px;
    font-weight: 700;
    color: var(--accent);
    line-height: 1;
    font-variation-settings: "opsz" 144, "SOFT" 50;
  }
  .live-badge .live-sub {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-dim);
    margin-top: 2px;
  }

  /* ========================================
     SECTION HEADER
     ======================================== */
  .section-head { text-align: center; margin-bottom: 64px; }
  .section-head .eyebrow { display: block; margin-bottom: 16px; }
  .section-head h2 {
    font-size: clamp(36px, 4.5vw, 60px);
    margin-bottom: 16px;
    line-height: 1.08;
  }
  .section-head p {
    color: var(--text-soft);
    font-size: 17px;
    max-width: 580px;
    margin: 0 auto;
    line-height: 1.6;
  }

  /* ========================================
     PROGRAMS
     ======================================== */
  .programs { background: var(--bg-warm); }
  .programs-grid {
    display: grid;
    grid-template-columns: repeat(${Math.min(c.programs.length, 4)}, 1fr);
    gap: 20px;
  }
  .program-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 32px 28px;
    cursor: pointer;
    transition: border-color 0.4s, transform 0.4s var(--spring), box-shadow 0.4s;
    position: relative;
    overflow: hidden;
  }
  .program-card:hover {
    border-color: var(--border-hover);
    transform: translateY(-6px);
    box-shadow: var(--shadow-card);
  }
  .program-icon {
    width: 56px; height: 56px;
    background: var(--accent-soft);
    color: var(--accent);
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
    transition: transform 0.5s var(--spring), background 0.3s;
  }
  .program-card:hover .program-icon {
    transform: rotate(-6deg) scale(1.08);
    background: var(--accent);
    color: var(--white);
  }
  .program-icon svg { width: 28px; height: 28px; stroke-width: 2; }
  .program-card h3 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 22px;
    margin-bottom: 8px;
    letter-spacing: -0.02em;
    color: var(--text);
  }
  .program-card p {
    color: var(--text-soft);
    font-size: 14px;
    line-height: 1.6;
  }
  .program-features {
    list-style: none;
    margin-top: 14px;
    font-size: 13px;
    color: var(--text-dim);
  }
  .program-features li {
    padding: 4px 0;
    padding-left: 16px;
    position: relative;
  }
  .program-features li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    transform: translateY(-50%);
  }

  /* ========================================
     SCHEDULE WIDGET
     ======================================== */
  .schedule { background: var(--bg); }
  .schedule-tabs {
    display: flex;
    gap: 0;
    border-bottom: 2px solid var(--border);
    margin-bottom: 32px;
    overflow-x: auto;
  }
  .day-tab {
    background: transparent;
    border: none;
    color: var(--text-dim);
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 16px 24px;
    cursor: pointer;
    position: relative;
    transition: color 0.2s;
    white-space: nowrap;
  }
  .day-tab:hover { color: var(--text); }
  .day-tab.active { color: var(--accent); }
  .day-tab.active::after {
    content: '';
    position: absolute;
    bottom: -2px; left: 0; right: 0;
    height: 2px;
    background: var(--accent);
    border-radius: 2px 2px 0 0;
  }

  .schedule-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .class-row {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 20px 24px;
    display: grid;
    grid-template-columns: 100px 1fr auto auto;
    gap: 24px;
    align-items: center;
    transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
  }
  .class-row:hover { border-color: var(--border-hover); transform: translateX(4px); box-shadow: var(--shadow-soft); }
  .class-time {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 20px;
    color: var(--text);
    letter-spacing: -0.02em;
    font-variation-settings: "opsz" 24, "SOFT" 50;
  }
  .class-info h4 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 17px;
    margin-bottom: 4px;
    color: var(--text);
  }
  .class-info .trainer {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-dim);
    letter-spacing: 0.04em;
  }
  .class-intensity {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .intensity {
    display: flex;
    gap: 4px;
  }
  .intensity .dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--border);
    transition: background 0.3s;
  }
  .intensity .dot.active {
    background: var(--accent);
  }
  .intensity-label {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-dim);
    letter-spacing: 0.04em;
    text-transform: capitalize;
  }
  .class-book {
    background: var(--accent);
    color: var(--white);
    padding: 10px 20px;
    border-radius: 999px;
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 600;
    transition: all 0.3s var(--spring);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 8px ${hexToRgba(accent, 0.2)};
  }
  .class-book:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: 0 4px 14px ${hexToRgba(accent, 0.3)}; }

  /* ========================================
     PRICING
     ======================================== */
  .pricing { background: var(--bg-warm); }
  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(${Math.min(c.pricing.length, 3)}, 1fr);
    gap: 24px;
  }
  .price-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 28px;
    padding: 40px 32px;
    position: relative;
    display: flex;
    flex-direction: column;
    transition: border-color 0.4s, transform 0.4s var(--spring), box-shadow 0.4s;
  }
  .price-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-card); }
  .price-card.featured {
    border-color: var(--accent);
    background: var(--white);
    box-shadow: 0 8px 40px ${hexToRgba(accent, 0.12)};
  }
  .price-badge {
    position: absolute;
    top: -14px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--accent);
    color: var(--white);
    padding: 6px 18px;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    box-shadow: 0 4px 12px ${hexToRgba(accent, 0.25)};
  }
  .price-name {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 16px;
  }
  .price-amount {
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin-bottom: 24px;
  }
  .price-amount .num {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 56px;
    color: var(--text);
    line-height: 1;
    letter-spacing: -0.04em;
    font-variation-settings: "opsz" 144, "SOFT" 80;
  }
  .price-amount .currency {
    font-family: var(--font-display);
    font-size: 22px;
    color: var(--text-soft);
  }
  .price-amount .period {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-dim);
    margin-left: 6px;
    letter-spacing: 0.04em;
  }
  .price-features {
    list-style: none;
    margin-bottom: 32px;
    flex: 1;
  }
  .price-features li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 9px 0;
    font-size: 14px;
    color: var(--text-soft);
    border-bottom: 1px solid ${hexToRgba(textColor, 0.05)};
  }
  .price-features li:last-child { border-bottom: none; }
  .price-features svg {
    width: 18px; height: 18px;
    color: var(--accent);
    flex-shrink: 0;
    margin-top: 2px;
  }
  .price-cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 15px;
    border-radius: 999px;
    background: transparent;
    color: var(--text);
    border: 1.5px solid var(--border);
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s var(--spring);
  }
  .price-card.featured .price-cta {
    background: var(--accent);
    color: var(--white);
    border-color: var(--accent);
    box-shadow: 0 4px 16px ${hexToRgba(accent, 0.25)};
  }
  .price-cta:hover { background: var(--accent); color: var(--white); border-color: var(--accent); }

  /* ========================================
     TRAINERS
     ======================================== */
  .trainers { background: var(--bg); }
  .trainers-grid {
    display: grid;
    grid-template-columns: repeat(${Math.min(c.trainers.length, 4)}, 1fr);
    gap: 24px;
  }
  .trainer-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 24px;
    overflow: hidden;
    transition: border-color 0.3s, transform 0.4s var(--spring), box-shadow 0.4s;
    cursor: pointer;
  }
  .trainer-card:hover { border-color: var(--border-hover); transform: translateY(-6px); box-shadow: var(--shadow-card); }
  .trainer-img {
    aspect-ratio: 4/3;
    transition: transform 0.6s var(--smooth);
    overflow: hidden;
  }
  .trainer-card:hover .trainer-img { transform: scale(1.03); }
  .trainer-body {
    padding: 24px;
  }
  .trainer-name {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 20px;
    margin-bottom: 4px;
    color: var(--text);
    letter-spacing: -0.01em;
  }
  .trainer-role {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 10px;
  }
  .trainer-quote {
    font-family: var(--font-display);
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-soft);
    font-style: italic;
    margin-bottom: 14px;
    font-variation-settings: "opsz" 24, "SOFT" 60;
  }
  .trainer-specs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .trainer-specs span {
    font-family: var(--font-mono);
    font-size: 10px;
    padding: 4px 10px;
    background: var(--accent-soft);
    border: 1px solid ${hexToRgba(accent, 0.12)};
    border-radius: 999px;
    color: var(--accent);
    letter-spacing: 0.04em;
    font-weight: 500;
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
    border-radius: 24px;
    padding: 32px 28px;
    display: flex;
    flex-direction: column;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .testi-card:hover { border-color: var(--border-hover); box-shadow: var(--shadow-soft); }
  .testi-rating {
    display: flex;
    gap: 2px;
    margin-bottom: 16px;
  }
  .testi-rating svg { width: 16px; height: 16px; color: var(--accent); fill: var(--accent); }
  .testi-quote {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 17px;
    line-height: 1.55;
    margin-bottom: 24px;
    flex: 1;
    letter-spacing: -0.01em;
    color: var(--text);
    font-variation-settings: "opsz" 24, "SOFT" 50;
  }
  .testi-author {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
  }
  .testi-avatar {
    width: 44px; height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${lighten(accent, 40)}, ${lighten(accent, 20)});
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--white);
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 15px;
  }
  .testi-info .name {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 2px;
    color: var(--text);
  }
  .testi-info .meta {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-dim);
    letter-spacing: 0.04em;
  }

  /* ========================================
     LOCATION + MAP
     ======================================== */
  .location { background: var(--bg); }
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
    font-family: var(--font-display);
    font-weight: 600;
    font-size: clamp(32px, 3.5vw, 48px);
    letter-spacing: -0.025em;
    line-height: 1.08;
    margin-bottom: 28px;
    font-variation-settings: "opsz" 144, "SOFT" 50;
  }
  .location-info h2 em {
    font-style: italic;
    color: var(--accent);
  }
  .location-detail {
    display: flex;
    gap: 16px;
    padding: 18px 0;
    border-bottom: 1px solid var(--border);
  }
  .location-detail:last-of-type { border-bottom: none; }
  .location-detail .icon {
    width: 44px; height: 44px;
    background: var(--accent-soft);
    color: var(--accent);
    border-radius: 14px;
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
    color: var(--text-dim);
    margin-bottom: 4px;
  }
  .location-detail .value {
    color: var(--text);
    font-size: 15px;
    line-height: 1.5;
  }
  .location-detail .value strong { color: var(--accent); font-weight: 600; }

  .location-map {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 28px;
    overflow: hidden;
    position: relative;
    min-height: 460px;
    box-shadow: var(--shadow-soft);
  }
  .map-svg {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
  }
  .map-street { stroke: ${hexToRgba(textColor, 0.08)}; stroke-width: 2; fill: none; }
  .map-street-major { stroke: ${hexToRgba(textColor, 0.12)}; stroke-width: 4; fill: none; stroke-linecap: round; }
  .map-block { fill: ${hexToRgba(textColor, 0.04)}; }
  .map-water { fill: ${hexToRgba(accent, 0.06)}; }
  .map-pin {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -100%);
    z-index: 2;
  }
  .map-pin-circle {
    width: 56px; height: 56px;
    background: var(--accent);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--white);
    box-shadow: 0 8px 24px ${hexToRgba(accent, 0.35)};
    animation: pinFloat 3s ease-in-out infinite;
  }
  .map-pin-circle svg { width: 28px; height: 28px; stroke-width: 2.5; }
  .map-pin-pulse {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 56px; height: 56px;
    border-radius: 50%;
    border: 2px solid var(--accent);
    opacity: 0;
    animation: mapPulse 2s ease-out infinite;
  }
  @keyframes pinFloat {
    0%, 100% { transform: translate(-50%, -100%) translateY(0); }
    50%      { transform: translate(-50%, -100%) translateY(-6px); }
  }
  @keyframes mapPulse {
    0%   { width: 56px; height: 56px; opacity: 1; }
    100% { width: 160px; height: 160px; opacity: 0; }
  }
  .map-overlay {
    position: absolute;
    bottom: 24px; left: 24px;
    background: ${hexToRgba('#ffffff', 0.95)};
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 16px 20px;
    backdrop-filter: blur(12px);
    z-index: 3;
    box-shadow: var(--shadow-soft);
  }
  .map-overlay .label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 4px;
  }
  .map-overlay .name {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 16px;
    letter-spacing: -0.01em;
    color: var(--text);
  }

  /* ========================================
     FINAL CTA
     ======================================== */
  .final-cta { background: var(--bg); padding: 100px 0 120px; }
  .final-cta-inner {
    background: var(--accent);
    color: var(--white);
    border-radius: 36px;
    padding: 80px 64px;
    text-align: center;
    position: relative;
    overflow: hidden;
    box-shadow: 0 24px 64px ${hexToRgba(accent, 0.25)};
  }
  .final-cta-inner::before {
    content: '';
    position: absolute;
    top: -60%; right: -20%;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    pointer-events: none;
  }
  .final-cta-inner::after {
    content: '';
    position: absolute;
    bottom: -40%; left: -10%;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .final-cta-inner > * { position: relative; z-index: 1; }
  .final-cta-inner h2 {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: clamp(36px, 5vw, 72px);
    letter-spacing: -0.03em;
    line-height: 1.02;
    margin-bottom: 16px;
    color: var(--white);
    font-variation-settings: "opsz" 144, "SOFT" 50;
  }
  .final-cta-inner h2 em {
    font-style: italic;
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }
  .final-cta-inner p {
    font-size: 17px;
    max-width: 540px;
    margin: 0 auto 36px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.8);
  }
  .final-cta-inner .btn {
    background: var(--white);
    color: var(--accent);
    padding: 18px 32px;
    font-size: 15px;
    font-weight: 600;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  .final-cta-inner .btn::before { display: none; }
  .final-cta-inner .btn:hover { background: var(--bg); transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2); }

  /* CTA Form */
  .cta-form {
    display: flex;
    gap: 14px;
    justify-content: center;
    flex-wrap: wrap;
    max-width: 620px;
    margin: 0 auto;
  }
  .cta-form input, .cta-form textarea {
    flex: 1;
    min-width: 200px;
    padding: 16px 22px;
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
    background: var(--text);
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
  .footer-brand .logo-mark { background: var(--accent); }
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
  .footer-col a:hover { color: var(--accent); }
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
  .footer-bottom a:hover { color: var(--accent); }

  /* ========================================
     STICKY MOBILE CTA
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 16px; left: 16px; right: 16px;
    background: var(--accent);
    color: var(--white);
    padding: 16px 24px;
    border-radius: 999px;
    z-index: 100;
    font-family: var(--font-body);
    font-size: 15px;
    font-weight: 600;
    text-align: center;
    box-shadow: 0 8px 32px ${hexToRgba(accent, 0.4)};
    transition: background 0.2s;
  }
  .mobile-cta:hover { background: var(--accent-hover); }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .programs-grid, .trainers-grid { grid-template-columns: repeat(2, 1fr); }
    .pricing-grid, .testi-grid { grid-template-columns: 1fr; max-width: 540px; margin-left: auto; margin-right: auto; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .location-grid { grid-template-columns: 1fr; }
    .class-row { grid-template-columns: 80px 1fr auto; gap: 16px; }
    .class-intensity { display: none; }
  }
  @media (max-width: 768px) {
    section { padding: 64px 0; }
    .container { padding: 0 20px; }
    .hero { padding: 40px 0 64px; }
    .hero-grid { grid-template-columns: 1fr; gap: 40px; }
    .hero h1 { font-size: clamp(36px, 10vw, 52px); }
    .hero-stats { grid-template-columns: 1fr 1fr; }
    .hero-visual { aspect-ratio: 3/4; }
    .programs-grid, .trainers-grid { grid-template-columns: 1fr; }
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
      ${c.programs.length > 0 ? '<a href="#programs">Kurse</a>' : ''}
      ${c.schedule && c.schedule.length > 0 ? '<a href="#schedule">Wochenplan</a>' : ''}
      ${c.pricing.length > 0 ? '<a href="#pricing">Mitgliedschaft</a>' : ''}
      ${c.trainers.length > 0 ? '<a href="#trainers">Team</a>' : ''}
      <a href="#location">Studio</a>
    </div>
    <a href="#cta" class="nav-cta">${e(c.ctaText)}</a>
  </div>
</nav>

<!-- ====== HERO ====== -->
<section class="hero" aria-label="Willkommen">
  <div class="container hero-grid">
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
        ${c.schedule && c.schedule.length > 0 ? '<a href="#schedule" class="btn btn-ghost">Kursplan ansehen</a>' : ''}
      </div>
      ${c.stats.length > 0 ? `<div class="hero-stats">
        ${c.stats.map(s => `<div class="hero-stat"><div class="num">${e(s.value)}</div><div class="label">${e(s.label)}</div></div>`).join('\n        ')}
      </div>` : ''}
    </div>
    <div class="hero-visual" role="img" aria-label="Studioimpression">
      <div class="live-badge">
        <div class="live-label"><span class="live-dot"></span>Gerade aktiv</div>
        <div class="live-count" id="liveCount">23</div>
        <div class="live-sub">Im Studio</div>
      </div>
    </div>
  </div>
</section>

${programsHtml}

${scheduleHtml}

${pricingHtml}

${trainersHtml}

${reviewsHtml}

${locationHtml}

<!-- ====== FINAL CTA ====== -->
<section id="cta" class="final-cta" aria-label="Kontakt">
  <div class="container">
    <div class="final-cta-inner">
      <h2 class="display">Bereit f\u00fcr dein <em>erstes Mal?</em></h2>
      <p>Schreib uns und wir finden gemeinsam den perfekten Kurs f\u00fcr dich. Probestunde inklusive.</p>
      <form class="cta-form" onsubmit="return false" aria-label="Kontaktformular">
        <input type="text" name="name" placeholder="Dein Name" required aria-label="Name">
        <input type="email" name="email" placeholder="Deine E-Mail" required aria-label="E-Mail">
        <input type="tel" name="phone" placeholder="Telefonnummer (optional)" aria-label="Telefon">
        <textarea name="message" placeholder="Was interessiert dich? Barre, HIIT, Reformer..." required aria-label="Nachricht"></textarea>
        <div style="position:absolute;left:-9999px"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>
        <button class="btn" type="button" id="cta-submit" style="white-space:nowrap;width:auto;background:var(--white);color:var(--accent)">${e(c.ctaText)} &rarr;</button>
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
        <h4>Kurse</h4>
        <ul>
          ${c.programs.slice(0, 5).map(p => `<li><a href="#programs">${e(p.title)}</a></li>`).join('\n          ')}
          ${c.schedule && c.schedule.length > 0 ? '<li><a href="#schedule">Wochenplan</a></li>' : ''}
        </ul>
      </div>
      <div class="footer-col">
        <h4>Studio</h4>
        <ul>
          ${c.trainers.length > 0 ? '<li><a href="#trainers">Unser Team</a></li>' : ''}
          ${c.pricing.length > 0 ? '<li><a href="#pricing">Mitgliedschaft</a></li>' : ''}
          <li><a href="#location">Standort</a></li>
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
  /* Live-Counter */
  (function liveCounter() {
    var el = document.getElementById('liveCount');
    if (!el) return;
    var current = 23;
    setInterval(function() {
      var delta = Math.floor(Math.random() * 3) - 1;
      current = Math.max(12, Math.min(38, current + delta));
      el.textContent = current;
    }, 5000);
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

  /* Smooth reveal on scroll */
  (function scrollReveal() {
    var cards = document.querySelectorAll('.program-card, .price-card, .trainer-card, .testi-card, .class-row');
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
          form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="font-size:1.6rem;margin-bottom:12px;color:#fff">Vielen Dank!</h3><p style="font-size:1.05rem;color:rgba(255,255,255,0.8)">Wir freuen uns auf dich und melden uns schnellstm\\u00f6glich.</p></div>';
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
<div id="cookie-banner" role="dialog" aria-label="Cookie-Hinweis" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba('#ffffff', 0.97)};backdrop-filter:blur(16px);color:var(--text);padding:16px 24px;font-size:.85rem;line-height:1.6;border-top:1px solid ${hexToRgba(textColor, 0.08)};box-shadow:0 -4px 24px ${hexToRgba(textColor, 0.06)}">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:var(--text-soft)">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen findest du in unserer <a href="${e(c.privacyUrl || '#')}" style="color:var(--text);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--accent);color:#fff;border:none;padding:10px 24px;border-radius:999px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit;box-shadow:0 2px 8px ${hexToRgba(accent, 0.2)}">Verstanden</button>
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
