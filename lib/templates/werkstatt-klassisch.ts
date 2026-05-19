export interface WerkstattKlassischConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  ctaText: string
  announceText?: string
  colors: {
    primary: string    // Anthrazit (#1a1a1a)
    accent: string     // Werkstatt-Orange (#e87a2a)
    bg: string         // Hell (#f5f3f0)
  }
  phone?: string
  email?: string
  address?: string
  openingHours: { days: string; hours: string }[]
  services: {
    category: string
    items: { name: string; description: string; price: string; duration?: string; tag?: string }[]
  }[]
  tuevBanner?: {
    headline: string
    subline: string
    ctaText: string
    ctaHref: string
  }
  markenSpezialisierung?: {
    title: string
    subtitle: string
    marken: { name: string; description: string; icon?: string }[]
  }
  holservice?: {
    title: string
    description: string
    steps: { step: string; text: string }[]
    note?: string
  }
  referenzen?: { text: string; name: string; fahrzeug?: string }[]
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
  locationTitle?: string
  locationSubtitle?: string
  locationDetails?: { icon: string; label: string; value: string }[]
  ctaSectionTitle?: string
  ctaSectionSubtitle?: string
  ctaFeatures?: string[]
  servicesSectionTitle?: string
  servicesSectionSubtitle?: string
  reviewsSectionTitle?: string
  teamSectionTitle?: string
  teamSectionSubtitle?: string
  meisterInfo?: {
    name: string
    title: string
    since?: string
    imageUrl?: string
    quote?: string
    certifications?: string[]
  }
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
  const star = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z" fill="currentColor"/></svg>'
  return Array(count).fill(star).join('\n            ')
}

export function renderWerkstattKlassischTemplate(config: WerkstattKlassischConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const accentDark = darkenHex(c.colors.accent, 0.2)
  const accentLight = tintHex(c.colors.accent, 0.85)
  const primaryLight = tintHex(c.colors.primary, 0.12)
  const textDark = c.colors.primary
  const textSoft = hexToRgba(c.colors.primary, 0.6)
  const textMuted = hexToRgba(c.colors.primary, 0.4)
  const borderColor = hexToRgba(c.colors.primary, 0.1)
  const bgCard = '#ffffff'
  const bgDark = c.colors.primary
  const bgDarkCard = tintHex(c.colors.primary, 0.08)

  const logoInitial = esc(c.businessName.charAt(0))

  // Service tabs from categories
  const serviceTabs = c.services.map((cat, i) =>
    `<button class="service-tab${i === 0 ? ' active' : ''}" data-cat="${i}">${esc(cat.category)}</button>`
  ).join('\n      ')

  // Service items
  const serviceItemsHtml = c.services.map((cat, catIdx) =>
    `<div class="service-category" data-cat-content="${catIdx}" style="${catIdx === 0 ? '' : 'display:none'}">
      <div class="service-grid">
        ${cat.items.map(item => `
        <div class="service-item">
          <div class="service-item-top">
            <div class="service-item-info">
              <h4>${esc(item.name)}</h4>
              <p>${esc(item.description)}</p>
              ${item.duration ? `<span class="service-duration"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>${esc(item.duration)}</span>` : ''}
              ${item.tag ? `<span class="service-tag${item.tag.toLowerCase() === 'festpreis' ? ' fest' : item.tag.toLowerCase() === 'aktion' ? ' aktion' : item.tag.toLowerCase() === 'beliebt' ? ' beliebt' : ''}">${esc(item.tag)}</span>` : ''}
            </div>
            <div class="service-item-price">${esc(item.price)}</div>
          </div>
        </div>`).join('')}
      </div>
    </div>`
  ).join('\n')

  // TUeV Banner
  const tuev = c.tuevBanner || {
    headline: 'HU/AU f&auml;llig?',
    subline: 'TÜV-Abnahme direkt bei uns im Haus. Ohne Wartezeit, ohne Umwege.',
    ctaText: 'Jetzt Termin vereinbaren',
    ctaHref: '#contact'
  }

  // Marken-Spezialisierung
  const marken = c.markenSpezialisierung || {
    title: 'Marken-Spezialisierung',
    subtitle: 'Unsere <em>Expertise</em>.',
    marken: [
      { name: 'BMW', description: 'Alle Baureihen, E-Fahrzeuge, M-Modelle' },
      { name: 'Mercedes-Benz', description: 'PKW, AMG, Transporter, Elektro' },
      { name: 'VW / Audi', description: 'Konzernfahrzeuge, DSG, TFSI-Motoren' },
      { name: 'Porsche', description: 'Sportwagen, Cayenne, Taycan' },
    ]
  }
  const markenHtml = marken.marken.map(m => {
    const iconSvg = m.icon === 'wrench'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>'
    return `
      <div class="marke-card">
        <div class="marke-icon">${iconSvg}</div>
        <h4>${esc(m.name)}</h4>
        <p>${esc(m.description)}</p>
      </div>`
  }).join('')

  // Holservice
  const holservice = c.holservice || {
    title: 'Hol- &amp; Bringservice',
    description: 'Keine Zeit, Ihr Fahrzeug vorbeizubringen? Wir holen es ab und bringen es Ihnen zur&uuml;ck &mdash; unkompliziert und zuverl&auml;ssig.',
    steps: [
      { step: '1', text: 'Termin vereinbaren und Abholadresse angeben' },
      { step: '2', text: 'Wir holen Ihr Fahrzeug zum Wunschtermin ab' },
      { step: '3', text: 'Reparatur / Wartung in unserer Meisterwerkstatt' },
      { step: '4', text: 'R&uuml;ckgabe direkt vor Ihre T&uuml;r' },
    ],
    note: 'Im Umkreis von 15 km kostenfrei.'
  }

  // Referenzen
  const referenzen = c.referenzen || []
  const referenzenHtml = referenzen.map(r => `
      <div class="referenz-card">
        <div class="referenz-quote">
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" opacity="0.15"><path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z"/></svg>
          <p>&ldquo;${esc(r.text)}&rdquo;</p>
        </div>
        <div class="referenz-author">
          <strong>${esc(r.name)}</strong>
          ${r.fahrzeug ? `<span>${esc(r.fahrzeug)}</span>` : ''}
        </div>
      </div>`).join('')

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

  // Opening hours HTML
  const hoursHtml = c.openingHours.map(h => `
      <div class="hours-item">
        <div class="hours-day">${esc(h.days)}</div>
        <div class="hours-time">${esc(h.hours)}</div>
      </div>`).join('')

  // FAQ HTML
  const faqHtml = (c.faqItems || []).map(f => `
      <div class="faq-item">
        <button class="faq-q" aria-expanded="false">${esc(f.question)}<span class="faq-icon">+</span></button>
        <div class="faq-a" role="region">${esc(f.answer)}</div>
      </div>`).join('')

  // About stats
  const aboutStats = c.aboutStats || [
    { value: '25+', label: 'Jahre Erfahrung' },
    { value: '8.000+', label: 'Zufriedene Kunden' },
    { value: '100%', label: 'Meisterbetrieb' },
  ]
  const aboutStatsHtml = `
      <div class="about-stats">
        ${aboutStats.map(s => `
        <div class="about-stat">
          <div class="stat-value">${esc(s.value)}</div>
          <div class="stat-label">${esc(s.label)}</div>
        </div>`).join('')}
      </div>`

  // Location details
  const locationDetails = c.locationDetails || []
  const locationDetailsHtml = locationDetails.map(d => `
      <div class="location-detail">
        <div class="loc-icon">
          ${d.icon === 'pin' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
          : d.icon === 'transit' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>'
          : d.icon === 'phone' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
          : d.icon === 'parking' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a4 4 0 0 1 0 8H9"/></svg>'
          : d.icon === 'email' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>'}
        </div>
        <div>
          <div class="loc-label">${esc(d.label)}</div>
          <div class="loc-value">${d.value}</div>
        </div>
      </div>`).join('')

  // CTA features
  const ctaFeatures = c.ctaFeatures || [
    'Festpreisgarantie auf alle Services',
    'KFZ-Meisterbetrieb mit T\u00dcV-Abnahme',
    'Antwort innerhalb von 24h',
  ]
  const ctaFeaturesHtml = ctaFeatures.map(f => `
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M5 13l4 4L19 7"/></svg>
          ${esc(f)}
        </div>`).join('')

  // Footer columns
  const footerColumns = c.footerColumns || [
    { title: 'Leistungen', links: [
      { label: 'Inspektion', href: '#services' },
      { label: '&Ouml;lwechsel', href: '#services' },
      { label: 'Bremsen', href: '#services' },
      { label: 'HU/AU', href: '#services' },
    ]},
    { title: 'Werkstatt', links: [
      { label: '&Ouml;ffnungszeiten', href: '#hours' },
      { label: 'Anfahrt', href: '#location' },
      { label: 'Kontakt', href: '#contact' },
    ]},
  ]
  const footerColumnsHtml = footerColumns.map(col => `
      <div class="footer-col">
        <h4>${esc(col.title)}</h4>
        <ul>
          ${col.links.map(l => `<li><a href="${esc(l.href)}">${l.label}</a></li>`).join('\n          ')}
        </ul>
      </div>`).join('')

  // Features
  const features = c.features || [
    { icon: 'wrench', title: 'KFZ-Meisterbetrieb', description: 'Alle Arbeiten von zertifizierten Meistern &mdash; mit Gew&auml;hrleistung und Qualit&auml;tsgarantie.' },
    { icon: 'shield', title: 'Festpreisgarantie', description: 'Transparente Preise ohne versteckte Kosten. Sie wissen vorher, was es kostet.' },
    { icon: 'clock', title: 'Schnell &amp; zuverl&auml;ssig', description: 'Die meisten Arbeiten am selben Tag erledigt. Kein wochenlanges Warten.' },
    { icon: 'car', title: 'Hol- &amp; Bringservice', description: 'Wir holen Ihr Fahrzeug ab und bringen es repariert zur&uuml;ck.' },
  ]
  const featuresHtml = features.map(f => `
      <div class="feature-card">
        <div class="feature-icon">
          ${f.icon === 'wrench' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>'
          : f.icon === 'shield' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>'
          : f.icon === 'clock' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'
          : f.icon === 'car' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 17h14v-5l-2-6H7L5 12v5z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/><path d="M3 17h2M19 17h2"/></svg>'
          : f.icon === 'tools' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18M3 12h18M3 18h18"/></svg>'}
        </div>
        <h3>${f.title}</h3>
        <p>${f.description}</p>
      </div>`).join('')

  // Meister Info
  const meister = c.meisterInfo
  const meisterHtml = meister ? `
    <section class="meister-section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Ihr KFZ-Meister</span>
          <h2 class="display">Handwerk mit <em>Verantwortung</em>.</h2>
        </div>
        <div class="meister-card">
          <div class="meister-photo">
            ${meister.imageUrl
              ? `<img src="${esc(meister.imageUrl)}" alt="${esc(meister.name)}" loading="lazy">`
              : `<div class="meister-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`}
          </div>
          <div class="meister-info">
            <h3>${esc(meister.name)}</h3>
            <span class="meister-title">${esc(meister.title)}</span>
            ${meister.since ? `<span class="meister-since">Seit ${esc(meister.since)}</span>` : ''}
            ${meister.quote ? `<blockquote class="meister-quote">&ldquo;${esc(meister.quote)}&rdquo;</blockquote>` : ''}
            ${meister.certifications && meister.certifications.length > 0 ? `
            <div class="meister-certs">
              ${meister.certifications.map(cert => `<span class="cert-badge">${esc(cert)}</span>`).join('\n              ')}
            </div>` : ''}
          </div>
        </div>
      </div>
    </section>` : ''

  // Holservice steps
  const holserviceHtml = holservice.steps.map(s => `
        <div class="hol-step">
          <div class="hol-step-num">${esc(s.step)}</div>
          <p>${esc(s.text)}</p>
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

<!-- Schema.org AutoRepair -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  "name": "${esc(c.businessName)}",
  "description": "${esc(c.tagline)}",
  ${c.address ? `"address": { "@type": "PostalAddress", "streetAddress": "${esc(c.address)}" },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  "priceRange": "$$",
  "currenciesAccepted": "EUR",
  "paymentAccepted": "Cash, EC-Karte, Kreditkarte, &Uuml;berweisung",
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
     WERKSTATT KLASSISCH TEMPLATE
     Motorwerk Berlin &mdash; KFZ-Meisterbetrieb
     Handwerklich-ehrlich, meisterlich, unkompliziert
     ======================================== */

  :root {
    --anthrazit: ${c.colors.primary};
    --orange: ${c.colors.accent};
    --hell: ${c.colors.bg};
    --orange-dark: ${accentDark};
    --orange-light: ${accentLight};
    --primary-light: ${primaryLight};
    --text-dark: ${textDark};
    --text-soft: ${textSoft};
    --text-muted: ${textMuted};
    --border: ${borderColor};
    --bg-card: ${bgCard};
    --bg-dark: ${bgDark};
    --bg-dark-card: ${bgDarkCard};

    --font-display: 'Fraunces', Georgia, serif;
    --font-body: 'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  }

  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: var(--font-body);
    font-size: 16px;
    line-height: 1.6;
    color: var(--text-dark);
    background: var(--hell);
    overflow-x: hidden;
  }

  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; height: auto; display: block; }

  .container {
    max-width: 1140px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* ========================================
     TYPOGRAPHY
     ======================================== */

  .section-head {
    text-align: center;
    margin-bottom: 56px;
  }

  .section-head .eyebrow {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: .72rem;
    font-weight: 500;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--orange);
    margin-bottom: 12px;
  }

  .section-head .display {
    font-family: var(--font-display);
    font-size: clamp(2rem, 4vw, 2.8rem);
    font-weight: 800;
    line-height: 1.15;
    color: var(--anthrazit);
    margin-bottom: 16px;
  }

  .section-head .display em {
    font-style: normal;
    color: var(--orange);
  }

  .section-head p {
    color: var(--text-soft);
    font-size: 1.05rem;
    max-width: 560px;
    margin: 0 auto;
    line-height: 1.7;
  }

  /* Dark section heads */
  .dark-section .section-head .display { color: var(--hell); }
  .dark-section .section-head p { color: ${hexToRgba(c.colors.bg, 0.65)}; }
  .dark-section .section-head .eyebrow { color: var(--orange); }

  /* ========================================
     NAVIGATION
     ======================================== */

  nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: transparent;
    transition: all 0.35s ease;
  }

  nav.scrolled {
    background: ${hexToRgba(c.colors.bg, 0.97)};
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 1px 0 var(--border);
  }

  .nav-inner {
    max-width: 1140px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 72px;
  }

  .nav-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
  }

  .logo-mark {
    width: 40px;
    height: 40px;
    background: var(--orange);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 1.1rem;
    border-radius: 6px;
  }

  .logo-text {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.05rem;
    color: var(--anthrazit);
  }

  nav.scrolled .logo-text { color: var(--anthrazit); }

  .nav-links {
    display: flex;
    list-style: none;
    gap: 32px;
  }

  .nav-links a {
    font-size: .88rem;
    font-weight: 500;
    color: var(--text-soft);
    transition: color 0.25s;
    letter-spacing: 0.01em;
  }

  .nav-links a:hover { color: var(--orange); }

  .nav-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--orange);
    color: #fff;
    padding: 10px 22px;
    border-radius: 6px;
    font-size: .85rem;
    font-weight: 600;
    transition: all 0.25s;
    text-decoration: none;
  }

  .nav-cta:hover {
    background: var(--orange-dark);
    transform: translateY(-1px);
  }

  .nav-burger {
    display: none;
    background: none;
    border: none;
    color: var(--anthrazit);
    cursor: pointer;
    width: 28px;
    height: 28px;
  }

  .nav-burger svg { width: 100%; height: 100%; }

  /* Mobile overlay */
  .nav-mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1001;
    background: var(--hell);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .nav-mobile-overlay.open {
    opacity: 1;
    pointer-events: auto;
  }

  .nav-mobile-close {
    position: absolute;
    top: 22px;
    right: 24px;
    background: none;
    border: none;
    width: 28px;
    height: 28px;
    color: var(--anthrazit);
    cursor: pointer;
  }

  .nav-mobile-close svg { width: 100%; height: 100%; }

  .nav-mobile-link {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--anthrazit);
    transition: color 0.2s;
  }

  .nav-mobile-link:hover { color: var(--orange); }

  /* ========================================
     HERO
     ======================================== */

  .hero {
    min-height: 92vh;
    display: flex;
    align-items: center;
    padding: 120px 0 80px;
    background: var(--hell);
    position: relative;
    overflow: hidden;
  }

  .hero::before {
    content: '';
    position: absolute;
    top: 0;
    right: -20%;
    width: 60%;
    height: 100%;
    background: ${hexToRgba(c.colors.accent, 0.04)};
    border-radius: 0 0 0 40%;
    pointer-events: none;
  }

  .hero-grid {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 64px;
    align-items: center;
  }

  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: .72rem;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--orange);
    margin-bottom: 20px;
  }

  .hero-tag svg {
    width: 16px;
    height: 16px;
    stroke: var(--orange);
  }

  .hero h1 {
    font-family: var(--font-display);
    font-size: clamp(2.6rem, 5vw, 3.8rem);
    font-weight: 900;
    line-height: 1.08;
    color: var(--anthrazit);
    margin-bottom: 20px;
    letter-spacing: -0.02em;
  }

  .hero h1 em {
    font-style: normal;
    color: var(--orange);
  }

  .hero-lead {
    color: var(--text-soft);
    font-size: 1.12rem;
    line-height: 1.7;
    max-width: 480px;
    margin-bottom: 32px;
  }

  .hero-actions {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: var(--orange);
    color: #fff;
    padding: 15px 30px;
    border-radius: 6px;
    font-weight: 600;
    font-size: .95rem;
    transition: all 0.25s;
    text-decoration: none;
  }

  .btn-primary:hover {
    background: var(--orange-dark);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${hexToRgba(c.colors.accent, 0.3)};
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: var(--anthrazit);
    padding: 15px 30px;
    border: 2px solid var(--border);
    border-radius: 6px;
    font-weight: 600;
    font-size: .95rem;
    transition: all 0.25s;
    text-decoration: none;
  }

  .btn-secondary:hover {
    border-color: var(--orange);
    color: var(--orange);
  }

  /* Hero visual */
  .hero-visual {
    position: relative;
  }

  .hero-image-wrapper {
    border-radius: 12px;
    overflow: hidden;
    aspect-ratio: 4/3;
    position: relative;
    background: ${hexToRgba(c.colors.primary, 0.05)};
  }

  .hero-image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hero-bg {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, ${hexToRgba(c.colors.primary, 0.06)} 0%, ${hexToRgba(c.colors.accent, 0.08)} 100%);
  }

  .hero-badge {
    position: absolute;
    bottom: -16px;
    right: 24px;
    background: var(--orange);
    color: #fff;
    padding: 14px 20px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 8px 24px ${hexToRgba(c.colors.accent, 0.35)};
  }

  .hero-badge .big {
    display: block;
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 1.1rem;
    letter-spacing: 1px;
  }

  .hero-badge .small {
    display: block;
    font-family: var(--font-mono);
    font-size: .62rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    opacity: 0.8;
    margin-top: 2px;
  }

  /* ========================================
     TUEV / HU BANNER
     ======================================== */

  .tuev-banner {
    background: var(--anthrazit);
    padding: 28px 0;
  }

  .tuev-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
  }

  .tuev-text {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .tuev-icon {
    width: 48px;
    height: 48px;
    background: var(--orange);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .tuev-icon svg {
    width: 24px;
    height: 24px;
    stroke: #fff;
  }

  .tuev-text h3 {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.2rem;
    color: var(--hell);
  }

  .tuev-text h3 em { font-style: normal; color: var(--orange); }

  .tuev-text p {
    color: ${hexToRgba(c.colors.bg, 0.6)};
    font-size: .9rem;
    margin-top: 2px;
  }

  .tuev-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--orange);
    color: #fff;
    padding: 12px 24px;
    border-radius: 6px;
    font-weight: 600;
    font-size: .88rem;
    transition: all 0.25s;
    text-decoration: none;
    white-space: nowrap;
  }

  .tuev-cta:hover {
    background: var(--orange-dark);
    transform: translateY(-1px);
  }

  /* ========================================
     FEATURES
     ======================================== */

  .features-section {
    padding: 80px 0;
    background: var(--hell);
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }

  .feature-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 28px 24px;
    transition: all 0.3s;
  }

  .feature-card:hover {
    border-color: var(--orange);
    transform: translateY(-4px);
    box-shadow: 0 12px 32px ${hexToRgba(c.colors.primary, 0.08)};
  }

  .feature-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    color: var(--orange);
  }

  .feature-icon svg {
    width: 28px;
    height: 28px;
  }

  .feature-card h3 {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.05rem;
    color: var(--anthrazit);
    margin-bottom: 8px;
  }

  .feature-card p {
    color: var(--text-soft);
    font-size: .88rem;
    line-height: 1.6;
  }

  /* ========================================
     SERVICES WITH PRICES
     ======================================== */

  .services-section {
    padding: 96px 0;
    background: var(--bg-card);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  .service-tabs {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 40px;
    flex-wrap: wrap;
  }

  .service-tab {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-soft);
    padding: 10px 22px;
    border-radius: 6px;
    font-family: var(--font-body);
    font-size: .85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s;
  }

  .service-tab:hover {
    border-color: var(--orange);
    color: var(--orange);
  }

  .service-tab.active {
    background: var(--orange);
    color: #fff;
    border-color: var(--orange);
  }

  .service-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .service-item {
    background: var(--hell);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 24px;
    transition: all 0.25s;
  }

  .service-item:hover {
    border-color: ${hexToRgba(c.colors.accent, 0.3)};
    box-shadow: 0 4px 16px ${hexToRgba(c.colors.primary, 0.06)};
  }

  .service-item-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }

  .service-item-info h4 {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1rem;
    color: var(--anthrazit);
    margin-bottom: 4px;
  }

  .service-item-info p {
    color: var(--text-soft);
    font-size: .85rem;
    line-height: 1.5;
    margin-bottom: 8px;
  }

  .service-duration {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-mono);
    font-size: .72rem;
    color: var(--text-muted);
    letter-spacing: 0.5px;
  }

  .service-tag {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: .65rem;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 4px;
    margin-left: 8px;
    background: ${hexToRgba(c.colors.accent, 0.1)};
    color: var(--orange);
  }

  .service-tag.fest {
    background: ${hexToRgba(c.colors.accent, 0.12)};
    color: var(--orange-dark);
  }

  .service-tag.aktion {
    background: #fef3c7;
    color: #92400e;
  }

  .service-tag.beliebt {
    background: #dcfce7;
    color: #166534;
  }

  .service-item-price {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.15rem;
    color: var(--orange);
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* MARKEN-SPEZIALISIERUNG */
  .marken-section { padding:96px 0; background:var(--hell); }
  .marken-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }
  .marke-card { background:var(--bg-card); border:1px solid var(--border); border-radius:10px; padding:32px 24px; text-align:center; transition:all 0.3s; }
  .marke-card:hover { border-color:var(--orange); transform:translateY(-4px); box-shadow:0 12px 32px ${hexToRgba(c.colors.primary, 0.08)}; }
  .marke-icon { width:48px; height:48px; margin:0 auto 16px; color:var(--orange); display:flex; align-items:center; justify-content:center; }
  .marke-icon svg { width:32px; height:32px; }
  .marke-card h4 { font-family:var(--font-display); font-weight:700; font-size:1.1rem; color:var(--anthrazit); margin-bottom:6px; }
  .marke-card p { color:var(--text-soft); font-size:.85rem; line-height:1.5; }

  /* HOLSERVICE */
  .holservice-section { padding:96px 0; background:var(--anthrazit); }
  .holservice-grid { display:grid; grid-template-columns:1fr 1fr; gap:56px; align-items:center; }
  .holservice-text h2 { font-family:var(--font-display); font-size:clamp(1.8rem,3.5vw,2.4rem); font-weight:800; color:var(--hell); margin-bottom:16px; line-height:1.15; }
  .holservice-text h2 em { font-style:normal; color:var(--orange); }
  .holservice-text > p { color:${hexToRgba(c.colors.bg, 0.6)}; font-size:1rem; line-height:1.7; margin-bottom:8px; }
  .holservice-note { font-family:var(--font-mono); font-size:.78rem; color:var(--orange); margin-top:16px; letter-spacing:0.5px; }
  .hol-steps { display:flex; flex-direction:column; gap:20px; }
  .hol-step { display:flex; align-items:flex-start; gap:16px; }
  .hol-step-num { width:40px; height:40px; background:var(--orange); color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:var(--font-display); font-weight:800; font-size:1rem; flex-shrink:0; }
  .hol-step p { color:${hexToRgba(c.colors.bg, 0.75)}; font-size:.95rem; line-height:1.5; padding-top:8px; }

  /* REFERENZEN */
  .referenzen-section { padding:96px 0; background:var(--bg-card); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
  .referenzen-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
  .referenz-card { background:var(--hell); border:1px solid var(--border); border-radius:10px; padding:28px 24px; transition:all 0.3s; }
  .referenz-card:hover { border-color:${hexToRgba(c.colors.accent, 0.3)}; box-shadow:0 8px 24px ${hexToRgba(c.colors.primary, 0.06)}; }
  .referenz-quote { position:relative; margin-bottom:16px; }
  .referenz-quote svg { position:absolute; top:-4px; left:-4px; }
  .referenz-quote p { color:var(--text-dark); font-size:.95rem; line-height:1.6; font-style:italic; padding-top:4px; }
  .referenz-author { display:flex; flex-direction:column; gap:2px; }
  .referenz-author strong { font-size:.88rem; color:var(--anthrazit); }
  .referenz-author span { font-family:var(--font-mono); font-size:.72rem; color:var(--orange); letter-spacing:0.5px; }

  /* REVIEWS */
  .reviews-section { padding:96px 0; background:var(--hell); }
  .reviews-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
  .review-card { background:var(--bg-card); border:1px solid var(--border); border-radius:10px; padding:28px 24px; transition:all 0.3s; }
  .review-card:hover { border-color:${hexToRgba(c.colors.accent, 0.3)}; transform:translateY(-2px); box-shadow:0 8px 24px ${hexToRgba(c.colors.primary, 0.06)}; }
  .review-stars { display:flex; gap:2px; margin-bottom:14px; color:var(--orange); }
  .review-text { color:var(--text-dark); font-size:.95rem; line-height:1.65; margin-bottom:20px; font-style:italic; }
  .review-author { display:flex; align-items:center; gap:12px; }
  .review-avatar { width:36px; height:36px; background:var(--orange); color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:var(--font-mono); font-size:.68rem; font-weight:700; letter-spacing:1px; }
  .review-name { font-size:.88rem; font-weight:600; color:var(--anthrazit); }
  .review-meta { font-size:.75rem; color:var(--text-muted); font-family:var(--font-mono); }

  /* MEISTER INFO */
  .meister-section { padding:96px 0; background:var(--bg-card); border-top:1px solid var(--border); }
  .meister-card { display:grid; grid-template-columns:280px 1fr; gap:48px; align-items:center; max-width:800px; margin:0 auto; }
  .meister-photo { border-radius:12px; overflow:hidden; aspect-ratio:3/4; background:${hexToRgba(c.colors.primary, 0.06)}; }
  .meister-photo img { width:100%; height:100%; object-fit:cover; }
  .meister-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-muted); }
  .meister-info h3 { font-family:var(--font-display); font-weight:800; font-size:1.6rem; color:var(--anthrazit); margin-bottom:6px; }
  .meister-title { display:block; font-family:var(--font-mono); font-size:.78rem; letter-spacing:1.5px; text-transform:uppercase; color:var(--orange); margin-bottom:4px; }
  .meister-since { display:block; font-size:.85rem; color:var(--text-muted); margin-bottom:16px; }
  .meister-quote { font-family:var(--font-display); font-size:1.05rem; font-style:italic; color:var(--text-soft); line-height:1.6; border-left:3px solid var(--orange); padding-left:16px; margin-bottom:20px; }
  .meister-certs { display:flex; gap:8px; flex-wrap:wrap; }
  .cert-badge { font-family:var(--font-mono); font-size:.68rem; font-weight:600; letter-spacing:1px; text-transform:uppercase; padding:5px 12px; border-radius:4px; background:${hexToRgba(c.colors.accent, 0.1)}; color:var(--orange-dark); }

  /* LOCATION / ANFAHRT */
  .location-section { padding:96px 0; background:var(--hell); border-top:1px solid var(--border); }
  .location-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:24px; max-width:800px; margin:0 auto; }
  .location-detail { display:flex; align-items:flex-start; gap:14px; padding:20px; background:var(--bg-card); border:1px solid var(--border); border-radius:8px; transition:all 0.25s; }
  .location-detail:hover { border-color:${hexToRgba(c.colors.accent, 0.3)}; }
  .loc-icon { width:40px; height:40px; display:flex; align-items:center; justify-content:center; color:var(--orange); flex-shrink:0; }
  .loc-icon svg { width:22px; height:22px; }
  .loc-label { font-family:var(--font-mono); font-size:.7rem; letter-spacing:1.5px; text-transform:uppercase; color:var(--text-muted); margin-bottom:4px; }
  .loc-value { font-size:.92rem; color:var(--anthrazit); font-weight:500; }

  /* HOURS / OEFFNUNGSZEITEN */
  .hours-section { padding:96px 0; background:var(--anthrazit); }
  .hours-card { max-width:560px; margin:0 auto; background:var(--bg-dark-card); border:1px solid ${hexToRgba(c.colors.bg, 0.08)}; border-radius:12px; padding:40px 36px; }
  .hours-card h3 { font-family:var(--font-display); font-weight:800; font-size:1.4rem; color:var(--hell); margin-bottom:28px; text-align:center; }
  .hours-card h3 em { font-style:normal; color:var(--orange); }
  .hours-item { display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid ${hexToRgba(c.colors.bg, 0.06)}; }
  .hours-item:last-child { border-bottom:none; }
  .hours-day { color:${hexToRgba(c.colors.bg, 0.7)}; font-size:.92rem; font-weight:500; }
  .hours-time { font-family:var(--font-mono); font-size:.85rem; color:var(--orange); font-weight:500; }

  /* ABOUT STATS */
  .about-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:24px; margin-top:40px; }
  .about-stat { text-align:center; padding:24px 16px; background:var(--bg-card); border:1px solid var(--border); border-radius:8px; }
  .stat-value { font-family:var(--font-display); font-size:2.2rem; font-weight:900; color:var(--orange); line-height:1; margin-bottom:6px; }
  .stat-label { font-family:var(--font-mono); font-size:.68rem; letter-spacing:1px; text-transform:uppercase; color:var(--text-muted); }

  /* CONTACT / CTA */
  .cta-section { padding:96px 0; background:var(--hell); border-top:1px solid var(--border); }
  .cta-grid { display:grid; grid-template-columns:1fr 1fr; gap:56px; align-items:flex-start; }
  .cta-text .eyebrow { font-family:var(--font-mono); font-size:.72rem; font-weight:500; letter-spacing:2.5px; text-transform:uppercase; color:var(--orange); }
  .cta-text .display { font-family:var(--font-display); font-size:clamp(1.8rem,3.5vw,2.4rem); font-weight:800; line-height:1.15; color:var(--anthrazit); margin-bottom:16px; }
  .cta-text .display em { font-style:normal; color:var(--orange); }
  .cta-text > p { color:var(--text-soft); font-size:1rem; line-height:1.7; margin-bottom:24px; }
  .cta-features { display:flex; flex-direction:column; gap:10px; }
  .cta-feature { display:flex; align-items:center; gap:10px; color:var(--text-soft); font-size:.9rem; }
  .cta-feature svg { color:var(--orange); flex-shrink:0; }

  /* Contact form */
  .contact-form { background:var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:36px 32px; }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
  .form-row.full { grid-template-columns:1fr; }
  .form-field label { display:block; font-size:.82rem; font-weight:600; color:var(--anthrazit); margin-bottom:6px; }
  .form-field input, .form-field textarea, .form-field select { width:100%; padding:12px 14px; border:1px solid var(--border); border-radius:6px; font-family:var(--font-body); font-size:.9rem; color:var(--anthrazit); background:var(--hell); transition:border-color 0.25s; outline:none; }
  .form-field input:focus, .form-field textarea:focus, .form-field select:focus { border-color:var(--orange); }
  .form-field textarea { min-height:120px; resize:vertical; }
  .form-field select { cursor:pointer; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23e87a2a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; padding-right:36px; }
  .form-submit { display:inline-flex; align-items:center; gap:8px; background:var(--orange); color:#fff; padding:14px 32px; border:none; border-radius:6px; font-family:var(--font-body); font-size:.95rem; font-weight:700; cursor:pointer; transition:all 0.25s; margin-top:8px; }
  .form-submit:hover { background:var(--orange-dark); transform:translateY(-1px); }
  .form-submit:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

  /* FAQ */
  .faq-section { padding:96px 0; background:var(--bg-card); border-top:1px solid var(--border); }
  .faq-grid { max-width:720px; margin:0 auto; }
  .faq-item { border-bottom:1px solid var(--border); }
  .faq-q { width:100%; display:flex; justify-content:space-between; align-items:center; padding:20px 0; background:none; border:none; color:var(--anthrazit); font-family:var(--font-body); font-size:1rem; font-weight:600; cursor:pointer; text-align:left; transition:color 0.25s; }
  .faq-q:hover { color:var(--orange); }
  .faq-icon { font-size:1.3rem; color:var(--orange); transition:transform 0.3s; flex-shrink:0; margin-left:16px; }
  .faq-a { max-height:0; overflow:hidden; transition:max-height 0.35s ease,padding 0.35s ease; color:var(--text-soft); font-size:.92rem; line-height:1.6; }
  .faq-item.open .faq-a { max-height:300px; padding-bottom:20px; }
  .faq-item.open .faq-icon { transform:rotate(45deg); }

  /* FOOTER */
  footer { padding:80px 0 24px; background:var(--anthrazit); }
  .footer-grid { display:grid; grid-template-columns:2fr 1fr 1fr; gap:48px; margin-bottom:48px; }
  .footer-brand .logo-text { font-family:var(--font-display); font-weight:700; font-size:1.2rem; color:var(--hell); margin-bottom:12px; }
  .footer-brand p { color:${hexToRgba(c.colors.bg, 0.5)}; font-size:.88rem; line-height:1.6; max-width:320px; }
  .footer-col h4 { font-family:var(--font-mono); font-size:.72rem; letter-spacing:2px; text-transform:uppercase; color:var(--orange); margin-bottom:16px; }
  .footer-col ul { list-style:none; }
  .footer-col li { margin-bottom:10px; }
  .footer-col a { color:${hexToRgba(c.colors.bg, 0.5)}; font-size:.88rem; transition:color 0.2s; }
  .footer-col a:hover { color:var(--orange); }
  .footer-bottom { display:flex; justify-content:space-between; align-items:center; padding-top:24px; border-top:1px solid ${hexToRgba(c.colors.bg, 0.08)}; flex-wrap:wrap; gap:12px; }
  .footer-bottom p { font-size:.78rem; color:${hexToRgba(c.colors.bg, 0.35)}; }
  .footer-legal { display:flex; gap:20px; }
  .footer-legal a { font-size:.78rem; color:${hexToRgba(c.colors.bg, 0.35)}; }
  .footer-legal a:hover { color:var(--orange); }

  /* MOBILE CTA (Sticky) */
  .mobile-cta { display:none; position:fixed; bottom:0; left:0; right:0; z-index:998; background:var(--orange); color:#fff; text-align:center; padding:16px 24px; font-family:var(--font-body); font-weight:700; font-size:.95rem; text-decoration:none; transition:background 0.25s; letter-spacing:0.02em; }
  .mobile-cta:hover { background:var(--orange-dark); }

  /* ========================================
     RESPONSIVE
     ======================================== */

  @media (max-width: 1024px) {
    .hero-grid {
      grid-template-columns: 1fr;
      gap: 40px;
    }

    .hero-visual {
      display: none;
    }

    .hero {
      min-height: auto;
      padding: 140px 0 80px;
    }

    .features-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .service-grid {
      grid-template-columns: 1fr;
    }

    .cta-grid {
      grid-template-columns: 1fr;
      gap: 40px;
    }

    .holservice-grid {
      grid-template-columns: 1fr;
      gap: 40px;
    }

    .marken-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .referenzen-grid {
      grid-template-columns: 1fr;
    }

    .meister-card {
      grid-template-columns: 1fr;
      gap: 32px;
      text-align: center;
    }

    .meister-photo {
      max-width: 280px;
      margin: 0 auto;
    }

    .meister-quote {
      text-align: left;
    }

    .meister-certs {
      justify-content: center;
    }

    .footer-grid {
      grid-template-columns: 1fr;
      gap: 32px;
    }

    .reviews-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .container { padding: 0 16px; }

    .nav-links { display: none; }
    .nav-cta { display: none; }
    .nav-burger { display: block; }

    .mobile-cta { display: block; }

    .hero h1 {
      font-size: clamp(2.2rem, 8vw, 3.2rem);
    }

    .hero-lead {
      font-size: 1rem;
    }

    .hero-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .btn-primary, .btn-secondary {
      justify-content: center;
      text-align: center;
    }

    .section-head .display {
      font-size: clamp(1.7rem, 6vw, 2.4rem);
    }

    .service-tabs {
      justify-content: flex-start;
      overflow-x: auto;
      padding-bottom: 8px;
      -webkit-overflow-scrolling: touch;
    }

    .service-tab {
      white-space: nowrap;
      flex-shrink: 0;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }

    .marken-grid {
      grid-template-columns: 1fr;
    }

    .tuev-inner {
      flex-direction: column;
      text-align: center;
    }

    .tuev-text {
      flex-direction: column;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .location-grid {
      grid-template-columns: 1fr;
    }

    .cta-text .display {
      font-size: clamp(1.5rem, 5vw, 2rem);
    }

    footer { padding-bottom: 80px; }
  }

  @media (max-width: 480px) {
    .hero { padding: 120px 0 60px; }
    .hero h1 { font-size: 2rem; }

    .features-section,
    .services-section,
    .marken-section,
    .holservice-section,
    .referenzen-section,
    .reviews-section,
    .meister-section,
    .location-section,
    .hours-section,
    .cta-section,
    .faq-section {
      padding: 64px 0;
    }

    .contact-form {
      padding: 24px 20px;
    }

    .about-stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .hours-card {
      padding: 28px 20px;
    }
  }

  /* ========================================
     ANIMATIONS
     ======================================== */

  @media (prefers-reduced-motion: no-preference) {
    .feature-card,
    .service-item,
    .marke-card,
    .referenz-card,
    .review-card,
    .hol-step,
    .location-detail,
    .about-stat {
      opacity: 0;
      transform: translateY(24px);
      animation: fadeInUp 0.6s ease forwards;
    }

    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .feature-card:nth-child(1) { animation-delay: 0.1s; }
    .feature-card:nth-child(2) { animation-delay: 0.2s; }
    .feature-card:nth-child(3) { animation-delay: 0.3s; }
    .feature-card:nth-child(4) { animation-delay: 0.4s; }

    .service-item:nth-child(1) { animation-delay: 0.05s; }
    .service-item:nth-child(2) { animation-delay: 0.1s; }
    .service-item:nth-child(3) { animation-delay: 0.15s; }
    .service-item:nth-child(4) { animation-delay: 0.2s; }
    .service-item:nth-child(5) { animation-delay: 0.25s; }
    .service-item:nth-child(6) { animation-delay: 0.3s; }

    .marke-card:nth-child(1) { animation-delay: 0.1s; }
    .marke-card:nth-child(2) { animation-delay: 0.2s; }
    .marke-card:nth-child(3) { animation-delay: 0.3s; }
    .marke-card:nth-child(4) { animation-delay: 0.4s; }

    .review-card:nth-child(1) { animation-delay: 0.1s; }
    .review-card:nth-child(2) { animation-delay: 0.2s; }
    .review-card:nth-child(3) { animation-delay: 0.3s; }

    .hol-step:nth-child(1) { animation-delay: 0.1s; }
    .hol-step:nth-child(2) { animation-delay: 0.2s; }
    .hol-step:nth-child(3) { animation-delay: 0.3s; }
    .hol-step:nth-child(4) { animation-delay: 0.4s; }
  }

  /* Print */
  @media print {
    nav, .mobile-cta, #cookie-banner, .tuev-banner { display: none !important; }
    body { background: #fff; color: #000; }
    .hero { min-height: auto; padding: 40px 0; }
  }
</style>
</head>
<body>

<!-- ====== NAVIGATION ====== -->
<nav id="main-nav">
  <div class="nav-inner">
    <a href="#" class="nav-logo">
      <div class="logo-mark">${logoInitial}</div>
      <span class="logo-text">${esc(c.businessName)}</span>
    </a>

    <ul class="nav-links">
      <li><a href="#services">Leistungen</a></li>
      <li><a href="#marken">Marken</a></li>
      <li><a href="#holservice">Holservice</a></li>
      <li><a href="#reviews">Bewertungen</a></li>
      <li><a href="#location">Anfahrt</a></li>
      <li><a href="#contact">Kontakt</a></li>
    </ul>

    <a href="#contact" class="nav-cta">${esc(c.ctaText)}</a>

    <button class="nav-burger" aria-label="Men&uuml; &ouml;ffnen" id="nav-burger">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12h18M3 6h18M3 18h18"/>
      </svg>
    </button>
  </div>
</nav>

<!-- Mobile Overlay -->
<div class="nav-mobile-overlay" id="nav-mobile">
  <button class="nav-mobile-close" id="nav-close" aria-label="Men&uuml; schlie&szlig;en">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  </button>
  <a href="#services" class="nav-mobile-link">Leistungen</a>
  <a href="#marken" class="nav-mobile-link">Marken</a>
  <a href="#holservice" class="nav-mobile-link">Holservice</a>
  <a href="#reviews" class="nav-mobile-link">Bewertungen</a>
  <a href="#hours" class="nav-mobile-link">&Ouml;ffnungszeiten</a>
  <a href="#location" class="nav-mobile-link">Anfahrt</a>
  <a href="#contact" class="nav-mobile-link">Kontakt</a>
</div>

<!-- ====== HERO ====== -->
<section class="hero">
  <div class="container hero-grid">
    <div class="hero-content">
      <div class="hero-tag">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
        ${esc(c.heroTag)}
      </div>

      <h1>${c.heroHeadline} <em>${c.heroAccent}</em></h1>

      <p class="hero-lead">${esc(c.heroLead)}</p>

      <div class="hero-actions">
        <a href="#contact" class="btn-primary">
          ${esc(c.ctaText)}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
        <a href="#services" class="btn-secondary">
          Leistungen &amp; Festpreise
        </a>
      </div>

      ${aboutStatsHtml}
    </div>

    <div class="hero-visual">
      <div class="hero-image-wrapper">
        ${c.heroImageUrl
          ? `<img src="${esc(c.heroImageUrl)}" alt="${esc(c.businessName)}" loading="eager">`
          : `<div class="hero-bg">
              <svg viewBox="0 0 24 24" fill="none" stroke="${hexToRgba(c.colors.primary, 0.15)}" stroke-width="1" width="120" height="120">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>`}
      </div>
      <div class="hero-badge">
        <span class="big">KFZ</span>
        <span class="small">Meisterbetrieb</span>
      </div>
    </div>
  </div>
</section>

<!-- ====== T&Uuml;V / HU BANNER ====== -->
<div class="tuev-banner">
  <div class="container">
    <div class="tuev-inner">
      <div class="tuev-text">
        <div class="tuev-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        </div>
        <div>
          <h3>${tuev.headline} <em>Direkt bei uns.</em></h3>
          <p>${esc(tuev.subline)}</p>
        </div>
      </div>
      <a href="${esc(tuev.ctaHref)}" class="tuev-cta">
        ${esc(tuev.ctaText)}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
    </div>
  </div>
</div>

${c.announceText ? `
<!-- ====== ANNOUNCE BAR ====== -->
<div style="background:var(--orange);text-align:center;padding:14px 24px;font-size:.88rem;color:#fff">
  <span style="font-family:var(--font-mono);font-size:.72rem;letter-spacing:2px;text-transform:uppercase;opacity:0.7;margin-right:12px">INFO</span>
  ${esc(c.announceText)}
</div>` : ''}

<!-- ====== FEATURES ====== -->
<section class="features-section">
  <div class="container">
    <div class="features-grid">
      ${featuresHtml}
    </div>
  </div>
</section>

<!-- ====== SERVICES MIT FESTPREISEN ====== -->
<section id="services" class="services-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.servicesSectionTitle || 'Leistungen &amp; Festpreise')}</span>
      <h2 class="display">${c.servicesSectionSubtitle || 'Transparente <em>Festpreise</em>.'}</h2>
      <p>Von der Inspektion &uuml;ber &Ouml;lwechsel bis zur HU/AU &mdash; alle Arbeiten zu festen, kalkulierbaren Preisen. Keine &Uuml;berraschungen.</p>
    </div>

    <div class="service-tabs">
      ${serviceTabs}
    </div>

    ${serviceItemsHtml}
  </div>
</section>

<!-- ====== MARKEN-SPEZIALISIERUNG ====== -->
<section id="marken" class="marken-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(marken.title)}</span>
      <h2 class="display">${marken.subtitle}</h2>
      <p>Vom OBD-Auslesen &uuml;ber Steuerkette bis zur Achsvermessung &mdash; markenspezifisches Know-how f&uuml;r Ihr Fahrzeug.</p>
    </div>

    <div class="marken-grid">
      ${markenHtml}
    </div>
  </div>
</section>

<!-- ====== HOLSERVICE ====== -->
<section id="holservice" class="holservice-section dark-section">
  <div class="container">
    <div class="holservice-grid">
      <div class="holservice-text">
        <span class="eyebrow" style="display:block;font-family:var(--font-mono);font-size:.72rem;font-weight:500;letter-spacing:2.5px;text-transform:uppercase;color:var(--orange);margin-bottom:12px">Service</span>
        <h2>${holservice.title.replace('&amp;', '&amp;').includes('<em>') ? holservice.title : `Hol- &amp; <em>Bringservice</em>`}</h2>
        <p>${esc(holservice.description)}</p>
        ${holservice.note ? `<div class="holservice-note">${esc(holservice.note)}</div>` : ''}
      </div>

      <div class="hol-steps">
        ${holserviceHtml}
      </div>
    </div>
  </div>
</section>

${meisterHtml}

${referenzen.length > 0 ? `
<!-- ====== REFERENZEN ====== -->
<section class="referenzen-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Referenzen</span>
      <h2 class="display">Was unsere <em>Kunden</em> berichten.</h2>
    </div>

    <div class="referenzen-grid">
      ${referenzenHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== REVIEWS ====== -->
<section id="reviews" class="reviews-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.reviewsSectionTitle || 'Bewertungen')}</span>
      <h2 class="display">Vertrauen durch <em>Erfahrung</em>.</h2>
    </div>

    <div class="reviews-grid">
      ${reviewsHtml}
    </div>
  </div>
</section>

<!-- ====== STANDORT + ANFAHRT ====== -->
${locationDetails.length > 0 ? `
<section id="location" class="location-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">${esc(c.locationTitle || 'Standort &amp; Anfahrt')}</span>
      <h2 class="display">${c.locationSubtitle || 'So finden Sie <em>uns</em>.'}</h2>
    </div>

    <div class="location-grid">
      ${locationDetailsHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== OEFFNUNGSZEITEN ====== -->
<section id="hours" class="hours-section dark-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">&Ouml;ffnungszeiten</span>
      <h2 class="display" style="color:var(--hell)">&Ouml;ffnungs<em>zeiten</em>.</h2>
    </div>

    <div class="hours-card">
      <h3>Wann wir f&uuml;r Sie <em>da sind</em></h3>
      ${hoursHtml}
    </div>
  </div>
</section>

${(c.faqItems || []).length > 0 ? `<!-- ====== FAQ ====== -->
<section class="faq-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">H&auml;ufige Fragen</span>
      <h2 class="display">Fragen &amp; <em>Antworten</em>.</h2>
      <p>Die wichtigsten Fragen rund um Inspektion, HU/AU, Reparatur und Werkstattbesuch.</p>
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
      <span class="eyebrow" style="display:block; margin-bottom:16px;">${esc(c.ctaSectionTitle || 'Kontakt')}</span>
      <h2 class="display">${c.ctaSectionSubtitle || 'Termin <em>vereinbaren</em>.'}</h2>
      <p>Ob Inspektion, Reparatur oder HU/AU &mdash; schreiben Sie uns oder rufen Sie direkt an. Wir melden uns schnellstm&ouml;glich.</p>

      <div class="cta-features">
        ${ctaFeaturesHtml}
      </div>
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
            <option>Inspektion / Wartung</option>
            <option>HU/AU (T&Uuml;V)</option>
            <option>&Ouml;lwechsel</option>
            <option>Bremsen</option>
            <option>Reifen / R&auml;derwechsel</option>
            <option>Klimaanlage</option>
            <option>OBD-Diagnose</option>
            <option>Steuerkette</option>
            <option>Achsvermessung</option>
            <option>Holservice</option>
            <option>Allgemeine Anfrage</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label>Fahrzeug (optional)</label>
          <input type="text" name="fahrzeug" placeholder="z.B. BMW 320d, Bj. 2019">
        </div>
        <div class="form-field">
          <label>Kilometerstand (optional)</label>
          <input type="text" name="km" placeholder="z.B. 85.000 km">
        </div>
      </div>

      <div class="form-row full">
        <div class="form-field">
          <label>Nachricht*</label>
          <textarea name="message" required placeholder="Beschreiben Sie Ihr Anliegen ..."></textarea>
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

<!-- ====== FOOTER ====== -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="logo-text">${esc(c.businessName)}</div>
        <p>${esc(c.footerText || c.tagline)}</p>
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

<!-- Sticky Mobile CTA -->
<a href="#contact" class="mobile-cta">${esc(c.ctaText)} &rarr;</a>

<script>
  /* Navigation scroll behavior */
  var nav = document.getElementById('main-nav');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  /* Mobile menu */
  var burger = document.getElementById('nav-burger');
  var mobileNav = document.getElementById('nav-mobile');
  var closeBtn = document.getElementById('nav-close');

  burger.addEventListener('click', function() {
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  closeBtn.addEventListener('click', function() {
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  });

  document.querySelectorAll('.nav-mobile-link').forEach(function(link) {
    link.addEventListener('click', function() {
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* Service tabs */
  document.querySelectorAll('.service-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      var cat = tab.getAttribute('data-cat');
      document.querySelectorAll('.service-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      document.querySelectorAll('.service-category').forEach(function(c) { c.style.display = 'none'; });
      var target = document.querySelector('[data-cat-content="' + cat + '"]');
      if (target) target.style.display = 'block';
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
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:var(--anthrazit);font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:' + '${textSoft}' + ';font-size:1.05rem">Wir melden uns in K\\u00fcrze bei Ihnen.</p></div>';
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
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba(c.colors.bg, 0.97)};backdrop-filter:blur(12px);color:var(--anthrazit);padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:var(--text-soft)">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--anthrazit);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--orange);color:#fff;border:none;padding:8px 20px;border-radius:6px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
