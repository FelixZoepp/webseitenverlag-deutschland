/**
 * Template-Fabrik B2 — Inline-JS der Komposition „maler-landing-v1".
 *
 * Basis = galabauJs (Header, Reveals, KPI, BA-Slider, FAQ, Formular —
 * unangetastet), plus Maler-IIFE: Signature-Wand (--rolle 0→1 beim Scroll,
 * 'einmal' = monotone Ratsche mit Listener-Abbau, 'scrub' = beidseitig;
 * reduced-motion und no-JS zeigen die fertige Wand via CSS-Default) und
 * Galerie-Filter (Growth-Unterseite /referenzen).
 */

import { galabauJs } from '../galabau/js'

export type MalerWandModus = 'einmal' | 'scrub' | 'fertig'

function malerExtraJs(wandModus: MalerWandModus): string {
  const wand =
    wandModus === 'fertig'
      ? ''
      : `
  // Signature-Wand: Fortschritt 0→1 aus der Scroll-Position (nur clip-path)
  var wand = document.querySelector('[data-wand]');
  if (wand && !reduziert) {
    var modus = '${wandModus}';
    var fortschritt = 0;
    wand.style.setProperty('--rolle', '0');
    var malen = function () {
      var rect = wand.getBoundingClientRect();
      var vh = window.innerHeight || 1;
      var k = Math.min(1, Math.max(0, (vh - rect.top) / (vh * 0.9)));
      if (modus === 'scrub') {
        wand.style.setProperty('--rolle', String(k));
        return;
      }
      if (k > fortschritt) {
        fortschritt = k;
        wand.style.setProperty('--rolle', String(fortschritt));
      }
      if (fortschritt >= 1) {
        window.removeEventListener('scroll', malen);
        window.removeEventListener('resize', malen);
      }
    };
    window.addEventListener('scroll', malen, { passive: true });
    window.addEventListener('resize', malen, { passive: true });
    malen();
  }`
  return `
(function () {
  var reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
${wand}

  // Galerie-Filter (nur auf der Referenzen-Unterseite gerendert)
  var filterLeiste = document.querySelector('[data-galerie-filter]');
  if (filterLeiste) {
    var knoepfe = filterLeiste.querySelectorAll('[data-filter]');
    var items = document.querySelectorAll('[data-galerie-item]');
    filterLeiste.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-filter]') : null;
      if (!btn) return;
      var wahl = btn.getAttribute('data-filter');
      for (var i = 0; i < knoepfe.length; i++) knoepfe[i].classList.toggle('aktiv', knoepfe[i] === btn);
      for (var j = 0; j < items.length; j++) {
        var kat = items[j].getAttribute('data-kategorie');
        items[j].classList.toggle('aus', wahl !== 'alle' && kat !== wahl);
      }
    });
  }
})();`.trim()
}

/** Gesamt-JS: GaLaBau-Basis + Maler-Extras */
export function malerJs(opts: { submitZiel?: string | null; wandModus?: MalerWandModus } = {}): string {
  return `${galabauJs({ submitZiel: opts.submitZiel })}\n${malerExtraJs(opts.wandModus ?? 'einmal')}`
}
