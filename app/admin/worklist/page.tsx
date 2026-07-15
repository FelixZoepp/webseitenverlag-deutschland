'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Check, X, Loader2, MapPin, ArrowRight } from 'lucide-react'

interface Aufgabe {
  id: string
  typ: string
  status: string
  titel: string
  beschreibung: string | null
  customer_id: string | null
  quelle: string | null
  faellig_am: string | null
  created_at: string
}

interface GbpSetup {
  id: string
  customer_id: string
  site_id: string | null
  status: 'OFFEN' | 'IN_ARBEIT' | 'ZUGRIFF_ERTEILT' | 'FERTIG' | 'ABGEBROCHEN'
  daten: Record<string, unknown>
  notizen: string | null
  created_at: string
  customers: { company_name: string | null; contact_email: string | null } | null
}

const TASK_TYP_LABEL: Record<string, string> = {
  MAIL_FEHLGESCHLAGEN: 'Mail fehlgeschlagen',
  DUNNING_ESKALIERT: 'Mahnwesen eskaliert',
  KUENDIGUNG: 'Kündigung',
  PROVISIONING_LUECKE: 'Provisioning-Lücke',
  SONSTIGES: 'Sonstiges',
}

const GBP_FLOW: { status: GbpSetup['status']; label: string }[] = [
  { status: 'OFFEN', label: 'Offen' },
  { status: 'IN_ARBEIT', label: 'In Arbeit' },
  { status: 'ZUGRIFF_ERTEILT', label: 'Zugriff erteilt' },
  { status: 'FERTIG', label: 'Fertig' },
]

const GBP_NAECHSTER: Partial<Record<GbpSetup['status'], { status: GbpSetup['status']; label: string }>> = {
  OFFEN: { status: 'IN_ARBEIT', label: 'In Arbeit nehmen' },
  IN_ARBEIT: { status: 'ZUGRIFF_ERTEILT', label: 'Zugriff erteilt' },
  ZUGRIFF_ERTEILT: { status: 'FERTIG', label: 'Fertig melden' },
}

function formatDatum(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function WorklistPage() {
  const [tasks, setTasks] = useState<Aufgabe[]>([])
  const [gbp, setGbp] = useState<GbpSetup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const laden = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/worklist')
      const data = await res.json()
      if (res.ok) {
        setTasks(data.tasks || [])
        setGbp(data.gbp || [])
      } else {
        setError(data.error || 'Fehler beim Laden')
      }
    } catch {
      setError('Netzwerkfehler — bitte neu laden.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { laden() }, [laden])

  async function handleTaskStatus(task: Aufgabe, status: 'ERLEDIGT' | 'VERWORFEN') {
    if (busyId) return
    setBusyId(task.id)
    try {
      const res = await fetch(`/api/admin/manual-tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) setTasks((prev) => prev.filter((t) => t.id !== task.id))
    } finally {
      setBusyId(null)
    }
  }

  async function handleGbpStatus(setup: GbpSetup, status: GbpSetup['status']) {
    if (busyId) return
    setBusyId(setup.id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/gbp/${setup.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Status-Update fehlgeschlagen')
        return
      }
      if (status === 'FERTIG' || status === 'ABGEBROCHEN') {
        setGbp((prev) => prev.filter((g) => g.id !== setup.id))
        setTasks((prev) => prev.filter((t) => t.customer_id !== setup.customer_id || !t.titel.includes('Google-Unternehmensprofil')))
      } else {
        setGbp((prev) => prev.map((g) => (g.id === setup.id ? { ...g, status } : g)))
      }
    } catch {
      setError('Netzwerkfehler — bitte erneut versuchen.')
    } finally {
      setBusyId(null)
    }
  }

  const datenZeile = (daten: Record<string, unknown>): string => {
    const teile: string[] = []
    for (const key of ['firma', 'branche', 'adresse', 'ort', 'telefon', 'email', 'website']) {
      const v = daten[key]
      if (typeof v === 'string' && v) teile.push(v)
    }
    return teile.join(' · ')
  }

  return (
    <>
      <div className="topbar fade-up">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span className="tb-eyebrow">Fulfillment</span>
          <span className="tb-heading">Worklist</span>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '12px', color: 'var(--za-fg-3)' }}>
          {tasks.length} offene Aufgaben · {gbp.length} GBP-Einrichtungen
        </span>
      </div>

      {error && (
        <div className="fade-up" style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(220,60,60,0.08)', color: '#b03030', fontSize: '12px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* GBP-Ersteinrichtungen */}
      <div className="panel fade-up" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--za-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin style={{ width: '15px', height: '15px', color: 'var(--za-gold)' }} />
          <span className="panel-title">GBP-Ersteinrichtungen (Upsell #2)</span>
        </div>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--za-fg-4)', fontSize: '13px' }}>Lädt…</div>
        ) : gbp.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--za-fg-4)', fontSize: '13px' }}>
            Keine laufenden GBP-Einrichtungen.
          </div>
        ) : (
          <div>
            {gbp.map((setup) => {
              const busy = busyId === setup.id
              const naechster = GBP_NAECHSTER[setup.status]
              const stufeIndex = GBP_FLOW.findIndex((s) => s.status === setup.status)
              return (
                <div key={setup.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--za-border)', opacity: busy ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--za-fg-1)' }}>
                          {setup.customers?.company_name || 'Unbekannter Kunde'}
                        </span>
                        {setup.customers?.contact_email && (
                          <span style={{ fontSize: '11px', color: 'var(--za-fg-3)' }}>· {setup.customers.contact_email}</span>
                        )}
                        <span style={{ fontSize: '10px', color: 'var(--za-fg-4)' }}>· gekauft am {formatDatum(setup.created_at)}</span>
                      </div>
                      {/* Status-Stufen */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        {GBP_FLOW.map((stufe, i) => (
                          <span key={stufe.status} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                              fontSize: '9px', padding: '2px 8px', borderRadius: '999px', fontWeight: 600,
                              letterSpacing: '0.08em', textTransform: 'uppercase',
                              background: i <= stufeIndex ? 'rgba(46,196,160,0.12)' : 'rgba(0,0,0,0.05)',
                              color: i <= stufeIndex ? '#1e8a70' : 'var(--za-fg-4)',
                            }}>
                              {stufe.label}
                            </span>
                            {i < GBP_FLOW.length - 1 && <ArrowRight style={{ width: '10px', height: '10px', color: 'var(--za-fg-4)' }} />}
                          </span>
                        ))}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--za-fg-3)', lineHeight: 1.5 }}>{datenZeile(setup.daten) || 'Keine Business-Daten hinterlegt.'}</div>
                      {setup.notizen && (
                        <div style={{ fontSize: '11px', color: 'var(--za-fg-4)', marginTop: '3px' }}>Notiz: {setup.notizen}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      {naechster && (
                        <button onClick={() => handleGbpStatus(setup, naechster.status)} disabled={busy}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'rgba(46,196,160,0.12)', border: '1px solid var(--za-border)', borderRadius: '7px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', color: '#1e8a70', fontFamily: 'inherit', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          {busy ? <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} /> : <Check style={{ width: '12px', height: '12px' }} />} {naechster.label}
                        </button>
                      )}
                      <button onClick={() => handleGbpStatus(setup, 'ABGEBROCHEN')} disabled={busy} title="Abbrechen"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: 'rgba(255,255,255,0.65)', border: '1px solid var(--za-border)', borderRadius: '7px', cursor: 'pointer', color: 'var(--za-fg-3)' }}>
                        <X style={{ width: '13px', height: '13px' }} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Manuelle Aufgaben */}
      <div className="panel fade-up" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--za-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle style={{ width: '15px', height: '15px', color: tasks.length > 0 ? '#a8821e' : 'var(--za-fg-4)' }} />
          <span className="panel-title">Manuelle Aufgaben (Zero-Fulfillment-Ausnahmen)</span>
        </div>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--za-fg-4)', fontSize: '13px' }}>Lädt…</div>
        ) : tasks.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--za-fg-4)', fontSize: '13px' }}>
            Keine offenen Aufgaben — die Maschine läuft. ✔
          </div>
        ) : (
          <div>
            {tasks.map((task) => {
              const busy = busyId === task.id
              return (
                <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '14px 20px', borderBottom: '1px solid var(--za-border)', opacity: busy ? 0.6 : 1 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(212,168,40,0.12)', color: '#a8821e', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {TASK_TYP_LABEL[task.typ] || task.typ}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--za-fg-1)' }}>{task.titel}</span>
                    </div>
                    {task.beschreibung && (
                      <div style={{ fontSize: '11px', color: 'var(--za-fg-3)', lineHeight: 1.5 }}>{task.beschreibung}</div>
                    )}
                    <div style={{ fontSize: '10px', color: 'var(--za-fg-4)', marginTop: '4px' }}>
                      {formatDatum(task.created_at)}{task.quelle ? ` · Quelle: ${task.quelle}` : ''}{task.faellig_am ? ` · fällig ${formatDatum(task.faellig_am)}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => handleTaskStatus(task, 'ERLEDIGT')} disabled={busy} title="Als erledigt markieren"
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'rgba(46,196,160,0.12)', border: '1px solid var(--za-border)', borderRadius: '7px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', color: '#1e8a70', fontFamily: 'inherit', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {busy ? <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} /> : <Check style={{ width: '12px', height: '12px' }} />} Erledigt
                    </button>
                    <button onClick={() => handleTaskStatus(task, 'VERWORFEN')} disabled={busy} title="Verwerfen"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: 'rgba(255,255,255,0.65)', border: '1px solid var(--za-border)', borderRadius: '7px', cursor: 'pointer', color: 'var(--za-fg-3)' }}>
                      <X style={{ width: '13px', height: '13px' }} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </>
  )
}
