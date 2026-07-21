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
import type { ScrubInhalte, ScrubSzene } from './types'

export function renderScrubHeader(header: ScrubInhalte['header']): string {
  return `<!-- sektion:ss-kopf -->
<header class="ss-kopf">
  <div class="ss-kopf-inner">
    <a class="ss-logo" href="#top">${esc(header.logo_text)}</a>
    <a class="ss-btn-primary" href="#kontakt">${esc(header.cta_label)}</a>
  </div>
</header>`
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
