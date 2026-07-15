/**
 * Branchen-Fabrik F3: Zod-Schema für das Branchen-Profil (BF §4.2)
 * und die Vorlagen-Copy (nahe an FlagshipInhalte, ohne technische Felder).
 *
 * Claude liefert pro Branche EIN JSON { profil, vorlage } — strikt gegen
 * dieses Schema validiert. Harte Fehler statt stiller Defaults: F3 wird
 * manuell angestoßen, ein Mensch sieht jede Fehlermeldung.
 */

import { z } from 'zod'

// ------------------------------------------------------------
// Bausteine
// ------------------------------------------------------------

/** Muss 1:1 zu IconKey in lib/flagship/types.ts passen */
export const IconKeySchema = z.enum([
  'check', 'shield', 'calendar', 'clock', 'badge',
  'window', 'building', 'sparkle', 'bucket', 'sofa',
  'send', 'wallet', 'pin', 'phone', 'wrench', 'scissors',
  'car', 'heart', 'chart', 'leaf', 'star',
])

const Hex = z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'Hex-Farbe erwartet (z. B. #f2c744)')

/** Bildbeschreibung statt MediaSlot: Datei kommt später aus der Asset-Bank */
export const MediaBeschreibungSchema = z.object({
  /** Sichtbares Platzhalter-Label, z. B. "Hero: Meisterbetrieb im Einsatz" */
  label: z.string().min(3).max(80),
  alt: z.string().min(3).max(160),
})

// ------------------------------------------------------------
// Branchen-Profil (branchen_profile.profil, BF §4.2)
// ------------------------------------------------------------

export const QualiFrageSchema = z.object({
  key: z.string().regex(/^[a-z0-9_]+$/, 'nur a-z, 0-9, _'),
  frage: z.string().min(5).max(160),
  typ: z.enum(['auswahl', 'text']),
  optionen: z.array(z.string().min(1).max(60)).min(2).max(6).optional(),
  pflicht: z.boolean().optional(),
}).refine((f) => f.typ !== 'auswahl' || (f.optionen?.length ?? 0) >= 2, {
  message: 'auswahl braucht optionen',
})

export const DesignSchema = z.object({
  typo_modus: z.enum(['sans_bold_hell', 'serif_warm_dunkel']),
  typo_signature: z.enum(['wisch_highlight', 'gold_unterstrich']),
  tokens: z.object({
    basis: Hex,
    panel: Hex,
    text: Hex,
    text_soft: Hex,
    akzent1: Hex,
    akzent1_tief: Hex,
    akzent2: Hex,
    line: Hex,
  }),
  /** PFLICHT nach BF §1.3: warum dieser Akzent aus der Branchenwelt kommt */
  akzent_begruendung: z.string().min(30).max(400),
})

/** Style-Prompt-Baukasten für Higgsfield (BF §4.2 Punkt 2) */
export const StylePromptsSchema = z.object({
  /** Grundstil, der jedem Prompt vorangestellt wird (Kamera, Realismus, Stimmung) */
  basis_stil: z.string().min(20).max(400),
  szenen: z.object({
    hero: z.string().min(20).max(400),
    /** Ziel-Zustand der Signature (wird ZUERST generiert, makePair-Regel) */
    signature_nachher: z.string().min(20).max(400),
    /** Degradations-Anweisung für die Gegen-Variante derselben Szene */
    signature_vorher: z.string().min(20).max(400),
    /** 6 Detail-/Galerie-Szenen */
    details: z.array(z.string().min(20).max(400)).length(6),
  }),
  licht: z.string().min(10).max(200),
  materialien: z.string().min(10).max(200),
  /** Personen im Bild erlaubt? (immer distanziert/seitlich, BF §2.3) */
  personen_erlaubt: z.boolean(),
  /** Was NIE im Bild sein darf (Marken, Logos, Text …) */
  negativ: z.string().max(300).optional(),
})

export const BranchenProfilSchema = z.object({
  /** Leistungs-Katalog 8–12 (Titel + Kurzbeschreibung) */
  leistungen: z.array(z.object({
    titel: z.string().min(3).max(60),
    kurz: z.string().min(10).max(200),
  })).min(8).max(12),
  /** Kunden-Schmerzpunkte: was den Auftraggeber wirklich nervt */
  schmerzpunkte: z.array(z.string().min(10).max(200)).min(3).max(6),
  /** Lokale Hooks: wie sich der Betrieb im Ort verankert */
  lokale_hooks: z.array(z.string().min(10).max(200)).min(3).max(6),
  /** 6 FAQ-Rohlinge */
  faq_rohlinge: z.array(z.object({
    frage: z.string().min(10).max(140),
    antwort: z.string().min(30).max(500),
  })).length(6),
  /** 5 Ablauf-Schritte (Dienstleistung) bzw. Besuchs-Schritte (Gastro) */
  ablauf_schritte: z.array(z.object({
    titel: z.string().min(3).max(60),
    text: z.string().min(20).max(300),
    badge: z.string().min(2).max(40),
    icon: IconKeySchema,
  })).length(5),
  /** Signature-Wahl: Was ist das Vorher/Nachher dieser Branche? */
  signature: z.object({
    transformations_szene: z.string().min(20).max(400),
    tag_vorher: z.string().min(2).max(40),
    tag_nachher: z.string().min(2).max(40),
  }),
  design: DesignSchema,
  style_prompts: StylePromptsSchema,
  /** Vorqualifizierungs-Fragen für /anfrage (4–6); Gastro (reservierung): leer erlaubt */
  quali_fragen: z.array(QualiFrageSchema).max(6),
  /** Erfolgstext nach Funnel-Absenden */
  erfolg_text: z.string().min(20).max(300),
})

export type BranchenProfil = z.infer<typeof BranchenProfilSchema>

// ------------------------------------------------------------
// Vorlagen-Copy (füllt FlagshipInhalte, Medien nur als Beschreibung)
// ------------------------------------------------------------

const LinkSchema = z.object({ label: z.string().min(2).max(40), anker: z.string().min(2).max(40) })

export const VorlagenCopySchema = z.object({
  /** Fiktive, plausible Beispielfirma für den Preview (KEINE echte Firma) */
  beispiel_meta: z.object({
    firma: z.string().min(3).max(60),
    ort: z.string().min(2).max(40),
    telefon: z.string().min(6).max(30),
    gegruendet: z.string().regex(/^\d{4}$/).optional(),
    seo_titel: z.string().min(10).max(70),
    seo_beschreibung: z.string().min(50).max(160),
  }),
  nav: z.object({
    logo_text: z.string().min(2).max(30),
    logo_bold: z.string().max(20).optional(),
    links: z.array(LinkSchema).min(3).max(5),
    cta_label: z.string().min(3).max(30),
  }),
  hero: z.object({
    eyebrow: z.string().min(3).max(80),
    /** 1–3 Zeilen, [[wort]] = Highlight (genau eine Zeile sollte eins tragen) */
    headline_zeilen: z.array(z.string().min(3).max(60)).min(1).max(3),
    lead: z.string().min(50).max(400),
    cta_label: z.string().min(3).max(40),
    chips: z.array(z.string().min(3).max(40)).min(2).max(4),
    chip_stil: z.enum(['check', 'dot']),
    media: MediaBeschreibungSchema,
    stat1: z.object({ wert: z.string().min(1).max(12), label: z.string().min(3).max(60) }),
    stat2: z.object({ wert: z.string().min(1).max(12), label: z.string().min(3).max(60) }),
  }),
  fakten: z.object({
    punkte: z.array(z.object({
      text: z.string().min(5).max(80),
      icon: IconKeySchema.optional(),
    })).length(4),
  }),
  empathie: z.object({
    eyebrow: z.string().min(3).max(80),
    headline: z.string().min(5).max(120),
    text: z.string().min(80).max(600),
    variante: z.enum(['situationen', 'zitat']),
    situationen: z.array(z.string().min(10).max(160)).min(3).max(5).optional(),
    zitat: z.object({ text: z.string().min(20).max(300), cite: z.string().min(3).max(80) }).optional(),
  }),
  signature: z.object({
    eyebrow: z.string().min(3).max(80),
    headline: z.string().min(5).max(120),
    vorher: MediaBeschreibungSchema,
    nachher: MediaBeschreibungSchema,
    cap: z.string().min(10).max(200),
  }),
  leistungen: z.object({
    eyebrow: z.string().min(3).max(80),
    headline: z.string().min(5).max(120),
    stil: z.enum(['icons', 'nummern']),
    karten: z.array(z.object({
      titel: z.string().min(3).max(60),
      text: z.string().min(20).max(300),
      icon: IconKeySchema.optional(),
      no: z.string().max(10).optional(),
    })).min(4).max(8),
    hinweis: z.object({
      text: z.string().min(10).max(200),
      link_label: z.string().min(3).max(60),
      link_anker: z.string().min(2).max(40),
    }).optional(),
  }),
  ablauf: z.object({
    eyebrow: z.string().min(3).max(80),
    headline: z.string().min(5).max(120),
  }).optional(),
  ergebnisse: z.object({
    eyebrow: z.string().min(3).max(80),
    headline: z.string().min(5).max(120),
    lead: z.string().max(300).optional(),
    variante: z.enum(['ba_slider', 'galerie']),
    paare: z.array(z.object({
      vorher: MediaBeschreibungSchema,
      nachher: MediaBeschreibungSchema,
      caption: z.string().min(5).max(120),
    })).min(1).max(3).optional(),
    bilder: z.array(z.object({
      media: MediaBeschreibungSchema,
      caption: z.string().min(5).max(120),
    })).min(3).max(6).optional(),
  }),
  zahlen: z.object({
    items: z.array(z.object({
      wert: z.union([z.number(), z.string().min(1).max(12)]),
      start: z.number().optional(),
      prefix: z.string().max(4).optional(),
      suffix: z.string().max(4).optional(),
      label: z.string().min(3).max(60),
    })).min(3).max(4),
  }),
  stimmen: z.object({
    eyebrow: z.string().min(3).max(80),
    headline: z.string().min(5).max(120),
    quotes: z.array(z.object({
      text: z.string().min(40).max(400),
      initialen: z.string().min(1).max(4),
      name: z.string().min(3).max(40),
      meta: z.string().min(3).max(80),
    })).length(3),
  }),
  lokal: z.object({
    eyebrow: z.string().min(3).max(80),
    headline: z.string().min(5).max(120),
    lead: z.string().max(300).optional(),
    variante: z.enum(['bezirke', 'info']),
    chips: z.array(z.string().min(2).max(40)).min(6).max(14).optional(),
    note: z.string().max(200).optional(),
    infos: z.array(z.object({
      titel: z.string().min(3).max(40),
      text: z.string().min(5).max(200),
      icon: IconKeySchema,
    })).min(3).max(4).optional(),
  }),
  faq: z.object({
    eyebrow: z.string().min(3).max(80),
    headline: z.string().min(5).max(120),
  }),
  conversion: z.object({
    eyebrow: z.string().min(3).max(80),
    headline: z.string().min(5).max(120),
    lead: z.string().min(30).max(400),
    cta_label: z.string().min(3).max(40),
    trust: z.array(z.string().min(3).max(60)).length(3),
  }),
  footer: z.object({
    beschreibung: z.string().min(30).max(300),
    links: z.array(LinkSchema).min(3).max(5),
  }),
})

export type VorlagenCopy = z.infer<typeof VorlagenCopySchema>

// ------------------------------------------------------------
// Gesamtantwort eines Seeding-Calls
// ------------------------------------------------------------

export const BranchenSeedSchema = z.object({
  profil: BranchenProfilSchema,
  vorlage: VorlagenCopySchema,
})

export type BranchenSeed = z.infer<typeof BranchenSeedSchema>
