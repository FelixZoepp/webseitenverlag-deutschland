/**
 * Premium-Komposition „scrub-story-v1" — Inline-JS.
 *
 * Das Markup (Stage, Poster, Story, Dots …) wird SERVER-seitig gerendert —
 * anders als im Guide baut das JS keinen DOM auf, es bindet nur Verhalten:
 *   1. Canvas-Scrub (nur Scrub-Modus): Frame-Sequenz an die Scroll-Position
 *      gebunden; rAF-Loop mit Interpolation (aktuell += diff*0.15),
 *      Frame-Dedup, DPR ≤ 2, Lazy-Preload-Fenster, Loader-Fortschritt.
 *   2. Punkt-Navigation (Szenen-Sprung), Progress-Bar, Hint-Fade.
 *   3. Kontaktformular: ohne submitZiel Demo-Verhalten (Erfolgstext inline).
 *
 * prefers-reduced-motion: kompletter Scrub-Abbruch — CSS zeigt das Poster.
 * Ohne JS bleibt das Poster sichtbar und alle Inhalte sind lesbar (SSR).
 */

export interface ScrubJsKonfig {
  /** null/undefined = Scrub aus (statischer Poster-Modus) */
  frames?: {
    pfad_muster: string
    gesamt: number
    ziffern: number
    fps: number
    vorlade?: number
  } | null
  /** Scroll-Gewichte der Szenen (für Frame-Zuordnung + Punkt-Navigation) */
  gewichte: number[]
  submitZiel?: string | null
}

export function scrubJs(konfig: ScrubJsKonfig): string {
  const daten = JSON.stringify({
    frames: konfig.frames ?? null,
    gewichte: konfig.gewichte,
  }).replace(/</g, '\\u003c')
  return `
(function () {
  var K = ${daten};
  var reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Kontaktformular: ohne action Demo-Verhalten (Erfolgstext, kein Request)
  var form = document.querySelector('[data-kontakt-form]');
  if (form && !form.getAttribute('action')) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var erfolg = form.querySelector('[data-form-erfolg]');
      if (erfolg) erfolg.classList.add('sichtbar');
    });
  }

  var wrap = document.querySelector('[data-scrub]');
  if (!wrap || !K.frames || reduziert) return;

  var canvas = wrap.querySelector('.ss-canvas');
  var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  if (!ctx) return;
  var poster = wrap.querySelector('[data-ss-poster]');
  var loader = wrap.querySelector('[data-ss-loader]');
  var loaderBar = wrap.querySelector('[data-ss-loader-bar]');
  var progress = document.querySelector('[data-ss-progress]');
  var hint = wrap.querySelector('[data-ss-hint]');
  var dotKnoepfe = document.querySelectorAll('[data-ss-dot]');

  var gesamt = K.frames.gesamt;
  var vorlade = K.frames.vorlade || 20;
  var bilder = {};
  var geladen = {};
  var geladenAnzahl = 0;
  var aktuell = 0;
  var ziel = 0;
  var zuletztGezeichnet = -1;
  var gestartet = false;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function frameUrl(n) {
    var s = String(n + 1);
    while (s.length < K.frames.ziffern) s = '0' + s;
    return K.frames.pfad_muster.replace('NUM', s);
  }

  function lade(n) {
    if (n < 0 || n >= gesamt || bilder[n]) return;
    var img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      geladen[n] = true;
      geladenAnzahl++;
      if (loaderBar) loaderBar.style.width = Math.round((geladenAnzahl / Math.min(gesamt, vorlade)) * 100) + '%';
      if (!gestartet && n === 0) zeichne(0);
    };
    img.src = frameUrl(n);
    bilder[n] = img;
  }

  function vorladen(von, bis) {
    for (var n = Math.max(0, von); n <= Math.min(gesamt - 1, bis); n++) lade(n);
  }

  function messen() {
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    zuletztGezeichnet = -1;
  }

  function zeichne(n) {
    var img = bilder[n];
    if (!img || !geladen[n] || !img.naturalWidth) return;
    // object-fit: cover
    var cw = canvas.width, ch = canvas.height;
    var skala = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    var bw = img.naturalWidth * skala, bh = img.naturalHeight * skala;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - bw) / 2, (ch - bh) / 2, bw, bh);
    zuletztGezeichnet = n;
    if (!gestartet) {
      gestartet = true;
      if (poster) poster.classList.add('is-hidden');
      if (loader) loader.classList.add('is-hidden');
    }
  }

  // Szenen-Frames aus den Scroll-Gewichten (proportional)
  var summe = 0;
  for (var g = 0; g < K.gewichte.length; g++) summe += K.gewichte[g];
  var szenenStart = [];
  var lauf = 0;
  for (var s = 0; s < K.gewichte.length; s++) {
    szenenStart.push(lauf / (summe || 1));
    lauf += K.gewichte[s];
  }

  function fortschritt() {
    var rect = wrap.getBoundingClientRect();
    var vh = window.innerHeight || 1;
    var weg = wrap.offsetHeight - vh;
    if (weg <= 0) return 0;
    return Math.min(1, Math.max(0, -rect.top / weg));
  }

  function szeneAktualisieren(p) {
    var aktiv = 0;
    for (var i = 0; i < szenenStart.length; i++) if (p >= szenenStart[i]) aktiv = i;
    for (var j = 0; j < dotKnoepfe.length; j++) dotKnoepfe[j].classList.toggle('is-active', j === aktiv);
  }

  function tick() {
    var p = fortschritt();
    ziel = p * (gesamt - 1);
    var diff = ziel - aktuell;
    if (Math.abs(diff) < 0.5) aktuell = ziel;
    else aktuell += diff * 0.15;
    var runde = Math.round(aktuell);
    if (runde !== zuletztGezeichnet && geladen[runde]) zeichne(runde);
    vorladen(runde, runde + vorlade);
    if (progress) progress.style.transform = 'scaleX(' + p + ')';
    if (hint) hint.classList.toggle('is-hidden', p > 0.02);
    szeneAktualisieren(p);
    window.requestAnimationFrame(tick);
  }

  for (var d = 0; d < dotKnoepfe.length; d++) {
    (function (idx) {
      dotKnoepfe[idx].addEventListener('click', function () {
        var vh = window.innerHeight || 1;
        var weg = wrap.offsetHeight - vh;
        var anteil = K.gewichte[idx] / (summe || 1);
        var oben = wrap.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: oben + (szenenStart[idx] + anteil * 0.15) * weg, behavior: 'smooth' });
      });
    })(d);
  }

  window.addEventListener('resize', messen, { passive: true });
  messen();
  vorladen(0, vorlade);
  window.requestAnimationFrame(tick);
})();`.trim()
}
