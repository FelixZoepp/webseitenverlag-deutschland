/**
 * Gemeinsamer Kaufweg für Upsells & Plan-Upgrades (§10.4).
 * Genutzt von beiden Kauf-Wegen: Portal-Buchen-Button (Kunden-Route) und
 * 1-Klick-Zahlungslink (Ops-Dashboard). Legt die upsell_orders-Zeile an
 * (Service-Role, RLS-Schreibzugriff ist admin-only) und erstellt die
 * Stripe-Checkout-Session — der Webhook übernimmt danach via
 * metadata.product_key Freischaltung + eigenen Vertrag.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { createUpsellCheckoutSession } from '@/lib/stripe'
import { getPackage, PACKAGES, type PackageTier } from '@/lib/packages'
import { getPlan } from '@/config/plans'
import {
  getUpsellProduct,
  istPlanUpgrade,
  planUpgradeTier,
  type UpsellFulfillment,
} from '@/config/upsells'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

const TIER_REIHENFOLGE: PackageTier[] = ['starter', 'business', 'growth']

interface KaufErgebnis {
  ok: true
  url: string
  orderId: string
}

interface KaufFehler {
  ok: false
  fehler: string
  status: number
}

export async function starteUpsellKauf(
  adminClient: SupabaseClient,
  params: {
    customerId: string
    siteId?: string
    productKey: string
    /** Touchpoint: wizard | editor-gate | portal | admin | cron */
    quelle: string
    /** Aktuelles Paket des Kunden — für die Plan-Upgrade-Validierung */
    aktuellesTier: string
  }
): Promise<KaufErgebnis | KaufFehler> {
  // 1. Produkt auflösen: Katalog-Upsell oder Plan-Upgrade
  let produktName: string
  let einmalCent: number
  let monatCent: number
  let fulfillment: UpsellFulfillment

  if (istPlanUpgrade(params.productKey)) {
    const zielTier = planUpgradeTier(params.productKey) as PackageTier
    if (!PACKAGES.some((p) => p.id === zielTier)) {
      return { ok: false, fehler: 'Unbekanntes Paket', status: 400 }
    }
    const aktuellIdx = TIER_REIHENFOLGE.indexOf((params.aktuellesTier as PackageTier) || 'starter')
    const zielIdx = TIER_REIHENFOLGE.indexOf(zielTier)
    if (zielIdx <= aktuellIdx) {
      return { ok: false, fehler: 'Downgrades laufen über den Support, nicht über den Checkout', status: 400 }
    }
    produktName = `Plan-Upgrade auf ${getPlan(zielTier).name}`
    einmalCent = 0
    monatCent = getPackage(zielTier).price * 100
    fulfillment = 'auto'
  } else {
    const produkt = getUpsellProduct(params.productKey)
    if (!produkt) {
      return { ok: false, fehler: 'Unbekanntes Produkt', status: 400 }
    }
    produktName = produkt.name
    einmalCent = produkt.einmalCent
    monatCent = produkt.monatCent
    fulfillment = produkt.fulfillment

    // Doppelbuchung vermeiden: bereits aktives Upsell nicht erneut verkaufen
    const { data: aktiv } = await adminClient
      .from('activated_upsells')
      .select('id')
      .eq('customer_id', params.customerId)
      .eq('upsell_id', params.productKey)
      .is('deaktiviert_am', null)
      .maybeSingle()
    if (aktiv) {
      return { ok: false, fehler: 'Dieses Modul ist bereits aktiv', status: 409 }
    }
  }

  // 2. Bestellung anlegen (OFFEN)
  const { data: order, error: orderError } = await adminClient
    .from('upsell_orders')
    .insert({
      customer_id: params.customerId,
      site_id: params.siteId || null,
      product_key: params.productKey,
      fulfillment,
      einmal_cent: einmalCent,
      monat_cent: monatCent,
      status: 'OFFEN',
      quelle: params.quelle,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    console.error(`[UPSELL] Bestellung fehlgeschlagen: ${orderError?.message} (Migration 019 ausgeführt?)`)
    return { ok: false, fehler: 'Bestellung konnte nicht angelegt werden', status: 500 }
  }

  // 3. Stripe-Checkout-Session
  const rueckkehr = params.siteId ? `${APP_URL}/dashboard/${params.siteId}` : `${APP_URL}/dashboard`
  try {
    const session = await createUpsellCheckoutSession({
      orderId: order.id,
      productKey: params.productKey,
      produktName,
      einmalCent,
      monatCent,
      customerId: params.customerId,
      siteId: params.siteId,
      successUrl: `${rueckkehr}?upsell=ok`,
      cancelUrl: `${rueckkehr}?upsell=abgebrochen`,
    })

    await adminClient
      .from('upsell_orders')
      .update({ stripe_checkout_session_id: session.sessionId, updated_at: new Date().toISOString() })
      .eq('id', order.id)

    return { ok: true, url: session.url, orderId: order.id }
  } catch (err) {
    console.error('[UPSELL] Stripe-Checkout fehlgeschlagen:', err)
    await adminClient
      .from('upsell_orders')
      .update({ status: 'ABGEBROCHEN', updated_at: new Date().toISOString() })
      .eq('id', order.id)
    return { ok: false, fehler: 'Zahlungslink konnte nicht erstellt werden', status: 502 }
  }
}
