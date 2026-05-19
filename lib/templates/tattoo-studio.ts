export interface TattooStudioConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Schwarz (#0a0a0a)
    accent: string     // Rot/Crimson (#c62828)
    secondary: string  // Anthrazit (#2a2a2a)
    text: string       // Off-White (#f0ece4)
  }
  phone?: string
  email?: string
  address?: string
  instagramUrl?: string
  openingHours: { days: string; hours: string }[]
  styles: {
    name: string
    description: string
    icon?: string
  }[]
  artists: {
    name: string
    role: string
    specialties: string[]
    imageUrl?: string
    instagramHandle?: string
    quote?: string
  }[]
  portfolioItems?: { label: string; artist?: string; style?: string; imageUrl?: string }[]
  reviews: { text: string; name: string; source: string; rating: number }[]
  faqItems?: { question: string; answer: string }[]
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
  bookingInfo?: string
  bookingNote?: string
  locationTitle?: string
  locationSubtitle?: string
  locationDetails?: { icon: string; label: string; value: string }[]
  ctaSectionTitle?: string
  ctaSectionSubtitle?: string
  ctaFeatures?: string[]
  stylesSectionTitle?: string
  stylesSectionSubtitle?: string
  reviewsSectionTitle?: string
  portfolioSectionTitle?: string
  portfolioSectionSubtitle?: string
  teamSectionTitle?: string
  teamSectionSubtitle?: string
  pricingInfo?: { category: string; items: { name: string; description: string; price: string; duration?: string }[] }[]
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

export function renderTattooStudioTemplate(config: TattooStudioConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  const accentDark = darkenHex(c.colors.accent, 0.25)
  const accentSoft = hexToRgba(c.colors.accent, 0.12)
  const secondaryDark = darkenHex(c.colors.secondary, 0.2)
  const secondarySoft = hexToRgba(c.colors.secondary, 0.15)
  const textSoft = hexToRgba(c.colors.text, 0.6)
  const textMuted = hexToRgba(c.colors.text, 0.4)
  const borderColor = hexToRgba(c.colors.text, 0.1)
  const bgLight = tintHex(c.colors.primary, 0.08)
  const bgCard = tintHex(c.colors.primary, 0.05)

  const logoInitial = esc(c.businessName.charAt(0))

  // Styles HTML
  const stylesHtml = (c.styles || []).map(s => `
      <div class="style-card">
        <div class="style-icon">
          ${s.icon === 'needle' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 4V2m0 2v2m0-2h-2m2 0h2"/><path d="M8.5 14.5L4 19l1 1 4.5-4.5"/><path d="M14.5 5.5L19 10l-9 9-5-5 9-9z"/></svg>'
          : s.icon === 'brush' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18.37 2.63a2.12 2.12 0 013 3L14 13l-4 1 1-4z"/><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/></svg>'
          : s.icon === 'star' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
          : s.icon === 'skull' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="10" r="8"/><path d="M8 16v4h2v-2h4v2h2v-4"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/><path d="M10 14h4"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>'}
        </div>
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.description)}</p>
      </div>`).join('')

  // Artists HTML
  const artistsHtml = (c.artists || []).map((a, i) => {
    const initials = a.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    const gradient = i % 3 === 0
      ? `linear-gradient(135deg, ${c.colors.secondary} 0%, ${secondaryDark} 100%)`
      : i % 3 === 1
        ? `linear-gradient(135deg, ${c.colors.accent} 0%, ${accentDark} 100%)`
        : `linear-gradient(135deg, ${bgLight} 0%, ${c.colors.primary} 100%)`
    const bg = a.imageUrl
      ? `background-image:url('${esc(a.imageUrl)}');background-size:cover;background-position:center`
      : `background:${gradient}`
    return `
      <div class="artist-card">
        <div class="artist-photo" style="${bg}">
          ${!a.imageUrl ? `<span class="artist-initials">${esc(initials)}</span>` : ''}
        </div>
        <div class="artist-info">
          <h4>${esc(a.name)}</h4>
          <span class="artist-role">${esc(a.role)}</span>
          <div class="artist-specialties">
            ${(a.specialties || []).map(s => `<span class="artist-spec">${esc(s)}</span>`).join('\n            ')}
          </div>
          ${a.instagramHandle ? `<a href="https://instagram.com/${esc(a.instagramHandle.replace('@', ''))}" target="_blank" rel="noopener" class="artist-ig">@${esc(a.instagramHandle.replace('@', ''))}</a>` : ''}
          ${a.quote ? `<p class="artist-quote">&ldquo;${esc(a.quote)}&rdquo;</p>` : ''}
        </div>
      </div>`
  }).join('\n')

  // Portfolio/Gallery
  const portfolioItems = c.portfolioItems || [
    { label: 'Realistic Portrait' }, { label: 'Blackwork Sleeve' }, { label: 'Fine Line' },
    { label: 'Japanese Traditional' }, { label: 'Geometric' }, { label: 'Cover-Up' },
  ]
  const galleryLetters = ['a', 'b', 'c', 'd', 'e', 'f']
  const defaultGradients = [
    `linear-gradient(135deg, ${c.colors.primary} 0%, ${bgLight} 60%, ${darkenHex(c.colors.primary, 0.2)} 100%)`,
    `linear-gradient(135deg, ${c.colors.accent} 0%, ${accentDark} 100%)`,
    `linear-gradient(135deg, ${c.colors.secondary} 0%, ${secondaryDark} 100%)`,
    `linear-gradient(135deg, ${c.colors.accent} 0%, ${c.colors.secondary} 100%)`,
    `linear-gradient(135deg, ${bgLight} 0%, ${c.colors.primary} 100%)`,
    `linear-gradient(135deg, ${c.colors.secondary} 0%, ${c.colors.accent} 100%)`,
  ]
  const portfolioHtml = portfolioItems.slice(0, 6).map((item, i) => {
    const letter = galleryLetters[i] || 'a'
    const bg = item.imageUrl
      ? `background-image:url('${esc(item.imageUrl)}');background-size:cover;background-position:center`
      : `background:${defaultGradients[i] || defaultGradients[0]}`
    return `<div class="gallery-item ${letter}" style="${bg}">
      <div class="caption">${esc(item.label)}${item.artist ? `<span class="caption-artist">by ${esc(item.artist)}</span>` : ''}</div>
    </div>`
  }).join('\n      ')

  // Reviews
  const reviewsHtml = (c.reviews || []).map(r => {
    const initials = r.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    return `
      <div class="review-card">
        <div class="review-stars">${generateStarsSvg(r.rating)}</div>
        <p class="review-text">&ldquo;${esc(r.text)}&rdquo;</p>
        <div class="review-author">
          <div class="review-avatar">${esc(initials)}</div>
          <div>
            <div class="review-name">${esc(r.name)}</div>
            <div class="review-meta">${esc(r.source)}</div>
          </div>
        </div>
      </div>`
  }).join('\n')

  // Opening hours
  const hoursHtml = (c.openingHours || []).map(h => `
      <div class="hours-item">
        <div class="label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>${esc(h.days)}</div>
        <div class="value">${esc(h.hours)}</div>
      </div>`).join('')

  // FAQ
  const faqHtml = (c.faqItems || []).map(f => `
      <div class="faq-item">
        <button class="faq-q" aria-expanded="false">${esc(f.question)}<span class="faq-icon">+</span></button>
        <div class="faq-a" role="region">${esc(f.answer)}</div>
      </div>`).join('')

  // About stats
  const aboutStats = c.aboutStats || []
  const aboutStatsHtml = aboutStats.length > 0 ? `
      <div class="about-stats">
        ${aboutStats.map(s => `<div class="about-stat"><div class="num">${esc(s.value)}</div><div class="label">${esc(s.label)}</div></div>`).join('')}
      </div>` : ''

  // Location details
  const locationDetails = c.locationDetails || []
  const locationDetailsHtml = locationDetails.map(d => `
      <div class="location-detail">
        <div class="icon">
          ${d.icon === 'pin' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
          : d.icon === 'transit' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>'
          : d.icon === 'phone' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
          : d.icon === 'parking' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a4 4 0 0 1 0 8H9"/></svg>'
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
        <div class="cta-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>${esc(f)}</div>`).join('')

  // Footer
  const footerColumns = c.footerColumns || [
    { title: 'Studio', links: [{ label: 'Stile', href: '#styles' }, { label: 'K\u00fcnstler', href: '#team' }, { label: 'Portfolio', href: '#portfolio' }] },
    { title: 'Besuch', links: [{ label: '\u00d6ffnungszeiten', href: '#hours' }, { label: 'Kontakt', href: '#contact' }, { label: 'Anfahrt', href: '#location' }] },
  ]
  const footerColumnsHtml = footerColumns.map(col => `
      <div class="footer-col">
        <h4>${esc(col.title)}</h4>
        <ul>${col.links.map(l => `<li><a href="${esc(l.href)}">${l.label}</a></li>`).join('\n          ')}</ul>
      </div>`).join('')

  // Features
  const features = c.features || [
    { icon: 'needle', title: 'Handwerk', description: 'Jede Linie sitzt. Jedes Tattoo ist ein Unikat \u2014 gestochen mit Pr\u00e4zision und Leidenschaft.' },
    { icon: 'star', title: 'Hygiene', description: 'H\u00f6chste Hygienestandards. Sterile Einweg-Nadeln, desinfizierte Arbeitsfl\u00e4chen, EU-konforme Farben.' },
    { icon: 'brush', title: 'Beratung', description: 'Jedes Projekt beginnt mit einem Gespr\u00e4ch. Wir beraten dich zu Motiv, Platzierung und Stil.' },
  ]
  const featuresHtml = features.map(f => `
      <div class="feature-card">
        <div class="feature-icon">
          ${f.icon === 'needle' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 4V2m0 2v2m0-2h-2m2 0h2"/><path d="M8.5 14.5L4 19l1 1 4.5-4.5"/><path d="M14.5 5.5L19 10l-9 9-5-5 9-9z"/></svg>'
          : f.icon === 'star' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>'
          : f.icon === 'brush' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18.37 2.63a2.12 2.12 0 013 3L14 13l-4 1 1-4z"/><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18M3 12h18M3 18h18"/></svg>'}
        </div>
        <h3>${f.title}</h3>
        <p>${f.description}</p>
      </div>`).join('')

  // Pricing
  const pricingHtml = (c.pricingInfo || []).map(cat => `
    <div class="pricing-category">
      <h3 class="pricing-cat-title">${esc(cat.category)}</h3>
      <div class="pricing-items">
        ${cat.items.map(item => `
        <div class="pricing-item">
          <div class="pricing-item-info">
            <h4>${esc(item.name)}</h4>
            <p>${esc(item.description)}</p>
            ${item.duration ? `<span class="pricing-duration">${esc(item.duration)}</span>` : ''}
          </div>
          <div class="pricing-price">${esc(item.price)}</div>
        </div>`).join('')}
      </div>
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

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TattooParlor",
  "name": "${esc(c.businessName)}",
  "description": "${esc(c.tagline)}",
  ${c.address ? `"address": { "@type": "PostalAddress", "streetAddress": "${esc(c.address)}" },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  "priceRange": "$$",
  ${c.reviews.length > 0 ? `"aggregateRating": { "@type": "AggregateRating", "ratingValue": "${(c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length).toFixed(1)}", "reviewCount": "${c.reviews.length}" },` : ''}
  "url": "${appUrl}${siteId ? `/s/${siteId}` : ''}"
}
</script>

<style>
  :root {
    --schwarz: ${c.colors.primary};
    --accent: ${c.colors.accent};
    --anthrazit: ${c.colors.secondary};
    --offwhite: ${c.colors.text};
    --accent-dark: ${accentDark};
    --accent-soft: ${accentSoft};
    --anthrazit-dark: ${secondaryDark};
    --anthrazit-soft: ${secondarySoft};
    --text-soft: ${textSoft};
    --text-muted: ${textMuted};
    --border: ${borderColor};
    --bg-light: ${bgLight};
    --bg-card: ${bgCard};
    --font-display: 'Fraunces', Georgia, serif;
    --font-body: 'Inter Tight', -apple-system, sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
  body { font-family: var(--font-body); background: var(--schwarz); color: var(--offwhite); line-height: 1.65; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
  .eyebrow { font-family: var(--font-mono); font-size: .75rem; letter-spacing: 2.5px; text-transform: uppercase; color: var(--accent); font-weight: 500; }
  .display { font-family: var(--font-display); font-weight: 800; line-height: 1.1; letter-spacing: -0.03em; color: var(--offwhite); }
  .display em { font-style: italic; color: var(--accent); }
  a { color: var(--accent); text-decoration: none; transition: color 0.25s; }
  a:hover { color: var(--offwhite); }
  img { max-width: 100%; display: block; }
  .section-head { text-align: center; margin-bottom: 56px; }
  .section-head .eyebrow { display: block; margin-bottom: 14px; }
  .section-head .display { font-size: clamp(2rem, 4.5vw, 3.2rem); }
  .section-head p { max-width: 560px; margin: 16px auto 0; color: var(--text-soft); font-size: 1.05rem; }

  /* NAV */
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: ${hexToRgba(c.colors.primary, 0.92)}; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); transition: all 0.35s ease; }
  nav.scrolled { background: ${hexToRgba(c.colors.primary, 0.97)}; box-shadow: 0 2px 20px ${hexToRgba(c.colors.primary, 0.5)}; }
  .nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; height: 72px; }
  .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
  .nav-logo .logo-mark { width: 40px; height: 40px; background: var(--accent); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 900; font-size: 1.2rem; color: var(--schwarz); transform: rotate(-2deg); }
  .nav-logo .logo-text { font-family: var(--font-display); font-weight: 700; font-size: 1.15rem; color: var(--offwhite); letter-spacing: -0.02em; }
  .nav-links { display: flex; gap: 32px; list-style: none; }
  .nav-links a { font-size: .88rem; font-weight: 500; color: var(--text-soft); text-decoration: none; position: relative; transition: color 0.25s; }
  .nav-links a:hover { color: var(--accent); }
  .nav-links a::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: var(--accent); transition: width 0.3s ease; }
  .nav-links a:hover::after { width: 100%; }
  .nav-cta { background: var(--accent); color: #fff !important; padding: 10px 22px; border-radius: 4px; font-weight: 600; font-size: .85rem; text-decoration: none; transition: all 0.25s; letter-spacing: 0.02em; }
  .nav-cta:hover { background: var(--offwhite); color: var(--schwarz) !important; transform: translateY(-1px); }
  .nav-burger { display: none; background: none; border: none; cursor: pointer; padding: 8px; color: var(--offwhite); }
  .nav-burger svg { width: 24px; height: 24px; }
  .nav-mobile-overlay { display: none; position: fixed; inset: 0; background: ${hexToRgba(c.colors.primary, 0.98)}; z-index: 999; flex-direction: column; align-items: center; justify-content: center; gap: 24px; }
  .nav-mobile-overlay.open { display: flex; }
  .nav-mobile-overlay a { font-family: var(--font-display); font-size: 1.6rem; font-weight: 600; color: var(--offwhite); text-decoration: none; }
  .nav-mobile-overlay a:hover { color: var(--accent); }
  .nav-mobile-close { position: absolute; top: 22px; right: 24px; background: none; border: none; color: var(--offwhite); cursor: pointer; padding: 8px; }
  .nav-mobile-close svg { width: 28px; height: 28px; }

  /* HERO */
  .hero { position: relative; min-height: 100vh; display: flex; align-items: center; padding: 120px 0 80px; background: var(--schwarz); overflow: hidden; }
  .hero::before { content: ''; position: absolute; top: 0; right: -10%; width: 60%; height: 100%; background: radial-gradient(ellipse at 70% 50%, ${hexToRgba(c.colors.accent, 0.08)} 0%, transparent 70%); pointer-events: none; }
  .hero::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 200px; background: linear-gradient(to top, var(--schwarz), transparent); pointer-events: none; }
  .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; position: relative; z-index: 2; }
  .hero-content { max-width: 600px; }
  .hero-tag { display: inline-flex; align-items: center; gap: 8px; background: ${hexToRgba(c.colors.accent, 0.1)}; border: 1px solid ${hexToRgba(c.colors.accent, 0.2)}; padding: 6px 16px; border-radius: 2px; font-family: var(--font-mono); font-size: .72rem; letter-spacing: 2px; text-transform: uppercase; color: var(--accent); margin-bottom: 24px; }
  .hero h1 { font-family: var(--font-display); font-size: clamp(2.8rem, 6vw, 4.8rem); font-weight: 900; line-height: 1.05; letter-spacing: -0.04em; color: var(--offwhite); margin-bottom: 24px; }
  .hero h1 em { font-style: italic; color: var(--accent); position: relative; }
  .hero h1 em::after { content: ''; position: absolute; bottom: 4px; left: 0; width: 100%; height: 3px; background: var(--accent); opacity: 0.3; }
  .hero-lead { font-size: 1.15rem; color: var(--text-soft); line-height: 1.7; margin-bottom: 36px; max-width: 480px; }
  .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .btn-primary { display: inline-flex; align-items: center; gap: 8px; background: var(--accent); color: #fff; padding: 14px 32px; border-radius: 4px; font-weight: 700; font-size: .95rem; text-decoration: none; transition: all 0.3s ease; }
  .btn-primary:hover { background: var(--offwhite); color: var(--schwarz); transform: translateY(-2px); box-shadow: 0 8px 24px ${hexToRgba(c.colors.accent, 0.25)}; }
  .btn-secondary { display: inline-flex; align-items: center; gap: 8px; background: transparent; color: var(--offwhite); padding: 14px 32px; border: 1px solid var(--border); border-radius: 4px; font-weight: 600; font-size: .95rem; text-decoration: none; transition: all 0.3s ease; }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
  .hero-visual { position: relative; display: flex; align-items: center; justify-content: center; }
  .hero-image-wrapper { position: relative; width: 100%; max-width: 500px; aspect-ratio: 3/4; border-radius: 6px; overflow: hidden; border: 2px solid ${hexToRgba(c.colors.accent, 0.2)}; }
  .hero-image-wrapper .hero-bg { width: 100%; height: 100%; background: linear-gradient(145deg, ${c.colors.secondary} 0%, ${secondaryDark} 40%, ${c.colors.primary} 100%); display: flex; align-items: center; justify-content: center; }
  .hero-image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
  .hero-badge { position: absolute; bottom: -16px; left: -16px; background: var(--accent); color: #fff; padding: 16px 20px; border-radius: 4px; font-family: var(--font-display); text-align: center; line-height: 1.2; z-index: 3; }
  .hero-badge .big { font-size: 1.8rem; font-weight: 900; display: block; }
  .hero-badge .small { font-size: .7rem; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; font-family: var(--font-mono); }
  .hero-stripe { position: absolute; top: 20px; right: -20px; width: 4px; height: 120px; background: var(--accent); border-radius: 2px; }

  /* FEATURES */
  .features-section { padding: 100px 0; background: var(--bg-light); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
  .feature-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; padding: 36px 28px; transition: all 0.3s ease; position: relative; overflow: hidden; }
  .feature-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, var(--accent), var(--anthrazit)); opacity: 0; transition: opacity 0.3s; }
  .feature-card:hover { border-color: ${hexToRgba(c.colors.accent, 0.3)}; transform: translateY(-4px); }
  .feature-card:hover::before { opacity: 1; }
  .feature-icon { width: 48px; height: 48px; background: var(--accent-soft); border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
  .feature-icon svg { width: 24px; height: 24px; stroke: var(--accent); }
  .feature-card h3 { font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; color: var(--offwhite); margin-bottom: 10px; }
  .feature-card p { color: var(--text-soft); font-size: .92rem; line-height: 1.6; }

  /* STYLES */
  .styles-section { padding: 100px 0; background: var(--schwarz); }
  .styles-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; }
  .style-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; padding: 32px 24px; transition: all 0.3s ease; text-align: center; }
  .style-card:hover { border-color: ${hexToRgba(c.colors.accent, 0.3)}; transform: translateY(-4px); }
  .style-icon { width: 56px; height: 56px; background: var(--accent-soft); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
  .style-icon svg { width: 26px; height: 26px; stroke: var(--accent); }
  .style-card h3 { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--offwhite); margin-bottom: 8px; }
  .style-card p { color: var(--text-soft); font-size: .88rem; line-height: 1.6; }

  /* ARTISTS */
  .team-section { padding: 100px 0; background: var(--bg-light); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .team-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 28px; }
  .artist-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; overflow: hidden; transition: all 0.3s ease; }
  .artist-card:hover { border-color: ${hexToRgba(c.colors.accent, 0.3)}; transform: translateY(-4px); }
  .artist-photo { width: 100%; aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
  .artist-initials { font-family: var(--font-display); font-size: 3rem; font-weight: 900; color: ${hexToRgba(c.colors.text, 0.15)}; }
  .artist-info { padding: 24px; }
  .artist-info h4 { font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; color: var(--offwhite); margin-bottom: 4px; }
  .artist-role { font-family: var(--font-mono); font-size: .75rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--accent); display: block; margin-bottom: 14px; }
  .artist-specialties { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
  .artist-spec { font-size: .76rem; font-family: var(--font-mono); padding: 4px 10px; border-radius: 2px; background: var(--accent-soft); color: var(--accent); letter-spacing: 0.5px; }
  .artist-ig { display: inline-flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: .78rem; color: var(--accent); margin-bottom: 10px; }
  .artist-ig:hover { color: var(--offwhite); }
  .artist-quote { font-family: var(--font-display); font-style: italic; font-size: .92rem; color: var(--text-soft); border-left: 3px solid var(--accent); padding-left: 14px; margin-top: 12px; line-height: 1.5; }

  /* PORTFOLIO/GALLERY */
  .gallery-section { padding: 100px 0; background: var(--schwarz); }
  .gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: auto auto; gap: 16px; }
  .gallery-item { border-radius: 6px; overflow: hidden; position: relative; min-height: 240px; display: flex; align-items: flex-end; transition: transform 0.35s ease; cursor: pointer; }
  .gallery-item:hover { transform: scale(1.02); }
  .gallery-item.a { grid-column: span 2; min-height: 320px; }
  .gallery-item.b,.gallery-item.c,.gallery-item.d,.gallery-item.e { grid-column: span 1; }
  .gallery-item.f { grid-column: span 3; min-height: 200px; }
  .gallery-item .caption { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; background: linear-gradient(to top, ${hexToRgba(c.colors.primary, 0.85)}, transparent); font-family: var(--font-display); font-weight: 600; font-size: .95rem; color: var(--offwhite); }
  .caption-artist { display: block; font-family: var(--font-mono); font-size: .72rem; color: var(--accent); margin-top: 4px; font-weight: 400; letter-spacing: 0.5px; }

  /* PRICING */
  .pricing-section { padding: 100px 0; background: var(--bg-light); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .pricing-category { margin-bottom: 40px; }
  .pricing-category:last-child { margin-bottom: 0; }
  .pricing-cat-title { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; color: var(--accent); margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
  .pricing-items { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .pricing-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; padding: 24px; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; transition: all 0.25s; }
  .pricing-item:hover { border-color: ${hexToRgba(c.colors.accent, 0.3)}; }
  .pricing-item-info h4 { font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--offwhite); margin-bottom: 4px; }
  .pricing-item-info p { font-size: .85rem; color: var(--text-soft); line-height: 1.5; }
  .pricing-duration { font-family: var(--font-mono); font-size: .72rem; color: var(--text-muted); display: inline-block; margin-top: 6px; }
  .pricing-price { font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: var(--accent); white-space: nowrap; flex-shrink: 0; }

  /* HOURS + BOOKING */
  .hours-section { padding: 100px 0; background: var(--schwarz); }
  .hours-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
  .hours-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; padding: 36px; }
  .hours-card h3 { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; color: var(--offwhite); margin-bottom: 24px; }
  .hours-card h3 em { color: var(--accent); font-style: italic; }
  .hours-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--border); }
  .hours-item:last-child { border-bottom: none; }
  .hours-item .label { display: flex; align-items: center; gap: 10px; font-size: .92rem; color: var(--text-soft); }
  .hours-item .label svg { stroke: var(--accent); flex-shrink: 0; }
  .hours-item .value { font-family: var(--font-mono); font-size: .88rem; font-weight: 500; color: var(--offwhite); }
  .booking-card { background: var(--bg-card); border: 1px solid ${hexToRgba(c.colors.accent, 0.2)}; border-radius: 6px; padding: 36px; position: relative; overflow: hidden; }
  .booking-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(to bottom, var(--accent), var(--anthrazit)); }
  .booking-card h3 { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; color: var(--offwhite); margin-bottom: 16px; }
  .booking-card h3 em { color: var(--accent); font-style: italic; }
  .booking-icon { width: 56px; height: 56px; background: var(--accent-soft); border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
  .booking-icon svg { width: 28px; height: 28px; stroke: var(--accent); }
  .booking-text { color: var(--text-soft); font-size: .95rem; line-height: 1.7; margin-bottom: 16px; }
  .booking-note { font-family: var(--font-mono); font-size: .8rem; color: var(--accent); padding: 12px 16px; background: var(--accent-soft); border-radius: 4px; line-height: 1.5; }

  /* REVIEWS */
  .reviews-section { padding: 100px 0; background: var(--bg-light); border-top: 1px solid var(--border); }
  .reviews-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
  .review-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; padding: 28px; transition: all .3s ease; }
  .review-card:hover { border-color: ${hexToRgba(c.colors.accent, 0.3)}; transform: translateY(-3px); }
  .review-stars { display: flex; gap: 3px; margin-bottom: 16px; }
  .review-stars svg { width: 16px; height: 16px; fill: var(--accent); }
  .review-text { font-family: var(--font-display); font-size: 1rem; font-style: italic; color: var(--offwhite); line-height: 1.6; margin-bottom: 20px; }
  .review-author { display: flex; align-items: center; gap: 12px; }
  .review-avatar { width: 40px; height: 40px; border-radius: 4px; background: var(--accent-soft); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: .78rem; font-weight: 700; color: var(--accent); }
  .review-name { font-weight: 600; font-size: .9rem; color: var(--offwhite); }
  .review-meta { font-family: var(--font-mono); font-size: .72rem; color: var(--text-muted); letter-spacing: .5px; }

  /* LOCATION */
  .location-section { padding: 100px 0; background: var(--schwarz); border-top: 1px solid var(--border); }
  .location-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; }
  .location-detail { display: flex; align-items: flex-start; gap: 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; padding: 24px; transition: all .25s; }
  .location-detail:hover { border-color: ${hexToRgba(c.colors.accent, 0.3)}; }
  .location-detail .icon { width: 44px; height: 44px; background: var(--accent-soft); border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .location-detail .icon svg { width: 20px; height: 20px; stroke: var(--accent); }
  .location-detail .label { font-family: var(--font-mono); font-size: .72rem; letter-spacing: 1px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px; }
  .location-detail .value { font-size: .95rem; color: var(--offwhite); line-height: 1.5; }

  /* CTA / CONTACT */
  .cta-section { padding: 100px 0; background: var(--bg-light); position: relative; overflow: hidden; border-top: 1px solid var(--border); }
  .cta-section::before { content: ''; position: absolute; top: -50%; right: -20%; width: 60%; height: 200%; background: radial-gradient(ellipse, ${hexToRgba(c.colors.accent, 0.04)} 0%, transparent 70%); pointer-events: none; }
  .cta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; position: relative; z-index: 2; }
  .cta-text .display { font-size: clamp(1.8rem, 3.5vw, 2.6rem); margin-bottom: 16px; }
  .cta-text > p { color: var(--text-soft); font-size: 1.02rem; line-height: 1.7; margin-bottom: 28px; }
  .cta-features { display: flex; flex-direction: column; gap: 12px; }
  .cta-feature { display: flex; align-items: center; gap: 10px; font-size: .9rem; color: var(--text-soft); }
  .cta-feature svg { width: 18px; height: 18px; stroke: var(--accent); flex-shrink: 0; }
  .contact-form { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 36px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .form-row.full { grid-template-columns: 1fr; }
  .form-field label { display: block; font-family: var(--font-mono); font-size: .72rem; letter-spacing: 1px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
  .form-field input,.form-field select,.form-field textarea { width: 100%; background: var(--schwarz); border: 1px solid var(--border); color: var(--offwhite); padding: 12px 14px; border-radius: 4px; font-family: var(--font-body); font-size: .92rem; transition: border-color .25s; }
  .form-field input:focus,.form-field select:focus,.form-field textarea:focus { outline: none; border-color: var(--accent); }
  .form-field textarea { min-height: 120px; resize: vertical; }
  .form-field select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23c62828' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }
  .form-submit { display: inline-flex; align-items: center; gap: 8px; background: var(--accent); color: #fff; padding: 14px 32px; border: none; border-radius: 4px; font-family: var(--font-body); font-size: .95rem; font-weight: 700; cursor: pointer; transition: all .25s; margin-top: 8px; }
  .form-submit:hover { background: var(--offwhite); color: var(--schwarz); transform: translateY(-1px); }
  .form-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  /* FAQ */
  .faq-section { padding: 80px 0; background: var(--schwarz); border-top: 1px solid var(--border); }
  .faq-grid { max-width: 720px; margin: 0 auto; }
  .faq-item { border-bottom: 1px solid var(--border); }
  .faq-q { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 20px 0; background: none; border: none; color: var(--offwhite); font-family: var(--font-body); font-size: 1rem; font-weight: 600; cursor: pointer; text-align: left; transition: color .25s; }
  .faq-q:hover { color: var(--accent); }
  .faq-icon { font-size: 1.3rem; color: var(--accent); transition: transform .3s; flex-shrink: 0; margin-left: 16px; }
  .faq-a { max-height: 0; overflow: hidden; transition: max-height .35s ease, padding .35s ease; color: var(--text-soft); font-size: .92rem; line-height: 1.6; }
  .faq-item.open .faq-a { max-height: 300px; padding-bottom: 20px; }
  .faq-item.open .faq-icon { transform: rotate(45deg); }

  /* FOOTER */
  footer { padding: 80px 0 24px; background: var(--schwarz); border-top: 1px solid var(--border); }
  .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
  .footer-brand .logo-text { font-family: var(--font-display); font-weight: 700; font-size: 1.2rem; color: var(--offwhite); margin-bottom: 12px; }
  .footer-brand p { color: var(--text-soft); font-size: .88rem; line-height: 1.6; max-width: 320px; }
  .footer-col h4 { font-family: var(--font-mono); font-size: .72rem; letter-spacing: 2px; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; }
  .footer-col ul { list-style: none; }
  .footer-col li { margin-bottom: 10px; }
  .footer-col a { color: var(--text-soft); font-size: .88rem; transition: color .2s; }
  .footer-col a:hover { color: var(--accent); }
  .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 24px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 12px; }
  .footer-bottom p { font-size: .78rem; color: var(--text-muted); }
  .footer-legal { display: flex; gap: 20px; }
  .footer-legal a { font-size: .78rem; color: var(--text-muted); }
  .footer-legal a:hover { color: var(--accent); }
  .mobile-cta { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 998; background: var(--accent); color: #fff; text-align: center; padding: 16px 24px; font-weight: 700; font-size: .95rem; text-decoration: none; transition: background .25s; }
  .mobile-cta:hover { background: var(--offwhite); color: var(--schwarz); }

  .about-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 24px; margin-top: 32px; }
  .about-stat { text-align: center; padding: 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; }
  .about-stat .num { font-family: var(--font-display); font-size: 2rem; font-weight: 900; color: var(--accent); line-height: 1; margin-bottom: 6px; }
  .about-stat .label { font-family: var(--font-mono); font-size: .68rem; letter-spacing: 1px; text-transform: uppercase; color: var(--text-muted); }

  /* RESPONSIVE */
  @media (max-width: 1024px) {
    .hero-grid { grid-template-columns: 1fr; gap: 40px; }
    .hero-visual { display: none; }
    .hero { min-height: auto; padding: 140px 0 80px; }
    .features-grid { grid-template-columns: 1fr; gap: 20px; }
    .cta-grid,.hours-grid { grid-template-columns: 1fr; gap: 40px; }
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .gallery-grid { grid-template-columns: 1fr 1fr; }
    .gallery-item.a { grid-column: span 2; }
    .gallery-item.f { grid-column: span 2; }
    .pricing-items { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .container { padding: 0 16px; }
    .nav-links,.nav-cta { display: none; }
    .nav-burger { display: block; }
    .mobile-cta { display: block; }
    .hero h1 { font-size: clamp(2.2rem, 8vw, 3.2rem); }
    .hero-actions { flex-direction: column; align-items: stretch; }
    .btn-primary,.btn-secondary { justify-content: center; text-align: center; }
    .section-head .display { font-size: clamp(1.7rem, 6vw, 2.4rem); }
    .team-grid,.reviews-grid { grid-template-columns: 1fr; }
    .gallery-grid { grid-template-columns: 1fr; }
    .gallery-item.a,.gallery-item.f { grid-column: span 1; }
    .form-row { grid-template-columns: 1fr; }
    .location-grid { grid-template-columns: 1fr; }
    .styles-grid { grid-template-columns: 1fr; }
    footer { padding-bottom: 80px; }
  }
  @media (max-width: 480px) {
    .hero { padding: 120px 0 60px; }
    .hero h1 { font-size: 2rem; }
    .features-section,.styles-section,.team-section,.gallery-section,.hours-section,.reviews-section,.location-section,.cta-section,.pricing-section { padding: 64px 0; }
    .contact-form { padding: 24px 20px; }
    .about-stats { grid-template-columns: repeat(2, 1fr); }
  }
  @media (prefers-reduced-motion: no-preference) {
    .feature-card,.style-card,.artist-card,.review-card,.location-detail,.about-stat,.pricing-item { opacity: 0; transform: translateY(24px); animation: fadeInUp .6s ease forwards; }
    @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
    .feature-card:nth-child(1),.artist-card:nth-child(1),.review-card:nth-child(1) { animation-delay: .1s; }
    .feature-card:nth-child(2),.artist-card:nth-child(2),.review-card:nth-child(2) { animation-delay: .15s; }
    .feature-card:nth-child(3),.artist-card:nth-child(3),.review-card:nth-child(3) { animation-delay: .2s; }
  }
  @media print { nav,.mobile-cta,#cookie-banner { display: none !important; } body { background: #fff; color: #000; } .hero { min-height: auto; padding: 40px 0; } }
</style>
</head>
<body>

<nav id="main-nav">
  <div class="nav-inner">
    <a href="#" class="nav-logo">
      <div class="logo-mark">${logoInitial}</div>
      <span class="logo-text">${esc(c.businessName)}</span>
    </a>
    <ul class="nav-links">
      <li><a href="#styles">Stile</a></li>
      <li><a href="#team">K&uuml;nstler</a></li>
      <li><a href="#portfolio">Portfolio</a></li>
      <li><a href="#hours">&Ouml;ffnungszeiten</a></li>
      <li><a href="#reviews">Bewertungen</a></li>
      <li><a href="#contact">Kontakt</a></li>
    </ul>
    <a href="#contact" class="nav-cta">${esc(c.ctaText)}</a>
    <button class="nav-burger" aria-label="Men&uuml; &ouml;ffnen" id="nav-burger">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
    </button>
  </div>
</nav>

<div class="nav-mobile-overlay" id="nav-mobile">
  <button class="nav-mobile-close" id="nav-close" aria-label="Men&uuml; schlie&szlig;en">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
  </button>
  <a href="#styles">Stile</a>
  <a href="#team">K&uuml;nstler</a>
  <a href="#portfolio">Portfolio</a>
  <a href="#hours">&Ouml;ffnungszeiten</a>
  <a href="#reviews">Bewertungen</a>
  <a href="#contact">Kontakt</a>
</div>

<section class="hero">
  <div class="container hero-grid">
    <div class="hero-content">
      <div class="hero-tag">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
          <path d="M15 4V2m0 2v2m0-2h-2m2 0h2"/><path d="M8.5 14.5L4 19l1 1 4.5-4.5"/><path d="M14.5 5.5L19 10l-9 9-5-5 9-9z"/>
        </svg>
        ${esc(c.heroTag)}
      </div>
      <h1>${c.heroHeadline} <em>${c.heroAccent}</em></h1>
      <p class="hero-lead">${esc(c.heroLead)}</p>
      <div class="hero-actions">
        <a href="#portfolio" class="btn-primary">Portfolio ansehen <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
        <a href="#contact" class="btn-secondary">${esc(c.ctaText)}</a>
      </div>
    </div>
    <div class="hero-visual">
      <div class="hero-image-wrapper">
        ${c.heroImageUrl
          ? `<img src="${esc(c.heroImageUrl)}" alt="${esc(c.businessName)}" loading="eager">`
          : `<div class="hero-bg"><svg viewBox="0 0 24 24" fill="none" stroke="${hexToRgba(c.colors.text, 0.1)}" stroke-width="1" width="120" height="120"><path d="M15 4V2m0 2v2m0-2h-2m2 0h2"/><path d="M8.5 14.5L4 19l1 1 4.5-4.5"/><path d="M14.5 5.5L19 10l-9 9-5-5 9-9z"/></svg></div>`}
      </div>
      <div class="hero-badge"><span class="big">INK</span><span class="small">Studio</span></div>
      <div class="hero-stripe"></div>
    </div>
  </div>
</section>

${c.announceText ? `<div style="background:var(--accent);text-align:center;padding:14px 24px;font-size:.88rem;color:#fff">
  <span style="font-family:var(--font-mono);font-size:.72rem;letter-spacing:2px;text-transform:uppercase;opacity:.7;margin-right:12px">INFO</span>${esc(c.announceText)}
</div>` : ''}

<section class="features-section">
  <div class="container"><div class="features-grid">${featuresHtml}</div></div>
</section>

<section id="styles" class="styles-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.stylesSectionTitle || 'Unsere Stile')}</span>
      <h2 class="display">${c.stylesSectionSubtitle || 'Jeder Stil hat seine <em>Geschichte</em>.'}</h2>
      <p>Von feinen Linien bis hin zu gro&szlig;fl&auml;chigen Arbeiten &mdash; wir beherrschen das gesamte Spektrum.</p>
    </div>
    <div class="styles-grid">${stylesHtml}</div>
  </div>
</section>

<section id="team" class="team-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.teamSectionTitle || 'Die K\u00fcnstler')}</span>
      <h2 class="display">${c.teamSectionSubtitle || 'Unser <em>Team</em>.'}</h2>
      <p>Jeder K&uuml;nstler bringt seinen eigenen Stil und seine eigene Handschrift mit.</p>
    </div>
    <div class="team-grid">${artistsHtml}</div>
  </div>
</section>

<section id="portfolio" class="gallery-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.portfolioSectionTitle || 'Portfolio')}</span>
      <h2 class="display">${c.portfolioSectionSubtitle || 'Unsere <em>Arbeiten</em>.'}</h2>
    </div>
    <div class="gallery-grid">${portfolioHtml}</div>
  </div>
</section>

${pricingHtml ? `<section id="pricing" class="pricing-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Preise</span>
      <h2 class="display">Was <em>kostet</em> es?</h2>
      <p>Faire Preise f&uuml;r individuelle Kunst. Jedes Tattoo wird nach Aufwand kalkuliert.</p>
    </div>
    ${pricingHtml}
  </div>
</section>` : ''}

<section id="hours" class="hours-section">
  <div class="container">
    <div class="hours-grid">
      <div class="booking-card">
        <div class="booking-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        </div>
        <h3>Termin <em>buchen</em></h3>
        <p class="booking-text">${esc(c.bookingInfo || 'Wir arbeiten ausschlie\u00dflich mit Termin. Schreib uns \u00fcber das Kontaktformular oder ruf an \u2014 wir besprechen dein Projekt und finden einen passenden Termin.')}</p>
        ${c.bookingNote ? `<div class="booking-note">${esc(c.bookingNote)}</div>` : `<div class="booking-note">Tipp: Bring gerne Referenzbilder oder Skizzen zu deinem Beratungstermin mit.</div>`}
        ${aboutStatsHtml}
      </div>
      <div class="hours-card">
        <h3>&Ouml;ffnungs<em>zeiten</em></h3>
        ${hoursHtml}
      </div>
    </div>
  </div>
</section>

<section id="reviews" class="reviews-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.reviewsSectionTitle || 'Bewertungen')}</span>
      <h2 class="display">Was unsere <em>Kunden</em> sagen.</h2>
    </div>
    <div class="reviews-grid">${reviewsHtml}</div>
  </div>
</section>

${locationDetails.length > 0 ? `<section id="location" class="location-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.locationTitle || 'Standort')}</span>
      <h2 class="display">${c.locationSubtitle || 'So findest du <em>uns</em>.'}</h2>
    </div>
    <div class="location-grid">${locationDetailsHtml}</div>
  </div>
</section>` : ''}

${c.contactEnabled !== false ? `<section id="contact" class="cta-section">
  <div class="container cta-grid">
    <div class="cta-text">
      <span class="eyebrow" style="display:block;margin-bottom:16px;">${esc(c.ctaSectionTitle || 'Kontakt')}</span>
      <h2 class="display">${c.ctaSectionSubtitle || 'Dein Projekt <em>starten</em>.'}</h2>
      <p>Beschreib uns deine Idee &mdash; Motiv, Gr&ouml;&szlig;e, K&ouml;rperstelle. Wir melden uns mit einem Beratungstermin.</p>
      ${ctaFeaturesHtml.length > 0 ? `<div class="cta-features">${ctaFeaturesHtml}</div>` : `
      <div class="cta-features">
        <div class="cta-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>Kostenlose Erstberatung</div>
        <div class="cta-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>Individueller Entwurf</div>
        <div class="cta-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>Antwort innerhalb von 48h</div>
      </div>`}
    </div>
    <form class="contact-form" id="contact-form">
      <div class="form-row">
        <div class="form-field"><label>Name*</label><input type="text" name="name" required placeholder="Vor- und Nachname"></div>
        <div class="form-field"><label>E-Mail*</label><input type="email" name="email" required placeholder="mail@beispiel.de"></div>
      </div>
      <div class="form-row">
        <div class="form-field"><label>Telefon (optional)</label><input type="tel" name="phone" placeholder="Telefonnummer"></div>
        <div class="form-field"><label>Gew&uuml;nschter Stil</label>
          <select name="betreff">
            <option>Allgemeine Anfrage</option>
            ${(c.styles || []).map(s => `<option>${esc(s.name)}</option>`).join('\n            ')}
            <option>Cover-Up</option>
            <option>Beratung</option>
          </select>
        </div>
      </div>
      <div class="form-row full">
        <div class="form-field"><label>Beschreib dein Projekt*</label><textarea name="message" required placeholder="Motiv, Gr&ouml;&szlig;e, K&ouml;rperstelle, Referenzbilder ..."></textarea></div>
      </div>
      <div style="position:absolute;left:-9999px"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>
      <button type="submit" class="form-submit" id="contact-submit">Anfrage senden <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
    </form>
  </div>
</section>` : ''}

${(c.faqItems || []).length > 0 ? `<section class="faq-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">H&auml;ufige Fragen</span>
      <h2 class="display">Fragen &amp; <em>Antworten</em>.</h2>
    </div>
    <div class="faq-grid">${faqHtml}</div>
  </div>
</section>` : ''}

<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="logo-text">${esc(c.businessName)}</div>
        <p>${esc(c.footerText || c.tagline)}</p>
        ${c.instagramUrl ? `<a href="${esc(c.instagramUrl)}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;margin-top:12px;font-size:.88rem">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/></svg>
          Instagram
        </a>` : ''}
      </div>
      ${footerColumnsHtml}
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} ${esc(c.businessName)}. Alle Rechte vorbehalten.</p>
      <div class="footer-legal">
        ${c.imprintUrl ? `<a href="${esc(c.imprintUrl)}">Impressum</a>` : ''}
        ${c.privacyUrl ? `<a href="${esc(c.privacyUrl)}">Datenschutz</a>` : ''}
      </div>
    </div>
  </div>
</footer>

<a href="#contact" class="mobile-cta">${esc(c.ctaText)} &rarr;</a>

<script>
  var nav=document.getElementById('main-nav');
  window.addEventListener('scroll',function(){nav.classList.toggle('scrolled',window.scrollY>60)});
  var burger=document.getElementById('nav-burger'),mob=document.getElementById('nav-mobile'),cls=document.getElementById('nav-close');
  burger.addEventListener('click',function(){mob.classList.add('open');document.body.style.overflow='hidden'});
  cls.addEventListener('click',function(){mob.classList.remove('open');document.body.style.overflow=''});
  document.querySelectorAll('.nav-mobile-overlay a').forEach(function(l){l.addEventListener('click',function(){mob.classList.remove('open');document.body.style.overflow=''})});
  document.querySelectorAll('.faq-q').forEach(function(b){b.addEventListener('click',function(){var i=b.closest('.faq-item'),o=i.classList.contains('open');document.querySelectorAll('.faq-item').forEach(function(x){x.classList.remove('open');x.querySelector('.faq-q').setAttribute('aria-expanded','false')});if(!o){i.classList.add('open');b.setAttribute('aria-expanded','true')}})});
  ${siteId ? `(function(){var f=document.getElementById('contact-form');if(f){f.addEventListener('submit',function(ev){ev.preventDefault();var btn=document.getElementById('contact-submit');var d={};f.querySelectorAll('input,select,textarea').forEach(function(i){if(i.name&&i.value)d[i.name]=i.value});if(!d.name||!d.email){alert('Name und E-Mail sind Pflichtfelder.');return}btn.textContent='Wird gesendet...';btn.disabled=true;fetch('${appUrl}/api/public/forms/${siteId}/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(function(r){return r.json()}).then(function(d){if(d.success){f.innerHTML='<div style="text-align:center;padding:40px"><h3 style="color:var(--offwhite);font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:${textSoft};font-size:1.05rem">Wir melden uns in K\\u00fcrze bei dir.</p></div>'}else{alert(d.error||'Fehler');btn.textContent='Anfrage senden';btn.disabled=false}}).catch(function(){alert('Verbindungsfehler');btn.textContent='Anfrage senden';btn.disabled=false})})}})();` : `(function(){var f=document.getElementById('contact-form');if(f){f.addEventListener('submit',function(ev){ev.preventDefault();alert('Demo')})}})();`}
</script>

<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba(c.colors.primary, 0.97)};backdrop-filter:blur(12px);color:var(--offwhite);padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:${textSoft}">Diese Website verwendet technisch notwendige Cookies. <a href="${esc(c.privacyUrl || '#')}" style="color:var(--offwhite);text-decoration:underline">Datenschutzerkl&auml;rung</a></p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--accent);color:#fff;border:none;padding:8px 20px;border-radius:4px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
  </div>
</div>
<script>if(!localStorage.getItem('cookies_accepted')){document.getElementById('cookie-banner').style.display='block'}</script>

${siteId ? `<script>(function(){var sid='${siteId}';var u='${appUrl}/api/public/track';function t(ev,d){try{navigator.sendBeacon(u,JSON.stringify(Object.assign({siteId:sid,event:ev,url:location.href,referrer:document.referrer,userAgent:navigator.userAgent,timestamp:new Date().toISOString()},d||{})))}catch(e){}}t('pageview');document.addEventListener('click',function(e){var a=e.target.closest('a[href],button');if(a)t('click',{element:a.tagName,text:(a.textContent||'').trim().substring(0,100),href:a.href||''})})})();</script>` : ''}

</body>
</html>`
}
