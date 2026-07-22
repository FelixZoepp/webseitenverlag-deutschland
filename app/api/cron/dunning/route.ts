/**
 * Dunning-Cron (Phase 5, §6.2) — läuft täglich.
 *
 * Zeitbasierte Eskalation für überfällige Verträge (zahlung_ueberfaellig_seit):
 *   Tag 0 → Erinnerung (Stufe 1, meist schon vom Webhook verschickt)
 *   Tag 3 → Mahnung (Stufe 2)
 *   Tag 7 → letzte Mahnung (Stufe 3)
 *   Tag 14 → Site gesperrt (suspended) + Sperr-Mail + DUNNING_ESKALIERT-Task
 * Alle Schwellen kommen aus config/vertraege.ts (DUNNING_ZEITPLAN).
 * Idempotent: Stufen nur aufwärts, Sperre nur wenn Site noch nicht gesperrt.
 */
import { NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { sendDunningEmail } from '@/lib/email'
import { createManualTask, heuteIso } from '@/lib/contracts'
import { sperreFaellig, stufeFuerTage, tageUeberfaellig } from '@/lib/dunning'
import { revalidateSite } from '@/lib/hosting/site-cache'
import { istCronAutorisiert } from '@/lib/cron-auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

interface UeberfaelligerVertrag {
  id: string
  customer_id: string
  site_id: string | null
  status: string
  mahnstufe: number
  zahlung_ueberfaellig_seit: string
}

async function kundenKontakt(supabase: SupabaseClient, customerId: string) {
  const { data } = await supabase
    .from('customers')
    .select('contact_email, company_name')
    .eq('id', customerId)
    .maybeSingle()
  return { email: data?.contact_email ?? null, name: data?.company_name ?? 'Kunde' }
}

/** Sperrt alle Sites des Vertrags; liefert true, wenn mindestens eine Site neu gesperrt wurde. */
async function sperreSites(supabase: SupabaseClient, vertrag: UeberfaelligerVertrag): Promise<boolean> {
  const abfrage = supabase.from('sites').select('id, gesperrt')
  const { data: sites } = vertrag.site_id
    ? await abfrage.eq('id', vertrag.site_id)
    : await abfrage.eq('customer_id', vertrag.customer_id)

  let neuGesperrt = false
  for (const site of sites || []) {
    if (site.gesperrt) continue
    await supabase.from('sites').update({ gesperrt: true }).eq('id', site.id)
    revalidateSite(site.id as string)
    neuGesperrt = true
  }
  return neuGesperrt
}

export async function GET(request: Request) {
  if (!istCronAutorisiert(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceClient()
  const heute = heuteIso()

  const { data: vertraege } = await supabase
    .from('contracts')
    .select('id, customer_id, site_id, status, mahnstufe, zahlung_ueberfaellig_seit')
    .not('zahlung_ueberfaellig_seit', 'is', null)
    .in('status', ['AKTIV', 'GEKUENDIGT'])

  const ergebnisse: Record<string, string> = {}

  for (const vertrag of (vertraege || []) as UeberfaelligerVertrag[]) {
    const tage = tageUeberfaellig(vertrag.zahlung_ueberfaellig_seit, heute)
    const zielStufe = stufeFuerTage(tage)
    const kontakt = await kundenKontakt(supabase, vertrag.customer_id)
    const schritte: string[] = []

    // 1. Mahnstufe eskalieren (nur aufwärts — idempotent bei täglichem Lauf)
    if (zielStufe > (vertrag.mahnstufe ?? 0)) {
      await supabase
        .from('contracts')
        .update({ mahnstufe: zielStufe, updated_at: new Date().toISOString() })
        .eq('id', vertrag.id)

      if (kontakt.email) {
        const mail = await sendDunningEmail(kontakt.email, kontakt.name, zielStufe)
        if (!mail.success) {
          await createManualTask(supabase, {
            typ: 'MAIL_FEHLGESCHLAGEN',
            titel: `Mahnmail (Stufe ${zielStufe}) fehlgeschlagen: ${kontakt.name}`,
            beschreibung: `Mahnmail an ${kontakt.email} kam nicht durch: ${mail.error}`,
            customer_id: vertrag.customer_id,
            contract_id: vertrag.id,
            quelle: 'dunning-cron',
          })
        }
      }
      schritte.push(`Mahnstufe ${zielStufe} (Tag ${tage})`)
    }

    // 2. Sperre nach 14 Tagen (suspended) — nur beim Übergang, nicht täglich erneut
    if (sperreFaellig(tage)) {
      const neuGesperrt = await sperreSites(supabase, vertrag)
      if (neuGesperrt) {
        if (kontakt.email) await sendDunningEmail(kontakt.email, kontakt.name, 4)
        await createManualTask(supabase, {
          typ: 'DUNNING_ESKALIERT',
          titel: `Zahlung ${tage} Tage überfällig — Site gesperrt: ${kontakt.name}`,
          beschreibung: `Vertrag ${vertrag.id} ist seit ${vertrag.zahlung_ueberfaellig_seit} überfällig. Site wurde automatisch gesperrt (suspended). Kunden kontaktieren / weiteres Vorgehen entscheiden.`,
          customer_id: vertrag.customer_id,
          contract_id: vertrag.id,
          quelle: 'dunning-cron',
        })
        schritte.push('gesperrt')
      }
    }

    if (schritte.length > 0) ergebnisse[vertrag.id] = schritte.join(', ')
  }

  console.log(`[DUNNING] ${Object.keys(ergebnisse).length} Vertrag/Verträge eskaliert`)
  return NextResponse.json({ geprueft: (vertraege || []).length, eskaliert: ergebnisse })
}
