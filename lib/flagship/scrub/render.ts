/**
 * Premium-Komposition „scrub-story-v1" — Renderer.
 *
 * Eigenständige HTML-Shell wie galabau/maler (self-contained, Inline-CSS/JS,
 * keine Fremd-CDNs). Aufbau Landing:
 * Header → Scrub-Story (Sticky-Canvas ODER statische Poster-Szenen) →
 * Kontakt → Footer (+ Demo-Ribbon).
 *
 * Modus mechanisch aus der Config (kein Stufen-Feld):
 *   inhalte.frames vorhanden → Scrub-Modus (Canvas + Frame-Sequenz)
 *   inhalte.frames fehlt     → statischer Poster-Modus
 * prefers-reduced-motion und no-JS zeigen immer die Poster-Ansicht.
 */

// Registrierungs-Gate: invalide Slot-Deklarationen lassen den Renderer nicht laden
import './asset-slots'
import type { FlagshipRenderOptionen } from '../types'
import { esc, escAttr } from '../html'
import { scrubLightCss } from './css'
// scrubJs nicht mehr benötigt — Homepage ist jetzt statisches Light-Layout
import { scrubAlleNavLinks, type ScrubConfig } from './types'
import {
  renderScrubHeader, renderScrubRibbon,
} from './sections'
import { renderScrubKarriere, renderScrubErfahrungen, renderScrubLeistungen, renderScrubKontaktSeite, renderScrubZiele, renderScrubAngebote, renderScrubZielgruppe, renderScrubLeistungDetail } from './unterseiten'
// Flagship-Sektionen nicht mehr benötigt — Homepage nutzt eigenes GaLaBau-Template

function jsonLd(config: ScrubConfig): string {
  const m = config.meta
  const daten: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: m.firma,
    description: m.seo_beschreibung || '',
    address: { '@type': 'PostalAddress', addressLocality: m.ort, addressCountry: 'DE' },
  }
  if (m.telefon) daten.telephone = m.telefon
  if (m.gegruendet) daten.foundingDate = m.gegruendet
  // '<' escapen, damit '</script>' in Inhalten nicht aus dem JSON-LD-Block ausbricht
  return JSON.stringify(daten).replace(/</g, '\\u003c')
}

export function renderScrubStory(config: ScrubConfig, opts: FlagshipRenderOptionen = {}): string {
  const { meta, inhalte } = config
  const titel = meta.seo_titel || `${meta.firma} – ${meta.ort}`
  const beschreibung = meta.seo_beschreibung || ''
  const noindex = opts.noindex !== false ? '<meta name="robots" content="noindex">' : ''

  const navLinks = scrubAlleNavLinks(config, opts.basisPfad || '')

  // ── Farb-Token (GaLaBau-Stil, Blau) ─────────────────────────────────────
  const accent      = '#0A5C99'
  const accentSoft  = '#E8F2FC'
  const accentDark  = '#084A7A'
  const bg          = '#F5F6F8'
  const textMain    = '#17181A'
  const muted       = '#5F646D'

  // ── Inline-CSS-Additions (responsive + animations) ───────────────────────
  const extraCss = `
/* ── GaLaBau-Template Overrides ── */
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:'Segoe UI',system-ui,sans-serif;background:${bg};color:${textMain};overflow-x:hidden}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}

/* Header */
#site-header{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 40px;height:72px;display:flex;align-items:center;justify-content:space-between;transition:background .3s,box-shadow .3s;background:transparent}
#site-header.scrolled{background:#fff;box-shadow:0 1px 12px rgba(0,0,0,.08)}
#site-header.scrolled .hdr-nav a{color:${textMain}}
#site-header.scrolled .hdr-logo{color:${textMain}}
.hdr-logo{font-size:20px;font-weight:800;letter-spacing:-.03em;color:#fff;transition:color .3s}
.hdr-nav{display:flex;gap:28px;align-items:center}
.hdr-nav a{font-size:14px;font-weight:500;color:rgba(255,255,255,.85);transition:color .2s}
.hdr-nav a:hover{color:${accent}}
.hdr-cta{padding:10px 20px;border-radius:8px;background:${accent};color:#fff !important;font-size:14px;font-weight:600;transition:background .2s,transform .15s}
.hdr-cta:hover{background:${accentDark};transform:translateY(-1px)}
@media(max-width:900px){.hdr-nav[data-navlinks]{display:none}#site-header{padding:0 20px}}

/* Hero */
.lp-hero{position:relative;min-height:100dvh;display:flex;align-items:center;overflow:hidden;background:linear-gradient(135deg,#0d1a28 0%,#1a3a5c 50%,#2a5f8f 100%)}
.lp-hero-overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,18,30,.82) 0%,rgba(10,18,30,.35) 60%,rgba(10,18,30,.05) 100%);pointer-events:none}
.lp-hero-content{position:relative;z-index:2;max-width:640px;padding:120px 40px 80px}
.lp-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:999px;background:rgba(255,255,255,.12);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.2);font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.9);margin-bottom:24px}
.lp-eyebrow-dot{width:6px;height:6px;border-radius:50%;background:${accent};display:inline-block}
.lp-hero h1{font-size:clamp(36px,5.5vw,72px);font-weight:900;line-height:1.08;letter-spacing:-.03em;color:#fff;margin:0 0 20px}
.lp-hero h1 .word{display:inline-block;opacity:0;transform:translateY(24px);animation:fadeUp .55s forwards}
.lp-hero p{font-size:clamp(16px,1.8vw,20px);line-height:1.6;color:rgba(255,255,255,.75);margin:0 0 36px;max-width:520px}
.lp-hero-actions{display:flex;gap:14px;flex-wrap:wrap}
.lp-btn-primary{padding:14px 28px;border-radius:10px;background:linear-gradient(135deg,${accent},${accentDark});color:#fff;font-weight:700;font-size:15px;transition:transform .15s,box-shadow .15s}
.lp-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(10,92,153,.4)}
.lp-btn-secondary{padding:14px 28px;border-radius:10px;background:rgba(255,255,255,.12);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.25);color:#fff;font-weight:600;font-size:15px;transition:background .2s}
.lp-btn-secondary:hover{background:rgba(255,255,255,.22)}
.lp-review-card{position:absolute;bottom:60px;right:60px;background:rgba(255,255,255,.95);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-radius:16px;padding:20px 24px;max-width:300px;box-shadow:0 8px 32px rgba(0,0,0,.18)}
.lp-review-stars{color:#f59e0b;font-size:14px;margin-bottom:8px}
.lp-review-text{font-size:13px;line-height:1.5;color:${textMain};margin:0 0 10px;font-style:italic}
.lp-review-author{font-size:12px;font-weight:600;color:${muted}}
@media(max-width:900px){.lp-hero-content{padding:100px 20px 60px}.lp-review-card{display:none}}

/* Über uns */
.lp-ueber{padding:100px 40px;background:#fff}
.lp-ueber-grid{max-width:1160px;margin:0 auto;display:grid;grid-template-columns:1.1fr .9fr;gap:64px;align-items:center}
.lp-quote-icon{width:48px;height:48px;border-radius:12px;background:${accentSoft};display:flex;align-items:center;justify-content:center;margin-bottom:20px}
.lp-quote-icon svg{width:24px;height:24px;fill:${accent}}
.lp-blockquote{font-size:clamp(18px,2.2vw,26px);font-weight:700;line-height:1.35;color:${textMain};margin:0 0 16px;border-left:4px solid ${accent};padding-left:20px}
.lp-quote-author{font-size:14px;font-weight:600;color:${muted}}
.lp-img-placeholder{border-radius:16px;overflow:hidden;aspect-ratio:4/3;background:linear-gradient(135deg,${accentSoft} 0%,#c5ddf5 100%);display:flex;align-items:center;justify-content:center;color:${accent};font-weight:600;font-size:15px}
@media(max-width:900px){.lp-ueber-grid[data-split]{grid-template-columns:1fr}.lp-ueber{padding:60px 20px}}

/* Leistungen */
.lp-leistungen{padding:100px 40px;background:${bg}}
.lp-section-header{text-align:center;max-width:680px;margin:0 auto 64px}
.lp-section-pill{display:inline-block;padding:5px 14px;border-radius:999px;background:${accentSoft};color:${accent};font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:16px}
.lp-section-h2{font-size:clamp(28px,3.5vw,48px);font-weight:900;letter-spacing:-.02em;line-height:1.1;color:${textMain};margin:0 0 16px}
.lp-section-lead{font-size:17px;line-height:1.6;color:${muted};margin:0}
.lp-service-card{background:#fff;border-radius:20px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;min-height:280px;margin-bottom:24px;box-shadow:0 2px 16px rgba(0,0,0,.06);position:relative;transition:transform .2s,box-shadow .2s}
.lp-service-card:hover{transform:translateY(-3px);box-shadow:0 8px 32px rgba(0,0,0,.1)}
.lp-service-card-body{padding:48px 40px;display:flex;flex-direction:column;justify-content:center;position:relative;z-index:1}
.lp-service-nr{position:absolute;top:20px;right:20px;font-size:72px;font-weight:900;color:rgba(10,92,153,.06);line-height:1;pointer-events:none}
.lp-service-card h3{font-size:clamp(20px,2vw,28px);font-weight:800;color:${textMain};margin:0 0 12px}
.lp-service-card p{font-size:15px;line-height:1.6;color:${muted};margin:0}
.lp-service-img{background:linear-gradient(135deg,${accentSoft},#c5ddf5);display:flex;align-items:center;justify-content:center;color:${accent};font-weight:600;font-size:14px;transform:rotate(1.5deg) scale(1.04);transform-origin:left center}
.lp-service-card:nth-child(even) .lp-service-img{transform:rotate(-1.5deg) scale(1.04);transform-origin:right center}
@media(max-width:900px){.lp-service-card{grid-template-columns:1fr}.lp-service-img{min-height:200px}.lp-leistungen{padding:60px 20px}}

/* Warum */
.lp-warum{padding:100px 40px;background:#fff}
.lp-warum-grid{max-width:1160px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px}
.lp-warum-card{border-radius:20px;overflow:hidden;aspect-ratio:4/5;position:relative;background:linear-gradient(135deg,#1a3a5c,#2a5f8f);display:flex;align-items:flex-end}
.lp-warum-card-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(10,18,30,.85) 0%,rgba(10,18,30,.1) 60%)}
.lp-warum-card-inner{position:relative;z-index:1;padding:28px 24px}
.lp-warum-card-inner h3{font-size:18px;font-weight:800;color:#fff;margin:0 0 8px}
.lp-warum-card-inner p{font-size:14px;line-height:1.5;color:rgba(255,255,255,.75);margin:0}
@media(max-width:900px){.lp-warum-grid[data-cols3]{grid-template-columns:1fr}.lp-warum-card{aspect-ratio:16/7}.lp-warum{padding:60px 20px}}

/* Referenzen */
.lp-referenzen{padding:100px 40px;background:${bg}}
.lp-kpi-row{max-width:1160px;margin:0 auto 64px;display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
.lp-kpi-card{background:#fff;border-radius:16px;padding:32px 24px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.05)}
.lp-kpi-val{font-size:clamp(32px,4vw,52px);font-weight:900;color:${accent};letter-spacing:-.02em;line-height:1}
.lp-kpi-label{font-size:14px;color:${muted};margin-top:8px;font-weight:500}
.lp-testimonial-grid{max-width:1160px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px}
.lp-testimonial-card{background:#fff;border-radius:16px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,.05)}
.lp-testimonial-stars{color:#f59e0b;font-size:15px;margin-bottom:12px}
.lp-testimonial-text{font-size:15px;line-height:1.6;color:${textMain};margin:0 0 16px;font-style:italic}
.lp-testimonial-author{display:flex;align-items:center;gap:12px}
.lp-testimonial-avatar{width:40px;height:40px;border-radius:50%;background:${accentSoft};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:${accent};flex-shrink:0}
.lp-testimonial-meta strong{display:block;font-size:14px;font-weight:700;color:${textMain}}
.lp-testimonial-meta span{font-size:12px;color:${muted}}
@media(max-width:900px){.lp-kpi-row{grid-template-columns:1fr 1fr}.lp-testimonial-grid[data-cols3]{grid-template-columns:1fr}.lp-referenzen{padding:60px 20px}}

/* Social Proof */
.lp-socialproof{padding:80px 40px;background:${accent}}
.lp-socialproof-card{max-width:760px;margin:0 auto;text-align:center}
.lp-socialproof-card .lp-section-pill{background:rgba(255,255,255,.2);color:#fff}
.lp-socialproof-stat{font-size:clamp(36px,5vw,64px);font-weight:900;color:#fff;letter-spacing:-.03em;margin:16px 0}
.lp-socialproof-sub{font-size:17px;color:rgba(255,255,255,.8);margin:0 0 32px}
.lp-btn-white{padding:14px 32px;border-radius:10px;background:#fff;color:${accent};font-weight:700;font-size:15px;display:inline-block;transition:transform .15s,box-shadow .15s}
.lp-btn-white:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.15)}
@media(max-width:900px){.lp-socialproof{padding:60px 20px}}

/* FAQ */
.lp-faq{padding:100px 40px;background:#fff}
.lp-faq-grid{max-width:1160px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:16px}
.lp-faq-item{background:${bg};border-radius:14px;overflow:hidden}
.lp-faq-btn{width:100%;padding:20px 24px;background:none;border:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-size:15px;font-weight:700;color:${textMain};text-align:left;gap:12px}
.lp-faq-btn[aria-expanded=true]{color:${accent}}
.lp-faq-icon{flex-shrink:0;width:24px;height:24px;border-radius:50%;background:${accentSoft};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:${accent};transition:transform .2s}
.lp-faq-btn[aria-expanded=true] .lp-faq-icon{transform:rotate(45deg)}
.lp-faq-body{max-height:0;overflow:hidden;transition:max-height .3s ease,padding .3s}
.lp-faq-body.open{max-height:400px;padding:0 24px 20px}
.lp-faq-body p{font-size:14px;line-height:1.65;color:${muted};margin:0}
@media(max-width:900px){.lp-faq-grid[data-split]{grid-template-columns:1fr}.lp-faq{padding:60px 20px}}

/* Kontakt */
.lp-kontakt{padding:100px 40px;background:${bg}}
.lp-kontakt-grid{max-width:1160px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start}
.lp-kontakt-card{background:#fff;border-radius:20px;padding:48px 40px;box-shadow:0 2px 16px rgba(0,0,0,.06)}
.lp-form-row{display:grid;gap:14px}
.lp-form-row input,.lp-form-row textarea{width:100%;padding:14px 16px;border:1.5px solid #e4e7eb;border-radius:10px;font-size:15px;color:${textMain};background:#fff;transition:border-color .2s;outline:none;font-family:inherit}
.lp-form-row input:focus,.lp-form-row textarea:focus{border-color:${accent}}
.lp-form-row textarea{min-height:110px;resize:vertical}
.lp-form-check{display:flex;gap:10px;align-items:flex-start;font-size:13px;color:${muted}}
.lp-form-check input{margin-top:3px;accent-color:${accent}}
.lp-form-check a{color:${accent};font-weight:600}
.lp-form-success{display:none;padding:14px;border-radius:10px;background:#dcfce7;color:#15803d;font-size:14px;font-weight:600}
@media(max-width:900px){.lp-kontakt-grid[data-split]{grid-template-columns:1fr}.lp-kontakt{padding:60px 20px}.lp-kontakt-card{padding:32px 24px}}

/* Footer */
.lp-footer{background:#111814;padding:64px 40px 32px}
.lp-footer-grid{max-width:1160px;margin:0 auto;display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:48px;padding-bottom:48px;border-bottom:1px solid rgba(255,255,255,.08)}
.lp-footer-logo{font-size:20px;font-weight:800;letter-spacing:-.03em;color:#fff;margin-bottom:12px}
.lp-footer-desc{font-size:14px;line-height:1.6;color:rgba(255,255,255,.5);margin:0}
.lp-footer-col-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.4);margin:0 0 16px}
.lp-footer-col a{display:block;font-size:14px;color:rgba(255,255,255,.6);margin-bottom:10px;transition:color .2s}
.lp-footer-col a:hover{color:#fff}
.lp-footer-copy{max-width:1160px;margin:28px auto 0;font-size:13px;color:rgba(255,255,255,.3);text-align:center}
@media(max-width:900px){.lp-footer-grid[data-cols3]{grid-template-columns:1fr}.lp-footer{padding:48px 20px 24px}}

/* Reveal animation */
@keyframes fadeUp{to{opacity:1;transform:translateY(0)}}
.reveal{opacity:0;transform:translateY(28px);transition:opacity .55s ease,transform .55s ease}
.reveal.visible{opacity:1;transform:none}
`

  // ── JavaScript (scroll header + FAQ accordion + reveal + KPI counters) ──
  const inlineJs = `
(function(){
  // Scroll-Header
  var hdr=document.getElementById('site-header');
  function updateHdr(){
    if(window.scrollY>40){hdr.classList.add('scrolled')}
    else{hdr.classList.remove('scrolled')}
  }
  window.addEventListener('scroll',updateHdr,{passive:true});
  updateHdr();

  // FAQ Accordion
  document.querySelectorAll('.lp-faq-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      var expanded=this.getAttribute('aria-expanded')==='true';
      document.querySelectorAll('.lp-faq-btn').forEach(function(b){
        b.setAttribute('aria-expanded','false');
        b.nextElementSibling.classList.remove('open');
      });
      if(!expanded){
        this.setAttribute('aria-expanded','true');
        this.nextElementSibling.classList.add('open');
      }
    });
  });

  // Reveal on scroll
  var revealEls=document.querySelectorAll('.reveal');
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}
    });
  },{threshold:.12});
  revealEls.forEach(function(el){io.observe(el)});

  // KPI counters
  document.querySelectorAll('[data-kpi-target]').forEach(function(el){
    var target=parseInt(el.getAttribute('data-kpi-target'),10);
    var suffix=el.getAttribute('data-kpi-suffix')||'';
    var io2=new IntersectionObserver(function(entries){
      if(!entries[0].isIntersecting)return;
      io2.disconnect();
      var start=0,duration=1400,startTime=null;
      function step(ts){
        if(!startTime)startTime=ts;
        var p=Math.min((ts-startTime)/duration,1);
        var ease=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
        el.textContent=Math.round(ease*target)+suffix;
        if(p<1)requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    },{threshold:.5});
    io2.observe(el);
  });

  // Contact form
  document.querySelectorAll('[data-kontakt-form]').forEach(function(form){
    form.addEventListener('submit',function(e){
      if(!form.hasAttribute('action')){
        e.preventDefault();
        var s=form.querySelector('[data-form-erfolg]');
        if(s){s.style.display='block'}
      }
    });
  });
})();
`

  // ── Hero word-by-word animation ─────────────────────────────────────────
  const heroSzene = inhalte.szenen[0]
  const heroTitel = heroSzene?.titel || meta.firma
  const heroText  = heroSzene?.text  || beschreibung
  const heroKicker = heroSzene?.kicker || ''
  const heroWords = heroTitel.split(' ').map((w, i) =>
    `<span class="word" style="animation-delay:${(i * 0.08).toFixed(2)}s">${esc(w)}</span>`
  ).join(' ')

  const ersteStimme = config.unterseiten?.erfahrungen?.stimmen?.[0]

  // ── 1. HEADER ────────────────────────────────────────────────────────────
  const headerHtml = `<header id="site-header">
  <div class="hdr-logo">${esc(inhalte.header.logo_text)}</div>
  <nav class="hdr-nav" data-navlinks>
    ${navLinks.map(l => `<a href="${escAttr(l.href)}">${esc(l.label)}</a>`).join('\n    ')}
  </nav>
  <a class="hdr-nav hdr-cta" href="#kontakt">${esc(inhalte.header.cta_label)}</a>
</header>`

  // ── 2. HERO ──────────────────────────────────────────────────────────────
  const heroHtml = `<section class="lp-hero">
  <div class="lp-hero-overlay"></div>
  <div class="lp-hero-content">
    <div class="lp-eyebrow"><span class="lp-eyebrow-dot"></span>${esc(heroKicker)}</div>
    <h1>${heroWords}</h1>
    <p>${esc(heroText)}</p>
    <div class="lp-hero-actions">
      <a class="lp-btn-primary" href="#kontakt">${esc(inhalte.header.cta_label)}</a>
      <a class="lp-btn-secondary" href="#leistungen">Leistungen entdecken</a>
    </div>
  </div>
  ${ersteStimme ? `<div class="lp-review-card">
    <div class="lp-review-stars">★★★★★</div>
    <p class="lp-review-text">„${esc(ersteStimme.text)}"</p>
    <div class="lp-review-author">${esc(ersteStimme.name)}${ersteStimme.rolle ? ` · ${esc(ersteStimme.rolle)}` : ''}</div>
  </div>` : ''}
</section>`

  // ── 3. ÜBER UNS ─────────────────────────────────────────────────────────
  const ueberSzene = inhalte.szenen[1]
  const ueberHtml = ueberSzene ? `<section class="lp-ueber">
  <div class="lp-ueber-grid" data-split>
    <div class="reveal">
      <div class="lp-quote-icon">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L9.758 4.03c0 0-.218.052-.597.144C8.97 4.222 8.737 4.278 8.472 4.345c-.271.05-.56.187-.882.312C7.272 4.799 6.904 4.895 6.562 5.123c-.344.218-.741.4-1.091.692C5.132 6.116 4.723 6.377 4.421 6.76c-.33.358-.656.734-.909 1.162C3.219 8.33 3.02 8.778 2.81 9.221c-.19.443-.343.896-.468 1.336-.237.882-.343 1.72-.384 2.437-.034.718-.014 1.315.028 1.747.015.204.043.402.063.539.017.109.025.168.025.168l.026-.006C2.535 17.474 4.338 19 6.5 19c2.485 0 4.5-2.015 4.5-4.5S8.985 10 6.5 10zM17.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L20.758 4.03c0 0-.218.052-.597.144-.191.048-.424.104-.689.171-.271.05-.56.187-.882.312-.319.142-.687.238-1.029.466-.344.218-.741.4-1.091.692-.339.301-.748.562-1.05.944-.33.358-.656.734-.909 1.162C14.219 8.33 14.02 8.778 13.81 9.221c-.19.443-.343.896-.468 1.336-.237.882-.343 1.72-.384 2.437-.034.718-.014 1.315.028 1.747.015.204.043.402.063.539.017.109.025.168.025.168l.026-.006C13.535 17.474 15.338 19 17.5 19c2.485 0 4.5-2.015 4.5-4.5S19.985 10 17.5 10z"/></svg>
      </div>
      <div class="lp-section-pill">${esc(ueberSzene.kicker || 'Über uns')}</div>
      <blockquote class="lp-blockquote">${esc(ueberSzene.text)}</blockquote>
      <div class="lp-quote-author">— ${esc(ueberSzene.titel || meta.firma)}</div>
    </div>
    <div class="lp-img-placeholder reveal" style="min-height:320px">
      ${esc(meta.firma)} · ${esc(meta.ort)}
    </div>
  </div>
</section>` : ''

  // ── 4. LEISTUNGEN ────────────────────────────────────────────────────────
  const leistungenData = config.unterseiten?.leistungen
  const leistungenHtml = leistungenData ? `<section class="lp-leistungen" id="leistungen">
  <div class="lp-section-header reveal">
    <div class="lp-section-pill">${esc(leistungenData.eyebrow)}</div>
    <h2 class="lp-section-h2">${esc(leistungenData.headline)}</h2>
    <p class="lp-section-lead">${esc(leistungenData.lead)}</p>
  </div>
  <div style="max-width:1160px;margin:0 auto">
    ${leistungenData.leistungen.map((l, i) => `<div class="lp-service-card reveal">
      <div class="lp-service-card-body">
        <div class="lp-service-nr">${String(i + 1).padStart(2, '0')}</div>
        <div class="lp-section-pill" style="margin-bottom:16px">${esc(l.icon)}</div>
        <h3>${esc(l.titel)}</h3>
        <p>${esc(l.text)}</p>
      </div>
      <div class="lp-service-img">${esc(l.titel)}</div>
    </div>`).join('\n    ')}
  </div>
</section>` : ''

  // ── 5. WARUM [FIRMA] ─────────────────────────────────────────────────────
  const warumSzenen = inhalte.szenen.slice(2, 5)
  const warumHtml = warumSzenen.length > 0 ? `<section class="lp-warum">
  <div class="lp-section-header reveal">
    <div class="lp-section-pill">Unsere Stärken</div>
    <h2 class="lp-section-h2">Warum ${esc(meta.firma)}?</h2>
  </div>
  <div class="lp-warum-grid" data-cols3 style="max-width:1160px;margin:0 auto">
    ${warumSzenen.map(s => `<div class="lp-warum-card reveal">
      <div class="lp-warum-card-overlay"></div>
      <div class="lp-warum-card-inner">
        <h3>${esc(s.titel)}</h3>
        <p>${esc(s.text)}</p>
      </div>
    </div>`).join('\n    ')}
  </div>
</section>` : ''

  // ── 6. REFERENZEN ────────────────────────────────────────────────────────
  const erfahrungenData = config.unterseiten?.erfahrungen
  const stimmen = erfahrungenData?.stimmen || []
  const referenzenHtml = `<section class="lp-referenzen" id="referenzen">
  <div class="lp-section-header reveal">
    <div class="lp-section-pill">${esc(erfahrungenData?.eyebrow || 'Referenzen')}</div>
    <h2 class="lp-section-h2">${esc(erfahrungenData?.headline || 'Was unsere Kunden sagen')}</h2>
  </div>
  <div class="lp-kpi-row">
    <div class="lp-kpi-card reveal">
      <div class="lp-kpi-val" data-kpi-target="100" data-kpi-suffix="+">0+</div>
      <div class="lp-kpi-label">Projekte abgeschlossen</div>
    </div>
    <div class="lp-kpi-card reveal">
      <div class="lp-kpi-val" data-kpi-target="5" data-kpi-suffix="+">0+</div>
      <div class="lp-kpi-label">Jahre Erfahrung</div>
    </div>
    <div class="lp-kpi-card reveal">
      <div class="lp-kpi-val" data-kpi-target="98" data-kpi-suffix="%">0%</div>
      <div class="lp-kpi-label">Kundenzufriedenheit</div>
    </div>
    <div class="lp-kpi-card reveal">
      <div class="lp-kpi-val" data-kpi-target="50" data-kpi-suffix="+">0+</div>
      <div class="lp-kpi-label">Stammkunden</div>
    </div>
  </div>
  ${stimmen.length > 0 ? `<div class="lp-testimonial-grid" data-cols3 style="max-width:1160px;margin:0 auto">
    ${stimmen.map(s => `<div class="lp-testimonial-card reveal">
      <div class="lp-testimonial-stars">★★★★★</div>
      <p class="lp-testimonial-text">„${esc(s.text)}"</p>
      <div class="lp-testimonial-author">
        <div class="lp-testimonial-avatar">${esc(s.initialen)}</div>
        <div class="lp-testimonial-meta">
          <strong>${esc(s.name)}</strong>
          ${s.rolle ? `<span>${esc(s.rolle)}</span>` : ''}
        </div>
      </div>
    </div>`).join('\n    ')}
  </div>` : ''}
</section>`

  // ── 7. SOCIAL PROOF ──────────────────────────────────────────────────────
  const socialProofHtml = `<section class="lp-socialproof">
  <div class="lp-socialproof-card reveal">
    <div class="lp-section-pill">Vertrauen</div>
    <p class="lp-socialproof-stat">100+ zufriedene Kunden in ${esc(meta.ort)}</p>
    <p class="lp-socialproof-sub">Profitieren Sie von unserer jahrelangen Erfahrung und unserem Netzwerk vor Ort.</p>
    <a class="lp-btn-white" href="#kontakt">${esc(inhalte.header.cta_label)}</a>
  </div>
</section>`

  // ── 8. FAQ ───────────────────────────────────────────────────────────────
  const faqItems = leistungenData?.leistungen.map(l => ({
    frage: `Was umfasst die Leistung „${l.titel}"?`,
    antwort: l.text,
  })) || [
    { frage: `Wie kann ich ${esc(meta.firma)} kontaktieren?`, antwort: `Sie erreichen uns per E-Mail unter ${meta.email || '[E-Mail]'} oder telefonisch unter ${meta.telefon || '[Telefon]'}.` },
    { frage: 'Wie läuft die Zusammenarbeit ab?', antwort: 'Nach Ihrer Anfrage melden wir uns innerhalb von 24 Stunden und vereinbaren ein unverbindliches Beratungsgespräch.' },
  ]
  const faqHtml = `<section class="lp-faq" id="faq">
  <div class="lp-section-header reveal">
    <div class="lp-section-pill">FAQ</div>
    <h2 class="lp-section-h2">Häufige Fragen</h2>
  </div>
  <div class="lp-faq-grid" data-split style="max-width:1160px;margin:0 auto">
    ${faqItems.map((item, i) => `<div class="lp-faq-item reveal">
      <button class="lp-faq-btn" aria-expanded="${i === 0 ? 'true' : 'false'}">
        <span>${typeof item.frage === 'string' ? esc(item.frage) : item.frage}</span>
        <span class="lp-faq-icon">+</span>
      </button>
      <div class="lp-faq-body${i === 0 ? ' open' : ''}">
        <p>${typeof item.antwort === 'string' ? esc(item.antwort) : item.antwort}</p>
      </div>
    </div>`).join('\n    ')}
  </div>
</section>`

  // ── 9. KONTAKT ───────────────────────────────────────────────────────────
  const kontaktHtml = `<section class="lp-kontakt" id="kontakt">
  <div class="lp-kontakt-grid" data-split>
    <div class="lp-kontakt-card reveal">
      <div class="lp-section-pill">${esc(inhalte.kontakt.pill)}</div>
      <h2 class="lp-section-h2" style="margin-top:16px;font-size:clamp(24px,3vw,38px)">${esc(inhalte.kontakt.h2)}</h2>
      <p style="font-size:16px;line-height:1.65;color:${muted};margin:0 0 28px">${esc(inhalte.kontakt.lead)}</p>
      <form data-kontakt-form${opts.submitZiel ? ` action="${escAttr(opts.submitZiel)}" method="post"` : ''}>
        <div class="lp-form-row">
          <input type="text" name="name" placeholder="Ihr Name" required>
          <input type="email" name="email" placeholder="E-Mail-Adresse" required>
          <input type="tel" name="telefon" placeholder="Telefon (optional)">
          <textarea name="nachricht" placeholder="Beschreiben Sie Ihr Projekt kurz …"></textarea>
          <label class="lp-form-check">
            <input type="checkbox" name="datenschutz" required>
            <span>Ich habe die <a href="/datenschutz">Datenschutzerklärung</a> gelesen und stimme zu.</span>
          </label>
          <button class="lp-btn-primary" type="submit" style="border:none;cursor:pointer;width:100%;padding:16px;font-size:16px">${esc(inhalte.kontakt.cta_label)}</button>
          <div class="lp-form-success" data-form-erfolg>Danke! Wir melden uns innerhalb von 24 Stunden bei Ihnen.</div>
        </div>
      </form>
    </div>
    <div class="lp-img-placeholder reveal" style="min-height:480px;border-radius:20px">
      ${esc(meta.firma)} · Kontakt
    </div>
  </div>
</section>`

  // ── 10. FOOTER ───────────────────────────────────────────────────────────
  const footerHtml = `<footer class="lp-footer">
  <div class="lp-footer-grid" data-cols3>
    <div>
      <div class="lp-footer-logo">${esc(inhalte.header.logo_text)}</div>
      <p class="lp-footer-desc">${esc(inhalte.footer.beschreibung)}</p>
    </div>
    <div class="lp-footer-col">
      <p class="lp-footer-col-title">Navigation</p>
      ${navLinks.slice(0, 5).map(l => `<a href="${escAttr(l.href)}">${esc(l.label)}</a>`).join('\n      ')}
    </div>
    <div class="lp-footer-col">
      <p class="lp-footer-col-title">Kontakt</p>
      ${meta.email ? `<a href="mailto:${escAttr(meta.email)}">${esc(meta.email)}</a>` : ''}
      ${meta.telefon ? `<a href="tel:${escAttr(meta.telefon)}">${esc(meta.telefon)}</a>` : ''}
      <a href="/impressum">Impressum</a>
      <a href="/datenschutz">Datenschutz</a>
    </div>
  </div>
  <div class="lp-footer-copy">&copy; ${new Date().getFullYear()} ${esc(meta.firma)} · ${esc(meta.ort)}</div>
</footer>`

  // ── Zusammenbauen ────────────────────────────────────────────────────────
  const body = [
    headerHtml,
    heroHtml,
    ueberHtml,
    leistungenHtml,
    warumHtml,
    referenzenHtml,
    socialProofHtml,
    faqHtml,
    kontaktHtml,
    footerHtml,
    opts.demo ? renderScrubRibbon() : '',
  ].filter(Boolean).join('\n\n')

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(titel)}</title>
<meta name="description" content="${escAttr(beschreibung)}">
${noindex}
<meta property="og:title" content="${escAttr(titel)}">
<meta property="og:description" content="${escAttr(beschreibung)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="de_DE">
<script type="application/ld+json">${jsonLd(config)}</script>
<style>
${scrubLightCss(config.design)}
${extraCss}
</style>
</head>
<body>

${body}

<script>${inlineJs}</script>
</body>
</html>`
}

/**
 * Rendert eine Scrub-Unterseite — feste Slugs (karriere, leistungen, …) UND
 * dynamische Slugs (zielgruppen, leistung_details aus der Config).
 */
export function renderScrubUnterseite(
  config: ScrubConfig,
  seite: string,
  opts: FlagshipRenderOptionen = {},
): string {
  const { meta, inhalte } = config
  const basisPfad = opts.basisPfad || ''
  const navLinks = scrubAlleNavLinks(config, basisPfad)

  let sektionen = ''
  let seitenTitel = ''
  let seitenBeschreibung = meta.seo_beschreibung || ''

  // 1. Feste Unterseiten
  switch (seite) {
    case 'karriere':
      sektionen = config.unterseiten?.karriere
        ? renderScrubKarriere(config.unterseiten.karriere, opts.submitZiel)
        : ''
      seitenTitel = `Karriere — ${meta.firma}`
      break
    case 'erfahrungen':
      sektionen = config.unterseiten?.erfahrungen
        ? renderScrubErfahrungen(config.unterseiten.erfahrungen)
        : ''
      seitenTitel = `Erfahrungen — ${meta.firma}`
      break
    case 'leistungen':
      sektionen = config.unterseiten?.leistungen
        ? renderScrubLeistungen(config.unterseiten.leistungen)
        : ''
      seitenTitel = `Leistungen — ${meta.firma}`
      break
    case 'ziele':
      sektionen = config.unterseiten?.ziele
        ? renderScrubZiele(config.unterseiten.ziele)
        : ''
      seitenTitel = `Ziele — ${meta.firma}`
      break
    case 'angebote':
      sektionen = config.unterseiten?.angebote
        ? renderScrubAngebote(config.unterseiten.angebote)
        : ''
      seitenTitel = `Angebote — ${meta.firma}`
      break
    case 'kontakt':
      sektionen = renderScrubKontaktSeite(inhalte.kontakt, opts.submitZiel)
      seitenTitel = `Kontakt — ${meta.firma}`
      break
  }

  // 2. Dynamische Zielgruppen-Seiten
  if (!sektionen && config.unterseiten?.zielgruppen?.[seite]) {
    const zg = config.unterseiten.zielgruppen[seite]
    sektionen = renderScrubZielgruppe(zg)
    seitenTitel = zg.seo_titel || `${zg.nav_label} — ${meta.firma}`
    seitenBeschreibung = zg.seo_beschreibung || seitenBeschreibung
  }

  // 3. Dynamische Leistungs-Detail-Seiten
  if (!sektionen && config.unterseiten?.leistung_details?.[seite]) {
    const ld = config.unterseiten.leistung_details[seite]
    sektionen = renderScrubLeistungDetail(ld)
    seitenTitel = ld.seo_titel || `${ld.nav_label} — ${meta.firma}`
    seitenBeschreibung = ld.seo_beschreibung || seitenBeschreibung
  }

  if (!sektionen) return ''

  const titel = seitenTitel || `${seite} — ${meta.firma}`
  const noindex = opts.noindex !== false ? '<meta name="robots" content="noindex">' : ''

  // Light-Footer für Unterseiten
  const lightFooter = `<footer class="ss-footer">
  <div class="ss-footer-inner">
    <div class="ss-footer-col" style="max-width:320px">
      <div style="font-size:18px;font-weight:800;letter-spacing:-0.02em">${esc(inhalte.header.logo_text)}</div>
      <p style="margin:4px 0 0;line-height:1.5;color:rgba(255,255,255,.65)">${esc(inhalte.footer.beschreibung)}</p>
    </div>
    <div class="ss-footer-col">
      ${navLinks.slice(0, 5).map(l => `<a href="${escAttr(l.href)}">${esc(l.label)}</a>`).join('\n      ')}
    </div>
    <div class="ss-footer-col">
      ${meta.email ? `<a href="mailto:${escAttr(meta.email)}">${esc(meta.email)}</a>` : ''}
      ${meta.telefon ? `<a href="tel:${escAttr(meta.telefon)}">${esc(meta.telefon)}</a>` : ''}
      <a href="/impressum">Impressum</a>
      <a href="/datenschutz">Datenschutz</a>
    </div>
  </div>
  <div class="ss-footer-copy">&copy; ${new Date().getFullYear()} ${esc(meta.firma)}</div>
</footer>`

  const body = [
    renderScrubHeader(inhalte.header, navLinks),
    sektionen,
    lightFooter,
    opts.demo ? renderScrubRibbon() : '',
  ].filter(Boolean).join('\n\n')

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(titel)}</title>
<meta name="description" content="${escAttr(seitenBeschreibung)}">
${noindex}
<style>
${scrubLightCss(config.design)}
</style>
</head>
<body>
${body}
</body>
</html>`
}
