/**
 * Rechtstexte-Generator (§10.1 Schritt 1, Phase 4 §5.4).
 *
 * Aus den Pflichtangaben des Wizards werden Impressum und Datenschutzerklärung
 * generiert. Alle statischen Text-Bausteine liegen als Vorlage in
 * config/rechtstexte-vorlagen.ts (Config over Hardcode) — hier werden nur
 * Pflichtangaben eingesetzt. Juristische Endprüfung: WARTELISTE (Anwalt).
 */
import { z } from 'zod'
import { IMPRESSUM_VORLAGE, DATENSCHUTZ_VORLAGE } from '@/config/rechtstexte-vorlagen'

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
  const v = IMPRESSUM_VORLAGE
  const name = p.rechtsform ? `${p.firmenname} ${p.rechtsform}` : p.firmenname
  const teile: string[] = [
    v.ueberschrift,
    '',
    name,
    p.strasse,
    `${p.plz} ${p.ort}`,
    '',
    `${v.vertretenDurch} ${p.inhaber}`,
    '',
    v.kontaktUeberschrift,
    `${v.telefonLabel} ${p.telefon}`,
    `${v.emailLabel} ${p.email}`,
  ]
  if (p.ust_id) teile.push('', `${v.ustIdLabel} ${p.ust_id}`)
  if (p.handelsregister) teile.push('', `${v.registerLabel} ${p.handelsregister}`)
  if (p.aufsichtsbehoerde) teile.push('', `${v.aufsichtsbehoerdeLabel} ${p.aufsichtsbehoerde}`)
  if (p.kammer) teile.push('', `${v.kammerLabel} ${p.kammer}`)
  teile.push(
    '',
    `${v.inhaltlichVerantwortlich} ${p.inhaber}, ${p.strasse}, ${p.plz} ${p.ort}`,
    '',
    v.odrHinweis,
    v.streitbeilegungHinweis
  )
  return teile.join('\n')
}

export function generiereDatenschutz(p: Pflichtangaben): string {
  const v = DATENSCHUTZ_VORLAGE
  const name = p.rechtsform ? `${p.firmenname} ${p.rechtsform}` : p.firmenname
  return [
    v.titel,
    '',
    v.verantwortlicherUeberschrift,
    `${name}, ${p.inhaber}, ${p.strasse}, ${p.plz} ${p.ort}`,
    `Telefon: ${p.telefon} · E-Mail: ${p.email}`,
    '',
    v.hostingUeberschrift,
    v.hostingText,
    '',
    v.kontaktformularUeberschrift,
    v.kontaktformularText,
    '',
    v.rechteUeberschrift,
    v.rechteText,
    '',
    v.speicherdauerUeberschrift,
    v.speicherdauerText,
  ].join('\n')
}
