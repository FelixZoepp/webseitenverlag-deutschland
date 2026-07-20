/**
 * Rechtstexte-Generator (§10.1 Schritt 1).
 *
 * Aus den Pflichtangaben des Wizards werden Impressum und Datenschutzerklärung
 * generiert (Text-Bausteine, kein Abo-Produkt — Rechtstexte-Abo ist bewusst
 * verworfen). Juristische Endprüfung: WARTELISTE (Anwalt).
 */
import { z } from 'zod'

export const PflichtangabenSchema = z.object({
  firmenname: z.string().min(2, 'Firmenname fehlt').max(200),
  rechtsform: z.string().max(100).optional().default(''),
  inhaber: z.string().min(2, 'Inhaber/Vertretungsberechtigter fehlt').max(200),
  strasse: z.string().min(3, 'Straße und Hausnummer fehlen').max(200),
  plz: z.string().regex(/^\d{5}$/, 'PLZ muss 5 Ziffern haben'),
  ort: z.string().min(2, 'Ort fehlt').max(120),
  telefon: z.string().min(5, 'Telefonnummer fehlt').max(50),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  ust_id: z.string().max(50).optional().default(''),
  handelsregister: z.string().max(120).optional().default(''),
  aufsichtsbehoerde: z.string().max(200).optional().default(''),
  kammer: z.string().max(200).optional().default(''),
})

export type Pflichtangaben = z.infer<typeof PflichtangabenSchema>

export function generiereImpressum(p: Pflichtangaben): string {
  const name = p.rechtsform ? `${p.firmenname} ${p.rechtsform}` : p.firmenname
  const teile: string[] = [
    'Angaben gemäß § 5 DDG',
    '',
    name,
    p.strasse,
    `${p.plz} ${p.ort}`,
    '',
    `Vertreten durch: ${p.inhaber}`,
    '',
    'Kontakt:',
    `Telefon: ${p.telefon}`,
    `E-Mail: ${p.email}`,
  ]
  if (p.ust_id) teile.push('', `Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG: ${p.ust_id}`)
  if (p.handelsregister) teile.push('', `Registereintrag: ${p.handelsregister}`)
  if (p.aufsichtsbehoerde) teile.push('', `Zuständige Aufsichtsbehörde: ${p.aufsichtsbehoerde}`)
  if (p.kammer) teile.push('', `Zuständige Kammer: ${p.kammer}`)
  teile.push(
    '',
    `Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV: ${p.inhaber}, ${p.strasse}, ${p.plz} ${p.ort}`,
    '',
    'Plattform der EU-Kommission zur Online-Streitbeilegung: https://ec.europa.eu/consumers/odr',
    'Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'
  )
  return teile.join('\n')
}

export function generiereDatenschutz(p: Pflichtangaben): string {
  const name = p.rechtsform ? `${p.firmenname} ${p.rechtsform}` : p.firmenname
  return [
    'Datenschutzerklärung',
    '',
    '1. Verantwortlicher',
    `${name}, ${p.inhaber}, ${p.strasse}, ${p.plz} ${p.ort}`,
    `Telefon: ${p.telefon} · E-Mail: ${p.email}`,
    '',
    '2. Hosting',
    'Diese Website wird bei einem externen Dienstleister gehostet (Vercel Inc.). Beim Aufruf der Website werden automatisch Informationen in Server-Logfiles gespeichert (IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browsertyp). Diese Daten sind technisch erforderlich, um die Website anzuzeigen und die Stabilität und Sicherheit zu gewährleisten (Art. 6 Abs. 1 lit. f DSGVO).',
    '',
    '3. Kontaktformular',
    'Wenn Sie uns über das Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben inklusive der von Ihnen angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert (Art. 6 Abs. 1 lit. b DSGVO). Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.',
    '',
    '4. Ihre Rechte',
    'Sie haben jederzeit das Recht auf Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten (Art. 15–18 DSGVO). Außerdem steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu (Art. 77 DSGVO).',
    '',
    '5. Speicherdauer',
    'Ihre Daten werden nur so lange gespeichert, wie es für die genannten Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen.',
  ].join('\n')
}
