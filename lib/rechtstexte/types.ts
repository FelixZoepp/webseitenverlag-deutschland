/**
 * Typen fuer den Rechtstexte-Editor (Change 3).
 *
 * ImpressumDaten ist das strukturierte Schema fuer das Impressum-Formular.
 * Die Daten werden in sites.pflichtangaben.impressum gespeichert und
 * daraus sowohl Impressum als auch Datenschutzerklaerung gerendert.
 */

export interface ImpressumDaten {
  firmenname: string
  strasse: string
  plz: string
  ort: string
  vertretung: string
  telefon: string
  email: string
  // Bedingte Felder (optional)
  registergericht?: string
  registernummer?: string
  ust_id?: string
  kammer?: string
  berufsbezeichnung?: string
  berufsbezeichnung_staat?: string
  berufsrechtliche_regelungen?: string
  aufsichtsbehoerde?: string
  redaktionell_verantwortlich?: string
}

export interface RechtstextAenderung {
  zeitpunkt: string
  nutzer_id: string
  felder: Record<string, unknown>
}

/** Pflichtfelder, die beim Impressum ausgefuellt sein muessen. */
export const IMPRESSUM_PFLICHTFELDER: (keyof ImpressumDaten)[] = [
  'firmenname',
  'strasse',
  'plz',
  'ort',
  'vertretung',
  'telefon',
  'email',
]

/** Labels fuer Pflichtfelder (deutsch). */
export const IMPRESSUM_FELD_LABELS: Record<string, string> = {
  firmenname: 'Firmenname inkl. Rechtsform',
  strasse: 'Straße und Hausnummer',
  plz: 'PLZ',
  ort: 'Ort',
  vertretung: 'Vertretungsberechtigte Person(en)',
  telefon: 'Telefonnummer',
  email: 'E-Mail-Adresse',
  registergericht: 'Registergericht',
  registernummer: 'Registernummer',
  ust_id: 'Umsatzsteuer-ID',
  kammer: 'Zuständige Kammer',
  berufsbezeichnung: 'Berufsbezeichnung',
  berufsbezeichnung_staat: 'Staat der Verleihung',
  berufsrechtliche_regelungen: 'Berufsrechtliche Regelungen',
  aufsichtsbehoerde: 'Zuständige Aufsichtsbehörde',
  redaktionell_verantwortlich: 'Redaktionell Verantwortlicher',
}

/** Prueft ob alle Pflichtfelder ausgefuellt sind. Gibt fehlende Felder zurueck. */
export function fehlendeImpressumFelder(daten: Partial<ImpressumDaten> | null | undefined): string[] {
  if (!daten) return IMPRESSUM_PFLICHTFELDER.map((k) => IMPRESSUM_FELD_LABELS[k] || k)
  return IMPRESSUM_PFLICHTFELDER
    .filter((k) => !daten[k] || (typeof daten[k] === 'string' && daten[k]!.trim() === ''))
    .map((k) => IMPRESSUM_FELD_LABELS[k] || k)
}
