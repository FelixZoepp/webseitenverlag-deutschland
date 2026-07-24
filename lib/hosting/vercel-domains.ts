/**
 * Custom Domains über die Vercel Domains API (MVP-Finish §1, robust).
 *
 * attachCustomDomain(siteId, hostname):
 *  1. Domain dem Vercel-Projekt hinzufügen (POST /v10/projects/{id}/domains)
 *  2. DNS-Anforderungen aus der API-Antwort lesen (nie hardcoded)
 *  3. Beide Varianten (apex + www) anlegen
 *  4. domains-Zeile upserten (Status WARTET_AUF_DNS bzw. AKTIV wenn verifiziert)
 *  5. Host-Map-Cache invalidieren
 *
 * holeDnsAnforderungen(hostname):
 *  DNS-Records aus Vercel API abrufen (GET /v6/domains/{domain}/config)
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

export interface DnsAnforderung {
  typ: 'A' | 'CNAME' | 'AAAA'
  name: string    // '@' or 'www' etc.
  wert: string    // IP or hostname
}

export interface AttachDomainErgebnis {
  ok: boolean
  /** true, wenn ohne VERCEL_TOKEN nur die DB-Zeile angelegt wurde */
  stub: boolean
  /** Domain bei Vercel bereits verifiziert (DNS zeigt richtig) */
  verified: boolean
  /** DNS-Anforderungen aus der Vercel-API */
  dnsAnforderungen: DnsAnforderung[]
  /** Erwarteter DNS-Eintrag für den Kunden (CNAME-Ziel bzw. A-Record) */
  dnsZiel: string
  fehler?: string
  /** IDs der angelegten Domains (Haupt + Partner) */
  domainIds?: string[]
}

function vercelKonfig(): { token: string; projectId: string; teamQuery: string } | null {
  const token = process.env.VERCEL_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  if (!token || !projectId) return null
  const teamId = process.env.VERCEL_TEAM_ID
  return { token, projectId, teamQuery: teamId ? `?teamId=${encodeURIComponent(teamId)}` : '' }
}

/** Ist der Hostname eine Apex-Domain (z.B. "example.de")? */
export function istApexDomain(hostname: string): boolean {
  return hostname.split('.').length === 2
}

/** Berechnet die Partner-Domain: apex → www.apex, www.apex → apex */
export function partnerHostname(hostname: string): string {
  if (hostname.startsWith('www.')) {
    return hostname.slice(4)
  }
  return `www.${hostname}`
}

/**
 * DNS-Anforderungen aus der Vercel-API abrufen.
 * Ruft GET /v6/domains/{hostname}/config auf und gibt die benötigten Records zurück.
 *
 * Falls VERCEL_TOKEN nicht gesetzt ist, werden vernünftige Fallback-Werte
 * zurückgegeben und eine Warnung geloggt.
 */
export async function holeDnsAnforderungen(hostname: string): Promise<DnsAnforderung[]> {
  const konfig = vercelKonfig()
  if (!konfig) {
    console.warn('[vercel-domains] VERCEL_TOKEN nicht gesetzt — verwende Fallback-DNS-Werte')
    return fallbackDnsAnforderungen(hostname)
  }

  try {
    const res = await fetch(
      `${VERCEL_API}/v6/domains/${encodeURIComponent(hostname)}/config${konfig.teamQuery}`,
      {
        headers: { Authorization: `Bearer ${konfig.token}` },
      }
    )
    if (!res.ok) {
      console.warn(`[vercel-domains] DNS-Config-Abruf fehlgeschlagen (${res.status}), verwende Fallback`)
      return fallbackDnsAnforderungen(hostname)
    }

    const body = await res.json() as {
      misconfigured?: boolean
      cnames?: Array<{ host: string; value: string }>
      aValues?: string[]
      conflicts?: Array<{ name: string; type: string; value: string }>
    }

    const anforderungen: DnsAnforderung[] = []

    // A-Records (für Apex-Domains)
    if (body.aValues && body.aValues.length > 0) {
      for (const ip of body.aValues) {
        anforderungen.push({ typ: 'A', name: '@', wert: ip })
      }
    }

    // CNAME-Records (für Subdomains)
    if (body.cnames && body.cnames.length > 0) {
      for (const cname of body.cnames) {
        anforderungen.push({ typ: 'CNAME', name: cname.host || hostname, wert: cname.value })
      }
    }

    // Wenn keine Werte von der API kamen, Fallback
    if (anforderungen.length === 0) {
      return fallbackDnsAnforderungen(hostname)
    }

    return anforderungen
  } catch (e) {
    console.warn('[vercel-domains] DNS-Config-Abruf Fehler:', e instanceof Error ? e.message : e)
    return fallbackDnsAnforderungen(hostname)
  }
}

/**
 * Fallback-DNS-Anforderungen wenn die API nicht erreichbar ist.
 * Loggt eine Warnung — diese Werte sollten nicht im Produktivbetrieb verwendet werden.
 */
function fallbackDnsAnforderungen(hostname: string): DnsAnforderung[] {
  console.warn('[vercel-domains] Fallback-DNS-Werte werden verwendet — bitte VERCEL_TOKEN setzen')
  if (istApexDomain(hostname)) {
    return [{ typ: 'A', name: '@', wert: '76.76.21.21' }]
  }
  return [{ typ: 'CNAME', name: hostname.split('.')[0], wert: 'cname.vercel-dns.com' }]
}

/**
 * DNS-Anforderungen für einen Hostnamen ermitteln: zuerst aus der DB lesen,
 * falls nicht vorhanden aus der Vercel-API abrufen.
 */
export async function dnsZielFuer(
  hostname: string,
  supabase?: SupabaseClient
): Promise<string> {
  // Aus DB lesen, falls vorhanden
  if (supabase) {
    const { data } = await supabase
      .from('domains')
      .select('dns_anforderungen, dns_ziel')
      .eq('hostname', hostname)
      .maybeSingle()

    if (data?.dns_anforderungen) {
      const anf = data.dns_anforderungen as DnsAnforderung[]
      if (anf.length > 0) return anf[0].wert
    }
    if (data?.dns_ziel) return data.dns_ziel
  }

  // Aus Vercel-API abrufen
  const anforderungen = await holeDnsAnforderungen(hostname)
  if (anforderungen.length > 0) return anforderungen[0].wert

  // Letzter Fallback (sollte nie eintreten)
  return istApexDomain(hostname) ? '76.76.21.21' : 'cname.vercel-dns.com'
}

/** Eine einzelne Domain beim Vercel-Projekt anmelden */
async function domainBeiVercelAnmelden(
  konfig: { token: string; projectId: string; teamQuery: string },
  hostname: string
): Promise<{
  ok: boolean
  verified: boolean
  dnsAnforderungen: DnsAnforderung[]
  fehler?: string
}> {
  try {
    const res = await fetch(
      `${VERCEL_API}/v10/projects/${konfig.projectId}/domains${konfig.teamQuery}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${konfig.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: hostname }),
      }
    )
    const body = await res.json() as {
      verified?: boolean
      verification?: Array<{ type: string; domain: string; value: string }>
      error?: { code?: string; message?: string }
    }

    if (!res.ok && body.error?.code !== 'domain_already_in_use_by_project') {
      return {
        ok: false,
        verified: false,
        dnsAnforderungen: [],
        fehler: body.error?.message || `Vercel-API-Fehler (${res.status})`,
      }
    }

    const verified = body.verified === true || body.error?.code === 'domain_already_in_use_by_project'

    // DNS-Anforderungen aus Vercel-Antwort lesen oder per Config-Endpoint holen
    let dnsAnforderungen: DnsAnforderung[] = []

    if (body.verification && body.verification.length > 0) {
      dnsAnforderungen = body.verification.map((v) => ({
        typ: v.type.toUpperCase() as DnsAnforderung['typ'],
        name: v.domain === hostname ? (istApexDomain(hostname) ? '@' : hostname.split('.')[0]) : v.domain,
        wert: v.value,
      }))
    }

    // Immer den Config-Endpoint aufrufen für vollständige DNS-Records
    const configAnforderungen = await holeDnsAnforderungen(hostname)
    if (configAnforderungen.length > 0) {
      dnsAnforderungen = configAnforderungen
    }

    return { ok: true, verified, dnsAnforderungen }
  } catch (e) {
    return {
      ok: false,
      verified: false,
      dnsAnforderungen: [],
      fehler: e instanceof Error ? e.message : 'Vercel-API nicht erreichbar',
    }
  }
}

/** Einzelne Domain in der DB upserten */
async function domainInDbUpserten(
  supabase: SupabaseClient,
  siteId: string,
  hostname: string,
  opts: {
    verified: boolean
    dnsAnforderungen: DnsAnforderung[]
    fehler?: string
    istHauptdomain: boolean
    partnerDomainId?: string
  }
): Promise<{ id?: string; error?: string }> {
  const now = new Date().toISOString()
  const dnsTyp = istApexDomain(hostname) ? 'A' : 'CNAME'
  const dnsZiel = opts.dnsAnforderungen.length > 0
    ? opts.dnsAnforderungen[0].wert
    : (dnsTyp === 'A' ? '76.76.21.21' : 'cname.vercel-dns.com')

  const { data, error } = await supabase.from('domains').upsert(
    {
      site_id: siteId,
      hostname,
      typ: 'vorhanden',
      status: opts.verified ? 'AKTIV' : 'WARTET_AUF_DNS',
      dns_ziel: dnsZiel,
      dns_typ: dnsTyp,
      dns_anforderungen: opts.dnsAnforderungen,
      ist_hauptdomain: opts.istHauptdomain,
      partner_domain_id: opts.partnerDomainId ?? null,
      fehler: opts.fehler ?? null,
      letzter_check_am: now,
      ...(opts.verified ? { aktiv_seit: now } : {}),
      updated_at: now,
    },
    { onConflict: 'hostname' }
  ).select('id').single()

  if (error) return { error: error.message }
  return { id: data?.id }
}

export async function attachCustomDomain(
  supabase: SupabaseClient,
  siteId: string,
  hostname: string
): Promise<AttachDomainErgebnis> {
  const host = hostname.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0]
  if (!/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/.test(host)) {
    return { ok: false, stub: false, verified: false, dnsAnforderungen: [], dnsZiel: '', fehler: 'Ungültiger Hostname' }
  }

  const partner = partnerHostname(host)
  const konfig = vercelKonfig()
  const domainIds: string[] = []

  // --- Hauptdomain ---
  let hauptVerified = false
  let hauptDnsAnf: DnsAnforderung[] = []
  let hauptFehler: string | undefined

  if (konfig) {
    const erg = await domainBeiVercelAnmelden(konfig, host)
    hauptVerified = erg.verified
    hauptDnsAnf = erg.dnsAnforderungen
    hauptFehler = erg.fehler
  } else {
    hauptFehler = 'VERCEL_TOKEN/VERCEL_PROJECT_ID fehlt (WARTELISTE)'
    hauptDnsAnf = fallbackDnsAnforderungen(host)
  }

  const hauptResult = await domainInDbUpserten(supabase, siteId, host, {
    verified: hauptVerified,
    dnsAnforderungen: hauptDnsAnf,
    fehler: hauptFehler,
    istHauptdomain: true,
  })
  if (hauptResult.error) {
    return { ok: false, stub: !konfig, verified: false, dnsAnforderungen: hauptDnsAnf, dnsZiel: '', fehler: hauptResult.error }
  }
  if (hauptResult.id) domainIds.push(hauptResult.id)

  // --- Partner-Domain (www ↔ apex) ---
  let partnerVerified = false
  let partnerDnsAnf: DnsAnforderung[] = []
  let partnerFehler: string | undefined

  if (konfig) {
    const erg = await domainBeiVercelAnmelden(konfig, partner)
    partnerVerified = erg.verified
    partnerDnsAnf = erg.dnsAnforderungen
    partnerFehler = erg.fehler
  } else {
    partnerFehler = 'VERCEL_TOKEN/VERCEL_PROJECT_ID fehlt (WARTELISTE)'
    partnerDnsAnf = fallbackDnsAnforderungen(partner)
  }

  const partnerResult = await domainInDbUpserten(supabase, siteId, partner, {
    verified: partnerVerified,
    dnsAnforderungen: partnerDnsAnf,
    fehler: partnerFehler,
    istHauptdomain: false,
    partnerDomainId: hauptResult.id,
  })
  if (partnerResult.id) {
    domainIds.push(partnerResult.id)
    // Partner-ID bei der Hauptdomain hinterlegen
    await supabase
      .from('domains')
      .update({ partner_domain_id: partnerResult.id, updated_at: new Date().toISOString() })
      .eq('id', hauptResult.id!)
  }

  if (hauptVerified || partnerVerified) revalidateHostMap()

  const dnsZiel = hauptDnsAnf.length > 0 ? hauptDnsAnf[0].wert : ''

  return {
    ok: !konfig || !hauptFehler,
    stub: !konfig,
    verified: hauptVerified,
    dnsAnforderungen: hauptDnsAnf,
    dnsZiel,
    fehler: hauptFehler,
    domainIds,
  }
}
