/**
 * Einzelne Domain (Phase G, §11):
 *   POST   → DNS-Recheck („wartet auf DNS" → AKTIV, sobald der Eintrag stimmt)
 *   DELETE → Domain von der Site entfernen
 */
import { getOwnedSite } from '@/lib/api-helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { pruefeDnsEintrag, dnsZiel } from '@/lib/registrar'
import { revalidateHostMap } from '@/lib/hosting/site-cache'
import { NextResponse } from 'next/server'

export async function POST(
  _request: Request,
  { params }: { params: { siteId: string; domainId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const admin = createAdminClient()
    const { data: domain } = await admin
      .from('domains')
      .select('*')
      .eq('id', params.domainId)
      .eq('site_id', params.siteId)
      .maybeSingle()
    if (!domain) return NextResponse.json({ error: 'Domain nicht gefunden' }, { status: 404 })

    if (domain.status === 'AKTIV') {
      return NextResponse.json({ domain })
    }

    const ziel = (domain.dns_ziel as string) || dnsZiel()
    if (!ziel) {
      return NextResponse.json(
        { error: 'Kein DNS-Ziel konfiguriert (DOMAIN_DNS_ZIEL / NEXT_PUBLIC_MARKETING_HOST).' },
        { status: 400 }
      )
    }

    const check = await pruefeDnsEintrag(domain.hostname as string, ziel)
    const now = new Date().toISOString()
    const update = check.ok
      ? { status: 'AKTIV', aktiv_seit: now, letzter_check_am: now, fehler: null, updated_at: now }
      : { letzter_check_am: now, updated_at: now }

    const { data: aktualisiert, error } = await admin
      .from('domains')
      .update(update)
      .eq('id', params.domainId)
      .select()
      .single()
    if (error) throw new Error(error.message)

    // Neu AKTIV → Host-Map-Cache invalidieren, damit die Domain sofort auflöst
    if (check.ok) revalidateHostMap()

    return NextResponse.json({ domain: aktualisiert, dns_ok: check.ok, gefunden: check.gefunden })
  } catch (e) {
    console.error('[domains/check] Fehler:', e)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { siteId: string; domainId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const admin = createAdminClient()
    const { error } = await admin
      .from('domains')
      .delete()
      .eq('id', params.domainId)
      .eq('site_id', params.siteId)
    if (error) throw new Error(error.message)

    // Entfernte Domain darf nicht weiter aus dem Host-Map-Cache aufgelöst werden
    revalidateHostMap()

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[domains/delete] Fehler:', e)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
