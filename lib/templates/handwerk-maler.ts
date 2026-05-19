export interface HandwerkMalerConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Petrol
    accent: string     // Terracotta
    background: string // Cremig
    text: string       // Dark text
  }
  phone?: string
  email?: string
  address?: string
  openingHours: { days: string; hours: string }[]
  services: {
    name: string
    description: string
    icon?: string
    features?: string[]
    tag?: string
  }[]
  trustBadges: {
    label: string
    description: string
    icon?: string
  }[]
  referenceProjects: {
    title: string
    description: string
    tags?: string[]
    beforeImageUrl?: string
    afterImageUrl?: string
  }[]
  fixedPriceInfo?: {
    headline?: string
    text?: string
    items?: { label: string; description: string }[]
  }
  team: {
    name: string
    role: string
    qualifications: string[]
    specialties?: string[]
    imageUrl?: string
  }[]
  reviews: { text: string; name: string; source: string; rating: number }[]
  serviceArea?: {
    title?: string
    subtitle?: string
    areas?: string[]
    description?: string
  }
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
  faqItems?: { question: string; answer: string }[]
  ctaSectionTitle?: string
  ctaSectionSubtitle?: string
  ctaFeatures?: string[]
  serviceSectionTitle?: string
  serviceSectionSubtitle?: string
  teamSectionTitle?: string
  teamSectionSubtitle?: string
  refSectionTitle?: string
  refSectionSubtitle?: string
  reviewsSectionTitle?: string
  trustSectionTitle?: string
  trustSectionSubtitle?: string
  fixedPriceSectionTitle?: string
  fixedPriceSectionSubtitle?: string
  serviceAreaSectionTitle?: string
  serviceAreaSectionSubtitle?: string
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

export function renderHandwerkMalerTemplate(config: HandwerkMalerConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primaryDark = darkenHex(c.colors.primary, 0.25)
  const primarySoft = hexToRgba(c.colors.primary, 0.12)
  const accentDark = darkenHex(c.colors.accent, 0.3)
  const bgTint = tintHex(c.colors.background, -0.03)
  const bgWarm = tintHex(c.colors.background, -0.06)
  const textSoft = tintHex(c.colors.text, 0.5)
  const borderColor = tintHex(c.colors.background, -0.1)
  const primaryLight = tintHex(c.colors.primary, 0.85)

  const logoInitial = esc(c.businessName.charAt(0))

  // Services HTML
  const servicesHtml = c.services.map((s, idx) => {
    const icons: Record<string, string> = {
      paint: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 3H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/><path d="M12 9v4"/><path d="M8 13h8v6a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-6z"/></svg>',
      roller: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="16" height="5" rx="1"/><path d="M18 5h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-8"/><path d="M12 10v4"/><path d="M10 14h4v7a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-7z"/></svg>',
      brush: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18.37 2.63L14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z"/><path d="M9 8L2 15l2.5 2.5L3 19l2 2 1.5-1.5L9 22l7-7"/></svg>',
      wallpaper: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h8M8 14h4"/><path d="M4 6c-1 0-2 .5-2 2v8c0 1.5 1 2 2 2"/></svg>',
      lacquer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 3v18"/><path d="M5 12l7-4v8l-7-4z"/><circle cx="18" cy="12" r="4"/><path d="M18 8v-4"/></svg>',
      spatula: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2L4 12l3 3L17 5a4.24 4.24 0 0 0-3-3z"/><path d="M4 12l-2 8 8-2"/></svg>',
      stucco: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/><path d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01"/></svg>',
      facade: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',
    }
    const iconKey = s.icon || ['paint', 'facade', 'wallpaper', 'lacquer', 'spatula', 'stucco', 'roller', 'brush'][idx % 8]
    const svgIcon = icons[iconKey] || icons.paint
    return `
      <div class="service-card">
        <div class="service-icon">
          ${svgIcon}
        </div>
        <h4>${esc(s.name)}</h4>
        <p>${esc(s.description)}</p>
        ${(s.features || []).length > 0 ? `<ul class="service-features">
          ${(s.features || []).map(f => `<li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
            ${esc(f)}
          </li>`).join('')}
        </ul>` : ''}
        ${s.tag ? `<span class="service-tag">${esc(s.tag)}</span>` : ''}
      </div>`
  }).join('\n')

  // Trust badges HTML
  const trustHtml = c.trustBadges.map(b => {
    const icons: Record<string, string> = {
      shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
      badge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 15l-2 5 2-1.5L14 20l-2-5z"/><circle cx="12" cy="9" r="6"/><path d="M9 9l2 2 4-4"/></svg>',
      star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z"/></svg>',
      check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>',
      tools: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    }
    const svgIcon = icons[b.icon || 'shield'] || icons.shield
    return `
      <div class="trust-badge-card">
        <div class="trust-icon">${svgIcon}</div>
        <div>
          <h4>${esc(b.label)}</h4>
          <p>${esc(b.description)}</p>
        </div>
      </div>`
  }).join('\n')

  // Reference projects HTML
  const refsHtml = c.referenceProjects.map((p, idx) => {
    const gradients = [
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 100%)`,
      `linear-gradient(135deg, ${c.colors.accent} 0%, ${accentDark} 100%)`,
      `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.3)} 0%, ${c.colors.primary} 100%)`,
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${c.colors.accent} 100%)`,
    ]
    const beforeBg = p.beforeImageUrl
      ? `background-image:url('${esc(p.beforeImageUrl)}');background-size:cover;background-position:center`
      : `background:${gradients[idx % gradients.length]}`
    const afterBg = p.afterImageUrl
      ? `background-image:url('${esc(p.afterImageUrl)}');background-size:cover;background-position:center`
      : `background:${gradients[(idx + 1) % gradients.length]}`
    return `
      <div class="ref-card">
        <div class="ref-images">
          <div class="ref-before" style="${beforeBg}">
            <span class="ref-label">Vorher</span>
          </div>
          <div class="ref-after" style="${afterBg}">
            <span class="ref-label">Nachher</span>
          </div>
        </div>
        <div class="ref-info">
          <h4>${esc(p.title)}</h4>
          <p>${esc(p.description)}</p>
          ${(p.tags || []).length > 0 ? `<div class="ref-tags">
            ${(p.tags || []).map(t => `<span class="ref-tag">${esc(t)}</span>`).join('')}
          </div>` : ''}
        </div>
      </div>`
  }).join('\n')

  // Team HTML
  const teamHtml = c.team.map((m, idx) => {
    const initials = m.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    const gradients = [
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 100%)`,
      `linear-gradient(135deg, ${c.colors.accent} 0%, ${accentDark} 100%)`,
      `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.3)} 0%, ${c.colors.primary} 100%)`,
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${c.colors.accent} 100%)`,
    ]
    const bg = m.imageUrl
      ? `background-image:url('${esc(m.imageUrl)}');background-size:cover;background-position:center`
      : `background:${gradients[idx % gradients.length]}`
    return `
      <div class="team-card">
        <div class="team-portrait" style="${bg}">
          ${!m.imageUrl ? `<span class="team-initials">${esc(initials)}</span>` : ''}
        </div>
        <div class="team-info">
          <h4>${esc(m.name)}</h4>
          <span class="team-role">${esc(m.role)}</span>
          ${m.qualifications.length > 0 ? `<div class="team-quals">
            ${m.qualifications.map(q => `<span class="qual-badge">${esc(q)}</span>`).join('\n            ')}
          </div>` : ''}
          ${(m.specialties || []).length > 0 ? `<div class="team-specs">
            ${(m.specialties || []).map(sp => `<span class="spec-tag">${esc(sp)}</span>`).join('\n            ')}
          </div>` : ''}
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

  // Fixed price info
  const fpi = c.fixedPriceInfo || {}
  const fixedPriceItems = fpi.items || [
    { label: 'Transparente Kalkulation', description: 'Alle Kosten f&uuml;r Material (Caparol, Brillux, Alpina), Arbeitsstunden und Anfahrt sind im Festpreis enthalten.' },
    { label: 'Keine versteckten Kosten', description: 'Der vereinbarte Preis gilt &mdash; auch wenn das Projekt l&auml;nger dauert als geplant.' },
    { label: 'Kostenlose Vor-Ort-Beratung', description: 'Wir besichtigen Ihr Objekt und erstellen ein detailliertes Angebot &mdash; unverbindlich und kostenfrei.' },
  ]
  const fixedPriceHtml = fixedPriceItems.map((item, i) => `
      <div class="fp-item">
        <div class="fp-num">${String(i + 1).padStart(2, '0')}</div>
        <div>
          <h4>${item.label}</h4>
          <p>${item.description}</p>
        </div>
      </div>`).join('')

  // Service area
  const sa = c.serviceArea || {}
  const serviceAreas = sa.areas || ['M&uuml;nchen-Zentrum', 'Schwabing', 'Bogenhausen', 'Haidhausen', 'Sendling', 'Pasing', 'Nymphenburg', 'Solln']
  const serviceAreasHtml = serviceAreas.map(a => `<span class="area-tag">${a}</span>`).join('\n          ')

  // CTA features
  const ctaFeatures = c.ctaFeatures || []
  const ctaFeaturesHtml = ctaFeatures.map(f => `
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          ${esc(f)}
        </div>`).join('')

  // Footer columns
  const footerColumns = c.footerColumns || [
    { title: 'Leistungen', links: [
      { label: 'Innengestaltung', href: '#services' },
      { label: 'Fassadenanstrich', href: '#services' },
      { label: 'Tapezieren', href: '#services' },
      { label: 'Lackieren', href: '#services' },
    ]},
    { title: 'Kontakt', links: [
      { label: 'Anfrage stellen', href: '#contact' },
      { label: 'Referenzen', href: '#referenzen' },
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

  // Features (USP)
  const features = c.features || [
    { icon: 'shield', title: 'Meisterbetrieb', description: 'Ausgebildete Malermeister mit Leidenschaft f&uuml;r Farbe, Form und Pr&auml;zision seit &uuml;ber 20 Jahren.' },
    { icon: 'color', title: 'Premium-Materialien', description: 'Wir arbeiten ausschlie&szlig;lich mit Caparol, Brillux und Alpina &mdash; f&uuml;r langlebige Ergebnisse.' },
    { icon: 'check', title: 'Festpreis-Garantie', description: 'Kein B&ouml;ses Erwachen: Transparente Kalkulation und verbindliche Festpreise vor Arbeitsbeginn.' },
  ]
  const featuresHtml = features.map(f => `
      <div class="feature-card">
        <div class="feature-icon">
          ${f.icon === 'shield' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>'
          : f.icon === 'color' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>'
          : f.icon === 'check' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>'
          : f.icon === 'tools' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>'
          : f.icon === 'star' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>'}
        </div>
        <h4>${f.title}</h4>
        <p>${f.description}</p>
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

<!-- Schema.org HousePainter -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HousePainter",
  "name": "${esc(c.businessName)}",
  "description": "${esc(c.tagline)}",
  ${c.address ? `"address": { "@type": "PostalAddress", "streetAddress": "${esc(c.address)}" },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  "priceRange": "$$",
  "currenciesAccepted": "EUR",
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
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Malerarbeiten",
    "itemListElement": [${c.services.slice(0, 10).map(item => `{
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "${esc(item.name)}",
        "description": "${esc(item.description)}"
      }
    }`).join(',')}]
  },
  "knowsAbout": ["Streichen", "Tapezieren", "Lasieren", "Spachteln", "Putz", "Fassadenanstrich", "Stuck", "Trockenbau", "Lackieren"],
  "url": "${appUrl}${siteId ? `/s/${siteId}` : ''}"
}
</script>

<style>
  /* ========================================
     DESIGN TOKENS
     ======================================== */
  :root {
    --petrol:       ${esc(c.colors.primary)};
    --petrol-dark:  ${primaryDark};
    --petrol-soft:  ${primarySoft};
    --petrol-light: ${primaryLight};
    --terra:        ${esc(c.colors.accent)};
    --terra-dark:   ${accentDark};
    --cream:        ${esc(c.colors.background)};
    --cream-tint:   ${bgTint};
    --cream-warm:   ${bgWarm};
    --ink:          ${esc(c.colors.text)};
    --ink-soft:     ${textSoft};
    --border:       ${borderColor};

    --shadow-card: 0 12px 32px ${hexToRgba(c.colors.text, 0.08)};
    --shadow-image: 0 20px 60px ${hexToRgba(c.colors.text, 0.18)};
    --shadow-glow: 0 0 40px ${hexToRgba(c.colors.primary, 0.15)};

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
    color: var(--petrol);
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }

  .eyebrow {
    color: var(--terra-dark);
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
    background: var(--petrol);
    color: var(--cream);
    text-align: center;
    padding: 10px 16px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }
  .announce strong { color: var(--terra); }

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
    font-size: 24px;
    letter-spacing: -0.02em;
    display: flex; align-items: center; gap: 10px;
    font-variation-settings: "opsz" 144, "SOFT" 80;
    font-style: italic;
  }
  .logo-mark {
    width: 38px; height: 38px;
    background: var(--petrol);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: var(--cream);
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 18px;
    font-style: italic;
    transform: rotate(-3deg);
  }
  .nav-links { display: flex; gap: 32px; font-size: 15px; font-weight: 500; }
  .nav-links a { transition: color 0.2s; color: var(--ink); }
  .nav-links a:hover { color: var(--terra-dark); }
  .nav-cta {
    background: var(--petrol); color: var(--cream);
    padding: 12px 22px; border-radius: 999px;
    font-size: 13px; font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: all 0.3s var(--spring);
    display: inline-flex; align-items: center; gap: 8px;
  }
  .nav-cta:hover { background: var(--terra); color: var(--cream); transform: translateY(-1px); }
  .nav-cta svg { width: 14px; height: 14px; }

  /* Mobile hamburger */
  .nav-toggle { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
  .nav-toggle svg { width: 28px; height: 28px; stroke: var(--ink); }

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
    width: 600px; height: 600px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.primary, 0.06)} 0%, transparent 70%);
    top: -200px; right: -100px;
    pointer-events: none;
  }
  .hero::after {
    content: '';
    position: absolute;
    width: 400px; height: 400px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.accent, 0.08)} 0%, transparent 70%);
    bottom: -100px; left: -50px;
    pointer-events: none;
  }
  .hero-inner {
    max-width: 1280px; margin: 0 auto; padding: 0 32px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 64px;
    align-items: center;
  }
  .hero-tag {
    display: inline-flex; align-items: center; gap: 8px;
    color: var(--terra-dark);
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    margin-bottom: 24px;
  }
  .hero-tag::before {
    content: '';
    width: 32px; height: 1px;
    background: var(--terra);
  }
  .hero h1 {
    font-size: clamp(2.8rem, 5vw, 4.2rem);
    margin-bottom: 24px;
    color: var(--ink);
  }
  .hero h1 em {
    color: var(--petrol);
  }
  .hero-lead {
    font-size: 1.15rem;
    color: var(--ink-soft);
    line-height: 1.7;
    margin-bottom: 36px;
    max-width: 520px;
  }
  .hero-actions {
    display: flex; gap: 16px; align-items: center; flex-wrap: wrap;
  }
  .btn-primary {
    background: var(--petrol); color: var(--cream);
    padding: 16px 32px; border-radius: 999px;
    font-size: 14px; font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: all 0.3s var(--spring);
    display: inline-flex; align-items: center; gap: 10px;
    border: none; cursor: pointer;
  }
  .btn-primary:hover { background: var(--terra); color: var(--cream); transform: translateY(-2px); box-shadow: var(--shadow-glow); }
  .btn-primary svg { width: 16px; height: 16px; }
  .btn-secondary {
    color: var(--ink); padding: 16px 24px;
    font-size: 14px; font-weight: 600;
    transition: color 0.2s;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-secondary:hover { color: var(--petrol); }
  .btn-secondary svg { width: 16px; height: 16px; }

  .hero-image-col {
    position: relative;
  }
  .hero-image-frame {
    width: 100%;
    aspect-ratio: 4/5;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: var(--shadow-image);
    position: relative;
  }
  .hero-image-frame .placeholder {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 60%, ${darkenHex(c.colors.primary, 0.4)} 100%);
    display: flex; align-items: center; justify-content: center;
  }
  .hero-image-frame .placeholder svg {
    width: 80px; height: 80px; stroke: ${hexToRgba(c.colors.background, 0.3)};
  }
  .hero-image-frame img {
    width: 100%; height: 100%; object-fit: cover;
  }
  .hero-float-badge {
    position: absolute; bottom: -20px; left: -20px;
    background: var(--terra);
    color: var(--cream);
    padding: 16px 24px;
    border-radius: 16px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    box-shadow: var(--shadow-card);
    display: flex; align-items: center; gap: 10px;
    z-index: 2;
  }
  .hero-float-badge svg { width: 20px; height: 20px; }

  /* ========================================
     TRUST BADGES
     ======================================== */
  .trust-section {
    background: var(--petrol);
    color: var(--cream);
    padding: 64px 0;
    position: relative;
    overflow: hidden;
  }
  .trust-section::before {
    content: '';
    position: absolute;
    width: 500px; height: 500px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.accent, 0.1)} 0%, transparent 70%);
    top: -200px; right: -100px;
    pointer-events: none;
  }
  .trust-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 24px;
  }
  .trust-badge-card {
    background: ${hexToRgba(c.colors.background, 0.08)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.12)};
    border-radius: 16px;
    padding: 28px 24px;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    transition: all 0.3s var(--smooth);
  }
  .trust-badge-card:hover {
    background: ${hexToRgba(c.colors.background, 0.12)};
    transform: translateY(-2px);
    border-color: var(--terra);
  }
  .trust-icon {
    width: 48px; height: 48px;
    background: ${hexToRgba(c.colors.accent, 0.2)};
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .trust-icon svg {
    width: 24px; height: 24px;
    stroke: var(--terra);
  }
  .trust-badge-card h4 {
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 600;
    margin-bottom: 4px;
    color: var(--cream);
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .trust-badge-card p {
    color: ${hexToRgba(c.colors.background, 0.65)};
    font-size: 0.88rem;
    line-height: 1.6;
  }

  /* ========================================
     FEATURES / USP
     ======================================== */
  .features-section {
    background: var(--cream-tint);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 80px 0;
  }
  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;
  }
  .feature-card {
    background: var(--cream);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 36px 28px;
    transition: all 0.3s var(--smooth);
  }
  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
    border-color: var(--terra);
  }
  .feature-icon {
    width: 52px; height: 52px;
    background: var(--petrol-soft);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
  }
  .feature-icon svg {
    width: 24px; height: 24px;
    stroke: var(--petrol);
  }
  .feature-card h4 {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 600;
    margin-bottom: 8px;
    letter-spacing: -0.01em;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .feature-card p {
    color: var(--ink-soft);
    font-size: 0.92rem;
    line-height: 1.6;
  }

  /* ========================================
     SERVICES
     ======================================== */
  .services-section {
    background: var(--cream);
    padding: 96px 0;
  }
  .section-header {
    text-align: center;
    margin-bottom: 56px;
  }
  .section-header .eyebrow {
    display: block;
    margin-bottom: 16px;
  }
  .section-header h2 {
    font-size: clamp(2rem, 3.5vw, 2.8rem);
    margin-bottom: 16px;
  }
  .section-header p {
    color: var(--ink-soft);
    font-size: 1.05rem;
    max-width: 560px;
    margin: 0 auto;
    line-height: 1.7;
  }
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
  }
  .service-card {
    background: var(--cream-tint);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 36px 28px;
    transition: all 0.3s var(--smooth);
    position: relative;
    overflow: hidden;
  }
  .service-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
    border-color: var(--terra);
  }
  .service-icon {
    width: 52px; height: 52px;
    background: var(--petrol-soft);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
  }
  .service-icon svg {
    width: 24px; height: 24px;
    stroke: var(--petrol);
  }
  .service-card h4 {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 600;
    margin-bottom: 8px;
    letter-spacing: -0.01em;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .service-card p {
    color: var(--ink-soft);
    font-size: 0.92rem;
    line-height: 1.6;
    margin-bottom: 12px;
  }
  .service-features {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 12px;
  }
  .service-features li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: var(--ink-soft);
  }
  .service-features li svg {
    width: 14px; height: 14px;
    stroke: var(--petrol);
    flex-shrink: 0;
  }
  .service-tag {
    position: absolute;
    top: 16px;
    right: 16px;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 999px;
    background: var(--terra);
    color: var(--cream);
  }

  /* ========================================
     REFERENCE PROJECTS (Vorher/Nachher)
     ======================================== */
  .ref-section {
    background: var(--cream-tint);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 96px 0;
  }
  .ref-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
    gap: 32px;
  }
  .ref-card {
    background: var(--cream);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.3s var(--smooth);
  }
  .ref-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
    border-color: var(--terra);
  }
  .ref-images {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    background: var(--border);
  }
  .ref-before, .ref-after {
    aspect-ratio: 4/3;
    position: relative;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
  }
  .ref-label {
    padding: 6px 12px;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--cream);
    background: ${hexToRgba(c.colors.primary, 0.85)};
    border-radius: 0 8px 0 0;
  }
  .ref-after .ref-label {
    background: ${hexToRgba(c.colors.accent, 0.9)};
  }
  .ref-info {
    padding: 24px;
  }
  .ref-info h4 {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 600;
    margin-bottom: 8px;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .ref-info p {
    color: var(--ink-soft);
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: 12px;
  }
  .ref-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .ref-tag {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 999px;
    background: var(--petrol-soft);
    color: var(--petrol);
    border: 1px solid ${hexToRgba(c.colors.primary, 0.2)};
  }

  /* ========================================
     FIXED PRICE INFO
     ======================================== */
  .fp-section {
    background: var(--cream);
    padding: 96px 0;
  }
  .fp-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  .fp-items {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  .fp-item {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }
  .fp-num {
    font-family: var(--font-display);
    font-size: 2.4rem;
    font-weight: 700;
    color: var(--petrol-soft);
    font-variation-settings: "opsz" 144, "SOFT" 30;
    line-height: 1;
    min-width: 60px;
    letter-spacing: -0.04em;
  }
  .fp-item h4 {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 6px;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .fp-item p {
    color: var(--ink-soft);
    font-size: 0.92rem;
    line-height: 1.6;
  }
  .fp-highlight-box {
    background: var(--petrol);
    color: var(--cream);
    border-radius: 20px;
    padding: 48px 40px;
    position: relative;
    overflow: hidden;
  }
  .fp-highlight-box::before {
    content: '';
    position: absolute;
    width: 300px; height: 300px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.accent, 0.15)} 0%, transparent 70%);
    bottom: -100px; right: -50px;
    pointer-events: none;
  }
  .fp-highlight-box h3 {
    font-family: var(--font-display);
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 16px;
    font-variation-settings: "opsz" 144, "SOFT" 50;
  }
  .fp-highlight-box p {
    color: ${hexToRgba(c.colors.background, 0.7)};
    font-size: 1rem;
    line-height: 1.7;
    margin-bottom: 24px;
  }
  .fp-highlight-box .btn-terra {
    background: var(--terra);
    color: var(--cream);
    padding: 14px 28px;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s var(--spring);
    border: none;
    cursor: pointer;
  }
  .fp-highlight-box .btn-terra:hover {
    background: var(--cream);
    color: var(--petrol-dark);
    transform: translateY(-1px);
  }
  .fp-highlight-box .btn-terra svg { width: 14px; height: 14px; }

  /* ========================================
     TEAM
     ======================================== */
  .team-section {
    background: var(--cream-tint);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 96px 0;
  }
  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 32px;
  }
  .team-card {
    background: var(--cream);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.3s var(--smooth);
  }
  .team-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card);
    border-color: var(--terra);
  }
  .team-portrait {
    width: 100%;
    aspect-ratio: 3/4;
    display: flex; align-items: center; justify-content: center;
    position: relative;
    background-size: cover;
    background-position: center;
  }
  .team-initials {
    font-family: var(--font-display);
    font-size: 3rem;
    font-weight: 600;
    color: ${hexToRgba(c.colors.background, 0.5)};
    font-style: italic;
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }
  .team-info {
    padding: 24px;
  }
  .team-info h4 {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 4px;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .team-role {
    display: block;
    color: var(--terra-dark);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .team-quals {
    display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;
  }
  .qual-badge {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.04em;
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--petrol);
    color: var(--cream);
  }
  .team-specs {
    display: flex; flex-wrap: wrap; gap: 6px;
  }
  .spec-tag {
    font-size: 12px;
    color: var(--ink-soft);
    background: var(--cream-tint);
    border: 1px solid var(--border);
    padding: 3px 10px;
    border-radius: 999px;
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews-section {
    background: var(--cream);
    padding: 96px 0;
  }
  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
  }
  .review-card {
    background: var(--cream-tint);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px 28px;
    transition: all 0.3s var(--smooth);
  }
  .review-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-card);
    border-color: var(--terra);
  }
  .review-stars {
    display: flex; gap: 3px; margin-bottom: 16px;
  }
  .review-stars svg {
    width: 16px; height: 16px;
    fill: var(--terra);
    stroke: none;
  }
  .review-text {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--ink);
    margin-bottom: 20px;
    font-style: italic;
  }
  .review-author {
    display: flex; align-items: center; gap: 12px;
  }
  .review-avatar {
    width: 40px; height: 40px;
    background: var(--petrol);
    color: var(--cream);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
  .review-name {
    font-weight: 600;
    font-size: 0.92rem;
  }
  .review-meta {
    color: var(--ink-soft);
    font-size: 0.82rem;
    font-family: var(--font-mono);
    letter-spacing: 0.02em;
  }

  /* ========================================
     SERVICE AREA
     ======================================== */
  .area-section {
    background: var(--cream-tint);
    border-top: 1px solid var(--border);
    padding: 96px 0;
  }
  .area-content {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }
  .area-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-top: 32px;
  }
  .area-tag {
    background: var(--cream);
    border: 1px solid var(--border);
    padding: 10px 20px;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: var(--ink);
    transition: all 0.2s;
  }
  .area-tag:hover {
    border-color: var(--terra);
    color: var(--petrol);
    transform: translateY(-1px);
  }
  .area-desc {
    color: var(--ink-soft);
    font-size: 1rem;
    line-height: 1.7;
    margin-top: 24px;
  }

  /* ========================================
     ABOUT
     ======================================== */
  .about-section {
    background: var(--cream);
    padding: 96px 0;
  }
  .about-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
  }
  .about-content .eyebrow { display: block; margin-bottom: 16px; }
  .about-content h2 {
    font-size: clamp(1.8rem, 3vw, 2.4rem);
    margin-bottom: 24px;
  }
  .about-content p {
    color: var(--ink-soft);
    font-size: 1rem;
    line-height: 1.7;
    margin-bottom: 16px;
  }
  .about-stats {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 32px;
  }
  .about-stat .num {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 700;
    color: var(--petrol);
    font-variation-settings: "opsz" 144, "SOFT" 30;
  }
  .about-stat .label {
    color: var(--ink-soft);
    font-size: 0.82rem;
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-top: 4px;
  }
  .about-image-area {
    position: relative;
  }
  .about-image-frame {
    width: 100%;
    aspect-ratio: 4/5;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: var(--shadow-image);
  }
  .about-image-frame .placeholder {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, ${c.colors.accent} 0%, ${darkenHex(c.colors.accent, 0.2)} 60%, ${c.colors.primary} 100%);
    display: flex; align-items: center; justify-content: center;
  }
  .about-image-frame .placeholder svg {
    width: 64px; height: 64px; stroke: ${hexToRgba(c.colors.background, 0.3)};
  }

  /* ========================================
     LOCATION / HOURS
     ======================================== */
  .location-section {
    background: var(--cream);
    padding: 96px 0;
    border-top: 1px solid var(--border);
  }
  .location-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start;
  }
  .location-content .eyebrow { display: block; margin-bottom: 16px; }
  .location-content h2 {
    font-size: clamp(1.8rem, 3vw, 2.4rem);
    margin-bottom: 24px;
  }
  .location-details {
    display: flex; flex-direction: column; gap: 20px;
  }
  .location-detail {
    display: flex; align-items: flex-start; gap: 16px;
  }
  .location-detail .icon {
    width: 44px; height: 44px;
    background: var(--petrol-soft);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .location-detail .icon svg {
    width: 20px; height: 20px; stroke: var(--petrol); stroke-width: 2;
  }
  .location-detail .label {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-bottom: 2px;
  }
  .location-detail .value {
    font-size: 0.95rem;
    color: var(--ink);
    line-height: 1.5;
  }
  .hours-card {
    background: var(--cream-tint);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px;
  }
  .hours-card h3 {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 24px;
    font-variation-settings: "opsz" 48, "SOFT" 50;
  }
  .hours-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
  }
  .hours-item:last-child { border-bottom: none; }
  .hours-item .label {
    display: flex; align-items: center; gap: 8px;
    font-size: 0.92rem; color: var(--ink-soft);
  }
  .hours-item .label svg {
    width: 16px; height: 16px; stroke: var(--terra-dark);
  }
  .hours-item .value {
    font-weight: 600;
    font-size: 0.92rem;
    font-family: var(--font-mono);
    letter-spacing: -0.02em;
    color: var(--ink);
  }

  /* ========================================
     CTA / CONTACT FORM
     ======================================== */
  .cta-section {
    background: var(--petrol);
    color: var(--cream);
    padding: 96px 0;
    position: relative;
    overflow: hidden;
  }
  .cta-section::before {
    content: '';
    position: absolute;
    width: 500px; height: 500px;
    background: radial-gradient(circle, ${hexToRgba(c.colors.accent, 0.12)} 0%, transparent 70%);
    bottom: -200px; left: -100px;
    pointer-events: none;
  }
  .cta-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start;
  }
  .cta-text h2 { color: var(--cream); margin-bottom: 16px; }
  .cta-text p {
    color: ${hexToRgba(c.colors.background, 0.7)};
    font-size: 1.05rem;
    line-height: 1.7;
    margin-bottom: 24px;
  }
  .cta-features {
    display: flex; flex-direction: column; gap: 12px; margin-top: 24px;
  }
  .cta-feature {
    display: flex; align-items: center; gap: 10px;
    color: ${hexToRgba(c.colors.background, 0.85)};
    font-size: 0.95rem;
  }
  .cta-feature svg { width: 18px; height: 18px; stroke: var(--terra); flex-shrink: 0; }

  .contact-form {
    background: ${hexToRgba(c.colors.background, 0.08)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.12)};
    border-radius: 20px;
    padding: 32px;
    position: relative;
  }
  .form-row {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;
  }
  .form-row.full { grid-template-columns: 1fr; }
  .form-field label {
    display: block;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${hexToRgba(c.colors.background, 0.6)};
    margin-bottom: 6px;
  }
  .form-field input, .form-field select, .form-field textarea {
    width: 100%;
    background: ${hexToRgba(c.colors.background, 0.06)};
    border: 1px solid ${hexToRgba(c.colors.background, 0.12)};
    border-radius: 12px;
    padding: 12px 16px;
    color: var(--cream);
    font-family: var(--font-body);
    font-size: 0.95rem;
    transition: border-color 0.2s;
  }
  .form-field input:focus, .form-field select:focus, .form-field textarea:focus {
    outline: none;
    border-color: var(--terra);
  }
  .form-field input::placeholder, .form-field textarea::placeholder {
    color: ${hexToRgba(c.colors.background, 0.35)};
  }
  .form-field select {
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23${c.colors.background.replace('#', '')}' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
    padding-right: 40px;
  }
  .form-field select option { background: var(--petrol); color: var(--cream); }
  .form-field textarea { min-height: 120px; resize: vertical; }
  .form-submit {
    width: 100%;
    background: var(--terra); color: var(--cream);
    padding: 14px 28px;
    border: none; border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s var(--spring);
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    margin-top: 8px;
  }
  .form-submit:hover {
    background: var(--cream);
    color: var(--petrol-dark);
    transform: translateY(-1px);
  }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section {
    background: var(--cream);
    padding: 96px 0;
    border-top: 1px solid var(--border);
  }
  .faq-list { max-width: 760px; margin: 0 auto; }
  .faq-item {
    border-bottom: 1px solid var(--border);
  }
  .faq-q {
    width: 100%;
    padding: 20px 0;
    background: none; border: none;
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    display: flex; justify-content: space-between; align-items: center;
    gap: 16px;
    color: var(--ink);
    transition: color 0.2s;
  }
  .faq-q:hover { color: var(--petrol); }
  .faq-icon {
    font-size: 1.4rem;
    font-weight: 300;
    transition: transform 0.3s;
    color: var(--terra-dark);
  }
  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s, padding 0.3s;
    color: var(--ink-soft);
    font-size: 0.95rem;
    line-height: 1.7;
  }
  .faq-item.open .faq-a { max-height: 400px; padding-bottom: 20px; }
  .faq-item.open .faq-icon { transform: rotate(45deg); }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: var(--petrol);
    color: var(--cream);
    padding: 64px 0 32px;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr repeat(2, 1fr);
    gap: 48px;
    margin-bottom: 48px;
  }
  .footer-brand {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 600;
    font-style: italic;
    margin-bottom: 12px;
    font-variation-settings: "opsz" 144, "SOFT" 80;
  }
  .footer-desc {
    color: ${hexToRgba(c.colors.background, 0.6)};
    font-size: 0.92rem;
    line-height: 1.6;
    max-width: 320px;
  }
  .footer-col h4 {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--terra);
    margin-bottom: 16px;
  }
  .footer-col ul { list-style: none; }
  .footer-col li { margin-bottom: 10px; }
  .footer-col a {
    color: ${hexToRgba(c.colors.background, 0.6)};
    font-size: 0.92rem;
    transition: color 0.2s;
  }
  .footer-col a:hover { color: var(--cream); }
  .footer-bottom {
    border-top: 1px solid ${hexToRgba(c.colors.background, 0.1)};
    padding-top: 24px;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 0.82rem;
    color: ${hexToRgba(c.colors.background, 0.4)};
  }
  .footer-bottom a { color: ${hexToRgba(c.colors.background, 0.5)}; transition: color 0.2s; }
  .footer-bottom a:hover { color: var(--cream); }

  /* ========================================
     MOBILE CTA (Sticky)
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 40;
    background: var(--petrol);
    color: var(--cream);
    text-align: center;
    padding: 16px 24px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: background 0.2s;
  }
  .mobile-cta:hover { background: var(--terra); color: var(--cream); }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .hero-inner { grid-template-columns: 1fr; gap: 40px; text-align: center; }
    .hero-lead { margin: 0 auto 36px; }
    .hero-actions { justify-content: center; }
    .hero-image-col { max-width: 400px; margin: 0 auto; }
    .hero-float-badge { left: auto; right: -10px; bottom: -15px; }
    .about-grid { grid-template-columns: 1fr; gap: 40px; }
    .about-image-area { max-width: 400px; margin: 0 auto; }
    .about-stats { grid-template-columns: repeat(3, 1fr); }
    .location-grid { grid-template-columns: 1fr; gap: 40px; }
    .cta-grid { grid-template-columns: 1fr; gap: 40px; }
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .features-grid { grid-template-columns: 1fr 1fr; }
    .fp-grid { grid-template-columns: 1fr; gap: 40px; }
    .ref-grid { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; }
  }
  @media (max-width: 768px) {
    section { padding: 64px 0; }
    .container { padding: 0 20px; }
    .nav-links { display: none; }
    .nav-toggle { display: block; }
    .nav-links.open {
      display: flex; flex-direction: column;
      position: absolute; top: 100%; left: 0; right: 0;
      background: var(--cream);
      border-bottom: 1px solid var(--border);
      padding: 24px 32px;
      gap: 16px;
      box-shadow: 0 8px 24px ${hexToRgba(c.colors.text, 0.1)};
    }
    .nav-cta { display: none; }
    .mobile-cta { display: block; }
    .hero { padding: 40px 0 60px; }
    .hero h1 { font-size: clamp(2rem, 8vw, 2.8rem); }
    .hero-inner { padding: 0 20px; }
    .features-grid { grid-template-columns: 1fr; }
    .services-grid { grid-template-columns: 1fr; }
    .team-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
    .reviews-grid { grid-template-columns: 1fr; }
    .trust-grid { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
    .section-header h2 { font-size: clamp(1.6rem, 6vw, 2.2rem); }
    body { padding-bottom: 52px; }
    .ref-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .hero-actions { flex-direction: column; width: 100%; }
    .btn-primary { width: 100%; justify-content: center; }
    .about-stats { grid-template-columns: 1fr; text-align: center; }
    .hero-float-badge { display: none; }
    .area-tags { gap: 6px; }
    .area-tag { padding: 8px 14px; font-size: 12px; }
  }
</style>
</head>
<body>

${c.announceText ? `<!-- ====== ANNOUNCEMENT BAR ====== -->
<div class="announce">${c.announceText}</div>` : ''}

<!-- ====== NAV ====== -->
<nav>
  <div class="nav-inner">
    <a href="#" class="logo">
      <div class="logo-mark">${logoInitial}</div>
      ${esc(c.businessName)}
    </a>
    <div class="nav-links" id="nav-links">
      <a href="#services">Leistungen</a>
      <a href="#referenzen">Referenzen</a>
      <a href="#team">Team</a>
      <a href="#bewertungen">Bewertungen</a>
      <a href="#contact">Kontakt</a>
    </div>
    <a href="#contact" class="nav-cta">
      ${esc(c.ctaText)}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>
    <button class="nav-toggle" id="nav-toggle" aria-label="Men&uuml; &ouml;ffnen">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
  </div>
</nav>

<!-- ====== HERO ====== -->
<section class="hero">
  <div class="hero-inner">
    <div class="hero-text">
      <div class="hero-tag">${esc(c.heroTag)}</div>
      <h1 class="display">${c.heroHeadline} <em>${c.heroAccent}</em></h1>
      <p class="hero-lead">${esc(c.heroLead)}</p>
      <div class="hero-actions">
        <a href="#contact" class="btn-primary">
          ${esc(c.ctaText)}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
        <a href="#services" class="btn-secondary">
          Leistungen entdecken
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </a>
      </div>
    </div>
    <div class="hero-image-col">
      <div class="hero-image-frame">
        ${c.heroImageUrl
          ? `<img src="${esc(c.heroImageUrl)}" alt="${esc(c.businessName)} &mdash; Malerarbeiten" loading="eager">`
          : `<div class="placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <path d="M19 3H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/><path d="M12 9v4"/><path d="M8 13h8v6a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-6z"/>
              </svg>
            </div>`}
      </div>
      <div class="hero-float-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Meisterbetrieb &middot; Innungsmitglied
      </div>
    </div>
  </div>
</section>

<!-- ====== TRUST BADGES ====== -->
${c.trustBadges.length > 0 ? `<section class="trust-section">
  <div class="container">
    ${c.trustSectionTitle || c.trustSectionSubtitle ? `<div class="section-header" style="margin-bottom:40px">
      ${c.trustSectionTitle ? `<span class="eyebrow" style="color:var(--terra)">${esc(c.trustSectionTitle)}</span>` : ''}
      ${c.trustSectionSubtitle ? `<h2 class="display" style="color:var(--cream)">${c.trustSectionSubtitle}</h2>` : ''}
    </div>` : ''}
    <div class="trust-grid">
      ${trustHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== FEATURES / USP ====== -->
<section class="features-section">
  <div class="container">
    <div class="features-grid">
      ${featuresHtml}
    </div>
  </div>
</section>

<!-- ====== SERVICES ====== -->
<section id="services" class="services-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">${esc(c.serviceSectionTitle || 'Unsere Leistungen')}</span>
      <h2 class="display">${c.serviceSectionSubtitle || 'Streichen, Tapezieren &amp; <em>mehr</em>'}</h2>
      <p>Von der Innengestaltung &uuml;ber Fassadenanstrich bis zur fachgerechten Spachtelarbeit &mdash; Meisterqualit&auml;t mit Caparol, Brillux und Alpina.</p>
    </div>
    <div class="services-grid">
      ${servicesHtml}
    </div>
  </div>
</section>

<!-- ====== REFERENCE PROJECTS ====== -->
${c.referenceProjects.length > 0 ? `<section id="referenzen" class="ref-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">${esc(c.refSectionTitle || 'Referenz-Projekte')}</span>
      <h2 class="display">${c.refSectionSubtitle || 'Vorher &amp; <em>Nachher</em>'}</h2>
      <p>Ausgew&auml;hlte Projekte aus den Bereichen Streichen, Tapezieren, Lasieren, Fassadenanstrich und Spachteltechnik.</p>
    </div>
    <div class="ref-grid">
      ${refsHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== FIXED PRICE INFO ====== -->
<section class="fp-section">
  <div class="container">
    <div class="fp-grid">
      <div>
        <div class="section-header" style="text-align:left;margin-bottom:40px">
          <span class="eyebrow">${esc(c.fixedPriceSectionTitle || 'Festpreis-Garantie')}</span>
          <h2 class="display">${c.fixedPriceSectionSubtitle || 'Transparent &amp; <em>fair</em>'}</h2>
        </div>
        <div class="fp-items">
          ${fixedPriceHtml}
        </div>
      </div>
      <div class="fp-highlight-box">
        <h3>${esc(fpi.headline || 'Kostenlose Vor-Ort-Beratung')}</h3>
        <p>${fpi.text || 'Wir besichtigen Ihr Objekt, beraten Sie zu Materialien wie Caparol, Brillux oder Alpina und erstellen ein transparentes Festpreis-Angebot &mdash; unverbindlich und kostenfrei.'}</p>
        <a href="#contact" class="btn-terra">
          Jetzt anfragen
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ====== TEAM ====== -->
${c.team.length > 0 ? `<section id="team" class="team-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">${esc(c.teamSectionTitle || 'Unser Team')}</span>
      <h2 class="display">${c.teamSectionSubtitle || 'Die <em>Handwerker</em> hinter dem Pinselstrich'}</h2>
      <p>Ausgebildete Malermeister und Gesellen mit Erfahrung in Streichen, Tapezieren, Spachteln, Stuck und Trockenbau.</p>
    </div>
    <div class="team-grid">
      ${teamHtml}
    </div>
  </div>
</section>` : ''}

<!-- ====== REVIEWS ====== -->
<section id="bewertungen" class="reviews-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">${esc(c.reviewsSectionTitle || 'Bewertungen')}</span>
      <h2 class="display">Was unsere <em>Kunden</em> sagen</h2>
    </div>
    <div class="reviews-grid">
      ${reviewsHtml}
    </div>
  </div>
</section>

<!-- ====== SERVICE AREA ====== -->
<section class="area-section">
  <div class="container">
    <div class="area-content">
      <span class="eyebrow">${esc(c.serviceAreaSectionTitle || sa.title || 'Service-Gebiet')}</span>
      <h2 class="display" style="margin-top:16px">${c.serviceAreaSectionSubtitle || sa.subtitle || 'Wir kommen zu <em>Ihnen</em>'}</h2>
      <div class="area-tags">
        ${serviceAreasHtml}
      </div>
      <p class="area-desc">${esc(sa.description || 'Wir sind in ganz M\u00fcnchen und Umgebung f\u00fcr Sie im Einsatz \u2014 von der Altbauwohnung in Schwabing bis zur Neubaufassade in Pasing.')}</p>
    </div>
  </div>
</section>

<!-- ====== ABOUT ====== -->
${c.aboutTitle || c.aboutText ? `<section class="about-section">
  <div class="container">
    <div class="about-grid">
      <div class="about-content">
        <span class="eyebrow">&Uuml;ber uns</span>
        <h2 class="display">${c.aboutTitle || 'Willkommen bei <em>' + esc(c.businessName) + '</em>'}</h2>
        <p>${esc(c.aboutText || '')}</p>
        ${c.aboutText2 ? `<p>${esc(c.aboutText2)}</p>` : ''}
        ${aboutStatsHtml}
      </div>
      <div class="about-image-area">
        <div class="about-image-frame">
          <div class="placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M19 3H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/><path d="M12 9v4"/><path d="M8 13h8v6a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-6z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>` : ''}

<!-- ====== LOCATION ====== -->
<section id="location" class="location-section">
  <div class="container">
    <div class="location-grid">
      <div class="location-content">
        <span class="eyebrow">Kontakt &amp; Anfahrt</span>
        <h2 class="display">So erreichen <em>Sie uns</em></h2>
        <div class="location-details">
          ${c.address ? `<div class="location-detail">
            <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
            <div><div class="label">Adresse</div><div class="value">${esc(c.address)}</div></div>
          </div>` : ''}
          ${c.phone ? `<div class="location-detail">
            <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
            <div><div class="label">Telefon</div><div class="value">${esc(c.phone)}</div></div>
          </div>` : ''}
          ${c.email ? `<div class="location-detail">
            <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg></div>
            <div><div class="label">E-Mail</div><div class="value">${esc(c.email)}</div></div>
          </div>` : ''}
        </div>
      </div>
      <div class="hours-card">
        <h3>&Ouml;ffnungszeiten</h3>
        ${hoursHtml}
      </div>
    </div>
  </div>
</section>

${(c.faqItems || []).length > 0 ? `<!-- ====== FAQ ====== -->
<section id="faq" class="faq-section">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">H&auml;ufige Fragen</span>
      <h2 class="display">Gut zu <em>wissen</em></h2>
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
      <span class="eyebrow" style="color: var(--terra); display:block; margin-bottom:16px;">${esc(c.ctaSectionTitle || 'Anfrage stellen')}</span>
      <h2 class="display">${c.ctaSectionSubtitle || 'Jetzt unverbindlich <em>anfragen</em>'}</h2>
      <p>Ob Innenanstrich, Fassadenanstrich, Tapezieren, Lackieren oder Spachteltechnik &mdash; schreiben Sie uns und erhalten Sie Ihr kostenloses Festpreis-Angebot.</p>

      ${ctaFeaturesHtml.length > 0 ? `<div class="cta-features">${ctaFeaturesHtml}</div>` : `
      <div class="cta-features">
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Kostenlose Vor-Ort-Beratung
        </div>
        <div class="cta-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          Verbindliches Festpreis-Angebot
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
          <label>Anliegen</label>
          <select name="betreff">
            <option>Innenanstrich</option>
            <option>Fassadenanstrich</option>
            <option>Tapezieren</option>
            <option>Lackieren</option>
            <option>Spachteln / Putz</option>
            <option>Stuck / Trockenbau</option>
            <option>Lasieren</option>
            <option>Allgemeine Anfrage</option>
          </select>
        </div>
      </div>

      <div class="form-row full">
        <div class="form-field">
          <label>Nachricht*</label>
          <textarea name="message" required placeholder="Beschreiben Sie Ihr Projekt: Fl&auml;che, Zustand, gew&uuml;nschtes Ergebnis ..."></textarea>
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
      <div>
        <div class="footer-brand">${esc(c.businessName)}</div>
        <p class="footer-desc">${esc(c.footerText || c.tagline)}</p>
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
<a href="#contact" class="mobile-cta">${esc(c.ctaText)} &rarr;</a>

<script>
  /* Mobile Nav Toggle */
  document.getElementById('nav-toggle').addEventListener('click', function() {
    document.getElementById('nav-links').classList.toggle('open');
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

  /* Scroll-based nav background */
  (function() {
    var nav = document.querySelector('nav');
    window.addEventListener('scroll', function() {
      if (window.scrollY > 60) {
        nav.style.boxShadow = '0 4px 20px ${hexToRgba(c.colors.text, 0.08)}';
      } else {
        nav.style.boxShadow = 'none';
      }
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
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--terra);color:var(--cream);border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
