import { SupabaseClient } from '@supabase/supabase-js'
import { getUpsellModuleOrThrow, type UpsellModuleDefinition } from './upsells'
import { createPaymentProvider } from './payment'
import { sendUpsellActivationEmail } from './upsell-emails'

// ============================================================
// Upsell-Orchestrator: Zentrale Aktivierungs-/Deaktivierungs-Logik
// ============================================================

export interface ActivationResult {
  success: boolean
  upsellId: string
  customerId: string
  aktiviertAm: string
  neueMonatsrateGesamtCent: number
  fehler?: string
}

export interface DeactivationResult {
  success: boolean
  deaktiviertAm: string
  fehler?: string
}

export async function activateUpsellForCustomer(
  supabase: SupabaseClient,
  customerId: string,
  upsellId: string,
  config: Record<string, unknown> = {}
): Promise<ActivationResult> {
  const modul = getUpsellModuleOrThrow(upsellId)

  // Prüfe ob bereits aktiv
  const { data: existing } = await supabase
    .from('activated_upsells')
    .select('id')
    .eq('customer_id', customerId)
    .eq('upsell_id', upsellId)
    .is('deaktiviert_am', null)
    .single()

  if (existing) {
    return { success: false, upsellId, customerId, aktiviertAm: '', neueMonatsrateGesamtCent: 0, fehler: `${modul.name} ist bereits aktiv` }
  }

  // Lade Kunden-Daten
  const { data: customer, error: custErr } = await supabase
    .from('customers')
    .select('*, sites(*)')
    .eq('id', customerId)
    .single()

  if (custErr || !customer) {
    return { success: false, upsellId, customerId, aktiviertAm: '', neueMonatsrateGesamtCent: 0, fehler: 'Kunde nicht gefunden' }
  }

  if (customer.status === 'gekuendigt') {
    return { success: false, upsellId, customerId, aktiviertAm: '', neueMonatsrateGesamtCent: 0, fehler: 'Kunde ist gekündigt' }
  }

  // Defaults aus ConfigSchema anwenden
  const finalConfig = applyConfigDefaults(modul, config)

  // 1. Payment-Posten erfassen
  const payment = createPaymentProvider(supabase)
  await payment.addRecurringItem({
    customerId,
    bezeichnung: `${modul.name} Aktivierung`,
    betragProMonatCent: modul.preisProMonatCent,
    gueltigAb: new Date(),
    gueltigBis: customer.contract_end ? new Date(customer.contract_end) : undefined,
  })

  // 2. activated_upsells Eintrag
  const { data: upsellEntry, error: insertErr } = await supabase
    .from('activated_upsells')
    .insert({
      customer_id: customerId,
      upsell_id: upsellId,
      preis_pro_monat_cent: modul.preisProMonatCent,
      konfiguration: finalConfig,
    })
    .select()
    .single()

  if (insertErr) {
    return { success: false, upsellId, customerId, aktiviertAm: '', neueMonatsrateGesamtCent: 0, fehler: insertErr.message }
  }

  // 3. Neue Gesamtrate berechnen
  const neueRate = await berechneGesamtrate(supabase, customerId)

  // 4. Bestätigungs-Email senden
  const email = customer.contact_email
  if (email) {
    await sendUpsellActivationEmail(email, {
      ansprechpartner: customer.company_name || 'Kunde',
      modulName: modul.name,
      preis: modul.preisProMonatCent / 100,
      neueMonatsrate: neueRate / 100,
    })

    await supabase.from('email_logs').insert({
      customer_id: customerId,
      template: 'upsell-aktivierung',
      subject: `${modul.name} ist jetzt aktiv`,
      metadata: { upsellId, preis: modul.preisProMonatCent },
    })
  }

  return {
    success: true,
    upsellId,
    customerId,
    aktiviertAm: upsellEntry.aktiviert_am,
    neueMonatsrateGesamtCent: neueRate,
  }
}

export async function deactivateUpsellForCustomer(
  supabase: SupabaseClient,
  customerId: string,
  upsellId: string
): Promise<DeactivationResult> {
  const now = new Date()

  const { data: aktiv, error } = await supabase
    .from('activated_upsells')
    .select('id')
    .eq('customer_id', customerId)
    .eq('upsell_id', upsellId)
    .is('deaktiviert_am', null)
    .single()

  if (error || !aktiv) {
    return { success: false, deaktiviertAm: '', fehler: 'Upsell nicht aktiv oder nicht gefunden' }
  }

  // Deaktivieren
  await supabase
    .from('activated_upsells')
    .update({ deaktiviert_am: now.toISOString() })
    .eq('id', aktiv.id)

  // Payment-Posten
  const payment = createPaymentProvider(supabase)
  await payment.removeRecurringItem({
    customerId,
    bezugsId: aktiv.id,
    beendetAm: now,
  })

  return { success: true, deaktiviertAm: now.toISOString() }
}

export async function getActiveUpsells(supabase: SupabaseClient, customerId: string) {
  const { data } = await supabase
    .from('activated_upsells')
    .select('*')
    .eq('customer_id', customerId)
    .is('deaktiviert_am', null)
    .order('aktiviert_am', { ascending: true })

  return data || []
}

export async function berechneGesamtrate(supabase: SupabaseClient, customerId: string): Promise<number> {
  const { data: customer } = await supabase
    .from('customers')
    .select('monthly_price')
    .eq('id', customerId)
    .single()

  const basisCent = Math.round((customer?.monthly_price || 0) * 100)

  const aktiveUpsells = await getActiveUpsells(supabase, customerId)
  const upsellSumme = aktiveUpsells.reduce((sum, u) => sum + (u.preis_pro_monat_cent || 0), 0)

  return basisCent + upsellSumme
}

function applyConfigDefaults(modul: UpsellModuleDefinition, config: Record<string, unknown>): Record<string, unknown> {
  const result = { ...config }
  for (const field of modul.configSchema.fields) {
    if (result[field.key] === undefined && field.default !== undefined) {
      result[field.key] = field.default
    }
  }
  return result
}
