function e(str: string | undefined | null): string {
  if (!str) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export interface FloristikEdelConfig {
  businessName: string
  tagline: string
  heroHeadline: string
  heroAccent: string
  heroLead: string
  heroTag: string
  announceText?: string
  ctaText: string
  colors: {
    primary: string
    accent: string
    background: string
    text: string
  }
  phone?: string
  email?: string
  address?: string
  openingHours?: { days: string; hours: string }[]
  occasions: { icon: string; title: string; description: string }[]
  products: { name: string; description: string; price: string; badge?: string; imageUrl?: string }[]
  seasonalHighlight?: { title: string; description: string; items: string[] }
  deliveryZones?: { zone: string; time: string; price: string }[]
  aboOptions?: { frequency: string; price: string; note?: string; featured?: boolean }[]
  reviews: { text: string; name: string; rating: number }[]
  faqItems?: { question: string; answer: string }[]
  trustItems?: { text: string }[]
  aboutTitle?: string
  aboutText?: string
  heroImageUrl?: string
  heroImage2Url?: string
  heroImage3Url?: string
}

export function renderFloristikEdelTemplate(config: FloristikEdelConfig, siteId?: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  const c = {
    name: config.businessName || 'Atelier Florale Frankfurt',
    tagline: config.tagline || 'Florales Design auf hoechstem Niveau',
    heroHeadline: config.heroHeadline || 'Blumen sind unsere Sprache der Eleganz.',
    heroAccent: config.heroAccent || 'Eleganz',
    heroLead: config.heroLead || '',
    heroTag: config.heroTag || '',
    announceText: config.announceText || '',
    ctaText: config.ctaText || 'Kollektion entdecken',
    primary: config.colors?.primary || '#4a2040',
    accent: config.colors?.accent || '#c8a96e',
    background: config.colors?.background || '#faf5ee',
    text: config.colors?.text || '#2a2028',
    phone: config.phone || '',
    email: config.email || '',
    address: config.address || '',
    aboutTitle: config.aboutTitle || '',
    aboutText: config.aboutText || '',
    heroImageUrl: config.heroImageUrl || '',
    heroImage2Url: config.heroImage2Url || '',
    heroImage3Url: config.heroImage3Url || '',
  }

  const occasions = config.occasions || []
  const products = config.products || []
  const deliveryZones = config.deliveryZones || []
  const reviews = config.reviews || []
  const faqItems = config.faqItems || []
  const trustItems = config.trustItems || []
  const seasonalHighlight = config.seasonalHighlight
  const openingHours = config.openingHours || []
  const aboOptions = config.aboOptions || [
    { frequency: 'Wöchentlich', price: '45 €', note: 'pro Lieferung' },
    { frequency: '14-tägig', price: '55 €', note: 'pro Lieferung · beliebt', featured: true },
    { frequency: 'Monatlich', price: '68 €', note: 'pro Lieferung' },
  ]

  const imgVariants = ['var-1', 'var-2', 'var-3', 'var-4']

  function badgeClass(badge?: string): string {
    if (!badge) return ''
    const lower = badge.toLowerCase()
    if (lower === 'neu' || lower === 'new') return 'new'
    if (lower === 'bestseller') return 'bestseller'
    if (lower === 'saison' || lower === 'season') return 'season'
    if (lower === 'exklusiv') return 'exclusive'
    return ''
  }

  function starsSvg(rating: number): string {
    const full = Math.round(Math.min(5, Math.max(0, rating)))
    return Array.from({ length: full }, () => '&#9733;').join('')
  }

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${e(c.name)} | ${e(c.tagline)}</title>
<meta name="description" content="${e(c.tagline)} — ${e(c.name)}. Brautstrauß, Trauerkranz, Tischschmuck und saisonale Arrangements. Slow Flower Philosophie.">
<meta property="og:title" content="${e(c.name)} | ${e(c.tagline)}">
<meta property="og:description" content="${e(c.heroLead || c.tagline)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="de_DE">
${c.heroImageUrl ? `<meta property="og:image" content="${e(c.heroImageUrl)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${e(c.name)} | ${e(c.tagline)}">
<meta name="twitter:description" content="${e(c.heroLead || c.tagline)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,400..900,30..100&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">

<!-- Schema.org Florist -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Florist",
  "name": "${e(c.name)}",
  "description": "${e(c.tagline)}",
  ${c.phone ? `"telephone": "${e(c.phone)}",` : ''}
  ${c.email ? `"email": "${e(c.email)}",` : ''}
  ${c.address ? `"address": { "@type": "PostalAddress", "streetAddress": "${e(c.address)}" },` : ''}
  ${c.heroImageUrl ? `"image": "${e(c.heroImageUrl)}",` : ''}
  "priceRange": "€€€",
  "url": "${typeof window !== 'undefined' ? 'window.location.href' : ''}"
}
</script>

<style>
  /* ========================================
     DESIGN TOKENS — Floristik Edel
     ======================================== */
  :root {
    --aubergine:       ${e(c.primary)};
    --aubergine-dark:  color-mix(in srgb, ${e(c.primary)} 75%, #000);
    --aubergine-soft:  color-mix(in srgb, ${e(c.primary)} 12%, transparent);
    --aubergine-mist:  color-mix(in srgb, ${e(c.primary)} 6%, ${e(c.background)});
    --gold:            ${e(c.accent)};
    --gold-dark:       color-mix(in srgb, ${e(c.accent)} 70%, #000);
    --gold-soft:       color-mix(in srgb, ${e(c.accent)} 18%, transparent);
    --gold-glow:       color-mix(in srgb, ${e(c.accent)} 8%, transparent);
    --cream:           ${e(c.background)};
    --cream-tint:      color-mix(in srgb, ${e(c.background)} 92%, #d4c8b0);
    --cream-warm:      color-mix(in srgb, ${e(c.background)} 85%, #c8b898);
    --ink:             ${e(c.text)};
    --ink-soft:        color-mix(in srgb, ${e(c.text)} 55%, #999);
    --border:          color-mix(in srgb, ${e(c.accent)} 20%, #e8e0d0);

    --shadow-card:   0 12px 40px rgba(74, 32, 64, 0.07);
    --shadow-image:  0 24px 64px rgba(74, 32, 64, 0.16);
    --shadow-hover:  0 20px 48px rgba(74, 32, 64, 0.12);

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
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }
  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; display: block; }

  .display {
    font-family: var(--font-display);
    font-weight: 500;
    letter-spacing: -0.03em;
    line-height: 1.02;
    font-variation-settings: "opsz" 144, "SOFT" 20;
  }
  .display em {
    font-style: italic;
    color: var(--gold);
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }

  .eyebrow {
    color: var(--gold);
    font-family: var(--font-mono);
    font-weight: 500;
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .container { max-width: 1280px; margin: 0 auto; padding: 0 32px; position: relative; }
  section { padding: 100px 0; position: relative; }

  /* ========================================
     ANNOUNCEMENT BAR
     ======================================== */
  .announce {
    background: var(--aubergine);
    color: var(--cream);
    text-align: center;
    padding: 11px 16px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .announce strong { color: var(--gold); font-weight: 600; }

  /* ========================================
     NAV
     ======================================== */
  nav {
    position: sticky; top: 0; z-index: 50;
    background: rgba(250, 245, 238, 0.94);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid var(--border);
  }
  .nav-inner {
    max-width: 1280px; margin: 0 auto; padding: 18px 32px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 32px;
  }
  .logo {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 24px;
    letter-spacing: -0.025em;
    display: flex; align-items: center; gap: 12px;
    font-variation-settings: "opsz" 144, "SOFT" 60;
    color: var(--aubergine);
  }
  .logo-mark {
    width: 38px; height: 38px;
    background: var(--aubergine);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: var(--gold);
    transition: transform 0.5s var(--spring);
  }
  .logo:hover .logo-mark { transform: rotate(-15deg) scale(1.05); }
  .logo-mark svg { width: 18px; height: 18px; stroke-width: 1.6; }

  .nav-links { display: flex; gap: 36px; font-size: 14px; font-weight: 500; letter-spacing: 0.01em; }
  .nav-links a { transition: color 0.25s; color: var(--ink); position: relative; }
  .nav-links a:hover { color: var(--aubergine); }
  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: -4px; left: 0; right: 0;
    height: 1px;
    background: var(--gold);
    transform: scaleX(0);
    transition: transform 0.3s var(--smooth);
  }
  .nav-links a:hover::after { transform: scaleX(1); }

  .nav-cta {
    background: var(--aubergine); color: var(--gold);
    padding: 12px 24px; border-radius: 999px;
    font-size: 12px; font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: all 0.3s var(--spring);
    display: inline-flex; align-items: center; gap: 8px;
    border: 1px solid transparent;
  }
  .nav-cta:hover { background: var(--aubergine-dark); transform: translateY(-1px); }
  .nav-cta svg { width: 14px; height: 14px; }

  /* ========================================
     HERO — 3-Foto Editorial Komposition
     ======================================== */
  .hero {
    background: var(--cream);
    padding: 56px 0 88px;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -200px; right: -200px;
    width: 600px; height: 600px;
    background: radial-gradient(circle, var(--gold-glow), transparent 70%);
    pointer-events: none;
  }
  .hero-grid {
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    gap: 56px;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: var(--aubergine-soft);
    color: var(--aubergine);
    padding: 8px 18px;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 28px;
    font-weight: 500;
    border: 1px solid color-mix(in srgb, var(--aubergine) 12%, transparent);
  }
  .hero-tag .pulse {
    width: 7px; height: 7px;
    background: var(--gold);
    border-radius: 50%;
    animation: pulse 2.5s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.5; transform: scale(1.3); }
  }
  .hero h1 {
    font-size: clamp(46px, 5.5vw, 84px);
    margin-bottom: 28px;
    line-height: 1.0;
    color: var(--aubergine);
  }
  .hero-lead {
    font-size: 18px; line-height: 1.7;
    color: var(--ink-soft);
    max-width: 520px; margin-bottom: 40px;
  }
  .hero-lead strong { color: var(--ink); font-weight: 600; }

  .cta-row { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 44px; }
  .btn {
    padding: 17px 32px;
    border-radius: 999px;
    font-weight: 600; font-size: 12px;
    display: inline-flex; align-items: center; gap: 10px;
    cursor: pointer; border: none;
    transition: all 0.35s var(--spring);
    font-family: var(--font-mono);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    position: relative;
    overflow: hidden;
  }
  .btn-primary {
    background: var(--aubergine); color: var(--gold);
    box-shadow: 0 8px 28px color-mix(in srgb, var(--aubergine) 30%, transparent);
  }
  .btn-primary:hover { background: var(--aubergine-dark); transform: translateY(-2px); box-shadow: 0 12px 36px color-mix(in srgb, var(--aubergine) 35%, transparent); }
  .btn-ghost {
    background: transparent; color: var(--aubergine);
    border: 1px solid var(--border);
  }
  .btn-ghost:hover { background: var(--aubergine-soft); border-color: var(--aubergine); }
  .btn svg { width: 14px; height: 14px; }

  .hero-trust {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-soft);
    letter-spacing: 0.02em;
  }
  .hero-trust .item { display: flex; align-items: center; gap: 8px; }
  .hero-trust .item svg { width: 16px; height: 16px; color: var(--gold); }
  .hero-trust .item strong { color: var(--ink); font-weight: 600; }

  /* 3-Foto Editorial Komposition */
  .hero-photos {
    position: relative;
    aspect-ratio: 1/1.15;
  }
  .photo {
    position: absolute;
    overflow: hidden;
    transition: transform 0.6s var(--smooth);
  }
  .photo:hover { transform: translateY(-8px); }
  .photo-main {
    top: 0; left: 5%;
    width: 72%;
    aspect-ratio: 3/4;
    z-index: 1;
    border-radius: 20px;
    background: linear-gradient(160deg, var(--aubergine) 0%, var(--aubergine-dark) 60%, color-mix(in srgb, var(--aubergine-dark) 60%, #000) 100%);
    box-shadow: var(--shadow-image);
  }
  .photo-accent {
    bottom: 6%;
    right: 0;
    width: 52%;
    aspect-ratio: 1/1;
    z-index: 2;
    border-radius: 18px;
    background: linear-gradient(160deg, var(--gold) 0%, var(--gold-dark) 100%);
    box-shadow: var(--shadow-image);
  }
  .photo-detail {
    bottom: 0;
    left: 0;
    width: 36%;
    aspect-ratio: 1/1;
    z-index: 2;
    border-radius: 16px;
    background: linear-gradient(160deg, #e8d8c8 0%, #b8a090 100%);
    box-shadow: 0 16px 48px rgba(74, 32, 64, 0.12);
  }
  .photo::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 55%, rgba(42, 32, 40, 0.3));
    pointer-events: none;
    border-radius: inherit;
  }
  .photo .label {
    position: absolute;
    bottom: 16px; left: 16px;
    color: var(--cream);
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    z-index: 2;
    font-weight: 500;
  }

  /* Decorative gold ring */
  .hero-deco {
    position: absolute;
    top: 15%; right: -8%;
    width: 240px; height: 240px;
    border: 1px solid var(--gold-soft);
    border-radius: 50%;
    pointer-events: none;
    opacity: 0.4;
  }

  /* ========================================
     ANLASS-FILTER
     ======================================== */
  .occasions { background: var(--cream-tint); }
  .occasions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
  .occasion-card {
    background: var(--cream);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px 22px 26px;
    text-align: center;
    cursor: pointer;
    transition: all 0.4s var(--spring);
    position: relative;
    overflow: hidden;
  }
  .occasion-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--aubergine), var(--aubergine-dark));
    opacity: 0;
    transition: opacity 0.4s;
  }
  .occasion-card:hover::before { opacity: 1; }
  .occasion-card:hover {
    color: var(--cream);
    border-color: var(--aubergine);
    transform: translateY(-5px);
    box-shadow: var(--shadow-hover);
  }
  .occasion-card > * { position: relative; z-index: 1; }
  .occasion-icon {
    width: 58px; height: 58px;
    background: var(--aubergine-soft);
    color: var(--aubergine);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 18px;
    transition: all 0.4s var(--spring);
  }
  .occasion-card:hover .occasion-icon {
    background: var(--gold);
    color: var(--aubergine-dark);
    transform: scale(1.1);
  }
  .occasion-icon svg { width: 26px; height: 26px; stroke-width: 1.6; }
  .occasion-card h3 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 18px;
    margin-bottom: 6px;
    letter-spacing: -0.015em;
  }
  .occasion-card .price {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--ink-soft);
    transition: color 0.3s;
  }
  .occasion-card:hover .price { color: var(--gold); }

  /* ========================================
     SAISON-HIGHLIGHT
     ======================================== */
  .seasonal {
    background: var(--aubergine-dark);
    color: var(--cream);
    position: relative;
    overflow: hidden;
  }
  .seasonal::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 15% 25%, rgba(200, 169, 110, 0.04) 1px, transparent 1px),
      radial-gradient(circle at 75% 65%, rgba(200, 169, 110, 0.03) 1.5px, transparent 1.5px);
    background-size: 60px 60px, 80px 80px;
  }
  .seasonal-grid {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: 72px;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  .seasonal-text .eyebrow { color: var(--gold); margin-bottom: 18px; display: block; }
  .seasonal-text h2 {
    font-size: clamp(38px, 4.5vw, 60px);
    line-height: 1.05;
    margin-bottom: 24px;
  }
  .seasonal-text h2 em {
    font-style: italic;
    color: var(--gold);
  }
  .seasonal-text p {
    color: rgba(250, 245, 238, 0.7);
    font-size: 17px;
    line-height: 1.7;
    margin-bottom: 24px;
  }

  .season-list {
    display: grid;
    gap: 14px;
    margin: 36px 0;
  }
  .season-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 0;
    border-bottom: 1px solid rgba(200, 169, 110, 0.12);
  }
  .season-item:last-child { border-bottom: none; }
  .season-item .check {
    color: var(--gold);
    margin-top: 4px;
    flex-shrink: 0;
  }
  .season-item .check svg { width: 16px; height: 16px; stroke-width: 2.5; }
  .season-item .name {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 17px;
    letter-spacing: -0.01em;
  }
  .season-item .name em {
    font-style: italic;
    color: var(--gold);
  }

  /* Saison Photo Stack */
  .seasonal-photos {
    position: relative;
    aspect-ratio: 1/1;
  }
  .seasonal-photo {
    position: absolute;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 24px 56px rgba(0,0,0,0.45);
  }
  .seasonal-photo::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 65%, rgba(0,0,0,0.35));
    border-radius: inherit;
  }
  .seasonal-photo .label {
    position: absolute;
    bottom: 14px; left: 14px;
    color: var(--cream);
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    z-index: 2;
    font-weight: 500;
  }
  .sp-1 {
    top: 0; left: 5%;
    width: 58%;
    aspect-ratio: 3/4;
    background: linear-gradient(160deg, color-mix(in srgb, var(--aubergine) 80%, #d0a0c0) 0%, var(--aubergine-dark) 100%);
  }
  .sp-2 {
    top: 12%; right: 0;
    width: 48%;
    aspect-ratio: 1/1;
    background: linear-gradient(160deg, var(--gold) 0%, var(--gold-dark) 100%);
  }
  .sp-3 {
    bottom: 0; left: 0;
    width: 48%;
    aspect-ratio: 4/3;
    background: linear-gradient(160deg, #e8d0c0 0%, #a08878 100%);
  }

  /* ========================================
     PRODUCT GRID
     ======================================== */
  .products { background: var(--cream); }
  .section-head { text-align: center; margin-bottom: 68px; }
  .section-head .eyebrow { display: block; margin-bottom: 16px; }
  .section-head h2 {
    font-size: clamp(38px, 4.5vw, 60px);
    margin-bottom: 16px;
    line-height: 1.05;
    color: var(--aubergine);
  }
  .section-head p {
    color: var(--ink-soft);
    font-size: 17px;
    max-width: 560px;
    margin: 0 auto;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 22px;
  }
  .product-card {
    background: var(--cream-tint);
    border-radius: 22px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.4s var(--smooth), box-shadow 0.4s;
    border: 1px solid var(--border);
  }
  .product-card:hover { transform: translateY(-7px); box-shadow: var(--shadow-hover); }
  .product-img {
    aspect-ratio: 4/5;
    background: linear-gradient(160deg, var(--aubergine) 0%, var(--aubergine-dark) 100%);
    position: relative;
    overflow: hidden;
  }
  .product-img::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 55%, rgba(42, 32, 40, 0.18));
  }
  .product-img.var-1 { background: linear-gradient(160deg, color-mix(in srgb, var(--aubergine) 70%, #d8a0c0) 0%, var(--aubergine-dark) 100%); }
  .product-img.var-2 { background: linear-gradient(160deg, var(--gold) 0%, var(--gold-dark) 100%); }
  .product-img.var-3 { background: linear-gradient(160deg, #e8d0c0 0%, #a08878 100%); }
  .product-img.var-4 { background: linear-gradient(160deg, var(--aubergine-dark) 0%, color-mix(in srgb, var(--aubergine-dark) 60%, #000) 100%); }

  .product-badge {
    position: absolute;
    top: 18px; left: 18px;
    background: var(--cream);
    color: var(--aubergine-dark);
    padding: 5px 14px;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    z-index: 2;
  }
  .product-badge.new { background: var(--gold); color: var(--aubergine-dark); }
  .product-badge.bestseller { background: var(--aubergine); color: var(--gold); }
  .product-badge.season { background: var(--cream); color: var(--aubergine); }
  .product-badge.exclusive { background: var(--aubergine-dark); color: var(--gold); }

  .product-info {
    padding: 22px 24px 26px;
  }
  .product-info h3 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 20px;
    letter-spacing: -0.02em;
    margin-bottom: 6px;
    color: var(--aubergine);
  }
  .product-info .desc {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.04em;
    color: var(--ink-soft);
    margin-bottom: 18px;
  }
  .product-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 18px;
    border-top: 1px solid var(--border);
  }
  .product-price {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 22px;
    color: var(--aubergine);
    letter-spacing: -0.01em;
  }
  .product-price .from {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--ink-soft);
    letter-spacing: 0.08em;
    margin-right: 4px;
    text-transform: uppercase;
  }
  .product-cart {
    width: 40px; height: 40px;
    background: var(--aubergine-soft);
    border: none;
    border-radius: 50%;
    color: var(--aubergine);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s var(--spring);
  }
  .product-cart:hover {
    background: var(--aubergine);
    color: var(--gold);
    transform: rotate(-10deg);
  }
  .product-cart svg { width: 18px; height: 18px; stroke-width: 1.8; }

  /* ========================================
     DELIVERY ZONES
     ======================================== */
  .delivery { background: var(--cream-tint); }
  .delivery-grid {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 72px;
    align-items: center;
  }
  .delivery-info h2 {
    font-size: clamp(34px, 4vw, 50px);
    line-height: 1.05;
    margin-bottom: 28px;
    color: var(--aubergine);
  }
  .delivery-zones {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 32px;
  }
  .zone-row {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: 20px;
    align-items: center;
    padding: 20px 26px;
    background: var(--cream);
    border: 1px solid var(--border);
    border-radius: 16px;
    transition: border-color 0.3s, transform 0.3s;
  }
  .zone-row:hover {
    border-color: var(--gold);
    transform: translateX(4px);
  }
  .zone-row.featured {
    background: var(--aubergine);
    color: var(--cream);
    border-color: var(--aubergine);
  }
  .zone-dot {
    width: 12px; height: 12px;
    border-radius: 50%;
    background: var(--gold);
    flex-shrink: 0;
  }
  .zone-row.featured .zone-dot { background: var(--gold); }
  .zone-name {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 17px;
    letter-spacing: -0.01em;
  }
  .zone-time {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-soft);
    letter-spacing: 0.04em;
  }
  .zone-row.featured .zone-time { color: rgba(250, 245, 238, 0.6); }
  .zone-price {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 17px;
    color: var(--aubergine);
  }
  .zone-row.featured .zone-price { color: var(--gold); }

  /* Delivery Map */
  .delivery-map {
    background: var(--aubergine-dark);
    border-radius: 24px;
    overflow: hidden;
    position: relative;
    min-height: 480px;
  }
  .delivery-map svg {
    width: 100%; height: 100%;
    position: absolute; inset: 0;
  }
  .map-bg-block { fill: rgba(200, 169, 110, 0.04); }
  .map-bg-park { fill: color-mix(in srgb, var(--gold) 6%, transparent); }
  .map-bg-water { fill: color-mix(in srgb, var(--aubergine) 12%, transparent); }
  .map-bg-street { stroke: rgba(200, 169, 110, 0.06); stroke-width: 2; fill: none; }
  .map-bg-street-major { stroke: rgba(200, 169, 110, 0.12); stroke-width: 4; fill: none; stroke-linecap: round; }
  .delivery-circle {
    fill: color-mix(in srgb, var(--gold) 6%, transparent);
    stroke: color-mix(in srgb, var(--gold) 25%, transparent);
    stroke-width: 1.5;
    stroke-dasharray: 4 4;
  }
  .delivery-circle.inner {
    fill: color-mix(in srgb, var(--gold) 12%, transparent);
    stroke: color-mix(in srgb, var(--gold) 40%, transparent);
  }
  .map-pin {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -100%);
    z-index: 2;
  }
  .map-pin-circle {
    width: 56px; height: 56px;
    background: var(--gold);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: var(--aubergine-dark);
    box-shadow: 0 8px 28px color-mix(in srgb, var(--gold) 40%, transparent);
    animation: pinFloat 3s ease-in-out infinite;
  }
  .map-pin-circle svg { width: 24px; height: 24px; stroke-width: 1.8; }
  @keyframes pinFloat {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-6px); }
  }
  .map-overlay {
    position: absolute;
    bottom: 24px; left: 24px;
    background: rgba(250, 245, 238, 0.96);
    border-radius: 16px;
    padding: 16px 22px;
    backdrop-filter: blur(12px);
    z-index: 3;
  }
  .map-overlay .label {
    font-family: var(--font-mono);
    font-size: 10px; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--gold-dark);
    margin-bottom: 4px;
  }
  .map-overlay .name {
    font-family: var(--font-display);
    font-weight: 500; font-size: 16px;
    color: var(--aubergine); letter-spacing: -0.01em;
  }

  /* ========================================
     ABO / SUBSCRIPTION
     ======================================== */
  .subscription {
    background: linear-gradient(160deg, var(--aubergine) 0%, var(--aubergine-dark) 100%);
    color: var(--cream);
    position: relative;
    overflow: hidden;
  }
  .subscription::before {
    content: '';
    position: absolute;
    top: -100px; right: -100px;
    width: 400px; height: 400px;
    background: radial-gradient(circle, color-mix(in srgb, var(--gold) 8%, transparent), transparent 70%);
    pointer-events: none;
  }
  .sub-grid {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 72px;
    align-items: center;
  }
  .sub-text h2 {
    font-size: clamp(38px, 4.5vw, 60px);
    line-height: 1.05;
    margin-bottom: 24px;
  }
  .sub-text h2 em {
    font-style: italic;
    color: var(--gold);
  }
  .sub-text p {
    color: rgba(250, 245, 238, 0.75);
    font-size: 17px;
    line-height: 1.7;
    margin-bottom: 24px;
  }
  .sub-options {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 14px;
    margin: 32px 0;
  }
  .sub-option {
    background: rgba(250, 245, 238, 0.06);
    border: 1px solid rgba(200, 169, 110, 0.15);
    border-radius: 18px;
    padding: 22px 18px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s var(--spring);
  }
  .sub-option:hover {
    background: rgba(200, 169, 110, 0.1);
    border-color: rgba(200, 169, 110, 0.3);
    transform: translateY(-3px);
  }
  .sub-option.featured {
    background: var(--gold);
    color: var(--aubergine-dark);
    border-color: var(--gold);
  }
  .sub-option .freq {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(200, 169, 110, 0.8);
    margin-bottom: 10px;
  }
  .sub-option.featured .freq { color: var(--aubergine); }
  .sub-option .price {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 28px;
    letter-spacing: -0.02em;
    line-height: 1;
    margin-bottom: 6px;
  }
  .sub-option .price em {
    font-style: italic;
    font-size: 14px;
    color: rgba(250, 245, 238, 0.6);
  }
  .sub-option.featured .price em { color: var(--aubergine); }
  .sub-option .per {
    font-family: var(--font-mono);
    font-size: 10px;
    color: rgba(250, 245, 238, 0.5);
    letter-spacing: 0.04em;
  }
  .sub-option.featured .per { color: color-mix(in srgb, var(--aubergine) 70%, #000); }
  .sub-cta {
    background: var(--gold);
    color: var(--aubergine-dark);
    padding: 17px 30px;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    transition: all 0.3s var(--spring);
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
  }
  .sub-cta:hover {
    background: var(--cream);
    color: var(--aubergine-dark);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(200, 169, 110, 0.3);
  }
  .sub-cta svg { width: 14px; height: 14px; }

  .sub-photo {
    position: relative;
    aspect-ratio: 4/5;
    border-radius: 24px;
    overflow: hidden;
    background: linear-gradient(160deg, var(--aubergine) 0%, color-mix(in srgb, var(--aubergine-dark) 60%, #000) 100%);
    box-shadow: 0 24px 64px rgba(0,0,0,0.3);
  }
  .sub-photo::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.4));
    border-radius: inherit;
  }
  .sub-photo .label {
    position: absolute;
    bottom: 24px; left: 24px;
    color: var(--cream);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    z-index: 2;
    font-weight: 500;
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews-section {
    background: var(--aubergine-dark);
    padding: 100px 0;
    overflow: hidden;
    position: relative;
  }
  .reviews-section::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(200, 169, 110, 0.15), transparent);
  }
  .reviews-track-wrap { overflow: hidden; margin: 56px -32px 0; padding: 0 32px; }
  .reviews-track { display: flex; gap: 22px; animation: scrollLeft 45s linear infinite; width: max-content; }
  .reviews-track:hover { animation-play-state: paused; }
  @keyframes scrollLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .review-card {
    background: rgba(200, 169, 110, 0.06);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(200, 169, 110, 0.1);
    border-radius: 18px;
    padding: 34px;
    width: 360px;
    flex-shrink: 0;
    transition: all .3s;
    cursor: default;
  }
  .review-card:hover {
    background: rgba(200, 169, 110, 0.1);
    border-color: rgba(200, 169, 110, 0.2);
    transform: translateY(-3px);
  }
  .review-stars { color: var(--gold); margin-bottom: 20px; letter-spacing: 3px; font-size: 1rem; }
  .review-text {
    font-size: .92rem;
    color: rgba(250, 245, 238, 0.75);
    line-height: 1.8;
    margin-bottom: 26px;
    font-family: var(--font-display);
    font-style: italic;
    font-variation-settings: "opsz" 24, "SOFT" 60;
  }
  .review-author { display: flex; align-items: center; gap: 14px; }
  .review-avatar {
    width: 46px; height: 46px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--aubergine), var(--gold));
    display: flex; align-items: center; justify-content: center;
    font-size: .82rem; font-weight: 700; color: var(--cream);
    flex-shrink: 0;
  }
  .review-name {
    font-size: .85rem;
    font-weight: 600;
    color: var(--cream);
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
  }

  /* ========================================
     ABOUT / FLORISTIN
     ======================================== */
  .about { background: var(--cream-tint); }
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: 72px;
    align-items: center;
  }
  .florist-image {
    position: relative;
    aspect-ratio: 4/5;
    border-radius: 24px;
    overflow: hidden;
    background: linear-gradient(160deg, color-mix(in srgb, var(--aubergine) 50%, #c8a0b0) 0%, var(--aubergine-dark) 100%);
    box-shadow: var(--shadow-image);
  }
  .florist-image::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 50%, rgba(74, 32, 64, 0.3));
    border-radius: inherit;
  }
  .florist-quote {
    position: absolute;
    top: 24px; left: 24px;
    right: 24px;
    background: rgba(250, 245, 238, 0.96);
    padding: 22px 26px;
    border-radius: 18px;
    backdrop-filter: blur(12px);
    z-index: 2;
  }
  .florist-quote p {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 16px;
    line-height: 1.5;
    color: var(--aubergine);
    letter-spacing: -0.01em;
    font-variation-settings: "opsz" 24, "SOFT" 80;
  }
  .florist-quote .signature {
    margin-top: 14px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--gold-dark);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .about-text h2 {
    font-size: clamp(34px, 4vw, 52px);
    margin-bottom: 28px;
    line-height: 1.05;
    color: var(--aubergine);
  }
  .about-text p {
    color: var(--ink-soft);
    font-size: 17px;
    line-height: 1.7;
    margin-bottom: 20px;
  }
  .about-text p strong { color: var(--aubergine); font-weight: 600; }
  .about-values {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-top: 36px;
    padding-top: 36px;
    border-top: 1px solid var(--border);
  }
  .value-item .icon {
    width: 42px; height: 42px;
    background: var(--aubergine-soft);
    color: var(--aubergine);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
  }
  .value-item .icon svg { width: 20px; height: 20px; stroke-width: 1.6; }
  .value-item h4 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 17px;
    margin-bottom: 6px;
    letter-spacing: -0.01em;
    color: var(--aubergine);
  }
  .value-item p {
    font-size: 14px;
    color: var(--ink-soft);
    margin: 0;
  }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section { background: var(--cream); }
  .faq-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-top: 52px;
  }
  .faq-item {
    background: var(--cream-tint);
    border: 1px solid var(--border);
    border-radius: 18px;
    overflow: hidden;
    transition: border-color .25s;
  }
  .faq-item:hover { border-color: var(--gold); }
  .faq-q {
    width: 100%; background: none; border: none; cursor: pointer;
    padding: 24px 28px; text-align: left;
    display: flex; justify-content: space-between; align-items: center; gap: 16px;
    font-family: var(--font-body); font-size: .92rem; font-weight: 600;
    color: var(--aubergine); transition: background .2s;
  }
  .faq-q:hover { background: var(--aubergine-soft); }
  .faq-icon {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: var(--aubergine-soft);
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; color: var(--aubergine);
    transition: all .25s var(--spring);
  }
  .faq-item.open .faq-icon {
    transform: rotate(45deg);
    background: var(--aubergine);
    color: var(--gold);
  }
  .faq-a {
    max-height: 0; overflow: hidden;
    transition: max-height .35s cubic-bezier(.4,0,.2,1), padding .35s;
    font-size: .9rem; color: var(--ink-soft);
    line-height: 1.8; padding: 0 28px;
  }
  .faq-item.open .faq-a { max-height: 400px; padding: 0 28px 24px; }

  /* ========================================
     CONTACT FORM
     ======================================== */
  .contact-section {
    background: var(--aubergine-dark);
    color: var(--cream);
  }
  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 72px;
    align-items: start;
  }
  .contact-info h2 {
    font-size: clamp(34px, 4vw, 50px);
    line-height: 1.05;
    margin-bottom: 24px;
  }
  .contact-info p {
    color: rgba(250, 245, 238, 0.7);
    font-size: 17px;
    line-height: 1.7;
    margin-bottom: 36px;
  }
  .contact-detail {
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 18px; font-size: 15px;
  }
  .contact-detail svg { width: 20px; height: 20px; color: var(--gold); flex-shrink: 0; }
  .contact-form { display: flex; flex-direction: column; gap: 14px; }
  .contact-form input, .contact-form textarea, .contact-form select {
    padding: 17px 22px; border-radius: 14px;
    border: 1px solid rgba(200, 169, 110, 0.15);
    background: rgba(200, 169, 110, 0.05);
    color: var(--cream); font-size: .95rem;
    font-family: var(--font-body);
    outline: none; transition: border-color .2s, background .2s;
  }
  .contact-form input:focus, .contact-form textarea:focus, .contact-form select:focus {
    border-color: var(--gold);
    background: rgba(200, 169, 110, 0.1);
  }
  .contact-form input::placeholder, .contact-form textarea::placeholder { color: rgba(250, 245, 238, 0.35); }
  .contact-form textarea { min-height: 130px; resize: vertical; }
  .contact-form select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23c8a96e' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
  }
  .contact-form select option { background: var(--aubergine-dark); color: var(--cream); }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: var(--aubergine-dark);
    color: rgba(250, 245, 238, 0.6);
    padding: 68px 0 32px;
    border-top: 1px solid rgba(200, 169, 110, 0.1);
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 48px;
    margin-bottom: 52px;
  }
  .footer-brand .logo { color: var(--cream); margin-bottom: 18px; }
  .footer-brand .logo-mark { background: var(--gold); color: var(--aubergine-dark); }
  .footer-brand p {
    font-size: 14px;
    line-height: 1.65;
    max-width: 320px;
  }
  .footer-col h4 {
    color: var(--gold);
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    margin-bottom: 22px;
  }
  .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 11px; }
  .footer-col a { font-size: 14px; transition: color 0.2s; }
  .footer-col a:hover { color: var(--gold); }
  .footer-bottom {
    border-top: 1px solid rgba(200, 169, 110, 0.08);
    padding-top: 24px;
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    color: rgba(250, 245, 238, 0.35);
  }
  .footer-bottom a:hover { color: var(--gold); }

  /* ========================================
     STICKY MOBILE CTA
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 16px; left: 16px; right: 16px;
    background: var(--aubergine);
    color: var(--gold);
    padding: 16px 24px;
    border-radius: 999px;
    z-index: 100;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: center;
    box-shadow: 0 8px 36px rgba(74, 32, 64, 0.5);
  }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .hero-grid { grid-template-columns: 1fr; gap: 48px; }
    .hero-photos { max-width: 480px; margin: 0 auto; }
    .occasions-grid { grid-template-columns: repeat(3, 1fr); }
    .products-grid { grid-template-columns: repeat(2, 1fr); }
    .seasonal-grid { grid-template-columns: 1fr; gap: 48px; }
    .delivery-grid { grid-template-columns: 1fr; gap: 48px; }
    .sub-grid { grid-template-columns: 1fr; gap: 48px; }
    .about-grid { grid-template-columns: 1fr; gap: 48px; }
    .contact-grid { grid-template-columns: 1fr; gap: 48px; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .faq-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    section { padding: 68px 0; }
    .container { padding: 0 20px; }
    .nav-links { display: none; }
    .nav-cta { display: none; }
    .occasions-grid { grid-template-columns: 1fr 1fr; }
    .products-grid { grid-template-columns: 1fr; }
    .sub-options { grid-template-columns: 1fr; }
    .about-values { grid-template-columns: 1fr; }
    .zone-row { grid-template-columns: auto 1fr auto; }
    .zone-row .zone-time { display: none; }
    .footer-grid { grid-template-columns: 1fr; gap: 32px; }
    .footer-bottom { flex-direction: column; gap: 12px; }
    .mobile-cta { display: block; }
    body { padding-bottom: 80px; }
    .hero h1 { font-size: clamp(36px, 8vw, 54px); }
    .seasonal-photos { max-width: 360px; margin: 0 auto; }
  }
</style>
</head>
<body>

<!-- ====== ANNOUNCEMENT BAR ====== -->
${c.announceText ? `<div class="announce">
  ${c.announceText}
</div>` : ''}

<!-- ====== NAV ====== -->
<nav>
  <div class="nav-inner">
    <a href="#" class="logo">
      <span class="logo-mark">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3C9 6 7 9 7 13a5 5 0 0010 0c0-4-2-7-5-10z"/><path d="M12 13v5"/><path d="M9 18c0 2 1.5 3 3 3s3-1 3-3"/></svg>
      </span>
      ${e(c.name)}
    </a>
    <div class="nav-links">
      ${occasions.length > 0 ? '<a href="#occasions">Anl&auml;sse</a>' : ''}
      ${products.length > 0 ? '<a href="#kollektion">Kollektion</a>' : ''}
      <a href="#subscription">Abo</a>
      <a href="#about">Atelier</a>
      <a href="#kontakt">Kontakt</a>
    </div>
    <a href="#kollektion" class="nav-cta">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3C9 6 7 9 7 13a5 5 0 0010 0c0-4-2-7-5-10z"/></svg>
      ${e(c.ctaText)}
    </a>
  </div>
</nav>

<!-- ====== HERO mit 3-Foto Editorial Komposition ====== -->
<section class="hero">
  <div class="container hero-grid">
    <div>
      ${c.heroTag ? `<div class="hero-tag">
        <span class="pulse"></span>
        ${e(c.heroTag)}
      </div>` : ''}
      <h1 class="display">
        ${c.heroHeadline.replace(c.heroAccent, `<em>${e(c.heroAccent)}</em>`)}
      </h1>
      <p class="hero-lead">
        ${c.heroLead}
      </p>
      <div class="cta-row">
        <a href="#kollektion" class="btn btn-primary">
          ${e(c.ctaText)}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
        <a href="#subscription" class="btn btn-ghost">Blumen-Abo entdecken</a>
      </div>
      ${trustItems.length > 0 ? `<div class="hero-trust">
        ${trustItems.map(t => `<div class="item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
          ${t.text}
        </div>`).join('\n        ')}
      </div>` : ''}
    </div>

    <div class="hero-photos">
      <div class="photo photo-main"${c.heroImageUrl ? ` style="background:url('${e(c.heroImageUrl)}') center/cover"` : ''}>
        <span class="label">Brautstrau&szlig;</span>
      </div>
      <div class="photo photo-accent"${c.heroImage2Url ? ` style="background:url('${e(c.heroImage2Url)}') center/cover"` : ''}>
        <span class="label">Saisonal</span>
      </div>
      <div class="photo photo-detail"${c.heroImage3Url ? ` style="background:url('${e(c.heroImage3Url)}') center/cover"` : ''}>
        <span class="label">Tischschmuck</span>
      </div>
      <div class="hero-deco"></div>
    </div>
  </div>
</section>

<!-- ====== ANLASS-FILTER ====== -->
${occasions.length > 0 ? `<section id="occasions" class="occasions">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">F&uuml;r jeden Anlass</span>
      <h2 class="display">Blumen f&uuml;r besondere <em>Momente</em>.</h2>
      <p>Vom Brautstrau&szlig; &uuml;ber Trauerkranz bis zum Tischschmuck &mdash; jedes Arrangement individuell gestaltet.</p>
    </div>
    <div class="occasions-grid">
      ${occasions.map(occ => `<div class="occasion-card">
        <div class="occasion-icon">
          ${occ.icon}
        </div>
        <h3>${e(occ.title)}</h3>
        <div class="price">${e(occ.description)}</div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>` : ''}

<!-- ====== SAISON-HIGHLIGHT ====== -->
${seasonalHighlight ? `<section class="seasonal">
  <div class="container seasonal-grid">
    <div class="seasonal-text">
      <span class="eyebrow">${e(seasonalHighlight.title)}</span>
      <h2 class="display">Was gerade <em>bl&uuml;ht</em>.</h2>
      <p>${e(seasonalHighlight.description)}</p>

      <div class="season-list">
        ${seasonalHighlight.items.map(item => `<div class="season-item">
          <span class="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 13l4 4L19 7"/></svg></span>
          <div>
            <div class="name">${item}</div>
          </div>
        </div>`).join('\n        ')}
      </div>

      <a href="#kollektion" class="btn btn-primary" style="background:var(--gold);color:var(--aubergine-dark);">
        Saison-Kollektion ansehen
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
    </div>

    <div class="seasonal-photos">
      <div class="seasonal-photo sp-1">
        <span class="label">Ranunkel</span>
      </div>
      <div class="seasonal-photo sp-2">
        <span class="label">Pfingstrose</span>
      </div>
      <div class="seasonal-photo sp-3">
        <span class="label">Hortensie</span>
      </div>
    </div>
  </div>
</section>` : ''}

<!-- ====== PRODUCT GRID ====== -->
${products.length > 0 ? `<section id="kollektion" class="products">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Aktuelle Kollektion</span>
      <h2 class="display">Handgebunden mit <em>Hingabe</em>.</h2>
      <p>Slow Flower Arrangements aus saisonalen Bl&uuml;ten &mdash; Ranunkel, Pfingstrose, Hortensie und mehr.</p>
    </div>
    <div class="products-grid">
      ${products.map((p, i) => `<div class="product-card">
        <div class="product-img ${imgVariants[i % imgVariants.length]}"${p.imageUrl ? ` style="background:url('${e(p.imageUrl)}') center/cover"` : ''}>
          ${p.badge ? `<span class="product-badge ${badgeClass(p.badge)}">${e(p.badge)}</span>` : ''}
        </div>
        <div class="product-info">
          <h3>${e(p.name)}</h3>
          <div class="desc">${e(p.description)}</div>
          <div class="product-footer">
            <div class="product-price"><span class="from">ab</span>${e(p.price)}</div>
            <button class="product-cart" aria-label="In den Warenkorb">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3C9 6 7 9 7 13a5 5 0 0010 0c0-4-2-7-5-10z"/></svg>
            </button>
          </div>
        </div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>` : ''}

<!-- ====== DELIVERY ZONES ====== -->
${deliveryZones.length > 0 ? `<section id="delivery" class="delivery">
  <div class="container delivery-grid">

    <div class="delivery-info">
      <span class="eyebrow" style="display:block;margin-bottom:18px;">Lieferservice</span>
      <h2 class="display">Frische Eleganz, <em>geliefert</em>.</h2>

      <div class="delivery-zones">
        ${deliveryZones.map((dz, i) => `<div class="zone-row${i === 0 ? ' featured' : ''}">
          <div class="zone-dot"></div>
          <div>
            <div class="zone-name">${e(dz.zone)}</div>
            <div class="zone-time">${e(dz.time)}</div>
          </div>
          <div class="zone-price">${e(dz.price)}</div>
        </div>`).join('\n        ')}
      </div>
    </div>

    <!-- Stilisierte Map -->
    <div class="delivery-map">
      <svg class="map-svg" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid slice">
        <path class="map-bg-park" d="M 380 60 L 500 80 L 540 200 L 480 280 L 400 220 Z"/>
        <path class="map-bg-water" d="M 300 0 Q 320 100 280 200 Q 240 300 320 400 Q 360 460 340 500 L 380 500 L 380 0 Z"/>
        <rect class="map-bg-block" x="50"  y="80"  width="80"  height="60" rx="3"/>
        <rect class="map-bg-block" x="150" y="80"  width="100" height="60" rx="3"/>
        <rect class="map-bg-block" x="50"  y="170" width="100" height="80" rx="3"/>
        <rect class="map-bg-block" x="170" y="170" width="80"  height="80" rx="3"/>
        <rect class="map-bg-block" x="60"  y="290" width="80"  height="100" rx="3"/>
        <rect class="map-bg-block" x="160" y="290" width="90"  height="100" rx="3"/>
        <rect class="map-bg-block" x="50"  y="410" width="100" height="70" rx="3"/>
        <rect class="map-bg-block" x="170" y="410" width="100" height="70" rx="3"/>
        <rect class="map-bg-block" x="420" y="290" width="80"  height="80" rx="3"/>
        <rect class="map-bg-block" x="520" y="290" width="60"  height="80" rx="3"/>
        <rect class="map-bg-block" x="420" y="390" width="90"  height="80" rx="3"/>
        <rect class="map-bg-block" x="530" y="390" width="60"  height="80" rx="3"/>
        <line class="map-bg-street-major" x1="0" y1="260" x2="600" y2="260"/>
        <line class="map-bg-street" x1="0" y1="155" x2="600" y2="155"/>
        <line class="map-bg-street" x1="0" y1="395" x2="600" y2="395"/>
        <line class="map-bg-street" x1="140" y1="0" x2="140" y2="500"/>
        <line class="map-bg-street" x1="510" y1="0" x2="510" y2="500"/>
        <circle class="delivery-circle inner" cx="300" cy="250" r="80"/>
        <circle class="delivery-circle" cx="300" cy="250" r="160"/>
        <circle class="delivery-circle" cx="300" cy="250" r="240"/>
      </svg>

      <div class="map-pin">
        <div class="map-pin-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3C9 6 7 9 7 13a5 5 0 0010 0c0-4-2-7-5-10z"/><path d="M12 13v5"/></svg>
        </div>
      </div>

      <div class="map-overlay">
        <div class="label">Atelier</div>
        <div class="name">${e(c.address)}</div>
      </div>
    </div>

  </div>
</section>` : ''}

<!-- ====== ABO ====== -->
<section id="subscription" class="subscription">
  <div class="container sub-grid">
    <div class="sub-text">
      <span class="eyebrow" style="color:var(--gold);">Blumen-Abonnement</span>
      <h2 class="display">Florale Eleganz, <em>regelm&auml;&szlig;ig</em>.</h2>
      <p>W&auml;hlen Sie Rhythmus und Stil &mdash; unser Atelier kreiert jede Lieferung individuell. <strong>Immer saisonal</strong>, jederzeit pausierbar, stets eine &Uuml;berraschung.</p>

      <div class="sub-options">
        ${aboOptions.map(opt => `<div class="sub-option${opt.featured ? ' featured' : ''}">
          <div class="freq">${e(opt.frequency)}</div>
          <div class="price"><em>ab</em> ${e(opt.price)}</div>
          <div class="per">${e(opt.note || 'pro Lieferung')}</div>
        </div>`).join('\n        ')}
      </div>

      <a href="#kontakt" class="sub-cta">
        Abo starten
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
    </div>

    <div class="sub-photo">
      <span class="label">Abo-Arrangement &middot; Aktuelle Komposition</span>
    </div>
  </div>
</section>

<!-- ====== REVIEWS ====== -->
${reviews.length > 0 ? `<section class="reviews-section">
  <div class="container" style="margin-bottom:0">
    <span class="eyebrow" style="color:rgba(200,169,110,.5);display:block;margin-bottom:16px;">Kundenstimmen</span>
    <h2 class="display" style="color:var(--cream);">Was unsere Kunden <em>sagen</em>.</h2>
  </div>
  <div class="reviews-track-wrap">
    <div class="reviews-track">${reviews.concat(reviews).map(r => `<div class="review-card">
      <div class="review-stars">${starsSvg(r.rating)}</div>
      <p class="review-text">&bdquo;${e(r.text)}&ldquo;</p>
      <div class="review-author">
        <div class="review-avatar">${e(r.name.charAt(0))}</div>
        <div><div class="review-name">${e(r.name)}</div></div>
      </div>
    </div>`).join('')}</div>
  </div>
</section>` : ''}

<!-- ====== ABOUT / FLORISTIN ====== -->
${c.aboutTitle || c.aboutText ? `<section id="about" class="about">
  <div class="container about-grid">
    <div class="florist-image">
      ${c.aboutText ? `<div class="florist-quote">
        <p>&bdquo;${e(c.aboutText)}&ldquo;</p>
        <div class="signature">&mdash; ${e(c.name)}</div>
      </div>` : ''}
    </div>
    <div class="about-text">
      <span class="eyebrow" style="display:block;margin-bottom:18px;">Das Atelier</span>
      ${c.aboutTitle ? `<h2 class="display">${c.aboutTitle}</h2>` : `<h2 class="display">&Uuml;ber <em>${e(c.name)}</em>.</h2>`}
      ${c.aboutText ? `<p>${e(c.aboutText)}</p>` : ''}
      <div class="about-values">
        <div class="value-item">
          <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3C9 6 7 9 7 13a5 5 0 0010 0c0-4-2-7-5-10z"/></svg></div>
          <h4>Slow Flower</h4>
          <p>Saisonale Bl&uuml;ten aus nachhaltigen Quellen, handverlesen f&uuml;r jedes Arrangement.</p>
        </div>
        <div class="value-item">
          <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
          <h4>Handgebunden</h4>
          <p>Jedes St&uuml;ck wird von Hand in unserem Atelier gestaltet &mdash; niemals Massenware.</p>
        </div>
        <div class="value-item">
          <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg></div>
          <h4>Exklusive Auswahl</h4>
          <p>Ranunkel, Pfingstrose, Hortensie &mdash; nur die edelsten Bl&uuml;ten der Saison.</p>
        </div>
        <div class="value-item">
          <div class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
          <h4>Pers&ouml;nliche Beratung</h4>
          <p>Individuelle Konzepte f&uuml;r Hochzeit, Trauer und besondere Anl&auml;sse.</p>
        </div>
      </div>
    </div>
  </div>
</section>` : ''}

<!-- ====== FAQ ====== -->
${faqItems.length > 0 ? `<section class="faq-section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">H&auml;ufige Fragen</span>
      <h2 class="display">Fragen &amp; <em>Antworten</em>.</h2>
    </div>
    <div class="faq-grid">
      ${faqItems.map(f => `<div class="faq-item">
        <button class="faq-q" aria-expanded="false">${e(f.question)}<span class="faq-icon">+</span></button>
        <div class="faq-a" role="region">${e(f.answer)}</div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>` : ''}

<!-- ====== CONTACT FORM ====== -->
<section id="kontakt" class="contact-section">
  <div class="container contact-grid">
    <div class="contact-info">
      <span class="eyebrow" style="color:var(--gold);display:block;margin-bottom:18px;">Kontakt</span>
      <h2 class="display" style="color:var(--cream);">Sprechen Sie uns <em>an</em>.</h2>
      <p>F&uuml;r individuelle Anfragen zu Brautstrau&szlig;, Trauerkranz, Tischschmuck oder Event-Floristik.</p>
      ${c.phone ? `<div class="contact-detail">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
        ${e(c.phone)}
      </div>` : ''}
      ${c.email ? `<div class="contact-detail">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
        ${e(c.email)}
      </div>` : ''}
      ${c.address ? `<div class="contact-detail">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        ${e(c.address)}
      </div>` : ''}
      ${openingHours.length > 0 ? `<div style="margin-top:28px;">
        ${openingHours.map(oh => `<div class="contact-detail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <strong>${e(oh.days)}</strong>&nbsp;${e(oh.hours)}
        </div>`).join('\n        ')}
      </div>` : ''}
    </div>
    <form class="contact-form" onsubmit="return false">
      <input type="text" name="name" placeholder="Ihr Name" required aria-label="Name">
      <input type="email" name="email" placeholder="Ihre E-Mail" required aria-label="E-Mail">
      <input type="tel" name="phone" placeholder="Telefonnummer (optional)" aria-label="Telefon">
      <select name="anlass" aria-label="Anlass">
        <option value="">Anlass w&auml;hlen (optional)</option>
        <option value="hochzeit">Hochzeit &amp; Brautstrau&szlig;</option>
        <option value="trauer">Trauerfloristik &amp; Trauerkranz</option>
        <option value="event">Event &amp; Tischschmuck</option>
        <option value="abo">Blumen-Abonnement</option>
        <option value="geschenk">Geschenk</option>
        <option value="sonstiges">Sonstiges</option>
      </select>
      <textarea name="message" placeholder="Ihre Nachricht..." required aria-label="Nachricht"></textarea>
      <div style="position:absolute;left:-9999px"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>
      <button class="btn btn-primary" type="button" id="cta-submit" style="width:100%;justify-content:center;background:var(--gold);color:var(--aubergine-dark);">
        Nachricht senden
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </button>
    </form>
  </div>
</section>

<!-- ====== FOOTER ====== -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#" class="logo">
          <span class="logo-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3C9 6 7 9 7 13a5 5 0 0010 0c0-4-2-7-5-10z"/><path d="M12 13v5"/><path d="M9 18c0 2 1.5 3 3 3s3-1 3-3"/></svg>
          </span>
          ${e(c.name)}
        </a>
        <p>${e(c.tagline)}</p>
      </div>
      <div class="footer-col">
        <h4>Kollektion</h4>
        <ul>
          ${products.length > 0 ? '<li><a href="#kollektion">Arrangements</a></li>' : ''}
          <li><a href="#subscription">Blumen-Abo</a></li>
          ${occasions.length > 0 ? '<li><a href="#occasions">Anl&auml;sse</a></li>' : ''}
          <li><a href="#kollektion">Brautstrau&szlig;</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Atelier</h4>
        <ul>
          <li><a href="#about">&Uuml;ber uns</a></li>
          ${deliveryZones.length > 0 ? '<li><a href="#delivery">Lieferservice</a></li>' : ''}
          <li><a href="#kontakt">Kontakt</a></li>
          <li><a href="#">Slow Flower</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Kontakt</h4>
        <ul>
          ${c.phone ? `<li>${e(c.phone)}</li>` : ''}
          ${c.email ? `<li>${e(c.email)}</li>` : ''}
          ${c.address ? `<li>${e(c.address)}</li>` : ''}
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; ${new Date().getFullYear()} ${e(c.name)}</span>
      <span><a href="#">Impressum</a> &middot; <a href="#">Datenschutz</a> &middot; <a href="#">AGB</a></span>
    </div>
  </div>
</footer>

<a href="#kollektion" class="mobile-cta">${e(c.ctaText)} &rarr;</a>

<!-- ====== SCRIPTS ====== -->
<script>
  // FAQ accordion
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

  // Contact form with fetch
  ${siteId ? `(function() {
    var ctaBtn = document.getElementById('cta-submit');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', async function() {
        var form = this.closest('.contact-form');
        if (!form) return;
        var data = {};
        form.querySelectorAll('input,textarea,select').forEach(function(i) {
          if (i.name && i.value) data[i.name] = i.value;
        });
        if (!data.name || !data.email) { alert('Name und E-Mail sind Pflichtfelder.'); return; }
        this.textContent = 'Wird gesendet...';
        this.disabled = true;
        try {
          var r = await fetch('${appUrl}/api/public/forms/${siteId}/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          var d = await r.json();
          if (d.success) {
            form.innerHTML = '<div style="text-align:center;padding:48px 24px"><h3 style="color:var(--cream);font-family:var(--font-display);font-size:1.6rem;margin-bottom:14px;font-weight:500">Vielen Dank!</h3><p style="color:rgba(250,245,238,.7);font-size:1.05rem">Wir melden uns zeitnah bei Ihnen.</p></div>';
          } else {
            alert(d.error || 'Fehler beim Senden.');
            this.textContent = 'Nachricht senden';
            this.disabled = false;
          }
        } catch(err) {
          alert('Verbindungsfehler. Bitte versuchen Sie es erneut.');
          this.textContent = 'Nachricht senden';
          this.disabled = false;
        }
      });
    }
  })();` : ''}
</script>

<!-- Cookie Banner -->
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:rgba(42,32,40,.97);backdrop-filter:blur(16px);color:var(--cream);padding:18px 24px;font-size:.84rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:22px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:rgba(250,245,238,.75)">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen in unserer <a href="#" style="color:var(--gold);text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:var(--gold);color:#2a2028;border:none;padding:9px 22px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit;letter-spacing:.02em">Verstanden</button>
  </div>
</div>
<script>if(!localStorage.getItem('cookies_accepted')){document.getElementById('cookie-banner').style.display='block'}</script>

<!-- Tracking -->
${siteId ? `<script>
(function(){
  var sid='${siteId}';
  var url='${appUrl}/api/public/track';
  try{
    var d={siteId:sid,url:location.href,referrer:document.referrer,ua:navigator.userAgent,ts:Date.now()};
    if(navigator.sendBeacon){navigator.sendBeacon(url,JSON.stringify(d))}
    else{fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d),keepalive:true})}
  }catch(e){}
})();
</script>` : ''}

</body>
</html>`
}
