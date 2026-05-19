/* eslint-disable @typescript-eslint/no-unused-vars */
// Yoga Premium Template — Mantra Studio Berlin-Mitte
// Ruhig, achtsam, premium, spirituell-modern
// Antikrosa (#c4907a) Primary, Off-White (#faf8f5) BG, Salbei (#7a9a78) Akzent

export interface YogaPremiumConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Antikrosa
    background: string // Off-White
    accent: string     // Salbei
    text: string       // Dark text
  }
  phone?: string
  email?: string
  address?: string
  stats: { value: string; label: string }[]
  yogaStyles: { icon: string; name: string; sanskrit?: string; description: string; level: string; duration: string }[]
  schedule: { day: string; classes: { time: string; style: string; teacher: string; level: string; duration: string }[] }[]
  pricing: { name: string; price: string; period: string; features: string[]; highlighted?: boolean; ctaText: string }[]
  teachers: { name: string; title: string; certifications: string[]; specialities: string[]; imageUrl?: string; quote?: string; experience?: string }[]
  about: { headline: string; text: string; philosophy?: string; features?: { icon: string; title: string; text: string }[] }
  reviews: { text: string; name: string; detail: string; rating: number }[]
  onlineTeaser?: { headline: string; text: string; features: string[]; ctaText: string; ctaUrl?: string }
  faq: { question: string; answer: string }[]
  openingHours?: string
  locationText?: string
  heroImageUrl?: string
  footerText?: string
  imprintUrl?: string
  privacyUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
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

const lotusSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21c-4-4-8-7.5-8-11.5C4 5.5 7.5 3 12 3s8 2.5 8 6.5c0 4-4 7.5-8 11.5z"/><path d="M12 3c-2 3-3 6-3 9s1 6 3 9"/><path d="M12 3c2 3 3 6 3 9s-1 6-3 9"/></svg>'

export function renderYogaPremiumTemplate(config: YogaPremiumConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primary = c.colors.primary || '#c4907a'
  const bg = c.colors.background || '#faf8f5'
  const accent = c.colors.accent || '#7a9a78'
  const textColor = c.colors.text || '#3a3330'

  const primaryHover = darken(primary, 18)
  const primaryLight = lighten(primary, 40)
  const primarySoft = hexToRgba(primary, 0.1)
  const primaryGlow = hexToRgba(primary, 0.3)
  const accentHover = darken(accent, 18)
  const accentLight = lighten(accent, 40)
  const accentSoft = hexToRgba(accent, 0.1)
  const textSoft = hexToRgba(textColor, 0.65)
  const textDim = hexToRgba(textColor, 0.4)
  const borderColor = hexToRgba(textColor, 0.1)
  const borderHover = hexToRgba(primary, 0.3)
  const warmBg = darken(bg, 6)
  const warmBg2 = darken(bg, 10)

  const logoInitial = e(c.businessName.charAt(0).toUpperCase())
  const businessNameEsc = e(c.businessName)

  const heroVisualStyle = c.heroImageUrl
    ? `background: url('${e(c.heroImageUrl)}') center/cover no-repeat;`
    : `background: linear-gradient(180deg, transparent 50%, ${hexToRgba(textColor, 0.4)}), linear-gradient(135deg, ${lighten(primary, 50)} 0%, ${lighten(primary, 20)} 40%, ${primary} 100%);`

  const heroVisualAfter = c.heroImageUrl
    ? ''
    : `content: 'IMG: Yogapraxis im Morgenlicht'; position: absolute; bottom: 24px; left: 24px; font-family: var(--font-mono); font-size: 11px; color: rgba(255,255,255,0.6); letter-spacing: 0.08em;`

  // Level indicator
  const levelIndicator = (level: string): string => {
    const levels: Record<string, number> = { 'einsteiger': 1, 'alle stufen': 2, 'mittel': 2, 'fortgeschritten': 3, 'anfänger': 1 }
    const num = levels[level.toLowerCase()] || 2
    return `<span class="level-dots" title="${e(level)}">${Array(3).fill(0).map((_, i) => `<span class="dot${i < num ? ' active' : ''}"></span>`).join('')}</span>`
  }

  // Build yoga styles HTML
  const yogaStylesHtml = c.yogaStyles.length > 0 ? `
<!-- ====== YOGA STYLES ====== -->
<section id="yoga-styles" class="yoga-styles">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Unsere Praxis</span>
      <h2 class="display">Finde deinen <em>Yoga-Weg</em></h2>
      <p>Von dynamischem Vinyasa \u00fcber meditatives Yin bis hin zu kraftvollem Ashtanga \u2014 entdecke die Vielfalt authentischer Yoga-Traditionen.</p>
    </div>
    <div class="styles-grid">
      ${c.yogaStyles.map(s => `<div class="style-card">
        <div class="style-icon">
          ${s.icon}
        </div>
        <h3>${e(s.name)}</h3>
        ${s.sanskrit ? `<div class="style-sanskrit">${e(s.sanskrit)}</div>` : ''}
        <p>${e(s.description)}</p>
        <div class="style-meta">
          <span class="style-level">${levelIndicator(s.level)}<span class="level-text">${e(s.level)}</span></span>
          <span class="style-duration">${e(s.duration)}</span>
        </div>
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
      <h2 class="display">Dein Weg auf die <em>Matte</em></h2>
      <p>Vinyasa, Hatha, Yin, Ashtanga, Restorative &amp; Pranayama \u2014 jeden Tag frisch f\u00fcr dich zusammengestellt.</p>
    </div>

    <div class="schedule-tabs" id="dayTabs">
      ${c.schedule.map((s, i) => `<button class="day-tab${i === 0 ? ' active' : ''}" data-day="${e(s.day)}">${e(s.day)}</button>`).join('\n      ')}
    </div>

    ${c.schedule.map((s, dayIdx) => `<div class="schedule-list" data-schedule-day="${e(s.day)}" style="${dayIdx > 0 ? 'display:none' : ''}">
      ${s.classes.map(cls => `<div class="class-row">
        <div class="class-time">${e(cls.time)}</div>
        <div class="class-info">
          <h4>${e(cls.style)}</h4>
          <div class="teacher-name">mit ${e(cls.teacher)}</div>
        </div>
        <div class="class-level">${levelIndicator(cls.level)}<span class="level-label">${e(cls.level)}</span></div>
        <div class="class-duration">${e(cls.duration)}</div>
        <button class="class-book">Platz reservieren</button>
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
      <h2 class="display">Investiere in deine <em>Praxis</em></h2>
      <p>Ob Drop-in, 10er-Karte oder Monats-Flat \u2014 finde die Mitgliedschaft, die zu deinem Rhythmus passt.</p>
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

  // Build teachers HTML
  const teachersHtml = c.teachers.length > 0 ? `
<!-- ====== LEHRER ====== -->
<section id="teachers" class="teachers">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Unsere Lehrer</span>
      <h2 class="display">Gef\u00fchrt von <em>Erfahrung</em></h2>
      <p>Zertifizierte Yogalehrer\u00b7innen mit RYT-200, RYT-500 und BDY-Ausbildung \u2014 authentisch und leidenschaftlich.</p>
    </div>
    <div class="teachers-grid">
      ${c.teachers.map((t, i) => `<div class="teacher-card">
        <div class="teacher-img" ${t.imageUrl ? `style="background: url('${e(t.imageUrl)}') center/cover no-repeat;"` : `style="background: linear-gradient(160deg, ${lighten(primary, 40 + i * 10)}, ${lighten(accent, 20 + i * 8)});"`}>
          <div class="teacher-overlay">
            ${t.quote ? `<p class="teacher-quote">\u201E${e(t.quote)}\u201C</p>` : ''}
          </div>
        </div>
        <div class="teacher-body">
          <div class="teacher-name-row">
            <h3>${e(t.name)}</h3>
            <span class="teacher-title">${e(t.title)}</span>
          </div>
          ${t.experience ? `<div class="teacher-experience">${e(t.experience)}</div>` : ''}
          <div class="teacher-certs">
            ${t.certifications.map(cert => `<span class="cert-badge">${e(cert)}</span>`).join('')}
          </div>
          <div class="teacher-specs">
            ${t.specialities.map(s => `<span>${e(s)}</span>`).join('')}
          </div>
        </div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>` : ''

  // Build about HTML
  const aboutHtml = `
<!-- ====== \u00dcBER UNS ====== -->
<section id="about" class="about">
  <div class="container">
    <div class="about-grid">
      <div class="about-content">
        <span class="eyebrow">\u00dcber uns</span>
        <h2 class="display">${e(c.about.headline)}</h2>
        <p class="about-text">${e(c.about.text)}</p>
        ${c.about.philosophy ? `<blockquote class="philosophy">
          <span class="philosophy-mark">\u201E</span>
          ${e(c.about.philosophy)}
        </blockquote>` : ''}
      </div>
      ${c.about.features && c.about.features.length > 0 ? `<div class="about-features">
        ${c.about.features.map(f => `<div class="about-feature">
          <div class="about-feature-icon">${f.icon}</div>
          <div>
            <h4>${e(f.title)}</h4>
            <p>${e(f.text)}</p>
          </div>
        </div>`).join('\n        ')}
      </div>` : ''}
    </div>
  </div>
</section>`

  // Build reviews HTML
  const reviewsHtml = c.reviews.length > 0 ? `
<!-- ====== BEWERTUNGEN ====== -->
<section class="testimonials">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Stimmen der Sangha</span>
      <h2 class="display">Was unsere <em>Community</em> sagt</h2>
      <p>Erfahrungen von Praktizierenden, die ihren Weg bei uns gefunden haben.</p>
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

  // Build online teaser HTML
  const onlineTeaserHtml = c.onlineTeaser ? `
<!-- ====== ONLINE-KURSE TEASER ====== -->
<section class="online-teaser">
  <div class="container">
    <div class="online-inner">
      <div class="online-content">
        <span class="eyebrow">Online Studio</span>
        <h2 class="display">${e(c.onlineTeaser.headline)}</h2>
        <p>${e(c.onlineTeaser.text)}</p>
        <ul class="online-features">
          ${c.onlineTeaser.features.map(f => `<li>${checkSvg}${e(f)}</li>`).join('\n          ')}
        </ul>
        <a href="${e(c.onlineTeaser.ctaUrl || '#cta')}" class="btn btn-accent">${e(c.onlineTeaser.ctaText)}</a>
      </div>
      <div class="online-visual">
        <div class="online-visual-inner">
          <div class="online-play">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <div class="online-badge">Live &amp; On-Demand</div>
        </div>
      </div>
    </div>
  </div>
</section>` : ''

  // Build FAQ HTML
  const faqHtml = c.faq.length > 0 ? `
<!-- ====== FAQ ====== -->
<section id="faq" class="faq-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">H\u00e4ufige Fragen</span>
      <h2 class="display">Noch <em>Fragen?</em></h2>
      <p>Hier findest du Antworten zu Probestunde, Asana-Praxis, Vorkenntnissen und mehr.</p>
    </div>
    <div class="faq-list">
      ${c.faq.map((f, i) => `<div class="faq-item">
        <button class="faq-trigger" aria-expanded="false" aria-controls="faq-${i}">
          <span>${e(f.question)}</span>
          <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="faq-content" id="faq-${i}" role="region" hidden>
          <p>${e(f.answer)}</p>
        </div>
      </div>`).join('\n      ')}
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
      <h2 class="display">${c.locationText ? e(c.locationText) : `Finde zu uns nach <em>Berlin-Mitte</em>`}</h2>

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
          <div class="value">${e(c.email)}</div>
        </div>
      </div>` : ''}
    </div>

    <div class="location-map">
      <div class="map-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>${c.address ? e(c.address) : 'Berlin-Mitte'}</span>
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
    ...(c.address && { address: { '@type': 'PostalAddress', streetAddress: c.address, addressLocality: 'Berlin', addressRegion: 'Berlin', addressCountry: 'DE' } }),
    ...(c.phone && { telephone: c.phone }),
    ...(c.email && { email: c.email }),
    ...(c.openingHours && { openingHours: c.openingHours }),
    ...(c.heroImageUrl && { image: c.heroImageUrl }),
    priceRange: '\u20AC\u20AC',
    sport: 'Yoga',
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
    --bg-warm:       ${warmBg};
    --bg-warm-2:     ${warmBg2};
    --accent:        ${accent};
    --accent-hover:  ${accentHover};
    --accent-light:  ${accentLight};
    --accent-soft:   ${accentSoft};
    --text:          ${textColor};
    --text-soft:     ${textSoft};
    --text-dim:      ${textDim};
    --border:        ${borderColor};
    --border-hover:  ${borderHover};
    --white:         #ffffff;

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
    color: var(--primary);
    font-variation-settings: "opsz" 144, "SOFT" 80;
  }

  .eyebrow {
    color: var(--primary);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 32px;
  }
  section {
    padding: 96px 0;
  }

  .section-head {
    text-align: center;
    margin-bottom: 64px;
  }
  .section-head .eyebrow {
    display: block;
    margin-bottom: 12px;
  }
  .section-head h2 {
    font-size: clamp(32px, 5vw, 56px);
    margin-bottom: 16px;
  }
  .section-head p {
    max-width: 580px;
    margin: 0 auto;
    color: var(--text-soft);
    font-size: 16px;
    line-height: 1.7;
  }

  /* ========================================
     BUTTONS
     ======================================== */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 16px 28px;
    border: none;
    border-radius: 999px;
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s var(--smooth);
    text-decoration: none;
    position: relative;
    overflow: hidden;
    letter-spacing: 0.01em;
  }
  .btn svg {
    width: 16px;
    height: 16px;
    transition: transform 0.3s var(--smooth);
  }
  .btn:hover svg { transform: translateX(3px); }

  .btn-primary {
    background: var(--primary);
    color: var(--white);
    box-shadow: 0 4px 16px var(--primary-glow);
  }
  .btn-primary::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%);
    border-radius: inherit;
  }
  .btn-primary:hover {
    background: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px var(--primary-glow);
  }

  .btn-ghost {
    background: transparent;
    color: var(--text);
    border: 1.5px solid var(--border);
  }
  .btn-ghost:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: var(--primary-soft);
  }

  .btn-accent {
    background: var(--accent);
    color: var(--white);
    box-shadow: 0 4px 16px ${hexToRgba(accent, 0.3)};
  }
  .btn-accent:hover {
    background: var(--accent-hover);
    transform: translateY(-2px);
  }

  /* ========================================
     ANNOUNCE BAR
     ======================================== */
  .announce {
    background: var(--text);
    color: ${hexToRgba(bg, 0.85)};
    text-align: center;
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  /* ========================================
     NAVIGATION
     ======================================== */
  nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background: ${hexToRgba(bg, 0.92)};
    backdrop-filter: blur(20px) saturate(1.8);
    -webkit-backdrop-filter: blur(20px) saturate(1.8);
    border-bottom: 1px solid var(--border);
  }
  .nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 32px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.015em;
    font-variation-settings: "opsz" 48, "SOFT" 60;
  }
  .logo-mark {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: var(--primary);
    color: var(--white);
    font-size: 16px;
    font-weight: 700;
    font-family: var(--font-display);
  }
  .nav-links {
    display: flex;
    gap: 28px;
  }
  .nav-links a {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-soft);
    transition: color 0.2s;
    letter-spacing: 0.01em;
  }
  .nav-links a:hover { color: var(--primary); }
  .nav-cta {
    padding: 10px 22px;
    background: var(--primary);
    color: var(--white);
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s;
    box-shadow: 0 2px 8px var(--primary-glow);
  }
  .nav-cta:hover { background: var(--primary-hover); transform: translateY(-1px); }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    padding: 48px 0 96px;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, var(--primary-soft) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  .hero::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, var(--accent-soft) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  .hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--primary-soft);
    color: var(--primary);
    padding: 6px 16px 6px 10px;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.06em;
    margin-bottom: 24px;
    text-transform: uppercase;
  }
  .hero-tag .pulse {
    width: 8px; height: 8px;
    background: var(--accent);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.4); }
  }
  .hero h1 {
    font-size: clamp(42px, 6vw, 72px);
    letter-spacing: -0.035em;
    margin-bottom: 20px;
    line-height: 1.05;
  }
  .hero-lead {
    font-size: 17px;
    color: var(--text-soft);
    max-width: 480px;
    line-height: 1.7;
    margin-bottom: 32px;
  }
  .cta-row {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 48px;
  }
  .hero-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    padding-top: 32px;
    border-top: 1px solid var(--border);
  }
  .hero-stat .num {
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 700;
    color: var(--primary);
    letter-spacing: -0.02em;
    font-variation-settings: "opsz" 48, "SOFT" 30;
  }
  .hero-stat .label {
    font-size: 12px;
    color: var(--text-dim);
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-top: 4px;
  }

  .hero-visual {
    aspect-ratio: 4/5;
    border-radius: 24px;
    overflow: hidden;
    position: relative;
    ${heroVisualStyle}
    box-shadow: var(--shadow-image);
  }
  .hero-visual::after {
    ${heroVisualAfter}
  }

  .breath-badge {
    position: absolute;
    bottom: 24px;
    left: 24px;
    background: ${hexToRgba('#ffffff', 0.95)};
    backdrop-filter: blur(12px);
    padding: 14px 20px;
    border-radius: 16px;
    box-shadow: var(--shadow-card);
  }
  .breath-label {
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-dim);
    margin-bottom: 6px;
  }
  .breath-circle {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: var(--accent);
    animation: breathe 8s ease-in-out infinite;
    margin: 0 auto;
  }
  @keyframes breathe {
    0%, 100% { transform: scale(0.6); opacity: 0.5; }
    50% { transform: scale(1); opacity: 1; }
  }
  .breath-text {
    font-size: 12px;
    color: var(--text-soft);
    margin-top: 8px;
    text-align: center;
    font-weight: 500;
  }

  /* ========================================
     YOGA STYLES
     ======================================== */
  .yoga-styles {
    background: var(--bg-warm);
  }
  .styles-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .style-card {
    background: var(--white);
    padding: 36px 28px;
    border-radius: 20px;
    border: 1px solid var(--border);
    transition: all 0.4s var(--smooth);
    position: relative;
    overflow: hidden;
  }
  .style-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 3px;
    background: linear-gradient(90deg, var(--primary), var(--accent));
    opacity: 0;
    transition: opacity 0.4s;
  }
  .style-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
    border-color: var(--border-hover);
  }
  .style-card:hover::before { opacity: 1; }
  .style-icon {
    width: 48px; height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-soft);
    border-radius: 14px;
    margin-bottom: 20px;
    color: var(--primary);
  }
  .style-icon svg { width: 24px; height: 24px; }
  .style-card h3 {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 4px;
    font-variation-settings: "opsz" 48, "SOFT" 40;
  }
  .style-sanskrit {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--primary);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .style-card p {
    font-size: 14px;
    color: var(--text-soft);
    line-height: 1.65;
    margin-bottom: 16px;
  }
  .style-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 14px;
    border-top: 1px solid var(--border);
    font-size: 12px;
    color: var(--text-dim);
  }
  .style-level {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .level-dots {
    display: flex;
    gap: 4px;
  }
  .level-dots .dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--border);
    transition: background 0.3s;
  }
  .level-dots .dot.active {
    background: var(--primary);
  }
  .level-text, .level-label {
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .style-duration {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.04em;
  }

  /* ========================================
     STUNDENPLAN / SCHEDULE
     ======================================== */
  .schedule-tabs {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin-bottom: 40px;
    background: var(--bg-warm);
    padding: 4px;
    border-radius: 16px;
    max-width: fit-content;
    margin-left: auto;
    margin-right: auto;
  }
  .day-tab {
    padding: 12px 22px;
    border: none;
    background: transparent;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 12px;
    color: var(--text-soft);
    transition: all 0.25s var(--smooth);
  }
  .day-tab.active {
    background: var(--primary);
    color: var(--white);
    box-shadow: 0 4px 12px var(--primary-glow);
  }
  .day-tab:hover:not(.active) {
    color: var(--primary);
    background: var(--primary-soft);
  }
  .schedule-list {
    max-width: 900px;
    margin: 0 auto;
  }
  .class-row {
    display: grid;
    grid-template-columns: 80px 1fr auto auto auto;
    gap: 20px;
    align-items: center;
    padding: 20px 24px;
    background: var(--white);
    border-radius: 14px;
    border: 1px solid var(--border);
    margin-bottom: 8px;
    transition: all 0.3s var(--smooth);
  }
  .class-row:hover {
    border-color: var(--border-hover);
    box-shadow: var(--shadow-soft);
    transform: translateX(4px);
  }
  .class-time {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    color: var(--primary);
    font-variation-settings: "opsz" 48, "SOFT" 30;
  }
  .class-info h4 {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 600;
    font-variation-settings: "opsz" 32, "SOFT" 40;
  }
  .teacher-name, .class-info .teacher-name {
    font-size: 13px;
    color: var(--text-soft);
    margin-top: 2px;
  }
  .class-level {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .class-duration {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-dim);
    letter-spacing: 0.04em;
  }
  .class-book {
    padding: 10px 20px;
    border: 1.5px solid var(--primary);
    background: transparent;
    color: var(--primary);
    font-size: 12px;
    font-weight: 600;
    font-family: var(--font-body);
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .class-book:hover {
    background: var(--primary);
    color: var(--white);
  }

  /* ========================================
     PRICING
     ======================================== */
  .pricing {
    background: var(--bg-warm);
  }
  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    max-width: 960px;
    margin: 0 auto;
  }
  .price-card {
    background: var(--white);
    border-radius: 20px;
    padding: 36px 28px;
    border: 1px solid var(--border);
    position: relative;
    display: flex;
    flex-direction: column;
    transition: all 0.4s var(--smooth);
  }
  .price-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
  }
  .price-card.featured {
    border-color: var(--primary);
    box-shadow: 0 8px 40px var(--primary-glow);
  }
  .price-card.featured:hover {
    box-shadow: 0 12px 48px var(--primary-glow);
  }
  .price-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--primary);
    color: var(--white);
    padding: 4px 16px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .price-name {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 8px;
    text-align: center;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .price-amount {
    text-align: center;
    margin-bottom: 28px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border);
  }
  .price-amount .num {
    font-family: var(--font-display);
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text);
    font-variation-settings: "opsz" 144, "SOFT" 30;
  }
  .price-amount .currency {
    font-size: 20px;
    color: var(--text-soft);
    margin-left: 2px;
    font-weight: 500;
  }
  .price-amount .period {
    font-size: 14px;
    color: var(--text-dim);
    margin-left: 4px;
  }
  .price-features {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    margin-bottom: 28px;
  }
  .price-features li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 14px;
    color: var(--text-soft);
    line-height: 1.5;
  }
  .price-features li svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: var(--accent);
    margin-top: 1px;
  }
  .price-cta {
    width: 100%;
    padding: 14px 24px;
    border: 1.5px solid var(--primary);
    background: transparent;
    color: var(--primary);
    font-size: 14px;
    font-weight: 600;
    font-family: var(--font-body);
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.25s var(--smooth);
  }
  .price-cta:hover {
    background: var(--primary);
    color: var(--white);
  }
  .price-card.featured .price-cta {
    background: var(--primary);
    color: var(--white);
    border-color: var(--primary);
  }
  .price-card.featured .price-cta:hover {
    background: var(--primary-hover);
    border-color: var(--primary-hover);
  }

  /* ========================================
     TEACHERS
     ======================================== */
  .teachers-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }
  .teacher-card {
    background: var(--white);
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid var(--border);
    transition: all 0.4s var(--smooth);
  }
  .teacher-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
    border-color: var(--border-hover);
  }
  .teacher-img {
    height: 300px;
    position: relative;
    overflow: hidden;
  }
  .teacher-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 60px 24px 20px;
    background: linear-gradient(transparent, ${hexToRgba(textColor, 0.7)});
    opacity: 0;
    transition: opacity 0.4s;
  }
  .teacher-card:hover .teacher-overlay { opacity: 1; }
  .teacher-quote {
    color: ${hexToRgba('#ffffff', 0.9)};
    font-family: var(--font-display);
    font-size: 14px;
    font-style: italic;
    line-height: 1.5;
    font-variation-settings: "opsz" 32, "SOFT" 80;
  }
  .teacher-body {
    padding: 24px;
  }
  .teacher-name-row {
    margin-bottom: 8px;
  }
  .teacher-name-row h3 {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 600;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .teacher-title {
    font-size: 13px;
    color: var(--primary);
    font-weight: 500;
  }
  .teacher-experience {
    font-size: 12px;
    color: var(--text-dim);
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
    margin-bottom: 12px;
  }
  .teacher-certs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }
  .cert-badge {
    display: inline-flex;
    padding: 3px 10px;
    background: var(--accent-soft);
    color: var(--accent);
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
  }
  .teacher-specs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .teacher-specs span {
    display: inline-flex;
    padding: 3px 10px;
    background: var(--bg-warm);
    color: var(--text-soft);
    border-radius: 999px;
    font-size: 11px;
    font-weight: 500;
  }

  /* ========================================
     ABOUT
     ======================================== */
  .about {
    background: var(--bg-warm);
  }
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: start;
  }
  .about-content .eyebrow {
    display: block;
    margin-bottom: 12px;
  }
  .about-content h2 {
    font-size: clamp(32px, 4vw, 48px);
    margin-bottom: 20px;
  }
  .about-text {
    font-size: 16px;
    color: var(--text-soft);
    line-height: 1.75;
    margin-bottom: 28px;
  }
  .philosophy {
    border-left: 3px solid var(--primary);
    padding: 20px 24px;
    background: var(--white);
    border-radius: 0 12px 12px 0;
    font-family: var(--font-display);
    font-size: 18px;
    font-style: italic;
    line-height: 1.6;
    color: var(--text);
    position: relative;
    font-variation-settings: "opsz" 48, "SOFT" 80;
  }
  .philosophy-mark {
    font-size: 48px;
    color: var(--primary);
    line-height: 1;
    position: absolute;
    top: 8px;
    left: 16px;
    opacity: 0.3;
  }
  .about-features {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .about-feature {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    background: var(--white);
    padding: 24px;
    border-radius: 16px;
    border: 1px solid var(--border);
    transition: all 0.3s var(--smooth);
  }
  .about-feature:hover {
    border-color: var(--border-hover);
    box-shadow: var(--shadow-soft);
  }
  .about-feature-icon {
    width: 44px; height: 44px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-soft);
    border-radius: 12px;
    color: var(--primary);
  }
  .about-feature-icon svg { width: 22px; height: 22px; }
  .about-feature h4 {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
    font-variation-settings: "opsz" 32, "SOFT" 40;
  }
  .about-feature p {
    font-size: 14px;
    color: var(--text-soft);
    line-height: 1.6;
  }

  /* ========================================
     TESTIMONIALS
     ======================================== */
  .testi-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .testi-card {
    background: var(--white);
    padding: 32px;
    border-radius: 20px;
    border: 1px solid var(--border);
    transition: all 0.4s var(--smooth);
  }
  .testi-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
  }
  .testi-rating {
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
  }
  .testi-rating svg {
    width: 16px;
    height: 16px;
    fill: var(--primary);
  }
  .testi-quote {
    font-family: var(--font-display);
    font-size: 15px;
    font-style: italic;
    line-height: 1.7;
    color: var(--text);
    margin-bottom: 20px;
    font-variation-settings: "opsz" 32, "SOFT" 60;
  }
  .testi-author {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .testi-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-light), var(--primary));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: var(--white);
    font-family: var(--font-body);
  }
  .testi-info .name {
    font-size: 14px;
    font-weight: 600;
  }
  .testi-info .meta {
    font-size: 12px;
    color: var(--text-dim);
  }

  /* ========================================
     ONLINE TEASER
     ======================================== */
  .online-teaser {
    background: var(--bg-warm);
  }
  .online-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
    background: var(--white);
    border-radius: 24px;
    padding: 56px;
    border: 1px solid var(--border);
  }
  .online-content .eyebrow {
    display: block;
    margin-bottom: 12px;
  }
  .online-content h2 {
    font-size: clamp(28px, 4vw, 40px);
    margin-bottom: 16px;
  }
  .online-content p {
    color: var(--text-soft);
    font-size: 15px;
    line-height: 1.7;
    margin-bottom: 24px;
  }
  .online-features {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 28px;
  }
  .online-features li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: var(--text-soft);
  }
  .online-features li svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: var(--accent);
  }
  .online-visual {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .online-visual-inner {
    width: 100%;
    aspect-ratio: 16/10;
    border-radius: 16px;
    background: linear-gradient(135deg, ${lighten(primary, 40)} 0%, ${lighten(accent, 30)} 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    position: relative;
  }
  .online-play {
    width: 64px; height: 64px;
    background: ${hexToRgba('#ffffff', 0.95)};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
    box-shadow: var(--shadow-card);
    transition: transform 0.3s var(--spring);
    cursor: pointer;
  }
  .online-play:hover { transform: scale(1.08); }
  .online-play svg { width: 28px; height: 28px; margin-left: 4px; }
  .online-badge {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    background: ${hexToRgba('#ffffff', 0.9)};
    padding: 6px 14px;
    border-radius: 999px;
    color: var(--text);
  }

  /* ========================================
     FAQ
     ======================================== */
  .faq-list {
    max-width: 720px;
    margin: 0 auto;
  }
  .faq-item {
    border-bottom: 1px solid var(--border);
  }
  .faq-trigger {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 24px 0;
    background: none;
    border: none;
    cursor: pointer;
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 600;
    color: var(--text);
    text-align: left;
    transition: color 0.2s;
    font-variation-settings: "opsz" 32, "SOFT" 40;
  }
  .faq-trigger:hover { color: var(--primary); }
  .faq-chevron {
    width: 20px; height: 20px;
    flex-shrink: 0;
    color: var(--text-dim);
    transition: transform 0.3s var(--smooth);
  }
  .faq-trigger[aria-expanded="true"] .faq-chevron {
    transform: rotate(180deg);
  }
  .faq-content {
    overflow: hidden;
    transition: max-height 0.4s var(--smooth), padding 0.4s var(--smooth);
  }
  .faq-content[hidden] {
    display: block;
    max-height: 0;
    padding: 0;
    overflow: hidden;
  }
  .faq-content:not([hidden]) {
    max-height: 500px;
    padding-bottom: 24px;
  }
  .faq-content p {
    font-size: 15px;
    color: var(--text-soft);
    line-height: 1.7;
  }

  /* ========================================
     LOCATION
     ======================================== */
  .location-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: start;
  }
  .location-info h2 {
    font-size: clamp(28px, 4vw, 42px);
    margin-bottom: 32px;
  }
  .location-detail {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    margin-bottom: 20px;
  }
  .location-detail .icon {
    width: 40px; height: 40px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-soft);
    border-radius: 12px;
  }
  .location-detail .icon svg {
    width: 20px; height: 20px;
    stroke-width: 1.5;
    color: var(--primary);
  }
  .location-detail .label {
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-dim);
    margin-bottom: 2px;
  }
  .location-detail .value {
    font-size: 14px;
    color: var(--text);
    line-height: 1.5;
  }
  .location-map {
    border-radius: 20px;
    overflow: hidden;
    aspect-ratio: 4/3;
    background: var(--bg-warm);
    border: 1px solid var(--border);
  }
  .map-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--text-dim);
  }
  .map-placeholder svg {
    width: 40px; height: 40px;
    color: var(--primary);
    opacity: 0.4;
  }
  .map-placeholder span {
    font-size: 13px;
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
  }

  /* ========================================
     FINAL CTA
     ======================================== */
  .final-cta {
    padding: 96px 0 120px;
  }
  .final-cta-inner {
    background: linear-gradient(135deg, ${primary} 0%, ${darken(primary, 30)} 100%);
    border-radius: 32px;
    padding: 72px 48px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .final-cta-inner::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
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
    color: var(--primary);
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
    .styles-grid { grid-template-columns: repeat(2, 1fr); }
    .teachers-grid { grid-template-columns: repeat(2, 1fr); }
    .pricing-grid, .testi-grid { grid-template-columns: 1fr; max-width: 540px; margin-left: auto; margin-right: auto; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .location-grid { grid-template-columns: 1fr; }
    .about-grid { grid-template-columns: 1fr; }
    .online-inner { grid-template-columns: 1fr; padding: 40px; }
    .class-row { grid-template-columns: 80px 1fr auto; gap: 16px; }
    .class-level, .class-duration { display: none; }
  }
  @media (max-width: 768px) {
    section { padding: 64px 0; }
    .container { padding: 0 20px; }
    .hero { padding: 40px 0 64px; }
    .hero-grid { grid-template-columns: 1fr; gap: 40px; }
    .hero h1 { font-size: clamp(36px, 10vw, 52px); }
    .hero-stats { grid-template-columns: 1fr 1fr; }
    .hero-visual { aspect-ratio: 3/4; }
    .styles-grid { grid-template-columns: 1fr; }
    .teachers-grid { grid-template-columns: 1fr; }
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
    .schedule-tabs { gap: 0; flex-wrap: wrap; }
    .day-tab { padding: 12px 16px; font-size: 11px; }
    .section-head { margin-bottom: 48px; }
    .section-head h2 { font-size: clamp(28px, 8vw, 40px); }
    .online-inner { padding: 32px 24px; }
    .online-visual-inner { aspect-ratio: 16/9; }
    .philosophy { padding: 16px 20px; font-size: 16px; }
    .teacher-img { height: 240px; }
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
      ${c.yogaStyles.length > 0 ? '<a href="#yoga-styles">Yoga-Stile</a>' : ''}
      ${c.schedule && c.schedule.length > 0 ? '<a href="#schedule">Stundenplan</a>' : ''}
      ${c.pricing.length > 0 ? '<a href="#pricing">Preise</a>' : ''}
      ${c.teachers.length > 0 ? '<a href="#teachers">Lehrer</a>' : ''}
      <a href="#about">\u00dcber uns</a>
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
        ${c.schedule && c.schedule.length > 0 ? '<a href="#schedule" class="btn btn-ghost">Stundenplan ansehen</a>' : ''}
      </div>
      ${c.stats.length > 0 ? `<div class="hero-stats">
        ${c.stats.map(s => `<div class="hero-stat"><div class="num">${e(s.value)}</div><div class="label">${e(s.label)}</div></div>`).join('\n        ')}
      </div>` : ''}
    </div>
    <div class="hero-visual" role="img" aria-label="Yoga-Praxis im Studio">
      <div class="breath-badge">
        <div class="breath-label">Surya Namaskar</div>
        <div class="breath-circle"></div>
        <div class="breath-text">Einatmen \u2026 Ausatmen</div>
      </div>
    </div>
  </div>
</section>

${yogaStylesHtml}

${scheduleHtml}

${pricingHtml}

${teachersHtml}

${aboutHtml}

${reviewsHtml}

${locationHtml}

${onlineTeaserHtml}

${faqHtml}

<!-- ====== FINAL CTA ====== -->
<section id="cta" class="final-cta" aria-label="Kontakt">
  <div class="container">
    <div class="final-cta-inner">
      <h2 class="display">Bereit f\u00fcr deine erste <em>Probestunde?</em></h2>
      <p>Schreib uns und wir finden gemeinsam den perfekten Yoga-Stil f\u00fcr dich. Deine erste Stunde geht auf uns \u2014 Namaste.</p>
      <form class="cta-form" onsubmit="return false" aria-label="Kontaktformular">
        <input type="text" name="name" placeholder="Dein Name" required aria-label="Name">
        <input type="email" name="email" placeholder="Deine E-Mail" required aria-label="E-Mail">
        <input type="tel" name="phone" placeholder="Telefonnummer (optional)" aria-label="Telefon">
        <textarea name="message" placeholder="Was interessiert dich? Vinyasa, Hatha, Yin, Ashtanga, Restorative, Pranayama..." required aria-label="Nachricht"></textarea>
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
          ${c.yogaStyles.slice(0, 6).map(s => `<li><a href="#yoga-styles">${e(s.name)}</a></li>`).join('\n          ')}
          ${c.schedule && c.schedule.length > 0 ? '<li><a href="#schedule">Stundenplan</a></li>' : ''}
        </ul>
      </div>
      <div class="footer-col">
        <h4>Studio</h4>
        <ul>
          ${c.teachers.length > 0 ? '<li><a href="#teachers">Unsere Lehrer</a></li>' : ''}
          ${c.pricing.length > 0 ? '<li><a href="#pricing">Preise</a></li>' : ''}
          <li><a href="#about">\u00dcber uns</a></li>
          <li><a href="#location">Standort</a></li>
          ${c.faq.length > 0 ? '<li><a href="#faq">FAQ</a></li>' : ''}
          ${c.instagramUrl ? `<li><a href="${e(c.instagramUrl)}" target="_blank" rel="noopener">Instagram</a></li>` : ''}
          ${c.youtubeUrl ? `<li><a href="${e(c.youtubeUrl)}" target="_blank" rel="noopener">YouTube</a></li>` : ''}
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
  /* Breath Animation Text */
  (function breathText() {
    var el = document.querySelector('.breath-text');
    if (!el) return;
    var phases = ['Einatmen \\u2026', 'Halten \\u2026', 'Ausatmen \\u2026', 'Halten \\u2026'];
    var idx = 0;
    setInterval(function() {
      idx = (idx + 1) % phases.length;
      el.textContent = phases[idx];
    }, 2000);
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
    var triggers = document.querySelectorAll('.faq-trigger');
    triggers.forEach(function(trigger) {
      trigger.addEventListener('click', function() {
        var expanded = this.getAttribute('aria-expanded') === 'true';
        var content = document.getElementById(this.getAttribute('aria-controls'));
        if (!content) return;
        this.setAttribute('aria-expanded', String(!expanded));
        if (expanded) {
          content.setAttribute('hidden', '');
        } else {
          content.removeAttribute('hidden');
        }
      });
    });
  })();

  /* Smooth reveal on scroll */
  (function scrollReveal() {
    var cards = document.querySelectorAll('.style-card, .price-card, .teacher-card, .testi-card, .class-row, .about-feature, .faq-item');
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
          form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="font-size:1.6rem;margin-bottom:12px;color:#fff">Namaste! Vielen Dank!</h3><p style="font-size:1.05rem;color:rgba(255,255,255,0.8)">Wir freuen uns auf dich und melden uns schnellstm\\u00f6glich.</p></div>';
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
