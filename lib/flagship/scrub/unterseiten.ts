/**
 * Scrub-Story Unterseiten-Renderer.
 * Karriere, Erfahrungen, Leistungen, Kontakt — im dunklen Scrub-Design (ss-* Klassen).
 */

import { esc, escAttr } from '../html'
import type { ScrubKarriereInhalt, ScrubErfahrungenInhalt, ScrubLeistungenInhalt, ScrubZieleInhalt, ScrubAngeboteInhalt, ScrubInhalte, ScrubZielgruppeInhalt, ScrubLeistungDetailInhalt, ScrubProjekt } from './types'

export function renderScrubKarriere(k: ScrubKarriereInhalt, submitZiel?: string | null): string {
  const benefits = k.benefits.map((b) =>
    `<div class="ss-benefit">
      <span class="ss-benefit-icon">${esc(b.icon)}</span>
      <h3>${esc(b.titel)}</h3>
      <p>${esc(b.text)}</p>
    </div>`
  ).join('\n    ')

  const stellen = k.stellen.map((s) =>
    `<div class="ss-stelle">
      <div class="ss-stelle-header">
        <h3>${esc(s.titel)}</h3>
        <div class="ss-stelle-meta"><span>${esc(s.ort)}</span> &middot; <span>${esc(s.typ)}</span></div>
      </div>
      <p>${esc(s.beschreibung)}</p>
      <a class="ss-btn-primary" href="#bewerbung">${esc(k.cta_label)}</a>
    </div>`
  ).join('\n    ')

  const action = submitZiel ? ` action="${escAttr(submitZiel)}" method="post"` : ''

  return `<!-- sektion:ss-karriere -->
<section class="ss-seite" id="karriere">
  <div class="ss-seite-wrap">
    <span class="ss-kicker">${esc(k.eyebrow)}</span>
    <h1 class="ss-title">${esc(k.headline)}</h1>
    <p class="ss-body">${esc(k.lead)}</p>
  </div>
</section>

<section class="ss-seite">
  <div class="ss-seite-wrap">
    <h2 class="ss-h2">Warum bei uns?</h2>
    <div class="ss-benefits-grid">
    ${benefits}
    </div>
  </div>
</section>

<section class="ss-seite">
  <div class="ss-seite-wrap">
    <h2 class="ss-h2">Offene Stellen</h2>
    <div class="ss-stellen-list">
    ${stellen}
    </div>
  </div>
</section>

<section class="ss-seite" id="bewerbung">
  <div class="ss-seite-wrap" style="max-width:640px">
    <h2 class="ss-h2">Jetzt bewerben</h2>
    <form data-kontakt-form${action}>
      <input class="ss-feld" type="text" name="name" placeholder="Vor- und Nachname" required>
      <input class="ss-feld" type="email" name="email" placeholder="E-Mail" required>
      <input class="ss-feld" type="tel" name="telefon" placeholder="Telefon">
      <input class="ss-feld" type="text" name="stelle" placeholder="Gew&uuml;nschte Stelle">
      <textarea class="ss-feld" name="nachricht" placeholder="Kurz zu Ihnen: Erfahrung, Motivation..."></textarea>
      <label class="ss-check"><input type="checkbox" name="datenschutz" required> <span>Ich habe die <a href="/datenschutz">Datenschutzerkl&auml;rung</a> gelesen und stimme zu.</span></label>
      <button class="ss-btn-primary" type="submit">${esc(k.cta_label)}</button>
      <p class="ss-form-erfolg" data-form-erfolg>Danke! Wir melden uns innerhalb von 48 Stunden.</p>
    </form>
  </div>
</section>`
}

export function renderScrubErfahrungen(e: ScrubErfahrungenInhalt): string {
  const stimmen = e.stimmen.map((s) =>
    `<div class="ss-stimme">
      <p class="ss-stimme-text">&ldquo;${esc(s.text)}&rdquo;</p>
      <div class="ss-stimme-autor">
        <span class="ss-avatar">${esc(s.initialen)}</span>
        <div><strong>${esc(s.name)}</strong><br><small>${esc(s.rolle)}</small></div>
      </div>
    </div>`
  ).join('\n    ')

  const fallstudien = e.fallstudien.length > 0
    ? `<section class="ss-seite">
  <div class="ss-seite-wrap">
    <h2 class="ss-h2">Fallstudien</h2>
    <div class="ss-fallstudien-grid">
    ${e.fallstudien.map((f) =>
      `<div class="ss-fallstudie">
        <span class="ss-pill">${esc(f.kunde)}</span>
        <h3>${esc(f.titel)}</h3>
        <p>${esc(f.beschreibung)}</p>
        <div class="ss-ergebnis"><strong>Ergebnis:</strong> ${esc(f.ergebnis)}</div>
      </div>`
    ).join('\n    ')}
    </div>
  </div>
</section>`
    : ''

  const projekte = (e.projekte && e.projekte.length > 0)
    ? `<section class="ss-seite">
  <div class="ss-seite-wrap">
    <h2 class="ss-h2">Vorher &amp; Nachher</h2>
    <div class="ss-projekte-grid">
    ${e.projekte.map((p: ScrubProjekt, idx: number) => {
      const kennzahlen = p.kennzahlen?.map((k) =>
        `<div class="ss-kz"><span class="ss-kz-wert">${esc(k.wert)}</span><span class="ss-kz-label">${esc(k.label)}</span></div>`
      ).join('\n          ') || ''
      const hatBilder = p.bild_vorher && p.bild_nachher
      const slider = hatBilder
        ? `<div class="ss-slider" data-slider="${idx}">
          <div class="ss-slider-nachher">
            <img src="${escAttr(p.bild_nachher!)}" alt="Nachher: ${escAttr(p.titel)}" loading="lazy">
          </div>
          <div class="ss-slider-vorher" style="width:50%">
            <img src="${escAttr(p.bild_vorher!)}" alt="Vorher: ${escAttr(p.titel)}" loading="lazy">
          </div>
          <div class="ss-slider-handle" style="left:50%">
            <div class="ss-slider-line"></div>
            <div class="ss-slider-knob"><span>◀</span><span>▶</span></div>
            <div class="ss-slider-line"></div>
          </div>
          <span class="ss-slider-label ss-slider-label-v">Vorher</span>
          <span class="ss-slider-label ss-slider-label-n">Nachher</span>
        </div>`
        : ''
      const textVergleich = `<div class="ss-vorher-nachher">
          <div class="ss-vn-block ss-vn-vorher">
            <span class="ss-pill">Vorher</span>
            <p>${esc(p.vorher)}</p>
          </div>
          <div class="ss-vn-block ss-vn-nachher">
            <span class="ss-pill" style="background:var(--ss-akzent1);color:var(--ss-basis)">Nachher</span>
            <p>${esc(p.nachher)}</p>
          </div>
        </div>`
      return `<div class="ss-projekt">
        <div class="ss-projekt-header">
          <h3>${esc(p.titel)}</h3>
          <div class="ss-stelle-meta"><span>${esc(p.ort)}</span> &middot; <span>${esc(p.typ)}</span></div>
        </div>
        ${slider}
        ${textVergleich}
        <div class="ss-ergebnis"><strong>Ergebnis:</strong> ${esc(p.ergebnis)}</div>
        ${kennzahlen ? `<div class="ss-kennzahlen">${kennzahlen}</div>` : ''}
      </div>`
    }).join('\n    ')}
    </div>
  </div>
</section>
<script>
(function(){
  document.querySelectorAll('[data-slider]').forEach(function(el){
    var vorher=el.querySelector('.ss-slider-vorher');
    var handle=el.querySelector('.ss-slider-handle');
    if(!vorher||!handle) return;
    var dragging=false;
    function pos(e){
      var r=el.getBoundingClientRect();
      var x=((e.touches?e.touches[0].clientX:e.clientX)-r.left)/r.width;
      x=Math.max(0.05,Math.min(0.95,x));
      vorher.style.width=(x*100)+'%';
      handle.style.left=(x*100)+'%';
    }
    handle.addEventListener('mousedown',function(){dragging=true});
    handle.addEventListener('touchstart',function(){dragging=true},{passive:true});
    window.addEventListener('mousemove',function(e){if(dragging){e.preventDefault();pos(e)}});
    window.addEventListener('touchmove',function(e){if(dragging)pos(e)},{passive:true});
    window.addEventListener('mouseup',function(){dragging=false});
    window.addEventListener('touchend',function(){dragging=false});
    el.addEventListener('click',function(e){pos(e)});
  });
})();
</script>`
    : ''

  return `<!-- sektion:ss-erfahrungen -->
<section class="ss-seite" id="erfahrungen">
  <div class="ss-seite-wrap">
    <span class="ss-kicker">${esc(e.eyebrow)}</span>
    <h1 class="ss-title">${esc(e.headline)}</h1>
  </div>
</section>

${projekte}

<section class="ss-seite">
  <div class="ss-seite-wrap">
    <h2 class="ss-h2">Was unsere Kunden sagen</h2>
    <div class="ss-stimmen-grid">
    ${stimmen}
    </div>
  </div>
</section>

${fallstudien}`
}

export function renderScrubLeistungen(l: ScrubLeistungenInhalt): string {
  const items = l.leistungen.map((s, i) =>
    `<div class="ss-leistung">
      <span class="ss-leistung-nr">${String(i + 1).padStart(2, '0')}</span>
      <span class="ss-leistung-icon">${esc(s.icon)}</span>
      <h3>${esc(s.titel)}</h3>
      <p>${esc(s.text)}</p>
    </div>`
  ).join('\n    ')

  return `<!-- sektion:ss-leistungen -->
<section class="ss-seite" id="leistungen">
  <div class="ss-seite-wrap">
    <span class="ss-kicker">${esc(l.eyebrow)}</span>
    <h1 class="ss-title">${esc(l.headline)}</h1>
    <p class="ss-body">${esc(l.lead)}</p>
  </div>
</section>

<section class="ss-seite">
  <div class="ss-seite-wrap">
    <div class="ss-leistungen-grid">
    ${items}
    </div>
  </div>
</section>`
}

export function renderScrubKontaktSeite(kontakt: ScrubInhalte['kontakt'], submitZiel?: string | null): string {
  const action = submitZiel ? ` action="${escAttr(submitZiel)}" method="post"` : ''
  return `<!-- sektion:ss-kontakt-seite -->
<section class="ss-seite">
  <div class="ss-seite-wrap" style="max-width:640px">
    <span class="ss-pill">${esc(kontakt.pill)}</span>
    <h1 class="ss-title">${esc(kontakt.h2)}</h1>
    <p class="ss-body">${esc(kontakt.lead)}</p>
    <form data-kontakt-form${action} style="margin-top:32px">
      <input class="ss-feld" type="text" name="name" placeholder="Name" required>
      <input class="ss-feld" type="email" name="email" placeholder="E-Mail" required>
      <input class="ss-feld" type="tel" name="telefon" placeholder="Telefon">
      <textarea class="ss-feld" name="nachricht" placeholder="Ihre Nachricht..."></textarea>
      <label class="ss-check"><input type="checkbox" name="datenschutz" required> <span>Ich habe die <a href="/datenschutz">Datenschutzerkl&auml;rung</a> gelesen und stimme zu.</span></label>
      <button class="ss-btn-primary" type="submit">${esc(kontakt.cta_label)}</button>
      <p class="ss-form-erfolg" data-form-erfolg>Danke! Wir melden uns innerhalb von 24 Stunden.</p>
    </form>
  </div>
</section>`
}

export function renderScrubZiele(z: ScrubZieleInhalt): string {
  const items = z.ziele.map((g) =>
    `<div class="ss-leistung">
      <span class="ss-leistung-icon">${esc(g.icon)}</span>
      <h3>${esc(g.titel)}</h3>
      <p>${esc(g.text)}</p>
    </div>`
  ).join('\n    ')

  return `<!-- sektion:ss-ziele -->
<section class="ss-seite" id="ziele">
  <div class="ss-seite-wrap">
    <span class="ss-kicker">${esc(z.eyebrow)}</span>
    <h1 class="ss-title">${esc(z.headline)}</h1>
    <p class="ss-body">${esc(z.lead)}</p>
  </div>
</section>

<section class="ss-seite">
  <div class="ss-seite-wrap">
    <div class="ss-leistungen-grid">
    ${items}
    </div>
  </div>
</section>`
}

export function renderScrubAngebote(a: ScrubAngeboteInhalt): string {
  const pakete = a.pakete.map((p) => {
    const features = p.features.map((f) => `<li>${esc(f)}</li>`).join('\n          ')
    const hl = p.highlight ? ' ss-paket-highlight' : ''
    return `<div class="ss-paket${hl}">
      ${p.highlight ? '<span class="ss-paket-badge">Beliebteste Wahl</span>' : ''}
      <h3>${esc(p.titel)}</h3>
      <div class="ss-paket-preis"><span class="ss-preis-zahl">${esc(p.preis)}</span><span class="ss-preis-intervall">/${esc(p.intervall)}</span></div>
      <ul class="ss-paket-features">
          ${features}
      </ul>
      <a class="ss-btn-primary" href="#kontakt">Jetzt starten</a>
    </div>`
  }).join('\n    ')

  const hinweis = a.hinweis ? `<p class="ss-body" style="text-align:center;margin-top:32px">${esc(a.hinweis)}</p>` : ''

  return `<!-- sektion:ss-angebote -->
<section class="ss-seite" id="angebote">
  <div class="ss-seite-wrap">
    <span class="ss-kicker">${esc(a.eyebrow)}</span>
    <h1 class="ss-title">${esc(a.headline)}</h1>
    <p class="ss-body">${esc(a.lead)}</p>
  </div>
</section>

<section class="ss-seite">
  <div class="ss-seite-wrap">
    <div class="ss-pakete-grid">
    ${pakete}
    </div>
    ${hinweis}
  </div>
</section>`
}

export function renderScrubZielgruppe(z: ScrubZielgruppeInhalt): string {
  const herausforderungen = z.herausforderungen.map((h) =>
    `<div class="ss-leistung">
      <span class="ss-leistung-icon">${esc(h.icon)}</span>
      <h3>${esc(h.titel)}</h3>
      <p>${esc(h.text)}</p>
    </div>`
  ).join('\n    ')

  const loesungen = z.loesungen.map((l) =>
    `<div class="ss-benefit">
      <span class="ss-benefit-icon">${esc(l.icon)}</span>
      <h3>${esc(l.titel)}</h3>
      <p>${esc(l.text)}</p>
    </div>`
  ).join('\n    ')

  const leistungen = z.relevante_leistungen.map((r) =>
    `<div class="ss-stelle">
      <div class="ss-stelle-header">
        <h3>${esc(r.titel)}</h3>
      </div>
      <p>${esc(r.text)}</p>
      ${r.href ? `<a class="ss-btn-sekundaer" href="${escAttr(r.href)}">Mehr erfahren</a>` : ''}
    </div>`
  ).join('\n    ')

  return `<!-- sektion:ss-zielgruppe-${escAttr(z.slug)} -->
<section class="ss-seite" id="${escAttr(z.slug)}">
  <div class="ss-seite-wrap">
    <span class="ss-kicker">${esc(z.eyebrow)}</span>
    <h1 class="ss-title">${esc(z.headline)}</h1>
    <p class="ss-body">${esc(z.lead)}</p>
  </div>
</section>

<section class="ss-seite">
  <div class="ss-seite-wrap">
    <h2 class="ss-h2">Typische Herausforderungen</h2>
    <div class="ss-leistungen-grid">
    ${herausforderungen}
    </div>
  </div>
</section>

<section class="ss-seite">
  <div class="ss-seite-wrap">
    <h2 class="ss-h2">So unterstützen wir Sie</h2>
    <div class="ss-benefits-grid">
    ${loesungen}
    </div>
  </div>
</section>

<section class="ss-seite">
  <div class="ss-seite-wrap">
    <h2 class="ss-h2">Relevante Leistungen</h2>
    <div class="ss-stellen-list">
    ${leistungen}
    </div>
  </div>
</section>

<section class="ss-seite">
  <div class="ss-seite-wrap" style="max-width:640px;text-align:center">
    <h2 class="ss-h2">${esc(z.cta.headline)}</h2>
    <p class="ss-body">${esc(z.cta.text)}</p>
    <a class="ss-btn-primary" href="#kontakt" style="margin-top:24px;display:inline-block">${esc(z.cta.label)}</a>
  </div>
</section>`
}

export function renderScrubLeistungDetail(l: ScrubLeistungDetailInhalt): string {
  const ablauf = l.ablauf.map((a) =>
    `<div class="ss-leistung">
      <span class="ss-leistung-nr">${esc(a.schritt)}</span>
      <h3>${esc(a.titel)}</h3>
      <p>${esc(a.text)}</p>
    </div>`
  ).join('\n    ')

  const vorteile = l.vorteile.map((v) =>
    `<div class="ss-benefit">
      <span class="ss-benefit-icon">${esc(v.icon)}</span>
      <h3>${esc(v.titel)}</h3>
      <p>${esc(v.text)}</p>
    </div>`
  ).join('\n    ')

  return `<!-- sektion:ss-leistung-${escAttr(l.slug)} -->
<section class="ss-seite" id="${escAttr(l.slug)}">
  <div class="ss-seite-wrap">
    <span class="ss-kicker">${esc(l.eyebrow)}</span>
    <h1 class="ss-title">${esc(l.headline)}</h1>
    <p class="ss-body">${esc(l.lead)}</p>
  </div>
</section>

<section class="ss-seite">
  <div class="ss-seite-wrap">
    <h2 class="ss-h2">Unser Ablauf</h2>
    <div class="ss-leistungen-grid">
    ${ablauf}
    </div>
  </div>
</section>

<section class="ss-seite">
  <div class="ss-seite-wrap">
    <h2 class="ss-h2">Ihre Vorteile</h2>
    <div class="ss-benefits-grid">
    ${vorteile}
    </div>
  </div>
</section>

<section class="ss-seite">
  <div class="ss-seite-wrap" style="max-width:640px;text-align:center">
    <h2 class="ss-h2">${esc(l.cta.headline)}</h2>
    <p class="ss-body">${esc(l.cta.text)}</p>
    <a class="ss-btn-primary" href="#kontakt" style="margin-top:24px;display:inline-block">${esc(l.cta.label)}</a>
  </div>
</section>`
}
