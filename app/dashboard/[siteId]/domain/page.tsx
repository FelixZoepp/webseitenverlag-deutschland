'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Globe, Loader2, RefreshCw, Trash2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

interface Domain {
  id: string
  hostname: string
  typ: 'vorhanden'
  status: 'BESTELLT' | 'WARTET_AUF_DNS' | 'AKTIV' | 'FEHLER'
  nameserver: string[] | null
  dns_ziel: string | null
  fehler: string | null
  letzter_check_am: string | null
  aktiv_seit: string | null
}

const STATUS_LABEL: Record<Domain['status'], { text: string; bg: string; fg: string }> = {
  AKTIV: { text: 'Aktiv', bg: '#F0FDF4', fg: '#16A34A' },
  WARTET_AUF_DNS: { text: 'Wartet auf DNS', bg: '#FFFBEB', fg: '#B45309' },
  BESTELLT: { text: 'Bestellt', bg: '#EFF6FF', fg: '#1D4ED8' },
  FEHLER: { text: 'Fehler', bg: '#FEF2F2', fg: '#DC2626' },
}

export default function DomainPage() {
  const params = useParams()
  const siteId = params.siteId as string
  const [domains, setDomains] = useState<Domain[]>([])
  const [dnsZiel, setDnsZiel] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [hostname, setHostname] = useState('')
  const [busy, setBusy] = useState(false)
  const [checking, setChecking] = useState<string | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)

  const laden = useCallback(async () => {
    try {
      const r = await fetch(`/api/sites/${siteId}/domains`)
      if (r.ok) {
        const data = await r.json()
        setDomains(data.domains || [])
        setDnsZiel(data.dns_ziel || null)
      }
    } finally {
      setLoading(false)
    }
  }, [siteId])

  useEffect(() => { laden() }, [laden])

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
      await fetch(`/api/sites/${siteId}/domains/${domainId}`, { method: 'POST' })
      await laden()
    } finally {
      setChecking(null)
    }
  }

  const entfernen = async (domainId: string) => {
    if (!confirm('Domain wirklich von dieser Website entfernen?')) return
    await fetch(`/api/sites/${siteId}/domains/${domainId}`, { method: 'DELETE' })
    await laden()
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#9CA3AF' }} /></div>
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>Domain</h1>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
        Eigene Domain mit Ihrer Website verbinden
      </p>

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
            Hinzufügen
          </button>
        </div>
        {dnsZiel && (
          <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '10px' }}>
            Nach dem Hinzufügen: Bei Ihrem Domain-Anbieter einen <strong>CNAME-Eintrag</strong> auf <code style={{ background: '#F3F4F6', padding: '1px 6px', borderRadius: '4px' }}>{dnsZiel}</code> setzen — danach „Erneut prüfen" klicken.
          </p>
        )}
        <div style={{ marginTop: 12, padding: "14px 18px", borderRadius: 12, background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.12)", fontSize: 14, lineHeight: 1.6, color: "var(--ink-soft)" }}>
          <strong>Noch keine Domain?</strong> Registrieren Sie eine bei einem Anbieter Ihrer Wahl, z.{"\u00a0"}B.{" "}
          <a href="https://www.ionos.de" target="_blank" rel="noopener" style={{ color: "var(--blue)" }}>IONOS</a>,{" "}
          <a href="https://www.strato.de" target="_blank" rel="noopener" style={{ color: "var(--blue)" }}>Strato</a>,{" "}
          <a href="https://www.united-domains.de" target="_blank" rel="noopener" style={{ color: "var(--blue)" }}>united-domains</a> oder{" "}
          <a href="https://www.namecheap.com" target="_blank" rel="noopener" style={{ color: "var(--blue)" }}>Namecheap</a>.
          {" "}Danach verbinden Sie sie hier.
        </div>
        {fehler && (
          <p style={{ fontSize: '13px', color: '#DC2626', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle style={{ width: '14px', height: '14px' }} /> {fehler}
          </p>
        )}
      </form>

      {/* Liste */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {domains.length === 0 ? (
          <p style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>
            Noch keine Domain verbunden — Ihre Website ist über die Standard-Adresse erreichbar.
          </p>
        ) : (
          domains.map((d) => {
            const s = STATUS_LABEL[d.status]
            return (
              <div key={d.id} style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {d.status === 'AKTIV'
                      ? <CheckCircle2 style={{ width: '18px', height: '18px', color: '#16A34A' }} />
                      : d.status === 'FEHLER'
                        ? <AlertTriangle style={{ width: '18px', height: '18px', color: '#DC2626' }} />
                        : <Clock style={{ width: '18px', height: '18px', color: '#B45309' }} />}
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{d.hostname}</p>
                      <p style={{ fontSize: '11px', color: '#9CA3AF' }}>
                        Eigene Domain
                        {d.letzter_check_am && ` · zuletzt geprüft ${new Date(d.letzter_check_am).toLocaleString('de-DE')}`}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: s.bg, color: s.fg, fontWeight: 600 }}>{s.text}</span>
                    {d.status === 'WARTET_AUF_DNS' && (
                      <button
                        onClick={() => recheck(d.id)}
                        disabled={checking === d.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#fff', fontSize: '12px', cursor: 'pointer' }}
                      >
                        {checking === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw style={{ width: '12px', height: '12px' }} />}
                        Erneut prüfen
                      </button>
                    )}
                    <button
                      onClick={() => entfernen(d.id)}
                      title="Entfernen"
                      style={{ padding: '6px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#9CA3AF' }}
                    >
                      <Trash2 style={{ width: '13px', height: '13px' }} />
                    </button>
                  </div>
                </div>
                {d.status === 'WARTET_AUF_DNS' && d.dns_ziel && (
                  <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px', paddingLeft: '28px' }}>
                    CNAME-Eintrag für <strong>{d.hostname}</strong> auf <code style={{ background: '#F3F4F6', padding: '1px 6px', borderRadius: '4px' }}>{d.dns_ziel}</code> setzen.
                  </p>
                )}
                {d.status === 'AKTIV' && d.nameserver && d.nameserver.length > 0 && (
                  <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px', paddingLeft: '28px' }}>
                    Nameserver: {d.nameserver.join(', ')}
                  </p>
                )}
                {d.status === 'FEHLER' && d.fehler && (
                  <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '8px', paddingLeft: '28px' }}>{d.fehler}</p>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
