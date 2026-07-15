/**
 * Branchen-Fabrik: 8 Meta-Kategorien (BRANCHEN_FABRIK_PROMPT §3.1).
 * Jede Kategorie definiert die Signature-Transformation (die eine
 * unverwechselbare Scroll-Sektion) und den Typo-Grundmodus.
 * Einzelne Branchen (branchen_profile.branche_key) hängen an genau
 * einer Meta-Kategorie.
 */

export type SignatureVariante = 'wisch' | 'decken'

export interface MetaKategorie {
  key: string
  name: string
  /** Welche Signature-Scroll-Mechanik als Default greift */
  signature_variante: SignatureVariante
  /** Kurzbeschreibung der Transformations-Szene (Vorher → Nachher) */
  transformations_szene: string
  /** Typo-Grundmodus nach BF §1.3 */
  typo_modus: 'sans_bold_hell' | 'serif_warm_dunkel'
  /** Funnel-Modus der System-Seite (BF §1.2) */
  funnel_modus: 'anfrage' | 'reservierung'
  /** Pflicht-Stepper: 'ablauf' (5 Schritte Dienstleistung) oder 'besuch' (Gastro) */
  stepper: 'ablauf' | 'besuch'
  hinweise?: string
}

export const META_KATEGORIEN: readonly MetaKategorie[] = [
  {
    key: 'handwerk_bau',
    name: 'Handwerk & Bau',
    signature_variante: 'wisch',
    transformations_szene: 'Baustelle/Rohzustand → fertiges Gewerk (z. B. Wand roh → verputzt & gestrichen)',
    typo_modus: 'sans_bold_hell',
    funnel_modus: 'anfrage',
    stepper: 'ablauf',
  },
  {
    key: 'reinigung_facility',
    name: 'Reinigung & Facility',
    signature_variante: 'wisch',
    transformations_szene: 'Verschmutzt → streifenfrei sauber, Abzieher-Kante wandert mit dem Scroll',
    typo_modus: 'sans_bold_hell',
    funnel_modus: 'anfrage',
    stepper: 'ablauf',
  },
  {
    key: 'gastro_genuss',
    name: 'Gastro & Genuss',
    signature_variante: 'decken',
    transformations_szene: 'Leerer Tisch → eingedeckt & serviert, warme Licht-Kante (Kerzenschein)',
    typo_modus: 'serif_warm_dunkel',
    funnel_modus: 'reservierung',
    stepper: 'besuch',
    hinweise: 'Stepper heißt „Ihr Besuch" statt Ablauf; System-Seite /reservierung statt /anfrage.',
  },
  {
    key: 'beauty_wellness',
    name: 'Beauty & Wellness',
    signature_variante: 'decken',
    transformations_szene: 'Alltag → Verwandlung (z. B. vor dem Termin → Ergebnis-Look), weiche Licht-Kante',
    typo_modus: 'serif_warm_dunkel',
    funnel_modus: 'anfrage',
    stepper: 'ablauf',
  },
  {
    key: 'gesundheit_praxis',
    name: 'Gesundheit & Praxis',
    signature_variante: 'wisch',
    transformations_szene: 'Beschwerde-Situation → Alltag ohne Einschränkung (dezent, keine Heilversprechen)',
    typo_modus: 'sans_bold_hell',
    funnel_modus: 'anfrage',
    stepper: 'ablauf',
    hinweise: 'Werberecht beachten (HWG): keine Heilversprechen, keine Vorher/Nachher-Behandlungsfotos.',
  },
  {
    key: 'auto_mobilitaet',
    name: 'Auto & Mobilität',
    signature_variante: 'wisch',
    transformations_szene: 'Fahrzeug mit Schaden/verschmutzt → aufbereitet/instandgesetzt, harte Werkstatt-Kante',
    typo_modus: 'sans_bold_hell',
    funnel_modus: 'anfrage',
    stepper: 'ablauf',
  },
  {
    key: 'dienstleistung_beratung',
    name: 'Dienstleistung & Beratung',
    signature_variante: 'wisch',
    transformations_szene: 'Chaos/Unordnung (Papierstapel, offene Fragen) → geordneter Zustand/Plan',
    typo_modus: 'sans_bold_hell',
    funnel_modus: 'anfrage',
    stepper: 'ablauf',
  },
  {
    key: 'fitness_coaching',
    name: 'Fitness & Coaching',
    signature_variante: 'decken',
    transformations_szene: 'Startpunkt → Fortschritt (Trainingsraum leer → in Aktion), energetische Licht-Kante',
    typo_modus: 'sans_bold_hell',
    funnel_modus: 'anfrage',
    stepper: 'ablauf',
  },
] as const

export function metaKategorie(key: string): MetaKategorie | undefined {
  return META_KATEGORIEN.find((k) => k.key === key)
}
