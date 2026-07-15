/**
 * Custom Domains je Site (Phase G, §11).
 *   GET  → Liste der Domains (RLS: Kunde sieht eigene)
 *   POST → Domain anlegen:
 *     typ 'neuregistrierung' → Bestellung über Registrar (Mock bis Reseller-API,
 *       WARTELISTE.md) inkl. automatischem Nameserver-Setup → sofort AKTIV
 *     typ 'vorhanden'        → Status WARTET_AUF_DNS + erwartetes DNS-Ziel;
 *       Recheck über /domains/[domainId]/check
 */
import { getOwnedSite } from '@/lib/api-helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { registriereDomain, registrarProvider, dnsZiel } from '@/lib/registrar'
import { NextResponse } from 'next/server'

const HOSTNAME_REGEX = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/

export async function GET(
  _request: Request,
  { params }: { params: { siteId: string } }
) {
  const result = await getOwnedSite(params.siteId)
  if (!result.ok) return result.response

  const { supabase } = result.data
  const { data: domains } = await supabase
    .from('domains')
    .select('*')
    .eq('site_id', params.siteId)
    .order('created_at', { ascending: false })

  return NextResponse.json({ domains: domains || [], dns_ziel: dnsZiel() })
}

export async function POST(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const body = await request.json().catch(() => ({}))
    const hostname = String(body.hostname || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    const typ = body.typ === 'neuregistrierung' ? 'neuregistrierung' : 'vorhanden'

    if (!hostname || hostname.length > 255 || !HOSTNAME_REGEX.test(hostname)) {
      return NextResponse.json({ error: 'Bitte eine gültige Domain angeben (z. B. maler-schmidt.de).' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: vorhanden } = await admin
      .from('domains')
      .select('id, site_id')
      .eq('hostname', hostname)
      .maybeSingle()
    if (vorhanden) {
      return NextResponse.json(
        { error: vorhanden.site_id === params.siteId ? 'Diese Domain ist bereits verknüpft.' : 'Diese Domain ist bereits vergeben.' },
        { status: 409 }
      )
    }

    if (typ === 'neuregistrierung') {
      const bestellung = await registriereDomain(hostname)
      if (!bestellung.success) {
        const { data: domain, error } = await admin
          .from('domains')
          .insert({
            site_id: params.siteId,
            hostname,
            typ,
            status: 'FEHLER',
            registrar: registrarProvider(),
            fehler: bestellung.error || 'Bestellung fehlgeschlagen',
          })
          .select()
          .single()
        if (error) throw new Error(error.message)
        return NextResponse.json({ domain }, { status: 201 })
      }

      const { data: domain, error } = await admin
        .from('domains')
        .insert({
          site_id: params.siteId,
          hostname,
          typ,
          status: 'AKTIV', // Registrar setzt Nameserver automatisch → zeigt auf uns
          registrar: registrarProvider(),
          registrar_order_id: bestellung.orderId,
          nameserver: bestellung.nameserver,
          aktiv_seit: new Date().toISOString(),
          letzter_check_am: new Date().toISOString(),
        })
        .select()
        .single()
      if (error) throw new Error(error.message)
      return NextResponse.json({ domain }, { status: 201 })
    }

    // Vorhandene Domain: Kunde muss DNS setzen, dann Recheck
    const { data: domain, error } = await admin
      .from('domains')
      .insert({
        site_id: params.siteId,
        hostname,
        typ,
        status: 'WARTET_AUF_DNS',
        dns_ziel: dnsZiel(),
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return NextResponse.json({ domain }, { status: 201 })
  } catch (e) {
    console.error('[domains] Fehler:', e)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
