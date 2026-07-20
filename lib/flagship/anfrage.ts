/**
 * Flagship-Engine: /anfrage- bzw. /reservierung-Funnel (BF §1.2).
 * Max. 5 Schritte, Fortschrittsbalken, eine Frage pro Screen.
 * Antworten landen strukturiert in form_submissions.qualifizierung (jsonb).
 * System-Seite — zählt nie gegen das Paket-Limit.
 */

import type { FlagshipConfig, FlagshipRenderOptionen, QualiFrage } from './types'
import { esc, escAttr } from './html'
import { flagshipCss, funnelCss } from './css'
import { funnelJs } from './js'

function optListe(name: string, optionen: string[], pflicht: boolean): string {
  return `<div class="optionen">
      ${optionen
        .map((o) => `<label class="opt"><input type="radio" name="${escAttr(name)}" value="${escAttr(o)}"${pflicht ? ' data-pflicht' : ''}><span class="punkt"></span>${esc(o)}</label>`)
        .join('\n      ')}
    </div>`
}

function qualiFeld(f: QualiFrage): string {
  if (f.typ === 'auswahl' && f.optionen?.length) {
    return optListe(f.key, f.optionen, !!f.pflicht)
  }
  return `<input type="text" name="${escAttr(f.key)}"${f.pflicht ? ' data-pflicht' : ''} placeholder="Ihre Antwort">`
}

function schrittHtml(inhalt: string, istErster: boolean): string {
  return `<div class="fschritt${istErster ? ' aktiv' : ''}">${inhalt}</div>`
}

export function renderAnfrageSeite(config: FlagshipConfig, opts: FlagshipRenderOptionen = {}): string {
  const { design, meta, funnel } = config
  const hell = design.typo_modus === 'sans_bold_hell'
  const reservierung = funnel.modus === 'reservierung'

  const schritte: string[] = []

  if (reservierung) {
    // Schritt 1: Datum / Uhrzeit / Personen / Anlass
    schritte.push(schrittHtml(`
      <h2>Wann dürfen wir Sie erwarten?</h2>
      <p class="sub">Datum, Uhrzeit und Personenzahl – den Rest übernehmen wir.</p>
      <div class="frow">
        <div><label>Datum*</label><input type="date" name="datum" data-pflicht></div>
        <div><label>Uhrzeit*</label><input type="text" name="uhrzeit" data-pflicht placeholder="z. B. 19:30"></div>
      </div>
      <div class="frow">
        <div><label>Personen*</label><select name="personen" data-pflicht><option value="">Bitte wählen</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>Mehr als 6</option></select></div>
        <div><label>Anlass (optional)</label><input type="text" name="anlass" placeholder="z. B. Jahrestag"></div>
      </div>
      <p class="fehler">Bitte Datum, Uhrzeit und Personenzahl angeben.</p>
      <div class="fnav"><button class="btn${hell ? ' sun' : ''}" type="button" data-weiter>Weiter <span class="arr">→</span></button></div>`, true))
  } else {
    // Schritt 1: Leistung
    const leistungen = funnel.leistungen?.length ? funnel.leistungen : ['Allgemeine Anfrage']
    schritte.push(schrittHtml(`
      <h2>Worum geht es?</h2>
      <p class="sub">Wählen Sie die Leistung, die am besten passt.</p>
      ${optListe('leistung', [...leistungen, 'Sonstiges'], true)}
      <p class="fehler">Bitte eine Leistung auswählen.</p>
      <div class="fnav"><button class="btn${hell ? ' sun' : ''}" type="button" data-weiter>Weiter <span class="arr">→</span></button></div>`, true))

    // Schritt 2: branchenspezifische Qualifizierung (aus branchen_profile.quali_fragen)
    if (funnel.quali_fragen?.length) {
      const felder = funnel.quali_fragen
        .map((f) => `<label>${esc(f.frage)}${f.pflicht ? '*' : ''}</label>\n      ${qualiFeld(f)}`)
        .join('\n      ')
      schritte.push(schrittHtml(`
      <h2>Ein paar Details</h2>
      <p class="sub">Damit wir Ihre Anfrage sofort richtig einschätzen können.</p>
      ${felder}
      <p class="fehler">Bitte die Pflichtfelder beantworten.</p>
      <div class="fnav"><button class="btn ghost zurueck" type="button" data-zurueck>←</button><button class="btn${hell ? ' sun' : ''}" type="button" data-weiter>Weiter <span class="arr">→</span></button></div>`, false))
    }
  }

  // Kontakt-Schritt + DSGVO
  const kontaktFelder = reservierung
    ? `<div class="frow">
        <div><label>Name*</label><input type="text" name="name" data-pflicht placeholder="Ihr Name"></div>
        <div><label>Telefon*</label><input type="tel" name="telefon" data-pflicht placeholder="Für die Bestätigung"></div>
      </div>
      <label>E-Mail (optional)</label><input type="email" name="email" placeholder="name@beispiel.de">
      <label>Nachricht (optional)</label><textarea name="nachricht" rows="3" placeholder="Was sollen wir wissen?"></textarea>`
    : `<div class="frow">
        <div><label>Name*</label><input type="text" name="name" data-pflicht placeholder="Ihr Name"></div>
        <div><label>E-Mail*</label><input type="email" name="email" data-pflicht placeholder="name@beispiel.de"></div>
      </div>
      <label>Telefon (optional)</label><input type="tel" name="telefon" placeholder="Für schnelle Rückfragen">
      <label>Nachricht (optional)</label><textarea name="nachricht" rows="3" placeholder="Was sollen wir wissen?"></textarea>`

  schritte.push(schrittHtml(`
      <h2>Wie erreichen wir Sie?</h2>
      <p class="sub">${reservierung ? 'Wir bestätigen Ihren Tisch schnellstmöglich.' : 'Sie erhalten schnellstmöglich eine Rückmeldung.'}</p>
      ${kontaktFelder}
      <label class="dsgvo"><input type="checkbox" name="dsgvo" data-pflicht> Ich bin einverstanden, dass meine Angaben zur Bearbeitung meiner ${reservierung ? 'Reservierung' : 'Anfrage'} gespeichert und verwendet werden. Hinweise in der Datenschutzerklärung.</label>
      <p class="fehler">Bitte Pflichtfelder ausfüllen und der Datenverarbeitung zustimmen.</p>
      <div class="fnav">${schritte.length > 0 ? '<button class="btn ghost zurueck" type="button" data-zurueck>←</button>' : ''}<button class="btn${hell ? ' sun' : ''}" type="button" id="fsenden">${reservierung ? 'Reservierung anfragen' : 'Anfrage absenden'} <span class="arr">→</span></button></div>`, false))

  // Erfolg
  const erfolgText = funnel.erfolg_text
    || (reservierung
      ? 'Ihre Anfrage ist bei uns – wir bestätigen Ihren Tisch schnellstmöglich.'
      : 'Ihre Anfrage ist eingegangen – wir melden uns schnellstmöglich bei Ihnen.')
  schritte.push(schrittHtml(`
      <div class="erfolg">
        <div class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg></div>
        <h2>${reservierung ? 'Grazie mille!' : 'Anfrage gesendet'}</h2>
        <p>${esc(erfolgText)}</p>
      </div>`, false))

  const titel = reservierung ? `Tisch reservieren – ${meta.firma}` : `Anfrage – ${meta.firma}`
  const zurueck = opts.basisPfad || '/'
  const tel = meta.telefon
    ? `<p class="funnel-tel">Lieber anrufen? <a href="tel:${escAttr(meta.telefon.replace(/[^+\d]/g, ''))}">${esc(meta.telefon)}</a></p>`
    : ''

  const js = funnelJs({
    submitZiel: opts.submitZiel ?? null,
    formType: reservierung ? 'reservierung' : 'anfrage',
  })

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(titel)}</title>
<meta name="robots" content="noindex">
<style>
${flagshipCss(design)}
${funnelCss(design)}
</style>
</head>
<body class="funnel-body">

<nav id="nav" class="scrolled">
  <div class="wrap">
    <a class="logo" href="${escAttr(zurueck)}">${esc(config.inhalte.nav.logo_text)}${config.inhalte.nav.logo_bold ? `<b>&nbsp;${esc(config.inhalte.nav.logo_bold)}</b>` : (design.typo_modus === 'sans_bold_hell' ? '<i></i>' : '')}</a>
    <a class="btn ghost" href="${escAttr(zurueck)}" style="margin-left:auto">← Zurück zur Seite</a>
  </div>
</nav>

<main class="funnel-main">
  <div class="funnel">
    <div class="funnel-kopf">
      <span class="eyebrow" style="justify-content:center">${esc(meta.firma)}</span>
      <h1>${reservierung ? 'Ihr Tisch wartet.' : 'Ihre Anfrage – in 2 Minuten.'}</h1>
    </div>
    <div class="fortschritt"><i id="fbalken"></i></div>
    ${schritte.join('\n    ')}
    ${tel}
  </div>
</main>

${opts.demo ? '<div class="ribbon"><i></i> Demo-Vorschau · Webseiten-Verlag Deutschland</div>' : ''}

<script>
${js}
</script>
</body>
</html>`
}
