/**
 * Branchen-Fabrik F3: Startbestand nach BF §3.2 —
 * je Meta-Kategorie 2 konkrete Branchen = 16 Vorlagen.
 *
 * reinigung + restaurant_italienisch entstehen durch Parametrisierung
 * der FLAGSHIP_SEEDS (kein Claude-Call): die 1:1-Reproduktion ist der
 * Beweis, dass die Zerlegung stimmt.
 */

export interface StartBranche {
  /** branchen_profile.branche_key */
  branche_key: string
  name: string
  /** Verweis auf META_KATEGORIEN (config/branchen.ts) */
  meta_kategorie: string
  /** Kurzbeschreibung fürs Seeding-Prompt (was macht der Betrieb konkret?) */
  beschreibung: string
  /** Flagship-Parametrisierung statt Generierung */
  flagship?: 'reinigung' | 'restaurant_italienisch'
}

export const START_BRANCHEN: readonly StartBranche[] = [
  // Handwerk & Bau
  {
    branche_key: 'maler',
    name: 'Maler & Lackierer',
    meta_kategorie: 'handwerk_bau',
    beschreibung: 'Malerbetrieb: Innenanstrich, Fassade, Lackierarbeiten, Tapezieren, Spachteltechnik. Kunden: Privathaushalte, Hausverwaltungen, Gewerbe.',
  },
  {
    branche_key: 'dachdecker',
    name: 'Dachdecker',
    meta_kategorie: 'handwerk_bau',
    beschreibung: 'Dachdeckerbetrieb: Neueindeckung, Dachreparatur, Flachdach, Dämmung, Dachfenster, Sturmschaden-Notdienst. Kunden: Hauseigentümer, WEGs.',
  },
  // Reinigung & Facility
  {
    branche_key: 'reinigung',
    name: 'Gebäudereinigung',
    meta_kategorie: 'reinigung_facility',
    beschreibung: 'Gebäude-, Büro-, Glas- und Praxisreinigung mit festen Objektteams.',
    flagship: 'reinigung',
  },
  {
    branche_key: 'hausmeisterservice',
    name: 'Hausmeisterservice',
    meta_kategorie: 'reinigung_facility',
    beschreibung: 'Hausmeisterservice: Objektbetreuung, Kleinreparaturen, Grünpflege, Winterdienst, Treppenhausreinigung. Kunden: Hausverwaltungen, Eigentümer, Gewerbe.',
  },
  // Gastro & Genuss
  {
    branche_key: 'restaurant_italienisch',
    name: 'Restaurant (italienisch)',
    meta_kategorie: 'gastro_genuss',
    beschreibung: 'Italienisches Restaurant mit Familientradition, frischer Küche und Weinkarte.',
    flagship: 'restaurant_italienisch',
  },
  {
    branche_key: 'cafe',
    name: 'Café & Konditorei',
    meta_kategorie: 'gastro_genuss',
    beschreibung: 'Café mit eigener Konditorei: Frühstück, hausgemachte Torten, Kaffeespezialitäten, kleine Mittagskarte, Tortenbestellung für Feiern.',
  },
  // Beauty & Wellness
  {
    branche_key: 'friseur',
    name: 'Friseursalon',
    meta_kategorie: 'beauty_wellness',
    beschreibung: 'Friseursalon: Schnitt, Farbe/Balayage, Styling, Brautfrisuren, Herren & Kinder. Terminbetrieb mit Beratungsgespräch.',
  },
  {
    branche_key: 'kosmetikstudio',
    name: 'Kosmetikstudio',
    meta_kategorie: 'beauty_wellness',
    beschreibung: 'Kosmetikstudio: Gesichtsbehandlungen, Hautanalyse, Microneedling, Wimpern & Brauen, Maniküre. Ruhige Einzelbehandlung auf Termin.',
  },
  // Gesundheit & Praxis
  {
    branche_key: 'zahnarzt',
    name: 'Zahnarztpraxis',
    meta_kategorie: 'gesundheit_praxis',
    beschreibung: 'Zahnarztpraxis: Prophylaxe, Füllungen, Zahnersatz, Implantate, Angstpatienten, Kinderzahnheilkunde. HWG beachten: keine Heilversprechen, keine Behandlungs-Vorher/Nachher-Fotos.',
  },
  {
    branche_key: 'physiotherapie',
    name: 'Physiotherapie',
    meta_kategorie: 'gesundheit_praxis',
    beschreibung: 'Physiotherapie-Praxis: Krankengymnastik, manuelle Therapie, Lymphdrainage, Sportphysio, Hausbesuche. Rezept & Selbstzahler. HWG beachten.',
  },
  // Auto & Mobilität
  {
    branche_key: 'kfz_werkstatt',
    name: 'Kfz-Werkstatt',
    meta_kategorie: 'auto_mobilitaet',
    beschreibung: 'Freie Kfz-Werkstatt: Inspektion, HU/AU-Vorbereitung, Bremsen, Reifen, Diagnose, Klimaservice. Alle Marken, Festpreise, Termingarantie.',
  },
  {
    branche_key: 'autoaufbereitung',
    name: 'Autoaufbereitung',
    meta_kategorie: 'auto_mobilitaet',
    beschreibung: 'Fahrzeugaufbereitung: Innenreinigung, Politur, Keramikversiegelung, Lederpflege, Geruchsentfernung, Verkaufsvorbereitung.',
  },
  // Dienstleistung & Beratung
  {
    branche_key: 'umzugsunternehmen',
    name: 'Umzugsunternehmen',
    meta_kategorie: 'dienstleistung_beratung',
    beschreibung: 'Umzugsunternehmen: Privat- und Firmenumzüge, Montage, Halteverbotszone, Einlagerung, Festpreisangebot nach Besichtigung.',
  },
  {
    branche_key: 'fotograf',
    name: 'Fotograf',
    meta_kategorie: 'dienstleistung_beratung',
    beschreibung: 'Fotostudio: Business-Porträts, Bewerbungsfotos, Familien- und Hochzeitsreportagen, Produktfotos für lokale Betriebe.',
  },
  // Fitness & Coaching
  {
    branche_key: 'fitnessstudio',
    name: 'Fitnessstudio',
    meta_kategorie: 'fitness_coaching',
    beschreibung: 'Inhabergeführtes Fitnessstudio: Gerätetraining, Kurse, Trainingsplan-Betreuung, Probetraining, keine Vertragsfallen.',
  },
  {
    branche_key: 'personal_training',
    name: 'Personal Training',
    meta_kategorie: 'fitness_coaching',
    beschreibung: 'Personal Trainer: 1:1-Training, Ernährungscoaching, Rücken-Fit, Outdoor- und Studio-Sessions, Erstanalyse mit Zieldefinition.',
  },
] as const

export function startBranche(key: string): StartBranche | undefined {
  return START_BRANCHEN.find((b) => b.branche_key === key)
}
