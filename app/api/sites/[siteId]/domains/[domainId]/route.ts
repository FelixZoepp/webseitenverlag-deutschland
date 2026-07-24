/**
 * Einzelne Domain (Phase G, §11):
 *   POST   → DNS-Recheck (nutzt jetzt pruefeDomainStatus für konsistente Prüfung)
 *   DELETE → Domain von der Site entfernen (inkl. Partner-Domain)
 *   PATCH  → Hauptdomain-Flag umschalten
 */
import { getOwnedSite } from '@/lib/api-helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { pruefeDomainStatus } from '@/lib/hosting/domain-check'
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

    // Neue einheitliche Prüfung über pruefeDomainStatus
    const ergebnis = await pruefeDomainStatus(admin, params.domainId)

    // Aktualisierte Domain zurückgeben
    const { data: aktualisiert, error } = await admin
      .from('domains')
      .select('*')
      .eq('id', params.domainId)
      .single()
    if (error) throw new Error(error.message)

    return NextResponse.json({
      domain: aktualisiert,
      dns_ok: ergebnis.verified,
      status: ergebnis.status,
    })
  } catch (e) {
    console.error('[domains/check] Fehler:', e)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

/** PATCH: Hauptdomain umschalten */
export async function PATCH(
  request: Request,
  { params }: { params: { siteId: string; domainId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const body = await request.json().catch(() => ({}))
    const istHauptdomain = body.ist_hauptdomain === true

    const admin = createAdminClient()

    // Prüfen ob Domain zur Site gehört
    const { data: domain } = await admin
      .from('domains')
      .select('id, partner_domain_id')
      .eq('id', params.domainId)
      .eq('site_id', params.siteId)
      .maybeSingle()
    if (!domain) return NextResponse.json({ error: 'Domain nicht gefunden' }, { status: 404 })

    const now = new Date().toISOString()

    if (istHauptdomain) {
      // Diese Domain zur Hauptdomain machen, Partner-Domain auf false setzen
      await admin.from('domains').update({ ist_hauptdomain: true, updated_at: now }).eq('id', params.domainId)
      if (domain.partner_domain_id) {
        await admin.from('domains').update({ ist_hauptdomain: false, updated_at: now }).eq('id', domain.partner_domain_id)
      }
    } else {
      await admin.from('domains').update({ ist_hauptdomain: false, updated_at: now }).eq('id', params.domainId)
    }

    const { data: aktualisiert } = await admin
      .from('domains')
      .select('*')
      .eq('id', params.domainId)
      .single()

    return NextResponse.json({ domain: aktualisiert })
  } catch (e) {
    console.error('[domains/patch] Fehler:', e)
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

    // Partner-Domain auch löschen
    const { data: domain } = await admin
      .from('domains')
      .select('id, partner_domain_id')
      .eq('id', params.domainId)
      .eq('site_id', params.siteId)
      .maybeSingle()

    if (domain?.partner_domain_id) {
      await admin.from('domains').delete().eq('id', domain.partner_domain_id)
    }

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
