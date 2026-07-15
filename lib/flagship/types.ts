/**
 * Flagship-Engine (F2): Typen für das aus den beiden kanonischen
 * Referenzen (flagship_reinigung.html, flagship_restaurant.html)
 * extrahierte Design-System.
 *
 * Highlight-Konvention in Texten: [[wort]] wird zu
 * <span class="hl">wort</span> (Typo-Signature), alles andere wird escaped.
 * In der Fakten-Leiste wird [[wort]] zu <em>wort</em>.
 */

export type TypoModus = 'sans_bold_hell' | 'serif_warm_dunkel'
export type TypoSignature = 'wisch_highlight' | 'gold_unterstrich'
export type SignatureVariante = 'wisch' | 'decken'
export type FunnelModus = 'anfrage' | 'reservierung'

/** Design nach BF §1.3 */
export interface FlagshipDesign {
  typo_modus: TypoModus
  typo_signature: TypoSignature
  tokens: {
    /** Seitengrund (hell: Papierton, dunkel: Espresso-Schwarz) */
    basis: string
    /** Panel-/Kartenton */
    panel: string
    /** Primärtext */
    text: string
    /** Sekundärtext */
    text_soft: string
    /** Hauptakzent (Handschuh-Gelb / Chianti) */
    akzent1: string
    /** Tiefe Variante des Hauptakzents */
    akzent1_tief: string
    /** Zweitakzent, sparsam (Aqua / Kerzengold) */
    akzent2: string
    /** Linienfarbe */
    line: string
  }
  /** Pflicht nach BF §1.3 — warum dieser Akzent zur Branche gehört */
  akzent_begruendung: string
  radius?: string
  breite?: string
  schatten?: string
}

export interface MediaSlot {
  /** Platzhalter-Label (data-label), sichtbar bis Asset existiert */
  label: string
  /** Relativer/absoluter Bildpfad; fehlt er, greift der Platzhalter */
  datei?: string
  alt?: string
  /** Optionaler Hintergrund-Override des Slots (z. B. heller Verlauf für Nachher) */
  hintergrund?: string
}

export interface NavInhalt {
  logo_text: string
  /** Optionaler zweiter Logo-Teil in Akzentfarbe (Restaurant: „ VINO") */
  logo_bold?: string
  links: { label: string; anker: string }[]
  cta_label: string
}

export interface HeroInhalt {
  eyebrow: string
  /** Zeilen der Headline, [[wort]] = Highlight */
  headline_zeilen: string[]
  lead: string
  cta_label: string
  cta_sekundaer?: { label: string; href: string }
  chips: string[]
  /** check = SVG-Häkchen (Reinigung), dot = Gold-Punkt (Restaurant) */
  chip_stil: 'check' | 'dot'
  media: MediaSlot
  stat1: { wert: string; label: string }
  stat2: { wert: string; label: string }
}

/** Fakten-/Trust-Leiste: 4 Punkte, [[wort]] = <em>-Highlight, icon optional */
export interface FaktenInhalt {
  punkte: { text: string; icon?: IconKey }[]
}

export interface EmpathieInhalt {
  eyebrow: string
  headline: string
  text: string
  /** situationen (Reinigung) oder zitat (Restaurant) */
  variante: 'situationen' | 'zitat'
  situationen?: string[]
  zitat?: { text: string; cite: string }
}

export interface SignatureInhalt {
  variante: SignatureVariante
  eyebrow: string
  headline: string
  vorher: MediaSlot
  nachher: MediaSlot
  tag_vorher: string
  tag_nachher: string
  cap: string
}

export interface LeistungenInhalt {
  eyebrow: string
  headline: string
  /** icons (Dienstleistung) oder nummern (Gastro, römisch „I · Antipasti") */
  stil: 'icons' | 'nummern'
  karten: { titel: string; text: string; icon?: IconKey; no?: string; link_label?: string }[]
  /** Optionaler Hinweistext unter dem Grid, [[wort]] wird zum Anker-Link */
  hinweis?: { text: string; link_label: string; link_anker: string }
}

export interface AblaufInhalt {
  eyebrow: string
  headline: string
  schritte: { titel: string; text: string; badge: string; icon: IconKey }[]
}

export interface ErgebnisseInhalt {
  eyebrow: string
  headline: string
  lead?: string
  variante: 'ba_slider' | 'galerie'
  /** BA-Slider: Bildpaare */
  paare?: { vorher: MediaSlot; nachher: MediaSlot; caption: string }[]
  /** Galerie: Einzelbilder */
  bilder?: { media: MediaSlot; caption: string }[]
}

export interface ZahlenInhalt {
  items: {
    /** Zahl → Counter; String → statisch (z. B. „12–23") */
    wert: number | string
    /** Startwert des Counters (Restaurant: 1975 → 2000) */
    start?: number
    prefix?: string
    /** Suffix in Akzentfarbe (+, %, h) */
    suffix?: string
    label: string
  }[]
}

export interface StimmenInhalt {
  eyebrow: string
  headline: string
  quotes: { text: string; initialen: string; name: string; meta: string }[]
}

export interface LokalInhalt {
  eyebrow: string
  headline: string
  lead?: string
  /** bezirke = Chip-Wolke (Reinigung), info = Adresse/Zeiten/Kontakt (Restaurant) */
  variante: 'bezirke' | 'info'
  chips?: string[]
  note?: string
  infos?: { titel: string; text: string; icon: IconKey; telefon_link?: string }[]
}

export interface FaqInhalt {
  eyebrow: string
  headline: string
  fragen: { frage: string; antwort: string }[]
}

/** Kurz-Conversion nach BF §1.2: Telefon + CTA zum Funnel + 3 Trust-Punkte */
export interface ConversionInhalt {
  eyebrow: string
  headline: string
  lead: string
  telefon?: string
  cta_label: string
  trust: string[]
}

export interface FooterInhalt {
  beschreibung: string
  links: { label: string; anker: string }[]
}

export interface FlagshipInhalte {
  nav: NavInhalt
  hero: HeroInhalt
  fakten: FaktenInhalt
  empathie: EmpathieInhalt
  signature: SignatureInhalt
  leistungen: LeistungenInhalt
  /** Ablauf-Stepper (Dienstleistung Pflicht); bei Gastro entfällt er zugunsten lokal/info */
  ablauf?: AblaufInhalt
  ergebnisse: ErgebnisseInhalt
  zahlen: ZahlenInhalt
  stimmen: StimmenInhalt
  lokal: LokalInhalt
  faq: FaqInhalt
  conversion: ConversionInhalt
  footer: FooterInhalt
}

/** Branchenspezifische Qualifizierungsfrage für den /anfrage-Funnel */
export interface QualiFrage {
  key: string
  frage: string
  typ: 'auswahl' | 'text'
  optionen?: string[]
  pflicht?: boolean
}

export interface FunnelKonfig {
  modus: FunnelModus
  /** Schritt 1 (anfrage): Leistungsauswahl */
  leistungen?: string[]
  /** Schritt 2 (anfrage): branchenspezifische Fragen (aus branchen_profile.quali_fragen) */
  quali_fragen?: QualiFrage[]
  /** Erfolgstext nach Absenden */
  erfolg_text?: string
}

export interface FlagshipMeta {
  firma: string
  ort: string
  telefon?: string
  email?: string
  adresse?: string
  gegruendet?: string
  seo_titel?: string
  seo_beschreibung?: string
}

/** Config in demos.config bzw. sites.config, engine === 'flagship' */
export interface FlagshipConfig {
  engine: 'flagship'
  branche_key: string
  meta_kategorie?: string
  meta: FlagshipMeta
  design: FlagshipDesign
  inhalte: FlagshipInhalte
  funnel: FunnelKonfig
  herkunft?: { quellen?: string[]; generator?: string }
}

/** Render-Optionen (Demo-Ribbon, Submit-Ziel des Funnels, noindex …) */
export interface FlagshipRenderOptionen {
  /** Demo-Ribbon anzeigen */
  demo?: boolean
  /** Basis-Pfad der Seite (Demo: /demo/{token}, live: '') */
  basisPfad?: string
  /** POST-Ziel des Funnels; null/undefined = Demo-Modus ohne Persistenz */
  submitZiel?: string | null
  /** noindex erzwingen (Demos immer) */
  noindex?: boolean
}

export type IconKey =
  | 'check' | 'shield' | 'calendar' | 'clock' | 'badge'
  | 'window' | 'building' | 'sparkle' | 'bucket' | 'sofa'
  | 'send' | 'wallet' | 'pin' | 'phone' | 'wrench' | 'scissors'
  | 'car' | 'heart' | 'chart' | 'leaf' | 'star'
