import { requireAdmin } from '@/lib/auth-helpers'
import { UPSELL_PRODUCTS } from '@/config/upsells'
import { NextResponse } from 'next/server'

/**
 * GET: Upsell-Katalog (§10.4) für einen Kunden mit Kauf-Status aus dem
 * neuen Kaufweg (upsell_orders/Stripe-Checkout). Der alte Aktivierungs-Flow
 * (Orchestrator/UPSELL_MODULES) liegt in _legacy — Alt-Freischaltungen aus
 * activated_upsells werden nur noch lesend als Bestand ausgewiesen.
 */
export async function GET(
  _request: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const result = await requireAdmin()
    if (!result.ok) return result.response

    const { supabase } = result.data

    const [{ data: orders }, { data: aktive }] = await Promise.all([
      supabase
        .from('upsell_orders')
        .select('product_key, status, einmal_cent, monat_cent, created_at, quelle')
        .eq('customer_id', params.customerId)
        .order('created_at', { ascending: false }),
      supabase
        .from('activated_upsells')
        .select('upsell_id, preis_pro_monat_cent, aktiviert_am')
        .eq('customer_id', params.customerId)
        .is('deaktiviert_am', null),
    ])

    const ordersJeProdukt = new Map<string, { status: string; created_at: string; quelle: string | null }>()
    for (const o of orders ?? []) {
      // Neueste Order gewinnt (Liste ist absteigend sortiert)
      if (!ordersJeProdukt.has(o.product_key as string)) {
        ordersJeProdukt.set(o.product_key as string, {
          status: o.status as string,
          created_at: o.created_at as string,
          quelle: (o.quelle as string) ?? null,
        })
      }
    }

    const produkte = UPSELL_PRODUCTS.map((p) => {
      const order = ordersJeProdukt.get(p.key)
      return {
        key: p.key,
        name: p.name,
        nutzen: p.nutzen,
        einmalCent: p.einmalCent,
        monatCent: p.monatCent,
        fulfillment: p.fulfillment,
        orderStatus: order?.status ?? null,
        gekauftAm: order && ['BEZAHLT', 'PROVISIONIERT'].includes(order.status) ? order.created_at : null,
        quelle: order?.quelle ?? null,
      }
    })

    // Alt-Bestand: Freischaltungen aus dem abgelösten Flow (alte Modul-IDs).
    // Neue Produkt-Keys stehen nach Webhook-Freischaltung ebenfalls in
    // activated_upsells — die sind oben schon über die Order abgebildet.
    const neueKeys = new Set(UPSELL_PRODUCTS.map((p) => p.key))
    const altUpsells = (aktive ?? []).filter((a) => !neueKeys.has(a.upsell_id as string))

    return NextResponse.json({ produkte, altUpsells })
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
