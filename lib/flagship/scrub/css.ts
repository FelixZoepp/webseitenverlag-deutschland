/**
 * Premium-Komposition „scrub-story-v1" — CSS.
 *
 * Adaption der Guide-Datei scroll-scrub.css: ss-*-Klassen (Stage, Canvas,
 * Poster, Loader, Progress, Dots, Hint, Story, Scene-Pins) + eigene, schlanke
 * Header-/Kontakt-/Footer-Styles im dunklen Design. Farb-Tokens kommen aus
 * config.design (Guide-Default: #07090c / #f5ff5a / #00e5ff).
 * Font: Inter Tight self-hosted (public/fonts/inter-tight/, OFL).
 *
 * prefers-reduced-motion: Canvas aus, Poster sichtbar, Szenen stapeln als
 * volle Viewport-Sektionen — identisch zur no-JS-Ansicht (Poster-Modus).
 */

import type { ScrubDesign } from './types'

/** #rrggbb → "r,g,b" für rgba()-Mischungen */
function rgb(hex: string): string {
  const m = hex.replace('#', '')
  const n = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  const wert = parseInt(n, 16)
  if (Number.isNaN(wert) || n.length !== 6) return '0,0,0'
  return `${(wert >> 16) & 255},${(wert >> 8) & 255},${wert & 255}`
}

export function scrubCss(design: ScrubDesign): string {
  const a1 = rgb(design.akzent1)
  const a2 = rgb(design.akzent2)
  const basisRgb = rgb(design.basis)
  return `
@font-face{font-family:'Inter Tight';font-style:normal;font-weight:100 900;font-display:swap;src:url('/fonts/inter-tight/InterTight-latin-ext.woff2') format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:'Inter Tight';font-style:normal;font-weight:100 900;font-display:swap;src:url('/fonts/inter-tight/InterTight-latin.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}

:root{--ss-bg:${design.basis};--ss-text:${design.text};--ss-muted:${design.text_soft};--ss-akzent:${design.akzent1};--ss-cyan:${design.akzent2}}
*{box-sizing:border-box}
html{scroll-behavior:smooth;overflow-x:hidden;overflow-x:clip}
body{margin:0;background:var(--ss-bg);color:var(--ss-text);font-family:'Inter Tight',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;letter-spacing:-0.011em;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-x:clip}
section[id]{scroll-margin-top:72px}
img{display:block;max-width:100%}
a{color:inherit;text-decoration:none}

/* Media-Slots: gestalteter Platzhalter bis das Asset lädt (dunkle Variante) */
.media{position:relative;overflow:hidden;background:linear-gradient(135deg,rgba(${a1},.12),rgba(${a2},.10))}
.media::before{content:attr(data-label);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:16px;text-align:center;font-size:13px;font-weight:600;color:var(--ss-muted);opacity:.9}
.media img{width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .5s ease}
.media.loaded img{opacity:1}
.media.loaded::before{content:none}

/* ---------- Header ---------- */
.ss-kopf{position:fixed;top:0;left:0;right:0;z-index:50;background:rgba(${basisRgb},.95);border-bottom:1px solid rgba(255,255,255,.06);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
.ss-kopf-inner{max-width:1200px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;gap:32px}
.ss-logo{font-size:18px;font-weight:800;letter-spacing:-0.02em;white-space:nowrap}
.ss-logo em{font-style:normal;color:var(--ss-akzent)}
.ss-kopf-rechts{display:flex;align-items:center;gap:16px}
.ss-btn-kopf{font-size:13px;padding:9px 20px}
@media(max-width:860px){.ss-btn-kopf{display:none}}

/* Hamburger */
.ss-burger{display:none;background:none;border:none;cursor:pointer;padding:8px;flex-direction:column;gap:5px;z-index:60}
.ss-burger span{display:block;width:22px;height:2px;background:var(--ss-text);border-radius:2px;transition:transform .25s ease,opacity .2s ease}
.ss-burger.ss-open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.ss-burger.ss-open span:nth-child(2){opacity:0}
.ss-burger.ss-open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
@media(max-width:860px){.ss-burger{display:flex}}

/* Mobile Menü */
.ss-mobile-menu{display:none;flex-direction:column;padding:16px 24px 24px;border-top:1px solid rgba(255,255,255,.06);background:rgba(${basisRgb},.98)}
.ss-mobile-menu.ss-open{display:flex}
.ss-mobile-link{display:block;padding:12px 0;font-size:16px;font-weight:500;color:var(--ss-text);border-bottom:1px solid rgba(255,255,255,.04)}
.ss-mobile-sub{padding-left:20px;font-size:14px;color:var(--ss-muted);font-weight:400}

/* Desktop Dropdown */
.ss-nav-dropdown{position:relative}
.ss-nav-dropdown-menu{display:none;position:absolute;top:100%;left:50%;transform:translateX(-50%);min-width:220px;padding:8px 0;margin-top:12px;background:rgba(${basisRgb},.97);border:1px solid rgba(255,255,255,.08);border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.4);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
.ss-nav-dropdown:hover .ss-nav-dropdown-menu{display:block}
.ss-nav-dropdown-menu a{display:block;padding:10px 20px;font-size:14px;color:var(--ss-muted);transition:color .15s ease,background .15s ease;white-space:nowrap}
.ss-nav-dropdown-menu a:hover{color:var(--ss-text);background:rgba(255,255,255,.04)}
.ss-nav-link svg{vertical-align:middle;margin-left:3px;opacity:.5;transition:transform .2s ease}
.ss-nav-dropdown:hover .ss-nav-link svg{transform:rotate(180deg);opacity:1}

/* ---------- Buttons ---------- */
.ss-btn-primary{display:inline-block;background:var(--ss-akzent);color:#0a0c10;font-family:inherit;font-weight:700;font-size:15px;padding:13px 26px;border:none;border-radius:999px;cursor:pointer;box-shadow:0 0 24px rgba(${a1},.35);transition:filter .2s ease,transform .1s ease;text-align:center}
.ss-btn-primary:hover{filter:brightness(1.06)}
.ss-btn-primary:active{transform:scale(.97)}
.ss-btn-secondary{display:inline-block;padding:12px 24px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.2);color:var(--ss-text);font-family:inherit;font-weight:600;font-size:15px;cursor:pointer;transition:background .2s ease;text-align:center}
.ss-btn-secondary:hover{background:rgba(255,255,255,.12)}

/* ---------- Stage (Sticky-Canvas, nur Scrub-Modus) ---------- */
.ss-wrap{position:relative;isolation:isolate}
.ss-stage{position:sticky;top:0;height:100dvh;overflow:hidden;z-index:1}
.ss-canvas{position:absolute;inset:0;width:100%;height:100%}
.ss-poster{position:absolute;inset:0;z-index:1;background-size:cover;background-position:center;transition:opacity .5s ease}
.ss-poster.is-hidden{opacity:0;pointer-events:none}
.ss-poster .media{position:absolute;inset:0}
.ss-loader{position:absolute;left:50%;bottom:88px;transform:translateX(-50%);z-index:2;width:min(280px,60vw);transition:opacity .4s ease}
.ss-loader.is-hidden{opacity:0;pointer-events:none}
.ss-loader-bar{height:3px;border-radius:99px;background:rgba(255,255,255,.14);overflow:hidden}
.ss-loader-bar span{display:block;height:100%;width:0;border-radius:99px;background:var(--ss-akzent);box-shadow:0 0 12px rgba(${a1},.8);transition:width .2s ease}
.ss-progress{position:fixed;left:0;bottom:0;z-index:60;height:2px;width:100%;background:var(--ss-akzent);transform:scaleX(0);transform-origin:0 50%;box-shadow:0 0 8px rgba(${a1},.7)}
.ss-dots{position:fixed;right:18px;top:50%;transform:translateY(-50%);z-index:60;display:flex;flex-direction:column;gap:12px}
.ss-dots button{width:10px;height:10px;border-radius:50%;border:1px solid rgba(255,255,255,.4);background:transparent;cursor:pointer;padding:0;transition:background .2s ease,box-shadow .2s ease}
.ss-dots button.is-active{background:var(--ss-akzent);border-color:var(--ss-akzent);box-shadow:0 0 10px rgba(${a1},.8)}
.ss-hint{position:absolute;left:50%;bottom:28px;transform:translateX(-50%);z-index:2;font-size:13px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--ss-muted);animation:ssHintFade 2.4s ease-in-out infinite;transition:opacity .4s ease}
.ss-hint.is-hidden{opacity:0}
@keyframes ssHintFade{0%,100%{opacity:.4;transform:translateX(-50%) translateY(0)}50%{opacity:1;transform:translateX(-50%) translateY(6px)}}

/* ---------- Story (Copy-Layer über der Stage) ---------- */
.ss-story{position:relative;z-index:3;margin-top:-100dvh}
.ss-scene{height:calc(var(--ss-gewicht,1.5)*100dvh)}
.ss-scene-pin{position:sticky;top:0;min-height:100dvh;display:flex;align-items:center;padding:96px 6vw 64px;pointer-events:none}
.ss-scene[data-align="right"] .ss-scene-pin{justify-content:flex-end}
.ss-copy{position:relative;width:min(40rem,48vw);pointer-events:auto}
.ss-copy::before{content:'';position:absolute;inset:-56px -64px;z-index:-1;background:radial-gradient(closest-side,rgba(${basisRgb},.78),rgba(${basisRgb},0));border-radius:32px}
.ss-kicker{margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--ss-akzent)}
.ss-title{margin:0 0 16px;font-size:clamp(34px,4.6vw,60px);line-height:1.04;font-weight:800;letter-spacing:-0.02em}
.ss-body{margin:0 0 20px;font-size:17px;line-height:1.6;color:var(--ss-muted);max-width:34rem}
.ss-tags{margin:0 0 24px;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:10px}
.ss-tags li{font-size:13px;font-weight:600;padding:7px 14px;border-radius:999px;border:1px solid rgba(${a2},.4);color:var(--ss-cyan);background:rgba(${a2},.08)}
.ss-actions{display:flex;flex-wrap:wrap;gap:12px}

/* ---------- Statischer Poster-Modus (ohne Frames / no-JS-Struktur) ---------- */
.ss-statisch .ss-szene-poster{position:relative;min-height:100dvh;display:flex;align-items:center;padding:96px 6vw 64px;overflow:hidden}
.ss-statisch .ss-szene-poster .media{position:absolute;inset:0;z-index:0}
.ss-statisch .ss-szene-poster::after{content:'';position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(${basisRgb},.55),rgba(${basisRgb},.25) 40%,rgba(${basisRgb},.8))}
.ss-statisch .ss-szene-poster .ss-copy{z-index:2}
.ss-statisch .ss-szene-poster[data-align="right"]{justify-content:flex-end}

/* ---------- Kontakt ---------- */
.ss-kontakt{padding:96px 6vw;background:linear-gradient(180deg,var(--ss-bg),rgba(${a2},.05))}
.ss-kontakt-karte{max-width:640px;margin:0 auto;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:40px}
.ss-pill{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--ss-cyan);border:1px solid rgba(${a2},.4);border-radius:999px;padding:6px 14px;margin-bottom:16px}
.ss-kontakt h2{margin:0 0 12px;font-size:clamp(28px,3.4vw,42px);line-height:1.08;font-weight:800;letter-spacing:-0.02em}
.ss-kontakt-lead{margin:0 0 24px;font-size:16px;line-height:1.6;color:var(--ss-muted)}
.ss-kontakt form{display:grid;gap:12px}
.ss-feld{width:100%;border-radius:12px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.05);color:var(--ss-text);font-family:inherit;font-size:15px;padding:13px 16px}
.ss-feld::placeholder{color:var(--ss-muted)}
textarea.ss-feld{min-height:110px;resize:vertical}
.ss-check{display:flex;gap:10px;align-items:flex-start;font-size:13px;color:var(--ss-muted)}
.ss-check a{color:var(--ss-cyan)}
.ss-form-erfolg{display:none;margin:8px 0 0;font-size:14px;font-weight:600;color:var(--ss-akzent)}
.ss-form-erfolg.sichtbar{display:block}

/* ---------- Footer ---------- */
.ss-fuss{padding:48px 6vw 40px;border-top:1px solid rgba(255,255,255,.08);color:var(--ss-muted);font-size:14px}
.ss-fuss-inner{max-width:1200px;margin:0 auto;display:flex;flex-wrap:wrap;gap:24px;justify-content:space-between;align-items:flex-start}
.ss-fuss-beschreibung{max-width:44rem;margin:8px 0 0;line-height:1.6}
.ss-fuss nav{display:flex;gap:20px}
.ss-fuss a:hover{color:var(--ss-text)}

/* ---------- Demo-Ribbon ---------- */
.ss-ribbon{position:fixed;top:14px;right:-38px;z-index:70;transform:rotate(45deg);background:var(--ss-akzent);color:#0a0c10;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;padding:6px 44px;box-shadow:0 4px 14px rgba(0,0,0,.4);pointer-events:none}

/* ---------- Responsive ---------- */
@media (max-width:860px){
  .ss-scene-pin,.ss-statisch .ss-szene-poster{align-items:flex-end;padding:0 20px 72px}
  .ss-scene[data-align="right"] .ss-scene-pin,.ss-statisch .ss-szene-poster[data-align="right"]{justify-content:flex-start}
  .ss-copy{width:100%}
  .ss-copy::before{inset:-32px -20px;background:linear-gradient(180deg,rgba(${basisRgb},0),rgba(${basisRgb},.82) 30%)}
  .ss-dots{right:10px}
  .ss-kontakt-karte{padding:28px 20px}
}

/* ---------- Unterseiten (Karriere, Erfahrungen, Leistungen) ---------- */
.ss-seite{padding:clamp(64px,10vw,120px) 6vw;position:relative}
.ss-seite+.ss-seite{border-top:1px solid rgba(255,255,255,.06)}
.ss-seite:first-of-type{padding-top:clamp(120px,14vw,180px)}
.ss-seite-wrap{max-width:960px;margin:0 auto}
.ss-h2{font-size:clamp(26px,3.2vw,40px);font-weight:800;letter-spacing:-0.025em;margin:0 0 40px;line-height:1.08}
.ss-h2::after{content:'';display:block;width:48px;height:3px;margin-top:16px;background:linear-gradient(90deg,rgba(${a1},.8),rgba(${a2},.6));border-radius:2px}

/* Cards — shared glassmorphism */
.ss-benefit,.ss-stelle,.ss-stimme,.ss-fallstudie,.ss-leistung{padding:32px;border-radius:20px;background:linear-gradient(135deg,rgba(255,255,255,.04),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease}
.ss-benefit:hover,.ss-stelle:hover,.ss-stimme:hover,.ss-fallstudie:hover,.ss-leistung:hover{transform:translateY(-4px);border-color:rgba(${a1},.25);box-shadow:0 12px 40px -12px rgba(0,0,0,.5),0 0 0 1px rgba(${a1},.1)}

/* Benefits */
.ss-benefits-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.ss-benefit-icon{font-size:32px;display:block;margin-bottom:16px;filter:drop-shadow(0 0 12px rgba(${a1},.3))}
.ss-benefit h3{margin:0 0 10px;font-size:18px;font-weight:700}
.ss-benefit p{margin:0;font-size:14px;line-height:1.7;color:var(--ss-muted)}

/* Stellen */
.ss-stellen-list{display:flex;flex-direction:column;gap:18px}
.ss-stelle-header{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.ss-stelle h3{margin:0;font-size:19px;font-weight:700}
.ss-stelle-meta{font-size:13px;font-weight:600;color:var(--ss-cyan);padding:4px 12px;border-radius:999px;background:rgba(${a2},.1);border:1px solid rgba(${a2},.25)}
.ss-stelle p{margin:0 0 18px;font-size:15px;line-height:1.7;color:var(--ss-muted)}
.ss-stelle .ss-btn-primary{font-size:14px;padding:10px 22px}

/* Stimmen / Testimonials */
.ss-stimmen-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px}
.ss-stimme{position:relative;overflow:hidden}
.ss-stimme::before{content:'"';position:absolute;top:-8px;left:16px;font-size:120px;font-weight:900;opacity:.04;line-height:1;color:var(--ss-akzent)}
.ss-stimme-text{margin:0 0 20px;font-size:16px;line-height:1.7;font-style:italic;color:var(--ss-text);position:relative;z-index:1}
.ss-stimme-autor{display:flex;align-items:center;gap:14px}
.ss-avatar{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,rgba(${a1},.25),rgba(${a2},.25));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;flex-shrink:0;box-shadow:0 0 16px rgba(${a1},.15)}
.ss-stimme-autor strong{font-size:15px}
.ss-stimme-autor small{color:var(--ss-muted);font-size:13px}

/* Fallstudien */
.ss-fallstudien-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px}
.ss-fallstudie h3{margin:10px 0;font-size:19px;font-weight:700}
.ss-fallstudie .ss-pill{font-size:11px;padding:4px 10px}
.ss-fallstudie p{margin:0 0 16px;font-size:14px;line-height:1.7;color:var(--ss-muted)}
.ss-ergebnis{font-size:14px;padding:14px 16px;border-radius:12px;background:linear-gradient(135deg,rgba(${a1},.1),rgba(${a1},.04));border:1px solid rgba(${a1},.2);color:var(--ss-akzent);font-weight:500}

/* Vorher/Nachher Projekte */
.ss-projekte-grid{display:grid;grid-template-columns:1fr;gap:32px}
.ss-projekt{padding:32px;border-radius:20px;background:linear-gradient(135deg,rgba(255,255,255,.04),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.ss-projekt-header{margin-bottom:20px}
.ss-projekt-header h3{margin:0 0 6px;font-size:20px;font-weight:700}
.ss-vorher-nachher{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
@media (max-width:640px){.ss-vorher-nachher{grid-template-columns:1fr}}
.ss-vn-block{padding:20px;border-radius:14px;border:1px solid rgba(255,255,255,.06)}
.ss-vn-vorher{background:rgba(255,60,60,.04);border-color:rgba(255,60,60,.12)}
.ss-vn-nachher{background:rgba(${a1},.06);border-color:rgba(${a1},.18)}
.ss-vn-block p{margin:10px 0 0;font-size:14px;line-height:1.7;color:var(--ss-muted)}
.ss-kennzahlen{display:flex;gap:20px;flex-wrap:wrap;margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,.06)}
.ss-kz{text-align:center}
.ss-kz-wert{display:block;font-size:24px;font-weight:900;background:linear-gradient(135deg,var(--ss-akzent),var(--ss-cyan));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.ss-kz-label{font-size:12px;color:var(--ss-muted);text-transform:uppercase;letter-spacing:.05em}
.ss-btn-sekundaer{display:inline-block;padding:10px 20px;font-size:14px;font-weight:600;color:var(--ss-akzent);border:1px solid rgba(${a1},.3);border-radius:999px;text-decoration:none;transition:all .2s ease;margin-top:12px}
.ss-btn-sekundaer:hover{background:rgba(${a1},.1);border-color:rgba(${a1},.5)}

/* Vorher/Nachher Bild-Slider */
.ss-slider{position:relative;width:100%;aspect-ratio:16/9;border-radius:16px;overflow:hidden;cursor:col-resize;margin-bottom:20px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);user-select:none;-webkit-user-select:none}
.ss-slider img{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none}
.ss-slider-nachher{position:absolute;inset:0}
.ss-slider-vorher{position:absolute;top:0;left:0;bottom:0;overflow:hidden;z-index:1}
.ss-slider-vorher img{display:block;height:100%;object-fit:cover}
.ss-slider-handle{position:absolute;top:0;bottom:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:translateX(-50%);touch-action:none}
.ss-slider-line{flex:1;width:3px;background:rgba(255,255,255,.8);border-radius:2px;box-shadow:0 0 8px rgba(0,0,0,.4)}
.ss-slider-knob{width:44px;height:44px;border-radius:50%;background:var(--ss-akzent);display:flex;align-items:center;justify-content:center;gap:4px;font-size:12px;color:var(--ss-basis);font-weight:900;box-shadow:0 2px 12px rgba(0,0,0,.4),0 0 0 3px rgba(255,255,255,.2);flex-shrink:0;margin:6px 0}
.ss-slider-label{position:absolute;bottom:12px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:4px 12px;border-radius:999px;z-index:3;pointer-events:none}
.ss-slider-label-v{left:12px;background:rgba(255,60,60,.7);color:#fff}
.ss-slider-label-n{right:12px;background:rgba(${a1},.8);color:var(--ss-basis)}

/* Angebote / Preise */
.ss-pakete-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;align-items:start}
.ss-paket{padding:32px;border-radius:20px;background:linear-gradient(135deg,rgba(255,255,255,.04),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.08);text-align:center;transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease;position:relative}
.ss-paket:hover{transform:translateY(-4px);border-color:rgba(${a1},.25);box-shadow:0 12px 40px -12px rgba(0,0,0,.5)}
.ss-paket-highlight{border-color:rgba(${a1},.4);background:linear-gradient(135deg,rgba(${a1},.08),rgba(${a1},.02));box-shadow:0 0 32px rgba(${a1},.1)}
.ss-paket-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#0a0c10;background:var(--ss-akzent);padding:5px 16px;border-radius:999px;white-space:nowrap}
.ss-paket h3{margin:16px 0 8px;font-size:20px;font-weight:700}
.ss-paket-preis{margin-bottom:20px}
.ss-preis-zahl{font-size:clamp(36px,4vw,48px);font-weight:900;letter-spacing:-0.03em;background:linear-gradient(135deg,var(--ss-akzent),var(--ss-cyan));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.ss-preis-intervall{font-size:16px;color:var(--ss-muted);margin-left:4px}
.ss-paket-features{list-style:none;padding:0;margin:0 0 24px;text-align:left}
.ss-paket-features li{padding:8px 0;font-size:14px;color:var(--ss-muted);border-bottom:1px solid rgba(255,255,255,.05)}
.ss-paket-features li::before{content:'✓ ';color:var(--ss-akzent);font-weight:700}

/* Leistungen */
.ss-leistungen-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.ss-leistung{position:relative;overflow:hidden}
.ss-leistung-nr{position:absolute;top:12px;right:16px;font-size:56px;font-weight:900;opacity:.04;line-height:1;background:linear-gradient(180deg,rgba(${a1},.15),transparent);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.ss-leistung-icon{font-size:32px;display:block;margin-bottom:16px;filter:drop-shadow(0 0 12px rgba(${a2},.3))}
.ss-leistung h3{margin:0 0 10px;font-size:18px;font-weight:700}
.ss-leistung p{margin:0;font-size:14px;line-height:1.7;color:var(--ss-muted)}

/* Nav-Links in Header */
.ss-nav{display:flex;gap:28px;align-items:center}
.ss-nav-link{font-size:14px;font-weight:500;color:var(--ss-muted);transition:color .2s ease;position:relative;padding:4px 0}
.ss-nav-link:hover{color:var(--ss-text)}
.ss-nav-link::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:2px;background:var(--ss-akzent);transition:width .25s ease;border-radius:1px}
.ss-nav-link:hover::after{width:100%}
@media (max-width:860px){.ss-nav{display:none}}

/* ---------- Reduced Motion: Poster statt Canvas, keine Animationen ---------- */
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .ss-canvas{display:none}
  .ss-poster{opacity:1!important}
  .ss-loader,.ss-hint{display:none}
  .ss-hint{animation:none}
  .ss-scene{height:auto;min-height:100dvh}
  *{transition:none!important;animation:none!important}
}
`.trim()
}

/**
 * Light-Theme CSS für Scrub-Unterseiten.
 * Basiert auf dem Apple-Red-Software-System Design (adaptiert auf die Kunden-Akzentfarbe).
 * Weißer Canvas, weiße Cards, weiche Schatten, Inter Tight Font.
 */
export function scrubLightCss(design: ScrubDesign): string {
  const accent = design.akzent2 || '#0A7AFF' // Cyan-Akzent als Primärfarbe im Light-Modus
  const accentRgb = rgb(accent)
  return `
@import url("https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&display=swap");
:root{--sl-bg:#F5F6F8;--sl-card:#fff;--sl-text:#17181A;--sl-muted:#5F646D;--sl-accent:${accent};--sl-accent-soft:rgba(${accentRgb},.08);--sl-border:#E7E9ED;--sl-radius:16px}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--sl-bg);color:var(--sl-text);font-family:'Inter Tight',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;letter-spacing:-0.011em;-webkit-font-smoothing:antialiased}
section[id]{scroll-margin-top:80px}
img{display:block;max-width:100%}
a{color:var(--sl-accent);text-decoration:none}
a:hover{opacity:.85}

/* Header — light, solid */
.ss-kopf{position:fixed;top:0;left:0;right:0;z-index:50;background:rgba(255,255,255,.88);border-bottom:1px solid var(--sl-border);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px)}
.ss-kopf-inner{max-width:1200px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;gap:32px}
.ss-logo{font-size:18px;font-weight:800;letter-spacing:-0.02em;color:var(--sl-text);white-space:nowrap}
.ss-kopf-rechts{display:flex;align-items:center;gap:16px}

/* Nav */
.ss-nav{display:flex;gap:28px;align-items:center}
.ss-nav-link{font-size:14px;font-weight:500;color:var(--sl-muted);transition:color .2s;padding:4px 0;position:relative}
.ss-nav-link:hover{color:var(--sl-text)}
.ss-nav-link::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:2px;background:var(--sl-accent);transition:width .25s;border-radius:1px}
.ss-nav-link:hover::after{width:100%}
.ss-nav-link svg{vertical-align:middle;margin-left:3px;opacity:.5;transition:transform .2s}
@media(max-width:860px){.ss-nav{display:none}}

/* Dropdown */
.ss-nav-dropdown{position:relative}
.ss-nav-dropdown-menu{display:none;position:absolute;top:100%;left:50%;transform:translateX(-50%);min-width:220px;padding:8px 0;margin-top:12px;background:var(--sl-card);border:1px solid var(--sl-border);border-radius:var(--sl-radius);box-shadow:0 12px 40px rgba(0,0,0,.1)}
.ss-nav-dropdown:hover .ss-nav-dropdown-menu{display:block}
.ss-nav-dropdown-menu a{display:block;padding:10px 20px;font-size:14px;color:var(--sl-muted);transition:color .15s,background .15s;white-space:nowrap}
.ss-nav-dropdown-menu a:hover{color:var(--sl-text);background:var(--sl-bg)}
.ss-nav-dropdown:hover .ss-nav-link svg{transform:rotate(180deg);opacity:1}

/* Burger */
.ss-burger{display:none;background:none;border:none;cursor:pointer;padding:8px;flex-direction:column;gap:5px;z-index:60}
.ss-burger span{display:block;width:22px;height:2px;background:var(--sl-text);border-radius:2px;transition:transform .25s,opacity .2s}
.ss-burger.ss-open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.ss-burger.ss-open span:nth-child(2){opacity:0}
.ss-burger.ss-open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
@media(max-width:860px){.ss-burger{display:flex}}

/* Mobile Menu */
.ss-mobile-menu{display:none;flex-direction:column;padding:16px 24px 24px;border-top:1px solid var(--sl-border);background:var(--sl-card)}
.ss-mobile-menu.ss-open{display:flex}
.ss-mobile-link{display:block;padding:12px 0;font-size:16px;font-weight:500;color:var(--sl-text);border-bottom:1px solid rgba(0,0,0,.04)}
.ss-mobile-sub{padding-left:20px;font-size:14px;color:var(--sl-muted);font-weight:400}

/* Buttons */
.ss-btn-primary{display:inline-block;background:var(--sl-accent);color:#fff;font-family:inherit;font-weight:600;font-size:15px;padding:13px 26px;border:none;border-radius:999px;cursor:pointer;box-shadow:0 2px 6px rgba(${accentRgb},.35),0 8px 20px rgba(${accentRgb},.2);transition:filter .18s,transform .1s;text-align:center;text-decoration:none}
.ss-btn-primary:hover{filter:brightness(.94);color:#fff}
.ss-btn-primary:active{transform:scale(.97)}
.ss-btn-kopf{font-size:13px;padding:9px 20px}
@media(max-width:860px){.ss-btn-kopf{display:none}}
.ss-btn-sekundaer{display:inline-block;padding:10px 20px;font-size:14px;font-weight:600;color:var(--sl-accent);border:1px solid rgba(${accentRgb},.25);border-radius:999px;text-decoration:none;transition:all .2s;margin-top:12px}
.ss-btn-sekundaer:hover{background:rgba(${accentRgb},.06);border-color:rgba(${accentRgb},.4)}

/* Pill Badge */
.ss-pill{display:inline-flex;background:var(--sl-accent-soft);color:var(--sl-accent);font-size:12px;font-weight:600;padding:6px 14px;border-radius:999px}

/* Page sections */
.ss-seite{padding:clamp(48px,8vw,96px) 24px 0}
.ss-seite-wrap{max-width:960px;margin:0 auto}
.ss-h2{margin:0 0 24px;font-size:28px;font-weight:800;letter-spacing:-0.03em;line-height:1.1}
.ss-title{margin:0 0 16px;font-size:clamp(32px,4vw,48px);font-weight:800;letter-spacing:-0.03em;line-height:1.05}
.ss-kicker{display:inline-flex;background:var(--sl-accent-soft);color:var(--sl-accent);font-size:12px;font-weight:600;padding:6px 14px;border-radius:999px;margin-bottom:16px}
.ss-body{margin:0;font-size:18px;line-height:1.5;color:var(--sl-muted);max-width:640px}
.ss-feld{width:100%;height:48px;border-radius:12px;border:1px solid var(--sl-border);padding:0 16px;font-size:15px;font-family:inherit;background:var(--sl-card);transition:border-color .15s,box-shadow .15s;color:var(--sl-text)}
.ss-feld:focus{border-color:var(--sl-accent);box-shadow:0 0 0 3px rgba(${accentRgb},.15);outline:none}
textarea.ss-feld{height:auto;min-height:120px;padding:14px 16px;resize:vertical}
.ss-check{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.5;color:var(--sl-muted);cursor:pointer}
.ss-check input{accent-color:var(--sl-accent);width:16px;height:16px;margin-top:2px}
.ss-form-erfolg{display:none;color:var(--sl-accent);font-weight:500}

/* Cards (white on gray canvas) */
.ss-benefit,.ss-stelle,.ss-stimme,.ss-fallstudie,.ss-leistung,.ss-projekt{background:var(--sl-card);border-radius:var(--sl-radius);box-shadow:0 1px 3px rgba(0,0,0,.06),0 8px 24px rgba(0,0,0,.05);padding:28px;transition:transform .22s,box-shadow .22s}
.ss-benefit:hover,.ss-stelle:hover,.ss-stimme:hover,.ss-fallstudie:hover,.ss-leistung:hover,.ss-projekt:hover{transform:translateY(-3px);box-shadow:0 4px 12px rgba(0,0,0,.08),0 16px 48px rgba(0,0,0,.08)}

/* Benefits grid */
.ss-benefits-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.ss-benefit-icon{font-size:28px;display:block;margin-bottom:14px}
.ss-benefit h3{margin:0 0 8px;font-size:17px;font-weight:700}
.ss-benefit p{margin:0;font-size:14px;line-height:1.6;color:var(--sl-muted)}

/* Stellen */
.ss-stellen-list{display:flex;flex-direction:column;gap:16px}
.ss-stelle-header{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.ss-stelle-meta{font-size:14px;color:var(--sl-muted)}
.ss-stelle h3{margin:0;font-size:17px;font-weight:700}
.ss-stelle p{margin:0 0 18px;font-size:15px;line-height:1.6;color:var(--sl-muted)}

/* Stimmen */
.ss-stimmen-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
.ss-stimme{position:relative;overflow:hidden}
.ss-stimme::before{content:'"';position:absolute;top:-10px;left:16px;font-size:100px;font-weight:900;opacity:.04;line-height:1;color:var(--sl-accent)}
.ss-stimme-text{margin:0 0 18px;font-size:16px;line-height:1.6;font-style:italic;position:relative;z-index:1}
.ss-stimme-autor{display:flex;align-items:center;gap:12px}
.ss-avatar{width:40px;height:40px;border-radius:50%;background:var(--sl-accent-soft);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0;color:var(--sl-accent)}
.ss-stimme-autor strong{font-size:14px}
.ss-stimme-autor small{color:var(--sl-muted);font-size:13px}

/* Fallstudien */
.ss-fallstudien-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
.ss-fallstudie h3{margin:8px 0;font-size:18px;font-weight:700}
.ss-fallstudie .ss-pill{font-size:11px;padding:4px 10px}
.ss-fallstudie p{margin:0 0 14px;font-size:14px;line-height:1.6;color:var(--sl-muted)}
.ss-ergebnis{font-size:14px;padding:14px 16px;border-radius:12px;background:var(--sl-accent-soft);border:1px solid rgba(${accentRgb},.15);color:var(--sl-accent);font-weight:500}

/* Projekte / Vorher-Nachher */
.ss-projekte-grid{display:grid;grid-template-columns:1fr;gap:24px}
.ss-projekt-header{margin-bottom:16px}
.ss-projekt-header h3{margin:0 0 4px;font-size:20px;font-weight:800;letter-spacing:-0.02em}
.ss-vorher-nachher{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
@media(max-width:640px){.ss-vorher-nachher{grid-template-columns:1fr}}
.ss-vn-block{padding:20px;border-radius:12px}
.ss-vn-vorher{background:#FEF2F2;border:1px solid #FECACA}
.ss-vn-nachher{background:rgba(${accentRgb},.06);border:1px solid rgba(${accentRgb},.15)}
.ss-vn-block .ss-pill{font-size:11px;padding:4px 10px}
.ss-vn-vorher .ss-pill{background:#FEE2E2;color:#DC2626}
.ss-vn-nachher .ss-pill{background:rgba(${accentRgb},.1);color:var(--sl-accent)}
.ss-vn-block p{margin:8px 0 0;font-size:14px;line-height:1.6;color:var(--sl-muted)}
.ss-kennzahlen{display:flex;gap:24px;flex-wrap:wrap;margin-top:16px;padding-top:16px;border-top:1px solid var(--sl-border)}
.ss-kz{text-align:center}
.ss-kz-wert{display:block;font-size:24px;font-weight:800;letter-spacing:-0.02em;color:var(--sl-accent)}
.ss-kz-label{font-size:12px;color:var(--sl-muted);text-transform:uppercase;letter-spacing:.05em}

/* Slider */
.ss-slider{position:relative;width:100%;aspect-ratio:16/9;border-radius:20px;overflow:hidden;cursor:col-resize;margin-bottom:16px;box-shadow:0 8px 32px rgba(0,0,0,.1);user-select:none;-webkit-user-select:none}
.ss-slider img{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none}
.ss-slider-nachher{position:absolute;inset:0}
.ss-slider-vorher{position:absolute;top:0;left:0;bottom:0;overflow:hidden;z-index:1}
.ss-slider-vorher img{display:block;height:100%;object-fit:cover}
.ss-slider-handle{position:absolute;top:0;bottom:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:translateX(-50%);touch-action:none}
.ss-slider-line{flex:1;width:2px;background:rgba(255,255,255,.9);border-radius:2px;box-shadow:0 0 6px rgba(0,0,0,.3)}
.ss-slider-knob{width:48px;height:48px;border-radius:50%;background:var(--sl-accent);color:#fff;display:flex;align-items:center;justify-content:center;gap:4px;font-size:14px;font-weight:700;box-shadow:0 4px 16px rgba(0,0,0,.25),0 0 0 3px rgba(255,255,255,.3);flex-shrink:0;margin:6px 0}
.ss-slider-label{position:absolute;bottom:14px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:6px 14px;border-radius:999px;z-index:3;pointer-events:none;background:rgba(255,255,255,.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:var(--sl-text)}
.ss-slider-label-v{left:14px}
.ss-slider-label-n{right:14px}

/* Leistungen */
.ss-leistungen-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.ss-leistung{position:relative;overflow:hidden}
.ss-leistung-nr{position:absolute;top:12px;right:16px;font-size:56px;font-weight:800;opacity:.06;line-height:1;color:var(--sl-accent)}
.ss-leistung-icon{font-size:28px;display:block;margin-bottom:14px}
.ss-leistung h3{margin:0 0 8px;font-size:17px;font-weight:700}
.ss-leistung p{margin:0;font-size:14px;line-height:1.6;color:var(--sl-muted)}

/* Pakete */
.ss-pakete-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;align-items:start}
.ss-paket{padding:28px;border-radius:var(--sl-radius);background:var(--sl-card);box-shadow:0 1px 3px rgba(0,0,0,.06),0 8px 24px rgba(0,0,0,.05);text-align:center;transition:transform .22s,box-shadow .22s;position:relative}
.ss-paket:hover{transform:translateY(-3px);box-shadow:0 4px 12px rgba(0,0,0,.08),0 16px 48px rgba(0,0,0,.08)}
.ss-paket-highlight{border:2px solid var(--sl-accent);box-shadow:0 4px 16px rgba(${accentRgb},.12)}
.ss-paket-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#fff;background:var(--sl-accent);padding:5px 16px;border-radius:999px;white-space:nowrap}
.ss-paket h3{margin:14px 0 6px;font-size:20px;font-weight:800}
.ss-paket-preis{margin-bottom:18px}
.ss-preis-zahl{font-size:clamp(32px,4vw,44px);font-weight:800;letter-spacing:-0.03em;color:var(--sl-accent)}
.ss-preis-intervall{font-size:15px;color:var(--sl-muted);margin-left:4px}
.ss-paket-features{list-style:none;padding:0;margin:0 0 20px;text-align:left}
.ss-paket-features li{padding:8px 0;font-size:14px;color:var(--sl-muted);border-bottom:1px solid rgba(0,0,0,.04)}
.ss-paket-features li::before{content:'✓ ';color:var(--sl-accent);font-weight:700}

/* Footer — light variant */
.ss-footer{background:var(--sl-text);color:#fff;padding:48px 24px 32px}
.ss-footer-inner{max-width:1200px;margin:0 auto;display:flex;flex-wrap:wrap;gap:32px;justify-content:space-between}
.ss-footer-col{display:flex;flex-direction:column;gap:8px;font-size:14px}
.ss-footer a{color:rgba(255,255,255,.7)}
.ss-footer a:hover{color:#fff}
.ss-footer-copy{max-width:1200px;margin:32px auto 0;padding-top:20px;border-top:1px solid rgba(255,255,255,.1);font-size:13px;color:rgba(255,255,255,.45)}

/* ========= Homepage: Stage / Scenes / Poster / Kontakt ========= */
/* Stage (Sticky-Canvas, Scrub-Modus) */
.ss-wrap{position:relative;isolation:isolate}
.ss-stage{position:sticky;top:0;height:100dvh;overflow:hidden;z-index:1}
.ss-canvas{position:absolute;inset:0;width:100%;height:100%}
.ss-poster{position:absolute;inset:0;z-index:1;background-size:cover;background-position:center;transition:opacity .5s}
.ss-poster.is-hidden{opacity:0;pointer-events:none}
.ss-poster .media{position:absolute;inset:0}
.ss-loader{position:absolute;left:50%;bottom:88px;transform:translateX(-50%);z-index:2;width:min(280px,60vw);transition:opacity .4s}
.ss-loader.is-hidden{opacity:0;pointer-events:none}
.ss-loader-bar{height:3px;border-radius:99px;background:rgba(0,0,0,.08);overflow:hidden}
.ss-loader-bar span{display:block;height:100%;width:0;border-radius:99px;background:var(--sl-accent);box-shadow:0 0 8px rgba(${accentRgb},.5);transition:width .2s}
.ss-progress{position:fixed;left:0;bottom:0;z-index:60;height:2px;width:100%;background:var(--sl-accent);transform:scaleX(0);transform-origin:0 50%;box-shadow:0 0 6px rgba(${accentRgb},.4)}
.ss-dots{position:fixed;right:18px;top:50%;transform:translateY(-50%);z-index:60;display:flex;flex-direction:column;gap:12px}
.ss-dots button{width:10px;height:10px;border-radius:50%;border:1px solid rgba(0,0,0,.2);background:transparent;cursor:pointer;padding:0;transition:background .2s,box-shadow .2s}
.ss-dots button.is-active{background:var(--sl-accent);border-color:var(--sl-accent);box-shadow:0 0 8px rgba(${accentRgb},.5)}
.ss-hint{position:absolute;left:50%;bottom:28px;transform:translateX(-50%);z-index:2;font-size:13px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--sl-muted);animation:ssHintFade 2.4s ease-in-out infinite;transition:opacity .4s}
.ss-hint.is-hidden{opacity:0}
@keyframes ssHintFade{0%,100%{opacity:.4;transform:translateX(-50%) translateY(0)}50%{opacity:1;transform:translateX(-50%) translateY(6px)}}

/* Story (Copy-Layer über Stage) */
.ss-story{position:relative;z-index:3;margin-top:-100dvh}
.ss-scene{height:calc(var(--ss-gewicht,1.5)*100dvh)}
.ss-scene-pin{position:sticky;top:0;min-height:100dvh;display:flex;align-items:center;padding:96px 6vw 64px;pointer-events:none}
.ss-scene[data-align="right"] .ss-scene-pin{justify-content:flex-end}
.ss-copy{position:relative;width:min(40rem,48vw);pointer-events:auto}
.ss-copy::before{content:'';position:absolute;inset:-56px -64px;z-index:-1;background:radial-gradient(closest-side,rgba(255,255,255,.82),rgba(255,255,255,0));border-radius:32px}
.ss-kicker{margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;display:inline-flex;background:var(--sl-accent-soft);color:var(--sl-accent);padding:6px 14px;border-radius:999px}
.ss-title{margin:0 0 16px;font-size:clamp(34px,4.6vw,60px);line-height:1.04;font-weight:800;letter-spacing:-0.02em;color:var(--sl-text)}
.ss-body{margin:0 0 20px;font-size:17px;line-height:1.6;color:var(--sl-muted);max-width:34rem}
.ss-tags{margin:0 0 24px;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:10px}
.ss-tags li{font-size:13px;font-weight:600;padding:7px 14px;border-radius:999px;border:1px solid rgba(${accentRgb},.25);color:var(--sl-accent);background:var(--sl-accent-soft)}
.ss-actions{display:flex;flex-wrap:wrap;gap:12px}

/* Statischer Poster-Modus (ohne Frames) */
.ss-statisch .ss-szene-poster{position:relative;min-height:100dvh;display:flex;align-items:center;padding:96px 6vw 64px;overflow:hidden}
.ss-statisch .ss-szene-poster .media{position:absolute;inset:0;z-index:0}
.ss-statisch .ss-szene-poster::after{content:'';position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(255,255,255,.6),rgba(255,255,255,.25) 40%,rgba(255,255,255,.8))}
.ss-statisch .ss-szene-poster .ss-copy{z-index:2}
.ss-statisch .ss-szene-poster[data-align="right"]{justify-content:flex-end}

/* Kontakt */
.ss-kontakt{padding:96px 6vw;background:var(--sl-bg)}
.ss-kontakt-karte{max-width:640px;margin:0 auto;background:var(--sl-card);border:1px solid var(--sl-border);border-radius:24px;padding:40px;box-shadow:0 8px 40px rgba(0,0,0,.06)}
.ss-kontakt h2{margin:0 0 12px;font-size:clamp(28px,3.4vw,42px);line-height:1.08;font-weight:800;letter-spacing:-0.02em}
.ss-kontakt-lead{margin:0 0 24px;font-size:16px;line-height:1.6;color:var(--sl-muted)}
.ss-kontakt form{display:grid;gap:12px}

/* Footer */
.ss-fuss{padding:48px 6vw 40px;border-top:1px solid var(--sl-border);color:var(--sl-muted);font-size:14px;background:var(--sl-bg)}
.ss-fuss-inner{max-width:1200px;margin:0 auto;display:flex;flex-wrap:wrap;gap:24px;justify-content:space-between;align-items:flex-start}
.ss-fuss-beschreibung{max-width:44rem;margin:8px 0 0;line-height:1.6}
.ss-fuss nav{display:flex;gap:20px}
.ss-fuss a:hover{color:var(--sl-text)}

/* Demo-Ribbon */
.ss-ribbon{position:fixed;top:14px;right:-38px;z-index:70;transform:rotate(45deg);background:var(--sl-accent);color:#fff;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;padding:6px 44px;box-shadow:0 4px 14px rgba(0,0,0,.2);pointer-events:none}

/* Media Slots */
.media{position:relative;overflow:hidden;background:linear-gradient(135deg,rgba(${accentRgb},.06),rgba(${accentRgb},.03))}
.media::before{content:attr(data-label);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:16px;text-align:center;font-size:13px;font-weight:600;color:var(--sl-muted);opacity:.7}
.media img{width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .5s}
.media.loaded img{opacity:1}

/* Responsive */
@media(max-width:860px){
  .ss-scene-pin,.ss-statisch .ss-szene-poster{align-items:flex-end;padding:0 20px 72px}
  .ss-scene[data-align="right"] .ss-scene-pin,.ss-statisch .ss-szene-poster[data-align="right"]{justify-content:flex-start}
  .ss-copy{width:100%}
  .ss-copy::before{inset:-32px -20px;background:linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,.85) 30%)}
  .ss-dots{right:10px}
  .ss-kontakt-karte{padding:28px 20px}
}

@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.ss-canvas{display:none}.ss-poster{opacity:1!important}.ss-loader,.ss-hint{display:none}.ss-scene{height:auto;min-height:100dvh}*{transition:none!important;animation:none!important}}
`.trim()
}
