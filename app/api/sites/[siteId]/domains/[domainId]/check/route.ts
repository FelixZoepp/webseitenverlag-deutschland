/**
 * Domain-Status-Check (Change 2.4).
 * POST /api/sites/[siteId]/domains/[domainId]/check
 *
 * Prüft den aktuellen Domain-Status bei Vercel und aktualisiert die DB.
 * Wird vom Client-Polling aufgerufen (30s/15min Intervall).
 */
import { getOwnedSite } from '@/lib/api-helpers'
import { createAdminClient } from '@/lib/supabase/admin'
import { pruefeDomainStatus } from '@/lib/hosting/domain-check'
import { NextResponse } from 'next/server'

export async function POST(
  _request: Request,
  { params }: { params: { siteId: string; domainId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const admin = createAdminClient()

    // Sicherstellen, dass die Domain zur Site gehört
    const { data: domain } = await admin
      .from('domains')
      .select('id')
      .eq('id', params.domainId)
      .eq('site_id', params.siteId)
      .maybeSingle()

    if (!domain) {
      return NextResponse.json({ error: 'Domain nicht gefunden' }, { status: 404 })
    }

    const ergebnis = await pruefeDomainStatus(admin, params.domainId)

    // Aktualisierte Domain zurückgeben
    const { data: aktualisiert } = await admin
      .from('domains')
      .select('*')
      .eq('id', params.domainId)
      .single()

    return NextResponse.json({
      domain: aktualisiert,
      check: ergebnis,
    })
  } catch (e) {
    console.error('[domains/check] Fehler:', e)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
