/**
 * Scrub-Story Unterseiten-Renderer.
 * Karriere, Erfahrungen, Leistungen, Kontakt — Apple-Red-Software / GaLaBau Design-System.
 * Vollständig inline-gestylt, kein ss-*-Klassen-Abhängigkeit.
 */

import { esc, escAttr } from '../html'
import type { ScrubKarriereInhalt, ScrubErfahrungenInhalt, ScrubLeistungenInhalt, ScrubZieleInhalt, ScrubAngeboteInhalt, ScrubInhalte, ScrubZielgruppeInhalt, ScrubLeistungDetailInhalt, ScrubProjekt } from './types'

/* ─── Design-System Tokens ─────────────────────────────────── */
const DS = {
  accent:      '#0A5C99',
  accentSoft:  '#E8F2FC',
  accentDark:  '#084A7A',
  bg:          '#F5F6F8',
  card:        '#fff',
  text:        '#17181A',
  muted:       '#5F646D',
  border:      '#E7E9ED',
} as const

/* ─── Shared Style + Reveal Script ─────────────────────────── */

const DS_STYLE = `<style>
.ds-card:hover{transform:translateY(-3px);box-shadow:0 4px 12px rgba(23,24,26,.08),0 16px 48px rgba(23,24,26,.08) !important}
.ds-btn:hover{filter:brightness(.94)}
.ds-btn:active{transform:scale(.97)}
[data-reveal]{opacity:0;transform:translateY(24px);transition:opacity .6s cubic-bezier(.22,.61,.36,1),transform .6s cubic-bezier(.22,.61,.36,1)}
[data-reveal].visible{opacity:1;transform:none}
@media(max-width:900px){[data-split]{grid-template-columns:1fr !important}[data-cols3]{grid-template-columns:1fr !important}[data-stack]>div{position:relative !important;top:0 !important}}
</style>`

const DS_REVEAL_SCRIPT = `<script>
(function(){
  var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){var el=e.target;var sibs=el.parentElement?Array.from(el.parentElement.children).filter(function(c){return c.hasAttribute('data-reveal')}):[];var i=Math.max(0,sibs.indexOf(el));el.style.transitionDelay=(i*80)+'ms';el.classList.add('visible');io.unobserve(el)}})},{threshold:0.15});
  document.querySelectorAll('[data-reveal]').forEach(function(el){io.observe(el)});
})();
</script>`

/* ─── Reusable HTML helpers ────────────────────────────────── */

function sectionHeader(pill: string, title: string, subtitle?: string): string {
  return `<div data-reveal="1" style="max-width:720px;margin:0 auto;text-align:center;display:flex;flex-direction:column;gap:14px;align-items:center">
    <div style="display:inline-flex;background:${DS.accentSoft};color:${DS.accent};font-size:12px;font-weight:600;padding:6px 14px;border-radius:999px">${pill}</div>
    <h2 style="margin:0;font-size:32px;font-weight:800;letter-spacing:-0.03em;line-height:1.05;color:${DS.text}">${title}</h2>
    ${subtitle ? `<p style="margin:0;font-size:18px;line-height:1.5;color:${DS.muted}">${subtitle}</p>` : ''}
  </div>`
}

function heroHeader(pill: string, title: string, subtitle?: string): string {
  return `<div data-reveal="1" style="max-width:720px;margin:0 auto;text-align:center;display:flex;flex-direction:column;gap:14px;align-items:center">
    <div style="display:inline-flex;background:${DS.accentSoft};color:${DS.accent};font-size:12px;font-weight:600;padding:6px 14px;border-radius:999px">${pill}</div>
    <h1 style="margin:0;font-size:clamp(36px,5vw,56px);font-weight:800;letter-spacing:-0.03em;line-height:1.05;color:${DS.text}">${title}</h1>
    ${subtitle ? `<p style="margin:0;font-size:18px;line-height:1.5;color:${DS.muted};max-width:560px">${subtitle}</p>` : ''}
  </div>`
}

function dsButton(label: string, href = '#kontakt'): string {
  return `<a class="ds-btn" href="${escAttr(href)}" style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(180deg,#1A7BC5,${DS.accent});color:#fff;font-weight:600;font-size:16px;padding:16px 28px;border-radius:999px;box-shadow:0 2px 6px rgba(10,92,153,.35),0 8px 20px rgba(10,92,153,.25);text-decoration:none;transition:filter .18s,transform .1s">${label} &rarr;</a>`
}

function dsCard(content: string, extra = ''): string {
  return `<div class="ds-card" data-reveal="1" style="background:${DS.card};border-radius:20px;box-shadow:0 1px 3px rgba(23,24,26,.06),0 4px 12px rgba(23,24,26,.05);padding:clamp(28px,4vw,48px);overflow:hidden;transition:transform .22s,box-shadow .22s${extra ? ';' + extra : ''}">${content}</div>`
}

function dsSection(content: string, id?: string): string {
  return `<section${id ? ` id="${escAttr(id)}"` : ''} style="padding:clamp(64px,10vw,128px) 24px 0">${content}</section>`
}

/* ─── 1. renderScrubLeistungen ─────────────────────────────── */

export function renderScrubLeistungen(l: ScrubLeistungenInhalt): string {
  const items = l.leistungen.map((s, i) => {
    const nr = String(i + 1).padStart(2, '0')
    return dsCard(`
      <div style="position:relative">
        <span style="position:absolute;top:-8px;right:0;font-size:72px;font-weight:800;color:rgba(10,92,153,.06);line-height:1;pointer-events:none">${nr}</span>
        <div data-split="1" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,4vw,48px);align-items:center">
          <div style="display:flex;flex-direction:column;gap:12px">
            <div style="display:inline-flex;background:${DS.accentSoft};color:${DS.accent};font-size:12px;font-weight:600;padding:6px 14px;border-radius:999px;align-self:flex-start">${esc(s.icon)}</div>
            <h3 style="margin:0;font-size:clamp(20px,2vw,28px);font-weight:800;letter-spacing:-0.02em;color:${DS.text}">${esc(s.titel)}</h3>
            <p style="margin:0;font-size:15px;line-height:1.5;color:${DS.muted}">${esc(s.text)}</p>
          </div>
          <div style="background:${DS.accentSoft};border-radius:16px;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;transform:rotate(1deg)">
            <span style="font-size:48px;opacity:.5">${esc(s.icon)}</span>
          </div>
        </div>
      </div>
    `)
  }).join('\n')

  return `${DS_STYLE}
${dsSection(`
  ${heroHeader(esc(l.eyebrow), esc(l.headline), esc(l.lead))}
`, 'leistungen')}

${dsSection(`
  <div data-stack style="max-width:960px;margin:0 auto;display:flex;flex-direction:column;gap:32px">
    ${items}
  </div>
`)}

${DS_REVEAL_SCRIPT}`
}

/* ─── 2. renderScrubLeistungDetail ─────────────────────────── */

export function renderScrubLeistungDetail(l: ScrubLeistungDetailInhalt): string {
  const ablauf = l.ablauf.map((a, i) => {
    const nr = String(i + 1).padStart(2, '0')
    return dsCard(`
      <div style="position:relative">
        <span style="position:absolute;top:-8px;right:0;font-size:72px;font-weight:800;color:rgba(10,92,153,.06);line-height:1;pointer-events:none">${nr}</span>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div style="display:inline-flex;background:${DS.accentSoft};color:${DS.accent};font-size:12px;font-weight:600;padding:6px 14px;border-radius:999px;align-self:flex-start">Schritt ${esc(a.schritt)}</div>
          <h3 style="margin:0;font-size:clamp(20px,2vw,28px);font-weight:800;letter-spacing:-0.02em;color:${DS.text}">${esc(a.titel)}</h3>
          <p style="margin:0;font-size:15px;line-height:1.5;color:${DS.muted}">${esc(a.text)}</p>
        </div>
      </div>
    `)
  }).join('\n')

  const vorteile = l.vorteile.map((v) =>
    dsCard(`
      <div style="display:flex;flex-direction:column;gap:10px;text-align:center;align-items:center">
        <div style="width:48px;height:48px;border-radius:14px;background:${DS.accentSoft};display:flex;align-items:center;justify-content:center;font-size:22px">${esc(v.icon)}</div>
        <h3 style="margin:0;font-size:clamp(20px,2vw,28px);font-weight:800;letter-spacing:-0.02em;color:${DS.text}">${esc(v.titel)}</h3>
        <p style="margin:0;font-size:15px;line-height:1.5;color:${DS.muted}">${esc(v.text)}</p>
      </div>
    `)
  ).join('\n')

  return `${DS_STYLE}
${dsSection(`
  ${heroHeader(esc(l.eyebrow), esc(l.headline), esc(l.lead))}
`, escAttr(l.slug))}

${dsSection(`
  ${sectionHeader('Ablauf', 'Unser Ablauf')}
  <div data-stack style="max-width:960px;margin:40px auto 0;display:flex;flex-direction:column;gap:24px">
    ${ablauf}
  </div>
`)}

${dsSection(`
  ${sectionHeader('Vorteile', 'Ihre Vorteile')}
  <div data-cols3="1" style="max-width:1080px;margin:40px auto 0;display:grid;grid-template-columns:repeat(3,1fr);gap:24px">
    ${vorteile}
  </div>
`)}

${dsSection(`
  <div data-reveal="1" style="max-width:640px;margin:0 auto">
    ${dsCard(`
      <div style="text-align:center;display:flex;flex-direction:column;gap:16px;align-items:center">
        <h2 style="margin:0;font-size:32px;font-weight:800;letter-spacing:-0.03em;line-height:1.05;color:${DS.text}">${esc(l.cta.headline)}</h2>
        <p style="margin:0;font-size:18px;line-height:1.5;color:${DS.muted}">${esc(l.cta.text)}</p>
        ${dsButton(esc(l.cta.label))}
      </div>
    `)}
  </div>
`)}

${DS_REVEAL_SCRIPT}`
}

/* ─── 3. renderScrubZielgruppe ─────────────────────────────── */

export function renderScrubZielgruppe(z: ScrubZielgruppeInhalt): string {
  const herausforderungen = z.herausforderungen.map((h) =>
    dsCard(`
      <div style="display:flex;flex-direction:column;gap:10px">
        <div style="width:48px;height:48px;border-radius:14px;background:${DS.accentSoft};display:flex;align-items:center;justify-content:center;font-size:22px">${esc(h.icon)}</div>
        <h3 style="margin:0;font-size:clamp(20px,2vw,28px);font-weight:800;letter-spacing:-0.02em;color:${DS.text}">${esc(h.titel)}</h3>
        <p style="margin:0;font-size:15px;line-height:1.5;color:${DS.muted}">${esc(h.text)}</p>
      </div>
    `)
  ).join('\n')

  const loesungen = z.loesungen.map((l) =>
    `<div class="ds-card" data-reveal="1" style="background:${DS.accentSoft};border-radius:20px;padding:clamp(28px,4vw,48px);overflow:hidden;transition:transform .22s,box-shadow .22s">
      <div style="display:flex;flex-direction:column;gap:10px">
        <div style="width:48px;height:48px;border-radius:14px;background:${DS.card};display:flex;align-items:center;justify-content:center;font-size:22px">${esc(l.icon)}</div>
        <h3 style="margin:0;font-size:clamp(20px,2vw,28px);font-weight:800;letter-spacing:-0.02em;color:${DS.text}">${esc(l.titel)}</h3>
        <p style="margin:0;font-size:15px;line-height:1.5;color:${DS.muted}">${esc(l.text)}</p>
      </div>
    </div>`
  ).join('\n')

  const leistungen = z.relevante_leistungen.map((r) =>
    dsCard(`
      <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
        <div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:200px">
          <h3 style="margin:0;font-size:clamp(20px,2vw,28px);font-weight:800;letter-spacing:-0.02em;color:${DS.text}">${esc(r.titel)}</h3>
          <p style="margin:0;font-size:15px;line-height:1.5;color:${DS.muted}">${esc(r.text)}</p>
        </div>
        ${r.href ? `<a class="ds-btn" href="${escAttr(r.href)}" style="display:inline-flex;align-items:center;gap:8px;background:${DS.accentSoft};color:${DS.accent};font-weight:600;font-size:14px;padding:12px 20px;border-radius:999px;text-decoration:none;transition:filter .18s,transform .1s;white-space:nowrap">Mehr erfahren &rarr;</a>` : ''}
      </div>
    `)
  ).join('\n')

  return `${DS_STYLE}
${dsSection(`
  ${heroHeader(esc(z.eyebrow), esc(z.headline), esc(z.lead))}
`, escAttr(z.slug))}

${dsSection(`
  ${sectionHeader('Herausforderungen', 'Typische Herausforderungen')}
  <div data-split="1" style="max-width:1080px;margin:40px auto 0;display:grid;grid-template-columns:repeat(2,1fr);gap:24px">
    ${herausforderungen}
  </div>
`)}

${dsSection(`
  ${sectionHeader('L\u00f6sungen', 'So unterst\u00fctzen wir Sie')}
  <div data-split="1" style="max-width:1080px;margin:40px auto 0;display:grid;grid-template-columns:repeat(2,1fr);gap:24px">
    ${loesungen}
  </div>
`)}

${dsSection(`
  ${sectionHeader('Leistungen', 'Relevante Leistungen')}
  <div style="max-width:960px;margin:40px auto 0;display:flex;flex-direction:column;gap:20px">
    ${leistungen}
  </div>
`)}

${dsSection(`
  <div data-reveal="1" style="max-width:640px;margin:0 auto">
    ${dsCard(`
      <div style="text-align:center;display:flex;flex-direction:column;gap:16px;align-items:center">
        <h2 style="margin:0;font-size:32px;font-weight:800;letter-spacing:-0.03em;line-height:1.05;color:${DS.text}">${esc(z.cta.headline)}</h2>
        <p style="margin:0;font-size:18px;line-height:1.5;color:${DS.muted}">${esc(z.cta.text)}</p>
        ${dsButton(esc(z.cta.label))}
      </div>
    `)}
  </div>
`)}

${DS_REVEAL_SCRIPT}`
}

/* ─── 4. renderScrubErfahrungen ────────────────────────────── */

export function renderScrubErfahrungen(e: ScrubErfahrungenInhalt): string {
  const projekte = (e.projekte && e.projekte.length > 0)
    ? dsSection(`
  ${sectionHeader('Projekte', 'Vorher &amp; Nachher')}
  <div style="max-width:960px;margin:40px auto 0;display:flex;flex-direction:column;gap:32px">
    ${e.projekte.map((p: ScrubProjekt, idx: number) => {
      const kennzahlen = p.kennzahlen && p.kennzahlen.length > 0
        ? `<div data-reveal="1" style="display:flex;gap:24px;flex-wrap:wrap;margin-top:20px;padding-top:20px;border-top:1px solid ${DS.border}">
            ${p.kennzahlen.map((k) =>
              `<div style="flex:1;min-width:100px;text-align:center">
                <div style="font-size:28px;font-weight:800;color:${DS.accent};letter-spacing:-0.02em">${esc(k.wert)}</div>
                <div style="font-size:13px;color:${DS.muted};margin-top:4px">${esc(k.label)}</div>
              </div>`
            ).join('\n')}
          </div>`
        : ''
      const hatBilder = p.bild_vorher && p.bild_nachher
      const slider = hatBilder
        ? `<div style="position:relative;border-radius:12px;overflow:hidden;margin-top:20px" data-slider="${idx}">
            <div class="ss-slider-nachher" style="width:100%">
              <img src="${escAttr(p.bild_nachher!)}" alt="Nachher: ${escAttr(p.titel)}" loading="lazy" style="width:100%;display:block">
            </div>
            <div class="ss-slider-vorher" style="position:absolute;top:0;left:0;height:100%;width:50%;overflow:hidden">
              <img src="${escAttr(p.bild_vorher!)}" alt="Vorher: ${escAttr(p.titel)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">
            </div>
            <div class="ss-slider-handle" style="position:absolute;top:0;left:50%;width:3px;height:100%;background:${DS.card};cursor:ew-resize;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:translateX(-50%)">
              <div style="width:36px;height:36px;border-radius:50%;background:${DS.card};box-shadow:0 2px 8px rgba(0,0,0,.15);display:flex;align-items:center;justify-content:center;gap:2px;font-size:12px;color:${DS.accent}"><span>&#9664;</span><span>&#9654;</span></div>
            </div>
            <span style="position:absolute;bottom:12px;left:12px;background:rgba(23,24,26,.7);color:#fff;font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px">Vorher</span>
            <span style="position:absolute;bottom:12px;right:12px;background:rgba(10,92,153,.8);color:#fff;font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px">Nachher</span>
          </div>`
        : ''
      return dsCard(`
        <div style="display:flex;flex-direction:column;gap:16px">
          <div style="display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:8px">
            <h3 style="margin:0;font-size:clamp(20px,2vw,28px);font-weight:800;letter-spacing:-0.02em;color:${DS.text}">${esc(p.titel)}</h3>
            <div style="font-size:14px;color:${DS.muted}">${esc(p.ort)} &middot; ${esc(p.typ)}</div>
          </div>
          ${slider}
          <div data-split="1" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:8px">
            <div style="background:rgba(220,53,69,.06);border-radius:14px;padding:clamp(16px,2vw,24px);display:flex;flex-direction:column;gap:8px">
              <div style="display:inline-flex;background:rgba(220,53,69,.12);color:#c0392b;font-size:12px;font-weight:600;padding:6px 14px;border-radius:999px;align-self:flex-start">Vorher</div>
              <p style="margin:0;font-size:15px;line-height:1.5;color:${DS.muted}">${esc(p.vorher)}</p>
            </div>
            <div style="background:${DS.accentSoft};border-radius:14px;padding:clamp(16px,2vw,24px);display:flex;flex-direction:column;gap:8px">
              <div style="display:inline-flex;background:rgba(10,92,153,.12);color:${DS.accent};font-size:12px;font-weight:600;padding:6px 14px;border-radius:999px;align-self:flex-start">Nachher</div>
              <p style="margin:0;font-size:15px;line-height:1.5;color:${DS.muted}">${esc(p.nachher)}</p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
            <div style="display:inline-flex;background:rgba(10,92,153,.08);color:${DS.accent};font-size:13px;font-weight:600;padding:6px 14px;border-radius:999px">Ergebnis</div>
            <span style="font-size:15px;color:${DS.text};font-weight:600">${esc(p.ergebnis)}</span>
          </div>
          ${kennzahlen}
        </div>
      `)
    }).join('\n')}
  </div>
`) + `
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

  const stimmen = e.stimmen.map((s) =>
    dsCard(`
      <div style="display:flex;flex-direction:column;gap:16px;height:100%">
        <div style="font-size:48px;line-height:1;color:${DS.accent};opacity:.25">&ldquo;</div>
        <p style="margin:0;font-size:15px;line-height:1.6;color:${DS.muted};flex:1">${esc(s.text)}</p>
        <div style="display:flex;align-items:center;gap:12px;margin-top:auto;padding-top:16px;border-top:1px solid ${DS.border}">
          <div style="width:40px;height:40px;border-radius:50%;background:${DS.accentSoft};color:${DS.accent};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700">${esc(s.initialen)}</div>
          <div>
            <div style="font-size:14px;font-weight:700;color:${DS.text}">${esc(s.name)}</div>
            <div style="font-size:13px;color:${DS.muted}">${esc(s.rolle)}</div>
          </div>
        </div>
      </div>
    `)
  ).join('\n')

  const fallstudien = e.fallstudien.length > 0
    ? dsSection(`
  ${sectionHeader('Fallstudien', 'Fallstudien')}
  <div data-cols3="1" style="max-width:1080px;margin:40px auto 0;display:grid;grid-template-columns:repeat(3,1fr);gap:24px">
    ${e.fallstudien.map((f) =>
      dsCard(`
        <div style="display:flex;flex-direction:column;gap:12px;height:100%">
          <div style="display:inline-flex;background:${DS.accentSoft};color:${DS.accent};font-size:12px;font-weight:600;padding:6px 14px;border-radius:999px;align-self:flex-start">${esc(f.kunde)}</div>
          <h3 style="margin:0;font-size:clamp(20px,2vw,28px);font-weight:800;letter-spacing:-0.02em;color:${DS.text}">${esc(f.titel)}</h3>
          <p style="margin:0;font-size:15px;line-height:1.5;color:${DS.muted};flex:1">${esc(f.beschreibung)}</p>
          <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(10,92,153,.08);color:${DS.accent};font-size:13px;font-weight:600;padding:8px 14px;border-radius:12px;margin-top:auto">
            <span style="font-size:16px">&#10003;</span>
            ${esc(f.ergebnis)}
          </div>
        </div>
      `)
    ).join('\n')}
  </div>
`)
    : ''

  return `${DS_STYLE}
${dsSection(`
  ${heroHeader(esc(e.eyebrow), esc(e.headline))}
`, 'erfahrungen')}

${projekte}

${dsSection(`
  ${sectionHeader('Stimmen', 'Was unsere Kunden sagen')}
  <div data-cols3="1" style="max-width:1080px;margin:40px auto 0;display:grid;grid-template-columns:repeat(3,1fr);gap:24px">
    ${stimmen}
  </div>
`)}

${fallstudien}

${DS_REVEAL_SCRIPT}`
}

/* ─── 5. renderScrubKarriere ───────────────────────────────── */

export function renderScrubKarriere(k: ScrubKarriereInhalt, submitZiel?: string | null): string {
  const benefits = k.benefits.map((b) =>
    dsCard(`
      <div style="display:flex;flex-direction:column;gap:10px;text-align:center;align-items:center">
        <div style="width:48px;height:48px;border-radius:14px;background:${DS.accentSoft};display:flex;align-items:center;justify-content:center;font-size:22px">${esc(b.icon)}</div>
        <h3 style="margin:0;font-size:clamp(20px,2vw,28px);font-weight:800;letter-spacing:-0.02em;color:${DS.text}">${esc(b.titel)}</h3>
        <p style="margin:0;font-size:15px;line-height:1.5;color:${DS.muted}">${esc(b.text)}</p>
      </div>
    `)
  ).join('\n')

  const stellen = k.stellen.map((s) =>
    dsCard(`
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:8px">
          <h3 style="margin:0;font-size:clamp(20px,2vw,28px);font-weight:800;letter-spacing:-0.02em;color:${DS.text}">${esc(s.titel)}</h3>
          <div style="font-size:14px;color:${DS.muted}">${esc(s.ort)} &middot; ${esc(s.typ)}</div>
        </div>
        <p style="margin:0;font-size:15px;line-height:1.5;color:${DS.muted}">${esc(s.beschreibung)}</p>
        <div style="margin-top:4px">
          ${dsButton(esc(k.cta_label), '#bewerbung')}
        </div>
      </div>
    `)
  ).join('\n')

  const action = submitZiel ? ` action="${escAttr(submitZiel)}" method="post"` : ''

  const inputStyle = `width:100%;padding:14px 16px;border:1px solid ${DS.border};border-radius:12px;font-size:15px;background:${DS.bg};color:${DS.text};outline:none;transition:border-color .2s;box-sizing:border-box`

  return `${DS_STYLE}
${dsSection(`
  ${heroHeader(esc(k.eyebrow), esc(k.headline), esc(k.lead))}
`, 'karriere')}

${dsSection(`
  ${sectionHeader('Benefits', 'Warum bei uns?')}
  <div data-cols3="1" style="max-width:1080px;margin:40px auto 0;display:grid;grid-template-columns:repeat(3,1fr);gap:24px">
    ${benefits}
  </div>
`)}

${dsSection(`
  ${sectionHeader('Stellen', 'Offene Stellen')}
  <div style="max-width:960px;margin:40px auto 0;display:flex;flex-direction:column;gap:20px">
    ${stellen}
  </div>
`)}

${dsSection(`
  <div data-reveal="1" style="max-width:640px;margin:0 auto" id="bewerbung">
    ${dsCard(`
      <div style="text-align:center;display:flex;flex-direction:column;gap:16px;align-items:center">
        <h2 style="margin:0;font-size:32px;font-weight:800;letter-spacing:-0.03em;line-height:1.05;color:${DS.text}">Jetzt bewerben</h2>
        <form data-kontakt-form${action} style="width:100%;display:flex;flex-direction:column;gap:14px;margin-top:8px;text-align:left">
          <input style="${inputStyle}" type="text" name="name" placeholder="Vor- und Nachname" required>
          <input style="${inputStyle}" type="email" name="email" placeholder="E-Mail" required>
          <input style="${inputStyle}" type="tel" name="telefon" placeholder="Telefon">
          <input style="${inputStyle}" type="text" name="stelle" placeholder="Gew&uuml;nschte Stelle">
          <textarea style="${inputStyle};min-height:100px;resize:vertical" name="nachricht" placeholder="Kurz zu Ihnen: Erfahrung, Motivation..."></textarea>
          <label style="display:flex;align-items:flex-start;gap:10px;font-size:14px;color:${DS.muted};cursor:pointer">
            <input type="checkbox" name="datenschutz" required style="margin-top:3px">
            <span>Ich habe die <a href="/datenschutz" style="color:${DS.accent};text-decoration:underline">Datenschutzerkl&auml;rung</a> gelesen und stimme zu.</span>
          </label>
          <div style="text-align:center;margin-top:8px">
            <button class="ds-btn" type="submit" style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(180deg,#1A7BC5,${DS.accent});color:#fff;font-weight:600;font-size:16px;padding:16px 28px;border-radius:999px;box-shadow:0 2px 6px rgba(10,92,153,.35),0 8px 20px rgba(10,92,153,.25);border:none;cursor:pointer;transition:filter .18s,transform .1s">${esc(k.cta_label)} &rarr;</button>
          </div>
          <p data-form-erfolg style="display:none;text-align:center;font-size:15px;color:${DS.accent};margin:8px 0 0">Danke! Wir melden uns innerhalb von 48 Stunden.</p>
        </form>
      </div>
    `)}
  </div>
`)}

${DS_REVEAL_SCRIPT}`
}

/* ─── 6. renderScrubKontaktSeite ───────────────────────────── */

export function renderScrubKontaktSeite(kontakt: ScrubInhalte['kontakt'], submitZiel?: string | null): string {
  const action = submitZiel ? ` action="${escAttr(submitZiel)}" method="post"` : ''
  const inputStyle = `width:100%;padding:14px 16px;border:1px solid ${DS.border};border-radius:12px;font-size:15px;background:${DS.bg};color:${DS.text};outline:none;transition:border-color .2s;box-sizing:border-box`

  return `${DS_STYLE}
${dsSection(`
  <div data-split="1" style="max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,4vw,48px);align-items:center">
    <div data-reveal="1">
      ${dsCard(`
        <div style="display:flex;flex-direction:column;gap:16px">
          <div style="display:inline-flex;background:${DS.accentSoft};color:${DS.accent};font-size:12px;font-weight:600;padding:6px 14px;border-radius:999px;align-self:flex-start">${esc(kontakt.pill)}</div>
          <h1 style="margin:0;font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-0.03em;line-height:1.05;color:${DS.text}">${esc(kontakt.h2)}</h1>
          <p style="margin:0;font-size:18px;line-height:1.5;color:${DS.muted}">${esc(kontakt.lead)}</p>
          <form data-kontakt-form${action} style="display:flex;flex-direction:column;gap:14px;margin-top:8px">
            <input style="${inputStyle}" type="text" name="name" placeholder="Name" required>
            <input style="${inputStyle}" type="email" name="email" placeholder="E-Mail" required>
            <input style="${inputStyle}" type="tel" name="telefon" placeholder="Telefon">
            <textarea style="${inputStyle};min-height:100px;resize:vertical" name="nachricht" placeholder="Ihre Nachricht..."></textarea>
            <label style="display:flex;align-items:flex-start;gap:10px;font-size:14px;color:${DS.muted};cursor:pointer">
              <input type="checkbox" name="datenschutz" required style="margin-top:3px">
              <span>Ich habe die <a href="/datenschutz" style="color:${DS.accent};text-decoration:underline">Datenschutzerkl&auml;rung</a> gelesen und stimme zu.</span>
            </label>
            <div>
              <button class="ds-btn" type="submit" style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(180deg,#1A7BC5,${DS.accent});color:#fff;font-weight:600;font-size:16px;padding:16px 28px;border-radius:999px;box-shadow:0 2px 6px rgba(10,92,153,.35),0 8px 20px rgba(10,92,153,.25);border:none;cursor:pointer;transition:filter .18s,transform .1s">${esc(kontakt.cta_label)} &rarr;</button>
            </div>
            <p data-form-erfolg style="display:none;font-size:15px;color:${DS.accent};margin:8px 0 0">Danke! Wir melden uns innerhalb von 24 Stunden.</p>
          </form>
        </div>
      `)}
    </div>
    <div data-reveal="1" style="background:${DS.accentSoft};border-radius:20px;aspect-ratio:4/5;display:flex;align-items:center;justify-content:center;overflow:hidden">
      <div style="text-align:center;color:${DS.accent};opacity:.3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:80px;height:80px"><path d="M4 5a2 2 0 012-2h2l2 5-2.2 1.4a12 12 0 006.8 6.8L16 14l5 2v2a2 2 0 01-2 2A16 16 0 014 5z"/></svg>
        <div style="font-size:14px;font-weight:600;margin-top:12px">Kontakt</div>
      </div>
    </div>
  </div>
`, 'kontakt')}

${DS_REVEAL_SCRIPT}`
}

/* ─── 7. renderScrubZiele ──────────────────────────────────── */

export function renderScrubZiele(z: ScrubZieleInhalt): string {
  const items = z.ziele.map((g, i) => {
    const nr = String(i + 1).padStart(2, '0')
    return dsCard(`
      <div style="position:relative">
        <span style="position:absolute;top:-8px;right:0;font-size:72px;font-weight:800;color:rgba(10,92,153,.06);line-height:1;pointer-events:none">${nr}</span>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div style="width:48px;height:48px;border-radius:14px;background:${DS.accentSoft};display:flex;align-items:center;justify-content:center;font-size:22px">${esc(g.icon)}</div>
          <h3 style="margin:0;font-size:clamp(20px,2vw,28px);font-weight:800;letter-spacing:-0.02em;color:${DS.text}">${esc(g.titel)}</h3>
          <p style="margin:0;font-size:15px;line-height:1.5;color:${DS.muted}">${esc(g.text)}</p>
        </div>
      </div>
    `)
  }).join('\n')

  return `${DS_STYLE}
${dsSection(`
  ${heroHeader(esc(z.eyebrow), esc(z.headline), esc(z.lead))}
`, 'ziele')}

${dsSection(`
  <div data-cols3="1" style="max-width:1080px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:24px">
    ${items}
  </div>
`)}

${DS_REVEAL_SCRIPT}`
}

/* ─── 8. renderScrubAngebote ───────────────────────────────── */

export function renderScrubAngebote(a: ScrubAngeboteInhalt): string {
  const pakete = a.pakete.map((p) => {
    const features = p.features.map((f) =>
      `<div style="display:flex;align-items:center;gap:10px;font-size:15px;line-height:1.4;color:${DS.muted}">
        <span style="flex-shrink:0;width:20px;height:20px;border-radius:50%;background:${DS.accentSoft};color:${DS.accent};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700">&#10003;</span>
        ${esc(f)}
      </div>`
    ).join('\n')

    const isHighlight = p.highlight
    const borderStyle = isHighlight ? `border:2px solid ${DS.accent}` : `border:1px solid ${DS.border}`
    const badgeHtml = isHighlight
      ? `<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(180deg,#1A7BC5,${DS.accent});color:#fff;font-size:12px;font-weight:700;padding:6px 16px;border-radius:999px;white-space:nowrap;box-shadow:0 2px 8px rgba(10,92,153,.3)">Beliebteste Wahl</div>`
      : ''

    return `<div class="ds-card" data-reveal="1" style="position:relative;background:${DS.card};border-radius:20px;${borderStyle};box-shadow:0 1px 3px rgba(23,24,26,.06),0 4px 12px rgba(23,24,26,.05);padding:clamp(28px,4vw,48px);padding-top:${isHighlight ? 'clamp(40px,5vw,56px)' : 'clamp(28px,4vw,48px)'};overflow:visible;transition:transform .22s,box-shadow .22s;display:flex;flex-direction:column;gap:20px">
      ${badgeHtml}
      <h3 style="margin:0;font-size:clamp(20px,2vw,28px);font-weight:800;letter-spacing:-0.02em;color:${DS.text};text-align:center">${esc(p.titel)}</h3>
      <div style="text-align:center">
        <span style="font-size:clamp(36px,5vw,48px);font-weight:800;letter-spacing:-0.03em;color:${DS.text}">${esc(p.preis)}</span>
        <span style="font-size:16px;color:${DS.muted};margin-left:4px">/${esc(p.intervall)}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;flex:1">
        ${features}
      </div>
      <div style="text-align:center;margin-top:auto">
        ${isHighlight
          ? dsButton('Jetzt starten')
          : `<a class="ds-btn" href="#kontakt" style="display:inline-flex;align-items:center;gap:8px;background:${DS.card};color:${DS.accent};font-weight:600;font-size:16px;padding:16px 28px;border-radius:999px;border:2px solid ${DS.accent};text-decoration:none;transition:filter .18s,transform .1s">Jetzt starten &rarr;</a>`
        }
      </div>
    </div>`
  }).join('\n')

  const hinweis = a.hinweis
    ? `<p data-reveal="1" style="text-align:center;margin:32px auto 0;font-size:15px;line-height:1.5;color:${DS.muted};max-width:560px">${esc(a.hinweis)}</p>`
    : ''

  return `${DS_STYLE}
${dsSection(`
  ${heroHeader(esc(a.eyebrow), esc(a.headline), esc(a.lead))}
`, 'angebote')}

${dsSection(`
  <div data-cols3="1" style="max-width:1080px;margin:0 auto;display:grid;grid-template-columns:repeat(${a.pakete.length > 3 ? 3 : a.pakete.length},1fr);gap:24px;align-items:stretch">
    ${pakete}
  </div>
  ${hinweis}
`)}

${DS_REVEAL_SCRIPT}`
}
