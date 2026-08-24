/**
 * Premium-Komposition „scrub-story-v1" — Sektions-Renderer.
 *
 * Alles wird server-seitig gerendert (SSR/SEO/no-JS): die komplette Szenen-
 * Copy steht im HTML, das JS bindet nur den Canvas-Scrub. Zwei Darstellungen
 * derselben Szenen-Daten:
 *   renderScrubStage + renderScrubStory — Scrub-Modus (Sticky-Canvas)
 *   renderScrubStatisch                 — Poster-Modus (ohne Frames)
 */

import { esc, escAttr, mediaSlot } from '../html'
import type { FlagshipMeta } from '../types'
import type { ScrubInhalte, ScrubSzene, ScrubNavLink } from './types'

export function renderScrubHeader(header: ScrubInhalte['header'], navLinks?: ScrubNavLink[]): string {
  const desktopNav = navLinks?.length
    ? `<nav class="ss-nav">${navLinks.map(l => {
        if (l.children?.length) {
          return `<div class="ss-nav-dropdown">
            <a href="${escAttr(l.href)}" class="ss-nav-link">${esc(l.label)} <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
            <div class="ss-nav-dropdown-menu">${l.children.map(c =>
              `<a href="${escAttr(c.href)}">${esc(c.label)}</a>`
            ).join('')}</div>
          </div>`
        }
        return `<a href="${escAttr(l.href)}" class="ss-nav-link">${esc(l.label)}</a>`
      }).join('')}</nav>`
    : ''

  const mobileLinks = navLinks?.length
    ? navLinks.flatMap(l => {
        const items = [`<a href="${escAttr(l.href)}" class="ss-mobile-link">${esc(l.label)}</a>`]
        if (l.children?.length) {
          items.push(...l.children.map(c =>
            `<a href="${escAttr(c.href)}" class="ss-mobile-link ss-mobile-sub">${esc(c.label)}</a>`
          ))
        }
        return items
      }).join('')
    : ''

  return `<!-- sektion:ss-kopf -->
<header class="ss-kopf">
  <div class="ss-kopf-inner">
    <a class="ss-logo" href="/">${esc(header.logo_text)}</a>
    ${desktopNav}
    <div class="ss-kopf-rechts">
      <a class="ss-btn-primary ss-btn-kopf" href="/kontakt">${esc(header.cta_label)}</a>
      <button class="ss-burger" aria-label="Menü öffnen" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
  <div class="ss-mobile-menu">
    ${mobileLinks}
    <a class="ss-btn-primary" href="/kontakt" style="margin-top:8px;width:100%;text-align:center">${esc(header.cta_label)}</a>
  </div>
</header>
<script>
(function(){
  var b=document.querySelector('.ss-burger'),m=document.querySelector('.ss-mobile-menu');
  if(!b||!m) return;
  b.addEventListener('click',function(){
    var open=m.classList.toggle('ss-open');
    b.classList.toggle('ss-open',open);
    b.setAttribute('aria-expanded',String(open));
  });
  m.addEventListener('click',function(e){
    if(e.target.tagName==='A'){m.classList.remove('ss-open');b.classList.remove('ss-open');b.setAttribute('aria-expanded','false')}
  });
})();
</script>`
}

/** Copy-Block einer Szene (identisch in Scrub- und Poster-Modus) */
function szenenCopy(szene: ScrubSzene, index: number): string {
  const titelTag = index === 0 ? 'h1' : 'h2'
  const tags = szene.tags.length
    ? `\n      <ul class="ss-tags">\n${szene.tags.map((t) => `        <li>${esc(t)}</li>`).join('\n')}\n      </ul>`
    : ''
  const aktionen = szene.aktionen?.length
    ? `\n      <div class="ss-actions">\n${szene.aktionen
        .map(
          (a) =>
            `        <a class="${a.variante === 'primaer' ? 'ss-btn-primary' : 'ss-btn-secondary'}" href="${escAttr(a.href)}">${esc(a.label)}</a>`,
        )
        .join('\n')}\n      </div>`
    : ''
  return `<div class="ss-copy">
      <p class="ss-kicker">${esc(szene.kicker)}</p>
      <${titelTag} class="ss-title">${esc(szene.titel)}</${titelTag}>
      <p class="ss-body">${esc(szene.text)}</p>${tags}${aktionen}
    </div>`
}

/** Sticky-Stage: Canvas + Poster (Szene 1) + Loader + Dots + Hint */
export function renderScrubStage(inhalte: ScrubInhalte): string {
  const dots = inhalte.szenen
    .map(
      (s, n) =>
        `      <button type="button" data-ss-dot${n === 0 ? ' class="is-active"' : ''} aria-label="Szene ${n + 1}: ${escAttr(s.label)}"></button>`,
    )
    .join('\n')
  return `  <div class="ss-stage">
    <canvas class="ss-canvas" aria-hidden="true"></canvas>
    <div class="ss-poster" data-ss-poster>${mediaSlot(inhalte.szenen[0].poster, 'ss-poster-media')}</div>
    <div class="ss-loader" data-ss-loader aria-hidden="true"><div class="ss-loader-bar"><span data-ss-loader-bar></span></div></div>
    <nav class="ss-dots" aria-label="Szenen-Navigation">
${dots}
    </nav>
    <div class="ss-hint" data-ss-hint>${esc(inhalte.hinweis)}</div>
  </div>`
}

/** Copy-Layer über der Stage: eine Sticky-Pin-Sektion je Szene */
export function renderScrubStory(inhalte: ScrubInhalte): string {
  const szenen = inhalte.szenen
    .map(
      (s, n) => `  <article class="ss-scene" data-align="${escAttr(s.align)}" style="--ss-gewicht:${Number(s.scroll) || 1.5}">
    <div class="ss-scene-pin">${szenenCopy(s, n)}</div>
  </article>`,
    )
    .join('\n')
  return `  <div class="ss-story">
${szenen}
  </div>`
}

/** Scrub-Modus: Stage + Story im Wrap, Progress-Bar daneben (fixed) */
export function renderScrubWrap(inhalte: ScrubInhalte): string {
  return `<!-- sektion:ss-story -->
<div class="ss-wrap" data-scrub id="top">
${renderScrubStage(inhalte)}
${renderScrubStory(inhalte)}
</div>
<div class="ss-progress" data-ss-progress aria-hidden="true"></div>`
}

/** Poster-Modus: jede Szene als volle Viewport-Sektion mit eigenem Poster */
export function renderScrubStatisch(inhalte: ScrubInhalte): string {
  const szenen = inhalte.szenen
    .map(
      (s, n) => `  <section class="ss-szene-poster" data-align="${escAttr(s.align)}">
    ${mediaSlot(s.poster, 'ss-poster-bild')}
    ${szenenCopy(s, n)}
  </section>`,
    )
    .join('\n')
  return `<!-- sektion:ss-story-statisch -->
<div class="ss-statisch" id="top">
${szenen}
</div>`
}

/** Kontakt: dunkle Karte, Formularvertrag wie galabau (data-kontakt-form) */
export function renderScrubKontakt(
  kontakt: ScrubInhalte['kontakt'],
  submitZiel?: string | null,
): string {
  const action = submitZiel ? ` action="${escAttr(submitZiel)}" method="post"` : ''
  return `<!-- sektion:ss-kontakt -->
<section class="ss-kontakt" id="kontakt">
  <div class="ss-kontakt-karte">
    <span class="ss-pill">${esc(kontakt.pill)}</span>
    <h2>${esc(kontakt.h2)}</h2>
    <p class="ss-kontakt-lead">${esc(kontakt.lead)}</p>
    <form data-kontakt-form${action}>
      <input class="ss-feld" type="text" name="name" placeholder="Name" required>
      <input class="ss-feld" type="email" name="email" placeholder="E-Mail" required>
      <input class="ss-feld" type="tel" name="telefon" placeholder="Telefon">
      <textarea class="ss-feld" name="nachricht" placeholder="Kurz zu Ihrem Dach: Lage, Größe, Wunsch…"></textarea>
      <label class="ss-check"><input type="checkbox" name="datenschutz" required> <span>Ich habe die <a href="#datenschutz">Datenschutzerklärung</a> gelesen und stimme zu.</span></label>
      <button class="ss-btn-primary" type="submit">${esc(kontakt.cta_label)}</button>
      <p class="ss-form-erfolg" data-form-erfolg>Danke! Wir melden uns innerhalb von 24 Stunden.</p>
    </form>
  </div>
</section>`
}

export function renderScrubFooter(
  footer: ScrubInhalte['footer'],
  header: ScrubInhalte['header'],
  meta: FlagshipMeta,
): string {
  const telefon = meta.telefon
    ? ` · <a href="tel:${escAttr(meta.telefon.replace(/[^\d+]/g, ''))}">${esc(meta.telefon)}</a>`
    : ''
  const links = footer.links
    .map((l) => `      <a href="${escAttr(l.anker)}">${esc(l.label)}</a>`)
    .join('\n')
  return `<!-- sektion:ss-fuss -->
<footer class="ss-fuss">
  <div class="ss-fuss-inner">
    <div>
      <div class="ss-logo">${esc(header.logo_text)}</div>
      <p class="ss-fuss-beschreibung">${esc(footer.beschreibung)}</p>
    </div>
    <nav>
${links}
    </nav>
  </div>
  <div class="ss-fuss-inner" style="margin-top:24px">
    <span>© ${esc(meta.firma)} · ${esc(meta.ort)}${telefon}</span>
  </div>
</footer>`
}

export function renderScrubRibbon(): string {
  return `<div class="ss-ribbon" aria-hidden="true">Demo</div>`
}
