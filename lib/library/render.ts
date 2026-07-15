/**
 * Library-Renderer (Mission §2/§8, Phase D)
 *
 * Rendert eine Library-Komposition (LibraryDemoConfig) als vollständiges,
 * eigenständiges HTML-Dokument.
 *
 * Quality-Gates (§2):
 *  - 0 KB JavaScript (FAQ über <details>/<summary>)
 *  - keine fremden CDNs: System-Font-Stacks, ein Inline-<style>
 *  - semantisches HTML, alle Inhalte escaped
 *  - Design-Tokens je Stil: 'klar' (nüchtern-modern) / 'warm' (persönlich)
 */

import type { LibraryDemoConfig } from '@/lib/pipeline/generate-library-content'
import type { StockAsset } from './types'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function e(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function eAttr(s: unknown): string {
  return e(s).replace(/'/g, '&#39;')
}

interface Bild {
  url: string
  alt: string
}

function bildAufloesen(wert: unknown, assets: StockAsset[], fallbackAlt: string): Bild | null {
  if (typeof wert !== 'string' || !wert) return null
  if (wert.startsWith('http://') || wert.startsWith('https://')) {
    return { url: wert, alt: fallbackAlt }
  }
  const asset = assets.find((a) => a.key === wert)
  return asset ? { url: asset.url, alt: asset.alt_text } : null
}

type Inhalt = Record<string, unknown>

function liste<T = Record<string, string>>(inhalt: Inhalt, feld: string): T[] {
  const wert = inhalt[feld]
  return Array.isArray(wert) ? (wert as T[]) : []
}

// ------------------------------------------------------------
// Design-Tokens
// ------------------------------------------------------------

const BRANCHE_AKZENT: Record<string, string> = {
  Handwerk: '#b45309',
  Gastronomie: '#9f3d2e',
  Friseur: '#8a4a5e',
  Gesundheit: '#2f7a5f',
}

function cssTokens(stil: string, akzent: string): string {
  if (stil === 'warm') {
    return `--bg:#faf7f2;--bg2:#f1ebe2;--text:#2b2420;--muted:#6f6259;--akzent:${akzent};--radius:16px;
--font-head:Georgia,'Times New Roman',serif;--font-body:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;`
  }
  return `--bg:#ffffff;--bg2:#f4f5f7;--text:#16181d;--muted:#5b6270;--akzent:${akzent};--radius:8px;
--font-head:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;--font-body:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;`
}

const BASIS_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);line-height:1.6;font-size:17px}
h1,h2,h3{font-family:var(--font-head);line-height:1.2;letter-spacing:-0.01em}
img{max-width:100%;display:block}
a{color:inherit}
.wrap{max-width:1080px;margin:0 auto;padding:0 24px}
section{padding:72px 0}
.kicker{display:inline-block;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--akzent);margin-bottom:12px}
h2{font-size:clamp(26px,4vw,36px);margin-bottom:16px}
.btn{display:inline-block;background:var(--akzent);color:#fff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:var(--radius);font-size:17px}
.btn:hover{filter:brightness(1.08)}
/* Hero */
.hero{padding:88px 0;background:var(--bg2)}
.hero .wrap{display:grid;grid-template-columns:1.1fr 0.9fr;gap:48px;align-items:center}
.hero h1{font-size:clamp(32px,5vw,52px);margin-bottom:16px}
.hero p{font-size:19px;color:var(--muted);margin-bottom:28px}
.hero img{border-radius:var(--radius);aspect-ratio:4/3;object-fit:cover;width:100%}
/* Trust */
.trust{padding:28px 0;border-top:1px solid var(--bg2);border-bottom:1px solid var(--bg2)}
.trust .wrap{display:flex;flex-wrap:wrap;gap:16px 48px;justify-content:center}
.trust b{font-size:20px;color:var(--akzent)}
.trust span{color:var(--muted);font-size:15px;margin-left:8px}
/* Problem/Lösung */
.problem{background:var(--bg2)}
.punkte{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin-top:28px}
.punkt{background:var(--bg);border-radius:var(--radius);padding:24px;border:1px solid rgba(0,0,0,0.06)}
.punkt h3{font-size:18px;margin-bottom:8px}
.punkt p{color:var(--muted);font-size:16px}
.loesung-text{max-width:720px;color:var(--muted);font-size:18px}
/* Leistungen */
.karten{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:28px}
.karte{background:var(--bg2);border-radius:var(--radius);padding:28px}
.karte h3{font-size:19px;margin-bottom:8px}
.karte p{color:var(--muted);font-size:16px}
/* Prozess */
.schritte{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;margin-top:28px;counter-reset:schritt}
.schritt{counter-increment:schritt}
.schritt::before{content:counter(schritt);display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:var(--akzent);color:#fff;font-weight:700;margin-bottom:12px}
.schritt h3{font-size:18px;margin-bottom:6px}
.schritt p{color:var(--muted);font-size:16px}
/* Referenzen */
.stimmen{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:28px}
.stimme{background:var(--bg2);border-radius:var(--radius);padding:28px;font-size:16px}
.stimme p{margin-bottom:16px}
.stimme footer{color:var(--muted);font-size:14px;font-weight:600}
/* Über uns */
.ueber .wrap{display:grid;grid-template-columns:0.9fr 1.1fr;gap:48px;align-items:center}
.ueber img{border-radius:var(--radius);aspect-ratio:1/1;object-fit:cover;width:100%}
.ueber p{color:var(--muted);font-size:18px}
/* FAQ */
.faq details{border-bottom:1px solid rgba(0,0,0,0.1);padding:18px 0}
.faq summary{font-weight:600;font-size:18px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:16px}
.faq summary::after{content:'+';color:var(--akzent);font-size:22px;font-weight:400}
.faq details[open] summary::after{content:'\\2013'}
.faq details p{color:var(--muted);padding-top:10px;max-width:760px}
/* CTA */
.cta{background:var(--akzent);color:#fff;text-align:center}
.cta h2{color:#fff}
.cta p{opacity:0.92;max-width:640px;margin:0 auto 28px}
.cta .btn{background:#fff;color:var(--akzent)}
.cta .alt{margin-top:20px;font-size:16px}
.cta .alt a{color:#fff;font-weight:600}
/* Footer */
.foot{padding:32px 0;font-size:14px;color:var(--muted)}
.foot .wrap{display:flex;flex-wrap:wrap;gap:12px 32px;justify-content:space-between}
@media(max-width:760px){
  .hero .wrap,.ueber .wrap{grid-template-columns:1fr}
  section{padding:56px 0}
}
`

// ------------------------------------------------------------
// Sektions-Renderer
// ------------------------------------------------------------

type RenderCtx = {
  config: LibraryDemoConfig
  assets: StockAsset[]
  kontaktHref: string
}

function rHero(inhalt: Inhalt, ctx: RenderCtx): string {
  const bild = bildAufloesen(inhalt.bild_key, ctx.assets, `${ctx.config.meta.firma} — Titelbild`)
  return `<header class="hero"><div class="wrap">
<div>
<h1>${e(inhalt.headline)}</h1>
<p>${e(inhalt.subheadline)}</p>
<a class="btn" href="${eAttr(ctx.kontaktHref)}">${e(inhalt.cta_text)}</a>
</div>
${bild ? `<img src="${eAttr(bild.url)}" alt="${eAttr(bild.alt)}" fetchpriority="high">` : ''}
</div></header>`
}

function rTrustBar(inhalt: Inhalt): string {
  const punkte = liste<{ wert: string; label: string }>(inhalt, 'punkte')
  if (punkte.length === 0) return ''
  return `<div class="trust"><div class="wrap">${punkte
    .map((p) => `<div><b>${e(p.wert)}</b><span>${e(p.label)}</span></div>`)
    .join('')}</div></div>`
}

function rProblem(inhalt: Inhalt): string {
  const punkte = liste<{ text: string }>(inhalt, 'punkte')
  return `<section class="problem"><div class="wrap">
<span class="kicker">Kennen Sie das?</span>
<h2>${e(inhalt.headline)}</h2>
<div class="punkte">${punkte.map((p) => `<div class="punkt"><p>${e(p.text)}</p></div>`).join('')}</div>
</div></section>`
}

function rLoesung(inhalt: Inhalt): string {
  const punkte = liste<{ titel: string; text: string }>(inhalt, 'punkte')
  return `<section><div class="wrap">
<span class="kicker">Unsere Antwort</span>
<h2>${e(inhalt.headline)}</h2>
<p class="loesung-text">${e(inhalt.text)}</p>
<div class="punkte">${punkte
    .map((p) => `<div class="punkt"><h3>${e(p.titel)}</h3><p>${e(p.text)}</p></div>`)
    .join('')}</div>
</div></section>`
}

function rLeistungen(inhalt: Inhalt): string {
  const items = liste<{ titel: string; text: string }>(inhalt, 'items')
  return `<section id="leistungen"><div class="wrap">
<span class="kicker">Leistungen</span>
<h2>${e(inhalt.headline)}</h2>
<div class="karten">${items
    .map((it) => `<div class="karte"><h3>${e(it.titel)}</h3><p>${e(it.text)}</p></div>`)
    .join('')}</div>
</div></section>`
}

function rProzess(inhalt: Inhalt): string {
  const schritte = liste<{ titel: string; text: string }>(inhalt, 'schritte')
  return `<section class="problem"><div class="wrap">
<span class="kicker">So läuft es ab</span>
<h2>${e(inhalt.headline)}</h2>
<div class="schritte">${schritte
    .map((s) => `<div class="schritt"><h3>${e(s.titel)}</h3><p>${e(s.text)}</p></div>`)
    .join('')}</div>
</div></section>`
}

function rReferenzen(inhalt: Inhalt): string {
  const stimmen = liste<{ text: string; name: string; ort: string }>(inhalt, 'stimmen')
  if (stimmen.length === 0) return ''
  return `<section><div class="wrap">
<span class="kicker">Kundenstimmen</span>
<h2>${e(inhalt.headline)}</h2>
<div class="stimmen">${stimmen
    .map(
      (s) =>
        `<blockquote class="stimme"><p>&bdquo;${e(s.text)}&ldquo;</p><footer>${e(s.name)}${
          s.ort ? ` &middot; ${e(s.ort)}` : ''
        }</footer></blockquote>`
    )
    .join('')}</div>
</div></section>`
}

function rUeberUns(inhalt: Inhalt, ctx: RenderCtx): string {
  const bild = bildAufloesen(inhalt.bild_key, ctx.assets, `${ctx.config.meta.firma} — Team`)
  return `<section class="ueber problem"><div class="wrap">
${bild ? `<img src="${eAttr(bild.url)}" alt="${eAttr(bild.alt)}" loading="lazy">` : '<div></div>'}
<div>
<span class="kicker">${e(ctx.config.meta.firma)}</span>
<h2>${e(inhalt.headline)}</h2>
<p>${e(inhalt.text)}</p>
</div>
</div></section>`
}

function rFaq(inhalt: Inhalt): string {
  const fragen = liste<{ frage: string; antwort: string }>(inhalt, 'fragen')
  return `<section class="faq"><div class="wrap">
<span class="kicker">FAQ</span>
<h2>${e(inhalt.headline)}</h2>
${fragen
    .map((f) => `<details><summary>${e(f.frage)}</summary><p>${e(f.antwort)}</p></details>`)
    .join('')}
</div></section>`
}

function rKontaktCta(inhalt: Inhalt, ctx: RenderCtx): string {
  const { telefon, email } = ctx.config.meta
  const alt =
    telefon && email
      ? `<p class="alt">Oder direkt: <a href="tel:${eAttr(telefon)}">${e(telefon)}</a> &middot; <a href="mailto:${eAttr(email)}">${e(email)}</a></p>`
      : telefon
        ? `<p class="alt">Oder direkt anrufen: <a href="tel:${eAttr(telefon)}">${e(telefon)}</a></p>`
        : email
          ? `<p class="alt">Oder direkt schreiben: <a href="mailto:${eAttr(email)}">${e(email)}</a></p>`
          : ''
  return `<section class="cta" id="kontakt"><div class="wrap">
<h2>${e(inhalt.headline)}</h2>
<p>${e(inhalt.text)}</p>
<a class="btn" href="${eAttr(ctx.kontaktHref)}">${e(inhalt.cta_text)}</a>
${alt}
</div></section>`
}

function rFooter(ctx: RenderCtx): string {
  const m = ctx.config.meta
  const kontakt = [m.adresse, m.telefon, m.email].filter(Boolean).map(e).join(' &middot; ')
  return `<footer class="foot"><div class="wrap">
<div><b>${e(m.firma)}</b>${kontakt ? ` &middot; ${kontakt}` : ''}</div>
<div>Impressum &middot; Datenschutz</div>
</div></footer>`
}

// ------------------------------------------------------------
// Öffentliche API
// ------------------------------------------------------------

export function renderLibraryPage(config: LibraryDemoConfig, assets: StockAsset[]): string {
  const akzent = BRANCHE_AKZENT[config.branche] ?? '#1f2937'
  const kontaktHref = config.meta.telefon
    ? `tel:${config.meta.telefon}`
    : config.meta.email
      ? `mailto:${config.meta.email}`
      : '#kontakt'

  const ctx: RenderCtx = { config, assets, kontaktHref }
  const inhalte = config.inhalte

  const body = [
    inhalte.hero ? rHero(inhalte.hero, ctx) : '',
    inhalte.trust_bar ? rTrustBar(inhalte.trust_bar) : '',
    inhalte.problem ? rProblem(inhalte.problem) : '',
    inhalte.loesung ? rLoesung(inhalte.loesung) : '',
    inhalte.leistungen ? rLeistungen(inhalte.leistungen) : '',
    inhalte.prozess ? rProzess(inhalte.prozess) : '',
    inhalte.referenzen ? rReferenzen(inhalte.referenzen) : '',
    inhalte.ueber_uns ? rUeberUns(inhalte.ueber_uns, ctx) : '',
    inhalte.faq ? rFaq(inhalte.faq) : '',
    inhalte.kontakt_cta ? rKontaktCta(inhalte.kontakt_cta, ctx) : '',
    rFooter(ctx),
  ].join('\n')

  const titel = `${config.meta.firma}${config.meta.ort ? ` — ${config.meta.ort}` : ''}`
  const beschreibung = String(
    (inhalte.hero as Inhalt | undefined)?.subheadline ?? `${config.meta.firma} — ${config.branche}`
  )

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(titel)}</title>
<meta name="description" content="${eAttr(beschreibung)}">
<style>:root{${cssTokens(config.stil, akzent)}}${BASIS_CSS}</style>
</head>
<body>
${body}
</body>
</html>`
}
