// Gruenwerk Template Renderer — Garten/Handwerk-Branche
// Design: Editorial serif (Fraunces) + tight sans (Inter Tight) + mono (JetBrains Mono)

export interface GruenwerkConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroSubline: string
  heroLead: string
  ctaText: string
  ctaSecondaryText?: string
  colors: {
    primary: string    // ersetzt --forest
    secondary: string  // ersetzt --wood
    accent: string     // ersetzt --cream
    background: string // ersetzt --bg
    text: string       // ersetzt --ink
  }
  phone?: string
  email?: string
  address?: string
  trustItems: { icon: string; text: string }[]
  services: { icon: string; title: string; description: string; tags?: string[] }[]
  aboutTitle: string
  aboutText: string
  aboutText2?: string
  aboutImageUrl?: string
  stats: { value: string; label: string }[]
  reviews: { text: string; name: string; rating: number }[]
  faqItems: { question: string; answer: string }[]
  heroImageUrl?: string
  uspItems?: { title: string; description: string; highlight?: string }[]
  imprintUrl?: string
  privacyUrl?: string
  footerTagline?: string
  footerServices?: string[]
  footerCompanyLinks?: { label: string; href: string }[]
  marqueeItems?: string[]
  workflowSteps?: { title: string; description: string }[]
  ctaSectionTitle?: string
  ctaSectionSubline?: string
  ctaSectionEyebrow?: string
  formFields?: { label: string; name: string; type: string; placeholder?: string; required?: boolean; options?: string[] }[]
}

function e(str: string | undefined | null): string {
  if (!str) return ''
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

// Helper to darken a hex color slightly for --forest-2
function darkenHex(hex: string, amount: number = 0.15): string {
  const h = hex.replace('#', '')
  const r = Math.max(0, Math.round(parseInt(h.substring(0, 2), 16) * (1 - amount)))
  const g = Math.max(0, Math.round(parseInt(h.substring(2, 4), 16) * (1 - amount)))
  const b = Math.max(0, Math.round(parseInt(h.substring(4, 6), 16) * (1 - amount)))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Helper to lighten a hex color slightly for --cream-tint
function lightenHex(hex: string, amount: number = 0.05): string {
  const h = hex.replace('#', '')
  const r = Math.min(255, Math.round(parseInt(h.substring(0, 2), 16) + (255 - parseInt(h.substring(0, 2), 16)) * amount))
  const g = Math.min(255, Math.round(parseInt(h.substring(2, 4), 16) + (255 - parseInt(h.substring(2, 4), 16)) * amount))
  const b = Math.min(255, Math.round(parseInt(h.substring(4, 6), 16) + (255 - parseInt(h.substring(4, 6), 16)) * amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function renderGruenwerkTemplate(config: GruenwerkConfig, siteId?: string): string {
  const c = {
    name: config.businessName || 'Mein Unternehmen',
    tagline: config.tagline || '',
    heroHeadline: config.heroHeadline || 'Ihr Garten.',
    heroAccent: config.heroAccent || 'Unsere Handschrift.',
    heroSubline: config.heroSubline || '',
    heroLead: config.heroLead || '',
    ctaText: config.ctaText || 'Kostenlose Beratung',
    ctaSecondaryText: config.ctaSecondaryText || '',
    primary: config.colors?.primary || '#1f3a2e',
    secondary: config.colors?.secondary || '#a87242',
    accent: config.colors?.accent || '#faf6ee',
    bg: config.colors?.background || '#fbf9f3',
    text: config.colors?.text || '#1f3a2e',
    phone: config.phone || '',
    email: config.email || '',
    address: config.address || '',
    heroImg: config.heroImageUrl || '',
    aboutImg: config.aboutImageUrl || '',
    imprint: config.imprintUrl || '#',
    privacy: config.privacyUrl || '#',
  }

  // Derived colors
  const forest = c.primary
  const forest2 = darkenHex(forest, 0.15)
  const wood = c.secondary
  const woodHover = darkenHex(wood, 0.12)
  const cream = c.accent
  const creamTint = lightenHex(cream, -0.04)
  const ink = c.text
  const inkSoft = hexToRgba(ink, 0.55)
  const bg = c.bg
  const borderColor = hexToRgba(ink, 0.12)
  const woodSoft = hexToRgba(wood, 0.22)

  const trustItems = config.trustItems || []
  const services = config.services || []
  const stats = config.stats || []
  const reviews = config.reviews || []
  const faqItems = config.faqItems || []
  const uspItems = config.uspItems || []
  const marqueeItems = config.marqueeItems || []
  const workflowSteps = config.workflowSteps || []
  const footerServices = config.footerServices || []
  const footerCompanyLinks = config.footerCompanyLinks || []

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // Trust items SVG icons mapping
  const trustIconSvgs: Record<string, string> = {
    'shield': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    'check': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>',
    'users': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
    'calendar': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    'target': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12"/></svg>',
    'star': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    'award': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
    'clock': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    'tree': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C7 7 5 12 8 17C10 14 12 12 14 14C16 10 12 6 12 2Z"/><path d="M12 14V22"/></svg>',
    'phone': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    'home': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    'heart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/></svg>',
    'tool': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>',
    'map-pin': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  }

  function getTrustIcon(icon: string): string {
    return trustIconSvgs[icon] || trustIconSvgs['check'] || ''
  }

  // Hero visual background
  const heroVisualStyle = c.heroImg
    ? `background-image: linear-gradient(180deg, transparent 50%, ${hexToRgba(forest, 0.4)}), url('${e(c.heroImg)}'); background-size: cover; background-position: center;`
    : `background: linear-gradient(135deg, #6b8a5a 0%, #8aab78 30%, #5d7a4c 60%, #3a5a30 100%);`

  const heroVisualAfter = c.heroImg ? '' : `<style>.visual-main::after { content: 'IMG: Platzhalter'; }</style>`

  // Stars helper
  function renderStars(rating: number): string {
    return Array.from({ length: 5 }, (_, i) =>
      i < rating
        ? `<svg viewBox="0 0 24 24" fill="${wood}" stroke="${wood}" stroke-width="1" width="16" height="16"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="${hexToRgba(wood, 0.3)}" stroke-width="1" width="16" height="16"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    ).join('')
  }

  // Reviews section
  const reviewsHtml = reviews.length > 0 ? `
<!-- ====== REVIEWS ====== -->
<section style="background: ${ink}; padding: 96px 0; overflow: hidden; position: relative;">
  <div class="container">
    <div class="section-head" style="margin-bottom: 48px;">
      <span class="eyebrow" style="color: ${wood};">Kundenstimmen</span>
      <h2 class="display" style="color: ${cream};">Was unsere Kunden <span class="accent">sagen</span>.</h2>
    </div>
  </div>
  <div style="overflow: hidden; mask-image: linear-gradient(90deg, transparent, white 10%, white 90%, transparent); -webkit-mask-image: linear-gradient(90deg, transparent, white 10%, white 90%, transparent);">
    <div style="display: flex; gap: 20px; animation: marqueeFlow 50s linear infinite; width: max-content; padding: 0 20px;">
      ${reviews.concat(reviews).map((r) => `
      <div style="background: rgba(255,255,255,.06); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 32px; width: 340px; flex-shrink: 0; cursor: default;">
        <div style="margin-bottom: 16px; display: flex; gap: 2px;">${renderStars(r.rating)}</div>
        <p style="font-size: 15px; color: rgba(255,255,255,.78); line-height: 1.75; margin-bottom: 24px; font-style: italic;">${e(r.text)}</p>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, ${wood}, ${darkenHex(wood, 0.2)}); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: ${cream}; flex-shrink: 0;">${e(r.name.charAt(0))}</div>
          <div style="font-size: 14px; font-weight: 600; color: #fff;">${e(r.name)}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>` : ''

  // FAQ section
  const faqHtml = faqItems.length > 0 ? `
<!-- ====== FAQ ====== -->
<section id="faq" style="background: ${bg};">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Häufige Fragen</span>
      <h2 class="display">Antworten auf Ihre <span class="accent">Fragen</span>.</h2>
    </div>
    <div style="max-width: 760px; margin: 0 auto;">
      ${faqItems.map((item) => `
      <div class="faq-item" style="border-bottom: 1px solid ${borderColor};">
        <button class="faq-q" aria-expanded="false" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 24px 0; background: none; border: none; cursor: pointer; font-family: var(--font-display); font-size: 18px; font-weight: 600; color: ${ink}; text-align: left; line-height: 1.3; letter-spacing: -0.02em;">
          ${e(item.question)}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; flex-shrink: 0; transition: transform 0.3s; color: ${wood};"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="faq-a" style="max-height: 0; overflow: hidden; transition: max-height 0.4s ease;">
          <p style="padding: 0 0 24px; color: ${inkSoft}; font-size: 15px; line-height: 1.7;">${e(item.answer)}</p>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>` : ''

  // Tracking script
  const trackingScript = siteId ? `<script>
(function(){
  var sid="${siteId}",u="${appUrl}/api/public/track/"+sid;
  var d={page:location.pathname,referrer:document.referrer,screen:screen.width+"x"+screen.height};
  try{navigator.sendBeacon(u,JSON.stringify(d))}catch(e){var x=new XMLHttpRequest();x.open("POST",u);x.setRequestHeader("Content-Type","application/json");x.send(JSON.stringify(d))}
})();
</script>` : ''

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${e(c.name)} | ${e(c.tagline)}</title>
<meta name="description" content="${e(c.tagline)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,400..900,30..100&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  /* ========================================
     DESIGN TOKENS
     ======================================== */
  :root {
    --forest:      ${forest};
    --forest-2:    ${forest2};
    --wood:        ${wood};
    --wood-hover:  ${woodHover};
    --wood-soft:   ${woodSoft};
    --cream:       ${cream};
    --cream-tint:  ${creamTint};
    --ink:         ${ink};
    --ink-soft:    ${inkSoft};
    --bg:          ${bg};
    --border:      ${borderColor};

    --shadow-card-hover: 0 12px 32px ${hexToRgba(wood, 0.18)};
    --shadow-image:      0 20px 60px ${hexToRgba(forest, 0.35)};

    --spring:   cubic-bezier(0.34, 1.56, 0.64, 1);
    --smooth:   cubic-bezier(0.16, 1, 0.3, 1);

    --font-display: 'Fraunces', 'Georgia', serif;
    --font-body:    'Inter Tight', system-ui, sans-serif;
    --font-mono:    'JetBrains Mono', monospace;
  }

  /* ========================================
     RESET + BASE
     ======================================== */
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: var(--font-body);
    color: var(--ink);
    background: var(--bg);
    line-height: 1.5;
    font-feature-settings: "ss01", "cv11";
    -webkit-font-smoothing: antialiased;
  }
  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; display: block; }

  .display {
    font-family: var(--font-display);
    font-weight: 600;
    letter-spacing: -0.025em;
    line-height: 1.05;
    font-variation-settings: "opsz" 144, "SOFT" 30;
    font-feature-settings: "ss01";
  }
  .display.large {
    font-variation-settings: "opsz" 144, "SOFT" 50;
  }
  .display em {
    font-style: italic;
    font-variation-settings: "opsz" 144, "SOFT" 80;
  }

  .eyebrow {
    color: var(--wood);
    font-family: var(--font-mono);
    font-weight: 500;
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .container { max-width: 1280px; margin: 0 auto; padding: 0 32px; position: relative; }
  section { padding: 96px 0; position: relative; }

  /* ========================================
     ANIMATED GRID PATTERN
     ======================================== */
  .animated-grid {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
    mask-image: radial-gradient(ellipse 70% 80% at 50% 30%, black 30%, transparent 80%);
    -webkit-mask-image: radial-gradient(ellipse 70% 80% at 50% 30%, black 30%, transparent 80%);
  }
  .animated-grid svg { width: 100%; height: 100%; }
  .animated-grid .grid-cell {
    fill: ${hexToRgba(cream, 0.04)};
    animation: gridPulse 4s ease-in-out infinite;
  }
  .animated-grid .grid-cell:nth-child(7n)  { animation-delay: 0s;   }
  .animated-grid .grid-cell:nth-child(7n+1){ animation-delay: 0.8s; }
  .animated-grid .grid-cell:nth-child(7n+2){ animation-delay: 1.5s; }
  .animated-grid .grid-cell:nth-child(7n+3){ animation-delay: 2.2s; }
  .animated-grid .grid-cell:nth-child(7n+4){ animation-delay: 3.0s; }
  .animated-grid .grid-cell:nth-child(7n+5){ animation-delay: 3.7s; }
  .animated-grid .grid-cell:nth-child(7n+6){ animation-delay: 0.4s; }
  @keyframes gridPulse {
    0%, 100% { fill: ${hexToRgba(cream, 0.02)}; }
    50%      { fill: ${hexToRgba(wood, 0.15)}; }
  }

  /* ========================================
     NAV
     ======================================== */
  nav {
    position: sticky; top: 0; z-index: 50;
    background: ${hexToRgba(bg, 0.88)};
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
    font-weight: 700;
    font-size: 26px;
    letter-spacing: -0.03em;
    line-height: 1;
    display: flex; align-items: center; gap: 8px;
    font-variation-settings: "opsz" 144, "SOFT" 50;
  }
  .logo-mark {
    width: 28px; height: 28px;
    background: var(--forest);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: var(--wood);
  }
  .logo-mark svg { width: 18px; height: 18px; }
  .logo span {
    color: var(--wood);
    font-style: italic;
    font-variation-settings: "opsz" 144, "SOFT" 80;
  }
  .nav-links { display: flex; gap: 32px; font-size: 15px; font-weight: 500; }
  .nav-links a { transition: color 0.2s; }
  .nav-links a:hover { color: var(--wood); }
  .nav-cta {
    background: var(--forest); color: var(--cream);
    padding: 10px 20px; border-radius: 999px;
    font-size: 14px; font-weight: 600;
    transition: all 0.3s var(--spring);
  }
  .nav-cta:hover { background: var(--wood); transform: translateY(-1px); }

  /* ========================================
     HERO
     ======================================== */
  .hero {
    background: radial-gradient(ellipse 80% 60% at 50% 40%, var(--forest-2) 0%, var(--forest) 75%);
    color: var(--cream);
    padding: 80px 0 100px;
    position: relative;
    overflow: hidden;
  }
  .hero-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 64px; align-items: center;
    position: relative; z-index: 1;
  }
  .hero h1 {
    font-size: clamp(48px, 5.5vw, 88px);
    margin-bottom: 28px;
    line-height: 1.02;
  }
  .hero h1 .accent {
    color: var(--wood);
    display: block;
    font-style: italic;
    font-variation-settings: "opsz" 144, "SOFT" 80;
  }
  .hero h1 .sub-line {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.18em;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-top: 28px;
    color: ${hexToRgba(cream, 0.7)};
  }

  /* TEXT REVEAL */
  .text-reveal .word {
    display: inline-block;
    opacity: 0;
    transform: translateY(20px);
    animation: revealWord 0.6s var(--smooth) forwards;
  }
  @keyframes revealWord {
    to { opacity: 1; transform: translateY(0); }
  }

  .hero-lead {
    font-size: 19px; line-height: 1.6;
    color: ${hexToRgba(cream, 0.78)};
    max-width: 560px; margin-bottom: 36px;
    opacity: 0;
    animation: fadeInUp 0.8s var(--smooth) 1.4s forwards;
  }
  .hero-lead strong { color: var(--cream); font-weight: 600; }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(15px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .cta-row {
    display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 48px;
    opacity: 0;
    animation: fadeInUp 0.8s var(--smooth) 1.6s forwards;
  }

  .btn {
    padding: 17px 30px;
    border-radius: 999px;
    font-weight: 600; font-size: 15px;
    display: inline-flex; align-items: center; gap: 10px;
    cursor: pointer; border: none;
    transition: all 0.3s var(--spring);
    font-family: var(--font-body);
    letter-spacing: -0.005em;
    position: relative;
    overflow: hidden;
  }

  /* SHIMMER BUTTON */
  .btn-primary {
    background: var(--wood); color: var(--cream);
    box-shadow: 0 8px 24px ${hexToRgba(wood, 0.4)};
  }
  .btn-primary::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      ${hexToRgba(cream, 0.4)} 50%,
      transparent 100%
    );
    animation: shimmer 2.8s infinite;
  }
  @keyframes shimmer {
    0%   { left: -100%; }
    100% { left: 200%; }
  }
  .btn-primary:hover {
    background: var(--wood-hover); transform: translateY(-2px);
    box-shadow: 0 12px 32px ${hexToRgba(wood, 0.5)};
  }
  .btn-primary > * { position: relative; z-index: 1; }

  .btn-ghost {
    background: transparent; color: var(--cream);
    border: 1px solid ${hexToRgba(cream, 0.2)};
  }
  .btn-ghost:hover { background: ${hexToRgba(cream, 0.06)}; border-color: ${hexToRgba(cream, 0.4)}; }
  .btn svg { width: 16px; height: 16px; }

  .trust {
    display: grid; grid-template-columns: repeat(3, auto);
    gap: 16px 40px;
    font-size: 13px;
    font-family: var(--font-mono);
    color: ${hexToRgba(cream, 0.75)};
    opacity: 0;
    animation: fadeInUp 0.8s var(--smooth) 1.8s forwards;
  }
  .trust-item { display: flex; align-items: center; gap: 10px; }
  .trust-item svg { width: 18px; height: 18px; color: var(--wood); flex-shrink: 0; }

  /* Hero Visual */
  .visual {
    position: relative; aspect-ratio: 4/3;
    opacity: 0;
    animation: fadeInUp 1s var(--smooth) 0.8s forwards;
  }
  .visual-main {
    position: absolute; inset: 0;
    border-radius: 32px; overflow: hidden;
    box-shadow: var(--shadow-image);
    display: flex; align-items: flex-end; padding: 28px;
    color: ${hexToRgba(cream, 0.6)}; font-size: 12px;
    font-family: var(--font-mono);
  }

  .compare-card {
    position: absolute; bottom: -8%; left: -8%;
    width: 50%; aspect-ratio: 1;
    border-radius: 24px; overflow: hidden;
    box-shadow: 0 24px 50px rgba(0,0,0,0.5);
    display: grid; grid-template-columns: 1fr 1fr;
    z-index: 2;
  }
  .compare-half {
    position: relative;
    display: flex; align-items: flex-start;
    padding: 14px;
  }
  .compare-before { background: linear-gradient(135deg, #4a3f2e, #6b5a3f); }
  .compare-after  { background: linear-gradient(135deg, #7da66b, #b5d4a3); }
  .compare-pill {
    padding: 5px 12px; border-radius: 999px;
    font-size: 11px; font-weight: 500; color: var(--cream);
    font-family: var(--font-mono);
    letter-spacing: 0.05em;
  }
  .pill-before { background: var(--forest); }
  .pill-after  { background: var(--wood); }
  .compare-divider {
    position: absolute; top: 0; bottom: 0; left: 50%;
    width: 3px; background: var(--wood); transform: translateX(-50%);
  }
  .compare-handle {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 36px; height: 36px;
    background: var(--wood); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: var(--cream); z-index: 3;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  /* ========================================
     SECTION HEADER
     ======================================== */
  .section-head { text-align: center; margin-bottom: 64px; }
  .section-head .eyebrow { display: block; margin-bottom: 20px; }
  .section-head h2 {
    font-size: clamp(40px, 5vw, 64px);
    margin-bottom: 16px;
    line-height: 1.05;
  }
  .section-head h2 .accent {
    color: var(--wood);
    font-style: italic;
    font-variation-settings: "opsz" 144, "SOFT" 80;
  }
  .section-head p {
    color: var(--ink-soft);
    font-size: 18px;
    max-width: 580px;
    margin: 0 auto;
  }

  /* ========================================
     SERVICES
     ======================================== */
  .services-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;
  }
  .service-card {
    background: var(--cream); border: 1px solid var(--border);
    border-radius: 16px; padding: 28px 24px;
    cursor: pointer;
    transition: border-color 0.35s, background 0.35s, box-shadow 0.35s, transform 0.35s var(--spring);
  }
  .service-card:hover {
    border-color: var(--wood-soft);
    background: var(--cream-tint);
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-4px);
  }
  .icon-box {
    width: 56px; height: 56px;
    background: var(--wood); color: var(--cream);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
    transition: transform 0.5s var(--spring);
  }
  .service-card:hover .icon-box { transform: rotate(-8deg) scale(1.05); }
  .icon-box svg { width: 28px; height: 28px; stroke-width: 2; }

  .service-card h3 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 22px;
    line-height: 1.15;
    margin-bottom: 8px;
    letter-spacing: -0.02em;
    font-variation-settings: "opsz" 24, "SOFT" 50;
    transition: color 0.3s;
  }
  .service-card:hover h3 { color: var(--wood); }
  .service-card p {
    color: var(--ink-soft);
    font-size: 14px;
    margin-bottom: 20px;
    line-height: 1.55;
  }
  .service-card .link {
    color: var(--wood); font-size: 13px; font-weight: 500;
    font-family: var(--font-mono);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    display: inline-flex; align-items: center; gap: 6px;
    transition: gap 0.3s;
  }
  .service-card:hover .link { gap: 10px; }
  .service-card .link::after { content: '\\2192'; transition: transform 0.3s; }

  /* ========================================
     UEBER UNS
     ======================================== */
  .about { background: var(--cream); }
  .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
  .about-text .eyebrow { display: block; margin-bottom: 20px; }
  .about-text h2 {
    font-size: clamp(40px, 4.5vw, 56px);
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

  .stats-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 0;
    border-top: 1px solid var(--border);
    border-left: 1px solid var(--border);
  }
  .stat {
    padding: 32px;
    border-right: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .stat-num {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 64px;
    color: var(--wood);
    line-height: 1;
    letter-spacing: -0.04em;
    margin-bottom: 8px;
    font-variant-numeric: tabular-nums;
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }
  .stat-label {
    color: var(--ink-soft);
    font-size: 12px;
    font-weight: 500;
    font-family: var(--font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* ========================================
     WORKFLOW mit BEAM
     ======================================== */
  .workflow { background: var(--bg); padding: 96px 0; }
  .workflow-canvas {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 80px;
    padding: 40px 0;
    max-width: 900px;
    margin: 0 auto;
  }
  .workflow-step { text-align: center; position: relative; z-index: 2; }
  .workflow-step .step-icon {
    width: 80px; height: 80px;
    background: var(--cream);
    border: 2px solid var(--border);
    border-radius: 20px;
    margin: 0 auto 16px;
    display: flex; align-items: center; justify-content: center;
    color: var(--wood);
    box-shadow: 0 8px 24px ${hexToRgba(forest, 0.08)};
    transition: transform 0.4s var(--spring);
  }
  .workflow-step:hover .step-icon { transform: scale(1.08); }
  .workflow-step .step-icon svg { width: 36px; height: 36px; stroke-width: 1.8; }
  .workflow-step .step-num {
    font-family: var(--font-mono);
    font-weight: 500;
    font-size: 11px;
    color: var(--wood);
    letter-spacing: 0.14em;
    margin-bottom: 12px;
  }
  .workflow-step h3 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 24px;
    line-height: 1.15;
    margin-bottom: 8px;
    letter-spacing: -0.02em;
    font-variation-settings: "opsz" 24, "SOFT" 50;
  }
  .workflow-step p {
    color: var(--ink-soft);
    font-size: 14px;
    line-height: 1.55;
    max-width: 260px;
    margin: 0 auto;
  }

  .beam-svg {
    position: absolute;
    top: 40px; left: 0;
    width: 100%; height: 80px;
    pointer-events: none;
    z-index: 1;
  }
  .beam-path {
    fill: none;
    stroke: var(--border);
    stroke-width: 1.5;
    stroke-dasharray: 4 4;
  }
  .beam-pulse {
    fill: none;
    stroke: url(#beam-gradient);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-dasharray: 0 100;
    animation: beamFlow 3.5s linear infinite;
  }
  .beam-pulse.delayed { animation-delay: 1.75s; }
  @keyframes beamFlow {
    0%   { stroke-dasharray: 0 100;  stroke-dashoffset: 0;    opacity: 0; }
    10%  { opacity: 1; }
    50%  { stroke-dasharray: 30 100; }
    90%  { opacity: 1; }
    100% { stroke-dasharray: 0 100;  stroke-dashoffset: -100; opacity: 0; }
  }

  /* ========================================
     MARQUEE
     ======================================== */
  .marquee-section {
    background: var(--forest);
    padding: 32px 0;
    overflow: hidden;
    border-top: 1px solid ${hexToRgba(cream, 0.05)};
    border-bottom: 1px solid ${hexToRgba(cream, 0.05)};
  }
  .marquee-wrapper {
    display: flex;
    overflow: hidden;
    mask-image: linear-gradient(90deg, transparent, white 10%, white 90%, transparent);
    -webkit-mask-image: linear-gradient(90deg, transparent, white 10%, white 90%, transparent);
  }
  .marquee-track {
    display: flex;
    gap: 48px;
    animation: marqueeFlow 40s linear infinite;
    flex-shrink: 0;
    padding-right: 48px;
  }
  @keyframes marqueeFlow {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .marquee-item {
    color: ${hexToRgba(cream, 0.7)};
    font-family: var(--font-display);
    font-style: italic;
    font-weight: 500;
    font-size: 26px;
    letter-spacing: -0.02em;
    font-variation-settings: "opsz" 144, "SOFT" 80;
    display: flex;
    align-items: center;
    gap: 48px;
    white-space: nowrap;
  }
  .marquee-item::after {
    content: '\\2726';
    color: var(--wood);
    font-size: 14px;
    font-style: normal;
  }

  /* ========================================
     CTA-FORM
     ======================================== */
  .cta-section {
    background: radial-gradient(ellipse 80% 60% at 50% 30%, var(--forest-2), var(--forest));
    color: var(--cream);
    border-radius: 32px;
    padding: 64px;
    max-width: 1100px;
    margin: 0 auto;
    position: relative;
    overflow: hidden;
  }
  .cta-section > * { position: relative; z-index: 1; }
  .cta-section .eyebrow { color: var(--wood); margin-bottom: 16px; display: block; }
  .cta-section h2 {
    font-size: clamp(36px, 4.5vw, 60px);
    margin-bottom: 12px;
    line-height: 1.05;
  }
  .cta-section .sub {
    color: ${hexToRgba(cream, 0.7)};
    font-size: 17px;
    max-width: 600px;
    margin-bottom: 36px;
  }

  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 24px; }
  .form-field { display: flex; flex-direction: column; gap: 8px; }
  .form-field.full { grid-column: 1 / -1; }
  .form-field label {
    font-size: 12px;
    font-weight: 500;
    font-family: var(--font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${hexToRgba(cream, 0.7)};
  }
  .form-field input,
  .form-field select,
  .form-field textarea {
    background: ${hexToRgba(cream, 0.06)};
    border: 1px solid ${hexToRgba(cream, 0.1)};
    color: var(--cream);
    padding: 14px 18px;
    border-radius: 12px;
    font-family: var(--font-body);
    font-size: 15px;
    transition: border-color 0.2s, background 0.2s;
  }
  .form-field input:focus,
  .form-field select:focus,
  .form-field textarea:focus {
    outline: none;
    border-color: var(--wood);
    background: ${hexToRgba(cream, 0.1)};
  }
  .form-field textarea { resize: vertical; min-height: 100px; }
  .form-submit { grid-column: 1 / -1; margin-top: 8px; }
  .form-submit .btn { width: 100%; justify-content: center; padding: 18px; font-size: 16px; }

  /* ========================================
     BENTO GRID
     ======================================== */
  .bento-section {
    background: radial-gradient(ellipse 100% 80% at 50% 30%, var(--forest-2) 0%, var(--forest) 70%, #0f1f17 100%);
    color: var(--cream);
    padding: 120px 0;
    position: relative;
    overflow: hidden;
  }
  .bento-section .beams::before,
  .bento-section .beams::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(110deg,
      transparent 30%,
      ${hexToRgba(cream, 0.03)} 45%,
      ${hexToRgba(cream, 0.05)} 50%,
      ${hexToRgba(cream, 0.03)} 55%,
      transparent 70%
    );
    animation: bentoLightSweep 9s ease-in-out infinite;
  }
  .bento-section .beams::after {
    background: linear-gradient(110deg,
      transparent 55%,
      ${hexToRgba(wood, 0.04)} 65%,
      ${hexToRgba(wood, 0.06)} 72%,
      transparent 85%
    );
    animation: bentoLightSweep 13s ease-in-out infinite 4s;
  }
  @keyframes bentoLightSweep {
    0%, 100% { transform: translateX(-10%) translateY(-5%); opacity: 0.4; }
    50%      { transform: translateX(8%)  translateY(5%);   opacity: 1; }
  }

  .bento-section .section-head h2 { color: var(--cream); }
  .bento-section .section-head h2 .accent {
    color: var(--wood);
    font-style: italic;
    font-variation-settings: "opsz" 144, "SOFT" 80;
  }
  .bento-section .section-head p { color: ${hexToRgba(cream, 0.7)}; }

  .bento-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 20px;
  }
  .bento-card           { grid-column: span 2; }
  .bento-card.wide      { grid-column: span 3; }

  .bento-card {
    background: rgba(15, 30, 23, 0.6);
    border: 1px solid ${hexToRgba(cream, 0.08)};
    border-radius: 24px;
    padding: 36px 32px;
    position: relative;
    overflow: hidden;
    min-height: 460px;
    display: flex;
    flex-direction: column;
    transition: border-color 0.4s var(--smooth), transform 0.4s var(--smooth);
    cursor: pointer;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .bento-card:hover {
    border-color: ${hexToRgba(wood, 0.4)};
    transform: translateY(-4px);
  }
  .bento-card::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(110deg, transparent 30%, ${hexToRgba(cream, 0.04)} 50%, transparent 70%);
    opacity: 0;
    transition: opacity 0.5s;
  }
  .bento-card:hover::before { opacity: 1; }

  .bento-card .card-content {
    position: relative; z-index: 2;
    margin-bottom: 24px;
  }
  .bento-card h3 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 24px;
    line-height: 1.2;
    margin-bottom: 12px;
    letter-spacing: -0.02em;
    color: var(--cream);
    font-variation-settings: "opsz" 24, "SOFT" 50;
  }
  .bento-card.wide h3 { font-size: 28px; }
  .bento-card .bento-text {
    color: ${hexToRgba(cream, 0.7)};
    font-size: 15px;
    line-height: 1.55;
    max-width: 92%;
  }

  .card-visual {
    flex: 1;
    position: relative;
    min-height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* === Visual 1: Wachstums-Chart === */
  .visual-chart { width: 100%; height: 100%; position: relative; }
  .chart-svg { width: 100%; height: 200px; }
  .chart-grid line { stroke: ${hexToRgba(cream, 0.05)}; stroke-dasharray: 2 4; }
  .chart-line {
    fill: none;
    stroke: var(--cream);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 600;
    stroke-dashoffset: 600;
  }
  .bento-card:hover .chart-line {
    animation: drawLine 2.5s var(--smooth) forwards;
  }
  .chart-area { fill: url(#chartGradGreen); opacity: 0; }
  .bento-card:hover .chart-area { animation: fadeInArea 1s 1.5s forwards; }
  @keyframes drawLine { to { stroke-dashoffset: 0; } }
  @keyframes fadeInArea { to { opacity: 1; } }

  .chart-node {
    position: absolute;
    width: 52px; height: 52px;
    background: rgba(15, 30, 23, 0.9);
    border: 1px solid ${hexToRgba(wood, 0.3)};
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--wood);
    backdrop-filter: blur(8px);
    box-shadow: 0 0 24px rgba(0,0,0,0.4);
    animation: nodeFloat 4s ease-in-out infinite;
  }
  .chart-node svg { width: 24px; height: 24px; stroke-width: 1.8; }
  .chart-node.n1 { top: 52%; left: 12%; }
  .chart-node.n2 { top: 18%; right: 10%; animation-delay: 1.2s; }
  @keyframes nodeFloat {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-6px); }
  }
  .chart-dot {
    position: absolute;
    width: 12px; height: 12px;
    background: var(--wood);
    border-radius: 50%;
    box-shadow: 0 0 12px ${hexToRgba(wood, 0.7)};
    transform: translate(-50%, -50%);
  }
  .chart-dot.d1 { top: 60%; left: 32%; }
  .chart-dot.d2 { top: 38%; left: 60%; }

  /* === Visual 2: Werkzeuge mit Coin === */
  .visual-tools {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 28px;
    padding-top: 60px;
    position: relative;
    width: 100%;
  }
  .tool-icon {
    width: 64px; height: 90px;
    background: linear-gradient(180deg, ${hexToRgba(wood, 0.25)}, ${hexToRgba(wood, 0.05)});
    border: 1px solid ${hexToRgba(wood, 0.3)};
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--wood);
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
  }
  .tool-icon.center {
    width: 76px; height: 110px;
    background: linear-gradient(180deg, ${hexToRgba(cream, 0.15)}, ${hexToRgba(wood, 0.1)});
    border-color: ${hexToRgba(cream, 0.3)};
    color: var(--cream);
  }
  .tool-icon svg { width: 32px; height: 32px; stroke-width: 1.8; }

  .tool-coin {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px; height: 60px;
    background: radial-gradient(circle at 30% 30%, var(--cream), #d4c5a8);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 26px;
    color: var(--forest);
    box-shadow: 0 4px 24px ${hexToRgba(cream, 0.2)};
  }
  .tool-lines {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .tool-lines line {
    stroke: ${hexToRgba(cream, 0.18)};
    stroke-width: 1;
    stroke-dasharray: 3 3;
  }
  .bento-pill {
    position: absolute;
    background: rgba(15, 30, 23, 0.9);
    border: 1px solid ${hexToRgba(wood, 0.3)};
    color: var(--cream);
    padding: 7px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    white-space: nowrap;
  }
  .bento-pill.left  { left: 0;   top: 42%; animation: pillFloat 3s ease-in-out infinite; }
  .bento-pill.right { right: 0;  top: 42%; animation: pillFloat 3s ease-in-out infinite 1.5s; }
  @keyframes pillFloat {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-4px); }
  }

  /* === Visual 3: Baumringe + Garantie-Karte === */
  .visual-rings {
    position: relative;
    width: 100%;
    height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .tree-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid ${hexToRgba(wood, 0.12)};
  }
  .tree-ring.r1 { width: 180px; height: 180px; }
  .tree-ring.r2 { width: 220px; height: 220px; border-color: ${hexToRgba(wood, 0.1)}; }
  .tree-ring.r3 { width: 280px; height: 280px; border-color: ${hexToRgba(wood, 0.07)}; }
  .tree-ring.r4 { width: 340px; height: 340px; border-color: ${hexToRgba(wood, 0.05)}; }
  .tree-ring.r5 { width: 400px; height: 400px; border-color: ${hexToRgba(wood, 0.03)}; }
  .ring-pulse {
    position: absolute;
    width: 220px; height: 220px;
    border-radius: 50%;
    border: 1px solid var(--wood);
    opacity: 0;
    animation: ringPulse 3s ease-out infinite;
  }
  @keyframes ringPulse {
    0%   { width: 180px; height: 180px; opacity: 0.6; }
    100% { width: 380px; height: 380px; opacity: 0; }
  }
  .garantie-card {
    position: relative;
    width: 140px;
    background: rgba(15, 30, 23, 0.95);
    border: 1px solid ${hexToRgba(wood, 0.3)};
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    backdrop-filter: blur(12px);
    z-index: 2;
  }
  .garantie-head {
    background: var(--wood);
    color: var(--cream);
    padding: 8px 12px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 500;
  }
  .garantie-body {
    padding: 20px 16px;
    text-align: center;
  }
  .garantie-num {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 60px;
    line-height: 1;
    color: var(--cream);
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }
  .garantie-label {
    color: ${hexToRgba(cream, 0.6)};
    font-size: 11px;
    font-family: var(--font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-top: 6px;
  }

  /* === Visual 4: Garten-Radar (wide) === */
  .visual-radar {
    position: relative;
    width: 100%;
    height: 260px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    overflow: hidden;
  }
  .radar-base {
    position: absolute;
    bottom: -100px;
    left: 50%;
    transform: translateX(-50%);
    width: 500px;
    height: 500px;
  }
  .radar-ring {
    position: absolute;
    border: 1px solid ${hexToRgba(wood, 0.08)};
    border-radius: 50%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .radar-ring.rr1 { width: 200px; height: 200px; }
  .radar-ring.rr2 { width: 320px; height: 320px; border-color: ${hexToRgba(wood, 0.06)}; }
  .radar-ring.rr3 { width: 440px; height: 440px; border-color: ${hexToRgba(wood, 0.04)}; }

  .radar-sweep {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 440px;
    height: 440px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: conic-gradient(
      from -90deg,
      transparent 0deg,
      ${hexToRgba(wood, 0.25)} 30deg,
      ${hexToRgba(wood, 0.08)} 60deg,
      transparent 90deg
    );
    animation: radarRotate 5s linear infinite;
    mask: linear-gradient(black 50%, transparent 50%);
    -webkit-mask: linear-gradient(black 50%, transparent 50%);
  }
  @keyframes radarRotate {
    from { transform: translate(-50%, -50%) rotate(-90deg); }
    to   { transform: translate(-50%, -50%) rotate(270deg); }
  }

  .radar-node {
    position: absolute;
    width: 52px; height: 52px;
    background: radial-gradient(circle at 30% 30%, rgba(45, 82, 64, 0.95), rgba(15, 30, 23, 0.95));
    border: 1px solid ${hexToRgba(wood, 0.25)};
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--wood);
    box-shadow: 0 6px 20px rgba(0,0,0,0.5);
    z-index: 3;
  }
  .radar-node svg { width: 24px; height: 24px; stroke-width: 1.8; }
  .radar-node.p1 { bottom: 30px;  left: 10%; }
  .radar-node.p2 { bottom: 130px; left: 22%; }
  .radar-node.p3 { bottom: 130px; right: 22%; }
  .radar-node.p4 { bottom: 30px;  right: 10%; }
  .radar-node.center {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 64px; height: 64px;
    background: radial-gradient(circle at 30% 30%, var(--cream), var(--wood));
    color: var(--forest);
    border-color: ${hexToRgba(cream, 0.3)};
  }
  .radar-node.center svg { width: 28px; height: 28px; stroke-width: 2; }

  /* === Visual 5: Crew-Verbindungsgraph (wide) === */
  .visual-graph {
    position: relative;
    width: 100%;
    height: 240px;
  }
  .graph-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .graph-line {
    stroke: ${hexToRgba(wood, 0.15)};
    stroke-width: 1;
    stroke-dasharray: 3 3;
    fill: none;
  }
  .graph-pulse {
    stroke: var(--wood);
    stroke-width: 1.5;
    stroke-dasharray: 0 200;
    stroke-linecap: round;
    fill: none;
    animation: graphPulse 4s linear infinite;
  }
  .graph-pulse.d1 { animation-delay: 1s; }
  .graph-pulse.d2 { animation-delay: 2s; }
  .graph-pulse.d3 { animation-delay: 3s; }
  @keyframes graphPulse {
    0%   { stroke-dasharray: 0 200;  stroke-dashoffset: 0; }
    50%  { stroke-dasharray: 20 200; }
    100% { stroke-dasharray: 0 200;  stroke-dashoffset: -200; }
  }
  .graph-avatar {
    position: absolute;
    width: 50px; height: 50px;
    background: rgba(45, 82, 64, 0.9);
    border: 1px solid ${hexToRgba(wood, 0.25)};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${hexToRgba(cream, 0.5)};
    backdrop-filter: blur(8px);
  }
  .graph-avatar svg { width: 24px; height: 24px; stroke-width: 1.7; }
  .graph-avatar.center {
    width: 96px;
    height: 96px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, var(--cream), #d4c5a8);
    color: var(--forest);
    box-shadow: 0 0 32px ${hexToRgba(cream, 0.15)};
    z-index: 3;
    border-color: ${hexToRgba(cream, 0.2)};
  }
  .graph-avatar.center svg { width: 48px; height: 48px; stroke-width: 1.5; }
  .graph-avatar.a1 { top: 50%; left: 18%; transform: translateY(-50%); }
  .graph-avatar.a2 { top: 50%; left: 32%; transform: translateY(-50%); }
  .graph-avatar.a3 { top: 50%; right: 32%; transform: translateY(-50%); }
  .graph-avatar.a4 { top: 50%; right: 18%; transform: translateY(-50%); }
  .graph-pill {
    position: absolute;
    background: rgba(15, 30, 23, 0.9);
    border: 1px solid ${hexToRgba(wood, 0.25)};
    color: var(--cream);
    padding: 7px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    white-space: nowrap;
  }
  .graph-pill.gp1 { top: 8%;     left: 14%; }
  .graph-pill.gp2 { top: 8%;     right: 14%; }
  .graph-pill.gp3 { bottom: 8%;  left: 20%; }
  .graph-pill.gp4 { bottom: 8%;  right: 14%; }

  /* ========================================
     FOOTER
     ======================================== */
  footer { background: var(--forest); color: ${hexToRgba(cream, 0.7)}; padding: 64px 0 32px; }
  .footer-grid {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 48px; margin-bottom: 48px;
  }
  .footer-brand .logo { color: var(--cream); margin-bottom: 16px; }
  .footer-brand p { font-size: 14px; line-height: 1.6; max-width: 320px; }
  .footer-col h4 {
    color: var(--cream);
    font-size: 11px;
    font-weight: 500;
    font-family: var(--font-mono);
    text-transform: uppercase; letter-spacing: 0.12em;
    margin-bottom: 20px;
  }
  .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .footer-col a { font-size: 14px; transition: color 0.2s; }
  .footer-col a:hover { color: var(--wood); }
  .footer-bottom {
    border-top: 1px solid ${hexToRgba(cream, 0.1)};
    padding-top: 24px;
    display: flex; justify-content: space-between;
    font-size: 12px;
    font-family: var(--font-mono);
    letter-spacing: 0.05em;
    color: ${hexToRgba(cream, 0.4)};
  }
  .footer-bottom a { transition: color 0.2s; }
  .footer-bottom a:hover { color: var(--wood); }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .services-grid { grid-template-columns: repeat(2, 1fr); }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .workflow-canvas { grid-template-columns: 1fr; gap: 48px; }
    .beam-svg { display: none; }
    .bento-grid { grid-template-columns: 1fr 1fr; }
    .bento-card, .bento-card.wide { grid-column: span 1; }
  }
  @media (max-width: 768px) {
    section { padding: 64px 0; }
    .container { padding: 0 20px; }
    .hero-grid { grid-template-columns: 1fr; gap: 48px; }
    .about-grid { grid-template-columns: 1fr; gap: 48px; }
    .services-grid { grid-template-columns: 1fr; }
    .trust { grid-template-columns: 1fr 1fr; }
    .form-grid { grid-template-columns: 1fr; }
    .cta-section { padding: 40px 28px; border-radius: 24px; }
    .nav-links { display: none; }
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .footer-bottom { flex-direction: column; gap: 12px; }
    .marquee-item { font-size: 20px; gap: 32px; }
    .bento-grid { grid-template-columns: 1fr; }
    .bento-card { min-height: 400px; padding: 28px 24px; }
  }
</style>
${heroVisualAfter}
</head>
<body>

<!-- ====== NAV ====== -->
<nav>
  <div class="nav-inner">
    <a href="#" class="logo">
      <span class="logo-mark">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C7 7 5 12 8 17C10 14 12 12 14 14C16 10 12 6 12 2Z"/><path d="M12 14V22"/></svg>
      </span>
      ${e(c.name)}<span>.</span>
    </a>
    <div class="nav-links">
      <a href="#services">Leistungen</a>
      <a href="#about">&Uuml;ber uns</a>
      ${workflowSteps.length > 0 ? '<a href="#workflow">Ablauf</a>' : ''}
      <a href="#contact">Kontakt</a>
    </div>
    <a href="#contact" class="nav-cta">${e(c.ctaText)}</a>
  </div>
</nav>

<!-- ====== HERO ====== -->
<section class="hero">
  <div class="animated-grid" id="heroGrid"></div>

  <div class="container hero-grid">
    <div>
      <h1 class="display large text-reveal" id="heroHeadline">
        ${e(c.heroHeadline)}
        <span class="accent">${e(c.heroAccent)}</span>
        <span class="sub-line">${e(c.heroSubline)}</span>
      </h1>
      <p class="hero-lead">
        ${c.heroLead}
      </p>
      <div class="cta-row">
        <a href="#contact" class="btn btn-primary">${e(c.ctaText)}</a>
        ${c.phone ? `<a href="tel:${e(c.phone.replace(/[^+0-9]/g, ''))}" class="btn btn-ghost">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          ${e(c.phone)}
        </a>` : (c.ctaSecondaryText ? `<a href="#contact" class="btn btn-ghost">${e(c.ctaSecondaryText)}</a>` : '')}
      </div>
      ${trustItems.length > 0 ? `<div class="trust">
        ${trustItems.map(item => `<div class="trust-item">${getTrustIcon(item.icon)}${e(item.text)}</div>`).join('\n        ')}
      </div>` : ''}
    </div>
    <div class="visual">
      <div class="visual-main" style="${heroVisualStyle}"></div>
      <div class="compare-card">
        <div class="compare-half compare-before"><span class="compare-pill pill-before">Vorher</span></div>
        <div class="compare-half compare-after"><span class="compare-pill pill-after">Nachher</span></div>
        <div class="compare-divider"></div>
        <div class="compare-handle">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 4l-4 4 4 4M3 8h13M17 20l4-4-4-4M21 16H8"/></svg>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ====== SERVICES ====== -->
<section id="services">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Unsere Leistungen</span>
      <h2 class="display">${services.length} Gewerke. <span class="accent">Ein</span> Team.</h2>
      <p>Vom Entwurf bis zur Pflege &ndash; alles aus einer Hand.</p>
    </div>
    <div class="services-grid">
      ${services.map(s => `
      <div class="service-card">
        <div class="icon-box">${s.icon}</div>
        <h3>${e(s.title)}</h3>
        <p>${e(s.description)}</p>
        <a class="link">Mehr erfahren</a>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- ====== UEBER UNS ====== -->
<section id="about" class="about">
  <div class="container about-grid">
    <div class="about-text">
      <span class="eyebrow">Wer wir sind</span>
      <h2 class="display">${config.aboutTitle}</h2>
      <p>${config.aboutText}</p>
      ${config.aboutText2 ? `<p>${config.aboutText2}</p>` : ''}
    </div>
    <div class="stats-grid">
      ${stats.map(s => `
      <div class="stat">
        <div class="stat-num" data-target="${e(s.value.replace(/[^0-9]/g, ''))}" ${s.value.replace(/[0-9]/g, '').trim() ? `data-suffix="${e(s.value.replace(/[0-9]/g, '').trim())}"` : ''}>${e(s.value)}</div>
        <div class="stat-label">${e(s.label)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

${uspItems.length > 0 ? `
<!-- ====== WARUM ${e(c.name).toUpperCase()} - BENTO GRID ====== -->
<section class="bento-section">
  <div class="beams"></div>
  <div class="container">

    <div class="section-head">
      <span class="eyebrow">Warum ${e(c.name)}</span>
      <h2 class="display">Mehr als ein <span class="accent">Dienstleister</span>.</h2>
      <p>${uspItems.length} Gr&uuml;nde, warum Kunden uns vertrauen &ndash; und weiterempfehlen.</p>
    </div>

    <div class="bento-grid">

      <!-- ===== KARTE 1 ===== -->
      ${uspItems[0] ? `<div class="bento-card">
        <div class="card-content">
          <h3>${e(uspItems[0].title)}</h3>
          <p class="bento-text">${e(uspItems[0].description)}</p>
        </div>
        <div class="card-visual">
          <div class="visual-chart">
            <svg class="chart-svg" viewBox="0 0 400 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stop-color="${hexToRgba(wood, 0.25)}"/>
                  <stop offset="100%" stop-color="${hexToRgba(wood, 0)}"/>
                </linearGradient>
              </defs>
              <g class="chart-grid">
                <line x1="0" y1="50"  x2="400" y2="50"/>
                <line x1="0" y1="100" x2="400" y2="100"/>
                <line x1="0" y1="150" x2="400" y2="150"/>
              </g>
              <path class="chart-area" d="M 10 160 Q 80 155 120 130 T 220 95 T 320 55 T 390 35 L 390 200 L 10 200 Z"/>
              <path class="chart-line" d="M 10 160 Q 80 155 120 130 T 220 95 T 320 55 T 390 35"/>
            </svg>
            <div class="chart-dot d1"></div>
            <div class="chart-dot d2"></div>
            <div class="chart-node n1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22V10"/><path d="M12 10C9 10 6 8 6 4C9 4 12 6 12 10Z"/><path d="M12 10C15 10 18 8 18 4C15 4 12 6 12 10Z"/></svg>
            </div>
            <div class="chart-node n2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22V14"/><path d="M8 14C4 14 4 10 6 8C5 6 6 4 8 4C8 2 10 2 12 3C14 2 16 2 16 4C18 4 19 6 18 8C20 10 20 14 16 14Z"/></svg>
            </div>
          </div>
        </div>
      </div>` : ''}

      <!-- ===== KARTE 2 ===== -->
      ${uspItems[1] ? `<div class="bento-card">
        <div class="card-content">
          <h3>${e(uspItems[1].title)}</h3>
          <p class="bento-text">${e(uspItems[1].description)}</p>
        </div>
        <div class="card-visual" style="position:relative;">
          <svg class="tool-lines" viewBox="0 0 300 200" preserveAspectRatio="none">
            <line x1="70"  y1="100" x2="150" y2="40"/>
            <line x1="230" y1="100" x2="150" y2="40"/>
          </svg>
          <div class="tool-coin">&euro;</div>
          <div class="bento-pill left">${e(uspItems[1].highlight || 'Festpreis')}</div>
          <div class="bento-pill right">Transparent</div>
          <div class="visual-tools">
            <div class="tool-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2V14"/><path d="M8 14H16L17 20C17 21 16 22 15 22H9C8 22 7 21 7 20Z"/></svg>
            </div>
            <div class="tool-icon center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 4L20 10L18 12L12 6Z"/><path d="M3 21L11 13"/><path d="M9 11L13 15"/></svg>
            </div>
            <div class="tool-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 5L7 5L11 14L19 14L21 8L9 8"/><circle cx="9" cy="20" r="2"/></svg>
            </div>
          </div>
        </div>
      </div>` : ''}

      <!-- ===== KARTE 3 ===== -->
      ${uspItems[2] ? `<div class="bento-card">
        <div class="card-content">
          <h3>${e(uspItems[2].title)}</h3>
          <p class="bento-text">${e(uspItems[2].description)}</p>
        </div>
        <div class="card-visual">
          <div class="visual-rings">
            <div class="tree-ring r5"></div>
            <div class="tree-ring r4"></div>
            <div class="tree-ring r3"></div>
            <div class="tree-ring r2"></div>
            <div class="tree-ring r1"></div>
            <div class="ring-pulse"></div>
            <div class="garantie-card">
              <div class="garantie-head">Garantie</div>
              <div class="garantie-body">
                <div class="garantie-num">${e(uspItems[2].highlight || '5')}</div>
                <div class="garantie-label">Jahre</div>
              </div>
            </div>
          </div>
        </div>
      </div>` : ''}

      <!-- ===== KARTE 4 (wide) ===== -->
      ${uspItems[3] ? `<div class="bento-card wide">
        <div class="card-content">
          <h3>${e(uspItems[3].title)}</h3>
          <p class="bento-text">${e(uspItems[3].description)}</p>
        </div>
        <div class="card-visual">
          <div class="visual-radar">
            <div class="radar-base">
              <div class="radar-ring rr1"></div>
              <div class="radar-ring rr2"></div>
              <div class="radar-ring rr3"></div>
              <div class="radar-sweep"></div>
            </div>
            <div class="radar-node p1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2C7 7 5 12 8 17C10 14 12 12 14 14C16 10 12 6 12 2Z"/><path d="M12 14V22"/></svg>
            </div>
            <div class="radar-node p2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </div>
            <div class="radar-node p3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2C8 7 6 11 6 15C6 19 9 22 12 22C15 22 18 19 18 15C18 11 16 7 12 2Z"/></svg>
            </div>
            <div class="radar-node p4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>
            </div>
            <div class="radar-node center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12L12 4L21 12"/><path d="M5 10V20H19V10"/><path d="M10 20V14H14V20"/></svg>
            </div>
          </div>
        </div>
      </div>` : ''}

      <!-- ===== KARTE 5 (wide) ===== -->
      ${uspItems[4] ? `<div class="bento-card wide">
        <div class="card-content">
          <h3>${e(uspItems[4].title)}</h3>
          <p class="bento-text">${e(uspItems[4].description)}</p>
        </div>
        <div class="card-visual">
          <div class="visual-graph">
            <svg class="graph-svg" viewBox="0 0 600 240" preserveAspectRatio="none">
              <path class="graph-line" d="M 300 120 L 180 120"/>
              <path class="graph-line" d="M 300 120 L 240 120"/>
              <path class="graph-line" d="M 300 120 L 360 120"/>
              <path class="graph-line" d="M 300 120 L 420 120"/>
              <path class="graph-line" d="M 300 120 L 160 30"/>
              <path class="graph-line" d="M 300 120 L 470 30"/>
              <path class="graph-line" d="M 300 120 L 200 210"/>
              <path class="graph-line" d="M 300 120 L 470 210"/>
              <path class="graph-pulse"    d="M 300 120 L 160 30"/>
              <path class="graph-pulse d1" d="M 300 120 L 470 30"/>
              <path class="graph-pulse d2" d="M 300 120 L 200 210"/>
              <path class="graph-pulse d3" d="M 300 120 L 470 210"/>
            </svg>

            <div class="graph-pill gp1">Leitung</div>
            <div class="graph-pill gp2">Planung</div>
            <div class="graph-pill gp3">Umsetzung</div>
            <div class="graph-pill gp4">Pflege</div>

            <div class="graph-avatar a1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
            </div>
            <div class="graph-avatar a2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
            </div>
            <div class="graph-avatar center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="9" r="4"/><path d="M3 21c0-5 4-8 9-8s9 3 9 8"/><path d="M6 6h12L16 3H8Z"/></svg>
            </div>
            <div class="graph-avatar a3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
            </div>
            <div class="graph-avatar a4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
            </div>
          </div>
        </div>
      </div>` : ''}

    </div>
  </div>
</section>` : ''}

${workflowSteps.length > 0 ? `
<!-- ====== WORKFLOW ====== -->
<section id="workflow" class="workflow">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">So l&auml;uft es ab</span>
      <h2 class="display">In <span class="accent">${workflowSteps.length === 3 ? 'drei' : workflowSteps.length.toString()} Schritten</span> zum Ergebnis.</h2>
      <p>Klar, transparent, ohne versteckte Kosten.</p>
    </div>

    <div class="workflow-canvas">
      <svg class="beam-svg" viewBox="0 0 800 80" preserveAspectRatio="none">
        <defs>
          <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"  stop-color="${wood}" stop-opacity="0"/>
            <stop offset="50%" stop-color="${wood}" stop-opacity="1"/>
            <stop offset="100%" stop-color="${wood}" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path class="beam-path" d="M 140 40 Q 270 -20 400 40"/>
        <path class="beam-pulse" d="M 140 40 Q 270 -20 400 40"/>
        <path class="beam-path" d="M 400 40 Q 530 100 660 40"/>
        <path class="beam-pulse delayed" d="M 400 40 Q 530 100 660 40"/>
      </svg>

      ${workflowSteps.map((step, i) => `
      <div class="workflow-step">
        <div class="step-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">${i === 0 ? '<path d="M3 3h18v18H3z"/><path d="M3 9h18M9 21V9"/>' : i === 1 ? '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>' : '<path d="M12 2C7 7 5 12 8 17C10 14 12 12 14 14C16 10 12 6 12 2Z"/><path d="M12 14V22"/>'}</svg>
        </div>
        <div class="step-num">SCHRITT 0${i + 1}</div>
        <h3>${e(step.title)}</h3>
        <p>${e(step.description)}</p>
      </div>`).join('')}
    </div>
  </div>
</section>` : ''}

${marqueeItems.length > 0 ? `
<!-- ====== MARQUEE ====== -->
<section class="marquee-section">
  <div class="marquee-wrapper">
    <div class="marquee-track">
      ${marqueeItems.concat(marqueeItems).map(item => `<span class="marquee-item">${e(item)}</span>`).join('\n      ')}
    </div>
  </div>
</section>` : ''}

${reviewsHtml}

${faqHtml}

<!-- ====== CTA ====== -->
<section id="contact">
  <div class="container">
    <div class="cta-section">
      <span class="eyebrow">${e(config.ctaSectionEyebrow || 'Beratungstermin')}</span>
      <h2 class="display">${config.ctaSectionTitle || `${e(c.ctaText)} &ndash; <span class="accent">jetzt anfragen</span>`}</h2>
      <p class="sub">${e(config.ctaSectionSubline || 'Kostenlose Beratung, anschlie\\u00dfend verbindliches Angebot. Keine versteckten Kosten.')}</p>

      <form id="contact-form" class="form-grid" onsubmit="event.preventDefault();">
        <div class="form-field">
          <label for="name">Name*</label>
          <input id="name" name="name" type="text" required>
        </div>
        <div class="form-field">
          <label for="email">E-Mail*</label>
          <input id="email" name="email" type="email" required>
        </div>
        <div class="form-field">
          <label for="tel">Telefon</label>
          <input id="tel" name="phone" type="tel">
        </div>
        <div class="form-field">
          <label for="subject">Betreff</label>
          <input id="subject" name="subject" type="text">
        </div>
        <div class="form-field full">
          <label for="msg">Ihre Nachricht (optional)</label>
          <textarea id="msg" name="message" placeholder="Beschreiben Sie Ihr Vorhaben..."></textarea>
        </div>
        <div class="form-submit">
          <button type="submit" id="cta-submit" class="btn btn-primary"><span>${e(c.ctaText)} &rarr;</span></button>
        </div>
      </form>
    </div>
  </div>
</section>

<!-- ====== FOOTER ====== -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#" class="logo">
          <span class="logo-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C7 7 5 12 8 17C10 14 12 12 14 14C16 10 12 6 12 2Z"/><path d="M12 14V22"/></svg>
          </span>
          ${e(c.name)}<span>.</span>
        </a>
        <p>${e(config.footerTagline || c.tagline)}</p>
      </div>
      ${footerServices.length > 0 ? `<div class="footer-col">
        <h4>Leistungen</h4>
        <ul>
          ${footerServices.map(s => `<li><a href="#services">${e(s)}</a></li>`).join('\n          ')}
        </ul>
      </div>` : `<div class="footer-col">
        <h4>Leistungen</h4>
        <ul>
          ${services.slice(0, 4).map(s => `<li><a href="#services">${e(s.title)}</a></li>`).join('\n          ')}
        </ul>
      </div>`}
      <div class="footer-col">
        <h4>Unternehmen</h4>
        <ul>
          <li><a href="#about">&Uuml;ber uns</a></li>
          ${workflowSteps.length > 0 ? '<li><a href="#workflow">Ablauf</a></li>' : ''}
          <li><a href="#contact">Kontakt</a></li>
          ${footerCompanyLinks.map(l => `<li><a href="${e(l.href)}">${e(l.label)}</a></li>`).join('\n          ')}
        </ul>
      </div>
      <div class="footer-col">
        <h4>Kontakt</h4>
        <ul>
          ${c.phone ? `<li>${e(c.phone)}</li>` : ''}
          ${c.email ? `<li>${e(c.email)}</li>` : ''}
          ${c.address ? `<li>${c.address}</li>` : ''}
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; ${new Date().getFullYear()} ${e(c.name)}. Alle Rechte vorbehalten.</span>
      <span><a href="${e(c.imprint)}">Impressum</a> &middot; <a href="${e(c.privacy)}">Datenschutz</a></span>
    </div>
  </div>
</footer>

<!-- JavaScript fuer Effekte -->
<script>
  /* Grid Pattern */
  (function buildGrid() {
    var grid = document.getElementById('heroGrid');
    if (!grid) return;
    var cols = 24, rows = 12, cellW = 60, cellH = 60;
    var w = cols * cellW, h = rows * cellH;
    var cells = '';
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        if (Math.random() < 0.25) {
          cells += '<rect class="grid-cell" x="' + (x*cellW) + '" y="' + (y*cellH) + '" width="' + (cellW-2) + '" height="' + (cellH-2) + '" rx="4"/>';
        }
      }
    }
    grid.innerHTML = '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid slice">' + cells + '</svg>';
  })();

  /* Text Reveal */
  (function textReveal() {
    var headline = document.getElementById('heroHeadline');
    if (!headline) return;
    function wrapWords(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        var words = node.textContent.split(/(\\s+)/);
        var fragment = document.createDocumentFragment();
        words.forEach(function(word) {
          if (word.trim()) {
            var span = document.createElement('span');
            span.className = 'word';
            span.textContent = word;
            fragment.appendChild(span);
          } else if (word) {
            fragment.appendChild(document.createTextNode(word));
          }
        });
        node.parentNode.replaceChild(fragment, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(wrapWords);
      }
    }
    wrapWords(headline);
    headline.querySelectorAll('.word').forEach(function(w, i) {
      w.style.animationDelay = (i * 0.08) + 's';
    });
  })();

  /* Number Ticker */
  (function numberTicker() {
    var stats = document.querySelectorAll('.stat-num[data-target]');
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.dataset.target, 10);
          var suffix = el.dataset.suffix || '';
          var duration = 1500;
          var startTime = performance.now();
          function tick(now) {
            var elapsed = now - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var value = Math.round(target * eased);
            el.textContent = value + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    stats.forEach(function(s) { observer.observe(s); });
  })();

  /* Beam Observer */
  (function beamObserver() {
    var beams = document.querySelectorAll('.beam-pulse');
    var workflow = document.querySelector('.workflow');
    if (!workflow) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        beams.forEach(function(b) {
          b.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
        });
      });
    }, { threshold: 0.2 });
    observer.observe(workflow);
  })();

  /* FAQ Accordion */
  document.querySelectorAll('.faq-q').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item = btn.closest('.faq-item');
      var isOpen = item.querySelector('.faq-a').style.maxHeight !== '0px' && item.querySelector('.faq-a').style.maxHeight !== '';
      document.querySelectorAll('.faq-item .faq-a').forEach(function(a) { a.style.maxHeight = '0px'; });
      document.querySelectorAll('.faq-q').forEach(function(b) { b.setAttribute('aria-expanded', 'false'); b.querySelector('svg').style.transform = 'rotate(0deg)'; });
      if (!isOpen) {
        var answer = item.querySelector('.faq-a');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
        btn.querySelector('svg').style.transform = 'rotate(180deg)';
      }
    });
  });

  /* Contact Form */
  ${siteId ? `
  var ctaBtn = document.getElementById('cta-submit');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', async function() {
      var form = document.getElementById('contact-form');
      if (!form) return;
      var data = {};
      form.querySelectorAll('input, textarea').forEach(function(i) { if (i.name && i.value) data[i.name] = i.value; });
      if (!data.name || !data.email) { alert('Name und E-Mail sind Pflichtfelder.'); return; }
      ctaBtn.textContent = 'Wird gesendet...';
      ctaBtn.disabled = true;
      try {
        var r = await fetch('${appUrl}/api/public/forms/${siteId}/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        var d = await r.json();
        if (d.success) {
          form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:${cream};font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:${hexToRgba(cream, 0.7)};font-size:1.05rem">Wir melden uns schnellstm\\u00f6glich bei Ihnen.</p></div>';
        } else {
          alert(d.error || 'Fehler beim Senden.');
          ctaBtn.innerHTML = '<span>${e(c.ctaText)} &rarr;</span>';
          ctaBtn.disabled = false;
        }
      } catch (err) {
        alert('Verbindungsfehler. Bitte versuchen Sie es erneut.');
        ctaBtn.innerHTML = '<span>${e(c.ctaText)} &rarr;</span>';
        ctaBtn.disabled = false;
      }
    });
  }` : `
  var ctaBtn = document.getElementById('cta-submit');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', function() {
      alert('Demo-Modus: Formular ist nicht verbunden.');
    });
  }`}
</script>

<!-- Cookie Banner -->
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:${hexToRgba(forest, 0.97)};backdrop-filter:blur(12px);color:#fff;padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:rgba(255,255,255,.8)">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="${e(c.privacy)}" style="color:#fff;text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:#fff;color:${forest};border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
  </div>
</div>
<script>if(!localStorage.getItem('cookies_accepted')){document.getElementById('cookie-banner').style.display='block'}</script>

${trackingScript}
</body>
</html>`
}
