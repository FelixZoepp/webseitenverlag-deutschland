// Immobilien Premium Template — Bauer & Walther Immobilien Düsseldorf
// Bordeaux + Cream + Gold, exklusiv, diskret, luxuriös
// Schema.org RealEstateAgent, Fraunces + Inter Tight + JetBrains Mono

export interface ImmobilienPremiumConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Bordeaux #4a1a2a
    accent: string     // Gold #c8a040
    background: string // Cream #faf5ee
    text: string       // Dark text
  }
  phone?: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  region?: string
  openingHours: { days: string; hours: string }[]
  // Objekte / Listings
  listings: {
    title: string
    type: string        // ETW, EFH, Penthouse, Villa, Mehrfamilienhaus, Gewerbefläche
    district: string    // Stadtteil z.B. Oberkassel, Kaiserswerth
    price: string       // z.B. "1.250.000 €" oder "auf Anfrage"
    size: string        // z.B. "185 m²"
    rooms: string       // z.B. "4,5"
    features?: string[] // z.B. ["Balkon", "Garage", "Energieausweis A+"]
    imageUrl?: string
    tag?: string        // "Exklusiv", "Neu", "Provisionsfrei"
    energyClass?: string
  }[]
  // Leistungen
  services: {
    icon?: string
    title: string
    description: string
    features?: string[]
  }[]
  // Marktwert-Hinweis
  valuationTitle?: string
  valuationSubtitle?: string
  valuationText?: string
  valuationFeatures?: string[]
  // Team
  teamMembers: {
    name: string
    role: string
    qualifications?: string[]
    specialties?: string[]
    imageUrl?: string
    phone?: string
    email?: string
  }[]
  // Bewertungen
  reviews: { text: string; name: string; source: string; rating: number; detail?: string }[]
  // Standort + Bürozeiten
  locationTitle?: string
  locationSubtitle?: string
  locationDetails?: { icon: string; label: string; value: string }[]
  // FAQ
  faqItems?: { question: string; answer: string }[]
  // About / USP
  aboutTitle?: string
  aboutText?: string
  aboutText2?: string
  aboutStats?: { value: string; label: string }[]
  certifications?: string[]   // z.B. "IVD-Mitglied", "TÜV-zertifiziert"
  // CTA section
  ctaSectionTitle?: string
  ctaSectionSubtitle?: string
  ctaFeatures?: string[]
  contactEnabled?: boolean
  contactFormTitle?: string
  contactFormSubtitle?: string
  // Footer
  footerText?: string
  footerColumns?: { title: string; links: { label: string; href: string }[] }[]
  imprintUrl?: string
  privacyUrl?: string
  // Images
  heroImageUrl?: string
  ogImageUrl?: string
  // Mobile CTA
  mobileCta?: { text: string; href: string }
  // Search CTA
  searchDistricts?: string[]
  searchTypes?: string[]
  // Social
  instagramUrl?: string
  linkedinUrl?: string
  facebookUrl?: string
}

// ─── Helpers ───────────────────────────────────────────────

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
  return Array(Math.min(Math.max(Math.round(count), 0), 5)).fill(star).join('\n            ')
}

// ─── Render ────────────────────────────────────────────────

export function renderImmobilienPremiumTemplate(config: ImmobilienPremiumConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primaryDark = darkenHex(c.colors.primary, 0.25)
  const primarySoft = hexToRgba(c.colors.primary, 0.10)
  const accentDark = darkenHex(c.colors.accent, 0.25)
  const accentLight = tintHex(c.colors.accent, 0.75)
  const bgTint = tintHex(c.colors.background, -0.03)
  const bgWarm = tintHex(c.colors.background, -0.06)
  const textSoft = tintHex(c.colors.text, 0.45)
  const borderColor = tintHex(c.colors.background, -0.10)
  const primaryLight = tintHex(c.colors.primary, 0.85)

  const logoInitial = esc(c.businessName.charAt(0))

  // ─── Listing cards ─────────────────────────────────────
  const listingsHtml = c.listings.map((l, idx) => {
    const gradients = [
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 100%)`,
      `linear-gradient(135deg, ${darkenHex(c.colors.primary, 0.1)} 0%, ${darkenHex(c.colors.primary, 0.35)} 100%)`,
      `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.15)} 0%, ${c.colors.primary} 100%)`,
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${darkenHex(c.colors.accent, 0.4)} 100%)`,
      `linear-gradient(135deg, ${darkenHex(c.colors.primary, 0.05)} 0%, ${primaryDark} 100%)`,
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${darkenHex(c.colors.primary, 0.2)} 100%)`,
    ]
    const imgStyle = l.imageUrl
      ? `background-image:url('${esc(l.imageUrl)}');background-size:cover;background-position:center`
      : `background:${gradients[idx % gradients.length]}`
    const tagHtml = l.tag ? `<span class="listing-tag">${esc(l.tag)}</span>` : ''
    const energyHtml = l.energyClass ? `<span class="listing-energy">Energieausweis ${esc(l.energyClass)}</span>` : ''
    const featuresHtml = (l.features || []).map(f => `<span class="listing-feat">${esc(f)}</span>`).join('')
    return `
          <div class="listing-card">
            <div class="listing-img" style="${imgStyle}">
              ${tagHtml}
              ${!l.imageUrl ? `<span class="listing-placeholder">IMG: ${esc(l.title)}</span>` : ''}
            </div>
            <div class="listing-body">
              <div class="listing-meta">
                <span class="listing-type">${esc(l.type)}</span>
                <span class="listing-district">${esc(l.district)}</span>
              </div>
              <h3 class="listing-title">${esc(l.title)}</h3>
              <div class="listing-specs">
                <div class="spec"><span class="spec-val">${esc(l.price)}</span><span class="spec-label">Kaufpreis</span></div>
                <div class="spec"><span class="spec-val">${esc(l.size)}</span><span class="spec-label">Wohnfl&auml;che</span></div>
                <div class="spec"><span class="spec-val">${esc(l.rooms)}</span><span class="spec-label">Zimmer</span></div>
              </div>
              ${featuresHtml || energyHtml ? `<div class="listing-features">${featuresHtml}${energyHtml}</div>` : ''}
              <a href="#contact" class="listing-cta">Expos&eacute; anfordern <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
            </div>
          </div>`
  }).join('\n')

  // ─── Services ─────────────────────────────────────────
  const servicesHtml = c.services.map(s => {
    const iconSvg = s.icon === 'verkauf'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
      : s.icon === 'vermietung'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3l-4 4-4-4"/><path d="M12 7v6"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></svg>'
      : s.icon === 'marktwert'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/><path d="M2 20h20"/></svg>'
      : s.icon === 'investment'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M16 8l-8 8"/><path d="M16 8h-5"/><path d="M16 8v5"/></svg>'
      : s.icon === 'grundbuch'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
      : s.icon === 'notar'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>'
    const featListHtml = (s.features || []).map(f =>
      `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M5 13l4 4L19 7"/></svg>${esc(f)}</li>`
    ).join('\n              ')
    return `
          <div class="service-card">
            <div class="service-icon">${iconSvg}</div>
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.description)}</p>
            ${featListHtml ? `<ul class="service-features">${featListHtml}</ul>` : ''}
          </div>`
  }).join('\n')

  // ─── Team ─────────────────────────────────────────────
  const teamHtml = c.teamMembers.map((m, idx) => {
    const initials = m.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    const gradients = [
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 100%)`,
      `linear-gradient(135deg, ${c.colors.accent} 0%, ${accentDark} 100%)`,
      `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.25)} 0%, ${c.colors.primary} 100%)`,
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${c.colors.accent} 100%)`,
    ]
    const portraitStyle = m.imageUrl
      ? `background-image:url('${esc(m.imageUrl)}');background-size:cover;background-position:center`
      : `background:${gradients[idx % gradients.length]}`
    const qualsHtml = (m.qualifications || []).map(q => `<span class="team-qual">${esc(q)}</span>`).join('')
    const specsHtml = (m.specialties || []).map(s => `<span class="team-spec">${esc(s)}</span>`).join('')
    return `
          <div class="team-card">
            <div class="team-portrait" style="${portraitStyle}">
              ${!m.imageUrl ? `<span class="team-initials">${esc(initials)}</span>` : ''}
            </div>
            <div class="team-info">
              <h4>${esc(m.name)}</h4>
              <span class="team-role">${esc(m.role)}</span>
              ${qualsHtml ? `<div class="team-quals">${qualsHtml}</div>` : ''}
              ${specsHtml ? `<div class="team-specs">${specsHtml}</div>` : ''}
              ${m.phone ? `<a href="tel:${esc(m.phone)}" class="team-contact">${esc(m.phone)}</a>` : ''}
              ${m.email ? `<a href="mailto:${esc(m.email)}" class="team-contact">${esc(m.email)}</a>` : ''}
            </div>
          </div>`
  }).join('\n')

  // ─── Reviews ──────────────────────────────────────────
  const reviewsHtml = c.reviews.map(r => `
          <div class="review-card">
            <div class="review-stars">${generateStarsSvg(r.rating)}</div>
            <blockquote>${esc(r.text)}</blockquote>
            <div class="review-author">
              <strong>${esc(r.name)}</strong>
              ${r.detail ? `<span class="review-detail">${esc(r.detail)}</span>` : ''}
              <span class="review-source">${esc(r.source)}</span>
            </div>
          </div>`).join('\n')

  // ─── FAQ ──────────────────────────────────────────────
  const faqItems = c.faqItems || []
  const faqHtml = faqItems.map((f, i) => `
          <div class="faq-item">
            <button class="faq-q" aria-expanded="false" aria-controls="faq-a-${i}">
              <span>${esc(f.question)}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <div class="faq-a" id="faq-a-${i}">
              <p>${esc(f.answer)}</p>
            </div>
          </div>`).join('\n')

  // ─── About stats ──────────────────────────────────────
  const aboutStats = c.aboutStats || []
  const aboutStatsHtml = aboutStats.length > 0 ? `
        <div class="about-stats">
          ${aboutStats.map(s => `
          <div class="about-stat">
            <div class="num">${esc(s.value)}</div>
            <div class="label">${esc(s.label)}</div>
          </div>`).join('')}
        </div>` : ''

  // ─── Certifications ───────────────────────────────────
  const certs = c.certifications || []
  const certsHtml = certs.length > 0 ? `
        <div class="cert-badges">
          ${certs.map(cert => `<span class="cert-badge">${esc(cert)}</span>`).join('\n          ')}
        </div>` : ''

  // ─── Valuation features ───────────────────────────────
  const valFeatures = c.valuationFeatures || [
    'Kostenlose Ersteinsch\u00e4tzung',
    'Fundiertes Marktwertgutachten',
    'Aktuellste Marktdaten D\u00fcsseldorf',
    'Pers\u00f6nliche Beratung vor Ort',
  ]
  const valFeaturesHtml = valFeatures.map(f => `
            <div class="val-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 13l4 4L19 7"/></svg>
              ${esc(f)}
            </div>`).join('')

  // ─── CTA features ─────────────────────────────────────
  const ctaFeatures = c.ctaFeatures || []
  const ctaFeaturesHtml = ctaFeatures.map(f => `
            <div class="cta-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 13l4 4L19 7"/></svg>
              ${esc(f)}
            </div>`).join('')

  // ─── Location details ─────────────────────────────────
  const locationDetails = c.locationDetails || []
  const locationDetailsHtml = locationDetails.map(d => `
            <div class="location-detail">
              <div class="icon">
                ${d.icon === 'pin' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
                : d.icon === 'phone' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
                : d.icon === 'mail' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>'
                : d.icon === 'parking' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>'
                : d.icon === 'transit' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>'
                : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M3 12h18M3 18h18"/></svg>'}
              </div>
              <div>
                <div class="label">${esc(d.label)}</div>
                <div class="value">${d.value}</div>
              </div>
            </div>`).join('')

  // ─── Hours ────────────────────────────────────────────
  const hoursHtml = c.openingHours.map(h => `
            <div class="hours-row">
              <span class="hours-day">${esc(h.days)}</span>
              <span class="hours-time">${esc(h.hours)}</span>
            </div>`).join('')

  // ─── Footer columns ───────────────────────────────────
  const footerColumns = c.footerColumns || [
    { title: 'Immobilien', links: [
      { label: 'Aktuelle Objekte', href: '#objekte' },
      { label: 'Leistungen', href: '#leistungen' },
      { label: 'Marktwertgutachten', href: '#marktwert' },
    ]},
    { title: 'Kontakt', links: [
      { label: 'Team', href: '#team' },
      { label: 'Standort', href: '#standort' },
      { label: 'Anfrage', href: '#contact' },
    ]},
  ]
  const footerColumnsHtml = footerColumns.map(col => `
        <div class="footer-col">
          <h4>${esc(col.title)}</h4>
          <ul>
            ${col.links.map(l => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('\n            ')}
          </ul>
        </div>`).join('')

  // ─── Search types / districts ─────────────────────────
  const searchTypes = c.searchTypes || ['Alle', 'ETW', 'EFH', 'Villa', 'Penthouse', 'Gewerbe']
  const searchDistricts = c.searchDistricts || ['Alle Stadtteile', 'Oberkassel', 'Kaiserswerth', 'Golzheim', 'Pempelfort', 'Carlstadt']

  const searchTypesHtml = searchTypes.map(t =>
    `<option value="${esc(t)}">${esc(t)}</option>`
  ).join('\n              ')
  const searchDistrictsHtml = searchDistricts.map(d =>
    `<option value="${esc(d)}">${esc(d)}</option>`
  ).join('\n              ')

  // ─── Hero visual ──────────────────────────────────────
  const heroVisualStyle = c.heroImageUrl
    ? `background: url('${esc(c.heroImageUrl)}') center/cover no-repeat;`
    : `background: linear-gradient(180deg, transparent 50%, ${hexToRgba(c.colors.text, 0.5)}), linear-gradient(135deg, ${tintHex(c.colors.primary, 0.3)} 0%, ${c.colors.primary} 50%, ${primaryDark} 100%);`

  // ─── Average rating ───────────────────────────────────
  const avgRating = c.reviews.length > 0
    ? (c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length).toFixed(1)
    : '5.0'

  // ────────────────────────────────────────────────────────
  // HTML OUTPUT
  // ────────────────────────────────────────────────────────

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(c.businessName)} | ${esc(c.tagline)}</title>
<meta name="description" content="${esc(c.tagline)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${appUrl}${siteId ? `/s/${siteId}` : ''}">
<meta property="og:title" content="${esc(c.businessName)} | ${esc(c.tagline)}">
<meta property="og:description" content="${esc(c.heroLead)}">
<meta property="og:type" content="website">
${c.ogImageUrl ? `<meta property="og:image" content="${esc(c.ogImageUrl)}">` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,400..900,30..100&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">

<!-- Schema.org RealEstateAgent -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "${esc(c.businessName)}",
  "description": "${esc(c.tagline)}",
  ${c.address ? `"address": {
    "@type": "PostalAddress",
    "streetAddress": "${esc(c.address)}"${c.city ? `,
    "addressLocality": "${esc(c.city)}"` : ''}${c.postalCode ? `,
    "postalCode": "${esc(c.postalCode)}"` : '},'}
    "addressCountry": "DE"
  },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  "priceRange": "$$$$",
  "currenciesAccepted": "EUR",
  ${c.reviews.length > 0 ? `"aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "${avgRating}",
    "reviewCount": "${c.reviews.length}"
  },` : ''}
  "openingHoursSpecification": [${c.openingHours.map(h => `{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": "${esc(h.days)}",
    "opens": "${esc(h.hours.split(' ')[0] || '')}",
    "closes": "${esc(h.hours.split(' ').pop() || '')}"
  }`).join(',')}],
  "areaServed": "${esc(c.region || c.city || 'D\u00fcsseldorf')}",
  "url": "${appUrl}${siteId ? `/s/${siteId}` : ''}"
}
</script>

<style>
  /* ========================================
     DESIGN TOKENS
     ======================================== */
  :root {
    --bordeaux:       ${esc(c.colors.primary)};
    --bordeaux-dark:  ${primaryDark};
    --bordeaux-soft:  ${primarySoft};
    --bordeaux-light: ${primaryLight};
    --gold:           ${esc(c.colors.accent)};
    --gold-dark:      ${accentDark};
    --gold-light:     ${accentLight};
    --cream:          ${esc(c.colors.background)};
    --cream-tint:     ${bgTint};
    --cream-warm:     ${bgWarm};
    --ink:            ${esc(c.colors.text)};
    --ink-soft:       ${textSoft};
    --border:         ${borderColor};

    --shadow-card: 0 12px 32px ${hexToRgba(c.colors.text, 0.07)};
    --shadow-image: 0 20px 60px ${hexToRgba(c.colors.text, 0.15)};
    --shadow-glow: 0 0 40px ${hexToRgba(c.colors.accent, 0.18)};
    --shadow-luxury: 0 24px 64px ${hexToRgba(c.colors.primary, 0.12)};

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
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; display: block; }

  .display {
    font-family: var(--font-display);
    font-weight: 500;
    letter-spacing: -0.025em;
    line-height: 1.15;
  }
  .display em { font-style: italic; color: var(--gold); }
  .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
  .eyebrow {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
  }
  .section-header {
    text-align: center;
    margin-bottom: 56px;
  }
  .section-header .display { font-size: clamp(1.8rem, 4vw, 2.6rem); margin-top: 12px; }
  .section-header p { max-width: 600px; margin: 16px auto 0; color: var(--ink-soft); font-size: 1.05rem; }

  /* ========================================
     NAVIGATION
     ======================================== */
  nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 1000;
    background: ${hexToRgba(c.colors.background, 0.92)};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    transition: box-shadow .3s ease;
  }
  .nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 72px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }
  .nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.1rem;
    color: var(--bordeaux);
    letter-spacing: -0.01em;
  }
  .nav-logo {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--bordeaux) 0%, var(--bordeaux-dark) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gold);
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.2rem;
  }
  .nav-links {
    display: flex;
    align-items: center;
    gap: 32px;
    list-style: none;
  }
  .nav-links a {
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--ink-soft);
    transition: color .2s ease;
    letter-spacing: 0.01em;
  }
  .nav-links a:hover { color: var(--bordeaux); }
  .nav-cta-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--bordeaux);
    color: var(--gold-light) !important;
    padding: 8px 20px;
    border-radius: 50px;
    font-size: 0.84rem;
    font-weight: 600;
    transition: background .2s ease, transform .2s var(--spring);
  }
  .nav-cta-link:hover { background: var(--bordeaux-dark); transform: translateY(-1px); }
  .nav-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    color: var(--bordeaux);
  }
  .nav-toggle svg { width: 24px; height: 24px; }

  @media (max-width: 768px) {
    .nav-toggle { display: block; }
    .nav-links {
      display: none;
      position: absolute;
      top: 72px;
      left: 0; right: 0;
      background: var(--cream);
      flex-direction: column;
      padding: 24px;
      gap: 20px;
      border-bottom: 1px solid var(--border);
      box-shadow: var(--shadow-card);
    }
    .nav-links.open { display: flex; }
  }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    padding: 140px 0 100px;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: 0; right: -10%;
    width: 55%;
    height: 100%;
    ${heroVisualStyle}
    border-radius: 0 0 0 80px;
    opacity: 0.12;
    pointer-events: none;
  }
  .hero-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  .hero-content { position: relative; z-index: 2; }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--bordeaux-soft);
    color: var(--bordeaux);
    padding: 6px 16px;
    border-radius: 50px;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 24px;
  }
  .hero-tag::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--gold);
  }
  .hero h1 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: clamp(2.4rem, 5vw, 3.6rem);
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin-bottom: 8px;
    color: var(--bordeaux);
  }
  .hero h1 em { font-style: italic; color: var(--gold); }
  .hero-lead {
    font-size: 1.12rem;
    color: var(--ink-soft);
    line-height: 1.7;
    margin: 20px 0 32px;
    max-width: 500px;
  }
  .hero-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--bordeaux);
    color: var(--gold-light);
    padding: 14px 32px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 0.95rem;
    transition: background .2s ease, transform .2s var(--spring), box-shadow .2s ease;
    border: none;
    cursor: pointer;
    font-family: var(--font-body);
  }
  .btn-primary:hover { background: var(--bordeaux-dark); transform: translateY(-2px); box-shadow: var(--shadow-luxury); }
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: var(--bordeaux);
    padding: 14px 28px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 0.95rem;
    border: 1.5px solid var(--border);
    transition: border-color .2s ease, background .2s ease;
    cursor: pointer;
    font-family: var(--font-body);
  }
  .btn-secondary:hover { border-color: var(--bordeaux); background: var(--bordeaux-soft); }

  /* Hero visual / search */
  .hero-visual {
    position: relative;
    z-index: 2;
  }
  .hero-search-card {
    background: white;
    border-radius: 20px;
    padding: 32px;
    box-shadow: var(--shadow-luxury);
    border: 1px solid var(--border);
  }
  .hero-search-card h3 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 1.25rem;
    margin-bottom: 20px;
    color: var(--bordeaux);
  }
  .search-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }
  .search-field label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--ink-soft);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-family: var(--font-mono);
  }
  .search-field select,
  .search-field input {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    font-family: var(--font-body);
    font-size: 0.92rem;
    background: var(--cream);
    color: var(--ink);
    outline: none;
    transition: border-color .2s ease;
    -webkit-appearance: none;
    appearance: none;
  }
  .search-field select:focus,
  .search-field input:focus { border-color: var(--gold); }
  .search-field select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 32px;
  }
  .search-submit {
    width: 100%;
    margin-top: 4px;
    padding: 13px;
    background: var(--bordeaux);
    color: var(--gold-light);
    border: none;
    border-radius: 12px;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: background .2s ease;
  }
  .search-submit:hover { background: var(--bordeaux-dark); }
  .hero-trust {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 16px;
    font-size: 0.78rem;
    color: var(--ink-soft);
    font-family: var(--font-mono);
    letter-spacing: 0.03em;
  }
  .hero-trust-divider { width: 1px; height: 24px; background: var(--border); }

  @media (max-width: 960px) {
    .hero-inner { grid-template-columns: 1fr; gap: 40px; }
    .hero::before { display: none; }
  }

  /* ========================================
     ANNOUNCE BAR
     ======================================== */
  .announce-bar {
    background: var(--bordeaux);
    color: var(--gold-light);
    text-align: center;
    padding: 10px 24px;
    font-size: 0.82rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 1001;
  }
  .announce-bar + nav { top: 36px; }
  .announce-bar ~ .hero { padding-top: 176px; }

  /* ========================================
     LISTINGS / OBJEKTE
     ======================================== */
  .listings-section {
    padding: 100px 0;
    background: var(--cream-tint);
  }
  .listings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 28px;
  }
  .listing-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--border);
    transition: transform .3s var(--smooth), box-shadow .3s ease;
  }
  .listing-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-luxury);
  }
  .listing-img {
    height: 220px;
    position: relative;
    overflow: hidden;
  }
  .listing-tag {
    position: absolute;
    top: 16px;
    left: 16px;
    background: var(--gold);
    color: var(--bordeaux-dark);
    padding: 4px 14px;
    border-radius: 50px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-family: var(--font-mono);
  }
  .listing-placeholder {
    position: absolute;
    bottom: 16px;
    left: 16px;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.06em;
  }
  .listing-body {
    padding: 24px;
  }
  .listing-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .listing-type {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--gold-dark);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .listing-district {
    font-size: 0.78rem;
    color: var(--ink-soft);
  }
  .listing-district::before {
    content: '\\2022';
    margin-right: 10px;
    color: var(--border);
  }
  .listing-title {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 1.15rem;
    color: var(--bordeaux);
    margin-bottom: 16px;
    letter-spacing: -0.01em;
  }
  .listing-specs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 16px 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    margin-bottom: 14px;
  }
  .spec { text-align: center; }
  .spec-val {
    display: block;
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--ink);
    margin-bottom: 2px;
  }
  .spec-label {
    font-size: 0.68rem;
    color: var(--ink-soft);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-family: var(--font-mono);
  }
  .listing-features {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
  }
  .listing-feat,
  .listing-energy {
    font-size: 0.72rem;
    padding: 3px 10px;
    border-radius: 50px;
    background: var(--cream-tint);
    color: var(--ink-soft);
    font-weight: 500;
    border: 1px solid var(--border);
  }
  .listing-energy {
    background: ${hexToRgba(c.colors.accent, 0.1)};
    color: var(--gold-dark);
    border-color: ${hexToRgba(c.colors.accent, 0.2)};
  }
  .listing-cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--bordeaux);
    transition: color .2s ease, gap .2s ease;
  }
  .listing-cta:hover { color: var(--gold-dark); gap: 10px; }

  @media (max-width: 600px) {
    .listings-grid { grid-template-columns: 1fr; }
  }

  /* ========================================
     SERVICES / LEISTUNGEN
     ======================================== */
  .services-section {
    padding: 100px 0;
  }
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 24px;
  }
  .service-card {
    background: white;
    border-radius: 16px;
    padding: 32px;
    border: 1px solid var(--border);
    transition: transform .3s var(--smooth), box-shadow .3s ease, border-color .3s ease;
  }
  .service-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
    border-color: ${hexToRgba(c.colors.accent, 0.3)};
  }
  .service-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--bordeaux-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }
  .service-icon svg {
    width: 24px;
    height: 24px;
    stroke: var(--bordeaux);
  }
  .service-card h3 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 1.12rem;
    color: var(--bordeaux);
    margin-bottom: 10px;
    letter-spacing: -0.01em;
  }
  .service-card p {
    font-size: 0.92rem;
    color: var(--ink-soft);
    line-height: 1.65;
    margin-bottom: 12px;
  }
  .service-features {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .service-features li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.82rem;
    color: var(--ink-soft);
    padding: 4px 0;
  }
  .service-features li svg { flex-shrink: 0; stroke: var(--gold); }

  /* ========================================
     MARKTWERT / VALUATION
     ======================================== */
  .valuation-section {
    padding: 100px 0;
    background: var(--bordeaux);
    color: var(--cream);
    position: relative;
    overflow: hidden;
  }
  .valuation-section::after {
    content: '';
    position: absolute;
    top: -50%; right: -20%;
    width: 60%; height: 200%;
    background: radial-gradient(ellipse, ${hexToRgba(c.colors.accent, 0.08)} 0%, transparent 70%);
    pointer-events: none;
  }
  .valuation-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  .valuation-content .eyebrow { color: var(--gold); }
  .valuation-content .display {
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    margin-top: 12px;
    color: var(--cream);
  }
  .valuation-content .display em { color: var(--gold); }
  .valuation-content > p {
    margin-top: 20px;
    font-size: 1.05rem;
    color: ${hexToRgba(c.colors.background, 0.75)};
    line-height: 1.7;
  }
  .val-features {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 28px;
  }
  .val-feature {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.88rem;
    color: ${hexToRgba(c.colors.background, 0.85)};
  }
  .val-feature svg { flex-shrink: 0; stroke: var(--gold); }
  .valuation-cta-card {
    background: ${hexToRgba(c.colors.background, 0.08)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.12)};
    border-radius: 20px;
    padding: 40px;
    text-align: center;
    backdrop-filter: blur(12px);
  }
  .valuation-cta-card h3 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 1.35rem;
    color: var(--cream);
    margin-bottom: 12px;
  }
  .valuation-cta-card p {
    font-size: 0.92rem;
    color: ${hexToRgba(c.colors.background, 0.65)};
    margin-bottom: 28px;
    line-height: 1.65;
  }
  .btn-gold {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--gold);
    color: var(--bordeaux-dark);
    padding: 14px 32px;
    border-radius: 50px;
    font-weight: 700;
    font-size: 0.95rem;
    transition: background .2s ease, transform .2s var(--spring);
    border: none;
    cursor: pointer;
    font-family: var(--font-body);
  }
  .btn-gold:hover { background: var(--gold-dark); transform: translateY(-2px); }
  .valuation-cta-card .trust-note {
    margin-top: 16px;
    font-size: 0.72rem;
    color: ${hexToRgba(c.colors.background, 0.45)};
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
  }

  @media (max-width: 768px) {
    .valuation-inner { grid-template-columns: 1fr; gap: 40px; }
    .val-features { grid-template-columns: 1fr; }
  }

  /* ========================================
     TEAM
     ======================================== */
  .team-section {
    padding: 100px 0;
    background: var(--cream-tint);
  }
  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 28px;
  }
  .team-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--border);
    transition: transform .3s var(--smooth), box-shadow .3s ease;
  }
  .team-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
  }
  .team-portrait {
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .team-initials {
    font-family: var(--font-display);
    font-size: 2.4rem;
    font-weight: 600;
    color: ${hexToRgba('#ffffff', 0.7)};
    letter-spacing: 0.04em;
  }
  .team-info {
    padding: 24px;
  }
  .team-info h4 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 1.12rem;
    color: var(--bordeaux);
    margin-bottom: 4px;
  }
  .team-role {
    display: block;
    font-size: 0.82rem;
    color: var(--gold-dark);
    font-weight: 500;
    margin-bottom: 12px;
  }
  .team-quals {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
  }
  .team-qual {
    font-size: 0.7rem;
    padding: 3px 10px;
    border-radius: 50px;
    background: var(--bordeaux-soft);
    color: var(--bordeaux);
    font-weight: 500;
    font-family: var(--font-mono);
    letter-spacing: 0.03em;
  }
  .team-specs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }
  .team-spec {
    font-size: 0.7rem;
    padding: 3px 10px;
    border-radius: 50px;
    background: ${hexToRgba(c.colors.accent, 0.1)};
    color: var(--gold-dark);
    font-weight: 500;
  }
  .team-contact {
    display: block;
    font-size: 0.82rem;
    color: var(--ink-soft);
    margin-top: 4px;
    transition: color .2s ease;
  }
  .team-contact:hover { color: var(--bordeaux); }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews-section {
    padding: 100px 0;
  }
  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }
  .review-card {
    background: white;
    border-radius: 16px;
    padding: 32px;
    border: 1px solid var(--border);
    transition: transform .3s var(--smooth);
  }
  .review-card:hover { transform: translateY(-2px); }
  .review-stars {
    display: flex;
    gap: 3px;
    margin-bottom: 16px;
  }
  .review-stars svg {
    width: 16px;
    height: 16px;
    fill: var(--gold);
    stroke: none;
  }
  .review-card blockquote {
    font-size: 0.95rem;
    color: var(--ink);
    line-height: 1.7;
    margin-bottom: 20px;
    font-style: italic;
  }
  .review-author strong {
    display: block;
    font-family: var(--font-display);
    font-weight: 500;
    color: var(--bordeaux);
    font-size: 0.95rem;
  }
  .review-detail {
    display: block;
    font-size: 0.78rem;
    color: var(--ink-soft);
    margin-top: 2px;
  }
  .review-source {
    display: block;
    font-size: 0.72rem;
    color: var(--gold-dark);
    margin-top: 4px;
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
  }

  @media (max-width: 600px) {
    .reviews-grid { grid-template-columns: 1fr; }
  }

  /* ========================================
     ABOUT / TRUST
     ======================================== */
  .about-section {
    padding: 100px 0;
    background: var(--cream-tint);
  }
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  .about-content .display {
    font-size: clamp(1.8rem, 4vw, 2.4rem);
    margin-top: 12px;
    color: var(--bordeaux);
  }
  .about-content p {
    margin-top: 20px;
    font-size: 1.02rem;
    color: var(--ink-soft);
    line-height: 1.7;
  }
  .about-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-top: 32px;
  }
  .about-stat {
    text-align: center;
    padding: 20px;
    background: white;
    border-radius: 12px;
    border: 1px solid var(--border);
  }
  .about-stat .num {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.8rem;
    color: var(--bordeaux);
    letter-spacing: -0.02em;
  }
  .about-stat .label {
    font-size: 0.72rem;
    color: var(--ink-soft);
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-family: var(--font-mono);
  }
  .cert-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 24px;
  }
  .cert-badge {
    font-size: 0.72rem;
    padding: 5px 14px;
    border-radius: 50px;
    background: var(--gold);
    color: var(--bordeaux-dark);
    font-weight: 700;
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .about-visual {
    position: relative;
  }
  .about-image-frame {
    border-radius: 20px;
    overflow: hidden;
    box-shadow: var(--shadow-luxury);
    aspect-ratio: 4 / 3;
    background: linear-gradient(135deg, ${tintHex(c.colors.primary, 0.2)} 0%, ${c.colors.primary} 60%, ${primaryDark} 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .about-image-frame::after {
    content: 'IMG: B\\00fcro / Team';
    position: absolute;
    bottom: 20px;
    left: 20px;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    color: rgba(255,255,255,0.4);
    letter-spacing: 0.06em;
  }
  .about-gold-accent {
    position: absolute;
    bottom: -16px;
    right: -16px;
    width: 120px;
    height: 120px;
    border-radius: 20px;
    background: var(--gold);
    opacity: 0.15;
    z-index: -1;
  }

  @media (max-width: 768px) {
    .about-grid { grid-template-columns: 1fr; gap: 40px; }
    .about-stats { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 480px) {
    .about-stats { grid-template-columns: 1fr; }
  }

  /* ========================================
     LOCATION + HOURS
     ======================================== */
  .location-section {
    padding: 100px 0;
  }
  .location-grid {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 40px;
  }
  .location-card {
    background: white;
    border-radius: 16px;
    padding: 32px;
    border: 1px solid var(--border);
  }
  .location-card h3 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 1.2rem;
    color: var(--bordeaux);
    margin-bottom: 24px;
  }
  .location-detail {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
  }
  .location-detail:last-child { border-bottom: none; }
  .location-detail .icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: var(--bordeaux-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .location-detail .icon svg {
    width: 18px;
    height: 18px;
    stroke: var(--bordeaux);
    stroke-width: 1.5;
  }
  .location-detail .label {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--ink-soft);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-family: var(--font-mono);
  }
  .location-detail .value {
    font-size: 0.92rem;
    color: var(--ink);
    margin-top: 2px;
  }
  .hours-card {
    background: white;
    border-radius: 16px;
    padding: 32px;
    border: 1px solid var(--border);
    align-self: start;
  }
  .hours-card h3 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 1.2rem;
    color: var(--bordeaux);
    margin-bottom: 20px;
  }
  .hours-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
    font-size: 0.9rem;
  }
  .hours-row:last-child { border-bottom: none; }
  .hours-day { font-weight: 600; color: var(--ink); }
  .hours-time { color: var(--ink-soft); }

  @media (max-width: 768px) {
    .location-grid { grid-template-columns: 1fr; }
  }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section {
    padding: 100px 0;
    background: var(--cream-tint);
  }
  .faq-list {
    max-width: 800px;
    margin: 0 auto;
  }
  .faq-item {
    border-bottom: 1px solid var(--border);
  }
  .faq-q {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 20px 0;
    background: none;
    border: none;
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 600;
    color: var(--ink);
    cursor: pointer;
    text-align: left;
    transition: color .2s ease;
  }
  .faq-q:hover { color: var(--bordeaux); }
  .faq-q svg {
    flex-shrink: 0;
    stroke: var(--ink-soft);
    transition: transform .3s var(--smooth);
  }
  .faq-item.open .faq-q svg { transform: rotate(180deg); }
  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height .4s var(--smooth), padding .3s ease;
  }
  .faq-item.open .faq-a {
    max-height: 400px;
    padding-bottom: 20px;
  }
  .faq-a p {
    font-size: 0.92rem;
    color: var(--ink-soft);
    line-height: 1.7;
  }

  /* ========================================
     CTA / CONTACT FORM
     ======================================== */
  .cta-section {
    padding: 100px 0;
    background: var(--bordeaux);
    color: var(--cream);
  }
  .cta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 56px;
    align-items: start;
  }
  .cta-text .eyebrow { color: var(--gold); display: block; margin-bottom: 16px; }
  .cta-text .display { color: var(--cream); font-size: clamp(1.8rem, 4vw, 2.4rem); }
  .cta-text .display em { color: var(--gold); }
  .cta-text > p {
    margin-top: 20px;
    font-size: 1.02rem;
    color: ${hexToRgba(c.colors.background, 0.7)};
    line-height: 1.7;
  }
  .cta-features {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 24px;
  }
  .cta-feature {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.88rem;
    color: ${hexToRgba(c.colors.background, 0.85)};
  }
  .cta-feature svg { flex-shrink: 0; stroke: var(--gold); }

  /* Contact form */
  .contact-form {
    background: ${hexToRgba(c.colors.background, 0.06)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.1)};
    border-radius: 20px;
    padding: 32px;
    backdrop-filter: blur(12px);
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
    font-size: 0.78rem;
    font-weight: 600;
    color: ${hexToRgba(c.colors.background, 0.65)};
    margin-bottom: 6px;
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
  }
  .form-field input,
  .form-field select,
  .form-field textarea {
    width: 100%;
    padding: 12px 16px;
    background: ${hexToRgba(c.colors.background, 0.08)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.15)};
    border-radius: 10px;
    font-family: var(--font-body);
    font-size: 0.92rem;
    color: var(--cream);
    outline: none;
    transition: border-color .2s ease;
    -webkit-appearance: none;
    appearance: none;
  }
  .form-field input::placeholder,
  .form-field textarea::placeholder {
    color: ${hexToRgba(c.colors.background, 0.35)};
  }
  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus {
    border-color: var(--gold);
  }
  .form-field select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23c8a040' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 32px;
  }
  .form-field select option { background: var(--bordeaux); color: var(--cream); }
  .form-field textarea { min-height: 120px; resize: vertical; }
  .form-submit {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--gold);
    color: var(--bordeaux-dark);
    padding: 14px 32px;
    border-radius: 50px;
    font-weight: 700;
    font-size: 0.95rem;
    border: none;
    cursor: pointer;
    font-family: var(--font-body);
    transition: background .2s ease, transform .2s var(--spring);
    margin-top: 8px;
  }
  .form-submit:hover { background: var(--gold-dark); transform: translateY(-2px); }
  .form-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  @media (max-width: 768px) {
    .cta-grid { grid-template-columns: 1fr; gap: 40px; }
    .form-row { grid-template-columns: 1fr; }
  }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: var(--bordeaux-dark);
    color: ${hexToRgba(c.colors.background, 0.7)};
    padding: 64px 0 32px;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 40px;
    padding-bottom: 40px;
    border-bottom: 1px solid ${hexToRgba(c.colors.background, 0.1)};
  }
  .footer-brand {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.2rem;
    color: var(--cream);
    margin-bottom: 12px;
  }
  .footer-desc {
    font-size: 0.88rem;
    line-height: 1.65;
    max-width: 320px;
    color: ${hexToRgba(c.colors.background, 0.55)};
  }
  .footer-col h4 {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 16px;
  }
  .footer-col ul { list-style: none; }
  .footer-col li { padding: 4px 0; }
  .footer-col a {
    font-size: 0.88rem;
    color: ${hexToRgba(c.colors.background, 0.6)};
    transition: color .2s ease;
  }
  .footer-col a:hover { color: var(--cream); }
  .footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 24px;
    font-size: 0.78rem;
    color: ${hexToRgba(c.colors.background, 0.4)};
  }
  .footer-bottom a {
    color: ${hexToRgba(c.colors.background, 0.5)};
    transition: color .2s ease;
  }
  .footer-bottom a:hover { color: var(--cream); }
  .footer-social {
    display: flex;
    gap: 12px;
    margin-top: 16px;
  }
  .footer-social a {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${hexToRgba(c.colors.background, 0.08)};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background .2s ease;
  }
  .footer-social a:hover { background: ${hexToRgba(c.colors.background, 0.15)}; }
  .footer-social svg {
    width: 16px;
    height: 16px;
    stroke: ${hexToRgba(c.colors.background, 0.6)};
    fill: none;
    stroke-width: 1.5;
  }

  @media (max-width: 768px) {
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
  }

  /* ========================================
     MOBILE CTA
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 999;
    background: var(--bordeaux);
    color: var(--gold-light);
    text-align: center;
    padding: 16px 24px;
    font-weight: 700;
    font-size: 0.95rem;
    letter-spacing: 0.02em;
    box-shadow: 0 -4px 20px ${hexToRgba(c.colors.primary, 0.3)};
  }
  @media (max-width: 768px) {
    .mobile-cta { display: block; }
    body { padding-bottom: 56px; }
  }

  /* ========================================
     ANIMATIONS
     ======================================== */
  @media (prefers-reduced-motion: no-preference) {
    .listing-card,
    .service-card,
    .team-card,
    .review-card,
    .faq-item {
      opacity: 0;
      transform: translateY(20px);
      animation: fadeInUp 0.6s var(--smooth) forwards;
    }
    @keyframes fadeInUp {
      to { opacity: 1; transform: translateY(0); }
    }
    .listing-card:nth-child(1) { animation-delay: 0.05s; }
    .listing-card:nth-child(2) { animation-delay: 0.1s; }
    .listing-card:nth-child(3) { animation-delay: 0.15s; }
    .listing-card:nth-child(4) { animation-delay: 0.2s; }
    .listing-card:nth-child(5) { animation-delay: 0.25s; }
    .listing-card:nth-child(6) { animation-delay: 0.3s; }
    .service-card:nth-child(1) { animation-delay: 0.05s; }
    .service-card:nth-child(2) { animation-delay: 0.1s; }
    .service-card:nth-child(3) { animation-delay: 0.15s; }
    .service-card:nth-child(4) { animation-delay: 0.2s; }
    .team-card:nth-child(1) { animation-delay: 0.05s; }
    .team-card:nth-child(2) { animation-delay: 0.1s; }
    .team-card:nth-child(3) { animation-delay: 0.15s; }
    .review-card:nth-child(1) { animation-delay: 0.05s; }
    .review-card:nth-child(2) { animation-delay: 0.1s; }
    .review-card:nth-child(3) { animation-delay: 0.15s; }
  }
</style>
</head>
<body>

${c.announceText ? `<!-- ====== ANNOUNCE BAR ====== -->
<div class="announce-bar">${esc(c.announceText)}</div>` : ''}

<!-- ====== NAVIGATION ====== -->
<nav>
  <div class="nav-inner">
    <a href="#" class="nav-brand">
      <div class="nav-logo">${logoInitial}</div>
      ${esc(c.businessName)}
    </a>
    <ul class="nav-links" id="nav-links">
      <li><a href="#objekte">Objekte</a></li>
      <li><a href="#leistungen">Leistungen</a></li>
      <li><a href="#marktwert">Marktwert</a></li>
      <li><a href="#team">Team</a></li>
      <li><a href="#bewertungen">Bewertungen</a></li>
      <li><a href="#contact" class="nav-cta-link">${esc(c.ctaText)} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></li>
    </ul>
    <button class="nav-toggle" id="nav-toggle" aria-label="Men&uuml;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
    </button>
  </div>
</nav>

<!-- ====== HERO ====== -->
<section class="hero">
  <div class="container">
    <div class="hero-inner">
      <div class="hero-content">
        <div class="hero-tag">${esc(c.heroTag)}</div>
        <h1>${c.heroHeadline} <em>${c.heroAccent}</em></h1>
        <p class="hero-lead">${esc(c.heroLead)}</p>
        <div class="hero-actions">
          <a href="#objekte" class="btn-primary">${esc(c.ctaText)} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
          <a href="#marktwert" class="btn-secondary">Marktwertgutachten</a>
        </div>
      </div>

      <div class="hero-visual">
        <div class="hero-search-card">
          <h3>Immobilie finden</h3>
          <div class="search-row">
            <div class="search-field">
              <label>Objektart</label>
              <select id="search-type">
                ${searchTypesHtml}
              </select>
            </div>
            <div class="search-field">
              <label>Stadtteil</label>
              <select id="search-district">
                ${searchDistrictsHtml}
              </select>
            </div>
          </div>
          <div class="search-row">
            <div class="search-field">
              <label>Preis bis</label>
              <select id="search-price">
                <option>Keine Grenze</option>
                <option>500.000 &euro;</option>
                <option>750.000 &euro;</option>
                <option>1.000.000 &euro;</option>
                <option>1.500.000 &euro;</option>
                <option>2.000.000 &euro;</option>
                <option>3.000.000+ &euro;</option>
              </select>
            </div>
            <div class="search-field">
              <label>Zimmer ab</label>
              <select id="search-rooms">
                <option>Egal</option>
                <option>2+</option>
                <option>3+</option>
                <option>4+</option>
                <option>5+</option>
              </select>
            </div>
          </div>
          <button class="search-submit" onclick="document.getElementById('objekte').scrollIntoView({behavior:'smooth'})">Objekte anzeigen <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16" style="display:inline;vertical-align:middle"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
          <div class="hero-trust">
            <span>${esc(c.reviews.length.toString())}+ Bewertungen</span>
            <span class="hero-trust-divider"></span>
            <span>Provision lt. Vertrag</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ====== AKTUELLE OBJEKTE ====== -->
<section id="objekte" class="listings-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">Aktuelle Objekte</span>
      <h2 class="display">Ausgew&auml;hlte <em>Immobilien</em></h2>
      <p>Exklusive Wohn- und Anlageimmobilien in D&uuml;sseldorfs besten Lagen &mdash; diskret vermittelt, fundiert bewertet.</p>
    </div>
    <div class="listings-grid">
      ${listingsHtml}
    </div>
  </div>
</section>

<!-- ====== LEISTUNGEN ====== -->
<section id="leistungen" class="services-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">Leistungen</span>
      <h2 class="display">Unser <em>Service</em></h2>
      <p>Vom Verkauf &uuml;ber die Vermietung bis zum Marktwertgutachten &mdash; alles aus einer Hand, mit h&ouml;chster Diskretion.</p>
    </div>
    <div class="services-grid">
      ${servicesHtml}
    </div>
  </div>
</section>

<!-- ====== MARKTWERT ====== -->
<section id="marktwert" class="valuation-section">
  <div class="container">
    <div class="valuation-inner">
      <div class="valuation-content">
        <span class="eyebrow">${esc(c.valuationTitle || 'Marktwertgutachten')}</span>
        <h2 class="display">${c.valuationSubtitle || 'Was ist Ihre Immobilie <em>wert?</em>'}</h2>
        <p>${esc(c.valuationText || 'Ein fundiertes Marktwertgutachten ist die Grundlage f\u00fcr jeden erfolgreichen Verkauf. Unsere zertifizierten Sachverst\u00e4ndigen erstellen f\u00fcr Sie eine marktgerechte Bewertung \u2014 basierend auf aktuellen Vergleichswerten, Lageanalyse und Objektzustand.')}</p>
        <div class="val-features">
          ${valFeaturesHtml}
        </div>
      </div>
      <div class="valuation-cta-card">
        <h3>Kostenlose Ersteinsch&auml;tzung</h3>
        <p>Erhalten Sie eine unverbindliche Einsch&auml;tzung des Marktwertes Ihrer Immobilie &mdash; diskret, fundiert und pers&ouml;nlich.</p>
        <a href="#contact" class="btn-gold">Marktwert anfragen <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
        <div class="trust-note">Energieausweis &middot; Grundbuchauszug &middot; Notartermin-Begleitung</div>
      </div>
    </div>
  </div>
</section>

<!-- ====== ABOUT / TRUST ====== -->
<section class="about-section">
  <div class="container">
    <div class="about-grid">
      <div class="about-content">
        <span class="eyebrow">&Uuml;ber uns</span>
        <h2 class="display">${c.aboutTitle || esc(c.businessName)}</h2>
        <p>${esc(c.aboutText || 'Als inhabergef\u00fchrtes Immobilienunternehmen verbinden wir langj\u00e4hrige Marktkenntnis mit pers\u00f6nlicher Betreuung. Jede Immobilie, jeder Kunde und jede Transaktion erh\u00e4lt unsere volle Aufmerksamkeit \u2014 diskret, professionell und mit dem Anspruch an h\u00f6chste Qualit\u00e4t.')}</p>
        ${c.aboutText2 ? `<p>${esc(c.aboutText2)}</p>` : ''}
        ${aboutStatsHtml}
        ${certsHtml}
      </div>
      <div class="about-visual">
        <div class="about-image-frame"></div>
        <div class="about-gold-accent"></div>
      </div>
    </div>
  </div>
</section>

<!-- ====== TEAM ====== -->
<section id="team" class="team-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">Unser Team</span>
      <h2 class="display">Ihre <em>Ansprechpartner</em></h2>
      <p>Erfahrene Immobilienexperten mit regionaler Marktkenntnis und einem Netzwerk, das den Unterschied macht.</p>
    </div>
    <div class="team-grid">
      ${teamHtml}
    </div>
  </div>
</section>

<!-- ====== BEWERTUNGEN ====== -->
${c.reviews.length > 0 ? `<section id="bewertungen" class="reviews-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">Kundenstimmen</span>
      <h2 class="display">Das sagen unsere <em>Kunden</em></h2>
      <p>${avgRating} von 5 Sternen &mdash; basierend auf ${esc(c.reviews.length.toString())} verifizierten Bewertungen.</p>
    </div>
    <div class="reviews-grid">
      ${reviewsHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== STANDORT + BÜROZEITEN ====== -->
<section id="standort" class="location-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">${esc(c.locationTitle || 'Standort')}</span>
      <h2 class="display">${c.locationSubtitle || 'Besuchen Sie <em>uns</em>'}</h2>
    </div>
    <div class="location-grid">
      <div class="location-card">
        <h3>Kontakt &amp; Anfahrt</h3>
        ${locationDetailsHtml.length > 0 ? locationDetailsHtml : `
        ${c.address ? `<div class="location-detail">
          <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
          <div><div class="label">Adresse</div><div class="value">${esc(c.address)}${c.postalCode || c.city ? `, ${esc(c.postalCode || '')} ${esc(c.city || '')}` : ''}</div></div>
        </div>` : ''}
        ${c.phone ? `<div class="location-detail">
          <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
          <div><div class="label">Telefon</div><div class="value">${esc(c.phone)}</div></div>
        </div>` : ''}
        ${c.email ? `<div class="location-detail">
          <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg></div>
          <div><div class="label">E-Mail</div><div class="value">${esc(c.email)}</div></div>
        </div>` : ''}`}
      </div>
      <div class="hours-card">
        <h3>B&uuml;rozeiten</h3>
        ${hoursHtml}
      </div>
    </div>
  </div>
</section>

${faqItems.length > 0 ? `<!-- ====== FAQ ====== -->
<section class="faq-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">H&auml;ufige Fragen</span>
      <h2 class="display">Gut zu <em>wissen</em></h2>
      <p>Antworten auf die wichtigsten Fragen rund um Immobilienverkauf, Provision, Grundbuch und Notartermin.</p>
    </div>
    <div class="faq-list">
      ${faqHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== CTA / CONTACT FORM ====== -->
${c.contactEnabled !== false ? `<section id="contact" class="cta-section">
  <div class="container cta-grid">
    <div class="cta-text">
      <span class="eyebrow">${esc(c.ctaSectionTitle || 'Kontakt')}</span>
      <h2 class="display">${c.ctaSectionSubtitle || 'Schreiben Sie <em>uns</em>.'}</h2>
      <p>Ob Expos&eacute;-Anfrage, Marktwertgutachten oder Beratung zum Immobilienverkauf &mdash; wir freuen uns auf Ihre Nachricht. Selbstverst&auml;ndlich diskret und unverbindlich.</p>

      ${ctaFeaturesHtml.length > 0 ? `<div class="cta-features">${ctaFeaturesHtml}</div>` : `
      <div class="cta-features">
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 13l4 4L19 7"/></svg>
          Kostenlose Erstberatung
        </div>
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 13l4 4L19 7"/></svg>
          Diskreter Vermittlungsprozess
        </div>
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 13l4 4L19 7"/></svg>
          Antwort innerhalb von 24h
        </div>
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M5 13l4 4L19 7"/></svg>
          IVD-Mitglied &amp; zertifiziert
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
          <label>Anliegen</label>
          <select name="betreff">
            <option>Expos&eacute;-Anfrage</option>
            <option>Marktwertgutachten</option>
            <option>Immobilie verkaufen</option>
            <option>Immobilie vermieten</option>
            <option>Investment-Beratung</option>
            <option>Grundbuch / Notar</option>
            <option>Allgemeine Anfrage</option>
          </select>
        </div>
      </div>

      <div class="form-row full">
        <div class="form-field">
          <label>Nachricht*</label>
          <textarea name="message" required placeholder="Beschreiben Sie Ihr Anliegen &mdash; z.B. gew&uuml;nschter Stadtteil, Budget, Objektart ..."></textarea>
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
      <div>
        <div class="footer-brand">${esc(c.businessName)}</div>
        <p class="footer-desc">${esc(c.footerText || c.tagline)}</p>
        ${c.instagramUrl || c.linkedinUrl || c.facebookUrl ? `
        <div class="footer-social">
          ${c.linkedinUrl ? `<a href="${esc(c.linkedinUrl)}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>` : ''}
          ${c.instagramUrl ? `<a href="${esc(c.instagramUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>` : ''}
          ${c.facebookUrl ? `<a href="${esc(c.facebookUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>` : ''}
        </div>` : ''}
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
<a href="${esc(c.mobileCta?.href || '#contact')}" class="mobile-cta">${esc(c.mobileCta?.text || c.ctaText)} &rarr;</a>

<script>
  /* Mobile Nav Toggle */
  document.getElementById('nav-toggle').addEventListener('click', function() {
    document.getElementById('nav-links').classList.toggle('open');
  });

  /* Close mobile nav on link click */
  document.querySelectorAll('#nav-links a').forEach(function(link) {
    link.addEventListener('click', function() {
      document.getElementById('nav-links').classList.remove('open');
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

  /* Scroll-based nav shadow */
  (function() {
    var nav = document.querySelector('nav');
    window.addEventListener('scroll', function() {
      if (window.scrollY > 60) {
        nav.style.boxShadow = '0 4px 20px ${hexToRgba(c.colors.text, 0.06)}';
      } else {
        nav.style.boxShadow = 'none';
      }
    });
  })();

  /* Smooth scroll for search button */
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:var(--cream);font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:${hexToRgba(c.colors.background, 0.7)};font-size:1.05rem">Wir melden uns in K\\u00fcrze bei Ihnen \\u2014 selbstverst\\u00e4ndlich diskret.</p></div>';
          } else {
            alert(d.error || 'Fehler beim Senden');
            btn.textContent = 'Nachricht senden';
            btn.disabled = false;
          }
        })
        .catch(function() {
          alert('Verbindungsfehler');
          btn.textContent = 'Nachricht senden';
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
    <p style="flex:1;min-width:200px;margin:0;color:${hexToRgba(c.colors.background, 0.8)}">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--gold);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--gold);color:var(--bordeaux-dark);border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
