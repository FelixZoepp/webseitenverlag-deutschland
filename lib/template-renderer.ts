import { SiteConfig } from '@/types'

function e(str: string | undefined): string {
  if (!str) return ''
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

export function renderTemplate(config: SiteConfig, siteId?: string): string {
  const c = {
    name: config.businessName || 'Mein Unternehmen',
    tagline: config.tagline || '',
    desc: config.description || '',
    primary: config.primaryColor || '#2563eb',
    secondary: config.secondaryColor || '#eff6ff',
    bg: config.backgroundColor || '#ffffff',
    text: config.textColor || '#1e293b',
    heroImg: config.heroImageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80',
    heroSub: config.heroSubtitle || config.description || '',
    badge: config.heroBadge || '',
    cta: config.ctaText || 'Jetzt Anfrage senden',
    ctaImg: config.ctaImageUrl || '',
    owner: config.ownerName || '',
    ownerRole: config.ownerRole || '',
    ownerImg: config.ownerImageUrl || '',
    about: config.aboutText || '',
    about2: config.aboutText2 || '',
    region: config.region || '',
    phone: config.phone || '',
    email: config.email || '',
    address: config.address || '',
    instagram: config.instagramUrl || '',
    whatsapp: config.whatsappUrl || '',
    googlemaps: config.googlemapsUrl || '',
    imprint: config.imprintUrl || '#',
    privacy: config.privacyUrl || '#',
  }
  const stats = config.stats || []
  const services = config.services || []
  const reviews = config.reviews || []
  const faqItems = config.faqItems || []
  const gallery = config.galleryImages || []
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

  // SVG icon map for services (replaces emojis per UUPM guideline)
  const svgIcons: Record<string, string> = {
    // Handwerker
    'home': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    'wrench': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>',
    'tree': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-7"/><path d="M5 12H2l10-10 10 10h-3"/><path d="M8 17H5l7-7 7 7h-3"/></svg>',
    'layers': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    // Restaurant
    'utensils': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>',
    'package': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4l-9-5.19"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    'party': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5.8 11.3L2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="M22 2l-2.24.75a2.9 2.9 0 00-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="M22 13l-3.35-1.2a2.89 2.89 0 00-3.57 1.52v0a1.49 1.49 0 01-2.06.58l-.4-.24"/><path d="M8 22l1.17-5.28a2.9 2.9 0 00-1.66-3.29v0c-.8-.35-1.13-1.3-.73-2.08L8 9"/></svg>',
    'wine': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22h8"/><path d="M12 11v11"/><path d="M20 7c0 5-3.5 7.5-8 7.5S4 12 4 7"/><path d="M4 3h16v4"/></svg>',
    // Arztpraxis
    'stethoscope': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 105 2H4a2 2 0 00-2 2v5a6 6 0 0012 0V4a2 2 0 00-2-2h-1a.2.2 0 10.3.3"/><path d="M8 15v1a6 6 0 006 6v0a6 6 0 006-6v-4"/><circle cx="20" cy="10" r="2"/></svg>',
    'shield': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
    'heart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/></svg>',
    'activity': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    // Anwalt
    'scale': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v19"/><path d="M5 8l7-5 7 5"/><path d="M1 15l4-7 4 7a4 4 0 01-8 0z"/><path d="M15 15l4-7 4 7a4 4 0 01-8 0z"/></svg>',
    'file': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    'building': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>',
    // General
    'star': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    'settings': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
    'check-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    'phone': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>',
    'mail': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>',
    'map-pin': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    'instagram': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    'message-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>',
  }

  // Map emoji to SVG icon key
  const emojiToIcon: Record<string, string> = {
    '🏠': 'home', '🔧': 'wrench', '🌳': 'tree', '🪜': 'layers',
    '🍽️': 'utensils', '🥡': 'package', '🎉': 'party', '🍷': 'wine',
    '🩺': 'stethoscope', '💉': 'shield', '🫀': 'heart', '🧘': 'activity',
    '⚖️': 'scale', '📋': 'file', '🏢': 'building',
    '⭐': 'star', '⚙️': 'settings', '🛡️': 'shield',
  }

  function getIcon(emoji: string): string {
    const key = emojiToIcon[emoji] || 'star'
    return svgIcons[key] || svgIcons['star']
  }

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${e(c.name)} | ${e(c.tagline)}</title>
<meta name="description" content="${e(c.desc)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
<style>
:root{
  --p:${e(c.primary)};--s:${e(c.secondary)};--bg:${e(c.bg)};--t:${e(c.text)};
  --g:#64748b;--b:rgba(0,0,0,.08);--r:16px;
  --accent:${e(c.primary)};
  --card-shadow:0 1px 3px rgba(0,0,0,.06),0 8px 24px rgba(0,0,0,.06);
  --card-shadow-hover:0 4px 12px rgba(0,0,0,.08),0 20px 48px rgba(0,0,0,.12);
  --glow:0 0 0 3px color-mix(in srgb, var(--p) 20%, transparent);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'DM Sans',system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--t);line-height:1.7;font-size:16px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
h1,h2,h3,h4{font-family:'Fraunces',Georgia,serif;line-height:1.2;letter-spacing:-.02em}
a{color:inherit;text-decoration:none}
img{display:block;width:100%;object-fit:cover}
.wrap{max-width:1120px;margin:0 auto;padding:0 40px}
section{padding:110px 40px}
.sec-label{font-size:.72rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--p);margin-bottom:16px;display:flex;align-items:center;gap:10px}
.sec-label::before{content:'';width:24px;height:2px;background:var(--p);border-radius:2px}
.sec-title{font-size:clamp(2rem,3.5vw,3rem);font-weight:700;letter-spacing:-.025em;margin-bottom:20px;color:var(--t)}
.sec-sub{color:var(--g);max-width:580px;font-size:1.05rem;line-height:1.75}

/* BUTTONS */
.btn{background:var(--p);color:#fff;padding:16px 34px;border-radius:50px;font-weight:600;font-size:.92rem;border:none;cursor:pointer;transition:all .25s cubic-bezier(.4,0,.2,1);display:inline-flex;align-items:center;gap:10px;font-family:'DM Sans',sans-serif;box-shadow:0 4px 16px color-mix(in srgb, var(--p) 35%, transparent);letter-spacing:.01em}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px color-mix(in srgb, var(--p) 45%, transparent);filter:brightness(1.06)}
.btn:focus-visible{outline:none;box-shadow:var(--glow),0 4px 16px color-mix(in srgb, var(--p) 35%, transparent)}
.btn-ghost{background:rgba(255,255,255,.15);color:#fff;padding:16px 34px;border-radius:50px;font-weight:500;font-size:.92rem;border:1px solid rgba(255,255,255,.3);backdrop-filter:blur(8px);transition:all .25s;display:inline-flex;align-items:center;gap:10px;cursor:pointer}
.btn-ghost:hover{background:rgba(255,255,255,.25);border-color:rgba(255,255,255,.5)}

/* GRIDS */
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}

/* CARDS — Glassmorphism-inspired */
.card{background:rgba(255,255,255,.85);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.6);border-radius:var(--r);padding:36px;transition:all .3s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden;box-shadow:var(--card-shadow);cursor:default}
.card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,var(--p),color-mix(in srgb, var(--p) 60%, transparent));transform:scaleY(0);transform-origin:bottom;transition:transform .3s cubic-bezier(.4,0,.2,1)}
.card:hover{transform:translateY(-4px);box-shadow:var(--card-shadow-hover)}
.card:hover::before{transform:scaleY(1)}
.card-icon{width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,var(--s),color-mix(in srgb, var(--s) 70%, #fff));display:flex;align-items:center;justify-content:center;margin-bottom:20px;color:var(--p)}
.card-icon svg{width:24px;height:24px}

/* NAV — Floating glassmorphism */
nav{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.88);backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid rgba(0,0,0,.06);padding:0 40px;display:flex;align-items:center;justify-content:space-between;height:72px}
.nav-logo{font-family:'Fraunces',serif;font-size:1.15rem;font-weight:700;color:var(--p);display:flex;align-items:center;gap:10px}
.nav-links{display:flex;align-items:center;gap:32px}
.nav-links a{font-size:.88rem;font-weight:500;color:var(--g);transition:color .2s;cursor:pointer}
.nav-links a:hover{color:var(--p)}
.nav-links a:focus-visible{outline:none;box-shadow:var(--glow);border-radius:4px}
.nav-cta{background:var(--p);color:#fff !important;padding:10px 24px;border-radius:50px;font-size:.82rem !important;font-weight:600 !important;transition:all .25s !important;box-shadow:0 2px 8px color-mix(in srgb, var(--p) 30%, transparent);cursor:pointer}
.nav-cta:hover{filter:brightness(1.08) !important;transform:translateY(-1px);box-shadow:0 4px 16px color-mix(in srgb, var(--p) 40%, transparent)}

/* HERO — Premium gradient overlay */
#hero{position:relative;min-height:92vh;display:flex;align-items:center;overflow:hidden;padding:0}
.hero-bg{position:absolute;inset:0;background-size:cover;background-position:center}
.hero-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(125deg,rgba(0,0,0,.78) 0%,rgba(0,0,0,.50) 40%,rgba(0,0,0,.15) 70%,transparent 100%)}
.hero-bg::before{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.4) 0%,transparent 40%);z-index:1}
.hero-content{position:relative;z-index:2;max-width:720px;padding:100px 50px 100px 80px;animation:fadeUp .8s cubic-bezier(.4,0,.2,1) both}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);backdrop-filter:blur(12px);color:#fff;font-size:.78rem;font-weight:600;padding:8px 20px;border-radius:50px;margin-bottom:28px;letter-spacing:.03em}
.hero-content h1{font-size:clamp(2.4rem,5vw,3.8rem);color:#fff;font-weight:700;margin-bottom:24px;letter-spacing:-.03em;line-height:1.08}
.hero-content p{color:rgba(255,255,255,.82);font-size:1.08rem;max-width:520px;margin-bottom:44px;line-height:1.75}
.hero-btns{display:flex;gap:16px;flex-wrap:wrap}

/* TRUST BAR — Premium dividers */
.trust-bar{background:var(--s);padding:30px 40px;border-bottom:1px solid var(--b)}
.trust-inner{max-width:1120px;margin:0 auto;display:flex;justify-content:center;align-items:center;gap:12px;flex-wrap:wrap}
.trust-item{display:flex;align-items:center;gap:10px;font-size:.85rem;font-weight:600;color:var(--g);padding:0 24px}
.trust-item span{font-size:1.4rem;font-family:'Fraunces',serif;color:var(--p);font-weight:700}
.trust-sep{width:4px;height:4px;border-radius:50%;background:var(--b);flex-shrink:0}

/* STATS */
.stats-row{display:flex;gap:0;border:1px solid var(--b);border-radius:var(--r);overflow:hidden;margin:40px 0;background:rgba(255,255,255,.7);backdrop-filter:blur(8px)}
.stat{flex:1;padding:28px 24px;text-align:center;border-right:1px solid var(--b)}
.stat:last-child{border-right:none}
.stat-num{font-family:'Fraunces',serif;font-size:2rem;font-weight:700;color:var(--p);line-height:1}
.stat-label{font-size:.78rem;color:var(--g);margin-top:8px;letter-spacing:.02em}

/* PROCESS — Connected steps */
.process-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:52px;counter-reset:step;position:relative}
.process-step{text-align:center;position:relative;padding-top:70px}
.process-step::before{counter-increment:step;content:counter(step);display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--p),color-mix(in srgb, var(--p) 75%, #000));color:#fff;font-family:'Fraunces',serif;font-size:1.2rem;font-weight:700;position:absolute;top:0;left:50%;transform:translateX(-50%);box-shadow:0 4px 16px color-mix(in srgb, var(--p) 30%, transparent);z-index:1}
.process-step::after{content:'';position:absolute;top:25px;left:calc(50% + 30px);width:calc(100% - 60px);height:2px;background:linear-gradient(90deg,var(--p),var(--b));z-index:0}
.process-step:last-child::after{display:none}
.process-step h4{font-size:.95rem;margin-bottom:8px;font-weight:600}
.process-step p{font-size:.84rem;color:var(--g);line-height:1.65}

/* REVIEWS — Glassmorphism dark */
.reviews-section{background:var(--t);padding:110px 0;overflow:hidden;position:relative}
.reviews-section::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent)}
.reviews-track-wrap{overflow:hidden;margin:52px -40px 0;padding:0 40px}
.reviews-track{display:flex;gap:20px;animation:scrollLeft 40s linear infinite;width:max-content}
.reviews-track:hover{animation-play-state:paused}
.review-card{background:rgba(255,255,255,.06);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.08);border-radius:var(--r);padding:32px;width:340px;flex-shrink:0;transition:all .3s;cursor:default}
.review-card:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.15);transform:translateY(-2px)}
.review-stars{color:#f59e0b;margin-bottom:18px;letter-spacing:2px;font-size:1rem}
.review-text{font-size:.92rem;color:rgba(255,255,255,.78);line-height:1.75;margin-bottom:24px;font-style:italic}
.review-author{display:flex;align-items:center;gap:12px}
.review-avatar{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--p),color-mix(in srgb, var(--p) 60%, #fff));display:flex;align-items:center;justify-content:center;font-size:.82rem;font-weight:700;color:#fff;flex-shrink:0}
.review-name{font-size:.88rem;font-weight:600;color:#fff}
.review-source{font-size:.72rem;color:rgba(255,255,255,.4);margin-top:2px}

/* FAQ — Refined */
.faq-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:48px}
.faq-item{background:rgba(255,255,255,.85);backdrop-filter:blur(8px);border:1px solid var(--b);border-radius:var(--r);overflow:hidden;transition:border-color .2s}
.faq-item:hover{border-color:color-mix(in srgb, var(--p) 30%, transparent)}
.faq-q{width:100%;background:none;border:none;cursor:pointer;padding:22px 26px;text-align:left;display:flex;justify-content:space-between;align-items:center;gap:16px;font-family:'DM Sans',sans-serif;font-size:.92rem;font-weight:600;color:var(--t);transition:background .2s}
.faq-q:hover{background:color-mix(in srgb, var(--s) 50%, transparent)}
.faq-q:focus-visible{outline:none;box-shadow:inset var(--glow)}
.faq-icon{width:28px;height:28px;border-radius:50%;background:var(--s);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1rem;color:var(--p);transition:all .25s cubic-bezier(.4,0,.2,1)}
.faq-item.open .faq-icon{transform:rotate(45deg);background:var(--p);color:#fff}
.faq-a{max-height:0;overflow:hidden;transition:max-height .35s cubic-bezier(.4,0,.2,1),padding .35s;font-size:.9rem;color:var(--g);line-height:1.75;padding:0 26px}
.faq-item.open .faq-a{max-height:400px;padding:0 26px 22px}

/* GALLERY — Refined */
.gallery-wrap{overflow:hidden}
.gallery-track{display:flex;gap:16px;animation:scrollLeft 30s linear infinite;width:max-content}
.gallery-track:hover{animation-play-state:paused}
.gallery-img{width:300px;height:220px;border-radius:var(--r);overflow:hidden;flex-shrink:0;box-shadow:var(--card-shadow)}
.gallery-img img{height:100%;width:100%;object-fit:cover;transition:transform .5s cubic-bezier(.4,0,.2,1)}
.gallery-img:hover img{transform:scale(1.05)}

/* CTA — Gradient mesh overlay */
#kontakt-cta{position:relative;overflow:hidden;text-align:center}
.cta-bg{position:absolute;inset:0;background-size:cover;background-position:center}
.cta-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,0,0,.72),rgba(0,0,0,.55),rgba(0,0,0,.72))}
.cta-content{position:relative;z-index:1}
.cta-content h2{font-size:clamp(2rem,3.5vw,3rem);color:#fff;max-width:650px;margin:0 auto 18px;font-weight:700}
.cta-content p{color:rgba(255,255,255,.7);margin-bottom:40px;font-size:1.05rem}
.cta-form{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;max-width:620px;margin:0 auto}
.cta-form input,.cta-form textarea{flex:1;min-width:200px;padding:16px 22px;border-radius:12px;border:1px solid rgba(255,255,255,.18);outline:none;background:rgba(255,255,255,.08);color:#fff;font-size:.95rem;font-family:'DM Sans',sans-serif;backdrop-filter:blur(12px);transition:border-color .2s,background .2s}
.cta-form input:focus,.cta-form textarea:focus{border-color:rgba(255,255,255,.4);background:rgba(255,255,255,.14)}
.cta-form input::placeholder,.cta-form textarea::placeholder{color:rgba(255,255,255,.45)}
.cta-form textarea{min-height:100px;resize:vertical;width:100%;flex-basis:100%}

/* ABOUT */
.about-grid{display:grid;grid-template-columns:1fr 420px;gap:80px;align-items:center}
.about-content p{color:var(--g);margin-bottom:22px;line-height:1.75}
.about-photo{border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.15);aspect-ratio:4/5}
.about-photo img{height:100%}
.social-pills{display:flex;gap:12px;margin-top:32px}
.social-pill{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.8);backdrop-filter:blur(8px);border:1px solid var(--b);padding:10px 20px;border-radius:50px;font-size:.85rem;font-weight:500;transition:all .25s;cursor:pointer}
.social-pill:hover{border-color:var(--p);box-shadow:var(--glow);transform:translateY(-1px)}
.social-pill svg{width:16px;height:16px;color:var(--p)}

/* FOOTER */
footer{background:var(--t);padding:80px 40px 40px;color:rgba(255,255,255,.65);position:relative}
footer::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent)}
.footer-inner{max-width:1120px;margin:0 auto}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1.5fr;gap:60px;margin-bottom:50px}
.footer-logo{font-family:'Fraunces',serif;font-size:1.2rem;font-weight:700;color:#fff;margin-bottom:14px}
.footer-desc{font-size:.88rem;line-height:1.75;margin-bottom:24px}
.footer-col h4{font-size:.72rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:18px}
.footer-col ul{list-style:none}.footer-col li{margin-bottom:10px}
.footer-col a{font-size:.9rem;transition:color .2s;cursor:pointer}.footer-col a:hover{color:#fff}
.footer-contact-item{display:flex;align-items:center;gap:10px;margin-bottom:10px;font-size:.88rem}
.footer-contact-item svg{width:16px;height:16px;color:rgba(255,255,255,.4);flex-shrink:0}
.footer-bottom{border-top:1px solid rgba(255,255,255,.06);padding-top:24px;font-size:.78rem;color:rgba(255,255,255,.25);display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}

/* ANIMATIONS */
@keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes scrollLeft{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.fade-up{opacity:0;transform:translateY(20px);transition:opacity .7s cubic-bezier(.4,0,.2,1),transform .7s cubic-bezier(.4,0,.2,1)}
.fade-up.visible{opacity:1;transform:translateY(0)}

/* ACCESSIBILITY: prefers-reduced-motion */
@media(prefers-reduced-motion:reduce){
  .fade-up{opacity:1;transform:none;transition:none}
  .hero-content{animation:none}
  .reviews-track,.gallery-track{animation:none}
  .btn,.btn-ghost,.card,.social-pill,.nav-cta{transition:none}
  html{scroll-behavior:auto}
}

/* RESPONSIVE */
@media(max-width:900px){
  nav{padding:0 20px}.nav-links a:not(.nav-cta){display:none}
  section{padding:80px 20px}
  .grid-2,.about-grid{grid-template-columns:1fr;gap:40px}
  .grid-3,.grid-4,.process-grid,.faq-grid{grid-template-columns:1fr}
  .process-step::after{display:none}
  .hero-content{padding:60px 24px}
  .hero-content h1{font-size:clamp(2rem,7vw,2.8rem)}
  .footer-grid{grid-template-columns:1fr 1fr;gap:36px}
  .cta-form{flex-direction:column}
  .stats-row{flex-direction:column}.stat{border-right:none;border-bottom:1px solid var(--b)}.stat:last-child{border-bottom:none}
  .trust-inner{gap:16px}.trust-item{padding:0 16px}
  .trust-sep{display:none}
  .wrap{padding:0 20px}
}
@media(max-width:500px){
  .footer-grid{grid-template-columns:1fr;gap:32px}
  .hero-btns{flex-direction:column;width:100%}.hero-btns .btn,.hero-btns .btn-ghost{width:100%;justify-content:center}
}
</style>
</head>
<body>

<!-- NAV -->
<nav>
  <div class="nav-logo">${e(c.name)}</div>
  <div class="nav-links">
    <a href="#intro">Startseite</a>
    ${services.length > 0 ? '<a href="#leistungen">Leistungen</a>' : ''}
    ${reviews.length > 0 ? '<a href="#bewertungen">Kundenstimmen</a>' : ''}
    <a href="#ueber-uns">&Uuml;ber uns</a>
    <a href="#kontakt-cta" class="nav-cta">${e(c.cta)}</a>
  </div>
</nav>

<!-- HERO -->
<section id="hero" style="padding:0">
  <div class="hero-bg" style="background-image:url('${e(c.heroImg)}')"></div>
  <div class="hero-content">
    ${c.badge ? `<div class="hero-badge">${e(c.badge)}</div>` : ''}
    <h1>${e(c.tagline)}</h1>
    <p>${e(c.heroSub)}</p>
    <div class="hero-btns">
      <a href="#kontakt-cta" class="btn">${e(c.cta)} &rarr;</a>
      <a href="#so-funktionierts" class="btn-ghost">So funktioniert&apos;s &darr;</a>
    </div>
  </div>
</section>

<!-- TRUST BAR -->
${stats.length > 0 ? `<div class="trust-bar">
  <div class="trust-inner">
    ${stats.map((s, i) => `${i > 0 ? '<div class="trust-sep"></div>' : ''}<div class="trust-item"><span>${e(s.value)}</span> ${e(s.label)}</div>`).join('')}
  </div>
</div>` : ''}

<!-- INTRO / ABOUT QUICK -->
<section id="intro">
  <div class="wrap">
    <div class="grid-2 fade-up">
      <div>
        ${c.region ? `<p class="sec-label">${e(c.region)}</p>` : '<p class="sec-label">&Uuml;ber uns</p>'}
        <h2 class="sec-title">${e(c.name)}</h2>
        <p class="sec-sub">${e(c.desc)}</p>
        ${stats.length > 0 ? `<div class="stats-row">${stats.map((s) => `<div class="stat"><div class="stat-num">${e(s.value)}</div><div class="stat-label">${e(s.label)}</div></div>`).join('')}</div>` : ''}
        ${c.about ? `<p style="color:var(--g);margin-bottom:32px;line-height:1.75">${e(c.about)}</p>` : ''}
        <a href="#kontakt-cta" class="btn">${e(c.cta)} &rarr;</a>
      </div>
      ${c.ownerImg ? `<div style="border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.15);aspect-ratio:3/4;position:relative">
        <img src="${e(c.ownerImg)}" alt="${e(c.owner)}" style="height:100%">
        ${c.owner ? `<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.7));padding:32px 24px 24px;color:#fff;font-size:.9rem;font-weight:500">${e(c.owner)} &mdash; ${e(c.ownerRole)}</div>` : ''}
      </div>` : ''}
    </div>
  </div>
</section>

<!-- SERVICES -->
${services.length > 0 ? `<section id="leistungen" style="background:var(--s)">
  <div class="wrap">
    <div class="fade-up" style="max-width:640px;margin-bottom:52px">
      <p class="sec-label">Was wir f&uuml;r Sie tun</p>
      <h2 class="sec-title">Unsere Leistungen</h2>
    </div>
    <div class="grid-${services.length >= 4 ? '2' : '3'} fade-up" style="${services.length >= 4 ? 'grid-template-columns:repeat(2,1fr)' : ''}">
      ${services.map((s) => `<div class="card">
        <div class="card-icon">${getIcon(s.icon || '')}</div>
        <h3 style="font-size:1.08rem;font-weight:600;margin-bottom:10px">${e(s.title)}</h3>
        <p style="font-size:.9rem;color:var(--g);line-height:1.75">${e(s.description)}</p>
        <a href="#kontakt-cta" style="display:inline-flex;align-items:center;gap:6px;margin-top:20px;font-size:.84rem;font-weight:600;color:var(--p);transition:gap .2s;cursor:pointer">Anfrage stellen &rarr;</a>
      </div>`).join('\n')}
    </div>
  </div>
</section>` : ''}

<!-- PROCESS -->
<section id="so-funktionierts">
  <div class="wrap">
    <div class="fade-up" style="text-align:center;max-width:640px;margin:0 auto 0">
      <p class="sec-label" style="justify-content:center">So l&auml;uft es ab</p>
      <h2 class="sec-title">In 4 einfachen Schritten</h2>
    </div>
    <div class="process-grid fade-up">
      <div class="process-step"><h4>Kontakt aufnehmen</h4><p>Schreiben Sie uns oder rufen Sie an &mdash; wir beraten Sie unverbindlich.</p></div>
      <div class="process-step"><h4>Angebot erhalten</h4><p>Sie erhalten ein transparentes Angebot &mdash; ohne versteckte Kosten.</p></div>
      <div class="process-step"><h4>Umsetzung</h4><p>Wir setzen Ihr Projekt professionell und termingerecht um.</p></div>
      <div class="process-step"><h4>Fertig &amp; Support</h4><p>Sie sind zufrieden, wir bleiben Ihr Ansprechpartner.</p></div>
    </div>
  </div>
</section>

<!-- REVIEWS -->
${reviews.length > 0 ? `<section id="bewertungen" class="reviews-section" style="padding:110px 0">
  <div class="wrap" style="padding:0 40px;margin-bottom:0">
    <p class="sec-label" style="color:rgba(255,255,255,.4)">Was unsere Kunden sagen</p>
    <h2 class="sec-title" style="color:#fff">Kundenstimmen</h2>
  </div>
  <div class="reviews-track-wrap">
    <div class="reviews-track">${reviews.concat(reviews).map((r) => `<div class="review-card">
      <div class="review-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
      <p class="review-text">&bdquo;${e(r.text)}&ldquo;</p>
      <div class="review-author">
        <div class="review-avatar">${e(r.name.charAt(0))}</div>
        <div><div class="review-name">${e(r.name)}</div><div class="review-source">${e(r.source)}</div></div>
      </div>
    </div>`).join('')}</div>
  </div>
</section>` : ''}

<!-- ABOUT -->
<section id="ueber-uns" style="background:var(--s)">
  <div class="wrap">
    <div class="about-grid fade-up">
      <div class="about-content">
        <p class="sec-label">Wer wir sind</p>
        <h2 class="sec-title">&Uuml;ber ${e(c.name)}</h2>
        <p>${e(c.about)}</p>
        ${c.about2 ? `<p>${e(c.about2)}</p>` : ''}
        <div class="social-pills">
          ${c.instagram ? `<a href="${e(c.instagram)}" class="social-pill" aria-label="Instagram">${svgIcons['instagram']} Instagram</a>` : ''}
          ${c.whatsapp ? `<a href="${e(c.whatsapp)}" class="social-pill" aria-label="WhatsApp">${svgIcons['message-circle']} WhatsApp</a>` : ''}
          ${c.googlemaps ? `<a href="${e(c.googlemaps)}" class="social-pill" aria-label="Google Maps">${svgIcons['map-pin']} Google Maps</a>` : ''}
        </div>
      </div>
      ${c.ownerImg ? `<div class="about-photo"><img src="${e(c.ownerImg)}" alt="${e(c.owner)}"></div>` : ''}
    </div>
  </div>
</section>

<!-- CTA -->
<section id="kontakt-cta" style="padding:120px 40px">
  ${c.ctaImg ? `<div class="cta-bg" style="background-image:url('${e(c.ctaImg)}')"></div>` : `<div class="cta-bg" style="background:var(--p)"></div>`}
  <div class="cta-content fade-up">
    <p class="sec-label" style="color:rgba(255,255,255,.5);justify-content:center">Kontakt</p>
    <p class="sec-label" style="display:none">--</p>
    <h2>Bereit f&uuml;r den n&auml;chsten Schritt?</h2>
    <p>Schreiben Sie uns &mdash; wir melden uns innerhalb von 24 Stunden.</p>
    <form class="cta-form" onsubmit="return false">
      <input type="text" name="name" placeholder="Ihr Name" required aria-label="Name">
      <input type="email" name="email" placeholder="Ihre E-Mail" required aria-label="E-Mail">
      <input type="tel" name="phone" placeholder="Telefonnummer (optional)" aria-label="Telefon">
      <textarea name="message" placeholder="Ihre Nachricht..." required aria-label="Nachricht"></textarea>
      <div style="position:absolute;left:-9999px"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>
      <button class="btn" type="button" id="cta-submit" style="white-space:nowrap;width:auto">${e(c.cta)} &rarr;</button>
    </form>
  </div>
</section>

<!-- GALLERY -->
${gallery.length > 0 ? `<section id="galerie" style="padding:80px 0">
  <div class="wrap fade-up" style="padding:0 40px;margin-bottom:40px">
    <p class="sec-label">Unsere Arbeiten</p>
    <h2 class="sec-title">Einblick in unsere Projekte</h2>
  </div>
  <div class="gallery-wrap"><div class="gallery-track">${gallery.concat(gallery).map((url) => `<div class="gallery-img"><img src="${e(url)}" alt="Projekt" loading="lazy"></div>`).join('')}</div></div>
</section>` : ''}

<!-- FAQ -->
${faqItems.length > 0 ? `<section id="faq" style="background:var(--s)">
  <div class="wrap">
    <div class="fade-up">
      <p class="sec-label">H&auml;ufige Fragen</p>
      <h2 class="sec-title">Fragen &amp; Antworten</h2>
    </div>
    <div class="faq-grid fade-up">
      ${faqItems.map((f) => `<div class="faq-item">
        <button class="faq-q" aria-expanded="false">${e(f.question)}<span class="faq-icon">+</span></button>
        <div class="faq-a" role="region">${e(f.answer)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>` : ''}

<!-- FOOTER -->
<footer>
  <div class="footer-inner">
    <div class="footer-grid">
      <div>
        <div class="footer-logo">${e(c.name)}</div>
        <p class="footer-desc">${e(c.desc || c.about)}</p>
      </div>
      <div class="footer-col">
        <h4>Navigation</h4>
        <ul>
          <li><a href="#hero">Startseite</a></li>
          ${services.length > 0 ? '<li><a href="#leistungen">Leistungen</a></li>' : ''}
          <li><a href="#ueber-uns">&Uuml;ber uns</a></li>
          <li><a href="#kontakt-cta">Kontakt</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Rechtliches</h4>
        <ul>
          <li><a href="${e(c.imprint)}">Impressum</a></li>
          <li><a href="${e(c.privacy)}">Datenschutz</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Kontakt</h4>
        ${c.phone ? `<div class="footer-contact-item">${svgIcons['phone']} ${e(c.phone)}</div>` : ''}
        ${c.email ? `<div class="footer-contact-item">${svgIcons['mail']} ${e(c.email)}</div>` : ''}
        ${c.address ? `<div class="footer-contact-item">${svgIcons['map-pin']} ${e(c.address)}</div>` : ''}
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; ${new Date().getFullYear()} ${e(c.name)}. Alle Rechte vorbehalten.</span>
    </div>
  </div>
</footer>

<script>
  // Fade-up animations
  const obs=new IntersectionObserver(e=>{e.forEach(x=>{if(x.isIntersecting)x.target.classList.add('visible')})},{threshold:.1});
  document.querySelectorAll('.fade-up').forEach(el=>obs.observe(el));

  // FAQ accordion with accessibility
  document.querySelectorAll('.faq-q').forEach(b=>{b.addEventListener('click',()=>{const i=b.closest('.faq-item'),o=i.classList.contains('open');document.querySelectorAll('.faq-item').forEach(x=>{x.classList.remove('open');x.querySelector('.faq-q').setAttribute('aria-expanded','false')});if(!o){i.classList.add('open');b.setAttribute('aria-expanded','true')}})});

  // Contact form${siteId ? `
  const ctaBtn=document.getElementById('cta-submit');
  if(ctaBtn){ctaBtn.addEventListener('click',async function(){
    const form=this.closest('.cta-form');if(!form)return;
    const data={};form.querySelectorAll('input,textarea').forEach(i=>{if(i.name&&i.value)data[i.name]=i.value});
    if(!data.name||!data.email){alert('Name und E-Mail sind Pflichtfelder.');return}
    this.textContent='Wird gesendet...';this.disabled=true;
    try{
      const r=await fetch('${appUrl}/api/public/forms/${siteId}/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const d=await r.json();
      if(d.success){form.innerHTML='<div style="text-align:center;padding:40px"><h3 style="color:#fff;font-size:1.6rem;margin-bottom:12px">Vielen Dank!</h3><p style="color:rgba(255,255,255,.7);font-size:1.05rem">Wir melden uns schnellstm\\u00f6glich bei Ihnen.</p></div>'}
      else{alert(d.error||'Fehler');this.textContent='${e(c.cta)} \\u2192';this.disabled=false}
    }catch(e){alert('Verbindungsfehler');this.textContent='${e(c.cta)} \\u2192';this.disabled=false}
  })}` : ''}
</script>
<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:rgba(26,34,24,.97);backdrop-filter:blur(12px);color:#fff;padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:rgba(255,255,255,.8)">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen findest du in unserer <a href="#" style="color:#fff;text-decoration:underline">Datenschutzerklärung</a>.</p>
    <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:#fff;color:#1a2218;border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
  </div>
</div>
<script>if(!localStorage.getItem('cookies_accepted')){document.getElementById('cookie-banner').style.display='block'}</script>
</body>
</html>`
}
