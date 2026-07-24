/**
 * Domain DNS-Checks (Phase G, §11).
 *
 *   DOMAIN_DNS_ZIEL     erwarteter CNAME/A-Wert für vorhandene Domains
 *                       (Fallback: NEXT_PUBLIC_MARKETING_HOST)
 */

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
): Promise<{ ok: boolean; gefunden: string[] }> {
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
