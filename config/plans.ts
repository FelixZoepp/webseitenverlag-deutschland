/**
 * Feature-Wahrheit der Pläne (§10.3).
 *
 * Diese Datei ist die EINZIGE Quelle dafür, welcher Plan welches Feature
 * freischaltet. Preise leben in Stripe (Checkout mit price_data bzw.
 * Stripe-Products) — hier stehen nur Fähigkeiten.
 *
 * Mapping auf bestehende Tiers (lib/packages.ts):
 *   STARTER = starter, BUSINESS = business, PREMIUM = growth.
 */
import type { PackageTier } from '@/lib/packages'

export type PlanFeature =
  | 'unterseiten'        // mehr als der Onepager
  | 'bewertungs_widget'  // Bewertungs-Widget auf der Website
  | 'seo_basis'          // lokales SEO-Setup, Schema.org
  | 'ads_landingpages'   // programmatische Ads-Landingpages
  | 'terminbuchung'      // Terminbuchungs-Sektion
  | 'seo_prioritaet'     // SEO-Priorität (Artikel, Reports)
  | 'eigene_domain'      // eigene Domain — alle Pläne

/**
 * Editor-Rechte je Produktstufe (Baustein C §C.4).
 *
 * WICHTIG (Grundsatz §C): Die Stufen unterscheiden sich in Template-Level und
 * Editor-Rechten — NIE in der Personalisierung der Texte. Copy-Slots werden in
 * JEDER Stufe pro Kunde personalisiert, auch im Starter. Identische Texte über
 * viele Kundenseiten wären Duplicate Content und damit SEO-Schaden für ALLE
 * Kunden. „Fix" bei 99 € heißt: Struktur fix, nicht Texte fix.
 */
export type EditorFeature =
  | 'update_text'              // Texte ändern (alle Stufen — Personalisierung!)
  | 'swap_image_from_bank'     // Bildtausch aus freigegebener Bank (alle Stufen)
  | 'set_theme_preset'         // Farb-Preset wechseln (Starter: nur Auswahl)
  | 'add_section_from_library' // Sektions-Galerie (ab Business)
  | 'reorder'                  // Sektionen umsortieren (ab Business, Kern fix)
  | 'signature_section'        // branchenspezifische Signature-Section (ab Business)
  | 'video_header'             // Video-Hero Loop (ab Business)
  | 'scroll_story'             // Scroll-Story / Scrub-Video (nur Growth)

export interface PlanDefinition {
  tier: PackageTier
  name: string
  /** Preis-Hinweis für Upsell-Antworten — der echte Preis lebt NUR in Stripe. */
  preis_hinweis: string
  maxUnterseiten: number // zusätzliche Seiten neben der Startseite
  features: PlanFeature[]
  /** Serverseitig durchgesetzte Editor-Rechte (Baustein C — nie nur UI!). */
  editorFeatures: EditorFeature[]
  /**
   * Erlaubte Theme-Presets (set_theme_preset). Starter: nur 3 kuratierte
   * Presets („Frozen Composition"). null = alle Presets erlaubt.
   */
  erlaubteThemePresets: string[] | null
}

const STARTER_EDITOR: EditorFeature[] = ['update_text', 'swap_image_from_bank', 'set_theme_preset']
const BUSINESS_EDITOR: EditorFeature[] = [
  ...STARTER_EDITOR,
  'add_section_from_library',
  'reorder',
  'signature_section',
  'video_header',
]
const GROWTH_EDITOR: EditorFeature[] = [...BUSINESS_EDITOR, 'scroll_story']

export const PLANS: Record<PackageTier, PlanDefinition> = {
  starter: {
    tier: 'starter',
    name: 'Starter',
    preis_hinweis: '99 € netto',
    maxUnterseiten: 0, // Onepager
    features: ['eigene_domain'],
    editorFeatures: STARTER_EDITOR,
    erlaubteThemePresets: ['klar-blau', 'modern-anthrazit', 'warm-terracotta'],
  },
  business: {
    tier: 'business',
    name: 'Business',
    preis_hinweis: '169 € netto',
    maxUnterseiten: 5,
    features: ['eigene_domain', 'unterseiten', 'bewertungs_widget', 'seo_basis'],
    editorFeatures: BUSINESS_EDITOR,
    erlaubteThemePresets: null,
  },
  growth: {
    tier: 'growth',
    name: 'Premium',
    preis_hinweis: '249 € netto',
    maxUnterseiten: 10,
    features: [
      'eigene_domain',
      'unterseiten',
      'bewertungs_widget',
      'seo_basis',
      'ads_landingpages',
      'terminbuchung',
      'seo_prioritaet',
    ],
    editorFeatures: GROWTH_EDITOR,
    erlaubteThemePresets: null,
  },
}

const TIER_REIHENFOLGE: PackageTier[] = ['starter', 'business', 'growth']

export function getPlan(tier: string | null | undefined): PlanDefinition {
  return PLANS[(tier as PackageTier) || 'starter'] || PLANS.starter
}

export function hasFeature(tier: string | null | undefined, feature: PlanFeature): boolean {
  return getPlan(tier).features.includes(feature)
}

/** Kleinster Plan, der das Feature enthält — für den Upgrade-Vorschlag im Feature-Gate. */
export function kleinsterPlanMitFeature(feature: PlanFeature): PlanDefinition | null {
  for (const tier of TIER_REIHENFOLGE) {
    if (PLANS[tier].features.includes(feature)) return PLANS[tier]
  }
  return null
}

/** Serverseitiges Editor-Gate (Baustein C): darf dieser Plan die Editor-Op nutzen? */
export function hatEditorFeature(tier: string | null | undefined, feature: EditorFeature): boolean {
  return getPlan(tier).editorFeatures.includes(feature)
}

/** Kleinster Plan mit dem Editor-Feature — für die Upsell-Antwort des Editors. */
export function kleinsterPlanMitEditorFeature(feature: EditorFeature): PlanDefinition | null {
  for (const tier of TIER_REIHENFOLGE) {
    if (PLANS[tier].editorFeatures.includes(feature)) return PLANS[tier]
  }
  return null
}

/** Nächsthöherer Plan (für Unterseiten-Limit-Gate). */
export function naechsterPlan(tier: string | null | undefined): PlanDefinition | null {
  const idx = TIER_REIHENFOLGE.indexOf(getPlan(tier).tier)
  return idx >= 0 && idx < TIER_REIHENFOLGE.length - 1 ? PLANS[TIER_REIHENFOLGE[idx + 1]] : null
}

/**
 * Render-Stufe der Template-Fabrik-Kompositionen (ab B2 „maler-landing-v1"):
 * statisch = Onepager ohne Video · video = +Video/Galerie/Signature ·
 * growth = +Unterseiten +Funktions-Module. Die Zuordnung Tier → Stufe lebt
 * NUR hier (Master-Regel: config over hardcode).
 */
export type RenderStufe = 'statisch' | 'video' | 'growth'

export function renderStufeFuerTier(tier: string | null | undefined): RenderStufe {
  switch (getPlan(tier).tier) {
    case 'business':
      return 'video'
    case 'growth':
      return 'growth'
    default:
      return 'statisch'
  }
}

/**
 * Paket-Rezept — Ableitungen aus der Render-Stufe für Demo-Pipeline und
 * Demo-Render. EINZIGE Quelle: keine verstreuten `paket !== 'starter'`-Checks
 * mehr in Routen (Verhinderungs-Regel in scripts/test-baustein-c.ts).
 */

/** Seiten-Modus je Tier: Onepager nur, wenn der Plan keine Unterseiten hat. */
export function seitenModusFuerTier(tier: string | null | undefined): 'onepager' | 'multipage' {
  return getPlan(tier).maxUnterseiten > 0 ? 'multipage' : 'onepager'
}

/** Video-Generierung in der Demo-Pipeline: alle Stufen außer der statischen. */
export function videoErlaubtFuerTier(tier: string | null | undefined): boolean {
  return renderStufeFuerTier(tier) !== 'statisch'
}

/**
 * Render-Level des generischen Flagships (Legacy-Namen 'business' | 'growth'):
 * 'business' entfernt den Video-Hero, 'growth' zeigt ihn. Demos rendern damit
 * ihr Paket: Starter ohne Video, Business/Growth mit Video-Look.
 */
export function flagshipLevelFuerTier(tier: string | null | undefined): 'business' | 'growth' {
  return renderStufeFuerTier(tier) === 'statisch' ? 'business' : 'growth'
}
