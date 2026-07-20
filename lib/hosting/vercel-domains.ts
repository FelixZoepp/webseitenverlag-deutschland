/**
 * Custom Domains über die Vercel Domains API (MVP-Finish §1, MVP-light).
 *
 * attachCustomDomain(siteId, hostname):
 *  1. Domain dem Vercel-Projekt hinzufügen (POST /v10/projects/{id}/domains)
 *  2. domains-Zeile upserten (Status WARTET_AUF_DNS bzw. AKTIV wenn verifiziert)
 *  3. Host-Map-Cache invalidieren
 *
 * Konfiguration über Env — kein Hardcode (Abschnitt 0):
 *   VERCEL_TOKEN       API-Token (WARTELISTE, solange nicht gesetzt → Stub)
 *   VERCEL_PROJECT_ID  Projekt-ID des Deployments
 *   VERCEL_TEAM_ID     optional (Team-Scope)
 *
 * Ohne Token arbeitet die Funktion als Stub: domains-Zeile wird trotzdem
 * angelegt (Status WARTET_AUF_DNS, fehler='VERCEL_TOKEN fehlt'), damit der
 * Admin-Flow durchläuft und die DNS-Anleitung an den Kunden gehen kann.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { revalidateHostMap } from '@/lib/hosting/site-cache'

const VERCEL_API = 'https://api.vercel.com'

export interface AttachDomainErgebnis {
  ok: boolean
  /** true, wenn ohne VERCEL_TOKEN nur die DB-Zeile angelegt wurde */
  stub: boolean
  /** Domain bei Vercel bereits verifiziert (DNS zeigt richtig) */
  verified: boolean
  /** Erwarteter DNS-Eintrag für den Kunden (CNAME-Ziel bzw. A-Record) */
  dnsZiel: string
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
 * Erwarteter DNS-Wert (Maschinenwert, kein Fließtext): Apex → A-Record-IP,
 * Subdomain → CNAME-Ziel. Der Recheck (/domains/[domainId]/check) vergleicht
 * diesen Wert direkt mit den aufgelösten A/CNAME-Einträgen.
 */
export function dnsZielFuer(hostname: string): string {
  const istApex = hostname.split('.').length === 2
  return istApex ? '76.76.21.21' : 'cname.vercel-dns.com'
}

export async function attachCustomDomain(
  supabase: SupabaseClient,
  siteId: string,
  hostname: string
): Promise<AttachDomainErgebnis> {
  const host = hostname.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0]
  if (!/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/.test(host)) {
    return { ok: false, stub: false, verified: false, dnsZiel: '', fehler: 'Ungültiger Hostname' }
  }
  const dnsZiel = dnsZielFuer(host)

  const konfig = vercelKonfig()
  let verified = false
  let fehler: string | undefined

  if (konfig) {
    try {
      const res = await fetch(
        `${VERCEL_API}/v10/projects/${konfig.projectId}/domains${konfig.teamQuery}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${konfig.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: host }),
        }
      )
      const body = (await res.json()) as { verified?: boolean; error?: { code?: string; message?: string } }
      if (res.ok) {
        verified = body.verified === true
      } else if (body.error?.code === 'domain_already_in_use_by_project') {
        // Bereits am Projekt — Status weiter unten über DNS-Check konvergieren lassen
        verified = true
      } else {
        fehler = body.error?.message || `Vercel-API-Fehler (${res.status})`
      }
    } catch (e) {
      fehler = e instanceof Error ? e.message : 'Vercel-API nicht erreichbar'
    }
  } else {
    fehler = 'VERCEL_TOKEN/VERCEL_PROJECT_ID fehlt (WARTELISTE)'
  }

  // domains-Zeile upserten — die Auslieferung greift erst bei Status AKTIV
  const now = new Date().toISOString()
  const { error: dbError } = await supabase.from('domains').upsert(
    {
      site_id: siteId,
      hostname: host,
      typ: 'vorhanden',
      status: verified ? 'AKTIV' : 'WARTET_AUF_DNS',
      dns_ziel: dnsZiel,
      fehler: fehler ?? null,
      letzter_check_am: now,
      ...(verified ? { aktiv_seit: now } : {}),
      updated_at: now,
    },
    { onConflict: 'hostname' }
  )
  if (dbError) {
    return { ok: false, stub: !konfig, verified, dnsZiel, fehler: dbError.message }
  }

  if (verified) revalidateHostMap()

  // Stub-Modus gilt als ok (DB-Zeile angelegt, Anleitung kann raus) —
  // mit Konfiguration ist ein API-Fehler ein echter Fehler.
  return { ok: !konfig || !fehler, stub: !konfig, verified, dnsZiel, fehler }
}
