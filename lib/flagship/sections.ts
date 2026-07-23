/**
 * Flagship-Engine: Sektions-Renderer für das Pflicht-Seitenskelett (BF §1.1).
 * Jede Sektion trägt einen Marker-Kommentar (<!-- sektion:… -->) für den Stresstest.
 */

import type {
  AblaufInhalt, ConversionInhalt, EmpathieInhalt, ErgebnisseInhalt, FaktenInhalt,
  FaqInhalt, FlagshipInhalte, FooterInhalt, HeroInhalt, LeistungenInhalt,
  LokalInhalt, MarkenInhalt, NachweiseInhalt, NavInhalt, ProzessInhalt,
  ReferenzenInhalt, SignatureInhalt, StimmenInhalt, ZahlenInhalt,
} from './types'
import { esc, escAttr, em, hl, icon, mediaSlot } from './html'

function logoHtml(nav: NavInhalt, hell: boolean): string {
  if (nav.logo_bold) {
    return `${esc(nav.logo_text)}<b>&nbsp;${esc(nav.logo_bold)}</b>`
  }
  return `${esc(nav.logo_text)}${hell ? '<i></i>' : ''}`
}

export function renderNav(nav: NavInhalt, hell: boolean, funnelUrl: string): string {
  const links = nav.links
    .map((l) => `<a href="${escAttr(l.anker)}">${esc(l.label)}</a>`)
    .join('\n      ')
  const ctaKlasse = hell ? 'btn sun' : 'btn'
  return `<!-- sektion:nav -->
<nav id="nav">
  <div class="wrap">
    <a class="logo" href="#top">${logoHtml(nav, hell)}</a>
    <div class="navlinks">
      ${links}
    </div>
    <a class="${ctaKlasse}" href="${escAttr(funnelUrl)}">${esc(nav.cta_label)} <span class="arr">→</span></a>
  </div>
</nav>`
}

export function renderHero(hero: HeroInhalt, hell: boolean, funnelUrl: string): string {
  const headline = hero.headline_zeilen.map((z) => hl(z)).join('<br>')
  const chips = hero.chips
    .map((c) => hero.chip_stil === 'check'
      ? `<span>${icon('check', 2.4)} ${esc(c)}</span>`
      : `<span><i></i> ${esc(c)}</span>`)
    .join('\n        ')
  const ctaKlasse = hell ? 'btn sun' : 'btn'
  const sekundaer = hero.cta_sekundaer
    ? `\n        <a class="btn ghost" href="${escAttr(hero.cta_sekundaer.href)}">${esc(hero.cta_sekundaer.label)}</a>`
    : ''

  // Video-Hero (Growth-Level): Looping-Video als Hintergrund mit Gradient-Shade
  if (hero.video?.src) {
    const modus = hero.video.modus || 'loop'
    const posterAttr = hero.video.poster
      ? ` poster="${escAttr(hero.video.poster)}"`
      : hero.media.datei
        ? ` poster="${escAttr(hero.media.datei)}"`
        : ''
    const reducedBg = hero.video.poster || hero.media.datei
      ? `\n  <style>@media(prefers-reduced-motion:reduce){.vhero{background:url('${escAttr(hero.video.poster || hero.media.datei!)}') center/cover}}</style>`
      : ''
    const autoplayAttr = modus === 'loop' ? ' autoplay' : ''
    const loopAttr = modus === 'loop' ? ' loop' : ''
    const scrubClass = modus === 'scrub' ? ' scrub' : ''
    return `<!-- sektion:hero -->
<header class="vhero${scrubClass}" id="top" data-modus="${modus}">
  <video id="heroVideo"${autoplayAttr} muted${loopAttr} playsinline preload="metadata"${posterAttr}>
    <source src="${escAttr(hero.video.src)}" type="video/mp4">
  </video>
  <div class="vshade"></div>
  <div class="wrap vinner">
    <div class="rv in" style="max-width:640px">
      <span class="eyebrow">${esc(hero.eyebrow)}</span>
      <h1>${headline}</h1>
      <p class="lead" style="margin:24px 0 36px">${esc(hero.lead)}</p>
      <div class="cta-row">
        <a class="${ctaKlasse}" href="${escAttr(funnelUrl)}">${esc(hero.cta_label)} <span class="arr">→</span></a>${sekundaer}
      </div>
      <div class="chips">
        ${chips}
      </div>
    </div>
  </div>
  <button class="vplay" aria-label="Video abspielen"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
  <div class="stat-card vcard"><b>${esc(hero.stat2.wert)}</b><small>${esc(hero.stat2.label)}</small></div>
  <div class="scroll-hint">Entdecken <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 9l-7 7-7-7"/></svg></div>${reducedBg}
</header>`
  }

  // Standard: Fullscreen-Bild-Hero (statisches Hintergrundbild wie Video-Hero)
  const poster = hero.media.datei || ''
  return `<!-- sektion:hero -->
<header class="vhero" id="top">
  ${poster ? `<img class="vhero-img" src="${escAttr(poster)}" alt="${escAttr(hero.media.alt || hero.media.label)}" width="1440" height="900" loading="eager">` : ''}
  <div class="vshade"></div>
  <div class="wrap vinner">
    <div class="rv in" style="max-width:640px">
      <span class="eyebrow">${esc(hero.eyebrow)}</span>
      <h1>${headline}</h1>
      <p class="lead" style="margin:24px 0 36px">${esc(hero.lead)}</p>
      <div class="cta-row">
        <a class="${ctaKlasse}" href="${escAttr(funnelUrl)}">${esc(hero.cta_label)} <span class="arr">→</span></a>${sekundaer}
      </div>
      <div class="chips">
        ${chips}
      </div>
    </div>
  </div>
  <div class="stat-card vcard"><b>${esc(hero.stat2.wert)}</b><small>${esc(hero.stat2.label)}</small></div>
  <div class="scroll-hint">Entdecken <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 9l-7 7-7-7"/></svg></div>
</header>`
}

export function renderFakten(fakten: FaktenInhalt): string {
  const punkte = fakten.punkte
    .map((p) => `<span>${p.icon ? icon(p.icon, 2) + ' ' : ''}${em(p.text)}</span>`)
    .join('\n    ')
  return `<!-- sektion:fakten -->
<div class="trust">
  <div class="wrap">
    ${punkte}
  </div>
</div>`
}

export function renderNachweise(n: NachweiseInhalt): string {
  const karten = n.items
    .map((item, i) => {
      const ic = item.icon ? `<div class="ic">${icon(item.icon)}</div>` : `<div class="ic">${icon('shield')}</div>`
      const desc = item.beschreibung ? `\n        <p>${esc(item.beschreibung)}</p>` : ''
      return `<div class="nw-card rv" style="--i:${i}">
        ${ic}
        <h3>${esc(item.label)}</h3>${desc}
      </div>`
    })
    .join('\n      ')
  return `<!-- sektion:nachweise -->
<section id="nachweise">
  <div class="wrap">
    <div class="rv" style="max-width:640px">
      <span class="eyebrow">${esc(n.eyebrow)}</span>
      <h2>${hl(n.headline)}</h2>
    </div>
    <div class="nachweise-grid">
      ${karten}
    </div>
  </div>
</section>`
}

export function renderMarken(m: MarkenInhalt): string {
  const items = m.logos
    .map((l) => l.url
      ? `<span class="marquee-item"><img src="${escAttr(l.url)}" alt="${escAttr(l.name)}"></span>`
      : `<span class="marquee-item">${esc(l.name)}</span>`)
    .join('\n      ')
  // Duplicate for seamless loop
  const track = `${items}\n      ${items}`
  const label = m.label ? `<div class="marquee-label">${esc(m.label)}</div>` : ''
  return `<!-- sektion:marken -->
<div class="marquee">
  ${label}<div class="marquee-track">
      ${track}
    </div>
</div>`
}

export function renderProzess(p: ProzessInhalt): string {
  const stationen = p.schritte
    .map((s, i) => {
      const mediaPart = s.media
        ? `<div class="proz-media">${mediaSlot(s.media, 'proz-media')}</div>`
        : s.icon
          ? `<div class="proz-media" style="display:grid;place-items:center;background:var(--panel)">${icon(s.icon, 3)}</div>`
          : ''
      return `<div class="proz-station rv" style="--i:${i}">
        ${mediaPart}<div class="proz-body">
          <div class="proz-num">Schritt ${String(i + 1).padStart(2, '0')}</div>
          <h3>${esc(s.titel)}</h3>
          <p>${esc(s.text)}</p>
        </div>
      </div>`
    })
    .join('\n      ')
  return `<!-- sektion:prozess -->
<section id="prozess">
  <div class="wrap">
    <div class="rv" style="max-width:660px">
      <span class="eyebrow">${esc(p.eyebrow)}</span>
      <h2>${hl(p.headline)}</h2>
    </div>
    <div class="prozess-scroll">
      ${stationen}
    </div>
  </div>
</section>`
}

export function renderReferenzen(r: ReferenzenInhalt): string {
  const projekte = r.projekte
    .map((p, i) => {
      const kz = p.kennzahlen
        .map((k) => `<span><b>${esc(k.wert)}</b> ${esc(k.label)}</span>`)
        .join('\n          ')
      const muster = p.als === 'muster' ? '\n        <div class="ref-muster">Beispielprojekt</div>' : ''
      return `<div class="ref-card rv" style="--i:${i}">
        <div class="ref-typ">${esc(p.typ)}</div>
        <h3>${esc(p.titel)}</h3>
        <div class="ref-kz">
          ${kz}
        </div>${muster}
      </div>`
    })
    .join('\n      ')
  return `<!-- sektion:referenzen -->
<section class="ref-section" id="referenzen">
  <div class="wrap">
    <div class="rv" style="max-width:660px">
      <span class="eyebrow">${esc(r.eyebrow)}</span>
      <h2>${hl(r.headline)}</h2>
    </div>
    <div class="ref-grid">
      ${projekte}
    </div>
  </div>
</section>`
}

export function renderEmpathie(e: EmpathieInhalt): string {
  let rechts: string
  if (e.variante === 'zitat' && e.zitat) {
    rechts = `<blockquote class="rv" style="--i:1">
      ${esc(e.zitat.text)}
      <cite>— ${esc(e.zitat.cite)}</cite>
    </blockquote>`
  } else {
    const items = (e.situationen || [])
      .map((s, i) => `<div class="rv" style="--i:${i}">${icon('check', 2)}${esc(s)}</div>`)
      .join('\n      ')
    rechts = `<div class="situations">
      ${items}
    </div>`
  }
  return `<!-- sektion:empathie -->
<section class="empathie">
  <div class="wrap">
    <div class="rv">
      <span class="eyebrow">${esc(e.eyebrow)}</span>
      <h2>${hl(e.headline)}</h2>
      <p class="lead" style="margin-top:22px">${esc(e.text)}</p>
    </div>
    ${rechts}
  </div>
</section>`
}

export function renderSignature(sig: SignatureInhalt): string {
  return `<!-- sektion:signature -->
<section class="sig" id="sig">
  <div class="stage">
    <div class="head">
      <span class="eyebrow" style="justify-content:center">${esc(sig.eyebrow)}</span>
      <h2>${hl(sig.headline, 'on')}</h2>
    </div>
    <div class="scene">
      ${mediaSlot(sig.vorher, 'lay vorher')}
      ${mediaSlot(sig.nachher, 'lay nachher').replace('class="lay nachher media"', 'class="lay nachher media" id="sigLayer"')}
      <div class="kante" id="sigKante"></div>
      <span class="tag v">${esc(sig.tag_vorher)}</span>
      <span class="tag n">${esc(sig.tag_nachher)}</span>
    </div>
    <p class="cap">${esc(sig.cap)}</p>
    <div class="hint">Weiterscrollen <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 9l-7 7-7-7"/></svg></div>
  </div>
</section>`
}

export function renderLeistungen(l: LeistungenInhalt): string {
  const karten = l.karten
    .map((k, i) => {
      const kopf = l.stil === 'nummern'
        ? `<span class="no">${esc(k.no || '')}</span>`
        : `<div class="ic">${icon(k.icon || 'sparkle')}</div>`
      const link = k.link_label ? `\n        <span class="fp">${esc(k.link_label)}</span>` : ''
      return `<div class="card rv" style="--i:${i}">
        ${kopf}
        <h3>${esc(k.titel)}</h3>
        <p>${esc(k.text)}</p>${link}
      </div>`
    })
    .join('\n      ')
  const hinweis = l.hinweis
    ? `\n    <p class="rv leist-hinweis">${esc(l.hinweis.text)} <a href="${escAttr(l.hinweis.link_anker)}">${esc(l.hinweis.link_label)}</a></p>`
    : ''
  return `<!-- sektion:leistungen -->
<section class="leist tex" id="leistungen">
  <div class="wrap">
    <div class="rv" style="max-width:660px">
      <span class="eyebrow">${esc(l.eyebrow)}</span>
      <h2>${hl(l.headline)}</h2>
    </div>
    <div class="grid3">
      ${karten}
    </div>${hinweis}
  </div>
</section>`
}

export function renderAblauf(a: AblaufInhalt): string {
  const steps = a.schritte
    .map((s, i) => `<button class="pstep${i === 0 ? ' active' : ''}" data-step="${i}" type="button"><span class="dot">${i + 1}</span><small>${esc(s.titel)}</small></button>`)
    .join('\n      ')
  const erster = a.schritte[0]
  return `<!-- sektion:ablauf -->
<section id="ablauf">
  <div class="wrap">
    <div class="rv" style="max-width:640px;margin:0 auto;text-align:center">
      <span class="eyebrow" style="justify-content:center">${esc(a.eyebrow)}</span>
      <h2>${hl(a.headline)}</h2>
    </div>
    <div class="proz-timeline rv" id="prozTimeline">
      <div class="proz-line" id="prozLine" style="width:0%"></div>
      ${steps}
    </div>
    <div class="proz-card rv" style="--i:1" id="prozCard">
      <div class="ic">${icon(erster.icon)}</div>
      <h3>${esc(erster.titel)}</h3>
      <p>${esc(erster.text)}</p>
      <span class="t">${esc(erster.badge)}</span>
    </div>
  </div>
</section>`
}

export function renderErgebnisse(e: ErgebnisseInhalt): string {
  const lead = e.lead ? `\n      <p class="lead" style="margin-top:18px">${esc(e.lead)}</p>` : ''
  let inhalt: string
  if (e.variante === 'ba_slider') {
    inhalt = `<div class="ba-grid">
      ${(e.paare || [])
        .map((p, i) => `<figure class="ba rv" style="--i:${i}" data-ba>
        ${mediaSlot(p.vorher, 'lay before')}
        ${mediaSlot(p.nachher, 'lay after')}
        <div class="handle"><div class="knob"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M8 7l-4 5 4 5M16 7l4 5-4 5"/></svg></div></div>
        <figcaption>${esc(p.caption)}</figcaption>
      </figure>`)
        .join('\n      ')}
    </div>`
  } else {
    inhalt = `<div class="gal">
      ${(e.bilder || [])
        .map((b, i) => `<figure class="rv media" style="--i:${i}" data-label="${escAttr(b.media.label)}">
        ${b.media.datei ? `<img src="${escAttr(b.media.datei)}" alt="${escAttr(b.media.alt || b.media.label)}"${b.media.breite && b.media.hoehe ? ` width="${b.media.breite}" height="${b.media.hoehe}"` : ''} onload="this.parentElement.classList.add('loaded')" onerror="this.remove()">` : ''}
        <figcaption>${esc(b.caption)}</figcaption>
      </figure>`)
        .join('\n      ')}
    </div>`
  }
  return `<!-- sektion:ergebnisse -->
<section id="ergebnisse">
  <div class="wrap">
    <div class="rv" style="max-width:680px">
      <span class="eyebrow">${esc(e.eyebrow)}</span>
      <h2>${hl(e.headline)}</h2>${lead}
    </div>
    ${inhalt}
  </div>
</section>`
}

export function renderZahlen(z: ZahlenInhalt): string {
  const items = z.items
    .map((it, i) => {
      const wert = typeof it.wert === 'number'
        ? `<span data-count="${it.wert}">${it.start ?? 0}</span>`
        : esc(it.wert)
      const suffix = it.suffix ? `<em>${esc(it.suffix)}</em>` : ''
      return `<div class="z rv" style="--i:${i}"><b>${it.prefix ? esc(it.prefix) : ''}${wert}${suffix}</b><small>${esc(it.label)}</small></div>`
    })
    .join('\n    ')
  return `<!-- sektion:zahlen -->
<section class="zahlen">
  <div class="wrap zgrid">
    ${items}
  </div>
</section>`
}

export function renderStimmen(s: StimmenInhalt): string {
  // §4.3: Kundenstimmen nur aus echten Profildaten — ohne Quotes entfällt die Sektion
  if (s.quotes.length === 0) return ''
  const quotes = s.quotes
    .map((q, i) => `<div class="quote rv" style="--i:${i}">
        <span class="stars">★★★★★</span>
        <p>${esc(q.text)}</p>
        <div class="who"><span class="av">${esc(q.initialen)}</span><span><b>${esc(q.name)}</b><small>${esc(q.meta)}</small></span></div>
      </div>`)
    .join('\n      ')
  return `<!-- sektion:stimmen -->
<section>
  <div class="wrap">
    <div class="rv" style="max-width:640px">
      <span class="eyebrow">${esc(s.eyebrow)}</span>
      <h2>${hl(s.headline)}</h2>
    </div>
    <div class="grid3" style="margin-top:52px">
      ${quotes}
    </div>
  </div>
</section>`
}

export function renderLokal(l: LokalInhalt): string {
  if (l.variante === 'info') {
    const infos = (l.infos || [])
      .map((inf, i) => {
        const text = inf.telefon_link
          ? `<a href="tel:${escAttr(inf.telefon_link)}">${esc(inf.text)}</a>`
          : esc(inf.text)
        return `<div class="rv" style="--i:${i}">${icon(inf.icon)}<span><b>${esc(inf.titel)}</b>${text}</span></div>`
      })
      .join('\n      ')
    return `<!-- sektion:lokal -->
<section class="lokal-info tex" id="lokal">
  <div class="wrap">
    <div class="rv">
      <span class="eyebrow">${esc(l.eyebrow)}</span>
      <h2>${hl(l.headline)}</h2>${l.lead ? `\n      <p class="lead" style="margin-top:20px">${esc(l.lead)}</p>` : ''}
    </div>
    <div class="info">
      ${infos}
    </div>
  </div>
</section>`
  }
  const chips = (l.chips || []).map((c) => `<span>${esc(c)}</span>`).join('')
  return `<!-- sektion:lokal -->
<section class="lokal-chips tex" id="lokal">
  <div class="wrap">
    <div class="rv" style="max-width:680px">
      <span class="eyebrow">${esc(l.eyebrow)}</span>
      <h2>${hl(l.headline)}</h2>
    </div>
    <div class="bezirke rv" style="--i:1">
      ${chips}
    </div>${l.note ? `\n    <p class="lokal-note rv" style="--i:2">${esc(l.note)}</p>` : ''}
  </div>
</section>`
}

export function renderFaq(f: FaqInhalt): string {
  const fragen = f.fragen
    .map((q) => `<details class="rv">
        <summary>${esc(q.frage)}<span class="pm">+</span></summary>
        <p>${esc(q.antwort)}</p>
      </details>`)
    .join('\n      ')
  return `<!-- sektion:faq -->
<section id="faq">
  <div class="wrap">
    <div class="rv" style="max-width:640px;margin:0 auto;text-align:center">
      <span class="eyebrow" style="justify-content:center">${esc(f.eyebrow)}</span>
      <h2>${hl(f.headline)}</h2>
    </div>
    <div class="faq-list">
      ${fragen}
    </div>
  </div>
</section>`
}

/** Kurz-Conversion (BF §1.2): Telefon + „Anfrage starten" + 3 Trust-Punkte — KEIN Langformular */
export function renderConversion(c: ConversionInhalt, hell: boolean, funnelUrl: string, funnelLabel: string): string {
  const trust = c.trust
    .map((t) => `<span>${icon('check', 2.4)} ${esc(t)}</span>`)
    .join('\n        ')
  const tel = c.telefon
    ? `\n        <p class="tel-line">Lieber anrufen? <a href="tel:${escAttr(c.telefon.replace(/[^+\d]/g, ''))}">${esc(c.telefon)}</a></p>`
    : ''
  const ctaKlasse = hell ? 'btn sun' : 'btn'
  return `<!-- sektion:conversion -->
<section class="konv" id="kontakt">
  <div class="wrap">
    <div class="rv">
      <span class="eyebrow">${esc(c.eyebrow)}</span>
      <h2>${hl(c.headline)}</h2>
      <p class="lead" style="margin-top:18px">${esc(c.lead)}</p>
      <div class="k-usps">
        ${trust}
      </div>
    </div>
    <div class="konv-card rv" style="--i:1">
      <h3>${esc(funnelLabel)}</h3>
      <p>Ein paar kurze Fragen – dauert keine zwei Minuten.</p>
      <a class="${ctaKlasse}" href="${escAttr(funnelUrl)}">${esc(c.cta_label)} <span class="arr">→</span></a>${tel}
    </div>
  </div>
</section>`
}

export function renderFooter(f: FooterInhalt, nav: NavInhalt, hell: boolean, firma: string): string {
  const links = f.links
    .map((l) => `<a href="${escAttr(l.anker)}">${esc(l.label)}</a>`)
    .join('\n      ')
  return `<!-- sektion:footer -->
<footer>
  <div class="wrap">
    <div>
      <span class="logo">${logoHtml(nav, hell)}</span>
      <small style="display:block;margin-top:6px;max-width:420px">${esc(f.beschreibung)}</small>
    </div>
    <div class="fl">
      ${links}
    </div>
    <small id="rechtliches">© ${new Date().getFullYear()} ${esc(firma)} · Impressum &amp; Datenschutz werden vom System generiert</small>
  </div>
</footer>`
}

export function renderRibbon(): string {
  return `<div class="ribbon"><i></i> Demo-Vorschau · Webseiten-Verlag Deutschland</div>`
}

export function sektionsReihenfolge(inhalte: FlagshipInhalte): string[] {
  const liste = ['nav', 'hero', 'fakten']
  if (inhalte.marken) liste.push('marken')
  if (inhalte.nachweise) liste.push('nachweise')
  liste.push('empathie', 'signature', 'leistungen')
  if (inhalte.prozess) liste.push('prozess')
  if (inhalte.ablauf) liste.push('ablauf')
  liste.push('ergebnisse')
  if (inhalte.referenzen) liste.push('referenzen')
  liste.push('zahlen', 'stimmen', 'lokal', 'faq', 'conversion', 'footer')
  return liste
}
