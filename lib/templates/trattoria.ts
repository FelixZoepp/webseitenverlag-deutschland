export interface TrattoriaConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // ersetzt --terracotta
    secondary: string  // ersetzt --olive
    accent: string     // ersetzt --gold
    background: string // ersetzt --cream
    text: string       // ersetzt --ink
  }
  phone?: string
  email?: string
  address?: string
  openingHours: { days: string; hours: string }[]
  menuCategories: { name: string; items: { name: string; description: string; price: string; tag?: string }[] }[]
  reviews: { text: string; name: string; source: string; rating: number }[]
  faqItems?: { question: string; answer: string }[]
  heroImageUrl?: string
  aboutTitle?: string
  aboutText?: string
  aboutText2?: string
  chefName?: string
  chefRole?: string
  chefQuote?: string
  features?: { icon: string; title: string; description: string }[]
  reservationEnabled?: boolean
  imprintUrl?: string
  privacyUrl?: string
  footerText?: string
  footerColumns?: { title: string; links: { label: string; href: string }[] }[]
  galleryItems?: { label: string; imageUrl?: string }[]
  aboutStats?: { value: string; label: string }[]
  locationTitle?: string
  locationSubtitle?: string
  locationDetails?: { icon: string; label: string; value: string }[]
  reserveTitle?: string
  reserveSubtitle?: string
  reserveFeatures?: string[]
  menuSectionTitle?: string
  menuSectionSubtitle?: string
  menuSectionDescription?: string
  reviewsSectionTitle?: string
  gallerySectionTitle?: string
  gallerySectionSubtitle?: string
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

export function renderTrattoriaTemplate(config: TrattoriaConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primaryDark = darkenHex(c.colors.primary, 0.25)
  const primarySoft = hexToRgba(c.colors.primary, 0.12)
  const secondaryDark = darkenHex(c.colors.secondary, 0.3)
  const bgTint = tintHex(c.colors.background, -0.03)
  const bgWarm = tintHex(c.colors.background, -0.06)
  const textSoft = tintHex(c.colors.text, 0.5)
  const borderColor = tintHex(c.colors.background, -0.1)

  const logoInitial = esc(c.businessName.charAt(0))

  // Menu tabs from categories
  const menuTabs = c.menuCategories.map((cat, i) =>
    `<button class="menu-tab${i === 0 ? ' active' : ''}" data-cat="${i}">${esc(cat.name)}</button>`
  ).join('\n      ')

  // Menu items — render all categories, show first one by default
  const menuItemsHtml = c.menuCategories.map((cat, catIdx) =>
    `<div class="menu-category" data-cat-content="${catIdx}" style="${catIdx === 0 ? '' : 'display:none'}">
      <div class="menu-grid">
        ${cat.items.map(item => `
        <div class="menu-item">
          <div class="menu-item-info">
            <h4>${esc(item.name)}</h4>
            <p>${esc(item.description)}</p>
            ${item.tag ? `<div class="tags"><span class="tag${item.tag.toLowerCase() === 'vegetarisch' ? ' vege' : item.tag.toLowerCase() === 'pikant' ? ' spicy' : item.tag.toLowerCase() === 'neu' ? ' new' : ''}">${esc(item.tag)}</span></div>` : ''}
          </div>
          <div class="menu-item-price">${esc(item.price)}</div>
        </div>`).join('')}
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
        <p class="review-text">"${esc(r.text)}"</p>
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

  // Gallery items
  const galleryItems = c.galleryItems || [
    { label: 'Impression 1' },
    { label: 'Impression 2' },
    { label: 'Impression 3' },
    { label: 'Impression 4' },
    { label: 'Impression 5' },
  ]
  const galleryLetters = ['a', 'b', 'c', 'd', 'e']
  const defaultGradients = [
    `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 60%, ${darkenHex(c.colors.primary, 0.4)} 100%)`,
    `linear-gradient(135deg, ${c.colors.accent} 0%, ${darkenHex(c.colors.accent, 0.3)} 100%)`,
    `linear-gradient(135deg, ${c.colors.secondary} 0%, ${secondaryDark} 100%)`,
    `linear-gradient(135deg, ${c.colors.accent} 0%, ${c.colors.primary} 100%)`,
    `linear-gradient(135deg, ${textSoft} 0%, ${c.colors.secondary} 100%)`,
  ]
  const galleryHtml = galleryItems.slice(0, 5).map((item, i) => {
    const letter = galleryLetters[i] || 'a'
    const bg = item.imageUrl
      ? `background-image:url('${esc(item.imageUrl)}');background-size:cover;background-position:center`
      : `background:${defaultGradients[i] || defaultGradients[0]}`
    return `<div class="gallery-item ${letter}" style="${bg}"><div class="caption">${esc(item.label)}</div></div>`
  }).join('\n      ')

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
          ${d.icon === 'pin' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
          : d.icon === 'transit' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>'
          : d.icon === 'phone' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M3 12h18M3 18h18"/></svg>'}
        </div>
        <div>
          <div class="label">${esc(d.label)}</div>
          <div class="value">${d.value}</div>
        </div>
      </div>`).join('')

  // Reserve features
  const reserveFeatures = c.reserveFeatures || []
  const reserveFeaturesHtml = reserveFeatures.map(f => `
        <div class="reserve-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          ${esc(f)}
        </div>`).join('')

  // Footer columns
  const footerColumns = c.footerColumns || [
    { title: 'Restaurant', links: [
      { label: 'Speisekarte', href: '#menu' },
      { label: 'Galerie', href: '#gallery' },
    ]},
    { title: 'Besuch', links: [
      { label: 'Reservieren', href: '#reserve' },
      { label: 'Anfahrt', href: '#location' },
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,400..900,30..100&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  /* ========================================
     DESIGN TOKENS
     ======================================== */
  :root {
    --terracotta:      ${esc(c.colors.primary)};
    --terracotta-dark: ${primaryDark};
    --terracotta-soft: ${primarySoft};
    --olive:           ${esc(c.colors.secondary)};
    --olive-dark:      ${secondaryDark};
    --cream:           ${esc(c.colors.background)};
    --cream-tint:      ${bgTint};
    --cream-warm:      ${bgWarm};
    --ink:             ${esc(c.colors.text)};
    --ink-soft:        ${textSoft};
    --border:          ${borderColor};
    --gold:            ${esc(c.colors.accent)};

    --shadow-card: 0 12px 32px ${hexToRgba(c.colors.text, 0.08)};
    --shadow-image: 0 20px 60px ${hexToRgba(c.colors.text, 0.18)};

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
    background: var(--cream);
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
    color: var(--terracotta);
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }

  .eyebrow {
    color: var(--terracotta);
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
    background: var(--olive);
    color: var(--cream);
    text-align: center;
    padding: 10px 16px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }
  .announce strong { color: var(--gold); }

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
    font-size: 26px;
    letter-spacing: -0.02em;
    display: flex; align-items: center; gap: 10px;
    font-variation-settings: "opsz" 144, "SOFT" 80;
    font-style: italic;
  }
  .logo-mark {
    width: 36px; height: 36px;
    background: var(--terracotta);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: var(--cream);
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 18px;
    font-style: italic;
  }
  .nav-links { display: flex; gap: 32px; font-size: 15px; font-weight: 500; }
  .nav-links a { transition: color 0.2s; color: var(--ink); }
  .nav-links a:hover { color: var(--terracotta); }
  .nav-cta {
    background: var(--olive); color: var(--cream);
    padding: 12px 22px; border-radius: 999px;
    font-size: 13px; font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: all 0.3s var(--spring);
    display: inline-flex; align-items: center; gap: 8px;
  }
  .nav-cta:hover { background: var(--terracotta); transform: translateY(-1px); }
  .nav-cta svg { width: 14px; height: 14px; }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    background: var(--cream);
    padding: 60px 0 80px;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 20% 30%, var(--cream-warm) 1px, transparent 1px),
      radial-gradient(circle at 80% 60%, var(--cream-warm) 1.5px, transparent 1.5px);
    background-size: 60px 60px, 80px 80px;
    pointer-events: none;
    opacity: 0.5;
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
    background: var(--cream-warm);
    color: var(--olive);
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
    background: var(--terracotta);
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
    font-family: var(--font-mono);
    font-size: 0.18em;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-top: 28px;
    color: var(--olive);
  }
  .hero-lead {
    font-size: 19px; line-height: 1.6;
    color: var(--ink-soft);
    max-width: 540px; margin-bottom: 36px;
  }
  .hero-lead strong { color: var(--ink); font-weight: 600; }

  .hero-trust {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    padding-top: 32px;
    margin-top: 32px;
    border-top: 1px solid var(--border);
  }
  .trust-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--ink-soft);
  }
  .trust-item .stars {
    display: flex;
    gap: 2px;
  }
  .trust-item .stars svg {
    width: 14px; height: 14px;
    color: var(--gold);
    fill: var(--gold);
  }
  .trust-item strong { color: var(--ink); font-weight: 600; }

  /* Reservierungs-Widget */
  .reservation-widget {
    background: var(--olive);
    color: var(--cream);
    border-radius: 24px;
    padding: 36px 32px;
    box-shadow: var(--shadow-image);
    position: relative;
  }
  .reservation-widget::before {
    content: '\\2726';
    position: absolute;
    top: -16px; left: 32px;
    background: var(--terracotta);
    color: var(--cream);
    width: 36px; height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
  .reservation-widget h3 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 28px;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }
  .reservation-widget h3 em {
    font-style: italic;
    color: var(--gold);
  }
  .reservation-widget .sub {
    color: ${hexToRgba(c.colors.background, 0.7)};
    font-size: 14px;
    margin-bottom: 24px;
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
  }
  .reservation-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }
  .reservation-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .reservation-field label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${hexToRgba(c.colors.background, 0.6)};
  }
  .reservation-field select,
  .reservation-field input {
    background: ${hexToRgba(c.colors.background, 0.08)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.15)};
    color: var(--cream);
    padding: 14px 16px;
    border-radius: 12px;
    font-family: var(--font-body);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(c.colors.background)}' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
    padding-right: 40px;
  }
  .reservation-field input { padding-right: 16px; background-image: none; }
  .reservation-field select:focus,
  .reservation-field input:focus {
    outline: none;
    border-color: var(--gold);
  }
  .reservation-submit {
    width: 100%;
    padding: 16px;
    border-radius: 999px;
    background: var(--terracotta);
    color: var(--cream);
    border: none;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s var(--spring);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 8px;
  }
  .reservation-submit:hover {
    background: var(--gold);
    transform: translateY(-2px);
  }
  .reservation-submit svg { width: 14px; height: 14px; }

  .reservation-note {
    text-align: center;
    margin-top: 16px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: ${hexToRgba(c.colors.background, 0.6)};
    letter-spacing: 0.04em;
  }

  /* ========================================
     OPENING HOURS BAR
     ======================================== */
  .hours-bar {
    background: var(--olive);
    color: var(--cream);
    padding: 32px 0;
  }
  .hours-grid {
    display: grid;
    grid-template-columns: repeat(${Math.min(c.openingHours.length, 4)}, 1fr);
    gap: 32px;
    align-items: center;
  }
  .hours-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .hours-item .label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${hexToRgba(c.colors.background, 0.6)};
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .hours-item .label svg {
    width: 14px; height: 14px;
    color: var(--gold);
  }
  .hours-item .value {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 500;
    letter-spacing: -0.01em;
  }
  .hours-item .value em {
    font-style: italic;
    color: var(--gold);
  }
  .hours-status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${hexToRgba(c.colors.accent, 0.15)};
    color: var(--gold);
    padding: 4px 10px;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    margin-top: 4px;
    width: fit-content;
  }
  .hours-status .dot {
    width: 6px; height: 6px;
    background: var(--gold);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  /* ========================================
     SECTION HEAD
     ======================================== */
  .section-head { text-align: center; margin-bottom: 64px; }
  .section-head .eyebrow { display: block; margin-bottom: 16px; }
  .section-head h2 {
    font-size: clamp(40px, 5vw, 64px);
    margin-bottom: 16px;
    line-height: 1.05;
  }
  .section-head p {
    color: var(--ink-soft);
    font-size: 18px;
    max-width: 580px;
    margin: 0 auto;
  }

  /* ========================================
     MENU
     ======================================== */
  .menu { background: var(--cream-tint); }
  .menu-tabs {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 48px;
  }
  .menu-tab {
    background: transparent;
    color: var(--ink-soft);
    border: 1px solid var(--border);
    padding: 12px 24px;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s var(--spring);
  }
  .menu-tab:hover {
    border-color: var(--terracotta);
    color: var(--terracotta);
  }
  .menu-tab.active {
    background: var(--olive);
    color: var(--cream);
    border-color: var(--olive);
  }

  .menu-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px 64px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .menu-item {
    padding: 20px 0;
    border-bottom: 1px dashed var(--border);
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 16px;
    align-items: baseline;
    transition: padding 0.3s var(--smooth);
  }
  .menu-item:hover { padding-left: 8px; }
  .menu-item-info h4 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 20px;
    letter-spacing: -0.02em;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .menu-item-info h4 em {
    font-style: italic;
    color: var(--terracotta);
  }
  .menu-item-info p {
    color: var(--ink-soft);
    font-size: 14px;
    line-height: 1.5;
  }
  .menu-item .tags {
    display: inline-flex;
    gap: 6px;
    margin-top: 6px;
  }
  .menu-item .tag {
    font-family: var(--font-mono);
    font-size: 9px;
    padding: 2px 8px;
    border-radius: 999px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--cream-warm);
    color: var(--olive);
  }
  .menu-item .tag.vege { background: ${hexToRgba(c.colors.secondary, 0.12)}; color: var(--olive); }
  .menu-item .tag.spicy { background: var(--terracotta-soft); color: var(--terracotta); }
  .menu-item .tag.new { background: var(--gold); color: var(--olive-dark); }

  .menu-item-price {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 22px;
    color: var(--terracotta);
    letter-spacing: -0.01em;
    white-space: nowrap;
    font-variation-settings: "opsz" 24, "SOFT" 80;
  }

  .menu-footer {
    text-align: center;
    margin-top: 48px;
    color: var(--ink-soft);
    font-size: 14px;
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
  }
  .menu-footer a {
    color: var(--terracotta);
    border-bottom: 1px solid var(--terracotta);
    padding-bottom: 2px;
  }

  /* ========================================
     FOOD GALLERY (Masonry)
     ======================================== */
  .gallery { background: var(--cream); }
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 240px);
    gap: 12px;
    grid-template-areas:
      "a a b c"
      "a a d e";
  }
  .gallery-item {
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    transition: transform 0.4s var(--smooth);
  }
  .gallery-item:hover { transform: translateY(-4px); }
  .gallery-item::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 60%, ${hexToRgba(c.colors.text, 0.4)});
    pointer-events: none;
  }
  .gallery-item .caption {
    position: absolute;
    bottom: 16px; left: 16px;
    color: var(--cream);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    z-index: 2;
  }
  .gallery-item.a { grid-area: a; }
  .gallery-item.b { grid-area: b; }
  .gallery-item.c { grid-area: c; }
  .gallery-item.d { grid-area: d; }
  .gallery-item.e { grid-area: e; }

  /* ========================================
     ABOUT / CHEF
     ======================================== */
  .about { background: var(--cream-tint); }
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: 64px;
    align-items: center;
  }
  .chef-image {
    position: relative;
    aspect-ratio: 4/5;
    border-radius: 24px;
    overflow: hidden;
    background: linear-gradient(160deg, ${tintHex(c.colors.text, 0.4)} 0%, ${tintHex(c.colors.text, 0.25)} 60%, ${c.colors.text} 100%);
    box-shadow: var(--shadow-image);
  }
  .chef-quote {
    position: absolute;
    top: 24px; left: 24px;
    right: 24px;
    background: ${hexToRgba(c.colors.background, 0.95)};
    padding: 20px 24px;
    border-radius: 16px;
    backdrop-filter: blur(12px);
  }
  .chef-quote p {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 17px;
    line-height: 1.4;
    color: var(--ink);
    letter-spacing: -0.01em;
    font-variation-settings: "opsz" 24, "SOFT" 80;
  }
  .chef-quote .signature {
    margin-top: 12px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--terracotta);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .about-text h2 {
    font-size: clamp(36px, 4.5vw, 56px);
    margin-bottom: 28px;
    line-height: 1.05;
  }
  .about-text p {
    color: var(--ink-soft);
    font-size: 17px;
    line-height: 1.65;
    margin-bottom: 20px;
  }
  .about-text p strong { color: var(--ink); font-weight: 600; }

  .about-stats {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0;
    margin-top: 36px;
    padding-top: 36px;
    border-top: 1px solid var(--border);
  }
  .about-stat {
    text-align: center;
    padding: 0 16px;
    border-right: 1px solid var(--border);
  }
  .about-stat:last-child { border-right: none; }
  .about-stat .num {
    font-family: var(--font-display);
    font-size: 44px;
    font-weight: 500;
    color: var(--terracotta);
    line-height: 1;
    margin-bottom: 6px;
    font-variation-settings: "opsz" 144, "SOFT" 80;
  }
  .about-stat .label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }

  /* ========================================
     GOOGLE REVIEWS
     ======================================== */
  .reviews { background: var(--cream); }
  .reviews-header {
    text-align: center;
    margin-bottom: 48px;
  }
  .reviews-score {
    display: inline-flex;
    align-items: center;
    gap: 20px;
    background: var(--cream-tint);
    padding: 24px 32px;
    border-radius: 20px;
    border: 1px solid var(--border);
    margin-bottom: 24px;
  }
  .reviews-score .big {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 56px;
    color: var(--terracotta);
    line-height: 1;
    letter-spacing: -0.03em;
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }
  .reviews-score .meta {
    text-align: left;
  }
  .reviews-score .stars {
    display: flex;
    gap: 2px;
    margin-bottom: 6px;
  }
  .reviews-score .stars svg {
    width: 18px; height: 18px;
    color: var(--gold);
    fill: var(--gold);
  }
  .reviews-score .count {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-soft);
    letter-spacing: 0.04em;
  }
  .reviews-score .google {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-soft);
    letter-spacing: 0.04em;
    margin-top: 4px;
  }
  .reviews-score .google::before {
    content: 'G';
    font-family: var(--font-display);
    font-weight: 700;
    color: var(--terracotta);
    font-size: 16px;
  }

  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .review-card {
    background: var(--cream-tint);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px 24px;
    transition: border-color 0.3s, transform 0.3s;
  }
  .review-card:hover {
    border-color: var(--terracotta);
    transform: translateY(-2px);
  }
  .review-stars {
    display: flex;
    gap: 2px;
    margin-bottom: 14px;
  }
  .review-stars svg {
    width: 14px; height: 14px;
    color: var(--gold);
    fill: var(--gold);
  }
  .review-text {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 20px;
    letter-spacing: -0.005em;
    font-variation-settings: "opsz" 24, "SOFT" 50;
  }
  .review-author {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }
  .review-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: var(--terracotta-soft);
    color: var(--terracotta);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 14px;
  }
  .review-name {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 2px;
  }
  .review-meta {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-soft);
    letter-spacing: 0.04em;
  }
  .review-meta::before {
    content: '\\25CF';
    color: var(--gold);
    margin-right: 6px;
  }

  /* ========================================
     LOCATION + MAP
     ======================================== */
  .location { background: var(--cream-tint); }
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
    font-size: clamp(36px, 4vw, 52px);
    line-height: 1.05;
    margin-bottom: 28px;
  }
  .location-detail {
    display: flex;
    gap: 16px;
    padding: 20px 0;
    border-bottom: 1px solid var(--border);
  }
  .location-detail:last-of-type { border-bottom: none; }
  .location-detail .icon {
    width: 44px; height: 44px;
    background: var(--terracotta-soft);
    color: var(--terracotta);
    border-radius: 12px;
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
    color: var(--ink-soft);
    margin-bottom: 4px;
  }
  .location-detail .value {
    color: var(--ink);
    font-size: 15px;
    line-height: 1.5;
  }
  .location-detail .value strong { color: var(--terracotta); font-weight: 600; }

  .location-map {
    background: var(--olive);
    border-radius: 24px;
    overflow: hidden;
    position: relative;
    min-height: 500px;
  }
  .map-svg {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
  }
  .map-block { fill: ${hexToRgba(c.colors.background, 0.06)}; }
  .map-park { fill: ${hexToRgba(c.colors.accent, 0.08)}; }
  .map-water { fill: ${hexToRgba(c.colors.primary, 0.08)}; }
  .map-street { stroke: ${hexToRgba(c.colors.background, 0.1)}; stroke-width: 2; fill: none; }
  .map-street-major { stroke: ${hexToRgba(c.colors.background, 0.18)}; stroke-width: 5; fill: none; stroke-linecap: round; }
  .map-street-label {
    fill: ${hexToRgba(c.colors.background, 0.5)};
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
  }

  .map-pin {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -100%);
    z-index: 2;
  }
  .map-pin-circle {
    width: 56px; height: 56px;
    background: var(--terracotta);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--cream);
    box-shadow: 0 8px 24px ${hexToRgba(c.colors.primary, 0.5)};
    animation: pinFloat 3s ease-in-out infinite;
  }
  .map-pin-circle svg { width: 28px; height: 28px; stroke-width: 2; }
  .map-pin-pulse {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 56px; height: 56px;
    border-radius: 50%;
    border: 2px solid var(--terracotta);
    opacity: 0;
    animation: mapPulse 2.5s ease-out infinite;
  }
  @keyframes pinFloat {
    0%, 100% { transform: translate(-50%, -100%) translateY(0); }
    50%      { transform: translate(-50%, -100%) translateY(-8px); }
  }
  @keyframes mapPulse {
    0%   { width: 56px; height: 56px; opacity: 1; }
    100% { width: 180px; height: 180px; opacity: 0; }
  }

  .map-overlay {
    position: absolute;
    bottom: 24px; left: 24px;
    background: ${hexToRgba(c.colors.background, 0.95)};
    border-radius: 16px;
    padding: 16px 20px;
    backdrop-filter: blur(12px);
    z-index: 3;
    max-width: 240px;
  }
  .map-overlay .label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--terracotta);
    margin-bottom: 4px;
  }
  .map-overlay .name {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 18px;
    color: var(--ink);
    letter-spacing: -0.01em;
    margin-bottom: 8px;
  }
  .map-overlay .actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }
  .map-overlay .action {
    flex: 1;
    background: var(--olive);
    color: var(--cream);
    padding: 8px 12px;
    border-radius: 8px;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-align: center;
    transition: background 0.3s;
  }
  .map-overlay .action:hover { background: var(--terracotta); }

  /* ========================================
     RESERVE FORM
     ======================================== */
  .reserve { background: var(--olive); color: var(--cream); }
  .reserve-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  .reserve-text h2 {
    font-size: clamp(40px, 5vw, 64px);
    line-height: 1.05;
    margin-bottom: 24px;
  }
  .reserve-text h2 em {
    font-style: italic;
    color: var(--gold);
  }
  .reserve-text p {
    color: ${hexToRgba(c.colors.background, 0.7)};
    font-size: 17px;
    line-height: 1.65;
    margin-bottom: 24px;
  }
  .reserve-features {
    display: grid;
    gap: 14px;
    margin-top: 28px;
  }
  .reserve-feature {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 15px;
    color: ${hexToRgba(c.colors.background, 0.85)};
  }
  .reserve-feature svg {
    width: 20px; height: 20px;
    color: var(--gold);
    flex-shrink: 0;
  }

  .reserve-form {
    background: ${hexToRgba(c.colors.background, 0.04)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.1)};
    border-radius: 24px;
    padding: 40px 36px;
    backdrop-filter: blur(8px);
  }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .form-row.full { grid-template-columns: 1fr; }
  .form-field { display: flex; flex-direction: column; gap: 6px; }
  .form-field label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${hexToRgba(c.colors.background, 0.6)};
  }
  .form-field input,
  .form-field select,
  .form-field textarea {
    background: ${hexToRgba(c.colors.background, 0.06)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.12)};
    color: var(--cream);
    padding: 14px 16px;
    border-radius: 12px;
    font-family: var(--font-body);
    font-size: 15px;
    transition: border-color 0.2s;
  }
  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus {
    outline: none;
    border-color: var(--gold);
  }
  .form-field textarea { resize: vertical; min-height: 80px; }
  .form-submit {
    margin-top: 8px;
    width: 100%;
    padding: 18px;
    border-radius: 999px;
    background: var(--terracotta);
    color: var(--cream);
    border: none;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s var(--spring);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .form-submit:hover {
    background: var(--gold);
    color: var(--olive-dark);
    transform: translateY(-2px);
  }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section { background: var(--cream); }
  .faq-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-top: 48px;
  }
  .faq-item {
    background: var(--cream-tint);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .faq-item:hover { border-color: var(--terracotta); }
  .faq-q {
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    padding: 22px 26px;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    font-family: var(--font-body);
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--ink);
    transition: background 0.2s;
  }
  .faq-q:hover { background: var(--cream-warm); }
  .faq-icon {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: var(--cream-warm);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: var(--terracotta);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .faq-item.open .faq-icon { transform: rotate(45deg); background: var(--terracotta); color: var(--cream); }
  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), padding 0.35s;
    font-size: 0.9rem;
    color: var(--ink-soft);
    line-height: 1.75;
    padding: 0 26px;
  }
  .faq-item.open .faq-a { max-height: 400px; padding: 0 26px 22px; }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: var(--olive-dark);
    color: ${hexToRgba(c.colors.background, 0.7)};
    padding: 64px 0 32px;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 48px;
    margin-bottom: 48px;
  }
  .footer-brand .logo { color: var(--cream); margin-bottom: 16px; }
  .footer-brand p {
    font-size: 14px;
    line-height: 1.6;
    max-width: 320px;
  }
  .footer-col h4 {
    color: var(--cream);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 20px;
  }
  .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .footer-col a { font-size: 14px; transition: color 0.2s; }
  .footer-col a:hover { color: var(--gold); }
  .footer-bottom {
    border-top: 1px solid ${hexToRgba(c.colors.background, 0.1)};
    padding-top: 24px;
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.05em;
    color: ${hexToRgba(c.colors.background, 0.4)};
  }
  .footer-bottom a:hover { color: var(--gold); }

  /* ========================================
     STICKY MOBILE CTA
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 16px; left: 16px; right: 16px;
    background: var(--terracotta);
    color: var(--cream);
    padding: 16px 24px;
    border-radius: 999px;
    z-index: 100;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-align: center;
    box-shadow: 0 8px 32px ${hexToRgba(c.colors.text, 0.4)};
  }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .hero-grid { grid-template-columns: 1fr; gap: 48px; }
    .menu-grid { grid-template-columns: 1fr; gap: 0; }
    .reviews-grid { grid-template-columns: 1fr; }
    .about-grid { grid-template-columns: 1fr; gap: 48px; }
    .location-grid { grid-template-columns: 1fr; }
    .reserve-grid { grid-template-columns: 1fr; gap: 48px; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .hours-grid { grid-template-columns: 1fr 1fr; gap: 24px; }
    .gallery-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(3, 200px);
      grid-template-areas:
        "a a"
        "b c"
        "d e";
    }
  }
  @media (max-width: 768px) {
    section { padding: 64px 0; }
    .container { padding: 0 20px; }
    .nav-links { display: none; }
    .nav-cta { display: none; }
    .reservation-row { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
    .about-stats { grid-template-columns: 1fr; gap: 24px; }
    .about-stat { border-right: none; border-bottom: 1px solid var(--border); padding: 16px 0; }
    .about-stat:last-child { border-bottom: none; }
    .hours-grid { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .footer-bottom { flex-direction: column; gap: 12px; }
    .menu-tabs { gap: 6px; }
    .menu-tab { padding: 10px 16px; font-size: 11px; }
    .mobile-cta { display: block; }
    body { padding-bottom: 80px; }
    .reviews-score { flex-direction: column; gap: 12px; text-align: center; }
    .reviews-score .meta { text-align: center; }
    .faq-grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>

${c.announceText ? `<!-- ====== ANNOUNCEMENT BAR ====== -->
<div class="announce">
  ${c.announceText}
</div>` : ''}

<!-- ====== NAV ====== -->
<nav>
  <div class="nav-inner">
    <a href="#" class="logo">
      <span class="logo-mark">${logoInitial}</span>
      ${esc(c.businessName)}
    </a>
    <div class="nav-links">
      <a href="#menu">Speisekarte</a>
      <a href="#gallery">Galerie</a>
      <a href="#about">K&uuml;che</a>
      <a href="#reviews">Bewertungen</a>
      <a href="#location">Standort</a>
    </div>
    <a href="#reserve" class="nav-cta">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
      ${esc(c.ctaText)}
    </a>
  </div>
</nav>

<!-- ====== HERO ====== -->
<section class="hero"${c.heroImageUrl ? ` style="background-image:url('${esc(c.heroImageUrl)}');background-size:cover;background-position:center"` : ''}>
  <div class="container hero-grid">
    <div>
      <div class="hero-tag">
        <span class="pulse"></span>
        ${esc(c.heroTag)}
      </div>
      <h1 class="display">
        ${c.heroHeadline} <em>${esc(c.heroAccent)}</em>
        <span class="subtitle">${esc(c.tagline)}</span>
      </h1>
      <p class="hero-lead">
        ${c.heroLead}
      </p>

      <div class="hero-trust">
        ${c.reviews.length > 0 ? `<div class="trust-item">
          <div class="stars">
            ${generateStarsSvg(5)}
          </div>
          <strong>${(c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length).toFixed(1).replace('.', ',')}</strong> &middot; ${c.reviews.length} Bewertungen
        </div>` : ''}
      </div>
    </div>

    ${c.reservationEnabled !== false ? `<!-- Reservation Widget -->
    <div class="reservation-widget" id="hero-reservation">
      <h3>${esc(c.ctaText)}</h3>
      <div class="sub">Antwort binnen 30 Minuten</div>

      <div class="reservation-row">
        <div class="reservation-field">
          <label>Personen</label>
          <select name="personen">
            <option>2 Personen</option>
            <option>3 Personen</option>
            <option>4 Personen</option>
            <option>5 Personen</option>
            <option>6 Personen</option>
            <option>7+ Personen</option>
          </select>
        </div>
        <div class="reservation-field">
          <label>Datum</label>
          <input type="date" name="datum">
        </div>
      </div>

      <div class="reservation-row">
        <div class="reservation-field">
          <label>Uhrzeit</label>
          <select name="uhrzeit">
            <option>18:00</option>
            <option>18:30</option>
            <option>19:00</option>
            <option selected>19:30</option>
            <option>20:00</option>
            <option>20:30</option>
            <option>21:00</option>
            <option>21:30</option>
          </select>
        </div>
        <div class="reservation-field">
          <label>Anlass (optional)</label>
          <select name="anlass">
            <option>&mdash;</option>
            <option>Geburtstag</option>
            <option>Jahrestag</option>
            <option>Gesch&auml;ftsessen</option>
            <option>Date Night</option>
          </select>
        </div>
      </div>

      <button class="reservation-submit" id="hero-res-submit">
        ${esc(c.ctaText)}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </button>

      <div class="reservation-note">
        ${c.phone ? `Oder direkt anrufen: ${esc(c.phone)}` : ''}
      </div>
    </div>` : ''}
  </div>
</section>

<!-- ====== OPENING HOURS BAR ====== -->
${c.openingHours.length > 0 ? `<section class="hours-bar" style="padding: 32px 0;">
  <div class="container">
    <div class="hours-grid">
      ${hoursHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== MENU ====== -->
${c.menuCategories.length > 0 ? `<section id="menu" class="menu">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.menuSectionTitle || 'Speisekarte')}</span>
      <h2 class="display">${c.menuSectionSubtitle || 'Die <em>Karte</em>.'}</h2>
      ${c.menuSectionDescription ? `<p>${esc(c.menuSectionDescription)}</p>` : ''}
    </div>

    <div class="menu-tabs">
      ${menuTabs}
    </div>

    ${menuItemsHtml}

  </div>
</section>` : ''}

<!-- ====== FOOD GALLERY ====== -->
<section id="gallery" class="gallery">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.gallerySectionTitle || 'Galerie')}</span>
      <h2 class="display">${c.gallerySectionSubtitle || 'Eindr&uuml;cke.'}</h2>
    </div>
    <div class="gallery-grid">
      ${galleryHtml}
    </div>
  </div>
</section>

<!-- ====== ABOUT / CHEF ====== -->
<section id="about" class="about">
  <div class="container about-grid">
    <div class="chef-image"${c.heroImageUrl ? ` style="background-image:url('${esc(c.heroImageUrl)}');background-size:cover;background-position:center"` : ''}>
      ${c.chefQuote ? `<div class="chef-quote">
        <p>"${esc(c.chefQuote)}"</p>
        ${c.chefName ? `<div class="signature">&mdash; ${esc(c.chefName)}${c.chefRole ? `, ${esc(c.chefRole)}` : ''}</div>` : ''}
      </div>` : ''}
    </div>
    <div class="about-text">
      <span class="eyebrow" style="display:block; margin-bottom:16px;">${esc(c.aboutTitle || 'Unsere Geschichte')}</span>
      <h2 class="display">${c.aboutTitle || '&Uuml;ber uns'}</h2>
      ${c.aboutText ? `<p>${c.aboutText}</p>` : ''}
      ${c.aboutText2 ? `<p>${c.aboutText2}</p>` : ''}
      ${aboutStatsHtml}
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
      <span class="eyebrow">${esc(c.reviewsSectionTitle || 'G&auml;ste-Stimmen')}</span>
      <h2 class="display">Was G&auml;ste <em>sagen</em>.</h2>
    </div>

    <div class="reviews-grid">
      ${reviewsHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== LOCATION + MAP ====== -->
<section id="location" class="location">
  <div class="container location-grid">

    <div class="location-info">
      <span class="eyebrow" style="display:block; margin-bottom:16px;">${esc(c.locationTitle || 'Standort & Anfahrt')}</span>
      <h2 class="display">${c.locationSubtitle || 'So finden Sie <em>uns</em>.'}</h2>

      ${locationDetailsHtml.length > 0 ? locationDetailsHtml : `
      ${c.address ? `<div class="location-detail">
        <div class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div>
          <div class="label">Adresse</div>
          <div class="value">${c.address}</div>
        </div>
      </div>` : ''}

      ${c.phone ? `<div class="location-detail">
        <div class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </div>
        <div>
          <div class="label">Telefon</div>
          <div class="value"><strong>${esc(c.phone)}</strong></div>
        </div>
      </div>` : ''}

      ${c.email ? `<div class="location-detail">
        <div class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
        </div>
        <div>
          <div class="label">E-Mail</div>
          <div class="value">${esc(c.email)}</div>
        </div>
      </div>` : ''}`}
    </div>

    <!-- Stilisierte Map -->
    <div class="location-map">
      <svg class="map-svg" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid slice">
        <path class="map-park" d="M 40 30 L 200 40 L 220 140 L 40 130 Z"/>
        <rect class="map-block" x="240" y="40" width="80" height="60" rx="3"/>
        <rect class="map-block" x="330" y="40" width="80" height="60" rx="3"/>
        <rect class="map-block" x="420" y="40" width="60" height="60" rx="3"/>
        <rect class="map-block" x="490" y="50" width="80" height="80" rx="3"/>
        <rect class="map-block" x="40" y="160" width="80" height="100" rx="3"/>
        <rect class="map-block" x="130" y="160" width="80" height="80" rx="3"/>
        <rect class="map-block" x="220" y="160" width="100" height="80" rx="3"/>
        <rect class="map-block" x="330" y="170" width="80" height="80" rx="3"/>
        <rect class="map-block" x="420" y="160" width="60" height="100" rx="3"/>
        <rect class="map-block" x="490" y="160" width="80" height="80" rx="3"/>
        <rect class="map-block" x="40" y="300" width="100" height="80" rx="3"/>
        <rect class="map-block" x="150" y="290" width="80" height="100" rx="3"/>
        <rect class="map-block" x="240" y="300" width="100" height="80" rx="3"/>
        <rect class="map-block" x="350" y="300" width="80" height="100" rx="3"/>
        <rect class="map-block" x="440" y="290" width="130" height="100" rx="3"/>
        <rect class="map-block" x="40" y="410" width="80" height="80" rx="3"/>
        <rect class="map-block" x="130" y="410" width="100" height="80" rx="3"/>
        <rect class="map-block" x="240" y="410" width="80" height="80" rx="3"/>
        <rect class="map-block" x="330" y="410" width="100" height="80" rx="3"/>
        <rect class="map-block" x="440" y="410" width="130" height="80" rx="3"/>
        <line class="map-street-major" x1="0" y1="280" x2="600" y2="280"/>
        <line class="map-street-major" x1="300" y1="0" x2="300" y2="500"/>
        <line class="map-street" x1="0" y1="150" x2="600" y2="150"/>
        <line class="map-street" x1="0" y1="395" x2="600" y2="395"/>
        <line class="map-street" x1="120" y1="0" x2="120" y2="500"/>
        <line class="map-street" x1="430" y1="0" x2="430" y2="500"/>
        <text class="map-street-label" x="310" y="275">${esc(c.businessName)}</text>
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
</section>

<!-- ====== RESERVE FORM (Large) ====== -->
${c.reservationEnabled !== false ? `<section id="reserve" class="reserve">
  <div class="container reserve-grid">
    <div class="reserve-text">
      <span class="eyebrow" style="color: var(--gold); display:block; margin-bottom:16px;">${esc(c.reserveTitle || 'Tischreservierung')}</span>
      <h2 class="display">${c.reserveSubtitle || 'Reservierung statt <em>Anstehen</em>.'}</h2>
      <p>${esc(c.reserveTitle || 'Sichern Sie sich jetzt Ihren Tisch.')}</p>

      ${reserveFeaturesHtml.length > 0 ? `<div class="reserve-features">${reserveFeaturesHtml}</div>` : ''}
    </div>

    <form class="reserve-form" id="reserve-form">
      <div class="form-row">
        <div class="form-field">
          <label>Name*</label>
          <input type="text" name="name" required placeholder="Vor- und Nachname">
        </div>
        <div class="form-field">
          <label>Telefon*</label>
          <input type="tel" name="phone" required placeholder="${c.phone ? esc(c.phone) : 'Telefonnummer'}">
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label>E-Mail*</label>
          <input type="email" name="email" required placeholder="mail@beispiel.de">
        </div>
        <div class="form-field">
          <label>Personen</label>
          <select name="personen">
            <option>2 Personen</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>6</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label>Datum*</label>
          <input type="date" name="datum" required>
        </div>
        <div class="form-field">
          <label>Uhrzeit*</label>
          <select name="uhrzeit" required>
            <option>18:00</option>
            <option>18:30</option>
            <option>19:00</option>
            <option selected>19:30</option>
            <option>20:00</option>
            <option>20:30</option>
            <option>21:00</option>
            <option>21:30</option>
          </select>
        </div>
      </div>

      <div class="form-row full">
        <div class="form-field">
          <label>W&uuml;nsche oder Allergien (optional)</label>
          <textarea name="message" placeholder="Vegetarisch, Glutenfrei, Geburtstag, Fensterplatz ..."></textarea>
        </div>
      </div>

      <div style="position:absolute;left:-9999px"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>

      <button type="submit" class="form-submit" id="reserve-submit">
        Reservierung abschicken
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </button>
    </form>
  </div>
</section>` : ''}

${(c.faqItems || []).length > 0 ? `<!-- ====== FAQ ====== -->
<section class="faq-section">
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
<a href="#reserve" class="mobile-cta">${esc(c.ctaText)} &rarr;</a>

<script>
  /* Menu Tabs */
  document.querySelectorAll('.menu-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.menu-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var catIdx = tab.getAttribute('data-cat');
      document.querySelectorAll('.menu-category').forEach(function(c) {
        c.style.display = c.getAttribute('data-cat-content') === catIdx ? '' : 'none';
      });
    });
  });

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

  /* Reserve form submission */
  ${siteId ? `(function() {
    var form = document.getElementById('reserve-form');
    if (form) {
      form.addEventListener('submit', function(ev) {
        ev.preventDefault();
        var btn = document.getElementById('reserve-submit');
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
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:var(--cream);font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:' + '${hexToRgba(c.colors.background, 0.7)}' + ';font-size:1.05rem">Wir best\\u00e4tigen Ihre Reservierung in K\\u00fcrze.</p></div>';
          } else {
            alert(d.error || 'Fehler beim Senden');
            btn.textContent = 'Reservierung abschicken';
            btn.disabled = false;
          }
        })
        .catch(function() {
          alert('Verbindungsfehler');
          btn.textContent = 'Reservierung abschicken';
          btn.disabled = false;
        });
      });
    }

    /* Hero reservation widget */
    var heroBtn = document.getElementById('hero-res-submit');
    if (heroBtn) {
      heroBtn.addEventListener('click', function() {
        var widget = document.getElementById('hero-reservation');
        var data = {};
        widget.querySelectorAll('input,select').forEach(function(i) {
          if (i.name && i.value) data[i.name] = i.value;
        });
        heroBtn.textContent = 'Wird gepr\\u00fcft...';
        heroBtn.disabled = true;
        fetch('${appUrl}/api/public/forms/${siteId}/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        .then(function(r) { return r.json(); })
        .then(function(d) {
          if (d.success) {
            widget.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="font-family:var(--font-display);font-size:1.4rem;margin-bottom:8px">Anfrage gesendet!</h3><p style="font-size:.9rem;opacity:.7">Wir melden uns in K\\u00fcrze.</p></div>';
          } else {
            alert(d.error || 'Fehler');
            heroBtn.textContent = '${esc(c.ctaText)}';
            heroBtn.disabled = false;
          }
        })
        .catch(function() {
          alert('Verbindungsfehler');
          heroBtn.textContent = '${esc(c.ctaText)}';
          heroBtn.disabled = false;
        });
      });
    }
  })();` : `document.getElementById('reserve-form').addEventListener('submit', function(ev) {
    ev.preventDefault();
    alert('Demo — kein Formular angebunden.');
  });`}
</script>

<!-- Cookie Banner -->
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba(c.colors.secondary, 0.97)};backdrop-filter:blur(12px);color:var(--cream);padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:${hexToRgba(c.colors.background, 0.8)}">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--cream);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--cream);color:var(--olive-dark);border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
