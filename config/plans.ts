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

export interface PlanDefinition {
  tier: PackageTier
  name: string
  maxUnterseiten: number // zusätzliche Seiten neben der Startseite
  features: PlanFeature[]
}

export const PLANS: Record<PackageTier, PlanDefinition> = {
  starter: {
    tier: 'starter',
    name: 'Starter',
    maxUnterseiten: 0, // Onepager
    features: ['eigene_domain'],
  },
  business: {
    tier: 'business',
    name: 'Business',
    maxUnterseiten: 5,
    features: ['eigene_domain', 'unterseiten', 'bewertungs_widget', 'seo_basis'],
  },
  growth: {
    tier: 'growth',
    name: 'Premium',
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

/** Nächsthöherer Plan (für Unterseiten-Limit-Gate). */
export function naechsterPlan(tier: string | null | undefined): PlanDefinition | null {
  const idx = TIER_REIHENFOLGE.indexOf(getPlan(tier).tier)
  return idx >= 0 && idx < TIER_REIHENFOLGE.length - 1 ? PLANS[TIER_REIHENFOLGE[idx + 1]] : null
}
