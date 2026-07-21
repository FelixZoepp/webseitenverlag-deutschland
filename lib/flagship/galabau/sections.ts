/**
 * Auftrag T1.1 — Sektions-Renderer der Komposition „galabau-landing-v1".
 *
 * Markup pixelnah aus GalabauLanding.dc.html portiert; Inline-Styles nur
 * dort, wo Werte pro Element variieren (Sticky-Top, Rotation, Stagger-Delay).
 */

import { esc, escAttr, mediaSlot } from '../html'
import type {
  GalabauCtaBand, GalabauFaq, GalabauFooter, GalabauHeader, GalabauHero,
  GalabauKontakt, GalabauKpi, GalabauLeistungen, GalabauReferenzen,
  GalabauTeam, GalabauUeber, GalabauWarum,
} from './types'
import type { FlagshipMeta } from '../types'

function logo(header: GalabauHeader): string {
  return `<a class="logo" href="#top">${esc(header.logo_text)}${header.logo_bold ? `<b>${esc(header.logo_bold)}</b>` : ''}</a>`
}

export function renderGalabauHeader(header: GalabauHeader): string {
  const links = header.links
    .map((l) => `<a href="${escAttr(l.anker)}">${esc(l.label)}</a>`)
    .join('\n      ')
  return `<!-- sektion:g-header -->
<header class="kopf" data-kopf>
  <div class="kopf-inner">
    ${logo(header)}
    <nav>
      ${links}
    </nav>
    <a class="btn-gruen" href="#kontakt">${esc(header.cta_label)}</a>
  </div>
</header>`
}

export function renderGalabauHero(hero: GalabauHero): string {
  // H1 wortweise in fadeUp-Spans (Stagger 0.06s) — wie im Flagship
  const worte = hero.h1
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => `<span data-anim style="animation-delay:${i === 0 ? '0s' : `.${String(Math.round(i * 6)).padStart(2, '0')}s`}">${esc(w)}</span>`)
    .join(' ')
  const video = hero.video
    ? `\n    <video src="${escAttr(hero.video.src)}"${hero.video.poster ? ` poster="${escAttr(hero.video.poster)}"` : ''} autoplay muted loop playsinline></video>`
    : ''
  const review = hero.review
    ? `\n  <aside class="hero-karte" data-anim>
    <div class="sterne" aria-hidden="true">★★★★★</div>
    <p>${esc(hero.review.text)}</p>
    <div class="name">${esc(hero.review.name)}</div>
  </aside>`
    : ''
  return `<!-- sektion:g-hero -->
<section class="hero" id="top">
  <div class="hero-bg">
    ${mediaSlot(hero.media, hero.video ? '' : 'kenburns') /* Ken-Burns nur ohne Video */}${video}
    <div class="hero-overlay"></div>
  </div>
  <div class="hero-inner">
    <div class="hero-inhalt">
      <span class="hero-badge">${esc(hero.badge)}</span>
      <h1>${worte}</h1>
      <p class="hero-lead">${esc(hero.lead)}</p>
      <div class="hero-ctas">
        <a class="btn-gruen btn-gross" href="#kontakt">${esc(hero.cta_primaer)} →</a>
        <a class="btn-glas" href="#leistungen">${esc(hero.cta_sekundaer)}</a>
      </div>
    </div>
  </div>${review}
</section>`
}

export function renderGalabauUeber(ueber: GalabauUeber): string {
  return `<!-- sektion:g-ueber -->
<section class="sektion">
  <div class="inhalt split">
    <div class="ueber-karte rv">
      <div class="zitat-badge" aria-hidden="true">„</div>
      <span class="pill">${esc(ueber.pill)}</span>
      <blockquote>${esc(ueber.zitat)}</blockquote>
      <div class="wer"><b>${esc(ueber.name)}</b> · ${esc(ueber.rolle)}</div>
    </div>
    <div class="rv">${mediaSlot(ueber.media, 'ueber-bild')}</div>
  </div>
</section>`
}

/** Rotationen der Leistungs-Bilder wie im Flagship (zyklisch) */
const SVC_ROTATIONEN = [-2, 1.5, -1, 2, -1.5]

export function renderGalabauLeistungen(leistungen: GalabauLeistungen): string {
  const karten = leistungen.karten
    .map((k, i) => {
      const nr = String(i + 1).padStart(2, '0')
      const top = 90 + 16 * i
      const rot = SVC_ROTATIONEN[i % SVC_ROTATIONEN.length]
      return `  <article class="svc rv" style="top:${top}px">
    <div class="nr" aria-hidden="true">${nr}</div>
    <div class="svc-grid">
      <div>
        <div class="svc-meta"><span class="pill">${esc(k.kategorie)}</span><span class="name">${esc(k.name)}</span></div>
        <h3>${esc(k.titel)}</h3>
        <p>${esc(k.text)}</p>
      </div>
      ${mediaSlot(k.media, 'svc-bild', `transform:rotate(${rot}deg)`)}
    </div>
  </article>`
    })
    .join('\n')
  return `<!-- sektion:g-leistungen -->
<section class="sektion" id="leistungen">
  <div class="sektion-kopf">
    <span class="pill">${esc(leistungen.pill)}</span>
    <h2>${esc(leistungen.h2)}</h2>
    <p class="sektion-lead">${esc(leistungen.lead)}</p>
  </div>
  <div class="stack">
${karten}
  </div>
</section>`
}

export function renderGalabauWarum(warum: GalabauWarum): string {
  const karten = warum.karten
    .map(
      (k) => `    <article class="warum-karte rv">
      ${mediaSlot(k.media, '')}
      <div class="warum-text">
        <h3>${esc(k.titel)}</h3>
        <p>${esc(k.text)}</p>
      </div>
    </article>`,
    )
    .join('\n')
  return `<!-- sektion:g-warum -->
<section class="sektion">
  <div class="inhalt">
    <div class="sektion-kopf">
      <h2>${esc(warum.h2)}</h2>
      <p class="sektion-lead">${esc(warum.lead)}</p>
    </div>
    <div class="cols3">
${karten}
    </div>
  </div>
</section>`
}

function kpiWert(kpi: GalabauKpi): string {
  const anzeige = kpi.dezimal ? kpi.zahl.toFixed(1).replace('.', ',') : String(kpi.zahl)
  return `<span data-kpi="${kpi.zahl}"${kpi.dezimal ? ' data-dezimal' : ''}>${anzeige}</span>${kpi.suffix ? esc(kpi.suffix) : ''}`
}

export function renderGalabauReferenzen(referenzen: GalabauReferenzen): string {
  const kpis =
    referenzen.kpis && referenzen.kpis.length
      ? `\n  <div class="kpis">
${referenzen.kpis
  .map(
    (k) => `    <div class="kpi rv">
      <div class="wert">${kpiWert(k)}</div>
      <div class="label">${esc(k.label)}</div>
    </div>`,
  )
  .join('\n')}
  </div>`
      : ''
  return `<!-- sektion:g-referenzen -->
<section class="sektion" id="referenzen">
  <div class="sektion-kopf">
    <span class="pill">${esc(referenzen.pill)}</span>
    <h2>${esc(referenzen.h2)}</h2>
    <p class="sektion-lead">${esc(referenzen.lead)}</p>
  </div>
  <div class="ba rv" data-ba>
    ${mediaSlot(referenzen.ba_nachher, '')}
    ${mediaSlot(referenzen.ba_vorher, 'ba-vorher').replace('class="', 'data-ba-vorher class="')}
    <span class="ba-tag vorher">${esc(referenzen.tag_vorher)}</span>
    <span class="ba-tag nachher">${esc(referenzen.tag_nachher)}</span>
    <div class="ba-teiler" data-ba-teiler></div>
    <div class="ba-griff" data-ba-griff aria-hidden="true">‹ ›</div>
  </div>
  <p class="ba-caption">${esc(referenzen.caption)}</p>${kpis}
</section>`
}

export function renderGalabauTeam(team: GalabauTeam): string {
  const karten = team.mitglieder
    .map(
      (m) => `    <article class="team-karte rv">
      ${mediaSlot(m.media, '')}
      <div class="team-name">
        <div class="name">${esc(m.name)}</div>
        <span class="rolle">${esc(m.rolle)}</span>
      </div>
    </article>`,
    )
    .join('\n')
  return `<!-- sektion:g-team -->
<section class="sektion" id="team">
  <div class="inhalt">
    <div class="sektion-kopf">
      <span class="pill">${esc(team.pill)}</span>
      <h2>${esc(team.h2)}</h2>
    </div>
    <div class="cols3">
${karten}
    </div>
  </div>
</section>`
}

export function renderGalabauCtaBand(band: GalabauCtaBand): string {
  const avatare = band.avatare.length
    ? `\n    <div class="avatare" aria-hidden="true">
${band.avatare.map((a) => `      ${mediaSlot(a, 'avatar')}`).join('\n')}
    </div>`
    : ''
  return `<!-- sektion:g-cta-band -->
<section class="sektion">
  <div class="cta-band rv">
    <span class="pill">${esc(band.pill)}</span>
    <h2>${esc(band.h2)}</h2>${avatare}
    <a class="btn-gruen btn-gross" href="#kontakt">${esc(band.cta_label)}</a>
  </div>
</section>`
}

export function renderGalabauFaq(faq: GalabauFaq): string {
  const item = (p: { frage: string; antwort: string }, offen: boolean) => `      <div class="faq-item${offen ? ' offen' : ''}" data-faq>
        <button class="faq-frage" type="button">${esc(p.frage)}<span class="faq-icon" aria-hidden="true">+</span></button>
        <div class="faq-antwort"><div><p>${esc(p.antwort)}</p></div></div>
      </div>`
  const haelfte = Math.ceil(faq.paare.length / 2)
  const links = faq.paare.slice(0, haelfte).map((p, i) => item(p, i === 0)).join('\n')
  const rechts = faq.paare.slice(haelfte).map((p) => item(p, false)).join('\n')
  return `<!-- sektion:g-faq -->
<section class="sektion" id="faq">
  <div class="inhalt">
    <div class="sektion-kopf">
      <h2>${esc(faq.h2)}</h2>
    </div>
    <div class="faq-grid">
      <div class="faq-spalte">
${links}
      </div>
      <div class="faq-spalte">
${rechts}
      </div>
    </div>
  </div>
</section>`
}

export function renderGalabauKontakt(kontakt: GalabauKontakt, submitZiel?: string | null): string {
  const action = submitZiel ? ` action="${escAttr(submitZiel)}" method="post"` : ''
  return `<!-- sektion:g-kontakt -->
<section class="sektion sektion-kontakt" id="kontakt">
  <div class="inhalt kontakt-grid">
    <div class="kontakt-karte rv">
      <span class="pill">${esc(kontakt.pill)}</span>
      <h2>${esc(kontakt.h2)}</h2>
      <p class="sektion-lead">${esc(kontakt.lead)}</p>
      <form data-kontakt-form${action}>
        <input class="feld" type="text" name="name" placeholder="Name" required>
        <input class="feld" type="email" name="email" placeholder="E-Mail" required>
        <input class="feld" type="tel" name="telefon" placeholder="Telefon">
        <textarea class="feld" name="nachricht" placeholder="Beschreiben Sie Ihr Projekt…"></textarea>
        <label class="check-zeile"><input type="checkbox" name="datenschutz" required> <span>Ich habe die <a href="#datenschutz">Datenschutzerklärung</a> gelesen und stimme zu.</span></label>
        <button class="btn-gruen" type="submit">${esc(kontakt.cta_label)}</button>
        <p class="form-erfolg" data-form-erfolg>Danke! Wir melden uns innerhalb von 24 Stunden.</p>
      </form>
    </div>
    <div class="rv">${mediaSlot(kontakt.media, 'kontakt-bild', 'min-height:420px')}</div>
  </div>
</section>`
}

export function renderGalabauFooter(footer: GalabauFooter, header: GalabauHeader, meta: FlagshipMeta): string {
  const telefonLink = meta.telefon
    ? `<a href="tel:${escAttr(meta.telefon.replace(/\s+/g, ''))}">${esc(meta.telefon)}</a>`
    : ''
  const emailLink = meta.email ? `<a href="mailto:${escAttr(meta.email)}">${esc(meta.email)}</a>` : ''
  const navLinks = header.links
    .map((l) => `      <a href="${escAttr(l.anker)}">${esc(l.label)}</a>`)
    .join('\n')
  const jahr = new Date().getFullYear()
  return `<!-- sektion:g-footer -->
<footer class="fuss" id="datenschutz">
  <div class="fuss-inner">
    <div>
      ${logo(header)}
      <p>${esc(footer.beschreibung)}</p>
    </div>
    <div class="fuss-spalte">
${navLinks}
    </div>
    <div class="fuss-spalte" id="impressum">
      ${telefonLink}
      ${emailLink}
      <a href="#impressum">Impressum</a>
      <a href="#datenschutz">Datenschutz</a>
    </div>
  </div>
  <div class="fuss-bottom">© ${jahr} ${esc(meta.firma)}</div>
</footer>`
}

export function renderGalabauRibbon(): string {
  return `<div class="demo-band">Demo-Vorschau · Webseiten-Verlag Deutschland</div>`
}
