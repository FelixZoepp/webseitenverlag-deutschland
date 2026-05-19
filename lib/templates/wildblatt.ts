function e(str: string | undefined | null): string {
  if (!str) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export interface WildblattConfig {
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
    secondary: string
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
  reviews: { text: string; name: string; rating: number }[]
  faqItems?: { question: string; answer: string }[]
  trustItems?: { text: string }[]
  aboutTitle?: string
  aboutText?: string
  heroImageUrl?: string
}

export function renderWildblattTemplate(config: WildblattConfig, siteId?: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  const c = {
    name: config.businessName || 'Mein Blumenladen',
    tagline: config.tagline || '',
    heroHeadline: config.heroHeadline || 'Blumen, die nicht wie aus dem Supermarkt aussehen.',
    heroAccent: config.heroAccent || 'nicht',
    heroLead: config.heroLead || '',
    heroTag: config.heroTag || '',
    announceText: config.announceText || '',
    ctaText: config.ctaText || 'Jetzt bestellen',
    primary: config.colors?.primary || '#7a8b6f',
    secondary: config.colors?.secondary || '#d4a89a',
    accent: config.colors?.accent || '#c4533a',
    background: config.colors?.background || '#faf6ee',
    text: config.colors?.text || '#2a2820',
    phone: config.phone || '',
    email: config.email || '',
    address: config.address || '',
    aboutTitle: config.aboutTitle || '',
    aboutText: config.aboutText || '',
    heroImageUrl: config.heroImageUrl || '',
  }

  const occasions = config.occasions || []
  const products = config.products || []
  const deliveryZones = config.deliveryZones || []
  const reviews = config.reviews || []
  const faqItems = config.faqItems || []
  const trustItems = config.trustItems || []
  const seasonalHighlight = config.seasonalHighlight
  const openingHours = config.openingHours || []

  // Derive CSS color variants from primary/secondary
  void 'primaryDark and secondaryDark computed via CSS color-mix in template'

  // Product image variant classes cycle
  const imgVariants = ['var-1', 'var-2', 'var-3', 'var-4']
  // Badge class map
  function badgeClass(badge?: string): string {
    if (!badge) return ''
    const lower = badge.toLowerCase()
    if (lower === 'neu' || lower === 'new') return 'new'
    if (lower === 'bestseller') return 'bestseller'
    if (lower === 'saison' || lower === 'season') return 'season'
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,400..900,30..100&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  /* ========================================
     DESIGN TOKENS
     ======================================== */
  :root {
    --sage:           ${e(c.primary)};
    --sage-dark:      color-mix(in srgb, ${e(c.primary)} 80%, #000);
    --sage-soft:      color-mix(in srgb, ${e(c.primary)} 14%, transparent);
    --rose:           ${e(c.secondary)};
    --rose-dark:      color-mix(in srgb, ${e(c.secondary)} 80%, #000);
    --rose-soft:      color-mix(in srgb, ${e(c.secondary)} 22%, transparent);
    --cream:          #f7f3ec;
    --cream-tint:     #efe9dc;
    --cream-warm:     #e8e0d0;
    --bone:           ${e(c.background)};
    --ink:            ${e(c.text)};
    --ink-soft:       color-mix(in srgb, ${e(c.text)} 60%, #888);
    --border:         #e4dcc8;
    --accent:         ${e(c.accent)};

    --shadow-card:  0 12px 32px rgba(42, 40, 32, 0.08);
    --shadow-image: 0 20px 60px rgba(42, 40, 32, 0.18);

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
    background: var(--bone);
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
    color: var(--sage);
    font-variation-settings: "opsz" 144, "SOFT" 100;
  }

  .eyebrow {
    color: var(--sage);
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
    background: var(--sage);
    color: var(--cream);
    text-align: center;
    padding: 10px 16px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }
  .announce strong { color: var(--rose); font-weight: 600; }

  /* ========================================
     NAV
     ======================================== */
  nav {
    position: sticky; top: 0; z-index: 50;
    background: rgba(250, 246, 238, 0.92);
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
    font-size: 26px;
    letter-spacing: -0.02em;
    display: flex; align-items: center; gap: 10px;
    font-variation-settings: "opsz" 144, "SOFT" 80;
  }
  .logo-mark {
    width: 36px; height: 36px;
    background: var(--sage);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: var(--cream);
    transition: transform 0.5s var(--spring);
  }
  .logo:hover .logo-mark { transform: rotate(-15deg); }
  .logo-mark svg { width: 18px; height: 18px; stroke-width: 1.8; }

  .nav-links { display: flex; gap: 32px; font-size: 15px; font-weight: 500; }
  .nav-links a { transition: color 0.2s; color: var(--ink); }
  .nav-links a:hover { color: var(--sage); }
  .nav-cta {
    background: var(--sage); color: var(--cream);
    padding: 12px 22px; border-radius: 999px;
    font-size: 13px; font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: all 0.3s var(--spring);
    display: inline-flex; align-items: center; gap: 8px;
  }
  .nav-cta:hover { background: var(--sage-dark); transform: translateY(-1px); }
  .nav-cta svg { width: 14px; height: 14px; }

  /* ========================================
     HERO mit Foto-Komposition
     ======================================== */
  .hero {
    background: var(--bone);
    padding: 60px 0 80px;
    position: relative;
    overflow: hidden;
  }
  .hero-grid {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 48px;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--rose-soft);
    color: var(--rose-dark);
    padding: 8px 16px;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 24px;
    font-weight: 500;
  }
  .hero-tag .pulse {
    width: 8px; height: 8px;
    background: var(--accent);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.6; transform: scale(1.2); }
  }
  .hero h1 {
    font-size: clamp(48px, 6vw, 88px);
    margin-bottom: 24px;
    line-height: 1.0;
  }
  .hero-lead {
    font-size: 19px; line-height: 1.6;
    color: var(--ink-soft);
    max-width: 540px; margin-bottom: 36px;
  }
  .hero-lead strong { color: var(--ink); font-weight: 600; }

  .cta-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px; }
  .btn {
    padding: 17px 30px;
    border-radius: 999px;
    font-weight: 600; font-size: 13px;
    display: inline-flex; align-items: center; gap: 10px;
    cursor: pointer; border: none;
    transition: all 0.3s var(--spring);
    font-family: var(--font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    position: relative;
    overflow: hidden;
  }
  .btn-primary {
    background: var(--sage); color: var(--cream);
    box-shadow: 0 8px 24px color-mix(in srgb, var(--sage) 25%, transparent);
  }
  .btn-primary:hover { background: var(--sage-dark); transform: translateY(-2px); }
  .btn-ghost {
    background: transparent; color: var(--ink);
    border: 1px solid var(--border);
  }
  .btn-ghost:hover { background: var(--cream-warm); border-color: var(--sage); }
  .btn svg { width: 14px; height: 14px; }

  .hero-trust {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--ink-soft);
  }
  .hero-trust .item { display: flex; align-items: center; gap: 8px; }
  .hero-trust .item svg { width: 16px; height: 16px; color: var(--sage); }
  .hero-trust .item strong { color: var(--ink); font-weight: 600; }

  /* Hero Photo Composition (3-Bilder-Layout) */
  .hero-photos {
    position: relative;
    aspect-ratio: 1/1.1;
  }
  .photo {
    position: absolute;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow-image);
    transition: transform 0.6s var(--smooth);
  }
  .photo:hover { transform: translateY(-6px); }
  .photo-main {
    top: 0;
    left: 8%;
    width: 70%;
    aspect-ratio: 4/5;
    z-index: 1;
    background: linear-gradient(160deg, var(--rose) 0%, var(--rose-dark) 50%, color-mix(in srgb, var(--rose-dark) 70%, #000) 100%);
  }
  .photo-side-1 {
    bottom: 8%;
    right: 0;
    width: 50%;
    aspect-ratio: 1/1;
    z-index: 2;
    background: linear-gradient(160deg, color-mix(in srgb, var(--sage) 80%, #ccc) 0%, var(--sage) 50%, var(--sage-dark) 100%);
  }
  .photo-side-2 {
    bottom: 0;
    left: 0;
    width: 38%;
    aspect-ratio: 1/1;
    z-index: 2;
    background: linear-gradient(160deg, #e8d4b8 0%, #c4b094 50%, #9a8870 100%);
  }
  .photo::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 60%, rgba(42, 40, 32, 0.25));
    pointer-events: none;
  }
  .photo .label {
    position: absolute;
    bottom: 16px; left: 16px;
    color: var(--cream);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    z-index: 2;
  }

  /* Decorative leaf shape */
  .hero-deco {
    position: absolute;
    top: 20%;
    right: -5%;
    width: 200px;
    opacity: 0.08;
    pointer-events: none;
  }

  /* ========================================
     ANLASS-FILTER (Schluessel-Element)
     ======================================== */
  .occasions { background: var(--cream); }
  .occasions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }
  .occasion-card {
    background: var(--bone);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px 20px 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.4s var(--spring);
    position: relative;
    overflow: hidden;
  }
  .occasion-card:hover {
    background: var(--sage);
    color: var(--cream);
    border-color: var(--sage);
    transform: translateY(-4px);
  }
  .occasion-icon {
    width: 56px; height: 56px;
    background: var(--sage-soft);
    color: var(--sage);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    transition: all 0.4s var(--spring);
  }
  .occasion-card:hover .occasion-icon {
    background: var(--cream);
    color: var(--sage);
    transform: scale(1.1);
  }
  .occasion-icon svg { width: 26px; height: 26px; stroke-width: 1.8; }
  .occasion-card h3 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 17px;
    margin-bottom: 4px;
    letter-spacing: -0.01em;
  }
  .occasion-card .price {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--ink-soft);
    transition: color 0.3s;
  }
  .occasion-card:hover .price { color: rgba(247, 243, 236, 0.7); }

  /* ========================================
     SAISON-HIGHLIGHT
     ======================================== */
  .seasonal {
    background: var(--sage-dark);
    color: var(--cream);
    position: relative;
    overflow: hidden;
  }
  .seasonal::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 10% 20%, rgba(247, 243, 236, 0.03) 1px, transparent 1px),
      radial-gradient(circle at 80% 70%, rgba(247, 243, 236, 0.03) 1.5px, transparent 1.5px);
    background-size: 50px 50px, 70px 70px;
  }
  .seasonal-grid {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: 64px;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  .seasonal-text .eyebrow { color: var(--rose); margin-bottom: 16px; display: block; }
  .seasonal-text h2 {
    font-size: clamp(40px, 5vw, 64px);
    line-height: 1.05;
    margin-bottom: 24px;
  }
  .seasonal-text h2 em {
    font-style: italic;
    color: var(--rose);
  }
  .seasonal-text p {
    color: rgba(247, 243, 236, 0.75);
    font-size: 17px;
    line-height: 1.65;
    margin-bottom: 24px;
  }

  .season-list {
    display: grid;
    gap: 14px;
    margin: 32px 0;
  }
  .season-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 0;
    border-bottom: 1px solid rgba(247, 243, 236, 0.1);
  }
  .season-item:last-child { border-bottom: none; }
  .season-item .check {
    color: var(--rose);
    margin-top: 4px;
    flex-shrink: 0;
  }
  .season-item .check svg { width: 16px; height: 16px; stroke-width: 2.5; }
  .season-item .name {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 17px;
    letter-spacing: -0.01em;
    margin-bottom: 2px;
  }
  .season-item .name em {
    font-style: italic;
    color: var(--rose);
  }
  .season-item .meta {
    font-family: var(--font-mono);
    font-size: 11px;
    color: rgba(247, 243, 236, 0.5);
    letter-spacing: 0.04em;
  }

  /* Saisonal Image Stack */
  .seasonal-photos {
    position: relative;
    aspect-ratio: 1/1;
  }
  .seasonal-photo {
    position: absolute;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
  }
  .seasonal-photo::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 70%, rgba(0,0,0,0.3));
  }
  .seasonal-photo .label {
    position: absolute;
    bottom: 12px; left: 12px;
    color: var(--cream);
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    z-index: 2;
  }
  .sp-1 {
    top: 0; left: 5%;
    width: 60%;
    aspect-ratio: 3/4;
    background: linear-gradient(160deg, #e8c4a8 0%, #c49a78 100%);
  }
  .sp-2 {
    top: 15%; right: 0;
    width: 45%;
    aspect-ratio: 1/1;
    background: linear-gradient(160deg, color-mix(in srgb, var(--sage) 80%, #ccc) 0%, var(--sage-dark) 100%);
  }
  .sp-3 {
    bottom: 0; left: 0;
    width: 50%;
    aspect-ratio: 4/3;
    background: linear-gradient(160deg, var(--rose) 0%, color-mix(in srgb, var(--rose-dark) 70%, #000) 100%);
  }

  /* ========================================
     PRODUCT GRID (Straeusse als Karten)
     ======================================== */
  .products { background: var(--bone); }
  .section-head { text-align: center; margin-bottom: 64px; }
  .section-head .eyebrow { display: block; margin-bottom: 16px; }
  .section-head h2 {
    font-size: clamp(40px, 5vw, 64px);
    margin-bottom: 16px;
    line-height: 1.05;
  }
  .section-head p {
    color: var(--ink-soft);
    font-size: 18px;
    max-width: 580px;
    margin: 0 auto;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
  }
  .product-card {
    background: var(--cream);
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.4s var(--smooth);
    border: 1px solid var(--border);
  }
  .product-card:hover { transform: translateY(-6px); }
  .product-img {
    aspect-ratio: 4/5;
    background: linear-gradient(160deg, var(--rose) 0%, var(--rose-dark) 100%);
    position: relative;
    overflow: hidden;
  }
  .product-img::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 60%, rgba(42, 40, 32, 0.15));
  }
  .product-img.var-1 { background: linear-gradient(160deg, #e8c4a8 0%, #c49a78 100%); }
  .product-img.var-2 { background: linear-gradient(160deg, var(--rose) 0%, color-mix(in srgb, var(--rose-dark) 70%, #000) 100%); }
  .product-img.var-3 { background: linear-gradient(160deg, color-mix(in srgb, var(--sage) 80%, #ccc) 0%, var(--sage-dark) 100%); }
  .product-img.var-4 { background: linear-gradient(160deg, #b8a890 0%, #7a6850 100%); }

  .product-badge {
    position: absolute;
    top: 16px; left: 16px;
    background: var(--cream);
    color: var(--sage-dark);
    padding: 5px 12px;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    z-index: 2;
  }
  .product-badge.new { background: var(--accent); color: var(--cream); }
  .product-badge.bestseller { background: var(--rose); color: var(--cream); }
  .product-badge.season { background: var(--sage); color: var(--cream); }

  .product-info {
    padding: 20px 22px 24px;
  }
  .product-info h3 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 20px;
    letter-spacing: -0.02em;
    margin-bottom: 4px;
  }
  .product-info .desc {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.04em;
    color: var(--ink-soft);
    margin-bottom: 16px;
  }
  .product-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }
  .product-price {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 22px;
    color: var(--sage-dark);
    letter-spacing: -0.01em;
  }
  .product-price .from {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-soft);
    letter-spacing: 0.06em;
    margin-right: 4px;
    text-transform: uppercase;
  }
  .product-cart {
    width: 38px; height: 38px;
    background: var(--cream-tint);
    border: none;
    border-radius: 50%;
    color: var(--sage-dark);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s var(--spring);
  }
  .product-cart:hover {
    background: var(--sage);
    color: var(--cream);
    transform: rotate(-10deg);
  }
  .product-cart svg { width: 18px; height: 18px; stroke-width: 2; }

  /* ========================================
     DELIVERY ZONES
     ======================================== */
  .delivery { background: var(--cream-tint); }
  .delivery-grid {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 64px;
    align-items: center;
  }
  .delivery-info h2 {
    font-size: clamp(36px, 4vw, 52px);
    line-height: 1.05;
    margin-bottom: 28px;
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
    padding: 18px 24px;
    background: var(--bone);
    border: 1px solid var(--border);
    border-radius: 16px;
    transition: border-color 0.3s, transform 0.3s;
  }
  .zone-row:hover {
    border-color: var(--sage);
    transform: translateX(4px);
  }
  .zone-row.featured {
    background: var(--sage);
    color: var(--cream);
    border-color: var(--sage);
  }
  .zone-dot {
    width: 12px; height: 12px;
    border-radius: 50%;
    background: var(--sage);
    flex-shrink: 0;
  }
  .zone-row.featured .zone-dot { background: var(--cream); }
  .zone-name {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 18px;
    letter-spacing: -0.01em;
  }
  .zone-time {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-soft);
    letter-spacing: 0.04em;
  }
  .zone-row.featured .zone-time { color: rgba(247, 243, 236, 0.7); }
  .zone-price {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 17px;
    color: var(--sage-dark);
  }
  .zone-row.featured .zone-price { color: var(--cream); }
  .zone-row.free .zone-price {
    color: var(--accent);
  }

  /* Delivery Map */
  .delivery-map {
    background: var(--sage-dark);
    border-radius: 24px;
    overflow: hidden;
    position: relative;
    min-height: 500px;
  }
  .delivery-map svg {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
  }
  .map-bg-block { fill: rgba(247, 243, 236, 0.04); }
  .map-bg-park { fill: color-mix(in srgb, var(--rose) 8%, transparent); }
  .map-bg-water { fill: color-mix(in srgb, var(--accent) 6%, transparent); }
  .map-bg-street { stroke: rgba(247, 243, 236, 0.08); stroke-width: 2; fill: none; }
  .map-bg-street-major { stroke: rgba(247, 243, 236, 0.15); stroke-width: 4; fill: none; stroke-linecap: round; }

  /* Delivery zone circles */
  .delivery-circle {
    fill: color-mix(in srgb, var(--rose) 8%, transparent);
    stroke: color-mix(in srgb, var(--rose) 30%, transparent);
    stroke-width: 1.5;
    stroke-dasharray: 4 4;
  }
  .delivery-circle.inner {
    fill: color-mix(in srgb, var(--rose) 15%, transparent);
    stroke: color-mix(in srgb, var(--rose) 50%, transparent);
  }

  .map-pin {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -100%);
    z-index: 2;
  }
  .map-pin-circle {
    width: 56px; height: 56px;
    background: var(--rose);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--cream);
    box-shadow: 0 8px 24px color-mix(in srgb, var(--rose) 50%, transparent);
    animation: pinFloat 3s ease-in-out infinite;
  }
  .map-pin-circle svg { width: 26px; height: 26px; stroke-width: 1.8; }
  @keyframes pinFloat {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-6px); }
  }
  .map-overlay {
    position: absolute;
    bottom: 24px; left: 24px;
    background: rgba(247, 243, 236, 0.95);
    border-radius: 16px;
    padding: 16px 20px;
    backdrop-filter: blur(12px);
    z-index: 3;
  }
  .map-overlay .label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--sage);
    margin-bottom: 4px;
  }
  .map-overlay .name {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 17px;
    color: var(--ink);
    letter-spacing: -0.01em;
  }

  /* ========================================
     ABO / SUBSCRIPTION
     ======================================== */
  .subscription { background: var(--rose); color: var(--cream); }
  .sub-grid {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  .sub-text h2 {
    font-size: clamp(40px, 5vw, 64px);
    line-height: 1.05;
    margin-bottom: 24px;
  }
  .sub-text h2 em {
    font-style: italic;
    color: var(--bone);
  }
  .sub-text p {
    color: rgba(247, 243, 236, 0.85);
    font-size: 17px;
    line-height: 1.65;
    margin-bottom: 24px;
  }
  .sub-options {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    margin-top: 28px;
    margin-bottom: 28px;
  }
  .sub-option {
    background: rgba(247, 243, 236, 0.08);
    border: 1px solid rgba(247, 243, 236, 0.15);
    border-radius: 16px;
    padding: 20px 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s var(--spring);
  }
  .sub-option:hover {
    background: rgba(247, 243, 236, 0.15);
    border-color: rgba(247, 243, 236, 0.3);
    transform: translateY(-3px);
  }
  .sub-option.featured {
    background: var(--bone);
    color: var(--ink);
    border-color: var(--bone);
  }
  .sub-option .freq {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(247, 243, 236, 0.7);
    margin-bottom: 8px;
  }
  .sub-option.featured .freq { color: var(--rose-dark); }
  .sub-option .price {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 28px;
    letter-spacing: -0.02em;
    line-height: 1;
    margin-bottom: 4px;
  }
  .sub-option .price em {
    font-style: italic;
    font-size: 14px;
    color: rgba(247, 243, 236, 0.7);
  }
  .sub-option.featured .price em { color: var(--ink-soft); }
  .sub-option .per {
    font-family: var(--font-mono);
    font-size: 10px;
    color: rgba(247, 243, 236, 0.6);
    letter-spacing: 0.04em;
  }
  .sub-option.featured .per { color: var(--ink-soft); }
  .sub-cta {
    background: var(--bone);
    color: var(--ink);
    padding: 16px 28px;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.08em;
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
    background: var(--sage-dark);
    color: var(--cream);
    transform: translateY(-2px);
  }
  .sub-cta svg { width: 14px; height: 14px; }

  .sub-photo {
    position: relative;
    aspect-ratio: 4/5;
    border-radius: 24px;
    overflow: hidden;
    background: linear-gradient(160deg, var(--rose-dark) 0%, color-mix(in srgb, var(--rose-dark) 70%, #000) 60%, color-mix(in srgb, var(--rose-dark) 50%, #000) 100%);
    box-shadow: var(--shadow-image);
  }
  .sub-photo::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.4));
  }
  .sub-photo .label {
    position: absolute;
    bottom: 24px; left: 24px;
    color: var(--cream);
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    z-index: 2;
  }

  /* ========================================
     WORKSHOPS
     ======================================== */
  .workshops { background: var(--bone); }
  .workshops-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .workshop-card {
    background: var(--cream);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    transition: border-color 0.3s, transform 0.4s var(--spring);
    cursor: pointer;
  }
  .workshop-card:hover {
    border-color: var(--sage);
    transform: translateY(-4px);
  }
  .workshop-img {
    aspect-ratio: 16/10;
    position: relative;
  }
  .workshop-img.var-1 { background: linear-gradient(160deg, var(--rose), color-mix(in srgb, var(--rose-dark) 70%, #000)); }
  .workshop-img.var-2 { background: linear-gradient(160deg, color-mix(in srgb, var(--sage) 80%, #ccc), var(--sage-dark)); }
  .workshop-img.var-3 { background: linear-gradient(160deg, #c4b094, #7a6850); }
  .workshop-date {
    position: absolute;
    top: 16px; left: 16px;
    background: var(--bone);
    padding: 10px 14px;
    border-radius: 12px;
    text-align: center;
    box-shadow: var(--shadow-card);
  }
  .workshop-date .day {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 22px;
    color: var(--sage-dark);
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .workshop-date .month {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-top: 2px;
  }
  .workshop-content { padding: 24px 24px 28px; }
  .workshop-meta {
    display: flex;
    gap: 16px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-soft);
    letter-spacing: 0.04em;
    margin-bottom: 12px;
  }
  .workshop-meta .item { display: flex; align-items: center; gap: 6px; }
  .workshop-meta svg { width: 14px; height: 14px; color: var(--sage); }
  .workshop-content h3 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 22px;
    line-height: 1.2;
    margin-bottom: 8px;
    letter-spacing: -0.02em;
  }
  .workshop-content p {
    color: var(--ink-soft);
    font-size: 14px;
    line-height: 1.55;
    margin-bottom: 20px;
  }
  .workshop-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }
  .workshop-price {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 22px;
    color: var(--sage-dark);
  }
  .workshop-spots {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-soft);
    letter-spacing: 0.04em;
  }
  .workshop-spots strong { color: var(--accent); }

  /* ========================================
     ABOUT / FLORISTIN
     ======================================== */
  .about { background: var(--cream); }
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: 64px;
    align-items: center;
  }
  .florist-image {
    position: relative;
    aspect-ratio: 4/5;
    border-radius: 24px;
    overflow: hidden;
    background: linear-gradient(160deg, #c4b094 0%, #8a7660 60%, #5a4d3e 100%);
    box-shadow: var(--shadow-image);
  }
  .florist-image::after {
    content: '';
    position: absolute;
    bottom: 24px; left: 24px;
    color: rgba(247, 243, 236, 0.5);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
  }
  .florist-quote {
    position: absolute;
    top: 24px; left: 24px;
    right: 24px;
    background: rgba(250, 246, 238, 0.95);
    padding: 20px 24px;
    border-radius: 16px;
    backdrop-filter: blur(12px);
  }
  .florist-quote p {
    font-family: var(--font-display);
    font-style: italic;
    font-size: 17px;
    line-height: 1.45;
    color: var(--ink);
    letter-spacing: -0.01em;
    font-variation-settings: "opsz" 24, "SOFT" 80;
  }
  .florist-quote .signature {
    margin-top: 12px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--sage);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .about-text h2 {
    font-size: clamp(36px, 4.5vw, 56px);
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
  .about-values {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-top: 32px;
    padding-top: 32px;
    border-top: 1px solid var(--border);
  }
  .value-item .icon {
    width: 40px; height: 40px;
    background: var(--sage-soft);
    color: var(--sage);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }
  .value-item .icon svg { width: 20px; height: 20px; stroke-width: 1.8; }
  .value-item h4 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 17px;
    margin-bottom: 6px;
    letter-spacing: -0.01em;
  }
  .value-item p {
    font-size: 14px;
    color: var(--ink-soft);
    margin: 0;
  }

  /* ========================================
     REVIEWS
     ======================================== */
  .reviews-section {
    background: var(--ink);
    padding: 96px 0;
    overflow: hidden;
    position: relative;
  }
  .reviews-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(247,243,236,.1), transparent);
  }
  .reviews-track-wrap { overflow: hidden; margin: 52px -32px 0; padding: 0 32px; }
  .reviews-track { display: flex; gap: 20px; animation: scrollLeft 40s linear infinite; width: max-content; }
  .reviews-track:hover { animation-play-state: paused; }
  @keyframes scrollLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .review-card {
    background: rgba(255,255,255,.06);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 16px;
    padding: 32px;
    width: 340px;
    flex-shrink: 0;
    transition: all .3s;
    cursor: default;
  }
  .review-card:hover { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.15); transform: translateY(-2px); }
  .review-stars { color: #f59e0b; margin-bottom: 18px; letter-spacing: 2px; font-size: 1rem; }
  .review-text { font-size: .92rem; color: rgba(255,255,255,.78); line-height: 1.75; margin-bottom: 24px; font-style: italic; }
  .review-author { display: flex; align-items: center; gap: 12px; }
  .review-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, var(--sage), var(--rose)); display: flex; align-items: center; justify-content: center; font-size: .82rem; font-weight: 700; color: #fff; flex-shrink: 0; }
  .review-name { font-size: .88rem; font-weight: 600; color: #fff; }

  /* ========================================
     FAQ
     ======================================== */
  .faq-section { background: var(--cream); }
  .faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 48px; }
  .faq-item { background: var(--bone); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; transition: border-color .2s; }
  .faq-item:hover { border-color: var(--sage); }
  .faq-q { width: 100%; background: none; border: none; cursor: pointer; padding: 22px 26px; text-align: left; display: flex; justify-content: space-between; align-items: center; gap: 16px; font-family: var(--font-body); font-size: .92rem; font-weight: 600; color: var(--ink); transition: background .2s; }
  .faq-q:hover { background: var(--sage-soft); }
  .faq-icon { width: 28px; height: 28px; border-radius: 50%; background: var(--sage-soft); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 1rem; color: var(--sage); transition: all .25s var(--spring); }
  .faq-item.open .faq-icon { transform: rotate(45deg); background: var(--sage); color: var(--cream); }
  .faq-a { max-height: 0; overflow: hidden; transition: max-height .35s cubic-bezier(.4,0,.2,1), padding .35s; font-size: .9rem; color: var(--ink-soft); line-height: 1.75; padding: 0 26px; }
  .faq-item.open .faq-a { max-height: 400px; padding: 0 26px 22px; }

  /* ========================================
     CONTACT FORM
     ======================================== */
  .contact-section { background: var(--sage-dark); color: var(--cream); }
  .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start; }
  .contact-info h2 { font-size: clamp(36px, 4vw, 52px); line-height: 1.05; margin-bottom: 24px; }
  .contact-info p { color: rgba(247,243,236,.75); font-size: 17px; line-height: 1.65; margin-bottom: 32px; }
  .contact-detail { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-size: 15px; }
  .contact-detail svg { width: 20px; height: 20px; color: var(--rose); flex-shrink: 0; }
  .contact-form { display: flex; flex-direction: column; gap: 14px; }
  .contact-form input, .contact-form textarea {
    padding: 16px 20px; border-radius: 12px; border: 1px solid rgba(247,243,236,.15);
    background: rgba(247,243,236,.06); color: var(--cream); font-size: .95rem;
    font-family: var(--font-body); outline: none; transition: border-color .2s, background .2s;
  }
  .contact-form input:focus, .contact-form textarea:focus { border-color: rgba(247,243,236,.4); background: rgba(247,243,236,.12); }
  .contact-form input::placeholder, .contact-form textarea::placeholder { color: rgba(247,243,236,.4); }
  .contact-form textarea { min-height: 120px; resize: vertical; }

  /* ========================================
     FOOTER
     ======================================== */
  footer {
    background: var(--sage-dark);
    color: rgba(247, 243, 236, 0.7);
    padding: 64px 0 32px;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 48px;
    margin-bottom: 48px;
  }
  .footer-brand .logo { color: var(--cream); margin-bottom: 16px; }
  .footer-brand .logo-mark { background: var(--rose); }
  .footer-brand p {
    font-size: 14px;
    line-height: 1.6;
    max-width: 320px;
  }
  .footer-col h4 {
    color: var(--cream);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 20px;
  }
  .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .footer-col a { font-size: 14px; transition: color 0.2s; }
  .footer-col a:hover { color: var(--rose); }
  .footer-bottom {
    border-top: 1px solid rgba(247, 243, 236, 0.1);
    padding-top: 24px;
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.05em;
    color: rgba(247, 243, 236, 0.4);
  }
  .footer-bottom a:hover { color: var(--rose); }

  /* ========================================
     STICKY MOBILE CTA
     ======================================== */
  .mobile-cta {
    display: none;
    position: fixed;
    bottom: 16px; left: 16px; right: 16px;
    background: var(--sage);
    color: var(--cream);
    padding: 16px 24px;
    border-radius: 999px;
    z-index: 100;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-align: center;
    box-shadow: 0 8px 32px rgba(42, 40, 32, 0.4);
  }

  /* ========================================
     RESPONSIVE
     ======================================== */
  @media (max-width: 1024px) {
    .hero-grid { grid-template-columns: 1fr; gap: 48px; }
    .occasions-grid { grid-template-columns: repeat(3, 1fr); }
    .products-grid { grid-template-columns: repeat(2, 1fr); }
    .seasonal-grid { grid-template-columns: 1fr; gap: 48px; }
    .delivery-grid { grid-template-columns: 1fr; gap: 48px; }
    .sub-grid { grid-template-columns: 1fr; gap: 48px; }
    .workshops-grid { grid-template-columns: 1fr; }
    .about-grid { grid-template-columns: 1fr; gap: 48px; }
    .contact-grid { grid-template-columns: 1fr; gap: 48px; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .faq-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    section { padding: 64px 0; }
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2C8 7 6 11 6 15C6 19 9 22 12 22C15 22 18 19 18 15C18 11 16 7 12 2Z"/><path d="M12 12V22"/></svg>
      </span>
      ${e(c.name)}
    </a>
    <div class="nav-links">
      ${occasions.length > 0 ? '<a href="#occasions">Anl&auml;sse</a>' : ''}
      ${products.length > 0 ? '<a href="#products">Str&auml;u&szlig;e</a>' : ''}
      <a href="#subscription">Abo</a>
      <a href="#about">Werkstatt</a>
      <a href="#kontakt">Kontakt</a>
    </div>
    <a href="#products" class="nav-cta">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      ${e(c.ctaText)}
    </a>
  </div>
</nav>

<!-- ====== HERO ====== -->
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
        <a href="#products" class="btn btn-primary">
          ${e(c.ctaText)}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
        <a href="#subscription" class="btn btn-ghost">Blumen-Abo ansehen</a>
      </div>
      ${trustItems.length > 0 ? `<div class="hero-trust">
        ${trustItems.map(t => `<div class="item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
          ${t.text}
        </div>`).join('\n        ')}
      </div>` : ''}
    </div>

    <div class="hero-photos">
      <div class="photo photo-main"${c.heroImageUrl ? ` style="background:url('${e(c.heroImageUrl)}') center/cover"` : ''}>
        <span class="label">${e(c.name)}</span>
      </div>
      <div class="photo photo-side-1">
        <span class="label">Saisonal</span>
      </div>
      <div class="photo photo-side-2">
        <span class="label">Handgebunden</span>
      </div>
    </div>
  </div>
</section>

<!-- ====== ANLASS-FILTER ====== -->
${occasions.length > 0 ? `<section id="occasions" class="occasions">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">F&uuml;r jeden Anlass</span>
      <h2 class="display">Wof&uuml;r sind die <em>Blumen</em>?</h2>
      <p>W&auml;hl deinen Anlass &mdash; wir kuratieren die passenden Str&auml;u&szlig;e in jeder Preisklasse.</p>
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

      <a href="#products" class="btn btn-primary" style="background: var(--rose); color: var(--ink);">
        Saison-Str&auml;u&szlig;e ansehen
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
    </div>

    <div class="seasonal-photos">
      <div class="seasonal-photo sp-1">
        <span class="label">Saisonal</span>
      </div>
      <div class="seasonal-photo sp-2">
        <span class="label">Regional</span>
      </div>
      <div class="seasonal-photo sp-3">
        <span class="label">Handgebunden</span>
      </div>
    </div>
  </div>
</section>` : ''}

<!-- ====== PRODUCT GRID ====== -->
${products.length > 0 ? `<section id="products" class="products">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Aktuelle Str&auml;u&szlig;e</span>
      <h2 class="display">Heute <em>frisch</em> gebunden.</h2>
      <p>Was wir gerade in der Werkstatt haben.</p>
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
            <button class="product-cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
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
      <span class="eyebrow" style="display:block; margin-bottom:16px;">Lieferung</span>
      <h2 class="display">Wir liefern in deiner <em>Region</em>.</h2>

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

    <!-- Stilisierte Map mit Liefer-Kreisen -->
    <div class="delivery-map">
      <svg class="map-svg" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid slice">
        <!-- Park -->
        <path class="map-bg-park" d="M 380 60 L 500 80 L 540 200 L 480 280 L 400 220 Z"/>

        <!-- Fluss -->
        <path class="map-bg-water" d="M 300 0 Q 320 100 280 200 Q 240 300 320 400 Q 360 460 340 500 L 380 500 L 380 0 Z"/>

        <!-- Bloecke -->
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

        <!-- Strassen -->
        <line class="map-bg-street-major" x1="0"   y1="260" x2="600" y2="260"/>
        <line class="map-bg-street"       x1="0"   y1="155" x2="600" y2="155"/>
        <line class="map-bg-street"       x1="0"   y1="395" x2="600" y2="395"/>
        <line class="map-bg-street"       x1="140" y1="0"   x2="140" y2="500"/>
        <line class="map-bg-street"       x1="510" y1="0"   x2="510" y2="500"/>

        <!-- Liefer-Kreise (vom Standort) -->
        <circle class="delivery-circle inner" cx="300" cy="250" r="80"/>
        <circle class="delivery-circle"       cx="300" cy="250" r="160"/>
        <circle class="delivery-circle"       cx="300" cy="250" r="240"/>
      </svg>

      <div class="map-pin">
        <div class="map-pin-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2C8 7 6 11 6 15C6 19 9 22 12 22C15 22 18 19 18 15C18 11 16 7 12 2Z"/><path d="M12 12V22"/></svg>
        </div>
      </div>

      <div class="map-overlay">
        <div class="label">Werkstatt</div>
        <div class="name">${e(c.address)}</div>
      </div>
    </div>

  </div>
</section>` : ''}

<!-- ====== ABO ====== -->
<section id="subscription" class="subscription">
  <div class="container sub-grid">
    <div class="sub-text">
      <span class="eyebrow" style="color: var(--bone);">Blumen-Abo</span>
      <h2 class="display" style="color: var(--cream);">Frische Blumen, <em>regelm&auml;&szlig;ig</em>.</h2>
      <p>Du w&auml;hlst Rhythmus und Gr&ouml;&szlig;e &mdash; wir k&uuml;mmern uns um den Rest. <strong>Jede Lieferung anders</strong>, immer saisonal, jederzeit pausierbar.</p>

      <div class="sub-options">
        <div class="sub-option">
          <div class="freq">W&ouml;chentlich</div>
          <div class="price"><em>ab</em> 32 &euro;</div>
          <div class="per">pro Lieferung</div>
        </div>
        <div class="sub-option featured">
          <div class="freq">14-t&auml;gig</div>
          <div class="price"><em>ab</em> 38 &euro;</div>
          <div class="per">pro Lieferung &middot; beliebt</div>
        </div>
        <div class="sub-option">
          <div class="freq">Monatlich</div>
          <div class="price"><em>ab</em> 45 &euro;</div>
          <div class="per">pro Lieferung</div>
        </div>
      </div>

      <a href="#kontakt" class="sub-cta">
        Abo starten
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
    </div>

    <div class="sub-photo">
      <span class="label">Abo-Strau&szlig; &middot; Aktuelle Lieferung</span>
    </div>
  </div>
</section>

<!-- ====== REVIEWS ====== -->
${reviews.length > 0 ? `<section class="reviews-section">
  <div class="container" style="margin-bottom:0">
    <span class="eyebrow" style="color:rgba(247,243,236,.4);display:block;margin-bottom:16px;">Kundenstimmen</span>
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
        <p>${e(c.aboutText)}</p>
        <div class="signature">&mdash; ${e(c.name)}</div>
      </div>` : ''}
    </div>
    <div class="about-text">
      <span class="eyebrow" style="display:block; margin-bottom:16px;">Die Werkstatt</span>
      ${c.aboutTitle ? `<h2 class="display">${c.aboutTitle}</h2>` : `<h2 class="display">&Uuml;ber <em>${e(c.name)}</em>.</h2>`}
      ${c.aboutText ? `<p>${e(c.aboutText)}</p>` : ''}
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
      <span class="eyebrow" style="color:var(--rose);display:block;margin-bottom:16px;">Kontakt</span>
      <h2 class="display" style="color:var(--cream);">Schreib uns eine <em>Nachricht</em>.</h2>
      <p>Wir melden uns schnellstm&ouml;glich bei dir.</p>
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
      ${openingHours.length > 0 ? `<div style="margin-top:24px;">
        ${openingHours.map(oh => `<div class="contact-detail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <strong>${e(oh.days)}</strong>&nbsp;${e(oh.hours)}
        </div>`).join('\n        ')}
      </div>` : ''}
    </div>
    <form class="contact-form" onsubmit="return false">
      <input type="text" name="name" placeholder="Dein Name" required aria-label="Name">
      <input type="email" name="email" placeholder="Deine E-Mail" required aria-label="E-Mail">
      <input type="tel" name="phone" placeholder="Telefonnummer (optional)" aria-label="Telefon">
      <textarea name="message" placeholder="Deine Nachricht..." required aria-label="Nachricht"></textarea>
      <div style="position:absolute;left:-9999px"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>
      <button class="btn btn-primary" type="button" id="cta-submit" style="width:100%;justify-content:center;">
        ${e(c.ctaText)}
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2C8 7 6 11 6 15C6 19 9 22 12 22C15 22 18 19 18 15C18 11 16 7 12 2Z"/><path d="M12 12V22"/></svg>
          </span>
          ${e(c.name)}
        </a>
        <p>${e(c.tagline)}</p>
      </div>
      <div class="footer-col">
        <h4>Bestellen</h4>
        <ul>
          ${products.length > 0 ? '<li><a href="#products">Str&auml;u&szlig;e</a></li>' : ''}
          <li><a href="#subscription">Blumen-Abo</a></li>
          ${occasions.length > 0 ? '<li><a href="#occasions">Anl&auml;sse</a></li>' : ''}
        </ul>
      </div>
      <div class="footer-col">
        <h4>Werkstatt</h4>
        <ul>
          <li><a href="#about">&Uuml;ber uns</a></li>
          ${deliveryZones.length > 0 ? '<li><a href="#delivery">Lieferung</a></li>' : ''}
          <li><a href="#kontakt">Kontakt</a></li>
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

<a href="#products" class="mobile-cta">${e(c.ctaText)} &rarr;</a>

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

  // Contact form
  ${siteId ? `(function() {
    var ctaBtn = document.getElementById('cta-submit');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', async function() {
        var form = this.closest('.contact-form');
        if (!form) return;
        var data = {};
        form.querySelectorAll('input,textarea').forEach(function(i) {
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
            form.innerHTML = '<div style="text-align:center;padding:40px"><h3 style="color:var(--cream);font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:rgba(247,243,236,.7);font-size:1.05rem">Wir melden uns schnellstm\\u00f6glich bei dir.</p></div>';
          } else {
            alert(d.error || 'Fehler beim Senden.');
            this.textContent = '${e(c.ctaText)}';
            this.disabled = false;
          }
        } catch(err) {
          alert('Verbindungsfehler. Bitte versuche es erneut.');
          this.textContent = '${e(c.ctaText)}';
          this.disabled = false;
        }
      });
    }
  })();` : ''}
</script>

<!-- Cookie Banner -->
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:rgba(42,40,32,.97);backdrop-filter:blur(12px);color:#fff;padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:rgba(255,255,255,.8)">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen finden Sie in unserer <a href="#" style="color:#fff;text-decoration:underline">Datenschutzerkl&auml;rung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:#fff;color:#2a2820;border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
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
