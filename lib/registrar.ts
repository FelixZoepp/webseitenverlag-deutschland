/**
 * Domain-Registrierung + DNS-Checks (Phase G, §11).
 *
 * Neuregistrierung im Kundennamen läuft über eine Reseller-API — solange kein
 * Zugang existiert (WARTELISTE.md), simuliert der Mock-Registrar die Bestellung
 * inkl. automatischem Nameserver-Setup. Umschalten per Env:
 *   REGISTRAR_PROVIDER  'mock' (Default) | später echter Reseller
 *   DOMAIN_DNS_ZIEL     erwarteter CNAME/A-Wert für vorhandene Domains
 *                       (Fallback: NEXT_PUBLIC_MARKETING_HOST)
 */

export interface RegistrarErgebnis {
  success: boolean
  orderId?: string
  nameserver?: string[]
  error?: string
}

const MOCK_NAMESERVER = ['ns1.webseitenverlag-dns.de', 'ns2.webseitenverlag-dns.de']

export function registrarProvider(): string {
  return process.env.REGISTRAR_PROVIDER || 'mock'
}

/** Domain im Kundennamen bestellen — Mock bis Reseller-API-Zugang da ist. */
export async function registriereDomain(hostname: string): Promise<RegistrarErgebnis> {
  const provider = registrarProvider()

  if (provider === 'mock') {
    // Simulierte Bestellung: sofort erfolgreich, Nameserver "automatisch" gesetzt
    return {
      success: true,
      orderId: `mock-${Date.now().toString(36)}-${hostname.replace(/[^a-z0-9]/g, '').slice(0, 8)}`,
      nameserver: MOCK_NAMESERVER,
    }
  }

  // Echter Reseller: noch kein API-Zugang (siehe WARTELISTE.md)
  return { success: false, error: `Registrar-Provider "${provider}" ist nicht implementiert` }
}

/** Erwartetes DNS-Ziel für vorhandene Domains (CNAME auf unsere Infrastruktur). */
export function dnsZiel(): string | null {
  const ziel = process.env.DOMAIN_DNS_ZIEL || process.env.NEXT_PUBLIC_MARKETING_HOST || ''
  return ziel ? ziel.split(':')[0].toLowerCase() : null
}

/**
 * DNS-Check über DNS-over-HTTPS (Google) — serverless-tauglich, kein Socket.
 * Prüft CNAME und A-Records gegen das erwartete Ziel.
 */
export async function pruefeDnsEintrag(
  hostname: string,
  ziel: string
)
: Promise<{ ok: boolean; gefunden: string[] }> {
  const gefunden: string[] = []
  for (const type of ['CNAME', 'A']) {
    try {
      const res = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=${type}`,
        { cache: 'no-store' }
      )
      if (!res.ok) continue
      const data = (await res.json()) as { Answer?: { data?: string }[] }
      for (const eintrag of data.Answer || []) {
        if (typeof eintrag.data === 'string') {
          gefunden.push(eintrag.data.replace(/\.$/, '').toLowerCase())
        }
      }
    } catch {
      // DNS-Resolver nicht erreichbar → nächster Typ / Ergebnis bleibt leer
    }
  }
  const zielNorm = ziel.replace(/\.$/, '').toLowerCase()
  return { ok: gefunden.includes(zielNorm), gefunden }
}
