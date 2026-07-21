/**
 * Stripe-Produkt-Mapping (Baustein C §C.4).
 *
 * Drei Stripe-Produkte — Starter/Business/Growth. Die PREISE leben NUR in
 * Stripe (Price-IDs) bzw. als Fallback in lib/packages.ts (price_data).
 * Die Feature-Matrix lebt NUR in config/plans.ts. Hier steht ausschließlich
 * das Env-Mapping Tier → Stripe-Price-ID (Testmode/Live über Env trennbar).
 *
 * WARTELISTE: Price-IDs im Stripe-Dashboard anlegen und als Env setzen —
 * bis dahin greift der bestehende price_data-Fallback in lib/stripe.ts.
 */
import type { PackageTier } from '@/lib/packages'

const ENV_KEYS: Record<PackageTier, string> = {
  starter: 'STRIPE_PRICE_STARTER',
  business: 'STRIPE_PRICE_BUSINESS',
  growth: 'STRIPE_PRICE_GROWTH',
}

/** Stripe-Price-ID für ein Tier — null, wenn (noch) kein Produkt gepflegt ist. */
export function getStripePriceId(tier: PackageTier): string | null {
  const id = process.env[ENV_KEYS[tier]]
  return id && id.startsWith('price_') ? id : null
}
