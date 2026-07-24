/**
 * Automatische Domain-Status-Prüfung (Change 2.4).
 *
 * pruefeDomainStatus():
 *  1. Domain aus DB laden
 *  2. Vercel API aufrufen (GET /v10/projects/{projectId}/domains/{hostname})
 *  3. Status aktualisieren: AKTIV, DNS_ERKANNT, FEHLER
 *  4. letzter_check_am setzen
 *
 * TODO: Cron-Job für 48h-Timeout und E-Mail-Benachrichtigung implementieren.
 *       Domains die nach 48h immer noch WARTET_AUF_DNS sind, sollten per
 *       E-Mail an den Kunden erinnert werden. Nach 7 Tagen zweite Erinnerung.
 *       Implementierung: Vercel Cron (vercel.json) oder Supabase pg_cron.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { revalidateHostMap } from '@/lib/hosting/site-cache'

const VERCEL_API = 'https://api.vercel.com'

export interface DomainStatusErgebnis {
  status: 'WARTET_AUF_DNS' | 'DNS_ERKANNT' | 'AKTIV' | 'FEHLER'
  verified: boolean
  fehler?: string
}

function vercelKonfig(): { token: string; projectId: string; teamQuery: string } | null {
  const token = process.env.VERCEL_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  if (!token || !projectId) return null
  const teamId = process.env.VERCEL_TEAM_ID
  return { token, projectId, teamQuery: teamId ? `?teamId=${encodeURIComponent(teamId)}` : '' }
}

/**
 * Domain-Status bei Vercel prüfen und in der DB aktualisieren.
 *
 * Statusübergänge:
 *   WARTET_AUF_DNS → DNS_ERKANNT  (DNS zeigt richtig, Zertifikat noch nicht fertig)
 *   WARTET_AUF_DNS → AKTIV        (DNS + Zertifikat OK)
 *   DNS_ERKANNT    → AKTIV        (Zertifikat jetzt bereit)
 *   *              → FEHLER       (Fehlkonfiguration erkannt)
 */
export async function pruefeDomainStatus(
  supabase: SupabaseClient,
  domainId: string
): Promise<DomainStatusErgebnis> {
  // 1. Domain aus DB laden
  const { data: domain, error: dbError } = await supabase
    .from('domains')
    .select('*')
    .eq('id', domainId)
    .single()

  if (dbError || !domain) {
    return { status: 'FEHLER', verified: false, fehler: 'Domain nicht gefunden' }
  }

  // Bereits aktiv → nichts tun
  if (domain.status === 'AKTIV') {
    return { status: 'AKTIV', verified: true }
  }

  const konfig = vercelKonfig()
  const now = new Date().toISOString()

  if (!konfig) {
    // Stub-Modus: DNS über Google DNS-over-HTTPS prüfen (Fallback)
    const { pruefeDnsEintrag } = await import('@/lib/registrar')
    const ziel = (domain.dns_ziel as string) || ''
    if (!ziel) {
      await supabase.from('domains').update({ letzter_check_am: now, updated_at: now }).eq('id', domainId)
      return { status: 'WARTET_AUF_DNS', verified: false, fehler: 'Kein DNS-Ziel konfiguriert' }
    }
    const check = await pruefeDnsEintrag(domain.hostname as string, ziel)
    if (check.ok) {
      await supabase.from('domains').update({
        status: 'AKTIV', aktiv_seit: now, letzter_check_am: now, fehler: null, updated_at: now,
      }).eq('id', domainId)
      revalidateHostMap()
      return { status: 'AKTIV', verified: true }
    }
    await supabase.from('domains').update({ letzter_check_am: now, updated_at: now }).eq('id', domainId)
    return { status: 'WARTET_AUF_DNS', verified: false }
  }

  // 2. Vercel API aufrufen
  try {
    const res = await fetch(
      `${VERCEL_API}/v10/projects/${konfig.projectId}/domains/${encodeURIComponent(domain.hostname as string)}${konfig.teamQuery}`,
      { headers: { Authorization: `Bearer ${konfig.token}` } }
    )

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({})) as { error?: { message?: string } }
      const fehlerMsg = errorBody.error?.message || `Vercel-API-Fehler (${res.status})`
      await supabase.from('domains').update({
        status: 'FEHLER', fehler: fehlerMsg, letzter_check_am: now, updated_at: now,
      }).eq('id', domainId)
      return { status: 'FEHLER', verified: false, fehler: fehlerMsg }
    }

    const body = await res.json() as {
      verified?: boolean
      verification?: Array<{ type: string; domain: string; value: string }>
      misconfigured?: boolean
    }

    // 3. Status bestimmen
    if (body.verified === true) {
      // Vollständig verifiziert + Zertifikat bereit
      await supabase.from('domains').update({
        status: 'AKTIV', aktiv_seit: now, letzter_check_am: now, fehler: null, updated_at: now,
      }).eq('id', domainId)
      revalidateHostMap()
      return { status: 'AKTIV', verified: true }
    }

    if (body.misconfigured === true) {
      // 4. Fehlkonfiguration → spezifische Fehlermeldung
      const fehlerMsg = 'DNS-Konfiguration fehlerhaft — bitte DNS-Einträge prüfen und korrigieren.'
      await supabase.from('domains').update({
        status: 'FEHLER', fehler: fehlerMsg, letzter_check_am: now, updated_at: now,
      }).eq('id', domainId)
      return { status: 'FEHLER', verified: false, fehler: fehlerMsg }
    }

    // DNS zeigt vielleicht schon richtig, aber Zertifikat noch nicht bereit
    // Prüfen über DNS-over-HTTPS ob DNS bereits konfiguriert ist
    const { pruefeDnsEintrag } = await import('@/lib/registrar')
    const ziel = (domain.dns_ziel as string) || ''
    if (ziel) {
      const check = await pruefeDnsEintrag(domain.hostname as string, ziel)
      if (check.ok) {
        await supabase.from('domains').update({
          status: 'DNS_ERKANNT', letzter_check_am: now, fehler: null, updated_at: now,
        }).eq('id', domainId)
        return { status: 'DNS_ERKANNT', verified: false }
      }
    }

    // 5. Noch keine DNS-Änderung erkannt
    await supabase.from('domains').update({ letzter_check_am: now, updated_at: now }).eq('id', domainId)
    return { status: 'WARTET_AUF_DNS', verified: false }
  } catch (e) {
    const fehlerMsg = e instanceof Error ? e.message : 'Vercel-API nicht erreichbar'
    await supabase.from('domains').update({
      letzter_check_am: now, fehler: fehlerMsg, updated_at: now,
    }).eq('id', domainId)
    return { status: 'WARTET_AUF_DNS', verified: false, fehler: fehlerMsg }
  }
}
