import { GlobalSiteConfig, PageEntry } from '@/types'

function e(str: string | undefined | null): string {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getPageUrl(slug: string): string {
  return slug ? `/${slug}` : '/'
}

// --- Shared Components ---

function renderSchemaOrg(site: GlobalSiteConfig): string {
  const schema = (site as unknown as Record<string, unknown>).schemaOrg as Record<string, unknown> | undefined
  if (!schema) return ''
  const ld = { '@context': 'https://schema.org', ...schema }
  return `<script type="application/ld+json">${JSON.stringify(ld)}</script>`
}

function renderHead(site: GlobalSiteConfig, page: PageEntry): string {
  const pageTitle = `${e(page.title)} | ${e(site.name)}`
  const desc = page.metaDescription || ''
  const ogImage = (page.config as Record<string, unknown>).ogImage as string | undefined

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${pageTitle}</title>
${desc ? `<meta name="description" content="${e(desc)}">` : ''}
<meta property="og:title" content="${pageTitle}">
${desc ? `<meta property="og:description" content="${e(desc)}">` : ''}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${e(site.name)}">
${ogImage ? `<meta property="og:image" content="${e(ogImage)}">` : ''}
<meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}">
<meta name="twitter:title" content="${pageTitle}">
${desc ? `<meta name="twitter:description" content="${e(desc)}">` : ''}
${ogImage ? `<meta name="twitter:image" content="${e(ogImage)}">` : ''}
${renderSchemaOrg(site)}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
:root{--primary:${e(site.colors.primary)};--secondary:${e(site.colors.secondary)};--bg:${e(site.colors.background)};--text:${e(site.colors.text)};--gray:#6b7b68;--border:#dde6da;--radius:12px;--shadow:0 4px 24px rgba(30,50,25,.10);--shadow-lg:0 12px 48px rgba(30,50,25,.15)}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);line-height:1.65;font-size:16px}
h1,h2,h3{font-family:'Fraunces',serif;line-height:1.2}
a{color:inherit;text-decoration:none}
img{display:block;width:100%;object-fit:cover}
.container{max-width:1100px;margin:0 auto;padding:0 40px}
section{padding:90px 40px}
.section-label{font-size:.78rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--primary);margin-bottom:14px}
.section-title{font-size:clamp(1.7rem,3vw,2.5rem);font-weight:600;letter-spacing:-.02em;margin-bottom:18px}
.section-sub{color:var(--gray);max-width:560px;font-size:1rem}
.btn-primary{background:var(--primary);color:#fff;padding:14px 28px;border-radius:50px;font-weight:600;font-size:.92rem;border:none;cursor:pointer;transition:background .2s,transform .15s;display:inline-flex;align-items:center;gap:8px;font-family:'DM Sans',sans-serif;box-shadow:0 4px 20px rgba(45,90,39,.3)}
.btn-primary:hover{filter:brightness(1.1);transform:translateY(-2px)}
nav{position:sticky;top:0;z-index:100;background:rgba(250,248,244,.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);height:68px;display:flex;align-items:center;justify-content:space-between;padding:0 40px}
.nav-logo{font-family:'Fraunces',serif;font-size:1.1rem;font-weight:700;color:var(--primary)}
.nav-links{display:flex;align-items:center;gap:28px}
.nav-links a{font-size:.88rem;font-weight:500;color:var(--gray);transition:color .2s}
.nav-links a:hover,.nav-links a.active{color:var(--primary)}
.nav-cta{background:var(--primary);color:#fff !important;padding:8px 18px;border-radius:50px;font-size:.84rem !important;font-weight:600 !important}
footer{background:var(--text);padding:60px 40px 30px;color:rgba(255,255,255,.7)}
.footer-inner{max-width:1100px;margin:0 auto}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:60px;margin-bottom:40px}
.footer-logo{font-family:'Fraunces',serif;font-size:1.15rem;font-weight:700;color:#fff;margin-bottom:12px}
.footer-col h4{font-size:.78rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:16px}
.footer-col ul{list-style:none}.footer-col li{margin-bottom:8px}
.footer-col a{font-size:.87rem;transition:color .2s}.footer-col a:hover{color:#fff}
.footer-bottom{border-top:1px solid rgba(255,255,255,.08);padding-top:20px;font-size:.78rem;color:rgba(255,255,255,.35);display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
.footer-bottom a{color:rgba(255,255,255,.5)}.footer-bottom a:hover{color:rgba(255,255,255,.7)}
.legal-content{max-width:800px;margin:0 auto;padding:60px 40px}
.legal-content h1{font-size:2rem;margin-bottom:24px}
.legal-content h2{font-size:1.3rem;margin-top:32px;margin-bottom:12px}
.legal-content p{color:var(--gray);margin-bottom:16px;line-height:1.7}
@media(max-width:900px){nav{padding:0 20px}.nav-links a:not(.nav-cta){display:none}section{padding:60px 20px}.footer-grid{grid-template-columns:1fr}}
</style>
</head>
<body>`
}

function renderNav(site: GlobalSiteConfig, pages: Record<string, PageEntry>, currentPageKey: string): string {
  const navItems = site.navigation
    .filter((key) => pages[key])
    .map((key) => {
      const page = pages[key]
      const isActive = key === currentPageKey
      const url = getPageUrl(page.slug)
      const isLast = key === site.navigation[site.navigation.length - 1]
      if (isLast) {
        return `<a href="${e(url)}" class="nav-cta${isActive ? ' active' : ''}">${e(page.title)}</a>`
      }
      return `<a href="${e(url)}"${isActive ? ' class="active"' : ''}>${e(page.title)}</a>`
    })
    .join('\n      ')

  return `<nav>
  <a href="/" class="nav-logo">${e(site.branding.logoText || site.name)}</a>
  <div class="nav-links">
    ${navItems}
  </div>
</nav>`
}

function renderCookieBanner(): string {
  return `<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:rgba(26,34,24,.97);backdrop-filter:blur(12px);color:#fff;padding:16px 24px;font-size:.85rem;line-height:1.6">
  <div style="max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <p style="flex:1;min-width:200px;margin:0;color:rgba(255,255,255,.8)">Diese Website verwendet technisch notwendige Cookies. Weitere Informationen findest du in unserer <a href="/datenschutz" style="color:#fff;text-decoration:underline">Datenschutzerklärung</a>.</p>
    <div style="display:flex;gap:8px;flex-shrink:0">
      <button onclick="document.getElementById('cookie-banner').style.display='none';localStorage.setItem('cookies_accepted','1')" style="background:#fff;color:#1a2218;border:none;padding:8px 20px;border-radius:50px;font-weight:600;font-size:.82rem;cursor:pointer;font-family:inherit">Verstanden</button>
    </div>
  </div>
</div>
<script>if(!localStorage.getItem('cookies_accepted')){document.getElementById('cookie-banner').style.display='block'}</script>`
}

function renderTrackingScript(siteId?: string): string {
  if (!siteId) return ''
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'
  return `<script>
(function(){
  var sid="${siteId}",u="${appUrl}/api/public/track/"+sid;
  var d={page:location.pathname,referrer:document.referrer,screen:screen.width+"x"+screen.height};
  try{navigator.sendBeacon(u,JSON.stringify(d))}catch(e){var x=new XMLHttpRequest();x.open("POST",u);x.setRequestHeader("Content-Type","application/json");x.send(JSON.stringify(d))}
})();
</script>`
}

function renderFooter(site: GlobalSiteConfig, pages: Record<string, PageEntry>, siteId?: string): string {
  const navLinks = site.navigation
    .filter((key) => pages[key])
    .map((key) => `<li><a href="${e(getPageUrl(pages[key].slug))}">${e(pages[key].title)}</a></li>`)
    .join('\n        ')

  const legalLinks = (site.footer.legalLinks || [])
    .filter((l) => pages[l.pageKey])
    .map((l) => `<li><a href="${e(getPageUrl(pages[l.pageKey].slug))}">${e(l.label)}</a></li>`)
    .join('\n        ')

  return `<footer>
  <div class="footer-inner">
    <div class="footer-grid">
      <div>
        <div class="footer-logo">${e(site.branding.logoText || site.name)}</div>
        <p style="font-size:.85rem;line-height:1.7;margin-bottom:20px">${e(site.footer.text)}</p>
      </div>
      <div class="footer-col">
        <h4>Navigation</h4>
        <ul>${navLinks}</ul>
      </div>
      <div class="footer-col">
        <h4>Rechtliches</h4>
        <ul>${legalLinks}</ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; ${new Date().getFullYear()} ${e(site.name)}. Alle Rechte vorbehalten.</span>
    </div>
  </div>
</footer>
${renderCookieBanner()}
${renderTrackingScript(siteId)}
</body>
</html>`
}

// --- Page Templates ---

function renderHomePage(site: GlobalSiteConfig, page: PageEntry): string {
  const cfg = page.config as Record<string, unknown>
  const hero = cfg.hero as Record<string, string> | undefined
  const highlights = (cfg.highlights || []) as { icon: string; value: string; label: string }[]

  return `
<section style="position:relative;min-height:90vh;display:flex;align-items:center;overflow:hidden;padding:0">
  <div style="position:absolute;inset:0;background:url('${e(hero?.imageUrl)}') center/cover no-repeat"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(105deg,rgba(20,40,18,.78) 0%,rgba(20,40,18,.35) 60%,transparent 100%)"></div>
  <div style="position:relative;z-index:1;max-width:680px;padding:80px 40px 80px 80px">
    ${hero?.badge ? `<div style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);color:#fff;font-size:.8rem;font-weight:500;padding:6px 14px;border-radius:50px;margin-bottom:24px">${e(hero.badge)}</div>` : ''}
    <h1 style="font-size:clamp(2rem,4.5vw,3.4rem);color:#fff;font-weight:600;margin-bottom:20px">${e(hero?.headline)}</h1>
    <p style="color:rgba(255,255,255,.82);font-size:1.05rem;max-width:520px;margin-bottom:36px">${e(hero?.subtitle)}</p>
    <a href="${e(hero?.ctaLink ? '/' + hero.ctaLink : '#')}" class="btn-primary">${e(hero?.ctaText || 'Jetzt Anfrage senden')} →</a>
  </div>
</section>

${highlights.length > 0 ? `<section style="padding:60px 40px;background:var(--bg)">
  <div class="container">
    <div style="display:flex;gap:0;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">
      ${highlights.map((h) => `<div style="flex:1;padding:22px 20px;text-align:center;border-right:1px solid var(--border)">
        <div style="font-family:'Fraunces',serif;font-size:1.8rem;font-weight:700;color:var(--primary);line-height:1">${e(h.value)}</div>
        <div style="font-size:.78rem;color:var(--gray);margin-top:4px">${e(h.label)}</div>
      </div>`).join('\n')}
    </div>
  </div>
</section>` : ''}`
}

function renderAboutPage(site: GlobalSiteConfig, page: PageEntry): string {
  const cfg = page.config as Record<string, unknown>
  const team = (cfg.team || []) as { name: string; role: string }[]
  void site

  return `<section>
  <div class="container">
    <p class="section-label">Über uns</p>
    <h1 class="section-title">${e(cfg.title as string)}</h1>
    <div style="max-width:800px">
      <p class="section-sub" style="margin-bottom:24px">${e(cfg.story as string)}</p>
      ${cfg.story2 ? `<p class="section-sub">${e(cfg.story2 as string)}</p>` : ''}
    </div>
    ${cfg.imageUrl ? `<div style="margin-top:48px;border-radius:18px;overflow:hidden;max-height:400px"><img src="${e(cfg.imageUrl as string)}" alt="${e(cfg.title as string)}" style="width:100%;height:100%;object-fit:cover"></div>` : ''}
    ${team.length > 0 ? `<div style="margin-top:60px">
      <h2 class="section-title" style="font-size:1.5rem">Unser Team</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:20px;margin-top:24px">
        ${team.map((t) => `<div style="background:#fff;border:1px solid var(--border);border-radius:var(--radius);padding:24px">
          <div style="font-weight:600">${e(t.name)}</div>
          <div style="font-size:.85rem;color:var(--gray)">${e(t.role)}</div>
        </div>`).join('\n')}
      </div>
    </div>` : ''}
  </div>
</section>`
}

function renderServicesPage(site: GlobalSiteConfig, page: PageEntry): string {
  const cfg = page.config as Record<string, unknown>
  const items = (cfg.items || []) as { icon: string; title: string; description: string }[]
  void site

  return `<section style="background:var(--secondary)">
  <div class="container">
    <p class="section-label">Was wir für Sie tun</p>
    <h1 class="section-title">${e(cfg.title as string)}</h1>
    <p class="section-sub" style="margin-bottom:48px">${e(cfg.intro as string)}</p>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:20px">
      ${items.map((s) => `<div style="background:#fff;border-radius:var(--radius);padding:32px;border:1px solid var(--border);transition:transform .2s,box-shadow .2s;position:relative;overflow:hidden">
        <div style="width:48px;height:48px;border-radius:12px;background:var(--secondary);display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin-bottom:18px">${s.icon || '⚙️'}</div>
        <h3 style="font-size:1.1rem;font-weight:600;margin-bottom:10px">${e(s.title)}</h3>
        <p style="font-size:.88rem;color:var(--gray);line-height:1.6">${e(s.description)}</p>
      </div>`).join('\n')}
    </div>
  </div>
</section>`
}

function renderContactPage(site: GlobalSiteConfig, page: PageEntry, siteId?: string): string {
  const cfg = page.config as Record<string, unknown>
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'
  void site

  return `<section>
  <div class="container">
    <p class="section-label">Kontakt</p>
    <h1 class="section-title">${e(cfg.title as string || 'Kontakt')}</h1>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:40px">
      <div>
        <h3 style="font-size:1.1rem;font-weight:600;margin-bottom:20px">Kontaktdaten</h3>
        ${cfg.address ? `<p style="color:var(--gray);margin-bottom:12px">📍 ${e(cfg.address as string)}</p>` : ''}
        ${cfg.phone ? `<p style="color:var(--gray);margin-bottom:12px">📞 <a href="tel:${e(cfg.phone as string)}" style="color:var(--gray)">${e(cfg.phone as string)}</a></p>` : ''}
        ${cfg.email ? `<p style="color:var(--gray);margin-bottom:12px">✉️ <a href="mailto:${e(cfg.email as string)}" style="color:var(--gray)">${e(cfg.email as string)}</a></p>` : ''}
        ${cfg.hours ? `<div style="margin-top:24px"><h3 style="font-size:1.1rem;font-weight:600;margin-bottom:12px">Öffnungszeiten</h3><p style="color:var(--gray);white-space:pre-line">${e(cfg.hours as string)}</p></div>` : ''}
      </div>
      <div style="background:var(--secondary);border-radius:var(--radius);padding:32px">
        <h3 style="font-size:1.1rem;font-weight:600;margin-bottom:20px">Nachricht senden</h3>
        <form id="contact-form" style="display:flex;flex-direction:column;gap:12px" onsubmit="return false">
          <input type="text" name="name" placeholder="Ihr Name" required style="padding:12px 16px;border:1px solid var(--border);border-radius:8px;font-family:inherit;font-size:.9rem;outline:none">
          <input type="email" name="email" placeholder="Ihre E-Mail" required style="padding:12px 16px;border:1px solid var(--border);border-radius:8px;font-family:inherit;font-size:.9rem;outline:none">
          <input type="tel" name="phone" placeholder="Telefon (optional)" style="padding:12px 16px;border:1px solid var(--border);border-radius:8px;font-family:inherit;font-size:.9rem;outline:none">
          <textarea name="message" placeholder="Ihre Nachricht" rows="4" required style="padding:12px 16px;border:1px solid var(--border);border-radius:8px;font-family:inherit;font-size:.9rem;outline:none;resize:vertical"></textarea>
          <div style="position:absolute;left:-9999px"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>
          <button class="btn-primary" type="button" id="contact-submit" style="align-self:flex-start">Nachricht senden →</button>
        </form>
        <div id="contact-success" style="display:none;padding:20px;text-align:center">
          <p style="color:var(--primary);font-weight:600;font-size:1.1rem;margin-bottom:6px">Vielen Dank!</p>
          <p style="color:var(--gray);font-size:.9rem">Wir melden uns schnellstmöglich bei Ihnen.</p>
        </div>
      </div>
    </div>
  </div>
</section>${siteId ? `
<script>
document.getElementById('contact-submit').addEventListener('click',async function(){
  var f=document.getElementById('contact-form');
  var n=f.querySelector('[name=name]'),em=f.querySelector('[name=email]'),msg=f.querySelector('[name=message]'),ph=f.querySelector('[name=phone]'),hp=f.querySelector('[name=website]');
  if(!n.value||!em.value||!msg.value){alert('Bitte alle Pflichtfelder ausfüllen.');return;}
  this.disabled=true;this.textContent='Wird gesendet...';
  try{
    var r=await fetch('${appUrl}/api/public/forms/${siteId}/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:n.value,email:em.value,phone:ph.value,message:msg.value,website:hp.value})});
    var d=await r.json();
    f.style.display='none';document.getElementById('contact-success').style.display='block';
  }catch(e){alert('Fehler beim Senden. Bitte versuchen Sie es erneut.');this.disabled=false;this.textContent='Nachricht senden →';}
});
</script>` : ''}`
}

function renderImprintPage(_site: GlobalSiteConfig, page: PageEntry): string {
  const cfg = page.config as Record<string, string>
  return `<div class="legal-content">
  <h1>Impressum</h1>
  <h2>Angaben gemäß § 5 TMG</h2>
  <p>${e(cfg.companyName)}${cfg.legalForm ? ` ${e(cfg.legalForm)}` : ''}<br>
  ${e(cfg.address)}</p>
  ${cfg.ceo ? `<h2>Vertreten durch</h2><p>${e(cfg.ceo)}</p>` : ''}
  <h2>Kontakt</h2>
  <p>${cfg.phone ? `Telefon: ${e(cfg.phone)}<br>` : ''}
  ${cfg.email ? `E-Mail: ${e(cfg.email)}` : ''}</p>
  ${cfg.vatId ? `<h2>Umsatzsteuer-ID</h2><p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br>${e(cfg.vatId)}</p>` : ''}
  ${cfg.registerCourt ? `<h2>Handelsregister</h2><p>Registergericht: ${e(cfg.registerCourt)}<br>Registernummer: ${e(cfg.registerNumber)}</p>` : ''}
  <h2>Streitschlichtung</h2>
  <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
  <h2>Haftung für Inhalte</h2>
  <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
</div>`
}

function renderPrivacyPage(_site: GlobalSiteConfig, page: PageEntry): string {
  const cfg = page.config as Record<string, string>
  return `<div class="legal-content">
  <h1>Datenschutzerklärung</h1>
  <h2>1. Datenschutz auf einen Blick</h2>
  <h3 style="font-size:1.1rem;margin-top:20px;margin-bottom:8px">Allgemeine Hinweise</h3>
  <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.</p>
  <h2>2. Verantwortliche Stelle</h2>
  <p>${e(cfg.companyName)}<br>${e(cfg.address)}<br>${cfg.email ? `E-Mail: ${e(cfg.email)}` : ''}</p>
  <h2>3. Datenerfassung auf dieser Website</h2>
  <h3 style="font-size:1.1rem;margin-top:20px;margin-bottom:8px">Cookies</h3>
  <p>Diese Website verwendet keine Cookies zu Tracking-Zwecken. Technisch notwendige Cookies können eingesetzt werden.</p>
  <h3 style="font-size:1.1rem;margin-top:20px;margin-bottom:8px">Server-Log-Dateien</h3>
  <p>Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind: Browsertyp und Browserversion, verwendetes Betriebssystem, Referrer URL, Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage, IP-Adresse. Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.</p>
  <h2>4. Hosting</h2>
  <p>Diese Website wird bei Vercel gehostet. Details entnehmen Sie der Datenschutzerklärung von Vercel Inc.</p>
  <h2>5. Ihre Rechte</h2>
  <p>Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung jederzeit für die Zukunft widerrufen.</p>
</div>`
}

// --- Main Render Functions ---

function renderPageContent(site: GlobalSiteConfig, pageKey: string, page: PageEntry, siteId?: string): string {
  switch (page.template) {
    case 'home': return renderHomePage(site, page)
    case 'about': return renderAboutPage(site, page)
    case 'services': return renderServicesPage(site, page)
    case 'contact': return renderContactPage(site, page, siteId)
    case 'legal-imprint': return renderImprintPage(site, page)
    case 'legal-privacy': return renderPrivacyPage(site, page)
    default: return `<section><div class="container"><h1 class="section-title">${e(page.title)}</h1></div></section>`
  }
  void pageKey
}

export function renderSinglePage(
  site: GlobalSiteConfig,
  pages: Record<string, PageEntry>,
  pageKey: string,
  siteId?: string
): string {
  const page = pages[pageKey]
  if (!page) return '<h1>Seite nicht gefunden</h1>'

  return [
    renderHead(site, page),
    renderNav(site, pages, pageKey),
    renderPageContent(site, pageKey, page, siteId),
    renderFooter(site, pages, siteId),
  ].join('\n')
}

export function renderMultiPageSite(
  config: { site: GlobalSiteConfig; pages: Record<string, PageEntry> },
  siteId?: string
): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = []

  for (const [pageKey, page] of Object.entries(config.pages)) {
    const html = renderSinglePage(config.site, config.pages, pageKey, siteId)
    const path = page.slug ? `${page.slug}/index.html` : 'index.html'
    files.push({ path, content: html })
  }

  return files
}
