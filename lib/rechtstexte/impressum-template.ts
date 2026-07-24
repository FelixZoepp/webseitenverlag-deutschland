/**
 * Impressum-Template (Change 3, §5.4).
 *
 * Rendert ein vollstaendiges Impressum aus den strukturierten Formulardaten.
 * Alle bedingten Bloecke werden nur bei vorhandenen Daten angezeigt.
 */

import type { ImpressumDaten } from './types'

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function rendereImpressum(daten: ImpressumDaten): string {
  const teile: string[] = []

  // Pflichtangaben
  teile.push('<h2>Angaben gemäß § 5 DDG</h2>')
  teile.push(`<p>${esc(daten.firmenname)}<br>`)
  teile.push(`${esc(daten.strasse)}<br>`)
  teile.push(`${esc(daten.plz)} ${esc(daten.ort)}</p>`)

  teile.push(`<p><strong>Vertreten durch:</strong><br>${esc(daten.vertretung)}</p>`)

  teile.push('<h3>Kontakt</h3>')
  teile.push(`<p>Telefon: ${esc(daten.telefon)}<br>`)
  teile.push(`E-Mail: ${esc(daten.email)}</p>`)

  // Handelsregister
  if (daten.registergericht && daten.registernummer) {
    teile.push('<h3>Registereintrag</h3>')
    teile.push(`<p>Registergericht: ${esc(daten.registergericht)}<br>`)
    teile.push(`Registernummer: ${esc(daten.registernummer)}</p>`)
  }

  // Umsatzsteuer-ID
  if (daten.ust_id) {
    teile.push('<h3>Umsatzsteuer-ID</h3>')
    teile.push(`<p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG:<br>${esc(daten.ust_id)}</p>`)
  }

  // Kammerpflichtig / regulierter Beruf
  if (daten.kammer) {
    teile.push('<h3>Angaben zur Berufshaftpflichtversicherung / Kammer</h3>')
    teile.push(`<p>Zuständige Kammer: ${esc(daten.kammer)}</p>`)
    if (daten.berufsbezeichnung) {
      teile.push(`<p>Berufsbezeichnung: ${esc(daten.berufsbezeichnung)}`)
      if (daten.berufsbezeichnung_staat) {
        teile.push(`<br>Verliehen in: ${esc(daten.berufsbezeichnung_staat)}`)
      }
      teile.push('</p>')
    }
    if (daten.berufsrechtliche_regelungen) {
      teile.push(`<p>Es gelten folgende berufsrechtliche Regelungen: ${esc(daten.berufsrechtliche_regelungen)}</p>`)
    }
  }

  // Aufsichtsbehoerde
  if (daten.aufsichtsbehoerde) {
    teile.push('<h3>Aufsichtsbehörde</h3>')
    teile.push(`<p>Zuständige Aufsichtsbehörde: ${esc(daten.aufsichtsbehoerde)}</p>`)
  }

  // Redaktionell verantwortlich
  if (daten.redaktionell_verantwortlich) {
    teile.push('<h3>Redaktionell verantwortlich</h3>')
    teile.push(`<p>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:<br>${esc(daten.redaktionell_verantwortlich)}</p>`)
  }

  // Inhaltlich verantwortlich (Standard)
  teile.push('<h3>Verantwortlich für den Inhalt</h3>')
  teile.push(`<p>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:<br>`)
  teile.push(`${esc(daten.vertretung)}, ${esc(daten.strasse)}, ${esc(daten.plz)} ${esc(daten.ort)}</p>`)

  // EU-Streitschlichtung (Pflicht)
  teile.push('<h3>EU-Streitschlichtung</h3>')
  teile.push('<p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: ')
  teile.push('<a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a></p>')
  teile.push('<p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>')

  return teile.join('\n')
}
