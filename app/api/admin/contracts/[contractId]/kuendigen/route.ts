import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { getStripe } from '@/lib/stripe'
import { createManualTask, heuteIso, wirksamesKuendigungsdatum } from '@/lib/contracts'

/**
 * Kündigung eines Vertrags (24/24/3) durch den Admin — z.B. wenn der Kunde
 * per Mail/Brief kündigt. Berechnet das wirksame Vertragsende nach
 * Kündigungsfrist, setzt den Vertrag auf GEKUENDIGT und versucht best-effort,
 * das Stripe-Abo zum Laufzeitende zu beenden.
 */
export async function POST(
  request: Request,
  { params }: { params: { contractId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const { supabase } = auth.data

  const { data: contract, error: loadError } = await supabase
    .from('contracts')
    .select(
      'id, customer_id, status, ende, laufzeit_monate, verlaengerung_monate, kuendigungsfrist_monate, stripe_subscription_id, paket'
    )
    .eq('id', params.contractId)
    .single()

  if (loadError || !contract) {
    return NextResponse.json({ error: 'Vertrag nicht gefunden' }, { status: 404 })
  }
  if (contract.status !== 'AKTIV') {
    return NextResponse.json(
      { error: `Vertrag ist nicht aktiv (Status: ${contract.status})` },
      { status: 400 }
    )
  }

  const heute = heuteIso()
  const kuendigungZum = wirksamesKuendigungsdatum(
    {
      ende: contract.ende,
      laufzeit_monate: contract.laufzeit_monate,
      verlaengerung_monate: contract.verlaengerung_monate,
      kuendigungsfrist_monate: contract.kuendigungsfrist_monate,
    },
    heute
  )

  const { error: updateError } = await supabase
    .from('contracts')
    .update({
      status: 'GEKUENDIGT',
      gekuendigt_am: heute,
      kuendigung_zum: kuendigungZum,
      ende: kuendigungZum,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contract.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Best effort: Stripe-Abo zum wirksamen Vertragsende auslaufen lassen.
  let stripeHinweis: string | null = null
  if (contract.stripe_subscription_id) {
    try {
      // cancel_at erwartet Unix-Sekunden (UTC-Mitternacht des Stichtags)
      const cancelAt = Math.floor(Date.parse(`${kuendigungZum}T00:00:00Z`) / 1000)
      await getStripe().subscriptions.update(contract.stripe_subscription_id, {
        cancel_at: cancelAt,
      })
    } catch (err) {
      stripeHinweis = err instanceof Error ? err.message : 'Stripe-Fehler'
      await createManualTask(supabase, {
        typ: 'KUENDIGUNG',
        titel: 'Stripe-Abo konnte nicht zum Vertragsende terminiert werden',
        beschreibung: `Vertrag ${contract.id} (${contract.paket}) wurde auf GEKUENDIGT gesetzt (wirksam zum ${kuendigungZum}), aber das Stripe-Abo ${contract.stripe_subscription_id} konnte nicht aktualisiert werden: ${stripeHinweis}. Bitte im Stripe-Dashboard manuell zum ${kuendigungZum} kündigen.`,
        customer_id: contract.customer_id,
        contract_id: contract.id,
        quelle: 'admin',
      })
    }
  } else {
    await createManualTask(supabase, {
      typ: 'KUENDIGUNG',
      titel: 'Kündigung ohne Stripe-Abo — Zahlungen prüfen',
      beschreibung: `Vertrag ${contract.id} (${contract.paket}) wurde gekündigt (wirksam zum ${kuendigungZum}), hat aber keine Stripe-Subscription hinterlegt. Bitte Zahlungsweg prüfen.`,
      customer_id: contract.customer_id,
      contract_id: contract.id,
      quelle: 'admin',
    })
  }

  return NextResponse.json({
    ok: true,
    gekuendigt_am: heute,
    kuendigung_zum: kuendigungZum,
    stripe_hinweis: stripeHinweis,
  })
}
