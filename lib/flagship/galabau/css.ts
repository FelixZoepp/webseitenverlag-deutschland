/**
 * Auftrag T1.1/T1.2/T1.3 — CSS der Komposition „galabau-landing-v1".
 *
 * Pixelnaher Port der Inline-Styles aus GalabauLanding.dc.html auf Klassen;
 * alle Grün-/Ink-Werte über das Token-Layer (themes/galabau.ts).
 * Font: Inter Tight self-hosted (public/fonts/inter-tight/, OFL) —
 * SF Pro Display bewusst NICHT (Apple-Lizenz, siehe LEGACY_NOTIZEN.md).
 * Animationen ausschließlich transform/opacity; prefers-reduced-motion
 * schaltet alles ab.
 */

import { GALABAU_THEME, themeAlsCssVars, type KompositionTheme } from '../themes/galabau'

export function galabauCss(theme: KompositionTheme = GALABAU_THEME): string {
  return `
@font-face{font-family:'Inter Tight';font-style:normal;font-weight:100 900;font-display:swap;src:url('/fonts/inter-tight/InterTight-latin-ext.woff2') format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:'Inter Tight';font-style:normal;font-weight:100 900;font-display:swap;src:url('/fonts/inter-tight/InterTight-latin.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}

:root{${themeAlsCssVars(theme)}}
*{box-sizing:border-box}
html{scroll-behavior:smooth;overflow-x:hidden;overflow-x:clip}
body{margin:0;background:var(--bg);color:var(--ink);font-family:'Inter Tight',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;letter-spacing:-0.011em;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-x:clip}
section[id]{scroll-margin-top:84px}
img{display:block;max-width:100%}
a{color:inherit;text-decoration:none}

@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes kenburns{from{transform:scale(1)}to{transform:scale(1.05)}}

/* Media-Slots: gestalteter Platzhalter bis das Asset lädt */
.media{position:relative;overflow:hidden;background:linear-gradient(135deg,var(--accent-soft),var(--accent-pale))}
.media::before{content:attr(data-label);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:16px;text-align:center;font-size:13px;font-weight:600;color:var(--accent-ink);opacity:.85}
.media img{width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .5s ease}
.media.loaded img{opacity:1}
.media.loaded::before{content:none}

/* ---------- Header (Scroll-State: transparent → Glas) ---------- */
.kopf{position:fixed;top:0;left:0;right:0;z-index:50;color:#fff;background:transparent;transition:background .2s ease,box-shadow .2s ease,color .2s ease}
.kopf.is-scrolled{color:var(--ink);background:rgba(255,255,255,.78);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);box-shadow:0 1px 0 rgba(var(--ink-rgb),.06),0 8px 24px rgba(var(--ink-rgb),.08)}
.kopf-inner{max-width:1200px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;gap:24px}
.logo{font-size:22px;font-weight:400;letter-spacing:-0.02em}
.logo b{font-weight:800}
.kopf nav{display:flex;gap:28px}
.kopf nav a{font-size:15px;font-weight:500}

/* ---------- Buttons ---------- */
.btn-gruen{display:inline-block;background:linear-gradient(180deg,var(--grad-start),var(--grad-end));color:#fff;font-family:inherit;font-weight:600;font-size:14px;padding:11px 20px;border:none;border-radius:999px;cursor:pointer;box-shadow:0 2px 6px rgba(var(--accent-rgb),.35),0 8px 20px rgba(var(--accent-rgb),.25);transition:filter .2s ease,transform .1s ease;text-align:center}
.btn-gruen:hover{filter:brightness(.94)}
.btn-gruen:active{transform:scale(.97)}
.btn-gross{padding:16px 28px;font-size:16px;box-shadow:0 2px 6px rgba(var(--accent-rgb),.4),0 10px 28px rgba(var(--accent-rgb),.3)}
.btn-glas{display:inline-block;padding:16px 28px;border-radius:999px;background:rgba(255,255,255,.16);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.28);color:#fff;font-weight:600;font-size:16px;transition:background .2s ease}
.btn-glas:hover{background:rgba(255,255,255,.24)}

/* ---------- Hero ---------- */
.hero{position:relative;height:100vh;min-height:640px;display:flex;align-items:center;overflow:hidden}
.hero-bg{position:absolute;inset:0}
.hero-bg .media{position:absolute;inset:0}
.hero-bg .media.kenburns,.hero-bg video.kenburns{animation:kenburns 12s ease-out both}
.hero-bg video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(var(--shade-rgb),.78),rgba(var(--shade-rgb),.42) 55%,rgba(var(--shade-rgb),.05))}
.hero-inner{position:relative;width:100%;max-width:1200px;margin:0 auto;padding:0 24px}
.hero-inhalt{max-width:660px;display:flex;flex-direction:column;align-items:flex-start;gap:24px}
.hero-badge{display:inline-flex;background:rgba(255,255,255,.14);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.25);border-radius:999px;color:#fff;font-size:13px;font-weight:600;padding:8px 16px}
.hero h1{margin:0;font-size:clamp(40px,5vw,64px);font-weight:800;letter-spacing:-0.03em;line-height:1.05;color:#fff}
.hero h1 span{display:inline-block;animation:fadeUp .6s both}
.hero-lead{margin:0;font-size:18px;line-height:1.5;color:rgba(255,255,255,.88);max-width:560px}
.hero-ctas{display:flex;flex-wrap:wrap;align-items:center;gap:14px}
.hero-karte{position:absolute;right:clamp(16px,4vw,64px);bottom:clamp(24px,6vh,64px);max-width:340px;background:rgba(255,255,255,.88);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);border-radius:20px;padding:20px 22px;box-shadow:0 12px 40px rgba(var(--shade-rgb),.25);animation:floaty 6s ease-in-out infinite}
.hero-karte .sterne{color:var(--star);font-size:16px;letter-spacing:2px}
.hero-karte p{margin:10px 0 8px;font-size:14px;line-height:1.5;color:var(--ink)}
.hero-karte .name{font-size:13px;font-weight:600;color:var(--ink-soft)}

/* ---------- Sektionen ---------- */
.sektion{padding:clamp(64px,10vw,128px) 24px 0}
.sektion-kontakt{padding-bottom:clamp(64px,10vw,128px)}
.inhalt{max-width:1080px;margin:0 auto}
.pill{display:inline-block;background:var(--accent-soft);color:var(--accent-ink);font-size:12px;font-weight:600;padding:6px 14px;border-radius:999px}
.sektion h2{margin:14px 0 0;font-size:32px;font-weight:800;letter-spacing:-0.02em;line-height:1.15}
.sektion-lead{margin:12px 0 0;font-size:18px;color:var(--ink-soft)}
.sektion-kopf{text-align:center;max-width:640px;margin:0 auto}

/* Reveals (JS setzt .sichtbar; ohne JS bleibt alles sichtbar) */
html.js .rv{opacity:0;transform:translateY(24px);transition:opacity .6s cubic-bezier(.22,.61,.36,1),transform .6s cubic-bezier(.22,.61,.36,1)}
html.js .rv.sichtbar{opacity:1;transform:none}

/* ---------- Über ---------- */
.split{display:grid;grid-template-columns:1.1fr .9fr;gap:32px;align-items:center}
.ueber-karte{position:relative;background:#fff;border-radius:24px;box-shadow:0 8px 40px rgba(var(--ink-rgb),.08);padding:clamp(36px,4vw,56px)}
.zitat-badge{position:absolute;top:-18px;left:32px;width:44px;height:44px;border-radius:50%;background:var(--accent-deep);color:#fff;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:800;box-shadow:0 6px 16px rgba(var(--deep-rgb),.35)}
.ueber-karte blockquote{margin:18px 0 0;font-size:32px;font-weight:800;letter-spacing:-0.03em;line-height:1.15}
.ueber-karte .wer{margin-top:18px;font-size:15px;color:var(--ink-soft)}
.ueber-karte .wer b{color:var(--ink)}
.ueber-bild{aspect-ratio:4/3;border-radius:24px}

/* ---------- Leistungen (Sticky-Stack) ---------- */
.stack{display:flex;flex-direction:column;gap:24px;max-width:1080px;margin:48px auto 0}
.svc{position:sticky;background:#fff;border-radius:24px;box-shadow:0 8px 40px rgba(var(--ink-rgb),.08);padding:clamp(28px,4vw,48px);overflow:hidden}
.svc .nr{position:absolute;top:20px;right:32px;font-size:72px;font-weight:800;line-height:1;color:var(--accent-pale)}
.svc-grid{position:relative;display:grid;grid-template-columns:1.05fr .95fr;gap:32px;align-items:center}
.svc-meta{display:flex;align-items:center;gap:10px}
.svc-meta .name{font-size:15px;font-weight:600;color:var(--accent-ink)}
.svc h3{margin:12px 0 0;font-size:32px;font-weight:800;letter-spacing:-0.02em}
.svc p{margin:12px 0 0;font-size:15px;line-height:1.6;color:var(--ink-soft);max-width:440px}
.svc-bild{aspect-ratio:4/3;border-radius:20px;box-shadow:0 12px 32px rgba(var(--ink-rgb),.12)}

/* ---------- Warum ---------- */
.cols3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px}
.warum-karte{position:relative;aspect-ratio:4/5;border-radius:20px;overflow:hidden;transition:transform .3s ease,box-shadow .3s ease}
.warum-karte:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(var(--shade-rgb),.25)}
.warum-karte .media{position:absolute;inset:0}
.warum-karte .media img{transition:transform .4s ease,opacity .5s ease}
.warum-karte:hover .media img{transform:scale(1.03)}
.warum-text{position:absolute;left:0;right:0;bottom:0;padding:64px 22px 20px;background:linear-gradient(0deg,rgba(var(--shade-rgb),.85),transparent)}
.warum-text h3{margin:0;font-size:18px;font-weight:700;color:#fff}
.warum-text p{margin:6px 0 0;font-size:15px;line-height:1.5;color:rgba(255,255,255,.85)}

/* ---------- Referenzen (BA-Slider + KPIs) ---------- */
.ba{position:relative;max-width:960px;margin:48px auto 0;aspect-ratio:16/9;border-radius:24px;overflow:hidden;box-shadow:0 16px 56px rgba(var(--ink-rgb),.16);cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}
.ba:active{cursor:grabbing}
.ba .media{position:absolute;inset:0}
.ba-vorher{clip-path:inset(0 50% 0 0)}
.ba-tag{position:absolute;top:16px;z-index:2;background:rgba(255,255,255,.85);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-radius:999px;padding:6px 14px;font-size:12px;font-weight:700;letter-spacing:.06em}
.ba-tag.vorher{left:16px}
.ba-tag.nachher{right:16px}
.ba-teiler{position:absolute;top:0;bottom:0;left:50%;width:2px;background:#fff;z-index:2}
.ba-griff{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:3;width:48px;height:48px;border-radius:50%;background:var(--accent-deep);color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;letter-spacing:2px;box-shadow:0 6px 20px rgba(var(--shade-rgb),.35)}
.ba-caption{max-width:960px;margin:16px auto 0;text-align:center;font-size:14px;color:var(--ink-faint)}
.kpis{display:flex;flex-wrap:wrap;justify-content:center;gap:clamp(28px,5vw,64px);margin-top:48px;text-align:center}
.kpi .wert{font-size:32px;font-weight:800}
.kpi .label{margin-top:4px;font-size:15px;color:var(--ink-soft)}

/* ---------- Team ---------- */
.team-karte{position:relative;aspect-ratio:3/4;border-radius:20px;overflow:hidden;transition:transform .3s ease,box-shadow .3s ease}
.team-karte:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(var(--shade-rgb),.25)}
.team-karte .media{position:absolute;inset:0}
.team-name{position:absolute;left:12px;right:12px;bottom:12px;background:rgba(255,255,255,.88);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);border-radius:14px;padding:12px 16px}
.team-name .name{font-size:15px;font-weight:700}
.team-name .rolle{display:inline-block;margin-top:6px;background:var(--accent-soft);color:var(--accent-ink);border-radius:999px;padding:4px 12px;font-size:12px;font-weight:600}

/* ---------- CTA-Band ---------- */
.cta-band{max-width:960px;margin:0 auto;background:#fff;border-radius:28px;box-shadow:0 16px 56px rgba(var(--ink-rgb),.1);padding:clamp(48px,7vw,80px) clamp(24px,5vw,64px);display:flex;flex-direction:column;align-items:center;text-align:center;gap:20px}
.cta-band h2{margin:0;font-size:32px;font-weight:800;line-height:1.15;max-width:680px}
.avatare{display:flex}
.avatar{width:44px;height:44px;border-radius:50%;border:2px solid #fff;margin-left:-10px;overflow:hidden}
.avatar:first-child{margin-left:0}
.avatar.media::before{font-size:10px;padding:0}

/* ---------- FAQ ---------- */
.faq-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;margin-top:48px}
.faq-spalte{display:flex;flex-direction:column;gap:20px}
.faq-item{background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(var(--ink-rgb),.06)}
.faq-frage{all:unset;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;padding:20px 24px;font-size:16px;font-weight:600;cursor:pointer}
.faq-icon{flex:none;width:32px;height:32px;border-radius:50%;background:var(--accent-deep);color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;transition:transform .3s ease}
.faq-item.offen .faq-icon{transform:rotate(45deg)}
.faq-antwort{display:grid;grid-template-rows:0fr;transition:grid-template-rows .3s ease}
.faq-item.offen .faq-antwort{grid-template-rows:1fr}
.faq-antwort>div{overflow:hidden}
.faq-antwort p{margin:0;padding:0 24px 20px;font-size:15px;line-height:1.6;color:var(--ink-soft)}

/* ---------- Kontakt ---------- */
.kontakt-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:32px;align-items:stretch}
.kontakt-karte{background:#fff;border-radius:24px;box-shadow:0 8px 40px rgba(var(--ink-rgb),.08);padding:clamp(28px,4vw,48px)}
.kontakt-karte form{margin-top:24px;display:flex;flex-direction:column;gap:14px}
.feld{width:100%;height:48px;border-radius:12px;border:1px solid var(--line);background:#fff;color:var(--ink);font-family:inherit;font-size:15px;padding:0 16px}
textarea.feld{height:auto;min-height:120px;padding:14px 16px;resize:vertical}
.feld:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(var(--accent-rgb),.18);outline:none}
.check-zeile{display:flex;align-items:flex-start;gap:10px;font-size:13px;line-height:1.5;color:var(--ink-soft)}
.check-zeile input{accent-color:var(--accent);margin:2px 0 0}
.check-zeile a{color:var(--accent-ink);font-weight:600}
.kontakt-karte .btn-gruen{margin-top:6px;padding:15px 28px;font-size:15px;align-self:flex-start}
.form-erfolg{display:none;margin:10px 0 0;font-size:15px;font-weight:600;color:var(--accent-ink)}
.kontakt-bild{border-radius:24px;min-height:420px}

/* ---------- Footer ---------- */
.fuss{margin-top:clamp(64px,10vw,128px);background:var(--footer);color:#fff;padding:64px 24px 40px}
.fuss-inner{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1.4fr .8fr .8fr;gap:32px;align-items:start}
.fuss .logo{color:#fff}
.fuss p{margin:14px 0 0;font-size:15px;line-height:1.6;color:rgba(255,255,255,.65);max-width:340px}
.fuss-spalte{display:flex;flex-direction:column;gap:10px}
.fuss-spalte a{font-size:15px;color:rgba(255,255,255,.75)}
.fuss-bottom{max-width:1080px;margin:40px auto 0;padding-top:20px;border-top:1px solid rgba(255,255,255,.12);font-size:13px;color:rgba(255,255,255,.5)}

/* ---------- Demo-Ribbon ---------- */
.demo-band{position:fixed;left:0;right:0;bottom:0;z-index:60;background:var(--ink);color:#fff;text-align:center;font-size:13px;font-weight:600;padding:10px 16px}
.demo-band a{color:var(--accent-2);font-weight:700}

/* ---------- Mobile ≤900px ---------- */
@media (max-width:900px){
  .kopf nav{display:none}
  .split,.cols3,.kontakt-grid,.svc-grid,.faq-grid{grid-template-columns:1fr}
  .stack .svc{position:relative;top:0 !important}
  .hero-karte{display:none}
  .fuss-inner{grid-template-columns:1fr}
  .svc .nr{font-size:56px;right:24px}
}

/* ---------- Reduced Motion: alles aus ---------- */
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  [data-anim]{animation:none !important}
  .hero h1 span{animation:none}
  .hero-karte{animation:none}
  html.js .rv{opacity:1;transform:none;transition:none}
  .warum-karte,.team-karte,.warum-karte .media img,.faq-icon,.faq-antwort,.btn-gruen,.btn-glas,.kopf{transition:none}
}
`.trim()
}
