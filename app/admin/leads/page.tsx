'use client'

/**
 * Phase 3 (MVP_FINISH_PROMPT §4): Lead-Liste mit Ein-Klick-Generierung,
 * Job-Status (lesbare Fehler) und Mensch-Gate ("Demo geprüft" → demo_bereit).
 */

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Zap, Loader2, ExternalLink, RefreshCw } from 'lucide-react'

interface JobInfo {
  id: string
  status: 'laufend' | 'demo_erstellt' | 'demo_bereit' | 'failed'
  fehler_grund: string | null
  kosten_cent: number
  copy_versuche: number
  demo_id: string | null
  site_id: string | null
  created_at: string
}

interface LeadRow {
  id: string
  name: string | null
  firma: string | null
  telefon: string | null
  branche: string | null
  status: string
  demo_id: string | null
  created_at: string
  business_profile: { id: string; firma: string; branche_key: string; stadt: string } | null
  letzter_job: JobInfo | null
}

const JOB_STYLES: Record<string, { label: string; bg: string; fg: string }> = {
  laufend: { label: 'Läuft…', bg: 'rgba(212,168,40,0.12)', fg: '#a8821e' },
  demo_erstellt: { label: 'Demo erstellt', bg: 'rgba(224,53,75,0.10)', fg: '#E0354B' },
  demo_bereit: { label: 'Demo bereit', bg: '#E4F7EC', fg: '#1e8a70' },
  failed: { label: 'Fehlgeschlagen', bg: 'rgba(179,38,30,0.10)', fg: '#B3261E' },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const laden = useCallback(async () => {
    const res = await fetch('/api/admin/leads')
    if (res.ok) {
      const data = await res.json()
      setLeads(data.leads ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { laden() }, [laden])

  async function generieren(lead: LeadRow) {
    setBusyId(lead.id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/generieren`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok && data?.error) setError(data.error)
      else if (data?.status === 'failed') setError(data.fehlerGrund || 'Generierung fehlgeschlagen.')
    } catch {
      setError('Netzwerkfehler bei der Generierung.')
    } finally {
      setBusyId(null)
      laden()
    }
  }

  async function menschGate(lead: LeadRow, bereit: boolean) {
    if (!lead.demo_id) return
    setBusyId(lead.id)
    try {
      await fetch(`/api/admin/demos/${lead.demo_id}/freigeben`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bereit }),
      })
    } finally {
      setBusyId(null)
      laden()
    }
  }

  return (
    <div className="fade-up">
      <div className="topbar">
        <div>
          <div className="tb-eyebrow">Closer</div>
          <div className="tb-heading">Leads</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
          <button onClick={() => { setLoading(true); laden() }} className="sb-item" style={{ cursor: 'pointer', background: 'transparent' }}>
            <RefreshCw size={14} /> Aktualisieren
          </button>
          <Link href="/admin/leads/neu" className="sb-item" style={{ background: 'var(--za-gold-grad)', color: '#fff', borderRadius: '8px' }}>
            <Plus size={14} /> Neuer Lead
          </Link>
        </div>
      </div>

      {error && (
        <div className="panel" style={{ padding: '14px 18px', marginBottom: '16px', borderColor: 'rgba(179,38,30,0.35)' }}>
          <span style={{ fontSize: '12px', color: '#B3261E' }}>{error}</span>
        </div>
      )}

      <div className="panel" style={{ padding: '8px 4px' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--za-fg-3)', fontSize: '12px' }}>Lade Leads…</div>
        ) : leads.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--za-fg-3)', fontSize: '12px' }}>
            Noch keine Leads — lege den ersten über „Neuer Lead“ an.
          </div>
        ) : (
          <table className="glass-table">
            <thead>
              <tr>
                <th>Firma</th>
                <th>Branche / Stadt</th>
                <th>Job-Status</th>
                <th>Kosten</th>
                <th>Angelegt</th>
                <th>Aktionen</th>
                <th>Mensch-Gate</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const job = lead.letzter_job
                const stil = job ? JOB_STYLES[job.status] : null
                const busy = busyId === lead.id
                return (
                  <tr key={lead.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--za-fg)' }}>{lead.firma || lead.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--za-fg-3)' }}>{lead.telefon || '—'}</div>
                    </td>
                    <td>
                      {lead.business_profile
                        ? `${lead.business_profile.branche_key} · ${lead.business_profile.stadt}`
                        : lead.branche || '—'}
                    </td>
                    <td>
                      {stil ? (
                        <>
                          <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: '999px', fontWeight: 600, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', background: stil.bg, color: stil.fg }}>
                            {stil.label}
                          </span>
                          {job?.status === 'failed' && job.fehler_grund && (
                            <div style={{ fontSize: '11px', color: '#B3261E', marginTop: '6px', maxWidth: '320px', whiteSpace: 'pre-wrap' }}>
                              {job.fehler_grund}
                            </div>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--za-fg-3)' }}>Noch nicht generiert</span>
                      )}
                    </td>
                    <td>{job ? `${(job.kosten_cent / 100).toFixed(2)} €` : '—'}</td>
                    <td>{formatDate(lead.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => generieren(lead)}
                          disabled={busy || !lead.business_profile || job?.status === 'laufend'}
                          title={lead.business_profile ? 'Demo generieren' : 'Kein Geschäftsprofil'}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(224,53,75,0.3)', background: 'rgba(224,53,75,0.08)', color: '#E0354B', fontSize: '11px', fontWeight: 600, cursor: busy ? 'wait' : 'pointer' }}
                        >
                          {busy ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                          {job ? 'Neu generieren' : 'Generieren'}
                        </button>
                        {job?.demo_id && (
                          <Link href="/admin/demos" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--za-fg-2)', textDecoration: 'none' }}>
                            <ExternalLink size={12} /> Demo
                          </Link>
                        )}
                      </div>
                    </td>
                    <td>
                      {job && (job.status === 'demo_erstellt' || job.status === 'demo_bereit') && lead.demo_id ? (
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--za-fg-2)', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={job.status === 'demo_bereit'}
                            disabled={busy}
                            onChange={(e) => menschGate(lead, e.target.checked)}
                          />
                          Demo geprüft
                        </label>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--za-fg-4)' }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
