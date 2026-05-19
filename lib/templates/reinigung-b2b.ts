/* eslint-disable @typescript-eslint/no-unused-vars */
export interface ReinigungB2BConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Tiefblau #0f2940
    accent: string     // Mint #4ecdc4
    background: string // Hell #f5f8fa
    text: string       // Dark text
  }
  phone?: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  openingHours: { days: string; hours: string }[]
  services: {
    name: string
    description: string
    icon?: string
    priceFrom?: string
    unit?: string
  }[]
  trustBadges: { icon?: string; label: string; sublabel?: string }[]
  calculatorTitle?: string
  calculatorSubtitle?: string
  calculatorBasePrice?: number  // EUR per m²
  calculatorMinArea?: number
  calculatorMaxArea?: number
  beforeAfterItems?: { label: string; beforeUrl?: string; afterUrl?: string }[]
  references: { company: string; industry: string; quote?: string; contact?: string; logoUrl?: string }[]
  reviews: { text: string; name: string; company: string; rating: number }[]
  serviceArea?: {
    title?: string
    subtitle?: string
    districts?: string[]
    mapEmbedUrl?: string
  }
  faqItems?: { question: string; answer: string }[]
  heroImageUrl?: string
  aboutTitle?: string
  aboutText?: string
  aboutText2?: string
  certifications?: string[]
  contactEnabled?: boolean
  contactFormTitle?: string
  contactFormSubtitle?: string
  contactFields?: { name: string; label: string; type: string; required?: boolean; placeholder?: string; options?: string[] }[]
  imprintUrl?: string
  privacyUrl?: string
  footerText?: string
  footerColumns?: { title: string; links: { label: string; href: string }[] }[]
  ctaSectionTitle?: string
  ctaSectionSubtitle?: string
  ctaFeatures?: string[]
  mobileCta?: { text: string; href: string }
  ogImageUrl?: string
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

export function renderReinigungB2BTemplate(config: ReinigungB2BConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primaryDark = darkenHex(c.colors.primary, 0.25)
  const primaryLight = tintHex(c.colors.primary, 0.85)
  const primarySoft = hexToRgba(c.colors.primary, 0.08)
  const accentDark = darkenHex(c.colors.accent, 0.25)
  const accentSoft = hexToRgba(c.colors.accent, 0.12)
  const bgTint = tintHex(c.colors.background, -0.03)
  const bgWarm = tintHex(c.colors.background, -0.06)
  const textSoft = tintHex(c.colors.text, 0.45)
  const borderColor = tintHex(c.colors.background, -0.12)

  const logoInitial = esc(c.businessName.charAt(0))

  // Service icons mapping
  const serviceIconMap: Record<string, string> = {
    unterhaltsreinigung: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="6" width="32" height="36" rx="3"/><path d="M16 18h16M16 26h16M16 34h10"/><circle cx="36" cy="36" r="8" fill="var(--mint)" stroke="none" opacity="0.2"/><path d="M33 36l2 2 4-4" stroke="var(--mint)" stroke-width="2.5"/></svg>',
    grundreinigung: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 40V20l12-12 12 12v20"/><rect x="18" y="28" width="12" height="12"/><path d="M18 34h12"/><circle cx="24" cy="16" r="3"/></svg>',
    glasreinigung: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="10" y="6" width="28" height="36" rx="2"/><path d="M10 6h28M16 14v20M24 10v28M32 14v20" opacity="0.3"/><path d="M8 22l32 4" stroke-width="3" stroke="var(--mint)" opacity="0.4"/></svg>',
    teppichreinigung: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 12h36v24H6z"/><path d="M6 18h36M6 24h36M6 30h36" opacity="0.3"/><path d="M14 12v24M24 12v24M34 12v24" opacity="0.2"/></svg>',
    bauschluss: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 40h32"/><path d="M14 40V18l10-10 10 10v22"/><path d="M20 40V30h8v10"/><path d="M18 22h4M26 22h4"/><circle cx="40" cy="10" r="6" fill="var(--mint)" stroke="none" opacity="0.2"/><path d="M38 10h4M40 8v4" stroke="var(--mint)" stroke-width="2"/></svg>',
    desinfektion: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M24 6v4M36 12l-3 3M12 12l3 3M6 24h4M38 24h4"/><circle cx="24" cy="26" r="12"/><path d="M24 20v8M20 24h8" stroke-width="2.5" stroke="var(--mint)"/></svg>',
  }

  // Services HTML
  const servicesHtml = c.services.map(s => {
    const iconKey = (s.icon || s.name).toLowerCase()
      .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
      .replace(/[^a-z]/g, '')
    const svgIcon = serviceIconMap[iconKey] || serviceIconMap['unterhaltsreinigung']
    return `
          <div class="service-card">
            <div class="service-icon">${svgIcon}</div>
            <h3>${esc(s.name)}</h3>
            <p>${esc(s.description)}</p>
            ${s.priceFrom ? `<div class="service-price">ab <strong>${esc(s.priceFrom)}</strong>${s.unit ? ` / ${esc(s.unit)}` : ''}</div>` : ''}
          </div>`
  }).join('\n')

  // Trust badges HTML
  const trustBadgesHtml = c.trustBadges.map(b => `
        <div class="trust-badge">
          ${b.icon === 'din' ? '<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="var(--mint)" stroke-width="2"/><path d="M13 20l4 4 10-10" stroke="var(--mint)" stroke-width="2.5" stroke-linecap="round"/></svg>'
          : b.icon === 'shield' ? '<svg viewBox="0 0 40 40" fill="none"><path d="M20 4L6 10v10c0 9.5 6 17.5 14 20 8-2.5 14-10.5 14-20V10L20 4z" stroke="var(--mint)" stroke-width="2"/><path d="M15 20l3 3 7-7" stroke="var(--mint)" stroke-width="2" stroke-linecap="round"/></svg>'
          : b.icon === 'star' ? '<svg viewBox="0 0 40 40" fill="none"><path d="M20 4l5 10 11 2-8 7 2 11-10-5-10 5 2-11-8-7 11-2z" stroke="var(--mint)" stroke-width="2"/></svg>'
          : b.icon === 'award' ? '<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="16" r="10" stroke="var(--mint)" stroke-width="2"/><path d="M15 25l-2 11 7-4 7 4-2-11" stroke="var(--mint)" stroke-width="2"/></svg>'
          : '<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="var(--mint)" stroke-width="2"/><path d="M13 20l4 4 10-10" stroke="var(--mint)" stroke-width="2.5" stroke-linecap="round"/></svg>'}
          <span class="trust-label">${esc(b.label)}</span>
          ${b.sublabel ? `<span class="trust-sublabel">${esc(b.sublabel)}</span>` : ''}
        </div>`).join('\n')

  // Reviews HTML
  const reviewsHtml = c.reviews.map(r => {
    const initials = r.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    return `
          <div class="review-card">
            <div class="review-stars">${generateStarsSvg(r.rating)}</div>
            <p class="review-text">&ldquo;${esc(r.text)}&rdquo;</p>
            <div class="review-author">
              <div class="review-avatar">${esc(initials)}</div>
              <div>
                <div class="review-name">${esc(r.name)}</div>
                <div class="review-company">${esc(r.company)}</div>
              </div>
            </div>
          </div>`
  }).join('\n')

  // References HTML
  const referencesHtml = c.references.map(ref => `
        <div class="ref-card">
          <div class="ref-header">
            ${ref.logoUrl ? `<img src="${esc(ref.logoUrl)}" alt="${esc(ref.company)}" class="ref-logo" loading="lazy">` : `<div class="ref-logo-placeholder">${esc(ref.company.charAt(0))}</div>`}
            <div>
              <h4>${esc(ref.company)}</h4>
              <span class="ref-industry">${esc(ref.industry)}</span>
            </div>
          </div>
          ${ref.quote ? `<p class="ref-quote">&ldquo;${esc(ref.quote)}&rdquo;</p>` : ''}
          ${ref.contact ? `<div class="ref-contact">&mdash; ${esc(ref.contact)}</div>` : ''}
        </div>`).join('\n')

  // Before/After HTML
  const beforeAfterItems = c.beforeAfterItems || []
  const beforeAfterHtml = beforeAfterItems.map((item, i) => `
        <div class="ba-item">
          <div class="ba-label">${esc(item.label)}</div>
          <div class="ba-panels">
            <div class="ba-panel ba-before" style="${item.beforeUrl ? `background-image:url('${esc(item.beforeUrl)}');background-size:cover;background-position:center` : `background:linear-gradient(135deg, ${tintHex(c.colors.primary, 0.3)}, ${c.colors.primary})`}">
              <span class="ba-tag">Vorher</span>
            </div>
            <div class="ba-panel ba-after" style="${item.afterUrl ? `background-image:url('${esc(item.afterUrl)}');background-size:cover;background-position:center` : `background:linear-gradient(135deg, ${c.colors.accent}, ${darkenHex(c.colors.accent, 0.2)})`}">
              <span class="ba-tag">Nachher</span>
            </div>
          </div>
        </div>`).join('\n')

  // Service area districts
  const serviceArea = c.serviceArea || {}
  const districtsHtml = (serviceArea.districts || []).map(d => `<span class="district-tag">${esc(d)}</span>`).join('\n          ')

  // FAQ HTML
  const faqHtml = (c.faqItems || []).map(f => `
        <div class="faq-item">
          <button class="faq-q" aria-expanded="false">${esc(f.question)}<span class="faq-icon">+</span></button>
          <div class="faq-a" role="region">${esc(f.answer)}</div>
        </div>`).join('')

  // Contact form fields
  const defaultFields = [
    { name: 'company', label: 'Firma', type: 'text', required: true, placeholder: 'Ihre Firma' },
    { name: 'name', label: 'Ansprechpartner', type: 'text', required: true, placeholder: 'Vor- und Nachname' },
    { name: 'email', label: 'E-Mail', type: 'email', required: true, placeholder: 'ihre@firma.de' },
    { name: 'phone', label: 'Telefon', type: 'tel', required: false, placeholder: '+49 30 ...' },
    { name: 'area', label: 'Fl\u00e4che (m\u00b2)', type: 'number', required: false, placeholder: 'ca. m\u00b2' },
    { name: 'service', label: 'Gew\u00fcnschte Leistung', type: 'select', required: false, options: c.services.map(s => s.name) },
    { name: 'message', label: 'Nachricht', type: 'textarea', required: false, placeholder: 'Ihr Anliegen...' },
  ]
  const contactFields = c.contactFields || defaultFields
  const contactFieldsHtml = contactFields.map(f => {
    if (f.type === 'textarea') {
      return `
            <div class="form-group full">
              <label for="cf-${esc(f.name)}">${esc(f.label)}${f.required ? ' *' : ''}</label>
              <textarea id="cf-${esc(f.name)}" name="${esc(f.name)}" rows="4" placeholder="${esc(f.placeholder || '')}"${f.required ? ' required' : ''}></textarea>
            </div>`
    }
    if (f.type === 'select' && f.options) {
      return `
            <div class="form-group">
              <label for="cf-${esc(f.name)}">${esc(f.label)}${f.required ? ' *' : ''}</label>
              <select id="cf-${esc(f.name)}" name="${esc(f.name)}"${f.required ? ' required' : ''}>
                <option value="">Bitte w&auml;hlen</option>
                ${f.options.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join('\n                ')}
              </select>
            </div>`
    }
    return `
            <div class="form-group">
              <label for="cf-${esc(f.name)}">${esc(f.label)}${f.required ? ' *' : ''}</label>
              <input type="${esc(f.type)}" id="cf-${esc(f.name)}" name="${esc(f.name)}" placeholder="${esc(f.placeholder || '')}"${f.required ? ' required' : ''}>
            </div>`
  }).join('')

  // Footer columns
  const footerColumns = c.footerColumns || [
    { title: 'Leistungen', links: [
      { label: 'Unterhaltsreinigung', href: '#services' },
      { label: 'Grundreinigung', href: '#services' },
      { label: 'Glasreinigung', href: '#services' },
    ]},
    { title: 'Unternehmen', links: [
      { label: '\u00dcber uns', href: '#about' },
      { label: 'Referenzen', href: '#references' },
      { label: 'Kontakt', href: '#contact' },
    ]},
    { title: 'Rechtliches', links: [
      { label: 'Impressum', href: c.imprintUrl || '#' },
      { label: 'Datenschutz', href: c.privacyUrl || '#' },
    ]},
  ]
  const footerColumnsHtml = footerColumns.map(col => `
          <div class="footer-col">
            <h4>${esc(col.title)}</h4>
            ${col.links.map(l => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('\n            ')}
          </div>`).join('\n')

  // CTA features
  const ctaFeatures = c.ctaFeatures || [
    'Kostenlose Erstbegehung',
    'Festpreisgarantie',
    'Flexible Vertragslaufzeiten',
    '24h Notfall-Service',
  ]
  const ctaFeaturesHtml = ctaFeatures.map(f => `
            <div class="cta-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--mint)" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
              ${esc(f)}
            </div>`).join('')

  // Opening hours
  const hoursHtml = c.openingHours.map(h => `
          <div class="hours-row">
            <span class="hours-day">${esc(h.days)}</span>
            <span class="hours-time">${esc(h.hours)}</span>
          </div>`).join('')

  // Calculator config
  const calcBasePrice = c.calculatorBasePrice || 2.5
  const calcMin = c.calculatorMinArea || 50
  const calcMax = c.calculatorMaxArea || 5000

  // Mobile CTA
  const mobileCta = c.mobileCta || { text: c.ctaText || 'Angebot anfordern', href: '#contact' }

  // Nav links
  const navLinks = [
    { label: 'Leistungen', href: '#services' },
    { label: 'Kalkulator', href: '#calculator' },
    { label: 'Referenzen', href: '#references' },
    { label: 'Bewertungen', href: '#reviews' },
    { label: 'Kontakt', href: '#contact' },
  ]

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

<!-- Open Graph -->
<meta property="og:title" content="${esc(c.businessName)} | ${esc(c.tagline)}">
<meta property="og:description" content="${esc(c.heroLead)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${appUrl}${siteId ? `/s/${siteId}` : ''}">
${c.ogImageUrl ? `<meta property="og:image" content="${esc(c.ogImageUrl)}">` : ''}

<!-- Schema.org LocalBusiness -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "${esc(c.businessName)}",
  "description": "${esc(c.tagline)}",
  ${c.address ? `"address": {
    "@type": "PostalAddress",
    "streetAddress": "${esc(c.address)}"${c.postalCode ? `,\n    "postalCode": "${esc(c.postalCode)}"` : ''}${c.city ? `,\n    "addressLocality": "${esc(c.city)}",\n    "addressCountry": "DE"` : ''}
  },` : ''}
  ${c.phone ? `"telephone": "${esc(c.phone)}",` : ''}
  ${c.email ? `"email": "${esc(c.email)}",` : ''}
  "priceRange": "$$",
  ${c.reviews.length > 0 ? `"aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "${(c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length).toFixed(1)}",
    "reviewCount": "${c.reviews.length}",
    "bestRating": "5"
  },` : ''}
  "openingHoursSpecification": [${c.openingHours.map(h => `{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": "${esc(h.days)}",
    "opens": "${esc(h.hours.split(' ')[0] || '')}",
    "closes": "${esc(h.hours.split(' ').pop() || '')}"
  }`).join(',')}],
  "areaServed": ${(serviceArea.districts || []).length > 0 ? JSON.stringify(serviceArea.districts) : '"Berlin"'},
  "url": "${appUrl}${siteId ? `/s/${siteId}` : ''}"
}
</script>

<style>
  /* ========================================
     DESIGN TOKENS
     ======================================== */
  :root {
    --tiefblau:        ${esc(c.colors.primary)};
    --tiefblau-dark:   ${primaryDark};
    --tiefblau-light:  ${primaryLight};
    --tiefblau-soft:   ${primarySoft};
    --mint:            ${esc(c.colors.accent)};
    --mint-dark:       ${accentDark};
    --mint-soft:       ${accentSoft};
    --hell:            ${esc(c.colors.background)};
    --hell-tint:       ${bgTint};
    --hell-warm:       ${bgWarm};
    --text:            ${esc(c.colors.text)};
    --text-soft:       ${textSoft};
    --border:          ${borderColor};
    --font-display:    'Fraunces', Georgia, serif;
    --font-body:       'Inter Tight', -apple-system, sans-serif;
    --font-mono:       'JetBrains Mono', monospace;
    --max-w:           1200px;
    --radius:          12px;
    --radius-sm:       8px;
    --radius-lg:       20px;
    --shadow:          0 2px 12px ${hexToRgba(c.colors.primary, 0.08)};
    --shadow-lg:       0 8px 32px ${hexToRgba(c.colors.primary, 0.12)};
    --shadow-card:     0 4px 20px ${hexToRgba(c.colors.primary, 0.06)};
    --transition:      .3s cubic-bezier(.4,0,.2,1);
  }

  /* ========================================
     RESET & BASE
     ======================================== */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
  body {
    font-family: var(--font-body);
    color: var(--text);
    background: var(--hell);
    line-height: 1.65;
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  img { max-width: 100%; height: auto; display: block; }
  a { color: inherit; text-decoration: none; }
  button { cursor: pointer; font-family: inherit; }

  /* ========================================
     ANNOUNCEMENT BAR
     ======================================== */
  .announce-bar {
    background: var(--tiefblau);
    color: #fff;
    text-align: center;
    padding: 10px 20px;
    font-size: .82rem;
    font-weight: 500;
    letter-spacing: .02em;
  }
  .announce-bar a { color: var(--mint); text-decoration: underline; }

  /* ========================================
     NAVIGATION
     ======================================== */
  .nav {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: ${hexToRgba(c.colors.background, 0.92)};
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    transition: box-shadow var(--transition);
  }
  .nav.scrolled { box-shadow: var(--shadow); }
  .nav-inner {
    max-width: var(--max-w);
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    height: 68px;
  }
  .nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.15rem;
    color: var(--tiefblau);
  }
  .nav-brand .logo-mark {
    width: 40px;
    height: 40px;
    background: var(--tiefblau);
    color: #fff;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    font-weight: 800;
    font-family: var(--font-display);
  }
  .nav-links {
    display: flex;
    align-items: center;
    gap: 28px;
    list-style: none;
  }
  .nav-links a {
    font-size: .88rem;
    font-weight: 500;
    color: var(--text-soft);
    transition: color var(--transition);
    position: relative;
  }
  .nav-links a:hover { color: var(--tiefblau); }
  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--mint);
    transition: width var(--transition);
  }
  .nav-links a:hover::after { width: 100%; }
  .nav-cta {
    background: var(--tiefblau);
    color: #fff;
    padding: 10px 22px;
    border-radius: 50px;
    font-size: .85rem;
    font-weight: 600;
    border: none;
    transition: all var(--transition);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .nav-cta:hover { background: var(--mint); color: var(--tiefblau); transform: translateY(-1px); }
  .nav-toggle {
    display: none;
    background: none;
    border: none;
    width: 36px;
    height: 36px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }
  .nav-toggle span {
    display: block;
    width: 22px;
    height: 2px;
    background: var(--tiefblau);
    border-radius: 2px;
    transition: all var(--transition);
  }
  .nav-mobile {
    display: none;
    position: fixed;
    top: 68px;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--hell);
    z-index: 999;
    padding: 32px 24px;
    flex-direction: column;
    gap: 16px;
  }
  .nav-mobile.open { display: flex; }
  .nav-mobile a {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--tiefblau);
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
  }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    background: linear-gradient(160deg, var(--tiefblau) 0%, ${darkenHex(c.colors.primary, 0.35)} 100%);
    color: #fff;
    padding: 100px 24px 80px;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -60%;
    right: -20%;
    width: 70%;
    height: 160%;
    background: radial-gradient(ellipse, ${hexToRgba(c.colors.accent, 0.08)} 0%, transparent 70%);
    pointer-events: none;
  }
  .hero::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 80px;
    background: linear-gradient(to top, var(--hell), transparent);
    pointer-events: none;
  }
  .hero-inner {
    max-width: var(--max-w);
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${hexToRgba('#fff', 0.1)};
    border: 1px solid ${hexToRgba('#fff', 0.15)};
    border-radius: 50px;
    padding: 6px 16px;
    font-size: .78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .08em;
    margin-bottom: 24px;
    color: var(--mint);
  }
  .hero-tag svg { width: 14px; height: 14px; }
  .hero h1 {
    font-family: var(--font-display);
    font-size: clamp(2.2rem, 4.5vw, 3.6rem);
    font-weight: 800;
    line-height: 1.12;
    margin-bottom: 20px;
    letter-spacing: -.02em;
  }
  .hero h1 .accent { color: var(--mint); }
  .hero-lead {
    font-size: 1.15rem;
    line-height: 1.7;
    color: ${hexToRgba('#fff', 0.75)};
    margin-bottom: 32px;
    max-width: 520px;
  }
  .hero-actions {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }
  .btn-primary {
    background: var(--mint);
    color: var(--tiefblau);
    padding: 14px 32px;
    border-radius: 50px;
    font-size: .95rem;
    font-weight: 700;
    border: none;
    transition: all var(--transition);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
  }
  .btn-primary:hover { background: #fff; transform: translateY(-2px); box-shadow: 0 8px 24px ${hexToRgba(c.colors.accent, 0.3)}; }
  .btn-secondary {
    background: transparent;
    color: #fff;
    padding: 14px 32px;
    border-radius: 50px;
    font-size: .95rem;
    font-weight: 600;
    border: 1px solid ${hexToRgba('#fff', 0.25)};
    transition: all var(--transition);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn-secondary:hover { background: ${hexToRgba('#fff', 0.1)}; border-color: ${hexToRgba('#fff', 0.4)}; }
  .hero-visual {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hero-visual-box {
    width: 100%;
    aspect-ratio: 4/3;
    border-radius: var(--radius-lg);
    overflow: hidden;
    position: relative;
  }
  .hero-visual-box img { width: 100%; height: 100%; object-fit: cover; }
  .hero-visual-box .placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, ${hexToRgba(c.colors.accent, 0.15)}, ${hexToRgba(c.colors.accent, 0.05)});
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hero-visual-box .placeholder svg { width: 80px; height: 80px; stroke: var(--mint); opacity: .4; }
  .hero-stat-cards {
    position: absolute;
    bottom: -20px;
    left: -20px;
    right: -20px;
    display: flex;
    gap: 12px;
  }
  .hero-stat {
    flex: 1;
    background: ${hexToRgba('#fff', 0.12)};
    backdrop-filter: blur(12px);
    border: 1px solid ${hexToRgba('#fff', 0.15)};
    border-radius: var(--radius);
    padding: 14px 16px;
    text-align: center;
  }
  .hero-stat .num {
    font-family: var(--font-mono);
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--mint);
  }
  .hero-stat .label {
    font-size: .72rem;
    color: ${hexToRgba('#fff', 0.65)};
    margin-top: 2px;
  }

  /* ========================================
     TRUST BAR
     ======================================== */
  .trust-bar {
    background: #fff;
    border-bottom: 1px solid var(--border);
    padding: 28px 24px;
  }
  .trust-bar-inner {
    max-width: var(--max-w);
    margin: 0 auto;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 40px;
  }
  .trust-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: .85rem;
    font-weight: 600;
    color: var(--tiefblau);
  }
  .trust-badge svg { width: 36px; height: 36px; flex-shrink: 0; }
  .trust-sublabel {
    font-size: .72rem;
    font-weight: 400;
    color: var(--text-soft);
    display: block;
  }
  .trust-label { display: flex; flex-direction: column; }

  /* ========================================
     SECTION BASE
     ======================================== */
  .section {
    padding: 80px 24px;
  }
  .section-inner {
    max-width: var(--max-w);
    margin: 0 auto;
  }
  .section-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: .75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .1em;
    color: var(--mint-dark);
    margin-bottom: 12px;
  }
  .section-label::before {
    content: '';
    width: 24px;
    height: 2px;
    background: var(--mint);
    border-radius: 2px;
  }
  .section-title {
    font-family: var(--font-display);
    font-size: clamp(1.8rem, 3.2vw, 2.6rem);
    font-weight: 800;
    color: var(--tiefblau);
    line-height: 1.15;
    margin-bottom: 12px;
    letter-spacing: -.01em;
  }
  .section-subtitle {
    font-size: 1.05rem;
    color: var(--text-soft);
    max-width: 600px;
    line-height: 1.65;
    margin-bottom: 48px;
  }
  .section-bg { background: var(--hell-tint); }
  .section-dark {
    background: var(--tiefblau);
    color: #fff;
  }

  /* ========================================
     SERVICE GRID
     ======================================== */
  .services-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .service-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 32px 28px;
    transition: all var(--transition);
    position: relative;
    overflow: hidden;
  }
  .service-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--mint);
    transform: scaleX(0);
    transition: transform var(--transition);
    transform-origin: left;
  }
  .service-card:hover::before { transform: scaleX(1); }
  .service-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-4px); border-color: var(--mint); }
  .service-icon {
    width: 56px;
    height: 56px;
    margin-bottom: 18px;
    color: var(--tiefblau);
  }
  .service-icon svg { width: 100%; height: 100%; }
  .service-card h3 {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--tiefblau);
    margin-bottom: 8px;
  }
  .service-card p {
    font-size: .9rem;
    color: var(--text-soft);
    line-height: 1.6;
    margin-bottom: 12px;
  }
  .service-price {
    font-size: .82rem;
    color: var(--mint-dark);
    font-weight: 600;
    font-family: var(--font-mono);
  }

  /* ========================================
     CALCULATOR
     ======================================== */
  .calculator-wrap {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 48px;
    box-shadow: var(--shadow-card);
    max-width: 700px;
    margin: 0 auto;
  }
  .calc-header {
    text-align: center;
    margin-bottom: 36px;
  }
  .calc-header h3 {
    font-family: var(--font-display);
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--tiefblau);
    margin-bottom: 6px;
  }
  .calc-header p {
    font-size: .9rem;
    color: var(--text-soft);
  }
  .calc-row {
    margin-bottom: 24px;
  }
  .calc-row label {
    display: block;
    font-size: .85rem;
    font-weight: 600;
    color: var(--tiefblau);
    margin-bottom: 8px;
  }
  .calc-slider {
    width: 100%;
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    border-radius: 3px;
    background: var(--border);
    outline: none;
    margin-bottom: 8px;
  }
  .calc-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--mint);
    border: 3px solid var(--tiefblau);
    cursor: pointer;
    transition: all var(--transition);
  }
  .calc-slider::-webkit-slider-thumb:hover { transform: scale(1.15); box-shadow: 0 0 0 6px ${hexToRgba(c.colors.accent, 0.2)}; }
  .calc-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--mint);
    border: 3px solid var(--tiefblau);
    cursor: pointer;
  }
  .calc-value {
    display: flex;
    justify-content: space-between;
    font-size: .82rem;
    color: var(--text-soft);
  }
  .calc-value .current {
    font-family: var(--font-mono);
    font-weight: 700;
    color: var(--tiefblau);
    font-size: .95rem;
  }
  .calc-select {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: .9rem;
    color: var(--text);
    background: var(--hell);
    outline: none;
    transition: border-color var(--transition);
  }
  .calc-select:focus { border-color: var(--mint); }
  .calc-result {
    background: var(--tiefblau);
    border-radius: var(--radius);
    padding: 28px;
    text-align: center;
    margin-top: 24px;
    color: #fff;
  }
  .calc-result .price-label {
    font-size: .82rem;
    color: ${hexToRgba('#fff', 0.6)};
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: .08em;
  }
  .calc-result .price-value {
    font-family: var(--font-mono);
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--mint);
  }
  .calc-result .price-note {
    font-size: .78rem;
    color: ${hexToRgba('#fff', 0.5)};
    margin-top: 6px;
  }
  .calc-cta {
    display: block;
    width: 100%;
    text-align: center;
    margin-top: 20px;
    background: var(--mint);
    color: var(--tiefblau);
    font-weight: 700;
    padding: 14px;
    border-radius: 50px;
    border: none;
    font-size: .95rem;
    transition: all var(--transition);
    text-decoration: none;
  }
  .calc-cta:hover { background: var(--tiefblau); color: #fff; }

  /* ========================================
     BEFORE / AFTER
     ======================================== */
  .ba-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }
  .ba-item {
    background: #fff;
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .ba-label {
    padding: 16px 20px;
    font-weight: 700;
    font-size: .9rem;
    color: var(--tiefblau);
    font-family: var(--font-display);
  }
  .ba-panels { display: grid; grid-template-columns: 1fr 1fr; }
  .ba-panel {
    aspect-ratio: 4/3;
    position: relative;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 12px;
  }
  .ba-tag {
    background: ${hexToRgba(c.colors.primary, 0.85)};
    color: #fff;
    padding: 4px 12px;
    border-radius: 50px;
    font-size: .72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .06em;
  }

  /* ========================================
     REFERENCES
     ======================================== */
  .ref-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
  }
  .ref-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 28px;
    transition: all var(--transition);
  }
  .ref-card:hover { box-shadow: var(--shadow-lg); border-color: var(--mint); }
  .ref-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
  }
  .ref-logo { width: 48px; height: 48px; object-fit: contain; border-radius: var(--radius-sm); }
  .ref-logo-placeholder {
    width: 48px;
    height: 48px;
    background: var(--tiefblau);
    color: #fff;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.2rem;
  }
  .ref-header h4 {
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--tiefblau);
  }
  .ref-industry {
    font-size: .78rem;
    color: var(--mint-dark);
    font-weight: 500;
  }
  .ref-quote {
    font-size: .9rem;
    color: var(--text-soft);
    line-height: 1.65;
    font-style: italic;
    margin-bottom: 10px;
  }
  .ref-contact {
    font-size: .8rem;
    color: var(--text-soft);
    font-weight: 500;
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }
  .review-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 28px;
    transition: all var(--transition);
  }
  .review-card:hover { box-shadow: var(--shadow-lg); }
  .review-stars {
    display: flex;
    gap: 3px;
    color: #f5a623;
    margin-bottom: 14px;
  }
  .review-stars svg { width: 18px; height: 18px; }
  .review-text {
    font-size: .95rem;
    color: var(--text);
    line-height: 1.65;
    margin-bottom: 18px;
  }
  .review-author {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .review-avatar {
    width: 40px;
    height: 40px;
    background: var(--tiefblau);
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: .78rem;
    font-weight: 700;
    font-family: var(--font-mono);
  }
  .review-name {
    font-size: .88rem;
    font-weight: 600;
    color: var(--tiefblau);
  }
  .review-company {
    font-size: .75rem;
    color: var(--text-soft);
  }

  /* ========================================
     SERVICE AREA MAP
     ======================================== */
  .map-wrap {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: start;
  }
  .map-embed {
    width: 100%;
    aspect-ratio: 4/3;
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--hell-tint);
  }
  .map-embed iframe { width: 100%; height: 100%; border: 0; }
  .map-embed .map-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, ${hexToRgba(c.colors.primary, 0.05)}, ${hexToRgba(c.colors.accent, 0.08)});
    color: var(--text-soft);
    font-size: .9rem;
  }
  .district-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 20px;
  }
  .district-tag {
    background: var(--tiefblau-soft);
    color: var(--tiefblau);
    padding: 6px 14px;
    border-radius: 50px;
    font-size: .8rem;
    font-weight: 500;
    border: 1px solid ${hexToRgba(c.colors.primary, 0.1)};
    transition: all var(--transition);
  }
  .district-tag:hover { background: var(--mint-soft); border-color: var(--mint); }
  .map-info h3 {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--tiefblau);
    margin-bottom: 12px;
  }
  .map-info p {
    font-size: .92rem;
    color: var(--text-soft);
    line-height: 1.65;
    margin-bottom: 16px;
  }

  /* ========================================
     FAQ
     ======================================== */
  .faq-list { max-width: 760px; margin: 0 auto; }
  .faq-item {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 10px;
    background: #fff;
    overflow: hidden;
    transition: all var(--transition);
  }
  .faq-item.open { border-color: var(--mint); box-shadow: 0 2px 12px ${hexToRgba(c.colors.accent, 0.1)}; }
  .faq-q {
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 18px 24px;
    font-size: .95rem;
    font-weight: 600;
    color: var(--tiefblau);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all var(--transition);
  }
  .faq-q:hover { color: var(--mint-dark); }
  .faq-icon {
    font-size: 1.3rem;
    font-weight: 300;
    color: var(--mint);
    transition: transform var(--transition);
  }
  .faq-item.open .faq-icon { transform: rotate(45deg); }
  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height .4s ease, padding .3s ease;
    padding: 0 24px;
    font-size: .9rem;
    color: var(--text-soft);
    line-height: 1.7;
  }
  .faq-item.open .faq-a { max-height: 300px; padding: 0 24px 20px; }

  /* ========================================
     CONTACT / CTA FORM
     ======================================== */
  .contact-section {
    background: var(--tiefblau);
    color: #fff;
    padding: 80px 24px;
  }
  .contact-inner {
    max-width: var(--max-w);
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 60px;
    align-items: start;
  }
  .contact-info .section-label { color: var(--mint); }
  .contact-info .section-label::before { background: var(--mint); }
  .contact-info .section-title { color: #fff; }
  .contact-info .section-subtitle { color: ${hexToRgba('#fff', 0.65)}; margin-bottom: 32px; }
  .contact-details {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 28px;
  }
  .contact-detail {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: .92rem;
    color: ${hexToRgba('#fff', 0.8)};
  }
  .contact-detail svg { width: 20px; height: 20px; stroke: var(--mint); flex-shrink: 0; }
  .contact-hours {
    background: ${hexToRgba('#fff', 0.06)};
    border: 1px solid ${hexToRgba('#fff', 0.1)};
    border-radius: var(--radius);
    padding: 20px;
  }
  .contact-hours h4 {
    font-size: .85rem;
    font-weight: 700;
    color: var(--mint);
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: .06em;
  }
  .hours-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    font-size: .85rem;
    color: ${hexToRgba('#fff', 0.7)};
  }
  .hours-time { font-family: var(--font-mono); font-weight: 500; color: #fff; }
  .contact-form-wrap {
    background: ${hexToRgba('#fff', 0.06)};
    border: 1px solid ${hexToRgba('#fff', 0.1)};
    border-radius: var(--radius-lg);
    padding: 36px;
  }
  .contact-form-wrap h3 {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 24px;
  }
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .form-group label {
    display: block;
    font-size: .8rem;
    font-weight: 600;
    color: ${hexToRgba('#fff', 0.7)};
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: .04em;
  }
  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 12px 16px;
    background: ${hexToRgba('#fff', 0.08)};
    border: 1px solid ${hexToRgba('#fff', 0.15)};
    border-radius: var(--radius-sm);
    color: #fff;
    font-family: var(--font-body);
    font-size: .9rem;
    outline: none;
    transition: border-color var(--transition);
  }
  .form-group input::placeholder,
  .form-group textarea::placeholder {
    color: ${hexToRgba('#fff', 0.35)};
  }
  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus { border-color: var(--mint); }
  .form-group select option { background: var(--tiefblau); color: #fff; }
  .form-group.full { grid-column: 1 / -1; }
  .form-submit {
    grid-column: 1 / -1;
    margin-top: 8px;
  }
  .form-submit button {
    width: 100%;
    padding: 14px;
    background: var(--mint);
    color: var(--tiefblau);
    border: none;
    border-radius: 50px;
    font-size: .95rem;
    font-weight: 700;
    transition: all var(--transition);
  }
  .form-submit button:hover { background: #fff; }
  .form-submit button:disabled { opacity: .6; cursor: not-allowed; }

  /* ========================================
     CTA SECTION (above footer)
     ======================================== */
  .cta-banner {
    background: linear-gradient(135deg, var(--mint), ${darkenHex(c.colors.accent, 0.15)});
    padding: 64px 24px;
    text-align: center;
  }
  .cta-banner-inner {
    max-width: 700px;
    margin: 0 auto;
  }
  .cta-banner h2 {
    font-family: var(--font-display);
    font-size: clamp(1.6rem, 2.8vw, 2.2rem);
    font-weight: 800;
    color: var(--tiefblau);
    margin-bottom: 12px;
  }
  .cta-banner p {
    font-size: 1.05rem;
    color: ${hexToRgba(c.colors.primary, 0.7)};
    margin-bottom: 28px;
  }
  .cta-features {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 32px;
  }
  .cta-feature {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: .85rem;
    font-weight: 600;
    color: var(--tiefblau);
  }
  .cta-feature svg { width: 18px; height: 18px; }

  /* ========================================
     FOOTER
     ======================================== */
  .footer {
    background: var(--tiefblau);
    color: ${hexToRgba('#fff', 0.7)};
    padding: 60px 24px 32px;
  }
  .footer-inner {
    max-width: var(--max-w);
    margin: 0 auto;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
  }
  .footer-brand {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .footer-brand .brand-name {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 700;
    color: #fff;
  }
  .footer-brand p {
    font-size: .85rem;
    line-height: 1.6;
    max-width: 280px;
  }
  .footer-col h4 {
    font-size: .78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: ${hexToRgba('#fff', 0.4)};
    margin-bottom: 16px;
  }
  .footer-col a {
    display: block;
    font-size: .88rem;
    color: ${hexToRgba('#fff', 0.65)};
    padding: 4px 0;
    transition: color var(--transition);
  }
  .footer-col a:hover { color: var(--mint); }
  .footer-bottom {
    border-top: 1px solid ${hexToRgba('#fff', 0.1)};
    padding-top: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    font-size: .78rem;
    color: ${hexToRgba('#fff', 0.4)};
  }
  .footer-legal a {
    color: ${hexToRgba('#fff', 0.4)};
    transition: color var(--transition);
  }
  .footer-legal a:hover { color: var(--mint); }

  /* ========================================
     MOBILE CTA BAR
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9998;
    background: var(--tiefblau);
    padding: 12px 20px;
    box-shadow: 0 -4px 20px ${hexToRgba(c.colors.primary, 0.2)};
  }
  .mobile-cta a {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--mint);
    color: var(--tiefblau);
    padding: 14px;
    border-radius: 50px;
    font-weight: 700;
    font-size: .95rem;
    text-decoration: none;
  }

  /* ========================================
     RESPONSIVE 1024px
     ======================================== */
  @media (max-width: 1024px) {
    .hero-inner { grid-template-columns: 1fr; gap: 40px; }
    .hero-visual { order: -1; }
    .hero-stat-cards { position: relative; bottom: auto; left: auto; right: auto; margin-top: 16px; }
    .services-grid { grid-template-columns: repeat(2, 1fr); }
    .contact-inner { grid-template-columns: 1fr; gap: 40px; }
    .map-wrap { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
  }

  /* ========================================
     RESPONSIVE 768px
     ======================================== */
  @media (max-width: 768px) {
    .nav-links { display: none; }
    .nav-cta-desktop { display: none; }
    .nav-toggle { display: flex; }
    .hero { padding: 60px 20px 50px; }
    .hero h1 { font-size: 1.9rem; }
    .hero-lead { font-size: 1rem; }
    .hero-stat-cards { flex-direction: column; gap: 8px; }
    .hero-stat { padding: 10px 12px; }
    .trust-bar-inner { gap: 20px; }
    .trust-badge { font-size: .78rem; }
    .trust-badge svg { width: 28px; height: 28px; }
    .section { padding: 56px 20px; }
    .services-grid { grid-template-columns: 1fr; }
    .calculator-wrap { padding: 28px 20px; }
    .ba-grid { grid-template-columns: 1fr; }
    .ref-grid { grid-template-columns: 1fr; }
    .reviews-grid { grid-template-columns: 1fr; }
    .form-grid { grid-template-columns: 1fr; }
    .cta-features { flex-direction: column; align-items: center; }
    .footer-grid { grid-template-columns: 1fr; gap: 28px; }
    .footer-bottom { flex-direction: column; text-align: center; }
    .mobile-cta { display: block; }
    body { padding-bottom: 72px; }
  }

  /* ========================================
     ANIMATIONS
     ======================================== */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-in {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity .6s ease, transform .6s ease;
  }
  .animate-in.visible {
    opacity: 1;
    transform: translateY(0);
  }
</style>
</head>
<body>

<!-- ==========================================
     ANNOUNCEMENT BAR
     ========================================== -->
${c.announceText ? `<div class="announce-bar">${c.announceText}</div>` : ''}

<!-- ==========================================
     NAVIGATION
     ========================================== -->
<nav class="nav" id="main-nav">
  <div class="nav-inner">
    <a href="#" class="nav-brand">
      <div class="logo-mark">${logoInitial}</div>
      ${esc(c.businessName)}
    </a>
    <ul class="nav-links">
      ${navLinks.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join('\n      ')}
    </ul>
    <a href="#contact" class="nav-cta nav-cta-desktop">${esc(c.ctaText)}
      <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 10h10M11 6l4 4-4 4"/></svg>
    </a>
    <button class="nav-toggle" id="nav-toggle" aria-label="Men&uuml;">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
<div class="nav-mobile" id="nav-mobile">
  ${navLinks.map(l => `<a href="${l.href}">${l.label}</a>`).join('\n  ')}
  <a href="#contact" class="btn-primary" style="margin-top:12px;text-align:center;justify-content:center">${esc(c.ctaText)}</a>
</div>

<!-- ==========================================
     HERO
     ========================================== -->
<section class="hero" id="hero">
  <div class="hero-inner">
    <div class="hero-content">
      <div class="hero-tag">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2L13 8L20 9L15 14L16 20L10 17L4 20L5 14L0 9L7 8Z"/></svg>
        ${esc(c.heroTag)}
      </div>
      <h1>${esc(c.heroHeadline)} <span class="accent">${esc(c.heroAccent)}</span></h1>
      <p class="hero-lead">${esc(c.heroLead)}</p>
      <div class="hero-actions">
        <a href="#contact" class="btn-primary">${esc(c.ctaText)}
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 10h10M11 6l4 4-4 4"/></svg>
        </a>
        <a href="#calculator" class="btn-secondary">
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 7h6M7 10h6M7 13h4"/></svg>
          Preis berechnen
        </a>
      </div>
    </div>
    <div class="hero-visual">
      <div class="hero-visual-box">
        ${c.heroImageUrl ? `<img src="${esc(c.heroImageUrl)}" alt="${esc(c.businessName)} - ${esc(c.tagline)}" loading="eager">` : `<div class="placeholder"><svg viewBox="0 0 80 80" fill="none" stroke-width="1.5"><rect x="10" y="16" width="60" height="48" rx="4" stroke="currentColor"/><path d="M10 50l18-14 12 10 16-18 14 16" stroke="currentColor"/><circle cx="28" cy="30" r="5" stroke="currentColor"/></svg></div>`}
      </div>
      <div class="hero-stat-cards">
        <div class="hero-stat">
          <div class="num">500+</div>
          <div class="label">Zufriedene Kunden</div>
        </div>
        <div class="hero-stat">
          <div class="num">DIN ISO</div>
          <div class="label">Zertifiziert</div>
        </div>
        <div class="hero-stat">
          <div class="num">24h</div>
          <div class="label">Notfall-Service</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ==========================================
     TRUST BAR
     ========================================== -->
<div class="trust-bar">
  <div class="trust-bar-inner">
    ${trustBadgesHtml}
  </div>
</div>

<!-- ==========================================
     SERVICES GRID
     ========================================== -->
<section class="section" id="services">
  <div class="section-inner">
    <div class="section-label">Leistungen</div>
    <h2 class="section-title">Professionelle Reinigung f&uuml;r Ihr Unternehmen</h2>
    <p class="section-subtitle">Von der regelm&auml;&szlig;igen Unterhaltsreinigung bis zur spezialisierten Desinfektion &ndash; wir bieten ma&szlig;geschneiderte L&ouml;sungen f&uuml;r jeden Bedarf.</p>
    <div class="services-grid animate-in">
      ${servicesHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     FESTPREIS-KALKULATOR
     ========================================== -->
<section class="section section-bg" id="calculator">
  <div class="section-inner">
    <div style="text-align:center;margin-bottom:40px">
      <div class="section-label" style="justify-content:center">Kalkulator</div>
      <h2 class="section-title" style="text-align:center">${esc(c.calculatorTitle || 'Festpreis-Kalkulator')}</h2>
      <p class="section-subtitle" style="text-align:center;margin:0 auto 0">${esc(c.calculatorSubtitle || 'Berechnen Sie Ihren individuellen m\u00b2-Preis in Sekunden.')}</p>
    </div>
    <div class="calculator-wrap animate-in">
      <div class="calc-row">
        <label>B&uuml;rofl&auml;che (m&sup2;)</label>
        <input type="range" class="calc-slider" id="calc-area" min="${calcMin}" max="${calcMax}" value="${Math.round((calcMin + calcMax) / 2)}" step="10">
        <div class="calc-value">
          <span>${calcMin} m&sup2;</span>
          <span class="current" id="calc-area-val">${Math.round((calcMin + calcMax) / 2)} m&sup2;</span>
          <span>${calcMax} m&sup2;</span>
        </div>
      </div>
      <div class="calc-row">
        <label>Reinigungsart</label>
        <select class="calc-select" id="calc-type">
          <option value="1">Unterhaltsreinigung (t&auml;glich)</option>
          <option value="1.4">Unterhaltsreinigung (2x w&ouml;chentlich)</option>
          <option value="2.5">Grundreinigung (einmalig)</option>
          <option value="1.8">Glasreinigung</option>
          <option value="3">Teppichreinigung</option>
          <option value="4">Baureinigung / Bauschluss</option>
          <option value="3.5">Desinfektion</option>
        </select>
      </div>
      <div class="calc-row">
        <label>H&auml;ufigkeit</label>
        <select class="calc-select" id="calc-freq">
          <option value="20">T&auml;glich (Mo-Fr)</option>
          <option value="8">2x w&ouml;chentlich</option>
          <option value="4">1x w&ouml;chentlich</option>
          <option value="2">Alle 2 Wochen</option>
          <option value="1" selected>Einmalig</option>
        </select>
      </div>
      <div class="calc-result">
        <div class="price-label">Gesch&auml;tzter Preis</div>
        <div class="price-value" id="calc-price">&mdash;</div>
        <div class="price-note">* Unverbindliche Sch&auml;tzung. Endpreis nach kostenloser Erstbegehung.</div>
      </div>
      <a href="#contact" class="calc-cta">Kostenloses Angebot anfordern</a>
    </div>
  </div>
</section>

<!-- ==========================================
     VORHER / NACHHER
     ========================================== -->
${beforeAfterItems.length > 0 ? `
<section class="section" id="before-after">
  <div class="section-inner">
    <div class="section-label">Ergebnisse</div>
    <h2 class="section-title">Vorher &amp; Nachher</h2>
    <p class="section-subtitle">Unsere Arbeit spricht f&uuml;r sich. &Uuml;berzeugen Sie sich selbst von der Qualit&auml;t unserer Reinigung.</p>
    <div class="ba-grid animate-in">
      ${beforeAfterHtml}
    </div>
  </div>
</section>
` : ''}

<!-- ==========================================
     B2B REFERENZEN
     ========================================== -->
<section class="section section-bg" id="references">
  <div class="section-inner">
    <div class="section-label">Referenzen</div>
    <h2 class="section-title">Vertrauen namhafter Unternehmen</h2>
    <p class="section-subtitle">Unsere Kunden sch&auml;tzen Zuverl&auml;ssigkeit, Qualit&auml;t und transparente Festpreise.</p>
    <div class="ref-grid animate-in">
      ${referencesHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     BEWERTUNGEN
     ========================================== -->
<section class="section" id="reviews">
  <div class="section-inner">
    <div class="section-label">Bewertungen</div>
    <h2 class="section-title">Das sagen unsere Kunden</h2>
    <p class="section-subtitle">${c.reviews.length > 0 ? `${(c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length).toFixed(1)} von 5 Sternen &ndash; basierend auf ${c.reviews.length} Bewertungen` : 'Kundenzufriedenheit ist unser oberstes Ziel.'}</p>
    <div class="reviews-grid animate-in">
      ${reviewsHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     SERVICE-GEBIET MAP
     ========================================== -->
<section class="section section-bg" id="service-area">
  <div class="section-inner">
    <div class="section-label">Einsatzgebiet</div>
    <h2 class="section-title">${esc(serviceArea.title || 'Unser Service-Gebiet')}</h2>
    <p class="section-subtitle">${esc(serviceArea.subtitle || 'Wir sind in allen Bezirken und im Umland verf\u00fcgbar.')}</p>
    <div class="map-wrap animate-in">
      <div class="map-embed">
        ${serviceArea.mapEmbedUrl ? `<iframe src="${esc(serviceArea.mapEmbedUrl)}" loading="lazy" allowfullscreen title="Karte Einsatzgebiet"></iframe>` : '<div class="map-placeholder"><svg viewBox="0 0 64 64" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M32 8C22 8 14 16 14 26c0 14 18 30 18 30s18-16 18-30C50 16 42 8 32 8z"/><circle cx="32" cy="26" r="6"/></svg></div>'}
      </div>
      <div class="map-info">
        <h3>${esc(serviceArea.title || 'Fl\u00e4chendeckend verf\u00fcgbar')}</h3>
        <p>Ob Innenstadt oder Umland &ndash; unsere Teams sind mobil und flexibel einsetzbar. Professionelle Ausstattung mit K&auml;rcher- und Ecolab-Systemen geh&ouml;rt zum Standard.</p>
        ${(serviceArea.districts || []).length > 0 ? `
        <div class="district-tags">
          ${districtsHtml}
        </div>` : ''}
        <div class="contact-hours" style="margin-top:24px">
          <h4>&Ouml;ffnungszeiten</h4>
          ${hoursHtml}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ==========================================
     FAQ
     ========================================== -->
${(c.faqItems || []).length > 0 ? `
<section class="section" id="faq">
  <div class="section-inner">
    <div style="text-align:center;margin-bottom:40px">
      <div class="section-label" style="justify-content:center">FAQ</div>
      <h2 class="section-title" style="text-align:center">H&auml;ufig gestellte Fragen</h2>
      <p class="section-subtitle" style="text-align:center;margin:0 auto">Antworten auf die wichtigsten Fragen rund um unsere Reinigungsleistungen.</p>
    </div>
    <div class="faq-list animate-in">
      ${faqHtml}
    </div>
  </div>
</section>
` : ''}

<!-- ==========================================
     CONTACT WITH FORM
     ========================================== -->
<section class="contact-section" id="contact">
  <div class="contact-inner">
    <div class="contact-info">
      <div class="section-label">Kontakt</div>
      <h2 class="section-title">${esc(c.contactFormTitle || 'Jetzt unverbindlich anfragen')}</h2>
      <p class="section-subtitle">${esc(c.contactFormSubtitle || 'Wir erstellen Ihnen innerhalb von 24 Stunden ein individuelles Angebot mit Festpreisgarantie.')}</p>
      <div class="contact-details">
        ${c.phone ? `<div class="contact-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg><a href="tel:${esc(c.phone)}">${esc(c.phone)}</a></div>` : ''}
        ${c.email ? `<div class="contact-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>` : ''}
        ${c.address ? `<div class="contact-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${esc(c.address)}${c.postalCode ? ', ' + esc(c.postalCode) : ''} ${esc(c.city || '')}</div>` : ''}
      </div>
      <div class="contact-hours">
        <h4>Erreichbarkeit</h4>
        ${hoursHtml}
      </div>
    </div>
    <div class="contact-form-wrap">
      <h3>${esc(c.contactFormTitle || 'Kostenloses Angebot anfordern')}</h3>
      <form id="contact-form">
        <div class="form-grid">
          ${contactFieldsHtml}
          <div class="form-submit">
            <button type="submit" id="contact-submit">${esc(c.ctaText || 'Angebot anfordern')}</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</section>

<!-- ==========================================
     CTA BANNER
     ========================================== -->
<section class="cta-banner">
  <div class="cta-banner-inner">
    <h2>${esc(c.ctaSectionTitle || 'Bereit f\u00fcr makellose Sauberkeit?')}</h2>
    <p>${esc(c.ctaSectionSubtitle || 'Fordern Sie jetzt Ihr individuelles Angebot an \u2013 kostenlos und unverbindlich.')}</p>
    <div class="cta-features">
      ${ctaFeaturesHtml}
    </div>
    <a href="#contact" class="btn-primary" style="background:var(--tiefblau);color:#fff">
      ${esc(c.ctaText || 'Angebot anfordern')}
      <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 10h10M11 6l4 4-4 4"/></svg>
    </a>
  </div>
</section>

<!-- ==========================================
     FOOTER
     ========================================== -->
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="brand-name">${esc(c.businessName)}</div>
        <p>${esc(c.footerText || c.tagline)}</p>
        ${c.certifications && c.certifications.length > 0 ? `
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">
          ${c.certifications.map(cert => `<span style="background:${hexToRgba('#fff', 0.08)};border:1px solid ${hexToRgba('#fff', 0.12)};border-radius:50px;padding:3px 10px;font-size:.7rem;color:var(--mint);font-weight:500">${esc(cert)}</span>`).join('\n          ')}
        </div>` : ''}
      </div>
      ${footerColumnsHtml}
    </div>
    <div class="footer-bottom">
      <span>&copy; ${new Date().getFullYear()} ${esc(c.businessName)}. Alle Rechte vorbehalten.</span>
      <div class="footer-legal">
        <a href="${esc(c.imprintUrl || '#')}">Impressum</a> &middot;
        <a href="${esc(c.privacyUrl || '#')}">Datenschutz</a>
      </div>
    </div>
  </div>
</footer>

<!-- ==========================================
     MOBILE CTA
     ========================================== -->
<div class="mobile-cta">
  <a href="${esc(mobileCta.href)}">
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 10h10M11 6l4 4-4 4"/></svg>
    ${esc(mobileCta.text)}
  </a>
</div>

<!-- ==========================================
     SCRIPTS
     ========================================== -->
<script>
  /* Navigation scroll effect */
  (function() {
    var nav = document.getElementById('main-nav');
    window.addEventListener('scroll', function() {
      if (window.scrollY > 20) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    });
  })();

  /* Mobile nav toggle */
  (function() {
    var toggle = document.getElementById('nav-toggle');
    var mobile = document.getElementById('nav-mobile');
    if (toggle && mobile) {
      toggle.addEventListener('click', function() {
        mobile.classList.toggle('open');
      });
      mobile.querySelectorAll('a').forEach(function(a) {
        a.addEventListener('click', function() { mobile.classList.remove('open'); });
      });
    }
  })();

  /* Calculator logic */
  (function() {
    var areaSlider = document.getElementById('calc-area');
    var areaVal = document.getElementById('calc-area-val');
    var typeSelect = document.getElementById('calc-type');
    var freqSelect = document.getElementById('calc-freq');
    var priceEl = document.getElementById('calc-price');
    var basePrice = ${calcBasePrice};
    function calc() {
      var area = parseInt(areaSlider.value);
      var typeFactor = parseFloat(typeSelect.value);
      var freq = parseInt(freqSelect.value);
      areaVal.textContent = area + ' m\\u00b2';
      var total = area * basePrice * typeFactor * (freq > 1 ? freq * 0.85 : 1);
      if (freq > 1) {
        priceEl.textContent = total.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.') + ' \\u20ac / Monat';
      } else {
        priceEl.textContent = total.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.') + ' \\u20ac';
      }
    }
    areaSlider.addEventListener('input', calc);
    typeSelect.addEventListener('change', calc);
    freqSelect.addEventListener('change', calc);
    calc();
  })();

  /* FAQ accordion */
  document.querySelectorAll('.faq-q').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item = btn.closest('.faq-item');
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function(x) {
        x.classList.remove('open');
        x.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* Scroll animations (IntersectionObserver) */
  (function() {
    var els = document.querySelectorAll('.animate-in');
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });
      els.forEach(function(el) { obs.observe(el); });
    } else {
      els.forEach(function(el) { el.classList.add('visible'); });
    }
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
        if (!data.name || !data.email) { alert('Ansprechpartner und E-Mail sind Pflichtfelder.'); return; }
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
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:#fff;font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:${hexToRgba('#fff', 0.7)};font-size:1.05rem">Wir erstellen Ihr Angebot und melden uns innerhalb von 24 Stunden.</p></div>';
          } else {
            alert(d.error || 'Fehler beim Senden');
            btn.textContent = '${esc(c.ctaText || 'Angebot anfordern')}';
            btn.disabled = false;
          }
        })
        .catch(function() {
          alert('Verbindungsfehler');
          btn.textContent = '${esc(c.ctaText || 'Angebot anfordern')}';
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
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba(c.colors.primary, 0.97)};backdrop-filter:blur(12px);color:#fff;padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:${hexToRgba('#fff', 0.8)}">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--mint);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--mint);color:var(--tiefblau);border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
