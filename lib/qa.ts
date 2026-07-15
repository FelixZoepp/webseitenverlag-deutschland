/**
 * Auto-QA für "Website fertigstellen" (§10.1 Schritt 6).
 *
 * Offline-Checks auf dem gerenderten HTML — Fehler kommen als verständliche
 * Hinweise zurück (kein Techniker-Jargon). Der volle Lighthouse-Lauf gehört
 * in die CI-Gates (Phase H); hier läuft ein schneller Plausibilitäts-Check.
 */

export interface QaErgebnis {
  ok: boolean
  hinweise: string[]
}

export function pruefeHtml(html: string): QaErgebnis {
  const hinweise: string[] = []

  // Demo-Reste / Platzhalter
  if (/\{\{[a-zA-Z0-9_.]+\}\}/.test(html)) {
    hinweise.push('Auf der Seite stehen noch Platzhalter-Texte. Bitte prüfen Sie Ihre Inhalte im Editor.')
  }
  if (/lorem ipsum/i.test(html)) {
    hinweise.push('Auf der Seite steht noch Beispieltext ("Lorem ipsum"). Bitte ersetzen Sie ihn durch echten Text.')
  }

  // Tote / leere Links
  const leereLinks = html.match(/href="(#|)"/g)
  if (leereLinks && leereLinks.length > 0) {
    hinweise.push(`Es gibt ${leereLinks.length} Verknüpfung(en) ohne Ziel. Bitte prüfen Sie Buttons und Links im Editor.`)
  }

  // Bilder ohne Alt-Text
  const bilder = html.match(/<img\b[^>]*>/gi) || []
  const ohneAlt = bilder.filter((tag) => !/\balt="[^"]+"/i.test(tag)).length
  if (ohneAlt > 0) {
    hinweise.push(`${ohneAlt} Bild(er) haben keine Beschreibung (Alt-Text). Das ist wichtig für Google und Barrierefreiheit.`)
  }

  // Grunddaten
  if (!/<title>[^<]{3,}<\/title>/i.test(html)) {
    hinweise.push('Der Seitentitel fehlt. Bitte tragen Sie Ihren Firmennamen im Editor ein.')
  }
  if (!/<meta\s+name="description"/i.test(html)) {
    hinweise.push('Die Seitenbeschreibung für Google fehlt.')
  }

  // Kontaktformular vorhanden (Testsubmit läuft erst live — hier: Struktur-Check)
  if (!/<form\b/i.test(html)) {
    hinweise.push('Es wurde kein Kontaktformular gefunden. Besucher können Sie so nicht direkt erreichen.')
  }

  // Performance-Quickcheck (Proxy für Lighthouse: Seitengewicht)
  if (Buffer.byteLength(html, 'utf8') > 600 * 1024) {
    hinweise.push('Die Seite ist ungewöhnlich groß und könnte langsam laden. Bitte prüfen Sie die Anzahl der Bilder.')
  }

  return { ok: hinweise.length === 0, hinweise }
}
