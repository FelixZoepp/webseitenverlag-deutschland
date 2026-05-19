export interface AnwaltFamilieConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string    // Bordeaux #5a2030
    accent: string     // Sand #d8c8a8
    background: string // Cream #faf5ee
    text: string       // Dark text
  }
  phone?: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  openingHours: { days: string; hours: string }[]
  fachgebiete: {
    name: string
    description: string
    icon?: string
    keywords?: string[]
  }[]
  ablaufSchritte: {
    step: string
    title: string
    description: string
  }[]
  team: {
    name: string
    role: string
    specialties: string[]
    description?: string
    imageUrl?: string
  }[]
  reviews: { text: string; name: string; source: string; rating: number }[]
  erreichbarkeit?: {
    title?: string
    subtitle?: string
    diskretionHinweis?: string
    details?: { icon: string; label: string; value: string }[]
  }
  standort?: {
    title?: string
    subtitle?: string
    mapEmbedUrl?: string
    anfahrtDetails?: string
  }
  faqItems?: { question: string; answer: string }[]
  heroImageUrl?: string
  aboutTitle?: string
  aboutText?: string
  aboutText2?: string
  aboutStats?: { value: string; label: string }[]
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

export function renderAnwaltFamilieTemplate(config: AnwaltFamilieConfig, siteId?: string): string {
  const c = config
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Derived color values
  const primaryDark = darkenHex(c.colors.primary, 0.25)
  const primaryLight = tintHex(c.colors.primary, 0.85)
  const primarySoft = hexToRgba(c.colors.primary, 0.08)
  const accentDark = darkenHex(c.colors.accent, 0.2)
  const accentSoft = hexToRgba(c.colors.accent, 0.15)
  const bgTint = tintHex(c.colors.background, -0.03)
  const bgWarm = tintHex(c.colors.background, -0.06)
  const textSoft = tintHex(c.colors.text, 0.45)
  const borderColor = tintHex(c.colors.background, -0.1)

  const logoInitial = esc(c.businessName.charAt(0))

  // Fachgebiete icons
  const fachgebietIconMap: Record<string, string> = {
    scheidung: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M24 8v32"/><path d="M12 16c0-4 4-8 12-8s12 4 12 8"/><path d="M8 24h12M28 24h12"/><path d="M10 32c2-3 6-4 10-4M28 32c2-3 6-4 10-4" opacity="0.5"/></svg>',
    unterhalt: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="24" cy="24" r="16"/><path d="M24 14v20"/><path d="M18 20h12"/><path d="M20 28h8" opacity="0.6"/><circle cx="24" cy="24" r="6" opacity="0.2" fill="currentColor"/></svg>',
    sorgerecht: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="24" cy="14" r="6"/><path d="M14 38v-6c0-6 4-10 10-10s10 4 10 10v6"/><circle cx="14" cy="18" r="4" opacity="0.5"/><circle cx="34" cy="18" r="4" opacity="0.5"/></svg>',
    erbrecht: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="10" y="8" width="28" height="32" rx="3"/><path d="M18 16h12M18 22h12M18 28h8"/><path d="M10 8l4-4h20l4 4" opacity="0.4"/><circle cx="36" cy="36" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M34 36h4M36 34v4" opacity="0.6"/></svg>',
    ehevertrag: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="6" width="32" height="36" rx="3"/><path d="M16 18h16M16 24h16M16 30h10"/><path d="M22 36l4 4 8-8" stroke-width="2.5" opacity="0.7"/></svg>',
    mediation: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="14" cy="20" r="6"/><circle cx="34" cy="20" r="6"/><path d="M24 12v24"/><path d="M18 30c2 4 4 6 6 6s4-2 6-6"/><path d="M14 28c-4 2-6 6-6 10h32c0-4-2-8-6-10" opacity="0.3"/></svg>',
    umgangsrecht: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="14" r="5"/><circle cx="30" cy="20" r="4" opacity="0.6"/><path d="M10 38v-6c0-5 3-8 8-8h4"/><path d="M28 38v-4c0-4 2-6 6-6" opacity="0.6"/><path d="M22 26l4 2-4 2" fill="currentColor" opacity="0.4"/></svg>',
    versorgungsausgleich: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="24" cy="24" r="16"/><path d="M16 24h16"/><path d="M24 16v16"/><path d="M18 18l12 12M30 18l-12 12" opacity="0.25"/><circle cx="24" cy="24" r="8" opacity="0.15" fill="currentColor"/></svg>',
    trennungsjahr: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="10" width="32" height="28" rx="3"/><path d="M8 18h32"/><circle cx="16" cy="26" r="3"/><circle cx="32" cy="26" r="3"/><path d="M24 10v28" stroke-dasharray="3 3"/></svg>',
    pflichtteil: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="10" y="6" width="28" height="36" rx="3"/><path d="M18 16h12M18 22h12M18 28h8"/><path d="M24 40v-6" stroke-width="2.5" opacity="0.6"/><circle cx="24" cy="42" r="2" fill="currentColor" opacity="0.5"/></svg>',
    zugewinnausgleich: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 38l8-12 6 6 8-16 6 10"/><rect x="8" y="10" width="32" height="28" rx="2" opacity="0.3"/><circle cx="18" cy="26" r="2" fill="currentColor" opacity="0.5"/><circle cx="32" cy="16" r="2" fill="currentColor" opacity="0.5"/></svg>',
  }

  // Fachgebiete HTML
  const fachgebieteHtml = c.fachgebiete.map(fg => {
    const iconKey = (fg.icon || fg.name).toLowerCase()
      .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
      .replace(/[^a-z]/g, '')
    const svgIcon = fachgebietIconMap[iconKey] || fachgebietIconMap['scheidung']
    return `
          <div class="fachgebiet-card">
            <div class="fachgebiet-icon">${svgIcon}</div>
            <h3>${esc(fg.name)}</h3>
            <p>${esc(fg.description)}</p>
            ${fg.keywords && fg.keywords.length > 0 ? `<div class="fachgebiet-tags">${fg.keywords.map(k => `<span class="fach-tag">${esc(k)}</span>`).join('')}</div>` : ''}
          </div>`
  }).join('\n')

  // Ablauf Schritte HTML
  const ablaufHtml = c.ablaufSchritte.map((s, i) => `
        <div class="ablauf-step">
          <div class="ablauf-number">${esc(s.step || String(i + 1))}</div>
          <div class="ablauf-content">
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.description)}</p>
          </div>
        </div>`).join('\n')

  // Team HTML
  const teamHtml = c.team.map((t, idx) => {
    const initials = t.name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    const gradients = [
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${primaryDark} 100%)`,
      `linear-gradient(135deg, ${c.colors.accent} 0%, ${accentDark} 100%)`,
      `linear-gradient(135deg, ${tintHex(c.colors.primary, 0.3)} 0%, ${c.colors.primary} 100%)`,
      `linear-gradient(135deg, ${c.colors.primary} 0%, ${c.colors.accent} 100%)`,
    ]
    const bg = t.imageUrl
      ? `background-image:url('${esc(t.imageUrl)}');background-size:cover;background-position:center`
      : `background:${gradients[idx % gradients.length]}`
    return `
          <div class="team-card">
            <div class="team-photo" style="${bg}">
              ${!t.imageUrl ? `<span class="team-initials">${esc(initials)}</span>` : ''}
            </div>
            <div class="team-info">
              <h3>${esc(t.name)}</h3>
              <div class="team-role">${esc(t.role)}</div>
              ${t.description ? `<p class="team-desc">${esc(t.description)}</p>` : ''}
              <div class="team-specialties">
                ${t.specialties.map(s => `<span class="specialty-tag">${esc(s)}</span>`).join('\n                ')}
              </div>
            </div>
          </div>`
  }).join('\n')

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
                <div class="review-source">${esc(r.source)}</div>
              </div>
            </div>
          </div>`
  }).join('\n')

  // Erreichbarkeit
  const erreichbarkeit = c.erreichbarkeit || {}
  const erreichbarkeitDetailsHtml = (erreichbarkeit.details || []).map(d => {
    const iconSvg = d.icon === 'phone'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
      : d.icon === 'email'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>'
      : d.icon === 'clock'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'
      : d.icon === 'shield'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>'
    return `
            <div class="erreichbar-detail">
              <div class="erreichbar-icon">${iconSvg}</div>
              <div>
                <div class="erreichbar-label">${esc(d.label)}</div>
                <div class="erreichbar-value">${esc(d.value)}</div>
              </div>
            </div>`
  }).join('\n')

  // FAQ HTML
  const faqHtml = (c.faqItems || []).map(f => `
        <div class="faq-item">
          <button class="faq-q" aria-expanded="false">${esc(f.question)}<span class="faq-icon">+</span></button>
          <div class="faq-a" role="region">${esc(f.answer)}</div>
        </div>`).join('')

  // Contact form fields
  const defaultFields = [
    { name: 'name', label: 'Ihr Name', type: 'text', required: true, placeholder: 'Vor- und Nachname' },
    { name: 'email', label: 'E-Mail', type: 'email', required: true, placeholder: 'ihre@email.de' },
    { name: 'phone', label: 'Telefon', type: 'tel', required: false, placeholder: '+49 40 ...' },
    { name: 'fachgebiet', label: 'Fachgebiet', type: 'select', required: false, options: c.fachgebiete.map(fg => fg.name) },
    { name: 'message', label: 'Ihr Anliegen', type: 'textarea', required: false, placeholder: 'Bitte schildern Sie kurz Ihre Situation. Alle Angaben werden streng vertraulich behandelt.' },
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
    { title: 'Fachgebiete', links: [
      { label: 'Scheidung', href: '#fachgebiete' },
      { label: 'Unterhalt', href: '#fachgebiete' },
      { label: 'Sorgerecht', href: '#fachgebiete' },
      { label: 'Erbrecht', href: '#fachgebiete' },
    ]},
    { title: 'Kanzlei', links: [
      { label: 'Team', href: '#team' },
      { label: 'Erstberatung', href: '#ablauf' },
      { label: 'Standort', href: '#standort' },
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
    'Kostenlose Ersteinsch\u00e4tzung',
    'Diskret &amp; vertraulich',
    'Kurzfristige Termine m\u00f6glich',
    'Pers\u00f6nliche Betreuung',
  ]
  const ctaFeaturesHtml = ctaFeatures.map(f => `
            <div class="cta-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--sand)" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
              ${esc(f)}
            </div>`).join('')

  // Opening hours
  const hoursHtml = c.openingHours.map(h => `
          <div class="hours-row">
            <span class="hours-day">${esc(h.days)}</span>
            <span class="hours-time">${esc(h.hours)}</span>
          </div>`).join('')

  // About stats
  const aboutStats = c.aboutStats || [
    { value: '25+', label: 'Jahre Erfahrung' },
    { value: '3.000+', label: 'Mandanten betreut' },
    { value: '98%', label: 'Zufriedenheit' },
  ]
  const aboutStatsHtml = aboutStats.map(s => `
          <div class="about-stat">
            <div class="stat-value">${esc(s.value)}</div>
            <div class="stat-label">${esc(s.label)}</div>
          </div>`).join('')

  // Mobile CTA
  const mobileCta = c.mobileCta || { text: c.ctaText || 'Erstberatung anfragen', href: '#contact' }

  // Nav links
  const navLinks = [
    { label: 'Fachgebiete', href: '#fachgebiete' },
    { label: 'Erstberatung', href: '#ablauf' },
    { label: 'Team', href: '#team' },
    { label: 'Bewertungen', href: '#reviews' },
    { label: 'Kontakt', href: '#contact' },
  ]

  // Standort
  const standort = c.standort || {}

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

<!-- Schema.org Attorney -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Attorney",
  "name": "${esc(c.businessName)}",
  "description": "${esc(c.tagline)}",
  "areaServed": "Hamburg",
  "knowsAbout": ["Familienrecht", "Scheidung", "Unterhalt", "Sorgerecht", "Erbrecht", "Ehevertrag", "Mediation", "Pflichtteil", "Zugewinnausgleich", "Umgangsrecht", "Versorgungsausgleich", "Trennungsjahr"],
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
  "url": "${appUrl}${siteId ? `/s/${siteId}` : ''}"
}
</script>

<style>
  /* ========================================
     CSS CUSTOM PROPERTIES
     ======================================== */
  :root {
    --bordeaux: ${c.colors.primary};
    --sand: ${c.colors.accent};
    --cream: ${c.colors.background};
    --text: ${c.colors.text};
    --bordeaux-dark: ${primaryDark};
    --bordeaux-light: ${primaryLight};
    --bordeaux-soft: ${primarySoft};
    --sand-dark: ${accentDark};
    --sand-soft: ${accentSoft};
    --bg-tint: ${bgTint};
    --bg-warm: ${bgWarm};
    --text-soft: ${textSoft};
    --border: ${borderColor};
    --font-display: 'Fraunces', Georgia, serif;
    --font-body: 'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --max-w: 1120px;
    --radius: 12px;
    --radius-lg: 20px;
    --transition: .25s cubic-bezier(.4,0,.2,1);
    --shadow-sm: 0 1px 3px ${hexToRgba(c.colors.primary, 0.06)};
    --shadow-md: 0 4px 16px ${hexToRgba(c.colors.primary, 0.08)};
    --shadow-lg: 0 12px 40px ${hexToRgba(c.colors.primary, 0.12)};
  }

  /* ========================================
     RESET & BASE
     ======================================== */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
  body {
    font-family: var(--font-body);
    background: var(--cream);
    color: var(--text);
    line-height: 1.6;
    overflow-x: hidden;
  }
  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; height: auto; display: block; }
  button { cursor: pointer; border: none; background: none; font-family: inherit; }

  /* ========================================
     ANNOUNCEMENT BAR
     ======================================== */
  .announce-bar {
    background: var(--bordeaux);
    color: ${hexToRgba('#fff', 0.9)};
    text-align: center;
    padding: 10px 20px;
    font-size: .82rem;
    font-weight: 500;
    letter-spacing: .02em;
  }

  /* ========================================
     NAVIGATION
     ======================================== */
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: ${hexToRgba(c.colors.background, 0.85)};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid transparent;
    transition: all var(--transition);
  }
  .nav.scrolled {
    background: ${hexToRgba(c.colors.background, 0.97)};
    border-bottom: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
  }
  .nav-inner {
    max-width: var(--max-w);
    margin: 0 auto;
    padding: 0 24px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
  }
  .nav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--bordeaux);
    white-space: nowrap;
  }
  .logo-mark {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: var(--bordeaux);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: .95rem;
  }
  .nav-links {
    display: flex;
    list-style: none;
    gap: 28px;
  }
  .nav-links a {
    font-size: .88rem;
    font-weight: 500;
    color: var(--text-soft);
    transition: color var(--transition);
    position: relative;
  }
  .nav-links a:hover { color: var(--bordeaux); }
  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--bordeaux);
    transition: width var(--transition);
    border-radius: 2px;
  }
  .nav-links a:hover::after { width: 100%; }
  .nav-cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--bordeaux);
    color: #fff;
    padding: 10px 20px;
    border-radius: 50px;
    font-size: .85rem;
    font-weight: 600;
    transition: all var(--transition);
    white-space: nowrap;
  }
  .nav-cta:hover { background: var(--bordeaux-dark); transform: translateY(-1px); box-shadow: var(--shadow-md); }
  .nav-cta svg { width: 16px; height: 16px; }
  .nav-toggle {
    display: none;
    flex-direction: column;
    gap: 5px;
    width: 28px;
    padding: 4px 0;
  }
  .nav-toggle span {
    display: block;
    width: 100%;
    height: 2px;
    background: var(--bordeaux);
    border-radius: 2px;
    transition: all var(--transition);
  }
  .nav-mobile {
    display: none;
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    background: var(--cream);
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
    z-index: 999;
    flex-direction: column;
    gap: 12px;
  }
  .nav-mobile.open { display: flex; }
  .nav-mobile a {
    font-size: 1rem;
    font-weight: 500;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
    color: var(--text);
  }

  /* ========================================
     BUTTONS
     ======================================== */
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--bordeaux);
    color: #fff;
    padding: 14px 28px;
    border-radius: 50px;
    font-weight: 600;
    font-size: .95rem;
    transition: all var(--transition);
    text-decoration: none;
    border: none;
    cursor: pointer;
  }
  .btn-primary:hover { background: var(--bordeaux-dark); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .btn-primary svg { width: 18px; height: 18px; }
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: var(--bordeaux);
    padding: 14px 28px;
    border-radius: 50px;
    font-weight: 600;
    font-size: .95rem;
    border: 2px solid var(--bordeaux);
    transition: all var(--transition);
    text-decoration: none;
    cursor: pointer;
  }
  .btn-secondary:hover { background: var(--bordeaux-soft); transform: translateY(-1px); }
  .btn-secondary svg { width: 18px; height: 18px; }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    padding: 120px 24px 80px;
    background: linear-gradient(170deg, var(--cream) 0%, ${tintHex(c.colors.background, -0.04)} 50%, ${hexToRgba(c.colors.accent, 0.08)} 100%);
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -120px;
    right: -120px;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: ${hexToRgba(c.colors.primary, 0.04)};
  }
  .hero-inner {
    max-width: var(--max-w);
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 60px;
    align-items: center;
    position: relative;
  }
  .hero-content { z-index: 2; }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: .78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: var(--bordeaux);
    background: var(--bordeaux-soft);
    padding: 6px 14px;
    border-radius: 50px;
    margin-bottom: 20px;
  }
  .hero-tag svg { width: 14px; height: 14px; stroke: var(--bordeaux); }
  .hero h1 {
    font-family: var(--font-display);
    font-size: 2.8rem;
    font-weight: 800;
    line-height: 1.15;
    color: var(--bordeaux);
    margin-bottom: 20px;
    letter-spacing: -.01em;
  }
  .hero h1 .accent {
    color: var(--sand-dark);
    font-style: italic;
  }
  .hero-lead {
    font-size: 1.1rem;
    line-height: 1.7;
    color: var(--text-soft);
    max-width: 520px;
    margin-bottom: 32px;
  }
  .hero-actions {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }
  .hero-visual { position: relative; z-index: 1; }
  .hero-visual-box {
    border-radius: var(--radius-lg);
    overflow: hidden;
    aspect-ratio: 4/3;
    background: linear-gradient(135deg, ${hexToRgba(c.colors.primary, 0.08)}, ${hexToRgba(c.colors.accent, 0.12)});
    box-shadow: var(--shadow-lg);
  }
  .hero-visual-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hero-visual-box .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--bordeaux);
    opacity: .25;
  }
  .hero-stat-cards {
    display: flex;
    gap: 12px;
    position: absolute;
    bottom: -20px;
    left: 20px;
    right: 20px;
  }
  .hero-stat {
    flex: 1;
    background: #fff;
    border-radius: var(--radius);
    padding: 14px 16px;
    text-align: center;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border);
  }
  .hero-stat .num {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--bordeaux);
  }
  .hero-stat .label {
    font-size: .72rem;
    color: var(--text-soft);
    font-weight: 500;
    margin-top: 2px;
  }

  /* ========================================
     SECTIONS
     ======================================== */
  .section {
    padding: 80px 24px;
  }
  .section-bg {
    background: var(--bg-tint);
  }
  .section-warm {
    background: var(--bg-warm);
  }
  .section-inner {
    max-width: var(--max-w);
    margin: 0 auto;
  }
  .section-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: .72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .1em;
    color: var(--bordeaux);
    margin-bottom: 12px;
  }
  .section-label::before {
    content: '';
    width: 24px;
    height: 2px;
    background: var(--bordeaux);
    border-radius: 2px;
  }
  .section-title {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 800;
    color: var(--bordeaux);
    line-height: 1.2;
    margin-bottom: 12px;
    letter-spacing: -.01em;
  }
  .section-subtitle {
    font-size: 1.02rem;
    color: var(--text-soft);
    line-height: 1.65;
    max-width: 600px;
    margin-bottom: 40px;
  }

  /* ========================================
     FACHGEBIETE
     ======================================== */
  .fachgebiete-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .fachgebiet-card {
    background: #fff;
    border-radius: var(--radius);
    padding: 28px 24px;
    border: 1px solid var(--border);
    transition: all var(--transition);
    position: relative;
    overflow: hidden;
  }
  .fachgebiet-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--bordeaux), var(--sand));
    opacity: 0;
    transition: opacity var(--transition);
  }
  .fachgebiet-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: ${hexToRgba(c.colors.primary, 0.15)};
  }
  .fachgebiet-card:hover::before { opacity: 1; }
  .fachgebiet-icon {
    width: 48px;
    height: 48px;
    color: var(--bordeaux);
    margin-bottom: 16px;
  }
  .fachgebiet-icon svg { width: 48px; height: 48px; }
  .fachgebiet-card h3 {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--bordeaux);
    margin-bottom: 8px;
  }
  .fachgebiet-card p {
    font-size: .9rem;
    color: var(--text-soft);
    line-height: 1.6;
    margin-bottom: 12px;
  }
  .fachgebiet-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .fach-tag {
    font-size: .72rem;
    font-weight: 600;
    background: var(--bordeaux-soft);
    color: var(--bordeaux);
    padding: 3px 10px;
    border-radius: 50px;
    font-family: var(--font-mono);
    letter-spacing: .02em;
  }

  /* ========================================
     ABLAUF ERSTBERATUNG
     ======================================== */
  .ablauf-timeline {
    max-width: 700px;
    margin: 0 auto;
    position: relative;
  }
  .ablauf-timeline::before {
    content: '';
    position: absolute;
    top: 0;
    left: 28px;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, var(--bordeaux), var(--sand));
    border-radius: 2px;
  }
  .ablauf-step {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    padding: 24px 0;
    position: relative;
  }
  .ablauf-number {
    width: 56px;
    height: 56px;
    min-width: 56px;
    border-radius: 50%;
    background: var(--bordeaux);
    color: #fff;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
    box-shadow: 0 4px 12px ${hexToRgba(c.colors.primary, 0.2)};
  }
  .ablauf-content h3 {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--bordeaux);
    margin-bottom: 6px;
  }
  .ablauf-content p {
    font-size: .92rem;
    color: var(--text-soft);
    line-height: 1.65;
  }

  /* ========================================
     TEAM
     ======================================== */
  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }
  .team-card {
    background: #fff;
    border-radius: var(--radius);
    overflow: hidden;
    border: 1px solid var(--border);
    transition: all var(--transition);
  }
  .team-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
  .team-photo {
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--bordeaux), var(--bordeaux-dark));
  }
  .team-initials {
    font-family: var(--font-display);
    font-size: 2.5rem;
    font-weight: 800;
    color: ${hexToRgba('#fff', 0.6)};
  }
  .team-info {
    padding: 24px;
  }
  .team-info h3 {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--bordeaux);
    margin-bottom: 4px;
  }
  .team-role {
    font-size: .85rem;
    font-weight: 600;
    color: var(--sand-dark);
    margin-bottom: 10px;
    font-family: var(--font-mono);
    letter-spacing: .02em;
  }
  .team-desc {
    font-size: .88rem;
    color: var(--text-soft);
    line-height: 1.6;
    margin-bottom: 12px;
  }
  .team-specialties {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .specialty-tag {
    font-size: .72rem;
    font-weight: 600;
    background: var(--bordeaux-soft);
    color: var(--bordeaux);
    padding: 3px 10px;
    border-radius: 50px;
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }
  .review-card {
    background: #fff;
    border-radius: var(--radius);
    padding: 28px;
    border: 1px solid var(--border);
    transition: all var(--transition);
  }
  .review-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
  .review-stars {
    display: flex;
    gap: 2px;
    color: var(--sand-dark);
    margin-bottom: 16px;
  }
  .review-stars svg { width: 18px; height: 18px; }
  .review-text {
    font-size: .95rem;
    font-style: italic;
    line-height: 1.65;
    color: var(--text);
    margin-bottom: 20px;
  }
  .review-author {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .review-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--bordeaux);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: .75rem;
    font-weight: 700;
  }
  .review-name {
    font-size: .88rem;
    font-weight: 600;
    color: var(--text);
  }
  .review-source {
    font-size: .78rem;
    color: var(--text-soft);
  }

  /* ========================================
     ERREICHBARKEIT / DISKRETION
     ======================================== */
  .erreichbar-section {
    padding: 80px 24px;
    background: var(--bordeaux);
    color: #fff;
  }
  .erreichbar-inner {
    max-width: var(--max-w);
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
  }
  .erreichbar-content h2 {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 16px;
    color: #fff;
  }
  .erreichbar-content .diskretion-text {
    font-size: 1.02rem;
    line-height: 1.7;
    color: ${hexToRgba('#fff', 0.75)};
    margin-bottom: 24px;
  }
  .erreichbar-details {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .erreichbar-detail {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  .erreichbar-icon {
    width: 40px;
    height: 40px;
    min-width: 40px;
    border-radius: 10px;
    background: ${hexToRgba('#fff', 0.1)};
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .erreichbar-icon svg { width: 20px; height: 20px; stroke: var(--sand); }
  .erreichbar-label {
    font-size: .78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: ${hexToRgba('#fff', 0.5)};
    margin-bottom: 2px;
  }
  .erreichbar-value {
    font-size: .95rem;
    color: #fff;
    font-weight: 500;
  }
  .diskretion-badge {
    background: ${hexToRgba('#fff', 0.08)};
    border: 1px solid ${hexToRgba('#fff', 0.12)};
    border-radius: var(--radius);
    padding: 20px 24px;
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }
  .diskretion-badge svg {
    width: 32px;
    height: 32px;
    min-width: 32px;
    stroke: var(--sand);
  }
  .diskretion-badge h4 {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 4px;
  }
  .diskretion-badge p {
    font-size: .85rem;
    color: ${hexToRgba('#fff', 0.65)};
    line-height: 1.55;
  }

  /* ========================================
     STANDORT
     ======================================== */
  .standort-wrap {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: start;
  }
  .map-embed {
    border-radius: var(--radius-lg);
    overflow: hidden;
    aspect-ratio: 16/10;
    background: var(--bg-warm);
    border: 1px solid var(--border);
  }
  .map-embed iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
  .map-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--bordeaux);
    opacity: .2;
  }
  .standort-info h3 {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--bordeaux);
    margin-bottom: 12px;
  }
  .standort-info p {
    font-size: .92rem;
    color: var(--text-soft);
    line-height: 1.65;
    margin-bottom: 16px;
  }
  .standort-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .standort-detail {
    display: flex;
    gap: 10px;
    align-items: center;
    font-size: .9rem;
  }
  .standort-detail svg {
    width: 18px;
    height: 18px;
    min-width: 18px;
    stroke: var(--bordeaux);
  }

  /* ========================================
     FAQ
     ======================================== */
  .faq-list {
    max-width: 740px;
    margin: 0 auto;
  }
  .faq-item {
    border-bottom: 1px solid var(--border);
  }
  .faq-q {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text);
    text-align: left;
    cursor: pointer;
    transition: color var(--transition);
    font-family: var(--font-body);
    gap: 16px;
  }
  .faq-q:hover { color: var(--bordeaux); }
  .faq-icon {
    font-size: 1.3rem;
    font-weight: 300;
    color: var(--bordeaux);
    transition: transform var(--transition);
    flex-shrink: 0;
  }
  .faq-a {
    max-height: 0;
    overflow: hidden;
    transition: max-height .35s ease, padding .35s ease;
    font-size: .92rem;
    line-height: 1.65;
    color: var(--text-soft);
    padding: 0 0 0 0;
  }
  .faq-item.open .faq-a {
    max-height: 400px;
    padding: 0 0 20px 0;
  }
  .faq-item.open .faq-icon {
    transform: rotate(45deg);
  }

  /* ========================================
     CONTACT FORM
     ======================================== */
  .contact-section {
    padding: 80px 24px;
    background: var(--bordeaux);
    color: #fff;
  }
  .contact-inner {
    max-width: var(--max-w);
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 60px;
    align-items: start;
  }
  .contact-info .section-label { color: var(--sand); }
  .contact-info .section-label::before { background: var(--sand); }
  .contact-info .section-title { color: #fff; }
  .contact-info .section-subtitle { color: ${hexToRgba('#fff', 0.7)}; }
  .contact-details {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 24px;
  }
  .contact-detail {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: .9rem;
    color: ${hexToRgba('#fff', 0.8)};
  }
  .contact-detail svg { width: 18px; height: 18px; min-width: 18px; stroke: var(--sand); }
  .contact-detail a { color: ${hexToRgba('#fff', 0.8)}; text-decoration: underline; text-underline-offset: 2px; }
  .contact-detail a:hover { color: var(--sand); }
  .contact-hours h4 {
    font-size: .82rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: ${hexToRgba('#fff', 0.45)};
    margin-bottom: 10px;
  }
  .hours-row {
    display: flex;
    justify-content: space-between;
    font-size: .88rem;
    padding: 4px 0;
    max-width: 280px;
  }
  .hours-day { color: ${hexToRgba('#fff', 0.6)}; }
  .hours-time { color: ${hexToRgba('#fff', 0.85)}; font-weight: 500; }
  .contact-form-wrap {
    background: ${hexToRgba('#fff', 0.06)};
    border: 1px solid ${hexToRgba('#fff', 0.1)};
    border-radius: var(--radius-lg);
    padding: 36px;
  }
  .contact-form-wrap h3 {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 24px;
  }
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group.full { grid-column: 1 / -1; }
  .form-group label {
    font-size: .8rem;
    font-weight: 600;
    color: ${hexToRgba('#fff', 0.6)};
    text-transform: uppercase;
    letter-spacing: .04em;
  }
  .form-group input,
  .form-group select,
  .form-group textarea {
    background: ${hexToRgba('#fff', 0.08)};
    border: 1px solid ${hexToRgba('#fff', 0.12)};
    border-radius: 8px;
    padding: 12px 14px;
    color: #fff;
    font-size: .9rem;
    font-family: var(--font-body);
    transition: all var(--transition);
  }
  .form-group input::placeholder,
  .form-group textarea::placeholder {
    color: ${hexToRgba('#fff', 0.35)};
  }
  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--sand);
    background: ${hexToRgba('#fff', 0.12)};
  }
  .form-group select option { color: var(--text); background: var(--cream); }
  .form-submit { grid-column: 1 / -1; margin-top: 8px; }
  .form-submit button {
    width: 100%;
    padding: 14px 24px;
    background: var(--sand);
    color: var(--bordeaux);
    border: none;
    border-radius: 50px;
    font-weight: 700;
    font-size: .95rem;
    cursor: pointer;
    transition: all var(--transition);
    font-family: var(--font-body);
  }
  .form-submit button:hover {
    background: var(--sand-dark);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px ${hexToRgba(c.colors.accent, 0.3)};
  }

  /* ========================================
     ABOUT / KANZLEI
     ======================================== */
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
  }
  .about-text h2 {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 800;
    color: var(--bordeaux);
    margin-bottom: 16px;
  }
  .about-text p {
    font-size: .95rem;
    line-height: 1.7;
    color: var(--text-soft);
    margin-bottom: 14px;
  }
  .about-stats {
    display: flex;
    gap: 28px;
    margin-top: 28px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
  }
  .about-stat { text-align: center; }
  .stat-value {
    font-family: var(--font-display);
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--bordeaux);
  }
  .stat-label {
    font-size: .78rem;
    color: var(--text-soft);
    font-weight: 500;
    margin-top: 2px;
  }

  /* ========================================
     CTA BANNER
     ======================================== */
  .cta-banner {
    padding: 60px 24px;
    background: linear-gradient(135deg, ${hexToRgba(c.colors.accent, 0.2)}, ${hexToRgba(c.colors.accent, 0.05)});
  }
  .cta-banner-inner {
    max-width: 700px;
    margin: 0 auto;
    text-align: center;
  }
  .cta-banner-inner h2 {
    font-family: var(--font-display);
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--bordeaux);
    margin-bottom: 12px;
  }
  .cta-banner-inner p {
    color: var(--text-soft);
    font-size: 1.02rem;
    margin-bottom: 28px;
    line-height: 1.65;
  }
  .cta-features {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 28px;
  }
  .cta-feature {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: .85rem;
    font-weight: 600;
    color: var(--bordeaux);
  }
  .cta-feature svg { width: 18px; height: 18px; }

  /* ========================================
     FOOTER
     ======================================== */
  .footer {
    background: var(--bordeaux);
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
  .footer-col a:hover { color: var(--sand); }
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
  .footer-legal a:hover { color: var(--sand); }

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
    background: var(--bordeaux);
    padding: 12px 20px;
    box-shadow: 0 -4px 20px ${hexToRgba(c.colors.primary, 0.2)};
  }
  .mobile-cta a {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--sand);
    color: var(--bordeaux);
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
    .fachgebiete-grid { grid-template-columns: repeat(2, 1fr); }
    .about-grid { grid-template-columns: 1fr; gap: 40px; }
    .erreichbar-inner { grid-template-columns: 1fr; gap: 40px; }
    .standort-wrap { grid-template-columns: 1fr; }
    .contact-inner { grid-template-columns: 1fr; gap: 40px; }
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
    .section { padding: 56px 20px; }
    .section-title { font-size: 1.6rem; }
    .fachgebiete-grid { grid-template-columns: 1fr; }
    .ablauf-step { gap: 16px; }
    .ablauf-number { width: 44px; height: 44px; min-width: 44px; font-size: 1rem; }
    .ablauf-timeline::before { left: 21px; }
    .team-grid { grid-template-columns: 1fr; }
    .reviews-grid { grid-template-columns: 1fr; }
    .erreichbar-section { padding: 56px 20px; }
    .erreichbar-inner { grid-template-columns: 1fr; gap: 32px; }
    .form-grid { grid-template-columns: 1fr; }
    .cta-features { flex-direction: column; align-items: center; }
    .footer-grid { grid-template-columns: 1fr; gap: 28px; }
    .footer-bottom { flex-direction: column; text-align: center; }
    .mobile-cta { display: block; }
    body { padding-bottom: 72px; }
    .about-stats { flex-wrap: wrap; gap: 16px; }
    .about-stat { flex: 1; min-width: 80px; }
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
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg>
        ${esc(c.heroTag)}
      </div>
      <h1>${esc(c.heroHeadline)} <span class="accent">${esc(c.heroAccent)}</span></h1>
      <p class="hero-lead">${esc(c.heroLead)}</p>
      <div class="hero-actions">
        <a href="#contact" class="btn-primary">${esc(c.ctaText)}
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 10h10M11 6l4 4-4 4"/></svg>
        </a>
        <a href="#ablauf" class="btn-secondary">
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 1.5"/></svg>
          Ablauf der Erstberatung
        </a>
      </div>
    </div>
    <div class="hero-visual">
      <div class="hero-visual-box">
        ${c.heroImageUrl ? `<img src="${esc(c.heroImageUrl)}" alt="${esc(c.businessName)} - ${esc(c.tagline)}" loading="eager">` : `<div class="placeholder"><svg viewBox="0 0 80 80" fill="none" stroke-width="1.5"><path d="M40 15L20 25v15c0 12 8 22 20 25 12-3 20-13 20-25V25L40 15z" stroke="currentColor"/><path d="M30 42l7 7 13-14" stroke="currentColor" stroke-width="2"/></svg></div>`}
      </div>
      <div class="hero-stat-cards">
        ${aboutStats.map(s => `<div class="hero-stat"><div class="num">${esc(s.value)}</div><div class="label">${esc(s.label)}</div></div>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>

<!-- ==========================================
     FACHGEBIETE
     ========================================== -->
<section class="section" id="fachgebiete">
  <div class="section-inner">
    <div class="section-label">Fachgebiete</div>
    <h2 class="section-title">Unsere Kompetenzen im Familienrecht</h2>
    <p class="section-subtitle">Von Scheidung &uuml;ber Sorgerecht bis zur Erbschaftsregelung &ndash; wir begleiten Sie einf&uuml;hlsam und kompetent durch jede familienrechtliche Angelegenheit.</p>
    <div class="fachgebiete-grid animate-in">
      ${fachgebieteHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     ABLAUF ERSTBERATUNG
     ========================================== -->
<section class="section section-bg" id="ablauf">
  <div class="section-inner">
    <div style="text-align:center;margin-bottom:48px">
      <div class="section-label" style="justify-content:center">Erstberatung</div>
      <h2 class="section-title" style="text-align:center">Ablauf Ihrer Erstberatung</h2>
      <p class="section-subtitle" style="text-align:center;margin:0 auto">Wir m&ouml;chten, dass Sie sich von Anfang an gut aufgehoben f&uuml;hlen. So l&auml;uft Ihre Erstberatung bei uns ab.</p>
    </div>
    <div class="ablauf-timeline animate-in">
      ${ablaufHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     KANZLEI / ABOUT
     ========================================== -->
${c.aboutTitle || c.aboutText ? `
<section class="section" id="about">
  <div class="section-inner">
    <div class="about-grid animate-in">
      <div class="about-text">
        <div class="section-label">Die Kanzlei</div>
        <h2>${esc(c.aboutTitle || 'Tradition trifft Kompetenz')}</h2>
        <p>${esc(c.aboutText || '')}</p>
        ${c.aboutText2 ? `<p>${esc(c.aboutText2)}</p>` : ''}
        <div class="about-stats">
          ${aboutStatsHtml}
        </div>
      </div>
      <div class="about-visual">
        <div style="border-radius:var(--radius-lg);overflow:hidden;aspect-ratio:4/3;background:linear-gradient(135deg, ${hexToRgba(c.colors.primary, 0.06)}, ${hexToRgba(c.colors.accent, 0.1)});display:flex;align-items:center;justify-content:center;border:1px solid var(--border)">
          <svg viewBox="0 0 80 80" width="64" height="64" fill="none" stroke="var(--bordeaux)" stroke-width="1.2" opacity="0.2"><rect x="8" y="14" width="64" height="52" rx="4"/><path d="M8 30h64"/><circle cx="24" cy="22" r="4"/><circle cx="40" cy="22" r="4"/><circle cx="56" cy="22" r="4"/><path d="M20 44h40M20 52h28"/></svg>
        </div>
      </div>
    </div>
  </div>
</section>
` : ''}

<!-- ==========================================
     TEAM
     ========================================== -->
<section class="section${c.aboutTitle || c.aboutText ? ' section-bg' : ''}" id="team">
  <div class="section-inner">
    <div class="section-label">Unser Team</div>
    <h2 class="section-title">Die Menschen hinter der Kanzlei</h2>
    <p class="section-subtitle">Erfahrene Familienrechtler, die mit Einf&uuml;hlungsverm&ouml;gen und Fachkompetenz f&uuml;r Ihre Interessen eintreten.</p>
    <div class="team-grid animate-in">
      ${teamHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     BEWERTUNGEN
     ========================================== -->
<section class="section${!(c.aboutTitle || c.aboutText) ? ' section-bg' : ''}" id="reviews">
  <div class="section-inner">
    <div class="section-label">Mandantenstimmen</div>
    <h2 class="section-title">Was unsere Mandanten sagen</h2>
    <p class="section-subtitle">${c.reviews.length > 0 ? `${(c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length).toFixed(1)} von 5 Sternen &ndash; basierend auf ${c.reviews.length} Bewertungen` : 'Vertrauen und Zufriedenheit unserer Mandanten stehen an erster Stelle.'}</p>
    <div class="reviews-grid animate-in">
      ${reviewsHtml}
    </div>
  </div>
</section>

<!-- ==========================================
     ERREICHBARKEIT / DISKRETION
     ========================================== -->
<section class="erreichbar-section" id="erreichbarkeit">
  <div class="erreichbar-inner">
    <div class="erreichbar-content">
      <h2>${esc(erreichbarkeit.title || 'Diskret erreichbar \u2013 f\u00fcr Sie da')}</h2>
      <p class="diskretion-text">${esc(erreichbarkeit.subtitle || 'Familienrechtliche Angelegenheiten erfordern Vertrauen und Diskretion. Wir garantieren Ihnen absolute Vertraulichkeit in jeder Phase der Beratung.')}</p>
      <div class="erreichbar-details">
        ${erreichbarkeitDetailsHtml || `
            <div class="erreichbar-detail">
              <div class="erreichbar-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
              <div>
                <div class="erreichbar-label">Telefon</div>
                <div class="erreichbar-value">${c.phone ? esc(c.phone) : 'Auf Anfrage'}</div>
              </div>
            </div>
            <div class="erreichbar-detail">
              <div class="erreichbar-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg></div>
              <div>
                <div class="erreichbar-label">E-Mail</div>
                <div class="erreichbar-value">${c.email ? esc(c.email) : 'Auf Anfrage'}</div>
              </div>
            </div>`}
      </div>
    </div>
    <div class="erreichbar-right">
      <div class="diskretion-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg>
        <div>
          <h4>Vertraulichkeit garantiert</h4>
          <p>${esc(erreichbarkeit.diskretionHinweis || 'Alle Gespr\u00e4che und Unterlagen unterliegen der anwaltlichen Schweigepflicht. Ihre Angelegenheiten werden mit h\u00f6chster Diskretion behandelt.')}</p>
        </div>
      </div>
      <div class="diskretion-badge" style="margin-top:16px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <div>
          <h4>Kurzfristige Termine</h4>
          <p>In dringenden F&auml;llen &ndash; etwa bei einstweiligen Anordnungen oder akutem Handlungsbedarf &ndash; stehen wir auch kurzfristig zur Verf&uuml;gung.</p>
        </div>
      </div>
      <div class="contact-hours" style="margin-top:20px;padding:16px 20px;background:${hexToRgba('#fff', 0.06)};border-radius:var(--radius);border:1px solid ${hexToRgba('#fff', 0.1)}">
        <h4 style="font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:${hexToRgba('#fff', 0.45)};margin-bottom:10px">Sprechzeiten</h4>
        ${hoursHtml}
      </div>
    </div>
  </div>
</section>

<!-- ==========================================
     STANDORT
     ========================================== -->
<section class="section" id="standort">
  <div class="section-inner">
    <div class="section-label">Standort</div>
    <h2 class="section-title">${esc(standort.title || 'Unsere Kanzlei in Hamburg')}</h2>
    <p class="section-subtitle">${esc(standort.subtitle || 'Zentral gelegen und diskret erreichbar \u2013 wir freuen uns auf Ihren Besuch.')}</p>
    <div class="standort-wrap animate-in">
      <div class="map-embed">
        ${standort.mapEmbedUrl ? `<iframe src="${esc(standort.mapEmbedUrl)}" loading="lazy" allowfullscreen title="Karte Standort"></iframe>` : '<div class="map-placeholder"><svg viewBox="0 0 64 64" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M32 8C22 8 14 16 14 26c0 14 18 30 18 30s18-16 18-30C50 16 42 8 32 8z"/><circle cx="32" cy="26" r="6"/></svg></div>'}
      </div>
      <div class="standort-info">
        <h3>${esc(c.businessName)}</h3>
        ${standort.anfahrtDetails ? `<p>${esc(standort.anfahrtDetails)}</p>` : ''}
        <div class="standort-details">
          ${c.address ? `<div class="standort-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${esc(c.address)}${c.postalCode ? ', ' + esc(c.postalCode) : ''} ${esc(c.city || '')}</div>` : ''}
          ${c.phone ? `<div class="standort-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg><a href="tel:${esc(c.phone)}">${esc(c.phone)}</a></div>` : ''}
          ${c.email ? `<div class="standort-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>` : ''}
        </div>
        <div class="contact-hours" style="margin-top:20px">
          <h4 style="font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-soft);margin-bottom:10px">&Ouml;ffnungszeiten</h4>
          ${c.openingHours.map(h => `
          <div style="display:flex;justify-content:space-between;font-size:.88rem;padding:4px 0;max-width:280px">
            <span style="color:var(--text-soft)">${esc(h.days)}</span>
            <span style="color:var(--text);font-weight:500">${esc(h.hours)}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ==========================================
     FAQ
     ========================================== -->
${(c.faqItems || []).length > 0 ? `
<section class="section section-bg" id="faq">
  <div class="section-inner">
    <div style="text-align:center;margin-bottom:40px">
      <div class="section-label" style="justify-content:center">FAQ</div>
      <h2 class="section-title" style="text-align:center">H&auml;ufig gestellte Fragen</h2>
      <p class="section-subtitle" style="text-align:center;margin:0 auto">Antworten auf die wichtigsten Fragen rund um Familienrecht, Scheidung und Erstberatung.</p>
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
      <h2 class="section-title">${esc(c.contactFormTitle || 'Erstberatung anfragen')}</h2>
      <p class="section-subtitle">${esc(c.contactFormSubtitle || 'Schildern Sie uns Ihr Anliegen \u2013 vertraulich und unverbindlich. Wir melden uns zeitnah bei Ihnen.')}</p>
      <div class="contact-details">
        ${c.phone ? `<div class="contact-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg><a href="tel:${esc(c.phone)}">${esc(c.phone)}</a></div>` : ''}
        ${c.email ? `<div class="contact-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>` : ''}
        ${c.address ? `<div class="contact-detail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${esc(c.address)}${c.postalCode ? ', ' + esc(c.postalCode) : ''} ${esc(c.city || '')}</div>` : ''}
      </div>
      <div class="contact-hours">
        <h4>Sprechzeiten</h4>
        ${hoursHtml}
      </div>
    </div>
    <div class="contact-form-wrap">
      <h3>${esc(c.contactFormTitle || 'Vertrauliche Anfrage senden')}</h3>
      <form id="contact-form">
        <div class="form-grid">
          ${contactFieldsHtml}
          <div class="form-submit">
            <button type="submit" id="contact-submit">${esc(c.ctaText || 'Erstberatung anfragen')}</button>
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
    <h2>${esc(c.ctaSectionTitle || 'Ihr erster Schritt zu einer guten L\u00f6sung')}</h2>
    <p>${esc(c.ctaSectionSubtitle || 'Vereinbaren Sie jetzt Ihre vertrauliche Erstberatung \u2013 wir begleiten Sie mit Einf\u00fchlungsverm\u00f6gen und Kompetenz.')}</p>
    <div class="cta-features">
      ${ctaFeaturesHtml}
    </div>
    <a href="#contact" class="btn-primary" style="background:var(--bordeaux);color:#fff">
      ${esc(c.ctaText || 'Erstberatung anfragen')}
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
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:#fff;font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px">Vielen Dank f\\u00fcr Ihre Anfrage!</h3><p style="color:${hexToRgba('#fff', 0.7)};font-size:1.05rem">Wir behandeln Ihr Anliegen vertraulich und melden uns zeitnah bei Ihnen.</p></div>';
          } else {
            alert(d.error || 'Fehler beim Senden');
            btn.textContent = '${esc(c.ctaText || 'Erstberatung anfragen')}';
            btn.disabled = false;
          }
        })
        .catch(function() {
          alert('Verbindungsfehler');
          btn.textContent = '${esc(c.ctaText || 'Erstberatung anfragen')}';
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
    <p style="flex:1;min-width:200px;margin:0;color:${hexToRgba('#fff', 0.8)}">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${esc(c.privacyUrl || '#')}" style="color:var(--sand);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--sand);color:var(--bordeaux);border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
