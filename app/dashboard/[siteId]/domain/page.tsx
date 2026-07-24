'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Globe, Loader2, RefreshCw, Trash2, CheckCircle2, Clock, AlertTriangle, Copy, Check, ChevronDown, ChevronRight, Shield } from 'lucide-react'

interface DnsAnforderung {
  typ: 'A' | 'CNAME' | 'AAAA'
  name: string
  wert: string
}

interface Domain {
  id: string
  hostname: string
  typ: 'vorhanden'
  status: 'BESTELLT' | 'WARTET_AUF_DNS' | 'DNS_ERKANNT' | 'AKTIV' | 'FEHLER'
  nameserver: string[] | null
  dns_ziel: string | null
  dns_typ: 'A' | 'CNAME' | 'AAAA' | null
  dns_anforderungen: DnsAnforderung[] | null
  ist_hauptdomain: boolean
  partner_domain_id: string | null
  fehler: string | null
  letzter_check_am: string | null
  aktiv_seit: string | null
}

const STATUS_LABEL: Record<Domain['status'], { text: string; bg: string; fg: string }> = {
  AKTIV: { text: 'Aktiv', bg: '#F0FDF4', fg: '#16A34A' },
  DNS_ERKANNT: { text: 'DNS erkannt', bg: '#EFF6FF', fg: '#1D4ED8' },
  WARTET_AUF_DNS: { text: 'Wartet auf DNS', bg: '#FFFBEB', fg: '#B45309' },
  BESTELLT: { text: 'Bestellt', bg: '#EFF6FF', fg: '#1D4ED8' },
  FEHLER: { text: 'Fehler', bg: '#FEF2F2', fg: '#DC2626' },
}

const STATUS_BESCHREIBUNG: Partial<Record<Domain['status'], string>> = {
  WARTET_AUF_DNS: 'Warte auf DNS-Einrichtung...',
  DNS_ERKANNT: 'DNS erkannt, Zertifikat wird ausgestellt...',
  AKTIV: 'Domain ist aktiv',
  FEHLER: '', // Wird durch domain.fehler ersetzt
}

function KopierButton({ text }: { text: string }) {
  const [kopiert, setKopiert] = useState(false)
  const kopieren = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setKopiert(true)
      setTimeout(() => setKopiert(false), 2000)
    } catch { /* Fallback: wird ignoriert */ }
  }
  return (
    <button
      onClick={kopieren}
      title="In Zwischenablage kopieren"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px', borderRadius: '4px', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: '11px', color: kopiert ? '#16A34A' : '#6B7280', verticalAlign: 'middle', marginLeft: '6px' }}
    >
      {kopiert ? <Check style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
      {kopiert ? 'Kopiert' : 'Kopieren'}
    </button>
  )
}

const REGISTRAR_ANLEITUNGEN: Array<{ name: string; inhalt: string }> = [
  {
    name: 'IONOS (1&1)',
    inhalt: 'Einloggen → Domain & SSL → DNS-Einstellungen. Den passenden Eintrag (A oder CNAME) hinzufuegen oder bearbeiten. NICHT den "Domain verbinden"-Assistenten nutzen — dieser ueberschreibt alle Eintraege.',
  },
  {
    name: 'Strato',
    inhalt: 'Einloggen → Domains → Domainverwaltung → DNS-Verwaltung. Dort den Eintrag aendern. Den Website-Baukasten-Assistenten NICHT verwenden.',
  },
  {
    name: 'united-domains',
    inhalt: 'Einloggen → Portfolio → Domain anklicken → DNS. Den entsprechenden Record bearbeiten. Keine "Weiterleitung" verwenden.',
  },
  {
    name: 'GoDaddy',
    inhalt: 'Einloggen → My Products → Domain → DNS → Manage DNS. Den Record bearbeiten. Den "Connect to a website"-Button NICHT verwenden.',
  },
  {
    name: 'Namecheap',
    inhalt: 'Einloggen → Domain List → Manage → Advanced DNS. Record hinzufuegen oder bearbeiten. "Redirect Domain" NICHT verwenden.',
  },
  {
    name: 'Cloudflare',
    inhalt: 'Einloggen → Website waehlen → DNS → Records. Eintrag hinzufuegen/bearbeiten. Proxy-Status (orangene Wolke) auf "DNS only" (graue Wolke) stellen.',
  },
]

function RegistrarAnleitungen() {
  const [offen, setOffen] = useState<string | null>(null)
  return (
    <div style={{ marginTop: '16px' }}>
      <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
        DNS-Einstellungen bei Ihrem Anbieter
      </p>
      {REGISTRAR_ANLEITUNGEN.map((r) => (
        <div key={r.name} style={{ borderBottom: '1px solid #F3F4F6' }}>
          <button
            onClick={() => setOffen(offen === r.name ? null : r.name)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#374151', textAlign: 'left' }}
          >
            {offen === r.name
              ? <ChevronDown style={{ width: '14px', height: '14px', color: '#9CA3AF' }} />
              : <ChevronRight style={{ width: '14px', height: '14px', color: '#9CA3AF' }} />}
            {r.name}
          </button>
          {offen === r.name && (
            <p style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.6, padding: '0 0 10px 20px' }}>
              {r.inhalt}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

/** Polling-Intervall berechnen: erste 15min → 30s, danach → 15min */
function pollingIntervall(startZeit: number): number {
  const vergangen = Date.now() - startZeit
  const FUENFZEHN_MINUTEN = 15 * 60 * 1000
  return vergangen < FUENFZEHN_MINUTEN ? 30_000 : 15 * 60_000
}

export default function DomainPage() {
  const params = useParams()
  const siteId = params.siteId as string
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [hostname, setHostname] = useState('')
  const [busy, setBusy] = useState(false)
  const [checking, setChecking] = useState<string | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const pollingStartRef = useRef<number | null>(null)
  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const laden = useCallback(async () => {
    try {
      const r = await fetch(`/api/sites/${siteId}/domains`)
      if (r.ok) {
        const data = await r.json()
        setDomains(data.domains || [])
      }
    } finally {
      setLoading(false)
    }
  }, [siteId])

  useEffect(() => { laden() }, [laden])

  // Automatisches Polling starten, wenn Domains auf DNS warten
  const hatWartendeDomains = domains.some(
    (d) => d.status === 'WARTET_AUF_DNS' || d.status === 'DNS_ERKANNT'
  )

  useEffect(() => {
    if (!hatWartendeDomains) {
      pollingStartRef.current = null
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current)
        pollingTimerRef.current = null
      }
      return
    }

    if (!pollingStartRef.current) {
      pollingStartRef.current = Date.now()
    }

    const startPolling = () => {
      const intervall = pollingIntervall(pollingStartRef.current!)
      pollingTimerRef.current = setTimeout(async () => {
        // Alle wartenden Domains parallel prüfen
        const wartende = domains.filter(
          (d) => d.status === 'WARTET_AUF_DNS' || d.status === 'DNS_ERKANNT'
        )
        await Promise.all(
          wartende.map((d) =>
            fetch(`/api/sites/${siteId}/domains/${d.id}/check`, { method: 'POST' }).catch(() => {})
          )
        )
        await laden()
        // Nach dem Laden wird dieser Effect erneut getriggert
      }, intervall)
    }

    startPolling()

    return () => {
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current)
        pollingTimerRef.current = null
      }
    }
  }, [hatWartendeDomains, domains, siteId, laden])

  const anlegen = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setFehler(null)
    try {
      const r = await fetch(`/api/sites/${siteId}/domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostname, typ: 'vorhanden' }),
      })
      const data = await r.json()
      if (!r.ok) {
        setFehler(data.error || 'Domain konnte nicht angelegt werden.')
      } else {
        setHostname('')
        pollingStartRef.current = Date.now()
        await laden()
      }
    } catch {
      setFehler('Netzwerkfehler — bitte erneut versuchen.')
    } finally {
      setBusy(false)
    }
  }

  const recheck = async (domainId: string) => {
    setChecking(domainId)
    try {
      await fetch(`/api/sites/${siteId}/domains/${domainId}/check`, { method: 'POST' })
      await laden()
    } finally {
      setChecking(null)
    }
  }

  const entfernen = async (domainId: string) => {
    if (!confirm('Domain wirklich von dieser Website entfernen? Die Partner-Domain (www/apex) wird ebenfalls entfernt.')) return
    await fetch(`/api/sites/${siteId}/domains/${domainId}`, { method: 'DELETE' })
    await laden()
  }

  const hauptdomainUmschalten = async (domainId: string, _partnerDomainId: string | null) => {
    await fetch(`/api/sites/${siteId}/domains/${domainId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ist_hauptdomain: true }),
    })
    await laden()
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#9CA3AF' }} /></div>
  }

  // Domains gruppieren: Hauptdomains mit Partnern
  const hauptdomains = domains.filter((d) => d.ist_hauptdomain)
  const partnerdomains = domains.filter((d) => !d.ist_hauptdomain)

  return (
    <div style={{ padding: '24px 32px', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>Domain</h1>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
        Eigene Domain mit Ihrer Website verbinden
      </p>

      {/* MX-Warnung (2.5) */}
      <div style={{
        padding: '16px 20px', borderRadius: 12, marginBottom: 24,
        background: 'rgba(234,179,106,0.12)', border: '1px solid rgba(234,179,106,0.3)',
        fontSize: 14, lineHeight: 1.65,
      }}>
        <strong style={{ color: '#B8860B' }}>
          <Shield style={{ width: '15px', height: '15px', display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
          Wichtig: Aendern Sie ausschliesslich den unten genannten Eintrag.
        </strong>
        <br />
        Loeschen oder veraendern Sie keine bestehenden MX-, SPF-, DKIM- oder DMARC-Eintraege — davon haengt Ihre E-Mail ab.
        Wenn Ihr Anbieter einen Assistenten zum &quot;Verbinden einer externen Website&quot; anbietet, nutzen Sie ihn nicht:
        Er ueberschreibt in einigen Faellen alle vorhandenen Eintraege und Ihre Firmen-E-Mail funktioniert danach nicht mehr.
      </div>

      {/* Neue Domain */}
      <form onSubmit={anlegen} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            placeholder="z. B. maler-schmidt.de"
            required
            style={{ flex: '1 1 240px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }}
          />
          <button
            type="submit"
            disabled={busy}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#111827', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: busy ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            Hinzufuegen
          </button>
        </div>
        <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '10px' }}>
          Beide Varianten (mit und ohne www) werden automatisch eingerichtet.
        </p>
        <div style={{ marginTop: 12, padding: '14px 18px', borderRadius: 12, background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.12)', fontSize: 14, lineHeight: 1.6, color: 'var(--ink-soft)' }}>
          <strong>Noch keine Domain?</strong> Registrieren Sie eine bei einem Anbieter Ihrer Wahl, z.{'\u00a0'}B.{' '}
          <a href="https://www.ionos.de" target="_blank" rel="noopener" style={{ color: 'var(--blue)' }}>IONOS</a>,{' '}
          <a href="https://www.strato.de" target="_blank" rel="noopener" style={{ color: 'var(--blue)' }}>Strato</a>,{' '}
          <a href="https://www.united-domains.de" target="_blank" rel="noopener" style={{ color: 'var(--blue)' }}>united-domains</a> oder{' '}
          <a href="https://www.namecheap.com" target="_blank" rel="noopener" style={{ color: 'var(--blue)' }}>Namecheap</a>.
          {' '}Danach verbinden Sie sie hier.
        </div>
        {fehler && (
          <p style={{ fontSize: '13px', color: '#DC2626', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle style={{ width: '14px', height: '14px' }} /> {fehler}
          </p>
        )}
      </form>

      {/* Registrar-Kurzanleitungen */}
      {domains.length > 0 && domains.some((d) => d.status !== 'AKTIV') && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '16px 20px', marginBottom: '24px' }}>
          <RegistrarAnleitungen />
        </div>
      )}

      {/* Domain-Liste */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {domains.length === 0 ? (
          <p style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>
            Noch keine Domain verbunden — Ihre Website ist ueber die Standard-Adresse erreichbar.
          </p>
        ) : (
          domains.map((d) => {
            const s = STATUS_LABEL[d.status]
            const partner = domains.find((p) => p.id === d.partner_domain_id)
            const statusText = d.status === 'FEHLER'
              ? d.fehler || 'Unbekannter Fehler'
              : STATUS_BESCHREIBUNG[d.status] || ''

            return (
              <div key={d.id} style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {d.status === 'AKTIV'
                      ? <CheckCircle2 style={{ width: '18px', height: '18px', color: '#16A34A' }} />
                      : d.status === 'FEHLER'
                        ? <AlertTriangle style={{ width: '18px', height: '18px', color: '#DC2626' }} />
                        : d.status === 'DNS_ERKANNT'
                          ? <Loader2 className="w-[18px] h-[18px] animate-spin" style={{ color: '#1D4ED8' }} />
                          : <Clock style={{ width: '18px', height: '18px', color: '#B45309' }} />}
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                        {d.hostname}
                        {d.ist_hauptdomain && (
                          <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '999px', background: '#EFF6FF', color: '#1D4ED8', fontWeight: 600, marginLeft: '8px', verticalAlign: 'middle' }}>Hauptdomain</span>
                        )}
                      </p>
                      <p style={{ fontSize: '11px', color: '#9CA3AF' }}>
                        {d.dns_typ === 'A' ? 'Apex (A-Record)' : d.dns_typ === 'CNAME' ? 'Subdomain (CNAME)' : 'Eigene Domain'}
                        {d.letzter_check_am && ` · zuletzt geprueft ${new Date(d.letzter_check_am).toLocaleString('de-DE')}`}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: s.bg, color: s.fg, fontWeight: 600 }}>{s.text}</span>
                    {(d.status === 'WARTET_AUF_DNS' || d.status === 'DNS_ERKANNT' || d.status === 'FEHLER') && (
                      <button
                        onClick={() => recheck(d.id)}
                        disabled={checking === d.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#fff', fontSize: '12px', cursor: 'pointer' }}
                      >
                        {checking === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw style={{ width: '12px', height: '12px' }} />}
                        Erneut pruefen
                      </button>
                    )}
                    {d.ist_hauptdomain && (
                      <button
                        onClick={() => entfernen(d.id)}
                        title="Entfernen"
                        style={{ padding: '6px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#9CA3AF' }}
                      >
                        <Trash2 style={{ width: '13px', height: '13px' }} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status-Beschreibung */}
                {statusText && (
                  <p style={{ fontSize: '12px', color: d.status === 'FEHLER' ? '#DC2626' : d.status === 'AKTIV' ? '#16A34A' : '#6B7280', marginTop: '8px', paddingLeft: '28px' }}>
                    {d.status === 'AKTIV' && <CheckCircle2 style={{ width: '12px', height: '12px', display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />}
                    {statusText}
                  </p>
                )}

                {/* DNS-Anweisungen */}
                {(d.status === 'WARTET_AUF_DNS' || d.status === 'DNS_ERKANNT' || d.status === 'FEHLER') && d.dns_anforderungen && d.dns_anforderungen.length > 0 && (
                  <div style={{ marginTop: '10px', paddingLeft: '28px' }}>
                    {d.dns_anforderungen.map((anf: DnsAnforderung, i: number) => (
                      <div key={i} style={{ fontSize: '12px', color: '#374151', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, minWidth: '60px' }}>{anf.typ}-Record:</span>
                        <code style={{ background: '#F3F4F6', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{anf.name}</code>
                        <span style={{ color: '#9CA3AF' }}>&rarr;</span>
                        <code style={{ background: '#F3F4F6', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{anf.wert}</code>
                        <KopierButton text={anf.wert} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Fallback: dns_ziel anzeigen wenn keine dns_anforderungen */}
                {(d.status === 'WARTET_AUF_DNS' || d.status === 'FEHLER') && (!d.dns_anforderungen || d.dns_anforderungen.length === 0) && d.dns_ziel && (
                  <div style={{ marginTop: '8px', paddingLeft: '28px', fontSize: '12px', color: '#374151' }}>
                    <span style={{ fontWeight: 600 }}>{d.dns_typ === 'A' ? 'A-Record' : 'CNAME-Eintrag'}:</span>{' '}
                    <code style={{ background: '#F3F4F6', padding: '2px 8px', borderRadius: '4px' }}>{d.dns_typ === 'A' ? '@' : d.hostname.split('.')[0]}</code>
                    {' '}&rarr;{' '}
                    <code style={{ background: '#F3F4F6', padding: '2px 8px', borderRadius: '4px' }}>{d.dns_ziel}</code>
                    <KopierButton text={d.dns_ziel} />
                  </div>
                )}

                {/* Hauptdomain-Umschalter (nur bei Partner-Domains) */}
                {!d.ist_hauptdomain && d.partner_domain_id && (
                  <div style={{ marginTop: '8px', paddingLeft: '28px' }}>
                    <button
                      onClick={() => hauptdomainUmschalten(d.id, d.partner_domain_id)}
                      style={{ fontSize: '11px', color: '#1D4ED8', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Als Hauptdomain festlegen
                    </button>
                  </div>
                )}

                {d.status === 'AKTIV' && d.nameserver && d.nameserver.length > 0 && (
                  <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px', paddingLeft: '28px' }}>
                    Nameserver: {d.nameserver.join(', ')}
                  </p>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Polling-Hinweis */}
      {hatWartendeDomains && (
        <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '12px', textAlign: 'center' }}>
          <Loader2 className="w-3 h-3 animate-spin" style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
          Status wird automatisch geprueft
        </p>
      )}
    </div>
  )
}
