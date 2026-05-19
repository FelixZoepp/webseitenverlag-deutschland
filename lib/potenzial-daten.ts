// ============================================================
// Potenzial-Rechner: Recherche-basierte Daten pro Branche × Stadt
// ============================================================
// Quellen: Google Keyword Planner (Schätzungen), Branchenverbände,
// Destatis Kaufkraftindex, Handwerkskammern.
// Suchvolumen = monatliche Suchanfragen für "[branche] [stadt]"
// Auftragswert = regionaler Kaufkraftfaktor × Branchendurchschnitt
// ============================================================

export interface BranchenDaten {
  slug: string
  name: string
  // Branchen-spezifische Defaults (stadt-unabhängig)
  klickrateTop3: number         // 0..1
  conversionWebToLead: number   // 0..1
  abschlussrate: number         // 0..1
  auftragswertCent: number      // Basis-Auftragswert in Cent
}

export interface StadtDaten {
  slug: string
  name: string
  einwohner: number
  kaufkraftIndex: number  // DE-Durchschnitt = 1.0, München = 1.35, Chemnitz = 0.82
  region: 'nord' | 'sued' | 'west' | 'ost'
}

// Suchvolumen pro Branche × Stadt (monatlich, gerundet)
// Key: `${brancheSlug}:${stadtSlug}`
export type SuchvolumenMap = Record<string, number>

// ============================================================
// Branchen
// ============================================================

export const BRANCHEN: BranchenDaten[] = [
  // Handwerk
  { slug: 'heizung-sanitaer', name: 'Heizung & Sanitär', klickrateTop3: 0.28, conversionWebToLead: 0.035, abschlussrate: 0.25, auftragswertCent: 420000 },
  { slug: 'dachdecker', name: 'Dachdecker', klickrateTop3: 0.30, conversionWebToLead: 0.04, abschlussrate: 0.30, auftragswertCent: 850000 },
  { slug: 'elektriker', name: 'Elektriker', klickrateTop3: 0.26, conversionWebToLead: 0.03, abschlussrate: 0.28, auftragswertCent: 280000 },
  { slug: 'maler', name: 'Maler & Lackierer', klickrateTop3: 0.27, conversionWebToLead: 0.035, abschlussrate: 0.30, auftragswertCent: 350000 },
  // Gesundheit
  { slug: 'zahnarzt', name: 'Zahnarzt', klickrateTop3: 0.25, conversionWebToLead: 0.03, abschlussrate: 0.45, auftragswertCent: 25000 },
  { slug: 'physiotherapie', name: 'Physiotherapie', klickrateTop3: 0.28, conversionWebToLead: 0.035, abschlussrate: 0.50, auftragswertCent: 8000 },
  // Dienstleistung
  { slug: 'rechtsanwalt', name: 'Rechtsanwalt', klickrateTop3: 0.22, conversionWebToLead: 0.025, abschlussrate: 0.20, auftragswertCent: 200000 },
  { slug: 'steuerberater', name: 'Steuerberater', klickrateTop3: 0.22, conversionWebToLead: 0.025, abschlussrate: 0.25, auftragswertCent: 300000 },
  { slug: 'immobilien', name: 'Immobilienmakler', klickrateTop3: 0.20, conversionWebToLead: 0.02, abschlussrate: 0.15, auftragswertCent: 1200000 },
  // Lifestyle
  { slug: 'friseur', name: 'Friseur', klickrateTop3: 0.32, conversionWebToLead: 0.05, abschlussrate: 0.60, auftragswertCent: 4500 },
  { slug: 'fitnessstudio', name: 'Fitnessstudio', klickrateTop3: 0.30, conversionWebToLead: 0.04, abschlussrate: 0.35, auftragswertCent: 60000 },
  // Gastronomie
  { slug: 'restaurant', name: 'Restaurant / Gastronomie', klickrateTop3: 0.35, conversionWebToLead: 0.06, abschlussrate: 0.70, auftragswertCent: 3500 },
  // Facility
  { slug: 'reinigung', name: 'Gebäudereinigung', klickrateTop3: 0.28, conversionWebToLead: 0.04, abschlussrate: 0.30, auftragswertCent: 150000 },
  { slug: 'kfz-werkstatt', name: 'KFZ-Werkstatt', klickrateTop3: 0.30, conversionWebToLead: 0.04, abschlussrate: 0.40, auftragswertCent: 65000 },
]

// ============================================================
// Städte (Top 30 + relevante Mittelstädte)
// ============================================================
// Kaufkraftindex: GfK 2024, DE = 1.00

export const STAEDTE: StadtDaten[] = [
  // Millionenstädte
  { slug: 'berlin', name: 'Berlin', einwohner: 3755000, kaufkraftIndex: 0.95, region: 'ost' },
  { slug: 'hamburg', name: 'Hamburg', einwohner: 1892000, kaufkraftIndex: 1.12, region: 'nord' },
  { slug: 'muenchen', name: 'München', einwohner: 1512000, kaufkraftIndex: 1.35, region: 'sued' },
  { slug: 'koeln', name: 'Köln', einwohner: 1084000, kaufkraftIndex: 1.08, region: 'west' },
  // Großstädte 500k+
  { slug: 'frankfurt', name: 'Frankfurt am Main', einwohner: 773000, kaufkraftIndex: 1.22, region: 'west' },
  { slug: 'stuttgart', name: 'Stuttgart', einwohner: 635000, kaufkraftIndex: 1.25, region: 'sued' },
  { slug: 'duesseldorf', name: 'Düsseldorf', einwohner: 621000, kaufkraftIndex: 1.18, region: 'west' },
  { slug: 'leipzig', name: 'Leipzig', einwohner: 616000, kaufkraftIndex: 0.86, region: 'ost' },
  { slug: 'dortmund', name: 'Dortmund', einwohner: 588000, kaufkraftIndex: 0.94, region: 'west' },
  { slug: 'essen', name: 'Essen', einwohner: 582000, kaufkraftIndex: 0.96, region: 'west' },
  { slug: 'bremen', name: 'Bremen', einwohner: 569000, kaufkraftIndex: 0.97, region: 'nord' },
  { slug: 'dresden', name: 'Dresden', einwohner: 563000, kaufkraftIndex: 0.88, region: 'ost' },
  { slug: 'hannover', name: 'Hannover', einwohner: 545000, kaufkraftIndex: 1.02, region: 'nord' },
  // Großstädte 200k–500k
  { slug: 'nuernberg', name: 'Nürnberg', einwohner: 523000, kaufkraftIndex: 1.08, region: 'sued' },
  { slug: 'duisburg', name: 'Duisburg', einwohner: 502000, kaufkraftIndex: 0.88, region: 'west' },
  { slug: 'bochum', name: 'Bochum', einwohner: 365000, kaufkraftIndex: 0.93, region: 'west' },
  { slug: 'wuppertal', name: 'Wuppertal', einwohner: 355000, kaufkraftIndex: 0.94, region: 'west' },
  { slug: 'bielefeld', name: 'Bielefeld', einwohner: 337000, kaufkraftIndex: 1.00, region: 'west' },
  { slug: 'bonn', name: 'Bonn', einwohner: 333000, kaufkraftIndex: 1.10, region: 'west' },
  { slug: 'muenster', name: 'Münster', einwohner: 320000, kaufkraftIndex: 1.08, region: 'west' },
  { slug: 'mannheim', name: 'Mannheim', einwohner: 312000, kaufkraftIndex: 1.05, region: 'sued' },
  { slug: 'augsburg', name: 'Augsburg', einwohner: 304000, kaufkraftIndex: 1.04, region: 'sued' },
  { slug: 'wiesbaden', name: 'Wiesbaden', einwohner: 283000, kaufkraftIndex: 1.15, region: 'west' },
  { slug: 'braunschweig', name: 'Braunschweig', einwohner: 252000, kaufkraftIndex: 1.02, region: 'nord' },
  { slug: 'kiel', name: 'Kiel', einwohner: 247000, kaufkraftIndex: 0.96, region: 'nord' },
  { slug: 'chemnitz', name: 'Chemnitz', einwohner: 246000, kaufkraftIndex: 0.82, region: 'ost' },
  { slug: 'aachen', name: 'Aachen', einwohner: 245000, kaufkraftIndex: 0.98, region: 'west' },
  { slug: 'halle', name: 'Halle (Saale)', einwohner: 239000, kaufkraftIndex: 0.80, region: 'ost' },
  { slug: 'magdeburg', name: 'Magdeburg', einwohner: 239000, kaufkraftIndex: 0.81, region: 'ost' },
  { slug: 'freiburg', name: 'Freiburg', einwohner: 234000, kaufkraftIndex: 1.06, region: 'sued' },
  { slug: 'krefeld', name: 'Krefeld', einwohner: 228000, kaufkraftIndex: 0.97, region: 'west' },
  { slug: 'mainz', name: 'Mainz', einwohner: 220000, kaufkraftIndex: 1.05, region: 'west' },
  { slug: 'luebeck', name: 'Lübeck', einwohner: 217000, kaufkraftIndex: 0.97, region: 'nord' },
  { slug: 'rostock', name: 'Rostock', einwohner: 210000, kaufkraftIndex: 0.84, region: 'ost' },
  { slug: 'erfurt', name: 'Erfurt', einwohner: 214000, kaufkraftIndex: 0.84, region: 'ost' },
  // Mittelstädte (repräsentativ)
  { slug: 'regensburg', name: 'Regensburg', einwohner: 157000, kaufkraftIndex: 1.10, region: 'sued' },
  { slug: 'wolfsburg', name: 'Wolfsburg', einwohner: 128000, kaufkraftIndex: 1.18, region: 'nord' },
  { slug: 'ulm', name: 'Ulm', einwohner: 127000, kaufkraftIndex: 1.12, region: 'sued' },
  { slug: 'heilbronn', name: 'Heilbronn', einwohner: 128000, kaufkraftIndex: 1.14, region: 'sued' },
  { slug: 'goettingen', name: 'Göttingen', einwohner: 119000, kaufkraftIndex: 0.94, region: 'nord' },
  { slug: 'reutlingen', name: 'Reutlingen', einwohner: 117000, kaufkraftIndex: 1.08, region: 'sued' },
  { slug: 'koblenz', name: 'Koblenz', einwohner: 114000, kaufkraftIndex: 0.98, region: 'west' },
  { slug: 'jena', name: 'Jena', einwohner: 112000, kaufkraftIndex: 0.86, region: 'ost' },
  { slug: 'trier', name: 'Trier', einwohner: 112000, kaufkraftIndex: 0.93, region: 'west' },
  { slug: 'siegen', name: 'Siegen', einwohner: 102000, kaufkraftIndex: 0.97, region: 'west' },
  { slug: 'konstanz', name: 'Konstanz', einwohner: 85000, kaufkraftIndex: 1.06, region: 'sued' },
]

// ============================================================
// Suchvolumen-Tabelle: Branche × Stadt
// ============================================================
// Recherchiert via Google Keyword Planner (Schätzungen Mai 2025)
// Keyword-Pattern: "[branche] [stadt]" + Varianten
// z.B. "heizung sanitär münchen", "sanitär notdienst münchen",
//      "installateur münchen" → summiert
//
// Für Städte ohne expliziten Eintrag wird anhand der Einwohnerzahl
// interpoliert (siehe getSearchVolume-Funktion).

export const SUCHVOLUMEN: SuchvolumenMap = {
  // ── Heizung & Sanitär ──────────────────────────────────────
  'heizung-sanitaer:berlin': 2900,
  'heizung-sanitaer:hamburg': 1600,
  'heizung-sanitaer:muenchen': 1900,
  'heizung-sanitaer:koeln': 1100,
  'heizung-sanitaer:frankfurt': 880,
  'heizung-sanitaer:stuttgart': 850,
  'heizung-sanitaer:duesseldorf': 720,
  'heizung-sanitaer:leipzig': 580,
  'heizung-sanitaer:dortmund': 520,
  'heizung-sanitaer:essen': 480,
  'heizung-sanitaer:bremen': 460,
  'heizung-sanitaer:dresden': 530,
  'heizung-sanitaer:hannover': 590,
  'heizung-sanitaer:nuernberg': 620,
  'heizung-sanitaer:duisburg': 390,
  'heizung-sanitaer:bonn': 320,
  'heizung-sanitaer:muenster': 280,
  'heizung-sanitaer:mannheim': 340,
  'heizung-sanitaer:augsburg': 310,
  'heizung-sanitaer:freiburg': 260,
  'heizung-sanitaer:regensburg': 170,
  'heizung-sanitaer:koblenz': 110,

  // ── Dachdecker ─────────────────────────────────────────────
  'dachdecker:berlin': 2400,
  'dachdecker:hamburg': 1300,
  'dachdecker:muenchen': 1200,
  'dachdecker:koeln': 880,
  'dachdecker:frankfurt': 640,
  'dachdecker:stuttgart': 580,
  'dachdecker:duesseldorf': 560,
  'dachdecker:leipzig': 480,
  'dachdecker:dortmund': 440,
  'dachdecker:dresden': 420,
  'dachdecker:hannover': 480,
  'dachdecker:nuernberg': 460,
  'dachdecker:bremen': 380,
  'dachdecker:bonn': 260,
  'dachdecker:muenster': 240,
  'dachdecker:freiburg': 190,
  'dachdecker:regensburg': 130,

  // ── Elektriker ─────────────────────────────────────────────
  'elektriker:berlin': 3600,
  'elektriker:hamburg': 2100,
  'elektriker:muenchen': 2400,
  'elektriker:koeln': 1400,
  'elektriker:frankfurt': 1100,
  'elektriker:stuttgart': 1000,
  'elektriker:duesseldorf': 880,
  'elektriker:leipzig': 720,
  'elektriker:dortmund': 640,
  'elektriker:essen': 590,
  'elektriker:bremen': 540,
  'elektriker:dresden': 680,
  'elektriker:hannover': 740,
  'elektriker:nuernberg': 720,
  'elektriker:bonn': 360,
  'elektriker:mannheim': 420,
  'elektriker:freiburg': 320,
  'elektriker:regensburg': 210,

  // ── Maler & Lackierer ──────────────────────────────────────
  'maler:berlin': 2800,
  'maler:hamburg': 1500,
  'maler:muenchen': 1600,
  'maler:koeln': 1000,
  'maler:frankfurt': 780,
  'maler:stuttgart': 720,
  'maler:duesseldorf': 680,
  'maler:leipzig': 520,
  'maler:dortmund': 460,
  'maler:dresden': 480,
  'maler:hannover': 540,
  'maler:nuernberg': 520,
  'maler:bremen': 420,
  'maler:bonn': 280,
  'maler:freiburg': 240,
  'maler:regensburg': 150,

  // ── Zahnarzt ───────────────────────────────────────────────
  'zahnarzt:berlin': 8100,
  'zahnarzt:hamburg': 4900,
  'zahnarzt:muenchen': 5400,
  'zahnarzt:koeln': 3200,
  'zahnarzt:frankfurt': 2600,
  'zahnarzt:stuttgart': 2200,
  'zahnarzt:duesseldorf': 2100,
  'zahnarzt:leipzig': 1600,
  'zahnarzt:dortmund': 1400,
  'zahnarzt:essen': 1300,
  'zahnarzt:bremen': 1200,
  'zahnarzt:dresden': 1500,
  'zahnarzt:hannover': 1700,
  'zahnarzt:nuernberg': 1600,
  'zahnarzt:bonn': 880,
  'zahnarzt:muenster': 780,
  'zahnarzt:mannheim': 880,
  'zahnarzt:freiburg': 720,
  'zahnarzt:regensburg': 480,

  // ── Physiotherapie ─────────────────────────────────────────
  'physiotherapie:berlin': 5800,
  'physiotherapie:hamburg': 3200,
  'physiotherapie:muenchen': 3600,
  'physiotherapie:koeln': 2200,
  'physiotherapie:frankfurt': 1700,
  'physiotherapie:stuttgart': 1500,
  'physiotherapie:duesseldorf': 1400,
  'physiotherapie:leipzig': 1100,
  'physiotherapie:dresden': 1000,
  'physiotherapie:hannover': 1200,
  'physiotherapie:nuernberg': 1100,
  'physiotherapie:bremen': 880,
  'physiotherapie:bonn': 620,
  'physiotherapie:freiburg': 520,
  'physiotherapie:regensburg': 340,

  // ── Rechtsanwalt ───────────────────────────────────────────
  'rechtsanwalt:berlin': 4800,
  'rechtsanwalt:hamburg': 2900,
  'rechtsanwalt:muenchen': 3200,
  'rechtsanwalt:koeln': 2000,
  'rechtsanwalt:frankfurt': 1800,
  'rechtsanwalt:stuttgart': 1400,
  'rechtsanwalt:duesseldorf': 1500,
  'rechtsanwalt:leipzig': 900,
  'rechtsanwalt:dortmund': 780,
  'rechtsanwalt:dresden': 820,
  'rechtsanwalt:hannover': 1000,
  'rechtsanwalt:nuernberg': 920,
  'rechtsanwalt:bremen': 720,
  'rechtsanwalt:bonn': 540,
  'rechtsanwalt:freiburg': 380,
  'rechtsanwalt:regensburg': 240,

  // ── Steuerberater ──────────────────────────────────────────
  'steuerberater:berlin': 4200,
  'steuerberater:hamburg': 2600,
  'steuerberater:muenchen': 2900,
  'steuerberater:koeln': 1700,
  'steuerberater:frankfurt': 1600,
  'steuerberater:stuttgart': 1300,
  'steuerberater:duesseldorf': 1200,
  'steuerberater:leipzig': 780,
  'steuerberater:dresden': 720,
  'steuerberater:hannover': 880,
  'steuerberater:nuernberg': 820,
  'steuerberater:bremen': 640,
  'steuerberater:bonn': 480,
  'steuerberater:freiburg': 340,
  'steuerberater:regensburg': 220,

  // ── Immobilienmakler ───────────────────────────────────────
  'immobilien:berlin': 4400,
  'immobilien:hamburg': 2600,
  'immobilien:muenchen': 3800,
  'immobilien:koeln': 1600,
  'immobilien:frankfurt': 1800,
  'immobilien:stuttgart': 1300,
  'immobilien:duesseldorf': 1200,
  'immobilien:leipzig': 720,
  'immobilien:dresden': 640,
  'immobilien:hannover': 780,
  'immobilien:nuernberg': 720,
  'immobilien:bonn': 440,
  'immobilien:freiburg': 380,
  'immobilien:regensburg': 260,

  // ── Friseur ────────────────────────────────────────────────
  'friseur:berlin': 6600,
  'friseur:hamburg': 3800,
  'friseur:muenchen': 4200,
  'friseur:koeln': 2600,
  'friseur:frankfurt': 1900,
  'friseur:stuttgart': 1700,
  'friseur:duesseldorf': 1600,
  'friseur:leipzig': 1200,
  'friseur:dortmund': 1100,
  'friseur:dresden': 1100,
  'friseur:hannover': 1300,
  'friseur:nuernberg': 1200,
  'friseur:bremen': 1000,
  'friseur:bonn': 640,
  'friseur:freiburg': 520,
  'friseur:regensburg': 340,

  // ── Fitnessstudio ──────────────────────────────────────────
  'fitnessstudio:berlin': 8200,
  'fitnessstudio:hamburg': 4600,
  'fitnessstudio:muenchen': 5100,
  'fitnessstudio:koeln': 3000,
  'fitnessstudio:frankfurt': 2200,
  'fitnessstudio:stuttgart': 1900,
  'fitnessstudio:duesseldorf': 1800,
  'fitnessstudio:leipzig': 1400,
  'fitnessstudio:dortmund': 1300,
  'fitnessstudio:dresden': 1200,
  'fitnessstudio:hannover': 1500,
  'fitnessstudio:nuernberg': 1400,
  'fitnessstudio:bremen': 1100,
  'fitnessstudio:bonn': 720,
  'fitnessstudio:freiburg': 620,
  'fitnessstudio:regensburg': 380,

  // ── Restaurant / Gastronomie ───────────────────────────────
  'restaurant:berlin': 12100,
  'restaurant:hamburg': 6800,
  'restaurant:muenchen': 7400,
  'restaurant:koeln': 4200,
  'restaurant:frankfurt': 3200,
  'restaurant:stuttgart': 2600,
  'restaurant:duesseldorf': 2400,
  'restaurant:leipzig': 1800,
  'restaurant:dortmund': 1500,
  'restaurant:dresden': 1600,
  'restaurant:hannover': 1800,
  'restaurant:nuernberg': 1700,
  'restaurant:bremen': 1400,
  'restaurant:bonn': 880,
  'restaurant:freiburg': 720,
  'restaurant:regensburg': 460,

  // ── Gebäudereinigung ───────────────────────────────────────
  'reinigung:berlin': 1900,
  'reinigung:hamburg': 1100,
  'reinigung:muenchen': 1200,
  'reinigung:koeln': 720,
  'reinigung:frankfurt': 640,
  'reinigung:stuttgart': 540,
  'reinigung:duesseldorf': 520,
  'reinigung:leipzig': 380,
  'reinigung:dresden': 340,
  'reinigung:hannover': 420,
  'reinigung:nuernberg': 380,
  'reinigung:bremen': 320,
  'reinigung:bonn': 210,
  'reinigung:freiburg': 160,
  'reinigung:regensburg': 100,

  // ── KFZ-Werkstatt ──────────────────────────────────────────
  'kfz-werkstatt:berlin': 4800,
  'kfz-werkstatt:hamburg': 2800,
  'kfz-werkstatt:muenchen': 3100,
  'kfz-werkstatt:koeln': 1900,
  'kfz-werkstatt:frankfurt': 1400,
  'kfz-werkstatt:stuttgart': 1200,
  'kfz-werkstatt:duesseldorf': 1100,
  'kfz-werkstatt:leipzig': 880,
  'kfz-werkstatt:dortmund': 780,
  'kfz-werkstatt:dresden': 820,
  'kfz-werkstatt:hannover': 920,
  'kfz-werkstatt:nuernberg': 880,
  'kfz-werkstatt:bremen': 720,
  'kfz-werkstatt:bonn': 440,
  'kfz-werkstatt:freiburg': 360,
  'kfz-werkstatt:regensburg': 220,
}

// ============================================================
// Lookup-Funktionen
// ============================================================

/**
 * Suchvolumen für eine Branche × Stadt Kombination.
 * Wenn kein expliziter Eintrag vorhanden, wird anhand der
 * Einwohnerzahl relativ zu Berlin interpoliert.
 */
export function getSuchvolumen(brancheSlug: string, stadtSlug: string): number {
  // Direkte Lookup
  const key = `${brancheSlug}:${stadtSlug}`
  if (SUCHVOLUMEN[key] !== undefined) return SUCHVOLUMEN[key]

  // Interpolation: Berlin als Referenz nehmen
  const berlinKey = `${brancheSlug}:berlin`
  const berlinVol = SUCHVOLUMEN[berlinKey]
  if (!berlinVol) return 0

  const stadt = STAEDTE.find((s) => s.slug === stadtSlug)
  const berlin = STAEDTE.find((s) => s.slug === 'berlin')!
  if (!stadt) return 0

  // Nicht-linearer Zusammenhang: Suchvolumen ~ Einwohner^0.75
  const ratio = Math.pow(stadt.einwohner / berlin.einwohner, 0.75)
  return Math.round(berlinVol * ratio)
}

/**
 * Auftragswert angepasst an regionale Kaufkraft.
 */
export function getRegionalerAuftragswert(basisCent: number, stadtSlug: string): number {
  const stadt = STAEDTE.find((s) => s.slug === stadtSlug)
  if (!stadt) return basisCent
  return Math.round(basisCent * stadt.kaufkraftIndex)
}
