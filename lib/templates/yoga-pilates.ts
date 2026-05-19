// Yoga & Pilates Template — Pilates-Studio
// Anthrazit + Warmes Off-White + Korallrosa, elegant-sportlich, Reformer-fokussiert

export interface YogaPilatesConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Anthrazit (#1e1e1e)
    bg: string         // Warmes Off-White (#faf6f0)
    accent: string     // Korallrosa (#d4806a)
  }
  phone?: string
  email?: string
  address?: string
  stats: { value: string; label: string }[]
  courses: { icon: string; title: string; description: string; features?: string[]; level?: string }[]
  schedule?: { day: string; classes: { time: string; name: string; trainer: string; level: string; spots?: number }[] }[]
  pricing: { name: string; price: string; period: string; features: string[]; highlighted?: boolean; ctaText: string }[]
  team: { name: string; role: string; speciality: string; certification?: string; imageUrl?: string; quote?: string }[]
  studioTour: { icon: string; title: string; description: string }[]
  reviews: { text: string; name: string; detail: string; rating: number }[]
  faqItems?: { question: string; answer: string }[]
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

export function renderYogaPilatesTemplate(config: YogaPilatesConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primary = c.colors.primary || '#1e1e1e'
  const bg = c.colors.bg || '#faf6f0'
  const accent = c.colors.accent || '#d4806a'

  const accentHover = darken(accent, 18)
  const accentLight = lighten(accent, 50)
  const accentSoft = hexToRgba(accent, 0.10)
  const accentGlow = hexToRgba(accent, 0.30)
  const textSoft = hexToRgba(primary, 0.65)
  const textDim = hexToRgba(primary, 0.4)
  const borderColor = hexToRgba(primary, 0.10)
  const borderHover = hexToRgba(accent, 0.3)
  const warmCard = darken(bg, 6)
  const warmCard2 = darken(bg, 12)

  const logoInitial = e(c.businessName.charAt(0).toUpperCase())
  const businessNameEsc = e(c.businessName)

  // Build level indicator
  const levelIndicator = (level: string): string => {
    const levels: Record<string, number> = { 'anfänger': 1, 'beginner': 1, 'leicht': 1, 'mittel': 2, 'intermediate': 2, 'moderat': 2, 'fortgeschritten': 3, 'advanced': 3, 'alle level': 2 }
    const num = levels[level.toLowerCase()] || 2
    return `<span class="level-dots" title="${e(level)}">${Array(3).fill(0).map((_, i) => `<span class="dot${i < num ? ' active' : ''}"></span>`).join('')}</span>`
  }

  // Build courses HTML
  const coursesHtml = c.courses.length > 0 ? `
<!-- ====== KURSANGEBOT ====== -->
<section id="courses" class="courses">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Kursangebot</span>
      <h2 class="display">Finde dein <em>Pilates-Format</em></h2>
      <p>Von der Matte bis zum Reformer \u2014 pr\u00e4zise Bewegung f\u00fcr jedes Level.</p>
    </div>
    <div class="courses-grid">
      ${c.courses.map(p => `<div class="course-card">
        <div class="course-icon">
          ${p.icon}
        </div>
        <h3>${e(p.title)}</h3>
        <p>${e(p.description)}</p>
        ${p.level ? `<div class="course-level">${levelIndicator(p.level)}<span class="level-label">${e(p.level)}</span></div>` : ''}
        ${p.features && p.features.length > 0 ? `<ul class="course-features">${p.features.map(f => `<li>${checkSvg}${e(f)}</li>`).join('')}</ul>` : ''}
      </div>`).join('\n      ')}
    </div>
  </div>
</section>` : ''

  // Build schedule HTML
  const scheduleHtml = c.schedule && c.schedule.length > 0 ? `
<!-- ====== STUNDENPLAN ====== -->
<section id="schedule" class="schedule">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Stundenplan</span>
      <h2 class="display">Dein <em>Wochenrhythmus</em></h2>
      <p>Reformer, Matte, Tower \u2014 finde deinen festen Platz im Stundenplan.</p>
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
        <div class="class-level">${levelIndicator(cls.level)}<span class="level-label">${e(cls.level)}</span></div>
        ${cls.spots !== undefined ? `<div class="class-spots"><span class="spots-num">${cls.spots}</span> Pl\u00e4tze</div>` : ''}
        <button class="class-book">Platz sichern</button>
      </div>`).join('\n      ')}
    </div>`).join('\n    ')}
  </div>
</section>` : ''

  // Build pricing HTML
  const pricingHtml = c.pricing.length > 0 ? `
<!-- ====== PREISE ====== -->
<section id="pricing" class="pricing">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Preise</span>
      <h2 class="display">Transparent &amp; <em>fair</em></h2>
      <p>Einzelstunde, 5er-Karte, 10er-Karte oder Flatrate \u2014 w\u00e4hle dein Modell.</p>
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
      <h2 class="display">Die Menschen hinter <em>deiner Bewegung</em></h2>
      <p>Zertifizierte Pilates-Trainerinnen mit Passion f\u00fcr pr\u00e4zise Bewegung.</p>
    </div>
    <div class="team-grid">
      ${c.team.map((t, i) => `<div class="team-card">
        <div class="team-img" ${t.imageUrl ? `style="background: url('${e(t.imageUrl)}') center/cover no-repeat;"` : `style="background: linear-gradient(160deg, ${lighten(accent, 40 + i * 10)}, ${lighten(accent, 10 + i * 8)});"`}></div>
        <div class="team-body">
          <div class="team-name">${e(t.name)}</div>
          <div class="team-role">${e(t.role)}</div>
          ${t.certification ? `<div class="team-cert"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>${e(t.certification)}</div>` : ''}
          ${t.quote ? `<p class="team-quote">\u201E${e(t.quote)}\u201C</p>` : ''}
          <div class="team-specs">
            ${t.speciality.split(',').map(s => `<span>${e(s.trim())}</span>`).join('')}
          </div>
        </div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>` : ''

  // Build studio tour HTML
  const studioTourHtml = c.studioTour.length > 0 ? `
<!-- ====== STUDIO-TOUR / AUSSTATTUNG ====== -->
<section id="studio" class="studio-tour">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Studio &amp; Ausstattung</span>
      <h2 class="display">Wo <em>Pr\u00e4zision</em> zu Hause ist</h2>
      <p>Balanced Body Reformer, Tower-Units, Cadillac \u2014 Ger\u00e4te auf h\u00f6chstem Niveau.</p>
    </div>
    <div class="studio-grid">
      ${c.studioTour.map(item => `<div class="studio-item">
        <div class="studio-icon">${item.icon}</div>
        <h3>${e(item.title)}</h3>
        <p>${e(item.description)}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>` : ''

  // Build reviews HTML
  const reviewsHtml = c.reviews.length > 0 ? `
<!-- ====== REVIEWS ====== -->
<section class="testimonials">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Kundenstimmen</span>
      <h2 class="display">Was unsere <em>Community</em> sagt</h2>
      <p>Echte Erfahrungen von echten Kursteilnehmerinnen.</p>
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

  // Build FAQ HTML
  const faqItemsHtml = (c.faqItems || []).map(f => `
      <div class="faq-item">
        <button class="faq-q" aria-expanded="false">${e(f.question)}<span class="faq-icon">+</span></button>
        <div class="faq-a" role="region">${e(f.answer)}</div>
      </div>`).join('')

  const faqHtml = (c.faqItems || []).length > 0 ? `
<!-- ====== FAQ ====== -->
<section id="faq" class="faq-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">H\u00e4ufige Fragen</span>
      <h2 class="display">Alles rund um <em>Pilates</em></h2>
      <p>Reformer, Powerhouse, Neutral Spine \u2014 wir beantworten deine Fragen.</p>
    </div>
    <div class="faq-grid">
      ${faqItemsHtml}
    </div>
  </div>
</section>` : ''

  // Build location HTML
  const locationHtml = `
<!-- ====== STANDORT ====== -->
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

  // Schema.org structured data — SportsActivityLocation
  const schemaOrg = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
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
    --primary:      ${primary};
    --bg:           ${bg};
    --bg-warm:      ${warmCard};
    --bg-warm-2:    ${warmCard2};
    --accent:       ${accent};
    --accent-hover: ${accentHover};
    --accent-light: ${accentLight};
    --accent-soft:  ${accentSoft};
    --accent-glow:  ${accentGlow};
    --text:         ${primary};
    --text-soft:    ${textSoft};
    --text-dim:     ${textDim};
    --border:       ${borderColor};
    --border-hover: ${borderHover};
    --white:        #ffffff;

    --shadow-soft:  0 4px 24px ${hexToRgba(primary, 0.06)};
    --shadow-card:  0 8px 32px ${hexToRgba(primary, 0.08)};
    --shadow-image: 0 20px 60px ${hexToRgba(primary, 0.12)};

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

  .section-head {
    text-align: center;
    max-width: 640px;
    margin: 0 auto 64px;
  }
  .section-head .eyebrow { display: block; margin-bottom: 12px; }
  .section-head h2 {
    font-size: clamp(32px, 4.5vw, 54px);
    margin-bottom: 16px;
  }
  .section-head p {
    font-size: 17px;
    line-height: 1.65;
    color: var(--text-soft);
  }

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
    max-width: 520px;
    margin-bottom: 32px;
  }
  .cta-row {
    display: flex; gap: 16px; align-items: center;
    margin-bottom: 40px;
    flex-wrap: wrap;
  }
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 28px; border-radius: 999px;
    font-size: 15px; font-weight: 600;
    border: none; cursor: pointer;
    font-family: var(--font-body);
    transition: all 0.3s var(--spring);
  }
  .btn svg { width: 18px; height: 18px; stroke-width: 2.5; }
  .btn-primary {
    background: var(--accent); color: var(--white);
    box-shadow: 0 4px 20px ${hexToRgba(accent, 0.3)};
  }
  .btn-primary:hover {
    background: var(--accent-hover);
    transform: translateY(-2px);
    box-shadow: 0 8px 28px ${hexToRgba(accent, 0.4)};
  }
  .btn-ghost {
    background: transparent; color: var(--text);
    border: 1.5px solid var(--border);
    padding: 13px 26px;
  }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

  .hero-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
  }
  .hero-stat .num {
    font-family: var(--font-display);
    font-size: 32px;
    font-weight: 700;
    color: var(--accent);
    line-height: 1;
    font-variation-settings: "opsz" 144;
  }
  .hero-stat .label {
    font-size: 13px;
    color: var(--text-dim);
    margin-top: 4px;
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
  }

  .hero-visual {
    aspect-ratio: 4/5;
    border-radius: 24px;
    position: relative;
    overflow: hidden;
    ${c.heroImageUrl
      ? `background: url('${e(c.heroImageUrl)}') center/cover no-repeat;`
      : `background: linear-gradient(180deg, transparent 50%, ${hexToRgba(primary, 0.5)}), linear-gradient(135deg, ${lighten(accent, 60)} 0%, ${lighten(accent, 30)} 40%, ${accent} 100%);`}
    box-shadow: var(--shadow-image);
  }
  ${!c.heroImageUrl ? `.hero-visual::after {
    content: 'IMG: Reformer-Training im Studio';
    position: absolute;
    bottom: 24px; left: 24px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: rgba(255,255,255,0.6);
    letter-spacing: 0.08em;
  }` : ''}

  .live-badge {
    position: absolute;
    top: 24px; right: 24px;
    background: ${hexToRgba('#ffffff', 0.95)};
    backdrop-filter: blur(12px);
    border-radius: 16px;
    padding: 14px 18px;
    text-align: center;
    min-width: 100px;
    box-shadow: 0 4px 20px ${hexToRgba(primary, 0.1)};
  }
  .live-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 600;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    justify-content: center;
  }
  .live-dot {
    width: 7px; height: 7px;
    background: var(--accent);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  .live-count {
    font-family: var(--font-display);
    font-size: 36px;
    font-weight: 800;
    color: var(--accent);
    line-height: 1.1;
    margin-top: 4px;
    font-variation-settings: "opsz" 144;
  }
  .live-sub {
    font-size: 11px; color: var(--text-dim);
    font-family: var(--font-mono);
    letter-spacing: 0.06em;
    margin-top: 2px;
  }

  /* ========================================
     COURSES
     ======================================== */
  .courses { background: var(--bg); }
  .courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }
  .course-card {
    background: var(--bg-warm);
    border-radius: 20px;
    padding: 32px;
    border: 1px solid var(--border);
    transition: all 0.4s var(--smooth);
    position: relative;
    overflow: hidden;
  }
  .course-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--accent);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .course-card:hover {
    border-color: var(--border-hover);
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
  }
  .course-card:hover::before { opacity: 1; }
  .course-icon {
    width: 52px; height: 52px;
    background: var(--accent-soft);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
    color: var(--accent);
  }
  .course-icon svg { width: 26px; height: 26px; }
  .course-card h3 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 20px;
    margin-bottom: 8px;
    font-variation-settings: "opsz" 36, "SOFT" 50;
  }
  .course-card > p {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-soft);
    margin-bottom: 16px;
  }
  .course-level {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }
  .level-dots {
    display: flex; gap: 4px;
  }
  .level-dots .dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--border);
    transition: background 0.2s;
  }
  .level-dots .dot.active { background: var(--accent); }
  .level-label {
    font-size: 12px;
    font-family: var(--font-mono);
    color: var(--text-dim);
    text-transform: capitalize;
    letter-spacing: 0.04em;
  }
  .course-features {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .course-features li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-soft);
  }
  .course-features li svg {
    width: 15px; height: 15px;
    color: var(--accent);
    flex-shrink: 0;
  }

  /* ========================================
     SCHEDULE
     ======================================== */
  .schedule { background: var(--bg-warm); }
  .schedule-tabs {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin-bottom: 32px;
    background: var(--bg);
    border-radius: 14px;
    padding: 5px;
    max-width: 640px;
    margin-left: auto;
    margin-right: auto;
  }
  .day-tab {
    padding: 12px 20px;
    border: none;
    background: transparent;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-dim);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .day-tab.active {
    background: var(--accent);
    color: var(--white);
    box-shadow: 0 2px 12px ${hexToRgba(accent, 0.3)};
  }
  .day-tab:hover:not(.active) { color: var(--text); }

  .schedule-list { display: flex; flex-direction: column; gap: 8px; }
  .class-row {
    display: grid;
    grid-template-columns: 90px 1fr auto auto auto;
    align-items: center;
    gap: 20px;
    padding: 18px 24px;
    background: var(--bg);
    border-radius: 14px;
    border: 1px solid var(--border);
    transition: all 0.3s var(--smooth);
  }
  .class-row:hover {
    border-color: var(--border-hover);
    box-shadow: var(--shadow-soft);
  }
  .class-time {
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 18px;
    color: var(--accent);
  }
  .class-info h4 {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 600;
    font-variation-settings: "opsz" 36, "SOFT" 50;
  }
  .class-info .trainer {
    font-size: 13px;
    color: var(--text-dim);
    margin-top: 2px;
  }
  .class-level {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .class-spots {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-dim);
    letter-spacing: 0.04em;
  }
  .class-spots .spots-num {
    font-weight: 700;
    color: var(--accent);
  }
  .class-book {
    background: var(--accent-soft);
    color: var(--accent);
    border: 1px solid ${hexToRgba(accent, 0.2)};
    padding: 8px 18px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-body);
    transition: all 0.25s var(--spring);
  }
  .class-book:hover {
    background: var(--accent);
    color: var(--white);
    box-shadow: 0 4px 16px ${hexToRgba(accent, 0.3)};
  }

  /* ========================================
     PRICING
     ======================================== */
  .pricing { background: var(--bg); }
  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 24px;
    max-width: 1080px;
    margin: 0 auto;
  }
  .price-card {
    background: var(--bg-warm);
    border-radius: 20px;
    padding: 36px 28px;
    border: 1px solid var(--border);
    transition: all 0.4s var(--smooth);
    position: relative;
  }
  .price-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
  }
  .price-card.featured {
    background: var(--text);
    color: ${hexToRgba(bg, 0.9)};
    border-color: transparent;
    box-shadow: var(--shadow-image);
    transform: scale(1.03);
  }
  .price-card.featured:hover { transform: scale(1.05) translateY(-4px); }
  .price-badge {
    position: absolute;
    top: -12px; left: 50%;
    transform: translateX(-50%);
    background: var(--accent);
    color: var(--white);
    padding: 4px 16px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    font-family: var(--font-mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .price-name {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 20px;
    margin-bottom: 16px;
    font-variation-settings: "opsz" 36, "SOFT" 50;
  }
  .price-amount {
    margin-bottom: 24px;
    display: flex;
    align-items: baseline;
    gap: 2px;
  }
  .price-amount .num {
    font-family: var(--font-display);
    font-size: 48px;
    font-weight: 800;
    line-height: 1;
    color: var(--accent);
    font-variation-settings: "opsz" 144;
  }
  .price-amount .currency {
    font-size: 20px;
    font-weight: 600;
    margin-left: 2px;
    color: var(--accent);
  }
  .price-amount .period {
    font-size: 14px;
    color: var(--text-dim);
    margin-left: 6px;
    font-family: var(--font-mono);
  }
  .price-card.featured .price-amount .period { color: ${hexToRgba(bg, 0.5)}; }
  .price-features {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 28px;
  }
  .price-features li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: var(--text-soft);
  }
  .price-card.featured .price-features li { color: ${hexToRgba(bg, 0.7)}; }
  .price-features li svg {
    width: 16px; height: 16px;
    color: var(--accent);
    flex-shrink: 0;
  }
  .price-cta {
    width: 100%;
    padding: 13px 24px;
    border-radius: 999px;
    border: 1.5px solid var(--accent);
    background: transparent;
    color: var(--accent);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-body);
    transition: all 0.3s var(--spring);
  }
  .price-cta:hover {
    background: var(--accent);
    color: var(--white);
    box-shadow: 0 4px 16px ${hexToRgba(accent, 0.3)};
  }
  .price-card.featured .price-cta {
    background: var(--accent);
    color: var(--white);
    border-color: var(--accent);
  }
  .price-card.featured .price-cta:hover {
    background: var(--accent-hover);
    border-color: var(--accent-hover);
  }

  /* ========================================
     TEAM
     ======================================== */
  .team { background: var(--bg-warm); }
  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 28px;
  }
  .team-card {
    background: var(--bg);
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid var(--border);
    transition: all 0.4s var(--smooth);
  }
  .team-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
    border-color: var(--border-hover);
  }
  .team-img {
    aspect-ratio: 4/3;
    background: var(--bg-warm-2);
  }
  .team-body { padding: 24px; }
  .team-name {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 20px;
    font-variation-settings: "opsz" 36, "SOFT" 50;
  }
  .team-role {
    font-size: 13px;
    color: var(--accent);
    font-weight: 600;
    margin-top: 2px;
    margin-bottom: 8px;
  }
  .team-cert {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-family: var(--font-mono);
    color: var(--text-dim);
    letter-spacing: 0.04em;
    background: var(--accent-soft);
    padding: 4px 10px;
    border-radius: 6px;
    margin-bottom: 12px;
  }
  .team-cert svg { width: 14px; height: 14px; color: var(--accent); }
  .team-quote {
    font-style: italic;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-soft);
    margin-bottom: 12px;
  }
  .team-specs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .team-specs span {
    font-size: 11px;
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
    padding: 4px 10px;
    border-radius: 6px;
    background: var(--bg-warm);
    color: var(--text-dim);
  }

  /* ========================================
     STUDIO TOUR / AUSSTATTUNG
     ======================================== */
  .studio-tour { background: var(--bg); }
  .studio-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }
  .studio-item {
    background: var(--bg-warm);
    border-radius: 20px;
    padding: 32px;
    border: 1px solid var(--border);
    transition: all 0.4s var(--smooth);
  }
  .studio-item:hover {
    border-color: var(--border-hover);
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
  }
  .studio-icon {
    width: 52px; height: 52px;
    background: var(--accent-soft);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
    color: var(--accent);
  }
  .studio-icon svg { width: 26px; height: 26px; }
  .studio-item h3 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 18px;
    margin-bottom: 8px;
    font-variation-settings: "opsz" 36, "SOFT" 50;
  }
  .studio-item p {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-soft);
  }

  /* ========================================
     TESTIMONIALS
     ======================================== */
  .testimonials { background: var(--bg-warm); }
  .testi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }
  .testi-card {
    background: var(--bg);
    border-radius: 20px;
    padding: 32px;
    border: 1px solid var(--border);
    transition: all 0.4s var(--smooth);
  }
  .testi-card:hover {
    border-color: var(--border-hover);
    box-shadow: var(--shadow-soft);
  }
  .testi-rating {
    display: flex; gap: 3px;
    margin-bottom: 16px;
  }
  .testi-rating svg {
    width: 18px; height: 18px;
    fill: var(--accent);
  }
  .testi-quote {
    font-size: 15px;
    line-height: 1.6;
    color: var(--text-soft);
    margin-bottom: 20px;
    font-style: italic;
  }
  .testi-author {
    display: flex; align-items: center; gap: 12px;
  }
  .testi-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: var(--accent-soft);
    color: var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700;
    font-size: 14px;
    font-family: var(--font-display);
  }
  .testi-info .name {
    font-weight: 600;
    font-size: 14px;
  }
  .testi-info .meta {
    font-size: 12px;
    color: var(--text-dim);
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
  }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section { background: var(--bg); }
  .faq-grid { max-width: 720px; margin: 0 auto; }
  .faq-item { border-bottom: 1px solid var(--border); }
  .faq-q {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    background: none;
    border: none;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    text-align: left;
    transition: color 0.25s;
  }
  .faq-q:hover { color: var(--accent); }
  .faq-icon {
    font-size: 1.3rem;
    color: var(--accent);
    transition: transform 0.3s;
    flex-shrink: 0;
    margin-left: 16px;
  }
  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s ease, padding 0.35s ease;
    color: var(--text-soft);
    font-size: 0.92rem;
    line-height: 1.6;
  }
  .faq-item.open .faq-a { max-height: 300px; padding-bottom: 20px; }
  .faq-item.open .faq-icon { transform: rotate(45deg); }

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
  .location-detail {
    display: flex; gap: 14px; align-items: flex-start;
    margin-bottom: 20px;
  }
  .location-detail .icon {
    width: 40px; height: 40px;
    background: var(--accent-soft);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .location-detail .icon svg { width: 20px; height: 20px; stroke-width: 1.5; color: var(--accent); }
  .location-detail .label {
    font-size: 12px;
    font-family: var(--font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-dim);
    margin-bottom: 2px;
  }
  .location-detail .value {
    font-size: 15px;
    color: var(--text);
  }

  .location-map {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    background: var(--bg);
    border: 1px solid var(--border);
    aspect-ratio: 4/3;
  }
  .map-svg {
    width: 100%; height: 100%;
    position: absolute; top: 0; left: 0;
  }
  .map-block {
    fill: var(--bg-warm-2);
    stroke: var(--border);
    stroke-width: 1;
  }
  .map-water { fill: ${hexToRgba(accent, 0.08)}; }
  .map-street-major {
    stroke: var(--bg-warm);
    stroke-width: 6;
    stroke-linecap: round;
  }
  .map-street {
    stroke: var(--bg-warm);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-dasharray: 8 4;
  }
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
    background: ${hexToRgba(accent, 0.15)};
    animation: mapPulse 2.5s infinite;
  }
  @keyframes mapPulse {
    0%   { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
  }
  .map-pin-circle {
    width: 44px; height: 44px;
    background: var(--accent);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 16px ${hexToRgba(accent, 0.35)};
    position: relative; z-index: 1;
  }
  .map-pin-circle svg { width: 22px; height: 22px; color: var(--white); stroke-width: 2; }
  .map-overlay {
    position: absolute;
    bottom: 16px; left: 16px;
    background: ${hexToRgba('#ffffff', 0.92)};
    backdrop-filter: blur(12px);
    border-radius: 12px;
    padding: 12px 16px;
    z-index: 2;
  }
  .map-overlay .label {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 14px;
    font-variation-settings: "opsz" 36, "SOFT" 50;
  }
  .map-overlay .name {
    font-size: 12px;
    color: var(--text-dim);
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
  }

  /* ========================================
     FINAL CTA / KONTAKTFORMULAR
     ======================================== */
  .final-cta {
    padding: 80px 0 100px;
    background: var(--bg);
  }
  .final-cta-inner {
    background: var(--text);
    border-radius: 32px;
    padding: 64px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .final-cta-inner::before {
    content: '';
    position: absolute;
    top: -100px; right: -100px;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, ${hexToRgba(accent, 0.15)} 0%, transparent 70%);
    pointer-events: none;
  }
  .final-cta-inner .display {
    color: ${hexToRgba(bg, 0.95)};
    font-size: clamp(28px, 4vw, 48px);
    margin-bottom: 16px;
  }
  .final-cta-inner .display em { color: var(--accent); }
  .final-cta-inner > p {
    color: ${hexToRgba(bg, 0.6)};
    font-size: 17px;
    max-width: 480px;
    margin: 0 auto 32px;
    line-height: 1.65;
  }

  .cta-form {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    max-width: 560px;
    margin: 0 auto;
    position: relative;
  }
  .cta-form input, .cta-form textarea {
    flex: 1 1 calc(50% - 6px);
    padding: 14px 18px;
    border-radius: 12px;
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
    .courses-grid, .team-grid, .studio-grid { grid-template-columns: repeat(2, 1fr); }
    .pricing-grid, .testi-grid { grid-template-columns: 1fr; max-width: 540px; margin-left: auto; margin-right: auto; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .location-grid { grid-template-columns: 1fr; }
    .class-row { grid-template-columns: 80px 1fr auto; gap: 16px; }
    .class-level, .class-spots { display: none; }
  }
  @media (max-width: 768px) {
    section { padding: 64px 0; }
    .container { padding: 0 20px; }
    .hero { padding: 40px 0 64px; }
    .hero-grid { grid-template-columns: 1fr; gap: 40px; }
    .hero h1 { font-size: clamp(36px, 10vw, 52px); }
    .hero-stats { grid-template-columns: 1fr 1fr; }
    .hero-visual { aspect-ratio: 3/4; }
    .courses-grid, .team-grid, .studio-grid { grid-template-columns: 1fr; }
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
      ${c.courses.length > 0 ? '<a href="#courses">Kurse</a>' : ''}
      ${c.schedule && c.schedule.length > 0 ? '<a href="#schedule">Stundenplan</a>' : ''}
      ${c.pricing.length > 0 ? '<a href="#pricing">Preise</a>' : ''}
      ${c.team.length > 0 ? '<a href="#team">Team</a>' : ''}
      ${c.studioTour.length > 0 ? '<a href="#studio">Studio</a>' : ''}
      <a href="#location">Standort</a>
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
        ${c.schedule && c.schedule.length > 0 ? '<a href="#schedule" class="btn btn-ghost">Stundenplan ansehen</a>' : ''}
      </div>
      ${c.stats.length > 0 ? `<div class="hero-stats">
        ${c.stats.map(s => `<div class="hero-stat"><div class="num">${e(s.value)}</div><div class="label">${e(s.label)}</div></div>`).join('\n        ')}
      </div>` : ''}
    </div>
    <div class="hero-visual" role="img" aria-label="Reformer-Training im Studio">
      <div class="live-badge">
        <div class="live-label"><span class="live-dot"></span>Gerade aktiv</div>
        <div class="live-count" id="liveCount">8</div>
        <div class="live-sub">Im Studio</div>
      </div>
    </div>
  </div>
</section>

${coursesHtml}

${scheduleHtml}

${pricingHtml}

${teamHtml}

${studioTourHtml}

${reviewsHtml}

${locationHtml}

${faqHtml}

<!-- ====== FINAL CTA / KONTAKTFORMULAR ====== -->
<section id="cta" class="final-cta" aria-label="Kontakt">
  <div class="container">
    <div class="final-cta-inner">
      <h2 class="display">Bereit f\u00fcr deine <em>Probestunde?</em></h2>
      <p>Schreib uns und wir finden gemeinsam das passende Pilates-Format f\u00fcr dich \u2014 ob Reformer, Matte oder Tower.</p>
      <form class="cta-form" onsubmit="return false" aria-label="Kontaktformular">
        <input type="text" name="name" placeholder="Dein Name" required aria-label="Name">
        <input type="email" name="email" placeholder="Deine E-Mail" required aria-label="E-Mail">
        <input type="tel" name="phone" placeholder="Telefonnummer (optional)" aria-label="Telefon">
        <textarea name="message" placeholder="Was interessiert dich? Reformer, Matte, Prenatal, Reha-Pilates..." required aria-label="Nachricht"></textarea>
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
          ${c.courses.slice(0, 5).map(p => `<li><a href="#courses">${e(p.title)}</a></li>`).join('\n          ')}
          ${c.schedule && c.schedule.length > 0 ? '<li><a href="#schedule">Stundenplan</a></li>' : ''}
        </ul>
      </div>
      <div class="footer-col">
        <h4>Studio</h4>
        <ul>
          ${c.team.length > 0 ? '<li><a href="#team">Unser Team</a></li>' : ''}
          ${c.studioTour.length > 0 ? '<li><a href="#studio">Ausstattung</a></li>' : ''}
          ${c.pricing.length > 0 ? '<li><a href="#pricing">Preise</a></li>' : ''}
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
    var current = 8;
    setInterval(function() {
      var delta = Math.floor(Math.random() * 3) - 1;
      current = Math.max(3, Math.min(14, current + delta));
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

  /* FAQ accordion */
  (function faqAccordion() {
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
  })();

  /* Smooth reveal on scroll */
  (function scrollReveal() {
    var cards = document.querySelectorAll('.course-card, .price-card, .team-card, .testi-card, .class-row, .studio-item, .faq-item');
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
<div id="cookie-banner" role="dialog" aria-label="Cookie-Hinweis" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba('#ffffff', 0.97)};backdrop-filter:blur(16px);color:var(--text);padding:16px 24px;font-size:.85rem;line-height:1.6;border-top:1px solid ${hexToRgba(primary, 0.08)};box-shadow:0 -4px 24px ${hexToRgba(primary, 0.06)}">
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
