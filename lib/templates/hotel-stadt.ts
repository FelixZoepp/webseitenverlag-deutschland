export interface HotelStadtConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Anthrazit
    accent: string     // Champagner
    background: string // Cream
    text: string       // Dark text
  }
  phone?: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  checkInTime?: string
  checkOutTime?: string
  dehogaSterne?: number
  openingHours: { days: string; hours: string }[]
  rooms: {
    name: string
    type: 'Standard' | 'Superior' | 'Junior-Suite' | 'Suite' | string
    description: string
    price: string
    priceNote?: string
    size?: string
    guests?: string
    amenities?: string[]
    imageUrl?: string
    tag?: string
  }[]
  highlights: {
    icon: string
    title: string
    description: string
    tag?: string
  }[]
  reviews: { text: string; name: string; source: string; rating: number }[]
  faqItems?: { question: string; answer: string }[]
  heroImageUrl?: string
  aboutTitle?: string
  aboutText?: string
  aboutText2?: string
  gmName?: string
  gmRole?: string
  gmQuote?: string
  contactEnabled?: boolean
  imprintUrl?: string
  privacyUrl?: string
  footerText?: string
  footerColumns?: { title: string; links: { label: string; href: string }[] }[]
  aboutStats?: { value: string; label: string }[]
  locationTitle?: string
  locationSubtitle?: string
  locationPois?: { name: string; distance: string; icon?: string }[]
  locationMapEmbed?: string
  ctaSectionTitle?: string
  ctaSectionSubtitle?: string
  ctaFeatures?: string[]
  roomsSectionTitle?: string
  roomsSectionSubtitle?: string
  reviewsSectionTitle?: string
  reviewsSectionSubtitle?: string
  spaTitle?: string
  spaSubtitle?: string
  spaText?: string
  spaFeatures?: string[]
  spaImageUrl?: string
  restaurantTitle?: string
  restaurantSubtitle?: string
  restaurantText?: string
  restaurantFeatures?: string[]
  restaurantImageUrl?: string
  bookingUrl?: string
  bookingCtaText?: string
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

export function renderHotelStadtTemplate(config: HotelStadtConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primaryDark = darkenHex(c.colors.primary, 0.15)
  const primaryLight = tintHex(c.colors.primary, 0.85)
  const accentDark = darkenHex(c.colors.accent, 0.25)
  const accentSoft = hexToRgba(c.colors.accent, 0.15)
  const bgTint = tintHex(c.colors.background, -0.03)
  const bgWarm = tintHex(c.colors.background, -0.06)
  const textSoft = tintHex(c.colors.text, 0.5)
  const borderColor = tintHex(c.colors.background, -0.1)

  const logoInitial = esc(c.businessName.charAt(0))

  // Dehoga stars
  const dehogaStars = c.dehogaSterne ? Array(c.dehogaSterne).fill('\u2605').join('') : ''

  // Room cards HTML
  const roomCardsHtml = c.rooms.map((room, i) => {
    const gradients = [
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 100%)`,
      `linear-gradient(135deg, ${c.colors.accent} 0%, ${accentDark} 100%)`,
      `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.3)} 0%, ${c.colors.primary} 100%)`,
      `linear-gradient(135deg, ${c.colors.accent} 0%, ${c.colors.primary} 100%)`,
    ]
    const bg = room.imageUrl
      ? `background-image:url('${esc(room.imageUrl)}');background-size:cover;background-position:center`
      : `background:${gradients[i % gradients.length]}`
    const amenitiesList = (room.amenities || []).map(a =>
      `<span class="room-amenity">${esc(a)}</span>`
    ).join('')
    return `
          <div class="room-card">
            <div class="room-image" style="${bg}">
              ${room.tag ? `<span class="room-tag">${esc(room.tag)}</span>` : ''}
              <div class="room-type-badge">${esc(room.type)}</div>
            </div>
            <div class="room-body">
              <h3>${esc(room.name)}</h3>
              <p class="room-desc">${esc(room.description)}</p>
              <div class="room-meta">
                ${room.size ? `<span class="room-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>${esc(room.size)}</span>` : ''}
                ${room.guests ? `<span class="room-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>${esc(room.guests)}</span>` : ''}
              </div>
              ${amenitiesList ? `<div class="room-amenities">${amenitiesList}</div>` : ''}
              <div class="room-price-row">
                <div class="room-price">
                  <span class="price-amount">${esc(room.price)}</span>
                  ${room.priceNote ? `<span class="price-note">${esc(room.priceNote)}</span>` : '<span class="price-note">pro Nacht</span>'}
                </div>
                <a href="#booking" class="room-book-btn">Verf&uuml;gbarkeit pr&uuml;fen</a>
              </div>
            </div>
          </div>`
  }).join('\n')

  // Highlights HTML
  const highlightsHtml = c.highlights.map(h => {
    const iconSvg =
      h.icon === 'rooftop' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/><path d="M2 11h20"/></svg>'
      : h.icon === 'concierge' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a4 4 0 0 0-4 4v2h8V6a4 4 0 0 0-4-4z"/><path d="M2 18h20v2H2z"/><path d="M4 18v-4a8 8 0 0 1 16 0v4"/><circle cx="12" cy="6" r="1"/></svg>'
      : h.icon === 'breakfast' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>'
      : h.icon === 'spa' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
      : h.icon === 'restaurant' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>'
      : h.icon === 'room-service' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 20h20"/><path d="M4 20a8 8 0 0 1 16 0"/><line x1="12" y1="4" x2="12" y2="12"/><circle cx="12" cy="4" r="1"/></svg>'
      : h.icon === 'wifi' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/></svg>'
      : h.icon === 'fitness' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6.5 6.5h11M6.5 17.5h11"/><rect x="2" y="8" width="4" height="8" rx="1"/><rect x="18" y="8" width="4" height="8" rx="1"/><line x1="6" y1="12" x2="18" y2="12"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z"/></svg>'
    return `
          <div class="highlight-card">
            <div class="highlight-icon">${iconSvg}</div>
            <h3>${esc(h.title)}</h3>
            <p>${esc(h.description)}</p>
            ${h.tag ? `<span class="highlight-tag">${esc(h.tag)}</span>` : ''}
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

  // FAQ HTML
  const faqHtml = (c.faqItems || []).map(f => `
      <div class="faq-item">
        <button class="faq-q" aria-expanded="false">${esc(f.question)}<span class="faq-icon">+</span></button>
        <div class="faq-a" role="region">${esc(f.answer)}</div>
      </div>`).join('')

  // POI pins
  const pois = c.locationPois || []
  const poisHtml = pois.map(poi => {
    const iconSvg =
      poi.icon === 'museum' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21h18M3 10h18M5 6l7-3 7 3"/><path d="M4 10v11M20 10v11"/><line x1="8" y1="10" x2="8" y2="21"/><line x1="12" y1="10" x2="12" y2="21"/><line x1="16" y1="10" x2="16" y2="21"/></svg>'
      : poi.icon === 'shopping' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>'
      : poi.icon === 'transport' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v16"/><circle cx="7.5" cy="15.5" r="1"/><circle cx="16.5" cy="15.5" r="1"/><path d="M4 19l-2 3M20 19l2 3"/></svg>'
      : poi.icon === 'park' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22V8"/><path d="M5 12a7 7 0 0 1 14 0"/><path d="M8 15a4 4 0 0 1 8 0"/></svg>'
      : poi.icon === 'restaurant' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
    return `
          <div class="poi-item">
            <div class="poi-icon">${iconSvg}</div>
            <div class="poi-info">
              <span class="poi-name">${esc(poi.name)}</span>
              <span class="poi-distance">${esc(poi.distance)}</span>
            </div>
          </div>`
  }).join('\n')

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

  // CTA features
  const ctaFeatures = c.ctaFeatures || []
  const ctaFeaturesHtml = ctaFeatures.map(f => `
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          ${esc(f)}
        </div>`).join('')

  // Spa features
  const spaFeatures = c.spaFeatures || []
  const spaFeaturesHtml = spaFeatures.map(f => `
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>${esc(f)}</li>`).join('')

  // Restaurant features
  const restaurantFeatures = c.restaurantFeatures || []
  const restaurantFeaturesHtml = restaurantFeatures.map(f => `
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>${esc(f)}</li>`).join('')

  // Footer columns
  const footerColumns = c.footerColumns || [
    { title: 'Hotel', links: [
      { label: 'Zimmer', href: '#rooms' },
      { label: 'Spa & Wellness', href: '#spa' },
      { label: 'Restaurant', href: '#restaurant' },
    ]},
    { title: 'Aufenthalt', links: [
      { label: 'Lage & Anfahrt', href: '#location' },
      { label: 'Bewertungen', href: '#reviews' },
      { label: 'FAQ', href: '#faq' },
    ]},
    { title: 'Kontakt', links: [
      { label: 'Anfrage senden', href: '#contact' },
      { label: 'Direkt buchen', href: '#booking' },
    ]},
  ]
  const footerColumnsHtml = footerColumns.map(col => `
      <div class="footer-col">
        <h4>${esc(col.title)}</h4>
        <ul>
          ${col.links.map(l => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('\n          ')}
        </ul>
      </div>`).join('')

  // Opening hours HTML
  const hoursHtml = c.openingHours.map(h => `
      <div class="hours-item">
        <div class="label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          ${esc(h.days)}
        </div>
        <div class="value">${esc(h.hours)}</div>
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

<!-- Schema.org Hotel -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Hotel",
  "name": "${esc(c.businessName)}",
  "description": "${esc(c.tagline)}",
  ${c.address ? `"address": {
    "@type": "PostalAddress",
    "streetAddress": "${esc(c.address)}"${c.city ? `,\n    "addressLocality": "${esc(c.city)}"` : ''}${c.postalCode ? `,\n    "postalCode": "${esc(c.postalCode)}"` : ''}${c.country ? `,\n    "addressCountry": "${esc(c.country)}"` : ''}
  },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  ${c.dehogaSterne ? `"starRating": {
    "@type": "Rating",
    "ratingValue": "${c.dehogaSterne}"
  },` : ''}
  ${c.checkInTime ? `"checkinTime": "${esc(c.checkInTime)}",` : ''}
  ${c.checkOutTime ? `"checkoutTime": "${esc(c.checkOutTime)}",` : ''}
  "priceRange": "$$$",
  ${c.reviews.length > 0 ? `"aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "${(c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length).toFixed(1)}",
    "reviewCount": "${c.reviews.length}"
  },` : ''}
  "amenityFeature": [
    ${c.highlights.map(h => `{"@type": "LocationFeatureSpecification", "name": "${esc(h.title)}", "value": true}`).join(',\n    ')}
  ],
  "url": "${appUrl}${siteId ? `/s/${siteId}` : ''}"
}
</script>

<style>
  /* ========================================
     DESIGN TOKENS
     ======================================== */
  :root {
    --anthrazit:       ${esc(c.colors.primary)};
    --anthrazit-dark:  ${primaryDark};
    --anthrazit-light: ${primaryLight};
    --champagner:      ${esc(c.colors.accent)};
    --champagner-dark: ${accentDark};
    --champagner-soft: ${accentSoft};
    --cream:           ${esc(c.colors.background)};
    --cream-tint:      ${bgTint};
    --cream-warm:      ${bgWarm};
    --ink:             ${esc(c.colors.text)};
    --ink-soft:        ${textSoft};
    --border:          ${borderColor};

    --shadow-card: 0 12px 40px ${hexToRgba(c.colors.text, 0.07)};
    --shadow-image: 0 24px 64px ${hexToRgba(c.colors.text, 0.15)};
    --shadow-hover: 0 20px 48px ${hexToRgba(c.colors.text, 0.12)};

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
    color: var(--champagner);
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }

  .eyebrow {
    color: var(--champagner);
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
    background: var(--anthrazit);
    color: var(--cream);
    text-align: center;
    padding: 10px 16px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }
  .announce strong { color: var(--champagner); }

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
    font-variation-settings: "opsz" 144, "SOFT" 80;
  }
  .logo-mark {
    width: 40px; height: 40px;
    background: var(--anthrazit);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: var(--champagner);
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 20px;
    font-style: italic;
  }
  .logo-stars {
    font-size: 10px;
    color: var(--champagner);
    letter-spacing: 2px;
    display: block;
    margin-top: -2px;
  }
  .nav-links { display: flex; gap: 28px; font-size: 14px; font-weight: 500; }
  .nav-links a { transition: color 0.2s; color: var(--ink); }
  .nav-links a:hover { color: var(--champagner-dark); }
  .nav-cta {
    background: var(--anthrazit); color: var(--champagner);
    padding: 12px 24px; border-radius: 4px;
    font-size: 13px; font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: all 0.3s var(--smooth);
    display: inline-flex; align-items: center; gap: 8px;
  }
  .nav-cta:hover { background: var(--champagner); color: var(--anthrazit); transform: translateY(-1px); }
  .nav-cta svg { width: 14px; height: 14px; }

  /* Hamburger */
  .hamburger {
    display: none; background: none; border: none; cursor: pointer;
    width: 32px; height: 32px; position: relative;
  }
  .hamburger span {
    display: block; width: 22px; height: 2px;
    background: var(--anthrazit); position: absolute; left: 5px;
    transition: all 0.3s;
  }
  .hamburger span:nth-child(1) { top: 8px; }
  .hamburger span:nth-child(2) { top: 15px; }
  .hamburger span:nth-child(3) { top: 22px; }

  /* Mobile menu */
  .mobile-menu {
    display: none;
    position: fixed; inset: 0; z-index: 100;
    background: var(--cream);
    padding: 80px 32px 32px;
    flex-direction: column; gap: 0;
    overflow-y: auto;
  }
  .mobile-menu.open { display: flex; }
  .mobile-menu a {
    font-size: 20px; font-weight: 600; padding: 16px 0;
    border-bottom: 1px solid var(--border);
    font-family: var(--font-display);
    font-variation-settings: "opsz" 48;
  }
  .mobile-menu .mobile-close {
    position: absolute; top: 20px; right: 24px;
    background: none; border: none; font-size: 28px; cursor: pointer;
    color: var(--anthrazit);
  }
  .mobile-menu .mobile-cta-inner {
    margin-top: 24px;
    background: var(--anthrazit); color: var(--champagner);
    padding: 16px 28px; border-radius: 4px; text-align: center;
    font-family: var(--font-mono); font-size: 14px; font-weight: 600;
    letter-spacing: 0.06em; text-transform: uppercase;
  }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    background: var(--anthrazit);
    padding: 0;
    position: relative;
    overflow: hidden;
    min-height: 85vh;
    display: flex;
    align-items: center;
  }
  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, ${hexToRgba(c.colors.primary, 0.95)} 0%, ${hexToRgba(c.colors.primary, 0.7)} 100%);
    z-index: 1;
  }
  .hero-bg {
    position: absolute; inset: 0;
    ${c.heroImageUrl ? `background-image: url('${esc(c.heroImageUrl)}'); background-size: cover; background-position: center;` : `background: linear-gradient(135deg, ${c.colors.primary} 0%, ${darkenHex(c.colors.primary, 0.3)} 100%);`}
  }
  .hero-pattern {
    position: absolute; inset: 0; z-index: 2;
    background-image:
      linear-gradient(${hexToRgba(c.colors.accent, 0.03)} 1px, transparent 1px),
      linear-gradient(90deg, ${hexToRgba(c.colors.accent, 0.03)} 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }
  .hero .container {
    position: relative; z-index: 3;
    padding-top: 80px; padding-bottom: 80px;
  }
  .hero-content {
    max-width: 720px;
  }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${hexToRgba(c.colors.accent, 0.12)};
    color: var(--champagner);
    padding: 8px 18px;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 28px;
    font-weight: 500;
    border: 1px solid ${hexToRgba(c.colors.accent, 0.2)};
  }
  .hero-tag .pulse {
    width: 8px; height: 8px;
    background: var(--champagner);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.6; transform: scale(1.2); }
  }
  .hero h1 {
    font-size: clamp(44px, 5.5vw, 88px);
    margin-bottom: 24px;
    line-height: 0.98;
    color: var(--cream);
  }
  .hero h1 em {
    color: var(--champagner);
  }
  .hero h1 .subtitle {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.17em;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-top: 24px;
    color: var(--champagner);
  }
  .hero-lead {
    font-size: 18px; line-height: 1.7;
    color: ${hexToRgba(c.colors.background, 0.7)};
    max-width: 560px; margin-bottom: 40px;
  }
  .hero-lead strong { color: var(--cream); font-weight: 600; }

  /* Availability Check */
  .availability-bar {
    background: ${hexToRgba(c.colors.background, 0.08)};
    backdrop-filter: blur(16px);
    border: 1px solid ${hexToRgba(c.colors.accent, 0.15)};
    border-radius: 8px;
    padding: 24px 28px;
    display: flex;
    align-items: flex-end;
    gap: 16px;
    flex-wrap: wrap;
    max-width: 680px;
  }
  .availability-field {
    flex: 1;
    min-width: 150px;
  }
  .availability-field label {
    display: block;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--champagner);
    margin-bottom: 8px;
    font-weight: 500;
  }
  .availability-field input {
    width: 100%;
    background: ${hexToRgba(c.colors.background, 0.1)};
    border: 1px solid ${hexToRgba(c.colors.accent, 0.2)};
    border-radius: 4px;
    padding: 12px 14px;
    color: var(--cream);
    font-family: var(--font-body);
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s;
  }
  .availability-field input:focus {
    border-color: var(--champagner);
  }
  .availability-field input::-webkit-calendar-picker-indicator {
    filter: invert(0.8);
    cursor: pointer;
  }
  .availability-btn {
    background: var(--champagner); color: var(--anthrazit);
    padding: 13px 28px; border-radius: 4px; border: none;
    font-family: var(--font-mono); font-size: 13px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase;
    cursor: pointer; transition: all 0.3s var(--smooth);
    white-space: nowrap;
  }
  .availability-btn:hover { background: var(--cream); transform: translateY(-1px); }

  .hero-trust {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    padding-top: 32px;
    margin-top: 32px;
    border-top: 1px solid ${hexToRgba(c.colors.accent, 0.15)};
  }
  .trust-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: ${hexToRgba(c.colors.background, 0.6)};
    letter-spacing: 0.04em;
  }
  .trust-item svg {
    width: 16px; height: 16px;
    stroke: var(--champagner);
    fill: none; stroke-width: 2;
  }

  /* ========================================
     ROOMS GALLERY
     ======================================== */
  .rooms-section {
    background: var(--cream);
    padding: 100px 0;
  }
  .rooms-header {
    text-align: center;
    margin-bottom: 64px;
  }
  .rooms-header h2 {
    font-size: clamp(32px, 4vw, 56px);
    margin-top: 16px;
  }
  .rooms-header .lead {
    font-size: 17px; color: var(--ink-soft);
    max-width: 560px; margin: 20px auto 0; line-height: 1.7;
  }
  .rooms-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
  .room-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: var(--shadow-card);
    transition: all 0.4s var(--smooth);
    border: 1px solid var(--border);
  }
  .room-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-hover);
  }
  .room-image {
    height: 260px;
    position: relative;
    overflow: hidden;
  }
  .room-tag {
    position: absolute; top: 16px; left: 16px;
    background: var(--champagner); color: var(--anthrazit);
    padding: 6px 14px; border-radius: 4px;
    font-family: var(--font-mono); font-size: 11px;
    font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  }
  .room-type-badge {
    position: absolute; bottom: 16px; right: 16px;
    background: ${hexToRgba(c.colors.primary, 0.85)};
    backdrop-filter: blur(8px);
    color: var(--champagner);
    padding: 6px 14px; border-radius: 4px;
    font-family: var(--font-mono); font-size: 11px;
    font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
  }
  .room-body {
    padding: 28px;
  }
  .room-body h3 {
    font-family: var(--font-display);
    font-size: 22px; font-weight: 600;
    margin-bottom: 8px;
    font-variation-settings: "opsz" 48;
  }
  .room-desc {
    font-size: 15px; color: var(--ink-soft);
    line-height: 1.6; margin-bottom: 16px;
  }
  .room-meta {
    display: flex; gap: 16px; margin-bottom: 14px;
  }
  .room-meta-item {
    display: flex; align-items: center; gap: 6px;
    font-family: var(--font-mono); font-size: 12px;
    color: var(--ink-soft); letter-spacing: 0.02em;
  }
  .room-meta-item svg { width: 16px; height: 16px; }
  .room-amenities {
    display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px;
  }
  .room-amenity {
    background: var(--cream-tint);
    padding: 4px 10px; border-radius: 4px;
    font-size: 12px; color: var(--ink-soft);
    font-family: var(--font-mono); letter-spacing: 0.02em;
    border: 1px solid var(--border);
  }
  .room-price-row {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 20px;
    border-top: 1px solid var(--border);
  }
  .room-price .price-amount {
    font-family: var(--font-display);
    font-size: 26px; font-weight: 700;
    color: var(--anthrazit);
    font-variation-settings: "opsz" 48;
  }
  .room-price .price-note {
    display: block;
    font-family: var(--font-mono);
    font-size: 11px; color: var(--ink-soft);
    letter-spacing: 0.04em;
  }
  .room-book-btn {
    background: var(--anthrazit); color: var(--champagner);
    padding: 10px 20px; border-radius: 4px;
    font-family: var(--font-mono); font-size: 12px;
    font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
    transition: all 0.3s var(--smooth);
  }
  .room-book-btn:hover {
    background: var(--champagner); color: var(--anthrazit);
  }

  /* ========================================
     HIGHLIGHTS
     ======================================== */
  .highlights-section {
    background: var(--cream-tint);
    padding: 100px 0;
  }
  .highlights-header {
    text-align: center;
    margin-bottom: 64px;
  }
  .highlights-header h2 {
    font-size: clamp(32px, 4vw, 52px);
    margin-top: 16px;
  }
  .highlights-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }
  .highlight-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 36px 28px;
    transition: all 0.4s var(--smooth);
    position: relative;
    overflow: hidden;
  }
  .highlight-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--champagner);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s var(--smooth);
  }
  .highlight-card:hover::before { transform: scaleX(1); }
  .highlight-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-card); }
  .highlight-icon {
    width: 48px; height: 48px;
    background: var(--champagner-soft);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
  }
  .highlight-icon svg {
    width: 24px; height: 24px;
    stroke: var(--champagner-dark);
  }
  .highlight-card h3 {
    font-family: var(--font-display);
    font-size: 20px; font-weight: 600;
    margin-bottom: 10px;
    font-variation-settings: "opsz" 48;
  }
  .highlight-card p {
    font-size: 15px; color: var(--ink-soft);
    line-height: 1.65;
  }
  .highlight-tag {
    display: inline-block; margin-top: 14px;
    background: var(--champagner-soft);
    color: var(--champagner-dark);
    padding: 4px 12px; border-radius: 4px;
    font-family: var(--font-mono); font-size: 11px;
    font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
  }

  /* ========================================
     LOCATION / MAP
     ======================================== */
  .location-section {
    background: var(--cream);
    padding: 100px 0;
  }
  .location-header {
    text-align: center;
    margin-bottom: 56px;
  }
  .location-header h2 {
    font-size: clamp(32px, 4vw, 52px);
    margin-top: 16px;
  }
  .location-header .lead {
    font-size: 17px; color: var(--ink-soft);
    max-width: 540px; margin: 16px auto 0; line-height: 1.7;
  }
  .location-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: start;
  }
  .location-map {
    border-radius: 12px; overflow: hidden;
    box-shadow: var(--shadow-card);
    border: 1px solid var(--border);
    min-height: 400px;
    background: var(--cream-tint);
    position: relative;
  }
  .location-map iframe {
    width: 100%; height: 100%; min-height: 400px; border: 0;
  }
  .location-map .map-placeholder {
    display: flex; align-items: center; justify-content: center;
    min-height: 400px;
    font-family: var(--font-mono); font-size: 14px; color: var(--ink-soft);
    flex-direction: column; gap: 12px;
  }
  .location-map .map-placeholder svg {
    width: 48px; height: 48px; stroke: var(--champagner); fill: none; stroke-width: 1.5;
  }
  .poi-list {
    display: flex; flex-direction: column; gap: 16px;
  }
  .poi-item {
    display: flex; align-items: center; gap: 16px;
    padding: 16px 20px;
    background: white;
    border: 1px solid var(--border);
    border-radius: 8px;
    transition: all 0.3s var(--smooth);
  }
  .poi-item:hover {
    border-color: var(--champagner);
    transform: translateX(4px);
  }
  .poi-icon {
    width: 40px; height: 40px;
    background: var(--champagner-soft);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .poi-icon svg {
    width: 20px; height: 20px;
    stroke: var(--champagner-dark);
  }
  .poi-info {
    display: flex; justify-content: space-between; align-items: center;
    flex: 1;
  }
  .poi-name {
    font-weight: 600; font-size: 15px;
  }
  .poi-distance {
    font-family: var(--font-mono);
    font-size: 12px; color: var(--ink-soft);
    letter-spacing: 0.04em;
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews-section {
    background: var(--anthrazit);
    padding: 100px 0;
    color: var(--cream);
  }
  .reviews-header {
    text-align: center;
    margin-bottom: 56px;
  }
  .reviews-header .eyebrow { color: var(--champagner); }
  .reviews-header h2 {
    font-size: clamp(32px, 4vw, 52px);
    margin-top: 16px;
    color: var(--cream);
  }
  .reviews-header .lead {
    font-size: 17px; color: ${hexToRgba(c.colors.background, 0.6)};
    max-width: 540px; margin: 16px auto 0; line-height: 1.7;
  }
  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .review-card {
    background: ${hexToRgba(c.colors.background, 0.06)};
    border: 1px solid ${hexToRgba(c.colors.accent, 0.12)};
    border-radius: 12px;
    padding: 32px 28px;
    transition: all 0.4s var(--smooth);
  }
  .review-card:hover { transform: translateY(-4px); border-color: ${hexToRgba(c.colors.accent, 0.3)}; }
  .review-stars {
    display: flex; gap: 3px; margin-bottom: 20px;
  }
  .review-stars svg {
    width: 16px; height: 16px;
    fill: var(--champagner);
  }
  .review-text {
    font-family: var(--font-display);
    font-size: 16px;
    font-style: italic;
    line-height: 1.65;
    color: ${hexToRgba(c.colors.background, 0.85)};
    margin-bottom: 24px;
    font-variation-settings: "opsz" 24, "SOFT" 60;
  }
  .review-author {
    display: flex; align-items: center; gap: 12px;
  }
  .review-avatar {
    width: 40px; height: 40px;
    background: ${hexToRgba(c.colors.accent, 0.15)};
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono); font-size: 12px; font-weight: 700;
    color: var(--champagner);
  }
  .review-name {
    font-weight: 600; font-size: 14px;
    color: var(--cream);
  }
  .review-meta {
    font-family: var(--font-mono);
    font-size: 11px; color: ${hexToRgba(c.colors.background, 0.5)};
    letter-spacing: 0.04em;
  }

  /* ========================================
     DIRECT BOOKING CTA
     ======================================== */
  .booking-section {
    background: var(--cream);
    padding: 100px 0;
  }
  .booking-card {
    background: var(--anthrazit);
    border-radius: 16px;
    padding: 64px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .booking-card::before {
    content: '';
    position: absolute; inset: 0;
    background-image:
      linear-gradient(${hexToRgba(c.colors.accent, 0.04)} 1px, transparent 1px),
      linear-gradient(90deg, ${hexToRgba(c.colors.accent, 0.04)} 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }
  .booking-card .eyebrow { color: var(--champagner); position: relative; }
  .booking-card h2 {
    font-size: clamp(28px, 3.5vw, 48px);
    color: var(--cream);
    margin-top: 16px; margin-bottom: 16px;
    position: relative;
  }
  .booking-card h2 em { color: var(--champagner); }
  .booking-card .lead {
    font-size: 17px; color: ${hexToRgba(c.colors.background, 0.6)};
    max-width: 520px; margin: 0 auto 36px;
    line-height: 1.7; position: relative;
  }
  .booking-features {
    display: flex; justify-content: center; gap: 28px;
    flex-wrap: wrap; margin-bottom: 40px;
    position: relative;
  }
  .cta-feature {
    display: flex; align-items: center; gap: 8px;
    font-family: var(--font-mono); font-size: 12px;
    color: ${hexToRgba(c.colors.background, 0.7)};
    letter-spacing: 0.04em;
  }
  .cta-feature svg {
    width: 16px; height: 16px;
    stroke: var(--champagner);
  }
  .booking-cta-btn {
    display: inline-flex; align-items: center; gap: 10px;
    background: var(--champagner); color: var(--anthrazit);
    padding: 18px 40px; border-radius: 4px; border: none;
    font-family: var(--font-mono); font-size: 14px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase;
    cursor: pointer; transition: all 0.3s var(--smooth);
    text-decoration: none; position: relative;
  }
  .booking-cta-btn:hover { background: var(--cream); transform: translateY(-2px); }
  .booking-cta-btn svg { width: 18px; height: 18px; }

  /* ========================================
     SPA & RESTAURANT HIGHLIGHT
     ======================================== */
  .spa-restaurant-section {
    background: var(--cream-tint);
    padding: 100px 0;
  }
  .feature-block {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
    margin-bottom: 80px;
  }
  .feature-block:last-child { margin-bottom: 0; }
  .feature-block.reverse { direction: rtl; }
  .feature-block.reverse > * { direction: ltr; }
  .feature-visual {
    border-radius: 16px;
    overflow: hidden;
    min-height: 400px;
    box-shadow: var(--shadow-image);
    position: relative;
  }
  .feature-visual-bg {
    position: absolute; inset: 0;
    background-size: cover; background-position: center;
  }
  .feature-visual .placeholder-bg {
    min-height: 400px;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono); font-size: 14px; color: var(--cream);
    flex-direction: column; gap: 12px;
  }
  .feature-visual .placeholder-bg svg {
    width: 48px; height: 48px; stroke: var(--champagner); fill: none; stroke-width: 1.5;
  }
  .feature-content .eyebrow { margin-bottom: 16px; }
  .feature-content h3 {
    font-family: var(--font-display);
    font-size: clamp(28px, 3vw, 42px);
    font-weight: 600;
    margin-bottom: 16px;
    font-variation-settings: "opsz" 72;
  }
  .feature-content p {
    font-size: 16px; color: var(--ink-soft);
    line-height: 1.7; margin-bottom: 24px;
    max-width: 480px;
  }
  .feature-list {
    list-style: none; padding: 0; margin: 0 0 28px;
    display: flex; flex-direction: column; gap: 10px;
  }
  .feature-list li {
    display: flex; align-items: center; gap: 10px;
    font-size: 14px; color: var(--ink);
  }
  .feature-list li svg {
    width: 18px; height: 18px; flex-shrink: 0;
    stroke: var(--champagner-dark);
  }
  .feature-link {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--font-mono); font-size: 13px; font-weight: 600;
    letter-spacing: 0.04em; text-transform: uppercase;
    color: var(--anthrazit);
    border-bottom: 2px solid var(--champagner);
    padding-bottom: 4px;
    transition: all 0.3s;
  }
  .feature-link:hover { color: var(--champagner-dark); }
  .feature-link svg { width: 14px; height: 14px; }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section {
    background: var(--cream);
    padding: 100px 0;
  }
  .faq-header {
    text-align: center;
    margin-bottom: 56px;
  }
  .faq-header h2 {
    font-size: clamp(32px, 4vw, 48px);
    margin-top: 16px;
  }
  .faq-list {
    max-width: 800px;
    margin: 0 auto;
  }
  .faq-item {
    border-bottom: 1px solid var(--border);
  }
  .faq-q {
    width: 100%; background: none; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: space-between;
    padding: 24px 0;
    font-family: var(--font-display);
    font-size: 18px; font-weight: 600; text-align: left;
    color: var(--ink);
    font-variation-settings: "opsz" 48;
    transition: color 0.2s;
  }
  .faq-q:hover { color: var(--champagner-dark); }
  .faq-icon {
    font-size: 24px; font-weight: 300;
    color: var(--champagner);
    font-family: var(--font-mono);
    transition: transform 0.3s;
    flex-shrink: 0; margin-left: 16px;
  }
  .faq-a {
    max-height: 0; overflow: hidden;
    transition: max-height 0.4s var(--smooth), padding 0.3s;
    font-size: 15px; color: var(--ink-soft);
    line-height: 1.7;
  }
  .faq-item.open .faq-a {
    max-height: 400px;
    padding-bottom: 24px;
  }
  .faq-item.open .faq-icon { transform: rotate(45deg); }

  /* ========================================
     CONTACT FORM
     ======================================== */
  .contact-section {
    background: var(--cream-tint);
    padding: 100px 0;
  }
  .contact-header {
    text-align: center;
    margin-bottom: 56px;
  }
  .contact-header h2 {
    font-size: clamp(32px, 4vw, 48px);
    margin-top: 16px;
  }
  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    max-width: 1000px;
    margin: 0 auto;
  }
  .contact-info {
    display: flex; flex-direction: column; gap: 24px;
  }
  .contact-detail {
    display: flex; align-items: flex-start; gap: 16px;
  }
  .contact-detail .icon {
    width: 44px; height: 44px;
    background: var(--champagner-soft);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .contact-detail .icon svg {
    width: 20px; height: 20px;
    stroke: var(--champagner-dark);
    fill: none; stroke-width: 1.5;
  }
  .contact-detail .detail-label {
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--ink-soft); margin-bottom: 4px;
  }
  .contact-detail .detail-value {
    font-weight: 600; font-size: 15px;
    color: var(--ink);
  }
  .contact-hours { margin-top: 8px; }
  .contact-hours h4 {
    font-family: var(--font-display);
    font-size: 18px; margin-bottom: 16px;
    font-variation-settings: "opsz" 48;
  }
  .hours-item {
    display: flex; justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
    font-size: 14px;
  }
  .hours-item .label {
    display: flex; align-items: center; gap: 8px;
    color: var(--ink-soft);
  }
  .hours-item .label svg {
    width: 14px; height: 14px; stroke: var(--champagner); fill: none;
  }
  .hours-item .value { font-weight: 600; }
  .contact-form-wrap {
    background: white;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 36px;
  }
  .form-group {
    margin-bottom: 20px;
  }
  .form-group label {
    display: block;
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--ink-soft); margin-bottom: 8px;
    font-weight: 500;
  }
  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 12px 16px;
    font-family: var(--font-body);
    font-size: 15px;
    color: var(--ink);
    background: var(--cream);
    transition: border-color 0.2s;
    outline: none;
  }
  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    border-color: var(--champagner);
  }
  .form-group textarea { min-height: 120px; resize: vertical; }
  .form-row {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  }
  .form-submit {
    width: 100%;
    background: var(--anthrazit); color: var(--champagner);
    border: none; padding: 14px 28px; border-radius: 6px;
    font-family: var(--font-mono); font-size: 13px;
    font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    cursor: pointer; transition: all 0.3s var(--smooth);
  }
  .form-submit:hover { background: var(--champagner); color: var(--anthrazit); }

  /* ========================================
     ABOUT / STORY
     ======================================== */
  .about-section {
    background: var(--cream);
    padding: 100px 0;
  }
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 64px;
    align-items: center;
  }
  .about-visual {
    border-radius: 16px;
    overflow: hidden;
    min-height: 420px;
    box-shadow: var(--shadow-image);
    background: linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 100%);
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .about-visual-letter {
    font-family: var(--font-display);
    font-size: 180px;
    font-weight: 700;
    font-style: italic;
    color: ${hexToRgba(c.colors.accent, 0.15)};
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }
  .about-content h2 {
    font-size: clamp(28px, 3.5vw, 44px);
    margin-bottom: 20px;
  }
  .about-content p {
    font-size: 16px; color: var(--ink-soft);
    line-height: 1.7; margin-bottom: 20px;
    max-width: 520px;
  }
  .about-stats {
    display: flex; gap: 32px;
    margin-top: 32px;
    padding-top: 32px;
    border-top: 1px solid var(--border);
  }
  .about-stat .num {
    font-family: var(--font-display);
    font-size: 36px; font-weight: 700;
    color: var(--anthrazit);
    font-variation-settings: "opsz" 72;
  }
  .about-stat .label {
    font-family: var(--font-mono);
    font-size: 11px; color: var(--ink-soft);
    letter-spacing: 0.08em; text-transform: uppercase;
    margin-top: 4px;
  }
  .gm-quote {
    margin-top: 32px;
    padding: 24px;
    background: var(--cream-tint);
    border-radius: 12px;
    border-left: 3px solid var(--champagner);
  }
  .gm-quote blockquote {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 16px; line-height: 1.65;
    color: var(--ink);
    font-variation-settings: "opsz" 24, "SOFT" 60;
  }
  .gm-quote .gm-name {
    margin-top: 12px;
    font-family: var(--font-mono);
    font-size: 12px; color: var(--ink-soft);
    letter-spacing: 0.04em;
  }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: var(--anthrazit);
    color: var(--cream);
    padding: 64px 0 0;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 1.5fr repeat(3, 1fr);
    gap: 48px;
    padding-bottom: 48px;
    border-bottom: 1px solid ${hexToRgba(c.colors.accent, 0.12)};
  }
  .footer-brand .logo {
    color: var(--cream);
    margin-bottom: 16px;
  }
  .footer-brand p {
    font-size: 14px; color: ${hexToRgba(c.colors.background, 0.6)};
    line-height: 1.7; max-width: 280px;
  }
  .footer-col h4 {
    font-family: var(--font-mono);
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--champagner);
    margin-bottom: 20px;
  }
  .footer-col ul { list-style: none; }
  .footer-col li { margin-bottom: 10px; }
  .footer-col a {
    font-size: 14px;
    color: ${hexToRgba(c.colors.background, 0.6)};
    transition: color 0.2s;
  }
  .footer-col a:hover { color: var(--cream); }
  .footer-bottom {
    display: flex; align-items: center; justify-content: space-between;
    padding: 24px 0;
    font-size: 13px;
    color: ${hexToRgba(c.colors.background, 0.4)};
  }
  .footer-bottom a { color: ${hexToRgba(c.colors.background, 0.5)}; transition: color 0.2s; }
  .footer-bottom a:hover { color: var(--champagner); }

  /* ========================================
     MOBILE CTA (STICKY)
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
    background: var(--anthrazit);
    color: var(--champagner);
    text-align: center;
    padding: 16px;
    font-family: var(--font-mono);
    font-size: 14px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase;
    box-shadow: 0 -4px 20px ${hexToRgba(c.colors.text, 0.15)};
  }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .rooms-grid { grid-template-columns: 1fr 1fr; gap: 24px; }
    .highlights-grid { grid-template-columns: 1fr 1fr; }
    .reviews-grid { grid-template-columns: 1fr 1fr; }
    .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
    .feature-block { grid-template-columns: 1fr; gap: 40px; }
    .feature-block.reverse { direction: ltr; }
  }

  @media (max-width: 768px) {
    .container { padding: 0 20px; }
    section { padding: 72px 0; }

    .nav-links { display: none; }
    .nav-cta { display: none; }
    .hamburger { display: block; }
    .nav-inner { padding: 14px 20px; }

    .hero { min-height: 100vh; }
    .hero .container { padding-top: 60px; padding-bottom: 60px; }

    .availability-bar {
      flex-direction: column;
      gap: 12px;
      padding: 20px;
    }
    .availability-field { min-width: 100%; }
    .availability-btn { width: 100%; text-align: center; }

    .rooms-grid { grid-template-columns: 1fr; }
    .room-image { height: 200px; }

    .highlights-grid { grid-template-columns: 1fr; }
    .highlight-card { padding: 28px 24px; }

    .location-grid { grid-template-columns: 1fr; }
    .location-map { min-height: 280px; }
    .location-map iframe { min-height: 280px; }

    .reviews-grid { grid-template-columns: 1fr; }

    .booking-card { padding: 40px 24px; }

    .contact-grid { grid-template-columns: 1fr; }

    .about-grid { grid-template-columns: 1fr; }
    .about-visual { min-height: 280px; }
    .about-visual-letter { font-size: 120px; }
    .about-stats { flex-wrap: wrap; gap: 20px; }

    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }

    .mobile-cta { display: block; }
    footer { padding-bottom: 64px; }

    .form-row { grid-template-columns: 1fr; }

    .feature-visual { min-height: 280px; }
    .feature-visual .placeholder-bg { min-height: 280px; }
  }

  @media (max-width: 480px) {
    .hero h1 { font-size: 36px; }
    .hero-tag { font-size: 10px; }
    .rooms-header h2,
    .highlights-header h2,
    .location-header h2,
    .reviews-header h2,
    .faq-header h2,
    .contact-header h2,
    .about-content h2 { font-size: 28px; }
    .booking-card h2 { font-size: 24px; }
    .room-body { padding: 20px; }
    .room-price .price-amount { font-size: 22px; }
    .about-stat .num { font-size: 28px; }
    .hero-trust { gap: 16px; }
    .booking-features { gap: 16px; }
  }
</style>
</head>
<body>

${c.announceText ? `<!-- Announcement Bar -->
<div class="announce">${c.announceText}</div>` : ''}

<!-- Navigation -->
<nav>
  <div class="nav-inner">
    <a href="#" class="logo">
      <div class="logo-mark">${logoInitial}</div>
      <div>
        <span>${esc(c.businessName)}</span>
        ${dehogaStars ? `<span class="logo-stars">${dehogaStars}</span>` : ''}
      </div>
    </a>
    <div class="nav-links">
      <a href="#rooms">Zimmer</a>
      <a href="#highlights">Highlights</a>
      <a href="#spa">Spa &amp; Restaurant</a>
      <a href="#location">Lage</a>
      <a href="#reviews">Bewertungen</a>
      <a href="#contact">Kontakt</a>
    </div>
    <a href="#booking" class="nav-cta">
      ${esc(c.bookingCtaText || 'Jetzt buchen')}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </a>
    <button class="hamburger" aria-label="Men&uuml; &ouml;ffnen" onclick="document.getElementById('mobile-menu').classList.add('open')">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<!-- Mobile Menu -->
<div class="mobile-menu" id="mobile-menu">
  <button class="mobile-close" aria-label="Men&uuml; schlie&szlig;en" onclick="document.getElementById('mobile-menu').classList.remove('open')">&times;</button>
  <a href="#rooms" onclick="document.getElementById('mobile-menu').classList.remove('open')">Zimmer</a>
  <a href="#highlights" onclick="document.getElementById('mobile-menu').classList.remove('open')">Highlights</a>
  <a href="#spa" onclick="document.getElementById('mobile-menu').classList.remove('open')">Spa &amp; Restaurant</a>
  <a href="#location" onclick="document.getElementById('mobile-menu').classList.remove('open')">Lage</a>
  <a href="#reviews" onclick="document.getElementById('mobile-menu').classList.remove('open')">Bewertungen</a>
  <a href="#contact" onclick="document.getElementById('mobile-menu').classList.remove('open')">Kontakt</a>
  <a href="#booking" class="mobile-cta-inner" onclick="document.getElementById('mobile-menu').classList.remove('open')">${esc(c.bookingCtaText || 'Jetzt buchen')}</a>
</div>

<!-- Hero -->
<section class="hero" id="hero">
  <div class="hero-bg"></div>
  <div class="hero-pattern"></div>
  <div class="container">
    <div class="hero-content">
      <div class="hero-tag">
        <span class="pulse"></span>
        ${esc(c.heroTag)}
      </div>
      <h1 class="display">
        ${c.heroHeadline}
        <em>${esc(c.heroAccent)}</em>
        <span class="subtitle">${esc(c.tagline)}</span>
      </h1>
      <p class="hero-lead">${c.heroLead}</p>

      <!-- Availability Check -->
      <div class="availability-bar" id="booking">
        <div class="availability-field">
          <label for="checkin">Check-in</label>
          <input type="date" id="checkin" name="checkin">
        </div>
        <div class="availability-field">
          <label for="checkout">Check-out</label>
          <input type="date" id="checkout" name="checkout">
        </div>
        <div class="availability-field">
          <label for="guests-select">G&auml;ste</label>
          <input type="number" id="guests-select" name="guests" min="1" max="6" value="2" style="color:var(--cream)">
        </div>
        <button class="availability-btn" onclick="document.getElementById('contact').scrollIntoView({behavior:'smooth'})">${esc(c.ctaText)}</button>
      </div>

      <div class="hero-trust">
        <div class="trust-item">
          <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Bestpreis-Garantie
        </div>
        <div class="trust-item">
          <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
          Kostenlose Stornierung
        </div>
        ${c.checkInTime ? `<div class="trust-item">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Check-in ab ${esc(c.checkInTime)}
        </div>` : ''}
        ${c.dehogaSterne ? `<div class="trust-item">
          <svg viewBox="0 0 24 24"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z"/></svg>
          ${c.dehogaSterne} Dehoga-Sterne
        </div>` : ''}
      </div>
    </div>
  </div>
</section>

<!-- Rooms Gallery -->
<section class="rooms-section" id="rooms">
  <div class="container">
    <div class="rooms-header">
      <span class="eyebrow">Unsere Zimmer &amp; Suiten</span>
      <h2 class="display">${esc(c.roomsSectionTitle || 'Ihr Refugium in der Stadt')}</h2>
      <p class="lead">${esc(c.roomsSectionSubtitle || 'W\u00e4hlen Sie aus unseren stilvoll gestalteten Zimmerkategorien \u2014 jedes ein Unikat des Berliner Boutique-Designs.')}</p>
    </div>
    <div class="rooms-grid">
      ${roomCardsHtml}
    </div>
  </div>
</section>

<!-- Highlights -->
<section class="highlights-section" id="highlights">
  <div class="container">
    <div class="highlights-header">
      <span class="eyebrow">Hotel Highlights</span>
      <h2 class="display">Was uns auszeichnet</h2>
    </div>
    <div class="highlights-grid">
      ${highlightsHtml}
    </div>
  </div>
</section>

<!-- Spa & Restaurant -->
<section class="spa-restaurant-section" id="spa">
  <div class="container">
    ${c.spaTitle ? `
    <div class="feature-block">
      <div class="feature-visual">
        ${c.spaImageUrl
          ? `<div class="feature-visual-bg" style="background-image:url('${esc(c.spaImageUrl)}')"></div>`
          : `<div class="placeholder-bg" style="background:linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 100%);">
              <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Spa &amp; Wellness
            </div>`}
      </div>
      <div class="feature-content">
        <span class="eyebrow">${esc(c.spaSubtitle || 'Spa & Wellness')}</span>
        <h3>${esc(c.spaTitle)}</h3>
        <p>${esc(c.spaText || '')}</p>
        ${spaFeaturesHtml ? `<ul class="feature-list">${spaFeaturesHtml}</ul>` : ''}
        <a href="#contact" class="feature-link">
          Termin anfragen
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
    ` : ''}

    ${c.restaurantTitle ? `
    <div class="feature-block reverse" id="restaurant">
      <div class="feature-visual">
        ${c.restaurantImageUrl
          ? `<div class="feature-visual-bg" style="background-image:url('${esc(c.restaurantImageUrl)}')"></div>`
          : `<div class="placeholder-bg" style="background:linear-gradient(135deg, ${c.colors.accent} 0%, ${accentDark} 100%);">
              <svg viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>
              Restaurant
            </div>`}
      </div>
      <div class="feature-content">
        <span class="eyebrow">${esc(c.restaurantSubtitle || 'Fine Dining')}</span>
        <h3>${esc(c.restaurantTitle)}</h3>
        <p>${esc(c.restaurantText || '')}</p>
        ${restaurantFeaturesHtml ? `<ul class="feature-list">${restaurantFeaturesHtml}</ul>` : ''}
        <a href="#contact" class="feature-link">
          Tisch reservieren
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
    ` : ''}
  </div>
</section>

<!-- Location & Map -->
<section class="location-section" id="location">
  <div class="container">
    <div class="location-header">
      <span class="eyebrow">Lage &amp; Anfahrt</span>
      <h2 class="display">${esc(c.locationTitle || 'Mitten im Herzen der Stadt')}</h2>
      <p class="lead">${esc(c.locationSubtitle || '')}</p>
    </div>
    <div class="location-grid">
      <div class="location-map">
        ${c.locationMapEmbed
          ? c.locationMapEmbed
          : `<div class="map-placeholder">
              <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${esc(c.address || 'Kartenansicht')}</span>
            </div>`}
      </div>
      <div class="poi-list">
        ${c.address ? `
        <div class="poi-item" style="border-color:var(--champagner);background:var(--champagner-soft)">
          <div class="poi-icon" style="background:var(--champagner)">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--anthrazit)" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div class="poi-info">
            <span class="poi-name">${esc(c.businessName)}</span>
            <span class="poi-distance">${esc(c.address)}</span>
          </div>
        </div>` : ''}
        ${poisHtml}
      </div>
    </div>
  </div>
</section>

<!-- Reviews -->
<section class="reviews-section" id="reviews">
  <div class="container">
    <div class="reviews-header">
      <span class="eyebrow">G&auml;stestimmen</span>
      <h2 class="display">${esc(c.reviewsSectionTitle || 'Was unsere G\u00e4ste sagen')}</h2>
      ${c.reviewsSectionSubtitle ? `<p class="lead">${esc(c.reviewsSectionSubtitle)}</p>` : ''}
    </div>
    <div class="reviews-grid">
      ${reviewsHtml}
    </div>
  </div>
</section>

<!-- Direct Booking CTA -->
<section class="booking-section">
  <div class="container">
    <div class="booking-card">
      <span class="eyebrow">Direktbuchung</span>
      <h2 class="display">${esc(c.ctaSectionTitle || 'Buchen Sie')} <em>${esc(c.ctaSectionSubtitle || 'direkt bei uns')}</em></h2>
      <p class="lead">Sichern Sie sich den besten Preis und exklusive Vorteile bei einer Direktbuchung &uuml;ber unser Hotel.</p>
      ${ctaFeaturesHtml ? `<div class="booking-features">${ctaFeaturesHtml}</div>` : ''}
      <a href="${esc(c.bookingUrl || '#booking')}" class="booking-cta-btn">
        ${esc(c.bookingCtaText || 'Jetzt buchen')}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </a>
    </div>
  </div>
</section>

<!-- About / Story -->
${c.aboutTitle ? `
<section class="about-section" id="about">
  <div class="container">
    <div class="about-grid">
      <div class="about-visual">
        <span class="about-visual-letter">${logoInitial}</span>
      </div>
      <div class="about-content">
        <span class="eyebrow">&Uuml;ber uns</span>
        <h2 class="display">${esc(c.aboutTitle)}</h2>
        <p>${esc(c.aboutText || '')}</p>
        ${c.aboutText2 ? `<p>${esc(c.aboutText2)}</p>` : ''}
        ${aboutStatsHtml}
        ${c.gmQuote ? `
        <div class="gm-quote">
          <blockquote>&ldquo;${esc(c.gmQuote)}&rdquo;</blockquote>
          <div class="gm-name">&mdash; ${esc(c.gmName || 'General Manager')}${c.gmRole ? `, ${esc(c.gmRole)}` : ''}</div>
        </div>` : ''}
      </div>
    </div>
  </div>
</section>
` : ''}

<!-- FAQ -->
${(c.faqItems && c.faqItems.length > 0) ? `
<section class="faq-section" id="faq">
  <div class="container">
    <div class="faq-header">
      <span class="eyebrow">H&auml;ufige Fragen</span>
      <h2 class="display">Gut zu wissen</h2>
    </div>
    <div class="faq-list">
      ${faqHtml}
    </div>
  </div>
</section>
` : ''}

<!-- Contact -->
<section class="contact-section" id="contact">
  <div class="container">
    <div class="contact-header">
      <span class="eyebrow">Kontakt &amp; Buchung</span>
      <h2 class="display">Wir freuen uns auf Sie</h2>
    </div>
    <div class="contact-grid">
      <div class="contact-info">
        ${c.address ? `
        <div class="contact-detail">
          <div class="icon"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
          <div>
            <div class="detail-label">Adresse</div>
            <div class="detail-value">${esc(c.address)}${c.city ? `, ${esc(c.postalCode || '')} ${esc(c.city)}` : ''}</div>
          </div>
        </div>` : ''}
        ${c.phone ? `
        <div class="contact-detail">
          <div class="icon"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
          <div>
            <div class="detail-label">Telefon</div>
            <div class="detail-value"><a href="tel:${esc(c.phone)}">${esc(c.phone)}</a></div>
          </div>
        </div>` : ''}
        ${c.email ? `
        <div class="contact-detail">
          <div class="icon"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
          <div>
            <div class="detail-label">E-Mail</div>
            <div class="detail-value"><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>
          </div>
        </div>` : ''}
        ${c.checkInTime || c.checkOutTime ? `
        <div class="contact-detail">
          <div class="icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
          <div>
            <div class="detail-label">Check-in / Check-out</div>
            <div class="detail-value">${c.checkInTime ? `Check-in ab ${esc(c.checkInTime)}` : ''}${c.checkInTime && c.checkOutTime ? ' &middot; ' : ''}${c.checkOutTime ? `Check-out bis ${esc(c.checkOutTime)}` : ''}</div>
          </div>
        </div>` : ''}

        <div class="contact-hours">
          <h4>Rezeption</h4>
          ${hoursHtml}
        </div>
      </div>
      <div class="contact-form-wrap">
        <form id="contact-form">
          <div class="form-row">
            <div class="form-group">
              <label for="contact-name">Name *</label>
              <input type="text" id="contact-name" name="name" required>
            </div>
            <div class="form-group">
              <label for="contact-email">E-Mail *</label>
              <input type="email" id="contact-email" name="email" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="contact-phone">Telefon</label>
              <input type="tel" id="contact-phone" name="phone">
            </div>
            <div class="form-group">
              <label for="contact-subject">Betreff</label>
              <select id="contact-subject" name="subject">
                <option value="Zimmerreservierung">Zimmerreservierung</option>
                <option value="Gruppenanfrage">Gruppenanfrage</option>
                <option value="Spa-Termin">Spa-Termin</option>
                <option value="Restaurantreservierung">Restaurantreservierung</option>
                <option value="Event-Anfrage">Event-Anfrage</option>
                <option value="Sonstiges">Sonstiges</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="contact-checkin">Gew&uuml;nschter Check-in</label>
              <input type="date" id="contact-checkin" name="checkin_date">
            </div>
            <div class="form-group">
              <label for="contact-checkout">Gew&uuml;nschter Check-out</label>
              <input type="date" id="contact-checkout" name="checkout_date">
            </div>
          </div>
          <div class="form-group">
            <label for="contact-message">Nachricht</label>
            <textarea id="contact-message" name="message" placeholder="Teilen Sie uns Ihre W&uuml;nsche mit..."></textarea>
          </div>
          <button type="submit" class="form-submit" id="contact-submit">Anfrage senden</button>
        </form>
      </div>
    </div>
  </div>
</section>

<!-- Footer -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="logo">
          <div class="logo-mark">${logoInitial}</div>
          <div>
            <span>${esc(c.businessName)}</span>
            ${dehogaStars ? `<span class="logo-stars">${dehogaStars}</span>` : ''}
          </div>
        </div>
        <p>${esc(c.footerText || c.tagline)}</p>
      </div>
      ${footerColumnsHtml}
    </div>
    <div class="footer-bottom">
      <span>&copy; ${new Date().getFullYear()} ${esc(c.businessName)}</span>
      <span><a href="${esc(c.imprintUrl || '#')}">Impressum</a> &middot; <a href="${esc(c.privacyUrl || '#')}">Datenschutz</a></span>
    </div>
  </div>
</footer>

<!-- Sticky Mobile CTA -->
<a href="#booking" class="mobile-cta">${esc(c.bookingCtaText || 'Jetzt buchen')} &rarr;</a>

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

  /* Set default dates for availability bar */
  (function() {
    var today = new Date();
    var tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    var dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    function fmt(d) { return d.toISOString().split('T')[0]; }
    var ci = document.getElementById('checkin');
    var co = document.getElementById('checkout');
    if (ci && !ci.value) ci.value = fmt(tomorrow);
    if (co && !co.value) co.value = fmt(dayAfter);
    if (ci) ci.setAttribute('min', fmt(today));
    if (ci) ci.addEventListener('change', function() {
      var next = new Date(ci.value);
      next.setDate(next.getDate() + 1);
      co.setAttribute('min', fmt(next));
      if (co.value && co.value <= ci.value) co.value = fmt(next);
    });
  })();

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
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:var(--anthrazit);font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:var(--ink-soft);font-size:1.05rem">Wir melden uns in K\\u00fcrze bei Ihnen.</p></div>';
          } else {
            alert(d.error || 'Fehler beim Senden');
            btn.textContent = 'Anfrage senden';
            btn.disabled = false;
          }
        })
        .catch(function() {
          alert('Verbindungsfehler');
          btn.textContent = 'Anfrage senden';
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
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba(c.colors.primary, 0.97)};backdrop-filter:blur(12px);color:var(--cream);padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:${hexToRgba(c.colors.background, 0.8)}">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--champagner);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--champagner);color:var(--anthrazit);border:none;padding:8px 20px;border-radius:4px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
