/**
 * Google Ads Starter (Upsell #3, Phase G §11):
 *   GET  → alle Kampagnen(-Entwürfe) für den Admin
 *   POST → Kampagnen-Entwurf (Search + PMax, Test-Modus) für eine Site erzeugen
 *          { siteId } — derselbe Generator wie im Stripe-Webhook (DoD-testbar).
 */
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { generiereAdsEntwuerfe } from '@/lib/ads-starter'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const { supabase } = auth.data

  const { data: kampagnen } = await supabase
    .from('ads_kampagnen')
    .select('id, customer_id, site_id, typ, status, entwurf, mcc_kundenkonto_id, letzter_report_am, created_at, customers(company_name)')
    .order('created_at', { ascending: false })

  return NextResponse.json({ kampagnen: kampagnen || [] })
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const { supabase } = auth.data

  const body = await request.json().catch(() => null)
  const siteId = typeof body?.siteId === 'string' ? body.siteId : null
  if (!siteId) return NextResponse.json({ error: 'siteId erforderlich' }, { status: 400 })

  const { data: site } = await supabase
    .from('sites')
    .select('id, name, config, domain, subdomain, customer_id')
    .eq('id', siteId)
    .maybeSingle()
  if (!site) return NextResponse.json({ error: 'Site nicht gefunden' }, { status: 404 })

  const entwuerfe = generiereAdsEntwuerfe(site)
  const { data: kampagnen, error } = await supabase
    .from('ads_kampagnen')
    .insert([
      { customer_id: site.customer_id, site_id: site.id, typ: 'search', status: 'ENTWURF', entwurf: entwuerfe.search },
      { customer_id: site.customer_id, site_id: site.id, typ: 'pmax', status: 'ENTWURF', entwurf: entwuerfe.pmax },
    ])
    .select('id, typ, status, entwurf')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ kampagnen }, { status: 201 })
}
