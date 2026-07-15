/**
 * SEO-Plan-Cron (Upsell #1, Phase G §11) — läuft am 1. jedes Monats.
 *
 * Je aktivem Abonnent (upsell_orders product_key 'seo-unterseiten-abo'):
 *   1 Keyword-Landingpage über die Slot-Pipeline generieren →
 *   seo_landingpages (WARTET_AUF_FREIGABE) → Freigabe-Mail an den Kunden.
 * Idempotent: pro Site+Monat max. 1 Eintrag (UNIQUE-Constraint + Vorab-Check).
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generiereSeoLandingpage, SEO_PRODUCT_KEY } from '@/lib/seo-plan'
import { sendSeoFreigabeEmail } from '@/lib/email'
import { generierungGesperrt, meldeJobFehler } from '@/lib/monitoring'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (generierungGesperrt()) {
    return NextResponse.json(
      { error: 'Generierung gestoppt (GENERATION_KILL_SWITCH aktiv)' },
      { status: 503 }
    )
  }

  const supabase = getServiceClient()
  const jetzt = new Date()
  const monat = `${jetzt.getFullYear()}-${String(jetzt.getMonth() + 1).padStart(2, '0')}-01`

  // Aktive SEO-Abos (bezahlt/provisioniert, mit Site)
  const { data: orders } = await supabase
    .from('upsell_orders')
    .select('site_id, customer_id, contract_id')
    .eq('product_key', SEO_PRODUCT_KEY)
    .in('status', ['BEZAHLT', 'PROVISIONIERT'])
    .not('site_id', 'is', null)

  const ergebnisse: Record<string, string> = {}
  const verarbeitet = new Set<string>()

  for (const order of orders || []) {
    const siteId = order.site_id as string
    if (verarbeitet.has(siteId)) continue
    verarbeitet.add(siteId)

    try {
      // Vertrag beendet? → überspringen
      if (order.contract_id) {
        const { data: contract } = await supabase
          .from('contracts')
          .select('status, ende')
          .eq('id', order.contract_id)
          .maybeSingle()
        if (contract?.status === 'BEENDET' || (contract?.ende && new Date(contract.ende) < jetzt)) {
          ergebnisse[siteId] = 'vertrag-beendet'
          continue
        }
      }

      // Diesen Monat schon generiert?
      const { data: bestehend } = await supabase
        .from('seo_landingpages')
        .select('id')
        .eq('site_id', siteId)
        .eq('monat', monat)
        .maybeSingle()
      if (bestehend) {
        ergebnisse[siteId] = 'schon-generiert'
        continue
      }

      const { data: site } = await supabase
        .from('sites')
        .select('id, name, config, pflichtangaben, customer_id')
        .eq('id', siteId)
        .maybeSingle()
      if (!site) {
        ergebnisse[siteId] = 'site-fehlt'
        continue
      }

      const { data: vorhandene } = await supabase
        .from('seo_landingpages')
        .select('slug')
        .eq('site_id', siteId)
      const slugs = (vorhandene || []).map((v) => v.slug as string)

      const lp = await generiereSeoLandingpage(supabase, site, slugs)
      if (!lp) {
        ergebnisse[siteId] = 'keine-komposition'
        continue
      }

      const { error } = await supabase.from('seo_landingpages').insert({
        site_id: siteId,
        monat,
        keyword: lp.keyword,
        slug: lp.slug,
        seiten_config: lp.seiten_config,
        seo_check: lp.seo_check,
        status: 'WARTET_AUF_FREIGABE',
      })
      if (error) {
        ergebnisse[siteId] = `insert-fehler: ${error.message}`
        continue
      }

      // Freigabe-Mail (best effort)
      const { data: kunde } = await supabase
        .from('customers')
        .select('contact_email, company_name')
        .eq('id', site.customer_id)
        .maybeSingle()
      if (kunde?.contact_email) {
        await sendSeoFreigabeEmail(
          kunde.contact_email,
          kunde.company_name || 'Kunde',
          lp.keyword,
          siteId
        )
      }

      ergebnisse[siteId] = `generiert: ${lp.keyword}`
    } catch (e) {
      ergebnisse[siteId] = `fehler: ${e instanceof Error ? e.message : 'unbekannt'}`
    }
  }

  const fehlgeschlagen = Object.entries(ergebnisse).filter(([, v]) => v.startsWith('fehler') || v.startsWith('insert-fehler'))
  if (fehlgeschlagen.length > 0) {
    await meldeJobFehler(
      'seo-plan',
      fehlgeschlagen.map(([id, v]) => `${id}: ${v}`).join('\n'),
      `${fehlgeschlagen.length}/${verarbeitet.size} Sites fehlgeschlagen`
    )
  }

  return NextResponse.json({ monat, anzahl: verarbeitet.size, ergebnisse })
}
