export interface HotelLandConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Tannengrün
    accent: string     // Holz-Braun
    background: string // Cream
    text: string       // Dark text
  }
  phone?: string
  email?: string
  address?: string
  website?: string
  openingHours: { days: string; hours: string }[]
  rooms: {
    name: string
    description: string
    price: string
    priceNote?: string
    size?: string
    guests?: string
    amenities?: string[]
    imageUrl?: string
    tag?: string
  }[]
  highlights: { icon: string; title: string; description: string }[]
  pointsOfInterest: { name: string; distance: string; type: string }[]
  reviews: { text: string; name: string; source: string; rating: number }[]
  restaurantName?: string
  restaurantDescription?: string
  restaurantFeatures?: string[]
  menuHighlights?: { name: string; description: string; price?: string; tag?: string }[]
  faqItems?: { question: string; answer: string }[]
  heroImageUrl?: string
  aboutTitle?: string
  aboutText?: string
  aboutText2?: string
  ownerName?: string
  ownerRole?: string
  ownerQuote?: string
  contactEnabled?: boolean
  imprintUrl?: string
  privacyUrl?: string
  footerText?: string
  footerColumns?: { title: string; links: { label: string; href: string }[] }[]
  galleryItems?: { label: string; imageUrl?: string }[]
  aboutStats?: { value: string; label: string }[]
  locationTitle?: string
  locationSubtitle?: string
  locationDetails?: { icon: string; label: string; value: string }[]
  ctaSectionTitle?: string
  ctaSectionSubtitle?: string
  ctaFeatures?: string[]
  roomsSectionTitle?: string
  roomsSectionSubtitle?: string
  highlightsSectionTitle?: string
  highlightsSectionSubtitle?: string
  reviewsSectionTitle?: string
  restaurantSectionTitle?: string
  restaurantSectionSubtitle?: string
  starRating?: number
  checkInTime?: string
  checkOutTime?: string
  boardOptions?: string[]
  seasons?: { name: string; from: string; to: string; surcharge?: string }[]
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

function generateHotelStarsSvg(count: number): string {
  const star = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z"/></svg>'
  return Array(count).fill(star).join('')
}

export function renderHotelLandTemplate(config: HotelLandConfig, siteId?: string): string {
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
  const starRating = c.starRating || 4

  // Rooms HTML
  const roomsHtml = c.rooms.map(room => {
    const amenitiesHtml = (room.amenities || []).map(a => `<span class="room-amenity">${esc(a)}</span>`).join('')
    const bgStyle = room.imageUrl
      ? `background-image:url('${esc(room.imageUrl)}');background-size:cover;background-position:center`
      : `background:linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 100%)`
    return `
        <div class="room-card">
          <div class="room-image" style="${bgStyle}">
            ${room.tag ? `<span class="room-tag">${esc(room.tag)}</span>` : ''}
          </div>
          <div class="room-info">
            <h3>${esc(room.name)}</h3>
            <p class="room-desc">${esc(room.description)}</p>
            <div class="room-meta">
              ${room.size ? `<span class="room-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>${esc(room.size)}</span>` : ''}
              ${room.guests ? `<span class="room-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>${esc(room.guests)}</span>` : ''}
            </div>
            ${amenitiesHtml ? `<div class="room-amenities">${amenitiesHtml}</div>` : ''}
            <div class="room-price-row">
              <div class="room-price">ab ${esc(room.price)} <span class="price-note">${esc(room.priceNote || '/ Nacht')}</span></div>
              <a href="#booking" class="room-book-btn">Verf&uuml;gbarkeit pr&uuml;fen</a>
            </div>
          </div>
        </div>`
  }).join('\n')

  // Highlights HTML
  const highlightsHtml = c.highlights.map(h => `
        <div class="highlight-card">
          <div class="highlight-icon">
            ${h.icon === 'mountain' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 21l4-10 4 10"/><path d="M2 21h20"/><path d="M12 11l3-7 5 17"/><circle cx="18" cy="5" r="2"/></svg>'
            : h.icon === 'sauna' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 20h16"/><path d="M8 16c0-3 2-5 4-7 2 2 4 4 4 7"/><path d="M6 16c0-4.5 3-7.5 6-10.5 3 3 6 6 6 10.5"/></svg>'
            : h.icon === 'breakfast' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><path d="M6 1v3M10 1v3M14 1v3"/></svg>'
            : h.icon === 'hiking' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="13" cy="4" r="2"/><path d="M7 21l3-7 2.5 3L17 11"/><path d="M10 14l-2 7"/><path d="M16 21l-2-4"/></svg>'
            : h.icon === 'wellness' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>'
            : h.icon === 'ski' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="4" r="2"/><path d="M5 21l3-9h8l3 9"/><path d="M10 12l-2-4h8l-2 4"/></svg>'
            : h.icon === 'pool' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 16c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 20c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M9 6v8M15 6v8"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>'
            : h.icon === 'parking' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="4"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>'
            : h.icon === 'family' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="5" r="2"/><circle cx="17" cy="5" r="2"/><circle cx="12" cy="8" r="1.5"/><path d="M5 21v-4a2 2 0 0 1 2-2h2M19 21v-4a2 2 0 0 0-2-2h-2M10 21v-3a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v3"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>'}
          </div>
          <h3>${esc(h.title)}</h3>
          <p>${esc(h.description)}</p>
        </div>`
  ).join('\n')

  // POI Map items
  const poiHtml = c.pointsOfInterest.map(poi => `
        <div class="poi-item">
          <div class="poi-icon">
            ${poi.type === 'hiking' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M13 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7 21l3-7 2.5 3L17 11M10 14l-2 7M16 21l-2-4"/></svg>'
            : poi.type === 'ski' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M5 21l3-9h8l3 9M10 12l-2-4h8l-2 4"/><circle cx="12" cy="4" r="2"/></svg>'
            : poi.type === 'lake' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M2 16c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1"/><path d="M2 20c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1"/></svg>'
            : poi.type === 'village' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>'
            : poi.type === 'restaurant' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'}
          </div>
          <div class="poi-info">
            <span class="poi-name">${esc(poi.name)}</span>
            <span class="poi-distance">${esc(poi.distance)}</span>
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

  // Restaurant menu highlights
  const menuHighlights = c.menuHighlights || []
  const menuHighlightsHtml = menuHighlights.map(item => `
        <div class="menu-highlight-item">
          <div class="menu-highlight-info">
            <h4>${esc(item.name)}</h4>
            <p>${esc(item.description)}</p>
            ${item.tag ? `<span class="menu-tag">${esc(item.tag)}</span>` : ''}
          </div>
          ${item.price ? `<div class="menu-highlight-price">${esc(item.price)}</div>` : ''}
        </div>`
  ).join('\n')

  // FAQ HTML
  const faqHtml = (c.faqItems || []).map(f => `
      <div class="faq-item">
        <button class="faq-q" aria-expanded="false">${esc(f.question)}<span class="faq-icon">+</span></button>
        <div class="faq-a" role="region">${esc(f.answer)}</div>
      </div>`).join('')

  // Opening hours HTML
  const hoursHtml = c.openingHours.map(h => `
      <div class="hours-item">
        <div class="label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          ${esc(h.days)}
        </div>
        <div class="value">${esc(h.hours)}</div>
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

  // Gallery items
  const galleryItems = c.galleryItems || [
    { label: 'Bergpanorama' },
    { label: 'Wellness-Bereich' },
    { label: 'Zimmer' },
    { label: 'Restaurant' },
    { label: 'Garten' },
  ]
  const galleryLetters = ['a', 'b', 'c', 'd', 'e']
  const defaultGradients = [
    `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 60%, ${darkenHex(c.colors.primary, 0.4)} 100%)`,
    `linear-gradient(135deg, ${c.colors.accent} 0%, ${accentDark} 100%)`,
    `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.2)} 0%, ${c.colors.primary} 100%)`,
    `linear-gradient(135deg, ${c.colors.accent} 0%, ${c.colors.primary} 100%)`,
    `linear-gradient(135deg, ${textSoft} 0%, ${darkenHex(c.colors.primary, 0.15)} 100%)`,
  ]
  const galleryHtml = galleryItems.slice(0, 5).map((item, i) => {
    const letter = galleryLetters[i] || 'a'
    const bg = item.imageUrl
      ? `background-image:url('${esc(item.imageUrl)}');background-size:cover;background-position:center`
      : `background:${defaultGradients[i] || defaultGradients[0]}`
    return `<div class="gallery-item ${letter}" style="${bg}"><div class="caption">${esc(item.label)}</div></div>`
  }).join('\n      ')

  // Location details
  const locationDetails = c.locationDetails || []
  const locationDetailsHtml = locationDetails.map(d => `
      <div class="location-detail">
        <div class="icon">
          ${d.icon === 'pin' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
          : d.icon === 'transit' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>'
          : d.icon === 'phone' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
          : d.icon === 'car' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M5 17l-1 2M19 17l1 2"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>'
          : d.icon === 'altitude' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21l4-10 4 10M2 21h20"/><path d="M12 11l3-7 5 17"/></svg>'
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
    { title: 'Hotel', links: [
      { label: 'Zimmer', href: '#rooms' },
      { label: 'Restaurant', href: '#restaurant' },
      { label: 'Wellness', href: '#highlights' },
    ]},
    { title: 'Entdecken', links: [
      { label: 'Lage &amp; Umgebung', href: '#location' },
      { label: 'Bewertungen', href: '#reviews' },
      { label: 'FAQ', href: '#faq' },
    ]},
  ]
  const footerColumnsHtml = footerColumns.map(col => `
      <div class="footer-col">
        <h4>${col.title}</h4>
        <ul>
          ${col.links.map(l => `<li><a href="${esc(l.href)}">${l.label}</a></li>`).join('\n          ')}
        </ul>
      </div>`).join('')

  // Board options
  const boardOptions = c.boardOptions || ['Fr&uuml;hst&uuml;cksbuffet', 'Halbpension', 'Vollpension']
  const boardOptionsHtml = boardOptions.map(b => `<span class="board-option">${b}</span>`).join('')

  // Seasons info
  const seasonsHtml = (c.seasons || []).map(s => `
        <div class="season-row">
          <span class="season-name">${esc(s.name)}</span>
          <span class="season-dates">${esc(s.from)} &ndash; ${esc(s.to)}</span>
          ${s.surcharge ? `<span class="season-surcharge">${esc(s.surcharge)}</span>` : ''}
        </div>`).join('')

  // Restaurant features
  const restaurantFeatures = c.restaurantFeatures || ['Regionale K&uuml;che', 'Saisonale Speisekarte', 'Panorama-Terrasse', 'Vegetarische Optionen']
  const restaurantFeaturesHtml = restaurantFeatures.map(f => `
        <div class="rest-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M5 13l4 4L19 7"/></svg>
          <span>${f}</span>
        </div>`).join('')

  // Average rating for schema
  const avgRating = c.reviews.length > 0
    ? (c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length).toFixed(1)
    : '4.5'

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

<!-- Schema.org Hotel with starRating -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Hotel",
  "name": "${esc(c.businessName)}",
  "description": "${esc(c.tagline)}",
  ${c.address ? `"address": { "@type": "PostalAddress", "streetAddress": "${esc(c.address)}" },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  "starRating": {
    "@type": "Rating",
    "ratingValue": "${starRating}"
  },
  ${c.checkInTime ? `"checkinTime": "${esc(c.checkInTime)}",` : ''}
  ${c.checkOutTime ? `"checkoutTime": "${esc(c.checkOutTime)}",` : ''}
  "amenityFeature": [
    ${c.highlights.map(h => `{ "@type": "LocationFeatureSpecification", "name": "${esc(h.title)}", "value": true }`).join(',\n    ')}
  ],
  "priceRange": "$$",
  ${c.reviews.length > 0 ? `"aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "${avgRating}",
    "reviewCount": "${c.reviews.length}",
    "bestRating": "5"
  },` : ''}
  "url": "${appUrl}${siteId ? `/s/${siteId}` : ''}"
}
</script>

<style>
  /* ========================================
     DESIGN TOKENS
     ======================================== */
  :root {
    --tannengruen:        ${esc(c.colors.primary)};
    --tannengruen-dark:   ${primaryDark};
    --tannengruen-soft:   ${primarySoft};
    --holz:               ${esc(c.colors.accent)};
    --holz-dark:          ${accentDark};
    --holz-soft:          ${accentSoft};
    --cream:              ${esc(c.colors.background)};
    --cream-tint:         ${bgTint};
    --cream-warm:         ${bgWarm};
    --ink:                ${esc(c.colors.text)};
    --ink-soft:           ${textSoft};
    --border:             ${borderColor};

    --font-display: 'Fraunces', serif;
    --font-body:    'Inter Tight', sans-serif;
    --font-mono:    'JetBrains Mono', monospace;

    --radius-sm:  8px;
    --radius-md:  14px;
    --radius-lg:  20px;
    --radius-xl:  28px;
    --shadow-sm:  0 1px 3px rgba(0,0,0,.06);
    --shadow-md:  0 4px 16px rgba(0,0,0,.08);
    --shadow-lg:  0 8px 40px rgba(0,0,0,.1);
    --shadow-xl:  0 16px 64px rgba(0,0,0,.14);
  }

  /* ========================================
     RESET & BASE
     ======================================== */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
  body {
    font-family: var(--font-body);
    background: var(--cream);
    color: var(--ink);
    line-height: 1.7;
    font-size: 16px;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }
  img { max-width: 100%; height: auto; display: block; }
  a { color: inherit; text-decoration: none; }
  .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

  /* ========================================
     TYPOGRAPHY
     ======================================== */
  .display {
    font-family: var(--font-display);
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.02em;
    font-variation-settings: "SOFT" 50;
  }
  .display em { font-style: normal; color: var(--holz); }
  .eyebrow {
    font-family: var(--font-mono);
    font-size: .78rem;
    font-weight: 600;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--holz);
  }
  .section-head { text-align: center; margin-bottom: 56px; }
  .section-head .eyebrow { display: block; margin-bottom: 14px; }
  .section-head .display { font-size: clamp(1.8rem, 4vw, 2.8rem); }
  .section-head p { max-width: 640px; margin: 16px auto 0; color: var(--ink-soft); font-size: 1.05rem; }

  /* ========================================
     NAVIGATION
     ======================================== */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
    background: ${hexToRgba(c.colors.background, 0.92)};
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    transition: all .35s ease;
  }
  nav.scrolled {
    background: ${hexToRgba(c.colors.background, 0.97)};
    box-shadow: var(--shadow-sm);
  }
  .nav-inner {
    display: flex; align-items: center; justify-content: space-between;
    max-width: 1200px; margin: 0 auto; padding: 0 24px;
    height: 68px;
  }
  .logo {
    display: flex; align-items: center; gap: 10px;
    font-family: var(--font-display); font-weight: 700; font-size: 1.2rem;
    color: var(--tannengruen-dark);
  }
  .logo-mark {
    display: flex; align-items: center; justify-content: center;
    width: 38px; height: 38px;
    background: linear-gradient(135deg, var(--tannengruen), var(--tannengruen-dark));
    color: var(--cream); border-radius: var(--radius-sm);
    font-family: var(--font-display); font-weight: 800; font-size: 1.1rem;
  }
  .nav-links { display: flex; gap: 32px; list-style: none; }
  .nav-links a {
    font-size: .88rem; font-weight: 500; color: var(--ink-soft);
    transition: color .2s; position: relative;
  }
  .nav-links a::after {
    content: ''; position: absolute; left: 0; bottom: -4px;
    width: 0; height: 2px; background: var(--holz);
    transition: width .25s ease;
  }
  .nav-links a:hover { color: var(--tannengruen); }
  .nav-links a:hover::after { width: 100%; }
  .nav-cta {
    background: var(--tannengruen); color: var(--cream);
    padding: 10px 22px; border-radius: 50px;
    font-size: .85rem; font-weight: 600;
    transition: all .25s ease; border: none; cursor: pointer;
  }
  .nav-cta:hover { background: var(--tannengruen-dark); transform: translateY(-1px); box-shadow: var(--shadow-md); }
  .nav-stars {
    display: flex; gap: 2px; color: var(--holz); margin-left: 8px;
  }
  .nav-stars svg { width: 14px; height: 14px; fill: var(--holz); }

  /* Mobile nav toggle */
  .nav-toggle { display: none; background: none; border: none; cursor: pointer; padding: 8px; }
  .nav-toggle span { display: block; width: 22px; height: 2px; background: var(--ink); margin: 5px 0; transition: .3s; border-radius: 2px; }

  @media (max-width: 768px) {
    .nav-links { display: none; position: absolute; top: 68px; left: 0; right: 0; flex-direction: column; background: var(--cream); padding: 20px 24px; gap: 16px; border-bottom: 1px solid var(--border); box-shadow: var(--shadow-md); }
    .nav-links.open { display: flex; }
    .nav-toggle { display: block; }
    .nav-cta.desktop { display: none; }
    .nav-stars { display: none; }
  }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    position: relative;
    min-height: 100vh;
    display: flex; align-items: center;
    padding: 120px 0 80px;
    overflow: hidden;
  }
  .hero::before {
    content: ''; position: absolute; inset: 0;
    background: ${c.heroImageUrl
      ? `url('${esc(c.heroImageUrl)}') center/cover no-repeat`
      : `linear-gradient(165deg, ${c.colors.primary} 0%, ${darkenHex(c.colors.primary, 0.3)} 40%, ${darkenHex(c.colors.primary, 0.5)} 100%)`};
    z-index: 0;
  }
  .hero::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,.35) 0%, rgba(0,0,0,.5) 100%);
    z-index: 1;
  }
  .hero .container { position: relative; z-index: 2; }
  .hero-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px;
    align-items: center;
  }
  .hero-content { color: var(--cream); }
  .hero-tag {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--font-mono); font-size: .75rem; font-weight: 600;
    letter-spacing: .1em; text-transform: uppercase;
    color: var(--holz); background: ${hexToRgba(c.colors.accent, 0.2)};
    padding: 6px 16px; border-radius: 50px;
    margin-bottom: 24px;
  }
  .hero-stars { display: flex; gap: 3px; color: var(--holz); margin-bottom: 20px; }
  .hero-stars svg { fill: var(--holz); }
  .hero h1 {
    font-family: var(--font-display); font-weight: 800;
    font-size: clamp(2.2rem, 5vw, 3.8rem);
    line-height: 1.1; letter-spacing: -0.025em;
    margin-bottom: 20px;
    font-variation-settings: "SOFT" 60;
  }
  .hero h1 em { font-style: normal; color: var(--holz); }
  .hero-lead {
    font-size: 1.15rem; line-height: 1.7;
    color: ${hexToRgba(c.colors.background, 0.85)};
    margin-bottom: 32px; max-width: 520px;
  }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
  .hero-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 32px; border-radius: 50px;
    font-weight: 600; font-size: .95rem;
    transition: all .3s ease; border: none; cursor: pointer;
    font-family: var(--font-body);
  }
  .hero-btn.primary {
    background: var(--holz); color: var(--cream);
  }
  .hero-btn.primary:hover { background: var(--holz-dark); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .hero-btn.secondary {
    background: ${hexToRgba(c.colors.background, 0.15)};
    color: var(--cream); border: 1px solid ${hexToRgba(c.colors.background, 0.3)};
    backdrop-filter: blur(8px);
  }
  .hero-btn.secondary:hover { background: ${hexToRgba(c.colors.background, 0.25)}; }

  /* Booking Widget */
  .booking-widget {
    background: ${hexToRgba(c.colors.background, 0.12)};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid ${hexToRgba(c.colors.background, 0.2)};
    border-radius: var(--radius-lg);
    padding: 32px;
    color: var(--cream);
  }
  .booking-widget h3 {
    font-family: var(--font-display); font-weight: 700; font-size: 1.3rem;
    margin-bottom: 24px; color: var(--cream);
  }
  .booking-field { margin-bottom: 16px; }
  .booking-field label {
    display: block; font-size: .8rem; font-weight: 600;
    letter-spacing: .05em; text-transform: uppercase;
    color: ${hexToRgba(c.colors.background, 0.7)};
    margin-bottom: 6px; font-family: var(--font-mono);
  }
  .booking-field input,
  .booking-field select {
    width: 100%; padding: 12px 16px;
    background: ${hexToRgba(c.colors.background, 0.1)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.25)};
    border-radius: var(--radius-sm);
    color: var(--cream); font-family: var(--font-body);
    font-size: .95rem; outline: none;
    transition: border-color .2s;
  }
  .booking-field input:focus,
  .booking-field select:focus {
    border-color: var(--holz);
  }
  .booking-field input::placeholder { color: ${hexToRgba(c.colors.background, 0.5)}; }
  .booking-field select option { background: var(--tannengruen-dark); color: var(--cream); }
  .booking-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .booking-submit {
    width: 100%; padding: 14px;
    background: var(--holz); color: var(--cream);
    border: none; border-radius: var(--radius-sm);
    font-weight: 700; font-size: 1rem;
    cursor: pointer; transition: all .25s;
    font-family: var(--font-body); margin-top: 8px;
  }
  .booking-submit:hover { background: var(--holz-dark); transform: translateY(-1px); }
  .booking-note {
    text-align: center; font-size: .78rem;
    color: ${hexToRgba(c.colors.background, 0.6)};
    margin-top: 12px;
  }

  @media (max-width: 768px) {
    .hero { padding: 100px 0 60px; }
    .hero-grid { grid-template-columns: 1fr; gap: 40px; }
    .booking-widget { margin-top: 10px; }
    .booking-row { grid-template-columns: 1fr; }
  }

  ${c.announceText ? `
  /* ========================================
     ANNOUNCEMENT BAR
     ======================================== */
  .announce-bar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 1001;
    background: linear-gradient(90deg, var(--tannengruen), var(--tannengruen-dark));
    color: var(--cream); text-align: center;
    padding: 8px 24px; font-size: .82rem; font-weight: 500;
  }
  .announce-bar ~ nav { top: 36px; }
  .announce-bar ~ .hero { padding-top: 156px; }
  ` : ''}

  /* ========================================
     ROOMS
     ======================================== */
  .rooms-section { padding: 100px 0; background: var(--cream); }
  .rooms-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 32px; }
  .room-card {
    background: #fff; border-radius: var(--radius-lg);
    overflow: hidden; border: 1px solid var(--border);
    transition: all .35s ease;
  }
  .room-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
  .room-image {
    height: 240px; position: relative;
    display: flex; align-items: flex-start; justify-content: flex-end;
    padding: 16px;
  }
  .room-tag {
    background: var(--holz); color: var(--cream);
    padding: 4px 14px; border-radius: 50px;
    font-size: .78rem; font-weight: 600;
    font-family: var(--font-mono); letter-spacing: .05em;
  }
  .room-info { padding: 28px; }
  .room-info h3 {
    font-family: var(--font-display); font-weight: 700;
    font-size: 1.35rem; margin-bottom: 10px; color: var(--tannengruen-dark);
  }
  .room-desc { font-size: .92rem; color: var(--ink-soft); margin-bottom: 16px; line-height: 1.6; }
  .room-meta { display: flex; gap: 16px; margin-bottom: 14px; flex-wrap: wrap; }
  .room-detail {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: .82rem; color: var(--ink-soft);
  }
  .room-detail svg { color: var(--holz); }
  .room-amenities { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 18px; }
  .room-amenity {
    font-size: .75rem; font-weight: 500;
    padding: 4px 12px; border-radius: 50px;
    background: var(--tannengruen-soft);
    color: var(--tannengruen-dark);
    font-family: var(--font-mono); letter-spacing: .02em;
  }
  .room-price-row {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 18px; border-top: 1px solid var(--border); gap: 12px;
    flex-wrap: wrap;
  }
  .room-price {
    font-family: var(--font-display); font-weight: 700;
    font-size: 1.3rem; color: var(--tannengruen-dark);
  }
  .price-note { font-size: .78rem; font-weight: 400; color: var(--ink-soft); }
  .room-book-btn {
    display: inline-flex; align-items: center;
    padding: 10px 20px; border-radius: 50px;
    background: var(--tannengruen); color: var(--cream);
    font-size: .82rem; font-weight: 600;
    transition: all .25s;
  }
  .room-book-btn:hover { background: var(--tannengruen-dark); transform: translateY(-1px); }

  /* Board options */
  .board-options { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 32px; }
  .board-option {
    padding: 8px 20px; border-radius: 50px;
    background: ${hexToRgba(c.colors.accent, 0.1)};
    color: var(--holz-dark); font-size: .85rem; font-weight: 600;
    font-family: var(--font-mono); letter-spacing: .03em;
    border: 1px solid ${hexToRgba(c.colors.accent, 0.25)};
  }

  /* Seasons info */
  .seasons-info { margin-top: 28px; max-width: 600px; margin-left: auto; margin-right: auto; }
  .season-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 0; border-bottom: 1px solid var(--border);
    font-size: .88rem;
  }
  .season-name { font-weight: 600; color: var(--tannengruen-dark); }
  .season-dates { color: var(--ink-soft); font-family: var(--font-mono); font-size: .82rem; }
  .season-surcharge { color: var(--holz-dark); font-weight: 600; font-size: .82rem; }

  @media (max-width: 768px) {
    .rooms-section { padding: 70px 0; }
    .rooms-grid { grid-template-columns: 1fr; }
  }

  /* ========================================
     HIGHLIGHTS
     ======================================== */
  .highlights-section { padding: 100px 0; background: var(--cream-tint); }
  .highlights-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 28px; }
  .highlight-card {
    background: #fff; border-radius: var(--radius-lg);
    padding: 36px 28px; border: 1px solid var(--border);
    transition: all .35s ease; text-align: center;
  }
  .highlight-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--holz); }
  .highlight-icon {
    display: flex; align-items: center; justify-content: center;
    width: 64px; height: 64px; margin: 0 auto 20px;
    background: var(--tannengruen-soft);
    border-radius: var(--radius-md);
    color: var(--tannengruen);
  }
  .highlight-icon svg { width: 30px; height: 30px; }
  .highlight-card h3 {
    font-family: var(--font-display); font-weight: 700;
    font-size: 1.15rem; margin-bottom: 10px; color: var(--tannengruen-dark);
  }
  .highlight-card p { font-size: .9rem; color: var(--ink-soft); line-height: 1.6; }

  @media (max-width: 768px) {
    .highlights-section { padding: 70px 0; }
    .highlights-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 480px) {
    .highlights-grid { grid-template-columns: 1fr; }
  }

  /* ========================================
     GALLERY
     ======================================== */
  .gallery-section { padding: 100px 0; background: var(--cream); }
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: 220px 220px;
    gap: 16px;
  }
  .gallery-item {
    border-radius: var(--radius-md);
    overflow: hidden; position: relative;
    display: flex; align-items: flex-end;
    padding: 20px; cursor: pointer;
    transition: transform .35s ease;
  }
  .gallery-item:hover { transform: scale(1.02); }
  .gallery-item .caption {
    font-family: var(--font-display); font-weight: 600;
    font-size: 1rem; color: #fff;
    text-shadow: 0 2px 8px rgba(0,0,0,.3);
    position: relative; z-index: 1;
  }
  .gallery-item::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,.5) 0%, transparent 60%);
  }
  .gallery-item.a { grid-column: span 2; }
  .gallery-item.c { grid-column: span 2; }

  @media (max-width: 768px) {
    .gallery-grid { grid-template-columns: 1fr 1fr; grid-template-rows: auto; }
    .gallery-item { min-height: 180px; }
    .gallery-item.a, .gallery-item.c { grid-column: span 1; }
  }

  /* ========================================
     LOCATION & POI MAP
     ======================================== */
  .location-section { padding: 100px 0; background: var(--cream-tint); }
  .location-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
  .location-info h3 { font-family: var(--font-display); font-weight: 700; font-size: 1.4rem; margin-bottom: 8px; }
  .location-info > p { color: var(--ink-soft); margin-bottom: 24px; }
  .location-detail {
    display: flex; gap: 14px; align-items: flex-start; margin-bottom: 16px;
  }
  .location-detail .icon {
    display: flex; align-items: center; justify-content: center;
    width: 40px; height: 40px; min-width: 40px;
    background: var(--tannengruen-soft); border-radius: var(--radius-sm);
    color: var(--tannengruen);
  }
  .location-detail .icon svg { width: 20px; height: 20px; }
  .location-detail .label { font-size: .82rem; color: var(--ink-soft); }
  .location-detail .value { font-weight: 600; font-size: .95rem; }

  /* POI Map Card */
  .poi-map-card {
    background: #fff; border-radius: var(--radius-lg);
    border: 1px solid var(--border); overflow: hidden;
  }
  .poi-map-header {
    background: linear-gradient(135deg, var(--tannengruen), var(--tannengruen-dark));
    padding: 24px 28px; color: var(--cream);
  }
  .poi-map-header h4 {
    font-family: var(--font-display); font-weight: 700; font-size: 1.15rem;
    margin-bottom: 4px;
  }
  .poi-map-header p { font-size: .85rem; color: ${hexToRgba(c.colors.background, 0.7)}; }
  .poi-list { padding: 8px 0; }
  .poi-item {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 28px; transition: background .2s;
  }
  .poi-item:hover { background: var(--tannengruen-soft); }
  .poi-icon {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; min-width: 36px;
    background: var(--tannengruen-soft);
    border-radius: var(--radius-sm); color: var(--tannengruen);
  }
  .poi-info { display: flex; justify-content: space-between; flex: 1; align-items: center; }
  .poi-name { font-weight: 600; font-size: .92rem; }
  .poi-distance {
    font-family: var(--font-mono); font-size: .8rem;
    color: var(--holz-dark); font-weight: 600;
  }

  @media (max-width: 768px) {
    .location-section { padding: 70px 0; }
    .location-grid { grid-template-columns: 1fr; }
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews-section { padding: 100px 0; background: var(--cream); }
  .reviews-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
  .review-card {
    background: #fff; border-radius: var(--radius-lg);
    padding: 32px; border: 1px solid var(--border);
    transition: all .3s ease;
  }
  .review-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
  .review-stars { display: flex; gap: 2px; margin-bottom: 16px; }
  .review-stars svg { width: 18px; height: 18px; fill: var(--holz); }
  .review-text {
    font-size: 1rem; line-height: 1.7; color: var(--ink);
    margin-bottom: 20px; font-style: italic;
  }
  .review-author { display: flex; align-items: center; gap: 12px; }
  .review-avatar {
    width: 42px; height: 42px; border-radius: 50%;
    background: var(--tannengruen-soft); color: var(--tannengruen);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: .82rem;
    font-family: var(--font-mono);
  }
  .review-name { font-weight: 600; font-size: .9rem; }
  .review-meta { font-size: .78rem; color: var(--ink-soft); }

  @media (max-width: 768px) {
    .reviews-section { padding: 70px 0; }
    .reviews-grid { grid-template-columns: 1fr; }
  }

  /* ========================================
     RESTAURANT / KITCHEN
     ======================================== */
  .restaurant-section { padding: 100px 0; background: var(--tannengruen-dark); color: var(--cream); }
  .restaurant-section .section-head .eyebrow { color: var(--holz); }
  .restaurant-section .section-head .display { color: var(--cream); }
  .restaurant-section .section-head .display em { color: var(--holz); }
  .restaurant-section .section-head p { color: ${hexToRgba(c.colors.background, 0.7)}; }

  .restaurant-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
  .rest-features-list { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 24px; }
  .rest-feature {
    display: flex; align-items: center; gap: 10px;
    font-size: .9rem; color: ${hexToRgba(c.colors.background, 0.85)};
  }
  .rest-feature svg { color: var(--holz); flex-shrink: 0; }
  .rest-description {
    font-size: 1.05rem; line-height: 1.7;
    color: ${hexToRgba(c.colors.background, 0.8)};
  }
  .rest-description p { margin-bottom: 16px; }

  /* Menu highlights in restaurant */
  .menu-highlights { margin-top: 32px; }
  .menu-highlight-item {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding: 18px 0; border-bottom: 1px solid ${hexToRgba(c.colors.background, 0.12)};
    gap: 16px;
  }
  .menu-highlight-item:last-child { border-bottom: none; }
  .menu-highlight-info h4 {
    font-family: var(--font-display); font-weight: 600;
    font-size: 1.05rem; margin-bottom: 4px; color: var(--cream);
  }
  .menu-highlight-info p { font-size: .85rem; color: ${hexToRgba(c.colors.background, 0.6)}; }
  .menu-tag {
    display: inline-block; margin-top: 6px;
    font-size: .72rem; font-weight: 600; font-family: var(--font-mono);
    padding: 3px 10px; border-radius: 50px;
    background: ${hexToRgba(c.colors.accent, 0.2)};
    color: var(--holz); letter-spacing: .04em;
  }
  .menu-highlight-price {
    font-family: var(--font-display); font-weight: 700;
    font-size: 1.1rem; color: var(--holz); white-space: nowrap;
  }

  @media (max-width: 768px) {
    .restaurant-section { padding: 70px 0; }
    .restaurant-grid { grid-template-columns: 1fr; }
    .rest-features-list { grid-template-columns: 1fr; }
  }

  /* ========================================
     ABOUT
     ======================================== */
  .about-section { padding: 100px 0; background: var(--cream-tint); }
  .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
  .about-text h2 { font-size: clamp(1.6rem, 3.5vw, 2.4rem); margin-bottom: 20px; }
  .about-text p { color: var(--ink-soft); margin-bottom: 16px; font-size: 1.02rem; }
  .about-stats { display: flex; gap: 32px; margin-top: 28px; flex-wrap: wrap; }
  .about-stat .num {
    font-family: var(--font-display); font-weight: 800;
    font-size: 2rem; color: var(--tannengruen); line-height: 1.1;
  }
  .about-stat .label { font-size: .82rem; color: var(--ink-soft); margin-top: 4px; }

  .owner-quote {
    background: #fff; border-radius: var(--radius-lg);
    padding: 36px; border: 1px solid var(--border);
    position: relative;
  }
  .owner-quote::before {
    content: '\\201C'; position: absolute; top: 16px; left: 24px;
    font-family: var(--font-display); font-size: 4rem; color: var(--holz);
    opacity: .3; line-height: 1;
  }
  .owner-quote blockquote {
    font-family: var(--font-display); font-size: 1.15rem;
    font-style: italic; line-height: 1.7;
    color: var(--ink); margin-bottom: 16px;
    padding-left: 8px;
  }
  .owner-meta { display: flex; align-items: center; gap: 12px; }
  .owner-avatar {
    width: 48px; height: 48px; border-radius: 50%;
    background: var(--tannengruen-soft); color: var(--tannengruen);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-weight: 700; font-size: 1.1rem;
  }
  .owner-name { font-weight: 700; font-size: .95rem; }
  .owner-role { font-size: .82rem; color: var(--ink-soft); }

  @media (max-width: 768px) {
    .about-section { padding: 70px 0; }
    .about-grid { grid-template-columns: 1fr; gap: 36px; }
  }

  /* ========================================
     CTA / CONTACT FORM
     ======================================== */
  .cta-section { padding: 100px 0; background: var(--tannengruen); }
  .cta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
  .cta-text { color: var(--cream); }
  .cta-text .display { font-size: clamp(1.6rem, 3.5vw, 2.4rem); margin-bottom: 16px; color: var(--cream); }
  .cta-text .display em { color: var(--holz); }
  .cta-text p { color: ${hexToRgba(c.colors.background, 0.8)}; font-size: 1.02rem; margin-bottom: 24px; }
  .cta-features { display: flex; flex-direction: column; gap: 12px; }
  .cta-feature {
    display: flex; align-items: center; gap: 10px;
    font-size: .92rem; color: ${hexToRgba(c.colors.background, 0.85)};
  }
  .cta-feature svg { width: 18px; height: 18px; color: var(--holz); flex-shrink: 0; }

  .contact-form {
    background: ${hexToRgba(c.colors.background, 0.08)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.15)};
    border-radius: var(--radius-lg); padding: 32px;
    backdrop-filter: blur(8px);
  }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .form-row.full { grid-template-columns: 1fr; }
  .form-field label {
    display: block; font-size: .8rem; font-weight: 600;
    letter-spacing: .04em; text-transform: uppercase;
    color: ${hexToRgba(c.colors.background, 0.65)};
    margin-bottom: 6px; font-family: var(--font-mono);
  }
  .form-field input,
  .form-field select,
  .form-field textarea {
    width: 100%; padding: 12px 16px;
    background: ${hexToRgba(c.colors.background, 0.08)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.2)};
    border-radius: var(--radius-sm); color: var(--cream);
    font-family: var(--font-body); font-size: .95rem;
    outline: none; transition: border-color .2s;
  }
  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus { border-color: var(--holz); }
  .form-field input::placeholder,
  .form-field textarea::placeholder { color: ${hexToRgba(c.colors.background, 0.4)}; }
  .form-field select option { background: var(--tannengruen-dark); color: var(--cream); }
  .form-field textarea { min-height: 120px; resize: vertical; }
  .form-submit {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 32px; border-radius: 50px;
    background: var(--holz); color: var(--cream);
    border: none; font-weight: 700; font-size: .95rem;
    cursor: pointer; transition: all .25s;
    font-family: var(--font-body); margin-top: 4px;
  }
  .form-submit:hover { background: var(--holz-dark); transform: translateY(-1px); }

  @media (max-width: 768px) {
    .cta-section { padding: 70px 0; }
    .cta-grid { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
  }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section { padding: 100px 0; background: var(--cream); }
  .faq-grid { max-width: 780px; margin: 0 auto; }
  .faq-item {
    border: 1px solid var(--border); border-radius: var(--radius-md);
    margin-bottom: 12px; overflow: hidden;
    transition: border-color .25s;
  }
  .faq-item:hover { border-color: var(--holz); }
  .faq-item.open { border-color: var(--holz); }
  .faq-q {
    display: flex; align-items: center; justify-content: space-between;
    width: 100%; padding: 20px 24px; background: #fff;
    border: none; cursor: pointer; text-align: left;
    font-family: var(--font-body); font-weight: 600;
    font-size: .95rem; color: var(--ink);
    transition: background .2s;
  }
  .faq-q:hover { background: var(--cream-tint); }
  .faq-icon {
    font-size: 1.3rem; color: var(--holz);
    transition: transform .3s;
    font-weight: 300; flex-shrink: 0; margin-left: 16px;
  }
  .faq-item.open .faq-icon { transform: rotate(45deg); }
  .faq-a {
    max-height: 0; overflow: hidden; transition: max-height .35s ease, padding .35s ease;
    padding: 0 24px; background: #fff;
    font-size: .92rem; color: var(--ink-soft); line-height: 1.7;
  }
  .faq-item.open .faq-a { max-height: 500px; padding: 0 24px 20px; }

  @media (max-width: 768px) {
    .faq-section { padding: 70px 0; }
  }

  /* ========================================
     BOOKING CTA SECTION
     ======================================== */
  .booking-cta-section {
    padding: 80px 0;
    background: linear-gradient(135deg, var(--holz) 0%, var(--holz-dark) 100%);
    text-align: center; color: var(--cream);
  }
  .booking-cta-section .display {
    font-size: clamp(1.6rem, 3.5vw, 2.6rem);
    margin-bottom: 16px; color: var(--cream);
  }
  .booking-cta-section .display em { color: var(--tannengruen-dark); }
  .booking-cta-section p {
    color: ${hexToRgba(c.colors.background, 0.85)};
    font-size: 1.05rem; margin-bottom: 32px; max-width: 600px; margin-left: auto; margin-right: auto;
  }
  .booking-cta-btn {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 16px 40px; border-radius: 50px;
    background: var(--cream); color: var(--holz-dark);
    font-weight: 700; font-size: 1.05rem;
    transition: all .3s; border: none; cursor: pointer;
    font-family: var(--font-body);
  }
  .booking-cta-btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .booking-cta-info {
    display: flex; gap: 32px; justify-content: center; margin-top: 24px;
    flex-wrap: wrap;
  }
  .booking-cta-info span {
    font-size: .85rem; color: ${hexToRgba(c.colors.background, 0.7)};
    font-family: var(--font-mono);
  }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: var(--tannengruen-dark); color: var(--cream);
    padding: 72px 0 32px;
  }
  .footer-grid {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px; margin-bottom: 48px;
  }
  .footer-brand .logo {
    color: var(--cream); margin-bottom: 16px;
  }
  .footer-brand .logo .logo-mark {
    background: ${hexToRgba(c.colors.background, 0.15)};
  }
  .footer-brand p {
    font-size: .9rem; color: ${hexToRgba(c.colors.background, 0.6)};
    line-height: 1.6; max-width: 280px;
  }
  .footer-col h4 {
    font-family: var(--font-display); font-weight: 600;
    font-size: .95rem; margin-bottom: 16px; color: var(--cream);
  }
  .footer-col ul { list-style: none; }
  .footer-col li { margin-bottom: 8px; }
  .footer-col a {
    font-size: .88rem; color: ${hexToRgba(c.colors.background, 0.6)};
    transition: color .2s;
  }
  .footer-col a:hover { color: var(--holz); }
  .footer-bottom {
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 24px; border-top: 1px solid ${hexToRgba(c.colors.background, 0.1)};
    font-size: .82rem; color: ${hexToRgba(c.colors.background, 0.5)};
    flex-wrap: wrap; gap: 12px;
  }
  .footer-bottom a { color: ${hexToRgba(c.colors.background, 0.6)}; transition: color .2s; }
  .footer-bottom a:hover { color: var(--holz); }

  @media (max-width: 768px) {
    .footer-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 480px) {
    .footer-grid { grid-template-columns: 1fr; }
  }

  /* ========================================
     MOBILE CTA
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed; bottom: 0; left: 0; right: 0;
    z-index: 998; background: var(--holz);
    color: var(--cream); text-align: center;
    padding: 16px 24px; font-weight: 700;
    font-size: .95rem; transition: background .2s;
  }
  .mobile-cta:hover { background: var(--holz-dark); }
  @media (max-width: 768px) {
    .mobile-cta { display: block; }
    footer { padding-bottom: 72px; }
  }

  /* ========================================
     SCROLLBAR
     ======================================== */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: var(--cream); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--ink-soft); }

  /* ========================================
     ANIMATIONS
     ======================================== */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeInUp .7s ease forwards; opacity: 0; }
  .fade-in.d1 { animation-delay: .1s; }
  .fade-in.d2 { animation-delay: .2s; }
  .fade-in.d3 { animation-delay: .3s; }
  .fade-in.d4 { animation-delay: .4s; }
</style>
</head>
<body>

${c.announceText ? `<div class="announce-bar">${esc(c.announceText)}</div>` : ''}

<!-- ====== NAVIGATION ====== -->
<nav id="main-nav">
  <div class="nav-inner">
    <a href="#" class="logo">
      <span class="logo-mark">${logoInitial}</span>
      ${esc(c.businessName)}
      <span class="nav-stars">${generateHotelStarsSvg(starRating)}</span>
    </a>
    <button class="nav-toggle" aria-label="Men&uuml; &ouml;ffnen" onclick="document.querySelector('.nav-links').classList.toggle('open')">
      <span></span><span></span><span></span>
    </button>
    <ul class="nav-links">
      <li><a href="#rooms">Zimmer</a></li>
      <li><a href="#highlights">Highlights</a></li>
      <li><a href="#restaurant">Restaurant</a></li>
      <li><a href="#location">Lage</a></li>
      <li><a href="#reviews">Bewertungen</a></li>
      <li><a href="#contact">Kontakt</a></li>
    </ul>
    <a href="#booking" class="nav-cta desktop">Jetzt buchen</a>
  </div>
</nav>

<!-- ====== HERO + BOOKING WIDGET ====== -->
<section class="hero">
  <div class="container">
    <div class="hero-grid">
      <div class="hero-content">
        <div class="hero-tag">${esc(c.heroTag)}</div>
        <div class="hero-stars">${generateHotelStarsSvg(starRating)}</div>
        <h1>${c.heroHeadline} <em>${esc(c.heroAccent)}</em></h1>
        <p class="hero-lead">${esc(c.heroLead)}</p>
        <div class="hero-actions">
          <a href="#booking" class="hero-btn primary">${esc(c.ctaText)} &rarr;</a>
          <a href="#rooms" class="hero-btn secondary">Zimmer entdecken</a>
        </div>
      </div>

      <div class="booking-widget" id="booking">
        <h3>Verf&uuml;gbarkeit pr&uuml;fen</h3>
        <div class="booking-row">
          <div class="booking-field">
            <label>Check-in</label>
            <input type="date" id="checkin-date">
          </div>
          <div class="booking-field">
            <label>Check-out</label>
            <input type="date" id="checkout-date">
          </div>
        </div>
        <div class="booking-row">
          <div class="booking-field">
            <label>G&auml;ste</label>
            <select id="guests-count">
              <option>1 Gast</option>
              <option selected>2 G&auml;ste</option>
              <option>3 G&auml;ste</option>
              <option>4 G&auml;ste</option>
              <option>5+ G&auml;ste</option>
            </select>
          </div>
          <div class="booking-field">
            <label>Zimmer</label>
            <select id="room-type">
              ${c.rooms.map(r => `<option>${esc(r.name)}</option>`).join('\n              ')}
            </select>
          </div>
        </div>
        <div class="booking-field">
          <label>Verpflegung</label>
          <select id="board-option">
            <option>Fr&uuml;hst&uuml;cksbuffet</option>
            <option>Halbpension</option>
            <option>Vollpension</option>
          </select>
        </div>
        <button class="booking-submit" onclick="document.getElementById('contact').scrollIntoView({behavior:'smooth'})">Verf&uuml;gbarkeit anfragen</button>
        <p class="booking-note">Unverbindliche Anfrage &ndash; kostenlose Stornierung</p>
      </div>
    </div>
  </div>
</section>

<!-- ====== ROOMS / ZIMMER-GALERIE ====== -->
<section id="rooms" class="rooms-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.roomsSectionTitle || 'Unsere Zimmer')}</span>
      <h2 class="display">${c.roomsSectionSubtitle || 'Gem&uuml;tlich &uuml;bernachten <em>im Allg&auml;u</em>.'}</h2>
      <p>Alle Zimmer mit Bergblick, kostenfreiem WLAN und regionalen Naturmaterialien ausgestattet.</p>
    </div>
    <div class="rooms-grid">
      ${roomsHtml}
    </div>

    <div class="board-options">
      ${boardOptionsHtml}
    </div>

    ${seasonsHtml ? `<div class="seasons-info">${seasonsHtml}</div>` : ''}
  </div>
</section>

<!-- ====== HIGHLIGHTS ====== -->
<section id="highlights" class="highlights-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.highlightsSectionTitle || 'Highlights')}</span>
      <h2 class="display">${c.highlightsSectionSubtitle || 'Was uns <em>besonders</em> macht.'}</h2>
    </div>
    <div class="highlights-grid">
      ${highlightsHtml}
    </div>
  </div>
</section>

<!-- ====== GALLERY ====== -->
<section class="gallery-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Impressionen</span>
      <h2 class="display">Einblicke ins <em>Berghof-Leben</em>.</h2>
    </div>
    <div class="gallery-grid">
      ${galleryHtml}
    </div>
  </div>
</section>

<!-- ====== ABOUT ====== -->
${(c.aboutTitle || c.ownerQuote) ? `<section class="about-section">
  <div class="container">
    <div class="about-grid">
      <div class="about-text">
        <span class="eyebrow">&Uuml;ber uns</span>
        <h2 class="display">${c.aboutTitle || 'Familientradition <em>seit Generationen</em>.'}</h2>
        <p>${esc(c.aboutText || '')}</p>
        ${c.aboutText2 ? `<p>${esc(c.aboutText2)}</p>` : ''}
        ${aboutStatsHtml}
      </div>
      ${c.ownerQuote ? `<div class="owner-quote">
        <blockquote>${esc(c.ownerQuote)}</blockquote>
        <div class="owner-meta">
          <div class="owner-avatar">${c.ownerName ? esc(c.ownerName.charAt(0)) : 'G'}</div>
          <div>
            <div class="owner-name">${esc(c.ownerName || '')}</div>
            <div class="owner-role">${esc(c.ownerRole || 'Gastgeber')}</div>
          </div>
        </div>
      </div>` : ''}
    </div>
  </div>
</section>` : ''}

<!-- ====== RESTAURANT / KITCHEN ====== -->
<section id="restaurant" class="restaurant-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.restaurantSectionTitle || 'Restaurant')}</span>
      <h2 class="display">${c.restaurantSectionSubtitle || 'Regionale K&uuml;che mit <em>Herzblut</em>.'}</h2>
      <p>${esc(c.restaurantDescription || 'Genie\u00dfen Sie regionale Allg\u00e4uer Spezialit\u00e4ten, frisch zubereitet mit Zutaten von lokalen Erzeugern.')}</p>
    </div>

    <div class="restaurant-grid">
      <div class="rest-description">
        <p>${esc(c.restaurantDescription || 'Unser K\u00fcchenteam verwandelt saisonale Zutaten aus der Region in unvergessliche Geschmackserlebnisse. Vom reichhaltigen Fr\u00fchst\u00fccksbuffet bis zum festlichen Abendmen\u00fc.')}</p>
        <div class="rest-features-list">
          ${restaurantFeaturesHtml}
        </div>
      </div>

      <div class="menu-highlights">
        ${menuHighlightsHtml || `
        <div class="menu-highlight-item">
          <div class="menu-highlight-info">
            <h4>Allg&auml;uer K&auml;sesp&auml;tzle</h4>
            <p>Handgeschabte Sp&auml;tzle mit Bergk&auml;se &uuml;berbacken</p>
            <span class="menu-tag">Hausspezialit&auml;t</span>
          </div>
        </div>
        <div class="menu-highlight-item">
          <div class="menu-highlight-info">
            <h4>Wildragout vom Hirsch</h4>
            <p>Geschmort in Rotwein, serviert mit Preiselbeeren &amp; Kn&ouml;del</p>
            <span class="menu-tag">Regional</span>
          </div>
        </div>
        <div class="menu-highlight-item">
          <div class="menu-highlight-info">
            <h4>Panorama-Fr&uuml;hst&uuml;cksbuffet</h4>
            <p>Reichhaltiges Buffet mit regionalen Bio-Produkten</p>
            <span class="menu-tag">Inklusive</span>
          </div>
        </div>`}
      </div>
    </div>
  </div>
</section>

<!-- ====== LOCATION & POI MAP ====== -->
<section id="location" class="location-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.locationTitle || 'Lage & Umgebung')}</span>
      <h2 class="display">${c.locationSubtitle || 'Mitten in der <em>Natur</em>.'}</h2>
      <p>Entdecken Sie die vielf&auml;ltige Allg&auml;uer Landschaft direkt vor unserer T&uuml;r.</p>
    </div>
    <div class="location-grid">
      <div class="location-info">
        <h3>So erreichen Sie uns</h3>
        <p>Unser Landhotel liegt eingebettet in die Allg&auml;uer Alpen &ndash; idyllisch und dennoch gut erreichbar.</p>
        ${locationDetailsHtml || `
        <div class="location-detail">
          <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
          <div><div class="label">Adresse</div><div class="value">${esc(c.address || 'Im Allg\u00e4u')}</div></div>
        </div>`}
        ${c.phone ? `<div class="location-detail">
          <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
          <div><div class="label">Telefon</div><div class="value">${esc(c.phone)}</div></div>
        </div>` : ''}
        ${c.email ? `<div class="location-detail">
          <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
          <div><div class="label">E-Mail</div><div class="value">${esc(c.email)}</div></div>
        </div>` : ''}

        ${hoursHtml ? `<div style="margin-top:24px">
          <h4 style="font-family:var(--font-display);font-weight:600;font-size:1rem;margin-bottom:12px">Rezeption</h4>
          ${hoursHtml}
        </div>` : ''}
      </div>

      <div class="poi-map-card">
        <div class="poi-map-header">
          <h4>Ausflugsziele &amp; Umgebung</h4>
          <p>Entfernungen ab Hotel</p>
        </div>
        <div class="poi-list">
          ${poiHtml || `
          <div class="poi-item">
            <div class="poi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M13 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7 21l3-7 2.5 3L17 11M10 14l-2 7M16 21l-2-4"/></svg></div>
            <div class="poi-info"><span class="poi-name">Wanderwege</span><span class="poi-distance">ab 0 km</span></div>
          </div>`}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ====== REVIEWS ====== -->
${c.reviews.length > 0 ? `<section id="reviews" class="reviews-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.reviewsSectionTitle || 'Bewertungen')}</span>
      <h2 class="display">Das sagen unsere <em>G&auml;ste</em>.</h2>
      <p>${avgRating} von 5 Sternen &ndash; basierend auf ${c.reviews.length} Bewertungen</p>
    </div>
    <div class="reviews-grid">
      ${reviewsHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== CTA / CONTACT FORM ====== -->
${c.contactEnabled !== false ? `<section id="contact" class="cta-section">
  <div class="container cta-grid">
    <div class="cta-text">
      <span class="eyebrow" style="color: var(--holz); display:block; margin-bottom:16px;">${esc(c.ctaSectionTitle || 'Kontakt & Anfrage')}</span>
      <h2 class="display">${c.ctaSectionSubtitle || 'Schreiben Sie <em>uns</em>.'}</h2>
      <p>Ob Zimmeranfrage, Gruppenreservierung oder besondere W&uuml;nsche &mdash; wir freuen uns auf Ihre Nachricht.</p>

      ${ctaFeaturesHtml.length > 0 ? `<div class="cta-features">${ctaFeaturesHtml}</div>` : `
      <div class="cta-features">
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Kostenlose Stornierung
        </div>
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Direktbuchervorteil &ndash; bester Preis garantiert
        </div>
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Antwort innerhalb von 24h
        </div>
      </div>`}
    </div>

    <form class="contact-form" id="contact-form">
      <div class="form-row">
        <div class="form-field">
          <label>Name*</label>
          <input type="text" name="name" required placeholder="Vor- und Nachname">
        </div>
        <div class="form-field">
          <label>E-Mail*</label>
          <input type="email" name="email" required placeholder="mail@beispiel.de">
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label>Telefon (optional)</label>
          <input type="tel" name="phone" placeholder="${c.phone ? esc(c.phone) : 'Telefonnummer'}">
        </div>
        <div class="form-field">
          <label>Betreff</label>
          <select name="betreff">
            <option>Zimmeranfrage</option>
            <option>Gruppenreservierung</option>
            <option>Wellness &amp; Sauna</option>
            <option>Halbpension / Vollpension</option>
            <option>Veranstaltung</option>
            <option>Allgemeine Anfrage</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label>Gew&uuml;nschter Zeitraum</label>
          <input type="text" name="zeitraum" placeholder="z.B. 15.07. - 22.07.2026">
        </div>
        <div class="form-field">
          <label>Anzahl G&auml;ste</label>
          <select name="gaeste">
            <option>1 Person</option>
            <option selected>2 Personen</option>
            <option>3 Personen</option>
            <option>4 Personen</option>
            <option>5+ Personen</option>
          </select>
        </div>
      </div>

      <div class="form-row full">
        <div class="form-field">
          <label>Nachricht*</label>
          <textarea name="message" required placeholder="Erz&auml;hlen Sie uns von Ihren Urlaubsw&uuml;nschen ..."></textarea>
        </div>
      </div>

      <div style="position:absolute;left:-9999px"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>

      <button type="submit" class="form-submit" id="contact-submit">
        Anfrage senden
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </button>
    </form>
  </div>
</section>` : ''}

${(c.faqItems || []).length > 0 ? `<!-- ====== FAQ ====== -->
<section id="faq" class="faq-section">
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

<!-- ====== DIREKTBUCHUNG CTA ====== -->
<section class="booking-cta-section">
  <div class="container">
    <h2 class="display">Buchen Sie <em>direkt</em> &ndash; zum besten Preis.</h2>
    <p>Bei Direktbuchung profitieren Sie von Sonderkonditionen, pers&ouml;nlicher Beratung und flexiblen Stornobedingungen.</p>
    <a href="#booking" class="booking-cta-btn">
      Jetzt Verf&uuml;gbarkeit pr&uuml;fen
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>
    <div class="booking-cta-info">
      ${c.checkInTime ? `<span>Check-in: ${esc(c.checkInTime)}</span>` : '<span>Check-in: ab 15:00</span>'}
      ${c.checkOutTime ? `<span>Check-out: ${esc(c.checkOutTime)}</span>` : '<span>Check-out: bis 10:00</span>'}
      <span>Kostenlose Stornierung</span>
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
<a href="#booking" class="mobile-cta">${esc(c.ctaText)} &rarr;</a>

<script>
  /* Nav scroll effect */
  window.addEventListener('scroll', function() {
    var nav = document.getElementById('main-nav');
    if (window.scrollY > 60) { nav.classList.add('scrolled'); }
    else { nav.classList.remove('scrolled'); }
  });

  /* Close mobile nav on link click */
  document.querySelectorAll('.nav-links a').forEach(function(link) {
    link.addEventListener('click', function() {
      document.querySelector('.nav-links').classList.remove('open');
    });
  });

  /* Set min date on booking fields */
  (function() {
    var today = new Date().toISOString().split('T')[0];
    var checkin = document.getElementById('checkin-date');
    var checkout = document.getElementById('checkout-date');
    if (checkin) {
      checkin.setAttribute('min', today);
      checkin.value = today;
      checkin.addEventListener('change', function() {
        var next = new Date(checkin.value);
        next.setDate(next.getDate() + 1);
        var nextStr = next.toISOString().split('T')[0];
        checkout.setAttribute('min', nextStr);
        if (!checkout.value || checkout.value <= checkin.value) {
          checkout.value = nextStr;
        }
      });
    }
    if (checkout) {
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      checkout.setAttribute('min', tomorrow.toISOString().split('T')[0]);
      checkout.value = tomorrow.toISOString().split('T')[0];
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
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:var(--cream);font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:' + '${hexToRgba(c.colors.background, 0.7)}' + ';font-size:1.05rem">Wir melden uns in K\\u00fcrze bei Ihnen.</p></div>';
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
    <p style="flex:1;min-width:200px;margin:0;color:${hexToRgba(c.colors.background, 0.8)}">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--cream);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--holz);color:var(--cream);border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
