/**
 * Rechtstexte-Vorlagen (Phase 4, §5.4 — "Texte als Vorlage in Config").
 *
 * Alle statischen Text-Bausteine für Impressum und Datenschutzerklärung
 * liegen HIER, nicht im Generator. Anpassungen (z. B. nach Anwalts-Review,
 * siehe WARTELISTE) passieren ausschließlich in dieser Datei — der Generator
 * in lib/rechtstexte.ts setzt nur noch Pflichtangaben ein.
 */

export const IMPRESSUM_VORLAGE = {
  ueberschrift: 'Angaben gemäß § 5 DDG',
  vertretenDurch: 'Vertreten durch:',
  kontaktUeberschrift: 'Kontakt:',
  telefonLabel: 'Telefon:',
  emailLabel: 'E-Mail:',
  ustIdLabel: 'Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG:',
  registerLabel: 'Registereintrag:',
  aufsichtsbehoerdeLabel: 'Zuständige Aufsichtsbehörde:',
  kammerLabel: 'Zuständige Kammer:',
  inhaltlichVerantwortlich: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:',
  odrHinweis:
    'Plattform der EU-Kommission zur Online-Streitbeilegung: https://ec.europa.eu/consumers/odr',
  streitbeilegungHinweis:
    'Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
} as const

export const DATENSCHUTZ_VORLAGE = {
  titel: 'Datenschutzerklärung',
  verantwortlicherUeberschrift: '1. Verantwortlicher',
  hostingUeberschrift: '2. Hosting',
  hostingText:
    'Diese Website wird bei einem externen Dienstleister gehostet (Vercel Inc.). Beim Aufruf der Website werden automatisch Informationen in Server-Logfiles gespeichert (IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browsertyp). Diese Daten sind technisch erforderlich, um die Website anzuzeigen und die Stabilität und Sicherheit zu gewährleisten (Art. 6 Abs. 1 lit. f DSGVO).',
  kontaktformularUeberschrift: '3. Kontaktformular',
  kontaktformularText:
    'Wenn Sie uns über das Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben inklusive der von Ihnen angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert (Art. 6 Abs. 1 lit. b DSGVO). Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.',
  rechteUeberschrift: '4. Ihre Rechte',
  rechteText:
    'Sie haben jederzeit das Recht auf Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten (Art. 15–18 DSGVO). Außerdem steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu (Art. 77 DSGVO).',
  speicherdauerUeberschrift: '5. Speicherdauer',
  speicherdauerText:
    'Ihre Daten werden nur so lange gespeichert, wie es für die genannten Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen.',
} as const
