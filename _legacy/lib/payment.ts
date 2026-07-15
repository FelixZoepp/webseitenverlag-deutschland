import { SupabaseClient } from '@supabase/supabase-js'

// ============================================================
// Payment-Provider Interface
// Wird später durch echten Provider (Stripe/Mollie/etc.) ersetzt
// ============================================================

export interface PaymentProvider {
  addRecurringItem(params: {
    customerId: string
    bezeichnung: string
    betragProMonatCent: number
    gueltigAb: Date
    gueltigBis?: Date
    bezugsId?: string
  }): Promise<{ externeItemRef: string | null }>

  removeRecurringItem(params: {
    customerId: string
    bezugsId: string
    beendetAm: Date
  }): Promise<void>

  updateBasisRate(params: {
    customerId: string
    neueRateProMonatCent: number
    gueltigAb: Date
  }): Promise<void>
}

// ============================================================
// Stub-Implementation: loggt alles in rechnungs_posten
// ============================================================

export class StubPaymentProvider implements PaymentProvider {
  constructor(private supabase: SupabaseClient) {}

  async addRecurringItem(params: {
    customerId: string
    bezeichnung: string
    betragProMonatCent: number
    gueltigAb: Date
    gueltigBis?: Date
    bezugsId?: string
  }) {
    console.log('[PAYMENT-STUB] addRecurringItem:', params.bezeichnung, params.betragProMonatCent / 100, '€/Mt')

    await this.supabase.from('rechnungs_posten').insert({
      customer_id: params.customerId,
      typ: 'UPSELL_AKTIVIERUNG',
      bezeichnung: params.bezeichnung,
      betrag_pro_monat_cent: params.betragProMonatCent,
      gueltig_ab: params.gueltigAb.toISOString(),
      gueltig_bis: params.gueltigBis?.toISOString() || null,
      bezugs_id: params.bezugsId || null,
      extern_uebertragen: false,
    })

    return { externeItemRef: null }
  }

  async removeRecurringItem(params: {
    customerId: string
    bezugsId: string
    beendetAm: Date
  }) {
    console.log('[PAYMENT-STUB] removeRecurringItem:', params.bezugsId)

    await this.supabase.from('rechnungs_posten').insert({
      customer_id: params.customerId,
      typ: 'UPSELL_DEAKTIVIERUNG',
      bezeichnung: `Deaktivierung (Bezug: ${params.bezugsId})`,
      betrag_pro_monat_cent: 0,
      gueltig_ab: params.beendetAm.toISOString(),
      extern_uebertragen: false,
    })
  }

  async updateBasisRate(params: {
    customerId: string
    neueRateProMonatCent: number
    gueltigAb: Date
  }) {
    console.log('[PAYMENT-STUB] updateBasisRate:', params.neueRateProMonatCent / 100, '€/Mt')

    await this.supabase.from('rechnungs_posten').insert({
      customer_id: params.customerId,
      typ: 'PAKET_UPGRADE',
      bezeichnung: 'Paket-Upgrade',
      betrag_pro_monat_cent: params.neueRateProMonatCent,
      gueltig_ab: params.gueltigAb.toISOString(),
      extern_uebertragen: false,
    })
  }
}

// Factory: erstellt Payment-Provider mit Supabase-Client
export function createPaymentProvider(supabase: SupabaseClient): PaymentProvider {
  return new StubPaymentProvider(supabase)
}
