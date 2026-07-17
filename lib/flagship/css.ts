/**
 * Flagship-Engine: CSS-Generator.
 * Erzeugt das komplette Stylesheet aus den Design-Tokens (BF §1.3).
 * Quelle: flagship_reinigung.html (hell) + flagship_restaurant.html (dunkel),
 * parametrisiert statt kopiert — beide Referenzen sind 1:1 reproduzierbar.
 */

import type { FlagshipDesign } from './types'

/** #RRGGBB → "r,g,b" für rgba()-Ableitungen (tolerant bei Nicht-Hex) */
function rgb(hex: string): string {
  const m = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(hex.trim())
  if (!m) return '17,17,17'
  const h = m[1]
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(v, 16)
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
}

export function flagshipCss(design: FlagshipDesign, opts?: { premiumAnimationen?: boolean }): string {
  const t = design.tokens
  const hell = design.typo_modus === 'sans_bold_hell'
  const wisch = design.typo_signature === 'wisch_highlight'

  const r = design.radius || (hell ? '18px' : '16px')
  const w = design.breite || (hell ? '1160px' : '1140px')
  const shadow = design.schatten || (hell
    ? `0 20px 50px -20px rgba(${rgb(t.text)},.25)`
    : '0 26px 60px -24px rgba(0,0,0,.7)')

  const sans = `-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif`
  const serif = `Georgia,'Times New Roman',serif`
  const headFont = hell ? 'var(--sans)' : 'var(--serif)'

  // Dunklere Tiefe für Signature-/Conversion-Flächen
  const tiefe = hell ? t.text : `color-mix(in srgb, ${t.basis} 62%, #000)`
  // Karten-/Formular-Flächen
  const flaeche = hell ? '#fff' : t.panel

  // Platzhalter-Verlauf für fehlende Assets
  const platzhalter = hell
    ? `linear-gradient(160deg, color-mix(in srgb, ${t.text} 92%, ${t.akzent2}) 0%, color-mix(in srgb, ${t.text} 72%, ${t.akzent2}) 46%, ${t.akzent2} 130%)`
    : `linear-gradient(155deg, color-mix(in srgb, ${t.panel} 78%, #000) 0%, color-mix(in srgb, ${t.panel} 88%, ${t.akzent2}) 55%, color-mix(in srgb, ${t.panel} 55%, ${t.akzent2}) 130%)`

  // Typo-Signature (.hl)
  const hlCss = wisch
    ? `.hl{font-style:italic;position:relative;white-space:nowrap;
  background:linear-gradient(104deg,transparent .5em,var(--ak1) .5em) no-repeat;
  background-size:0% 74%;background-position:0 88%;
  transition:background-size 1.2s cubic-bezier(.22,1,.36,1) .3s}
.in .hl,.hl.on{background-size:100% 74%}`
    : `.hl{font-style:italic;color:var(--text);
  background:linear-gradient(var(--ak2),var(--ak2)) no-repeat left 96%/0% 2px;
  transition:background-size 1.2s cubic-bezier(.22,1,.36,1) .3s;padding-bottom:2px}
.in .hl,.hl.on{background-size:100% 2px}`
  const hlReduced = wisch ? '.hl{background-size:100% 74%}' : '.hl{background-size:100% 2px}'

  return `
:root{
  --basis:${t.basis};--panel:${t.panel};--text:${t.text};--soft:${t.text_soft};
  --ak1:${t.akzent1};--ak1d:${t.akzent1_tief};--ak2:${t.akzent2};--line:${t.line};
  --tiefe:${tiefe};--flaeche:${flaeche};
  --shadow:${shadow};--r:${r};--w:${w};
  --ak1-soft:rgba(${rgb(t.akzent1)},.12);--ak2-soft:rgba(${rgb(t.akzent2)},.12);
  --glow:0 0 40px rgba(${rgb(t.akzent1)},.2);
  --sans:${sans};--serif:${serif};
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:var(--sans);background:var(--basis);color:var(--text);line-height:${hell ? '1.6' : '1.65'};-webkit-font-smoothing:antialiased;overflow-x:hidden}
::selection{background:var(--ak1);color:${hell ? 'var(--text)' : 'var(--basis)'}}
img{display:block;max-width:100%}
a{color:inherit;text-decoration:none}
.wrap{max-width:var(--w);margin:0 auto;padding:0 24px}
section{padding:${hell ? '104px' : '110px'} 0}
@media(max-width:760px){section{padding:${hell ? '72px' : '76px'} 0}}

h1,h2,h3{font-family:${headFont};${hell ? 'letter-spacing:-.03em;line-height:1.06;font-weight:800' : 'font-weight:600;letter-spacing:.005em;line-height:1.08'}}
h1{font-size:clamp(${hell ? '2.6rem,6vw,4.4rem' : '2.7rem,6vw,4.6rem'})}
h2{font-size:clamp(${hell ? '2rem,4.2vw,3rem' : '2rem,4.2vw,3.1rem'});text-wrap:balance}
h3{font-size:${hell ? '1.16rem;letter-spacing:-.01em' : '1.28rem'}}
.eyebrow{display:inline-flex;align-items:center;gap:${hell ? '8px' : '10px'};font-size:${hell ? '.78rem' : '.76rem'};font-weight:700;letter-spacing:${hell ? '.14em' : '.22em'};text-transform:uppercase;color:${hell ? 'var(--soft)' : 'var(--ak2)'};margin-bottom:${hell ? '18px' : '20px'}}
.eyebrow::before{content:"";width:${hell ? `8px;height:8px;border-radius:50%;background:var(--ak1);box-shadow:0 0 12px rgba(${rgb(t.akzent1)},.4)` : '26px;height:1px;background:var(--ak2)'}}
.lead{font-size:${hell ? '1.14rem' : '1.12rem'};color:var(--soft);max-width:56ch;text-wrap:balance}

${hlCss}

nav{position:fixed;inset:0 0 auto 0;z-index:60;transition:padding .3s,background .3s,box-shadow .3s;padding:${hell ? '18px' : '20px'} 0}
nav .wrap{display:flex;align-items:center;gap:${hell ? '32px' : '30px'}}
nav.scrolled{background:rgba(${rgb(t.basis)},${hell ? '.86' : '.88'});backdrop-filter:blur(14px);box-shadow:0 1px 0 var(--line);padding:${hell ? '12px' : '13px'} 0}
.logo{${hell
    ? 'font-size:1.28rem;font-weight:800;letter-spacing:-.03em;display:flex;align-items:center;gap:2px'
    : 'font-family:var(--serif);font-size:1.35rem;letter-spacing:.14em;font-weight:600'}}
${hell
    ? '.logo i{width:9px;height:9px;background:var(--ak1);border-radius:50%;display:inline-block;margin:10px 0 0 3px}'
    : '.logo b{color:var(--ak1);font-weight:600}'}
.navlinks{display:flex;gap:26px;margin-left:auto;font-size:${hell ? '.92rem' : '.9rem'};font-weight:600}
.navlinks a{opacity:${hell ? '.75' : '.7'};transition:.2s}.navlinks a:hover{opacity:1}
@media(max-width:900px){.navlinks{display:none}}
.btn{display:inline-flex;align-items:center;gap:10px;${hell
    ? 'background:var(--text);color:#fff;box-shadow:var(--shadow)'
    : `background:var(--ak1);color:var(--text);box-shadow:0 18px 44px -18px rgba(${rgb(t.akzent1)},.6)`};font-weight:700;font-size:.95rem;padding:${hell ? '14px 24px' : '15px 26px'};border-radius:100px;border:0;cursor:pointer;transition:.25s;position:relative;overflow:hidden}
.btn::before{content:"";position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);animation:shimmer 3s infinite;pointer-events:none}
@keyframes shimmer{0%{left:-100%}100%{left:200%}}
.btn:hover{transform:translateY(-2px);background:${hell ? 'color-mix(in srgb, var(--text) 90%, #4FD8CB)' : 'var(--ak1d)'}}
.btn .arr{transition:.25s}.btn:hover .arr{transform:translateX(4px)}
.btn.sun{background:var(--ak1);color:${hell ? 'var(--text)' : 'var(--text)'};box-shadow:0 16px 40px -16px rgba(${rgb(t.akzent1_tief)},.55)}
.btn.sun:hover{background:var(--ak1d)}
.btn.ghost{background:transparent;color:var(--text);box-shadow:inset 0 0 0 ${hell ? '2px var(--line)' : '1.5px var(--line)'}}
.btn.ghost:hover{box-shadow:inset 0 0 0 ${hell ? '2px' : '1.5px'} var(--text)}
nav .btn{padding:11px 20px;font-size:${hell ? '.88rem' : '.87rem'};${hell ? 'margin-left:8px' : ''}}

.hero{padding:${hell ? '180px 0 96px' : '190px 0 100px'};position:relative}
.hero::before{content:"";position:absolute;top:${hell ? '-30%;right:-16%;width:60vw;height:60vw;max-width:820px;max-height:820px' : '-20%;left:-14%;width:56vw;height:56vw;max-width:760px;max-height:760px'};
  background:radial-gradient(closest-side,rgba(${rgb(t.akzent2)},${hell ? '.14' : '.10'}),transparent 70%);pointer-events:none}
.hero::after{content:"";position:absolute;bottom:-30%;left:50%;width:80vw;height:40vw;max-width:900px;max-height:500px;background:radial-gradient(closest-side,rgba(${rgb(t.akzent2)},.08),transparent 70%);pointer-events:none}
.hero .wrap{display:grid;grid-template-columns:${hell ? '1.08fr .92fr' : '1.05fr .95fr'};gap:64px;align-items:center;position:relative}
@media(max-width:900px){.hero .wrap{grid-template-columns:1fr}.hero{padding-top:${hell ? '130px' : '140px'}}}
.hero h1{margin-bottom:${hell ? '22px' : '24px'}}
.hero .lead{margin-bottom:${hell ? '34px' : '36px'}}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:34px}
.chips{display:flex;gap:${hell ? '10px 22px' : '12px 24px'};flex-wrap:wrap;font-size:.9rem;font-weight:600;color:var(--soft)}
.chips span{display:inline-flex;align-items:center;gap:${hell ? '8px' : '9px'}}
.chips svg{width:17px;height:17px;color:var(--ak2)}
.chips i{width:5px;height:5px;border-radius:50%;background:var(--ak2);display:inline-block}
.tex{position:relative}.tex::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.4;background-image:repeating-linear-gradient(115deg,transparent 0 26px,rgba(${rgb(t.text)},.03) 26px 27px)}

.hero-media{position:relative}
.frame{position:relative;border-radius:${hell ? '26px' : '20px'};overflow:hidden;box-shadow:var(--shadow);aspect-ratio:3/4;${hell ? 'background:var(--panel)' : 'border:1px solid var(--line)'}}
.frame img{width:100%;height:100%;object-fit:cover}
.stat-card{position:absolute;background:${hell ? '#fff' : 'var(--panel);border:1px solid var(--line)'};border-radius:${hell ? '16px' : '14px'};padding:${hell ? '16px 20px' : '15px 20px'};box-shadow:var(--shadow);animation:float ${hell ? '5s' : '5.5s'} ease-in-out infinite}
.stat-card b{${hell ? 'font-size:1.5rem;letter-spacing:-.03em' : 'font-family:var(--serif);font-size:1.45rem;color:var(--ak2)'};display:block;line-height:1.1}
.stat-card small{font-size:${hell ? '.78rem' : '.76rem'};color:var(--soft);font-weight:600}
.sc1{left:${hell ? '-34px;bottom:52px' : '-30px;bottom:56px'}}
.sc2{right:${hell ? '-24px;top:44px;animation-delay:-2.5s' : '-22px;top:48px;animation-delay:-2.6s'}}
@media(max-width:900px){.sc1{left:10px}.sc2{right:10px}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(${hell ? '-10px' : '-9px'})}}
.scroll-hint{position:absolute;bottom:28px;left:50%;transform:translateX(-50%);color:var(--soft);font-size:.78rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;display:flex;flex-direction:column;align-items:center;gap:8px;opacity:.6;transition:opacity .3s}
.scroll-hint svg{width:16px;height:16px;animation:bob 1.6s ease-in-out infinite}
nav.scrolled~header .scroll-hint,nav.scrolled~.hero .scroll-hint{opacity:0}

/* Video-Hero (Growth-Level) */
.vhero{position:relative;min-height:100vh;display:flex;align-items:center;padding:150px 0 100px;overflow:hidden}
.vhero video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
.vshade{position:absolute;inset:0;z-index:1;pointer-events:none;
  background:linear-gradient(90deg,var(--basis) 0%,rgba(${rgb(t.basis)},.95) 30%,rgba(${rgb(t.basis)},.7) 50%,rgba(${rgb(t.basis)},.15) 70%,rgba(${rgb(t.basis)},0) 85%)}
.vshade::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(${rgb(t.basis)},.6),transparent 25%,transparent 75%,rgba(${rgb(t.basis)},.4))}
.vinner{position:relative;z-index:2;width:100%}
.vcard{position:absolute;right:44px;bottom:48px;z-index:2}
@media(max-width:860px){
  .vshade{background:linear-gradient(180deg,var(--basis) 0%,rgba(${rgb(t.basis)},.92) 30%,rgba(${rgb(t.basis)},.6) 55%,rgba(${rgb(t.basis)},.3) 100%)}
  .vcard{display:none}
  .vhero{min-height:92vh;padding-top:130px}
}
@media(prefers-reduced-motion:reduce){
  .vhero video{display:none}
}
.vplay{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:80px;height:80px;border-radius:50%;background:var(--ak1);border:none;cursor:pointer;display:grid;place-items:center;z-index:3;box-shadow:0 0 0 0 rgba(${rgb(t.akzent1)},.5);animation:vglow 2.5s ease-in-out infinite;transition:opacity .5s,transform .3s var(--spring,ease)}
.vplay:hover{transform:translate(-50%,-50%) scale(1.1)}
.vplay.hidden{opacity:0;pointer-events:none}
.vplay svg{width:28px;height:28px;fill:${hell ? 'var(--text)' : 'var(--basis)'};margin-left:3px}
@keyframes vglow{0%{box-shadow:0 0 0 0 rgba(${rgb(t.akzent1)},.5)}50%{box-shadow:0 0 0 20px rgba(${rgb(t.akzent1)},0)}100%{box-shadow:0 0 0 0 rgba(${rgb(t.akzent1)},0)}}
.vhero.scrub{min-height:200vh}
.vhero.scrub video{position:sticky;top:0;height:100vh;width:100%;object-fit:cover}
.vhero.scrub .vshade{position:sticky;top:0;height:100vh}
.vhero.scrub .vinner{position:sticky;top:0;height:100vh;display:flex;align-items:center}

.media{position:relative;background:${platzhalter}}
.media::before{content:"";position:absolute;inset:0;opacity:.5;background:repeating-linear-gradient(115deg,transparent 0 26px,rgba(${hell ? '255,255,255' : rgb(t.text)},.05) 26px 27px)}
.media::after{content:attr(data-label) "\\A Asset folgt · Higgsfield";white-space:pre;position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;color:rgba(${hell ? '255,255,255,.92' : rgb(t.text) + ',.85'});font-weight:700;font-size:${hell ? '.95rem' : '.92rem'};letter-spacing:.06em;line-height:2;padding:24px}
.media.loaded::before,.media.loaded::after{display:none}

.trust{border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:26px 0;background:var(--flaeche)}
.trust .wrap{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap}
.trust span{display:inline-flex;gap:10px;align-items:center;font-weight:700;font-size:${hell ? '.94rem' : '.93rem'}}
.trust svg{width:20px;height:20px;color:var(--ak1d)}
.trust em{font-style:normal;color:var(--ak2)}

.empathie .wrap{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:${hell ? 'start' : 'center'}}
@media(max-width:860px){.empathie .wrap{grid-template-columns:1fr}}
.situations{display:grid;gap:14px;margin-top:6px}
.situations div{background:var(--flaeche);border:1px solid var(--line);border-radius:14px;padding:16px 20px;display:flex;gap:14px;align-items:center;font-weight:600;font-size:.98rem;transition:.25s}
.situations div:hover{transform:translateX(6px);border-color:var(--ak1)}
.situations svg{width:20px;height:20px;color:var(--ak2);flex:none}
.empathie blockquote{font-family:var(--serif);font-style:italic;font-size:1.35rem;line-height:1.5;color:var(--text);border-left:2px solid var(--ak1);padding-left:26px;margin-top:10px}
.empathie cite{display:block;font-style:normal;font-family:var(--sans);font-size:.85rem;color:var(--soft);margin-top:16px;letter-spacing:.08em}

/* Signature-Scroll (BF §1.1) */
.sig{height:240vh;position:relative;background:var(--tiefe);padding:0}
.sig .stage{position:sticky;top:0;height:100vh;display:flex;flex-direction:column;justify-content:center;overflow:hidden}
.sig .head{text-align:center;padding:0 24px;margin-bottom:${hell ? '26px' : '28px'};${hell ? 'color:#fff' : ''}}
${hell ? '.sig .head .eyebrow{color:rgba(255,255,255,.7)}\n.sig h2{color:#fff}' : ''}
.sig .scene{position:relative;width:min(1060px,92vw);margin:0 auto;aspect-ratio:16/9;border-radius:${hell ? '22px' : '18px'};overflow:hidden;box-shadow:${hell ? '0 40px 90px -30px rgba(0,0,0,.6)' : '0 46px 100px -34px rgba(0,0,0,.85);border:1px solid var(--line)'}}
.scene .lay{position:absolute;inset:0}
.scene img{width:100%;height:100%;object-fit:cover}
.lay.vorher{filter:${hell ? 'saturate(.72) brightness(.9)' : 'saturate(.8) brightness(.88)'}}
.lay.nachher{clip-path:inset(0 100% 0 0)}
.kante{position:absolute;top:0;bottom:0;left:0;width:0;pointer-events:none}
${wisch
    ? `.kante::before{content:"";position:absolute;right:-3px;top:0;bottom:0;width:6px;background:linear-gradient(180deg,var(--ak1),var(--ak1d));border-radius:3px;box-shadow:0 0 24px rgba(${rgb(t.akzent1)},.8)}
.kante::after{content:"";position:absolute;right:-30px;top:0;bottom:0;width:28px;background:linear-gradient(90deg,rgba(255,255,255,.28),transparent);filter:blur(3px)}`
    : `.kante::before{content:"";position:absolute;right:-1px;top:0;bottom:0;width:2px;background:var(--ak2);box-shadow:0 0 34px 6px rgba(${rgb(t.akzent2)},.55)}
.kante::after{content:"";position:absolute;right:-46px;top:0;bottom:0;width:44px;background:linear-gradient(90deg,rgba(${rgb(t.akzent2)},.22),transparent);filter:blur(4px)}`}
.tag{position:absolute;bottom:18px;font-size:${hell ? '.8rem' : '.78rem'};font-weight:800;letter-spacing:${hell ? '.12em' : '.14em'};padding:${hell ? '8px 14px' : '8px 15px'};border-radius:100px;backdrop-filter:blur(6px)}
.tag.v{left:18px;background:rgba(${hell ? rgb(t.text) + ',.55' : '15,11,9,.6'});color:${hell ? '#fff' : 'var(--soft)'}}
.tag.n{right:18px;background:var(--ak1);color:var(--text)}
.sig .cap{color:${hell ? 'rgba(255,255,255,.65)' : 'var(--soft)'};text-align:center;font-size:.92rem;margin-top:22px;font-weight:600}
.sig .hint{position:absolute;bottom:26px;left:50%;transform:translateX(-50%);color:rgba(${hell ? '255,255,255,.5' : rgb(t.text) + ',.45'});font-size:${hell ? '.8rem' : '.78rem'};letter-spacing:${hell ? '.14em' : '.16em'};text-transform:uppercase;font-weight:700;display:flex;gap:10px;align-items:center}
.hint svg{width:14px;height:14px;animation:bob 1.6s ease-in-out infinite}
.sig::after{content:"";position:absolute;top:20%;right:-10%;width:50vw;height:50vw;max-width:600px;max-height:600px;background:radial-gradient(closest-side,rgba(${rgb(t.akzent1)},.06),transparent 70%);pointer-events:none}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}

.leist{background:var(--panel)}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:${hell ? '52px' : '54px'}}
@media(max-width:960px){.grid3{grid-template-columns:repeat(2,1fr)}}
@media(max-width:640px){.grid3{grid-template-columns:1fr}}
.card{background:var(--flaeche);border-radius:var(--r);padding:${hell ? '30px 28px;border:1px solid transparent' : '32px 28px;border:1px solid var(--line)'};position:relative;transition:.3s;overflow:hidden}
.card::after{content:"";position:absolute;inset:0;opacity:0;background:linear-gradient(135deg,rgba(${rgb(t.akzent1)},.06),transparent 60%);transition:opacity .4s;pointer-events:none}
.card:hover::after{opacity:1}
.card:hover{transform:translateY(-6px);box-shadow:var(--shadow);border-color:${hell ? 'var(--ak1)' : `rgba(${rgb(t.akzent2)},.5)`}}
.card:active{transform:translateY(-4px) scale(.98)}
.card .ic{width:52px;height:52px;border-radius:14px;background:var(--panel);display:grid;place-items:center;margin-bottom:20px;transition:.3s}
.card:hover .ic{background:var(--ak1);box-shadow:0 0 30px rgba(${rgb(t.akzent1)},.25)}
.card .ic svg{width:26px;height:26px}
.card .no{font-family:var(--serif);font-style:italic;color:var(--ak1);font-size:1rem;letter-spacing:.1em;display:block;margin-bottom:16px}
.card h3{margin-bottom:10px}
.card p{font-size:.95rem;color:var(--soft)}
.card .fp{display:inline-block;margin-top:16px;font-size:.8rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--text);border-bottom:2px solid var(--ak1);padding-bottom:2px}
.leist-hinweis{margin-top:34px;color:var(--soft);font-weight:600}
.leist-hinweis a{color:var(--ak2);border-bottom:1px solid rgba(${rgb(t.akzent2)},.4)}

/* Ablauf-Stepper (Pflicht Dienstleistung, BF §1.1) */
.proz-timeline{display:flex;align-items:flex-start;justify-content:space-between;position:relative;margin:56px auto 42px;max-width:860px}
.proz-timeline::before{content:"";position:absolute;top:17px;left:0;right:0;height:3px;background:var(--line);border-radius:2px}
.proz-line{position:absolute;top:17px;left:0;height:3px;background:var(--ak1);border-radius:2px;transition:width .5s cubic-bezier(.2,.7,.2,1)}
.pstep{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;background:none;border:0;font:inherit;color:var(--soft);width:20%;padding:0}
.pstep .dot{width:36px;height:36px;border-radius:50%;background:var(--flaeche);border:2px solid var(--line);display:grid;place-items:center;font-weight:800;font-size:.85rem;transition:.3s}
.pstep.done .dot{background:var(--ak1);border-color:var(--ak1);color:var(--text)}
.pstep.active .dot{background:${hell ? 'var(--text);color:#fff' : 'var(--ak2);color:var(--basis)'};border-color:${hell ? 'var(--text)' : 'var(--ak2)'};transform:scale(1.18)}
.pstep small{font-weight:700;font-size:.8rem}
.pstep.active small{color:var(--text)}
@media(max-width:640px){.pstep small{display:none}.pstep.active small{display:block}}
.proz-card{max-width:640px;margin:0 auto;background:var(--flaeche);border:1px solid var(--line);border-radius:var(--r);padding:44px 40px;text-align:center;box-shadow:var(--shadow)}
.proz-card .ic{width:64px;height:64px;border-radius:18px;background:var(--panel);display:grid;place-items:center;margin:0 auto 22px}
.proz-card .ic svg{width:30px;height:30px}
.proz-card h3{font-size:1.6rem;margin-bottom:12px}
.proz-card p{color:var(--soft)}
.proz-card .t{display:inline-block;margin-top:20px;font-size:.78rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;background:var(--ak1);color:var(--text);padding:8px 15px;border-radius:100px}
.proz-card.swap{animation:pswap .45s ease}
@keyframes pswap{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}

/* Vorher/Nachher-Slider */
.ba-grid{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:52px}
@media(max-width:860px){.ba-grid{grid-template-columns:1fr}}
.ba{position:relative;border-radius:var(--r);overflow:hidden;aspect-ratio:4/3;cursor:ew-resize;box-shadow:var(--shadow);touch-action:none;user-select:none}
.ba .lay{position:absolute;inset:0}
.ba img{width:100%;height:100%;object-fit:cover;pointer-events:none}
.ba .after{clip-path:inset(0 0 0 50%)}
.ba .handle{position:absolute;top:0;bottom:0;left:50%;width:3px;background:#fff;box-shadow:0 0 20px rgba(0,0,0,.4)}
.ba .knob{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:46px;height:46px;border-radius:50%;background:var(--ak1);display:grid;place-items:center;box-shadow:0 8px 24px rgba(0,0,0,.3)}
.knob svg{width:20px;height:20px;color:var(--text)}
.ba figcaption{position:absolute;left:16px;bottom:14px;background:rgba(${rgb(t.text)},.6);color:${hell ? '#fff' : 'var(--basis)'};font-size:.82rem;font-weight:700;padding:7px 13px;border-radius:100px;backdrop-filter:blur(6px)}

/* Galerie */
.gal{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:54px}
@media(max-width:820px){.gal{grid-template-columns:1fr}}
.gal figure{border-radius:var(--r);overflow:hidden;aspect-ratio:4/3;position:relative;border:1px solid var(--line)}
.gal img{width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.2,.7,.2,1)}
.gal figure:hover img{transform:scale(1.05)}
.gal figcaption{position:absolute;left:14px;bottom:12px;background:rgba(${hell ? rgb(t.text) + ',.65' : '15,11,9,.65'});backdrop-filter:blur(6px);color:${hell ? '#fff' : 'var(--text)'};font-size:.82rem;font-weight:700;padding:7px 14px;border-radius:100px;z-index:1}

.zahlen{background:${hell ? 'var(--tiefe);color:#fff' : 'var(--panel);border-top:1px solid var(--line);border-bottom:1px solid var(--line)'}}
.zgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:32px;text-align:center}
@media(max-width:820px){.zgrid{grid-template-columns:repeat(2,1fr)}}
.z b{font-size:clamp(${hell ? '2.4rem,5vw,3.6rem);font-weight:800;letter-spacing:-.03em' : '2.2rem,4.6vw,3.3rem);font-family:var(--serif);color:var(--ak2)'};display:block;line-height:1.05}
.z b em{font-style:normal;color:${hell ? 'var(--ak1)' : 'var(--ak2)'}}
.z small{color:${hell ? 'rgba(255,255,255,.65)' : 'var(--soft)'};font-weight:600;font-size:.92rem}

.quote{background:var(--flaeche);border:1px solid var(--line);border-radius:var(--r);padding:${hell ? '30px' : '32px'} 28px;display:flex;flex-direction:column;gap:18px;transition:transform .3s,box-shadow .3s}
.quote:hover{transform:translateY(-4px);box-shadow:var(--shadow)}
.quote p{${hell ? 'font-size:1rem;font-weight:500' : 'font-family:var(--serif);font-style:italic;font-size:1.05rem;line-height:1.6'}}
${hell ? '.quote p::before{content:"\\201E"}' : ''}
.stars{color:${hell ? 'var(--ak1d);letter-spacing:2px;font-size:.95rem' : 'var(--ak2);letter-spacing:3px;font-size:.9rem'}}
.who{display:flex;gap:12px;align-items:center;margin-top:auto}
.who .av{width:42px;height:42px;border-radius:50%;background:${hell ? 'var(--panel)' : 'var(--ak1d);color:var(--text)'};display:grid;place-items:center;font-weight:800;font-size:.85rem}
.who small{display:block;color:var(--soft);font-weight:600}

.lokal-chips{background:var(--panel)}
.bezirke{display:flex;flex-wrap:wrap;gap:12px;margin-top:36px}
.bezirke span{background:var(--flaeche);border:1px solid var(--line);padding:11px 20px;border-radius:100px;font-weight:700;font-size:.92rem;transition:.25s}
.bezirke span:hover{background:var(--ak1);border-color:var(--ak1);transform:translateY(-3px);box-shadow:0 0 20px rgba(${rgb(t.akzent1)},.2)}
.lokal-note{margin-top:22px;color:var(--soft);font-weight:600}
.lokal-info .wrap{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:start}
@media(max-width:860px){.lokal-info .wrap{grid-template-columns:1fr}}
.info{display:grid;gap:16px;margin-top:34px}
.info div{background:var(--flaeche);border:1px solid var(--line);border-radius:14px;padding:18px 22px;display:flex;gap:16px;align-items:center}
.info b{display:block;font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;color:var(--ak2);margin-bottom:3px}
.info span{font-weight:600}
.info svg{width:22px;height:22px;color:var(--ak1);flex:none}
.info a{color:var(--ak2)}

.faq-list{max-width:${hell ? '780px;margin:52px' : '760px;margin:54px'} auto 0}
details{border-bottom:1px solid var(--line)}
summary{list-style:none;cursor:pointer;padding:24px 8px;font-weight:700;font-size:1.05rem;display:flex;justify-content:space-between;gap:20px;align-items:center}
summary:hover{color:var(--ak1)}
details[open] summary{color:var(--ak1)}
summary::-webkit-details-marker{display:none}
summary .pm{flex:none;width:30px;height:30px;border-radius:50%;border:${hell ? '2px solid var(--line)' : '1.5px solid var(--line);color:var(--ak2)'};display:grid;place-items:center;transition:.3s;font-weight:800}
details[open] .pm{background:var(--ak1);border-color:var(--ak1);${hell ? '' : 'color:var(--text);'}transform:rotate(45deg)}
details p{padding:0 48px 26px 8px;color:var(--soft)}

/* Kurz-Conversion (BF §1.2) */
.konv{background:var(--tiefe);${hell ? 'color:#fff' : ''}}
.konv .wrap{display:grid;grid-template-columns:1.1fr .9fr;gap:64px;align-items:center}
@media(max-width:900px){.konv .wrap{grid-template-columns:1fr}}
${hell ? '.konv h2{color:#fff}\n.konv .eyebrow{color:rgba(255,255,255,.7)}\n.konv .lead{color:rgba(255,255,255,.72)}' : ''}
.k-usps{display:grid;gap:16px;margin-top:34px}
.k-usps span{display:flex;gap:12px;align-items:center;font-weight:700}
.k-usps svg{width:20px;height:20px;color:${hell ? 'var(--ak1)' : 'var(--ak2)'}}
.konv-card{background:var(--flaeche);border-radius:22px;padding:44px 40px;text-align:center;box-shadow:0 40px 90px -30px rgba(0,0,0,.5);${hell ? 'color:var(--text)' : 'border:1px solid var(--line)'}}
.konv-card h3{font-size:1.5rem;margin-bottom:12px}
.konv-card p{color:var(--soft);margin-bottom:26px}
.konv-card .btn{width:100%;justify-content:center}
.tel-line{margin-top:${hell ? '22px' : '26px'};font-weight:700}
.tel-line a{color:var(--ak2);border-bottom:1px solid rgba(${rgb(t.akzent2)},.4)}

footer{padding:56px 0 ${hell ? '90px' : '92px'};border-top:1px solid var(--line)}
footer .wrap{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;align-items:center}
footer small{color:var(--soft);font-weight:600}
footer .fl{display:flex;gap:22px;font-size:.9rem;font-weight:700}
footer .fl a{opacity:.7}footer .fl a:hover{opacity:1}

.ribbon{position:fixed;left:18px;bottom:18px;z-index:70;background:${hell ? 'var(--text);color:#fff' : 'var(--ak1);color:var(--text)'};font-size:.8rem;font-weight:700;padding:10px 18px;border-radius:100px;box-shadow:var(--shadow);display:flex;gap:8px;align-items:center}
.ribbon i{width:8px;height:8px;background:${hell ? 'var(--ak1)' : 'var(--ak2)'};border-radius:50%;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}

.rv{opacity:0;transform:translateY(28px);transition:opacity .8s ease,transform .8s cubic-bezier(.2,.7,.2,1);transition-delay:calc(var(--i,0) * 0.08s)}
.rv.in{opacity:1;transform:none}

/* Nachweise-Grid */
.nachweise-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px}
@media(max-width:820px){.nachweise-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.nachweise-grid{grid-template-columns:1fr}}
.nw-card{background:var(--flaeche);border:1px solid var(--line);border-radius:var(--r);padding:28px 24px;transition:.3s;overflow:hidden;position:relative}
.nw-card::after{content:"";position:absolute;inset:0;opacity:0;background:linear-gradient(135deg,rgba(${rgb(t.akzent1)},.06),transparent 60%);transition:opacity .4s;pointer-events:none}
.nw-card:hover::after{opacity:1}
.nw-card:hover{transform:translateY(-4px);box-shadow:var(--shadow)}
.nw-card .ic{width:48px;height:48px;border-radius:14px;background:var(--panel);display:grid;place-items:center;margin-bottom:16px;transition:.3s}
.nw-card:hover .ic{background:var(--ak1);box-shadow:var(--glow)}
.nw-card .ic svg{width:24px;height:24px}
.nw-card h3{font-size:1rem;margin-bottom:6px}
.nw-card p{font-size:.88rem;color:var(--soft)}

/* Partner-Marquee */
.marquee{overflow:hidden;padding:28px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--flaeche)}
.marquee-label{text-align:center;font-size:.78rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--soft);margin-bottom:20px;padding:0 24px}
.marquee-track{display:flex;gap:48px;animation:mscroll 30s linear infinite;width:max-content;align-items:center}
.marquee-track:hover{animation-play-state:paused}
.marquee-item{font-family:var(--sans);font-size:1.1rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--soft);white-space:nowrap;opacity:.5;filter:grayscale(1);transition:opacity .3s,filter .3s,color .3s}
.marquee-item:hover{opacity:1;filter:grayscale(0);color:var(--ak1)}
.marquee-item img{height:32px;width:auto;filter:grayscale(1);opacity:.5;transition:.3s}
.marquee-item:hover img{filter:grayscale(0);opacity:1}
@keyframes mscroll{to{transform:translateX(-50%)}}

/* Prozess-Scroller */
.prozess-scroll{display:flex;gap:24px;overflow-x:auto;scroll-snap-type:x mandatory;padding:48px 0 24px;-webkit-overflow-scrolling:touch}
.prozess-scroll::-webkit-scrollbar{height:4px}
.prozess-scroll::-webkit-scrollbar-thumb{background:var(--line);border-radius:2px}
.proz-station{flex:0 0 280px;scroll-snap-align:start;background:var(--flaeche);border:1px solid var(--line);border-radius:var(--r);overflow:hidden;transition:.3s;position:relative}
.proz-station::after{content:"";position:absolute;inset:0;opacity:0;background:linear-gradient(135deg,rgba(${rgb(t.akzent1)},.06),transparent 60%);transition:opacity .4s;pointer-events:none}
.proz-station:hover::after{opacity:1}
.proz-station:hover{transform:translateY(-4px);box-shadow:var(--shadow)}
.proz-media{aspect-ratio:16/9;overflow:hidden}
.proz-media img{width:100%;height:100%;object-fit:cover}
.proz-body{padding:24px 20px}
.proz-num{font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${hell ? 'var(--soft)' : 'var(--ak2)'};margin-bottom:8px}
.proz-station h3{font-size:1.05rem;margin-bottom:8px}
.proz-station p{font-size:.9rem;color:var(--soft);line-height:1.55}
@media(max-width:640px){.prozess-scroll{flex-direction:column}.proz-station{flex:none;width:100%}}

/* Referenzen */
.ref-section{background:var(--tiefe);${hell ? 'color:#fff' : ''}}
${hell ? '.ref-section .eyebrow{color:rgba(255,255,255,.7)}\n.ref-section h2{color:#fff}' : ''}
.ref-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:52px}
@media(max-width:820px){.ref-grid{grid-template-columns:1fr}}
.ref-card{background:${hell ? 'rgba(255,255,255,.06)' : 'var(--panel)'};border:1px solid ${hell ? 'rgba(255,255,255,.1)' : 'var(--line)'};border-radius:var(--r);padding:32px 28px;transition:.3s;position:relative;overflow:hidden}
.ref-card::after{content:"";position:absolute;inset:0;opacity:0;background:linear-gradient(135deg,rgba(${rgb(t.akzent1)},.08),transparent 60%);transition:opacity .4s;pointer-events:none}
.ref-card:hover::after{opacity:1}
.ref-card:hover{transform:translateY(-4px);border-color:rgba(${rgb(t.akzent1)},.4)}
.ref-typ{font-size:.78rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${hell ? 'var(--ak1)' : 'var(--ak2)'};margin-bottom:10px}
.ref-card h3{font-size:1.2rem;margin-bottom:16px;${hell ? 'color:#fff' : ''}}
.ref-kz{display:flex;flex-wrap:wrap;gap:12px 24px}
.ref-kz span{font-size:.88rem;color:${hell ? 'rgba(255,255,255,.6)' : 'var(--soft)'}}
.ref-kz b{color:${hell ? '#fff' : 'var(--text)'};font-weight:700}
.ref-muster{font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${hell ? 'rgba(255,255,255,.4)' : 'var(--soft)'};opacity:.6;margin-top:16px}

${opts?.premiumAnimationen ? `
/* Premium-Animationen */
.frame img,.ba img,.gal img,.proz-media img{transition:transform 8s cubic-bezier(.2,.7,.2,1)}
.frame:hover img,.ba:hover img{transform:scale(1.04)}
.rv{transition-duration:1s}
.card,.quote,.nw-card,.proz-station{transition-duration:.5s}
.card:hover,.quote:hover,.nw-card:hover,.proz-station:hover{transform:translateY(-8px)}
.hero h1,.hero .lead,.vhero h1,.vhero .lead{text-shadow:0 2px 24px rgba(0,0,0,.3)}
section{transition:background .6s}
.frame{overflow:hidden}
` : ''}
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
  .rv{opacity:1;transform:none}
  ${hlReduced}
  .sig{height:auto}
  .sig .stage{position:static;height:auto;padding:${hell ? '104px' : '110px'} 0}
  .lay.nachher{clip-path:inset(0 50% 0 0)}
  .marquee-track{animation:none;flex-wrap:wrap;justify-content:center;gap:24px;padding:0 24px}
}
`.trim()
}

/** Zusatz-CSS für die /anfrage- bzw. /reservierung-Funnel-Seite */
export function funnelCss(design: FlagshipDesign): string {
  const hell = design.typo_modus === 'sans_bold_hell'
  const t = design.tokens
  const formText = hell ? 'var(--text)' : '#241A14'
  const formBg = hell ? 'var(--basis)' : '#FBF6EC'
  const formBorder = hell ? 'var(--line)' : 'rgba(36,26,20,.2)'

  return `
.funnel-body{min-height:100vh;display:flex;flex-direction:column}
.funnel-main{flex:1;display:flex;align-items:center;justify-content:center;padding:130px 24px 80px}
.funnel{width:100%;max-width:640px}
.funnel-kopf{text-align:center;margin-bottom:28px}
.funnel-kopf h1{font-size:clamp(1.7rem,4vw,2.4rem);margin-top:10px}
.fortschritt{height:6px;background:var(--line);border-radius:100px;overflow:hidden;margin:26px 0 30px}
.fortschritt i{display:block;height:100%;width:0;background:var(--ak1);border-radius:100px;transition:width .4s cubic-bezier(.2,.7,.2,1)}
.fschritt{display:none;background:var(--flaeche);border-radius:22px;padding:38px;box-shadow:var(--shadow);color:${formText};${hell ? '' : 'border:1px solid var(--line);'}animation:fein .35s ease}
.fschritt.aktiv{display:block}
@keyframes fein{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.fschritt h2{font-size:1.35rem;margin-bottom:8px;color:${formText}}
.fschritt .sub{color:${hell ? 'var(--soft)' : 'rgba(36,26,20,.65)'};margin-bottom:24px;font-size:.95rem}
.optionen{display:grid;gap:12px}
.opt{display:flex;align-items:center;gap:14px;border:1.5px solid ${formBorder};border-radius:14px;padding:16px 18px;cursor:pointer;font-weight:600;transition:.2s;background:${formBg}}
.opt:hover{border-color:var(--ak1)}
.opt.gewaehlt{border-color:var(--ak1);background:var(--flaeche);box-shadow:0 0 0 1px var(--ak1)}
.opt input{position:absolute;opacity:0;pointer-events:none;width:0;height:0;margin:0}
.opt .punkt{width:20px;height:20px;border-radius:50%;border:2px solid ${formBorder};flex:none;display:grid;place-items:center;transition:.2s}
.opt.gewaehlt .punkt{border-color:var(--ak1)}
.opt.gewaehlt .punkt::after{content:"";width:10px;height:10px;border-radius:50%;background:var(--ak1)}
.fschritt label{font-size:.82rem;font-weight:800;letter-spacing:.04em;display:block;margin:0 0 6px 2px;color:${formText}}
.fschritt input[type=text],.fschritt input[type=tel],.fschritt input[type=email],.fschritt input[type=date],.fschritt select,.fschritt textarea{width:100%;font:inherit;padding:13px 16px;border:1.5px solid ${formBorder};border-radius:12px;margin-bottom:18px;background:${formBg};transition:.2s;color:${formText}}
.fschritt input:focus,.fschritt select:focus,.fschritt textarea:focus{outline:none;border-color:var(--ak2);background:${hell ? '#fff' : '#fff'}}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:560px){.frow{grid-template-columns:1fr}}
.dsgvo{display:flex;gap:12px;align-items:flex-start;font-size:.86rem;font-weight:500;margin:4px 0 22px;color:${hell ? 'var(--soft)' : 'rgba(36,26,20,.75)'}}
.dsgvo input{width:18px;height:18px;margin-top:2px;flex:none;accent-color:${t.akzent1}}
.fnav{display:flex;gap:12px;justify-content:space-between;margin-top:8px}
.fnav .btn{flex:1;justify-content:center}
.fnav .btn.zurueck{flex:0 0 auto;background:transparent;color:${formText};box-shadow:inset 0 0 0 1.5px ${formBorder}}
.fehler{display:none;color:#C0392B;font-weight:600;font-size:.88rem;margin:-8px 0 14px}
.fehler.zeigen{display:block}
.erfolg{text-align:center;padding:20px 0}
.erfolg .tick{width:64px;height:64px;border-radius:50%;background:var(--ak1);display:grid;place-items:center;margin:0 auto 18px;color:var(--text)}
.erfolg .tick svg{width:30px;height:30px}
.erfolg h2{margin-bottom:8px}
.erfolg p{color:${hell ? 'var(--soft)' : 'rgba(36,26,20,.7)'}}
.funnel-tel{text-align:center;margin-top:24px;font-weight:700;color:var(--soft)}
.funnel-tel a{color:var(--ak2);border-bottom:1px solid rgba(${hell ? '0,0,0' : '217,164,65'},.25)}
`.trim()
}
