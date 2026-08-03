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

/* ---------- Header (schlank, Glas auf Dunkel) ---------- */
.ss-kopf{position:fixed;top:0;left:0;right:0;z-index:50;background:linear-gradient(180deg,rgba(${basisRgb},.85),rgba(${basisRgb},0));-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.ss-kopf-inner{max-width:1200px;margin:0 auto;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;gap:24px}
.ss-logo{font-size:20px;font-weight:800;letter-spacing:-0.02em}
.ss-logo em{font-style:normal;color:var(--ss-akzent)}

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

/* Leistungen */
.ss-leistungen-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.ss-leistung{position:relative;overflow:hidden}
.ss-leistung-nr{position:absolute;top:12px;right:16px;font-size:56px;font-weight:900;opacity:.04;line-height:1;background:linear-gradient(180deg,rgba(${a1},.15),transparent);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.ss-leistung-icon{font-size:32px;display:block;margin-bottom:16px;filter:drop-shadow(0 0 12px rgba(${a2},.3))}
.ss-leistung h3{margin:0 0 10px;font-size:18px;font-weight:700}
.ss-leistung p{margin:0;font-size:14px;line-height:1.7;color:var(--ss-muted)}

/* Nav-Links in Header */
.ss-nav{display:flex;gap:28px;align-items:center}
.ss-nav a{font-size:14px;font-weight:500;color:var(--ss-muted);transition:color .2s ease;position:relative}
.ss-nav a:hover{color:var(--ss-text)}
.ss-nav a::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:2px;background:var(--ss-akzent);transition:width .25s ease;border-radius:1px}
.ss-nav a:hover::after{width:100%}
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
