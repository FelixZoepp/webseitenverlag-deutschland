/**
 * Custom Domains je Site (Phase G, §11, robust).
 *   GET  → Liste der Domains (RLS: Kunde sieht eigene)
 *   POST → Domain anlegen: attachCustomDomain (Vercel Domains API, robust):
 *     Domain + www-Partner am Vercel-Projekt anmelden + Zeilen upserten;
 *     ohne VERCEL_TOKEN als Stub (WARTELISTE). Recheck über /domains/[domainId]/check
 */
import { getOwnedSite } from '@/lib/api-helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { attachCustomDomain } from '@/lib/hosting/vercel-domains'
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
    .order('ist_hauptdomain', { ascending: false })
    .order('created_at', { ascending: false })

  return NextResponse.json({ domains: domains || [] })
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

    if (!hostname || hostname.length > 255 || !HOSTNAME_REGEX.test(hostname)) {
      return NextResponse.json({ error: 'Bitte eine gültige Domain angeben (z. B. maler-schmidt.de).' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Prüfen ob Haupt- oder Partner-Hostname bereits vergeben
    const { partnerHostname } = await import('@/lib/hosting/vercel-domains')
    const partner = partnerHostname(hostname)

    const { data: vorhanden } = await admin
      .from('domains')
      .select('id, site_id, hostname')
      .in('hostname', [hostname, partner])
      .limit(1)
      .maybeSingle()

    if (vorhanden) {
      return NextResponse.json(
        { error: vorhanden.site_id === params.siteId ? 'Diese Domain ist bereits verknüpft.' : 'Diese Domain ist bereits vergeben.' },
        { status: 409 }
      )
    }

    // Domain + Partner bei Vercel anmelden + Zeilen upserten (Change 2.3)
    const ergebnis = await attachCustomDomain(admin, params.siteId, hostname)
    if (!ergebnis.ok) {
      return NextResponse.json(
        { error: ergebnis.fehler || 'Domain konnte nicht verknüpft werden.' },
        { status: 502 }
      )
    }

    // Alle angelegten Domains zurückgeben
    const { data: domains, error } = await admin
      .from('domains')
      .select('*')
      .eq('site_id', params.siteId)
      .in('hostname', [hostname, partner])
      .order('ist_hauptdomain', { ascending: false })
    if (error) throw new Error(error.message)

    return NextResponse.json({ domains }, { status: 201 })
  } catch (e) {
    console.error('[domains] Fehler:', e)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
