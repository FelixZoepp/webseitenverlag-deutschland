export interface HotelNordseeConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Tiefblau (#0e2a4a)
    accent: string     // Sand (#d4c4a0)
    background: string // Weiß (#fafcfd)
    text: string       // Dark text
  }
  phone?: string
  email?: string
  address?: string
  bookingUrl?: string
  checkInTime?: string
  checkOutTime?: string
  openingHours: { days: string; hours: string }[]
  rooms: { name: string; description: string; price: string; size?: string; features?: string[]; imageUrl?: string; tag?: string }[]
  spaHighlight?: {
    title: string
    description: string
    features: string[]
    imageUrl?: string
  }
  restaurant?: {
    name: string
    description: string
    cuisine: string
    hours: string
    highlights: { name: string; description: string }[]
    imageUrl?: string
  }
  activities: { name: string; description: string; icon?: string; duration?: string }[]
  locations: { name: string; distance: string; icon?: string }[]
  reviews: { text: string; name: string; source: string; rating: number }[]
  faqItems?: { question: string; answer: string }[]
  heroImageUrl?: string
  aboutTitle?: string
  aboutText?: string
  aboutText2?: string
  managerName?: string
  managerRole?: string
  managerQuote?: string
  features?: { icon: string; title: string; description: string }[]
  contactEnabled?: boolean
  imprintUrl?: string
  privacyUrl?: string
  footerText?: string
  footerColumns?: { title: string; links: { label: string; href: string }[] }[]
  galleryItems?: { label: string; imageUrl?: string }[]
  aboutStats?: { value: string; label: string }[]
  ctaSectionTitle?: string
  ctaSectionSubtitle?: string
  ctaFeatures?: string[]
  roomsSectionTitle?: string
  roomsSectionSubtitle?: string
  spaSectionTitle?: string
  spaSectionSubtitle?: string
  restaurantSectionTitle?: string
  activitiesSectionTitle?: string
  activitiesSectionSubtitle?: string
  locationSectionTitle?: string
  locationSectionSubtitle?: string
  reviewsSectionTitle?: string
  starRating?: number
  priceRange?: string
  conciergeEnabled?: boolean
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

export function renderHotelNordseeTemplate(config: HotelNordseeConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primaryDark = darkenHex(c.colors.primary, 0.25)
  const primaryLight = tintHex(c.colors.primary, 0.85)
  const primarySoft = hexToRgba(c.colors.primary, 0.12)
  const accentDark = darkenHex(c.colors.accent, 0.2)
  const accentLight = tintHex(c.colors.accent, 0.5)
  const bgTint = tintHex(c.colors.background, -0.03)
  const bgWarm = tintHex(c.colors.background, -0.06)
  const textSoft = tintHex(c.colors.text, 0.5)
  const borderColor = tintHex(c.colors.background, -0.1)

  const logoInitial = esc(c.businessName.charAt(0))
  const starRating = c.starRating || 4

  // Rooms HTML
  const roomsHtml = c.rooms.map((room, i) => {
    const gradients = [
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 100%)`,
      `linear-gradient(135deg, ${c.colors.accent} 0%, ${accentDark} 100%)`,
      `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.3)} 0%, ${c.colors.primary} 100%)`,
    ]
    const bg = room.imageUrl
      ? `background-image:url('${esc(room.imageUrl)}');background-size:cover;background-position:center`
      : `background:${gradients[i % gradients.length]}`
    return `
      <div class="room-card">
        <div class="room-image" style="${bg}">
          ${room.tag ? `<span class="room-tag">${esc(room.tag)}</span>` : ''}
        </div>
        <div class="room-content">
          <h3>${esc(room.name)}</h3>
          <p>${esc(room.description)}</p>
          ${room.size ? `<div class="room-meta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>${esc(room.size)}</div>` : ''}
          ${room.features && room.features.length > 0 ? `
          <div class="room-features">
            ${room.features.map(f => `<span class="room-feature">${esc(f)}</span>`).join('')}
          </div>` : ''}
          <div class="room-footer">
            <div class="room-price">ab <strong>${esc(room.price)}</strong> / Nacht</div>
            <a href="${esc(c.bookingUrl || '#contact')}" class="room-book">Buchen <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
          </div>
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

  // Activities HTML
  const activitiesHtml = c.activities.map(a => {
    const icon = a.icon === 'surf' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 22C2 22 7 18 12 12C17 6 22 2 22 2"/><path d="M5 19C5 19 8 16 11 13"/><circle cx="18" cy="5" r="2"/></svg>'
      : a.icon === 'bike' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 17.5V14l-3-3 4-3 2 3h3"/></svg>'
      : a.icon === 'walk' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="5" r="1.5"/><path d="M9 22l3-9 3 9M9.5 13L7 22M14.5 13L17 22M10 13l-1.5-5.5L12 5l3.5 2.5L14 13"/></svg>'
      : a.icon === 'spa' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22c-4-4-8-7.5-8-12a8 8 0 0 1 16 0c0 4.5-4 8-8 12z"/><path d="M12 22c2-2 4-4.5 4-8a4 4 0 0 0-8 0c0 3.5 2 6 4 8z"/></svg>'
      : a.icon === 'lighthouse' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v4M8 22h8M9 22l1-12h4l1 12M4 9h4M16 9h4M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
    return `
      <div class="activity-card">
        <div class="activity-icon">${icon}</div>
        <h4>${esc(a.name)}</h4>
        <p>${esc(a.description)}</p>
        ${a.duration ? `<span class="activity-duration">${esc(a.duration)}</span>` : ''}
      </div>`
  }).join('\n')

  // Locations / Map Points HTML
  const locationsHtml = c.locations.map(loc => {
    const icon = loc.icon === 'beach' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21H7M12 3v18M5.6 9.4a8 8 0 0 1 12.8 0"/><path d="M3 17c2-2 5-2 7 0s5 2 7 0s5-2 7 0"/></svg>'
      : loc.icon === 'lighthouse' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v4M8 22h8M9 22l1-12h4l1 12M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M7 9h10"/></svg>'
      : loc.icon === 'promenade' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19h16M4 15l4-8 4 8 4-8 4 8"/></svg>'
      : loc.icon === 'restaurant' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
    return `
      <div class="location-point">
        <div class="location-icon">${icon}</div>
        <div class="location-info">
          <h4>${esc(loc.name)}</h4>
          <span class="location-distance">${esc(loc.distance)}</span>
        </div>
      </div>`
  }).join('\n')

  // Spa features HTML
  const spaSection = c.spaHighlight ? `
  <section id="spa" class="spa-section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">${esc(c.spaSectionTitle || 'Wellness &amp; Thalasso')}</span>
        <h2 class="display">${c.spaSectionSubtitle || 'Nordische <em>Entspannung</em>.'}</h2>
      </div>
      <div class="spa-grid">
        <div class="spa-image" style="${c.spaHighlight.imageUrl ? `background-image:url('${esc(c.spaHighlight.imageUrl)}');background-size:cover;background-position:center` : `background:linear-gradient(135deg, ${c.colors.primary} 0%, ${tintHex(c.colors.primary, 0.3)} 100%)`}">
          <div class="spa-overlay">
            <span class="spa-badge">Thalasso &amp; Spa</span>
          </div>
        </div>
        <div class="spa-content">
          <h3>${esc(c.spaHighlight.title)}</h3>
          <p>${esc(c.spaHighlight.description)}</p>
          <div class="spa-features">
            ${c.spaHighlight.features.map(f => `
            <div class="spa-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c-4-4-8-7.5-8-12a8 8 0 0 1 16 0c0 4.5-4 8-8 12z"/></svg>
              <span>${esc(f)}</span>
            </div>`).join('')}
          </div>
          <a href="${esc(c.bookingUrl || '#contact')}" class="spa-cta">Spa-Aufenthalt buchen <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
        </div>
      </div>
    </div>
  </section>` : ''

  // Restaurant section HTML
  const restaurantSection = c.restaurant ? `
  <section id="restaurant" class="restaurant-section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">${esc(c.restaurantSectionTitle || 'Kulinarik')}</span>
        <h2 class="display">Unser <em>Restaurant</em>.</h2>
      </div>
      <div class="restaurant-grid">
        <div class="restaurant-image" style="${c.restaurant.imageUrl ? `background-image:url('${esc(c.restaurant.imageUrl)}');background-size:cover;background-position:center` : `background:linear-gradient(135deg, ${c.colors.accent} 0%, ${accentDark} 100%)`}">
          <div class="restaurant-badge">${esc(c.restaurant.cuisine)}</div>
        </div>
        <div class="restaurant-content">
          <h3>${esc(c.restaurant.name)}</h3>
          <p>${esc(c.restaurant.description)}</p>
          <div class="restaurant-hours">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <span>${esc(c.restaurant.hours)}</span>
          </div>
          <div class="restaurant-highlights">
            ${c.restaurant.highlights.map(h => `
            <div class="restaurant-highlight">
              <h4>${esc(h.name)}</h4>
              <p>${esc(h.description)}</p>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </section>` : ''

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

  // Opening hours HTML
  const hoursHtml = c.openingHours.map(h => `
      <div class="hours-item">
        <div class="label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          ${esc(h.days)}
        </div>
        <div class="value">${esc(h.hours)}</div>
      </div>`).join('')

  // CTA features
  const ctaFeatures = c.ctaFeatures || []
  const ctaFeaturesHtml = ctaFeatures.map(f => `
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          ${esc(f)}
        </div>`).join('')

  // Gallery items
  const galleryItems = c.galleryItems || [
    { label: 'Meerblick-Terrasse' },
    { label: 'Strandkorb-Lounge' },
    { label: 'D&uuml;nenlandschaft' },
    { label: 'Nordseek&uuml;ste' },
    { label: 'Leuchtturm' },
  ]
  const galleryLetters = ['a', 'b', 'c', 'd', 'e']
  const defaultGradients = [
    `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 60%, ${darkenHex(c.colors.primary, 0.4)} 100%)`,
    `linear-gradient(135deg, ${c.colors.accent} 0%, ${darkenHex(c.colors.accent, 0.3)} 100%)`,
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

  // Footer columns
  const footerColumns = c.footerColumns || [
    { title: 'Hotel', links: [
      { label: 'Zimmer', href: '#rooms' },
      { label: 'Restaurant', href: '#restaurant' },
      { label: 'Spa &amp; Wellness', href: '#spa' },
    ]},
    { title: 'Erleben', links: [
      { label: 'Aktivit&auml;ten', href: '#activities' },
      { label: 'Umgebung', href: '#location' },
      { label: 'Bewertungen', href: '#reviews' },
    ]},
    { title: 'Service', links: [
      { label: 'Kontakt', href: '#contact' },
      { label: 'FAQ', href: '#faq' },
    ]},
  ]
  const footerColumnsHtml = footerColumns.map(col => `
      <div class="footer-col">
        <h4>${esc(col.title)}</h4>
        <ul>
          ${col.links.map(l => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('\n          ')}
        </ul>
      </div>`).join('')

  // Booking widget (hero)
  const bookingWidget = `
    <div class="booking-widget">
      <div class="booking-field">
        <label>Anreise</label>
        <input type="date" name="checkin" />
      </div>
      <div class="booking-field">
        <label>Abreise</label>
        <input type="date" name="checkout" />
      </div>
      <div class="booking-field">
        <label>G&auml;ste</label>
        <select name="guests">
          <option>1 Gast</option>
          <option>2 G&auml;ste</option>
          <option>3 G&auml;ste</option>
          <option>4 G&auml;ste</option>
        </select>
      </div>
      <div class="booking-field">
        <label>Zimmer</label>
        <select name="room-type">
          ${c.rooms.map(r => `<option>${esc(r.name)}</option>`).join('\n          ')}
        </select>
      </div>
      <button class="booking-submit" onclick="window.location.href='${esc(c.bookingUrl || '#contact')}'">
        Verf&uuml;gbarkeit pr&uuml;fen
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </button>
    </div>`

  // Star rating display
  const hotelStars = Array(starRating).fill('<svg class="hotel-star" viewBox="0 0 24 24"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z"/></svg>').join('')

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
  ${c.address ? `"address": { "@type": "PostalAddress", "streetAddress": "${esc(c.address)}" },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  "starRating": {
    "@type": "Rating",
    "ratingValue": "${starRating}"
  },
  "priceRange": "${esc(c.priceRange || '$$$')}",
  ${c.checkInTime ? `"checkinTime": "${esc(c.checkInTime)}",` : ''}
  ${c.checkOutTime ? `"checkoutTime": "${esc(c.checkOutTime)}",` : ''}
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Spa", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Restaurant", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Meerblick", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Strandkorb", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Concierge", "value": true }
  ],
  ${c.reviews.length > 0 ? `"aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "${(c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length).toFixed(1)}",
    "reviewCount": "${c.reviews.length}"
  },` : ''}
  "url": "${appUrl}${siteId ? `/s/${siteId}` : ''}"
}
</script>

<style>
  /* ========================================
     DESIGN TOKENS & VARIABLES
     ======================================== */
  :root {
    --tiefblau: ${c.colors.primary};
    --tiefblau-dark: ${primaryDark};
    --tiefblau-light: ${primaryLight};
    --sand: ${c.colors.accent};
    --sand-dark: ${accentDark};
    --sand-light: ${accentLight};
    --weiss: ${c.colors.background};
    --text: ${c.colors.text};
    --text-soft: ${textSoft};
    --border: ${borderColor};
    --bg-tint: ${bgTint};
    --bg-warm: ${bgWarm};
    --primary-soft: ${primarySoft};

    --font-display: 'Fraunces', serif;
    --font-body: 'Inter Tight', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;

    --spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    --ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
    --radius: 16px;
    --radius-sm: 8px;
    --radius-xs: 4px;
    --shadow-sm: 0 1px 3px ${hexToRgba(c.colors.primary, 0.08)};
    --shadow-md: 0 4px 20px ${hexToRgba(c.colors.primary, 0.1)};
    --shadow-lg: 0 12px 48px ${hexToRgba(c.colors.primary, 0.12)};
    --shadow-xl: 0 24px 64px ${hexToRgba(c.colors.primary, 0.16)};
  }

  /* ========================================
     RESET & BASE
     ======================================== */
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; font-size: 16px; -webkit-font-smoothing: antialiased; }
  body {
    font-family: var(--font-body);
    background: var(--weiss);
    color: var(--text);
    line-height: 1.7;
    overflow-x: hidden;
  }
  a { text-decoration: none; color: inherit; transition: all 0.3s var(--ease); }
  img { max-width: 100%; display: block; }
  button, input, select, textarea {
    font-family: inherit;
    font-size: inherit;
    border: none;
    outline: none;
    background: none;
  }
  .container { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
  section { padding: 96px 0; }
  .eyebrow {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--sand-dark);
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .eyebrow::before {
    content: '';
    width: 24px;
    height: 1.5px;
    background: var(--sand);
  }
  .display {
    font-family: var(--font-display);
    font-weight: 500;
    font-variation-settings: 'SOFT' 60;
    line-height: 1.15;
    letter-spacing: -0.03em;
    color: var(--tiefblau);
    margin-top: 12px;
  }
  .display em {
    font-style: normal;
    color: var(--sand-dark);
    font-variation-settings: 'SOFT' 80;
  }
  .section-head { text-align: center; margin-bottom: 64px; }
  .section-head .display { font-size: clamp(2rem, 4vw, 3.2rem); }
  .section-head p { color: var(--text-soft); max-width: 560px; margin: 16px auto 0; font-size: 1.05rem; }

  /* ========================================
     NAVIGATION
     ======================================== */
  nav {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 1000;
    background: ${hexToRgba(c.colors.background, 0.92)};
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    border-bottom: 1px solid ${hexToRgba(c.colors.primary, 0.06)};
    transition: all 0.4s var(--ease);
  }
  nav.scrolled {
    background: ${hexToRgba(c.colors.background, 0.97)};
    box-shadow: 0 2px 20px ${hexToRgba(c.colors.primary, 0.08)};
  }
  .nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 72px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 32px;
  }
  .logo {
    display: flex; align-items: center; gap: 12px;
    font-family: var(--font-display);
    font-weight: 600; font-size: 1.2rem;
    color: var(--tiefblau);
    font-variation-settings: 'SOFT' 50;
  }
  .logo-mark {
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    background: var(--tiefblau);
    color: var(--sand);
    border-radius: 12px;
    font-family: var(--font-display);
    font-weight: 700; font-size: 18px;
    font-variation-settings: 'SOFT' 80;
  }
  .nav-links {
    display: flex; gap: 8px;
    list-style: none;
  }
  .nav-links a {
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-soft);
    border-radius: 999px;
    transition: all 0.2s var(--ease);
  }
  .nav-links a:hover { color: var(--tiefblau); background: var(--primary-soft); }
  .nav-cta {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 24px;
    background: var(--tiefblau);
    color: var(--sand);
    font-family: var(--font-mono);
    font-size: 12px; font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.3s var(--spring);
  }
  .nav-cta:hover { background: var(--tiefblau-dark); transform: translateY(-1px); box-shadow: var(--shadow-md); }
  .nav-cta svg { width: 14px; height: 14px; }
  .nav-toggle {
    display: none;
    width: 44px; height: 44px;
    align-items: center; justify-content: center;
    background: var(--primary-soft);
    border-radius: 12px;
    cursor: pointer;
  }
  .nav-toggle svg { width: 20px; height: 20px; stroke: var(--tiefblau); }

  /* ========================================
     HERO SECTION
     ======================================== */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column;
    justify-content: center;
    padding: 120px 0 80px;
    background: linear-gradient(170deg, var(--weiss) 0%, ${tintHex(c.colors.primary, 0.92)} 50%, ${tintHex(c.colors.accent, 0.85)} 100%);
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -30%; right: -20%;
    width: 800px; height: 800px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.accent, 0.15)} 0%, transparent 70%);
    pointer-events: none;
  }
  .hero::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 200px;
    background: linear-gradient(to top, var(--weiss), transparent);
    pointer-events: none;
  }
  .hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
    position: relative;
    z-index: 2;
  }
  .hero-content { max-width: 580px; }
  .hero-tag {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 16px;
    background: ${hexToRgba(c.colors.primary, 0.06)};
    border: 1px solid ${hexToRgba(c.colors.primary, 0.1)};
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tiefblau);
    margin-bottom: 24px;
  }
  .hero-tag .dot {
    width: 6px; height: 6px;
    background: var(--sand);
    border-radius: 50%;
  }
  .hotel-stars {
    display: flex; gap: 4px;
    margin-bottom: 16px;
  }
  .hotel-star {
    width: 18px; height: 18px;
    fill: var(--sand-dark);
  }
  .hero h1 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: clamp(2.8rem, 5vw, 4.2rem);
    line-height: 1.08;
    letter-spacing: -0.03em;
    color: var(--tiefblau);
    font-variation-settings: 'SOFT' 50;
    margin-bottom: 8px;
  }
  .hero h1 em {
    font-style: normal;
    color: var(--sand-dark);
    font-variation-settings: 'SOFT' 80;
  }
  .hero-lead {
    font-size: 1.1rem;
    color: var(--text-soft);
    line-height: 1.7;
    margin-bottom: 32px;
    max-width: 480px;
  }
  .hero-actions {
    display: flex; gap: 16px; align-items: center;
    flex-wrap: wrap;
    margin-bottom: 32px;
  }
  .btn-primary {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 16px 32px;
    background: var(--tiefblau);
    color: var(--sand);
    font-family: var(--font-mono);
    font-size: 12px; font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.3s var(--spring);
    box-shadow: 0 4px 16px ${hexToRgba(c.colors.primary, 0.25)};
  }
  .btn-primary:hover { background: var(--tiefblau-dark); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .btn-primary svg { width: 16px; height: 16px; }
  .btn-secondary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 16px 28px;
    background: transparent;
    color: var(--tiefblau);
    font-family: var(--font-mono);
    font-size: 12px; font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: 1.5px solid ${hexToRgba(c.colors.primary, 0.2)};
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.3s var(--ease);
  }
  .btn-secondary:hover { border-color: var(--tiefblau); background: var(--primary-soft); }
  .hero-visual {
    position: relative;
    display: flex;
    justify-content: center;
  }
  .hero-image-wrapper {
    width: 100%; max-width: 520px;
    aspect-ratio: 4/5;
    border-radius: 24px;
    overflow: hidden;
    position: relative;
    box-shadow: var(--shadow-xl);
  }
  .hero-image-wrapper .hero-bg {
    width: 100%; height: 100%;
    object-fit: cover;
  }
  .hero-image-placeholder {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, ${c.colors.primary} 0%, ${tintHex(c.colors.primary, 0.3)} 50%, ${c.colors.accent} 100%);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display);
    font-size: 6rem;
    color: ${hexToRgba(c.colors.accent, 0.3)};
    font-variation-settings: 'SOFT' 100;
  }
  .hero-float-card {
    position: absolute;
    bottom: -16px; left: -32px;
    background: var(--weiss);
    border-radius: var(--radius);
    padding: 20px 24px;
    box-shadow: var(--shadow-lg);
    display: flex; align-items: center; gap: 14px;
    animation: floatUp 3s ease-in-out infinite alternate;
  }
  .hero-float-icon {
    width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    background: ${hexToRgba(c.colors.accent, 0.15)};
    border-radius: 12px;
  }
  .hero-float-icon svg { width: 22px; height: 22px; stroke: var(--sand-dark); }
  .hero-float-label { font-size: 12px; color: var(--text-soft); }
  .hero-float-value { font-family: var(--font-display); font-weight: 600; font-size: 1.1rem; color: var(--tiefblau); }
  @keyframes floatUp {
    0% { transform: translateY(0); }
    100% { transform: translateY(-8px); }
  }

  /* ========================================
     BOOKING WIDGET
     ======================================== */
  .booking-widget {
    display: flex;
    align-items: flex-end;
    gap: 16px;
    background: var(--weiss);
    padding: 24px 28px;
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    margin-top: 48px;
    position: relative;
    z-index: 5;
    flex-wrap: wrap;
    border: 1px solid ${hexToRgba(c.colors.primary, 0.06)};
  }
  .booking-field {
    flex: 1;
    min-width: 140px;
  }
  .booking-field label {
    display: block;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-soft);
    margin-bottom: 8px;
  }
  .booking-field input,
  .booking-field select {
    width: 100%;
    padding: 12px 16px;
    background: var(--bg-tint);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 14px;
    color: var(--text);
    transition: all 0.2s var(--ease);
  }
  .booking-field input:focus,
  .booking-field select:focus {
    border-color: var(--tiefblau);
    box-shadow: 0 0 0 3px ${hexToRgba(c.colors.primary, 0.1)};
  }
  .booking-submit {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 28px;
    background: var(--tiefblau);
    color: var(--sand);
    font-family: var(--font-mono);
    font-size: 12px; font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.3s var(--spring);
    white-space: nowrap;
    min-width: max-content;
  }
  .booking-submit:hover { background: var(--tiefblau-dark); transform: translateY(-1px); box-shadow: var(--shadow-md); }

  /* ========================================
     ROOMS / ZIMMER GALERIE
     ======================================== */
  .rooms-section { background: var(--bg-tint); }
  .rooms-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
  .room-card {
    background: var(--weiss);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: all 0.4s var(--ease);
    border: 1px solid ${hexToRgba(c.colors.primary, 0.05)};
  }
  .room-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
  .room-image {
    height: 240px;
    position: relative;
    overflow: hidden;
  }
  .room-tag {
    position: absolute;
    top: 16px; right: 16px;
    background: var(--sand);
    color: var(--tiefblau);
    padding: 6px 14px;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .room-content {
    padding: 28px;
  }
  .room-content h3 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.3rem;
    color: var(--tiefblau);
    font-variation-settings: 'SOFT' 50;
    margin-bottom: 8px;
  }
  .room-content p {
    color: var(--text-soft);
    font-size: 0.92rem;
    line-height: 1.6;
    margin-bottom: 16px;
  }
  .room-meta {
    display: flex; align-items: center; gap: 8px;
    color: var(--text-soft);
    font-size: 0.85rem;
    margin-bottom: 12px;
  }
  .room-meta svg { width: 16px; height: 16px; }
  .room-features {
    display: flex; flex-wrap: wrap; gap: 6px;
    margin-bottom: 20px;
  }
  .room-feature {
    padding: 4px 12px;
    background: ${hexToRgba(c.colors.accent, 0.15)};
    color: var(--sand-dark);
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: 0.03em;
  }
  .room-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 20px;
    border-top: 1px solid var(--border);
  }
  .room-price {
    font-size: 0.9rem;
    color: var(--text-soft);
  }
  .room-price strong {
    font-family: var(--font-display);
    font-size: 1.3rem;
    color: var(--tiefblau);
    font-weight: 600;
  }
  .room-book {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 20px;
    background: var(--tiefblau);
    color: var(--sand);
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: all 0.3s var(--spring);
  }
  .room-book:hover { background: var(--tiefblau-dark); transform: translateY(-1px); }

  /* ========================================
     SPA / THALASSO HIGHLIGHT
     ======================================== */
  .spa-section { background: var(--weiss); }
  .spa-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: center;
  }
  .spa-image {
    height: 480px;
    border-radius: var(--radius);
    overflow: hidden;
    position: relative;
  }
  .spa-overlay {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 24px;
    background: linear-gradient(to top, ${hexToRgba(c.colors.primary, 0.7)}, transparent);
  }
  .spa-badge {
    display: inline-block;
    padding: 8px 18px;
    background: ${hexToRgba(c.colors.accent, 0.9)};
    color: var(--tiefblau);
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .spa-content h3 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.8rem;
    color: var(--tiefblau);
    font-variation-settings: 'SOFT' 50;
    margin-bottom: 16px;
  }
  .spa-content p {
    color: var(--text-soft);
    font-size: 1.02rem;
    line-height: 1.7;
    margin-bottom: 28px;
  }
  .spa-features {
    display: flex; flex-direction: column; gap: 14px;
    margin-bottom: 32px;
  }
  .spa-feature {
    display: flex; align-items: center; gap: 12px;
    font-size: 0.95rem;
    color: var(--text);
  }
  .spa-feature svg {
    width: 20px; height: 20px;
    stroke: var(--sand-dark);
    flex-shrink: 0;
  }
  .spa-cta {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 14px 28px;
    background: var(--tiefblau);
    color: var(--sand);
    font-family: var(--font-mono);
    font-size: 12px; font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border-radius: 999px;
    transition: all 0.3s var(--spring);
  }
  .spa-cta:hover { background: var(--tiefblau-dark); transform: translateY(-1px); box-shadow: var(--shadow-md); }

  /* ========================================
     LAGE / MAP SECTION
     ======================================== */
  .location-section {
    background: linear-gradient(180deg, var(--bg-tint) 0%, var(--weiss) 100%);
  }
  .location-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
  .location-point {
    display: flex; align-items: center; gap: 20px;
    padding: 24px 28px;
    background: var(--weiss);
    border: 1px solid ${hexToRgba(c.colors.primary, 0.06)};
    border-radius: var(--radius);
    transition: all 0.3s var(--ease);
  }
  .location-point:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: ${hexToRgba(c.colors.accent, 0.3)};
  }
  .location-icon {
    width: 52px; height: 52px;
    display: flex; align-items: center; justify-content: center;
    background: ${hexToRgba(c.colors.accent, 0.12)};
    border-radius: 14px;
    flex-shrink: 0;
  }
  .location-icon svg { width: 24px; height: 24px; stroke: var(--sand-dark); }
  .location-info h4 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.05rem;
    color: var(--tiefblau);
    font-variation-settings: 'SOFT' 50;
  }
  .location-distance {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-soft);
    letter-spacing: 0.03em;
  }

  /* ========================================
     REVIEWS / BEWERTUNGEN
     ======================================== */
  .reviews-section { background: var(--weiss); }
  .reviews-score {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 48px;
    padding: 28px 32px;
    background: var(--bg-tint);
    border-radius: var(--radius);
    border: 1px solid ${hexToRgba(c.colors.primary, 0.05)};
  }
  .reviews-score .rating {
    font-family: var(--font-display);
    font-size: 3rem;
    font-weight: 700;
    color: var(--tiefblau);
    line-height: 1;
  }
  .reviews-score .meta { color: var(--text-soft); font-size: 0.9rem; }
  .reviews-score .stars { display: flex; gap: 4px; margin-bottom: 4px; }
  .reviews-score .stars svg {
    width: 20px; height: 20px;
    fill: var(--sand-dark);
  }
  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .review-card {
    background: var(--weiss);
    border: 1px solid ${hexToRgba(c.colors.primary, 0.06)};
    border-radius: var(--radius);
    padding: 32px;
    transition: all 0.3s var(--ease);
  }
  .review-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
  .review-stars {
    display: flex; gap: 3px; margin-bottom: 16px;
  }
  .review-stars svg {
    width: 16px; height: 16px;
    fill: var(--sand-dark);
  }
  .review-text {
    font-size: 0.95rem;
    line-height: 1.7;
    color: var(--text);
    margin-bottom: 20px;
    font-style: italic;
  }
  .review-author {
    display: flex; align-items: center; gap: 12px;
  }
  .review-avatar {
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    background: ${hexToRgba(c.colors.primary, 0.08)};
    color: var(--tiefblau);
    border-radius: 50%;
    font-family: var(--font-mono);
    font-size: 12px; font-weight: 700;
  }
  .review-name {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--tiefblau);
  }
  .review-meta {
    font-size: 0.8rem;
    color: var(--text-soft);
  }

  /* ========================================
     RESTAURANT SECTION
     ======================================== */
  .restaurant-section { background: var(--bg-tint); }
  .restaurant-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: center;
  }
  .restaurant-image {
    height: 440px;
    border-radius: var(--radius);
    overflow: hidden;
    position: relative;
  }
  .restaurant-badge {
    position: absolute;
    top: 20px; left: 20px;
    background: ${hexToRgba(c.colors.accent, 0.9)};
    color: var(--tiefblau);
    padding: 8px 18px;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .restaurant-content h3 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.8rem;
    color: var(--tiefblau);
    font-variation-settings: 'SOFT' 50;
    margin-bottom: 16px;
  }
  .restaurant-content p {
    color: var(--text-soft);
    font-size: 1.02rem;
    line-height: 1.7;
    margin-bottom: 20px;
  }
  .restaurant-hours {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 28px;
    color: var(--text-soft);
    font-size: 0.92rem;
  }
  .restaurant-hours svg { width: 18px; height: 18px; stroke: var(--sand-dark); }
  .restaurant-highlights {
    display: flex; flex-direction: column; gap: 20px;
  }
  .restaurant-highlight {
    padding: 20px;
    background: var(--weiss);
    border-radius: var(--radius-sm);
    border: 1px solid ${hexToRgba(c.colors.primary, 0.05)};
  }
  .restaurant-highlight h4 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1rem;
    color: var(--tiefblau);
    margin-bottom: 6px;
  }
  .restaurant-highlight p {
    color: var(--text-soft);
    font-size: 0.88rem;
    line-height: 1.6;
    margin: 0;
  }

  /* ========================================
     ACTIVITIES / AKTIVITAETEN
     ======================================== */
  .activities-section { background: var(--weiss); }
  .activities-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .activity-card {
    padding: 36px 28px;
    background: var(--bg-tint);
    border: 1px solid ${hexToRgba(c.colors.primary, 0.05)};
    border-radius: var(--radius);
    text-align: center;
    transition: all 0.3s var(--ease);
  }
  .activity-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); background: var(--weiss); }
  .activity-icon {
    width: 56px; height: 56px;
    display: flex; align-items: center; justify-content: center;
    background: ${hexToRgba(c.colors.accent, 0.12)};
    border-radius: 16px;
    margin: 0 auto 20px;
  }
  .activity-icon svg { width: 26px; height: 26px; stroke: var(--sand-dark); }
  .activity-card h4 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.1rem;
    color: var(--tiefblau);
    font-variation-settings: 'SOFT' 50;
    margin-bottom: 10px;
  }
  .activity-card p {
    color: var(--text-soft);
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: 12px;
  }
  .activity-duration {
    display: inline-block;
    padding: 4px 14px;
    background: ${hexToRgba(c.colors.primary, 0.06)};
    color: var(--tiefblau);
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  /* ========================================
     GALLERY
     ======================================== */
  .gallery-section { background: var(--bg-tint); }
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 280px 220px;
    gap: 16px;
    grid-template-areas:
      "a a b"
      "c d e";
  }
  .gallery-item {
    border-radius: var(--radius);
    overflow: hidden;
    position: relative;
    cursor: pointer;
    transition: all 0.4s var(--ease);
  }
  .gallery-item:hover { transform: scale(1.01); }
  .gallery-item.a { grid-area: a; }
  .gallery-item.b { grid-area: b; }
  .gallery-item.c { grid-area: c; }
  .gallery-item.d { grid-area: d; }
  .gallery-item.e { grid-area: e; }
  .gallery-item .caption {
    position: absolute;
    bottom: 16px; left: 16px;
    background: ${hexToRgba(c.colors.primary, 0.75)};
    backdrop-filter: blur(8px);
    color: var(--sand);
    padding: 6px 14px;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* ========================================
     FAQ SECTION
     ======================================== */
  .faq-section {
    background: var(--weiss);
  }
  .faq-grid {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .faq-item {
    background: var(--bg-tint);
    border: 1px solid ${hexToRgba(c.colors.primary, 0.05)};
    border-radius: var(--radius-sm);
    overflow: hidden;
    transition: all 0.3s var(--ease);
  }
  .faq-item:hover { border-color: ${hexToRgba(c.colors.accent, 0.3)}; }
  .faq-q {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--tiefblau);
    cursor: pointer;
    text-align: left;
    transition: all 0.2s var(--ease);
  }
  .faq-q:hover { background: ${hexToRgba(c.colors.primary, 0.03)}; }
  .faq-icon {
    font-size: 1.3rem;
    color: var(--sand-dark);
    transition: transform 0.3s var(--spring);
    font-weight: 300;
  }
  .faq-item.open .faq-icon { transform: rotate(45deg); }
  .faq-a {
    padding: 0 24px;
    max-height: 0;
    overflow: hidden;
    transition: all 0.4s var(--ease);
    color: var(--text-soft);
    font-size: 0.92rem;
    line-height: 1.7;
  }
  .faq-item.open .faq-a {
    padding: 0 24px 20px;
    max-height: 500px;
  }

  /* ========================================
     CTA / CONTACT FORM SECTION
     ======================================== */
  .cta-section {
    background: linear-gradient(135deg, ${tintHex(c.colors.primary, 0.95)} 0%, ${tintHex(c.colors.accent, 0.9)} 100%);
    border-top: 1px solid ${hexToRgba(c.colors.primary, 0.06)};
  }
  .cta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: start;
  }
  .cta-text .display { font-size: clamp(1.8rem, 3vw, 2.4rem); }
  .cta-text p {
    color: var(--text-soft);
    margin-top: 16px;
    font-size: 1rem;
    line-height: 1.7;
  }
  .cta-features {
    display: flex; flex-direction: column; gap: 12px;
    margin-top: 28px;
  }
  .cta-feature {
    display: flex; align-items: center; gap: 10px;
    font-size: 0.92rem;
    color: var(--text);
    font-weight: 500;
  }
  .cta-feature svg { width: 18px; height: 18px; stroke: var(--sand-dark); flex-shrink: 0; }
  .contact-form {
    background: var(--weiss);
    border-radius: var(--radius);
    padding: 36px;
    box-shadow: var(--shadow-md);
    border: 1px solid ${hexToRgba(c.colors.primary, 0.05)};
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
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-soft);
    margin-bottom: 8px;
  }
  .form-field input,
  .form-field select,
  .form-field textarea {
    width: 100%;
    padding: 14px 16px;
    background: var(--bg-tint);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 14px;
    color: var(--text);
    transition: all 0.2s var(--ease);
  }
  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus {
    border-color: var(--tiefblau);
    box-shadow: 0 0 0 3px ${hexToRgba(c.colors.primary, 0.08)};
    background: var(--weiss);
  }
  .form-field textarea {
    min-height: 120px;
    resize: vertical;
  }
  .form-submit {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 16px 32px;
    background: var(--tiefblau);
    color: var(--sand);
    font-family: var(--font-mono);
    font-size: 12px; font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.3s var(--spring);
    margin-top: 8px;
  }
  .form-submit:hover { background: var(--tiefblau-dark); transform: translateY(-1px); box-shadow: var(--shadow-md); }
  .form-submit:disabled { opacity: 0.6; pointer-events: none; }

  /* ========================================
     ABOUT STATS
     ======================================== */
  .about-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    margin-top: 48px;
    background: var(--weiss);
    border-radius: var(--radius);
    border: 1px solid ${hexToRgba(c.colors.primary, 0.06)};
    overflow: hidden;
  }
  .about-stat {
    padding: 28px 24px;
    text-align: center;
    border-right: 1px solid var(--border);
  }
  .about-stat:last-child { border-right: none; }
  .about-stat .num {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 700;
    color: var(--tiefblau);
    font-variation-settings: 'SOFT' 60;
  }
  .about-stat .label {
    font-size: 0.82rem;
    color: var(--text-soft);
    margin-top: 4px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.04em;
  }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: var(--tiefblau);
    color: ${hexToRgba(c.colors.background, 0.7)};
    padding: 72px 0 32px;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 48px;
    margin-bottom: 48px;
  }
  .footer-brand .logo {
    color: var(--sand);
    margin-bottom: 16px;
  }
  .footer-brand .logo-mark {
    background: ${hexToRgba(c.colors.accent, 0.2)};
    color: var(--sand);
  }
  .footer-brand p {
    font-size: 0.9rem;
    line-height: 1.6;
    color: ${hexToRgba(c.colors.background, 0.5)};
    max-width: 280px;
  }
  .footer-col h4 {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--sand);
    margin-bottom: 20px;
  }
  .footer-col ul { list-style: none; }
  .footer-col li { margin-bottom: 10px; }
  .footer-col a {
    font-size: 0.88rem;
    color: ${hexToRgba(c.colors.background, 0.5)};
    transition: color 0.2s;
  }
  .footer-col a:hover { color: var(--sand); }
  .footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 32px;
    border-top: 1px solid ${hexToRgba(c.colors.background, 0.1)};
  }
  .footer-bottom p, .footer-bottom a {
    font-size: 11px;
    letter-spacing: 0.05em;
    color: ${hexToRgba(c.colors.background, 0.4)};
  }
  .footer-bottom a:hover { color: var(--sand); }
  .footer-legal {
    display: flex; gap: 24px;
  }

  /* ========================================
     STICKY MOBILE CTA
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 16px; left: 16px; right: 16px;
    background: var(--tiefblau);
    color: var(--sand);
    padding: 16px 24px;
    border-radius: 999px;
    z-index: 100;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-align: center;
    box-shadow: 0 8px 32px ${hexToRgba(c.colors.primary, 0.5)};
    transition: all 0.3s var(--spring);
  }
  .mobile-cta:hover { background: var(--tiefblau-dark); }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .hero-grid { grid-template-columns: 1fr; gap: 48px; }
    .hero-visual { display: none; }
    .rooms-grid { grid-template-columns: 1fr 1fr; }
    .reviews-grid { grid-template-columns: 1fr 1fr; }
    .spa-grid { grid-template-columns: 1fr; gap: 32px; }
    .restaurant-grid { grid-template-columns: 1fr; gap: 32px; }
    .cta-grid { grid-template-columns: 1fr; gap: 48px; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .activities-grid { grid-template-columns: 1fr 1fr; }
    .booking-widget { flex-direction: column; align-items: stretch; }
    .booking-submit { width: 100%; justify-content: center; }
    .about-stats { grid-template-columns: repeat(2, 1fr); }
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
    .nav-toggle { display: flex; }
    .form-row { grid-template-columns: 1fr; }
    .rooms-grid { grid-template-columns: 1fr; }
    .reviews-grid { grid-template-columns: 1fr; }
    .location-grid { grid-template-columns: 1fr; }
    .activities-grid { grid-template-columns: 1fr; }
    .about-stats { grid-template-columns: 1fr; gap: 0; }
    .about-stat { border-right: none; border-bottom: 1px solid var(--border); padding: 16px 0; }
    .about-stat:last-child { border-bottom: none; }
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .footer-bottom { flex-direction: column; gap: 12px; }
    .mobile-cta { display: block; }
    body { padding-bottom: 80px; }
    .reviews-score { flex-direction: column; gap: 12px; text-align: center; }
    .reviews-score .meta { text-align: center; }
    .faq-grid { max-width: 100%; }
    .gallery-grid {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(5, 180px);
      grid-template-areas:
        "a"
        "b"
        "c"
        "d"
        "e";
    }
    .spa-image { height: 300px; }
    .restaurant-image { height: 280px; }
    .hero h1 { font-size: 2.4rem; }
    .booking-widget { padding: 20px; gap: 12px; }
  }
  @media (max-width: 480px) {
    .hero { padding: 100px 0 60px; }
    .hero h1 { font-size: 2rem; }
    .hero-lead { font-size: 1rem; }
    .hero-actions { flex-direction: column; align-items: stretch; }
    .btn-primary, .btn-secondary { justify-content: center; }
    .room-content { padding: 20px; }
    .contact-form { padding: 24px; }
    .spa-image { height: 240px; }
    .restaurant-image { height: 220px; }
  }
</style>
</head>
<body>

<!-- ====== NAVIGATION ====== -->
<nav id="main-nav">
  <div class="nav-inner">
    <a href="#" class="logo">
      <span class="logo-mark">${logoInitial}</span>
      ${esc(c.businessName)}
    </a>
    <ul class="nav-links">
      <li><a href="#rooms">Zimmer</a></li>
      <li><a href="#spa">Spa</a></li>
      <li><a href="#restaurant">Restaurant</a></li>
      <li><a href="#activities">Aktivit&auml;ten</a></li>
      <li><a href="#location">Umgebung</a></li>
      <li><a href="#reviews">Bewertungen</a></li>
      <li><a href="#contact">Kontakt</a></li>
    </ul>
    <a href="${esc(c.bookingUrl || '#contact')}" class="nav-cta">
      ${esc(c.ctaText)}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>
    <button class="nav-toggle" aria-label="Men&uuml; &ouml;ffnen" onclick="document.querySelector('.nav-links').classList.toggle('mobile-open')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>
  </div>
</nav>

<!-- ====== HERO ====== -->
<section class="hero">
  <div class="container">
    <div class="hero-grid">
      <div class="hero-content">
        ${c.announceText ? `<div class="hero-tag"><span class="dot"></span>${esc(c.announceText)}</div>` : `<div class="hero-tag"><span class="dot"></span>${esc(c.heroTag)}</div>`}
        <div class="hotel-stars">${hotelStars}</div>
        <h1>${esc(c.heroHeadline)} <em>${esc(c.heroAccent)}</em></h1>
        <p class="hero-lead">${esc(c.heroLead)}</p>
        <div class="hero-actions">
          <a href="${esc(c.bookingUrl || '#contact')}" class="btn-primary">
            Jetzt buchen
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
          <a href="#rooms" class="btn-secondary">Zimmer entdecken</a>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-image-wrapper">
          ${c.heroImageUrl
            ? `<img class="hero-bg" src="${esc(c.heroImageUrl)}" alt="${esc(c.businessName)}">`
            : `<div class="hero-image-placeholder">${logoInitial}</div>`}
        </div>
        <div class="hero-float-card">
          <div class="hero-float-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 17c2-2 5-2 7 0s5 2 7 0s5-2 7 0"/><path d="M3 12c2-2 5-2 7 0s5 2 7 0s5-2 7 0"/></svg>
          </div>
          <div>
            <div class="hero-float-label">Direkte Strandlage</div>
            <div class="hero-float-value">Meerblick</div>
          </div>
        </div>
      </div>
    </div>
    ${bookingWidget}
  </div>
</section>

<!-- ====== ABOUT STATS ====== -->
${aboutStatsHtml ? `<section class="stats-section" style="padding:0 0 64px">
  <div class="container">
    ${aboutStatsHtml}
  </div>
</section>` : ''}

<!-- ====== ROOMS / ZIMMER-GALERIE ====== -->
<section id="rooms" class="rooms-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.roomsSectionTitle || 'Unsere Zimmer')}</span>
      <h2 class="display">${c.roomsSectionSubtitle || 'Nordisches <em>Wohngef&uuml;hl</em>.'}</h2>
      <p>Jedes Zimmer verbindet maritimes Design mit h&ouml;chstem Komfort &mdash; mit Blick auf D&uuml;nen, Meer oder Leuchtturm.</p>
    </div>
    <div class="rooms-grid">
      ${roomsHtml}
    </div>
  </div>
</section>

<!-- ====== SPA / THALASSO ====== -->
${spaSection}

<!-- ====== GALLERY ====== -->
<section id="gallery" class="gallery-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Impressionen</span>
      <h2 class="display">Momente am <em>Meer</em>.</h2>
    </div>
    <div class="gallery-grid">
      ${galleryHtml}
    </div>
  </div>
</section>

<!-- ====== LOCATION / LAGE ====== -->
<section id="location" class="location-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.locationSectionTitle || 'Unsere Lage')}</span>
      <h2 class="display">${c.locationSectionSubtitle || 'Mitten im <em>Nordseeparadies</em>.'}</h2>
      <p>Strand, Leuchtturm und Promenade &mdash; alles in unmittelbarer N&auml;he.</p>
    </div>
    <div class="location-grid">
      ${locationsHtml}
    </div>
  </div>
</section>

<!-- ====== REVIEWS / BEWERTUNGEN ====== -->
<section id="reviews" class="reviews-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.reviewsSectionTitle || 'G&auml;stestimmen')}</span>
      <h2 class="display">Was unsere <em>G&auml;ste</em> sagen.</h2>
    </div>
    ${c.reviews.length > 0 ? `
    <div class="reviews-score">
      <div class="rating">${(c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length).toFixed(1)}</div>
      <div>
        <div class="stars">${generateStarsSvg(Math.round(c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length))}</div>
        <div class="meta">${c.reviews.length} Bewertungen auf verschiedenen Plattformen</div>
      </div>
    </div>` : ''}
    <div class="reviews-grid">
      ${reviewsHtml}
    </div>
  </div>
</section>

<!-- ====== RESTAURANT ====== -->
${restaurantSection}

<!-- ====== ACTIVITIES / AKTIVITAETEN ====== -->
<section id="activities" class="activities-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.activitiesSectionTitle || 'Aktivit&auml;ten')}</span>
      <h2 class="display">${c.activitiesSectionSubtitle || 'Nordsee <em>erleben</em>.'}</h2>
      <p>Wattwandern, Surfen, Radfahren &mdash; die Nordsee bietet unvergessliche Erlebnisse.</p>
    </div>
    <div class="activities-grid">
      ${activitiesHtml}
    </div>
  </div>
</section>

<!-- ====== FAQ ====== -->
${(c.faqItems || []).length > 0 ? `<section id="faq" class="faq-section">
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

<!-- ====== CTA / CONTACT FORM ====== -->
${c.contactEnabled !== false ? `<section id="contact" class="cta-section">
  <div class="container cta-grid">
    <div class="cta-text">
      <span class="eyebrow" style="color: var(--sand-dark); display:block; margin-bottom:16px;">${esc(c.ctaSectionTitle || 'Kontakt &amp; Concierge')}</span>
      <h2 class="display">${c.ctaSectionSubtitle || 'Schreiben Sie <em>uns</em>.'}</h2>
      <p>Ob Buchungsanfrage, Concierge-Service oder besondere W&uuml;nsche &mdash; unser Team freut sich auf Ihre Nachricht.</p>

      ${ctaFeaturesHtml.length > 0 ? `<div class="cta-features">${ctaFeaturesHtml}</div>` : `
      <div class="cta-features">
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Pers&ouml;nlicher Concierge-Service
        </div>
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Spa &amp; Thalasso-Reservierung
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
            <option>Allgemeine Anfrage</option>
            <option>Zimmer-Reservierung</option>
            <option>Spa &amp; Thalasso</option>
            <option>Restaurant-Reservierung</option>
            <option>Concierge-Service</option>
            <option>Strandkorb-Reservierung</option>
            <option>Gruppenreise</option>
            <option>Feedback</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label>Anreise (optional)</label>
          <input type="date" name="checkin">
        </div>
        <div class="form-field">
          <label>Abreise (optional)</label>
          <input type="date" name="checkout">
        </div>
      </div>

      <div class="form-row full">
        <div class="form-field">
          <label>Nachricht*</label>
          <textarea name="message" required placeholder="Erz&auml;hlen Sie uns von Ihren W&uuml;nschen &mdash; wir k&uuml;mmern uns um alles ..."></textarea>
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
        ${c.address ? `<p style="margin-top:12px;font-size:.85rem;color:${hexToRgba(c.colors.background, 0.45)}">${esc(c.address)}</p>` : ''}
        ${c.phone ? `<p style="margin-top:6px;font-size:.85rem"><a href="tel:${esc(c.phone)}" style="color:var(--sand)">${esc(c.phone)}</a></p>` : ''}
        ${c.email ? `<p style="margin-top:4px;font-size:.85rem"><a href="mailto:${esc(c.email)}" style="color:${hexToRgba(c.colors.background, 0.5)}">${esc(c.email)}</a></p>` : ''}
      </div>
      ${footerColumnsHtml}
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} ${esc(c.businessName)}. Alle Rechte vorbehalten.</p>
      <div class="footer-legal">
        <a href="${esc(c.imprintUrl || '#')}">Impressum</a>
        <a href="${esc(c.privacyUrl || '#')}">Datenschutz</a>
      </div>
    </div>

    ${hoursHtml ? `
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid ${hexToRgba(c.colors.background, 0.08)}">
      <h4 style="font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--sand);margin-bottom:16px">Rezeption</h4>
      <div style="display:flex;flex-wrap:wrap;gap:16px">
        ${c.openingHours.map(h => `<div style="font-size:.85rem;color:${hexToRgba(c.colors.background, 0.5)}"><strong style="color:${hexToRgba(c.colors.background, 0.7)}">${esc(h.days)}</strong> ${esc(h.hours)}</div>`).join('')}
      </div>
    </div>` : ''}
  </div>
</footer>

<!-- Sticky Mobile CTA -->
<a href="${esc(c.bookingUrl || '#contact')}" class="mobile-cta">${esc(c.ctaText)} &rarr;</a>

<!-- Scripts -->
<script>
  /* Navigation scroll effect */
  (function(){
    var nav = document.getElementById('main-nav');
    var scrolled = false;
    window.addEventListener('scroll', function() {
      if (window.scrollY > 60 && !scrolled) {
        nav.classList.add('scrolled');
        scrolled = true;
      } else if (window.scrollY <= 60 && scrolled) {
        nav.classList.remove('scrolled');
        scrolled = false;
      }
    });
  })();

  /* FAQ accordion */
  (function(){
    var faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function(item) {
      var btn = item.querySelector('.faq-q');
      if (btn) {
        btn.addEventListener('click', function() {
          var isOpen = item.classList.contains('open');
          faqItems.forEach(function(other) { other.classList.remove('open'); });
          if (!isOpen) item.classList.add('open');
          btn.setAttribute('aria-expanded', !isOpen);
        });
      }
    });
  })();

  /* Smooth scroll for anchor links */
  (function(){
    document.querySelectorAll('a[href^="#"]').forEach(function(a) {
      a.addEventListener('click', function(e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          /* Close mobile nav if open */
          var mobileNav = document.querySelector('.nav-links.mobile-open');
          if (mobileNav) mobileNav.classList.remove('mobile-open');
        }
      });
    });
  })();

  /* Intersection Observer for scroll animations */
  (function(){
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      document.querySelectorAll('.room-card, .review-card, .activity-card, .location-point, .faq-item, .gallery-item, .spa-feature, .restaurant-highlight').forEach(function(el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
      });
    }
  })();

  /* Contact form submission */
  ${c.contactEnabled !== false ? `(function(){
    var form = document.getElementById('contact-form');
    var btn = document.getElementById('contact-submit');
    if (form) {
      form.addEventListener('submit', function(ev) {
        ev.preventDefault();
        var hp = form.querySelector('input[name="website"]');
        if (hp && hp.value) return;
        btn.disabled = true;
        btn.innerHTML = 'Wird gesendet\\u2026';
        setTimeout(function() {
          btn.innerHTML = '\\u2713 Nachricht gesendet!';
          btn.style.background = '${accentDark}';
          form.reset();
          setTimeout(function() {
            btn.disabled = false;
            btn.innerHTML = 'Nachricht senden <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
            btn.style.background = '';
          }, 3000);
        }, 1200);
      });
    }
  })();` : ''}

  /* Mobile navigation overlay styles */
  (function(){
    var style = document.createElement('style');
    style.textContent = \`
      .nav-links.mobile-open {
        display: flex !important;
        flex-direction: column;
        position: fixed;
        top: 72px; left: 0; right: 0;
        background: ${hexToRgba(c.colors.background, 0.98)};
        backdrop-filter: blur(20px);
        padding: 24px 32px;
        gap: 4px;
        border-bottom: 1px solid ${hexToRgba(c.colors.primary, 0.08)};
        box-shadow: 0 8px 32px ${hexToRgba(c.colors.primary, 0.1)};
        z-index: 999;
      }
      .nav-links.mobile-open a {
        padding: 14px 16px;
        font-size: 15px;
        border-radius: 12px;
      }
    \`;
    document.head.appendChild(style);
  })();

  /* Booking widget date defaults */
  (function(){
    var today = new Date();
    var tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    var dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 3);
    var checkin = document.querySelector('.booking-widget input[name="checkin"]');
    var checkout = document.querySelector('.booking-widget input[name="checkout"]');
    if (checkin) checkin.value = tomorrow.toISOString().split('T')[0];
    if (checkout) checkout.value = dayAfter.toISOString().split('T')[0];
  })();
</script>

<!-- Cookie Banner -->
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba(c.colors.primary, 0.97)};backdrop-filter:blur(12px);color:var(--sand);padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:${hexToRgba(c.colors.background, 0.8)}">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--sand);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--sand);color:var(--tiefblau);border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
