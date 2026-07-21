/**
 * Template-Fabrik B2 — Sektions-Renderer der Komposition „maler-landing-v1".
 *
 * Basis-Sektionen kommen 1:1 aus galabau/sections.ts (Re-Export, unangetastet).
 * NEU (Maler): Signature-Wand (m-wand), Referenz-Galerie (m-galerie),
 * Einzugsgebiet (m-gebiet), Reviews (m-reviews), Unterseiten-Kopf
 * (m-leistung-kopf), Kontakt mit Growth-Extras (Rückruf/Datei-Anhang) und
 * WhatsApp-Bubble (wa.me-Link mechanisch aus meta.telefon — nie LLM).
 */

import { esc, escAttr, mediaSlot } from '../html'
import type { GalabauKontakt } from '../galabau/types'
import type { FlagshipMeta } from '../types'
import type { MalerGalerie, MalerModule, MalerWand } from './types'

export {
  renderGalabauHeader, renderGalabauHero, renderGalabauUeber,
  renderGalabauLeistungen, renderGalabauWarum, renderGalabauReferenzen,
  renderGalabauTeam, renderGalabauCtaBand, renderGalabauFaq,
  renderGalabauFooter, renderGalabauRibbon,
} from '../galabau/sections'

/**
 * Signature-Wand: Fläche färbt sich beim Scrollen von Altweiß zu Salbei
 * (clip-path über --rolle; CSS-Default --rolle:1 = fertige Wand für
 * no-JS und prefers-reduced-motion — der Effekt ist reiner Fortschritt).
 */
export function renderMalerWand(wand: MalerWand): string {
  return `<!-- sektion:m-wand -->
<section class="sektion" id="signatur">
  <div class="inhalt wand-grid">
    <div class="wand-text rv">
      <span class="pill">${esc(wand.pill)}</span>
      <h2>${esc(wand.h2)}</h2>
      <p class="sektion-lead">${esc(wand.text)}</p>
    </div>
    <div class="wand rv" data-wand aria-hidden="true">
      <div class="wand-salbei"></div>
      <div class="wand-kante"></div>
      <span class="wand-tag von">${esc(wand.tag_von)}</span>
      <span class="wand-tag zu">${esc(wand.tag_zu)}</span>
    </div>
  </div>
</section>`
}

/**
 * Referenz-Galerie: Grid (Landing, ab Stufe video); mitFilter=true rendert
 * Kategorie-Buttons dazu (Growth-Unterseite /referenzen).
 */
export function renderMalerGalerie(galerie: MalerGalerie, mitFilter = false): string {
  if (!galerie.bilder.length) return ''
  const kategorien = Array.from(new Set(galerie.bilder.map((b) => b.kategorie)))
  const filter = mitFilter
    ? `\n  <div class="galerie-filter" data-galerie-filter>
    <button class="filter-btn aktiv" type="button" data-filter="alle">Alle</button>
${kategorien.map((k) => `    <button class="filter-btn" type="button" data-filter="${escAttr(k)}">${esc(k)}</button>`).join('\n')}
  </div>`
    : ''
  const bilder = galerie.bilder
    .map(
      (b) => `    <figure class="galerie-item rv" data-galerie-item data-kategorie="${escAttr(b.kategorie)}">
      ${mediaSlot(b.media, 'galerie-bild')}
      <figcaption><span class="pill">${esc(b.kategorie)}</span></figcaption>
    </figure>`,
    )
    .join('\n')
  return `<!-- sektion:m-galerie -->
<section class="sektion" id="galerie">
  <div class="sektion-kopf">
    <span class="pill">${esc(galerie.pill)}</span>
    <h2>${esc(galerie.h2)}</h2>
    <p class="sektion-lead">${esc(galerie.lead)}</p>
  </div>${filter}
  <div class="galerie-grid">
${bilder}
  </div>
</section>`
}

/** Einzugsgebiet: Orts-Chips (verbatim), self-contained — inline SVG-Pin, keine Karten-Tiles */
export function renderMalerGebiet(gebiet: NonNullable<MalerModule['einzugsgebiet']>): string {
  const pin =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>'
  const chips = gebiet.orte
    .map((ort) => `      <span class="gebiet-chip rv">${pin}${esc(ort)}</span>`)
    .join('\n')
  return `<!-- sektion:m-gebiet -->
<section class="sektion" id="einzugsgebiet">
  <div class="inhalt">
    <div class="sektion-kopf">
      <h2>${esc(gebiet.h2)}</h2>
      <p class="sektion-lead">${esc(gebiet.lead)}</p>
    </div>
    <div class="gebiet-chips">
${chips}
    </div>
  </div>
</section>`
}

/** Google-Reviews — NUR echte aus der Config; ohne Einträge entfällt die Sektion */
export function renderMalerReviews(reviews: NonNullable<MalerModule['reviews']>): string {
  if (!reviews.length) return ''
  const karten = reviews
    .map((r) => {
      const sterne = Math.max(1, Math.min(5, Math.round(r.sterne)))
      return `    <article class="review-karte rv">
      <div class="sterne" aria-hidden="true">${'★'.repeat(sterne)}</div>
      <p>${esc(r.text)}</p>
      <div class="name">${esc(r.name)}</div>
    </article>`
    })
    .join('\n')
  return `<!-- sektion:m-reviews -->
<section class="sektion" id="reviews">
  <div class="inhalt">
    <div class="sektion-kopf">
      <span class="pill">Google-Bewertungen</span>
      <h2>Das sagen unsere Kunden</h2>
    </div>
    <div class="cols3">
${karten}
    </div>
  </div>
</section>`
}

/** Kopf einer Growth-Unterseite: H1 „{Leistung} in {Stadt}" — Ort verbatim angehängt */
export function renderMalerLeistungKopf(pill: string, h1: string, lead: string): string {
  return `<!-- sektion:m-leistung-kopf -->
<section class="sektion unterseite-kopf">
  <div class="inhalt">
    <span class="pill">${esc(pill)}</span>
    <h1>${esc(h1)}</h1>
    <p class="sektion-lead">${esc(lead)}</p>
  </div>
</section>`
}

/**
 * Kontakt wie galabau/renderGalabauKontakt, plus Growth-Extras:
 * Rückruf-Checkbox und Foto-Upload (Datei-Anhang nur mit submitZiel wirksam,
 * dann multipart/form-data). Markup-Kopie — galabau bleibt unangetastet.
 */
export function renderMalerKontakt(
  kontakt: GalabauKontakt,
  submitZiel?: string | null,
  extras?: { rueckruf?: boolean; dateiAnhang?: boolean },
): string {
  const mitDatei = !!(extras?.dateiAnhang && submitZiel)
  const action = submitZiel ? ` action="${escAttr(submitZiel)}" method="post"${mitDatei ? ' enctype="multipart/form-data"' : ''}` : ''
  const datei = mitDatei
    ? `\n        <label class="feld-label">Fotos der Flächen (optional)<input class="feld" type="file" name="anhang" accept="image/*" multiple></label>`
    : ''
  const rueckruf = extras?.rueckruf
    ? `\n        <label class="check-zeile"><input type="checkbox" name="rueckruf"> <span>Bitte rufen Sie mich für einen Aufmaß-Termin zurück.</span></label>`
    : ''
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
        <textarea class="feld" name="nachricht" placeholder="Beschreiben Sie Ihr Projekt…"></textarea>${datei}${rueckruf}
        <label class="check-zeile"><input type="checkbox" name="datenschutz" required> <span>Ich habe die <a href="#datenschutz">Datenschutzerklärung</a> gelesen und stimme zu.</span></label>
        <button class="btn-gruen" type="submit">${esc(kontakt.cta_label)}</button>
        <p class="form-erfolg" data-form-erfolg>Danke! Wir melden uns innerhalb von 24 Stunden.</p>
      </form>
    </div>
    <div class="rv">${mediaSlot(kontakt.media, 'kontakt-bild', 'min-height:420px')}</div>
  </div>
</section>`
}

/**
 * wa.me-Nummer mechanisch aus meta.telefon — nie LLM.
 * 0541 000000 → 49541000000 · +49 541 123456 → 49541123456 (keine doppelte Vorwahl).
 */
export function malerWhatsappNummer(telefon: string): string {
  const ziffern = telefon.replace(/\D/g, '')
  if (ziffern.startsWith('49')) return ziffern
  return '49' + ziffern.replace(/^0/, '')
}

/** Fixer WhatsApp-Button (Growth-Modul); entfällt ohne meta.telefon */
export function renderMalerWhatsapp(meta: FlagshipMeta): string {
  if (!meta.telefon) return ''
  const nummer = malerWhatsappNummer(meta.telefon)
  return `<a class="wa-bubble" href="https://wa.me/${nummer}" target="_blank" rel="noopener" aria-label="WhatsApp: Foto senden, Angebot erhalten">
  <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.2-.7l.4-.5c.1-.2.2-.3.1-.5l-.8-1.9c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.9.9-1.2 2.2-.4 3.7a12 12 0 0 0 4.6 4.4c1.7.8 2.4.9 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.1-.4-.2Z"/></svg>
</a>`
}
